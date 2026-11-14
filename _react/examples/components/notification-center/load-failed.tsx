import { useRef, useState } from "react";
import { NotificationCenter, type NotificationItem } from "@jiran/ds-react";

const YESTERDAY: NotificationItem[] = [
  { id: "n4", group: "어제", severity: "medium", title: "에이전트 12대가 24시간 동안 응답하지 않습니다", sub: "부산 지사", time: "어제 18:20", datetime: "2026-11-13T18:20", href: "#agents-offline" },
  { id: "n5", group: "어제", title: "라이선스가 30일 뒤 만료됩니다", time: "어제 09:00", datetime: "2026-11-13T09:00", unread: true },
];
const OLDER: NotificationItem[] = [
  { id: "old-1", group: "이전", severity: "low", title: "USB 저장장치 사용이 기록되었습니다", sub: "PC-1188 · 이운영", time: "11월 10일", datetime: "2026-11-10T16:20" },
  { id: "old-2", group: "이전", title: "에이전트 2.4.1 배포가 끝났습니다", sub: "전체 1,284대", time: "11월 9일", datetime: "2026-11-09T11:05" },
];

export default function Example() {
  const [items, setItems] = useState(YESTERDAY);
  const [hasMore, setHasMore] = useState(true);
  const tried = useRef(false);
  /* 첫 시도는 실패를 흉내 낸다 — reject 하면 버튼 위에 문구가 뜨고 '다시 시도' 로 바뀐다 */
  const more = async () => {
    await new Promise((r) => setTimeout(r, 800));
    if (!tried.current) { tried.current = true; throw new Error(); }
    setItems((xs) => [...xs, ...OLDER]); setHasMore(false);
  };
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", minHeight: "30rem" }}>
      <NotificationCenter defaultOpen items={items} hasMore={hasMore} onMore={more} onRead={(ids) => setItems((xs) => xs.map((x) => (ids.includes(x.id) ? { ...x, unread: false } : x)))} />
    </div>
  );
}
