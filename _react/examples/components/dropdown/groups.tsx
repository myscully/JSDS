import { Button, Dropdown, DropdownTrigger, Icon, Menu, MenuCheckboxItem, MenuGroup, MenuRadioGroup, MenuRadioItem, MenuSep } from "@jiran/ds-react";
import { useState } from "react";

export default function Example() {
  const [density, setDensity] = useState("default");
  const [hidden, setHidden] = useState(false);
  const [group, setGroup] = useState(true);
  return (
    <Dropdown kind="menu" defaultOpen>
      <DropdownTrigger asChild>
        <Button variant="outline" color="assistive"><Icon name="adjustments" />보기 설정</Button>
      </DropdownTrigger>
      <Menu label="보기 설정">
        <MenuRadioGroup label="밀도" name="density" value={density} onValueChange={setDensity}>
          <MenuRadioItem value="default">기본</MenuRadioItem>
          <MenuRadioItem value="compact" description="한 화면에 행을 더 많이 보여 줍니다">좁게</MenuRadioItem>
        </MenuRadioGroup>
        <MenuSep />
        <MenuGroup label="표시" name="show">
          <MenuCheckboxItem value="hidden" checked={hidden} onCheckedChange={setHidden} description="예외로 처리한 이벤트도 목록에 둡니다">숨긴 이벤트 보기</MenuCheckboxItem>
          <MenuCheckboxItem value="group" checked={group} onCheckedChange={setGroup}>같은 이벤트 묶기</MenuCheckboxItem>
        </MenuGroup>
      </Menu>
    </Dropdown>
  );
}
