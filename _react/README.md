# @jiran/ds-react

지란지교시큐리티 Design System 의 React 컴포넌트 패키지입니다. 사이트(제품가이드)의 30개 컴포넌트와 패턴 래퍼를 **같은 클래스 마크업**으로 렌더링하는 실제 React 컴포넌트로 구현했습니다. 스타일은 `dist/style.css` 하나(토큰 + 컴포넌트 CSS, 사이트 크롬 제외)이고, 각 컴포넌트 페이지의 React 탭 코드가 곧 사용법입니다.

```bash
npm i @jiran/ds-react
```

```tsx
// main.tsx — 앱 진입점에서 한 번
import "@jiran/ds-react/style.css";
import { ToastProvider, applyAccent } from "@jiran/ds-react";

applyAccent("#0B4171"); // 제품 메인 컬러 → --accent-50~900

createRoot(document.getElementById("root")!).render(
  <ToastProvider><App /></ToastProvider>
);
```

- 테마: `<html data-theme="dark">` 또는 `setTheme("dark")`. Popup·Toast 포털도 `<html>` 에서 토큰을 상속합니다.
- 서체·배경: 앱 루트에 `.ds-root` 클래스를 붙이면 Pretendard · 본문 색 · 배경이 적용됩니다.
- 브라우저: `color-mix()` 사용 — Chrome 111+ · Safari 16.2+ · Firefox 113+.
- React 18.2+ / 19. TypeScript 타입 포함. ESM + CJS.
- React 를 쓰지 않는 제품은 사이트의 `assets/ds.js`(순수 JS, `_build/ds.src.js`)가 같은 클래스 마크업에 동작을 붙입니다. 두 구현의 동작 범위를 함께 유지합니다(사이트 Resources › React Package 표 참고).

## 구조

| 경로 | 내용 |
|---|---|
| `src/components/<page>/` | 컴포넌트 (사이트 페이지 1:1). `forwardRef` · `className` 병합 · 나머지 props 전달 |
| `src/patterns/` | 패턴 레이아웃 래퍼 (Stack · Toolbar · Form · Empty · Notes · Settings …) |
| `src/icons/` | `Icon` + 생성 파일 `icons.data.ts` (`_build/icons.js` 의 36개 Tabler 아이콘 — 사이트 Foundations › Icons 갤러리와 동일) |
| `src/utils/` | `cx` · `useControllable` · `useId` · `Portal` · `useOutsideClick` · `useEscape` · `useFocusTrap` |
| `src/theme.ts` | `accentScale` · `applyAccent` · `setTheme` |
| `examples/<sec>/<page>/<id>.tsx` | **사이트 React 탭에 그대로 표시되는 예제**(118개). 테스트가 렌더해 사이트 HTML 과 구조를 비교 |
| `tests/` | `site-consistency` (태그·클래스·상태 속성 비교) · `examples-coverage` |
| `scripts/` | `gen-icons` · `sync-css`(style.css 합성) · `check-version` · `visual-compare` |
| `demo/` | Vite 데모 — 전체 예제 + 테마/Accent 토글 |

## 스크립트

```bash
npm run typecheck   # tsc
npm test            # vitest (컴포넌트 동작 + 사이트 일치 118 + 커버리지)
npm run build       # dist/ (index.js · index.cjs · index.d.ts · style.css · fonts/)
npm run demo        # http://localhost:5180
npm run demo:build && npm run visual   # 사이트 ↔ React 스크린샷 비교 → .visual/
```

## 규칙

- 컴포넌트를 추가·변경하면 `_build/components.data.js`(HTML·props) · `_build/style.src.css` · `src/` · `examples/` 를 함께 갱신합니다. `npm test` 가 구조 불일치와 누락 예제를 잡고, 사이트 빌드의 `verify.js` 가 React 탭 누락을 잡습니다.
- 사이트 HTML 예제와 다른 상태를 보여줘야 하는 예제(동작 데모)는 첫 줄에 `// ds:skeleton off` 를 두고 동작 테스트를 별도로 둡니다.
- 패키지 `major.minor` 는 사이트 `VERSION`(`_build/data.js`)과 같이 올립니다 (`check-version`).
