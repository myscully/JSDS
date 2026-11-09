import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { Banner, Button, Popup, PopupActions, PopupBody, PopupTitle, SidePanel, ToastProvider, Tooltip, useToast } from "../src";

type Api = ReturnType<typeof useToast>;
function setup(props?: { max?: number }) {
  let api!: Api;
  function Grab() { api = useToast(); return null; }
  render(<ToastProvider {...props}><Grab /></ToastProvider>);
  return () => api;
}
const toasts = () => Array.from(document.querySelectorAll(".toast")).map((t) => t.textContent);
const stack = () => document.querySelector(".toast-stack") as HTMLElement;
const tick = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });

/* jsdom 은 레이아웃이 없어 offsetParent 가 늘 null 이다 — 포커스 가능 요소 목록이 비지 않게 */
beforeEach(() => { Object.defineProperty(HTMLElement.prototype, "offsetParent", { configurable: true, get() { return (this as HTMLElement).parentNode; } }); document.body.style.overflow = ""; });

describe("Toast", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });
  it("기본 4초 · 동작이 있으면 10초 · 값을 주면 그 값", () => {
    const t = setup();
    act(() => { t().show("plain"); t().show({ message: "undo", action: { label: "실행 취소", onClick: () => {} } }); });
    tick(4001);
    expect(toasts()).toEqual(["undo실행 취소"]);
    tick(6000);
    expect(toasts()).toEqual([]);
    act(() => { t().show({ message: "x", action: { label: "실행 취소", onClick: () => {} }, duration: 500 }); });
    tick(501);
    expect(toasts()).toEqual([]);
  });
  it("오류는 duration 을 줘도 남고 닫기 버튼으로만 닫힌다", () => {
    const t = setup();
    act(() => { t().show({ message: "실패", tone: "danger", duration: 50 }); });
    tick(60000);
    expect(toasts()).toEqual(["실패"]);
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(toasts()).toEqual([]);
  });
  it("자동으로 사라지는 Toast 에는 닫기 버튼이 없다", () => {
    const t = setup();
    act(() => { t().show("a"); });
    expect(screen.queryByRole("button", { name: "닫기" })).toBeNull();
  });
  it("마우스를 올리면 묶음 전체가 멈추고, 떠나면 남은 시간만큼 돈다", () => {
    const t = setup();
    act(() => { t().show({ message: "a", duration: 1000 }); });
    tick(600);
    act(() => { t().show({ message: "b", duration: 1000 }); });
    fireEvent.mouseEnter(stack());
    tick(5000);
    expect(toasts()).toEqual(["a", "b"]);
    fireEvent.mouseLeave(stack());
    tick(401);
    expect(toasts()).toEqual(["b"]);
  });
  it("포커스가 들어오면 멈추고 나가면 돈다", () => {
    const t = setup();
    act(() => { t().show({ message: "a", action: { label: "실행 취소", onClick: () => {} }, duration: 500 }); });
    const b = screen.getByRole("button", { name: "실행 취소" });
    act(() => { b.focus(); });
    tick(3000);
    expect(toasts().length).toBe(1);
    act(() => { b.blur(); });
    tick(501);
    expect(toasts().length).toBe(0);
  });
  it("같은 알림은 합치고 시간을 다시 잰다", () => {
    const t = setup();
    act(() => { t().show({ message: "same", duration: 500 }); });
    tick(300);
    let id2 = 0;
    act(() => { id2 = t().show({ message: "same", duration: 500 }); });
    expect(id2).toBe(1);
    expect(toasts()).toEqual(["same"]);
    tick(300);
    expect(toasts()).toEqual(["same"]);
    tick(201);
    expect(toasts()).toEqual([]);
  });
  it("동작이 있는 Toast 는 합치지 않는다", () => {
    const t = setup();
    act(() => { for (let i = 0; i < 2; i++) t().show({ message: "same", action: { label: "실행 취소", onClick: () => {} } }); });
    expect(toasts().length).toBe(2);
  });
  it("오류는 밀리지 않아 3개를 넘어 쌓인다", () => {
    const t = setup();
    act(() => { for (const m of ["e1", "e2", "e3"]) t().show({ message: m, tone: "danger" }); t().show("n"); });
    expect(toasts()).toEqual(["e1", "e2", "e3", "n"]);
  });
  it("넘치면 자동으로 사라지는 것부터 지운다", () => {
    const t = setup();
    act(() => { t().show("o1"); t().show({ message: "e1", tone: "danger" }); t().show("o2"); t().show("o3"); });
    expect(toasts()).toEqual(["e1", "o2", "o3"]);
  });
  it("키보드로 닫으면 다음 Toast 로, 없으면 들어오기 전 자리로", () => {
    const t = setup();
    const from = document.createElement("button"); document.body.append(from); from.focus();
    act(() => { t().show({ message: "k1", tone: "danger" }); t().show({ message: "k2", tone: "danger" }); });
    const [x1, x2] = screen.getAllByRole("button", { name: "닫기" });
    fireEvent.focusIn(x1, { relatedTarget: from });
    act(() => { x1.focus(); });
    fireEvent.click(x1, { detail: 0 });
    expect(document.activeElement).toBe(x2);
    fireEvent.click(x2, { detail: 0 });
    expect(document.activeElement).toBe(from);
    from.remove();
  });
  it("마우스로 닫으면 포커스를 옮기지 않는다", () => {
    const t = setup();
    act(() => { t().show({ message: "m1", tone: "danger" }); t().show({ message: "m2", tone: "danger" }); });
    const [x1, x2] = screen.getAllByRole("button", { name: "닫기" });
    act(() => { x1.focus(); });
    fireEvent.click(x1, { detail: 1 });
    expect(document.activeElement).not.toBe(x2);
  });
});

describe("Banner", () => {
  it("onClose 가 있으면 닫기 버튼 · 없으면 없다", () => {
    const onClose = vi.fn();
    const { rerender } = render(<Banner onClose={onClose}>공지</Banner>);
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    rerender(<Banner>공지</Banner>);
    expect(screen.queryByRole("button", { name: "닫기" })).toBeNull();
  });
  it("키보드로 닫으면 다음 칸으로", () => {
    function T() { const [o, s] = useState(true); return <>{o && <Banner onClose={() => s(false)}>공지</Banner>}<button>다음</button></>; }
    render(<T />);
    const x = screen.getByRole("button", { name: "닫기" }); x.focus();
    fireEvent.click(x, { detail: 0 });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "다음" }));
  });
});

describe("Popup", () => {
  const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 5)); });
  const dim = () => document.querySelector(".popup-backdrop") as HTMLElement;
  function P({ onClose = vi.fn(), ...p }: Partial<Parameters<typeof Popup>[0]> & { onClose?: () => void }) {
    return (
      <Popup open onClose={onClose} {...p}>
        <PopupTitle>제목</PopupTitle>
        <PopupBody>본문</PopupBody>
        {p.children}
        <PopupActions><Button variant="outline" color="assistive">취소</Button><Button color={p.danger ? "negative" : undefined}>실행</Button></PopupActions>
      </Popup>
    );
  }
  it("상태로 열어도 포커스가 안으로 들어가고, 닫으면 연 요소로 돌아온다", async () => {
    function T() { const [o, s] = useState(false); return <><button onClick={() => s(true)}>열기</button><P open={o} onClose={() => s(false)} /></>; }
    render(<T />);
    const b = screen.getByRole("button", { name: "열기" }); b.focus();
    fireEvent.click(b); await flush();
    expect(document.activeElement).toHaveTextContent("취소");
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(document, { key: "Escape" }); await flush();
    expect(document.querySelector(".popup")).toBeNull();
    expect(document.activeElement).toBe(b);
    expect(document.body.style.overflow).toBe("");
  });
  it("닫기(X)를 늘 그리고 누르면 닫는다", () => {
    const onClose = vi.fn();
    render(<P onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
  it("첫 포커스는 닫기(X)를 건너뛰어 취소", async () => {
    render(<P />); await flush();
    expect(document.activeElement).toHaveTextContent("취소");
  });
  it("위험 확인은 위험 실행 버튼이 먼저 와도 건너뛴다 · alertdialog + 본문 연결", async () => {
    render(
      <Popup open onClose={() => {}} danger>
        <PopupTitle>삭제</PopupTitle>
        <PopupBody>본문</PopupBody>
        <PopupActions><Button color="negative">삭제</Button><Button variant="outline" color="assistive">취소</Button></PopupActions>
      </Popup>,
    );
    await flush();
    expect(document.activeElement).toHaveTextContent("취소");
    const d = screen.getByRole("alertdialog");
    expect(document.getElementById(d.getAttribute("aria-describedby")!)).toHaveTextContent("본문");
  });
  it("손대지 않은 팝업은 배경으로 닫힌다", () => {
    const onClose = vi.fn();
    render(<P onClose={onClose} />);
    fireEvent.mouseDown(dim());
    expect(onClose).toHaveBeenCalledTimes(1);
  });
  it("입력을 시작하면 배경으로 닫히지 않는다 · Esc 는 닫힌다", () => {
    const onClose = vi.fn();
    render(<P onClose={onClose}><input aria-label="값" /></P>);
    fireEvent.input(screen.getByLabelText("값"), { target: { value: "a" } });
    fireEvent.mouseDown(dim());
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
  it("목록에서 고른 것도 입력이다", () => {
    const onClose = vi.fn();
    render(<P onClose={onClose}><button className="menu-item">a</button></P>);
    fireEvent.click(screen.getByRole("button", { name: "a" }));
    fireEvent.mouseDown(dim());
    expect(onClose).not.toHaveBeenCalled();
  });
  it("위험 확인은 배경으로 닫히지 않고, closeOnBackdrop 을 주면 그 값을 따른다", () => {
    const a = vi.fn(), b = vi.fn();
    const { unmount } = render(<P danger onClose={a} />);
    fireEvent.mouseDown(dim());
    expect(a).not.toHaveBeenCalled();
    unmount();
    render(<P danger closeOnBackdrop onClose={b} />);
    fireEvent.mouseDown(dim());
    expect(b).toHaveBeenCalledTimes(1);
  });
  it("처리 중이면 X 는 비활성이고 Esc · 배경이 막힌다", () => {
    const onClose = vi.fn();
    render(<P busy onClose={onClose} />);
    expect(screen.getByRole("button", { name: "닫기" })).toBeDisabled();
    expect(screen.getByRole("dialog").getAttribute("aria-busy")).toBe("true");
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.mouseDown(dim());
    expect(onClose).not.toHaveBeenCalled();
  });
  it("모달 위에 모달을 열면 알려 준다", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<><P /><P /></>);
    expect(warn.mock.calls.some((c) => String(c[0]).includes("모달 위에 모달"))).toBe(true);
    warn.mockRestore();
  });
});

describe("Tooltip", () => {
  const rect = (r: Partial<DOMRect>) => ({ x: 0, y: 0, left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, toJSON: () => ({}), ...r }) as DOMRect;
  const setSize = (tip: HTMLElement) => { Object.defineProperty(tip, "offsetWidth", { value: 100, configurable: true }); Object.defineProperty(tip, "offsetHeight", { value: 30, configurable: true }); };
  it("이름과 같은 툴팁은 aria-describedby 를 잇지 않는다", () => {
    render(<Tooltip content="새로 고침"><button aria-label="새로 고침">x</button></Tooltip>);
    expect(screen.getByRole("button").getAttribute("aria-describedby")).toBeNull();
  });
  it("보조 설명은 잇는다", () => {
    render(<Tooltip content="목록을 다시 불러옵니다"><button>새로 고침</button></Tooltip>);
    expect(document.getElementById(screen.getByRole("button").getAttribute("aria-describedby")!)).toHaveTextContent("목록을 다시 불러옵니다");
  });
  it("Esc 로 닫고, 떠나면 되돌린다", () => {
    render(<Tooltip content="설명"><button>a</button></Tooltip>);
    const wrap = document.querySelector(".tooltip-wrap") as HTMLElement;
    fireEvent.mouseEnter(wrap);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(wrap.classList.contains("quiet")).toBe(true);
    fireEvent.mouseLeave(wrap);
    expect(wrap.classList.contains("quiet")).toBe(false);
  });
  it("마우스도 포커스도 없으면 Esc 를 가로채지 않는다", () => {
    render(<Tooltip content="설명"><button>a</button></Tooltip>);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.querySelector(".tooltip-wrap")!.classList.contains("quiet")).toBe(false);
  });
  it("포커스가 남아 있으면 마우스가 떠나도 닫힌 채다", () => {
    render(<Tooltip content="설명"><button>a</button></Tooltip>);
    const wrap = document.querySelector(".tooltip-wrap") as HTMLElement;
    fireEvent.mouseEnter(wrap);
    fireEvent.focus(screen.getByRole("button"));
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.mouseLeave(wrap);
    expect(wrap.classList.contains("quiet")).toBe(true);
  });
  it("화면 위 끝이면 아래로 뒤집는다", () => {
    render(<Tooltip content="설명"><button>a</button></Tooltip>);
    const wrap = document.querySelector(".tooltip-wrap") as HTMLElement, tip = document.querySelector(".tooltip") as HTMLElement;
    vi.spyOn(wrap, "getBoundingClientRect").mockReturnValue(rect({ left: 500, right: 540, top: 2, bottom: 34, width: 40, height: 32 }));
    setSize(tip);
    fireEvent.mouseEnter(wrap);
    expect(tip.classList.contains("bottom")).toBe(true);
    expect(tip.classList.contains("float")).toBe(false);
  });
  it("스크롤 영역 안이면 화면 기준으로 띄우고, 스크롤에 숨긴다", () => {
    render(<div style={{ overflowX: "auto", overflowY: "auto" }}><Tooltip content="설명"><button>a</button></Tooltip></div>);
    const wrap = document.querySelector(".tooltip-wrap") as HTMLElement, tip = document.querySelector(".tooltip") as HTMLElement;
    vi.spyOn(wrap, "getBoundingClientRect").mockReturnValue(rect({ left: 500, right: 540, top: 300, bottom: 332, width: 40, height: 32 }));
    setSize(tip);
    fireEvent.mouseEnter(wrap);
    expect(tip.classList.contains("float")).toBe(true);
    expect(tip.style.getPropertyValue("--float-x")).toBe("470px");
    expect(tip.style.getPropertyValue("--float-y")).toBe("262px");
    expect(tip.style.getPropertyValue("--float-arrow")).toBe("50px");
    fireEvent.scroll(window);
    expect(wrap.classList.contains("quiet")).toBe(true);
  });
  it("옆으로 넘치면 화면 안으로 당긴다", () => {
    render(<Tooltip content="설명"><button>a</button></Tooltip>);
    const wrap = document.querySelector(".tooltip-wrap") as HTMLElement, tip = document.querySelector(".tooltip") as HTMLElement;
    vi.spyOn(wrap, "getBoundingClientRect").mockReturnValue(rect({ left: window.innerWidth - 40, right: window.innerWidth, top: 300, bottom: 332, width: 40, height: 32 }));
    setSize(tip);
    fireEvent.mouseEnter(wrap);
    expect(tip.style.getPropertyValue("--float-x")).toBe(`${window.innerWidth - 108}px`);
  });
});

describe("Side Panel", () => {
  const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 5)); });
  function T({ modal, onClose: spy }: { modal?: boolean; onClose?: () => void }) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>열기</button>
        <button>뒤</button>
        <SidePanel open={open} modal={modal} title="상세" onClose={() => { setOpen(false); spy?.(); }}><button>안</button></SidePanel>
      </>
    );
  }
  const openIt = async () => { const b = screen.getByRole("button", { name: "열기" }); b.focus(); fireEvent.click(b); await flush(); return b; };
  it("닫혀 있으면 그리지 않는다 · 비모달은 aria-modal 이 없고 배경도 잠금도 없다", async () => {
    render(<T />);
    expect(document.querySelector(".side-panel")).toBeNull();
    await openIt();
    const p = screen.getByRole("dialog", { name: "상세" });
    expect(p.classList.contains("fixed")).toBe(true);
    expect(p.getAttribute("aria-modal")).toBeNull();
    expect(document.querySelector(".side-panel-dim")).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });
  it("열면 패널로 포커스 · Esc 로 닫으면 연 요소로", async () => {
    render(<T />);
    const b = await openIt();
    expect(document.activeElement).toBe(screen.getByRole("dialog"));
    fireEvent.keyDown(document, { key: "Escape" });
    await flush();
    expect(document.querySelector(".side-panel")).toBeNull();
    expect(document.activeElement).toBe(b);
  });
  it("포커스가 뒤 페이지에 있으면 Esc 로 닫지 않고, 닫혀도 포커스를 뺏지 않는다", async () => {
    render(<T />);
    await openIt();
    const out = screen.getByRole("button", { name: "뒤" }); out.focus();
    fireEvent.keyDown(document, { key: "Escape" });
    await flush();
    expect(document.querySelector(".side-panel")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    await flush();
    expect(document.activeElement).toBe(out);
  });
  it("비모달은 Tab 을 가두지 않는다", async () => {
    render(<T />);
    await openIt();
    const inner = screen.getByRole("button", { name: "안" }); inner.focus();
    const ev = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    document.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(false);
  });
  it("모달은 배경 · 잠금 · 가둠, 패널 자신에서 Shift+Tab 도 안에 머문다", async () => {
    render(<T modal />);
    const b = await openIt();
    const p = screen.getByRole("dialog");
    expect(p.getAttribute("aria-modal")).toBe("true");
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.activeElement).toBe(p);
    const ev = new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true });
    document.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "안" }));
    fireEvent.mouseDown(document.querySelector(".side-panel-dim")!);
    await flush();
    expect(document.querySelector(".side-panel")).toBeNull();
    expect(document.body.style.overflow).toBe("");
    expect(document.activeElement).toBe(b);
  });
  it("모달은 포커스 위치와 무관하게 Esc 로 닫는다", async () => {
    const spy = vi.fn();
    render(<T modal onClose={spy} />);
    await openIt();
    screen.getByRole("button", { name: "뒤" }).focus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
