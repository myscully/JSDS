import { cloneElement, forwardRef, isValidElement, type HTMLAttributes, type ReactElement, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useId } from "../../utils/useId";

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, "content" | "children"> {
  content: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  /** 두 줄 이상 (폭 220) */
  multi?: boolean;
  /** 항상 표시 (문서·디버그) */
  show?: boolean;
  /** 트리거 요소 하나. aria-describedby 가 주입된다 */
  children: ReactElement<Record<string, unknown>>;
}

/**
 * hover/focus-within 시 CSS 로 표시되는 툴팁. JS 없음, Portal 없음.
 * 아이콘 전용 버튼에는 항상 툴팁(= aria-label)을 둔다.
 */
export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(function Tooltip({ content, position = "top", multi, show, className, children, ...rest }, ref) {
  const id = useId(undefined, "tt");
  const trigger = isValidElement(children) ? cloneElement(children, { "aria-describedby": id }) : children;
  return (
    <span ref={ref} className={cx("tooltip-wrap", show && "show", className)} {...rest}>
      {trigger}
      <span className={cx("tooltip", position !== "top" && position, multi && "multi")} role="tooltip" id={id}>
        {content}
      </span>
    </span>
  );
});
