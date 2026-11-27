/* =========================================================
   gen.js — Mail Security Console 데모 3페이지 생성기
   node _demo/mail-security/gen.js  →  login.html · dashboard.html · spam.html
   컴포넌트 모양 · 동작은 ../../assets/style.css · ds.js 가 맡는다. 아이콘은 시스템 아이콘(_build/icons.js 의 I()).
   제품 색 = 제품1(빨강 #C30D2A). app.js 를 싣지 않으므로 --prod-* 를 <html> 에 직접 적는다
   (app.js accentScale("#C30D2A") 이 만드는 값 그대로).
   ========================================================= */
const fs = require("fs");
const path = require("path");
const { I } = require("../../_build/icons.js");

const OUT = __dirname;
const PRODUCT = "Mail Security Console";
const RED = "--prod-40:#980A21;--prod-45:#B00C26;--prod-50:#C30D2A;--prod-55:#DB0F2F;--prod-60:#F34B65";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const json = (o) => JSON.stringify(o).replace(/'/g, "&#39;");

function head(title, { chart = false, auth = false, cls = "" } = {}) {
  return `<!doctype html>
<html lang="ko" data-accent="red" style="${RED}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · ${PRODUCT}</title>
<script>try{var t=localStorage.getItem("msc-theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>
<link rel="stylesheet" href="../../assets/style.css">
<link rel="stylesheet" href="../../assets/font-jp.css">
<link rel="stylesheet" href="../../assets/templates.css">
<link rel="stylesheet" href="demo.css">
<script src="../../assets/ds.js" defer></script>
${chart ? `<script src="../../assets/vendor/chart.umd.js" defer></script>\n<script src="../../assets/ds-chart.js" defer></script>\n` : ""}<script src="demo.js" defer></script>
</head>
<body class="tpl${auth ? " tpl-auth" : ""}${cls ? " " + cls : ""}">
`;
}

const logoMark = I("shield-check", 24, { style: "filled" });

/* ---------- 상단 바 ---------- */
function topbar() {
  const tip = (label, btn) => `<span class="tooltip-wrap">${btn}<span class="tooltip bottom" role="tooltip">${label}</span></span>`;
  const notes = [
    { id: "n1", unread: true, tag: ["critical", "Critical"], text: "피싱 메일 14통을 격리했습니다", sub: "가짜 결제 안내 · 영업팀 외 2개 그룹", time: "10분 전", dt: "2026-11-20T09:40" },
    { id: "n2", unread: true, tag: ["high", "High"], text: "악성 첨부(.iso)가 든 메일을 차단했습니다", sub: "invoice-1120.iso · billing@pay-notice.example", time: "32분 전", dt: "2026-11-20T09:18" },
    { id: "n3", unread: true, text: "격리함 보관 기간이 3일 남은 메일이 86통입니다", sub: "격리함", time: "1시간 전", dt: "2026-11-20T08:50" },
  ];
  const item = (n) => `<li class="notify-item${n.unread ? " unread" : ""}" data-id="${n.id}"><a class="notify-link" href="#"><span class="notify-dot" aria-hidden="true"></span><span class="notify-main"><span class="notify-text">${n.tag ? `<span class="tag sm ${n.tag[0]}">${n.tag[1]}</span>` : ""}${n.text}</span><span class="notify-sub">${n.sub}</span></span><time class="notify-time" datetime="${n.dt}">${n.time}</time><span class="sr-only">${n.unread ? ", 안 읽음" : ""}</span></a></li>`;
  const unread = notes.filter((n) => n.unread).length;
  return `  <a class="skip-link" href="#main">본문 바로가기</a>
  <header class="topbar tpl-top">
    <div class="topbar-start"><a href="dashboard.html" class="logo"><i>${logoMark}</i>${PRODUCT}</a>${tip("메뉴 접기", `<button type="button" class="btn md assistive icon-only" data-sidenav-toggle aria-controls="msc-nav" aria-expanded="true" aria-label="메뉴 접기">${I("layout-sidebar", 20)}</button>`)}</div>
    <div class="searchbar" role="search" data-hotkey>${I("search", 18)}<input type="search" placeholder="메일 제목, 발신자, 수신자 검색" aria-label="전역 검색"><kbd>/</kbd></div>
    <div class="right">
      <div class="btn-group"><div class="notify">
            <span class="with-count">${tip(`알림 ${unread}건`, `<button type="button" class="btn md assistive icon-only" aria-label="알림 ${unread}건" aria-haspopup="dialog" aria-expanded="false" aria-controls="msc-nc">${I("bell", 20)}</button>`)}<span class="count dot" aria-hidden="true"></span></span>
            <section class="notify-panel" id="msc-nc" role="dialog" aria-labelledby="msc-nc-t" hidden tabindex="-1">
              <div class="notify-head"><h2 class="notify-title" id="msc-nc-t">알림</h2><button type="button" class="btn sm text assistive notify-read-all">모두 읽음</button></div>
              <div class="tabs sm" role="tablist" aria-label="알림 보기"><button type="button" class="tab on" role="tab" aria-selected="true" data-filter="all">전체</button><button type="button" class="tab" role="tab" aria-selected="false" tabindex="-1" data-filter="unread">안 읽음 <span class="count">${unread}</span></button></div>
              <div class="tab-panel notify-body" role="tabpanel" data-static><section class="notify-group" aria-label="오늘"><h3 class="notify-day">오늘</h3><ul class="notify-list">${notes.map(item).join("")}</ul></section><p class="notify-empty" hidden>알림이 없습니다.</p></div>
            </section>
          </div>
      ${tip("설정", `<button type="button" class="btn md assistive icon-only" aria-label="설정">${I("settings", 20)}</button>`)}
      ${tip("다크 모드", `<button type="button" class="btn md assistive icon-only" data-theme-toggle aria-pressed="false" aria-label="다크 모드"><span class="i-light">${I("sun-high", 20)}</span><span class="i-dark">${I("moon", 20)}</span></button>`)}</div>
      <span class="divider vertical" role="separator" aria-orientation="vertical"></span>
      <div class="dropdown"><button type="button" class="topbar-user" aria-label="사용자 메뉴" aria-haspopup="menu" aria-expanded="false"><span class="avatar" data-name="이메일">이</span></button><ul class="menu" role="menu"><li class="menu-item" role="menuitem">내 정보</li><li class="menu-item" role="menuitem">비밀번호 변경</li><li class="menu-sep" role="separator"></li><li role="none"><a class="menu-item" role="menuitem" href="login.html">로그아웃</a></li></ul></div>
    </div>
  </header>`;
}

/* ---------- 사이드 내비 ---------- */
function sidenav(cur) {
  const link = (key, href, icon, label, count) => `<span class="tooltip-wrap"><a href="${href}"${key === cur ? ' class="on" aria-current="page"' : ""} aria-label="${label}">${I(icon, 20)}<span>${label}</span>${count ? `<span class="count">${count}</span>` : ""}</a><span class="tooltip right" role="tooltip">${label}</span></span>`;
  return `    <nav class="sidenav tpl-nav" id="msc-nav" aria-label="주 메뉴">
      ${link("dashboard", "dashboard.html", "layout-dashboard", "대시보드")}
      <div class="group">메일 보안</div>
      ${link("spam", "spam.html", "mail", "스팸메일", "128")}
      ${link("quarantine", "#", "archive", "격리함")}
      ${link("threat", "#", "shield-x", "피싱 · 악성 메일")}
      <div class="group">정책</div>
      ${link("filter", "#", "filter", "필터 정책")}
      ${link("list", "#", "ban", "허용 · 차단 목록")}
      <div class="group">관리</div>
      ${link("report", "#", "report", "보고서")}
      ${link("settings", "#", "settings", "설정")}
      <div class="foot">v3.2.0 · 라이선스 정상</div>
    </nav>`;
}

function shell(cur, title, body, opts) {
  return head(title, opts) + `<div class="tpl-app">
${topbar()}
  <div class="tpl-body">
${sidenav(cur)}
    <main id="main" class="tpl-main" tabindex="-1">
      <div class="tpl-content">
        <div class="stack">
${body}
        </div>
      </div>
    </main>
  </div>
</div>
</body>
</html>
`;
}

/* =========================================================
   1. 로그인
   ========================================================= */
function login() {
  const logo = `<p class="auth-logo" role="img" aria-label="${PRODUCT}"><i>${I("shield-check", 48, { style: "filled" })}</i><span aria-hidden="true">${PRODUCT}</span></p>`;
  const cells = [1, 2, 3, 4, 5, 6].map((n) => n === 1
    ? `<input id="si-otp-1" class="code-cell" type="text" inputmode="numeric" autocomplete="one-time-code" aria-label="6자리 중 1번째">`
    : `<input class="code-cell" type="text" inputmode="numeric" autocomplete="off" aria-label="6자리 중 ${n}번째" tabindex="-1">`).join("");
  return head("로그인", { auth: true }) + `<main id="main" class="auth-screen tpl-auth-main">
  <form class="form auth" id="msc-login" data-validate novalidate>
    ${logo}
    <h1 class="sr-only">메일 보안 관리 콘솔 로그인</h1>
    <div class="notice danger" id="msc-login-fail" role="alert" hidden><span class="ico">${I("alert-circle", 20, { style: "filled" })}</span><div><b>이메일 또는 비밀번호가 맞지 않습니다</b>5번 틀리면 10분 동안 로그인할 수 없습니다.</div></div>
    <div class="field"><label for="si-email" class="sr-only">이메일</label><div class="affix"><span class="field-icon" aria-hidden="true">${I("user", 18)}</span><input id="si-email" type="email" placeholder="이메일" autocomplete="username" required data-messages='{"required":"이메일을 입력하세요.","type":"이메일 형식으로 입력하세요."}'></div><span class="help" aria-live="polite"></span></div>
    <div class="field"><label for="si-pw" class="sr-only">비밀번호</label><div class="affix"><span class="field-icon" aria-hidden="true">${I("lock", 18)}</span><input id="si-pw" type="password" placeholder="비밀번호" autocomplete="current-password" required data-messages='{"required":"비밀번호를 입력하세요."}'><button type="button" class="reveal" aria-label="비밀번호 표시" aria-pressed="false"><span class="i-show">${I("eye", 18)}</span><span class="i-hide">${I("eye-off", 18)}</span></button></div><span class="help" aria-live="polite"></span></div>
    <div class="auth-row"><label class="checkbox"><input type="checkbox" checked><span>이메일 저장</span></label><a href="#" class="link standalone">비밀번호 찾기</a></div>
    <button type="submit" class="btn lg solid primary">로그인</button>
  </form>
  <form class="form auth" id="msc-otp" hidden data-validate novalidate>
    ${logo}
    <div><h1 class="auth-title t-title-3">2단계 인증</h1><p class="auth-desc">인증 앱에 표시된 6자리 숫자를 입력하세요.</p><p class="auth-account"><b id="msc-otp-account">security@example.com</b><a href="login.html" class="link standalone">다른 계정으로 로그인</a></p></div>
    <div class="field code-field"><label id="si-otp-l" for="si-otp-1">인증 코드</label><div class="code-inputs" role="group" aria-labelledby="si-otp-l" aria-describedby="si-otp-help" data-name="otp" data-required data-messages='{"required":"인증 코드를 입력하세요.","code":"숫자 6자리를 모두 입력하세요."}'><input type="hidden" name="otp" value="">${cells}</div><span class="help" id="si-otp-help" aria-live="polite">코드는 30초마다 바뀝니다.</span></div>
    <label class="checkbox"><input type="checkbox"><span>이 기기에서 30일 동안 묻지 않기</span></label>
    <button type="submit" class="btn lg solid primary">인증하고 로그인</button>
    <a href="#" class="link standalone">다른 방법으로 인증</a>
  </form>
  <p class="auth-copy">© 2026 JIRANSECURITY Co., Ltd. All rights reserved.</p>
</main>
</body>
</html>
`;
}

/* =========================================================
   2. 대시보드
   ========================================================= */
function dashboard() {
  const up = I("arrow-up", 12), down = I("arrow-down", 12);
  const kpi = (label, value, delta, note, cls = "") => `            <div class="kpi${cls}"><span class="label">${label}</span><span class="value">${value}</span><div class="kpi-foot">${delta ? `<span class="delta ${delta[0]}">${delta[1] === "up" ? up : down}<span class="sr-only">${delta[1] === "up" ? "증가" : "감소"}</span>${delta[2]}</span>` : ""}<span class="delta-note">${note}</span></div></div>`;

  const days = ["11-07", "11-08", "11-09", "11-10", "11-11", "11-12", "11-13", "11-14", "11-15", "11-16", "11-17", "11-18", "11-19", "11-20"];
  const recv = [41820, 39210, 18450, 16980, 43110, 44560, 42980, 41270, 45890, 19240, 17630, 44120, 46310, 38420];
  const blocked = [9120, 8740, 6210, 5980, 9870, 10340, 9560, 9230, 11210, 6640, 6120, 10050, 11480, 8960];
  const trend = { labels: days, series: [{ label: "수신", data: recv }, { label: "차단", data: blocked }] };
  const types = [["스팸", 5210], ["피싱", 1480], ["악성 첨부", 620], ["악성 URL", 1150], ["사칭 · BEC", 500]];
  const total = types.reduce((a, t) => a + t[1], 0);
  const donut = { color: "categorical", series: types.map(([label, value]) => ({ label, value })), center: total.toLocaleString("ko-KR"), legend: "right" };
  const weeklyOk = { labels: ["월", "화", "수", "목", "금", "토", "일"], series: [{ label: "이번 주", data: [10050, 11480, 8960, 9720, 10410, 6380, 5870] }, { label: "지난 주", data: [9230, 11210, 6640, 6120, 9870, 6210, 5980] }] };

  const domains = [["promo-mailer.example", 3120], ["pay-notice.example", 1840], ["account-verify.example", 1265], ["free-gift.example", 980], ["delivery-track.example", 642]];
  const dmax = 4000;
  const prog = domains.map(([d, n], i) => `<div class="progress-row"><div class="row"><span id="dash-dm-${i}">${d}</span><span><b>${n.toLocaleString("ko-KR")}</b><span class="target">통</span></span></div><div class="progress" role="meter" aria-labelledby="dash-dm-${i}" aria-valuemin="0" aria-valuemax="${dmax}" aria-valuenow="${n}" aria-valuetext="${n.toLocaleString("ko-KR")}통"><i style="width:${(n / dmax * 100).toFixed(1)}%"></i></div></div>`).join("");

  const recent = [
    ["09:41:12", "[긴급] 결제 계정이 정지되었습니다", "billing@pay-notice.example", ["critical", "피싱"], ["warn", "격리"]],
    ["09:36:47", "11월 세금계산서 발행 안내", "invoice@tax-docs.example", ["high", "악성 첨부"], ["danger", "차단"]],
    ["09:12:03", "택배 주소 확인이 필요합니다", "notice@delivery-track.example", ["high", "악성 URL"], ["danger", "차단"]],
    ["08:58:20", "대표님, 송금 요청드립니다", "ceo.office@mail-secure.example", ["critical", "사칭 · BEC"], ["warn", "격리"]],
    ["08:40:09", "비밀번호가 곧 만료됩니다", "it-help@account-verify.example", ["critical", "피싱"], ["danger", "차단"]],
  ];
  const recentRows = recent.map(([t, s, f, v, st]) => `              <tr><td>2026. 11. 20 ${t}</td><td><a href="spam.html" class="link">${esc(s)}</a></td><td>${f}</td><td><span class="tag ${v[0]}">${v[1]}</span></td><td><span class="indicator ${st[0]}">${st[1]}</span></td></tr>`).join("\n");

  const body = `          <div class="page-head"><div><h1 class="title">대시보드</h1><p class="sub">최근 갱신 09:41 · 자동 갱신 1분</p></div><div class="actions"><div class="btn-group"><div class="select-btn" role="radiogroup" aria-label="기간"><button type="button" class="on" role="radio" aria-checked="true">오늘</button><button type="button" role="radio" aria-checked="false">7일</button><button type="button" role="radio" aria-checked="false">30일</button></div><button type="button" class="btn md outline assistive icon-only" aria-label="새로 고침">${I("refresh", 20)}</button></div></div></div>
          <div class="kpi-grid">
${kpi("오늘 수신 메일", "38,420", ["good", "down", "4%"], "어제 대비")}
${kpi("차단한 메일", "8,960<small>통</small>", ["bad", "up", "6%"], "어제 대비")}
${kpi("피싱 · 사칭 탐지", "1,980", ["bad", "up", "18%"], "어제 대비", " critical")}
${kpi("격리 대기", "342", null, "관리자 검토 필요")}
          </div>
          <div class="row-3">
            <div class="chart-card"><div class="chart-head"><h2 class="chart-title">일별 수신 · 차단 추이</h2><span class="chart-sub">최근 14일</span></div><div class="chart-view"><div class="chart-canvas"><canvas data-chart="timeseries" data-spec='${json(trend)}' role="img" aria-label="일별 수신 · 차단 추이 — 최근 14일, 하루 평균 수신 35,714통 · 차단 8,822통"></canvas></div></div></div>
            <div class="chart-card"><div class="chart-head"><h2 class="chart-title">위협 유형 분포</h2><span class="chart-sub">오늘</span></div><div class="chart-view"><div class="chart-canvas"><canvas data-chart="donut" data-spec='${json(donut)}' role="img" aria-label="위협 유형 분포 — ${types.map((t) => t[0] + " " + t[1].toLocaleString("ko-KR")).join(", ")}, 합계 ${total.toLocaleString("ko-KR")}"></canvas></div></div></div>
          </div>
          <div class="row-2">
            <div class="chart-card"><div class="chart-head"><h2 class="chart-title">요일별 차단</h2><span class="chart-sub">주간 비교</span></div><div class="chart-view"><div class="chart-canvas"><canvas data-chart="bar" data-spec='${json(weeklyOk)}' role="img" aria-label="요일별 차단 — 이번 주와 지난 주 비교, 이번 주 화요일 11,480통이 가장 많음"></canvas></div></div></div>
            <div class="chart-card"><div class="chart-head"><h2 class="chart-title">차단 상위 발신 도메인</h2><span class="chart-sub">최근 7일</span></div><div class="progress-list">${prog}</div></div>
          </div>
          <div class="card flush">
            <div class="card-head"><h2 class="title">최근 위협 메일</h2><a href="spam.html" class="btn sm text assistive">전체 보기${I("chevron-right", 16)}</a></div>
            <div class="tbl-wrap"><table class="tbl nowrap"><thead><tr><th>수신 시각</th><th>제목</th><th>발신자</th><th>판정</th><th>처리</th></tr></thead><tbody>
${recentRows}
            </tbody></table></div>
          </div>`;
  return shell("dashboard", "대시보드", body, { chart: true });
}

/* =========================================================
   3. 스팸메일 리스트
   ========================================================= */
const VERDICT = { 피싱: "critical", "사칭 · BEC": "critical", "악성 첨부": "high", "악성 URL": "high", 스팸: "medium", 광고: "" };
const STATUS = { 격리: "warn", 차단: "danger", 해제: "ok" };
const ROWS = [
  ["09:41:12", "결제 알림", "billing@pay-notice.example", "[긴급] 결제 계정이 정지되었습니다. 24시간 안에 확인하세요", "kim.sales@jiran.example", "피싱", 98, "격리", "203.0.113.24", "실패", "가짜 로그인 페이지 링크(account-check.example/login)", ""],
  ["09:36:47", "세금계산서", "invoice@tax-docs.example", "11월 세금계산서 발행 안내", "finance@jiran.example", "악성 첨부", 96, "차단", "198.51.100.71", "통과", "첨부 invoice-1120.iso 안의 실행 파일", "invoice-1120.iso (2.4MB)"],
  ["09:12:03", "택배 알림", "notice@delivery-track.example", "택배 주소 확인이 필요합니다. 배송이 보류되었습니다", "park.hr@jiran.example", "악성 URL", 91, "차단", "192.0.2.15", "실패", "단축 URL 이 악성 도메인으로 이동", ""],
  ["08:58:20", "대표이사실", "ceo.office@mail-secure.example", "대표님 지시로 오늘 안에 송금 부탁드립니다", "accounting@jiran.example", "사칭 · BEC", 94, "격리", "203.0.113.90", "실패", "임원 이름 사칭 · 비슷한 도메인", ""],
  ["08:40:09", "IT 지원", "it-help@account-verify.example", "비밀번호가 곧 만료됩니다. 지금 재설정하세요", "lee.dev@jiran.example", "피싱", 97, "차단", "198.51.100.12", "실패", "회사 로고를 흉내 낸 입력 양식", ""],
  ["08:21:55", "특가 쇼핑", "deal@promo-mailer.example", "오늘만 90% 할인! 회원 전용 쿠폰이 도착했습니다", "choi.mkt@jiran.example", "광고", 72, "격리", "192.0.2.88", "통과", "대량 발송 · 수신 거부 링크 없음", ""],
  ["08:03:40", "이벤트 당첨", "winner@free-gift.example", "축하합니다! 최신 노트북 당첨자로 선정되셨습니다", "jung.ops@jiran.example", "스팸", 88, "차단", "203.0.113.141", "실패", "스팸 문구 점수 · 평판 낮은 IP", ""],
  ["07:47:18", "뉴스레터", "news@weekly-letter.example", "주간 업계 소식 — 11월 셋째 주", "kim.sales@jiran.example", "광고", 61, "해제", "198.51.100.200", "통과", "대량 발송 · 사용자가 해제함", ""],
  ["07:30:02", "보안 경고", "security@cloud-drive.example", "다른 기기에서 로그인이 감지되었습니다", "han.legal@jiran.example", "피싱", 95, "차단", "192.0.2.47", "실패", "클라우드 서비스 사칭 · 링크 도메인 불일치", ""],
  ["07:12:45", "구매 담당", "order@supplier-portal.example", "발주서(PO-20261120) 확인 요청", "purchase@jiran.example", "악성 첨부", 93, "차단", "203.0.113.5", "통과", "매크로가 든 문서 첨부", "PO-20261120.docm (180KB)"],
  ["06:55:31", "대출 상담", "loan@quick-credit.example", "무서류 당일 대출 가능합니다", "song.cs@jiran.example", "스팸", 84, "차단", "198.51.100.150", "실패", "스팸 문구 점수", ""],
  ["06:41:09", "인사팀", "hr-notice@benefit-center.example", "연말 복지 포인트 신청 마감 안내", "all@jiran.example", "피싱", 90, "격리", "192.0.2.201", "실패", "사내 부서 사칭 · 외부 발신", ""],
  ["06:20:17", "웨비나", "event@cloud-summit.example", "무료 웨비나 초대 — 클라우드 보안 실무", "lee.dev@jiran.example", "광고", 58, "해제", "203.0.113.66", "통과", "대량 발송 · 사용자가 해제함", ""],
  ["05:58:44", "해외 배송", "tracking@global-ship.example", "통관 수수료 결제가 필요합니다", "park.hr@jiran.example", "악성 URL", 89, "차단", "198.51.100.33", "실패", "결제 페이지 위장", ""],
  ["05:31:26", "암호화폐", "bonus@coin-airdrop.example", "지금 가입하면 코인을 무료로 드립니다", "choi.mkt@jiran.example", "스팸", 86, "차단", "192.0.2.9", "실패", "스팸 문구 점수 · 평판 낮은 IP", ""],
  ["05:02:58", "계약 담당", "contract@legal-docs.example", "계약서 전자서명 요청이 도착했습니다", "han.legal@jiran.example", "피싱", 92, "격리", "203.0.113.177", "실패", "전자서명 서비스 사칭", ""],
  ["04:44:13", "할인 쿠폰", "coupon@promo-mailer.example", "주말 한정 무료 배송 쿠폰", "song.cs@jiran.example", "광고", 66, "격리", "192.0.2.88", "통과", "대량 발송", ""],
  ["04:10:37", "음성 메시지", "voicemail@call-center.example", "새 음성 메시지 1건 (00:42)", "accounting@jiran.example", "악성 첨부", 95, "차단", "198.51.100.90", "실패", "HTML 첨부 안의 피싱 양식", "voicemail-0042.html (12KB)"],
  ["03:26:50", "투자 정보", "vip@stock-signal.example", "VIP 회원 전용 급등주 정보", "jung.ops@jiran.example", "스팸", 83, "차단", "203.0.113.230", "실패", "스팸 문구 점수", ""],
  ["02:48:05", "공지", "admin@webmail-update.example", "메일함 용량이 가득 찼습니다. 지금 늘리세요", "all@jiran.example", "피싱", 96, "차단", "192.0.2.140", "실패", "웹메일 관리자 사칭", ""],
];

function spam() {
  const rows = ROWS.map((r, i) => {
    const [t, name, from, subject, to, verdict, score, status, ip, auth, reason, attach] = r;
    const id = `sp-${i}`;
    const tone = VERDICT[verdict];
    const raw = `Received: from ${from.split("@")[1]} (${ip})\nFrom: "${name}" <${from}>\nTo: ${to}\nDate: 2026-11-20T${t}+09:00\nSubject: ${subject}\nAuthentication-Results: spf=${auth === "통과" ? "pass" : "fail"} dkim=${auth === "통과" ? "pass" : "none"} dmarc=${auth === "통과" ? "pass" : "fail"}\nX-MSC-Verdict: ${verdict} score=${score}`;
    return `                <tr data-id="${id}"><td class="expand"><button type="button" class="expand-btn" aria-expanded="false" aria-controls="${id}-d" aria-label="${t} ${esc(subject)} 상세">${I("chevron-right", 16)}</button></td><td class="check"><label class="checkbox"><input type="checkbox" aria-label="${t} ${esc(subject)} 선택"></label></td><td>11. 20 ${t.slice(0, 5)}</td><td>${name}<span class="cell-sub">${from}</span></td><td class="truncate">${esc(subject)}</td><td>${to}</td><td><span class="tag${tone ? " " + tone : ""}">${verdict}</span></td><td class="num">${score}</td><td data-col="status"><span class="indicator ${STATUS[status]}">${status}</span></td></tr>
                <tr class="row-detail" id="${id}-d" hidden><td colspan="9"><div class="row-detail-body"><dl class="detail-meta"><dt>판정 근거</dt><dd>${reason}</dd><dt>발신 IP</dt><dd>${ip}</dd><dt>발신 인증</dt><dd>SPF · DKIM · DMARC ${auth}</dd><dt>첨부</dt><dd>${attach || "없음"}</dd></dl><div class="code-view wrap"><div class="head"><span class="title">${t} 메일 헤더</span><button type="button" class="btn sm text assistive copy" aria-label="${t} 메일 헤더 복사"><span class="ico">${I("copy", 16)}</span><span class="t">복사</span></button></div><pre tabindex="0" aria-label="${t} 메일 헤더"><code>${esc(raw)}</code></pre></div></div></td></tr>`;
  }).join("\n");

  const verdicts = ["피싱", "사칭 · BEC", "악성 첨부", "악성 URL", "스팸", "광고"];
  const vOpts = verdicts.map((v) => `<li class="menu-item" role="option" data-value="${v}" aria-selected="false">${v}</li>`).join("");

  const body = `        <div class="page-head">
          <nav aria-label="현재 위치"><ol class="breadcrumb"><li><a href="dashboard.html" class="icon" aria-label="홈">${I("home", 18)}</a></li><li><a href="#">메일 보안</a></li><li aria-current="page"><span>스팸메일</span></li></ol></nav>
          <div><h1 class="title">스팸메일</h1><p class="sub">차단 · 격리한 메일을 확인하고 정상 메일은 받은편지함으로 돌려보냅니다</p></div><div class="actions"><button type="button" class="btn md outline assistive">${I("download", 20)}CSV 내보내기</button></div>
        </div>
          <div class="toolbar">
            <div class="searchbar" role="search" data-debounce="300">${I("search", 18)}<input type="search" id="sp-q" placeholder="제목, 발신자, 수신자 검색" aria-label="스팸메일 검색"></div>
            <div class="combobox" data-multiple><div class="control"><input type="text" id="sp-verdict" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="sp-verdict-list" autocomplete="off" placeholder="판정" aria-label="판정"></div><ul class="menu" role="listbox" id="sp-verdict-list" aria-label="판정" aria-multiselectable="true">${vOpts}</ul><span class="sr-only" role="status"></span></div>
            <div class="datepicker field" data-range data-max="today" data-presets="7 30" data-default-preset="7"><div class="affix"><input id="sp-range" value="2026. 11. 14 ~ 2026. 11. 20" placeholder="YYYY. MM. DD ~ YYYY. MM. DD" inputmode="numeric" autocomplete="off" aria-label="조회 기간"><button type="button" class="cal-btn" aria-label="달력 열기" aria-haspopup="dialog" aria-expanded="false">${I("calendar", 18)}</button></div></div>
          </div>
          <div class="toolbar sub"><span>결과 <b id="sp-total">128</b>건</span></div>
          <div class="tbl-wrap sticky" tabindex="0" role="region" aria-label="스팸메일 목록">
            <div class="action-bar"><b>0개 선택</b><span class="spacer"></span><div class="btn-group"><button type="button" class="btn sm outline assistive" data-act="release">${I("mail-forward", 16)}정상 메일로 해제</button><button type="button" class="btn sm outline assistive" data-act="block">${I("ban", 16)}발신자 차단</button><button type="button" class="btn sm outline assistive" data-act="delete">${I("trash", 16)}영구 삭제</button></div></div>
            <table class="tbl hover">
              <thead><tr><th class="expand"><span class="sr-only">상세</span></th><th class="check"><label class="checkbox"><input type="checkbox" aria-label="전체 선택"></label></th><th class="sortable sorted desc" aria-sort="descending"><button type="button" class="sort">수신 시각</button></th><th>발신자</th><th>제목</th><th>수신자</th><th>판정</th><th class="num">점수</th><th>처리</th></tr></thead>
              <tbody>
${rows}
              </tbody>
            </table>
          </div>
          <div class="pagination-bar"><span>총 <b>128</b>건 · 1–20</span><nav class="pagination compact" aria-label="페이지"><button type="button" aria-label="이전" disabled>${I("chevron-left", 16)}</button><button type="button" class="on" aria-current="page">1</button><button type="button">2</button><button type="button">3</button><button type="button">4</button><button type="button">5</button><span class="gap">…</span><button type="button">7</button><button type="button" aria-label="다음">${I("chevron-right", 16)}</button></nav></div>
<div class="tpl-dialogs" hidden>
  <div class="popup danger" id="sp-del" role="alertdialog" aria-modal="true" aria-labelledby="sp-del-t" aria-describedby="sp-del-b">
    <h3 class="popup-title" id="sp-del-t">선택한 메일 <span data-del-count>0</span>통을 영구 삭제할까요?</h3><button type="button" class="btn sm text assistive icon-only popup-close" aria-label="닫기" data-popup-close>${I("x", 18)}</button>
    <p class="popup-body" id="sp-del-b">영구 삭제한 메일은 격리함에서도 사라지고 복구할 수 없습니다. 사용자가 받은편지함으로 돌려 달라고 요청해도 되돌릴 수 없습니다.</p>
    <div class="popup-actions"><div class="btn-group"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="button" class="btn md solid negative" data-act="delete-confirm">영구 삭제</button></div></div>
  </div>
</div>`;
  return shell("spam", "스팸메일", body, { cls: "msc-spam" });
}

fs.writeFileSync(path.join(OUT, "login.html"), login());
fs.writeFileSync(path.join(OUT, "dashboard.html"), dashboard());
fs.writeFileSync(path.join(OUT, "spam.html"), spam());
console.log("login.html · dashboard.html · spam.html 생성");
