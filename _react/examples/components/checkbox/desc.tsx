import { Checkbox, CheckboxGroup } from "@jiran/ds-react";

export default function Example() {
  return (
    <CheckboxGroup>
      <Checkbox defaultChecked description="배포가 완료되면 관리자 메일로 알립니다">정책 배포 시 알림</Checkbox>
      <Checkbox description="매주 월요일 09:00 에 발송">주간 리포트 수신</Checkbox>
    </CheckboxGroup>
  );
}
