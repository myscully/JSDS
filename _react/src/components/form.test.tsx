import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./checkbox/Checkbox";
import { Radio, RadioGroup } from "./radio-button/Radio";
import { SelectButton } from "./select-button/SelectButton";
import { SearchBar } from "./search/SearchBar";
import { Slider } from "./slider/Slider";
import { TextField } from "./text-field/TextField";
import { Chip } from "./chip/Chip";

describe("form controls", () => {
  it("Checkbox indeterminate → el.indeterminate + .mixed", () => {
    render(<Checkbox indeterminate>전체</Checkbox>);
    const cb = screen.getByRole("checkbox") as HTMLInputElement;
    expect(cb.indeterminate).toBe(true);
    expect(cb).toHaveClass("mixed");
  });
  it("RadioGroup 은 name 을 공유하고 선택을 관리한다", async () => {
    const onChange = vi.fn();
    render(
      <RadioGroup legend="동작" defaultValue="a" onChange={onChange}>
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioGroup>,
    );
    const [a, b] = screen.getAllByRole("radio") as HTMLInputElement[];
    expect(a.name).toBe(b.name);
    expect(a.checked).toBe(true);
    await userEvent.click(b);
    expect(onChange).toHaveBeenCalledWith("b");
    expect(b.checked).toBe(true);
  });
  it("SelectButton 은 aria-pressed 로 선택을 표시하고 변경을 알린다", async () => {
    const onChange = vi.fn();
    render(<SelectButton options={[{ value: "x", label: "X" }, { value: "y", label: "Y" }]} onChange={onChange} />);
    const y = screen.getByRole("button", { name: "Y" });
    expect(y).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(y);
    expect(onChange).toHaveBeenCalledWith("y");
    expect(y).toHaveAttribute("aria-pressed", "true");
    expect(y).toHaveClass("on");
  });
  it("SearchBar clearable 은 값이 있을 때만 지우기 버튼", async () => {
    render(<SearchBar clearable defaultValue="abc" />);
    const clear = screen.getByRole("button", { name: "지우기" });
    await userEvent.click(clear);
    expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("");
    expect(screen.queryByRole("button", { name: "지우기" })).toBeNull();
  });
  it("Slider 는 --p 를 계산한다", () => {
    render(<Slider label="v" min={0} max={200} defaultValue={50} />);
    const input = screen.getByRole("slider") as HTMLInputElement;
    expect(input.style.getPropertyValue("--p")).toBe("25%");
  });
  it("TextField error 는 aria-invalid + help 를 오류 문구로", () => {
    render(<TextField label="IP" error="형식 오류" />);
    const input = screen.getByLabelText("IP");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("형식 오류")).toHaveClass("help");
    expect(input.closest(".field")).toHaveClass("error");
  });
  it("Chip 필터 토글 / 삭제", async () => {
    const onSel = vi.fn(), onRemove = vi.fn();
    render(
      <>
        <Chip onSelectedChange={onSel}>A</Chip>
        <Chip onRemove={onRemove}>B</Chip>
      </>,
    );
    await userEvent.click(screen.getByRole("button", { name: "A" }));
    expect(onSel).toHaveBeenCalledWith(true);
    await userEvent.click(screen.getByRole("button", { name: "삭제" }));
    expect(onRemove).toHaveBeenCalled();
  });
});
