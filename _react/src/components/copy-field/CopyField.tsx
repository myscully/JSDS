import { forwardRef, useEffect, useRef, useState, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import { announce, copyText, ensureLive } from "../../utils/copy";
import { Icon } from "../../icons/Icon";
import { Button } from "../button/Button";
import { TextField } from "../text-field/TextField";

export const COPY_LABELS = { copy: "복사", copied: "복사됨", failed: "복사 실패", show: "보기", copiedStatus: "복사했습니다.", failedStatus: "복사하지 못했습니다. 값을 직접 선택해 복사하세요." };
export type CopyLabels = Partial<typeof COPY_LABELS>;

interface CopyButtonProps {
  /** 복사할 글자 */
  text: () => string;
  /** 값의 이름 — 버튼 이름에 들어간다 */
  name: string;
  iconOnly?: boolean;
  labels?: CopyLabels;
  onCopy?: (ok: boolean) => void;
}

/** 복사 버튼 — 결과는 이 자리에서 2초(Toast 를 쓰지 않음). Code · Copy Field 가 같이 쓴다 */
export function CopyButton({ text, name, iconOnly, labels, onCopy }: CopyButtonProps) {
  const L = { ...COPY_LABELS, ...labels };
  const [state, setState] = useState<"" | "done" | "fail">("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const self = useRef<HTMLButtonElement>(null);
  useEffect(() => { ensureLive(); return () => clearTimeout(timer.current); }, []);
  const run = async () => {
    const ok = await copyText(text(), self.current?.parentElement ?? document.body);
    clearTimeout(timer.current);
    setState(ok ? "done" : "fail");
    announce(ok ? L.copiedStatus : L.failedStatus);
    onCopy?.(ok);
    timer.current = setTimeout(() => setState(""), 2000);
  };
  return (
    <Button ref={self} variant="text" color="assistive" size="sm" iconOnly={iconOnly} className={cx("copy", state === "done" && "copy-done", state === "fail" && "copy-failed")} aria-label={`${name} ${L.copy}`} onClick={run}>
      <span className="ico"><Icon name={state === "done" ? "check" : state === "fail" ? "alert-circle" : "copy"} size={16} /></span>
      {!iconOnly && <span className="t">{state === "done" ? L.copied : state === "fail" ? L.failed : L.copy}</span>}
    </Button>
  );
}

export interface CopyFieldProps extends Omit<HTMLAttributes<HTMLSpanElement>, "onCopy" | "children"> {
  /** 값의 이름 — 라벨과 버튼 이름 */
  label: string;
  value: string;
  /** 기본으로 가리고 보기 버튼을 둔다. 복사는 가린 채로도 전체 값 */
  secret?: boolean;
  /** 표 · 키-값 목록용. 가리는 기능이 없다 */
  inline?: boolean;
  help?: string;
  onCopy?: (ok: boolean) => void;
  onReveal?: (shown: boolean) => void;
  labels?: CopyLabels;
}

/** 옮겨 쓰는 값 — 읽기 전용 + 복사, 민감한 값은 가린다 */
export const CopyField = forwardRef<HTMLSpanElement, CopyFieldProps>(function CopyField({ label, value, secret, inline, help, onCopy, onReveal, labels, className, ...rest }, ref) {
  const [shown, setShown] = useState(false);
  const L = { ...COPY_LABELS, ...labels };
  const copy = <CopyButton text={() => value} name={label} iconOnly={inline} labels={labels} onCopy={onCopy} />;
  if (inline) {
    return (
      <span ref={ref} className={cx("copy-field inline", className)} {...rest}>
        <span className="value">{value}</span>
        {copy}
      </span>
    );
  }
  return (
    <TextField
      label={label}
      help={help}
      readOnly
      autoComplete="off"
      type={secret && !shown ? "password" : "text"}
      value={value}
      wrapperClassName={cx("copy-field", className)}
      wrapperStyle={rest.style}
      trailing={
        <>
          {secret && (
            <button type="button" className="reveal" aria-label={`${label} ${L.show}`} aria-pressed={shown} onClick={() => { setShown(!shown); onReveal?.(!shown); }}>
              <span className="i-show"><Icon name="eye" size={18} /></span>
              <span className="i-hide"><Icon name="eye-off" size={18} /></span>
            </button>
          )}
          {copy}
        </>
      }
    />
  );
});
