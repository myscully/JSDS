import { forwardRef, useContext, useImperativeHandle, useLayoutEffect, useRef, useState, type ChangeEvent, type CSSProperties, type FocusEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { cx } from "../../utils/cx";
import { useId } from "../../utils/useId";
import { Icon } from "../../icons/Icon";
import { useEscape, useOutsideClick } from "../../utils/hooks";
import { TextField, type TextFieldProps } from "../text-field/TextField";
import { FormValidationContext } from "../text-field/validation";
import { pasteText, reformat, stepClock } from "../date-picker/format";

/* Time Picker — 입력칸 + 열 목록(2026-11-13). 사이트 ds.js 의 .timepicker 와 같은 규칙:
   24시간제 HH:mm(seconds 면 HH:mm:ss), 열에서 고르면 바로 값, step 은 분 열의 간격, min · max 밖 칸은 고를 수 없고 입력은 받아 오류로 알린다 */

export type TimeValidity = "empty" | "incomplete" | "invalid" | "min" | "max" | "valid";
export interface TimeChangeInfo { text: string; validity: TimeValidity }
/** 오류 문구 — Date Picker 의 시각 문구와 같은 키 · 같은 기본값(자리표시 {subject} {example} {min} {max}) */
export const TIME_MESSAGES = {
  incomplete: "{subject} 덜 입력됐습니다. {example} 처럼 끝까지 입력하세요.",
  invalidTime: "{subject} 잘못됐습니다. {example} 처럼 24시간제로 입력하세요.",
  min: "{subject} 범위를 벗어났습니다. {min} 부터 입력할 수 있습니다.",
  max: "{subject} 범위를 벗어났습니다. {max} 까지 입력할 수 있습니다.",
  timeSubject: "시각이",
};
export type TimePickerMessages = typeof TIME_MESSAGES;
export const TIME_LABELS = { dialog: "시각 선택", hour: "시", minute: "분", second: "초", open: "선택" };
export type TimePickerLabels = typeof TIME_LABELS;

const pad = (n: number) => (n < 10 ? "0" : "") + n;
const fill = (t: string, x: Record<string, string>) => t.replace(/\{(\w+)\}/g, (m, k: string) => x[k] ?? m);
/** 범위 값을 글자 길이에 맞춘다 — 초가 없는 min 은 :00 을 붙인다 */
export function timeBound(s: string | undefined, seconds: boolean): string {
  const g = String(s ?? "").match(/\d+/g);
  if (!g || g.length < 2) return "";
  return [g[0], g[1], g[2] ?? "0"].slice(0, seconds ? 3 : 2).map((x) => pad(+x)).join(":");
}
/** 검사 — 빈 · 미완성 · 없는 시각 · min · max · 유효. 범위 밖도 값은 남긴다 */
export function checkTime(text: string, o: { seconds?: boolean; min?: string; max?: string; messages?: Partial<TimePickerMessages> } = {}): { validity: TimeValidity; value: string | null; message?: string } {
  const sec = !!o.seconds, s = String(text ?? "").trim(), dg = s.replace(/\D/g, ""), n = sec ? 6 : 4, M = { ...TIME_MESSAGES, ...o.messages };
  const lo = timeBound(o.min, sec), hi = timeBound(o.max, sec), x = { subject: M.timeSubject, example: sec ? "14:30:05" : "14:30", min: lo, max: hi };
  if (!s) return { validity: "empty", value: null };
  if (dg.length < n) return { validity: "incomplete", value: null, message: fill(M.incomplete, x) };
  const h = +dg.slice(0, 2), m = +dg.slice(2, 4), c = sec ? +dg.slice(4, 6) : 0;
  if (dg.length > n || h > 23 || m > 59 || c > 59) return { validity: "invalid", value: null, message: fill(M.invalidTime, x) };
  const v = `${pad(h)}:${pad(m)}${sec ? `:${pad(c)}` : ""}`;
  if (lo && v < lo) return { validity: "min", value: v, message: fill(M.min, x) };
  if (hi && v > hi) return { validity: "max", value: v, message: fill(M.max, x) };
  return { validity: "valid", value: v };
}
/** 두 자리가 찬 조각만 — 없으면 null */
const segsOf = (text: string, n: number) => Array.from({ length: n }, (_, i) => { const g = text.split(":")[i]; return g && /^\d\d$/.test(g) && +g < (i ? 60 : 24) ? +g : null; });
/** 칸을 끌지 — 시는 그 시간 전체가 범위 밖, 분은 그 분 전체, 초는 그 값이 범위 밖일 때 */
function optionOff(ci: number, v: number, seg: (number | null)[], lo: string, hi: string, sec: boolean): boolean {
  let first: number[] | null, last: number[] | null;
  if (ci === 0) { first = [v, 0, 0]; last = [v, 59, 59]; }
  else if (ci === 1) { first = seg[0] == null ? null : [seg[0], v, 0]; last = seg[0] == null ? null : [seg[0], v, 59]; }
  else { first = last = seg[0] == null || seg[1] == null ? null : [seg[0], seg[1], v]; }
  const t = (a: number[]) => a.slice(0, sec ? 3 : 2).map(pad).join(":");
  return !!first && !!last && ((!!lo && t(last) < lo) || (!!hi && t(first) > hi));
}

export interface TimePickerProps extends Omit<TextFieldProps, "type" | "prefix" | "suffix" | "trailing" | "reveal" | "revealLabel" | "maxLength" | "showCount" | "mono" | "min" | "max" | "step" | "label" | "value" | "defaultValue" | "onChange" | "messages"> {
  /** 값의 이름 — 라벨과 열기 버튼의 이름 */
  label: string;
  /** 필드 글자 "HH:mm" · "HH:mm:ss". 바뀌면 필드도 따라간다 */
  value?: string | null;
  defaultValue?: string;
  /** 확정할 때(Enter · 열에서 고름 · ↑↓ · 떠남) 글자가 바뀌었으면. value 는 미완성 · 없는 시각이면 null, 범위 밖은 그 시각 */
  onChange?: (value: string | null, info: TimeChangeInfo) => void;
  /** HH:mm:ss */
  seconds?: boolean;
  /** 분 열의 간격(1~59). 입력은 간격과 맞지 않아도 받는다 */
  step?: number;
  min?: string;
  max?: string;
  messages?: Partial<TimePickerMessages>;
  labels?: Partial<TimePickerLabels>;
  /** 칠 때마다 끊은 글자 — 확정 전에도(Date Picker 달력이 시각 칸의 글자를 따라갈 때) */
  onTextChange?: (text: string) => void;
  /** false 면 스스로 오류 문구를 띄우지 않고 폼 검증에도 문구를 넘기지 않는다 — 값을 다른 컴포넌트가 잴 때(Date Picker 달력 안, 적용할 때 필드가 잰다) */
  validate?: boolean;
}

/** 하루 안의 시각 — 입력칸 + 시 · 분 · 초 열 목록, 고르면 바로 반영 */
export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(function TimePicker(
  { label, value, defaultValue, onChange, onTextChange, validate = true, seconds = false, step = 1, min, max, messages, labels, error, wrapperClassName, wrapperStyle, wrapperProps, disabled, readOnly, id, onKeyDown, onBlur, ...rest },
  ref,
) {
  const form = useContext(FormValidationContext);
  const inputId = useId(id, "tp");
  const input = useRef<HTMLInputElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => input.current as HTMLInputElement);
  const unit = seconds ? "clockS" : "clock";
  const n = seconds ? 3 : 2;
  const L = { ...TIME_LABELS, ...labels };
  const [text, setText] = useState(() => pasteText(value ?? defaultValue ?? "", unit, false));
  const committed = useRef(text);
  const prev = useRef(text);
  const dirty = useRef(false);
  const [local, setLocal] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<(number | null)[]>([null, null, null]);
  const [place, setPlace] = useState<{ top: number; left: number; up: boolean } | null>(null);
  const check = (t: string) => checkTime(t, { seconds, min, max, messages });
  const off = !!disabled || !!readOnly;

  /* 바깥 value 를 따라간다 */
  const seen = useRef(value);
  if (value !== undefined && value !== seen.current) {
    seen.current = value;
    const t = pasteText(value ?? "", unit, false);
    if (t !== text) { setText(t); committed.current = t; prev.current = t; }
  }
  /* 폼 검증이 읽는 문구 — 필수(빈 값)는 표준 제약이 맡는다 */
  /* ↑↓ 뒤 커서 — 그린 직후 같은 조각에(연달아 눌러도 같은 조각을 움직이게) */
  const caretAt = useRef<number | null>(null);
  useLayoutEffect(() => { const el = input.current, c = caretAt.current; caretAt.current = null; if (el && c != null && document.activeElement === el) try { el.setSelectionRange(c, c); } catch { /* 포커스 없는 입력 */ } });
  const custom = (t: string) => (validate && t.trim() ? check(t).message ?? "" : "");
  useLayoutEffect(() => { input.current?.setCustomValidity(custom(text)); });

  const write = (t: string) => { const el = input.current; if (el) { el.value = t; el.setCustomValidity(custom(t)); } prev.current = t; setText(t); onTextChange?.(t); };
  const commit = (t = input.current?.value ?? text) => {
    const r = check(t), next = r.value ?? t;
    write(next);
    if (form) { if (input.current && (next || dirty.current)) form.touch(input.current); }
    else if (r.message && validate) setLocal(r.message);
    else if (local) setLocal("");
    if (next.trim() !== committed.current.trim()) { committed.current = next; onChange?.(r.value, { text: next.trim(), validity: r.validity }); }
  };

  const lo = timeBound(min, seconds), hi = timeBound(max, seconds), seg = segsOf(text, n);
  const cols: { key: "hour" | "minute" | "second"; values: number[] }[] = [
    { key: "hour", values: Array.from({ length: 24 }, (_, i) => i) },
    { key: "minute", values: Array.from({ length: Math.ceil(60 / Math.max(1, Math.min(59, step))) }, (_, i) => i * Math.max(1, Math.min(59, step))) },
    ...(seconds ? [{ key: "second" as const, values: Array.from({ length: 60 }, (_, i) => i) }] : []),
  ];
  /** 열마다 Tab 이 멈출 칸 — 고른 칸, 없으면 옮겨 둔 칸, 없으면 처음 켜진 칸 */
  const stop = (ci: number) => {
    const live = cols[ci].values.filter((v) => !optionOff(ci, v, seg, lo, hi, seconds));
    if (seg[ci] != null && live.includes(seg[ci] as number)) return seg[ci] as number;
    if (active[ci] != null && live.includes(active[ci] as number)) return active[ci] as number;
    return live[0] ?? cols[ci].values[0];
  };
  const optEl = (ci: number, v: number) => panel.current?.querySelector<HTMLElement>(`[data-col="${ci}"] [data-v="${v}"]`) ?? null;
  const focusOpt = (ci: number, v: number) => { setActive((a) => { const b = [...a]; b[ci] = v; return b; }); const el = optEl(ci, v); el?.focus({ preventScroll: true }); el?.scrollIntoView?.({ block: "nearest" }); };

  const openPanel = (focus: boolean) => {
    if ((input.current?.value ?? "").trim() !== committed.current.trim()) commit();
    setActive([null, null, null]);
    setOpen(true);
    pendingFocus.current = focus;
  };
  const close = (restore: boolean) => { setOpen(false); setPlace(null); if (restore) input.current?.focus(); };
  const pendingFocus = useRef(false);
  useLayoutEffect(() => {
    if (!open || !panel.current || !host.current) return;
    if (!place) {
      const hr = host.current.getBoundingClientRect(), anchor = host.current.querySelector(".affix") ?? host.current, r = anchor.getBoundingClientRect(), h = panel.current.offsetHeight, w = panel.current.offsetWidth, gap = 4;
      const below = window.innerHeight - r.bottom - gap, above = r.top - gap, up = below < h && above > below, vw = document.documentElement.clientWidth;
      setPlace({ up, top: up ? r.top - hr.top - gap - h : r.bottom - hr.top + gap, left: Math.max(8 - hr.left, Math.min(0, vw - 8 - w - hr.left)) });
      panel.current.querySelectorAll<HTMLElement>(".time-col").forEach((col) => { const on = col.querySelector<HTMLElement>(".time-opt.on"); col.scrollTop = on ? on.offsetTop - parseFloat(getComputedStyle(col).paddingTop || "0") : 0; });   // 고른 칸을 맨 위로
      if (pendingFocus.current) { pendingFocus.current = false; panel.current.querySelector<HTMLElement>('.time-opt[tabindex="0"]')?.focus({ preventScroll: true }); }
    }
  }, [open, place]);
  useOutsideClick([host], () => close(false), open);
  useEscape(() => close(true), open);   // 가장 안쪽 하나만 — 대화상자는 다음 Esc 에

  const pick = (ci: number, v: number, keyboard: boolean) => {
    if (optionOff(ci, v, seg, lo, hi, seconds)) return;
    const next = [...seg]; next[ci] = v;
    dirty.current = true;
    commit(next.map((x) => pad(x ?? 0)).join(":"));
    setActive((a) => { const b = [...a]; b[ci] = v; return b; });
    if (!keyboard) return;
    if (ci + 1 < cols.length) requestAnimationFrame(() => { const el = panel.current?.querySelector<HTMLElement>(`[data-col="${ci + 1}"] .time-opt[tabindex="0"]`); el?.focus({ preventScroll: true }); el?.scrollIntoView?.({ block: "nearest" }); });
    else close(true);   // 고르고 다음 열로, 마지막 열이면 닫고 입력칸으로
  };
  const optKey = (e: ReactKeyboardEvent<HTMLDivElement>, ci: number, v: number) => {
    const live = cols[ci].values.filter((x) => !optionOff(ci, x, seg, lo, hi, seconds)), i = live.indexOf(v), k = e.key;
    if (k === "ArrowDown" || k === "ArrowUp") { e.preventDefault(); const nx = live[k === "ArrowDown" ? Math.min(live.length - 1, i + 1) : Math.max(0, i < 0 ? 0 : i - 1)]; if (nx != null) focusOpt(ci, nx); }
    else if (k === "Home" || k === "End") { e.preventDefault(); if (live.length) focusOpt(ci, live[k === "Home" ? 0 : live.length - 1]); }
    else if (k === "ArrowLeft" || k === "ArrowRight") { e.preventDefault(); const c2 = ci + (k === "ArrowRight" ? 1 : -1); if (c2 >= 0 && c2 < cols.length) focusOpt(c2, stop(c2)); }
    else if (k === "Enter" || k === " ") { e.preventDefault(); pick(ci, v, true); }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const el = e.target, { text: t, caret } = reformat(el.value, prev.current, el.selectionStart ?? el.value.length, (e.nativeEvent as InputEvent).inputType, unit, false);
    dirty.current = true;
    write(t);
    try { el.setSelectionRange(caret, caret); } catch { /* 포커스 없는 입력 */ }
    if (!form && local && validate) setLocal(t.trim() ? check(t).message ?? "" : "");   // 오류가 있는 동안은 칠 때마다 다시 재 바로 지운다
  };
  const handleKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || e.nativeEvent.isComposing) return;
    if (e.key === "Enter") { e.preventDefault(); commit(); }
    else if (e.key === "ArrowDown" && e.altKey) { e.preventDefault(); if (!off) openPanel(true); }
    else if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !off) {
      e.preventDefault();
      const el = e.currentTarget, r = stepClock(el.value, el.selectionStart ?? 0, e.key === "ArrowUp" ? 1 : -1, seconds);
      dirty.current = true; commit(r.text);
      caretAt.current = r.caret; try { el.setSelectionRange(r.caret, r.caret); } catch { /* 포커스 없는 입력 */ }
    }
  };
  /* 필드를 떠나면 닫고 확정한다 — 입력칸 → 버튼 → 열 사이를 옮기는 동안은 기다린다 */
  const handleHostBlur = (e: FocusEvent<HTMLDivElement>) => {
    wrapperProps?.onBlur?.(e);
    if (e.relatedTarget && host.current?.contains(e.relatedTarget as Node)) return;
    if (off) return;
    if (open) close(false);
    commit();
  };

  return (
    <TextField
      {...rest}
      ref={input}
      id={inputId}
      label={label}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder={seconds ? "HH:mm:ss" : "HH:mm"}
      value={text}
      disabled={disabled}
      readOnly={readOnly}
      error={error || local || undefined}
      wrapperStyle={place ? ({ ...wrapperStyle, "--tp-top": `${place.top}px`, "--tp-left": `${place.left}px` } as CSSProperties) : wrapperStyle}
      wrapperClassName={cx("timepicker", open && "open", place?.up && "up", wrapperClassName)}
      wrapperProps={{
        ...wrapperProps,
        ref: host,
        "data-seconds": seconds ? "" : undefined,
        "data-step": step !== 1 ? step : undefined,
        "data-min": min,
        "data-max": max,
        "data-validity": check(text).validity,
        onBlur: handleHostBlur,
      } as never}
      onChange={handleChange}
      onKeyDown={handleKey}
      onBlur={onBlur}
      trailing={
        <button type="button" className="tp-btn" aria-label={`${label} ${L.open}`} aria-haspopup="dialog" aria-expanded={open} disabled={off} onClick={() => (open ? close(true) : openPanel(true))}>
          <Icon name="clock" />
        </button>
      }
      after={
        open ? (
          <div ref={panel} className="time-panel" role="dialog" aria-label={L.dialog}>
            {cols.map((c, ci) => {
              const s = stop(ci);
              return (
                <div key={c.key} className="time-col" role="listbox" aria-label={L[c.key]} data-part={c.key} data-col={ci}>
                  {c.values.map((v) => {
                    const dis = optionOff(ci, v, seg, lo, hi, seconds), on = seg[ci] === v;
                    return (
                      <div key={v} className={cx("time-opt", on && "on")} role="option" id={`${inputId}-${c.key}-${pad(v)}`} data-v={v} aria-selected={on} aria-disabled={dis || undefined} tabIndex={v === s ? 0 : -1}
                        onMouseDown={(e) => e.currentTarget.focus({ preventScroll: true })}
                        onClick={() => pick(ci, v, false)} onKeyDown={(e) => optKey(e, ci, v)}>
                        {pad(v)}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : null
      }
    />
  );
});
