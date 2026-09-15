import { forwardRef, type CSSProperties, type DetailsHTMLAttributes, type HTMLAttributes, type ReactNode, type SyntheticEvent } from "react";
import { cx } from "../../utils/cx";
import { useControllable } from "../../utils/useControllable";

export interface AccordionProps extends Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title" | "open"> {
  /** summary 내용 */
  title: ReactNode;
  /** summary 우측 보조 정보 (small) */
  extra?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 같은 name 은 하나만 펼침 (브라우저 지원 시) */
  name?: string;
  /** 보더 없는 구분선형 (카드 안) */
  flat?: boolean;
  disabled?: boolean;
  /** .body 스타일 (예: max-height + overflow) */
  bodyStyle?: CSSProperties;
}

/** 네이티브 details/summary 기반 아코디언 — JS 없이 동작, React 는 상태만 동기화 */
export const Accordion = forwardRef<HTMLDetailsElement, AccordionProps>(function Accordion(
  { title, extra, open, defaultOpen = false, onOpenChange, name, flat, disabled, bodyStyle, className, children, onToggle, ...rest },
  ref,
) {
  const [isOpen, set] = useControllable<boolean>({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const toggle = (e: SyntheticEvent<HTMLDetailsElement>) => {
    (onToggle as ((ev: SyntheticEvent<HTMLDetailsElement>) => void) | undefined)?.(e);
    set(e.currentTarget.open);
  };
  const extraProps = name ? ({ name } as Record<string, string>) : {};
  return (
    <details ref={ref} className={cx("accordion", { flat, disabled }, className)} open={isOpen} onToggle={toggle} {...extraProps} {...rest}>
      <summary tabIndex={disabled ? -1 : undefined}>
        {title}
        {extra !== undefined && <> <small>{extra}</small></>}
      </summary>
      <div className="body" style={bodyStyle}>{children}</div>
    </details>
  );
});

export interface AccordionGroupProps extends HTMLAttributes<HTMLDivElement> {
  flat?: boolean;
}
export const AccordionGroup = forwardRef<HTMLDivElement, AccordionGroupProps>(function AccordionGroup({ flat, className, ...rest }, ref) {
  return <div ref={ref} className={cx("accordion-group", { flat }, className)} {...rest} />;
});
