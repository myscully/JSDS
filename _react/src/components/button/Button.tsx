import { forwardRef, type ComponentPropsWithoutRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import type { Size } from "../../types";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "text" | "danger" | "danger-secondary";

export interface ButtonProps extends Omit<ComponentPropsWithoutRef<"button">, "type"> {
  /** 우선순위. Primary 는 화면당 하나 */
  variant?: ButtonVariant;
  /** 높이 36 / 44 / 52 */
  size?: Size;
  /** 아이콘 전용 정사각 버튼. aria-label 필수 */
  icon?: boolean;
  /** 전체 폭 */
  block?: boolean;
  /** 스피너 표시 + 클릭 차단. 라벨은 유지 */
  loading?: boolean;
  /** 라벨 앞 아이콘 */
  leading?: ReactNode;
  /** 라벨 뒤 아이콘 */
  trailing?: ReactNode;
  type?: "button" | "submit" | "reset";
  /** 루트 요소 변경 (예: "a", Link). 기본 button */
  as?: ElementType;
  href?: string;
  target?: string;
  rel?: string;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "primary",
  secondary: "secondary",
  tertiary: "tertiary",
  text: "text",
  danger: "danger",
  "danger-secondary": "danger secondary",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", icon, block, loading, leading, trailing, className, children, as, type, disabled, ...rest },
  ref,
) {
  const Comp: ElementType = as ?? "button";
  if (process.env.NODE_ENV !== "production" && icon && !rest["aria-label"] && !rest["aria-labelledby"]) {
    console.warn("[ds-react] Button icon 전용 버튼에는 aria-label 이 필요합니다.");
  }
  const cls = cx("btn", size, VARIANT_CLASS[variant], { icon, block, loading }, className);
  const extra = Comp === "button" ? { type: type ?? "button", disabled } : { "aria-disabled": disabled || undefined };
  return (
    <Comp ref={ref} className={cls} aria-busy={loading || undefined} {...extra} {...rest}>
      {leading}
      {children}
      {trailing}
    </Comp>
  );
});

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** 우측 정렬 + 전체 폭 (폼 하단) */
  end?: boolean;
}
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup({ end, className, ...rest }, ref) {
  return <div ref={ref} className={cx("btn-group", { end }, className)} {...rest} />;
});
