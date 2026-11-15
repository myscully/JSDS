import { Button, ButtonGroup, Icon, Notice, Stack, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tag } from "@jiran/ds-react";

const FAILED = [
  { host: "PC-2041", ip: "10.0.4.21", kind: "오프라인", why: "마지막 연결 3일 전", at: "09:41" },
  { host: "PC-1187", ip: "10.0.4.33", kind: "버전", why: "에이전트 4.2 이상이 필요합니다", at: "09:42" },
  { host: "Server-03", ip: "10.0.0.3", kind: "시간 초과", why: "응답이 없습니다", at: "09:44" },
];

/* 결과 — 실패한 대상과 이유를 표로. 실패한 대상만 다시 실행하고, 실패 목록은 파일로도 내려받는다 */
export default function Example() {
  return (
    <Stack>
      <Notice tone="warning" title="1,284대 중 3대에 배포하지 못했습니다"
        actions={<Button variant="outline" color="assistive" size="sm"><Icon name="download" />실패 목록 내려받기</Button>}>
        원인을 고친 뒤 실패한 단말만 다시 배포하세요.
      </Notice>
      <Table density="compact" nowrap>
        <TableHead>
          <TableRow><TableHeader>단말</TableHeader><TableHeader>IP</TableHeader><TableHeader>이유</TableHeader><TableHeader>시도</TableHeader></TableRow>
        </TableHead>
        <TableBody>
          {FAILED.map((r) => (
            <TableRow key={r.host}>
              <TableCell>{r.host}</TableCell>
              <TableCell>{r.ip}</TableCell>
              <TableCell><Tag tone="high" size="sm">{r.kind}</Tag> {r.why}</TableCell>
              <TableCell>{r.at}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ButtonGroup end>
        <Button variant="outline" color="assistive">닫기</Button>
        <Button>실패한 3대 다시 배포</Button>
      </ButtonGroup>
    </Stack>
  );
}
