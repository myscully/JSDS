import { Avatar, AvatarGroup, Button, Icon, Spacer, Stack, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tag, Toolbar } from "@jiran/ds-react";

type Role = { id: string; name: string; desc: string; users: string[]; custom?: boolean };
/* 운영자는 12명 — Avatar Group 이 다섯까지 보여 주고 나머지는 '외 7명' 으로 적는다 */
const ROLES: Role[] = [
  { id: "admin", name: "보안 관리자", desc: "모든 화면을 보고 정책을 배포합니다", users: ["김민준", "이서연", "박지훈"] },
  { id: "operator", name: "운영자", desc: "이벤트를 처리하고 정책을 봅니다", users: ["최유진", "정다은", "한지우", "오세훈", "윤하늘", "임도윤", "서지아", "권태민", "황보람", "송예린", "유하준", "남궁민"] },
  { id: "auditor", name: "감사자", desc: "로그와 보고서만 봅니다", users: ["강민서"], custom: true },
];
export default function Example() {
  return (
    <Stack>
      <Toolbar>
        <Spacer />
        <Button iconLeft={<Icon name="plus" />}>역할 만들기</Button>
      </Toolbar>
      <Table hover>
        <TableHead>
          <TableRow>
            <TableHeader>역할</TableHeader><TableHeader>설명</TableHeader><TableHeader>사용자</TableHeader><TableHeader>구분</TableHeader>
            <TableHeader actions><span className="sr-only">동작</span></TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {ROLES.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.desc}</TableCell>
              <TableCell>
                <AvatarGroup label={`${r.name} 사용자`} size="sm">
                  {r.users.map((n) => <Avatar key={n} initials={n[0]} role="img" aria-label={n} />)}
                </AvatarGroup>
              </TableCell>
              <TableCell>{r.custom ? <Tag tone="accent" size="sm">사용자 정의</Tag> : <Tag size="sm">기본</Tag>}</TableCell>
              <TableCell actions><Button variant="outline" color="assistive" size="sm" aria-label={`${r.name} 권한 편집`}>권한 편집</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Stack>
  );
}
