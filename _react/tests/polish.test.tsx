/* 이미 정비한 컴포넌트의 보강(2026-11-10) — 사이트 behave.polish.js 와 같은 규칙을 React 에서도 잰다.
   Date Picker 기간 상한 · Breadcrumb 잘린 항목 Tooltip · 차트 표로 보기(사람의 결정 셋) */
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Breadcrumb, BreadcrumbItem } from "../src/components/breadcrumb/Breadcrumb";
import { DatePicker, DateRangePicker } from "../src/components/date-picker/DatePicker";
import { checkText, spanDays, type DatePickerMessages } from "../src/components/date-picker/format";
import { Tooltip } from "../src/components/tooltip/Tooltip";
import { LABELS } from "../src/labels";
import { ChartCanvas, type ChartLike, type DsChartConfig } from "../src/chart";

const at = (y: number, mo: number, d: number, h = 0, mi = 0) => new Date(y, mo - 1, d, h, mi);
const MSG: DatePickerMessages = { incomplete: LABELS.dateIncompleteError, invalid: LABELS.dateInvalidError, min: LABELS.dateMinError, max: LABELS.dateMaxError, order: LABELS.dateOrderError, long: LABELS.dateLongError, subject: LABELS.dateSubject, startSubject: LABELS.dateStartSubject, endSubject: LABELS.dateEndSubject };
const field = () => document.querySelector<HTMLInputElement>(".datepicker .affix input")!;
const openCal = () => userEvent.click(document.querySelector<HTMLElement>(".cal-btn")!);
const cell = (k: string) => document.querySelector<HTMLElement>(`.calendar .day[data-date="${k}"]:not(.muted)`)!;
const typeField = (v: string) => { fireEvent.change(field(), { target: { value: v } }); fireEvent.keyDown(field(), { key: "Enter" }); };
const help = () => document.querySelector(".datepicker .help")?.textContent ?? "";
const SEP = { start: at(2026, 9, 1), end: at(2026, 9, 30) };

describe("기간 상한 (maxDays)", () => {
  it("spanDays 는 양끝을 넣어 세고 시각은 보지 않는다", () => {
    expect(spanDays(at(2026, 9, 1), at(2026, 9, 1))).toBe(1);
    expect(spanDays(at(2026, 9, 1, 23, 59), at(2026, 9, 2))).toBe(2);
    expect(spanDays(at(2026, 10, 1), at(2026, 9, 1))).toBe(31);
    expect(spanDays(at(2026, 3, 1), at(2026, 3, 31))).toBe(31);   // 일광 절약 시간이 걸리는 달도 정수
  });
  it("checkText: 상한까지 valid, 넘으면 long + {days}, 순서가 먼저", () => {
    const o = { unit: "day" as const, range: true, maxDays: 31, messages: MSG };
    expect(checkText("2026. 09. 01 ~ 2026. 10. 01", o).validity).toBe("valid");
    const r = checkText("2026. 09. 01 ~ 2026. 10. 02", o);
    expect(r.validity).toBe("long");
    expect(r.message).toBe("기간이 31일을 넘습니다. 31일 이내로 고르세요.");
    expect(r.start).toEqual(at(2026, 9, 1)); expect(r.end).toEqual(at(2026, 10, 2));
    expect(r.sides).toEqual({ start: "valid", end: "valid" });
    expect(checkText("2026. 12. 01 ~ 2026. 09. 01", o).validity).toBe("order");
    expect(checkText("2026. 09. 01 ~ 2026. 10. 02", { ...o, maxDays: undefined }).validity).toBe("valid");
  });
  it("checkText: 시각은 세지 않는다, 옛 형식 문구는 그대로", () => {
    const o = { unit: "minute" as const, range: true, maxDays: 31, messages: MSG };
    expect(checkText("2026. 09. 01 00:00 ~ 2026. 10. 01 23:59", o).validity).toBe("valid");
    expect(checkText("2026. 09. 01 00:00 ~ 2026. 10. 02 00:00", o).validity).toBe("long");
    expect(checkText("2026. 09. 01 00:00 ~ 2026. 10. 02 00:00", { ...o, messages: { ...MSG, long: "너무 깁니다." } }).message).toBe("너무 깁니다.");
  });
  it("시작을 고르면 양쪽의 상한 밖 날짜를 막고, 끝을 고르면 푼다", async () => {
    render(<DateRangePicker label="기간" maxDays={31} defaultValue={SEP} />);
    await openCal();
    await userEvent.click(cell("2026-09-10"));
    expect(cell("2026-10-10").getAttribute("aria-disabled")).not.toBe("true");
    expect(cell("2026-10-11").getAttribute("aria-disabled")).toBe("true");
    await userEvent.click(document.querySelectorAll<HTMLElement>(".cal-nav")[0]);
    expect(cell("2026-08-11").getAttribute("aria-disabled")).not.toBe("true");
    expect(cell("2026-08-10").getAttribute("aria-disabled")).toBe("true");
    await userEvent.click(document.querySelectorAll<HTMLElement>(".cal-nav")[1]);
    await userEvent.click(cell("2026-10-10"));
    expect(cell("2026-10-11").getAttribute("aria-disabled")).not.toBe("true");
  });
  it("min · max 가 더 좁으면 그것을 따른다", async () => {
    render(<DateRangePicker label="기간" maxDays={31} min={at(2026, 9, 5)} max={at(2026, 9, 20)} defaultValue={{ start: at(2026, 9, 6), end: at(2026, 9, 7) }} />);
    await openCal();
    await userEvent.click(cell("2026-09-10"));
    expect(cell("2026-09-04").getAttribute("aria-disabled")).toBe("true");
    expect(cell("2026-09-21").getAttribute("aria-disabled")).toBe("true");
    expect(cell("2026-09-20").getAttribute("aria-disabled")).not.toBe("true");
  });
  it("상한보다 긴 프리셋은 꺼진다", async () => {
    render(<DateRangePicker label="기간" maxDays={31} defaultValue={SEP} presets={[{ label: "7일", range: () => [at(2026, 9, 1), at(2026, 9, 7)] }, { label: "31일", range: () => [at(2026, 9, 1), at(2026, 10, 1)] }, { label: "32일", range: () => [at(2026, 9, 1), at(2026, 10, 2)] }]} />);
    await openCal();
    const of = (n: string) => screen.getByRole("button", { name: n }) as HTMLButtonElement;
    expect([of("7일").disabled, of("31일").disabled, of("32일").disabled]).toEqual([false, false, true]);
  });
  it("키보드로 친 긴 기간은 받아서 long 으로 알린다", () => {
    const fn = vi.fn();
    render(<DateRangePicker label="기간" maxDays={31} defaultValue={SEP} onChange={fn} />);
    typeField("2026. 09. 01 ~ 2026. 10. 02");
    expect(help()).toBe("기간이 31일을 넘습니다. 31일 이내로 고르세요.");
    expect(field().getAttribute("aria-invalid")).toBe("true");
    expect(field().value).toBe("2026. 09. 01 ~ 2026. 10. 02");
    expect(fn.mock.calls[fn.mock.calls.length - 1][1].validity).toBe("long");
  });
  it("messages.long 일부 override", () => {
    render(<DateRangePicker label="기간" maxDays={7} defaultValue={SEP} messages={{ long: "Max {days} days." }} />);
    typeField("2026. 09. 01 ~ 2026. 09. 30");
    expect(help()).toBe("Max 7 days.");
  });
  it("일 단위 기간이 아니면 경고하고 무시한다", () => {
    const w = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<DateRangePicker label="기간" unit="month" maxDays={1} />);
    expect(w.mock.calls.some((c) => String(c[0]).includes("maxDays"))).toBe(true);
    typeField("2026. 01 ~ 2026. 03");
    expect(help()).toBe("");
    w.mockRestore();
  });
});

describe("Breadcrumb 잘린 항목", () => {
  let cut = false;
  beforeEach(() => {
    cut = false;
    vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(function (this: HTMLElement) { return cut && this.textContent!.startsWith("긴") ? 300 : 100; });
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => 100);
  });
  afterEach(() => vi.restoreAllMocks());
  const ui = () => render(<Breadcrumb><BreadcrumbItem href="#">짧은</BreadcrumbItem><BreadcrumbItem href="#">긴 링크</BreadcrumbItem><BreadcrumbItem current>긴 현재</BreadcrumbItem></Breadcrumb>);

  it("잘리지 않으면 Tooltip 도 tabIndex 도 없다", () => {
    ui();
    expect(document.querySelectorAll(".tooltip")).toHaveLength(0);
    expect(document.querySelector("li[aria-current] span")!.hasAttribute("tabindex")).toBe(false);
  });
  it("잘린 항목에만 Tooltip, 링크가 아닌 항목은 포커스를 받는다", () => {
    cut = true; ui();
    expect(Array.from(document.querySelectorAll(".tooltip")).map((t) => t.textContent)).toEqual(["긴 링크", "긴 현재"]);
    expect(document.querySelector("li:nth-child(1) .tooltip")).toBeNull();
    expect(document.querySelector<HTMLElement>("li[aria-current] .tooltip-wrap > span:not(.tooltip)")!.tabIndex).toBe(0);
    expect(document.querySelector("li:nth-child(2) a")!.hasAttribute("tabindex")).toBe(false);
  });
  it("같은 글자라 aria-describedby 로 잇지 않는다(두 번 읽힘)", () => {
    cut = true; ui();
    expect(document.querySelectorAll(".breadcrumb [aria-describedby]")).toHaveLength(0);
  });
  it("글자가 바뀌면 다시 잰다", () => {
    const { rerender } = render(<Breadcrumb><BreadcrumbItem current>짧은</BreadcrumbItem></Breadcrumb>);
    cut = true;
    rerender(<Breadcrumb><BreadcrumbItem current>긴 현재</BreadcrumbItem></Breadcrumb>);
    expect(document.querySelectorAll(".tooltip")).toHaveLength(1);
  });
  it("글꼴이 도착하면 다시 잰다", async () => {
    let done!: () => void; const ready = new Promise<void>((r) => { done = r; });
    Object.defineProperty(document, "fonts", { configurable: true, value: { ready } });
    render(<Breadcrumb><BreadcrumbItem current>긴 현재</BreadcrumbItem></Breadcrumb>);
    expect(document.querySelectorAll(".tooltip")).toHaveLength(0);
    cut = true;
    await act(async () => { done(); await ready; });
    expect(document.querySelectorAll(".tooltip")).toHaveLength(1);
    delete (document as unknown as { fonts?: unknown }).fonts;
  });
});

describe("Tooltip describe", () => {
  it("기본은 aria-describedby, describe={false} 면 잇지 않는다", () => {
    const { rerender } = render(<Tooltip content="설명"><button type="button">대상</button></Tooltip>);
    expect(screen.getByRole("button").hasAttribute("aria-describedby")).toBe(true);
    rerender(<Tooltip content="설명" describe={false}><button type="button">대상</button></Tooltip>);
    expect(screen.getByRole("button").hasAttribute("aria-describedby")).toBe(false);
  });
});

describe("차트 표로 보기", () => {
  class FakeChart {
    ctx = {}; data: DsChartConfig["data"]; options: Record<string, unknown> = {};
    constructor(public canvas: HTMLCanvasElement, config: DsChartConfig) { this.data = config.data; this.options = config.options ?? {}; }
    update() {} destroy() {}
  }
  const Chart = FakeChart as unknown as ChartLike;
  const cfg = (data: DsChartConfig["data"]): DsChartConfig => ({ type: "bar", data, options: {} });
  const two = cfg({ labels: ["월", "화"], datasets: [{ label: "A", data: [1234, null] }, { label: "B", data: [3, 4] }] });
  const btn = () => document.querySelector<HTMLButtonElement>("[data-chart-table]")!;
  const heads = () => Array.from(document.querySelectorAll("thead th")).map((t) => t.textContent);
  const rows = () => Array.from(document.querySelectorAll("tbody tr")).map((r) => Array.from(r.children).map((c) => c.textContent));

  it("처음은 차트, 버튼은 canvas 앞(읽는 순서 = 보이는 순서)", () => {
    render(<ChartCanvas chart={Chart} config={two} aria-label="탐지" />);
    expect(btn().textContent).toBe("표로 보기"); expect(document.querySelector(".chart-table")).toBeNull();
    expect(btn().compareDocumentPosition(document.querySelector("canvas")!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
  it("누르면 같은 데이터를 표로 — 숫자 형식, 빈 값은 보이는 — + 숨긴 '값 없음', 머리글 scope", async () => {
    render(<ChartCanvas chart={Chart} config={two} aria-label="탐지" />);
    await userEvent.click(btn());
    expect(heads()).toEqual(["구분", "A", "B"]);
    expect(rows()).toEqual([["월", "1,234", "3"], ["화", "—값 없음", "4"]]);
    const gap = document.querySelectorAll("tbody tr")[1].children[1];
    expect(gap.querySelector("[aria-hidden='true']")!.textContent).toBe("—"); expect(gap.querySelector(".sr-only")!.textContent).toBe("값 없음");
    expect(btn().textContent).toBe("차트로 보기");
    expect((document.querySelector(".chart-canvas") as HTMLElement).hidden).toBe(true);
    expect(document.querySelector("thead th")!.getAttribute("scope")).toBe("col");
    expect(document.querySelector("tbody td:nth-child(2)")!.className).toBe("num");
    expect(document.activeElement).toBe(btn());
  });
  it("표 영역은 차트와 같은 이름 · 포커스로 스크롤 · 같은 높이", async () => {
    render(<ChartCanvas chart={Chart} config={two} aria-label="탐지" height={300} />);
    await userEvent.click(btn());
    const box = screen.getByRole("region", { name: "탐지" });
    expect(box.tabIndex).toBe(0); expect(box.style.height).toBe("300px");
  });
  it("다시 누르면 차트로, 표는 지운다", async () => {
    render(<ChartCanvas chart={Chart} config={two} aria-label="탐지" />);
    await userEvent.click(btn()); await userEvent.click(btn());
    expect(document.querySelector(".chart-table")).toBeNull();
    expect((document.querySelector(".chart-canvas") as HTMLElement).hidden).toBe(false);
    expect(btn().textContent).toBe("표로 보기");
  });
  it("이름 없는 단일 계열은 '값', 여러 개면 번호", async () => {
    const { unmount } = render(<ChartCanvas chart={Chart} config={cfg({ labels: ["x"], datasets: [{ data: [1] }] })} aria-label="도넛" />);
    await userEvent.click(btn()); expect(heads()).toEqual(["구분", "값"]); unmount();
    render(<ChartCanvas chart={Chart} config={cfg({ labels: ["x"], datasets: [{ data: [1] }, { data: [2] }] })} aria-label="둘" />);
    await userEvent.click(btn()); expect(heads()).toEqual(["구분", "값 1", "값 2"]);
  });
  it("labels 로 문구를 바꾼다", async () => {
    render(<ChartCanvas chart={Chart} config={two} aria-label="x" labels={{ table: "Table", chart: "Chart", head: "Day", empty: "No value" }} />);
    expect(btn().textContent).toBe("Table");
    await userEvent.click(btn());
    expect(btn().textContent).toBe("Chart"); expect(heads()[0]).toBe("Day");
    expect(document.querySelector("tbody .sr-only")!.textContent).toBe("No value");
  });
});

/* 단일 DatePicker 에 상한이 끼어들지 않는다 — maxDays 는 DateRangePicker 전용 prop */
describe("타입 경계", () => {
  it("단일 DatePicker 는 그대로 valid", () => {
    render(<DatePicker label="날짜" />);
    typeField("2026. 09. 01");
    expect(help()).toBe("");
  });
});
