import { Button, ButtonGroup, PopupActions, PopupSurface, PopupTitle } from "@jiran/ds-react";

/* 재발급하면 옛 키가 바로 멈춘다 — alertdialog 로 묻고, 무엇이 끊기는지 적고, 취소를 앞에 둔다 */
export default function Example() {
  return (
    <PopupSurface danger onClose={() => {}} aria-describedby="sec-re-b">
      <PopupTitle>SIEM 연동 키를 재발급할까요?</PopupTitle>
      <div className="popup-body" id="sec-re-b">
        <p>지금 키는 바로 멈춥니다. 새 키를 SIEM 에 넣기 전까지 이벤트 전송이 끊깁니다.</p>
      </div>
      <PopupActions>
        <ButtonGroup>
          <Button variant="outline" color="assistive">취소</Button>
          <Button color="negative">재발급</Button>
        </ButtonGroup>
      </PopupActions>
    </PopupSurface>
  );
}
