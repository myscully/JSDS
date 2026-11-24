import { Button, DataTable, Dropdown, DropdownTrigger, Icon, Menu, MenuItem, MenuSep, type DataTableColumn } from "@jiran/ds-react";

type Row = { id: string; name: string; target: string };
const ROWS: Row[] = [
  { id: "1", name: "외부 USB 차단", target: "전체" },
  { id: "2", name: "랜섬웨어 행위 차단", target: "영업팀" },
];
const COLUMNS: DataTableColumn<Row>[] = [
  { key: "name", header: "정책" },
  { key: "target", header: "대상" },
];

export default function Example() {
  return (
    <DataTable
      hover
      columns={COLUMNS}
      rows={ROWS}
      rowKey={(r) => r.id}
      actions={(r) => (
        <Dropdown kind="menu" align="end" keepMounted>
          <DropdownTrigger asChild>
            <Button size="sm" color="assistive" iconOnly tooltip aria-label={`${r.name} 더 보기`}><Icon name="dots" /></Button>
          </DropdownTrigger>
          <Menu>
            <MenuItem icon="pencil" onSelect={() => {}}>편집</MenuItem>
            <MenuItem icon="download" onSelect={() => {}}>내보내기</MenuItem>
            <MenuSep />
            <MenuItem icon="trash" danger onSelect={() => {}}>삭제</MenuItem>
          </Menu>
        </Dropdown>
      )}
    />
  );
}
