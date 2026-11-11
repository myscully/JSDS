import { Table, TableBody, TableCell, TableFoot, TableHead, TableHeader, TableRow } from "@jiran/ds-react";

const ROWS = [
  ["7월", "1,204", "1,113", "91", "92.4%"],
  ["8월", "1,388", "1,301", "87", "93.7%"],
  ["9월", "1,054", "1,002", "52", "95.1%"],
];

export default function Example() {
  return (
    <Table density="compact" rowStyle="grid" wrapStyle={{ maxWidth: 640 }}>
      <TableHead>
        <TableRow><TableHeader>월</TableHeader><TableHeader num>탐지</TableHeader><TableHeader num>차단</TableHeader><TableHeader num>허용</TableHeader><TableHeader num>차단율</TableHeader></TableRow>
      </TableHead>
      <TableBody>
        {ROWS.map(([m, ...n]) => (
          <TableRow key={m}><TableCell>{m}</TableCell>{n.map((v, i) => <TableCell key={i} num>{v}</TableCell>)}</TableRow>
        ))}
      </TableBody>
      <TableFoot>
        <TableRow total><TableCell>3개월 합계</TableCell><TableCell num>3,646</TableCell><TableCell num>3,416</TableCell><TableCell num>230</TableCell><TableCell num>93.7%</TableCell></TableRow>
      </TableFoot>
    </Table>
  );
}
