import { forwardRef, type KeyboardEvent, type MouseEvent, type PointerEvent, type ComponentPropsWithoutRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import type { Size } from "../../types";

/** 형태 — solid · outline. text 는 정의 밖 변형(색은 primary · assistive) */
export type ButtonVariant = "solid" | "outline" | "text";
/** 색 — primary(기본) · assistive(보조) · negative(되돌리기 어려운 행동) */
export type ButtonColor = "primary" | "assistive" | "negative";

export interface ButtonProps extends Omit<ComponentPropsWithoutRef<"button">, "type" | "color"> {
  /** 형태. 기본 solid — iconOnly 에서 생략하면 배경 없음(hover 에만 면) */
  variant?: ButtonVariant;
  /** 색. 우선순위 Lv.4 solid primary · Lv.3 outline primary · Lv.2 solid assistive · Lv.1 outline assistive */
  color?: ButtonColor;
  /** 높이 32 / 40 / 48 — 높이 고정, 너비 자유 */
  size?: Size;
  /** 아이콘 전용 정사각 버튼. aria-label 필수 */
  iconOnly?: boolean;
  /** 전체 폭 */
  block?: boolean;
  /** 스피너 표시. disabled 와 달리 포커스는 남고 onClick · onMouseDown · onPointerDown · onKeyDown 을 부르지 않는다 */
  loading?: boolean;
  /** 라벨 왼쪽 아이콘 — iconRight 와 동시에 쓰지 않는다 */
  iconLeft?: ReactNode;
  /** 라벨 오른쪽 아이콘 — iconLeft 와 동시에 쓰지 않는다 */
  iconRight?: ReactNode;
  type?: "button" | "submit" | "reset";
  /** 루트 요소 변경 (예: "a", Link). 기본 button */
  as?: ElementType;
  href?: string;
  target?: string;
  rel?: string;
}

const VARIANTS: readonly string[] = ["solid", "outline", "text"], COLORS: readonly string[] = ["primary", "assistive", "negative"];
/* 2026-10-28 이전 이름 — 별칭은 두지 않았다. TS 는 타입 오류로 알지만 JS 소비자는 아무 신호 없이 검은 글자 버튼이 되고
   icon · leading · trailing 은 DOM 속성으로 새어 나갔다. 개발 모드에서 알리고 DOM 에는 내지 않는다 */
const LEGACY_PROPS = ["icon", "leading", "trailing"] as const;
/** 탐색 키 — loading 중에도 부모로 올라간다(사이트 ds.js 의 NAV 와 같다) */
const NAV = ["Tab", "Escape", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown"];

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, color = "primary", size = "md", iconOnly, block, loading, iconLeft, iconRight, className, children, as, type, disabled,
    onClick, onClickCapture, onMouseDown, onMouseDownCapture, onPointerDown, onPointerDownCapture, onKeyDown, onKeyDownCapture, ...props },
  ref,
) {
  const Comp: ElementType = as ?? "button";
  const rest: Record<string, unknown> = { ...props };
  for (const k of LEGACY_PROPS) delete rest[k];
  if (process.env.NODE_ENV !== "production") {
    if (iconOnly && !rest["aria-label"] && !rest["aria-labelledby"]) console.warn("[ds-react] Button iconOnly 버튼에는 aria-label 이 필요합니다.");
    if (iconLeft && iconRight) console.warn("[ds-react] Button 아이콘은 iconLeft · iconRight 중 하나만 씁니다.");
    if (variant && !VARIANTS.includes(variant)) console.warn(`[ds-react] Button variant="${variant}" 는 없습니다 — solid · outline · text (MIGRATION.md 의 Button 전환표).`);
    if (!COLORS.includes(color)) console.warn(`[ds-react] Button color="${color}" 는 없습니다 — primary · assistive · negative.`);
    if (variant === "text" && color === "negative") console.warn("[ds-react] Button text 변형의 색은 primary · assistive 둘입니다 — negative 는 무시됩니다.");
    for (const k of LEGACY_PROPS) if (k in props) console.warn(`[ds-react] Button ${k} prop 은 바뀌었습니다 — ${{ icon: "iconOnly", leading: "iconLeft", trailing: "iconRight" }[k]} (MIGRATION.md).`);
  }
  const form = variant ?? (iconOnly ? undefined : "solid");
  /* text 는 색 클래스가 없으면 primary — 사이트의 `btn md text` 마크업이 그대로 primary 로 남는다. assistive 만 클래스를 붙인다 */
  const cls = cx("btn", size, form, form !== "text" ? color : color === "assistive" && color, { "icon-only": iconOnly, block, loading }, className);
  const extra = Comp === "button" ? { type: type ?? "button", disabled } : { "aria-disabled": disabled || undefined };
  /* loading 중에는 네 이벤트(캡처 변형 포함)를 부르지 않는다. disabled 를 걸지 않는 이유는 포커스를 유지해야 스크린리더가 aria-busy 변화를 읽기 때문.
     as="a" 처럼 button 이 아닐 때는 disabled 속성이 먹지 않아 aria-disabled 만 나가므로 클릭도 여기서 막는다.
     가드는 rest 뒤에 둬서 사용자의 핸들러가 덮지 못한다. keydown 은 탐색 키(NAV)와 수정 키 조합(단축키)을 부모로 올려 보낸다
     — Esc 닫기 · 화살표 이동 · 전역 단축키가 loading 동안 멈추지 않게. 사용자 onKeyDown 은 어느 키에도 부르지 않는다 */
  const inert = loading || (Comp !== "button" && disabled);
  const swallow = (e: MouseEvent<HTMLButtonElement> | PointerEvent<HTMLButtonElement>) => { e.preventDefault(); e.stopPropagation(); };
  const guard = {
    onClickCapture: (e: MouseEvent<HTMLButtonElement>) => { if (inert) swallow(e); else onClickCapture?.(e); },
    onClick: inert ? undefined : onClick,
    onMouseDownCapture: loading ? undefined : onMouseDownCapture,
    onMouseDown: loading ? swallow : onMouseDown,
    onPointerDownCapture: loading ? undefined : onPointerDownCapture,
    onPointerDown: loading ? swallow : onPointerDown,
    onKeyDownCapture: loading ? undefined : onKeyDownCapture,
    onKeyDown: loading
      ? (e: KeyboardEvent<HTMLButtonElement>) => {
          if (NAV.includes(e.key) || e.ctrlKey || e.metaKey || e.altKey) return;
          e.stopPropagation();
          if (e.key === "Enter" || e.key === " ") e.preventDefault();
        }
      : onKeyDown,
  };
  return (
    <Comp ref={ref} className={cls} aria-busy={loading || undefined} {...extra} {...rest} {...guard}>
      {iconLeft}
      {children}
      {iconRight}
    </Comp>
  );
});

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** 우측 정렬 + 전체 폭 (폼 하단) — 수평 배열은 주 행동이 오른쪽 */
  end?: boolean;
  /** 수직 배열 — 주 행동이 위, 같은 폭 */
  vertical?: boolean;
}
export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup({ end, vertical, className, ...rest }, ref) {
  return <div ref={ref} className={cx("btn-group", { end, vertical }, className)} {...rest} />;
});
