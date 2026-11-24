/* =========================================================
   templates.data.js — 템플릿 일곱(2026-11-18). 컴포넌트와 패턴으로 조립한 콘솔 화면 전체
   shape: { desc, choose:[[k,v]], uses:[컴포넌트 key…], patterns:[패턴 key…], principles:[[k,v]] }
   - 화면 HTML 은 templates.build.js 가 만든다(templates/screen/<key>.html). 여기에는 문서 페이지의 글만 둔다.
   - 문서 페이지 구성: 정의 · 고르기 표(언제 쓰는가 · 비슷한 템플릿) · 미리보기 · Composition · Rules.
   - 본문 문구는 컴포넌트 · 패턴과 같은 규칙 — 합니다체, 토큰 · 코드 · 날짜 · 결정 이력 없음(빌드가 검사).
   - uses 는 화면이 실제로 쓰는 컴포넌트와 같아야 한다(빌드가 화면 HTML 에서 잰다).
   - 순서는 data.js SITE.templates 와 같다. 브라우저(render.js)와 Node(build · verify) 둘 다 읽는다.
   ========================================================= */
const TEMPLATES = {
  login: {
    desc: "관리 콘솔에 들어오는 첫 화면입니다. 내비 없이 회색 바탕 가운데에 카드 하나를 두고, 로그인 뒤 2단계 인증 코드를 받습니다.",
    line: "내비 없이 가운데 카드 하나. 로그인을 누르면 2단계 인증 코드 단계로 넘어갑니다.",
    choose: [
      ["언제 쓰는가", "이메일과 비밀번호로 콘솔에 들어오고, 이어서 인증 앱의 코드로 한 번 더 확인할 때 씁니다."],
      ["비슷한 템플릿", "로그인 뒤 처음 보는 화면은 대시보드입니다."],
    ],
    uses: ["button", "checkbox", "form", "link", "text-field"],
    patterns: ["sign-in"],
    principles: [
      ["화면", "제품 로고와 카드, 아래 저작권 줄만 둡니다. 메뉴와 검색은 로그인한 뒤에 보입니다."],
      ["두 단계", "비밀번호가 맞으면 같은 자리의 카드가 2단계 인증으로 바뀝니다. 주소는 그대로입니다."],
      ["포커스", "코드 단계로 넘어가면 첫 번째 칸으로 포커스가 옮겨 바로 입력할 수 있습니다."],
      ["실패", "로그인에 실패하면 카드 위에 이유와 다음 행동을 알립니다. 입력한 이메일은 지우지 않습니다."],
    ],
  },
  dashboard: {
    desc: "로그인한 운영자가 가장 먼저 보는 화면입니다. 지금 상태를 숫자 넷으로 요약하고, 추이와 분포, 최근 이벤트를 아래로 이어 둡니다.",
    line: "KPI 넷, 추이 · 분포 차트, 비교 · 목표 차트, 최근 이벤트 표. 대시보드 패턴을 그대로 담았습니다.",
    choose: [
      ["언제 쓰는가", "여러 지표를 한눈에 훑고, 이상한 곳을 눌러 자세한 목록으로 들어가게 할 때 씁니다."],
      ["비슷한 템플릿", "한 종류의 기록을 찾고 고르는 일이 주된 일이면 리스트입니다."],
    ],
    uses: ["avatar", "button", "card", "data-visual", "divider", "dropdown", "indicator", "link", "navigation", "notification-center", "page-header", "search", "select-button", "table", "tooltip", "top-navigation"],
    patterns: ["dashboard"],
    principles: [
      ["틀", "위에 상단 바, 왼쪽에 사이드 내비, 오른쪽에 본문을 두고 본문만 스크롤합니다."],
      ["순서", "요약 숫자, 추이와 분포, 비교와 목표, 최근 이벤트 순으로 위에서 아래로 갑니다."],
      ["카드 높이", "같은 줄의 카드는 머리와 본문 높이를 맞춥니다."],
      ["이동", "카드의 전체 보기와 표의 링크는 해당 목록 화면으로 갑니다."],
      ["기간", "머리 오른쪽 Select Button 하나로 화면 전체의 기간을 고릅니다. 다른 조건으로 좁혀 들여다보는 일은 분석 화면이 맡습니다."],
    ],
  },
  analytics: {
    desc: "기간과 조건을 바꿔 가며 탐지를 들여다보고 결과를 내보내는 화면입니다. 맨 위 필터 한 줄이 아래 숫자와 차트, 표에 모두 같이 걸립니다.",
    line: "필터 한 줄, KPI 넷, 심각도별 추이, 유형 · 경로 차트, 상세 표. 분석 · 리포트 패턴을 그대로 담았습니다.",
    choose: [
      ["언제 쓰는가", "지난 기간과 견주거나 조건으로 좁혀 원인을 찾고, 그 결과를 보고서로 내보내야 할 때 씁니다."],
      ["비슷한 템플릿", "기간만 골라 전체를 훑는 첫 화면은 대시보드입니다."],
    ],
    uses: ["avatar", "button", "card", "combobox", "data-visual", "date-picker", "divider", "dropdown", "indicator", "navigation", "notification-center", "page-header", "search", "table", "tooltip", "top-navigation"],
    patterns: ["analytics"],
    principles: [
      ["틀", "위에 상단 바, 왼쪽에 사이드 내비, 오른쪽에 본문을 두고 본문만 스크롤합니다."],
      ["필터 한 줄", "기간을 맨 앞에 두고 필터는 모든 카드 위에 한 줄로 둡니다. 카드 안에는 두지 않습니다."],
      ["같은 조각", "조건을 바꾸면 KPI 와 차트, 표가 같은 조건으로 다시 그려져 합계가 어디서나 같습니다."],
      ["순서", "요약 숫자, 주 차트, 보조 차트 둘, 상세 표 순으로 위에서 아래로 갑니다."],
      ["내보내기", "지금 걸린 조건 그대로 내보냅니다. 버튼은 화면 머리 오른쪽에 하나만 둡니다."],
    ],
  },
  list: {
    desc: "한 종류의 기록을 찾고 골라서 처리하는 화면입니다. 보안 이벤트 목록을 예로, 검색과 필터 줄, 선택 표와 액션 바, 페이지 이동을 둡니다.",
    line: "보안 이벤트 목록. 검색 · 심각도 · 기간 툴바, 선택 표와 액션 바, 행 동작 메뉴, 페이지 이동.",
    choose: [
      ["언제 쓰는가", "많은 행을 조건으로 좁히고, 여러 행을 골라 한꺼번에 처리할 때 씁니다."],
      ["비슷한 템플릿", "같은 목록을 상태별로 나눠 보면 탭이 있는 리스트입니다."],
    ],
    uses: ["avatar", "breadcrumb", "button", "checkbox", "chip", "combobox", "data-table", "date-picker", "divider", "dropdown", "indicator", "link", "navigation", "notification-center", "page-header", "pagination", "search", "tag", "tooltip", "top-navigation"],
    patterns: ["search", "log-viewer", "severity"],
    principles: [
      ["툴바", "검색칸이 남는 폭을 맞추고, 심각도와 기간을 같은 줄에 둡니다."],
      ["적용된 필터", "결과 수와 적용된 필터 칩을 툴바 아래 한 줄에 두고, 필터 초기화를 함께 둡니다."],
      ["선택", "액션 바는 표 위에 늘 있고, 고른 행이 없으면 버튼이 꺼집니다."],
      ["행 동작", "행마다 더 보기 메뉴 하나에 동작을 모읍니다. 행 전체를 누르는 동작은 두지 않습니다."],
      ["정렬", "기본은 최신 시간이 위입니다. 정렬한 머리글은 진한 글자와 화살표로 보입니다."],
    ],
  },
  policy: {
    desc: "정책 하나의 설정을 섹션으로 나눠 고치는 화면입니다. 적용 대상은 오른쪽에서 열리는 사이드 패널에서 고릅니다.",
    line: "설정 섹션과 적용 대상 Side Panel. 정책 설정 패턴을 그대로 담았습니다.",
    choose: [
      ["언제 쓰는가", "항목이 많은 설정을 주제별로 묶어 한 화면에서 고치고 한 번에 배포할 때 씁니다."],
      ["비슷한 템플릿", "정해진 순서대로 입력해야 하면 위저드입니다."],
    ],
    uses: ["avatar", "breadcrumb", "button", "combobox", "copy-field", "divider", "dropdown", "indicator", "link", "navigation", "notification", "notification-center", "number-input", "page-header", "search", "select", "side-panel", "slider", "switch", "tag", "text-field", "time-picker", "tooltip", "top-navigation", "tree"],
    patterns: ["policy-settings", "input-form"],
    principles: [
      ["섹션", "설정을 주제마다 제목 있는 섹션으로 나누고, 섹션마다 설명 한 줄을 둡니다."],
      ["배포", "고친 내용은 머리글의 배포 버튼 하나로 에이전트에 보냅니다. 섹션마다 따로 저장하지 않고, 배포하지 않은 변경은 위 안내에 건수로 보입니다."],
      ["적용 대상", "적용 대상은 사이드 패널의 트리에서 고르고, 고른 부서는 설정 화면에 태그로 보입니다."],
      ["사이드 패널", "패널이 열린 동안 뒤 화면은 누를 수 없고, 닫으면 연 버튼으로 포커스가 돌아옵니다."],
    ],
  },
  wizard: {
    desc: "정해진 순서대로 입력해 하나의 작업을 끝내는 화면입니다. 정책 배포를 예로, 대상과 정책, 일정, 검토의 네 단계를 둡니다.",
    line: "정책 배포 4단계. 단계마다 입력을 검사하고, 마지막에 배포 내용을 확인합니다.",
    choose: [
      ["언제 쓰는가", "앞 단계의 선택이 다음 단계를 정하고, 마지막에 한 번에 실행해야 할 때 씁니다."],
      ["비슷한 템플릿", "순서 없이 고치는 설정이면 정책 설정입니다."],
    ],
    uses: ["avatar", "breadcrumb", "button", "card", "combobox", "date-picker", "divider", "dropdown", "form", "indicator", "link", "navigation", "notification", "notification-center", "page-header", "radio-button", "search", "steps", "switch", "text-field", "tooltip", "top-navigation"],
    patterns: ["onboarding", "input-form"],
    principles: [
      ["단계", "단계는 넷이고 이름은 짧은 명사로 씁니다."],
      ["다음", "다음을 누르면 그 단계의 입력을 검사하고, 막히면 첫 오류로 포커스를 옮깁니다."],
      ["입력 유지", "이전 단계로 돌아가도 입력한 값은 남습니다."],
      ["마지막 단계", "마지막 단계에서 배포 내용을 모아 보여 주고, 다음 대신 완료 버튼을 둡니다."],
    ],
  },
  "tabs-list": {
    desc: "한 목록을 상태별 탭으로 나눠 보는 화면입니다. 에이전트 목록을 전체, 온라인, 오프라인, 업데이트 필요의 네 탭으로 나눕니다.",
    line: "에이전트 목록을 상태 탭 넷으로 나눕니다. 탭마다 툴바 · 표 · 페이지 이동이 있습니다.",
    choose: [
      ["언제 쓰는가", "운영자가 상태마다 따로 처리하는 목록을 자주 오갈 때 씁니다."],
      ["비슷한 템플릿", "상태가 여러 필터 가운데 하나일 뿐이면 리스트입니다."],
    ],
    uses: ["avatar", "breadcrumb", "button", "data-table", "divider", "dropdown", "indicator", "link", "navigation", "notification-center", "page-header", "pagination", "search", "select", "tab", "tooltip", "top-navigation"],
    patterns: ["search"],
    principles: [
      ["탭", "탭에는 이름만 두고 건수는 목록 아래 건수 줄이 보여 줍니다. 고른 탭은 제품 색 글자와 밑줄로 드러나고, 탭을 옮겨도 각 탭의 검색어와 필터는 남습니다."],
      ["탭마다", "탭 아래 툴바와 표, 페이지 이동을 탭마다 따로 둡니다."],
      ["주 동작", "화면의 주 동작은 머리글 오른쪽에 하나만 둡니다."],
    ],
  },
  org: {
    desc: "조직을 트리로 보고 부서를 관리하는 화면입니다. 왼쪽에서 부서를 고르면 오른쪽에 부서 정보와 구성원이 바뀝니다.",
    line: "왼쪽 부서 트리, 오른쪽 부서 정보와 구성원. 부서 추가 · 이름 바꾸기 · 이동 · 삭제를 대화상자로 합니다.",
    choose: [
      ["언제 쓰는가", "계층이 있는 대상을 고르고, 고른 대상의 정보와 하위 목록을 함께 볼 때 씁니다."],
      ["비슷한 템플릿", "계층 없이 고른 행의 정보만 보면 리스트입니다."],
    ],
    uses: ["avatar", "breadcrumb", "button", "card", "copy-field", "divider", "dropdown", "indicator", "link", "navigation", "notification-center", "page-header", "popup", "search", "select", "table", "tag", "text-field", "tooltip", "top-navigation", "tree"],
    patterns: ["roles", "danger-confirm"],
    principles: [
      ["두 칸", "왼쪽에 검색이 있는 부서 트리, 오른쪽에 고른 부서의 정보 카드와 구성원 표를 둡니다."],
      ["고르기", "트리에서 부서를 고르면 오른쪽만 바뀌고 트리의 펼침은 그대로입니다."],
      ["대화상자", "부서 추가와 이름 바꾸기, 이동은 대화상자에서 하고 끝나면 짧게 알립니다."],
      ["삭제", "부서 삭제는 위험 확인 대화상자로 묻고, 구성원이 어디로 가는지 함께 알립니다."],
    ],
  },
  settings: {
    desc: "내 계정의 정보를 보고 고치는 설정 화면입니다. 왼쪽 설정 메뉴에서 항목을 고르고, 오른쪽 카드마다 편집을 눌러 패널에서 바꿉니다.",
    line: "왼쪽 설정 메뉴, 오른쪽 프로필 · 개인 정보 · 소속 카드. 편집은 패널에서, 계정 삭제는 위험 확인으로 합니다.",
    choose: [
      ["언제 쓰는가", "한 사람이나 한 대상의 정보를 묶음별 카드로 보여 주고, 묶음 단위로 고치게 할 때 씁니다."],
      ["비슷한 템플릿", "여러 설정 값을 한 화면에서 켜고 끄며 바로 바꾸면 정책 설정입니다."],
    ],
    uses: ["avatar", "breadcrumb", "button", "card", "divider", "dropdown", "indicator", "navigation", "notification-center", "page-header", "popup", "search", "side-panel", "text-field", "tooltip", "top-navigation"],
    patterns: ["danger-confirm"],
    principles: [
      ["두 칸", "왼쪽에 설정 메뉴, 오른쪽에 고른 메뉴의 내용을 둡니다. 설정 메뉴는 아이콘 없이 이름만 적고, 지금 보는 항목을 표시합니다."],
      ["카드", "정보는 묶음마다 카드 하나로 나누고, 카드 머리에 그 묶음의 편집 버튼을 하나 둡니다."],
      ["두 줄 값", "카드 안 정보는 두 칸으로 나눠 라벨을 위에, 값을 아래에 둡니다. 긴 소개는 두 칸을 다 씁니다."],
      ["편집", "편집을 누르면 그 카드의 필드만 담은 패널이 열립니다. 저장하면 패널을 닫고 짧게 알립니다."],
      ["버리기", "고친 내용이 있는데 패널을 닫으면 버릴지 먼저 묻습니다."],
      ["계정 삭제", "계정 삭제는 메뉴 맨 아래 구분선 뒤에 빨간 글자로 둡니다. 누르면 위험 확인 대화상자가 열리고 계정 이메일을 입력해야 삭제됩니다."],
    ],
  },
};

if (typeof module !== "undefined" && module.exports) module.exports = TEMPLATES;
