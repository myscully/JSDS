import { describe, it, expect, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import {
  Combobox, Dropdown, DropdownTrigger, Field, Form, Menu, MenuActionArea, MenuCheckboxItem, MenuGroup, MenuItem, MenuRadioGroup, MenuRadioItem, Select,
} from "../src";

/* 2026-11-23 — 메뉴 체크 · 라디오 항목 · 적용 영역, Select 여러 개, Combobox 칩 넘침(사람의 결정 넷) */
const tick = () => act(() => new Promise<void>((r) => setTimeout(r, 5)));
const TEAMS = [{ value: "sales", label: "영업팀" }, { value: "dev", label: "개발팀" }, { value: "infra", label: "인프라팀" }];

describe("Dropdown 체크 · 라디오 항목", () => {
  it("체크 항목은 누르면 뒤집히고 메뉴는 열린 채 · 포커스가 그 항목에 남는다", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <Dropdown kind="menu">
        <DropdownTrigger>보기</DropdownTrigger>
        <Menu label="보기">
          <MenuCheckboxItem value="utc" onCheckedChange={onChange}>UTC 로 보기</MenuCheckboxItem>
          <MenuCheckboxItem value="hidden">숨긴 이벤트</MenuCheckboxItem>
          <MenuItem>새로 고침</MenuItem>
        </Menu>
      </Dropdown>,
    );
    fireEvent.click(screen.getByText("보기"));
    await tick();
    const item = screen.getByText("UTC 로 보기").closest("li")!;
    expect(item.getAttribute("role")).toBe("menuitemcheckbox");
    expect(item.getAttribute("aria-checked")).toBe("false");
    expect(item.querySelector(".menu-mark.check")?.getAttribute("aria-hidden")).toBe("true");
    fireEvent.click(item);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(item.getAttribute("aria-checked")).toBe("true");
    expect(container.querySelector(".dropdown.open")).not.toBeNull();
    expect(document.activeElement).toBe(item);
    /* 키보드 — Space 도 뒤집고 열린 채 */
    fireEvent.keyDown(item, { key: " " });
    expect(item.getAttribute("aria-checked")).toBe("false");
    expect(container.querySelector(".dropdown.open")).not.toBeNull();
    /* 실행 항목은 지금처럼 닫는다 */
    fireEvent.click(screen.getByText("새로 고침"));
    await tick();
    expect(container.querySelector(".dropdown.open")).toBeNull();
  });

  it("라디오 항목은 이름 있는 묶음 안에서 하나만 켜진다 · 설명 줄", async () => {
    const onValueChange = vi.fn();
    render(
      <Dropdown kind="menu" defaultOpen>
        <DropdownTrigger>정렬</DropdownTrigger>
        <Menu label="정렬">
          <MenuRadioGroup label="정렬 기준" name="sort" defaultValue="latest" onValueChange={onValueChange}>
            <MenuRadioItem value="latest">최신순</MenuRadioItem>
            <MenuRadioItem value="severity" description="Critical 부터">심각도순</MenuRadioItem>
          </MenuRadioGroup>
        </Menu>
      </Dropdown>,
    );
    const group = screen.getByRole("group");
    expect(group.getAttribute("data-name")).toBe("sort");
    expect(document.getElementById(group.getAttribute("aria-labelledby")!)!.textContent).toBe("정렬 기준");
    const sev = screen.getByText("심각도순").closest("li")!;
    expect(sev.querySelector(".menu-text > .menu-name")!.textContent).toBe("심각도순");
    expect(sev.querySelector(".menu-desc")!.textContent).toBe("Critical 부터");
    expect(sev.querySelector(".menu-mark.round")).not.toBeNull();
    fireEvent.click(sev);
    expect(onValueChange).toHaveBeenCalledWith("severity");
    expect(Array.from(group.querySelectorAll("[role=menuitemradio]")).map((r) => r.getAttribute("aria-checked"))).toEqual(["false", "true"]);
  });

  it("글자로 찾기는 설명 줄을 보지 않는다", async () => {
    render(
      <Dropdown kind="menu" defaultOpen>
        <DropdownTrigger>열기</DropdownTrigger>
        <Menu label="보기">
          <MenuGroup label="표시">
            <MenuCheckboxItem value="a" description="Zulu">Alpha</MenuCheckboxItem>
            <MenuCheckboxItem value="z">Zebra</MenuCheckboxItem>
          </MenuGroup>
        </Menu>
      </Dropdown>,
    );
    await tick();
    fireEvent.keyDown(document.activeElement!, { key: "z" });
    expect(document.activeElement!.textContent).toBe("Zebra");
  });

  it("적용 영역 — 적용하면 onApply 뒤 닫히고 트리거로, 적용 없이 닫으면 onDiscard", async () => {
    const onApply = vi.fn();
    const onDiscard = vi.fn();
    const { container } = render(
      <Dropdown kind="menu" onDiscard={onDiscard}>
        <DropdownTrigger>필터</DropdownTrigger>
        <Menu label="필터" actions={<MenuActionArea onApply={onApply} />}>
          <MenuCheckboxItem value="a">차단</MenuCheckboxItem>
          <MenuCheckboxItem value="b">허용</MenuCheckboxItem>
          <MenuCheckboxItem value="c">검토 대기</MenuCheckboxItem>
        </Menu>
      </Dropdown>,
    );
    fireEvent.click(screen.getByText("필터"));
    await tick();
    const frame = container.querySelector(".menu[data-actions]")!;
    expect(frame.getAttribute("role")).toBe("presentation");
    expect(frame.querySelector(":scope > ul.menu-items[role=menu]")).not.toBeNull();
    expect(frame.querySelector(":scope > .menu-actions.btn-group [data-menu-action=apply]")).not.toBeNull();
    /* Esc 로 닫으면 버림 */
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    await tick();
    expect(onDiscard).toHaveBeenCalledTimes(1);
    /* 적용하면 버림이 아니다 */
    fireEvent.click(screen.getByText("필터"));
    await tick();
    fireEvent.click(screen.getByText("적용"));
    await tick();
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onDiscard).toHaveBeenCalledTimes(1);
    expect(container.querySelector(".dropdown.open")).toBeNull();
    expect(document.activeElement!.textContent).toBe("필터");
  });
});

describe("Select 여러 개", () => {
  it("옵션은 앞 체크 · aria-selected(.on 없음), 누르면 열린 채 값이 늘고 숨은 input 이 값마다", async () => {
    const onChange = vi.fn();
    const { container } = render(<Select multiple options={TEAMS} placeholder="그룹 선택" label="그룹" name="teams" onChange={onChange} />);
    const trigger = container.querySelector(".trigger")!;
    expect(container.querySelector(".dropdown")!.hasAttribute("data-multiple")).toBe(true);
    expect(trigger.getAttribute("data-placeholder")).toBe("그룹 선택");
    expect(trigger.querySelector(".placeholder")!.textContent).toBe("그룹 선택");
    fireEvent.click(trigger);
    await tick();
    expect(screen.getByRole("listbox").getAttribute("aria-multiselectable")).toBe("true");
    fireEvent.click(screen.getByText("인프라팀"));
    fireEvent.click(screen.getByText("영업팀"));
    expect(onChange).toHaveBeenLastCalledWith(["sales", "infra"]);   // 옵션 순서대로
    const opts = screen.getAllByRole("option");
    expect(opts.map((o) => o.getAttribute("aria-selected"))).toEqual(["true", "false", "true"]);
    expect(container.querySelectorAll(".menu-item.on").length).toBe(0);
    expect(opts[0].querySelector(".menu-mark.check")).not.toBeNull();
    expect(container.querySelector(".dropdown.open")).not.toBeNull();
    expect(trigger.querySelector(".trigger-text")!.textContent).toBe("영업팀, 인프라팀");
    expect(Array.from(container.querySelectorAll<HTMLInputElement>("input[type=hidden][name=teams]")).map((i) => i.value)).toEqual(["sales", "infra"]);
  });

  it("모두 고르면 allSelectedLabel · overflow wrap", () => {
    const { container } = render(<Select multiple options={TEAMS} defaultValue={["sales", "dev", "infra"]} allSelectedLabel="전체 그룹" overflow="wrap" label="그룹" />);
    expect(container.querySelector(".trigger-text")!.textContent).toBe("전체 그룹");
    expect(container.querySelector(".dropdown")!.getAttribute("data-overflow")).toBe("wrap");
  });

  it("actions — 고르는 것은 초안이고 적용할 때만 onChange, 적용 없이 닫으면 열기 전으로", async () => {
    const onChange = vi.fn();
    const Demo = () => {
      const [v, setV] = useState<string[]>(["dev"]);
      return <Select multiple actions options={TEAMS} value={v} onChange={(x) => { onChange(x); setV(x); }} label="그룹" />;
    };
    const { container } = render(<Demo />);
    const trigger = container.querySelector(".trigger") as HTMLElement;
    fireEvent.click(trigger);
    await tick();
    fireEvent.click(screen.getByText("영업팀"));
    expect(onChange).not.toHaveBeenCalled();
    expect(trigger.textContent).toBe("영업팀, 개발팀");   // 트리거는 초안을 따라간다
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    await tick();
    expect(trigger.textContent).toBe("개발팀");
    fireEvent.click(trigger);
    await tick();
    fireEvent.click(screen.getByText("초기화"));
    fireEvent.click(screen.getByText("인프라팀"));
    fireEvent.click(screen.getByText("적용"));
    await tick();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(["infra"]);
    expect(container.querySelector(".dropdown.open")).toBeNull();
    expect(trigger.textContent).toBe("인프라팀");
  });

  it("required — 비운 채 제출하면 막히고 고르면 지운다", async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const { container } = render(
      <Form validate onSubmit={onSubmit}>
        <Field label="그룹" required><Select multiple required name="g" options={TEAMS} label="그룹" placeholder="고르세요" keepMounted /></Field>
        <button type="submit">저장</button>
      </Form>,
    );
    fireEvent.click(screen.getByText("저장"));
    await tick();
    expect(onSubmit).not.toHaveBeenCalled();
    const trigger = container.querySelector(".trigger")!;
    expect(trigger.getAttribute("aria-invalid")).toBe("true");
    fireEvent.click(trigger);
    await tick();
    fireEvent.click(screen.getByText("개발팀"));
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    await tick();
    expect(trigger.getAttribute("aria-invalid")).toBeNull();
  });
});

describe("Combobox 칩 넘침", () => {
  it("여러 개는 기본 가로 스크롤(data-overflow 없음), wrap 이면 data-overflow=wrap · 단일에는 붙지 않는다", () => {
    const { container, rerender } = render(<Combobox multiple options={TEAMS} label="부서" />);
    const cb = () => container.querySelector(".combobox")!;
    expect(cb().hasAttribute("data-overflow")).toBe(false);
    expect(container.querySelector(".control-track")).not.toBeNull();
    rerender(<Combobox multiple overflow="wrap" options={TEAMS} label="부서" />);
    expect(cb().getAttribute("data-overflow")).toBe("wrap");
    rerender(<Combobox overflow="wrap" options={TEAMS} label="부서" />);
    expect(cb().hasAttribute("data-overflow")).toBe(false);
  });
});
