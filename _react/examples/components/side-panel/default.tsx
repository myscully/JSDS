import { Button, ButtonGroup, SidePanelSurface } from "@jiran/ds-react";

const FACTS = [["시각", "2026. 09. 07 14:22:05"], ["호스트", "DESKTOP-7F3K"], ["IP", "10.0.0.12"], ["정책", "외부 USB 차단"], ["처리", "차단"]];

export default function Example() {
  return (
    <SidePanelSurface
      title="이벤트 상세"
      onClose={() => {}}
      footer={<><ButtonGroup><Button variant="outline" color="assistive">닫기</Button><Button>예외 추가</Button></ButtonGroup></>}
    >
      <table className="tbl kv">
          <tbody>
            {FACTS.map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}
          </tbody>
        </table>
    </SidePanelSurface>
  );
}
