/* =========================================================
   foundations.js — Foundations 페이지 (Overview · Base material: Colors · Elevation · Grid · Icons · Typography, Web Desktop 만)
   render.js 가 PAGES 에 병합한다: Object.assign(PAGES, FOUNDATION_PAGES(helpers))
   ========================================================= */
window.FOUNDATION_PAGES = function (H) {
  const { codeBlock, tokenSection, sw, nb, STYLE, CONTRAST, LADDERS, VERSION, PRODUCTS, ICONS, I, LIB, dedent } = H;
  const attr = s => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

  /* ---------- 토큰 값 해석 (Light / Dark) ---------- */
  function vars() {
    const css = STYLE(); const L = LIB.parseVars(LIB.rootBlock(css, ":root")); const D = Object.assign({}, L, LIB.parseVars(LIB.rootBlock(css, ':root[data-theme="dark"]')));
    return { L, D };
  }

  /* ---------- 값 팝오버 (Colors · Elevation · Icons 공용) ----------
     머리의 테마 아이콘(해/달) · 아이콘 미리보기 · 다운로드는 종류에 따라 하나만 보인다 — #valPop 의 .kind-icon 으로 가린다.
     해/달을 .val-pop-theme 로 감싼 이유: 다크 규칙이 :root[data-theme="dark"] .val-pop .i-moon 이라 특정도가 높아, 래퍼를 숨기는 편이 깔끔하다.
     줄(Hex/RGBA/Token · Value/Token)은 app.js 가 클릭 시점에 만든다 — 종류와 테마·제품 컬러에 따라 달라지므로 */
  const valPop = () => `<div class="val-pop" id="valPop" hidden tabindex="-1" role="dialog" aria-labelledby="valPopTitle">
<div class="val-pop-head"><span class="val-pop-theme"><span class="i-sun" title="Light 테마 값">${I("sun-high", 18)}</span><span class="i-moon" title="Dark 테마 값">${I("moon", 18)}</span></span><span class="val-pop-icon" id="valPopIcon"></span><span class="val-pop-title" id="valPopTitle">Value</span><a class="btn sm tertiary icon val-pop-dl" id="valPopDl" href="#" download aria-label="SVG 다운로드" title="SVG 다운로드">${I("download", 18)}</a><button type="button" class="btn sm tertiary icon" id="valPopCopy" data-copy-text="" aria-label="토큰 복사" title="토큰 복사"><span class="i-copy">${I("copy", 18)}</span><span class="i-copied">${I("check", 18)}</span></button></div>
<div class="val-rows" id="valPopRows"></div></div>`;

  /* ---------- Semantic 스와치 행 ---------- */
  /* 셀은 버튼이다 — 클릭하면 app.js 의 openColor() 가 바로 아래에 값 팝오버를 띄운다(Atomic 스와치도 같은 .val-cell)(키보드로도 열림).
     data-copy-text 를 두면 복사 위임 핸들러가 먼저 걸려 팝오버가 열리지 않으므로 붙이지 않는다.
     값(Hex·RGBA)은 테마·제품 컬러에 따라 달라지므로 빌드가 아니라 클릭 시점의 렌더 색에서 읽는다. */
  function semRow(items, o = {}) {
    /* "Background - Normal" 섹션의 "Normal" 처럼 섹션 제목이 이미 이름으로 끝나면 되풀이하지 않는다 */
    const label = name => (!o.group ? name : o.group.toLowerCase().endsWith(name.toLowerCase()) ? o.group : o.group + " / " + name);
    return `<div class="sem-row${o.alpha ? " checker" : ""}">${items.map(([name, tok]) => `<button type="button" class="val-cell" data-token="${tok}" data-label="${attr(label(name))}" aria-haspopup="dialog" title="${attr(label(name))} 값 보기"><div class="bar${o.line ? " line" : ""}"><i style="background:var(${tok})"></i></div><div class="name">${name}</div></button>`).join("")}</div>`;
  }
  /* o.h3 — 상위 h2 아래 묶이는 절(Theme 의 구성원들). 포함 관계가 ToC 에 드러나야 한다 */
  const sem = (id, title, desc, items, o = {}) => `<h${o.h3 ? 3 : 2} id="${id}">${title}</h${o.h3 ? 3 : 2}><p>${desc}</p>${semRow(items, Object.assign({ group: title }, o))}`;
  /* 의도 × 역할 행렬 — 의도 하나를 한 줄로 두고 역할을 열로 세운다.
     같은 역할이 의도를 가로질러 같은 자리에 오므로 "역할이 1급"이라는 설계가 눈으로 확인된다.
     칸은 .sem-row 와 같은 .val-cell 버튼이라 값 팝오버가 그대로 동작한다.
     cols = [[역할 접미사, 표시 이름, 대비 기준, 알파여부], …] · rows = [[의도 표시 이름, 토큰 접두사, 메모], …] */
  /* ── 명도 사다리 — 게이트가 잰 L* 를 두 모드 나란히 보여 준다.
     현재 테마와 무관하게 **측정값의 HEX 를 인라인으로** 칠한다: 페이지가 라이트일 때도 다크 사다리가 보여야
     두 모드를 비교할 수 있다. 중첩 data-theme 으로는 안 된다 — 다크 블록 선택자가 :root[data-theme="dark"] 라
     루트에만 걸리기 때문이다. */
  const ladderView = () => {
    const all = LADDERS();
    if (!all.length) return `<p class="note">명도 사다리는 빌드가 측정해 주입합니다 — <code>node build.js</code> 로 생성한 페이지에서만 보입니다.</p>`;
    const names = [...new Set(all.map((l) => l.name))];
    const col = (l) => {
      if (!l) return `<div class="lad-col"></div>`;
      const rows = l.hex.map((h, i) => {
        const step = i === 0 ? "" : `<div class="lad-step"><span>↓ ${l.steps[i - 1]}</span></div>`;
        const tok = l.toks[i].replace(/^--/, "");
        return `${step}<div class="lad-chip"><i style="background:${h}"></i><b>${tok}</b><span>L* ${l.lstar[i]}</span></div>`;
      }).join("");
      const bad = [];
      if (l.reversed) bad.push("방향 뒤집힘");
      if (l.minStep < 2) bad.push(`한 단계 안 보임 ΔL* ${l.minStep}`);
      if (l.balance && l.ratio !== null && l.ratio > l.balanceMax) bad.push(`치우침 ${l.ratio}x`);
      return `<div class="lad-col"><div class="lad-head">${l.theme === "light" ? "라이트" : "다크"}${bad.length ? `<em>${bad.join(" · ")}</em>` : "<span>고름</span>"}</div>${rows}</div>`;
    };
    return names.map((n) => {
      const L2 = all.find((x) => x.name === n && x.theme === "light"), D = all.find((x) => x.name === n && x.theme === "dark");
      const needsBalance = (L2 || D).balance;
      return `<div class="lad"><div class="lad-name"><b>${n}</b><span>${needsBalance ? "낙폭이 균등해야 함" : "균형 면제 — 깊이 모델이거나 동시에 보이지 않음"}</span></div>${col(L2)}${col(D)}</div>`;
    }).join("");
  };

  /* ── 대비표 — 게이트(contrast.js)가 잰 값을 그대로 쓴다. 사람이 숫자를 적지 않는다.
     같은 전경 토큰이 여섯 맥락(라이트·다크 × 제품 세 경우) × 여러 바탕에서 재어지므로,
     절별 요약은 "가장 나쁜 값"만 보여 준다 — 어떤 조합에서든 기준을 넘긴다는 것이 보장이기 때문이다.
     advisory(기준 미달이지만 빌드를 막지 않는 항목)는 숨기지 않고 그대로 드러낸다. */
  const ctRows = (fgs) => {
    const t = CONTRAST().filter((r) => fgs.includes(r.fg));
    if (!t.length) return "";
    const by = new Map();
    for (const r of t) {
      const k = r.fg + "|" + r.bg;
      const cur = by.get(k);
      if (!cur || r.r < cur.r) by.set(k, r);
    }
    const rows = [...by.values()].sort((a, b) => (a.fg === b.fg ? a.bg.localeCompare(b.bg) : fgs.indexOf(a.fg) - fgs.indexOf(b.fg)));
    return `<details class="ct"><summary>측정값 ${rows.length}쌍 — 가장 나쁜 맥락 기준</summary>${tbl(["전경", "바탕", "최소", "실측", "맥락"], rows.map((r) => [
      `<code>${r.fg}</code>`, `<code>${r.bg}</code>`, String(r.min),
      `<b class="${r.pass ? "ct-ok" : "ct-no"}">${r.r}</b>`, r.ctx,
    ]), "tbl compact")}</details>`;
  };
  /* 전수표 — 맥락별로 접어 둔다. 594행을 펼쳐 두면 페이지를 훑을 수 없다 */
  const ctAll = () => {
    const t = CONTRAST();
    if (!t.length) return `<p class="note">대비표는 빌드가 측정해 주입합니다 — <code>node build.js</code> 로 생성한 페이지에서만 보입니다.</p>`;
    const ctxs = [...new Set(t.map((r) => r.ctx))];
    const bad = t.filter((r) => !r.pass);
    return `<p>선언한 쌍을 <b>라이트·다크 × 제품 세 경우</b>에서 전수 측정한 결과입니다 — 총 <b>${t.length}</b>행. 쌍 선언은 <code>_build/contrast.pairs.js</code> 에 있고, 미달이면 빌드가 실패합니다.</p>
${bad.length ? `<p class="note"><b>기준에 못 미치지만 빌드를 막지 않는 항목(advisory) ${bad.length}건.</b> 전부 <code>--line-strong</code> 입니다 — 중립 200 은 흰 바탕에서 1.75 입니다. 3:1 을 맞추려면 중립 500(4.73)까지 가야 하고 그러면 입력 필드 테두리가 과해집니다. 아웃라인 버튼·입력의 식별은 라벨과 채운 면이 함께 맡는다고 보고(1.4.11) 값을 유지하되, 숫자를 숨기지 않고 매 빌드 보고하게 두었습니다.</p>` : ""}
${ctxs.map((c) => { const rs = t.filter((r) => r.ctx === c); const nf = rs.filter((r) => !r.pass).length;
  return `<details class="ct"><summary>${c} — ${rs.length}쌍${nf ? ` · advisory ${nf}` : ""}</summary>${tbl(["전경", "바탕", "최소", "실측", "용도"], rs.map((r) => [
    `<code>${r.fg}</code>`, `<code>${r.bg}</code>`, String(r.min), `<b class="${r.pass ? "ct-ok" : "ct-no"}">${r.r}</b>`, r.note || "",
  ]), "tbl compact")}</details>`; }).join("")}`;
  };
  const semMatrix = (cols, rows) => `<div class="sem-matrix" style="--cols:${cols.length}">
<div class="sm-head"><span></span>${cols.map(([, t, req]) => `<span><b>${t}</b><i>${req || "—"}</i></span>`).join("")}</div>
${rows.map(([label, pre, note]) => `<div class="sm-row"><span class="sm-label"><b>${label}</b>${note ? `<i>${note}</i>` : ""}</span>${cols.map(([k, t, , alpha]) => {
    const tok = `--${pre}-${k}`;
    return `<button type="button" class="val-cell${alpha ? " checker" : ""}" data-token="${tok}" data-label="${attr(label + " / " + t)}" aria-haspopup="dialog" title="${attr(tok)} 값 보기"><div class="bar"><i style="background:var(${tok})"></i></div></button>`;
  }).join("")}</div>`).join("")}</div>`;
  /* 칸 수는 인라인 style 로 주면 반응형 규칙이 이길 수 없다 → 커스텀 속성으로 넘긴다.
     repeat() 의 반복 횟수는 정수여야 해 CSS 에서 min() 을 못 쓰므로, 모바일 상한(7·5)도 여기서 계산한다(Common 2칸이 7칸으로 찢어지지 않게) */
  const pal = (title, steps, pre, note) => `<div class="pal"><h3>${title}${note ? ` <small style="font-weight:400;color:var(--text-tertiary);font-size:12px">${note}</small>` : ""}</h3><div class="scale" style="--cols:${steps.length};--cols-sm:${Math.min(steps.length, 7)};--cols-xs:${Math.min(steps.length, 5)}">${steps.map(s => sw(`--${pre}-${s}`, s, title)).join("")}</div></div>`;
  const tabset = (tabs, panes) => `<div class="doc-tabset"><div class="doc-tabs" role="tablist">${tabs.map(([k, t], i) => `<button type="button" role="tab" data-doctab="${k}" class="${i ? "" : "on"}" aria-selected="${i ? "false" : "true"}">${t}</button>`).join("")}</div>${tabs.map(([k], i) => `<div data-docpane="${k}"${i ? " hidden" : ""}>${panes[i]}</div>`).join("")}</div>`;
  const tbl = (head, rows, cls = "") => `<div class="tablewrap"><table class="${cls}"><thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;

  return {
    /* ================= Overview ================= */
    "foundations/overview": () => `<h1>Foundations</h1><p class="lead">모든 디자인 요소의 기반이 되는 가장 원자적인 단위입니다. 컬러, 타이포그래피, 간격·그리드, 아이콘, 엘리베이션처럼 시각 언어의 최소 단위로 구성되며, 컴포넌트는 이 단위(토큰)만 참조합니다.</p>
<div class="fnd-hero" aria-hidden="true"><div style="background:conic-gradient(var(--accent-surface) 0 25%,var(--brand-surface) 0 50%,var(--success-surface) 0 75%,var(--neutral-200) 0)"></div><div style="background:var(--surface-raised);box-shadow:var(--shadow-md);font-size:44px;letter-spacing:-.03em">Aa</div><div style="background:repeating-linear-gradient(90deg,var(--accent-fill) 0 12px,transparent 12px 22px);border:1px solid var(--line-subtle)"></div><div style="background:var(--surface-raised);border:1px solid var(--line-subtle);color:var(--accent-surface)">${I("shield", 48)}</div><div style="background:var(--surface-raised);box-shadow:var(--shadow-xl)"><i style="display:block;width:48px;height:48px;border-radius:var(--radius-lg);background:var(--surface-raised);box-shadow:var(--shadow-md)"></i></div></div>
<h2 id="base">Base material</h2>
<div class="base-list">${[["colors", "Colors", "색상의 시각적 일관성을 유지하고 효율적인 디자인 작업을 돕습니다."], ["typography", "Typography", "화면의 텍스트를 읽기 쉽고 아름답게 표현하도록 돕습니다."], ["grid", "Grid", "일관된 간격 체계를 사용하여 조화로운 비율과 정렬을 만들어냅니다."], ["icons", "Icons", "아이콘을 사용하여 인터페이스를 빠르게 이해하고 탐색할 수 있도록 돕습니다."], ["elevation", "Elevation", "컴포넌트 간의 명확한 깊이감과 시각적 계층을 만들어냅니다."]].map(([k, t, d]) => `<a href="#/foundations/${k}"><b>${t}${nb("foundations", k)}</b><span>${d}</span>${I("chevron-right", 18)}</a>`).join("")}</div>
<p>색을 어느 축에 쓰는지는 <a href="#/foundations/brand-role-map">Brand role map</a>, 토큰 원본(CSS 변수 전체 · Radius · Motion · Accessibility)은 <a href="#/resources/design-token">Resources › Design Token</a> 에 있습니다.</p>`,

    /* ================= Brand role map ================= */
    "foundations/brand-role-map": () => `<h1>Brand role map</h1><p class="lead">색은 네 축으로만 씁니다. 어느 축을 어디에 쓰고 어디에 쓰지 않는지를 한 장으로 정리했습니다. 단계 값과 토큰 이름은 <a href="#/foundations/colors">Colors</a> 에 있습니다.</p>
<h2 id="roles">브랜드 역할 맵</h2><p>색은 네 축으로만 씁니다. <b>제품 Primary</b> 는 행동과 선택, <b>Status</b> 는 처리 결과, <b>Severity</b> 는 보안 위협 등급, <b>Brand</b> 는 회사 정체성 표기입니다. 한 요소에 두 축을 겹치지 않고, 어느 축이든 색만으로 의미를 전달하지 않습니다. 이 시스템은 관리자 웹 제품 기준이라 Brand 는 제품 UI 의 Accent 가 아닙니다.</p>
${tbl(["축", "토큰", "쓰는 곳", "쓰지 않는 곳"], [
  ["<b>제품 Primary</b>", "<code>--accent-*</code>", "주요 행동 버튼(화면당 하나), 링크, 활성·선택 상태(탭 · 내비게이션 · 체크 · 스위치), 포커스 링", "위험도나 처리 결과 표현, 넓은 면의 장식 배경, 로고"],
  ["<b>Status</b>", "<code>--danger-*</code> <code>--warning-*</code> <code>--success-*</code> <code>--info-*</code>", "성공·실패·검토 대기 알림(토스트 · 배너 · 인라인 메시지), 입력 검증 오류, 파괴적 행동 버튼(<code>danger</code>)", "탐색·선택 상태, 브랜드 강조"],
  ["<b>Severity</b>", "같은 Status 토큰 + <code>--danger-strong-*</code> · <code>--muted-*</code>", "위협·이벤트 등급 태그, 점·밴드, 표 행 강조, 대시보드 KPI. <b>항상 라벨(Critical 등)을 병기</b> — 색은 Status 와 공유하므로 라벨이 유일한 구분 수단입니다", "버튼·링크, 일반 처리 결과(성공/실패), 색만 있는 점·배경, <b>한 칸에 Status 와 함께</b>"],
  ["<b>Brand</b>", "<code>--brand-surface</code> <code>--brand-fill</code>", "로고 · 헤더 마크, 로그인 · 온보딩의 회사 정체성 표기", "제품 UI 의 Accent · CTA · 위험도 · 상태. 헤더 Accent 선택지에 없음 — 브랜드 디자인 시스템은 별도 제작"],
  ["<b>중립(테마)</b>", "<code>--surface-*</code> <code>--text-*</code> <code>--line-*</code> <code>--fill-*</code> <code>--muted-graphic</code>", "화면 바탕, 텍스트, 구분선, 비활성 상태. 정보 밀도가 높은 콘솔의 기본 색", "강조. 회색 톤 차이만으로 상태나 등급을 표현"]
], "roles")}
<div class="dodont">
  <div class="do"><div style="padding:var(--space-6) var(--card-pad) 0;display:flex;gap:12px;align-items:center;flex-wrap:wrap"><button type="button" class="btn md primary">정책 저장</button><button type="button" class="btn md secondary">취소</button><span style="margin-left:auto;display:inline-flex;align-items:center;gap:8px;font-size:14px;font-weight:600"><i style="width:18px;height:18px;border-radius:50%;background:var(--brand-surface);display:inline-block"></i>JS Console</span></div><div class="body"><p>주요 행동은 제품 Primary, 회사 정체성은 헤더 마크에만. 두 색이 같은 화면에 있어도 역할이 겹치지 않습니다.</p></div></div>
  <div class="dont"><div style="padding:var(--space-6) var(--card-pad) 0;display:flex;gap:12px;align-items:center;flex-wrap:wrap"><button type="button" class="btn md primary" style="background:var(--brand-surface)">정책 저장</button><button type="button" class="btn md secondary" style="color:var(--brand-surface);border-color:var(--brand-surface)">취소</button></div><div class="body"><p>브랜드 색을 CTA 나 보조 버튼에 쓰지 않습니다. 제품 컬러가 바뀌어도 브랜드 색은 그대로라 제품 간 구분이 사라지고, 강조 위계도 깨집니다.</p></div></div>
  <div class="do"><div style="padding:var(--space-6) var(--card-pad) 0;display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="tag critical">Critical</span><span class="tag high">High</span><span class="tag medium">Medium</span><span class="tag low">Low</span><span class="tag info">Info</span></div><div class="body"><p>심각도는 Severity 색 + 라벨을 함께 씁니다. 색을 구분하지 못해도 등급을 읽을 수 있고, 다크 테마에서도 의미가 같습니다.</p></div></div>
  <div class="dont"><div style="padding:var(--space-6) var(--card-pad) 0;display:flex;gap:12px;align-items:center;flex-wrap:wrap"><i style="width:12px;height:12px;border-radius:50%;background:var(--danger-strong-graphic);display:inline-block"></i><i style="width:12px;height:12px;border-radius:50%;background:var(--danger-graphic);display:inline-block"></i><i style="width:12px;height:12px;border-radius:50%;background:var(--warning-graphic);display:inline-block"></i><button type="button" class="btn md primary" class="critical">차단</button></div><div class="body"><p>색만 있는 점으로 등급을 전달하거나, 심각도 색을 버튼에 쓰지 않습니다. 파괴적 행동은 Status 의 <code>danger</code> 버튼입니다.</p></div></div>
  <div class="do"><div style="padding:var(--space-6) var(--card-pad) 0;display:flex;flex-direction:column;gap:8px;align-items:stretch"><table class="tbl compact" style="margin:0"><thead><tr><th>이벤트</th><th>심각도</th><th>처리</th></tr></thead><tbody><tr><td>외부 반출 시도</td><td><span class="tag high">High</span></td><td><span class="tag ok">완료</span></td></tr><tr><td>정책 동기화</td><td><span class="tag low">Low</span></td><td><span class="tag high">실패</span></td></tr></tbody></table></div><div class="body"><p>두 축이 같은 행에 나오면 <b>열을 나누고 라벨을 병기</b>합니다. 심각도와 처리 상태가 같은 빨강이어도 어느 축인지 열 제목이 말해 줍니다.</p></div></div>
  <div class="dont"><div style="padding:var(--space-6) var(--card-pad) 0;display:flex;flex-direction:column;gap:8px;align-items:stretch"><table class="tbl compact" style="margin:0"><thead><tr><th>이벤트</th><th>상태</th></tr></thead><tbody><tr><td>외부 반출 시도</td><td><i class="sev-cell"><i class="high"></i></i> <i style="width:8px;height:8px;border-radius:50%;background:var(--danger-graphic);display:inline-block"></i></td></tr><tr><td>정책 동기화</td><td><i class="sev-cell"><i class="low"></i></i> <i style="width:8px;height:8px;border-radius:50%;background:var(--success-graphic);display:inline-block"></i></td></tr></tbody></table></div><div class="body"><p><b>한 칸에 두 축을 겹치지 않습니다.</b> 심각도 막대와 상태 점이 한 칸에 있으면 어느 색이 어느 축인지 알 수 없고, 심각도 High 와 상태 danger 는 <b>같은 빨강</b>입니다. 색을 접은 대가라 라벨 병기가 규칙이 아니라 제약입니다.</p></div></div>
</div>`,

    /* ================= Colors ================= */
    "foundations/colors": () => {
      const semantic = `
<h2 id="grammar">역할 문법 — <code>--{intent}-{role}[-{state}]</code></h2><p>토큰 이름이 공개 API 입니다. 제공 형태가 React 패키지와 HTML+CSS 둘이라, 개발자가 이 페이지에서 본 단어를 그대로 타이핑합니다. 그래서 <b>이름이 역할을 드러냅니다</b> — 어떤 색인지가 아니라 <b>어디에 쓰는 색인지</b>가 이름에 있습니다.</p><p>종전에는 토큰 하나가 역할 셋을 겸했습니다. 그 결과 심각도 토큰이 면·글자·면 위 글자를 겸해 <b>10 조합 중 8이 AA 미달</b>이었고, 제품 Primary 가 면·텍스트·지표를 겸해 패널 위에서 4.08 이었습니다. 역할을 가르는 것이 이 체계의 출발점입니다.</p>${tbl(["역할", "뜻", "대비 기준", "알파"], [["<code>surface</code>", "채운 면 — 버튼·채운 태그·배너", "면 자체는 기준 없음(라벨이 식별을 맡습니다)", "솔리드"], ["<code>fill</code>", "옅은 면 — 태그 바탕·선택 행·알림 배경", "—", "<b>알파</b>"], ["<code>on</code>", "면 위 글자·아이콘", "<b>4.5</b> — 자기 <code>surface</code> 세 상태 전부", "솔리드"], ["<code>text</code>", "옅은 바탕 위 글자·아이콘", "<b>4.5</b> — 세 표면과 자기 <code>fill</code> 전부", "솔리드"], ["<code>line</code>", "보더 · 구분선", "컴포넌트 경계 3 · 장식 구분선 면제", "<b>알파</b>"], ["<code>graphic</code>", "글자 없는 지표 — 바·점·밴드·링", "<b>3</b> — 세 표면 전부", "솔리드"]])}<p><b>상태는 <code>surface</code> 에만 붙습니다</b>(<code>-hover</code> · <code>-pressed</code>). 포커스는 전역 하나(<code>--focus-ring</code>)입니다.</p><p><b>알파는 <code>fill</code> 과 <code>line</code> 에만 씁니다.</b> <code>text</code>·<code>on</code>·<code>surface</code>·<code>graphic</code> 에 알파가 들어가면 같은 토큰이 바탕마다 다르게 측정돼, 어떤 바탕에서는 AA 를 넘기고 다른 바탕에서는 못 넘깁니다 — 종전에 <code>--text-tertiary</code> 가 캔버스 4.74 · 패널 3.97 이었습니다.</p><h3 id="howto">어떻게 고르나</h3><p><b>역할을 먼저</b> 정하고(면인가 글자인가 지표인가) 의도를 고릅니다. 반대 순서로 하면 "제품 파랑"을 글자에 그대로 써서 대비가 깨집니다 — 종전에 가장 자주 난 실수입니다.</p>
${codeBlock("role-css", '/* 역할을 먼저 정하고(면인가 글자인가 지표인가) 의도를 고른다 */\n\n/* 면 + 그 위 글자 — 둘은 항상 짝이다 */\n.btn.primary{\n  background: var(--accent-surface);\n  color:      var(--accent-on);\n}\n.btn.primary:hover { background: var(--accent-surface-hover); }\n.btn.primary:active{ background: var(--accent-surface-pressed); }\n\n/* 옅은 바탕 + 그 위 글자 — 면 토큰을 글자에 쓰지 않는다 */\n.tag.accent{\n  background: var(--accent-fill);   /* 알파 — 어떤 표면 위에서도 같은 깊이 */\n  color:      var(--accent-text);   /* 세 표면과 자기 fill 전부에서 4.5 */\n}\n\n/* 글자가 올라가지 않는 지표 — 3:1 만 넘기면 된다 */\n.progress.danger i{ background: var(--danger-graphic); }\n\n/* 보더 */\n.notice.danger{ border-color: var(--danger-line); }\n\n/* 하지 말 것 */\n.kpi .value{ color: var(--danger-surface); }  /* 면 토큰을 글자에 — 라이트 4.58 */\n.dot{ background: var(--red-500); }           /* 프리미티브 직접 참조 — 빌드가 막는다 */', "css", "CSS 복사")}
${codeBlock("role-tsx", '// 같은 토큰을 같은 규칙으로 씁니다. 클래스 마크업이 같아 스타일시트 하나로 동작합니다.\nimport "@jiran/ds-react/style.css";\nimport { Button, Tag } from "@jiran/ds-react";\n\n<Button variant="primary">정책 저장</Button>   {/* --accent-surface + --accent-on */}\n<Tag tone="accent">Accent</Tag>                {/* --accent-fill    + --accent-text */}\n<Tag tone="critical">Critical</Tag>            {/* 심각도 → danger-strong 매핑 */}', "tsx", "React 복사")}
<p>층은 셋이고 <b>참조 방향이 한쪽</b>입니다 — <b>Primitive</b>(램프) ← <b>Semantic</b>(이 페이지) ← <b>Component</b>. 컴포넌트가 램프를 직접 참조하면 빌드가 실패합니다. 새 색이 필요하면 램프에서 골라 <b>의미 토큰을 하나 늘립니다</b>.</p>
<h2 id="theme">Theme — 의도 없는 색</h2><p>테마 자체를 이루는 색입니다. 의도 접두어가 없습니다 — 제품이 바뀌어도, 상태가 무엇이어도 같습니다. 전부 중립 램프를 참조합니다.</p>
${sem("surface", "Surface", "표면 네 단계입니다. <b>base</b> 는 페이지, <b>raised</b> 는 카드·팝오버·모달, <b>sunken</b> 은 들어간 영역(예제 캔버스·패널), <b>inverse</b> 는 툴팁·토스트입니다. 넷 다 솔리드입니다 — 표면이 반투명하면 그 위의 글자 대비를 한 값으로 보장할 수 없습니다.", [["Base", "--surface-base"], ["Raised", "--surface-raised"], ["Sunken", "--surface-sunken"], ["Inverse", "--surface-inverse"]], { h3: true })}
${sem("text", "Text", "글자와 아이콘입니다. 단계가 <b>명도로 고르게</b> 벌어져야 합니다 — 흰 바탕 L* 7.8 → 23.6 → 39.1 로 낙폭이 15.7 · 15.6 입니다(균형 1.01). 다크는 97.3 → 86.0 → 71.8 로 11.3 · 14.1(1.25)입니다. 대비로만 보면 17.9 / 11.7 / 6.7 인데, <b>대비 비율은 중간 밝기끼리의 거리를 과소평가해서</b> 사다리의 축으로는 맞지 않습니다 — 종전 secondary 는 세 단계가 모두 AA 를 넘기면서도 낙폭이 22.8 · 8.5 라 Secondary 와 Tertiary 가 거의 같은 톤이었고, 쌍 대비 게이트가 그걸 잡지 못했습니다(아래 <a href=\"#/foundations/colors#ladder\">명도 사다리</a>). tertiary 를 중립 500 으로 내리면 sunken 위에서 4.43 으로 떨어져 600 에 둡니다. 다크 tertiary 를 400 으로 내리면 균형은 더 좋지만 중립 태그 바탕 위에서 3.60 으로 AA 미달이라, <b>tertiary 를 고정하고 secondary 를 움직였습니다</b>. disabled 는 1.4.3 면제 대상이고 두 모드가 각각 2.78 · 3.60 으로 짝이 맞습니다 — 한 값을 공유하던 종전에는 다크에서 6.13 이라 비활성으로 보이지 않았습니다.", [["Primary", "--text-primary"], ["Secondary", "--text-secondary"], ["Tertiary", "--text-tertiary"], ["Disabled", "--text-disabled"], ["Inverse", "--text-inverse"]], { h3: true })}
${ctRows(["--text-primary", "--text-secondary", "--text-tertiary", "--text-inverse"])}
${sem("line", "Line", "보더와 구분선입니다. 솔리드 중립 단계입니다 — 종전에는 솔리드 <code>--border-*</code> 와 알파 <code>--line-*</code> 두 체계가 병존했고 값이 거의 같아 구분이 없었습니다. 컴포넌트 경계는 <b>strong</b>, 구분선은 <b>default</b>, 장식은 <b>subtle</b> 입니다.", [["Strong", "--line-strong"], ["Default", "--line-default"], ["Subtle", "--line-subtle"]], { line: true, h3: true })}
${ctRows(["--line-strong"])}
${sem("fill", "Fill", "옅은 면입니다. 중립 500 을 베이스로 한 알파여서 어떤 표면 위에서도 같은 깊이로 얹힙니다 — 그래서 선택 행·트레이·태그 바탕에 씁니다. disabled 도 알파입니다: 솔리드 단계로 두면 다크에서 <code>--surface-sunken</code> 과 같은 값이 돼 비활성 컨트롤이 패널에 묻힙니다(구분 1.00).", [["Weak", "--fill-weak"], ["Base", "--fill-base"], ["Strong", "--fill-strong"], ["Disabled", "--fill-disabled"]], { alpha: true, h3: true })}
${sem("muted", "Muted", "중립을 하나의 의도로 세운 것입니다. 심각도 <b>Info</b> 등급과 비활성 지표가 씁니다. <code>surface</code>·<code>on</code>·<code>graphic</code> 셋만 둡니다 — <code>fill</code> 과 <code>text</code> 는 위 <code>--fill-strong</code>·<code>--text-tertiary</code> 와 값이 같아 따로 선언하면 중복입니다. graphic 은 글자 없는 점·범례 칩이라 3:1 이 필요합니다(종전 중립 400 은 흰 바탕 2.73 으로 미달이었습니다).", [["Surface", "--muted-surface"], ["On", "--muted-on"], ["Graphic", "--muted-graphic"]], { h3: true })}
${ctRows(["--muted-on", "--muted-graphic"])}
${sem("global", "Focus · Static", "포커스 링은 제품 색을 쓰지만 <b>전역 하나</b>입니다 — 컴포넌트마다 다른 링은 키보드 사용자에게 혼선입니다. 캔버스와 3:1 을 넘겨야 하고, 밝은 제품에서는 한 단계 짙게 내려갑니다. Static 은 테마에 상관없이 고정된 색이라 반전 표면 위 글자처럼 테마가 바뀌어도 같아야 하는 자리에만 씁니다.", [["Focus ring", "--focus-ring"], ["White", "--static-white"], ["Black", "--static-black"]], { h3: true })}
${ctRows(["--focus-ring"])}
${sem("material", "Material", "팝업처럼 층위가 생길 때 뒤를 어둡게 덮는 색입니다. 알파라 뒤가 비칩니다 — 체커 바탕으로 표시했습니다.", [["Dimmer", "--dimmer"]], { alpha: true, h3: true })}
<h2 id="intent">Intent — 의도 × 역할</h2><p>의도 여섯과 역할 여덟의 조합입니다. <b>열이 역할</b>이라 같은 역할이 의도를 가로질러 같은 자리에 섭니다 — "면이 필요하면 <code>-surface</code>, 글자면 <code>-text</code>" 가 의도와 무관하게 같은 규칙입니다. 칸을 누르면 Hex·RGBA·토큰 값이 나옵니다.</p><p>열 머리의 숫자는 그 역할이 넘겨야 하는 대비입니다. <code>fill</code> 과 <code>line</code> 은 알파라 체커 바탕으로 표시했습니다.</p>${semMatrix([["surface", "surface", "—"], ["surface-hover", "·hover", "—"], ["surface-pressed", "·pressed", "—"], ["fill", "fill", "—", true], ["on", "on", "4.5"], ["text", "text", "4.5"], ["line", "line", "3", true], ["graphic", "graphic", "3"]], [["Accent", "accent", "제품 메인"], ["Danger", "danger", "Negative · 심각도 High"], ["Danger strong", "danger-strong", "심각도 Critical"], ["Warning", "warning", "Cautionary · 심각도 Medium"], ["Success", "success", "Positive"], ["Info", "info", "Informative · 심각도 Low"]])}<p><code>--accent-text-inverse</code> 는 반전 표면(툴팁·토스트) 위의 제품색 글자입니다 — 다크에서는 그 표면이 밝으므로 램프의 반대쪽 끝을 씁니다. 아래 Inverse 절에 있습니다.</p>${ctRows(["--accent-on", "--accent-text", "--accent-graphic", "--danger-on", "--danger-text", "--danger-graphic", "--danger-strong-on", "--danger-strong-text", "--danger-strong-graphic", "--warning-on", "--warning-text", "--warning-graphic", "--success-on", "--success-text", "--success-graphic", "--info-on", "--info-text", "--info-graphic"])}<p>소비자가 아직 없는 칸이 있습니다 — <code>warning</code>·<code>success</code>·<code>info</code> 의 <code>-hover</code>·<code>-pressed</code>(상태색 버튼 변형이 없습니다), <code>--info-surface</code>·<code>--info-on</code>(채운 Informative 면을 쓰는 컴포넌트가 없습니다), <code>-line</code> 일부. 지우면 문법에 구멍이 생기므로 선언은 남기고, <b>빌드가 그 사실을 알고 있습니다</b>(<code>contrast.pairs.js</code> 의 문법 완결성 목록). 선언만 해 두고 잊은 토큰과 의도적으로 남긴 토큰을 코드가 구분합니다.</p>
${sem("inverse", "Inverse", "테마의 대비가 반대인 요소(툴팁 · 토스트)에 쓰는 색입니다. 다크에서는 이 표면이 <b>밝아지므로</b> 그 위의 제품색 글자는 램프의 반대쪽 끝(800 단계)으로 갑니다 — 다크 기준으로 300 을 쓰면 밝은 표면에 묻힙니다.", [["Surface", "--surface-inverse"], ["Label", "--text-inverse"], ["Accent text", "--accent-text-inverse"]])}
${ctRows(["--text-inverse", "--accent-text-inverse"])}
<h2 id="product">Product color — 제품 슬롯</h2><p>제품 메인 컬러는 값이 아니라 <b>슬롯</b>입니다. HEX 하나를 주면 <code>accentScale()</code> 이 <code>--accent-50~900</code> 열 단계를 만들고, <code>applyAccent()</code> 가 그것을 주입합니다. 나머지 토큰은 전부 공통이라 제품마다 다시 정의할 것이 없습니다. 헤더의 Accent 선택으로 이 페이지 전체를 미리볼 수 있습니다.</p><p>슬롯이라 <b>두 가지 예외 경로</b>가 필요합니다 — 제품 색이 상태색과 겹칠 때, 그리고 제품 색이 밝아서 흰 글자가 뜰 때입니다. 둘 다 <code>applyAccent</code> 가 판정해 루트 속성으로 켭니다.</p>
${codeBlock("prod-tsx", '// HEX 하나면 끝입니다 — 램프 열 단계와 밝은 제품 판정을 함수가 합니다.\nimport { applyAccent } from "@jiran/ds-react";\n\napplyAccent("#00AAB6");\n\n// → --prod-50~900 주입\n// → 밝으면 data-accent-light (면 위 글자가 어두운 쪽으로)\n// → 상태색과 색상환 15도 미만이면 data-accent-neutral (무채색 램프로)', "tsx", "React 복사")}
${codeBlock("prod-html", '<!-- 패키지 없이 쓸 때는 램프를 직접 넣어도 됩니다 — 토큰 이름은 같습니다.\n     전체 열 단계와 accentScale() 원본은 Resources › Design Token 에 있습니다 -->\n<html style="--prod-600:#00AAB6; --prod-700:#00858E; --prod-800:#00636A">\n\n<!-- 동작이 필요하면 app.js 의 applyAccent(hex) 가 같은 일을 합니다 -->', "html", "HTML 복사")}
<div class="products">${PRODUCTS.map(p => `<div class="product"><div class="sw" style="background:${p.hex}">${p.hex}</div><div class="body"><b>${p.name}</b>${p.note}<br><button type="button" data-accent="${p.key}">이 컬러로 미리보기</button></div></div>`).join("")}</div>
<h3 id="neutral">상태색과 겹칠 때 — 중립 전환</h3><p>제품 메인 컬러가 상태색(Negative · Cautionary · Positive · Informative)과 <b>색상환에서 15도 미만</b>으로 가까우면, 채워진 Primary 버튼이 "삭제" 나 "완료" 로 읽힙니다. 한 화면에서 같은 색이 브랜드와 상태 두 가지 뜻으로 읽히는 상태라, 이때는 <b>제품 컬러가 쓰이는 곳을 전부</b> 중립으로 내립니다 — 버튼만이 아니라 링크 · 탭 활성 · 체크박스 · 선택 행 · 포커스 링, 아래 Atomic 의 Accent 램프까지 함께입니다.</p><p>방법은 토큰을 따로 두는 것이 아니라 <b>램프를 갈아끼우는 것</b>입니다. 주입하는 램프(<code>--prod-50~900</code>)에 제품 HEX 로 만든 스케일 대신 무채색 10단계를 넣으면, 이 램프를 참조하는 <code>--accent-surface</code> · <code>--accent-surface-hover</code> · <code>--accent-surface-pressed</code> · <code>--accent-fill</code> · <code>--accent-on</code> · <code>--accent-text-inverse</code> · <code>--focus-ring</code> 가 한꺼번에 따라옵니다. 단계 값은 두 테마 모두 <code>--neutral-*</code> 와 같습니다 — 종전에는 라이트만 slate 를 써서 주변 중립(<code>#989BA2</code>)과 <code>#94A3B8</code> 로 한 톤 어긋났습니다.</p><p>다만 라이트에서 메인은 <code>gray/900</code> 이어야 하므로, 네 토큰의 단계를 조정합니다 — 진한 바탕은 눌렀을 때 밝아지는 쪽이 자연스럽고, 회색 <code>50</code> 은 흰 캔버스에서 선택 행 배경으로 보이지 않습니다. <b>다크는 거울입니다</b> — 어두운 바탕에서는 밝은 쪽이 주인공이어야 해서 메인이 <code>100</code> 이고, 눌릴수록 짙어집니다. 중립 <code>600</code>(<code>#5A5C63</code>)은 다크 캔버스 위에서 대비가 2.0 밖에 안 돼 주인공이 될 수 없습니다. 램프를 갈아끼우는 것 자체는 두 테마에 함께 걸리고, 단계 조정만 테마별로 갈립니다.</p>${tbl(["토큰","기본 단계","중립 전환 · 라이트","중립 전환 · 다크"], [["<code>--accent-surface</code>", "600", "<b>900</b>", "<b>100</b>"], ["<code>--accent-surface-hover</code>", "700", "<b>800</b>", "<b>200</b>"], ["<code>--accent-surface-pressed</code>", "800", "<b>700</b>", "<b>300</b>"], ["<code>--accent-fill</code>", "50", "<b>100</b>", "<b>중립 700</b>"]])}<h3 id="accent-light">밝은 메인 컬러 — 글자색과 상태 방향</h3><p>중립 전환과 같은 성격의 자동 보정이 하나 더 있습니다. 메인 컬러가 밝으면 그 위의 <b>흰 글자가 뜹니다</b> — 아래 제품 A(<code>#00AAB6</code>)는 흰 글자와 <b>2.83:1</b> 로 AA 미달이고, 어두운 글자와는 6.33:1 입니다. 그래서 <code>applyAccent</code> 가 양쪽을 재어 대비가 높은 쪽을 고르고, 밝은 제품이면 <code>&lt;html data-accent-light&gt;</code> 를 켭니다. 상태색과 겹치는 제품은 무채색 램프라 늘 흰 글자여서 이 플래그와 함께 켜지지 않습니다.</p><p>글자색만 바꾸면 끝이 아닙니다. <b>hover · pressed 가 글자 반대쪽으로 가야 합니다.</b> 흰 글자 제품은 짙어지는 쪽(<code>700</code> · <code>800</code>)으로 가면서 글자 대비가 5.2 → 7.6 → 10.8 로 좋아집니다. 그런데 어두운 글자 제품을 같은 방향으로 보내면 6.3 → <b>4.1</b> → <b>2.6</b> 으로 깨집니다. 그래서 밝은 제품은 <b>밝아지는 쪽</b>으로 갑니다 — 라이트는 기준 600 에서 <code>500</code> · <code>400</code>, 다크는 기준 500 에서 <code>400</code> · <code>300</code> 입니다(6.3 → 8.1 → 10.9). 방향은 두 테마가 같고 출발점만 한 단계 다릅니다.</p>${tbl(["토큰","흰 글자 제품(기본)","밝은 제품 — data-accent-light"], [["<code>--accent-on</code>", "<code>--static-white</code>", "<b><code>--neutral-950</code> #171719</b>"], ["<code>--accent-surface-hover</code>", "700 — 짙어짐", "<b>500 — 밝아짐</b>"], ["<code>--accent-surface-pressed</code>", "800", "<b>400</b>"]])}<p>대가가 하나 있습니다 — 라이트의 흰 캔버스에서 밝은 제품의 pressed 버튼은 바탕과 <b>1.64:1</b> 까지 연해집니다. 라벨이 10.9:1 로 선명해 버튼을 못 알아볼 일은 없지만, 눌린 순간 면이 흐려 보입니다. 글자 대비(4.5:1)를 먼저 지키는 선택입니다.</p><h3 id="dark-accent">다크에서 제품 컬러와 중립의 경계</h3><p><b>다크는 두 줄로 나뉩니다.</b> 화면의 바탕 — 배경 · 패널 · 서피스 · 텍스트 · 보더 · 라인 · Fill — 은 <b>제품과 무관하게</b> 아래 Atomic 의 <b>Neutral</b> 램프를 씁니다. 제품이 바뀌어도 다크 화면의 톤은 같습니다. 반대로 <b>Primary 신호</b> — 주요 버튼 · 체크박스 · 라디오 · 스위치 · 탭 활성 · 링크 · 포커스 링 · 강조 배너 — 는 <b>제품 메인 컬러</b>를 씁니다.</p><p>그리고 다크는 <b>기준 단계만 한 단계 다릅니다</b> — 라이트 <code>600</code> · 다크 <code>500</code>(위 <a href="#base-step">기준 단계</a>). 글자색(<code>--accent-on</code>)과 밝은 제품 판정은 두 테마가 공유하고, hover · pressed 는 기준에서 글자색 반대 방향으로 갑니다. 그 밖에 다크에서 다른 것은 아래 다섯뿐입니다.</p>${tbl(["토큰","다크 단계","왜 다른가","기본","제품 A 청록"], [["<code>--accent-text</code>", "300", "<code>400</code> 은 파랑 계열에서 패널 위 4.08 로 미달", "#849CE1", "#5CE3ED"], ["<code>--accent-fill</code>", "<b>중립 700</b>", "선택 <b>배경</b>은 배경 계열", "#37383C", "#37383C"], ["<code>--accent-graphic</code>", "400", "글자 없는 지표는 3:1 이 필요", "#5A7CDC", "#1FDFED"], ["<code>--accent-text-inverse</code>", "800", "반전 표면이 다크에서는 밝다", "#112D7D", "#00636A"], ["<code>--focus-ring</code>", "400", "링은 캔버스와 3:1", "#5A7CDC", "#1FDFED"]])}<p>실측 — 다크 Primary 는 기본 5.4:1(흰 글자) · 제품 A 8.1:1(어두운 글자)이고, 패널 위 텍스트는 <code>--accent-text</code> 로 5.0:1 이상, 지표는 <code>--accent-graphic</code> 으로 3.4:1 이상입니다. 버튼의 면 자체는 다크 패널 위에서 기본 파랑이 2.5:1 이지만 라벨이 5.4:1 로 읽혀 식별에는 문제가 없습니다.</p><p><b>제품 색 요건</b> — 메인 컬러는 <b>다크 기준 단계(<code>500</code>)에서 면 위 글자와 4.5:1 이상</b>이어야 합니다. 예시 기본값을 <code>#2563EB</code> 에서 <code>#1D4ED8</code> 로 한 단계 짙게 바꾼 것도 이 때문입니다 — 전자의 <code>500</code> 단계는 흰 글자 4.28 · 어두운 글자 4.18 로 <b>어느 쪽으로도 통과하지 못하는</b> 루미넌스 중간지점이었습니다.</p><p>구조는 두 층입니다. 제품은 램프를 <code>--prod-50~900</code> 으로 주입하고(제품이 넣는 <b>입력</b>), <code>:root</code> 가 <code>var(--prod-600, 기본값)</code> 처럼 받아 테마별로 어느 단계를 쓸지 결정합니다(<b>테마가 해석한 결과</b>). 그래서 테마를 바꾸거나 OS 설정이 바뀌어도 JS 없이 cascade 만으로 즉시 따라옵니다.</p><p><b>선택 배경만 제품과 무관하게 중립입니다.</b> 선택된 표 행 · 메뉴 · 사이드내비 · 카드의 <b>배경</b>이라 배경 계열로 묶어 <code>--neutral-700</code> 에 둡니다 — 제품 램프의 <code>900</code> 을 쓰면 다크 캔버스와 1.05~1.16 이라 선택된 행이 사라집니다. 선택 표시는 그 위의 글자와 보더가 제품 컬러로 담당합니다.</p><p>제품에서는 램프를 <code>--prod-*</code> 로 주입하고, 상태색과 겹치면 <code>&lt;html data-accent-neutral&gt;</code>, 메인 컬러가 밝으면 <code>&lt;html data-accent-light&gt;</code> 를 함께 켭니다 — 주입 함수는 <a href="#/resources/design-token#accent-js">Design Token › Accent 스케일 생성</a> 에 있고, 상태색과 겹치는지 판단하는 부분까지 들어 있습니다. 중립으로 가도 <b>아래 제품 카드의 스와치와 헤더의 색상 선택 점은 제품 컬러를 유지합니다</b> — 그 색의 HEX 를 함께 적어 두는 자리라, 회색으로 칠하면 칩과 적힌 값이 어긋납니다. 카드에서 골라 보면 사이트 전체가 바로 바뀝니다.</p>
<h2 id="status-severity">Status &amp; Severity — 두 축, 같은 색</h2><p>상태(Positive · Cautionary · Negative · Informative)와 위협 심각도(Critical ~ Info)는 <b>다른 축</b>이지만 같은 토큰을 씁니다. 그 선택의 비용과 그래서 생긴 제약이 아래에 있습니다.</p>
<h3 id="base-step">기준 단계 — 라이트 600 · 다크 500</h3><p>제품 Primary 와 네 상태색은 <b>같은 기준 단계</b>를 씁니다 — 라이트는 <code>600</code>, 다크는 한 단계 밝은 <code>500</code> 입니다. 다섯 가족이 같은 단계에 서 있어야 한 화면에서 상태색이 제품색보다 떠 보이지 않습니다.</p><p>나머지 토큰은 기준에서 기계적으로 나옵니다. 핵심은 <b>hover · pressed 가 면 위 글자색의 반대 방향으로 간다</b>는 것입니다 — 흰 글자면 짙은 쪽, 어두운 글자면 밝은 쪽. 반대로 보내면 글자가 깨집니다(어두운 글자를 짙은 쪽으로 보내면 6.3 → 4.1 → 2.6). 다크에서는 네 상태색이 모두 어두운 글자를 쓰므로 상태가 밝은 쪽으로 갑니다.</p>${tbl(["역할","라이트","다크","비고"], [["<code>-surface</code>", "<b>600</b>", "<b>500</b>", "채운 면"], ["<code>-surface-hover</code> · <code>-surface-pressed</code>", "700 · 800", "400 · 300", "흰 글자 기준. 어두운 글자면 반대 방향"], ["<code>-text</code>", "<b>700</b>", "<b>300</b>", "글자 · 아이콘 전용. 기준 단계로는 AA 미달"], ["<code>-graphic</code>", "600", "400", "글자 없는 지표(점·바·링) · 3:1"], ["<code>-fill</code>", "기준색 8% 투명", "기준색 12% 투명", "옅은 면 — 태그 바탕 · 선택 행"], ["<code>-line</code>", "기준색 22% 투명", "기준색 22% 투명", "보더 · 구분선"], ["<code>-on</code>", "대비가 높은 쪽", "대비가 높은 쪽", "면 위 글자"]])}<p><code>-text</code> 를 따로 두는 이유는 실측입니다 — 라이트 <code>600</code> 으로 글자를 쓰면 success 3.77 · warning 3.19 · info 4.10 으로 AA 에 못 미칩니다. 다크는 자기 <code>-fill</code> 위에 올라갈 때가 기준이 됩니다: <code>400</code> 은 danger 가 옅은 면 위에서 4.12 라 <code>300</code> 까지 올려야 통과합니다. <b>면은 <code>-surface</code>, 글자는 <code>-text</code>, 글자 없는 지표는 <code>-graphic</code></b> 으로 나눠 쓰세요.</p><p><code>-on</code> 은 <b>흰색과 <code>--neutral-950</code> 중 대비가 높은 쪽을 재서</b> 고릅니다 — 사람이 가족마다 정하지 않습니다. cyan/600 은 흰 글자 3.42 · 어두운 글자 5.23 이라 <code>--info-on</code> 도 어두운 글자로 성립합니다. 다만 채운 Informative 면을 쓰는 컴포넌트가 아직 없어 소비자는 0 이고, 빌드가 그 사실을 알고 있습니다(<code>contrast.pairs.js</code> 의 문법 완결성 목록).</p>
<h3 id="sev-layers">심각도 — 독립 축이 아니라 상태색 + 등급</h3><p>보안 도메인의 위협 심각도 5단계는 <b>Status 와 다른 축</b>이지만, <b>색은 따로 두지 않습니다</b>. 종전에는 <code>--sev-*</code> 20개가 독립 축이었는데 한 토큰이 면·글자·면 위 글자를 겸해 <b>10 조합 중 8이 AA 미달</b>이었고, 그 20개의 대비 수치는 빌드가 검증하지 않아 계속 낡았습니다. 지금은 등급을 상태색 의도로 매핑하고, 매핑된 토큰은 다른 의미 토큰과 똑같이 게이트가 잽니다.</p>${tbl(["등급","의도","옅은 태그","채운 태그","지표(바·밴드·도넛)"], [["Critical", "<code>danger-strong</code>", "<code>-fill</code> + <code>-text</code>", "<code>-surface</code> + <code>-on</code>", "<code>-graphic</code>"], ["High", "<code>danger</code>", "<code>-fill</code> + <code>-text</code>", "<code>-surface</code> + <code>-on</code>", "<code>-graphic</code>"], ["Medium", "<code>warning</code>", "<code>-fill</code> + <code>-text</code>", "<code>-surface</code> + <code>-on</code>", "<code>-graphic</code>"], ["Low", "<code>info</code>", "<code>-fill</code> + <code>-text</code>", "<code>-surface</code> + <code>-on</code>", "<code>-graphic</code>"], ["Info", "중립 <code>muted</code>", "<code>--fill-strong</code> + <code>--text-tertiary</code>", "<code>--muted-surface</code> + <code>--muted-on</code>", "<code>--muted-graphic</code>"]])}<p><b>마크업은 바뀌지 않습니다</b> — <code>class="tag critical"</code> 과 React <code>tone="critical"</code> 그대로입니다. 매핑은 컴포넌트 CSS 안에 있습니다.</p><p><b>이름이 교차하는 지점에 주의하세요.</b> 심각도 <b>Low</b> 가 <code>info</code> 의도를 쓰고, 심각도 <b>Info</b> 는 중립(<code>muted</code>)입니다. 그래서 <code>.indicator.info</code>(상태 Informative · 청록)와 <code>.tag.info</code>(심각도 Info · 중립)는 같은 클래스 이름으로 다른 색입니다.</p><p><b>이 선택의 비용 둘.</b> 하나 — 상태색과 심각도가 같은 토큰을 쓰므로 <b>두 축이 한 화면에서 구분되지 않습니다</b>("처리 실패"와 "High"가 같은 빨강). 그래서 <a href="#/foundations/brand-role-map">Brand role map</a> 의 "한 요소에 두 축을 겹치지 않는다 · 심각도는 항상 라벨 병기"가 권고가 아니라 <b>제약</b>입니다. 둘 — Critical 과 High 가 같은 빨강이라 옅은 태그에서는 바탕의 짙기가 유일한 단서입니다. 같은 알파로 두면 분리가 라이트 <b>1.04</b> · 다크 <b>1.09</b> 로 지각 가능 바닥(1.1)에도 못 미쳐, <code>danger-strong</code> 은 fill 알파도 강한 쪽(라이트 16% · 다크 20%)으로 잡았습니다 — 라이트 1.23 으로 갈립니다.</p><p><b>다섯 등급이 구분되는지는 빌드가 검사합니다.</b> 대비 비율은 휘도만 보므로 색조 차이를 잡지 못합니다 — Medium(주황 <code>#FF9200</code>)과 Low(청록 <code>#00BDDE</code>)는 휘도가 <b>1.00 으로 같습니다</b>. 그래서 색조 계열표(red · orange · cyan · neutral)를 <code>contrast.pairs.js</code> 에 선언하고, <b>같은 계열이면 ΔL* ≥ 8</b>, 계열이 다르면 값 상이를 요구합니다. Critical↔High 는 라이트 ΔL* 26.7 · 다크 18.0 입니다. 다만 <b>이 다섯 색은 회색조로는 분리할 수 없습니다</b> — 상태색 램프를 공유하는 한 만들 수도 없습니다. 색만으로 의미를 전달하지 않는다(1.4.1)는 전적으로 <b>라벨 병기</b>에 의존하고, 그 라벨이 있는지는 <code>verify.js</code> 가 검사합니다(도넛·밴드의 접근 이름, <code>.sev-cell</code> 의 같은 칸 글자).</p>
<div class="panel left" style="min-height:0;padding:var(--space-6)"><span class="tag critical">Critical</span><span class="tag high">High</span><span class="tag medium">Medium</span><span class="tag low">Low</span><span class="tag info">Info</span></div>
${sem("brand", "Brand", "지란지교시큐리티 브랜드 컬러입니다. 이 시스템은 관리자 웹 제품 기준이라 제품 UI 의 Accent 로 쓰지 않으며, 헤더의 Accent 선택지에도 넣지 않습니다. 로고·헤더 마크 같은 회사 정체성 표기에만 씁니다 — 어느 축에 무엇을 쓰는지는 <a href=\"#/foundations/brand-role-map\">Brand role map</a> 에 있습니다.", [["Surface", "--brand-surface"], ["Fill", "--brand-fill"]])}
<h2 id="ladder">명도 사다리 — 단계가 고르게 벌어졌는가</h2><p>대비 게이트는 <b>"글자가 바탕에서 읽히는가"</b>만 봅니다. 그것과 <b>"단계들이 서로 고르게 벌어졌는가"</b>는 다른 질문입니다 — 세 단계가 모두 AA 를 넘기면서도 둘이 거의 같은 톤일 수 있습니다. 아래는 빌드가 잰 <b>CIE L\*</b> 입니다(대비 비율은 중간 밝기끼리의 거리를 과소평가해서 \u0027낙폭\u0027의 축으로는 맞지 않습니다).</p><p><b>균형은 단계들이 한 화면에 함께 보이는 사다리에만 요구합니다.</b> 본문·보조·설명은 같은 단락에 나란히 서지만, rest → hover → pressed 는 셋이 동시에 보이는 일이 없습니다. 상태 사다리에는 "변화가 느껴지는가"(최소 낙폭)만 묻습니다.</p><p>지금 <b>동시에 보이는 사다리 넷이 모두 기준을 못 넘깁니다</b> — <code>text</code> 는 두 모드 모두 첫 낙폭이 둘째의 2.5배라 Secondary 와 Tertiary 가 거의 같은 톤이고, <code>line</code> 은 3.3~3.8배입니다. 라이트 <code>surface</code> 는 base 와 raised 가 둘 다 흰색이라 명도 분리가 0 이고 경계를 보더·그림자가 전담합니다. 교정은 보고 결정하기로 했으므로 <b>빌드를 막지 않고 매 빌드 보고</b>합니다 — 방향이 뒤집힌 경우만 실패입니다.</p>${ladderView()}
<h2 id="contrast">대비 계약 — 빌드가 재고 빌드가 막는다</h2>
${ctAll()}
${sem("code", "Code panel", "이 사이트의 코드 패널에 쓰는 색입니다. 라이트·다크 모두 어두운 배경이라 한 벌입니다. 구문 강조 네 색(tag · attr · str · kw)을 의미 토큰으로 올린 덕에 소비자 없는 예비 hue 램프 네 개를 전부 지울 수 있었습니다 — 컴포넌트가 램프를 직접 참조하지 않는다는 규칙을 이 자리가 지키고 있습니다.", [["Bg", "--code-bg"], ["Chip", "--code-chip"], ["Chip border", "--code-chip-border"], ["Chip fg", "--code-chip-fg"], ["Head fg", "--code-head-fg"], ["Tag", "--code-tag"], ["Attr", "--code-attr"], ["Str", "--code-str"], ["Kw", "--code-kw"]])}
`;
      const n = [0, 50, 100, 150, 200, 300, 400, 500, 600, 650, 700, 800, 850, 900, 950, 980], t11 = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
      const atomic = `<p>Semantic 토큰이 참조하는 원천 값(Primitive)입니다. 중립과 hue 램프는 참고 시스템(Montage)의 Atomic 값을 쓰고, 단계 번호만 우리 체계(50 밝음 → 950 어두움)로 환산했습니다 — 우리 <code>600</code> 이 그쪽 <code>40</code> 입니다. Pink 와 소비자 없는 예비 램프(Blue·Lime·Violet·Purple)는 싣지 않았습니다 — 구문 강조 네 색은 <code>--code-*</code> 의미 토큰으로 올렸습니다. <b>컴포넌트에서 직접 쓸 수 없습니다</b>(빌드가 샘플 블록의 프리미티브 참조를 실패시킵니다). 새 의미 토큰을 만들 때 여기서 고릅니다. 숫자는 명도 단계(작을수록 밝음)입니다. 제품에 적용할 때는 <code>--accent-*</code> 블록만 제품 컬러로 교체하면 되고, HEX 하나로 스케일을 만드는 <code>accentScale()</code> 과 토큰 원본 CSS 는 <a href="#/resources/design-token">Design Token</a> 에 있습니다.</p>
${pal("Common", ["white", "black"], "static")}
${pal("Neutral", n, "neutral", "라이트·다크 공통 중립 램프 · 표면·텍스트·라인·Fill 이 전부 이 램프를 참조 · 650 은 종전 --text-secondary 의 88% 알파가 합성되던 솔리드 정지점")}
${pal("Brand", [50, 100, 200, 300, 400, 500, 600, 700, 800, 900], "brand", "#FF7F00 = 500")}
${pal("Accent", [50, 100, 200, 300, 400, 500, 600, 700, 800, 900], "accent", "제품 메인 컬러 = 라이트 600 · 다크 500 · HEX 하나로 명도 전개 · 상태색과 겹치면 무채색 · 글자는 라이트 600(밝은 제품 800) · 다크 200 · 지표는 다크에서 400")}
${pal("Red", t11, "red", "Negative · Severity Critical/High")}
${pal("Orange", t11, "orange", "Cautionary · Severity Medium")}
${pal("Green", t11, "green", "Positive")}
${pal("Cyan", t11, "cyan", "Informative · Severity Low")}
`;
      return `<h1>Colors${nb("foundations", "colors")}</h1><p class="lead">컬러 시스템은 시각적 일관성을 유지하고 효율적인 디자인 작업을 돕습니다. Neutral(중립 회색)이 화면의 바탕이고, Primary(제품 메인 컬러)는 핵심 정보를 강조하는 데만 씁니다. 상황에 맞는 색을 이름으로 고를 수 있도록 Semantic 토큰으로 제공하며, 스와치를 클릭하면 Hex · RGBA · 토큰 값을 볼 수 있고, 토큰을 복사할 수 있습니다. 어느 색을 어디에 쓰는지는 <a href="#/foundations/brand-role-map">Brand role map</a> 에 있습니다.</p>
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
      const rows = [["1", "Shadow Normal XSmall", "평면에 가깝지만 미세한 구분이 필요한 경우 (테이블 컨테이너, 입력 필드 hover)"], ["2", "Shadow Normal Small", "페이지 위에 떠 있는 경우 (카드 · 패널 기본 구획 = <code>--shadow-1</code>)"], ["3", "Shadow Normal Medium", "상호작용 상태에서 강조가 필요한 경우 (카드 hover · 드롭다운 · 팝오버 = <code>--shadow-2</code>)"], ["4", "Shadow Normal Large", "일시적으로 주요한 정보를 표시하는 더 높은 레이어 (토스트 · 드로어)"], ["5", "Shadow Normal XLarge", "사용자의 시선을 완전히 집중시켜야 하는 주요 오버레이 (팝업 = <code>--shadow-3</code>)"], ["1", "Shadow Spread Small", "배경과 콘텐츠의 경계 사방에 구분이 필요한 경우 (화면 중앙 카드)"], ["2", "Shadow Spread Medium", "경계 분리와 함께 보다 강조가 필요한 경우 (중앙 정렬 다이얼로그)"]];
      return `<h1>Elevation</h1><p class="lead">Elevation 은 Z축을 기준으로 두 표면 사이의 거리를 나타내는 시각적 체계입니다. 그림자와 배경 명도 차이를 조합하여 UI 컴포넌트 간의 깊이감과 시각적 계층을 만듭니다. 구획은 1px 보더를 겹치는 대신 배경 차이와 아주 부드러운 그림자로 만들어, 밀도가 높은 콘솔 화면에서도 정돈된 구조를 전달합니다.</p>
<h2 id="type">Shadow type</h2>
<div class="elev-types"><div><div class="demo"><i style="box-shadow:var(--shadow-lg)"></i></div><b>Normal</b><span>빛의 위치에 따라 아래쪽으로 그림자가 생기는 일반적인 경우 사용합니다. 카드 · 드롭다운 · 팝업.</span></div><div><div class="demo"><i style="box-shadow:var(--shadow-spread-md)"></i></div><b>Spread</b><span>Dialog 처럼 그림자가 사방으로 고르게 퍼져야 하는 경우 사용합니다. 화면 중앙에 홀로 놓이는 표면.</span></div></div>
${tabset([["normal", "Normal"], ["spread", "Spread"]], [levels(normal, "Normal"), levels(spread, "Spread")])}
<h2 id="composition">Composition</h2><p>더 자연스럽고 현실과 유사한 깊이감을 표현하기 위해 물체 주변으로 은은하게 퍼지는 주변광 그림자(Ambient shadow)와 특정 방향의 조명에 의해 생기는 뚜렷한 직사광 그림자(Key shadow)를 레이어링하여 구성합니다. 값이 두 겹인 이유입니다.</p>
<div class="elev-comp"><div class="box" style="box-shadow:0 8px 24px 0 rgba(15,23,42,.08)"><small>Ambient</small></div><span class="op">+</span><div class="box" style="box-shadow:0 2px 6px 0 rgba(0,0,0,.05)"><small>Key</small></div><span class="op">${I("chevron-right", 20)}</span><div class="box" style="box-shadow:var(--shadow-lg)"><small>Combined = Large</small></div></div>
<h2 id="style">Style</h2>${tbl(["레벨", "명칭", "적용"], rows)}
<p><code>--shadow-1 · 2 · 3</code> 은 각각 Small · Medium · XLarge 의 별칭으로, 기존 컴포넌트 CSS 와 호환됩니다. 배경 음영(Dimmer)은 <a href="#/foundations/colors">Colors › Material</a>, 토큰 원본 CSS 는 <a href="#/resources/design-token">Design Token</a> 을 참고하세요.</p>
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
<h2 id="spacing">Spacing</h2><p>예측 가능한 디자인 규칙과 개발자와의 원활한 소통을 위해 <b>4배수 간격</b>으로 구성합니다. 기준은 4px 이며, 시각 보정이 필요할 때는 2px 단위로 움직이고 불가피할 때만 1px 씩 조정합니다. 카드 내부 padding 24, 카드·요소 사이 gap 20, 섹션 사이 48~64 를 기본으로 넉넉히 잡아 답답한 밀도를 피합니다. 노란색은 4px 그리드를 벗어난 값으로, 시각 보정이 꼭 필요할 때만 씁니다. 토큰 원본 CSS 는 <a href="#/resources/design-token">Design Token</a> 에 있습니다.</p>
<div class="space-bars">${spaces.map(v => { const t = tokenOf[v]; const cls = v === 4 ? "base" : v % 4 ? "off" : ""; return `<div class="${cls}"><b>${v}</b><i style="width:${v}px"></i>${t ? `<small>${t}</small>` : ""}</div>`; }).join("")}</div>
<h2 id="layout">Layout</h2><p>콘텐츠 영역 안은 24px 의 간격(gutter)을 두는 12단 컬럼 그리드를 사용하며, 화면 너비에 맞게 유연하게 대응합니다. 컬럼은 자유롭게 병합하여 사용합니다(KPI 카드 4단 = 3컬럼씩, 폼 2단 = 6컬럼씩).</p>
<h3>Desktop</h3><p>사이드 내비게이션 240px 을 제외한 콘텐츠 영역(최대 1160px)에 12단 컬럼, 좌우 여백 24px, 간격 24px.</p>
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
      return `<h1>Icons${nb("foundations", "icons")}</h1><p class="lead">아이콘은 기능이나 콘텐츠를 시각적으로 표현하는 요소로, 사용자가 인터페이스를 빠르게 탐색할 수 있도록 돕습니다. 24px 그리드 · 스트로크 2px · 라운드 캡의 단순하고 현대적인 형태(Tabler Icons · MIT)를 쓰며, 기본은 Outline 이고 선택·활성 상태 강조에만 Filled 를 씁니다.</p>
<h2 id="search">Search icons</h2><p>관리자 콘솔에서 자주 쓰는 아이콘을 추린 세트입니다. 원본 Tabler 세트 5,130개는 <code>assets/icons/</code> 에 그대로 있습니다. 검색 시 이름뿐 아니라 연상되는 유사한 키워드(한글 포함)를 함께 검색합니다. 아이콘을 클릭하면 이름 · 스타일 · 키워드를 보고 SVG 를 복사·다운로드할 수 있습니다. 사용 코드는 아래 Usage 를 참고하세요.</p>
<div class="icon-tools"><div class="searchbar" role="search">${I("search")}<input type="search" id="iconSearch" placeholder="아이콘을 검색해주세요" aria-label="아이콘 검색"></div><div class="select-btn" role="group" aria-label="아이콘 스타일" id="iconStyle"><button type="button" class="on" aria-pressed="true" data-style="outline">Outline</button><button type="button" aria-pressed="false" data-style="filled">Filled</button></div><span id="iconCount" style="font-size:12px;color:var(--text-tertiary)">${names.length}개</span></div>
<div class="icon-grid" id="iconGrid">${names.map(tile).join("")}</div><div class="icon-empty" id="iconEmpty" hidden>검색 결과가 없습니다. 세트 밖의 아이콘은 <code>assets/icons/</code> 에서 찾아 <code>_build/icons.js</code> 의 <code>ICON_NAMES</code> 에 추가하세요.</div>
<h2 id="usage">Usage</h2><p>인라인 SVG 가 기본입니다(색 상속 <code>currentColor</code>, 크기 자유). 의미 색은 부모에 토큰(<code>color:var(--danger-surface)</code>)으로 줍니다. 사용 크기: 14 배지 · 16 표/페이지네이션 · 18 버튼/입력 · 20 알림 · 24 빈 화면/타일. 정적 파일이 필요하면 <code>assets/icons/outline/{name}.svg</code> 를 img 로, 배경·가상 요소에는 CSS mask 로 씁니다.</p>
${codeBlock("icon-inline", I("search", 18).split("><").join(">\n  <").replace("\n  </svg>", "\n</svg>"), "html")}
${codeBlock("icon-react", `// React: @jiran/ds-react 의 Icon (이 페이지의 ${names.length}개, 사이트와 같은 마크업)\nimport { Icon } from "@jiran/ds-react";\n\n<Icon name="search" size={18} />\n<Icon name="shield" size={24} filled />\n<Icon name="alert-triangle" label="경고" />  // role="img" + aria-label\n\n// 세트 밖의 아이콘: 같은 세트의 공식 패키지\n// npm i @tabler/icons-react → import { IconSearch } from "@tabler/icons-react";`, "tsx")}
${codeBlock("icon-img", `<!-- 정적 파일 (색 상속 불가, 장식용) -->\n<img src="assets/icons/outline/search.svg" width="18" height="18" alt="">\n\n<!-- CSS mask: currentColor 로 색 상속 -->\n.ico-search{width:18px;height:18px;background:currentColor;-webkit-mask:url("assets/icons/outline/search.svg") center/contain no-repeat;mask:url("assets/icons/outline/search.svg") center/contain no-repeat}`, "html")}
<div class="kv"><dt>파일 · 이름</dt><dd><code>assets/icons/{outline|filled}/{name}.svg</code> — Tabler 원본 이름 그대로(kebab-case). Figma 는 Tabler Icons 라이브러리, 컴포넌트 이름 = 파일 이름</dd><dt>사이트 소스</dt><dd><code>I("name", size, { style: "filled" })</code> 헬퍼(<code>_build/icons.js</code>). 새 아이콘은 <code>ICON_NAMES</code> 에 추가하면 빌드 시 인라인되고 이 갤러리와 React <code>Icon</code> 에 함께 나타납니다</dd></div>
${valPop()}`;
    },

    /* ================= Typography ================= */
    "foundations/typography": () => {
      const ramp = [["Display 1", "t-display-1", 40, 52, "-0.0282em", 700], ["Display 2", "t-display-2", 32, 44, "-0.0253em", 700], ["Heading 1", "t-heading-1", 28, 38, "-0.0236em", 700], ["Heading 2", "t-heading-2", 24, 32, "-0.023em", 700], ["Heading 3", "t-heading-3", 20, 28, "-0.012em", 700], ["Heading 4", "t-heading-4", 18, 26, "-0.002em", 700], ["Title 1", "t-title-1", 16, 24, "0.0057em", 500], ["Title 2", "t-title-2", 14, 20, "0.0145em", 500], ["Body 1", "t-body-1", 16, 26, "0.0057em", 400], ["Body 2", "t-body-2", 14, 22, "0.0145em", 400], ["Label 1", "t-label-1", 14, 20, "0.0145em", 500], ["Label 2", "t-label-2", 12, 16, "0.0252em", 500], ["Caption 1", "t-caption-1", 12, 18, "0.0252em", 400], ["Caption 2", "t-caption-2", 10, 14, "0.0311em", 400]];
      const wname = { 700: "Bold", 500: "Medium", 400: "Regular" };
      return `<h1>Typography</h1><p class="lead">타이포그래피는 텍스트를 읽기 쉽고 아름답게 표현하는 시각적 체계로, 폰트 선택 · 크기 · 굵기 · 행간 · 자간을 조합하여 정보의 위계와 가독성을 만들어냅니다. 서체 하나(Pretendard)로 타이틀 · 본문 · 숫자 · 캡션의 크기와 굵기 차이를 분명히 두어 위계를 만들고, 각 단계는 <code>.t-*</code> 유틸리티 클래스로 제공합니다.</p>
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
