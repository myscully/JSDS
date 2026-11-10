/* Date Picker 시각 옵션(2026-11-10) — 사이트 behave.dptime.js 와 같은 규칙을 React 에서도 잰다.
   값 하나 YYYY. MM. DD HH:mm, 24시간제, 달력 아래 시각 칸, 처음 값 00:00 · 기간 끝 23:59(사람의 결정) */
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DatePicker, DateRangePicker } from "../src/components/date-picker/DatePicker";
import { checkText, clockOf, groups, keyOf, parseDateTime, pasteText, placeholderOf, showOf, stepClock, stepText, type DatePickerMessages } from "../src/components/date-picker/format";
import { LABELS } from "../src/labels";

const at = (y: number, mo: number, d: number, h = 0, mi = 0, s = 0) => new Date(y, mo - 1, d, h, mi, s);
const MSG: DatePickerMessages = { incomplete: LABELS.dateIncompleteError, invalid: LABELS.dateInvalidError, min: LABELS.dateMinError, max: LABELS.dateMaxError, order: LABELS.dateOrderError, long: LABELS.dateLongError, subject: LABELS.dateSubject, startSubject: LABELS.dateStartSubject, endSubject: LABELS.dateEndSubject, invalidTime: LABELS.dateTimeInvalidError, orderTime: LABELS.dateTimeOrderError, timeSubject: LABELS.dateTimeSubject, startTimeSubject: LABELS.dateStartTimeSubject, endTimeSubject: LABELS.dateEndTimeSubject };
const field = () => document.querySelector<HTMLInputElement>(".datepicker .affix input")!;
const openCal = () => userEvent.click(document.querySelector<HTMLElement>(".cal-btn")!);
const cell = (k: string) => document.querySelector<HTMLElement>(`.calendar .day[data-date="${k}"]:not(.muted)`)!;
const clocks = () => Array.from(document.querySelectorAll<HTMLInputElement>(".cal-time input"));
const apply = () => document.querySelector<HTMLButtonElement>('[data-cal="apply"]')!;
const typeField = (v: string) => { fireEvent.change(field(), { target: { value: v } }); fireEvent.keyDown(field(), { key: "Enter" }); };
const help = () => document.querySelector(".datepicker .help")?.textContent ?? "";

describe("글자 · 검사 (format)", () => {
  it("숫자를 날짜 + 시각으로 끊는다", () => {
    expect(groups("202609071430", "minute", false)).toBe("2026. 09. 07 14:30");
    expect(groups("20260907143005", "second", false)).toBe("2026. 09. 07 14:30:05");
    expect(groups("202609070900202609081830", "minute", true)).toBe("2026. 09. 07 09:00 ~ 2026. 09. 08 18:30");
  });
  it("시 첫 자리 3~9 · 분과 초 첫 자리 6~9 는 앞에 0, 시 2 는 뒷자리를 기다린다", () => {
    expect(groups("20260907905", "minute", false)).toBe("2026. 09. 07 09:05");
    expect(groups("20260907147", "minute", false)).toBe("2026. 09. 07 14:07");
    expect(groups("2026090714307", "second", false)).toBe("2026. 09. 07 14:30:07");
    expect(groups("202609072", "minute", false)).toBe("2026. 09. 07 2");
  });
  it("시각 칸은 HH:mm · HH:mm:ss 로 끊고 같은 첫 자리 규칙을 쓴다", () => {
    expect(groups("0915", "clock", false)).toBe("09:15");
    expect(groups("915", "clock", false)).toBe("09:15");
    expect(groups("147", "clock", false)).toBe("14:07");
    expect(groups("143007", "clockS", false)).toBe("14:30:07");
  });
  it("붙여 넣은 기계 값도 형식으로", () => {
    expect(pasteText("2026-9-7 14:30", "minute", false)).toBe("2026. 09. 07 14:30");
  });
  it("parseDateTime 은 조각 수가 맞아야 하고 없는 시각은 null", () => {
    expect(parseDateTime("2026. 09. 07 14:30")?.getMinutes()).toBe(30);
    expect(parseDateTime("202609071430")?.getHours()).toBe(14);
    expect(parseDateTime("2026-09-07 14:30:05", true)?.getSeconds()).toBe(5);
    expect(parseDateTime("2026-09-07")).toBeNull();
    expect(parseDateTime("2026-09-07 14:30:05")).toBeNull();
    expect(parseDateTime("2026-09-07 14:30", true)).toBeNull();
    expect(parseDateTime("2026-09-07 24:00")).toBeNull();
    expect(parseDateTime("2026-09-07 14:60")).toBeNull();
    expect(parseDateTime("2026-09-07 14:30:60", true)).toBeNull();
    expect(parseDateTime("2026-02-30 14:30")).toBeNull();
  });
  it("표기 · 기계 값 · 자리표시", () => {
    const d = at(2026, 9, 7, 4, 5, 6);
    expect(showOf(d, "minute")).toBe("2026. 09. 07 04:05");
    expect(showOf(d, "second")).toBe("2026. 09. 07 04:05:06");
    expect(keyOf(d, "minute")).toBe("2026-09-07 04:05");
    expect(keyOf(d, "second")).toBe("2026-09-07 04:05:06");
    expect(clockOf(d, "second")).toBe("04:05:06");
    expect(placeholderOf("minute", false)).toBe("YYYY. MM. DD HH:mm");
    expect(placeholderOf("second", true)).toBe("YYYY. MM. DD HH:mm:ss ~ YYYY. MM. DD HH:mm:ss");
  });
  const check = (t: string, range = false, o: { min?: Date; max?: Date } = {}) => checkText(t, { unit: "minute", range, min: o.min ?? null, max: o.max ?? null, messages: MSG });
  it("날짜만 치면 미완성, 없는 시각은 시각이라고 알린다", () => {
    const r = check("2026. 09. 07");
    expect(r.validity).toBe("incomplete");
    expect(r.message).toContain("2026. 09. 07 14:30");
    const t = check("2026. 09. 07 25:00");
    expect(t.validity).toBe("invalid");
    expect(t.message).toBe("시각이 잘못됐습니다. 2026. 09. 07 14:30 처럼 24시간제로 입력하세요.");
    expect(check("2026. 02. 30 12:00").message?.startsWith("날짜가 달력에 없습니다")).toBe(true);
  });
  it("기간의 없는 시각은 틀린 쪽 이름으로", () => {
    expect(check("2026. 09. 07 09:00 ~ 2026. 09. 08 25:00", true).message?.startsWith("종료 시각이 잘못됐습니다")).toBe(true);
    expect(check("2026. 09. 07 25:00 ~ 2026. 09. 08 09:00", true).message?.startsWith("시작 시각이 잘못됐습니다")).toBe(true);
    expect(check("2026. 09. 07 25:00 ~ 2026. 09. 08 25:00", true).message?.startsWith("시각이 잘못됐습니다")).toBe(true);
  });
  it("같은 날이면 순서 문구가 시각, 다른 날이면 날짜", () => {
    expect(check("2026. 09. 07 18:00 ~ 2026. 09. 07 09:00", true)).toMatchObject({ validity: "order", message: LABELS.dateTimeOrderError });
    expect(check("2026. 09. 08 18:00 ~ 2026. 09. 07 09:00", true).message?.startsWith("종료일이 시작일보다")).toBe(true);
    expect(check("2026. 09. 07 09:00 ~ 2026. 09. 07 18:00", true).validity).toBe("valid");
  });
  it("min · max 는 시각까지 비교한다", () => {
    expect(check("2026. 09. 07 18:01", false, { max: at(2026, 9, 7, 18) }).validity).toBe("max");
    expect(check("2026. 09. 07 18:00", false, { max: at(2026, 9, 7, 18) }).validity).toBe("valid");
    expect(check("2026. 09. 07 08:59", false, { min: at(2026, 9, 7, 9) }).validity).toBe("min");
  });
  it("↑↓ 는 시 · 분 · 초를 올림 없이 돈다", () => {
    const T = at(2026, 10, 27);
    expect(stepText("2026. 09. 07 23:59", 15, 1, "minute", false, T).text).toBe("2026. 09. 07 00:59");
    expect(stepText("2026. 09. 07 23:59", 18, 1, "minute", false, T).text).toBe("2026. 09. 07 23:00");
    expect(stepText("2026. 09. 07 00:59", 15, -1, "minute", false, T).text).toBe("2026. 09. 07 23:59");
    expect(stepText("2026. 09. 07 14:30:59", 21, 1, "second", false, T).text).toBe("2026. 09. 07 14:30:00");
    expect(stepText("2026. 09. 07 23:59", 10, 1, "minute", false, T).text).toBe("2026. 09. 08 23:59");
    expect(stepText("2026. 09. 07", 12, 1, "minute", false, T).text).toBe("2026. 09. 08 00:00");
    expect(stepText("2026. 09. 07 09:00 ~ 2026. 09. 08", 33, 1, "minute", true, T).text).toBe("2026. 09. 07 09:00 ~ 2026. 09. 09 23:59");
    expect(stepClock("23:59", 1, 1, false)).toEqual({ text: "00:59", caret: 2 });
    expect(stepClock("23:59", 4, 1, false)).toEqual({ text: "23:00", caret: 5 });
    expect(stepClock("14:30:59", 7, 1, true)).toEqual({ text: "14:30:00", caret: 8 });
  });
});

describe("DatePicker time", () => {
  it("시각까지 쳐서 Date 로 낸다", () => {
    const fn = vi.fn();
    render(<DatePicker label="실행" time onChange={fn} />);
    typeField("202609071430");
    expect(field().value).toBe("2026. 09. 07 14:30");
    const [v, info] = fn.mock.calls[fn.mock.calls.length - 1];
    expect(v.getTime()).toBe(at(2026, 9, 7, 14, 30).getTime());
    expect(info).toMatchObject({ text: "2026. 09. 07 14:30", validity: "valid" });
    expect(document.querySelector(".datepicker")!.getAttribute("data-time")).toBe("");
  });
  it("seconds — 필드 · 표식 · 값", () => {
    render(<DatePicker label="실행" time="seconds" defaultValue={at(2026, 9, 7, 14, 30, 5)} />);
    expect(field().value).toBe("2026. 09. 07 14:30:05");
    expect(field().placeholder).toBe("YYYY. MM. DD HH:mm:ss");
    expect(document.querySelector(".datepicker")!.getAttribute("data-time")).toBe("seconds");
  });
  it("날짜만 치면 값이 되지 않고 덜 입력됐다고 알린다", () => {
    const fn = vi.fn();
    render(<DatePicker label="실행" time onChange={fn} defaultValue={at(2026, 9, 7, 14, 30)} />);
    typeField("20260908");
    expect(help()).toContain("덜 입력됐습니다");
    expect(fn.mock.calls[fn.mock.calls.length - 1][1].validity).toBe("incomplete");
  });
  it("빈 값으로 열면 00:00, 날짜를 골라 적용하면 합쳐진다", async () => {
    const fn = vi.fn();
    render(<DatePicker label="실행" time onChange={fn} today={at(2026, 9, 7)} />);
    await openCal();
    expect(clocks().map((i) => i.value)).toEqual(["00:00"]);
    await userEvent.click(cell("2026-09-10"));
    expect(document.querySelector(".datepicker .calendar")).not.toBeNull();
    await userEvent.click(apply());
    expect(field().value).toBe("2026. 09. 10 00:00");
    expect(document.querySelector(".datepicker .calendar")).toBeNull();
  });
  it("이미 시각이 있으면 날짜만 바꾸고 시각은 남긴다", async () => {
    render(<DatePicker label="실행" time defaultValue={at(2026, 9, 7, 14, 30)} />);
    await openCal();
    expect(clocks()[0].value).toBe("14:30");
    expect(apply().disabled).toBe(true);
    await userEvent.click(cell("2026-09-10"));
    expect(clocks()[0].value).toBe("14:30");
    await userEvent.click(apply());
    expect(field().value).toBe("2026. 09. 10 14:30");
  });
  it("시각 칸 — 끊어 채우기, 적용 켜짐, Enter 로 적용", async () => {
    render(<DatePicker label="실행" time defaultValue={at(2026, 9, 7, 14, 30)} />);
    await openCal();
    fireEvent.change(clocks()[0], { target: { value: "0915" } });
    expect(clocks()[0].value).toBe("09:15");
    expect(apply().disabled).toBe(false);
    fireEvent.keyDown(clocks()[0], { key: "Enter" });
    expect(field().value).toBe("2026. 09. 07 09:15");
    expect(document.querySelector(".datepicker .calendar")).toBeNull();
  });
  it("적용이 꺼져 있으면 Enter 는 아무 일도 하지 않는다", async () => {
    render(<DatePicker label="실행" time defaultValue={at(2026, 9, 7, 14, 30)} />);
    await openCal();
    fireEvent.keyDown(clocks()[0], { key: "Enter" });
    expect(document.querySelector(".datepicker .calendar")).not.toBeNull();
  });
  it("시각 칸의 ↑↓ 는 돌고 값은 적용 전까지 그대로", async () => {
    render(<DatePicker label="실행" time defaultValue={at(2026, 9, 7, 23, 59)} />);
    await openCal();
    clocks()[0].focus();
    clocks()[0].setSelectionRange(1, 1);
    fireEvent.keyDown(clocks()[0], { key: "ArrowUp" });
    expect(clocks()[0].value).toBe("00:59");
    expect(field().value).toBe("2026. 09. 07 23:59");
    expect(document.activeElement).toBe(clocks()[0]);
  });
  it("연달아 누른 ↑ 는 같은 조각에 머문다", async () => {
    render(<DatePicker label="실행" time defaultValue={at(2026, 9, 7, 14, 30)} />);
    await openCal();
    clocks()[0].focus();
    clocks()[0].setSelectionRange(1, 1);
    fireEvent.keyDown(clocks()[0], { key: "ArrowUp" });
    fireEvent.keyDown(clocks()[0], { key: "ArrowUp" });
    expect(clocks()[0].value).toBe("16:30");
  });
  it("필드의 ↑ 는 커서가 놓인 시각 조각을 움직인다", () => {
    render(<DatePicker label="실행" time defaultValue={at(2026, 9, 7, 23, 59)} />);
    field().focus();
    field().setSelectionRange(15, 15);
    fireEvent.keyDown(field(), { key: "ArrowUp" });
    expect(field().value).toBe("2026. 09. 07 00:59");
  });
  it("초까지 쓰면 시각 칸도 HH:mm:ss 로 끊는다", async () => {
    render(<DatePicker label="실행" time="seconds" defaultValue={at(2026, 9, 7, 14, 30, 5)} />);
    await openCal();
    fireEvent.change(clocks()[0], { target: { value: "143007" } });
    expect(clocks()[0].value).toBe("14:30:07");
  });
  it("달력이 열린 채 필드를 고치면 시각 칸도 따라온다", async () => {
    render(<DatePicker label="실행" time defaultValue={at(2026, 9, 7, 14, 30)} />);
    await openCal();
    typeField("202609080715");
    expect(document.querySelector(".datepicker .calendar")).not.toBeNull();
    expect(clocks()[0].value).toBe("07:15");
  });
  it("시각 칸의 Enter 는 폼을 제출하지 않는다", async () => {
    render(<DatePicker label="실행" time defaultValue={at(2026, 9, 7, 14, 30)} />);
    await openCal();
    expect(fireEvent.keyDown(clocks()[0], { key: "Enter" })).toBe(false);
  });
  it("시각 칸이 마지막 칸이어도 Tab 은 달력 안에서 돈다", async () => {
    render(<DatePicker label="실행" time footer={["apply"]} defaultValue={at(2026, 9, 7, 14, 30)} />);
    await openCal();
    clocks()[0].focus();
    await userEvent.tab();
    expect(document.activeElement!.className).toContain("cal-nav");
  });
  it("잘못된 시각 칸은 적용할 때 필드 오류로 알린다", async () => {
    const fn = vi.fn();
    render(<DatePicker label="실행" time onChange={fn} defaultValue={at(2026, 9, 7, 14, 30)} />);
    await openCal();
    fireEvent.change(clocks()[0], { target: { value: "2500" } });
    await userEvent.click(apply());
    expect(field().value).toBe("2026. 09. 07 25:00");
    expect(help().startsWith("시각이 잘못됐습니다")).toBe(true);
    expect(fn.mock.calls[fn.mock.calls.length - 1][1].validity).toBe("invalid");
  });
  it("footer 가 없어도 적용 버튼은 있고 날짜를 눌러도 닫히지 않는다", async () => {
    render(<DatePicker label="실행" time footer={false} defaultValue={at(2026, 9, 7, 14, 30)} />);
    await openCal();
    expect(apply()).not.toBeNull();
    await userEvent.click(cell("2026-09-10"));
    expect(document.querySelector(".datepicker .calendar")).not.toBeNull();
  });
  it("오늘은 시각을 남기고 초기화는 처음 시각으로", async () => {
    render(<DatePicker label="실행" time footer={["today", "reset", "apply"]} defaultValue={at(2026, 9, 7, 14, 30)} />);
    await openCal();
    await userEvent.click(document.querySelector('[data-cal="today"]')!);
    expect(clocks()[0].value).toBe("14:30");
    await userEvent.click(document.querySelector('[data-cal="reset"]')!);
    expect(clocks()[0].value).toBe("00:00");
  });
  it("Tab 은 시각 칸을 지나 달력 안에서 돈다", async () => {
    render(<DatePicker label="실행" time footer={["today", "apply"]} defaultValue={at(2026, 9, 7, 14, 30)} />);
    await openCal();
    await userEvent.click(cell("2026-09-10"));
    clocks()[0].focus();
    await userEvent.tab();
    expect((document.activeElement as HTMLElement).dataset.cal).toBe("today");
    await userEvent.tab();
    expect((document.activeElement as HTMLElement).dataset.cal).toBe("apply");
    await userEvent.tab();
    expect(document.activeElement!.className).toContain("cal-nav");
    await userEvent.tab({ shift: true });
    expect((document.activeElement as HTMLElement).dataset.cal).toBe("apply");
  });
  it("시각 칸은 일 달력에만", async () => {
    render(<DatePicker label="실행" time defaultValue={at(2026, 9, 7, 14, 30)} />);
    await openCal();
    expect(clocks()).toHaveLength(1);
    await userEvent.click(document.querySelector(".cal-title")!);
    expect(clocks()).toHaveLength(0);
  });
  it("시간대 — 벽시계로 보이고 그 시각의 순간으로 낸다", () => {
    const fn = vi.fn();
    render(<DatePicker label="실행" time timezone="America/New_York" onChange={fn} defaultValue={new Date("2026-09-07T18:30:00Z")} />);
    expect(field().value).toBe("2026. 09. 07 14:30");
    typeField("202609081430");
    expect(fn.mock.calls[fn.mock.calls.length - 1][0].toISOString()).toBe("2026-09-08T18:30:00.000Z");
  });
  it("max 가 0시면 그 하루 끝까지, 시각이 있으면 그 순간까지", () => {
    const fn = vi.fn(), last = () => fn.mock.calls[fn.mock.calls.length - 1][1].validity;
    const { unmount } = render(<DatePicker label="실행" time max={at(2026, 9, 7)} onChange={fn} />);
    typeField("202609072359");
    expect(last()).toBe("valid");
    typeField("202609080000");
    expect(last()).toBe("max");
    unmount();
    render(<DatePicker label="실행" time max={at(2026, 9, 7, 18)} onChange={fn} />);
    typeField("202609071801");
    expect(last()).toBe("max");
  });
  it("labels · messages 로 시각 문구를 바꾼다", async () => {
    render(<DatePicker label="실행" time labels={{ time: "At" }} messages={{ invalidTime: "{subject} is wrong, like {example}", timeSubject: "Time" }} defaultValue={at(2026, 9, 7, 14, 30)} />);
    await openCal();
    expect(screen.getByLabelText("At")).toBe(clocks()[0]);
    await userEvent.keyboard("{Escape}");
    typeField("202609072500");
    expect(help()).toBe("Time is wrong, like 2026. 09. 07 14:30");
  });
  it("일 단위가 아니면 경고하고 시각을 쓰지 않는다", () => {
    const w = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<DatePicker label="실행" time unit="month" />);
    expect(w).toHaveBeenCalled();
    expect(field().placeholder).toBe("YYYY. MM");
    expect(document.querySelector(".datepicker")!.hasAttribute("data-time")).toBe(false);
    w.mockRestore();
  });
});

describe("DateRangePicker time", () => {
  it("빈 기간은 00:00 ~ 23:59 로 시작하고 하루만 골라도 그날 끝까지", async () => {
    const fn = vi.fn();
    render(<DateRangePicker label="구간" time onChange={fn} today={at(2026, 9, 7)} />);
    await openCal();
    expect(clocks().map((i) => i.value)).toEqual(["00:00", "23:59"]);
    expect(screen.getByLabelText(LABELS.startTime)).toBe(clocks()[0]);
    expect(screen.getByLabelText(LABELS.endTime)).toBe(clocks()[1]);
    await userEvent.click(cell("2026-09-10"));
    await userEvent.click(cell("2026-09-10"));
    await userEvent.click(apply());
    expect(field().value).toBe("2026. 09. 10 00:00 ~ 2026. 09. 10 23:59");
    const [v] = fn.mock.calls[fn.mock.calls.length - 1];
    expect(v.end.getTime()).toBe(at(2026, 9, 10, 23, 59).getTime());
  });
  it("초를 쓰면 끝은 23:59:59", async () => {
    render(<DateRangePicker label="구간" time="seconds" today={at(2026, 9, 7)} />);
    await openCal();
    expect(clocks().map((i) => i.value)).toEqual(["00:00:00", "23:59:59"]);
  });
  it("같은 날 시각을 뒤집으면 시각 순서 오류", async () => {
    render(<DateRangePicker label="구간" time defaultValue={{ start: at(2026, 9, 7, 9), end: at(2026, 9, 7, 18) }} />);
    await openCal();
    fireEvent.change(clocks()[0], { target: { value: "1900" } });
    await userEvent.click(apply());
    expect(help()).toBe(LABELS.dateTimeOrderError);
  });
  it("오늘 0시를 max 로 두면 프리셋 · 오늘 23:59 가 범위 안이다(로그 뷰어 예제의 조합)", async () => {
    const fn = vi.fn(), today = at(2026, 9, 7);
    render(<DateRangePicker aria-label="조회 구간" time max={today} today={today} presets={[{ label: "최근 6일", range: () => [at(2026, 9, 2), today] }]} onChange={fn} defaultValue={{ start: at(2026, 9, 1), end: at(2026, 9, 7, 23, 59) }} />);
    expect(field().value).toBe("2026. 09. 01 00:00 ~ 2026. 09. 07 23:59");
    expect(help()).toBe("");
    await openCal();
    expect((document.querySelector("[data-preset]") as HTMLButtonElement).disabled).toBe(false);
    await userEvent.click(document.querySelector("[data-preset]")!);
    expect(fn.mock.calls[fn.mock.calls.length - 1][1].validity).toBe("valid");
  });
  it("프리셋은 하루 전체를 덮는다", async () => {
    const fn = vi.fn();
    render(<DateRangePicker label="구간" time presets={[{ label: "최근 7일", range: () => [at(2026, 9, 1), at(2026, 9, 7)] }]} onChange={fn} defaultValue={{ start: at(2026, 9, 7, 9), end: at(2026, 9, 7, 18) }} />);
    await openCal();
    await userEvent.click(document.querySelector("[data-preset]")!);
    const [v] = fn.mock.calls[fn.mock.calls.length - 1];
    expect([v.start.getHours(), v.start.getMinutes(), v.end.getHours(), v.end.getMinutes()]).toEqual([0, 0, 23, 59]);
  });
});
