/* Data Table 행 펼침(2026-11-11) — 사이트 behave.expand.js 와 같은 규칙을 React 에서도 잰다.
   맨 앞 셰브론 버튼 · 여러 행 함께 · 정렬은 펼침을 남기고 페이지 · 범위가 바뀌면 접음 · 자유 자리 */
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable, type DataTableColumn, type DataTableProps } from "../src";

type Row = { id: string; name: string; n: number };
const ROWS: Row[] = [{ id: "a", name: "가", n: 3 }, { id: "b", name: "나", n: 1 }, { id: "c", name: "다", n: 2 }];
const COLS: DataTableColumn<Row>[] = [{ key: "name", header: "이름" }, { key: "n", header: "수", num: true, sortable: true }];
const T = (p: Partial<DataTableProps<Row>>) => <DataTable columns={COLS} rows={ROWS} rowKey={(r) => r.id} renderExpanded={(r) => <p>{r.name} 상세 내용</p>} {...p} />;
const btn = (name: string) => screen.getByRole("button", { name: `${name} 상세` });
const detailOf = (b: HTMLElement) => document.getElementById(b.getAttribute("aria-controls")!)!;
/* 행 순서 — [이름, 펼침, 상세가 바로 아래, 상세 hidden] */
const order = () => [...document.querySelectorAll("tbody > tr:not(.row-detail)")].map((tr) => {
  const b = tr.querySelector<HTMLElement>(".expand-btn")!, d = detailOf(b);
  return [tr.children[1].textContent, b.getAttribute("aria-expanded"), tr.nextElementSibling === d, d.hidden];
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("DataTable 행 펼침", () => {
  it("구조 — 맨 앞 th.expand(숨긴 이름) · td.expand > button.expand-btn · 바로 뒤 tr.row-detail > td[colSpan] > .row-detail-body", () => {
    render(T({ selectable: true, actions: () => <button>더 보기</button> }));
    const th = document.querySelector("thead th")!;
    expect(th.className).toBe("expand"); expect(th.textContent).toBe("상세");
    const b = btn("가");
    expect(b.closest("td")!.className).toBe("expand"); expect(b.closest("tr")!.firstElementChild).toBe(b.closest("td"));
    expect(b.getAttribute("type")).toBe("button"); expect(b.className).toBe("expand-btn"); expect(b.querySelector("svg")).not.toBeNull();
    const d = detailOf(b);
    expect(d.tagName).toBe("TR"); expect(d.className).toBe("row-detail"); expect(d.hidden).toBe(true);
    expect((d.firstElementChild as HTMLTableCellElement).colSpan).toBe(document.querySelectorAll("thead th").length);
    expect(document.querySelectorAll("thead th").length).toBe(5);
    expect(d.querySelector(":scope > td > .row-detail-body")!.textContent).toBe("가 상세 내용");
  });
  it("눌러서 펼치고 접는다 · 여러 행을 함께 · onExpandedChange 는 바꾼 행을 알린다", () => {
    const on = vi.fn();
    render(T({ onExpandedChange: on }));
    fireEvent.click(btn("가")); fireEvent.click(btn("다"));
    expect(order().map((x) => x[1])).toEqual(["true", "false", "true"]);
    expect(order().map((x) => x[3])).toEqual([false, true, false]);
    expect(on).toHaveBeenLastCalledWith(new Set(["a", "c"]), { key: "c", expanded: true });
    fireEvent.click(btn("가"));
    expect(on).toHaveBeenLastCalledWith(new Set(["c"]), { key: "a", expanded: false });
  });
  it("키보드 — Enter · Space 로 바뀌고 포커스는 버튼에 남는다, 펼친 상세로 Tab 이 들어간다", async () => {
    render(T({ renderExpanded: (r) => <button>{r.name} 원본 복사</button> }));
    btn("가").focus();
    await userEvent.keyboard("{Enter}");
    expect(btn("가").getAttribute("aria-expanded")).toBe("true"); expect(document.activeElement).toBe(btn("가"));
    await userEvent.tab();
    expect(document.activeElement!.textContent).toBe("가 원본 복사");
    btn("가").focus(); await userEvent.keyboard(" ");
    expect(btn("가").getAttribute("aria-expanded")).toBe("false");
  });
  it("정렬하면 상세가 제 행을 따라가고 펼침이 남는다", () => {
    render(T({ defaultExpanded: new Set(["a"]) }));
    fireEvent.click(screen.getByRole("button", { name: "수" }));
    expect(order()).toEqual([["나", "false", true, true], ["다", "false", true, true], ["가", "true", true, false]]);
  });
  it("renderExpanded 는 펼침 상태를 받는다 — 불러올 내용은 펼쳤을 때만", () => {
    const seen: [string, boolean][] = [];
    render(T({ defaultExpanded: new Set(["b"]), renderExpanded: (r, { expanded }) => { seen.push([r.id, expanded]); return expanded ? "내용" : null; } }));
    expect(seen).toEqual([["a", false], ["b", true], ["c", false]]);
    expect(detailOf(btn("가")).textContent).toBe(""); expect(detailOf(btn("나")).textContent).toBe("내용");
  });
  it("expandable 이 false 인 행은 빈 칸 · 상세 행 없음", () => {
    render(T({ expandable: (r) => r.id !== "b" }));
    const trB = [...document.querySelectorAll("tbody > tr")].find((tr) => tr.children[1]?.textContent === "나")!;
    expect(trB.children[0].className).toBe("expand"); expect(trB.children[0].childElementCount).toBe(0);
    expect(trB.nextElementSibling!.classList.contains("row-detail")).toBe(false);
    expect(document.querySelectorAll("tr.row-detail").length).toBe(2);
  });
  it("지금 rows 에 없는 키는 지운다 — 페이지를 옮기면 접힘, 남은 행은 그대로", () => {
    const on = vi.fn();
    function P() { const [rows, setRows] = useState(ROWS); return <>{T({ rows, defaultExpanded: new Set(["a", "b"]), onExpandedChange: on })}<button onClick={() => setRows([ROWS[1], { id: "d", name: "라", n: 9 }])}>다음</button></>; }
    render(<P />);
    fireEvent.click(screen.getByText("다음"));
    expect(on).toHaveBeenLastCalledWith(new Set(["b"]), { key: null, expanded: false });
    expect(btn("나").getAttribute("aria-expanded")).toBe("true"); expect(btn("라").getAttribute("aria-expanded")).toBe("false");
  });
  it("expandScope 가 바뀌면 모두 접는다, 첫 렌더는 접지 않는다", () => {
    const on = vi.fn();
    const { rerender } = render(T({ expandScope: "전체", defaultExpanded: new Set(["a"]), onExpandedChange: on }));
    expect(on).not.toHaveBeenCalled(); expect(btn("가").getAttribute("aria-expanded")).toBe("true");
    rerender(T({ expandScope: "위험", defaultExpanded: new Set(["a"]), onExpandedChange: on }));
    expect(on).toHaveBeenLastCalledWith(new Set(), { key: null, expanded: false });
    expect(btn("가").getAttribute("aria-expanded")).toBe("false");
  });
  it("제어형 — expanded 를 바꾸지 않으면 그대로", () => {
    const on = vi.fn();
    render(T({ expanded: new Set(["a"]), onExpandedChange: on }));
    fireEvent.click(btn("나"));
    expect(on).toHaveBeenCalledWith(new Set(["a", "b"]), { key: "b", expanded: true });
    expect(btn("나").getAttribute("aria-expanded")).toBe("false");
  });
  it("이름 — rowLabel · expandLabel, 상세 id 는 표마다 다르다", () => {
    render(<>{T({ rowLabel: (r) => `정책 ${r.name}` })}{T({ expandLabel: (r) => `${r.id} 로그 상세` })}</>);
    expect(screen.getByRole("button", { name: "정책 가 상세" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "a 로그 상세" })).toBeTruthy();
    const ids = [...document.querySelectorAll("tr.row-detail")].map((d) => d.id);
    expect(new Set(ids).size).toBe(6);
  });
  it("행 클릭은 셰브론 클릭에 불리지 않는다", () => {
    const click = vi.fn();
    render(T({ rowProps: () => ({ onClick: click }) }));
    fireEvent.click(btn("가"));
    expect(click).not.toHaveBeenCalled(); expect(btn("가").getAttribute("aria-expanded")).toBe("true");
  });
  it("불러오는 중 · 오류 · 빈 행의 칸 수에 셰브론 칸이 든다", () => {
    const { rerender } = render(T({ rows: [], status: "loading", loadingRows: 1 }));
    expect(document.querySelectorAll("tbody tr td").length).toBe(3);
    rerender(T({ status: "error" }));
    expect((document.querySelector("tbody td") as HTMLTableCellElement).colSpan).toBe(3);
    rerender(T({ rows: [] }));
    expect((document.querySelector("tbody td") as HTMLTableCellElement).colSpan).toBe(3);
  });
  it("행을 지우면 상세 안에 있던 포커스는 같은 자리의 다음 행으로", () => {
    function D() { const [rows, setRows] = useState(ROWS); return T({ rows, defaultExpanded: new Set(["a", "b"]), renderExpanded: (r) => <button onClick={() => setRows((x) => x.filter((y) => y.id !== r.id))}>{r.name} 지우기</button> }); }
    render(<D />);
    const del = screen.getByText("나 지우기");   // 가운데 행 — 위에 펼친 상세가 있어도 행 순서로 센다
    del.focus(); act(() => { del.click(); });
    expect(document.activeElement).toBe(btn("다"));
  });
  it("renderExpanded 가 없으면 전과 같다", () => {
    render(<DataTable columns={COLS} rows={ROWS} rowKey={(r) => r.id} />);
    expect(document.querySelector(".expand, .row-detail")).toBeNull();
    expect(document.querySelectorAll("thead th").length).toBe(2);
  });
});
