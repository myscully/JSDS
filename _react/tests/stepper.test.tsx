/* Steps 마법사(2026-11-13) — 순서대로 · 자유 이동 흐름, 단계 폼 검사, 입력값 유지, 포커스, onFinish, 옛 vertical 경고 */
import { fireEvent, render, screen } from "@testing-library/react";
import { Form, StepButton, Stepper, Steps, TextField } from "../src";

const steps = (p: string) => [
  { label: "기본 정보", content: <Form validate><TextField id={`${p}-name`} label="정책 이름" required defaultValue="외부 USB 차단" /></Form> },
  { label: "적용 대상", content: <Form validate><TextField id={`${p}-group`} label="적용 그룹" required /></Form> },
  { label: "규칙 설정", content: <p>규칙</p> },
  { label: "검토", content: <p>검토</p> },
];
const lis = (c: HTMLElement) => Array.from(c.querySelectorAll(".steps > li"));
const on = (c: HTMLElement) => lis(c).findIndex((li) => li.classList.contains("on"));
const panels = (c: HTMLElement) => Array.from(c.querySelectorAll<HTMLElement>(".step-panel"));
const click = (c: HTMLElement, k: string) => fireEvent.click(c.querySelector(`[data-step="${k}"]:not([hidden])`)!);

describe("Stepper", () => {
  it("next is blocked by the step's form, then passes and marks the step done", () => {
    const change = vi.fn();
    const { container } = render(<Stepper defaultCurrent={1} steps={steps("a")} onStepChange={change} />);
    expect(panels(container).map((p) => p.hidden)).toEqual([true, false, true, true]);
    click(container, "next");
    expect(on(container)).toBe(1);
    expect(change).not.toHaveBeenCalled();
    expect(document.activeElement?.id).toBe("a-group");
    fireEvent.change(screen.getByLabelText(/적용 그룹/), { target: { value: "영업팀" } });
    click(container, "next");
    expect(on(container)).toBe(2);
    expect(change).toHaveBeenCalledWith(2, { from: 1, trigger: "next" });
    expect(lis(container)[1].classList.contains("done")).toBe(true);
    expect(lis(container)[1].querySelector(".step-btn svg")).not.toBeNull();
    expect(lis(container)[1].querySelector(".sr-only")?.textContent).toContain("완료");
    expect(lis(container)[2].getAttribute("aria-current")).toBe("step");
    expect(document.activeElement).toBe(panels(container)[2]);
  });

  it("goes back by a done step, keeps inputs, and only done steps are buttons", () => {
    const { container } = render(<Stepper defaultCurrent={1} steps={steps("b")} />);
    fireEvent.change(screen.getByLabelText(/적용 그룹/), { target: { value: "영업팀" } });
    click(container, "next");
    expect(lis(container).map((li) => !!li.querySelector(":scope > .step-btn"))).toEqual([true, true, false, false]);
    fireEvent.click(lis(container)[0].querySelector(".step-btn")!);
    expect(on(container)).toBe(0);
    expect((screen.getByLabelText(/적용 그룹/) as HTMLInputElement).value).toBe("영업팀");
    expect((container.querySelector('[data-step="prev"]') as HTMLButtonElement).disabled).toBe(true);
  });

  it("Enter in the step's form is next; the last step shows finish and calls onFinish", () => {
    const finish = vi.fn();
    const { container } = render(<Stepper defaultCurrent={1} steps={steps("c")} onFinish={finish} />);
    const input = screen.getByLabelText(/적용 그룹/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "영업팀" } });
    fireEvent.submit(input.form!);
    expect(on(container)).toBe(2);
    click(container, "next");
    expect((container.querySelector('[data-step="next"]') as HTMLElement).hidden).toBe(true);
    expect((container.querySelector('[data-step="finish"]') as HTMLElement).hidden).toBe(false);
    click(container, "finish");
    expect(finish).toHaveBeenCalledWith(3);
  });

  it("nonLinear: any step is a button, leaving marks done quietly, finish goes to the first blocked step", () => {
    const finish = vi.fn(), change = vi.fn();
    const { container } = render(<Stepper nonLinear steps={steps("d")} onFinish={finish} onStepChange={change} />);
    expect(lis(container).map((li) => !!li.querySelector(":scope > .step-btn"))).toEqual([false, true, true, true]);
    fireEvent.click(lis(container)[1].querySelector(".step-btn")!);
    expect(lis(container)[0].classList.contains("done")).toBe(true);
    fireEvent.click(lis(container)[3].querySelector(".step-btn")!);
    expect(lis(container)[1].classList.contains("done")).toBe(false);
    expect(container.querySelector(".field.error")).toBeNull();
    click(container, "finish");
    expect(finish).not.toHaveBeenCalled();
    expect(on(container)).toBe(1);
    expect(change).toHaveBeenLastCalledWith(1, { from: 3, trigger: "finish" });
    expect(document.activeElement?.id).toBe("d-group");
    fireEvent.change(screen.getByLabelText(/적용 그룹/), { target: { value: "영업팀" } });
    fireEvent.click(lis(container)[3].querySelector(".step-btn")!);
    click(container, "finish");
    expect(finish).toHaveBeenCalledWith(3);
  });

  it("vertical puts each panel inside its step; controlled current waits for the parent", () => {
    const change = vi.fn();
    const { container } = render(<Stepper layout="vertical" current={2} steps={steps("e")} onStepChange={change} />);
    expect(container.querySelector(".steps")!.classList.contains("vertical")).toBe(true);
    expect(lis(container).every((li) => li.querySelector(":scope > .step-panel"))).toBe(true);
    click(container, "prev");
    expect(change).toHaveBeenCalledWith(1, { from: 2, trigger: "prev" });
    expect(on(container)).toBe(2);
  });

  it("StepButton works inside content when actions={false}", () => {
    const { container } = render(
      <Stepper actions={false} steps={[1, 2, 3].map((n) => ({ label: `s${n}`, content: <StepButton step="next" /> }))} />,
    );
    expect(container.querySelector(".step-actions")).toBeNull();
    fireEvent.click(container.querySelector('[data-step="next"]:not([hidden])')!);
    expect(on(container)).toBe(1);
  });
});

describe("Steps layout", () => {
  it("label-below class, .label span, check 16, and the old vertical prop warns once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container, rerender } = render(<Steps items={["a", "b", "c"]} current={1} layout="label-below" />);
    expect(container.querySelector(".steps")!.className).toBe("steps label-below");
    expect(container.querySelectorAll(".label").length).toBe(3);
    expect(container.querySelector("li.done svg")!.getAttribute("width")).toBe("16");
    rerender(<Steps items={["a", "b", "c"]} current={1} vertical />);
    expect(container.querySelector(".steps")!.classList.contains("vertical")).toBe(true);
    expect(warn.mock.calls.filter((c) => String(c[0]).includes("layout=\"vertical\"")).length).toBe(1);
    warn.mockRestore();
  });
  it("stacks when the row does not fit (horizontal · label-below), never for vertical", () => {
    const proto = HTMLElement.prototype, keep = ["scrollWidth", "clientWidth", "offsetParent"].map((k) => [k, Object.getOwnPropertyDescriptor(proto, k)] as const);
    let need = 500;
    Object.defineProperty(proto, "scrollWidth", { configurable: true, get() { return this.tagName === "OL" ? (this.classList.contains("stacked") ? 300 : need) : 0; } });
    Object.defineProperty(proto, "clientWidth", { configurable: true, get() { return this.tagName === "OL" ? 300 : 0; } });
    Object.defineProperty(proto, "offsetParent", { configurable: true, get() { return document.body; } });
    try {
      const a = render(<Steps items={["a", "b", "c"]} current={1} />);
      expect(a.container.querySelector(".steps")!.classList.contains("stacked")).toBe(true);
      /* 다시 잴 때 .stacked 를 떼고 잰다 — 붙인 채로는 늘 들어가 보여 풀려 버린다 */
      a.rerender(<Steps items={["a", "b", "c"]} current={2} />);
      expect(a.container.querySelector(".steps")!.classList.contains("stacked")).toBe(true);
      const b = render(<Stepper layout="label-below" steps={steps("f")} />);
      expect(b.container.querySelector(".steps")!.classList.contains("stacked")).toBe(true);
      const c = render(<Steps items={["a", "b", "c"]} current={1} layout="vertical" />);
      expect(c.container.querySelector(".steps")!.classList.contains("stacked")).toBe(false);
      need = 200;
      const d = render(<Steps items={["a", "b", "c"]} current={1} />);
      expect(d.container.querySelector(".steps")!.classList.contains("stacked")).toBe(false);
    } finally {
      for (const [k, d] of keep) { if (d) Object.defineProperty(proto, k, d); else delete (proto as unknown as Record<string, unknown>)[k]; }
    }
  });
  it("nonLinear Steps makes every other step a button", () => {
    const pick = vi.fn();
    const { container } = render(<Steps items={["a", "b", "c"]} current={0} nonLinear onStepClick={pick} />);
    fireEvent.click(container.querySelectorAll(".step-btn")[1]);
    expect(pick).toHaveBeenCalledWith(2);
  });
});
