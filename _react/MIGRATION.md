# 마이그레이션 — 0.6.x → 0.8.0

**깨지는 변경입니다.** CSS 변수 이름이 전부 바뀌었고(0.7.0), 제품 색에 제약이 생겼습니다(0.8.0).

컬러 토큰을 의미 층째 값·이름까지 교체했습니다.
`dist/style.css` 의 토큰 이름은 이 패키지의 공개 API 입니다 — 제품 CSS 에서 `var(--text-primary)` 처럼
직접 참조하고 있었다면 아래 표대로 바꿔야 합니다.

**마크업은 바뀌지 않습니다.** 컴포넌트 props(`tone` · `variant` · `size`)와 클래스 이름은 그대로입니다.
토큰을 직접 참조하지 않는 제품은 패키지만 올리면 됩니다.

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
단계를 직접 읽고 있었다면 함께 고쳐야 합니다. 제품 컬러를 지정하지 않으면 참조 시스템의 Blue 램프가 기본값입니다.

#### 제품 색에 제약이 생깁니다 — `data-accent-light` 가 사라집니다

Brand 면 위의 글자는 **늘 흰색**입니다(참조 시스템에 면 위 글자 역할이 없습니다).
종전에는 제품 색이 밝으면 `data-accent-light` 를 켜서 글자를 어둡게 뒤집었는데, 그 적응을 걷어냈습니다 —
면을 어둡게 내려 흰 글자를 세우는 길은 다크에서 버튼이 캔버스에 묻혀(분리 1.11) 막혀 있고,
적응을 두면 참조 시스템에 없는 분기가 계속 남기 때문입니다.

**제품 색 위에서 흰 글자가 4.5 를 넘어야 합니다.** 기준은 라이트의 기준 단계(제품 HEX 자체)입니다 —
hover·pressed 는 더 어두워 자동으로 통과합니다.

```ts
import { isLightAccent } from "@jiran/ds-react";
isLightAccent("#00AD7B");  // true  — 흰 글자 2.89, Brand 슬롯에 쓸 수 없다
isLightAccent("#008760");  // false — 4.53, 같은 색상에서 통과하는 가장 밝은 값
```

- `applyAccent()` 는 더 이상 `data-accent-light` 를 설정하지 않습니다. 그 속성에 CSS 를 걸어 두었다면 지우세요.
- `applyAccent()` 는 제품 색이 상태색(색상각 0 · 34 · 140 · 189)과 15도 안쪽이면 `--prod-*` 를 넣지 않고 `data-accent-neutral` 을 켭니다 — 사이트 Accent 미리보기와 같은 동작입니다. 예: `#00AAB6` · `#C30D2A` 는 중립으로 내려갑니다. 판정만 필요하면 `clashesWithStatus(hex)` 를 쓰세요.
- 규격에 못 미치는 색을 넘기면 콘솔에 경고합니다. 밝은 브랜드 색을 가진 제품은 **어두운 변형**을 만들어 넣어야 합니다.
- 다크에서 rest 가 3.2~3.5 인 것은 참조 시스템 값 그대로입니다(다크 면이 한 단계 밝은 brand-60 이고 그 위에 흰 글자).
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

**솔리드 상태 면과 `-on` 이 사라졌습니다.** 참조 시스템의 상태 면은 8%·12% 틴트뿐이고,
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

참조 시스템의 `brand` 는 **제품 색**입니다. 지란지교 오렌지는 토큰 트리 밖으로 옮겨
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

참조 시스템의 값을 그대로 쓰기로 한 결정의 대가가 있습니다. **라이트 모드에서
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
