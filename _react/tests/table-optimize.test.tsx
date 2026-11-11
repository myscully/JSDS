import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ActionBar, Button, DataTable, Table, TableBody, TableCell, TableFoot, TableRow } from "../src";

/* Table · Data Table 최적화(2026-11-11) — 밀도 세 단계 · 행 스타일 · 하위 텍스트 · 합계 행 · 첫 열 고정 */
const body = (
  <TableBody><TableRow><TableCell>a</TableCell></TableRow></TableBody>
);
const cls = (el: Element | null) => el!.className;

describe("Table 밀도 · 행 스타일", () => {
  it("density 는 compact · relaxed 클래스, 기본은 클래스 없음 — 옛 compact · zebra 도 그대로 받는다", () => {
    const { container, rerender } = render(<Table density="relaxed">{body}</Table>);
    expect(cls(container.querySelector("table"))).toBe("tbl relaxed");
    rerender(<Table density="default">{body}</Table>);
    expect(cls(container.querySelector("table"))).toBe("tbl");
    rerender(<Table compact zebra>{body}</Table>);
    expect(cls(container.querySelector("table"))).toBe("tbl compact zebra");
    rerender(<Table compact density="relaxed">{body}</Table>);
    expect(cls(container.querySelector("table"))).toBe("tbl relaxed");
  });
  it("rowStyle 은 zebra · grid · plain 중 하나만, lines 는 클래스 없음", () => {
    const { container, rerender } = render(<Table rowStyle="grid">{body}</Table>);
    expect(cls(container.querySelector("table"))).toBe("tbl grid");
    rerender(<Table rowStyle="plain" zebra>{body}</Table>);
    expect(cls(container.querySelector("table"))).toBe("tbl plain");
    rerender(<Table rowStyle="lines">{body}</Table>);
    expect(cls(container.querySelector("table"))).toBe("tbl");
  });
  it("TableCell sub 는 주 값 뒤에 .cell-sub, TableFoot · total 은 tfoot tr.total", () => {
    const { container } = render(
      <Table>
        <TableBody><TableRow><TableCell sub="a@b.c">김민준</TableCell></TableRow></TableBody>
        <TableFoot><TableRow total><TableCell>합계</TableCell></TableRow></TableFoot>
      </Table>,
    );
    const td = container.querySelector("tbody td")!;
    expect(td.firstChild!.textContent).toBe("김민준");
    expect(td.querySelector(".cell-sub")!.textContent).toBe("a@b.c");
    expect(container.querySelector("tfoot > tr.total > td")!.textContent).toBe("합계");
  });
});

describe("DataTable 첫 열 고정 · 합계 · 하위 텍스트", () => {
  type R = { id: string; n: string; v: number; mail: string };
  const rows: R[] = [{ id: "1", n: "가", v: 2, mail: "a@x" }, { id: "2", n: "나", v: 3, mail: "b@x" }];
  const columns = [{ key: "n", header: "이름", sub: (r: R) => r.mail }, { key: "v", header: "값", num: true }];
  it("stickyColumn 은 .sticky-col + 스크롤 영역(tabIndex 0 · region · 이름)", () => {
    const { container } = render(<DataTable stickyColumn caption="단말 현황" columns={columns} rows={rows} rowKey={(r) => r.id} />);
    const wrap = container.querySelector(".tbl-wrap")!;
    expect(wrap.classList.contains("sticky-col")).toBe(true);
    expect(screen.getByRole("region", { name: "단말 현황" })).toBe(wrap);
    expect((wrap as HTMLElement).tabIndex).toBe(0);
  });
  it("summaryRow 는 열 순서대로 tfoot tr.total — 체크박스 칸은 비우고, 불러오는 중에는 없다", () => {
    const { container, rerender } = render(<DataTable selectable columns={columns} rows={rows} rowKey={(r) => r.id} summaryRow={{ n: "전체 합계", v: 5 }} />);
    const cells = [...container.querySelectorAll("tfoot tr.total td")];
    expect(cells.map((c) => c.textContent)).toEqual(["", "전체 합계", "5"]);
    expect(cells[0].classList.contains("check") && cells[2].classList.contains("num")).toBe(true);
    rerender(<DataTable selectable columns={columns} rows={rows} rowKey={(r) => r.id} summaryRow={{ n: "전체 합계", v: 5 }} status="loading" />);
    expect(container.querySelector("tfoot")).toBeNull();
  });
  it("열 정의 sub 는 칸 안 .cell-sub, density 는 표 클래스로", () => {
    const { container } = render(<DataTable density="relaxed" columns={columns} rows={rows} rowKey={(r) => r.id} />);
    expect([...container.querySelectorAll("tbody .cell-sub")].map((e) => e.textContent)).toEqual(["a@x", "b@x"]);
    expect(container.querySelector("table")!.classList.contains("relaxed")).toBe(true);
  });
});

/* 선택 표의 액션 바는 늘 보인다 — 0개면 안의 Button 이 aria-disabled(포커스는 남음 · 클릭은 부르지 않음), 사람의 결정 2026-11-12 */
describe("ActionBar 늘 보임", () => {
  const rows2 = [{ id: "a", name: "가" }, { id: "b", name: "나" }];
  const cols2 = [{ key: "name" as const, header: "이름" }];
  it("고른 것이 없어도 그리고, 0개면 버튼을 끄고 고르면 켠다", () => {
    const hit = vi.fn();
    render(<DataTable selectable columns={cols2} rows={rows2} rowKey={(r) => r.id}
      actionBar={(sel) => <ActionBar count={sel.size}><Button size="sm" variant="outline" color="assistive" onClick={hit}>내보내기</Button></ActionBar>} />);
    expect(document.querySelector(".action-bar b")!.textContent).toBe("0개 선택");
    const btn = screen.getByRole("button", { name: "내보내기" });
    expect(btn.getAttribute("aria-disabled")).toBe("true");
    expect((btn as HTMLButtonElement).disabled).toBe(false);
    btn.focus(); expect(document.activeElement).toBe(btn);
    fireEvent.click(btn); expect(hit).not.toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText("가 선택"));
    expect(document.querySelector(".action-bar b")!.textContent).toBe("1개 선택");
    expect(btn.hasAttribute("aria-disabled")).toBe(false);
    fireEvent.click(btn); expect(hit).toHaveBeenCalledTimes(1);
  });
  it("제품이 끈 버튼은 그대로 disabled, 바 밖의 Button 은 영향 없음", () => {
    render(<><ActionBar count={0}><Button disabled>삭제</Button></ActionBar><Button>밖</Button></>);
    const del = screen.getByRole("button", { name: "삭제" }) as HTMLButtonElement;
    expect(del.disabled).toBe(true);
    expect(del.hasAttribute("aria-disabled")).toBe(false);
    expect(screen.getByRole("button", { name: "밖" }).hasAttribute("aria-disabled")).toBe(false);
  });
});
