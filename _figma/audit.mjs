/* Figma ↔ 저장소 대조.
 *
 *   node _figma/audit.mjs expect              저장소가 기대하는 상태를 JSON 으로
 *   node _figma/audit.mjs diff <덤프.json>    _figma/probe.js 결과와 대조 (어긋나면 exit 1)
 *
 * 기대값은 **저장소에서 읽는다** — 손으로 적은 숫자는 금방 거짓이 된다.
 *   토큰   _build/style.src.css 의 :root 와 :root[data-theme="dark"]
 *   아이콘 _build/icons.gen.js 의 ICONS
 *   타입   assets/style.css 의 .t-* 클래스
 *   컴포넌트 _build/style.src.css 의 .card · .card-foot · .tabs … 규칙 (표면 그림자·보더, 간격, 트랙)
 *   Button  .btn:where(형태.색) · :hover · :active · 비활성 규칙 — 변형 표(Variant × Color × Size × State × Icon Only × Loading)와 칠(2026-10-28 k16, buttonExpect)
 *           Loading 변형 — .btn.loading(라벨 투명 · 자리 유지) · ::after 스피너(16 · 가운데 · 윗변 색 규칙 넷)(2026-10-28 k17)
 *   컨테이너 _build/components.data.js 의 예제 HTML(순서 · 라벨 · 아이콘), 내비 기하는 빌드된 components/navigation.html 을
 *            헤드리스 Chromium 으로 잰 값(_build/node_modules/playwright — 없으면 어긋남으로 남긴다)
 *   Spec   _build/components.data.js 의 spec 행 ↔ 문서 카드 "Card/…" 의 Spec 글
 *   포커스 _build/style.src.css 의 값 입력 필드 포커스 규칙(오류 필드 포함 · k9 부터 inset 없음)과 전역 :focus-visible 외곽선(선택 컨트롤의 Focus Ring — Button 은 k16 에 Focused 변형을 지워 뺐다) — focusExpect
 *   효과 색 컴포넌트 세트의 그림자 색이 변수나 효과 스타일에 묶였는지(2026-10-26 k6) — 기대값 없이 probe 가 모은 것을 그대로 어긋남으로
 *   버튼   빌드된 components/button.html 에 "버튼" 버튼을 붙여 Chromium 으로 잰 상자(테두리 + padding · 높이)(2026-10-26 k7, k16 에 새 클래스로)
 *   Text Field 입력칸 높이 ↔ .field input · .sm · .lg(2026-10-28 k16)
 *   Accordion 변형 표(Variant × Size × State = 24) · 크기별 헤더 높이 · 제목 크기 · 셰브론 크기 ↔ .accordion summary · .sm/.md/.lg,
 *           Hover 헤더 면 ↔ summary:hover · 모서리, Disabled 글자 · 보조 정보 · 셰브론 ↔ .accordion.disabled, 기본 변형 ↔ props 기본값(2026-10-29 k21, accordionExpect),
 *           앞 아이콘 "Icon" 크기 ↔ .accordion summary>svg · .sm · .lg, 색 = 제목, 기본 숨김 · Icon(불리언 false) · 인스턴스 교체 속성 연결(2026-10-29 k22)
 *           헤더 줄 간격 ↔ .accordion summary gap · 왼쪽 정렬(Icon > Title(FILL · LEFT) > Meta > Chevron)(2026-10-30 k24)
 *   Breadcrumb 변형 표(Type × State) ↔ figma.variants × figma.states 중 current 를 뺀 것(current = 모든 변형의 마지막 항목), 높이 ↔ .breadcrumb min-height · figma.sizes.md.h,
 *           간격 ↔ .breadcrumb · li gap, 첫 자식 = 홈 아이콘(예제 첫 li), 구분자 ↔ li+li::before(아이콘 · 크기 · 색), 접힘 = 홈 + … + 끝 2개,
 *           글자 · 마지막 항목(색 · 굵기) ↔ .breadcrumb 규칙, State=Hover · Focus 는 받는 항목 하나(Default 첫 상위 링크 · Collapsed …)만 a:hover · .more:hover / :focus-visible 외곽선,
 *           나머지 항목은 같은 Type 의 State=Default 와 같음. 항목 세트 Breadcrumb Item 이 남아 있으면 어긋남(2026-10-30 k25 · 2026-11-02 k26, breadcrumbExpect)
 *   Card   변형 표(Type × Size × State — State 는 Type=Selection 에만 여럿) ↔ components.data.js card.figma, padding · gap(md · sm · List=flush · Head) 과 묶인 변수 ↔ .card · .card.md · .card.sm ·
 *           .card.flush · .card-head, 면 · 테두리 · 모서리 · 최소 폭 ↔ .card, 제목 크기 · 굵기 · 텍스트 스타일 ↔ .card .title · .card.sm .title · .t-*, 설명 · 키-값 ↔ .card .desc · .card-meta,
 *           선택 카드 아이콘 · Hover(shadow/2) · Selected(안쪽 링 · 면) · Disabled(면 · 제목 · 아이콘 · 설명 줄 tertiary) ↔ .card.clickable · .card.on 규칙, 빈 · 오류 본문 ↔ .card .empty · .empty,
 *           Loading ↔ loading 예제 Skeleton, 기본 변형 ↔ props size 기본값(2026-11-03 k29, cardExpect), 제목 행간 · 한 줄 글 상자 높이 ↔ CSS line-height(k29 마무리)
 *   Variant(2026-11-03 k32 — 사람의 결정) Card · KPI · Chart Card 의 Variant 축(Outline · Flat) ↔ components.data.js card · data-visual 의 figma.variant 와 props variant 기본값,
 *           Outline 보더 ↔ .card · .kpi · .chart-card border, Flat 보더 = 투명 · 두께는 Outline 과 같음 ↔ .card.flat · .kpi.flat · .chart-card.flat border-color(두께를 바꾸면 기대값을 읽다 멈춘다),
 *           Flat 과 같은 이름의 Outline 크기 같음(±0.5) · 면 같음 · 그림자 없음. KPI · Chart Card 는 모든 변형이 두 Variant 로 짝, Card 의 Flat 은 State=Default 만(flatExpect · diffFlat)
 *   Chart(2026-11-04 k33 — 사람의 결정 2026-11-03) 트리 밖 차트 토큰 --chart-*(계열 6 · 격자 · 축 글자 · 툴팁 면 · 글자) ↔ Semantic 의 color/semantic/chart/* — 값은 별칭(atomic 램프 · 의미 토큰)이어야 함,
 *           세트 "Chart" 의 Type = Timeseries · Bar · Donut · Mixed ↔ data-visual.figma.chart.types, 변형마다 카드(.chart-card) · 제목(.chart-title → Title/1) · 캔버스 240 · 선 2 · 영역 알파 0.24 ·
 *           막대 끝 4 · 두께 ≤ 32 · 도넛 구멍 67% · 조각 틈 2(면 색) · 호 각도(값 비율) · 격자 · 눈금 12 · 범례(계열 순서 · 견본 10) · hover 점 8 · 툴팁(면 · 글자 · 반경 6 · padding 10 · 견본 8) ↔
 *           figma.chart · 예제 data-spec · ds-chart.src.js(chartExpect · diffChart)
 *   차트 모양(2026-11-05 k35 — 사람의 결정 2026-11-05) 탐색형: 막대 네 귀 모서리 ↔ ds-chart bar · mixed 의 borderRadius(= figma.chart.barRadius 0) · 보이는 테두리 0 ↔ 혼합 막대 borderWidth ·
 *           bar 프리셋 borderWidth(= figma.chart.barStroke) · 막대 borderColor "transparent", 누적 세그먼트 틈 ↔ bar 프리셋의 틈 식 { left | bottom: N } 이 있으면 N, 없으면 bar borderWidth
 *           (= figma.chart.gap — 2026-11-06 k36 사람의 요청으로 0, 맞닿음. Figma Bar 변형이 비누적이면 대상 없음), 도넛 조각 경계 ↔ ds-chart donut 프리셋 · paint 의 borderWidth(= figma.variants.donut.gap 의 Npx),
 *   범례 자리(2026-11-06 k36 — 사람의 요청) 탐색형 도넛: 범례 방향 · 위치 ↔ ds-chart legendPosition(예제 spec.legend, Figma 캔버스 폭, 높이) — SIDE_LEGEND_RATIO 와 함수 본문을 ds-chart 에서 떠서 돌린다,
 *           정적 도넛 + 범례 행(Chart Card 변형 · 인스턴스 · 대시보드): 쓸 수 있는 폭(행 부모의 안쪽 폭) < 도넛 + .donut-row 열 간격 + 범례 폭 이고 .donut-row 가 wrap 이면
 *           세로 · 간격 = 행 간격 · 왼쪽 정렬 · 범례가 도넛 아래, 아니면 가로 · 열 간격 · .donut-row justify · align · 폭 채움 · 범례가 도넛 오른쪽(staticChartExpect.row · diffStatic rowCheck),
 *           범례 견본 = 원 · 지름 boxHeight × √2(±0.5) · 툴팁 견본 = min(boxWidth, boxHeight) ↔ ds-chart legend · tooltip(usePointStyle · pointStyle = figma.chart.legend),
 *           계열 톤(series-1 · -subtle 지난 주 · -strong 혼합 선) ↔ ds-chart TONES(figma.chart.tones 와 다르면 멈춤) — 막대 · 선 · 범례 색의 변수 연결로 본다.
 *           정적: Chart Card 막대 · 대시보드 트랙 ↔ .chart .bar · .chart .bar i border-radius, 스파크라인(Chart Card · KPI) ↔ .sparkline i, 범례 견본 크기 · 원 ↔ .chart-legend i,
 *           도넛 경계선(Chart Card 의 Donut · 대시보드 도넛) 개수 · 각도 · 크기 · 칠 · 반지름 방향 ↔ .donut i 와 예제 donut · 대시보드의 --a, 호는 틈 0,
 *           Data Visual 문서 'KPI · 예제 =' 카드 ↔ 예제 kpi 의 .kpi(라벨 · 값 · 단위 · 증감 · 화살표 · 칠 — k35b), 'KPI · Tone =' = Default + CSS 톤 · 라벨 하나,
 *           4 Pattern 대시보드 KPI ↔ patterns.data.js dashboard 의 .kpi(같은 항목) · 대시보드에만 있는 KPI 라벨 없음(staticChartExpect · diffStatic).
 *           대시보드 차트 줄 카드 구성(2026-11-06 k37 — 사람의 결정: 사이트처럼 '탐지 추이' 시계열 + '심각도 분포' 도넛) ↔ patterns.data.js dashboard 의 도넛 줄(.row-*) chart-card 들:
 *           개수 · 순서 · 제목 · 기간(<span>) · 종류(canvas data-chart = Chart 세트 Type, .donut = 정적 도넛, .chart = 정적 막대). 탐색형 카드는 data-spec 이 같은 Type 의 예제 spec 과 같아야 하고
 *           (Figma 변형은 예제 데이터를 그린다), 범례 글 = 계열(2개 이상일 때) · 선 = 계열 · 영역 = stacked 면 계열 · x 눈금 글 ⊂ labels · 쉬는 상태라 Hover 숨김. 새 변수 두 개의 별칭은 토큰 대조(--chart-*)가 본다,
 *           KPI 단위(세트 변형 · 문서 · 대시보드) ↔ .kpi .value small 의 크기 · 굵기 + .kpi .value 에서 물려받는 행간 · 자간(맞는 타입 스케일 스타일이 있으면 그 스타일, 없으면 값 · Noto 면 font-revert-nodes.tsv 에 있어야 — k35c),
 *           KPI Delta 변형에 None(class 없는 .kpi .delta — 화살표 없음 · 칠 .kpi .delta) · 예제의 증감 방향 = Delta 값 · 예제 카드에 칠 덮어쓰기 없음 · class 없는 증감 카드는 덮어쓰기 0(k35c)
 *   도넛 가운데(2026-11-05 k34 — 사람의 결정 2026-11-04: Title/1) Chart Card 의 Donut(정적)과 Chart Type=Donut 의 가운데 글 ↔ .donut::after 의 font-size · line-height · font-weight 와 같은
 *           타입 스케일 스타일 하나(스타일 이름 · 크기 · 행간) · 가로 가운데 ±1. ds-chart centerPlugin 의 ctx.font 가 .donut::after 와 다르면 기대값을 읽다 멈춘다(donutCenter)
 *   문서 틀 색(2026-11-06 k38 — 사람의 결정: 다크에서도 맞게) 4 Pattern 문서 카드(Card/… = Header + Body)의 섹션 머리 글 · 카드 · 카드 머리 글 · 패널 · 패널 제목 · 예시 설명 · 예시 틀 ·
 *           '사용 컴포넌트' 칩 · Do/Don't 상자 · 라벨 · 글의 칠 · 선 · 글자 ↔ 사이트 셸 규칙(body · h1 · h2 · p · .lead · .panel · .example · .uses a · .dodont)의 토큰과 같은 변수(DOC_ROLES 에 대응을 적음),
 *           사이트 셸에 대응이 없는 것(Body 회색 면 · '개발 상태' 칩 · 감싼 프레임)은 시멘틱 변수에 묶였는지만. 어디서든 raw 색 · static/* · atomic 은 어긋남(static 은 모드마다 같아 다크에서 안 바뀜).
 *           섹션 자체의 선(Figma 섹션 기본 선)은 사이트 대응이 없어 NOTE. 다른 페이지 문서 틀은 세기만 해 NOTE 로(사람이 범위를 정함 — diffDocFrames)
 *           k39(2026-11-06 — 사람의 결정): 3 Component · 2 Element 도 대조(DOC_PAGES). 더한 대응 — Table 줄 ↔ th · td, Stage · Surface ↔ .elev-types .demo · .demo i,
 *           Layout demo · Side nav ↔ .shell-demo · .side. Properties · Spec 은 사이트 대응이 없어 시멘틱인지만. 1 Theme · Resource 는 현황 NOTE
 *           k40(2026-11-06 — 사람의 결정): 표 칸 글자 — 머리 줄 글 ↔ th color(tertiary), 나머지 줄 글 ↔ td color(없으면 table · .tablewrap · .page · .main · body 로 물려받음 = primary)
 *   기본 변형 Tag 세트의 기본 변형 크기 ↔ components.data.js 의 Tag props size 기본값(2026-10-26 k7) · Button 의 variant · color · size 기본값(k16)
 *   반투명 모든 컴포넌트 · 변형 · 세트의 자기 불투명도가 1 인지(2026-10-27 k10) — 비활성은 토큰으로 칠한다(CLAUDE.md). 예외는 OPACITY_OK
 *   선택 컨트롤 선택된 Radio · 선택 + 비활성 Radio 의 면 · 테두리 · 점, 비활성 Slider 의 라벨 · 값 글자 칠(2026-10-27 k11) — controlsExpect
 *   비활성 안쪽 층 이름에 Disabled 가 든 변형 · 노드 안의 불투명도(2026-10-27 k12) · Chip 삭제(x) · 비활성 Item Tile 칠 — chipTileExpect
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const { splitSelectors } = require(path.join(ROOT, "_build/lib.js"));

/* ---------- 토큰 ---------- */
const GROUPS = ["foreground", "background", "surface", "line", "effect", "static"];
const EXTRA = ["--brand-label", "--company-mark", "--company-mark-subtle"];
const RAMP = /^--((?:cool-neutral|neutral|blue|green|orange|red-orange|red|lime|cyan|light-blue|violet|purple|pink))-(\d+)$/;

function block(css, sel) {
  const i = css.indexOf(sel + "{");
  if (i < 0) throw new Error("블록 없음: " + sel);
  let d = 0, j = i + sel.length;
  for (; j < css.length; j++) {
    if (css[j] === "{") d++;
    else if (css[j] === "}") { d--; if (!d) break; }
  }
  return css.slice(i, j);
}
const vars = (b) => Object.fromEntries([...b.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;}]+)/g)].map((m) => [m[1].trim(), m[2].trim()]));

function tokens() {
  const css = read("_build/style.src.css");
  const light = vars(block(css, ":root"));
  const dark = vars(block(css, ':root[data-theme="dark"]'));

  const primitives = {};
  for (const [k, v] of Object.entries(light)) {
    const m = k.match(RAMP);
    if (m && /^#/.test(v)) primitives[m[1] + "/" + m[2]] = v;
  }
  primitives["common/white"] = light["--static-white"];
  primitives["common/black"] = light["--static-black"];
  const cssToPrim = Object.fromEntries(Object.entries(primitives).map(([p, hex]) => [hex, p]));
  const byCssName = {};
  for (const [k, v] of Object.entries(light)) { const m = k.match(RAMP); if (m && /^#/.test(v)) byCssName[k] = m[1] + "/" + m[2]; }
  byCssName["--static-white"] = "common/white";
  byCssName["--static-black"] = "common/black";

  /* 제품 슬롯은 기본값(파랑)으로 굳힌다 — 제품을 주입하지 않은 상태가 Figma 의 기준판이다 */
  const slot = (t) => { const m = t.match(/^--(?:prod|brand)-(\d+)$/); return m ? "blue/" + m[1] : null; };
  const resolve = (val, mode) => {
    let m = val.match(/^var\((--[a-z0-9-]+)(?:,\s*var\((--[a-z0-9-]+)\))?\)$/);
    if (m) {
      const t = slot(m[1]) ? m[1] : (m[2] || m[1]);
      const s = slot(t);
      if (s) return "A" + s;
      if (byCssName[t]) return "A" + byCssName[t];
      const src = (mode === "dark" ? dark : light)[t] || light[t];
      if (src && /^#/.test(src)) return "H" + src.slice(1).toUpperCase();
      if (src) return resolve(src, mode);
      return "?" + val;
    }
    m = val.match(/^color-mix\(in srgb,\s*var\((--[a-z0-9-]+)\)\s*([\d.]+)%,\s*transparent\)$/);
    if (m) {
      let t = m[1];
      const s = slot(t);
      if (s) t = "--" + s.replace("/", "-");
      const base = (mode === "dark" ? dark : light)[t] || light[t];
      return /^#/.test(base || "") ? "O" + base.slice(1).toUpperCase() + ":" + +(+m[2] / 100).toFixed(2) : "?" + val;
    }
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) return "H" + val.slice(1).toUpperCase();
    return "?" + val;
  };
  const figPath = (k) => {
    const b = k.slice(2);
    if (b === "brand-label") return "color/semantic/brand/label";
    if (b === "company-mark") return "color/semantic/company/mark";
    if (b === "company-mark-subtle") return "color/semantic/company/mark-subtle";
    const p = b.split("-");
    return "color/semantic/" + p[0] + "/" + p[1] + (p.length > 2 ? "/" + p.slice(2).join("-") : "");
  };

  const semantic = {};
  for (const k of Object.keys(light)) {
    if (!GROUPS.includes(k.slice(2).split("-")[0]) && !EXTRA.includes(k)) continue;
    semantic[figPath(k)] = resolve(light[k], "light") + "|" + resolve(dark[k] !== undefined ? dark[k] : light[k], "dark");
  }

  const space = {};
  for (const [k, v] of Object.entries(light)) {
    const m = k.match(/^--space-(\d+)$/);
    if (m) space["space/" + m[1]] = parseInt(v, 10);
  }
  /* 차트 토큰(2026-11-04 k33 — 트리 밖 --chart-*, base-tokens.js ADDITIONS). Figma 변수는 값을 복사하지 않고 **별칭**이어야 한다 —
     var(--atomic) 는 A<램프/단계>, var(--semantic) 는 Acolor/semantic/<경로>(probe 의 enc 가 atomic 이 아닌 별칭은 이름 전체를 적는다). 그 밖의 값은 어긋남으로 남긴다 */
  const chart = {};
  const alias = (val) => {
    const m = /^var\((--[a-z0-9-]+)\)$/.exec(val || "");
    if (!m) return "?" + val;
    if (byCssName[m[1]]) return "A" + byCssName[m[1]];
    if (GROUPS.includes(m[1].slice(2).split("-")[0]) || EXTRA.includes(m[1])) return "A" + figPath(m[1]);
    return "?" + val;
  };
  for (const k of Object.keys(light)) if (k.startsWith("--chart-")) chart[figPath(k)] = alias(light[k]) + "|" + alias(dark[k] !== undefined ? dark[k] : light[k]);
  return {
    primitives: Object.fromEntries(Object.entries(primitives).map(([p, hex]) => ["color/atomic/" + p, "H" + hex.slice(1).toUpperCase()])),
    semantic,
    space,
    chart,
  };
}

/* ---------- 아이콘 ---------- */
function icons() {
  const mod = require(path.join(ROOT, "_build/icons.gen.js"));
  const I = mod.ICONS || mod;
  const outline = Object.keys(I).sort();
  const filled = outline.filter((n) => I[n].f).sort();
  return { outline, filled };
}

/* ---------- 타입 스케일 ---------- */
function typeScale() {
  const css = read("assets/style.css");
  const out = {};
  for (const m of css.matchAll(/\.t-([a-z0-9-]+)\{([^}]*)\}/g)) {
    const d = Object.fromEntries(m[2].split(";").filter(Boolean).map((x) => x.split(":").map((s) => s.trim())));
    if (!d["font-size"]) continue;
    /* t-title-1 → Title/1. 굵기 변형(2026-11-06 k35d — 사람의 결정으로 타입 스케일 14 → 16): t-title-1-medium → "Title/1 Medium", t-label-2-semibold → "Label/2 SemiBold".
       Figma 텍스트 스타일 이름이 굵기를 Pretendard 의 스타일 철자(SemiBold)로 적는다 */
    const WS = { regular: "Regular", medium: "Medium", semibold: "SemiBold", bold: "Bold" };
    const vm2 = /^([a-z]+)-(\d)-([a-z]+)$/.exec(m[1]);
    if (vm2 && !WS[vm2[3]]) throw new Error(`.t-${m[1]} 의 굵기 접미사 '${vm2[3]}' 를 모릅니다 — audit.mjs typeScale 의 WS 에 더하세요`);
    const name = vm2 ? `${vm2[1][0].toUpperCase()}${vm2[1].slice(1)}/${vm2[2]} ${WS[vm2[3]]}` : m[1].replace(/-(\d)$/, "/$1").replace(/^(\w)/, (c) => c.toUpperCase());
    out[name] = {
      size: parseFloat(d["font-size"]),
      lineHeight: d["line-height"] ? parseFloat(d["line-height"]) : null,
      weight: d["font-weight"] ? parseInt(d["font-weight"], 10) : null,
      letterSpacing: d["letter-spacing"] || "0",
    };
  }
  return out;
}

/* ---------- 컴포넌트 ----------
   기대값은 style.src.css 의 해당 규칙에서 읽는다 — 간격 12 를 여기 적어 두면 CSS 가 바뀌는 날 거짓이 된다 */
function cssRule(sel) {
  /* 주석을 먼저 지운다 — 규칙 뒤에 붙은 설명 주석이 다음 규칙의 셀렉터 앞에 끼어 목록 안 셀렉터를 못 찾았다(2026-10-26 k5) */
  const css = read("_build/style.src.css").replace(/\/\*[\s\S]*?\*\//g, "");
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let m = css.match(new RegExp("(?:^|\\n|\\})" + esc + "\\{([^}]*)\\}"));
  /* 셀렉터 목록 안에 있는 규칙(예: .sidenav.collapsed a span,…,.sidenav.collapsed a.sub{…})도 찾는다.
     목록은 괄호 밖의 쉼표에서만 가른다(2026-10-28 k16) — Button 개편 뒤 .btn:where(.text,.icon-only:not(.solid,.outline))[disabled] 처럼
     괄호 안에 쉼표가 든 셀렉터가 생겼고, 쉼표마다 가르면 ".btn:where(.text" 같은 조각이 되어 찾지 못했다. 사이트 빌드와 같은 함수(_build/lib.js splitSelectors)를 쓴다 */
  if (!m) for (const r of css.matchAll(/(?:^|\n|\})([^{}@]+)\{([^}]*)\}/g)) if (splitSelectors(r[1]).includes(sel)) { m = [null, r[2]]; break; }
  if (!m) throw new Error("CSS 규칙 없음: " + sel);
  return Object.fromEntries(m[1].split(";").filter((x) => x.includes(":")).map((x) => { const i = x.indexOf(":"); return [x.slice(0, i).trim(), x.slice(i + 1).trim()]; }));
}
/* --surface-neutral-secondary → surface/neutral/secondary (그룹/하위/나머지) */
const figTok = (v) => {
  const m = /var\(--([a-z0-9-]+)\)/.exec(v || ""); if (!m) return null;
  const p = m[1].split("-");
  /* 두 마디 토큰 — static/white · brand/label(트리 밖, Figma 에서는 color/semantic/brand/label) */
  if (p[0] === "static" || p[0] === "brand") return p[0] + "/" + p.slice(1).join("-");
  return p.length >= 3 ? `${p[0]}/${p[1]}/${p.slice(2).join("-")}` : null;
};
const inset = (v) => (/inset/.test(v || "") ? figTok(v) : null);
const px = (v) => (v ? parseFloat(v) : null);

/* ---------- 사이트 예제(저장소 = 사이트) ----------
   컨테이너(Steps · Navigation)는 사이트 예제와 순서 · 라벨 · 상태 · 아이콘을 맞춘다. 예제 HTML 은 components.data.js 의
   템플릿 문자열 그대로 읽는다 — 아이콘은 ${I("이름")} 으로 적혀 있어 이름을 바로 얻는다 */
function exampleHtml(comp, id) {
  const src = read("_build/components.data.js");
  const i = src.indexOf('"' + comp + '": {');
  if (i < 0) throw new Error("components.data.js 에 컴포넌트 없음: " + comp);
  const next = /\n  "[a-z0-9-]+": \{/g; next.lastIndex = i + 1;
  const n = next.exec(src), end = n ? n.index : src.length;
  const j = src.indexOf('{ id: "' + id + '"', i);
  if (j < 0 || j > end) throw new Error("components.data.js 에 예제 없음: " + comp + " / " + id);
  const h = src.indexOf("html: `", j), e = src.indexOf("`", h + 7);
  return src.slice(h + 7, e);
}
const strip = (s) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
function stepsExample() {
  return [...exampleHtml("indicator", "steps").matchAll(/<li([^>]*)>([\s\S]*?)<\/li>/g)].map((m) => {
    const cls = ((/class="([^"]*)"/.exec(m[1]) || [])[1] || "").split(/\s+/);
    const i = /<i>([\s\S]*?)<\/i>/.exec(m[2]), ic = i && /\$\{I\("([a-z0-9-]+)"/.exec(i[1]);
    return { state: cls.includes("done") ? "Done" : cls.includes("on") ? "Current" : "Todo", mark: ic ? ic[1] : i ? strip(i[1]) : null,
      label: strip(m[2].replace(/<i>[\s\S]*?<\/i>/, "").replace(/<span class="sr-only">[\s\S]*?<\/span>/g, "")) };
  });
}
function navExample(id = "basic") {
  const out = [];
  for (const m of exampleHtml("navigation", id).matchAll(/<a([^>]*)>([\s\S]*?)<\/a>|<div class="(group|foot)">([\s\S]*?)<\/div>/g)) {
    if (m[3]) { out.push({ kind: m[3], label: strip(m[4]) }); continue; }
    const cls = ((/class="([^"]*)"/.exec(m[1]) || [])[1] || "").split(/\s+/);
    const ic = /\$\{I\("([a-z0-9-]+)"/.exec(m[2]), ct = /<span class="count[^"]*">([\s\S]*?)<\/span>/.exec(m[2]);
    const body = m[2].replace(/\$\{[^}]*\}/g, "").replace(/<span class="count[^"]*">[\s\S]*?<\/span>/g, "");
    out.push({ kind: "item", type: cls.includes("sub") ? "Sub" : "Default", state: cls.includes("on") ? "Selected" : "Default", icon: ic ? ic[1] : null, label: strip(body), count: ct ? strip(ct[1]) : null });
  }
  /* 접힌 예제(.sidenav.collapsed) — 하위 항목 · 그룹 · 건수 · foot 은 CSS 가 숨긴다. 남는 항목은 Figma 의 Type=Collapsed 와 맞춘다 */
  if (id === "collapsed") return out.filter((x) => x.kind === "item" && x.type !== "Sub").map((x) => ({ ...x, type: "Collapsed", count: null }));
  return out;
}

/* ---------- 사이트 실측(2026-10-26 k3) ----------
   내비 항목 · 그룹의 높이와 세로 위치는 CSS 규칙만 읽어서는 얻을 수 없다(줄 높이 상속 · flex gap · 여백). 그래서 빌드된 사이트
   components/navigation.html 을 헤드리스 Chromium 으로 열어 Default(#ex-navigation-basic) · Collapsed(#ex-navigation-collapsed)
   예제를 잰다. 기준점은 레일 안쪽(padding box)의 위 끝이다 — 사이트 예제는 미리보기용으로 네 변에 1px 테두리를 인라인 style 로
   따로 달아 그만큼 내려가 있고, 컴포넌트 CSS(.sidenav)의 테두리는 오른쪽 1px 뿐이라 Figma 레일에는 위 테두리가 없다.
   재지 못하면(Playwright 없음 · 빌드 안 됨) 빼고 넘어가지 않고 어긋남으로 남긴다.
   Tag 세 크기의 높이(2026-10-26 k5)도 같은 브라우저로 components/tag.html 예제에서 잰다(줄 높이 1.6 × 12px + padding 이라 CSS 만으로는 소수점이 맞지 않는다) */
async function siteMeasure() {
  /* 한 번 띄운 브라우저로 내비(2026-10-26 k3)와 Tag 높이(2026-10-26 k5)를 잰다. 어느 하나를 못 재면 그쪽에만 error 를 단다 */
  let chromium;
  try { ({ chromium } = require(path.join(ROOT, "_build/node_modules/playwright"))); }
  catch (e) { const err = { error: "playwright 를 불러오지 못했습니다(" + String(e.message).split("\n")[0] + ")" }; return { nav: err, tag: err, btn: err }; }
  let b;
  const out = {};
  try {
    b = await chromium.launch();
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    const open = async (page) => { const file = path.join(ROOT, "components", page + ".html"); if (!fs.existsSync(file)) return false; await p.goto("file://" + file); return true; };
    /* 내비 */
    if (!(await open("navigation"))) out.nav = { error: "components/navigation.html 이 없습니다 — 사이트를 빌드하세요" };
    else {
      const r = await p.evaluate(() => {
        const one = (sel) => {
          const nav = document.querySelector(sel); if (!nav) return null;
          const cs = getComputedStyle(nav), top = nav.getBoundingClientRect().top + parseFloat(cs.borderTopWidth);
          const kids = [...nav.children].filter((k) => getComputedStyle(k).display !== "none").map((k) => {
            const c = getComputedStyle(k), box = k.getBoundingClientRect();
            return { kind: k.tagName === "A" ? "item" : k.classList.contains("group") ? "group" : k.classList.contains("foot") ? "foot" : "other",
              y: box.top - top, h: box.height, mt: parseFloat(c.marginTop), mb: parseFloat(c.marginBottom), pb: parseFloat(c.paddingBottom) };
          });
          return { padBottom: parseFloat(cs.paddingBottom), kids };
        };
        return { basic: one("#ex-navigation-basic .sidenav"), collapsed: one("#ex-navigation-collapsed .sidenav") };
      });
      out.nav = r.basic && r.collapsed ? r : { error: "사이트에서 내비 예제(#ex-navigation-basic · #ex-navigation-collapsed)를 찾지 못했습니다" };
    }
    /* Tag 높이 — 예제 안의 .tag.sm · .tag(크기 클래스 없음) · .tag.lg 첫 것 */
    if (!(await open("tag"))) out.tag = { error: "components/tag.html 이 없습니다 — 사이트를 빌드하세요" };
    else {
      const t = await p.evaluate(() => {
        const h = (sel) => { const e = document.querySelector(sel); return e ? +e.getBoundingClientRect().height.toFixed(3) : null; };
        return { sm: h(".example-preview .tag.sm"), md: h(".example-preview .tag:not(.sm):not(.lg)"), lg: h(".example-preview .tag.lg") };
      });
      out.tag = t.sm && t.md && t.lg ? t : { error: "사이트 Tag 예제에서 세 크기(.tag.sm · .tag · .tag.lg)를 다 찾지 못했습니다 " + JSON.stringify(t) };
    }
    /* 버튼(2026-10-26 k7 · 2026-10-28 k16 새 클래스) — components/button.html 에 "버튼" 라벨 버튼을 잠시 붙여(파일은 그대로) 형태 · 색 · 크기 · 아이콘 전용 여부마다
       폭 · 높이 · 라벨 글자의 폭과 x 를 잰다. Figma 변형의 라벨이 "버튼" 이라 같은 글로 잰다. 아이콘 전용은 16 아이콘 하나.
       열쇠는 "Variant|Color|sm|true" — 클래스는 btnClass(Solid/Outline → "solid primary" · Text → "text" · "text assistive"(2026-10-29 k19) · Plain → "primary" + icon-only) */
    if (!(await open("button"))) out.btn = { error: "components/button.html 이 없습니다 — 사이트를 빌드하세요" };
    else {
      const combos = BTN_COMBOS.map(([v, c]) => [v + "|" + c, btnClass(v, c)]);
      out.btn = await p.evaluate(async ({ combos, sizes }) => {
        await document.fonts.ready;
        const host = document.createElement("div"); host.style.cssText = "position:absolute;left:0;top:0;display:flex;flex-direction:column;align-items:flex-start;gap:4px";
        (document.querySelector(".example-preview") || document.body).appendChild(host);
        const res = {};
        for (const [key, cls] of combos) for (const s of sizes) for (const icon of [false, true]) {
          const e = document.createElement("button"); e.type = "button"; e.className = "btn " + cls + " " + s + (icon ? " icon-only" : "");
          if (icon) e.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24"></svg>'; else e.textContent = "버튼";
          host.appendChild(e);
          const r = e.getBoundingClientRect(), rg = document.createRange(); rg.selectNodeContents(e); const tr = rg.getBoundingClientRect();
          res[key + "|" + s + "|" + icon] = { w: +r.width.toFixed(3), h: +r.height.toFixed(3), text: icon ? null : +tr.width.toFixed(3), textX: icon ? null : +(tr.left - r.left).toFixed(3) };
        }
        host.remove();
        return res;
      }, { combos, sizes: Object.values(BTN_SIZES) });
    }
  } catch (e) {
    const err = { error: "사이트를 재지 못했습니다(" + String(e.message).split("\n")[0] + ")" };
    if (!out.nav) out.nav = err; if (!out.tag) out.tag = err; if (!out.btn) out.btn = err;
  } finally { if (b) await b.close(); }
  return out;
}

/* ---------- 포커스(2026-10-26 k5 · k6 · k9) ----------
   값 입력 필드 — 사람의 결정(k5): Text Field · Search · Select 트리거 · Date Picker 필드의 포커스는 테두리 1px + inset 1px(합쳐 2px 가장자리)
   + 0 0 0 4px 후광. k6: 오류 필드(.field.error)의 포커스는 같은 모양을 negative 토큰으로 — Figma 에서는 Text Field 의 State=Error Focused.
   k9(사람의 결정 "필드에서 focus 됐을 경우에는 1px 브랜드 컬러와 4px 의 박스 섀도우가 함께 나오는 형태"): inset 을 뺐다 — 테두리 1px + 후광만.
   그래서 inset 은 **있어도 없어도 읽는다**: CSS 에 inset 이 없으면 Figma 칸에도 안쪽 그림자가 없어야 하고, 있으면 예전처럼 spread 를 맞춘다.
   검색창 링은 입력칸에 포커스가 있을 때만이다(.searchbar:has(input:focus) — :focus-within 이면 지우기 버튼 포커스에도 링이 나왔다).
   기대값은 사이트 CSS 에서 읽는다 — [기본 규칙(테두리 굵기), 포커스 규칙(border-color · box-shadow)]. 테두리 · 후광을 읽지 못하면 어긋남으로 낸다.
   외곽선 포커스(선택 컨트롤 · Button) — 사이트의 전역 :focus-visible 외곽선(굵기 · offset · 색). k6 에는 바깥 그림자 두 겹(틈을 면 색으로 칠함)으로
   그렸으나, 사람의 결정(k7): 틈은 사이트에서 판 색이 비쳐 보이는 자리이므로 어느 바탕 위에서도 같게 — 선만 있는 고리 하나("Focus Ring")로 그린다.
   k8(외곽선 2px → 1px)에 표현을 하나로 맞췄다 — Button 이 쓰던 방식: 고리 사각형은 사이트 outline-offset 상자 그 자체(dx = dy = −offset,
   크기 = 칸 + 2 × offset)이고 선은 OUTSIDE 로 굵기만큼 바깥에 그린다. 그래서 굵기가 바뀌어도 선 굵기 하나만 고치면 되고, 사각형 경계가 곧 CSS 의
   outline 시작선이다(k7 의 INSIDE 방식은 굵기가 바뀌면 자리 · 크기 · 모서리를 모두 다시 맞춰야 했다). 선 brand · 굵기 · OUTSIDE, 면 없음, 효과 없음.
   모서리는 칸 모서리 + offset(사이트 외곽선 안쪽 모서리는 border-radius + offset — 칸이 각지면 고리도 각지고, 완전히 둥글면 고리도 완전히 둥글다).
   칸에는 그림자가 남지 않아야 한다. Slider 칸(Track = range 280×20)은 사이트 range 처럼 바탕이 없어야 한다(.slider input[type=range] 의 background).
   Button 은 변형 자신이 칸이다(k8). 사이트에서 외곽선을 쓰지만 Figma 에 Focused 변형이 없는 것(Tab · Pagination · Chip …)은 대조할 것이 없다 */
const FOCUS_CSS = [
  { set: "Text Field", state: "Focused", base: ".field input", rule: ".field input:focus" },
  { set: "Text Field", state: "Error Focused", base: ".field input", rule: ".field.error input:focus" },
  { set: "Search", state: "Focused", base: ".searchbar", rule: ".searchbar:has(input:focus)" },
  { set: "Select", state: "Focused", base: ".dropdown .trigger", rule: ".dropdown .trigger:focus-visible" },
  /* 2026-11-09 버튼형 필드(.field-btn)를 없앴다 — Date Picker 는 Text Field 셸(.affix) 하나 */
  { set: "Date Picker", state: "Focused", base: ".field .affix", rule: ".field .affix:has(input:focus)" },
  { set: "Date Picker", state: "Error Focused", base: ".field .affix", rule: ".field.error .affix:has(input:focus)" },
];
/* Button 은 2026-10-28 k16 에 뺐다 — 사람의 정의로 포커스는 상태가 아니라 코드의 전역 :focus-visible 이고 Figma 에 Focused 변형을 두지 않는다(btnMatrix 가 남은 Focused 를 낸다) */
const RING_SETS = ["Checkbox", "Radio Button", "Switch", "Slider"];
function focusExpect() {
  const fields = [];
  const shadow = (s) => { const nums = s.replace(/var\([^)]*\)/g, " ").replace(/\binset\b/, " ").trim().split(/\s+/).filter(Boolean).map(parseFloat); return { x: nums[0] || 0, y: nums[1] || 0, blur: nums[2] || 0, spread: nums[3] || 0, tok: figTok(s), inset: /\binset\b/.test(s) }; };
  for (const { set, state, base, rule } of FOCUS_CSS) {
    try {
      const b = cssRule(base), f = cssRule(rule);
      const bw = parseFloat((/(\d+(?:\.\d+)?)px\s+solid/.exec(b.border || "") || [])[1]);
      const parts = (f["box-shadow"] || "").split(/,(?![^(]*\))/).map((x) => x.trim()).filter(Boolean).map(shadow);
      const ins = parts.filter((x) => x.inset), ring = parts.filter((x) => !x.inset);
      /* inset 은 0 또는 1개(k9 부터 0 이 정답), 후광은 꼭 1개 */
      if (!(bw > 0) || !figTok(f["border-color"]) || ins.length > 1 || (ins.length && !ins[0].tok) || ring.length !== 1 || !ring[0].tok) throw new Error(`${rule} 의 border · box-shadow 를 읽지 못했습니다(${b.border} / ${f["border-color"]} / ${f["box-shadow"]})`);
      fields.push({ set, state, border: { tok: figTok(f["border-color"]), w: bw }, inner: ins[0] || null, ring: ring[0], css: rule });
    } catch (e) { fields.push({ set, state, error: String(e.message || e) }); }
  }
  let ring;
  try {
    const r = cssRule(":focus-visible");
    const m = /(\d+(?:\.\d+)?)px\s+solid\s+(var\(--[a-z0-9-]+\))/.exec(r.outline || "");
    const off = parseFloat(r["outline-offset"]);
    if (!m || !(off >= 0) || !figTok(m[2])) throw new Error(`:focus-visible 의 outline · outline-offset 을 읽지 못했습니다(${r.outline} / ${r["outline-offset"]})`);
    const sb = (cssRule(".slider input[type=range]").background || "").trim();
    ring = { tok: figTok(m[2]), width: +m[1], offset: off, css: ":focus-visible", sliderTrack: sb === "transparent" ? "-" : null, sliderTrackCss: ".slider input[type=range] background:" + (sb || "(없음)") };
  } catch (e) { ring = { error: String(e.message || e) }; }
  return { fields, ring };
}

/* 선택 컨트롤의 칠(2026-10-27 k11) — 선택된 Radio(면 · 안쪽 테두리 · 점)와 선택 + 비활성 Radio, 비활성 Slider 의 라벨 · 값 글자.
   CSS 에서 읽는다: .radio input:checked(background · inset box-shadow) · ::after(점) · :disabled · :checked:disabled::after,
   .slider:has(input:disabled) .row(color). 테두리는 inset box-shadow 의 굵기와 토큰이다(Figma 는 INSIDE 선). 하나라도 못 읽으면 어긋남이다 */
function controlsExpect() {
  try {
    const ins = (v) => { const m = /inset\s+0\s+0\s+0\s+([\d.]+)px\s+(var\(--[a-z0-9-]+\))/.exec(v || ""); return m ? { w: +m[1], tok: figTok(m[2]) } : null; };
    const ck = cssRule(".radio input:checked"), ckA = cssRule(".radio input:checked::after"), dis = cssRule(".radio input:disabled"), disA = cssRule(".radio input:checked:disabled::after");
    const sl = cssRule(".slider:has(input:disabled) .row");
    const r1 = ins(ck["box-shadow"]), r2 = ins(dis["box-shadow"]);
    const out = {
      radioChecked: { face: figTok(ck.background), ring: r1 && r1.tok, sw: r1 && r1.w, dot: figTok(ckA.background), css: ".radio input:checked" },
      radioDisabled: { face: figTok(dis.background), ring: r2 && r2.tok, sw: r2 && r2.w, dot: figTok(disA.background), css: ".radio input:disabled · :checked:disabled::after" },
      sliderText: figTok(sl.color),
    };
    for (const k of ["radioChecked", "radioDisabled"]) for (const f of ["face", "ring", "sw", "dot"]) if (!out[k][f]) throw new Error(`${out[k].css} 의 ${f} 를 읽지 못했습니다`);
    if (!out.sliderText) throw new Error(".slider:has(input:disabled) .row 의 color 를 읽지 못했습니다");
    return out;
  } catch (e) { return { error: String(e.message || e) }; }
}

/* Chip 의 삭제(x) · 비활성 Item Tile(2026-10-27 k12) — 사람의 결정: 사이트를 고쳐(971b446) 비활성 입력값 Chip 의 x 는 면 없이 foreground-disable,
   비활성 Item Tile 의 아이콘 면은 surface-disable, 아이콘 · 설명은 foreground-disable. CSS 에서 읽는다 — .chip .x(background · color),
   .chip[disabled] .x(background · color), .tile[disabled] .ico(background), .tile[disabled] span:not(.tag)(color). 하나라도 못 읽으면 어긋남 */
function chipTileExpect() {
  try {
    const x = cssRule(".chip .x"), xd = cssRule(".chip[disabled] .x"), ti = cssRule(".tile[disabled] .ico"), ts = cssRule(".tile[disabled] span:not(.tag)");
    const none = (v) => /^(transparent|none)$/.test((v || "").trim());
    const out = {
      chip: { face: figTok(x.background), icon: figTok(x.color) },
      chipDisabled: { face: none(xd.background) ? "-" : figTok(xd.background), icon: figTok(xd.color) },
      tile: { icoFace: figTok(ti.background), icon: figTok(ts.color), desc: figTok(ts.color) },
    };
    for (const [k, o] of Object.entries(out)) for (const [f, v] of Object.entries(o)) if (!v) throw new Error(`${k}.${f} 를 읽지 못했습니다`);
    return out;
  } catch (e) { return { error: String(e.message || e) }; }
}

/* Date Picker 필드 · 날짜 칸(2026-10-27 k14) — 저장소 4199ac6 의 개편. 기대값은 사이트 CSS 에서 읽고, 못 읽으면 어긋남이다.
   필드 변형 표 — Type=Button(.datepicker .field-btn) · Input(.datepicker.field > .affix, Text Field 셸) × Size=Small · Medium · Large
   (사이트 .sm · 기본 · .lg — Figma 의 Button · Tag 와 같은 크기 이름) × State. 상태 목록은 사이트 예제(components.data.js date-picker 의 Sizes · States · Input / Error)와
   CSS 규칙이 있는 것만이다: Default · Focused(:focus-visible / :has(input:focus)) · Open(.open) · Disabled(:disabled / :has(input:disabled)) ·
   Read-only(입력형만 — 버튼형은 readonly 가 없다) · Error(.error) · Error Focused. 입력형 안쪽 입력칸에는 후광이 없어야 한다(.field .affix input:focus 의 box-shadow:none).
   날짜 칸 상태 — .calendar .day 와 상태 규칙. Start · End 는 .on 에 띠 쪽 모서리 0, In-range · Preview 는 같은 띠, Preview End 는 띠 + inset 1px 선(Figma 는 INSIDE 선),
   Muted(다른 달)는 띠 · 선택 없이 흐린 글자, Focused 는 전역 :focus-visible 외곽선(고리 "Focus Ring" — focusExpect 머리 주석의 표현) */
/* 2026-11-09(사람의 요청) — 버튼형(Type=Button)을 없앴다. Figma 에 남은 Type=Button 변형은 '표에 없는 변형' 으로 나온다(지울 것).
   날짜 칸의 선택은 원(.day.on::before 지름 34 · radius 50%)이고, 기간 양끝은 칸 반쪽만 띠(linear-gradient)다 — 기대값은 Selected · Start · End · Preview End 의
   면 · 모서리를 원으로 본다(모서리 = 지름 / 2). 반쪽 띠는 probe 가 Figma 쪽 자료를 아직 모으지 않아 대조하지 못한다(probe.js 는 일괄 반영 때 고친다) */
const DP_STATES = { Input: ["Default", "Focused", "Open", "Disabled", "Read-only", "Error", "Error Focused"] };
const DP_SIZES = { Small: ".sm", Medium: "", Large: ".lg" };
/* 달력 화면(2026-10-27 k15) — 사이트 예제의 화면: Calendar(단일 · 일 화면) · Range(기간) · 두 달(Range two, data-calendars=2) · 연 · 월(제목을 눌러 연 → 월).
   달력 안 날짜 칸은 "Day/<상태>" 프레임이고(Blank 는 두 달 보기의 빈 칸 — .day.blank visibility:hidden), 면 · 글자는 Calendar Day 상태 기대값과 같아야 한다.
   적용은 값이 열기 전과 같으면 꺼진다(사이트 components.data.js cal() · ds.js) — 견본은 처음 값 그대로라 State=Disabled */
const CAL_VIEWS = ["Day", "Range", "Two Months", "Year", "Month"];
const DAY_STATES = ["Default", "Hover", "Today", "Selected", "Start", "End", "In-range", "Preview", "Preview End", "Muted", "Disabled", "Focused"];
function datePickerExpect() {
  try {
    const halo = (v) => { const m = /^0 0 0 ([\d.]+)px (var\(--[a-z0-9-]+\))$/.exec((v || "").trim()); return m ? [figTok(m[2]), +m[1], 0] : null; };
    const radius = (v) => { const n = String(v || "").trim().split(/\s+/).map(parseFloat); return n.length === 1 ? [n[0], n[0], n[0], n[0]] : n.length === 4 ? n : null; };
    const need = (v, what) => { if (v === null || v === undefined || (Array.isArray(v) && v.some((x) => x === null || Number.isNaN(x)))) throw new Error(what + " 를 읽지 못했습니다"); return v; };
    const T = (sel, prop) => need(figTok(cssRule(sel)[prop]), sel + " " + prop);
    const fields = {};
    for (const [type, base, sz, rules] of [
      ["Input", ".field .affix", (k) => `.field${k} .affix`, { Focused: ".field .affix:has(input:focus)", Open: ".datepicker.open:not(.error) .affix", Disabled: ".field .affix:has(input:disabled)", "Read-only": ".field .affix:has(input:read-only:not(:disabled))", Error: ".field.error .affix", "Error Focused": ".field.error .affix:has(input:focus)" }],
    ]) {
      const b = cssRule(base), bw = need(parseFloat((/([\d.]+)px\s+solid/.exec(b.border || "") || [])[1]), base + " border 굵기");
      const def = { fill: need(figTok(b.background), base + " background"), stroke: need(figTok(b.border), base + " border"), sw: bw, drop: [] };
      const h = {}; for (const [k, c] of Object.entries(DP_SIZES)) h[k] = need(px(cssRule(sz(c)).height), sz(c) + " height");
      const st = { Default: { ...def, css: base } };
      for (const s of DP_STATES[type].slice(1)) {
        const r = cssRule(rules[s]), e = { ...def, css: rules[s] };
        if (r["border-color"]) e.stroke = need(figTok(r["border-color"]), rules[s] + " border-color");
        if (r.background) e.fill = need(figTok(r.background), rules[s] + " background");
        if (r["box-shadow"]) e.drop = [need(halo(r["box-shadow"]), rules[s] + " box-shadow")];
        st[s] = e;
      }
      fields[type] = { h, st };
    }
    const inner = cssRule(".field .affix input:focus")["box-shadow"];
    if (inner !== "none") throw new Error(".field .affix input:focus 의 box-shadow 가 none 이 아닙니다(" + inner + ")");
    const d = cssRule(".calendar .day"), base = { fill: (d.background || "").trim() === "transparent" ? "-" : need(null, ".calendar .day background"), stroke: "-", radius: need(radius(d["border-radius"]), ".calendar .day border-radius"), text: T(".calendar .day", "color"), ring: null };
    const dot = cssRule(".calendar .day.on::before"), r0 = need(px(dot.width), ".calendar .day.on::before width") / 2;
    if ((dot["border-radius"] || "").trim() !== "50%") throw new Error(".calendar .day.on::before border-radius 가 50% 가 아닙니다(" + dot["border-radius"] + ")");
    const on = { ...base, fill: T(".calendar .day.on::before", "background"), radius: [r0, r0, r0, r0], text: T(".calendar .day.on", "color") };
    const band = cssRule(".calendar .day.in-range"), bandE = { ...base, fill: T(".calendar .day.in-range", "background"), radius: need(radius(band["border-radius"]), ".calendar .day.in-range border-radius") };
    const pe = cssRule(".calendar .day.preview-end::before"), peIn = /inset\s+0\s+0\s+0\s+([\d.]+)px\s+(var\(--[a-z0-9-]+\))/.exec(pe["box-shadow"] || "");
    const ring = cssRule(":focus-visible"), rm = /([\d.]+)px\s+solid\s+(var\(--[a-z0-9-]+\))/.exec(ring.outline || "");
    const hov = '.calendar .day:hover:not(.on,.in-range,.preview,.preview-end,[disabled],[aria-disabled="true"])';
    const days = {
      Default: base,
      Hover: { ...base, fill: T(hov, "background") },
      Today: { ...base, text: T(".calendar .day.today", "color") },
      Selected: on,
      Start: { ...on }, End: { ...on },   // 원은 Selected 와 같다 — 반쪽 띠는 머리 주석
      "In-range": bandE, Preview: { ...bandE },
      "Preview End": { ...base, fill: T(".calendar .day.preview-end::before", "background"), radius: [r0, r0, r0, r0], stroke: need(peIn && figTok(peIn[2]), ".calendar .day.preview-end::before inset"), sw: peIn && +peIn[1] },
      Muted: { ...base, text: T(".calendar .day.muted", "color") },
      Disabled: { ...base, text: T(".calendar .day[disabled]", "color") },
      Focused: { ...base, ring: need(rm && figTok(rm[2]) + "|" + +rm[1] + "|OUTSIDE", ":focus-visible outline") },
    };
    return { fields, days };
  } catch (e) { return { error: String(e.message || e) }; }
}

/* Button(2026-10-28 k16) — 사람의 정의(2026-10-28)로 개편한 체계. Figma 속성 ↔ 사이트 클래스:
     Variant  Solid(.solid) · Outline(.outline) · Text(.text, 정의 밖 — 색은 Primary · Assistive 둘, Negative 없음) · Plain(형태 없는 .icon-only — Icon Only=True 에만)
              Text/Assistive 는 2026-10-29 k19 에 더했다(사람의 결정) — 클래스 .text.assistive. Text/Primary 는 색 클래스 없이 .text 다.
              CSS 는 .btn:where(.text) 위에 .btn:where(.text.assistive) 를 덮으므로(같은 무게, 뒤가 이김) 기대값도 두 규칙을 차례로 겹쳐 읽는다(BTN_SEL)
     Color    Primary · Assistive · Negative(.primary · .assistive · .negative)
     Size     Small · Medium · Large(.sm · .md · .lg — 높이 32 · 40 · 48, 아이콘 전용은 정사각)
     State    Normal · Hover(:hover) · Pressed(:active) · Disabled([disabled]). 포커스는 상태가 아니라 전역 :focus-visible 이라 Focused 변형이 없다
     Loading  True 는 State=Normal 에만(.loading — 상태가 아니라 옵션. 면 · 테두리는 Normal 과 같고 글자는 .btn.loading 의 color:transparent).
              2026-10-28 k17 에 아이콘 전용(Solid · Outline · Plain × 색 3 × 크기 3 = 27)에도 더했다 — 사이트 .btn.icon-only.loading 도 같은 규칙을 탄다
   옛 이름 대응(Figma 변형은 이름만 바꿔 재사용 — 인스턴스 연결 유지): Primary → Solid/Primary · Tertiary → Solid/Assistive · Secondary → Outline/Assistive ·
   Danger → Solid/Negative · Danger Secondary → Outline/Negative · Text → Text/Primary(아이콘 전용은 Plain/Primary) · State=Default → Normal · State=Loading → Loading=True.
   기대값은 style.src.css 의 .btn:where(형태.색) 규칙과 :hover · :active, 비활성 세 규칙(.btn[disabled] · .btn:where(.outline)[disabled] ·
   .btn:where(.text,.icon-only:not(.solid,.outline))[disabled])에서 읽는다. 규칙에 없는 값은 앞 상태(없으면 .btn)를 물려받는다 — CSS 캐스케이드와 같다.
   테두리는 .btn 의 1px solid transparent 가 기본이라 "transparent"(probe 가 불투명도 0 칠을 그렇게 적는다). 못 읽으면 어긋남이다 */
const BTN_COMBOS = [["Solid", "Primary"], ["Solid", "Assistive"], ["Solid", "Negative"], ["Outline", "Primary"], ["Outline", "Assistive"], ["Outline", "Negative"], ["Text", "Primary"], ["Text", "Assistive"], ["Plain", "Primary"], ["Plain", "Assistive"], ["Plain", "Negative"]];
const BTN_SIZES = { Small: "sm", Medium: "md", Large: "lg" };
const BTN_STATES = ["Normal", "Hover", "Pressed", "Disabled"];
const btnClass = (v, c) => (v === "Text" ? (c === "Primary" ? "text" : "text " + c.toLowerCase()) : v === "Plain" ? c.toLowerCase() : v.toLowerCase() + " " + c.toLowerCase());
/* 형태 · 색의 CSS 규칙 — 캐스케이드 순서대로(뒤가 이김). Text/Assistive 만 둘이다: .text 의 규칙 위에 .text.assistive 가 덮는다(2026-10-29 k19) */
const BTN_SEL = (v, c) => (v === "Text" ? (c === "Primary" ? [".btn:where(.text)"] : [".btn:where(.text)", `.btn:where(.text.${c.toLowerCase()})`]) : v === "Plain" ? [`.btn:where(.icon-only:not(.solid,.outline).${c.toLowerCase()})`] : [`.btn:where(.${v.toLowerCase()}.${c.toLowerCase()})`]);
/* 기대하는 변형 이름 전부 — Text 는 아이콘 전용이 없고(아이콘 전용 Primary 는 Plain), Plain 은 아이콘 전용에만, Loading=True 는 Normal 에만(k17 부터 아이콘 전용 포함) */
function btnMatrix() {
  const out = [];
  for (const [v, c] of BTN_COMBOS) for (const io of ["False", "True"]) {
    if ((v === "Text" && io === "True") || (v === "Plain" && io === "False")) continue;
    for (const z of Object.keys(BTN_SIZES)) {
      for (const st of BTN_STATES) out.push({ Variant: v, Color: c, Size: z, State: st, "Icon Only": io, Loading: "False" });
      out.push({ Variant: v, Color: c, Size: z, State: "Normal", "Icon Only": io, Loading: "True" });
    }
  }
  return out;
}
function buttonExpect() {
  try {
    const base = cssRule(".btn");
    const face = (r, prev) => (r.background === undefined ? prev : /^(transparent|none)$/.test(r.background.trim()) ? "-" : figTok(r.background));
    const line = (r, prev) => (r["border-color"] === undefined ? prev : r["border-color"].trim() === "transparent" ? "transparent" : figTok(r["border-color"]));
    const ink = (r, prev) => (r.color === undefined ? prev : figTok(r.color));
    const step = (r, p) => ({ fill: face(r, p.fill), stroke: line(r, p.stroke), fg: ink(r, p.fg) });
    if (!/1px solid transparent/.test(base.border || "")) throw new Error(".btn 의 border 가 1px solid transparent 가 아닙니다(" + base.border + ")");
    const root = { fill: face(base, "-"), stroke: "transparent", fg: null };
    const dBase = cssRule(".btn[disabled]"), dOut = cssRule(".btn:where(.outline)[disabled]"), dFlat = cssRule(".btn:where(.text,.icon-only:not(.solid,.outline))[disabled]");
    const out = {};
    /* Loading(2026-10-28 k17) — 라벨은 .btn.loading 의 color, 스피너는 .btn.loading::after 의 크기와 호 색(color).
       호 색 규칙 셋은 :where 라 무게가 같아 **뒤에 오는 것이 이긴다** — 아래 순서는 style.src.css 의 순서다. 조건은 각 :where 목록을 형태 · 색으로 옮긴 것.
       2026-10-29 k19 — Text/Assistive 가 생기며 셀렉터가 바뀌었다: Assistive 는 Text 를 포함(.assistive), Primary 쪽 목록의 Text 는 Assistive 가 아닌 것만(.text:not(.assistive)) */
    const ld = cssRule(".btn.loading"), la = cssRule(".btn.loading::after");
    if (!/transparent/.test(ld.color || "")) throw new Error(".btn.loading 의 color 가 transparent 가 아닙니다(" + ld.color + ")");
    /* 2026-10-29 회색 바탕 고리를 빼고 3/4 호 하나로 — 호의 색은 ::after 의 color(테두리는 currentColor) */
    const spinTop = (r) => { const t = figTok(r.color); if (!t) throw new Error("스피너 색(::after color)을 읽지 못했습니다(" + r.color + ")"); return t; };
    const SPIN = [
      [() => true, spinTop(la), ".btn.loading::after"],
      [(v, c) => c === "Assistive", spinTop(cssRule(".btn:where(.assistive).loading::after")), ".btn:where(.assistive).loading::after"],
      [(v, c) => (v === "Outline" && c === "Primary") || (v === "Text" && c !== "Assistive") || (v === "Plain" && c === "Primary"), spinTop(cssRule(".btn:where(.outline.primary,.text:not(.assistive),.icon-only:not(.solid,.outline).primary).loading::after")), ".btn:where(.outline.primary,.text:not(.assistive),.icon-only:not(.solid,.outline).primary).loading::after"],
      [(v, c) => c === "Negative" && v !== "Text", spinTop(cssRule(".btn:where(.negative:not(.text)).loading::after")), ".btn:where(.negative:not(.text)).loading::after"],
    ];
    const spinSize = px(la.width);
    if (!(spinSize > 0) || px(la.height) !== spinSize) throw new Error(".btn.loading::after 의 크기를 읽지 못했습니다(" + la.width + " × " + la.height + ")");
    for (const [v, c] of BTN_COMBOS) {
      const ss = BTN_SEL(v, c), s = ss[ss.length - 1], n = ss.reduce((p, x) => step(cssRule(x), p), root);
      const has = (x) => { try { return cssRule(x); } catch { return {}; } };
      const h = ss.reduce((p, x) => step(has(x + ":hover"), p), n), a = ss.reduce((p, x) => step(has(x + ":active"), p), n);
      let d = step(dBase, n);
      if (v === "Outline") d = step(dOut, d);
      if (v === "Text" || v === "Plain") d = step(dFlat, d);
      const e = { Normal: { ...n, css: s }, Hover: { ...h, css: s + ":hover" }, Pressed: { ...a, css: s + ":active" }, Disabled: { ...d, css: v === "Outline" ? ".btn:where(.outline)[disabled]" : v === "Solid" ? ".btn[disabled]" : ".btn:where(.text,.icon-only:not(.solid,.outline))[disabled]" } };
      for (const [st, x] of Object.entries(e)) for (const f of ["fill", "stroke", "fg"]) if (!x[f]) throw new Error(`${v}/${c} ${st} 의 ${f} 를 읽지 못했습니다(${x.css})`);
      const sp = SPIN.filter(([m]) => m(v, c)).pop();
      e.Loading = { ...n, fg: "transparent", spin: sp[1], spinCss: sp[2], spinSize, css: s + ".loading" };
      out[v + "/" + c] = e;
    }
    return out;
  } catch (e) { return { error: String(e.message || e) }; }
}
/* Button 기본 변형(2026-10-28 k16) — components.data.js 의 Button props 기본값(variant solid · color primary · size md)을 Figma 이름으로 */
function buttonDefault() {
  const box = { I: () => "", module: { exports: {} } };
  vm.runInNewContext(read("_build/components.data.js"), box, { filename: "components.data.js" });
  const props = (box.module.exports.button || {}).props || [], dv = (k) => { const r = props.find((x) => x[0] === k); return r ? String(r[2]).trim() : null; };
  const cap = (x) => (x ? x[0].toUpperCase() + x.slice(1) : null);
  const z = { sm: "Small", md: "Medium", lg: "Large" }[dv("size")];
  const out = { Variant: cap(dv("variant")), Color: cap(dv("color")), Size: z || null, State: "Normal", "Icon Only": "False", Loading: "False" };
  return Object.values(out).every(Boolean) ? out : null;
}

/* Accordion(2026-10-29 k21 — 사람의 정의 2026-10-29) — 변형 표와 크기 · 상태별 모양을 저장소에서 읽는다.
     축     components.data.js 의 accordion.figma(variants outline · flat → Variant Outline · Flat, sizes sm · md · lg → Size Small · Medium · Large,
            states → State Collapsed · Expanded · Hover · Disabled). 옛 이름 대응(Figma 변형은 이름만 바꿔 재사용 — 인스턴스 연결 유지): Style=Default → Variant=Outline ·
            Style=Flat → Variant=Flat, 크기 축이 없던 옛 변형은 Size=Medium. 이름에 Style 이 남았거나 축이 빠졌으면 표에 없는 변형으로 낸다
     헤더   높이 = .accordion.{sm,md,lg} summary 의 padding 위 + line-height + padding 아래(없으면 .accordion summary) — 40 · 52 · 60. Flat 도 같다(좌우만 4).
            figma.sizes 의 h · fs 와 CSS 가 다르면 기대값을 못 만든 것으로 낸다(사이트 두 곳이 어긋난 것). 제목 크기 = 같은 규칙의 font-size,
            셰브론 = .accordion summary::after 의 width(.lg 는 .accordion.lg summary::after)
     아이콘 (2026-10-29 k22 — 사람의 결정) 헤더 맨 앞의 "Icon" 인스턴스. 크기 = .accordion.{sm,lg} summary>svg 의 width(없으면 .accordion summary>svg) — 16 · 18 · 20.
            선 색은 제목 글자 칠과 같다(사이트 svg 는 currentColor — Disabled 는 비활성 색이 따라온다). 기본은 숨김이고 visible 은 불리언 속성 Icon(기본 false),
            mainComponent 는 INSTANCE_SWAP 속성에 연결한다. 옛 덤프(k22 전 probe)에는 icon · accordionProps 가 없다 — 그때는 NOTE
     Hover  헤더 면만 .accordion summary:hover 의 background. 모서리는 Outline 이 .accordion summary 의 calc(var(--radius-lg) - 1px)(닫힌 헤더라 네 모서리 모두),
            Flat 은 .accordion.flat summary 의 var(--radius-md) — 이쪽은 변수에 묶였는지도 본다. Hover 가 아닌 변형의 헤더는 면이 없어야 한다("-")
     칠     Disabled 의 제목 · 보조 정보 = .accordion.disabled summary 의 color, 셰브론 선 = .accordion.disabled summary::after 의 background.
            그 밖의 상태는 보조 정보 = .accordion summary small 의 color, 셰브론 = .accordion summary::after 의 background, 제목은 비활성 색이 아니어야 한다.
            테두리 = .accordion 의 border 색(Outline 은 네 변, Flat 은 아래 변 — 굵기는 보지 않는다)
     기본   props 의 variant · size 기본값(outline · md) + State=Collapsed
     헤더 줄 (2026-10-30 k24) 간격 = .accordion.{sm,md,lg} summary 의 gap(없으면 .accordion summary) — 8. 사이트는 왼쪽 정렬이다: 아이콘 → 8 → 제목 →
            (보조 정보 small, margin-left:auto) → 셰브론(::after, margin-left:auto — 보조 정보가 있으면 그 뒤 8). Figma 에서 같은 모양은
            가로 자동 배치 · 자식 순서 Icon > Title > Meta > Chevron · 제목 FILL + 글자 LEFT(제목이 남는 폭을 먹어 보조 정보 · 셰브론을 오른쪽 끝으로 민다) ·
            보조 정보는 FILL 이 아님. 예전 사이트의 space-between 은 아이콘을 켜면 제목이 가운데로 갔다 — 그 모양이 돌아오면 여기서 걸린다 */
const ACC_SIZES = { Small: "sm", Medium: "md", Large: "lg" };
function accordionExpect() {
  try {
    const box = { I: () => "", module: { exports: {} } };
    vm.runInNewContext(read("_build/components.data.js"), box, { filename: "components.data.js" });
    const a = box.module.exports.accordion || {}, fg = a.figma || {};
    const cap = (x) => (x ? x[0].toUpperCase() + x.slice(1) : x);
    const variants = Object.keys(fg.variants || {}).map(cap), states = (fg.states || []).map(cap);
    const sizes = Object.keys(fg.sizes || {}).map((k) => Object.keys(ACC_SIZES).find((z) => ACC_SIZES[z] === k));
    if (!variants.length || !states.length || !sizes.length || sizes.some((z) => !z)) throw new Error("components.data.js accordion.figma 의 variants · states · sizes 를 읽지 못했습니다");
    const root = vars(block(read("_build/style.src.css"), ":root"));
    const radius = (v) => {   // var(--radius-md) → { tok: "radius/md", px } · calc(var(--radius-lg) - 1px) → { px: 7 }
      const c = /calc\(var\(--([a-z0-9-]+)\)\s*-\s*([\d.]+)px\)/.exec(v || ""); if (c) return { tok: null, px: px(root["--" + c[1]]) - +c[2] };
      const m = /^var\(--([a-z0-9]+)-([a-z0-9-]+)\)$/.exec(String(v || "").trim()); if (m) return { tok: m[1] + "/" + m[2], px: px(root["--" + m[1] + "-" + m[2]]) };
      throw new Error("모서리 값을 읽지 못했습니다(" + v + ")");
    };
    const base = cssRule(".accordion summary"), after = cssRule(".accordion summary::after");
    const pad = (v) => { const p = String(v || "").trim().split(/\s+/).map(px); return [p[0], p.length > 2 ? p[2] : p[0]]; };
    const size = {};
    for (const z of sizes) {
      const sel = `.accordion.${ACC_SIZES[z]} summary`, r = cssRule(sel);
      const [pt, pb] = pad(r.padding || base.padding), lh = px(r["line-height"] || base["line-height"]), fs = px(r["font-size"] || base["font-size"]);
      let chev = px(after.width);
      try { const l = cssRule(sel + "::after"); if (l.width) chev = px(l.width); } catch {}
      if (![pt, pb, lh, fs, chev].every((x) => x > 0)) throw new Error(sel + " 의 padding · line-height · font-size 를 읽지 못했습니다");
      let icon = px(cssRule(".accordion summary>svg").width), iconCss = ".accordion summary>svg";
      try { const l = cssRule(sel + ">svg"); if (l.width) { icon = px(l.width); iconCss = sel + ">svg"; } } catch {}
      if (!(icon > 0)) throw new Error(sel + ">svg 의 width 를 읽지 못했습니다");
      const gap = px(r.gap || base.gap);
      if (gap === null || !(gap >= 0)) throw new Error(sel + " 의 gap 을 읽지 못했습니다(.accordion summary 에 gap 이 있어야 합니다)");
      size[z] = { h: pt + lh + pb, fs, chev, icon, iconCss, gap, css: sel };
      const d = fg.sizes[ACC_SIZES[z]];
      if (d && (d.h !== size[z].h || d.fs !== fs)) throw new Error(`components.data.js accordion.figma.sizes.${ACC_SIZES[z]}(h ${d.h} · fs ${d.fs})와 CSS ${sel}(h ${size[z].h} · fs ${fs})가 다릅니다`);
    }
    const hoverFace = figTok(cssRule(".accordion summary:hover").background);
    const dis = cssRule(".accordion.disabled summary"), disAfter = cssRule(".accordion.disabled summary::after");
    const want = {
      variants, sizes, states, size,
      hover: { face: hoverFace, radius: { Outline: radius(base["border-radius"]), Flat: radius(cssRule(".accordion.flat summary")["border-radius"]) } },
      disabled: { ink: figTok(dis.color), chev: figTok(disAfter.background) },
      normal: { meta: figTok(cssRule(".accordion summary small").color), chev: figTok(after.background) },
      stroke: figTok(cssRule(".accordion").border),
    };
    for (const [k, v] of [["hover 면", want.hover.face], ["비활성 글자", want.disabled.ink], ["비활성 셰브론", want.disabled.chev], ["보조 정보", want.normal.meta], ["셰브론", want.normal.chev], ["테두리", want.stroke]]) if (!v) throw new Error(k + " 토큰을 읽지 못했습니다");
    const props = a.props || [], dv = (k) => { const r = props.find((x) => String(x[0]).split(/[ /]/)[0] === k); return r ? String(r[2]).trim() : null; };
    const dz = Object.keys(ACC_SIZES).find((z) => ACC_SIZES[z] === dv("size"));
    want.default = dv("variant") && dz ? `Variant=${cap(dv("variant"))}, Size=${dz}, State=${states[0]}` : null;
    if (!want.default) throw new Error("props 의 variant · size 기본값을 읽지 못했습니다");
    return want;
  } catch (e) { return { error: String(e.message || e) }; }
}

/* Breadcrumb(2026-10-30 k25 — 사람의 정의 2026-10-30 · 2026-11-02 k26 — 사람의 결정 2026-11-02) — 기대값을 저장소에서 읽는다. 손으로 적은 숫자는 없다.
     축     components.data.js 의 breadcrumb.figma — variants(default · collapsed → 세트 "Breadcrumb" 의 Type Default · Collapsed),
            states(default · hover · focus · current → 같은 세트의 State 축). 다만 current 는 축 값이 아니라 **모든 변형의 마지막 항목**(현재 페이지)으로 그린다 —
            그래서 State 축 = states 에서 current 를 뺀 것(axis), 변형 표 = variants × axis. k25 에는 상태를 항목 세트 "Breadcrumb Item" 에 따로 뒀으나
            k26 에 사람의 결정으로 행 세트 하나로 모았다 — 항목 세트가 남아 있으면 어긋남. 기본 변형 = Type 의 첫 값 × State 의 첫 값
     받는 항목 State=Hover · Focus 는 항목 하나에만 걸린다 — Type=Default 는 홈 다음 첫 글자 항목(첫 상위 링크), Type=Collapsed 는 …(.more) 버튼.
            Hover = 글자는 a:hover 색 + 밑줄(…는 .more:hover 색), Focus = 그 항목 안 "Focus Ring". 나머지 항목은 같은 Type 의 State=Default 와 같아야 한다
     높이   figma.sizes.md.h 와 .breadcrumb 의 min-height 가 같아야 한다(다르면 기대값을 못 만든 것). 행 변형 높이 = 그 값(±0.5) · 가로 자동 배치 · 세로 가운데
     간격   .breadcrumb 의 gap(li 사이)과 .breadcrumb li 의 gap(구분자와 라벨 사이)이 같아야 하고, Figma 행은 항목과 구분자를 한 줄에 놓으므로 itemSpacing = 그 값
     첫 항목 components.data.js 의 default 예제 첫 li — a.icon 안의 아이콘 이름 · 크기(I(name) 의 기본 크기는 icons.gen.js 의 I 선언에서). 모든 행 변형의 첫 자식이 그 아이콘이고
            색은 링크 색(.breadcrumb li color — a 는 inherit)
     구분자 .breadcrumb li+li::before 의 width · height · background, 아이콘 이름은 _build/icons-css.js 의 같은 규칙 mask("…"). 항목 사이(홀수 자리)마다 하나
     접힘   collapsed 예제의 .more 아이콘 이름, 크기 = .breadcrumb .more svg width, 색 = .more color · :hover color. 접힌 행은 홈 + … + 끝 2개(항목 4)
     글자   .breadcrumb 의 font-size · line-height(k27 에 14 → 13 — 14단계 밖이라 스타일 이름이 아니라 숫자로 맞춘다), 링크 색 = li color, Hover = a:hover color + text-decoration underline, 현재 = li[aria-current] color · font-weight(굵기 없는 규칙은 400).
            현재 굵기는 2026-11-02 사람의 결정으로 600 → 500(Medium — CSS 가 바뀌면 기대값도 따라온다). k25 에 Noto Sans KR 에 SemiBold 가 없어 600 을 Bold 로 둔 것은
            k26 에 Noto Sans KR Medium 으로 고쳤다. 기대값이 600 인데 Noto Bold 면 NOTE 로만 알린다(_figma/font-revert.md k25 · k26 — 되돌릴 목록)
     Focus  :focus-visible 의 outline(굵기 · 색) · outline-offset — 항목 칸에서 offset 만큼 바깥의 "Focus Ring"(OUTSIDE 선, 면 없음). Focus 가 아닌 항목 · 변형에는 고리가 없다 */
function breadcrumbExpect() {
  try {
    const gen = read("_build/icons.gen.js"), dsz = +((/function I\(name, size = (\d+)/.exec(gen) || [])[1]);
    if (!(dsz > 0)) throw new Error("icons.gen.js 의 I(name, size = …) 기본 크기를 읽지 못했습니다");
    const box = { I: (n, s) => `⟦I:${n}:${s || dsz}⟧`, module: { exports: {} } };
    vm.runInNewContext(read("_build/components.data.js"), box, { filename: "components.data.js" });
    const b = box.module.exports.breadcrumb || {}, fg = b.figma || {};
    const cap = (x) => (x ? x[0].toUpperCase() + x.slice(1) : x);
    const variants = Object.keys(fg.variants || {}).map(cap), states = (fg.states || []).map(cap);
    if (!variants.length || !states.length) throw new Error("components.data.js breadcrumb.figma 의 variants · states 를 읽지 못했습니다");
    const ol = cssRule(".breadcrumb"), li = cssRule(".breadcrumb li");
    const h = (fg.sizes && fg.sizes.md && fg.sizes.md.h) || null;
    if (h !== px(ol["min-height"])) throw new Error(`components.data.js breadcrumb.figma.sizes.md.h(${h})와 CSS .breadcrumb min-height(${ol["min-height"]})가 다릅니다`);
    const gap = px(ol.gap);
    if (!(gap >= 0) || px(li.gap) !== gap) throw new Error(`.breadcrumb gap(${ol.gap})과 .breadcrumb li gap(${li.gap})이 다릅니다 — Figma 한 줄 간격으로 옮길 수 없습니다`);
    const ex = (id) => { const e = (b.examples || []).find((x) => x.id === id); if (!e) throw new Error("breadcrumb 예제 없음: " + id); return e.html; };
    const firstLi = /<li>([\s\S]*?)<\/li>/.exec(ex("default"));
    const hm = firstLi && /class="icon"[^>]*>\s*⟦I:([a-z0-9-]+):(\d+)⟧/.exec(firstLi[1]);
    if (!hm) throw new Error("default 예제의 첫 li 가 a.icon 아이콘이 아닙니다");
    const mm = /class="more"[^>]*>\s*⟦I:([a-z0-9-]+):(\d+)⟧/.exec(ex("collapsed"));
    if (!mm) throw new Error("collapsed 예제에 .more 아이콘이 없습니다");
    const sepCss = cssRule(".breadcrumb li+li::before");
    const sm = /\[\s*"\.breadcrumb li\+li::before"\s*,\s*`[^`]*mask\("([a-z0-9-]+)"\)/.exec(read("_build/icons-css.js"));
    if (!sm) throw new Error("_build/icons-css.js 에서 .breadcrumb li+li::before 의 mask 아이콘을 읽지 못했습니다");
    const hov = cssRule(".breadcrumb a:hover"), cur = cssRule(".breadcrumb li[aria-current]");
    const ring = cssRule(":focus-visible"), rm = /([\d.]+)px\s+solid\s+(var\(--[a-z0-9-]+\))/.exec(ring.outline || "");
    if (!rm) throw new Error(":focus-visible outline 을 읽지 못했습니다");
    const want = {
      variants, states, h, gap, fs: px(ol["font-size"]), lh: px(ol["line-height"]),
      label: figTok(li.color), hover: figTok(hov.color), underline: /underline/.test(hov["text-decoration"] || ""),
      current: { tok: figTok(cur.color), weight: parseInt(cur["font-weight"], 10) || 400 }, weight: parseInt(ol["font-weight"], 10) || 400,
      home: { icon: hm[1], size: +hm[2] },
      sep: { icon: sm[1], w: px(sepCss.width), h: px(sepCss.height), tok: figTok(sepCss.background) },
      more: { icon: mm[1], size: px(cssRule(".breadcrumb .more svg").width), tok: figTok(cssRule(".breadcrumb .more").color), hover: figTok(cssRule(".breadcrumb .more:hover").color) },
      focus: { width: +rm[1], tok: figTok(rm[2]), offset: px(ring["outline-offset"]) },
    };
    for (const [k, v] of [["링크 색", want.label], ["Hover 색", want.hover], ["현재 색", want.current.tok], ["구분자 색", want.sep.tok], ["… 색", want.more.tok], ["… Hover 색", want.more.hover], ["포커스 색", want.focus.tok]]) if (!v) throw new Error(k + " 토큰을 읽지 못했습니다");
    for (const [k, v] of [["font-size", want.fs], ["line-height", want.lh], ["구분자 크기", want.sep.w], ["… 크기", want.more.size], ["outline-offset", want.focus.offset]]) if (!(v >= 0)) throw new Error(k + " 를 읽지 못했습니다");
    /* current 는 축 값이 아니다(k26) — 마지막 항목으로 본다. states 에 current 가 없으면 저장소 정의가 바뀐 것이니 기대값을 못 만든 것으로 */
    const curState = states.find((s) => s.toLowerCase() === "current");
    if (!curState) throw new Error("components.data.js breadcrumb.figma.states 에 current 가 없습니다 — k26 은 current 를 마지막 항목으로 해석합니다");
    want.axis = states.filter((s) => s !== curState);
    if (!want.axis.length) throw new Error("State 축 값이 없습니다(states 에서 current 를 빼면 빈 목록)");
    want.default = `Type=${variants[0]}, State=${want.axis[0]}`;
    return want;
  } catch (e) { return { error: String(e.message || e) }; }
}

/* Card(2026-11-03 k29 — 사람의 정의 2026-11-02 ~ 11-03) — 기대값을 저장소에서 읽는다. 손으로 적은 숫자는 없다.
     축     components.data.js 의 card.figma — sizes(md · sm · flush), variants(default · status · list · selection · empty · error), states(default · hover · selected · focused · disabled · loading).
            Figma 세트 "Card" 는 Type × Size × State 로 옮긴다:
              Type  = variants 의 이름(첫 글자 대문자) + states 에 loading 이 있으면 "Loading" — Loading 은 상태가 아니라 내용 자리를 Skeleton 으로 바꾼 모양이라(loading 예제는 헤더도 없다) 유형으로 둔다.
              Size  = sizes 에서 flush 를 뺀 것 — md → Medium · sm → Small(파일의 Button · Accordion 과 같은 이름). flush 는 크기가 아니라 Type=List 의 바깥 padding(figma.sizes.flush.pad)이다.
              State = states 에서 focused · loading 을 뺀 것(Default · Hover · Selected · Disabled). focused 는 전역 :focus-visible 외곽선이라 변형으로 두지 않는다(Button k16 과 같은 결정).
                      Hover · Selected · Disabled 는 .card.clickable(선택 카드) 규칙에만 있으므로 Type=Selection 에만 둔다 — 다른 Type 은 State=Default 하나.
            기본 변형 = Type 첫 값 × props size 기본값(md → Medium) × State 첫 값
     크기   md padding · gap = .card.md(padding 은 var(--card-pad) 를 :root 에서 푼다), sm = .card.sm. List = .card.flush padding · gap 이고 figma.sizes.flush.pad 와 같아야 한다.
            List 헤더 padding = .card.flush .card-head(md) · .card.flush:is(.sm,.compact) .card-head(sm), 헤더 줄 간격 = .card .card-head gap. 값마다 Figma 변수에 묶였는지도 본다(묶인 변수의 값 = 기대 px)
     상자   면 · 테두리(1px) · 모서리(var(--radius-lg) — 변수 radius/lg) · 최소 폭 = .card. 테두리는 Selected 에서도 그대로다(사이트 .card.on 은 border 를 두고 inset 링을 더한다)
     제목   md = .card .title 의 font-size · line-height · font-weight, sm = .card.sm .title(굵기는 md 를 물려받음) — 텍스트 스타일은 .t-* 중 크기 · 행간 · 굵기가 같은 하나(Title/1 · Label/1)
     설명   .card .desc — 크기 14 · 굵기 400 인 .t-* 하나(Body/2), 칠 = .desc color. 키-값 = .card .card-meta(gap 행 · 열, 크기 · 행간 → Body/2), dt · dd 칠
     선택   앞 아이콘 크기 = selection 예제 첫 I(이름, 크기), 칠 = .card.clickable>svg · .card.on>svg · Disabled 의 >svg.
            Hover = .card.clickable:not(:disabled,[aria-disabled="true"]):hover 의 box-shadow(var(--shadow-2) → 효과 스타일 Shadow/2).
            Selected = .card.on 의 background · box-shadow inset 0 0 0 Npx 토큰(Figma 는 같은 토큰 · spread N 의 INNER_SHADOW 하나).
            Disabled = .card.clickable:is(:disabled,[aria-disabled="true"]) 의 background · box-shadow none, 같은 규칙 .title · >svg color, .desc color(이유 줄 — tertiary, 사람의 결정 2026-11-03)
     빈·오류 .card .empty(padding · 테두리 0 · 면 없음) · .empty gap · color(Hint), .card .empty b font-size · .empty b color(Message), .empty .ico 위에 .card .empty .ico 를 덮은 크기 · 면 · 모서리(k31 — 칸 없이 36) · color,
            .card .empty .ico svg 크기(아이콘 36), .card .empty.error .ico color, 헤더 오른쪽 버튼 = list · empty 예제 .card-head 안 .btn 클래스(k31 — '전체 보기' 텍스트 assistive · 오류 카드는 버튼 없음),
            '다시 시도' = empty 예제 .empty.error 안 .btn 의 클래스(sm · outline · assistive → Button Variant · Color · Size)
     Loading loading 예제 .skeleton 의 클래스 순서(title · text · text short → Skeleton Type=Title · Text · Text Short) */
/* variant outline · flat(2026-11-03 k32 — 사람의 결정: 보더 색만 지우고 1px 자리는 남겨 크기가 같다 · 그림자 없음 · background/neutral/secondary 바탕 위 전용).
   세트 → [components.data.js 키, 사이트 셀렉터]. 축 값은 figma.variant 의 키(outline · flat), 기본 값은 props 의 variant 행 기본값.
   Outline 보더는 셀렉터의 border(두께 · 토큰 — figma.variant.outline.stroke 와 같아야 함), Flat 은 셀렉터.flat 의 border-color 가 figma.variant.flat.stroke(transparent)와 같아야 하고
   .flat 이 border · border-width · box-shadow 를 바꾸면(크기 · 그림자가 달라짐) 기대값을 다시 정해야 하므로 멈춘다 */
const FLAT_SETS = { "Card": ["card", ".card"], "KPI": ["data-visual", ".kpi"], "Chart Card": ["data-visual", ".chart-card"] };
function flatExpect() {
  try {
    const box = { I: () => "", module: { exports: {} } };
    vm.runInNewContext(read("_build/components.data.js"), box, { filename: "components.data.js" });
    const cap = (x) => (x ? x[0].toUpperCase() + x.slice(1) : x);
    const out = {};
    for (const [set, [slug, sel]] of Object.entries(FLAT_SETS)) {
      const c = box.module.exports[slug] || {}, fv = (c.figma || {}).variant;
      if (!fv || !fv.outline || !fv.flat) throw new Error(`components.data.js ${slug}.figma.variant 에 outline · flat 이 없습니다`);
      const row = (c.props || []).find((r) => /^variant\b/.test(String(r[0])));
      if (!row) throw new Error(`components.data.js ${slug}.props 에 variant 행이 없습니다`);
      const def = cap(String(row[2]).replace(/"/g, "").trim());
      if (!Object.keys(fv).map(cap).includes(def)) throw new Error(`${slug} props variant 기본값 ${row[2]} 이 figma.variant 키에 없습니다`);
      const base = cssRule(sel), fl = cssRule(sel + ".flat");
      const bm = /([\d.]+)px solid (var\(--[a-z0-9-]+\))/.exec(base.border || "");
      if (!bm) throw new Error(`${sel} border 를 읽지 못했습니다`);
      if (figTok(bm[2]) !== figTok(`var(${fv.outline.stroke})`)) throw new Error(`${sel} border ${bm[2]} 와 ${slug}.figma.variant.outline.stroke ${fv.outline.stroke} 가 다릅니다`);
      if (String(fl["border-color"] || "").trim() !== fv.flat.stroke) throw new Error(`${sel}.flat border-color ${fl["border-color"]} 와 ${slug}.figma.variant.flat.stroke ${fv.flat.stroke} 가 다릅니다`);
      for (const k of ["border", "border-width", "box-shadow", "padding"]) if (fl[k] !== undefined) throw new Error(`${sel}.flat 이 ${k} 를 바꿉니다 — 크기 · 그림자가 Outline 과 같다는 기대(k32)를 다시 정해야 합니다`);
      out[set] = { names: Object.keys(fv).map(cap), def, outline: figTok(bm[2]), sw: +bm[1], flat: fv.flat.stroke, canvas: figTok(`var(${fv.flat.canvas})`), css: sel + ".flat" };
    }
    return out;
  } catch (e) { return { error: String(e.message || e) }; }
}

/* Chart 세트(2026-11-04 k33 — 사람의 결정 2026-11-03: 탐색형 차트는 Chart.js, DS 는 토큰 + 프리셋 4종, Figma 는 토큰 + 4종 대표 컴포넌트). 기대값 출처
   축     components.data.js data-visual.figma.chart.types → 세트 "Chart" 의 Type = Timeseries · Bar · Donut · Mixed(첫 글자만 대문자), 변형은 각 하나
   규격   같은 figma.chart — canvasH(캔버스 높이) · line(선 굵기) · point(hover 점 지름) · barRadius(막대 끝 둥글림) · barMax(막대 최대 두께) · gap(세그먼트 틈 = 도넛 조각 테두리 굵기) · cutout(구멍 비율) ·
          series(계열 토큰 6) · grid · axis · tooltip.bg · tooltip.fg · tones(심각도 → 토큰)
   마크   _build/ds-chart.src.js — 영역 알파(alpha(c, N) → 영역 벡터의 층 불투명도) · 글자 크기(font size → 눈금 · 범례) · 툴팁(padding · cornerRadius · boxWidth = 견본 지름) · 범례 견본 폭(labels.boxWidth) ·
          hover 점(pointHoverRadius × 2 = figma.chart.point 와 같아야 하고 다르면 기대값을 읽다 멈춘다)
   데이터 예제 HTML 의 data-spec(CHART_DATA 와 같다 — timeseries = trend, bars 의 첫 카드 = weeks, donut-live = severity, mixed = daily): 계열 라벨 · tone → 색 토큰, 도넛 호 각도(값 비율, -90° 부터 시계 방향),
          막대 수(라벨 × 계열), 도넛 가운데 글(center). 제목 · 보조 글은 그 예제 카드의 .chart-title 글
   카드   CSS .chart-card(background · border · padding · gap) ↔ 변형의 면 · 테두리 · padding · gap(변수에 묶여 있고 그 변수의 px 가 같아야 함 — diffCard 의 bound 와 같은 규칙), 모서리 변수 figma.radius,
          .chart-card .chart-title(font-size · font-weight) → 타입 스케일에서 크기 · 굵기가 같은 스타일 하나(Title/1) ↔ 제목 글 스타일
   글자   눈금 · 범례 · 툴팁 글자의 크기는 ds-chart 의 font size(12)와 같아야 하고 텍스트 스타일에 묶여 있어야 한다(어느 12px 스타일인지는 정하지 않는다 — 굵기는 font-weight-todo.tsv 의 Chart Card 범례와 같은 보류), 칠은 axis 토큰(툴팁은 tooltip.fg) */
/* 세트 "Chart" 의 변형 하나 = 예제 chart-card 하나 — [Type, 예제 id, 그 예제의 몇 번째 chart-card]. 변형 이름 = "Type=<Type>, Legend=<범례 자리>"
   (2026-11-06 k36 — 사람의 결정: 좁은 자리 도넛 donut-narrow 를 Figma 에도. 범례 자리 = ds-chart legendPosition(spec.legend, 캔버스 폭, 높이),
   캔버스 폭 = 예제 chart-card 의 max-width − .chart-card 좌우 padding − 좌우 보더. max-width 가 없으면 폭을 모르므로 옆 범례(right · left)는 판정할 수 없어 멈춘다) */
const CHART_EX = [["timeseries", "timeseries", 0], ["bar", "bars", 0], ["donut", "donut-live", 0], ["donut", "donut-narrow", 0], ["mixed", "mixed", 0]];
function chartExpect() {
  try {
    const box = { I: () => "", module: { exports: {} } };
    vm.runInNewContext(read("_build/components.data.js"), box, { filename: "components.data.js" });
    const c = box.module.exports["data-visual"], fc = c && c.figma && c.figma.chart;
    if (!fc || !fc.types || !fc.series || !fc.tones || !fc.tooltip) throw new Error("components.data.js data-visual.figma.chart 를 읽지 못했습니다");
    const js = read("_build/ds-chart.src.js");
    const num = (re, what) => { const m = re.exec(js); if (!m) throw new Error("ds-chart.src.js 에서 " + what + " 를 읽지 못했습니다"); return +m[1]; };
    const alpha = num(/alpha\(c,\s*([\d.]+)\)/, "영역 알파"), fontSize = num(/font:\s*\{[^}]*size:\s*(\d+)/, "글자 크기");
    /* 툴팁 · 범례 견본 — 둘 다 usePointStyle + pointStyle "circle"(figma.chart.legend). Chart.js 4.6.1 이 그리는 원의 지름(node_modules/chart.js 의 소스에서 확인, 2026-11-05 k35):
       범례 = boxHeight × √2(legend 의 drawLegendBox: radius = boxHeight · SQRT2 / 2) — 7 이면 9.9, 툴팁 = min(boxWidth, boxHeight)(tooltip 의 drawColorBox: radius = min / 2) — 6 이면 6.
       Figma 는 정수 px 로 그리므로 범례는 ±0.5 로 본다(정적 .chart-legend i 10 과 같은 원) */
    const tipBlock = (/tooltip:\s*\{[^}]*\}/.exec(js) || [""])[0], legBlock = (/legend:\s*\{[^}]*labels:\s*\{[^}]*\}/.exec(js) || [""])[0];
    const inBlock = (blk, re, what) => { const m = re.exec(blk); if (!m) throw new Error("ds-chart.src.js 에서 " + what + " 를 읽지 못했습니다"); return m[1]; };
    const tip = { pad: num(/tooltip:\s*\{[^}]*\bpadding:\s*(\d+)/, "툴팁 padding"), r: num(/tooltip:\s*\{[^}]*cornerRadius:\s*(\d+)/, "툴팁 cornerRadius"),
      box: Math.min(+inBlock(tipBlock, /boxWidth:\s*(\d+)/, "툴팁 boxWidth"), +inBlock(tipBlock, /boxHeight:\s*(\d+)/, "툴팁 boxHeight")), shape: inBlock(tipBlock, /pointStyle:\s*"([a-z]+)"/, "툴팁 pointStyle") };
    const legend = { d: +(+inBlock(legBlock, /boxHeight:\s*(\d+)/, "범례 boxHeight") * Math.SQRT2).toFixed(2), shape: inBlock(legBlock, /pointStyle:\s*"([a-z]+)"/, "범례 pointStyle") };
    if (!/usePointStyle:\s*true/.test(legBlock) || !/usePointStyle:\s*true/.test(tipBlock)) throw new Error("ds-chart 범례 · 툴팁에 usePointStyle: true 가 없습니다 — 견본이 원이 아니라 상자로 그려집니다");
    if (legend.shape !== fc.legend || tip.shape !== fc.legend) throw new Error(`ds-chart 견본 모양 범례 ${legend.shape} · 툴팁 ${tip.shape} ≠ figma.chart.legend ${fc.legend}`);
    const hoverR = num(/pointHoverRadius:\s*(\d+)/, "pointHoverRadius"), barMax = num(/maxBarThickness:\s*(\d+)/, "maxBarThickness");
    if (hoverR * 2 !== fc.point) throw new Error(`ds-chart pointHoverRadius ${hoverR} × 2 ≠ figma.chart.point ${fc.point}`);
    if (barMax !== fc.barMax) throw new Error(`ds-chart maxBarThickness ${barMax} ≠ figma.chart.barMax ${fc.barMax}`);
    /* 막대(2026-11-05 k35 — 사람의 결정: 각지고 stroke 없음. 2026-11-06 k36 — 사람의 요청: 누적 세그먼트는 틈 없이 이어 붙임). bar · mixed 프리셋의 borderRadius 는 모두 figma.chart.barRadius,
       bar 프리셋 · 혼합 막대의 borderWidth 는 figma.chart.barStroke, 막대 테두리 색은 투명.
       누적 틈 = bar 프리셋 안의 틈 식({ left | bottom: N })이 있으면 N, 없으면 bar 프리셋의 borderWidth(투명 테두리가 세그먼트 끝을 그만큼 비운다 — 0 이면 맞닿음) → figma.chart.gap 과 같아야 한다 */
    const radii = [...js.matchAll(/borderRadius:\s*(\d+)/g)].map((m) => +m[1]);
    if (radii.length < 2 || radii.some((r) => r !== fc.barRadius)) throw new Error(`ds-chart 막대 borderRadius [${radii.join(", ")}] ≠ figma.chart.barRadius ${fc.barRadius}(bar · mixed 프리셋 둘 다)`);
    const preset = (name, next) => { const m = new RegExp("\\n\\s*" + name + ":\\s*function\\s*\\(spec\\)\\s*\\{([\\s\\S]*?)\\n\\s*" + next + ":\\s*function").exec(js); if (!m) throw new Error(`ds-chart.src.js 에서 ${name} 프리셋을 읽지 못했습니다`); return m[1]; };
    const barSrc = preset("bar", "donut"), donutSrc = preset("donut", "mixed");
    const bws = [...barSrc.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/borderWidth:\s*(\d+)/g)].map((m) => +m[1]);
    if (bws.length !== 1) throw new Error(`ds-chart bar 프리셋의 borderWidth 가 ${bws.length}개입니다 — 숫자 하나여야 합니다(틈을 식으로 주면 audit 의 누적 틈 파서를 고치세요)`);
    const mixBw = num(/type:\s*"bar",\s*borderWidth:\s*(\d+)/, "혼합 막대 borderWidth"), plainBw = bws[0];
    if (mixBw !== fc.barStroke || plainBw !== fc.barStroke) throw new Error(`ds-chart 막대 테두리 혼합 ${mixBw} · bar 프리셋 ${plainBw} ≠ figma.chart.barStroke ${fc.barStroke}`);
    if (!/ds\.borderColor\s*=\s*"transparent"/.test(js)) throw new Error('ds-chart 막대 borderColor 가 "transparent" 가 아닙니다 — 막대는 stroke 없음(투명)이어야 합니다');
    const gapExpr = [...barSrc.matchAll(/\{\s*(?:left|bottom):\s*(\d+)\s*\}/g)].map((m) => +m[1]);
    const stackGap = gapExpr.length ? gapExpr[0] : plainBw;
    if (gapExpr.some((g) => g !== stackGap)) throw new Error(`ds-chart 누적 틈 식이 서로 다릅니다 — ${gapExpr.join(" · ")}`);
    if (stackGap !== fc.gap) throw new Error(`ds-chart 누적 틈 ${stackGap}(${gapExpr.length ? "틈 식" : "bar borderWidth — 틈 식 없음"}) ≠ figma.chart.gap ${fc.gap}`);
    /* 도넛 조각 사이 면 색 경계 — donut 프리셋 · paint 의 borderWidth(둘이 같아야 함). figma.chart.gap 은 이제 누적 틈이라(k36) 도넛 경계와 따로 읽는다.
       figma.variants.donut.gap 글(정적 도넛 경계 'Npx')과도 같아야 한다 */
    const dPre = /borderWidth:\s*(\d+)/.exec(donutSrc), dPaint = /ds\.borderColor\s*=\s*t\.surface;\s*ds\.borderWidth\s*=\s*(\d+)/.exec(js);
    if (!dPre || !dPaint) throw new Error("ds-chart.src.js 에서 도넛 조각 경계 borderWidth(donut 프리셋 · paint)를 읽지 못했습니다");
    const donutBw = +dPaint[1];
    if (+dPre[1] !== donutBw) throw new Error(`ds-chart 도넛 경계 donut 프리셋 ${dPre[1]} ≠ paint ${donutBw}`);
    const dvg = /(\d+)px/.exec(String(((c.figma.variants || {}).donut || {}).gap || "")); if (!dvg) throw new Error("components.data.js data-visual.figma.variants.donut.gap 에서 경계 굵기(Npx)를 읽지 못했습니다");
    if (+dvg[1] !== donutBw) throw new Error(`ds-chart 도넛 경계 ${donutBw} ≠ figma.variants.donut.gap ${dvg[1]}px`);
    /* 옆 범례(2026-11-06 k36 — 사람의 요청). SIDE_LEGEND_RATIO 와 legendPosition 본문을 ds-chart 에서 그대로 떠서 돌린다(규칙을 audit 에 다시 쓰지 않음) */
    const lpm = /var SIDE_LEGEND_RATIO\s*=\s*([\d.]+);\s*(function legendPosition\s*\([^)]*\)\s*\{[\s\S]*?\n\s*\})/.exec(js);
    if (!lpm) throw new Error("ds-chart.src.js 에서 SIDE_LEGEND_RATIO · legendPosition 을 읽지 못했습니다");
    const sideRatio = +lpm[1], legendPosition = vm.runInNewContext(`var SIDE_LEGEND_RATIO = ${sideRatio}; ${lpm[2]}; legendPosition`, {});
    if (!/legend\.position\s*=\s*legendPosition\(/.test(js)) throw new Error("ds-chart paint 가 도넛 범례 위치를 legendPosition 으로 정하지 않습니다");
    /* 톤 — ds-chart TONES 가 출처(figma.chart.tones 는 그 일부를 옮긴 것 — 값이 다르면 멈춘다). series-1 · -subtle · -strong 은 2026-11-05 사람의 결정 */
    const tb = /var TONES = \{([\s\S]*?)\};/.exec(js); if (!tb) throw new Error("ds-chart.src.js 의 TONES 를 읽지 못했습니다");
    const TONES = Object.fromEntries([...tb[1].replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/"?([a-z0-9-]+)"?\s*:\s*"(--[a-z0-9-]+)"/g)].map((m) => [m[1], m[2]]));
    for (const [k, v] of Object.entries(fc.tones)) if (TONES[k] !== v) throw new Error(`figma.chart.tones.${k} ${v} ≠ ds-chart TONES.${k} ${TONES[k]}`);
    const cut = parseFloat(fc.cutout) / 100;
    /* 카드 — CSS .chart-card · 제목 */
    const card = cssRule(".chart-card"), title = cssRule(".chart-card .chart-title");
    const bm = /([\d.]+)px solid (var\(--[a-z0-9-]+\))/.exec(card.border || ""); if (!bm) throw new Error(".chart-card border 를 읽지 못했습니다");
    const padm = /^(\d+)px(?:\s+(\d+)px)?$/.exec(card.padding || ""); if (!padm) throw new Error(".chart-card padding 을 읽지 못했습니다");
    const pad = [+padm[1], +(padm[2] || padm[1]), +padm[1], +(padm[2] || padm[1])];
    const ts = typeScale(); const tsz = parseFloat(title["font-size"]), twt = parseInt(title["font-weight"], 10);
    const titleStyles = Object.entries(ts).filter(([, d]) => d.size === tsz && d.weight === twt).map(([n]) => n);
    if (titleStyles.length !== 1) throw new Error(`.chart-card .chart-title ${tsz}/${twt} 에 맞는 타입 스케일 스타일이 ${titleStyles.length}개입니다 — ${titleStyles.join(" · ")}`);
    const styles12 = Object.entries(ts).filter(([, d]) => d.size === fontSize).map(([n]) => n);
    /* 데이터 — 예제 HTML 의 data-spec 과 .chart-title */
    const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", apos: "'", nbsp: " " };
    const text = (s) => String(s).replace(/<[^>]+>/g, "").replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (_, e) => ENT[e]).normalize("NFC").replace(/\s+/g, " ").trim();
    const tone = (t) => { if (!t) return null; if (!TONES[t]) throw new Error(`예제 tone "${t}" 가 ds-chart TONES 에 없습니다`); return figTok(`var(${TONES[t]})`); };
    const variants = {};
    const order = [];
    for (const t of fc.types) if (!CHART_EX.some((e) => e[0] === t)) throw new Error(`figma.chart.types 의 ${t} 에 맞는 예제가 audit CHART_EX 에 없습니다`);
    for (const [type, exId, nth] of CHART_EX) {
      if (!fc.types.includes(type)) throw new Error(`audit CHART_EX 의 ${type} 가 figma.chart.types 에 없습니다`);
      const ex = (c.examples || []).find((e) => e.id === exId);
      if (!ex) throw new Error(`data-visual 예제 ${exId} 가 없습니다`);
      const cards = [...ex.html.matchAll(/<div class="chart-card"([^>]*)>([\s\S]*?)<\/canvas>/g)]; const cardHtml = cards[nth] && cards[nth][2], cardAttr = cards[nth] ? cards[nth][1] : "";
      if (!cardHtml) throw new Error(`예제 ${exId} 의 ${nth + 1}번째 chart-card 를 찾지 못했습니다`);
      const tm = /<h3 class="chart-title">([\s\S]*?)<\/h3>/.exec(cardHtml), sm = /<span[^>]*>([\s\S]*?)<\/span>/.exec(tm ? tm[1] : "");
      const title_ = text((tm ? tm[1] : "").replace(/<span[\s\S]*?<\/span>/, "")), meta = sm ? text(sm[1]) : null;
      const spm = /data-chart="([a-z]+)" data-spec='([^']+)'/.exec(cardHtml); if (!spm || spm[1] !== type) throw new Error(`예제 ${exId} 의 data-chart 가 ${type} 이 아닙니다`);
      const spec = JSON.parse(spm[2]);
      const mw = /max-width:\s*(\d+)px/.exec(cardAttr), cardW = mw ? +mw[1] : null, canvasW = cardW != null ? cardW - pad[1] - pad[3] - 2 * +bm[1] : null;
      const want = type === "donut" ? spec.legend : undefined;
      if ((want === "right" || want === "left") && canvasW == null) throw new Error(`예제 ${exId} 의 chart-card 에 max-width 가 없어 옆 범례 자리를 판정할 수 없습니다`);
      const pos = legendPosition(want, canvasW || 0, fc.canvasH);
      const v = { title: title_, meta, ex: exId, cardW, canvasW, legendPos: pos, name: "Type=" + type[0].toUpperCase() + type.slice(1) + ", Legend=" + pos[0].toUpperCase() + pos.slice(1) };
      if (variants[v.name]) throw new Error(`예제 ${exId} 와 ${variants[v.name].ex} 가 같은 변형 ${v.name} 이 됩니다`);
      order.push(v.name);
      const serTok = (list) => list.map((s, i) => tone(s.tone) || figTok(`var(${fc.series[i]})`));
      if (type === "timeseries") { v.series = spec.series.map((s) => s.label); v.colors = serTok(spec.series); v.lines = v.series.length; v.areas = spec.stacked ? v.series.length : 0; v.points = v.series.length; v.tooltip = true; }
      else if (type === "bar") { v.series = spec.series.map((s) => s.label); v.colors = serTok(spec.series); v.bars = spec.labels.length * spec.series.length; v.barsPer = spec.series.map((s) => spec.labels.length); v.lines = 0; v.stacked = !!spec.stacked; v.horizontal = !!spec.horizontal; v.nLabels = spec.labels.length; }
      else if (type === "donut") { v.series = spec.series.map((s) => s.label); v.colors = serTok(spec.series); const total = spec.series.reduce((a, s) => a + s.value, 0); let acc = -90; v.arcs = spec.series.map((s) => { const a0 = acc; acc += (s.value / total) * 360; return [+a0.toFixed(2), +acc.toFixed(2)]; }); v.center = spec.center != null ? String(spec.center) : null; v.lines = 0; v.legendWant = spec.legend || null; }
      else if (type === "mixed") { v.series = spec.bars.map((s) => s.label).concat(spec.lines.map((s) => s.label)); v.colors = serTok(spec.bars.concat(spec.lines)); v.bars = spec.labels.length * spec.bars.length; v.lines = spec.lines.length; v.lineColors = spec.lines.map((s, i) => tone(s.tone) || figTok(`var(${fc.series[spec.bars.length + i]})`)); v.barColors = spec.bars.map((s, i) => tone(s.tone) || figTok(`var(${fc.series[i]})`)); }
      v.legend = v.series.length > 1;
      variants[v.name] = v;
    }
    return { types: fc.types, variants, order, canvasH: fc.canvasH, line: fc.line, point: fc.point, barRadius: fc.barRadius, barStroke: fc.barStroke, barMax: fc.barMax, gap: fc.gap, stackGap, donutBw, sideRatio, legendPosition, cutout: cut, alpha, fontSize, styles12, titleStyle: titleStyles[0], tip, legend,
      grid: figTok(`var(${fc.grid})`), axis: figTok(`var(${fc.axis})`), tipBg: figTok(`var(${fc.tooltip.bg})`), tipFg: figTok(`var(${fc.tooltip.fg})`), surface: figTok(card.background), stroke: figTok(bm[2]), sw: +bm[1], pad, gapPx: px(card.gap), radius: c.figma.radius };
  } catch (e) { return { error: String(e.message || e) }; }
}

/* 정적 차트(2026-11-05 k35 — 사람의 결정: 막대 · 트랙 · 스파크라인은 각지게, 도넛은 조각을 이어 붙이고 경계마다 폭이 일정한 2px 직선 면 색 구분선, 범례 견본은 원).
   기대값 출처
   모서리 CSS .chart .bar · .chart .bar i(트랙과 채움) · .sparkline i 의 border-radius
   범례   CSS .chart-legend i 의 width · height · border-radius(50% = 원 — Figma 는 모서리 ≥ 짧은 변/2 이거나 ELLIPSE)
   도넛   CSS .donut 의 width(지름) · .donut i 의 width · height · background(경계선 크기 · 칠) · top 0(경계선이 바깥 끝에서 안쪽으로 = 중심에서 R − h/2 거리),
          경계 각도 = components.data.js data-visual 예제 donut 과 patterns.data.js dashboard 예제의 <i style="--a:…deg">(위 = 0°, 시계 방향). 둘 다 같은 .donut conic-gradient 를 쓰므로 다르면 기대값을 읽다 멈춘다
   KPI    (2026-11-05 k35b — 사람의 결정: 문서 KPI 예제 = 저장소 예제) 문서 카드 "KPI · 예제 =" 행의 카드 = data-visual 예제 kpi 의 .kpi 들(순서 · 라벨 · 값 · <small> 단위 · 증감 글 · 화살표 I(이름) · 톤),
          4 Pattern "Card/대시보드" 의 KPI = patterns.data.js dashboard 예제의 .kpi 들(같은 항목). 칠은 CSS .kpi .label · .kpi .value(.critical/.high) · .kpi .value small · .kpi .delta(.up/.down).
          "KPI · Tone =" 행은 한 축(Tone)만 바꿔 보여 주는 행 — 라벨이 같은 것이 의도다. 카드의 Tone = Default + CSS .kpi.<톤> .value 가 있는 톤(순서대로)이고 라벨이 하나여야 한다.
          문서 KPI 라벨에 예제 kpi 에 없고 대시보드에만 있는 라벨('미처리 검토' 등)이 없어야 한다.
          (2026-11-05 k35c — 사람의 결정) 단위 = .kpi .value small 의 font-size · font-weight, 행간 · 자간은 small 에 없으면 .kpi .value 에서 물려받는다
          (단위 없는 line-height 는 배수라 단위 크기에 곱하고, em 자간은 부모에서 계산된 길이로 물려받아 값 크기에 곱한다 — 헤드리스 Chromium 계산값 19.2px · -0.64px 와 같음).
          Delta=None = class 없는 .kpi .delta(화살표 없음 · 그 color) — 예제에 class 없는 증감이 있으면 KPI 세트 Delta 속성에 None 이 있어야 한다 */
function staticChartExpect() {
  try {
    const rad = (sel) => { const v = cssRule(sel)["border-radius"]; if (v == null) throw new Error(sel + " 에 border-radius 가 없습니다"); return /%$/.test(v) ? v : px(v); };
    const leg = cssRule(".chart-legend i"), dn = cssRule(".donut"), di = cssRule(".donut i");
    const legend = { d: px(leg.width), h: px(leg.height), round: leg["border-radius"] === "50%" };
    if (legend.d !== legend.h) throw new Error(`.chart-legend i ${leg.width} × ${leg.height} 가 정사각이 아닙니다`);
    const D = px(dn.width), dv = { w: px(di.width), h: px(di.height), tok: figTok(di.background), top: px(di.top) };
    if (dv.top !== 0) throw new Error(`.donut i top ${di.top} — 경계선이 바깥 끝에 붙어 있지 않습니다`);
    const mark = (n) => `[[${n}]]`;   // 아이콘 이름을 남긴다 — KPI 증감의 화살표(I("arrow-up",12))를 대조하려고
    const box = { I: mark, module: { exports: {} } }; vm.runInNewContext(read("_build/components.data.js"), box, { filename: "components.data.js" });
    const dvc = box.module.exports["data-visual"], ex = (id) => { const e = (dvc.examples || []).find((x) => x.id === id); if (!e) throw new Error(`data-visual 예제 ${id} 가 없습니다`); return e.html; };
    const pb = { I: mark, module: { exports: {} } }; vm.runInNewContext(read("_build/patterns.data.js"), pb, { filename: "patterns.data.js" });
    const dash = (((pb.module.exports.dashboard || {}).examples || [])[0] || {}).html; if (!dash) throw new Error("patterns.data.js dashboard 예제를 읽지 못했습니다");
    const angles = (h) => [...h.matchAll(/--a:([\d.]+)deg/g)].map((m) => +m[1]);
    const aDoc = angles(ex("donut")), aDash = angles(dash);
    if (!aDoc.length) throw new Error("data-visual 예제 donut 에 경계선(--a)이 없습니다");
    if (aDoc.join() !== aDash.join()) throw new Error(`도넛 경계 각도 예제 [${aDoc}] ≠ 대시보드 [${aDash}]`);
    const labels = (h) => [...h.matchAll(/<div class="kpi[^"]*"><span class="label">([^<]*)<\/span>/g)].map((m) => m[1].trim());
    const kpiEx = labels(ex("kpi")), dashOnly = labels(dash).filter((l) => !kpiEx.includes(l));
    /* KPI 카드 하나 = .kpi(.critical|.high) 의 label · value(<small> 단위) · delta(.up|.down, 앞의 I(이름) = 화살표). class="kpi-grid" 는 고르지 않는다 */
    const tok = (sel) => { const t = figTok(cssRule(sel).color); if (!t) throw new Error(sel + " 의 color 가 토큰이 아닙니다"); return t; };
    const toneSel = { default: ".kpi .value", critical: ".kpi.critical .value", high: ".kpi.high .value" }, dirSel = { "": ".kpi .delta", up: ".kpi .delta.up", down: ".kpi .delta.down" };
    const cards = (h, where) => [...h.matchAll(/<div class="kpi((?: [^"]*)?)"[^>]*>([\s\S]*?)<\/div>/g)].map((m) => {
      const cls = m[1].trim().split(/\s+/).filter(Boolean), b = m[2];
      if (/<div/.test(b)) throw new Error(where + " 의 .kpi 안에 div 가 있습니다(스파크라인?) — KPI 대조가 읽는 모양이 아닙니다");
      const lab = /<span class="label">([^<]*)<\/span>/.exec(b), val = /<span class="value">([^<]*)(?:<small>([^<]*)<\/small>)?<\/span>/.exec(b), del = /<span class="delta([^"]*)">([\s\S]*?)<\/span>/.exec(b);
      const tone = cls.includes("critical") ? "critical" : cls.includes("high") ? "high" : "default", dir = del ? del[1].trim() : null, ic = del && /\[\[([^\]]+)\]\]/.exec(del[2]);
      if (dir != null && !(dir in dirSel)) throw new Error(`${where} 의 .delta 클래스 '${dir}' 를 모릅니다`);
      return { label: lab ? lab[1].trim() : null, value: val ? val[1].trim() : null, unit: val && val[2] ? val[2].trim() : null,
        delta: del ? del[2].replace(/\[\[[^\]]+\]\]/g, "").trim() : null, arrow: ic ? ic[1] : null, tone, dir,
        lfill: tok(".kpi .label"), vfill: tok(toneSel[tone]), ufill: val && val[2] ? tok(".kpi .value small") : null, dfill: del ? tok(dirSel[dir]) : null };
    });
    const example = cards(ex("kpi"), "data-visual 예제 kpi"), dashK = cards(dash, "patterns.data.js dashboard");
    if (!example.length || !dashK.length) throw new Error(`KPI 카드를 읽지 못했습니다(예제 ${example.length} · 대시보드 ${dashK.length})`);
    /* 단위 글자 모양 — small 자신의 값이 없으면 .kpi .value 에서 물려받는다 */
    const sm = cssRule(".kpi .value small"), vv = cssRule(".kpi .value"), vfs = px(vv["font-size"]), ufs = px(sm["font-size"]), uwt = parseInt(sm["font-weight"], 10);
    if (!ufs || !uwt) throw new Error(".kpi .value small 에 font-size · font-weight 가 없습니다");
    const len = (v, base) => v == null || v === "normal" ? 0 : /px$/.test(v) ? px(v) : /em$/.test(v) ? parseFloat(v) * base : /%$/.test(v) ? (parseFloat(v) / 100) * base : null;
    const ulh = sm["line-height"] != null ? (/^[\d.]+$/.test(sm["line-height"]) ? parseFloat(sm["line-height"]) * ufs : len(sm["line-height"], ufs))
      : vv["line-height"] != null ? (/^[\d.]+$/.test(vv["line-height"]) ? parseFloat(vv["line-height"]) * ufs : len(vv["line-height"], vfs)) : null;
    const uls = sm["letter-spacing"] != null ? len(sm["letter-spacing"], ufs) : len(vv["letter-spacing"], vfs);
    if (ulh == null || uls == null) throw new Error(`KPI 단위 행간 · 자간을 계산하지 못했습니다(${sm["line-height"] ?? vv["line-height"]} · ${sm["letter-spacing"] ?? vv["letter-spacing"]})`);
    const ts = typeScale(), uStyle = Object.keys(ts).filter((n) => ts[n].size === ufs && (ts[n].weight || 400) === uwt && ts[n].lineHeight === +ulh.toFixed(2));
    const unit = { fs: ufs, wt: uwt, lh: +ulh.toFixed(2), ls: +uls.toFixed(2), style: uStyle[0] || null, fill: tok(".kpi .value small") };
    /* 증감 글자 모양(2026-11-06 k35d) — .kpi .delta 의 크기 · 행간 · 굵기와 셋이 같은 타입 스케일 스타일 하나(지금 Label/2 SemiBold) */
    const dl = cssRule(".kpi .delta"), dfs = px(dl["font-size"]), dlh = px(dl["line-height"]), dwt = parseInt(dl["font-weight"], 10) || 400;
    const dStyle = Object.keys(ts).filter((n) => ts[n].size === dfs && ts[n].lineHeight === dlh && (ts[n].weight || 400) === dwt);
    if (dStyle.length !== 1) throw new Error(`.kpi .delta ${dfs}/${dlh}/${dwt} 에 맞는 타입 스케일 스타일이 ${dStyle.length}개입니다 — ${dStyle.join(" · ")}`);
    const delta = { fs: dfs, lh: dlh, wt: dwt, style: dStyle[0] };
    const dirFill = { None: tok(dirSel[""]), Up: tok(dirSel.up), Down: tok(dirSel.down) };
    const needNone = example.concat(dashK).some((k) => k.dir === "");
    const tones = ["Default"].concat(["critical", "high"].filter((t) => { try { cssRule(toneSel[t]); return true; } catch { return false; } }).map((t) => t[0].toUpperCase() + t.slice(1)));
    /* 도넛 + 범례 행(2026-11-06 k36 — 사람의 요청) — .donut-row 의 gap(행 열) · flex-wrap · justify-content · align-items. wrap 이면 한 줄에 안 들어갈 때(쓸 수 있는 폭 < 도넛 + 열 간격 + 범례 폭)
       범례가 도넛 아래로 내려간다: 줄 사이 = 행 간격, 한 항목 줄은 space-between 이라도 왼쪽 시작. Figma 는 세로 auto layout · 간격 = 행 간격 · 왼쪽 정렬로 그린다 */
    const dr = cssRule(".donut-row"), drg = String(dr.gap || dr["column-gap"] || "0").trim().split(/\s+/).map(px);
    const AX = { "space-between": "SPACE_BETWEEN", "flex-start": "MIN", start: "MIN", normal: "MIN", center: "CENTER", "flex-end": "MAX", end: "MAX" };
    if (!AX[dr["justify-content"] || "normal"] || !AX[dr["align-items"] || "normal"]) throw new Error(`.donut-row justify-content ${dr["justify-content"]} · align-items ${dr["align-items"]} 를 Figma 정렬로 옮기지 못했습니다`);
    const row = { rowGap: drg[0], colGap: drg.length > 1 ? drg[1] : drg[0], wrap: dr["flex-wrap"] === "wrap", pa: AX[dr["justify-content"] || "normal"], ca: AX[dr["align-items"] || "normal"] };
    /* 대시보드 차트 줄(2026-11-06 k36 — 사람의 결정: Figma 도 사이트처럼) — patterns.data.js dashboard 에서 .donut-row 를 품은 줄 div 의 클래스(row-3)를 찾고
       그 CSS grid-template-columns(fr 만) · gap 을 읽는다. 도넛 카드가 그 줄의 몇 번째 chart-card 인지도 센다 */
    const di0 = dash.indexOf('class="donut-row"'), rows = [...dash.slice(0, di0).matchAll(/<div class="(row-[a-z0-9-]+)">/g)], rowM = rows[rows.length - 1];
    if (!rowM) throw new Error("patterns.data.js dashboard 에서 .donut-row 를 품은 줄(row-*)을 찾지 못했습니다");
    const gr = cssRule("." + rowM[1]), frs = String(gr["grid-template-columns"] || "").trim().split(/\s+/);
    if (!frs.length || frs.some((f) => !/^[\d.]+fr$/.test(f))) throw new Error(`.${rowM[1]} grid-template-columns ${gr["grid-template-columns"]} 가 fr 만으로 되어 있지 않습니다`);
    const grid = { cls: rowM[1], fr: frs.map(parseFloat), gap: px(gr.gap || gr["column-gap"] || "0"), idx: [...dash.slice(rowM.index, di0).matchAll(/class="chart-card"/g)].length - 1 };
    if (grid.idx < 0 || grid.idx >= grid.fr.length) throw new Error(`대시보드 도넛 카드 위치 ${grid.idx} 가 .${rowM[1]} 열 ${grid.fr.length}개 밖입니다`);
    if (!(row.rowGap >= 0) || !(row.colGap >= 0)) throw new Error(`.donut-row gap ${dr.gap} 를 읽지 못했습니다`);
    /* 줄의 카드 구성(2026-11-06 k37) — 줄 div 를 짝 맞춰 잘라 그 안의 chart-card 들(카드끼리는 중첩되지 않는다)을 순서대로 읽는다.
       탐색형(canvas data-chart)은 같은 Type 의 data-visual 예제(CHART_EX) spec 과 같은지 — Figma Chart 변형은 그 예제 데이터를 그리므로 다르면 변형을 쓸 수 없다 */
    { let depth = 0, end = -1; const tagRe = /<div\b|<\/div>/g; tagRe.lastIndex = rowM.index;
      for (let m; (m = tagRe.exec(dash)); ) { depth += m[0] === "</div>" ? -1 : 1; if (depth === 0) { end = tagRe.lastIndex; break; } }
      if (end < 0) throw new Error(`patterns.data.js dashboard .${rowM[1]} 줄의 끝을 찾지 못했습니다`);
      const rowHtml = dash.slice(rowM.index, end), ENT2 = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", apos: "'", nbsp: " " };
      const txt = (h) => String(h).replace(/<[^>]+>/g, "").replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (_, e) => ENT2[e]).normalize("NFC").replace(/\s+/g, " ").trim();
      const canon = (o) => JSON.stringify(o, (k, v) => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((x) => [x, v[x]])) : v));
      grid.cards = rowHtml.split('<div class="chart-card"').slice(1).map((h, i) => {
        const tm = /<h3 class="chart-title">([\s\S]*?)<\/h3>/.exec(h); if (!tm) throw new Error(`.${rowM[1]} ${i + 1}번째 chart-card 에 .chart-title 이 없습니다`);
        const sm = /<span[^>]*>([\s\S]*?)<\/span>/.exec(tm[1]), card = { title: txt(tm[1].replace(/<span[\s\S]*?<\/span>/, "")), meta: sm ? txt(sm[1]) : null };
        const cm = /data-chart="([a-z]+)" data-spec='([^']+)'/.exec(h);
        if (cm) { const e = CHART_EX.find((x) => x[0] === cm[1]); if (!e) throw new Error(`대시보드 ${card.title} 의 data-chart ${cm[1]} 에 맞는 예제가 audit CHART_EX 에 없습니다`);
          const eh = [...ex(e[1]).matchAll(/data-chart="([a-z]+)" data-spec='([^']+)'/g)][e[2]]; if (!eh) throw new Error(`data-visual 예제 ${e[1]} 의 canvas 를 찾지 못했습니다`);
          const spec = JSON.parse(cm[2]); Object.assign(card, { kind: cm[1], spec, specEx: e[1], specSame: canon(spec) === canon(JSON.parse(eh[2])) }); }
        else card.kind = /class="donut"/.test(h) ? "donut" : /class="chart"/.test(h) ? "bars" : "other";
        return card; });
      if (grid.cards.length !== grid.fr.length) throw new Error(`patterns.data.js dashboard .${rowM[1]} chart-card ${grid.cards.length}개 ≠ 열 ${grid.fr.length}개`); }
    /* 정적 막대 내용(2026-11-09 k42b — 사람의 결정: Figma Chart Card Bar 두 변형 = 사이트 data-visual bar 예제) — 제목 · 캡션(<span>), 행 순서 · 라벨 · 값 · 톤 · 채움 폭(%).
       톤 칠 = ds-chart TONES 의 토큰이고 .chart .bar.{톤} i 의 background 도 같아야 한다 */
    const bar = (() => { const h = ex("bar"), ENT = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", apos: "'", nbsp: " " };
      const tx = (v) => String(v).replace(/<[^>]+>/g, "").replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (_, e) => ENT[e]).normalize("NFC").replace(/\s+/g, " ").trim();
      const tm = /<h3 class="chart-title">([\s\S]*?)<\/h3>/.exec(h); if (!tm) throw new Error("data-visual 예제 bar 에 .chart-title 이 없습니다");
      const cm = /<span[^>]*>([\s\S]*?)<\/span>/.exec(tm[1]);
      const tb = /var TONES = \{([\s\S]*?)\};/.exec(read("_build/ds-chart.src.js")); if (!tb) throw new Error("ds-chart.src.js 의 TONES 를 읽지 못했습니다");
      const TONES = Object.fromEntries([...tb[1].replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/"?([a-z0-9-]+)"?\s*:\s*"(--[a-z0-9-]+)"/g)].map((m) => [m[1], m[2]]));
      const rows = [...h.matchAll(/<div class="row"><span class="lbl">([\s\S]*?)<\/span><div class="bar ([a-z0-9-]+)"><i style="width:([\d.]+)%"><\/i><\/div><span class="num">([\s\S]*?)<\/span><\/div>/g)].map((m) => {
        const tone = m[2]; if (!TONES[tone]) throw new Error(`bar 예제의 톤 ${tone} 이 ds-chart TONES 에 없습니다`);
        const t = figTok(`var(${TONES[tone]})`), r = cssRule(`.chart .bar.${tone} i`); if (figTok(r.background) !== t) throw new Error(`.chart .bar.${tone} i ${r.background} ≠ TONES.${tone} ${TONES[tone]}`);
        return { lbl: tx(m[1]), tone, tok: t, pct: +m[3], num: tx(m[4]) }; });
      const nRow = (h.match(/<div class="row">/g) || []).length;
      if (!rows.length || rows.length !== nRow) throw new Error(`data-visual 예제 bar 의 행 ${nRow}개 중 ${rows.length}개만 읽었습니다(.row > .lbl · .bar.{톤} > i width% · .num)`);
      return { title: tx(tm[1].replace(/<span[\s\S]*?<\/span>/, "")), caption: cm ? tx(cm[1]) : null, rows }; })();
    return { barR: rad(".chart .bar"), fillR: rad(".chart .bar i"), sparkR: rad(".sparkline i"), bar, legend, row, grid, donut: { d: D, R: D / 2, divider: { ...dv, dist: D / 2 - dv.h / 2 }, angles: aDoc },
      kpi: { n: kpiEx.length, labels: kpiEx, dashOnly, example, dash: dashK, tones, unit, delta, dirFill, needNone } };
  } catch (e) { return { error: String(e.message || e) }; }
}

const CARD_SIZES = { Medium: "md", Small: "sm" };
function cardExpect() {
  try {
    const box = { I: (n, sz) => `⟦I:${n}:${sz || 0}⟧`, module: { exports: {} } };
    vm.runInNewContext(read("_build/components.data.js"), box, { filename: "components.data.js" });
    const c = box.module.exports.card || {}, fg = c.figma || {};
    const cap = (x) => (x ? x[0].toUpperCase() + x.slice(1) : x);
    const vkeys = Object.keys(fg.variants || {}), skeys = Object.keys(fg.sizes || {}), states = fg.states || [];
    if (!vkeys.length || !skeys.length || !states.length) throw new Error("components.data.js card.figma 의 variants · sizes · states 를 읽지 못했습니다");
    if (!vkeys.includes("selection") || !vkeys.includes("list") || !skeys.includes("flush")) throw new Error("card.figma 에 selection · list 유형이나 flush 크기가 없습니다 — k29 해석(선택 카드 = clickable, 목록 = flush)을 다시 정해야 합니다");
    const types = vkeys.map(cap); if (states.includes("loading")) types.push("Loading");
    const sizes = skeys.filter((k) => k !== "flush").map((k) => Object.keys(CARD_SIZES).find((z) => CARD_SIZES[z] === k));
    if (sizes.some((z) => !z)) throw new Error("card.figma.sizes 에 md · sm · flush 밖의 크기가 있습니다(" + skeys.join(" · ") + ")");
    const axis = states.filter((x) => x !== "focused" && x !== "loading").map(cap);
    /* Variant 축(2026-11-03 k32) — 기본 값(props variant 기본값 = Outline)은 전체 표, 그 밖(Flat)은 State=Default 만(상태 표현은 Outline 과 같아 되풀이하지 않는다 — k32 작업 지시) */
    const fv = fg.variant || {}, vrow = (c.props || []).find((r) => /^variant\b/.test(String(r[0])));
    if (!fv.outline || !fv.flat || !vrow) throw new Error("card.figma.variant(outline · flat) 이나 props 의 variant 행을 읽지 못했습니다");
    const vdef = cap(String(vrow[2]).replace(/"/g, "").trim()), vnames = Object.keys(fv).map(cap);
    const table = []; for (const vn of vnames) for (const t of types) for (const z of sizes) for (const st of t === "Selection" && vn === vdef ? axis : [axis[0]]) table.push(`Variant=${vn}, Type=${t}, Size=${z}, State=${st}`);
    const root = vars(block(read("_build/style.src.css"), ":root"));
    const pv = (v) => { const m = /^var\(--([a-z0-9-]+)\)$/.exec(String(v || "").trim()); return m ? px(root["--" + m[1]]) : px(v); };
    const pads = (v) => { const p = String(v || "").trim().split(/\s+/).map(pv); return [p[0], p[1] ?? p[0], p[2] ?? p[0], p[3] ?? p[1] ?? p[0]]; };
    const base = cssRule(".card"), md = cssRule(".card.md"), sm = cssRule(".card.sm"), fl = cssRule(".card.flush");
    const size = { Medium: { pad: pads(md.padding || base.padding), gap: px(md.gap || base.gap) }, Small: { pad: pads(sm.padding), gap: px(sm.gap) } };
    const flush = { pad: pads(fl.padding), gap: px(fl.gap) };
    if (fg.sizes.flush.pad !== flush.pad[0]) throw new Error(`card.figma.sizes.flush.pad(${fg.sizes.flush.pad})와 .card.flush padding(${fl.padding})이 다릅니다`);
    for (const z of sizes) if (fg.sizes[CARD_SIZES[z]].pad !== size[z].pad[0]) throw new Error(`card.figma.sizes.${CARD_SIZES[z]}.pad 와 CSS padding 이 다릅니다`);
    const headPad = { Medium: pads(cssRule(".card.flush .card-head").padding), Small: pads(cssRule(".card.flush:is(.sm,.compact) .card-head").padding) };
    const rm = /^var\(--radius-([a-z0-9]+)\)$/.exec(String(base["border-radius"]).trim());
    if (!rm) throw new Error(".card border-radius 가 var(--radius-*) 가 아닙니다");
    const bm = /([\d.]+)px solid (var\(--[a-z0-9-]+\))/.exec(base.border || "");
    if (!bm) throw new Error(".card border 를 읽지 못했습니다");
    const tsAll = typeScale(), w400 = (x) => x.weight || 400;
    const styleOf = (fs, lh, wt, what) => { const hit = Object.entries(tsAll).filter(([, x]) => x.size === fs && (lh === null || x.lineHeight === lh) && w400(x) === wt).map(([k]) => k); if (hit.length !== 1) throw new Error(`${what}(${fs}/${lh}/${wt})에 맞는 .t-* 가 ${hit.length}개입니다(${hit.join(" · ")})`); return hit[0]; };
    const t = cssRule(".card .title"), ts = cssRule(".card.sm .title"), tw = parseInt(t["font-weight"], 10) || 400;
    const title = { Medium: { fs: px(t["font-size"]), lh: px(t["line-height"]), wt: tw }, Small: { fs: px(ts["font-size"]), lh: px(ts["line-height"]), wt: parseInt(ts["font-weight"], 10) || tw } };
    for (const z of sizes) title[z].st = styleOf(title[z].fs, title[z].lh, title[z].wt, `제목 ${z}`);
    const d = cssRule(".card .desc"), mt = cssRule(".card .card-meta"), mg = String(mt.gap).trim().split(/\s+/).map(px);
    const dis = '.card.clickable:is(:disabled,[aria-disabled="true"])';
    const on = cssRule(".card.on"), ring = /inset 0 0 0 ([\d.]+)px (var\(--[a-z0-9-]+\))/.exec(on["box-shadow"] || "");
    if (!ring) throw new Error(".card.on box-shadow 의 inset 링을 읽지 못했습니다");
    const hov = /^var\(--shadow-(\d+)\)$/.exec(String(cssRule('.card.clickable:not(:disabled,[aria-disabled="true"]):hover')["box-shadow"]).trim());
    if (!hov) throw new Error("선택 카드 hover box-shadow 가 var(--shadow-N) 이 아닙니다");
    const ex = (id) => { const e = (c.examples || []).find((x) => x.id === id); if (!e) throw new Error("card 예제 없음: " + id); return e.html; };
    const im = /⟦I:([a-z0-9-]+):(\d+)⟧/.exec(ex("selection"));
    if (!im || !(+im[2] > 0)) throw new Error("selection 예제의 앞 아이콘 크기를 읽지 못했습니다");
    const errBtn = /class="empty error"[\s\S]*?<button[^>]*class="btn ([^"]+)"/.exec(ex("empty"));
    if (!errBtn) throw new Error("empty 예제의 .empty.error 안 버튼을 읽지 못했습니다");
    const bc = errBtn[1].split(/\s+/), pick = (opts) => cap(bc.find((x) => opts.includes(x)) || "");
    const BSZ = { sm: "Small", md: "Medium", lg: "Large" };
    const skel = [...ex("loading").matchAll(/class="skeleton ([^"]+)"/g)].map((x) => x[1].split(/\s+/).map(cap).join(" "));
    const ce = cssRule(".card .empty"), e0 = cssRule(".empty"), ico = Object.assign({}, cssRule(".empty .ico"), cssRule(".card .empty .ico"));   // 카드 안 아이콘 칸 = .empty .ico 위에 .card .empty .ico 를 덮은 값(k31 — 칸 없이 36)
    const isvg = cssRule(".card .empty .ico svg"), noBg = (v) => /^(none|transparent)$/.test(String(v || "").trim());
    /* 헤더 오른쪽 버튼(k31 — '전체 보기' = 텍스트 assistive) — 예제마다 .card-head 안 버튼 클래스를 읽어 유형별로 기대. 버튼이 없는 헤더(오류 카드)는 null */
    const btnName = (cls) => { const b = cls.split(/\s+/), pk = (o) => cap(b.find((x) => o.includes(x)) || ""); return `Variant=${pk(["solid", "outline", "text"])}, Color=${pk(["primary", "assistive", "negative"])}, Size=${BSZ[b.find((x) => BSZ[x])] || "?"}`; };
    const heads = (html) => [...html.matchAll(/class="card-head">([\s\S]*?)<\/div>/g)].map((x) => { const b = /<button[^>]*class="btn ([^"]+)"/.exec(x[1]); return b ? btnName(b[1]) : null; });
    const lh = heads(ex("list")), eh = heads(ex("empty"));
    if (lh.length !== 1 || eh.length !== 2) throw new Error(`list · empty 예제의 .card-head 수가 ${lh.length} · ${eh.length} 입니다(기대 1 · 2) — 헤더 버튼 기대를 다시 정해야 합니다`);
    const headBtn = { List: lh[0], Empty: eh[0], Error: eh[1] };
    const want = {
      types, sizes, axis, table, vnames, vdef, size, flush, headPad, headGap: px(cssRule(".card .card-head").gap), headBtn,
      face: figTok(base.background), stroke: figTok(bm[2]), sw: +bm[1], radius: { tok: "radius/" + rm[1], px: px(root["--radius-" + rm[1]]) }, minW: px(base["min-width"]),
      title, desc: { st: styleOf(px(d["font-size"]), null, parseInt(d["font-weight"], 10) || 400, "설명"), fill: figTok(d.color) },
      meta: { row: mg[0], col: mg[1] ?? mg[0], st: styleOf(px(mt["font-size"]), px(mt["line-height"]), 400, "키-값"), key: figTok(cssRule(".card .card-meta dt").color), val: figTok(cssRule(".card .card-meta dd").color) },
      icon: { size: +im[2], ink: figTok(cssRule(".card.clickable>svg").color), on: figTok(cssRule(".card.on>svg").color), dis: figTok(cssRule(dis + ">svg").color) },
      hover: "shadow/" + hov[1],
      selected: { face: figTok(on.background), ring: { tok: figTok(ring[2]), w: +ring[1] } },
      disabled: { face: figTok(cssRule(dis).background), shadowNone: String(cssRule(dis)["box-shadow"]).trim() === "none", title: figTok(cssRule(dis + " .title").color), desc: figTok(cssRule(dis + " .desc").color) },
      empty: { pad: pads(ce.padding), noBorder: /^(0|none)$/.test(String(ce.border).trim()), noFace: /^(none|transparent)$/.test(String(ce.background).trim()), gap: px(e0.gap), hint: figTok(e0.color),
        msg: { fs: px(cssRule(".card .empty b")["font-size"]), fill: figTok(cssRule(".empty b").color) },
        ico: { w: px(ico.width), h: px(ico.height), noFace: noBg(ico.background), face: noBg(ico.background) ? "-" : figTok(ico.background),
          radius: /^0(px)?$/.test(String(ico["border-radius"]).trim()) ? null : "radius/" + ((/var\(--radius-([a-z0-9]+)\)/.exec(ico["border-radius"] || "") || [])[1]), r0: /^0(px)?$/.test(String(ico["border-radius"]).trim()),
          iw: px(isvg.width), ih: px(isvg.height), ink: figTok(ico.color), err: figTok(cssRule(".card .empty.error .ico").color) },
        btn: `Variant=${pick(["solid", "outline", "text"])}, Color=${pick(["primary", "assistive", "negative"])}, Size=${BSZ[bc.find((x) => BSZ[x])] || "?"}` },
      skel,
    };
    for (const [k, v] of [["면", want.face], ["테두리", want.stroke], ["설명 칠", want.desc.fill], ["키 칠", want.meta.key], ["값 칠", want.meta.val], ["아이콘", want.icon.ink], ["선택 아이콘", want.icon.on], ["비활성 아이콘", want.icon.dis],
      ["선택 면", want.selected.face], ["선택 링", want.selected.ring.tok], ["비활성 면", want.disabled.face], ["비활성 제목", want.disabled.title], ["비활성 설명", want.disabled.desc], ["빈 상태 Hint", want.empty.hint], ["빈 상태 Message", want.empty.msg.fill],
      ["아이콘 면", want.empty.ico.face], ["아이콘 크기", want.empty.ico.iw && want.empty.ico.ih], ["빈 아이콘", want.empty.ico.ink], ["오류 아이콘", want.empty.ico.err]]) if (!v) throw new Error(k + " 토큰을 읽지 못했습니다");
    if (!skel.length) throw new Error("loading 예제에 .skeleton 이 없습니다");
    const props = c.props || [], sv = (props.find((r) => /^size\b/.test(String(r[0]))) || [])[2];
    const dz = Object.keys(CARD_SIZES).find((z) => CARD_SIZES[z] === String(sv || "").replace(/"/g, "").trim());
    if (!dz) throw new Error("props 의 size 기본값을 읽지 못했습니다");
    want.default = `Variant=${vdef}, Type=${types[0]}, Size=${dz}, State=${axis[0]}`;
    return want;
  } catch (e) { return { error: String(e.message || e) }; }
}

/* Tag 기본 크기(2026-10-26 k7) — components.data.js 의 Tag props 에서 size 행의 기본값(md)을 읽어 Figma 크기 이름으로 */
function tagDefaultSize() {
  const box = { I: () => "", module: { exports: {} } };
  vm.runInNewContext(read("_build/components.data.js"), box, { filename: "components.data.js" });
  const row = ((box.module.exports.tag || {}).props || []).find((r) => r[0] === "size");
  return row ? { sm: "Small", md: "Medium", lg: "Large" }[String(row[2]).trim()] || null : null;
}

/* ---------- 문서 카드 Spec(2026-10-26 k3) ----------
   저장소 값은 _build/components.data.js 의 spec 행이다. 파일을 그대로 실행해 읽는다(아이콘 함수 I 는 빈 글로 대신한다).
   사이트에 보이는 글로 바꿔 둔다 — HTML 태그를 지우고 엔티티를 푼다. 맞대는 규칙은 diffComponents 의 Spec 대조 주석에 */
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", apos: "'", nbsp: " " };
const specNorm = (s) => String(s).normalize("NFC").replace(/\s+/g, " ").trim();
const specSite = (s) => specNorm(String(s).replace(/<[^>]+>/g, "").replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (_, e) => ENT[e]));
function specExpect() {
  const box = { I: () => "", module: { exports: {} } };
  vm.runInNewContext(read("_build/components.data.js"), box, { filename: "components.data.js" });
  const out = {};
  for (const [slug, c] of Object.entries(box.module.exports)) out[slug] = (c.spec || []).map(([k, v]) => [specNorm(k), specSite(v)]);
  return out;
}

/* Tag 톤 · 심각도 지표(2026-11-09 k42 — 심각도 5단계 Critical · High · Medium · Low · Info + 상태 톤 Pending, 사람의 결정 2026-11-06).
   하드코딩한 톤 목록을 두지 않는다 — 전에는 ["info","neutral","critical","high","medium","low","ok","accent"] 를 여기 적어 두어 톤이 늘면 소리 없이 빠졌다.
   Tag  변형 표 = components.data.js tag.figma.variants 의 키(Figma 이름: ok → OK, 나머지는 첫 글자만 대문자) × figma.states(subtle · outline · solid) × figma.sizes(sm · md · lg).
        바탕 = variants.bg, Solid 면 = solidBg, Solid 라벨 = solidFg — 셋 다 사이트 CSS(.tag.{톤} · .tag.solid.{톤} · .tag)와 같아야 하고 다르면 기대값을 읽다 멈춘다.
        점(::before) · Solid 테두리는 figma.variants 에 없거나(테두리) 사이트와 어긋날 수 있어(fg) 사이트 CSS 가 기준이다 — fg 가 CSS 점과 다르면 NOTE 로 알린다.
        neutral(톤 클래스 없는 .tag)은 Figma 에 따로 두지 않고 Info 가 맡는다 — 바탕 · 점 · Solid 가 CSS 에서 info 와 같을 때만(다르면 멈춤 — 그때는 Neutral 변형이 필요하다).
   라벨 저장소 예제(components.data.js · patterns.data.js 의 examples html)의 <span class="tag 톤 …">라벨</span> 에서 라벨 → 톤. 한 라벨이 두 톤에 쓰이면 대조하지 않는다.
   지표 단계 = patterns.data.js severity 의 band 예제 <i class="단계" style="flex:N"> 순서, 색 = ds-chart TONES[단계](캔버스 · 정적이 같은 표).
        정적 CSS(.chart-legend i · .chart .bar i · .sev-band i · .sev-cell i · .donut conic-gradient 순서)가 TONES 와 다르면 기대값을 읽다 멈춘다 */
function severityExpect() {
  const box = { I: () => "", module: { exports: {} } };
  vm.runInNewContext(read("_build/components.data.js"), box, { filename: "components.data.js" });
  const pb = { I: () => "", module: { exports: {} } };
  vm.runInNewContext(read("_build/patterns.data.js"), pb, { filename: "patterns.data.js" });
  const C = box.module.exports, P = pb.module.exports, tf = (C.tag || {}).figma;
  if (!tf || !tf.variants || !tf.states || !tf.sizes) throw new Error("components.data.js tag.figma(variants · states · sizes)를 읽지 못했습니다");
  const has = (sel) => { try { return cssRule(sel); } catch { return null; } };
  const tok = (v) => figTok(`var(${v})`), notes = [];
  const base = cssRule(".tag"), solidBase = cssRule(".tag.solid"), dotBase = cssRule(".tag::before");
  /* 톤 하나의 사이트 칠 — neutral 은 톤 클래스가 없다 */
  const css = (k) => { const s = k === "neutral" ? "" : "." + k, face = k === "neutral" ? base : has(`.tag${s}`);
    if (!face) throw new Error(`components.data.js tag.figma.variants.${k} 에 맞는 CSS .tag${s} 가 없습니다`);
    const dot = figTok((has(`.tag${s}::before`) || dotBase).background), sc = has(`.tag.solid${s}`) || {}, sd = has(`.tag.solid${s}::before`);
    return { fill: figTok(face.background || base.background), dot,
      solid: { fill: figTok(sc.background || face.background || base.background), stroke: sc["box-shadow"] === "none" ? null : inset(sc["box-shadow"] || solidBase["box-shadow"]),
        label: figTok(sc.color || base.color), dot: sd ? figTok(sd.background) : dot } }; };
  const V = tf.variants, keys = Object.keys(V), alias = {};
  if (V.neutral && V.info) { const n = css("neutral"), i = css("info");
    if (JSON.stringify(n) !== JSON.stringify(i) || V.neutral.bg !== V.info.bg) throw new Error(`tag neutral(.tag)과 info(.tag.info)의 칠이 다릅니다 ${JSON.stringify(n)} ≠ ${JSON.stringify(i)} — Figma 에 Neutral 변형이 따로 필요합니다`);
    alias.neutral = "info"; }
  const NAME = (k) => (k === "ok" ? "OK" : k[0].toUpperCase() + k.slice(1));
  const face = {}, tones = {}, names = [];
  for (const k of keys) {
    if (alias[k]) continue;
    const v = V[k], c = css(k);
    for (const [f, w] of [["bg", c.fill], ["solidBg", c.solid.fill], ["solidFg", c.solid.label]]) {
      if (!v[f]) throw new Error(`components.data.js tag.figma.variants.${k}.${f} 가 없습니다 — Figma 는 ${tf.states.join(" · ")} 를 모두 그립니다`);
      if (tok(v[f]) !== w) throw new Error(`tag.figma.variants.${k}.${f} ${v[f]} ≠ 사이트 CSS ${w}`);
    }
    if (v.fg && tok(v.fg) !== c.dot) notes.push(`components.data.js tag.figma.variants.${k}.fg ${v.fg} 가 사이트 점(.tag${k === "neutral" ? "" : "." + k}::before → ${c.dot})과 다릅니다 — Figma 는 사이트 화면(CSS)을 따릅니다. 저장소에서 어느 쪽이 맞는지 정해야 합니다`);
    face[k] = c.fill; tones[k] = { dot: c.dot, solid: c.solid }; names.push(NAME(k));
  }
  for (const [k, to] of Object.entries(alias)) if (V[k].fg && tok(V[k].fg) !== css(k).dot) notes.push(`components.data.js tag.figma.variants.${k}.fg ${V[k].fg} 가 사이트 점(${css(k).dot})과 다릅니다 — ${k} 는 Figma 에서 ${NAME(to)} 가 맡습니다`);
  const CAP = (s) => s[0].toUpperCase() + s.slice(1), SIZE = { sm: "Small", md: "Medium", lg: "Large" };
  const tag = { label: figTok(base.color), face, outline: { stroke: inset(cssRule(".tag.outline")["box-shadow"]) }, tones, names, styles: tf.states.map(CAP),
    sizes: Object.keys(tf.sizes).map((s) => { if (!SIZE[s]) throw new Error("tag.figma.sizes 의 " + s + " 에 맞는 Figma 크기 이름이 없습니다"); return SIZE[s]; }), alias, notes };
  /* 라벨 → 톤 */
  const htmls = [];
  for (const M of [C, P]) for (const e of Object.values(M)) for (const x of (e && e.examples) || []) if (x.html) htmls.push(x.html);
  const seen = {};
  for (const h of htmls) for (const m of h.matchAll(/<span class="tag((?: [a-z0-9-]+)*)"[^>]*>([^<]+)<\/span>/g)) {
    const cls = m[1].trim().split(/\s+/).filter(Boolean), t = cls.find((c) => keys.includes(c) && c !== "neutral") || "neutral", lb = m[2].trim();
    (seen[lb] = seen[lb] || new Set()).add(t);
  }
  const labels = Object.fromEntries(Object.entries(seen).filter(([, s]) => s.size === 1).map(([k, s]) => [k, [...s][0]]));
  const ambiguous = Object.entries(seen).filter(([, s]) => s.size > 1).map(([k, s]) => `${k}(${[...s].join("/")})`);
  /* 심각도 지표 */
  const js = read("_build/ds-chart.src.js"), tb = /var TONES = \{([\s\S]*?)\};/.exec(js); if (!tb) throw new Error("ds-chart.src.js 의 TONES 를 읽지 못했습니다");
  const TONES = Object.fromEntries([...tb[1].replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/"?([a-z0-9-]+)"?\s*:\s*"(--[a-z0-9-]+)"/g)].map((m) => [m[1], m[2]]));
  const sev = P.severity || {}, exHtml = (id) => ((sev.examples || []).find((x) => x.id === id) || {}).html || "";
  const band = (h) => [...h.matchAll(/<i class="([a-z]+)" style="flex:([\d.]+)"><\/i>/g)].map((m) => [m[1], +m[2]]);
  const bandEx = band(exHtml("band")), bandThumb = band(sev.thumb || "");
  if (!bandEx.length) throw new Error("patterns.data.js severity 의 band 예제에서 단계(<i class=… style=\"flex:N\">)를 읽지 못했습니다");
  if (bandThumb.length && JSON.stringify(bandThumb) !== JSON.stringify(bandEx)) throw new Error(`severity thumb 밴드 ${JSON.stringify(bandThumb)} ≠ band 예제 ${JSON.stringify(bandEx)}`);
  const levels = bandEx.map(([l]) => l), marks = {};
  for (const l of levels) {
    if (!TONES[l]) throw new Error(`심각도 단계 ${l} 가 ds-chart TONES 에 없습니다`);
    const t = tok(TONES[l]);
    for (const sel of [`.chart-legend i.${l}`, `.chart .bar.${l} i`, `.sev-band i.${l}`, `.sev-cell i.${l}`]) { const r = has(sel); if (!r || figTok(r.background) !== t) throw new Error(`${sel} ${r ? r.background : "없음"} ≠ ds-chart TONES.${l} ${TONES[l]}`); }
    marks[CAP(l)] = t;
  }
  const conic = [...cssRule(".donut").background.matchAll(/var\(--([a-z0-9-]+)\)\s+[\d.]+%?\s+[\d.]+%/g)].map((x) => figTok("var(--" + x[1] + ")")).filter((x) => x !== "surface/elevated/primary");
  if (conic.join() !== levels.map((l) => tok(TONES[l])).join()) throw new Error(`.donut conic-gradient 색 순서 ${conic.join(" · ")} ≠ 심각도 단계 ${levels.join(" · ")} 의 TONES`);
  return { tag, labels, ambiguous, levels, marks, band: { tones: bandEx.map(([l]) => tok(TONES[l])), flex: bandEx.map(([, f]) => f), levels }, notes };
}

function componentsExpect() {
  const sev = severityExpect();
  const surface = (sel) => { const r = cssRule(sel); const b = /1px solid (var\([^)]+\))/.exec(r.border || ""); return { shadow: !!r["box-shadow"] && r["box-shadow"] !== "none", stroke: b ? figTok(b[1]) : null }; };
  return {
    surfaces: { "Card": surface(".card"), "Chart Card": surface(".chart-card"), "KPI": surface(".kpi") },
    gap: {
      cardFoot: px(cssRule(".card .card-foot").gap),
      popupActions: px(cssRule(".popup .popup-actions").gap),
      tabItem: px(cssRule(".tabs .tab").gap),
    },
    track: { pill: figTok(cssRule(".tabs.pill").background), selectFilled: figTok(cssRule(".select-btn").background) },
    /* Button(2026-10-28 k16 — 사람의 정의로 개편) — 형태 × 색 × 상태마다 면 · 테두리 · 글자(아이콘) 색. 규칙은 buttonExpect 머리 주석 */
    button: buttonExpect(),
    /* Figma 레이아웃 규칙 — CSS 에 없는 값이라 여기 상수로 둔다. 출처: .claude/agents/figma-sync.md "섹션 간격은 200px" */
    sectionGap: 200,
    /* 태그 톤 · 세 스타일 · 변형 표 — severityExpect(2026-11-09 k42). 라벨 글자는 톤과 상관없이 .tag 의 color 하나이고, neutral(.tag)은 Figma 의 Info 가 맡는다 */
    tag: sev.tag,
    bannerWarning: figTok(cssRule(".banner.warning").background),
    tagStyle: { outline: sev.tag.outline, tones: sev.tag.tones },
    /* 심각도 지표 · Tag 라벨 ↔ 톤 — severityExpect(2026-11-09 k42) */
    severity: { labels: sev.labels, ambiguous: sev.ambiguous, levels: sev.levels, marks: sev.marks, band: sev.band, notes: sev.notes },
    kpiValue: { Default: figTok(cssRule(".kpi .value").color), Critical: figTok(cssRule(".kpi.critical .value").color), High: figTok(cssRule(".kpi.high .value").color) },   // Default 는 .kpi .value 에 색이 생긴 뒤(2026-10-23 k)부터 본다 — 색이 없으면 null 이라 건너뛴다
    banner: Object.fromEntries([["Accent", ".banner"], ["Warning", ".banner.warning"], ["Danger", ".banner.danger"]].map(([k, s]) => { const r = cssRule(s), b = cssRule(".banner"); return [k, { fill: figTok(r.background || b.background), label: figTok(r.color || b.color) }]; })),
    menuItem: { hover: figTok(cssRule(".menu-item:hover").background), selected: figTok(cssRule(".menu-item.on").background) },
    tabCount: { base: figTok(cssRule(".tabs .tab .count").background), on: figTok(cssRule(".tabs .tab.on .count").background) },
    /* 저장소에 있고 Figma 에도 있어야 하는 세트 — 없으면 어긋남 */
    /* Count · Status Indicator · Step · Navigation Item · Sparkline · Donut — 기대값은 전부 CSS 에서 */
    countBadge: (() => { const base = cssRule(".count"); const t = (sel) => { const r = cssRule(sel); return { fill: figTok(r.background || base.background), text: figTok(r.color || base.color) }; };
      return { Danger: t(".count"), Neutral: t(".count.neutral"), Accent: t(".count.accent"), Dot: { fill: figTok(cssRule(".count.dot").background || base.background), text: null } }; })(),   // .count.dot 은 배경을 따로 두지 않아 .count 를 따른다
    statusDot: Object.fromEntries([["Neutral", ".indicator::before"], ["OK", ".indicator.ok::before"], ["Warn", ".indicator.warn::before"], ["Danger", ".indicator.danger::before"], ["Info", ".indicator.info::before"], ["Accent", ".indicator.accent::before"]].map(([k, sel]) => [k, figTok(cssRule(sel).background)])),
    step: (() => { const r = cssRule; return {
      Todo: { circle: figTok(r(".steps li i").background), number: figTok(r(".steps li i").color), label: figTok(r(".steps li").color) },
      Done: { circle: figTok(r(".steps li.done i").background), check: figTok(r(".steps li.done i").color), label: figTok(r(".steps li").color) },
      Current: { circle: figTok(r(".steps li.on i").background), number: figTok(r(".steps li.on i").color), label: figTok(r(".steps li.on").color) } }; })(),
    navItem: (() => { const r = cssRule; return {
      hover: figTok(r(".sidenav a:hover").background), pressed: figTok(r(".sidenav a:active").background),
      selected: { fill: figTok(r(".sidenav a.on").background), label: figTok(r(".sidenav a.on").color), icon: figTok(r(".sidenav a.on svg").color) },
      base: { label: figTok(r(".sidenav a").color), icon: figTok(r(".sidenav a svg").color) },
      sub: { label: figTok(r(".sidenav a.sub").color), selected: figTok(r(".sidenav a.sub.on").color) } }; })(),
    sparkBars: { bar: figTok(cssRule(".sparkline i").background), hi: figTok(cssRule(".sparkline i.hi").background) },
    /* 컨테이너 — 사이트 예제와 순서 · 라벨 · 상태 · 아이콘. Steps 는 Indicator 의 steps 예제, Navigation 은 Default 예제 */
    stepsItems: stepsExample(),
    navItems: navExample(),
    navCollapsed: navExample("collapsed"),
    /* 문서 카드 Spec — 컴포넌트 키별 [행 이름, 사이트 글] (2026-10-26 k3) */
    specs: specExpect(),
    /* 값 입력 필드 4종의 포커스 — 사이트 CSS (2026-10-26 k5) */
    focus: focusExpect(),
    /* Tag 기본 크기 — props 의 size 기본값(2026-10-26 k7) */
    tagDefault: tagDefaultSize(),
    /* Button 기본 변형 — props 의 variant · color · size 기본값(2026-10-28 k16) */
    buttonDefault: buttonDefault(),
    /* Accordion 변형 표 · 헤더 · Hover · Disabled · 기본 변형 — 사이트 CSS 와 components.data.js(2026-10-29 k21) */
    accordion: accordionExpect(),
    /* Breadcrumb 행 · 항목 — 사이트 .breadcrumb 규칙 · :focus-visible · components.data.js(2026-10-30 k25) */
    breadcrumb: breadcrumbExpect(),
    /* Card 변형 표 · 크기 · 상자 · 제목 · 선택 상태 · 빈/오류 · Loading — 사이트 .card 규칙 · components.data.js(2026-11-03 k29) */
    card: cardExpect(),
    /* Variant outline · flat — Card · KPI · Chart Card(2026-11-03 k32, flatExpect) */
    flat: flatExpect(),
    /* Chart 세트(탐색형 차트 4종) — CSS --chart-* · data-visual.figma.chart · 예제 data-spec · ds-chart.src.js(2026-11-04 k33, chartExpect) */
    chart: chartExpect(),
    /* 정적 차트 — 막대 · 트랙 · 스파크라인 모서리, 도넛 경계선, 범례 견본, KPI 예제 수(2026-11-05 k35, staticChartExpect) */
    staticChart: staticChartExpect(),
    /* Text Field 입력칸 높이 — .field input · .field.sm input · .field.lg input(2026-10-28 k16) */
    textFieldH: (() => { try { const h = { Small: px(cssRule(".field.sm input").height), Medium: px(cssRule(".field input").height), Large: px(cssRule(".field.lg input").height) }; return Object.values(h).every((x) => x > 0) ? h : { error: "높이를 읽지 못했습니다 " + JSON.stringify(h) }; } catch (e) { return { error: String(e.message || e) }; } })(),
    /* 선택된 Radio · 비활성 Slider 글자의 칠 — 사이트 CSS (2026-10-27 k11) */
    controls: controlsExpect(),
    /* Chip 삭제(x) · 비활성 Item Tile — 사이트 CSS (2026-10-27 k12) */
    chipTile: chipTileExpect(),
    /* Date Picker 필드 · 날짜 칸 — 사이트 CSS (2026-10-27 k14) */
    datePicker: datePickerExpect(),
    /* 도넛 호 각도 — conic-gradient 정지점에서. CSS 0° 는 12시, Figma 0° 는 3시라 90° 를 뺀다. 면 색(틈) 구간은 호가 아니다 */
    donutArcs: [...cssRule(".donut").background.matchAll(/var\(--([a-z0-9-]+)\)\s+([\d.]+)%?\s+([\d.]+)%/g)]
      .map((x) => ({ tok: figTok("var(--" + x[1] + ")"), from: +x[2] * 3.6 - 90, to: +x[3] * 3.6 - 90 }))
      .filter((s) => s.tok !== "surface/elevated/primary"),
    /* 체크 선 굵기 — 24 viewBox 의 stroke-width 를 아이콘 폭으로 줄인 실제 굵기(3 × 12/24 = 1.5). Figma 는 px 로 그린다 */
    checkStroke: (() => { const r = cssRule(".steps li i svg"); return parseFloat(r["stroke-width"]) * (parseFloat(r.width) / 24); })(),
    /* Pulse 고리 — 색은 box-shadow 색과 같은 계열(foreground/negative/primary → negative), 굵기는 @keyframes pulse 의 최대 퍼짐 이하 */
    pulse: (() => {
      const tok = figTok(cssRule(".indicator.pulse::before")["box-shadow"]);
      const css = read("_build/style.src.css"), i = css.indexOf("@keyframes pulse{");
      if (i < 0) throw new Error("@keyframes pulse 없음");
      let d = 0, j = i; for (; j < css.length; j++) { if (css[j] === "{") d++; else if (css[j] === "}") { d--; if (!d) break; } }
      const spreads = [...css.slice(i, j).matchAll(/box-shadow:\s*0 0 0 ([\d.]+)px/g)].map((x) => +x[1]);
      return { tok, family: tok ? tok.split("/")[1] : null, max: spreads.length ? Math.max(...spreads) : null };
    })(),
    /* 도넛 가운데 합계(2026-11-05 k34 — 사람의 결정 2026-11-04: Title/1 로 묶는다). .donut::after 의 font-size · line-height · font-weight 와 셋이 같은 타입 스케일 스타일 하나.
       탐색형 도넛(ds-chart centerPlugin 의 ctx.font "굵기 크기px")도 같은 값이어야 한다 — 다르면 기대값을 읽다 멈춘다 */
    donutCenter: (() => { try { const r = cssRule(".donut::after"), size = parseFloat(r["font-size"]), lh = parseFloat(r["line-height"]), weight = parseInt(r["font-weight"], 10);
      const m = /ctx\.font\s*=\s*"(\d+) (\d+)px/.exec(read("_build/ds-chart.src.js")); if (!m) throw new Error("ds-chart.src.js centerPlugin 의 ctx.font 를 읽지 못했습니다");
      if (+m[1] !== weight || +m[2] !== size) throw new Error(`ds-chart centerPlugin ${m[1]} ${m[2]}px ≠ .donut::after ${weight} ${size}px`);
      const hits = Object.entries(typeScale()).filter(([, d]) => d.size === size && d.lineHeight === lh && d.weight === weight).map(([n]) => n);
      if (hits.length !== 1) throw new Error(`.donut::after ${size}/${lh}/${weight} 에 맞는 타입 스케일 스타일이 ${hits.length}개입니다 — ${hits.join(" · ")}`);
      return { style: hits[0], size, lh, weight }; } catch (e) { return { error: String(e.message || e) }; } })(),
    donut: (() => { const bg = cssRule(".donut").background;
      const gaps = [...bg.matchAll(/var\(--surface-elevated-primary\) ([\d.]+)% ([\d.]+)%/g)].map((x) => +x[2] - +x[1]).filter((w) => w > 0.9);   // 0 · 100 끝의 반쪽 틈은 뺀다
      return { gapDeg: gaps.length ? +(gaps[0] * 3.6).toFixed(2) : 0, row: cssRule(".donut-row")["justify-content"] }; })(),
    /* 저장소에 있고 Figma 에도 있어야 하는 세트 — 없으면 어긋남 */
    requiredSets: ["Card", "Chart Card", "KPI", "Tab", "Tab Item", "Select Button", "Popup", "Button", "Accordion", "Accordion Group", "Tag", "Banner", "Menu Item",
      "Count", "Status Indicator", "Step", "Steps", "Navigation Item", "Navigation"],
  };
}

/* 속성 연결 규칙의 선언된 예외 — 넷(세트 · 변형 · 노드 · 속성)이 다 맞을 때만 넘긴다. 다른 빠짐은 그대로 잡는다 */
/* Button · Loading=True · Icon Left 의 예외(2026-10-23 k2)는 2026-10-28 k17 에 지웠다 — 스피너를 "Spinner" 로 떼고 Icon Left 를 되살려
   visible=Icon Left 속성에 다시 연결했다(층 불투명도 0 으로 숨김 — 사이트 .btn.loading 이 아이콘을 투명하게 두고 자리는 지키는 것과 같다) */
const REF_EXCEPTIONS = [
];

/* 반투명 컴포넌트의 선언된 예외(2026-10-27 k10) — 컴포넌트 자체가 반투명이어야 하는 것만 [세트, 변형 이름 정규식, 이유] 로 적는다
   (예: 끌기 미리보기 · 딤 오버레이 견본). 비활성 표현은 여기 넣지 않는다 — 비활성은 토큰으로 칠한다(CLAUDE.md). 지금은 없다 */
const OPACITY_OK = [];

function diffComponents(c, want, bad, notes) {
  if (!c) { notes.push("덤프에 컴포넌트 조사가 없습니다 — 옛 probe.js 로 만든 덤프입니다"); return; }
  for (const s of c.missingSets || []) if (want.requiredSets.includes(s)) bad.push(`컴포넌트 세트 없음: ${s}`);
  const sets = c.sets || {};
  for (const [set, w] of Object.entries(want.surfaces)) {
    for (const v of sets[set] || []) {
      if (!/Hover/.test(v.name) && w.shadow === false && v.shadow > 0) bad.push(`${set} 그림자 남음 — ${v.name} (${v.id})`);
      if (!/Selected/.test(v.name) && !/(?:^|, )Variant=Flat(?:,|$)/.test(v.name) && w.stroke && !(v.stroke.includes("$" + w.stroke) && !v.stroke.includes(w.stroke + "-opaque") && v.sw === 1))
        bad.push(`${set} 보더 다름 — ${v.name}: Figma[${v.stroke} ${v.sw}px] 저장소[1px ${w.stroke}] (${v.id})`);
      if (set === "Card" && v.foot !== null && v.foot !== want.gap.cardFoot) bad.push(`Card Foot 간격 ${v.foot} ≠ ${want.gap.cardFoot} — ${v.name} (${v.id})`);
    }
  }
  for (const v of sets["Popup"] || []) if (v.actions !== null && v.actions !== want.gap.popupActions) bad.push(`Popup Actions 간격 ${v.actions} ≠ ${want.gap.popupActions} — ${v.name} (${v.id})`);
  for (const v of sets["Tab Item"] || []) if (v.gap !== null && v.gap !== want.gap.tabItem) bad.push(`Tab Item 간격 ${v.gap} ≠ ${want.gap.tabItem} — ${v.name} (${v.id})`);
  for (const v of (sets["Tab"] || []).filter((x) => /Style=Pill/.test(x.name)))
    if (!v.fill.includes("$" + want.track.pill)) bad.push(`Tab Pill 트랙 ${v.fill} ≠ ${want.track.pill} (${v.id})`);
  for (const v of (sets["Select Button"] || []).filter((x) => /Style=Filled/.test(x.name)))
    if (!v.fill.includes("$" + want.track.selectFilled)) bad.push(`Select Button 트랙 ${v.fill} ≠ ${want.track.selectFilled} (${v.id})`);
  /* Button(2026-10-28 k16) — 변형 표(btnMatrix)와 이름이 하나하나 맞는지(빠진 것 · 표에 없는 것 · 옛 이름), 그리고 변형마다 면 · 테두리 · 글자(아이콘 전용은 아이콘 선) 색.
     규칙과 옛 이름 대응은 buttonExpect 머리 주석. 색은 칠 하나와 정확히 같아야 한다($토큰 · 면 없음 "-" · 투명 테두리 "transparent").
     Loading=True 는 면 · 테두리가 Normal 과 같고, 라벨 버튼의 글자는 "transparent"(.btn.loading color — k17). 아이콘 전용의 아이콘 색은 probe 가 "Icon" 노드의 벡터 선으로 적는다
     (Loading 의 아이콘은 층 불투명도 0 으로 숨겨 선 색은 Normal 그대로다 — 숨김은 아래 Loading 대조가 본다) */
  const btn = sets["Button"] || [];
  {
    const bv = (name) => Object.fromEntries(String(name).split(", ").map((kv) => kv.split("=")).filter((x) => x.length === 2).map(([k, v]) => [k.trim(), v.trim()]));
    const key = (o) => ["Variant", "Color", "Size", "State", "Icon Only", "Loading"].map((k) => k + "=" + (o[k] || "?")).join(", ");
    const exp = new Set(btnMatrix().map(key)), got = new Map(btn.map((v) => [key(bv(v.name)), v]));
    if (btn.length) {
      const miss = [...exp].filter((k) => !got.has(k)), stray = btn.filter((v) => !exp.has(key(bv(v.name))));
      if (miss.length) bad.push(`Button 에 없는 변형 ${miss.length}개(기대 ${exp.size}) — ${miss.slice(0, 4).join(" · ")}${miss.length > 4 ? " …" : ""}`);
      if (stray.length) bad.push(`Button 에 표에 없는 변형 ${stray.length}개 — ${stray.slice(0, 4).map((v) => v.name + "(" + v.id + ")").join(" · ")}${stray.length > 4 ? " …" : ""}(옛 이름 · Focused 는 지웠어야 합니다 — buttonExpect 머리 주석)`);
    }
    const we = want.button;
    if (we.error) bad.push(`Button 기대값을 사이트 CSS 에서 읽지 못했습니다 — ${we.error}`);
    else for (const v of btn) {
      const o = bv(v.name), e = we[o.Variant + "/" + o.Color], w = e && (o.Loading === "True" && o["Icon Only"] === "False" ? e.Loading : e[o.State]);
      if (!w) continue;   // 표에 없는 변형은 위에서 냈다
      const at = `Button ${v.name} (${v.id})`, tok = (t) => (t === "-" || t === "transparent" ? t : "$" + t);
      if (v.fill !== tok(w.fill)) bad.push(`${at} 면 ${v.fill} ≠ ${w.fill === "-" ? "없음" : w.fill} — 사이트 ${w.css}`);
      if (v.stroke !== tok(w.stroke)) bad.push(`${at} 테두리 ${v.stroke} ≠ ${w.stroke} — 사이트 ${w.css}`);
      const fg = o["Icon Only"] === "True" ? v.icon : v.text;
      if (fg !== tok(w.fg)) bad.push(`${at} ${o["Icon Only"] === "True" ? "아이콘" : "글자"} ${fg} ≠ ${w.fg} — 사이트 ${w.css}`);
      if (v.opacity !== undefined && v.opacity < 1) bad.push(`${at} 불투명도 ${v.opacity} — 비활성은 토큰으로 칠합니다`);
    }
  }
  /* Accordion(2026-10-29 k21) — 규칙은 accordionExpect 머리 주석. probe 의 components.accordion(변형마다 헤더 · 제목 · 보조 정보 · 셰브론)과
     sets.Accordion(테두리)으로 본다. 옛 probe 덤프에는 components.accordion 이 없다 — 그때는 NOTE 로만 알린다 */
  {
    const wa = want.accordion, acc = c.accordion;
    if (wa.error) bad.push(`Accordion 기대값을 저장소에서 읽지 못했습니다 — ${wa.error}`);
    else if (acc === undefined) notes.push("덤프에 Accordion 조사(components.accordion)가 없습니다 — 2026-10-29 k21 전 probe.js 로 만든 덤프입니다");
    else if (!acc || !acc.length) bad.push("Accordion 세트를 조사하지 못했습니다(components.accordion 비어 있음)");
    else {
      const av = (name) => Object.fromEntries(String(name).split(", ").map((kv) => kv.split("=")).filter((x) => x.length === 2).map(([k, v]) => [k.trim(), v.trim()]));
      const AX = ["Variant", "Size", "State"], key = (o) => AX.map((k) => k + "=" + (o[k] || "?")).join(", ");
      const exp = new Set(); for (const v of wa.variants) for (const z of wa.sizes) for (const s of wa.states) exp.add(key({ Variant: v, Size: z, State: s }));
      const stray = acc.filter((v) => { const o = av(v.name); return !exp.has(key(o)) || Object.keys(o).length !== AX.length; });
      const got = new Set(acc.map((v) => key(av(v.name)))), miss = [...exp].filter((k) => !got.has(k));
      if (miss.length) bad.push(`Accordion 에 없는 변형 ${miss.length}개(기대 ${exp.size}) — ${miss.slice(0, 4).join(" · ")}${miss.length > 4 ? " …" : ""}`);
      if (stray.length) bad.push(`Accordion 에 표에 없는 변형 ${stray.length}개 — ${stray.slice(0, 4).map((v) => v.name + "(" + v.id + ")").join(" · ")}${stray.length > 4 ? " …" : ""}(옛 이름 Style=Default · Flat 은 Variant 로 바꿨어야 합니다 — accordionExpect 머리 주석)`);
      if ((c.defaults || {}).Accordion !== wa.default) bad.push(`Accordion 기본 변형 ${(c.defaults || {}).Accordion} ≠ ${wa.default} — components.data.js accordion props 기본값`);
      const strokes = new Map((sets["Accordion"] || []).map((v) => [v.id, v.stroke]));
      let iconOld = false, rowOld = false; const iconHidden = [];
      if (c.accordionProps === undefined) notes.push("덤프에 Accordion 속성 정의(components.accordionProps)가 없습니다 — 2026-10-29 k22 전 probe.js 로 만든 덤프입니다");
      else {
        const ib = Object.entries(c.accordionProps || {}).find(([k, d]) => /^Icon#/.test(k) && d.type === "BOOLEAN");
        if (!ib) bad.push("Accordion 에 불리언 속성 Icon 이 없습니다(2026-10-29 k22 — 앞 아이콘)");
        else if (ib[1].def !== false) bad.push(`Accordion 속성 Icon 기본값 ${ib[1].def} ≠ false`);
        if (!Object.values(c.accordionProps || {}).some((d) => d.type === "INSTANCE_SWAP")) bad.push("Accordion 에 앞 아이콘 인스턴스 교체 속성이 없습니다(2026-10-29 k22)");
      }
      for (const v of acc) {
        const o = av(v.name), z = wa.size[o.Size], at = `Accordion ${v.name} (${v.id})`;
        if (!z || !wa.variants.includes(o.Variant) || !wa.states.includes(o.State)) continue;   // 표에 없는 변형은 위에서 냈다
        if (v.h === null) { bad.push(`${at} 헤더(이름 "Summary") 없음`); continue; }
        if (Math.abs(v.h - z.h) > 0.5) bad.push(`${at} 헤더 높이 ${v.h} ≠ ${z.h} — 사이트 ${z.css}(padding + line-height)`);
        if (v.fs !== z.fs) bad.push(`${at} 제목 크기 ${v.fs} ≠ ${z.fs} — 사이트 ${z.css}`);
        if (v.chevW === null || Math.abs(v.chevW - z.chev) > 0.5) bad.push(`${at} 셰브론 ${v.chevW} ≠ ${z.chev} — 사이트 .accordion summary::after`);
        if (v.icon === undefined) iconOld = true;
        else if (!v.icon) bad.push(`${at} 앞 아이콘(이름 "Icon") 없음 — 사이트 ${z.iconCss}`);
        else {
          const ic = v.icon, ref = ic.ref || {};
          if (Math.abs(ic.w - z.icon) > 0.5 || Math.abs(ic.h - z.icon) > 0.5) bad.push(`${at} 앞 아이콘 ${ic.w}×${ic.h} ≠ ${z.icon} — 사이트 ${z.iconCss}`);
          if (ic.idx !== 0) bad.push(`${at} 앞 아이콘이 헤더 맨 앞이 아님(순서 ${ic.idx})`);
          if (ic.ink === "override(hidden)") iconHidden.push(v.id);   // 숨긴 인스턴스의 덮어쓴 선 색은 플러그인이 읽지 못한다 — probe.js 의 Accordion 주석
          else if (ic.ink !== v.title) bad.push(`${at} 앞 아이콘 선 ${ic.ink} ≠ 제목 ${v.title} — 사이트 svg 는 currentColor`);
          if (ic.vis !== false) bad.push(`${at} 앞 아이콘이 기본으로 보임 — Icon 기본값 false 와 맞지 않습니다`);
          const pd = c.accordionProps || {};
          if (!ref.visible || !pd[ref.visible] || pd[ref.visible].type !== "BOOLEAN" || !/^Icon#/.test(ref.visible)) bad.push(`${at} 앞 아이콘 보임이 불리언 속성 Icon 에 연결되지 않음(${ref.visible || "없음"})`);
          if (!ref.mainComponent || !pd[ref.mainComponent] || pd[ref.mainComponent].type !== "INSTANCE_SWAP") bad.push(`${at} 앞 아이콘이 인스턴스 교체 속성에 연결되지 않음(${ref.mainComponent || "없음"})`);
        }
        if (v.row === undefined) rowOld = true;
        else if (!v.row) bad.push(`${at} 헤더 줄을 조사하지 못했습니다`);
        else {
          const rw = v.row;
          if (rw.lm !== "HORIZONTAL") bad.push(`${at} 헤더가 가로 자동 배치가 아님(${rw.lm}) — 사이트 .accordion summary display:flex`);
          if (rw.gap !== z.gap) bad.push(`${at} 헤더 간격 ${rw.gap} ≠ ${z.gap} — 사이트 ${z.css} gap`);
          if (rw.order !== "Icon>Title>Meta>Chevron") bad.push(`${at} 헤더 자식 순서 ${rw.order} ≠ Icon>Title>Meta>Chevron`);
          if (rw.tSz !== "FILL" || rw.tAl !== "LEFT") bad.push(`${at} 제목 ${rw.tSz}/${rw.tAl} ≠ FILL/LEFT — 제목은 아이콘 바로 뒤, 보조 정보 · 셰브론은 오른쪽 끝(사이트 margin-left:auto)`);
          if (rw.mSz === "FILL") bad.push(`${at} 보조 정보가 FILL — 셰브론 바로 앞(8)에 붙어야 합니다`);
        }
        const st = strokes.get(v.id);
        if (st !== undefined && !String(st).includes("$" + wa.stroke)) bad.push(`${at} 테두리 ${st} ≠ ${wa.stroke} — 사이트 .accordion border`);
        if (o.State === "Hover") {
          const hr = wa.hover.radius[o.Variant];
          if (v.face !== "$" + wa.hover.face) bad.push(`${at} Hover 헤더 면 ${v.face} ≠ ${wa.hover.face} — 사이트 .accordion summary:hover`);
          if (!v.r || v.r.some((x) => Math.abs(x - hr.px) > 0.01)) bad.push(`${at} Hover 헤더 모서리 ${JSON.stringify(v.r)} ≠ ${hr.px} — 둥근 테두리 안쪽(${o.Variant === "Flat" ? ".accordion.flat summary" : ".accordion summary"} border-radius)`);
          if (hr.tok && v.rv !== hr.tok) bad.push(`${at} Hover 헤더 모서리가 ${hr.tok} 에 묶이지 않음(${v.rv || "값만"})`);
        } else if (v.face !== "-") bad.push(`${at} 헤더 면 ${v.face} — Hover 가 아닌 헤더는 면이 없습니다(사이트 .accordion summary)`);
        if (o.State === "Disabled") {
          if (v.title !== "$" + wa.disabled.ink) bad.push(`${at} 제목 ${v.title} ≠ ${wa.disabled.ink} — 사이트 .accordion.disabled summary`);
          if (v.meta !== null && v.meta !== "$" + wa.disabled.ink) bad.push(`${at} 보조 정보 ${v.meta} ≠ ${wa.disabled.ink} — 사이트 .accordion.disabled summary small`);
          if (v.chev !== "$" + wa.disabled.chev) bad.push(`${at} 셰브론 ${v.chev} ≠ ${wa.disabled.chev} — 사이트 .accordion.disabled summary::after`);
        } else {
          if (v.title === "$" + wa.disabled.ink) bad.push(`${at} 제목이 비활성 색(${wa.disabled.ink}) — Disabled 가 아닙니다`);
          if (v.meta !== null && v.meta !== "$" + wa.normal.meta) bad.push(`${at} 보조 정보 ${v.meta} ≠ ${wa.normal.meta} — 사이트 .accordion summary small`);
          if (v.chev !== "$" + wa.normal.chev) bad.push(`${at} 셰브론 ${v.chev} ≠ ${wa.normal.chev} — 사이트 .accordion summary::after`);
        }
      }
      if (iconHidden.length) notes.push(`Accordion 앞 아이콘 ${iconHidden.length}개는 숨긴 채 선 색을 덮어써 플러그인이 값을 읽지 못합니다(${iconHidden.slice(0, 3).join(" · ")}${iconHidden.length > 3 ? " …" : ""}) — 켜서 확인해야 합니다(2026-10-29 k22 에 켜서 잼: Disabled 6개 foreground/disable/primary = 제목)`);
      if (iconOld) notes.push("덤프의 Accordion 변형에 앞 아이콘 조사(icon)가 없습니다 — 2026-10-29 k22 전 probe.js 로 만든 덤프입니다");
      if (rowOld) notes.push("덤프의 Accordion 변형에 헤더 줄 조사(row)가 없습니다 — 2026-10-30 k24 전 probe.js 로 만든 덤프입니다");
    }
  }
  /* Breadcrumb(2026-10-30 k25 · 2026-11-02 k26) — 규칙은 breadcrumbExpect 머리 주석. probe 의 components.breadcrumb(행 세트 하나 — Type × State)로 본다.
     components.breadcrumbItem 이 있으면 k25 의 항목 세트가 남은 것이라 어긋남(상태는 Breadcrumb 의 State 축에 — 사람의 결정 2026-11-02).
     옛 probe 덤프 — k25 전에는 두 필드가 없고, k26 전에는 항목 글자 정보(tx) · 고리(ring)가 없다(out.k26 없음) — 그때는 NOTE 로만 알린다 */
  {
    const wb = want.breadcrumb, bc = c.breadcrumb, bi = c.breadcrumbItem;
    const ax = (name) => Object.fromEntries(String(name).split(", ").map((kv) => kv.split("=")).filter((x) => x.length === 2).map(([k, v]) => [k.trim(), v.trim()]));
    const W = { Thin: 100, Light: 300, DemiLight: 350, Regular: 400, Medium: 500, SemiBold: 600, Bold: 700, Black: 900 };
    if (wb.error) bad.push(`Breadcrumb 기대값을 저장소에서 읽지 못했습니다 — ${wb.error}`);
    else if (bc === undefined) notes.push("덤프에 Breadcrumb 조사(components.breadcrumb)가 없습니다 — 2026-10-30 k25 전 probe.js 로 만든 덤프입니다");
    else if (bc && !bc.k26) notes.push("덤프의 Breadcrumb 조사가 2026-11-02 k26 전 probe.js 로 만든 것입니다(항목 글자 정보 · 고리 없음) — Type × State 대조를 하지 않았습니다. probe.js 를 다시 돌리세요");
    else {
      if (bi) bad.push(`Breadcrumb Item 세트${bi.id ? "(" + bi.id + ")" : ""}가 남아 있습니다(변형 ${(bi.variants || []).length}개) — 상태는 Breadcrumb 세트의 State 축(${wb.axis.join(" · ")})에 둡니다(사람의 결정 2026-11-02 k26). 인스턴스 수를 세어 0 이면 지우세요`);
      if (!bc) bad.push("Breadcrumb 세트가 없습니다");
      else {
        const vs = bc.variants || [];
        const lo = (x) => String(x).toLowerCase();
        const sDef = wb.axis[0], sHover = wb.axis.find((x) => lo(x) === "hover"), sFocus = wb.axis.find((x) => lo(x) === "focus");
        const ok = (o) => Object.keys(o).length === 2 && wb.variants.includes(o.Type) && wb.axis.includes(o.State);
        const key = (t, st) => `Type=${t}, State=${st}`;
        const table = wb.variants.flatMap((t) => wb.axis.map((st) => key(t, st)));
        const have = new Map(), dup = [];
        for (const v of vs) { const o = ax(v.name); if (!ok(o)) continue; const k = key(o.Type, o.State); if (have.has(k)) dup.push(v.name + "(" + v.id + ")"); else have.set(k, v); }
        const miss = table.filter((k) => !have.has(k)), stray = vs.filter((v) => !ok(ax(v.name)));
        if (miss.length) bad.push(`Breadcrumb 에 없는 변형 ${miss.length}개 — ${miss.join(" · ")}(components.data.js breadcrumb.figma.variants × states — current 는 축이 아니라 마지막 항목)`);
        if (stray.length) bad.push(`Breadcrumb 에 표에 없는 변형 ${stray.length}개 — ${stray.map((v) => v.name + "(" + v.id + ")").join(" · ")}(Type = ${wb.variants.join(" · ")} × State = ${wb.axis.join(" · ")} 만)`);
        if (dup.length) bad.push(`Breadcrumb 에 이름이 겹치는 변형 — ${dup.join(" · ")}`);
        if (bc.def !== wb.default) bad.push(`Breadcrumb 기본 변형 ${bc.def} ≠ ${wb.default}`);
        if (vs.some((v) => (v.kids || []).some((k) => k.set === "Breadcrumb Item"))) bad.push("Breadcrumb 변형 안에 Breadcrumb Item 인스턴스가 있습니다 — k26 부터 항목 세트를 쓰지 않습니다");
        /* 변형마다 항목 · 구분자 · 받는 항목을 풀어 둔다 — State=Default 와 견줄 때 다시 쓴다 */
        const parse = (v) => {
          const ks = v.kids || [], items = ks.filter((_, i) => i % 2 === 0), seps = ks.filter((_, i) => i % 2 === 1);
          const more = items.filter((k) => k.icon && k.icon.name === wb.more.icon);
          const o = ax(v.name);
          const target = o.Type === "Collapsed" ? more[0] || null : items.slice(1, -1).find((k) => k.tx) || null;
          return { o, ks, items, seps, more, target, ti: target ? ks.indexOf(target) : -1 };
        };
        const sig = (k) => JSON.stringify([k.n, k.t, Math.round(k.w), Math.round(k.h), k.icon ? [k.icon.name, k.icon.w, k.icon.h, k.icon.ink] : null, k.tx ? [k.tx.fill, k.tx.deco, k.tx.font, k.tx.fs, k.tx.lh] : null]);
        for (const [nm, v] of have) {
          const P = parse(v), { o, ks, items, seps, more, target } = P, at = `Breadcrumb ${v.name} (${v.id})`;
          if (Math.abs(v.h - wb.h) > 0.5) bad.push(`${at} 높이 ${v.h} ≠ ${wb.h} — 사이트 .breadcrumb min-height(한 크기)`);
          if (v.lm !== "HORIZONTAL") bad.push(`${at} 가로 자동 배치가 아님(${v.lm}) — 사이트 .breadcrumb display:flex`);
          if (v.gap !== wb.gap) bad.push(`${at} 간격 ${v.gap} ≠ ${wb.gap} — 사이트 .breadcrumb · li gap`);
          if (v.ca !== "CENTER") bad.push(`${at} 세로 정렬 ${v.ca} ≠ CENTER — 사이트 align-items:center`);
          const first = ks[0];
          if (!first || !first.icon || first.icon.name !== wb.home.icon) bad.push(`${at} 첫 자식이 홈 아이콘(${wb.home.icon})이 아님 — ${first ? first.n + (first.icon ? "(" + first.icon.name + ")" : first.text ? '(글자)' : "") : "자식 없음"}. 경로는 언제나 홈 아이콘으로 시작합니다(사이트 default 예제 첫 li)`);
          else {
            if (Math.abs(first.icon.w - wb.home.size) > 0.5 || Math.abs(first.icon.h - wb.home.size) > 0.5) bad.push(`${at} 홈 아이콘 ${first.icon.w}×${first.icon.h} ≠ ${wb.home.size}`);
            if (first.icon.ink !== "$" + wb.label) bad.push(`${at} 홈 아이콘 색 ${first.icon.ink} ≠ ${wb.label} — 링크 색(.breadcrumb li color)`);
          }
          if (ks.length % 2 !== 1) bad.push(`${at} 자식 수 ${ks.length} — 항목과 구분자가 번갈아 와야 합니다(항목으로 시작 · 끝)`);
          for (const s of seps) {
            if (!s.icon || s.icon.name !== wb.sep.icon || s.set === "Breadcrumb Item") { bad.push(`${at} 항목 사이 ${s.n} 가 구분자(${wb.sep.icon})가 아님${s.icon ? " — " + s.icon.name : ""}(사이트 li+li::before)`); continue; }
            if (Math.abs(s.icon.w - wb.sep.w) > 0.5 || Math.abs(s.icon.h - wb.sep.h) > 0.5) bad.push(`${at} 구분자 ${s.icon.w}×${s.icon.h} ≠ ${wb.sep.w}×${wb.sep.h}`);
            if (s.icon.ink !== "$" + wb.sep.tok) bad.push(`${at} 구분자 색 ${s.icon.ink} ≠ ${wb.sep.tok}`);
          }
          /* 글자 항목 공통 — 크기 · 행간 · 서체(Body/2) */
          const weightOk = (k, ww, what) => {
            const t = k.tx, fam = /^(Pretendard|Noto Sans KR)\b/.exec(t.font), wt = W[String(t.font).split(" ").pop()];
            if (!fam) bad.push(`${at} ${what} ${k.n} 서체 ${t.font}`);
            if (wt !== ww) { if (fam && fam[1] === "Noto Sans KR" && ww === 600 && wt === 700) notes.push(`${at} ${what} 굵기 600 이 Noto Sans KR Bold(700)로 대체돼 있습니다 — 이 환경의 Noto 에 SemiBold 가 없음(되돌릴 목록 _figma/font-revert.md k25 · k26)`); else bad.push(`${at} ${what} ${k.n} 굵기 ${wt} ≠ ${ww}(${t.font})`); }
          };
          for (const k of items) if (k.tx && (k.tx.fs !== wb.fs || k.tx.lh !== wb.lh)) bad.push(`${at} ${k.n} 글자 ${k.tx.fs}/${k.tx.lh} ≠ ${wb.fs}/${wb.lh} — 사이트 .breadcrumb font-size · line-height(2026-11-02 k27 부터 13/22 — 타이포 단계 밖이라 텍스트 스타일에 연결하지 않음)`);
          /* 마지막 항목 = 현재 페이지(current 는 축이 아니라 마지막 항목 — k26) */
          const last = items[items.length - 1];
          if (!last || !last.tx) bad.push(`${at} 마지막 항목이 현재 페이지 글자가 아님 — ${last ? last.n : "없음"}(모든 변형의 마지막 항목이 현재 페이지입니다)`);
          else {
            if (last.tx.fill !== "$" + wb.current.tok) bad.push(`${at} 마지막 항목(현재 페이지) 글자 ${last.tx.fill} ≠ ${wb.current.tok} — 사이트 .breadcrumb li[aria-current]`);
            if (last.tx.deco !== "NONE") bad.push(`${at} 마지막 항목(현재 페이지)에 밑줄 ${last.tx.deco} — 현재 페이지는 링크가 아닙니다`);
            weightOk(last, wb.current.weight, "마지막 항목(현재 페이지)");
          }
          /* 가운데 항목 — 링크 · 페이지 없는 단계 모두 링크 색 · 기본 굵기(받는 항목의 Hover 는 아래에서) */
          for (const k of items.slice(1, -1)) {
            if (!k.tx) continue;
            const hov = o.State === sHover && k === target;
            const ink = hov ? wb.hover : wb.label;
            if (k.tx.fill !== "$" + ink) bad.push(`${at} 상위 항목 ${k.n} 글자 ${k.tx.fill} ≠ ${ink} — 사이트 ${hov ? ".breadcrumb a:hover" : ".breadcrumb li(링크 · 페이지 없는 단계 모두)"}`);
            const deco = hov && wb.underline ? "UNDERLINE" : "NONE";
            if (k.tx.deco !== deco) bad.push(`${at} 상위 항목 ${k.n} 밑줄 ${k.tx.deco} ≠ ${deco}${hov ? " — 사이트 .breadcrumb a:hover" : ""}`);
            weightOk(k, wb.weight, "상위 항목");
          }
          for (const k of more) {
            const hov = o.State === sHover && k === target, ink = hov ? wb.more.hover : wb.more.tok;
            if (Math.abs(k.icon.w - wb.more.size) > 0.5 || Math.abs(k.icon.h - wb.more.size) > 0.5) bad.push(`${at} … 아이콘 ${k.icon.w}×${k.icon.h} ≠ ${wb.more.size}`);
            if (k.icon.ink !== "$" + ink) bad.push(`${at} … 아이콘 색 ${k.icon.ink} ≠ ${ink} — 사이트 ${hov ? ".breadcrumb .more:hover" : ".breadcrumb .more"}`);
          }
          if (o.Type === "Collapsed") { if (items.length !== 4 || items[1] !== more[0]) bad.push(`${at} 접힌 행은 홈 + …(${wb.more.icon}) + 끝 2개여야 합니다 — 항목 ${items.map((k) => k.icon ? k.icon.name : k.n).join(" · ")}`); }
          else if (more.length) bad.push(`${at} 접히지 않은 행에 …(${wb.more.icon})가 있습니다`);
          /* 받는 항목 · 고리 — Focus 의 받는 항목에만 고리, 나머지 어디에도 없음 */
          if (!target) bad.push(`${at} Hover · Focus 를 받을 항목이 없습니다 — ${o.Type === "Collapsed" ? "…(" + wb.more.icon + ") 버튼" : "홈 다음 첫 글자 항목(첫 상위 링크)"}`);
          for (const k of ks) {
            if (!k.ring) continue;
            if (!(o.State === sFocus && k === target)) bad.push(`${at} ${k.n} 에 Focus Ring 이 있습니다 — 고리는 State=${sFocus} 의 받는 항목에만`);
          }
          if (o.State === sFocus && target) {
            const f = wb.focus, g = target.ring;
            if (!g) bad.push(`${at} 받는 항목 ${target.n} 에 Focus Ring 이 없습니다 — 사이트 :focus-visible outline ${f.width}px ${f.tok} · offset ${f.offset}`);
            else {
              if (g.vis === false) bad.push(`${at} ${target.n} 의 Focus Ring 이 숨겨져 있습니다`);
              if (g.stroke !== "$" + f.tok || g.sw !== f.width || g.align !== "OUTSIDE") bad.push(`${at} 고리 선 ${g.stroke} · ${g.sw}px · ${g.align} ≠ ${f.tok} · ${f.width}px · OUTSIDE`);
              if (g.fill !== "-") bad.push(`${at} 고리에 면 ${g.fill}`);
              const e = { dx: -f.offset, dy: -f.offset, w: +(target.w + 2 * f.offset).toFixed(2), h: +(target.h + 2 * f.offset).toFixed(2) };
              if (Math.abs(g.dx - e.dx) > 0.5 || Math.abs(g.dy - e.dy) > 0.5 || Math.abs(g.w - e.w) > 0.5 || Math.abs(g.h - e.h) > 0.5) bad.push(`${at} 고리 자리 ${g.dx},${g.dy} · ${g.w}×${g.h} ≠ ${e.dx},${e.dy} · ${e.w}×${e.h}(항목 칸에서 offset ${f.offset})`);
            }
          }
          /* 나머지는 Default 와 같음 — 같은 Type 의 State=Default 와 자식을 하나씩 견준다(받는 항목 · 고리는 위에서 봤다) */
          if (o.State !== sDef) {
            const base = have.get(key(o.Type, sDef));
            if (base) {
              const B = parse(base);
              if (B.ks.length !== ks.length) bad.push(`${at} 자식 수 ${ks.length} ≠ State=${sDef} ${B.ks.length} — 상태는 받는 항목 하나만 바꿉니다`);
              else {
                if (P.ti !== B.ti) bad.push(`${at} 받는 항목 자리 ${P.ti} ≠ State=${sDef} ${B.ti}`);
                const diff = ks.map((k, i) => (i !== P.ti && sig(k) !== sig(B.ks[i]) ? k.n + "#" + i : null)).filter(Boolean);
                if (diff.length) bad.push(`${at} 받는 항목 말고도 State=${sDef} 와 다른 자식 — ${diff.join(" · ")}(Hover · Focus 는 항목 하나에만 걸립니다)`);
              }
            }
          }
        }
      }
    }
  }
  /* Button Loading(2026-10-28 k17) — 사이트는 .btn.loading{color:transparent} 로 라벨 · 아이콘(currentColor)을 지우되 자리는 지키고, ::after 스피너만 가운데 보인다.
     probe 의 components.btnLoading 으로 본다: 폭 · 높이가 같은 이름의 Loading=False 와 같은지(±0.5), 스피너("Spinner")가 절대 배치 · 가운데(±0.5) · 사이트 크기인지,
     스피너 선 색이 윗변 색 규칙(buttonExpect 의 SPIN)과 같은지, 스피너 말고 보이는 층이 없는지(leak — 글자는 칠, 나머지는 층 불투명도로 본다.
     visible 은 보지 않는다 — Icon Left · Icon Right 는 인스턴스에서 속성으로 켜질 수 있다) */
  if (c.btnLoading !== undefined) {
    const we = want.button;
    if (!c.btnLoading || !c.btnLoading.length) bad.push("Button 세트에 Loading 변형이 없어 Loading 모양을 대조하지 못했습니다");
    else if (!we.error) for (const L of c.btnLoading) {
      const o = Object.fromEntries(String(L.name).split(", ").map((kv) => kv.split("=")).filter((x) => x.length === 2).map(([k, v]) => [k.trim(), v.trim()]));
      const e = we[o.Variant + "/" + o.Color]; if (!e) continue;
      const w = e.Loading, at = `Button Loading ${L.name} (${L.id})`;
      if (L.sibW === null) bad.push(`${at} 짝(Loading=False) 변형이 없어 폭을 대조하지 못했습니다`);
      else if (Math.abs(L.w - L.sibW) > 0.5 || Math.abs(L.h - L.sibH) > 0.5) bad.push(`${at} 크기 ${L.w}×${L.h} ≠ Loading=False ${L.sibW}×${L.sibH} — 사이트는 라벨 자리를 지킨다(.btn.loading color:transparent)`);
      const sp = L.spinner;
      if (!sp) { bad.push(`${at} 스피너(이름 "Spinner") 없음 — 사이트 ${w.spinCss}`); continue; }
      if (sp.abs !== "ABSOLUTE" || Math.abs(sp.dx) > 0.5 || Math.abs(sp.dy) > 0.5) bad.push(`${at} 스피너가 가운데 절대 배치가 아님(${sp.abs} · 중심 어긋남 ${sp.dx}, ${sp.dy})`);
      if (Math.abs(sp.w - w.spinSize) > 0.5 || Math.abs(sp.h - w.spinSize) > 0.5) bad.push(`${at} 스피너 ${sp.w}×${sp.h} ≠ ${w.spinSize} — 사이트 .btn.loading::after`);
      if (sp.stroke !== "$" + w.spin) bad.push(`${at} 스피너 선 ${sp.stroke} ≠ ${w.spin} — 사이트 ${w.spinCss}`);
      if (L.leak && L.leak.length) bad.push(`${at} 스피너 말고 보이는 층 ${L.leak.join(" · ")} — 사이트는 라벨 · 아이콘을 투명하게 둔다`);
    }
  }
  /* 비활성을 opacity 로 흐리는 것은 버튼만의 문제가 아니다 — 조사하는 세트 전부에서 본다(모든 컴포넌트로 넓힌 검사는 아래 "반투명 컴포넌트") */
  const dimmed = new Set();
  for (const [set, vs] of Object.entries(sets)) {
    if (set === "Button") continue;
    for (const v of vs) if (/Disabled/.test(v.name) && v.opacity !== undefined && v.opacity < 1) { dimmed.add(v.id); bad.push(`${set} Disabled 를 opacity ${v.opacity} 로 흐림 — ${v.name} (${v.id})`); }
  }
  for (const v of sets.Button || []) if (/Disabled/.test(v.name) && v.opacity !== undefined && v.opacity < 1) dimmed.add(v.id);   // Button 은 아래 Button 검사가 낸다
  /* 이름 전체를 훑으면 Size=Medium 을 Medium 톤으로 읽는다 — 속성 값을 직접 읽는다 */
  const prop = (name, k) => { const m = new RegExp("(?:^|, )" + k + "=([^,]+)").exec(name); return m ? m[1].trim() : null; };
  /* Tag 변형 표(2026-11-09 k42) — figma.variants 의 톤 × states × sizes 가 모두 있어야 한다(severityExpect). 없으면 그 톤의 칠 대조가 소리 없이 빠진다 */
  if (sets["Tag"]) {
    const T = want.tag, got = new Set(sets["Tag"].map((v) => ["Tone", "Style", "Size"].map((k) => prop(v.name, k)).join("|"))), miss = [];
    for (const t of T.names) for (const s of T.styles) for (const z of T.sizes) if (!got.has(`${t}|${s}|${z}`)) miss.push(`Tone=${t}, Style=${s}, Size=${z}`);
    if (miss.length) bad.push(`Tag 에 없는 변형 ${miss.length}개 — ${miss.slice(0, 6).join(" · ")}${miss.length > 6 ? " …" : ""}(components.data.js tag.figma.variants ${T.names.join(" · ")} × ${T.styles.join(" · ")} × ${T.sizes.join(" · ")})`);
    for (const n of T.notes || []) notes.push(n);
  }
  for (const v of sets["Tag"] || []) {
    const tone = prop(v.name, "Tone"), style = prop(v.name, "Style");
    if (!tone || (style && style !== "Subtle")) continue;   // Outline·Solid 는 바탕 규칙이 달라 여기서 보지 않는다
    const w = want.tag.face[tone.toLowerCase()];
    if (!w) { bad.push(`Tag 톤 ${tone} 은 저장소에 없습니다 — ${v.name} (${v.id})`); continue; }
    if (!v.fill.includes("$" + w)) bad.push(`Tag ${tone} 바탕 ${v.fill} ≠ ${w} — ${v.name} (${v.id})`);
    if (v.text && !v.text.includes("$" + want.tag.label)) bad.push(`Tag ${tone} 라벨 ${v.text} ≠ ${want.tag.label} — ${v.name} (${v.id})`);
  }
  const has$ = (got, w) => (w === null ? true : w === "-" ? got === "-" : !!got && got.includes("$" + w));
  for (const v of sets["Tag"] || []) {
    const tone = (prop(v.name, "Tone") || "").toLowerCase(), style = prop(v.name, "Style"), w = want.tagStyle.tones[tone];
    if (!w) continue;
    if (style === "Subtle" && v.dot && !has$(v.dot, w.dot)) bad.push(`Tag ${tone} 점 ${v.dot} ≠ ${w.dot} — ${v.name} (${v.id})`);
    if (style === "Outline") {
      if (v.fill !== "-") bad.push(`Tag Outline 면이 있음 ${v.fill} — ${v.name} (${v.id})`);
      if (!has$(v.stroke, want.tagStyle.outline.stroke)) bad.push(`Tag Outline 보더 ${v.stroke} ≠ ${want.tagStyle.outline.stroke} — ${v.name} (${v.id})`);
      if (v.text && !has$(v.text, want.tag.label)) bad.push(`Tag Outline 라벨 ${v.text} ≠ ${want.tag.label} — ${v.name} (${v.id})`);
      if (v.dot && !has$(v.dot, w.dot)) bad.push(`Tag Outline 점 ${v.dot} ≠ ${w.dot} — ${v.name} (${v.id})`);
    }
    if (style === "Solid") {
      const s = w.solid;
      if (!has$(v.fill, s.fill)) bad.push(`Tag Solid 면 ${v.fill} ≠ ${s.fill} — ${v.name} (${v.id})`);
      if (s.stroke ? !has$(v.stroke, s.stroke) : v.stroke !== "-") bad.push(`Tag Solid 보더 ${v.stroke} ≠ ${s.stroke || "없음"} — ${v.name} (${v.id})`);
      if (v.text && !has$(v.text, s.label)) bad.push(`Tag Solid 라벨 ${v.text} ≠ ${s.label} — ${v.name} (${v.id})`);
      if (v.dot && !has$(v.dot, s.dot)) bad.push(`Tag Solid 점 ${v.dot} ≠ ${s.dot} — ${v.name} (${v.id})`);
    }
  }
  for (const v of sets["KPI"] || []) {
    const w = want.kpiValue[prop(v.name, "Tone")], val = (v.texts || []).find((t) => /value/i.test(t.split("=")[0]));
    if (w && val && !has$(val.slice(val.indexOf("=") + 1), w)) bad.push(`KPI 값 ${val} ≠ ${w} — ${v.name} (${v.id})`);
  }
  for (const v of sets["Banner"] || []) {
    const w = want.banner[prop(v.name, "Tone")];
    if (!w) continue;
    if (!has$(v.fill, w.fill)) bad.push(`Banner ${prop(v.name, "Tone")} 바탕 ${v.fill} ≠ ${w.fill} (${v.id})`);
    if (v.text && !has$(v.text, w.label)) bad.push(`Banner ${prop(v.name, "Tone")} 글자 ${v.text} ≠ ${w.label} (${v.id})`);
  }
  for (const v of sets["Menu Item"] || []) {
    const type = prop(v.name, "Type"), st = prop(v.name, "State");
    const w = type === "Selected" && st !== "Disabled" ? want.menuItem.selected : st === "Hover" ? want.menuItem.hover : null;   // .on 이 :hover 뒤에 있어 선택 항목은 hover 에도 brand-subtle
    if (w && !has$(v.fill, w)) bad.push(`Menu Item ${type} ${st} 면 ${v.fill} ≠ ${w} (${v.id})`);
  }
  for (const v of sets["Tab Item"] || []) {
    const w = prop(v.name, "State") === "Selected" ? want.tabCount.on : want.tabCount.base;   // 선택 탭의 배지는 .tabs .tab.on .count 를 따로 갖는다
    if (v.count && !has$(v.count, w)) bad.push(`Tab count 배지 ${v.count} ≠ ${w} — ${v.name} (${v.id})`);
  }
  for (const v of sets["Count"] || []) {
    const tone = prop(v.name, "Tone"), w = want.countBadge[tone]; if (!w) continue;
    if (!has$(v.fill, w.fill)) bad.push(`Count ${tone} 면 ${v.fill} ≠ ${w.fill} (${v.id})`);
    if (w.text && v.text && !has$(v.text, w.text)) bad.push(`Count ${tone} 숫자 ${v.text} ≠ ${w.text} (${v.id})`);
  }
  const si = sets["Status Indicator"] || [];
  for (const v of si) { const tone = prop(v.name, "Tone"), w = want.statusDot[tone]; if (w && v.dot && !has$(v.dot, w)) bad.push(`Status Indicator ${tone} 점 ${v.dot} ≠ ${w} (${v.id})`); }
  if (si.length && !si.some((v) => /Pulse=On/.test(v.name))) bad.push("Status Indicator 에 Pulse=On 변형이 없습니다(.indicator.pulse)");
  for (const v of sets["Step"] || []) {
    const st = prop(v.name, "State"), w = want.step[st]; if (!w) continue;
    for (const k of ["circle", "check", "number", "label"]) if (w[k] && v[k] !== undefined && !has$(v[k], w[k])) bad.push(`Step ${st} ${k} ${v[k]} ≠ ${w[k]} (${v.id})`);
  }
  const ni = sets["Navigation Item"] || [];
  for (const v of ni) {
    const type = prop(v.name, "Type"), st = prop(v.name, "State"), w = want.navItem, tag = `Navigation Item ${type} ${st}`;
    if (st === "Hover" && !has$(v.fill, w.hover)) bad.push(`${tag} 면 ${v.fill} ≠ ${w.hover} (${v.id})`);
    if (st === "Pressed" && !has$(v.fill, w.pressed)) bad.push(`${tag} 면 ${v.fill} ≠ ${w.pressed} (${v.id})`);
    if (st === "Selected") {
      if (!has$(v.fill, w.selected.fill)) bad.push(`${tag} 면 ${v.fill} ≠ ${w.selected.fill} (${v.id})`);
      const lw = type === "Sub" ? w.sub.selected : w.selected.label;
      if (v.label && !has$(v.label, lw)) bad.push(`${tag} 글자 ${v.label} ≠ ${lw} (${v.id})`);
      if (v.icon && !has$(v.icon, w.selected.icon)) bad.push(`${tag} 아이콘 ${v.icon} ≠ ${w.selected.icon} (${v.id})`);
    } else {
      const lw = type === "Sub" ? w.sub.label : w.base.label;
      if (v.label && !has$(v.label, lw)) bad.push(`${tag} 글자 ${v.label} ≠ ${lw} (${v.id})`);
      if (v.icon && !has$(v.icon, w.base.icon)) bad.push(`${tag} 아이콘 ${v.icon} ≠ ${w.base.icon} (${v.id})`);
    }
    if (v.countInstance === false) bad.push(`${tag} 건수가 Count 인스턴스가 아닙니다 — 톤을 고를 수 없다 (${v.id})`);   // React countTone
  }
  if (ni.length && !ni.some((v) => prop(v.name, "State") === "Pressed")) bad.push("Navigation Item 에 State=Pressed 변형이 없습니다(.sidenav a:active)");
  /* 컨테이너가 항목 인스턴스로 짜였는지 · 접힌 내비의 빈 칸 */
  for (const nm of ["Navigation", "Steps"]) for (const v of sets[nm] || []) {
    const it = v.items; if (!it) continue;
    if (it.raw > 0 || it.inst === 0) bad.push(`${nm} 가 항목 인스턴스로 짜이지 않았습니다 — 복제본 ${it.raw} · 인스턴스 ${it.inst} (${v.name}, ${v.id})`);
    if (it.empty > 0) bad.push(`${nm} 에 빈 칸 프레임 ${it.empty}개 (${v.name}, ${v.id})`);
  }
  /* 컨테이너 내용 — 사이트 예제와 순서 · 라벨 · 상태 · 아이콘. Figma 글자를 고쳐 맞추지 않는다: 다르면 실패로 남겨 사람이 고른다 */
  const seqDiff = (where, v, site, fig, fmt) => {
    const n = Math.max(site.length, fig.length);
    for (let i = 0; i < n; i++) {
      const a = site[i] ? fmt(site[i]) : "없음", b = fig[i] ? fmt(fig[i]) : "없음";
      if (a !== b) bad.push(`${where} 항목 ${i + 1}: 저장소 [${a}] ≠ Figma [${b}] (${v.name}, ${v.id})`);
    }
  };
  for (const v of sets["Steps"] || []) {
    if (!v.itemsList) { notes.push("덤프에 컨테이너 항목 목록이 없습니다 — 2026-10-23 k 이전 probe.js 로 만든 덤프입니다"); break; }
    const fig = v.itemsList.filter((x) => x.item).map((x) => ({ state: x.item.replace(/^.*State=/, ""), mark: x.icon || x.number, label: x.label }));
    seqDiff("Steps", v, want.stepsItems, fig, (x) => `${x.state} · ${x.mark} · ${x.label}`);
  }
  const navFmt = (x) => x.kind === "item" ? `${x.type}${x.state === "Selected" ? "·선택" : ""} · ${x.icon || "아이콘 없음"} · ${x.label}${x.count ? " · 건수 " + x.count : ""}` : `${x.kind === "group" ? "그룹" : "foot"} · ${x.label}`;
  let geoErr = null, geoNote = false;
  for (const v of sets["Navigation"] || []) {
    if (!v.itemsList) break;
    const collapsed = /State=Collapsed/.test(v.name);
    if (!collapsed && !/State=Expanded/.test(v.name)) continue;
    const fig = v.itemsList.filter((x) => x.item || x.group || x.foot).map((x) => x.group ? { kind: "group", label: x.group } : x.foot ? { kind: "foot", label: x.foot }
      : { kind: "item", type: prop(x.item, "Type"), state: prop(x.item, "State"), icon: x.icon, label: collapsed ? x.labelProp : x.label, count: x.count });   // 접힌 레일은 라벨 글자가 없다 — Label 속성 값(사이트의 숨은 span · title)
    seqDiff("Navigation", v, collapsed ? want.navCollapsed : want.navItems, fig, navFmt);
    /* 기하(2026-10-26 k3) — 사이트 실측과 ±0.5. 항목은 칸의 y · 높이, 그룹은 바깥 여백까지 친 칸(margin box: y − margin-top,
       높이 + margin-top + margin-bottom)과 글자 가운데, foot 은 레일 아래 끝에서 글자 아래 끝까지의 거리(margin-top:auto 로 아래에 붙는지).
       Figma 글자 상자는 텍스트 스타일 행간(Label/2 16 · Title/2 20)이라 사이트 줄 상자(행간 1.6)와 높이가 다를 수 있어 그룹은 가운데로 본다.
       레일 높이(560)는 화면 높이를 나타내는 값으로 두기로 했다(사람의 결정 2026-10-26) — 보지 않는다 */
    const geo = want.navGeo;
    if (!geo) continue;
    const list = v.itemsList.filter((x) => x.item || x.group || x.foot);
    if (list.some((x) => x.y === undefined)) { geoNote = true; continue; }
    if (geo.error) { geoErr = geo.error; continue; }
    const site = (collapsed ? geo.collapsed : geo.basic).kids.filter((k) => k.kind !== "other");
    if (site.length !== list.length) continue;   // 항목 수가 다르면 위 seqDiff 가 이미 어긋남으로 냈다
    const r2 = (x) => +x.toFixed(2), off = (a, b) => Math.abs(a - b) > 0.5;
    const rail = v.box ? v.box.h : null;
    for (const [i, x] of list.entries()) {
      const s = site[i], nm = x.group || x.foot || x.labelProp || x.label, at = `(${v.name}, ${v.id})`;
      const kind = x.group ? "group" : x.foot ? "foot" : "item";
      if (s.kind !== kind) continue;   // 종류가 다르면 seqDiff 가 냈다
      if (kind === "item") {
        if (off(x.y, s.y) || off(x.h, s.h)) bad.push(`Navigation 항목 ${i + 1} 칸 y ${r2(x.y)} · 높이 ${r2(x.h)} ≠ 사이트 실측 ${r2(s.y)} · ${r2(s.h)} — ${nm} ${at}`);
      } else if (kind === "group") {
        const my = s.y - s.mt, mh = s.h + s.mt + s.mb, fc = x.ty + x.th / 2, sc = s.y + s.h / 2;
        if (off(x.y, my) || off(x.h, mh)) bad.push(`Navigation 그룹 ${i + 1} 칸(바깥 여백 포함) y ${r2(x.y)} · 높이 ${r2(x.h)} ≠ 사이트 실측 ${r2(my)} · ${r2(mh)} — ${nm} ${at}`);
        if (off(fc, sc)) bad.push(`Navigation 그룹 ${i + 1} 글자 가운데 ${r2(fc)} ≠ 사이트 실측 ${r2(sc)} — ${nm} ${at}`);
      } else if (rail !== null) {
        const fb = rail - (x.ty + x.th), sb = geo.basic.padBottom + s.pb;
        if (off(fb, sb)) bad.push(`Navigation foot 글자 아래 끝이 레일 아래에서 ${r2(fb)} ≠ 사이트 ${r2(sb)}(레일 padding ${geo.basic.padBottom} + foot padding ${s.pb}) — 아래에 붙지 않았습니다 ${at}`);
      }
    }
  }
  if (geoErr) bad.push(`내비 기하를 사이트와 대조하지 못했습니다 — ${geoErr}`);
  if (geoNote) notes.push("덤프에 컨테이너 기하(y · 높이)가 없습니다 — 2026-10-26 k3 전 probe.js 로 만든 덤프입니다");
  /* 컨테이너 항목의 아이콘 색 — Navigation Item 은 기본 · 선택 아이콘 색, Steps 는 Done 체크 색. 아이콘을 바꿔 끼운 인스턴스에서
     이름이 다른 층(list 의 점 3개 등)이 아이콘 원본 색으로 남았다(2026-10-23 k2) — 원본 변형만 봐서는 못 잡는다 */
  for (const [nm, exp] of [["Navigation", (x) => (prop(x.item, "State") === "Selected" ? want.navItem.selected.icon : want.navItem.base.icon)], ["Steps", (x) => (want.step[prop(x.item, "State")] || {}).check]]) {
    for (const v of sets[nm] || []) for (const [i, x] of (v.itemsList || []).entries()) {
      if (!x.item || !x.iconPaints) continue;
      const w = exp(x); if (!w) continue;
      if (x.iconPaints !== "$" + w) bad.push(`${nm} 항목 ${i + 1} 아이콘 색 ${x.iconPaints} ≠ ${w} — ${x.labelProp || x.label} (${v.name}, ${v.id})`);
    }
  }
  /* 도넛 호 각도 — CSS 정지점과 ±0.5° · 색 */
  for (const v of sets["Chart Card"] || []) {
    if (!v.donutArcs) continue;
    const ang = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
    if (v.donutArcs.length !== want.donutArcs.length) bad.push(`Donut 호 ${v.donutArcs.length}개 ≠ ${want.donutArcs.length}개(.donut conic-gradient) (${v.id})`);
    else want.donutArcs.forEach((w, i) => { const [s, e, p] = v.donutArcs[i];
      if (ang(s, w.from) > 0.5 || ang(e, w.to) > 0.5 || !has$(p, w.tok)) bad.push(`Donut 호 ${i + 1}: Figma ${s}°~${e}° ${p} ≠ 저장소 ${+w.from.toFixed(2)}°~${+w.to.toFixed(2)}° ${w.tok} (${v.id})`); });
  }
  /* 체크 선 굵기 — 저장소의 실제 굵기(stroke-width × 폭/24) */
  for (const nm of ["Step", "Steps"]) for (const v of sets[nm] || []) {
    if (v.checkW === undefined) continue;
    if (typeof v.checkW !== "number" || Math.abs(v.checkW - want.checkStroke) > 0.01) bad.push(`${nm} 체크 선 굵기 ${v.checkW} ≠ ${want.checkStroke}(.steps li i svg: stroke-width × 폭/24) — ${v.name} (${v.id})`);
  }
  /* Pulse 고리 — Pulse=On 은 같은 계열 토큰 · 0 < 굵기 ≤ 최대 퍼짐, Pulse=Off 는 고리 없음.
     고리(ring)는 2026-10-23 k 의 probe.js 부터 적으므로, 그 전 덤프(새 필드가 하나도 없음)에서는 보지 않는다 */
  const newProbe = Object.values(sets).some((vs) => vs.some((v) => v.refs !== undefined || v.itemsList !== undefined || v.checkW !== undefined));
  for (const v of newProbe ? si : []) {
    const p = prop(v.name, "Pulse"); if (!p) continue;
    const [paintR, wR] = (v.ring || "").split("|"), w = +wR, tok = /\$([a-z]+)\/([a-z]+)\//.exec(paintR || "");
    if (p === "On") {
      if (!v.ring) bad.push(`Status Indicator Pulse=On 에 고리가 없습니다(.indicator.pulse) — ${v.name} (${v.id})`);
      else {
        if (!tok || tok[2] !== want.pulse.family) bad.push(`Pulse 고리 색 ${paintR} 이 ${want.pulse.tok} 계열(${want.pulse.family})이 아닙니다 — ${v.name} (${v.id})`);
        if (!(w > 0 && w <= want.pulse.max)) bad.push(`Pulse 고리 굵기 ${wR} 가 0 초과 ${want.pulse.max} 이하(@keyframes pulse)가 아닙니다 — ${v.name} (${v.id})`);
      }
    } else if (v.ring) bad.push(`Status Indicator Pulse=Off 에 고리가 있습니다 ${v.ring} — ${v.name} (${v.id})`);
  }
  /* 컴포넌트 속성 연결 — 어떤 변형에서 이름·종류가 같은 노드가 속성 P 를 참조하면, 같은 노드를 가진 다른 변형도 P 를 참조해야 한다.
     복제(clone)해 넣은 변형은 연결이 빠진 채 들어온다(2026-10-23 j 에 8개). 같은 빠짐은 묶어서 한 줄로 */
  if (Object.values(sets).some((vs) => vs.some((v) => v.refs !== undefined))) {
    const hits = new Map(REF_EXCEPTIONS.map((e) => [e, 0]));
    for (const [set, vs] of Object.entries(sets)) {
      const all = {};
      for (const v of vs) for (const [k, r] of Object.entries(v.refs || {})) for (const x of r.split(";").filter(Boolean)) (all[k] = all[k] || new Set()).add(x);
      const miss = {}; let excused = 0;
      for (const v of vs) for (const [k, r] of Object.entries(v.refs || {})) {
        const have = new Set(r.split(";").filter(Boolean));
        for (const x of all[k] || []) if (!have.has(x)) {
          const e = REF_EXCEPTIONS.find((e) => e.set === set && e.variant.test(v.name) && e.key === k && e.ref === x);
          if (e) { excused++; hits.set(e, hits.get(e) + 1); continue; }
          (miss[k + " → " + x] = miss[k + " → " + x] || []).push(v);
        }
      }
      if (excused) notes.push(`${set} 속성 연결 빠짐 ${excused}개는 선언된 예외입니다 — ${REF_EXCEPTIONS.filter((e) => e.set === set).map((e) => e.why).join(" / ")}`);
      for (const [kx, list] of Object.entries(miss)) {
        const [k, x] = kx.split(" → "), [nm, ty] = k.split("|");
        bad.push(`${set} 속성 연결 빠짐 — ${nm}(${ty}) 이 ${x} 를 참조하지 않는 변형 ${list.length}개: ${list.slice(0, 3).map((v) => v.name + " " + v.id).join(" · ")}${list.length > 3 ? " …" : ""}`);
      }
    }
    /* 맞는 곳이 없는 예외는 남겨 두면 나중에 같은 이름의 진짜 빠짐을 덮는다 — 원인이 없어졌으면 지운다 */
    for (const [e, n] of hits) if (!n) notes.push(`선언된 예외가 맞는 곳이 없습니다 — ${e.set} · ${e.key} · ${e.ref}. 원인이 없어졌으면 audit.mjs 의 REF_EXCEPTIONS 에서 지우세요`);
  } else notes.push("덤프에 컴포넌트 속성 연결 조사가 없습니다 — 2026-10-23 k 이전 probe.js 로 만든 덤프입니다");
  /* Sparkline 막대 — 강조는 하나, 나머지는 옅은 막대 */
  const sparkCheck = (where, v) => { const b = v.bars; if (!b) return;
    const hi = b["$" + want.sparkBars.hi] || 0, lo = b["$" + want.sparkBars.bar] || 0, all = Object.values(b).reduce((n, x) => n + x, 0);
    if (hi !== 1 || lo !== all - 1) bad.push(`${where} 막대 ${JSON.stringify(b)} ≠ 강조 1(${want.sparkBars.hi}) · 나머지 ${want.sparkBars.bar} (${v.id})`); };
  for (const v of sets["Chart Card"] || []) sparkCheck("Chart Card", v);
  const kpis = sets["KPI"] || [];
  for (const v of kpis) sparkCheck("KPI", v);
  if (kpis.length && !kpis.some((v) => /Sparkline=On/.test(v.name))) bad.push("KPI 에 Sparkline=On 변형이 없습니다(.kpi:has(> .sparkline))");
  /* Donut — 호 사이 틈(CSS 의 면 색 틈과 같은 각도)과 도넛 + 범례 행 */
  for (const v of sets["Chart Card"] || []) {
    if (!v.donutGaps) continue;
    if (v.donutGaps.some((g) => Math.abs(g - want.donut.gapDeg) > 0.5)) bad.push(`Donut 호 사이 간격 ${v.donutGaps.join(" · ")}° ≠ ${want.donut.gapDeg}° (${v.id})`);
    if (v.donutStrokes) bad.push(`Donut 호에 테두리 ${v.donutStrokes}개 — 틈은 비워서 만든다 (${v.id})`);
    if (want.donut.row === "space-between" && !v.rowGeo && v.row !== "SPACE_BETWEEN/FILL") bad.push(`Donut + 범례 행 ${v.row} ≠ SPACE_BETWEEN/FILL(.donut-row) (${v.id})`);
  }
  /* 도넛 가운데 합계(k34) — 정적(Chart Card 의 Donut)과 탐색형(Chart Type=Donut 의 Center) 모두 .donut::after 와 같은 텍스트 스타일 · 크기 · 행간, 가로 가운데 ±1 */
  { const wc = want.donutCenter;
    if (wc.error) bad.push(`도넛 가운데 글 기대값을 읽지 못했습니다 — ${wc.error}`);
    else { const centers = (sets["Chart Card"] || []).filter((v) => v.donutGaps).map((v) => [`Chart Card ${v.name} (${v.id})`, v.donutCenter]);
      for (const v of (c.chart && c.chart.variants) || []) if ((v.arcs || []).length) centers.push([`Chart ${v.name} (${v.id})`, v.centerType]);
      if (!centers.length) notes.push("도넛 가운데 글을 대조할 도넛이 없습니다");
      for (const [at, t] of centers) {
        if (t === undefined) { notes.push(`${at} 가운데 글 스타일 조사 없음 — k34 전 probe.js 로 만든 덤프입니다`); continue; }
        if (!t) { bad.push(`${at} 가운데 글 없음 — .donut::after content`); continue; }
        if (t.st !== wc.style || t.fs !== wc.size || t.lh !== wc.lh) bad.push(`${at} 가운데 글 ${t.st || "스타일 없음"} ${t.font} ${t.fs}/${t.lh} ≠ ${wc.style}(${wc.size}/${wc.lh}/${wc.weight}) — .donut::after · ds-chart centerPlugin`);
        if (Math.abs(t.dx) > 1) bad.push(`${at} 가운데 글이 가로 가운데에서 ${t.dx}px 어긋남 — .donut::after place-items:center`); } } }
  if (c.textOnSurface === undefined) notes.push("덤프에 글자 토큰·옛 변수·섹션 간격 조사가 없습니다 — 옛 probe.js 로 만든 덤프입니다");
  if ((c.textOnSurface || []).length) bad.push(`글자에 surface/* 토큰 ${c.textOnSurface.length}개 — 글자는 foreground (${c.textOnSurface.slice(0, 6).join(" ")}${c.textOnSurface.length > 6 ? " …" : ""})`);
  /* opaque 토큰은 대개 견본 전용이지만, 저장소가 실제로 소비하는 것은 허용한다(k42 — Medium 심각도 = surface/accent/lime-opaque).
     허용 목록을 여기 적지 않고 소비자에서 센다: style.src.css 의 var(--…-opaque) 참조 + ds-chart.src.js 가 계산값으로 읽는 "--…-opaque" */
  { const used = new Set();
    for (const m of read("_build/style.src.css").replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/var\(--([a-z0-9-]+-opaque)\)/g)) used.add(m[1]);
    for (const m of read("_build/ds-chart.src.js").matchAll(/["'`]--([a-z0-9-]+-opaque)["'`]/g)) used.add(m[1]);
    for (const [name, e] of Object.entries(c.opaque || {})) {
      const cssName = name.replace(/^color\/semantic\//, "").replace(/\//g, "-");
      if (used.has(cssName)) { notes.push(`opaque 토큰 ${name} ×${e.n} — 저장소가 --${cssName} 를 소비하므로 허용(style.src.css · ds-chart)`); continue; }
      bad.push(`컴포넌트 CSS 가 쓰지 않는 opaque 토큰 ${name} ×${e.n} (${e.ids.join(" ")}${e.n > e.ids.length ? " …" : ""})`); } }
  for (const [name, e] of Object.entries(c.legacy || {})) bad.push(`현재 페이지에 옛 변수 ${name} ×${e.n} (${e.ids.join(" ")}${e.n > e.ids.length ? " …" : ""})`);
  for (const s of c.sections || []) if (s.gap !== want.sectionGap) bad.push(`섹션 간격 ${s.page}${s.pageId ? "(" + s.pageId + ")" : ""}: ${s.a} → ${s.b} ${s.gap} ≠ ${want.sectionGap}`);
  if ((c.negText || []).length) bad.push(`글자에 foreground/negative/primary ${c.negText.length}개 — 저장소는 글자에 strong (${c.negText.slice(0, 6).join(" ")}${c.negText.length > 6 ? " …" : ""})`);
  /* 문서 카드 Spec 글 ↔ 저장소 spec 행(2026-10-26 k3). 모든 컴포넌트를 본다. 맞대는 법
     - 카드: Figma 프레임 "Card/<이름>" 의 <이름>을 소문자로, 공백을 "-" 로 바꾼 것이 components.data.js 의 키다("Text Field" → text-field).
       짝이 없는 카드 · 키는 둘 다 어긋남이다
     - 행: 행 이름(Size · Container · Label · Placement · State · Motion …)이 같은 것끼리 맞댄다. 순서는 보지 않는다. 한쪽에만 있는 행도 어긋남이다
     - 글: 저장소 값은 사이트에 보이는 글로 바꾼다 — HTML 태그(<code> · <b> …)를 지우고 엔티티 &amp; &lt; &gt; &quot; &#39; &apos; &nbsp; 를 푼다.
       그다음 양쪽 모두 Unicode NFC 로 맞추고(macOS 가 한글을 NFD 로 넣는 일이 있다), 공백류(줄바꿈 · NBSP 포함)가 이어지면 공백 하나로, 앞뒤 공백은 지운다.
       그 밖의 차이(숫자 · 단위 · 문장부호 · 대소문자 · 토큰 이름 · 글 순서)는 그대로 어긋남이다 — 어느 쪽이 맞는지는 사람이 고른다.
       사이트 Spec 은 실측으로 자주 고쳐지므로(2026-10 에 22행) 이 대조는 Figma 글이 뒤처진 곳을 찾는 데 쓴다. 고친 곳은 2026-10-26 k3 의 3행뿐이다 */
  if (c.specs) {
    const key = (card) => card.replace(/^Card\//, "").trim().toLowerCase().replace(/\s+/g, "-");
    const fig = new Map(c.specs.map((s) => [key(s.card), s]));
    for (const [slug, rows] of Object.entries(want.specs)) {
      const s = fig.get(slug);
      if (!s) { bad.push(`Spec 카드 없음: ${slug} — Figma 에 "Card/…" 문서 카드나 그 안의 Spec 프레임이 없습니다`); continue; }
      const nm = s.card.replace(/^Card\//, ""), have = new Map(s.rows.map((r) => [specNorm(r[0]), r]));
      for (const [row, site] of rows) {
        const f = have.get(row);
        if (!f) bad.push(`Spec ${nm} · ${row}: 저장소에만 있는 행 — 저장소 [${site}] (카드 ${s.id})`);
        else if (specNorm(f[1]) !== site) bad.push(`Spec ${nm} · ${row}: 저장소 [${site}] ≠ Figma [${specNorm(f[1])}] (${f[2]})`);
      }
      for (const [row, f] of have) if (!rows.some((r) => r[0] === row)) bad.push(`Spec ${nm} · ${row}: Figma 에만 있는 행 — Figma [${specNorm(f[1])}] (${f[2]})`);
    }
    for (const [slug, s] of fig) if (!want.specs[slug]) bad.push(`Spec 카드 ${s.card}(${s.id}) 에 맞는 저장소 컴포넌트가 없습니다(키 ${slug})`);
  } else notes.push("덤프에 문서 카드 Spec 이 없습니다 — 2026-10-26 k3 전 probe.js 로 만든 덤프입니다");
  /* 포커스(2026-10-26 k5 · k6 · k9) — 값 입력 필드는 테두리 · 안쪽 줄 · 후광의 토큰과 굵기를 사이트 CSS 와 맞춘다.
     Figma 는 안쪽 그림자를 INSIDE 테두리 밑에 그린다(임시 노드로 확인 — spread 1 은 1px 테두리에 완전히 가려지고, spread 2 라야
     테두리 안쪽에 1px 이 보인다). 그래서 CSS 의 inset Npx 는 Figma 안쪽 그림자 spread = N + 테두리 굵기 로 그린 것을 기대한다.
     k9 부터 CSS 에 inset 이 없다 — 그때는 Figma 칸에 안쪽 그림자가 하나도 없어야 한다(남은 안쪽 그림자가 어긋남).
     변형은 State 값으로 가른다(Focused · Error Focused — 옛 덤프에는 state 가 없어 Focused 로 본다). 기대값이 없는 포커스 상태도 어긋남이다.
     선택 컨트롤 · Button 은 아래 외곽선 대조가 본다. 세트나 변형이 없으면, 기대값을 CSS 에서 읽지 못하면 어긋남이다 */
  if (c.focus) {
    const stateOf = (v) => v.state || "Focused";
    const ok = (fx, tok, spread, blur) => fx.length === 1 && fx[0][0] === tok && fx[0][1] === spread && fx[0][2] === blur && fx[0][3] === "0,0";
    for (const w of want.focus.fields) {
      if (w.error) { bad.push(`${w.set} State=${w.state} 포커스 기대값을 사이트 CSS 에서 읽지 못했습니다 — ${w.error}`); continue; }
      const all = c.focus[w.set];
      if (!all) { bad.push(`${w.set} 세트가 없어 State=${w.state} 를 대조하지 못했습니다`); continue; }
      const list = all.filter((v) => stateOf(v) === w.state);
      if (!list.length) { bad.push(`${w.set} 에 State=${w.state} 변형이 없습니다 — 사이트 ${w.css}`); continue; }
      const innerSpread = w.inner ? w.inner.spread + w.border.w : 0;
      for (const v of list) {
        const at = `${w.set} ${v.variant} (${v.id})`;
        if (!v.box) { bad.push(`${at} — 포커스 칸을 찾지 못했습니다`); continue; }
        if (v.stroke !== "$" + w.border.tok || v.sw !== w.border.w || v.align !== "INSIDE") bad.push(`${at} 테두리 ${v.stroke} · ${v.sw}px · ${v.align} ≠ ${w.border.tok} · ${w.border.w}px · INSIDE`);
        if (!w.inner) { if (v.inner.length) bad.push(`${at} 안쪽 그림자가 남아 있습니다 ${JSON.stringify(v.inner)} — 사이트 ${w.css} 에는 inset 이 없습니다(테두리 ${w.border.w}px + 후광)`); }
        else if (!ok(v.inner, w.inner.tok, innerSpread, w.inner.blur)) bad.push(`${at} 안쪽 줄 ${JSON.stringify(v.inner)} ≠ [${w.inner.tok}, spread ${innerSpread}(inset ${w.inner.spread} + 테두리 ${w.border.w}), blur ${w.inner.blur}]`);
        if (!ok(v.drop, w.ring.tok, w.ring.spread, w.ring.blur)) bad.push(`${at} 후광 ${JSON.stringify(v.drop)} ≠ [${w.ring.tok}, spread ${w.ring.spread}, blur ${w.ring.blur}]`);
      }
    }
    for (const set of [...new Set(want.focus.fields.map((w) => w.set))]) for (const v of c.focus[set] || []) {
      if (!want.focus.fields.some((w) => w.set === set && w.state === stateOf(v))) bad.push(`${set} ${v.variant} (${v.id}) — 기대값이 없는 포커스 상태(${stateOf(v)}). 사이트 규칙이 있으면 audit.mjs 의 FOCUS_CSS 에 더하세요`);
    }
    /* 외곽선 포커스(선택 컨트롤 · Button) — 사이트 :focus-visible 외곽선을 선만 있는 고리("Focus Ring")로(2026-10-26 k7 · k8). 규칙은 focusExpect 머리 주석 */
    const r = want.focus.ring;
    /* 옛 덤프 — 세트가 조사에 없거나(선택 컨트롤 k6 전 · Button k8 전) 고리 필드가 없으면(k7 전) 그 세트만 NOTE 로 넘긴다 */
    const ringSets = RING_SETS.filter((s) => {
      if (!(s in c.focus)) { notes.push(`덤프에 ${s} 포커스 조사가 없습니다 — ${s === "Button" ? "2026-10-26 k8" : "2026-10-26 k6"} 전 probe.js 로 만든 덤프입니다`); return false; }
      if ((c.focus[s] || []).length && c.focus[s].every((v) => v.ring === undefined)) { notes.push(`덤프에 ${s} 의 고리(Focus Ring) 조사가 없습니다 — 2026-10-26 k7 전 probe.js 로 만든 덤프입니다`); return false; }
      return true;
    });
    if (ringSets.length && r.error) bad.push(`외곽선 포커스 기대값을 사이트 CSS 에서 읽지 못했습니다 — ${r.error}`);
    else for (const set of ringSets) {
      const list = c.focus[set];
      if (!list) { bad.push(`${set} 세트가 없어 Focused 를 대조하지 못했습니다`); continue; }
      if (!list.length) { bad.push(`${set} 에 State=Focused 변형이 없습니다 — 사이트 ${r.css}`); continue; }
      const full = (rad, w, h) => typeof rad === "number" && rad >= Math.min(w, h) / 2 - 0.01;
      for (const v of list) {
        const at = `${set} ${v.variant} (${v.id})`;
        if (!v.box) { bad.push(`${at} — 포커스 칸을 찾지 못했습니다`); continue; }
        if (v.drop.length || v.inner.length) bad.push(`${at} 칸(${v.box})에 그림자가 남아 있습니다 ${JSON.stringify(v.drop.concat(v.inner))} — 고리는 Focus Ring 이 그립니다`);
        if (set === "Slider" && r.sliderTrack && v.fill !== r.sliderTrack) bad.push(`${at} 칸(${v.box}) 면 ${v.fill} — 사이트 range 는 바탕이 없습니다(${r.sliderTrackCss})`);
        const g = v.ring;
        if (!g) { bad.push(`${at} — Focus Ring 이 없습니다. 사이트 outline ${r.width}px ${r.tok} · offset ${r.offset}`); continue; }
        if (g.stroke !== "$" + r.tok || g.sw !== r.width || g.align !== "OUTSIDE") bad.push(`${at} 고리 선 ${g.stroke} · ${g.sw}px · ${g.align} ≠ ${r.tok} · ${r.width}px · OUTSIDE`);
        if (g.fill !== "-") bad.push(`${at} 고리에 면 ${g.fill} — 틈은 비어 있어야 바탕이 비칩니다`);
        if (g.fx) bad.push(`${at} 고리에 효과 ${g.fx}개`);
        const ex = { dx: -r.offset, dy: -r.offset, w: +(v.size[0] + 2 * r.offset).toFixed(2), h: +(v.size[1] + 2 * r.offset).toFixed(2) };
        if (Math.abs(g.dx - ex.dx) > 0.5 || Math.abs(g.dy - ex.dy) > 0.5 || Math.abs(g.w - ex.w) > 0.5 || Math.abs(g.h - ex.h) > 0.5) bad.push(`${at} 고리 자리 ${g.dx},${g.dy} · ${g.w}×${g.h} ≠ 칸에서 ${ex.dx},${ex.dy} · ${ex.w}×${ex.h}(outline-offset ${r.offset} 상자 — 선 ${r.width}px 는 그 바깥)`);
        if (full(v.radius, v.size[0], v.size[1])) { if (!full(g.radius, g.w, g.h)) bad.push(`${at} 고리 모서리 ${g.radius} — 칸이 완전히 둥글어 고리도 완전히 둥글어야 합니다`); }
        else if (typeof v.radius === "number") { const er = v.radius > 0 ? v.radius + r.offset : 0; if (Math.abs(g.radius - er) > 0.5) bad.push(`${at} 고리 모서리 ${g.radius} ≠ ${er}(칸 ${v.radius}${v.radius > 0 ? " + offset " + r.offset : " — 각진 칸은 각진 고리"})`); }
      }
    }
  } else notes.push("덤프에 값 입력 필드 Focused 조사가 없습니다 — 2026-10-26 k5 전 probe.js 로 만든 덤프입니다");
  /* Tag 높이(2026-10-26 k5) — 크기마다 모든 변형이 사이트 실측과 ±0.5. 잴 수 없으면 어긋남이다 */
  if (c.tagHeights !== undefined) {
    const tg = want.tagSite;
    if (!tg || tg.error) bad.push(`Tag 높이를 사이트와 대조하지 못했습니다 — ${tg ? tg.error : "잴 수 없음"}`);
    else if (!c.tagHeights) bad.push("Tag 세트가 없어 높이를 대조하지 못했습니다");
    else for (const [size, k] of [["Small", "sm"], ["Medium", "md"], ["Large", "lg"]]) {
      const f = c.tagHeights[size];
      if (!f) { bad.push(`Tag 에 Size=${size} 변형이 없습니다`); continue; }
      if (Math.abs(f[0] - tg[k]) > 0.5 || Math.abs(f[1] - tg[k]) > 0.5) bad.push(`Tag Size=${size} 높이 ${f[0] === f[1] ? f[0] : f[0] + "~" + f[1]}(변형 ${f[2]}) ≠ 사이트 실측 ${+tg[k].toFixed(2)}`);
    }
  } else notes.push("덤프에 Tag 높이가 없습니다 — 2026-10-26 k5 전 probe.js 로 만든 덤프입니다");
  /* 효과(그림자) 색의 변수 연결(2026-10-26 k6) — 사람의 결정: 컴포넌트 세트의 그림자 색은 변수에 묶거나 효과 스타일로 칠한다.
     변수 없는 색이 하나라도 남으면 어긋남이다. 범위와 거짓 경보를 피하려고 뺀 것은 probe.js 의 같은 날짜 주석에 */
  if (c.effectColors) {
    for (const e of c.effectColors.raw) bad.push(`효과 색이 변수에 묶이지 않았습니다 — ${e.set} · ${e.variant} · ${e.node} (${e.id}) ${e.type} ${e.color} spread ${e.spread} blur ${e.blur}`);
  } else notes.push("덤프에 효과 색 조사가 없습니다 — 2026-10-26 k6 전 probe.js 로 만든 덤프입니다");
  /* 반투명 컴포넌트(2026-10-27 k10) — 사람의 결정: 컴포넌트 변형의 불투명도를 본다. 자기 불투명도가 1 이 아닌 컴포넌트 · 변형 · 세트는 어긋남이다.
     비활성은 opacity 로 흐리지 않고 --surface-disable-primary(면 · 테두리) · --foreground-disable-primary(글자 · 표시)로 칠한다(CLAUDE.md · 사이트 :disabled 규칙).
     거짓 경보가 날 수 있는 경우와 규칙:
       - 컴포넌트 자체가 반투명이어야 하는 것(끌기 미리보기 · 딤 오버레이 견본 등)은 OPACITY_OK 에 이유와 함께 선언한다. 비활성은 선언 대상이 아니다.
       - 안쪽 층(아이콘 · 장식 · 프레임)의 불투명도는 probe 가 적지 않는다 — 사이트도 opacity 로 그리는 표현이 있어서다(.tbl th.sortable::after 0.45 ↔ Figma 정렬 아이콘 0.45).
         그래서 변형 안의 층을 opacity 로 흐린 비활성(예: 달력 Day/Disabled 프레임)은 이 검사로 잡히지 않는다.
       - 숨긴 변형도 본다. 위 조사 세트 검사가 이미 낸 Disabled 는 다시 내지 않는다 */
  if (c.translucent !== undefined) {
    for (const t of c.translucent) {
      if (dimmed.has(t.id)) continue;
      const ok = OPACITY_OK.find((e) => e.set === t.set && e.variant.test(t.name));
      if (ok) { notes.push(`반투명 컴포넌트 ${t.set} · ${t.name} 는 선언된 예외입니다 — ${ok.why}`); continue; }
      bad.push(`${t.set ? t.set + " " : ""}${t.name} (${t.id}) 불투명도 ${t.opacity} — 컴포넌트는 1 이어야 합니다${/Disabled/.test(t.name) ? ". 비활성은 --surface-disable-primary · --foreground-disable-primary 로 칠합니다" : ""}`);
    }
  } else notes.push("덤프에 반투명 컴포넌트 조사가 없습니다 — 2026-10-27 k10 전 probe.js 로 만든 덤프입니다");
  /* 선택 컨트롤의 칠(2026-10-27 k11) — 사람의 결정: 선택된 Radio 는 사이트처럼 brand 면 + 같은 색 안쪽 1.5px + brand-label 점,
     선택 + 비활성은 disable 면 · 테두리 + foreground-disable 점. 비활성 Slider 는 라벨 · 값도 foreground-disable. 기대값은 controlsExpect */
  if (c.controls !== undefined) {
    const ce = want.controls;
    if (ce.error) bad.push(`선택 컨트롤의 칠 기대값을 사이트 CSS 에서 읽지 못했습니다 — ${ce.error}`);
    else {
      if (!c.controls.radio || !c.controls.radio.length) bad.push("Radio Button 세트에 Value=Checked 변형이 없어 선택 칠을 대조하지 못했습니다");
      for (const v of c.controls.radio || []) {
        const w = /(?:^|, )State=Disabled(?:,|$)/.test(v.variant) ? ce.radioDisabled : ce.radioChecked;
        const at = `Radio Button ${v.variant} (${v.id})`;
        if (v.face !== "$" + w.face) bad.push(`${at} 면 ${v.face} ≠ ${w.face} — 사이트 ${w.css}`);
        if (v.ring !== "$" + w.ring || v.sw !== w.sw) bad.push(`${at} 테두리 ${v.ring} · ${v.sw}px ≠ ${w.ring} · ${w.sw}px(안쪽) — 사이트 ${w.css}`);
        if (v.dot !== "$" + w.dot) bad.push(`${at} 점 ${v.dot} ≠ ${w.dot} — 사이트 ${w.css}`);
      }
      if (!c.controls.sliderDisabled || !c.controls.sliderDisabled.length) bad.push("Slider 세트에 State=Disabled 변형이 없어 비활성 글자를 대조하지 못했습니다");
      for (const v of c.controls.sliderDisabled || []) for (const f of ["label", "value"]) {
        if (v[f] !== "$" + ce.sliderText) bad.push(`Slider ${v.variant} (${v.id}) ${f === "label" ? "라벨" : "값"} 글자 ${v[f]} ≠ ${ce.sliderText} — 사이트 .slider:has(input:disabled) .row · .val`);
      }
    }
  } else notes.push("덤프에 선택 컨트롤의 칠 조사가 없습니다 — 2026-10-27 k11 전 probe.js 로 만든 덤프입니다");
  /* 비활성 안쪽 층(2026-10-27 k12) — 사람의 결정: 이름에 Disabled 가 든 변형 · 노드 안에서 opacity 로 흐린 층이 있으면 어긋남이다(비활성은 토큰으로 — CLAUDE.md).
     이름으로 고르므로 비활성 밖의 반투명(표 정렬 아이콘 0.45)은 대상이 아니다. 비활성 층의 이름에 Disabled 가 없으면 이 검사가 못 본다 — 이름을 붙여 둔다 */
  if (c.disabledInner !== undefined) {
    for (const t of c.disabledInner) bad.push(`${t.set ? t.set + " " : ""}${t.variant} 안의 ${t.name} (${t.id}) 불투명도 ${t.opacity} — 비활성 안쪽 층은 opacity 로 흐리지 않고 --foreground-disable-primary · --surface-disable-primary 로 칠합니다`);
  } else notes.push("덤프에 비활성 안쪽 층 조사가 없습니다 — 2026-10-27 k12 전 probe.js 로 만든 덤프입니다");
  /* Chip 의 삭제(x) · 비활성 Item Tile(2026-10-27 k12) — 기대값은 chipTileExpect */
  if (c.chipX !== undefined || c.tileDisabled !== undefined) {
    const ct = want.chipTile;
    if (ct.error) bad.push(`Chip 삭제 · 비활성 Item Tile 기대값을 사이트 CSS 에서 읽지 못했습니다 — ${ct.error}`);
    else {
      if (!c.chipX || !c.chipX.length) bad.push("Chip 세트에 Type=Input 변형이 없어 삭제(x)를 대조하지 못했습니다");
      for (const v of c.chipX || []) {
        const dis = /(?:^|, )State=Disabled(?:,|$)/.test(v.variant), w = dis ? ct.chipDisabled : ct.chip, at = `Chip ${v.variant} (${v.id}) 삭제(x)`;
        const faceOk = w.face === "-" ? v.face === "-" || v.face === "transparent" : v.face === "$" + w.face;
        if (!faceOk) bad.push(`${at} 면 ${v.face} ≠ ${w.face === "-" ? "없음" : w.face} — 사이트 ${dis ? ".chip[disabled] .x" : ".chip .x"}`);
        if (v.icon !== "$" + w.icon) bad.push(`${at} 아이콘 ${v.icon} ≠ ${w.icon} — 사이트 ${dis ? ".chip[disabled] .x" : ".chip .x"}`);
      }
      if (!c.tileDisabled || !c.tileDisabled.length) bad.push("Item Tile 세트에 State=Disabled 변형이 없어 대조하지 못했습니다");
      for (const v of c.tileDisabled || []) {
        const at = `Item Tile ${v.variant} (${v.id})`;
        if (v.icoFace !== "$" + ct.tile.icoFace) bad.push(`${at} 아이콘 면 ${v.icoFace} ≠ ${ct.tile.icoFace} — 사이트 .tile[disabled] .ico`);
        if (v.icon !== "$" + ct.tile.icon) bad.push(`${at} 아이콘 ${v.icon} ≠ ${ct.tile.icon} — 사이트 .tile[disabled] .ico`);
        if (v.desc !== "$" + ct.tile.desc) bad.push(`${at} 설명 글자 ${v.desc} ≠ ${ct.tile.desc} — 사이트 .tile[disabled] span:not(.tag)`);
      }
    }
  } else notes.push("덤프에 Chip 삭제 · 비활성 Item Tile 조사가 없습니다 — 2026-10-27 k12 전 probe.js 로 만든 덤프입니다");
  /* Date Picker 필드 · 날짜 칸(2026-10-27 k14) — 기대값은 datePickerExpect */
  if (c.datePicker !== undefined || c.calendarDay !== undefined) {
    const dp = want.datePicker, vp = (name, k) => { const m = new RegExp("(?:^|, )" + k + "=([^,]+)").exec(name || ""); return m ? m[1].trim() : null; };
    if (dp.error) bad.push(`Date Picker 기대값을 사이트 CSS 에서 읽지 못했습니다 — ${dp.error}`);
    else {
      const list = c.datePicker || [], seen = new Set(), stray = [];
      if (!list.length) bad.push("Date Picker 세트가 없어 필드를 대조하지 못했습니다");
      for (const v of list) {
        const t = vp(v.variant, "Type"), z = vp(v.variant, "Size"), s = vp(v.variant, "State"), f = dp.fields[t];
        if (!f || !(z in DP_SIZES) || !DP_STATES[t].includes(s)) { if (!/Calendar|View/.test(v.variant)) stray.push(`${v.variant}(${v.id})`); continue; }
        seen.add(`${t}|${z}|${s}`);
        const w = f.st[s], at = `Date Picker ${v.variant} (${v.id})`;
        if (v.h === null) { bad.push(`${at} — "Field" 칸을 찾지 못했습니다`); continue; }
        if (Math.abs(v.h - f.h[z]) > 0.5) bad.push(`${at} 필드 높이 ${v.h} ≠ ${f.h[z]} — 사이트 .field${DP_SIZES[z]} .affix`);
        if (v.fill !== "$" + w.fill) bad.push(`${at} 면 ${v.fill} ≠ ${w.fill} — 사이트 ${w.css}`);
        if (v.stroke !== "$" + w.stroke || v.sw !== w.sw) bad.push(`${at} 테두리 ${v.stroke} · ${v.sw}px ≠ ${w.stroke} · ${w.sw}px — 사이트 ${w.css}`);
        if (JSON.stringify(v.drop) !== JSON.stringify(w.drop)) bad.push(`${at} 바깥 그림자 ${JSON.stringify(v.drop)} ≠ ${JSON.stringify(w.drop)} — 사이트 ${w.css}`);
        if (t === "Input" && v.innerFx !== 0) bad.push(`${at} 안쪽 입력칸 ${v.innerFx === null ? '("Input" 노드 없음)' : "효과 " + v.innerFx + "개"} — 사이트 .field .affix input:focus 는 box-shadow:none(고리는 .affix 가 그린다)`);
      }
      const miss = []; for (const [t, sts] of Object.entries(DP_STATES)) for (const z of Object.keys(DP_SIZES)) for (const s of sts) if (!seen.has(`${t}|${z}|${s}`)) miss.push(`Type=${t}, Size=${z}, State=${s}`);
      if (miss.length) bad.push(`Date Picker 에 없는 변형 ${miss.length}개(기대 ${Object.values(DP_STATES).reduce((n, a) => n + a.length, 0) * 3}) — ${miss.slice(0, 4).join(" · ")}${miss.length > 4 ? " …" : ""}`);
      if (stray.length) bad.push(`Date Picker 에 표에 없는 변형 ${stray.length}개 — ${stray.slice(0, 4).join(" · ")}${stray.length > 4 ? " …" : ""}(Type=Input × Size × State 로 — 버튼형은 2026-11-09 에 없앴다)`);
      const days = c.calendarDay || [], dseen = new Set();
      if (!days.length) bad.push("Calendar Day 세트가 없어 날짜 칸을 대조하지 못했습니다");
      for (const v of days) {
        const s = vp(v.variant, "State"), w = dp.days[s], at = `Calendar Day ${v.variant} (${v.id})`;
        if (!w) { bad.push(`${at} — 표에 없는 상태(${DAY_STATES.join(" · ")})`); continue; }
        dseen.add(s);
        if (v.fill !== (w.fill === "-" ? "-" : "$" + w.fill)) bad.push(`${at} 면 ${v.fill} ≠ ${w.fill === "-" ? "없음" : w.fill}`);
        if (w.stroke === "-" ? v.stroke !== "-" : v.stroke !== "$" + w.stroke || v.sw !== w.sw || v.align !== "INSIDE") bad.push(`${at} 테두리 ${v.stroke} · ${v.sw} · ${v.align} ≠ ${w.stroke === "-" ? "없음" : w.stroke + " · " + w.sw + " · INSIDE"}`);
        if (JSON.stringify(v.radius) !== JSON.stringify(w.radius)) bad.push(`${at} 모서리 ${JSON.stringify(v.radius)} ≠ ${JSON.stringify(w.radius)}`);
        if (v.text !== "$" + w.text) bad.push(`${at} 글자 ${v.text} ≠ ${w.text}`);
        if ((v.ring || null) !== (w.ring ? "$" + w.ring : null)) bad.push(`${at} 고리 ${v.ring} ≠ ${w.ring || "없음"}`);
      }
      const dmiss = DAY_STATES.filter((s) => !dseen.has(s));
      if (dmiss.length) bad.push(`Calendar Day 에 없는 상태 ${dmiss.length}개 — ${dmiss.join(" · ")}`);
      if (c.calendar !== undefined) {
        const cv = c.calendar || [], views = cv.map((v) => vp(v.variant, "View"));
        const vmiss = CAL_VIEWS.filter((x) => !views.includes(x));
        if (vmiss.length) bad.push(`Calendar 세트에 없는 화면 ${vmiss.length}개 — ${vmiss.join(" · ")}`);
        for (const v of cv) {
          const at = `Calendar ${v.variant} (${v.id})`;
          for (const cell of v.cells) {
            const [nm, fill, text] = cell.split("|"), st = nm.slice(4);
            if (st === "Blank") { if (text !== "-") bad.push(`${at} ${nm} — 빈 칸에 글자가 있습니다`); continue; }
            const w = dp.days[st];
            if (!w) { bad.push(`${at} ${nm} — 표에 없는 날짜 칸 상태`); continue; }
            if (fill !== (w.fill === "-" ? "-" : "$" + w.fill) || text !== "$" + w.text) bad.push(`${at} ${nm} 면 ${fill} · 글자 ${text} ≠ ${w.fill === "-" ? "없음" : w.fill} · ${w.text}`);
          }
          if (!v.apply.length) bad.push(`${at} — 적용 버튼(Apply)이 없습니다`);
          else if (v.apply.some((x) => x !== "Disabled")) bad.push(`${at} 적용 버튼 State ${v.apply.join(",")} ≠ Disabled — 견본은 값이 그대로라 꺼져 있다(사이트 cal())`);
        }
      } else notes.push("덤프에 달력 화면 조사가 없습니다 — 2026-10-27 k15 전 probe.js 로 만든 덤프입니다");
    }
  } else notes.push("덤프에 Date Picker 필드 · 날짜 칸 조사가 없습니다 — 2026-10-27 k14 전 probe.js 로 만든 덤프입니다");
  const pv = (name, k) => { const m = new RegExp("(?:^|, )" + k + "=([^,]+)").exec(name || ""); return m ? m[1].trim() : null; };
  /* Text Field 입력칸 높이(2026-10-28 k16) — 변형마다 "Input" 칸 높이를 사이트 .field input · .field.sm input · .field.lg input 과 ±0.5. 버튼과 같은 32 · 40 · 48 */
  if (c.textField !== undefined) {
    const th = want.textFieldH;
    if (!th || th.error) bad.push(`Text Field 높이 기대값을 읽지 못했습니다 — ${th ? th.error : "없음"}`);
    else if (!c.textField || !c.textField.length) bad.push("Text Field 세트가 없어 입력칸 높이를 대조하지 못했습니다");
    else for (const v of c.textField) {
      const z = pv(v.variant, "Size"), w = th[z], at = `Text Field ${v.variant} (${v.id})`;
      if (!w) bad.push(`${at} — 크기 ${z} 의 기대값이 없습니다`);
      else if (v.h === null) bad.push(`${at} — "Input" 칸을 찾지 못했습니다`);
      else if (Math.abs(v.h - w) > 0.5) bad.push(`${at} 입력칸 높이 ${v.h} ≠ ${w} — 사이트 .field${z === "Medium" ? "" : z === "Small" ? ".sm" : ".lg"} input`);
    }
  } else notes.push("덤프에 Text Field 입력칸 높이가 없습니다 — 2026-10-28 k16 전 probe.js 로 만든 덤프입니다");
  /* 버튼 상자(2026-10-26 k7) — 사람의 결정: 사이트 버튼의 1px 투명 테두리 몫을 Figma 에도 둔다. State=Normal · Loading=False 변형마다(k16 전에는 State=Default) 사이트에서 잰 같은 버튼과
     (폭 − 라벨 폭) = 테두리 + padding, 라벨 x = 테두리 + 왼쪽 padding, 높이를 ±0.5 로 맞춘다. 아이콘만 있는 버튼은 폭 · 높이.
     라벨 폭 자체는 맞추지 않는다 — Figma 텍스트 스타일이 자간(Label/2 2.52% · Label/1 1.45% · Title/1 0.57%)을 지니고 자동 폭이 정수로 올라가
     사이트(.btn 자간 0)보다 0.3 ~ 1.3px 넓다. 그 차이는 글자를 고쳐야 하고 지금은 Pretendard 가 없어 막혀 있다. 잴 수 없으면 어긋남이다 */
  if (c.buttons !== undefined) {
    const sb = want.btnSite;
    if (!sb || sb.error) bad.push(`버튼 상자를 사이트와 대조하지 못했습니다 — ${sb ? sb.error : "잴 수 없음"}`);
    else if (!c.buttons || !c.buttons.length) bad.push("Button 세트가 없어 버튼 상자를 대조하지 못했습니다");
    else {
      for (const v of c.buttons) {
        const io = pv(v.name, "Icon Only") === "True", s = sb[pv(v.name, "Variant") + "|" + pv(v.name, "Color") + "|" + BTN_SIZES[pv(v.name, "Size")] + "|" + io];
        const at = `Button ${v.name} (${v.id})`;
        if (!s) { bad.push(`${at} — 사이트에서 같은 버튼을 재지 못했습니다`); continue; }
        if (Math.abs(v.h - s.h) > 0.5) bad.push(`${at} 높이 ${v.h} ≠ 사이트 ${s.h}`);
        if (io) { if (Math.abs(v.w - s.w) > 0.5) bad.push(`${at} 폭 ${v.w} ≠ 사이트 ${s.w}`); continue; }
        if (!v.label) { bad.push(`${at} — 라벨 글자를 찾지 못했습니다`); continue; }
        const box = +(v.w - v.label[1]).toFixed(2), sbox = +(s.w - s.text).toFixed(2);
        if (Math.abs(box - sbox) > 0.5) bad.push(`${at} 테두리 + padding ${box}(폭 ${v.w} − 라벨 ${v.label[1]}) ≠ 사이트 ${sbox}(폭 ${s.w} − 라벨 ${s.text})`);
        if (Math.abs(v.label[2] - s.textX) > 0.5) bad.push(`${at} 라벨 x ${v.label[2]} ≠ 사이트 ${s.textX}(테두리 + 왼쪽 padding)`);
      }
    }
  } else notes.push("덤프에 버튼 상자가 없습니다 — 2026-10-26 k7 전 probe.js 로 만든 덤프입니다");
  /* 기본 변형(2026-10-26 k7) — 사람의 결정: Tag 세트의 기본 변형 크기는 사이트 기본(Tag props 의 size 기본값 md → Medium).
     Figma 의 기본 변형은 세트에서 왼쪽 위에 놓인 변형이다 — 그래서 각 Style 묶음에서 Medium 줄이 맨 위에 온다 */
  if (c.defaults) {
    const d = c.defaults.Tag;
    if (!want.tagDefault) bad.push("Tag 기본 크기를 components.data.js 의 props 에서 읽지 못했습니다");
    else if (!d) bad.push("Tag 세트의 기본 변형을 읽지 못했습니다");
    else if (pv(d, "Size") !== want.tagDefault) bad.push(`Tag 기본 변형 "${d}" — Size 가 사이트 기본(${want.tagDefault})이 아닙니다`);
    /* Button 기본 변형(2026-10-28 k16) — 사이트 props 기본값(variant solid · color primary · size md) + Normal · 라벨 버튼 · 로딩 아님 */
    const bd = c.defaults.Button, bw = want.buttonDefault;
    if (!bw) bad.push("Button 기본값을 components.data.js 의 props 에서 읽지 못했습니다");
    else if (!bd) bad.push("Button 세트의 기본 변형을 읽지 못했습니다");
    else { const off = Object.entries(bw).filter(([k, v]) => pv(bd, k) !== v); if (off.length) bad.push(`Button 기본 변형 "${bd}" — ${off.map(([k, v]) => k + "=" + v).join(", ")} 이어야 합니다(사이트 props 기본값)`); }
  } else notes.push("덤프에 세트 기본 변형이 없습니다 — 2026-10-26 k7 전 probe.js 로 만든 덤프입니다");
}

function expect_() {
  const t = tokens();
  const ic = icons();
  const ts = typeScale();
  return {
    primitives: t.primitives,
    semantic: t.semantic,
    space: t.space,
    icons: { outline: ic.outline, filled: ic.filled },
    typeScale: ts,
    components: componentsExpect(),
    chart: t.chart,
    counts: {
      primitives: Object.keys(t.primitives).length,
      semantic: Object.keys(t.semantic).length,
      chart: Object.keys(t.chart).length,
      space: Object.keys(t.space).length,
      iconOutline: ic.outline.length,
      iconFilled: ic.filled.length,
      typeScale: Object.keys(ts).length,
    },
  };
}

/* 문서 틀 색(2026-11-06 k38) — 4 Pattern 문서 틀의 역할마다 사이트 셸의 어느 규칙과 같은 변수여야 하는지.
   Figma 문서 카드는 사이트 패턴 페이지 한 장이다: 카드 = 페이지 바탕(body), 카드 머리 = h1 · .lead, 패널('사용 컴포넌트' · '예시' · '사용 가이드')은
   사이트에서 h2 와 그 내용이 놓인 페이지 바탕이라 body 배경(사이트에 따로 칠한 상자가 없다 — 예시 패널은 처음부터 background/neutral/primary 였다),
   예시 틀(Example) = .example 의 테두리 + 미리보기 .panel 의 면, '사용 컴포넌트' 칩 = .uses a(면 없음 · 테두리 · 글자),
   Do/Don't 상자 = .dodont>div(면 · 테두리), 라벨 = .dodont .do/.dont .body::before, 글 = .dodont p(색이 없으면 물려받음).
   패턴 페이지에는 Do/Don't 가 없어 Foundations 의 같은 셸 규칙(.dodont)을 쓴다. 'Do' · 'Don't' 글자 자체(사이트는 DO · DON'T)는 이 대조 밖이다.
   null = 사이트 셸에 대응 없음 → 시멘틱 변수에 묶였는지만 본다(하드코딩하지 않는다) */
const DOC_ROLES = {
  section: { f: null, s: null },
  secTitle: { f: ["color", "h1", "body"] }, secDesc: { f: ["color", ".lead", "body"] },
  card: { f: ["bg", "body"], s: ["border", "body"] },
  cardTitle: { f: ["color", "h1", "body"] }, cardDesc: { f: ["color", ".lead", "body"] },
  body: { f: null, s: null },
  panel: { f: ["bg", "body"], s: ["border", "body"] },   // '개발 상태' 는 면 없는 줄이라 아래에서 null 로
  panelTitle: { f: ["color", "h2", "body"] }, panelDesc: { f: ["color", "p", "body"] },
  example: { f: ["bg", ".panel"], s: ["border", ".example"] },
  wrap: { f: null, s: null }, devChip: { f: null, s: null }, devChipText: { f: null }, other: { f: null, s: null },
  useChip: { f: ["bg", ".uses a"], s: ["border", ".uses a"] }, useChipText: { f: ["color", ".uses a", "body"] },
  doBox: { f: ["bg", ".dodont>div"], s: ["border", ".dodont>div"] }, dontBox: { f: ["bg", ".dodont>div"], s: ["border", ".dodont>div"] },
  doLabel: { f: ["color", ".dodont .do .body::before"] }, dontLabel: { f: ["color", ".dodont .dont .body::before"] },
  guideText: { f: ["color", ".dodont p", ".dodont>div", "body"] },
  /* k39(2026-11-06) 3 Component · 2 Element — 컴포넌트 · Foundations 페이지 셸에서 찾은 대응.
     Table 첫 줄 = th(면 · 아래 선), 나머지 줄 = td(면 없음 · 아래 선). Stage(그림자 무대) = .elev-types .demo, 그 안 Surface = .elev-types .demo i,
     Layout demo = .shell-demo, Side nav = .shell-demo .side(오른쪽 선). 대응이 없는 것 — Properties(사이트 table.props 는 prop 이름 · 태그 표라 Figma 의
     변형 목록 · 미리보기와 다르다), Spec 줄(사이트 컴포넌트 페이지에 spec 표가 없다 — .spec 은 resources/wbs 의 단계 카드), 기타 글 — 은 null.
     k40(2026-11-06 — 사람의 결정) 표 칸 글자: 머리 줄 = th 의 color, 나머지 줄 = td 의 color. td 에는 color 가 없어 DOM 조상을 따라 물려받는다
     (td → table → .tablewrap → .page → .main → body). 헤드리스 Chromium 으로 components · foundations 의 셸 표(th · td, 클래스 없는 table)를 재 보면
     th 18칸 = tertiary, td 74칸 = primary 였다 */
  table: { f: null, s: null },
  tableHead: { f: ["bg", "th"], s: ["border", "th"] }, tableRow: { f: ["bg", "td"], s: ["border", "td"] },
  tableHeadText: { f: ["color", "th", "table", ".tablewrap", ".page", ".main", "body"] }, tableRowText: { f: ["color", "td", "table", ".tablewrap", ".page", ".main", "body"] },
  elevStage: { f: ["bg", ".elev-types .demo"], s: ["border", ".elev-types .demo"] }, elevItem: { f: null, s: null },
  elevSurface: { f: ["bg", ".elev-types .demo i"], s: ["border", ".elev-types .demo i"] },
  shellDemo: { f: ["bg", ".shell-demo"], s: ["border", ".shell-demo"] }, shellSide: { f: ["bg", ".shell-demo .side"], s: ["border", ".shell-demo .side"] },
  propList: { f: null, s: null }, propHead: { f: null, s: null }, propChip: { f: null, s: null }, propContent: { f: null, s: null },
  specRow: { f: null, s: null }, text: { f: null },
};
const DOC_PAGES = ["4 Pattern", "3 Component", "2 Element"];   // 대조 대상(k38 4 Pattern, k39 + 3 Component · 2 Element). 나머지 현재 페이지는 현황 NOTE
function docFrameExpect() {
  /* @media 블록은 뺀다 — 좁은 화면 규칙이 색을 바꾸지 않고, 남기면 바깥 셀렉터로 섞인다. 같은 셀렉터의 규칙은 전부 합친다(body 는 두 규칙 — cssRule 은 첫 규칙만 준다) */
  let css = read("_build/style.src.css").replace(/\/\*[\s\S]*?\*\//g, ""), top = "";
  for (let i = 0; i < css.length; i++) {
    if (css[i] === "@") { let d = 0; for (; i < css.length; i++) { if (css[i] === "{") d++; else if (css[i] === "}") { d--; if (d === 0) break; } else if (css[i] === ";" && d === 0) break; } continue; }
    top += css[i];
  }
  const decl = (sel) => { const o = {}; let hit = false;
    for (const r of top.matchAll(/([^{}]+)\{([^{}]*)\}/g)) if (splitSelectors(r[1]).includes(sel)) { hit = true; for (const x of r[2].split(";")) { const i = x.indexOf(":"); if (i > 0) o[x.slice(0, i).trim()] = x.slice(i + 1).trim(); } }
    if (!hit) throw new Error("CSS 규칙 없음(문서 틀): " + sel); return o; };
  const one = (spec) => {
    const [kind, ...chain] = spec;
    if (kind === "color") { for (const s of chain) { const v = decl(s).color; if (v) return { tok: figTok(v), raw: figTok(v) ? null : v, from: s + " color" }; } throw new Error("문서 틀 글자색을 못 찾음: " + chain.join(" → ")); }
    /* 테두리는 border · border-color 외에 한 변(th · td 의 border-bottom, .shell-demo .side 의 border-right)도 본다 */
    const d = decl(chain[0]), v = kind === "bg" ? d.background || d["background-color"] : ["border", "border-color", "border-bottom", "border-right", "border-top", "border-left"].map((k) => d[k]).find(Boolean);
    if (!v) return { none: true, from: chain[0] + (kind === "bg" ? " 배경 없음" : " 테두리 없음") };
    return { tok: figTok(v), raw: figTok(v) ? null : v, from: chain[0] + (kind === "bg" ? " background" : " border") };
  };
  const roles = {};
  for (const [r, o] of Object.entries(DOC_ROLES)) roles[r] = { f: o.f ? one(o.f) : null, s: o.s ? one(o.s) : null };
  return { roles };
}
function diffDocFrames(c, w, bad, notes) {
  const d = c && c.docFrames;
  if (!d) { notes.push("덤프에 문서 틀 조사(docFrames)가 없습니다 — 2026-11-06 k38 전 probe.js 입니다"); return; }
  const pages = d.pages || { "4 Pattern": d.pattern || [] };   // k38 덤프는 pattern 하나
  for (const pg of DOC_PAGES) if (!(pages[pg] || []).some((n) => n.role === "card")) bad.push(`${pg} 문서 카드(Card/… = Header + Body)를 하나도 찾지 못했습니다${d.pages ? "" : " — k39 전 probe 덤프"}`);
  for (const [r, o] of Object.entries(w.roles)) for (const k of ["f", "s"]) if (o[k] && o[k].raw) notes.push(`문서 틀 ${r} 의 사이트 셸 값이 토큰이 아닙니다(${o[k].from}: ${o[k].raw}) — 대조하지 않고 알립니다. 하드코딩하지 않습니다`);
  const groups = new Map(), secStroke = []; let secN = 0;
  for (const [pg, nodes] of Object.entries(pages)) {
  const push = (msg) => { if (!groups.has(msg)) groups.set(msg, { n: 0, ids: [] }); const g = groups.get(msg); g.n += cnt; for (const i of ids) if (g.ids.length < 3) g.ids.push(i); };
  let cnt = 1, ids = [];
  for (const n of nodes) {
    /* k39 probe 는 같은 (역할 · 패널 · 칠 · 선 · 글 여부)를 묶어 n · ids 로 준다. k38 덤프는 노드마다(id · tx) */
    const text = n.t ? true : n.tx !== undefined; ids = n.ids || [n.id]; cnt = n.n || 1;
    const role = w.roles[n.role] || { f: null, s: null };
    for (const k of ["f", "s"]) {
      if (n[k] === undefined) continue;
      const vals = n[k].split(",").filter((x) => x && x !== "-" && x !== "transparent");
      const label = `${pg} ${n.role}${n.name ? "(" + n.name + ")" : ""} ${text ? "글자" : k === "f" ? "칠" : "선"}`;
      if (n.role === "section" && k === "s") { if (vals.some((x) => /^raw#/.test(x))) { secN += cnt; secStroke.push(...ids.map((i) => pg + " " + i)); } continue; }
      const raw = vals.filter((x) => /^raw#/.test(x)), stat = vals.filter((x) => /^\$static\//.test(x)), nonSem = vals.filter((x) => /^\$(color|site)\//.test(x));   // probe 의 vname 은 color/semantic/ 만 떼므로 atomic · 옛 site/* 는 앞마디가 남는다
      if (raw.length) push(`${label} raw 색 ${raw.join(",")} — 변수에 묶여야 합니다`);
      if (stat.length) push(`${label} ${stat.join(",")} — 모드마다 같은 값이라 다크에서 안 바뀝니다`);
      if (nonSem.length) push(`${label} ${nonSem.join(",")} — 시멘틱 변수가 아닙니다`);
      let exp = role[k];
      if (n.role === "panel" && !vals.length) exp = null;   // 면 없는 패널('개발 상태' · Component 칸)은 부모 면이 비친다
      if (!exp || exp.raw) continue;
      if (exp.none) { if (vals.length) push(`${label} ${vals.join(",")} ≠ 없음 — ${exp.from}`); continue; }
      if (vals.length !== 1 || vals[0] !== "$" + exp.tok) push(`${label} ${vals.join(",") || "없음"} ≠ $${exp.tok} — ${exp.from}`);
    }
  }
  }
  for (const [msg, g] of groups) bad.push(`문서 틀 ${msg} · ${g.n}개(${g.ids.join(" · ")}${g.n > g.ids.length ? " …" : ""})`);
  if (secStroke.length) notes.push(`문서 틀 섹션 ${secN}개의 선이 raw 색(Figma 섹션 기본 선)입니다 — 사이트 셸에 대응이 없어 묶지 않았습니다(${secStroke.join(" · ")})`);
  for (const [pg, o] of Object.entries(d.others || {})) {
    const f = o.frame, i = o.inside;
    if (!o.cards && !f.nodes) continue;
    notes.push(`문서 틀 현황(보고만 — 사람이 범위를 정함) ${pg}: 문서 카드 ${o.cards} · 틀 노드 ${f.nodes} 중 raw ${f.raw} · static ${f.static} / 패널 안 ${i.nodes} 중 raw ${i.raw} · static ${i.static}`);
  }
}

/* Variant outline · flat(2026-11-03 k32) — 규칙은 flatExpect 머리 주석. probe 의 components.sets(이름 · 테두리 · 두께 · 그림자 · 면 · 크기)로 Card · KPI · Chart Card 를 본다.
   Card 의 변형 표(어느 Type × Size 에 Flat 이 있어야 하나)는 diffCard 가, 여기서는 세 세트 공통 — 축 값 · 기본 변형 · Flat 의 보더 · 크기 · 면 · 그림자 · (KPI · Chart Card) 짝 빠짐 */
function diffFlat(c, wf, bad, notes) {
  if (!c || !c.sets) return;
  if (!wf || wf.error) { bad.push(`Variant(outline · flat) 기대값을 저장소에서 읽지 못했습니다 — ${wf ? wf.error : "없음"}`); return; }
  const ax = (name) => Object.fromEntries(String(name).split(", ").map((kv) => kv.split("=")).filter((x) => x.length === 2).map(([k, v]) => [k.trim(), v.trim()]));
  const rest = (o) => Object.keys(o).filter((k) => k !== "Variant").sort().map((k) => k + "=" + o[k]).join(", ");
  for (const [set, w] of Object.entries(wf)) {
    const vs = c.sets[set]; if (!vs) continue;   // 세트가 없으면 missingSets 가 낸다
    const by = new Map(), noAxis = [], odd = [];
    for (const v of vs) { const o = ax(v.name); if (!o.Variant) { noAxis.push(v); continue; } if (!w.names.includes(o.Variant)) odd.push(v); by.set(o.Variant + "|" + rest(o), v); }
    if (noAxis.length) bad.push(`${set} 에 Variant 축이 없는 변형 ${noAxis.length}개 — ${noAxis.slice(0, 3).map((v) => v.name + "(" + v.id + ")").join(" · ")}${noAxis.length > 3 ? " …" : ""}(Variant = ${w.names.join(" · ")} — components.data.js figma.variant)`);
    if (odd.length) bad.push(`${set} 에 저장소에 없는 Variant 값 — ${odd.slice(0, 3).map((v) => v.name + "(" + v.id + ")").join(" · ")}(${w.names.join(" · ")})`);
    const d = (c.defaults || {})[set];
    if (c.defaults && ax(d || "").Variant !== w.def) bad.push(`${set} 기본 변형 ${d} 의 Variant ≠ ${w.def} — props variant 기본값`);
    for (const v of vs) {
      const o = ax(v.name); if (!o.Variant || o.Variant === w.def) continue;
      const at = `${set} ${v.name} (${v.id})`, tw = by.get(w.def + "|" + rest(o));
      if (v.stroke !== w.flat || v.sw !== w.sw) bad.push(`${at} 보더 ${v.stroke} ${v.sw}px ≠ ${w.sw}px ${w.flat} — 사이트 ${w.css} border-color(두께는 남김)`);
      if (v.shadow) bad.push(`${at} 그림자 ${v.shadow}개 — flat 은 그림자를 두지 않습니다(사람의 결정 2026-11-03)`);
      if (!tw) { bad.push(`${at} 짝(${w.def}) 변형이 없습니다`); continue; }
      if (v.fill !== tw.fill) bad.push(`${at} 면 ${v.fill} ≠ ${w.def} ${tw.fill} — flat 은 보더만 다릅니다`);
      if (v.w === undefined || tw.w === undefined) bad.push(`${at} 크기를 덤프에 내지 않았습니다 — probe.js(k32)로 다시 덤프`);
      else if (Math.abs(v.w - tw.w) > 0.5 || Math.abs(v.h - tw.h) > 0.5) bad.push(`${at} 크기 ${v.w}×${v.h} ≠ ${w.def} ${tw.w}×${tw.h} — flat 은 보더 자리(1px)를 남겨 크기가 같다`);
    }
    /* Flat 인스턴스가 놓인 바탕 — 면이 보이는 가장 가까운 조상의 칠이 figma.variant.flat.canvas 여야 한다(흰 바탕 금지 — 사람의 결정 2026-11-03) */
    if (c.flatCanvas === undefined) { if (set === "Card") notes.push("덤프에 Flat 바탕 조사(components.flatCanvas)가 없습니다 — 2026-11-03 k32 전 probe.js 로 만든 덤프입니다"); }
    else for (const f of c.flatCanvas.filter((x) => x.set === set)) if (f.bg !== "$" + w.canvas) bad.push(`${set} Flat 인스턴스 ${f.id}(${f.page}) 의 바탕 ${f.bg || "없음"} ≠ ${w.canvas} — flat 은 회색 바탕 위에서만(사람의 결정 2026-11-03)`);
    /* KPI · Chart Card 는 상태 축이 없어 모든 변형이 두 Variant 로 짝이다. Card 의 Flat 범위(State=Default 만)는 diffCard 의 변형 표가 본다 */
    if (set !== "Card") for (const v of vs) { const o = ax(v.name); if (o.Variant !== w.def) continue; for (const n of w.names) if (n !== w.def && !by.has(n + "|" + rest(o))) bad.push(`${set} ${v.name} (${v.id}) 의 짝 Variant=${n} 변형이 없습니다`); }
  }
}

/* Chart 세트(2026-11-04 k33) — 규칙은 chartExpect 머리 주석. probe 의 components.chart(변형마다 카드 · 제목 · 캔버스 · 마크 · 범례 · 툴팁)로 본다. 옛 덤프에는 components.chart 가 없다 — 그때는 NOTE */
function diffChart(c, w, variables, bad, notes) {
  if (!c) return;
  if (!w || w.error) { bad.push(`Chart 기대값을 저장소에서 읽지 못했습니다 — ${w ? w.error : "없음"}`); return; }
  if (c.chart === undefined) { notes.push("덤프에 Chart 세트 조사(components.chart)가 없습니다 — 2026-11-04 k33 전 probe.js 로 만든 덤프입니다"); return; }
  if (!c.chart) { bad.push(`컴포넌트 세트 없음: Chart — Type = ${w.types.map((t) => t[0].toUpperCase() + t.slice(1)).join(" · ")} 네 변형(components.data.js data-visual.figma.chart.types)`); return; }
  const ch = c.chart, T = (x) => (x === "-" || x == null ? "-" : "$" + x);
  const varPx = {}; for (const col of Object.values(variables || {})) for (const [k, v] of Object.entries(col.values || {})) if (/^N/.test(String(v).split("|")[0])) varPx[k] = +String(v).split("|")[0].slice(1);
  const have = new Map(ch.variants.map((v) => [v.name, v]));
  const miss = Object.keys(w.variants).filter((n) => !have.has(n)), stray = ch.variants.filter((v) => !w.variants[v.name]);
  if (miss.length) bad.push(`Chart 에 없는 변형 ${miss.length}개 — ${miss.join(" · ")}(figma.chart.types)`);
  if (stray.length) bad.push(`Chart 에 저장소에 없는 변형 ${stray.length}개 — ${stray.map((v) => v.name + "(" + v.id + ")").join(" · ")}(Type = ${w.types.join(" · ")} 뿐)`);
  const bound = (at, what, got, gotV, want) => {
    for (let i = 0; i < want.length; i++) {
      if (got[i] !== want[i]) { bad.push(`${at} ${what} ${JSON.stringify(got)} ≠ ${JSON.stringify(want)}`); return; }
      if (!gotV[i]) { bad.push(`${at} ${what} ${want[i]} 가 변수에 묶여 있지 않습니다`); return; }
      if (varPx[gotV[i]] !== want[i]) { bad.push(`${at} ${what} 의 변수 ${gotV[i]} 값 ${varPx[gotV[i]]} ≠ ${want[i]}`); return; }
    }
  };
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  for (const [name, wv] of Object.entries(w.variants)) {
    const v = have.get(name); if (!v) continue;
    const at = `Chart ${name} (${v.id})`;
    /* 카드 — Chart Card 와 같은 면 · 보더 · padding · gap · 모서리 */
    if (v.fill !== T(w.surface)) bad.push(`${at} 면 ${v.fill} ≠ ${w.surface} — .chart-card background`);
    if (v.stroke !== T(w.stroke) || v.sw !== w.sw) bad.push(`${at} 보더 ${v.stroke} ${v.sw}px ≠ ${w.stroke} ${w.sw}px — .chart-card border`);
    bound(at, "padding", v.pad, v.padV, w.pad); bound(at, "gap", [v.gap], [v.gapV], [w.gapPx]);
    if (v.rv !== w.radius) bad.push(`${at} 모서리 변수 ${v.rv} ≠ ${w.radius} — data-visual figma.radius`);
    /* 제목 · 보조 글 — 예제 .chart-title */
    if (!v.title) bad.push(`${at} 제목(Chart Title) 없음`);
    else { if (v.title.chars !== wv.title) bad.push(`${at} 제목 [${v.title.chars}] ≠ 예제 [${wv.title}]`); if (v.title.st !== w.titleStyle) bad.push(`${at} 제목 스타일 ${v.title.st} ≠ ${w.titleStyle} — .chart-card .chart-title`); }
    if ((v.meta ? v.meta.chars : null) !== wv.meta) bad.push(`${at} 보조 글 [${v.meta ? v.meta.chars : "없음"}] ≠ 예제 [${wv.meta || "없음"}]`);
    /* 캔버스 · 마크 */
    if (!v.canvas) { bad.push(`${at} Canvas 없음`); continue; }
    if (wv.cardW != null && !near(v.w, wv.cardW, 0.5)) bad.push(`${at} 카드 폭 ${v.w} ≠ ${wv.cardW} — 예제 ${wv.ex} 의 chart-card max-width`);
    if (wv.canvasW != null && !near(v.canvas.w, wv.canvasW, 1)) bad.push(`${at} 캔버스 폭 ${v.canvas.w} ≠ ${wv.canvasW} — 예제 ${wv.ex} max-width ${wv.cardW} − padding − 보더`);
    if (!near(v.canvas.h, w.canvasH, 0.5)) bad.push(`${at} 캔버스 높이 ${v.canvas.h} ≠ ${w.canvasH} — figma.chart.canvasH(.chart-canvas height)`);
    const lines = v.lines || [], areas = v.areas || [], bars = v.bars || [], arcs = v.arcs || [], pts = v.points || [];
    if (lines.length !== wv.lines) bad.push(`${at} 선 ${lines.length}개 ≠ ${wv.lines}(예제 계열)`);
    for (const l of lines) if (l.sw !== w.line) bad.push(`${at} 선 ${l.name} 굵기 ${l.sw} ≠ ${w.line} — figma.chart.line`);
    const lineColors = wv.lineColors || (wv.lines ? wv.colors : []);
    lines.forEach((l, i) => { if (lineColors[i] && l.stroke !== T(lineColors[i])) bad.push(`${at} 선 ${l.name} 색 ${l.stroke} ≠ ${lineColors[i]} — 계열 ${i + 1}(tone → 심각도 토큰, 없으면 chart/series)`); });
    if (wv.areas !== undefined) { if (areas.length !== wv.areas) bad.push(`${at} 영역 ${areas.length}개 ≠ ${wv.areas}(stacked 계열)`); areas.forEach((a, i) => { if (wv.colors[i] && a.fill !== T(wv.colors[i])) bad.push(`${at} 영역 ${a.name} 색 ${a.fill} ≠ ${wv.colors[i]}`); if (!near(a.opacity, w.alpha, 0.005)) bad.push(`${at} 영역 ${a.name} 불투명도 ${a.opacity} ≠ ${w.alpha} — ds-chart alpha`); }); }
    else if (areas.length) bad.push(`${at} 영역 ${areas.length}개 — 이 유형에는 영역이 없습니다`);
    if (wv.bars !== undefined) {
      if (bars.length !== wv.bars) bad.push(`${at} 막대 ${bars.length}개 ≠ ${wv.bars}(라벨 × 계열)`);
      const per = wv.barsPer || [wv.bars]; const barColors = wv.barColors || wv.colors; let k = 0;
      per.forEach((n, s) => { for (let j = 0; j < n && k < bars.length; j++, k++) { const b = bars[k]; if (b.fill !== T(barColors[s])) bad.push(`${at} 막대 ${b.name} 색 ${b.fill} ≠ ${barColors[s]} — 계열 ${s + 1}`); if (b.r.some((r) => r !== w.barRadius)) bad.push(`${at} 막대 ${b.name} 모서리 ${JSON.stringify(b.r)} ≠ 네 귀 모두 ${w.barRadius} — figma.chart.barRadius(ds-chart borderRadius)`); if (b.st !== undefined && b.st !== w.barStroke) bad.push(`${at} 막대 ${b.name} 보이는 테두리 ${b.st}개 ≠ ${w.barStroke} — figma.chart.barStroke(막대는 stroke 없음)`); if (b.w > w.barMax + 0.01) bad.push(`${at} 막대 ${b.name} 두께 ${b.w} > ${w.barMax} — figma.chart.barMax`); } });
      if (bars.length && bars[0].st === undefined) notes.push(`${at} 막대 테두리 조사가 없습니다 — k35 전 probe.js 로 만든 덤프입니다`);
      /* 누적 막대 — 같은 라벨의 이웃 세그먼트 사이 틈 = stackGap(투명 — 그 자리에 칠한 노드가 없어야 한다). Figma 의 Bar 변형이 비누적(weeks)이면 대상이 없다 */
      if (wv.stacked && bars.length && bars[0].x !== undefined) {
        const along = wv.horizontal ? ["y", "x", "w"] : ["x", "y", "h"], groups = new Map();
        for (const b of bars) { const k = Math.round(b[along[0]]); groups.set(k, (groups.get(k) || []).concat(b)); }
        for (const [k, segs] of groups) { segs.sort((a, b) => a[along[1]] - b[along[1]]);
          for (let i = 1; i < segs.length; i++) { const g = +(segs[i][along[1]] - (segs[i - 1][along[1]] + segs[i - 1][along[2]])).toFixed(2); if (!near(g, w.stackGap, 0.5)) bad.push(`${at} 누적 세그먼트 ${segs[i - 1].name} → ${segs[i].name} 틈 ${g} ≠ ${w.stackGap} — ds-chart 누적 틈(figma.chart.gap)`); } }
      } else if (wv.stacked) notes.push(`${at} 누적 막대 위치 조사가 없습니다 — k35 전 probe.js 로 만든 덤프입니다`);
    } else if (bars.length) bad.push(`${at} 막대 ${bars.length}개 — 이 유형에는 막대가 없습니다`);
    if (wv.arcs) {
      if (arcs.length !== wv.arcs.length) bad.push(`${at} 호 ${arcs.length}개 ≠ ${wv.arcs.length}(조각)`);
      const sorted = arcs.slice().sort((a, b) => a.deg[0] - b.deg[0]);
      sorted.forEach((a, i) => { const e = wv.arcs[i]; if (!e) return; if (!near(a.deg[0], e[0], 0.6) || !near(a.deg[1], e[1], 0.6)) bad.push(`${at} 호 ${a.name} ${a.deg[0]}°~${a.deg[1]}° ≠ ${e[0]}°~${e[1]}°(값 비율)`); if (a.fill !== T(wv.colors[i])) bad.push(`${at} 호 ${a.name} 색 ${a.fill} ≠ ${wv.colors[i]}`); if (!near(a.inner, w.cutout, 0.005)) bad.push(`${at} 호 ${a.name} 구멍 ${a.inner} ≠ ${w.cutout} — figma.chart.cutout`); if (a.stroke !== T(w.surface) || a.sw !== w.donutBw) bad.push(`${at} 호 ${a.name} 테두리 ${a.stroke} ${a.sw}px ≠ ${w.surface} ${w.donutBw}px — 조각 사이 면 색 경계(ds-chart 도넛 borderWidth)`); });
      if (wv.center && (!v.center || v.center.chars !== wv.center)) bad.push(`${at} 가운데 글 [${v.center ? v.center.chars : "없음"}] ≠ [${wv.center}](spec.center)`);
    } else if (arcs.length) bad.push(`${at} 호 ${arcs.length}개 — 이 유형에는 호가 없습니다`);
    /* 격자 — y 축만(선 색 grid), 눈금 글자 — 12 · axis 토큰 · 스타일 */
    if (wv.arcs) { if ((v.grid || []).length) bad.push(`${at} 격자 ${v.grid.length}개 — 도넛에는 축이 없습니다`); }
    else { if (!(v.grid || []).length) bad.push(`${at} 격자 없음`); for (const g of v.grid || []) if (g.stroke !== T(w.grid) || g.sw !== 1) bad.push(`${at} 격자 ${g.name} ${g.stroke} ${g.sw}px ≠ ${w.grid} 1px — figma.chart.grid`);
      if (!v.ticks || !v.ticks.n) bad.push(`${at} 눈금 글자 없음`); else for (const kind of v.ticks.kinds) { const [st, fs, fill] = kind.split("|"); if (+fs !== w.fontSize) bad.push(`${at} 눈금 글자 크기 ${fs} ≠ ${w.fontSize} — ds-chart font size`); if (!w.styles12.includes(st)) bad.push(`${at} 눈금 글자 스타일 ${st} — ${w.fontSize}px 타입 스케일 스타일(${w.styles12.join(" · ")})에 묶여야 합니다`); if (fill !== T(w.axis)) bad.push(`${at} 눈금 글자 칠 ${fill} ≠ ${w.axis} — figma.chart.axis`); } }
    /* 범례 — 2계열 이상일 때, 계열 순서 · 견본 색 · 글자 */
    if (wv.legend) { if (!v.legend) bad.push(`${at} 범례 없음(2계열 이상)`); else { const items = v.legend.items;
      if (items.map((i) => i.text).join("|") !== wv.series.join("|")) bad.push(`${at} 범례 [${items.map((i) => i.text).join(" · ")}] ≠ [${wv.series.join(" · ")}](계열 순서)`);
      items.forEach((it, i) => { if (wv.colors[i] && it.swatch !== T(wv.colors[i])) bad.push(`${at} 범례 ${it.text} 견본 ${it.swatch} ≠ ${wv.colors[i]}`); if (!near(it.swW, w.legend.d, 0.5) || !near(it.swH, w.legend.d, 0.5)) bad.push(`${at} 범례 ${it.text} 견본 ${it.swW}×${it.swH} ≠ 지름 ${w.legend.d}(±0.5) — ds-chart legend boxHeight × √2`); if (it.swT !== undefined && !(it.swT === "ELLIPSE" || it.swR >= Math.min(it.swW, it.swH) / 2 - 0.01)) bad.push(`${at} 범례 ${it.text} 견본이 원이 아닙니다(${it.swT} 모서리 ${it.swR}) — ds-chart pointStyle ${w.legend.shape}`); if (it.fill !== T(w.axis)) bad.push(`${at} 범례 ${it.text} 글자 칠 ${it.fill} ≠ ${w.axis}`); if (!w.styles12.includes(it.st)) bad.push(`${at} 범례 ${it.text} 글자 스타일 ${it.st} — ${w.fontSize}px 스타일에 묶여야 합니다`); });
      /* 범례 자리(2026-11-06 k36) — 도넛은 ds-chart legendPosition(spec.legend, 캔버스 폭, 높이): 옆(right · left)이면 세로 목록이 캔버스 가운데보다 그쪽에,
         아래면 가로 목록이 캔버스 가운데보다 아래에. 선 · 막대 차트는 늘 아래 가로 */
      const pos = wv.legendPos, why = wv.arcs ? `예제 ${wv.ex}: ds-chart legendPosition("${wv.legendWant}", 캔버스 ${wv.canvasW}, ${w.canvasH}) — 폭 ${wv.canvasW} ${wv.canvasW < w.canvasH * w.sideRatio ? "<" : "≥"} 높이 × ${w.sideRatio} = ${+(w.canvasH * w.sideRatio).toFixed(2)}` : "선 · 막대 차트";
      if (wv.arcs) { const figPos = w.legendPosition(wv.legendWant, v.canvas.w, v.canvas.h); if (figPos !== pos) bad.push(`${at} Figma 캔버스 ${v.canvas.w}×${v.canvas.h} 로는 범례 자리가 ${figPos} 인데 변형은 ${pos} — ${why}`); }
      const side = pos === "left" || pos === "right";
      if (v.legend.dir !== (side ? "VERTICAL" : "HORIZONTAL")) bad.push(`${at} 범례 방향 ${v.legend.dir} ≠ ${side ? "VERTICAL(옆 범례는 세로 목록)" : "HORIZONTAL(아래 범례는 가로)"} — 자리 ${pos}, ${why}`);
      if (v.legend.x !== undefined && v.legend.y !== undefined) { const ok = pos === "right" ? v.legend.x >= v.canvas.w / 2 : pos === "left" ? v.legend.x < v.canvas.w / 2 : v.legend.y >= v.canvas.h / 2;
        if (!ok) bad.push(`${at} 범례 위치 (${v.legend.x}, ${v.legend.y}) 가 자리 ${pos} 가 아닙니다 — ${why}`); } } }
    else if (v.legend) bad.push(`${at} 범례가 있습니다 — 1계열에는 범례를 두지 않습니다`);
    /* hover 점 · 툴팁 — Timeseries 변형에만 하나씩 고정 */
    if (wv.points) { if (pts.length !== wv.points) bad.push(`${at} hover 점 ${pts.length}개 ≠ ${wv.points}(계열마다 하나)`); pts.forEach((p, i) => { if (!near(p.d, w.point, 0.01)) bad.push(`${at} hover 점 ${p.name} 지름 ${p.d} ≠ ${w.point} — figma.chart.point`); if (wv.colors[i] && p.fill !== T(wv.colors[i])) bad.push(`${at} hover 점 ${p.name} 색 ${p.fill} ≠ ${wv.colors[i]}`); if (p.stroke !== T(w.surface)) bad.push(`${at} hover 점 ${p.name} 테두리 ${p.stroke} ≠ ${w.surface}(pointBorderColor = 면)`); }); }
    else if (pts.length) bad.push(`${at} hover 점 ${pts.length}개 — 점은 Timeseries 변형의 hover 에만`);
    if (wv.tooltip) { const t = v.tooltip; if (!t) bad.push(`${at} 툴팁 없음`); else {
      if (t.fill !== T(w.tipBg)) bad.push(`${at} 툴팁 면 ${t.fill} ≠ ${w.tipBg} — figma.chart.tooltip.bg`);
      if (t.r !== w.tip.r) bad.push(`${at} 툴팁 모서리 ${t.r} ≠ ${w.tip.r} — ds-chart cornerRadius`);
      if (t.pad.some((p) => p !== w.tip.pad)) bad.push(`${at} 툴팁 padding ${JSON.stringify(t.pad)} ≠ ${w.tip.pad} — ds-chart padding`);
      if (!t.title || t.title.fill !== T(w.tipFg) || t.title.fs !== w.fontSize) bad.push(`${at} 툴팁 제목 ${t.title ? t.title.fill + " " + t.title.fs : "없음"} ≠ ${w.tipFg} ${w.fontSize}`);
      if (t.rows.length !== wv.series.length) bad.push(`${at} 툴팁 행 ${t.rows.length}개 ≠ ${wv.series.length}(계열)`);
      t.rows.forEach((r, i) => { if (r.fill !== T(w.tipFg)) bad.push(`${at} 툴팁 행 ${r.text} 칠 ${r.fill} ≠ ${w.tipFg}`); if (wv.colors[i] && r.swatch !== T(wv.colors[i])) bad.push(`${at} 툴팁 행 ${r.text} 견본 ${r.swatch} ≠ ${wv.colors[i]}`); if (r.swD !== w.tip.box) bad.push(`${at} 툴팁 행 ${r.text} 견본 지름 ${r.swD} ≠ ${w.tip.box} — ds-chart 툴팁 min(boxWidth, boxHeight)`); if (!r.text || !r.text.startsWith(wv.series[i] + ":")) bad.push(`${at} 툴팁 행 [${r.text}] 이 계열 ${wv.series[i]} 의 값이 아닙니다`); }); } }
    else if (v.tooltip) bad.push(`${at} 툴팁이 있습니다 — 툴팁은 Timeseries 변형에만 고정`);
  }
  /* 문서(Card/Data Visual)의 Chart 인스턴스 — 예제 순서대로 변형 하나씩(k36: donut-live 바로 뒤에 donut-narrow) */
  if (c.chartDoc === undefined) notes.push("덤프에 Data Visual 문서의 Chart 인스턴스 조사(chartDoc)가 없습니다 — 2026-11-06 k36 전 probe.js 로 만든 덤프입니다");
  else if (c.chartDoc.map((d) => d.main).join(" | ") !== w.order.join(" | ")) bad.push(`Data Visual 문서의 Chart 예시 [${c.chartDoc.map((d) => d.main + "(" + d.id + ")").join(" · ")}] ≠ 예제 순서 [${w.order.join(" · ")}](components.data.js data-visual 예제)`);
}

/* 정적 차트(2026-11-05 k35) — 규칙은 staticChartExpect 머리 주석. probe 의 sets["Chart Card"] · sets["KPI"] 의 barR · sparkR · legendSw · donutDividers,
   components.staticCharts(세트 밖 도넛 · 트랙 — 4 Pattern 대시보드), components.kpiDoc(Data Visual 문서 카드의 KPI 목록)으로 본다. 옛 덤프에는 이 필드가 없다 — 그때는 NOTE */
function diffStatic(c, w, bad, notes) {
  if (!c) return;
  if (!w || w.error) { bad.push(`정적 차트 기대값을 저장소에서 읽지 못했습니다 — ${w ? w.error : "없음"}`); return; }
  const sets = c.sets || {}, cc = sets["Chart Card"] || [], kp = sets["KPI"] || [];
  if (c.staticCharts === undefined) { notes.push("덤프에 정적 차트 조사(staticCharts · donutDividers · legendSw)가 없습니다 — 2026-11-05 k35 전 probe.js 로 만든 덤프입니다"); return; }
  const near = (a, b, t) => Math.abs(a - b) <= t;
  const flatR = (want) => (typeof want === "number" ? want : 0);   // "50%" 같은 값은 막대에 쓰지 않는다 — 막대 · 트랙은 px
  const barMax = Math.max(flatR(w.barR), flatR(w.fillR));
  /* 범례 견본 — "TYPE|wxh|rR" 묶음 */
  const legendCheck = (at, sw) => { if (!sw) return; for (const [k, n] of Object.entries(sw)) { const m = /^([A-Z]+)\|([\d.]+)x([\d.]+)\|r([\d.]+)$/.exec(k); if (!m) { bad.push(`${at} 범례 견본 조사 형식 ${k}`); continue; }
    const [, ty, ww, hh, rr] = m; if (+ww !== w.legend.d || +hh !== w.legend.h) bad.push(`${at} 범례 견본 ${n}개 ${ww}×${hh} ≠ ${w.legend.d}×${w.legend.h} — .chart-legend i`);
    if (w.legend.round && !(ty === "ELLIPSE" || +rr >= Math.min(+ww, +hh) / 2 - 0.01)) bad.push(`${at} 범례 견본 ${n}개가 원이 아닙니다(${ty} 모서리 ${rr}) — .chart-legend i border-radius 50%`); } };
  /* 도넛 — 호는 이어 붙고(틈 0) 테두리 없음, 경계선은 예제 --a 각도마다 하나 */
  const donutCheck = (at, gaps, strokes, divs) => {
    if (gaps && gaps.some((g) => !near(g, 0, 0.5))) bad.push(`${at} 호 사이 틈 ${gaps.join(" · ")}° — 조각은 이어 붙이고 경계는 구분선으로 냅니다(.donut conic-gradient)`);
    if (strokes) bad.push(`${at} 호 테두리 ${strokes}개 — 경계는 테두리가 아니라 2px 구분선(.donut i)`);
    if (!divs) { bad.push(`${at} 경계선 조사 없음`); return; }
    const d = w.donut.divider;
    if (divs.length !== w.donut.angles.length) bad.push(`${at} 경계선 ${divs.length}개 ≠ ${w.donut.angles.length}(예제 --a ${w.donut.angles.join(" · ")}°)`);
    w.donut.angles.forEach((a, i) => { const x = divs[i]; if (!x) return; const [ang, dist, dw, dh, paint, off] = x;
      const da = Math.abs(((ang - a + 540) % 360) - 180);
      if (da > 0.5 || !near(dist, d.dist, 0.5) || !near(dw, d.w, 0.01) || !near(dh, d.h, 0.01) || paint !== "$" + d.tok || off > 0.5)
        bad.push(`${at} 경계선 ${i + 1}: Figma ${ang}° 거리 ${dist} ${dw}×${dh} ${paint} 축 어긋남 ${off}° ≠ 저장소 ${a}° 거리 ${d.dist} ${d.w}×${d.h} ${d.tok} 반지름 방향(.donut i)`); });
  };
  /* 도넛 + 범례 행(k36) — 폭으로 옆 · 아래를 판정. 넉넉하면 가로 · 열 간격 · .donut-row 정렬 · 폭 채움, 범례가 도넛 오른쪽.
     좁으면(wrap 이고 쓸 수 있는 폭 < 도넛 + 열 간격 + 범례) 세로 · 행 간격 · 왼쪽 정렬, 범례가 도넛 아래 */
  const R = w.row, rowCheck = (at, g) => { if (!g) { bad.push(`${at} 도넛 + 범례 행 조사 없음`); return; }
    if (g.lw == null) { bad.push(`${at} 도넛 + 범례 행에 범례가 없습니다 (${g.id})`); return; }
    const need = +(g.dw + R.colGap + g.lw).toFixed(2), narrow = R.wrap && g.avail < need, why = `쓸 수 있는 폭 ${g.avail} ${g.avail < need ? "<" : "≥"} 도넛 ${g.dw} + ${R.colGap} + 범례 ${g.lw} = ${need}`;
    const want = narrow ? { lm: "VERTICAL", gap: R.rowGap, ca: "MIN", sh: "FILL" } : { lm: "HORIZONTAL", gap: R.colGap, pa: R.pa, ca: R.ca, sh: "FILL" };
    const got = { lm: g.lm, gap: g.gap, pa: g.pa, ca: g.ca, sh: g.sh }, diff = Object.keys(want).filter((k) => got[k] !== want[k]);
    if (diff.length) bad.push(`${at} 도넛 + 범례 행 (${g.id}) ${diff.map((k) => `${k} ${got[k]} ≠ ${want[k]}`).join(" · ")} — 범례 ${narrow ? "아래" : "옆"}(.donut-row gap ${R.rowGap} ${R.colGap}${R.wrap ? " · wrap" : ""}), ${why}`);
    if (g.wrap && g.wrap !== "NO_WRAP") bad.push(`${at} 도넛 + 범례 행 (${g.id}) 이 Figma 줄바꿈(${g.wrap})입니다 — 폭 판정으로 세로 · 가로를 정해 그립니다`);
    const placed = narrow ? g.ly >= g.dy + g.dw - 0.5 : g.lx >= g.dx + g.dw + R.colGap - 0.5;
    if (!placed) bad.push(`${at} 범례 (${g.lx}, ${g.ly}) 가 도넛 ${narrow ? "아래" : "오른쪽"}에 있지 않습니다 — ${why}`); };
  /* 정적 막대 내용(k42b) — 제목 · 캡션, 행 수 · 순서 · 라벨 · 값 · 톤 칠 · 채움 폭 = 트랙 폭 × width%(±0.5px) */
  const B = w.bar, barCheck = (at, v) => {
    if (v.barRows === undefined) { notes.push(`${at} 막대 내용 조사(barRows)가 없습니다 — 2026-11-09 k42b 전 probe.js 로 만든 덤프입니다`); return; }
    const src = "components.data.js data-visual bar 예제", want = [B.title, B.caption].filter((x) => x != null), got = (v.barTitle || []).map((x) => String(x).normalize("NFC").trim());
    if (got.join("|") !== want.join("|")) bad.push(`${at} 제목 · 캡션 ${got.join(" · ") || "없음"} ≠ ${want.join(" · ")} — ${src} .chart-title`);
    if (v.barRows.length !== B.rows.length) { bad.push(`${at} 막대 행 ${v.barRows.length}개(${v.barRows.map((r) => r[0]).join(" · ")}) ≠ ${B.rows.length}개(${B.rows.map((r) => r.lbl).join(" · ")}) — ${src}`); return; }
    B.rows.forEach((r, i) => { const [lb, num, p, fw, tw] = v.barRows[i], ct = `${at} ${i + 1}번째 행`, ex = tw * r.pct / 100;
      if (String(lb).normalize("NFC").trim() !== r.lbl) bad.push(`${ct} 라벨 '${lb}' ≠ '${r.lbl}' — ${src}`);
      if (String(num).normalize("NFC").trim() !== r.num) bad.push(`${ct} '${r.lbl}' 값 '${num}' ≠ '${r.num}' — ${src}`);
      if (p !== "$" + r.tok) bad.push(`${ct} '${r.lbl}' 막대 칠 ${p} ≠ ${r.tok} — .bar.${r.tone}(ds-chart TONES.${r.tone})`);
      if (fw == null || !near(fw, ex, 0.5)) bad.push(`${ct} '${r.lbl}' 채움 폭 ${fw} ≠ 트랙 ${tw} × ${r.pct}% = ${+ex.toFixed(2)} — ${src} <i style="width:${r.pct}%">`); });
  };
  for (const v of cc) {
    const at = `Chart Card ${v.name} (${v.id})`;
    if (v.donutGaps) { if (v.rowGeo === undefined) notes.push(`${at} 도넛 + 범례 행 배치 조사(rowGeo)가 없습니다 — 2026-11-06 k36 전 probe.js 로 만든 덤프입니다`); else rowCheck(at, v.rowGeo); }
    if (v.barR !== undefined && v.barR !== barMax) bad.push(`${at} 막대 · 트랙 모서리 ${v.barR} ≠ ${barMax} — .chart .bar · .chart .bar i border-radius`);
    if (/Type=Bar\b/.test(v.name)) barCheck(at, v);
    if (v.sparkR !== undefined && v.sparkR !== flatR(w.sparkR)) bad.push(`${at} 스파크라인 모서리 ${v.sparkR} ≠ ${w.sparkR} — .sparkline i border-radius`);
    legendCheck(at, v.legendSw);
    if (v.donutGaps) donutCheck(`${at} 도넛`, null, null, v.donutDividers);   // 틈 · 테두리는 diffComponents 의 Donut 대조가 본다
  }
  for (const v of kp) if (v.sparkR !== undefined && v.sparkR !== flatR(w.sparkR)) bad.push(`KPI ${v.name} (${v.id}) 스파크라인 모서리 ${v.sparkR} ≠ ${w.sparkR} — .sparkline i border-radius`);
  /* 세트 밖(4 Pattern 대시보드) — 도넛 · 트랙. 호 각도는 같은 .donut conic-gradient */
  /* 대시보드 차트 줄 카드 구성(k37) — 개수 · 순서 · 제목 · 기간 · 종류, 탐색형은 spec = 예제 · 범례 · 선 · 영역 · x 눈금 · Hover */
  const cardsCheck = (g, G) => { const at = `4 Pattern 차트 줄 (${g.id})`;
    if (g.cards === undefined) { notes.push(`${at} 카드 구성 조사(cards)가 없습니다 — 2026-11-06 k37 전 probe.js 로 만든 덤프입니다`); return; }
    const sig = (x) => `${x.title}(${x.kind})`;
    if (g.cards.length !== G.cards.length || g.cards.some((x, i) => x.title !== G.cards[i].title || x.kind !== G.cards[i].kind)) {
      bad.push(`${at} 카드 ${g.cards.map(sig).join(" · ")} ≠ ${G.cards.map(sig).join(" · ")} — patterns.data.js dashboard .${G.cls} 의 chart-card 순서 · 제목 · 종류`); return; }
    G.cards.forEach((w, i) => { const x = g.cards[i], ct = `${at} ${i + 1}번째 '${w.title}' (${x.id})`;
      if ((x.meta || null) !== w.meta) bad.push(`${ct} 기간 ${x.meta} ≠ ${w.meta} — .chart-title 의 <span>`);
      if (!w.spec) return;
      if (!x.chart) { bad.push(`${ct} Chart 세트 인스턴스가 아닙니다 — data-chart ${w.kind}`); return; }
      if (!w.specSame) bad.push(`${ct} 대시보드 data-spec 이 예제 ${w.specEx} 의 spec 과 다릅니다 — Figma Chart 변형은 예제 데이터를 그리므로 그대로 쓸 수 없습니다`);
      const ser = (w.spec.series || []).map((s2) => s2.label);
      if (w.kind === "timeseries") {
        if (x.lines.join() !== ser.join()) bad.push(`${ct} 선 ${x.lines.join(" · ") || "없음"} ≠ 계열 ${ser.join(" · ")}`);
        const wa = w.spec.stacked ? ser : []; if (x.areas.join() !== wa.join()) bad.push(`${ct} 영역 ${x.areas.join(" · ") || "없음"} ≠ ${wa.join(" · ") || "없음"} — stacked ${!!w.spec.stacked}`);
        const out = x.ticksX.filter((t) => !w.spec.labels.includes(t)); if (!x.ticksX.length || out.length) bad.push(`${ct} x 눈금 ${x.ticksX.join(" · ") || "없음"} — labels 밖 ${out.join(" · ") || "(없음)"}`);
      }
      const wl = ser.length > 1 ? ser : []; if (x.legend.join() !== wl.join()) bad.push(`${ct} 범례 ${x.legend.join(" · ") || "없음"} ≠ ${wl.join(" · ") || "없음"} — 계열 2개 이상일 때 범례`);
      if (x.hover) bad.push(`${ct} Hover(점 · 툴팁)가 보입니다 — 대시보드는 쉬는 상태라 사이트에 툴팁이 없습니다`); }); };
  const sc = c.staticCharts;
  for (const d of sc.donuts) { const at = `${d.page} 도넛 ${d.path} (${d.id})`;
    if (!near(d.d, w.donut.d, 0.5)) bad.push(`${at} 지름 ${d.d} ≠ ${w.donut.d} — .donut width`);
    donutCheck(at, d.gaps, d.strokes, d.dividers); legendCheck(at, d.legendSw); if (d.row !== undefined) rowCheck(at, d.row);
    /* 대시보드 차트 줄 비율(k36) — 카드 폭 = (줄 폭 − gap × (n − 1)) × fr / Σfr (±1), 간격 = gap, 도넛 카드 자리 = idx */
    if (d.page === "4 Pattern") { const g = d.grid, G = w.grid;
      if (g === undefined) notes.push(`${at} 차트 줄 조사(grid)가 없습니다 — 2026-11-06 k36 전 probe.js 로 만든 덤프입니다`);
      else if (!g) bad.push(`${at} 차트 줄(카드의 부모)을 찾지 못했습니다`);
      else { const sum = G.fr.reduce((a2, b2) => a2 + b2, 0), inner = g.w - g.pad - G.gap * (G.fr.length - 1), want = G.fr.map((f) => +((inner * f) / sum).toFixed(2));
        if (g.ws.length !== G.fr.length) bad.push(`${at} 차트 줄 (${g.id}) 카드 ${g.ws.length}개 ≠ .${G.cls} 열 ${G.fr.length}개(${G.fr.join("fr ")}fr)`);
        else { if (g.ws.some((x, i) => Math.abs(x - want[i]) > 1)) bad.push(`${at} 차트 줄 (${g.id}) 카드 폭 ${g.ws.join(" · ")} ≠ ${want.join(" · ")} — .${G.cls} ${G.fr.join("fr ")}fr · gap ${G.gap}(줄 폭 ${g.w})`);
          if (g.gap !== G.gap) bad.push(`${at} 차트 줄 (${g.id}) 간격 ${g.gap} ≠ ${G.gap} — .${G.cls} gap`);
          if (g.idx !== G.idx) bad.push(`${at} 도넛 카드가 차트 줄의 ${g.idx + 1}번째 ≠ ${G.idx + 1}번째(patterns.data.js dashboard)`); }
        cardsCheck(g, G); } } }
  for (const r of sc.instRows || []) rowCheck(`${r.page} 인스턴스 ${r.inst} 도넛 (${r.id})`, r.row);
  for (const t of sc.tracks) if (t.r !== barMax) bad.push(`${t.page} 막대 트랙 (${t.id}) 모서리 ${t.r} ≠ ${barMax} — .chart .bar · .chart .bar i border-radius`);
  if (!sc.donuts.length) notes.push("세트 밖 정적 도넛이 없습니다(4 Pattern 대시보드)");
  /* KPI 문서 목록 — 예제 kpi 의 카드 수, 대시보드에만 있는 라벨 없음 */
  if (c.kpiDoc === undefined || c.kpiDoc === null) notes.push("덤프에 Data Visual 문서 카드의 KPI 목록 조사(kpiDoc)가 없습니다");
  else if (c.kpiDoc.some((l) => l.kpi.some((k) => typeof k === "string"))) notes.push("덤프의 kpiDoc 이 라벨만 담고 있습니다 — 2026-11-05 k35b 전 probe.js 로 만든 덤프라 KPI 글 · 칠 대조를 건너뜁니다");
  else {
    /* KPI 단위 글자 모양(k35c) — 맞는 스타일이 있으면 그 스타일, 없으면 스타일 없이 값. Noto 로 남은 노드는 font-revert-nodes.tsv(사람이 되돌릴 목록)에 있어야 NOTE, 없으면 어긋남.
       인스턴스 노드(I…;원본)는 원본 id 가 목록에 있어도 된다 — 덮어쓰지 않은 인스턴스는 원본을 따른다 */
    const U = w.kpi.unit, WN = { 400: ["Regular"], 500: ["Medium"], 600: ["SemiBold", "Semi Bold"], 700: ["Bold"] }, notoUnits = [];
    let revertIds = null;
    const reverts = () => revertIds || (revertIds = new Set(read("_figma/font-revert-nodes.tsv").split("\n").filter((l) => l && !l.startsWith("#")).map((l) => (l.split("\t")[1] || "").trim())));
    const unitCheck = (at, t) => {
      if (!t) return;
      const d = [];
      if (U.style) { if (t.st !== U.style) d.push(`스타일 ${t.st} ≠ ${U.style}`); }
      else {
        if (t.st) d.push(`스타일 ${t.st} 에 묶임 — ${U.fs}/${U.wt} 에 맞는 타입 스케일 스타일이 없어 스타일 없이 값으로 둔다`);
        if (t.fs !== U.fs) d.push(`크기 ${t.fs} ≠ ${U.fs}`);
        if (!(WN[U.wt] || []).some((n) => String(t.font).endsWith(" " + n))) d.push(`굵기 ${t.font} ≠ ${U.wt}`);
        if (typeof t.lh !== "number" || Math.abs(t.lh - U.lh) > 0.05) d.push(`행간 ${t.lh} ≠ ${U.lh}`);
        if (!/px$/.test(String(t.ls)) || Math.abs(parseFloat(t.ls) - U.ls) > 0.02) d.push(`자간 ${t.ls} ≠ ${U.ls}px`);
      }
      /* 스타일에 묶였으면 서체는 스타일이 정한다(k35d — Title/1 Medium 이 Noto 로 만들어져 있으면 텍스트 스타일 대조가 NOTE 로 알린다) */
      if (/^Noto /.test(String(t.font)) && !(U.style && t.st === U.style)) { if (reverts().has(t.id) || reverts().has(t.id.split(";").pop())) notoUnits.push(t.id); else d.push(`${t.font} 인데 _figma/font-revert-nodes.tsv 에 없습니다`); }
      if (d.length) bad.push(`${at} 단위 (${t.id}) ${d.join(" · ")} — .kpi .value small`);
    };
    /* 증감 글자(k35d) — .kpi .delta 에 맞는 타입 스케일 스타일(Label/2 SemiBold)에 묶였는지. 옛 덤프(dtype 없음)는 한 번만 NOTE */
    const DL = w.kpi.delta; let noDtype = 0, deltaN = 0;
    const deltaCheck = (at, k) => {
      if (!k || k.delta == null) return;
      if (k.dtype === undefined) { noDtype++; return; }
      deltaN++;
      const t = k.dtype, d = [];
      if (!t) d.push("증감 글자를 찾지 못함");
      else { if (t.st !== DL.style) d.push(`스타일 ${t.st} ≠ ${DL.style}`); if (t.fs !== DL.fs) d.push(`크기 ${t.fs} ≠ ${DL.fs}`); if (typeof t.lh !== "number" || Math.abs(t.lh - DL.lh) > 0.05) d.push(`행간 ${t.lh} ≠ ${DL.lh}`); if (typeof t.h === "number" && Math.abs(t.h - DL.lh) > 0.5) d.push(`높이 ${t.h} ≠ ${DL.lh}`); }
      if (d.length) bad.push(`${at} 증감 (${t ? t.id : k.id}) ${d.join(" · ")} — .kpi .delta ${DL.fs}/${DL.lh}/${DL.wt}`);
    };
    /* 저장소 KPI 카드 목록과 Figma 카드 목록을 순서대로 — 글(라벨 · 값 · 단위 · 증감 · 화살표)과 칠 */
    const kpiCompare = (where, got, want, src) => {
      if (got.length !== want.length) bad.push(`${where} 카드 ${got.length}개 ≠ ${want.length}(${src} — ${want.map((k) => k.label).join(" · ")})`);
      const F = { label: "라벨", value: "값", unit: "단위", delta: "증감 글", arrow: "화살표", lfill: "라벨 칠", vfill: "값 칠", ufill: "단위 칠", dfill: "증감 칠" };
      for (let i = 0; i < Math.min(got.length, want.length); i++) {
        const g = got[i], x = want[i], diffs = [];
        for (const f of Object.keys(F)) { const gv = /fill$/.test(f) ? (g[f] ? String(g[f]).replace(/^\$/, "") : null) : g[f]; if ((gv ?? null) !== (x[f] ?? null)) diffs.push(`${F[f]} ${JSON.stringify(gv ?? null)} ≠ ${JSON.stringify(x[f] ?? null)}`); }
        if (g.tone != null && g.tone.toLowerCase() !== x.tone) diffs.push(`Tone ${g.tone} ≠ ${x.tone}`);
        /* 증감 방향 = Delta 값(class 없음 → None) · 칠은 변형이 정한다 — 덮어쓰기로 흉내 내지 않는다(k35c) */
        const wd = x.dir == null ? null : { "": "None", up: "Up", down: "Down" }[x.dir];
        if (g.dir != null && wd && g.dir !== wd) diffs.push(`Delta ${g.dir} ≠ ${wd}(.delta${x.dir ? "." + x.dir : " class 없음"})`);
        if (Array.isArray(g.ov)) {
          const fills = g.ov.filter((o) => /fills/.test(o.split(":").pop()));
          if (fills.length) diffs.push(`칠 덮어쓰기 ${fills.join(" · ")} — 칠은 Tone · Delta 변형이 정한다`);
          if (x.dir === "" && g.ov.length) diffs.push(`덮어쓰기 ${g.ov.join(" · ")} — class 없는 증감은 Delta=None 그대로`);
        }
        unitCheck(`${where} ${i + 1}번째 카드`, g.utype);
        deltaCheck(`${where} ${i + 1}번째 카드`, g);
        if (diffs.length) bad.push(`${where} ${i + 1}번째 카드 (${g.id}) ${diffs.join(" · ")} — ${src}`);
      }
    };
    const exRow = c.kpiDoc.find((l) => /^KPI · 예제/.test(l.heading || ""));
    if (!exRow) bad.push(`Data Visual 문서 카드에 'KPI · 예제 =' 목록이 없습니다(components.data.js data-visual 예제 kpi — ${w.kpi.example.map((k) => k.label).join(" · ")})`);
    else kpiCompare("Data Visual 문서 'KPI · 예제'", exRow.kpi, w.kpi.example, "components.data.js data-visual 예제 kpi");
    const toneRow = c.kpiDoc.find((l) => /^KPI · Tone/.test(l.heading || ""));
    if (!toneRow) bad.push("Data Visual 문서 카드에 'KPI · Tone =' 목록이 없습니다");
    else {
      const got = toneRow.kpi.map((k) => k.tone).join(" · "), labs = [...new Set(toneRow.kpi.map((k) => k.label))];
      if (got !== w.kpi.tones.join(" · ")) bad.push(`Data Visual 문서 'KPI · Tone =' 카드 Tone ${got} ≠ ${w.kpi.tones.join(" · ")}(Default + CSS .kpi.<톤> .value)`);
      if (labs.length !== 1) bad.push(`Data Visual 문서 'KPI · Tone =' 라벨이 여럿입니다(${labs.join(" · ")}) — Tone 하나만 바꿔 보여 주는 행이라 라벨은 같아야 합니다`);
    }
    for (const l of c.kpiDoc) for (const k of l.kpi) if (w.kpi.dashOnly.includes(k.label)) bad.push(`Data Visual 문서 '${l.heading}' 에 예제 kpi 에 없는 카드 '${k.label}' — 대시보드 패턴에만 있는 라벨`);
    if (c.kpiDash === undefined) notes.push("덤프에 4 Pattern 대시보드 KPI 조사(kpiDash)가 없습니다 — 2026-11-05 k35b 전 probe.js 로 만든 덤프입니다");
    else if (!c.kpiDash) bad.push("4 Pattern 에 'Card/대시보드' 가 없습니다(patterns.data.js dashboard)");
    else kpiCompare("4 Pattern 대시보드 KPI", c.kpiDash, w.kpi.dash, "patterns.data.js dashboard");
    /* 문서의 다른 행(Tone · Delta · Variant) 카드도 단위 모양은 같다 */
    for (const l of c.kpiDoc) if (!/^KPI · 예제/.test(l.heading || "")) l.kpi.forEach((k, i) => { unitCheck(`Data Visual 문서 '${l.heading}' ${i + 1}번째 카드`, k.utype); deltaCheck(`Data Visual 문서 '${l.heading}' ${i + 1}번째 카드`, k); });
    /* KPI 세트 — Delta 속성 값 · 변형마다 증감 줄 · 단위(k35c) */
    if (c.kpiSet === undefined) notes.push("덤프에 KPI 세트 변형 조사(kpiSet)가 없습니다 — 2026-11-05 k35c 전 probe.js 로 만든 덤프라 Delta=None · 단위 모양 대조를 건너뜁니다");
    else if (!c.kpiSet) bad.push("KPI 세트가 없습니다");
    else {
      const opts = c.kpiSet.deltaOptions || [];
      if (w.kpi.needNone && !opts.includes("None")) bad.push(`KPI 세트 Delta 값 ${opts.join(" · ")} 에 None 이 없습니다 — 예제에 class 없는 .kpi .delta(화살표 없음)가 있습니다`);
      for (const v of c.kpiSet.variants) {
        const dm = /(?:^|, )Delta=([^,]+)/.exec(v.name), dv = dm && dm[1], wf = dv && w.kpi.dirFill[dv];
        if (/Sparkline=On/.test(v.name)) { unitCheck(`KPI ${v.name}`, v.utype); deltaCheck(`KPI ${v.name}`, v); continue; }   // 스파크라인 변형은 자식 순서가 달라 증감 줄은 보지 않는다
        if (dv === "None" && v.arrow) bad.push(`KPI ${v.name} (${v.id}) 에 화살표 ${v.arrow} 가 있습니다 — class 없는 .kpi .delta 는 아이콘 없음`);
        if ((dv === "Up" || dv === "Down") && !v.arrow) bad.push(`KPI ${v.name} (${v.id}) 에 화살표가 없습니다`);
        if (wf && v.dfill && String(v.dfill).replace(/^\$/, "") !== wf) bad.push(`KPI ${v.name} (${v.id}) 증감 칠 ${v.dfill} ≠ ${wf}(.kpi .delta${dv === "None" ? "" : "." + dv.toLowerCase()})`);
        unitCheck(`KPI ${v.name}`, v.utype);
        deltaCheck(`KPI ${v.name}`, v);
      }
    }
    if (noDtype) notes.push(`덤프에 KPI 증감 글자 모양(dtype)이 없습니다(${noDtype}곳) — 2026-11-06 k35d 전 probe.js 로 만든 덤프라 증감 스타일(${DL.style}) 대조를 건너뜁니다`);
    if (notoUnits.length) notes.push(`KPI 단위 ${notoUnits.length}곳(원본 · 인스턴스 · 대시보드 — 인스턴스는 원본 id 로 목록과 맞춤)이 Noto Sans KR 로 남아 있습니다(${U.fs}/${U.wt} 에 맞는 텍스트 스타일 없음) — _figma/font-revert-nodes.tsv 의 '사람이 데스크톱에서 Pretendard Medium ${U.fs} 으로 되돌릴 노드'와 맞음`);
  }
}

/* Card(2026-11-03 k29) — 규칙은 cardExpect 머리 주석. probe 의 components.card(변형마다 상자 · 부품)와 덤프의 변수 값(묶인 변수의 px)으로 본다.
   기존 Card Foot 간격 · 보더 · 그림자 대조(diffComponents 의 surfaces)는 그대로 두고, 여기서는 k29 정의만 본다. 옛 덤프(k29 전 probe)에는 components.card 가 없다 — 그때는 NOTE */
function diffCard(c, wc, variables, bad, notes) {
  if (!c) return;
  if (wc.error) { bad.push(`Card 기대값을 저장소에서 읽지 못했습니다 — ${wc.error}`); return; }
  const cd = c.card;
  if (cd === undefined) { notes.push("덤프에 Card 조사(components.card)가 없습니다 — 2026-11-03 k29 전 probe.js 로 만든 덤프입니다"); return; }
  if (!cd || !cd.variants) { bad.push("Card 세트를 조사하지 못했습니다(components.card 비어 있음)"); return; }
  const W = { Thin: 100, Light: 300, DemiLight: 350, Regular: 400, Medium: 500, SemiBold: 600, Bold: 700, Black: 900 };
  const varPx = {}; for (const col of Object.values(variables || {})) for (const [k, v] of Object.entries(col.values || {})) if (/^N/.test(String(v).split("|")[0])) varPx[k] = +String(v).split("|")[0].slice(1);
  const ax = (name) => Object.fromEntries(String(name).split(", ").map((kv) => kv.split("=")).filter((x) => x.length === 2).map(([k, v]) => [k.trim(), v.trim()]));
  const key = (o) => `Variant=${o.Variant}, Type=${o.Type}, Size=${o.Size}, State=${o.State}`;   // Variant 축(k32) — 이름 안 순서와 상관없이 맞춘다
  const exp = new Set(wc.table), have = new Map(), dup = [];
  for (const v of cd.variants) { const o = ax(v.name), k = key(o); if (Object.keys(o).length !== 4 || !exp.has(k)) continue; if (have.has(k)) dup.push(v.name + "(" + v.id + ")"); else have.set(k, v); }
  const miss = wc.table.filter((k) => !have.has(k)), stray = cd.variants.filter((v) => { const o = ax(v.name); return Object.keys(o).length !== 4 || !exp.has(key(o)); });
  if (miss.length) bad.push(`Card 에 없는 변형 ${miss.length}개(기대 ${wc.table.length}) — ${miss.slice(0, 4).join(" · ")}${miss.length > 4 ? " …" : ""}(components.data.js card.figma — cardExpect 머리 주석)`);
  if (stray.length) bad.push(`Card 에 표에 없는 변형 ${stray.length}개 — ${stray.slice(0, 4).map((v) => v.name + "(" + v.id + ")").join(" · ")}${stray.length > 4 ? " …" : ""}(Variant = ${wc.vnames.join(" · ")} × Type = ${wc.types.join(" · ")} × Size = ${wc.sizes.join(" · ")}, State ${wc.axis.slice(1).join(" · ")} 는 ${wc.vdef} Selection 에만)`);
  if (dup.length) bad.push(`Card 에 이름이 겹치는 변형 — ${dup.join(" · ")}`);
  if (!cd.def || key(ax(cd.def)) !== key(ax(wc.default))) bad.push(`Card 기본 변형 ${cd.def} ≠ ${wc.default} — props variant · size 기본값`);
  const T = (x) => (x === "-" ? "-" : "$" + x);
  /* 묶인 변수 — 값마다 변수 이름이 있어야 하고 그 변수의 값이 기대 px 여야 한다 */
  const bound = (at, what, got, gotV, want) => {
    for (let i = 0; i < want.length; i++) {
      if (got[i] !== want[i]) { bad.push(`${at} ${what} ${JSON.stringify(got)} ≠ ${JSON.stringify(want)}`); return; }
      if (!gotV[i]) { bad.push(`${at} ${what} 값 ${got[i]} 이 변수에 묶이지 않음`); return; }
      if (varPx[gotV[i]] !== undefined && varPx[gotV[i]] !== want[i]) { bad.push(`${at} ${what} 이 묶인 변수 ${gotV[i]}(${varPx[gotV[i]]}) ≠ ${want[i]}`); return; }
    }
  };
  const font = (at, what, tx, w) => {
    if (!tx) { bad.push(`${at} ${what} 글자 없음`); return; }
    if (tx.st !== w.st) bad.push(`${at} ${what} 텍스트 스타일 ${tx.st || "없음"} ≠ ${w.st}`);
    if (w.fs !== undefined && tx.fs !== w.fs) bad.push(`${at} ${what} 크기 ${tx.fs} ≠ ${w.fs}`);
    if (w.wt !== undefined) { const wt = W[String(tx.font).split(" ").pop()]; if (wt !== w.wt) bad.push(`${at} ${what} 굵기 ${wt} ≠ ${w.wt}(${tx.font})`); }
  };
  for (const [k, v] of have) {
    const o = ax(v.name), at = `Card ${v.name} (${v.id})`, list = o.Type === "List", sel = o.Type === "Selection";
    const wantFace = o.State === "Selected" ? wc.selected.face : o.State === "Disabled" ? wc.disabled.face : wc.face;
    if (v.fill !== T(wantFace)) bad.push(`${at} 면 ${v.fill} ≠ ${wantFace} — 사이트 ${o.State === "Selected" ? ".card.on" : o.State === "Disabled" ? ".card.clickable:disabled" : ".card"} background`);
    if (o.Variant === wc.vdef) { if (v.stroke !== T(wc.stroke) || v.sw !== wc.sw) bad.push(`${at} 테두리 ${v.stroke} ${v.sw}px ≠ ${wc.sw}px ${wc.stroke} — 사이트 .card border(Selected 도 그대로)`); }
    else {   // Flat(k32) — 보더 색만 투명, 두께 그대로, 크기 = 같은 이름의 Outline
      if (v.stroke !== "transparent" || v.sw !== wc.sw) bad.push(`${at} 테두리 ${v.stroke} ${v.sw}px ≠ ${wc.sw}px transparent — 사이트 .card.flat border-color:transparent(두께는 남김)`);
      const tw = have.get(key(Object.assign({}, o, { Variant: wc.vdef })));
      if (!tw) bad.push(`${at} 짝(${wc.vdef}) 변형이 없어 크기를 대조하지 못했습니다`);
      else if (v.h === undefined) bad.push(`${at} 높이를 덤프에 내지 않았습니다 — probe.js(k32)로 다시 덤프`);
      else if (Math.abs(v.w - tw.w) > 0.5 || Math.abs(v.h - tw.h) > 0.5) bad.push(`${at} 크기 ${v.w}×${v.h} ≠ ${wc.vdef} ${tw.w}×${tw.h} — flat 은 보더 자리(1px)를 남겨 크기가 같다`);
    }
    if (!v.r || v.r.some((x) => Math.abs(x - wc.radius.px) > 0.01) || v.rv !== wc.radius.tok) bad.push(`${at} 모서리 ${JSON.stringify(v.r)}(${v.rv || "값만"}) ≠ ${wc.radius.px}(${wc.radius.tok})`);
    if (v.minW !== wc.minW) bad.push(`${at} 최소 폭 ${v.minW} ≠ ${wc.minW} — 사이트 .card min-width`);
    if (v.lm !== "VERTICAL") bad.push(`${at} 세로 자동 배치가 아님(${v.lm}) — 사이트 flex column`);
    const sz = list ? wc.flush : wc.size[o.Size];
    if (sz) { bound(at, list ? "padding(flush)" : "padding", v.pad, v.padV, sz.pad); bound(at, "gap", [v.gap], [v.gapV], [sz.gap]); }
    /* 효과 — Hover 는 Shadow/2 스타일만, Selected 는 안쪽 링 하나만, 나머지는 없음 */
    const fx = v.fx || {};
    if (o.State === "Hover") { if (String(fx.style || "").toLowerCase() !== wc.hover || fx.inner.length) bad.push(`${at} Hover 효과 ${fx.style || "없음"}${fx.inner.length ? " + 안쪽 " + JSON.stringify(fx.inner) : ""} ≠ 효과 스타일 ${wc.hover} — 사이트 .card.clickable:hover`); }
    else if (o.State === "Selected") { if (fx.style || fx.drop || fx.inner.length !== 1 || fx.inner[0][0] !== wc.selected.ring.tok || fx.inner[0][1] !== wc.selected.ring.w) bad.push(`${at} 선택 링 ${JSON.stringify(fx.inner)}${fx.style ? " + " + fx.style : ""}${fx.drop ? " + 그림자 " + fx.drop : ""} ≠ [${wc.selected.ring.tok}, ${wc.selected.ring.w}] 안쪽 그림자 하나 — 사이트 .card.on inset`); }
    else if (fx.style || fx.drop || fx.inner.length) bad.push(`${at} 효과 ${fx.style || ""}${fx.drop ? " 그림자 " + fx.drop : ""}${fx.inner.length ? " 안쪽 " + JSON.stringify(fx.inner) : ""} — ${o.State === "Disabled" ? "Disabled 는 그림자 없음(사이트 box-shadow:none)" : "그림자 없는 카드입니다(사이트 .card)"}`);
    /* 제목 · 설명 */
    if (o.Type !== "Loading") {
      font(at, "제목", v.title, wc.title[o.Size] || {});
      /* 제목 글 상자(2026-11-03 k29 마무리) — 행간 = CSS line-height, 한 줄 제목의 상자 높이 = 그 행간. 플러그인이 Pretendard 없이 스타일만 바꾸면
         행간 값은 바뀌어도 상자가 다시 배치되지 않아 높이가 옛 값(24)으로 남았다 — 그 모양을 여기서 잡는다. 옛 덤프에는 h 가 없다 */
      const wt = wc.title[o.Size];
      if (v.title && wt) {
        if (v.title.lh !== wt.lh) bad.push(`${at} 제목 행간 ${v.title.lh} ≠ ${wt.lh} — 사이트 ${o.Size === "Small" ? ".card.sm .title" : ".card .title"} line-height`);
        if (v.title.h !== undefined && Math.abs(v.title.h - wt.lh) > 0.5) bad.push(`${at} 제목 글 상자 높이 ${v.title.h} ≠ ${wt.lh}(한 줄 = line-height) — 스타일을 바꾼 뒤 다시 배치되지 않은 글 상자`);
      }
      if (v.title) { if (o.State === "Disabled") { if (v.title.fill !== T(wc.disabled.title)) bad.push(`${at} 제목 ${v.title.fill} ≠ ${wc.disabled.title} — 사이트 :disabled .title`); } else if (v.title.fill === T(wc.disabled.title)) bad.push(`${at} 제목이 비활성 색 — Disabled 가 아닙니다`); }
    }
    if (v.desc) {
      font(at, "설명", v.desc, { st: wc.desc.st });
      const wf = o.State === "Disabled" ? wc.disabled.desc : wc.desc.fill;
      if (v.desc.fill !== T(wf)) bad.push(`${at} 설명 ${v.desc.fill} ≠ ${wf} — 사이트 ${o.State === "Disabled" ? ':disabled .desc(이유 줄은 읽혀야 함 — 사람의 결정 2026-11-03)' : ".card .desc"}`);
    }
    if (v.head) bound(at, "헤더 줄 간격", [v.head.gap], [v.head.gapV], [wc.headGap]);
    if (v.head && o.Type in wc.headBtn) {   // 헤더 오른쪽 버튼(k31) — '전체 보기' 는 텍스트 assistive(사이트 btn sm text assistive)
      const wb = wc.headBtn[o.Type];
      if (v.head.btn === undefined) bad.push(`${at} 헤더 버튼 원본을 덤프에 내지 않았습니다 — probe.js(k31)로 다시 덤프`);
      else if (wb && !String(v.head.btn || "").startsWith(wb)) bad.push(`${at} 헤더 버튼 ${v.head.btn || "없음"} ≠ ${wb}… — 사이트 ${o.Type === "List" ? "list" : "empty"} 예제 .card-head`);
      else if (!wb && v.head.btn) bad.push(`${at} 헤더에 버튼(${v.head.btn}) — 사이트 empty 예제의 오류 카드 헤더는 제목만`);
    }
    if (list) { if (!v.head) bad.push(`${at} 헤더(Head) 없음`); else bound(at, "헤더 padding", v.head.pad, v.head.padV, wc.headPad[o.Size]); }
    /* 유형별 부품 */
    if (sel) {
      if (/(^|>)(Head|Foot)(>|$)/.test(v.kids)) bad.push(`${at} 선택 카드 안에 ${v.kids} — 카드 전체가 버튼이라 헤더 · 푸터(버튼)를 두지 않습니다`);
      if (!v.icon) bad.push(`${at} 앞 아이콘(Icon) 없음 — 사이트 selection 예제`);
      else {
        if (v.icon.idx !== 0) bad.push(`${at} 앞 아이콘이 맨 앞이 아님(${v.icon.idx})`);
        if (Math.abs(v.icon.w - wc.icon.size) > 0.5 || Math.abs(v.icon.h - wc.icon.size) > 0.5) bad.push(`${at} 앞 아이콘 ${v.icon.w}×${v.icon.h} ≠ ${wc.icon.size}`);
        const wi = o.State === "Selected" ? wc.icon.on : o.State === "Disabled" ? wc.icon.dis : wc.icon.ink;
        if (v.icon.ink !== T(wi)) bad.push(`${at} 앞 아이콘 선 ${v.icon.ink} ≠ ${wi} — 사이트 ${o.State === "Selected" ? ".card.on>svg" : o.State === "Disabled" ? ":disabled>svg" : ".card.clickable>svg"}`);
      }
    }
    if (o.Type === "Status") {
      const m = v.meta;
      if (!m) bad.push(`${at} 키-값(Meta) 없음 — 사이트 dl.card-meta`);
      else if (!m.keys || !m.vals) bad.push(`${at} Meta 안에 Keys · Values 열이 없습니다`);
      else {
        bound(at, "키-값 열 간격", [m.gap], [m.gapV], [wc.meta.col]);
        bound(at, "키 행 간격", [m.keys.gap], [m.keys.gapV], [wc.meta.row]); bound(at, "값 행 간격", [m.vals.gap], [m.vals.gapV], [wc.meta.row]);
        if (m.keys.n !== m.vals.n) bad.push(`${at} 키 ${m.keys.n}개 · 값 ${m.vals.n}개 — 행 수가 다릅니다`);
        if (m.keys.fill !== T(wc.meta.key)) bad.push(`${at} 키 ${m.keys.fill} ≠ ${wc.meta.key} — 사이트 .card-meta dt`);
        if (m.vals.fill !== T(wc.meta.val)) bad.push(`${at} 값 ${m.vals.fill} ≠ ${wc.meta.val} — 사이트 .card-meta dd`);
        if (m.keys.st !== wc.meta.st || m.vals.st !== wc.meta.st) bad.push(`${at} 키-값 텍스트 스타일 ${m.keys.st} / ${m.vals.st} ≠ ${wc.meta.st}`);
      }
    }
    if (o.Type === "Empty" || o.Type === "Error") {
      const e = v.empty, err = o.Type === "Error", we = wc.empty;
      if (!e) bad.push(`${at} 본문 자리(Empty) 없음 — 사이트 .card .empty`);
      else {
        bound(at, "빈 상태 padding", e.pad, e.padV, we.pad); bound(at, "빈 상태 간격", [e.gap], [e.gapV], [we.gap]);
        if (we.noFace && e.fill !== "-") bad.push(`${at} 빈 상태 면 ${e.fill} — 카드 안 .empty 는 면이 없습니다`);
        if (we.noBorder && e.stroke !== "-") bad.push(`${at} 빈 상태 테두리 ${e.stroke} — 카드 안 .empty 는 점선을 끕니다`);
        if (!e.face) bad.push(`${at} 아이콘 면(Face) 없음`);
        else {
          const ico = ".card .empty .ico";
          if (Math.abs(e.face.w - we.ico.w) > 0.5 || Math.abs(e.face.h - we.ico.h) > 0.5) bad.push(`${at} 아이콘 칸 ${e.face.w}×${e.face.h} ≠ ${we.ico.w}×${we.ico.h} — 사이트 ${ico}`);
          if (e.face.fill !== T(we.ico.face)) bad.push(`${at} 아이콘 칸 면 ${e.face.fill} ≠ ${we.ico.face}${we.ico.noFace ? " — 카드 안에서는 칸 없이 아이콘만(사이트 " + ico + " background:none, 사람의 결정 2026-11-03)" : ""}`);
          if (we.ico.r0) { if (e.face.rv || (e.face.r !== undefined && e.face.r !== 0)) bad.push(`${at} 아이콘 칸 모서리 ${e.face.rv || e.face.r} — 사이트 ${ico} border-radius 0`); }
          else if (e.face.rv !== we.ico.radius) bad.push(`${at} 아이콘 칸 모서리 ${e.face.rv || "값만"} ≠ ${we.ico.radius}`);
          if (e.face.iw === undefined) bad.push(`${at} 아이콘 크기를 덤프에 내지 않았습니다 — probe.js(k31)로 다시 덤프`);
          else if (e.face.iw === null || Math.abs(e.face.iw - we.ico.iw) > 0.5 || Math.abs(e.face.ih - we.ico.ih) > 0.5) bad.push(`${at} 아이콘 ${e.face.iw}×${e.face.ih} ≠ ${we.ico.iw}×${we.ico.ih} — 사이트 ${ico} svg`);
          const wi = err ? we.ico.err : we.ico.ink;
          if (e.face.ink !== T(wi)) bad.push(`${at} 아이콘 ${e.face.ink} ≠ ${wi} — 사이트 ${err ? ".card .empty.error .ico" : ".empty .ico"}`);
        }
        if (!e.msg) bad.push(`${at} 문구(Message) 없음`); else { if (e.msg.fs !== we.msg.fs) bad.push(`${at} 문구 크기 ${e.msg.fs} ≠ ${we.msg.fs} — 사이트 .card .empty b`); if (e.msg.fill !== T(we.msg.fill)) bad.push(`${at} 문구 ${e.msg.fill} ≠ ${we.msg.fill}`); }
        if (!e.hint) bad.push(`${at} 보조 문구(Hint) 없음`); else if (e.hint.fill !== T(we.hint)) bad.push(`${at} 보조 문구 ${e.hint.fill} ≠ ${we.hint} — 사이트 .empty color`);
        if (err) { if (!e.btn || !e.btn.startsWith(we.btn)) bad.push(`${at} '다시 시도' 버튼 ${e.btn || "없음"} ≠ ${we.btn}… — 사이트 empty 예제`); }
        else if (e.btn) bad.push(`${at} 빈 상태에 버튼(${e.btn}) — 버튼은 오류에만`);
      }
    }
    if (o.Type === "Loading") {
      const got = (v.skel || []).map((x) => String(x).replace(/^Type=/, ""));
      if (JSON.stringify(got) !== JSON.stringify(wc.skel)) bad.push(`${at} Skeleton ${JSON.stringify(got)} ≠ ${JSON.stringify(wc.skel)} — 사이트 loading 예제`);
    }
  }
}

/* 심각도(2026-11-09 k42) — 규칙은 severityExpect 머리 주석. probe 의 components.severity(tags · marks · bands)와 staticCharts.donuts 의 호 칠로 본다.
   Chart Card 세트의 도넛 호는 diffComponents 의 Donut 대조가, Chart 세트(탐색형)는 diffChart 가 이미 TONES 로 본다 */
function diffSeverity(c, want, bad, notes) {
  if (!c) return;
  const w = want.severity;
  /* 세트 밖 정적 도넛(4 Pattern 대시보드)의 호 — 같은 .donut conic-gradient(개수 · 각도 ±0.5° · 칠) */
  const da = want.donutArcs, ang = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
  for (const d of (c.staticCharts && c.staticCharts.donuts) || []) {
    const at = `${d.page} 도넛 ${d.path} (${d.id})`;
    if (d.arcs.length !== da.length) { bad.push(`${at} 호 ${d.arcs.length}개 ≠ ${da.length}개(.donut conic-gradient)`); continue; }
    da.forEach((x, i) => { const [s, e, p] = d.arcs[i]; if (ang(s, x.from) > 0.5 || ang(e, x.to) > 0.5 || p !== "$" + x.tok) bad.push(`${at} 호 ${i + 1}: Figma ${s}°~${e}° ${p} ≠ 저장소 ${+x.from.toFixed(2)}°~${+x.to.toFixed(2)}° ${x.tok}`); });
  }
  if (!c.severity) { notes.push("덤프에 심각도 조사(components.severity)가 없습니다 — 2026-11-09 k42 전 probe.js 로 만든 덤프입니다"); return; }
  const { tags, marks, bands } = c.severity, prop = (n, k) => (new RegExp("(?:^|, )" + k + "=([^,]+)").exec(n) || [])[1];
  /* 라벨 ↔ 톤 — Figma Info 는 neutral(.tag)도 맡는다(alias) */
  let checked = 0;
  for (const [page, id, main, label] of tags) {
    const tone = String(prop(main, "Tone") || "").toLowerCase(), wt = label == null ? null : w.labels[label.trim()];
    if (!wt) continue; checked++;
    if (tone !== wt && want.tag.alias[wt] !== tone) bad.push(`Tag 인스턴스 '${label}' 의 톤 ${prop(main, "Tone")} ≠ ${wt} — ${page} (${id}) — 저장소 예제는 class="tag ${wt === "neutral" ? "" : wt}"`);
  }
  if (w.ambiguous.length) notes.push(`Tag 라벨 중 저장소 예제에서 톤이 둘 이상인 것은 대조하지 않았습니다 — ${w.ambiguous.join(" · ")}`);
  /* 지표 — 범례 견본 · 셀 막대 · 정적 막대 행 · 툴팁 견본 */
  for (const [page, id, label, kind, p] of marks) { const t = w.marks[label]; if (t && p !== "$" + t) bad.push(`${page} 심각도 ${label} ${kind === "bar" ? "막대" : kind === "cell" ? "셀 막대" : "견본"} ${p} ≠ ${t} (${id}) — ds-chart TONES.${label.toLowerCase()}`); }
  /* 분포 밴드 — 심각도 토큰이 둘 이상인 막대 줄만. 단계 수 · 순서 · 칠 · 폭 비율(flex, ±1px) */
  const sevToks = new Set(Object.values(w.marks).concat(["foreground/accent/cyan"]));   // cyan = 4단계 때 Medium(옛 값이 남은 밴드를 놓치지 않으려고)
  let nb = 0;
  for (const [page, id, paints, ws] of bands) {
    if (paints.filter((p) => sevToks.has(String(p).replace(/^\$/, ""))).length < 2) continue; nb++;
    const B = w.band, at = `${page} 분포 밴드 (${id})`;
    if (paints.length !== B.tones.length) { bad.push(`${at} 조각 ${paints.length}개 ≠ ${B.tones.length}(${B.levels.join(" · ")} — patterns.data.js severity band)`); continue; }
    paints.forEach((p, i) => { if (p !== "$" + B.tones[i]) bad.push(`${at} ${i + 1}번째(${B.levels[i]}) ${p} ≠ ${B.tones[i]}`); });
    const sum = ws.reduce((a, b) => a + b, 0), fs_ = B.flex.reduce((a, b) => a + b, 0);
    const off = ws.map((x, i) => +(x - (sum * B.flex[i]) / fs_).toFixed(2));
    if (off.some((d) => Math.abs(d) > 1)) bad.push(`${at} 폭 ${ws.join(" · ")} 이 flex ${B.flex.join(" · ")} 비율과 다릅니다(차이 ${off.join(" · ")})`);
  }
  notes.push(`심각도 대조(k42): Tag 인스턴스 ${tags.length}개 중 라벨 대조 ${checked} · 지표 ${marks.length} · 분포 밴드 ${nb} · 세트 밖 정적 도넛 ${((c.staticCharts && c.staticCharts.donuts) || []).length}`);
}

/* ---------- 대조 ---------- */
function diff(dumpPath, site) {
  const want = expect_();
  want.components.navGeo = site.nav;   // 사이트 실측(siteMeasure) — 진입점이 미리 잰다
  want.components.tagSite = site.tag;
  want.components.btnSite = site.btn;
  const got = JSON.parse(fs.readFileSync(dumpPath, "utf8"));
  const bad = [];
  const list = (a, b, label) => {
    const miss = a.filter((x) => !b.includes(x)), extra = b.filter((x) => !a.includes(x));
    if (miss.length) bad.push(`${label}: 저장소에만 ${miss.length}개 — ${miss.slice(0, 8).join(" ")}${miss.length > 8 ? " …" : ""}`);
    if (extra.length) bad.push(`${label}: Figma 에만 ${extra.length}개 — ${extra.slice(0, 8).join(" ")}${extra.length > 8 ? " …" : ""}`);
  };

  const sem = (got.variables && got.variables.Semantic && got.variables.Semantic.values) || {};
  const semFig = Object.keys(sem).filter((n) => n.startsWith("color/semantic/") && !n.startsWith("color/semantic/chart/"));   // chart/* 는 트리 밖 — 아래서 따로 본다(k33)
  list(Object.keys(want.semantic), semFig, "semantic 토큰");
  for (const [name, spec] of Object.entries(want.semantic)) {
    if (!(name in sem)) continue;
    if (sem[name] !== spec) bad.push(`semantic 값 다름 ${name}: 저장소[${spec}] Figma[${sem[name]}]`);
  }
  /* 차트 토큰(2026-11-04 k33) — style.src.css 의 --chart-* 와 같은 이름(color/semantic/chart/…)이 Semantic 컬렉션에 있고, 값은 별칭(A…)이어야 한다 */
  list(Object.keys(want.chart), Object.keys(sem).filter((n) => n.startsWith("color/semantic/chart/")), "chart 토큰");
  for (const [name, spec] of Object.entries(want.chart)) {
    if (!(name in sem)) continue;
    if (sem[name] !== spec) bad.push(`chart 값 다름 ${name}: 저장소[${spec}] Figma[${sem[name]}]${/^[HO]/.test(sem[name]) ? " — 값을 복사했습니다. 별칭이어야 합니다" : ""}`);
  }

  const prim = (got.variables && got.variables.Primitive && got.variables.Primitive.values) || {};
  list(Object.keys(want.primitives), Object.keys(prim).filter((n) => n.startsWith("color/atomic/")), "atomic 프리미티브");
  for (const [name, spec] of Object.entries(want.primitives)) {
    if (!(name in prim)) continue;
    if (prim[name] !== spec) bad.push(`프리미티브 값 다름 ${name}: 저장소[${spec}] Figma[${prim[name]}]`);
  }

  for (const [name, px] of Object.entries(want.space)) {
    const v = prim[name];
    if (v === undefined) { bad.push(`간격 변수 없음 ${name}(${px}px)`); continue; }
    if (v !== "N" + px) bad.push(`간격 값 다름 ${name}: 저장소[${px}] Figma[${String(v).replace(/^N/, "")}]`);
  }

  list(want.icons.outline, got.icons ? got.icons.outlineNames || [] : [], "outline 아이콘");
  list(want.icons.filled, got.icons ? got.icons.filledNames || [] : [], "filled 아이콘");

  for (const o of got.overflow || []) bad.push(`넘침 ${o.page}${o.pageId ? "(" + o.pageId + ")" : ""} / ${o.node} +${o.by}${o.side ? " (" + (o.side === "left" ? "왼쪽" : "위") + ")" : ""}${o.clips ? " (잘림)" : ""}`);
  for (const o of (got.overlap || []).filter((x) => x.current !== false)) bad.push(`겹침 ${o.page}${o.pageId ? "(" + o.pageId + ")" : ""}: ${o.a} ↔ ${o.b} (${o.by.join("×")})`);

  const notes = [];
  /* 서체 상태는 덤프의 실제 스타일 서체로 말한다 — 고정 문구를 찍다가 사람이 Pretendard 로 되돌린 뒤에도 "Noto 대체" 라고 했다 */
  if (got.fonts && !got.fonts.pretendard) {
    const noto = (got.textStyles || []).filter((t) => /^Noto Sans KR/.test(t.font)).map((t) => t.name);
    notes.push(noto.length
      ? `Figma 에 Pretendard 가 없어 텍스트 스타일 ${noto.length}개가 Noto Sans KR 대체입니다(${noto.slice(0, 4).join(" · ")}${noto.length > 4 ? " …" : ""}) — 사람이 데스크톱에서 스타일 서체를 Pretendard 로 바꾸면 묶인 노드가 전부 따라옵니다(_figma/font-revert.md)`
      : "텍스트 스타일은 Pretendard 지만 이 플러그인 환경에는 Pretendard 가 없습니다 — Pretendard 글자를 직접 고칠 수는 없고, makeFont() 의 Noto 로 쓴 뒤 원래 텍스트 스타일에 다시 연결하는 우회만 됩니다(글 상자 재배치 · 옛 글리프 확인 — CLAUDE.md Figma 절)");
  }

  /* 대조 범위 — probe 는 현재 페이지를 id 로 고른다(2026-10-23 k2). 범위의 id 가 파일에 없으면(페이지를 지우고 다시 만들면)
     그 페이지는 조사되지 않은 채 "어긋남 0" 이 나오므로 어긋남으로 잡는다. 이름이 같은데 범위 밖인 페이지는 매번 알린다 —
     빼는 것이 소리 없이 일어나지 않게 */
  if (got.scope) {
    const pg = new Map((got.pages || []).map((p) => [p.id, p]));
    for (const [id, name] of Object.entries(got.scope)) {
      const p = pg.get(id);
      if (!p) bad.push(`대조 범위의 페이지 ${name}(${id}) 가 파일에 없습니다 — 그 페이지는 조사되지 않았습니다. probe.js 의 CURRENT_PAGES 를 고치세요`);
      else if (p.name !== name) notes.push(`대조 범위의 페이지 ${id} 이름이 "${p.name}" 입니다(probe.js 에는 "${name}") — 조사는 id 로 했습니다`);
    }
    const names = new Set(Object.values(got.scope));
    const out = (got.pages || []).filter((p) => names.has(p.name) && !Object.prototype.hasOwnProperty.call(got.scope, p.id));
    if (out.length) notes.push(`대조에서 뺀 같은 이름의 페이지 ${out.length}개 — ${out.map((p) => p.name + "(" + p.id + ")").join(" · ")}. probe.js 의 CURRENT_PAGES 가 id 로 고릅니다`);
  } else notes.push("덤프에 대조 범위(scope)가 없습니다 — 어느 페이지를 조사했는지 덤프로는 확인할 수 없습니다(2026-10-23 k2 전 probe.js 는 이름으로 골라 같은 이름의 페이지가 섞였습니다)");

  /* 텍스트 스타일 — typeScale 을 계산만 하고 대조하지 않아 "어긋남 0" 에 글자 크기가 빠져 있었다.
     저장소 .t-* 는 서체 이름을 적지 않으므로 서체는 Pretendard · Noto Sans KR(대체) 를 모두 받고 굵기만 본다 */
  const W = { Thin: 100, Light: 300, DemiLight: 350, Regular: 400, Medium: 500, SemiBold: 600, Bold: 700, Black: 900 };
  const ts = new Map((got.textStyles || []).map((t) => [t.name, t]));
  for (const [name, w] of Object.entries(want.typeScale)) {
    const t = ts.get(name);
    if (!t) { bad.push(`텍스트 스타일 없음 ${name}`); continue; }
    const fam = /^(Pretendard|Noto Sans KR)\b/.exec(t.font), wt = W[(t.font || "").split(" ").pop()];
    const em = parseFloat(w.letterSpacing) * (/em$/.test(w.letterSpacing) ? 100 : 0);   // 0.0282em = 2.82%
    const ls = parseFloat(t.letterSpacing) * (/%$/.test(t.letterSpacing) ? 1 : 0);
    const off = [];
    if (!fam) off.push(`서체 ${t.font}`);
    /* Noto Sans KR 에는 이 환경에서 SemiBold 가 없어 600 은 Bold(700)로 대체된다(font-revert.md k25 와 같은 규칙) — 그 경우만 NOTE */
    if (w.weight && wt !== w.weight) { if (fam && fam[1] === "Noto Sans KR" && w.weight === 600 && wt === 700) notes.push(`텍스트 스타일 ${name} 굵기 600 이 Noto Sans KR Bold(700)로 대체돼 있습니다 — 이 환경의 Noto 에 SemiBold 가 없음. 데스크톱에서 스타일 서체를 Pretendard SemiBold 로 바꾸면 해결(_figma/font-revert.md k35d)`); else off.push(`굵기 ${wt} ≠ ${w.weight}`); }
    if (t.size !== w.size) off.push(`크기 ${t.size} ≠ ${w.size}`);
    if (w.lineHeight && t.lineHeight !== w.lineHeight) off.push(`행간 ${t.lineHeight} ≠ ${w.lineHeight}`);
    if (Math.abs(ls - em) > 0.01) off.push(`자간 ${+ls.toFixed(2)}% ≠ ${+em.toFixed(2)}%`);
    if (off.length) bad.push(`텍스트 스타일 ${name}: ${off.join(" · ")}`);
  }
  /* 게시 숨김(2026-10-27 k13) — 사람의 결정 "게시에서 숨김": 옛 변수는 아카이브(v0.3) 페이지만 쓰므로 지우지 않고 라이브러리 게시에서만 숨긴다.
     LEGACY_HIDDEN 의 그룹은 모두 숨겨야 하고, 그 밖의 변수(atomic · semantic 등 지금 쓰는 것)가 숨겨지면 실수다 — 둘 다 어긋남 */
  const LEGACY_HIDDEN = [
    { collection: "Primitive", re: /^color\/(gray|accent|red|amber|emerald|sky|brand|ink)\//, why: "v0.3 프리미티브 — 지금 램프(color/atomic/*)로 바뀌었고 아카이브 페이지만 쓴다(k12 에 셈: 80개, 현재 페이지 0)" },
    { collection: "Semantic", re: /^site\//, why: "v0.3 사이트 문서용 별칭 — 옛 프리미티브를 가리키고 아카이브 페이지만 쓴다(k12 에 셈: 10개)" },
  ];
  if (got.publishing) {
    const hidden = new Set(got.publishing.hidden), legacy = [];
    for (const g of LEGACY_HIDDEN) for (const n of Object.keys((got.variables && got.variables[g.collection] && got.variables[g.collection].values) || {})) if (g.re.test(n)) legacy.push(g.collection + "/" + n);
    const notHidden = legacy.filter((k) => !hidden.has(k)), wrong = [...hidden].filter((k) => !legacy.includes(k));
    if (notHidden.length) bad.push(`게시에서 숨기지 않은 옛 변수 ${notHidden.length}개(대상 ${legacy.length}) — ${notHidden.slice(0, 6).join(" · ")}${notHidden.length > 6 ? " …" : ""}`);
    if (wrong.length) bad.push(`옛 변수가 아닌데 게시에서 숨긴 변수 ${wrong.length}개 — ${wrong.slice(0, 6).join(" · ")}${wrong.length > 6 ? " …" : ""}`);
  } else notes.push("덤프에 게시 숨김 조사가 없습니다 — 2026-10-27 k13 전 probe.js 로 만든 덤프입니다");
  diffComponents(got.components, want.components, bad, notes);
  diffCard(got.components, want.components.card, got.variables, bad, notes);
  diffFlat(got.components, want.components.flat, bad, notes);
  diffChart(got.components, want.components.chart, got.variables, bad, notes);
  diffStatic(got.components, want.components.staticChart, bad, notes);
  diffSeverity(got.components, want.components, bad, notes);
  diffDocFrames(got.components, docFrameExpect(), bad, notes);

  return { bad, notes, counts: want.counts };
}

/* ---------- 진입점 ---------- */
const [cmd, arg] = process.argv.slice(2);
if (cmd === "expect") {
  const w = expect_();
  const site = await siteMeasure();
  w.components.navGeo = site.nav;
  w.components.tagSite = site.tag;
  w.components.btnSite = site.btn;
  console.log(JSON.stringify(w, null, 1));
} else if (cmd === "diff") {
  if (!arg) { console.error("쓰는 법: node _figma/audit.mjs diff <덤프.json>"); process.exit(2); }
  const { bad, notes, counts } = diff(arg, await siteMeasure());
  console.log("기대값:", JSON.stringify(counts));
  for (const n of notes) console.log("NOTE ", n);
  if (!bad.length) { console.log("어긋남 0 — Figma 와 저장소가 같습니다."); process.exit(0); }
  for (const b of bad) console.log("  ✗", b);
  console.log(`어긋남 ${bad.length}건`);
  process.exit(1);
} else {
  console.error("쓰는 법: node _figma/audit.mjs expect | diff <덤프.json>");
  process.exit(2);
}
