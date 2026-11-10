import { useState } from "react";
import { Field, FileUpload, type UploadItem } from "@jiran/ds-react";

const MB = 1024 * 1024;

export default function Example() {
  const [items, setItems] = useState<UploadItem[]>([]);
  return (
    <Field label="예외 목록" help="CSV · TXT, 10MB 이하, 5개까지" style={{ width: "100%", maxWidth: 480 }}>
      <FileUpload multiple maxFiles={5} accept=".csv,.txt" maxSize={10 * MB}
      items={items}
      onAdd={(added) => setItems((p) => [...p, ...added.map(({ id, file }) => ({ id, name: file.name, size: file.size, status: "uploading" as const, progress: 0 }))])}   // 여기서 전송을 시작합니다
      onRemove={(id) => setItems((p) => p.filter((x) => x.id !== id))}
        onRetry={(id) => setItems((p) => p.map((x) => (x.id === id ? { ...x, status: "uploading", progress: 0 } : x)))}
      />
    </Field>
  );
}
