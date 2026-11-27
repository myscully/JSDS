import { forwardRef, useEffect, useRef, useState, type HTMLAttributes, type KeyboardEvent, type RefObject } from "react";
import { cx } from "../../utils/cx";
import { useId } from "../../utils/useId";
import { cho } from "../../utils/typeahead";
import { Icon } from "../../icons/Icon";
import type { IconName } from "../../icons/icons.data";
import { Popup } from "../popup/Popup";
import { Kbd, isMacPlatform } from "../kbd/Kbd";

export interface CommandItem {
  /** ds:command 의 value · onCommand 의 첫 인자 */
  value: string;
  label: string;
  icon?: IconName;
  /** 이름 말고 찾을 말(다른 이름 · 영문) — 띄어쓰기 · 대소문자 무시 */
  keywords?: string;
  /** 끝에 보일 단축키 — Kbd keys 와 같음 */
  shortcut?: string[];
}
export interface CommandGroup { label: string; items: CommandItem[] }

const norm = (s?: string) => (s || "").toLowerCase().replace(/\s+/g, "");
/** 사이트 ds.js cmdkFilter 와 같은 규칙 — 이름 + 찾을 말의 부분 일치, 자음만이면 초성 */
export function matchCommand(item: CommandItem, query: string): boolean {
  const q = norm(query);
  if (!q) return true;
  const hay = item.label + " " + (item.keywords || "");
  return norm(hay).includes(q) || (/^[ㄱ-ㅎ]+$/.test(q) && norm(cho(hay)).includes(q));
}

interface InnerProps {
  idBase: string;
  groups: CommandGroup[];
  defaultQuery?: string;
  placeholder: string;
  label: string;
  listLabel: string;
  emptyText: string;
  onRun?: (item: CommandItem) => void;
  inputRef?: RefObject<HTMLInputElement | null>;
}
function CmdkInner({ idBase, groups, defaultQuery = "", placeholder, label, listLabel, emptyText, onRun, inputRef }: InnerProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [status, setStatus] = useState("");
  const list = useRef<HTMLDivElement>(null);
  let n = 0;
  const rows = groups.map((g, gi) => ({ g, gi, items: g.items.map((it) => ({ it, id: `${idBase}-o${++n}`, hit: matchCommand(it, query) })) }));
  const visible = rows.flatMap((r) => r.items.filter((x) => x.hit));
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = visible.find((x) => x.id === activeId) ?? visible[0] ?? null;
  /* 활성 항목이 보이게 — 목록만 스크롤(scrollIntoView 는 페이지까지 움직임) */
  const reveal = (id: string) => {
    const l = list.current, el = l?.querySelector<HTMLElement>(`[id="${id}"]`);
    if (!l || !el || typeof el.getBoundingClientRect !== "function") return;
    const lr = l.getBoundingClientRect(), r = el.getBoundingClientRect();
    if (r.top < lr.top) l.scrollTop -= lr.top - r.top + 8;
    else if (r.bottom > lr.bottom) l.scrollTop += r.bottom - lr.bottom + 8;
  };
  const go = (x: (typeof visible)[number] | undefined) => { if (!x) return; setActiveId(x.id); requestAnimationFrame(() => reveal(x.id)); };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    const i = active ? visible.indexOf(active) : -1, last = visible.length - 1;
    if (e.key === "ArrowDown") { e.preventDefault(); go(visible[i >= last ? 0 : i + 1]); }
    else if (e.key === "ArrowUp") { e.preventDefault(); go(visible[i <= 0 ? last : i - 1]); }
    else if (e.key === "Home") { e.preventDefault(); go(visible[0]); }
    else if (e.key === "End") { e.preventDefault(); go(visible[last]); }
    else if (e.key === "Enter") { e.preventDefault(); if (active) onRun?.(active.it); }
  };
  return (
    <>
      <div className="cmdk-search">
        <Icon name="search" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={`${idBase}-list`}
          aria-autocomplete="list"
          aria-activedescendant={active?.id}
          placeholder={placeholder}
          aria-label={label}
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => {
            const q = e.target.value, hits = groups.flatMap((g) => g.items).filter((it) => matchCommand(it, q)).length;
            setQuery(q); setActiveId(null); setStatus(hits ? `결과 ${hits}개` : "맞는 명령이 없습니다");
            if (list.current) list.current.scrollTop = 0;
          }}
          onKeyDown={onKeyDown}
        />
      </div>
      <div ref={list} className="cmdk-list" id={`${idBase}-list`} role="listbox" aria-label={listLabel} tabIndex={-1}>
        {rows.map(({ g, gi, items }) => (
          <div key={gi} className="cmdk-group" role="group" aria-labelledby={`${idBase}-g${gi}`} hidden={!items.some((x) => x.hit) || undefined}>
            <div className="cmdk-label" id={`${idBase}-g${gi}`}>{g.label}</div>
            {items.map(({ it, id, hit }) => (
              <div
                key={id}
                className="cmdk-item"
                id={id}
                role="option"
                aria-selected={active?.id === id}
                data-value={it.value}
                data-keywords={it.keywords}
                hidden={!hit || undefined}
                onMouseDown={(e) => e.preventDefault()}
                onPointerMove={() => { if (activeId !== id) setActiveId(id); }}
                onClick={() => onRun?.(it)}
              >
                {it.icon && <Icon name={it.icon} />}
                <span className="cmdk-name">{it.label}</span>
                {it.shortcut && <Kbd keys={it.shortcut} size="sm" menu />}
              </div>
            ))}
          </div>
        ))}
      </div>
      <p className="cmdk-empty" hidden={visible.length > 0 || undefined}>{emptyText}</p>
      <div className="cmdk-foot" aria-hidden="true">
        <span><Kbd size="sm">↑</Kbd><Kbd size="sm">↓</Kbd>이동</span>
        <span><Kbd size="sm">Enter</Kbd>실행</span>
        <span><Kbd size="sm">Esc</Kbd>닫기</span>
      </div>
      <span className="sr-only" role="status">{status}</span>
    </>
  );
}

interface CommonProps {
  groups: CommandGroup[];
  /** 검색칸 placeholder */
  placeholder?: string;
  /** 검색칸 접근 이름 */
  label?: string;
  /** 숨긴 제목(대화상자 이름) */
  title?: string;
  /** 맞는 것이 없을 때 */
  emptyText?: string;
}
const DEFAULTS = { placeholder: "화면 · 명령 검색", label: "명령 검색", title: "명령 팔레트", emptyText: "맞는 명령이 없습니다. 다른 낱말로 찾아보세요." };

export interface CommandPaletteSurfaceProps extends CommonProps, Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** 처음 검색어 — 문서 예제의 빈 결과처럼 정적으로 보일 때 */
  defaultQuery?: string;
  onCommand?: (value: string, item: CommandItem) => void;
}
/** 팔레트 표면만(배경 · 포털 · 단축키 없음) — 문서 예제나 커스텀 오버레이에 */
export const CommandPaletteSurface = forwardRef<HTMLDivElement, CommandPaletteSurfaceProps>(function CommandPaletteSurface(
  { groups, placeholder = DEFAULTS.placeholder, label = DEFAULTS.label, title = DEFAULTS.title, emptyText = DEFAULTS.emptyText, defaultQuery, onCommand, id, className, ...rest },
  ref,
) {
  const base = useId(id, "cmdk");
  return (
    <div ref={ref} className={cx("popup", "cmdk", className)} id={base} role="dialog" aria-modal="true" aria-labelledby={`${base}-t`} {...rest}>
      <h3 className="sr-only" id={`${base}-t`}>{title}</h3>
      <CmdkInner idBase={base} groups={groups} defaultQuery={defaultQuery} placeholder={placeholder} label={label} listLabel="명령" emptyText={emptyText} onRun={(it) => onCommand?.(it.value, it)} />
    </div>
  );
});

export interface CommandPaletteProps extends CommonProps {
  open: boolean;
  /** 단축키로 열 때 */
  onOpen?: () => void;
  onClose: () => void;
  /** 실행 — 팔레트를 먼저 닫은 뒤 부른다 */
  onCommand?: (value: string, item: CommandItem) => void;
  /** Mod K(맥 ⌘K · 그 밖 Ctrl K)로 열고 닫기 (기본 true). 화면에 하나만 켠다 */
  hotkey?: boolean;
  id?: string;
  className?: string;
}
/** 명령 팔레트 — Popup 위에 검색칸(combobox) + 목록(listbox). 닫기(X) 없음 — Esc · 배경 · 단축키로 닫는다 */
export function CommandPalette({ open, onOpen, onClose, onCommand, hotkey = true, groups, placeholder = DEFAULTS.placeholder, label = DEFAULTS.label, title = DEFAULTS.title, emptyText = DEFAULTS.emptyText, id, className }: CommandPaletteProps) {
  const base = useId(id, "cmdk");
  const input = useRef<HTMLInputElement>(null);
  const state = useRef({ open, onOpen, onClose });
  state.current = { open, onOpen, onClose };
  useEffect(() => {
    if (!hotkey) return;
    const mac = isMacPlatform();
    const h = (e: globalThis.KeyboardEvent) => {
      if (e.key.toLowerCase() !== "k" || e.altKey || e.shiftKey || e.isComposing || !(mac ? e.metaKey : e.ctrlKey)) return;
      const s = state.current;
      if (s.open) { e.preventDefault(); s.onClose(); return; }
      /* 다른 대화상자 · 모달 패널이 열린 동안은 열지 않는다(사이트와 같음) */
      const other = [...document.querySelectorAll('[aria-modal="true"]')].some((m) => m.getClientRects().length > 0 && !m.closest(".ds-ghost"));
      if (other || !s.onOpen) return;
      e.preventDefault(); s.onOpen();
    };
    document.addEventListener("keydown", h, true);
    return () => document.removeEventListener("keydown", h, true);
  }, [hotkey]);
  return (
    <Popup open={open} onClose={onClose} className={cx("cmdk", className)} id={base} titleId={`${base}-t`} confirmDiscard={false} initialFocus={input}>
      <h3 className="sr-only" id={`${base}-t`}>{title}</h3>
      <CmdkInner idBase={base} groups={groups} placeholder={placeholder} label={label} listLabel="명령" emptyText={emptyText} inputRef={input} onRun={(it) => { onClose(); onCommand?.(it.value, it); }} />
    </Popup>
  );
}
