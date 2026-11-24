import { Button, Dropdown, DropdownTrigger, Icon, Menu, MenuRadioGroup, MenuRadioItem } from "@jiran/ds-react";
import { useState } from "react";

export default function Example() {
  const [sort, setSort] = useState("latest");
  return (
    <Dropdown kind="menu" defaultOpen>
      <DropdownTrigger asChild>
        <Button variant="outline" color="assistive"><Icon name="arrows-sort" />정렬</Button>
      </DropdownTrigger>
      <Menu label="정렬">
        <MenuRadioGroup label="정렬 기준" name="sort" value={sort} onValueChange={setSort}>
          <MenuRadioItem value="latest">최신순</MenuRadioItem>
          <MenuRadioItem value="oldest">오래된순</MenuRadioItem>
          <MenuRadioItem value="severity">심각도순</MenuRadioItem>
        </MenuRadioGroup>
      </Menu>
    </Dropdown>
  );
}
