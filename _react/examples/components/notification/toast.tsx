// ds:skeleton off — 사이트 예제는 토스트 2개의 정적 모습. 실제로는 ToastProvider + useToast 로 띄운다
import { Button, ButtonGroup, ToastProvider, useToast } from "@jiran/ds-react";

function Demo() {
  const toast = useToast();
  return (
    <ButtonGroup>
      <Button onClick={() => toast.show({ message: "정책 'USB 차단' 이 저장되었습니다", action: { label: "실행 취소", onClick: () => {} } })}>저장</Button>
      <Button variant="danger-secondary" onClick={() => toast.show({ tone: "danger", message: "내보내기에 실패했습니다", action: { label: "다시 시도", onClick: () => {} } })}>
        실패 알림
      </Button>
    </ButtonGroup>
  );
}

/** 앱 루트에 ToastProvider 를 한 번 두고, 어디서든 useToast().show(...) */
export default function Example() {
  return (
    <ToastProvider duration={4000} max={3}>
      <Demo />
    </ToastProvider>
  );
}
