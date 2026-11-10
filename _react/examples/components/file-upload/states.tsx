// ds:skeleton off
import { Field, FileUpload, type UploadItem } from "@jiran/ds-react";

const ITEMS: UploadItem[] = [
  { id: "s1", name: "agent-2026-11.log", size: 839680 },
  { id: "s2", name: "server-audit.log", size: 4404019, status: "uploading", progress: 60 },
  { id: "s3", name: "firewall.log", size: 1153434, status: "done" },
  { id: "s4", name: "gateway.log", size: 2516582, status: "error" },
];

/* 거절된 파일(형식 · 용량)은 컴포넌트가 스스로 줄을 그린다 */
export default function Example() {
  return (
    <Field label="로그 가져오기" help="10MB 이하" style={{ width: "100%", maxWidth: 480 }}>
      <FileUpload multiple maxSize={10 * 1024 * 1024} items={ITEMS} onAdd={() => {}} onRemove={() => {}} onRetry={() => {}} />
    </Field>
  );
}
