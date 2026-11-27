import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { CommandPalette, CommandPaletteSurface, Kbd, matchCommand, Popup, type CommandGroup } from "../src";

/* 2026-11-26 — Kbd(운영체제 수정 키) · 명령 팔레트(사이트 ds.js cmdk 와 같은 걸러내기 · 키 · Mod K) */
afterEach(() => vi.restoreAllMocks());

const GROUPS: CommandGroup[] = [
  { label: "이동", items: [
    { icon: "layout-dashboard", label: "대시보드", keywords: "홈 요약 dashboard", value: "nav-dashboard" },
    { icon: "shield", label: "정책", keywords: "policy 규칙", value: "nav-policies" },
  ] },
  { label: "작업", items: [
    { icon: "plus", label: "정책 만들기", keywords: "새 정책 추가 create", value: "policy-new" },
    { icon: "file-export", label: "보고서 내보내기", keywords: "CSV 다운로드 report export", value: "report-export", shortcut: ["/"] },
  ] },
];
const mac = (on: boolean) => vi.spyOn(navigator, "platform", "get").mockReturnValue(on ? "MacIntel" : "Win32");

describe("Kbd", () => {
  it("draws Mod as ⌘ with a hidden name on Mac and Ctrl elsewhere", () => {
    mac(true);
    const a = render(<Kbd keys={["Mod", "K"]} />);
    const mod = a.container.querySelector("[data-kbd-mod]")!;
    expect(mod.querySelector('[aria-hidden="true"]')!.textContent).toBe("⌘");
    expect(mod.querySelector(".sr-only")!.textContent).toBe("Command");
    expect(a.container.querySelectorAll(".kbd-combo > kbd.kbd")).toHaveLength(2);
    a.unmount(); mac(false);
    const b = render(<Kbd keys={["Mod", "K"]} size="sm" menu />);
    const combo = b.container.querySelector(".kbd-combo")!;
    expect(combo.className).toBe("kbd-combo menu-kbd");
    expect(combo.getAttribute("aria-hidden")).toBe("true");
    expect(b.container.querySelector("[data-kbd-mod]")!.textContent).toBe("Ctrl");
    expect(b.container.querySelector("kbd")!.className).toBe("kbd sm");
  });
});

describe("matchCommand", () => {
  it("matches name and keywords without spaces or case, and initials for jamo only", () => {
    const [dash, pol] = GROUPS[0]!.items as [never, never];
    const exp = GROUPS[1]!.items[1]!;
    expect(matchCommand(dash, "ㄷㅅㅂ")).toBe(true);
    expect(matchCommand(exp, "csv")).toBe(true);
    expect(matchCommand(exp, "보고서내보")).toBe(true);
    expect(matchCommand(pol, "백업")).toBe(false);
    expect(matchCommand(pol, "")).toBe(true);
  });
});

describe("CommandPaletteSurface", () => {
  it("shows the empty hint and hides every group when nothing matches", () => {
    const { container } = render(<CommandPaletteSurface groups={GROUPS} defaultQuery="백업" />);
    expect(container.querySelector(".cmdk-empty")!.hasAttribute("hidden")).toBe(false);
    expect([...container.querySelectorAll(".cmdk-group")].every((g) => g.hasAttribute("hidden"))).toBe(true);
    expect(container.querySelector("[role=combobox]")!.hasAttribute("aria-activedescendant")).toBe(false);
  });
});

function Host({ onCommand }: { onCommand: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>열기</button>
      <CommandPalette open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)} groups={GROUPS} onCommand={(v) => onCommand(v)} />
    </>
  );
}
const key = (k: string, o: KeyboardEventInit = {}) => act(() => { document.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true, ...o })); });
const opts = () => [...document.querySelectorAll<HTMLElement>(".cmdk-item:not([hidden])")];
const active = () => document.querySelector(".cmdk-item[aria-selected=true] .cmdk-name")?.textContent;

describe("CommandPalette", () => {
  it("opens with Mod K, filters, moves with arrows, runs on Enter after closing", async () => {
    mac(true);
    const run = vi.fn();
    render(<Host onCommand={run} />);
    key("k", { ctrlKey: true });   // 맥에서 Ctrl K 는 아님
    expect(document.querySelector(".cmdk")).toBeNull();
    key("k", { metaKey: true, shiftKey: true });   // Shift 섞이면 아님
    expect(document.querySelector(".cmdk")).toBeNull();
    key("k", { metaKey: true });
    const input = document.querySelector<HTMLInputElement>(".cmdk-search input")!;
    expect(input).toBeTruthy();
    expect(document.querySelector(".popup.cmdk .popup-close")).toBeNull();   // X 없음
    expect(active()).toBe("대시보드");
    expect(input.getAttribute("aria-activedescendant")).toBe(document.querySelector(".cmdk-item[aria-selected=true]")!.id);
    fireEvent.change(input, { target: { value: "정책" } });
    expect(opts().map((o) => o.querySelector(".cmdk-name")!.textContent)).toEqual(["정책", "정책 만들기"]);
    expect(document.querySelector(".cmdk [role=status]")!.textContent).toBe("결과 2개");
    expect(document.querySelectorAll(".cmdk-group:not([hidden])")).toHaveLength(2);
    fireEvent.keyDown(input, { key: "ArrowUp" });   // 맨 위에서 ↑ 는 맨 아래로
    expect(active()).toBe("정책 만들기");
    fireEvent.keyDown(input, { key: "Home" });
    expect(active()).toBe("정책");
    fireEvent.keyDown(input, { key: "End" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(document.querySelector(".cmdk")).toBeNull();
    expect(run).toHaveBeenCalledWith("policy-new");
  });

  it("stays shut while another modal is open", () => {
    mac(false);
    vi.spyOn(Element.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);   // jsdom 은 늘 빈 목록 — 보이는 대화상자로 친다
    render(<><Host onCommand={() => {}} /><Popup open onClose={() => {}} titleId="x"><h3 id="x">다른 팝업</h3></Popup></>);
    key("k", { ctrlKey: true });
    expect(document.querySelector(".cmdk")).toBeNull();
  });

  it("toggles with Ctrl K off Mac and says when nothing matches", () => {
    mac(false);
    render(<Host onCommand={() => {}} />);
    key("k", { ctrlKey: true });
    const input = document.querySelector<HTMLInputElement>(".cmdk-search input")!;
    fireEvent.change(input, { target: { value: "백업" } });
    expect(document.querySelector(".cmdk [role=status]")!.textContent).toBe("맞는 명령이 없습니다");
    expect(document.querySelector(".cmdk-empty")!.hasAttribute("hidden")).toBe(false);
    key("k", { ctrlKey: true });
    expect(document.querySelector(".cmdk")).toBeNull();
  });
});
