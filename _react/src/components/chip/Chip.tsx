import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useControllable } from "../../utils/useControllable";
import { Icon } from "../../icons/Icon";
import type { IconName } from "../../icons/icons.data";
import { LABELS } from "../../labels";

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** 필터 칩 선택 상태 (제어) */
  selected?: boolean;
  defaultSelected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  /** 있으면 Input Chip(span + 삭제 x) 으로 렌더 */
  onRemove?: () => void;
  removeLabel?: string;
  /** 라벨 앞 아이콘 */
  icon?: IconName;
  size?: "md" | "sm";
  /** 토글이 아닌 동작 칩(예: "+ 추가"). aria-pressed 없이 onClick 만 */
  action?: boolean;
}

/** 필터 조건(토글) 또는 입력값(삭제 가능) 캡슐. 상태 표시는 Tag */
export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { selected, defaultSelected = false, onSelectedChange, onRemove, removeLabel = LABELS.remove, icon, size = "md", action, className, children, onClick, disabled, ...rest },
  ref,
) {
  const [on, setOn] = useControllable<boolean>({ value: selected, defaultValue: defaultSelected, onChange: onSelectedChange });
  const cls = cx("chip", size === "sm" && "sm", on && "on", className);
  if (action) {
    return (
      <button ref={ref} type="button" className={cls} disabled={disabled} onClick={onClick} {...rest}>
        {icon && <Icon name={icon} />}
        {children}
      </button>
    );
  }
  if (onRemove) {
    const remove = (e: MouseEvent | KeyboardEvent) => {
      e.stopPropagation();
      onRemove();
    };
    return (
      <span className={cls} {...(rest as HTMLAttributes<HTMLSpanElement>)}>
        {icon && <Icon name={icon} size={14} />}
        {children}
        <i
          className="x"
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={removeLabel}
          onClick={remove}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); remove(e); }
          }}
        >
          <Icon name="x" size={10} />
        </i>
      </span>
    );
  }
  return (
    <button
      ref={ref}
      type="button"
      className={cls}
      aria-pressed={on}
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) setOn(!on);
      }}
      {...rest}
    >
      {icon && <Icon name={icon} size={14} />}
      {children}
    </button>
  );
});

export type ChipGroupProps = HTMLAttributes<HTMLDivElement>;
export const ChipGroup = forwardRef<HTMLDivElement, ChipGroupProps>(function ChipGroup({ className, ...rest }, ref) {
  return <div ref={ref} className={cx("chip-group", className)} {...rest} />;
});
