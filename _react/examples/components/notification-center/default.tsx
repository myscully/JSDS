import { useState } from "react";
import { NotificationCenter, type NotificationItem } from "@jiran/ds-react";

const RECENT: NotificationItem[] = [
  { id: "n1", group: "오늘", severity: "critical", title: "랜섬웨어 의심 행위를 차단했습니다", sub: "PC-2041 · 김보안", time: "10분 전", datetime: "2026-11-14T09:40", href: "#ev-2041", unread: true },
  { id: "n2", group: "오늘", severity: "high", title: "승인되지 않은 원격 접속을 막았습니다", sub: "SRV-DB-01 · 198.51.100.7", time: "32분 전", datetime: "2026-11-14T09:18", href: "#ev-2040", unread: true },
  { id: "n3", group: "오늘", title: "보안 정책 '외부 저장장치 차단'이 배포되었습니다", sub: "영업팀 외 3개 그룹", time: "1시간 전", datetime: "2026-11-14T08:50", href: "#policy-12", unread: true },
  { id: "n4", group: "어제", severity: "medium", title: "에이전트 12대가 24시간 동안 응답하지 않습니다", sub: "부산 지사", time: "어제 18:20", datetime: "2026-11-13T18:20", href: "#agents-offline" },
  { id: "n5", group: "어제", title: "라이선스가 30일 뒤 만료됩니다", time: "어제 09:00", datetime: "2026-11-13T09:00", unread: true },
];
const OLDER: NotificationItem[] = [
  { id: "old-1", group: "이전", severity: "low", title: "USB 저장장치 사용이 기록되었습니다", sub: "PC-1188 · 이운영", time: "11월 10일", datetime: "2026-11-10T16:20" },
  { id: "old-2", group: "이전", title: "에이전트 2.4.1 배포가 끝났습니다", sub: "전체 1,284대", time: "11월 9일", datetime: "2026-11-09T11:05" },
];

export default function Example() {
  const [items, setItems] = useState(RECENT);
  const [hasMore, setHasMore] = useState(true);
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", minHeight: "36rem" }}>
      <NotificationCenter
        defaultOpen
        items={items}
        hasMore={hasMore}
        onRead={(ids) => setItems((xs) => xs.map((x) => (ids.includes(x.id) ? { ...x, unread: false } : x)))}
        onMore={async () => { await new Promise((r) => setTimeout(r, 800)); setItems((xs) => [...xs, ...OLDER]); setHasMore(false); }}
      />
    </div>
  );
}
