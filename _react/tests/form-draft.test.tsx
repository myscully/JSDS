import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { useState } from "react";
import { Form, TextField, Checkbox, useFormDraft } from "../src";

function Draft({ validate = false, exclude }: { validate?: boolean; exclude?: string[] }) {
  const draft = useFormDraft("t-form", { exclude });
  const [name, setName] = useState("");
  return (
    <Form ref={draft.ref} validate={validate} onSubmit={(e) => e.preventDefault()}>
      {draft.notice}
      <TextField id="d-name" label="이름" required value={name} onChange={(e) => setName(e.target.value)} />
      <TextField id="d-desc" label="설명" defaultValue="처음" />
      <TextField id="d-pw" label="비밀번호" type="password" />
      <Checkbox id="d-on" name="on">사용</Checkbox>
      <button type="submit">저장</button>
    </Form>
  );
}
const KEY = "jsds-draft:t-form";
const type = (el: HTMLElement, v: string) => fireEvent.input(el, { target: { value: v } });

describe("useFormDraft", () => {
  beforeEach(() => { localStorage.clear(); vi.useRealTimers(); });

  it("입력하면 0.5초 뒤 남기고 비밀번호는 남기지 않는다", () => {
    vi.useFakeTimers();
    render(<Draft />);
    type(screen.getByLabelText(/이름/), "외부 USB 차단");
    type(screen.getByLabelText("비밀번호"), "secret");
    expect(localStorage.getItem(KEY)).toBeNull();
    act(() => { vi.advanceTimersByTime(499); });
    expect(localStorage.getItem(KEY)).toBeNull();
    act(() => { vi.advanceTimersByTime(1); });
    const d = JSON.parse(localStorage.getItem(KEY)!);
    expect(d.f["d-name"]).toBe("외부 USB 차단");
    expect(d.f["d-desc"]).toBe("처음");
    expect("d-pw" in d.f).toBe(false);
  });

  it("다시 열면 다른 칸만 되살리고 맨 위에 알린다 — 제어형 칸 · 체크박스까지", () => {
    localStorage.setItem(KEY, JSON.stringify({ v: 1, f: { "d-name": "되살린 이름", "d-desc": "처음", on: true } }));
    const { container } = render(<Draft />);
    expect((screen.getByLabelText(/이름/) as HTMLInputElement).value).toBe("되살린 이름");
    expect((screen.getByLabelText("사용") as HTMLInputElement).checked).toBe(true);
    const n = container.querySelector("form > .notice.info.draft-notice")!;
    expect(n).toBeTruthy();
    expect(container.querySelector("form")!.firstElementChild).toBe(n);
    expect(n.getAttribute("role")).toBe("status");
    expect(n.textContent).toContain("저장하지 않은 입력을 되살렸습니다.");
  });

  it("되살릴 것이 없으면 알리지 않고 지운다", () => {
    localStorage.setItem(KEY, JSON.stringify({ v: 1, f: { "d-desc": "처음" } }));
    const { container } = render(<Draft />);
    expect(container.querySelector(".draft-notice")).toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it("버리기 — 처음 값으로 되돌리고 지우고 첫 칸으로 포커스", () => {
    localStorage.setItem(KEY, JSON.stringify({ v: 1, f: { "d-name": "되살린 이름", "d-desc": "바꾼 설명", on: true } }));
    const { container } = render(<Draft />);
    fireEvent.click(screen.getByRole("button", { name: "버리기" }));
    expect((screen.getByLabelText(/이름/) as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText("설명") as HTMLInputElement).value).toBe("처음");
    expect((screen.getByLabelText("사용") as HTMLInputElement).checked).toBe(false);
    expect(container.querySelector(".draft-notice")).toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it("제출이 통과하면 지우고, 검증이 막으면 남긴다", async () => {
    localStorage.setItem(KEY, JSON.stringify({ v: 1, f: { "d-desc": "바꾼 설명" } }));
    const { unmount } = render(<Draft validate />);
    fireEvent.submit(screen.getByRole("button", { name: "저장" }).closest("form")!);   // 이름이 비어 막힘
    await act(async () => { await new Promise((r) => setTimeout(r, 5)); });
    expect(localStorage.getItem(KEY)).not.toBeNull();
    type(screen.getByLabelText(/이름/), "이름");
    fireEvent.submit(screen.getByRole("button", { name: "저장" }).closest("form")!);
    await act(async () => { await new Promise((r) => setTimeout(r, 5)); });
    expect(localStorage.getItem(KEY)).toBeNull();
    unmount();
  });

  it("exclude 로 뺀 칸은 남기지 않는다", () => {
    vi.useFakeTimers();
    render(<Draft exclude={["d-desc"]} />);
    type(screen.getByLabelText(/이름/), "a");
    act(() => { vi.advanceTimersByTime(500); });
    expect("d-desc" in JSON.parse(localStorage.getItem(KEY)!).f).toBe(false);
  });
});
