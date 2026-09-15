import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable } from "./data-table/DataTable";
import { Accordion } from "./accordion/Accordion";
import { Donut } from "./data-visual/DataVisual";

type R = { id: string; name: string; n: number };
const rows: R[] = [{ id: "a", name: "b", n: 2 }, { id: "b", name: "a", n: 1 }, { id: "c", name: "c", n: 3 }];
const cols = [{ key: "name", header: "이름", sortable: true }, { key: "n", header: "수", num: true, sortable: true }];

describe("DataTable", () => {
  it("헤더 클릭으로 asc → desc 정렬, aria-sort 표시", async () => {
    render(<DataTable columns={cols} rows={rows} rowKey={(r) => r.id} />);
    const th = screen.getByRole("columnheader", { name: "수" });
    await userEvent.click(th);
    expect(th).toHaveAttribute("aria-sort", "ascending");
    let cells = screen.getAllByRole("row").slice(1).map((r) => within(r).getAllByRole("cell")[1].textContent);
    expect(cells).toEqual(["1", "2", "3"]);
    await userEvent.click(th);
    expect(th).toHaveAttribute("aria-sort", "descending");
    cells = screen.getAllByRole("row").slice(1).map((r) => within(r).getAllByRole("cell")[1].textContent);
    expect(cells).toEqual(["3", "2", "1"]);
  });
  it("선택: 헤더 체크박스 indeterminate → 전체 선택, 행 .on", async () => {
    const onSel = vi.fn();
    render(<DataTable columns={cols} rows={rows} rowKey={(r) => r.id} selectable defaultSelected={new Set(["a"])} onSelectedChange={onSel} />);
    const all = screen.getByRole("checkbox", { name: "전체 선택" }) as HTMLInputElement;
    expect(all.indeterminate).toBe(true);
    expect(screen.getAllByRole("row")[1]).toHaveClass("on");
    await userEvent.click(all);
    expect(onSel).toHaveBeenLastCalledWith(new Set(["a", "b", "c"]));
    expect(all.checked).toBe(true);
  });
  it("빈 상태", () => {
    render(<DataTable columns={cols} rows={[]} rowKey={(r: R) => r.id} empty="없음" />);
    const td = screen.getByText("없음");
    expect(td).toHaveClass("empty");
    expect(td).toHaveAttribute("colspan", "2");
  });
});

describe("Accordion", () => {
  it("summary 클릭 시 onOpenChange", async () => {
    const onOpenChange = vi.fn();
    render(<Accordion title="제목" onOpenChange={onOpenChange}>내용</Accordion>);
    const d = document.querySelector("details")!;
    // jsdom 은 summary 클릭 시 toggle 이벤트를 발생시키지 않을 수 있어 직접 토글
    d.open = true; d.dispatchEvent(new Event("toggle"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});

describe("Donut", () => {
  it("비율 aria-label 과 conic-gradient", () => {
    const { container } = render(<Donut segments={[{ label: "A", value: 1, tone: "critical" }, { label: "B", value: 3, tone: "low" }]} label="4" />);
    const d = container.firstElementChild as HTMLElement;
    expect(d).toHaveAttribute("aria-label", "A 25%, B 75%");
    expect(d.style.background).toContain("conic-gradient");
  });
});
