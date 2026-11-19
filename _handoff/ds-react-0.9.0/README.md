# @jiran/ds-react 0.9.0 — 테스트용 전달본

JS Design System(지란지교시큐리티 보안 콘솔용)의 React 컴포넌트 패키지입니다. 아직 npm 에 올리지 않았습니다. 그래서 이 폴더의 `.tgz` 파일로 설치합니다.

| 항목 | 값 |
|---|---|
| 패키지 | `@jiran/ds-react` 0.9.0 |
| 만든 날 | 2026-11-19 |
| 저장소 커밋 | `5d0223d` (main) + 패키지 README 정리 |
| 파일 SHA-256 | `0ecf88cfc021f04646d7eb13195e1cbca26b9d8e48f997356c7b94d323e5f9c1` |

## 들어 있는 것

| 파일 | 설명 |
|---|---|
| `jiran-ds-react-0.9.0.tgz` | 패키지 본체(7.7MB — 대부분 서체 파일) |
| `sample-app/` | 위 파일을 설치해 바로 돌려 보는 Vite + React 19 + TypeScript 예제 |
| `MIGRATION.md` | 이전 버전(0.6 ~ 0.8)에서 바뀐 props · 클래스 · 토큰 이름(패키지 안에도 같은 파일이 있음) |

## 1. 예제 앱부터 돌려 보기

```bash
cd sample-app
npm install
npm run dev
```

화면에서 확인할 수 있는 것:

- 제품 색 일곱 가지, 라이트 · 다크 전환
- Text Field(오류 상태 포함), Button, Popup(포커스 가둠), Toast
- 선택할 수 있는 Data Table 과 액션 바, 심각도 Tag, Switch
- 탐색형 차트(Chart.js)

예제 앱은 `../jiran-ds-react-0.9.0.tgz` 를 바라봅니다. 폴더 구조를 그대로 두세요.

## 2. 내 프로젝트에 설치하기

```bash
npm i ./jiran-ds-react-0.9.0.tgz
# 탐색형 차트를 쓸 때만
npm i chart.js@4
```

- React 18.2 이상 또는 19 를 지원합니다.
- `chart.js` 는 선택 의존성입니다.
- `dayjs` 는 자동으로 함께 설치됩니다(Date Picker 의 시간대 처리에 씀).

## 3. 앱 진입점 설정(한 번)

```tsx
// main.tsx
import "@jiran/ds-react/style.css";          // 필수 — 토큰 + 컴포넌트 CSS
import "@jiran/ds-react/scale.css";          // 선택 — 화면 폭에 따라 루트 글자 크기를 바꿈
// import "@jiran/ds-react/font-jp.css";     // 선택 — 일본어 한자 서체
import { ToastProvider, applyProductColor } from "@jiran/ds-react";

applyProductColor("blue"); // blue · red · cyan · navy · orange · neutral · ai

createRoot(document.getElementById("root")!).render(
  <ToastProvider>
    <div className="ds-root">
      <App />
    </div>
  </ToastProvider>
);
```

꼭 알아 둘 것:

- **앱 바깥 틀에 `className="ds-root"` 를 붙여야 합니다.** 서체(Pretendard) · 본문 색 · 배경이 이 클래스 아래에만 걸립니다. 빼면 글자가 브라우저 기본 서체(Times 등)로 나옵니다.
- **테마:** `setTheme("dark")` 또는 `<html data-theme="dark">` 로 바꿉니다. `null` 을 주면 시스템 설정을 따릅니다.
- **제품 색:** `applyProductColor(키)` 로 바꿉니다. `<html data-accent>` 와 CSS 변수가 바뀌고, 다크 테마에서 필요한 보정은 자동입니다.
- **Toast:** `useToast()` 를 쓰려면 `ToastProvider` 가 앱 위쪽에 있어야 합니다.
- **TypeScript 에서 CSS import 오류가 날 때:** TS 7 은 `import "….css"` 에 TS2882 를 냅니다. `src/vite-env.d.ts` 에 `/// <reference types="vite/client" />` 한 줄을 두면 됩니다(Vite 템플릿의 기본 파일 — 예제 앱에 들어 있음).
- **브라우저:** `color-mix()` 를 쓰므로 Chrome 111+ · Safari 16.2+ · Firefox 113+ 가 필요합니다.

## 4. 컴포넌트 사용법은 어디에

- 가이드 사이트의 각 컴포넌트 페이지에 있는 **React 탭** 코드가 곧 사용법입니다. 컴포넌트는 46개, 패턴은 22개입니다. 사이트 HTML 과 같은 클래스 마크업을 그리고, 테스트가 둘의 구조를 대조합니다.
- props 는 타입 정의(`dist/index.d.ts`)와 JSDoc 으로도 볼 수 있습니다. 에디터 자동 완성에 뜹니다.
- 바뀐 점과 옛 prop 경고는 `MIGRATION.md` 에 있습니다. 옛 prop 을 쓰면 개발 모드 콘솔에 한 번 경고가 나옵니다.

## 5. 알려진 것

- 차트 프리셋은 timeseries · bar · donut · mixed · gauge · spark 여섯입니다. 기본 색은 제품 색과 무관한 한 톤 파랑입니다.
- 번들 크기 — `style.css` 는 약 208KB 이고 Pretendard 가변 서체가 약 2MB 입니다. 일본어 서체(`font-jp.css`)는 한자가 화면에 나올 때만 그 조각을 받습니다.

## 6. 피드백을 받고 싶은 것

- 설치 · 진입점 설정에서 막힌 곳
- 우리 제품 화면에 넣었을 때 어긋나는 스타일. 특히 제품 CSS(리셋 · 전역 `a` · `button` 규칙)와 부딪치는 곳
- 타입 오류, props 이름이 헷갈리는 곳
- 없어서 직접 만든 컴포넌트나 동작
