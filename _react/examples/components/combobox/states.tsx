import { Combobox } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Combobox options={[]} filter={false} status="loading" placeholder="부서 검색" label="불러오는 중" defaultOpen style={{ width: 260 }} />
      <Combobox options={[]} filter={false} status="error" onRetry={() => {}} placeholder="부서 검색" label="불러오기 실패" defaultOpen style={{ width: 260 }} />
      <Combobox options={[]} filter={false} status="empty" placeholder="부서 검색" label="항목 없음" defaultOpen style={{ width: 260 }} />
    </>
  );
}
