/* 끈 컨트롤의 클릭(2026-11-12) — CSS 의 pointer-events:none 을 지운 뒤 클릭이 그 요소에 온다.
   끈 메뉴 항목은 제품 onClick 도 부모도, 끈 입력값 칩은 부모도 받지 않는다. Banner 안 버튼은 끄지 않는다(사람의 결정 — 개발 모드 경고 한 번) */
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Banner, Button, Chip, Dropdown, DropdownTrigger, Menu, MenuItem, Table, TableBody, TableRow, TableCell } from "../src";

describe("끈 컨트롤의 클릭", () => {
  it("끈 메뉴 항목은 제품 onClick · onSelect · 부모 어느 것도 부르지 않는다", () => {
    const onClick = vi.fn(), onSelect = vi.fn(), parent = vi.fn();
    render(
      <div onClick={parent}>
        <Dropdown kind="menu" defaultOpen>
          <DropdownTrigger>열기</DropdownTrigger>
          <Menu>
            <MenuItem disabled onClick={onClick} onSelect={onSelect}>권한 없음</MenuItem>
            <MenuItem>편집</MenuItem>
          </Menu>
        </Dropdown>
      </div>,
    );
    fireEvent.click(screen.getByText("권한 없음"));
    expect(onClick).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
    expect(parent).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("편집"));
    expect(parent).toHaveBeenCalledTimes(1);   // 켜진 항목은 그대로 지나간다
  });

  it("끈 입력값 칩(span)의 클릭은 부모(행 · 카드)로 가지 않고, 켜진 칩은 간다", () => {
    const parent = vi.fn();
    const { rerender } = render(<div onClick={parent}><Chip disabled onRemove={() => {}}>값</Chip></div>);
    fireEvent.click(screen.getByText("값"));
    expect(parent).not.toHaveBeenCalled();
    rerender(<div onClick={parent}><Chip onRemove={() => {}}>값</Chip></div>);
    fireEvent.click(screen.getByText("값"));
    expect(parent).toHaveBeenCalledTimes(1);
  });

  it("Banner 안의 끈 버튼은 한 번 경고하고, loading 은 조용하다", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { rerender } = render(<Banner action={<Button size="sm" variant="outline" color="assistive" loading>저장</Button>}>공지</Banner>);
    expect(warn.mock.calls.filter((c) => String(c[0]).includes("Banner 안 버튼")).length).toBe(0);
    rerender(<Banner action={<Button size="sm" variant="outline" color="assistive" disabled>저장</Button>}>공지</Banner>);
    rerender(<Banner action={<Button size="sm" variant="outline" color="assistive" disabled>저장 2</Button>}>공지</Banner>);
    expect(warn.mock.calls.filter((c) => String(c[0]).includes("Banner 안 버튼")).length).toBe(1);
    warn.mockRestore();
  });
  it("끈 표 행은 inert 가 아니라 aria-disabled — 안 링크는 Tab 에서 빠지고, 클릭은 링크 · 부모로 가지 않으며, 켜면 되돌린다", () => {
    const parent = vi.fn(), onLink = vi.fn();
    const rowOf = (disabled: boolean) => (
      <div onClick={parent}><Table><TableBody><TableRow disabled={disabled}><TableCell><a href="#x" className="link" onClick={onLink}>이벤트</a></TableCell><TableCell><button type="button" tabIndex={0}>상세</button></TableCell></TableRow></TableBody></Table></div>
    );
    const { rerender } = render(rowOf(true));
    const tr = document.querySelector("tr")!, link = screen.getByText("이벤트"), btn = screen.getByText("상세");
    expect(tr.hasAttribute("inert")).toBe(false);
    expect(tr.getAttribute("aria-disabled")).toBe("true");
    expect([link.tabIndex, btn.tabIndex]).toEqual([-1, -1]);
    expect([link.getAttribute("aria-disabled"), btn.getAttribute("aria-disabled")]).toEqual(["true", "true"]);
    fireEvent.click(link);
    expect(onLink).not.toHaveBeenCalled();
    expect(parent).not.toHaveBeenCalled();
    rerender(rowOf(false));
    expect(tr.hasAttribute("aria-disabled")).toBe(false);
    expect(link.hasAttribute("tabindex")).toBe(false);
    expect(btn.getAttribute("tabindex")).toBe("0");   // 원래 값으로
    expect(link.hasAttribute("aria-disabled")).toBe(false);
    fireEvent.click(link);
    expect(onLink).toHaveBeenCalledTimes(1);
    expect(parent).toHaveBeenCalledTimes(1);
  });
});
