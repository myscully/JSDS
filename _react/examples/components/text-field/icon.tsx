import { TextField } from "@jiran/ds-react";

/* 칸 안 앞 아이콘 — 무엇을 넣는 칸인지 빨리 알아보게 돕는다. 라벨은 그대로 둔다 */
export default function Example() {
  return (
    <>
      <TextField id="ic-id" label="아이디" icon="user" autoComplete="username" placeholder="아이디 입력" />
      <TextField id="ic-mail" label="알림 받을 이메일" icon="mail" type="email" autoComplete="email" placeholder="name@example.com" />
    </>
  );
}
