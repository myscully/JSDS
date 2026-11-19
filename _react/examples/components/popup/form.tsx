import { Button, ButtonGroup, Checkbox, PopupActions, PopupForm, PopupSurface, PopupTitle, TextField } from "@jiran/ds-react";

export default function Example() {
  return (
    <PopupSurface onClose={() => {}}>
      <PopupTitle>예외 추가</PopupTitle>
      <PopupForm>
        <TextField id="hash" label="파일 해시(SHA-256)" placeholder="64자리 16진수" />
        <TextField id="reason" label="사유" placeholder="예: 사내 배포 도구" />
        <Checkbox>모든 그룹에 적용</Checkbox>
      </PopupForm>
      <PopupActions>
        <ButtonGroup>
          <Button variant="outline" color="assistive">취소</Button>
          <Button>추가</Button>
        </ButtonGroup>
      </PopupActions>
    </PopupSurface>
  );
}
