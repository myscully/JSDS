import { Field, FileUpload } from "@jiran/ds-react";

export default function Example() {
  return (
    <Field label="인증서" help="라이선스를 등록한 뒤 올릴 수 있습니다" style={{ width: "100%", maxWidth: 480 }}>
      <FileUpload disabled items={[]} onAdd={() => {}} />
    </Field>
  );
}
