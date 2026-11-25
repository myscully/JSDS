/* Combobox '전체' 옵션(2026-11-25 — 사람의 결정 '항목마다 칩'). 사이트 ds.js 의 li.menu-item[data-all] 과 같은 동작 */
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { Combobox } from "../src";

const OPTS = [
  { value: "sales", label: "영업팀" },
  { value: "dev", label: "개발팀" },
  { value: "infra", label: "인프라팀" },
  { value: "ext", label: "외주팀", disabled: true },
];
const box = (c: HTMLElement) => c.querySelector<HTMLInputElement>("input[role=combobox]")!;
const all = (c: HTMLElement) => c.querySelector<HTMLElement>(".menu-item[data-all]");
const chips = (c: HTMLElement) => Array.from(c.querySelectorAll(".chip .lbl")).map((x) => x.textContent);

describe("Combobox allLabel", () => {
  it("맨 위 '전체' 를 고르면 끄지 않은 모든 옵션 · 항목마다 칩, 값에는 들지 않는다", () => {
    const onChange = vi.fn();
    const { container } = render(<Combobox multiple allLabel="전체" options={OPTS} label="부서" name="dept" onChange={onChange} />);
    const a = all(container)!;
    expect(container.querySelector(".menu > li")).toBe(a);
    expect(a.getAttribute("role")).toBe("option");
    expect(a.getAttribute("aria-selected")).toBe("false");
    expect(a.querySelector(".menu-mark.check")).not.toBeNull();
    fireEvent.click(a);
    expect(onChange).toHaveBeenLastCalledWith(["sales", "dev", "infra"]);
    expect(chips(container)).toEqual(["영업팀", "개발팀", "인프라팀"]);
    expect(all(container)!.getAttribute("aria-selected")).toBe("true");
    expect(all(container)!.classList.contains("on")).toBe(true);
    expect(Array.from(container.querySelectorAll<HTMLInputElement>("input[type=hidden]")).map((x) => x.value)).toEqual(["sales", "dev", "infra"]);
    expect(container.querySelector("[role=status]")!.textContent).toBe("전체 선택됨, 3개");
  });

  it("칩을 지우면 '전체' 체크가 꺼지고, 다시 모두 고르면 켜진다 · 모두 골라진 채 '전체' 를 고르면 모두 푼다", () => {
    const onChange = vi.fn();
    const { container } = render(<Combobox multiple allLabel="전체" options={OPTS} label="부서" defaultValue={["sales", "dev", "infra"]} onChange={onChange} />);
    expect(all(container)!.getAttribute("aria-selected")).toBe("true");
    fireEvent.click(container.querySelector(".chip .x")!);
    expect(all(container)!.getAttribute("aria-selected")).toBe("false");
    fireEvent.click(container.querySelector('.menu-item[data-value="sales"]')!);
    expect(all(container)!.getAttribute("aria-selected")).toBe("true");
    fireEvent.click(all(container)!);
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(chips(container)).toEqual([]);
  });

  it("검색어를 치는 동안 숨고, ↓ 의 첫 후보이며 Enter 로 고른다", () => {
    const onChange = vi.fn();
    const { container } = render(<Combobox multiple allLabel="전체" options={OPTS} label="부서" onChange={onChange} />);
    const i = box(container);
    fireEvent.change(i, { target: { value: "개" } });
    expect(all(container)).toBeNull();
    fireEvent.change(i, { target: { value: "" } });
    expect(all(container)).not.toBeNull();
    fireEvent.keyDown(i, { key: "Escape" });
    fireEvent.keyDown(i, { key: "ArrowDown" });   // 연다
    fireEvent.keyDown(i, { key: "ArrowDown" });
    expect(i.getAttribute("aria-activedescendant")).toBe(all(container)!.id);
    fireEvent.keyDown(i, { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith(["sales", "dev", "infra"]);
  });

  it("하나 고르기에는 그리지 않고 개발 모드에서 한 번 경고", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<Combobox allLabel="전체" options={OPTS} label="부서" defaultOpen />);
    expect(all(container)).toBeNull();
    expect(warn.mock.calls.some((c) => String(c[0]).includes("allLabel"))).toBe(true);
    warn.mockRestore();
  });
});
