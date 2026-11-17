import { CodeInput, Form } from "@jiran/ds-react";

/* 인증 코드 — 칸마다 한 자리. 치면 다음 칸, 붙여넣기 · 문자 자동 채우기는 모든 칸을 한 번에 채운다 */
export default function Example() {
  return (
    <>
      <Form validate bare>
        <CodeInput id="cd" label="인증 코드" name="otp" required requiredMark={false} help="인증 앱에 표시된 6자리 숫자" messages={{ required: "인증 코드를 입력하세요.", code: "숫자 6자리를 모두 입력하세요." }} />
      </Form>
      <CodeInput id="cd-e" label="인증 코드" defaultValue="4821" error="숫자 6자리를 모두 입력하세요." />
      <CodeInput id="cd-d" label="인증 코드" defaultValue="482193" disabled />
    </>
  );
}
