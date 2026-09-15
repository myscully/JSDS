/* =========================================================
   render.js — 페이지 렌더러 + 해시 라우터 (브라우저 전용)
   data.js · components.data.js · patterns.data.js · lib.js 가 먼저 로드되어야 합니다.
   ========================================================= */
const { esc, dedent, cssFor, tokenBlock, htmlToJsx, hl } = LIB;
const $ = s => document.querySelector(s);
const STYLE = () => window.STYLE_TEXT || "";
const nb = (sec, key) => NEW.has(`${sec}/${key}`) ? '<span class="n">N</span>' : "";
const tagOf = s => s === "ready" ? '<span class="doc-tag ok">완료</span>' : s === "wip" ? '<span class="doc-tag wip">작업 중</span>' : '<span class="doc-tag todo">예정</span>';
const allPages = sec => LIB.allPages(SITE, sec);
const firstPage = sec => `#/${sec}/${allPages(sec)[0].key}`;
function currentSection() { const h = (location.hash || "#/home/overview").split("/"); return SITE[h[1]] ? h[1] : "home"; }
function titleOf(sec, key) { const p = allPages(sec).find(p => p.key === key); return p ? p.title : key; }
const figmaLink = `<a class="doc-tag" href="${FIGMA}" target="_blank" rel="noopener">Figma ↗</a>`;

/* ============ chrome ============ */
function buildTopNav() { const cur = currentSection(); $("#topnav").innerHTML = Object.entries(SITE).map(([sec, d]) => `<a href="${firstPage(sec)}" class="${sec === cur ? "active" : ""}">${d.title}${d.isNew ? '<span class="n">N</span>' : ""}</a>`).join(""); }
function sectionItems(sec, f) {
  const d = SITE[sec]; let h = ""; const item = (k, t) => `<a href="#/${sec}/${k}">${t}${nb(sec, k)}</a>`;
  for (const [k, t] of Object.entries(d.pages || {})) if (!f || t.toLowerCase().includes(f)) h += item(k, t);
  for (const [g, list] of (d.groups || [])) { const li = list.filter(([k, t]) => !f || t.toLowerCase().includes(f)).map(([k, t]) => item(k, t)).join(""); if (li) h += (g ? `<h5>${g}</h5>` : "") + li; }
  return h;
}
function buildNav(filter = "") {
  const f = filter.trim().toLowerCase(); let h = "";
  if (f) { for (const sec of Object.keys(SITE)) { const it = sectionItems(sec, f); if (it) h += `<div class="sec-label">${SITE[sec].title}</div>${it}`; } if (!h) h = `<p style="padding:0 12px;color:var(--text-tertiary);font-size:12px">검색 결과가 없습니다.</p>`; }
  else { const sec = currentSection(); h = `<h4>${SITE[sec].title}</h4>` + sectionItems(sec, ""); }
  $("#nav").innerHTML = h; $("#foot").textContent = VERSION + " · 지란지교시큐리티 기획팀 디자인파트"; markActive();
}
function markActive() { const cur = location.hash || "#/home/overview"; document.querySelectorAll("#nav a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === cur)); }

/* ============ shared renderers ============ */
const thumbs = {
  generic: `<svg viewBox="0 0 96 64"><rect x="16" y="16" width="64" height="32" rx="6" fill="#fff" stroke="#CBD5E1"/><rect x="26" y="29" width="30" height="6" rx="3" fill="#0F172A"/></svg>`,
};
function thumbOf(sec, key) {
  const d = sec === "components" ? COMPONENTS[key] : sec === "patterns" ? PATTERNS[key] : null;
  // 카드 전체가 <a> 이므로 썸네일 안의 링크·버튼은 span 으로 바꿔 중첩을 피한다
  if (d && d.thumb) return `<div class="mini">${dedent(d.thumb).replace(/<a\b([^>]*)>/g, "<span$1>").replace(/<\/a>/g, "</span>").replace(/<button\b([^>]*)>/g, "<span$1>").replace(/<\/button>/g, "</span>").replace(/<input\b([^>]*)>/g, (m, a) => `<input${a.replace(/\s*type="[^"]*"/, "")} type="${(/type="([^"]*)"/.exec(a) || [, "text"])[1]}" tabindex="-1">`)}</div>`;
  return thumbs[key] || thumbs.generic;
}
function overviewPage(sec) {
  const d = SITE[sec]; const pages = allPages(sec).filter(p => p.key !== "overview");
  const intro = sec === "components" ? `<p>모든 컴포넌트 페이지는 <b>동작하는 라이브 프리뷰 + 복사 가능한 코드(HTML+CSS / React) + Props</b>로 구성됩니다. 프리뷰의 드롭다운·탭·달력·표 정렬 등은 <code>assets/ds.js</code>(순수 JS)로, React 탭 코드는 <code>@jiran/ds-react</code> 로 같은 동작을 합니다. 스타일은 <code>assets/style.css</code> 하나로 동작하며, 색은 토큰(<code>var(--accent)</code> 등)만 참조합니다.</p>` : sec === "patterns" ? `<p>패턴은 컴포넌트를 조합한 화면 단위 예시입니다. 각 예시의 코드를 그대로 복사해 시작점으로 쓸 수 있습니다.</p>` : "";
  return `<h1>Overview${nb(sec, "overview")}</h1><p class="lead">${d.desc}입니다.</p>${intro}
  <div class="ov-grid">${pages.map(p => `<a class="ov-card" href="#/${sec}/${p.key}"><div class="thumb">${thumbOf(sec, p.key)}</div><div class="label">${p.title}${nb(sec, p.key)}${p.group ? `<small>${p.group}</small>` : ""}</div></a>`).join("")}</div>`;
}
function templatePage(sec, key) {
  const d = SITE[sec]; const t = titleOf(sec, key);
  return `<h1>${t}${nb(sec, key)}</h1><p class="lead">${t}의 정의와 사용 기준을 씁니다. (${d.title}, 아직 틀 상태입니다)</p><div class="meta">${tagOf("todo")}${figmaLink}</div>
  <h2 id="usage">Usage</h2><div class="ph">사용 예시 · 원칙<small>작성 예정</small></div>
  <h2 id="guideline">Guideline</h2><div class="dodont"><div class="do"><div class="body"><p>권장 사용 예를 씁니다.</p></div></div><div class="dont"><div class="body"><p>피해야 할 사용 예를 씁니다.</p></div></div></div>`;
}

/* ---------- 코드 블록 / 예제 블록 ---------- */
function codeBlock(id, code, lang, label) {
  return `<div class="code-block"><button type="button" class="copy-btn" data-copy="${id}" data-label="${label || "복사"}">${label || "복사"}</button><pre><code id="${id}">${hl(code, lang)}</code></pre></div>`;
}
function exampleBlock(sec, pageKey, ex, css, cssLabel) {
  const id = `ex-${pageKey}-${ex.id}`;
  const html = dedent(ex.html); const fromPkg = (window.REACT_EXAMPLES || {})[`${sec}/${pageKey}/${ex.id}`]; const react = fromPkg || (ex.react ? dedent(ex.react) : htmlToJsx(html, ex.name)); const reactLabel = fromPkg ? "React · @jiran/ds-react" : "React · TSX (자동 변환)";
  const cls = ["example-preview", "panel", ex.layout || ""].join(" ").trim();
  return `<section class="example" id="${id}">
<div class="${cls}"${ex.style ? ` style="${ex.style}"` : ""}>${html}</div>
<div class="example-bar"><div class="code-tabs" role="tablist"><button type="button" class="on" data-tab="html" role="tab" aria-selected="true">HTML+CSS</button><button type="button" data-tab="react" role="tab" aria-selected="false">React</button></div><div class="example-actions"><button type="button" data-copy="${id}-html" data-label="복사">복사</button><button type="button" data-toggle aria-expanded="false">코드 보기</button></div></div>
<div class="example-code" hidden>
<div data-pane="html"><div class="code-head"><span>HTML</span></div><pre><code id="${id}-html">${hl(html, "html")}</code></pre><div class="code-head"><span>CSS · ${esc(cssLabel)}</span><button type="button" data-copy="${id}-css" data-label="CSS 복사">CSS 복사</button></div><pre><code id="${id}-css">${hl(css, "css")}</code></pre></div>
<div data-pane="react" hidden><div class="code-head"><span>${reactLabel}</span></div><pre><code id="${id}-react">${hl(react, "tsx")}</code></pre></div>
</div>
</section>`;
}
function propsTable(rows) {
  if (!rows || !rows.length) return "";
  return `<div class="tablewrap"><table class="props"><thead><tr><th>Prop / Class</th><th>Type · Values</th><th>Default</th><th>Description</th></tr></thead><tbody>${rows.map(r => `<tr><td>${esc(r[0])}</td><td><code>${esc(r[1])}</code></td><td>${r[2] ? `<code>${esc(r[2])}</code>` : "—"}</td><td>${r[3]}</td></tr>`).join("")}</tbody></table></div>`;
}
const USAGE_HTML = `<!-- 1) 토큰 + 전체 컴포넌트 스타일 한 번에 연결 -->
<link rel="stylesheet" href="assets/style.css">
<!-- 동작(드롭다운·탭·달력·표 정렬/선택·토스트 등) — 순수 JS 한 파일. React 제품은 불필요 -->
<script src="assets/ds.js" defer></script>

<!-- 2) 또는 아래 "Component CSS" 만 프로젝트 CSS 에 붙이고,
        :root 토큰은 Foundations › Design Token 에서 복사 -->`;
const reactUsage = names => `npm i @jiran/ds-react

// main.tsx — 앱 진입점에서 한 번
import "@jiran/ds-react/style.css";
${names.length ? `
// 컴포넌트
import { ${names.join(", ")} } from "@jiran/ds-react";` : ""}`;
function usageBlock(key, css, label, names = []) {
  return `<h2 id="usage">Usage</h2><p><b>React</b>: <code>@jiran/ds-react</code> 패키지를 설치하고 <code>style.css</code> 를 한 번 import 하면 위 React 탭 코드를 그대로 쓸 수 있습니다(<a href="#/resources/react">React Package</a>). <b>HTML</b>: <code>assets/style.css</code> 를 연결하고(일부만 필요하면 아래 컴포넌트 CSS 복사), 동작이 필요하면 <code>assets/ds.js</code> 를 함께 넣습니다 — 이 페이지의 프리뷰가 그 스크립트로 동작합니다. 색은 전부 <a href="#/resources/design-token">토큰</a>(<code>var(--accent)</code> 등)을 참조하므로 <code>--accent-*</code> 만 제품 컬러로 바꾸면 됩니다.</p>
<h3>React <small style="font-weight:400;color:var(--text-tertiary);font-size:12px">@jiran/ds-react</small></h3>${codeBlock(`react-${key}`, reactUsage(names), "tsx", "복사")}
<h3>HTML</h3>${codeBlock(`usage-${key}`, USAGE_HTML, "html")}
<h3>Component CSS <small style="font-weight:400;color:var(--text-tertiary);font-size:12px">${esc(label)}</small></h3>${codeBlock(`css-${key}`, css, "css", "CSS 복사")}`;
}
const cssOf = c => typeof c.css === "string" ? c.css : cssFor([].concat(c.css || []), STYLE(), VERSION);
const specGrid = spec => spec && spec.length ? `<h2 id="spec">Spec</h2><div class="spec">${spec.map((x, i) => `<div><b>${i + 1}. ${x[0]}</b><span>${x[1]}</span></div>`).join("")}</div>` : "";
const dodont = g => g ? `<h2 id="guideline">Guideline</h2><div class="dodont"><div class="do"><div class="body">${(g.do || []).map(x => `<p>${x}</p>`).join("")}</div></div><div class="dont"><div class="body">${(g.dont || []).map(x => `<p>${x}</p>`).join("")}</div></div></div>` : "";

function componentPage(key) {
  const c = COMPONENTS[key]; const t = titleOf("components", key);
  if (!c) return `<h1>${t}</h1><p class="lead">${t} 컴포넌트는 아직 작성되지 않았습니다.</p><div class="meta">${tagOf("todo")}${figmaLink}</div><div class="ph">라이브 프리뷰 · 코드<small>components.data.js 에 항목을 추가하세요</small></div>`;
  const css = cssOf(c); const label = [].concat(c.css || []).join(", ");
  return `<h1>${t}${nb("components", key)}</h1><p class="lead">${c.desc}</p><div class="meta">${tagOf(c.status)}${figmaLink}<span class="doc-tag">Desktop</span><span class="doc-tag">HTML+CSS · React</span></div>
${c.anatomy ? `<h2 id="anatomy">Anatomy</h2><div class="panel">${dedent(c.anatomy.demo)}</div><ol class="legend">${c.anatomy.items.map((x, i) => `<li><span class="marker">${i + 1}</span>${x}</li>`).join("")}</ol>` : ""}
<h2 id="examples">Examples</h2>${(c.examples || []).map((ex, i) => `<h3 id="ex-${ex.id}">${i + 1}. ${ex.title}</h3>${ex.desc ? `<p>${ex.desc}</p>` : ""}${exampleBlock("components", key, ex, css, label)}`).join("")}
<h2 id="props">Props</h2><p>HTML 에서는 클래스와 속성으로, React(<code>@jiran/ds-react</code>)에서는 같은 이름의 prop(<code>variant</code> · <code>size</code> …)으로 변형·상태를 지정합니다.</p>${propsTable(c.props)}
${usageBlock(key, css, label, c.react || [])}`;
}
function patternPage(key) {
  const c = PATTERNS[key]; const t = titleOf("patterns", key);
  if (!c) return templatePage("patterns", key);
  const uses = c.uses || []; const prefixes = [...new Set([...uses.flatMap(u => [].concat((COMPONENTS[u] || {}).css || [])), ...[].concat(c.css || [])])];
  const css = cssFor(prefixes, STYLE(), VERSION); const label = prefixes.join(", ");
  const group = (allPages("patterns").find(p => p.key === key) || {}).group;
  return `<h1>${t}${nb("patterns", key)}</h1><p class="lead">${c.desc}</p><div class="meta">${tagOf(c.status)}${figmaLink}${group ? `<span class="doc-tag">${group}</span>` : ""}<span class="doc-tag">HTML+CSS · React</span></div>
<h2 id="composition">Composition</h2><p>이 패턴이 조합하는 컴포넌트입니다. 세부 옵션은 각 컴포넌트 페이지를 참고하세요.</p><div class="uses">${uses.map(u => `<a href="#/components/${u}">${titleOf("components", u)}</a>`).join("")}</div>
${c.principles ? `<div class="kv">${c.principles.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</div>` : ""}
<h2 id="examples">Examples</h2>${(c.examples || []).map((ex, i) => `<h3 id="ex-${ex.id}">${i + 1}. ${ex.title}</h3>${ex.desc ? `<p>${ex.desc}</p>` : ""}${exampleBlock("patterns", key, ex, css, label)}`).join("")}
${usageBlock(key, css, label, [...new Set([...(c.react || []), ...uses.flatMap(u => (COMPONENTS[u] || {}).react || [])])])}`;
}

/* ---------- Foundations 공용 ---------- */
const tokenSection = (id, title, prefixes, note) => `<h3 id="${id}">${title}</h3>${note ? `<p>${note}</p>` : ""}${codeBlock(`tok-${id}`, tokenBlock(prefixes, STYLE()), "css", "CSS 복사")}`;
const sw = (v, label) => `<div style="background:var(${v})" title="${v} 복사" data-copy-text="var(${v})"><i>${label}</i></div>`;

/* ============ page renderers ============ */
const PAGES = {
  "home/overview": () => {
    const secs = Object.entries(SITE).filter(([s]) => s !== "home");
    const art = { foundations: ["일관된 기반을 만드는", "규칙과 토큰"], components: ["복사해서 바로 쓰는", "UI 컴포넌트 코드"], patterns: ["반복 업무를 해결하는", "화면 패턴"], resources: ["바로 가져다 쓰는", "라이브러리와 토큰"] };
    return `<section class="hero"><h1>JS Design System</h1><p class="sub">제품 리뉴얼과 신규 개발에서 메인 컬러를 제외한 모든 기본 구성을 한 가지 기준으로 제공합니다. 모든 컴포넌트는 라이브 프리뷰와 함께 HTML+CSS · React 코드로 제공되어 그대로 복사해 사용할 수 있습니다.</p>
  <div class="cta"><a class="btn md primary" href="#/components/overview">Components 보기</a><a class="btn md secondary" href="#/resources/design-token">토큰 복사</a></div>
  <svg class="wave" viewBox="0 0 1440 160" preserveAspectRatio="none"><path d="M0 90C240 20 480 20 720 80s480 90 720 10v70H0z" fill="url(#g)"/><defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#E2E8F0" stop-opacity=".6"/><stop offset="1" stop-color="#E2E8F0" stop-opacity="0"/></linearGradient></defs></svg></section>
  <div class="home-grid">${secs.map(([s, d]) => `<a class="home-card" href="${firstPage(s)}"><div class="art"><b>${art[s][0]}<br>${art[s][1]}</b><span>${d.title}</span></div><div class="body"><b>${d.title}</b><span>${d.desc}</span></div></a>`).join("")}</div>`;
  },
  "home/about": () => `<h1>About</h1><p class="lead">지란지교시큐리티 디자인 시스템은 보안 솔루션 제품군이 공유하는 하나의 UI 언어입니다.</p>
<h2 id="why">왜 만드나</h2><p>제품마다 메인 컬러가 다르고 출시 시기도 다르지만, 사용자는 같은 회사의 제품을 씁니다. 리뉴얼이나 신규 제품을 시작할 때마다 무채색·서체·간격·컴포넌트를 새로 정하지 않도록, <b>메인 컬러를 제외한 나머지 기본 구성</b>을 이 시스템이 제공합니다.</p>
<h2 id="how">어떻게 쓰나</h2><div class="kv"><dt>디자이너</dt><dd>Figma 라이브러리의 컴포넌트를 쓰고, 이 가이드의 예제·Props 로 변형과 상태를 확인합니다</dd><dt>개발자</dt><dd>React 제품은 <a href="#/resources/react"><code>@jiran/ds-react</code></a> 패키지를 설치하고 각 페이지 React 탭 코드를 그대로 씁니다. 그 외에는 HTML+CSS 탭 코드에 <code>assets/style.css</code> + <code>assets/ds.js</code>(동작)</dd><dt>제품 적용</dt><dd><a href="#/resources/design-token">Design Token</a>에서 <code>--accent-*</code> 만 제품 메인 컬러로 바꿉니다</dd></div>
<h2 id="scope">범위</h2><div class="kv"><dt>제공하는 것</dt><dd>Gray Scale, 타이포그래피, 간격·반경·엘리베이션, 아이콘 규칙, 컴포넌트 30개(Desktop, 코드 포함), 패턴 11개, 토큰</dd><dt>제품이 정하는 것</dt><dd>Accent Primary(제품 메인 컬러). 헤더의 Accent 선택으로 각 제품 컬러가 적용된 모습을 미리 볼 수 있습니다</dd><dt>브랜드 컬러</dt><dd><code>#FF7F00</code>. 회사 브랜드를 강조할 때 Accent Primary를 대체하거나 포인트로 사용</dd><dt>플랫폼</dt><dd>Desktop 웹 (관리 콘솔) 우선</dd></div>
<h2 id="team">운영</h2><p>기획팀 디자인파트가 운영하며, Figma 라이브러리와 이 가이드를 함께 갱신합니다. 제안·기여 절차는 <a href="#/resources/contribution">Contribution</a>을 참고하세요.</p>`,
  "home/principles": () => `<h1>UX Principles</h1><p class="lead">보안 관리자는 하루 종일 콘솔을 봅니다. 화려함보다 정확함, 밀도, 예측 가능성이 우선입니다.</p>
<h2 id="p1">1. 위험은 한눈에</h2><p>심각도·상태는 색과 형태(태그·점·밴드)로 동시에 인코딩합니다. 색만으로 의미를 전달하지 않습니다.</p>
<h2 id="p2">2. 밀도는 높게, 위계는 분명하게</h2><p>테이블·로그 중심 화면은 정보 밀도를 우선하되 타이포 스케일과 간격 토큰으로 위계를 유지합니다.</p>
<h2 id="p3">3. 되돌릴 수 있게</h2><p>차단·삭제·배포처럼 파급이 큰 동작은 확인 → 실행 → 결과 알림(실행 취소 가능)의 흐름을 따릅니다.</p>
<h2 id="p4">4. 하나의 언어</h2><p>제품이 달라도 같은 컴포넌트·같은 용어·같은 토큰을 씁니다. 메인 컬러만 제품의 것입니다.</p>`,

  "resources/design-token": () => {
    const css = STYLE(); const root = css.slice(css.indexOf(":root{"), css.indexOf("*{box-sizing")).trim();
    return `<h1>Design Token${nb("resources", "design-token")}</h1><p class="lead">이 가이드가 쓰는 토큰 원본(CSS 변수 · Light/Dark)과 Radius · Motion · Accessibility 규칙입니다. <code>--accent-*</code> 만 제품 컬러로 바꾸면 나머지는 그대로 씁니다. 색의 의미와 사용 규칙은 <a href="#/foundations/colors">Foundations › Colors</a> 를 참고하세요.</p>
<div class="meta">${tagOf("ready")}<button class="btn sm secondary" type="button" data-copy="tokencss" data-label="전체 CSS 복사">전체 CSS 복사</button></div>
<h2 id="layers">Token Layers</h2><div class="kv"><dt>Primitive</dt><dd><code>--gray-*</code> <code>--brand-*</code> <code>--accent-*</code> <code>--red-*</code>… 값의 원천. 컴포넌트에서 직접 쓰지 않음 (<a href="#/foundations/colors">Colors › Atomic</a>)</dd><dt>Semantic</dt><dd><code>--bg-*</code> <code>--text-*</code> <code>--fill-*</code> <code>--line-*</code> <code>--border-*</code> <code>--accent</code> <code>--danger</code> <code>--sev-*</code>… 컴포넌트는 이것만 참조 (<a href="#/foundations/colors">Colors › Semantic</a>)</dd><dt>제품 적용</dt><dd>제품 메인 컬러 HEX 하나로 <code>--accent-50~900</code>을 생성(명도 전개) → 나머지 토큰은 공통</dd></div>
<h2 id="css">CSS Variables</h2><p>Light 기본값 + Dark 오버라이드(<code>prefers-color-scheme</code> 및 <code>[data-theme="dark"]</code>)를 포함합니다.</p>${codeBlock("tokencss", root, "css", "CSS 복사")}
<h2 id="radius">Radius</h2><p>역할별로 반경을 정해 두고, 모든 블록에 같은 반경을 찍지 않습니다. 타일을 클릭하면 토큰이 복사됩니다.</p>
<div class="tiles radius">${[["xs", 2], ["sm", 4], ["md", 8], ["lg", 12], ["xl", 16], ["full", 999]].map(([n, v]) => `<div style="border-radius:${v}px" data-copy-text="var(--radius-${n})" title="복사">${n} ${v === 999 ? "" : v}</div>`).join("")}</div>
<div class="kv"><dt>md 8</dt><dd>버튼, 입력 필드, 드롭다운</dd><dt>lg 12</dt><dd>카드, 패널, 테이블 컨테이너, 알림</dd><dt>xl 16</dt><dd>팝업</dd><dt>full</dt><dd>태그, 아바타, 스위치</dd><dt>sm 4</dt><dd>체크박스, 코드 강조</dd></div>
${tokenSection("radius-css", "CSS", "radius")}
<h2 id="motion">Motion</h2><p>전환·피드백 애니메이션의 지속 시간과 이징입니다. 컴포넌트 CSS 는 <code>--motion-*</code> 토큰만 참조하고, <code>prefers-reduced-motion</code> 일 때 모든 전환을 제거합니다.</p>
<div class="tablewrap"><table><thead><tr><th>토큰</th><th>값</th><th>용도</th></tr></thead><tbody><tr><td><code>--motion-fast</code></td><td>120ms ease-out</td><td>hover, 토글, 체크</td></tr><tr><td><code>--motion-base</code></td><td>200ms ease-in-out</td><td>드롭다운, 툴팁, 프로그레스</td></tr><tr><td><code>--motion-slow</code></td><td>320ms cubic-bezier(.2,.8,.2,1)</td><td>팝업, 드로어</td></tr></tbody></table></div>
${tokenSection("motion-css", "CSS", "motion")}
${codeBlock("motion-use", `.switch input{transition:background var(--motion-fast)}\n.popup{animation:popup-in var(--motion-slow)}\n@keyframes popup-in{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:none}}\n@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}`, "css", "CSS 복사")}
<h2 id="a11y">Accessibility</h2><p>WCAG 2.1 AA 를 기준으로 합니다.</p>
<ul><li>텍스트 대비 4.5:1, 대형 텍스트·UI 요소 3:1. Gray 500 이상만 텍스트에 사용</li><li>모든 인터랙션 키보드 접근, 포커스 링 항상 표시(<code>:focus-visible</code> 2px <code>--border-focus</code>)</li><li>색만으로 상태를 전달하지 않음(태그 라벨, 아이콘 병행)</li><li>클릭 타깃 최소 32px</li><li>동적 알림은 <code>aria-live</code>, 아이콘 전용 버튼은 <code>aria-label</code></li></ul>
${codeBlock("a11y-css", `:focus-visible{outline:2px solid var(--border-focus);outline-offset:2px}\n.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}`, "css", "CSS 복사")}
<h2 id="accent-js">Accent 스케일 생성 (JS)</h2><p>제품 메인 컬러 HEX 하나로 <code>--accent-50~900</code> 을 만들어 <code>:root</code> 에 주입합니다.</p>${codeBlock("accentjs", `function hexToHsl(hex){const n=parseInt(hex.slice(1),16);const r=((n>>16)&255)/255,g=((n>>8)&255)/255,b=(n&255)/255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0;const l=(mx+mn)/2;if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);switch(mx){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4;}h/=6;}return [h*360,s*100,l*100];}\nfunction hslToHex(h,s,l){s/=100;l/=100;const k=n=>(n+h/30)%12;const a=s*Math.min(l,1-l);const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return "#"+[f(0),f(8),f(4)].map(x=>Math.round(x*255).toString(16).padStart(2,"0")).join("").toUpperCase();}\nexport function accentScale(hex){const [h,s]=hexToHsl(hex);const L={50:96,100:90,200:80,300:68,400:56,500:46,700:30,800:22,900:14};const out={};for(const [k,l] of Object.entries(L)) out[k]=hslToHex(h,Math.min(100,s*(k<300?0.7:1)),l);out[600]=hex.toUpperCase();return out;}\nexport function applyAccent(hex){for(const [k,v] of Object.entries(accentScale(hex))) document.documentElement.style.setProperty("--accent-"+k,v);}`, "tsx", "JS 복사")}
<h2 id="tailwind">Tailwind 매핑</h2>${codeBlock("tw", `// tailwind.config.ts\nexport default { theme: { extend: {\n  colors: {\n    canvas: "var(--bg-canvas)", surface: "var(--bg-surface)", subtle: "var(--bg-subtle)", panel: "var(--bg-panel)",\n    fg: { DEFAULT: "var(--text-primary)", secondary: "var(--text-secondary)", tertiary: "var(--text-tertiary)", disabled: "var(--text-disabled)" },\n    line: { DEFAULT: "var(--border-default)", strong: "var(--border-strong)", focus: "var(--border-focus)" },\n    accent: { DEFAULT: "var(--accent)", hover: "var(--accent-hover)", pressed: "var(--accent-pressed)", subtle: "var(--accent-subtle)", on: "var(--accent-on)" },\n    brand: { DEFAULT: "var(--brand)", subtle: "var(--brand-subtle)" },\n    danger: "var(--danger)", warning: "var(--warning)", success: "var(--success)", info: "var(--info)",\n    sev: { critical: "var(--sev-critical)", high: "var(--sev-high)", medium: "var(--sev-medium)", low: "var(--sev-low)", info: "var(--sev-info)" },\n  },\n  borderRadius: { xs: "var(--radius-xs)", sm: "var(--radius-sm)", md: "var(--radius-md)", lg: "var(--radius-lg)", xl: "var(--radius-xl)", full: "var(--radius-full)" },\n  boxShadow: { 1: "var(--shadow-1)", 2: "var(--shadow-2)", 3: "var(--shadow-3)" },\n  fontFamily: { sans: "var(--font-sans)", mono: "var(--font-mono)" },\n  transitionDuration: { fast: "120ms", base: "200ms", slow: "320ms" },\n}}}`, "tsx", "복사")}`;
  },
  "components/overview": () => overviewPage("components"),
  "patterns/overview": () => overviewPage("patterns"),
  "resources/react": () => `<h1>React Package${nb("resources", "react")}</h1><p class="lead"><code>@jiran/ds-react</code> — 이 가이드의 30개 컴포넌트와 패턴 래퍼를 실제 React 컴포넌트로 구현한 패키지입니다. 사이트와 같은 클래스 마크업을 렌더링하므로 스타일시트 하나로 동작하고, 각 컴포넌트 페이지의 React 탭 코드가 곧 사용법입니다.</p>
<div class="meta">${tagOf("ready")}<span class="doc-tag">React 18 · 19</span><span class="doc-tag">TypeScript</span><span class="doc-tag">ESM · CJS</span><span class="doc-tag">${VERSION}</span></div>
<h2 id="install">설치</h2>${codeBlock("react-install", `npm i @jiran/ds-react\n\n// main.tsx — 앱 진입점에서 한 번\nimport "@jiran/ds-react/style.css";   // 토큰 + 컴포넌트 CSS (사이트 크롬 제외)\nimport { ToastProvider, applyAccent } from "@jiran/ds-react";\n\napplyAccent("#0B4171");               // 제품 메인 컬러 → --accent-50~900 생성\n\ncreateRoot(document.getElementById("root")!).render(\n  <ToastProvider>\n    <App />\n  </ToastProvider>,\n);`, "tsx", "복사")}
<div class="kv"><dt>테마</dt><dd><code>&lt;html data-theme="dark"&gt;</code> 또는 <code>setTheme("dark")</code>. 없으면 시스템 설정을 따릅니다. 포털(Popup·Toast)도 <code>&lt;html&gt;</code> 에서 토큰을 상속합니다</dd><dt>서체·배경</dt><dd>앱 루트에 <code>.ds-root</code> 를 붙이면 Pretendard · 본문 색 · 배경 토큰이 적용됩니다</dd><dt>브라우저</dt><dd><code>color-mix()</code> 사용 — Chrome 111+ · Safari 16.2+ · Firefox 113+</dd><dt>버전</dt><dd>패키지 major.minor 는 이 가이드 버전(${VERSION})과 같이 올립니다</dd></div>
<h2 id="usage">사용</h2><p>모든 컴포넌트는 <code>forwardRef</code> · <code>className</code> 병합 · 나머지 props 전달을 지원합니다. 변형은 HTML 클래스와 같은 이름의 prop 입니다.</p>
${codeBlock("react-usage", `import { Button, TextField, Tag, DataTable, useToast } from "@jiran/ds-react";\n\nfunction PolicyForm() {\n  const toast = useToast();\n  return (\n    <form onSubmit={(e) => { e.preventDefault(); toast.show("정책이 저장되었습니다"); }}>\n      <TextField label="정책 이름" required help="2~40자" />\n      <Tag tone="critical">Critical</Tag>\n      <Button type="submit" size="md" variant="primary">정책 저장</Button>\n    </form>\n  );\n}`, "tsx", "복사")}
<h2 id="map">컴포넌트 ↔ 클래스</h2><div class="tablewrap"><table><thead><tr><th>페이지</th><th>export</th><th>HTML 클래스</th></tr></thead><tbody>${allPages("components").filter(p => COMPONENTS[p.key]).map(p => { const c = COMPONENTS[p.key]; return `<tr><td><a href="#/components/${p.key}">${p.title}</a></td><td><code>${(c.react || []).join(", ")}</code></td><td><code>${[].concat(c.css || []).join(" ")}</code></td></tr>`; }).join("")}</tbody></table></div>
<h2 id="behavior">동작·접근성</h2><ul><li>Dropdown/Select: 바깥 클릭·Esc 닫힘, ↑↓ Home End 이동, <code>aria-haspopup/expanded</code>, <code>role=listbox|menu</code></li><li>Tabs: ←→ Home End, roving tabIndex, <code>aria-selected/controls</code></li><li>Popup: Portal + 배경, 포커스 트랩/복원, Esc, <code>role=dialog aria-modal aria-labelledby</code></li><li>ToastProvider/useToast: 우측 하단 스택, 자동 소멸(기본 4초), 최대 3개, <code>aria-live=polite</code></li><li>DatePicker/Calendar: <code>Intl</code> 로 요일·월 표기, min/max, range 선택, 프리셋</li><li>DataTable: 정렬(<code>aria-sort</code>) · 선택(헤더 indeterminate) · 행 액션 · 빈 상태</li><li>Checkbox/Radio/Switch/Slider/Accordion: 네이티브 요소 그대로(키보드·스크린리더 기본 지원)</li></ul>
<h2 id="dsjs">React 를 쓰지 않는 제품: assets/ds.js</h2><p>HTML+CSS 탭 코드를 그대로 쓰는 제품은 <code>assets/style.css</code> 와 함께 <code>assets/ds.js</code>(순수 JS · 의존성 없음 · 약 23KB)를 넣으면 이 사이트의 프리뷰와 같은 동작을 얻습니다. 클래스 마크업에 이벤트 위임으로 동작을 붙이므로 서버 렌더링·동적 추가 마크업에도 그대로 적용됩니다(동적으로 넣은 마크업의 초기 상태 동기는 <code>DS.init(root)</code>).</p>${codeBlock("dsjs-usage", dedent(`
        <link rel="stylesheet" href="assets/style.css">
        <script src="assets/ds.js" defer></script>

        <script>
          // 프로그램 API
          DS.toast("저장되었습니다", { action: { label: "실행 취소", onClick: undo } }); // tone:"danger", duration(ms, 0=유지)
          DS.popup.open("#confirm-delete"); // .popup 요소를 배경과 함께 표시(Esc·배경 클릭·[data-popup-close] 로 닫힘)
          document.addEventListener("ds:select", e => console.log(e.detail.value)); // ds:select · ds:tab · ds:page · ds:date · ds:slide
        <\/script>`), "html", "복사")}<table class="tbl compact"><thead><tr><th>컴포넌트</th><th>ds.js 가 붙이는 동작</th></tr></thead><tbody><tr><td>Dropdown / Select</td><td>트리거 토글, 항목 선택 시 트리거 텍스트 갱신(listbox), 바깥 클릭·Esc 닫힘, ↑↓ Home End Enter</td></tr><tr><td>Tabs · Select Button · Chip · Tile · List · Card</td><td><code>.on</code> + <code>aria-selected/pressed</code> 전환, Tabs ←→ 키와 <code>.tab-panel</code> 텍스트 갱신, Chip <code>.x</code> 제거, <code>.tile-grid[data-single]</code> 단일 선택, <code>.card-grid .card.clickable</code> 선택</td></tr><tr><td>Breadcrumb · Steps · Text Field</td><td><code>.more[data-items]</code> 상위 경로 펼치기, <code>.onboard [data-step=prev|next]</code> 단계 이동, <code>[maxlength]</code> 입력 시 <code>.counter</code> 갱신</td></tr><tr><td>Pagination · SideNav · TopBar</td><td>현재 페이지/메뉴 이동(<code>aria-current</code>), 이전/다음 비활성 계산</td></tr><tr><td>Slider · Search</td><td><code>--p</code> 트랙 채움·<code>.val</code> 표시, 지우기 버튼 표시/동작</td></tr><tr><td>DatePicker · Calendar</td><td>열기/닫기, 달력 없으면 자동 생성(기간 필드는 range), 달 이동, 날짜·기간 선택, 오늘·적용, <code>[data-preset=N]</code> 최근 N일</td></tr><tr><td>Checkbox · Terms · Data Table</td><td>전체 선택 ↔ indeterminate, 필수 약관 미동의 시 다음 비활성, 헤더 정렬(<code>aria-sort</code>) · 행 선택 · 액션 바 개수</td></tr><tr><td>Notice · Toast · Popup</td><td>닫기/액션 제거, <code>data-duration</code> 자동 소멸, <code>DS.toast()</code> · <code>DS.popup.open()</code>, 배경 클릭·Esc</td></tr></tbody></table><h2 id="dev">개발·검증</h2><div class="kv"><dt>소스</dt><dd><code>_react/src</code> · 예제 <code>_react/examples/&lt;sec&gt;/&lt;page&gt;/&lt;id&gt;.tsx</code>(= 이 사이트 React 탭 소스)</dd><dt>테스트</dt><dd><code>npm test</code> — 컴포넌트 동작 + <b>사이트 HTML 과 React 렌더 구조 일치</b>(태그·클래스·상태 속성) 118개 예제</dd><dt>빌드</dt><dd><code>npm run build</code> → <code>dist/</code> ESM·CJS·d.ts·style.css·fonts. <code>npm run demo</code> 전체 예제 미리보기</dd><dt>추가 규칙</dt><dd>컴포넌트를 추가하면 <code>components.data.js</code>(HTML·props) + <code>style.src.css</code> + <code>_react/src</code> + <code>_react/examples</code> 를 함께 갱신. verify 가 React 탭 누락을 잡습니다</dd></div>`,
  "resources/figma": () => `<h1>Figma Library</h1><p class="lead">디자인 파일과 라이브러리 구조입니다. 사이트의 각 컴포넌트 페이지와 Figma 섹션이 1:1 로 대응합니다.</p><div class="meta">${tagOf("ready")}<a class="doc-tag" href="${FIGMA}" target="_blank" rel="noopener">파일 열기 ↗</a></div>
<div class="tablewrap"><table><thead><tr><th>페이지</th><th>내용</th><th>가이드 대응</th></tr></thead><tbody><tr><td>Home</td><td>커버, Overview(파일 구성·작업 규칙), About, UX Principles</td><td>Home</td></tr><tr><td>Foundations</td><td>Overview · Base material(Colors · Elevation · Grid · Icons · Typography). Radius · Motion · Accessibility · 토큰 원본은 Resources › Design Token</td><td>Foundations</td></tr><tr><td>Components</td><td>30개 컴포넌트 (Selection Controls · Table 그룹 포함). 각 섹션에 사이트 코드와 같은 스펙의 Variant · Size · State 프레임과 HTML 코드 참조</td><td>Components</td></tr><tr><td>Patterns</td><td>Common UI · Service Pattern · Security Console. 각 패턴의 대표 예시 프레임</td><td>Patterns</td></tr><tr><td>Resources</td><td>Figma Library · Token Download · Changelog · Contribution</td><td>Resources</td></tr><tr><td>_Archive · …(v0.1)</td><td>이전 뼈대 페이지 보관 (참고용, 사용 안 함)</td><td>—</td></tr></tbody></table></div>
<h2 id="vars">Variables · Styles</h2><ul><li><b>Primitive</b>: color/{gray·accent·red·amber·emerald·sky}/{step}, color/brand/{step}, space/{n}, radius/{name}, size/{card-padding…}</li><li><b>Semantic</b>(Light/Dark): bg/ text/ border/ primary(=Accent)/ status/ severity/ — CSS 변수 이름과 1:1</li><li><b>Text Styles</b> 14단계 Pretendard(= <code>.t-*</code> 클래스) · <b>Effect Styles</b> Shadow Normal xs~xl · Spread sm/md(= <code>--shadow-*</code>, 1~3 은 별칭)</li></ul>
<h2 id="rules">작업 규칙</h2><ul><li>색은 Semantic 변수만, 글자는 Text Style만, 그림자는 Effect Style만.</li><li>Variant 속성명은 소문자(variant / size / state). 사이트 Props 표의 클래스 이름과 같게.</li><li>컴포넌트 Description에 용도·사용 규칙과 사이트 페이지 링크 기입.</li></ul>`,
  "resources/tokens": () => `<h1>Token Download</h1><p class="lead">CSS 변수와 JSON 형식으로 토큰을 내려받습니다.</p><div class="meta">${tagOf("ready")}</div>
<p><a href="#/resources/design-token">Design Token</a> 페이지에서 CSS 전체를 복사할 수 있고, 빌드 산출물 <code>_build/components.json</code> 에 토큰(light/dark)과 컴포넌트 스펙·예제 코드가 함께 들어 있습니다. JSON(Style Dictionary) 예시:</p>
${codeBlock("tok-json", `{\n  "color": { "accent": { "600": { "value": "{product.main}" } }, "brand": { "500": { "value": "#FF7F00" } } },\n  "space": { "4": { "value": "16px" } }, "radius": { "md": { "value": "8px" } }\n}`, "tsx")}<p>Figma Variables → JSON 내보내기 연동은 예정입니다.</p>`,
  "resources/changelog": () => `<h1>Changelog</h1><p class="lead">버전별 변경 이력입니다. 가이드와 Figma 파일의 버전을 함께 올립니다.</p>
<div class="tablewrap"><table><thead><tr><th>버전</th><th>날짜</th><th>내용</th></tr></thead><tbody>${CHANGELOG.map(c => `<tr><td><code>${c[0]}</code></td><td>${c[1]}</td><td>${c[2]}</td></tr>`).join("")}</tbody></table></div>`,
  "resources/contribution": () => `<h1>Contribution</h1><p class="lead">새 컴포넌트를 제안·검토·배포하는 절차입니다.</p><div class="meta">${tagOf("wip")}</div>
<ol><li><b>제안</b>: 필요 배경, 기존 컴포넌트로 안 되는 이유, 사용 화면 캡처</li><li><b>디자인 리뷰</b>: 디자인파트 검토(토큰 준수, 변형·상태 완비, 접근성)</li><li><b>구현 리뷰</b>: 개발팀 검토(Props 명세, 반응형, 키보드)</li><li><b>배포</b>: <code>_build/components.data.js</code> 에 예제·Props 추가 → <code>style.src.css</code> 의 Live component samples 블록에 CSS 추가 → 재빌드 → Figma 섹션 갱신 → Changelog 기록</li></ol>`,
};

Object.assign(PAGES, window.FOUNDATION_PAGES({ codeBlock, tokenSection, sw, nb, tagOf, STYLE, VERSION, PRODUCTS, ICONS, I, LIB, dedent }));

/* ============ router ============ */
function render() {
  const hash = location.hash || "#/home/overview"; const [, sec, key] = hash.split("/");
  let html; const isHome = sec === "home" && key === "overview";
  if (PAGES[`${sec}/${key}`]) html = PAGES[`${sec}/${key}`]();
  else if (sec === "components" && allPages("components").some(p => p.key === key)) html = componentPage(key);
  else if (sec === "patterns" && allPages("patterns").some(p => p.key === key)) html = patternPage(key);
  else if (SITE[sec] && allPages(sec).some(p => p.key === key)) html = templatePage(sec, key);
  if (!html) { html = `<h1>페이지를 찾을 수 없습니다</h1><p><a href="#/home/overview">홈으로</a></p>`; }
  $("#main").innerHTML = isHome ? `<div id="content" class="home">${html}</div>` : `<div class="page"><article id="content">${html}</article></div>`;
  document.title = (isHome ? "" : `${titleOf(sec, key)} · `) + "지란지교시큐리티 Design System";
  buildTopNav(); if (!$("#q").value.trim()) buildNav(); else markActive(); window.scrollTo(0, 0);
  document.body.dataset.route = `${sec}/${key}`;
}
window.addEventListener("hashchange", render);
$("#q").addEventListener("input", e => buildNav(e.target.value));
document.addEventListener("click", e => { const b = e.target.closest("[data-accent]"); if (b && window.applyAccent) window.applyAccent(b.dataset.accent); });
/* 스타일 텍스트: build.js 는 addInitScript 로 주입, 직접 열었을 때는 fetch(http 서버 필요) */
if (window.STYLE_TEXT) render();
else fetch("style.src.css").then(r => r.text()).then(t => { window.STYLE_TEXT = t; render(); }).catch(() => render());
