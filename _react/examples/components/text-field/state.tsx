import { TextField } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <TextField label="정책 ID" defaultValue="POL-2041" readOnly help="자동 생성" />
      <TextField label="생성자" defaultValue="admin@jiran.com" disabled />
    </>
  );
}
