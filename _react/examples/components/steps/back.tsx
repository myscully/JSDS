import { useState } from "react";
import { Steps } from "@jiran/ds-react";

export default function Example() {
  const [current, setCurrent] = useState(2);
  return <Steps aria-label="진행 단계" items={["기본 정보", "적용 대상", "규칙 설정", "검토 · 배포"]} current={current} onStepClick={setCurrent} />;
}
