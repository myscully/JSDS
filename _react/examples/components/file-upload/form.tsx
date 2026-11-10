import { useState } from "react";
import { Button, Field, FileUpload, Form, FormActions, FormLegend, type UploadItem } from "@jiran/ds-react";

export default function Example() {
  const [items, setItems] = useState<UploadItem[]>([]);
  return (
    <Form validate onSubmit={(e) => e.preventDefault()}>
      <FormLegend />
      <Field label="인증서" required help="PEM · CRT, 5MB 이하">
        <FileUpload required accept=".pem,.crt" maxSize={5 * 1024 * 1024}
          items={items}
          onAdd={(added) => setItems((p) => [...p, ...added.map(({ id, file }) => ({ id, name: file.name, size: file.size, status: "uploading" as const, progress: 0 }))])}   // 여기서 전송을 시작합니다
          onRemove={(id) => setItems((p) => p.filter((x) => x.id !== id))}
        />
      </Field>
      <FormActions>
        <Button type="submit">저장</Button>
      </FormActions>
    </Form>
  );
}
