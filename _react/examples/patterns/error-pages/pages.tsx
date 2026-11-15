import { Button, Empty, Icon, Link, Row2 } from "@jiran/ds-react";

/* 화면 전체 — 권한 없음 · 없는 주소 · 서버 오류 · 점검 중. 무엇이 일어났는지 한 줄, 다음에 할 일 하나 */
export default function Example() {
  return (
    <Row2>
      <Empty icon="lock" title="이 화면을 볼 권한이 없습니다" actions={<Button variant="outline" color="assistive">권한 요청</Button>}>
        관리자에게 정책 편집 권한을 요청하세요.
      </Empty>
      <Empty icon="file-search" title="페이지를 찾을 수 없습니다" actions={<Button as="a" href="#" variant="outline" color="assistive">대시보드로 이동</Button>}>
        주소가 바뀌었거나 삭제된 페이지입니다.
      </Empty>
      <Empty className="error" icon="alert-triangle" title="일시적인 오류가 발생했습니다" actions={<Button variant="outline" color="assistive"><Icon name="refresh" />다시 시도</Button>}>
        잠시 후 다시 시도하세요. 계속되면 오류 번호 E-5021 을 알려 주세요.
      </Empty>
      {/* 점검 중에는 다시 시도를 두지 않는다 */}
      <Empty icon="tool" title="시스템 점검 중입니다" actions={<Link standalone href="#">점검 공지 보기</Link>}>
        11월 16일 02:00 부터 04:00 까지 점검합니다. 점검이 끝나면 다시 접속하세요.
      </Empty>
    </Row2>
  );
}
