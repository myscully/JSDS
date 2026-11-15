/* _build/ds-chart.src.js 의 타입. 값은 sync-chart.mjs 가 복사한 ds-chart.js 에서 온다 — 둘을 함께 고친다 */

/** Chart.js 의 Chart 생성자(chart.js 또는 chart.js/auto). chart.js 는 optional peer 라 타입을 직접 참조하지 않는다.
 *  config 는 never — 생성자 매개변수는 반대 방향으로 대조되어 `object` 로 두면 Chart.js 의 ChartConfiguration 을 받는 `typeof Chart` 가
 *  맞지 않았다(문서대로 쓴 `<ChartCanvas chart={Chart}>` 가 타입 오류, 2026-11-09). 생성은 ds-chart.js 안에서만 하므로 TS 쪽에서 부를 일이 없다.
 *  update 의 mode 도 같은 이유로 Chart.js UpdateMode 의 일부만 — ds-chart.js 는 "none" 만 쓴다 */
export type ChartLike = new (canvas: HTMLCanvasElement, config: never) => { update(mode?: "none" | "default" | "resize" | "reset"): void; destroy(): void; config: object; data: object; options: object };

/** 표로 보기의 문구 */
export interface ChartTableLabels { table: string; chart: string; head: string; value: string; /** 빈 칸의 숨긴 문구(보이는 것은 '—') */ empty: string }
/** 빈 칸은 null — 그리는 쪽이 보이는 '—' 와 숨긴 labels.empty 를 넣는다 */
export interface ChartTableData { head: string[]; rows: Array<Array<string | null>> }
/** 계열 색 — 심각도 · 상태 · 한 톤 단계 · 계열 1의 톤. 비교 기간(지난 주 · 전월)은 mono-1 · mono-4 를 쓴다 — series-1-subtle 은 이미 쓰는 화면을 위해 남긴 값이라 새로 쓰지 않는다(2026-11-15) */
export type Tone = "critical" | "high" | "medium" | "low" | "info" | "ok" | "brand" | "mono-1" | "mono-2" | "mono-3" | "mono-4" | "series-1" | "series-1-subtle" | "series-1-strong";
/** tone 없는 계열의 색 — mono(기본, 고정 파랑 명도 단계 · 4개까지) · categorical(계열 색 1~6). 5개 이상이면 mono 를 적어도 categorical 로 그리고 경고 */
export type ColorMode = "mono" | "categorical";
export interface Series { label: string; data: number[]; tone?: Tone }
export interface DonutSlice { label: string; value: number; tone?: Tone }
export interface TimeseriesSpec { labels: string[]; series: Series[]; /** 누적 영역(심각도 누적 추이) */ stacked?: boolean; /** 계열이 하나일 때 선 아래 옅은 칠(기본 true) */ area?: boolean; color?: ColorMode }
export interface BarSpec { labels: string[]; series: Series[]; stacked?: boolean; horizontal?: boolean; /** 이 막대(0부터)만 진하게 — 계열이 하나일 때 */ highlight?: number; /** 막대마다 기준선 → 값 끝 그라데이션 — 누적에는 쓰지 않음 */ gradient?: boolean; color?: ColorMode }
export interface DonutSpec { series: DonutSlice[]; /** 구멍 가운데 글자(합계 등) */ center?: string | number; /** right 는 자리가 좁고 세로로 길면(폭 < 높이 × 1.5) 아래로 내려간다 */ legend?: "bottom" | "right"; color?: ColorMode }
export interface MixedSpec { labels: string[]; bars: Series[]; lines: Series[]; color?: ColorMode }
/** 반원 게이지 — 목표 대비 하나. 범례 · 툴팁 없음, 값은 가운데 글자와 aria-label 이 나른다 */
export interface GaugeSpec { value: number; /** 기본 100 */ max?: number; /** 가운데 큰 글자(없으면 value) */ label?: string; /** 그 위 작은 설명 */ caption?: string; tone?: Tone }
/** KPI 안 작은 추이 — 축 · 격자 · 범례 없는 선 */
export interface SparkSpec { data: number[]; labels?: string[]; /** 툴팁의 계열 이름 */ label?: string; tone?: Tone; /** 선 아래 옅은 칠(기본 true) */ area?: boolean }

/** Chart.js config 에 ds-chart 메타(_ds)가 붙은 것. 보통의 Chart.js 옵션을 덧붙여도 된다 */
export interface DsChartConfig { type: string; data: { labels?: unknown[]; datasets: Array<Record<string, unknown>> }; options?: Record<string, unknown>; plugins?: unknown[]; _ds?: { kind: "timeseries" | "bar" | "donut" | "mixed" | "gauge" | "spark"; color?: ColorMode; highlight?: number; gradient?: boolean; horizontal?: boolean; center?: string | number; caption?: string; legend?: string; text?: string; sub?: string } }

export interface DsTheme { series: string[]; /** 한 톤 4단계(진한 → 옅은) */ mono: string[]; tone: Record<Tone, string>; sub: string; track: string; /** 루트 글자 크기 비율(화면 폭 단계) */ scale: number; grid: string; axis: string; tipBg: string; tipFg: string; surface: string; text: string; font: { family: string; size: number }; reduced: boolean }
export interface DsChartHandle { chart: InstanceType<ChartLike>; repaint(): void; destroy(): void }

export interface Presets {
  timeseries(spec: TimeseriesSpec): DsChartConfig;
  bar(spec: BarSpec): DsChartConfig;
  donut(spec: DonutSpec): DsChartConfig;
  mixed(spec: MixedSpec): DsChartConfig;
  gauge(spec: GaugeSpec): DsChartConfig;
  spark(spec: SparkSpec): DsChartConfig;
}
export interface DSChartApi {
  theme(el?: Element): DsTheme;
  presets: Presets;
  mount(Chart: ChartLike, canvas: HTMLCanvasElement, config: DsChartConfig): DsChartHandle;
  auto(Chart?: ChartLike, scope?: ParentNode): DsChartHandle[];
  paint(chart: InstanceType<ChartLike>, theme: DsTheme): void;
  resolve(el: Element, token: string): string;
  /** 옆 범례(right · left)가 폭 w · 높이 h 의 자리에서 실제로 놓일 위치 — w < h × 1.5 이면 "bottom" */
  legendPosition(want: string | undefined, w: number, h: number): string;
  /** 차트의 data 를 표의 머리글 · 행으로 — 표로 보기가 쓴다 */
  tableData(data: { labels?: unknown[]; datasets?: Array<Record<string, unknown>> }, labels?: Partial<ChartTableLabels>): ChartTableData;
  TABLE_LABELS: ChartTableLabels;
  SERIES_MAX: number;
  /** 한 톤으로 칠하는 tone 없는 계열의 최대 수(4) */
  MONO_MAX: number;
  /** 계열 수 → 쓰는 단계 번호(0부터) */
  MONO_STEPS: Record<number, number[]>;
  /** tone 없는 계열에 줄 색 — tone 을 준 자리는 그 톤 */
  palette(theme: DsTheme, mode: ColorMode | undefined, tones: Array<Tone | undefined>): string[];
  /** 영역 칠 — 선 색에서 바닥으로 옅어지는 그라데이션(scriptable) */
  areaFill(color: string): unknown;
  CENTER_FONT: { weight: number; size: number };
  GAUGE_FONT: { weight: number; size: number; caption: number };
  TOKENS: { series: string[]; mono: string[]; sub: string; track: string; grid: string; axis: string; tipBg: string; tipFg: string; surface: string; text: string };
  TONES: Record<Tone, string>;
}
declare const DSChart: DSChartApi;
export default DSChart;
