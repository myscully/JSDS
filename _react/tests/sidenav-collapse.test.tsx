import { describe, it, expect, afterEach, vi } from "vitest";
import { act, render, screen, fireEvent, cleanup } from "@testing-library/react";
import { SideNav, SideNavItem, TopBarNavToggle, useSideNavCollapse, SIDENAV_NARROW_QUERY } from "../src";

/* 화면 폭 흉내 — matchMedia 의 change 리스너를 직접 부른다 */
function mockMedia(initial: boolean) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>();
  const mq = {
    matches: initial, media: SIDENAV_NARROW_QUERY, onchange: null,
    addEventListener: (_: string, f: (e: MediaQueryListEvent) => void) => listeners.add(f),
    removeEventListener: (_: string, f: (e: MediaQueryListEvent) => void) => listeners.delete(f),
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => true,
  };
  const spy = vi.fn((q: string) => (q === SIDENAV_NARROW_QUERY ? mq : { ...mq, matches: false, addEventListener() {}, removeEventListener() {} }));
  Object.defineProperty(window, "matchMedia", { configurable: true, writable: true, value: spy });
  return {
    listeners,
    cross(narrow: boolean) { mq.matches = narrow; act(() => { listeners.forEach((f) => f({ matches: narrow } as MediaQueryListEvent)); }); },
  };
}

function Shell({ auto }: { auto?: boolean }) {
  const [collapsed, setCollapsed] = useSideNavCollapse(auto === undefined ? undefined : { auto });
  return (
    <>
      <TopBarNavToggle collapsed={collapsed} onCollapsedChange={setCollapsed} controls="n" />
      <SideNav id="n" collapsed={collapsed}><SideNavItem href="#" active>대시보드</SideNavItem></SideNav>
    </>
  );
}
const nav = () => document.getElementById("n")!;
const toggle = () => screen.getByRole("button", { name: /메뉴/ });

afterEach(() => { cleanup(); delete (window as { matchMedia?: unknown }).matchMedia; });

describe("useSideNavCollapse — 화면 폭 1280 경계", () => {
  it("좁은 화면에서 처음부터 접힘, 넓으면 펼침", () => {
    mockMedia(true);
    const { unmount } = render(<Shell />);
    expect(nav()).toHaveClass("collapsed");
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
    unmount();
    mockMedia(false);
    render(<Shell />);
    expect(nav()).not.toHaveClass("collapsed");
  });

  it("경계를 넘을 때만 맞추고, 그 사이 직접 바꾼 값은 남긴다", () => {
    const m = mockMedia(false);
    render(<Shell />);
    m.cross(true);
    expect(nav()).toHaveClass("collapsed");
    fireEvent.click(toggle());   // 좁은 채 펼침
    expect(nav()).not.toHaveClass("collapsed");
    m.cross(false);              // 넓어짐 — 펼침
    expect(nav()).not.toHaveClass("collapsed");
    fireEvent.click(toggle());   // 넓은 채 접음
    expect(nav()).toHaveClass("collapsed");
    m.cross(true);
    expect(nav()).toHaveClass("collapsed");
    m.cross(false);
    expect(nav()).not.toHaveClass("collapsed");
  });

  it("auto:false 는 폭을 보지 않는다", () => {
    const m = mockMedia(true);
    render(<Shell auto={false} />);
    expect(nav()).not.toHaveClass("collapsed");
    expect(m.listeners.size).toBe(0);
    m.cross(false); m.cross(true);
    expect(nav()).not.toHaveClass("collapsed");
  });

  it("언마운트하면 리스너를 푼다", () => {
    const m = mockMedia(false);
    const { unmount } = render(<Shell />);
    expect(m.listeners.size).toBe(1);
    unmount();
    expect(m.listeners.size).toBe(0);
  });

  it("matchMedia 가 없으면 펼침", () => {
    render(<Shell />);
    expect(nav()).not.toHaveClass("collapsed");
  });
});
