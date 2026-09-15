import { Spinner } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" />
      <Spinner>이벤트를 불러오는 중…</Spinner>
    </>
  );
}
