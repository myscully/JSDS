import { Banner, Button } from "@jiran/ds-react";

export default function Example() {
  return (
    <Banner action={<Button size="sm" variant="secondary">자세히</Button>}>
      9월 10일 02:00~04:00 정기 점검이 예정되어 있습니다. 점검 중 콘솔 접속이 제한됩니다.
    </Banner>
  );
}
