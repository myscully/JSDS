import { Button, Notice, PopupActions, PopupBody, PopupSurface, PopupTitle } from "@jiran/ds-react";

export default function Example() {
  return (
    <PopupSurface onClose={() => {}}>
      <PopupTitle>정책을 배포할까요?</PopupTitle>
      <PopupBody>변경 사항이 1,284대에 적용됩니다.</PopupBody>
      <Notice tone="danger" title="배포하지 못했습니다">정책 서버에 연결하지 못했습니다. 다시 시도하세요.</Notice>
      <PopupActions>
        <Button variant="outline" color="assistive">취소</Button>
        <Button>다시 배포</Button>
      </PopupActions>
    </PopupSurface>
  );
}
