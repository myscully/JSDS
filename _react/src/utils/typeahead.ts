/* 글자로 항목 찾기 — 사이트 ds.js 의 typeahead 와 같은 규칙. 0.5초 안의 글자를 이어 붙이고, 같은 글자를 반복하면 다음 항목으로. 'ㅂ' 은 초성으로 '보안팀' 에 맞는다 */
const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
export const cho = (s: string) => s.replace(/[가-힣]/g, (c) => CHO[Math.floor((c.charCodeAt(0) - 44032) / 588)]);

export interface TypeaheadState {
  s: string;
  t: number;
}

export function typeahead(state: TypeaheadState, key: string, items: HTMLElement[], active: Element | null): HTMLElement | undefined {
  const now = Date.now();
  if (now - state.t > 500) state.s = "";
  state.t = now;
  state.s += key.toLowerCase();
  const repeat = state.s.split("").every((c) => c === state.s[0]);
  const q = repeat ? state.s[0] : state.s;
  const i = items.indexOf(active as HTMLElement);
  const from = repeat ? i + 1 : Math.max(i, 0);
  return [...items.slice(from), ...items.slice(0, from)].find((x) => {
    const label = ((x.querySelector(".menu-name") ?? x).textContent ?? "").trim().toLowerCase();   // 설명 줄(.menu-desc)은 보지 않는다(2026-11-23)
    return label.startsWith(q) || cho(label).startsWith(q);
  });
}
