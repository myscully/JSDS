/* @jiran/ds-react/chart — 탐색형 차트(Chart.js) 테마 어댑터 + 캔버스.
   사이트 assets/ds-chart.js 와 같은 원본(_build/ds-chart.src.js)을 쓴다. chart.js 는 optional peer 라 여기서 import 하지 않고
   제품이 설치한 Chart(chart.js/auto 또는 register 한 Chart)를 prop 으로 받는다 — 차트를 안 쓰는 제품의 번들에는 아무것도 들어가지 않는다 */
import { forwardRef, useEffect, useRef, useState, type HTMLAttributes, type RefObject } from "react";
import { cx } from "../utils/cx";
import { mergeRefs } from "../utils/hooks";
import DSChart from "./ds-chart.js";
import type { ChartLike, ChartTableData, ChartTableLabels, DsChartConfig, DsChartHandle } from "./ds-chart.js";

export type { ChartTableLabels, ChartTableData, ChartLike, DsChartConfig, DsChartHandle, DsTheme, Presets, Series, DonutSlice, Tone, ColorMode, TimeseriesSpec, BarSpec, DonutSpec, MixedSpec, GaugeSpec, SparkSpec } from "./ds-chart.js";
/** 프리셋 — spec → Chart.js config. timeseries(선 · 누적 영역) · bar(세로/가로 · 그룹/누적 · 강조 · 그라데이션) · donut · mixed(막대 + 선, y 축 하나) · gauge(반원) · spark(KPI 안 추이).
 *  tone 없는 계열은 한 톤(고정 파랑 명도 단계)이 기본이고 5개를 넘으면 계열 색이다(color) */
export const presets = DSChart.presets;
/** 토큰(--chart-* · 심각도 · 면 · 글꼴)을 계산값으로 읽은 테마 */
export const chartTheme = DSChart.theme;
/** Chart 생성 + 테마 · 제품 색 전환 때 다시 칠함. 돌려주는 handle 로 destroy */
export const mountChart = DSChart.mount;

/** canvas ref 에 차트를 올리고 언마운트 때 지운다. config 가 바뀌면(내용 기준) 다시 만든다 */
export function useDsChart(ref: RefObject<HTMLCanvasElement | null>, chart: ChartLike, config: DsChartConfig): void {
  const key = JSON.stringify(config);   // 프리셋은 매 렌더 새 객체를 돌려준다 — 함수(plugins)는 빠지지만 데이터 · 옵션이 같으면 같은 키
  const handle = useRef<DsChartHandle | null>(null);
  /* 만들기 · 지우기는 캔버스와 Chart 생성자가 바뀔 때만 */
  useEffect(() => {
    const el = ref.current; if (!el) return;
    try { handle.current = DSChart.mount(chart, el, config); } catch (e) { if (process.env.NODE_ENV !== "production") console.error(e); }
    return () => { handle.current?.destroy(); handle.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, chart]);
  /* config 가 바뀌면 같은 종류는 그 자리에서 바꾼다(2026-11-20 — 전에는 지우고 다시 만들어 다시 불러올 때 빈 캔버스가 한 번 보였다). 종류가 바뀌면 다시 만든다 */
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const el = ref.current; if (!el) return;
    if (handle.current && handle.current.update(config)) return;
    handle.current?.destroy();
    try { handle.current = DSChart.mount(chart, el, config); } catch (e) { if (process.env.NODE_ENV !== "production") console.error(e); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

export interface ChartCanvasProps extends Omit<HTMLAttributes<HTMLDivElement>, "aria-label"> {
  /** chart.js 의 Chart 생성자 — `import { Chart } from "chart.js/auto"` */
  chart: ChartLike;
  /** presets.* 의 결과(보통의 Chart.js config). 옵션을 덧붙여도 된다 */
  config: DsChartConfig;
  /** 차트는 그래픽이라 접근 이름이 필수다 — 제목과 요약(예: "일별 탐지 추이 — Critical · High 누적") */
  "aria-label": string;
  /** 캔버스 높이(px). 기본은 CSS .chart-canvas 의 240. 표로 볼 때도 같은 높이 */
  height?: number;
  /** '표로 보기' 버튼 — 같은 data 를 표로 바꿔 보여 준다. 기본은 없음(사람의 결정 2026-11-13 — 11-10 의 기본 제공을 옵션으로).
   *  정확한 값을 읽어야 하는 차트에 켠다. 끄면 대안은 aria-label 요약뿐이므로 요약에 핵심 수치를 적는다 */
  table?: boolean;
  /** 표로 보기의 문구 — table · chart · head · value · empty(빈 칸의 숨긴 문구) */
  labels?: Partial<ChartTableLabels>;
}
/** .chart-view > (표로 보기 버튼) + .chart-canvas + canvas[role=img]. 사이트의 canvas[data-chart] 와 같은 골격 */
export const ChartCanvas = forwardRef<HTMLCanvasElement, ChartCanvasProps>(function ChartCanvas({ chart, config, "aria-label": label, height, table = false, labels, className, style, ...rest }, ref) {
  const inner = useRef<HTMLCanvasElement>(null);
  const [asTable, setAsTable] = useState(false);
  useDsChart(inner, chart, config);
  const L = { ...DSChart.TABLE_LABELS, ...labels };
  const t: ChartTableData | null = table && asTable ? DSChart.tableData(config.data, L) : null;
  return (
    <div className="chart-view">
      {table && <div className="chart-tools"><button type="button" className="btn sm text assistive" data-chart-table onClick={() => setAsTable((v) => !v)}>{asTable ? L.chart : L.table}</button></div>}
      <div className={cx("chart-canvas", className)} style={height ? { height, ...style } : style} hidden={asTable} {...rest}>
        <canvas ref={mergeRefs(inner, ref)} role="img" aria-label={label} />
      </div>
      {t && (
        <div className="tbl-wrap sticky chart-table" tabIndex={0} role="region" aria-label={label} style={height ? { height } : undefined}>
          <table className="tbl compact">
            <thead><tr>{t.head.map((h, i) => <th key={i} scope="col" className={i ? "num" : undefined}>{h}</th>)}</tr></thead>
            <tbody>{t.rows.map((r, ri) => <tr key={ri}>{r.map((c, i) => <td key={i} className={i ? "num" : undefined}>{c == null ? <><span aria-hidden="true">—</span><span className="sr-only">{L.empty}</span></> : c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
});

export interface SparkCanvasProps extends Omit<HTMLAttributes<HTMLDivElement>, "aria-label"> {
  chart: ChartLike;
  /** presets.spark(...) */
  config: DsChartConfig;
  /** 무엇이 어떻게 변했는지 — 예: "신규 위협 — 최근 10일 62건에서 112건으로 증가" */
  "aria-label": string;
}
/** KPI 안 탐색형 스파크 — .chart-canvas.spark > canvas(높이 40, 표로 보기 틀 없음). Kpi 의 children 으로 맨 아래에 둔다 */
export const SparkCanvas = forwardRef<HTMLCanvasElement, SparkCanvasProps>(function SparkCanvas({ chart, config, "aria-label": label, className, ...rest }, ref) {
  const inner = useRef<HTMLCanvasElement>(null);
  useDsChart(inner, chart, config);
  return (
    <div className={cx("chart-canvas", "spark", className)} {...rest}>
      <canvas ref={mergeRefs(inner, ref)} role="img" aria-label={label} />
    </div>
  );
});
