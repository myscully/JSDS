/* =========================================================
   data.js — 사이트 구조 · 제품 컬러 · 버전 · Changelog
   컴포넌트/패턴 상세는 components.data.js / patterns.data.js
   ========================================================= */
const FIGMA = "https://www.figma.com/design/ngyAZOP9Icjzw9KWyl4RdV";
const VERSION = "v0.6";
/* 사이드바·헤더에 N 배지를 붙일 페이지 */
const NEW = new Set(["foundations/colors", "foundations/icons", "resources/design-token"]);
const SITE = {
  home: { title: "Home", desc: "지란지교시큐리티 디자인 시스템 소개", pages: { overview: "Overview", about: "About", principles: "UX Principles" } },
  foundations: { title: "Foundations", desc: "모든 디자인 요소의 기반이 되는 가장 원자적인 단위", pages: { overview: "Overview" }, groups: [["Base material", [["colors", "Colors"], ["elevation", "Elevation"], ["grid", "Grid"], ["icons", "Icons"], ["typography", "Typography"]]]] },
  components: { title: "Components", desc: "사용자 인터페이스를 구성하는 재사용 가능한 요소", isNew: true, pages: { overview: "Overview" }, groups: [
    ["", [["accordion", "Accordion"], ["breadcrumb", "Breadcrumb"], ["button", "Button"], ["card", "Card"], ["data-visual", "Data Visual"], ["date-picker", "Date Picker"], ["divider", "Divider"], ["dropdown", "Dropdown"], ["indicator", "Indicator"], ["item-tile", "Item Tile"], ["list", "List"], ["loading", "Loading"], ["navigation", "Navigation"], ["notification", "Notification"], ["pagination", "Pagination"], ["popup", "Popup"]]],
    ["Selection Controls", [["checkbox", "Checkbox"], ["chip", "Chip"], ["radio-button", "Radio Button"], ["select-button", "Select Button"]]],
    ["", [["search", "Search"], ["slider", "Slider"], ["switch", "Switch"], ["tab", "Tab"]]],
    ["Table", [["data-table", "Data Table"], ["table", "Table"]]],
    ["", [["tag", "Tag"], ["text-field", "Text Field"], ["tooltip", "Tooltip"], ["top-navigation", "Top Navigation"]]],
  ] },
  patterns: { title: "Patterns", desc: "반복되는 업무 단위와 문제를 해결하는 가이드라인", isNew: true, pages: { overview: "Overview" }, groups: [
    ["Common UI", [["input-form", "입력 폼"], ["terms-agreement", "약관 동의"], ["empty-state", "빈 화면"], ["notes", "유의사항"]]],
    ["Service Pattern", [["onboarding", "온보딩"], ["search", "검색"], ["system-status", "시스템 상태"]]],
    ["Security Console", [["dashboard", "대시보드"], ["log-viewer", "로그 뷰어"], ["policy-settings", "정책 설정"], ["severity", "심각도 표시"]]],
  ] },
  resources: { title: "Resources", desc: "라이브러리, 토큰, 변경 이력", pages: { react: "React Package", "design-token": "Design Token", figma: "Figma Library", tokens: "Token Download", changelog: "Changelog", contribution: "Contribution" } },
};
/* 제품별 Accent(메인 컬러) 프리셋. 실제 제품 컬러로 교체 */
const PRODUCTS = [
  { key: "sample", name: "예시 · 네이비", hex: "#0B4171", note: "기본 예시 값" },
  { key: "brand", name: "Brand #FF7F00", hex: "#FF7F00", note: "지란지교시큐리티 브랜드. 브랜드 강조 시" },
  { key: "product-a", name: "제품 A", hex: "#2563EB", note: "제품 컬러로 교체" },
  { key: "product-b", name: "제품 B", hex: "#0F766E", note: "제품 컬러로 교체" },
  { key: "product-c", name: "제품 C", hex: "#7C3AED", note: "제품 컬러로 교체" },
];
const CHANGELOG = [
  ["v0.6", "2026-09-09", "Foundations 재편(Web Desktop): Overview + Base material(Colors · Elevation · Grid · Icons · Typography). Colors 는 Semantic/Atomic 탭(Primary·Label·Fill·Line·Background·Static·Inverse·Interaction·Status·Severity·Brand·Material, Light/Dark 값 표시), Elevation 은 Shadow type(Normal/Spread) · Composition · Style 표(xs~xl 토큰 신설, --shadow-1~3 은 별칭), Grid 는 Artboard · Breakpoint · Spacing · Layout(12 컬럼), Icons 는 검색·Outline/Filled 갤러리, Typography 는 Basic · Word break · Style 표(행간 px, Pretendard 권장 자간). Radius · Motion · Accessibility · 토큰 원본은 Resources › Design Token 으로 이동. Semantic 토큰 추가(fill/line/static/interaction/dimmer/text-strong/border-subtle/accent-inverse/sev-*-bg), Primitive 팔레트 전 단계 보강."],
  ["v0.5", "2026-09-08", "React 컴포넌트 패키지 @jiran/ds-react 추가(_react/): 30개 컴포넌트·패턴 래퍼를 실제 React 컴포넌트로 구현(동작·접근성 포함), 사이트 React 탭을 패키지 사용 코드로 전환(예제 118개, 사이트 HTML 과 구조 일치 테스트). 아이콘을 assets/icons(Tabler) 로 통일하고 Iconography 갤러리 구성. Resources › React Package 페이지 추가. 사이트 프리뷰 전체를 실제로 동작하게 하는 순수 JS 동작 스크립트 assets/ds.js 추가(드롭다운·탭·페이지네이션·달력·표 정렬/선택·토스트·팝업 등) — HTML+CSS 로 쓰는 제품은 이 파일 한 줄로 같은 동작."],
  ["v0.4", "2026-09-07", "코드 중심 가이드로 전환: 컴포넌트 30개·패턴 11개 전부 라이브 프리뷰 + 복사 가능한 코드(HTML+CSS / React) + Props 표. 컴포넌트 CSS 를 style.css 의 'Live component samples' 블록으로 정리하고 페이지별로 자동 추출. Foundations 에 토큰 복사 블록 추가. 소스를 _build/data·components·patterns·lib·render·app.src 로 분리. Figma Components/Patterns 페이지에 코드 스펙과 동일한 변형 프레임 배치."],
  ["v0.3", "2026-09-04", "IA·레이아웃 재구성: 상단 메뉴(Home·Foundations·Components·Patterns·Resources) + 섹션 서브메뉴, Desktop 기준 컴포넌트 문서 템플릿(Anatomy·Type·State·Spec·Guideline). 컬러 모델을 Gray 기반 + Accent(제품 메인 컬러 슬롯) + Brand(#FF7F00)로 정리."],
  ["v0.2", "2026-09-03", "디자인 가이드라인 반영: 무채색 slate, 상태색(에메랄드/앰버/로즈), 여백 1.3~1.5배, 보더 최소화·그림자 구획, 테이블 행 높이·호버·정렬 아이콘."],
  ["v0.1", "2026-09-03", "틀 생성: Figma 파일(페이지·변수·텍스트/이펙트 스타일·섹션) 및 제품가이드 골격."],
];
if (typeof module !== "undefined" && module.exports) module.exports = { FIGMA, VERSION, NEW, SITE, PRODUCTS, CHANGELOG };
