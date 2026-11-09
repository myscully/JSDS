/* Date Picker 의 글자 · 검사 — 순수 함수. 사이트 ds.js(_build/ds.src.js)의 groups · pasteText · check · stepSeg 와 같은 규칙이다.
   표기는 단위마다 고정(YYYY. MM. DD · YYYY. MM · YYYY) — locale 과 무관(사람의 결정 2026-11-09). 키는 기계 형식(YYYY-MM-DD · YYYY-MM · YYYY) */

export type DateUnit = "day" | "month" | "year";
/** 입력의 상태 — 값이 늘 유효한 날짜는 아니다(사람의 요구 2026-11-09) */
export type DateValidity = "empty" | "incomplete" | "invalid" | "min" | "max" | "order" | "valid";

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
export const parseUnit = (s: string | null | undefined, unit: DateUnit) => (unit === "year" ? parseYear(s) : unit === "month" ? parseMonth(s) : parseDate(s));
export const keyOf = (d: Date, unit: DateUnit = "day") => (unit === "year" ? String(d.getFullYear()) : unit === "month" ? formatMonth(d) : formatDate(d));
/** 필드 표기 */
export const showOf = (d: Date, unit: DateUnit = "day") => (unit === "year" ? String(d.getFullYear()) : `${d.getFullYear()}. ${pad(d.getMonth() + 1)}${unit === "month" ? "" : `. ${pad(d.getDate())}`}`);
export const unitStart = (d: Date, unit: DateUnit) => (unit === "year" ? new Date(d.getFullYear(), 0, 1) : unit === "month" ? new Date(d.getFullYear(), d.getMonth(), 1) : new Date(d.getFullYear(), d.getMonth(), d.getDate()));
export const isValidDate = (d: unknown): d is Date => d instanceof Date && !isNaN(d.getTime());
export const placeholderOf = (unit: DateUnit, range: boolean) => { const one = unit === "year" ? "YYYY" : unit === "month" ? "YYYY. MM" : "YYYY. MM. DD"; return range ? `${one} ~ ${one}` : one; };
const DIGITS: Record<DateUnit, number> = { day: 8, month: 6, year: 4 };
const EXAMPLE: Record<DateUnit, string> = { day: "2026. 09. 07", month: "2026. 09", year: "2026" };

/** 숫자열을 조각으로(연 4 · 월 2 · 일 2). 월 첫 자리가 2~9 · 일 첫 자리가 4~9 면 앞에 0 을 붙여 그 조각을 끝낸다(9 → 09).
 *  기간은 앞 날짜가 다 차면 " ~ " 뒤로 넘어간다 */
export function groups(dg: string, unit: DateUnit, range: boolean): string {
  const lens = unit === "year" ? [4] : unit === "month" ? [4, 2] : [4, 2, 2], max = range ? 2 : 1, sides: string[][] = [];
  let cur: string[] = [], g = "", gi = 0;
  for (let i = 0; i < dg.length && sides.length < max; i++) {
    const c = dg.charAt(i);
    if (g === "" && ((gi === 1 && c > "1") || (gi === 2 && c > "3"))) g = "0";
    g += c;
    if (g.length === lens[gi]) { cur.push(g); g = ""; gi++; if (gi === lens.length) { sides.push(cur); cur = []; gi = 0; } }
  }
  if (g) cur.push(g);
  if (cur.length && sides.length < max) sides.push(cur);
  return sides.map((s) => s.join(". ")).join(" ~ ");
}
/** 붙여넣기 · 처음 글자 — 구분자로 나뉜 조각은 자리를 채운다(2026/9/7 → 2026. 09. 07). 친 글자에는 쓰지 않는다: 치는 중인 "2026. 09. 3" 을 3일로 확정하지 않게 */
export function pasteText(s: string, unit: DateUnit, range: boolean): string {
  return groups(String(s ?? "").split("~").slice(0, range ? 2 : 1).map((p) => {
    const g = p.match(/\d+/g) || [];
    return g.length > 1 ? g[0] + g.slice(1).map((x) => (x.length === 1 ? "0" + x : x)).join("") : g.join("");
  }).join(""), unit, range);
}
/** 치는 동안 — 숫자만 남겨 다시 끊는다. 구분자 하나만 지운 Backspace 는 그 앞 숫자를 지운다(구분자는 다시 생기므로). 커서는 같은 숫자 뒤에 둔다 */
export function reformat(value: string, prev: string, caret: number, inputType: string | undefined, unit: DateUnit, range: boolean): { text: string; caret: number } {
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
export function stepText(value: string, caret: number, dir: 1 | -1, unit: DateUnit, range: boolean, today: Date): { text: string; caret: number } {
  const parts = range ? value.split(" ~ ") : [value], side = range && parts.length > 1 && caret > parts[0].length ? 1 : 0, base = side ? parts[0].length + 3 : 0, local = caret - base;
  const segs = (parts[side] || "").split(". "), n = unit === "year" ? 1 : unit === "month" ? 2 : 3, si = Math.min(local <= 4 ? 0 : local <= 8 ? 1 : 2, n - 1);
  const now = [today.getFullYear(), today.getMonth() + 1, today.getDate()], empty = !segs[si] || segs[si].length < (si ? 2 : 4);
  const num = Array.from({ length: n }, (_, i) => (segs[i] && segs[i].length === (i ? 2 : 4) ? +segs[i] : now[i]));
  if (!empty) {
    if (si === 0) num[0] = Math.max(1, Math.min(9999, num[0] + dir));
    else if (si === 1) num[1] = ((num[1] - 1 + dir + 12) % 12) + 1;
    else { const dim = new Date(num[0], num[1], 0).getDate(); num[2] = ((Math.min(num[2], dim) - 1 + dir + dim) % dim) + 1; }
  }
  if (n === 3) num[2] = Math.min(num[2], new Date(num[0], num[1], 0).getDate());   // 1월 31일에서 월을 올리면 2월 28일
  parts[side] = num.map((x, j) => (j ? pad(x) : String(x))).join(". ");
  if (range && side === 0 && parts.length < 2) parts.length = 1;
  return { text: parts.join(" ~ "), caret: base + [4, 8, 12][si] };
}

export interface DatePickerMessages {
  /** 덜 친 날짜 — 뒤에 예시가 붙는다 */
  incomplete: string;
  /** 없는 날짜 — 뒤에 예시가 붙는다 */
  invalid: string;
  /** min 표기 뒤에 붙는다 */
  min: string;
  /** max 표기 뒤에 붙는다 */
  max: string;
  /** 기간의 끝이 시작보다 앞 */
  order: string;
  /** @deprecated incomplete · invalid 로 나뉘었다 — 주면 둘 다에 쓴다 */
  format?: string;
}
/** 기간의 한쪽 상태 — 순서(order)는 두 쪽 사이의 일이라 여기에는 없다. 비운 쪽은 empty */
export type DateSideValidity = Exclude<DateValidity, "order">;
export interface CheckResult { validity: DateValidity; start: Date | null; end: Date | null; message?: string; /** 기간일 때만 — 시작 · 끝 각각 */ sides?: { start: DateSideValidity; end: DateSideValidity } }
/** 입력 검사 — 빈 · 미완성 · 없는 날짜 · 순서 · min · max · 유효. 미완성 · 없는 날짜는 값이 없고, 순서 · 범위 밖은 그 날짜가 남는다 */
export function checkText(text: string, o: { unit: DateUnit; range: boolean; min?: Date | null; max?: Date | null; messages: DatePickerMessages }): CheckResult {
  const { unit, range, min, max, messages: msg } = o, s = String(text ?? "").trim();
  if (!s) return { validity: "empty", start: null, end: null };
  const parts = range ? s.split(/\s*~\s*/) : [s];
  if (range && parts.length < 2) parts.push("");
  const sides = parts.slice(0, range ? 2 : 1).map((p) => {   // 자릿수가 모자라면 미완성 — 치는 중인 "2026. 09. 3" 을 3일로 확정하지 않는다
    if (p.replace(/\D/g, "").length < DIGITS[unit]) return { v: "incomplete" as const, d: null };
    const d = parseUnit(p, unit);
    return d ? { v: "valid" as const, d } : { v: "invalid" as const, d: null };
  });
  const k = (d: Date) => keyOf(d, unit);
  /* 쪽마다의 상태 — 비운 쪽 empty, 그 밖은 전체와 같은 규칙(범위는 그 쪽 날짜만 본다) */
  const sideOf = (p: string, x: (typeof sides)[number]): DateSideValidity => (!p.trim() ? "empty" : x.v !== "valid" ? x.v : min && k(x.d) < k(min) ? "min" : max && k(x.d) > k(max) ? "max" : "valid");
  const ss = range ? { sides: { start: sideOf(parts[0], sides[0]), end: sideOf(parts[1], sides[1]) } } : {};
  const bad = sides.find((x) => x.v !== "valid");
  if (bad) return { validity: bad.v, start: null, end: null, message: (msg.format ?? msg[bad.v as "incomplete" | "invalid"]) + (range ? `${EXAMPLE[unit]} ~ ${EXAMPLE[unit]}` : EXAMPLE[unit]), ...ss };
  const a = sides[0].d!, b = range ? sides[1].d : null, both = [a, b].filter(Boolean) as Date[];
  if (b && b < a) return { validity: "order", start: a, end: b, message: msg.order, ...ss };
  if (min && both.some((d) => k(d) < k(min))) return { validity: "min", start: a, end: b, message: showOf(min, unit) + msg.min, ...ss };
  if (max && both.some((d) => k(d) > k(max))) return { validity: "max", start: a, end: b, message: showOf(max, unit) + msg.max, ...ss };
  return { validity: "valid", start: a, end: b, ...ss };
}
