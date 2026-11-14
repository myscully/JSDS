/* =========================================================
   data.js — 사이트 구조 · 제품 컬러 · 버전 · Changelog
   컴포넌트/패턴 상세는 components.data.js / patterns.data.js
   ========================================================= */
const FIGMA = "https://www.figma.com/design/ngyAZOP9Icjzw9KWyl4RdV";
const VERSION = "v0.8";
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
    ["Common UI", [["input-form", "입력 폼"], ["terms-agreement", "약관 동의"], ["notes", "유의사항"]]],
    ["Service Pattern", [["onboarding", "온보딩"], ["search", "검색"], ["system-status", "시스템 상태"]]],
    ["Security Console", [["dashboard", "대시보드"], ["log-viewer", "로그 뷰어"], ["policy-settings", "정책 설정"], ["severity", "심각도 표시"]]],
  ] },
  resources: { title: "Resources", desc: "라이브러리, 토큰, 변경 이력", pages: { react: "React Package", "design-token": "Design Token", figma: "Figma Library", tokens: "Token Download", changelog: "Changelog", contribution: "Contribution", wbs: "WBS" /* v1.0 공개(2026-11-30) 시 제거 — render.js "resources/wbs" · style.src.css .wbs 도 함께 */ } },
};
/* 제품 색 팔레트(2026-11-14 사람의 결정) — 1.0 전에는 이 여섯 가지만 쓴다. 1.0 뒤에는 사용자가 색을 더하거나 고치는 팔레트를 준다.
   사이트(app.src.js) · React(theme.ts PRODUCT_COLORS — 테스트가 이 표와 같은지 대조) · contrast 맥락 · verify 가 모두 이 표를 읽는다.
   - kind: base(CSS 기본 = Blue 램프, 주입 없음) · ramp(hex 로 --prod-40~60 을 만든다) · neutral(중립 CSS 블록) · ai(ramp + 넓은 면 그라데이션)
   - **제약: 흰 글자가 4.5 를 넘는 색이어야 한다** — Brand 면 위 글자는 늘 흰색이고 verify 가 검사한다.
     넘지 못하는 색은 exception 에 이유를 적어야 한다(사람의 결정만 — 비우면 verify 가 막는다). 그 맥락의 brand 쌍은 contrast 가 advisory 로 보고한다
   - 상태색과 겹쳐도 제품 색을 그대로 쓴다 — 예전에는 색상환 15° 안이면 중립으로 바꿨는데(STATUS_HUES) 제품의 독립성을 위해 걷어냈다
   - neutralFocus: 입력 포커스 링을 중립으로 — 빨강은 오류 링, 주황은 경고색과 헷갈리지 않게(사람의 결정)
   - gradient: AI 의 넓은 브랜드 면(주 버튼 · Banner) 그라데이션 두 끝 — 램프 이름. 면 위 흰 글자는 끝마다 4.5 를 verify 가 잰다
   시안은 #00AAB6(흰 글자 2.83)에서 같은 색상 · 채도로 밝기만 낮춘 값이다 */
const PRODUCTS = [
  { key: "blue", name: "파랑", group: "기본", kind: "base", hex: "#0066FF" },
  { key: "red", name: "빨강", group: "제품별", kind: "ramp", hex: "#C30D2A", neutralFocus: true },
  { key: "cyan", name: "시안", group: "제품별", kind: "ramp", hex: "#00828B" },
  { key: "orange", name: "주황", group: "Company", kind: "ramp", hex: "#FF7F00", neutralFocus: true,
    exception: "회사 색(--company-mark)을 제품 색으로 그대로 쓴다 — 흰 글자와 제품 색 글자가 4.5 에 못 미치는 것을 알고 정한 사람의 결정(2026-11-14)" },
  { key: "neutral", name: "중립", group: "중립", kind: "neutral", hex: "#1B1C1E" },
  { key: "ai", name: "AI", group: "AI", kind: "ai", hex: "#6541F2",
    gradient: { rest: ["purple-40", "violet-45"], strong: ["purple-30", "violet-40"], heavy: ["purple-30", "violet-30"] } },
];
const CHANGELOG = [
  ["v0.8", "2026-10-20", "컬러 시스템 전면 개편: 의미 토큰을 <code>--{그룹}-{하위}-{이름}</code> 여섯 그룹(foreground · background · surface · line · effect · static) 77개로 값·이름까지 교체하고, Atomic 램프 13개는 숫자가 클수록 밝은 체계로 통일. <code>brand</code> 는 제품이 주입하는 슬롯(<code>--prod-40~60</code> 다섯 단계)이고, 제품 색 위의 흰 글자가 4.5 를 넘어야 한다는 제약을 빌드가 검사합니다 — 종전의 밝은 제품 적응(<code>data-accent-light</code>)은 걷어냈습니다. Colors 페이지를 Semantic 27절 + Atomic 탭으로 재구성하고 브랜드 역할 맵을 그 안으로 합쳤습니다. React 패키지 0.8.0 은 깨지는 변경입니다(<code>_react/MIGRATION.md</code>)."],
  ["v0.6", "2026-09-09", "Foundations 재편(Web Desktop): Overview + Base material(Colors · Elevation · Grid · Icons · Typography). Colors 는 Semantic/Atomic 탭(Primary·Label·Fill·Line·Background·Static·Inverse·Interaction·Status·Severity·Brand·Material, Light/Dark 값 표시), Elevation 은 Shadow type(Normal/Spread) · Composition · Style 표(xs~xl 토큰 신설, --shadow-1~3 은 별칭), Grid 는 Artboard · Breakpoint · Spacing · Layout(12 컬럼), Icons 는 검색·Outline/Filled 갤러리, Typography 는 Basic · Word break · Style 표(행간 px, Pretendard 권장 자간). Radius · Motion · Accessibility · 토큰 원본은 Resources › Design Token 으로 이동. Semantic 토큰 추가(fill/line/static/interaction/dimmer/text-strong/border-subtle/accent-inverse/sev-*-bg), Primitive 팔레트 전 단계 보강."],
  ["v0.5", "2026-09-08", "React 컴포넌트 패키지 @jiran/ds-react 추가(_react/): 30개 컴포넌트·패턴 래퍼를 실제 React 컴포넌트로 구현(동작·접근성 포함), 사이트 React 탭을 패키지 사용 코드로 전환(예제 118개, 사이트 HTML 과 구조 일치 테스트). 아이콘을 assets/icons(Tabler) 로 통일하고 Iconography 갤러리 구성. Resources › React Package 페이지 추가. 사이트 프리뷰 전체를 실제로 동작하게 하는 순수 JS 동작 스크립트 assets/ds.js 추가(드롭다운·탭·페이지네이션·달력·표 정렬/선택·토스트·팝업 등) — HTML+CSS 로 쓰는 제품은 이 파일 한 줄로 같은 동작."],
  ["v0.4", "2026-09-07", "코드 중심 가이드로 전환: 컴포넌트 30개·패턴 11개 전부 라이브 프리뷰 + 복사 가능한 코드(HTML+CSS / React) + Props 표. 컴포넌트 CSS 를 style.css 의 'Live component samples' 블록으로 정리하고 페이지별로 자동 추출. Foundations 에 토큰 복사 블록 추가. 소스를 _build/data·components·patterns·lib·render·app.src 로 분리. Figma Components/Patterns 페이지에 코드 스펙과 동일한 변형 프레임 배치."],
  ["v0.3", "2026-09-04", "IA·레이아웃 재구성: 상단 메뉴(Home·Foundations·Components·Patterns·Resources) + 섹션 서브메뉴, Desktop 기준 컴포넌트 문서 템플릿(Anatomy·Type·State·Spec·Guideline). 컬러 모델을 Gray 기반 + Accent(제품 메인 컬러 슬롯) + Brand(#FF7F00)로 정리."],
  ["v0.2", "2026-09-03", "디자인 가이드라인 반영: 무채색 slate, 상태색(에메랄드/앰버/로즈), 여백 1.3~1.5배, 보더 최소화·그림자 구획, 테이블 행 높이·호버·정렬 아이콘."],
  ["v0.1", "2026-09-03", "틀 생성: Figma 파일(페이지·변수·텍스트/이펙트 스타일·섹션) 및 제품가이드 골격."],
];
if (typeof module !== "undefined" && module.exports) module.exports = { FIGMA, VERSION, NEW, SITE, PRODUCTS, CHANGELOG };
