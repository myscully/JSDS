import { Accordion, Checkbox, Tag, Terms } from "@jiran/ds-react";

/* 약관이 짧으면 펼쳐 보이게 — 본문은 키보드로도 스크롤되게 이름 있는 영역으로 */
export default function Example() {
  return (
    <Terms>
      <Accordion
        defaultOpen
        style={{ maxWidth: 560 }}
        bodyStyle={{ maxHeight: 120, overflow: "auto" }}
        bodyProps={{ tabIndex: 0, role: "region", "aria-label": "서비스 이용약관 전문" }}
        title={<><Checkbox defaultChecked>서비스 이용약관</Checkbox><Tag tone="accent" size="sm">필수</Tag></>}
      >
        제1조(목적) 이 약관은 지란지교시큐리티가 제공하는 보안 관리 서비스의 이용 조건과 절차를 정합니다. 제2조(정의) 서비스란 회사가 제공하는 에이전트와 관리 콘솔을 말합니다. 제3조(약관의 효력) 이 약관은 서비스 화면에 게시하여 효력이 생깁니다. 회사는 약관을 바꾸면 적용일 7일 전에 알립니다.
      </Accordion>
    </Terms>
  );
}
