import { forwardRef, type ElementType, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** shadow 대신 1px 보더 (카드 위 카드) */
  bordered?: boolean;
  /** padding 16 · 제목 14 */
  compact?: boolean;
  /** padding·gap 0 — 표나 목록을 카드 폭까지 채울 때 */
  flush?: boolean;
  /** 불러오는 중 — children 대신 Skeleton 을 보여주고 aria-busy 를 켭니다 */
  loading?: boolean;
  /** hover shadow/2 + cursor */
  clickable?: boolean;
  /** 선택됨 (.on). as="button" 과 함께 쓰면 aria-pressed 도 따라갑니다 */
  selected?: boolean;
  /** 루트 요소 (a, button, Link …) */
  as?: ElementType;
  /** as="a" 일 때 */
  href?: string;
  /** as="button" 일 때 — 폼 안에서는 명시 */
  type?: "button" | "submit";
}
/** 관련 정보와 액션을 묶는 컨테이너. Surface + shadow/1, radius/lg */
export const Card = forwardRef<HTMLElement, CardProps>(function Card({ bordered, compact, flush, clickable, selected, loading, as, className, children, ...rest }, ref) {
  const Comp: ElementType = as ?? "div";
  /* 선택 카드는 button 이어야 Space 로도 눌리고 상태가 읽힌다 — .on 만으로는 보조기기에 전해지지 않는다 */
  const pressed = as === "button" && selected !== undefined ? selected : undefined;
  /* loading 은 내용 자리를 Skeleton 으로 바꾼다 — 사이트 HTML 예제와 같은 마크업이어야 골격 비교가 통과한다 */
  const body = loading ? (
    <>
      <span className="skeleton title" />
      <span className="skeleton text" />
      <span className="skeleton text short" />
    </>
  ) : children;
  return (
    <Comp ref={ref} className={cx("card", { bordered, compact, flush, clickable, on: selected }, className)} aria-pressed={pressed} aria-busy={loading || undefined} {...rest}>
      {body}
    </Comp>
  );
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
