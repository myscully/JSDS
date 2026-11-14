import { Steps } from "@jiran/ds-react";

/* 표시만 — 이동은 제품이 한다. 완료한 단계를 누르면 onStepClick */
export default function Example() {
  return <Steps aria-label="진행 단계" items={["기본 정보", "적용 대상", "규칙 설정", "검토 · 배포"]} current={2} onStepClick={() => {}} />;
}
