import { Button, Checkbox, Form, Icon, Link, Notice, TextField } from "@jiran/ds-react";

/* 로그인 화면(2026-11-18) — 바탕색 위 그림자 카드 · 아래 고정 저작권 줄(.auth-screen · .auth-copy). 카드 위 가운데 제품 로고(shield-check filled 48),
   제목은 숨겨 접근 이름으로 남긴다. 이메일 · 비밀번호 두 칸은 라벨을 숨기고 placeholder + 칸 안 아이콘으로 보인다(숨긴 라벨은 스크린 리더가 읽음).
   로그인 실패는 폼 맨 위 Notice 한 곳에 — 어느 칸이 틀렸는지는 알리지 않고 남은 횟수와 잠금 시간을 함께 적는다 */
export default function Example() {
  return (
    <div className="auth-screen">
      <Form validate className="auth">
        <p className="auth-logo" role="img" aria-label="Security Console"><i><Icon name="shield-check" filled size={48} /></i><span aria-hidden="true">Security Console</span></p>
        <h2 className="sr-only">관리 콘솔 로그인</h2>
        <Notice tone="danger" role="alert" title="이메일 또는 비밀번호가 맞지 않습니다">5번 틀리면 10분 동안 로그인할 수 없습니다. 남은 횟수는 3번입니다. 비밀번호가 기억나지 않으면 비밀번호 찾기를 누르세요.</Notice>
        <TextField id="si-email" label="이메일" labelHidden icon="user" type="email" placeholder="이메일" defaultValue="admin@jiran.com" autoComplete="username" required requiredMark={false} messages={{ required: "이메일을 입력하세요." }} />
        <TextField id="si-pw" label="비밀번호" labelHidden icon="lock" type="password" placeholder="비밀번호" reveal autoComplete="current-password" required requiredMark={false} messages={{ required: "비밀번호를 입력하세요." }} />
        <div className="auth-row">
          <Checkbox defaultChecked>이메일 저장</Checkbox>
          <Link href="#" standalone>비밀번호 찾기</Link>
        </div>
        <Button type="submit" size="lg">로그인</Button>
      </Form>
      <p className="auth-copy">© 2026 JIRANSECURITY Co., Ltd. All rights reserved.</p>
    </div>
  );
}
