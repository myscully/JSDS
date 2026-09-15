import { Divider } from "@jiran/ds-react";

export default function Example() {
  return (
    <div style={{ width: "100%", maxWidth: 480 }}>
      <p className="t-body-2" style={{ margin: 0 }}>기본 설정</p>
      <Divider />
      <p className="t-body-2" style={{ margin: 0 }}>고급 설정</p>
      <Divider strong />
      <p className="t-body-2" style={{ margin: 0 }}>감사 로그</p>
      <Divider dashed />
    </div>
  );
}
