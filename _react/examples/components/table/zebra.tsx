import { Icon, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jiran/ds-react";

const yes = <Icon name="check" size={16} />;
const ROWS: [string, React.ReactNode, React.ReactNode][] = [
  ["실시간 보호", yes, yes],
  ["USB 제어", yes, yes],
  ["행위 기반 탐지", "—", yes],
  ["감사 로그 보관", "30일", "1년"],
  ["SIEM 연동", "—", yes],
];

export default function Example() {
  return (
    <Table compact zebra wrapStyle={{ maxWidth: 640 }}>
      <TableHead>
        <TableRow><TableHeader>기능</TableHeader><TableHeader>Standard</TableHeader><TableHeader>Enterprise</TableHeader></TableRow>
      </TableHead>
      <TableBody>
        {ROWS.map(([f, s, e]) => (
          <TableRow key={f}><TableCell>{f}</TableCell><TableCell>{s}</TableCell><TableCell>{e}</TableCell></TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
