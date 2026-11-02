import { forwardRef, type ButtonHTMLAttributes, type ElementType, type HTMLAttributes, type LiHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { Icon } from "../../icons/Icon";
import { LABELS } from "../../labels";

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  /** nav aria-label. 기본 "현재 위치" */
  label?: string;
  /** ol 클래스 */
  listClassName?: string;
}
/** nav > ol.breadcrumb */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb({ label = LABELS.breadcrumb, listClassName, children, ...rest }, ref) {
  return (
    <nav ref={ref} aria-label={label} {...rest}>
      <ol className={cx("breadcrumb", listClassName)}>{children}</ol>
    </nav>
  );
});

export interface BreadcrumbHomeProps extends LiHTMLAttributes<HTMLLIElement> {
  href?: string;
  /** 아이콘 링크의 aria-label. 기본 "홈" — 없으면 이름 없는 링크로 읽힌다 */
  label?: string;
  /** 링크 요소 (예: react-router Link) */
  as?: ElementType;
  /** 링크에 전달할 추가 props (to 등) */
  linkProps?: Record<string, unknown>;
}
/** 첫 항목 — 홈 아이콘 링크(li > a.icon). 정의상 모든 경로는 이것으로 시작한다 */
export const BreadcrumbHome = forwardRef<HTMLLIElement, BreadcrumbHomeProps>(function BreadcrumbHome({ href, label = "홈", as, linkProps, ...rest }, ref) {
  const Link: ElementType = as ?? "a";
  const { className, ...link } = (linkProps ?? {}) as { className?: string } & Record<string, unknown>;
  return (
    <li ref={ref} {...rest}>
      <Link href={href} {...link} className={cx("icon", className)} aria-label={label}><Icon name="home" /></Link>
    </li>
  );
});

export interface BreadcrumbItemProps extends LiHTMLAttributes<HTMLLIElement> {
  href?: string;
  /** 현재 페이지 — 링크 없이 aria-current */
  current?: boolean;
  /* href 도 current 도 없으면 페이지가 없는 상위 단계 — 링크 없이 span 으로 그린다 */
  /** 링크 요소 (예: react-router Link) */
  as?: ElementType;
  /** 링크에 전달할 추가 props (to 등) */
  linkProps?: Record<string, unknown>;
  children?: ReactNode;
}
export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(function BreadcrumbItem({ href, current, as, linkProps, children, ...rest }, ref) {
  const Link: ElementType = as ?? "a";
  return (
    <li ref={ref} aria-current={current ? "page" : undefined} {...rest}>
      {/* 현재 항목도 span 으로 — li 가 flex 라 맨 텍스트에는 말줄임(text-overflow)이 걸리지 않는다 */}
      {current || (href === undefined && !as) ? <span>{children}</span> : <Link href={href} {...linkProps}>{children}</Link>}
    </li>
  );
});

export interface BreadcrumbMoreProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 기본 "상위 경로 펼치기" */
  label?: string;
}
/** 접힌 중간 경로 (…) */
export const BreadcrumbMore = forwardRef<HTMLButtonElement, BreadcrumbMoreProps>(function BreadcrumbMore({ label = "상위 경로 펼치기", className, ...rest }, ref) {
  return (
    <li>
      <button ref={ref} type="button" className={cx("more", className)} aria-label={label} {...rest}>
        <Icon name="dots" size={14} />
      </button>
    </li>
  );
});
