import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Example from "../examples/patterns/terms-agreement/basic";

/* 약관 동의의 '다음' 은 늘 켜 둔다(Interaction › Disabled, 사람의 결정 2026-11-09) — 사이트 ds.js 와 같은 약속 */
describe("약관 동의 — 다음은 켜 두고 안내", () => {
  const box = (name: string) => screen.getByRole("checkbox", { name }) as HTMLInputElement;
  const msg = (c: HTMLElement) => c.querySelector(".terms > .msg") as HTMLElement;

  it("필수를 비워도 켜져 있고, 누르기 전에는 문구가 없다", () => {
    const { container } = render(<Example />);
    fireEvent.click(box("서비스 이용약관"));
    expect((screen.getByRole("button", { name: "다음" }) as HTMLButtonElement).disabled).toBe(false);
    expect(msg(container).textContent).toBe("");
    expect(msg(container).getAttribute("aria-live")).toBe("polite");
  });

  it("누르면 남은 개수 · 첫 항목 포커스, 고치면 줄이고 지운다", () => {
    const { container } = render(<Example />);
    fireEvent.click(box("서비스 이용약관"));
    fireEvent.click(box("개인정보 수집·이용"));
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(msg(container).textContent).toContain("2개");
    expect(document.activeElement).toBe(box("서비스 이용약관"));
    expect(box("서비스 이용약관").getAttribute("aria-invalid")).toBe("true");
    fireEvent.click(box("서비스 이용약관"));
    expect(msg(container).textContent).toContain("1개");
    expect(box("서비스 이용약관").hasAttribute("aria-invalid")).toBe(false);
    fireEvent.click(box("개인정보 수집·이용"));
    expect(msg(container).textContent).toBe("");
  });
});
