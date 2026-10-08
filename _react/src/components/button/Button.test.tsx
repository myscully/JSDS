import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, ButtonGroup } from "./Button";

describe("Button", () => {
  it("variant/size 클래스를 사이트 마크업과 같게 낸다", () => {
    render(<Button variant="danger-secondary" size="sm">삭제</Button>);
    const b = screen.getByRole("button", { name: "삭제" });
    expect(b.className).toBe("btn sm danger secondary");
    expect(b).toHaveAttribute("type", "button");
  });
  it("loading 은 aria-busy + .loading, 클릭을 삼킨다", async () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>저장 중</Button>);
    const b = screen.getByRole("button", { name: "저장 중" });
    expect(b).toHaveClass("loading");
    expect(b).toHaveAttribute("aria-busy", "true");
    /* 종전 테스트는 disabled 버튼을 눌러 늘 통과했다 — loading 버튼을 직접 눌러야 onClickCapture 가 검증된다 */
    await userEvent.click(b, { pointerEventsCheck: 0 });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("disabled 는 disabled 속성, as 와 함께면 aria-disabled", async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>비활성</Button>);
    const b = screen.getByRole("button", { name: "비활성" });
    expect(b).toBeDisabled();
    await userEvent.click(b, { pointerEventsCheck: 0 });
    expect(onClick).not.toHaveBeenCalled();
    render(<Button as="a" href="#x" disabled>링크 비활성</Button>);
    expect(screen.getByRole("link", { name: "링크 비활성" })).toHaveAttribute("aria-disabled", "true");
  });

  it("block · leading/trailing", () => {
    const { container } = render(<Button block leading={<i data-testid="L" />} trailing={<i data-testid="T" />}>저장</Button>);
    expect(container.firstElementChild!.className).toBe("btn md primary block");
    const kids = [...container.firstElementChild!.children].map((c) => c.getAttribute("data-testid"));
    expect(kids).toEqual(["L", "T"]);
  });
  it("as='a' 는 링크로 렌더", () => {
    render(<Button as="a" href="#x">링크</Button>);
    const a = screen.getByRole("link", { name: "링크" });
    expect(a.className).toBe("btn md primary");
    expect(a).not.toHaveAttribute("type");
  });
  it("ButtonGroup end", () => {
    const { container } = render(<ButtonGroup end><Button>저장</Button></ButtonGroup>);
    expect(container.firstElementChild!.className).toBe("btn-group end");
  });
});
