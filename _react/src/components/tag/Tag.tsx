import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import type { Size, Tone } from "../../types";

export type TagVariant = "subtle" | "outline" | "solid" | "plain";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** 의미 색. 없으면 중립(gray) */
  tone?: Tone;
  /** subtle(기본) · outline · solid(강조) · plain(점 없음) */
  variant?: TagVariant;
  /** sm 20 · md 24 · lg 28 */
  size?: Size;
}

/** 상태·분류·심각도 표시. 선택·삭제가 필요하면 Chip */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag({ tone, variant = "subtle", size = "md", className, ...rest }, ref) {
  return (
    <span
      ref={ref}
      className={cx("tag", tone, variant !== "subtle" && variant, size !== "md" && size, className)}
      {...rest}
    />
  );
});
