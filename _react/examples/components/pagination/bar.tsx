import { useState } from "react";
import { Pagination, PaginationBar, Select } from "@jiran/ds-react";

export default function Example() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState<string | null>("50");
  return (
    <PaginationBar summary={<>총 <b>1,284</b>건 · {(page - 1) * Number(size) + 1}–{Math.min(page * Number(size), 1284)}</>}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Select options={[{ value: "50", label: "50개씩" }, { value: "100", label: "100개씩" }]} value={size} onChange={setSize} triggerStyle={{ height: 32, minWidth: 120, fontSize: 12 }} />
        <Pagination compact page={page} total={Math.ceil(1284 / Number(size))} siblings={2} onChange={setPage} />
      </div>
    </PaginationBar>
  );
}
