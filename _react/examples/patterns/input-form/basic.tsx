import { useState } from "react";
import { Button, ButtonGroup, Checkbox, Combobox, DatePicker, Field, FileUpload, Form, FormActions, FormLegend, FormRow, FormSection, NumberInput, Radio, RadioGroup, Select, TextArea, TextField, TimePicker, type UploadItem } from "@jiran/ds-react";

const GROUPS = [{ value: "all", label: "전체" }, { value: "sales", label: "영업팀" }, { value: "dev", label: "개발팀" }, { value: "sec", label: "보안팀" }];
const DEPTS = ["영업팀", "개발팀", "인프라팀", "보안팀", "기획팀", "재무팀"].map((label) => ({ value: label, label }));
const MB = 1024 * 1024;

/* 값의 종류마다 맞는 컨트롤 — 날짜 · 시각 · 여러 부서 · 첨부 파일 */
export default function Example() {
  const [files, setFiles] = useState<UploadItem[]>([]);
  return (
    <Form onSubmit={(e) => e.preventDefault()}>
      <FormLegend />
      <FormSection>기본 정보</FormSection>
      <TextField id="pname" label="정책 이름" required placeholder="예: 외부 USB 차단" help="2~40자" />
      <TextArea id="pdesc" label="설명" placeholder="정책의 목적과 적용 범위" />
      <FormSection>적용 대상</FormSection>
      <FormRow>
        <Field label="그룹">
          <Select options={GROUPS} defaultValue="all" label="그룹" keepMounted />
        </Field>
        <NumberInput id="prio" label="우선순위" defaultValue="10" min={1} max={100} help="1~100" />
      </FormRow>
      <Field label="알림 받을 부서" htmlFor="pnotify">
        <Combobox id="pnotify" multiple options={DEPTS} defaultValue={["보안팀"]} placeholder="부서 검색" label="알림 받을 부서" />
      </Field>
      <FormSection>적용 일정</FormSection>
      <FormRow>
        <DatePicker id="pstart" label="적용 시작일" defaultValue={new Date(2026, 10, 16)} />
        <TimePicker id="ptime" label="적용 시각" defaultValue="09:00" />
      </FormRow>
      <RadioGroup legend="탐지 시 동작" name="fa" defaultValue="block">
        <Radio value="block">차단 후 알림</Radio>
        <Radio value="notify">알림만</Radio>
      </RadioGroup>
      <Field label="예외 목록" help="CSV, 1MB 이하">
        <FileUpload compact accept=".csv" maxSize={MB} items={files}
          onAdd={(added) => setFiles((p) => [...p, ...added.map(({ id, file }) => ({ id, name: file.name, size: file.size, status: "uploading" as const, progress: 0 }))])}
          onRemove={(id) => setFiles((p) => p.filter((x) => x.id !== id))}
        />
      </Field>
      <Checkbox defaultChecked description="에이전트가 다음 체크인에서 적용합니다">저장 즉시 배포</Checkbox>
      <FormActions>
        <ButtonGroup>
          <Button variant="outline" color="assistive">취소</Button>
          <Button type="submit">정책 저장</Button>
        </ButtonGroup>
      </FormActions>
    </Form>
  );
}
