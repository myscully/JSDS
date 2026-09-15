import { Indicator } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Indicator tone="ok">정상</Indicator>
      <Indicator tone="warn">주의</Indicator>
      <Indicator tone="danger">장애</Indicator>
      <Indicator tone="info">점검 중</Indicator>
      <Indicator>오프라인</Indicator>
      <Indicator tone="danger" pulse>실시간 공격 탐지</Indicator>
    </>
  );
}
