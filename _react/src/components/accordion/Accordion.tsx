import { forwardRef, useRef, type CSSProperties, type DetailsHTMLAttributes, type HTMLAttributes, type MouseEvent, type ReactNode, type SyntheticEvent } from "react";
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
  /* details 는 브라우저가 DOM 을 먼저 토글한다. 제어 모드에서 부모가 open 을 그대로 두면
     리렌더가 없어 React 가 되돌릴 기회가 없다 — 여기서 동기적으로 되돌린다.
     되돌리면 toggle 이 한 번 더 나는데, 그 이벤트로 onOpenChange 가 두 번 불리지 않게 막는다 */
  const reverting = useRef(false);
  const toggle = (e: SyntheticEvent<HTMLDetailsElement>) => {
    const el = e.currentTarget;
    if (reverting.current) { reverting.current = false; return; }
    (onToggle as ((ev: SyntheticEvent<HTMLDetailsElement>) => void) | undefined)?.(e);
    const next = el.open;
    set(next);
    if (open !== undefined && next !== open) {
      reverting.current = true;
      el.open = open;
    }
  };
  const extraProps = name ? ({ name } as Record<string, string>) : {};
  /* disabled 는 summary 클릭을 삼켜 막는다 — CSS 의 pointer-events 는 마우스만 막고,
     포커스를 강제로 받은 summary 는 Enter 로 열렸다(정적 HTML 은 ds.js 가드가 같은 일을 한다) */
  const swallow = disabled ? (e: MouseEvent<HTMLElement>) => { e.preventDefault(); e.stopPropagation(); } : undefined;
  return (
    <details ref={ref} className={cx("accordion", { flat, disabled }, className)} open={isOpen} onToggle={toggle} {...extraProps} {...rest}>
      <summary tabIndex={disabled ? -1 : undefined} aria-disabled={disabled || undefined} onClickCapture={swallow}>
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
