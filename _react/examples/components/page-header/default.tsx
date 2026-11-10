import { Button, PageHead } from "@jiran/ds-react";

export default function Example() {
  return (
    <PageHead
      title="정책"
      sub="전체 24개 · 최근 배포 09:41"
      actions={<><Button variant="outline" color="assistive">내보내기</Button><Button>정책 만들기</Button></>}
    />
  );
}
