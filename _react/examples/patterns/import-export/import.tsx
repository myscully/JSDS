import { useState } from "react";
import { Button, ButtonGroup, Field, FileUpload, Icon, Notice, Stack, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tag, type UploadItem } from "@jiran/ds-react";

const MB = 1024 * 1024;
const ERRORS = [
  { line: "18", name: "PC-2041", ip: "10.0.4.256", kind: "IP 형식", fix: "0~255 사이 숫자로 고치세요" },
  { line: "342", name: "PC-0932", ip: "10.0.7.10", kind: "중복", fix: "57줄과 같은 IP 입니다" },
  { line: "1,107", name: "(비어 있음)", ip: "10.0.9.44", kind: "빈 값", fix: "단말 이름을 채우세요" },
];

/* 가져오기 — 올리면 줄마다 검사하고 오류 줄만 표로. 올바른 줄만 가져오고, 오류 줄은 내려받아 고친다 */
export default function Example() {
  const [files, setFiles] = useState<UploadItem[]>([{ id: "imp1", name: "agents-2026-11.csv", size: 212 * 1024, status: "done" }]);
  return (
    <Stack>
      <Field label="단말 목록 파일" help="CSV, 5MB 이하. 첫 줄은 단말 이름, IP, 그룹 열입니다.">
        <FileUpload accept=".csv" maxSize={5 * MB} items={files}
          onAdd={(added) => setFiles(added.slice(0, 1).map(({ id, file }) => ({ id, name: file.name, size: file.size, status: "uploading", progress: 0 })))}
          onRemove={(id) => setFiles((p) => p.filter((x) => x.id !== id))}
        />
      </Field>
      <Notice tone="warning" title="1,284줄 중 3줄을 가져올 수 없습니다"
        actions={<Button variant="outline" color="assistive" size="sm"><Icon name="download" />오류 줄 내려받기</Button>}>
        오류 줄을 고쳐 다시 올리거나, 올바른 1,281줄만 가져오세요.
      </Notice>
      <Table density="compact" nowrap>
        <TableHead>
          <TableRow><TableHeader className="num">줄</TableHeader><TableHeader>단말 이름</TableHeader><TableHeader>IP</TableHeader><TableHeader>오류</TableHeader></TableRow>
        </TableHead>
        <TableBody>
          {ERRORS.map((r) => (
            <TableRow key={r.line}>
              <TableCell className="num">{r.line}</TableCell>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.ip}</TableCell>
              <TableCell><Tag tone="high" size="sm">{r.kind}</Tag> {r.fix}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ButtonGroup end>
        <Button variant="outline" color="assistive">취소</Button>
        <Button>1,281줄 가져오기</Button>
      </ButtonGroup>
    </Stack>
  );
}
