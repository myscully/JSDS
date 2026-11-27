import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { DataTable, FormActions, Stepper, type DataTableColumn } from "../src";

/* 2026-11-26 — 표 행 방향키(사이트 table[data-row-nav] 와 같은 동작)와 긴 폼의 버튼 줄 고정(.sticky · 붙어 있는 동안 .stuck) */
afterEach(() => vi.unstubAllGlobals());

type Row = { id: string; host: string; off?: boolean };
const ROWS: Row[] = [
  { id: "1", host: "PC-2041" },
  { id: "2", host: "PC-1187" },
  { id: "3", host: "PC-0932", off: true },
  { id: "4", host: "PC-0815" },
];
const COLUMNS: DataTableColumn<Row>[] = [{ key: "host", header: "단말", render: (r) => <a href="#">{r.host}</a> }];
const table = (rows = ROWS) => (
  <DataTable rowNavigation selectable caption="단말 목록" columns={COLUMNS} rows={rows} rowKey={(r) => r.id} rowLabel={(r) => r.host} rowProps={(r) => ({ disabled: r.off })} />
);
const bodyRows = (c: HTMLElement) => Array.from(c.querySelectorAll<HTMLTableRowElement>("tbody tr:not(.ds-leaving)"));

describe("row navigation", () => {
  it("makes one row the Tab stop and keeps links in other rows out of the Tab order", () => {
    const { container } = render(table());
    const t = container.querySelector("table")!;
    expect(t.hasAttribute("data-row-nav")).toBe(true);
    const rows = bodyRows(container);
    expect(rows.map((r) => r.tabIndex)).toEqual([0, -1, -1, -1]);
    expect(rows[0].querySelector("a")!.hasAttribute("tabindex")).toBe(false);
    expect(rows[1].querySelector("a")!.getAttribute("tabindex")).toBe("-1");
  });

  it("moves with arrows · Home · End, skips the disabled row, and Space ticks the checkbox", () => {
    const { container } = render(table());
    const rows = bodyRows(container);
    rows[0].focus();
    const key = (k: string) => fireEvent.keyDown(document.activeElement!, { key: k });
    key("ArrowDown"); expect(document.activeElement).toBe(rows[1]);
    key("ArrowDown"); expect(document.activeElement).toBe(rows[3]);   // 꺼진 PC-0932 를 건너뜀
    key("ArrowDown"); expect(document.activeElement).toBe(rows[3]);   // 끝에서 멈춤
    key("Home"); expect(document.activeElement).toBe(rows[0]);
    key("End"); expect(document.activeElement).toBe(rows[3]);
    expect(rows[3].tabIndex).toBe(0);
    expect(rows[0].tabIndex).toBe(-1);
    key(" ");
    expect(rows[3].querySelector<HTMLInputElement>("td.check input")!.checked).toBe(true);
    expect(document.activeElement).toBe(rows[3]);
  });

  it("Enter opens the row's first link and keys inside a control are left alone", () => {
    const { container } = render(table());
    const rows = bodyRows(container);
    const click = vi.fn((e: Event) => e.preventDefault());
    rows[0].querySelector("a")!.addEventListener("click", click);
    rows[0].focus();
    fireEvent.keyDown(rows[0], { key: "Enter" });
    expect(click).toHaveBeenCalledTimes(1);
    const box = rows[0].querySelector<HTMLInputElement>("td.check input")!;
    box.focus();
    fireEvent.keyDown(box, { key: "ArrowDown" });
    expect(document.activeElement).toBe(box);
  });

  it("after a delete, focus goes to the row now in that place", () => {
    const { container, rerender } = render(table());
    bodyRows(container)[1].focus();
    rerender(table(ROWS.filter((r) => r.id !== "2")));
    const a = document.activeElement as HTMLElement;
    expect(a.tagName).toBe("TR");
    expect(a.textContent).toContain("PC-0815");   // 그 자리에 온 PC-0932 는 꺼져 있어 건너뜀
    expect(a.tabIndex).toBe(0);
  });
});

describe("sticky action bar", () => {
  /* jsdom 에는 IntersectionObserver 가 없다 — 붙은 상태(줄이 영역 아래로 1px 넘침)를 흉내 낸다 */
  function stubIO(stuck: boolean) {
    const inst: { opts?: IntersectionObserverInit } = {};
    class IO {
      constructor(private cb: IntersectionObserverCallback, opts: IntersectionObserverInit) { inst.opts = opts; }
      observe(el: Element) {
        this.cb([{ target: el, intersectionRatio: stuck ? 0.98 : 1, rootBounds: { bottom: 400 } as DOMRectReadOnly, boundingClientRect: { bottom: stuck ? 400 : 300 } as DOMRectReadOnly } as unknown as IntersectionObserverEntry], this as unknown as IntersectionObserver);
      }
      disconnect() {}
    }
    vi.stubGlobal("IntersectionObserver", IO);
    return inst;
  }

  it("FormActions sticky adds .sticky and .stuck while it hangs at the bottom", () => {
    const inst = stubIO(true);
    const { container } = render(<form className="form"><FormActions sticky><button>저장</button></FormActions></form>);
    const bar = container.querySelector(".form-actions")!;
    expect(bar.className).toContain("sticky");
    expect(bar.className).toContain("stuck");
    expect(inst.opts!.threshold).toEqual([1]);
  });

  it("is not stuck when the bar sits in place, and plain FormActions has neither class", () => {
    stubIO(false);
    const a = render(<FormActions sticky><button>저장</button></FormActions>);
    expect(a.container.querySelector(".form-actions")!.className).not.toContain("stuck");
    a.unmount();
    stubIO(true);
    const b = render(<FormActions><button>저장</button></FormActions>);
    expect(b.container.querySelector(".form-actions")!.className).toBe("form-actions");
  });

  it("Stepper stickyActions puts .sticky on the step buttons bar", () => {
    stubIO(true);
    const { container } = render(<Stepper aria-label="정책 만들기" stickyActions steps={[{ label: "정보", content: <p>1</p> }, { label: "대상", content: <p>2</p> }, { label: "확인", content: <p>3</p> }]} />);
    const bar = container.querySelector(".step-actions")!;
    expect(bar.className).toContain("sticky");
    expect(bar.className).toContain("stuck");
  });
});
