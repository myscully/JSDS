import type { ReactElement } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, ButtonGroup } from "./Button";

describe("Button", () => {
  it("variant × color 클래스를 사이트 마크업과 같게 낸다", () => {
    const cases: [ReactElement, string][] = [
      [<Button>a</Button>, "btn md solid primary"],
      [<Button variant="outline">a</Button>, "btn md outline primary"],
      [<Button color="assistive">a</Button>, "btn md solid assistive"],
      [<Button variant="outline" color="assistive">a</Button>, "btn md outline assistive"],
      [<Button color="negative" size="sm">a</Button>, "btn sm solid negative"],
      [<Button variant="outline" color="negative" size="lg">a</Button>, "btn lg outline negative"],
      [<Button variant="text" color="negative">a</Button>, "btn md text"],   // text 는 정의 밖 — 색은 primary 하나라 color 를 내지 않는다
    ];
    for (const [el, cls] of cases) {
      const { container, unmount } = render(el);
      expect(container.firstElementChild!.className).toBe(cls);
      expect(container.firstElementChild).toHaveAttribute("type", "button");
      unmount();
    }
  });
  it("iconOnly 는 variant 를 생략하면 형태 클래스가 없다(배경 없음), 주면 그 면", () => {
    const { container } = render(<><Button iconOnly color="assistive" aria-label="새로 고침">R</Button><Button iconOnly variant="outline" color="assistive" aria-label="더 보기">D</Button></>);
    const [plain, outline] = [...container.children];
    expect(plain.className).toBe("btn md assistive icon-only");
    expect(outline.className).toBe("btn md outline assistive icon-only");
  });
  it("loading 은 aria-busy + .loading, 포커스는 남기고 click · mousedown · pointerdown · keydown 을 부르지 않는다", async () => {
    const h = { onClick: vi.fn(), onMouseDown: vi.fn(), onPointerDown: vi.fn(), onKeyDown: vi.fn() };
    const parent = vi.fn();
    render(<div onKeyDown={parent} onMouseDown={parent}><Button loading {...h}>저장 중</Button></div>);
    const b = screen.getByRole("button", { name: "저장 중" });
    expect(b).toHaveClass("loading");
    expect(b).toHaveAttribute("aria-busy", "true");
    expect(b).not.toBeDisabled();
    b.focus();
    expect(b).toHaveFocus();
    await userEvent.click(b, { pointerEventsCheck: 0 });
    await userEvent.keyboard("{Enter}{ }");
    fireEvent.mouseDown(b); fireEvent.pointerDown(b); fireEvent.keyDown(b, { key: "a" });
    for (const fn of Object.values(h)) expect(fn).not.toHaveBeenCalled();
    expect(parent).not.toHaveBeenCalled();
  });
  it("loading 중 탐색 키 · 단축키는 부모로 올라가고, 누르는 키 · 문자 키는 막힌다. 캡처 변형도 부르지 않는다", () => {
    const parent = vi.fn(), cap = { onKeyDownCapture: vi.fn(), onMouseDownCapture: vi.fn(), onPointerDownCapture: vi.fn() };
    render(<div onKeyDown={(e) => parent(e.key + (e.ctrlKey ? "+ctrl" : ""))}><Button loading {...cap}>저장 중</Button></div>);
    const b = screen.getByRole("button", { name: "저장 중" });
    for (const key of ["Tab", "Escape", "ArrowDown", "Enter", " ", "a"]) fireEvent.keyDown(b, { key });
    fireEvent.keyDown(b, { key: "k", ctrlKey: true });
    fireEvent.mouseDown(b); fireEvent.pointerDown(b);
    expect(parent.mock.calls.map((c) => c[0])).toEqual(["Tab", "Escape", "ArrowDown", "k+ctrl"]);
    for (const fn of Object.values(cap)) expect(fn).not.toHaveBeenCalled();
  });
  it("옛 prop 은 DOM 에 새지 않고 개발 모드에서 알린다", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const legacy = { icon: true, variant: "secondary" } as unknown as Record<string, never>;
    const { container } = render(<Button {...legacy}>옛</Button>);
    expect(container.firstElementChild).not.toHaveAttribute("icon");
    expect(warn.mock.calls.map((c) => String(c[0])).join("\n")).toMatch(/variant="secondary"[\s\S]*icon prop/);
    warn.mockRestore();
  });
  it("loading 이 끝나면 핸들러가 다시 불린다", async () => {
    const onClick = vi.fn(), onKeyDown = vi.fn();
    const { rerender } = render(<Button loading onClick={onClick} onKeyDown={onKeyDown}>저장</Button>);
    rerender(<Button onClick={onClick} onKeyDown={onKeyDown}>저장</Button>);
    const b = screen.getByRole("button", { name: "저장" });
    await userEvent.click(b);
    fireEvent.keyDown(b, { key: "a" });
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });

  it("disabled 는 disabled 속성, as 와 함께면 aria-disabled", async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>비활성</Button>);
    const b = screen.getByRole("button", { name: "비활성" });
    expect(b).toBeDisabled();
    await userEvent.click(b, { pointerEventsCheck: 0 });
    expect(onClick).not.toHaveBeenCalled();
    /* 링크는 disabled 속성을 못 가진다 — aria-disabled 만 내보내고 클릭은 막지 않고 있었다 */
    const onLink = vi.fn();
    render(<Button as="a" href="#x" disabled onClick={onLink}>링크 비활성</Button>);
    const link = screen.getByRole("link", { name: "링크 비활성" });
    expect(link).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(link, { pointerEventsCheck: 0 });
    expect(onLink).not.toHaveBeenCalled();
  });

  it("block · iconLeft / iconRight 는 라벨 왼쪽 · 오른쪽", () => {
    const { container } = render(<><Button block iconLeft={<i data-testid="L" />}>저장</Button><Button iconRight={<i data-testid="R" />}>다음</Button></>);
    const [a, b] = [...container.children];
    expect(a.className).toBe("btn md solid primary block");
    expect(a.firstElementChild).toHaveAttribute("data-testid", "L");
    expect(b.lastElementChild).toHaveAttribute("data-testid", "R");
  });
  it("as='a' 는 링크로 렌더", () => {
    render(<Button as="a" href="#x">링크</Button>);
    const a = screen.getByRole("link", { name: "링크" });
    expect(a.className).toBe("btn md solid primary");
    expect(a).not.toHaveAttribute("type");
  });
  it("ButtonGroup end · vertical", () => {
    const { container } = render(<><ButtonGroup end><Button>저장</Button></ButtonGroup><ButtonGroup vertical><Button>시작</Button></ButtonGroup></>);
    expect(container.children[0].className).toBe("btn-group end");
    expect(container.children[1].className).toBe("btn-group vertical");
  });
});
