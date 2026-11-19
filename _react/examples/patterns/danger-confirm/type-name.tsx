import { Button, ButtonGroup, Form, PopupActions, PopupBody, PopupSurface, PopupTitle, TextField } from "@jiran/ds-react";

const NAME = "SIEM 연동";

/* 이름 입력 확인 — 삭제 버튼은 늘 켜 두고, 누르면 검사한다. 이름이 다르면 막고 입력칸 아래에 고치는 법을 적는다 */
export default function Example() {
  const close = () => {};
  return (
    <PopupSurface danger onClose={close}>
      <PopupTitle>'{NAME}'을 삭제할까요?</PopupTitle>
      <PopupBody>연동을 지우면 이벤트 전송이 바로 멈추고, 이 연동을 쓰는 보고서 3개가 비게 됩니다. 복구할 수 없습니다.</PopupBody>
      <Form bare validate className="popup-form" id="dc3-form" onSubmit={(e) => { e.preventDefault(); /* 삭제 실행 */ }}>
        <TextField
          id="dc3-name"
          label={`확인을 위해 ${NAME} 을 입력하세요`}
          required
          requiredMark={false}
          pattern={NAME}
          autoComplete="off"
          help="이름이 같아야 삭제됩니다."
          messages={{ required: "연동 이름을 입력하세요.", pattern: `연동 이름이 다릅니다. ${NAME} 을 그대로 입력하세요.` }}
        />
      </Form>
      <PopupActions>
        <ButtonGroup>
          <Button variant="outline" color="assistive" onClick={close}>취소</Button>
          <Button type="submit" form="dc3-form" color="negative">삭제</Button>
        </ButtonGroup>
      </PopupActions>
    </PopupSurface>
  );
}
