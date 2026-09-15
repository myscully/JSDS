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
  it("loading 은 aria-busy + .loading, disabled 는 disabled", async () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>저장 중</Button>);
    const b = screen.getByRole("button");
    expect(b).toHaveClass("loading");
    expect(b).toHaveAttribute("aria-busy", "true");
    render(<Button disabled>비활성</Button>);
    expect(screen.getByRole("button", { name: "비활성" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "비활성" }));
    expect(onClick).not.toHaveBeenCalled();
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
