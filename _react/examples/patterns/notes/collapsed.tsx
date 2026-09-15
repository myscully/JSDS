import { Accordion, Icon } from "@jiran/ds-react";

export default function Example() {
  return (
    <Accordion title={<><Icon name="info-circle" />유의사항</>} extra="3개" style={{ maxWidth: 600 }}>
      <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
        <li>정책은 배포 후 최대 5분 내 적용됩니다.</li>
        <li>격리 파일은 30일 보관됩니다.</li>
        <li>예외는 해시·경로 기준입니다.</li>
      </ul>
    </Accordion>
  );
}
