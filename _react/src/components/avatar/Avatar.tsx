import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** 이니셜 1~2자 */
  initials?: string;
  size?: "md" | "sm";
}
/** 이니셜 아바타 32 (sm 24) */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar({ initials, size = "md", className, children, ...rest }, ref) {
  return (
    <span ref={ref} className={cx("avatar", size === "sm" && "sm", className)} {...rest}>
      {children ?? initials}
    </span>
  );
});
