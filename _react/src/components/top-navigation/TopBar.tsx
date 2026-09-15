import { forwardRef, type AnchorHTMLAttributes, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { LABELS } from "../../labels";

export type TopBarProps = HTMLAttributes<HTMLElement>;
/** 제품 상단 바 (높이 56) */
export const TopBar = forwardRef<HTMLElement, TopBarProps>(function TopBar({ className, ...rest }, ref) {
  return <header ref={ref} className={cx("topbar", className)} {...rest} />;
});

export interface TopBarLogoProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** 제품 이름 */
  name: ReactNode;
  /** small 로 표시 */
  version?: ReactNode;
  as?: ElementType;
}
/** 제품 마크(accent) + 이름 + 버전 */
export const TopBarLogo = forwardRef<HTMLAnchorElement, TopBarLogoProps>(function TopBarLogo({ name, version, as, className, ...rest }, ref) {
  const Link: ElementType = as ?? "a";
  return (
    <Link ref={ref} className={cx("logo", className)} {...rest}>
      <i />
      {name}
      {version !== undefined && <> <small>{version}</small></>}
    </Link>
  );
});

export interface TopBarNavProps extends HTMLAttributes<HTMLElement> {
  label?: string;
}
export const TopBarNav = forwardRef<HTMLElement, TopBarNavProps>(function TopBarNav({ label = LABELS.mainMenu, ...rest }, ref) {
  return <nav ref={ref} aria-label={label} {...rest} />;
});

export interface TopBarNavItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
  as?: ElementType;
}
export const TopBarNavItem = forwardRef<HTMLAnchorElement, TopBarNavItemProps>(function TopBarNavItem({ active, as, className, ...rest }, ref) {
  const Link: ElementType = as ?? "a";
  return <Link ref={ref} className={cx(active && "on", className) || undefined} aria-current={active ? "page" : undefined} {...rest} />;
});

export type TopBarRightProps = HTMLAttributes<HTMLDivElement>;
/** 우측 액션 영역 (알림 · 설정 · 아바타) */
export const TopBarRight = forwardRef<HTMLDivElement, TopBarRightProps>(function TopBarRight({ className, ...rest }, ref) {
  return <div ref={ref} className={cx("right", className)} {...rest} />;
});
