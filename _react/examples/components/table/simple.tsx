import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jiran/ds-react";

const ROWS = [
  ["영업팀", "312", "8", "2026-09-06"],
  ["개발팀", "184", "11", "2026-09-06"],
  ["인프라팀", "48", "14", "2026-09-02"],
];

export default function Example() {
  return (
    <Table wrapStyle={{ maxWidth: 640 }}>
      <TableHead>
        <TableRow>
          <TableHeader>그룹</TableHeader>
          <TableHeader num>에이전트</TableHeader>
          <TableHeader num>정책</TableHeader>
          <TableHeader>최근 배포</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {ROWS.map(([g, a, p, d]) => (
          <TableRow key={g}>
            <TableCell>{g}</TableCell>
            <TableCell num>{a}</TableCell>
            <TableCell num>{p}</TableCell>
            <TableCell>{d}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
