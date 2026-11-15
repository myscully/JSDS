import { Toast, ToastStack } from "@jiran/ds-react";

/* 되돌리기 — 되돌릴 수 있는 동작은 묻지 않고 실행한 뒤 실행 취소가 있는 Toast. 앱에서는 useToast 가 10초 동안 띄운다 */
export default function Example() {
  return (
    <ToastStack>
      <Toast action={{ label: "실행 취소", onClick: () => {} }}>정책 3개를 보관함으로 옮겼습니다</Toast>
    </ToastStack>
  );
}
