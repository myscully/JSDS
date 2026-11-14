# 마이그레이션 — 0.6.x → 0.8.0

**깨지는 변경입니다.** CSS 변수 이름이 전부 바뀌었고(0.7.0), 제품 색에 제약이 생겼습니다(0.8.0).

컬러 토큰을 의미 층째 값·이름까지 교체했습니다.
`dist/style.css` 의 토큰 이름은 이 패키지의 공개 API 입니다 — 제품 CSS 에서 `var(--text-primary)` 처럼
직접 참조하고 있었다면 아래 표대로 바꿔야 합니다.

**토큰 교체(0.7)만으로는 마크업이 바뀌지 않았지만, 2026-10-28 Button 정의를 다시 내리면서 Button 의 props · 클래스 이름과
높이(버튼 · Text Field · Date Picker 필드)가 바뀌었습니다** — 아래 [Button (2026-10-28)](#button-2026-10-28) 절을 보세요.
그 밖의 컴포넌트 props(`tone` · `variant` · `size`)와 클래스 이름은 그대로입니다.

**2026-11-12 텍스트 스타일이 19단계로 바뀌며 같은 이름의 크기가 달라졌습니다** — `.t-title-1` 은 16 → 32, `.t-heading-1` 은 28 → 22, `.t-display-1` 은 40 → 56 입니다. 제품 마크업의 `.t-*` 는 아래 [텍스트 스타일 19단계 (2026-11-12)](#텍스트-스타일-19단계-2026-11-12) 표대로 바꿔야 합니다.

## 이름 규칙

```
--{그룹}-{하위}-{이름}        그룹: foreground · background · surface · line · effect · static
--surface-brand-heavy         ↔ Figma  color/semantic/surface/brand/heavy
```

75개이고 Figma 변수 경로와 1:1 입니다. 전체 목록은 가이드의 **Foundations › Colors › Semantic** 에 있습니다.

## 전환표

### 테마 · 중립

| 0.6 | 0.7 |
|---|---|
| `--surface-base` | `--background-neutral-primary` |
| `--surface-raised` | `--surface-elevated-primary` |
| `--surface-sunken` | `--background-neutral-secondary` |
| `--surface-inverse` | `--surface-neutral-inverse` |
| `--text-primary` | `--foreground-neutral-primary` |
| `--text-secondary` | `--foreground-neutral-secondary` |
| `--text-tertiary` | `--foreground-neutral-tertiary` |
| `--text-disabled` | `--foreground-disable-primary` |
| `--text-inverse` | `--foreground-neutral-inverse` |
| `--line-strong` | `--line-neutral-primary` |
| `--line-default` | `--line-neutral-secondary` |
| `--line-subtle` | `--line-neutral-tertiary` |
| `--fill-weak` | `--surface-neutral-tertiary` |
| `--fill-base` | `--surface-neutral-secondary` |
| `--fill-strong` | `--surface-neutral-strong` |
| `--fill-disabled` | `--surface-disable-primary` |
| `--dimmer` | `--effect-dimmer-primary` |

### 제품 메인 컬러 (Accent → Brand)

| 0.6 | 0.7 |
|---|---|
| `--accent-surface` | `--surface-brand-primary` |
| `--accent-surface-hover` | `--surface-brand-strong` |
| `--accent-surface-pressed` | `--surface-brand-heavy` |
| `--accent-fill` | `--surface-brand-subtle` |
| `--accent-text` · `--accent-graphic` | `--foreground-brand-primary` |
| `--accent-text-inverse` | `--foreground-brand-inverse` |
| `--accent-line` | `--line-brand-primary` |
| `--accent-on` | `--brand-label` |
| `--focus-ring` | `--foreground-brand-primary`(링) + `--line-brand-focus`(헤일로) |

`applyAccent()` 의 주입 단계가 **10개에서 5개로** 바뀌었습니다.

```ts
// 0.6
applyAccent("#2563EB");   // --prod-50 … --prod-900 (600 = 입력값)
// 0.7
applyAccent("#0066FF");   // --prod-40 · 45 · 50 · 55 · 60 (50 = 입력값)
```

`accentScale()` 의 반환 타입 `AccentScale` 이 `Record<40|45|50|55|60, string>` 으로 좁아집니다.
단계를 직접 읽고 있었다면 함께 고쳐야 합니다. 제품 컬러를 지정하지 않으면 기준 시스템의 Blue 램프가 기본값입니다.

#### 제품 색에 제약이 생깁니다 — `data-accent-light` 가 사라집니다

Brand 면 위의 글자는 **늘 흰색**입니다(기준 시스템에 면 위 글자 역할이 없습니다).
종전에는 제품 색이 밝으면 `data-accent-light` 를 켜서 글자를 어둡게 뒤집었는데, 그 적응을 걷어냈습니다 —
면을 어둡게 내려 흰 글자를 세우는 길은 다크에서 버튼이 캔버스에 묻혀(분리 1.11) 막혀 있고,
적응을 두면 기준 시스템에 없는 분기가 계속 남기 때문입니다.

**제품 색 위에서 흰 글자가 4.5 를 넘어야 합니다.** 기준은 라이트의 기준 단계(제품 HEX 자체)입니다 —
hover·pressed 는 더 어두워 자동으로 통과합니다.

```ts
import { isLightAccent } from "@jiran/ds-react";
isLightAccent("#00AD7B");  // true  — 흰 글자 2.89, Brand 슬롯에 쓸 수 없다
isLightAccent("#008760");  // false — 4.53, 같은 색상에서 통과하는 가장 밝은 값
```

- `applyAccent()` 는 더 이상 `data-accent-light` 를 설정하지 않습니다. 그 속성에 CSS 를 걸어 두었다면 지우세요.
- 규격에 못 미치는 색을 넘기면 콘솔에 경고합니다. 밝은 브랜드 색을 가진 제품은 **어두운 변형**을 만들어 넣어야 합니다.
- 다크에서 rest 가 3.2~3.5 인 것은 기준 시스템 값 그대로입니다(다크 면이 한 단계 밝은 brand-60 이고 그 위에 흰 글자).
  이 제약과 무관하며, 모든 제품에 똑같이 적용됩니다.

### 상태색

| 0.6 | 0.7 |
|---|---|
| `--danger-*` | `--*-negative-*` |
| `--warning-*` | `--*-cautionary-*` |
| `--success-*` | `--*-positive-*` |
| `--info-*` | `--*-accent-cyan` |
| `--muted-surface` | `--surface-neutral-strong` |
| `--muted-graphic` | `--foreground-inactive-primary` |

**솔리드 상태 면과 `-on` 이 사라졌습니다.** 기준 시스템의 상태 면은 8%·12% 틴트뿐이고,
면 위 글자 역할이 없습니다. 채운 상태 태그를 쓰고 있었다면 틴트 + 테두리로 바뀝니다 —
태그 라벨은 `--foreground-neutral-primary`(중립)이고 색은 점(`::before`)과 테두리가 나릅니다.

| 역할 | 0.7 에서 쓸 것 |
|---|---|
| 옅은 상태 면 | `--surface-{positive\|cautionary\|negative}-primary` |
| 강한 부정 면 | `--surface-negative-strong` |
| 상태 글자·아이콘 | `--foreground-{...}-primary` · `--foreground-negative-strong` |
| 상태 보더 | `--line-{...}-primary` · `--line-negative-strong` · `--line-negative-focus` |

### 회사 브랜드

| 0.6 | 0.7 |
|---|---|
| `--brand-surface` | `--company-mark` |
| `--brand-fill` | `--company-mark-subtle` |

기준 시스템의 `brand` 는 **제품 색**입니다. 지란지교 오렌지는 토큰 트리 밖으로 옮겨
로고·헤더 마크 전용으로 남겼습니다. `--brand-*` 를 회사색으로 쓰고 있었다면 반드시 바꿔야 합니다 —
이름은 그대로 있지만 **뜻이 반대**가 됩니다.

### 프리미티브

램프와 단계 번호가 모두 바뀌었습니다. **숫자가 클수록 밝습니다**(종전과 방향이 반대).

```
--neutral-950  →  --cool-neutral-10      (가장 어두움)
--neutral-50   →  --cool-neutral-99      (가장 밝음)
--red-500      →  --red-50
```

프리미티브는 원래 컴포넌트에서 직접 쓰지 않는 값이고 빌드가 그 참조를 막습니다.
직접 쓰고 있었다면 대응하는 의미 토큰으로 옮기세요.

#### 조용히 틀리는 이름 다섯 — 반드시 찾아서 고치세요

두 체계에서 **이름이 그대로 살아남은 프리미티브가 정확히 다섯 개**이고 **전부 값이 다릅니다**.
번호 체계가 겹치는 자리가 `50` 하나뿐이라 그렇습니다.

| 이름 | 0.6 | 0.7 |
|---|---|---|
| `--neutral-50` | `#F7F7F8` (거의 흰색) | `#737373` (중간 회색) |
| `--red-50` | `#FEECEC` (가장 옅은 분홍) | `#FF4242` (기준 빨강) |
| `--orange-50` | `#FEF4E6` | `#FF9200` |
| `--green-50` | `#D9FFE6` | `#00BF40` |
| `--cyan-50` | `#DEFAFF` | `#00BDDE` |

**오류가 나지 않습니다.** `var()` 가 정상으로 해소되므로 화면 색만 엉뚱해집니다.
나머지 이름(`--neutral-950` 등)은 선언이 없어져 상속색으로 떨어지므로 눈에 띄지만,
이 다섯은 눈에 띄지 않습니다. 제품 CSS 에서 `-50` 으로 끝나는 프리미티브를 먼저 검색하세요.

## 접근성 — 알고 써야 할 것

기준 시스템의 값을 그대로 쓰기로 한 결정의 대가가 있습니다. **라이트 모드에서
상태색 글자·아이콘이 WCAG AA 아래입니다** — 주의 2.24 · 긍정 2.46 · 부정 3.44.
이 값들은 빌드의 대비 게이트가 `advisory` 로 매 빌드 보고합니다(숨기지 않습니다).

표·목록의 **라벨 자체는 중립 글자색**(대비 17.9)이라 밀도 높은 화면의 가독성은 유지됩니다.
색 아래로 떨어지는 것은 배너의 제목·아이콘과 상태 점이며, 그래서 **색만으로 의미를 전달하지 않는다**는
규칙(라벨 병기)이 권고가 아니라 제약입니다.

## Date Picker · Calendar (2026-10-27)

기능을 더하면서 마크업과 몇 가지 동작이 바뀌었습니다. 대부분 그대로 올리면 되고, 아래를 직접 쓰던 곳만 확인하세요.

| 바뀐 것 | 전 | 후 |
|---|---|---|
| 선택 불가 날짜 | `<button disabled>` | `aria-disabled="true"` — 화살표 키가 지나갈 수 있게. 테스트에서 `toBeDisabled()` 로 찾았다면 `aria-disabled` 로 |
| 날짜 칸 의미 | `<button aria-selected>`(무효) | `role="grid"` > `role="row"` > `role="gridcell"`, 이름은 전체 날짜("2026년 9월 7일 월요일") |
| 단독 `Calendar` 의 role | `dialog` | `group`. 팝오버로 쓸 때는 `dialog` prop → `role="dialog" aria-modal="true"` |
| 제목 | `<span>` | `<button class="cal-title">` — 누르면 연 → 월 화면 |
| `displayText` | 값이 있어도 늘 보임 | 값이 없을 때만 — 고른 값이 가려지던 것을 고쳤다 |
| 기간 적용 | 끝이 없어도 적용(`"YYYY-MM-DD ~ "`) | 끝을 고르기 전에는 적용 비활성 |
| Esc | 열린 피커 전부 닫힘 | 포커스가 든 피커 하나만 닫고 필드로 포커스 |

새 props: `mode="month"` · `calendars={2}` · `footer={["today","reset","cancel","apply"] | false}` · `allowTyping` · `help` · `error` ·
`messages` · `size` · `readOnly` · `required` · `inputId`. 새 함수: `parseDate` · `parseMonth` · `formatMonth`.

## Date Picker (2026-11-09)

필드가 **Text Field 입력 하나**가 됐습니다. 버튼형 필드(`.field-btn`)는 없어졌고, 숫자를 치면 `YYYY. MM. DD` 로 끊어 채웁니다(locale 과 무관하게 고정).
값이 늘 유효한 날짜는 아니게 됐으므로 **`onChange` 를 받는 곳은 꼭 확인하세요.** 날짜 계산에는 dayjs(MIT, 1.11.13 고정)가 패키지 dependency 로 들어옵니다 — 쓰는 쪽에서 import 할 것은 없습니다.

| 전 | 지금 (React) | 지금 (클래스) |
| --- | --- | --- |
| `onChange(value: Date \| null)` — 유효한 날짜만 | `onChange(value, { text, validity })`. `validity` 는 `empty · incomplete · invalid · min · max · order · valid`. 덜 친 · 없는 날짜면 `value` 가 **Invalid Date**(`isNaN(value.getTime())`), 범위 밖 · 순서가 뒤집힌 기간이면 그 날짜가 그대로 옵니다. `DateRangePicker` 는 `info.sides = { start, end }` 로 쪽마다의 상태도 줍니다(비운 쪽 `empty`, 순서는 `validity` 에만) | `ds:date` detail `{ value, start, end, date, text, validity }`(기간은 `sides` 도) · host 의 `data-validity` |
| 범위 밖 입력은 거부하고 이전 값 유지 | 키보드 입력(직접 치기 · ↑↓)으로는 범위 밖도 들어가고 오류로 알립니다. 달력 칸은 지금처럼 고를 수 없습니다 | 같음 |
| `mode="range"` | `<DateRangePicker>` — 값은 `{ start, end }`, 달력 **두 개**가 기본(`calendars={1}` 로 하나, 767px 이하는 자동으로 하나). `mode="range"` 는 경고하고 DateRangePicker 로 동작합니다 | `.datepicker.field[data-range]` · `data-calendars="1"` |
| `mode="month"` | `unit="month"`(그리고 새 `unit="year"`). `mode="month"` 는 경고하고 `unit="month"` 로 동작합니다 | `data-unit="month"` · `"year"` |
| `allowTyping` · `triggerStyle` · `displayText` | 없음 — 늘 입력형입니다. 주면 경고하고 무시합니다 | `.field-btn` 없음 → `.datepicker.field > .affix > input + .cal-btn` |
| 값 표기 `YYYY-MM-DD` | 필드 `YYYY. MM. DD` · `YYYY. MM` · `YYYY`. 붙여 넣은 `2026-9-7` · `20260907` 도 형식으로 바꿉니다. ↑↓ 는 커서가 놓인 조각을 ±1 | 같음. `data-value` 등 속성은 기계 형식 그대로(`YYYY-MM-DD`) |
| 한국어 고정 | `locale`(기본 `ko-KR`) — 제목 · 요일 · 월 이름 · 날짜 칸 이름 · '오늘' 을 Intl 로. 나머지 문구는 `labels` 로 바꿉니다 | `data-locale` · `data-labels`(JSON, 같은 키 + `recent: "최근 {n}일"`) |
| 환경 시간대 고정 | `timezone`(기본 사용자 환경, `"UTC"` · IANA 이름) — '오늘' 과 내보내는 순간(그 시간대의 0시)이 바뀝니다. 틀린 이름은 경고하고 환경 시간대로 | `data-timezone` + `assets/vendor/dayjs*.js`(Date Picker 페이지에 빌드가 붙임) |
| `messages.format` | `messages.incomplete` · `messages.invalid` 로 나뉨(`format` 을 주면 둘 다에 씁니다) | — |
| 라벨 `LABELS.dateFormatError` | `dateIncompleteError` · `dateInvalidError` | — |
| 오류 문구 = 앞말 + 예시 · 날짜 + 꼬리말("2026. 12. 31 이전 날짜를 입력하세요") | **기본 문구가 바뀌었습니다** — 무엇이 일어났는지 + 고치는 법, 범위는 '부터 · 까지'("날짜가 범위를 벗어났습니다. 2026. 12. 31 까지 입력할 수 있습니다."). `messages` 는 자리표시 `{subject}` `{example}` `{min}` `{max}` 템플릿이고 새 키 `subject` · `startSubject` · `endSubject` 로 주어를 정합니다 — 기간에서 한쪽만 틀리면 그 쪽 이름("종료일이 …"). **자리표시가 없는 옛 문자열은 예전처럼 이어 붙습니다.** 기본 문구 글자를 단정하던 테스트는 고쳐야 합니다 | `data-messages`(JSON, 같은 키 · 같은 기본값). 틀린 JSON 은 경고하고 기본 문구로 |
| — | `defaultText` — 덜 친 글자를 처음부터 보일 때 | 입력의 `value` |
| 선택 칸 | 둥근 사각형 | 지름 34 원. 기간 양끝은 칸 반쪽에 띠가 이어집니다(`.day.start` · `.day.end` 가 미리보기 끝에도 붙음) |
| 날짜 칸 hover · 누름 · 오늘 · 키보드 포커스 · 기간 미리보기 끝 | 칸 사각 면 · 오늘은 brand 글자만 · 미리보기 끝은 띠 색 원에 brand 테두리 | 모두 지름 34 원(`.day::before`). 오늘은 `--surface-brand-subtle-strong` 원 + 기본 색 굵은 글자(띠 안에서만 brand 글자), 미리보기 끝은 선택과 같은 brand 원. 연 · 월 칸은 둥근 사각형 그대로. 달력 헤더 아래 8 → 16 |
| 열린 Date Picker · Select 의 테두리 | 아이콘으로 연 Date Picker 는 링 없음, 열린 Select 는 brand 테두리만 | 입력 포커스와 같은 링(brand 1px + 후광 4px, 오류 Date Picker 는 빨강) — `.open` 이면 어떻게 열었든 |

새로 내보내는 컴포넌트 · 함수 · 타입: `DateRangePicker` · `parseYear` · `DateRangePickerProps` · `DateRangeValue` · `DateChangeInfo` · `DateUnit` · `DateValidity` · `DatePickerLabels`.

## Button (2026-10-28)

Button 정의를 다시 내렸습니다. 형태(`variant`: solid · outline)와 색(`color`: primary · assistive · negative)을 나누고,
높이를 4px 씩 낮췄습니다. 별칭은 두지 않았습니다 — TypeScript 는 옛 값을 타입 오류로 알려 주지만,
**JS 로 쓰거나 HTML 클래스를 직접 쓰는 쪽은 옛 이름이 아무 신호 없이 "면 없는 검은 글자 버튼"이 됩니다**
(`btn md primary` · `btn md secondary` 는 이제 어느 규칙에도 걸리지 않습니다). React 는 개발 모드에서 옛 `variant` 값과
`icon` · `leading` · `trailing` prop 을 콘솔로 알리고 DOM 에는 내지 않습니다. HTML 은 아래 표대로 클래스를 바꿔야 합니다.

| 전 | 지금 (React) | 지금 (클래스) |
| --- | --- | --- |
| `variant="primary"` (기본) | 생략 (= `variant="solid" color="primary"`) | `.btn.solid.primary` |
| `variant="secondary"` | `variant="outline" color="assistive"` — 대체 행동이면 `variant="outline"`(primary) | `.btn.outline.assistive` |
| `variant="tertiary"` | `color="assistive"` | `.btn.solid.assistive` |
| `variant="danger"` | `color="negative"` | `.btn.solid.negative` |
| `variant="danger-secondary"` | `variant="outline" color="negative"` | `.btn.outline.negative` |
| `variant="text"` | 그대로(정의 밖 변형, 색은 primary · assistive — `color="assistive"`) | `.btn.text` · `.btn.text.assistive` |
| `icon` | `iconOnly` — `variant` 를 생략하면 배경 없음, hover 에만 면 | `.icon` → `.icon-only` |
| `leading` / `trailing` | `iconLeft` / `iconRight` (동시에 쓰지 않음) | — |
| — | `ButtonGroup vertical` (주 행동이 위) | `.btn-group.vertical` |

| 바뀐 것 | 전 | 후 |
| --- | --- | --- |
| Button 높이 sm · md · lg | 36 · 44 · 52 | 32 · 40 · 48 (padding · 글자 · 아이콘 크기는 그대로) |
| Text Field · Date Picker 필드 높이 | 36 · 44 · 52 | 32 · 40 · 48 — 버튼과 나란히 맞는다 |
| `loading` 이 막는 것 | click(마우스 클릭은 `pointer-events:none` 으로 버튼을 지나 **부모에서 실행**됐다) | `onClick` · `onMouseDown` · `onPointerDown` · `onKeyDown` 과 그 캡처 변형 — 부모로도 올라가지 않는다. 탐색 키(Tab · Esc · 화살표 · Home/End · PageUp/Down)와 수정 키 조합은 부모로 올라간다. 포커스는 남는다 |
| 사용자의 `onClickCapture` · 핸들러가 loading 가드를 덮음 | 덮었다(`rest` 가 뒤) | 덮지 못한다 |
| 아이콘 전용 기본 면 | 변형의 면 | `variant` 생략 시 배경 없음 |
| 표 행 동작 `.tbl .actions .btn` · `.action-bar .btn` 높이 덮어쓰기 | 32 로 덮음 | `sm`(32) 을 쓴다 — 표 행 덮어쓰기는 지움, 액션 바는 좌우 12 만 남음 |

| 변형 규칙의 특이도 | `.btn.primary` 등 (0,2,0) | `.btn:where(.solid.primary)` 등 (0,1,0) — 비활성 `.btn[disabled]` 하나가 순서와 무관하게 이긴다. **그 대신 제품 CSS 의 클래스 하나짜리 규칙(0,1,0)이 style.css 뒤에 오면 버튼의 면 · 글자를 이기고**, `.x .btn`(0,2,0) 은 hover · pressed · 비활성까지 이긴다. 버튼을 덮어쓰고 있었다면 확인하세요 |

새로 내보내는 타입: `ButtonColor`.

## Accordion (2026-10-29)

Accordion 정의를 다시 내렸습니다. 형태(`variant`: outline · flat)와 크기(`size`: sm · md · lg)를 두고, 헤더에 Hover 면을 더했습니다.
`flat` boolean 은 별칭 없이 바뀌었습니다 — React 는 개발 모드에서 옛 prop 을 알리고 DOM 에는 내지 않습니다.

| 전 | 지금 (React) | 지금 (클래스) |
| --- | --- | --- |
| (기본) | 생략 (= `variant="outline" size="md"`) | `.accordion.md.outline` — 클래스가 없어도 같은 모양 |
| `flat` | `variant="flat"` | `.accordion.flat` |
| `AccordionGroup flat` | `AccordionGroup variant="flat"` | `.accordion-group.flat` |
| — | `size="sm"` · `size="lg"` (헤더 40 · 60, 기본 md 52) | `.accordion.sm` · `.accordion.lg` |
| — | 헤더 Hover — 면 `--surface-neutral-secondary` | `.accordion summary:hover` |

헤더 안에는 버튼 · 체크박스 같은 조작 요소를 두지 않습니다 — 약관 동의(`Terms`)의 항목 체크박스만 예외입니다.
새로 내보내는 타입: `AccordionVariant`.


## Breadcrumb (2026-10-30)

Breadcrumb 정의를 다시 내렸습니다. 경로는 **항상 홈 아이콘으로 시작**하고, 좌측 메뉴 아래로 들어간 상세 · 편집 · 하위 화면에만 둡니다.
기존 API 는 그대로이고 바뀌는 동작은 없습니다 — 첫 항목을 쉽게 지키도록 `BreadcrumbHome` 을 더했습니다.

| 전 | 지금 (React) | 지금 (클래스) |
| --- | --- | --- |
| `BreadcrumbItem href linkProps={{ className: "icon", "aria-label": "홈" }}` + `<Icon name="home" />` | `BreadcrumbHome href` (`label` 기본 "홈") | `li > a.icon[aria-label="홈"]` |
| `BreadcrumbItem` (href 없음) → 빈 `<a>` | `BreadcrumbItem` (href · current 없음) → `<span>` — 페이지가 없는 상위 단계 | `li > span` |
| 행 높이 22.4 · 아이콘 행 24.4 | 24 한 크기 | `.breadcrumb{line-height:22px;min-height:24px}` · `a.icon{display:flex}` |

`href` 없이 `as`(라우터 링크)만 주는 경우는 링크로 그대로 그립니다.
새로 내보내는 컴포넌트 · 타입: `BreadcrumbHome` · `BreadcrumbHomeProps`.

## Card (2026-11-02)

Card 정의를 다시 내렸습니다. 유형은 기본 정보 · 상태 · 목록 · 표 · 선택 · 빈/오류 · Loading 이고, 크기는 Button · Accordion 처럼 `size`(sm · md)로 고릅니다.
숫자 하나는 `Kpi`, 그래프는 `ChartCard` 를 씁니다(Data Visual).

| 전 | 지금 (React) | 지금 (클래스) |
| --- | --- | --- |
| `compact` | `size="sm"` — 값은 같습니다(padding 16 · gap 8 · 제목 14/20 600). `compact` 는 `sm` 클래스로 그리고 개발 모드에서 경고합니다 | `.card.sm` (`.card.compact` 는 같은 값의 별칭) |
| (기본) | `size="md"` 를 명시할 수 있습니다 — 기본값과 같습니다 | `.card.md` |
| — | `disabled` — 고를 수 없는 선택 카드. `as="button"` 이면 `disabled`, 그 밖은 `aria-disabled`. 이유는 `CardDesc` 에 | `.card.clickable:disabled` · `[aria-disabled="true"]` |
| 상태 카드의 키-값을 직접 마크업 | `CardMeta items={[{ label, value }]}` | `dl.card-meta` |

타이포 Title/1 이 500 → **600** 이 됐습니다(카드 제목 · Chart Card 제목 · Accordion md 헤더와 같은 값). `.t-title-1` 을 쓰던 글자는 굵어집니다.
새로 내보내는 컴포넌트 · 타입: `CardMeta` · `CardMetaProps` · `CardMetaItem`.

2026-11-03 — `variant`(outline · flat)를 더했습니다. 기본은 outline 이라 바꿀 것은 없습니다.

| 전 | 지금 (React) | 지금 (클래스) |
| --- | --- | --- |
| 회색 바탕 위에서도 1px 보더 | `Card` · `Kpi` · `ChartCard` 의 `variant="flat"` — 보더 색만 지웁니다(두께 1px 는 남아 크기 같음). `background/neutral/secondary` 위에서만 쓰고 흰 바탕 위에서는 쓰지 않습니다 | `.card.flat` · `.kpi.flat` · `.chart-card.flat` |

## Data Visual — 탐색형 차트 (2026-11-03)

정적 요약(`Kpi` · `Sparkline` · `BarChart` · `Donut`, CSS)은 그대로입니다. 축 · 툴팁 · 시계열이 필요한 **탐색형 차트**가 Chart.js(MIT) 위에 더해졌습니다.
별도 진입점이라 차트를 안 쓰는 제품은 바뀌는 것이 없고 `dist/index.js` 는 chart.js 를 참조하지 않습니다.

| 전 | 지금 (React) | 지금 (클래스) |
| --- | --- | --- |
| 없음 | `npm i chart.js`(optional peer) → `import { ChartCanvas, presets } from "@jiran/ds-react/chart"` · `import { Chart } from "chart.js/auto"` | `.chart-canvas > canvas[data-chart][data-spec]` + `assets/vendor/chart.umd.js` · `assets/ds-chart.js` |
| — | `<ChartCanvas chart={Chart} config={presets.timeseries(spec)} aria-label="…" />` — `aria-label` 은 필수 | `canvas[role=img][aria-label]` |
| — | `presets.timeseries · bar · donut · mixed` · `chartTheme` · `mountChart` · `useDsChart` | `DSChart.presets · theme · mount · auto` |

색은 `--chart-series-1~6`(순서 고정 · 제품색과 무관) 과 심각도 토큰(`tone`)만 쓰고, 라이트/다크 · 제품 색 전환 때 자동으로 다시 칠합니다. y 축은 하나입니다(이중 축 금지).

## 약관 동의 (2026-11-09)

'다음' 을 비활성으로 두지 않습니다(Foundations › Interaction › Disabled). 필수 항목을 비운 채 누르면 넘어가지 않고 남은 개수를 알립니다.

| 전 | 지금 (React) | 지금 (클래스) |
| --- | --- | --- |
| `<Button disabled={!requiredOk}>` | `<Button onClick={next}>` — `next` 에서 비운 필수 항목을 검사하고 첫 항목으로 포커스 | 그대로 `.btn-group .btn.primary` — ds.js 가 캡처에서 막아 버튼의 핸들러까지 가지 않음 |
| 없음 | `<TermsMessage>`(`aria-live="polite"`) | `.terms > .msg[aria-live=polite]` — 없으면 ds.js 가 만듭니다. 스크린 리더가 읽도록 미리 두는 편이 낫습니다 |

## Text Field · 입력 검증 (2026-11-09)

| 전 | 지금 (React) | 지금 (클래스) |
| --- | --- | --- |
| `maxLength` 가 네이티브 — 한도에서 입력이 멈추고 붙여넣은 값이 잘림 | 같은 이름이지만 **넘겨도 입력되고 오류로 알립니다.** 넘은 상태로는 `Form validate` 를 통과하지 못합니다 | `maxlength` → `data-maxlength` + `.counter`. 네이티브 `maxlength` 는 그대로 두면 예전처럼 잘립니다 |
| 검증을 제품이 직접 | `<Form validate messages onValidate>` — 표준 제약(`required` · `pattern` · `min` · `max` · `minLength` · `type`) + 글자 수 | `form[data-validate]` · `data-messages`(JSON) · 이벤트 `ds:validate` · `DS.validate(form)` |
| 없음 | `<TextField reveal>` | `.affix` 안 `button.reveal[aria-pressed]` |
| 없음 | `<TextField mono>` — 2026-11-13 에 없앰(아래 절) | `.field.mono` — 같은 날 없앰 |
| 없음 | `<FormLegend />` | `.form-legend` |

- 검증하는 폼에서 막히면 `onSubmit` 은 불리지 않습니다. `onValidate` 로 결과를 받습니다.
- `error` prop 으로 넣은 오류(서버 응답 등)는 제출을 막지 않습니다. 사이트의 `.field.error` 는 다음 검증 때 지워집니다.
- Select · Checkbox · Radio 는 아직 이 검증에 들어오지 않습니다(각 컴포넌트 정비 때).
- placeholder 색이 `foreground/disable/primary` → `foreground/neutral/tertiary` 로 올라갔습니다(Text Field · Search · Select).

## Search (2026-11-09)

| 전 | 지금 (React) | 지금 (클래스) |
| --- | --- | --- |
| 입력마다 `onChange` 뿐 | 그대로 + `debounce` · `onSearch(value, trigger)` | `.searchbar[data-debounce]` · 이벤트 `ds:search` {value, trigger} |
| 없음 | `status`(숨긴 `role=status`) | `.sr-only[role=status]` — 글자는 제품이 넣습니다 |
| `hotkey` | 그대로. `select` · contenteditable · 조합키 · 모달이 열린 동안에도 무시 | `.searchbar[data-hotkey]` — 전에는 `kbd` 가 보이기만 했습니다 |
| Esc 는 `clearable` 일 때만 | 값이 있으면 언제나 지웁니다. 지운 Esc 는 부모로 가지 않아 대화상자가 닫히지 않습니다 | 같음 |
| `onSubmit` 이 한글 조합을 끝내는 Enter 에도 불림 | 불리지 않습니다 | `ds:search` 도 같음 |

## Select · Combobox (2026-11-09)

| 전 | 지금 (React) | 지금 (클래스) |
| --- | --- | --- |
| 폼에 값이 안 감 | `name`(숨은 input) · `required` — `<Form validate>` 에 참여 | `.dropdown[data-name][data-required]` + 안에 `input[type=hidden]` |
| 값 비우기 없음 | 값 `""` 옵션을 고르면 placeholder 로 | `data-value=""` 항목 |
| 불러오는 중 · 실패 · 없음이 메뉴에 없음 | `status` · `statusText` · `onRetry`, 옵션이 없으면 empty | `.menu-state` 한 줄 · `[data-retry]` · 이벤트 `ds:retry` |
| 필드 라벨이 트리거 이름에 없음 | `<Field>` 안이면 자동 | 라벨 `id` + 트리거 `aria-labelledby="라벨 자기"` |
| 트리거 폭 200 고정 | 필드 안에서는 필드 폭 | 같음(`.field .dropdown`) |
| 사이트: 닫힌 트리거 ↑↓ 없음 · 열린 메뉴에서 Tab 하면 메뉴가 남음 | React 와 같게. Tab 은 트리거로 돌아와 다음 칸으로 | 같음 |
| Esc 가 Dropdown 과 Popup 을 함께 닫음 | `useEscape` 는 켜진 것 중 가장 나중 것만 부릅니다 | 열린 Select 만 닫힘 |
| — | 새 컴포넌트 `Combobox`(`multiple` · `filter` · `onQueryChange` · `status`) | `.combobox` · `data-multiple` · `data-filter` · 이벤트 `ds:select` · `ds:query` |

주의: `useEscape` 를 직접 쓰는 제품은 이제 다른 열린 것이 뒤에 켜졌으면 불리지 않습니다.

## Dropdown (2026-11-10)

| 전 | 지금 (React) | 지금 (클래스) |
| --- | --- | --- |
| 동작 메뉴의 선택 표시 `MenuItem selected` | 동작 메뉴(`kind="menu"`)에서는 그리지 않고 경고합니다. 현재 값은 `Select` · `SelectButton` | `role=menu` 안의 `.on` 을 쓰지 않습니다 |
| 이동 항목 없음 | `MenuItem href` · `target` · `rel` | `li[role=none] > a.menu-item[role=menuitem]` |
| 항목을 실행하면 포커스가 사라짐 | 닫고 트리거로 돌아옵니다(Select 도 같음) | 이미 그랬습니다 |
| 스크롤 영역 안에서 메뉴가 잘림 | 자동으로 화면 기준으로 띄웁니다(`.float`). 스크롤 · 창 크기 변경에 닫힘 | 같음 — `ds.js` 가 열 때 잽니다 |

주의: 띄운 메뉴는 트리거를 따라가지 않으므로 스크롤하면 닫힙니다. 스크롤 영역 안에서 메뉴를 열어 둔 채 다른 내용을 스크롤하는 흐름에는 쓰지 않습니다.

## 선택 컨트롤 (2026-11-10)

- **Select Button** — 토글 묶음에서 라디오 묶음으로 바뀌었습니다. `role="group"` → `radiogroup`, 버튼 `aria-pressed` → `role="radio"` `aria-checked`. `SelectButton` 의 props 는 그대로입니다. `getByRole("button")` 으로 찾던 테스트는 `getByRole("radio")` 로 고칩니다. 직접 쓴 마크업은 ds.js 의 화살표 이동을 받으려면 역할을 바꿔야 합니다.
- **Chip** — Input Chip 의 지우기가 `<i role="button">` 에서 `<button class="x">` 로, 값은 `.lbl` 안으로 옮겼습니다. 접근 이름은 값을 포함합니다(`10.0.0.12 삭제`). 글자가 문자열이 아니면 `removeLabel` 그대로입니다. 비활성은 `aria-disabled` 대신 `disabled` 입니다. 사이트 마크업도 같습니다.
- **ChipGroup** — `clearable` · `onClear` · `clearLabel` 이 생겼습니다. 사이트는 `[data-chip-reset]` 버튼입니다.
- **Switch** — `action` 을 주면 응답 후 반영입니다(`false` 를 돌려주면 그대로, 던지면 Toast). `<ToastProvider>` 안에서 써야 합니다. `action` 이 없으면 동작이 그대로입니다. 사이트는 `.switch[data-async]` + `ds:switch` 이며, 제품이 `resolve()` · `reject(문구)` · `cancel()` 중 하나를 부르지 않으면 처리 중으로 남습니다.
- **CheckboxGroup · RadioGroup** — `legend` · `required` · `help` · `error` 가 생겼습니다. `<Form validate>` 안의 `legend` 그룹은 `.field` 로 감싸집니다. `CheckboxGroup` 의 ref 타입은 `HTMLElement` 입니다.
- **DataTable** — 행 체크박스의 접근 이름이 '선택' 에서 '첫 열 값 선택' 으로 바뀌었습니다. `rowLabel` 로 바꿀 수 있습니다.
- **Slider** — `valueText` 가 문자열을 돌려주면 `aria-valuetext` 로도 나갑니다.

## 피드백 · 오버레이 (2026-11-10)

- **Toast** — `tone="danger"` 는 `duration` 을 줘도 닫을 때까지 남고 닫기 버튼이 생깁니다. `action` 이 있으면 기본 10초입니다. 동작이 없는 같은 문구는 쌓지 않고 시간을 다시 잽니다. 넘치면 자동으로 사라지는 것부터 지우므로, 오류가 많으면 3개를 넘습니다.
- **Banner** — `onClose` 를 주면 닫기 버튼이 생깁니다. 다시 띄울지는 제품이 정합니다.
- **PopupSurface** — `onClose` 가 필수입니다. `PopupTitle` 이 헤더의 닫기(X)를 그립니다. `closeLabel` 로 이름을 바꿉니다.
- **Popup** — `closeOnBackdrop` 의 기본값이 `true` 에서 '위험 확인이 아니고 입력하지 않았을 때' 로 바뀌었습니다. 예전처럼 늘 닫으려면 `closeOnBackdrop` 을 직접 주세요. `busy` 를 주면 X · Esc · 배경이 막힙니다(취소 버튼의 `disabled` 는 제품이 줍니다). `danger` 는 `role="alertdialog"` 입니다.
- **Popup 포커스** — 상태로 열 때 포커스 이동 · Tab 가둠 · 복귀가 동작하지 않던 것을 고쳤습니다. 첫 포커스는 닫기(X)와 `.negative` 버튼을 건너뜁니다.
- **Tooltip** — 아이콘 버튼의 `aria-label` 이 `content` 와 같으면 `aria-describedby` 를 잇지 않습니다. 마우스는 0.3초 뒤에 뜨고, Esc 로 닫힙니다. 화면 끝에서는 반대쪽으로 뒤집습니다.
- **Spinner** — `label` 에 실제 작업을 적어 주세요(사이트 예제는 빌드가 검사합니다). 줄인 모션 설정에서도 돕니다.
- **SidePanel** — 새 컴포넌트입니다(`open` · `onClose` · `title` · `footer` · `size` · `modal` · `closeLabel`). 사이트는 `.side-panel` · `DS.panel` · 이벤트 `ds:panel-close` 입니다.

## 데이터 (2026-11-10)

- **TableHeader** — `sortable` 이면 글자를 `<button class="sort">` 로 감쌉니다(전에는 `th` 클릭뿐이라 키보드로 닿지 않았습니다). `getByRole("columnheader")` 를 눌러 정렬하던 시험은 `getByRole("button")` 으로 바꿔야 합니다. 사이트 마크업도 `<th class="sortable"><button type="button" class="sort">…</button></th>` 입니다(빌드가 검사).
- **TableCell** — `truncate` 가 생겼습니다.
- **DataTable 머리글 체크박스** — **이 페이지의 켜진 행만** 고르고 끕니다. 전에는 끌 때 다른 페이지의 선택까지 지웠고 비활성 행까지 골랐습니다.
- **DataTable `actionBar`** — 둘째 인자 `{ allMatching, count }` 가 생겼습니다. 첫째 인자는 그대로입니다. 전체 결과를 고른 상태의 실행은 제품 서버가 합니다.
- **DataTable 행 클릭** — 안쪽 버튼 · 링크 · 입력을 누르거나 글자를 드래그해 선택하면 `rowProps` 의 `onClick` 이 불리지 않습니다.
- **DataTable 새 props** — `manualSort`(서버 정렬 — 줄을 움직이지 않음) · `selectionScope`(값이 바뀌면 선택을 지움) · `totalCount` · `allMatching` · `defaultAllMatching` · `onAllMatchingChange` · `selectNoticeText` · `status` · `statusLabel` · `loadingRows` · `errorText` · `onRetry` · `retryLabel` · `stickyHeader` · `maxHeight` · `caption`, column `truncate`.
- **List** — 안쪽 조작을 누르면 행의 `onClick` 이 불리지 않습니다. Enter 는 행 자신에 포커스가 있을 때만 행을 누릅니다(전에는 안쪽 버튼의 Enter 를 행이 가로챘습니다).
- **PaginationBar** — `summary` + `children` 은 그대로이고, `total` · `page` · `pageSize` · `pageSizes` · `onPageChange` · `onPageSizeChange` · `target` 을 주면 건수 · 표시 개수 · 번호를 스스로 그립니다. 표시 개수를 바꾸면 1페이지로 돌아가고, 한 페이지뿐이면 번호를 숨깁니다. 표준 표시 개수는 `PAGE_SIZES`(20 · 50 · 100)입니다.
- **Pagination** — 번호 칸이 9칸을 넘으면 경고합니다. 끝에 닿아 꺼진 화살표의 포커스는 켜져 있는 쪽으로 옮깁니다.
- **CursorPagination** — 새 컴포넌트입니다. 사이트는 `.pagination.cursor` · 이벤트 `ds:page {direction}` 입니다.
- **사이트 Item Tile** — `data-single` 을 없앴습니다. Tile 은 다중 선택이고, 하나만 고르면 Card Radio 입니다(빌드가 검사). 온보딩 패턴의 보호 수준이 Card Radio 로 바뀌었습니다.
- **사이트 Data Table** — `ds:sort` · `ds:select-all` · `ds:retry` 이벤트, `table[data-sort="server"]`, `.tbl-wrap[data-total]`, `DS.table.removeRow(tr)` 가 생겼습니다.

## 탐색 · 표시 (2026-11-10)

- **TabPanel** — `keepMounted` 기본값이 `false` 에서 `true` 로 바뀌었습니다. 탭을 옮겨도 입력이 남습니다. 숨은 패널도 처음부터 그려지므로, 무거운 패널이나 열 때 불러오는 패널은 `keepMounted={false}` 를 주세요. 패널은 `tabIndex=0` 입니다.
- **TabList** — 넘치면 탭 줄만 옆으로 스크롤합니다. `.tabs` 의 아랫줄이 `border-bottom` 에서 안쪽 그림자로 바뀌어 높이는 같습니다. `.tabs` 에 `border` 를 덧씌운 제품 CSS 는 확인하세요.
- **SideNavItem** — 접힌 레일의 이름이 `title` 에서 `aria-label` + Tooltip 으로 바뀌었습니다. 항목이 `.tooltip-wrap` 으로 한 겹 감싸입니다. 직접 준 `title` 은 그대로입니다.
- **SkipLink** — 새 컴포넌트입니다. 페이지의 첫 포커스에 둡니다. 사이트는 `.skip-link` 입니다.
- **Steps** — `components/steps/Steps` 로 옮겼습니다. `@jiran/ds-react` 에서 가져오는 코드는 그대로입니다. `onStepClick` 을 주면 완료 단계가 버튼이 됩니다. 3~6단계를 벗어나면 경고합니다. 사이트는 `.step-btn` · 이벤트 `ds:step {index}` 입니다.
- **TagGroup** — 새 컴포넌트입니다(`max` · `moreLabel`). 사이트는 `.tag-group` · `.tag-more` 입니다.
- **Tag** — 폭 160 에서 줄바꿈합니다. 전에는 `white-space:nowrap` 으로 끝없이 늘어났습니다.
- **Tooltip** — 키보드 포커스로 뜬 툴팁은 스크롤해도 닫히지 않고 다시 재서 따라갑니다. 마우스로 뜬 것은 전처럼 닫힙니다.

## Form · Empty State · Page Header · Avatar · Link (2026-11-10)

- **PageHead** — 제목 태그의 기본값이 `h2` 에서 `h1` 로 바뀌었습니다. 화면에 다른 `h1` 이 있으면 `as="h2"` 를 주세요. `breadcrumb` 를 더했습니다. Breadcrumb 를 PageHead 바깥에 둔 코드는 그대로 동작하지만, 8px 간격을 직접 맞출 필요가 없어졌습니다.
- **.page-head** — `display:flex` 에서 2열 grid 로 바뀌었습니다. `.page-head` 에 자식을 더 넣은 제품 코드는 확인하세요.
- **ErrorSummary** — 새 컴포넌트입니다(`items` · `count` · `title`). 서버가 돌려준 오류를 폼 맨 위에 넣을 때 씁니다. 오류가 3개 미만이면 경고합니다.
- **Form validate** — 자동 요약이 인라인 `margin-bottom` 대신 `.form-summary` 를 씁니다. CSS 를 함께 올려 주세요.
- **Link** — 새 컴포넌트입니다(`standalone` · `external` · `as`). 사이트는 `.link` 입니다.
- **.link** — 전에는 표 안에서만 스타일이 있었습니다. 표 밖의 `.link` 는 이제 제품 색 · 밑줄로 그려집니다. 그 줄 자체가 링크이면 `.standalone` 을 더하세요.
- **Empty** — `compact` 의 제목 · 설명 크기가 인라인 스타일에서 CSS 로 옮겨 갔습니다. CSS 를 함께 올려 주세요.
- **문서 주소** — 빈 화면이 `#/patterns/empty-state` 에서 `#/components/empty-state` 로 옮겨 갔습니다.

## 기간 상한 · Breadcrumb · 차트 표로 보기 (2026-11-10)

- **DateRangePicker `maxDays`** — 새 prop 입니다. `DateValidity` 에 `"long"` 이 더해졌습니다. validity 를 빠짐없이 나누는 제품 코드는 확인하세요. `DatePickerMessages` 를 통째로 넘기는 코드에는 `long` 이 필요합니다(`Partial` 로 넘기는 `messages` 는 그대로입니다).
- **BreadcrumbItem** — 잘린 항목에만 Tooltip 이 붙습니다. `linkProps={{ title }}` 와 `title` 은 지워 주세요(키보드로 볼 수 없습니다).
- **Tooltip `describe`** — 새 prop 입니다. 기본 `true` 는 전과 같습니다.
- **ChartCanvas** — 바깥 요소가 `.chart-canvas` 에서 `.chart-view` 로 바뀌었고 그 안에 표로 보기 버튼이 있습니다. `className` · `style` · `height` 는 그대로 `.chart-canvas` 로 갑니다. 버튼을 포함해 차트가 40 높아집니다. 문구는 `labels` 입니다(빈 칸의 숨긴 문구 `empty` 포함). `DSChart.tableData` 는 빈 칸을 `null` 로 돌려줍니다.
- **사이트 마크업** — 탐색형 차트는 `.chart-view > .chart-tools > button[data-chart-table]` 과 `.chart-canvas` 를 함께 씁니다. CSS 와 `ds-chart.js` 를 함께 올려 주세요.

## Loading 지연 · Slider 숫자 입력 (2026-11-11)

- **Spinner · Skeleton · SkeletonRow `delay`** — 새 prop 입니다(true 는 1초, 숫자는 ms). 주지 않으면 전과 같습니다. 끝까지 보일지를 정하려면 `useLoadingDelay(loading, { delay, minDuration })` 를 씁니다(기본 1000 · 500). 그 값으로 그리는 Spinner 에는 `delay` 를 주지 않습니다.
- **Slider `withInput` · `unit` · `help` · `error` · `messages`** — 새 prop 입니다. `withInput` 이면 바깥이 `.field.number-field.slider-field` 이고 `name` 과 나머지 속성은 숫자 입력칸으로 갑니다. `ref` 는 그대로 트랙(range)입니다. `onChange` 는 입력칸에 친 수(범위 밖 포함)마다 불리고 빈 칸에는 불리지 않습니다.
- **TextField `wrapControl`** — 새 prop 입니다. 입력(.affix)을 감싸 옆에 다른 컨트롤을 둡니다.
- **줄인 모션** — 패키지 CSS 의 base 가 사이트와 같아졌습니다. 전에는 패키지에서 Spinner · 버튼 loading · Switch 처리 중이 줄인 모션에서 멈췄습니다(2026-11-10 결정이 패키지에 빠져 있었음).
- **`.field input` 규칙** — range 입력을 빼도록 바뀌었습니다(`:not([type=range])`, 명시도는 그대로). 제품 CSS 가 이 선택자 문자열에 기대고 있으면 확인하세요.

## Data Table 행 펼침 (2026-11-11)

- **DataTable `renderExpanded` · `expandable` · `expanded` · `defaultExpanded` · `onExpandedChange` · `expandScope` · `expandLabel`** — 새 prop 입니다. `renderExpanded` 를 주지 않으면 전과 같습니다. 주면 맨 앞에 셰브론 칸(`th.expand` · `td.expand`)이 생겨 열 수가 하나 늘고, 각 행 바로 뒤에 `tr.row-detail` 이 붙습니다.
- **`tbody tr` 를 세는 제품 코드** — 펼침을 켜면 상세 행이 섞입니다. 행만 셀 때는 `tbody > tr:not(.row-detail)` 로 고르세요.
- **사이트 마크업** — `th.expand`(숨긴 이름) · `td.expand > button.expand-btn[aria-expanded][aria-controls][aria-label]` · 바로 뒤 `tr.row-detail[hidden] > td[colspan] > .row-detail-body`. `ds:row-expand` 는 행(tr)에서 납니다(Breadcrumb 의 `ds:expand` 와 이름을 나눔). 정렬 · `DS.table.removeRow` 는 상세 행을 함께 옮기고 지웁니다.
- **줄무늬 · hover** — `.zebra` 와 행 hover 가 상세 행을 세지 않도록 선택자가 바뀌었습니다(`:where(:not(.row-detail))`, 명시도는 그대로).

## Tag 점 · 글자색 · SevCell (2026-11-11)

- **Tag 의 기본은 점 없음**입니다. 글자가 틴트와 같은 색상의 진한 톤(`--foreground-*-heavy`)으로 색을 나릅니다. 점이 필요하면 `dot` 을 씁니다.
- `variant="plain"` 은 없어졌습니다 — 기본이 점 없음이라 뜻이 없어졌습니다. 쓰면 개발 모드에서 경고하고 기본(subtle)으로 그립니다. 지우면 됩니다.
- **`SevCell` 은 없어졌습니다**(행 좌측 색 막대 — Tag 글자가 색을 나르므로 겹친 정보). 쓰면 한 번 경고하고 막대 없이 내용만 그립니다. 심각도 칸은 `<Tag tone={sev} size="sm">` 하나로 씁니다. CSS `.sev-cell` 도 없습니다.

| 전 | 후 |
| --- | --- |
| `<Tag variant="plain">v2</Tag>` | `<Tag>v2</Tag>` |
| `<Tag tone="critical">` (점 있음) | `<Tag tone="critical" dot>` |
| `<SevCell tone="high"><Tag tone="high">High</Tag></SevCell>` | `<Tag tone="high">High</Tag>` |

## 크기 단위 rem · 화면 폭 단계 (2026-11-11)

- **패키지 CSS 의 크기는 rem 입니다** — 글자(`--font-size-10 ~ 48` 토큰) · 간격(`--space-*`) · 높이 · 반경. 기준(`html` 16px)에서는 전과 픽셀이 같습니다.
  테두리 · 그림자 · 2px 이하만 px 입니다. 제품 CSS 가 `--space-*` · `--radius-*` 값을 px 숫자로 읽고 있었다면(`parseFloat`) 이제 rem 글자가 옵니다 — 계산값(`getComputedStyle(el).padding` 등)으로 읽으세요.
- **`html` 글꼴 크기를 바꾸면 화면 전체가 따라갑니다.** `html{font-size:62.5%}` 같은 재정의가 있으면 화면이 62.5% 로 줄어듭니다 — 지우세요.
  개발 모드에서 루트가 12px 미만이면 한 번 경고합니다(`checkRootFontSize`). 사용자가 브라우저 글꼴을 키운 경우(예: 20px)는 정상이라 조용합니다.
- **화면 폭 단계(선택)** — `import "@jiran/ds-react/scale.css"` 를 하면 ~1279 93.75% · 1280~1919 100% · 1920~ 106.25% · 2560~ 112.5% 로 루트가 바뀝니다.
  12px 이하 글자는 좁은 화면에서도 줄지 않습니다. 불러오지 않으면 지금과 같습니다.
- 아이콘(`Icon size`)은 `width` 속성을 그대로 내고, 패키지 CSS 가 같은 값을 rem 으로 다시 줍니다(명시도 0 — 제품 CSS 가 정한 크기가 이깁니다).
- `.ds-root` 기본 글자 15px → `0.9375rem`(기준에서 같음). 탐색형 차트(`@jiran/ds-react/chart`)의 글자 · 여백은 루트 비율을 곱하고, 단계가 바뀌면 다시 칠합니다.

## Table · Data Table — 테두리 없는 표 · 밀도 세 단계 (2026-11-11)

- **표를 감싸는 테두리 · radius · 면이 없어졌습니다**(`.tbl-wrap`). 표는 놓인 자리(페이지 · 카드)의 면을 씁니다. 위 경계는 회색 헤더 면, 아래 경계는 **마지막 행 아래 선**입니다(전에는 테두리가 대신해 마지막 행 선이 없었습니다).
  카드 안에서 `wrap={false}` 로 이중 테두리를 피하던 코드는 그대로 동작합니다 — 이제 이유는 '카드 패딩 없이 표를 붙일 때' 입니다.
- **행 높이가 바뀌었습니다** — 기본 52 → **48**, `compact` 44 → **40**, 새 `relaxed` 56. 헤더는 44 · 40 · 48. 행 높이를 픽셀로 단정하던 제품 시험은 고쳐야 합니다.
- **`Table` · `DataTable` 의 `density`**(`"compact" | "default" | "relaxed"`) · **`rowStyle`**(`"lines" | "zebra" | "grid" | "plain"`) — 새 prop 입니다. 기존 `compact` · `zebra` boolean 은 그대로 받고, 둘 다 주면 `density` · `rowStyle` 이 이깁니다(경고 없음).
- **`TableFoot`** · `TableRow total`(합계 행) · `TableCell sub`(값 아래 하위 텍스트 `.cell-sub`)가 생겼습니다.
- **DataTable 새 props** — `stickyColumn`(맨 앞 체크 · 펼침 칸과 첫 열 고정 — `aria-label` 또는 `caption` 이 영역 이름이 됩니다) · `summaryRow`(열 key → 합계 칸) · column `sub`.
- **숫자는 표 전체가 고정폭**(`font-variant-numeric:tabular-nums` 가 `.tbl` 에)입니다. `.num` 은 오른쪽 정렬만 남았습니다 — 크기를 견주는 숫자(건수 · % · 용량)에만 쓰고 날짜 · ID · IP 는 왼쪽에 둡니다.
- **사이트 마크업** — `.tbl.relaxed` · `.tbl.grid` · `.tbl.plain` · `.tbl-wrap.sticky-col`(tabindex + 이름, 빌드가 검사) · `tfoot tr.total` · `td > .cell-sub`, 밀도 전환 `.select-btn[data-density-for="표 id"]` 의 `button[data-density]`. `.plain` 은 `.zebra` · `.grid` 와, `.compact` 는 `.relaxed` 와 함께 쓰지 않습니다(빌드가 검사).
- 런타임 변수 `--tbl-tint`(행 상태 면) · `--tbl-surface`(고정 칸의 불투명 면)가 생겼습니다. 제품 CSS 가 `.tbl td` 의 `background` 를 직접 칠하던 곳은 고정 열에서 덮일 수 있으니 `--tbl-tint` 로 바꾸세요.

## 표 안의 brand 덜기 · 늘 있는 액션 바 (2026-11-12)

- **`DataTable actionBar` 는 선택이 없어도 불립니다**(첫째 인자가 빈 Set, `count` 0). 전에는 고른 것이 있을 때만 불렸습니다. `sel.size > 0` 일 때만 그리던 제품 코드는 그 조건을 빼면 됩니다.
- **`ActionBar count={0}`** 이면 안의 `Button` 이 `aria-disabled="true"` 로 꺼집니다(포커스는 남고 `onClick` 은 부르지 않습니다). 제품이 준 `disabled` 는 그대로입니다. 바 안에 `Button` 이 아닌 버튼을 넣었다면 직접 꺼야 합니다.
- 액션 바의 면(brand subtle)이 없어졌습니다. 정렬된 머리글은 brand → `--foreground-neutral-primary`, 표 칸의 `.link` 는 brand → 칸 글자색(hover 밑줄)입니다.
- 사이트: `.tbl-wrap > .action-bar` 는 숨기지 않습니다. 0개면 ds.js 가 바 안 `.btn` 에 `aria-disabled` 와 `data-ds-off` 를 답니다(제품이 직접 단 `aria-disabled` 는 그대로 둡니다).

## Button 오류 정리 · 32 높이 반경 (2026-11-12)

- **`size="sm"` 버튼의 반경이 6 → 4**(radius/sm)입니다. md · lg 는 6 그대로입니다. 같은 32 높이인 sm 필드(Text Field · Date Picker · Combobox · Number Input 의 `size="sm"`, 필드 안 28 버튼 포함), Select Button 안쪽 버튼, 페이지당 행 수 Select 도 4 가 됐습니다.
- **loading 스피너 크기가 그 크기의 아이콘과 같아졌습니다** — sm 16 · md 18 · lg 20(전에는 크기와 상관없이 테두리까지 20). assistive 스피너 색은 `--surface-brand-primary` → `--foreground-brand-primary`(다크 대비).
- **끈 버튼(`disabled` · `aria-disabled="true"`)에 `pointer-events:none` 이 없어졌습니다** — 있으면 클릭이 버튼을 지나 뒤의 행 · 카드에서 실행됐습니다. 이제 버튼이 클릭을 받고, `disabled` 는 브라우저가, `aria-disabled` 는 ds.js · `Button` 이 막습니다. 끈 버튼 아래 요소가 클릭을 받는 데 기대던 제품 코드는 없어야 합니다.
- **`<Button aria-disabled="true">` 처럼 직접 넘긴 aria-disabled 도 클릭을 막습니다**(`onClick` 을 부르지 않고 부모로도 올리지 않음). 전에는 aria-disabled 만 나가고 클릭은 그대로 불렸습니다. `"false"` 는 막지 않습니다.
- loading · 끈 버튼은 hover · 눌림 색이 바뀌지 않습니다. 정보 Banner 안 버튼의 loading 라벨이 보이던 것 · disabled 가 흰 글자로 남던 것을 고쳤습니다(포커스 링은 loading · aria-disabled 에서도 Banner 라벨 색).
- **끈 Chip · Item Tile · Pagination 버튼 · 메뉴 항목에서도 `pointer-events:none` 이 없어졌습니다** — 버튼과 같은 이유입니다(클릭이 뒤로 떨어지고 not-allowed 커서가 보이지 않았다). hover · 눌림 모양은 없습니다.
  - `MenuItem disabled` 는 이제 제품 `onClick` 을 부르지 않고 클릭을 부모로 올리지 않습니다. 전에는 `onClick` 이 먼저 불리고 `onSelect` 만 막혔습니다(마우스는 CSS 가 막았지만 키보드 · 프로그램 클릭은 지나갔다).
  - 입력값 칩(`Chip onRemove disabled`, span)은 클릭을 부모로 올리지 않습니다. 나머지(button)는 브라우저의 `disabled` 가 막습니다.
- **`Banner` 안 버튼은 끄지 않습니다**(사람의 결정) — 제품 색 면 위의 비활성 글자는 대비 1.32 로 보이지 않습니다. 할 수 없는 동작이면 버튼을 빼고 문구로 알립니다. `action` 에 끈 `Button` 이 있으면 개발 모드에서 한 번 경고합니다. loading 은 괜찮습니다.
- **`TableRow disabled` 가 `inert` 대신 `aria-disabled="true"` 를 답니다** — `inert` 는 클릭을 표 · 카드로 떨어뜨리고(제품의 표 · 카드 클릭 핸들러가 받음) 행의 글자를 스크린 리더에서 지웠습니다.
  이제 행 글자는 읽히고, 행 안 링크 · 버튼은 `tabindex=-1` + `aria-disabled` 로 Tab 에서 빠지며(행을 켜면 원래 tabindex 로 되돌림 — `data-ds-off` 에 적어 둠) 클릭은 행이 캡처에서 삼킵니다.
  행 안 요소의 `inert` 나 포커스 불가를 직접 재던 제품 코드는 `aria-disabled` 를 보게 바꿉니다.
- 끈 `Accordion` 바깥에도 `pointer-events:none` 이 없어졌습니다(헤더 클릭은 원래대로 React 가 캡처에서 막음). 헤더는 not-allowed 커서이고 hover 면이 없습니다.

## 말줄임 칸 Tooltip · 끈 커서 · 로그 한 줄 (2026-11-12)

- **`DataTable` 의 `truncate` 열이 `title` 을 넣지 않습니다** — `title` 은 키보드로 볼 수 없습니다. 대신 `TableCell truncate` 가 칸 폭을 재서(ResizeObserver) **잘린 칸에만** 전체 값 `Tooltip` 을 붙이고, 그 칸의 글자(`.cell-text`)가 Tab 칸이 됩니다. 비활성 행 안에서는 Tab 칸이 아닙니다. `td.title` 을 재던 제품 시험은 `.tooltip` 을 보게 바꿉니다.
- **`Tooltip describe={false}` 는 툴팁을 `aria-hidden` 으로 둡니다** — 화면 글자와 같은 툴팁(잘린 Breadcrumb 항목 · 말줄임 칸)이 스크린 리더에서 두 번 읽혔습니다.
- **로그 행(`TableRow log`)은 한 줄입니다** — 칸이 줄바꿈하지 않고, 행에 `td.truncate` 가 있으면 다른 칸은 글자 폭만 차지해 남는 폭을 그 칸이 갖습니다. 로그 표의 메시지 열에 `truncate` 를 주세요.
- 액션 바의 선택 건수(`.action-bar b`)는 brand → `--foreground-neutral-primary` 입니다. 끈 Number Input 증감 버튼 · 끈 File Upload 영역의 커서가 `default` → `not-allowed` 입니다.
- 사이트 마크업: `td.truncate` · `.avatar` 에 `title` 을 쓰면 빌드가 막습니다. 이름이 있는 아바타는 `role="img"` + `aria-label` 입니다.
- **`Chip onRemove` 의 값이 `title` 을 넣지 않습니다** — 240 에서 잘린 값에만 `Tooltip`(aria-hidden)이 붙습니다. 키보드는 전처럼 지우기 버튼에 포커스가 오면 값이 펼쳐집니다. 사이트는 ds.js 가 `.chip > .lbl` 을 재서 답니다(`.lbl` 에 `title` 을 쓰면 빌드가 막음).
- **compact 표의 행 동작 아이콘 버튼은 28** 입니다(`td.actions` 안 `Button size="sm" iconOnly`, 칸 위아래 패딩 5). 전에는 32 라 compact 행이 40 이 아니라 48 이었습니다.
- 기본 · relaxed 표의 행 동작 아이콘 버튼 칸도 위아래 패딩이 7 로 줄었습니다(버튼 32 그대로). 버튼이 있는 행이 48 · 56 이 아니라 57 · 65 였습니다.

## 텍스트 스타일 19단계 (2026-11-12)

스케일을 Display 1~3 · Title 1~3 · Heading 1~2 · Headline 1~2 · Body 1~2(Normal · Reading) · Label 1(Normal · Reading) · Label 2 · Caption 1~2 로 바꿨습니다.
스타일은 크기 · 행간 · 자간만 정하고, **굵기는 따로 붙입니다** — `.t-bold`(700) · `.t-semibold`(600) · `.t-medium`(500) · `.t-regular`(400). 붙이지 않으면 기본 굵기입니다(Display · Title · Heading · Headline Bold, Body Regular, Label · Caption Medium).

| 옛 클래스 | 새 클래스 | 값이 바뀌는 것 |
|---|---|---|
| `.t-display-1` 40/52 | `.t-display-2` | — |
| `.t-display-2` 32/44 | `.t-title-1` | — |
| `.t-heading-1` 28/38 | `.t-title-2` | — |
| `.t-heading-2` 24/32 | `.t-title-3` | — |
| `.t-heading-3` 20/28 | `.t-heading-2` | — |
| `.t-heading-4` 18/26 | `.t-headline-1` | — |
| `.t-title-1` 16/24 600 | `.t-body-1-normal .t-semibold` | — |
| `.t-title-1-medium` | `.t-body-1-normal .t-medium` | — |
| `.t-title-2` 14/20 500 | `.t-label-1-normal` | — |
| `.t-body-1` 16/26 | `.t-body-1-reading` | — |
| `.t-body-2` 14/22 | `.t-label-1-reading .t-regular` | — |
| `.t-label-1` 14/20 600 | `.t-label-1-normal .t-semibold` | — |
| `.t-label-2` 12/16 500 | `.t-caption-1` | — |
| `.t-label-2-semibold` | `.t-caption-1 .t-semibold` | — |
| `.t-caption-1` 12/18 | `.t-caption-1` | **행간 18 → 16** |
| `.t-caption-2` 10/14 | `.t-caption-2` | **크기 10 → 11** · 굵기 400 → 500 |

새로 생긴 단계: `.t-display-1`(56) · `.t-display-3`(36) · `.t-heading-1`(22) · `.t-headline-2`(17/24) · `.t-body-2-normal` · `.t-body-2-reading`(15) · `.t-label-2`(13). 글자 크기 토큰에 `--font-size-11 · 13 · 15 · 17 · 22 · 36 · 56` 이 생겼고 **`--font-size-10` 은 없어졌습니다**(Caption 2 가 11).

**컴포넌트 글자도 이 표에 묶었습니다** — 크기는 그대로이고 행간 · 자간만 표의 값으로 바뀝니다. 높이가 달라진 것:
- 12px 글자(Tag · Chip · Tooltip · 도움말 · 표 헤더 · 범례 · 로그 행 등)의 행간이 19.2 · 18 → 16. 높이가 정해지지 않은 것은 2~3px 낮아집니다 — Tooltip 30 → 28, Tag 25 → 22(sm 21 → 18 · lg 29 → 26), 작은 탭 줄 37.2 → 34.
- 14 · 16 본문의 행간 22.4 · 25.6 → 22 · 26, 체크박스 · 라디오 라벨 19.6 → 20. 그래서 메뉴 · Navigation 항목 38.4 → 38, 탭 줄 44.4 → 44 입니다(표 행 48 · 헤더 44 는 그대로).
- KPI 값(32)의 행간 38.4 → 44 — KPI 카드가 5.6 높아집니다. 대화상자 제목(18) 28.8 → 26.
- **`PageHeader` 제목은 Display 3(36/48)** 입니다(24/1.3 이었다).
- **`.ds-root` 기본 글자는 Body 2/Reading 15/24 · 자간 0.0096em** 입니다(15/1.65 = 24.75 였다). 컴포넌트는 이 값에 기대지 않으므로, 바뀌는 것은 제품 화면에서 컴포넌트 밖의 맨 글자뿐입니다(줄마다 0.75px 낮아짐).
  고정폭 Code 블록(`CodeBlock`)은 자간 0 을 스스로 정합니다 — 새 기본 자간을 물려받지 않습니다.
- 글자 크기 토큰 `--font-size-48` 을 지웠습니다(사이트 홈 제목 전용이었고 Display 1 56 이 되었습니다). 제품 CSS 가 썼다면 `--font-size-56`(Display 1) 또는 `--font-size-40`(Display 2)으로 바꾸세요.
- 자간이 생겨 같은 글자가 조금 넓어집니다(12px 에서 글자당 0.3px).


## 컴포넌트 수정 15건 — 폼 높이 · 표 · 개별 스타일 (2026-11-12)

- **`SelectButton` 기본 높이 38 → 40**(outline · solid 포함) — 폼 컨트롤은 전부 sm 32 · md 40 · lg 48 입니다. 새 `size="sm" | "md" | "lg"`(기본 md). sm 은 반경 4.
- **`Select` · `Dropdown` · `SearchBar` 에 `size`** — 지금까지 40 하나였습니다. sm 32(반경 4 · 글자 12) · lg 48(글자 16). `.field.sm` · `.field.lg` 안의 Select 트리거도 필드 높이를 따라갑니다.
  상단 내비 검색(`.topbar .searchbar`)은 36 → 32 — 옆 아이콘 버튼과 같습니다.
- **`Table` 에 `stickyHeader` · `stickyColumn` · `maxHeight` · `regionLabel`** — DataTable 과 같은 고정 헤더 · 첫 열 고정입니다. 스크롤 영역이 키보드로 닿도록 `tabIndex 0` · `role="region"` 을 달고, `regionLabel` 이 없으면 개발 모드에서 한 번 경고합니다.
- **표 행 hover = `--surface-neutral-tertiary`**(Table · DataTable · List). 표 머리글 · 키-값 표(`.tbl.kv`) 머리글 = Label 2 13/18. 키-값 표 첫 줄 위에 1px 선.
  Side Panel 의 속성 표는 `className="tbl kv"` 로 쓰세요(예제를 바꿨습니다).
- **Notice 테두리 없음** — padding 20 · 18, 톤 없는 Notice 는 회색 면(`--background-neutral-secondary`). 톤 Notice 는 면만 남습니다.
- **`PageHeader` 제목 = Title 1 32/44 · 자간 -0.0253em**(같은 날 Display 3 36/48 에서 바꿈), Breadcrumb ↔ 제목 간격 8 → 16(`gap:1rem`).
- **`Empty` 아이콘** — 면 없음 · 색 `--foreground-neutral-quaternary` · 40(compact 32 · 카드 안 36) · 선 굵기 1.5.
- **Steps 완료 원** — 면 `--foreground-positive-primary`(진한 초록) · 체크 `--brand-label`. 단계 글자 굵기 500.
- **File Upload 오류 줄 테두리** = `--line-negative-primary`.
- 문서 사이트: 컴포넌트 페이지가 Default · Variant · Size · State · Spec · Props · Usage 순서가 되고 Placement 절이 없어졌습니다(자리 규칙은 원칙 표의 Placement 행). 예제 id 는 그대로입니다.


## Chip 형태 둘 · 색 둘 (2026-11-13)

- **고른 칩(`selected`)의 모양이 바뀌었습니다** — 옅은 brand 면 + brand 선 · 글자 → **제품 색 면(`--surface-brand-primary`) + `--brand-label` 글자**. 체크도 글자색을 따라갑니다.
  고르지 않은 칩(회색 선 · 흰 면)은 그대로입니다.
- 새 `variant="outline" | "solid"`(기본 outline) — solid 는 고르지 않은 칩이 회색 면(`--surface-neutral-tertiary`, 선 투명 1px 라 크기 같음)입니다. 고른 칩은 두 형태가 같습니다.
- 새 `color="brand" | "neutral"`(기본 brand) — 고른 칩의 면만 바꿉니다. neutral 은 반전 면(`--surface-neutral-inverse` + `--foreground-neutral-inverse`).
- **입력값 칩(`onRemove`) · 동작 칩(`action`)은 형태만 받습니다** — `color="neutral"` · `selected` 를 주면 개발 모드에서 한 번 경고하고 무시합니다(`.on` · `.neutral` 클래스를 붙이지 않습니다).
  전에는 `onRemove` 칩에 `selected` 를 주면 `.on` 이 붙어 옅은 brand 면이 됐습니다 — 이제 진한 면이 될 자리라 막았습니다. 적용된 필터를 입력값 칩으로 보여 주던 곳은 `selected` 를 빼세요.
- HTML: `.chip.solid` · `.chip.neutral`. `.on` · `.neutral` 은 `aria-pressed` 가 있는 칩에만 씁니다(문서 사이트 verify 가 막음).

## Steps 마법사 (2026-11-13)

외부 컴포넌트 Stepper 의 구조 · 동작을 참고해 Steps 를 다시 짰습니다(외부 컴포넌트 PRO 는 상용이라 코드 · 클래스 이름 · 아이콘은 옮기지 않음).

- **모양이 바뀌었습니다** — 원 24 → **32**, 체크 12 → **16**, 라벨 12 → **14**(Label 1/Normal, 현재 단계 600 · 완료 secondary · 아직 tertiary).
  완료 원은 진한 초록(`--foreground-positive-primary`) → **제품 색 면(`--surface-brand-primary`) + 흰 체크(`--brand-label`)**, 현재 원은 **제품 색 테두리 + `--surface-brand-subtle` 면 + `--foreground-brand-primary` 숫자**, 아직인 단계는 회색 테두리 원입니다.
  연결선은 32 고정 → **남는 폭을 나누는 2px**(완료한 단계 뒤는 제품 색)이고, 세로 배치에도 선이 생겼습니다.
- **라벨이 `<span class="label">` 안에 들어갑니다** — 단계 글자를 직접 고르던 CSS 는 `.steps .label` 로 바꾸세요.
- `vertical` → **`layout="vertical"`**(옛 prop 은 개발 모드에서 한 번 경고하고 받습니다). 새 `layout="label-below"`. 세로는 이제 '단계 아래에 내용이 펼쳐지는' 마법사 배치입니다.
- **좁으면 세로로** — 가로 · 라벨 아래 배치가 자리에 안 들어가면 `Steps` · `Stepper` 가 `.stacked` 를 붙여 세로로 쌓습니다(부모 폭이 바뀌면 다시 잼). 전에는 가로로 넘쳤습니다. 사이트는 ds.js 가 같은 일을 합니다.
- `Steps nonLinear` — `onStepClick` 과 함께 주면 현재가 아닌 모든 단계가 버튼입니다(기본은 완료한 단계만).
- **새 `Stepper`** — 단계 패널 · 이전/다음/완료 · 단계별 폼 검사. `steps={[{label, content}]}` · `current`/`defaultCurrent` · `onStepChange(index, {from, trigger})`(next · prev · click · finish) · `onFinish(index)` · `layout` · `nonLinear` · `actions` · `labels`.
  '다음'은 패널 안 폼을 `requestSubmit()` 으로 제출해 `<Form validate>` 의 검사를 탑니다(폼 안 Enter 도 '다음'). 패널은 늘 그려 두고 숨겨서 입력값이 남습니다. 저장 · 전송은 `onStepChange` · `onFinish` 에서 제품이 합니다.
- **새 `StepButton step="prev | next | finish"`** — `actions={false}` 일 때 내용 안(카드 아래 등)에 두는 버튼. 첫 단계의 이전은 꺼지고, 마지막 단계에서는 다음 대신 완료가 보입니다.
- **`Form bare`** — 카드 모양(면 · 테두리 · 패딩) 없이 검사만. 카드나 Stepper 패널 안에 둘 때(사이트는 class 없는 `form[data-validate]`).
- HTML: `.stepper > .steps + .step-panel × 단계 수 + .step-actions`(세로는 각 li 안에 패널), `button[data-step="prev|next|finish"]`, `data-nonlinear`.
  **`ds:step` 상세가 하나로 합쳐졌습니다** — 온보딩의 `{step}` · 돌아가기의 `{index}` → `{index, from, trigger}`. 새 `ds:step-finish {index}` · `DS.stepper.go(el, index)`(trigger `api`).
  온보딩 패턴의 이전 · 다음은 `.onboard [data-step]` 전용 동작에서 `.stepper` 일반 동작으로 옮겼고, 이제 단계마다 카드가 바뀝니다.

## 수정 묶음 · Avatar Group · Time Picker (2026-11-13)

- **고정폭 글자는 Code 에만** — `TextField mono` 는 개발 모드에서 한 번 경고하고 무시합니다. `CopyField` 값도 본문 글자입니다(숫자 자리는 `tabular-nums` 가 맞춤). HTML 의 `.field.mono` 규칙은 없어졌습니다.
- **`ChartCanvas table` 의 기본값이 false 입니다** — 2026-11-10 부터 늘 있던 '표로 보기' 버튼이 이제 `table` 을 줄 때만 나옵니다. 바깥 `.chart-view` 틀은 그대로입니다. 버튼이 필요한 차트에 `table` 을 더하세요(사이트 대시보드 패턴은 끔).
- **표 행 hover 가 기본에서 빠졌습니다** — `Table hover` · `DataTable hover`(HTML `.tbl.hover`)를 줄 때만 행 hover · 눌림 면이 칠해집니다. 행을 고르거나 행에 동작이 있는 표에 주세요.
- **`Notification` 의 Notice · Banner 아이콘이 채운(filled) 아이콘입니다.** 아이콘을 직접 넘기는 곳은 `<Icon filled>` 로 맞추세요(사이트 verify 가 예제를 막음).
- **새 `AvatarGroup`** — `label`(묶음 이름, 필수) · `max`(기본 5, 5 넘으면 경고하고 5) · `size` · `onMore`(주면 '외 N명' 이 목록을 여는 글자 버튼) · `moreText` · `moreLabel`. 겹침 -8(sm -6) · 경계 링 2px. HTML `.avatar-group[role=group][aria-label] > .avatar × 5 이하 + .avatar-group-more`.
- **새 `TimePicker`** — 하루 안의 시각(24시간제 `HH:mm`, `seconds` 면 `HH:mm:ss`). 입력칸 + 시 · 분 · 초 열 목록이고 고르면 바로 값이 됩니다(적용 버튼 없음).
  `value` · `defaultValue`(필드 글자) · `onChange(value, {text, validity})`(확정할 때 글자가 바뀌면 — value 는 미완성 · 없는 시각이면 null, 범위 밖은 그 시각) · `step`(분 열 간격) · `min` · `max` · `size` · `required` · `messages`(Date Picker 와 같은 키 incomplete · invalidTime · min · max · timeSubject) · `labels`(dialog · hour · minute · second · open).
  `<Form validate>` 에 낍니다 — 빈 필수는 공통 문구, 그 밖은 시각 문구(`setCustomValidity` 로 넘기고 `validationMessage` 가 읽습니다). 순수 함수 `checkTime` 을 함께 냅니다.
  HTML `.field.timepicker[data-seconds][data-step][data-min][data-max] > label + .affix > input + button.tp-btn` — 열 목록은 ds.js 가 열 때 그리고 `ds:time {value, text, validity}` 를 냅니다.
- `pasteText` 가 시각만 쓰는 단위에서 첫 조각(시)도 두 자리로 채웁니다 — `2:0` 이 `20:0` 이 되던 것을 `02:00` 으로(Date Picker 시각 칸 붙여넣기도 같음).
- 상태 틴트(positive · cautionary · negative · accent)가 12 → 8% 로 옅어졌습니다(참조값). negative 다음 단계도 함께 — 라이트 8 · 12 · 16%, 다크 8 · 16 · 22%. Tag 중립 면 = `--surface-neutral-tertiary`, Info = `--surface-neutral-secondary`, outline Tag 테두리 = 그 톤의 선 토큰.

## Date Picker 시각 칸 = Time Picker (2026-11-13)

- `DatePicker time` · `DateRangePicker time` 의 달력 아래 시각 칸이 `TimePicker size="sm"` 이 됐습니다. 시계 버튼으로 시 · 분(· 초) 열을 열어 고를 수 있고, 칸에 치는 동작 · ↑↓ · Enter(적용)는 그대로입니다. 범위와 형식은 지금처럼 적용할 때 필드가 잽니다.
  Tab 순서에 시계 버튼이 하나 더 낍니다(시각 칸 → 시계 버튼 → 푸터). 열 목록이 열린 동안 Esc 는 목록만 닫고, 다음 Esc 가 달력을 닫습니다.
- `labels.timeOpen`(기본 "선택") — 시계 버튼 이름의 뒷말("시작 시각 선택"). 사이트 `data-labels` 도 같은 키입니다.
- `TimePicker` 에 `onTextChange(text)`(칠 때마다 끊은 글자)와 `validate`(기본 true, false 면 스스로 오류 문구를 띄우지 않고 폼에도 넘기지 않음)를 더했습니다. ↑↓ 뒤 커서는 다음 그림 직후 같은 조각으로 돌아옵니다 — 연달아 누르면 분 조각으로 넘어가던 것을 고쳤습니다.
- 사이트 HTML: 달력 안 시각 칸은 `.field.sm.timepicker[data-dp-side="a|b"] > label + .affix > input + button.tp-btn` 입니다. 그래서 `.datepicker .affix input` 은 달력이 그려진 동안 시각 칸까지 집습니다 — 필드 입력만 원하면 `.datepicker > .affix input` 으로 좁히세요. 달력 안 칸은 `ds:time` 을 내지 않습니다(값은 필드의 `ds:date` 가 나릅니다).

## 모양 넷 — 상단 내비 선택 · Tag sm · Count 점 (2026-11-14)

코드는 그대로이고 보이는 모양만 바뀝니다.
- **상단 내비 선택 메뉴**는 제품 색 면과 흰 글자에서 brand 글자와 아래 2px brand 선으로 바뀌었습니다(11-13 의 면을 되돌림). 다른 메뉴에도 투명한 2px 아래 선이 생겨 메뉴 높이가 2px 늘었고, 모서리가 없어졌으며 메뉴 사이가 4 에서 8 로 넓어졌습니다.
- **Tag sm** 글자가 Caption 2 11/14 로 작아지고 위아래 여백이 1 에서 2 가 됐습니다. 높이 18 은 그대로입니다.
- **아이콘 위 Count 점**(`.with-count .count.dot`)이 모서리에서 6 이 아니라 2 만 바깥으로 나옵니다. 숫자 배지는 그대로 6 입니다.

## Tree 신규 (2026-11-14)

- **새 `Tree`** — 계층 목록입니다. 기본은 탐색형으로, 항목 하나를 고릅니다. `checkable` 을 주면 체크박스형이 되어 여러 개를 켭니다.
  - 탐색형: `selected` · `defaultSelected` · `onSelect(value)` 를 씁니다. 클릭 · Enter · Space 로 고르고, 화살표로 포커스만 옮겨서는 고르지 않습니다.
  - 체크박스형: `checked` · `defaultChecked` · `onCheckedChange(values, {value, checked})` 를 씁니다. 상위는 하위를 따라 켜지고, 일부만 켜지면 mixed 가 됩니다. 넘기는 값은 켜진 모든 항목이고 상위도 들어갑니다.
  - 펼침: `expanded` · `defaultExpanded` · `onExpandedChange(values, {value, expanded})` 를 씁니다.
  - 항목 `TreeNode` 의 필드는 `value` · `label` · `icon` · `meta` · `children` · `lazy` · `disabled` 입니다.
  - 끈 항목은 포커스와 펼치기는 되지만 고르거나 켤 수 없습니다. 상위를 켜도 끈 하위는 그대로이고, 그 상위는 mixed 로 남습니다.
- **하위 불러오기는 `onLoad(value) => Promise<TreeNode[]>`** — 조회는 제품이 하고, 시스템은 상태만 보여 줍니다.
  - 불러오는 동안 셰브론 자리에 스피너가 돌고 `aria-busy` 가 붙습니다.
  - 실패해 reject 하면 항목이 접힌 채 남고, 줄 끝에 '불러오지 못했습니다' 가 보이며 알림 영역에도 읽힙니다. 다시 펼치면 다시 부릅니다.
  - HTML 에서는 `li[data-lazy]` 가 `ds:tree-load {value, resolve(items), reject(msg)}` 를 냅니다.
- **`searchable`** 을 주면 트리 위에 sm 검색칸이 붙습니다(`searchLabel` · `searchPlaceholder`).
  - 맞는 항목과 그 상위만 남기고 펼치며, 맞는 글자는 굵게 보입니다. 초성으로도 찾습니다.
  - 결과 수를 알림 영역에 읽어 주고, 하나도 없으면 안내 문구를 보입니다.
  - 검색칸을 비우면 검색 전 펼침으로 돌아갑니다.
  - 아직 불러오지 않은 하위는 찾지 않습니다. 서버 검색은 제품이 맡습니다.
- 문구는 `labels` 로 바꿉니다(`failed` · `failedStatus` · `results` · `empty` · `search`, 기본값 `TREE_LABELS`).
- **HTML 구조:** `ul.tree[role=tree][aria-label] > li.tree-item[role=treeitem][aria-level] > .tree-row + ul.tree-group[role=group]`. 체크박스형은 `.tree.checkable[aria-multiselectable="true"]` 에 항목마다 `aria-checked` 를 답니다.
  - 하위가 있는 항목은 `aria-labelledby` 로 제 `.tree-label` 을 가리킵니다. 그러지 않으면 이름에 하위 글자까지 들어갑니다.
  - 이벤트는 `ds:tree-select` · `ds:tree-expand` · `ds:tree-check` 입니다.
  - 트리 안에는 링크 · 버튼 · 입력을 두지 않습니다(verify).
- 끌어 옮기기는 없습니다(사람의 결정).

## Notification Center 신규 (2026-11-14)

- **새 `NotificationCenter`** — 상단 바의 벨 버튼과, 그 아래 열리는 알림 팝오버입니다. 팝오버는 비모달 대화상자입니다.
  - 항목 `NotificationItem` 의 필드는 `id` · `title` · `sub` · `time` · `datetime` · `severity` · `href` · `unread` · `group` 입니다. `group` 이 같은 항목끼리 '오늘' · '어제' 같은 묶음 제목 아래 모입니다.
  - 열림은 `open` · `defaultOpen` · `onOpenChange` 로 다룹니다. 벨을 누르면 열리고 포커스가 패널로 갑니다. Esc 를 누르면 닫히고 포커스가 벨로 돌아갑니다. 바깥을 누르거나 Tab 으로 패널을 벗어나도 닫힙니다.
  - 자리: 표 · 스크롤 영역처럼 넘침을 자르는 곳 안에서 벨로 열면 패널이 화면 기준(fixed)으로 뜨고, 바깥이 스크롤되거나 창 크기가 바뀌면 닫힙니다. 처음부터 열린 패널(`defaultOpen` · 마크업의 열린 패널)은 띄우지 않습니다. 대신 그 영역 안 8px 에 들도록 폭을 좁히고 오른쪽으로 밉니다. 띄우면 페이지 스크롤에 바로 닫히기 때문입니다.
- **읽음은 제품이 저장합니다** — `onRead(ids, {all})` 를 받으면 그 항목의 `unread` 를 false 로 바꿔 다시 넘기세요. 시스템은 읽음 상태를 따로 들고 있지 않습니다.
  - 안 읽은 항목을 누르면 그 항목 하나를, '모두 읽음' 을 누르면 안 읽은 모든 항목을 넘깁니다. 이미 읽은 항목을 누르면 아무것도 넘기지 않습니다.
  - `href` 가 있는 항목은 링크로 이동하고 패널을 닫습니다. 라우터를 쓰면 `onNavigate(item, e)` 에서 `e.preventDefault()` 하고 직접 옮기세요. `href` 가 없는 항목은 읽음만 표시하고 패널을 연 채로 둡니다.
- **안 읽은 수 하나가 여러 곳에 함께 나옵니다** — 벨 Count(99 를 넘으면 99+, 0 이면 없음), 벨 이름과 Tooltip('알림 n건'), '안 읽음' 탭의 Count, 항목의 숨긴 ', 안 읽음' 입니다. `items` 만 바꾸면 모두 따라갑니다.
- **새 알림** — 연결(WebSocket · 폴링)은 제품이 맡습니다. 새 항목을 `items` 맨 앞에 넣으면, 안 읽은 새 항목을 알림 영역에 한 번 읽어 줍니다. 하나면 '새 알림: 제목', 여럿이면 '새 알림 n건' 입니다.
- **이전 알림** — `hasMore` 와 `onMore() => Promise` 를 쓰면 목록 끝에 '이전 알림 보기' 버튼이 붙습니다.
  - 불러오는 동안 버튼에 스피너와 `aria-busy` 가 붙습니다.
  - 끝나면 몇 건 왔는지 읽어 주고, 새로 온 첫 항목으로 포커스를 옮깁니다.
  - 실패해 reject 하면 버튼 위에 '알림을 불러오지 못했습니다.'(role=status)가 나오고, 버튼이 '다시 시도' 가 됩니다.
- 문구는 `labels` 로 바꿉니다. 기본값은 `NOTIFY_LABELS` 이고, `{n}` · `{title}` 자리표시를 씁니다.
- **HTML 구조:** `.notify > .with-count(.tooltip-wrap > button[aria-haspopup=dialog][aria-expanded][aria-controls] + .count) + section.notify-panel[role=dialog][aria-labelledby][tabindex=-1]`. 패널 안에는 머리(제목 + `.notify-read-all`), 탭 전체 · 안 읽음, `.tab-panel.notify-body[data-static]` 가 들어갑니다. 항목은 `li.notify-item(.unread) > a.notify-link[href] | button.notify-link` 입니다.
  - 이벤트는 `ds:notify-read {ids, all}` · `ds:notify-more {resolve(items, {done}), reject(msg)}` · `ds:notify-open {open}` 입니다.
  - 새 알림은 `DS.notify.add(el, items)` 로 넣습니다. 마크업을 직접 바꿨다면 `DS.notify.sync(el)` 로 숫자를 맞춥니다.
  - 항목 안에는 다른 버튼 · 링크를 두지 않습니다(verify). 항목마다 동작을 붙이지 않는다는 결정입니다.

## 일본어 한자 서체 — Pretendard JP (2026-11-14)

- **Pretendard 에는 한자가 없습니다.** 그래서 일본어 화면의 한자만 시스템 서체로 그려졌습니다. 맥에서는 Apple SD Gothic Neo 였고, 한국식 자형에 디자인도 달랐습니다.
- **일본어를 쓰는 제품은 `import "@jiran/ds-react/font-jp.css"` 를 더합니다.** 선택 파일이고 `style.css` 뒤에 둡니다.
  - Pretendard JP Variable v1.3.9 조각 119개입니다. 합계 4.7MB 이고 OFL 1.1 입니다(`dist/fonts/jp/OFL.txt`).
  - 조각마다 `unicode-range` 가 있어, 그 범위의 한자가 화면에 나올 때만 해당 조각을 내려받습니다. 한자가 없는 화면은 0 입니다.
- `style.css` 의 `--font-sans` 가 `"Pretendard","Pretendard JP",…` 로 바뀌었습니다.
  - 한글 · 라틴 · 가나는 지금처럼 Pretendard 가 그립니다.
  - `font-jp.css` 를 불러오지 않으면 그 이름은 건너뛰므로 화면은 전과 같습니다.
- 한자는 **일본식 자형**입니다. 한국어 문장 안의 한자도 그렇습니다. 한국식 자형이 필요한 자리는 `font-feature-settings:"ss05"` 를 씁니다.
- 폐쇄망 제품도 쓸 수 있게 CDN 이 아니라 패키지 파일입니다. 번들러가 `fonts/jp/*.woff2` 를 자산으로 내보내는지 확인하세요. `fonts/PretendardVariable.woff2` 와 같은 방식입니다.

## 제품 색 팔레트 · 삭제 버튼 중립 (2026-11-14)

- **제품 색은 팔레트 여섯에서 고릅니다** — `applyProductColor(key)`, 키는 `blue`(기본) · `red` · `cyan` · `orange` · `neutral` · `ai`. 값은 `PRODUCT_COLORS` 에 있습니다.
  - blue 는 기본이라 `--prod-*` 와 `data-accent` 를 지웁니다. 그 밖은 `<html data-accent="키">` 를 달고, red · cyan · orange · ai 는 `--prod-40~60` 도 넣습니다.
  - 팔레트 밖 색은 1.0 전까지 `applyAccent(hex)` 로 넣습니다. 이때 속성 값이 hex 라 아래의 키별 CSS(중립 램프 · AI 그라데이션 · 중립 입력 링)는 걸리지 않습니다.
  - 1.0 뒤에는 사용자가 색을 더하거나 고치는 팔레트를 줄 예정입니다.
- **상태색과 겹치는 제품을 회색으로 바꾸던 규칙을 없앴습니다.** 사이트만 그렇게 하던 규칙이라 같은 빨강이 React 에서는 빨강, 사이트에서는 회색이었습니다. 이제 둘 다 고른 색 그대로입니다. 중립은 `neutral` 로 고릅니다(`data-accent-neutral` → `data-accent="neutral"`).
- **시안은 `#00828B`** 입니다(옛 `#00AAB6` 은 흰 글자 2.83 이라 같은 색조에서 진하게 — 4.60).
- **주황(`#FF7F00`, 회사 색)은 흰 글자 2.53** 입니다. 사람의 결정으로 선언한 예외이고 경고하지 않습니다(`PRODUCT_COLORS` 의 `exception`).
- **AI 는 단색 `#6541F2` + 넓은 면 그라데이션** — 주 버튼(Solid Primary)과 Banner 만 `background-image` 로 purple → violet 그라데이션을 덧칠합니다. 비활성 주 버튼에는 없습니다. 새 토큰 `--surface-brand-gradient` · `-strong` · `-heavy` 는 다른 제품에서 `none` 입니다.
- **다크의 brand 글자 단계(`--prod-60`)를 4.5 까지 밝힙니다** — `accentScale` 이 다크 바탕 셋 모두에서 4.5 가 될 때까지 밝기를 0.5 씩 올립니다. 빨강 `#EF1437` → `#F34B65`, AI → `#9076F6`. 이미 넘는 색은 그대로입니다.
- **삭제 버튼(`color="negative"` · `.negative`)은 모든 제품에서 중립색**입니다. Assistive 와 같은 모양입니다 — 빨강 제품의 주 버튼과 헷갈리지 않게 합니다. 빨강은 위험 확인 팝업 제목과 메뉴 위험 항목 글자에 남습니다. 클래스 · prop 은 그대로라 마크업을 바꿀 필요가 없습니다.
- **빨강 · 주황 제품의 입력 포커스 · 열린 필드 링은 중립색**입니다(오류 링 · 경고색과 헷갈리지 않게). 새 토큰 `--line-field-focus` · `--line-field-focus-halo` 가 링 색이고, 다른 제품에서는 전처럼 brand 입니다. 오류 필드는 늘 빨강입니다.
