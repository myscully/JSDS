import { Chart } from "chart.js/auto";
import { Button, Card, CardHead, CardTitle, ChartCard, ChartLegend, Donut, DonutRow, Icon, Indicator, Kpi, KpiGrid, PageHead, Row3, SelectButton, Stack, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jiran/ds-react";

import { ChartCanvas, presets } from "@jiran/ds-react/chart";

/* 추이 — 심각도 누적 영역(탐색형, Chart.js). 데이터는 사이트 예제(patterns.data.js)와 같다 */
const TREND = {
  labels: ["10-21", "10-22", "10-23", "10-24", "10-25", "10-26", "10-27", "10-28", "10-29", "10-30", "10-31", "11-01", "11-02", "11-03"],
  series: [
    { label: "Critical", tone: "critical" as const, data: [12, 18, 9, 14, 22, 17, 11, 8, 15, 19, 24, 13, 10, 16] },
    { label: "High", tone: "high" as const, data: [30, 24, 41, 35, 28, 33, 39, 27, 31, 36, 44, 29, 25, 32] },
    { label: "Medium", tone: "medium" as const, data: [52, 48, 61, 55, 47, 58, 64, 49, 53, 60, 66, 51, 46, 57] },
  ],
  stacked: true,
};
const SEGMENTS = [
  { label: "Critical", value: 190, tone: "critical" as const },
  { label: "High", value: 285, tone: "high" as const },
  { label: "Medium", value: 196, tone: "medium" as const },
  { label: "Low", value: 120, tone: "low" as const },
  { label: "Info", value: 263, tone: "info" as const },
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
            <Button variant="outline" color="assistive" iconOnly aria-label="새로 고침"><Icon name="refresh" /></Button>
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
        <ChartCard title="탐지 추이" extra="최근 14일">
          <ChartCanvas chart={Chart} config={presets.timeseries(TREND)} aria-label="탐지 추이 — 최근 14일, Critical · High · Medium 누적 영역" />
        </ChartCard>
        <ChartCard title="심각도 분포">
          <DonutRow>
            <Donut segments={SEGMENTS} label="1,054" />
            <ChartLegend column items={SEGMENTS.map((s) => ({ label: s.label, value: s.value, tone: s.tone }))} />
          </DonutRow>
        </ChartCard>
      </Row3>
      <Card flush>
        <CardHead>
          <CardTitle>최근 Critical 이벤트</CardTitle>
          <Button variant="text" color="assistive" as="a" href="#" size="sm">전체 보기 →</Button>
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
