import { forwardRef, type ElementType, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** shadow 대신 1px 보더 (카드 위 카드) */
  bordered?: boolean;
  /** padding 16 */
  compact?: boolean;
  /** hover shadow/2 + cursor */
  clickable?: boolean;
  /** 선택됨 (.on) */
  selected?: boolean;
  /** 루트 요소 (a, button, Link …) */
  as?: ElementType;
  href?: string;
}
/** 관련 정보와 액션을 묶는 컨테이너. Surface + shadow/1, radius/lg */
export const Card = forwardRef<HTMLElement, CardProps>(function Card({ bordered, compact, clickable, selected, as, className, ...rest }, ref) {
  const Comp: ElementType = as ?? "div";
  return <Comp ref={ref} className={cx("card", { bordered, compact, clickable, on: selected }, className)} {...rest} />;
});

export const CardHead = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardHead({ className, ...rest }, ref) {
  return <div ref={ref} className={cx("card-head", className)} {...rest} />;
});
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h2" | "h3" | "h4";
}
export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle({ as = "h3", className, ...rest }, ref) {
  const Comp = as;
  return <Comp ref={ref} className={cx("title", className)} {...rest} />;
});
export const CardDesc = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(function CardDesc({ className, ...rest }, ref) {
  return <p ref={ref} className={cx("desc", className)} {...rest} />;
});
export const CardFoot = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardFoot({ className, ...rest }, ref) {
  return <div ref={ref} className={cx("card-foot", className)} {...rest} />;
});
/** auto-fill 260px 그리드 */
export const CardGrid = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardGrid({ className, ...rest }, ref) {
  return <div ref={ref} className={cx("card-grid", className)} {...rest} />;
});
