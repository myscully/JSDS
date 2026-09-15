import { TextArea } from "@jiran/ds-react";

export default function Example() {
  return <TextArea id="memo" label="메모" placeholder="정책 변경 사유를 남겨 주세요" help="감사 로그에 기록됩니다" wrapperStyle={{ minWidth: 420 }} />;
}
