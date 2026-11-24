import { Children, forwardRef, isValidElement, cloneElement, type HTMLAttributes, type ReactElement, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { Button } from "../button/Button";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** 이니셜 1~2자 */
  initials?: string;
  /** md 32 · sm 24 · lg 64(프로필 머리 — Avatar Group 에는 쓰지 않음, 2026-11-24) */
  size?: "md" | "sm" | "lg";
  /** @deprecated 2026-11-24 — 색을 정하던 이름. 모든 아바타가 같은 중립 색이 되어 쓰지 않는다(그려지지 않음). 이름은 role="img" + aria-label 로 */
  name?: string;
  /** @deprecated 2026-11-24 — 이름으로 정하던 6색을 없앴다. 주면 개발 모드에서 한 번 경고하고 무시한다 */
  tone?: 1 | 2 | 3 | 4 | 5 | 6;
}
let warnedTone = false;
/** 이니셜 아바타 32 (sm 24). 면 surface/neutral/secondary · 글자 foreground/neutral/secondary — 모든 아바타가 같은 색(사람의 결정 2026-11-24) */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar({ initials, size = "md", name: _name, tone, className, children, ...rest }, ref) {
  if (process.env.NODE_ENV !== "production" && tone != null && !warnedTone) { warnedTone = true; console.warn("[ds-react] Avatar tone 은 없앴습니다(2026-11-24) — 모든 아바타가 같은 중립 색입니다. prop 을 지우세요."); }
  return (
    <span ref={ref} className={cx("avatar", size !== "md" && size, className)} {...rest}>
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
  if (process.env.NODE_ENV !== "production" && items.some((el) => el.props.size === "lg")) console.warn("[ds-react] AvatarGroup 안에서는 Avatar size=\"lg\" 를 쓰지 않습니다 — md 나 sm 으로 그립니다.");
  const shown = items.slice(0, cap).map((el) => (el.props.size === "lg" ? cloneElement(el, { size: size ?? "md" }) : size && !el.props.size ? cloneElement(el, { size }) : el));
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
