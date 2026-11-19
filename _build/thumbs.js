/* Components Overview 카드 썸네일(2026-11-19) — Figma Overview › _Local components › Thumbnails 의 `Thumbnail / <이름>` 46개.
   원본은 `thumbs/components/<페이지 키>.svg`(Figma 에서 SVG 로 내보내 썸네일 그룹만 남긴 것 — 색은 Figma 값 그대로, 손으로 고치지 않음).
   빌드가 읽어 색을 토큰으로 바꾼다 — 다크 테마 · 제품 색을 따르게. 표에 없는 색이 나오면 빌드를 멈춘다(raw 색이 사이트에 새지 않게).
   마스크 id 는 페이지 안에서 겹치지 않게 키를 붙인다. */
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "thumbs", "components");

/* Figma 칠(색 · 불투명도) → 토큰. 불투명도는 Figma 가 내보낸 자릿수가 둘이라(0.2784 · 0.278431) 소수 둘째 자리로 묶는다 */
const COLORS = {
  "white@1": "--surface-elevated-primary",            // 카드 · 입력 면(라이트 흰 · 다크 cool-17)
  "#292A2D@1": "--foreground-neutral-strong",         // cool-neutral-20
  "#292A2D@0.88": "--foreground-neutral-secondary",   // cool-neutral-22 88% 와 가까움
  "#37383C@0.88": "--foreground-neutral-secondary",
  "#37383C@0.61": "--foreground-neutral-tertiary",    // cool-neutral-25 61%
  "#37383C@0.28": "--foreground-neutral-quaternary",  // cool-neutral-25 28%
  "#37383C@0.12": "--line-neutral-secondary",         // Accordion 구분선 하나(가장 가까운 선 토큰)
  "#70737C@0.12": "--surface-neutral-secondary",      // cool-neutral-50 12%
  "#E72727@1": "--foreground-negative-strong",        // red-40 #E52222 와 가까움
  "#0066FF@1": "--foreground-brand-primary",          // Link 글자 · 밑줄 — 제품 색을 따름
};

function convert(key, svg) {
  const unknown = new Set();
  const out = svg
    .replace(/<!--[\s\S]*?-->\n?/g, "")
    .replace(/<(path|rect|circle|ellipse|line|polyline|polygon|g)\b([^>]*?)(\/?)>/g, (m, tag, attrs, self) => {
      const style = [];
      for (const prop of ["fill", "stroke"]) {
        const c = attrs.match(new RegExp(`\\s${prop}="([^"]*)"`)); if (!c || c[1] === "none") continue;
        const o = attrs.match(new RegExp(`\\s${prop}-opacity="([^"]*)"`));
        const k = `${c[1]}@${o ? +(+o[1]).toFixed(2) : 1}`;
        if (!COLORS[k]) { unknown.add(k); continue; }
        style.push(`${prop}:var(${COLORS[k]})`);
        attrs = attrs.replace(c[0], "").replace(o ? o[0] : "", "");
      }
      return `<${tag}${attrs}${style.length ? ` style="${style.join(";")}"` : ""}${self}>`;
    })
    .replace(/\bid="m"/g, `id="thm-${key}"`).replace(/url\(#m\)/g, `url(#thm-${key})`)
    .replace(/<svg\b/, `<svg class="ov-thumb" aria-hidden="true" focusable="false"`)
    .replace(/\n/g, "");
  if (unknown.size) throw new Error(`thumbs/components/${key}.svg — 토큰 표에 없는 색: ${[...unknown].join(", ")} (thumbs.js COLORS 에 더하세요)`);
  if (/#[0-9A-Fa-f]{3,8}\b|="white"|="black"/.test(out.replace(/url\(#[^)]*\)/g, ""))) throw new Error(`thumbs/components/${key}.svg — 바꾸지 못한 raw 색이 남았습니다`);
  return out;
}

/** { 페이지 키: 인라인 SVG 문자열 } */
function load() {
  const res = {};
  for (const f of fs.readdirSync(DIR).filter(f => f.endsWith(".svg")).sort()) res[f.slice(0, -4)] = convert(f.slice(0, -4), fs.readFileSync(path.join(DIR, f), "utf8"));
  return res;
}
module.exports = { load, COLORS, DIR };
