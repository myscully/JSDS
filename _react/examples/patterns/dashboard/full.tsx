import { BarChart, Button, Card, CardHead, CardTitle, ChartCard, ChartLegend, Donut, DonutRow, Icon, Indicator, Kpi, KpiGrid, PageHead, Row3, SelectButton, Stack, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jiran/ds-react";

const SEGMENTS = [
  { label: "Critical", value: 190, tone: "critical" as const },
  { label: "High", value: 285, tone: "high" as const },
  { label: "Medium", value: 316, tone: "medium" as const },
  { label: "Low", value: 263, tone: "low" as const },
];
const RECENT = [
  ["09:41:12", "랜섬웨어 행위 탐지", "PC-2041 · 김민준", "blocked"],
  ["09:36:47", "알려진 악성코드 차단", "PC-0932 · 박지훈", "blocked"],
  ["08:58:20", "C2 통신 시도", "PC-0411 · 최유진", "review"],
] as const;

export default function Example() {
  return (
    <Stack>
      <PageHead
        title="대시보드"
        sub="최근 갱신 09:41 · 자동 갱신 1분"
        actions={
          <>
            <SelectButton label="기간" defaultValue="24h" options={[{ value: "24h", label: "24시간" }, { value: "7d", label: "7일" }, { value: "30d", label: "30일" }]} />
            <Button variant="secondary" icon aria-label="새로 고침"><Icon name="refresh" /></Button>
          </>
        }
      />
      <KpiGrid>
        <Kpi tone="critical" label="Critical 이벤트" value="1,284" delta="12% 전일 대비" deltaDir="up" />
        <Kpi label="차단률" value="99.2" unit="%" delta="0.3%p" deltaDir="down" />
        <Kpi label="연결 에이전트" value="1,247" unit="/ 1,284" delta="37대 오프라인" />
        <Kpi label="미처리 검토" value="5" delta="24시간 내 처리" />
      </KpiGrid>
      <Row3>
        <ChartCard title="유형별 탐지">
          <BarChart max={500} rows={[{ label: "랜섬웨어", value: 412, tone: "critical" }, { label: "악성코드", value: 306, tone: "high" }, { label: "USB 위반", value: 221, tone: "medium" }, { label: "정책 위반", value: 115, tone: "low" }]} />
        </ChartCard>
        <ChartCard title="심각도 분포">
          <DonutRow>
            <Donut segments={SEGMENTS} label="1,054" />
            <ChartLegend column items={SEGMENTS.map((s) => ({ label: s.label, value: s.value, tone: s.tone }))} />
          </DonutRow>
        </ChartCard>
      </Row3>
      <Card style={{ padding: 0, gap: 0, overflow: "hidden" }}>
        <CardHead style={{ padding: "16px 24px" }}>
          <CardTitle>최근 Critical 이벤트</CardTitle>
          <Button as="a" href="#" size="sm" variant="text">전체 보기 →</Button>
        </CardHead>
        <Table wrap={false}>
          <TableHead><TableRow><TableHeader>시간</TableHeader><TableHeader>이벤트</TableHeader><TableHeader>대상</TableHeader><TableHeader>상태</TableHeader></TableRow></TableHead>
          <TableBody>
            {RECENT.map(([t, e, target, s]) => (
              <TableRow key={t}>
                <TableCell>{t}</TableCell><TableCell>{e}</TableCell><TableCell>{target}</TableCell>
                <TableCell>{s === "blocked" ? <Indicator tone="danger">차단</Indicator> : <Indicator tone="warn">검토 필요</Indicator>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Stack>
  );
}
