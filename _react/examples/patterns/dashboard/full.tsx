import { Chart } from "chart.js/auto";
import { Button, ButtonGroup, Card, CardHead, CardTitle, ChartCard, Icon, Indicator, Kpi, KpiGrid, Link, PageHead, ProgressList, Row2, Row3, SelectButton, Stack, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jiran/ds-react";

import { ChartCanvas, presets } from "@jiran/ds-react/chart";

/* 일별 탐지 — 계열 하나인 추이(Data Visual Default 와 같은 데이터, 2026-11-18 — 그 전 심각도 누적 막대). 데이터는 사이트 예제(patterns.data.js DAILY14)와 같다 */
const DAILY = {
  labels: ["10-21", "10-22", "10-23", "10-24", "10-25", "10-26", "10-27", "10-28", "10-29", "10-30", "10-31", "11-01", "11-02", "11-03"],
  series: [{ label: "탐지", data: [94, 90, 111, 104, 97, 108, 114, 84, 99, 115, 134, 93, 81, 105] }],
};
/* 주간 비교(tone 없는 두 계열 → 한 톤 1 · 4 단계) · 심각도 분포 — 사이트 patterns.data.js 의 DASH 와 같다. KPI 는 스파크라인 없이(2026-11-18) */
const WEEKS = {
  labels: ["랜섬웨어", "악성코드", "USB 위반", "정책 위반", "피싱"],
  series: [
    { label: "이번 주", data: [412, 306, 221, 115, 88] },
    { label: "지난 주", data: [349, 331, 198, 142, 97] },
  ],
};
const SEVERITY = {
  series: [
    { label: "Critical", tone: "critical" as const, value: 190 },
    { label: "High", tone: "high" as const, value: 285 },
    { label: "Medium", tone: "medium" as const, value: 196 },
    { label: "Low", tone: "low" as const, value: 120 },
    { label: "Info", tone: "info" as const, value: 263 },
  ],
  center: "1,054",
  legend: "right" as const,
};
const RECENT = [
  ["09:41:12", "랜섬웨어 행위 탐지", "PC-2041 · 김민준", "blocked"],
  ["09:36:47", "알려진 악성코드 차단", "PC-0932 · 박지훈", "blocked"],
  ["08:58:20", "C2 통신 시도", "PC-0411 · 최유진", "review"],
] as const;

/* 훑어보는 화면이라 기간 · 필터가 없다(2026-11-20) — 기간을 바꿔 보려면 분석 · 리포트(examples/patterns/analytics) */
export default function Example() {
  return (
    <Stack>
      <PageHead as="h2"
        title="대시보드"
        sub="최근 갱신 09:41 · 자동 갱신 1분"
        actions={<ButtonGroup><SelectButton label="기간" defaultValue="24h" options={[{ value: "24h", label: "24시간" }, { value: "7d", label: "7일" }, { value: "30d", label: "30일" }]} /><Button variant="outline" color="assistive" iconOnly tooltip="left" aria-label="새로 고침"><Icon name="refresh" /></Button></ButtonGroup>}
      />
      <KpiGrid>
        <Kpi tone="critical" label="Critical 이벤트" value="1,284" delta="12%" deltaDir="up" deltaTone="bad" note="전일 대비" />
        <Kpi label="차단률" value="99.2" unit="%" delta="0.3%p" deltaDir="up" deltaTone="good" note="전일 대비" />
        <Kpi label="연결 에이전트" value="1,247" unit="/ 1,284" note="37대 오프라인" />
        <Kpi label="신규 위협" value="112" delta="20%" deltaDir="up" deltaTone="bad" note="전일 대비" />
      </KpiGrid>
      <Row3>
        <ChartCard title="일별 탐지" sub="최근 14일">
          <ChartCanvas chart={Chart} config={presets.timeseries(DAILY)} aria-label="일별 탐지 — 최근 14일 합계 1,429건, 지난 14일보다 8% 증가" />
        </ChartCard>
        <ChartCard title="심각도 분포">
          <ChartCanvas chart={Chart} config={presets.donut(SEVERITY)} aria-label="심각도 분포 — Critical 190, High 285, Medium 196, Low 120, Info 263, 합계 1,054" />
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
          <Button variant="text" color="assistive" as="a" href="#" size="sm" iconRight={<Icon name="chevron-right" size={16} />}>전체 보기</Button>
        </CardHead>
        <Table nowrap>
          <TableHead><TableRow><TableHeader>시간</TableHeader><TableHeader>이벤트</TableHeader><TableHeader>대상</TableHeader><TableHeader>상태</TableHeader></TableRow></TableHead>
          <TableBody>
            {RECENT.map(([t, e, target, s]) => (
              <TableRow key={t}>
                <TableCell>{t}</TableCell><TableCell><Link href="#">{e}</Link></TableCell><TableCell>{target}</TableCell>
                <TableCell>{s === "blocked" ? <Indicator tone="danger">차단</Indicator> : <Indicator tone="warn">검토 필요</Indicator>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Stack>
  );
}
