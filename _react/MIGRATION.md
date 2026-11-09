# 마이그레이션 — 0.6.x → 0.8.0

**깨지는 변경입니다.** CSS 변수 이름이 전부 바뀌었고(0.7.0), 제품 색에 제약이 생겼습니다(0.8.0).

컬러 토큰을 의미 층째 값·이름까지 교체했습니다.
`dist/style.css` 의 토큰 이름은 이 패키지의 공개 API 입니다 — 제품 CSS 에서 `var(--text-primary)` 처럼
직접 참조하고 있었다면 아래 표대로 바꿔야 합니다.

**토큰 교체(0.7)만으로는 마크업이 바뀌지 않았지만, 2026-10-28 Button 정의를 다시 내리면서 Button 의 props · 클래스 이름과
높이(버튼 · Text Field · Date Picker 필드)가 바뀌었습니다** — 아래 [Button (2026-10-28)](#button-2026-10-28) 절을 보세요.
그 밖의 컴포넌트 props(`tone` · `variant` · `size`)와 클래스 이름은 그대로입니다.

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
| 없음 | `<TextField mono>` | `.field.mono` |
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

