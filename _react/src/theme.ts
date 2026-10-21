/* 테마 · Accent(제품 메인 컬러) 유틸 — 사이트 assets/app.js 의 accentScale 과 동일한 계산 */

export type AccentScale = Record<40 | 45 | 50 | 55 | 60, string>;

function hexToHsl(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    switch (mx) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}
function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return "#" + [f(0), f(8), f(4)].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
}

/** 제품 메인 컬러 HEX 하나로 --prod-40~60 스케일을 만든다 (50 = 원값).
 *  규칙은 참조 시스템의 blue 램프에서 읽어 낸 것이다 — 단계 번호가 곧 HSL 명도 %이고 색조·채도는 고정이다.
 *  ΔL 은 그 램프에서 실측했다: 40 −9.02 · 45 −3.922 · 55 +5.098 · 60 +10.0 %p.
 *  #0066FF 를 넣으면 네 단계가 정확히 재현되고 55 만 초록 채널이 1/255 어긋난다(#1A76FF vs #1A75FF) —
 *  참조 램프의 그 값이 곡선에서 살짝 벗어나 있기 때문이다. 기본 제품은 이 함수를 타지 않고
 *  CSS 가 var(--prod-50, var(--blue-50)) 로 램프 HEX 를 직접 쓰므로, 기본 상태는 참조 시스템과 완전히 같다.
 *  다섯 단계뿐인 이유는 시멘틱이 brand 를 그 다섯에서만 집기 때문이다. */
const BRAND_DL: Record<number, number> = { 40: -9.02, 45: -3.922, 50: 0, 55: 5.098, 60: 10.0 };
export function accentScale(hex: string): AccentScale {
  const [h, s, l] = hexToHsl(hex);
  const out = {} as Record<number, string>;
  for (const k of Object.keys(BRAND_DL).map(Number)) out[k] = hslToHex(h, s, Math.max(0, Math.min(100, l + BRAND_DL[k])));
  out[50] = hex.toUpperCase();
  return out as AccentScale;
}

function relLum(hex: string): number {
  const c = [0, 1, 2].map((i) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(a: string, b: string): number {
  const [x, y] = [relLum(a) + 0.05, relLum(b) + 0.05];
  return Math.max(x, y) / Math.min(x, y);
}
/** 제품 색 위에서 흰 글자가 받쳐지는 최소 대비. 면 위 글자는 늘 흰색이다 */
export const BRAND_LABEL_MIN = 4.5;
/** 흰 글자를 받치지 못하는 '밝은' 제품 색인가.
 *  **적응 스위치가 아니라 검증 술어다** — 0.8.0 부터 시스템은 밝은 제품에 맞춰 휘지 않는다.
 *  참 이면 그 색은 Brand 슬롯에 쓸 수 없고, 어두운 변형을 만들어 넣어야 한다.
 *  기준이 라이트인 이유: 다크 면은 한 단계 밝아져(brand-60) 참조의 기본색 #0066FF 조차 3.54 다. */
export function isLightAccent(hex: string): boolean {
  return ratio(hex, "#FFFFFF") < BRAND_LABEL_MIN;
}

/** :root 에 제품 램프를 --prod-* 로 주입. 앱 시작 시 한 번 호출.
 *  --brand-* 가 아니라 --prod-* 인 이유: --prod-* 는 '제품이 넣는 입력'이고 --brand-* 는 '테마가 해석한 결과'다.
 *  :root 가 var(--prod-N, var(--blue-N)) 으로 받아, 라이트는 50·45·40 · 다크는 50·55·60 을 집는다.
 *  참조 시스템에는 면 위 글자 역할이 없어 라벨이 늘 흰색이다 — 그래서 제품 색에 제약이 걸린다(isLightAccent). */
export function applyAccent(hex: string, root: HTMLElement = document.documentElement): AccentScale {
  const sc = accentScale(hex);
  for (const [k, v] of Object.entries(sc)) root.style.setProperty(`--prod-${k}`, v);
  root.dataset.accent = hex.toUpperCase();
  /* 밝은 제품에 맞춰 뒤집던 규칙(data-accent-light)을 걷어냈다 — 이제는 제약이고, 못 넘으면 알린다 */
  if (isLightAccent(hex))
    console.warn(`[ds] 제품 색 ${hex} 위에서 흰 글자가 ${ratio(hex, "#FFFFFF").toFixed(2)} 로 ${BRAND_LABEL_MIN} 에 못 미칩니다 — 어두운 변형을 쓰세요`);
  return sc;
}

export type Theme = "light" | "dark" | null;
/** <html data-theme> 설정. null 이면 시스템(prefers-color-scheme) 따름 */
export function setTheme(theme: Theme, root: HTMLElement = document.documentElement): void {
  if (theme) root.setAttribute("data-theme", theme);
  else root.removeAttribute("data-theme");
}
export function getTheme(root: HTMLElement = document.documentElement): Theme {
  const t = root.getAttribute("data-theme");
  return t === "light" || t === "dark" ? t : null;
}
