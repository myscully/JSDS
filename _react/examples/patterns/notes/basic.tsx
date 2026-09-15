import { Notes } from "@jiran/ds-react";

export default function Example() {
  return (
    <Notes
      title="유의사항"
      style={{ maxWidth: 600 }}
      items={[
        "정책은 배포 후 에이전트의 다음 체크인(최대 5분)에 적용됩니다.",
        "차단된 파일은 격리 저장소에 30일 보관 후 자동 삭제됩니다.",
        "예외 목록은 해시 또는 경로 기준이며 와일드카드(*)를 지원합니다.",
      ]}
    />
  );
}
