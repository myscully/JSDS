import { Accordion, AccordionGroup } from "@jiran/ds-react";

export default function Example() {
  return (
    <AccordionGroup style={{ maxWidth: 560 }}>
      <Accordion title="일반" defaultOpen>정책 이름, 설명, 적용 그룹</Accordion>
      <Accordion title="스케줄">적용 요일과 시간대</Accordion>
      <Accordion title="알림">차단 시 알림 받을 채널</Accordion>
    </AccordionGroup>
  );
}
