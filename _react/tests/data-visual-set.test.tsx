/* Data Visual 한 세트(2026-11-15) — 한 톤 · 차트 카드 틀 · 증감 배지 · 진행 막대 목록 · 게이지 · 스파크.
   색 계산값은 사이트 behave.chart(헤드리스 Chromium)가 토큰과 대조하고, 여기서는 프리셋 · 색 고르기 · 마크업 · 경고를 본다 */
import { fireEvent, render } from "@testing-library/react";
import { ChartCard, Donut, Kpi, ProgressList } from "../src";
import { SparkCanvas, presets, type ChartLike, type DsChartConfig, type DsTheme } from "../src/chart";
import DSChart from "../src/chart/ds-chart.js";

const FakeChart = class { ctx = null; data: unknown; options: unknown; constructor(_c: HTMLCanvasElement, cfg: DsChartConfig) { this.data = cfg.data; this.options = cfg.options; } update() {} destroy() {} } as unknown as ChartLike;
const theme = { mono: ["m1", "m2", "m3", "m4"], series: ["s1", "s2", "s3", "s4", "s5", "s6"], tone: { critical: "C" } } as unknown as DsTheme;

describe("한 톤 — palette", () => {
  it("tone 없는 계열 수에 따라 1 · 1·4 · 1·2·4 · 1~4 단계, 5개부터 계열 색", () => {
    const pick = (n: number, mode?: "mono" | "categorical") => DSChart.palette(theme, mode, Array.from({ length: n }, () => undefined));
    expect(pick(1)).toEqual(["m1"]);
    expect(pick(2)).toEqual(["m1", "m4"]);
    expect(pick(3)).toEqual(["m1", "m2", "m4"]);
    expect(pick(4)).toEqual(["m1", "m2", "m3", "m4"]);
    expect(pick(5)).toEqual(["s1", "s2", "s3", "s4", "s5"]);
    expect(pick(2, "categorical")).toEqual(["s1", "s2"]);
  });
  it("tone 을 준 자리는 그 톤이고, 남은 tone 없는 것만 센다", () => {
    expect(DSChart.palette(theme, undefined, ["critical", undefined, undefined])).toEqual(["C", "m1", "m4"]);
  });
  it("color: mono 인데 tone 없는 계열이 5개면 계열 색으로 그리고 경고", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(DSChart.palette(theme, "mono", [undefined, undefined, undefined, undefined, undefined])[4]).toBe("s5");
    expect(warn).toHaveBeenCalled(); warn.mockRestore();
  });
});

describe("프리셋 — 영역 · 강조 · 그라데이션 · 게이지 · 스파크", () => {
  const one = [{ label: "탐지", data: [1, 2, 3] }];
  it("계열 하나인 timeseries 는 선 아래를 칠하고(origin) area:false 로 끈다", () => {
    expect(presets.timeseries({ labels: ["a", "b", "c"], series: one }).data.datasets[0]!.fill).toBe("origin");
    expect(presets.timeseries({ labels: ["a", "b", "c"], series: one, area: false }).data.datasets[0]!.fill).toBe(false);
  });
  it("bar 의 highlight · gradient 는 메타로, 누적과 gradient 는 경고하고 단색", () => {
    expect(presets.bar({ labels: ["a", "b", "c"], series: one, highlight: 1, gradient: true })._ds).toMatchObject({ highlight: 1, gradient: true });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(presets.bar({ labels: ["a"], series: one, stacked: true, gradient: true })._ds?.gradient).toBe(false);
    expect(warn).toHaveBeenCalled(); warn.mockRestore();
  });
  it("gauge 는 반원 doughnut(회전 -90 · 180° · 구멍 78%), data = [값, 남은 값], max 를 넘으면 멈추고 경고", () => {
    const g = presets.gauge({ value: 842, max: 1284, label: "66%", caption: "패치 적용" });
    expect(g.type).toBe("doughnut");
    expect(g.options).toMatchObject({ rotation: -90, circumference: 180, cutout: "78%" });
    expect(g.data.datasets[0]!.data).toEqual([842, 442]);
    expect(g._ds).toMatchObject({ kind: "gauge", center: "66%", caption: "패치 적용" });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(presets.gauge({ value: 120 }).data.datasets[0]!.data).toEqual([100, 0]);
    expect(warn).toHaveBeenCalled(); warn.mockRestore();
  });
  it("spark 는 축 없는 line, 영역 기본 · area:false, 라벨이 없으면 번호", () => {
    const s = presets.spark({ data: [3, 5, 4] });
    expect(s._ds?.kind).toBe("spark"); expect(s.data.labels).toEqual(["1", "2", "3"]); expect(s.data.datasets[0]!.fill).toBe("origin");
    expect(presets.spark({ data: [1], area: false }).data.datasets[0]!.fill).toBe(false);
  });
});

describe("ChartCard 틀", () => {
  it("머리(.chart-head > h3.chart-title + .chart-sub + .chart-action) · 큰 값 · 높이 단계 클래스", () => {
    const { container } = render(<ChartCard size="lg" title="일별 탐지" sub="최근 14일" action={<button>전체 보기</button>} figure={{ value: "1,429", unit: "건", delta: "8%", deltaDir: "up", deltaTone: "bad", note: "지난 14일 대비" }}><p>본문</p></ChartCard>);
    const card = container.firstElementChild!;
    expect(card.className).toBe("chart-card lg");
    expect([...card.querySelector(".chart-head")!.children].map((e) => e.className || e.tagName)).toEqual(["chart-title", "chart-sub", "chart-action"]);
    expect(card.querySelector(".chart-figure .value small")!.textContent).toBe("건");
    expect(card.querySelector(".chart-figure .delta")!.className).toBe("delta bad");
    expect(card.querySelector(".delta-note")!.textContent).toBe("지난 14일 대비");
    expect(render(<ChartCard size="md" title="t" />).container.firstElementChild!.className).toBe("chart-card");
  });
  it("상태 — 로딩은 aria-busy + Skeleton, 빈 상태 문구, 오류는 다시 시도가 onRetry 를 부름. 본문은 그리지 않는다", () => {
    const busy = render(<ChartCard title="t" state="loading"><p className="body" /></ChartCard>).container.firstElementChild!;
    expect(busy.getAttribute("aria-busy")).toBe("true"); expect(busy.querySelector(".chart-state > .skeleton.rect[role=status]")).not.toBeNull(); expect(busy.querySelector(".body")).toBeNull();
    expect(render(<ChartCard title="t" state="empty" stateText="없음" />).container.querySelector(".chart-state .empty b")!.textContent).toBe("표시할 데이터 없음");
    const retry = vi.fn();
    const err = render(<ChartCard title="t" state="error" onRetry={retry} />).container;
    fireEvent.click(err.querySelector(".empty.error [data-retry]")!); expect(retry).toHaveBeenCalledTimes(1);
  });
  it("옛 extra 는 sub 로 그리고 한 번 경고", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(render(<ChartCard title="t" extra="최근 7일" />).container.querySelector(".chart-sub")!.textContent).toBe("최근 7일");
    expect(warn.mock.calls.some((c) => String(c[0]).includes("extra"))).toBe(true); warn.mockRestore();
  });
});

describe("증감 배지 · KPI", () => {
  it("색은 deltaTone(bad · good · neutral), 방향은 화살표 + 숨긴 '증가' · '감소', 비교 기준은 .kpi-foot 의 .delta-note", () => {
    const { container } = render(<><Kpi label="a" value="1" delta="12%" deltaDir="up" deltaTone="bad" note="전주 대비" /><Kpi label="b" value="2" delta="3%" deltaDir="down" deltaTone="neutral" /><Kpi label="c" value="3" note="37대 오프라인" /></>);
    const [a, b, c] = [...container.querySelectorAll(".kpi")];
    expect(a!.querySelector(".kpi-foot > .delta")!.className).toBe("delta bad");
    expect(a!.querySelector(".delta .sr-only")!.textContent).toBe("증가");
    expect(a!.querySelector(".kpi-foot > .delta-note")!.textContent).toBe("전주 대비");
    expect(b!.querySelector(".delta")!.className).toBe("delta"); expect(b!.querySelector(".sr-only")!.textContent).toBe("감소");
    expect(c!.querySelector(".delta")).toBeNull(); expect(c!.querySelector(".delta-note")!.textContent).toBe("37대 오프라인");
  });
  it("deltaDir 만 주면 옛 뜻(up = bad · down = good)으로 그리고 경고 — 옛 .up · .down 클래스는 없다", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<><Kpi label="a" value="1" delta="1" deltaDir="up" /><Kpi label="b" value="2" delta="2" deltaDir="down" /></>);
    expect([...container.querySelectorAll(".delta")].map((e) => e.className)).toEqual(["delta bad", "delta good"]);
    warn.mockRestore();
  });
});

describe("진행 막대 목록 · 도넛 색 · 스파크 캔버스", () => {
  it("항목마다 role=meter · 값 속성 · 라벨 연결 · 폭 = 값 / 목표", () => {
    const { container } = render(<ProgressList items={[{ label: "개발팀", value: 412, max: 450, unit: "대" }]} />);
    const m = container.querySelector(".progress-list .progress-row .progress")!;
    expect(m.getAttribute("role")).toBe("meter");
    expect([m.getAttribute("aria-valuenow"), m.getAttribute("aria-valuemin"), m.getAttribute("aria-valuemax")]).toEqual(["412", "0", "450"]);
    expect(m.getAttribute("aria-valuetext")).toBe("412대 / 450대, 92%");
    expect(document.getElementById(m.getAttribute("aria-labelledby")!)!.textContent).toBe("개발팀");
    expect((m.firstElementChild as HTMLElement).style.width).toBe("91.6%");
  });
  it("tone 없는 4조각은 .mono + 한 톤 1~4, 6조각은 .categorical + 계열 색, 심각도 도넛은 클래스 없음", () => {
    const four = render(<Donut segments={[1, 2, 3, 4].map((v) => ({ label: String(v), value: v }))} />).container.firstElementChild as HTMLElement;
    expect(four.className).toBe("donut mono");
    expect(four.style.background.match(/--chart-mono-\d/g)).toEqual(["--chart-mono-1", "--chart-mono-2", "--chart-mono-3", "--chart-mono-4"]);
    const six = render(<Donut segments={[1, 2, 3, 4, 5, 6].map((v) => ({ label: String(v), value: v }))} />).container.firstElementChild as HTMLElement;
    expect(six.className).toBe("donut categorical"); expect(six.style.background).toContain("--chart-series-6");
    expect((render(<Donut segments={[{ label: "a", value: 1, tone: "critical" }]} />).container.firstElementChild as HTMLElement).className).toBe("donut");
  });
  it("SparkCanvas 는 .chart-canvas.spark > canvas[role=img] (표로 보기 틀 없음)", () => {
    const { container } = render(<SparkCanvas chart={FakeChart} config={presets.spark({ data: [1, 2] })} aria-label="추이" />);
    expect(container.querySelector(".chart-view")).toBeNull();
    expect(container.querySelector(".chart-canvas.spark > canvas[role=img][aria-label='추이']")).not.toBeNull();
  });
});
