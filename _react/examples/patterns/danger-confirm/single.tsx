import { Button, ButtonGroup, PopupActions, PopupBody, PopupSurface, PopupTitle } from "@jiran/ds-react";

/* 단건 삭제 — 제목에 대상 이름, 본문에 사라지는 것과 영향. 취소가 먼저 */
export default function Example() {
  const close = () => {};
  return (
    <PopupSurface danger onClose={close}>
      <PopupTitle>'외부 USB 차단' 정책을 삭제할까요?</PopupTitle>
      <PopupBody>삭제한 정책은 복구할 수 없습니다. 이 정책이 적용된 에이전트 1,284대는 기본 정책으로 돌아갑니다.</PopupBody>
      <PopupActions>
        <ButtonGroup>
          <Button variant="outline" color="assistive" onClick={close}>취소</Button>
          <Button color="negative">삭제</Button>
        </ButtonGroup>
      </PopupActions>
    </PopupSurface>
  );
}
