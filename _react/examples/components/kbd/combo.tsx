import { Kbd } from "@jiran/ds-react";

/** "Mod" 는 맥에서 ⌘(숨긴 이름 Command), 그 밖에서 Ctrl 로 그린다 */
export default function Example() {
  return (
    <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
      <Kbd keys={["Mod", "K"]} />
      <Kbd keys={["Shift", "Tab"]} />
    </div>
  );
}
