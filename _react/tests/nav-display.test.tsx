import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Count, SideNav, SideNavItem, SkipLink, Steps, Tab, TabList, TabPanel, Tabs, Tag, TagGroup } from "../src";
import { revealTab } from "../src/components/tab/Tabs";

const TwoTabs = ({ keep }: { keep?: boolean }) => (
  <Tabs defaultValue="a">
    <TabList label="설정"><Tab value="a">기본</Tab><Tab value="b">예외</Tab></TabList>
    <TabPanel value="a" keepMounted={keep}><input aria-label="이름" /></TabPanel>
    <TabPanel value="b" keepMounted={keep}>예외 내용</TabPanel>
  </Tabs>
);

describe("Tab", () => {
  it("탭을 옮겨도 패널의 입력이 남는다", () => {
    render(<TwoTabs />);
    fireEvent.change(screen.getByLabelText("이름"), { target: { value: "외부 USB 차단" } });
    fireEvent.click(screen.getByRole("tab", { name: "예외" }));
    fireEvent.click(screen.getByRole("tab", { name: "기본" }));
    expect((screen.getByLabelText("이름") as HTMLInputElement).value).toBe("외부 USB 차단");
  });
  it("숨은 패널은 hidden, keepMounted={false} 면 그리지 않는다", () => {
    const a = render(<TwoTabs />);
    expect(a.container.querySelectorAll(".tab-panel").length).toBe(2);
    expect(a.container.querySelectorAll(".tab-panel")[1].hasAttribute("hidden")).toBe(true);
    a.unmount();
    const b = render(<TwoTabs keep={false} />);
    expect(b.container.querySelectorAll(".tab-panel").length).toBe(1);
  });
  it("Tab 키는 패널로 간다 — 고른 탭만 멈추고 패널이 tabIndex 0", () => {
    const { container } = render(<TwoTabs />);
    expect(screen.getByRole("tab", { name: "기본" }).tabIndex).toBe(0);
    expect(screen.getByRole("tab", { name: "예외" }).tabIndex).toBe(-1);
    expect((container.querySelector(".tab-panel") as HTMLElement).tabIndex).toBe(0);
  });
  it("넘치면 탭 줄만 옮겨 고른 탭을 보이게 한다", () => {
    const bar = document.createElement("div"); bar.className = "tabs";
    const tab = document.createElement("button"); bar.append(tab);
    Object.defineProperty(bar, "scrollWidth", { value: 900 }); Object.defineProperty(bar, "clientWidth", { value: 400 });
    bar.getBoundingClientRect = () => ({ left: 0, right: 400 }) as DOMRect;
    tab.getBoundingClientRect = () => ({ left: 500, right: 560 }) as DOMRect;
    revealTab(tab);
    expect(bar.scrollLeft).toBe(176);
    tab.getBoundingClientRect = () => ({ left: -100, right: -40 }) as DOMRect;
    bar.scrollLeft = 300; revealTab(tab);
    expect(bar.scrollLeft).toBe(184);
  });
  it("고른 탭이 바뀌면 그 탭을 보이게 한다", () => {
    const sw = vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(900);
    const cw = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(400);
    const rect = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) { return (this.classList.contains("tabs") ? { left: 0, right: 400 } : this.textContent === "예외" ? { left: 500, right: 560 } : { left: 20, right: 80 }) as DOMRect; });
    const { container } = render(<TwoTabs />);
    expect((container.querySelector(".tabs") as HTMLElement).scrollLeft).toBe(0);
    fireEvent.click(screen.getByRole("tab", { name: "예외" }));
    expect((container.querySelector(".tabs") as HTMLElement).scrollLeft).toBe(176);
    sw.mockRestore(); cw.mockRestore(); rect.mockRestore();
  });
  it("넘치지 않으면 움직이지 않는다", () => {
    const bar = document.createElement("div"); bar.className = "tabs";
    const tab = document.createElement("button"); bar.append(tab);
    Object.defineProperty(bar, "scrollWidth", { value: 400 }); Object.defineProperty(bar, "clientWidth", { value: 400 });
    bar.getBoundingClientRect = () => ({ left: 0, right: 400 }) as DOMRect;
    tab.getBoundingClientRect = () => ({ left: 500, right: 560 }) as DOMRect;
    bar.scrollLeft = 7; revealTab(tab);
    expect(bar.scrollLeft).toBe(7);
  });
});

describe("Navigation", () => {
  it("접힌 레일은 title 대신 aria-label + Tooltip", () => {
    render(<SideNav collapsed><SideNavItem href="#" icon="home">대시보드</SideNavItem></SideNav>);
    const a = screen.getByRole("link", { name: "대시보드" });
    expect(a.hasAttribute("title")).toBe(false);
    expect(a.getAttribute("aria-label")).toBe("대시보드");
    expect(a.parentElement!.classList.contains("tooltip-wrap")).toBe(true);
    const tip = a.parentElement!.querySelector(".tooltip")!;
    expect(tip.textContent).toBe("대시보드");
    expect(tip.classList.contains("right")).toBe(true);
  });
  it("펼친 레일에는 Tooltip 이 없다", () => {
    const { container } = render(<SideNav><SideNavItem href="#" icon="home">대시보드</SideNavItem></SideNav>);
    expect(container.querySelector(".tooltip-wrap")).toBeNull();
    expect(container.querySelector("a")!.hasAttribute("aria-label")).toBe(false);
  });
  it("접힌 레일에서 숨는 하위 항목에는 Tooltip 을 달지 않는다", () => {
    const { container } = render(<SideNav collapsed><SideNavItem href="#" sub>USB 제어</SideNavItem></SideNav>);
    expect(container.querySelector(".tooltip-wrap")).toBeNull();
  });
  it("직접 준 title 은 그대로 둔다", () => {
    render(<SideNav><SideNavItem href="#" title="설명">대시보드</SideNavItem></SideNav>);
    expect(screen.getByRole("link").getAttribute("title")).toBe("설명");
  });
  it("SkipLink 는 기본 문구 · #main", () => {
    render(<SkipLink />);
    const a = screen.getByRole("link", { name: "본문 바로가기" });
    expect(a.getAttribute("href")).toBe("#main");
    expect(a.className).toBe("skip-link");
  });
});

describe("TagGroup", () => {
  const five = ["내부망", "재택", "협력사", "서버실", "임원"].map((t) => <Tag key={t}>{t}</Tag>);
  it("max 를 넘으면 앞 n개 + 포커스 받는 +N, 나머지 이름은 Tooltip", () => {
    const { container } = render(<TagGroup max={2} moreLabel={(n) => `분류 ${n}개 더 보기`}>{five}</TagGroup>);
    expect(container.querySelectorAll(".tag-group > .tag").length).toBe(2);
    const b = screen.getByRole("button", { name: "분류 3개 더 보기" });
    expect(b.textContent).toBe("+3");
    expect(b.className).toContain("tag-more");
    expect(container.querySelector(".tooltip")!.textContent).toBe("협력사, 서버실, 임원");
    expect(b.getAttribute("aria-describedby")).toBe(container.querySelector(".tooltip")!.id);
  });
  it("max 가 없거나 넘지 않으면 전부 보이고 +N 이 없다", () => {
    const a = render(<TagGroup>{five}</TagGroup>);
    expect(a.container.querySelectorAll(".tag").length).toBe(5);
    expect(a.container.querySelector(".tag-more")).toBeNull();
    a.unmount();
    const b = render(<TagGroup max={5}>{five}</TagGroup>);
    expect(b.container.querySelector(".tag-more")).toBeNull();
  });
});

describe("Tooltip 과 스크롤", () => {
  const Clip = () => <div style={{ overflow: "auto" }}><TagGroup max={1}><Tag>가</Tag><Tag>나</Tag></TagGroup></div>;
  it("포커스로 뜬 툴팁은 스크롤해도 남고, 마우스로 뜬 것은 닫힌다", () => {
    const a = render(<Clip />);
    const wrap = a.container.querySelector(".tooltip-wrap")!, b = a.container.querySelector("button")!;
    b.focus(); fireEvent.focus(b);
    expect(a.container.querySelector(".tooltip.float")).not.toBeNull();
    fireEvent.scroll(window);
    expect(wrap.classList.contains("quiet")).toBe(false);
    a.unmount();
    const c = render(<Clip />);
    const w2 = c.container.querySelector(".tooltip-wrap")!;
    fireEvent.mouseEnter(w2);
    fireEvent.scroll(window);
    expect(w2.classList.contains("quiet")).toBe(true);
  });
});

describe("Count", () => {
  it("0 은 그리지 않고 99 를 넘으면 99+", () => {
    const a = render(<Count value={0} />);
    expect(a.container.firstChild).toBeNull();
    a.unmount();
    const b = render(<Count value={120} />);
    expect(b.container.textContent).toBe("99+");
  });
});

describe("Steps", () => {
  const ITEMS = ["기본", "대상", "규칙", "배포"];
  it("onStepClick 이 있으면 완료 단계만 버튼이다", () => {
    const fn = vi.fn();
    const { container } = render(<Steps items={ITEMS} current={2} onStepClick={fn} />);
    const b = container.querySelectorAll(".step-btn");
    expect(b.length).toBe(2);
    fireEvent.click(b[1]);
    expect(fn).toHaveBeenCalledWith(1);
    expect(container.querySelector("li.on button")).toBeNull();
    expect(container.querySelectorAll("li:not(.done) button").length).toBe(0);
  });
  it("onStepClick 이 없으면 버튼이 없다", () => {
    const { container } = render(<Steps items={ITEMS} current={2} />);
    expect(container.querySelector("button")).toBeNull();
    expect(container.querySelector("li.on")!.getAttribute("aria-current")).toBe("step");
  });
  it("돌아가면 그 뒤 단계는 다시 미완료", () => {
    const Demo = () => { const [c, set] = useState(3); return <Steps items={ITEMS} current={c} onStepClick={set} />; };
    const { container } = render(<Demo />);
    fireEvent.click(container.querySelectorAll(".step-btn")[0]);
    expect(container.querySelectorAll("li.done").length).toBe(0);
    expect(container.querySelector("li.on")!.textContent).toContain("기본");
  });
  it("3~6단계를 벗어나면 경고한다", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const a = render(<Steps items={ITEMS} current={0} />);
    expect(warn).not.toHaveBeenCalled();
    a.unmount();
    const b = render(<Steps items={["a", "b"]} current={0} />);
    expect(warn).toHaveBeenCalledTimes(1);
    b.unmount();
    render(<Steps items={["a", "b", "c", "d", "e", "f", "g"]} current={0} />);
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });
});
