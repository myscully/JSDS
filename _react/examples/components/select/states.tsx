import { Select } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Select options={[]} status="loading" placeholder="그룹 선택" label="불러오는 중" defaultOpen />
      <Select options={[]} status="error" onRetry={() => {}} placeholder="그룹 선택" label="불러오기 실패" defaultOpen />
      <Select options={[]} status="empty" placeholder="그룹 선택" label="항목 없음" defaultOpen />
    </>
  );
}
