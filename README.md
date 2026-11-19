# 지란지교시큐리티 Design System — 제품가이드 (정적 사이트 v0.9)

정적 HTML 사이트입니다. 폴더째 웹 서버(사내 Nginx/Apache, S3, GitHub Pages 등)에 올리면 동작합니다. 빌드 도구·서버 사이드 코드 없음.
모든 컴포넌트·패턴 페이지는 라이브 프리뷰 + 복사 가능한 코드(HTML+CSS / React) + Props 표로 구성됩니다. React 탭의 코드는 `_react/` 의 패키지 `@jiran/ds-react` 사용 코드이며, 테스트로 사이트 HTML 과 구조가 같음을 보장합니다.

> **이 폴더의 HTML/CSS/JS 는 생성물입니다.** `_build` 의 소스를 고친 뒤 재빌드하세요. 생성물을 직접 수정하면 다음 빌드에서 사라집니다.

처음이라면 **Home › Getting started**(https://myscully.github.io/JSDS/home/getting-started.html)에서 디자이너 · React 개발자 · HTML+CSS 개발자 별 사용법을 3~6단계로 확인하세요.

## 폴더 구조
- `index.html` — 첫 화면. 사이드 메뉴 없이 Home Overview 콘텐츠만 표시
- 상단 Home 탭 → `home/getting-started.html`. Home 섹션 사이드 메뉴는 Getting started · About · UX Principles (Overview 는 첫 화면에만 있음)
- `home/` `foundations/` `components/` `patterns/` `templates/` `resources/` — 상단 메뉴 6개 섹션. 각 페이지가 개별 HTML 파일이며 섹션 폴더의 `index.html` 은 첫 페이지로 이동
- `assets/style.css` — 디자인 토큰(`:root`) + 문서 레이아웃 + **컴포넌트 CSS**('Live component samples' 블록). Light/Dark 지원. 제품에서는 이 파일 하나를 연결하거나 각 페이지의 "컴포넌트 CSS"만 복사
- `assets/app.js` — 테마 전환, 제품 색 미리보기, 검색, 코드 복사/탭
- `assets/ds.js` — **컴포넌트 동작 스크립트**(순수 JS, 의존성 없음). 드롭다운·탭·페이지네이션·달력·테이블 정렬/선택·토스트 등. 사이트 프리뷰가 이 파일로 동작하며, HTML 을 복사해 쓰는 제품도 `<script src="assets/ds.js" defer>` 한 줄로 같은 동작을 얻습니다. React 제품은 불필요(@jiran/ds-react 가 동작 포함)
- `assets/fonts/PretendardVariable.woff2` — Pretendard Variable v1.3.9 (OFL)
- `assets/font-jp.css` · `assets/fonts/jp/` — Pretendard JP Variable v1.3.9 (OFL) 조각 119개. Pretendard 에 없는 한자만 그리고, 한자가 화면에 나올 때만 그 조각을 내려받습니다. 원본은 `_build/font-jp.src.css` · `_build/fonts-jp/`
- `assets/icons/outline` `assets/icons/filled` — Tabler Icons(MIT) 중 **사이트가 쓰는 것만**(원본, 빌드가 건드리지 않음). 목록은 `_build/icons.js` 의 `ICON_NAMES`, 갤러리는 Foundations › Icons. **아이콘을 더할 때는 Tabler 원본 SVG 를 이 폴더에 먼저 넣고** `ICON_NAMES` 에 이름을 더합니다 — 없으면 빌드가 잡습니다

## 컬러 모델
- 토큰은 기준 토큰의 Atomic 램프 13개와 시멘틱 90개(기준 75 + 우리가 더한 15)를 씁니다. `brand` 가 제품 메인 컬러 슬롯이고, 지란지교 오렌지(#FF7F00)는 트리 밖 `--company-mark` 로 두어 로고·헤더 마크에만 씁니다
- 제품에 적용할 때: 제품 색 팔레트(기본 · 제품1 · 제품2 · 제품3 · 브랜드 · 중립 · AI) 중 하나의 키로 `--prod-40~60` 다섯 단계와 `data-accent` 를 넣고(`app.js` 의 `applyAccent` · React `applyProductColor`) 나머지 토큰은 그대로 사용
- **제품 색 제약**: Brand 면 위 글자는 늘 흰색이라 제품 색 위에서 흰 글자가 **4.5** 를 넘어야 합니다 — `verify` 가 검사합니다
- 헤더의 제품 색 선택은 미리보기용입니다. 팔레트는 `_build/data.js` 의 `PRODUCTS`(1.0 전에는 일곱 가지 — 바꾸려면 사람의 결정)

## 소스 (`_build/`)
| 파일 | 내용 |
|---|---|
| `data.js` | 사이트 구조(SITE) · 제품 컬러(PRODUCTS) · 버전 · Changelog |
| `components.data.js` | 컴포넌트 46개: 설명 · 예제(html/react) · props · spec · figma 스펙 · 가이드라인 |
| `patterns.data.js` | 패턴 22개: 사용 컴포넌트(uses) · 예제 · 가이드라인 |
| `templates.data.js` · `templates.build.js` | 템플릿 화면 7개: 문서 페이지의 글과 화면 생성기. 화면은 `templates/screen/`, 앱 틀 배치와 흉내 동작은 `assets/templates.css` · `templates.js` |
| `style.src.css` | 스타일 원본. 컴포넌트 CSS 는 `/* ---------- Live component samples ---------- */` 블록 안에 평면 규칙으로 작성(코드 패널 추출 대상) |
| `lib.js` | cssFor(컴포넌트 CSS 추출) · htmlToJsx(React 코드 생성) · hl(구문 강조) · tokenBlock |
| `icons.js` | 사용 아이콘 목록(`ICON_NAMES`) + `assets/icons` SVG 를 읽어 `I(name,size)` 인라인 헬퍼 제공. 빌드 시 `icons.gen.js`(브라우저용, 생성물) 기록 |
| `icons-css.js` | 체크박스 체크·마이너스, Chip 체크, Dropdown·Accordion 셰브론, Breadcrumb 슬래시, 표 정렬 화살표를 `assets/icons` SVG 의 data URI mask 로 `style.src.css` 에 삽입(빌드 시 자동) |
| `render.js` | 페이지 렌더러(컴포넌트/패턴/Resources) + 해시 라우터 |
| `foundations.js` | Foundations 페이지(Overview · Base material: Colors · Elevation · Grid · Icons · Interaction · Typography · Writing, Web Desktop) |
| `app.src.js` | 런타임 원본 → `assets/app.js` |
| `ds.src.js` | 컴포넌트 동작 스크립트 원본 → `assets/ds.js` (`DS.toast()` · `DS.popup.open()` · `DS.init(root)` · `ds:*` 커스텀 이벤트) |
| `ds-chart.src.js` | 탐색형 차트 테마 어댑터 + 프리셋 원본 → `assets/ds-chart.js` (`DSChart.theme/presets/mount/auto`). Chart.js(MIT) 본체는 `node_modules` 에서 `assets/vendor/chart.umd.js` 로 복사되고, 차트가 있는 페이지에만 실린다 |
| `behave.js` | 동작 검증(playwright): 빌드 후 `node behave.js` — 프리뷰를 실제로 누르고 입력해 동작을 확인(묶음 파일 `behave.*.js`) |
| `jiran-design-system-guide.standalone.html` | 위 파일을 로드하는 미리보기 셸. `_build` 에서 `python3 -m http.server 8090` 후 열기 |
| `components.json` | 빌드 산출물. Figma 동기화 등 외부 도구용(토큰 · 컴포넌트 스펙 · 예제 코드) |
| `verify.js` | 생성물 검증(플레이스홀더 0, 코드 패널 존재, 링크 변환, React 탭 패키지 코드 여부 등) |
| `contrast.pairs.js` | **대비 계약** — 한 화면에서 만날 수 있는 토큰 쌍과 최소 대비를 선언. 숫자는 사람이 적지 않는다 |
| `contrast.js` | 그 선언을 생성 사이트에서 전수 측정(라이트·다크 × 제품 색 팔레트 7가지). 미달이면 빌드 실패 · 샘플 블록의 프리미티브 직접 참조 금지 · 소비자 0 토큰 경고 |

## React 패키지 (`_react/`)
`@jiran/ds-react` — 컴포넌트 46개 페이지 전부와 패턴 래퍼를 실제 React 컴포넌트로 구현. 같은 클래스 마크업을 렌더링하므로 `dist/style.css`(토큰 + 컴포넌트 CSS 만 합성) 하나로 동작합니다.
- `src/components/<page>/` 컴포넌트 · `examples/<sec>/<page>/<id>.tsx` 예제(= 사이트 React 탭 소스 = 테스트 대상) · `tests/site-consistency.test.tsx` 사이트 HTML 과 구조 비교
- `cd _react && npm i && npm test && npm run build` → `dist/`(ESM·CJS·d.ts·style.css·fonts). `npm run demo` 로 전체 예제 확인
- 사용: `import "@jiran/ds-react/style.css"` · `<html data-theme="dark">` · `applyProductColor("red")` · 앱 루트에 `<ToastProvider>`. 자세한 내용은 사이트 Resources › React Package

### 재빌드
```
cd _build
npm i            # 최초 1회 (playwright)
npx playwright install chromium   # 최초 1회
node build.js    # 생성 + verify
git config core.hooksPath _build/git-hooks   # 최초 1회 (클론마다)
```
샘플 코드 작성 규칙: 문자열 안에 백틱 · \${ · onclick · <script · href="#/" 를 쓰지 않습니다(링크는 href="#").

`style.src.css` 를 고치면 반드시 `node build.js` 를 돌려야 `assets/style.css` 와 생성 페이지에 반영됩니다. 위 `core.hooksPath` 를 걸어두면 빌드를 빠뜨린 커밋을 pre-commit 훅이 막아줍니다(우회: `git commit --no-verify`).

## 서버 배포 메모
- 모든 링크는 상대 경로라 하위 경로(예: `/design-system/`)에 배치해도 됩니다.
- `.woff2` MIME 타입(`font/woff2`)이 서버에 등록되어 있는지 확인하세요.
