import { SkeletonRow, Spinner } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Spinner delay label="정책 불러오는 중" />
      <div style={{ width: "100%", maxWidth: 520 }} aria-busy="true">
        <SkeletonRow delay={300} avatar lines={["title", "text"]} />
      </div>
    </>
  );
}
