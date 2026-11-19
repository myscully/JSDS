import { Breadcrumb, BreadcrumbHome, BreadcrumbItem, Button, ButtonGroup, Card, CardHead, CardMeta, CardTitle, CopyField, Dropdown, DropdownTrigger, Icon, Indicator, Link, List, ListItem, Menu, MenuItem, MenuSep, PageHead, Row2, Stack, Tab, TabList, TabPanel, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tabs, Tag } from "@jiran/ds-react";

const EVENTS = [
  { time: "09:41:12", tone: "critical", sev: "Critical", name: "랜섬웨어 행위 탐지" },
  { time: "09:36:47", tone: "high", sev: "High", name: "알려진 악성코드 차단" },
] as const;

export default function Example() {
  return (
    <Stack>
      {/* 동작은 세 개까지 — 되돌리기 어려운 동작은 ⋯ 메뉴 맨 아래 구분선 뒤 */}
      <PageHead
        breadcrumb={
          <Breadcrumb>
            <BreadcrumbHome href="#" />
            <BreadcrumbItem href="#">자산</BreadcrumbItem>
            <BreadcrumbItem current>PC-2041</BreadcrumbItem>
          </Breadcrumb>
        }
        title="PC-2041"
        sub="김민준 · 개발팀 · Windows 11"
        actions={
          <>
            <ButtonGroup>
              <Button variant="outline" color="assistive">검사 실행</Button>
              <Button>원격 점검</Button>
            <Dropdown kind="menu" align="end" keepMounted>
              <DropdownTrigger asChild>
                <Button variant="outline" color="assistive" iconOnly aria-label="PC-2041 동작 더 보기"><Icon name="dots" /></Button>
              </DropdownTrigger>
              <Menu>
                <MenuItem icon="refresh" onSelect={() => {}}>에이전트 재설치</MenuItem>
                <MenuItem icon="download" onSelect={() => {}}>정보 내보내기</MenuItem>
                <MenuItem icon="lock" onSelect={() => {}}>네트워크 격리</MenuItem>
                <MenuSep />
                <MenuItem icon="trash" danger onSelect={() => {}}>자산 삭제</MenuItem>
              </Menu>
            </Dropdown>
            </ButtonGroup>
          </>
        }
      />
      <Tabs defaultValue="overview">
        <TabList label="자산 정보">
          <Tab value="overview">개요</Tab>
          <Tab value="activity">활동</Tab>
          <Tab value="settings">설정</Tab>
        </TabList>
        <TabPanel value="overview">
          <Stack>
            <Row2>
              <Card>
                <CardHead><CardTitle>자산 정보</CardTitle><Indicator tone="ok">연결됨</Indicator></CardHead>
                <CardMeta items={[
                  { label: "IP", value: <CopyField inline label="IP" value="10.0.4.21" /> },
                  { label: "에이전트", value: "6.2.1" },
                  { label: "그룹", value: "본사 · 개발팀" },
                  { label: "마지막 접속", value: "2026-11-15 09:41" },
                ]} />
              </Card>
              <Card>
                <CardHead><CardTitle>보호 상태</CardTitle><Tag tone="high">위험 2건</Tag></CardHead>
                <CardMeta items={[
                  { label: "실시간 보호", value: <Indicator tone="ok">켜짐</Indicator> },
                  { label: "정책", value: <><Link href="#">외부 USB 차단</Link> 외 11개</> },
                  { label: "마지막 검사", value: "2026-11-15 02:00 · 위협 0" },
                ]} />
              </Card>
            </Row2>
            {/* 관련 이벤트는 최근 몇 건만 — 같은 조건의 목록 화면으로 가는 링크를 둔다 */}
            <Card flush>
              <CardHead>
                <CardTitle>최근 이벤트</CardTitle>
                <Button variant="text" color="assistive" size="sm" as="a" href="#" iconRight={<Icon name="chevron-right" size={16} />}>이벤트 목록에서 보기</Button>
              </CardHead>
              <Table nowrap>
                <TableHead><TableRow><TableHeader>시간</TableHeader><TableHeader>심각도</TableHeader><TableHeader>이벤트</TableHeader></TableRow></TableHead>
                <TableBody>
                  {EVENTS.map((e) => (
                    <TableRow key={e.time}>
                      <TableCell>{e.time}</TableCell>
                      <TableCell><Tag tone={e.tone} size="sm">{e.sev}</Tag></TableCell>
                      <TableCell><Link href="#">{e.name}</Link></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </Stack>
        </TabPanel>
        <TabPanel value="activity">
          <List>
            <ListItem primary="정책 배포 rev 2041" meta="2026-11-15 08:00 · 자동" />
            <ListItem primary="에이전트 6.2.1 업데이트" meta="2026-11-12 14:20 · 이서연" />
          </List>
        </TabPanel>
        <TabPanel value="settings">
          <List>
            <ListItem primary="소속 그룹" meta="본사 · 개발팀" />
            <ListItem primary="예외 정책" meta="없음" />
          </List>
        </TabPanel>
      </Tabs>
    </Stack>
  );
}
