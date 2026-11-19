# @jiran/ds-react

> **0.6.x 에서 0.9.0 으로 올리면 깨지는 변경이 있습니다.** CSS 변수 이름이 전부 바뀌었고(0.7), 제품 색은 팔레트 일곱에서 고릅니다(0.8 · 0.9).
> 0.9.0 은 컴포넌트 정비 묶음이라 props · 클래스 · 모양이 컴포넌트마다 바뀌었습니다. 옛 prop 은 개발 모드 콘솔에 한 번 경고하고 새 방식으로 그립니다.
> 컴포넌트별 전환표는 [MIGRATION.md](./MIGRATION.md) 에 있습니다.

지란지교시큐리티 Design System 의 React 컴포넌트 패키지입니다. 사이트(제품가이드)의 모든 컴포넌트와 패턴 래퍼를 **같은 클래스 마크업**으로 렌더링하는 실제 React 컴포넌트로 구현했습니다. 스타일은 `dist/style.css` 하나(토큰 + 컴포넌트 CSS, 사이트 크롬 제외)이고, 각 컴포넌트 페이지의 React 탭 코드가 곧 사용법입니다.

```bash
npm i @jiran/ds-react
# npm 에 올리기 전에는 npm pack 으로 만든 파일로 설치합니다
npm i ./jiran-ds-react-0.9.0.tgz
```

```tsx
// main.tsx — 앱 진입점에서 한 번
import "@jiran/ds-react/style.css";
import { ToastProvider, applyProductColor } from "@jiran/ds-react";

applyProductColor("red"); // 팔레트 일곱(blue · red · cyan · navy · orange · neutral · ai — 이름은 기본 · 제품1 · 제품2 · 제품3 · 브랜드 · 중립 · AI) 중 하나 → --prod-40~60 + data-accent

createRoot(document.getElementById("root")!).render(
  <ToastProvider><App /></ToastProvider>
);
```

- 테마: `<html data-theme="dark">` 또는 `setTheme("dark")`. Popup·Toast 포털도 `<html>` 에서 토큰을 상속합니다.
- 서체·배경: 앱 루트에 `.ds-root` 클래스를 붙이면 Pretendard · 본문 색 · 배경이 적용됩니다. 빼면 글자가 브라우저 기본 서체로 나옵니다.
- 화면 폭 단계(선택): `import "@jiran/ds-react/scale.css"` 는 화면 폭에 따라 루트 글자 크기를 93.75 · 100 · 106.25 · 112.5% 로 바꿉니다. `html` 에 걸리므로 제품이 고릅니다.
- TypeScript 7 은 `import "….css"` 에 TS2882 를 냅니다. `src/vite-env.d.ts` 에 `/// <reference types="vite/client" />` 를 두면 통과합니다.
- 일본어: Pretendard 에는 한자가 없습니다. 일본어를 쓰는 제품은 `import "@jiran/ds-react/font-jp.css"` 를 더합니다. Pretendard JP 의 조각 파일이고, 한자가 화면에 나올 때만 그 조각을 내려받습니다.
- 브라우저: `color-mix()` 사용 — Chrome 111+ · Safari 16.2+ · Firefox 113+.
- React 18.2+ / 19. TypeScript 타입 포함. ESM + CJS.
- React 를 쓰지 않는 제품은 사이트의 `assets/ds.js`(순수 JS, `_build/ds.src.js`)가 같은 클래스 마크업에 동작을 붙입니다. 두 구현의 동작 범위를 함께 유지합니다(사이트 Resources › React Package 표 참고).

## 구조

| 경로 | 내용 |
|---|---|
| `src/components/<page>/` | 컴포넌트 (사이트 페이지 1:1). `forwardRef` · `className` 병합 · 나머지 props 전달 |
| `src/patterns/` | 패턴 레이아웃 래퍼 (Stack · Toolbar · Form · Empty · Notes · Settings …) |
| `src/icons/` | `Icon` + 생성 파일 `icons.data.ts` (`_build/icons.js` 의 Tabler 아이콘 목록 — 사이트 Foundations › Icons 갤러리와 동일) |
| `src/utils/` | `cx` · `useControllable` · `useId` · `Portal` · `useOutsideClick` · `useEscape` · `useFocusTrap` |
| `src/theme.ts` | `PRODUCT_COLORS` · `applyProductColor` · `accentScale` · `applyAccent`(팔레트 밖 색) · `setTheme` |
| `examples/<sec>/<page>/<id>.tsx` | **사이트 React 탭에 그대로 표시되는 예제**. 테스트가 렌더해 사이트 HTML 과 구조를 비교 |
| `tests/` | `site-consistency` (태그·클래스·상태 속성 비교) · `examples-coverage` |
| `scripts/` | `gen-icons` · `sync-css`(style.css 합성) · `check-version` · `visual-compare` |
| `demo/` | Vite 데모 — 전체 예제 + 테마 · 제품 색 토글 |


## 탐색형 차트 (`@jiran/ds-react/chart`)

Chart.js(MIT)는 optional peer 입니다 — 차트를 쓰는 제품만 `npm i chart.js` 하고, `Chart` 를 prop 으로 넘깁니다.

```tsx
import { Chart } from "chart.js/auto";
import { ChartCard } from "@jiran/ds-react";
import { ChartCanvas, presets } from "@jiran/ds-react/chart";

<ChartCard title="일별 탐지 추이" sub="최근 14일">
  <ChartCanvas chart={Chart} aria-label="일별 탐지 추이 — Critical · High 누적 영역"
    config={presets.timeseries({ labels, series: [{ label: "Critical", tone: "critical", data }], stacked: true })} />
</ChartCard>
```

프리셋은 `timeseries` · `bar` · `donut` · `mixed` · `gauge` · `spark` 여섯이고 결과는 보통의 Chart.js config 입니다. 색은 토큰을 계산값으로 읽어 칠하고, 테마가 바뀌면 다시 칠합니다. 기본은 한 톤(`--chart-mono-1~4` — 제품 색과 무관한 고정 파랑)이고, 계열이 5개 이상이거나 `color: "categorical"` 이면 범주색(`--chart-series-1~6`), `tone` 을 준 계열은 그 톤(심각도 등)입니다. 원본은 `_build/ds-chart.src.js` 하나이고 `scripts/sync-chart.mjs` 가 복사합니다.

## 스크립트

```bash
npm run typecheck   # tsc
npm test            # vitest (컴포넌트 동작 + 사이트 예제와 구조 비교 + 예제 커버리지)
npm run build       # dist/ (index.js · index.cjs · index.d.ts · style.css · fonts/)
npm run demo        # http://localhost:5180
npm run demo:build && npm run visual   # 사이트 ↔ React 스크린샷 비교 → .visual/
```

## 규칙

- 컴포넌트를 추가·변경하면 `_build/components.data.js`(HTML·props) · `_build/style.src.css` · `src/` · `examples/` 를 함께 갱신합니다. `npm test` 가 구조 불일치와 누락 예제를 잡고, 사이트 빌드의 `verify.js` 가 React 탭 누락을 잡습니다.
- 사이트 HTML 예제와 다른 상태를 보여줘야 하는 예제(동작 데모)는 첫 줄에 `// ds:skeleton off` 를 두고 동작 테스트를 별도로 둡니다.
- 패키지 `major.minor` 는 사이트 `VERSION`(`_build/data.js`)과 같이 올립니다 (`check-version`).
