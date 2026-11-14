import { Form, FormLegend, Stepper, TextField } from "@jiran/ds-react";

/* 자유 이동 — 어느 단계든 누른다. 떠날 때 폼이 통과하면 완료로 표시하고, '완료'는 막힌 첫 단계(적용 그룹)로 간다 */
export default function Example() {
  return (
    <Stepper
      nonLinear
      steps={[
        { label: "기본 정보", content: <Form validate><FormLegend /><TextField id="sn-name" label="정책 이름" required help="2~40자" defaultValue="외부 USB 차단" /></Form> },
        { label: "적용 대상", content: <Form validate><FormLegend /><TextField id="sn-group" label="적용 그룹" required help="예: 영업팀" /></Form> },
        { label: "규칙 설정", content: <p className="t-body-2-reading">차단할 장치 종류와 예외를 정합니다.</p> },
        { label: "검토 · 배포", content: <p className="t-body-2-reading">설정을 확인한 뒤 완료를 누릅니다.</p> },
      ]}
      onFinish={() => {}}
    />
  );
}
