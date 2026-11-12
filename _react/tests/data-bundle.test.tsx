import { useRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CursorPagination, DataTable, List, ListItem, Pagination, PaginationBar, PAGE_SIZES, type DataTableColumn, type DataTableProps } from "../src";

type Row = { id: string; name: string; n: number };
const ROWS: Row[] = [{ id: "a", name: "가", n: 3 }, { id: "b", name: "나", n: 1 }, { id: "c", name: "다", n: 2 }];
const COLS: DataTableColumn<Row>[] = [{ key: "name", header: "이름" }, { key: "n", header: "수", num: true, sortable: true }];
const T = (p: Partial<DataTableProps<Row>>) => <DataTable columns={COLS} rows={ROWS} rowKey={(r) => r.id} {...p} />;
const firstCol = () => [...document.querySelectorAll("tbody tr")].map((r) => r.children[0].textContent);
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("DataTable", () => {
  it("정렬은 머리글 안의 버튼이고, 눌러도 한 번만 정렬한다", () => {
    const on = vi.fn();
    render(T({ onSortChange: on }));
    const btn = screen.getByRole("button", { name: "수" });
    expect(btn.className).toBe("sort");
    fireEvent.click(btn);
    expect(on).toHaveBeenCalledTimes(1);
    expect(firstCol()).toEqual(["나", "다", "가"]);
  });
  it("manualSort 는 표시만 바꾸고 다시 정렬하지 않는다", () => {
    const on = vi.fn();
    render(T({ manualSort: true, onSortChange: on }));
    fireEvent.click(screen.getByRole("button", { name: "수" }));
    expect(firstCol()).toEqual(["가", "나", "다"]);
    expect(on).toHaveBeenCalledWith({ key: "n", dir: "asc" });
    expect(document.querySelector("th.sortable")!.getAttribute("aria-sort")).toBe("ascending");
  });
  it("머리글 체크박스는 이 페이지만 고르고 다른 페이지의 선택을 남긴다", () => {
    const on = vi.fn();
    render(T({ selectable: true, defaultSelected: new Set(["other"]), onSelectedChange: on }));
    fireEvent.click(screen.getByLabelText("전체 선택"));
    expect([...on.mock.lastCall![0]].sort()).toEqual(["a", "b", "c", "other"]);
    fireEvent.click(screen.getByLabelText("전체 선택"));
    expect([...on.mock.lastCall![0]]).toEqual(["other"]);
  });
  it("처리할 수 없는 행은 머리글 체크박스가 고르지 않는다", () => {
    const on = vi.fn();
    render(T({ selectable: true, onSelectedChange: on, rowProps: (r) => ({ disabled: r.id === "b" }) }));
    fireEvent.click(screen.getByLabelText("전체 선택"));
    expect([...on.mock.lastCall![0]].sort()).toEqual(["a", "c"]);
  });
  it("이 페이지를 다 고르면 전체 결과를 안내하고, 고르면 count 가 전체 건수가 된다", () => {
    const onAll = vi.fn(), bar = vi.fn(() => null);
    render(T({ selectable: true, totalCount: 1054, onAllMatchingChange: onAll, actionBar: bar }));
    const note = document.querySelector(".select-notice")!;
    expect(note.getAttribute("aria-live")).toBe("polite");
    expect(note.textContent).toBe("");
    fireEvent.click(screen.getByLabelText("전체 선택"));
    expect(note.textContent).toContain("이 페이지의 3건을 모두 선택했습니다.");
    fireEvent.click(screen.getByRole("button", { name: "전체 1,054건 선택" }));
    expect(onAll).toHaveBeenLastCalledWith(true);
    expect(note.textContent).toContain("전체 1,054건을 선택했습니다.");
    expect((bar.mock.lastCall as unknown[])[1]).toEqual({ allMatching: true, count: 1054 });
  });
  it("한 행을 풀면 전체 결과 선택이 풀리고, 선택 해제는 모두 지운다", () => {
    const onAll = vi.fn(), on = vi.fn();
    render(T({ selectable: true, totalCount: 10, onAllMatchingChange: onAll, onSelectedChange: on }));
    fireEvent.click(screen.getByLabelText("전체 선택"));
    fireEvent.click(screen.getByRole("button", { name: "전체 10건 선택" }));
    fireEvent.click(screen.getByLabelText("가 선택"));
    expect(onAll).toHaveBeenLastCalledWith(false);
    fireEvent.click(screen.getByLabelText("가 선택"));
    fireEvent.click(screen.getByRole("button", { name: "전체 10건 선택" }));
    fireEvent.click(screen.getByRole("button", { name: "선택 해제" }));
    expect(on.mock.lastCall![0].size).toBe(0);
    expect(onAll).toHaveBeenLastCalledWith(false);
  });
  it("전체 건수가 이 페이지뿐이면 안내하지 않는다", () => {
    render(T({ selectable: true, totalCount: 3 }));
    fireEvent.click(screen.getByLabelText("전체 선택"));
    expect(document.querySelector(".select-notice")!.textContent).toBe("");
  });
  it("selectionScope 가 바뀌면 선택을 지우고, 첫 렌더와 같은 값에서는 지우지 않는다", () => {
    const on = vi.fn();
    const { rerender } = render(T({ selectable: true, defaultSelected: new Set(["a"]), onSelectedChange: on, selectionScope: "x" }));
    expect(on).not.toHaveBeenCalled();
    rerender(T({ selectable: true, defaultSelected: new Set(["a"]), onSelectedChange: on, selectionScope: "x" }));
    expect(on).not.toHaveBeenCalled();
    rerender(T({ selectable: true, defaultSelected: new Set(["a"]), onSelectedChange: on, selectionScope: "y" }));
    expect(on.mock.lastCall![0].size).toBe(0);
  });
  it("안쪽 버튼 · 링크를 누르면 행 클릭이 일어나지 않는다", () => {
    const on = vi.fn();
    render(T({ rowProps: () => ({ onClick: on }), actions: () => <button type="button">동작</button> }));
    fireEvent.click(screen.getAllByText("동작")[0]);
    expect(on).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("가"));
    expect(on).toHaveBeenCalledTimes(1);
  });
  it("글자를 끌어 고른 것은 행 클릭이 아니다", () => {
    const on = vi.fn();
    render(T({ rowProps: () => ({ onClick: on }) }));
    vi.spyOn(window, "getSelection").mockReturnValue({ toString: () => "가" } as Selection);
    fireEvent.click(screen.getByText("가"));
    expect(on).not.toHaveBeenCalled();
  });
  it("포커스가 있던 행을 지우면 같은 자리의 행으로, 맨 끝이면 앞 행으로 옮긴다", () => {
    const act_ = (r: Row) => <button type="button">{r.name} 동작</button>;
    const { rerender } = render(T({ actions: act_ }));
    const focusBtn = (n: string) => { const b = screen.getByRole("button", { name: n }); b.focus(); fireEvent.focusIn(b); };
    focusBtn("나 동작");
    rerender(T({ actions: act_, rows: ROWS.filter((r) => r.id !== "b") }));
    expect(document.activeElement!.textContent).toBe("다 동작");
    focusBtn("다 동작");
    rerender(T({ actions: act_, rows: ROWS.filter((r) => r.id === "a") }));
    expect(document.activeElement!.textContent).toBe("가 동작");
  });
  it("지운 행 자리에 비활성 행이 오면 그 안(tabindex -1)으로 옮기지 않고 표 영역으로 — 2026-11-12 FOCUS_IN_ROW", () => {
    const act_ = (r: Row) => <button type="button">{r.name} 동작</button>;
    const off = (r: Row) => ({ disabled: r.id === "c" });
    const { rerender } = render(T({ actions: act_, rowProps: off }));
    const b = screen.getByRole("button", { name: "나 동작" }); b.focus(); fireEvent.focusIn(b);
    rerender(T({ actions: act_, rowProps: off, rows: ROWS.filter((r) => r.id !== "b") }));
    const dead = screen.getByText("다 동작");
    expect(dead.tabIndex).toBe(-1);
    expect(document.activeElement).not.toBe(dead);
    expect(document.activeElement!.classList.contains("tbl-wrap")).toBe(true);
  });
  it("포커스가 표 밖에 있으면 행이 사라져도 뺏지 않는다", () => {
    const act_ = (r: Row) => <button type="button">{r.name} 동작</button>;
    const { rerender } = render(<><input aria-label="밖" />{T({ actions: act_ })}</>);
    const b = screen.getByRole("button", { name: "나 동작" }); b.focus(); fireEvent.focusIn(b);
    screen.getByLabelText("밖").focus();
    rerender(<><input aria-label="밖" />{T({ actions: act_, rows: [ROWS[0]] })}</>);
    expect(document.activeElement).toBe(screen.getByLabelText("밖"));
  });
  it("불러오는 중은 Skeleton 행 · aria-busy · 작업 이름", () => {
    render(T({ status: "loading", statusLabel: "이벤트 불러오는 중", loadingRows: 2 }));
    expect(document.querySelectorAll("tbody tr").length).toBe(2);
    expect(document.querySelectorAll("tbody .skeleton").length).toBe(4);
    expect(document.querySelector("table")!.getAttribute("aria-busy")).toBe("true");
    expect(screen.getByRole("status").textContent).toBe("이벤트 불러오는 중");
  });
  it("실패는 원인과 다시 시도", () => {
    const retry = vi.fn();
    render(T({ status: "error", onRetry: retry }));
    expect(screen.getByRole("alert").textContent).toContain("다시 시도하세요");
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(retry).toHaveBeenCalledTimes(1);
    expect(document.querySelector("table")!.hasAttribute("aria-busy")).toBe(false);
  });
  it("고정 헤더는 이름 · tabindex · 높이를 함께 갖고, caption 을 그린다", () => {
    render(T({ stickyHeader: true, maxHeight: 240, caption: "최근 로그" }));
    const w = screen.getByRole("region", { name: "최근 로그" });
    expect(w.className).toContain("sticky");
    expect(w.getAttribute("tabindex")).toBe("0");
    expect(w.style.maxHeight).toBe("240px");
    expect(document.querySelector("caption")!.className).toBe("sr-only");
  });
  it("말줄임 열은 .truncate 이고 title 을 쓰지 않는다 — 전체 값은 잘린 칸의 Tooltip(2026-11-12, table-optimize.test)", () => {
    render(<DataTable columns={[{ key: "name", header: "이름", truncate: true }]} rows={ROWS} rowKey={(r) => r.id} />);
    const td = screen.getByText("가");
    expect(td.className).toBe("truncate");
    expect(td.hasAttribute("title")).toBe(false);
  });
});

describe("Pagination", () => {
  it("끝에 닿아 꺼진 화살표에서 현재 페이지로 포커스를 옮긴다", () => {
    function P() { const [p, s] = useState(2); return <Pagination page={p} total={3} onChange={s} />; }
    render(<P />);
    const next = screen.getByLabelText("다음"); next.focus();
    fireEvent.click(next);
    expect(document.activeElement!.textContent).toBe("3");
  });
  it("번호 칸이 9칸을 넘으면 경고한다", () => {
    const w = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Pagination page={1} total={40} siblings={2} />);
    expect(w).not.toHaveBeenCalled();
    render(<Pagination page={1} total={40} siblings={3} />);
    expect(w.mock.calls[0][0]).toContain("9칸");
  });
  it("PaginationBar 는 건수 · 범위 · 표시 개수 · 번호를 그린다", () => {
    render(<PaginationBar total={1284} page={2} pageSize={50} />);
    const bar = document.querySelector(".pagination-bar")!;
    expect(bar.textContent).toContain("총 1,284건 · 51–100");
    expect(bar.querySelector(".dropdown .trigger")!.textContent).toContain("50개씩");
    expect(bar.querySelector("nav button.on")!.textContent).toBe("2");
    expect(PAGE_SIZES).toEqual([20, 50, 100]);
  });
  it("표시 개수를 바꾸면 1페이지로 돌아간다", () => {
    const page = vi.fn(), size = vi.fn();
    render(<PaginationBar total={1284} page={3} pageSize={50} onPageChange={page} onPageSizeChange={size} />);
    fireEvent.click(document.querySelector(".dropdown .trigger")!);
    fireEvent.click(screen.getByRole("option", { name: "100개씩" }));
    expect(size).toHaveBeenCalledWith(100);
    expect(page).toHaveBeenCalledWith(1);
  });
  it("한 페이지뿐이면 번호를 숨기고 건수는 남긴다", () => {
    render(<PaginationBar total={12} page={1} pageSize={20} />);
    const bar = document.querySelector(".pagination-bar")!;
    expect(bar.textContent).toBe("총 12건");
    expect(bar.querySelector("nav")).toBeNull();
    expect(bar.querySelector(".dropdown")).toBeNull();
  });
  it("개수를 크게 해 한 페이지가 돼도 표시 개수는 남아 되돌릴 수 있다", () => {
    render(<PaginationBar total={60} page={1} pageSize={100} />);
    const bar = document.querySelector(".pagination-bar")!;
    expect(bar.querySelector("nav")).toBeNull();
    expect(bar.querySelector(".dropdown")).not.toBeNull();
  });
  it("target 을 주면 이동한 뒤 그 표로 포커스를 옮긴다", () => {
    function P() { const r = useRef<HTMLDivElement>(null); const [p, s] = useState(1); return <><div ref={r} data-testid="t" /><PaginationBar total={200} page={p} pageSize={20} onPageChange={s} target={r} /></>; }
    render(<P />);
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(document.activeElement).toBe(screen.getByTestId("t"));
    expect(screen.getByTestId("t").getAttribute("tabindex")).toBe("-1");
  });
  it("커서 방식은 이전 · 다음과 범위만, 없는 쪽은 꺼진다", () => {
    const next = vi.fn();
    render(<CursorPagination hasPrev={false} hasNext onNext={next} range="1–100" />);
    const nav = screen.getByRole("navigation");
    expect(nav.className).toBe("pagination cursor");
    expect((screen.getByRole("button", { name: "이전" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(next).toHaveBeenCalledTimes(1);
    expect(nav.textContent).toContain("1–100");
  });
  it("커서 방식에서 누른 쪽이 꺼지면 남은 쪽으로 포커스를 옮긴다", () => {
    function P() { const [n, s] = useState(true); return <CursorPagination hasPrev hasNext={n} onNext={() => s(false)} />; }
    render(<P />);
    const next = screen.getByRole("button", { name: "다음" }); next.focus();
    act(() => { next.click(); });
    expect(document.activeElement!.textContent).toBe("이전");
  });
});

describe("List", () => {
  it("안쪽 버튼을 누르거나 Enter 를 쳐도 행 클릭이 일어나지 않는다", () => {
    const on = vi.fn(), inner = vi.fn();
    render(<List><ListItem primary="가" onClick={on} end={<button type="button" onClick={inner}>동작</button>} /></List>);
    const b = screen.getByText("동작");
    fireEvent.click(b);
    expect(inner).toHaveBeenCalledTimes(1);
    expect(on).not.toHaveBeenCalled();
    const notPrevented = fireEvent.keyDown(b, { key: "Enter" });
    expect(notPrevented).toBe(true);
    expect(on).not.toHaveBeenCalled();
  });
  it("행 자체의 Enter 는 행 클릭이다", () => {
    const on = vi.fn();
    render(<List><ListItem primary="가" onClick={on} /></List>);
    fireEvent.keyDown(screen.getByRole("listitem"), { key: "Enter" });
    expect(on).toHaveBeenCalledTimes(1);
  });
});
