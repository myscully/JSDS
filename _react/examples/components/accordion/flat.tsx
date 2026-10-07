import { Accordion, AccordionGroup } from "@jiran/ds-react";

export default function Example() {
  return (
    <AccordionGroup flat style={{ maxWidth: 560 }}>
      <Accordion flat title="일반" defaultOpen>정책 이름, 설명, 적용 그룹</Accordion>
      <Accordion flat title="스케줄">적용 요일과 시간대</Accordion>
      <Accordion flat disabled title="감사 로그" extra="권한 필요">관리자 권한이 있어야 열람할 수 있습니다.</Accordion>
    </AccordionGroup>
  );
}
