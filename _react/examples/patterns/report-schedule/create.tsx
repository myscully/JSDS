import { Button, ButtonGroup, Combobox, Field, Form, FormActions, FormLegend, FormRow, Notice, Radio, RadioGroup, Select, TextField, TimePicker } from "@jiran/ds-react";

const KINDS = [{ value: "summary", label: "보안 요약" }, { value: "threat", label: "위협 상세" }, { value: "agent", label: "에이전트 상태" }];
const RANGES = [{ value: "7", label: "지난 7일" }, { value: "30", label: "지난 30일" }, { value: "month", label: "지난달" }];
const REPEATS = [{ value: "day", label: "매일" }, { value: "mon", label: "매주 월요일" }, { value: "first", label: "매월 1일" }];
const PEOPLE = ["보안팀", "운영팀", "김민준", "이서연", "박지훈"].map((v) => ({ value: v, label: v }));

/* 보고서 예약 — 정기 보고서의 기간은 날짜가 아니라 '지난 7일' 처럼 보내는 때를 기준으로 고른다.
   저장 버튼 위 Notice 가 다음 발송을 한 문장으로 보여 준다(값을 바꾸면 제품이 고친다) */
export default function Example() {
  return (
    <Form validate onSubmit={(e) => e.preventDefault()}>
      <FormLegend />
      <TextField id="rp-name" label="보고서 이름" required defaultValue="주간 보안 요약" />
      <FormRow>
        <Field label="내용">
          <Select options={KINDS} defaultValue="summary" label="내용" keepMounted />
        </Field>
        <Field label="기간">
          <Select options={RANGES} defaultValue="7" label="기간" keepMounted />
        </Field>
      </FormRow>
      <RadioGroup legend="형식" name="rp-fmt" defaultValue="pdf" row>
        <Radio value="pdf">PDF</Radio>
        <Radio value="csv">CSV</Radio>
      </RadioGroup>
      <Field label="받는 사람" htmlFor="rp-to" required>
        <Combobox id="rp-to" multiple required options={PEOPLE} defaultValue={["보안팀", "김민준"]} placeholder="사람 또는 부서 검색" label="받는 사람" />
      </Field>
      <FormRow>
        <Field label="반복">
          <Select options={REPEATS} defaultValue="mon" label="반복" keepMounted />
        </Field>
        <TimePicker id="rp-time" label="시각" defaultValue="09:00" help="서울 시간 기준" />
      </FormRow>
      <Notice title="다음 발송: 11월 16일 월요일 09:00">보안팀 외 1명에게 지난 7일의 보안 요약을 PDF 로 보냅니다.</Notice>
      <FormActions>
        <ButtonGroup>
          <Button variant="outline" color="assistive">미리보기</Button>
          <Button variant="outline">지금 보내기</Button>
          <Button type="submit">예약 저장</Button>
        </ButtonGroup>
      </FormActions>
    </Form>
  );
}
