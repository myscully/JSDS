import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Button, Form, FormActions, TimePicker, checkTime } from "../src";

/* Time Picker(2026-11-13) — 사이트 behave.timepicker 와 같은 규칙 */
const input = () => screen.getByRole("textbox") as HTMLInputElement;
const btn = (name: string) => screen.getByRole("button", { name: `${name} 선택` }) as HTMLButtonElement;
const opt = (col: string, v: string) => (document.querySelector(`.time-col[aria-label="${col}"] [data-v="${+v}"]`) as HTMLElement);
const raf = () => act(() => new Promise((r) => requestAnimationFrame(() => r(null))));

describe("checkTime", () => {
  it("classifies empty · incomplete · invalid · min · max · valid with Date Picker's time messages", () => {
    expect(checkTime("").validity).toBe("empty");
    expect(checkTime("09:3")).toMatchObject({ validity: "incomplete", value: null, message: "시각이 덜 입력됐습니다. 14:30 처럼 끝까지 입력하세요." });
    expect(checkTime("25:10")).toMatchObject({ validity: "invalid", value: null, message: "시각이 잘못됐습니다. 14:30 처럼 24시간제로 입력하세요." });
    expect(checkTime("05:00", { min: "06:00" })).toMatchObject({ validity: "min", value: "05:00", message: "시각이 범위를 벗어났습니다. 06:00 부터 입력할 수 있습니다." });
    expect(checkTime("13:00", { max: "12:00" })).toMatchObject({ validity: "max", value: "13:00" });
    expect(checkTime("14:30:05", { seconds: true })).toMatchObject({ validity: "valid", value: "14:30:05" });
    expect(checkTime("14:30", { seconds: true }).validity).toBe("incomplete");
    expect(checkTime("13:00", { max: "12:00", messages: { max: "Must be before {max}." } }).message).toBe("Must be before 12:00.");
  });
});

describe("TimePicker", () => {
  it("renders the site structure — a numeric input, the HH:mm placeholder and a clock button", () => {
    const { container } = render(<TimePicker label="백업 시각" defaultValue="2:0" />);
    expect(input().value).toBe("02:00");
    expect(input().placeholder).toBe("HH:mm");
    expect(input().inputMode).toBe("numeric");
    expect(container.querySelector(".field.timepicker > .affix > input + button.tp-btn")).not.toBeNull();
    expect(btn("백업 시각").getAttribute("aria-expanded")).toBe("false");
    expect(container.querySelector(".time-panel")).toBeNull();
  });

  it("opens hour and minute listboxes, picking applies at once and fills empty segments with 00", () => {
    const onChange = vi.fn();
    render(<TimePicker label="시각" onChange={onChange} step={15} />);
    fireEvent.click(btn("시각"));
    expect(screen.getByRole("dialog", { name: "시각 선택" })).toBeTruthy();
    expect(screen.getAllByRole("listbox").map((l) => `${l.getAttribute("aria-label")}:${l.children.length}`)).toEqual(["시:24", "분:4"]);
    fireEvent.click(opt("분", "30"));
    expect(input().value).toBe("00:30");
    expect(onChange).toHaveBeenLastCalledWith("00:30", { text: "00:30", validity: "valid" });
    expect(opt("분", "30").getAttribute("aria-selected")).toBe("true");
    fireEvent.click(opt("시", "09"));
    expect(input().value).toBe("09:30");
    expect(btn("시각").getAttribute("aria-expanded")).toBe("true");
  });

  it("disables options outside min · max and ignores them", () => {
    render(<TimePicker label="업무" defaultValue="12:00" min="06:00" max="12:00" />);
    fireEvent.click(btn("업무"));
    const offHours = Array.from(document.querySelectorAll('.time-col[aria-label="시"] [aria-disabled="true"]')).map((o) => o.textContent);
    expect(offHours).toEqual(["00", "01", "02", "03", "04", "05", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]);
    expect(document.querySelectorAll('.time-col[aria-label="분"] [aria-disabled="true"]').length).toBe(59);
    fireEvent.click(opt("시", "05"));
    expect(input().value).toBe("12:00");
  });

  it("keyboard: ↓ · Enter moves to the next column, the last Enter closes and returns to the input, Esc closes", async () => {
    render(<TimePicker label="시각" defaultValue="02:30" />);
    fireEvent.click(btn("시각"));
    await raf();
    expect(document.activeElement).toBe(opt("시", "02"));
    fireEvent.keyDown(document.activeElement as Element, { key: "ArrowDown" });
    expect(document.activeElement).toBe(opt("시", "03"));
    fireEvent.keyDown(document.activeElement as Element, { key: "Enter" });
    await raf();
    expect(input().value).toBe("03:30");
    expect(document.activeElement).toBe(opt("분", "30"));
    fireEvent.keyDown(document.activeElement as Element, { key: "Enter" });
    expect(document.querySelector(".time-panel")).toBeNull();
    expect(document.activeElement).toBe(input());
    fireEvent.keyDown(input(), { key: "ArrowDown", altKey: true });
    expect(document.querySelector(".time-panel")).not.toBeNull();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.querySelector(".time-panel")).toBeNull();
  });

  it("formats typed digits, steps with ↑ and reports errors outside a form on blur", () => {
    const onChange = vi.fn();
    render(<TimePicker label="시각" max="12:00" onChange={onChange} />);
    const el = input();
    fireEvent.change(el, { target: { value: "930" } });
    expect(el.value).toBe("09:30");
    el.setSelectionRange(5, 5);
    fireEvent.keyDown(el, { key: "ArrowUp" });
    expect(el.value).toBe("09:31");
    fireEvent.change(el, { target: { value: "1300" } });
    fireEvent.blur(el);
    expect(screen.getByText("시각이 범위를 벗어났습니다. 12:00 까지 입력할 수 있습니다.")).toBeTruthy();
    expect(el.getAttribute("aria-invalid")).toBe("true");
    expect(onChange).toHaveBeenLastCalledWith("13:00", { text: "13:00", validity: "max" });
    fireEvent.change(el, { target: { value: "1100" } });
    expect(el.getAttribute("aria-invalid")).toBeNull();
  });

  it("joins Form validation — the common required message, then the time message", () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(
      <Form validate onSubmit={onSubmit}>
        <TimePicker label="점검 종료" required />
        <FormActions><Button type="submit">저장</Button></FormActions>
      </Form>,
    );
    fireEvent.click(screen.getByRole("button", { name: "저장" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("필수 항목입니다. 값을 입력하세요.")).toBeTruthy();
    fireEvent.change(input(), { target: { value: "18" } });
    fireEvent.blur(input());
    expect(screen.getByText("시각이 덜 입력됐습니다. 14:30 처럼 끝까지 입력하세요.")).toBeTruthy();
    fireEvent.change(input(), { target: { value: "1800" } });
    fireEvent.blur(input());
    fireEvent.click(screen.getByRole("button", { name: "저장" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("an invalid initial value blocks saving with the time message before anyone types", () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(
      <Form validate onSubmit={onSubmit}>
        <TimePicker label="백업 시각" defaultValue="25:10" />
        <FormActions><Button type="submit">저장</Button></FormActions>
      </Form>,
    );
    fireEvent.click(screen.getByRole("button", { name: "저장" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("시각이 잘못됐습니다. 14:30 처럼 24시간제로 입력하세요.")).toBeTruthy();
  });

  it("seconds adds a third column and follows a controlled value", () => {
    const { rerender } = render(<TimePicker label="기준" seconds value="14:30:05" />);
    expect(input().placeholder).toBe("HH:mm:ss");
    rerender(<TimePicker label="기준" seconds value="08:00:00" />);
    expect(input().value).toBe("08:00:00");
    fireEvent.click(btn("기준"));
    expect(screen.getAllByRole("listbox")).toHaveLength(3);
    expect(Array.from(document.querySelectorAll(".time-opt.on")).map((o) => o.textContent).join(":")).toBe("08:00:00");
  });
});
