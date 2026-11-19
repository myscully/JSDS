import { TextArea } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <TextArea id="memo-s" label="메모" size="sm" placeholder="Small · 최소 72px" wrapperStyle={{ minWidth: "min(420px, 100%)" }} />
      <TextArea id="memo" label="메모" placeholder="정책 변경 사유를 남겨 주세요" help="감사 로그에 기록됩니다" wrapperStyle={{ minWidth: "min(420px, 100%)" }} />
      <TextArea id="memo-l" label="메모" size="lg" placeholder="Large · 최소 120px" wrapperStyle={{ minWidth: "min(420px, 100%)" }} />
    </>
  );
}
