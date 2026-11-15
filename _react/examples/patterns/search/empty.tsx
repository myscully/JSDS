import { Button, Empty, SearchBar, Stack, Toolbar } from "@jiran/ds-react";

/* 결과가 없으면 표 대신 Empty State — 무엇을 바꾸면 되는지와 필터 초기화 */
export default function Example() {
  return (
    <Stack>
      <Toolbar>
        <SearchBar defaultValue="랜섬웨어 2025" placeholder="이벤트, 단말, IP 검색" label="이벤트 검색 결과 없음 예시" />
      </Toolbar>
      <Toolbar className="sub"><span>결과 <b>0</b>건</span></Toolbar>
      <Empty icon="search" title="'랜섬웨어 2025' 에 대한 결과가 없습니다" actions={<Button variant="outline" color="assistive">필터 초기화</Button>}>
        검색어를 줄이거나 기간을 최근 30일로 넓혀 보세요.
      </Empty>
    </Stack>
  );
}
