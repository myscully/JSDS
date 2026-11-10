/* Date Picker 의 글자 · 검사 — 순수 함수. 사이트 ds.js(_build/ds.src.js)의 groups · pasteText · check · stepSeg 와 같은 규칙이다.
   표기는 단위마다 고정(YYYY. MM. DD · YYYY. MM · YYYY) — locale 과 무관(사람의 결정 2026-11-09). 키는 기계 형식(YYYY-MM-DD · YYYY-MM · YYYY) */

export type DateUnit = "day" | "month" | "year";
/** 필드 글자의 단위 — 시각 옵션이면 달력은 day, 글자는 minute · second */
export type TextUnit = DateUnit | "minute" | "second";
/** 끊어 채우기의 단위 — clock 은 달력 아래 시각 칸 */
type GroupUnit = TextUnit | "clock" | "clockS";
/** 입력의 상태 — 값이 늘 유효한 날짜는 아니다(사람의 요구 2026-11-09) */
export type DateValidity = "empty" | "incomplete" | "invalid" | "min" | "max" | "order" | "long" | "valid";
/** 양끝을 포함한 일수 — 시각은 보지 않는다(같은 날이면 1). UTC 로 재서 일광 절약 시간의 23 · 25시간 날에 흔들리지 않게 */
export const spanDays = (a: Date, b: Date) => Math.abs(Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) - Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) / 864e5 + 1;

const pad = (n: number) => String(n).padStart(2, "0");
/** YYYY-MM-DD */
export function formatDate(d: Date | null | undefined): string {
  return d && !isNaN(d.getTime()) ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : "";
}
/** YYYY-MM */
export function formatMonth(d: Date | null | undefined): string {
  return d && !isNaN(d.getTime()) ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}` : "";
}
/** "YYYY-MM-DD" · "YYYY. MM. DD" · "YYYY/M/D" · "YYYYMMDD" 를 로컬 날짜로. 없는 날짜(2026-02-30)는 null.
 *  new Date("YYYY-MM-DD") 는 UTC 로 읽어 음수 시간대에서 하루 앞으로 밀리므로 쓰지 않는다 */
export function parseDate(s: string | null | undefined): Date | null {
  const m = /^(\d{4})(?:[-./\s]+(\d{1,2})[-./\s]+(\d{1,2})|(\d{2})(\d{2}))\.?$/.exec(String(s ?? "").trim());   // 구분자가 있거나 8자리를 붙여 쓴다 — "2026. 11" 을 1월 1일로 읽었다
  if (!m) return null;
  if (m[4]) { m[2] = m[4]; m[3] = m[5]; }
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return d.getMonth() === +m[2] - 1 && d.getDate() === +m[3] ? d : null;
}
/** "YYYY-MM" · "YYYY. MM" 를 그 달 1일로 */
export function parseMonth(s: string | null | undefined): Date | null {
  const m = /^(\d{4})(?:[-./\s]+(\d{1,2})|(\d{2}))\.?$/.exec(String(s ?? "").trim());
  if (m && m[3]) m[2] = m[3];
  return m && +m[2] >= 1 && +m[2] <= 12 ? new Date(+m[1], +m[2] - 1, 1) : null;
}
/** "YYYY" 를 그 해 1월 1일로 */
export function parseYear(s: string | null | undefined): Date | null {
  const m = /^(\d{4})\.?$/.exec(String(s ?? "").trim());
  return m ? new Date(+m[1], 0, 1) : null;
}
/** 날짜 + 시각 — 조각 수가 정확해야 한다(시각 없는 날짜는 값이 아니다 — 사람의 결정 2026-11-10) */
export function parseDateTime(s: string | null | undefined, seconds = false): Date | null {
  let g = String(s ?? "").match(/\d+/g) ?? [];
  if (g.length === 1) { const x = g[0]; if (x.length !== (seconds ? 14 : 12)) return null; g = [x.slice(0, 4), x.slice(4, 6), x.slice(6, 8), x.slice(8, 10), x.slice(10, 12), ...(seconds ? [x.slice(12)] : [])]; }
  if (g.length !== (seconds ? 6 : 5) || g[0].length !== 4) return null;
  const d = parseDate(`${g[0]}-${g[1]}-${g[2]}`), h = +g[3], m = +g[4], c = seconds ? +g[5] : 0;
  if (!d || h > 23 || m > 59 || c > 59) return null;
  d.setHours(h, m, c, 0);
  return d;
}
export const parseUnit = (s: string | null | undefined, unit: TextUnit) => (unit === "year" ? parseYear(s) : unit === "month" ? parseMonth(s) : unit === "minute" ? parseDateTime(s) : unit === "second" ? parseDateTime(s, true) : parseDate(s));
/** HH:mm · HH:mm:ss */
export const clockOf = (d: Date, unit: TextUnit) => `${pad(d.getHours())}:${pad(d.getMinutes())}${unit === "second" ? `:${pad(d.getSeconds())}` : ""}`;
export const keyOf = (d: Date, unit: TextUnit = "day") => (unit === "year" ? String(d.getFullYear()) : unit === "month" ? formatMonth(d) : unit === "minute" || unit === "second" ? `${formatDate(d)} ${clockOf(d, unit)}` : formatDate(d));
/** 필드 표기 */
export const showOf = (d: Date, unit: TextUnit = "day"): string => (unit === "year" ? String(d.getFullYear()) : unit === "minute" || unit === "second" ? `${showOf(d, "day")} ${clockOf(d, unit)}` : `${d.getFullYear()}. ${pad(d.getMonth() + 1)}${unit === "month" ? "" : `. ${pad(d.getDate())}`}`);
export const unitStart = (d: Date, unit: DateUnit) => (unit === "year" ? new Date(d.getFullYear(), 0, 1) : unit === "month" ? new Date(d.getFullYear(), d.getMonth(), 1) : new Date(d.getFullYear(), d.getMonth(), d.getDate()));
export const isValidDate = (d: unknown): d is Date => d instanceof Date && !isNaN(d.getTime());
export const placeholderOf = (unit: TextUnit, range: boolean) => { const one = unit === "year" ? "YYYY" : unit === "month" ? "YYYY. MM" : unit === "minute" ? "YYYY. MM. DD HH:mm" : unit === "second" ? "YYYY. MM. DD HH:mm:ss" : "YYYY. MM. DD"; return range ? `${one} ~ ${one}` : one; };
const DIGITS: Record<TextUnit, number> = { second: 14, minute: 12, day: 8, month: 6, year: 4 };
const EXAMPLE: Record<TextUnit, string> = { second: "2026. 09. 07 14:30:05", minute: "2026. 09. 07 14:30", day: "2026. 09. 07", month: "2026. 09", year: "2026" };
const LENS: Record<GroupUnit, number[]> = { year: [4], month: [4, 2], day: [4, 2, 2], minute: [4, 2, 2, 2, 2], second: [4, 2, 2, 2, 2, 2], clock: [2, 2], clockS: [2, 2, 2] };
const isClock = (unit: GroupUnit) => unit === "clock" || unit === "clockS";
const joinSeg = (s: string[], unit: GroupUnit) => (isClock(unit) ? s.join(":") : s.slice(0, 3).join(". ") + (s.length > 3 ? ` ${s.slice(3).join(":")}` : ""));
/** 그 칸의 첫 자리로 쓸 수 있는 가장 큰 숫자 — 월 · 일 · 시 · 분 · 초 */
const FIRST_LIMIT = ["", "1", "3", "2", "5", "5"];

/** 숫자열을 조각으로(연 4 · 월 2 · 일 2). 월 첫 자리가 2~9 · 일 첫 자리가 4~9 면 앞에 0 을 붙여 그 조각을 끝낸다(9 → 09).
 *  기간은 앞 날짜가 다 차면 " ~ " 뒤로 넘어간다 */
export function groups(dg: string, unit: GroupUnit, range: boolean): string {
  const lens = LENS[unit], off = isClock(unit) ? 3 : 0, max = range ? 2 : 1, sides: string[][] = [];
  let cur: string[] = [], g = "", gi = 0;
  for (let i = 0; i < dg.length && sides.length < max; i++) {
    const c = dg.charAt(i);
    const lim = FIRST_LIMIT[gi + off];
    if (g === "" && lim && c > lim) g = "0";
    g += c;
    if (g.length === lens[gi]) { cur.push(g); g = ""; gi++; if (gi === lens.length) { sides.push(cur); cur = []; gi = 0; } }
  }
  if (g) cur.push(g);
  if (cur.length && sides.length < max) sides.push(cur);
  return sides.map((s) => joinSeg(s, unit)).join(" ~ ");
}
/** 붙여넣기 · 처음 글자 — 구분자로 나뉜 조각은 자리를 채운다(2026/9/7 → 2026. 09. 07). 친 글자에는 쓰지 않는다: 치는 중인 "2026. 09. 3" 을 3일로 확정하지 않게 */
export function pasteText(s: string, unit: GroupUnit, range: boolean): string {
  return groups(String(s ?? "").split("~").slice(0, range ? 2 : 1).map((p) => {
    const g = p.match(/\d+/g) || [];
    return g.length > 1 ? g[0] + g.slice(1).map((x) => (x.length === 1 ? "0" + x : x)).join("") : g.join("");
  }).join(""), unit, range);
}
/** 치는 동안 — 숫자만 남겨 다시 끊는다. 구분자 하나만 지운 Backspace 는 그 앞 숫자를 지운다(구분자는 다시 생기므로). 커서는 같은 숫자 뒤에 둔다 */
export function reformat(value: string, prev: string, caret: number, inputType: string | undefined, unit: GroupUnit, range: boolean): { text: string; caret: number } {
  const atEnd = caret >= value.length;
  let dg = value.replace(/\D/g, ""), before = value.slice(0, caret).replace(/\D/g, "").length;
  if (inputType === "deleteContentBackward" && dg === prev.replace(/\D/g, "") && before > 0) { dg = dg.slice(0, before - 1) + dg.slice(before); before--; }
  const paste = inputType === "insertFromPaste" || inputType === "insertFromDrop";
  const text = paste ? pasteText(value, unit, range) : groups(dg, unit, range);
  let pos = text.length;
  if (!atEnd && !paste) { let n = 0; for (pos = 0; pos < text.length && n < before; pos++) if (/\d/.test(text.charAt(pos))) n++; }
  return { text, caret: pos };
}
/** ↑↓ — 커서가 놓인 조각(연 · 월 · 일)을 ±1. min/max 는 보지 않는다(사람의 요구 2026-11-09 — 키보드로는 범위 밖 값도 넣는다).
 *  빈 조각은 오늘 값으로 채운다. 월은 12 ↔ 1, 일은 그 달의 끝 ↔ 1 로 돈다 */
export function stepText(value: string, caret: number, dir: 1 | -1, unit: TextUnit, range: boolean, today: Date): { text: string; caret: number } {
  const parts = range ? value.split(" ~ ") : [value], side = range && parts.length > 1 && caret > parts[0].length ? 1 : 0, base = side ? parts[0].length + 3 : 0, local = caret - base;
  const segs = (parts[side] || "").split(/\. | |:/), n = LENS[unit].length, si = Math.min(local <= 4 ? 0 : local <= 8 ? 1 : local <= 12 ? 2 : local <= 15 ? 3 : local <= 18 ? 4 : 5, n - 1);
  const now = [today.getFullYear(), today.getMonth() + 1, today.getDate(), ...(side ? [23, 59, 59] : [0, 0, 0])], empty = !segs[si] || segs[si].length < (si ? 2 : 4);
  const num = Array.from({ length: n }, (_, i) => (segs[i] && segs[i].length === (i ? 2 : 4) ? +segs[i] : now[i]));
  if (!empty) {
    if (si === 0) num[0] = Math.max(1, Math.min(9999, num[0] + dir));
    else if (si === 1) num[1] = ((num[1] - 1 + dir + 12) % 12) + 1;
    else if (si === 2) { const dim = new Date(num[0], num[1], 0).getDate(); num[2] = ((Math.min(num[2], dim) - 1 + dir + dim) % dim) + 1; }
    else { const wrap = si === 3 ? 24 : 60; num[si] = (num[si] + dir + wrap) % wrap; }   // 시 23 ↔ 0, 분 · 초 59 ↔ 0
  }
  if (n >= 3) num[2] = Math.min(num[2], new Date(num[0], num[1], 0).getDate());   // 1월 31일에서 월을 올리면 2월 28일
  parts[side] = joinSeg(num.map((x, j) => (j ? pad(x) : String(x))), unit);
  if (range && side === 0 && parts.length < 2) parts.length = 1;
  return { text: parts.join(" ~ "), caret: base + [4, 8, 12, 15, 18, 21][si] };
}
/** 시각 칸의 ↑↓ — 커서 조각 ±1(시 23 ↔ 0, 분 · 초 59 ↔ 0) */
export function stepClock(value: string, caret: number, dir: 1 | -1, seconds: boolean): { text: string; caret: number } {
  const n = seconds ? 3 : 2, segs = value.split(":"), si = Math.min(caret <= 2 ? 0 : caret <= 5 ? 1 : 2, n - 1);
  const num = Array.from({ length: n }, (_, i) => (segs[i] && segs[i].length === 2 ? +segs[i] : 0));
  if (segs[si] && segs[si].length === 2) { const w = si ? 60 : 24; num[si] = (num[si] + dir + w) % w; }
  return { text: num.map(pad).join(":"), caret: [2, 5, 8][si] };
}

/** 오류 문구 — 자리표시 {subject} {example} {min} {max} 로 어순을 정한다(사이트 data-messages 와 같은 키).
 *  자리표시가 없는 문자열은 옛 조합: incomplete · invalid 는 뒤에 예시, min · max 는 앞에 날짜 */
export interface DatePickerMessages {
  /** 덜 친 날짜 */
  incomplete: string;
  /** 없는 날짜 */
  invalid: string;
  /** min 보다 앞 — {min} 은 필드 표기 */
  min: string;
  /** max 보다 뒤 — {max} 는 필드 표기 */
  max: string;
  /** 기간의 끝이 시작보다 앞 */
  order: string;
  /** {subject} — 단일 필드 · 기간에서 두 쪽 다 틀렸을 때. 조사까지("날짜가") */
  subject?: string;
  /** {subject} — 기간에서 시작만 틀렸을 때 */
  startSubject?: string;
  /** {subject} — 기간에서 끝만 틀렸을 때 */
  endSubject?: string;
  /** 기간이 maxDays 를 넘음 — 자리표시 {days} */
  long: string;
  /** 시각 옵션 — 없는 시각(25:00) */
  invalidTime?: string;
  /** 시각 옵션 — 같은 날인데 끝 시각이 시작보다 앞 */
  orderTime?: string;
  /** {subject} — 없는 시각. 단일 · 양쪽 */
  timeSubject?: string;
  startTimeSubject?: string;
  endTimeSubject?: string;
  /** @deprecated incomplete · invalid 로 나뉘었다 — 주면 둘 다에 쓴다 */
  format?: string;
}
/** 기간의 한쪽 상태 — 순서(order)는 두 쪽 사이의 일이라 여기에는 없다. 비운 쪽은 empty */
export type DateSideValidity = Exclude<DateValidity, "order" | "long">;
export interface CheckResult { validity: DateValidity; start: Date | null; end: Date | null; message?: string; /** 기간일 때만 — 시작 · 끝 각각 */ sides?: { start: DateSideValidity; end: DateSideValidity } }
type MessageKey = "incomplete" | "invalid" | "min" | "max" | "order" | "long" | "invalidTime" | "orderTime";
/** 문구 하나를 채운다 — 자리표시가 없으면 옛 조합 */
function say(t: string, key: MessageKey, x: Record<string, string | undefined>) {
  if (!t.includes("{")) return key === "order" || key === "orderTime" || key === "long" ? t : key === "min" || key === "max" ? (x[key] ?? "") + t : t + x.example;
  return t.replace(/\{(\w+)\}/g, (m, k: string) => x[k] ?? m);
}
/** 입력 검사 — 빈 · 미완성 · 없는 날짜 · 순서 · min · max · 유효. 미완성 · 없는 날짜는 값이 없고, 순서 · 범위 밖은 그 날짜가 남는다 */
export function checkText(text: string, o: { unit: TextUnit; range: boolean; min?: Date | null; max?: Date | null; maxDays?: number; messages: DatePickerMessages }): CheckResult {
  const { unit, range, min, max, maxDays, messages: msg } = o, s = String(text ?? "").trim(), isTime = unit === "minute" || unit === "second";
  if (!s) return { validity: "empty", start: null, end: null };
  const parts = range ? s.split(/\s*~\s*/) : [s];
  if (range && parts.length < 2) parts.push("");
  const sides = parts.slice(0, range ? 2 : 1).map((p) => {   // 자릿수가 모자라면 미완성 — 치는 중인 "2026. 09. 3" 을 3일로 확정하지 않는다
    const dg = p.replace(/\D/g, "");
    if (dg.length < DIGITS[unit]) return { v: "incomplete" as const, d: null, t: false };
    const d = parseUnit(p, unit);
    return d ? { v: "valid" as const, d, t: false } : { v: "invalid" as const, d: null, t: isTime && !!parseDate(dg.slice(0, 8)) };   // t — 날짜는 있는데 시각이 없는 값(25:00)
  });
  const k = (d: Date) => keyOf(d, unit);
  /* 쪽마다의 상태 — 비운 쪽 empty, 그 밖은 전체와 같은 규칙(범위는 그 쪽 날짜만 본다) */
  const sideOf = (p: string, x: (typeof sides)[number]): DateSideValidity => (!p.trim() ? "empty" : x.v !== "valid" ? x.v : min && k(x.d) < k(min) ? "min" : max && k(x.d) > k(max) ? "max" : "valid");
  const ss: Pick<CheckResult, "sides"> = range ? { sides: { start: sideOf(parts[0], sides[0]), end: sideOf(parts[1], sides[1]) } } : {};
  /* 주어 — 기간에서 한쪽만 걸리면 그 쪽 이름, 둘 다면 subject(예시도 A ~ B) */
  const x: Record<string, string | undefined> = { example: EXAMPLE[unit], min: min ? showOf(min, unit) : undefined, max: max ? showOf(max, unit) : undefined, subject: msg.subject };
  const who = (hit: (v: DateSideValidity) => boolean, t = false) => {
    if (!ss.sides) return;
    const s0 = hit(ss.sides.start), s1 = hit(ss.sides.end);
    if (s0 !== s1) x.subject = t ? (s0 ? msg.startTimeSubject : msg.endTimeSubject) : s0 ? msg.startSubject : msg.endSubject;
    else if (s0) x.example = `${EXAMPLE[unit]} ~ ${EXAMPLE[unit]}`;
  };
  const bad = sides.find((x) => x.v !== "valid");
  if (bad) {
    if (bad.t) x.subject = msg.timeSubject;
    who((v) => v === "incomplete" || v === "invalid" || v === "empty", bad.t);
    return { validity: bad.v, start: null, end: null, message: bad.t ? say(msg.invalidTime ?? msg.invalid, "invalidTime", x) : say(msg.format ?? msg[bad.v], bad.v, x), ...ss };
  }
  const a = sides[0].d!, b = range ? sides[1].d : null, both = [a, b].filter(Boolean) as Date[];
  if (b && b < a) { const sameDay = isTime && formatDate(a) === formatDate(b); return { validity: "order", start: a, end: b, message: sameDay ? say(msg.orderTime ?? msg.order, "orderTime", x) : say(msg.order, "order", x), ...ss }; }   // 같은 날이면 틀린 것은 시각이다
  if (min && both.some((d) => k(d) < k(min))) { who((v) => v === "min"); return { validity: "min", start: a, end: b, message: say(msg.min, "min", x), ...ss }; }
  if (max && both.some((d) => k(d) > k(max))) { who((v) => v === "max"); return { validity: "max", start: a, end: b, message: say(msg.max, "max", x), ...ss }; }
  if (maxDays && maxDays > 0 && b && spanDays(a, b) > maxDays) return { validity: "long", start: a, end: b, message: say(msg.long, "long", { ...x, days: String(maxDays) }), ...ss };
  return { validity: "valid", start: a, end: b, ...ss };
}
