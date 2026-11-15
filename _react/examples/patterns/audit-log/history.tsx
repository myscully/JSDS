import { Button, Card, CardHead, CardTitle, Stack, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tag } from "@jiran/ds-react";

const VERSIONS = [
  { v: "v12", by: "이서연", at: "11-15 10:12", what: "USB 저장장치 차단 끔 외 1건", current: true },
  { v: "v11", by: "김민준", at: "11-10 16:40", what: "예약 검사 시각 02:00" },
  { v: "v10", by: "이서연", at: "11-02 11:05", what: "랜섬웨어 행위 차단 켬" },
];
const DIFF = [
  ["USB 저장장치 차단", "켬", "끔"],
  ["예외 단말", "PC-0932, PC-1187", "PC-0932, PC-1187, PC-2041"],
];

/* 되돌리기도 새 버전을 하나 만든다 — 누르면 위험 작업 확인을 거친다(제품 몫) */
export default function Example() {
  return (
    <Stack>
      <Card flush>
        <CardHead><CardTitle>표준 보호 · 변경 이력</CardTitle></CardHead>
        <Table nowrap>
          <TableHead><TableRow><TableHeader>버전</TableHeader><TableHeader>바꾼 사람</TableHeader><TableHeader>시각</TableHeader><TableHeader>내용</TableHeader><TableHeader><span className="sr-only">동작</span></TableHeader></TableRow></TableHead>
          <TableBody>
            {VERSIONS.map((r) => (
              <TableRow key={r.v}>
                <TableCell>{r.v}{r.current && <> <Tag tone="accent" size="sm">현재</Tag></>}</TableCell>
                <TableCell>{r.by}</TableCell>
                <TableCell>{r.at}</TableCell>
                <TableCell>{r.what}</TableCell>
                <TableCell className="actions">{!r.current && <Button variant="outline" color="assistive" size="sm" aria-label={`${r.v} 버전으로 되돌리기`}>되돌리기</Button>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <Card flush>
        <CardHead><CardTitle>v11 과 v12 비교</CardTitle></CardHead>
        <Table rowStyle="grid">
          <TableHead><TableRow><TableHeader>항목</TableHeader><TableHeader>변경 전 · v11</TableHeader><TableHeader>변경 후 · v12</TableHeader></TableRow></TableHead>
          <TableBody>
            {DIFF.map(([k, a, b]) => (
              <TableRow key={k}><TableCell>{k}</TableCell><TableCell>{a}</TableCell><TableCell>{b}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Stack>
  );
}
