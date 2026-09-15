import { useState } from "react";
import { Button, Card, CardDesc, CardFoot, CardTitle, Onboard, Steps, Tile, TileGrid } from "@jiran/ds-react";

export default function Example() {
  const [level, setLevel] = useState("standard");
  return (
    <Onboard>
      <Steps items={["조직 정보", "보호 수준", "에이전트 배포", "완료"]} current={1} />
      <Card>
        <CardTitle className="t-heading-3">보호 수준을 선택하세요</CardTitle>
        <CardDesc>나중에 정책 › 기본 정책에서 바꿀 수 있습니다.</CardDesc>
        <TileGrid style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Tile icon="S" title="표준" desc="알려진 위협 차단. 권장" selected={level === "standard"} onSelectedChange={() => setLevel("standard")} />
          <Tile icon="E" title="강화" desc="의심 행위까지 차단" selected={level === "hardened"} onSelectedChange={() => setLevel("hardened")} />
        </TileGrid>
        <CardFoot>
          <Button variant="text">건너뛰기</Button>
          <Button variant="secondary">이전</Button>
          <Button>다음</Button>
        </CardFoot>
      </Card>
    </Onboard>
  );
}
