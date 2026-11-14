import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jiran/ds-react";

const ROWS = [
  ["1월", "982", "901", "91.8%"], ["2월", "1,040", "958", "92.1%"], ["3월", "1,117", "1,030", "92.2%"],
  ["4월", "1,096", "1,012", "92.3%"], ["5월", "1,233", "1,141", "92.5%"], ["6월", "1,180", "1,094", "92.7%"],
  ["7월", "1,204", "1,113", "92.4%"], ["8월", "1,388", "1,301", "93.7%"], ["9월", "1,054", "1,002", "95.1%"],
];

export default function Example() {
  return (
    <Table density="compact" stickyHeader maxHeight={240} regionLabel="월별 차단 현황" wrapStyle={{ maxWidth: 640 }}>
      <caption className="sr-only">월별 차단 현황</caption>
      <TableHead>
        <TableRow><TableHeader>월</TableHeader><TableHeader num>탐지</TableHeader><TableHeader num>차단</TableHeader><TableHeader num>차단율</TableHeader></TableRow>
      </TableHead>
      <TableBody>
        {ROWS.map(([m, ...n]) => (
          <TableRow key={m}><TableCell>{m}</TableCell>{n.map((v, i) => <TableCell key={i} num>{v}</TableCell>)}</TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
