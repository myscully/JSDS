import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jiran/ds-react";

const ROWS = [
  ["영업팀", "312", "2026. 09. 06"],
  ["개발팀", "184", "2026. 09. 06"],
  ["인프라팀", "48", "2026. 09. 02"],
];

/* 행 hover 는 옵션 — 행이 상세 화면으로 이어질 때만 켠다(2026-11-25) */
export default function Example() {
  return (
    <Table hover wrapStyle={{ maxWidth: 640 }}>
      <TableHead>
        <TableRow>
          <TableHeader>그룹</TableHeader>
          <TableHeader num>에이전트</TableHeader>
          <TableHeader>최근 배포</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {ROWS.map(([g, a, d]) => (
          <TableRow key={g}>
            <TableCell><a href="#" className="link">{g}</a></TableCell>
            <TableCell num>{a}</TableCell>
            <TableCell>{d}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
