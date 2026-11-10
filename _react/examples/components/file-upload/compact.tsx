import { useState } from "react";
import { Field, FileUpload, type UploadItem } from "@jiran/ds-react";

const MB = 1024 * 1024;

export default function Example() {
  const [items, setItems] = useState<UploadItem[]>([]);
  return (
    <Field label="서명 파일" help="SIG, 1MB 이하" style={{ width: "100%", maxWidth: 480 }}>
      <FileUpload compact accept=".sig" maxSize={MB}
      items={items}
      onAdd={(added) => setItems((p) => [...p, ...added.map(({ id, file }) => ({ id, name: file.name, size: file.size, status: "uploading" as const, progress: 0 }))])}   // 여기서 전송을 시작합니다
      onRemove={(id) => setItems((p) => p.filter((x) => x.id !== id))}
      />
    </Field>
  );
}
