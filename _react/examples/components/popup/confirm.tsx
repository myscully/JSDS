// ds:skeleton off — 사이트 예제는 열린 팝업의 정적 모습이고, 여기서는 실제 열기/닫기 동작을 보여준다
import { useState } from "react";
import { Button, Popup, PopupActions, PopupBody, PopupTitle } from "@jiran/ds-react";

export default function Example() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>배포</Button>
      <Popup open={open} onClose={close}>
        <PopupTitle>정책을 배포할까요?</PopupTitle>
        <PopupBody>변경 사항이 12개 그룹, 1,284대에 적용됩니다. 에이전트는 다음 체크인(최대 5분)에서 정책을 받습니다.</PopupBody>
        <PopupActions>
          <Button variant="secondary" onClick={close}>취소</Button>
          <Button onClick={close}>배포</Button>
        </PopupActions>
      </Popup>
    </>
  );
}
