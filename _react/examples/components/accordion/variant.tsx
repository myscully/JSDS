import { Accordion, AccordionGroup } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Accordion title="Outline" style={{ maxWidth: 560 }}>항목마다 테두리가 있는 카드입니다.</Accordion>
      <AccordionGroup variant="flat" style={{ maxWidth: 560 }}>
        <Accordion variant="flat" title="Flat">구분선으로 나뉩니다.</Accordion>
        <Accordion variant="flat" title="Flat">구분선으로 나뉩니다.</Accordion>
      </AccordionGroup>
    </>
  );
}
