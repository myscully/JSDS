import { Accordion, Icon } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Accordion title="탐지 예외 목록" extra="12개" style={{ maxWidth: 560 }}>예외로 등록된 해시 · 경로입니다.</Accordion>
      <Accordion title={<><Icon name="info-circle" />유의사항</>} style={{ maxWidth: 560 }}>배포 후 최대 5분 안에 적용됩니다.</Accordion>
    </>
  );
}
