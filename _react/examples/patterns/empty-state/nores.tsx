import { Button, Empty } from "@jiran/ds-react";

export default function Example() {
  return (
    <Empty icon="search" title="'랜섬웨어 2025' 에 대한 결과가 없습니다" style={{ maxWidth: 560 }} actions={<Button variant="secondary">필터 초기화</Button>}>
      검색어를 줄이거나 기간 필터(최근 24시간)를 넓혀 보세요.
    </Empty>
  );
}
