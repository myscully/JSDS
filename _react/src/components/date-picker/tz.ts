/* 기준 시간대 — dayjs(MIT, 1.11.13 고정) + utc · timezone 플러그인을 패키지 안에서 extend 한다.
   쓰는 쪽은 import 없이 timezone="America/New_York" · "UTC" 를 준다(사람의 요구 2026-11-09). 기본은 사용자 환경(dayjs.tz.guess 와 같다).
   달력은 '달력 날짜'(로컬 연 · 월 · 일의 Date)로 일하고, 바깥과 주고받는 Date 는 그 시간대의 순간이다 — 여기서 둘을 바꾼다 */
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const warned = new Set<string>();
/** 쓸 수 있는 시간대 이름이면 그대로, 없으면 undefined(환경 시간대). 틀린 이름은 경고 한 번 */
export function resolveZone(tz: string | undefined): string | undefined {
  if (!tz) return undefined;
  try { new Intl.DateTimeFormat("en-US", { timeZone: tz }); return tz; }
  catch {
    if (process.env.NODE_ENV !== "production" && !warned.has(tz)) { warned.add(tz); console.warn(`[ds-react] DatePicker timezone="${tz}" 는 IANA 시간대 이름이 아닙니다 — 환경 시간대로 계산합니다.`); }
    return undefined;
  }
}
/** 그 순간이 시간대에서 무슨 날인지 — 달력 날짜(로컬 0시 Date)로 */
export function calendarDateOf(at: Date, tz: string | undefined): Date {
  if (!tz) return new Date(at.getFullYear(), at.getMonth(), at.getDate());
  const d = dayjs(at).tz(tz);
  return new Date(d.year(), d.month(), d.date());
}
/** 그 순간이 시간대에서 몇 시인지 — 그 벽시계를 로컬 Date 로(시각 옵션) */
export function clockDateOf(at: Date, tz: string | undefined): Date {
  if (!tz) return new Date(at.getTime());
  const d = dayjs(at).tz(tz);
  return new Date(d.year(), d.month(), d.date(), d.hour(), d.minute(), d.second());
}
/** 달력 날짜를 시간대의 그 날 0시(순간)로. withTime 이면 그 벽시계의 순간으로 */
export function instantOf(day: Date, tz: string | undefined, withTime = false): Date {
  if (!tz) return withTime ? new Date(day.getTime()) : new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const p = (n: number) => String(n).padStart(2, "0");
  const ymd = `${day.getFullYear()}-${p(day.getMonth() + 1)}-${p(day.getDate())}`;
  return dayjs.tz(withTime ? `${ymd} ${p(day.getHours())}:${p(day.getMinutes())}:${p(day.getSeconds())}` : ymd, tz).toDate();
}
/** 시간대의 오늘 — 달력 날짜 */
export const todayIn = (tz: string | undefined, now: Date = new Date()) => calendarDateOf(now, tz);
