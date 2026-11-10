import { useState } from "react";
import { CursorPagination } from "@jiran/ds-react";

export default function Example() {
  const [page, setPage] = useState(0);
  const from = page * 100 + 1;
  return <CursorPagination hasPrev={page > 0} hasNext onPrev={() => setPage((p) => p - 1)} onNext={() => setPage((p) => p + 1)} range={`${from}–${from + 99}`} />;
}
