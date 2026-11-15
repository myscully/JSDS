import { Button, Checkbox, Form, Link, Notice, TextField } from "@jiran/ds-react";

/* 로그인 실패는 폼 맨 위 Notice 한 곳에 — 어느 칸이 틀렸는지는 알리지 않고 남은 횟수와 잠금 시간을 함께 적는다 */
export default function Example() {
  return (
    <Form validate className="auth">
      <h2 className="auth-title t-title-3">관리 콘솔 로그인</h2>
      <Notice tone="danger" role="alert" title="아이디 또는 비밀번호가 맞지 않습니다">5번 틀리면 10분 동안 로그인할 수 없습니다. 남은 횟수는 3번입니다.</Notice>
      <TextField id="si-id" label="아이디" defaultValue="admin@jiran.com" autoComplete="username" required requiredMark={false} />
      <TextField id="si-pw" label="비밀번호" type="password" reveal autoComplete="current-password" required requiredMark={false} />
      <div className="auth-row">
        <Checkbox defaultChecked>아이디 저장</Checkbox>
        <Link href="#" standalone>비밀번호 찾기</Link>
      </div>
      <Button type="submit" size="lg">로그인</Button>
    </Form>
  );
}
