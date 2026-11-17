import { Children, forwardRef, isValidElement, cloneElement, type HTMLAttributes, type ReactElement, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { Button } from "../button/Button";
import { avatarTone, type AvatarTone } from "./tone";
export { avatarTone, type AvatarTone } from "./tone";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** 이니셜 1~2자 */
  initials?: string;
  size?: "md" | "sm";
  /** 색을 정하는 이름(사람의 결정 2026-11-16) — 없으면 aria-label, 그것도 없으면 이니셜. 같은 사람이 어디서나 같은 색이 되려면 이름을 준다 */
  name?: string;
  /** 색을 직접 고름(1 파랑 · 2 시안 · 3 라임 · 4 바이올렛 · 5 퍼플 · 6 핑크) — 주면 이름으로 정하지 않는다 */
  tone?: AvatarTone;
}
/** 이니셜 아바타 32 (sm 24). 색은 이름으로 정하는 6색 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar({ initials, size = "md", name, tone, className, children, ...rest }, ref) {
  const label = (rest as { "aria-label"?: string })["aria-label"];
  const text = typeof children === "string" ? children : initials;
  const t = tone ?? avatarTone(name || label || text);
  return (
    <span ref={ref} className={cx("avatar", size === "sm" && "sm", className)} data-tone={t} data-name={name} {...rest}>
      {children ?? initials}
    </span>
  );
});

export interface AvatarGroupProps extends HTMLAttributes<HTMLSpanElement> {
  /** 무엇의 사람들인지 — role=group 의 이름(예: "담당자") */
  label: string;
  /** 보이는 아바타 수(기본 5 — 사이트 verify 와 같은 상한). 넘치면 '외 N명' */
  max?: number;
  /** 아바타 크기 — 자식 Avatar 에 넘긴다 */
  size?: "md" | "sm";
  /** 주면 '외 N명' 이 목록을 여는 글자 버튼이 된다(목록은 제품이 그린다) */
  onMore?: () => void;
  /** '외 N명' 문구 — 기본 `외 {n}명`, 버튼 이름 기본 `{label} 외 {n}명 보기` */
  moreText?: (n: number) => string;
  moreLabel?: (n: number, label: string) => string;
  children?: ReactNode;
}
/** Avatar Group — 겹친 이니셜 아바타 5개까지 + '외 N명'(사람의 결정 2026-11-13). 아바타마다 role="img" + aria-label 로 이름을 준다 */
export const AvatarGroup = forwardRef<HTMLSpanElement, AvatarGroupProps>(function AvatarGroup(
  { label, max = 5, size, onMore, moreText = (n) => `외 ${n}명`, moreLabel = (n, l) => `${l} 외 ${n}명 보기`, className, children, ...rest }, ref) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<AvatarProps>[];
  const cap = Math.max(1, Math.min(max, 5));
  if (process.env.NODE_ENV !== "production" && max > 5) console.warn("[ds-react] AvatarGroup max 는 5 까지입니다 — 나머지는 '외 N명' 으로 적습니다.");
  const shown = items.slice(0, cap).map((el) => (size && !el.props.size ? cloneElement(el, { size }) : el));
  const rest_ = items.length - shown.length;
  return (
    <span ref={ref} role="group" aria-label={label} className={cx("avatar-group", className)} {...rest}>
      {shown}
      {rest_ > 0 && (onMore
        ? <Button size="sm" variant="text" color="assistive" className="avatar-group-more" aria-label={moreLabel(rest_, label)} onClick={onMore}>{moreText(rest_)}</Button>
        : <span className="avatar-group-more">{moreText(rest_)}</span>)}
    </span>
  );
});
