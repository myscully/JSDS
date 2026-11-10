import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { Button, Form, FormActions, NumberInput } from "../src";

const parts = (name = "세션") => ({
  input: screen.getByRole("spinbutton") as HTMLInputElement,
  down: screen.getByRole("button", { name: `${name} 줄이기`, hidden: true }) as HTMLButtonElement,
  up: screen.getByRole("button", { name: `${name} 늘리기`, hidden: true }) as HTMLButtonElement,
});

describe("NumberInput", () => {
  it("renders a number field with a unit and two unfocusable buttons", () => {
    const { container } = render(<NumberInput label="세션" unit="분" defaultValue={30} min={5} max={100} />);
    const { input, down, up } = parts();
    expect(input.type).toBe("number");
    expect(input.min).toBe("5");
    expect(input.max).toBe("100");
    expect(input.value).toBe("30");
    expect(screen.getByLabelText("세션")).toBe(input);
    expect(input.getAttribute("aria-valuetext")).toBe("30분");
    expect(container.querySelector(".field.number-field .affix > span")?.textContent).toBe("분");
    expect(down.tabIndex).toBe(-1);
    expect(up.tabIndex).toBe(-1);
  });

  it("steps with the buttons, fires onChange and keeps the focus on the input", () => {
    const onChange = vi.fn();
    render(<NumberInput label="세션" unit="분" defaultValue={30} min={5} max={100} onChange={onChange} />);
    const { input, down, up } = parts();
    fireEvent.click(up);
    expect(input.value).toBe("31");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(input);
    expect(input.getAttribute("aria-valuetext")).toBe("31분");
    fireEvent.click(down);
    expect(input.value).toBe("30");
  });

  it("works controlled", () => {
    function Host() {
      const [v, setV] = useState<string | number>(10);
      return <NumberInput label="세션" value={v} min={0} max={11} onChange={(e) => setV(e.target.value)} />;
    }
    render(<Host />);
    const { input, up } = parts();
    fireEvent.click(up);
    expect(input.value).toBe("11");
    expect(up.disabled).toBe(true);
  });

  it("follows a value the product changes on its own", () => {
    const { rerender } = render(<NumberInput label="세션" unit="분" value={5} min={0} max={10} onChange={() => {}} />);
    rerender(<NumberInput label="세션" unit="분" value={10} min={0} max={10} onChange={() => {}} />);
    const { input, up } = parts();
    expect(up.disabled).toBe(true);
    expect(input.getAttribute("aria-valuetext")).toBe("10분");
  });

  it("uses step and snaps an off-step value", () => {
    render(<NumberInput label="세션" defaultValue={7} min={0} max={60} step={5} />);
    const { input, up } = parts();
    fireEvent.click(up);
    expect(input.value).toBe("10");
    fireEvent.click(up);
    expect(input.value).toBe("15");
  });

  it("turns off the button at each end", () => {
    render(<NumberInput label="세션" defaultValue={5} min={5} max={6} />);
    const { down, up } = parts();
    expect(down.disabled).toBe(true);
    expect(up.disabled).toBe(false);
    fireEvent.click(up);
    expect(up.disabled).toBe(true);
    expect(down.disabled).toBe(false);
  });

  it("keeps both buttons on when empty and drops the spoken value", () => {
    render(<NumberInput label="세션" unit="분" min={5} max={6} />);
    const { input, down, up } = parts();
    expect(down.disabled).toBe(false);
    expect(up.disabled).toBe(false);
    expect(input.getAttribute("aria-valuetext")).toBeNull();
  });

  it("has no limit without min and max", () => {
    render(<NumberInput label="세션" defaultValue={-5000} />);
    const { down, up } = parts();
    expect(down.disabled).toBe(false);
    expect(up.disabled).toBe(false);
  });

  it("keeps an out-of-range value and reports it on leaving", () => {
    const { container } = render(<NumberInput label="세션" min={5} max={100} help="범위" />);
    const { input } = parts();
    fireEvent.change(input, { target: { value: "999" } });
    expect(container.querySelector(".field")?.classList.contains("error")).toBe(false);
    fireEvent.blur(input);
    expect(input.value).toBe("999");
    expect(container.querySelector(".field")?.classList.contains("error")).toBe(true);
    expect(container.querySelector(".help")?.textContent).toBe("값이 너무 큽니다. 100 이하 입력하세요.");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    fireEvent.change(input, { target: { value: "50" } });
    expect(container.querySelector(".field")?.classList.contains("error")).toBe(false);
    expect(container.querySelector(".help")?.textContent).toBe("범위");
  });

  it("clears a range error when stepping back in", () => {
    const { container } = render(<NumberInput label="세션" min={5} max={100} />);
    const { input, down } = parts();
    fireEvent.change(input, { target: { value: "999" } });
    fireEvent.blur(input);
    fireEvent.click(down);
    expect(input.value).toBe("100");
    expect(container.querySelector(".field")?.classList.contains("error")).toBe(false);
  });

  it("is quiet when left empty outside a form", () => {
    const { container } = render(<NumberInput label="세션" required min={5} />);
    fireEvent.blur(parts().input);
    expect(container.querySelector(".field")?.classList.contains("error")).toBe(false);
  });

  it("reports text that is not a number on leaving", () => {
    const { container } = render(<NumberInput label="세션" min={5} />);
    const { input } = parts();
    Object.defineProperty(input, "validity", { value: { valid: false, badInput: true } });
    fireEvent.blur(input);
    expect(container.querySelector(".help")?.textContent).toBe("숫자가 아닙니다. 숫자를 입력하세요.");
  });

  it("keeps the product's wrapper class", () => {
    const { container } = render(<NumberInput label="세션" wrapperClassName="mine" />);
    expect(container.querySelector(".field.number-field.mine")).toBeTruthy();
  });

  it("shows a given error and turns off with disabled", () => {
    const { container } = render(<NumberInput label="세션" defaultValue={5} error="서버 오류" disabled />);
    const { input, down, up } = parts();
    expect(input.disabled).toBe(true);
    expect(container.querySelector(".help")?.textContent).toBe("서버 오류");
    expect(down.disabled).toBe(true);
    expect(up.disabled).toBe(true);
  });

  it("turns off the buttons when read-only", () => {
    render(<NumberInput label="세션" defaultValue={5} readOnly onChange={() => {}} />);
    const { input, up } = parts();
    expect(input.readOnly).toBe(true);
    expect(up.disabled).toBe(true);
  });

  it("calls the product's onBlur and takes labels and messages", () => {
    const onBlur = vi.fn();
    const { container } = render(<NumberInput label="Max" min={5} onBlur={onBlur} labels={{ decrease: "Less", increase: "More" }} messages={{ min: "At least {min}." }} />);
    expect(screen.getByRole("button", { name: "Max Less", hidden: true })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Max More", hidden: true })).toBeTruthy();
    const input = screen.getByLabelText("Max");
    fireEvent.change(input, { target: { value: "1" } });
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalled();
    expect(container.querySelector(".help")?.textContent).toBe("At least 5.");
  });

  it("forwards the ref to the input", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<NumberInput ref={ref} label="세션" />);
    expect(ref.current?.type).toBe("number");
  });

  describe("in a validating Form", () => {
    const setup = () => {
      const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
      const r = render(
        <Form validate onSubmit={onSubmit}>
          <NumberInput label="세션" required min={1} max={10} help="1~10" />
          <FormActions><Button type="submit">저장</Button></FormActions>
        </Form>,
      );
      return { ...r, onSubmit, help: () => r.container.querySelector(".field > .help")?.textContent, save: () => fireEvent.submit(r.container.querySelector("form") as HTMLFormElement) };
    };

    it("blocks empty and out-of-range values, then submits a good one", () => {
      const { help, save, onSubmit } = setup();
      const { input } = parts();
      save();
      expect(help()).toBe("필수 항목입니다. 값을 입력하세요.");
      expect(document.activeElement).toBe(input);
      fireEvent.input(input, { target: { value: "11" } });
      save();
      expect(help()).toBe("값이 너무 큽니다. 10 이하 입력하세요.");
      expect(input.value).toBe("11");
      expect(onSubmit).not.toHaveBeenCalled();
      fireEvent.input(input, { target: { value: "5" } });
      expect(help()).toBe("1~10");
      save();
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("leaves the error to the form, so fixing the value clears it", () => {
      const { container } = setup();
      const { input } = parts();
      fireEvent.input(input, { target: { value: "11" } });
      fireEvent.blur(input);
      expect(container.querySelector(".field")?.classList.contains("error")).toBe(true);
      fireEvent.input(input, { target: { value: "5" } });
      expect(container.querySelector(".field")?.classList.contains("error")).toBe(false);
    });

    it("clears the error when a button steps back into range", () => {
      const { help, save } = setup();
      const { input, down } = parts();
      fireEvent.input(input, { target: { value: "11" } });
      save();
      fireEvent.click(down);
      expect(input.value).toBe("10");
      expect(help()).toBe("1~10");
    });

    it("hands its messages to the form", () => {
      render(<Form validate><NumberInput label="값" max={1} messages={{ max: "At most {max}." }} /></Form>);
      expect(JSON.parse(screen.getByRole("spinbutton").getAttribute("data-messages") as string).max).toBe("At most {max}.");
    });
  });
});
