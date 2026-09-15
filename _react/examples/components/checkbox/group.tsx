import { useState } from "react";
import { Checkbox, CheckboxGroup } from "@jiran/ds-react";

const LEVELS = ["Critical", "High", "Medium", "Low"];

export default function Example() {
  const [sel, setSel] = useState<string[]>(["Critical", "High"]);
  const all = sel.length === LEVELS.length, some = sel.length > 0 && !all;
  return (
    <CheckboxGroup>
      <Checkbox checked={all} indeterminate={some} onChange={(on) => setSel(on ? LEVELS : [])}>
        <b>전체 선택</b>
      </Checkbox>
      <CheckboxGroup row style={{ paddingLeft: 28 }}>
        {LEVELS.map((l) => (
          <Checkbox key={l} checked={sel.includes(l)} onChange={(on) => setSel((s) => (on ? [...s, l] : s.filter((x) => x !== l)))}>
            {l}
          </Checkbox>
        ))}
      </CheckboxGroup>
    </CheckboxGroup>
  );
}
