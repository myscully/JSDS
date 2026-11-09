import { Switch, ToastProvider } from "@jiran/ds-react";

const save = () => new Promise((resolve) => setTimeout(resolve, 900));
const fail = () => new Promise((_, reject) => setTimeout(reject, 900));

/** action 이 끝나야 바뀐다. false 를 돌려주면 그대로(확인 Popup 취소), 던지면 Toast 로 알린다 */
export default function Example() {
  return (
    <ToastProvider>
      <Switch defaultChecked action={save}>실시간 보호</Switch>
      <Switch action={fail} errorMessage="정책 서버에 연결하지 못했습니다. 잠시 후 다시 시도하세요.">USB 자동 검사</Switch>
      <Switch defaultChecked busy>웹 필터</Switch>
    </ToastProvider>
  );
}
