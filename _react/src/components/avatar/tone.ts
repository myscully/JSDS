/** Avatar 색 — 이름으로 정하는 tone 1~6(사람의 결정 2026-11-16). 같은 이름은 어디서나 같은 색이다.
 *  사이트 ds.js avatarTone · 빌드(lib.js withAvatarTone)와 같은 식 — tests/avatar-tone.test.tsx 가 대조한다.
 *  1 파랑 · 2 시안 · 3 라임 · 4 바이올렛 · 5 퍼플 · 6 핑크(상태색 빨강 · 주황 · 초록은 쓰지 않음) */
export type AvatarTone = 1 | 2 | 3 | 4 | 5 | 6;
export function avatarTone(name: string | null | undefined): AvatarTone {
  let h = 0;
  for (const ch of String(name ?? "").trim()) h = (Math.imul(h, 31) + (ch.codePointAt(0) ?? 0)) >>> 0;
  return ((h % 6) + 1) as AvatarTone;
}
