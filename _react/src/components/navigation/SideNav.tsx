import { createContext, forwardRef, useContext, type AnchorHTMLAttributes, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { Icon } from "../../icons/Icon";
import type { IconName } from "../../icons/icons.data";
import { LABELS } from "../../labels";
import { Tooltip } from "../tooltip/Tooltip";

const Ctx = createContext<{ collapsed: boolean; collapsible: boolean }>({ collapsed: false, collapsible: false });

export interface SideNavProps extends HTMLAttributes<HTMLElement> {
  /** 폭 64, 아이콘만 */
  collapsed?: boolean;
  /** nav aria-label. 기본 "주 메뉴" */
  label?: string;
  /** 하단 (.foot) */
  footer?: ReactNode;
  /** 상단 바의 접기 버튼(TopBarNavToggle)으로 접었다 펴는 내비(2026-11-18) — 펼친 상태에서도 항목을 이름 + Tooltip 으로 감싸 둔다(사이트 마크업과 같음) */
  collapsible?: boolean;
}
/** 콘솔 좌측 1차 내비게이션 (폭 240 / 접힘 64) */
export const SideNav = forwardRef<HTMLElement, SideNavProps>(function SideNav({ collapsed = false, collapsible = false, label = LABELS.mainMenu, footer, className, children, ...rest }, ref) {
  return (
    <Ctx.Provider value={{ collapsed, collapsible }}>
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
  /** 건수 톤 — 없으면 기본(진한 빨강 · 미확인). 전체 개수처럼 중립인 건수는 "neutral", 강조는 "accent" */
  countTone?: "accent" | "neutral";
  /** 하위 항목(들여쓰기, 아이콘 없음) */
  sub?: boolean;
  /** 하위 항목이 현재 메뉴인 부모(.has-on). 펼친 레일에서는 모양이 그대로이고, 하위 항목이 숨는 접힌 레일에서 선택 모양과 aria-current="true" 를 이어받는다 */
  hasActiveChild?: boolean;
  /** 링크 요소 (react-router Link 등) */
  as?: ElementType;
  /** 위험 항목(.danger — 계정 삭제 등). 맨 아래 하나, 앞에 구분선, 누르면 위험 확인을 연다(2026-11-24) */
  danger?: boolean;
  children?: ReactNode;
}
export const SideNavItem = forwardRef<HTMLAnchorElement, SideNavItemProps>(function SideNavItem({ icon, active, count, countTone, sub, hasActiveChild, danger, as, className, children, title, ...rest }, ref) {
  const { collapsed, collapsible } = useContext(Ctx);
  const Link: ElementType = as ?? "a";
  /* 접힌 레일은 이름이 안 보인다 — title 은 키보드로 볼 수 없어 Tooltip 으로 */
  const railName = (collapsed || collapsible) && !sub && typeof children === "string" ? children : undefined;
  const current = active ? "page" : collapsed && hasActiveChild ? "true" : undefined;
  const link = (
    <Link ref={ref} className={cx(active && "on", hasActiveChild && "has-on", sub && "sub", danger && "danger", className) || undefined} aria-current={current} aria-label={railName} title={title} {...rest}>
      {icon && <Icon name={icon} />}
      {sub ? children : <span>{children}</span>}
      {count !== undefined && <span className={cx("count", countTone)}>{count}</span>}
    </Link>
  );
  return railName ? <Tooltip content={railName} position="right">{link}</Tooltip> : link;
});

export type SkipLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;
/** 본문 바로가기. 페이지의 첫 포커스에 둔다 */
export const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(function SkipLink({ href = "#main", className, children = LABELS.skipToMain, ...rest }, ref) {
  return <a ref={ref} href={href} className={cx("skip-link", className)} {...rest}>{children}</a>;
});
