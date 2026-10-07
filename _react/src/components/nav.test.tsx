import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tab, TabList, TabPanel, Tabs } from "./tab/Tabs";
import { Pagination, paginate } from "./pagination/Pagination";
import { Breadcrumb, BreadcrumbItem, BreadcrumbMore } from "./breadcrumb/Breadcrumb";

describe("Tabs", () => {
  it("클릭·방향키로 전환하고 패널을 바꾼다", async () => {
    render(
      <Tabs defaultValue="a">
        <TabList>
          <Tab value="a">A</Tab>
          <Tab value="b">B</Tab>
          <Tab value="c" disabled>C</Tab>
        </TabList>
        <TabPanel value="a">패널 A</TabPanel>
        <TabPanel value="b">패널 B</TabPanel>
      </Tabs>,
    );
    const a = screen.getByRole("tab", { name: "A" }), b = screen.getByRole("tab", { name: "B" });
    expect(a).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("패널 A");
    await userEvent.click(b);
    expect(b).toHaveClass("on");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("패널 B");
    b.focus();
    await userEvent.keyboard("{ArrowRight}"); // C 비활성 → A 로 순환
    expect(a).toHaveAttribute("aria-selected", "true");
    expect(document.activeElement).toBe(a);
  });
});

describe("paginate", () => {
  it("경계 + 창 + 생략", () => {
    expect(paginate(1, 24, { siblings: 3 })).toEqual([1, 2, 3, 4, "gap", 24]);
    expect(paginate(12, 24)).toEqual([1, "gap", 11, 12, 13, "gap", 24]);
    expect(paginate(1, 3)).toEqual([1, 2, 3]);
    expect(paginate(8, 20, { boundaries: 0 })).toEqual([7, 8, 9]);
    expect(paginate(24, 24, { siblings: 2 })).toEqual([1, "gap", 22, 23, 24]);
  });
  it("Pagination 은 첫/끝 페이지에서 이전/다음을 비활성", async () => {
    const onChange = vi.fn();
    render(<Pagination page={1} total={5} onChange={onChange} />);
    expect(screen.getByRole("button", { name: "이전" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "3" }));
    expect(onChange).toHaveBeenCalledWith(3);
    expect(screen.getByRole("button", { name: "1" })).toHaveAttribute("aria-current", "page");
  });
});

describe("Breadcrumb", () => {
  it("nav[aria-label] > ol.breadcrumb 구조", () => {
    const { container } = render(<Breadcrumb><BreadcrumbItem href="#">정책</BreadcrumbItem></Breadcrumb>);
    const nav = container.querySelector("nav")!;
    expect(nav.getAttribute("aria-label")).toBe("현재 위치");
    expect(nav.querySelector("ol")!.className).toBe("breadcrumb");
    expect(nav.querySelector("li > a")!.getAttribute("href")).toBe("#");
  });

  it("label 로 nav 이름을 바꾼다", () => {
    const { container } = render(<Breadcrumb label="경로"><BreadcrumbItem current>끝</BreadcrumbItem></Breadcrumb>);
    expect(container.querySelector("nav")!.getAttribute("aria-label")).toBe("경로");
  });

  /* li 가 flex 라 맨 텍스트에는 말줄임이 걸리지 않는다 — current 는 span 으로 감싸야 한다 */
  it("current 는 링크 없이 aria-current 와 span", () => {
    const { container } = render(<Breadcrumb><BreadcrumbItem current>외부 저장장치 차단</BreadcrumbItem></Breadcrumb>);
    const li = container.querySelector("li")!;
    expect(li.getAttribute("aria-current")).toBe("page");
    expect(li.querySelector("a")).toBeNull();
    expect(li.querySelector("span")!.textContent).toBe("외부 저장장치 차단");
  });

  it("linkProps 로 아이콘 링크에 이름과 클래스를 준다", () => {
    const { container } = render(
      <Breadcrumb><BreadcrumbItem href="#" linkProps={{ className: "icon", "aria-label": "홈" }}>·</BreadcrumbItem></Breadcrumb>,
    );
    const a = container.querySelector("li > a")!;
    expect(a.className).toBe("icon");
    expect(a.getAttribute("aria-label")).toBe("홈");
  });

  it("BreadcrumbMore 는 li > button.more[aria-label]", async () => {
    const onClick = vi.fn();
    const { container } = render(<Breadcrumb><BreadcrumbMore onClick={onClick} /></Breadcrumb>);
    const btn = container.querySelector("li > button.more")!;
    expect(btn.getAttribute("type")).toBe("button");
    expect(btn.getAttribute("aria-label")).toBe("상위 경로 펼치기");
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });
});
