import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { CodeInput, Form } from "../src";
import TwoStep from "../examples/patterns/sign-in/two-step";

/* Text Field Code(사람의 요청 · 결정 2026-11-17) — 사이트 ds.js 의 .code-inputs 와 같은 약속 */
const cells = () => screen.getAllByRole("textbox").filter((c) => c.classList.contains("code-cell")) as HTMLInputElement[];
const values = () => cells().map((c) => c.value).join("");
const typeIn = (el: HTMLInputElement, ch: string) => fireEvent.change(el, { target: { value: ch }, nativeEvent: { inputType: "insertText", data: ch } });
const field = () => cells()[0].closest(".field")!;

describe("CodeInput", () => {
  it("칸마다 한 자리 — 치면 다음 칸으로 가고 값을 이어 알린다", () => {
    const onChange = vi.fn();
    render(<CodeInput label="인증 코드" onChange={onChange} />);
    expect(cells()).toHaveLength(6);
    expect(cells()[0].getAttribute("autocomplete")).toBe("one-time-code");
    expect(cells()[1].getAttribute("autocomplete")).toBe("off");
    expect(cells()[2].getAttribute("aria-label")).toBe("6자리 중 3번째");
    expect(screen.getByRole("group", { name: "인증 코드" })).toBeTruthy();
    act(() => cells()[0].focus());
    typeIn(cells()[0], "4");
    expect(document.activeElement).toBe(cells()[1]);
    typeIn(cells()[1], "8");
    expect(values()).toBe("48");
    expect(onChange).toHaveBeenLastCalledWith("48", { complete: false });
  });

  it("숫자가 아닌 글자는 받지 않는다", () => {
    render(<CodeInput label="인증 코드" />);
    typeIn(cells()[0], "a");
    expect(values()).toBe("");
  });

  it("붙여넣기 · 자동 채우기는 그 칸부터 나눠 채우고 마지막 칸에 포커스", () => {
    const onChange = vi.fn();
    render(<CodeInput label="인증 코드" onChange={onChange} />);
    fireEvent.paste(cells()[0], { clipboardData: { getData: () => "48 21-93" } });
    expect(values()).toBe("482193");
    expect(onChange).toHaveBeenLastCalledWith("482193", { complete: true });
    expect(document.activeElement).toBe(cells()[5]);
  });

  it("자동 채우기가 첫 칸에 코드 전체를 넣어도 나눠 담는다", () => {
    render(<CodeInput label="인증 코드" />);
    fireEvent.change(cells()[0], { target: { value: "123456" } });
    expect(values()).toBe("123456");
  });

  it("빈 칸에서 Backspace 는 앞 칸을 지우고 그리로 · 화살표 · Home · End 로 옮긴다", () => {
    render(<CodeInput label="인증 코드" defaultValue="482" />);
    act(() => cells()[3].focus());
    fireEvent.keyDown(cells()[3], { key: "Backspace" });
    expect(values()).toBe("48");
    expect(document.activeElement).toBe(cells()[2]);
    fireEvent.keyDown(cells()[2], { key: "Home" });
    expect(document.activeElement).toBe(cells()[0]);
    fireEvent.keyDown(cells()[0], { key: "ArrowRight" });
    expect(document.activeElement).toBe(cells()[1]);
  });

  it("Tab 칸은 하나 — 첫 빈 칸, 다 차면 마지막 칸", () => {
    render(<CodeInput label="인증 코드" defaultValue="48" />);
    const stops = () => cells().map((c, i) => (c.getAttribute("tabindex") === "-1" ? "" : String(i))).join("");
    expect(stops()).toBe("2");
    fireEvent.paste(cells()[2], { clipboardData: { getData: () => "2193" } });
    expect(stops()).toBe("5");
  });

  it("앞에 빈 칸이 있으면 첫 빈 칸으로 보낸다", () => {
    render(<CodeInput label="인증 코드" defaultValue="4" />);
    act(() => cells()[4].focus());
    expect(document.activeElement).toBe(cells()[1]);
  });

  it("폼 안 — 덜 채우고 떠나면 code 문구, 다 채우면 지운다 · 제출하면 비어 있으면 required 와 첫 빈 칸 포커스", () => {
    render(<TwoStep />);
    const help = () => field().querySelector(":scope > .help")!.textContent;
    fireEvent.click(screen.getByRole("button", { name: "인증하고 로그인" }));
    expect(help()).toBe("인증 코드를 입력하세요.");
    expect(document.activeElement).toBe(cells()[0]);
    expect(cells().every((c) => c.getAttribute("aria-invalid") === "true")).toBe(true);
    fireEvent.paste(cells()[0], { clipboardData: { getData: () => "4821" } });
    expect(help()).toBe("숫자 6자리를 모두 입력하세요.");
    fireEvent.click(screen.getByRole("button", { name: "인증하고 로그인" }));
    expect(document.activeElement).toBe(cells()[4]);
    fireEvent.paste(cells()[4], { clipboardData: { getData: () => "93" } });
    expect(help()).toBe("코드는 30초마다 바뀝니다.");
    expect(field().classList.contains("error")).toBe(false);
    expect((field().querySelector("input[type=hidden]") as HTMLInputElement).value).toBe("482193");
  });

  it("덜 채우고 묶음을 떠나면 제출 전에도 code 문구 · 칸 사이를 옮길 때는 조용하다", () => {
    render(<Form validate><CodeInput label="인증 코드" required /><button type="button">다음</button></Form>);
    fireEvent.paste(cells()[0], { clipboardData: { getData: () => "48" } });
    fireEvent.blur(cells()[2], { relatedTarget: cells()[1] });
    expect(field().classList.contains("error")).toBe(false);
    fireEvent.blur(cells()[2], { relatedTarget: screen.getByRole("button", { name: "다음" }) });
    expect(field().querySelector(":scope > .help")!.textContent).toBe("코드가 덜 입력됐습니다. 6자리를 모두 입력하세요.");
  });

  it("건드리지 않고 지나가면 조용하다", () => {
    render(<Form validate><CodeInput label="인증 코드" required /><button type="button">다음</button></Form>);
    fireEvent.blur(cells()[0], { relatedTarget: screen.getByRole("button", { name: "다음" }) });
    expect(field().classList.contains("error")).toBe(false);
  });
});
