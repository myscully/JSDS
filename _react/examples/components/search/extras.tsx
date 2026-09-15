import { SearchBar } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <SearchBar placeholder="이벤트, 대상, IP 검색" shortcut="/" hotkey />
      <SearchBar defaultValue="랜섬웨어" clearable />
    </>
  );
}
