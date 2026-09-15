import { Button, Checkbox, Field, Form, FormActions, FormRow, FormSection, Radio, RadioGroup, Select, TextArea, TextField } from "@jiran/ds-react";

const GROUPS = [{ value: "all", label: "전체" }, { value: "sales", label: "영업팀" }, { value: "dev", label: "개발팀" }];

export default function Example() {
  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <FormSection>기본 정보</FormSection>
      <TextField id="pname" label="정책 이름" required placeholder="예: 외부 USB 차단" help="2~40자" />
      <TextArea id="pdesc" label="설명" placeholder="정책의 목적과 적용 범위" />
      <FormSection>적용 대상</FormSection>
      <FormRow>
        <Field label="그룹">
          <Select options={GROUPS} defaultValue="all" label="그룹" />
        </Field>
        <TextField id="prio" label="우선순위" type="number" defaultValue="10" min={1} max={100} />
      </FormRow>
      <RadioGroup legend="탐지 시 동작" name="fa" defaultValue="block">
        <Radio value="block">차단 후 알림</Radio>
        <Radio value="notify">알림만</Radio>
      </RadioGroup>
      <Checkbox defaultChecked description="에이전트가 다음 체크인에서 적용합니다">저장 즉시 배포</Checkbox>
      <FormActions>
        <Button variant="text">취소</Button>
        <Button type="submit">정책 저장</Button>
      </FormActions>
    </Form>
  );
}
