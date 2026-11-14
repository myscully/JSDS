import { useState } from "react";
import { Button, NotificationCenter, type NotificationItem } from "@jiran/ds-react";

const YESTERDAY: NotificationItem[] = [
  { id: "n4", group: "어제", severity: "medium", title: "에이전트 12대가 24시간 동안 응답하지 않습니다", sub: "부산 지사", time: "어제 18:20", datetime: "2026-11-13T18:20", href: "#agents-offline" },
  { id: "n5", group: "어제", title: "라이선스가 30일 뒤 만료됩니다", time: "어제 09:00", datetime: "2026-11-13T09:00", unread: true },
];

export default function Example() {
  const [items, setItems] = useState(YESTERDAY);
  /* 실제로는 웹소켓 · 폴링 같은 제품의 연결이 새 항목을 맨 앞에 넣는다 */
  const arrive = () => setItems((xs) => [{ id: `live-${xs.length}`, group: "오늘", severity: "critical", title: "관리자 계정 로그인이 5회 실패했습니다", sub: "admin · 203.0.113.24", time: "방금", datetime: new Date().toISOString(), unread: true }, ...xs]);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%", minHeight: "32rem" }}>
      <Button variant="outline" color="assistive" size="sm" onClick={arrive}>새 알림 도착 흉내</Button>
      <NotificationCenter items={items} onRead={(ids) => setItems((xs) => xs.map((x) => (ids.includes(x.id) ? { ...x, unread: false } : x)))} />
    </div>
  );
}
