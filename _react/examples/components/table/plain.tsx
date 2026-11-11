import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jiran/ds-react";

const ROWS = [["정상", "1,236"], ["점검 필요", "36"], ["연결 끊김", "12"]];

export default function Example() {
  return (
    <Table density="compact" rowStyle="plain" wrapStyle={{ maxWidth: 360 }}>
      <TableHead>
        <TableRow><TableHeader>상태</TableHeader><TableHeader num>단말</TableHeader></TableRow>
      </TableHead>
      <TableBody>
        {ROWS.map(([s, n]) => <TableRow key={s}><TableCell>{s}</TableCell><TableCell num>{n}</TableCell></TableRow>)}
      </TableBody>
    </Table>
  );
}
