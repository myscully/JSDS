import { Avatar, Breadcrumb, BreadcrumbHome, BreadcrumbItem, Button, ButtonGroup, Card, CardHead, CardMeta, CardTitle, Combobox, Field, Form, Icon, Link, List, ListItem, PageHead, Row2, Stack, Steps, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tag, TextArea } from "@jiran/ds-react";

const OWNERS = ["이서연", "김민준", "박지훈", "최유진"].map((n) => ({ value: n, label: n }));
const LOG = [
  { text: "cryptor.dll 을 격리 저장소로 옮겼습니다", by: "이서연", at: "10:12" },
  { text: "분석 완료. 첨부 문서의 매크로로 들어왔습니다", by: "이서연", at: "09:58" },
];
const LOGS = [
  { time: "09:41:12", tone: "critical", lv: "CRIT", msg: "process.create blocked: rundll32.exe" },
  { time: "09:41:11", tone: "medium", lv: "WARN", msg: "usb.attach vendor=0x0781" },
] as const;

export default function Example() {
  return (
    <Stack>
      <PageHead as="h2"
        breadcrumb={
          <Breadcrumb>
            <BreadcrumbHome href="#" />
            <BreadcrumbItem href="#">사고</BreadcrumbItem>
            <BreadcrumbItem current>INC-0412</BreadcrumbItem>
          </Breadcrumb>
        }
        title="랜섬웨어 행위 탐지"
        sub="INC-0412 · 접수 09:41 · PC-2041"
        actions={<><ButtonGroup><Button variant="outline" color="assistive">단말 격리</Button><Button>조치 완료</Button></ButtonGroup></>}
      />
      {/* 단계 이동은 제품의 처리 버튼이 맡고 Steps 는 표시만 한다 */}
      <Steps aria-label="처리 단계" items={["접수", "분석", "조치", "종료"]} current={2} />
      <Row2>
        <Stack>
          <Card>
            <CardHead><CardTitle>처리 기록</CardTitle></CardHead>
            {/* 메모 칸은 기록 맨 위 — 칸 하나뿐이라 * 와 필수 안내를 두지 않는다 */}
            <Form bare validate onSubmit={(e) => e.preventDefault()}>
              <TextArea id="inc-memo" label="메모" required requiredMark={false} placeholder="처리한 일을 남기세요" help="감사 로그에도 남습니다." />
              <ButtonGroup end><Button type="submit" variant="outline">기록 추가</Button></ButtonGroup>
            </Form>
            <List>
              {LOG.map((l) => <ListItem key={l.at} leading={<Avatar size="sm" initials={l.by[0]} role="img" aria-label={l.by} />} primary={l.text} meta={`${l.by} · ${l.at}`} />)}
            </List>
          </Card>
          <Card flush>
            <CardHead>
              <CardTitle>관련 로그</CardTitle>
              <Button variant="text" color="assistive" size="sm" as="a" href="#" iconRight={<Icon name="chevron-right" size={16} />}>로그 뷰어에서 보기</Button>
            </CardHead>
            <Table density="compact" nowrap>
              <TableHead><TableRow><TableHeader>시간</TableHeader><TableHeader>심각도</TableHeader><TableHeader>메시지</TableHeader></TableRow></TableHead>
              <TableBody>
                {LOGS.map((r) => (
                  <TableRow key={r.time}>
                    <TableCell>{r.time}</TableCell>
                    <TableCell><Tag tone={r.tone} size="sm">{r.lv}</Tag></TableCell>
                    <TableCell>{r.msg}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </Stack>
        <Card>
          <CardHead><CardTitle>요약</CardTitle></CardHead>
          <CardMeta items={[
            { label: "심각도", value: <Tag tone="critical" size="sm">Critical</Tag> },
            { label: "상태", value: <Tag tone="pending" size="sm">조치 중</Tag> },
            { label: "대상", value: <Link href="#">PC-2041</Link> },
          ]} />
          {/* 담당자는 여기서 바로 바꾼다 */}
          <Field label="담당자">
            <Combobox label="담당자" placeholder="담당자 검색" options={OWNERS} defaultValue="이서연" />
          </Field>
        </Card>
      </Row2>
    </Stack>
  );
}
