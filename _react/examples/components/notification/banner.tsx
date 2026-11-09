import { useState } from "react";
import { Banner, Button } from "@jiran/ds-react";

export default function Example() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <Banner action={<Button variant="outline" color="assistive" size="sm">점검 안내 보기</Button>} onClose={() => setOpen(false)}>
      9월 10일 02:00~04:00 정기 점검이 예정되어 있습니다. 점검 중 콘솔 접속이 제한됩니다.
    </Banner>
  );
}
