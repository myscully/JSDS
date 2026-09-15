import { Steps } from "@jiran/ds-react";

export default function Example() {
  return <Steps items={["기본 정보", "적용 대상", "규칙 설정", "검토 · 배포"]} current={2} />;
}
