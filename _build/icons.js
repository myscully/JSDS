/* =========================================================
   icons.js — 사이트에서 쓰는 아이콘 (assets/icons/{outline|filled}/*.svg, Tabler Icons · MIT)
   - ICON_NAMES: 사이트에 실제로 사용되는 아이콘만 등록 (Iconography 페이지 갤러리도 이 목록으로 구성)
   - node: require("./icons.js") → { ICONS, I, generate }   /  브라우저: generate() 가 만든 icons.gen.js 가 전역 ICONS · I 정의
   - I(name, size=18, {style:"outline"|"filled", label}) → 인라인 <svg> 문자열 (currentColor)
   ========================================================= */
const fs = require("fs"); const path = require("path");
const DIR = path.resolve(__dirname, "..", "assets", "icons");
const ICON_NAMES = [
  // 액션
  "search", "plus", "download", "trash", "pencil", "refresh", "copy", "filter", "x", "check", "dots", "external-link",
  // 탐색
  "chevron-left", "chevron-right", "chevron-down", "arrow-up", "arrow-down", "arrows-sort", "sort-ascending", "sort-descending",
  // 상태 · 피드백
  "info-circle", "alert-triangle", "alert-circle", "circle-check",
  // 도메인 · 내비게이션
  "home", "list", "user", "server", "shield", "bell", "settings", "chart-bar", "calendar", "inbox", "layout-grid",
  // 사이트 크롬
  "moon",
];
function parse(file) {
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const meta = {}; const cm = raw.match(/<!--([\s\S]*?)-->/);
  if (cm) { const c = cm[1].match(/category:\s*(.+)/); const t = cm[1].match(/tags:\s*\[([^\]]*)\]/); if (c) meta.category = c[1].trim(); if (t) meta.tags = t[1].split(",").map(s => s.trim()).filter(Boolean); }
  const inner = raw.replace(/<!--[\s\S]*?-->/g, "").replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>[\s\S]*$/, "").replace(/\s*\n\s*/g, "").replace(/\s{2,}/g, " ").replace(/" \/>/g, '"/>').trim();
  return { paths: inner, ...meta };
}
const ICONS = {};
for (const n of ICON_NAMES) {
  const o = parse(path.join(DIR, "outline", n + ".svg")); const f = parse(path.join(DIR, "filled", n + ".svg"));
  if (!o) throw new Error(`icons.js: assets/icons/outline/${n}.svg 없음`);
  ICONS[n] = { o: o.paths, f: f ? f.paths : null, category: o.category || "", tags: o.tags || [] };
}
const I_SRC = `function I(name, size = 18, o = {}) {
  const ic = ICONS[name]; if (!ic) return "";
  const filled = o.style === "filled" && ic.f;
  const a = filled ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  const lab = o.label ? ' role="img" aria-label="' + o.label + '"' : ' aria-hidden="true"';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="' + size + '" height="' + size + '" ' + a + lab + (o.cls ? ' class="' + o.cls + '"' : "") + ">" + (filled ? ic.f : ic.o) + "</svg>";
}`;
const I = new Function("ICONS", I_SRC + "; return I;")(ICONS);
/* 브라우저용 icons.gen.js 생성 (standalone 셸이 data 파일보다 먼저 로드) */
function generate() {
  const out = `/* 생성 파일 — 원본은 icons.js + assets/icons. 수정하지 마세요. */\nconst ICONS = ${JSON.stringify(ICONS)};\n${I_SRC}\nif (typeof module !== "undefined" && module.exports) module.exports = { ICONS, I };\n`;
  fs.writeFileSync(path.join(__dirname, "icons.gen.js"), out);
  return Object.keys(ICONS).length;
}
module.exports = { ICONS, ICON_NAMES, I, generate };
if (require.main === module) console.log("icons:", generate());
