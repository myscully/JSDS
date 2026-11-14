import { Form, FormLegend, Stepper, TextField } from "@jiran/ds-react";

/* '다음'은 그 단계 폼을 검사한다 — 적용 그룹이 비어 있어 막힌다. 완료한 '기본 정보'는 눌러 돌아간다 */
export default function Example() {
  return (
    <Stepper
      defaultCurrent={1}
      steps={[
        { label: "기본 정보", content: <Form validate><FormLegend /><TextField id="sd-name" label="정책 이름" required help="2~40자" defaultValue="외부 USB 차단" /></Form> },
        { label: "적용 대상", content: <Form validate><FormLegend /><TextField id="sd-group" label="적용 그룹" required help="예: 영업팀" /></Form> },
        { label: "규칙 설정", content: <p className="t-body-2-reading">차단할 장치 종류와 예외를 정합니다.</p> },
        { label: "검토 · 배포", content: <p className="t-body-2-reading">설정을 확인한 뒤 완료를 누릅니다.</p> },
      ]}
    />
  );
}
