import { Button, PageHead } from "@jiran/ds-react";

export default function Example() {
  return <PageHead as="h2" style={{ maxWidth: 520 }} title="외부 저장장치 차단 및 예외 승인 정책의 부서별 적용 현황" sub="POL-2041" actions={<Button>저장</Button>} />;
}
