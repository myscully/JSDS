import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type HTMLAttributes, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useControllable } from "../../utils/useControllable";
import { mergeRefs } from "../../utils/hooks";
import { Icon } from "../../icons/Icon";
import { LABELS } from "../../labels";
import { formatDate, formatMonth, keyOf, parseDate, parseMonth, type DateUnit } from "./format";
import { resolveZone, todayIn } from "./tz";

export type DateRange = { start: Date; end: Date | null };
/** @deprecated "month" 는 unit="month" 로 바뀌었다 */
export type DatePickerMode = "single" | "range" | "month";
export type CalendarView = "day" | "month" | "year";
export type DatePickerFooterItem = "today" | "reset" | "cancel" | "apply";
export type DateValue = Date | null | DateRange;

/** 달력 · 피커의 문구. 기본은 한국어(LABELS), '오늘'만 locale 의 Intl 표기 */
export interface DatePickerLabels {
  today: string; reset: string; cancel: string; apply: string; openCalendar: string; dialog: string;
  prevMonth: string; nextMonth: string; prevYear: string; nextYear: string; prevYears: string; nextYears: string;
  chooseYear: string; yearGrid: string; backToDays: string; backToMonths: string;
  /** 시각 옵션의 칸 이름 */
  time: string; startTime: string; endTime: string;
}
const BASE_LABELS = { reset: LABELS.reset, cancel: LABELS.cancel, apply: LABELS.apply, openCalendar: LABELS.openCalendar, dialog: LABELS.dateDialog, prevMonth: LABELS.prevMonth, nextMonth: LABELS.nextMonth, prevYear: LABELS.prevYear, nextYear: LABELS.nextYear, prevYears: LABELS.prevYears, nextYears: LABELS.nextYears, chooseYear: LABELS.chooseYear, yearGrid: LABELS.yearGrid, backToDays: LABELS.backToDays, backToMonths: LABELS.backToMonths, time: LABELS.time, startTime: LABELS.startTime, endTime: LABELS.endTime };
/** '오늘' — Intl.RelativeTimeFormat(locale) 로(ko 오늘 · en Today · ja 今日) */
export function todayLabel(locale: string): string {
  try { const s = new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(0, "day"); return s.charAt(0).toUpperCase() + s.slice(1); } catch { return LABELS.today; }
}
export const labelsFor = (locale: string, labels?: Partial<DatePickerLabels>): DatePickerLabels => ({ ...BASE_LABELS, today: todayLabel(locale), ...labels });

const firstOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
/** 달을 옮기며 일은 그 달의 마지막 날로 자른다(1월 31일 → 2월 28일) */
export const addMonths = (d: Date, n: number) => {
  const t = new Date(d.getFullYear(), d.getMonth() + n, 1);
  t.setDate(Math.min(d.getDate(), new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate()));
  return t;
};
export const isRange = (v: DateValue | undefined): v is DateRange => !!v && typeof v === "object" && !(v instanceof Date) && "start" in v;
export const outOf = (d: Date, min?: Date | null, max?: Date | null, unit: DateUnit = "day") => (!!min && keyOf(d, unit) < keyOf(min, unit)) || (!!max && keyOf(d, unit) > keyOf(max, unit));
export const baseView = (unit: DateUnit): CalendarView => (unit === "year" ? "year" : unit === "month" ? "month" : "day");

export interface CalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** 표시할 달 (아무 날짜). 두 달 보기면 왼쪽 달 */
  month: Date;
  onMonthChange?: (month: Date) => void;
  /** single · range. ("month" 는 unit="month" 로 바뀌었다) */
  mode?: DatePickerMode;
  /** 고르는 단위 — day(날짜) · month(월 목록) · year(12년 연도 목록) */
  unit?: DateUnit;
  /** single: Date, range: { start, end } — 달력 날짜(로컬 연 · 월 · 일) */
  value?: DateValue;
  /** 날짜(월 단위는 그 달 1일, 연 단위는 1월 1일)를 골랐을 때 */
  onSelect?: (date: Date) => void;
  min?: Date;
  max?: Date;
  /** 기본: timezone 의 오늘 */
  today?: Date;
  locale?: string;
  /** '오늘'을 정하는 기준 시간대(IANA · UTC). 기본 사용자 환경 */
  timezone?: string;
  /** 0 일요일 시작 · 1 월요일 시작 */
  weekStart?: 0 | 1;
  /** 달력과 하단 사이 — DatePicker 의 시각 칸 */
  extra?: ReactNode;
  /** .cal-foot 내용 */
  footer?: ReactNode;
  /** 달력 이름(aria-label) */
  label?: string;
  /** 기간 · 일 단위의 달 수 — 기본 2 */
  calendars?: 1 | 2;
  view?: CalendarView;
  defaultView?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  /** 팝오버로 쓸 때 — role=dialog + aria-modal, Tab 이 달력 안에서 돈다. 아니면 role=group */
  dialog?: boolean;
  /** 마운트할 때 포커스 칸(선택 · 오늘)으로 포커스 */
  autoFocus?: boolean;
  /** 문구 덮어쓰기 */
  labels?: Partial<DatePickerLabels>;
}

/** 달력. 일 · 월 · 연 뷰, 기간과 미리보기, WAI-ARIA 날짜 격자 키보드(←→ 하루 · ↑↓ 일주일 · PageUp/Down 달 · Home/End). 요일 · 월 · 제목 표기는 Intl(locale) */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
  { month, onMonthChange, mode = "single", unit: unitProp, value, onSelect, min, max, today, locale = "ko-KR", timezone, weekStart = 0, extra, footer, label, calendars, view: viewProp, defaultView, onViewChange, dialog, autoFocus, labels, className, onKeyDown, onPointerOver, onPointerLeave, ...rest },
  ref,
) {
  const unit: DateUnit = unitProp ?? (mode === "month" ? "month" : "day"), rangeMode = mode === "range";
  useEffect(() => { if (mode === "month") console.warn('[ds-react] Calendar mode="month" 는 unit="month" 로 바뀌었습니다 (MIGRATION.md).'); }, [mode]);
  const L = labelsFor(locale, labels);
  const [view, setView] = useControllable<CalendarView>({ value: viewProp, defaultValue: defaultView ?? baseView(unit), onChange: onViewChange });
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [live, setLive] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const wantFocus = useRef(false);
  const todayD = today ? new Date(today.getFullYear(), today.getMonth(), today.getDate()) : todayIn(resolveZone(timezone));
  const shown = firstOf(month);
  const n = rangeMode && unit === "day" && view === "day" ? calendars ?? 2 : 1;
  const fmtTitle = new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" });
  const fmtFull = new Intl.DateTimeFormat(locale, { dateStyle: "full" });
  const y0 = shown.getFullYear() - (shown.getFullYear() % 12);
  const titleOf = (v: CalendarView, m: Date) => (v === "year" ? `${m.getFullYear() - (m.getFullYear() % 12)}–${m.getFullYear() - (m.getFullYear() % 12) + 11}` : v === "month" ? new Intl.DateTimeFormat(locale, { year: "numeric" }).format(m) : fmtTitle.format(m));

  const range = rangeMode && isRange(value) ? value : null;
  const selStart = range ? range.start : value instanceof Date ? value : null;
  const a = range ? formatDate(range.start) : value instanceof Date ? formatDate(value) : null;
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
    if (unit === "month") { setFocusKey(formatMonth(d)); onSelect?.(d); return; }
    onMonthChange?.(d); changeView("day", d);
  };
  const pickYear = (yy: number) => {
    if (outOf(new Date(yy, 0, 1), min, max, "year")) return;
    if (unit === "year") { setFocusKey(String(yy)); onSelect?.(new Date(yy, 0, 1)); return; }
    const m = new Date(yy, shown.getMonth(), 1); onMonthChange?.(m); changeView("month", m);
  };

  /* 키보드로 칸을 옮긴다 — 보이는 달 밖이면 그 달로 넘어간다 */
  const moveTo = (key: string) => {
    if (view === "day") {
      const d = parseDate(key)!, last = addMonths(shown, n - 1);
      if (formatMonth(d) < formatMonth(shown)) go(firstOf(d));
      else if (formatMonth(d) > formatMonth(last)) go(firstOf(addMonths(firstOf(d), -(n - 1))));
      if (range && !range.end) setHover(key);   // 키보드로도 기간을 미리 본다
    } else if (view === "month") { const yy = +key.slice(0, 4); if (yy !== shown.getFullYear()) go(new Date(yy, 0, 1)); }
    else if (+key < y0 || +key > y0 + 11) go(new Date(+key, shown.getMonth(), 1));
    setFocusKey(key);
    wantFocus.current = true;
  };
  const keyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const el = root.current!;
    if (e.key === "Tab" && dialog) {
      const list = Array.from(el.querySelectorAll<HTMLButtonElement>("button, input")).filter((x) => !x.disabled && x.tabIndex >= 0);
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
        className={cx("day", { muted, on, start: (on || k === hv) && k === lo, end: (on || k === hv) && k === hi, "in-range": !!b && mid, preview: !!hv && mid, "preview-end": k === hv, today: isToday })}
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
      <div className="cal-grid" role="grid" aria-label={fmtTitle.format(m)} aria-multiselectable={rangeMode || undefined}>
        <div className="cal-week" role="row">
          {Array.from({ length: 7 }, (_, i) => {
            const wd = new Date(2024, 0, 7 + ((i + weekStart) % 7));   // 2024-01-07 은 일요일
            return <span key={i} className="dow" role="columnheader" aria-label={new Intl.DateTimeFormat(locale, { weekday: "long" }).format(wd)}>{new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(wd)}</span>;
          })}
        </div>
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="cal-week" role="row">{cells.slice(r * 7, r * 7 + 7).map((d) => dayCell(d, m, two))}</div>
        ))}
      </div>
    );
  };
  /* 연 · 월 칸 — 고르는 단위의 칸이면 값(기간은 양끝 .on · 사이 .in-range), 이동용 칸이면 값이 든 달 · 연만.
     보이는 달을 칠하면 고른 적 없는 달이 선택처럼 보였다 */
  const cellGrid = (kind: "months" | "years") => {
    const u: DateUnit = kind === "years" ? "year" : "month", own = unit === u;
    const ca = selStart ? keyOf(selStart, u) : null, cb = own && range && range.end ? keyOf(range.end, u) : null;
    const mark = (k: string) => { const on = k === ca || k === cb, mid = !!cb && !!ca && k > ca && k < cb; return { on, mid }; };
    return (
      <div className={cx("cal-grid", kind)} role="grid" aria-label={kind === "years" ? L.yearGrid : titleOf("month", shown)} aria-multiselectable={(own && rangeMode) || undefined}>
        {Array.from({ length: 4 }, (_, r) => (
          <div key={r} className="cal-week" role="row">
            {Array.from({ length: 3 }, (_, c) => {
              const i = r * 3 + c;
              if (kind === "years") {
                const yy = y0 + i, { on, mid } = mark(String(yy)), off = outOf(new Date(yy, 0, 1), min, max, "year");
                return <button key={yy} type="button" className={cx("cell", { on, "in-range": mid, today: todayD.getFullYear() === yy })} role="gridcell" data-year={yy} tabIndex={-1} aria-disabled={off || undefined} aria-selected={on || mid || undefined} onClick={() => pickYear(yy)}>{yy}</button>;
              }
              const d = new Date(shown.getFullYear(), i, 1), { on, mid } = mark(formatMonth(d)), off = outOf(d, min, max, "month");
              return <button key={i} type="button" className={cx("cell", { on, "in-range": mid, today: formatMonth(todayD) === formatMonth(d) })} role="gridcell" data-ym={formatMonth(d)} aria-label={fmtTitle.format(d)} tabIndex={-1} aria-disabled={off || undefined} aria-selected={on || mid || undefined} onClick={() => pickMonth(d)}>{new Intl.DateTimeFormat(locale, { month: "short" }).format(d)}</button>;
            })}
          </div>
        ))}
      </div>
    );
  };
  /* 제목 버튼은 더 넓은 화면(연)으로 — 연 단위는 연 목록이 가장 넓어 제목이 글자일 뿐이다 */
  const head = (which: "both" | "prev" | "next", title: string) => {
    const navLabel = view === "day" ? [L.prevMonth, L.nextMonth] : view === "month" ? [L.prevYear, L.nextYear] : [L.prevYears, L.nextYears];
    const gap = <span className="cal-nav-gap" />;
    const back = view === "year" ? (unit === "month" ? L.backToMonths : L.backToDays) : L.chooseYear;
    return (
      <div className="cal-head">
        {which === "next" ? gap : <button type="button" className="cal-nav" data-nav="-1" aria-label={navLabel[0]} onClick={() => nav(-1)}><Icon name="chevron-left" size={16} /></button>}
        {unit === "year" && view === "year"
          ? <span className="cal-title">{title}</span>
          : <button type="button" className="cal-title" aria-label={`${title}, ${back}`} onClick={() => changeView(view === "year" ? baseView(unit) : "year")}>{title}</button>}
        {which === "prev" ? gap : <button type="button" className="cal-nav" data-nav="1" aria-label={navLabel[1]} onClick={() => nav(1)}><Icon name="chevron-right" size={16} /></button>}
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
      aria-label={label ?? L.dialog}
      onKeyDown={keyDown}
      onPointerOver={pointerOver}
      onPointerLeave={(e) => { onPointerLeave?.(e); if (hover) setHover(null); }}
      {...rest}
    >
      {body}
      {extra}
      {footer !== undefined && footer !== null && footer !== false && <div className="cal-foot">{footer}</div>}
      <span className="sr-only" aria-live="polite">{live}</span>
    </div>
  );
});
