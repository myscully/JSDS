import { Accordion } from "@jiran/ds-react";

export default function Example() {
  return (
    <Accordion title="변경 이력" extra="최근 30일" defaultOpen style={{ maxWidth: 560 }} bodyStyle={{ maxHeight: 120, overflow: "auto" }}>
      2026-10-28 실시간 보호 켬<br />2026-10-21 USB 검사 예외 추가<br />2026-10-14 스케줄 변경(평일 09–18)<br />2026-10-07 알림 채널 추가<br />2026-09-30 정책 생성
    </Accordion>
  );
}
