import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { CodeBlock, CopyField, InlineCode } from "../src";

const writeText = vi.fn(() => Promise.resolve());
const setClipboard = (v: unknown) => Object.defineProperty(navigator, "clipboard", { configurable: true, value: v });
const click = async (el: Element) => { await act(async () => { fireEvent.click(el); await Promise.resolve(); await Promise.resolve(); }); };
const live = () => document.querySelector("body > .ds-live")?.textContent;
const tick = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });

beforeEach(() => { vi.useFakeTimers(); writeText.mockClear(); writeText.mockImplementation(() => Promise.resolve()); setClipboard({ writeText }); });
afterEach(() => { vi.useRealTimers(); });

describe("CodeBlock", () => {
  it("names the scroll area and the button by the title", () => {
    render(<CodeBlock title="설치">{"a\nb"}</CodeBlock>);
    const pre = screen.getByLabelText("설치");
    expect(pre.tagName).toBe("PRE");
    expect(pre.getAttribute("tabindex")).toBe("0");
    expect(screen.getByRole("button", { name: "설치 복사" })).toBeTruthy();
  });

  it("copies the whole text and shows the result for two seconds", async () => {
    const onCopy = vi.fn();
    const { container } = render(<CodeBlock title="설치" onCopy={onCopy}>{"a\nb"}</CodeBlock>);
    const btn = container.querySelector(".copy") as HTMLElement;
    await click(btn);
    expect(writeText).toHaveBeenCalledWith("a\nb");
    expect(onCopy).toHaveBeenCalledWith(true);
    expect(btn.classList.contains("copy-done")).toBe(true);
    expect(btn.querySelector(".t")?.textContent).toBe("복사됨");
    tick(60);
    expect(live()).toBe("복사했습니다.");
    tick(1900);
    expect(btn.querySelector(".t")?.textContent).toBe("복사됨");
    tick(100);
    expect(btn.querySelector(".t")?.textContent).toBe("복사");
    expect(btn.classList.contains("copy-done")).toBe(false);
  });

  it("restarts the two seconds when copied again", async () => {
    const { container } = render(<CodeBlock title="설치">a</CodeBlock>);
    const btn = container.querySelector(".copy") as HTMLElement;
    await click(btn);
    tick(1500);
    await click(btn);
    tick(1500);
    expect(btn.querySelector(".t")?.textContent).toBe("복사됨");
  });

  it("wraps and limits the height on request", () => {
    const { container } = render(<CodeBlock title="로그" wrap maxHeight={200}>a</CodeBlock>);
    expect(container.querySelector(".code-view")?.classList.contains("wrap")).toBe(true);
    expect((container.querySelector("pre") as HTMLElement).style.maxHeight).toBe("200px");
  });

  it("scrolls by default, with no height set", () => {
    const { container } = render(<CodeBlock title="로그">a</CodeBlock>);
    expect(container.querySelector(".code-view")?.classList.contains("wrap")).toBe(false);
    expect((container.querySelector("pre") as HTMLElement).getAttribute("style")).toBeNull();
  });

  it("renders text only — no markup inside", () => {
    const { container } = render(<CodeBlock title="로그">{"<b>x</b>"}</CodeBlock>);
    expect(container.querySelector("pre b")).toBeNull();
    expect(container.querySelector("pre code")?.textContent).toBe("<b>x</b>");
  });
});

describe("InlineCode", () => {
  it("renders a code chip", () => {
    const { container } = render(<InlineCode className="x">a.conf</InlineCode>);
    expect(container.querySelector("code.code-inline.x")?.textContent).toBe("a.conf");
  });
});

describe("CopyField", () => {
  it("is a read-only labelled value that copies", async () => {
    const { container } = render(<CopyField label="해시" value="abc" help="도움말" />);
    const input = screen.getByLabelText("해시") as HTMLInputElement;
    expect(input.readOnly).toBe(true);
    expect(input.value).toBe("abc");
    expect(container.querySelector(".field.mono.copy-field")).not.toBeNull();
    expect(container.querySelector(".reveal")).toBeNull();
    await click(screen.getByRole("button", { name: "해시 복사" }));
    expect(writeText).toHaveBeenCalledWith("abc");
  });

  it("hides a secret, copies it whole and stays hidden", async () => {
    render(<CopyField label="API 키" value="secret-1" secret />);
    const input = screen.getByLabelText("API 키") as HTMLInputElement;
    expect(input.type).toBe("password");
    await click(screen.getByRole("button", { name: "API 키 복사" }));
    expect(writeText).toHaveBeenCalledWith("secret-1");
    expect(input.type).toBe("password");
  });

  it("reveals and hides, reporting each, with the focus kept", () => {
    const onReveal = vi.fn();
    render(<CopyField label="API 키" value="s" secret onReveal={onReveal} />);
    const input = screen.getByLabelText("API 키") as HTMLInputElement, eye = screen.getByRole("button", { name: "API 키 보기" });
    eye.focus();
    fireEvent.click(eye);
    expect(input.type).toBe("text");
    expect(eye.getAttribute("aria-pressed")).toBe("true");
    expect(document.activeElement).toBe(eye);
    fireEvent.click(eye);
    expect(input.type).toBe("password");
    expect(onReveal.mock.calls).toEqual([[true], [false]]);
  });

  it("puts reveal before copy", () => {
    const { container } = render(<CopyField label="키" value="s" secret />);
    expect(Array.from(container.querySelectorAll(".affix button")).map((b) => (b.classList.contains("reveal") ? "reveal" : "copy"))).toEqual(["reveal", "copy"]);
  });

  it("inline has an icon button and no input", async () => {
    const { container } = render(<CopyField inline label="IP" value="1.1.1.1" />);
    expect(container.querySelector("span.copy-field.inline .value")?.textContent).toBe("1.1.1.1");
    expect(container.querySelector("input")).toBeNull();
    const btn = screen.getByRole("button", { name: "IP 복사" });
    expect(btn.classList.contains("icon-only")).toBe(true);
    expect(btn.querySelector(".t")).toBeNull();
    await click(btn);
    expect(writeText).toHaveBeenCalledWith("1.1.1.1");
  });

  it("falls back when the clipboard is denied and restores the focus", async () => {
    writeText.mockImplementation(() => Promise.reject(new Error("no")));
    const seen: string[] = [];
    const exec = vi.fn(() => { const a = document.activeElement as HTMLTextAreaElement; seen.push(a.value, (a.parentNode as HTMLElement).className); return true; });
    Object.defineProperty(document, "execCommand", { configurable: true, value: exec });
    const { container } = render(<CopyField label="해시" value="abc" />);
    const btn = container.querySelector(".copy") as HTMLElement;
    btn.focus();
    await click(btn);
    expect(seen).toEqual(["abc", "affix"]);
    expect(btn.classList.contains("copy-done")).toBe(true);
    expect(document.querySelector("textarea")).toBeNull();
    expect(document.activeElement).toBe(btn);
  });

  it("falls back when there is no clipboard API", async () => {
    setClipboard(undefined);
    const exec = vi.fn(() => true);
    Object.defineProperty(document, "execCommand", { configurable: true, value: exec });
    const { container } = render(<CopyField label="해시" value="abc" />);
    await click(container.querySelector(".copy") as Element);
    expect(exec).toHaveBeenCalledWith("copy");
  });

  it("says when copying failed", async () => {
    writeText.mockImplementation(() => Promise.reject(new Error("no")));
    Object.defineProperty(document, "execCommand", { configurable: true, value: () => false });
    const onCopy = vi.fn();
    const { container } = render(<CopyField label="해시" value="abc" onCopy={onCopy} />);
    const btn = container.querySelector(".copy") as HTMLElement;
    await click(btn);
    expect(btn.classList.contains("copy-failed")).toBe(true);
    expect(btn.querySelector(".t")?.textContent).toBe("복사 실패");
    expect(onCopy).toHaveBeenCalledWith(false);
    tick(60);
    expect(live()).toBe("복사하지 못했습니다. 값을 직접 선택해 복사하세요.");
  });

  it("takes labels", async () => {
    const { container } = render(<CopyField label="Key" value="a" secret labels={{ copy: "Copy", copied: "Done", show: "Show", copiedStatus: "Copied." }} />);
    expect(screen.getByRole("button", { name: "Key Show" })).toBeTruthy();
    await click(screen.getByRole("button", { name: "Key Copy" }));
    expect(container.querySelector(".copy .t")?.textContent).toBe("Done");
    tick(60);
    expect(live()).toBe("Copied.");
  });

  it("creates the live region once, before anything is copied", () => {
    document.querySelector("body > .ds-live")?.remove();
    render(<><CopyField label="a" value="1" /><CopyField label="b" value="2" /></>);
    expect(document.querySelectorAll("body > .ds-live").length).toBe(1);
  });
});
