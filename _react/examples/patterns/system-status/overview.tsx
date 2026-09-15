import { Button, Notice, Stack, StatusItem, StatusList } from "@jiran/ds-react";

export default function Example() {
  return (
    <Stack style={{ maxWidth: 800 }}>
      <Notice tone="danger" title="SIEM 연동 연결 끊김" actions={<><Button size="sm">연동 설정</Button><Button size="sm" variant="text">다시 시도</Button></>}>
        09:12 부터 이벤트 전송이 실패하고 있습니다. 인증 토큰을 확인하세요.
      </Notice>
      <StatusList>
        <StatusItem tone="ok" meta="가동 99.98%">수집 서버</StatusItem>
        <StatusItem tone="ok" meta="rev 2041">정책 배포</StatusItem>
        <StatusItem tone="warn" meta="지연 3분">업데이트 서버</StatusItem>
        <StatusItem tone="danger" meta="09:12 끊김">SIEM 연동</StatusItem>
        <StatusItem tone="info" meta="02:00~04:00">DB 점검</StatusItem>
        <StatusItem tone="ok" meta="842 / 1,000">라이선스</StatusItem>
      </StatusList>
    </Stack>
  );
}
