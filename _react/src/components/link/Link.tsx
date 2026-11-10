import { forwardRef, type AnchorHTMLAttributes, type ElementType } from "react";
import { cx } from "../../utils/cx";
import { Icon } from "../../icons/Icon";
import { LABELS } from "../../labels";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** 그 줄 자체가 링크인 자리(표 · 목록) — 밑줄은 hover 때만 */
  standalone?: boolean;
  /** 새 창으로 연다 — 아이콘 · 숨긴 문구 · rel */
  external?: boolean;
  /** 숨긴 문구 */
  externalLabel?: string;
  /** 링크 요소 (예: react-router Link) */
  as?: ElementType;
}
/** 다른 페이지로 옮겨 간다. 같은 화면에서 실행하면 Button */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ standalone, external, externalLabel = LABELS.newWindow, as, className, target, rel, children, ...rest }, ref) {
  const Comp: ElementType = as ?? "a";
  if (process.env.NODE_ENV !== "production" && !as && rest.href === undefined) console.warn("[ds] Link 에 href 가 없습니다. 같은 화면에서 실행하는 일이면 Button 을 쓰세요.");
  return (
    <Comp ref={ref} className={cx("link", standalone && "standalone", className)} target={external ? "_blank" : target} rel={external ? rel ?? "noopener noreferrer" : rel} {...rest}>
      {children}
      {external && <><Icon name="external-link" size={14} /><span className="sr-only"> ({externalLabel})</span></>}
    </Comp>
  );
});
