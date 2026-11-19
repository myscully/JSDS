import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { NotificationCenter, type NotificationItem, type NotificationCenterProps } from "../src";

/* Notification Center(2026-11-14) — 사이트 behave.notify 와 같은 규칙 */
const ITEMS: NotificationItem[] = [
  { id: "n1", group: "오늘", severity: "critical", title: "랜섬웨어 의심 행위를 차단했습니다", sub: "PC-2041", time: "10분 전", href: "#ev-1", unread: true },
  { id: "n2", group: "오늘", title: "정책이 배포되었습니다", time: "1시간 전", href: "#p-1" },
  { id: "n3", group: "어제", title: "라이선스가 30일 뒤 만료됩니다", time: "어제", unread: true },
];
const live = async () => { await act(() => new Promise((r) => setTimeout(r, 80))); return document.querySelector("body > .ds-live")?.textContent; };   // announce 는 50ms 뒤에 적는다
const bell = () => screen.getAllByRole("button").find((b) => b.getAttribute("aria-haspopup") === "dialog")!;
const panel = () => document.querySelector<HTMLElement>(".notify-panel")!;
const link = (id: string) => document.querySelector<HTMLElement>(`.notify-item[data-id="${id}"] .notify-link`)!;

/* 제품처럼 onRead 로 받은 id 를 읽음으로 돌려준다 */
function Harness({ initial = ITEMS, onReadSpy, ...rest }: Partial<NotificationCenterProps> & { initial?: NotificationItem[]; onReadSpy?: (ids: string[], info: { all: boolean }) => void }) {
  const [items, setItems] = useState(initial);
  (Harness as unknown as { set: typeof setItems }).set = setItems;
  return <NotificationCenter items={items} onRead={(ids, info) => { onReadSpy?.(ids, info); setItems((xs) => xs.map((x) => (ids.includes(x.id) ? { ...x, unread: false } : x))); }} {...rest} />;
}
const setItems = (f: (xs: NotificationItem[]) => NotificationItem[]) => act(() => { (Harness as unknown as { set: (f: (xs: NotificationItem[]) => NotificationItem[]) => void }).set(f); });

describe("NotificationCenter — open and close", () => {
  it("starts closed with the unread count on the badge and name; the bell opens a labelled dialog and focuses it; Esc closes back to the bell", () => {
    const onOpenChange = vi.fn();
    render(<Harness onOpenChange={onOpenChange} />);
    expect(bell().getAttribute("aria-label")).toBe("알림 2건");
    expect(bell().getAttribute("aria-expanded")).toBe("false");
    expect(bell().getAttribute("aria-controls")).toBe(panel().id);
    const badge = document.querySelector(".with-count > .count")!;   // 벨은 점이 기본(2026-11-18) — 숫자 없음 · 이름은 '알림 n건' 그대로
    expect(badge.classList.contains("dot")).toBe(true);
    expect(badge.textContent).toBe("");
    expect(document.querySelector(".notify")!.hasAttribute("data-count")).toBe(false);
    expect(panel().hidden).toBe(true);
    fireEvent.click(bell());
    expect(panel().hidden).toBe(false);
    expect(screen.getByRole("dialog", { name: "알림" })).toBe(panel());
    expect(document.activeElement).toBe(panel());
    fireEvent.keyDown(document, { key: "Escape" });
    expect(panel().hidden).toBe(true);
    expect(document.activeElement).toBe(bell());
    expect(onOpenChange.mock.calls.map((c) => c[0])).toEqual([true, false]);
  });
  it("closes on an outside pointerdown and when focus tabs away, but not when focus moves inside", () => {
    render(<><Harness defaultOpen /><button type="button">밖</button></>);
    fireEvent.focusOut(link("n1"), { relatedTarget: link("n3") });
    expect(panel().hidden).toBe(false);
    fireEvent.focusOut(link("n3"), { relatedTarget: screen.getByText("밖") });
    expect(panel().hidden).toBe(true);
    fireEvent.click(bell());
    fireEvent.pointerDown(document.body);
    expect(panel().hidden).toBe(true);
  });
});

describe("NotificationCenter — read", () => {
  it("a no-link item only marks itself read and stays open; a link item marks read and closes; an item already read sends nothing", async () => {
    const spy = vi.fn();
    render(<Harness defaultOpen onReadSpy={spy} />);
    fireEvent.click(link("n3"));
    expect(spy).toHaveBeenLastCalledWith(["n3"], { all: false });
    expect(panel().hidden).toBe(false);
    expect(bell().getAttribute("aria-label")).toBe("알림 1건");
    expect(link("n3").querySelector(".sr-only")!.textContent).toBe("");
    expect(link("n1").querySelector(".sr-only")!.textContent).toBe(", 안 읽음");
    fireEvent.click(link("n2"));   // 이미 읽은 링크
    expect(spy).toHaveBeenCalledTimes(1);
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(panel().hidden).toBe(true);
    fireEvent.click(bell());
    fireEvent.click(link("n1"));
    expect(spy).toHaveBeenLastCalledWith(["n1"], { all: false });
    await act(() => new Promise((r) => setTimeout(r, 0)));
    expect(panel().hidden).toBe(true);
    expect(document.querySelector(".with-count > .count")).toBeNull();
    expect(bell().getAttribute("aria-label")).toBe("알림");
  });
  it("read-all marks every unread at once and announces; with nothing unread it is aria-disabled and sends nothing", async () => {
    const spy = vi.fn();
    render(<Harness defaultOpen onReadSpy={spy} />);
    const ra = screen.getByText("모두 읽음").closest("button")!;
    expect(ra.getAttribute("aria-disabled")).toBeNull();
    fireEvent.click(ra);
    expect(spy).toHaveBeenCalledWith(["n1", "n3"], { all: true });
    expect(await live()).toBe("모든 알림을 읽음으로 표시했습니다.");
    expect(ra.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(ra);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe("NotificationCenter — list", () => {
  it("the unread tab shows only unread items under their groups, with the empty note when none; arrows switch tabs", () => {
    render(<Harness defaultOpen />);
    expect([...document.querySelectorAll(".notify-day")].map((h) => h.textContent)).toEqual(["오늘", "어제"]);
    const unreadTab = screen.getByRole("tab", { name: /안 읽음/ });
    expect(unreadTab.querySelector(".count")!.textContent).toBe("2");
    fireEvent.click(unreadTab);
    expect([...document.querySelectorAll(".notify-item")].map((li) => (li as HTMLElement).dataset.id)).toEqual(["n1", "n3"]);
    fireEvent.click(screen.getByText("모두 읽음").closest("button")!);
    expect(document.querySelector(".notify-empty")!.textContent).toBe("안 읽은 알림이 없습니다.");
    fireEvent.keyDown(unreadTab, { key: "ArrowLeft" });
    expect(screen.getByRole("tab", { name: "전체" }).getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "전체" }));
    expect(document.querySelectorAll(".notify-item").length).toBe(3);
  });
  it("announces new unread items once — one by title, several by count — and reads 99+ past 99", async () => {
    render(<Harness count="number" />);
    expect(document.querySelector(".notify")!.getAttribute("data-count")).toBe("number");
    expect(document.querySelector(".with-count > .count")!.classList.contains("dot")).toBe(false);
    expect(document.querySelector(".with-count > .count")!.textContent).toBe("2");
    setItems((xs) => [{ id: "x", group: "오늘", title: "관리자 로그인 실패", time: "방금", unread: true }, ...xs]);
    expect(await live()).toBe("새 알림: 관리자 로그인 실패");
    expect(bell().getAttribute("aria-label")).toBe("알림 3건");
    setItems((xs) => [{ id: "y", title: "가", time: "방금", unread: true }, { id: "z", title: "나", time: "방금", unread: true }, ...xs]);
    expect(await live()).toBe("새 알림 2건");
    setItems((xs) => [...Array.from({ length: 100 }, (_, i) => ({ id: `m${i}`, title: `대량 ${i}`, time: "방금", unread: true })), ...xs]);
    expect(document.querySelector(".with-count > .count")!.textContent).toBe("99+");
  });
});

describe("NotificationCenter — older alerts", () => {
  it("loads with a spinner and aria-busy, announces how many came, and when done moves focus to the first new item", async () => {
    let finish!: () => void;
    function More() {
      const [items, setItems2] = useState(ITEMS); const [more, setMore] = useState(true);
      return <NotificationCenter defaultOpen items={items} hasMore={more} onMore={() => new Promise<void>((r) => { finish = () => { setItems2((xs) => [...xs, { id: "o1", group: "이전", title: "옛 알림", time: "11월 9일" }]); setMore(false); r(); }; })} />;
    }
    render(<More />);
    const btn = screen.getByText("이전 알림 보기").closest("button")!;
    fireEvent.click(btn);
    expect(btn.classList.contains("loading")).toBe(true);
    expect(btn.getAttribute("aria-busy")).toBe("true");
    await act(async () => { finish(); });
    expect(await live()).toBe("알림 1건을 더 불러왔습니다.");
    expect(document.querySelector(".notify-more")).toBeNull();
    expect(document.activeElement).toBe(link("o1"));
    expect([...document.querySelectorAll(".notify-day")].map((h) => h.textContent)).toEqual(["오늘", "어제", "이전"]);
  });
  it("a failed load says so above the button (role=status) and offers retry", async () => {
    render(<NotificationCenter defaultOpen items={ITEMS} hasMore onMore={() => Promise.reject(new Error(""))} />);
    await act(async () => { fireEvent.click(screen.getByText("이전 알림 보기").closest("button")!); });
    const msg = document.querySelector(".notify-more .msg")!;
    expect(msg.textContent).toBe("알림을 불러오지 못했습니다.");
    expect(msg.getAttribute("role")).toBe("status");
    expect(screen.getByText("다시 시도").closest("button")!.classList.contains("loading")).toBe(false);
  });
});

describe("NotificationCenter — placement", () => {
  it("open from the start inside a clipping area: not floated, narrowed and pushed to sit 8 inside it; opening later by the bell floats instead", () => {
    const w = (el: HTMLElement) => (el.style.maxWidth ? parseFloat(el.style.maxWidth) : 356);
    const rect = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      if (this.classList.contains("notify-panel")) { const x = w(this); return { left: 355 - x, right: 355, width: x, top: 60, bottom: 400, height: 340, x: 355 - x, y: 60, toJSON() {} } as DOMRect; }
      if (this.dataset.clip != null) return { left: 20, right: 371, width: 351, top: 0, bottom: 800, height: 800, x: 20, y: 0, toJSON() {} } as DOMRect;
      return { left: 325, right: 355, width: 30, top: 20, bottom: 50, height: 30, x: 325, y: 20, toJSON() {} } as DOMRect;
    });
    const ow = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) { return this.classList.contains("notify-panel") ? w(this) : 30; });
    try {
      render(<div data-clip="" style={{ overflowX: "auto", overflowY: "auto" }}><Harness defaultOpen /></div>);
      expect(document.querySelector(".notify")!.classList.contains("float")).toBe(false);
      expect(panel().style.maxWidth).toBe("335px");   // 351 - 16
      expect(panel().style.getPropertyValue("--nf-dx")).toBe("8px");   // 355 - 335 = 20 → 20 + 8 까지
      fireEvent.keyDown(document, { key: "Escape" });
      fireEvent.click(bell());
      expect(document.querySelector(".notify")!.classList.contains("float")).toBe(true);
      expect(panel().style.maxWidth).toBe("");
    } finally { rect.mockRestore(); ow.mockRestore(); }
  });
});
