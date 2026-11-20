import { Button, SidePanelSurface } from "@jiran/ds-react";

const FACTS = [["시각", "2026. 09. 07 14:22:05"], ["호스트", "DESKTOP-7F3K"], ["IP", "10.0.0.12"], ["정책", "외부 USB 차단"], ["처리", "차단"], ["그룹", "본사 · 개발"], ["운영체제", "Windows 11"], ["버전", "4.2.1"], ["마지막 체크인", "2026. 09. 07 14:20"], ["정책 수", "12"], ["라이선스", "2027. 03. 31 까지"]];

export default function Example() {
  return (
    <SidePanelSurface title="에이전트 상세" onClose={() => {}} style={{ height: 320 }} footer={<Button>격리</Button>}>
      <table className="tbl kv">
          <tbody>
            {FACTS.map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}
          </tbody>
        </table>
    </SidePanelSurface>
  );
}
