import { Notice } from "@jiran/ds-react";

export default function Example() {
  return (
    <Notice tone="info" title="정책이 아직 배포되지 않았습니다" style={{ maxWidth: 600 }}>
      변경 사항은 '배포'를 눌러야 에이전트에 적용됩니다.
    </Notice>
  );
}
