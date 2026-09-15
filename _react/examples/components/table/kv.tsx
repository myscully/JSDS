import { Indicator, Table, TableBody, TableCell, TableHeader, TableRow } from "@jiran/ds-react";

export default function Example() {
  return (
    <Table kv wrapStyle={{ maxWidth: 560 }}>
      <TableBody>
        <TableRow><TableHeader>정책 ID</TableHeader><TableCell>POL-2041</TableCell></TableRow>
        <TableRow><TableHeader>이름</TableHeader><TableCell>외부 USB 차단</TableCell></TableRow>
        <TableRow><TableHeader>적용 그룹</TableHeader><TableCell>전체 (1,284대)</TableCell></TableRow>
        <TableRow><TableHeader>상태</TableHeader><TableCell><Indicator tone="ok">사용 중</Indicator></TableCell></TableRow>
        <TableRow><TableHeader>최근 수정</TableHeader><TableCell>2026-09-06 14:20 · admin@jiran.com</TableCell></TableRow>
      </TableBody>
    </Table>
  );
}
