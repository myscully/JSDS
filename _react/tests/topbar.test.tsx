import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { SideNav, SideNavItem, TextField, TopBar, TopBarLogo, TopBarNavToggle, TopBarStart, TopBarThemeToggle } from "../src";

/* 2026-11-18 — 상단 바 왼쪽 영역 · 사이드 내비 접기 · 라이트/다크 · Text Field 칸 안 아이콘(사이트 behave.revise 와 같은 규칙) */
function Shell({ spy }: { spy?: (c: boolean) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <>
      <TopBar><TopBarStart><TopBarLogo href="#" name="콘솔" /><TopBarNavToggle collapsed={collapsed} onCollapsedChange={(c) => { spy?.(c); setCollapsed(c); }} controls="nav1" /></TopBarStart></TopBar>
      <SideNav id="nav1" collapsible collapsed={collapsed}><SideNavItem href="#" icon="shield" active>정책</SideNavItem></SideNav>
    </>
  );
}

describe("Top Navigation — 사이드 내비 접기", () => {
  it("왼쪽 영역 안 접기 버튼이 내비를 가리키고, 누르면 접힘 · 이름 · Tooltip 이 따라간다", () => {
    const spy = vi.fn();
    render(<Shell spy={spy} />);
    const btn = document.querySelector<HTMLButtonElement>(".topbar-start [data-sidenav-toggle]")!;
    expect(btn.getAttribute("aria-controls")).toBe("nav1");
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    expect(btn.getAttribute("aria-label")).toBe("메뉴 접기");
    expect(btn.className).toContain("md");
    fireEvent.click(btn);
    expect(spy).toHaveBeenCalledWith(true);
    expect(document.getElementById("nav1")!.classList.contains("collapsed")).toBe(true);
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(btn.getAttribute("aria-label")).toBe("메뉴 펼치기");
    expect(btn.parentElement!.querySelector(".tooltip")!.textContent).toBe("메뉴 펼치기");
  });
  it("collapsible 내비는 펼친 상태에서도 항목을 이름 + Tooltip 으로 감싼다 — 사이트에서 ds.js 가 접어도 이름이 남게", () => {
    render(<Shell />);
    const a = screen.getByRole("link", { name: "정책" });
    expect(a.getAttribute("aria-label")).toBe("정책");
    expect(a.parentElement!.classList.contains("tooltip-wrap")).toBe(true);
    render(<SideNav><SideNavItem href="#">일반</SideNavItem></SideNav>);
    expect(screen.getByRole("link", { name: "일반" }).hasAttribute("aria-label")).toBe(false);
  });
});

describe("Top Navigation — 라이트/다크", () => {
  it("aria-pressed = 다크, 누르면 반대 테마를 알리고 두 아이콘을 다 그린다(보이는 것은 CSS 가 고름)", () => {
    const on = vi.fn();
    const { rerender } = render(<TopBarThemeToggle theme="light" onThemeChange={on} />);
    const b = screen.getByRole("button", { name: "다크 모드" });
    expect(b.getAttribute("aria-pressed")).toBe("false");
    expect(b.hasAttribute("data-theme-toggle")).toBe(true);
    expect(b.querySelector(".i-dark svg")).not.toBeNull();
    expect(b.querySelector(".i-light svg")).not.toBeNull();
    fireEvent.click(b);
    expect(on.mock.calls[0][0]).toBe("dark");
    rerender(<TopBarThemeToggle theme="dark" onThemeChange={on} />);
    expect(b.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(b);
    expect(on.mock.calls[1][0]).toBe("light");
  });
});

describe("Text Field — 칸 안 아이콘", () => {
  it("icon 은 affix 첫 칸의 aria-hidden 18 아이콘이고 라벨은 그대로다", () => {
    render(<TextField id="tf-i" label="아이디" icon="user" />);
    const input = screen.getByLabelText("아이디");
    const ico = input.parentElement!.firstElementChild!;
    expect(input.parentElement!.classList.contains("affix")).toBe(true);
    expect(ico.className).toBe("field-icon");
    expect(ico.getAttribute("aria-hidden")).toBe("true");
    expect(ico.querySelector("svg")!.getAttribute("width")).toBe("18");
  });
});
