import { Button, Dropdown, DropdownTrigger, Icon, Menu, MenuActionArea, MenuCheckboxItem, MenuGroup, MenuRadioGroup, MenuRadioItem, MenuSep } from "@jiran/ds-react";
import { useState } from "react";

type Filter = { result: string[]; period: string };
const DEFAULT: Filter = { result: [], period: "7d" };

export default function Example() {
  /* 적용한 값과 초안 — 적용하면 초안이 값이 되고, 적용하지 않고 닫으면(onDiscard) 초안을 값으로 되돌린다 */
  const [applied, setApplied] = useState<Filter>({ result: ["blocked", "pending"], period: "7d" });
  const [draft, setDraft] = useState<Filter>(applied);
  const check = (v: string) => (on: boolean) => setDraft((d) => ({ ...d, result: on ? [...d.result, v] : d.result.filter((x) => x !== v) }));
  return (
    <Dropdown kind="menu" defaultOpen onDiscard={() => setDraft(applied)}>
      <DropdownTrigger asChild>
        <Button variant="outline" color="assistive"><Icon name="filter" />필터</Button>
      </DropdownTrigger>
      <Menu label="필터" actions={<MenuActionArea onReset={() => setDraft(DEFAULT)} onApply={() => setApplied(draft)} />}>
        <MenuGroup label="처리 결과" name="result">
          <MenuCheckboxItem value="blocked" checked={draft.result.includes("blocked")} onCheckedChange={check("blocked")}>차단</MenuCheckboxItem>
          <MenuCheckboxItem value="allowed" checked={draft.result.includes("allowed")} onCheckedChange={check("allowed")}>허용</MenuCheckboxItem>
          <MenuCheckboxItem value="pending" checked={draft.result.includes("pending")} onCheckedChange={check("pending")}>검토 대기</MenuCheckboxItem>
        </MenuGroup>
        <MenuSep />
        <MenuRadioGroup label="기간" name="period" value={draft.period} onValueChange={(period) => setDraft((d) => ({ ...d, period }))}>
          <MenuRadioItem value="1d">오늘</MenuRadioItem>
          <MenuRadioItem value="7d">최근 7일</MenuRadioItem>
          <MenuRadioItem value="30d">최근 30일</MenuRadioItem>
        </MenuRadioGroup>
      </Menu>
    </Dropdown>
  );
}
