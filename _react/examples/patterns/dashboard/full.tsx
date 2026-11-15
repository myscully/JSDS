import { Chart } from "chart.js/auto";
import { Button, Card, CardHead, CardTitle, ChartCard, ChartLegend, Donut, DonutRow, Icon, Indicator, Kpi, KpiGrid, PageHead, ProgressList, Row2, Row3, SelectButton, Stack, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jiran/ds-react";

import { ChartCanvas, SparkCanvas, presets } from "@jiran/ds-react/chart";

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
/* KPI 스파크 · 주간 비교(tone 없는 두 계열 → 한 톤 1 · 4 단계) — 사이트 patterns.data.js 의 DASH 와 같다 */
const CRITICAL = { label: "Critical 이벤트", data: [1021, 1088, 1046, 1132, 1150, 1146, 1284] };
const THREATS = { label: "신규 위협", data: [62, 70, 58, 81, 77, 96, 112] };
const WEEKS = {
  labels: ["랜섬웨어", "악성코드", "USB 위반", "정책 위반", "피싱"],
  series: [
    { label: "이번 주", data: [412, 306, 221, 115, 88] },
    { label: "지난 주", data: [349, 331, 198, 142, 97] },
  ],
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
        <Kpi tone="critical" label="Critical 이벤트" value="1,284" delta="12%" deltaDir="up" deltaTone="bad" note="전일 대비">
          <SparkCanvas chart={Chart} config={presets.spark(CRITICAL)} aria-label="Critical 이벤트 — 최근 7일 1,021건에서 1,284건으로 증가" />
        </Kpi>
        <Kpi label="차단률" value="99.2" unit="%" delta="0.3%p" deltaDir="up" deltaTone="good" note="전일 대비" />
        <Kpi label="연결 에이전트" value="1,247" unit="/ 1,284" note="37대 오프라인" />
        <Kpi label="신규 위협" value="112" delta="20%" deltaDir="up" deltaTone="bad" note="전일 대비">
          <SparkCanvas chart={Chart} config={presets.spark(THREATS)} aria-label="신규 위협 — 최근 7일 62건에서 112건으로 증가" />
        </Kpi>
      </KpiGrid>
      <Row3>
        <ChartCard title="탐지 추이" sub="최근 14일">
          <ChartCanvas chart={Chart} config={presets.timeseries(TREND)} aria-label="탐지 추이 — 최근 14일, Critical · High · Medium 누적 영역" />
        </ChartCard>
        <ChartCard title="심각도 분포">
          <DonutRow>
            <Donut segments={SEGMENTS} label="1,054" />
            <ChartLegend column items={SEGMENTS.map((s) => ({ label: s.label, value: s.value, tone: s.tone }))} />
          </DonutRow>
        </ChartCard>
      </Row3>
      <Row2>
        <ChartCard title="유형별 탐지" sub="주간 비교">
          <ChartCanvas chart={Chart} config={presets.bar(WEEKS)} aria-label="유형별 탐지 — 이번 주와 지난 주 비교, 랜섬웨어 412건이 가장 많음" />
        </ChartCard>
        <ChartCard title="부서별 패치 적용" sub="에이전트 기준">
          <ProgressList
            items={[
              { label: "개발팀", value: 412, max: 450, unit: "대" },
              { label: "영업팀", value: 236, max: 298, unit: "대" },
              { label: "운영팀", value: 128, max: 196, unit: "대" },
              { label: "재무팀", value: 66, max: 140, unit: "대" },
            ]}
          />
        </ChartCard>
      </Row2>
      <Card flush>
        <CardHead>
          <CardTitle>최근 Critical 이벤트</CardTitle>
          <Button variant="text" color="assistive" as="a" href="#" size="sm">전체 보기 →</Button>
        </CardHead>
        <Table nowrap>
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
