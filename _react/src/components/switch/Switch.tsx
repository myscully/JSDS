import { forwardRef, useEffect, useRef, useState, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useControllable } from "../../utils/useControllable";
import { LABELS } from "../../labels";
import { useOptionalToast } from "../notification/Notification";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "onChange" | "children"> {
  /** 라벨. 켜지는 대상을 쓴다("실시간 보호"). 켜짐 · 꺼짐에 따라 바꾸지 않는다. 없으면 aria-label */
  children?: ReactNode;
  size?: "md" | "sm";
  /** 라벨을 왼쪽에 */
  labelLeft?: boolean;
  onChange?: (checked: boolean, e: ChangeEvent<HTMLInputElement>) => void;
  /** 응답 후 반영 — 주면 누르는 동안 처리 중이 되고, 끝나야 바뀐다. false 를 돌려주면 조용히 그대로(확인 Popup 취소), 던지면 그대로 두고 Toast 로 알린다. ToastProvider 안에서 쓴다 */
  action?: (next: boolean) => Promise<unknown> | unknown;
  /** action 실패 문구 */
  errorMessage?: string | ((error: unknown) => string);
  /** 제품이 처리 중을 직접 정할 때 */
  busy?: boolean;
  wrapperClassName?: string;
}

/** 즉시 적용되는 켜기/끄기. 저장이 필요한 폼 안에서는 Checkbox */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { children, size = "md", labelLeft, onChange, action, errorMessage, busy: busyProp, checked, defaultChecked, wrapperClassName, ...rest },
  ref,
) {
  const toast = useOptionalToast();
  if (action && !toast) throw new Error("[ds-react] Switch action 은 <ToastProvider> 안에서 사용하세요 — 실패를 알릴 자리가 필요합니다.");
  const [on, setOn] = useControllable<boolean>({ value: checked, defaultValue: Boolean(defaultChecked) });
  const [pending, setPending] = useState(false);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const busy = pending || Boolean(busyProp);
  const run = async (next: boolean, e: ChangeEvent<HTMLInputElement>) => {
    setPending(true);
    try {
      const result = await action!(next);
      if (alive.current && result !== false) { setOn(next); onChange?.(next, e); }
    } catch (err) {
      const message = typeof errorMessage === "function" ? errorMessage(err) : errorMessage ?? LABELS.switchFailed;
      toast!.show({ message, tone: "danger", duration: 0, action: { label: LABELS.close, onClick: () => {} } });
    } finally {
      if (alive.current) setPending(false);
    }
  };
  return (
    <label className={cx("switch", size === "sm" && "sm", labelLeft && "label-left", wrapperClassName)}>
      <input
        ref={ref}
        type="checkbox"
        role="switch"
        checked={on}
        aria-busy={busy || undefined}
        aria-disabled={busy || undefined}
        onChange={(e) => {
          if (busy) return;
          if (action) { void run(e.target.checked, e); return; }
          setOn(e.target.checked);
          onChange?.(e.target.checked, e);
        }}
        {...rest}
      />
      {children !== undefined && <span>{children}</span>}
    </label>
  );
});
