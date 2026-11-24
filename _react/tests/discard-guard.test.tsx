/* 오버레이 입력 보호(2026-11-23) — 사이트 ds.js 의 discardAsk 와 같은 동작 */
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Button, Popup, PopupActions, PopupTitle, SidePanel } from "../src";

function P({ danger, confirmDiscard, spy }: { danger?: boolean; confirmDiscard?: boolean; spy: () => void }) {
  const [open, setOpen] = useState(true);
  const close = () => { setOpen(false); spy(); };
  return (
    <Popup open={open} onClose={close} danger={danger} confirmDiscard={confirmDiscard}>
      <PopupTitle>이름 바꾸기</PopupTitle>
      <input aria-label="이름" />
      <PopupActions><Button variant="outline" color="assistive" data-popup-close onClick={close}>취소</Button><Button data-popup-close onClick={close}>저장</Button></PopupActions>
    </Popup>
  );
}

describe("Popup 입력 보호", () => {
  it("입력 전 Esc 는 바로 닫는다", async () => {
    const spy = vi.fn(); render(<P spy={spy} />);
    await userEvent.keyboard("{Escape}");
    expect(spy).toHaveBeenCalledTimes(1);
  });
  it("입력한 뒤 Esc · X · 취소는 확인 줄을 띄우고 '계속 편집' 에 포커스, 두 번째 Esc 는 확인만 닫음", async () => {
    const spy = vi.fn(); render(<P spy={spy} />);
    await userEvent.type(screen.getByLabelText("이름"), "a");
    await userEvent.keyboard("{Escape}");
    expect(spy).not.toHaveBeenCalled();
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("notice", "danger", "discard-confirm");
    expect(alert.nextElementSibling).toHaveClass("popup-actions");   // 버튼 줄 바로 위
    expect(screen.getByRole("button", { name: "계속 편집" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByLabelText("이름")).toHaveFocus();   // 입력하던 자리로
    await userEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "계속 편집" }));
    await userEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(spy).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "버리기" }));
    expect(spy).toHaveBeenCalledTimes(1);
  });
  it("주 버튼에 단 닫기 · 위험 확인 · confirmDiscard=false 는 묻지 않는다", async () => {
    const a = vi.fn(); const { unmount } = render(<P spy={a} />);
    await userEvent.type(screen.getByLabelText("이름"), "a");
    await userEvent.click(screen.getByRole("button", { name: "저장" }));
    expect(a).toHaveBeenCalledTimes(1); unmount();
    const b = vi.fn(); const r = render(<P spy={b} danger />);
    await userEvent.type(screen.getByLabelText("이름"), "a");
    await userEvent.keyboard("{Escape}");
    expect(b).toHaveBeenCalledTimes(1); r.unmount();
    const c = vi.fn(); render(<P spy={c} confirmDiscard={false} />);
    await userEvent.type(screen.getByLabelText("이름"), "a");
    await userEvent.keyboard("{Escape}");
    expect(c).toHaveBeenCalledTimes(1);
  });
  it("팝업 안 검색창에 친 것은 입력이 아니다 — 거르기만 했으면 Esc 로 바로 닫는다", async () => {
    const spy = vi.fn();
    function Q() {
      const [open, setOpen] = useState(true);
      return (
        <Popup open={open} onClose={() => { setOpen(false); spy(); }}>
          <PopupTitle>그룹 고르기</PopupTitle>
          <div className="searchbar" role="search"><input type="search" aria-label="그룹 검색" /></div>
        </Popup>
      );
    }
    render(<Q />);
    await userEvent.type(screen.getByLabelText("그룹 검색"), "영업");
    await userEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

function S({ modal, spy }: { modal?: boolean; spy: () => void }) {
  const [open, setOpen] = useState(true);
  const close = () => { setOpen(false); spy(); };
  return (
    <SidePanel open={open} modal={modal} title="예외 추가" onClose={close}
      footer={<Button variant="outline" color="assistive" data-panel-close onClick={close}>취소</Button>}>
      <input aria-label="사유" />
    </SidePanel>
  );
}

describe("모달 Side Panel 입력 보호", () => {
  it("입력 중 배경 클릭은 닫지 않고, 입력 전에는 닫는다", async () => {
    const a = vi.fn(); const r = render(<S modal spy={a} />);
    fireEvent.mouseDown(document.querySelector(".side-panel-dim")!);
    expect(a).toHaveBeenCalledTimes(1); r.unmount();
    const b = vi.fn(); render(<S modal spy={b} />);
    await userEvent.type(screen.getByLabelText("사유"), "a");
    fireEvent.mouseDown(document.querySelector(".side-panel-dim")!);
    expect(b).not.toHaveBeenCalled();
  });
  it("입력한 뒤 Esc · 취소는 바닥글 위 확인 줄, 버리기로 닫힘", async () => {
    const spy = vi.fn(); render(<S modal spy={spy} />);
    await userEvent.type(screen.getByLabelText("사유"), "a");
    await userEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(spy).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").nextElementSibling).toHaveClass("side-panel-footer");
    await act(async () => { await userEvent.keyboard("{Escape}"); });
    expect(screen.queryByRole("alert")).toBeNull();
    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByRole("button", { name: "버리기" }));
    expect(spy).toHaveBeenCalledTimes(1);
  });
  it("비모달 패널은 묻지 않는다", async () => {
    const spy = vi.fn(); render(<S spy={spy} />);
    await userEvent.type(screen.getByLabelText("사유"), "a");
    await userEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
