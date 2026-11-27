import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Combobox, DataTable, NotificationCenter, flash, SideNav, SideNavItem, Tab, TabList, TabPanel, Tabs, type DataTableColumn } from "../src";

/* 2026-11-26 — 모션 보강: 탭 밑줄이 고른 탭으로 옮겨 가고(사이트 ds.js inkSync 와 같은 계산), 사이드 내비는 버튼으로 펼칠 때만 이름이 흐림에서 나타난다 */
afterEach(() => vi.restoreAllMocks());

const rect = (left: number, width: number) => ({ left, width, top: 0, height: 44, right: left + width, bottom: 44, x: left, y: 0, toJSON() {} }) as DOMRect;

describe("tab ink", () => {
  it("puts the ink under the picked tab and turns transitions on only after first paint", async () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      if (this.classList.contains("tabs")) return rect(10, 400);
      if (this.dataset.v === "b") return rect(110, 60);
      return rect(10, 80);
    });
    const { container, getByText } = render(
      <Tabs defaultValue="a"><TabList label="보기"><Tab value="a" data-v="a">전체</Tab><Tab value="b" data-v="b">경고</Tab></TabList></Tabs>,
    );
    const bar = container.querySelector<HTMLElement>(".tabs")!;
    expect(bar.hasAttribute("data-ink")).toBe(true);
    expect(bar.hasAttribute("data-ink-ready")).toBe(false);   // 처음 그릴 때는 미끄러지지 않는다
    expect(bar.style.getPropertyValue("--tab-x")).toBe("0px");
    expect(bar.style.getPropertyValue("--tab-w")).toBe("80px");
    expect(bar.style.getPropertyValue("--tab-s")).toBe("80");   // 선은 1px 를 늘린다(scale)
    await waitFor(() => expect(bar.hasAttribute("data-ink-ready")).toBe(true));
    fireEvent.click(getByText("경고"));
    expect(bar.style.getPropertyValue("--tab-x")).toBe("100px");
    expect(bar.style.getPropertyValue("--tab-w")).toBe("60px");
    expect(bar.style.getPropertyValue("--tab-s")).toBe("60");
  });
});

describe("side nav width", () => {
  it("fades names in only when unfolded after first paint", async () => {
    const nav = (collapsed: boolean) => <SideNav collapsed={collapsed}><SideNavItem href="#" icon="home">대시보드</SideNavItem></SideNav>;
    const { container, rerender } = render(nav(true));
    const el = container.querySelector<HTMLElement>(".sidenav")!;
    expect(el.classList.contains("ds-nav-opening")).toBe(false);
    await waitFor(() => expect(el.hasAttribute("data-nav-ready")).toBe(true));
    rerender(nav(false));
    expect(el.classList.contains("ds-nav-opening")).toBe(true);
    rerender(nav(true));
    vi.useFakeTimers();
    rerender(nav(false));
    act(() => { vi.advanceTimersByTime(450); });
    expect(el.classList.contains("ds-nav-opening")).toBe(false);
    vi.useRealTimers();
  });
});

/* 2026-11-26 3단계 — 패널 바꿈 흐림 · 새 항목 하이라이트 · 지운 항목 사라짐(사이트 swap · flash · dismiss 와 같은 모습) */
describe("content motion", () => {
  const motion = () => { const r = document.documentElement.style; r.setProperty("--motion-exit", "120ms"); r.setProperty("--motion-flash", "1600ms"); };
  afterEach(() => { const r = document.documentElement.style; r.removeProperty("--motion-exit"); r.removeProperty("--motion-flash"); document.querySelectorAll(".ds-ghost").forEach((g) => g.remove()); });

  it("a tab panel fades in when picked, not on first render", () => {
    const { container, getByText } = render(<Tabs defaultValue="a"><TabList label="보기"><Tab value="a">전체</Tab><Tab value="b">경고</Tab></TabList><TabPanel value="a">가</TabPanel><TabPanel value="b">나</TabPanel></Tabs>);
    expect(container.querySelector(".ds-swap")).toBeNull();
    fireEvent.click(getByText("경고"));
    const on = container.querySelector<HTMLElement>("[role=tabpanel]:not([hidden])")!;
    expect(on.textContent).toBe("나");
    expect(on.classList.contains("ds-swap")).toBe(true);
    fireEvent.animationEnd(on);
    expect(on.classList.contains("ds-swap")).toBe(false);
  });

  it("a removed table row leaves an inert copy in place while the real rows change at once", () => {
    motion();
    type R = { id: string; name: string };
    const cols: DataTableColumn<R>[] = [{ key: "name", header: "이름" }];
    const rows: R[] = [{ id: "a", name: "가" }, { id: "b", name: "나" }, { id: "c", name: "다" }];
    const t = (rs: R[]) => <DataTable columns={cols} rows={rs} rowKey={(r) => r.id} />;
    const { container, rerender } = render(t(rows));
    rerender(t([rows[0], rows[2]]));
    const trs = Array.from(container.querySelectorAll<HTMLTableRowElement>("tbody tr"));
    expect(trs.map((r) => r.textContent)).toEqual(["가", "나", "다"]);
    const gone = trs[1];
    expect(gone.classList.contains("ds-leaving")).toBe(true);
    expect(gone.inert).toBe(true);
    expect(gone.getAttribute("aria-hidden")).toBe("true");
    expect(gone.style.animation).toContain("ds-out");
    fireEvent.animationEnd(gone);
    expect(Array.from(container.querySelectorAll("tbody tr")).map((r) => r.textContent)).toEqual(["가", "다"]);
  });

  it("a new page of rows swaps at once (no leaving copies)", () => {
    motion();
    type R = { id: string; name: string };
    const cols: DataTableColumn<R>[] = [{ key: "name", header: "이름" }];
    const t = (rs: R[]) => <DataTable columns={cols} rows={rs} rowKey={(r) => r.id} />;
    const { container, rerender } = render(t([{ id: "a", name: "가" }, { id: "b", name: "나" }]));
    rerender(t([{ id: "c", name: "다" }]));
    expect(container.querySelector(".ds-leaving")).toBeNull();
  });

  it("a removed combobox chip leaves a fading copy", async () => {
    motion();
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(() => rect(10, 80));   // jsdom 은 크기가 0 이라 사본을 뜨지 않는다
    const { container } = render(<Combobox multiple options={[{ value: "a", label: "영업팀" }, { value: "b", label: "개발팀" }]} label="부서" defaultValue={["a", "b"]} />);
    fireEvent.click(container.querySelector<HTMLButtonElement>(".chip .x")!);
    await waitFor(() => expect(document.querySelector(".ds-ghost .chip")).not.toBeNull());
    expect(container.querySelectorAll(".chip").length).toBe(1);
  });

  it("flash is public for rows a product adds", () => {
    vi.useFakeTimers();
    const tr = document.createElement("tr"); document.body.append(tr);
    flash([tr, null]); flash(tr);   // 다시 부르면 처음부터 — 타이머 하나
    expect(tr.classList.contains("ds-new")).toBe(true);
    vi.advanceTimersByTime(1700);
    expect(tr.classList.contains("ds-new")).toBe(false);
    tr.remove(); vi.useRealTimers();
  });

  it("flash announces '새 항목 n개' once, stays quiet with announce:false, and takes a custom text", () => {
    vi.useFakeTimers();
    const a = document.createElement("tr"), b = document.createElement("tr"); document.body.append(a, b);
    const live = () => document.querySelector("body > .ds-live")!;
    flash([a, null, b]); vi.advanceTimersByTime(60);
    expect(live().getAttribute("role")).toBe("status");
    expect(live().textContent).toBe("새 항목 2개");
    flash(a, { announce: false }); vi.advanceTimersByTime(60);
    expect(live().textContent).toBe("새 항목 2개");
    flash(b, { announce: "로그 {n}건 들어옴" }); vi.advanceTimersByTime(60);
    expect(live().textContent).toBe("로그 1건 들어옴");
    vi.advanceTimersByTime(1700); a.remove(); b.remove(); vi.useRealTimers();
  });

  it("new notifications flash once", () => {
    motion();
    const base = [{ id: "1", title: "기존 알림", time: "1시간 전", unread: false }];
    const { container, rerender } = render(<NotificationCenter items={base} defaultOpen />);
    expect(container.querySelector(".ds-new")).toBeNull();
    vi.useFakeTimers();
    rerender(<NotificationCenter items={[{ id: "2", title: "새 알림", time: "방금", unread: true }, ...base]} defaultOpen />);
    const fresh = container.querySelector<HTMLElement>('.notify-item[data-id="2"]')!;
    expect(fresh.classList.contains("ds-new")).toBe(true);
    act(() => { vi.advanceTimersByTime(60); });
    expect(document.querySelector("body > .ds-live")?.textContent ?? "").not.toContain("새 항목");   // 알림 센터는 제목으로 따로 알린다
    expect(container.querySelector<HTMLElement>('.notify-item[data-id="1"]')!.classList.contains("ds-new")).toBe(false);
    act(() => { vi.advanceTimersByTime(1700); });
    expect(fresh.classList.contains("ds-new")).toBe(false);
    vi.useRealTimers();
  });
});
