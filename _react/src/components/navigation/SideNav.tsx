import { createContext, forwardRef, useContext, type AnchorHTMLAttributes, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { Icon } from "../../icons/Icon";
import type { IconName } from "../../icons/icons.data";
import { LABELS } from "../../labels";

const Ctx = createContext<{ collapsed: boolean }>({ collapsed: false });

export interface SideNavProps extends HTMLAttributes<HTMLElement> {
  /** 폭 64, 아이콘만 */
  collapsed?: boolean;
  /** nav aria-label. 기본 "주 메뉴" */
  label?: string;
  /** 하단 (.foot) */
  footer?: ReactNode;
}
/** 콘솔 좌측 1차 내비게이션 (폭 240 / 접힘 64) */
export const SideNav = forwardRef<HTMLElement, SideNavProps>(function SideNav({ collapsed = false, label = LABELS.mainMenu, footer, className, children, ...rest }, ref) {
  return (
    <Ctx.Provider value={{ collapsed }}>
      <nav ref={ref} className={cx("sidenav", { collapsed }, className)} aria-label={label} {...rest}>
        {children}
        {footer !== undefined && !collapsed && <div className="foot">{footer}</div>}
      </nav>
    </Ctx.Provider>
  );
});

export type SideNavGroupProps = HTMLAttributes<HTMLDivElement>;
/** 그룹 라벨 */
export const SideNavGroup = forwardRef<HTMLDivElement, SideNavGroupProps>(function SideNavGroup({ className, ...rest }, ref) {
  return <div ref={ref} className={cx("group", className)} {...rest} />;
});

export interface SideNavItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  icon?: IconName;
  /** 현재 메뉴 */
  active?: boolean;
  /** 미확인 건수 */
  count?: number | string;
  /** 하위 항목(들여쓰기, 아이콘 없음) */
  sub?: boolean;
  /** 링크 요소 (react-router Link 등) */
  as?: ElementType;
  children?: ReactNode;
}
export const SideNavItem = forwardRef<HTMLAnchorElement, SideNavItemProps>(function SideNavItem({ icon, active, count, sub, as, className, children, title, ...rest }, ref) {
  const { collapsed } = useContext(Ctx);
  const Link: ElementType = as ?? "a";
  const autoTitle = collapsed && typeof children === "string" ? children : undefined;
  return (
    <Link ref={ref} className={cx(active && "on", sub && "sub", className) || undefined} aria-current={active ? "page" : undefined} title={title ?? autoTitle} {...rest}>
      {icon && <Icon name={icon} />}
      {sub ? children : <span>{children}</span>}
      {count !== undefined && <span className="count">{count}</span>}
    </Link>
  );
});
