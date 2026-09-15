import { DataTable } from "@jiran/ds-react";

type Row = { id: string; time: string; sev: string; event: string; target: string };

export default function Example() {
  return (
    <DataTable<Row>
      columns={[{ key: "time", header: "시간" }, { key: "sev", header: "심각도" }, { key: "event", header: "이벤트" }, { key: "target", header: "대상" }]}
      rows={[]}
      rowKey={(r) => r.id}
      empty={<>조건에 맞는 이벤트가 없습니다. <a href="#" className="link">필터 초기화</a></>}
    />
  );
}
