import { Skeleton, SkeletonRow } from "@jiran/ds-react";

export default function Example() {
  return (
    <div style={{ width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", gap: 14 }} aria-busy="true">
      <SkeletonRow avatar lines={["title", "text"]} />
      <SkeletonRow avatar lines={["title", "short"]} />
      <Skeleton variant="rect" />
    </div>
  );
}
