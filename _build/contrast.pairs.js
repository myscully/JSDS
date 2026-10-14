/* 대비 계약 — '한 화면에서 만날 수 있는 쌍'만 선언하고 값은 빌드가 잰다(contrast.js).
   사람이 숫자를 적지 않는다: 종전에는 페이지의 대비 수치가 네 번 낡았다.
   측정은 실제 생성 사이트에서 라이트·다크 × 제품 세 경우(기본 · 밝은 제품 · 상태색과 겹치는 제품)로 전수 수행한다. */

const SURFACES = ["--surface-base", "--surface-raised", "--surface-sunken"];
const INTENTS = ["accent", "danger", "danger-strong", "warning", "success", "info"];

/* 글자·지표는 솔리드여야 한다(알파가 들어가면 바탕마다 다르게 측정된다) — 이 목록이 그 규칙의 검사 대상이다 */
const SOLID_ONLY = [
  ...SURFACES, "--surface-inverse",
  "--text-primary", "--text-secondary", "--text-tertiary", "--text-disabled", "--text-inverse",
  "--graphic-muted", "--focus-ring",
  ...INTENTS.flatMap((i) => [`--${i}-surface`, `--${i}-surface-hover`, `--${i}-surface-pressed`, `--${i}-on`, `--${i}-text`, `--${i}-graphic`]),
  "--accent-text-inverse",
];

/* [전경, 바탕들, 최소 대비, 메모] — 메모는 Colors 페이지 표의 '왜' 칸이 된다 */
const pairs = [
  ["--text-primary", SURFACES, 4.5, "본문"],
  ["--text-secondary", SURFACES, 4.5, "보조 본문"],
  /* 중립 태그·칩·개수 배지의 라벨이 --fill-strong 위에 올라앉는데 그 쌍을 재지 않고 있었다 */
  ["--text-secondary", ["--fill-strong"], 4.5, "중립 칩 라벨"],
  ["--text-tertiary", [...SURFACES, "--fill-strong"], 4.5, "설명·캡션 · 중립 태그 라벨"],
  ["--text-inverse", ["--surface-inverse"], 4.5, "툴팁·토스트 글자"],
  ["--graphic-muted", SURFACES, 3, "비활성 점·범례 칩"],
  ["--focus-ring", SURFACES, 3, "포커스 링"],
  /* advisory — 측정값이 기준에 못 미쳐도 빌드를 막지 않고 매 빌드 경고로 남긴다.
     중립 200(#C2C4C8)은 흰 바탕에서 1.75 다. 3:1 을 맞추려면 중립 500(4.73)까지 가야 하고
     그러면 입력 필드 테두리가 과해진다 — 아웃라인 버튼·입력의 식별은 라벨과 채운 면이 함께 맡는다(1.4.11).
     값을 올릴지는 화면을 보고 결정할 문제라, 숫자를 숨기지 않고 계속 보고하게 둔다. */
  ["--line-strong", SURFACES, 3, "컴포넌트 경계", { advisory: true }],
  ...INTENTS.flatMap((i) => [
    [`--${i}-on`, [`--${i}-surface`, `--${i}-surface-hover`, `--${i}-surface-pressed`], 4.5, "면 위 글자 — 세 상태 전부"],
    [`--${i}-text`, [...SURFACES, `--${i}-fill`], 4.5, "옅은 바탕 위 글자"],
    [`--${i}-graphic`, SURFACES, 3, "글자 없는 지표"],
  ]),
  ["--accent-text-inverse", ["--surface-inverse"], 4.5, "반전 표면 위 제품색 글자"],
];

/* 옅은 면은 자기 바탕과 구분돼야 한다.
   바닥값을 테마로 가른다 — 밝은 바탕에서는 색조 변화가 분리를 거들지만(종전 --orange-50 도 1.09 다),
   어두운 바탕에서는 색조만으로는 보이지 않아 휘도가 필요하다(제품 색 12% 단독이면 선택 행이 1.11).
   라이트에서 1.35 를 요구하면 '옅은 면'이 아니게 되고, 다크에서 1.06 만 요구하면 선택 행이 보이지 않는다. */
const separation = [
  ["--fill-weak", SURFACES, { light: 1.02, dark: 1.03 }],
  ["--fill-base", SURFACES, { light: 1.03, dark: 1.06 }],
  ["--fill-strong", SURFACES, { light: 1.06, dark: 1.08 }],
  ["--fill-disabled", SURFACES, { light: 1.04, dark: 1.06 }],
  /* accent fill 은 선택 행이라 휘도 분리가 필요하고(다크 1.35), 상태색 fill 은 라벨이 붙은 태그 바탕이라
     색조만으로 충분하다 — 상태색에 휘도까지 요구하면 바탕이 밝아져 자기 -text 가 AA 아래로 떨어진다 */
  ["--accent-fill", SURFACES, { light: 1.06, dark: 1.35 }],
  ...INTENTS.filter((i) => i !== "accent").map((i) => [`--${i}-fill`, SURFACES, { light: 1.06, dark: 1.1 }]),
];

/* 심각도 다섯 등급은 서로 구분돼야 한다. 다만 대비 비율은 휘도만 보므로 색조 차이를 잡지 못한다 —
   Medium(주황 #FF9200)과 Low(청록 #00BDDE)는 휘도가 같아 비율이 1.00 이지만 눈으로는 다른 색이다.
   그래서 휘도 분리는 '같은 색조 이웃'에만 요구하고(Critical·High 는 둘 다 빨강이라 휘도가 유일한 단서다),
   나머지는 '값이 서로 다르다'만 본다. 색만으로 의미를 전달하지 않는다는 규칙은 라벨 병기가 담당한다. */
const severityRanks = ["--sev-critical", "--sev-high", "--sev-medium", "--sev-low", "--sev-info"];
const severitySameHue = [["--sev-critical", "--sev-high"]];
const SEVERITY_ADJACENT_MIN = 1.5;

/* 색조 계열 표 — 등급 구분을 열 쌍 전수로 검사하기 위한 것이다.
   같은 계열이면 휘도가 유일한 단서이므로 ΔL* 를 요구하고, 계열이 다르면 색조가 단서이므로 값이 다르면 된다.
   이 표가 필요한 이유: red-600 과 neutral-500 은 ΔL* 0.9 로 휘도가 거의 같은데(대비 1.03),
   그게 통과하는 까닭이 '계열이 달라서'라는 사실이 코드에 남아야 합니다 — 검사를 안 하는 것과는 다릅니다.
   그리고 이 다섯 색 세트는 회색조로는 분리 불가능합니다(상태색 램프를 공유하는 한 만들 수도 없습니다) —
   1.4.1 준수는 전적으로 라벨 병기에 의존하고, verify 가 그 라벨을 검사합니다. */
const HUE_FAMILY = {
  "--sev-critical": "red", "--sev-high": "red", "--sev-medium": "orange", "--sev-low": "cyan", "--sev-info": "neutral",
  "--danger-strong-graphic": "red", "--danger-graphic": "red",
  "--warning-graphic": "orange", "--info-graphic": "cyan", "--muted-graphic": "neutral",
};
const hueFamilyOf = (t) => HUE_FAMILY[t] || "unknown";
const SAME_HUE_LSTAR_MIN = 8;

/* 등급 간 옅은 바탕 분리 — Critical 과 High 는 같은 빨강이라 바탕의 짙기가 유일한 단서다.
   같은 알파로 접으면 라이트 1.04 · 다크 1.09 로 '지각 가능' 바닥(1.1)에도 못 미친다.
   바닥을 1.15 로 두는 이유: 오늘 값이 라이트 1.17 · 다크 1.11 이라 1.1 로는 다크의 퇴행을 잡지 못한다 */
const severityFillSplit = [["--sev-critical-bg", "--sev-high-bg", { light: 1.15, dark: 1.10 }]];

/* 소비자가 없어도 허용하는 토큰 — 역할 문법의 완결성 때문에 선언만 해 둔 것들.
   여기 적지 않은 채 소비자가 0 이면 빌드가 경고한다(= 군살이 쌓이지 않는다). */
const grammarOnly = [
  /* 3차에서 --sev-* 20개를 대체한다 */
  "--danger-strong-surface", "--danger-strong-surface-hover", "--danger-strong-surface-pressed",
  "--danger-strong-fill", "--danger-strong-line", "--danger-strong-on", "--danger-strong-text", "--danger-strong-graphic",
  /* 상태색 버튼 변형이 없어 소비자가 없다. 지우면 '상태는 surface 에만 붙는다'는 문법에 구멍이 생긴다 */
  "--warning-surface-hover", "--warning-surface-pressed",
  "--success-surface-hover", "--success-surface-pressed",
  "--info-surface-hover", "--info-surface-pressed",
  /* 보더용 알파 — 알림 배너·카드 경계에 쓸 자리가 2차 이후 생긴다 */
  "--accent-line",
  /* 상태색 면을 점·바에서만 쓰게 역할을 가르고 나니 채운 면이 남지 않았다 — 문법상 기준 단계라 선언은 남긴다 */
  "--info-surface", "--info-on",
  /* 램프는 의미 토큰이 고르는 재료라 단계별 소비자를 요구하지 않는다 */
];

module.exports = { SURFACES, INTENTS, SOLID_ONLY, pairs, separation, severityRanks, severitySameHue, SEVERITY_ADJACENT_MIN, severityFillSplit, hueFamilyOf, SAME_HUE_LSTAR_MIN, grammarOnly };
