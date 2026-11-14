import { forwardRef, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useOutsideClick, mergeRefs } from "../../utils/hooks";
import { useId } from "../../utils/useId";
import { Icon } from "../../icons/Icon";
import { Button } from "../button/Button";
import { TextField } from "../text-field/TextField";
import { FormValidationContext } from "../text-field/validation";
import { LABELS } from "../../labels";
import { TimePicker } from "../time-picker/TimePicker";
import type { Size } from "../../types";
import { Calendar, addMonths, baseView, isRange, labelsFor, outOf, type CalendarView, type DatePickerFooterItem, type DatePickerLabels, type DatePickerMode, type DateRange, type DateValue } from "./Calendar";
import { checkText, clockOf, formatMonth, spanDays, isValidDate, pasteText, placeholderOf, reformat, showOf, stepText, unitStart, type DatePickerMessages, type DateSideValidity, type DateUnit, type DateValidity, type TextUnit } from "./format";
import { calendarDateOf, clockDateOf, instantOf, resolveZone, todayIn } from "./tz";

export { Calendar, type CalendarProps, type CalendarView, type DatePickerFooterItem, type DatePickerLabels, type DatePickerMode, type DateRange, type DateValue } from "./Calendar";
export { formatDate, formatMonth, parseDate, parseMonth, parseYear, type DatePickerMessages, type DateSideValidity, type DateUnit, type DateValidity } from "./format";

/** onChange 의 둘째 인자 — 필드 글자와 상태. 값이 Invalid Date 면 validity 가 incomplete · invalid 다 */
export interface DateChangeInfo {
  text: string;
  validity: DateValidity;
  /** DateRangePicker 에서만 — 시작 · 끝 각각의 상태(어느 쪽이 틀렸는지). 순서(order)는 validity 에만 */
  sides?: { start: DateSideValidity; end: DateSideValidity };
}
/** 기간 값 — 각 끝은 Date(그 시간대의 0시) · null · Invalid Date */
export type DateRangeValue = { start: Date | null; end: Date | null };

interface PickerBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  label?: ReactNode;
  /** 고르는 단위 — 입력 형식(YYYY. MM. DD · YYYY. MM · YYYY) · 달력 첫 화면이 바뀐다 */
  unit?: DateUnit;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 입력 자리 표시. 기본은 형식(YYYY. MM. DD) */
  placeholder?: string;
  /** 기간의 최대 길이(양끝 포함 일수, 일 단위 기간만). 시작을 고르면 밖의 날짜를 막고 긴 프리셋을 끈다. 키보드 입력은 받아서 validity "long" 으로 알린다 */
  maxDays?: number;
  /** 시각까지 입력(일 단위만) — YYYY. MM. DD HH:mm, 24시간제. "seconds" 면 초까지. 달력 아래 시각 칸이 생기고 적용 버튼은 늘 있다. 값 Date 는 그 시간대의 그 시각이다 */
  time?: boolean | "seconds";
  /** 달력에서 이보다 앞은 고를 수 없다. 키보드 입력은 막지 않고 validity "min" 으로 알린다. time 에서 max 가 0시면 그 하루 끝까지 */
  min?: Date;
  max?: Date;
  /** 오늘(데모 고정용). 기본: timezone 의 오늘 */
  today?: Date;
  /** 달력 표기 언어(Intl). 기본 ko-KR. 입력 형식은 바뀌지 않는다 */
  locale?: string;
  /** 기준 시간대 — IANA 이름 · "UTC". 기본 사용자 환경. 값 Date 는 이 시간대의 0시다(time 이면 그 시각) */
  timezone?: string;
  /** 하단 버튼. 기본 단일 ["today","apply"] · 기간 ["apply"]. false 또는 apply 가 없으면 고르는 순간 적용하고 닫는다. time 이면 apply 는 늘 있다 */
  footer?: DatePickerFooterItem[] | false;
  /** 필드 아래 도움말 */
  help?: ReactNode;
  /** true 또는 오류 문구 — 바깥에서 주는 오류. 입력 검사 오류는 컴포넌트가 직접 낸다 */
  error?: boolean | ReactNode;
  /** 입력 검사 문구 덮어쓰기 */
  messages?: Partial<DatePickerMessages>;
  /** 버튼 · 달력 문구 덮어쓰기('오늘' 기본은 locale 의 Intl 표기) */
  labels?: Partial<DatePickerLabels>;
  /** 필드 높이 32 / 40 / 48 — Text Field · Button 과 같다 */
  size?: Size;
  disabled?: boolean;
  /** 값만 보이고 달력을 열지 않는다 */
  readOnly?: boolean;
  required?: boolean;
  /** input 의 id */
  inputId?: string;
  /** 처음 입력 글자 — 값보다 앞선다(덜 친 글자 · 없는 날짜를 그대로 보일 때) */
  defaultText?: string;
}
export interface DatePickerProps extends PickerBaseProps {
  /** Date(timezone 의 0시) · null(빈 값) · Invalid Date(덜 친 · 없는 날짜) */
  value?: Date | null;
  defaultValue?: Date | null;
  /** 확정할 때(Enter · 포커스가 떠날 때 · ↑↓ · 달력). 범위 밖이면 값은 그 날짜이고 info.validity 가 min · max */
  onChange?: (value: Date | null, info: DateChangeInfo) => void;
  /** @deprecated 기간은 DateRangePicker, 월은 unit="month" (MIGRATION.md) */
  mode?: DatePickerMode;
  /** @deprecated 늘 입력형이다 */
  allowTyping?: boolean;
  /** @deprecated 버튼형 필드가 없어졌다 */
  triggerStyle?: CSSProperties;
  /** @deprecated 버튼형 필드가 없어졌다 */
  displayText?: ReactNode;
  /** @deprecated DateRangePicker 의 prop */
  presets?: DateRangePickerProps["presets"];
  /** @deprecated DateRangePicker 의 prop */
  calendars?: 1 | 2;
}
export interface DateRangePickerProps extends PickerBaseProps {
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  /** 확정할 때. 끝이 시작보다 앞이면 info.validity 가 order */
  onChange?: (value: DateRangeValue, info: DateChangeInfo) => void;
  /** 기간 프리셋. 예: [{label:"최근 7일", range:()=>[a,b]}]. 누르는 즉시 확정. min/max 밖이면 비활성 */
  presets?: { label: ReactNode; range: () => [Date, Date] }[];
  /** 달 수 — 기본 2(일 단위). 767px 이하에서는 1 */
  calendars?: 1 | 2;
}

/* ---------------- 공통 엔진 — 단일 · 기간이 같이 쓴다 ---------------- */
type Pair = { a: Date | null; b: Date | null };   // 바깥 순간(Invalid Date 가능)
interface PickerProps extends PickerBaseProps {
  range: boolean;
  pair?: Pair;
  defaultPair: Pair;
  onPair?: (p: Pair, info: DateChangeInfo) => void;
  presets?: DateRangePickerProps["presets"];
  calendars?: 1 | 2;
}
const MESSAGES: DatePickerMessages = { incomplete: LABELS.dateIncompleteError, invalid: LABELS.dateInvalidError, min: LABELS.dateMinError, max: LABELS.dateMaxError, order: LABELS.dateOrderError, subject: LABELS.dateSubject, startSubject: LABELS.dateStartSubject, endSubject: LABELS.dateEndSubject, long: LABELS.dateLongError, invalidTime: LABELS.dateTimeInvalidError, orderTime: LABELS.dateTimeOrderError, timeSubject: LABELS.dateTimeSubject, startTimeSubject: LABELS.dateStartTimeSubject, endTimeSubject: LABELS.dateEndTimeSubject };
const firstOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const keyOfPair = (p: Pair) => [p.a, p.b].map((d) => (d == null ? "" : isNaN(d.getTime()) ? "NaN" : String(d.getTime()))).join("|");
const narrow = () => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(max-width:767px)").matches;

const Picker = forwardRef<HTMLDivElement, PickerProps>(function Picker(
  { range, pair, defaultPair, onPair, label, unit = "day", time, maxDays: maxDaysProp, open, defaultOpen = false, onOpenChange, placeholder, min, max, today, locale = "ko-KR", timezone, presets, footer, calendars, help, error, messages, labels, size = "md", disabled, readOnly, required, inputId, defaultText, className, style, onKeyDown, onBlur, "aria-label": ariaLabel, ...rest },
  ref,
) {
  const tz = resolveZone(timezone);
  const L = labelsFor(locale, labels);
  const msg: DatePickerMessages = { ...MESSAGES, ...messages };
  const controlled = pair !== undefined;
  const [inner, setInner] = useState<Pair>(defaultPair);
  const cur = controlled ? pair! : inner;
  /* 달력은 달력 날짜(로컬 연 · 월 · 일)로 일한다 — 바깥 Date(순간)는 기준 시간대에서 무슨 날인지로 바꾼다 */
  const tu: TextUnit = time && unit === "day" ? (time === "seconds" ? "second" : "minute") : unit, isTime = tu === "minute" || tu === "second";
  useEffect(() => { if (time && unit !== "day") console.warn(`[ds-react] DatePicker time 은 일 단위에만 씁니다 — unit="${unit}" 에서는 무시합니다.`); }, [time, unit]);
  const cd = (d: Date | null | undefined) => (isValidDate(d) ? (isTime ? clockDateOf(d, tz) : calendarDateOf(d, tz)) : null);
  const todayD = today ? calendarDateOf(today, tz) : todayIn(tz);
  const minD = cd(min);
  let maxD = cd(max);
  if (isTime && maxD && !maxD.getHours() && !maxD.getMinutes() && !maxD.getSeconds()) maxD = new Date(maxD.getFullYear(), maxD.getMonth(), maxD.getDate(), 23, 59, 59);   // 사이트 data-max 의 날짜만 적은 값과 같다 — 그 하루 전체
  const textOfDays = (a: Date | null, b: Date | null) => (!a ? "" : range ? (b ? `${showOf(a, tu)} ~ ${showOf(b, tu)}` : "") : showOf(a, tu));
  const maxDays = range && unit === "day" && maxDaysProp && maxDaysProp > 0 ? maxDaysProp : undefined;
  useEffect(() => { if (maxDaysProp && (!range || unit !== "day")) console.warn("[ds-react] maxDays 는 일 단위 기간(DateRangePicker)에만 씁니다 — 무시합니다."); }, [maxDaysProp, range, unit]);
  const check = (t: string) => checkText(t, { unit: tu, range, min: minD, max: maxD, maxDays, messages: msg });
  /* 달력 아래 시각 칸 — 친 글자는 적용할 때 날짜와 합쳐 필드와 같은 검사를 지난다(사람의 결정 2026-11-10 — 처음 값 00:00 · 기간 끝 23:59) */
  type Clock = { a: string; b: string };
  const clockDefaults = (): Clock => (tu === "second" ? { a: "00:00:00", b: "23:59:59" } : { a: "00:00", b: "23:59" });
  const [clock, setClock] = useState<Clock>(clockDefaults);
  const clockFrom = (v: DateValue): Clock => {
    const c = clockDefaults(), s = isRange(v) ? v.start : v instanceof Date ? v : null, e = isRange(v) ? v.end : null;
    if (s) c.a = clockOf(s, tu);
    if (e) c.b = clockOf(e, tu);
    return c;
  };
  const withClock = (a: Date | null, b: Date | null, c: Clock) => (!a ? "" : range ? (b ? `${showOf(a, "day")} ${c.a} ~ ${showOf(b, "day")} ${c.b}` : "") : `${showOf(a, "day")} ${c.a}`);

  const [text, setText] = useState(() => (defaultText !== undefined ? pasteText(defaultText, tu, range) : textOfDays(cd(cur.a), cd(cur.b))));
  const committed = useRef(text);   // 마지막으로 검사 · 확정한 글자 — 이것과 다를 때만 onChange
  const [validity, setValidity] = useState<DateValidity>(() => check(text).validity);
  const [typeError, setTypeError] = useState<string | null>(() => check(text).message ?? null);
  const [isOpenState, setOpenState] = useState(defaultOpen);
  const isOpen = open ?? isOpenState;
  const setOpenValue = (o: boolean) => { if (open === undefined) setOpenState(o); onOpenChange?.(o); };
  const [months, setMonths] = useState<1 | 2>(1);
  const [month, setMonth] = useState<Date>(() => firstOf(todayD));
  const [draft, setDraft] = useState<DateValue>(null);
  const [session, setSession] = useState(0);
  const [view, setView] = useState<CalendarView>(baseView(unit));
  const [place, setPlace] = useState<{ up: boolean; top: number; left: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const caret = useRef<number | null>(null);
  const id = useId(inputId);
  const footItems = footer === false ? [] : footer ?? (range ? ["apply"] : ["today", "apply"]);
  const items = isTime && !footItems.includes("apply") ? [...footItems, "apply" as const] : footItems;   // 시각을 고를 틈이 있어야 한다 — 날짜를 누르는 순간 닫히면 시각을 못 고친다
  const instant = !items.includes("apply");
  const wantMonths = (): 1 | 2 => (range && unit === "day" && (calendars ?? 2) === 2 && !narrow() ? 2 : 1);

  /* 바깥 값이 바뀌면 글자를 따라간다 — 유효하지 않은 값(Invalid Date)이면 친 글자를 그대로 둔다 */
  const curKey = keyOfPair(cur), lastKey = useRef(curKey);
  useLayoutEffect(() => {   // 열림 동기화(아래 layout effect)보다 먼저 — 값과 open 을 함께 바꾸면 새 값의 달을 연다
    if (lastKey.current === curKey) return;   // 처음 그릴 때는 건너뛴다 — defaultText 를 빈 값으로 덮었다
    lastKey.current = curKey;
    if ([cur.a, cur.b].some((d) => d && isNaN(d.getTime()))) return;
    const t = textOfDays(cd(cur.a), cd(cur.b));
    if (t === committed.current || (range && cur.a && !cur.b)) return;
    committed.current = t; setText(t);
    const r = check(t); setValidity(r.validity); setTypeError(r.message ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curKey]);
  useLayoutEffect(() => {   // 다시 끊은 글자에서 커서를 같은 숫자 뒤에
    if (caret.current !== null && input.current && document.activeElement === input.current) input.current.setSelectionRange(caret.current, caret.current);
    caret.current = null;
  });

  const emit = (p: Pair, info: DateChangeInfo) => { if (!controlled) setInner(p); onPair?.(p, info); };
  const draftOf = (t: string): DateValue => { const r = check(t); return r.start ? (range ? { start: r.start, end: r.end } : r.start) : null; };
  const startMonth = (v: DateValue, two: boolean) => {
    let base = isRange(v) ? v.start : v instanceof Date ? v : null;
    if (!base) { base = todayD; if (maxD && base > maxD) base = maxD; if (minD && base < minD) base = minD; }   // 값이 범위 밖이면 그 값의 달을 연다 — 고른 것이 보이게
    let m = firstOf(base);
    if (two && maxD && formatMonth(addMonths(m, 1)) > formatMonth(maxD)) m = addMonths(m, -1);   // 다음 달이 통째로 max 밖이면 한 달 앞부터
    return m;
  };
  /* 검사 · 확정 — Enter · 포커스가 필드를 떠날 때 · ↑↓. 값이 늘 유효하지는 않다(사람의 요구 2026-11-09):
     미완성 · 없는 날짜는 Invalid Date, 범위 밖 · 순서는 그 날짜를 넘기고 validity 와 오류 문구로 알린다. 확정한 글자를 돌려준다 */
  function commitText(raw: string): string {
    const r = check(raw), bad = r.validity === "incomplete" || r.validity === "invalid";
    const shown = r.start ? textOfDays(r.start, r.end) : raw.trim();
    const p: Pair = bad ? { a: new Date(NaN), b: range ? new Date(NaN) : null } : { a: r.start && instantOf(r.start, tz, isTime), b: r.end && instantOf(r.end, tz, isTime) };
    setText(shown); setValidity(r.validity); setTypeError(r.message ?? null);
    const changed = shown !== committed.current;
    committed.current = shown;
    if (changed) emit(p, { text: shown, validity: r.validity, ...(r.sides && { sides: r.sides }) });
    if (isOpen) { const v = draftOf(shown); setDraft(v); if (isTime && v) setClock(clockFrom(v)); setMonth(startMonth(v, months === 2)); setView(baseView(unit)); }   // 연 채로 입력해 확정하면 달력도 그 값으로 — 적용이 예전 값으로 되돌리지 않게
    return shown;
  }
  /* 달력에서 확정 — 달력은 범위 밖을 고를 수 없으니 늘 유효하다 */
  const commitDays = (v: DateValue, c: Clock = clock) => {
    const a = isRange(v) ? v.start : v instanceof Date ? v : null, b = isRange(v) ? v.end : null;
    if (isTime && a) { commitText(withClock(a, b, c)); return; }   // 달력은 날짜만 막는다 — 시각의 범위 · 순서는 필드 검사가 잰다
    const t = textOfDays(a, b);
    setText(t); setValidity(a ? "valid" : "empty"); setTypeError(null);
    if (t !== committed.current) { committed.current = t; emit({ a: a && instantOf(a, tz), b: b && instantOf(b, tz) }, { text: t, validity: a ? "valid" : "empty", ...(range && { sides: { start: a ? "valid" : "empty", end: b ? "valid" : "empty" } }) }); }
  };

  /* 열릴 때마다(안에서 열든 바깥 open prop 이든) 초안 · 달 · 뷰를 지금 글자에 맞춘다 */
  const pending = useRef<string | null>(null);
  const wasOpen = useRef(false);
  useLayoutEffect(() => {
    if (isOpen && !wasOpen.current) {
      const two = wantMonths(), v = draftOf(pending.current ?? committed.current);
      pending.current = null;
      setMonths(two); setDraft(v); if (isTime) setClock(clockFrom(v)); setMonth(startMonth(v, two === 2)); setView(baseView(unit)); setSession((s) => s + 1);
    }
    wasOpen.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
  const setOpen = (o: boolean, restore = false) => {
    if (o) pending.current = text.trim() !== committed.current ? commitText(text) : committed.current;   // 열기 전에 친 글자를 먼저 반영한다
    setOpenValue(o);
    if (!o && restore) trigger.current?.focus();
  };
  useOutsideClick([root], () => setOpen(false), isOpen);
  const done = (v: DateValue, c?: Clock) => { commitDays(v, c); setOpen(false, true); };

  const pick = (d: Date) => {
    let next: DateValue;
    if (!range) next = d;
    else {
      const r = isRange(draft) ? draft : null;
      next = !r || r.end ? { start: d, end: null } : d < r.start ? { start: d, end: r.start } : { start: r.start, end: d };
    }
    setDraft(next);
    if (instant && (!isRange(next) || next.end)) done(next);
  };
  const halfRange = isRange(draft) && !draft.end;
  const draftA = isRange(draft) ? draft.start : (draft as Date | null), draftB = isRange(draft) ? draft.end : null;
  const draftText = isTime && draftA ? withClock(draftA, draftB, clock) : textOfDays(draftA, draftB);
  const canApply = !halfRange && draftText !== committed.current;
  /* 시작만 고른 동안 — 상한 밖의 날짜는 끝으로 고를 수 없다 */
  const shift = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const half = maxDays && draftA && !draftB ? draftA : null;
  const spanMin = half ? [minD, shift(half, 1 - maxDays!)].filter(Boolean).sort((x, y) => y!.getTime() - x!.getTime())[0] : minD;
  const spanMax = half ? [maxD, shift(half, maxDays! - 1)].filter(Boolean).sort((x, y) => x!.getTime() - y!.getTime())[0] : maxD;
  const foot = (
    <>
      {range && unit === "day" && presets?.map((p, i) => {
        const [s, e] = p.range().map((x) => calendarDateOf(x, tz));
        return <Button variant="text" key={`p${i}`} size="sm" data-preset={i} disabled={outOf(s, minD, maxD) || outOf(e, minD, maxD) || (!!maxDays && spanDays(s, e) > maxDays)} onClick={() => done({ start: s, end: e }, clockDefaults())}>{p.label}</Button>;
      })}
      {items.includes("today") && !range && (
        <Button variant="text" size="sm" data-cal="today" disabled={outOf(todayD, minD, maxD, unit)} onClick={() => { const t = unitStart(todayD, unit); setMonth(firstOf(t)); setView(baseView(unit)); setDraft(t); if (instant) done(t); }}>{L.today}</Button>
      )}
      {items.includes("reset") && <Button variant="text" size="sm" data-cal="reset" onClick={() => { setDraft(null); setClock(clockDefaults()); if (instant) done(null); }}>{L.reset}</Button>}
      {items.includes("cancel") && <Button variant="outline" color="assistive" size="sm" data-cal="cancel" onClick={() => setOpen(false, true)}>{L.cancel}</Button>}
      {items.includes("apply") && <Button size="sm" data-cal="apply" disabled={!canApply} onClick={() => done(draft)}>{L.apply}</Button>}
    </>
  );
  const hasFoot = (range && unit === "day" && !!presets?.length) || items.some((k) => k !== "today" || !range);

  /* 아래 자리가 모자라고 위가 더 넓으면 필드 위로(.up). 기준은 필드 상자 — 도움말이 달력을 밀지 않게. 오른쪽으로 넘치면 왼쪽으로 당긴다 */
  useLayoutEffect(() => {
    if (!isOpen) { setPlace(null); return; }
    const el = root.current, cal = el?.querySelector<HTMLElement>(":scope > .calendar"), anchor = el?.querySelector<HTMLElement>(".affix");
    if (!el || !cal || !anchor) return;
    const hr = el.getBoundingClientRect(), r = anchor.getBoundingClientRect(), h = cal.offsetHeight, w = cal.offsetWidth, gap = 4;
    const below = window.innerHeight - r.bottom - gap, above = r.top - gap, up = below < h && above > below, vw = document.documentElement.clientWidth || window.innerWidth;
    setPlace({ up, top: up ? r.top - hr.top - gap - h : r.bottom - hr.top + gap, left: Math.max(8 - hr.left, Math.min(0, vw - 8 - w - hr.left)) });
  }, [isOpen, session, months]);

  const rootKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.key === "Escape" && isOpen && !(e.target as HTMLElement).closest(".timepicker.open")) { e.preventDefault(); e.stopPropagation(); setOpen(false, true); }   // 이 피커만 닫고 필드로 — 시각 열 목록이 열려 있으면 그것이 먼저(useEscape)
  };
  const inputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); commitText(text); }   // 한글 조합 중 Enter 는 조합 확정이다
    else if (e.key === "ArrowDown" && e.altKey) { if (!readOnly && !disabled) { e.preventDefault(); setOpen(true); } }
    else if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !readOnly && !disabled) {
      /* ↑↓ — 커서 조각 ±1 하고 바로 확정. min/max 는 보지 않는다(사람의 요구 2026-11-09 — 키보드로는 범위 밖 값도 넣는다) */
      e.preventDefault();
      const r = stepText(text, e.currentTarget.selectionStart ?? text.length, e.key === "ArrowUp" ? 1 : -1, tu, range, todayD);
      caret.current = r.caret; commitText(r.text);
    }
  };
  /* 시각 칸 = Time Picker sm(사람의 결정 2026-11-13 — 입력칸만이던 것). 치는 글자는 바로 달력에, Enter 는 적용, 범위 검사는 적용할 때 필드가 한다 */
  const clockField = (side: keyof Clock, name: string) => (
    <TimePicker
      key={side}
      id={`${id}-time-${side}`}
      size="sm"
      label={name}
      value={clock[side]}
      seconds={tu === "second"}
      validate={false}
      labels={{ open: L.timeOpen }}
      wrapperProps={{ "data-dp-side": side } as never}
      onTextChange={(t) => setClock((c) => (c[side] === t ? c : { ...c, [side]: t }))}
      onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); if (canApply) done(draft); } }}
    />
  );
  const rootStyle = place ? ({ ...style, "--dp-top": `${place.top}px`, "--dp-left": `${place.left}px` } as CSSProperties) : style;
  const calendar = isOpen && (
    <Calendar
      key={session}
      dialog
      autoFocus
      month={month}
      onMonthChange={setMonth}
      mode={range ? "range" : "single"}
      unit={unit}
      value={draft}
      onSelect={pick}
      min={spanMin ?? undefined}
      max={spanMax ?? undefined}
      today={todayD}
      locale={locale}
      calendars={months}
      view={view}
      onViewChange={setView}
      labels={labels}
      extra={isTime && view === "day" ? <div className="cal-time">{range ? [clockField("a", L.startTime), clockField("b", L.endTime)] : clockField("a", L.time)}</div> : undefined}
      footer={hasFoot ? foot : undefined}
    />
  );
  const err = typeError ?? error;
  return (
    /* 달력 입력은 스스로 잰다 — Form 은 .error 만 센다 */
    <FormValidationContext.Provider value={null}>
    <TextField
      ref={input}
      id={id}
      label={label}
      required={required}
      help={help}
      error={err || undefined}
      size={size}
      value={text}
      placeholder={placeholder ?? placeholderOf(tu, range)}
      inputMode="numeric"
      autoComplete="off"
      disabled={disabled}
      readOnly={readOnly}
      aria-label={ariaLabel}
      onChange={(e) => {
        const ne = e.nativeEvent as InputEvent;
        if (ne.isComposing) { setText(e.target.value); return; }
        const r = reformat(e.target.value, text, e.target.selectionStart ?? e.target.value.length, ne.inputType, tu, range);
        caret.current = r.caret; setText(r.text);
      }}
      onKeyDown={inputKeyDown}
      trailing={
        <button ref={trigger} type="button" className="cal-btn" aria-label={L.openCalendar} aria-haspopup="dialog" aria-expanded={isOpen} disabled={disabled || readOnly} onClick={() => setOpen(!isOpen)}>
          <Icon name="calendar" />
        </button>
      }
      wrapperClassName={cx("datepicker", isOpen && "open", place?.up && "up", className)}
      wrapperStyle={rootStyle}
      wrapperProps={{
        ...rest,
        ref: mergeRefs(root, ref),
        "data-range": range ? "" : undefined,
        "data-time": isTime ? (time === "seconds" ? "seconds" : "") : undefined,
        "data-validity": validity === "valid" || validity === "empty" ? undefined : validity,
        onKeyDown: rootKeyDown,
        /* 포커스가 필드(입력칸 · 달력 버튼 · 달력) 밖으로 나갈 때, 확정 뒤 바뀐 글자가 있으면 검사한다 */
        onBlur: (e) => { onBlur?.(e); if (!readOnly && !disabled && !(e.relatedTarget && root.current?.contains(e.relatedTarget as Node)) && text.trim() !== committed.current) commitText(text); },
      } as HTMLAttributes<HTMLDivElement>}
      after={calendar}
    />
    </FormValidationContext.Provider>
  );
});

/** 날짜 하나 — TextField 에 YYYY. MM. DD 를 입력하거나 달력 하나에서 고른다. 단위(unit) · locale · timezone · min/max */
export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(function DatePicker(
  { value, defaultValue = null, onChange, mode, allowTyping, triggerStyle, displayText, presets, calendars, unit, ...rest },
  ref,
) {
  useEffect(() => {
    if (mode === "range") console.warn('[ds-react] DatePicker mode="range" 는 DateRangePicker 로 바뀌었습니다 (MIGRATION.md).');
    if (mode === "month") console.warn('[ds-react] DatePicker mode="month" 는 unit="month" 로 바뀌었습니다 (MIGRATION.md).');
    if (allowTyping !== undefined) console.warn("[ds-react] DatePicker allowTyping 은 없어졌습니다 — 늘 입력형입니다 (MIGRATION.md).");
    if (triggerStyle !== undefined || displayText !== undefined) console.warn("[ds-react] DatePicker triggerStyle · displayText 는 없어졌습니다 — 버튼형 필드가 없습니다 (MIGRATION.md).");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (mode === "range") {   // 옛 기간 모드 — 값 모양({ start, end })이 같아 그대로 넘긴다
    const v = value as unknown as DateRange | null | undefined, dv = defaultValue as unknown as DateRange | null;
    return <Picker ref={ref} range unit={unit} presets={presets} calendars={calendars} pair={v === undefined ? undefined : { a: v?.start ?? null, b: v?.end ?? null }} defaultPair={{ a: dv?.start ?? null, b: dv?.end ?? null }} onPair={(p, info) => (onChange as unknown as DateRangePickerProps["onChange"])?.({ start: p.a, end: p.b }, info)} {...rest} />;
  }
  return <Picker ref={ref} range={false} unit={unit ?? (mode === "month" ? "month" : "day")} pair={value === undefined ? undefined : { a: value, b: null }} defaultPair={{ a: defaultValue, b: null }} onPair={(p, info) => onChange?.(p.a, info)} {...rest} />;
});

/** 기간(조회 기간) — 달력 두 개가 기본. 입력은 YYYY. MM. DD ~ YYYY. MM. DD */
export const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(function DateRangePicker({ value, defaultValue, onChange, ...rest }, ref) {
  return <Picker ref={ref} range pair={value === undefined ? undefined : { a: value.start, b: value.end }} defaultPair={{ a: defaultValue?.start ?? null, b: defaultValue?.end ?? null }} onPair={(p, info) => onChange?.({ start: p.a, end: p.b }, info)} {...rest} />;
});
