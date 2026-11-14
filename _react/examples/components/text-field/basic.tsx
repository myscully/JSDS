import { TextField } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <TextField id="ip1" label="허용 IP" defaultValue="10.0.0.12" help="IPv4 형식" />
      <TextField id="ip2" label="허용 IP" defaultValue="10.0.0" error="올바른 IPv4 형식이 아닙니다. 예: 10.0.0.12" />
    </>
  );
}
