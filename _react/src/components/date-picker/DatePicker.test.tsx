/* Date Picker · Calendar 동작 — 사이트 ds.js 와 같은 규칙을 React 에서도 잰다.
   2026-11-09 개편(사람의 요청): TextField 입력 하나 · YYYY. MM. DD 자동 형식 · ↑↓ 조각 · 유효하지 않은 값 상태 · unit · 기간 두 달 · locale · timezone */
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Calendar, DatePicker, DateRangePicker, parseDate } from "./DatePicker";
import { checkText, groups, pasteText, reformat, stepText, type DatePickerMessages } from "./format";
import { LABELS } from "../../labels";

const TODAY = new Date(2026, 8, 7);
const ymd = (y: number, m: number, d: number) => new Date(y, m - 1, d);
const cell = (k: string) => document.querySelector<HTMLElement>(`.calendar .day[data-date="${k}"]:not(.muted)`)!;
const openField = async (host: ParentNode = document) => { await userEvent.click(host.querySelector<HTMLElement>(".datepicker .cal-btn, .cal-btn")!); };
const lastCall = (fn: ReturnType<typeof vi.fn>) => fn.mock.calls[fn.mock.calls.length - 1];
/* 옛 형식(자리표시 없음) — 2026-11-09 전 문구. 앞말 + 예시 · 날짜 + 꼬리말로 이어 붙는다 */
const MSG: DatePickerMessages = { incomplete: "날짜를 끝까지 입력하세요. 예: ", invalid: "없는 날짜입니다. 예: ", min: " 이후 날짜를 입력하세요", max: " 이전 날짜를 입력하세요", long: "기간이 너무 깁니다.", order: "종료일이 시작일보다 빠릅니다" };
/* 기본 문구(템플릿) — DatePicker 가 쓰는 것과 같은 묶음 */
const DEF: DatePickerMessages = { incomplete: LABELS.dateIncompleteError, invalid: LABELS.dateInvalidError, min: LABELS.dateMinError, max: LABELS.dateMaxError, order: LABELS.dateOrderError, long: LABELS.dateLongError, subject: LABELS.dateSubject, startSubject: LABELS.dateStartSubject, endSubject: LABELS.dateEndSubject };

describe("글자 · 검사 (format)", () => {
  it("parseDate 는 로컬 날짜로 엄격하게 — 없는 날짜는 null, 구분자(- . / 공백) · 붙여 쓰기 허용", () => {
    expect(parseDate("2026-02-30")).toBeNull();
    expect(parseDate("2026-13-01")).toBeNull();
    expect(parseDate("2026. 09. 07")?.getDate()).toBe(7);
    expect(parseDate("20260907")?.getMonth()).toBe(8);
  });
  it("숫자를 YYYY. MM. DD 로 끊는다 — 월 2~9 · 일 4~9 는 앞에 0, 기간은 앞 날짜가 차면 ~ 뒤로", () => {
    expect(groups("20260907", "day", false)).toBe("2026. 09. 07");
    expect(groups("20269", "day", false)).toBe("2026. 09");
    expect(groups("2026094", "day", false)).toBe("2026. 09. 04");
    expect(groups("202609071", "day", false)).toBe("2026. 09. 07");   // 넘치는 숫자는 버린다
    expect(groups("2026090120260907", "day", true)).toBe("2026. 09. 01 ~ 2026. 09. 07");
    expect(groups("2026093", "month", false)).toBe("2026. 09");
    expect(groups("202612", "year", false)).toBe("2026");
    expect(pasteText("2026/9/7", "day", false)).toBe("2026. 09. 07");
    expect(pasteText("2026-09-01 ~ 2026-09-07", "day", true)).toBe("2026. 09. 01 ~ 2026. 09. 07");
  });
  it("구분자만 지운 Backspace 는 그 앞 숫자를 지운다", () => {
    expect(reformat("2026. 09.", "2026. 09. ", 9, "deleteContentBackward", "day", false).text).toBe("2026. 0");
    expect(reformat("2026. 09. 0", "2026. 09. 07", 11, "deleteContentBackward", "day", false).text).toBe("2026. 09. 0");
  });
  it("기본 문구는 무엇이 일어났는지 + 고치는 법, 범위는 '부터 · 까지' — 기간은 틀린 쪽 이름(둘 다면 '날짜가' · 예시도 A ~ B)", () => {
    const o = { unit: "day" as const, range: false, min: ymd(2026, 1, 1), max: ymd(2026, 12, 31), messages: DEF }, r = { ...o, range: true };
    expect(checkText("2026. 09", o).message).toBe("날짜가 덜 입력됐습니다. 2026. 09. 07 처럼 끝까지 입력하세요.");
    expect(checkText("2026. 02. 30", o).message).toBe("날짜가 달력에 없습니다. 달력에서 고르거나 2026. 09. 07 처럼 입력하세요.");
    expect(checkText("2025. 12. 31", o).message).toBe("날짜가 범위를 벗어났습니다. 2026. 01. 01 부터 입력할 수 있습니다.");
    expect(checkText("2027. 01. 05", o).message).toBe("날짜가 범위를 벗어났습니다. 2026. 12. 31 까지 입력할 수 있습니다.");
    expect(checkText("2026. 09. 12 ~ 2026. 09. 10", r).message).toBe("종료일이 시작일보다 빠릅니다. 시작일과 같거나 늦은 날짜로 바꾸세요.");
    expect(checkText("2026. 09. 10 ~ 2026. 09", r).message).toBe("종료일이 덜 입력됐습니다. 2026. 09. 07 처럼 끝까지 입력하세요.");
    expect(checkText("2026. 09. 10 ~", r).message).toBe("종료일이 덜 입력됐습니다. 2026. 09. 07 처럼 끝까지 입력하세요.");
    expect(checkText("2026. 02. 30 ~ 2026. 03. 01", r).message).toBe("시작일이 달력에 없습니다. 달력에서 고르거나 2026. 09. 07 처럼 입력하세요.");
    expect(checkText("2026. 09 ~ 2026. 1", r).message).toBe("날짜가 덜 입력됐습니다. 2026. 09. 07 ~ 2026. 09. 07 처럼 끝까지 입력하세요.");
    expect(checkText("2026. 09. 10 ~ 2027. 01. 05", r).message).toBe("종료일이 범위를 벗어났습니다. 2026. 12. 31 까지 입력할 수 있습니다.");
    expect(checkText("2025. 12. 01 ~ 2026. 09. 10", r).message).toBe("시작일이 범위를 벗어났습니다. 2026. 01. 01 부터 입력할 수 있습니다.");
    expect(checkText("2027. 01. 01 ~ 2027. 01. 05", r).message).toBe("날짜가 범위를 벗어났습니다. 2026. 12. 31 까지 입력할 수 있습니다.");
    expect(checkText("2026", { ...o, unit: "month" }).message).toBe("날짜가 덜 입력됐습니다. 2026. 09 처럼 끝까지 입력하세요.");
  });
  it("자리표시로 어순을 정한다 — 다른 언어는 제품이 넣는다", () => {
    const en: DatePickerMessages = { ...DEF, incomplete: "{subject} is incomplete. Type it like {example}.", max: "Pick a date on or before {max}.", subject: "The date", startSubject: "The start date", endSubject: "The end date" };
    const o = { unit: "day" as const, range: true, max: ymd(2026, 12, 31), messages: en };
    expect(checkText("2026. 09. 10 ~ 2026. 09", o).message).toBe("The end date is incomplete. Type it like 2026. 09. 07.");
    expect(checkText("2026. 09. 10 ~ 2027. 01. 05", o).message).toBe("Pick a date on or before 2026. 12. 31.");
    expect(checkText("2026. 09. 10 ~ 2026. 09. 08", o).message).toBe(DEF.order);
  });
  it("옛 형식(자리표시 없는 문자열)은 예전처럼 이어 붙는다 · 검사는 일곱 상태 — 빈 · 미완성 · 없는 날짜 · min · max · 순서 · 유효", () => {
    const o = { unit: "day" as const, range: false, min: ymd(2026, 1, 1), max: ymd(2026, 12, 31), messages: MSG };
    expect(checkText("", o).validity).toBe("empty");
    expect(checkText("2026. 09", o)).toMatchObject({ validity: "incomplete", start: null, message: "날짜를 끝까지 입력하세요. 예: 2026. 09. 07" });
    expect(checkText("2026. 02. 30", o)).toMatchObject({ validity: "invalid", start: null, message: "없는 날짜입니다. 예: 2026. 09. 07" });
    expect(checkText("2025. 12. 31", o)).toMatchObject({ validity: "min", start: ymd(2025, 12, 31), message: "2026. 01. 01 이후 날짜를 입력하세요" });
    expect(checkText("2027. 01. 05", o)).toMatchObject({ validity: "max", start: ymd(2027, 1, 5), message: "2026. 12. 31 이전 날짜를 입력하세요" });
    expect(checkText("2026. 09. 12 ~ 2026. 09. 10", { ...o, range: true })).toMatchObject({ validity: "order", start: ymd(2026, 9, 12), end: ymd(2026, 9, 10) });
    expect(checkText("2026. 09. 07", o)).toMatchObject({ validity: "valid", start: ymd(2026, 9, 7) });
  });
  it("자릿수가 모자라면 미완성 — '2026. 11' 을 1월 1일로, '2026. 09. 3' 을 3일로 읽지 않는다", () => {
    const o = { unit: "day" as const, range: false, messages: MSG };
    expect(parseDate("2026. 11")).toBeNull();
    expect(checkText("2026. 11", o).validity).toBe("incomplete");
    expect(checkText("2026. 09. 3", o).validity).toBe("incomplete");
    expect(checkText("2026. 1", { ...o, unit: "month" }).validity).toBe("incomplete");
  });
  it("↑↓ 는 커서 조각 ±1 — 월은 12 ↔ 1, 말일은 자르고, 빈 조각은 오늘로", () => {
    expect(stepText("2026. 12. 15", 7, 1, "day", false, TODAY)).toEqual({ text: "2026. 01. 15", caret: 8 });
    expect(stepText("2026. 01. 31", 7, 1, "day", false, TODAY).text).toBe("2026. 02. 28");
    expect(stepText("2026. 09. 30", 11, 1, "day", false, TODAY).text).toBe("2026. 09. 01");
    expect(stepText("2026. 09. 07", 2, -1, "day", false, TODAY).text).toBe("2025. 09. 07");
    expect(stepText("", 0, 1, "day", false, TODAY).text).toBe("2026. 09. 07");
    expect(stepText("2026. 09. 01 ~ 2026. 09. 07", 22, 1, "day", true, TODAY).text).toBe("2026. 09. 01 ~ 2026. 10. 07");
  });
});

describe("DatePicker — 입력", () => {
  it("TextField 위에 그린다 — 숫자만 치면 YYYY. MM. DD, Enter 로 확정", async () => {
    const onChange = vi.fn();
    render(<DatePicker label="점검일" onChange={onChange} />);
    const input = screen.getByLabelText("점검일") as HTMLInputElement;
    expect(input.closest(".field")).toHaveClass("datepicker");
    expect(input).toHaveAttribute("placeholder", "YYYY. MM. DD");
    await userEvent.type(input, "20269");
    expect(input.value).toBe("2026. 09");
    await userEvent.type(input, "7{Enter}");
    expect(input.value).toBe("2026. 09. 07");
    expect(lastCall(onChange)).toEqual([ymd(2026, 9, 7), { text: "2026. 09. 07", validity: "valid" }]);
  });

  it("키보드로는 범위 밖 값도 들어간다 — ↑ 로 연을 넘기면 값은 그 날짜, validity max · 오류 문구", async () => {
    const onChange = vi.fn();
    render(<DatePicker label="점검일" help="2026년 안의 날짜" min={ymd(2026, 1, 1)} max={ymd(2026, 12, 31)} defaultValue={ymd(2026, 9, 7)} onChange={onChange} />);
    const input = screen.getByLabelText("점검일") as HTMLInputElement;
    input.focus(); input.setSelectionRange(2, 2);
    await userEvent.keyboard("{ArrowUp}");
    expect(input.value).toBe("2027. 09. 07");
    expect(lastCall(onChange)).toEqual([ymd(2027, 9, 7), { text: "2027. 09. 07", validity: "max" }]);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("날짜가 범위를 벗어났습니다. 2026. 12. 31 까지 입력할 수 있습니다.")).toHaveClass("help");
    expect(input.closest(".datepicker")).toHaveAttribute("data-validity", "max");
    await userEvent.keyboard("{ArrowDown}");
    expect(lastCall(onChange)[1].validity).toBe("valid");
    expect(screen.getByText("2026년 안의 날짜")).toHaveClass("help");
  });

  it("직접 쳐도 범위 밖이 들어가고, 달력은 그 달을 열어 선택을 보인다 — 칸은 고를 수 없다", async () => {
    const onChange = vi.fn();
    render(<DatePicker label="점검일" max={ymd(2026, 12, 31)} today={TODAY} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("점검일"), "20270105{Enter}");
    expect(lastCall(onChange)).toEqual([ymd(2027, 1, 5), { text: "2027. 01. 05", validity: "max" }]);
    await openField();
    expect(screen.getByRole("button", { name: /2027년 1월, 연도 선택/ })).toBeInTheDocument();
    expect(cell("2027-01-05")).toHaveClass("on");
    expect(cell("2027-01-06")).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(cell("2027-01-06"));
    expect(cell("2027-01-06")).not.toHaveClass("on");
  });

  it("덜 친 · 없는 날짜는 Invalid Date — 오류는 Enter · 포커스가 떠날 때 보인다", async () => {
    const onChange = vi.fn();
    render(<><DatePicker label="시작일" onChange={onChange} /><button>다음</button></>);
    const input = screen.getByLabelText("시작일");
    await userEvent.type(input, "202609");
    expect(input).not.toHaveAttribute("aria-invalid");   // 치는 동안은 조용하다
    await userEvent.tab(); await userEvent.tab();
    const [v, info] = lastCall(onChange);
    expect(v).toBeInstanceOf(Date); expect(isNaN(v.getTime())).toBe(true);
    expect(info).toEqual({ text: "2026. 09", validity: "incomplete" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("날짜가 덜 입력됐습니다. 2026. 09. 07 처럼 끝까지 입력하세요.")).toBeInTheDocument();
    await userEvent.clear(input); await userEvent.type(input, "20260230{Enter}");
    expect(lastCall(onChange)[1].validity).toBe("invalid");
    expect(screen.getByText("날짜가 달력에 없습니다. 달력에서 고르거나 2026. 09. 07 처럼 입력하세요.")).toBeInTheDocument();
  });

  it("defaultText 로 덜 친 글자를 처음부터 보인다 — 오류와 함께", () => {
    render(<DatePicker label="시작일" defaultText="2026. 09" help="점검을 시작한 날" />);
    expect(screen.getByLabelText("시작일")).toHaveValue("2026. 09");
    expect(screen.getByLabelText("시작일")).toHaveAttribute("aria-invalid", "true");
  });

  it("붙여 넣은 2026-9-7 도 형식으로 바꾼다", async () => {
    render(<DatePicker label="점검일" />);
    const input = screen.getByLabelText("점검일");
    input.focus();
    await userEvent.paste("2026-9-7");
    expect(input).toHaveValue("2026. 09. 07");
  });

  it("입력칸 → 달력 버튼 → 바깥으로 Tab 해도 친 글자를 검사한다", async () => {
    const onChange = vi.fn();
    render(<><DatePicker label="시작일" onChange={onChange} /><button>다음</button></>);
    const input = screen.getByLabelText("시작일");
    await userEvent.type(input, "20260303");
    await userEvent.tab(); await userEvent.tab();
    expect(lastCall(onChange)[0]).toEqual(ymd(2026, 3, 3));
  });

  it("연 채로 입력해 확정하면 적용이 그 값을 지킨다", async () => {
    const onChange = vi.fn();
    render(<DatePicker label="시작일" defaultValue={TODAY} today={TODAY} onChange={onChange} />);
    const input = screen.getByLabelText("시작일");
    await openField();
    await userEvent.clear(input); await userEvent.type(input, "20260315{Enter}");
    expect(screen.getByRole("button", { name: /2026년 3월, 연도 선택/ })).toBeInTheDocument();
    expect(input).toHaveValue("2026. 03. 15");
    expect(screen.getByRole("button", { name: "적용" })).toBeDisabled();   // 입력으로 이미 확정 — 같은 값이다
    expect(lastCall(onChange)[0]).toEqual(ymd(2026, 3, 15));
  });

  it("크기 · 비활성 · 읽기 전용", async () => {
    render(<><DatePicker label="s" size="sm" /><DatePicker label="d" disabled /><DatePicker readOnly label="r" defaultValue={TODAY} /></>);
    const [s, d, r] = document.querySelectorAll<HTMLElement>(".datepicker");
    expect(s).toHaveClass("sm");
    expect(d.querySelector("input")).toBeDisabled(); expect(d.querySelector(".cal-btn")).toBeDisabled();
    expect(r.querySelector("input")).toHaveAttribute("readonly");
    expect(r.querySelector(".cal-btn")).toBeDisabled();   // 네이티브 disabled 라 클릭 · 키보드가 닿지 않는다
  });
});

describe("DatePicker — 단위 · 달력", () => {
  it("unit — year 는 YYYY 와 연도 목록(제목은 글자), month 는 YYYY. MM 과 월 목록", async () => {
    const y = vi.fn(), m = vi.fn();
    render(<><DatePicker label="연" unit="year" today={TODAY} onChange={y} /><DatePicker label="월" unit="month" today={TODAY} onChange={m} /></>);
    const [a, b] = document.querySelectorAll<HTMLElement>(".datepicker");
    expect(screen.getByLabelText("연")).toHaveAttribute("placeholder", "YYYY");
    expect(screen.getByLabelText("월")).toHaveAttribute("placeholder", "YYYY. MM");
    await openField(a);
    expect(a.querySelectorAll(".cal-grid.years .cell")).toHaveLength(12);
    expect(a.querySelector(".cal-title")!.tagName).toBe("SPAN");
    await userEvent.click(a.querySelector('.cell[data-year="2025"]')!);
    await userEvent.click(screen.getByRole("button", { name: "적용" }));
    expect(lastCall(y)).toEqual([ymd(2025, 1, 1), { text: "2025", validity: "valid" }]);
    await openField(b);
    expect(b.querySelectorAll(".cal-grid.months .cell")).toHaveLength(12);
    await userEvent.click(b.querySelector('.cell[data-ym="2026-05"]')!);
    await userEvent.click(screen.getByRole("button", { name: "적용" }));
    expect(lastCall(m)).toEqual([ymd(2026, 5, 1), { text: "2026. 05", validity: "valid" }]);
    await userEvent.type(screen.getByLabelText("월"), "{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}{Backspace}2027{Enter}");
    expect(lastCall(m)[1].validity).toBe("incomplete");
  });

  it("팝오버는 이름 있는 모달 대화상자, 격자는 grid > row > gridcell — 단일은 달력 하나", async () => {
    render(<DatePicker today={TODAY} defaultValue={TODAY} />);
    await openField();
    const dlg = screen.getByRole("dialog", { name: "날짜 선택" });
    expect(dlg).toHaveAttribute("aria-modal", "true");
    expect(dlg).not.toHaveClass("two");
    const seven = cell("2026-09-07");
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
    expect(lastCall(onChange)[0]).toEqual(ymd(2026, 2, 22));
  });

  it("Tab 은 달력 안에서 돈다 · Esc 는 이 피커만 닫고 달력 버튼으로, 초안은 버린다", async () => {
    const onChange = vi.fn();
    render(<><DatePicker label="A" today={TODAY} onChange={onChange} /><DatePicker label="B" today={TODAY} open /></>);
    const [a] = document.querySelectorAll<HTMLElement>(".datepicker");
    await openField(a);
    const dlg = a.querySelector(".calendar")!;
    for (let i = 0; i < 6; i++) { await userEvent.tab(); expect(dlg.contains(document.activeElement)).toBe(true); }
    await userEvent.click(a.querySelector('.day[data-date="2026-09-10"]')!);
    await userEvent.keyboard("{Escape}");
    expect(a).not.toHaveClass("open");
    expect(document.activeElement).toBe(a.querySelector(".cal-btn"));
    expect(document.querySelectorAll(".datepicker.open")).toHaveLength(1);   // B 는 그대로
    expect(onChange).not.toHaveBeenCalled();
  });

  it("제목 → 연 → 월 → 일", async () => {
    render(<DatePicker today={TODAY} />);
    await openField();
    await userEvent.click(screen.getByRole("button", { name: /2026년 9월, 연도 선택/ }));
    expect(document.querySelectorAll(".cal-grid.years .cell")).toHaveLength(12);
    await userEvent.click(document.querySelector('.cell[data-year="2027"]')!);
    await userEvent.click(document.querySelector('.cell[data-ym="2027-03"]')!);
    expect(screen.getByRole("button", { name: /2027년 3월, 연도 선택/ })).toBeInTheDocument();
  });

  it("footer={false} 는 고르는 순간 적용하고 닫는다 — 기간은 끝을 고를 때", async () => {
    const one = vi.fn(), rg = vi.fn();
    render(<><DatePicker label="A" footer={false} today={TODAY} onChange={one} /><DateRangePicker label="B" footer={false} today={TODAY} onChange={rg} /></>);
    const [a, b] = document.querySelectorAll<HTMLElement>(".datepicker");
    await openField(a);
    expect(a.querySelector(".cal-foot")).toBeNull();
    await userEvent.click(a.querySelector('.day[data-date="2026-09-10"]')!);
    expect(lastCall(one)[0]).toEqual(ymd(2026, 9, 10)); expect(a).not.toHaveClass("open");
    await openField(b);
    await userEvent.click(b.querySelector('.day[data-date="2026-09-03"]')!);
    expect(b).toHaveClass("open");
    await userEvent.click(b.querySelector('.day[data-date="2026-09-05"]')!);
    expect(lastCall(rg)).toEqual([{ start: ymd(2026, 9, 3), end: ymd(2026, 9, 5) }, { text: "2026. 09. 03 ~ 2026. 09. 05", validity: "valid", sides: { start: "valid", end: "valid" } }]);
    expect(b).not.toHaveClass("open");
  });

  it("취소는 열기 전 값으로, 초기화는 값을 비운다, 오늘은 단일에만", async () => {
    const onChange = vi.fn();
    render(<><DatePicker label="A" footer={["today", "reset", "cancel", "apply"]} defaultValue={TODAY} today={TODAY} onChange={onChange} /><DateRangePicker label="B" footer={["today", "apply"]} today={TODAY} /></>);
    const [a, b] = document.querySelectorAll<HTMLElement>(".datepicker");
    await openField(a);
    await userEvent.click(a.querySelector('.day[data-date="2026-09-10"]')!);
    await userEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(onChange).not.toHaveBeenCalled(); expect(screen.getByLabelText("A")).toHaveValue("2026. 09. 07");
    await openField(a);
    await userEvent.click(screen.getByRole("button", { name: "초기화" }));
    await userEvent.click(screen.getByRole("button", { name: "적용" }));
    expect(lastCall(onChange)).toEqual([null, { text: "", validity: "empty" }]);
    await openField(b);
    expect(b.querySelector('[data-cal="today"]')).toBeNull();
  });

  it("적용은 값이 바뀌어야 켜진다 · 다른 달(흐린) 날을 고르면 그 달로", async () => {
    render(<DatePicker today={TODAY} />);
    await openField();
    expect(screen.getByRole("button", { name: "적용" })).toBeDisabled();
    await userEvent.click(document.querySelector('.day.muted[data-date="2026-10-01"]')!);
    expect(screen.getByRole("button", { name: /2026년 10월, 연도 선택/ })).toBeInTheDocument();
    expect(cell("2026-10-01")).toHaveClass("on");
    expect(screen.getByRole("button", { name: "적용" })).toBeEnabled();
  });

  it("연 · 월 칸은 고른 값만 선택으로, 오늘은 일 화면으로 돌아간다", async () => {
    render(<DatePicker today={TODAY} />);
    await openField();
    await userEvent.click(screen.getByRole("button", { name: /2026년 9월, 연도 선택/ }));
    expect(document.querySelector(".cell.on")).toBeNull();
    expect(document.querySelector('.cell[data-year="2026"]')).toHaveClass("today");
    await userEvent.click(screen.getByRole("button", { name: "오늘" }));
    expect(document.querySelectorAll(".cal-grid.years")).toHaveLength(0);
    expect(cell("2026-09-07")).toHaveClass("on");
  });

  it("바깥에서 value · open 을 쥐어도 열 때 지금 값을 보인다", async () => {
    function Ctl() { const [v, setV] = useState<Date | null>(TODAY); const [o, setO] = useState(false); return <><button onClick={() => { setV(ymd(2025, 1, 15)); setO(true); }}>열기</button><DatePicker label="값" value={v} onChange={setV} open={o} onOpenChange={setO} today={TODAY} /></>; }
    render(<Ctl />);
    expect(screen.getByLabelText("값")).toHaveValue("2026. 09. 07");
    await userEvent.click(screen.getByText("열기"));
    expect(screen.getByLabelText("값")).toHaveValue("2025. 01. 15");
    expect(screen.getByRole("button", { name: /2025년 1월, 연도 선택/ })).toBeInTheDocument();
    expect(cell("2025-01-15")).toHaveClass("on");
  });

  it("labels 로 문구를 바꾼다", async () => {
    render(<DatePicker today={TODAY} labels={{ apply: "확인", openCalendar: "달력" }} />);
    await userEvent.click(screen.getByRole("button", { name: "달력" }));
    expect(screen.getByRole("button", { name: "확인" })).toBeInTheDocument();
  });
});

describe("DateRangePicker", () => {
  it("달력 두 개가 기본 — 767px 이하면 하나, calendars={1} 이면 하나", async () => {
    const { unmount } = render(<DateRangePicker label="기간" today={TODAY} />);
    expect(screen.getByLabelText("기간")).toHaveAttribute("placeholder", "YYYY. MM. DD ~ YYYY. MM. DD");
    await openField();
    expect(document.querySelectorAll(".cal-month")).toHaveLength(2);
    expect(document.querySelector(".calendar")).toHaveClass("two");
    expect(document.querySelector(".cal-grid")).toHaveAttribute("aria-multiselectable", "true");
    unmount();
    const r1 = render(<DateRangePicker today={TODAY} calendars={1} />);
    await openField();
    expect(document.querySelectorAll(".cal-month")).toHaveLength(0);
    r1.unmount();
    const mm = window.matchMedia;
    window.matchMedia = ((q: string) => ({ matches: q.includes("767"), media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
    render(<DateRangePicker today={TODAY} />);
    await openField();
    expect(document.querySelectorAll(".cal-month")).toHaveLength(0);
    window.matchMedia = mm;
  });

  it("단독 기간 달력 — 두 달이 기본, 767px 이하면 한 달이고 창 크기를 따라감, calendars 를 주면 그대로", () => {
    const mm = window.matchMedia;
    let narrow = false; const subs: Array<() => void> = [];
    window.matchMedia = ((q: string) => ({ get matches() { return narrow && q.includes("767"); }, media: q, addEventListener: (_: string, f: () => void) => subs.push(f), removeEventListener() {} })) as unknown as typeof window.matchMedia;
    const month = new Date(2026, 8, 1), value = { start: new Date(2026, 8, 21), end: null };
    const r = render(<Calendar month={month} mode="range" value={value} today={TODAY} />);
    expect(document.querySelectorAll(".cal-month")).toHaveLength(2);
    narrow = true; act(() => subs.forEach((f) => f()));
    expect(document.querySelectorAll(".cal-month")).toHaveLength(0);
    expect(document.querySelector(".calendar")).not.toHaveClass("two");
    r.unmount();
    render(<Calendar month={month} mode="range" value={value} today={TODAY} calendars={2} />);
    expect(document.querySelectorAll(".cal-month")).toHaveLength(2);
    window.matchMedia = mm;
  });

  it("기간은 달을 넘겨도 시작이 남는다 — 9/10 → 다음 달 → 10/3 → 적용", async () => {
    const onChange = vi.fn();
    render(<DateRangePicker label="기간" today={TODAY} calendars={1} onChange={onChange} />);
    await openField();
    await userEvent.click(cell("2026-09-10"));
    expect(screen.getByRole("button", { name: "적용" })).toBeDisabled();   // 끝이 없는 기간은 적용할 수 없다
    await userEvent.click(screen.getByRole("button", { name: "다음 달" }));
    await userEvent.click(cell("2026-10-03"));
    await userEvent.click(screen.getByRole("button", { name: "적용" }));
    expect(lastCall(onChange)[0]).toEqual({ start: ymd(2026, 9, 10), end: ymd(2026, 10, 3) });
    expect(screen.getByLabelText("기간")).toHaveValue("2026. 09. 10 ~ 2026. 10. 03");
  });

  it("입력 — 앞 날짜가 차면 ~ 뒤로, 뒤집힌 순서는 order(값은 남는다)", async () => {
    const onChange = vi.fn();
    render(<DateRangePicker label="기간" onChange={onChange} />);
    const input = screen.getByLabelText("기간");
    await userEvent.type(input, "2026091220260910");
    expect(input).toHaveValue("2026. 09. 12 ~ 2026. 09. 10");
    await userEvent.type(input, "{Enter}");
    expect(lastCall(onChange)).toEqual([{ start: ymd(2026, 9, 12), end: ymd(2026, 9, 10) }, { text: "2026. 09. 12 ~ 2026. 09. 10", validity: "order", sides: { start: "valid", end: "valid" } }]);
    expect(screen.getByText("종료일이 시작일보다 빠릅니다. 시작일과 같거나 늦은 날짜로 바꾸세요.")).toBeInTheDocument();
  });

  it("info.sides 는 시작 · 끝 각각의 상태 — 비운 쪽 empty, 덜 친 쪽 incomplete, 범위 밖인 쪽 max", async () => {
    const onChange = vi.fn();
    render(<DateRangePicker label="기간" max={ymd(2026, 12, 31)} onChange={onChange} />);
    const input = screen.getByLabelText("기간");
    await userEvent.type(input, "20260910{Enter}");
    expect(lastCall(onChange)[1]).toEqual({ text: "2026. 09. 10", validity: "incomplete", sides: { start: "valid", end: "empty" } });
    await userEvent.type(input, "202701{Enter}");
    expect(lastCall(onChange)[1]).toEqual({ text: "2026. 09. 10 ~ 2027. 01", validity: "incomplete", sides: { start: "valid", end: "incomplete" } });
    await userEvent.type(input, "05{Enter}");
    expect(lastCall(onChange)[1]).toEqual({ text: "2026. 09. 10 ~ 2027. 01. 05", validity: "max", sides: { start: "valid", end: "max" } });
    expect(screen.getByText("종료일이 범위를 벗어났습니다. 2026. 12. 31 까지 입력할 수 있습니다.")).toHaveClass("help");
    expect(checkText("2026. 02. 30 ~ 2026. 03. 01", { unit: "day", range: true, messages: MSG }).sides).toEqual({ start: "invalid", end: "valid" });
  });

  it("messages 는 일부만 바꿔도 된다 — 나머지는 기본 문구, 자리표시는 같은 규칙", async () => {
    render(<DateRangePicker label="기간" max={ymd(2026, 12, 31)} messages={{ max: "Pick a date on or before {max}.", endSubject: "The end date" }} />);
    const input = screen.getByLabelText("기간");
    await userEvent.type(input, "2027010520270106{Enter}");
    expect(screen.getByText("Pick a date on or before 2026. 12. 31.")).toHaveClass("help");
    await userEvent.clear(input);
    await userEvent.type(input, "20260910202609{Enter}");
    expect(screen.getByText("The end date 덜 입력됐습니다. 2026. 09. 07 처럼 끝까지 입력하세요.")).toHaveClass("help");
  });

  it("시작을 고른 뒤 올린 날까지 미리보기 · 프리셋은 min/max 밖이면 비활성", async () => {
    render(<DateRangePicker today={TODAY} max={TODAY} presets={[{ label: "다음 7일", range: () => [TODAY, ymd(2026, 9, 13)] }, { label: "최근 7일", range: () => [ymd(2026, 9, 1), TODAY] }]} />);
    await openField();
    expect(screen.getByRole("button", { name: "다음 7일" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "최근 7일" })).toBeEnabled();
    await userEvent.click(cell("2026-09-01"));
    fireEvent.pointerOver(cell("2026-09-05"));
    expect(document.querySelectorAll(".day.preview")).toHaveLength(3);
    expect(cell("2026-09-05")).toHaveClass("preview-end");
    fireEvent.pointerLeave(document.querySelector(".calendar")!);
    expect(document.querySelectorAll(".day.preview")).toHaveLength(0);
  });

  it("월 단위 기간은 월 목록 하나 — 사이 칸은 .in-range", async () => {
    const onChange = vi.fn();
    render(<DateRangePicker unit="month" today={TODAY} onChange={onChange} />);
    await openField();
    expect(document.querySelectorAll(".cal-month")).toHaveLength(0);
    await userEvent.click(document.querySelector('.cell[data-ym="2026-03"]')!);
    await userEvent.click(document.querySelector('.cell[data-ym="2026-06"]')!);
    expect(document.querySelectorAll(".cell.in-range")).toHaveLength(2);
    await userEvent.click(screen.getByRole("button", { name: "적용" }));
    expect(lastCall(onChange)).toEqual([{ start: ymd(2026, 3, 1), end: ymd(2026, 6, 1) }, { text: "2026. 03 ~ 2026. 06", validity: "valid", sides: { start: "valid", end: "valid" } }]);
  });
});

describe("locale · timezone", () => {
  it("locale — 제목 · 요일 · 월 이름 · '오늘' 이 Intl 표기, 입력 형식은 그대로", async () => {
    render(<DatePicker label="date" locale="en-US" today={TODAY} />);
    expect(screen.getByLabelText("date")).toHaveAttribute("placeholder", "YYYY. MM. DD");
    await openField();
    expect(screen.getByRole("button", { name: /^September 2026, / })).toBeInTheDocument();
    expect(Array.from(document.querySelectorAll(".dow")).map((d) => d.textContent).join("")).toBe("SMTWTFS");
    expect(screen.getByRole("button", { name: "Today" })).toBeInTheDocument();
    expect(cell("2026-09-07")).toHaveAttribute("aria-label", "Monday, September 7, 2026");
  });

  it("timezone — 같은 순간에도 오늘이 다르고, 값은 그 시간대의 0시", async () => {
    const at = new Date("2026-10-27T01:00:00Z");   // 서울 10:00 · UTC 01:00 · 뉴욕 전날 21:00
    const utc = vi.fn(), ny = vi.fn();
    render(<><DatePicker label="utc" timezone="UTC" today={at} footer={["today"]} onChange={utc} /><DatePicker label="ny" timezone="America/New_York" today={at} footer={["today"]} onChange={ny} /></>);
    const [a, b] = document.querySelectorAll<HTMLElement>(".datepicker");
    await openField(a);
    expect(a.querySelector(".day.today")).toHaveAttribute("data-date", "2026-10-27");
    await userEvent.click(screen.getByRole("button", { name: "오늘" }));
    expect(lastCall(utc)[0].toISOString()).toBe("2026-10-27T00:00:00.000Z");
    await openField(b);
    expect(b.querySelector(".day.today")).toHaveAttribute("data-date", "2026-10-26");
    await userEvent.click(screen.getByRole("button", { name: "오늘" }));
    expect(lastCall(ny)[0].toISOString()).toBe("2026-10-26T04:00:00.000Z");   // 뉴욕 0시(EDT)
  });

  it("값 Date 는 그 시간대의 날짜로 보인다 · 틀린 시간대 이름은 경고하고 환경 시간대로", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<><DatePicker label="utc" timezone="UTC" defaultValue={new Date("2026-09-07T00:00:00Z")} /><DatePicker label="bad" timezone="Mars/Olympus" /></>);
    expect(screen.getByLabelText("utc")).toHaveValue("2026. 09. 07");
    expect(warn.mock.calls.some(([m]) => String(m).includes("Mars/Olympus"))).toBe(true);
    warn.mockRestore();
  });
});

describe("옛 prop", () => {
  it("mode=\"month\" · mode=\"range\" · allowTyping · displayText 는 경고하고 새 방식으로 동작한다", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<><DatePicker label="m" mode="month" today={TODAY} /><DatePicker label="r" mode="range" today={TODAY} /><DatePicker label="t" allowTyping displayText="최근 7일" /></>);
    expect(screen.getByLabelText("m")).toHaveAttribute("placeholder", "YYYY. MM");
    expect(screen.getByLabelText("r")).toHaveAttribute("placeholder", "YYYY. MM. DD ~ YYYY. MM. DD");
    const msgs = warn.mock.calls.map(([m]) => String(m)).join("\n");
    for (const k of ['mode="month"', 'mode="range"', "allowTyping", "displayText"]) expect(msgs).toContain(k);
    warn.mockRestore();
  });
});

describe("Calendar (단독)", () => {
  it("단독 달력은 role=group, aria-modal 없음 · 기간은 두 달이 기본", () => {
    const { unmount } = render(<Calendar month={TODAY} today={TODAY} />);
    expect(screen.getByRole("group", { name: "날짜 선택" })).not.toHaveAttribute("aria-modal");
    unmount();
    render(<Calendar month={TODAY} today={TODAY} mode="range" value={{ start: ymd(2026, 9, 21), end: ymd(2026, 10, 7) }} />);
    expect(document.querySelectorAll(".cal-month")).toHaveLength(2);
    expect(document.querySelectorAll(".day.in-range")).toHaveLength(9 + 6);
  });
});
