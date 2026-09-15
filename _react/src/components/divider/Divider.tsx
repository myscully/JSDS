import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface DividerProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  orientation?: "horizontal" | "vertical";
  /** border/strong */
  strong?: boolean;
  dashed?: boolean;
  /** 가운데 라벨 (가로만) */
  label?: ReactNode;
}

/** 콘텐츠 구분선. 여백으로 나눌 수 있으면 여백을 먼저 */
export const Divider = forwardRef<HTMLElement, DividerProps>(function Divider({ orientation = "horizontal", strong, dashed, label, className, ...rest }, ref) {
  if (orientation === "vertical") {
    return <span ref={ref as React.Ref<HTMLSpanElement>} className={cx("divider", "vertical", className)} role="separator" aria-orientation="vertical" {...rest} />;
  }
  if (label !== undefined) {
    return (
      <div ref={ref as React.Ref<HTMLDivElement>} className={cx("divider", "label", { strong, dashed }, className)} role="separator" {...rest}>
        {label}
      </div>
    );
  }
  return <hr ref={ref as React.Ref<HTMLHRElement>} className={cx("divider", { strong, dashed }, className)} {...rest} />;
});
