import { Progress } from "@jiran/ds-react";

export default function Example() {
  return (
    <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
      <Progress label="정책 배포 중" value={842} max={1284} valueText="842 / 1,284" />
      <Progress label="전체 검사 완료" value={100} tone="success" size="sm" />
      <Progress label="업데이트 실패" value={38} tone="danger" size="sm" />
    </div>
  );
}
