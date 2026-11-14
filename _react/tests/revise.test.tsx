import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Avatar, AvatarGroup, TextField } from "../src";

/* 2026-11-13 수정 묶음(사람의 요청) — 고정폭 글자는 Code 에만 · Avatar Group */
describe("TextField mono 없앰", () => {
  it("mono 를 주면 한 번 경고하고 .mono 클래스를 붙이지 않는다", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const { container } = render(<><TextField label="IP" mono /><TextField label="IP2" mono /></>);
      expect(container.querySelector(".mono")).toBeNull();
      expect(warn.mock.calls.filter((c) => String(c[0]).includes("TextField mono")).length).toBe(1);
    } finally { warn.mockRestore(); }
  });
});

const PEOPLE = ["김민준", "이서연", "박지호", "최유나", "정하준", "강서윤", "조은우", "윤지아"];
const avatars = (n: number) => PEOPLE.slice(0, n).map((p) => <Avatar key={p} initials={p[0]} role="img" aria-label={p} />);

describe("AvatarGroup", () => {
  it("role=group + 이름, 5개 이하면 '외 N명' 이 없다", () => {
    const { container } = render(<AvatarGroup label="담당자">{avatars(3)}</AvatarGroup>);
    const g = screen.getByRole("group", { name: "담당자" });
    expect(g.className).toBe("avatar-group");
    expect(g.querySelectorAll(".avatar")).toHaveLength(3);
    expect(container.querySelector(".avatar-group-more")).toBeNull();
  });
  it("넘치면 앞 5개 + 맨 뒤 '외 N명' 글자, max 는 5 를 넘지 않는다(넘기면 경고)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const { container, rerender } = render(<AvatarGroup label="담당자">{avatars(8)}</AvatarGroup>);
      const g = container.querySelector(".avatar-group")!;
      expect(g.querySelectorAll(".avatar")).toHaveLength(5);
      expect(g.lastElementChild!.tagName).toBe("SPAN");
      expect(g.lastElementChild!.className).toBe("avatar-group-more");
      expect(g.lastElementChild!.textContent).toBe("외 3명");
      rerender(<AvatarGroup label="담당자" max={3}>{avatars(8)}</AvatarGroup>);
      expect(g.querySelectorAll(".avatar")).toHaveLength(3);
      expect(g.lastElementChild!.textContent).toBe("외 5명");
      rerender(<AvatarGroup label="담당자" max={7}>{avatars(8)}</AvatarGroup>);
      expect(g.querySelectorAll(".avatar")).toHaveLength(5);
      expect(warn.mock.calls.some((c) => String(c[0]).includes("AvatarGroup max"))).toBe(true);
    } finally { warn.mockRestore(); }
  });
  it("onMore 를 주면 '외 N명' 이 글자 버튼 — 이름에 보이는 글자가 들고, 누르면 부른다", () => {
    const more = vi.fn();
    render(<AvatarGroup label="담당자" onMore={more}>{avatars(8)}</AvatarGroup>);
    const b = screen.getByRole("button", { name: "담당자 외 3명 보기" });
    expect(b.className).toBe("btn sm text assistive avatar-group-more");
    expect(b.textContent).toBe("외 3명");
    fireEvent.click(b); expect(more).toHaveBeenCalledTimes(1);
  });
  it("size 는 크기를 정하지 않은 자식 Avatar 에 넘긴다", () => {
    const { container } = render(<AvatarGroup label="검토자" size="sm">{avatars(2)}</AvatarGroup>);
    expect([...container.querySelectorAll(".avatar")].map((a) => a.className)).toEqual(["avatar sm", "avatar sm"]);
  });
});
