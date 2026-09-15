export type ClassValue = string | number | false | null | undefined | Record<string, boolean | null | undefined>;

/** 클래스 이름 병합. 문자열·falsy·{class: boolean} 객체를 받는다. */
export function cx(...values: ClassValue[]): string {
  const out: string[] = [];
  for (const v of values) {
    if (!v) continue;
    if (typeof v === "string" || typeof v === "number") out.push(String(v));
    else for (const [k, on] of Object.entries(v)) if (on) out.push(k);
  }
  return out.join(" ");
}
