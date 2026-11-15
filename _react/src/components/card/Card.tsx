import { forwardRef, Fragment, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** @deprecated 효과 없음 — 기본 카드가 이미 1px 보더입니다. 호환을 위해서만 남깁니다 */
  bordered?: boolean;
  /** outline(1px line/neutral/secondary 보더, 기본) · flat(보더 색 없음 — 주변에 배경색 background/neutral/secondary 이 있을 때만. 흰 바탕 금지) */
  variant?: "outline" | "flat";
  /** md(padding 24 · gap 12 · 제목 Body 1 Normal 16/24 600, 기본) · sm(padding 16 · gap 8 · 제목 Label/1 14/20 600 — 밀도 높은 그리드) */
  size?: "sm" | "md";
  /** @deprecated sm 의 옛 이름 — size="sm" 을 쓰세요(MIGRATION.md). 값은 같습니다 */
  compact?: boolean;
  /** padding·gap 0 — 표를 카드 폭까지 채울 때. Table 은 바깥 테두리가 없어 그대로 둔다(가로 스크롤이 필요 없으면 wrap={false}). List 는 자체 테두리가 있어 두 겹이 된다 */
  flush?: boolean;
  /** 불러오는 중 — children 대신 Skeleton 을 보여주고 aria-busy 를 켭니다 */
  loading?: boolean;
  /** hover shadow/2 + cursor */
  clickable?: boolean;
  /** 선택됨 (.on). as="button" 과 함께 쓰면 aria-pressed 도 따라갑니다 */
  selected?: boolean;
  /** 고를 수 없는 선택 카드 — disable 토큰 · hover 없음. as="button" 이면 disabled, 그 밖은 aria-disabled. 이유는 CardDesc 에 */
  disabled?: boolean;
  /** 루트 요소 (a, button, Link …) */
  as?: ElementType;
  /** as="a" 일 때 */
  href?: string;
  /** as="button" 일 때 — 폼 안에서는 명시 */
  type?: "button" | "submit";
}
/** 관련 정보와 액션을 묶는 컨테이너. Surface + 1px line/neutral/secondary 보더, radius/lg */
export const Card = forwardRef<HTMLElement, CardProps>(function Card({ bordered, variant, size, compact, flush, clickable, selected, disabled, loading, as, className, children, ...rest }, ref) {
  const Comp: ElementType = as ?? "div";
  /* 2026-11-02 compact → size="sm". 같은 값이라 sm 클래스로 내고, 개발 모드에서 알린다 */
  if (process.env.NODE_ENV !== "production" && compact !== undefined) console.warn('[ds-react] Card compact prop 은 바뀌었습니다 — size="sm" (MIGRATION.md).');
  const sz = size ?? (compact ? "sm" : undefined);
  const isButton = Comp === "button";
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
    <Comp ref={ref} className={cx("card", sz, { flat: variant === "flat", bordered, flush, clickable, on: selected }, className)} aria-pressed={pressed} aria-busy={loading || undefined}
      disabled={isButton && disabled ? true : undefined} aria-disabled={!isButton && disabled ? true : undefined} {...rest}>
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
export interface CardMetaItem {
  label: ReactNode;
  value: ReactNode;
}
export interface CardMetaProps extends HTMLAttributes<HTMLDListElement> {
  /** 키-값 행. 없으면 children(dt · dd)을 그대로 */
  items?: CardMetaItem[];
}
/** 상태 카드의 키-값 행(dl.card-meta) — 키 secondary · 값 primary */
export const CardMeta = forwardRef<HTMLDListElement, CardMetaProps>(function CardMeta({ items, className, children, ...rest }, ref) {
  return (
    <dl ref={ref} className={cx("card-meta", className)} {...rest}>
      {items ? items.map((it, i) => <Fragment key={i}><dt>{it.label}</dt><dd>{it.value}</dd></Fragment>) : children}
    </dl>
  );
});
export const CardFoot = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardFoot({ className, ...rest }, ref) {
  return <div ref={ref} className={cx("card-foot", className)} {...rest} />;
});
/** auto-fill 260px 그리드 */
export const CardGrid = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardGrid({ className, ...rest }, ref) {
  return <div ref={ref} className={cx("card-grid", className)} {...rest} />;
});
