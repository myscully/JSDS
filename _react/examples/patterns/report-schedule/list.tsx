import { Avatar, AvatarGroup, Button, Icon, Indicator, Link, Spacer, Stack, Switch, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Toolbar } from "@jiran/ds-react";

type Report = { id: string; name: string; cycle: string; next?: string; to: string[]; shown?: number; failed?: boolean; on: boolean };
/* 받는 사람이 다섯을 넘지 않아도 칸이 좁으면 앞의 둘만 보이고 나머지는 '외 N명' 으로 적는다(max) */
const REPORTS: Report[] = [
  { id: "weekly", name: "주간 보안 요약", cycle: "매주 월요일 09:00", next: "11-16 09:00", to: ["김민준", "이서연", "박지훈", "최유진", "정다은"], shown: 2, on: true },
  { id: "agent", name: "에이전트 상태", cycle: "매월 1일 08:00", next: "12-01 08:00", to: ["박지훈"], failed: true, on: true },
  { id: "threat", name: "위협 상세", cycle: "매일 02:00", to: ["최유진", "정다은"], on: false },
];

/* 예약 목록 — 주기 · 다음 발송 · 받는 사람 · 마지막 발송 결과. 잠시 멈출 때는 지우지 않고 사용을 끈다 */
export default function Example() {
  return (
    <Stack>
      <Toolbar>
        <Spacer />
        <Button iconLeft={<Icon name="plus" />}>새 보고서</Button>
      </Toolbar>
      <Table nowrap>
        <TableHead>
          <TableRow>
            <TableHeader>보고서</TableHeader><TableHeader>주기</TableHeader><TableHeader>다음 발송</TableHeader><TableHeader>받는 사람</TableHeader><TableHeader>마지막 발송</TableHeader><TableHeader>사용</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {REPORTS.map((r) => (
            <TableRow key={r.id}>
              <TableCell><Link href="#">{r.name}</Link></TableCell>
              <TableCell>{r.cycle}</TableCell>
              <TableCell>{r.next ?? <>—<span className="sr-only">없음</span></>}</TableCell>
              <TableCell>
                <AvatarGroup label={`${r.name} 받는 사람`} size="sm" max={r.shown}>
                  {r.to.map((n) => <Avatar key={n} initials={n[0]} role="img" aria-label={n} />)}
                </AvatarGroup>
              </TableCell>
              <TableCell>{r.failed ? <Indicator tone="danger">실패</Indicator> : <Indicator tone="ok">보냄</Indicator>}</TableCell>
              <TableCell><Switch defaultChecked={r.on} aria-label={`${r.name} 사용`} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Stack>
  );
}
