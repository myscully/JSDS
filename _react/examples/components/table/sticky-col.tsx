import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jiran/ds-react";

const ROWS = [
  ["영업팀", "312", "312", "298", "12", "312", "40", "2026. 09. 06"],
  ["개발팀", "184", "184", "0", "184", "120", "8", "2026. 09. 06"],
  ["인프라팀", "48", "48", "48", "48", "48", "2", "2026. 09. 02"],
];
const NUMS = ["에이전트", "USB 차단", "스크립트 제한", "원격 접속", "화면 캡처", "프린터"];

export default function Example() {
  return (
    <Table stickyColumn regionLabel="그룹별 정책 적용" wrapStyle={{ maxWidth: 640 }}>
      <caption className="sr-only">그룹별 정책 적용</caption>
      <TableHead>
        <TableRow><TableHeader>그룹</TableHeader>{NUMS.map((h) => <TableHeader key={h} num>{h}</TableHeader>)}<TableHeader>최근 배포</TableHeader></TableRow>
      </TableHead>
      <TableBody>
        {ROWS.map(([g, ...v]) => (
          <TableRow key={g}><TableCell>{g}</TableCell>{v.slice(0, 6).map((n, i) => <TableCell key={i} num>{n}</TableCell>)}<TableCell>{v[6]}</TableCell></TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
