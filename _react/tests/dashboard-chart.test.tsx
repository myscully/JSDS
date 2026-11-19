/* 대시보드 '일별 탐지' = Data Visual Default 와 같은 계열 하나인 추이(2026-11-18 — 그 전 심각도 누적 막대).
   구조 비교(skeleton)는 canvas 의 차트 종류 · 데이터를 보지 않아 막대로 되돌려도 통과했다 — 두 예제가 Chart 에 넘기는 설정을 받아 대조한다 */
import { render } from "@testing-library/react";
import type { ReactElement } from "react";

const seen: { type: string; data: { labels: unknown; datasets: { label?: string; data: unknown }[] } }[] = [];
vi.mock("chart.js/auto", () => ({
  Chart: class {
    ctx = null; data: unknown; options: unknown;
    constructor(_c: unknown, cfg: (typeof seen)[number] & { options: unknown }) { seen.push(cfg); this.data = cfg.data; this.options = cfg.options; }
    update() {} destroy() {} resize() {}
  },
}));

import Dashboard from "../examples/patterns/dashboard/full";
import DataVisualDefault from "../examples/components/data-visual/default";

const mounted = (el: ReactElement) => { seen.length = 0; render(el); return [...seen]; };

describe("대시보드 일별 탐지", () => {
  it("Data Visual Default 와 같은 계열 하나인 선 추이(같은 데이터 · 같은 이름)", () => {
    const ref = mounted(<DataVisualDefault />)[0]!;
    const dash = mounted(<Dashboard />);
    const daily = dash.find((c) => c.type === "line");
    expect(daily, "대시보드에 선 추이가 없다").toBeTruthy();
    expect(dash.some((c) => c.type === "bar" && c.data.datasets.length > 2), "심각도 누적 막대가 남아 있다").toBe(false);
    expect(daily!.data.datasets).toHaveLength(1);
    expect(daily!.data.labels).toEqual(ref.data.labels);
    expect(daily!.data.datasets[0]!.data).toEqual(ref.data.datasets[0]!.data);
    expect(daily!.data.datasets[0]!.label).toBe(ref.data.datasets[0]!.label);
  });
});
