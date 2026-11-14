import { NotificationCenter } from "@jiran/ds-react";

export default function Example() {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", width: "100%", minHeight: "16rem" }}>
      <NotificationCenter defaultOpen items={[]} />
    </div>
  );
}
