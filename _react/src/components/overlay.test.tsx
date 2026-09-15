import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select, Dropdown, DropdownTrigger, Menu, MenuItem } from "./dropdown/Dropdown";
import { Popup, PopupActions, PopupTitle } from "./popup/Popup";
import { Button } from "./button/Button";
import { ToastProvider, useToast } from "./notification/Notification";
import { Calendar, formatDate } from "./date-picker/DatePicker";

describe("Dropdown / Select", () => {
  it("열기 → 항목 선택 → onChange + 닫힘, Esc·바깥 클릭으로 닫힘", async () => {
    const onChange = vi.fn();
    render(
      <>
        <Select options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} onChange={onChange} placeholder="선택" />
        <button>outside</button>
      </>,
    );
    const trigger = screen.getByRole("button", { name: "선택" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("option", { name: "B" }));
    expect(onChange).toHaveBeenCalledWith("b");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(trigger).toHaveTextContent("B");
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("button", { name: "outside" }));
    expect(screen.queryByRole("listbox")).toBeNull();
  });
  it("방향키로 항목 이동", async () => {
    render(
      <Dropdown kind="menu" defaultOpen>
        <DropdownTrigger>메뉴</DropdownTrigger>
        <Menu>
          <MenuItem>편집</MenuItem>
          <MenuItem disabled>비활성</MenuItem>
          <MenuItem danger>삭제</MenuItem>
        </Menu>
      </Dropdown>,
    );
    await act(async () => { await new Promise((r) => setTimeout(r, 5)); });
    expect(document.activeElement).toHaveTextContent("편집");
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toHaveTextContent("삭제"); // 비활성 건너뜀
    expect(screen.getByRole("menuitem", { name: "비활성" })).toHaveAttribute("aria-disabled", "true");
  });
});

describe("Popup", () => {
  it("Esc · 배경 클릭으로 닫고, 포커스를 트랩/복원한다", async () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <>
        <button>opener</button>
        <Popup open onClose={onClose}>
          <PopupTitle>제목</PopupTitle>
          <PopupActions><Button variant="secondary">취소</Button><Button>확인</Button></PopupActions>
        </Popup>
      </>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog.getAttribute("aria-labelledby")).toBe(screen.getByText("제목").id);
    await act(async () => { await new Promise((r) => setTimeout(r, 5)); });
    expect(document.activeElement).toHaveTextContent("취소");
    await userEvent.tab(); await userEvent.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
    await userEvent.click(document.querySelector(".popup-backdrop")!);
    expect(onClose).toHaveBeenCalledTimes(2);
    rerender(<><button>opener</button><Popup open={false} onClose={onClose}><PopupTitle>제목</PopupTitle></Popup></>);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("ToastProvider", () => {
  function Demo() { const t = useToast(); return <button onClick={() => t.show({ message: "저장됨" })}>show</button>; }
  it("표시 후 duration 뒤 사라지고 max 를 넘지 않는다", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<ToastProvider duration={1000} max={2}><Demo /></ToastProvider>);
    const btn = screen.getByRole("button", { name: "show" });
    await act(async () => { btn.click(); btn.click(); btn.click(); });
    expect(document.querySelectorAll(".toast")).toHaveLength(2);
    await act(async () => { vi.advanceTimersByTime(1200); });
    expect(document.querySelectorAll(".toast")).toHaveLength(0);
    vi.useRealTimers();
  });
});

describe("Calendar", () => {
  it("2026년 9월: 요일 7 + 셀 35, 앞 2일·뒤 3일 muted, 7일 today", () => {
    const { container } = render(<Calendar month={new Date(2026, 8, 1)} value={new Date(2026, 8, 7)} today={new Date(2026, 8, 7)} max={new Date(2026, 8, 30)} />);
    expect(container.querySelectorAll(".dow")).toHaveLength(7);
    const days = container.querySelectorAll(".day");
    expect(days).toHaveLength(35);
    expect(days[0]).toHaveClass("muted"); expect(days[1]).toHaveClass("muted"); expect(days[2]).not.toHaveClass("muted");
    expect(days[34]).toHaveClass("muted"); expect(days[34]).toBeDisabled(); expect(days[0]).not.toBeDisabled();
    const seven = Array.from(days).find((d) => d.textContent === "7" && !d.classList.contains("muted"))!;
    expect(seven).toHaveClass("on", "today");
    expect(seven).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("2026년 9월")).toBeInTheDocument();
    expect(formatDate(new Date(2026, 8, 7))).toBe("2026-09-07");
  });
});
