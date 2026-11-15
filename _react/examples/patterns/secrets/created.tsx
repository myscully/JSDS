import { Button, CopyField, Notice, PopupActions, PopupSurface, PopupTitle } from "@jiran/ds-react";

/* 비밀값은 만든 직후 한 번만 — 가린 채로도 전체 값이 복사된다. 본문에 알림과 필드가 있어 PopupBody(p) 대신 div.popup-body */
export default function Example() {
  return (
    <PopupSurface onClose={() => {}}>
      <PopupTitle>API 키를 만들었습니다</PopupTitle>
      <div className="popup-body">
        <Notice tone="warning" title="이 창을 닫으면 다시 볼 수 없습니다">지금 복사해 연동할 서비스에 넣으세요.</Notice>
        <CopyField secret label="비밀값" value="jsk_live_8c2e41f7a9b3d605e1" />
      </div>
      <PopupActions>
        <Button variant="outline" color="assistive">닫기</Button>
      </PopupActions>
    </PopupSurface>
  );
}
