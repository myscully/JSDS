import { Chart } from "chart.js/auto";
import { Button, Card, CardHead, CardTitle, ChartCard, Combobox, DateRangePicker, Delta, Icon, Kpi, KpiGrid, PageHead, Row2, Stack, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Toolbar } from "@jiran/ds-react";

import { ChartCanvas, presets } from "@jiran/ds-react/chart";

/* 분석 · 리포트 예제 데이터 — 사이트 patterns.data.js 의 ANALYTICS 와 같다. 추이 · 유형 · 경로 · 표의 합계가 모두 1,309 */
const TREND = {
  labels: ["11-12", "11-13", "11-14", "11-15", "11-16", "11-17", "11-18"],
  series: [
    { label: "Critical", tone: "critical" as const, data: [14, 18, 12, 20, 26, 11, 15] },
    { label: "High", tone: "high" as const, data: [38, 42, 40, 44, 49, 36, 39] },
    { label: "Medium", tone: "medium" as const, data: [61, 66, 64, 68, 72, 60, 62] },
    { label: "Low", tone: "low" as const, data: [38, 42, 43, 40, 41, 42, 39] },
    { label: "Info", tone: "info" as const, data: [22, 25, 20, 27, 30, 19, 24] },
  ],
  stacked: true,
};
const TREND_LABEL = "일별 탐지 추이 — 최근 7일 합계 1,309건, 11월 16일 218건이 가장 많음. Critical 116, High 288, Medium 453, Low 285, Info 167";
const TYPES = { labels: ["랜섬웨어", "악성코드", "USB 위반", "정책 위반", "피싱"], series: [{ label: "탐지", data: [472, 351, 253, 132, 101] }], horizontal: true };
const CHANNELS = {
  series: [{ label: "엔드포인트", value: 734 }, { label: "메일", value: 307 }, { label: "네트워크", value: 186 }, { label: "USB", value: 82 }],
  center: "1,309",
  legend: "right" as const,
};
const ROWS = [
  ["랜섬웨어", 472, 58, "99.4%", "up", "bad", "12%"],
  ["악성코드", 351, 31, "99.1%", "down", "good", "4%"],
  ["USB 위반", 253, 9, "97.6%", "up", "bad", "9%"],
  ["정책 위반", 132, 6, "96.2%", "down", "good", "7%"],
  ["피싱", 101, 12, "98.0%", "up", "bad", "3%"],
] as const;
const SEVS = ["Critical", "High", "Medium", "Low", "Info"].map((label) => ({ value: label, label }));
/* 프리셋 7 · 30 · 90일 — 기간이 필터 줄 맨 앞(dataviz 'Date range first') */
const today = new Date();
const TODAY = today;
const daysAgo = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - n);
const PRESETS = [7, 30, 90].map((n) => ({ label: `최근 ${n}일`, range: (): [Date, Date] => [daysAgo(n - 1), today] }));

/* 기간과 조건을 바꿔 들여다보는 화면(2026-11-20) — 필터 한 줄이 모든 카드 위 · 카드 밖에 있고, 아래 KPI · 차트 · 표가 같은 조건으로 다시 그려진다(dataviz 'Filters scope everything below them').
   대시보드는 필터 없이 훑는 화면이다. 필터를 차트에 반영하는 일(조회)은 제품 몫 */
export default function Example() {
  return (
    <Stack>
      <PageHead as="h2" title="탐지 분석" sub="조건을 바꾸면 아래 숫자와 차트가 모두 같은 조건으로 다시 그려집니다."
        actions={<Button variant="outline" color="assistive" iconLeft={<Icon name="download" />}>CSV 내보내기</Button>} />
      <Toolbar>
        <DateRangePicker aria-label="조회 기간" max={TODAY} presets={PRESETS} defaultValue={{ start: daysAgo(6), end: TODAY }} />
        <Combobox multiple options={SEVS} placeholder="심각도 전체" label="심각도" />
      </Toolbar>
      <KpiGrid>
        <Kpi label="전체 탐지" value="1,309" delta="8%" deltaDir="up" deltaTone="bad" note="지난 7일 대비" />
        <Kpi tone="critical" label="Critical" value="116" delta="5%" deltaDir="down" deltaTone="good" note="지난 7일 대비" />
        <Kpi label="평균 대응 시간" value="42" unit="분" delta="6분" deltaDir="down" deltaTone="good" note="지난 7일 대비" />
        <Kpi label="차단률" value="98.7" unit="%" delta="0.4%p" deltaDir="up" deltaTone="good" note="지난 7일 대비" />
      </KpiGrid>
      <ChartCard title="일별 탐지 추이" sub="심각도별" size="lg">
        <ChartCanvas chart={Chart} config={presets.bar(TREND)} aria-label={TREND_LABEL} />
      </ChartCard>
      <Row2>
        <ChartCard title="유형별 탐지" sub="최근 7일">
          <ChartCanvas chart={Chart} config={presets.bar(TYPES)} aria-label="유형별 탐지 — 랜섬웨어 472, 악성코드 351, USB 위반 253, 정책 위반 132, 피싱 101" />
        </ChartCard>
        <ChartCard title="탐지 경로">
          <ChartCanvas chart={Chart} config={presets.donut(CHANNELS)} aria-label="탐지 경로 — 엔드포인트 734, 메일 307, 네트워크 186, USB 82, 합계 1,309" />
        </ChartCard>
      </Row2>
      <Card flush>
        <CardHead><CardTitle>유형별 상세</CardTitle></CardHead>
        <Table nowrap>
          <TableHead><TableRow><TableHeader>유형</TableHeader><TableHeader num>탐지</TableHeader><TableHeader num>Critical</TableHeader><TableHeader num>차단률</TableHeader><TableHeader>지난 7일 대비</TableHeader></TableRow></TableHead>
          <TableBody>
            {ROWS.map(([t, n, c, r, dir, tone, d]) => (
              <TableRow key={t}>
                <TableCell>{t}</TableCell><TableCell num>{n.toLocaleString("en-US")}</TableCell><TableCell num>{c}</TableCell><TableCell num>{r}</TableCell>
                <TableCell><Delta dir={dir} tone={tone}>{d}</Delta></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Stack>
  );
}
