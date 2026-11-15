import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Tree, type TreeNode } from "../src";

/* Tree(2026-11-14) — 사이트 behave.tree 와 같은 규칙 */
const ORG: TreeNode[] = [
  { value: "hq", label: "본사", children: [
    { value: "sec", label: "보안팀", children: [{ value: "soc", label: "관제 파트" }, { value: "ir", label: "대응 파트" }] },
    { value: "dev", label: "개발팀", children: [{ value: "plat", label: "플랫폼 파트" }, { value: "app", label: "앱 파트" }] },
    { value: "ops", label: "경영지원팀" },
  ] },
  { value: "busan", label: "부산 지사", children: [{ value: "sales", label: "영업팀" }] },
];
/* 잎의 이름은 행 글자 전체(끈 이유 meta 포함 — '외부 협력사 권한 없음' 으로 읽힘)라 라벨 글자로 찾는다 */
const it_ = (name: string) => [...document.querySelectorAll<HTMLLIElement>('[role="treeitem"]')].find((e) => e.querySelector(":scope > .tree-row > .tree-label")!.textContent === name)!;
const live = async () => { await act(() => new Promise((r) => setTimeout(r, 80))); return document.querySelector("body > .ds-live")?.textContent; };   // announce 는 50ms 뒤에 적는다
const key = (el: Element, k: string) => fireEvent.keyDown(el, { key: k });
const row = (name: string) => it_(name).querySelector(":scope > .tree-row") as HTMLElement;
const toggle = (name: string) => it_(name).querySelector(":scope > .tree-row > .tree-toggle") as HTMLElement;
const tabStops = (c: HTMLElement) => [...c.querySelectorAll('[role="treeitem"][tabindex="0"]')].map((e) => e.querySelector(".tree-label")!.textContent);

describe("Tree — navigation", () => {
  it("renders the site structure: tree name, levels, labelled parents, hidden groups and one Tab stop on the selected item", () => {
    const { container } = render(<Tree label="조직" items={ORG} defaultExpanded={["hq", "sec"]} defaultSelected="soc" />);
    expect(screen.getByRole("tree", { name: "조직" })).toBeTruthy();
    expect(it_("관제 파트").getAttribute("aria-level")).toBe("3");
    expect(it_("관제 파트").getAttribute("aria-selected")).toBe("true");
    expect(it_("대응 파트").hasAttribute("aria-selected")).toBe(false);
    /* 상위의 이름은 제 라벨만 — 하위 글자까지 읽히지 않게 */
    expect(it_("본사").getAttribute("aria-labelledby")).toBe(it_("본사").querySelector(".tree-label")!.id);
    expect(it_("개발팀").getAttribute("aria-expanded")).toBe("false");
    expect((it_("개발팀").querySelector(":scope > ul.tree-group[role=group]") as HTMLElement).hidden).toBe(true);
    expect(it_("관제 파트").hasAttribute("aria-expanded")).toBe(false);
    expect(tabStops(container)).toEqual(["관제 파트"]);
  });

  it("arrows move through visible items, → expands then enters, ← collapses then climbs, Home · End; one Tab stop follows focus", () => {
    const { container } = render(<Tree label="조직" items={ORG} defaultExpanded={["hq", "sec"]} defaultSelected="soc" />);
    const seq: string[] = [];
    act(() => it_("관제 파트").focus());
    for (const k of ["ArrowDown", "ArrowDown", "ArrowRight", "ArrowRight", "ArrowLeft", "ArrowLeft", "ArrowLeft", "End", "Home"]) {
      key(document.activeElement!, k);
      seq.push(`${document.activeElement!.querySelector(".tree-label")!.textContent}:${it_("개발팀").getAttribute("aria-expanded")}`);
    }
    expect(seq).toEqual(["대응 파트:false", "개발팀:false", "개발팀:true", "플랫폼 파트:true", "개발팀:true", "개발팀:false", "본사:false", "부산 지사:false", "본사:false"]);
    expect(tabStops(container)).toEqual(["본사"]);
  });

  it("typing jumps by first letter (Hangul initials, repeats cycle) and * expands every sibling except lazy ones", () => {
    const items: TreeNode[] = [...ORG, { value: "idc", label: "IDC", lazy: true }];
    render(<Tree label="조직" items={items} defaultExpanded={["hq"]} onLoad={() => new Promise(() => {})} />);
    act(() => it_("본사").focus());
    key(it_("본사"), "ㄱ"); expect(document.activeElement).toBe(it_("개발팀"));
    key(it_("개발팀"), "ㄱ"); expect(document.activeElement).toBe(it_("경영지원팀"));
    key(it_("경영지원팀"), "*");
    expect(["보안팀", "개발팀"].map((n) => it_(n).getAttribute("aria-expanded"))).toEqual(["true", "true"]);
    act(() => it_("본사").focus()); key(it_("본사"), "*");
    expect(it_("부산 지사").getAttribute("aria-expanded")).toBe("true");
    expect(it_("IDC").getAttribute("aria-expanded")).toBe("false");
    expect(it_("IDC").hasAttribute("aria-busy")).toBe(false);
  });

  it("a row click selects without expanding, the chevron expands without selecting, focus alone never selects, Enter selects", () => {
    const onSelect = vi.fn(), onExpandedChange = vi.fn();
    render(<Tree label="조직" items={ORG} defaultExpanded={["hq"]} onSelect={onSelect} onExpandedChange={onExpandedChange} />);
    fireEvent.click(row("개발팀"));
    expect(it_("개발팀").getAttribute("aria-selected")).toBe("true");
    expect(it_("개발팀").getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(toggle("개발팀"));
    expect(it_("개발팀").getAttribute("aria-expanded")).toBe("true");
    expect(onExpandedChange).toHaveBeenLastCalledWith(["hq", "dev"], { value: "dev", expanded: true });
    key(document.activeElement!, "ArrowDown");
    expect(document.activeElement).toBe(it_("플랫폼 파트"));
    expect(it_("플랫폼 파트").hasAttribute("aria-selected")).toBe(false);
    key(document.activeElement!, "Enter");
    expect(onSelect.mock.calls.map((c) => c[0])).toEqual(["dev", "plat"]);
    /* 접으면 숨는 하위에 있던 포커스는 상위로 */
    fireEvent.click(toggle("개발팀"));
    expect(document.activeElement).toBe(it_("개발팀"));
  });
});

describe("Tree — checkable", () => {
  it("parents follow their children (mixed when partial), a parent drives every child, Space toggles", () => {
    const onCheckedChange = vi.fn();
    render(<Tree label="대상" checkable items={ORG} defaultExpanded={["hq", "sec", "dev"]} defaultChecked={["soc", "ops"]} onCheckedChange={onCheckedChange} />);
    expect(screen.getByRole("tree").getAttribute("aria-multiselectable")).toBe("true");
    const st = (...n: string[]) => n.map((x) => it_(x).getAttribute("aria-checked"));
    expect(st("본사", "보안팀", "관제 파트", "개발팀")).toEqual(["mixed", "mixed", "true", "false"]);
    expect(it_("관제 파트").hasAttribute("aria-selected")).toBe(false);
    fireEvent.click(row("본사"));
    expect(st("본사", "보안팀", "개발팀", "앱 파트")).toEqual(["true", "true", "true", "true"]);
    expect(onCheckedChange).toHaveBeenLastCalledWith(["hq", "sec", "soc", "ir", "dev", "plat", "app", "ops"], { value: "hq", checked: true });
    act(() => it_("앱 파트").focus()); key(it_("앱 파트"), " ");
    expect(st("앱 파트", "개발팀", "본사")).toEqual(["false", "mixed", "mixed"]);
    /* 셰브론은 펼치기만 */
    fireEvent.click(toggle("보안팀"));
    expect(st("보안팀")).toEqual(["true"]);
    expect(it_("보안팀").getAttribute("aria-expanded")).toBe("false");
  });

  it("a disabled item takes focus but never the check; its parent leaves it alone, stays mixed, and pressing it again clears", () => {
    const items: TreeNode[] = [{ value: "hq", label: "본사", children: [{ value: "sec", label: "보안팀" }, { value: "dev", label: "개발팀" }, { value: "x", label: "외부 협력사", disabled: true, meta: "권한 없음" }] }];
    render(<Tree label="대상" checkable items={items} defaultExpanded={["hq"]} defaultChecked={["sec"]} />);
    const st = (...n: string[]) => n.map((x) => it_(x).getAttribute("aria-checked"));
    expect(it_("외부 협력사").getAttribute("aria-disabled")).toBe("true");
    expect(it_("외부 협력사").textContent).toBe("외부 협력사권한 없음");   // 잎의 이름에 끈 이유가 함께 읽힌다
    fireEvent.click(row("외부 협력사"));
    expect(document.activeElement).toBe(it_("외부 협력사"));
    expect(st("외부 협력사")).toEqual(["false"]);
    fireEvent.click(row("본사"));
    expect(st("본사", "개발팀", "외부 협력사")).toEqual(["mixed", "true", "false"]);
    fireEvent.click(row("본사"));
    expect(st("본사", "보안팀", "개발팀")).toEqual(["false", "false", "false"]);
  });
});

describe("Tree — lazy", () => {
  it("expanding calls onLoad once, shows a busy spinner, then renders the children one level down", async () => {
    let done!: (v: TreeNode[]) => void;
    const onLoad = vi.fn(() => new Promise<TreeNode[]>((r) => { done = r; }));
    render(<Tree label="서버" items={[{ value: "idc", label: "본사 IDC", lazy: true }]} onLoad={onLoad} />);
    expect(it_("본사 IDC").getAttribute("aria-expanded")).toBe("false");
    expect(it_("본사 IDC").hasAttribute("data-lazy")).toBe(true);
    fireEvent.click(toggle("본사 IDC"));
    fireEvent.click(toggle("본사 IDC"));
    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(it_("본사 IDC").getAttribute("aria-busy")).toBe("true");
    expect(toggle("본사 IDC").querySelector(".spinner")).not.toBeNull();
    await act(async () => { done([{ value: "web", label: "WEB-01" }, { value: "db", label: "DB-01" }]); });
    expect(it_("본사 IDC").getAttribute("aria-expanded")).toBe("true");
    expect(it_("본사 IDC").hasAttribute("aria-busy")).toBe(false);
    expect(it_("본사 IDC").hasAttribute("data-lazy")).toBe(false);
    expect(["WEB-01", "DB-01"].map((n) => it_(n).getAttribute("aria-level"))).toEqual(["2", "2"]);
  });

  it("a failed load stays collapsed and lazy, says so at the row end and to screen readers; expanding again retries", async () => {
    let fail = true;
    const onLoad = vi.fn(() => (fail ? Promise.reject(new Error("x")) : Promise.resolve([{ value: "web", label: "WEB-01" }])));
    render(<Tree label="서버" items={[{ value: "idc", label: "부산 IDC", lazy: true }]} onLoad={onLoad} />);
    await act(async () => { fireEvent.click(toggle("부산 IDC")); });
    expect(it_("부산 IDC").getAttribute("aria-expanded")).toBe("false");
    expect(it_("부산 IDC").hasAttribute("data-lazy")).toBe(true);
    expect(row("부산 IDC").querySelector(".tree-meta.error")?.textContent).toBe("불러오지 못했습니다. 다시 펼치세요");
    expect(await live()).toBe("부산 IDC 하위 항목을 불러오지 못했습니다. 다시 펼치면 다시 불러옵니다.");
    fail = false;
    await act(async () => { fireEvent.click(toggle("부산 IDC")); });
    expect(onLoad).toHaveBeenCalledTimes(2);
    expect(row("부산 IDC").querySelector(".tree-meta.error")).toBeNull();
    expect(it_("WEB-01")).toBeTruthy();
  });
});

describe("Tree — search", () => {
  const ASSETS: TreeNode[] = [
    { value: "server", label: "서버", children: [{ value: "web", label: "웹 서버" }, { value: "db", label: "DB 서버" }] },
    { value: "pc", label: "단말", children: [{ value: "hq-pc", label: "본사 PC", children: [{ value: "sec-pc", label: "보안팀 PC" }] }, { value: "branch-pc", label: "지사 PC" }] },
  ];
  const shown = (c: HTMLElement) => [...c.querySelectorAll<HTMLElement>('[role="treeitem"]')].filter((e) => !e.closest("[hidden]")).map((e) => e.querySelector(".tree-label")!.textContent);

  it("keeps matches and their ancestors expanded, bolds the match, announces the count; ↓ from the box enters the tree", async () => {
    const { container } = render(<Tree label="자산" items={ASSETS} defaultExpanded={["server"]} searchable searchLabel="자산 검색" />);
    const box = screen.getByRole("searchbox", { name: "자산 검색" });
    fireEvent.change(box, { target: { value: "pc" } });
    expect(shown(container)).toEqual(["단말", "본사 PC", "보안팀 PC", "지사 PC"]);
    expect([...container.querySelectorAll("mark.tree-hit")].map((m) => m.textContent)).toEqual(["PC", "PC", "PC"]);
    expect(await live()).toBe("결과 3개");
    key(box, "ArrowDown");
    expect(document.activeElement).toBe(it_("단말"));
  });

  it("matches Hangul initials, shows the empty note, and clearing restores the pre-search expansion", async () => {
    const { container } = render(<Tree label="자산" items={ASSETS} defaultExpanded={["server"]} searchable searchLabel="자산 검색" />);
    const box = screen.getByRole("searchbox", { name: "자산 검색" });
    fireEvent.change(box, { target: { value: "ㄷㅁ" } });
    expect(shown(container)).toEqual(["단말"]);
    fireEvent.change(box, { target: { value: "없는이름" } });
    expect(shown(container)).toEqual([]);
    expect(container.querySelector(".tree-empty")?.textContent).toBe("검색 결과가 없습니다.");
    expect(await live()).toBe("검색 결과가 없습니다.");
    fireEvent.change(box, { target: { value: "" } });
    expect(container.querySelector(".tree-empty")).toBeNull();
    expect(shown(container)).toEqual(["서버", "웹 서버", "DB 서버", "단말"]);
  });
});
