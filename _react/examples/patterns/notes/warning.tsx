import { Notes } from "@jiran/ds-react";

export default function Example() {
  return (
    <Notes
      warning
      title="정책 삭제 전 확인"
      style={{ maxWidth: 600 }}
      items={["삭제한 정책이 적용된 에이전트는 기본 정책으로 돌아갑니다.", "감사 로그는 유지되지만 정책 이름은 ID 로 표시됩니다."]}
    />
  );
}
