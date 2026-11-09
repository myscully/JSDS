import { TextField } from "@jiran/ds-react";

export default function Example() {
  return <TextField id="pw1" label="관리자 비밀번호" reveal defaultValue="secret-value" autoComplete="current-password" />;
}
