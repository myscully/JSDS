import { describe, it, expect, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Dropdown, DropdownTrigger, Menu, MenuItem, Combobox } from "../src";

const tick = () => act(() => new Promise<void>((r) => setTimeout(r, 5)));
const Demo = ({ onSelect = () => {}, selected = false }: { onSelect?: () => void; selected?: boolean }) => (
  <Dropdown kind="menu">
    <DropdownTrigger>열기</DropdownTrigger>
    <Menu>
      <MenuItem onSelect={onSelect} selected={selected}>편집</MenuItem>
      <MenuItem href="/logs" target="_blank">감사 로그</MenuItem>
      <MenuItem disabled href="/x">권한 없음</MenuItem>
    </Menu>
  </Dropdown>
);

describe("Dropdown", () => {
  it("항목을 고르면 닫고 트리거로 포커스가 돌아온다", async () => {
    const onSelect = vi.fn();
    render(<Demo onSelect={onSelect} />);
    fireEvent.click(screen.getByText("열기"));
    await tick();
    expect(document.activeElement!.textContent).toBe("편집");
    fireEvent.click(screen.getByText("편집"));
    await tick();
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(document.querySelector(".dropdown.open")).toBeNull();
    expect(document.activeElement!.textContent).toBe("열기");
  });

  it("href 는 진짜 링크 — li[role=none] > a[role=menuitem], 포커스 대상이고 비활성은 주소가 없다", async () => {
    render(<Demo />);
    fireEvent.click(screen.getByText("열기"));
    await tick();
    const a = screen.getByText("감사 로그") as HTMLAnchorElement;
    expect(a.tagName).toBe("A");
    expect(a.getAttribute("role")).toBe("menuitem");
    expect(a.getAttribute("href")).toBe("/logs");
    expect(a.target).toBe("_blank");
    expect(a.parentElement!.getAttribute("role")).toBe("none");
    expect(a.classList.contains("menu-item")).toBe(true);
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(a);
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement!.textContent).toBe("편집");
    const off = screen.getByText("권한 없음");
    expect(off.getAttribute("href")).toBeNull();
    expect(off.getAttribute("aria-disabled")).toBe("true");
  });

  it("동작 메뉴의 selected 는 경고하고 .on 을 그리지 않는다", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Demo selected />);
    fireEvent.click(screen.getByText("열기"));
    await tick();
    expect(document.querySelector(".menu-item.on")).toBeNull();
    expect(warn.mock.calls.some((c) => String(c[0]).includes("selected"))).toBe(true);
    warn.mockRestore();
  });

  const Scroll = () => (
    <div style={{ overflowX: "auto" }}><button id="before">앞</button><Demo /></div>
  );

  it("스크롤 영역 안에서는 화면 기준으로 띄우고, 스크롤하면 닫아 트리거로 돌아온다 — 메뉴 안 스크롤은 그대로", async () => {
    const { container } = render(<Scroll />);
    fireEvent.click(screen.getByText("열기"));
    await tick();
    const dd = container.querySelector<HTMLElement>(".dropdown")!;
    expect(dd.className).toContain("float");
    expect(dd.style.getPropertyValue("--float-x")).toMatch(/px$/);
    fireEvent.scroll(dd.querySelector(".menu")!);
    await tick();
    expect(dd.className).toContain("open");
    fireEvent.scroll(window);
    await tick();
    expect(dd.className).not.toContain("open");
    expect(dd.className).not.toContain("float");
    expect(document.activeElement!.textContent).toBe("열기");
  });

  it("창 크기가 바뀌면 띄운 메뉴를 닫는다", async () => {
    const { container } = render(<Scroll />);
    fireEvent.click(screen.getByText("열기"));
    await tick();
    fireEvent(window, new Event("resize"));
    await tick();
    expect(container.querySelector(".dropdown")!.className).not.toContain("open");
  });

  it("스크롤 영역 밖에서는 띄우지 않는다", async () => {
    const { container } = render(<Demo />);
    fireEvent.click(screen.getByText("열기"));
    await tick();
    expect(container.querySelector(".dropdown")!.className).not.toContain("float");
  });

  it("Combobox 도 스크롤 영역 안에서 띄운다", async () => {
    const { container } = render(<div style={{ overflowX: "auto" }}><Combobox options={[{ value: "a", label: "가" }]} label="값" defaultOpen /></div>);
    await tick();
    const cb = container.querySelector(".combobox")!;
    expect(cb.className).toContain("float");
    fireEvent.scroll(window);
    await tick();
    expect(cb.className).not.toContain("open");
  });
});
