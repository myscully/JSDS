/* Date Picker · Calendar 동작(2026-10-27) — 사이트 ds.js 와 같은 규칙을 React 에서도 잰다 */
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Calendar, DatePicker, parseDate, type DateValue } from "./DatePicker";

const TODAY = new Date(2026, 8, 7);
const ymd = (y: number, m: number, d: number) => new Date(y, m - 1, d);
const cell = (k: string) => document.querySelector<HTMLElement>(`.calendar .day[data-date="${k}"]:not(.muted)`)!;
const openField = async (name = /날짜 선택|~|\d{4}-\d{2}/) => { await userEvent.click(screen.getAllByRole("button", { name }).find((b) => b.classList.contains("field-btn"))!); };

describe("parseDate", () => {
  it("로컬 날짜로 엄격하게 읽는다 — 없는 날짜는 null, 구분자 · 붙여 쓰기 허용", () => {
    expect(parseDate("2026-02-30")).toBeNull();
    expect(parseDate("2026-13-01")).toBeNull();
    expect(parseDate("2026.09.07")?.getDate()).toBe(7);
    expect(parseDate("20260907")?.getMonth()).toBe(8);
  });
});

describe("DatePicker", () => {
  it("기간은 달을 넘겨도 시작이 남는다 — 9/10 → 다음 달 → 10/3 → 적용", async () => {
    const onChange = vi.fn();
    render(<DatePicker label="기간" mode="range" today={TODAY} onChange={onChange} />);
    await openField();
    await userEvent.click(cell("2026-09-10"));
    expect(screen.getByRole("button", { name: "적용" })).toBeDisabled();   // 끝이 없는 기간은 적용할 수 없다
    await userEvent.click(screen.getByRole("button", { name: "다음 달" }));
    await userEvent.click(cell("2026-10-03"));
    await userEvent.click(screen.getByRole("button", { name: "적용" }));
    expect(onChange).toHaveBeenCalledWith({ start: ymd(2026, 9, 10), end: ymd(2026, 10, 3) });
    expect(document.querySelector(".field-btn")!.textContent).toMatch(/2026-09-10\s*~\s*2026-10-03/);
  });

  it("다시 열면 달력이 값의 달에서 시작한다", async () => {
    function Ctl() { const [v, setV] = useState<DateValue>(ymd(2027, 3, 5)); return <><button onClick={() => setV(ymd(2025, 1, 2))}>바꾸기</button><DatePicker value={v} onChange={setV} today={TODAY} /></>; }
    render(<Ctl />);
    await openField();
    expect(screen.getByRole("button", { name: /2027년 3월, 연도 선택/ })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByText("바꾸기"));
    await openField();
    expect(screen.getByRole("button", { name: /2025년 1월, 연도 선택/ })).toBeInTheDocument();
  });

  it("Esc 는 이 피커만 닫고 필드로 포커스, 초안은 버린다", async () => {
    const onChange = vi.fn();
    render(<><DatePicker label="A" today={TODAY} onChange={onChange} /><DatePicker label="B" today={TODAY} open /></>);   /* B 는 열림을 바깥에서 쥔다 — 바깥 클릭으로 닫히는 것은 맞는 동작이라 Esc 만 보려고 */
    const [a] = document.querySelectorAll<HTMLElement>(".datepicker");
    await userEvent.click(a.querySelector(".field-btn")!);
    await userEvent.click(a.querySelector('.day[data-date="2026-09-10"]')!);
    await userEvent.keyboard("{Escape}");
    expect(a).not.toHaveClass("open");
    expect(document.activeElement).toBe(a.querySelector(".field-btn"));
    expect(document.querySelectorAll(".datepicker.open")).toHaveLength(1);   // B 는 그대로
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.click(a.querySelector(".field-btn")!);
    expect(a.querySelector(".day.on")).toBeNull();
  });

  it("팝오버는 이름 있는 모달 대화상자, 격자는 grid > row > gridcell", async () => {
    render(<DatePicker today={TODAY} defaultValue={TODAY} />);
    await openField();
    const dlg = screen.getByRole("dialog", { name: "날짜 선택" });
    expect(dlg).toHaveAttribute("aria-modal", "true");
    const seven = cell("2026-09-07");
    expect(seven).toHaveAttribute("role", "gridcell");
    expect(seven).toHaveAttribute("aria-selected", "true");
    expect(seven).toHaveAttribute("aria-current", "date");
    expect(seven.closest('[role="row"]')!.parentElement).toHaveAttribute("role", "grid");
    expect(document.activeElement).toBe(seven);   // 열면 선택한 날로 포커스
    expect(document.querySelectorAll('.cal-grid [tabindex="0"]')).toHaveLength(1);
  });

  it("키보드 — 화살표 · Home/End · PageDown(말일 고정) · Enter", async () => {
    const onChange = vi.fn();
    render(<DatePicker today={TODAY} defaultValue={ymd(2026, 1, 31)} onChange={onChange} />);
    await openField();
    const focused = () => (document.activeElement as HTMLElement).dataset.date;
    await userEvent.keyboard("{ArrowRight}"); expect(focused()).toBe("2026-02-01");
    await userEvent.keyboard("{ArrowUp}"); expect(focused()).toBe("2026-01-25");
    await userEvent.keyboard("{End}"); expect(focused()).toBe("2026-01-31");
    await userEvent.keyboard("{PageDown}"); expect(focused()).toBe("2026-02-28");
    await userEvent.keyboard("{Home}"); expect(focused()).toBe("2026-02-22");
    await userEvent.keyboard("{Enter}");
    await userEvent.click(screen.getByRole("button", { name: "적용" }));
    expect(onChange).toHaveBeenCalledWith(ymd(2026, 2, 22));
  });

  it("Tab 은 달력 안에서 돈다", async () => {
    render(<DatePicker today={TODAY} />);
    await openField();
    const dlg = screen.getByRole("dialog");
    for (let i = 0; i < 8; i++) { await userEvent.tab(); expect(dlg.contains(document.activeElement)).toBe(true); }
  });

  it("제목 → 연 → 월 → 일", async () => {
    render(<DatePicker today={TODAY} />);
    await openField();
    await userEvent.click(screen.getByRole("button", { name: /2026년 9월, 연도 선택/ }));
    expect(document.querySelectorAll(".cal-grid.years .cell")).toHaveLength(12);
    await userEvent.click(document.querySelector('.cell[data-year="2027"]')!);
    expect(document.querySelectorAll(".cal-grid.months .cell")).toHaveLength(12);
    await userEvent.click(document.querySelector('.cell[data-ym="2027-03"]')!);
    expect(screen.getByRole("button", { name: /2027년 3월, 연도 선택/ })).toBeInTheDocument();
  });

  it("월 모드는 그 달 1일을 확정한다", async () => {
    const onChange = vi.fn();
    render(<DatePicker mode="month" today={TODAY} onChange={onChange} />);
    await openField();
    await userEvent.click(document.querySelector('.cell[data-ym="2026-05"]')!);
    await userEvent.click(screen.getByRole("button", { name: "적용" }));
    expect(onChange).toHaveBeenCalledWith(ymd(2026, 5, 1));
    expect(document.querySelector(".field-btn")!.textContent).toContain("2026-05");
  });

  it("footer={false} 는 고르는 순간 적용하고 닫는다 — 기간은 끝을 고를 때", async () => {
    const one = vi.fn(), rg = vi.fn();
    render(<><DatePicker label="A" footer={false} today={TODAY} onChange={one} /><DatePicker label="B" mode="range" footer={false} today={TODAY} onChange={rg} /></>);
    const [a, b] = document.querySelectorAll<HTMLElement>(".datepicker");
    await userEvent.click(a.querySelector(".field-btn")!);
    expect(a.querySelector(".cal-foot")).toBeNull();
    await userEvent.click(a.querySelector('.day[data-date="2026-09-10"]')!);
    expect(one).toHaveBeenCalledWith(ymd(2026, 9, 10)); expect(a).not.toHaveClass("open");
    await userEvent.click(b.querySelector(".field-btn")!);
    await userEvent.click(b.querySelector('.day[data-date="2026-09-03"]')!);
    expect(b).toHaveClass("open");
    await userEvent.click(b.querySelector('.day[data-date="2026-09-05"]')!);
    expect(rg).toHaveBeenCalledWith({ start: ymd(2026, 9, 3), end: ymd(2026, 9, 5) }); expect(b).not.toHaveClass("open");
  });

  it("취소는 연기 전 값으로, 초기화는 값을 비운다, 오늘은 단일에만", async () => {
    const onChange = vi.fn();
    render(<><DatePicker label="A" footer={["today", "reset", "cancel", "apply"]} defaultValue={TODAY} today={TODAY} onChange={onChange} /><DatePicker label="B" mode="range" footer={["today", "apply"]} today={TODAY} /></>);
    const [a, b] = document.querySelectorAll<HTMLElement>(".datepicker");
    await userEvent.click(a.querySelector(".field-btn")!);
    await userEvent.click(a.querySelector('.day[data-date="2026-09-10"]')!);
    await userEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(onChange).not.toHaveBeenCalled(); expect(a.querySelector(".field-btn")!.textContent).toContain("2026-09-07");
    await userEvent.click(a.querySelector(".field-btn")!);
    await userEvent.click(screen.getByRole("button", { name: "초기화" }));
    await userEvent.click(screen.getByRole("button", { name: "적용" }));
    expect(onChange).toHaveBeenCalledWith(null);
    await userEvent.click(b.querySelector(".field-btn")!);
    expect(b.querySelector('[data-cal="today"]')).toBeNull();
  });

  it("프리셋은 min/max 밖이면 비활성", async () => {
    render(<DatePicker mode="range" today={TODAY} max={TODAY} presets={[{ label: "다음 7일", range: () => [TODAY, ymd(2026, 9, 13)] }, { label: "최근 7일", range: () => [ymd(2026, 9, 1), TODAY] }]} />);
    await openField();
    expect(screen.getByRole("button", { name: "다음 7일" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "최근 7일" })).toBeEnabled();
  });

  it("두 달 보기 — 넓으면 두 달, 767px 이하면 한 달", async () => {
    const { unmount } = render(<DatePicker mode="range" calendars={2} today={TODAY} />);
    await openField();
    expect(document.querySelectorAll(".cal-month")).toHaveLength(2);
    expect(document.querySelector(".calendar")).toHaveClass("two");
    unmount();
    const mm = window.matchMedia;
    window.matchMedia = ((q: string) => ({ matches: q.includes("767"), media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
    render(<DatePicker mode="range" calendars={2} today={TODAY} />);
    await openField();
    expect(document.querySelectorAll(".cal-month")).toHaveLength(0);
    window.matchMedia = mm;
  });

  it("시작을 고른 뒤 올린 날까지 미리보기", async () => {
    render(<DatePicker mode="range" today={TODAY} />);
    await openField();
    await userEvent.click(cell("2026-09-10"));
    fireEvent.pointerOver(cell("2026-09-14"));
    expect(document.querySelectorAll(".day.preview")).toHaveLength(3);
    expect(cell("2026-09-14")).toHaveClass("preview-end");
    fireEvent.pointerLeave(document.querySelector(".calendar")!);
    expect(document.querySelectorAll(".day.preview")).toHaveLength(0);
  });

  it("직접 입력 — Enter 로 확정, 틀리면 오류 문구 · aria-invalid 이고 값은 그대로", async () => {
    const onChange = vi.fn();
    render(<DatePicker allowTyping label="시작일" help="YYYY-MM-DD" min={ymd(2026, 1, 1)} max={ymd(2026, 12, 31)} onChange={onChange} />);
    const input = screen.getByLabelText("시작일") as HTMLInputElement;
    await userEvent.type(input, "20260915{Enter}");
    expect(onChange).toHaveBeenLastCalledWith(ymd(2026, 9, 15)); expect(input.value).toBe("2026-09-15");
    for (const [text, msg] of [["2026-02-30", "날짜 형식이 올바르지 않습니다. 예: 2026-09-07"], ["2025-12-31", "2026-01-01 이후 날짜를 입력하세요"], ["2027-01-01", "2026-12-31 이전 날짜를 입력하세요"]]) {
      await userEvent.clear(input); await userEvent.type(input, `${text}{Enter}`);
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByText(msg)).toHaveClass("help");
    }
    expect(onChange).toHaveBeenCalledTimes(1);
    await userEvent.clear(input); await userEvent.type(input, "2026-09-20{Enter}");
    expect(input).not.toHaveAttribute("aria-invalid"); expect(screen.getByText("YYYY-MM-DD")).toHaveClass("help");
  });

  it("기간 입력 — 뒤집힌 순서는 오류", async () => {
    render(<DatePicker allowTyping mode="range" label="기간" />);
    const input = screen.getByLabelText("기간");
    await userEvent.type(input, "2026-09-12 ~ 2026-09-10{Enter}");
    expect(screen.getByText("종료일이 시작일보다 빠릅니다")).toBeInTheDocument();
  });

  it("크기 · 비활성 · 읽기 전용", async () => {
    render(<><DatePicker label="s" size="sm" /><DatePicker label="d" disabled /><DatePicker allowTyping readOnly label="r" defaultValue={TODAY} /></>);
    const [s, d, r] = document.querySelectorAll<HTMLElement>(".datepicker");
    expect(s).toHaveClass("sm");
    expect(d.querySelector(".field-btn")).toBeDisabled();
    expect(r.querySelector("input")).toHaveAttribute("readonly");
    expect(r.querySelector(".cal-btn")).toBeDisabled();   // 네이티브 disabled 라 클릭 · 키보드가 닿지 않는다
  });

  it("displayText 는 값이 없을 때만", () => {
    render(<><DatePicker mode="range" displayText="최근 24시간" /><DatePicker mode="range" displayText="최근 24시간" defaultValue={{ start: ymd(2026, 9, 1), end: TODAY }} /></>);
    const [a, b] = document.querySelectorAll(".field-btn");
    expect(a.textContent).toContain("최근 24시간");
    expect(b.textContent).toMatch(/2026-09-01\s*~\s*2026-09-07/);
  });
  it("입력칸 → 달력 버튼 → 바깥으로 Tab 해도 친 글자를 검사한다", async () => {
    const onChange = vi.fn();
    render(<><DatePicker allowTyping label="시작일" onChange={onChange} /><button>다음</button></>);
    const input = screen.getByLabelText("시작일");
    await userEvent.type(input, "2026-99-99");
    await userEvent.tab(); await userEvent.tab();
    expect(input).toHaveAttribute("aria-invalid", "true");
    await userEvent.clear(input); await userEvent.type(input, "2026-03-03");
    await userEvent.tab(); await userEvent.tab();
    expect(onChange).toHaveBeenCalledWith(ymd(2026, 3, 3));
  });

  it("연 채로 입력해 확정하면 적용이 그 값을 지킨다", async () => {
    const onChange = vi.fn();
    render(<DatePicker allowTyping label="시작일" defaultValue={TODAY} today={TODAY} onChange={onChange} />);
    const input = screen.getByLabelText("시작일");
    await userEvent.click(screen.getByRole("button", { name: "달력 열기" }));
    await userEvent.clear(input); await userEvent.type(input, "2026-03-15{Enter}");
    expect(screen.getByRole("button", { name: /2026년 3월, 연도 선택/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "적용" }));
    expect(onChange).toHaveBeenLastCalledWith(ymd(2026, 3, 15));
    expect(input).toHaveValue("2026-03-15");
  });

  it("바깥에서 open 을 쥐어도 열 때 지금 값을 보인다", async () => {
    function Ctl() { const [v, setV] = useState<DateValue>(TODAY); const [o, setO] = useState(false); return <><button onClick={() => { setV(ymd(2025, 1, 15)); setO(true); }}>열기</button><DatePicker value={v} onChange={setV} open={o} onOpenChange={setO} today={TODAY} /></>; }
    render(<Ctl />);
    await userEvent.click(screen.getByText("열기"));
    expect(screen.getByRole("button", { name: /2025년 1월, 연도 선택/ })).toBeInTheDocument();
    expect(cell("2025-01-15")).toHaveClass("on");
    await userEvent.click(screen.getByRole("button", { name: "적용" }));
    expect(document.querySelector(".field-btn")!.textContent).toContain("2025-01-15");
  });

  it("다른 달(흐린) 날을 고르면 그 달로 넘어가고, 흐린 칸은 선택으로 칠하지 않는다", async () => {
    render(<DatePicker today={TODAY} />);
    await openField();
    await userEvent.click(document.querySelector('.day.muted[data-date="2026-10-01"]')!);
    expect(screen.getByRole("button", { name: /2026년 10월, 연도 선택/ })).toBeInTheDocument();
    expect(cell("2026-10-01")).toHaveClass("on");
    expect(document.querySelector(".day.muted.on")).toBeNull();
  });

  it("연 · 월 칸은 고른 값만 선택으로 — 값이 없으면 칠하지 않는다, 오늘은 일 화면으로 돌아간다", async () => {
    render(<DatePicker today={TODAY} />);
    await openField();
    await userEvent.click(screen.getByRole("button", { name: /2026년 9월, 연도 선택/ }));
    expect(document.querySelector(".cell.on")).toBeNull();
    expect(document.querySelector('.cell[data-year="2026"]')).toHaveClass("today");
    await userEvent.click(screen.getByRole("button", { name: "오늘" }));
    expect(document.querySelectorAll(".cal-grid.years")).toHaveLength(0);
    expect(cell("2026-09-07")).toHaveClass("on");
  });

  it("적용은 값이 바뀌어야 켜진다", async () => {
    render(<DatePicker today={TODAY} />);
    await openField();
    expect(screen.getByRole("button", { name: "적용" })).toBeDisabled();
    await userEvent.click(cell("2026-09-10"));
    expect(screen.getByRole("button", { name: "적용" })).toBeEnabled();
  });

  it("버튼형 필드의 이름은 라벨 + 값", () => {
    render(<DatePicker label="시작일" defaultValue={TODAY} />);
    expect(screen.getByRole("button", { name: "시작일 2026-09-07" })).toBeInTheDocument();
  });

  it("기간 격자는 여러 칸 선택(aria-multiselectable)", async () => {
    render(<DatePicker mode="range" today={TODAY} defaultValue={{ start: ymd(2026, 9, 1), end: TODAY }} />);
    await openField();
    expect(document.querySelector(".cal-grid")).toHaveAttribute("aria-multiselectable", "true");
  });
});

describe("Calendar (단독)", () => {
  it("단독 달력은 role=group, aria-modal 없음", () => {
    render(<Calendar month={TODAY} today={TODAY} />);
    expect(screen.getByRole("group", { name: "날짜 선택" })).not.toHaveAttribute("aria-modal");
  });
});
