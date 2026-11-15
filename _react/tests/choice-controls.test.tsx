import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState, type ReactElement } from "react";
import { Button, Checkbox, CheckboxGroup, Chip, ChipGroup, DataTable, Form, Radio, RadioGroup, SelectButton, Slider, Switch, ToastProvider } from "../src";

describe("Select Button — radiogroup", () => {
  const OPTS = [{ value: "a", label: "A" }, { value: "b", label: "B", disabled: true }, { value: "c", label: "C" }];
  it("하나의 Tab 칸 · role=radio · aria-checked", () => {
    render(<SelectButton label="기간" options={OPTS} defaultValue="c" />);
    expect(screen.getByRole("radiogroup", { name: "기간" })).toBeTruthy();
    const [a, , c] = screen.getAllByRole("radio");
    expect(c.getAttribute("aria-checked")).toBe("true");
    expect(c.tabIndex).toBe(0);
    expect(a.tabIndex).toBe(-1);
  });
  it("화살표는 비활성을 건너뛰고 끝에서 돌아오며 바로 고른다", () => {
    const onChange = vi.fn();
    render(<SelectButton label="기간" options={OPTS} defaultValue="a" onChange={onChange} />);
    const [a, , c] = screen.getAllByRole("radio");
    a.focus();
    fireEvent.keyDown(a, { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("c");
    expect(document.activeElement).toBe(c);
    fireEvent.keyDown(c, { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("a");
    expect(document.activeElement).toBe(a);
  });
  it("solid 는 outline 과 함께 클래스를 붙이고, outline 없이는 경고하고 무시한다(2026-11-11)", () => {
    const { container, rerender } = render(<SelectButton label="판정" options={OPTS} outline solid />);
    expect(container.querySelector(".select-btn")!.className).toBe("select-btn outline solid");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    rerender(<SelectButton label="판정" options={OPTS} solid />);
    expect(container.querySelector(".select-btn")!.className).toBe("select-btn");
    expect(warn.mock.calls.some((c) => String(c[0]).includes("solid"))).toBe(true);
    warn.mockRestore();
  });
});

describe("Switch — 응답 후 반영", () => {
  const setup = (action: () => Promise<unknown>, extra = {}) => {
    render(<ToastProvider><Switch action={action} {...extra}>실시간 보호</Switch></ToastProvider>);
    return screen.getByRole("switch") as HTMLInputElement;
  };
  it("끝나기 전에는 바뀌지 않고 처리 중, 다시 눌러도 한 번만", async () => {
    let done!: () => void;
    const action = vi.fn(() => new Promise<void>((r) => { done = r; }));
    const sw = setup(action);
    fireEvent.click(sw);
    expect(sw.checked).toBe(false);
    expect(sw.getAttribute("aria-busy")).toBe("true");
    expect(sw.disabled).toBe(false);
    fireEvent.click(sw);
    expect(action).toHaveBeenCalledTimes(1);
    await act(async () => { done(); });
    expect(sw.checked).toBe(true);
    expect(sw.getAttribute("aria-busy")).toBeNull();
  });
  it("false 를 돌려주면 조용히 그대로", async () => {
    const sw = setup(async () => false);
    await act(async () => { fireEvent.click(sw); });
    expect(sw.checked).toBe(false);
    expect(document.querySelector(".toast")).toBeNull();
  });
  it("실패하면 그대로 두고 닫을 때까지 Toast", async () => {
    const sw = setup(() => Promise.reject(new Error("x")), { errorMessage: "서버에 연결하지 못했습니다." });
    await act(async () => { fireEvent.click(sw); });
    expect(sw.checked).toBe(false);
    expect(sw.getAttribute("aria-busy")).toBeNull();
    expect(document.querySelector(".toast.danger")?.textContent).toContain("서버에 연결하지 못했습니다.");
    await act(async () => { fireEvent.click(document.querySelector(".toast.danger button")!); });
    expect(document.querySelector(".toast.danger")).toBeNull();
  });
  it("action 없이는 바로 바뀐다", () => {
    const onChange = vi.fn();
    render(<Switch onChange={onChange}>A</Switch>);
    fireEvent.click(screen.getByRole("switch"));
    expect((screen.getByRole("switch") as HTMLInputElement).checked).toBe(true);
    expect(onChange.mock.calls[0][0]).toBe(true);
  });
  it("action 은 ToastProvider 없이 쓰면 알려 준다", () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Switch action={async () => {}}>A</Switch>)).toThrow(/ToastProvider/);
    err.mockRestore();
  });
});

describe("Chip", () => {
  function Inputs({ start = ["a", "b", "c"] }: { start?: string[] }) {
    const [v, setV] = useState(start);
    return <ChipGroup data-testid="g">{v.map((x) => <Chip key={x} onRemove={() => setV((s) => s.filter((y) => y !== x))}>{x}</Chip>)}</ChipGroup>;
  }
  it("지우기는 값이 든 이름의 진짜 버튼", () => {
    render(<Inputs />);
    expect(screen.getByRole("button", { name: "a 제거" }).tagName).toBe("BUTTON");
  });
  it("지우면 다음, 없으면 앞, 없으면 묶음으로 포커스", async () => {
    render(<Inputs />);
    fireEvent.click(screen.getByRole("button", { name: "a 제거" }));
    await waitFor(() => expect(document.activeElement?.getAttribute("aria-label")).toBe("b 제거"));
    screen.getByRole("button", { name: "c 제거" }).focus();   // 포커스가 b 에 그대로 있으면 옮기지 않아도 통과한다
    fireEvent.click(screen.getByRole("button", { name: "c 제거" }));
    await waitFor(() => expect(document.activeElement?.getAttribute("aria-label")).toBe("b 제거"));
    fireEvent.click(screen.getByRole("button", { name: "b 제거" }));
    await waitFor(() => expect(document.activeElement).toBe(screen.getByTestId("g")));
  });
  it("필터 초기화는 끄고 첫 칩으로 포커스", () => {
    function F() {
      const [on, setOn] = useState(["a"]);
      return <ChipGroup clearable={on.length > 0} onClear={() => setOn([])}><Chip selected={on.includes("a")}>a</Chip><Chip>b</Chip></ChipGroup>;
    }
    render(<F />);
    fireEvent.click(screen.getByRole("button", { name: "필터 초기화" }));
    expect(screen.queryByRole("button", { name: "필터 초기화" })).toBeNull();
    expect(document.activeElement?.textContent).toBe("a");
  });
  it("형태 · 색 — outline 은 클래스 없음, solid · neutral 클래스, 고르면 on(2026-11-13)", () => {
    const { container } = render(<>
      <Chip defaultSelected>a</Chip><Chip variant="solid" color="neutral" defaultSelected>b</Chip><Chip variant="solid">c</Chip>
    </>);
    expect([...container.querySelectorAll(".chip")].map((c) => c.className)).toEqual(["chip on", "chip solid neutral on", "chip solid"]);
  });
  it("입력값 · 동작 칩은 형태만 받는다 — color · selected 는 경고하고 무시", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<>
      <Chip variant="solid" color="neutral" selected onRemove={() => {}}>10.0.0.1</Chip><Chip action variant="solid" color="neutral">추가</Chip>
    </>);
    expect([...container.querySelectorAll(".chip")].map((c) => c.className)).toEqual(["chip solid", "chip solid"]);
    expect(warn.mock.calls.some((c) => String(c[0]).includes("고를 수 있는 칩에만"))).toBe(true);
    warn.mockRestore();
  });
});

describe("필수 그룹 — <Form validate>", () => {
  const form = (group: ReactElement) => render(<Form validate onSubmit={(e) => e.preventDefault()}>{group}<Button type="submit">저장</Button></Form>);
  const field = () => document.querySelector(".field")!;
  it("Checkbox — 제출에 알리고 고르면 지우며 마지막을 풀면 다시", () => {
    form(<CheckboxGroup legend="알림 채널" required help="하나 이상 선택합니다."><Checkbox>이메일</Checkbox><Checkbox>SMS</Checkbox></CheckboxGroup>);
    const help = field().querySelector(".help")!;
    expect(help.textContent).toBe("하나 이상 선택합니다.");
    fireEvent.click(screen.getByRole("button", { name: "저장" }));
    expect(field().classList.contains("error")).toBe(true);
    expect(help.textContent).toBe("필수 항목입니다. 항목을 선택하세요.");
    expect(field().querySelector("fieldset")!.getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(screen.getAllByRole("checkbox")[0]);
    fireEvent.click(screen.getAllByRole("checkbox")[1]);
    expect(field().classList.contains("error")).toBe(false);
    expect(help.textContent).toBe("하나 이상 선택합니다.");
    fireEvent.click(screen.getAllByRole("checkbox")[1]);
    expect(field().classList.contains("error")).toBe(true);
  });
  it("Radio — 요약 이름은 legend, 고르면 지운다", () => {
    const onValidate = vi.fn();
    render(<Form validate onValidate={onValidate} onSubmit={(e) => e.preventDefault()}><RadioGroup legend="격리 해제 권한" required><Radio value="a">A</Radio><Radio value="b">B</Radio></RadioGroup><Button type="submit">저장</Button></Form>);
    fireEvent.click(screen.getByRole("button", { name: "저장" }));
    expect(onValidate.mock.calls[0][0].errors[0].label).toBe("격리 해제 권한");
    expect((screen.getAllByRole("radio")[0] as HTMLInputElement).required).toBe(true);
    fireEvent.click(screen.getAllByRole("radio")[1]);
    expect(field().classList.contains("error")).toBe(false);
  });
  it("legend 만 있으면 .field 로 감싸지 않는다", () => {
    render(<RadioGroup legend="Q"><Radio value="a">A</Radio></RadioGroup>);
    expect(document.querySelector(".field")).toBeNull();
  });
});

describe("표의 행 이름 · Slider 단위", () => {
  it("행 체크박스의 이름에 첫 열 값", () => {
    render(<DataTable columns={[{ key: "name", header: "정책" }]} rows={[{ id: "1", name: "외부 USB 차단" }]} rowKey={(r) => r.id} selectable />);
    expect(screen.getByRole("checkbox", { name: "외부 USB 차단 선택" })).toBeTruthy();
  });
  it("글자 값이면 aria-valuetext, 없으면 안 넣는다", () => {
    const { rerender } = render(<Slider label="보관" defaultValue={90} max={180} valueText={(v) => v + "일"} />);
    expect(screen.getByRole("slider").getAttribute("aria-valuetext")).toBe("90일");
    rerender(<Slider label="보관" defaultValue={90} max={180} />);
    expect(screen.getByRole("slider").getAttribute("aria-valuetext")).toBeNull();
  });
});

/* 입력값 칩의 긴 값(2026-11-12) — 잘린 값에만 Tooltip(aria-hidden), title 없음. jsdom 은 배치가 없어 폭을 흉내 낸다(글자 수 × 10 / 칸 240) */
describe("칩 긴 값 Tooltip", () => {
  it("잘린 값에만 Tooltip 을 붙이고 title 은 쓰지 않는다", () => {
    const sw = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollWidth"), cw = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", { configurable: true, get() { return (this as HTMLElement).classList.contains("lbl") ? (this as HTMLElement).textContent!.length * 10 : 0; } });
    Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get() { return 240; } });
    try {
      render(<ChipGroup><Chip onRemove={() => {}}>10.0.0.12</Chip><Chip onRemove={() => {}}>security-audit-notification@corp.example.com</Chip></ChipGroup>);
      const lbls = Array.from(document.querySelectorAll(".chip .lbl"));
      expect(lbls.map((l) => l.parentElement!.classList.contains("tooltip-wrap"))).toEqual([false, true]);
      expect(lbls.some((l) => l.hasAttribute("title"))).toBe(false);
      const tip = lbls[1].parentElement!.querySelector(".tooltip")!;
      expect(tip.textContent).toBe("security-audit-notification@corp.example.com");
      expect(tip.getAttribute("aria-hidden")).toBe("true");
      expect(screen.getByRole("button", { name: "security-audit-notification@corp.example.com 제거" })).toBeTruthy();
    } finally {
      if (sw) Object.defineProperty(HTMLElement.prototype, "scrollWidth", sw);
      if (cw) Object.defineProperty(HTMLElement.prototype, "clientWidth", cw);
    }
  });
});
