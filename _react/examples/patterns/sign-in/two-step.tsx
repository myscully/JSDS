import { Button, Checkbox, CodeInput, Form, Link } from "@jiran/ds-react";

/* 2단계 인증 코드는 큰 칸 여섯 — 한 자리씩 치면 다음 칸으로 가고, 붙여넣기와 문자 자동 채우기(one-time-code)는 모든 칸을 한 번에 채운다 */
export default function Example() {
  return (
    <Form validate className="auth">
      <h2 className="auth-title t-title-3">2단계 인증</h2>
      <p className="auth-desc">인증 앱에 표시된 6자리 숫자를 입력하세요.</p>
      <CodeInput id="si-otp" label="인증 코드" name="otp" required requiredMark={false} help="코드는 30초마다 바뀝니다." messages={{ required: "인증 코드를 입력하세요.", code: "숫자 6자리를 모두 입력하세요." }} />
      <Checkbox>이 기기에서 30일 동안 묻지 않기</Checkbox>
      <Button type="submit" size="lg">확인</Button>
      <Link href="#" standalone>다른 방법으로 인증</Link>
    </Form>
  );
}
