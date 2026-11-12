import { Link } from "@jiran/ds-react";

export default function Example() {
  return (
    <div className="t-label-1-reading t-regular" style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
      <Link href="#" standalone>랜섬웨어 행위 탐지</Link>
      <Link href="#" standalone>미승인 USB 연결</Link>
    </div>
  );
}
