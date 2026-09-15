import { useState } from "react";
import { Pagination } from "@jiran/ds-react";

export default function Example() {
  const [a, setA] = useState(8);
  const [b, setB] = useState(1);
  return (
    <>
      <Pagination compact boundaries={0} page={a} total={20} onChange={setA} />
      <Pagination outline page={b} total={3} onChange={setB} />
    </>
  );
}
