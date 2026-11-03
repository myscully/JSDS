import { Card, CardDesc, CardGrid, CardTitle, Icon } from "@jiran/ds-react";

/* 카드 전체를 눌러 하나를 고른다 — 안에 버튼 · 링크를 두지 않는다.
   Hover 는 마우스를 올리면 CSS 가 그린다 — 사이트 예제의 고정 Hover(data-state)는 문서 전용이라 여기에는 없다 */
export default function Example() {
  return (
    <CardGrid style={{ maxWidth: 600 }}>
      <Card as="button" type="button" clickable selected={false}>
        <Icon name="scan" size={24} />
        <CardTitle>빠른 검사</CardTitle>
        <CardDesc>실행 중인 프로세스 · 시작 프로그램</CardDesc>
      </Card>
      <Card as="button" type="button" clickable selected={false}>
        <Icon name="file-search" size={24} />
        <CardTitle>사용자 지정 검사</CardTitle>
        <CardDesc>폴더 · 확장자를 골라 검사</CardDesc>
      </Card>
      <Card as="button" type="button" clickable selected>
        <Icon name="shield-check" size={24} />
        <CardTitle>정밀 검사</CardTitle>
        <CardDesc>모든 드라이브 · 압축 파일 포함</CardDesc>
      </Card>
      {/* 고를 수 없는 이유는 설명 줄에 */}
      <Card as="button" type="button" clickable selected={false} disabled>
        <Icon name="database" size={24} />
        <CardTitle>메모리 포렌식</CardTitle>
        <CardDesc>EDR 라이선스가 필요합니다</CardDesc>
      </Card>
    </CardGrid>
  );
}
