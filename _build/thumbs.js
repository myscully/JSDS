/* Overview 카드 썸네일 — Figma 에서 SVG 로 내보내 썸네일 그룹만 남긴 원본(색은 Figma 값 그대로, 손으로 고치지 않음).
   - Components(2026-11-19): `thumbs/components/<페이지 키>.svg` 46개 — Figma Overview › _Local components › Thumbnails 의 `Thumbnail / <이름>`.
   - Patterns(2026-11-20): `thumbs/patterns/<페이지 키>.svg` 22개 — Figma Patterns › Overview › Patterns Overview · 1440 › ov-grid 의 카드 썸네일.
   빌드가 읽어 색을 토큰으로 바꾼다 — 다크 테마 · 제품 색을 따르게. 표에 없는 색이 나오면 빌드를 멈춘다(raw 색이 사이트에 새지 않게).
   마스크(<mask>) 안은 바꾸지 않는다 — 명도 마스크라 흰색이어야 보인다(토큰으로 바꾸면 다크에서 면이 어두워져 그림이 사라진다).
   마스크 id(m · m1 …)는 페이지 안에서 겹치지 않게 키를 붙인다. */
const fs = require("fs"), path = require("path");
const SECTIONS = ["components", "patterns"];
const dirOf = (sec) => path.join(__dirname, "thumbs", sec);
const DIR = dirOf("components");

/* Figma 칠(색 · 불투명도) → 토큰. 불투명도는 Figma 가 내보낸 자릿수가 둘이라(0.2784 · 0.278431) 소수 둘째 자리로 묶는다.
   "토큰/0.12" 는 토큰 색에 불투명도를 남긴다(같은 뜻의 반투명 토큰이 없을 때) */
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
  /* 패턴 썸네일(2026-11-20)에서 더함 */
  "#2E2F33@0.88": "--foreground-neutral-secondary",   // cool-neutral-22 88% — 토큰 값 그대로
  "#2E2F33@0.12": "--surface-neutral-secondary",      // 감사 로그 막대 면(cool-neutral-50 12% 와 가까움)
  "#E72727@0.1": "--surface-negative-primary",        // 위험 작업 확인의 삭제 버튼 면(red-50 8% 와 가까움)
  "white@0.12": "--surface-elevated-primary/0.12",    // 입력 폼 주 버튼(진한 면) 위 글자 자리 — 버튼과 함께 뒤집힌다
};

function convert(key, svg, sec = "components") {
  const unknown = new Set(), masks = [];
  const out = svg
    .replace(/<!--[\s\S]*?-->\n?/g, "")
    .replace(/<mask\b[\s\S]*?<\/mask>/g, (m) => (masks.push(m), `\u0000${masks.length - 1}\u0000`))
    .replace(/<(path|rect|circle|ellipse|line|polyline|polygon|g)\b([^>]*?)(\/?)>/g, (m, tag, attrs, self) => {
      const style = [];
      for (const prop of ["fill", "stroke"]) {
        const c = attrs.match(new RegExp(`\\s${prop}="([^"]*)"`)); if (!c || c[1] === "none") continue;
        const o = attrs.match(new RegExp(`\\s${prop}-opacity="([^"]*)"`));
        const k = `${c[1]}@${o ? +(+o[1]).toFixed(2) : 1}`;
        if (!COLORS[k]) { unknown.add(k); continue; }
        const [tok, op] = COLORS[k].split("/");
        style.push(`${prop}:var(${tok})`); if (op) style.push(`${prop}-opacity:${op}`);
        attrs = attrs.replace(c[0], "").replace(o ? o[0] : "", "");
      }
      return `<${tag}${attrs}${style.length ? ` style="${style.join(";")}"` : ""}${self}>`;
    })
    .replace(/\u0000(\d+)\u0000/g, (m, i) => masks[i])
    .replace(/\bid="m(\d*)"/g, (m, n) => `id="thm-${key}${n ? "-" + n : ""}"`).replace(/url\(#m(\d*)\)/g, (m, n) => `url(#thm-${key}${n ? "-" + n : ""})`)
    .replace(/<svg\b/, `<svg class="ov-thumb" aria-hidden="true" focusable="false"`)
    .replace(/\n/g, "");
  if (unknown.size) throw new Error(`thumbs/${sec}/${key}.svg — 토큰 표에 없는 색: ${[...unknown].join(", ")} (thumbs.js COLORS 에 더하세요)`);
  if (/#[0-9A-Fa-f]{3,8}\b|="white"|="black"/.test(stripMasks(out).replace(/url\(#[^)]*\)/g, ""))) throw new Error(`thumbs/${sec}/${key}.svg — 바꾸지 못한 raw 색이 남았습니다`);
  return out;
}

/* 마스크 안(명도 마스크의 흰색)은 색 검사에서 뺀다 — verify 도 같은 함수를 쓴다 */
const stripMasks = (s) => s.replace(/<mask\b[\s\S]*?<\/mask>/g, "");

/** { 페이지 키: 인라인 SVG 문자열 } — sec = components | patterns */
function load(sec = "components") {
  if (!SECTIONS.includes(sec)) throw new Error(`thumbs.js — 모르는 섹션 ${sec}`);
  const dir = dirOf(sec), res = {};
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith(".svg")).sort()) res[f.slice(0, -4)] = convert(f.slice(0, -4), fs.readFileSync(path.join(dir, f), "utf8"), sec);
  return res;
}
module.exports = { load, COLORS, DIR, SECTIONS, dirOf, stripMasks };
