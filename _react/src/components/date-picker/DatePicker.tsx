import { forwardRef, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useControllable } from "../../utils/useControllable";
import { useEscape, useOutsideClick, mergeRefs } from "../../utils/hooks";
import { Icon } from "../../icons/Icon";
import { Button } from "../button/Button";
import { LABELS } from "../../labels";

export type DateRange = { start: Date; end: Date | null };
const pad = (n: number) => String(n).padStart(2, "0");
/** YYYY-MM-DD (가이드라인 고정 형식) */
export function formatDate(d: Date | null | undefined): string {
  return d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : "";
}
const sameDay = (a: Date | null | undefined, b: Date | null | undefined) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);

export interface CalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** 표시할 달 (아무 날짜) */
  month: Date;
  onMonthChange?: (month: Date) => void;
  mode?: "single" | "range";
  value?: Date | null | DateRange;
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
  /** role=dialog aria-label */
  label?: string;
}

/** 달력 그리드. 요일·월 표기는 Intl(locale) */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
  { month, onMonthChange, mode = "single", value, onSelect, min, max, today, locale = "ko-KR", weekStart = 0, footer, label = LABELS.dateDialog, className, ...rest },
  ref,
) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = (first.getDay() - weekStart + 7) % 7;
  const rows = Math.ceil((offset + daysInMonth) / 7);
  const todayD = startOfDay(today ?? new Date());
  const dow = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(new Date(2024, 0, 7 + ((i + weekStart) % 7))));
  const title = new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" }).format(first);
  const range = mode === "range" && value && typeof value === "object" && "start" in value ? (value as DateRange) : null;
  const single = mode === "single" && value instanceof Date ? value : null;
  const inRange = (d: Date) => !!range && !!range.end && d > startOfDay(range.start) && d < startOfDay(range.end);
  const isOn = (d: Date) => (single ? sameDay(d, single) : range ? sameDay(d, range.start) || sameDay(d, range.end) : false);
  const cells = Array.from({ length: rows * 7 }, (_, i) => new Date(first.getFullYear(), first.getMonth(), i - offset + 1));
  return (
    <div ref={ref} className={cx("calendar", className)} role="dialog" aria-label={label} {...rest}>
      <div className="cal-head">
        <button type="button" aria-label={LABELS.prevMonth} onClick={() => onMonthChange?.(addMonths(first, -1))}>
          <Icon name="chevron-left" size={16} />
        </button>
        <span>{title}</span>
        <button type="button" aria-label={LABELS.nextMonth} onClick={() => onMonthChange?.(addMonths(first, 1))}>
          <Icon name="chevron-right" size={16} />
        </button>
      </div>
      <div className="cal-grid">
        {dow.map((d, i) => (
          <span key={`dow-${i}`} className="dow">{d}</span>
        ))}
        {cells.map((d) => {
          const muted = d.getMonth() !== first.getMonth();
          const disabled = (min && d < startOfDay(min)) || (max && d > startOfDay(max));
          const on = isOn(d);
          return (
            <button
              key={d.getTime()}
              type="button"
              className={cx("day", { muted, today: sameDay(d, todayD), on, "in-range": inRange(d) })}
              aria-selected={on ? true : undefined}
              aria-label={formatDate(d)}
              disabled={disabled || undefined}
              onClick={() => onSelect?.(d)}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
      {footer !== undefined && <div className="cal-foot">{footer}</div>}
    </div>
  );
});

export interface DatePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  label?: ReactNode;
  mode?: "single" | "range";
  value?: Date | null | DateRange;
  defaultValue?: Date | null | DateRange;
  onChange?: (value: Date | null | DateRange) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: ReactNode;
  min?: Date;
  max?: Date;
  today?: Date;
  locale?: string;
  /** 기간 프리셋 (range). 예: [{label:"최근 7일", range:()=>[a,b]}] */
  presets?: { label: ReactNode; range: () => [Date, Date] }[];
  disabled?: boolean;
  /** 필드 버튼 스타일/클래스 */
  triggerStyle?: React.CSSProperties;
  /** 값 대신 표시할 문구 (예: "최근 24시간" 프리셋 이름) */
  displayText?: ReactNode;
}

/** 날짜/기간 선택 필드 + 달력 팝오버 */
export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(function DatePicker(
  { label, mode = "single", value, defaultValue = null, onChange, open, defaultOpen = false, onOpenChange, placeholder = LABELS.datePlaceholder, min, max, today, locale, presets, disabled, triggerStyle, displayText, className, ...rest },
  ref,
) {
  const [cur, set] = useControllable<Date | null | DateRange>({ value, defaultValue, onChange });
  const [isOpen, setOpen] = useControllable<boolean>({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const initialMonth = cur instanceof Date ? cur : cur && "start" in cur ? cur.start : today ?? new Date();
  const [month, setMonth] = useState<Date>(initialMonth);
  const [draft, setDraft] = useState<Date | null | DateRange>(cur);
  const root = useRef<HTMLDivElement>(null);
  useOutsideClick([root], () => setOpen(false), isOpen);
  useEscape(() => setOpen(false), isOpen);
  const openWith = () => { setDraft(cur); setOpen(!isOpen); };
  const pick = (d: Date) => {
    if (mode === "single") { setDraft(d); return; }
    const r = draft && typeof draft === "object" && "start" in draft ? draft : null;
    if (!r || r.end) setDraft({ start: d, end: null });
    else setDraft(d < r.start ? { start: d, end: r.start } : { start: r.start, end: d });
  };
  const apply = (v: Date | null | DateRange) => { set(v); setOpen(false); };
  const text = (() => {
    if (displayText !== undefined) return displayText;
    if (!cur) return null;
    if (cur instanceof Date) return formatDate(cur);
    return (
      <>
        {formatDate(cur.start)} <span className="sep">~</span> {formatDate(cur.end)}
      </>
    );
  })();
  const footer = mode === "range" ? (
    <>
      {presets?.map((p, i) => (
        <Button key={i} size="sm" variant="text" onClick={() => { const [a, b] = p.range(); apply({ start: a, end: b }); }}>{p.label}</Button>
      ))}
      <Button size="sm" onClick={() => apply(draft)}>{LABELS.apply}</Button>
    </>
  ) : (
    <>
      <Button size="sm" variant="text" onClick={() => { const t = startOfDay(today ?? new Date()); setMonth(t); setDraft(t); }}>{LABELS.today}</Button>
      <Button size="sm" onClick={() => apply(draft)}>{LABELS.apply}</Button>
    </>
  );
  return (
    <div ref={mergeRefs(root, ref)} className={cx("datepicker", isOpen && "open", className)} {...rest}>
      {label !== undefined && <label>{label}</label>}
      <button type="button" className="field-btn" aria-haspopup="dialog" aria-expanded={isOpen} disabled={disabled} onClick={openWith} style={triggerStyle}>
        {text ?? <span className="placeholder">{placeholder}</span>}
        <Icon name="calendar" />
      </button>
      {isOpen && (
        <Calendar month={month} onMonthChange={setMonth} mode={mode} value={draft} onSelect={pick} min={min} max={max} today={today} locale={locale} footer={footer} />
      )}
    </div>
  );
});
