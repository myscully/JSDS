import { Button, PopupActions, PopupSurface, PopupTitle } from "@jiran/ds-react";

/* 세션 만료 전 확인 — 남은 시간을 보이고 연장이 주 버튼. 닫기 · Esc 도 연장으로 본다 */
/* 본문이 두 문단이라 PopupBody(p) 대신 div.popup-body — 위험 확인이 아니어서 aria-describedby 를 잇지 않는다 */
export default function Example() {
  return (
    <PopupSurface onClose={() => {}}>
      <PopupTitle>로그인을 연장할까요?</PopupTitle>
      <div className="popup-body">
        <p>오래 쓰지 않아 곧 자동으로 로그아웃됩니다. 저장하지 않은 입력은 사라집니다.</p>
        <p className="auth-timer" role="timer">남은 시간 <b>01:58</b></p>
      </div>
      <PopupActions>
        <Button variant="outline" color="assistive">로그아웃</Button>
        <Button>연장</Button>
      </PopupActions>
    </PopupSurface>
  );
}
