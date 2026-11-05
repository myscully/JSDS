/* @jiran/ds-react/chart — 탐색형 차트(Chart.js) 테마 어댑터 + 캔버스.
   사이트 assets/ds-chart.js 와 같은 원본(_build/ds-chart.src.js)을 쓴다. chart.js 는 optional peer 라 여기서 import 하지 않고
   제품이 설치한 Chart(chart.js/auto 또는 register 한 Chart)를 prop 으로 받는다 — 차트를 안 쓰는 제품의 번들에는 아무것도 들어가지 않는다 */
import { forwardRef, useEffect, useRef, type HTMLAttributes, type RefObject } from "react";
import { cx } from "../utils/cx";
import { mergeRefs } from "../utils/hooks";
import DSChart from "./ds-chart.js";
import type { ChartLike, DsChartConfig, DsChartHandle } from "./ds-chart.js";

export type { ChartLike, DsChartConfig, DsChartHandle, DsTheme, Presets, Series, DonutSlice, Tone, TimeseriesSpec, BarSpec, DonutSpec, MixedSpec } from "./ds-chart.js";
/** 프리셋 — spec → Chart.js config. timeseries(선 · 누적 영역) · bar(세로/가로 · 그룹/누적) · donut · mixed(막대 + 선, y 축 하나) */
export const presets = DSChart.presets;
/** 토큰(--chart-* · 심각도 · 면 · 글꼴)을 계산값으로 읽은 테마 */
export const chartTheme = DSChart.theme;
/** Chart 생성 + 테마 · 제품 색 전환 때 다시 칠함. 돌려주는 handle 로 destroy */
export const mountChart = DSChart.mount;

/** canvas ref 에 차트를 올리고 언마운트 때 지운다. config 가 바뀌면(내용 기준) 다시 만든다 */
export function useDsChart(ref: RefObject<HTMLCanvasElement | null>, chart: ChartLike, config: DsChartConfig): void {
  const key = JSON.stringify(config);   // 프리셋은 매 렌더 새 객체를 돌려준다 — 함수(plugins)는 빠지지만 데이터 · 옵션이 같으면 같은 키
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let handle: DsChartHandle | null = null;
    try { handle = DSChart.mount(chart, el, config); } catch (e) { if (process.env.NODE_ENV !== "production") console.error(e); }
    return () => { handle?.destroy(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, chart, key]);
}

export interface ChartCanvasProps extends Omit<HTMLAttributes<HTMLDivElement>, "aria-label"> {
  /** chart.js 의 Chart 생성자 — `import { Chart } from "chart.js/auto"` */
  chart: ChartLike;
  /** presets.* 의 결과(보통의 Chart.js config). 옵션을 덧붙여도 된다 */
  config: DsChartConfig;
  /** 차트는 그래픽이라 접근 이름이 필수다 — 제목과 요약(예: "일별 탐지 추이 — Critical · High 누적") */
  "aria-label": string;
  /** 캔버스 높이(px). 기본은 CSS .chart-canvas 의 240 */
  height?: number;
}
/** .chart-canvas 래퍼 + canvas[role=img]. 사이트의 canvas[data-chart] 와 같은 골격 */
export const ChartCanvas = forwardRef<HTMLCanvasElement, ChartCanvasProps>(function ChartCanvas({ chart, config, "aria-label": label, height, className, style, ...rest }, ref) {
  const inner = useRef<HTMLCanvasElement>(null);
  useDsChart(inner, chart, config);
  return (
    <div className={cx("chart-canvas", className)} style={height ? { height, ...style } : style} {...rest}>
      <canvas ref={mergeRefs(inner, ref)} role="img" aria-label={label} />
    </div>
  );
});
