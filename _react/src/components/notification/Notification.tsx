import { createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState, type FocusEvent, type HTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { Icon } from "../../icons/Icon";
import type { IconName } from "../../icons/icons.data";
import { Portal } from "../../utils/Portal";
import { ghostOut, ghostPut, ghostTake } from "../../utils/ghost";
import { focusPast, mergeRefs } from "../../utils/hooks";
import { LABELS } from "../../labels";
import type { FeedbackTone } from "../../types";

const TONE_ICON: Record<FeedbackTone, IconName> = { info: "info-circle", success: "circle-check", warning: "alert-triangle", danger: "alert-circle" };

export interface NoticeProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  tone?: FeedbackTone;
  /** 굵은 제목 (b) */
  title?: ReactNode;
  /** 톤 기본 아이콘 대신 */
  icon?: IconName;
  /** 하단 액션 버튼들 */
  actions?: ReactNode;
  /** 있으면 닫기(✕) 버튼 */
  onClose?: () => void;
  closeLabel?: string;
}
/** 페이지 안에 머무는 인라인 알림. danger 는 role=alert. 아이콘은 filled(사람의 결정 2026-11-13 — Notice · Banner) */
export const Notice = forwardRef<HTMLDivElement, NoticeProps>(function Notice({ tone, title, icon, actions, onClose, closeLabel = LABELS.close, className, children, role, ...rest }, ref) {
  const ic = icon ?? TONE_ICON[tone ?? "info"];
  return (
    <div ref={ref} className={cx("notice", tone, className)} role={role ?? (tone === "danger" ? "alert" : "status")} {...rest}>
      <span className="ico"><Icon name={ic} size={20} filled /></span>
      <div>
        {title !== undefined && <b>{title}</b>}
        {children}
        {actions !== undefined && <div className="actions">{actions}</div>}
      </div>
      {onClose && (
        <button type="button" className="close" aria-label={closeLabel} onClick={(e) => closeAway(e.currentTarget.closest(".notice"), onClose)}>
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  );
});

/* 닫은 Notice · Banner 는 제품이 지운다 — 지워졌으면 사본이 그 자리에서 흐려진다(2026-11-26, 사이트 ds.js dismiss 와 같은 모습) */
function closeAway(el: Element | null, close: () => void) {
  const snap = ghostTake([el]);
  close();
  requestAnimationFrame(() => { if (!el?.isConnected) ghostPut(snap); });
}

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  tone?: "success" | "danger";
  icon?: IconName;
  /** 하나의 액션 (실행 취소 · 다시 시도) */
  action?: { label: ReactNode; onClick: (e: MouseEvent<HTMLButtonElement>) => void };
  /** 있으면 닫기(✕) 버튼. 닫을 때까지 남는 Toast 에 — ToastProvider 가 오류에 넣는다 */
  onClose?: (e: MouseEvent<HTMLButtonElement>) => void;
  closeLabel?: string;
}
/** 짧은 결과 알림 한 개 (표시용). 앱에서는 ToastProvider + useToast */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast({ tone = "success", icon, action, onClose, closeLabel = LABELS.close, className, children, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("toast", tone === "danger" && "danger", className)} {...rest}>
      <span className="ico"><Icon name={icon ?? TONE_ICON[tone]} size={20} /></span>
      {children}
      {action && (
        <button type="button" className="action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
      {onClose && (
        <button type="button" className="close" aria-label={closeLabel} onClick={onClose}>
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  );
});

export interface ToastStackProps extends HTMLAttributes<HTMLDivElement> {
  /** 화면 우측 하단 고정 */
  fixed?: boolean;
}
export const ToastStack = forwardRef<HTMLDivElement, ToastStackProps>(function ToastStack({ fixed, className, ...rest }, ref) {
  return <div ref={ref} className={cx("toast-stack", fixed && "fixed", className)} aria-live="polite" {...rest} />;
});

export interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  tone?: "warning" | "danger";
  /** 없으면 톤에 맞는 아이콘(정보 · 경고 · 위험), null 이면 아이콘 없음 */
  icon?: IconName | null;
  /** 우측 버튼 */
  action?: ReactNode;
  /** 있으면 닫기(✕) 버튼. 다시 띄울지는 제품이 정한다 */
  onClose?: () => void;
  closeLabel?: string;
}
let bannerWarned = false;
/** 시스템 전체 공지 (헤더 위 전체 폭) */
export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner({ tone, icon, action, onClose, closeLabel = LABELS.close, className, children, role, ...rest }, ref) {
  /* Banner 안 버튼은 끄지 않는다(사람의 결정 2026-11-12) — 제품 색 면 위의 비활성 글자는 대비 1.32 라 보이지 않는다. 할 수 없으면 버튼을 빼고 문구로 알린다. loading 은 괜찮다 */
  const self = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && !bannerWarned && self.current?.querySelector('.btn[disabled],.btn[aria-disabled="true"]') && (bannerWarned = true))
      console.warn("[ds-react] Banner 안 버튼은 끄지 않습니다 — 할 수 없는 동작이면 버튼을 빼고 문구로 알립니다(Notification › Banner).");
  });
  return (
    <div ref={mergeRefs(ref, self)} className={cx("banner", tone, className)} role={role ?? (tone ? "alert" : "status")} {...rest}>
      {icon !== null && <Icon name={icon ?? TONE_ICON[tone ?? "info"]} size={18} filled />}
      {children}
      {action}
      {onClose && (
        <button type="button" className="close" aria-label={closeLabel} onClick={(e) => { const b = e.currentTarget.closest<HTMLElement>(".banner"); if (e.detail === 0) focusPast(b); closeAway(b, onClose); }}>
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  );
});

/* ---------- ToastProvider / useToast ---------- */
export interface ToastOptions {
  message: ReactNode;
  tone?: "success" | "danger";
  icon?: IconName;
  action?: { label: ReactNode; onClick: () => void };
  /** ms. 0 이면 닫을 때까지. 기본은 4초, 동작(action)이 있으면 10초. 오류는 값과 무관하게 닫을 때까지 */
  duration?: number;
}
interface ToastItem extends ToastOptions { id: number; ms: number }
const ACTION_MS = 10000;
interface ToastClock { left: number; at: number; handle: number }
interface ToastApi {
  show: (opts: ToastOptions | ReactNode) => number;
  dismiss: (id: number) => void;
  clear: () => void;
}
const ToastCtx = createContext<ToastApi | null>(null);

export interface ToastProviderProps {
  /** 동작이 없는 Toast 의 자동 소멸 ms */
  duration?: number;
  /** 동시에 보이는 최대 개수. 넘치면 자동으로 사라지는 것부터 지운다 — 닫을 때까지 남는 오류는 밀리지 않아 넘을 수 있다 */
  max?: number;
  container?: Element | null;
  children?: ReactNode;
}
/** 앱 루트에 한 번. 우측 하단 고정 스택(.toast-stack.fixed)을 Portal 로 렌더 */
export function ToastProvider({ duration = 4000, max = 3, container, children }: ToastProviderProps) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);
  const list = useRef<ToastItem[]>([]);
  const clocks = useRef(new Map<number, ToastClock>());
  const stack = useRef<HTMLDivElement>(null);
  const hover = useRef(false), inside = useRef(false), from = useRef<HTMLElement | null>(null);
  const commit = (next: ToastItem[]) => { list.current = next; setItems(next); };
  const stop = (id: number) => { const c = clocks.current.get(id); if (c) window.clearTimeout(c.handle); clocks.current.delete(id); };
  const dismiss = useCallback((id: number) => {
    stop(id);
    const i = list.current.findIndex((t) => t.id === id);
    if (i >= 0) ghostOut([stack.current?.children[i]]);   // 나갈 때 흐려지는 사본(사이트 Toast 와 같은 --motion-fast)
    commit(list.current.filter((t) => t.id !== id));
  }, []);
  /* 묶음에 마우스가 있거나 포커스가 든 동안 남은 시간을 멈춘다 — 다른 Toast 가 사라지면 보고 있던 Toast 가 밀리므로 전체를 */
  const sync = useCallback(() => {
    const held = hover.current || inside.current;
    clocks.current.forEach((c, id) => {
      if (held && c.handle) { window.clearTimeout(c.handle); c.handle = 0; c.left = Math.max(1, c.left - (Date.now() - c.at)); }
      else if (!held && !c.handle) { c.at = Date.now(); c.handle = window.setTimeout(() => dismiss(id), c.left); }
    });
  }, [dismiss]);
  const arm = useCallback((id: number, ms: number) => { stop(id); clocks.current.set(id, { left: ms, at: 0, handle: 0 }); sync(); }, [sync]);
  const show = useCallback((opts: ToastOptions | ReactNode) => {
    const o: ToastOptions = typeof opts === "object" && opts !== null && "message" in (opts as object) ? (opts as ToastOptions) : { message: opts as ReactNode };
    const ms = o.tone === "danger" ? 0 : o.duration ?? (o.action ? ACTION_MS : duration);
    /* 같은 알림은 쌓지 않고 시간을 다시 잰다. 동작이 있으면 실행 취소 대상이 달라 합치지 않는다 */
    if (!o.action && typeof o.message === "string") {
      const same = list.current.find((t) => !t.action && t.message === o.message && (t.tone === "danger") === (o.tone === "danger"));
      if (same) { if (ms > 0) arm(same.id, ms); return same.id; }
    }
    const id = ++seq.current;
    const next = [...list.current];
    while (next.length >= max) {
      const i = next.findIndex((t) => t.ms > 0);
      if (i < 0) break;
      stop(next[i].id); next.splice(i, 1);
    }
    next.push({ ...o, id, ms });
    commit(next);
    if (ms > 0) arm(id, ms);
    return id;
  }, [duration, max, arm]);
  const clear = useCallback(() => { commit([]); clocks.current.forEach((c) => window.clearTimeout(c.handle)); clocks.current.clear(); }, []);
  useEffect(() => () => clocks.current.forEach((c) => window.clearTimeout(c.handle)), []);
  useEffect(() => { inside.current = !!stack.current?.contains(document.activeElement); sync(); }, [items, sync]);   // 포커스가 든 Toast 가 지워지면 blur 가 나지 않는다
  const api = useMemo(() => ({ show, dismiss, clear }), [show, dismiss, clear]);
  /* 키보드로 닫으면 다음 Toast, 없으면 들어오기 전 자리로. 마우스로 닫을 때는 옮기지 않는다 — 옮기면 다음 Toast 의 시간이 멈춘 채 남는다 */
  const close = (id: number, e: MouseEvent<HTMLButtonElement>) => {
    if (e.detail === 0) {
      const box = e.currentTarget.closest<HTMLElement>(".toast");
      const to = Array.from(stack.current?.querySelectorAll<HTMLElement>("button") ?? []).find((b) => !box?.contains(b)) ?? from.current;
      if (to?.isConnected) to.focus({ preventScroll: true });
    }
    dismiss(id);
  };
  return (
    <ToastCtx.Provider value={api}>
      {children}
      <Portal container={container}>
        <ToastStack
          ref={stack}
          fixed
          onMouseEnter={() => { hover.current = true; sync(); }}
          onMouseLeave={() => { hover.current = false; sync(); }}
          onFocus={(e: FocusEvent<HTMLDivElement>) => { if (!e.currentTarget.contains(e.relatedTarget)) from.current = e.relatedTarget as HTMLElement | null; inside.current = true; sync(); }}
          onBlur={(e: FocusEvent<HTMLDivElement>) => { if (!e.currentTarget.contains(e.relatedTarget)) { inside.current = false; sync(); } }}
        >
          {items.map((t) => (
            <Toast key={t.id} tone={t.tone} icon={t.icon}
              action={t.action ? { label: t.action.label, onClick: (e) => { t.action!.onClick(); close(t.id, e); } } : undefined}
              onClose={t.ms > 0 ? undefined : (e) => close(t.id, e)}>
              {t.message}
            </Toast>
          ))}
        </ToastStack>
      </Portal>
    </ToastCtx.Provider>
  );
}
/** Toast 를 띄울 수 있으면 — Provider 없이도 그려지는 컴포넌트(Switch)가 쓴다 */
export function useOptionalToast(): ToastApi | null {
  return useContext(ToastCtx);
}
export function useToast(): ToastApi {
  const c = useContext(ToastCtx);
  if (!c) throw new Error("[ds-react] useToast 는 <ToastProvider> 안에서 사용하세요.");
  return c;
}
