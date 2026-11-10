import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DatePicker, Form, TextField } from "../src";
import Example from "../examples/patterns/input-form/validate";

/* 입력 검증 · 글자 수 한도 · 비밀번호 표시(사람의 결정 2026-11-09) — 사이트 ds.js 의 form[data-validate] 와 같은 약속 */
const input = (name: string) => screen.getByLabelText(new RegExp(name)) as HTMLInputElement;
const type = (el: HTMLInputElement, value: string) => fireEvent.input(el, { target: { value } });
const help = (el: HTMLInputElement) => el.closest(".field")!.querySelector(":scope > .help")!;
const save = () => fireEvent.click(screen.getByRole("button", { name: "정책 저장" }));
const fillRest = () => {
  type(screen.getByRole("spinbutton", { name: /보관 기간/ }) as HTMLInputElement, "90");   // Number Input 의 증감 버튼 이름에도 값의 이름이 있다
  type(input("알림 이메일"), "admin@example.com");
};

describe("Form validate", () => {
  it("건드리지 않은 빈 필드는 포커스가 떠나도 조용하다", () => {
    render(<Example />);
    fireEvent.blur(input("정책 이름"));
    expect(input("정책 이름").closest(".field")!.classList.contains("error")).toBe(false);
    expect(help(input("정책 이름")).textContent).toBe("2~40자");
  });

  it("틀린 값은 포커스가 떠날 때 알리고, 고치면 바로 지우며 도움말로 돌아간다", () => {
    render(<Example />);
    const ip = input("허용 IP");
    type(ip, "10.0.0");
    fireEvent.blur(ip);
    expect(help(ip).textContent).toBe("올바른 IPv4 형식이 아닙니다. 예: 10.0.0.12");
    expect(ip.getAttribute("aria-invalid")).toBe("true");
    expect(ip.value).toBe("10.0.0");
    expect(help(ip).getAttribute("aria-live")).toBe("polite");
    expect(ip.getAttribute("aria-describedby")).toBe(help(ip).id);
    type(ip, "10.0.0.12");
    expect(ip.hasAttribute("aria-invalid")).toBe(false);
    expect(help(ip).textContent).toBe("IPv4 형식");
  });

  it("제출을 막고 첫 오류로 포커스, 3개 이상이면 요약, 줄면 지운다", () => {
    const onSubmit = vi.fn();
    const onValidate = vi.fn();
    const { container } = render(
      <Form validate onSubmit={onSubmit} onValidate={onValidate}>
        <TextField id="a" label="가" required />
        <TextField id="b" label="나" required />
        <TextField id="c" label="다" required />
        <button type="submit">정책 저장</button>
      </Form>,
    );
    save();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(container.querySelector("#a"));
    const summary = () => container.querySelector("form > [data-form-summary]");
    expect(summary()!.textContent).toContain("입력값 3개를 확인하세요");
    expect(summary()!.textContent).toContain("가, 나, 다");
    expect(onValidate.mock.calls[0][0].valid).toBe(false);
    expect(onValidate.mock.calls[0][0].errors).toHaveLength(3);
    type(container.querySelector("#a") as HTMLInputElement, "값");
    expect(summary()).toBeNull();
  });

  it("맞으면 onSubmit 이 불린다", () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(
      <Form validate onSubmit={onSubmit}>
        <TextField id="a" label="가" required defaultValue="값" />
        <button type="submit">정책 저장</button>
      </Form>,
    );
    save();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("넘은 글자 수는 입력되고 오류로 알리며 제출을 막는다", () => {
    render(<Example />);
    const name = input("정책 이름");
    expect(name.hasAttribute("maxlength")).toBe(false);
    type(name, "가".repeat(41));
    expect(name.value).toHaveLength(41);
    expect(help(name).textContent).toBe("글자 수가 1자 넘었습니다. 40자 이하로 줄이세요.");
    type(input("허용 IP"), "10.0.0.12");
    fillRest();
    save();
    expect(document.activeElement).toBe(name);
  });

  it("messages 로 문구를 덮어쓴다", () => {
    const { container } = render(
      <Form validate messages={{ required: "Required." }}>
        <TextField id="a" label="가" required />
        <button type="submit">정책 저장</button>
      </Form>,
    );
    save();
    expect(container.querySelector(".help")!.textContent).toBe("Required.");
  });

  it("Date Picker 는 스스로 잰다 — Form 이 입력을 잡지 않고 빈 문구 영역도 더하지 않는다", () => {
    const { container } = render(
      <Form validate>
        <DatePicker label="시작일" />
      </Form>,
    );
    expect(container.querySelector("[data-ds-field]")).toBeNull();
    expect(container.querySelector(".help")).toBeNull();
  });
});

describe("TextField", () => {
  it("폼 밖에서도 한도를 넘으면 오류, 비제어 카운터가 따라온다, 되돌리면 지운다", () => {
    const { container } = render(<TextField label="설명" maxLength={3} showCount defaultValue="가" />);
    const el = input("설명");
    expect(container.querySelector(".counter")!.textContent).toBe("1 / 3");
    type(el, "가나다라");
    expect(el.value).toHaveLength(4);
    expect(container.querySelector(".counter")!.textContent).toBe("4 / 3");
    expect(container.querySelector(".counter")!.classList.contains("over")).toBe(true);
    expect(container.querySelector(".field")!.classList.contains("error")).toBe(true);
    expect(help(el).textContent).toBe("글자 수가 1자 넘었습니다. 3자 이하로 줄이세요.");
    type(el, "가나다");
    expect(container.querySelector(".field")!.classList.contains("error")).toBe(false);
    expect(help(el).textContent).toBe("");
  });

  it("불러온 값이 이미 넘었으면 입력 전에는 오류를 내지 않는다", () => {
    const { container } = render(<TextField label="설명" maxLength={3} showCount defaultValue="가나다라" />);
    expect(container.querySelector(".counter")!.classList.contains("over")).toBe(true);
    expect(container.querySelector(".field")!.classList.contains("error")).toBe(false);
  });

  it("reveal — type · aria-pressed 가 바뀌고 값은 그대로다", () => {
    const { container } = render(<TextField label="비밀번호" reveal defaultValue="abc" />);
    const el = container.querySelector("input") as HTMLInputElement;
    const btn = screen.getByRole("button", { name: "비밀번호 표시" });
    expect(el.type).toBe("password");
    expect(btn.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(btn);
    expect(el.type).toBe("text");
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    expect(el.value).toBe("abc");
  });
});
