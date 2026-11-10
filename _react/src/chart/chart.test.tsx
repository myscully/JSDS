import { render } from "@testing-library/react";
import { ChartCanvas, presets, mountChart, type ChartLike, type DsChartConfig } from "./index";
import DSChart from "./ds-chart.js";

/* chart.js 는 optional peer 라 테스트에서 import 하지 않는다 — ctx 가 있는 가짜 Chart 로 mount · paint · destroy 흐름을 본다.
   jsdom 은 CSS 변수를 계산하지 못하므로 색 값 자체는 사이트 behave(헤드리스 Chromium)가 토큰 계산값과 대조한다 */
class FakeChart {
  static instances: FakeChart[] = [];
  ctx = {}; config: object; data: { labels?: unknown[]; datasets: Array<Record<string, unknown>> }; options: Record<string, unknown> = {};
  updates: string[] = []; destroyed = false;
  constructor(public canvas: HTMLCanvasElement, config: DsChartConfig) { this.config = config; this.data = config.data; this.options = config.options ?? {}; FakeChart.instances.push(this); }
  update(mode?: string) { this.updates.push(mode ?? ""); }
  destroy() { this.destroyed = true; }
}
const Chart = FakeChart as unknown as ChartLike;
beforeEach(() => { FakeChart.instances = []; });

describe("presets", () => {
  const series = [{ label: "Critical", tone: "critical" as const, data: [1, 2] }, { label: "High", data: [3, 4] }];
  it("timeseries 는 line, stacked 면 영역 채움(origin · -1)과 축 누적, 선 2 · hover 점 4(지름 8)", () => {
    const c = presets.timeseries({ labels: ["a", "b"], series, stacked: true });
    expect(c.type).toBe("line"); expect(c._ds?.kind).toBe("timeseries");
    expect(c.data.datasets.map((d) => d.fill)).toEqual(["origin", "-1"]);
    expect(c.data.datasets.every((d) => d.borderWidth === 2 && d.pointRadius === 0 && d.pointHoverRadius === 4)).toBe(true);
    expect((c.options as { scales: { y: { stacked: boolean } } }).scales.y.stacked).toBe(true);
    expect(presets.timeseries({ labels: ["a"], series }).data.datasets.every((d) => d.fill === false)).toBe(true);
  });
  it("bar 는 각지고 stroke 없음 — 누적 세그먼트도 테두리 · 틈 없이 붙음, horizontal 은 indexAxis y", () => {
    const g = presets.bar({ labels: ["a"], series });
    expect(g.type).toBe("bar"); expect(g.data.datasets.map((d) => [d.borderRadius, d.borderWidth])).toEqual([[0, 0], [0, 0]]); expect((g.options as { indexAxis: string }).indexAxis).toBe("x");
    const st = presets.bar({ labels: ["a"], series, stacked: true, horizontal: true });
    expect(st.data.datasets.map((d) => d.borderWidth)).toEqual([0, 0]); expect((st.options as { indexAxis: string }).indexAxis).toBe("y");
    expect(presets.bar({ labels: ["a"], series, stacked: true }).data.datasets.map((d) => d.borderWidth)).toEqual([0, 0]);
    expect(st.data.datasets.every((d) => d.borderRadius === 0 && d.inflateAmount === undefined && d.maxBarThickness === 32)).toBe(true);   // inflate 는 기본(auto) — 이웃 세그먼트 사이 실금 없음
  });
  it("donut 은 doughnut, 구멍 67%, 조각 톤과 center 를 메타에", () => {
    const d = presets.donut({ series: [{ label: "A", value: 1, tone: "critical" }, { label: "B", value: 2 }], center: "3", legend: "right" });
    expect(d.type).toBe("doughnut"); expect((d.options as { cutout: string }).cutout).toBe("67%");
    expect(d.data.labels).toEqual(["A", "B"]); expect(d.data.datasets[0].data).toEqual([1, 2]); expect(d.data.datasets[0]._dsTones).toEqual(["critical", undefined]);
    expect(d._ds).toMatchObject({ kind: "donut", center: "3", legend: "right" }); expect(d.plugins).toHaveLength(1);
  });
  it("mixed 는 막대 + 선 한 차트, y 축 하나(y2 없음), 선이 위(order 0)", () => {
    const m = presets.mixed({ labels: ["a"], bars: [{ label: "탐지", data: [1] }], lines: [{ label: "차단", data: [1] }] });
    expect(m.type).toBe("bar"); expect(m.data.datasets.map((d) => d.type)).toEqual(["bar", "line"]);
    expect(m.data.datasets.map((d) => d.order)).toEqual([2, 0]);
    expect([m.data.datasets[0].borderWidth, m.data.datasets[0].borderRadius]).toEqual([0, 0]);   // 막대 stroke · 둥글림 없음
    expect(Object.keys((m.options as { scales?: Record<string, unknown> }).scales ?? {}).filter((k) => k.startsWith("y"))).toHaveLength(0);   // y2 를 만들지 않는다
  });
});

describe("옆 범례 — 자리가 좁고 세로로 길면 아래로", () => {
  it("legendPosition: right · left 는 폭 < 높이 × 1.5 이면 bottom, 그 밖은 그대로", () => {
    expect(DSChart.legendPosition("right", 360, 240)).toBe("right"); expect(DSChart.legendPosition("right", 359, 240)).toBe("bottom");
    expect(DSChart.legendPosition("left", 200, 400)).toBe("bottom"); expect(DSChart.legendPosition("bottom", 900, 240)).toBe("bottom");
    expect(DSChart.legendPosition(undefined, 900, 240)).toBe("bottom"); expect(DSChart.legendPosition("right", 0, 0)).toBe("right");   // 크기를 모르면 원하는 대로
  });
  it("도넛은 mount 때 캔버스 크기로 정하고, onResize 때 다시 정한다", () => {
    class Sized extends FakeChart { width = 260; height = 240; }
    const h = mountChart(Sized as unknown as ChartLike, document.createElement("canvas"), presets.donut({ series: [{ label: "A", value: 1 }, { label: "B", value: 2 }], legend: "right" }));
    const opts = (h.chart as unknown as FakeChart).options as { plugins: { legend: { position: string } }; onResize: (c: unknown, s: { width: number; height: number }) => void };
    expect(opts.plugins.legend.position).toBe("bottom");
    opts.onResize(h.chart, { width: 600, height: 240 }); expect(opts.plugins.legend.position).toBe("right");
    opts.onResize(h.chart, { width: 300, height: 240 }); expect(opts.plugins.legend.position).toBe("bottom");
    h.destroy();
  });
});

describe("ChartCanvas · mount", () => {
  it(".chart-canvas > canvas[role=img][aria-label] 골격, Chart 를 만들고 칠한 뒤 언마운트 때 destroy", () => {
    const config = presets.bar({ labels: ["a"], series: [{ label: "x", data: [1] }, { label: "y", data: [2] }] });
    const { container, unmount } = render(<ChartCanvas chart={Chart} config={config} aria-label="x · y 비교" height={200} />);
    const wrap = container.querySelector(".chart-view > .chart-canvas") as HTMLDivElement, canvas = wrap.firstElementChild as HTMLCanvasElement;
    expect(wrap.className).toBe("chart-canvas"); expect(wrap.style.height).toBe("200px");
    expect(canvas.tagName).toBe("CANVAS"); expect(canvas.getAttribute("role")).toBe("img"); expect(canvas.getAttribute("aria-label")).toBe("x · y 비교");
    expect(FakeChart.instances).toHaveLength(1);
    const ch = FakeChart.instances[0];
    expect(ch.canvas).toBe(canvas); expect(ch.updates).toEqual(["none"]);   // paint 뒤 update("none")
    /* paint — 범례는 2계열이라 켜지고, 데이터셋마다 색이 들어갔다(값은 jsdom 이 못 푸는 CSS 변수라 문자열 존재만) */
    const opts = ch.options as { plugins: { legend: { display: boolean; position: string } }; scales: { y: { grid: { color: string } } } };
    expect(opts.plugins.legend.display).toBe(true); expect(opts.plugins.legend.position).toBe("bottom");
    expect(ch.data.datasets.every((d) => typeof d.backgroundColor === "string" && typeof d.borderColor === "string")).toBe(true);
    unmount();
    expect(ch.destroyed).toBe(true);
  });
  it("단일 계열은 범례를 끄고, config 가 바뀌면 다시 만든다", () => {
    const one = presets.timeseries({ labels: ["a"], series: [{ label: "x", data: [1] }] });
    const { rerender } = render(<ChartCanvas chart={Chart} config={one} aria-label="x 추이" />);
    expect((FakeChart.instances[0].options as { plugins: { legend: { display: boolean } } }).plugins.legend.display).toBe(false);
    rerender(<ChartCanvas chart={Chart} config={presets.timeseries({ labels: ["a"], series: [{ label: "x", data: [1] }] })} aria-label="x 추이" />);
    expect(FakeChart.instances).toHaveLength(1);   // 내용이 같으면 그대로
    rerender(<ChartCanvas chart={Chart} config={presets.timeseries({ labels: ["a", "b"], series: [{ label: "x", data: [1, 2] }] })} aria-label="x 추이" />);
    expect(FakeChart.instances).toHaveLength(2); expect(FakeChart.instances[0].destroyed).toBe(true);
  });
  it("mountChart 는 Chart 없이 부르면 던지고, handle 로 destroy 한다", () => {
    const canvas = document.createElement("canvas"); document.body.append(canvas);
    expect(() => mountChart(undefined as unknown as ChartLike, canvas, presets.bar({ labels: [], series: [] }))).toThrow(/Chart\.js/);
    const h = mountChart(Chart, canvas, presets.donut({ series: [{ label: "a", value: 1 }] }));
    expect(FakeChart.instances).toHaveLength(1); expect((FakeChart.instances[0].options as { scales: object }).scales).toEqual({});
    h.destroy(); expect(FakeChart.instances[0].destroyed).toBe(true); canvas.remove();
  });
});
