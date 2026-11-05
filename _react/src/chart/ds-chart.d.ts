/* _build/ds-chart.src.js 의 타입. 값은 sync-chart.mjs 가 복사한 ds-chart.js 에서 온다 — 둘을 함께 고친다 */

/** Chart.js 의 Chart 생성자(chart.js 또는 chart.js/auto). chart.js 는 optional peer 라 타입을 직접 참조하지 않는다 */
export type ChartLike = new (canvas: HTMLCanvasElement, config: object) => { update(mode?: string): void; destroy(): void; config: object; data: object; options: object };

export type Tone = "critical" | "high" | "medium" | "low" | "ok" | "brand";
export interface Series { label: string; data: number[]; tone?: Tone }
export interface DonutSlice { label: string; value: number; tone?: Tone }
export interface TimeseriesSpec { labels: string[]; series: Series[]; /** 누적 영역(심각도 누적 추이) */ stacked?: boolean }
export interface BarSpec { labels: string[]; series: Series[]; stacked?: boolean; horizontal?: boolean }
export interface DonutSpec { series: DonutSlice[]; /** 구멍 가운데 글자(합계 등) */ center?: string | number; legend?: "bottom" | "right" }
export interface MixedSpec { labels: string[]; bars: Series[]; lines: Series[] }

/** Chart.js config 에 ds-chart 메타(_ds)가 붙은 것. 보통의 Chart.js 옵션을 덧붙여도 된다 */
export interface DsChartConfig { type: string; data: { labels?: unknown[]; datasets: Array<Record<string, unknown>> }; options?: Record<string, unknown>; plugins?: unknown[]; _ds?: { kind: "timeseries" | "bar" | "donut" | "mixed"; center?: string | number; legend?: string; text?: string } }

export interface DsTheme { series: string[]; tone: Record<Tone, string>; grid: string; axis: string; tipBg: string; tipFg: string; surface: string; text: string; font: { family: string; size: number }; reduced: boolean }
export interface DsChartHandle { chart: InstanceType<ChartLike>; repaint(): void; destroy(): void }

export interface Presets {
  timeseries(spec: TimeseriesSpec): DsChartConfig;
  bar(spec: BarSpec): DsChartConfig;
  donut(spec: DonutSpec): DsChartConfig;
  mixed(spec: MixedSpec): DsChartConfig;
}
export interface DSChartApi {
  theme(el?: Element): DsTheme;
  presets: Presets;
  mount(Chart: ChartLike, canvas: HTMLCanvasElement, config: DsChartConfig): DsChartHandle;
  auto(Chart?: ChartLike, scope?: ParentNode): DsChartHandle[];
  paint(chart: InstanceType<ChartLike>, theme: DsTheme): void;
  resolve(el: Element, token: string): string;
  SERIES_MAX: number;
  TOKENS: { series: string[]; grid: string; axis: string; tipBg: string; tipFg: string; surface: string; text: string };
  TONES: Record<Tone, string>;
}
declare const DSChart: DSChartApi;
export default DSChart;
