import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useControllable } from "../../utils/useControllable";
import { useOutsideClick, mergeRefs } from "../../utils/hooks";
import { useId } from "../../utils/useId";
import { Icon } from "../../icons/Icon";
import { Button } from "../button/Button";
import { Field } from "../text-field/TextField";
import { LABELS } from "../../labels";
import type { Size } from "../../types";

export type DateRange = { start: Date; end: Date | null };
export type DatePickerMode = "single" | "range" | "month";
export type CalendarView = "day" | "month" | "year";
export type DatePickerFooterItem = "today" | "reset" | "cancel" | "apply";
export type DateValue = Date | null | DateRange;

const pad = (n: number) => String(n).padStart(2, "0");
/** YYYY-MM-DD (가이드라인 고정 형식) */
export function formatDate(d: Date | null | undefined): string {
  return d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : "";
}
/** YYYY-MM */
export function formatMonth(d: Date | null | undefined): string {
  return d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}` : "";
}
/** "YYYY-MM-DD" · "YYYY.MM.DD" · "YYYYMMDD" 를 로컬 날짜로. 없는 날짜(2026-02-30)는 null.
 *  new Date("YYYY-MM-DD") 는 UTC 로 읽어 음수 시간대에서 하루 앞으로 밀리므로 쓰지 않는다 */
export function parseDate(s: string | null | undefined): Date | null {
  const m = /^(\d{4})[-./]?(\d{1,2})[-./]?(\d{1,2})$/.exec(String(s ?? "").trim());
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return d.getMonth() === +m[2] - 1 && d.getDate() === +m[3] ? d : null;
}
/** "YYYY-MM" 를 그 달 1일로 */
export function parseMonth(s: string | null | undefined): Date | null {
  const m = /^(\d{4})[-./]?(\d{1,2})$/.exec(String(s ?? "").trim());
  return m && +m[2] >= 1 && +m[2] <= 12 ? new Date(+m[1], +m[2] - 1, 1) : null;
}
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const firstOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
/** 달을 옮기며 일은 그 달의 마지막 날로 자른다(1월 31일 → 2월 28일) */
const addMonths = (d: Date, n: number) => {
  const t = new Date(d.getFullYear(), d.getMonth() + n, 1);
  t.setDate(Math.min(d.getDate(), new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate()));
  return t;
};
const isRange = (v: DateValue | undefined): v is DateRange => !!v && typeof v === "object" && !(v instanceof Date) && "start" in v;
type Unit = "day" | "month" | "year";
const keyOf = (d: Date, unit: Unit = "day") => (unit === "year" ? String(d.getFullYear()) : unit === "month" ? formatMonth(d) : formatDate(d));
const outOf = (d: Date, min?: Date, max?: Date, unit: Unit = "day") => (!!min && keyOf(d, unit) < keyOf(min, unit)) || (!!max && keyOf(d, unit) > keyOf(max, unit));

export interface CalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** 표시할 달 (아무 날짜). 두 달 보기면 왼쪽 달 */
  month: Date;
  onMonthChange?: (month: Date) => void;
  mode?: DatePickerMode;
  /** single · month: Date, range: { start, end } */
  value?: DateValue;
  /** 날짜(month 모드는 그 달 1일)를 골랐을 때 */
  onSelect?: (date: Date) => void;
  min?: Date;
  max?: Date;
  /** 기본 new Date() */
  today?: Date;
  locale?: string;
  /** 0 일요일 시작 · 1 월요일 시작 */
  weekStart?: 0 | 1;
  /** .cal-foot 내용 */
  footer?: ReactNode;
  /** 달력 이름(aria-label) */
  label?: string;
  /** 기간을 두 달로 나란히 (range · day 뷰에서만) */
  calendars?: 1 | 2;
  view?: CalendarView;
  defaultView?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  /** 팝오버로 쓸 때 — role=dialog + aria-modal, Tab 이 달력 안에서 돈다. 아니면 role=group */
  dialog?: boolean;
  /** 마운트할 때 포커스 칸(선택 · 오늘)으로 포커스 */
  autoFocus?: boolean;
}

/** 달력. 일 · 월 · 연 뷰, 기간과 미리보기, WAI-ARIA 날짜 격자 키보드(←→ 하루 · ↑↓ 일주일 · PageUp/Down 달 · Home/End). 요일 · 월 표기는 Intl(locale) */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
  { month, onMonthChange, mode = "single", value, onSelect, min, max, today, locale = "ko-KR", weekStart = 0, footer, label = LABELS.dateDialog, calendars = 1, view: viewProp, defaultView, onViewChange, dialog, autoFocus, className, onKeyDown, onPointerOver, onPointerLeave, ...rest },
  ref,
) {
  const [view, setView] = useControllable<CalendarView>({ value: viewProp, defaultValue: defaultView ?? (mode === "month" ? "month" : "day"), onChange: onViewChange });
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [live, setLive] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const wantFocus = useRef(false);
  const todayD = startOfDay(today ?? new Date());
  const shown = firstOf(month);
  const n = calendars === 2 && mode === "range" && view === "day" ? 2 : 1;
  const fmtTitle = new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" });
  const fmtFull = new Intl.DateTimeFormat(locale, { dateStyle: "full" });
  const y0 = shown.getFullYear() - (shown.getFullYear() % 12);
  const titleOf = (v: CalendarView, m: Date) => (v === "year" ? `${m.getFullYear() - (m.getFullYear() % 12)}–${m.getFullYear() - (m.getFullYear() % 12) + 11}` : v === "month" ? new Intl.DateTimeFormat(locale, { year: "numeric" }).format(m) : fmtTitle.format(m));

  const range = mode === "range" && isRange(value) ? value : null;
  const a = range ? formatDate(range.start) : value instanceof Date ? (mode === "month" ? formatMonth(value) : formatDate(value)) : null;
  const b = range && range.end ? formatDate(range.end) : null;
  const hv = range && !b && hover && hover !== a ? hover : null;
  const lo = b ? a : hv && a ? (hv < a ? hv : a) : null;
  const hi = b ? b : hv && a ? (hv < a ? a : hv) : null;

  const go = (m: Date, v: CalendarView = view) => { onMonthChange?.(m); setLive(titleOf(v, m)); };
  /* 연 · 월 화면은 보던 달(연)에서 시작한다. 알림은 바뀐 뒤의 제목으로 */
  const changeView = (v: CalendarView, m: Date = shown) => { setView(v); setFocusKey(v === "month" ? formatMonth(m) : v === "year" ? String(m.getFullYear()) : null); setLive(titleOf(v, m)); };
  const nav = (dir: number) => { setFocusKey(null); go(view === "day" ? new Date(shown.getFullYear(), shown.getMonth() + dir, 1) : new Date(shown.getFullYear() + dir * (view === "month" ? 1 : 12), shown.getMonth(), 1)); };
  const pickMonth = (d: Date) => {
    if (outOf(d, min, max, "month")) return;
    if (mode === "month") { setFocusKey(formatMonth(d)); onSelect?.(d); return; }
    onMonthChange?.(d); changeView("day", d);
  };
  const pickYear = (y: number) => { if (outOf(new Date(y, 0, 1), min, max, "year")) return; const m = new Date(y, shown.getMonth(), 1); onMonthChange?.(m); changeView("month", m); };

  /* 키보드로 칸을 옮긴다 — 보이는 달 밖이면 그 달로 넘어간다 */
  const moveTo = (key: string) => {
    if (view === "day") {
      const d = parseDate(key)!, last = addMonths(shown, n - 1);
      if (formatMonth(d) < formatMonth(shown)) go(firstOf(d));
      else if (formatMonth(d) > formatMonth(last)) go(firstOf(addMonths(firstOf(d), -(n - 1))));
      if (range && !range.end) setHover(key);   // 키보드로도 기간을 미리 본다
    } else if (view === "month") { const y = +key.slice(0, 4); if (y !== shown.getFullYear()) go(new Date(y, 0, 1)); }
    else if (+key < y0 || +key > y0 + 11) go(new Date(+key, shown.getMonth(), 1));
    setFocusKey(key);
    wantFocus.current = true;
  };
  const keyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const el = root.current!;
    if (e.key === "Tab" && dialog) {
      const list = Array.from(el.querySelectorAll<HTMLButtonElement>("button")).filter((x) => !x.disabled && x.tabIndex >= 0);
      const i = list.indexOf(document.activeElement as HTMLButtonElement);
      if (e.shiftKey ? i <= 0 : i === list.length - 1) { e.preventDefault(); list[e.shiftKey ? list.length - 1 : 0]?.focus(); }
      return;
    }
    const cell = (e.target as HTMLElement).closest<HTMLElement>(".day[data-date], .cell");
    if (!cell) return;
    const k = e.key, step = ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: view === "day" ? -7 : -3, ArrowDown: view === "day" ? 7 : 3 } as Record<string, number>)[k];
    let next: string | null = null;
    if (view === "day") {
      const d = parseDate(cell.dataset.date)!, dow = (d.getDay() - weekStart + 7) % 7;
      const t = step ? addDays(d, step) : k === "PageUp" ? addMonths(d, e.shiftKey ? -12 : -1) : k === "PageDown" ? addMonths(d, e.shiftKey ? 12 : 1) : k === "Home" ? addDays(d, -dow) : k === "End" ? addDays(d, 6 - dow) : null;
      next = t && formatDate(t);
    } else if (view === "month") {
      const m = parseMonth(cell.dataset.ym)!;
      const t = step ? new Date(m.getFullYear(), m.getMonth() + step, 1) : k === "PageUp" ? new Date(m.getFullYear() - 1, m.getMonth(), 1) : k === "PageDown" ? new Date(m.getFullYear() + 1, m.getMonth(), 1) : k === "Home" ? new Date(m.getFullYear(), 0, 1) : k === "End" ? new Date(m.getFullYear(), 11, 1) : null;
      next = t && formatMonth(t);
    } else {
      const yy = +cell.dataset.year!, base = yy - (yy % 12);
      const t = step ? yy + step : k === "PageUp" ? yy - 12 : k === "PageDown" ? yy + 12 : k === "Home" ? base : k === "End" ? base + 11 : null;
      next = t === null ? null : String(t);
    }
    if (next === null) return;
    e.preventDefault();
    moveTo(next);
  };
  useEffect(() => {
    if (!wantFocus.current || !focusKey) return;
    wantFocus.current = false;
    root.current?.querySelector<HTMLElement>(`.cal-grid [data-date="${focusKey}"]:not(.muted), .cal-grid [data-ym="${focusKey}"], .cal-grid [data-year="${focusKey}"]`)?.focus();
  });
  useEffect(() => {
    if (autoFocus) root.current?.querySelector<HTMLElement>('.cal-grid [tabindex="0"]')?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* 기간 미리보기 — 시작만 고른 동안 포인터를 올린 날까지 */
  const pointerOver = (e: PointerEvent<HTMLDivElement>) => {
    onPointerOver?.(e);
    const day = (e.target as HTMLElement).closest<HTMLElement>(".day[data-date]");
    const want = range && !range.end && day && day.getAttribute("aria-disabled") !== "true" ? day.dataset.date! : null;
    if (want !== hover) setHover(want);
  };

  /* 칸 하나의 표시 — 다른 달(흐린) 칸에는 기간 띠를 칠하지 않는다 */
  const dayCell = (d: Date, m: Date, two: boolean) => {
    const muted = d.getMonth() !== m.getMonth();
    if (two && muted) return <span key={d.getTime()} className="day blank" role="gridcell" />;
    const k = formatDate(d), on = !muted && (k === a || k === b), mid = !muted && !!lo && !!hi && k > lo && k < hi, isToday = k === formatDate(todayD), off = outOf(d, min, max);
    return (
      <button
        key={d.getTime()}
        type="button"
        className={cx("day", { muted, on, start: on && k === lo, end: on && k === hi, "in-range": !!b && mid, preview: !!hv && mid, "preview-end": k === hv, today: isToday })}
        role="gridcell"
        data-date={k}
        aria-label={fmtFull.format(d)}
        tabIndex={-1}
        aria-disabled={off || undefined}
        aria-selected={on || (!!b && mid) || undefined}
        aria-current={isToday ? "date" : undefined}
        onClick={() => { if (off) return; setFocusKey(k); setHover(null); if (muted) go(firstOf(d)); onSelect?.(d); }}   /* 다른 달(흐린) 날을 고르면 그 달로 */
      >
        {d.getDate()}
      </button>
    );
  };
  const dayGrid = (m: Date, two: boolean) => {
    const off = (m.getDay() - weekStart + 7) % 7, rows = Math.ceil((off + new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate()) / 7);
    const cells = Array.from({ length: rows * 7 }, (_, i) => new Date(m.getFullYear(), m.getMonth(), i - off + 1));
    return (
      <div className="cal-grid" role="grid" aria-label={fmtTitle.format(m)} aria-multiselectable={mode === "range" || undefined}>
        <div className="cal-week" role="row">
          {Array.from({ length: 7 }, (_, i) => {
            const wd = new Date(2024, 0, 7 + ((i + weekStart) % 7));
            return <span key={i} className="dow" role="columnheader" aria-label={new Intl.DateTimeFormat(locale, { weekday: "long" }).format(wd)}>{new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(wd)}</span>;
          })}
        </div>
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="cal-week" role="row">{cells.slice(r * 7, r * 7 + 7).map((d) => dayCell(d, m, two))}</div>
        ))}
      </div>
    );
  };
  const cellGrid = (kind: "months" | "years") => {
    const sel = range ? range.start : value instanceof Date ? value : null;   // 연 · 월 칸의 선택은 고른 값만 — 보이는 달을 칠하면 고른 적 없는 달이 선택처럼 보였다
    return (
      <div className={cx("cal-grid", kind)} role="grid" aria-label={kind === "years" ? LABELS.yearGrid : titleOf("month", shown)}>
        {Array.from({ length: 4 }, (_, r) => (
          <div key={r} className="cal-week" role="row">
            {Array.from({ length: 3 }, (_, c) => {
              const i = r * 3 + c;
              if (kind === "years") {
                const yy = y0 + i, on = !!sel && sel.getFullYear() === yy, off = outOf(new Date(yy, 0, 1), min, max, "year");
                return <button key={yy} type="button" className={cx("cell", { on, today: todayD.getFullYear() === yy })} role="gridcell" data-year={yy} tabIndex={-1} aria-disabled={off || undefined} aria-selected={on || undefined} onClick={() => pickYear(yy)}>{yy}</button>;
              }
              const d = new Date(shown.getFullYear(), i, 1), on = !!sel && formatMonth(sel) === formatMonth(d), off = outOf(d, min, max, "month");
              return <button key={i} type="button" className={cx("cell", { on, today: formatMonth(todayD) === formatMonth(d) })} role="gridcell" data-ym={formatMonth(d)} aria-label={fmtTitle.format(d)} tabIndex={-1} aria-disabled={off || undefined} aria-selected={on || undefined} onClick={() => pickMonth(d)}>{new Intl.DateTimeFormat(locale, { month: "short" }).format(d)}</button>;
            })}
          </div>
        ))}
      </div>
    );
  };
  const head = (which: "both" | "prev" | "next", title: string) => {
    const unit = view === "day" ? [LABELS.prevMonth, LABELS.nextMonth] : view === "month" ? [LABELS.prevYear, LABELS.nextYear] : [LABELS.prevYears, LABELS.nextYears];
    const gap = <span className="cal-nav-gap" />;
    return (
      <div className="cal-head">
        {which === "next" ? gap : <button type="button" className="cal-nav" data-nav="-1" aria-label={unit[0]} onClick={() => nav(-1)}><Icon name="chevron-left" size={16} /></button>}
        <button type="button" className="cal-title" aria-label={`${title}, ${view === "year" ? (mode === "month" ? LABELS.backToMonths : LABELS.backToDays) : LABELS.chooseYear}`} onClick={() => changeView(view === "year" ? (mode === "month" ? "month" : "day") : "year")}>{title}</button>
        {which === "prev" ? gap : <button type="button" className="cal-nav" data-nav="1" aria-label={unit[1]} onClick={() => nav(1)}><Icon name="chevron-right" size={16} /></button>}
      </div>
    );
  };
  let body: ReactNode;
  if (view === "day" && n === 2) {
    body = (
      <div className="cal-months">
        {[0, 1].map((i) => { const m = addMonths(shown, i); return <div key={i} className="cal-month">{head(i ? "next" : "prev", fmtTitle.format(m))}{dayGrid(m, true)}</div>; })}
      </div>
    );
  } else if (view === "day") body = <>{head("both", fmtTitle.format(shown))}{dayGrid(shown, false)}</>;
  else body = <>{head("both", titleOf(view, shown))}{cellGrid(view === "month" ? "months" : "years")}</>;

  /* 키보드 포커스는 격자 안 한 칸만(roving tabindex) — 포커스해 둔 칸 · 선택 · 오늘 · 그 달에서 고를 수 있는 첫 칸 순 */
  useLayoutEffect(() => {
    const el = root.current; if (!el) return;
    const cells = Array.from(el.querySelectorAll<HTMLElement>(".cal-grid .day[data-date]:not(.muted), .cal-grid .cell"));
    const find = (sel: string) => cells.find((c) => c.matches(sel));
    const target = (focusKey && find(`[data-date="${focusKey}"],[data-ym="${focusKey}"],[data-year="${focusKey}"]`)) || find(".on") || find(".today") || find(':not([aria-disabled="true"])') || cells[0];
    el.querySelectorAll<HTMLElement>(".cal-grid .day[data-date], .cal-grid .cell").forEach((c) => { c.tabIndex = c === target ? 0 : -1; });
  });

  return (
    <div
      ref={mergeRefs(root, ref)}
      className={cx("calendar", { two: n === 2 }, className)}
      role={dialog ? "dialog" : "group"}
      aria-modal={dialog || undefined}
      aria-label={label}
      onKeyDown={keyDown}
      onPointerOver={pointerOver}
      onPointerLeave={(e) => { onPointerLeave?.(e); if (hover) setHover(null); }}
      {...rest}
    >
      {body}
      {footer !== undefined && footer !== null && footer !== false && <div className="cal-foot">{footer}</div>}
      <span className="sr-only" aria-live="polite">{live}</span>
    </div>
  );
});

export interface DatePickerMessages {
  /** 형식 오류 — 뒤에 예시가 붙는다 */
  format: string;
  /** min 앞에 날짜가 붙는다 */
  min: string;
  max: string;
  order: string;
}

export interface DatePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  label?: ReactNode;
  /** single: Date · range: { start, end } · month: 그 달 1일 */
  mode?: DatePickerMode;
  value?: DateValue;
  defaultValue?: DateValue;
  onChange?: (value: DateValue) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 값이 없을 때. 입력형은 문자열일 때만 input 에 쓰고, 없으면 형식(YYYY-MM-DD)을 보인다 */
  placeholder?: ReactNode;
  min?: Date;
  max?: Date;
  today?: Date;
  locale?: string;
  /** 기간 프리셋 (range). 예: [{label:"최근 7일", range:()=>[a,b]}]. min/max 밖이면 비활성 */
  presets?: { label: ReactNode; range: () => [Date, Date] }[];
  /** 하단 버튼. 기본 single ["today","apply"] · 그 외 ["apply"]. false 또는 apply 가 없으면 고르는 순간 적용하고 닫는다 */
  footer?: DatePickerFooterItem[] | false;
  /** 기간을 두 달로 나란히 (767px 이하에서는 한 달) */
  calendars?: 1 | 2;
  /** 직접 입력하는 필드(.datepicker.field — Text Field 셸). Enter · 포커스가 떠날 때 검사한다 */
  allowTyping?: boolean;
  /** 입력형 필드 아래 도움말 */
  help?: ReactNode;
  /** true 또는 오류 문구 — 바깥에서 주는 오류. 입력 검사 오류는 컴포넌트가 직접 낸다 */
  error?: boolean | ReactNode;
  /** 입력 검사 문구 덮어쓰기 */
  messages?: Partial<DatePickerMessages>;
  /** 필드 높이 36 / 44 / 52 */
  size?: Size;
  disabled?: boolean;
  /** 입력형에서 값만 보이고 달력을 열지 않는다 */
  readOnly?: boolean;
  required?: boolean;
  /** 입력형 input 의 id */
  inputId?: string;
  /** 필드 버튼 스타일 */
  triggerStyle?: CSSProperties;
  /** 값이 없을 때 플레이스홀더 대신 보일 문구 (예: "최근 24시간" 프리셋 이름). 값을 고르면 값이 보인다 */
  displayText?: ReactNode;
}

const MESSAGES: DatePickerMessages = { format: LABELS.dateFormatError, min: LABELS.dateMinError, max: LABELS.dateMaxError, order: LABELS.dateOrderError };
const textOf = (mode: DatePickerMode, v: DateValue | undefined) => (!v ? "" : isRange(v) ? (v.end ? `${formatDate(v.start)} ~ ${formatDate(v.end)}` : "") : mode === "month" ? formatMonth(v) : formatDate(v));

/** 날짜 · 기간 · 월 선택 필드 + 달력 팝오버 */
export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(function DatePicker(
  { label, mode = "single", value, defaultValue = null, onChange, open, defaultOpen = false, onOpenChange, placeholder, min, max, today, locale, presets, footer, calendars = 1, allowTyping, help, error, messages, size = "md", disabled, readOnly, required, inputId, triggerStyle, displayText, className, style, onKeyDown, ...rest },
  ref,
) {
  const [cur, set] = useControllable<DateValue>({ value, defaultValue, onChange });
  const [isOpen, setOpenState] = useControllable<boolean>({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const todayD = startOfDay(today ?? new Date());
  const startMonth = (v: DateValue, two: boolean) => {
    let base = isRange(v) ? v.start : v instanceof Date ? v : null;
    if (!base) { base = todayD; if (max && base > max) base = max; if (min && base < min) base = min; }
    let m = firstOf(base);
    if (two && max && formatMonth(addMonths(m, 1)) > formatMonth(max)) m = addMonths(m, -1);   // 다음 달이 통째로 max 밖이면 한 달 앞부터
    return m;
  };
  const narrow = () => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(max-width:767px)").matches;
  const [months, setMonths] = useState<1 | 2>(calendars === 2 && !narrow() ? 2 : 1);
  const [month, setMonth] = useState<Date>(() => startMonth(cur, months === 2));
  const [draft, setDraft] = useState<DateValue>(cur);
  const [session, setSession] = useState(0);
  const [text, setText] = useState(textOf(mode, cur));
  const [typeError, setTypeError] = useState<string | null>(null);
  const [view, setView] = useState<CalendarView>(mode === "month" ? "month" : "day");
  const [place, setPlace] = useState<{ up: boolean; top: number; left: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const autoId = useId(inputId);
  const labelId = `${autoId}-label`, btnId = `${autoId}-btn`;
  const msg = { ...MESSAGES, ...messages };
  const items = footer === false ? [] : footer ?? (mode === "single" ? ["today", "apply"] : ["apply"]);
  const instant = !items.includes("apply");
  const committedText = textOf(mode, cur);
  useEffect(() => { setText(committedText); }, [committedText]);

  /* 열릴 때마다(안에서 열든 바깥 open prop 이든) 초안 · 달 · 뷰를 지금 값에 맞춘다 — 바깥에서 open 을 쥐면 예전 값이 보이고 적용하면 그 값으로 되돌렸다 */
  const pending = useRef<DateValue | undefined>(undefined);
  const wasOpen = useRef(false);
  useLayoutEffect(() => {
    if (isOpen && !wasOpen.current) {
      const two = calendars === 2 && !narrow() ? 2 : 1, v = pending.current !== undefined ? pending.current : cur;
      pending.current = undefined;
      setMonths(two); setDraft(v); setMonth(startMonth(v, two === 2)); setView(mode === "month" ? "month" : "day"); setSession((s) => s + 1);
    }
    wasOpen.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
  const setOpen = (o: boolean, restore = false) => {
    if (o && allowTyping && text.trim() !== committedText) pending.current = typed() ?? cur;   // 열기 전에 친 글자를 먼저 반영한다
    setOpenState(o);
    if (!o && restore) trigger.current?.focus();
  };
  useOutsideClick([root], () => setOpen(false), isOpen);
  const commit = (v: DateValue) => { set(v); setTypeError(null); setText(textOf(mode, v)); };
  const done = (v: DateValue) => { commit(v); setOpen(false, true); };

  /* 직접 입력 검사 — 틀리면 값은 그대로 두고 오류 문구. 맞으면 확정한 값을 돌려준다 */
  function typed(): DateValue | undefined {
    const s = text.trim(), parts = !s ? [] : mode === "range" ? s.split(/\s*~\s*/) : [s];
    const ds = parts.map(mode === "month" ? parseMonth : parseDate), unit: Unit = mode === "month" ? "month" : "day";
    let err: string | null = null;
    if ((mode === "range" && parts.length && parts.length !== 2) || ds.some((d) => !d)) err = msg.format + (mode === "month" ? "2026-09" : mode === "range" ? "2026-09-01 ~ 2026-09-07" : "2026-09-07");
    else if (ds[1] && ds[1] < ds[0]!) err = msg.order;
    else if (min && ds.some((d) => keyOf(d!, unit) < keyOf(min, unit))) err = keyOf(min, unit) + msg.min;
    else if (max && ds.some((d) => keyOf(d!, unit) > keyOf(max, unit))) err = keyOf(max, unit) + msg.max;
    if (err) { setTypeError(err); return undefined; }
    const v: DateValue = !ds.length ? null : mode === "range" ? { start: ds[0]!, end: ds[1]! } : ds[0]!;
    if (textOf(mode, v) !== committedText || typeError) commit(v); else setText(committedText);
    if (isOpen) { setDraft(v); setMonth(startMonth(v, months === 2)); setView(mode === "month" ? "month" : "day"); }   // 연 채로 입력해 확정하면 달력 초안도 그 값으로 — 적용이 예전 값으로 되돌리지 않게
    return v;
  }

  const pick = (d: Date) => {
    let next: DateValue;
    if (mode !== "range") next = d;
    else {
      const r = isRange(draft) ? draft : null;
      next = !r || r.end ? { start: d, end: null } : d < r.start ? { start: d, end: r.start } : { start: r.start, end: d };
    }
    setDraft(next);
    if (instant && (!isRange(next) || next.end)) done(next);
  };
  const halfRange = isRange(draft) && !draft.end;
  const foot = (
    <>
      {mode === "range" && presets?.map((p, i) => {
        const [s, e] = p.range();
        return <Button key={`p${i}`} size="sm" variant="text" disabled={outOf(s, min, max) || outOf(e, min, max)} onClick={() => done({ start: s, end: e })}>{p.label}</Button>;
      })}
      {items.includes("today") && mode === "single" && (
        <Button size="sm" variant="text" data-cal="today" disabled={outOf(todayD, min, max)} onClick={() => { setMonth(firstOf(todayD)); setView("day"); setDraft(todayD); if (instant) done(todayD); }}>{LABELS.today}</Button>
      )}
      {items.includes("reset") && <Button size="sm" variant="text" data-cal="reset" onClick={() => { setDraft(null); if (instant) done(null); }}>{LABELS.reset}</Button>}
      {items.includes("cancel") && <Button size="sm" variant="secondary" data-cal="cancel" onClick={() => setOpen(false, true)}>{LABELS.cancel}</Button>}
      {items.includes("apply") && <Button size="sm" data-cal="apply" disabled={halfRange || textOf(mode, draft) === committedText} onClick={() => done(draft)}>{LABELS.apply}</Button>}
    </>
  );
  const hasFoot = (mode === "range" && !!presets?.length) || items.some((k) => k !== "today" || mode === "single");

  /* 아래 자리가 모자라고 위가 더 넓으면 필드 위로(.up). 기준은 필드 상자 — 도움말이 달력을 밀지 않게. 오른쪽으로 넘치면 왼쪽으로 당긴다 */
  useLayoutEffect(() => {
    if (!isOpen) { setPlace(null); return; }
    const el = root.current, cal = el?.querySelector<HTMLElement>(":scope > .calendar"), anchor = el?.querySelector<HTMLElement>(".field-btn, .affix");
    if (!el || !cal || !anchor) return;
    const hr = el.getBoundingClientRect(), r = anchor.getBoundingClientRect(), h = cal.offsetHeight, w = cal.offsetWidth, gap = 4;
    const below = window.innerHeight - r.bottom - gap, above = r.top - gap, up = below < h && above > below, vw = document.documentElement.clientWidth || window.innerWidth;
    setPlace({ up, top: up ? r.top - hr.top - gap - h : r.bottom - hr.top + gap, left: Math.max(8 - hr.left, Math.min(0, vw - 8 - w - hr.left)) });
  }, [isOpen, session, months]);

  const rootKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.key === "Escape" && isOpen) { e.preventDefault(); e.stopPropagation(); setOpen(false, true); }   // 이 피커만 닫고 필드로
  };
  const rootStyle = place ? ({ ...style, "--dp-top": `${place.top}px`, "--dp-left": `${place.left}px` } as CSSProperties) : style;
  const calendar = isOpen && (
    <Calendar
      key={session}
      dialog
      autoFocus
      month={month}
      onMonthChange={setMonth}
      mode={mode}
      value={draft}
      onSelect={pick}
      min={min}
      max={max}
      today={todayD}
      locale={locale}
      calendars={months}
      view={view}
      onViewChange={setView}
      footer={hasFoot ? foot : undefined}
    />
  );
  const icon = <Icon name="calendar" />;
  const err = typeError ?? error;
  const cls = cx("datepicker", isOpen && "open", place?.up && "up", className);

  if (allowTyping) {
    const helpId = `${autoId}-help`;
    return (
      <Field
        {...rest}
        ref={mergeRefs(root, ref)} className={cls} label={label} required={required} help={help} error={err || undefined} size={size} htmlFor={autoId} helpId={helpId} style={rootStyle} onKeyDown={rootKeyDown}
        /* 포커스가 필드(입력칸 · 달력 버튼 · 달력) 밖으로 나갈 때 검사한다 — 입력칸 → 달력 버튼 → 바깥으로 Tab 해도 */
        onBlur={(e) => { rest.onBlur?.(e); if (!readOnly && !disabled && !(e.relatedTarget && root.current?.contains(e.relatedTarget as Node))) typed(); }}
      >
        <div className="affix">
          <input
            id={autoId}
            type="text"
            value={text}
            placeholder={typeof placeholder === "string" ? placeholder : mode === "range" ? "YYYY-MM-DD ~ YYYY-MM-DD" : mode === "month" ? "YYYY-MM" : "YYYY-MM-DD"}
            autoComplete="off"
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={err ? true : undefined}
            aria-describedby={help !== undefined || err ? helpId : undefined}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); typed(); }   // 한글 조합 중 Enter 는 조합 확정이다
              else if (e.key === "ArrowDown" && e.altKey && !readOnly && !disabled) { e.preventDefault(); setOpen(true); }
            }}
          />
          <button ref={trigger} type="button" className="cal-btn" aria-label={LABELS.openCalendar} aria-haspopup="dialog" aria-expanded={isOpen} disabled={disabled || readOnly} onClick={() => setOpen(!isOpen)}>
            {icon}
          </button>
        </div>
        {calendar}
      </Field>
    );
  }
  const shownText = (() => {
    if (!cur || (isRange(cur) && !cur.end)) return displayText ?? null;
    if (isRange(cur)) return <>{formatDate(cur.start)} <span className="sep">~</span> {formatDate(cur.end)}</>;
    return mode === "month" ? formatMonth(cur) : formatDate(cur);
  })();
  return (
    <div ref={mergeRefs(root, ref)} className={cx(cls, size !== "md" && size, { error: Boolean(err) })} style={rootStyle} onKeyDown={rootKeyDown} {...rest}>
      {label !== undefined && <label id={labelId}>{label}{required && <em>*</em>}</label>}
      {/* 버튼 이름이 "시작일 2026-09-07" 이 되게 라벨과 잇는다 */}
      <button ref={trigger} id={btnId} aria-labelledby={label !== undefined ? `${labelId} ${btnId}` : undefined} type="button" className="field-btn" aria-haspopup="dialog" aria-expanded={isOpen} disabled={disabled} onClick={() => setOpen(!isOpen)} style={triggerStyle}>
        {shownText ?? <span className="placeholder">{placeholder ?? LABELS.datePlaceholder}</span>}
        {icon}
      </button>
      {typeof err !== "boolean" && err !== undefined && err !== null ? <span className="help">{err}</span> : help !== undefined && <span className="help">{help}</span>}
      {calendar}
    </div>
  );
});
