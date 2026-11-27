import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FocusEvent, type KeyboardEvent, type MouseEvent } from "react";
import { cx } from "../../utils/cx";
import { useId } from "../../utils/useId";
import { useControllable } from "../../utils/useControllable";
import { useEscape, useOutsideClick } from "../../utils/hooks";
import { useTabInk } from "../../utils/tabInk";
import { announce } from "../../utils/copy";
import { flash, restRect } from "../../utils/motion";
import { Icon } from "../../icons/Icon";
import { Button } from "../button/Button";
import { Tooltip } from "../tooltip/Tooltip";

/* Notification Center — 벨 아래 지난 알림 팝오버(2026-11-14 사람의 결정: 벨 아래 팝오버 · 누른 항목 + 모두 읽음 · 새 알림 화면 갱신은 시스템 ·
   탭 전체/안 읽음 · 누르면 관련 화면 · 이전 알림 보기 · 심각도 Tag · 항목 동작 없음). 사이트 ds.js 의 .notify 와 같은 규칙:
   비모달 대화상자, 열면 패널로 포커스 · Esc 는 닫고 벨로 · 바깥 클릭 · Tab 으로 떠나면 닫힘, 읽음 상태는 제품이 items 로 돌려준다 */

export type NotificationSeverity = "critical" | "high" | "medium" | "low" | "info";
export interface NotificationItem {
  /** 하나뿐인 값 — onRead 가 싣는다 */
  id: string;
  title: string;
  /** 대상 · 위치 같은 보조 글 */
  sub?: string;
  /** 보이는 시각 글자('10분 전') — 제품이 정한다 */
  time: string;
  /** time 요소의 datetime */
  datetime?: string;
  /** 있으면 앞에 심각도 Tag */
  severity?: NotificationSeverity;
  /** 관련 화면 — 있으면 항목이 링크, 없으면 누르면 읽음만 되는 버튼 */
  href?: string;
  unread?: boolean;
  /** 날짜 묶음 이름(오늘 · 어제 · 이전) — 같은 이름이 이어지면 한 묶음. 없으면 labels.today */
  group?: string;
}
export const NOTIFY_LABELS = {
  title: "알림", trigger: "알림 {n}건", triggerNone: "알림", unread: "안 읽음", readAllButton: "모두 읽음", tabs: "알림 보기", tabAll: "전체", tabUnread: "안 읽음",
  empty: "알림이 없습니다.", emptyUnread: "안 읽은 알림이 없습니다.", more: "이전 알림 보기", retry: "다시 시도", moreFailed: "알림을 불러오지 못했습니다.",
  loaded: "알림 {n}건을 더 불러왔습니다.", readAll: "모든 알림을 읽음으로 표시했습니다.", fresh: "새 알림: {title}", freshMany: "새 알림 {n}건", today: "오늘",
};
export type NotifyLabels = typeof NOTIFY_LABELS;
const SEV: Record<NotificationSeverity, string> = { critical: "Critical", high: "High", medium: "Medium", low: "Low", info: "Info" };

export interface NotificationCenterProps {
  items: NotificationItem[];
  /** 읽음으로 바뀐 id — 제품이 저장하고 items 의 unread 를 false 로 돌려준다 */
  onRead?: (ids: string[], info: { all: boolean }) => void;
  /** 목록 끝에 '이전 알림 보기' */
  hasMore?: boolean;
  /** 이전 알림을 불러온다 — items 에 덧붙인 뒤 끝나는 Promise. 실패하면 reject(Error 의 message 가 문구). 끝이면 hasMore 를 false 로 */
  onMore?: () => Promise<unknown>;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 링크 항목을 눌렀을 때 — 라우터로 옮기려면 e.preventDefault() 뒤 직접 */
  onNavigate?: (item: NotificationItem, e: MouseEvent<HTMLAnchorElement>) => void;
  /** 벨의 안 읽음 표시(2026-11-18) — 기본 "dot"(점만), "number" 면 숫자(99 초과 99+). 이름 '알림 n건' 은 어느 쪽이든 같다 */
  count?: "dot" | "number";
  labels?: Partial<NotifyLabels>;
  className?: string;
  style?: CSSProperties;
}

function clipRect(el: HTMLElement) { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const c = getComputedStyle(p); if (/auto|scroll|hidden|clip/.test(c.overflowX + c.overflowY)) return p.getBoundingClientRect(); } return { left: 0, right: window.innerWidth }; }
function clipped(el: HTMLElement) { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const c = getComputedStyle(p); if (/auto|scroll|hidden|clip/.test(c.overflowX + c.overflowY)) return true; } return false; }
const n99 = (n: number) => (n > 99 ? "99+" : String(n));

export function NotificationCenter({ items, onRead, hasMore, onMore, open, defaultOpen = false, onOpenChange, onNavigate, labels, count = "dot", className, style }: NotificationCenterProps) {
  const L = { ...NOTIFY_LABELS, ...labels };
  const uid = useId(undefined, "notify");
  const [isOpen, setOpen] = useControllable<boolean>({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const tabBar = useRef<HTMLDivElement>(null);
  useTabInk(tabBar, `${filter}${isOpen}`);   // 고른 탭으로 밑줄이 미끄러진다(2026-11-26)
  const [busy, setBusy] = useState(false);
  const [failMsg, setFailMsg] = useState("");
  const [float, setFloat] = useState<CSSProperties | null>(null);
  const [dx, setDx] = useState(0);
  const [maxW, setMaxW] = useState<number | null>(null);
  const placedOnce = useRef(false);
  const root = useRef<HTMLDivElement>(null), panel = useRef<HTMLElement>(null), bell = useRef<HTMLButtonElement>(null);
  const focusPanel = useRef(false), seen = useRef<Set<string> | null>(null), moreFrom = useRef<Set<string> | null>(null), pendingLoaded = useRef<Set<string> | null>(null);

  const unread = items.filter((it) => it.unread);
  const n = unread.length, name = n ? L.trigger.replace("{n}", String(n)) : L.triggerNone;
  const shown = filter === "unread" ? unread : items;

  const close = (back?: boolean) => { setOpen(false); if (back) bell.current?.focus({ preventScroll: true }); };
  const toggle = () => { if (isOpen) close(); else { focusPanel.current = true; setOpen(true); } };
  useOutsideClick([root], () => close(), isOpen);
  useEscape(() => close(true), isOpen);

  /* 열 때 — 자리를 재고(넘침을 자르는 영역이면 화면 기준 · 화면 왼쪽을 넘으면 밀기) 패널로 포커스 */
  useLayoutEffect(() => {
    const first = !placedOnce.current; placedOnce.current = true;
    if (!isOpen) { setFloat(null); setDx(0); setMaxW(null); return; }
    const p = panel.current, b = bell.current, h = root.current; if (!p || !b || !h) return;
    // 처음부터 열린 패널은 띄우지 않는다 — 띄운 패널은 페이지 스크롤에 닫힌다
    if (clipped(h) && !first) { const r = b.getBoundingClientRect(), w = p.offsetWidth; setFloat({ ["--float-x" as string]: `${Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8))}px`, ["--float-y" as string]: `${r.bottom + 8}px` }); }
    else fit();
    if (focusPanel.current) { focusPanel.current = false; p.focus({ preventScroll: true }); }
  }, [isOpen]);
  /* 띄우지 않는 자리 — 넘침을 자르는 영역(없으면 화면) 안 8px 에 들게 좁히고 민다. 패널은 벨 오른쪽에 맞춰 있어 왼쪽만 넘는다 */
  function fit() {   // 지운 뒤 재고, DOM 과 상태에 같은 값을 둔다(값이 같아 다시 그리지 않아도 DOM 이 맞게)
    const p = panel.current, h = root.current; if (!p || !h) return;
    p.style.maxWidth = ""; p.style.removeProperty("--nf-dx");
    const c = clipRect(h), room = c.right - c.left - 16, mw = p.offsetWidth > room ? room : null;
    if (mw != null) p.style.maxWidth = `${mw}px`;
    const left = restRect(p).left, d = left < c.left + 8 ? c.left + 8 - left : 0;
    if (d) p.style.setProperty("--nf-dx", `${d}px`);
    setMaxW(mw); setDx(d);
  }
  useEffect(() => {
    if (!isOpen || float) return;
    window.addEventListener("resize", fit); return () => window.removeEventListener("resize", fit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, float]);
  /* 화면 기준으로 띄운 패널은 벨을 따라가지 못하므로 바깥 스크롤 · 창 크기 변경에 닫는다 — 본문 스크롤은 그대로 */
  useEffect(() => {
    if (!isOpen || !float) return;
    const onScroll = (e: Event) => { if (e.type === "scroll" && panel.current?.contains(e.target as Node)) return; close(true); };
    window.addEventListener("scroll", onScroll, true); window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll, true); window.removeEventListener("resize", onScroll); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, float]);

  /* 새 알림 · 불러온 알림 — 처음 그린 뒤 들어온 id 를 센다. 이전 알림을 불러오는 중이면 '더 불러옴' 으로, 아니면 새 알림으로 알린다 */
  useEffect(() => {
    const ids = new Set(items.map((it) => it.id));
    if (seen.current && !moreFrom.current) {
      const fresh = items.filter((it) => !seen.current!.has(it.id) && it.unread);
      if (fresh.length) announce(fresh.length === 1 ? L.fresh.replace("{title}", fresh[0].title) : L.freshMany.replace("{n}", String(fresh.length)));
      flash(fresh.map((it) => root.current?.querySelector(`.notify-item[data-id="${CSS.escape(it.id)}"]`)), { announce: false });   // 새 알림이 한 번 흐려지는 면(2026-11-26 — 사이트 DS.notify.add 와 같음)
    }
    seen.current = ids;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const read = (ids: string[], all: boolean) => { if (ids.length) onRead?.(ids, { all }); };
  const pick = (it: NotificationItem) => (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (it.unread) read([it.id], false);
    if (it.href) { onNavigate?.(it, e as MouseEvent<HTMLAnchorElement>); setTimeout(() => close(), 0); }
  };
  const readAll = () => { if (!n) return; read(unread.map((it) => it.id), true); announce(L.readAll); };
  const more = async () => {
    if (!onMore || busy) return;
    setBusy(true); setFailMsg(""); moreFrom.current = new Set(items.map((it) => it.id));
    try {
      await onMore();
      const before = moreFrom.current; moreFrom.current = null; setBusy(false);
      // 덧붙인 항목은 다음 그리기에서 보인다 — 수는 지금 items 가 아니라 다음 items 에서 세야 해서 effect 로 넘긴다
      pendingLoaded.current = before;
    } catch (err) {
      moreFrom.current = null; setBusy(false);
      setFailMsg(err instanceof Error && err.message ? err.message : L.moreFailed);
    }
  };
  useEffect(() => {   // 불러온 뒤 — 몇 건인지 알리고, 끝이라 버튼이 사라졌으면 새 첫 항목으로(포커스가 사라진 버튼에 남지 않게)
    const before = pendingLoaded.current; if (!before) return; pendingLoaded.current = null;
    const added = items.filter((it) => !before.has(it.id));
    seen.current = new Set(items.map((it) => it.id));
    announce(L.loaded.replace("{n}", String(added.length)));
    if (hasMore) return;
    const first = added.find((it) => filter === "all" || it.unread), el = first && root.current?.querySelector<HTMLElement>(`.notify-item[data-id="${CSS.escape(first.id)}"] .notify-link`);
    (el ?? panel.current)?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, busy]);

  const tabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault(); const next = filter === "all" ? "unread" : "all"; const v = e.key === "Home" ? "all" : e.key === "End" ? "unread" : next;
    setFilter(v); root.current?.querySelector<HTMLElement>(`[data-filter="${v}"]`)?.focus();
  };
  const leave = (e: FocusEvent<HTMLDivElement>) => { if (isOpen && e.relatedTarget && !e.currentTarget.contains(e.relatedTarget as Node)) close(); };

  /* 묶음 — 같은 이름이 이어지면 한 묶음 */
  const groups: { label: string; list: NotificationItem[] }[] = [];
  for (const it of shown) { const g = it.group ?? L.today, last = groups[groups.length - 1]; if (last && last.label === g) last.list.push(it); else groups.push({ label: g, list: [it] }); }
  const panelStyle: CSSProperties = { ...(float ?? {}), ...(dx ? { ["--nf-dx" as string]: `${dx}px` } : {}), ...(maxW != null ? { maxWidth: maxW } : {}) };

  return (
    <div ref={root} className={cx("notify", float && "float", className)} style={style} onBlur={leave} data-count={count === "number" ? "number" : undefined}>
      <span className="with-count">
        <Tooltip content={name} position="bottom">
          <Button ref={bell} color="assistive" iconOnly aria-label={name} aria-haspopup="dialog" aria-expanded={isOpen} aria-controls={`${uid}-panel`} onClick={toggle}><Icon name="bell" /></Button>
        </Tooltip>
        {n > 0 && (count === "number" ? <span className="count" aria-hidden="true">{n99(n)}</span> : <span className="count dot" aria-hidden="true" />)}
      </span>
      <section ref={panel} className="notify-panel" id={`${uid}-panel`} role="dialog" aria-labelledby={`${uid}-title`} tabIndex={-1} hidden={!isOpen} style={panelStyle}>
        <div className="notify-head">
          <h2 className="notify-title" id={`${uid}-title`}>{L.title}</h2>
          <Button variant="text" color="assistive" size="sm" className="notify-read-all" aria-disabled={n ? undefined : true} onClick={readAll}>{L.readAllButton}</Button>
        </div>
        <div ref={tabBar} className="tabs sm" role="tablist" aria-label={L.tabs} onKeyDown={tabKey}>
          <button type="button" className={cx("tab", filter === "all" && "on")} role="tab" id={`${uid}-tab-all`} aria-selected={filter === "all"} tabIndex={filter === "all" ? 0 : -1} data-filter="all" onClick={() => setFilter("all")}>{L.tabAll}</button>
          <button type="button" className={cx("tab", filter === "unread" && "on")} role="tab" id={`${uid}-tab-unread`} aria-selected={filter === "unread"} tabIndex={filter === "unread" ? 0 : -1} data-filter="unread" onClick={() => setFilter("unread")}>{L.tabUnread}{n > 0 && <>{" "}<span className="count">{n99(n)}</span></>}</button>
        </div>
        <div className="tab-panel notify-body" role="tabpanel" aria-labelledby={`${uid}-tab-${filter}`} data-static="">
          {groups.map((g, gi) => (
            <section key={`${g.label}-${gi}`} className="notify-group" aria-label={g.label}>
              <h3 className="notify-day">{g.label}</h3>
              <ul className="notify-list">
                {g.list.map((it) => {
                  const inner = (<>
                    <span className="notify-dot" aria-hidden="true" />
                    <span className="notify-main"><span className="notify-text">{it.severity && <span className={cx("tag", "sm", it.severity)}>{SEV[it.severity]}</span>}{it.title}</span>{it.sub && <span className="notify-sub">{it.sub}</span>}</span>
                    <time className="notify-time" dateTime={it.datetime}>{it.time}</time>
                    <span className="sr-only">{it.unread ? `, ${L.unread}` : ""}</span>
                  </>);
                  return (
                    <li key={it.id} className={cx("notify-item", it.unread && "unread")} data-id={it.id}>
                      {it.href ? <a className="notify-link" href={it.href} onClick={pick(it)}>{inner}</a> : <button type="button" className="notify-link" onClick={pick(it)}>{inner}</button>}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          {!shown.length && <p className="notify-empty">{filter === "unread" && items.length ? L.emptyUnread : L.empty}</p>}
          {shown.length > 0 && <p className="notify-empty" hidden>{L.empty}</p>}
          {hasMore && (
            <div className="notify-more">
              {failMsg && <p className="msg" role="status">{failMsg}</p>}
              <Button variant="outline" color="assistive" size="sm" loading={busy} aria-busy={busy || undefined} onClick={more}>{failMsg ? L.retry : L.more}</Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
