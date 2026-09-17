# 지란지교시큐리티 Design System — 제품가이드 (정적 사이트 v0.6)

정적 HTML 사이트입니다. 폴더째 웹 서버(사내 Nginx/Apache, S3, GitHub Pages 등)에 올리면 동작합니다. 빌드 도구·서버 사이드 코드 없음.
모든 컴포넌트·패턴 페이지는 라이브 프리뷰 + 복사 가능한 코드(HTML+CSS / React) + Props 표로 구성됩니다. React 탭의 코드는 `_react/` 의 패키지 `@jiran/ds-react` 사용 코드이며, 테스트로 사이트 HTML 과 구조가 같음을 보장합니다.

> **이 폴더의 HTML/CSS/JS 는 생성물입니다.** `_build` 의 소스를 고친 뒤 재빌드하세요. 생성물을 직접 수정하면 다음 빌드에서 사라집니다.

처음이라면 **Home › Getting started**(https://myscully.github.io/JSDS/home/getting-started.html)에서 디자이너 · React 개발자 · HTML+CSS 개발자 별 사용법을 3~6단계로 확인하세요.

## 폴더 구조
- `index.html` — 첫 화면. 사이드 메뉴 없이 Home Overview 콘텐츠만 표시
- 상단 Home 탭 → `home/getting-started.html`. Home 섹션 사이드 메뉴는 Getting started · About · UX Principles (Overview 는 첫 화면에만 있음)
- `home/` `foundations/` `components/` `patterns/` `resources/` — 상단 메뉴 5개 섹션. 각 페이지가 개별 HTML 파일이며 섹션 폴더의 `index.html` 은 첫 페이지로 이동
- `assets/style.css` — 디자인 토큰(`:root`) + 문서 레이아웃 + **컴포넌트 CSS**('Live component samples' 블록). Light/Dark 지원. 제품에서는 이 파일 하나를 연결하거나 각 페이지의 "컴포넌트 CSS"만 복사
- `assets/app.js` — 테마 전환, Accent(제품 메인 컬러) 미리보기, 검색, 코드 복사/탭
- `assets/ds.js` — **컴포넌트 동작 스크립트**(순수 JS, 의존성 없음). 드롭다운·탭·페이지네이션·달력·테이블 정렬/선택·토스트 등. 사이트 프리뷰가 이 파일로 동작하며, HTML 을 복사해 쓰는 제품도 `<script src="assets/ds.js" defer>` 한 줄로 같은 동작을 얻습니다. React 제품은 불필요(@jiran/ds-react 가 동작 포함)
- `assets/fonts/PretendardVariable.woff2` — Pretendard Variable v1.3.9 (OFL)
- `assets/icons/outline` `assets/icons/filled` — Tabler Icons(MIT) 전체 세트(원본, 빌드가 건드리지 않음). 사이트가 쓰는 아이콘 목록은 `_build/icons.js` 의 `ICON_NAMES`, 갤러리는 Foundations › Icons

## 컬러 모델
- Gray Scale(무채색)이 바탕, `--accent-*` 가 제품 메인 컬러 슬롯. `--brand-*`(#FF7F00)는 로고·헤더 마크 등 회사 정체성 표기 전용이며 제품 UI Accent 선택지가 아님(브랜드 디자인 시스템은 별도 제작 예정)
- 제품에 적용할 때: 제품 메인 컬러 HEX 하나로 `--accent-50~900` 을 생성(`app.js` 의 accentScale 참고)하고 나머지 토큰은 그대로 사용
- 헤더의 Accent 선택은 미리보기용입니다. 실제 제품 컬러는 `_build/data.js` 의 `PRODUCTS` 에 등록하세요

## 소스 (`_build/`)
| 파일 | 내용 |
|---|---|
| `data.js` | 사이트 구조(SITE) · 제품 컬러(PRODUCTS) · 버전 · Changelog |
| `components.data.js` | 컴포넌트 30개: 설명 · 예제(html/react) · props · spec · figma 스펙 · 가이드라인 |
| `patterns.data.js` | 패턴 11개: 사용 컴포넌트(uses) · 예제 · 가이드라인 |
| `style.src.css` | 스타일 원본. 컴포넌트 CSS 는 `/* ---------- Live component samples ---------- */` 블록 안에 평면 규칙으로 작성(코드 패널 추출 대상) |
| `lib.js` | cssFor(컴포넌트 CSS 추출) · htmlToJsx(React 코드 생성) · hl(구문 강조) · tokenBlock |
| `icons.js` | 사용 아이콘 목록(`ICON_NAMES`) + `assets/icons` SVG 를 읽어 `I(name,size)` 인라인 헬퍼 제공. 빌드 시 `icons.gen.js`(브라우저용, 생성물) 기록 |
| `icons-css.js` | 체크박스 체크·마이너스, Chip 체크, Dropdown·Accordion 셰브론, Breadcrumb 슬래시, 표 정렬 화살표를 `assets/icons` SVG 의 data URI mask 로 `style.src.css` 에 삽입(빌드 시 자동) |
| `render.js` | 페이지 렌더러(컴포넌트/패턴/Resources) + 해시 라우터 |
| `foundations.js` | Foundations 페이지(Overview · Base material: Colors · Elevation · Grid · Icons · Typography, Web Desktop) |
| `app.src.js` | 런타임 원본 → `assets/app.js` |
| `ds.src.js` | 컴포넌트 동작 스크립트 원본 → `assets/ds.js` (`DS.toast()` · `DS.popup.open()` · `DS.init(root)` · `ds:*` 커스텀 이벤트) |
| `behave.js` | 동작 검증(playwright): 빌드 후 `node behave.js` — 프리뷰를 실제 클릭해 45 케이스 확인, 스크린샷 `.behave/` |
| `jiran-design-system-guide.standalone.html` | 위 파일을 로드하는 미리보기 셸. `_build` 에서 `python3 -m http.server 8090` 후 열기 |
| `components.json` | 빌드 산출물. Figma 동기화 등 외부 도구용(토큰 · 컴포넌트 스펙 · 예제 코드) |
| `verify.js` | 생성물 검증(플레이스홀더 0, 코드 패널 존재, 링크 변환, React 탭 패키지 코드 여부 등) |

## React 패키지 (`_react/`)
`@jiran/ds-react` — 30개 컴포넌트 + 패턴 래퍼를 실제 React 컴포넌트로 구현. 같은 클래스 마크업을 렌더링하므로 `dist/style.css`(토큰 + 컴포넌트 CSS 만 합성) 하나로 동작합니다.
- `src/components/<page>/` 컴포넌트 · `examples/<sec>/<page>/<id>.tsx` 예제(= 사이트 React 탭 소스 = 테스트 대상) · `tests/site-consistency.test.tsx` 사이트 HTML 과 구조 비교
- `cd _react && npm i && npm test && npm run build` → `dist/`(ESM·CJS·d.ts·style.css·fonts). `npm run demo` 로 전체 예제 확인
- 사용: `import "@jiran/ds-react/style.css"` · `<html data-theme="dark">` · `applyAccent("#2563EB")` · 앱 루트에 `<ToastProvider>`. 자세한 내용은 사이트 Resources › React Package

### 재빌드
```
cd _build
npm i            # 최초 1회 (playwright)
npx playwright install chromium   # 최초 1회
node build.js    # 생성 + verify
```
샘플 코드 작성 규칙: 문자열 안에 백틱 · \${ · onclick · <script · href="#/" 를 쓰지 않습니다(링크는 href="#").

## 서버 배포 메모
- 모든 링크는 상대 경로라 하위 경로(예: `/design-system/`)에 배치해도 됩니다.
- `.woff2` MIME 타입(`font/woff2`)이 서버에 등록되어 있는지 확인하세요.
