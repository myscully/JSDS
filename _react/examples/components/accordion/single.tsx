import { Accordion, AccordionGroup } from "@jiran/ds-react";

export default function Example() {
  return (
    <AccordionGroup style={{ maxWidth: 560 }}>
      <Accordion name="faq" title="정책은 언제 적용되나요?" defaultOpen>배포 버튼을 누른 뒤 에이전트가 다음 체크인(최대 5분)에서 받아 적용합니다.</Accordion>
      <Accordion name="faq" title="차단된 파일은 어디에 보관되나요?">격리 저장소에 30일 보관 후 자동 삭제됩니다.</Accordion>
      <Accordion name="faq" title="예외 처리는 어떻게 하나요?">정책 › 예외 목록에서 해시 또는 경로를 등록합니다.</Accordion>
    </AccordionGroup>
  );
}
