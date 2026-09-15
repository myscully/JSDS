import { useState } from "react";
import { Pagination } from "@jiran/ds-react";

export default function Example() {
  const [page, setPage] = useState(1);
  return <Pagination page={page} total={24} siblings={3} onChange={setPage} />;
}
