import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@jiran/ds-react";

export default function Example() {
  return (
    <Table wrapStyle={{ maxWidth: 480 }}>
      <TableHead>
        <TableRow>
          <TableHeader>그룹</TableHeader>
          <TableHeader num>에이전트</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>영업팀</TableCell>
          <TableCell num>312</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>개발팀</TableCell>
          <TableCell num>184</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
