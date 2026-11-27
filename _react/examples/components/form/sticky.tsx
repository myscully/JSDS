import { Button, ButtonGroup, Form, FormActions, FormSection, TextArea, TextField } from "@jiran/ds-react";

export default function Example() {
  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <FormSection>기본 정보</FormSection>
      <TextField id="fk-name" label="정책 이름" defaultValue="외부 USB 차단" />
      <TextArea id="fk-desc" label="설명" defaultValue="승인하지 않은 외부 저장 장치를 차단합니다." />
      <FormSection>대상</FormSection>
      <TextField id="fk-group" label="적용 그룹" defaultValue="영업팀" />
      <TextField id="fk-except" label="예외 단말" defaultValue="PC-0932" />
      <FormSection>알림</FormSection>
      <TextField id="fk-mail" label="알림 이메일" type="email" defaultValue="soc@example.com" />
      <TextField id="fk-hook" label="웹훅 주소" type="url" defaultValue="https://hooks.example.com/soc" />
      <FormActions sticky>
        <ButtonGroup>
          <Button variant="outline" color="assistive">취소</Button>
          <Button type="submit">정책 저장</Button>
        </ButtonGroup>
      </FormActions>
    </Form>
  );
}
