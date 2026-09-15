// 제품가이드 정적 사이트 빌드 스크립트 (v0.4)
//   cd _build && node build.js
// 소스: jiran-design-system-guide.standalone.html(셸) + data.js / components.data.js / patterns.data.js / lib.js / foundations.js / render.js / app.src.js / ds.src.js / style.src.css
// 출력: ../ (index.html · 섹션 폴더 · assets/) + components.json (Figma 동기화용). 끝에 verify.js 실행.
const { chromium } = require("playwright");
const fs = require("fs"); const path = require("path");
const LIB = require("./lib.js");
require("./icons-css.js").apply(); // 폼 컨트롤 글리프(체크·셰브론 등)를 assets/icons SVG data URI 로 style.src.css 에 삽입
const ICONS_MOD = require("./icons.js"); ICONS_MOD.generate(); global.I = ICONS_MOD.I; // data 파일보다 먼저: 예제 문자열이 I() 를 즉시 평가
const DATA = require("./data.js"); const COMPONENTS = require("./components.data.js"); const PATTERNS = require("./patterns.data.js");
const SRC = path.resolve(__dirname, "jiran-design-system-guide.standalone.html");
const OUT = path.resolve(__dirname, "..");
const FONT = path.resolve(__dirname, "PretendardVariable.woff2");
const { SITE, PRODUCTS, VERSION } = DATA;
// React 예제 레지스트리: _react/examples/<sec>/<page>/<id>.tsx → 사이트 React 탭 소스 (없으면 htmlToJsx 폴백)
const EX_DIR = path.resolve(__dirname, "..", "_react", "examples");
const walkTsx = d => fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walkTsx(path.join(d, e.name)) : e.name.endsWith(".tsx") ? [path.join(d, e.name)] : []) : [];
const REACT_EXAMPLES = {};
for (const f of walkTsx(EX_DIR)) REACT_EXAMPLES[path.relative(EX_DIR, f).replace(/\.tsx$/, "").split(path.sep).join("/")] = fs.readFileSync(f, "utf8").replace(/^\/\/ ds:skeleton off[^\n]*\n/, "").trimEnd();

(async () => {
  const cssSrc = fs.readFileSync(path.join(__dirname, "style.src.css"), "utf8");
  const css = cssSrc.replace('url("PretendardVariable.woff2")', 'url("fonts/PretendardVariable.woff2")');

  const routes = [];
  for (const sec of Object.keys(SITE)) for (const pg of LIB.allPages(SITE, sec)) routes.push({ sec, key: pg.key, title: pg.title, group: pg.group || "", secTitle: SITE[sec].title });

  // 링크 접두어: 하위 페이지 '../', 루트 index.html ''. Home Overview 는 루트 index.html 에만 존재
  const isOverview = (s, k) => s === "home" && k === "overview";
  const rel = (s, k, root) => isOverview(s, k) ? `${root}index.html` : `${root}${s}/${k}.html`;
  const HOME_FIRST = "getting-started";
  const rewriteSeg = (html, root) => html
    .replace(/href="#\/([a-z-]+)\/([a-z0-9-]+)#([a-z0-9-]+)"/g, (m, s, k, id) => `href="${rel(s, k, root)}#${id}"`)
    .replace(/href="#\/([a-z-]+)\/([a-z0-9-]+)"/g, (m, s, k) => `href="${rel(s, k, root)}"`);
  // <pre> 안(코드 샘플)은 건드리지 않는다
  const rewrite = (html, root = "../") => html.split(/(<pre[\s\S]*?<\/pre>)/).map((seg, i) => i % 2 ? seg : rewriteSeg(seg, root)).join("");

  // 출력 폴더 초기화 + assets
  for (const d of ["home", "foundations", "components", "patterns", "resources"]) fs.rmSync(path.join(OUT, d), { recursive: true, force: true });
  // assets/ 는 통째로 지우지 않는다 (assets/icons 는 사용자가 관리하는 원본). 생성물만 교체
  for (const f of ["assets/style.css", "assets/app.js", "assets/ds.js", "assets/fonts"]) fs.rmSync(path.join(OUT, f), { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, "assets", "fonts"), { recursive: true });
  fs.copyFileSync(FONT, path.join(OUT, "assets", "fonts", "PretendardVariable.woff2"));
  fs.writeFileSync(path.join(OUT, "assets", "style.css"), css);
  fs.writeFileSync(path.join(OUT, "assets", "ds.js"), fs.readFileSync(path.join(__dirname, "ds.src.js"), "utf8"));
  const index = routes.map(r => ({ t: r.title, s: r.secTitle, g: r.group, u: rel(r.sec, r.key, "") }));
  fs.writeFileSync(path.join(OUT, "assets", "app.js"),
    `// 공용 스크립트(생성됨): 테마 · Accent(제품 컬러) 미리보기 · 검색 · 코드 복사/탭. 원본은 _build/app.src.js\nconst SEARCH_INDEX=${JSON.stringify(index)};\nconst PRODUCTS=${JSON.stringify(PRODUCTS)};\nconst ROOT=document.body.dataset.root||'../';\n` + fs.readFileSync(path.join(__dirname, "app.src.js"), "utf8"));

  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  p.on("pageerror", e => { console.error("page error:", e.message); process.exitCode = 1; });
  await p.addInitScript(`window.STYLE_TEXT = ${JSON.stringify(cssSrc)}; window.REACT_EXAMPLES = ${JSON.stringify(REACT_EXAMPLES)};`);
  await p.goto("file://" + SRC + "#/home/overview");
  await p.waitForFunction(() => document.body.dataset.route === "home/overview");

  let count = 0;
  for (const r of routes) {
    const route = `${r.sec}/${r.key}`;
    await p.evaluate(h => { location.hash = "#/" + h; }, route);
    await p.waitForFunction(rt => document.body.dataset.route === rt, route);
    const parts = await p.evaluate(() => ({ content: document.getElementById("content").innerHTML, nav: document.getElementById("nav").innerHTML, topnav: document.getElementById("topnav").innerHTML, title: document.title, foot: document.getElementById("foot").textContent }));
    const isHome = isOverview(r.sec, r.key);
    const topnavOf = root => rewrite(parts.topnav, root).replace(/href="([^"]*)index\.html"/, `href="$1home/${HOME_FIRST}.html"`);
    const navOf = root => rewrite(parts.nav, root).replace(/<a href="[^"]*index\.html"[^>]*>Overview(?:<span[^>]*>[^<]*<\/span>)?<\/a>/, "");
    const page = ({ root, full, topActive }) => `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${parts.title}</title>
<link rel="stylesheet" href="${root}assets/style.css">
<script src="${root}assets/app.js" defer></script>
<script src="${root}assets/ds.js" defer></script>
</head>
<body data-section="${r.sec}" data-page="${full ? "index" : r.key}" data-root="${root || "./"}">
<header class="header">
  <a class="brand" href="${root}index.html"><span>JS Design System</span></a>
  <span class="ver">${VERSION}</span>
  <nav class="topnav" aria-label="섹션">${topActive ? topnavOf(root) : topnavOf(root).replace(/ class="active"/g, ' class=""')}</nav>
  <div class="header-right">
    <label class="accent-pick" title="제품 메인 컬러(Accent) 미리보기"><i></i><select id="accentSel" aria-label="Accent 컬러 선택"></select></label>
    <label class="search">${I("search", 18)}<input id="q" type="search" placeholder="Search" aria-label="검색" autocomplete="off"></label>
    <div class="search-results" id="searchResults" hidden></div>
    <button class="theme-btn" id="themeBtn" type="button">${I("moon", 14)}테마</button>
  </div>
</header>
<div class="shell${full ? " full" : ""}">
${full ? "" : `  <aside class="sidebar"><nav class="nav" aria-label="서브메뉴">${navOf(root)}</nav><div class="sidebar-foot">${parts.foot}</div></aside>\n`}  <div class="main">
${isHome ? `<div id="content" class="home">\n${rewrite(parts.content, root)}\n</div>` : `    <div class="page"><article id="content">\n${rewrite(parts.content, root)}\n    </article></div>`}
  </div>
</div>
</body>
</html>
`;
    fs.mkdirSync(path.join(OUT, r.sec), { recursive: true });
    if (isHome) fs.writeFileSync(path.join(OUT, "index.html"), page({ root: "", full: true, topActive: false }));
    else fs.writeFileSync(path.join(OUT, r.sec, r.key + ".html"), page({ root: "../", full: false, topActive: true }));
    count++;
  }
  for (const sec of [...new Set(routes.map(r => r.sec))]) { const first = routes.find(r => r.sec === sec && !isOverview(r.sec, r.key)); fs.writeFileSync(path.join(OUT, sec, "index.html"), `<!doctype html>\n<html lang="ko"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${first.key}.html"><title>${first.secTitle}</title></head><body><a href="${first.key}.html">${first.secTitle}</a></body></html>\n`); }
  await b.close();

  // Figma 동기화용 데이터 (components.json)
  const light = LIB.parseVars(LIB.rootBlock(cssSrc, ":root")); const dark = LIB.parseVars(LIB.rootBlock(cssSrc, ':root[data-theme="dark"]'));
  const pageMeta = (sec, key) => { const pg = LIB.allPages(SITE, sec).find(p => p.key === key) || {}; return { title: pg.title || key, group: pg.group || "" }; };
  const pack = (sec, key, c) => ({ key, ...pageMeta(sec, key), status: c.status, desc: c.desc, uses: c.uses || [], cssPrefixes: [].concat(c.css || []),
    css: typeof c.css === "string" ? c.css : LIB.cssFor([...new Set([...(c.uses || []).flatMap(u => [].concat((COMPONENTS[u] || {}).css || [])), ...[].concat(c.css || [])])], cssSrc, VERSION),
    props: c.props || [], spec: c.spec || [], figma: c.figma || {}, guideline: c.guideline || {},
    examples: (c.examples || []).map(e => ({ id: e.id, title: e.title, desc: e.desc || "", html: LIB.dedent(e.html), react: REACT_EXAMPLES[`${sec}/${key}/${e.id}`] ?? (e.react ? LIB.dedent(e.react) : LIB.htmlToJsx(e.html, e.name)) })), reactExports: c.react || [] });
  fs.writeFileSync(path.join(__dirname, "components.json"), JSON.stringify({ version: VERSION, generatedAt: new Date().toISOString(), figma: DATA.FIGMA, tokens: { light, dark }, icons: ICONS_MOD.ICON_NAMES,
    components: Object.entries(COMPONENTS).map(([k, c]) => pack("components", k, c)), patterns: Object.entries(PATTERNS).map(([k, c]) => pack("patterns", k, c)) }, null, 2));

  fs.writeFileSync(path.join(OUT, "README.md"), `# 지란지교시큐리티 Design System — 제품가이드 (정적 사이트 ${VERSION})

정적 HTML 사이트입니다. 폴더째 웹 서버(사내 Nginx/Apache, S3, GitHub Pages 등)에 올리면 동작합니다. 빌드 도구·서버 사이드 코드 없음.
모든 컴포넌트·패턴 페이지는 라이브 프리뷰 + 복사 가능한 코드(HTML+CSS / React) + Props 표로 구성됩니다. React 탭의 코드는 \`_react/\` 의 패키지 \`@jiran/ds-react\` 사용 코드이며, 테스트로 사이트 HTML 과 구조가 같음을 보장합니다.

> **이 폴더의 HTML/CSS/JS 는 생성물입니다.** \`_build\` 의 소스를 고친 뒤 재빌드하세요. 생성물을 직접 수정하면 다음 빌드에서 사라집니다.

처음이라면 **Home › Getting started**(https://myscully.github.io/JSDS/home/getting-started.html)에서 디자이너 · React 개발자 · HTML+CSS 개발자 별 사용법을 3~6단계로 확인하세요.

## 폴더 구조
- \`index.html\` — 첫 화면. 사이드 메뉴 없이 Home Overview 콘텐츠만 표시
- 상단 Home 탭 → \`home/getting-started.html\`. Home 섹션 사이드 메뉴는 Getting started · About · UX Principles (Overview 는 첫 화면에만 있음)
- \`home/\` \`foundations/\` \`components/\` \`patterns/\` \`resources/\` — 상단 메뉴 5개 섹션. 각 페이지가 개별 HTML 파일이며 섹션 폴더의 \`index.html\` 은 첫 페이지로 이동
- \`assets/style.css\` — 디자인 토큰(\`:root\`) + 문서 레이아웃 + **컴포넌트 CSS**('Live component samples' 블록). Light/Dark 지원. 제품에서는 이 파일 하나를 연결하거나 각 페이지의 "컴포넌트 CSS"만 복사
- \`assets/app.js\` — 테마 전환, Accent(제품 메인 컬러) 미리보기, 검색, 코드 복사/탭
- \`assets/ds.js\` — **컴포넌트 동작 스크립트**(순수 JS, 의존성 없음). 드롭다운·탭·페이지네이션·달력·테이블 정렬/선택·토스트 등. 사이트 프리뷰가 이 파일로 동작하며, HTML 을 복사해 쓰는 제품도 \`<script src="assets/ds.js" defer>\` 한 줄로 같은 동작을 얻습니다. React 제품은 불필요(@jiran/ds-react 가 동작 포함)
- \`assets/fonts/PretendardVariable.woff2\` — Pretendard Variable v1.3.9 (OFL)
- \`assets/icons/outline\` \`assets/icons/filled\` — Tabler Icons(MIT) 전체 세트(원본, 빌드가 건드리지 않음). 사이트가 쓰는 아이콘 목록은 \`_build/icons.js\` 의 \`ICON_NAMES\`, 갤러리는 Foundations › Icons

## 컬러 모델
- Gray Scale(무채색)이 바탕, \`--accent-*\` 가 제품 메인 컬러 슬롯, \`--brand-*\` 가 지란지교시큐리티 브랜드(#FF7F00)
- 제품에 적용할 때: 제품 메인 컬러 HEX 하나로 \`--accent-50~900\` 을 생성(\`app.js\` 의 accentScale 참고)하고 나머지 토큰은 그대로 사용
- 헤더의 Accent 선택은 미리보기용입니다. 실제 제품 컬러는 \`_build/data.js\` 의 \`PRODUCTS\` 에 등록하세요

## 소스 (\`_build/\`)
| 파일 | 내용 |
|---|---|
| \`data.js\` | 사이트 구조(SITE) · 제품 컬러(PRODUCTS) · 버전 · Changelog |
| \`components.data.js\` | 컴포넌트 30개: 설명 · 예제(html/react) · props · spec · figma 스펙 · 가이드라인 |
| \`patterns.data.js\` | 패턴 11개: 사용 컴포넌트(uses) · 예제 · 가이드라인 |
| \`style.src.css\` | 스타일 원본. 컴포넌트 CSS 는 \`/* ---------- Live component samples ---------- */\` 블록 안에 평면 규칙으로 작성(코드 패널 추출 대상) |
| \`lib.js\` | cssFor(컴포넌트 CSS 추출) · htmlToJsx(React 코드 생성) · hl(구문 강조) · tokenBlock |
| \`icons.js\` | 사용 아이콘 목록(\`ICON_NAMES\`) + \`assets/icons\` SVG 를 읽어 \`I(name,size)\` 인라인 헬퍼 제공. 빌드 시 \`icons.gen.js\`(브라우저용, 생성물) 기록 |
| \`icons-css.js\` | 체크박스 체크·마이너스, Chip 체크, Dropdown·Accordion 셰브론, Breadcrumb 슬래시, 표 정렬 화살표를 \`assets/icons\` SVG 의 data URI mask 로 \`style.src.css\` 에 삽입(빌드 시 자동) |
| \`render.js\` | 페이지 렌더러(컴포넌트/패턴/Resources) + 해시 라우터 |
| \`foundations.js\` | Foundations 페이지(Overview · Base material: Colors · Elevation · Grid · Icons · Typography, Web Desktop) |
| \`app.src.js\` | 런타임 원본 → \`assets/app.js\` |
| \`ds.src.js\` | 컴포넌트 동작 스크립트 원본 → \`assets/ds.js\` (\`DS.toast()\` · \`DS.popup.open()\` · \`DS.init(root)\` · \`ds:*\` 커스텀 이벤트) |
| \`behave.js\` | 동작 검증(playwright): 빌드 후 \`node behave.js\` — 프리뷰를 실제 클릭해 45 케이스 확인, 스크린샷 \`.behave/\` |
| \`jiran-design-system-guide.standalone.html\` | 위 파일을 로드하는 미리보기 셸. \`_build\` 에서 \`python3 -m http.server 8090\` 후 열기 |
| \`components.json\` | 빌드 산출물. Figma 동기화 등 외부 도구용(토큰 · 컴포넌트 스펙 · 예제 코드) |
| \`verify.js\` | 생성물 검증(플레이스홀더 0, 코드 패널 존재, 링크 변환, React 탭 패키지 코드 여부 등) |

## React 패키지 (\`_react/\`)
\`@jiran/ds-react\` — 30개 컴포넌트 + 패턴 래퍼를 실제 React 컴포넌트로 구현. 같은 클래스 마크업을 렌더링하므로 \`dist/style.css\`(토큰 + 컴포넌트 CSS 만 합성) 하나로 동작합니다.
- \`src/components/<page>/\` 컴포넌트 · \`examples/<sec>/<page>/<id>.tsx\` 예제(= 사이트 React 탭 소스 = 테스트 대상) · \`tests/site-consistency.test.tsx\` 사이트 HTML 과 구조 비교
- \`cd _react && npm i && npm test && npm run build\` → \`dist/\`(ESM·CJS·d.ts·style.css·fonts). \`npm run demo\` 로 전체 예제 확인
- 사용: \`import "@jiran/ds-react/style.css"\` · \`<html data-theme="dark">\` · \`applyAccent("#0B4171")\` · 앱 루트에 \`<ToastProvider>\`. 자세한 내용은 사이트 Resources › React Package

### 재빌드
\`\`\`
cd _build
npm i            # 최초 1회 (playwright)
npx playwright install chromium   # 최초 1회
node build.js    # 생성 + verify
\`\`\`
샘플 코드 작성 규칙: 문자열 안에 백틱 · \\\${ · onclick · <script · href="#/" 를 쓰지 않습니다(링크는 href="#").

## 서버 배포 메모
- 모든 링크는 상대 경로라 하위 경로(예: \`/design-system/\`)에 배치해도 됩니다.
- \`.woff2\` MIME 타입(\`font/woff2\`)이 서버에 등록되어 있는지 확인하세요.
`);
  console.log("pages:", count, "react examples:", Object.keys(REACT_EXAMPLES).length, "out:", OUT);
  require("./verify.js");
})().catch(e => { console.error(e); process.exit(1); });
