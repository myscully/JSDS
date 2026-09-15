import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tab, TabList, TabPanel, Tabs } from "./tab/Tabs";
import { Pagination, paginate } from "./pagination/Pagination";

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
