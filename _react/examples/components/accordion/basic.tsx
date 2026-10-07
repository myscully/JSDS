import { Accordion } from "@jiran/ds-react";

export default function Example() {
  return (
    <>
      <Accordion title="고급 탐지 옵션" extra="3개 설정" defaultOpen style={{ maxWidth: 560 }}>
        휴리스틱 분석, 메모리 스캔, 스크립트 차단을 개별로 켜고 끕니다. 기본값은 모두 켬입니다.
      </Accordion>
      <Accordion sm title="고급 탐지 옵션" extra="sm · 헤더 44" style={{ maxWidth: 560 }}>
        같은 내용을 좁은 밀도로 보여 줍니다. 타이포는 그대로고 여백만 줄어듭니다.
      </Accordion>
    </>
  );
}
