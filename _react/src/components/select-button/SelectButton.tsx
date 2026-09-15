import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useControllable } from "../../utils/useControllable";
import { Icon } from "../../icons/Icon";
import type { IconName } from "../../icons/icons.data";

export interface SelectButtonOption<T extends string = string> {
  value: T;
  label: ReactNode;
  icon?: IconName;
  disabled?: boolean;
}

export interface SelectButtonProps<T extends string = string> extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  options: SelectButtonOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  /** 아웃라인형 (툴바용) */
  outline?: boolean;
  /** 그룹 이름 (aria-label) */
  label?: string;
}

function SelectButtonInner<T extends string>(
  { options, value, defaultValue, onChange, outline, label, className, ...rest }: SelectButtonProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const [cur, set] = useControllable<T | undefined>({ value, defaultValue: defaultValue ?? options[0]?.value, onChange: onChange as (v: T | undefined) => void });
  return (
    <div ref={ref} className={cx("select-btn", { outline }, className)} role="group" aria-label={label} {...rest}>
      {options.map((o) => {
        const on = o.value === cur;
        return (
          <button key={o.value} type="button" className={on ? "on" : undefined} aria-pressed={on} disabled={o.disabled} onClick={() => set(o.value)}>
            {o.icon && <Icon name={o.icon} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** 2~5개 중 하나를 즉시 선택하는 세그먼트 컨트롤 */
export const SelectButton = forwardRef(SelectButtonInner) as <T extends string = string>(
  props: SelectButtonProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => ReturnType<typeof SelectButtonInner>;
