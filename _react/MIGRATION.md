# 마이그레이션 — 0.6.x → 0.7.0

**깨지는 변경입니다.** CSS 변수 이름이 전부 바뀌었습니다.

컬러 토큰을 참조 시스템(Montage · `wanteddev/montage-web`)의 시멘틱 층으로 값·이름까지 교체했습니다.
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

## 접근성 — 알고 써야 할 것

참조 시스템의 값을 그대로 쓰기로 한 결정의 대가가 있습니다. **라이트 모드에서
상태색 글자·아이콘이 WCAG AA 아래입니다** — 주의 2.24 · 긍정 2.46 · 부정 3.44.
이 값들은 빌드의 대비 게이트가 `advisory` 로 매 빌드 보고합니다(숨기지 않습니다).

표·목록의 **라벨 자체는 중립 글자색**(대비 17.9)이라 밀도 높은 화면의 가독성은 유지됩니다.
색 아래로 떨어지는 것은 배너의 제목·아이콘과 상태 점이며, 그래서 **색만으로 의미를 전달하지 않는다**는
규칙(라벨 병기)이 권고가 아니라 제약입니다.
