import { forwardRef, type AnchorHTMLAttributes, type ElementType, type HTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { LABELS } from "../../labels";
import { Button } from "../button/Button";
import { Icon } from "../../icons/Icon";
import { Tooltip } from "../tooltip/Tooltip";

export type TopBarProps = HTMLAttributes<HTMLElement>;
/** 제품 상단 바 (높이 62) */
export const TopBar = forwardRef<HTMLElement, TopBarProps>(function TopBar({ className, ...rest }, ref) {
  return <header ref={ref} className={cx("topbar", className)} {...rest} />;
});

export interface TopBarLogoProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** 제품 이름 */
  name: ReactNode;
  /** small 로 표시 */
  version?: ReactNode;
  /** 제품 마크. 기본은 로그인 로고와 같은 shield-check 면 아이콘 24(글자색, 2026-11-18 — 제품 색 사각이었다) */
  mark?: ReactNode;
  as?: ElementType;
}
/** 제품 마크 + 이름 + 버전 */
export const TopBarLogo = forwardRef<HTMLAnchorElement, TopBarLogoProps>(function TopBarLogo({ name, version, mark, as, className, ...rest }, ref) {
  const Link: ElementType = as ?? "a";
  return (
    <Link ref={ref} className={cx("logo", className)} {...rest}>
      <i>{mark ?? <Icon name="shield-check" filled size={24} />}</i>
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

export type TopBarStartProps = HTMLAttributes<HTMLDivElement>;
/** 왼쪽 영역(2026-11-18) — 로고(왼쪽 끝) + 사이드 내비 접기 버튼(오른쪽 끝). 폭은 사이드 내비와 같은 240 이고 내비를 접어도 그대로다 */
export const TopBarStart = forwardRef<HTMLDivElement, TopBarStartProps>(function TopBarStart({ className, ...rest }, ref) {
  return <div ref={ref} className={cx("topbar-start", className)} {...rest} />;
});

export interface TopBarNavToggleProps {
  /** 사이드 내비가 접혔는가(제어형) */
  collapsed: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** 접고 펴는 사이드 내비의 id(aria-controls) */
  controls?: string;
  className?: string;
}
/** 사이드 내비 접기 버튼(2026-11-18) — 이름 · Tooltip 은 상태를 따라 '메뉴 접기' · '메뉴 펼치기'. 접은 상태의 저장은 제품 몫 */
export const TopBarNavToggle = forwardRef<HTMLButtonElement, TopBarNavToggleProps>(function TopBarNavToggle({ collapsed, onCollapsedChange, controls, className }, ref) {
  const name = collapsed ? LABELS.navExpand : LABELS.navCollapse;
  return (
    <Tooltip content={name} position="bottom">
      <Button ref={ref} color="assistive" iconOnly className={className} data-sidenav-toggle="" aria-controls={controls} aria-expanded={!collapsed} aria-label={name} onClick={() => onCollapsedChange?.(!collapsed)}><Icon name="layout-sidebar" /></Button>
    </Tooltip>
  );
});

export interface TopBarThemeToggleProps {
  /** 지금 테마(제어형) */
  theme: "light" | "dark";
  onThemeChange?: (theme: "light" | "dark", e: MouseEvent<HTMLButtonElement>) => void;
  /** 이름 · Tooltip. 기본 "다크 모드" — 눌린 상태(aria-pressed)가 다크를 뜻한다 */
  label?: string;
  className?: string;
}
/** 라이트/다크 버튼(2026-11-18) — 설정 바로 옆. 지금 테마의 아이콘(라이트면 해, 다크면 달 — 2026-11-18 바꿈). html data-theme 적용 · 저장은 제품 몫 */
export const TopBarThemeToggle = forwardRef<HTMLButtonElement, TopBarThemeToggleProps>(function TopBarThemeToggle({ theme, onThemeChange, label = LABELS.darkMode, className }, ref) {
  return (
    <Tooltip content={label} position="bottom">
      <Button ref={ref} color="assistive" iconOnly className={className} data-theme-toggle="" aria-pressed={theme === "dark"} aria-label={label} onClick={(e) => onThemeChange?.(theme === "dark" ? "light" : "dark", e)}>
        <span className="i-light"><Icon name="sun-high" /></span><span className="i-dark"><Icon name="moon" /></span>
      </Button>
    </Tooltip>
  );
});
