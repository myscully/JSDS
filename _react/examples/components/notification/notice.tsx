import { Button, Notice } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Notice tone="info" title="정책이 아직 배포되지 않았습니다" onClose={() => {}} style={{ maxWidth: 600 }}>
        변경 사항은 '배포'를 눌러야 에이전트에 적용됩니다.
      </Notice>
      <Notice tone="success" title="배포 완료" style={{ maxWidth: 600 }}>
        1,284대 중 1,284대에 적용되었습니다.
      </Notice>
      <Notice tone="warning" title="라이선스가 3일 후 만료됩니다" actions={<Button size="sm">갱신 요청</Button>} style={{ maxWidth: 600 }}>
        만료 시 신규 이벤트 수집이 중단됩니다.
      </Notice>
      <Notice tone="danger" title="에이전트 37대 연결 끊김" style={{ maxWidth: 600 }}>
        10분 이상 체크인이 없습니다. 네트워크 상태를 확인하세요.
      </Notice>
    </>
  );
}
