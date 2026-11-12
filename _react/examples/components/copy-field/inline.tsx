import { CopyField } from "@jiran/ds-react";

export default function Example() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", alignItems: "center" }}>
      <span className="t-label-1-normal t-semibold">에이전트 IP</span>
      <CopyField inline label="에이전트 IP" value="203.0.113.24" />
      <span className="t-label-1-normal t-semibold">파일 해시</span>
      <CopyField inline label="파일 해시" value="9f86d081884c7d65" />
    </div>
  );
}
