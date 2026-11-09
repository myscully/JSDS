import { useEffect, useRef, useState } from "react";
import { Button, ButtonGroup, Checkbox, Terms, TermsAll, TermsItem, TermsMessage } from "@jiran/ds-react";

const ITEMS = [
  { id: "tos", label: "서비스 이용약관", required: true },
  { id: "privacy", label: "개인정보 수집·이용", required: true },
  { id: "news", label: "보안 소식 이메일 수신", required: false },
];

export default function Example() {
  const [agreed, setAgreed] = useState<string[]>(["tos", "privacy"]);
  const [tried, setTried] = useState(false);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});
  const all = agreed.length === ITEMS.length, some = agreed.length > 0 && !all;
  const missing = ITEMS.filter((i) => i.required && !agreed.includes(i.id));
  useEffect(() => { if (!missing.length) setTried(false); }, [missing.length]);
  /* '다음' 은 늘 켜 둔다 — 누르면 막고, 남은 개수를 알린 뒤 첫 항목으로 포커스를 옮긴다 */
  const next = () => {
    if (missing.length) { setTried(true); inputs.current[missing[0].id]?.focus(); return; }
    // 다음 단계로
  };
  return (
    <Terms>
      <TermsAll>
        <Checkbox checked={all} indeterminate={some} aria-label="전체 동의" onChange={(on) => setAgreed(on ? ITEMS.map((i) => i.id) : [])}>전체 동의</Checkbox>
      </TermsAll>
      {ITEMS.map((it) => (
        <TermsItem key={it.id} required={it.required} onView={it.required ? () => {} : undefined}>
          <Checkbox ref={(el) => { inputs.current[it.id] = el; }} aria-invalid={tried && missing.includes(it) ? true : undefined} checked={agreed.includes(it.id)} onChange={(on) => setAgreed((s) => (on ? [...s, it.id] : s.filter((x) => x !== it.id)))}>{it.label}</Checkbox>
        </TermsItem>
      ))}
      <TermsMessage>{tried && missing.length ? `필수 약관 ${missing.length}개에 동의하지 않았습니다. 체크하고 다시 누르세요.` : null}</TermsMessage>
      <ButtonGroup end style={{ marginTop: 16 }}>
        <Button onClick={next}>다음</Button>
      </ButtonGroup>
    </Terms>
  );
}
