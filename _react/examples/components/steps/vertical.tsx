import { Form, FormLegend, Stepper, TextField } from "@jiran/ds-react";

/* 세로 — 현재 단계의 내용과 버튼이 그 단계 아래에 펼쳐진다 */
export default function Example() {
  return (
    <Stepper
      layout="vertical"
      defaultCurrent={1}
      steps={[
        { label: "기본 정보", content: <Form validate><FormLegend /><TextField id="sv-name" label="정책 이름" required help="2~40자" defaultValue="외부 USB 차단" /></Form> },
        { label: "적용 대상", content: <Form validate><FormLegend /><TextField id="sv-group" label="적용 그룹" required help="예: 영업팀" /></Form> },
        { label: "규칙 설정", content: <p className="t-body-2-reading">차단할 장치 종류와 예외를 정합니다.</p> },
        { label: "검토 · 배포", content: <p className="t-body-2-reading">설정을 확인한 뒤 완료를 누릅니다.</p> },
      ]}
    />
  );
}
