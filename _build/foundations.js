/* =========================================================
   foundations.js — Foundations 페이지 (Overview · Base material: Colors · Elevation · Grid · Icons · Interaction · Typography · Writing, Web Desktop 만)
   render.js 가 PAGES 에 병합한다: Object.assign(PAGES, FOUNDATION_PAGES(helpers))
   ========================================================= */
window.FOUNDATION_PAGES = function (H) {
  const { codeBlock, tokenSection, sw, nb, STYLE, VERSION, PRODUCTS, ICONS, I, LIB, dedent, tbl } = H;
  const dodont = (doShot, doText, dontShot, dontText) => `<div class="dodont">
  <div class="do"><div class="shot">${doShot}</div><div class="body"><p>${doText}</p></div></div>
  <div class="dont"><div class="shot">${dontShot}</div><div class="body"><p>${dontText}</p></div></div>
</div>`;
  const attr = s => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

  /* ---------- 토큰 값 해석 (Light / Dark) ---------- */
  function vars() {
    const css = STYLE(); const px = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, LIB.toPx(v)]));   // 값 표시는 기준 화면 px(2026-11-11 rem 전환)
    const L = px(LIB.parseVars(LIB.rootBlock(css, ":root"))); const D = Object.assign({}, L, px(LIB.parseVars(LIB.rootBlock(css, ':root[data-theme="dark"]'))));
    return { L, D };
  }

  /* ---------- 값 팝오버 (Colors · Elevation · Icons 공용) ----------
     머리의 테마 아이콘(해/달) · 아이콘 미리보기 · 다운로드는 종류에 따라 하나만 보인다 — #valPop 의 .kind-icon 으로 가린다.
     해/달을 .val-pop-theme 로 감싼 이유: 다크 규칙이 :root[data-theme="dark"] .val-pop .i-moon 이라 특정도가 높아, 래퍼를 숨기는 편이 깔끔하다.
     줄(Hex/RGBA/Token · Value/Token)은 app.js 가 클릭 시점에 만든다 — 종류와 테마·제품 컬러에 따라 달라지므로 */
  const valPop = () => `<div class="val-pop" id="valPop" hidden tabindex="-1" role="dialog" aria-labelledby="valPopTitle">
<div class="val-pop-head"><span class="val-pop-theme"><span class="i-sun" title="Light 테마 값">${I("sun-high", 18)}</span><span class="i-moon" title="Dark 테마 값">${I("moon", 18)}</span></span><span class="val-pop-icon" id="valPopIcon"></span><span class="val-pop-title" id="valPopTitle">Value</span><a class="btn sm assistive icon-only val-pop-dl" id="valPopDl" href="#" download aria-label="SVG 다운로드" title="SVG 다운로드">${I("download", 18)}</a><button type="button" class="btn sm assistive icon-only" id="valPopCopy" data-copy-text="" aria-label="토큰 복사" title="토큰 복사"><span class="i-copy">${I("copy", 18)}</span><span class="i-copied">${I("check", 18)}</span></button></div>
<div class="val-rows" id="valPopRows"></div></div>`;

  /* ---------- Semantic 스와치 행 ---------- */
  /* 셀은 버튼이다 — 클릭하면 app.js 의 openColor() 가 바로 아래에 값 팝오버를 띄운다(Atomic 스와치도 같은 .val-cell)(키보드로도 열림).
     data-copy-text 를 두면 복사 위임 핸들러가 먼저 걸려 팝오버가 열리지 않으므로 붙이지 않는다.
     값(Hex·RGBA)은 테마·제품 컬러에 따라 달라지므로 빌드가 아니라 클릭 시점의 렌더 색에서 읽는다. */
  function semRow(items, o = {}) {
    /* "Background - Normal" 섹션의 "Normal" 처럼 섹션 제목이 이미 이름으로 끝나면 되풀이하지 않는다 */
    const label = name => (!o.group ? name : o.group.toLowerCase().endsWith(name.toLowerCase()) ? o.group : o.group + " / " + name);
    return `<div class="sem-row${o.alpha ? " checker" : ""}">${items.map(([name, tok]) => `<button type="button" class="val-cell" data-token="${tok}" data-label="${attr(label(name))}" aria-haspopup="dialog" title="${attr(label(name))} 값 보기"><div class="bar"><i style="background:${o.preview ? o.preview(tok) : `var(${tok})`}"></i></div><div class="name">${name}</div></button>`).join("")}</div>`;
  }
  /* 제품 색 팔레트(data.js PRODUCTS — 2026-11-14 사람의 결정). 흰 글자 대비는 빌드가 hex 에서 계산한다(사람이 숫자를 적지 않는다).
     AI 의 그라데이션 끝 hex 는 style.src.css 의 램프에서 읽는다 */
  function productColor() {
    const css = STYLE();
    const ramp = (n) => (new RegExp("--" + n + ":(#[0-9A-Fa-f]{6})").exec(css) || [])[1] || "";
    const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const lum = (h) => { const c = [1, 3, 5].map((i) => lin(parseInt(h.slice(i, i + 2), 16))); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
    const white = (h) => (1.05 / (lum(h) + 0.05)).toFixed(2);
    const NOTE = { base: "기본 토큰 값(Blue 램프) — 아무것도 주입하지 않습니다", ramp: "제품 HEX 하나로 다섯 단계를 만듭니다", neutral: "중립 램프로 갈아끼웁니다 — 라이트는 진한 회색 면 · 흰 글자, 다크는 밝은 회색 면 · 어두운 글자", ai: "대표 단색으로 다섯 단계를 만들고, 주 버튼 · Banner 만 그라데이션입니다" };
    const rows = PRODUCTS.map((p) => {
      const g = p.gradient ? p.gradient.rest.map(ramp) : null;
      const swatch = g ? `linear-gradient(90deg,${g[0]},${g[1]})` : p.hex;
      const val = g ? `<code>${p.hex}</code> · 그라데이션 <code>${g[0]}</code> → <code>${g[1]}</code>` : `<code>${p.hex}</code>`;
      const ratio = p.kind === "neutral" ? "라이트 " + white(p.hex) + " · 다크는 어두운 글자" : g ? `${white(p.hex)} · 끝 ${white(g[0])} · ${white(g[1])}` : white(p.hex);
      const notes = [NOTE[p.kind], p.neutralFocus ? "입력 필드 포커스 링은 중립" : "", p.exception ? `<b>예외</b> — ${p.exception}` : ""].filter(Boolean).join(". ");
      return [`<span class="pc-sw" style="background:${swatch}"></span><b>${p.name}</b>`, val, ratio, notes,
        `<button type="button" class="btn sm outline assistive" data-accent="${p.kind === "base" ? "" : p.key}" aria-label="${p.name} 적용">적용</button>`];
    });
    return `<h2 id="product-color">Product color</h2>
<p>제품 색은 아래 팔레트에서 하나를 고릅니다. 고른 색이 <code>--prod-40~60</code> 다섯 단계로 들어가 brand 토큰을 쓰는 곳 — 저장 · 설정 · 추가 같은 주 버튼, 링크, 내비게이션의 선택, 탭, 체크박스 · 라디오 · 스위치, 포커스 링 — 이 모두 그 색으로 바뀝니다. 1.0 전에는 제공된 일곱 가지만 쓰고, <b>1.0 뒤에는 사용자가 색을 더하거나 고칠 수 있는 팔레트</b>를 제공합니다.</p>
${tbl(["이름", "값", "흰 글자 대비", "설명", "적용"], rows, "product-colors")}
<ul class="bullets">
<li><b>상태색과 겹쳐도 제품 색 그대로</b> — 예전에는 제품 색이 상태색과 색상환 15° 안이면 자동으로 중립으로 바꿨습니다. 제품의 독립성을 위해 걷어냈고, 중립은 팔레트에서 고릅니다.</li>
<li><b>화면의 삭제 버튼은 Assistive</b> — 빨강 Negative 버튼은 위험 확인 팝업에서 되돌릴 수 없는 일을 확정하는 버튼에만 씁니다. 빨강 제품(제품1)에서도 주 버튼과 빨강 확정 버튼이 한 화면에 함께 놓이지 않습니다.</li>
<li><b>제품1(빨강) · 브랜드(주황)의 입력 포커스 링은 중립</b> — 오류 링(빨강) · 경고색(주황)과 헷갈리지 않게 합니다. 체크박스 · 버튼의 포커스 외곽선은 제품 색 그대로입니다.</li>
<li><b>흰 글자 4.5</b> — Brand 면의 글자는 늘 흰색이라 제품 색이 그 흰 글자를 받쳐야 하고 빌드가 검사합니다. 넘지 못하는 색은 사람의 결정으로 이유를 선언해야 합니다(브랜드 주황).</li>
<li><b>다크 글자 단계는 자동으로 밝힘</b> — 다크의 brand 글자(60 단계)가 어두운 바탕 셋 위 4.5 를 넘을 때까지 밝힙니다. 채도 높은 빨강 · 보라가 여기에 걸립니다.</li>
<li><b>다크 주 면도 자동으로 밝힘</b> — 다크에서 주 버튼 같은 채운 제품 면이 어두운 바탕 셋과 구분되지 않으면, 구분될 때까지 그 면만 밝힙니다. 어두운 남색인 제품3이 여기에 걸리고, 라이트에서는 제품 색 그대로입니다.</li>
</ul>`;
  }
  /* o.h3 — 상위 h2 아래 묶이는 절(Theme 의 구성원들). 포함 관계가 ToC 에 드러나야 한다 */
  const sem = (id, title, desc, items, o = {}) => `<h${o.h3 ? 3 : 2} id="${id}">${title}</h${o.h3 ? 3 : 2}><p>${desc}</p>${semRow(items, Object.assign({ group: title }, o))}`;
  /* 칸 수는 인라인 style 로 주면 반응형 규칙이 이길 수 없다 → 커스텀 속성으로 넘긴다.
     repeat() 의 반복 횟수는 정수여야 해 CSS 에서 min() 을 못 쓰므로, 모바일 상한(7·5)도 여기서 계산한다(Common 2칸이 7칸으로 찢어지지 않게) */
  const pal = (title, steps, pre, note) => `<div class="pal"><h3>${title}${note ? ` <small style="font-weight:400;color:var(--foreground-neutral-tertiary);font-size:12px">${note}</small>` : ""}</h3><div class="scale" style="--cols:${steps.length};--cols-sm:${Math.min(steps.length, 7)};--cols-xs:${Math.min(steps.length, 5)}">${steps.map(s => sw(`--${pre}-${s}`, s, title)).join("")}</div></div>`;
  const tabset = (tabs, panes) => `<div class="doc-tabset"><div class="doc-tabs" role="tablist">${tabs.map(([k, t], i) => `<button type="button" role="tab" data-doctab="${k}" class="${i ? "" : "on"}" aria-selected="${i ? "false" : "true"}">${t}</button>`).join("")}</div>${tabs.map(([k], i) => `<div data-docpane="${k}"${i ? " hidden" : ""}>${panes[i]}</div>`).join("")}</div>`;

  return {
    /* ================= Overview ================= */
    "foundations/overview": () => `<h1>Foundations</h1><p class="lead">모든 디자인 요소의 기반이 되는 가장 원자적인 단위입니다. 컬러, 타이포그래피, 간격·그리드, 아이콘, 엘리베이션처럼 시각 언어의 최소 단위로 구성되며, 컴포넌트는 이 단위만 가져다 씁니다. 이 단위를 토큰이라고 부릅니다.</p>
<div class="fnd-hero" aria-hidden="true"><div style="background:conic-gradient(var(--surface-brand-primary) 0 25%,var(--company-mark) 0 50%,var(--foreground-positive-primary) 0 75%,var(--cool-neutral-90) 0)"></div><div style="background:var(--surface-elevated-primary);box-shadow:var(--shadow-md);font-size:44px;letter-spacing:-.03em">Aa</div><div style="background:repeating-linear-gradient(90deg,var(--surface-brand-subtle) 0 12px,transparent 12px 22px);border:1px solid var(--line-neutral-tertiary)"></div><div style="background:var(--surface-elevated-primary);border:1px solid var(--line-neutral-tertiary);color:var(--surface-brand-primary)">${I("shield", 48)}</div><div style="background:var(--surface-elevated-primary);box-shadow:var(--shadow-xl)"><i style="display:block;width:48px;height:48px;border-radius:var(--radius-lg);background:var(--surface-elevated-primary);box-shadow:var(--shadow-md)"></i></div></div>
<h2 id="base">Base material</h2>
<div class="base-list">${[["colors", "Colors", "색상의 시각적 일관성을 유지하고 효율적인 디자인 작업을 돕습니다."], ["typography", "Typography", "화면의 텍스트를 읽기 쉽고 아름답게 표현하도록 돕습니다."], ["writing", "Writing", "버튼 · 제목 · 오류 문구를 운영자가 바로 알아듣게 쓰도록 돕습니다."], ["grid", "Grid", "일관된 간격 체계를 사용하여 조화로운 비율과 정렬을 만들어냅니다."], ["icons", "Icons", "아이콘을 사용하여 인터페이스를 빠르게 이해하고 탐색할 수 있도록 돕습니다."], ["interaction", "Interaction", "비활성 · 오류 · 오버레이 · 위험 동작처럼 여러 컴포넌트에 걸친 동작 규칙을 정합니다."], ["elevation", "Elevation", "컴포넌트 간의 명확한 깊이감과 시각적 계층을 만들어냅니다."]].map(([k, t, d]) => `<a href="#/foundations/${k}"><b>${t}${nb("foundations", k)}</b><span>${d}</span>${I("chevron-right", 18)}</a>`).join("")}</div>
<p>색을 어느 자리에 쓰는지는 <a href="#/foundations/colors">Colors</a> 의 브랜드 역할 맵에서 봅니다. 토큰 전체와 반경 · 모션 · 접근성 값은 <a href="#/resources/design-token">Resources › Design Token</a> 에 있습니다.</p>`,

    /* ================= Writing =================
       taste-skill 2.5.0(MIT, github.com/Leonxlnx/taste-skill) references/copy.md 의 규칙을 한국어 보안 콘솔에 맞게 옮겼다(2026-11-05, 사람의 결정 — 스킬은 설치하지 않음).
       마케팅 페이지용 규칙(히어로 · 화면당 단어 수 · 주소 표기 등)은 뺐다. 예시 문구는 모두 사이트 예제에 실제로 있는 것이다.
       금지 라벨 목록은 verify.js 의 BANNED_LABELS 와 같아야 한다 */
    "foundations/writing": () => {
      const dd = dodont;
      const b = (cls, t) => `<button type="button" class="btn md ${cls}">${t}</button>`;
      return `<h1>Writing${nb("foundations", "writing")}</h1><p class="lead">화면의 문구는 처음 보는 운영자도 5초 안에 무엇을 하는지 알 수 있게 씁니다. 꾸미는 말 · 비유 · 만든 용어 없이, 운영자에게 소리 내어 말할 문장으로 씁니다.</p>
<h2 id="endings">Sentence endings</h2><p>문장은 합니다체로 끝냅니다. 해요체는 쓰지 않습니다.</p>
${tbl(["쓰는 자리", "끝맺음", "예"], [
  ["상태 · 결과 설명", "~합니다", "삭제한 정책은 복구할 수 없습니다."],
  ["사용자에게 하는 안내", "~하세요", "네트워크 상태를 확인하세요."],
  ["확인 대화상자 · 빈 화면의 제목", "~할까요?", "정책 12개를 삭제할까요?"],
  ["버튼 · 링크 · 라벨 · 표 머리글", "마침표 없음", "정책 저장"],
  ["안내 목록", "완전한 문장이면 마침표", "격리 파일은 30일 보관됩니다."],
])}
<h2 id="buttons">Buttons</h2><p>버튼에는 <b>누르면 일어날 동작</b>을 쓰고, 필요하면 대상을 앞에 붙입니다. 한 어절에서 네 어절 사이로 쓰고 명사형 동작어로 끝냅니다 — 저장 · 정책 저장 · 다시 시도 · 내보내기 · 필터 초기화.</p>
${dd(`<span style="font-size:14px;font-weight:600">정책 12개를 삭제할까요?</span><span style="margin-left:auto;display:flex;flex-wrap:wrap;gap:8px">${b("outline assistive", "취소")}${b("solid negative", "삭제")}</span>`,
  "확인 대화상자의 버튼은 일어날 동작을 그대로 씁니다. 제목이 질문이면 버튼이 그 답입니다.",
  `<span style="font-size:14px;font-weight:600">정책 12개를 삭제할까요?</span><span style="margin-left:auto;display:flex;flex-wrap:wrap;gap:8px">${b("outline assistive", "아니요")}${b("solid negative", "확인")}</span>`,
  "'확인' · '예' 는 무엇이 일어나는지 말하지 않습니다. '확인' 은 정보만 알리고 닫는 대화상자에서만 씁니다.")}
<h2 id="labels">Vague labels</h2><p>어디로 가는지 · 무엇이 열리는지 말하지 않는 라벨은 쓰지 않습니다.</p>
${tbl(["쓰지 않음", "대신", "예외"], [
  ["자세히 · 자세히 보기", "열리는 것을 이름으로 — 점검 안내 보기 · 정책 상세", ""],
  ["여기 · 클릭 · 이곳", "링크 글자 자체를 대상으로 — <a href=\"#/foundations/colors\">Colors</a> 에서 확인", ""],
  ["바로가기(단독)", "가는 곳 — 로그 보기 · 에이전트 목록", ""],
  ["더 보기", "펼쳐지는 것 — 이벤트 20건 더 보기", "⋯ 아이콘만 있는 Dropdown 동작 메뉴 버튼의 숨긴 이름으로는 허용"],
  ["전체 보기", "", "Card 머리에서 같은 목록 화면으로 가는 링크로는 허용"],
])}
${dd(`<div class="banner" role="status" style="flex:1;min-width:0;flex-wrap:wrap">${I("info-circle",18,{style:"filled"})}9월 10일 02:00~04:00 정기 점검이 예정되어 있습니다.<button type="button" class="btn sm outline assistive">점검 안내 보기</button></div>`,
  "버튼만 읽어도 무엇이 열리는지 압니다. 스크린 리더의 버튼 목록에서도 구분됩니다.",
  `<div class="banner" role="status" style="flex:1;min-width:0;flex-wrap:wrap">${I("info-circle",18,{style:"filled"})}9월 10일 02:00~04:00 정기 점검이 예정되어 있습니다.<button type="button" class="btn sm outline assistive">자세히</button></div>`,
  "'자세히' 가 여러 개면 버튼 목록에서 구분되지 않고, 무엇이 열리는지 눌러 봐야 압니다.")}
<h2 id="titles">Titles</h2><p>페이지 · 카드 · 섹션 제목에는 <b>대상을 가리키는 명사</b>가 있습니다 — 정책 목록 · 에이전트 연결 · 일별 탐지 추이. 질문(빈 화면 · 확인 대화상자 제외) · 명령 · 분위기 문구로 쓰지 않습니다.</p>
<h2 id="numbers">Numbers</h2><ul><li>숫자와 단위는 붙여 쓰고 줄이 갈라지지 않게 합니다 — 1,054건 · 18% · 240px. 표와 KPI 의 숫자는 자릿수가 맞는 숫자 글꼴로 씁니다</li><li>네 자리부터 쉼표를 찍습니다 — 1,054</li><li>날짜는 Date Picker 와 같은 형식으로 2026. 09. 07 처럼 씁니다. 시각은 24시간제로 붙여 2026. 09. 07 14:30, 기간은 2026. 09. 01 ~ 2026. 09. 07 입니다</li><li>한 해 안의 표처럼 자리가 좁으면 연도를 빼고 09. 07 14:30 으로 씁니다. 차트 축 눈금만 09-07 처럼 더 짧게 씁니다. 원본 로그처럼 기계가 읽는 값은 형식을 바꾸지 않습니다</li><li>예제 데이터도 실제처럼 고르지 않은 값으로 씁니다. 100 · 50 · 25 대신 1,054 · 38 · 212 처럼 씁니다</li></ul>
<h2 id="errors">Errors and empty states</h2><p>오류 문구는 <b>무엇이 일어났는지</b>와 <b>어떻게 하면 되는지</b> 두 부분입니다. 빈 화면은 <b>지금 상태</b>와 <b>다음 행동</b>입니다.</p>
${tbl(["상황", "문구", "행동"], [
  ["불러오기 실패", "불러오지 못했습니다", "다시 시도"],
  ["에이전트 미응답", "10분 이상 체크인이 없습니다. 네트워크 상태를 확인하세요.", "—"],
  ["되돌릴 수 없는 삭제", "삭제한 정책은 복구할 수 없습니다. 해당 정책이 적용된 에이전트는 기본 정책으로 돌아갑니다.", "취소 · 삭제"],
  ["검색 결과 없음", "'랜섬웨어 2025' 에 대한 결과가 없습니다", "필터 초기화"],
  ["처음 쓰는 화면", "아직 정책이 없습니다", "정책 추가"],
])}
<h2 id="placeholders">Placeholders</h2><p>lorem ipsum · TODO · 빈 대괄호 · '샘플' · '예시' 같은 표시를 화면에 남기지 않습니다. 실제 문구를 쓰거나 그 요소를 뺍니다.</p>
<h2 id="terms">One fact, one wording</h2><p>같은 사실은 화면 전체에서 한 표현으로 씁니다. 같은 동작을 '차단' 과 '블록' 으로 섞지 않습니다. 상태 이름은 <a href="#/patterns/severity">Severity</a> 패턴의 용어를 따릅니다.</p>
${tbl(["말", "쓰는 뜻", "쓰지 않는 뜻"], [
  ["실행 취소", "방금 한 동작을 바로 무를 때. Toast 의 동작 버튼에 씁니다", "옛 버전으로 돌아가기"],
  ["되돌리기", "저장된 이전 버전으로 돌아갈 때. 되돌리기도 새 버전을 하나 만듭니다", "방금 한 동작을 무르기"],
  ["필수", "꼭 채우거나 동의해야 하는 항목의 표시. Tag 는 accent 톤 하나만 씁니다", "검사 오류의 종류(빈 값 · 형식처럼 문제를 이름으로)"],
  ["삭제", "복구할 수 없게 지울 때. 확인 문구에 지워지는 대상의 개수를 적습니다", "보관함으로 옮기기(보관)"],
])}`;
    },

    /* ================= Interaction =================
       여러 컴포넌트에 걸친 동작 규칙(사람의 결정 2026-11-09 — _policy/component-policy-plan.md 2절 P1~P6 · P8 · P9).
       문서가 코드보다 앞서 가지 않게 규칙마다 지금 상태를 적는다 — 컴포넌트를 정비해 동작이 바뀌면 그 줄을 '적용' 으로 고친다 */
    "foundations/interaction": () => {
      const c = (k, t) => `<a href="#/components/${k}">${t}</a>`;
      const rules = rows => tbl(["규칙", "지금"], rows);
      const form = (btn, help) => `<div class="form" style="flex:1"><div class="field${help ? " error" : ""}"><label>정책 이름 <em>*</em></label><input aria-label="정책 이름"${help ? ' aria-invalid="true"' : ""}>${help}</div><div class="form-actions"><button type="button" class="btn md solid primary"${btn}>저장</button></div></div>`;
      return `<h1>Interaction${nb("foundations", "interaction")}</h1><p class="lead">여러 컴포넌트에 걸친 동작 규칙입니다. 컴포넌트마다 따로 정하면 어긋나는 것을 여기에 한 번 쓰고, 각 컴포넌트는 이 규칙을 따릅니다.</p>
<p><b>지금</b> 칸은 현재 코드의 상태입니다. <b>적용</b>은 이미 들어가 있다는 뜻이고, <b>아직</b>은 규칙만 정했고 적힌 컴포넌트를 정비할 때 고친다는 뜻입니다. <b>제품</b>은 시스템이 대신할 수 없어 제품 화면을 만들 때 지키는 규칙입니다.</p>
<h2 id="disabled">Disabled</h2><p>비활성 버튼은 포커스를 받지 못해 왜 누를 수 없는지 알 방법이 없습니다. 그래서 언제 비활성으로 두는지를 정합니다. 비활성은 흐리게 만들지 않고 전용 비활성 면과 글자 색으로 칠합니다.</p>
${rules([
  ["폼 제출 버튼은 비활성으로 두지 않습니다. 누르면 검증하고 오류로 안내합니다", `적용 — 모든 패턴의 주 버튼과 <a href="#/patterns/terms-agreement">약관 동의</a>의 '다음'`],
  ["권한이나 상태 때문에 할 수 없는 동작은 비활성으로 두고 이유를 화면에 적습니다", `아직 — ${c("card", "Card")} 의 선택 카드와 ${c("tree", "Tree")} 의 끈 항목에만 이유 글자가 있습니다`],
  ["권한이 아예 없는 메뉴는 숨깁니다", "제품"],
  ["비활성 요소에 Tooltip 을 달지 않습니다", "적용"],
  [`예외: 바뀐 것이 없어 누를 일이 없는 오버레이 안 '적용'(${c("date-picker", "Date Picker")})은 비활성으로 둡니다. 확인 문구를 입력받는 위험 실행 버튼(${c("popup", "Popup")})은 켜 두고 누르면 문구를 검사합니다`, "적용"],
])}
${dodont(form("", '<div class="help">정책 이름을 입력하세요.</div>'), "저장을 눌러 볼 수 있고, 무엇을 고쳐야 하는지 필드 아래에서 바로 읽습니다.", form(" disabled", ""), "저장이 왜 꺼져 있는지 알 수 없습니다. 키보드로는 버튼에 닿지도 못합니다.")}
<h2 id="input-errors">Input errors</h2><p>오류 문구를 쓰는 법은 <a href="#/foundations/writing">Writing</a> 에 있습니다. 여기서는 언제 보여 주고 언제 지우는지를 정합니다.</p>
${rules([
  ["포커스가 떠날 때 필드 단위로 검증합니다. 건드리지 않은 빈 필드는 제출할 때 알립니다", `적용 — <a href="#/patterns/input-form">입력 폼</a>처럼 검증을 켠 폼`],
  ["제출하면 첫 오류로 스크롤합니다. 오류를 폼 위에 모아 요약하지 않습니다", "적용"],
  ["입력을 고치면 오류를 바로 지웁니다", "적용"],
  ["오류가 나도 입력값을 지우지 않습니다", "적용"],
  ["오류 문구는 나타날 때 스크린 리더가 읽어 줍니다", "적용 — 검증을 켠 폼과 글자 수 한도가 있는 필드"],
  ["Select · Checkbox 그룹 · Radio 그룹도 오류 상태를 가집니다", `적용 — ${c("select", "Select")} · ${c("combobox", "Combobox")} · ${c("checkbox", "Checkbox")} · ${c("radio-button", "Radio Button")} · ${c("file-upload", "File Upload")}`],
  ["자주 나는 오류 문구는 사전으로 모아 기본값으로 씁니다", `아직 — 입력 검증의 기본 문구와 ${c("date-picker", "Date Picker")} 의 오류 문구가 따로 있습니다`],
])}
<h2 id="overlays">Overlays</h2><p>Popup · Side Panel · Dropdown · Select · Combobox · Date Picker · Time Picker · Notification Center · Tooltip · Toast 가 함께 지키는 규칙입니다.</p>
${rules([
  ["모달 위에 모달을 띄우지 않습니다", `적용 — ${c("popup", "Popup")} 이 두 번째 모달을 막거나 경고합니다`],
  ["Esc 는 가장 안쪽 것 하나만 닫습니다. Popup 안의 Select 가 열려 있으면 Select 만 닫습니다", `적용 — ${c("select", "Select")} · Dropdown · ${c("combobox", "Combobox")} · ${c("date-picker", "Date Picker")} · ${c("time-picker", "Time Picker")} · ${c("notification-center", "Notification Center")} · ${c("tooltip", "Tooltip")}`],
  ["입력 중이거나 위험 확인이면 배경을 눌러도 닫지 않습니다", `적용 — ${c("popup", "Popup")}`],
  ["열면 포커스를 안으로 옮기고, 닫으면 연 요소로 돌려보냅니다", `적용 — ${c("popup", "Popup")} · ${c("side-panel", "Side Panel")} · ${c("notification-center", "Notification Center")}`],
  ["Toast 는 모달 위에 보입니다", "적용 — Toast 는 모달 배경보다 위에 쌓입니다"],
  ["스크롤 영역 안에 있어도 작은 오버레이가 잘리지 않습니다", `적용 — Dropdown · ${c("select", "Select")} · ${c("combobox", "Combobox")} · ${c("notification-center", "Notification Center")} · ${c("tooltip", "Tooltip")}`],
])}
<h2 id="feedback">Choosing feedback</h2><p>알릴 내용이 아니라 <b>사용자가 언제까지 봐야 하는지</b>로 고릅니다.</p>
${tbl(["상황", "쓸 것", "사라지는 때"], [
  ["방금 한 동작의 성공", c("notification", "Toast"), "자동"],
  ["방금 한 동작의 실패", `닫을 때까지 남는 ${c("notification", "Toast")} 또는 Notice`, "사용자가 닫거나 해결될 때"],
  ["필드 입력 오류", "필드 아래 문구", "고칠 때"],
  ["화면 일부의 지속 상태", c("notification", "Notice"), "해결될 때"],
  ["점검 · 라이선스처럼 제품 전체에 영향", `${c("notification", "Banner")}, 한 번에 하나`, "해결될 때"],
  ["응답을 받아야 진행", c("popup", "Popup"), "사용자가 응답할 때"],
])}
<h2 id="destructive">Destructive actions</h2><p>되돌릴 수 있는지에 따라 확인 단계를 고릅니다. 모두 확인받으면 습관적으로 넘기게 됩니다.</p>
${tbl(["영향", "흐름"], [
  ["되돌릴 수 있음", "바로 실행 → Toast 와 실행 취소"],
  ["되돌리기 어려움", "Popup 확인 → 실행 → 결과 알림"],
  ["복구할 수 없고 대량", "Popup 에 대상 수 표시 + 확인 문구 입력 → 실행 → 결과 알림"],
])}
${rules([
  ["위험 확인의 첫 포커스는 취소에 둡니다. 확인 문구를 입력하는 대화상자는 입력칸에 둡니다", `적용 — ${c("popup", "Popup")} 은 첫 포커스에서 닫기 버튼과 위험 실행 버튼을 건너뜁니다`],
  ["보안 기능을 끄는 Switch 도 이 표를 따릅니다", `제품 — ${c("switch", "Switch")} 가 응답을 기다리는 동안 제품이 확인을 띄웁니다`],
])}
<h2 id="overflow">Overflow</h2>
${rules([
  ["말줄임은 마지막 수단입니다. 먼저 줄바꿈이나 폭 조정을 씁니다", "제품"],
  ["줄인 글자는 키보드로도 전체를 볼 수 있어야 합니다. 마우스를 올려야만 보이는 기본 설명 풍선은 키보드로 볼 수 없습니다", `적용 — ${c("breadcrumb", "Breadcrumb")} 의 잘린 항목, ${c("data-table", "Data Table")} 의 말줄임 칸, ${c("navigation", "Navigation")} 의 접힌 메뉴는 Tooltip 을 씁니다`],
  ["Tag 처럼 포커스를 받을 수 없는 요소는 말줄임이 필요 없게 길이를 제한합니다", `적용 — ${c("tag", "Tag")} 는 최대 폭 160px 에서 자르지 않고 줄바꿈합니다`],
])}
<h2 id="loading">Loading</h2>
${tbl(["예상 시간", "표시"], [
  ["1초 미만", `표시하지 않습니다. 지연을 켠 ${c("loading", "Spinner · Skeleton")} 은 1초 기다렸다 보이고, 한 번 보이면 0.5초 동안 남습니다. 버튼의 로딩과 Switch 처리 중 표시는 바로 보입니다`],
  ["영역의 첫 로딩", `${c("loading", "Skeleton")}`],
  ["짧은 동작", `${c("loading", "Spinner")}, 페이지에 하나. 버튼이 시작했으면 ${c("button", "Button")} 의 로딩 상태`],
  ["진행률을 앎", `${c("loading", "Progress")}`],
])}
<h2 id="selection">Choosing a selection control</h2><p>비슷해 보이는 선택 컴포넌트는 <b>값이 언제 반영되는지</b>와 <b>옵션이 몇 개인지</b>로 가릅니다.</p>
${tbl(["상황", "쓸 것"], [
  ["즉시 켜고 끔", c("switch", "Switch")],
  ["저장 전까지 0개 이상 선택", c("checkbox", "Checkbox")],
  ["2~5개 중 하나, 항상 보임", c("radio-button", "Radio Button")],
  ["2~5개 중 하나, 같은 내용의 보기만 바뀜", c("select-button", "Select Button")],
  ["값 고르기, 옵션 6개 이상", c("select", "Select")],
  ["옵션이 많아 찾아야 하거나 여러 개 고르기", c("combobox", "Combobox")],
  ["동작 실행", c("dropdown", "Dropdown")],
  ["목록을 좁히는 조건", `${c("chip", "Filter Chip")}`],
  ["내용이 달라지는 뷰 전환", c("tab", "Tab")],
  ["설명이 필요한 큰 선택지", `아이콘 위주로 여럿 고르거나 바로 이동하면 ${c("item-tile", "Item Tile")}, 내용이 많은 카드를 고르면 ${c("card", "Card")}, 하나만 고르면 ${c("radio-button", "Radio Button")} 의 카드형`],
])}`;
    },

    /* ================= Colors ================= */
    "foundations/colors": () => {
      /* 절의 순서·제목·설명은 토큰 트리 순서를 따른다 — 트리 밖으로 덧붙인 것은 Brand 절의 '제품 슬롯' 한 구절과 맨 끝의 Brand Mark 절뿐이다 */
      const A = ["Lime", "Cyan", "Light Blue", "Violet", "Purple", "Pink"];
      const akey = (n) => n.toLowerCase().replace(/ /g, "-");
      const semantic = `
${sem("fg-neutral", "Foreground - Neutral", "텍스트, 아이콘 등 전경 요소에 사용하는 기본 색상입니다. Primary, Secondary, Tertiary, Quaternary 순으로 정보의 위계를 표현하며, Strong은 가장 높은 대비가 필요할 때, Inverse는 반전된 배경 위에서 사용합니다.", [["Primary", "--foreground-neutral-primary"], ["Strong", "--foreground-neutral-strong"], ["Secondary", "--foreground-neutral-secondary"], ["Tertiary", "--foreground-neutral-tertiary"], ["Quaternary", "--foreground-neutral-quaternary"], ["Inverse", "--foreground-neutral-inverse"]])}
${sem("fg-brand", "Foreground - Brand", "브랜드 컬러를 텍스트, 아이콘 등 전경 요소에 사용할 때 활용합니다. Inverse는 반전된 배경 위에서 브랜드 컬러를 표현할 때 사용합니다. 이 시스템에서 Brand 는 <b>제품마다 바뀌는 제품 색</b>입니다.", [["Primary", "--foreground-brand-primary"], ["Inverse", "--foreground-brand-inverse"]])}
${sem("fg-positive", "Foreground - Positive", "긍정적인 상태를 전경 요소로 표현할 때 사용합니다. Heavy 는 같은 색의 옅은 면 위에 놓이는 Tag 글자에 씁니다.", [["Primary", "--foreground-positive-primary"], ["Heavy", "--foreground-positive-heavy"]])}
${sem("fg-cautionary", "Foreground - Cautionary", "주의가 필요한 상태를 전경 요소로 표현할 때 사용합니다. Heavy 는 같은 색의 옅은 면 위에 놓이는 Tag 글자에 씁니다.", [["Primary", "--foreground-cautionary-primary"], ["Heavy", "--foreground-cautionary-heavy"]])}
${sem("fg-negative", "Foreground - Negative", "부정적인 상태나 오류를 전경 요소로 표현할 때 사용합니다. 글자는 Strong, 아이콘·그래픽은 Primary 를 씁니다. Heavy 는 같은 색의 옅은 면 위에 놓이는 Tag 글자에 씁니다.", [["Primary", "--foreground-negative-primary"], ["Strong", "--foreground-negative-strong"], ["Heavy", "--foreground-negative-heavy"]])}
${sem("fg-disable", "Foreground - Disable", "상호작용이 불가능한 비활성 상태의 전경 요소에 사용합니다.", [["Primary", "--foreground-disable-primary"]], { alpha: true })}
${sem("fg-inactive", "Foreground - Inactive", "상호작용 요소에서 선택되지 않았거나 활성화되지 않은 상태를 표현할 때 사용합니다.", [["Primary", "--foreground-inactive-primary"]])}
${sem("fg-accent", "Foreground - Accent", "시각적 대비를 명확하게 유지하기 위해 앞쪽 요소에 사용하는 색상입니다. Heavy 는 같은 색의 옅은 면 위에 놓이는 Tag 글자에 씁니다.", [...A.map(n => [n, `--foreground-accent-${akey(n)}`]), ...["Light Blue", "Lime", "Cyan"].map(n => [n + " Heavy", `--foreground-accent-${akey(n)}-heavy`])])}
${sem("bg-neutral", "Background - Neutral", "일반적인 화면의 배경 색상으로 활용합니다. 카드 UI와 같이 어떠한 요소와 배경의 구분을 분명히 둬야할 때 Secondary를 사용하여 대비를 줍니다.", [["Primary", "--background-neutral-primary"], ["Secondary", "--background-neutral-secondary"]])}
${sem("sf-neutral", "Surface - Neutral", "패널과 같이 어떠한 요소에서 표면 색상이 필요한 경우 사용합니다. 투명도가 포함된 Secondary, Tertiary, Strong으로 배경과의 구분 정도를 조절하며, Inverse는 반전된 표면을 표현할 때 사용합니다.", [["Primary", "--surface-neutral-primary"], ["Secondary", "--surface-neutral-secondary"], ["Tertiary", "--surface-neutral-tertiary"], ["Strong", "--surface-neutral-strong"], ["Inverse", "--surface-neutral-inverse"]], { alpha: true })}
${sem("sf-elevated", "Surface - Elevated", "모달과 같이 층위가 있는 화면에서 사용하는 표면 색상으로 다크 모드에서 Background - Neutral과의 색상 차이가 있습니다.", [["Primary", "--surface-elevated-primary"], ["Secondary", "--surface-elevated-secondary"]])}
${sem("sf-brand", "Surface - Brand", "화면 내에서 가장 중요한 요소를 표현할 때 사용하는 브랜드 표면 색상입니다. Primary, Strong, Heavy를 상황에 맞게 적절히 선택하여 사용하며, Subtle은 옅은 브랜드 배경이 필요할 때 사용합니다.", [["Primary", "--surface-brand-primary"], ["Strong", "--surface-brand-strong"], ["Heavy", "--surface-brand-heavy"], ["Subtle", "--surface-brand-subtle"], ["Subtle Strong", "--surface-brand-subtle-strong"]])}
${sem("sf-brand-gradient", "Surface - Brand Gradient", "AI 제품의 주 버튼과 Banner 처럼 넓은 브랜드 면에만 칠하는 그라데이션입니다. 다른 제품에는 그라데이션이 없고 Surface - Brand 단색을 씁니다. 견본은 AI 제품의 값을 보여 주고, 값 보기에는 지금 고른 제품의 값이 나옵니다.", [["Rest", "--surface-brand-gradient"], ["Strong", "--surface-brand-gradient-strong"], ["Heavy", "--surface-brand-gradient-heavy"]], { h3: true, preview: (t) => ({ "--surface-brand-gradient": "linear-gradient(90deg,var(--purple-40),var(--violet-45))", "--surface-brand-gradient-strong": "linear-gradient(90deg,var(--purple-30),var(--violet-40))", "--surface-brand-gradient-heavy": "linear-gradient(90deg,var(--purple-30),var(--violet-30))" })[t] })}
${sem("sf-positive", "Surface - Positive", "긍정적인 상태를 배경으로 표현할 때 사용합니다.", [["Primary", "--surface-positive-primary"]], { alpha: true })}
${sem("sf-cautionary", "Surface - Cautionary", "주의가 필요한 상태를 배경으로 표현할 때 사용합니다.", [["Primary", "--surface-cautionary-primary"]], { alpha: true })}
${sem("sf-negative", "Surface - Negative", "부정적인 상태나 오류를 배경으로 표현할 때 사용합니다. 더 강한 강조가 필요한 경우 Strong을 사용합니다. Heavy · Hover · Pressed 는 Negative 버튼의 눌림과 hover 에 씁니다.", [["Primary", "--surface-negative-primary"], ["Strong", "--surface-negative-strong"], ["Heavy", "--surface-negative-heavy"], ["Hover", "--surface-negative-hover"], ["Pressed", "--surface-negative-pressed"]], { alpha: true })}
${sem("sf-disable", "Surface - Disable", "상호작용이 불가능한 비활성 상태의 표면에 사용합니다.", [["Primary", "--surface-disable-primary"]])}
${sem("sf-accent", "Surface - Accent", "시각적 대비를 명확하게 유지하기 위해 배경과 같은 뒤쪽 요소에 사용하는 색상입니다. Opaque는 투명도가 없는 색상으로 표면이 겹치는 경우 사용합니다.", A.flatMap(n => [[n, `--surface-accent-${akey(n)}`], [`${n} Opaque`, `--surface-accent-${akey(n)}-opaque`]]), { alpha: true })}
${sem("ln-neutral", "Line - Neutral", "Divider, Border 등 요소 간의 구분이 필요한 경우 사용합니다. 투명 값이 포함된 색상으로 라인이 중첩되는 경우 투명도가 없는 Opaque를 사용하여 중첩을 방지합니다.", [["Primary", "--line-neutral-primary"], ["Primary Opaque", "--line-neutral-primary-opaque"], ["Secondary", "--line-neutral-secondary"], ["Secondary Opaque", "--line-neutral-secondary-opaque"], ["Tertiary", "--line-neutral-tertiary"], ["Tertiary Opaque", "--line-neutral-tertiary-opaque"]], { alpha: true })}
${sem("ln-brand", "Line - Brand", "브랜드 컬러가 필요한 Border에 사용합니다. Focus는 상호작용 요소의 포커스 상태를 표현할 때 사용합니다.", [["Primary", "--line-brand-primary"], ["Strong", "--line-brand-strong"], ["Focus", "--line-brand-focus"]], { alpha: true })}
${sem("ln-field-focus", "Line - Field Focus", "Text Field · Select · Date Picker 같은 값 입력 필드가 포커스를 받거나 열렸을 때의 테두리와 바깥 후광입니다. 기본은 Foreground - Brand Primary · Line - Brand Focus 와 같고, 빨강 · 주황 제품에서는 중립으로 바뀝니다. 오류 테두리나 경고색과 헷갈리지 않게 하기 위해서입니다.", [["Border", "--line-field-focus"], ["Halo", "--line-field-focus-halo"]], { h3: true, alpha: true })}
${sem("ln-positive", "Line - Positive", "긍정적인 상태를 Border로 표현할 때 사용합니다.", [["Primary", "--line-positive-primary"]], { alpha: true })}
${sem("ln-cautionary", "Line - Cautionary", "주의가 필요한 상태를 Border로 표현할 때 사용합니다.", [["Primary", "--line-cautionary-primary"]], { alpha: true })}
${sem("ln-negative", "Line - Negative", "부정적인 상태나 오류를 Border로 표현할 때 사용합니다. Focus는 오류 상태의 포커스 상태를 표현할 때 사용합니다.", [["Primary", "--line-negative-primary"], ["Strong", "--line-negative-strong"], ["Focus", "--line-negative-focus"]], { alpha: true })}
${sem("ln-accent", "Line - Accent", "시각적 대비를 명확하게 유지하기 위해 Border에 사용하는 강조 색상입니다.", A.map(n => [n, `--line-accent-${akey(n)}`]), { alpha: true })}
${sem("ef-dimmer", "Effect - Dimmer", "모달과 같이 층위가 생길 때 배경과의 구분을 위해 어둡게 표시해야할 때 사용합니다.", [["Primary", "--effect-dimmer-primary"]], { alpha: true })}
${sem("ef-transparent", "Effect - Transparent", "Chrome 효과를 적용할 때 사용하는 투명도가 포함 된 배경 색상입니다.", [["Primary", "--effect-transparent-primary"], ["Secondary", "--effect-transparent-secondary"]], { alpha: true })}
${sem("static", "Static", "Light, Dark 테마에 상관없이 고정된 고유 색으로 테마가 변경되더라도 색상을 유지하여 해당 요소에 대비를 줄 때 사용합니다.", [["White", "--static-white"], ["Black", "--static-black"]])}
${sem("chart", "Chart", "탐색형 차트와 정적 요약의 계열 · 격자 · 축 · 툴팁 색입니다. <b>기본은 한 톤</b>입니다. Mono 1~4 는 진한 쪽부터 옅은 쪽으로 가는 고정 파랑 명도 단계이고, 계열 수에 맞춰 단계를 골라 씁니다. Mono Track 은 진행 막대와 게이지의 비어 있는 자리에 쓰는 같은 파랑의 옅은 단계입니다. 순서 없는 범주가 5개 이상이면 계열 1~6 을 씁니다. 계열 1~6 은 <b>순서가 고정</b>이고 제품 색과 무관하며, 라이트와 다크 각각에서 색각 이상으로도 갈리도록 고른 단계입니다. 상태색과 같은 단계는 피했습니다. 심각도 5단계는 Foreground 의 Negative Strong · Cautionary · Accent Light Blue · Accent Lime · Inactive 를 그대로 씁니다. 차트 토큰은 토큰 트리 밖에 두며, 쓰는 법은 <a href=\"#/components/data-visual\">Data Visual</a> 에 있습니다.", [["Mono 1", "--chart-mono-1"], ["Mono 2", "--chart-mono-2"], ["Mono 3", "--chart-mono-3"], ["Mono 4", "--chart-mono-4"], ["Mono Track", "--chart-mono-track"], ["Series 1", "--chart-series-1"], ["Series 2", "--chart-series-2"], ["Series 3", "--chart-series-3"], ["Series 4", "--chart-series-4"], ["Series 5", "--chart-series-5"], ["Series 6", "--chart-series-6"], ["Series 1 subtle", "--chart-series-1-subtle"], ["Series 1 strong", "--chart-series-1-strong"], ["Grid", "--chart-grid-primary"], ["Axis text", "--chart-axis-text"], ["Tooltip surface", "--chart-tooltip-surface"], ["Tooltip text", "--chart-tooltip-text"]])}
${sem("avatar", "Avatar", "아바타 이니셜의 면과 글자 색입니다. 사람의 이름으로 여섯 색 중 하나가 정해져, 같은 사람은 어느 화면에서나 같은 색입니다. 색은 사람을 가르는 데만 쓰고 뜻이 없습니다. 상태로 읽히지 않도록 빨강 · 주황 · 초록은 쓰지 않습니다. 토큰 트리 밖에 두며, 쓰는 법은 <a href=\"#/components/avatar\">Avatar</a> 에 있습니다.", [["1 파랑 면", "--avatar-1-surface"], ["1 파랑 글자", "--avatar-1-text"], ["2 시안 면", "--avatar-2-surface"], ["2 시안 글자", "--avatar-2-text"], ["3 라임 면", "--avatar-3-surface"], ["3 라임 글자", "--avatar-3-text"], ["4 바이올렛 면", "--avatar-4-surface"], ["4 바이올렛 글자", "--avatar-4-text"], ["5 퍼플 면", "--avatar-5-surface"], ["5 퍼플 글자", "--avatar-5-text"], ["6 핑크 면", "--avatar-6-surface"], ["6 핑크 글자", "--avatar-6-text"]])}
${sem("company", "Brand Mark", "지란지교시큐리티 브랜드 색입니다. 기준 토큰의 Brand 는 제품 색이라 회사 정체성을 표기할 자리가 없어, 토큰 트리 밖에 따로 둡니다. 로고·헤더 마크에만 쓰고 제품 UI 의 Brand 로 쓰지 않습니다.", [["Mark", "--company-mark"], ["Subtle", "--company-mark-subtle"]])}
${productColor()}
<h2 id="roles">브랜드 역할 맵</h2><p>색은 네 축으로만 씁니다. <b>Product Brand</b> 는 행동과 선택, <b>Status</b> 는 처리 결과, <b>Severity</b> 는 보안 위협 등급, <b>Brand Mark</b> 는 회사 정체성 표기입니다. 한 요소에 두 축을 겹치지 않고, 어느 축이든 색만으로 의미를 전달하지 않습니다.</p>
${tbl(["축", "쓰는 곳", "쓰지 않는 곳"], [
  ["<b>Product Brand</b>", "화면당 하나인 주요 행동 버튼, 링크, 활성·선택 상태, 포커스 링. 제품1(빨강) · 브랜드(주황)의 입력 필드 링은 중립", "위험도나 처리 결과 표현, 삭제 버튼, 넓은 면의 장식 배경, 로고"],
  ["<b>Status</b>", "성공·실패·검토 대기 알림, 입력 검증 오류, 위험 확인 팝업의 제목과 확정 버튼, 메뉴의 위험 항목 글자", "탐색·선택 상태, 브랜드 강조, 화면의 삭제 버튼. 화면의 삭제 버튼은 Assistive"],
  ["<b>Severity</b>", "위협·이벤트 등급 태그, 점·밴드, 표 행 강조, 대시보드 KPI. 항상 Critical 같은 등급 라벨을 병기", "버튼·링크, 일반 처리 결과, 색만 있는 점·배경, 한 칸에 Status 와 함께"],
  ["<b>Brand Mark</b>", "로고 · 헤더 마크, 로그인 · 온보딩의 회사 정체성 표기", "위험도 · 상태. 같은 #FF7F00 을 제품 색으로 쓰려면 팔레트의 '주황'을 고르고, 마크 토큰을 제품 UI 에 직접 쓰지 않습니다"],
  ["<b>Neutral</b>", "화면 바탕, 텍스트, 구분선, 비활성 상태. 정보 밀도가 높은 콘솔의 기본 색", "강조. 회색 톤 차이만으로 상태나 등급을 표현"]
], "roles")}
<div class="dodont">
  <div class="do"><div style="padding:var(--space-6) var(--card-pad) 0;display:flex;gap:12px;align-items:center;flex-wrap:wrap"><button type="button" class="btn md outline assistive">취소</button><button type="button" class="btn md solid primary">정책 저장</button><span style="margin-left:auto;display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:600"><i style="width:18px;height:18px;border-radius:50%;background:var(--company-mark);display:inline-block"></i>JS Console</span></div><div class="body"><p>주요 행동은 제품 색, 회사 정체성은 헤더 마크에만 씁니다. 두 색이 같은 화면에 있어도 역할이 겹치지 않습니다.</p></div></div>
  <div class="dont"><div style="padding:var(--space-6) var(--card-pad) 0;display:flex;gap:12px;align-items:center;flex-wrap:wrap"><button type="button" class="btn md outline assistive" style="color:var(--company-mark);border-color:var(--company-mark)">취소</button><button type="button" class="btn md solid primary" style="background:var(--company-mark)">정책 저장</button></div><div class="body"><p>브랜드 색을 CTA 나 보조 버튼에 쓰지 않습니다. 제품 컬러가 바뀌어도 브랜드 색은 그대로라 제품 간 구분이 사라지고, 강조 위계도 깨집니다.</p></div></div>
</div>`;
      /* 램프와 단계 번호도 기준 토큰 그대로다 — 숫자가 클수록 밝다 */
      /* 램프는 **밝은 쪽부터** 늘어놓는다 (Object.keys 를 Number(b) - Number(a) 로 정렬).
         번호가 클수록 밝은 체계라, 배열을 오름차순으로 적으면 화면에는 어두운 쪽부터 나온다.
         Common("white","black")은 숫자가 아니고 이미 밝은 쪽부터라 그대로 둔다 */
      const R = {
        "cool-neutral": [99, 98, 97, 96, 95, 90, 80, 70, 60, 50, 40, 30, 25, 23, 22, 20, 17, 15, 10, 7, 5],
        neutral: [99, 95, 90, 80, 70, 60, 50, 40, 30, 22, 20, 15, 10, 5],
        blue: [99, 95, 90, 80, 70, 65, 60, 55, 50, 45, 40, 30, 20, 10],
        green: [99, 95, 90, 80, 70, 60, 50, 40, 30, 20, 10],
        orange: [99, 95, 90, 80, 70, 60, 50, 40, 39, 30, 20, 10],
        red: [99, 95, 90, 80, 70, 60, 50, 40, 30, 20, 10],
        lime: [99, 95, 90, 80, 70, 60, 50, 40, 37, 30, 20, 10],
        cyan: [99, 95, 90, 80, 70, 60, 50, 40, 30, 20, 10],
        "light-blue": [99, 95, 90, 80, 70, 60, 50, 40, 30, 20, 10],
        violet: [99, 95, 90, 80, 70, 60, 50, 45, 40, 30, 20, 10],
        purple: [99, 95, 90, 80, 70, 60, 50, 40, 30, 20, 10],
        pink: [99, 95, 90, 80, 70, 60, 50, 46, 40, 30, 20, 10],
        "red-orange": [99, 95, 90, 80, 70, 60, 50, 48, 40, 30, 20, 10],
      };
      const TITLE = { "cool-neutral": "Cool Neutral", "light-blue": "Light Blue", "red-orange": "Red Orange" };
      /* Atomic 페이지는 제목과 팔레트만 둔다 — 설명 문단이 없다.
         프리미티브 규칙("컴포넌트에서 직접 쓰지 않음" · "숫자가 클수록 밝다")은
         Resources › Design Token 의 Token Layers 에 있고, 빌드가 그 규칙을 강제한다 */
      const atomic = `${pal("Common", ["white", "black"], "static")}
${pal("Brand", [60, 55, 50, 45, 40], "brand", "제품마다 바뀌는 제품 색 · 기본은 Blue 램프")}
${Object.keys(R).map(k => pal(TITLE[k] || (k[0].toUpperCase() + k.slice(1)), R[k], k)).join("\n")}
`;
      return `<h1>Colors${nb("foundations", "colors")}</h1><p class="lead">컬러 시스템은 시각적 일관성을 유지하고 효율적인 디자인 작업을 돕습니다. 상황에 맞는 색을 이름으로 고를 수 있도록 Semantic 토큰으로 제공하며, 스와치를 누르면 Hex · RGBA · 토큰 값을 볼 수 있고 토큰을 복사할 수 있습니다.</p>
${tabset([["semantic", "Semantic"], ["atomic", "Atomic"]], [semantic, atomic])}
${valPop()}`;
    },

    /* ================= Elevation ================= */
    "foundations/elevation": () => {
      const normal = [["None", "none"], ["XSmall", "xs"], ["Small", "sm"], ["Medium", "md"], ["Large", "lg"], ["XLarge", "xl"]];
      const spread = [["Small", "spread-sm"], ["Medium", "spread-md"]];
      /* None 은 보여 줄 값이 없어 비활성 — 나머지는 누르면 값 팝오버(app.js 의 openValue) */
      const levels = (list, group) => `<div class="elev-levels">${list.map(([n, k]) => k === "none"
        ? `<div><i style="box-shadow:var(--shadow-none)"></i><small>${n}</small></div>`
        : `<button type="button" class="val-cell" data-kind="shadow" data-token="--shadow-${k}" data-label="${attr(group + " / " + n)}" aria-haspopup="dialog" title="${attr(group + " / " + n)} 값 보기"><i style="box-shadow:var(--shadow-${k})"></i><small>${n}</small></button>`).join("")}</div>`;
      const rows = [["1", "Shadow Normal XSmall", "평면에 가깝게 미세한 구분만 필요한 경우입니다. 지금 이 단계를 쓰는 컴포넌트는 없습니다"], ["2", "Shadow Normal Small", "면 안에서 살짝 떠야 하는 경우입니다. 고른 Select Button · 캡슐형 탭 · Slider 손잡이 · Item Tile hover 에 씁니다"], ["3", "Shadow Normal Medium", "상호작용 중 강조가 필요한 경우입니다. 선택 카드 hover · 메뉴 · 달력 · Time Picker 목록 · Tooltip 에 씁니다. 바탕색 위에 홀로 놓인 로그인 카드도 테두리 대신 이 그림자로 띄웁니다"], ["4", "Shadow Normal Large", "일시적으로 주요한 정보를 보여 주는 높은 레이어입니다. 지금 이 단계를 쓰는 컴포넌트는 없습니다"], ["5", "Shadow Normal XLarge", "시선을 완전히 모아야 하는 오버레이입니다. 팝업 · 사이드 패널 · 토스트 · 알림 센터에 씁니다"], ["1", "Shadow Spread Small", "배경과 콘텐츠의 경계 사방에 구분이 필요한 경우입니다. 지금 이 단계를 쓰는 컴포넌트는 없습니다"], ["2", "Shadow Spread Medium", "경계 분리와 함께 더 강조가 필요한 경우입니다. 지금 이 단계를 쓰는 컴포넌트는 없습니다"]];
      return `<h1>Elevation</h1><p class="lead">Elevation 은 Z축을 기준으로 두 표면 사이의 거리를 나타내는 시각적 체계입니다. 그림자와 배경 명도 차이를 조합하여 UI 컴포넌트 간의 깊이감과 시각적 계층을 만듭니다. 카드 · KPI · 폼 · 설정 구획처럼 페이지에 놓인 면은 그림자 없이 1px 옅은 회색 테두리로 구획합니다. 그림자는 드롭다운 · 팝업 · 토스트처럼 페이지 위에 떠 있는 레이어와 상호작용 상태에만 씁니다. 밀도가 높은 콘솔 화면에서도 같은 구획 언어 하나로 정돈된 구조를 전달합니다.</p>
<h2 id="type">Shadow type</h2>
<div class="elev-types"><div><div class="demo"><i style="box-shadow:var(--shadow-lg)"></i></div><b>Normal</b><span>빛의 위치에 따라 아래쪽으로 그림자가 생기는 일반적인 경우 사용합니다. 드롭다운 · 팝업 · 카드 hover 에 씁니다.</span></div><div><div class="demo"><i style="box-shadow:var(--shadow-spread-md)"></i></div><b>Spread</b><span>그림자가 사방으로 고르게 퍼져야 하는 경우 사용합니다. 화면 가운데 홀로 놓이는 면에 맞습니다.</span></div></div>
${tabset([["normal", "Normal"], ["spread", "Spread"]], [levels(normal, "Normal"), levels(spread, "Spread")])}
<h2 id="composition">Composition</h2><p>더 자연스럽고 현실과 유사한 깊이감을 표현하기 위해 물체 주변으로 은은하게 퍼지는 주변광 그림자와 특정 방향의 조명이 만드는 뚜렷한 직사광 그림자를 겹쳐 구성합니다. 그래서 값이 두 겹입니다.</p>
<div class="elev-comp"><div class="box" style="box-shadow:0 8px 24px 0 rgba(15,23,42,.08)"><small>Ambient</small></div><span class="op">+</span><div class="box" style="box-shadow:0 2px 6px 0 rgba(0,0,0,.05)"><small>Key</small></div><span class="op">${I("chevron-right", 20)}</span><div class="box" style="box-shadow:var(--shadow-lg)"><small>Combined = Large</small></div></div>
<h2 id="style">Style</h2>${tbl(["레벨", "명칭", "적용"], rows)}
<p>컴포넌트는 Small · Medium · XLarge 세 단계를 짧은 별칭으로 씁니다. 배경을 어둡게 하는 Dimmer 는 <a href="#/foundations/colors">Colors</a> 의 Effect 에, 토큰 값은 <a href="#/resources/design-token">Design Token</a> 에 있습니다.</p>
${valPop()}`;
    },

    /* ================= Grid ================= */
    "foundations/grid": () => {
      const spaces = [1, 2, 4, 8, 10, 12, 14, 16, 20, 24, 32, 40, 48, 56, 64, 80];
      /* px → 토큰명은 스타일시트에서 끌어온다 — 짝꿍 표를 또 두면 토큰이 바뀔 때 눈금만 어긋난다 */
      const { L } = vars(), tokenOf = {};
      for (const [k, v] of Object.entries(L)) { const m = /^--space-\d+$/.test(k) && /^(\d+)px$/.exec(v.trim()); if (m) tokenOf[+m[1]] = k.slice(2); }
      return `<h1>Grid</h1><p class="lead">그리드 시스템은 4px 기반의 일관된 간격 체계를 사용하여 모든 화면에서 조화로운 비율과 정렬을 만들어냅니다. Desktop 관리 콘솔을 기준으로 사이드 내비게이션 + 유동 콘텐츠 영역의 레이아웃을 쓰며, 콘텐츠 영역 안은 12단 컬럼 그리드로 배치합니다.</p>
<h2 id="artboard">Artboard size</h2><p>디자이너는 해상도별 모든 화면을 디자인할 필요 없이 아래 대표 규격만 설계합니다. 기준은 1440 이며, 대형 모니터는 콘텐츠 최대 너비만 넓어집니다.</p>
${tbl(["환경", "너비", "높이", "콘텐츠 최대 너비"], [["Web desktop (기준)", "1440px", "960px", "1160px"], ["Web desktop (대형)", "1920px", "1080px", "1600px"]])}
<h2 id="breakpoint">Breakpoint</h2><p>모바일·태블릿은 대응하지 않는 Desktop 전용 콘솔입니다. 1280 미만에서는 사이드 내비게이션을 접어 콘텐츠 폭을 확보합니다.</p>
${tbl(["명칭", "대응 환경", "너비", "레이아웃", "콘텐츠 최대 너비"], [["md", "데스크탑 소형 · 노트북", "1024 – 1279px", "사이드 내비 접힘 64 + 콘텐츠", "100% (Padding 20)"], ["lg", "데스크탑 (기준 1440)", "1280 – 1919px", "사이드 내비 240 + 콘텐츠", "1160px (Padding 24)"], ["xl", "데스크탑 대형", "1920px ~", "사이드 내비 240 + 콘텐츠", "1600px (Padding 24)"]])}
${codeBlock("bp-css", `/* Desktop-first */\n.app{display:grid;grid-template-columns:240px minmax(0,1fr)}\n.content{max-width:1160px;margin:0 auto;padding:0 24px}\n@media (max-width:1279px){.app{grid-template-columns:64px minmax(0,1fr)}.content{padding:0 20px}}\n@media (min-width:1920px){.content{max-width:1600px}}`, "css", "CSS 복사")}
<h2 id="spacing">Spacing</h2><p>예측 가능한 디자인 규칙과 개발자와의 원활한 소통을 위해 <b>4배수 간격</b>을 기본으로 구성합니다. 기준은 4px 입니다. 컴포넌트 안쪽에서는 6 · 10 · 14 처럼 2px 단위의 보정 값도 함께 씁니다. 버튼 묶음 사이 6 · 작은 칸 여백 10 · 입력칸 안 여백 14 가 그런 자리입니다. 1px 은 테두리를 맞출 때만 씁니다. 카드 안쪽 여백 24, 카드 사이 간격 16, 섹션 사이 48~64 를 기본으로 잡아 답답한 밀도를 피합니다. 노란색은 4px 그리드를 벗어난 보정 값입니다. 토큰 원본 CSS 는 <a href="#/resources/design-token">Design Token</a> 에 있습니다.</p>
<div class="space-bars">${spaces.map(v => { const t = tokenOf[v]; const cls = v === 4 ? "base" : v % 4 ? "off" : ""; return `<div class="${cls}"><b>${v}</b><i style="width:${v}px"></i>${t ? `<small>${t}</small>` : ""}</div>`; }).join("")}</div>
<h2 id="layout">Layout</h2><p>콘텐츠 영역 안은 24px 의 간격(gutter)을 두는 12단 컬럼 그리드를 사용하며, 화면 너비에 맞게 유연하게 대응합니다. 컬럼은 자유롭게 병합합니다. KPI 카드 넷은 3컬럼씩, 2단 폼은 6컬럼씩 차지합니다.</p>
<h3>Desktop</h3><p>사이드 내비게이션 240px 을 뺀 콘텐츠 영역은 최대 1160px 이고, 좌우 여백 24px · 간격 24px 의 12단 컬럼을 씁니다.</p>
<div class="shell-demo"><div class="side">Side nav 240</div><div class="main"><i>Content · max 1160 · padding 24</i></div></div>
<div class="grid-demo"><div class="cols">${Array.from({ length: 12 }, (_, i) => `<i data-n="${i + 1}"></i>`).join("")}</div><div class="meta-row"><span>margin 24</span><span>12 columns · gutter 24</span><span>margin 24</span></div></div>
${codeBlock("grid-css", `.grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:24px}\n.col-3{grid-column:span 3}   /* KPI 카드 4개 */\n.col-4{grid-column:span 4}   /* 카드 3개 */\n.col-6{grid-column:span 6}   /* 2단 폼 */\n.col-8{grid-column:span 8}   /* 본문 + .col-4 사이드 */\n.col-12{grid-column:1 / -1}  /* 테이블 · 차트 전체 폭 */`, "css", "CSS 복사")}`;
    },

    /* ================= Icons ================= */
    "foundations/icons": () => {
      const KO = {
        /* 액션 */
        search: "검색 찾기 돋보기", plus: "추가 더하기 새로 생성", minus: "빼기 제거 축소", x: "닫기 취소 삭제 엑스", check: "체크 확인 완료", download: "다운로드 내려받기 저장", upload: "업로드 올리기 등록",
        trash: "삭제 쓰레기통 지우기", pencil: "편집 수정 연필", edit: "편집 수정 입력", copy: "복사 사본", refresh: "새로고침 갱신 동기화", reload: "다시 불러오기 재시도 갱신", filter: "필터 거르기 조건",
        "filter-off": "필터 해제 조건 초기화", dots: "더보기 점 메뉴", "dots-vertical": "더보기 세로 점 메뉴", "external-link": "외부 링크 새창", link: "링크 연결 주소", unlink: "연결 해제 링크 끊기",
        share: "공유 내보내기", printer: "인쇄 프린터 출력", eye: "보기 표시 공개", "eye-off": "숨기기 비공개 가리기", star: "즐겨찾기 별 중요", heart: "좋아요 하트 관심", bookmark: "북마크 책갈피 저장",
        pin: "고정 핀 꽂기", pinned: "고정됨 핀 상단고정", flag: "깃발 신고 표시", archive: "보관 아카이브 저장", restore: "복원 되돌리기 복구", send: "보내기 전송 제출", history: "기록 이력 히스토리",
        /* 탐색 · 화살표 */
        "chevron-left": "이전 왼쪽 화살", "chevron-right": "다음 오른쪽 화살", "chevron-up": "접기 위 화살", "chevron-down": "펼치기 아래 화살", "chevrons-left": "처음으로 맨앞 이중화살",
        "chevrons-right": "마지막으로 맨뒤 이중화살", "arrow-left": "왼쪽 이전 뒤로", "arrow-right": "오른쪽 다음 앞으로", "arrow-up": "위 증가 상승", "arrow-down": "아래 감소 하락",
        "arrow-narrow-left": "왼쪽 얇은 화살 이전", "arrow-narrow-right": "오른쪽 얇은 화살 다음", "arrow-up-right": "증가 상승 외부이동", "arrow-down-right": "감소 하락 하위이동",
        "arrow-back-up": "실행취소 되돌리기", "arrow-forward-up": "다시실행 앞으로", "arrows-sort": "정렬 순서", "sort-ascending": "오름차순 정렬", "sort-descending": "내림차순 정렬",
        "arrows-maximize": "확대 전체화면 펼침", "arrows-minimize": "축소 전체화면 해제", maximize: "최대화 전체화면", minimize: "최소화 창내리기", "switch-horizontal": "전환 교체 좌우바꿈",
        /* 상태 · 피드백 */
        "info-circle": "정보 안내", "info-square": "정보 안내 사각", "alert-triangle": "경고 주의 위험", "alert-circle": "경고 오류 알림", "alert-octagon": "심각 위험 경고",
        "circle-check": "성공 완료 확인", "circle-x": "실패 오류 취소", "circle-minus": "제외 빼기 비활성", "circle-plus": "추가 포함 생성", "help-circle": "도움말 물음표 안내",
        "exclamation-circle": "주의 느낌표 경고", ban: "금지 차단 불가", forbid: "차단 금지 제한", progress: "진행 처리중 상태", hourglass: "대기 모래시계 처리중", "loader-2": "로딩 처리중 스피너",
        rotate: "회전 돌리기", repeat: "반복 되풀이 재시도",
        /* 사용자 · 권한 */
        user: "사용자 계정 사람", "user-plus": "사용자 추가 초대", "user-minus": "사용자 제거 해제", "user-check": "사용자 승인 확인", "user-x": "사용자 거부 차단", "user-circle": "프로필 계정 사용자",
        "user-cog": "사용자 설정 계정관리", "user-shield": "사용자 권한 보안 관리자", "user-edit": "사용자 수정 정보변경", "user-off": "사용자 비활성 탈퇴", users: "사용자 목록 여러명",
        "users-group": "그룹 조직 부서", id: "신분증 계정 식별", "id-badge": "사원증 명찰 출입증",
        /* 보안 */
        shield: "보안 방패 보호", "shield-check": "보안 정상 안전", "shield-lock": "보안 잠금 암호화", "shield-off": "보안 해제 비활성", "shield-x": "보안 위험 차단실패", "shield-half": "부분 보안 일부보호",
        lock: "잠금 자물쇠 비공개", "lock-open": "잠금해제 열림 공개", key: "키 열쇠 인증키", fingerprint: "지문 생체인증", scan: "스캔 검사 탐지", "face-id": "얼굴인식 생체인증", password: "비밀번호 암호",
        bug: "버그 결함 취약점", "bug-off": "버그 해결 취약점 조치", certificate: "인증서 자격 증명서",
        /* 파일 · 문서 */
        file: "파일 문서", "file-text": "텍스트 파일 문서", "file-plus": "파일 추가 새문서", "file-minus": "파일 제거", "file-check": "파일 확인 검증완료", "file-x": "파일 오류 삭제",
        "file-search": "파일 검색 문서찾기", "file-export": "파일 내보내기 추출", "file-import": "파일 가져오기 불러오기", "file-code": "코드 파일 스크립트", "file-description": "상세 문서 설명서",
        "file-zip": "압축파일 집 아카이브", files: "여러 파일 문서들", folder: "폴더 디렉터리", "folder-open": "폴더 열기 탐색", "folder-plus": "폴더 추가 새폴더", "folder-off": "폴더 없음 비활성",
        clipboard: "클립보드 붙여넣기", "clipboard-list": "작업 목록 점검표", "clipboard-check": "점검 완료 확인목록", report: "보고서 리포트", paperclip: "첨부 클립 파일첨부",
        /* 데이터 · 목록 */
        database: "데이터베이스 디비 저장소", "database-export": "디비 내보내기 백업", "database-import": "디비 가져오기 복원", "database-off": "디비 중지 연결끊김", table: "표 테이블 목록",
        "table-plus": "행 추가 표 추가", "table-export": "표 내보내기 엑셀", columns: "열 컬럼 보기설정", list: "목록 리스트", "list-check": "점검 목록 체크리스트", "list-details": "상세 목록 항목",
        "list-numbers": "번호 목록 순번", checkbox: "체크박스 선택", stack: "스택 쌓기 계층", box: "박스 상자 패키지", package: "패키지 꾸러미 배포",
        /* 서버 · 네트워크 */
        server: "서버 장비 호스트", "server-2": "서버 랙 장비", "server-off": "서버 중지 장애", "server-cog": "서버 설정 관리", cloud: "클라우드 구름", "cloud-upload": "클라우드 업로드 백업",
        "cloud-download": "클라우드 다운로드 복원", "cloud-off": "클라우드 끊김 오프라인", network: "네트워크 망 연결", wifi: "와이파이 무선 연결", "wifi-off": "와이파이 끊김 무선해제", world: "전체 글로벌 세계",
        globe: "지구 글로벌 도메인", router: "라우터 공유기 장비", antenna: "안테나 신호 수신", plug: "전원 플러그 연결", "plug-connected": "연결됨 접속 통합", "plug-off": "연결끊김 접속해제",
        sitemap: "사이트맵 구조 계층", route: "경로 라우팅 흐름",
        /* 장치 */
        "device-desktop": "데스크톱 PC 컴퓨터", "device-laptop": "노트북 랩톱", "device-mobile": "모바일 휴대폰 스마트폰", "device-tablet": "태블릿 패드", "device-tv": "티브이 모니터 화면",
        devices: "기기 단말 장치", cpu: "중앙처리장치 시피유 프로세서", disc: "디스크 저장장치", usb: "유에스비 외장장치", bluetooth: "블루투스 무선", battery: "배터리 전원 잔량", "battery-charging": "충전 배터리 전원",
        power: "전원 켜기 끄기", mouse: "마우스 포인터 입력",
        /* 차트 · 분석 */
        "chart-bar": "막대 차트 통계 그래프", "chart-line": "선 차트 추이 그래프", "chart-pie": "원형 차트 비율", "chart-area": "영역 차트 누적", "chart-donut": "도넛 차트 비율",
        "chart-dots": "산점도 분포 차트", "chart-histogram": "히스토그램 분포", "chart-infographic": "인포그래픽 지표", presentation: "발표 프레젠테이션 보고",
        "presentation-analytics": "분석 보고 발표자료", "trending-up": "상승 증가 추이", "trending-down": "하락 감소 추이", gauge: "계기판 지표 측정", activity: "활동 추이 로그",
        /* 시간 · 일정 */
        calendar: "달력 날짜 일정", "calendar-event": "일정 이벤트 예약", "calendar-time": "일시 날짜시간 예약", "calendar-stats": "기간 통계 월별", "calendar-off": "일정 없음 휴무", clock: "시계 시간",
        "clock-hour-4": "시각 시간 설정", alarm: "알람 타이머 경보", timeline: "타임라인 이력 흐름", stopwatch: "스톱워치 소요시간 측정", "hourglass-high": "대기 처리중 모래시계",
        "history-toggle": "기록 전환 이력보기",
        /* 알림 · 커뮤니케이션 */
        bell: "알림 벨 공지", "bell-off": "알림 끄기 무음", "bell-ringing": "알림 발생 울림 긴급", mail: "메일 이메일 편지", "mail-opened": "메일 읽음 열람", "mail-forward": "메일 전달 포워드",
        message: "메시지 대화", "message-2": "메시지 쪽지 대화", "message-circle": "댓글 대화 문의", messages: "대화 목록 메시지", phone: "전화 통화 연락처", "phone-call": "통화 수신 연결",
        headset: "헤드셋 상담 지원", speakerphone: "공지 안내 확성기", rss: "구독 피드 알에스에스", broadcast: "방송 송출 전파",
        /* 레이아웃 · 설정 */
        layout: "레이아웃 배치 화면", "layout-grid": "그리드 격자 배치", "layout-list": "목록 보기 리스트형", "layout-sidebar": "좌측 사이드바 메뉴", "layout-sidebar-right": "우측 사이드바 패널",
        "layout-columns": "컬럼 분할 좌우", "layout-rows": "행 분할 상하", "layout-dashboard": "대시보드 요약 화면", "layout-board": "보드 칸반 카드", "menu-2": "메뉴 햄버거 목록",
        adjustments: "조정 설정 필터", "adjustments-horizontal": "조정 설정 가로 슬라이더", settings: "설정 톱니 환경설정", "settings-2": "설정 옵션 환경", tool: "도구 설정 유지보수", tools: "도구 모음 관리",
        dashboard: "대시보드 계기 요약", inbox: "수신함 받은편지 메일함",
        /* 텍스트 · 코드 */
        typography: "타이포그래피 서체 글꼴", "text-size": "글자 크기 폰트크기", bold: "굵게 볼드 강조", italic: "기울임 이탤릭", "align-left": "왼쪽 정렬", "align-center": "가운데 정렬",
        "align-right": "오른쪽 정렬", code: "코드 소스 개발", "code-dots": "코드 스니펫 조각", braces: "중괄호 객체 코드", brackets: "대괄호 배열 코드", terminal: "터미널 콘솔 명령어",
        "terminal-2": "터미널 셸 명령창", json: "제이슨 데이터 형식",
        /* 지도 · 장소 */
        map: "지도 맵", "map-pin": "위치 핀 장소", "map-2": "지도 경로 길찾기", location: "위치 좌표 지점", gps: "지피에스 위치추적", "current-location": "현재 위치 내위치", building: "건물 사업장 기관",
        home: "홈 처음 대시보드", compass: "나침반 방향 탐색", road: "경로 길 도로",
        /* 미디어 */
        "player-play": "재생 시작 플레이", "player-pause": "일시정지 멈춤", "player-stop": "정지 중단", "player-skip-back": "이전 트랙 되감기", "player-skip-forward": "다음 트랙 건너뛰기",
        volume: "소리 음량 볼륨", "volume-off": "음소거 무음", microphone: "마이크 녹음 음성", "microphone-off": "마이크 끔 음소거", camera: "카메라 사진 촬영", video: "영상 비디오 녹화",
        photo: "사진 이미지 그림", movie: "동영상 영화 미디어", "screen-share": "화면 공유 원격",
        /* 개발 */
        "git-branch": "브랜치 분기 깃", "git-commit": "커밋 변경기록 깃", "git-merge": "병합 머지 깃", "git-pull-request": "풀리퀘스트 코드리뷰 깃", "git-fork": "포크 분기 복제",
        api: "에이피아이 연동 인터페이스", webhook: "웹훅 연동 콜백", bolt: "번개 빠름 즉시 실시간", variable: "변수 파라미터", function: "함수 로직 기능",
        /* 도형 · 표시 */
        circle: "원 동그라미", square: "사각형 네모", triangle: "삼각형", hexagon: "육각형", point: "점 지점 표시", asterisk: "별표 필수 와일드카드", at: "골뱅이 이메일 멘션", tag: "태그 라벨 분류",
        tags: "태그 목록 분류", bookmarks: "북마크 목록 모음", palette: "팔레트 컬러 색상 테마", "color-swatch": "색상 견본 스와치", contrast: "명암 대비 테마", droplet: "물방울 색농도 투명도",
        /* 사이트 크롬 · 기타 */
        "sun-high": "라이트모드 낮 해 밝기", moon: "다크모드 밤 달", "device-floppy": "저장 플로피 디스켓", logout: "로그아웃 나가기", login: "로그인 들어가기", "door-exit": "나가기 퇴장 종료",
        "zoom-in": "확대 줌인", "zoom-out": "축소 줌아웃", lifebuoy: "고객지원 도움 구조", qrcode: "큐알코드 코드스캔", barcode: "바코드 식별코드", news: "공지 소식 뉴스"
      };
      const names = Object.keys(ICONS).sort();
      /* 복사할 SVG 는 data 속성에 또 담지 않는다 — app.js 가 화면에 그려진 .o / .f 를 그대로 읽는다(300개면 속성 중복만 280KB) */
      const tile = n => { const m = ICONS[n]; const kw = [n, m.category, ...(m.tags || []), KO[n] || ""].join(" ").toLowerCase(); return `<button type="button" class="icon-tile${m.f ? "" : " no-f"}" data-name="${n}" data-cat="${attr(m.category || "")}" data-tags="${attr((m.tags || []).join("|"))}" data-ko="${attr(KO[n] || "")}" data-kw="${attr(kw)}" title="${n}" aria-label="${n} 상세 보기" aria-haspopup="dialog"><span class="o">${I(n, 24)}</span>${m.f ? `<span class="f">${I(n, 24, { style: "filled" })}</span>` : ""}</button>`; };
      return `<h1>Icons${nb("foundations", "icons")}</h1><p class="lead">아이콘은 기능이나 콘텐츠를 시각적으로 표현하는 요소로, 사용자가 인터페이스를 빠르게 탐색할 수 있도록 돕습니다. 24px 그리드 · 스트로크 2px · 라운드 캡의 단순한 형태인 Tabler Icons 를 씁니다. 기본은 Outline 이고, 선택 · 활성 상태를 강조할 때만 Filled 를 씁니다.</p>
<h2 id="search">Search icons</h2><p>관리자 콘솔에서 자주 쓰는 아이콘을 추린 세트입니다. 세트에 없는 아이콘이 필요하면 같은 Tabler 세트에서 골라 더합니다. 검색하면 이름뿐 아니라 한글을 포함한 연상 키워드도 함께 찾습니다. 아이콘을 누르면 이름 · 스타일 · 키워드를 보고 SVG 를 복사·다운로드할 수 있습니다. 사용 코드는 아래 Usage 를 참고하세요.</p>
<div class="icon-tools"><div class="searchbar" role="search">${I("search")}<input type="search" id="iconSearch" placeholder="아이콘 이름 검색" aria-label="아이콘 검색"></div><div class="select-btn" role="radiogroup" aria-label="아이콘 스타일" id="iconStyle"><button type="button" class="on" role="radio" aria-checked="true" data-style="outline">Outline</button><button type="button" role="radio" aria-checked="false" data-style="filled">Filled</button></div><span id="iconCount" style="font-size:12px;color:var(--foreground-neutral-tertiary)">${names.length}개</span></div>
<div class="icon-grid" id="iconGrid">${names.map(tile).join("")}</div><div class="icon-empty" id="iconEmpty" hidden>검색 결과가 없습니다. 세트 밖의 아이콘은 <code>assets/icons/</code> 에서 찾아 <code>_build/icons.js</code> 의 <code>ICON_NAMES</code> 에 추가하세요.</div>
<h2 id="usage">Usage</h2><p>인라인 SVG 가 기본입니다. 아이콘은 둘레 글자의 색을 따르고 크기는 자유롭게 정합니다. 의미가 있는 색은 아이콘을 감싼 요소의 글자 색으로 줍니다. 크기는 배지 14 · 표와 페이지 이동 16 · 버튼과 입력 18 · 알림 20 · 빈 화면과 타일 24 를 씁니다. 정적 파일이 필요하면 이미지로, 배경이나 장식 자리에는 마스크로 씁니다.</p>
${codeBlock("icon-inline", I("search", 18).split("><").join(">\n  <").replace("\n  </svg>", "\n</svg>"), "html")}
${codeBlock("icon-react", `// React: @jiran/ds-react 의 Icon (이 페이지의 ${names.length}개, 사이트와 같은 마크업)\nimport { Icon } from "@jiran/ds-react";\n\n<Icon name="search" size={18} />\n<Icon name="shield" size={24} filled />\n<Icon name="alert-triangle" label="경고" />  // role="img" + aria-label\n\n// 세트 밖의 아이콘: 같은 세트의 공식 패키지\n// npm i @tabler/icons-react → import { IconSearch } from "@tabler/icons-react";`, "tsx")}
${codeBlock("icon-img", `<!-- 정적 파일 (색 상속 불가, 장식용) -->\n<img src="assets/icons/outline/search.svg" width="18" height="18" alt="">\n\n<!-- CSS mask: currentColor 로 색 상속 -->\n.ico-search{width:18px;height:18px;background:currentColor;-webkit-mask:url("assets/icons/outline/search.svg") center/contain no-repeat;mask:url("assets/icons/outline/search.svg") center/contain no-repeat}`, "html")}
<dl class="kv"><dt>파일 · 이름</dt><dd><code>assets/icons/{outline|filled}/{name}.svg</code> — Tabler 원본 이름 그대로(kebab-case). Figma 는 Tabler Icons 라이브러리, 컴포넌트 이름 = 파일 이름</dd><dt>사이트 소스</dt><dd><code>I("name", size, { style: "filled" })</code> 헬퍼(<code>_build/icons.js</code>). 새 아이콘은 <code>ICON_NAMES</code> 에 추가하면 빌드 시 인라인되고 이 갤러리와 React <code>Icon</code> 에 함께 나타납니다</dd></dl>
${valPop()}`;
    },

    /* ================= Typography ================= */
    "foundations/typography": () => {
      /* 스케일 · 굵기는 style.src.css 의 .t-* 규칙에서 읽는다(2026-11-12 — 손으로 옮긴 배열은 CSS 가 바뀌는 날 문서만 남는다) */
      const tname = (c) => c.replace(/^(\w+)-(\d)(?:-(\w+))?$/, (_, a, d, v) => `${a[0].toUpperCase()}${a.slice(1)} ${d}${v ? "/" + v[0].toUpperCase() + v.slice(1) : ""}`);
      const ramp = [...STYLE().matchAll(/^\.t-([a-z]+-\d(?:-[a-z]+)?)\{font-size:var\(--font-size-(\d+)\);line-height:([^;]+);font-weight:(\d+);letter-spacing:([^;}]+)\}/gm)].map((m) => [tname(m[1]), "t-" + m[1], +m[2], parseFloat(LIB.toPx(m[3])), m[5], +m[4]]);
      const weights = [...STYLE().matchAll(/^\.t-(bold|semibold|medium|regular)\{font-weight:(\d+)\}/gm)].map((m) => ["t-" + m[1], +m[2]]);
      if (ramp.length !== 19 || weights.length !== 4) throw new Error(`style.src.css: 텍스트 스타일 ${ramp.length} · 굵기 ${weights.length} — 19 · 4 가 아니다`);
      const wname = { 700: "Bold", 600: "SemiBold", 500: "Medium", 400: "Regular" };
      /* 화면 폭 단계 — 표와 코드는 style.src.css 의 ds:scale 블록에서 읽는다(손으로 옮겨 두면 단계가 바뀌는 날 문서만 남는다) */
      const scaleCss = (/\/\* ds:scale:start[\s\S]*?\*\/([\s\S]*?)\/\* ds:scale:end/.exec(STYLE()) || [])[1];
      if (!scaleCss) throw new Error("style.src.css: ds:scale 블록 없음");
      const base = +/^html\{font-size:([\d.]+)%\}/m.exec(scaleCss)[1];
      const steps = [...scaleCss.matchAll(/@media \((max|min)-width:(\d+)px\)\{html\{font-size:([\d.]+)%\}\}/g)].map((m) => ({ dir: m[1], w: +m[2], pct: +m[3] }));
      const lo = steps.filter((x) => x.dir === "max").sort((a, b) => a.w - b.w), hi = steps.filter((x) => x.dir === "min").sort((a, b) => a.w - b.w);
      const n = (v) => String(+v.toFixed(3));
      const row = (label, pct) => { const k = pct / base, px = 16 * k; return [label, `${n(pct)}% (${n(px)}px)`, n(14 * k), n(40 * k), k < 1 ? "줄지 않음 — 12 · 11 그대로" : `${n(12 * k)} · ${n(11 * k)}`]; };
      const scaleRows = [...lo.map((x) => row(`~ ${x.w}`, x.pct)), row(`${lo.length ? lo[lo.length - 1].w + 1 : 0} – ${hi.length ? hi[0].w - 1 : "∞"} (기준)`, base), ...hi.map((x, i) => row(`${x.w} ${hi[i + 1] ? "– " + (hi[i + 1].w - 1) : "~"}`, x.pct))];
      return `<h1>Typography</h1><p class="lead">타이포그래피는 텍스트를 읽기 쉽고 아름답게 표현하는 시각적 체계로, 폰트 선택 · 크기 · 굵기 · 행간 · 자간을 조합하여 정보의 위계와 가독성을 만들어냅니다. Pretendard 서체 하나로 타이틀 · 본문 · 숫자 · 캡션의 크기와 굵기 차이를 분명히 두어 위계를 만들고, 각 단계를 텍스트 스타일 클래스로 제공합니다.</p>
<h2 id="basic">Basic typography</h2><p>한국어와 영어를 함께 쓰는 관리 콘솔의 기본 글꼴로 <a href="https://github.com/orioncactus/pretendard" target="_blank" rel="noopener">Pretendard</a> 를 사용합니다. 가변 서체 하나로 Regular 400 · Medium 500 · SemiBold 600 · Bold 700 을 모두 표현합니다. 숫자는 자릿수가 바뀌어도 폭이 같은 숫자 글꼴로 써서 표와 KPI 의 정렬을 유지합니다.</p>
<p>일본어도 지원합니다. Pretendard 에는 가나는 있지만 <b>한자가 없어서</b>, 서체 순서에서 Pretendard 바로 뒤에 <b>Pretendard JP</b> 를 둡니다. 한글 · 라틴 · 가나는 Pretendard 가, 한자만 Pretendard JP 가 그립니다.
Pretendard JP 는 글자 범위별 조각 119개로 되어 있습니다. 한자가 화면에 나올 때만 해당 조각을 내려받고, 한자가 없는 화면은 하나도 받지 않습니다.
일본어를 쓰는 제품만 일본어 서체 파일을 더합니다. 한자는 일본식 자형이라 한국어 문장 속 한자도 그 모양이 됩니다. 한국식 자형이 필요한 자리에는 서체의 한국식 자형 옵션을 켭니다.</p>
<div class="type-sample"><b>Pretendard 프리텐다드 Aa</b><span class="num t-num">0123456789 · 1,284 · 99.2%</span></div>
<div class="type-sample" lang="ja"><b>日付を選択 · 2026年9月</b><span class="num t-num">今日 · 適用 · キャンセル</span></div>
${codeBlock("typo-font", `@font-face{font-family:"Pretendard";font-weight:45 920;font-style:normal;font-display:swap;src:url("fonts/PretendardVariable.woff2") format("woff2-variations")}\n/* 일본어를 쓸 때만: <link rel="stylesheet" href="assets/font-jp.css"> — @font-face{font-family:"Pretendard JP";…;unicode-range:…} × 119 */\n:root{--font-sans:"Pretendard","Pretendard JP",-apple-system,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;--font-mono:ui-monospace,"SF Mono",Menlo,Consolas,"D2Coding",monospace}\nbody{font-family:var(--font-sans);font-size:var(--font-size-16);line-height:1.65;font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased}`, "css", "CSS 복사")}
<h2 id="wordbreak">Word break</h2><p>개발 시 본문 · 표 · 설명 텍스트는 브라우저 기본값대로 <b>음절 단위</b>로 줄바꿈됩니다. 따라서 디자인에서 별도로 줄바꿈 위치를 지정하지 않아도 되고, 폭이 좁은 셀에서도 넘치지 않습니다. 제목 · 알림 · 빈 화면 문구처럼 짧고 눈에 띄는 문장만 <b>단어 단위</b>로 줄을 바꿉니다.</p>
<div class="wb-demo"><div><p style="max-width:300px"><mark>보안</mark> <mark>정책이</mark> <mark>적용되어</mark> <mark>모든</mark> <mark>단말이</mark> <mark>보호되고</mark> <mark>있습니다</mark></p><small>기본 · 음절 단위 — 좁은 폭에서 어절 중간에서도 줄이 바뀝니다</small></div><div><p class="keep-all" style="max-width:300px"><mark>보안</mark> <mark>정책이</mark> <mark>적용되어</mark> <mark>모든</mark> <mark>단말이</mark> <mark>보호되고</mark> <mark>있습니다</mark></p><small>.keep-all · 단어 단위 — 어절이 끊기지 않고 줄이 바뀝니다</small></div></div>
${codeBlock("typo-wb", `/* 기본: 음절 단위(브라우저 기본). 제목·알림 등 짧은 문장만 단어 단위 */\n.keep-all{word-break:keep-all;overflow-wrap:anywhere}`, "css", "CSS 복사")}
<h2 id="style">Style</h2><p>Figma Text Style 이름과 1:1 인 ${ramp.length}단계입니다. 스타일은 크기 · 행간 · 자간을 정하고, 굵기는 아래 Weight 의 클래스로 고릅니다. 클래스를 붙이지 않으면 표의 기본 굵기입니다. 자간은 Pretendard 권장값(크기가 작을수록 넓게)을 따르고, 행간은 고정값으로 두어 컴포넌트 높이를 예측할 수 있게 합니다. Body · Label 1 의 Normal 은 한 줄 UI 글자, Reading 은 여러 줄로 읽는 글입니다. 표의 크기 · 행간은 루트가 16px 인 기준 화면의 값이고, CSS 는 같은 값을 rem 으로 적습니다. 숫자에는 숫자 클래스를 함께 씁니다. 클래스를 누르면 복사됩니다.</p>
${tbl(["명칭", "크기", "행간", "자간", "기본 굵기", "클래스"], ramp.map(([n, cls, s, lh, ls, w]) => [`<span class="smp ${cls}">${n}</span>`, `${s}px`, `${lh}px (${(lh / s).toFixed(3).replace(/\.?0+$/, "")})`, ls, `${w} ${wname[w]}`, `<code data-copy-text=".${cls}" title="클래스 복사" style="cursor:pointer">.${cls}</code>`]), "type-table")}
<p>컴포넌트의 글자도 이 표의 크기 · 행간 · 자간 중 하나를 씁니다. 예외는 고정폭으로 쓰는 Code 블록의 12/20 과, 둘레 글자의 0.9배인 인라인 코드입니다.</p>
<h2 id="weight">Weight</h2><p>Pretendard 가변 서체의 굵기 넷입니다. 스타일 클래스 뒤에 붙여 기본 굵기를 바꿉니다. 카드 제목은 Body 1/Normal 에 SemiBold 를 붙입니다.</p>
${tbl(["명칭", "굵기", "클래스"], weights.map(([cls, w]) => [`<span class="smp t-body-1-normal ${cls}">${wname[w]}</span>`, String(w), `<code data-copy-text=".${cls}" title="클래스 복사" style="cursor:pointer">.${cls}</code>`]))}
<dl class="kv" style="margin-top:var(--space-6)"><dt>페이지 타이틀</dt><dd>Title 1 · 화면 제목(h1), 페이지당 하나 — 제품 화면의 Page Header 제목은 Title 2</dd><dt>대화상자 제목</dt><dd>Headline 1 · Bold</dd><dt>섹션 · 카드 타이틀</dt><dd>Body 1/Normal · SemiBold</dd><dt>본문 · 표 칸</dt><dd>Label 1/Reading 14 — 콘솔 기본 크기</dd><dt>버튼 · 필드 라벨</dt><dd>Label 1/Normal · SemiBold</dd><dt>KPI 수치</dt><dd>Title 1 · 숫자 클래스</dd><dt>표 머리글</dt><dd>Label 2 · SemiBold</dd><dt>태그 · 보조 설명</dt><dd>Caption 1</dd></dl>
<h2 id="units">Size units</h2><p>글자 · 간격 · 높이는 <b>rem</b> 으로 적습니다. rem 은 페이지 루트의 글꼴 크기를 기준으로 하므로, 화면 폭에 따라 루트 크기를 한 단계 바꾸면 화면 전체가 같은 비율로 커지거나 줄어듭니다. 기준 화면의 루트는 16px 이라 Figma 의 px 수치와 같습니다. 루트를 % 로 적어 사용자가 브라우저 글꼴 크기를 바꾸면 그것도 따릅니다.</p>
${tbl(["화면 폭", "루트 크기", "Label 1 (14)", "버튼 md (40)", "12px 이하 글자"], scaleRows)}
<ul><li><b>최소 글자 크기</b> — 좁은 화면에서 12px 이 11.25 · 11px 이 10.3 이 되면 한글이 읽기 어려워 12 이하 글자와 그 행간은 줄이지 않습니다.</li><li><b>em 은 크기 단위로 쓰지 않습니다</b> — 부모 크기를 곱해 중첩될수록 값이 커지거나 작아집니다. 자간처럼 글자 크기를 따라가야 하는 값과 인라인 코드에만 씁니다.</li><li><b>px 로 남기는 것</b> — 테두리 · 외곽선 두께, 그림자, 2px 이하. 소수 px 에서 선이 흐려지지 않게 합니다.</li><li><b>글자 크기는 토큰으로</b> — 컴포넌트의 글자 크기는 글자 크기 토큰만 씁니다. 탐색형 차트도 화면 폭 단계의 비율을 곱해 그립니다.</li><li><b>React</b> — 패키지도 rem 이라 제품 페이지 루트의 글꼴 크기를 따릅니다. 화면 폭 단계는 패키지의 단계 파일을 불러올 때만 켜집니다. 제품이 루트 글꼴 크기를 62.5% 처럼 줄여 두면 화면 전체가 작아집니다.</li></ul>
${codeBlock("typo-units", LIB.tokenBlock(["font-size-"], STYLE()) + "\n\n/* 화면 폭 단계 — 패키지는 @jiran/ds-react/scale.css */\n" + scaleCss.trim(), "css", "CSS 복사")}
${codeBlock("typo-css", LIB.cssFor([".t-", ".keep-all"], STYLE(), VERSION), "css", "CSS 복사")}`;
    },
  };
};
