import { forwardRef, useRef, type ButtonHTMLAttributes, type HTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useControllable } from "../../utils/useControllable";
import { Icon } from "../../icons/Icon";
import type { IconName } from "../../icons/icons.data";
import { LABELS } from "../../labels";
import { Button } from "../button/Button";
import { mergeRefs } from "../../utils/hooks";

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
    /* 지운 뒤 포커스 — 다음 칸, 없으면 앞 칸, 칸이 없으면 묶음 자신. Combobox 는 입력으로 돌아가므로 스스로 한다. 제품이 지우지 않았으면(확인 취소) 그대로 둔다 */
    const remove = (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (disabled) return;
      const self = e.currentTarget, chip = self.closest<HTMLElement>(".chip")!, box = chip.parentElement!;
      const spots = box.closest(".combobox") ? [] : Array.from(box.querySelectorAll<HTMLElement>(":scope > button:not([disabled]), :scope > .chip > .x:not([disabled])"));
      const at = spots.indexOf(self), to = spots[at + 1] ?? spots[at - 1];
      onRemove();
      if (at < 0) return;
      requestAnimationFrame(() => {
        if (chip.isConnected) return;
        if (to?.isConnected) to.focus({ preventScroll: true });
        else if (box.isConnected) { box.tabIndex = -1; box.focus({ preventScroll: true }); }
      });
    };
    const name = typeof children === "string" ? `${children} ${removeLabel}` : removeLabel;
    /* span 은 disabled 속성을 못 가진다 — aria-disabled 로 비활성을 알리고 CSS 가 칩과 x 를 흐린다(.btn 과 같게) */
    return (
      <span className={cls} aria-disabled={disabled || undefined} {...(rest as HTMLAttributes<HTMLSpanElement>)} onClickCapture={disabled ? (e) => { e.preventDefault(); e.stopPropagation(); } : (rest as HTMLAttributes<HTMLSpanElement>).onClickCapture}>
        {icon && <Icon name={icon} size={14} />}
        <span className="lbl" title={typeof children === "string" ? children : undefined}>{children}</span>
        <button type="button" className="x" aria-label={name} disabled={disabled} onClick={remove}>
          <Icon name="x" size={10} />
        </button>
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

export interface ChipGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** true 면 끝에 '필터 초기화' — 켜진 칩이 있을 때만 준다 */
  clearable?: boolean;
  onClear?: () => void;
  clearLabel?: ReactNode;
}
export const ChipGroup = forwardRef<HTMLDivElement, ChipGroupProps>(function ChipGroup({ clearable, onClear, clearLabel = LABELS.clearFilters, className, children, ...rest }, ref) {
  const inner = useRef<HTMLDivElement>(null);
  return (
    <div ref={mergeRefs(inner, ref)} className={cx("chip-group", className)} {...rest}>
      {children}
      {clearable && (
        <Button
          variant="text"
          color="assistive"
          size="sm"
          onClick={() => {
            onClear?.();
            inner.current?.querySelector<HTMLElement>(":scope > button.chip:not([disabled])")?.focus();
          }}
        >
          {clearLabel}
        </Button>
      )}
    </div>
  );
});
