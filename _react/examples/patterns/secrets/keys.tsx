import { Button, CopyField, Icon, Indicator, PageHead, Stack, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jiran/ds-react";

/* 목록에는 알아볼 수 있는 앞자리만 — 비밀값 전체는 두지 않는다. 만료 7일 안은 위험 점, 30일 안은 경고 점, 그보다 멀면 날짜만 */
const KEYS = [
  { name: "SIEM 연동", id: "key_01HF8Q", prefix: "jsk_live_8c2e", exp: <Indicator tone="danger">7일 남음</Indicator>, used: "09:41" },
  { name: "티켓 시스템", id: "key_01HD2K", prefix: "jsk_live_41f7", exp: <Indicator tone="warn">24일 남음</Indicator>, used: "어제" },
  { name: "보고서 내보내기", id: "key_01HA9M", prefix: "jsk_live_a9b3", exp: "2027. 03. 31", used: "11. 02" },
];

export default function Example() {
  return (
    <Stack>
      <PageHead as="h2" title="API 키" actions={<Button iconLeft={<Icon name="plus" />}>API 키 만들기</Button>} />
      <Table hover nowrap>
        <TableHead>
          <TableRow>
            <TableHeader>이름</TableHeader><TableHeader>키 ID</TableHeader><TableHeader>앞자리</TableHeader><TableHeader sortable sorted="asc">만료</TableHeader><TableHeader>마지막 사용</TableHeader>
            <TableHeader actions><span className="sr-only">동작</span></TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {KEYS.map((k) => (
            <TableRow key={k.id}>
              <TableCell>{k.name}</TableCell>
              <TableCell><CopyField inline label={`${k.name} 키 ID`} value={k.id} /></TableCell>
              <TableCell>{k.prefix}</TableCell>
              <TableCell>{k.exp}</TableCell>
              <TableCell>{k.used}</TableCell>
              <TableCell actions><Button variant="outline" color="assistive" size="sm" aria-label={`${k.name} 키 재발급`}>재발급</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Stack>
  );
}
