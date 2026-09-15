import { TextField } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <TextField label="보관 기간" defaultValue="90" suffix="일" />
      <TextField label="관리 콘솔 주소" prefix="https://" placeholder="console.example.com" />
      <TextField label="설명" defaultValue="외부 저장장치 차단 정책" maxLength={80} showCount />
    </>
  );
}
