import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Accordion } from "./Accordion";

/* details/summary 는 브라우저가 먼저 DOM 을 토글한다. 제어 모드에서 부모가 값을 움직이지
   않으면 React 는 리렌더를 하지 않으므로 DOM 을 되돌릴 기회가 없다 — 그 자리를 막는다. */
describe("Accordion", () => {
  it("제어 모드: 부모가 open 을 그대로 두면 열리지 않고, onOpenChange 는 한 번만 불린다", async () => {
    const onOpenChange = vi.fn();
    render(
      <Accordion title="고급 설정" open={false} onOpenChange={onOpenChange}>
        내용
      </Accordion>,
    );
    const details = screen.getByText("고급 설정").closest("details") as HTMLDetailsElement;
    expect(details.open).toBe(false);

    await userEvent.click(screen.getByText("고급 설정"));

    expect(details.open).toBe(false);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("제어 모드: 부모가 open 을 바꾸면 따라 열린다", () => {
    const { rerender } = render(<Accordion title="고급 설정" open={false}>내용</Accordion>);
    const details = screen.getByText("고급 설정").closest("details") as HTMLDetailsElement;
    expect(details.open).toBe(false);
    rerender(<Accordion title="고급 설정" open>내용</Accordion>);
    expect(details.open).toBe(true);
  });

  it("비제어 모드: 클릭으로 열리고 onOpenChange 가 함께 불린다", async () => {
    const onOpenChange = vi.fn();
    render(<Accordion title="고급 설정" onOpenChange={onOpenChange}>내용</Accordion>);
    const details = screen.getByText("고급 설정").closest("details") as HTMLDetailsElement;
    expect(details.open).toBe(false);

    await userEvent.click(screen.getByText("고급 설정"));

    expect(details.open).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("disabled 는 tabindex 와 aria-disabled 를 함께 둔다", () => {
    render(<Accordion title="감사 로그" disabled>내용</Accordion>);
    const summary = screen.getByText("감사 로그");
    expect(summary.getAttribute("tabindex")).toBe("-1");
    expect(summary.getAttribute("aria-disabled")).toBe("true");
  });
});
