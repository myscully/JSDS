import { useFormDraft, Button, ButtonGroup, Checkbox, Combobox, Field, Form, FormActions, FormLegend, FormRow, FormSection, Notice, NumberInput, Select, TextField } from "@jiran/ds-react";

const SEVS = ["Critical", "High", "Medium", "Low", "Info"].map((label) => ({ value: label, label }));
const TARGETS = [{ value: "all", label: "전체 단말" }, { value: "server", label: "서버 그룹" }, { value: "sales", label: "영업팀 PC" }];
const WINDOWS = [{ value: "5", label: "5분 안에" }, { value: "10", label: "10분 안에" }, { value: "60", label: "1시간 안에" }];
const PEOPLE = ["보안팀", "운영팀", "김민준", "이서연"].map((label) => ({ value: label, label }));

/* 조건은 모두 맞아야 하고 동작은 하나 이상. 저장 버튼 위에 규칙을 한 문장으로 */
export default function Example() {
  const draft = useFormDraft("alert-rule-new");
  return (
    <Form ref={draft.ref} validate onSubmit={(e) => e.preventDefault()}>
      {draft.notice}
      <FormLegend />
      <TextField id="ar-name" label="규칙 이름" required defaultValue="랜섬웨어 연속 탐지" />
      <FormSection>조건</FormSection>
      <Field label="심각도" htmlFor="ar-sev" required>
        <Combobox id="ar-sev" multiple required options={SEVS} defaultValue={["Critical", "High"]} placeholder="심각도 선택" label="심각도" />
      </Field>
      <Field label="대상">
        <Select options={TARGETS} defaultValue="all" label="대상" keepMounted />
      </Field>
      <FormRow>
        <NumberInput id="ar-count" label="횟수" defaultValue="5" min={1} max={100} unit="건 이상" help="1~100" />
        <Field label="시간 창">
          <Select options={WINDOWS} defaultValue="10" label="시간 창" keepMounted />
        </Field>
      </FormRow>
      <FormSection>동작</FormSection>
      <Checkbox defaultChecked>메일 보내기</Checkbox>
      <Field label="받는 사람" htmlFor="ar-mail">
        <Combobox id="ar-mail" multiple options={PEOPLE} defaultValue={["보안팀"]} placeholder="사람 또는 부서 검색" label="받는 사람" />
      </Field>
      <Checkbox defaultChecked>웹훅 호출</Checkbox>
      <TextField id="ar-hook" label="웹훅 주소" type="url" defaultValue="https://hooks.example.com/js-alert" help="테스트 전송으로 받는 쪽을 확인하세요." messages={{ url: "https:// 로 시작하는 주소를 입력하세요." }} />
      <ButtonGroup><Button variant="outline" color="assistive" size="sm">테스트 전송</Button></ButtonGroup>
      <Notice title="규칙 요약">Critical · High 이벤트가 전체 단말에서 10분 안에 5건 이상 생기면 보안팀에 메일을 보내고 웹훅을 호출합니다.</Notice>
      <FormActions sticky>
        <ButtonGroup>
          <Button variant="outline" color="assistive">취소</Button>
          <Button type="submit">저장</Button>
        </ButtonGroup>
      </FormActions>
    </Form>
  );
}
