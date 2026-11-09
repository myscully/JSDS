import { Spinner } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Spinner size="sm" label="목록 불러오는 중" />
      <Spinner label="정책 불러오는 중" />
      <Spinner size="lg" label="보고서 만드는 중" />
      <Spinner>이벤트를 불러오는 중…</Spinner>
    </>
  );
}
