// ds:skeleton off — 사이트 예제는 열린 도움말의 정적 모습이고, 여기서는 실제로 열고 닫는다
import { useEffect, useState } from "react";
import { Button, Kbd, Popup, PopupTitle, Table, TableBody, TableHeader, TableRow, TableCell } from "@jiran/ds-react";

const ROWS: [string, string[]][] = [["명령 팔레트 열기", ["Mod", "K"]], ["검색창으로 이동", ["/"]], ["단축키 보기", ["?"]], ["닫기", ["Esc"]]];

/** ? 키로 연다 — 입력 중 · 한글 조합 · 다른 대화상자가 열린 동안은 무시 */
export default function Example() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key !== "?" || e.isComposing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (t.closest("input, textarea, select, [contenteditable='true']") || document.querySelector('[aria-modal="true"]')) return;
      e.preventDefault(); setOpen(true);
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);
  return (
    <>
      <Button variant="outline" color="assistive" aria-keyshortcuts="Shift+?" onClick={() => setOpen(true)}>단축키 보기</Button>
      <Popup open={open} onClose={() => setOpen(false)} data-hotkey-help="">
        <PopupTitle>단축키</PopupTitle>
        <Table className="kv">
          <TableBody>
            {ROWS.map(([name, keys]) => (
              <TableRow key={name}>
                <TableHeader scope="row">{name}</TableHeader>
                <TableCell><Kbd keys={keys} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Popup>
    </>
  );
}
