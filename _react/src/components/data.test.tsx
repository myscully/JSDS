import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable } from "./data-table/DataTable";
import { Accordion, AccordionGroup } from "./accordion/Accordion";
import { Card, CardGrid, CardTitle } from "./card/Card";
import { Donut } from "./data-visual/DataVisual";
import { Steps } from "./indicator/Indicator";

/* 완료 단계는 체크 아이콘만 있어 보조기기에 상태가 전해지지 않았다 — 숨김 문구로 알린다 */
describe("Steps", () => {
  it("완료 항목에만 (완료) 숨김 문구가 붙는다", () => {
    const { container } = render(<Steps items={["가", "나", "다"]} current={1} />);
    const li = container.querySelectorAll("li");
    expect(li[0].querySelector(".sr-only")?.textContent).toBe(" (완료)");
    expect(li[1].querySelector(".sr-only")).toBeNull();
    expect(li[2].querySelector(".sr-only")).toBeNull();
  });
});

type R = { id: string; name: string; n: number };
const rows: R[] = [{ id: "a", name: "b", n: 2 }, { id: "b", name: "a", n: 1 }, { id: "c", name: "c", n: 3 }];
const cols = [{ key: "name", header: "이름", sortable: true }, { key: "n", header: "수", num: true, sortable: true }];

describe("DataTable", () => {
  /* 비활성 행은 inert — pointer-events 만으로는 키보드 Tab 이 행 안 링크로 들어갔다 */
  it("rowProps disabled 행은 .disabled + inert, 다른 행은 inert 아님", () => {
    const { container } = render(<DataTable columns={cols} rows={rows} rowKey={(r) => r.id} rowProps={(r) => ({ disabled: r.id === rows[0].id })} />);
    const trs = container.querySelectorAll("tbody tr");
    expect(trs[0]).toHaveClass("disabled");
    expect(trs[0].hasAttribute("inert")).toBe(true);
    expect(trs[1].hasAttribute("inert")).toBe(false);
  });
  it("헤더 클릭으로 asc → desc 정렬, aria-sort 표시", async () => {
    render(<DataTable columns={cols} rows={rows} rowKey={(r) => r.id} />);
    const th = screen.getByRole("columnheader", { name: "수" });
    await userEvent.click(th);
    expect(th).toHaveAttribute("aria-sort", "ascending");
    let cells = screen.getAllByRole("row").slice(1).map((r) => within(r).getAllByRole("cell")[1].textContent);
    expect(cells).toEqual(["1", "2", "3"]);
    await userEvent.click(th);
    expect(th).toHaveAttribute("aria-sort", "descending");
    cells = screen.getAllByRole("row").slice(1).map((r) => within(r).getAllByRole("cell")[1].textContent);
    expect(cells).toEqual(["3", "2", "1"]);
  });
  it("선택: 헤더 체크박스 indeterminate → 전체 선택, 행 .on", async () => {
    const onSel = vi.fn();
    render(<DataTable columns={cols} rows={rows} rowKey={(r) => r.id} selectable defaultSelected={new Set(["a"])} onSelectedChange={onSel} />);
    const all = screen.getByRole("checkbox", { name: "전체 선택" }) as HTMLInputElement;
    expect(all.indeterminate).toBe(true);
    expect(screen.getAllByRole("row")[1]).toHaveClass("on");
    await userEvent.click(all);
    expect(onSel).toHaveBeenLastCalledWith(new Set(["a", "b", "c"]));
    expect(all.checked).toBe(true);
  });
  it("빈 상태", () => {
    render(<DataTable columns={cols} rows={[]} rowKey={(r: R) => r.id} empty="없음" />);
    const td = screen.getByText("없음");
    expect(td).toHaveClass("empty");
    expect(td).toHaveAttribute("colspan", "2");
  });
});

describe("Accordion", () => {
  it("summary 클릭 시 onOpenChange", async () => {
    const onOpenChange = vi.fn();
    render(<Accordion title="제목" onOpenChange={onOpenChange}>내용</Accordion>);
    const d = document.querySelector("details")!;
    // jsdom 은 summary 클릭 시 toggle 이벤트를 발생시키지 않을 수 있어 직접 토글(상태가 바뀌므로 act 로 감싼다)
    act(() => { d.open = true; d.dispatchEvent(new Event("toggle")); });
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("variant · size 는 사이트 마크업과 같은 클래스로 — 기본 md outline, 그룹은 flat 일 때만", () => {
    render(<AccordionGroup variant="flat" data-testid="g"><Accordion variant="flat" size="sm" title="제목">내용</Accordion><Accordion title="기본">내용</Accordion></AccordionGroup>);
    expect(screen.getByTestId("g").className).toBe("accordion-group flat");
    const [a, b] = document.querySelectorAll("details");
    expect(a.className).toBe("accordion sm flat");
    expect(b.className).toBe("accordion md outline");
  });
  it("옛 flat prop 은 DOM 에 새지 않고 개발 모드에서 알린다", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const legacy = { flat: true } as unknown as Record<string, never>;
    render(<AccordionGroup {...legacy} data-testid="g2"><Accordion {...legacy} title="옛">내용</Accordion></AccordionGroup>);
    expect(screen.getByTestId("g2")).not.toHaveAttribute("flat");
    expect(document.querySelector("details:last-of-type")).not.toHaveAttribute("flat");
    expect(warn.mock.calls.length).toBe(2);
    warn.mockRestore();
  });

  it("disabled 는 tabIndex -1 과 aria-disabled 를 함께 단다", () => {
    render(<Accordion disabled title="제목">내용</Accordion>);
    const sm = document.querySelector("summary")!;
    expect(sm.tabIndex).toBe(-1);
    expect(sm.getAttribute("aria-disabled")).toBe("true");
  });

  /* aria-disabled 는 skeleton 의 STATE_ATTRS 라, 비활성이 아닐 때 "false" 로 남으면 HTML 예제와 골격이 어긋난다 */
  it("비활성이 아니면 aria-disabled 속성 자체가 없다", () => {
    render(<Accordion title="제목">내용</Accordion>);
    const sm = document.querySelector("summary")!;
    expect(sm.hasAttribute("aria-disabled")).toBe(false);
    expect(sm.hasAttribute("tabindex")).toBe(false);
  });

  it("disabled 는 클릭을 삼킨다", async () => {
    const onOpenChange = vi.fn();
    render(<Accordion disabled title="제목" onOpenChange={onOpenChange}>내용</Accordion>);
    await userEvent.click(document.querySelector("summary")!, { pointerEventsCheck: 0 });
    expect(document.querySelector("details")!.open).toBe(false);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("extra 는 summary small · name 은 details 속성", () => {
    render(<Accordion name="faq" title="제목" extra="3개 설정">내용</Accordion>);
    expect(document.querySelector("summary small")!.textContent).toBe("3개 설정");
    expect(document.querySelector("details")!.getAttribute("name")).toBe("faq");
  });
});

describe("Donut", () => {
  it("비율 aria-label 과 conic-gradient", () => {
    const { container } = render(<Donut segments={[{ label: "A", value: 1, tone: "critical" }, { label: "B", value: 3, tone: "low" }]} label="4" />);
    const d = container.firstElementChild as HTMLElement;
    expect(d).toHaveAttribute("aria-label", "A 25%, B 75%");
    expect(d.style.background).toContain("conic-gradient");
  });
  /* 조각 사이 틈 — 밝기 대비가 낮아 틈이 없으면 색상으로만 갈린다(사이트 .donut 과 같은 계산) */
  it("조각마다 양쪽에 면 색 틈을 둔다", () => {
    const { container } = render(<Donut segments={[{ label: "A", value: 1, tone: "critical" }, { label: "B", value: 3, tone: "low" }]} />);
    const bg = (container.firstElementChild as HTMLElement).getAttribute("style") ?? "";
    expect(bg.match(/--surface-elevated-primary/g)?.length).toBe(4);
  });
});

describe("Card", () => {
  it("변형이 클래스로 붙는다", () => {
    const { container } = render(<Card bordered compact flush clickable selected>내용</Card>);
    expect(container.firstElementChild!.className).toBe("card bordered compact flush clickable on");
  });

  it("기본은 div 에 .card 만", () => {
    const { container } = render(<Card>내용</Card>);
    const el = container.firstElementChild!;
    expect(el.tagName).toBe("DIV");
    expect(el.className).toBe("card");
    expect(el.hasAttribute("aria-pressed")).toBe(false);
  });

  /* .on 만으로는 선택이 보조기기에 전해지지 않는다 — button 루트일 때 aria-pressed 가 따라가야 한다 */
  it("as=button + selected 면 aria-pressed 를 함께 낸다", () => {
    const { container } = render(<Card as="button" type="button" clickable selected>선택됨</Card>);
    const btn = container.querySelector("button")!;
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    expect(btn.getAttribute("type")).toBe("button");
    expect(btn.className).toBe("card clickable on");
  });

  it("selected={false} 면 aria-pressed=false", () => {
    const { container } = render(<Card as="button" clickable selected={false}>안 선택</Card>);
    expect(container.querySelector("button")!.getAttribute("aria-pressed")).toBe("false");
  });

  it("div 루트에는 aria-pressed 를 붙이지 않는다", () => {
    const { container } = render(<Card selected>내용</Card>);
    expect(container.firstElementChild!.hasAttribute("aria-pressed")).toBe(false);
  });

  it("CardTitle 은 기본 h3, as 로 바꿀 수 있다", () => {
    const { container } = render(<><CardTitle>기본</CardTitle><CardTitle as="h2">둘</CardTitle></>);
    expect(container.querySelector("h3.title")!.textContent).toBe("기본");
    expect(container.querySelector("h2.title")!.textContent).toBe("둘");
  });

  /* Ant 의 loading 에 대응 — 내용 자리를 Skeleton 으로 바꾸고 aria-busy 를 켠다 */
  it("loading 이면 children 대신 Skeleton 과 aria-busy", () => {
    const { container } = render(<Card loading>안 보여야 하는 내용</Card>);
    const el = container.firstElementChild!;
    expect(el.getAttribute("aria-busy")).toBe("true");
    expect(el.textContent).toBe("");
    expect([...el.querySelectorAll(".skeleton")].map((s) => s.className)).toEqual(["skeleton title", "skeleton text", "skeleton text short"]);
  });

  it("loading 이 아니면 children 그대로, aria-busy 없음", () => {
    const { container } = render(<Card>내용</Card>);
    const el = container.firstElementChild!;
    expect(el.textContent).toBe("내용");
    expect(el.hasAttribute("aria-busy")).toBe(false);
    expect(el.querySelector(".skeleton")).toBeNull();
  });

  it("CardGrid 는 .card-grid", () => {
    const { container } = render(<CardGrid><Card>a</Card></CardGrid>);
    expect(container.firstElementChild!.className).toBe("card-grid");
  });
});
