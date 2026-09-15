// 생성 사이트 검증: node verify.js  (build.js 끝에서도 호출)
// 실패 항목이 있으면 exit 1
const fs = require("fs"); const path = require("path");
const OUT = path.resolve(__dirname, "..");
const LIB = require("./lib.js");
const ICONS_MOD = require("./icons.js"); global.I = ICONS_MOD.I;
const DATA = require("./data.js"); const COMPONENTS = require("./components.data.js"); const PATTERNS = require("./patterns.data.js");

const fails = [], warns = [];
const read = f => fs.readFileSync(path.join(OUT, f), "utf8");
const count = (s, re) => (s.match(re) || []).length;
const article = html => { const a = html.indexOf('<article id="content">'), b = html.indexOf("</article>"); return a < 0 ? html : html.slice(a, b); };

let phTotal = 0; const phPages = [];
for (const sec of ["components", "patterns"]) {
  const keys = LIB.allPages(DATA.SITE, sec).map(p => p.key).filter(k => k !== "overview");
  for (const k of keys) {
    const f = `${sec}/${k}.html`; if (!fs.existsSync(path.join(OUT, f))) { fails.push(`${f}: 파일 없음`); continue; }
    const html = read(f); const body = article(html);
    if (count(body, /<pre\b/g) < 2) fails.push(`${f}: <pre> 2개 미만`);
    const ph = count(body, /class="ph"/g); if (ph) { fails.push(`${f}: 플레이스홀더 .ph ${ph}개`); }
    if (/href="#\//.test(body)) fails.push(`${f}: 변환되지 않은 href="#/" 링크`);
    if (/onclick=/.test(body)) fails.push(`${f}: onclick 속성`);
    if (/<script/i.test(body)) fails.push(`${f}: article 안 <script>`);
    for (const m of body.matchAll(/data-copy="([^"]+)"/g)) if (!new RegExp(`id="${m[1]}"`).test(body)) fails.push(`${f}: data-copy 대상 #${m[1]} 없음`);
    for (const ex of body.split('<section class="example"').slice(1)) { if (!/data-pane="html"/.test(ex) || !/data-pane="react"/.test(ex)) fails.push(`${f}: example 에 html/react pane 누락`); if (!/@jiran\/ds-react/.test(ex)) (sec === "components" ? fails : warns).push(`${f}: React 탭이 패키지 코드가 아님(htmlToJsx 폴백)`); }
    if (!/<title>[^<]+<\/title>/.test(html)) fails.push(`${f}: title 없음`);
    const gl = (body.match(/>[✕⋯‹›↕↑↓▲▼]<\//g) || []).map(s => s[1]); if (gl.length) fails.push(`${f}: 아이콘 대신 글리프 사용 ${[...new Set(gl)].join(" ")}`);
  }
}
// 사이트 전체
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.name.startsWith("_") || e.name === "node_modules" ? [] : e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
for (const f of walk(OUT).filter(f => f.endsWith(".html"))) { const n = count(fs.readFileSync(f, "utf8"), /class="ph"/g); if (n) { phTotal += n; phPages.push(path.relative(OUT, f)); } }
if (phPages.length) warns.push(`플레이스홀더 남은 페이지: ${phPages.join(", ")}`);
for (const n of ICONS_MOD.ICON_NAMES) if (!fs.existsSync(path.join(OUT, "assets/icons/outline", n + ".svg"))) fails.push(`assets/icons/outline/${n}.svg 없음`);
if (!fs.existsSync(path.join(__dirname, "icons.gen.js"))) fails.push("icons.gen.js 없음");
const css = read("assets/style.css"); if (/data:font\/woff2/.test(css)) fails.push("style.css 에 base64 폰트 포함"); if (!/fonts\/PretendardVariable\.woff2/.test(css)) fails.push("style.css 폰트 경로 오류");
if (!fs.existsSync(path.join(OUT, "assets/ds.js"))) fails.push("assets/ds.js 없음");
for (const f of ["components/button.html", "index.html"]) if (fs.existsSync(path.join(OUT, f)) && !/assets\/ds\.js/.test(read(f))) fails.push(`${f}: ds.js 스크립트 태그 없음`);
const app = read("assets/app.js"); const idx = JSON.parse((app.match(/const SEARCH_INDEX=(\[.*?\]);\n/s) || [])[1] || "[]");
const routes = Object.keys(DATA.SITE).flatMap(s => LIB.allPages(DATA.SITE, s)).length; if (idx.length !== routes) fails.push(`SEARCH_INDEX ${idx.length} ≠ 라우트 ${routes}`);
if (!fs.existsSync(path.join(OUT, "resources/react.html"))) fails.push("resources/react.html 없음");
// Foundations: Montage 구성(Overview + Base material 5) 그대로, 옛 페이지 없음
const fnd = fs.readdirSync(path.join(OUT, "foundations")).filter(f => f.endsWith(".html")).sort().join(",");
if (fnd !== "colors.html,elevation.html,grid.html,icons.html,index.html,overview.html,typography.html") fails.push("foundations/ 페이지 구성이 다름: " + fnd);
for (const f of ["colors", "elevation", "grid", "icons", "typography"]) { const b = article(read(`foundations/${f}.html`)); if (!/<h2 /.test(b)) fails.push(`foundations/${f}.html: 섹션(h2) 없음`); if (/href="#\//.test(b)) fails.push(`foundations/${f}.html: 변환되지 않은 href="#/"`); }
if (!/data-doctab="atomic"/.test(read("foundations/colors.html"))) fails.push("foundations/colors.html: Semantic/Atomic 탭 없음");
if (!fs.existsSync(path.join(OUT, "resources/design-token.html"))) fails.push("resources/design-token.html 없음");
if (fs.existsSync(path.join(OUT, "home/overview.html"))) fails.push("home/overview.html 이 생성됨(첫 화면은 루트 index.html 만)");
const jsonPath = path.join(__dirname, "components.json");
if (!fs.existsSync(jsonPath)) fails.push("components.json 없음"); else {
  const j = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  if (j.components.length !== Object.keys(COMPONENTS).length || j.components.length !== 30) fails.push(`components.json 컴포넌트 ${j.components.length}개(30 기대)`);
  if (j.patterns.length !== Object.keys(PATTERNS).length || j.patterns.length !== 11) fails.push(`components.json 패턴 ${j.patterns.length}개(11 기대)`);
  for (const c of [...j.components, ...j.patterns]) { if (!c.examples || !c.examples.length) fails.push(`components.json ${c.key}: 예제 없음`); if (!c.css || c.css.split("\n").length < 2) fails.push(`components.json ${c.key}: CSS 비어 있음`); }
}
console.log(`verify: 실패 ${fails.length} · 경고 ${warns.length} · 남은 .ph ${phTotal}개(${phPages.join(", ") || "없음"})`);
fails.forEach(f => console.log("  ✗ " + f)); warns.forEach(w => console.log("  ! " + w));
if (fails.length) process.exit(1);
