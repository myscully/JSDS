import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { Avatar, AvatarGroup, CardMeta, SideNav, SideNavItem } from "../src";

/* 2026-11-24 — 설정 화면이 쓰는 것: Avatar lg · Avatar Group 은 lg 를 받지 않음 · 사이드 내비 위험 항목 · 두 칸 키-값 */
describe("settings parts", () => {
  it("Avatar size=lg draws .avatar.lg, md has no size class", () => {
    const { container } = render(<><Avatar initials="김" size="lg" /><Avatar initials="이" /></>);
    const [a, b] = container.querySelectorAll(".avatar");
    expect(a.className).toBe("avatar lg");
    expect(b.className).toBe("avatar");
  });
  it("AvatarGroup does not draw lg — warns once in dev and falls back to the group size", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<AvatarGroup label="담당자" size="sm"><Avatar initials="김" size="lg" /><Avatar initials="이" /></AvatarGroup>);
    expect(container.querySelector(".avatar.lg")).toBeNull();
    expect(container.querySelectorAll(".avatar.sm").length).toBe(2);
    expect(warn.mock.calls.some((c) => String(c[0]).includes("lg"))).toBe(true);
    warn.mockRestore();
  });
  it("SideNavItem danger adds .danger and is never the current item by itself", () => {
    const { container } = render(<SideNav aria-label="설정 메뉴"><SideNavItem href="#" active>내 정보</SideNavItem><SideNavItem href="#" danger>계정 삭제</SideNavItem></SideNav>);
    const d = container.querySelector("a.danger")!;
    expect(d.textContent).toBe("계정 삭제");
    expect(d.getAttribute("aria-current")).toBeNull();
    expect(container.querySelector("a.on")!.textContent).toBe("내 정보");
  });
  it("CardMeta columns wraps each pair in a div, wide spans both columns", () => {
    const { container } = render(<CardMeta columns items={[{ label: "이름", value: "김민준" }, { label: "소개", value: "보안 담당", wide: true }]} />);
    const dl = container.querySelector("dl")!;
    expect(dl.className).toBe("card-meta columns");
    const rows = dl.querySelectorAll(":scope > div");
    expect(rows.length).toBe(2);
    expect(rows[1].className).toBe("wide");
    expect(rows[0].querySelector("dt")!.textContent).toBe("이름");
    const plain = render(<CardMeta items={[{ label: "a", value: "b" }]} />).container.querySelector("dl")!;
    expect(plain.className).toBe("card-meta");
    expect(plain.querySelector(":scope > dt")).not.toBeNull();
  });
});
