import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jiran/ds-react";

const ROWS = [
  ["영업팀", "담당 김민준", "외부 USB 차단", "POL-2041", "312"],
  ["개발팀", "담당 이서연", "스크립트 실행 제한", "POL-1187", "184"],
  ["인프라팀", "담당 박지훈", "원격 접속 허용 목록", "POL-0932", "48"],
];

export default function Example() {
  return (
    <Table density="relaxed" wrapStyle={{ maxWidth: 640 }}>
      <TableHead>
        <TableRow><TableHeader>그룹</TableHeader><TableHeader>정책</TableHeader><TableHeader num>에이전트</TableHeader></TableRow>
      </TableHead>
      <TableBody>
        {ROWS.map(([g, owner, p, id, n]) => (
          <TableRow key={g}><TableCell sub={owner}>{g}</TableCell><TableCell sub={id}>{p}</TableCell><TableCell num>{n}</TableCell></TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
