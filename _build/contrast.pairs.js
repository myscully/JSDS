/* 대비 계약 — '한 화면에서 만날 수 있는 쌍'만 선언하고 값은 빌드가 잰다(contrast.js).
   사람이 숫자를 적지 않는다: 종전에는 페이지의 대비 수치가 네 번 낡았다.
   측정은 실제 생성 사이트에서 라이트·다크 × 제품 세 경우(기본 · 밝은 제품 · 상태색과 겹치는 제품)로 전수 수행한다.

   이번 라운드부터 토큰 값이 참조 시스템(Montage, wanteddev/montage-web)의 것이다.
   그 값은 소비자 제품용이라 **우리 기준을 여럿 넘기지 못한다** — 라이트에서 상태색 글자가 2.2~3.4 다.
   값을 그대로 쓰기로 한 결정이므로 그 쌍들을 advisory 로 내린다. 지우지 않고 매 빌드 숫자를 보고한다 —
   숨기면 "검사하고 있다"고 착각하게 된다. advisory 가 붙은 줄마다 '왜'가 적혀 있어야 한다. */

/* 전경이 올라앉는 바탕 셋 — 페이지·카드·들어간 영역 */
const SURFACES = ["--background-neutral-primary", "--surface-elevated-primary", "--background-neutral-secondary"];
const ACCENTS = ["lime", "cyan", "light-blue", "violet", "purple", "pink"];

/* 참조 시스템이 **불투명으로 선언한** 토큰 — 알파가 섞여 들어오면 바탕마다 다르게 측정된다.
   Montage 는 글자에도 알파를 쓰므로(foreground-neutral-secondary 가 88%) '글자는 솔리드' 규칙은 성립하지 않는다.
   대신 '원본이 불투명한 것은 불투명해야 한다'만 검사한다 — 알파 글자는 세 바탕 전부에서 따로 잰다 */
const OPAQUE_ONLY = [
  ...SURFACES, "--surface-neutral-primary", "--surface-neutral-inverse", "--surface-elevated-secondary",
  "--surface-disable-primary",
  "--foreground-neutral-primary", "--foreground-neutral-strong", "--foreground-neutral-inverse",
  "--foreground-positive-primary", "--foreground-cautionary-primary",
  "--foreground-negative-primary", "--foreground-negative-strong", "--foreground-inactive-primary",
  ...ACCENTS.map((c) => `--foreground-accent-${c}`),
  ...ACCENTS.map((c) => `--surface-accent-${c}-opaque`),
  "--line-neutral-primary-opaque", "--line-neutral-secondary-opaque", "--line-neutral-tertiary-opaque",
  "--surface-brand-primary", "--surface-brand-strong", "--surface-brand-heavy",
  "--foreground-brand-primary", "--foreground-brand-inverse", "--brand-label",
  "--static-white", "--static-black",
];

/* 참조 시스템 값이 우리 기준에 못 미쳐 advisory 로 내린 것들 — 사유를 한 줄씩 적는다 */
const REF = (why) => ({ advisory: true, why });
const REF_STATUS = REF("참조 시스템 값 — 라이트에서 2.2~3.4. Montage 는 이 색을 배너의 제목·아이콘에만 쓰고 칩 라벨에는 쓰지 않는다");
const REF_ACCENT = REF("참조 시스템 값 — 장식 강조색이라 라이트에서 6 중 5가 4.5 미만이다");

/* [전경, 바탕들, 최소 대비, 메모, 옵션] */
const pairs = [
  ["--foreground-neutral-primary", [...SURFACES, "--surface-neutral-strong"], 4.5, "본문 · 태그 라벨"],
  ["--foreground-neutral-strong", SURFACES, 4.5, "가장 높은 대비가 필요할 때"],
  ["--foreground-neutral-secondary", [...SURFACES, "--surface-neutral-strong"], 4.5, "보조 본문 · 중립 칩 라벨"],
  /* 라이트 3.67 · 다크 3.78 — 참조 시스템의 설명·캡션 단계다. 종전 우리 값(5.15)보다 연하다 */
  ["--foreground-neutral-tertiary", [...SURFACES, "--surface-neutral-strong"], 4.5, "설명·캡션", REF("참조 시스템 값 — 라이트 3.67 · 다크 3.78")],
  /* 1.68 — 네 번째 위계는 장식에 가깝다. 글자로 쓰면 읽히지 않는다 */
  ["--foreground-neutral-quaternary", SURFACES, 4.5, "네 번째 위계", REF("참조 시스템 값 — 장식 수준(1.68). 본문에 쓰지 않는다")],
  ["--foreground-neutral-inverse", ["--surface-neutral-inverse"], 4.5, "반전 표면 위 글자"],
  /* 비활성은 1.4.3 면제 대상이지만 숫자는 계속 본다 */
  ["--foreground-disable-primary", SURFACES, 4.5, "비활성 글자", REF("1.4.3 면제 — 비활성 컨트롤")],
  ["--foreground-inactive-primary", SURFACES, 4.5, "선택되지 않은 상태", REF("참조 시스템 값 — 라이트 2.78 · 다크 2.55")],
  ["--foreground-brand-primary", SURFACES, 4.5, "제품색 글자·링크"],
  /* 자기 옅은 면 위에서만 4.22~4.49 다 — 참조 시스템의 brand 50 과 그 5% 틴트 조합이 원래 그렇다 */
  ["--foreground-brand-primary", ["--surface-brand-subtle"], 4.5, "옅은 제품 면 위 글자", REF("참조 시스템 값 — brand 와 그 5% 틴트 조합이 4.22~4.49")],
  ["--foreground-brand-inverse", ["--surface-neutral-inverse"], 4.5, "반전 표면 위 제품색 글자"],
  ["--foreground-positive-primary", [...SURFACES, "--surface-positive-primary"], 4.5, "긍정 글자·아이콘", REF_STATUS],
  ["--foreground-cautionary-primary", [...SURFACES, "--surface-cautionary-primary"], 4.5, "주의 글자·아이콘", REF_STATUS],
  ["--foreground-negative-primary", [...SURFACES, "--surface-negative-primary"], 4.5, "부정 글자·아이콘", REF_STATUS],
  /* 두 틴트 모두에 올라앉는다 — .btn.danger 가 이 글자를 8% 틴트(--surface-negative-primary) 위에 쓴다.
     강한 틴트만 재고 있어서 파괴적 버튼의 실제 라벨 대비를 아무도 측정하지 않았다 */
  ["--foreground-negative-strong", [...SURFACES, "--surface-negative-primary", "--surface-negative-strong"], 4.5, "강조된 부정 글자 · 파괴적 버튼 라벨", REF_STATUS],
  ...ACCENTS.map((c) => [`--foreground-accent-${c}`, [...SURFACES, `--surface-accent-${c}`], 4.5, "강조색 글자·아이콘", REF_ACCENT]),
  /* 제품 면 위 글자 — 참조 시스템은 두 테마 모두 static.white 다. 다크 면(blue 60)에서 3.54 로 떨어진다.
     면을 옮길 자리가 없다(-on 역할이 없다) — 밝은 제품일 때만 data-accent-light 가 이 토큰을 뒤집는다 */
  ["--brand-label", ["--surface-brand-primary", "--surface-brand-strong", "--surface-brand-heavy"], 4.5, "제품 면 위 글자", REF("참조 시스템 값 — 다크 제품 면에서 3.54")],

  /* 글자 없는 지표(점·바·밴드·도넛) — 1.4.11 의 3:1 */
  ["--foreground-negative-primary", SURFACES, 3, "Critical 지표"],
  ["--foreground-cautionary-primary", SURFACES, 3, "High 지표", REF("참조 시스템 값 — 라이트 2.24")],
  ["--foreground-accent-cyan", SURFACES, 3, "Medium 지표"],
  ["--foreground-inactive-primary", SURFACES, 3, "Low 지표 · 비활성 점", REF("참조 시스템 값 — 라이트 2.78 · 다크 2.55")],
  ["--foreground-positive-primary", SURFACES, 3, "긍정 지표", REF("참조 시스템 값 — 라이트 2.46")],
  ["--foreground-brand-primary", SURFACES, 3, "제품색 지표 · 포커스 링"],
  /* 컴포넌트 경계 — 참조 시스템의 line/neutral/primary 는 중립 50 의 22% 다 */
  ["--line-neutral-primary", SURFACES, 3, "컴포넌트 경계", REF("참조 시스템 값 — 아웃라인 경계의 식별은 라벨과 채운 면이 함께 맡는다(1.4.11)")],
];

/* 옅은 면은 자기 바탕과 구분돼야 한다. 여기는 **하드 실패로 둔다** —
   깨지면 태그·선택 행이 바탕에 녹아 아예 보이지 않는다. 값이 아니라 구조의 문제다.
   바닥값을 테마로 가른다: 밝은 바탕에서는 색조 변화가 분리를 거들지만 어두운 바탕에서는 휘도가 필요하다 */
const separation = [
  ["--surface-neutral-tertiary", SURFACES, { light: 1.02, dark: 1.03 }],
  ["--surface-neutral-secondary", SURFACES, { light: 1.03, dark: 1.06 }],
  ["--surface-neutral-strong", SURFACES, { light: 1.06, dark: 1.08 }],
  ["--surface-disable-primary", SURFACES, { light: 1.02, dark: 1.04 }],
  ["--surface-brand-subtle", SURFACES, { light: 1.02, dark: 1.02 }],
  ["--surface-positive-primary", SURFACES, { light: 1.05, dark: 1.05 }],
  ["--surface-cautionary-primary", SURFACES, { light: 1.05, dark: 1.05 }],
  ["--surface-negative-primary", SURFACES, { light: 1.05, dark: 1.05 }],
  ["--surface-negative-strong", SURFACES, { light: 1.08, dark: 1.08 }],
  ...ACCENTS.map((c) => [`--surface-accent-${c}`, SURFACES, { light: 1.03, dark: 1.03 }]),
  /* 채운 제품 면이 페이지에서 보이는지 — 이 쌍이 없으면 '면이 배경에 녹는' 경우를 아무도 재지 않는다 */
  ...["--surface-brand-primary", "--surface-brand-strong", "--surface-brand-heavy"]
    .map((t) => [t, SURFACES, { light: 1.5, dark: 1.5 }]),
  /* 라이트에서 카드(elevated)와 페이지가 둘 다 흰색이라 분리가 1.00 이다 — 참조 시스템도 같고,
     경계는 보더와 그림자가 전담한다. 숫자를 숨기지 않되 빌드를 막지는 않는다 */
  ["--surface-elevated-primary", ["--background-neutral-primary"], { light: 1.02, dark: 1.02 }, { advisory: true, why: "참조 시스템도 라이트에서 둘 다 흰색이다 — 경계는 보더·그림자가 맡는다" }],
];

/* 심각도 네 등급은 서로 다른 값이어야 한다. 휘도 분리는 요구하지 않는다 —
   네 색의 색조가 모두 다르고(빨강·주황·청록·중립) 대비 비율은 색조 차이를 보지 못한다.
   색만으로 의미를 전달하지 않는다(1.4.1)는 라벨 병기와 구분선이 담당하고 verify 가 그것을 검사한다 */
const severityRanks = [
  "--foreground-negative-primary", "--foreground-cautionary-primary",
  "--foreground-accent-cyan", "--foreground-inactive-primary",
];

/* 소비자가 없어도 허용하는 토큰 — 참조 시스템과 1:1 이 목적이므로, 우리 화면이 아직 안 쓰는 것이 남는다.
   여기 적지 않은 채 소비자가 0 이면 빌드가 경고한다(= 군살이 소리 없이 쌓이지 않는다) */
const grammarOnly = [
  /* 참조 시스템의 전체 집합을 그대로 싣는다 — 아래는 우리 화면에 아직 쓸 자리가 없는 것들이다 */
  "--foreground-neutral-quaternary", "--foreground-brand-inverse",
  "--surface-neutral-primary", "--surface-elevated-secondary",
  "--surface-brand-heavy",
  ...ACCENTS.flatMap((c) => [`--surface-accent-${c}-opaque`, `--line-accent-${c}`, `--foreground-accent-${c}`])
    .filter((t) => !/cyan$/.test(t) || /opaque|line/.test(t)),
  ...ACCENTS.filter((c) => c !== "cyan").map((c) => `--surface-accent-${c}`),
  "--line-neutral-primary-opaque", "--line-neutral-secondary-opaque", "--line-neutral-tertiary-opaque",
  "--line-brand-strong", "--line-brand-focus", "--line-negative-strong", "--line-negative-focus",
  "--line-positive-primary",
  "--effect-transparent-primary", "--effect-transparent-secondary",
  "--company-mark-subtle",
  /* 램프는 의미 토큰이 고르는 재료라 단계별 소비자를 요구하지 않는다 */
];

module.exports = { SURFACES, ACCENTS, OPAQUE_ONLY, pairs, separation, severityRanks, grammarOnly };
