/* =========================================================
   foundations.js — Foundations 페이지 (Overview · Base material: Colors · Elevation · Grid · Icons · Typography, Web Desktop 만)
   render.js 가 PAGES 에 병합한다: Object.assign(PAGES, FOUNDATION_PAGES(helpers))
   ========================================================= */
window.FOUNDATION_PAGES = function (H) {
  const { codeBlock, tokenSection, sw, nb, tagOf, STYLE, VERSION, PRODUCTS, ICONS, I, LIB, dedent } = H;
  const attr = s => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

  /* ---------- 토큰 값 해석 (Light / Dark) ---------- */
  function vars() {
    const css = STYLE(); const L = LIB.parseVars(LIB.rootBlock(css, ":root")); const D = Object.assign({}, L, LIB.parseVars(LIB.rootBlock(css, ':root[data-theme="dark"]')));
    return { L, D };
  }
  const resolve = (m, v, d = 0) => { if (!v || d > 8) return v || ""; const mm = v.match(/^var\((--[\w-]+)\)$/); return mm ? resolve(m, m[mm[1]], d + 1) : v; };
  const short = v => v.replace(/^rgba\((\d+),(\d+),(\d+),(\.\d+)\)$/, "rgba($1 $2 $3 / $4)").replace(/,0 /g, ", 0 ");

  /* ---------- Semantic 스와치 행 ---------- */
  function semRow(items, o = {}) {
    const { L, D } = vars();
    return `<div class="sem-row${o.alpha ? " checker" : ""}">${items.map(([name, tok]) => `<div data-copy-text="var(${tok})" title="var(${tok}) 복사"><div class="bar${o.line ? " line" : ""}"><i style="background:var(${tok})"></i></div><div class="name">${name}</div><div class="tok">${tok}</div><div class="tok">${short(resolve(L, L[tok]))} · ${short(resolve(D, D[tok]))}</div></div>`).join("")}</div>`;
  }
  const sem = (id, title, desc, items, o) => `<h2 id="${id}">${title}</h2><p>${desc}</p>${semRow(items, o)}`;
  const pal = (title, steps, pre, note) => `<div class="pal"><h3>${title}${note ? ` <small style="font-weight:400;color:var(--text-tertiary);font-size:12px">${note}</small>` : ""}</h3><div class="scale" style="grid-template-columns:repeat(${steps.length},1fr)">${steps.map(s => sw(`--${pre}-${s}`, s)).join("")}</div></div>`;
  const tabset = (tabs, panes) => `<div class="doc-tabset"><div class="doc-tabs" role="tablist">${tabs.map(([k, t], i) => `<button type="button" role="tab" data-doctab="${k}" class="${i ? "" : "on"}" aria-selected="${i ? "false" : "true"}">${t}</button>`).join("")}</div>${tabs.map(([k], i) => `<div data-docpane="${k}"${i ? " hidden" : ""}>${panes[i]}</div>`).join("")}</div>`;
  const tbl = (head, rows, cls = "") => `<div class="tablewrap"><table class="${cls}"><thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;

  return {
    /* ================= Overview ================= */
    "foundations/overview": () => `<h1>Foundations</h1><p class="lead">모든 디자인 요소의 기반이 되는 가장 원자적인 단위입니다. 컬러, 타이포그래피, 간격·그리드, 아이콘, 엘리베이션처럼 시각 언어의 최소 단위로 구성되며, 컴포넌트는 이 단위(토큰)만 참조합니다.</p>
<div class="fnd-hero" aria-hidden="true"><div style="background:conic-gradient(var(--accent) 0 25%,var(--brand) 0 50%,var(--success) 0 75%,var(--gray-300) 0)"></div><div style="background:var(--bg-surface);box-shadow:var(--shadow-md);font-size:44px;letter-spacing:-.03em">Aa</div><div style="background:repeating-linear-gradient(90deg,var(--accent-subtle) 0 12px,transparent 12px 22px);border:1px solid var(--border-subtle)"></div><div style="background:var(--bg-surface);border:1px solid var(--border-subtle);color:var(--accent)">${I("shield", 48)}</div><div style="background:var(--bg-surface);box-shadow:var(--shadow-xl)"><i style="display:block;width:48px;height:48px;border-radius:12px;background:var(--bg-surface);box-shadow:var(--shadow-md)"></i></div></div>
<h2 id="base">Base material</h2>
<div class="base-list">${[["colors", "Colors", "색상의 시각적 일관성을 유지하고 효율적인 디자인 작업을 돕습니다."], ["typography", "Typography", "화면의 텍스트를 읽기 쉽고 아름답게 표현하도록 돕습니다."], ["grid", "Grid", "일관된 간격 체계를 사용하여 조화로운 비율과 정렬을 만들어냅니다."], ["icons", "Icons", "아이콘을 사용하여 인터페이스를 빠르게 이해하고 탐색할 수 있도록 돕습니다."], ["elevation", "Elevation", "컴포넌트 간의 명확한 깊이감과 시각적 계층을 만들어냅니다."]].map(([k, t, d]) => `<a href="#/foundations/${k}"><b>${t}${nb("foundations", k)}</b><span>${d}</span>${I("chevron-right", 18)}</a>`).join("")}</div>
<p>토큰 원본(CSS 변수 전체 · Radius · Motion · Accessibility)은 <a href="#/resources/design-token">Resources › Design Token</a> 에 있습니다.</p>`,

    /* ================= Colors ================= */
    "foundations/colors": () => {
      const semantic = `
${sem("primary", "Primary", "화면 안에서 가장 중요한 요소(버튼·링크·활성 상태)를 표현할 때 사용합니다. Normal · Strong · Heavy 3가지가 있으며 기본, hover, pressed 순으로 짙어집니다. Primary 는 <b>제품 메인 컬러가 들어가는 슬롯</b>이라 제품마다 값이 다르고, 나머지 토큰은 공통입니다.", [["Normal", "--accent"], ["Strong", "--accent-hover"], ["Heavy", "--accent-pressed"]])}
<div class="products">${PRODUCTS.map(p => `<div class="product"><div class="sw" style="background:${p.hex}">${p.hex}</div><div class="body"><b>${p.name}</b>${p.note}<br><button type="button" data-accent="${p.key}">이 컬러로 미리보기</button></div></div>`).join("")}</div>
${sem("primary-subtle", "Primary - Background", "선택 상태 배경, 강조 배너처럼 Primary 를 넓은 면에 옅게 깔 때와 Primary 위에 올라가는 글자색입니다.", [["Subtle", "--accent-subtle"], ["On Primary", "--accent-on"]])}
${sem("label", "Label", "텍스트와 아이콘에 사용하는 색상입니다. 본문은 Normal, 제목·수치 강조는 Strong, 보조 설명은 Neutral → Alternative 순으로 옅어지며, Disable 은 비활성 상태에만 씁니다. 텍스트는 배경과 4.5:1 이상의 대비를 확보합니다.", [["Normal", "--text-primary"], ["Strong", "--text-strong"], ["Neutral", "--text-secondary"], ["Alternative", "--text-tertiary"], ["Disable", "--text-disabled"]])}
${sem("fill", "Fill", "어떤 요소에 배경 색상이 필요한 경우 사용하는 투명도가 포함된 색상입니다. 정보가 있는 패널과 배경을 구분해야 할 때, hover 처럼 바탕색 위에 얹는 상태 표현에 사용합니다.", [["Normal", "--fill-normal"], ["Strong", "--fill-strong"], ["Alternative", "--fill-alternative"]], { alpha: true })}
${sem("line-normal", "Line - Normal", "Divider, Border 등 요소 간의 구분이 필요한 경우 사용합니다. 투명 값이 포함된 색상이라 어떤 배경 위에서도 자연스럽지만, 라인이 겹치면 짙어지므로 중첩하여 사용하지 않도록 유의합니다.", [["Normal", "--line-normal"], ["Neutral", "--line-neutral"], ["Alternative", "--line-alternative"]], { alpha: true, line: true })}
${sem("line-solid", "Line - Solid", "Border 와 Divider 를 중첩하여 사용할 때 겹침으로 짙어지는 것을 방지하기 위해 사용하는 불투명 라인입니다. 입력 필드·테이블 가로선은 Neutral, 강조 테두리는 Normal 을 씁니다.", [["Normal", "--border-strong"], ["Neutral", "--border-default"], ["Alternative", "--border-subtle"]], { line: true })}
${sem("bg-normal", "Background - Normal", "일반적인 화면의 배경 색상으로 활용합니다. 카드 UI 처럼 어떤 요소와 배경의 구분을 분명히 둬야 할 때 Alternative 를 바닥에 깔아 대비를 줍니다.", [["Normal", "--bg-canvas"], ["Alternative", "--bg-subtle"]])}
${sem("bg-elevated", "Background - Elevated", "카드·팝업처럼 층위가 있는 표면에 사용하는 배경 색상입니다. Light 에서는 Normal 과 같지만 Dark 에서는 한 단계 밝아 Background-Normal 과 색상 차이가 있습니다.", [["Normal", "--bg-surface"], ["Alternative", "--bg-panel"]])}
${sem("static", "Static", "Light · Dark 테마에 상관없이 고정된 고유 색입니다. 테마가 바뀌어도 색을 유지하여 해당 요소에 대비를 줄 때 사용합니다.", [["White", "--static-white"], ["Black", "--static-black"]])}
${sem("inverse", "Inverse", "테마의 대비가 반대인 요소에 적용하는 색상입니다. 주로 Tooltip 처럼 배경과 확실히 구분되어 정보를 인지시키는 용도로 사용합니다.", [["Primary", "--accent-inverse"], ["Background", "--bg-inverse"], ["Label", "--text-inverse"]])}
${sem("interaction", "Interaction", "상호작용 요소에서 활성화가 가능하거나(Inactive: 아직 선택되지 않은 상태) 상호작용이 불가능한 상태(Disable)를 표현할 때 사용합니다.", [["Inactive", "--interaction-inactive"], ["Disable", "--interaction-disable"]])}
${sem("status", "Status", "Positive · Cautionary · Negative · Informative 등 요소의 상태를 표현할 때 사용합니다. 승인/정상, 대기/검토, 반려/위험, 안내에 대응하며 원색 대신 채도를 낮춘 톤을 씁니다.", [["Positive", "--success"], ["Cautionary", "--warning"], ["Negative", "--danger"], ["Informative", "--info"]])}
${sem("status-bg", "Status - Background", "상태 색을 배경으로 넓게 쓸 때(알림 배너, 태그 바탕)의 옅은 색입니다. 위의 Status 색 글자와 짝을 이룹니다.", [["Positive", "--success-subtle"], ["Cautionary", "--warning-subtle"], ["Negative", "--danger-subtle"], ["Informative", "--info-subtle"]])}
${sem("sev-fg", "Severity - Foreground", "보안 도메인의 위협 심각도 5단계를 표현하는 색상입니다. Status 와는 다른 축이며 태그·점·밴드처럼 앞쪽 요소에 사용합니다. 색만으로 의미를 전달하지 않고 라벨을 병기합니다.", [["Critical", "--sev-critical"], ["High", "--sev-high"], ["Medium", "--sev-medium"], ["Low", "--sev-low"], ["Info", "--sev-info"]])}
${sem("sev-bg", "Severity - Background", "심각도를 배경(태그 바탕, 표 행 강조)에 쓸 때의 옅은 색입니다. 시각적 대비를 유지하기 위해 앞쪽 요소(Foreground)와 함께 씁니다.", [["Critical", "--sev-critical-bg"], ["High", "--sev-high-bg"], ["Medium", "--sev-medium-bg"], ["Low", "--sev-low-bg"], ["Info", "--sev-info-bg"]])}
<div class="panel left" style="min-height:0;padding:var(--space-6)"><span class="tag critical">Critical</span><span class="tag high">High</span><span class="tag medium">Medium</span><span class="tag low">Low</span><span class="tag info">Info</span></div>
${sem("brand", "Brand", "지란지교시큐리티 브랜드 컬러입니다. 이 시스템은 관리자 웹 제품 기준이라 제품 UI 의 Accent(Primary)로 쓰지 않으며, 헤더의 Accent 선택지에도 넣지 않습니다. 로고·헤더 마크 같은 회사 정체성 표기에만 쓰고, 브랜드 디자인 시스템은 별도로 제작합니다.", [["Normal", "--brand"], ["Subtle", "--brand-subtle"]])}
${sem("material", "Material", "팝업처럼 층위가 생길 때 배경과의 구분을 위해 뒤를 어둡게 표시해야 할 때 사용합니다.", [["Dimmer", "--dimmer"]], { alpha: true })}
${tokenSection("semantic-css", "CSS · Semantic 토큰", [/^--(bg|text|fill|line|border|interaction|sev)-/, /^--(accent|brand|danger|warning|success|info)(-(hover|pressed|subtle|on|inverse))?$/, /^--(static-white|static-black|dimmer)$/], "컴포넌트 CSS 는 아래 의미 토큰만 참조합니다. Dark 테마는 같은 이름에 다른 값을 매핑합니다(전체 원본은 <a href=\"#/resources/design-token\">Design Token</a>).")}`;
      const g = [0, 50, 100, 150, 200, 300, 400, 500, 550, 600, 700, 800, 900, 950], t11 = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
      const atomic = `<p>Semantic 토큰이 참조하는 원천 값(Primitive)입니다. 컴포넌트에서 직접 쓰지 않고, 새 의미 토큰을 만들 때 여기서 고릅니다. 숫자는 명도 단계(작을수록 밝음)입니다.</p>
${pal("Common", ["white", "black"], "static")}
${pal("Gray", g, "gray", "slate · 400 이하는 구조 요소, 500 이상은 텍스트")}
${pal("Brand", [50, 100, 200, 300, 400, 500, 600, 700, 800, 900], "brand", "#FF7F00 = 500")}
${pal("Accent", [50, 100, 200, 300, 400, 500, 600, 700, 800, 900], "accent", "제품 메인 컬러 = 600 · HEX 하나로 명도 전개")}
${pal("Red", t11, "red", "Negative · Severity Critical/High")}
${pal("Amber", t11, "amber", "Cautionary · Severity Medium")}
${pal("Emerald", t11, "emerald", "Positive")}
${pal("Sky", t11, "sky", "Informative · Severity Low")}
${tokenSection("primitive-css", "CSS · Primitive 토큰", [/^--(gray|brand|accent|red|amber|emerald|sky)-\d+$/, /^--static-/], "제품 적용 시 <code>--accent-*</code> 블록만 제품 컬러로 교체합니다(HEX 하나로 스케일을 만드는 <code>accentScale()</code> 은 <a href=\"#/resources/design-token\">Design Token</a> 참고).")}`;
      return `<h1>Colors${nb("foundations", "colors")}</h1><p class="lead">컬러 시스템은 시각적 일관성을 유지하고 효율적인 디자인 작업을 돕습니다. Gray Scale 이 화면의 바탕이고, Primary(제품 메인 컬러)는 핵심 정보를 강조하는 데만 씁니다. 상황에 맞는 색을 이름으로 고를 수 있도록 Semantic 토큰으로 제공하며, 스와치를 클릭하면 토큰이 복사됩니다.</p>
<div class="meta">${tagOf("ready")}<span class="doc-tag">Web Desktop</span><span class="doc-tag">Light · Dark</span><span class="doc-tag">Figma: Variables › Semantic · Primitive</span></div>
<h2 id="roles">브랜드 역할 맵</h2><p>색은 네 축으로만 씁니다. <b>제품 Primary</b> 는 행동과 선택, <b>Status</b> 는 처리 결과, <b>Severity</b> 는 보안 위협 등급, <b>Brand</b> 는 회사 정체성 표기입니다. 한 요소에 두 축을 겹치지 않고, 어느 축이든 색만으로 의미를 전달하지 않습니다. 이 시스템은 관리자 웹 제품 기준이라 Brand 는 제품 UI 의 Accent 가 아닙니다.</p>
${tbl(["역할", "쓰는 곳", "쓰지 않는 곳"], [
  ["<b>제품 Primary</b><br><small>제품 메인 컬러 슬롯</small>", "주요 행동 버튼(화면당 하나), 링크, 활성·선택 상태(탭 · 내비게이션 · 체크 · 스위치), 포커스 링", "위험도나 처리 결과 표현, 넓은 면의 장식 배경, 로고"],
  ["<b>Status</b><br><small>처리 결과</small>", "성공·실패·검토 대기 알림(토스트 · 배너 · 인라인 메시지), 입력 검증 오류, 파괴적 행동 버튼(<code>danger</code>)", "위협 등급(심각도) 표현, 탐색·선택 상태, 브랜드 강조"],
  ["<b>Severity</b><br><small>보안 위협 등급</small>", "위협·이벤트 등급 태그, 점·밴드, 표 행 강조, 대시보드 KPI. <b>항상 라벨(Critical 등)을 병기</b>", "버튼·링크, 일반 처리 결과(성공/실패), 색만 있는 점·배경"],
  ["<b>Brand</b><br><small>회사 정체성</small>", "로고 · 헤더 마크, 로그인 · 온보딩의 회사 정체성 표기", "제품 UI 의 Accent · CTA · 위험도 · 상태. 헤더 Accent 선택지에 없음 — 브랜드 디자인 시스템은 별도 제작"],
  ["<b>Gray</b><br><small>바탕과 구조</small>", "화면 바탕, 텍스트, 구분선, 비활성 상태. 정보 밀도가 높은 콘솔의 기본 색", "강조. 회색 톤 차이만으로 상태나 등급을 표현"]
])}
<div class="dodont">
  <div class="do"><div style="padding:var(--space-6) var(--card-pad) 0;display:flex;gap:12px;align-items:center;flex-wrap:wrap"><button type="button" class="btn md primary">정책 저장</button><button type="button" class="btn md secondary">취소</button><span style="margin-left:auto;display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:600"><i style="width:18px;height:18px;border-radius:50%;background:var(--brand);display:inline-block"></i>JS Console</span></div><div class="body"><p>주요 행동은 제품 Primary, 회사 정체성은 헤더 마크에만. 두 색이 같은 화면에 있어도 역할이 겹치지 않습니다.</p></div></div>
  <div class="dont"><div style="padding:var(--space-6) var(--card-pad) 0;display:flex;gap:12px;align-items:center;flex-wrap:wrap"><button type="button" class="btn md primary" style="background:var(--brand)">정책 저장</button><button type="button" class="btn md secondary" style="color:var(--brand);border-color:var(--brand)">취소</button></div><div class="body"><p>브랜드 색을 CTA 나 보조 버튼에 쓰지 않습니다. 제품 컬러가 바뀌어도 브랜드 색은 그대로라 제품 간 구분이 사라지고, 강조 위계도 깨집니다.</p></div></div>
  <div class="do"><div style="padding:var(--space-6) var(--card-pad) 0;display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="tag critical">Critical</span><span class="tag high">High</span><span class="tag medium">Medium</span><span class="tag low">Low</span><span class="tag info">Info</span></div><div class="body"><p>심각도는 Severity 색 + 라벨을 함께 씁니다. 색을 구분하지 못해도 등급을 읽을 수 있고, 다크 테마에서도 의미가 같습니다.</p></div></div>
  <div class="dont"><div style="padding:var(--space-6) var(--card-pad) 0;display:flex;gap:12px;align-items:center;flex-wrap:wrap"><i style="width:12px;height:12px;border-radius:50%;background:var(--sev-critical);display:inline-block"></i><i style="width:12px;height:12px;border-radius:50%;background:var(--sev-high);display:inline-block"></i><i style="width:12px;height:12px;border-radius:50%;background:var(--sev-medium);display:inline-block"></i><button type="button" class="btn md primary" style="background:var(--sev-critical)">차단</button></div><div class="body"><p>색만 있는 점으로 등급을 전달하거나, 심각도 색을 버튼에 쓰지 않습니다. 파괴적 행동은 Status 의 <code>danger</code> 버튼입니다.</p></div></div>
</div>
${tabset([["semantic", "Semantic"], ["atomic", "Atomic"]], [semantic, atomic])}`;
    },

    /* ================= Elevation ================= */
    "foundations/elevation": () => {
      const { L } = vars();
      const normal = [["None", "none"], ["XSmall", "xs"], ["Small", "sm"], ["Medium", "md"], ["Large", "lg"], ["XLarge", "xl"]];
      const spread = [["Small", "spread-sm"], ["Medium", "spread-md"]];
      const levels = list => `<div class="elev-levels">${list.map(([n, k]) => `<div data-copy-text="var(--shadow-${k})" title="var(--shadow-${k}) 복사"><i style="box-shadow:var(--shadow-${k})"></i><small>${n}</small></div>`).join("")}</div>`;
      const rows = [["1", "Shadow Normal XSmall", "--shadow-xs", "평면에 가깝지만 미세한 구분이 필요한 경우 (테이블 컨테이너, 입력 필드 hover)"], ["2", "Shadow Normal Small", "--shadow-sm", "페이지 위에 떠 있는 경우 (카드 · 패널 기본 구획 = <code>--shadow-1</code>)"], ["3", "Shadow Normal Medium", "--shadow-md", "상호작용 상태에서 강조가 필요한 경우 (카드 hover · 드롭다운 · 팝오버 = <code>--shadow-2</code>)"], ["4", "Shadow Normal Large", "--shadow-lg", "일시적으로 주요한 정보를 표시하는 더 높은 레이어 (토스트 · 드로어)"], ["5", "Shadow Normal XLarge", "--shadow-xl", "사용자의 시선을 완전히 집중시켜야 하는 주요 오버레이 (팝업 = <code>--shadow-3</code>)"], ["1", "Shadow Spread Small", "--shadow-spread-sm", "배경과 콘텐츠의 경계 사방에 구분이 필요한 경우 (화면 중앙 카드)"], ["2", "Shadow Spread Medium", "--shadow-spread-md", "경계 분리와 함께 보다 강조가 필요한 경우 (중앙 정렬 다이얼로그)"]];
      return `<h1>Elevation</h1><p class="lead">Elevation 은 Z축을 기준으로 두 표면 사이의 거리를 나타내는 시각적 체계입니다. 그림자와 배경 명도 차이를 조합하여 UI 컴포넌트 간의 깊이감과 시각적 계층을 만듭니다. 구획은 1px 보더를 겹치는 대신 배경 차이와 아주 부드러운 그림자로 만들어, 밀도가 높은 콘솔 화면에서도 정돈된 구조를 전달합니다.</p>
<div class="meta">${tagOf("ready")}<span class="doc-tag">Web Desktop</span><span class="doc-tag">Figma: Effect Styles</span></div>
<h2 id="type">Shadow type</h2>
<div class="elev-types"><div><div class="demo"><i style="box-shadow:var(--shadow-lg)"></i></div><b>Normal</b><span>빛의 위치에 따라 아래쪽으로 그림자가 생기는 일반적인 경우 사용합니다. 카드 · 드롭다운 · 팝업.</span></div><div><div class="demo"><i style="box-shadow:var(--shadow-spread-md)"></i></div><b>Spread</b><span>Dialog 처럼 그림자가 사방으로 고르게 퍼져야 하는 경우 사용합니다. 화면 중앙에 홀로 놓이는 표면.</span></div></div>
${tabset([["normal", "Normal"], ["spread", "Spread"]], [levels(normal), levels(spread)])}
<h2 id="composition">Composition</h2><p>더 자연스럽고 현실과 유사한 깊이감을 표현하기 위해 물체 주변으로 은은하게 퍼지는 주변광 그림자(Ambient shadow)와 특정 방향의 조명에 의해 생기는 뚜렷한 직사광 그림자(Key shadow)를 레이어링하여 구성합니다. 값이 두 겹인 이유입니다.</p>
<div class="elev-comp"><div class="box" style="box-shadow:0 8px 24px 0 rgba(15,23,42,.08)"><small>Ambient</small></div><span class="op">+</span><div class="box" style="box-shadow:0 2px 6px 0 rgba(0,0,0,.05)"><small>Key</small></div><span class="op">${I("chevron-right", 20)}</span><div class="box" style="box-shadow:var(--shadow-lg)"><small>Combined = Large</small></div></div>
<h2 id="style">Style</h2>${tbl(["레벨", "명칭", "토큰", "값 (Light)", "적용"], rows.map(([l, n, t, u]) => [l, n, `<code data-copy-text="var(${t})" title="복사" style="cursor:pointer">${t}</code>`, `<code style="white-space:pre-wrap">${L[t] || ""}</code>`, u]))}
<p><code>--shadow-1 · 2 · 3</code> 은 각각 Small · Medium · XLarge 의 별칭으로, 기존 컴포넌트 CSS 와 호환됩니다. 배경 음영(Dimmer)은 <a href="#/foundations/colors">Colors › Material</a> 을 참고하세요.</p>
${tokenSection("shadow-css", "CSS", "shadow")}`;
    },

    /* ================= Grid ================= */
    "foundations/grid": () => {
      const spaces = [[1, 4], [2, 8], [3, 12], [4, 16], [5, 20], [6, 24], [8, 32], [10, 40], [12, 48], [16, 64], [20, 80]];
      return `<h1>Grid</h1><p class="lead">그리드 시스템은 4px 기반의 일관된 간격 체계를 사용하여 모든 화면에서 조화로운 비율과 정렬을 만들어냅니다. Desktop 관리 콘솔을 기준으로 사이드 내비게이션 + 유동 콘텐츠 영역의 레이아웃을 쓰며, 콘텐츠 영역 안은 12단 컬럼 그리드로 배치합니다.</p>
<div class="meta">${tagOf("ready")}<span class="doc-tag">Web Desktop</span><span class="doc-tag">4px base · 12 columns</span></div>
<h2 id="artboard">Artboard size</h2><p>디자이너는 해상도별 모든 화면을 디자인할 필요 없이 아래 대표 규격만 설계합니다. 기준은 1440 이며, 대형 모니터는 콘텐츠 최대 너비만 넓어집니다.</p>
${tbl(["환경", "너비", "높이", "콘텐츠 최대 너비"], [["Web desktop (기준)", "1440px", "960px", "1160px"], ["Web desktop (대형)", "1920px", "1080px", "1600px"]])}
<h2 id="breakpoint">Breakpoint</h2><p>모바일·태블릿은 대응하지 않는 Desktop 전용 콘솔입니다. 1280 미만에서는 사이드 내비게이션을 접어 콘텐츠 폭을 확보합니다.</p>
${tbl(["명칭", "대응 환경", "너비", "레이아웃", "콘텐츠 최대 너비"], [["md", "데스크탑 소형 · 노트북", "1024 – 1279px", "사이드 내비 접힘 64 + 콘텐츠", "100% (Padding 20)"], ["lg", "데스크탑 (기준 1440)", "1280 – 1919px", "사이드 내비 240 + 콘텐츠", "1160px (Padding 24)"], ["xl", "데스크탑 대형", "1920px ~", "사이드 내비 240 + 콘텐츠", "1600px (Padding 24)"]])}
${codeBlock("bp-css", `/* Desktop-first */\n.app{display:grid;grid-template-columns:240px minmax(0,1fr)}\n.content{max-width:1160px;margin:0 auto;padding:0 24px}\n@media (max-width:1279px){.app{grid-template-columns:64px minmax(0,1fr)}.content{padding:0 20px}}\n@media (min-width:1920px){.content{max-width:1600px}}`, "css", "CSS 복사")}
<h2 id="spacing">Spacing</h2><p>예측 가능한 디자인 규칙과 개발자와의 원활한 소통을 위해 <b>4배수 간격</b>으로 구성합니다. 기준은 4px 이며, 시각 보정이 필요할 때는 2px 단위로 움직이고 불가피할 때만 1px 씩 조정합니다. 카드 내부 padding 24, 카드·요소 사이 gap 20, 섹션 사이 48~64 를 기본으로 넉넉히 잡아 답답한 밀도를 피합니다. 막대를 클릭하면 토큰이 복사됩니다.</p>
<div class="space-bars">${spaces.map(([k, v]) => `<div class="${v === 4 ? "base" : ""}" data-copy-text="var(--space-${k})" title="var(--space-${k}) 복사"><b>${v}</b><i style="width:${v}px"></i><small>space-${k}</small></div>`).join("")}</div>
${tokenSection("space-css", "CSS", ["space-", "card-", "row-h"])}
<h2 id="layout">Layout</h2><p>콘텐츠 영역 안은 24px 의 간격(gutter)을 두는 12단 컬럼 그리드를 사용하며, 화면 너비에 맞게 유연하게 대응합니다. 컬럼은 자유롭게 병합하여 사용합니다(KPI 카드 4단 = 3컬럼씩, 폼 2단 = 6컬럼씩).</p>
<h3>Desktop</h3><p>사이드 내비게이션 240px 을 제외한 콘텐츠 영역(최대 1160px)에 12단 컬럼, 좌우 여백 24px, 간격 24px.</p>
<div class="shell-demo"><div class="side">Side nav 240</div><div class="main"><i>Content · max 1160 · padding 24</i></div></div>
<div class="grid-demo"><div class="cols">${Array.from({ length: 12 }, (_, i) => `<i data-n="${i + 1}"></i>`).join("")}</div><div class="meta-row"><span>margin 24</span><span>12 columns · gutter 24</span><span>margin 24</span></div></div>
${codeBlock("grid-css", `.grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:24px}\n.col-3{grid-column:span 3}   /* KPI 카드 4개 */\n.col-4{grid-column:span 4}   /* 카드 3개 */\n.col-6{grid-column:span 6}   /* 2단 폼 */\n.col-8{grid-column:span 8}   /* 본문 + .col-4 사이드 */\n.col-12{grid-column:1 / -1}  /* 테이블 · 차트 전체 폭 */`, "css", "CSS 복사")}`;
    },

    /* ================= Icons ================= */
    "foundations/icons": () => {
      const KO = { search: "검색 찾기", plus: "추가 더하기 새로", download: "다운로드 내려받기 저장", trash: "삭제 쓰레기통 지우기", pencil: "편집 수정 연필", refresh: "새로고침 갱신 동기화", copy: "복사", filter: "필터 거르기", x: "닫기 취소 삭제 엑스", check: "체크 확인 완료", dots: "더보기 점 메뉴", "external-link": "외부 링크 새창", "chevron-left": "이전 왼쪽 화살", "chevron-right": "다음 오른쪽 화살", "chevron-down": "펼치기 아래 화살", "arrow-up": "위 증가 상승", "arrow-down": "아래 감소 하락", "arrows-sort": "정렬", "sort-ascending": "오름차순 정렬", "sort-descending": "내림차순 정렬", "info-circle": "정보 안내", "alert-triangle": "경고 주의 위험", "alert-circle": "경고 오류 알림", "circle-check": "성공 완료 확인", home: "홈 대시보드", list: "목록 리스트", user: "사용자 계정 사람", server: "서버 장비", shield: "보안 방패 보호", bell: "알림 벨", settings: "설정 톱니", "chart-bar": "차트 통계 그래프", calendar: "달력 날짜 일정", inbox: "메일 수신함", "layout-grid": "그리드 레이아웃 격자", moon: "다크모드 밤 달" };
      const names = Object.keys(ICONS).sort();
      const tile = n => { const m = ICONS[n]; const kw = [n, m.category, ...(m.tags || []), KO[n] || ""].join(" ").toLowerCase(); return `<button type="button" class="icon-tile${m.f ? "" : " no-f"}" data-name="${n}" data-cat="${attr(m.category || "")}" data-tags="${attr((m.tags || []).join("|"))}" data-ko="${attr(KO[n] || "")}" data-kw="${attr(kw)}" data-copy-o="${attr(I(n, 24))}"${m.f ? ` data-copy-f="${attr(I(n, 24, { style: "filled" }))}"` : ""} title="${n}" aria-label="${n} 상세 보기" aria-haspopup="dialog"><span class="o">${I(n, 24)}</span>${m.f ? `<span class="f">${I(n, 24, { style: "filled" })}</span>` : ""}</button>`; };
      return `<h1>Icons${nb("foundations", "icons")}</h1><p class="lead">아이콘은 기능이나 콘텐츠를 시각적으로 표현하는 요소로, 사용자가 인터페이스를 빠르게 탐색할 수 있도록 돕습니다. 24px 그리드 · 스트로크 2px · 라운드 캡의 단순하고 현대적인 형태(Tabler Icons · MIT)를 쓰며, 기본은 Outline 이고 선택·활성 상태 강조에만 Filled 를 씁니다.</p>
<div class="meta">${tagOf("ready")}<span class="doc-tag">Web Desktop</span><span class="doc-tag">24 grid · stroke 2 · currentColor</span><span class="doc-tag">assets/icons/outline · filled</span></div>
<h2 id="search">Search icons</h2><p>사이트와 컴포넌트가 실제로 사용하는 아이콘입니다(전체 세트 3,000+ 는 <code>assets/icons/</code>). 검색 시 이름뿐 아니라 연상되는 유사한 키워드(한글 포함)를 함께 검색합니다. 아이콘을 클릭하면 이름 · 키워드 · 사용 코드와 함께 SVG 를 복사·다운로드할 수 있습니다.</p>
<div class="icon-tools"><div class="searchbar" role="search">${I("search")}<input type="search" id="iconSearch" placeholder="아이콘을 검색해주세요" aria-label="아이콘 검색"></div><div class="select-btn" role="group" aria-label="아이콘 스타일" id="iconStyle"><button type="button" class="on" aria-pressed="true" data-style="outline">Outline</button><button type="button" aria-pressed="false" data-style="filled">Filled</button></div><span id="iconCount" style="font-size:12px;color:var(--text-tertiary)">${names.length}개</span></div>
<div class="icon-grid" id="iconGrid">${names.map(tile).join("")}</div><div class="icon-empty" id="iconEmpty" hidden>검색 결과가 없습니다. 세트 밖의 아이콘은 <code>assets/icons/</code> 에서 찾아 <code>_build/icons.js</code> 의 <code>ICON_NAMES</code> 에 추가하세요.</div>
<div hidden id="iconModalHome"><div class="popup icon-modal" id="iconModal" role="dialog" aria-modal="true" aria-labelledby="iconModalTitle">
<div class="popup-title"><code id="iconModalTitle">icon</code><span class="tag sm" id="iconModalStyle">Outline</span><span class="tag sm" id="iconModalCat">System</span></div>
<button type="button" class="btn sm tertiary icon popup-close" data-popup-close aria-label="닫기">${I("x", 18)}</button>
<div class="icon-preview" id="iconModalPreview"></div>
<div class="icon-meta"><b>Keyword</b><div class="icon-kws" id="iconModalKw"></div></div>
<div class="icon-meta"><b>Usage</b><pre class="icon-code"><code id="iconModalCode"></code></pre></div>
<div class="popup-actions"><a class="btn sm secondary" id="iconModalDl" href="#" download>SVG 다운로드</a><button type="button" class="btn sm secondary" id="iconModalCopyCode" data-copy="iconModalCode" data-label="코드 복사">코드 복사</button><button type="button" class="btn sm primary" id="iconModalCopy" data-copy-text="" data-label="SVG 복사">SVG 복사</button></div>
</div></div>
<h2 id="usage">Usage</h2><p>인라인 SVG 가 기본입니다(색 상속 <code>currentColor</code>, 크기 자유). 의미 색은 부모에 토큰(<code>color:var(--danger)</code>)으로 줍니다. 사용 크기: 14 배지 · 16 표/페이지네이션 · 18 버튼/입력 · 20 알림 · 24 빈 화면/타일. 정적 파일이 필요하면 <code>assets/icons/outline/{name}.svg</code> 를 img 로, 배경·가상 요소에는 CSS mask 로 씁니다.</p>
${codeBlock("icon-inline", I("search", 18).split("><").join(">\n  <").replace("\n  </svg>", "\n</svg>"), "html")}
${codeBlock("icon-react", `// React: @jiran/ds-react 의 Icon (이 페이지의 ${names.length}개, 사이트와 같은 마크업)\nimport { Icon } from "@jiran/ds-react";\n\n<Icon name="search" size={18} />\n<Icon name="shield" size={24} filled />\n<Icon name="alert-triangle" label="경고" />  // role="img" + aria-label\n\n// 세트 밖의 아이콘: 같은 세트의 공식 패키지\n// npm i @tabler/icons-react → import { IconSearch } from "@tabler/icons-react";`, "tsx")}
${codeBlock("icon-img", `<!-- 정적 파일 (색 상속 불가, 장식용) -->\n<img src="assets/icons/outline/search.svg" width="18" height="18" alt="">\n\n<!-- CSS mask: currentColor 로 색 상속 -->\n.ico-search{width:18px;height:18px;background:currentColor;-webkit-mask:url("assets/icons/outline/search.svg") center/contain no-repeat;mask:url("assets/icons/outline/search.svg") center/contain no-repeat}`, "html")}
<div class="kv"><dt>파일 · 이름</dt><dd><code>assets/icons/{outline|filled}/{name}.svg</code> — Tabler 원본 이름 그대로(kebab-case). Figma 는 Tabler Icons 라이브러리, 컴포넌트 이름 = 파일 이름</dd><dt>사이트 소스</dt><dd><code>I("name", size, { style: "filled" })</code> 헬퍼(<code>_build/icons.js</code>). 새 아이콘은 <code>ICON_NAMES</code> 에 추가하면 빌드 시 인라인되고 이 갤러리와 React <code>Icon</code> 에 함께 나타납니다</dd></div>`;
    },

    /* ================= Typography ================= */
    "foundations/typography": () => {
      const ramp = [["Display 1", "t-display-1", 40, 52, "-0.0282em", 700], ["Display 2", "t-display-2", 32, 44, "-0.0253em", 700], ["Heading 1", "t-heading-1", 28, 38, "-0.0236em", 700], ["Heading 2", "t-heading-2", 24, 32, "-0.023em", 700], ["Heading 3", "t-heading-3", 20, 28, "-0.012em", 700], ["Heading 4", "t-heading-4", 18, 26, "-0.002em", 700], ["Title 1", "t-title-1", 16, 24, "0.0057em", 500], ["Title 2", "t-title-2", 14, 20, "0.0145em", 500], ["Body 1", "t-body-1", 16, 26, "0.0057em", 400], ["Body 2", "t-body-2", 14, 22, "0.0145em", 400], ["Label 1", "t-label-1", 14, 20, "0.0145em", 500], ["Label 2", "t-label-2", 12, 16, "0.0252em", 500], ["Caption 1", "t-caption-1", 12, 18, "0.0252em", 400], ["Caption 2", "t-caption-2", 10, 14, "0.0311em", 400]];
      const wname = { 700: "Bold", 500: "Medium", 400: "Regular" };
      return `<h1>Typography</h1><p class="lead">타이포그래피는 텍스트를 읽기 쉽고 아름답게 표현하는 시각적 체계로, 폰트 선택 · 크기 · 굵기 · 행간 · 자간을 조합하여 정보의 위계와 가독성을 만들어냅니다. 서체 하나(Pretendard)로 타이틀 · 본문 · 숫자 · 캡션의 크기와 굵기 차이를 분명히 두어 위계를 만들고, 각 단계는 <code>.t-*</code> 유틸리티 클래스로 제공합니다.</p>
<div class="meta">${tagOf("ready")}<span class="doc-tag">Web Desktop</span><span class="doc-tag">Pretendard Variable</span><span class="doc-tag">Figma: Text Styles ${ramp.length}</span></div>
<h2 id="basic">Basic typography</h2><p>한국어와 영어를 함께 쓰는 관리 콘솔의 기본 글꼴로 <a href="https://github.com/orioncactus/pretendard" target="_blank" rel="noopener">Pretendard</a> 를 사용합니다. 가변 서체 하나(Regular 400 · Medium 500 · Bold 700)로 모든 굵기를 표현하며, 숫자는 자릿수가 바뀌어도 폭이 같은 고정폭 숫자(tabular numbers)로 표 · KPI 의 정렬을 유지합니다.</p>
<div class="type-sample"><b>Pretendard 프리텐다드 Aa</b><span class="num t-num">0123456789 · 1,284 · 99.2%</span></div>
${codeBlock("typo-font", `@font-face{font-family:"Pretendard";font-weight:45 920;font-style:normal;font-display:swap;src:url("fonts/PretendardVariable.woff2") format("woff2-variations")}\n:root{--font-sans:"Pretendard",-apple-system,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;--font-mono:ui-monospace,"SF Mono",Menlo,Consolas,"D2Coding",monospace}\nbody{font-family:var(--font-sans);font-size:16px;line-height:1.65;font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased}`, "css", "CSS 복사")}
<h2 id="wordbreak">Word break</h2><p>개발 시 본문 · 표 · 설명 텍스트는 브라우저 기본값대로 <b>음절 단위</b>로 줄바꿈됩니다. 따라서 디자인에서 별도로 줄바꿈 위치를 지정하지 않아도 되고, 폭이 좁은 셀에서도 넘치지 않습니다. 제목 · 알림 · 빈 화면 문구처럼 짧고 눈에 띄는 문장만 <code>.keep-all</code> 로 <b>단어 단위</b> 줄바꿈을 적용합니다.</p>
<div class="wb-demo"><div><p style="max-width:300px"><mark>보안</mark> <mark>정책이</mark> <mark>적용되어</mark> <mark>모든</mark> <mark>단말이</mark> <mark>보호되고</mark> <mark>있습니다</mark></p><small>기본 · 음절 단위 — 좁은 폭에서 어절 중간에서도 줄이 바뀝니다</small></div><div><p class="keep-all" style="max-width:300px"><mark>보안</mark> <mark>정책이</mark> <mark>적용되어</mark> <mark>모든</mark> <mark>단말이</mark> <mark>보호되고</mark> <mark>있습니다</mark></p><small>.keep-all · 단어 단위 — 어절이 끊기지 않고 줄이 바뀝니다</small></div></div>
${codeBlock("typo-wb", `/* 기본: 음절 단위(브라우저 기본). 제목·알림 등 짧은 문장만 단어 단위 */\n.keep-all{word-break:keep-all;overflow-wrap:anywhere}`, "css", "CSS 복사")}
<h2 id="style">Style</h2><p>Figma Text Style 이름과 1:1 인 ${ramp.length}단계입니다. 자간은 Pretendard 권장값(크기가 작을수록 넓게)을 따르고, 행간은 px 로 고정해 컴포넌트 높이를 예측할 수 있게 합니다. 숫자에는 <code>.t-num</code> 을 함께 씁니다. 클래스를 클릭하면 복사됩니다.</p>
${tbl(["명칭", "크기", "행간", "자간", "굵기", "클래스"], ramp.map(([n, cls, s, lh, ls, w]) => [`<span class="smp ${cls}">${n}</span>`, `${s}px`, `${lh}px (${(lh / s).toFixed(3).replace(/0+$/, "")})`, ls, `${w} ${wname[w]}`, `<code data-copy-text=".${cls}" title="클래스 복사" style="cursor:pointer">.${cls}</code>`]), "type-table")}
<div class="kv" style="margin-top:var(--space-6)"><dt>페이지 타이틀</dt><dd>Heading 2 · 화면 제목, 페이지당 하나</dd><dt>섹션 · 카드 타이틀</dt><dd>Heading 4 · Title 1</dd><dt>본문 · 표 셀</dt><dd>Body 2 (14) — 콘솔 기본 크기</dd><dt>KPI 수치</dt><dd>Display 2 + <code>.t-num</code></dd><dt>필드 라벨 · 태그 · 표 헤더</dt><dd>Label 2 · Label 1</dd><dt>보조 설명</dt><dd>Caption 1</dd></div>
${codeBlock("typo-css", LIB.cssFor([".t-", ".keep-all"], STYLE(), VERSION), "css", "CSS 복사")}`;
    },
  };
};
