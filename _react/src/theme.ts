/* 테마 · Accent(제품 메인 컬러) 유틸 — 사이트 assets/app.js 의 accentScale 과 동일한 계산 */

export type AccentScale = Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>;

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

/** 제품 메인 컬러 HEX 하나로 --accent-50~900 스케일을 만든다 (600 = 원값) */
export function accentScale(hex: string): AccentScale {
  const [h, s] = hexToHsl(hex);
  const L: Record<number, number> = { 50: 96, 100: 90, 200: 80, 300: 68, 400: 56, 500: 46, 700: 30, 800: 22, 900: 14 };
  const out = {} as AccentScale;
  for (const [k, l] of Object.entries(L)) (out as Record<string, string>)[k] = hslToHex(h, Math.min(100, s * (Number(k) < 300 ? 0.7 : 1)), l);
  out[600] = hex.toUpperCase();
  return out;
}

/** :root 에 --accent-* 를 주입. 앱 시작 시 한 번 호출 */
export function applyAccent(hex: string, root: HTMLElement = document.documentElement): AccentScale {
  const sc = accentScale(hex);
  for (const [k, v] of Object.entries(sc)) root.style.setProperty(`--accent-${k}`, v);
  root.dataset.accent = hex.toUpperCase();
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
