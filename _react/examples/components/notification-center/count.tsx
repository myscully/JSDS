import { useState } from "react";
import { NotificationCenter, type NotificationItem } from "@jiran/ds-react";

const RECENT: NotificationItem[] = [
  { id: "n1", group: "오늘", severity: "critical", title: "랜섬웨어 의심 행위를 차단했습니다", sub: "PC-2041 · 김보안", time: "10분 전", datetime: "2026-11-14T09:40", href: "#ev-2041", unread: true },
  { id: "n2", group: "오늘", severity: "high", title: "승인되지 않은 원격 접속을 막았습니다", sub: "SRV-DB-01 · 198.51.100.7", time: "32분 전", datetime: "2026-11-14T09:18", href: "#ev-2040", unread: true },
  { id: "n3", group: "오늘", title: "보안 정책 '외부 저장장치 차단'이 배포되었습니다", sub: "영업팀 외 3개 그룹", time: "1시간 전", datetime: "2026-11-14T08:50", href: "#policy-12", unread: true },
  { id: "n4", group: "어제", severity: "medium", title: "에이전트 12대가 24시간 동안 응답하지 않습니다", sub: "부산 지사", time: "어제 18:20", datetime: "2026-11-13T18:20", href: "#agents-offline" },
  { id: "n5", group: "어제", title: "라이선스가 30일 뒤 만료됩니다", time: "어제 09:00", datetime: "2026-11-13T09:00", unread: true },
];
/* 건수가 중요한 제품은 벨에 숫자 배지 — 기본은 점(2026-11-18). 99 를 넘으면 99+ */
export default function Example() {
  const [items, setItems] = useState(RECENT);
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
      <NotificationCenter count="number" items={items} onRead={(ids) => setItems((xs) => xs.map((x) => (ids.includes(x.id) ? { ...x, unread: false } : x)))} />
    </div>
  );
}
