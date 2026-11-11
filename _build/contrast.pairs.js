/* 대비 계약 — '한 화면에서 만날 수 있는 쌍'만 선언하고 값은 빌드가 잰다(contrast.js).
   사람이 숫자를 적지 않는다: 종전에는 페이지의 대비 수치가 네 번 낡았다.
   측정은 실제 생성 사이트에서 라이트·다크 × 제품 세 경우(기본 · 다른 제품 · 상태색과 겹치는 제품)로 전수 수행한다.

   이번 라운드부터 토큰 값이 기준 시스템의 것이다.
   그 값은 소비자 제품용이라 **우리 기준을 여럿 넘기지 못한다** — 라이트에서 상태색 글자가 2.2~3.4 다.
   값을 그대로 쓰기로 한 결정이므로 그 쌍들을 advisory 로 내린다. 지우지 않고 매 빌드 숫자를 보고한다 —
   숨기면 "검사하고 있다"고 착각하게 된다. advisory 가 붙은 줄마다 '왜'가 적혀 있어야 한다. */

/* 전경이 올라앉는 바탕 셋 — 페이지·카드·들어간 영역 */
const SURFACES = ["--background-neutral-primary", "--surface-elevated-primary", "--background-neutral-secondary"];
const ACCENTS = ["lime", "cyan", "light-blue", "violet", "purple", "pink"];

/* 기준 시스템이 **불투명으로 선언한** 토큰 — 알파가 섞여 들어오면 바탕마다 다르게 측정된다.
   기준 시스템은 글자에도 알파를 쓰므로(foreground-neutral-secondary 가 88%) '글자는 솔리드' 규칙은 성립하지 않는다.
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

/* 기준 시스템 값이 우리 기준에 못 미쳐 advisory 로 내린 것들 — 사유를 한 줄씩 적는다 */
const REF = (why) => ({ advisory: true, why });
const REF_STATUS = REF("기준 시스템 값 — 라이트에서 2.2~3.4. 기준 시스템은 이 색을 배너의 제목·아이콘에만 쓰고 칩 라벨에는 쓰지 않는다");
const REF_ACCENT = REF("기준 시스템 값 — 장식 강조색이라 라이트에서 6 중 5가 4.5 미만이다");

/* [전경, 바탕들, 최소 대비, 메모, 옵션] */
const pairs = [
  ["--foreground-neutral-primary", [...SURFACES, "--surface-neutral-strong"], 4.5, "본문 · 태그 라벨"],
  /* Tag 글자 = 틴트와 같은 색상의 진한 톤(사람의 결정 2026-11-11 — 그 전엔 중립 글자 + 점). 자기 틴트 · outline(바탕 그대로) 위에서 4.5.
     Critical solid 는 한 단계 강한 면(surface-negative-strong). info 는 neutral-secondary(위 쌍), accent 는 brand-primary(아래 brand 쌍) */
  ["--foreground-negative-heavy", ["--surface-negative-primary", "--surface-negative-strong", ...SURFACES], 4.5, "Critical Tag 글자 — 틴트 · solid 면 · outline"],
  ["--foreground-cautionary-heavy", ["--surface-cautionary-primary", ...SURFACES], 4.5, "High Tag 글자 — 틴트 · outline"],
  ["--foreground-accent-light-blue-heavy", ["--surface-accent-light-blue", ...SURFACES], 4.5, "Medium Tag 글자 — 틴트 · outline"],
  ["--foreground-accent-lime-heavy", ["--surface-accent-lime", ...SURFACES], 4.5, "Low Tag 글자 — 틴트 · outline"],
  ["--foreground-accent-cyan-heavy", ["--surface-accent-cyan", ...SURFACES], 4.5, "Pending Tag 글자 — 틴트 · outline"],
  ["--foreground-positive-heavy", ["--surface-positive-primary", ...SURFACES], 4.5, "ok Tag 글자 — 틴트 · outline"],
  ["--foreground-neutral-strong", SURFACES, 4.5, "가장 높은 대비가 필요할 때"],
  ["--foreground-neutral-secondary", [...SURFACES, "--surface-neutral-strong"], 4.5, "보조 본문 · 중립 칩 라벨"],
  /* 라이트 3.67 · 다크 3.78 — 기준 시스템의 설명·캡션 단계다. 종전 우리 값(5.15)보다 연하다.
     placeholder 도 이 단계다(사람의 결정 2026-11-09 — disable 1.33 은 보이지 않았고, secondary 9.09 는 입력한 값과 구분되지 않는다) */
  ["--foreground-neutral-tertiary", [...SURFACES, "--surface-neutral-strong"], 4.5, "설명·캡션·placeholder", REF("기준 시스템 값 — 라이트 3.67 · 다크 3.78")],
  /* 1.68 — 네 번째 위계는 장식에 가깝다. 글자로 쓰면 읽히지 않는다 */
  ["--foreground-neutral-quaternary", SURFACES, 4.5, "네 번째 위계", REF("기준 시스템 값 — 장식 수준(1.68). 본문에 쓰지 않는다")],
  ["--foreground-neutral-inverse", ["--surface-neutral-inverse"], 4.5, "반전 표면 위 글자"],
  /* 비활성은 1.4.3 면제 대상이지만 숫자는 계속 본다 */
  ["--foreground-disable-primary", SURFACES, 4.5, "비활성 글자", REF("1.4.3 면제 — 비활성 컨트롤")],
  ["--foreground-inactive-primary", SURFACES, 4.5, "선택되지 않은 상태", REF("기준 시스템 값 — 라이트 2.78 · 다크 2.55")],
  ["--foreground-brand-primary", SURFACES, 4.5, "제품색 글자·링크"],
  /* 자기 옅은 면 위에서만 4.22~4.49 다 — 기준 시스템의 brand 50 과 그 5% 틴트 조합이 원래 그렇다 */
  ["--foreground-brand-primary", ["--surface-brand-subtle", "--surface-brand-subtle-strong"], 4.5, "옅은 제품 면 위 글자 — text · outline primary · 면 없는 아이콘 전용 primary 버튼의 hover·pressed, Date Picker 오늘 원 · 기간 띠 안의 오늘(2026-11-09 · 원 위는 2026-11-11 부터 — 사람의 결정)", REF("기준 시스템 값 — brand 와 그 틴트 조합이 4.2 언저리다")],
  /* Assistive 버튼 라벨 — solid 면(tertiary 단계), 그리고 solid · outline · 면 없는 아이콘 전용이 hover 에 올라앉는 secondary 단계(2026-10-28 정의 때 셌더니 선언이 없었다) */
  ["--foreground-neutral-primary", ["--surface-neutral-tertiary", "--surface-neutral-secondary"], 4.5, "Assistive 버튼 라벨 — rest · hover 면"],
  /* Accordion 헤더 Hover(2026-10-29) — 제목은 위 쌍(neutral-primary on surface-neutral-secondary), 보조 정보 · 셰브론은 여기 */
  ["--foreground-neutral-tertiary", ["--surface-neutral-secondary"], 4.5, "Accordion 헤더 보조 정보 — hover 면", REF("기준 시스템 값 — tertiary 는 바탕에서도 3.67 · 3.78")],
  ["--foreground-neutral-tertiary", ["--surface-disable-primary"], 4.5, "Disabled 선택 카드의 이유 문구", REF("기준 시스템 tertiary — disable 면 위 라이트 3.53 · 다크 3.28. 제목 · 아이콘은 disable(1.4.3 면제)이고 이유만 읽히게 둔 사람의 결정(2026-11-03)")],
  ["--foreground-neutral-secondary", ["--surface-neutral-secondary"], 3, "Accordion 셰브론 — hover 면(그래픽 3:1)"],
  ["--foreground-neutral-secondary", ["--surface-neutral-secondary", "--surface-brand-subtle"], 4.5, "표 하위 텍스트(.cell-sub) — 행 hover · 선택 면(2026-11-11). 누름 면 strong 은 위 보조 본문 쌍이 잰다"],
  ["--foreground-neutral-primary", ["--surface-brand-subtle", "--surface-brand-subtle-strong"], 4.5, "Date Picker 기간 사이 · 미리보기 날짜와 그 위 호버(2026-10-27) — 쓰고 있었는데 선언이 없었다. 다른 달(흐린) 칸은 띠를 칠하지 않아 이 쌍이 없다. 오늘 원 위 글자(2026-11-09, 다른 달의 오늘도 이 색)"],
  ["--foreground-brand-inverse", ["--surface-neutral-inverse"], 4.5, "반전 표면 위 제품색 글자"],
  ["--foreground-positive-primary", [...SURFACES, "--surface-positive-primary"], 4.5, "긍정 글자·아이콘 — Steps 완료 체크(.steps li.done i)도 이 쌍이다. 틴트 위 라이트 2.06~2.19 · 다크 6.43~8.03 — 그래픽 3:1 에도 라이트가 못 미친다, 사람의 결정", REF_STATUS],
  ["--foreground-cautionary-primary", [...SURFACES, "--surface-cautionary-primary"], 4.5, "주의 글자·아이콘", REF_STATUS],
  ["--foreground-negative-primary", [...SURFACES, "--surface-negative-primary"], 4.5, "부정 아이콘·그래픽(글자는 strong)", REF_STATUS],
  /* 두 틴트 모두에 올라앉는다 — solid negative 버튼(옛 .btn.danger)이 이 글자를 12% 틴트(--surface-negative-primary) 위에 쓴다.
     강한 틴트만 재고 있어서 파괴적 버튼의 실제 라벨 대비를 아무도 측정하지 않았다 */
  ["--foreground-negative-strong", [...SURFACES, "--surface-negative-primary", "--surface-negative-strong", "--surface-negative-heavy", "--surface-negative-hover", "--surface-negative-pressed"], 4.5, "강조된 부정 글자 · 파괴적 버튼 라벨(rest·hover·pressed). 라이트는 primary(3.44)보다 나아 글자에 쓰지만, 다크는 strong(red-50)이 primary(red-60)보다 어두워 elevated 위 4.63 으로 내려간다. 위험 버튼 rest·hover·pressed 는 라이트 12·16·22% 틴트 위 3.93 · 3.73 · 3.44, 다크 위험 보조 버튼 hover·pressed 는 20·28% 틴트 위 3.70 · 3.20 — 틴트를 한 단계 진하게 한 대가이고 참조 값을 바꾸지 않고 예외로 둔다", REF_STATUS],
  /* Count 배지 — 진한 빨강 면 위 흰 숫자(사람의 결정). 면 토큰이 아니라 전경 토큰(--foreground-negative-strong)을 면으로 쓴다 */
  ["--static-white", ["--foreground-negative-strong"], 4.5, "Count 배지 숫자", REF("다크는 negative-strong 이 red-50(#FF4242)이라 3.44, 라이트 red-40 은 4.58 — 진한 빨강 + 흰 숫자는 사람의 결정")],
  ...ACCENTS.map((c) => [`--foreground-accent-${c}`, [...SURFACES, `--surface-accent-${c}`], 4.5, "강조색 글자·아이콘", REF_ACCENT]),
  /* 제품 면 위 글자 — 기준 시스템은 두 테마 모두 static.white 다. 다크 면(blue 60)에서 3.54 로 떨어진다.
     면을 옮길 자리가 없다(-on 역할이 없다). 그래서 적응 대신 제약을 건다 —
     제품 색은 흰 글자가 4.5 를 넘어야 하고 verify 가 data.js 의 제품 전부를 검사한다.

     **그 제약은 라이트 기준이다.** 다크는 면이 한 단계 밝은 brand-60 을 집으므로 rest 가 제품 색보다 밝아져
     흰 글자가 2.5~3.5 로 떨어진다(기본 #0066FF 3.54 · 제품 C #008760 2.51 — 제품 색이 밝을수록 낮아진다).
     기준 시스템이 다크의 brand 면을 blue-60 에 두고 그 위에 static.white 를 쓰기 때문이고,
     다크까지 4.5 를 요구하면 **참조의 기본색부터 탈락한다.**

     고치려면 다크 면을 어둡게 내려야 하는데 그러면 버튼이 어두운 캔버스에 묻힌다(분리 1.11~1.23, 바닥 1.5).
     **제품 색이 앞으로 바뀔 수 있으므로 지금은 참조 값을 따르기로 했다**(사용자 결정) —
     고친 것이 아니라 고르지 않은 것이고, 그래서 숨기지 않고 매 빌드 숫자를 보고한다 */
  ["--brand-label", ["--surface-brand-primary", "--surface-brand-strong", "--surface-brand-heavy"], 4.5, "제품 면 위 글자", REF("다크는 rest 가 제품 HEX(brand-50)라 제품 색 제약이 받치고, 상태가 밝아지는 쪽(55 → 60)이라 hover·pressed 만 4.5 아래다 — #0066FF 4.13 · 3.54, 밝은 제품 #008760 3.31 · 2.51")],

  /* 글자 없는 지표(점·바·밴드·도넛) — 1.4.11 의 3:1 */
  ["--foreground-negative-primary", SURFACES, 3, "부정 지표 — danger 점 · 진행 막대"],   // 오류 필드의 테두리(포커스 때도 1px)도 이 토큰. 바깥 4px --line-negative-focus 후광은 장식(1.17)
  ["--foreground-cautionary-primary", SURFACES, 3, "High 지표", REF("기준 시스템 값 — 라이트 2.24")],
  /* 심각도 5단계(사람의 결정 2026-11-06), Critical · Medium 톤(2026-11-09) — Critical 은 진한 빨강 negative-strong, Medium 은 foreground/accent/lime(라이트 lime-40).
     Medium 라이트는 3:1 을 못 넘는다 — High 주황(2.24)과 같은 처지이고, 등급 라벨 병기가 제약이라(verify) 색이 유일한 단서가 아니다 */
  ["--foreground-negative-strong", SURFACES, 3, "Critical 지표"],
  ["--foreground-accent-light-blue", SURFACES, 3, "Medium 지표"],   // 2026-11-11 Medium ↔ Low 색 교체(사람의 결정) — 라이트 3.68 · 회색 3.43 로 통과
  ["--foreground-accent-lime", SURFACES, 3, "Low 지표", REF("사람의 결정(2026-11-09 톤 · 2026-11-11 Low 로 옮김) — 라이트 lime-40 이 흰 바탕 2.90 · 회색 바탕 2.70, 다크 lime-50 은 통과")],
  ["--foreground-inactive-primary", SURFACES, 3, "Info 지표 · 비활성 점", REF("기준 시스템 값 — 라이트 2.78 · 다크 2.55")],
  ["--foreground-accent-cyan", SURFACES, 3, "Pending 상태 점(태그) · info 알림 아이콘"],
  ["--foreground-positive-primary", SURFACES, 3, "긍정 지표", REF("기준 시스템 값 — 라이트 2.46")],
  ["--foreground-brand-primary", SURFACES, 3, "제품색 지표 · 포커스 링"],
  /* 탐색형 차트 계열 — 글자 없는 마크(선 · 막대 · 조각)라 3:1. 라이트 · 다크 각각 세 바탕에서 넘기는 단계를 골랐다(dataviz 검증기 — style.src.css 주석) */
  ...[1, 2, 3, 4, 5, 6].map((i) => [`--chart-series-${i}`, SURFACES, 3, `차트 계열 ${i}`]),
  ["--chart-series-1-subtle", SURFACES, 3, "차트 비교 기간 막대(계열 1 옅은 톤)", { advisory: true, why: "사람의 결정(2026-11-05) — 비교 기간은 같은 색상의 옅은 톤으로 나누는 관례를 따른다. 계열 1 과의 대비 2.74 로 둘이 갈리고, 값은 툴팁 · 범례로 읽는다" }],
  ["--chart-series-1-strong", SURFACES, 3, "차트 막대 위 선(계열 1 진한 톤)"],
  ["--chart-axis-text", SURFACES, 4.5, "차트 축 · 범례 글자", REF("foreground/neutral/tertiary 를 참조 — 기준 시스템 값(61% 알파)이라 글자 쌍과 같은 예외")],
  ["--chart-tooltip-text", ["--chart-tooltip-surface"], 4.5, "차트 툴팁 글자"],   // 값 입력 필드의 포커스 테두리(1px)도 이 토큰. 바깥 4px --line-brand-focus 후광은 장식이라 쌍을 두지 않는다(라이트 1.19 · 다크 1.16)
  /* 컴포넌트 경계 — 기준 시스템의 line/neutral/primary 는 중립 50 의 22% 다 */
  ["--line-neutral-primary", SURFACES, 3, "컴포넌트 경계", REF("기준 시스템 값 — 아웃라인 경계의 식별은 라벨과 채운 면이 함께 맡는다(1.4.11)")],
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
  /* 눌림 단계 — 참조에 없어 우리가 더한 틴트다(base-tokens.js 의 ADDITIONS) */
  ["--surface-negative-heavy", SURFACES, { light: 1.1, dark: 1.1 }],
  ["--surface-brand-subtle-strong", SURFACES, { light: 1.04, dark: 1.04 }],
  /* Sparkline 일반 막대 — 강조(.hi)와 갈리도록 옅게 했다. 장식(aria-hidden)이라 3:1 대상은 아니지만 막대가 바탕에 녹으면 안 된다 */
  ["--line-brand-primary", SURFACES, { light: 1.4, dark: 1.4 }],   // 실측 라이트 1.45~1.61 · 다크 1.45~2.45
  ["--line-brand-strong", SURFACES, { light: 1.7, dark: 1.7 }],   // Outline Primary 버튼 테두리(2026-10-29) — 실측 기본 제품 라이트 1.92 · 다크 1.90, 가장 낮은 곳은 제품 C 의 패널 바탕 1.79. 비텍스트 3:1 에는 못 미치지만 라벨(제품색 글자)이 버튼을 알린다
  ...ACCENTS.map((c) => [`--surface-accent-${c}`, SURFACES, { light: 1.03, dark: 1.03 }]),
  /* 채운 제품 면이 페이지에서 보이는지 — 이 쌍이 없으면 '면이 배경에 녹는' 경우를 아무도 재지 않는다 */
  ...["--surface-brand-primary", "--surface-brand-strong", "--surface-brand-heavy"]
    .map((t) => [t, SURFACES, { light: 1.5, dark: 1.5 }]),
  /* 라이트에서 카드(elevated)와 페이지가 둘 다 흰색이라 분리가 1.00 이다 — 기준 시스템도 같고,
     경계는 보더와 그림자가 전담한다. 숫자를 숨기지 않되 빌드를 막지는 않는다 */
  ["--surface-elevated-primary", ["--background-neutral-primary"], { light: 1.02, dark: 1.02 }, { advisory: true, why: "기준 시스템도 라이트에서 둘 다 흰색이다 — 경계는 보더·그림자가 맡는다" }],
];

/* 심각도 다섯 등급은 서로 다른 값이어야 한다. 휘도 분리는 요구하지 않는다 —
   다섯 색의 색조가 모두 다르고(빨강·주황·라이트 블루·라임·중립 — 2026-11-11 Medium ↔ Low 교체) 대비 비율은 색조 차이를 보지 못한다.
   2026-11-11 교체(사람의 결정)의 근거 — 이웃 등급(도넛 · 누적 막대에서 맞붙는 쌍)의 최소 CIEDE2000 이 라이트 0.3 → 10.6 · 다크 4.3 → 11.5(tritan Medium 파랑 ↔ Low 라임).
   주황 ↔ 라임 쌍 자체는 그대로라(High ↔ Low, 라이트 protan 0.3) 아래 실측과 라벨 병기 규칙은 여전히 유효하다. 라이트 Medium 지표는 3:1 을 넘게 됐다(2.90 → 3.68).
   색각 분리 실측(dataviz validate_palette.js --pairs all, 2026-11-09 Critical = negative-strong · Medium = accent-lime 기준): Medium 라임 ↔ High 주황이 적록 색각에서
   라이트 ΔE 0.3(protan, #48AD00 ↔ #FF9200) · 다크 4.4(protan, #58CF04 ↔ #FFA938) — 라이트는 사실상 같은 색으로 보인다(목표 8 · 하한 6).
   (2026-11-06 의 lime-opaque 때는 라이트 2.2 · 다크 0.3)
   옛 4단계(청록 Medium)는 최악 쌍이 10.5 로 통과했다. 정상 시각 하한(15)은 라이트 16.3 · 다크 15.8 로 통과한다.
   이 쌍은 등급 라벨 · 고정 순서(Critical → Info) · 조각 사이 구분선이 대신 갈라 준다 — 색 말고 단서가 있어야 하는 이유다
   색만으로 의미를 전달하지 않는다(1.4.1)는 라벨 병기와 구분선이 담당하고 verify 가 그것을 검사한다 */
const severityRanks = [
  "--foreground-negative-strong", "--foreground-cautionary-primary",
  "--foreground-accent-light-blue", "--foreground-accent-lime", "--foreground-inactive-primary",
];

/* 소비자가 없어도 허용하는 토큰 — 기준 시스템과 1:1 이 목적이므로, 우리 화면이 아직 안 쓰는 것이 남는다.
   여기 적지 않은 채 소비자가 0 이면 빌드가 경고한다(= 군살이 소리 없이 쌓이지 않는다) */
const grammarOnly = [
  /* 기준 시스템의 전체 집합을 그대로 싣는다 — 아래는 우리 화면에 아직 쓸 자리가 없는 것들이다 */
  "--foreground-neutral-quaternary", "--foreground-brand-inverse",
  "--surface-neutral-primary", "--surface-elevated-secondary",
  "--surface-brand-heavy",
  ...ACCENTS.flatMap((c) => [`--surface-accent-${c}-opaque`, `--line-accent-${c}`, `--foreground-accent-${c}`])
    /* 심각도가 쓰는 것은 뺀다 — cyan(Pending · info 알림), light-blue(Medium: 면 · 점 · solid 테두리), lime(Low: 면 · 점 foreground-accent-lime · 테두리 — 2026-11-11 교체) */
    .filter((t) => !/cyan$/.test(t) || /opaque|line/.test(t))
    .filter((t) => !["--foreground-accent-lime", "--line-accent-lime", "--line-accent-cyan", "--foreground-accent-light-blue", "--line-accent-light-blue"].includes(t)),
  ...ACCENTS.filter((c) => !["cyan", "lime", "light-blue"].includes(c)).map((c) => `--surface-accent-${c}`),
  "--line-neutral-primary-opaque", "--line-neutral-secondary-opaque", "--line-neutral-tertiary-opaque",
  "--line-negative-strong",   // --line-brand-focus · --line-negative-focus 는 값 입력 필드 포커스 후광으로, --line-brand-strong 은 Outline Primary 버튼 테두리로(2026-10-29) 쓰기 시작해 뺐다
  "--line-positive-primary",
  "--effect-transparent-primary", "--effect-transparent-secondary",
  "--company-mark-subtle",
  /* 탐색형 차트 토큰은 CSS 가 아니라 ds-chart.js 가 계산값으로 읽는다(캔버스) — CSS 소비자가 0 이어도 살아 있는 토큰이다 */
  ...[1, 2, 3, 4, 5, 6].map((i) => `--chart-series-${i}`), "--chart-series-1-subtle", "--chart-series-1-strong", "--chart-grid-primary", "--chart-axis-text", "--chart-tooltip-surface", "--chart-tooltip-text",
  /* 램프는 의미 토큰이 고르는 재료라 단계별 소비자를 요구하지 않는다 */
];

module.exports = { SURFACES, ACCENTS, OPAQUE_ONLY, pairs, separation, severityRanks, grammarOnly };
