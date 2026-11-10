import { useState } from "react";
import { PaginationBar } from "@jiran/ds-react";

export default function Example() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(50);
  return <PaginationBar total={1284} page={page} pageSize={size} onPageChange={setPage} onPageSizeChange={setSize} />;
}
