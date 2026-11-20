// ds:skeleton off — 사이트 예제는 hidden 패널을 미리 그려 두고, React 는 열렸을 때만 그린다
import { useState } from "react";
import { Button, SidePanel } from "@jiran/ds-react";

const FACTS = [["시각", "2026. 09. 07 14:22:05"], ["호스트", "DESKTOP-7F3K"], ["IP", "10.0.0.12"], ["정책", "외부 USB 차단"], ["처리", "차단"]];

export default function Example() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <Button variant="outline" color="assistive" onClick={() => setOpen(true)}>격리 설정 열기</Button>
      <SidePanel open={open} onClose={close} modal size="lg" title="격리 설정" footer={<><Button variant="outline" color="assistive" onClick={close}>취소</Button><Button onClick={close}>격리</Button></>}>
        <table className="tbl kv">
          <tbody>
            {FACTS.map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}
          </tbody>
        </table>
      </SidePanel>
    </>
  );
}
