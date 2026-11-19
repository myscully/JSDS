import { Button, ButtonGroup, PopupActions, PopupSurface, PopupTitle } from "@jiran/ds-react";

const NAMES = ["외부 USB 차단", "스크립트 실행 제한", "원격 접속 허용 목록"];
const TOTAL = 12;

/* 일괄 작업 — 개수와 이름 몇 개, 나머지는 외 n개. 본문에 목록이 있어 p 가 아닌 div 로 감싼다 */
export default function Example() {
  const close = () => {};
  return (
    <PopupSurface danger onClose={close} aria-describedby="dc2-b">
      <PopupTitle>정책 {TOTAL}개를 삭제할까요?</PopupTitle>
      <div className="popup-body" id="dc2-b">
        <p>삭제한 정책은 복구할 수 없습니다. 적용된 에이전트는 기본 정책으로 돌아갑니다.</p>
        <ul className="danger-list">
          {NAMES.map((n) => <li key={n}>{n}</li>)}
          <li>외 {TOTAL - NAMES.length}개</li>
        </ul>
      </div>
      <PopupActions>
        <ButtonGroup>
          <Button variant="outline" color="assistive" onClick={close}>취소</Button>
          <Button color="negative">삭제</Button>
        </ButtonGroup>
      </PopupActions>
    </PopupSurface>
  );
}
