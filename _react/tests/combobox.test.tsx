import { describe, it, expect, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Combobox, Field, Form, Popup } from "../src";

const OPTS = [
  { value: "sales", label: "영업팀" },
  { value: "dev", label: "개발팀" },
  { value: "infra", label: "인프라팀" },
  { value: "hr", label: "인사팀" },
  { value: "ext", label: "외주팀", disabled: true },
];
const tick = (ms = 5) => act(() => new Promise<void>((r) => setTimeout(r, ms)));
const box = (c: HTMLElement) => c.querySelector<HTMLInputElement>("input[role=combobox]")!;
const shown = (c: HTMLElement) => Array.from(c.querySelectorAll<HTMLElement>(".menu-item:not([hidden])")).map((x) => x.textContent);
const live = (c: HTMLElement) => c.querySelector("[role=status]")!.textContent;

describe("Combobox", () => {
  it("입력하면 좁히고 첫 후보가 activedescendant, 결과 수를 알린다", () => {
    const { container } = render(<Combobox options={OPTS} label="부서" />);
    const i = box(container);
    fireEvent.change(i, { target: { value: "인" } });
    expect(shown(container)).toEqual(["인프라팀", "인사팀"]);
    expect(i.getAttribute("aria-expanded")).toBe("true");
    expect(container.querySelector(".menu-item.active")!.textContent).toBe("인프라팀");
    expect(i.getAttribute("aria-activedescendant")).toBe(container.querySelector(".menu-item.active")!.id);
    expect(live(container)).toBe("결과 2개");
  });

  it("결과가 없으면 안내 줄", () => {
    const { container } = render(<Combobox options={OPTS} label="부서" />);
    fireEvent.change(box(container), { target: { value: "없는" } });
    expect(container.querySelector(".menu-state")!.textContent).toBe("일치하는 항목이 없습니다. 다른 검색어를 입력하세요.");
  });

  it("↑↓ 는 순환하며 비활성을 건너뛰고 Enter 로 고른다 — 폼을 제출하지 않는다", () => {
    const onChange = vi.fn();
    const { container } = render(<Combobox options={OPTS} label="부서" onChange={onChange} />);
    const i = box(container);
    fireEvent.keyDown(i, { key: "ArrowDown" });
    fireEvent.keyDown(i, { key: "ArrowUp" });
    expect(container.querySelector(".menu-item.active")!.textContent).toBe("인사팀");
    fireEvent.keyDown(i, { key: "ArrowDown" });
    expect(container.querySelector(".menu-item.active")!.textContent).toBe("영업팀");
    expect(fireEvent.keyDown(i, { key: "Enter" })).toBe(false);
    expect(onChange).toHaveBeenCalledWith("sales");
    expect(i.value).toBe("영업팀");
    expect(i.getAttribute("aria-expanded")).toBe("false");
  });

  it("비활성 항목만 맞으면 후보가 없고 '없음' 안내도 없다", () => {
    const onChange = vi.fn();
    const { container } = render(<Combobox options={OPTS} label="부서" onChange={onChange} />);
    const i = box(container);
    fireEvent.change(i, { target: { value: "외주" } });
    expect(shown(container)).toEqual(["외주팀"]);
    expect(container.querySelector(".menu-item.active")).toBeNull();
    expect(container.querySelector(".menu-state")).toBeNull();
    expect(live(container)).toBe("결과 1개");
    fireEvent.keyDown(i, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("한글 조합 중의 Enter 는 고르지 않는다", () => {
    const onChange = vi.fn();
    const { container } = render(<Combobox options={OPTS} label="부서" onChange={onChange} />);
    const i = box(container);
    fireEvent.change(i, { target: { value: "인" } });
    fireEvent.keyDown(i, { key: "Enter", isComposing: true });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("Popup 안에서 Esc 는 목록만 닫는다", async () => {
    const onClose = vi.fn();
    render(<Popup open onClose={onClose} title="제목"><Combobox options={OPTS} label="부서" defaultOpen /></Popup>);
    await tick();
    fireEvent.keyDown(document, { key: "Escape" });
    await tick();
    expect(onClose).not.toHaveBeenCalled();
    expect(document.querySelector(".combobox.open")).toBeNull();
  });

  it("떠나면 고르지 않은 글자는 되돌리고, 글자를 비우면 해제한다", () => {
    const onChange = vi.fn();
    const { container } = render(<Combobox options={OPTS} label="부서" defaultValue="dev" onChange={onChange} />);
    const i = box(container);
    fireEvent.change(i, { target: { value: "아무" } });
    fireEvent.blur(i);
    expect(i.value).toBe("개발팀");
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.change(i, { target: { value: "" } });
    fireEvent.blur(i);
    expect(onChange).toHaveBeenCalledWith(null);
    expect(i.value).toBe("");
  });

  it("여러 개 — 태그 · 옵션 순서 · 열린 채 · 검색어 비움 · ×/Backspace · 숨은 값", () => {
    const onChange = vi.fn();
    const { container } = render(<Combobox multiple name="d" options={OPTS} label="부서" defaultValue={["infra"]} onChange={onChange} />);
    const i = box(container);
    fireEvent.change(i, { target: { value: "영" } });
    fireEvent.click(screen.getByText("영업팀"));
    expect(onChange).toHaveBeenLastCalledWith(["sales", "infra"]);
    expect(i.value).toBe("");
    expect(i.getAttribute("aria-expanded")).toBe("true");
    expect(live(container)).toBe("영업팀 선택됨");
    expect(Array.from(container.querySelectorAll<HTMLInputElement>("input[type=hidden]")).map((x) => x.value)).toEqual(["sales", "infra"]);
    fireEvent.click(container.querySelector(".chip .x")!);
    expect(onChange).toHaveBeenLastCalledWith(["infra"]);
    fireEvent.keyDown(i, { key: "Backspace" });
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(container.querySelector(".chip")).toBeNull();
    expect(live(container)).toBe("인프라팀 선택 해제됨");
  });

  it("서버 검색 — filter=false 는 좁히지 않고 300ms 뒤 onQueryChange", async () => {
    const onQuery = vi.fn();
    const { container } = render(<Combobox options={OPTS} label="부서" filter={false} onQueryChange={onQuery} />);
    fireEvent.change(box(container), { target: { value: "영" } });
    expect(shown(container).length).toBe(5);
    expect(onQuery).not.toHaveBeenCalled();
    await tick(330);
    expect(onQuery).toHaveBeenCalledWith("영");
  });

  it("검증 — 건드리지 않으면 조용하고, 빈 채 떠나면 알리고, 고르면 지운다", async () => {
    const { container } = render(<Form validate><Field label="부서" htmlFor="x" required><Combobox id="x" required options={OPTS} label="부서" /></Field></Form>);
    const i = box(container), field = container.querySelector(".field")!;
    fireEvent.blur(i);
    await tick();
    expect(field.className).not.toContain("error");
    fireEvent.click(i);
    fireEvent.blur(i);
    await tick();
    expect(field.querySelector(".help")!.textContent).toBe("고른 항목이 없습니다. 항목을 선택하세요.");
    expect(i.getAttribute("aria-invalid")).toBe("true");
    fireEvent.click(i);
    fireEvent.click(screen.getByText("개발팀"));
    await tick();
    expect(field.className).not.toContain("error");
  });

  it("비활성은 열리지 않고 태그를 지우지 못한다", () => {
    const onChange = vi.fn();
    const { container } = render(<Combobox disabled multiple options={OPTS} label="부서" defaultValue={["dev"]} onChange={onChange} />);
    fireEvent.click(container.querySelector(".control")!);
    expect(box(container).getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(container.querySelector(".chip .x")!);
    expect(onChange).not.toHaveBeenCalled();
  });
});
