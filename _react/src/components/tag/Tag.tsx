import { Children, forwardRef, isValidElement, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import type { Size, Tone } from "../../types";
import { Tooltip } from "../tooltip/Tooltip";

/** "plain" 은 2026-11-11 에 없앴다 — 기본이 점 없음이 되어 뜻이 없어졌다(경고하고 subtle 로 그린다, MIGRATION) */
export type TagVariant = "subtle" | "outline" | "solid" | "plain";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** 의미 색. 없으면 중립(gray) */
  tone?: Tone;
  /** subtle(기본) · outline · solid(강조) */
  variant?: TagVariant;
  /** 글자 앞 점(등급 색). 기본은 점 없음 — 색은 글자가 나른다 */
  dot?: boolean;
  /** sm 20 · md 24 · lg 28 */
  size?: Size;
}

/** 상태·분류·심각도 표시. 선택·삭제가 필요하면 Chip */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag({ tone, variant = "subtle", dot = false, size = "md", className, ...rest }, ref) {
  if (process.env.NODE_ENV !== "production" && variant === "plain") console.warn('[ds-react] Tag variant="plain" 은 없어졌습니다 — 기본이 점 없음입니다. 점이 필요하면 dot 을 씁니다(MIGRATION.md).');
  const v = variant === "plain" ? "subtle" : variant;
  return (
    <span
      ref={ref}
      className={cx("tag", tone, v !== "subtle" && v, dot && "dot", size !== "md" && size, className)}
      {...rest}
    />
  );
});

const textOf = (n: ReactNode): string => typeof n === "string" || typeof n === "number" ? String(n) : Array.isArray(n) ? n.map(textOf).join("") : isValidElement<{ children?: ReactNode }>(n) ? textOf(n.props.children) : "";

export interface TagGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** 앞 n개만 보이고 나머지는 +N(표 칸). 없으면 줄바꿈으로 전부 보인다 */
  max?: number;
  /** +N 버튼의 접근 이름 */
  moreLabel?: (hidden: number) => string;
}
/** Tag 묶음. +N 은 포커스를 받는 버튼이고 나머지 이름을 Tooltip 으로 보여 준다 */
export const TagGroup = forwardRef<HTMLDivElement, TagGroupProps>(function TagGroup({ max, moreLabel = (n) => `${n}개 더 보기`, className, children, ...rest }, ref) {
  const all = Children.toArray(children);
  const shown = max !== undefined && all.length > max ? all.slice(0, max) : all;
  const hidden = all.slice(shown.length);
  return (
    <div ref={ref} className={cx("tag-group", className)} {...rest}>
      {shown}
      {hidden.length > 0 && (
        <Tooltip content={hidden.map(textOf).join(", ")}>
          <button type="button" className="tag tag-more" aria-label={moreLabel(hidden.length)}>+{hidden.length}</button>
        </Tooltip>
      )}
    </div>
  );
});
