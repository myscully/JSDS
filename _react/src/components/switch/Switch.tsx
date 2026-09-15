import { forwardRef, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "onChange" | "children"> {
  /** 라벨. 켜진 상태를 설명("실시간 보호"). 없으면 aria-label */
  children?: ReactNode;
  size?: "md" | "sm";
  /** 라벨을 왼쪽에 */
  labelLeft?: boolean;
  onChange?: (checked: boolean, e: ChangeEvent<HTMLInputElement>) => void;
  wrapperClassName?: string;
}

/** 즉시 적용되는 켜기/끄기. 저장이 필요한 폼 안에서는 Checkbox */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { children, size = "md", labelLeft, onChange, wrapperClassName, ...rest },
  ref,
) {
  return (
    <label className={cx("switch", size === "sm" && "sm", labelLeft && "label-left", wrapperClassName)}>
      <input ref={ref} type="checkbox" role="switch" onChange={(e) => onChange?.(e.target.checked, e)} {...rest} />
      {children !== undefined && <span>{children}</span>}
    </label>
  );
});
