import { useState } from "react";
import { Button, PopupActions, PopupBody, PopupSurface, PopupTitle, TextField } from "@jiran/ds-react";

export default function Example() {
  const [confirm, setConfirm] = useState("");
  return (
    <PopupSurface danger>
      <PopupTitle>정책 12개를 삭제할까요?</PopupTitle>
      <PopupBody>삭제한 정책은 복구할 수 없습니다. 해당 정책이 적용된 에이전트는 기본 정책으로 돌아갑니다.</PopupBody>
      <TextField id="confirm" label={<>확인을 위해 <b>삭제</b> 를 입력하세요</>} placeholder="삭제" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      <PopupActions>
        <Button variant="secondary">취소</Button>
        <Button variant="danger" disabled={confirm !== "삭제"}>삭제</Button>
      </PopupActions>
    </PopupSurface>
  );
}
