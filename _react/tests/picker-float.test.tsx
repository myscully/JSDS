import { describe, expect, it } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { DatePicker, TimePicker } from "../src";

/* 팝업 · 패널 본문처럼 넘침을 자르는 영역 안의 피커(사람의 요청 2026-11-17 — 달력이 팝업 안에서 잘렸다) — 사이트 behave.patterns 와 같은 규칙.
   jsdom 은 배치가 없어 상자가 0 이다 — 그래서 바깥 스크롤은 '필드가 보이지 않음' 경로(닫힘)를 탄다. 따라가는 자리는 사이트 behave 가 잰다 */
const box = (el: HTMLElement) => el.closest(".datepicker, .timepicker") as HTMLElement;

describe("pickers inside a clipping area", () => {
  it("Date Picker floats its calendar (.float) only inside a scroll area, and an outer scroll that hides the field closes it", () => {
    render(<div style={{ overflowY: "auto" }}><DatePicker label="만료일" /></div>);
    fireEvent.click(screen.getByRole("button", { name: "달력 열기" }));
    const host = box(screen.getByRole("textbox"));
    expect(host.className).toMatch(/\bopen\b/);
    expect(host.className).toMatch(/\bfloat\b/);
    act(() => { host.querySelector(".calendar")!.dispatchEvent(new Event("scroll")); });   // 달력 자신의 스크롤은 그대로
    expect(host.className).toMatch(/\bopen\b/);
    act(() => { window.dispatchEvent(new Event("scroll")); });
    expect(host.className).not.toMatch(/\bopen\b|\bfloat\b/);
  });
  it("outside a scroll area the calendar stays in place (no .float)", () => {
    render(<DatePicker label="만료일" />);
    fireEvent.click(screen.getByRole("button", { name: "달력 열기" }));
    const host = box(screen.getByRole("textbox"));
    expect(host.className).toMatch(/\bopen\b/);
    expect(host.className).not.toMatch(/\bfloat\b/);
  });
  it("Time Picker floats its listboxes the same way, a column scroll keeps them open", () => {
    render(<div style={{ overflowY: "auto" }}><TimePicker label="예약 시각" /></div>);
    fireEvent.click(screen.getByRole("button", { name: "예약 시각 선택" }));
    const host = box(screen.getByRole("textbox"));
    expect(host.className).toMatch(/\bopen\b/);
    expect(host.className).toMatch(/\bfloat\b/);
    act(() => { host.querySelector(".time-col")!.dispatchEvent(new Event("scroll")); });
    expect(host.className).toMatch(/\bopen\b/);
    act(() => { window.dispatchEvent(new Event("scroll")); });
    expect(host.className).not.toMatch(/\bopen\b/);
  });
});
