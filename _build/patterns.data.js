/* =========================================================
   patterns.data.js — 패턴 11개. 컴포넌트를 조합한 화면 단위 예시
   shape: { status, desc, uses:[컴포넌트 key…], css:[패턴 전용 접두어…], thumb, principles:[[k,v]], examples:[…], guideline }
   코드 패널의 CSS 는 uses 컴포넌트의 CSS + css 접두어의 합집합으로 추출됩니다.
   ========================================================= */
/* 아이콘: icons.gen.js 의 I(name, size) 사용 */

const LOG_ROWS = [
  ["09:41:12.031", "critical", "CRIT", "10.0.4.21", "PC-2041", "process.create blocked: rundll32.exe → cryptor.dll"],
  ["09:41:11.870", "medium", "WARN", "10.0.4.21", "PC-2041", "usb.attach vendor=0x0781 product=0x5583 (unapproved)"],
  ["09:41:09.114", "info", "INFO", "10.0.0.3", "Server-03", "policy.sync ok (rev 2041)"],
  ["09:40:58.552", "high", "HIGH", "10.0.4.33", "PC-1187", "malware.known blocked sha256=9f3a…c21e"],
  ["09:40:41.207", "low", "LOW", "10.0.0.3", "Server-03", "agent.checkin 1284/1284"],
  ["09:39:57.980", "info", "INFO", "10.0.7.10", "PC-0932", "scan.scheduled completed files=48213 threats=0"],
];
const logTable = (rows) => `
        <div class="tbl-wrap">
          <table class="tbl compact">
            <thead><tr><th class="sortable sorted desc" aria-sort="descending">시간</th><th>심각도</th><th>소스 IP</th><th>단말</th><th>메시지</th><th class="actions"></th></tr></thead>
            <tbody>
              ${rows.map(([t, tone, lv, ip, host, msg]) => `<tr class="log-row"><td>2026-09-07 ${t}</td><td><span class="tag ${tone} sm">${lv}</span></td><td>${ip}</td><td>${host}</td><td>${msg}</td><td class="actions"><button type="button" class="btn sm tertiary icon" aria-label="상세">${I("dots")}</button></td></tr>`).join("\n              ")}
            </tbody>
          </table>
        </div>`;

const PATTERNS = {
  /* ------------------------------------------------ Common UI */
  "input-form": {
    status: "ready", react: ["Form","FormSection","FormRow","FormActions"], uses: ["text-field", "dropdown", "checkbox", "radio-button", "button"], css: [".form"],
    desc: "정책·사용자·설정을 입력하는 폼의 기본 구조입니다. 라벨은 위, 필수는 *, 오류는 필드 아래, 저장은 오른쪽 아래.",
    thumb: `<div class="form" style="padding:12px;gap:8px;min-width:200px"><div class="field sm"><label>이름</label><input placeholder="정책 이름"></div><div class="form-actions" style="padding-top:8px"><button class="btn sm primary">저장</button></div></div>`,
    principles: [["구성", "한 열 기본. 관련 짧은 필드(시작·종료)만 .form-row 로 2열"], ["검증", "포커스가 떠날 때 필드 단위로, 제출 시 첫 오류로 스크롤"], ["액션", "취소 · 저장 순서, 저장은 Primary 하나. 파괴적 액션은 왼콤(.left)"]],
    examples: [
      { id: "basic", title: "기본 폼", desc: "섹션 제목(.form-section)으로 그룹을 나누고, 마지막에 .form-actions.", html: `
        <form class="form">
          <div class="form-section">기본 정보</div>
          <div class="field"><label for="pname">정책 이름 <em>*</em></label><input id="pname" placeholder="예: 외부 USB 차단" required><span class="help">2~40자</span></div>
          <div class="field"><label for="pdesc">설명</label><textarea id="pdesc" placeholder="정책의 목적과 적용 범위"></textarea></div>
          <div class="form-section">적용 대상</div>
          <div class="form-row">
            <div class="field"><label>그룹</label><div class="dropdown"><button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="false">전체</button></div></div>
            <div class="field"><label for="prio">우선순위</label><input id="prio" type="number" value="10" min="1" max="100"></div>
          </div>
          <fieldset class="radio-group" style="border:0;padding:0;margin:0"><legend class="t-label-1" style="margin-bottom:8px">탐지 시 동작</legend>
            <label class="radio"><input type="radio" name="fa" checked><span>차단 후 알림</span></label>
            <label class="radio"><input type="radio" name="fa"><span>알림만</span></label>
          </fieldset>
          <label class="checkbox"><input type="checkbox" checked><span>저장 즉시 배포<small>에이전트가 다음 체크인에서 적용합니다</small></span></label>
          <div class="form-actions"><button type="button" class="btn md text">취소</button><button type="submit" class="btn md primary">정책 저장</button></div>
        </form>` },
      { id: "error", title: "오류 상태", desc: "제출 후 오류. 필드 오류 + 상단 요약 Notice(오류 3개 이상일 때).", html: `
        <form class="form" novalidate>
          <div class="notice danger" role="alert" style="margin-bottom:-4px"><span class="ico">${I("alert-circle",20)}</span><div><b>입력값 2개를 확인해 주세요</b>정책 이름, 허용 IP</div></div>
          <div class="field error"><label for="e1">정책 이름 <em>*</em></label><input id="e1" aria-invalid="true" aria-describedby="e1h"><span class="help" id="e1h">정책 이름을 입력하세요</span></div>
          <div class="field error"><label for="e2">허용 IP</label><input id="e2" value="10.0.0" aria-invalid="true" aria-describedby="e2h"><span class="help" id="e2h">올바른 IPv4 형식이 아닙니다. 예: 10.0.0.12</span></div>
          <div class="form-actions"><button type="button" class="btn md danger secondary left">삭제</button><button type="button" class="btn md text">취소</button><button type="submit" class="btn md primary">정책 저장</button></div>
        </form>` },
    ],
    guideline: { do: ["필드 순서는 사용자가 아는 정보 → 결정해야 하는 정보.", "저장 후에는 Toast 로 결과를 알리고 목록으로 돌아갑니다."], dont: ["3열 이상 배치하지 않습니다.", "필수 표시 없이 제출 시점에만 오류를 보여주지 않습니다."] },
  },

  "terms-agreement": {
    status: "ready", react: ["Terms","TermsAll","TermsItem"], uses: ["checkbox", "accordion", "button"], css: [".terms"],
    desc: "약관·개인정보 처리 동의 화면입니다. 전체 동의 + 개별 항목, 필수/선택 표시, 전문 보기.",
    thumb: `<div class="terms" style="max-width:200px"><div class="all"><label class="checkbox"><input type="checkbox" class="mixed"><span style="font-size:12px">전체 동의</span></label></div><div class="item" style="padding:4px 8px"><label class="checkbox"><input type="checkbox" checked><span style="font-size:12px">이용약관</span></label><span class="req">필수</span></div></div>`,
    examples: [
      { id: "basic", title: "전체 동의 + 개별 항목", desc: "전체 동의는 부분 선택 상태(.mixed)를 표현. 필수 미동의 시 다음 버튼 비활성.", html: `
        <div class="terms">
          <div class="all"><label class="checkbox"><input type="checkbox" class="mixed" aria-label="전체 동의"><span>전체 동의</span></label></div>
          <div class="item"><label class="checkbox"><input type="checkbox" checked><span>서비스 이용약관</span></label><span class="req">필수</span><button type="button" class="view">보기</button></div>
          <div class="item"><label class="checkbox"><input type="checkbox" checked><span>개인정보 수집·이용</span></label><span class="req">필수</span><button type="button" class="view">보기</button></div>
          <div class="item"><label class="checkbox"><input type="checkbox"><span>보안 소식 이메일 수신</span></label><span class="opt">선택</span></div>
          <div class="btn-group end" style="margin-top:16px"><button type="button" class="btn md primary">다음</button></div>
        </div>` },
      { id: "inline", title: "전문 펼쳐 보기", desc: "약관 전문은 Accordion 으로 같은 화면에서 펼칩니다.", html: `
        <div class="terms">
          <details class="accordion" style="max-width:560px"><summary><label class="checkbox" style="font-weight:600"><input type="checkbox" checked><span>서비스 이용약관 <span class="req">필수</span></span></label></summary><div class="body" style="max-height:120px;overflow:auto">제1조(목적) 이 약관은 지란지교시큐리티가 제공하는 서비스의 이용 조건과 절차를 규정합니다. 제2조(정의) … 제3조(약관의 효력) …</div></details>
        </div>` },
    ],
    guideline: { do: ["필수·선택을 텍스트로 명시합니다.", "전문은 새 창 대신 같은 화면에서 펼칩니다."], dont: ["선택 항목을 기본 체크해 두지 않습니다."] },
  },

  "empty-state": {
    status: "ready", react: ["Empty"], uses: ["button", "search"], css: [".empty"],
    desc: "데이터가 없거나 검색 결과가 없을 때 이유와 다음 행동을 제시합니다. 오류 상태와 구분합니다.",
    thumb: `<div class="empty" style="padding:16px;gap:2px"><span class="ico" style="width:28px;height:28px;font-size:12px">${I("inbox")}</span><b style="font-size:12px">이벤트 없음</b></div>`,
    principles: [["첫 사용", "무엇을 할 수 있는지 + 시작 액션(Primary)"], ["검색 결과 없음", "조건을 보여주고 초기화·완화 제안"], ["오류", "Notification(danger) 으로, 빈 화면과 섞지 않음"]],
    examples: [
      { id: "first", title: "첫 사용", html: `
        <div class="empty" style="max-width:560px">
          <span class="ico">${I("shield")}</span>
          <b>아직 정책이 없습니다</b>
          <span>템플릿에서 시작하거나 새 정책을 만들어 에이전트에 배포하세요.</span>
          <div class="btn-group"><button type="button" class="btn md secondary">템플릿 보기</button><button type="button" class="btn md primary">${I("plus")}정책 만들기</button></div>
        </div>` },
      { id: "nores", title: "검색 결과 없음", html: `
        <div class="empty" style="max-width:560px">
          <span class="ico">${I("search")}</span>
          <b>'랜섬웨어 2025' 에 대한 결과가 없습니다</b>
          <span>검색어를 줄이거나 기간 필터(최근 24시간)를 넓혀 보세요.</span>
          <button type="button" class="btn md secondary">필터 초기화</button>
        </div>` },
      { id: "compact", title: "패널 안 빈 상태", desc: "카드·사이드 패널처럼 좁은 영역은 .compact.", html: `
        <div class="empty compact" style="max-width:480px"><span class="ico">${I("inbox")}</span><div><b style="font-size:14px">연결된 알림 채널이 없습니다</b><span style="display:block">Slack 또는 이메일을 연결하세요.</span></div><button type="button" class="btn sm secondary" style="margin:0 0 0 auto">연결</button></div>` },
    ],
    guideline: { do: ["제목은 상태를, 본문은 다음 행동을 씁니다.", "액션은 최대 2개."], dont: ["빈 화면을 로딩 중에 잠깐 보여주지 않습니다(Skeleton 사용)."] },
  },

  "notes": {
    status: "ready", react: ["Notes"], uses: ["notification", "accordion"], css: [".notes"],
    desc: "화면 하단이나 폼 옆에 두는 유의사항·안내 문구입니다. 읽지 않아도 진행할 수 있는 정보를 담습니다.",
    thumb: `<div class="notes" style="padding:10px 12px;font-size:12px"><b style="font-size:12px">유의사항</b><ul><li>배포 후 5분 내 적용</li><li>격리 파일 30일 보관</li></ul></div>`,
    examples: [
      { id: "basic", title: "기본", desc: "제목 + 불릿 3~5개. 배경 subtle, 보더 없음.", html: `
        <div class="notes" style="max-width:600px">
          <b>유의사항</b>
          <ul>
            <li>정책은 배포 후 에이전트의 다음 체크인(최대 5분)에 적용됩니다.</li>
            <li>차단된 파일은 격리 저장소에 30일 보관 후 자동 삭제됩니다.</li>
            <li>예외 목록은 해시 또는 경로 기준이며 와일드카드(*)를 지원합니다.</li>
          </ul>
        </div>` },
      { id: "warning", title: "주의", desc: "되돌리기 어려운 영향은 .warning. 즉시 조치가 필요하면 Notification(danger).", html: `
        <div class="notes warning" style="max-width:600px">
          <b>정책 삭제 전 확인</b>
          <ul>
            <li>삭제한 정책이 적용된 에이전트는 기본 정책으로 돌아갑니다.</li>
            <li>감사 로그는 유지되지만 정책 이름은 ID 로 표시됩니다.</li>
          </ul>
        </div>` },
      { id: "collapsed", title: "접힌 유의사항", desc: "길거나 부차적인 안내는 Accordion 으로 접습니다.", html: `
        <details class="accordion" style="max-width:600px"><summary>${I("info-circle")}유의사항 <small>3개</small></summary><div class="body"><ul style="margin:0;padding-left:1.2em"><li>정책은 배포 후 최대 5분 내 적용됩니다.</li><li>격리 파일은 30일 보관됩니다.</li><li>예외는 해시·경로 기준입니다.</li></ul></div></details>` },
    ],
    guideline: { do: ["한 항목에 한 문장.", "숫자(5분, 30일)는 구체적으로."], dont: ["필수 확인 사항을 유의사항에 숨기지 않습니다(그때는 Notice 또는 확인 팝업)."] },
  },

  /* ------------------------------------------------ Service Pattern */
  "onboarding": {
    status: "ready", react: ["Onboard","Steps"], uses: ["indicator", "card", "item-tile", "button"], css: [".onboard"],
    desc: "첫 사용자가 콘솔을 설정하는 단계형 흐름입니다. 진행 단계 표시, 한 단계 한 결정, 건너뛰기 허용.",
    thumb: `<ol class="steps" style="font-size:12px"><li class="done"><i style="width:18px;height:18px;font-size:10px">${I("check",10)}</i>1</li><li class="on"><i style="width:18px;height:18px;font-size:10px">2</i>2</li><li><i style="width:18px;height:18px;font-size:10px">3</i>3</li></ol>`,
    examples: [
      { id: "step", title: "단계 화면", desc: "상단 Steps + 카드 한 장 + 하단 이전/다음. 선택형 단계는 Item Tile.", html: `
        <div class="onboard">
          <ol class="steps"><li class="done"><i>${I("check",12)}</i>조직 정보</li><li class="on" aria-current="step"><i>2</i>보호 수준</li><li><i>3</i>에이전트 배포</li><li><i>4</i>완료</li></ol>
          <div class="card">
            <h3 class="title t-heading-3">보호 수준을 선택하세요</h3>
            <p class="desc">나중에 정책 › 기본 정책에서 바꿀 수 있습니다.</p>
            <div class="tile-grid" data-single style="grid-template-columns:1fr 1fr">
              <button type="button" class="tile on" aria-pressed="true"><span class="ico">S</span><b>표준</b><span>알려진 위협 차단. 권장</span></button>
              <button type="button" class="tile" aria-pressed="false"><span class="ico">E</span><b>강화</b><span>의심 행위까지 차단</span></button>
            </div>
            <div class="card-foot"><button type="button" class="btn md text">건너뛰기</button><button type="button" class="btn md secondary" data-step="prev">이전</button><button type="button" class="btn md primary" data-step="next">다음</button></div>
          </div>
        </div>` },
      { id: "done", title: "완료", desc: "요약 + 첫 행동으로 이어지는 Primary.", html: `
        <div class="onboard">
          <ol class="steps"><li class="done"><i>${I("check",12)}</i>조직 정보</li><li class="done"><i>${I("check",12)}</i>보호 수준</li><li class="done"><i>${I("check",12)}</i>에이전트 배포</li><li class="on" aria-current="step"><i>4</i>완료</li></ol>
          <div class="card" style="align-items:center;text-align:center">
            <span class="indicator ok" style="font-size:16px;font-weight:600">설정이 완료되었습니다</span>
            <p class="desc">표준 보호 · 에이전트 12대 연결 대기 중. 첫 이벤트가 들어오면 대시보드에서 확인할 수 있습니다.</p>
            <button type="button" class="btn lg primary">대시보드로 이동</button>
          </div>
        </div>` },
    ],
    guideline: { do: ["단계는 3~5개, 각 단계는 결정 하나.", "언제든 건너뛰고 나중에 설정할 수 있게."], dont: ["온보딩에서 약관 동의를 다시 받지 않습니다."] },
  },

  "search": {
    status: "ready", react: ["Toolbar","Spacer","Stack"], uses: ["search", "chip", "dropdown", "date-picker", "data-table", "tag", "pagination", "button"], css: [".toolbar", ".stack"],
    desc: "검색 + 필터 + 결과 목록의 조회 화면 패턴입니다. 조건은 항상 보이고, 결과 수와 적용 중인 필터를 함께 보여줍니다.",
    thumb: `<div class="toolbar" style="width:240px"><div class="searchbar" style="min-width:0;flex:1;height:32px">${I("search")}<input placeholder="검색"></div><button class="chip sm on">Critical</button></div>`,
    principles: [["툴바", "검색(좌) · 필터 드롭다운 · 기간 · 여백 · 액션(우)"], ["필터 표시", "적용 중인 필터는 Chip 으로, 결과 수는 툴바 아래"], ["빈 결과", "빈 화면 패턴 + 필터 초기화"]],
    examples: [
      { id: "toolbar", title: "검색 툴바 + 결과", html: `
        <div class="stack">
          <div class="toolbar">
            <div class="searchbar" role="search" style="min-width:320px">${I("search")}<input type="search" placeholder="이벤트, 단말, IP 검색" aria-label="검색"></div>
            <div class="dropdown"><button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="false" style="min-width:140px;height:40px">심각도: 2</button></div>
            <div class="datepicker"><button type="button" class="field-btn" aria-haspopup="dialog" aria-expanded="false" style="height:40px;min-width:200px">최근 24시간${I("calendar")}</button></div>
            <span class="spacer"></span>
            <button type="button" class="btn md secondary">${I("download")}내보내기</button>
          </div>
          <div class="toolbar" style="font-size:12px;color:var(--text-secondary)">
            <span>결과 <b style="color:var(--text-primary)">128</b>건</span>
            <span class="chip sm on">Critical<i class="x" role="button" aria-label="제거">${I("x",10)}</i></span>
            <span class="chip sm on">High<i class="x" role="button" aria-label="제거">${I("x",10)}</i></span>
            <button type="button" class="btn sm text">필터 초기화</button>
          </div>
          <div class="tbl-wrap">
            <table class="tbl">
              <thead><tr><th class="sortable sorted desc" aria-sort="descending">시간</th><th>심각도</th><th>이벤트</th><th>대상</th><th>상태</th></tr></thead>
              <tbody>
                <tr><td>09:41:12</td><td><span class="tag critical">Critical</span></td><td><a href="#" class="link">랜섬웨어 행위 탐지</a></td><td>PC-2041 · 김민준</td><td><span class="indicator danger">차단</span></td></tr>
                <tr><td>09:36:47</td><td><span class="tag high">High</span></td><td><a href="#" class="link">알려진 악성코드 차단</a></td><td>PC-0932 · 박지훈</td><td><span class="indicator danger">차단</span></td></tr>
                <tr><td>09:12:03</td><td><span class="tag high">High</span></td><td><a href="#" class="link">의심 스크립트 실행</a></td><td>PC-1187 · 이서연</td><td><span class="indicator warn">검토 필요</span></td></tr>
              </tbody>
            </table>
          </div>
          <div class="pagination-bar"><span>총 <b>128</b>건 · 1–50</span><nav class="pagination compact" aria-label="페이지"><button type="button" aria-label="이전" disabled>${I("chevron-left",16)}</button><button type="button" class="on" aria-current="page">1</button><button type="button">2</button><button type="button">3</button><button type="button" aria-label="다음">${I("chevron-right",16)}</button></nav></div>
        </div>`, layout: "stack" },
    ],
    guideline: { do: ["입력 즉시 필터되면 결과 수를 실시간 갱신.", "필터 조합은 URL 에 반영해 공유 가능하게."], dont: ["'검색' 버튼을 눌러야만 반영되는 필터와 즉시 필터를 섞지 않습니다."] },
  },

  "system-status": {
    status: "ready", react: ["StatusList","StatusItem"], uses: ["indicator", "card", "tag", "notification", "loading"], css: [".status-list", ".status-item", ".stack"],
    desc: "에이전트·서버·연동 서비스의 상태를 한눈에 보여줍니다. 정상은 조용하게, 이상은 눈에 띄게.",
    thumb: `<div class="status-list" style="grid-template-columns:1fr;width:200px;gap:6px"><div class="status-item" style="padding:8px 10px;font-size:12px"><span class="indicator ok">수집 서버</span><span class="meta">99.9%</span></div><div class="status-item" style="padding:8px 10px;font-size:12px"><span class="indicator danger">SIEM</span><span class="meta">끊김</span></div></div>`,
    examples: [
      { id: "overview", title: "서비스 상태 보드", html: `
        <div class="stack" style="max-width:800px">
          <div class="notice danger" role="alert"><span class="ico">${I("alert-circle",20)}</span><div><b>SIEM 연동 연결 끊김</b>09:12 부터 이벤트 전송이 실패하고 있습니다. 인증 토큰을 확인하세요.<div class="actions"><button type="button" class="btn sm primary">연동 설정</button><button type="button" class="btn sm text">다시 시도</button></div></div></div>
          <div class="status-list">
            <div class="status-item"><span class="indicator ok">수집 서버</span><span class="meta">가동 99.98%</span></div>
            <div class="status-item"><span class="indicator ok">정책 배포</span><span class="meta">rev 2041</span></div>
            <div class="status-item"><span class="indicator warn">업데이트 서버</span><span class="meta">지연 3분</span></div>
            <div class="status-item"><span class="indicator danger">SIEM 연동</span><span class="meta">09:12 끊김</span></div>
            <div class="status-item"><span class="indicator info">DB 점검</span><span class="meta">02:00~04:00</span></div>
            <div class="status-item"><span class="indicator ok">라이선스</span><span class="meta">842 / 1,000</span></div>
          </div>
        </div>`, layout: "stack" },
      { id: "agents", title: "에이전트 상태 요약", desc: "연결 상태 비율 + 진행 중 작업.", html: `
        <div class="row-2" style="max-width:800px">
          <div class="card"><div class="card-head"><h3 class="title">에이전트 연결</h3><span class="tag ok">정상</span></div><div class="progress-row"><div class="row"><span>온라인</span><span>1,247 / 1,284</span></div><div class="progress success" role="progressbar" aria-valuenow="97"><i style="width:97%"></i></div></div><p class="desc">오프라인 37대 · 10분 이상 미체크인 12대</p></div>
          <div class="card"><div class="card-head"><h3 class="title">진행 중 작업</h3><span class="spinner sm" role="status" aria-label="진행 중"></span></div><div class="progress-row"><div class="row"><span>정책 rev 2041 배포</span><span>66%</span></div><div class="progress" role="progressbar" aria-valuenow="66"><i style="width:66%"></i></div></div><p class="desc">842 / 1,284대 완료 · 예상 3분</p></div>
        </div>` },
    ],
    guideline: { do: ["이상 상태는 상단 Notice 로 먼저, 목록에서는 색+라벨.", "마지막 갱신 시각을 표시합니다."], dont: ["정상 상태를 초록 배경으로 크게 강조하지 않습니다."] },
  },

  /* ------------------------------------------------ Security Console */
  "dashboard": {
    status: "ready", react: ["PageHead","Stack","Row3"], uses: ["data-visual", "card", "tag", "data-table", "select-button", "button"], css: [".page-head", ".stack", ".row-2", ".row-3"],
    desc: "보안 관리자의 첫 화면. 상단 KPI 4개, 아래 추이·분포 차트, 최근 이벤트 표. 위험이 한눈에 들어오고 상세로 바로 내려갈 수 있어야 합니다.",
    thumb: `<div class="kpi-grid" style="width:240px;gap:6px"><div class="kpi critical" style="padding:8px 10px;min-width:0"><span class="label" style="font-size:10px">Critical</span><span class="value" style="font-size:18px">1,284</span></div><div class="kpi" style="padding:8px 10px;min-width:0"><span class="label" style="font-size:10px">차단률</span><span class="value" style="font-size:18px">99.2%</span></div></div>`,
    principles: [["위계", "KPI(무슨 일) → 차트(어디서·얼마나) → 표(무엇을 할지)"], ["기간", "화면 우상단 Select Button 하나로 전체 기간을 바꿈"], ["밀도", "카드 gap 20, 카드 내부 24. 스크롤 없이 첫 화면에 KPI+차트"]],
    examples: [
      { id: "full", title: "대시보드", html: `
        <div class="stack">
          <div class="page-head"><div><h2 class="title">대시보드</h2><p class="sub">최근 갱신 09:41 · 자동 갱신 1분</p></div><div class="actions"><div class="select-btn" role="group" aria-label="기간"><button type="button" class="on" aria-pressed="true">24시간</button><button type="button" aria-pressed="false">7일</button><button type="button" aria-pressed="false">30일</button></div><button type="button" class="btn md secondary icon" aria-label="새로 고침">${I("refresh")}</button></div></div>
          <div class="kpi-grid">
            <div class="kpi critical"><span class="label">Critical 이벤트</span><span class="value">1,284</span><span class="delta up">${I("arrow-up",12)} 12% 전일 대비</span></div>
            <div class="kpi"><span class="label">차단률</span><span class="value">99.2<small>%</small></span><span class="delta down">${I("arrow-down",12)} 0.3%p</span></div>
            <div class="kpi"><span class="label">연결 에이전트</span><span class="value">1,247<small>/ 1,284</small></span><span class="delta">37대 오프라인</span></div>
            <div class="kpi"><span class="label">미처리 검토</span><span class="value">5</span><span class="delta">24시간 내 처리</span></div>
          </div>
          <div class="row-3">
            <div class="chart-card"><h3 class="chart-title">유형별 탐지</h3><div class="chart">
              <div class="row"><span class="lbl">랜섬웨어</span><div class="bar critical"><i style="width:82%"></i></div><span class="num">412</span></div>
              <div class="row"><span class="lbl">악성코드</span><div class="bar high"><i style="width:61%"></i></div><span class="num">306</span></div>
              <div class="row"><span class="lbl">USB 위반</span><div class="bar medium"><i style="width:44%"></i></div><span class="num">221</span></div>
              <div class="row"><span class="lbl">정책 위반</span><div class="bar low"><i style="width:23%"></i></div><span class="num">115</span></div>
            </div></div>
            <div class="chart-card"><h3 class="chart-title">심각도 분포</h3><div class="donut-row"><div class="donut" role="img" aria-label="심각도 분포" data-label="1,054"></div><div class="chart-legend" style="flex-direction:column"><span><i style="background:var(--sev-critical)"></i>Critical <b>190</b></span><span><i style="background:var(--sev-high)"></i>High <b>285</b></span><span><i style="background:var(--sev-medium)"></i>Medium <b>316</b></span><span><i style="background:var(--sev-low)"></i>Low <b>263</b></span></div></div></div>
          </div>
          <div class="card" style="padding:0;gap:0;overflow:hidden">
            <div class="card-head" style="padding:16px 24px"><h3 class="title">최근 Critical 이벤트</h3><a href="#" class="btn sm text">전체 보기 →</a></div>
            <table class="tbl"><thead><tr><th>시간</th><th>이벤트</th><th>대상</th><th>상태</th></tr></thead><tbody>
              <tr><td>09:41:12</td><td>랜섬웨어 행위 탐지</td><td>PC-2041 · 김민준</td><td><span class="indicator danger">차단</span></td></tr>
              <tr><td>09:36:47</td><td>알려진 악성코드 차단</td><td>PC-0932 · 박지훈</td><td><span class="indicator danger">차단</span></td></tr>
              <tr><td>08:58:20</td><td>C2 통신 시도</td><td>PC-0411 · 최유진</td><td><span class="indicator warn">검토 필요</span></td></tr>
            </tbody></table>
          </div>
        </div>`, layout: "stack" },
    ],
    guideline: { do: ["KPI 는 4개 이내, 첫 번째가 가장 중요한 위험 지표.", "모든 숫자는 클릭하면 해당 필터가 적용된 목록으로."], dont: ["장식용 차트(3D, 게이지)를 쓰지 않습니다.", "카드 안에 스크롤을 만들지 않습니다."] },
  },

  "log-viewer": {
    status: "ready", react: ["Toolbar","Stack"], uses: ["search", "chip", "select-button", "data-table", "tag", "pagination", "button"], css: [".toolbar", ".stack", ".log-row"],
    desc: "대량 로그를 빠르게 훑고 필터링하는 화면입니다. Compact 표 + 모노스페이스 시간/IP + 심각도 태그 + 실시간/일시정지 전환.",
    thumb: `<div class="tbl-wrap" style="width:240px"><table class="tbl compact"><tbody><tr class="log-row"><td style="height:32px">09:41:12</td><td><span class="tag critical sm">CRIT</span></td></tr><tr class="log-row"><td style="height:32px">09:41:11</td><td><span class="tag medium sm">WARN</span></td></tr></tbody></table></div>`,
    principles: [["밀도", ".tbl.compact 44px 행, 시간·IP 는 .log-row 모노스페이스"], ["필터", "심각도 Chip 다중 선택 + 검색 + 실시간/일시정지"], ["상세", "행 클릭 → 우측 패널(표는 그대로)"]],
    examples: [
      { id: "viewer", title: "로그 뷰어", html: `
        <div class="stack">
          <div class="toolbar">
            <div class="searchbar" role="search" style="min-width:360px">${I("search")}<input type="search" placeholder='메시지 검색 · host:"PC-2041" level:crit' aria-label="로그 검색"></div>
            <div class="chip-group"><button type="button" class="chip sm on" aria-pressed="true">CRIT</button><button type="button" class="chip sm on" aria-pressed="true">HIGH</button><button type="button" class="chip sm on" aria-pressed="true">WARN</button><button type="button" class="chip sm" aria-pressed="false">INFO</button></div>
            <span class="spacer"></span>
            <div class="select-btn outline" role="group" aria-label="갱신"><button type="button" class="on" aria-pressed="true"><span class="indicator danger pulse" style="gap:6px">실시간</span></button><button type="button" aria-pressed="false">일시정지</button></div>
            <button type="button" class="btn md secondary">${I("download")}CSV</button>
          </div>
          ${logTable(LOG_ROWS)}
          <div class="pagination-bar"><span>총 <b>48,213</b>건 · 최신 100건 표시</span><nav class="pagination compact" aria-label="페이지"><button type="button" aria-label="이전" disabled>${I("chevron-left",16)}</button><button type="button" class="on" aria-current="page">1</button><button type="button">2</button><button type="button">3</button><span class="gap">…</span><button type="button">483</button><button type="button" aria-label="다음">${I("chevron-right",16)}</button></nav></div>
        </div>`, layout: "stack" },
    ],
    guideline: { do: ["새 로그는 위에 추가, 스크롤 중이면 '새 로그 N건' 버튼으로 알림.", "타임스탬프는 ms 까지, 타임존 표기."], dont: ["로그 메시지를 줄바꿈하지 않습니다(말줄임 + 상세 패널)."] },
  },

  "policy-settings": {
    status: "ready", react: ["SettingsSection","Setting","PageHead"], uses: ["switch", "dropdown", "slider", "text-field", "radio-button", "notification", "button"], css: [".settings-section", ".setting", ".page-head", ".stack"],
    desc: "정책·시스템 설정 화면입니다. 섹션별 카드에 '라벨+설명 | 컨트롤' 행을 쌓고, 즉시 적용(Switch)과 저장 필요(폼)를 구분합니다.",
    thumb: `<div class="settings-section" style="padding:4px 12px;width:220px"><div class="setting" style="padding:8px 0"><div class="info"><b style="font-size:12px">실시간 보호</b></div><label class="switch sm"><input type="checkbox" checked></label></div><div class="setting" style="padding:8px 0"><div class="info"><b style="font-size:12px">USB 검사</b></div><label class="switch sm"><input type="checkbox"></label></div></div>`,
    examples: [
      { id: "sections", title: "설정 섹션", html: `
        <div class="stack" style="max-width:760px">
          <div class="page-head"><div><h2 class="title">외부 USB 차단</h2><p class="sub">POL-2041 · 전체 그룹 · 마지막 배포 2026-09-06</p></div><div class="actions"><button type="button" class="btn md secondary">복제</button><button type="button" class="btn md primary">배포</button></div></div>
          <div class="notice warning" role="status"><span class="ico">${I("alert-triangle",20)}</span><div><b>배포되지 않은 변경 2건</b>변경 사항은 '배포'를 눌러야 에이전트에 적용됩니다.</div></div>
          <div class="settings-section">
            <div class="section-head">탐지</div>
            <div class="setting"><div class="info"><b>실시간 보호</b><span>파일 실행 시 즉시 검사합니다</span></div><div class="ctrl"><label class="switch"><input type="checkbox" role="switch" checked aria-label="실시간 보호"></label></div></div>
            <div class="setting"><div class="info"><b>탐지 민감도</b><span>높을수록 오탐 가능성이 커집니다</span></div><div class="ctrl"><div class="slider" style="min-width:220px"><div class="row"><label for="sens">민감도</label><span class="val">60</span></div><input id="sens" type="range" min="0" max="100" value="60" style="--p:60%"></div></div></div>
            <div class="setting"><div class="info"><b>탐지 시 동작</b><span>차단 후 관리자에게 알립니다</span></div><div class="ctrl"><div class="dropdown"><button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="false" style="min-width:180px">차단 후 알림</button></div></div></div>
          </div>
          <div class="settings-section">
            <div class="section-head">저장장치</div>
            <div class="setting"><div class="info"><b>USB 저장장치</b><span>미승인 장치 연결을 차단합니다</span></div><div class="ctrl"><label class="switch"><input type="checkbox" role="switch" checked aria-label="USB 저장장치 차단"></label></div></div>
            <div class="setting"><div class="info"><b>읽기 전용 허용</b><span>차단 대신 읽기만 허용</span></div><div class="ctrl"><label class="switch"><input type="checkbox" role="switch" aria-label="읽기 전용 허용"></label></div></div>
            <div class="setting"><div class="info"><b>허용 장치 시리얼</b><span>쉼표로 구분</span></div><div class="ctrl"><div class="field" style="min-width:280px"><input value="4C530001, 4C530002" aria-label="허용 장치 시리얼"></div></div></div>
          </div>
        </div>`, layout: "stack" },
    ],
    guideline: { do: ["즉시 적용되는 항목(Switch)과 저장이 필요한 입력을 섹션으로 나눕니다.", "미배포 변경은 상단 Notice 로 알립니다."], dont: ["설정 하나마다 저장 버튼을 두지 않습니다."] },
  },

  "severity": {
    status: "ready", react: ["SevBand","SevCell"], uses: ["tag", "indicator", "data-visual", "data-table"], css: [".sev-band", ".sev-cell", ".stack"],
    desc: "위협 심각도 5단계(Critical · High · Medium · Low · Info)를 화면 전반에서 일관되게 표현하는 규칙입니다. 색·태그·밴드·정렬 순서를 통일합니다.",
    thumb: `<div class="sev-band" style="width:200px"><i class="critical" style="flex:18"></i><i class="high" style="flex:27"></i><i class="medium" style="flex:30"></i><i class="low" style="flex:25"></i></div>`,
    principles: [["토큰", "--sev-critical(red/700) · --sev-high(red/500) · --sev-medium(amber/500) · --sev-low(sky/500) · --sev-info(gray/500)"], ["표현", "표·목록은 Tag, 요약은 밴드/도넛, 행 좌측 색 막대(.sev-cell)는 보조"], ["정렬", "항상 Critical → Info. 색만이 아니라 라벨을 함께"]],
    examples: [
      { id: "scale", title: "5단계 스케일", desc: "Tag 3가지 스타일 + 인디케이터. 같은 토큰을 공유합니다.", html: `
        <div class="stack" style="max-width:640px;gap:20px">
          <div style="display:flex;gap:8px;flex-wrap:wrap"><span class="tag critical">Critical</span><span class="tag high">High</span><span class="tag medium">Medium</span><span class="tag low">Low</span><span class="tag info">Info</span></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><span class="tag critical solid">Critical</span><span class="tag high solid">High</span><span class="tag medium solid">Medium</span><span class="tag low solid">Low</span><span class="tag info solid" style="background:var(--sev-info)">Info</span></div>
          <div style="display:flex;gap:16px;flex-wrap:wrap"><span class="sev-cell"><i class="critical"></i>Critical</span><span class="sev-cell"><i class="high"></i>High</span><span class="sev-cell"><i class="medium"></i>Medium</span><span class="sev-cell"><i class="low"></i>Low</span><span class="sev-cell"><i></i>Info</span></div>
        </div>`, layout: "left" },
      { id: "band", title: "분포 밴드", desc: "전체 대비 비율. flex 값이 비율, 아래 범례로 수치.", html: `
        <div class="stack" style="max-width:640px;gap:10px">
          <div class="sev-band" role="img" aria-label="Critical 18%, High 27%, Medium 30%, Low 25%"><i class="critical" style="flex:18"></i><i class="high" style="flex:27"></i><i class="medium" style="flex:30"></i><i class="low" style="flex:25"></i></div>
          <div class="chart-legend"><span><i style="background:var(--sev-critical)"></i>Critical <b>190</b></span><span><i style="background:var(--sev-high)"></i>High <b>285</b></span><span><i style="background:var(--sev-medium)"></i>Medium <b>316</b></span><span><i style="background:var(--sev-low)"></i>Low <b>263</b></span></div>
        </div>` },
      { id: "table", title: "표 안의 심각도", desc: "행 좌측 색 막대(.sev-cell) + Tag. 정렬 기본값은 심각도 내림차순.", html: `
        <div class="tbl-wrap" style="max-width:720px">
          <table class="tbl compact">
            <thead><tr><th class="sortable sorted desc" aria-sort="descending">심각도</th><th>이벤트</th><th>대상</th><th class="num">건수</th></tr></thead>
            <tbody>
              <tr><td><span class="sev-cell"><i class="critical"></i><span class="tag critical sm">Critical</span></span></td><td>랜섬웨어 행위 탐지</td><td>PC-2041</td><td class="num">3</td></tr>
              <tr><td><span class="sev-cell"><i class="high"></i><span class="tag high sm">High</span></span></td><td>알려진 악성코드 차단</td><td>PC-0932</td><td class="num">2</td></tr>
              <tr><td><span class="sev-cell"><i class="medium"></i><span class="tag medium sm">Medium</span></span></td><td>미승인 USB 연결</td><td>PC-1187</td><td class="num">1</td></tr>
              <tr><td><span class="sev-cell"><i class="low"></i><span class="tag low sm">Low</span></span></td><td>정책 동기화 지연</td><td>Server-03</td><td class="num">12</td></tr>
              <tr><td><span class="sev-cell"><i></i><span class="tag info sm">Info</span></span></td><td>스케줄 검사 완료</td><td>PC-0411</td><td class="num">48</td></tr>
            </tbody>
          </table>
        </div>` },
    ],
    guideline: { do: ["심각도 색은 --sev-* 토큰만 사용하고 다른 의미(상태·브랜드)에 재사용하지 않습니다.", "Info 는 회색으로 두어 위험 단계와 구분합니다."], dont: ["심각도를 색만으로 표현하지 않습니다(라벨 필수).", "Critical 과 High 에 서로 다른 계열 색을 쓰지 않습니다(같은 red 계열, 명도 차이)."] },
  },
};

if (typeof module !== "undefined" && module.exports) module.exports = PATTERNS;
