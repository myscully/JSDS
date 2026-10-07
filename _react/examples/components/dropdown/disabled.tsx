import { Button, Dropdown, DropdownTrigger, Icon } from "@jiran/ds-react";

export default function Example() {
  return (
    <Dropdown kind="menu" disabled>
      <DropdownTrigger asChild>
        <Button variant="secondary" icon aria-label="더 보기" disabled><Icon name="dots" /></Button>
      </DropdownTrigger>
    </Dropdown>
  );
}
