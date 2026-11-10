import { SkipLink } from "@jiran/ds-react";

export default function Example() {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 480, height: 64, border: "1px solid var(--line-neutral-secondary)", borderRadius: "var(--radius-lg)" }}>
      <SkipLink href="#" className="show" />
    </div>
  );
}
