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
/* 다크 토큰은 @media (prefers-color-scheme:dark) 와 :root[data-theme="dark"] 에 **같은 내용이 두 번** 들어간다.
   한쪽만 고치면 OS 다크와 수동 다크가 갈리는데, 그걸 검사하는 것이 지금까지 없었다 —
   contrast.js 는 data-theme 속성만 세팅해 재므로 @media 쪽은 측정조차 되지 않는다.
   파일 주석이 경고만 하고 있던 것을 검사로 올린다. */
{
  const src = fs.readFileSync(path.join(__dirname, "style.src.css"), "utf8");
  const body = (sel) => {
    const i = src.indexOf(sel + "{");
    if (i < 0) return null;
    let d = 1, j = i + sel.length + 1;
    const start = j;
    while (j < src.length && d > 0) {
      if (src[j] === "/" && src[j + 1] === "*") { const e = src.indexOf("*/", j + 2); j = e < 0 ? src.length : e + 2; continue; }
      if (src[j] === "{") d++; else if (src[j] === "}") d--;
      j++;
    }
    return src.slice(start, j - 1);
  };
  for (const [media, direct] of [
    ['@media (prefers-color-scheme:dark){:root:not([data-theme="light"])', ':root[data-theme="dark"]'],
    ['@media (prefers-color-scheme:dark){:root:not([data-theme="light"])[data-accent-neutral]', ':root[data-theme="dark"][data-accent-neutral]'],
  ]) {
    const a2 = body(media), b2 = body(direct);
    if (a2 === null || b2 === null) fails.push(`style.src.css: 다크 블록 쌍을 찾지 못했다 — ${direct}`);
    else if (a2 !== b2) fails.push(`style.src.css: 다크 블록 쌍이 다르다 — ${direct} 와 @media 판이 갈렸다(OS 다크와 수동 다크가 다른 색이 된다)`);
  }
}

/* 주석 열림·닫힘이 짝인지 — 선언을 지울 때 여러 줄 주석의 한쪽만 남기기 쉽고,
   열림 없는 닫힘 표시는 파서가 '다음 세미콜론까지'를 통째로 버려서 바로 뒤의 선언 하나가 조용히 사라진다.
   3차에서 다크 --shadow-xs 가 이렇게 유실됐고, 다크 블록 두 벌에 같은 고아가 있었던 탓에
   MD5 쌍 검사까지 통과했다 — 바이트 일치는 유효성이 아니다 */
for (const f of ["assets/style.css"]) {
  const t = read(f);
  let depth = 0, i = 0;
  while (i < t.length - 1) {
    if (t[i] === "/" && t[i + 1] === "*") { depth++; i += 2; continue; }
    if (t[i] === "*" && t[i + 1] === "/") { depth--; if (depth < 0) { fails.push(`${f}: 열림 없는 주석 닫힘 (문자 ${i}) — 바로 뒤 선언이 파서에게 버려진다`); break; } i += 2; continue; }
    i++;
  }
  if (depth > 0) fails.push(`${f}: 닫히지 않은 주석 ${depth}개`);
}

const css = read("assets/style.css"); if (/data:font\/woff2/.test(css)) fails.push("style.css 에 base64 폰트 포함"); if (!/fonts\/PretendardVariable\.woff2/.test(css)) fails.push("style.css 폰트 경로 오류");
if (!fs.existsSync(path.join(OUT, "assets/ds.js"))) fails.push("assets/ds.js 없음");
for (const f of ["components/button.html", "index.html"]) if (fs.existsSync(path.join(OUT, f)) && !/assets\/ds\.js/.test(read(f))) fails.push(`${f}: ds.js 스크립트 태그 없음`);
const app = read("assets/app.js"); const idx = JSON.parse((app.match(/const SEARCH_INDEX=(\[.*?\]);\n/s) || [])[1] || "[]");
const routes = Object.keys(DATA.SITE).flatMap(s => LIB.allPages(DATA.SITE, s)).length; if (idx.length !== routes) fails.push(`SEARCH_INDEX ${idx.length} ≠ 라우트 ${routes}`);
if (!fs.existsSync(path.join(OUT, "resources/react.html"))) fails.push("resources/react.html 없음");
// Home › 시작하기: 페이지 존재 · 복사 대상 id · 링크 변환 · 첫 화면 CTA
if (!fs.existsSync(path.join(OUT, "home/getting-started.html"))) fails.push("home/getting-started.html 없음");
else { const gs = article(read("home/getting-started.html")); for (const m of gs.matchAll(/data-copy="([^"]+)"/g)) if (!new RegExp(`id="${m[1]}"`).test(gs)) fails.push(`home/getting-started.html: data-copy 대상 #${m[1]} 없음`); if (/href="#\//.test(gs)) fails.push('home/getting-started.html: 변환되지 않은 href="#/"'); if (!/data-doctab="designer"/.test(gs) || !/class="guide-steps"/.test(gs)) fails.push("home/getting-started.html: 대상별 탭·단계 목록 없음"); if (!/id="platforms"/.test(gs) || !/1024–1279/.test(gs)) fails.push("home/getting-started.html: 지원 환경 표 없음"); }
if (!/href="home\/getting-started\.html"/.test(read("index.html"))) fails.push("index.html: Getting started 링크 없음");
// Foundations: 참조 구성(Overview + Base material 5) 그대로, 옛 페이지 없음
const fnd = fs.readdirSync(path.join(OUT, "foundations")).filter(f => f.endsWith(".html")).sort().join(",");
if (fnd !== "colors.html,elevation.html,grid.html,icons.html,index.html,overview.html,typography.html") fails.push("foundations/ 페이지 구성이 다름: " + fnd);
for (const f of ["colors", "elevation", "grid", "icons", "typography"]) { const b = article(read(`foundations/${f}.html`)); if (!/<h2 /.test(b)) fails.push(`foundations/${f}.html: 섹션(h2) 없음`); if (/href="#\//.test(b)) fails.push(`foundations/${f}.html: 변환되지 않은 href="#/"`); }
if (!/data-doctab="atomic"/.test(read("foundations/colors.html"))) fails.push("foundations/colors.html: Semantic/Atomic 탭 없음");
if (!fs.existsSync(path.join(OUT, "resources/design-token.html"))) fails.push("resources/design-token.html 없음");
if (fs.existsSync(path.join(OUT, "home/overview.html"))) fails.push("home/overview.html 이 생성됨(첫 화면은 루트 index.html 만)");
const jsonPath = path.join(__dirname, "components.json");
if (!fs.existsSync(jsonPath)) fails.push("components.json 없음"); else {
  const j = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  if (j.components.length !== Object.keys(COMPONENTS).length || j.components.length !== 31) fails.push(`components.json 컴포넌트 ${j.components.length}개(31 기대)`);
  if (j.patterns.length !== Object.keys(PATTERNS).length || j.patterns.length !== 11) fails.push(`components.json 패턴 ${j.patterns.length}개(11 기대)`);
  for (const c of [...j.components, ...j.patterns]) { if (!c.examples || !c.examples.length) fails.push(`components.json ${c.key}: 예제 없음`); if (!c.css || c.css.split("\n").length < 2) fails.push(`components.json ${c.key}: CSS 비어 있음`); }
}
/* 색만으로 의미를 전달하지 않는다 — 심각도 다섯 색은 회색조로 분리할 수 없으므로(상태색 램프를 공유하는 한
   만들 수도 없습니다) 1.4.1 준수는 전적으로 라벨 병기에 의존합니다. 그 라벨을 검사하는 것이 지금까지 없었습니다.
   도넛·밴드는 그래픽이라 접근 이름이 있어야 하고, 표의 좌측 막대(.sev-cell)는 같은 칸 안에 글자가 있어야 합니다. */
for (const f of walk(OUT).filter(f => f.endsWith(".html"))) {
  const rel = path.relative(OUT, f), html = article(read(rel));
  for (const [sel, re] of [[".donut", /<div class="donut"[^>]*>/g], [".sev-band", /<div class="sev-band"[^>]*>/g]])
    for (const m of html.match(re) || []) if (!/aria-label=|aria-hidden="true"/.test(m)) fails.push(`${rel}: ${sel} 에 접근 이름도 aria-hidden 도 없다 — 색만으로 심각도를 전달한다`);
  /* .sev-cell 은 여는 태그부터 닫는 </td>/</div> 까지에 글자가 있어야 한다 */
  for (const m of html.matchAll(/<(td|div)([^>]*class="[^"]*sev-cell[^"]*"[^>]*)>([\s\S]*?)<\/\1>/g))
    if (!/[가-힣A-Za-z0-9]/.test(m[3].replace(/<[^>]*>/g, ""))) fails.push(`${rel}: .sev-cell 에 라벨 글자가 없다 — 3px 막대 색만 남는다`);
}

/* 상호작용 면은 **틴트 쌍**을 써야 한다 — --surface-neutral-secondary → --surface-neutral-strong.
   --background-neutral-secondary 는 불투명한 '페이지 배경' 토큰이고, 다크에서는 가장 어두운 면이다.
   그걸 hover 에 쓰면 라이트에서는 어두워지는데 다크에서는 더 어두워졌다가 눌림에서 다시 밝아져
   **방향이 뒤집힌다**. 표 행·메뉴 항목 등 여덟 곳이 그랬다.
   사이트 크롬(코드 패널 버튼 등)은 제품 컴포넌트가 아니므로 샘플 블록만 본다 */
{
  const a = css.indexOf("/* ---------- Live component samples ---------- */");
  const b = css.indexOf("/* ---------- /Live component samples ---------- */");
  const body = css.slice(a, b).replace(/\/\*[\s\S]*?\*\//g, "");
  for (const m of body.matchAll(/([^{}\n]*:hover[^{}\n]*)\{([^{}]*)\}/g))
    if (/background:\s*var\(--background-neutral-secondary\)/.test(m[2]))
      fails.push(`${m[1].trim()} 이 hover 에 --background-neutral-secondary 를 쓴다 — 상호작용 면은 틴트 쌍(--surface-neutral-secondary → -strong)이어야 다크에서 방향이 뒤집히지 않는다`);
}

/* 제품 색 제약 — 면 위 글자(--brand-label)는 늘 흰색이므로, 제품 색이 그 흰 글자를 받쳐야 한다.
   종전에는 밝은 제품에 맞춰 글자를 뒤집는 적응(data-accent-light)이 있었는데 걷어냈다:
   면을 어둡게 내리는 길은 다크에서 버튼이 캔버스에 묻혀 막혀 있고, 적응을 두면 참조에 없는 분기가 남는다.
   적응을 걷어낸 자리를 이 가드가 메운다 — 규격 미달 제품이 들어오면 빌드가 막는다.
   기준은 제품 HEX 자체(brand-50)다. 다크 rest 도 같은 단계라 이 검사 하나가 두 테마의 rest 를 받친다.
   라이트 hover·pressed 는 더 어두워 자동으로 통과하고, 다크 hover·pressed 는 밝아지는 쪽이라 advisory 다 */
{
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const L = (hex) => { const c = [0, 1, 2].map((i) => lin(parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16))); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const onWhite = (hex) => 1.05 / (L(hex) + 0.05);
  const hsl = (hex) => { const n = parseInt(hex.slice(1), 16), r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, sat = 0; const l = (mx + mn) / 2;
    if (mx !== mn) { const d = mx - mn; sat = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = (mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4) / 6; }
    return [h * 360, sat * 100]; };
  /* 상태색 색상환 표는 app.src.js 가 하나의 출처다 — 여기 베껴 두면 드리프트한다.
     실제로 종전 표가 램프와 20도 어긋난 적이 있다. 못 읽으면 조용히 넘기지 않고 실패시킨다 */
  const hueSrc = fs.readFileSync(path.join(__dirname, "app.src.js"), "utf8");
  const hueM = hueSrc.match(/const STATUS_HUES = \[([^\]]+)\]/);
  if (!hueM) fails.push("app.src.js 에서 STATUS_HUES 를 읽지 못했다 — 제품 색 제약을 검사할 수 없다");
  const HUES = hueM ? hueM[1].split(",").map((x) => parseFloat(x)) : [];
  const clashes = (hex) => { const [h, sat] = hsl(hex); if (sat < 20) return false;
    return HUES.some((t) => { const d = Math.abs(h - t) % 360; return Math.min(d, 360 - d) < 15; }); };
  for (const p2 of require("./data.js").PRODUCTS) {
    /* 상태색과 겹치는 제품은 중립 램프로 갈아끼워지므로 자기 색을 면에 쓰지 않는다 — 제약 대상이 아니다 */
    if (clashes(p2.hex)) continue;
    const r = onWhite(p2.hex);
    if (r < 4.5) fails.push(`제품 색 ${p2.name}(${p2.hex}) 위에서 흰 글자가 ${r.toFixed(2)} — Brand 면의 글자는 늘 흰색이라 4.5 를 넘어야 한다`);
  }
}

/* 값 대조 — 시멘틱 75×2 와 램프가 참조 시스템의 정의와 한 글자까지 같은지.
   "값까지 동일하게 교체"가 이번 설계의 정의이므로 이것이 1차 방어선이다:
   여기가 틀리면 대비·행동 검사가 다 통과해도 틀린 것이다. 정의는 reference-tokens.js 에 코드로 있다 */
for (const d of require("./reference-tokens.js").diff(css)) fails.push(`참조 시스템과 다름 — ${d}`);

/* CSS 안의 var() 가 전부 선언된 토큰을 가리키는지.
   센티넬 가드는 '쌍 선언에 등장하는 토큰'만 보고, data-token 가드는 HTML 속성만 본다 —
   그 사이에 구멍이 있었다: 어느 쪽에도 안 적힌 이름을 CSS 가 참조하면 상속색으로 떨어지고 빌드는 녹색이었다.
   이번에 둘이 걸렸다 — .lead 의 --text-pri(선언된 적 없는 오타)와 icons-css.js 가 삽입한 묵은 이름들.
   컴포넌트 지역 변수(인라인 style 이나 규칙 안에서 정의하는 것)는 토큰이 아니므로 예외 목록에 적는다 */
{
  const cut = css.indexOf("*{box-sizing");
  const declared = new Set([...css.slice(0, cut).matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
  const LOCAL = ["--checker-bg", "--cols", "--cols-sm", "--cols-xs", "--p"];
  const used = new Set([...css.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]));
  const missing = [...used].filter((t) => !declared.has(t) && !t.startsWith("--prod-") && !LOCAL.includes(t)).sort();
  for (const t of missing) fails.push(`style.css: var(${t}) 를 쓰는데 선언이 없다 — 그 자리는 상속색으로 떨어진다`);
  /* 생성 HTML 의 인라인 style 도 같은 구멍이다 — foundations.js 의 히어로·Do/Don't 가 토큰을 맨 문자열로 넘긴다.
     CSS 만 보는 검사로는 안 잡히고, data-token 검사는 속성만 본다 */
  for (const f of walk(OUT).filter((x) => x.endsWith(".html"))) {
    const rel = path.relative(OUT, f);
    const bad = [...new Set([...read(rel).matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]))]
      .filter((t) => !declared.has(t) && !t.startsWith("--prod-") && !LOCAL.includes(t)).sort();
    for (const t of bad) fails.push(`${rel}: 인라인 style 이 var(${t}) 를 쓰는데 선언이 없다`);
  }
  /* 문서의 코드 예시(<pre>)가 **선언**하는 토큰도 본다. var() 가드는 쓰는 쪽만 보므로
     '--accent-50:#EFF2FA' 처럼 죽은 이름을 선언만 하는 예시는 통과했다 —
     Getting started 의 제품 컬러 CSS 가 개명 뒤로도 옛 열 단계를 그대로 싣고 있었다.
     복사해 붙이라고 둔 코드라, 틀리면 그대로 제품에 들어간다 */
  const unesc = (t) => t.replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
  for (const f of walk(OUT).filter((x) => x.endsWith(".html"))) {
    const rel = path.relative(OUT, f);
    const seen = new Set();
    for (const m of read(rel).matchAll(/<pre[^>]*>([\s\S]*?)<\/pre>/g)) {
      const code = unesc(m[1]);
      for (const d of [...code.matchAll(/(--[a-z0-9-]+)\s*:/g), ...code.matchAll(/var\((--[a-z0-9-]+)/g)]) {
        const t = d[1];
        if (declared.has(t) || t.startsWith("--prod-") || LOCAL.includes(t) || seen.has(t)) continue;
        seen.add(t);
        fails.push(`${rel}: 코드 예시가 ${t} 를 쓰는데 선언에 없다 — 붙여 넣으면 아무 일도 하지 않는다`);
      }
    }
  }
  /* 컴포넌트의 figma 필드(components.json 으로 나간다)도 같은 구멍이다 — Indicator 가 개명 전 이름
     --graphic-muted 를 들고 있었고, 점 색도 CSS 와 다른 토큰이었다. 이 필드로 Figma 를 맞추면 없는 토큰이 간다 */
  for (const [k, c] of Object.entries(COMPONENTS)) {
    if (!c || typeof c !== "object" || !c.figma) continue;
    const bad = [...new Set([...JSON.stringify(c.figma).matchAll(/"(--[a-z0-9-]+)"/g)].map((m) => m[1]))].filter((t) => !declared.has(t)).sort();
    for (const t of bad) fails.push(`components.data.js ${k}.figma: ${t} 가 선언에 없다 — 이 필드로 Figma 를 맞추면 없는 토큰이 간다`);
  }
  /* 복사용 CSS 가 예제가 쓰는 클래스를 다 담는지 — Steps 완료 숨김 문구가 .sr-only 없이 붙어 나가 화면에 보이던 결함(ec1c8e6)과
     같은 구멍이 15쪽에 있었다(Card 예제의 .btn · .tag …). 시스템에 규칙이 있는 클래스만 본다 — 사이트 전용 클래스는 붙여 넣을 대상이 아니다.
     이름이 어딘가에 나오는지만 보면 덮어쓰기만 실린 것을 놓친다 — Tab 예제의 .count 는 .tabs .tab .count 만 실리고
     .count{display:inline-grid…} 가 빠져 배지 모양이 달랐다. 그래서 자기 규칙(셀렉터가 .x 하나 — 의사 클래스만 붙은 것)이 시스템에 있으면
     그것도 실려야 한다. ".x 로 시작"으로 셌더니 .btn 을 빌리며 함께 실린 .empty .btn 이 .empty 의 자기 규칙으로 셈됐다 */
  {
    const src = fs.readFileSync(path.join(__dirname, "style.src.css"), "utf8");
    const selectorsIn = (css) => [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{[^{}]*\}/g)].flatMap((m) => m[1].split(",").map((x) => x.trim()));
    const classesIn = (css) => new Set(selectorsIn(css).flatMap((s) => [...s.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((x) => x[1])));
    const rootsIn = (css) => new Set(selectorsIn(css).map((s) => (/^\.([a-zA-Z][\w-]*)(?::{1,2}[\w-]+(?:\([^)]*\))?)*$/.exec(s) || [])[1]).filter(Boolean));
    const samples = src.slice(src.indexOf(LIB.SAMPLES_START) + LIB.SAMPLES_START.length, src.indexOf(LIB.SAMPLES_END));
    const ruled = classesIn(samples), rooted = rootsIn(samples);
    for (const [sec, list] of [["components", COMPONENTS], ["patterns", PATTERNS]]) for (const [k, c] of Object.entries(list)) {
      if (!c || typeof c !== "object" || !c.examples || typeof c.css === "string") continue;
      for (const ex of c.examples) {
        const copyCss = LIB.cssFor(LIB.exampleCssPrefixes(c, COMPONENTS, ex.html), src, ""), copy = classesIn(copyCss), copyRoots = rootsIn(copyCss);   // 예제 코드 패널의 복사본(그 예제 몫)
        const used = new Set([...(ex.html || "").matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)).filter(Boolean));
        const miss = [...used].filter((cl) => ruled.has(cl) && !copy.has(cl));
        const bare = [...used].filter((cl) => rooted.has(cl) && copy.has(cl) && !copyRoots.has(cl));
        if (miss.length) fails.push(`${sec}/${k}.html #ex-${k}-${ex.id}: 복사용 CSS 에 ${miss.map((x) => "." + x).join(" ")} 규칙이 없다 — 붙여 넣은 쪽에서 그 부분이 스타일 없이 그려진다(css · borrows · uses 에 더한다)`);
        if (bare.length) fails.push(`${sec}/${k}.html #ex-${k}-${ex.id}: 복사용 CSS 에 ${bare.map((x) => "." + x).join(" ")} 의 덮어쓰기만 있고 자기 규칙(.x{…})이 없다 — 붙여 넣으면 기본 모양 없이 덮어쓰기만 먹는다(borrows 에 더한다)`);
      }
    }
  }
  /* 패키지가 싣는 CSS 도 같은 검사를 받아야 한다. sync-css.mjs 가 손으로 쓴 base 규칙이
     개명 뒤에도 옛 이름을 참조하고 있었고(.ds-root 의 글자·배경, 포커스 링), 사이트만 보는
     가드로는 영영 안 잡힌다. dist 는 산출물이라 없을 수 있다 — 그때는 경고로 넘긴다 */
  {
    const distCss = path.resolve(__dirname, "..", "_react", "dist", "style.css");
    if (!fs.existsSync(distCss)) warns.push("_react/dist/style.css 없음 — 패키지 CSS 검사를 건너뛴다(npm run build)");
    else {
      const d = fs.readFileSync(distCss, "utf8");
      const dDecl = new Set([...d.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
      const dBad = [...new Set([...d.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]))]
        .filter((t) => !dDecl.has(t) && !t.startsWith("--prod-") && !LOCAL.includes(t)).sort();
      for (const t of dBad) fails.push(`_react/dist/style.css: var(${t}) 를 쓰는데 선언이 없다 — 패키지를 쓰는 앱에서 상속색으로 떨어진다`);
    }
  }
}

/* 생성물이 가리키는 토큰이 전부 선언돼 있는지 — data-token 은 HTML 속성이라
   CSS 를 보는 가드 셋(주석 짝 · 선언 존재 · 센티넬)이 전부 놓칩니다.
   3차에서 --graphic-muted → --muted-graphic 개명이 foundations.js 의 sem() 맨 문자열에
   닿지 않아 빈 칩이 하나 남았고, 빌드는 녹색이었습니다 */
{
  const blocks = [":root", ':root[data-theme="dark"]', ":root[data-accent-neutral]"];
  const declared = new Set();
  for (const sel of blocks) for (const k of Object.keys(LIB.parseVars(LIB.rootBlock(css, sel)))) declared.add(k);
  const pointed = new Set();
  for (const f of walk(OUT).filter(x => x.endsWith(".html"))) {
    const rel = path.relative(OUT, f);
    for (const t of new Set([...read(rel).matchAll(/data-token="(--[a-z0-9-]+)"/g)].map(m => m[1]))) {
      pointed.add(t);
      if (!declared.has(t)) fails.push(`${rel}: data-token="${t}" 이 선언되지 않은 토큰 — 스와치가 빈 칩으로 나옵니다`);
    }
  }
  /* 반대 방향 — 의미 토큰 전수가 Colors 페이지에 스와치로 나와야 한다.
     4차에서 절을 채워 가며 0 으로 만든다. 그때 fails 로 승격한다 */
  const isPrim = (k) => /^--(cool-neutral|neutral|brand|blue|green|orange|red|lime|cyan|light-blue|violet|purple|pink|red-orange|prod)-\d+$/.test(k);
  const isScalar = (k) => /^--(space|radius|shadow|motion|font|header|sidebar|toc|shell|card|row|code)-/.test(k) || /^--static-/.test(k) || k === "--brand-label" || k === "--company-mark" || k === "--company-mark-subtle";
  const orphan = [...declared].filter((t) => !isPrim(t) && !isScalar(t) && !pointed.has(t)).sort();
  if (orphan.length) warns.push(`Colors 페이지에 스와치가 없는 의미 토큰 ${orphan.length}개 — ${orphan.slice(0, 6).join(" ")}${orphan.length > 6 ? " …" : ""}`);
}

console.log(`verify: 실패 ${fails.length} · 경고 ${warns.length} · 남은 .ph ${phTotal}개(${phPages.join(", ") || "없음"})`);
fails.forEach(f => console.log("  ✗ " + f)); warns.forEach(w => console.log("  ! " + w));
if (fails.length) process.exit(1);
