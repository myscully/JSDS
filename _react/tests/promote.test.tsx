import { describe, expect, it, vi } from "vitest";
import { forwardRef, type AnchorHTMLAttributes } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Avatar, Empty, ErrorSummary, Form, FormActions, Link, PageHead, TextField } from "../src";

describe("Link", () => {
  it("기본은 a.link 이고 standalone 클래스가 없다", () => {
    render(<Link href="/a">배포 상태</Link>);
    const a = screen.getByRole("link", { name: "배포 상태" });
    expect(a.className).toBe("link");
    expect(a.getAttribute("href")).toBe("/a");
    expect(a.hasAttribute("target")).toBe(false);
  });
  it("standalone 은 클래스를 더한다", () => {
    render(<Link href="/a" standalone>탐지</Link>);
    expect(screen.getByRole("link").className).toBe("link standalone");
  });
  it("external 은 새 창 · rel · 아이콘 · 숨긴 문구", () => {
    const { container } = render(<Link href="/a" external>문서</Link>);
    const a = screen.getByRole("link", { name: /문서/ });
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toBe("noopener noreferrer");
    expect(container.querySelector("a > svg")).not.toBeNull();
    expect(container.querySelector("a > .sr-only")?.textContent).toBe(" (새 창)");
  });
  it("externalLabel · rel 을 바꿀 수 있다", () => {
    const { container } = render(<Link href="/a" external externalLabel="new window" rel="noopener">docs</Link>);
    expect(container.querySelector(".sr-only")?.textContent).toBe(" (new window)");
    expect(container.querySelector("a")?.getAttribute("rel")).toBe("noopener");
  });
  it("external 이 아니면 아이콘 · 문구가 없고 target 을 그대로 넘긴다", () => {
    const { container } = render(<Link href="/a" target="_self">문서</Link>);
    expect(container.querySelector("svg")).toBeNull();
    expect(container.querySelector(".sr-only")).toBeNull();
    expect(container.querySelector("a")?.getAttribute("target")).toBe("_self");
  });
  it("as 로 라우터 링크를 쓰면 href 없어도 경고하지 않는다", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const Router = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(function Router(p, r) { return <a ref={r} data-router="" {...p} />; });
    const { container } = render(<Link as={Router}>문서</Link>);
    expect(container.querySelector("a[data-router].link")).not.toBeNull();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
  it("href 가 없으면 경고한다", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Link>문서</Link>);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toMatch(/Button/);
    warn.mockRestore();
  });
});

describe("PageHead", () => {
  it("제목은 기본 h1", () => {
    render(<PageHead title="정책" />);
    expect(screen.getByRole("heading", { level: 1, name: "정책" }).className).toBe("title");
  });
  it("as 로 태그를 바꾼다", () => {
    render(<PageHead title="정책" as="h2" />);
    expect(screen.getByRole("heading", { level: 2, name: "정책" })).toBeTruthy();
  });
  it("breadcrumb 는 첫 칸", () => {
    const { container } = render(<PageHead title="정책" breadcrumb={<nav aria-label="현재 위치" />} actions={<button type="button">저장</button>} />);
    const h = container.querySelector(".page-head")!;
    expect(h.firstElementChild?.tagName).toBe("NAV");
    expect(h.lastElementChild?.className).toBe("actions");
  });
  it("breadcrumb · sub · actions 가 없으면 그리지 않는다", () => {
    const { container } = render(<PageHead title="정책" />);
    expect(container.querySelector("nav")).toBeNull();
    expect(container.querySelector(".sub")).toBeNull();
    expect(container.querySelector(".actions")).toBeNull();
  });
});

describe("ErrorSummary — 없어짐(사람의 결정 2026-11-16)", () => {
  it("한 번 경고하고 위험 Notice 로 그린다 — 요약 클래스 · 표식 없음", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container, rerender } = render(<ErrorSummary items={["이름", "IP", "기간"]} />);
    rerender(<ErrorSummary items={["이름", "IP"]} title="저장하지 못했습니다" />);
    expect(warn).toHaveBeenCalledTimes(1);
    const s = screen.getByRole("alert");
    expect(s.className).toContain("danger");
    expect(s.className).not.toContain("form-summary");
    expect(s.hasAttribute("data-form-summary")).toBe(false);
    expect(container.querySelector("b")?.textContent).toBe("저장하지 못했습니다");
    warn.mockRestore();
  });
  it("Form validate 는 오류가 3개여도 폼 위에 요약을 그리지 않는다", () => {
    const { container } = render(
      <Form validate>
        <TextField id="a" label="가" required />
        <TextField id="b" label="나" required />
        <TextField id="c" label="다" required />
        <FormActions><button type="submit">저장</button></FormActions>
      </Form>,
    );
    fireEvent.submit(container.querySelector("form")!);
    expect(container.querySelectorAll(".field.error")).toHaveLength(3);
    expect(container.querySelector("form > .notice, [data-form-summary], .form-summary")).toBeNull();
  });
});

describe("Empty · Avatar", () => {
  it("compact 는 인라인 스타일 없이 그린다", () => {
    const { container } = render(<Empty compact title="없음">설명</Empty>);
    expect(container.querySelector(".empty.compact b")?.getAttribute("style")).toBeNull();
    expect(container.querySelector(".empty.compact > div > span")?.getAttribute("style")).toBeNull();
  });
  it("Avatar 는 이니셜 · sm", () => {
    const { container } = render(<><Avatar initials="JH" /><Avatar initials="J" size="sm" /></>);
    const [a, b] = [...container.querySelectorAll(".avatar")];
    expect(a.textContent).toBe("JH");
    expect(a.className).toBe("avatar");
    expect(b.className).toBe("avatar sm");
  });
});
