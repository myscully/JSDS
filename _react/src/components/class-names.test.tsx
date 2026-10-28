import { render } from "@testing-library/react";
import { Button } from "./button/Button";
import { SearchBar } from "./search/SearchBar";
import { SelectButton } from "./select-button/SelectButton";
import { Tag } from "./tag/Tag";
import { Pagination } from "./pagination/Pagination";
import { Row2, Row3 } from "../patterns/Patterns";

/* Tailwind 가 같은 이름으로 유틸리티를 만드는 클래스(.block · .outline · .row-2 · .row-3)는 쓰지 않는다.
   쓰는 앱에서 SelectButton 에 외곽선이 덧생기고(v3·v4), Button 이 display:block 이 됐다(v3). props 이름은 그대로다. */
describe("Tailwind 와 겹치지 않는 클래스", () => {
  it("block → .full-width", () => {
    const { container } = render(<><Button block>저장</Button><SearchBar block aria-label="검색" /></>);
    expect(container.querySelector(".btn")).toHaveClass("full-width");
    expect(container.querySelector(".searchbar")).toHaveClass("full-width");
    expect(container.querySelector(".block")).toBeNull();
  });
  it("outline → .outlined", () => {
    const { container } = render(<>
      <SelectButton outline label="보기" options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} defaultValue="a" />
      <Tag variant="outline">Critical</Tag>
      <Pagination outline page={1} total={5} onChange={() => {}} />
    </>);
    for (const sel of [".select-btn", ".tag", ".pagination"]) expect(container.querySelector(sel)).toHaveClass("outlined");
    expect(container.querySelector(".outline")).toBeNull();
  });
  it("Row2 · Row3 → .layout-row-2 · .layout-row-3", () => {
    const { container } = render(<><Row2 /><Row3 /></>);
    expect(container.querySelector(".layout-row-2")).not.toBeNull();
    expect(container.querySelector(".layout-row-3")).not.toBeNull();
  });
});
