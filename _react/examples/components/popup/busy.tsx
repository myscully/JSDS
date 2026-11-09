import { Button, PopupActions, PopupBody, PopupSurface, PopupTitle } from "@jiran/ds-react";

export default function Example() {
  return (
    <PopupSurface busy onClose={() => {}}>
      <PopupTitle>정책을 배포할까요?</PopupTitle>
      <PopupBody>변경 사항이 1,284대에 적용됩니다.</PopupBody>
      <PopupActions>
        <Button variant="outline" color="assistive" disabled>취소</Button>
        <Button loading>배포</Button>
      </PopupActions>
    </PopupSurface>
  );
}
