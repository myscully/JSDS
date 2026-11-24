/* =========================================================
   templates.build.js — Templates 화면 여덟 생성기(2026-11-18, 옛 _templates/build.mjs 를 옮김)
   build.js 가 부른다 → ../templates/screen/{login,dashboard,analytics,list,policy,wizard,tabs-list,org}.html (생성물)
   문서 페이지(templates/<key>.html)는 render.js 의 tplDocPage 가 사이트 셸 안에 그리고, 이 화면을 줄인 iframe 으로 싣는다.

   - 컴포넌트 · 패턴 마크업은 두 데이터 파일을 브라우저처럼 한 전역(vm 컨텍스트)에서 돌려 예제 문자열과 최상위 헬퍼
     (treeHtml · stepLi · pCombo · pSel · dpField …)를 그대로 쓴다 — 컴포넌트 마크업이 바뀌면 다시 빌드만 하면 된다.
   - 화면 틀(Top Navigation + Navigation + 본문)은 여기서 만든다. 상단 메뉴는 두지 않는다(Navigation 규칙 — 상단 메뉴와 중복 금지).
   - 배치는 templates.src.css(→ assets/templates.css), 제품이 할 일을 흉내 낸 동작은 templates.src.js(→ assets/templates.js).
   - 화면끼리의 링크는 같은 폴더의 형제 파일(dashboard.html …). 검토 도구 막대와 고르는 화면은 옮기지 않았다(사람의 결정 2026-11-18).
   ========================================================= */
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const B = __dirname;
const { I } = require(path.join(B, "icons.js"));
const LIB = require(path.join(B, "lib.js"));

/* 화면 일곱의 HTML 문자열 — build.js 가 문서 페이지의 코드 보기에도 쓴다(2026-11-19) */
function screens() {
/* 두 데이터 파일을 한 전역에서 — 최상위 const 헬퍼를 꺼내 쓴다 */
const ctx = vm.createContext({ I, console });
for (const f of ["components.data.js", "patterns.data.js"]) vm.runInContext(fs.readFileSync(path.join(B, f), "utf8"), ctx, { filename: f });
const H = vm.runInContext("({ COMPONENTS, PATTERNS, treeHtml, stepLi, stepsOl, stepPanel, stepActs, dpField, pCombo, pSel, pBreadcrumb, pNotice, pAvatars, pCopyInline, pClose })", ctx);
const ex = (src, key, id) => {
  const e = (src === "c" ? H.COMPONENTS : H.PATTERNS)[key].examples.find((x) => x.id === id);
  if (!e) throw new Error(`예제 없음: ${key}/${id}`);
  return e.html.trim();
};

/* ---------- 공통 ---------- */
const NAV = [
  { id: "dashboard", icon: "layout-dashboard", label: "대시보드" },
  { id: "analytics", icon: "chart-bar", label: "탐지 분석" },
  { group: "탐지" },
  { id: "list", icon: "alert-triangle", label: "보안 이벤트", count: 12 },
  { group: "정책" },
  { id: "policy-list", icon: "shield", label: "정책", sub: [{ id: "policy", label: "정책 설정" }, { id: "wizard", label: "정책 배포" }] },
  { group: "자산" },
  { id: "tabs-list", icon: "device-desktop", label: "에이전트" },
  { group: "조직" },
  { id: "org", icon: "sitemap", label: "조직도" },
  { group: "관리" },
  { id: "settings", icon: "settings", label: "설정" },
];
const PAGES = ["dashboard", "analytics", "list", "policy", "wizard", "tabs-list", "org", "settings"];
const href = (id) => (PAGES.includes(id) ? `${id}.html` : "#");
const cur = (id, page) => (id === page ? ' class="on" aria-current="page"' : "");

/* 사이드 내비 하나(2026-11-18) — 상단 바의 접기 버튼(ds.js [data-sidenav-toggle])이 .collapsed 를 붙였다 뗀다. 항목은 접혀도 이름이 남게 늘 이름 + Tooltip.
   하위 항목 · 묶음 이름 · 건수 · 아래 글은 접힌 레일에서 숨고, 하위가 현재면 부모가 선택 모양(.has-on)을 잇는다 */
const sideNav = (page) => `<nav class="sidenav tpl-nav" id="tpl-nav" aria-label="주 메뉴">
      ${NAV.map((n) => {
        if (n.group) return `<div class="group">${n.group}</div>`;
        const subOn = n.sub && n.sub.some((s) => s.id === page);
        const to = n.sub ? n.sub[0].id : n.id, attr = n.sub ? (subOn ? ' class="has-on"' : "") : cur(n.id, page);
        const top = `<span class="tooltip-wrap"><a href="${href(to)}"${attr} aria-label="${n.label}">${I(n.icon)}<span>${n.label}</span>${n.count ? `<span class="count">${n.count}</span>` : ""}</a><span class="tooltip right" role="tooltip">${n.label}</span></span>`;
        return top + (n.sub ? n.sub.map((s) => `<a href="${href(s.id)}" class="sub${s.id === page ? " on" : ""}"${s.id === page ? ' aria-current="page"' : ""}>${s.label}</a>`).join("") : "");
      }).join("\n      ")}
      <div class="foot">v2.4.1 · 라이선스 정상</div>
    </nav>`;

/* 알림 센터 — 컴포넌트 예제를 닫힌 상태로(패널 hidden · aria-expanded false) */
const notify = (() => {
  const h = ex("c", "notification-center", "default");
  const s = h.indexOf('<div class="notify">'), e = h.lastIndexOf("</div>");
  return h.slice(s, e).trim().replace('aria-expanded="true"', 'aria-expanded="false"').replace(/aria-controls="nc1"/, 'aria-controls="tpl-nc"')
    .replace('id="nc1" role="dialog" aria-labelledby="nc1-t"', 'id="tpl-nc" role="dialog" aria-labelledby="tpl-nc-t" hidden').replace('id="nc1-t"', 'id="tpl-nc-t"');
})();

/* 상단 바(2026-11-18) — 왼쪽 영역 240(로고 + 접기) · 검색 40 · 알림(점) · 설정 · 라이트/다크 · 사용자. 컴포넌트 Top Navigation 'With Navigation' 과 같은 짜임 */
const topBar = () => `<header class="topbar tpl-top">
    <div class="topbar-start"><a href="dashboard.html" class="logo"><i>${I("shield-check",24,{style:"filled"})}</i>Security Console</a><span class="tooltip-wrap"><button type="button" class="btn md assistive icon-only" data-sidenav-toggle aria-controls="tpl-nav" aria-expanded="true" aria-label="메뉴 접기">${I("layout-sidebar")}</button><span class="tooltip bottom" role="tooltip">메뉴 접기</span></span></div>
    <div class="searchbar" role="search" data-hotkey>${I("search")}<input type="search" placeholder="이벤트, 대상, IP 검색" aria-label="전역 검색"><kbd>/</kbd></div>
    <div class="right">
      <div class="btn-group">${notify}
      <span class="tooltip-wrap"><button type="button" class="btn md assistive icon-only" aria-label="설정">${I("settings")}</button><span class="tooltip bottom" role="tooltip">설정</span></span>
      <span class="tooltip-wrap"><button type="button" class="btn md assistive icon-only" data-theme-toggle aria-pressed="false" aria-label="다크 모드"><span class="i-light">${I("sun-high")}</span><span class="i-dark">${I("moon")}</span></button><span class="tooltip bottom" role="tooltip">다크 모드</span></span></div>
      <span class="divider vertical" role="separator" aria-orientation="vertical"></span>
      <div class="dropdown"><button type="button" class="topbar-user" aria-label="사용자 메뉴" aria-haspopup="menu" aria-expanded="false"><span class="avatar">김</span></button><ul class="menu" role="menu"><li role="none"><a class="menu-item" role="menuitem" href="settings.html">내 정보</a></li><li class="menu-item" role="menuitem">비밀번호 변경</li><li class="menu-sep" role="separator"></li><li role="none"><a class="menu-item" role="menuitem" href="login.html">로그아웃</a></li></ul></div>
    </div>
  </header>`;

const doc = ({ id, title, body, chart, date, bodyClass = "tpl" }) => (`<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · Templates · 지란지교시큐리티 Design System</title>
<script>try{var t=localStorage.getItem("jsds-theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>
<link rel="stylesheet" href="../../assets/style.css">
<link rel="stylesheet" href="../../assets/font-jp.css">
<link rel="stylesheet" href="../../assets/templates.css">
<script src="../../assets/app.js" defer></script>
<script src="../../assets/ds.js" defer></script>${chart ? `
<script src="../../assets/vendor/chart.umd.js" defer></script>
<script src="../../assets/ds-chart.js" defer></script>` : ""}${date ? `
<script src="../../assets/vendor/dayjs.min.js" defer></script>
<script src="../../assets/vendor/dayjs.utc.js" defer></script>
<script src="../../assets/vendor/dayjs.timezone.js" defer></script>` : ""}
<script src="../../assets/templates.js" defer></script>
</head>
<body class="${bodyClass}" data-tpl="${id}" data-root="../../">
${body}
</body>
</html>
`);

/* 제목 단계(2026-11-20) — 화면 하나에 h1 하나, 그 아래 카드 · 대화상자 제목은 h2. 문서 예제는 문서의 h1 아래라 Page Header 를 h2 로,
   카드 제목을 h3 로 적어 두었다 — 화면에서는 한 단계씩 올린다 */
const levels = (c) => {
  if (!/<h1\b/.test(c)) c = c.replace(/<h2 class="title">([\s\S]*?)<\/h2>/, '<h1 class="title">$1</h1>');
  return c.replace(/<h3 class="(chart-title|title|popup-title|side-panel-title)"([^>]*)>([\s\S]*?)<\/h3>/g, '<h2 class="$1"$2>$3</h2>');
};
const shell = (page, content, dialogs = "") => (content = levels(content), dialogs = dialogs && levels(dialogs), `<div class="tpl-app">
  <a class="skip-link" href="#main">본문 바로가기</a>
  ${topBar()}
  <div class="tpl-body">
    ${sideNav(page)}
    <main id="main" class="tpl-main" tabindex="-1">
      <div class="tpl-content">
${content}
      </div>
    </main>
  </div>
</div>${dialogs ? `\n<div class="tpl-dialogs" hidden>\n${dialogs}\n</div>` : ""}`);

const pageHead = (crumbs, title, sub, actions) => `<div class="page-head">
          ${crumbs ? H.pBreadcrumb(crumbs) : ""}
          <div><h1 class="title">${title}</h1>${sub ? `<p class="sub">${sub}</p>` : ""}</div>${actions ? `<div class="actions">${(actions.match(/class="btn\b/g) || []).length > 1 ? `<div class="btn-group">${actions}</div>` : actions}</div>` : ""}
        </div>`;
const btn = (cls, label, attrs = "", icon = "") => `<button type="button" class="btn ${cls}"${attrs ? " " + attrs : ""}>${icon ? I(icon, 18) : ""}${label}</button>`;
const pager = (total, range) => `<div class="pagination-bar"><span>총 <b>${total}</b>건 · ${range}</span><nav class="pagination compact" aria-label="페이지"><button type="button" aria-label="이전" disabled>${I("chevron-left", 16)}</button><button type="button" class="on" aria-current="page">1</button><button type="button">2</button><button type="button">3</button><button type="button" aria-label="다음">${I("chevron-right", 16)}</button></nav></div>`;
const search = (id, ph, label) => `<div class="searchbar" role="search">${I("search")}<input type="search" id="${id}" placeholder="${ph}" aria-label="${label}"></div>`;

/* ---------- 1. 로그인 — 내비 없이(사람의 결정) ---------- */
/* 패턴 예제는 .auth-screen > form + .auth-copy — 화면 하나에 두 폼과 저작권 줄 하나로 다시 묶는다(2026-11-18) */
const formOf = (h) => h.match(/<form[\s\S]*<\/form>/)[0];
const copyOf = (h) => h.match(/<p class="auth-copy">[\s\S]*?<\/p>/)[0];
const login = () => {
  const raw = ex("p", "sign-in", "sign-in");
  const signIn = formOf(raw)
    .replace(/\s*<div class="notice danger"[\s\S]*?<\/div><\/div>/, "")   // 기본 상태 — 오류 알림 없이
    .replace(' value="admin@jiran.com"', "")
    .replace('<form class="form auth"', '<form class="form auth" id="tpl-login"')
    .replace('<h2 class="sr-only">관리 콘솔 로그인</h2>', '<h1 class="sr-only">관리 콘솔 로그인</h1>');   // 화면 제목은 숨기고 접근 이름으로(2026-11-18)
  const twoStep = formOf(ex("p", "sign-in", "two-step"))
    .replace('<form class="form auth"', '<form class="form auth" id="tpl-otp" hidden')
    .replace('<h2 class="auth-title t-title-3">2단계 인증</h2>', '<h1 class="auth-title t-title-3">2단계 인증</h1>');
  return doc({ id: "login", title: "로그인", bodyClass: "tpl tpl-auth", body: `<main id="main" class="auth-screen tpl-auth-main">
  ${signIn}
  ${twoStep}
  ${copyOf(raw)}
</main>` });
};

/* ---------- 2. 대시보드 — 패턴 예제 그대로 ---------- */
const dashboard = () => doc({ id: "dashboard", title: "대시보드", chart: true, body: shell("dashboard", ex("p", "dashboard", "full")) });

/* ---------- 2-1. 분석 — 분석 · 리포트 패턴 기본 예제 그대로(2026-11-20) ---------- */
const analytics = () => doc({ id: "analytics", title: "탐지 분석", chart: true, body: shell("analytics", ex("p", "analytics", "default")) });

/* ---------- 3. 리스트 — 보안 이벤트 ---------- */
const EVENTS = [
  ["09:41:12", "critical", "Critical", "랜섬웨어 행위 탐지", "PC-2041 · 김민준", "랜섬웨어 행위 차단", "danger", "차단", true],
  ["09:36:47", "high", "High", "알려진 악성코드 차단", "PC-1187 · 이서연", "알려진 악성코드 차단", "danger", "차단"],
  ["09:12:03", "high", "High", "의심 스크립트 실행", "PC-2041 · 김민준", "스크립트 실행 제한", "warn", "검토 필요", true],
  ["08:58:21", "medium", "Medium", "승인되지 않은 USB 연결", "PC-0932 · 박지훈", "외부 USB 차단", "danger", "차단"],
  ["08:40:09", "critical", "Critical", "권한 상승 시도", "SRV-DB-01", "랜섬웨어 행위 차단", "warn", "검토 필요"],
  ["08:21:55", "low", "Low", "허용 목록 밖 원격 접속", "SRV-WEB-02", "원격 접속 허용 목록", "ok", "허용"],
  ["08:03:40", "medium", "Medium", "대량 파일 암호화 시도", "PC-1544 · 최유진", "랜섬웨어 행위 차단", "danger", "차단"],
  ["07:47:18", "info", "Info", "정책 동기화 지연", "PC-0711 · 정다은", "정책 동기화", "info", "알림"],
];
const rowMenu = (name) => `<div class="dropdown"><button type="button" class="btn sm assistive icon-only" aria-label="${name} 더 보기" aria-haspopup="menu" aria-expanded="false">${I("dots")}</button><ul class="menu" role="menu"><li class="menu-item" role="menuitem">${I("file-search", 16)}상세 보기</li><li class="menu-item" role="menuitem">${I("user-check", 16)}담당자 지정</li><li class="menu-item" role="menuitem">${I("ban", 16)}예외로 등록</li></ul></div>`;
const list = () => {
  const selected = EVENTS.filter((r) => r[8]).length;
  const content = `        <div class="stack">
        ${pageHead(["탐지", "보안 이벤트"], "보안 이벤트", "최근 7일 · 마지막 갱신 09:41", btn("md outline assistive", "CSV 내보내기", "", "download"))}
          <div class="toolbar">
            ${search("ev-q", "이벤트, 단말, IP 검색", "이벤트 검색")}
            ${H.pCombo({ id: "ev-sev", label: "심각도", items: ["Critical", "High", "Medium", "Low", "Info"], selected: ["Critical", "High"], multiple: true, placeholder: "심각도" })}
            <div class="datepicker field" data-range data-max="today" data-presets="7 30" data-default-preset="7"><div class="affix"><input id="ev-range" value="2026. 11. 12 ~ 2026. 11. 18" placeholder="YYYY. MM. DD ~ YYYY. MM. DD" inputmode="numeric" autocomplete="off" aria-label="조회 기간"><button type="button" class="cal-btn" aria-label="달력 열기" aria-haspopup="dialog" aria-expanded="false">${I("calendar")}</button></div></div>
          </div>
          <div class="toolbar sub">
            <span>결과 <b>128</b>건</span>
            <div class="chip-group"><span class="chip sm"><span class="lbl">상태: 차단</span><button type="button" class="x" aria-label="상태: 차단 제거">${I("x", 10)}</button></span></div>
            <button type="button" class="btn sm text assistive">필터 초기화</button>
          </div>
          <div class="tbl-wrap">
            <div class="action-bar"><b>${selected}개 선택</b><span class="spacer"></span><div class="btn-group">${btn("sm outline assistive", "처리 완료")}${btn("sm outline assistive", "담당자 지정")}${btn("sm outline assistive", "예외로 등록")}</div></div>
            <table class="tbl hover nowrap">
              <thead><tr><th class="check"><label class="checkbox"><input type="checkbox" class="mixed" aria-label="전체 선택"></label></th><th class="sortable sorted desc" aria-sort="descending"><button type="button" class="sort">시간</button></th><th>심각도</th><th>이벤트</th><th>대상</th><th>탐지 정책</th><th>상태</th><th class="actions"><span class="sr-only">동작</span></th></tr></thead>
              <tbody>
                ${EVENTS.map(([t, tone, sev, ev, target, pol, st, stl, on]) => `<tr${on ? ' class="on"' : ""}><td class="check"><label class="checkbox"><input type="checkbox"${on ? " checked" : ""} aria-label="${t} ${ev} 선택"></label></td><td>2026. 11. 18 ${t}</td><td><span class="tag ${tone}">${sev}</span></td><td><a href="#" class="link">${ev}</a></td><td>${target}</td><td>${pol}</td><td><span class="indicator ${st}">${stl}</span></td><td class="actions">${rowMenu(`${t} ${ev}`)}</td></tr>`).join("\n                ")}
              </tbody>
            </table>
          </div>
          ${pager(128, "1–20")}
        </div>`;
  return doc({ id: "list", title: "보안 이벤트", date: true, body: shell("list", content) });
};

/* ---------- 4. 정책 설정 — 패턴 예제 두 개(설정 섹션 + 적용 대상 Side Panel) ---------- */
const policy = () => {
  const sections = ex("p", "policy-settings", "sections");
  const targets = ex("p", "policy-settings", "targets").replace('<section class="side-panel"', '<section class="side-panel" hidden');
  return doc({ id: "policy", title: "정책 설정", body: shell("policy", `        ${sections}\n        ${targets}`) });
};

/* ---------- 5. 위저드 — 정책 배포(Steps 마법사) ---------- */
const wizard = () => {
  const legend = '<p class="form-legend"><em>*</em> 필수 항목</p>';
  const radio = (name, legend, opts, { cls = "", req = false } = {}) => `<div class="field"><fieldset class="radio-group${cls ? " " + cls : ""}"${req ? " data-required" : ""}><legend class="t-label-1-normal t-semibold">${legend}${req ? " <em>*</em>" : ""}</legend>${opts.map(([label, small, on]) => `<label class="radio${small ? " card" : ""}"><input type="radio" name="${name}"${on ? " checked" : ""}><span>${label}${small ? `<small>${small}</small>` : ""}</span></label>`).join("")}</fieldset><span class="help" aria-live="polite"></span></div>`;
  const step1 = `<form class="form" data-validate novalidate>${legend}
              ${H.pCombo({ id: "wz-groups", label: "배포 대상 그룹", items: ["전체", "보안팀", "개발팀", "영업팀", "경영지원팀", "부산 지사", "대전 지사"], multiple: true, placeholder: "그룹 검색", field: true, req: true, name: "groups", help: "", live: true })}
              ${radio("wz-scope", "배포 범위", [["모든 단말", "", true], ["지금 온라인인 단말만", ""]])}
            </form>`;
  const step2 = `<form class="form" data-validate novalidate>${legend}
              ${radio("wz-policy", "배포할 정책", [["외부 USB 차단", "승인하지 않은 저장장치 연결을 막습니다"], ["랜섬웨어 행위 차단", "대량 암호화와 의심 프로세스를 막습니다"], ["스크립트 실행 제한", "서명되지 않은 스크립트 실행을 막습니다"]], { cls: "row", req: true })}
            </form>`;
  const step3 = `<form class="form" data-validate novalidate>${legend}
              ${radio("wz-when", "배포 시점", [["지금 배포", "", false], ["예약 배포", "", true]], { cls: "row" })}
              ${H.dpField({ id: "wz-at", label: "배포 시각", time: true, value: "2026. 11. 20 02:00", attrs: 'data-min="today"', help: "업무 시간이 아닌 때를 권장합니다" })}
              <div class="field"><label class="switch"><input type="checkbox" role="switch" checked aria-describedby="wz-retry-help"><span>실패하면 다시 시도</span></label><span class="help" id="wz-retry-help">응답하지 않은 단말에 1시간 뒤 한 번 더 보냅니다</span></div>
            </form>`;
  const step4 = `<div class="stack">
              ${H.pNotice("info", "배포 전에 확인하세요", "배포하면 대상 단말의 기존 USB 정책을 덮어씁니다.")}
              <div class="card"><div class="card-head"><h3 class="title">배포 내용</h3></div><dl class="card-meta"><dt>정책</dt><dd>외부 USB 차단</dd><dt>대상</dt><dd>보안팀 · 개발팀 · 135대</dd><dt>시점</dt><dd>2026. 11. 20 02:00 예약</dd><dt>다시 시도</dt><dd>1시간 뒤 한 번</dd></dl></div>
            </div>`;
  const content = `        <div class="stack">
        ${pageHead(["정책", "정책 배포"], "정책 배포", "대상과 정책, 일정을 차례로 정한 뒤 배포합니다", "")}
          <div class="stepper" data-async>
            ${H.stepsOl("", [H.stepLi("대상 선택", 0, "on"), H.stepLi("정책 선택", 1), H.stepLi("일정", 2), H.stepLi("검토 · 배포", 3)])}
            ${H.stepPanel(true, step1)}
            ${H.stepPanel(false, step2)}
            ${H.stepPanel(false, step3)}
            ${H.stepPanel(false, step4)}
            ${H.stepActs(true, false, "정책 배포")}
          </div>
        </div>`;
  return doc({ id: "wizard", title: "정책 배포", date: true, body: shell("wizard", content) });
};

/* ---------- 6. 탭이 있는 리스트 — 에이전트 ---------- */
const AGENTS = [
  ["PC-2041", "김민준", "보안팀", "10.20.4.41", "6.2.1", "ok", "온라인", "09:41"],
  ["PC-1187", "이서연", "개발팀", "10.20.4.33", "6.2.1", "ok", "온라인", "09:40"],
  ["PC-0932", "박지훈", "영업팀", "10.20.7.10", "6.1.8", "warn", "업데이트 필요", "09:38"],
  ["SRV-DB-01", "—", "서버", "10.20.1.12", "6.1.8", "warn", "업데이트 필요", "09:12"],
  ["PC-1544", "최유진", "경영지원팀", "10.20.5.18", "6.2.1", "", "오프라인", "어제 18:20"],
  ["PC-0711", "정다은", "기술지원팀", "10.30.2.7", "6.2.0", "", "오프라인", "11. 16 09:02"],
  ["SRV-WEB-02", "—", "서버", "10.20.1.21", "6.2.1", "ok", "온라인", "09:41"],
  ["PC-1820", "한지우", "개발팀", "10.20.4.58", "6.2.1", "ok", "온라인", "09:39"],
];
const TABS = [
  { id: "all", label: "전체", count: "1,284", rows: () => AGENTS },
  { id: "online", label: "온라인", count: "1,248", rows: () => AGENTS.filter((a) => a[5] !== "") },
  { id: "offline", label: "오프라인", count: "36", rows: () => AGENTS.filter((a) => a[5] === "") },
  { id: "update", label: "업데이트 필요", count: "12", rows: () => AGENTS.filter((a) => a[5] === "warn") },
];
const tabsList = () => {
  const groups = [["", "전체 그룹"], ["sec", "보안팀"], ["dev", "개발팀"], ["sales", "영업팀"], ["ops", "경영지원팀"], ["server", "서버"]];
  const panel = (t, i) => `<div class="tab-panel" role="tabpanel" id="ag-panel-${t.id}" aria-labelledby="ag-tab-${t.id}"${i ? " hidden" : ""}>
            <div class="stack">
              <div class="toolbar">
                ${search(`ag-q-${t.id}`, "단말 이름, 사용자, IP 검색", "에이전트 검색")}
                <span class="sr-only" id="ag-g-${t.id}-l">그룹</span>${H.pSel({ id: `ag-g-${t.id}`, opts: groups, value: "", labelledby: `ag-g-${t.id}-l` })}
              </div>
              <div class="tbl-wrap">
                <table class="tbl hover nowrap">
                  <thead><tr><th class="sortable"><button type="button" class="sort">단말</button></th><th>사용자</th><th>그룹</th><th>IP</th><th>에이전트</th><th>상태</th><th class="sortable sorted desc" aria-sort="descending"><button type="button" class="sort">마지막 접속</button></th></tr></thead>
                  <tbody>
                    ${t.rows().map(([n, u, g, ip, v, st, stl, last]) => `<tr><td><a href="#" class="link">${n}</a></td><td>${u}</td><td>${g}</td><td>${ip}</td><td>${v}</td><td><span class="indicator${st ? " " + st : ""}">${stl}</span></td><td>${last}</td></tr>`).join("\n                    ")}
                  </tbody>
                </table>
              </div>
              ${pager(t.count, "1–20")}
            </div>
          </div>`;
  const content = `        <div class="stack">
        ${pageHead(["자산", "에이전트"], "에이전트", "전체 1,284대 · 마지막 동기화 09:41", btn("md outline assistive", "설치 명령 보기") + btn("md solid primary", "에이전트 등록", "", "plus"))}
          <div class="tabs accent" role="tablist" aria-label="에이전트 상태">
            ${TABS.map((t, i) => `<button type="button" class="tab${i ? "" : " on"}" role="tab" aria-selected="${!i}" id="ag-tab-${t.id}" aria-controls="ag-panel-${t.id}"${i ? ' tabindex="-1"' : ""}>${t.label}</button>`).join("\n            ")}
          </div>
          ${TABS.map(panel).join("\n          ")}
        </div>`;
  return doc({ id: "tabs-list", title: "에이전트", body: shell("tabs-list", content) });
};

/* ---------- 7. 조직도 설정 ---------- */
const ORG = [
  { label: "본사", value: "hq", icon: "building", meta: 128, open: true, children: [
    { label: "보안팀", value: "sec", icon: "users", meta: 24, open: true, children: [{ label: "관제 파트", value: "sec-mon", icon: "users", meta: 12, selected: true }, { label: "대응 파트", value: "sec-res", icon: "users", meta: 12 }] },
    { label: "개발팀", value: "dev", icon: "users", meta: 56, children: [{ label: "플랫폼 파트", value: "dev-plat", icon: "users", meta: 30 }, { label: "앱 파트", value: "dev-app", icon: "users", meta: 26 }] },
    { label: "경영지원팀", value: "ops", icon: "users", meta: 48 },
  ] },
  { label: "부산 지사", value: "busan", icon: "building", meta: 31, children: [{ label: "영업팀", value: "busan-sales", icon: "users", meta: 19 }, { label: "기술지원팀", value: "busan-tech", icon: "users", meta: 12 }] },
  { label: "대전 지사", value: "daejeon", icon: "building", meta: 28, children: [{ label: "연구팀", value: "dj-rnd", icon: "users", meta: 16 }, { label: "운영팀", value: "dj-ops", icon: "users", meta: 12 }] },
];
/* 부서마다 정보 · 구성원(검토용 정적 데이터 — templates.js 가 고른 부서로 오른쪽을 바꾼다) */
const NAMES = ["김민준", "이서연", "박지훈", "최유진", "정다은", "한지우", "오세훈", "윤하늘", "강민서", "조은비", "임도윤", "서지아", "신우진", "배수아", "황준호"];
const TITLES = ["파트장", "책임", "선임", "선임", "주임"];
const ROLES = [["보안 관리자", "accent"], ["운영자", ""], ["운영자", ""], ["감사자", ""], ["운영자", ""]];
const orgInfo = (() => {
  const out = {}; let seed = 0;
  const walk = (items, trail) => items.forEach((it) => {
    const members = Array.from({ length: Math.min(5, it.meta) }, (_, i) => {
      const n = NAMES[(seed + i * 4) % NAMES.length];
      return { name: n, title: TITLES[i], email: `user${(seed * 7 + i * 13) % 900 + 100}@jiran.com`, role: ROLES[i], on: (seed + i) % 6 !== 5 };
    });
    /* 삭제 확인에 지워지는 범위를 개수로(Writing 용어 표 '삭제') — 하위 부서는 모든 아래 단계를 센다 */
    const subs = (function n(c) { return (c || []).reduce((a, x) => a + 1 + n(x.children), 0); })(it.children);
    const scope = (subs ? `하위 부서 ${subs}개와 ` : "") + `구성원 ${it.meta}명`;
    out[it.value] = { name: it.label, path: trail.length ? trail.join(" › ") : "최상위", lead: members[0].name, count: it.meta, code: `ORG-${it.value.toUpperCase()}`, scope, members };
    seed += 3;
    if (it.children) walk(it.children, [...trail, it.label]);
  });
  walk(ORG, []);
  return out;
})();
const memberRows = (d) => d.members.map((m) => `<tr><td><span class="tpl-person"><span class="avatar sm" aria-hidden="true">${m.name[0]}</span>${m.name}</span></td><td>${m.title}</td><td>${m.email}</td><td><span class="tag sm${m.role[1] ? " " + m.role[1] : ""}">${m.role[0]}</span></td><td><span class="indicator${m.on ? " ok" : ""}">${m.on ? "재직" : "휴직"}</span></td></tr>`).join("\n                  ");
const org = () => {
  const d = orgInfo["sec-mon"];
  const parents = [["hq", "본사"], ["sec", "보안팀"], ["dev", "개발팀"], ["busan", "부산 지사"], ["daejeon", "대전 지사"]];
  const moveTree = H.treeHtml([
    { label: "본사", value: "hq", icon: "building", open: true, children: [{ label: "보안팀", value: "sec", icon: "users", selected: true }, { label: "개발팀", value: "dev", icon: "users" }, { label: "경영지원팀", value: "ops", icon: "users" }] },
    { label: "부산 지사", value: "busan", icon: "building" },
    { label: "대전 지사", value: "daejeon", icon: "building" },
  ], { id: "mv", label: "옮길 상위 부서" });
  const content = `        <div class="stack">
        ${pageHead(["조직", "조직도"], "조직도", "본사 외 2개 지사 · 구성원 187명", btn("md outline assistive", "구성원 가져오기", "", "upload") + btn("md solid primary", "부서 추가", 'data-popup-open="#org-add"', "plus"))}
          <div class="tpl-split">
            <div class="card tpl-org-tree">
              <div class="tree-view">
                <div class="searchbar sm" role="search">${I("search")}<input type="search" placeholder="부서 이름" aria-label="부서 검색"></div>
                ${H.treeHtml(ORG, { id: "org", label: "조직도" })}
              </div>
            </div>
            <div class="stack">
              <div class="card" id="org-dept">
                <div class="card-head"><h3 class="title" data-org="name">${d.name}</h3><div class="btn-group">${btn("sm outline assistive", "이름 바꾸기", 'data-popup-open="#org-rename"')}${btn("sm outline assistive", "이동", 'data-popup-open="#org-move"')}${btn("sm outline assistive", "삭제", 'data-popup-open="#org-delete"')}</div></div>
                <dl class="card-meta"><dt>상위 부서</dt><dd data-org="path">${d.path}</dd><dt>책임자</dt><dd data-org="lead">${d.lead}</dd><dt>구성원</dt><dd><span data-org="count">${d.count}</span>명</dd><dt>부서 코드</dt><dd>${H.pCopyInline("부서 코드", d.code).replace('<span class="value">', '<span class="value" data-org="code">')}</dd></dl>
              </div>
              <div class="card flush">
                <div class="card-head"><h3 class="title">구성원</h3>${btn("sm outline assistive", "구성원 추가", "", "user-plus")}</div>
                <div class="tbl-wrap">
                  <table class="tbl nowrap">
                    <thead><tr><th>이름</th><th>직책</th><th>이메일</th><th>역할</th><th>상태</th></tr></thead>
                    <tbody data-org="members">
                  ${memberRows(d)}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
<script type="application/json" id="tpl-org-data">${JSON.stringify(Object.fromEntries(Object.entries(orgInfo).map(([k, v]) => [k, { ...v, rows: memberRows(v) }])))}</script>`;
  const field = (id, label, value, help = "") => `<div class="field"><label for="${id}">${label} <em>*</em></label><input id="${id}"${value ? ` value="${value}"` : ""} required data-messages='{"required":"부서 이름을 입력하세요."}'><span class="help" aria-live="polite">${help}</span></div>`;
  const dialogs = `<div class="popup" id="org-add" role="dialog" aria-modal="true" aria-labelledby="org-add-t">
  <h3 class="popup-title" id="org-add-t">부서 추가</h3>${H.pClose("popup-close", "data-popup-close")}
  <form class="popup-form" id="org-add-form" data-validate novalidate data-done="부서를 추가했습니다.">${field("org-add-name", "부서 이름", "", "2~30자")}${H.pSel({ id: "org-add-parent", label: "상위 부서", opts: parents, value: "sec" })}</form>
  <div class="popup-actions"><div class="btn-group"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="submit" form="org-add-form" class="btn md solid primary">추가</button></div></div>
</div>
<div class="popup" id="org-rename" role="dialog" aria-modal="true" aria-labelledby="org-rename-t">
  <h3 class="popup-title" id="org-rename-t">부서 이름 바꾸기</h3>${H.pClose("popup-close", "data-popup-close")}
  <form class="popup-form" id="org-rename-form" data-validate novalidate data-done="부서 이름을 바꿨습니다.">${field("org-rename-name", "부서 이름", d.name, "2~30자")}</form>
  <div class="popup-actions"><div class="btn-group"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="submit" form="org-rename-form" class="btn md solid primary">바꾸기</button></div></div>
</div>
<div class="popup" id="org-move" role="dialog" aria-modal="true" aria-labelledby="org-move-t">
  <h3 class="popup-title" id="org-move-t">부서 이동</h3>${H.pClose("popup-close", "data-popup-close")}
  <p class="popup-body"><b data-org="name">${d.name}</b> 부서를 옮길 상위 부서를 고르세요. 구성원과 하위 부서도 함께 옮겨집니다.</p>
  <div class="tpl-move-tree">${moveTree}</div>
  <div class="popup-actions"><div class="btn-group"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="button" class="btn md solid primary" data-done="부서를 옮겼습니다.">이동</button></div></div>
</div>
<div class="popup danger" id="org-delete" role="alertdialog" aria-modal="true" aria-labelledby="org-delete-t" aria-describedby="org-delete-b">
  <h3 class="popup-title" id="org-delete-t"><span data-org="name">${d.name}</span> 부서를 삭제할까요?</h3>${H.pClose("popup-close", "data-popup-close")}
  <p class="popup-body" id="org-delete-b"><span data-org="scope">${d.scope}</span>이 상위 부서로 옮겨집니다. 삭제한 부서는 되돌릴 수 없습니다.</p>
  <div class="popup-actions"><div class="btn-group"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="button" class="btn md solid negative" data-done="부서를 삭제했습니다.">삭제</button></div></div>
</div>`;
  return doc({ id: "org", title: "조직도", body: shell("org", content, dialogs) });
};

/* 설정 › 내 정보(2026-11-24) — 왼쪽 설정 메뉴(Navigation, 아이콘 없음 · 맨 아래 구분선 뒤 위험 항목), 오른쪽 카드 셋.
   카드마다 편집은 모달 Side Panel 의 검증 폼, 계정 삭제는 이메일을 입력받는 위험 확인(사람의 결정) */
const ME = { name: "김민준", title: "보안 관리자", email: "minjun.kim@example.com", phone: "010-2345-6789", bio: "엔드포인트 보안 정책과 탐지 규칙을 관리합니다. 야간 장애 대응 순번을 맡고 있습니다.", org: "본사", dept: "보안팀 · 보안관제파트", country: "대한민국", city: "서울" };
const settings = () => {
  const menu = ["내 정보", "비밀번호와 보안", "알림", "팀", "팀 구성원", "라이선스", "데이터 내보내기"];
  const edit = (what, id) => btn("sm outline assistive", "편집", `aria-label="${what} 편집" data-panel-open="#${id}"`, "edit");
  const meta = (rows) => `<dl class="card-meta columns">${rows.map(([k, v, w]) => `<div${w ? ' class="wide"' : ""}><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>`;
  const content = `        <div class="stack">
        ${pageHead(["설정"], "내 정보", "", "")}
          <div class="tpl-settings">
            <nav class="sidenav tpl-subnav" aria-label="설정 메뉴">
              ${menu.map((m, i) => `<a href="#"${i ? "" : ' class="on" aria-current="page"'}><span>${m}</span></a>`).join("\n              ")}
              <hr class="divider">
              <a href="#" class="danger" data-popup-open="#set-delete"><span>계정 삭제</span></a>
            </nav>
            <div class="stack">
              <div class="card tpl-profile">
                <span class="avatar lg" aria-hidden="true">${ME.name[0]}</span>
                <div><h2 class="t-heading-2">${ME.name}</h2><p class="t-label-1-reading">${ME.title}</p><p class="t-label-1-reading">${ME.city}, ${ME.country}</p></div>
                ${edit("프로필", "set-profile")}
              </div>
              <div class="card">
                <div class="card-head"><h3 class="title">개인 정보</h3>${edit("개인 정보", "set-info")}</div>
                ${meta([["이름", ME.name], ["직함", ME.title], ["이메일", ME.email], ["휴대전화", ME.phone], ["소개", ME.bio, 1]])}
              </div>
              <div class="card">
                <div class="card-head"><h3 class="title">소속과 지역</h3>${edit("소속과 지역", "set-place")}</div>
                ${meta([["조직", ME.org], ["부서", ME.dept], ["국가", ME.country], ["도시", ME.city]])}
              </div>
            </div>
          </div>
        </div>`;
  const field = (id, label, value, o = {}) => `<div class="field"><label for="${id}">${label}${o.req ? " <em>*</em>" : ""}</label>${o.area ? `<textarea id="${id}" rows="4" data-maxlength="200">${value}</textarea>` : `<input id="${id}"${o.type ? ` type="${o.type}"` : ""} value="${value}"${o.req ? " required" : ""}${o.ac ? ` autocomplete="${o.ac}"` : ""}>`}<span class="help" aria-live="polite">${o.help || ""}</span></div>`;
  const panel = (id, title, done, fields) => `<section class="side-panel" id="${id}" role="dialog" aria-modal="true" aria-labelledby="${id}-t" data-modal hidden>
  <div class="side-panel-header"><h3 class="side-panel-title" id="${id}-t">${title}</h3>${H.pClose("side-panel-close", "data-panel-close")}</div>
  <div class="side-panel-body"><form class="tpl-panel-form" id="${id}-form" data-validate novalidate data-done="${done}">${fields}</form></div>
  <div class="side-panel-footer"><div class="btn-group"><button type="button" class="btn md outline assistive" data-panel-close>취소</button><button type="submit" form="${id}-form" class="btn md solid primary">저장</button></div></div>
</section>`;
  const dialogs = [
    panel("set-profile", "프로필 편집", "프로필을 저장했습니다.", field("set-p-name", "이름", ME.name, { req: 1, ac: "name" }) + field("set-p-title", "직함", ME.title, { ac: "organization-title" })),
    panel("set-info", "개인 정보 편집", "개인 정보를 저장했습니다.", field("set-i-email", "이메일", ME.email, { req: 1, type: "email", ac: "email", help: "로그인과 알림에 씁니다." }) + field("set-i-phone", "휴대전화", ME.phone, { type: "tel", ac: "tel" }) + field("set-i-bio", "소개", ME.bio, { area: 1, help: "200자까지" })),
    panel("set-place", "소속과 지역 편집", "소속과 지역을 저장했습니다.", field("set-l-dept", "부서", ME.dept) + field("set-l-country", "국가", ME.country, { ac: "country-name" }) + field("set-l-city", "도시", ME.city, { ac: "address-level2" })),
    `<div class="popup danger" id="set-delete" role="alertdialog" aria-modal="true" aria-labelledby="set-delete-t" aria-describedby="set-delete-b">
  <h3 class="popup-title" id="set-delete-t">계정을 삭제할까요?</h3>${H.pClose("popup-close", "data-popup-close")}
  <p class="popup-body" id="set-delete-b">계정과 개인 설정, 알림 구독이 모두 삭제됩니다. 맡고 있던 정책과 보고서는 조직 관리자에게 넘어갑니다. 삭제한 계정은 되돌릴 수 없습니다.</p>
  <form class="popup-form" id="set-delete-form" data-validate novalidate data-done="계정 삭제를 요청했습니다."><div class="field"><label for="set-delete-email">확인을 위해 <b>${ME.email}</b>을 입력하세요</label><input id="set-delete-email" type="email" required pattern="\\s*${ME.email.replace(/\./g, "\\.")}\\s*" autocomplete="off" data-messages='{"required":"확인할 이메일을 입력하세요.","pattern":"이메일이 계정 이메일과 다릅니다. 위에 적힌 이메일을 그대로 입력하세요."}'><span class="help" aria-live="polite">이메일이 같아야 삭제됩니다.</span></div></form>
  <div class="popup-actions"><div class="btn-group"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="submit" form="set-delete-form" class="btn md solid negative">계정 삭제</button></div></div>
</div>`,
  ].join("\n");
  return doc({ id: "settings", title: "설정", body: shell("settings", content, dialogs) });
};


const SCREENS = { login, dashboard, analytics, list, policy, wizard, "tabs-list": tabsList, org, settings };
return Object.fromEntries(Object.entries(SCREENS).map(([name, fn]) => [name, fn()]));
}

/* 화면 파일을 쓴다 — html 을 넘기면 다시 만들지 않는다(문서 페이지의 코드와 같은 글자) */
function build(OUT, html = screens()) {
  const dir = path.join(OUT, "templates", "screen");
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, text] of Object.entries(html)) fs.writeFileSync(path.join(dir, `${name}.html`), text);
  return Object.keys(html);
}

module.exports = { build, screens, SCREEN_KEYS: ["login", "dashboard", "analytics", "list", "policy", "wizard", "tabs-list", "org", "settings"] };
