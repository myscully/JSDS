/* =========================================================
   data.js — 사이트 구조 · 제품 컬러 · 버전 · Changelog
   컴포넌트/패턴 상세는 components.data.js / patterns.data.js
   ========================================================= */
const FIGMA = "https://www.figma.com/design/ngyAZOP9Icjzw9KWyl4RdV";
const VERSION = "v0.9";
/* 사이드바·헤더에 N 배지를 붙일 페이지 */
const NEW = new Set(["home/getting-started", "foundations/colors", "foundations/icons", "resources/design-token", "components/select", "foundations/writing", "foundations/interaction", "components/combobox", "components/side-panel", "components/tree", "components/notification-center"]);
const SITE = {
  home: { title: "Home", desc: "지란지교시큐리티 디자인 시스템 소개", pages: { overview: "Overview", "getting-started": "Getting started", about: "About", principles: "UX Principles" } },
  foundations: { title: "Foundations", desc: "모든 디자인 요소의 기반이 되는 가장 원자적인 단위", pages: { overview: "Overview" }, groups: [["Base material", [["colors", "Colors"], ["elevation", "Elevation"], ["grid", "Grid"], ["icons", "Icons"], ["interaction", "Interaction"], ["typography", "Typography"], ["writing", "Writing"]]]] },
  components: { title: "Components", desc: "사용자 인터페이스를 구성하는 재사용 가능한 요소", isNew: true, pages: { overview: "Overview" }, groups: [
    ["", [["accordion", "Accordion"], ["avatar", "Avatar"], ["breadcrumb", "Breadcrumb"], ["button", "Button"], ["card", "Card"], ["code", "Code"], ["copy-field", "Copy Field"], ["data-visual", "Data Visual"], ["date-picker", "Date Picker"], ["divider", "Divider"], ["dropdown", "Dropdown"], ["empty-state", "Empty State"], ["file-upload", "File Upload"], ["form", "Form"], ["indicator", "Indicator"], ["item-tile", "Item Tile"], ["link", "Link"], ["list", "List"], ["loading", "Loading"], ["navigation", "Navigation"], ["notification", "Notification"], ["notification-center", "Notification Center"], ["number-input", "Number Input"], ["page-header", "Page Header"], ["pagination", "Pagination"], ["popup", "Popup"]]],
    ["Selection Controls", [["checkbox", "Checkbox"], ["chip", "Chip"], ["combobox", "Combobox"], ["radio-button", "Radio Button"], ["select-button", "Select Button"]]],
    ["", [["search", "Search"], ["select", "Select"], ["side-panel", "Side Panel"], ["slider", "Slider"], ["steps", "Steps"], ["switch", "Switch"], ["tab", "Tab"]]],
    ["Table", [["data-table", "Data Table"], ["table", "Table"]]],
    ["", [["tag", "Tag"], ["text-field", "Text Field"], ["time-picker", "Time Picker"], ["tooltip", "Tooltip"], ["top-navigation", "Top Navigation"], ["tree", "Tree"]]],
  ] },
  patterns: { title: "Patterns", desc: "반복되는 업무 단위와 문제를 해결하는 가이드라인", isNew: true, pages: { overview: "Overview" }, groups: [
    ["Common UI", [["input-form", "입력 폼"], ["terms-agreement", "약관 동의"], ["notes", "유의사항"], ["error-pages", "오류 · 권한 없음"], ["danger-confirm", "위험 작업 확인"], ["import-export", "가져오기 · 내보내기"], ["bulk-progress", "일괄 작업 진행"]]],
    ["Service Pattern", [["onboarding", "온보딩"], ["search", "검색"], ["system-status", "시스템 상태"], ["sign-in", "로그인 · 세션"], ["report-schedule", "보고서 · 예약 발송"]]],
    ["Security Console", [["dashboard", "대시보드"], ["log-viewer", "로그 뷰어"], ["policy-settings", "정책 설정"], ["severity", "심각도 표시"], ["detail", "상세 화면"], ["roles", "권한 · 역할"], ["secrets", "API 키 · 비밀값"], ["incident", "사고 처리"], ["audit-log", "감사 로그 · 변경 이력"], ["alert-rules", "알림 규칙"]]],
  ] },
  /* Templates(2026-11-18) — 컴포넌트와 패턴으로 조립한 콘솔 화면 전체. 글은 templates.data.js, 화면은 templates.build.js */
  templates: { title: "Templates", desc: "컴포넌트와 패턴으로 조립한 콘솔 화면 전체", isNew: true, pages: { overview: "Overview", login: "로그인", dashboard: "대시보드", list: "리스트", policy: "정책 설정", wizard: "위저드", "tabs-list": "탭이 있는 리스트", org: "조직도" } },
  resources: { title: "Resources", desc: "라이브러리, 토큰, 변경 이력", pages: { react: "React Package", "design-token": "Design Token", figma: "Figma Library", tokens: "Token Download", changelog: "Changelog", contribution: "Contribution" } },
};
/* 제품 색 팔레트(2026-11-14 사람의 결정 · 2026-11-17 이름을 역할로 바꾸고 제품3 #10367D 을 더함 — 일곱) — 1.0 전에는 이 일곱 가지만 쓴다. 1.0 뒤에는 사용자가 색을 더하거나 고치는 팔레트를 준다.
   사이트(app.src.js) · React(theme.ts PRODUCT_COLORS — 테스트가 이 표와 같은지 대조) · contrast 맥락 · verify 가 모두 이 표를 읽는다.
   - kind: base(CSS 기본 = Blue 램프, 주입 없음) · ramp(hex 로 --prod-40~60 을 만든다) · neutral(중립 CSS 블록) · ai(ramp + 넓은 면 그라데이션)
   - **제약: 흰 글자가 4.5 를 넘는 색이어야 한다** — Brand 면 위 글자는 늘 흰색이고 verify 가 검사한다.
     넘지 못하는 색은 exception 에 이유를 적어야 한다(사람의 결정만 — 비우면 verify 가 막는다). 그 맥락의 brand 쌍은 contrast 가 advisory 로 보고한다
   - 상태색과 겹쳐도 제품 색을 그대로 쓴다 — 예전에는 색상환 15° 안이면 중립으로 바꿨는데(STATUS_HUES) 제품의 독립성을 위해 걷어냈다
   - neutralFocus: 입력 포커스 링을 중립으로 — 빨강은 오류 링, 주황은 경고색과 헷갈리지 않게(사람의 결정)
   - gradient: AI 의 넓은 브랜드 면(주 버튼 · Banner) 그라데이션 두 끝 — 램프 이름. 면 위 흰 글자는 끝마다 4.5 를 verify 가 잰다
   name 은 메뉴 · Colors 표에 보이는 이름(역할)이고 key 는 API(data-accent · applyProductColor)라 색 이름 그대로 둔다(2026-11-17 — 키는 바꾸지 않음).
   시안은 #00AAB6(흰 글자 2.83)에서 같은 색상 · 채도로 밝기만 낮춘 값이다 */
const PRODUCTS = [
  { key: "blue", name: "기본", kind: "base", hex: "#0066FF" },
  { key: "red", name: "제품1", kind: "ramp", hex: "#C30D2A", neutralFocus: true },
  { key: "cyan", name: "제품2", kind: "ramp", hex: "#00828B" },
  { key: "navy", name: "제품3", kind: "ramp", hex: "#10367D" },
  { key: "orange", name: "브랜드", kind: "ramp", hex: "#FF7F00", neutralFocus: true,
    exception: "회사 색(--company-mark)을 제품 색으로 그대로 쓴다 — 흰 글자와 제품 색 글자가 4.5 에 못 미치는 것을 알고 정한 사람의 결정(2026-11-14)" },
  { key: "neutral", name: "중립", kind: "neutral", hex: "#1B1C1E" },
  { key: "ai", name: "AI", kind: "ai", hex: "#6541F2",
    gradient: { rest: ["purple-40", "violet-45"], strong: ["purple-30", "violet-40"], heavy: ["purple-30", "violet-30"] } },
];
const CHANGELOG = [
  ["v0.9", "2026-11-15", "컴포넌트를 하나씩 정비하고 공통 정책을 세웠습니다. Foundations 에 Interaction · Writing 페이지를 더하고, 컴포넌트 페이지를 정의 · 고르기 표 · 예제 · Rules · Spec · Props · Usage 순서로 맞췄습니다. 새 컴포넌트는 Combobox · Side Panel · Steps · Form · Empty State · Page Header · Avatar · Link · File Upload · Code · Copy Field · Number Input · Time Picker · Tree · Notification Center 입니다. 입력 검증, 표의 밀도와 행 펼침, 기간 선택과 시각 입력, 글자 크기 체계와 텍스트 스타일 19단계, 제품 색 팔레트 여섯, 한 톤으로 맞춘 Data Visual 세트를 더했습니다. 패턴은 컴포넌트 페이지와 같은 순서로 맞추고 정비한 컴포넌트로 다시 지었으며, 상세 화면 · 권한과 역할 · API 키와 비밀값 · 사고 처리 · 오류와 권한 없음 · 위험 작업 확인 · 가져오기와 내보내기 · 로그인과 세션 · 일괄 작업 진행 · 보고서와 예약 발송 · 감사 로그와 변경 이력 · 알림 규칙 패턴을 더했습니다. 마지막으로 전체 코드를 점검해 오류와 쓰지 않는 코드를 정리하고, 모든 페이지의 설명을 지금 동작에 맞게 다시 썼습니다."],
  ["v0.8","2026-10-20","컬러 시스템을 전면 개편했습니다. 의미 토큰을 여섯 그룹(foreground · background · surface · line · effect · static)으로 값과 이름까지 바꾸고, Atomic 램프 13개는 숫자가 클수록 밝은 체계로 통일했습니다. Brand 는 제품이 넣는 다섯 단계 색이고, 제품 색 위의 흰 글자가 4.5 대비를 넘어야 합니다. Colors 페이지를 Semantic 과 Atomic 탭으로 다시 짜고 브랜드 역할 맵을 그 안으로 합쳤습니다. React 패키지 0.8.0 은 깨지는 변경이라 마이그레이션 문서를 함께 냈습니다."],
  ["v0.6","2026-09-09","Foundations 를 Overview 와 Base material(Colors · Elevation · Grid · Icons · Typography)로 다시 짰습니다. Colors 는 Semantic 과 Atomic 탭에 라이트 · 다크 값을 보여 주고, Elevation 은 그림자 종류와 단계 표를, Grid 는 아트보드 · 브레이크포인트 · 간격 · 12 컬럼 레이아웃을, Icons 는 검색되는 Outline · Filled 갤러리를, Typography 는 기본 규칙 · 줄바꿈 · 스타일 표를 담았습니다. Radius · Motion · Accessibility · 토큰 원본은 Resources › Design Token 으로 옮겼습니다."],
  ["v0.5","2026-09-08","React 컴포넌트 패키지를 더했습니다. 컴포넌트와 패턴 30개를 동작과 접근성까지 갖춘 React 컴포넌트로 만들고, 사이트의 React 탭을 패키지를 쓰는 코드로 바꿨습니다. 사이트 HTML 과 React 의 구조가 같은지 테스트합니다. 아이콘을 한 세트로 통일하고 Resources › React Package 페이지를 열었습니다. 사이트의 모든 미리보기를 실제로 동작하게 하는 순수 JS 스크립트도 더했습니다. HTML+CSS 로 쓰는 제품은 이 파일 하나로 같은 동작을 얻습니다."],
  ["v0.4","2026-09-07","코드 중심 가이드로 바꿨습니다. 컴포넌트 30개와 패턴 11개에 라이브 미리보기, 복사할 수 있는 HTML+CSS · React 코드, Props 표를 붙였습니다. 컴포넌트 CSS 는 한 블록으로 모아 페이지마다 필요한 부분만 뽑아 보여 줍니다. Foundations 에 토큰 복사 블록을 더하고, Figma 의 Components · Patterns 페이지에도 코드 스펙과 같은 변형 프레임을 놓았습니다."],
  ["v0.3","2026-09-04","정보 구조와 레이아웃을 다시 짰습니다. 상단 메뉴(Home · Foundations · Components · Patterns · Resources)와 섹션 메뉴를 두고, 데스크톱 기준의 컴포넌트 문서 틀을 만들었습니다. 컬러 모델은 회색 기반에 제품 색 자리와 회사 브랜드 색을 더한 구성으로 정리했습니다."],
  ["v0.2","2026-09-03","디자인 가이드라인을 반영했습니다. 무채색 바탕과 상태색을 정하고, 여백을 넉넉히 하며, 테두리를 줄이고 그림자로 구획을 나눴습니다. 표의 행 높이 · hover · 정렬 아이콘을 정했습니다."],
  ["v0.1","2026-09-03","틀을 만들었습니다. Figma 파일의 페이지 · 변수 · 텍스트와 이펙트 스타일 · 섹션, 그리고 제품 가이드의 골격입니다."],
];
if (typeof module !== "undefined" && module.exports) module.exports = { FIGMA, VERSION, NEW, SITE, PRODUCTS, CHANGELOG };
