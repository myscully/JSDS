import { Button, ButtonGroup, Form, PopupActions, PopupBody, PopupSurface, PopupTitle, TextField } from "@jiran/ds-react";

/* 삭제 버튼은 늘 켜 두고 누르면 확인 문구를 검사한다 — 비활성 대신 누르면 막고 고치는 법을 알린다(Interaction › Disabled) */
export default function Example() {
  return (
    <PopupSurface danger onClose={() => {}}>
      <PopupTitle>정책 12개를 삭제할까요?</PopupTitle>
      <PopupBody>삭제한 정책은 복구할 수 없습니다. 해당 정책이 적용된 에이전트는 기본 정책으로 돌아갑니다.</PopupBody>
      <Form bare validate className="popup-form" id="dg-form" onSubmit={(e) => { e.preventDefault(); /* 삭제 실행 */ }}>
        <TextField
          id="confirm"
          label={<>확인을 위해 <b>삭제</b>를 입력하세요</>}
          required
          requiredMark={false}
          pattern="\s*삭제\s*"
          autoComplete="off"
          messages={{ required: "확인 문구를 입력하세요.", pattern: "문구가 다릅니다. 삭제를 그대로 입력하세요." }}
        />
      </Form>
      <PopupActions>
        <ButtonGroup>
          <Button variant="outline" color="assistive">취소</Button>
          <Button type="submit" form="dg-form" color="negative">삭제</Button>
        </ButtonGroup>
      </PopupActions>
    </PopupSurface>
  );
}
