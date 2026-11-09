import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SearchBar } from "../src";

/* Search(사람의 결정 2026-11-09) — 사이트 ds.js 의 ds:search · data-hotkey 와 같은 약속 */
const box = () => screen.getByRole("searchbox") as HTMLInputElement;
const type = (v: string) => fireEvent.change(box(), { target: { value: v } });

describe("SearchBar", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("debounce — 입력이 멈춘 뒤 한 번, 마지막 값으로", () => {
    const onSearch = vi.fn();
    render(<SearchBar debounce onSearch={onSearch} />);
    type("a");
    vi.advanceTimersByTime(200);
    type("ab");
    vi.advanceTimersByTime(299);
    expect(onSearch).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onSearch.mock.calls).toEqual([["ab", "input"]]);
  });

  it("debounce 없이는 입력으로 onSearch 를 내지 않는다", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    type("a");
    vi.advanceTimersByTime(1000);
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("Enter 는 바로 내고 기다리던 것을 취소한다", () => {
    const onSearch = vi.fn();
    const onSubmit = vi.fn();
    render(<SearchBar debounce onSearch={onSearch} onSubmit={onSubmit} />);
    type("a");
    fireEvent.keyDown(box(), { key: "Enter" });
    vi.advanceTimersByTime(1000);
    expect(onSearch.mock.calls).toEqual([["a", "enter"]]);
    expect(onSubmit).toHaveBeenCalledWith("a");
  });

  it("한글 조합을 끝내는 Enter 는 조회가 아니다", () => {
    const onSubmit = vi.fn();
    render(<SearchBar defaultValue="랜" onSubmit={onSubmit} />);
    fireEvent.keyDown(box(), { key: "Enter", isComposing: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("Esc — 값이 있으면 지우고 부모로 가지 않으며, 비면 그대로 지나간다", () => {
    const onSearch = vi.fn();
    const parent = vi.fn();
    render(
      <div onKeyDown={(e) => parent(e.key)}>
        <SearchBar defaultValue="랜섬" onSearch={onSearch} />
      </div>,
    );
    fireEvent.keyDown(box(), { key: "Escape" });
    expect(box().value).toBe("");
    expect(onSearch.mock.calls).toEqual([["", "clear"]]);
    expect(parent).not.toHaveBeenCalled();
    fireEvent.keyDown(box(), { key: "Escape" });
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(parent).toHaveBeenCalledTimes(1);
  });

  it("지우기 버튼 — 바로 내고 포커스는 입력으로", () => {
    const onSearch = vi.fn();
    render(<SearchBar debounce clearable defaultValue="x" onSearch={onSearch} />);
    fireEvent.click(screen.getByRole("button"));
    vi.advanceTimersByTime(1000);
    expect(onSearch.mock.calls).toEqual([["", "clear"]]);
    expect(document.activeElement).toBe(box());
  });

  it("hotkey — 입력 중 · 조합키 · 모달이면 무시한다", () => {
    render(
      <>
        <SearchBar hotkey shortcut="/" />
        <select aria-label="다른 컨트롤" />
      </>,
    );
    const press = (init = {}) => fireEvent.keyDown(document.body, { key: "/", ...init });
    press({ ctrlKey: true });
    expect(document.activeElement).toBe(document.body);
    const sel = screen.getByLabelText("다른 컨트롤") as HTMLSelectElement;
    sel.focus();
    press();
    expect(document.activeElement).toBe(sel);
    sel.blur();
    const modal = document.createElement("div");
    modal.setAttribute("aria-modal", "true");
    modal.getClientRects = () => [{}] as unknown as DOMRectList;
    document.body.append(modal);
    press();
    expect(document.activeElement).toBe(document.body);
    modal.remove();
    press();
    expect(document.activeElement).toBe(box());
  });

  it("kbd 는 값이 있으면 숨고, status 는 숨긴 role=status", () => {
    const { container } = render(<SearchBar shortcut="/" status="128건" />);
    expect(container.querySelector("kbd")).not.toBeNull();
    type("a");
    expect(container.querySelector("kbd")).toBeNull();
    expect(screen.getByRole("status").className).toBe("sr-only");
    expect(screen.getByRole("status").textContent).toBe("128건");
  });
});
