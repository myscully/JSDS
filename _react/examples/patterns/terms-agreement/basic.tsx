import { useState } from "react";
import { Button, ButtonGroup, Checkbox, Terms, TermsAll, TermsItem } from "@jiran/ds-react";

const ITEMS = [
  { id: "tos", label: "서비스 이용약관", required: true },
  { id: "privacy", label: "개인정보 수집·이용", required: true },
  { id: "news", label: "보안 소식 이메일 수신", required: false },
];

export default function Example() {
  const [agreed, setAgreed] = useState<string[]>(["tos", "privacy"]);
  const all = agreed.length === ITEMS.length, some = agreed.length > 0 && !all;
  const requiredOk = ITEMS.filter((i) => i.required).every((i) => agreed.includes(i.id));
  return (
    <Terms>
      <TermsAll>
        <Checkbox checked={all} indeterminate={some} aria-label="전체 동의" onChange={(on) => setAgreed(on ? ITEMS.map((i) => i.id) : [])}>전체 동의</Checkbox>
      </TermsAll>
      {ITEMS.map((it) => (
        <TermsItem key={it.id} required={it.required} onView={it.required ? () => {} : undefined}>
          <Checkbox checked={agreed.includes(it.id)} onChange={(on) => setAgreed((s) => (on ? [...s, it.id] : s.filter((x) => x !== it.id)))}>{it.label}</Checkbox>
        </TermsItem>
      ))}
      <ButtonGroup end style={{ marginTop: 16 }}>
        <Button disabled={!requiredOk}>다음</Button>
      </ButtonGroup>
    </Terms>
  );
}
