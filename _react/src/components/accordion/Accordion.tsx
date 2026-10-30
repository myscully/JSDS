import { forwardRef, useRef, type CSSProperties, type DetailsHTMLAttributes, type HTMLAttributes, type MouseEvent, type ReactNode, type SyntheticEvent } from "react";
import { cx } from "../../utils/cx";
import type { Size } from "../../types";
import { useControllable } from "../../utils/useControllable";

/** 형태 — outline(기본, 테두리 카드) · flat(구분선형, 카드 · 패널 안) */
export type AccordionVariant = "outline" | "flat";

export interface AccordionProps extends Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title" | "open"> {
  /** 제목(필수). 명사형 · 질문형 한 줄 권장. 헤더 안에는 조작 요소를 두지 않는다 — 약관 동의의 항목 체크박스만 예외 */
  title: ReactNode;
  /** 오른쪽 보조 정보 (small) — 개수 · 상태 · 비활성 이유 */
  extra?: ReactNode;
  /** 형태. 기본 outline */
  variant?: AccordionVariant;
  /** 헤더 높이 40 / 52 / 60. 기본 md */
  size?: Size;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** 같은 name 은 하나만 펼침 (브라우저 지원 시) */
  name?: string;
  /** 열 수 없음 — 이유를 extra 로 함께 보인다 */
  disabled?: boolean;
  /** .body 스타일 (예: max-height + overflow) */
  bodyStyle?: CSSProperties;
}

/** 네이티브 details/summary 기반 아코디언 — JS 없이 동작, React 는 상태만 동기화 */
export const Accordion = forwardRef<HTMLDetailsElement, AccordionProps>(function Accordion(
  { title, extra, variant = "outline", size = "md", open, defaultOpen = false, onOpenChange, name, disabled, bodyStyle, className, children, onToggle, ...props },
  ref,
) {
  /* 2026-10-29 flat boolean → variant="flat". 별칭은 두지 않는다 — 개발 모드에서 알리고 DOM 에는 내지 않는다 */
  const { flat: legacyFlat, ...rest } = props as typeof props & { flat?: unknown };
  if (process.env.NODE_ENV !== "production" && legacyFlat !== undefined) console.warn('[ds-react] Accordion flat prop 은 바뀌었습니다 — variant="flat" (MIGRATION.md).');
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
    <details ref={ref} className={cx("accordion", size, variant, { disabled }, className)} open={isOpen} onToggle={toggle} {...extraProps} {...rest}>
      <summary tabIndex={disabled ? -1 : undefined} aria-disabled={disabled || undefined} onClickCapture={swallow}>
        {title}
        {extra !== undefined && <> <small>{extra}</small></>}
      </summary>
      <div className="body" style={bodyStyle}>{children}</div>
    </details>
  );
});

export interface AccordionGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** outline(간격 8) · flat(간격 0 · 카드 바탕 · 테두리 · 좌우 20 — 항목도 variant="flat") */
  variant?: AccordionVariant;
}
export const AccordionGroup = forwardRef<HTMLDivElement, AccordionGroupProps>(function AccordionGroup({ variant = "outline", className, ...props }, ref) {
  const { flat: legacyFlat, ...rest } = props as typeof props & { flat?: unknown };
  if (process.env.NODE_ENV !== "production" && legacyFlat !== undefined) console.warn('[ds-react] AccordionGroup flat prop 은 바뀌었습니다 — variant="flat" (MIGRATION.md).');
  /* 그룹은 outline 이 클래스 없는 기본 — 사이트 마크업 .accordion-group 그대로 */
  return <div ref={ref} className={cx("accordion-group", variant === "flat" && "flat", className)} {...rest} />;
});
