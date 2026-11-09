import { describe, it, expect, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Field, Form, Popup, Select } from "../src";

const OPTS = [
  { value: "sales", label: "영업팀" },
  { value: "dev", label: "개발팀" },
  { value: "sec", label: "보안팀" },
];
const tick = () => act(() => new Promise<void>((r) => setTimeout(r, 5)));
const trig = (c: HTMLElement) => c.querySelector<HTMLButtonElement>(".trigger")!;

describe("Select", () => {
  it("닫힌 트리거에서 ArrowDown 으로 열고, Tab 은 닫으며 트리거로 돌아간다", async () => {
    const { container } = render(<Select options={OPTS} label="그룹" />);
    fireEvent.keyDown(trig(container), { key: "ArrowDown" });
    await tick();
    expect(container.querySelector(".dropdown")!.className).toContain("open");
    expect(document.activeElement!.textContent).toBe("영업팀");
    fireEvent.keyDown(document.activeElement!, { key: "Tab" });
    await tick();
    expect(container.querySelector(".dropdown")!.className).not.toContain("open");
    expect(document.activeElement).toBe(trig(container));
  });

  it("글자로 항목을 찾는다 — 초성도 맞고 같은 글자를 반복하면 다음으로", async () => {
    const { container } = render(<Select options={[...OPTS, { value: "biz", label: "보상팀" }]} label="그룹" defaultOpen />);
    await tick();
    fireEvent.keyDown(document.activeElement!, { key: "ㅂ" });
    expect(document.activeElement!.textContent).toBe("보안팀");
    fireEvent.keyDown(document.activeElement!, { key: "ㅂ" });
    expect(document.activeElement!.textContent).toBe("보상팀");
    expect(container.querySelector(".dropdown")!.className).toContain("open");
  });

  it("Popup 안에서 Esc 는 Select 만 닫는다", async () => {
    const onClose = vi.fn();
    render(<Popup open onClose={onClose} title="제목"><Select options={OPTS} label="그룹" defaultOpen /></Popup>);
    await tick();
    fireEvent.keyDown(document, { key: "Escape" });
    await tick();
    expect(onClose).not.toHaveBeenCalled();
    expect(document.querySelector(".dropdown.open")).toBeNull();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("값 '' 는 placeholder 로 돌아가고 name 은 숨은 값으로 간다", async () => {
    const { container } = render(<Select name="a" options={[{ value: "", label: "선택 안 함" }, ...OPTS]} defaultValue="dev" placeholder="고르세요" label="그룹" keepMounted />);
    const hidden = container.querySelector<HTMLInputElement>("input[type=hidden]")!;
    expect(hidden.value).toBe("dev");
    fireEvent.click(trig(container));
    await tick();
    fireEvent.click(screen.getByText("선택 안 함"));
    await tick();
    expect(hidden.value).toBe("");
    expect(trig(container).querySelector(".placeholder")!.textContent).toBe("고르세요");
    expect(container.querySelector(".menu-item.on")).toBeNull();
  });

  it("목록 상태 — 불러오는 중 · 실패의 다시 시도 · 옵션 없음", () => {
    const onRetry = vi.fn();
    const { container, rerender } = render(<Select options={OPTS} status="loading" label="그룹" defaultOpen />);
    expect(container.querySelector(".menu-state .spinner")).not.toBeNull();
    expect(container.querySelector(".menu-item")).toBeNull();
    rerender(<Select options={OPTS} status="error" onRetry={onRetry} label="그룹" defaultOpen />);
    fireEvent.click(screen.getByText("다시 시도"));
    expect(onRetry).toHaveBeenCalledTimes(1);
    rerender(<Select options={[]} label="그룹" defaultOpen />);
    expect(container.querySelector(".menu-state")!.textContent).toBe("선택할 수 있는 항목이 없습니다.");
  });

  it("Field 안에서 라벨 · 도움말을 잇는다", () => {
    const { container } = render(<Field label="그룹" help="설명"><Select options={OPTS} label="그룹" /></Field>);
    const t = trig(container), lab = container.querySelector("label")!;
    expect(t.getAttribute("aria-labelledby")).toBe(`${lab.id} ${t.id}`);
    expect(t.getAttribute("aria-describedby")).toBe(container.querySelector(".help")!.id);
  });

  it("검증 — 제출은 막고 첫 오류로, 열었다가 그냥 닫아도 알리고, 고르면 지운다", async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const { container } = render(<Form validate onSubmit={onSubmit}><Field label="그룹" required><Select required name="g" options={OPTS} label="그룹" placeholder="고르세요" keepMounted /></Field><button type="submit">저장</button></Form>);
    const field = container.querySelector(".field")!;
    expect(field.className).not.toContain("error");
    fireEvent.click(trig(container));
    await tick();
    fireEvent.click(trig(container));
    await tick();
    expect(field.querySelector(".help")!.textContent).toBe("필수 항목입니다. 항목을 선택하세요.");
    expect(trig(container).getAttribute("aria-invalid")).toBe("true");
    fireEvent.submit(container.querySelector("form")!);
    await tick();
    expect(onSubmit).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(trig(container));
    fireEvent.click(trig(container));
    await tick();
    fireEvent.click(screen.getByText("개발팀"));
    await tick();
    expect(field.className).not.toContain("error");
    fireEvent.submit(container.querySelector("form")!);
    await tick();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
