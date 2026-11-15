import { Button, PopupActions, PopupSurface, PopupTitle } from "@jiran/ds-react";

/* 약관 전문 — 보기 버튼이 여는 팝업. 본문은 키보드로 스크롤되는 이름 있는 영역이다(문서 예제라 표면만 그린다) */
const DOCS = [
  {
    id: "terms-tos",
    title: "서비스 이용약관",
    body: [
      "제1조(목적) 이 약관은 지란지교시큐리티가 제공하는 보안 관리 서비스의 이용 조건과 절차를 정합니다.",
      "제2조(정의) 서비스란 회사가 제공하는 에이전트와 관리 콘솔을 말합니다. 이용자란 이 약관에 따라 서비스를 쓰는 조직과 그 구성원을 말합니다.",
      "제3조(약관의 효력) 이 약관은 서비스 화면에 게시하여 효력이 생깁니다. 회사는 관련 법령을 어기지 않는 범위에서 약관을 바꿀 수 있고, 바꾸면 적용일 7일 전에 알립니다.",
    ],
  },
  {
    id: "terms-privacy",
    title: "개인정보 수집·이용",
    body: [
      "수집 항목은 이름, 이메일, 소속 부서입니다. 관리자 계정을 만들고 보안 알림을 보내는 데 씁니다.",
      "보유 기간은 계정을 지운 뒤 30일입니다. 동의하지 않으면 관리자 계정을 만들 수 없습니다.",
    ],
  },
];

export default function Example() {
  const close = () => {};
  return (
    <>
      {DOCS.map((d) => (
        <PopupSurface key={d.id} id={d.id} onClose={close}>
          <PopupTitle>{d.title}</PopupTitle>
          <div className="popup-body terms-doc" tabIndex={0} role="region" aria-label={`${d.title} 전문`}>
            {d.body.map((p) => <p key={p}>{p}</p>)}
          </div>
          <PopupActions>
            <Button variant="outline" color="assistive" onClick={close}>닫기</Button>
          </PopupActions>
        </PopupSurface>
      ))}
    </>
  );
}
