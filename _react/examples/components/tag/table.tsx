import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tag, TagGroup } from "@jiran/ds-react";

const ROWS: [string, string[]][] = [
  ["외부 USB 차단", ["내부망", "재택 근무", "외부 협력사", "서버실", "임원"]],
  ["웹 필터 기본", ["전사"]],
];

export default function Example() {
  return (
    <Table compact wrapStyle={{ maxWidth: 480 }}>
      <TableHead>
        <TableRow>
          <TableHeader>정책</TableHeader>
          <TableHeader>분류</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {ROWS.map(([name, tags]) => (
          <TableRow key={name}>
            <TableCell>{name}</TableCell>
            <TableCell>
              <TagGroup max={2} moreLabel={(n) => `분류 ${n}개 더 보기`}>
                {tags.map((t) => <Tag key={t}>{t}</Tag>)}
              </TagGroup>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
