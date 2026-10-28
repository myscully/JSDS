import { Button, Card, CardHead, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jiran/ds-react";

export default function Example() {
  return (
    <Card flush style={{ width: 400 }}>
      <CardHead>
        <CardTitle>최근 이벤트</CardTitle>
        <Button variant="text" size="sm">전체 보기</Button>
      </CardHead>
      {/* 테두리 없는 표 — wrap 을 끄지 않으면 .tbl-wrap 의 테두리가 카드 테두리와 겹친다 */}
      <Table compact wrap={false}>
        <TableHead>
          <TableRow>
            <TableHeader>시간</TableHeader>
            <TableHeader>이벤트</TableHeader>
            <TableHeader num>횟수</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>09:41</TableCell>
            <TableCell>USB 연결 차단</TableCell>
            <TableCell num>3</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>09:12</TableCell>
            <TableCell>악성 URL 접속 시도</TableCell>
            <TableCell num>12</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>08:57</TableCell>
            <TableCell>정책 위반 파일 전송</TableCell>
            <TableCell num>1</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );
}
