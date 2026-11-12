import { cloneElement, forwardRef, isValidElement, useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactElement, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useId } from "../../utils/useId";
import { mergeRefs, useEscape } from "../../utils/hooks";
import { inClipper } from "../../utils/useMenuPlacement";

type Side = "top" | "bottom" | "left" | "right";
const OPPOSITE: Record<Side, Side> = { top: "bottom", bottom: "top", left: "right", right: "left" };
const GAP = 8, EDGE = 8;

/* 사이트 ds.js 의 placeTip 과 같은 규칙 — 화면을 넘으면 반대쪽으로, 스크롤 영역 안이거나 옆으로 넘치면 화면 기준으로 */
function place(wrap: HTMLElement, tip: HTMLElement, base: Side): { side: Side; vars: CSSProperties | null } {
  const r = wrap.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
  const room: Record<Side, number> = { top: r.top, bottom: vh - r.bottom, left: r.left, right: vw - r.right };
  const need = (base === "top" || base === "bottom" ? th : tw) + GAP + EDGE;
  const side = room[base] < need && room[OPPOSITE[base]] > room[base] ? OPPOSITE[base] : base;
  const x = side === "left" ? r.left - GAP - tw : side === "right" ? r.right + GAP : r.left + r.width / 2 - tw / 2;
  const y = side === "top" ? r.top - GAP - th : side === "bottom" ? r.bottom + GAP : r.top + r.height / 2 - th / 2;
  const cx_ = Math.max(EDGE, Math.min(x, vw - tw - EDGE)), cy = Math.max(EDGE, Math.min(y, vh - th - EDGE));
  if (!inClipper(wrap) && cx_ === x) return { side, vars: null };
  return { side, vars: { "--float-x": `${cx_}px`, "--float-y": `${cy}px`, "--float-arrow": `${r.left + r.width / 2 - cx_}px` } as CSSProperties };
}

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, "content" | "children"> {
  content: ReactNode;
  position?: Side;
  /** 두 줄 이상 (폭 220) */
  multi?: boolean;
  /** false 면 aria-describedby 를 잇지 않고 툴팁을 aria-hidden 으로 둔다 — 툴팁이 화면 글자와 같아 두 번 읽히는 자리(잘린 글자) */
  describe?: boolean;
  /** 항상 표시 (문서·디버그) */
  show?: boolean;
  /** 트리거 요소 하나. 포커스를 받을 수 있어야 한다. 이름(aria-label)이 곧 툴팁이 아니면 aria-describedby 가 주입된다 */
  children: ReactElement<Record<string, unknown>>;
}

/**
 * 보이고 숨는 것은 CSS(마우스 0.3초 뒤 · 키보드 바로). 올릴 때 재서 자리를 정하고, Esc 로 닫는다.
 * 아이콘 전용 버튼에는 항상 툴팁(= aria-label)을 둔다.
 */
export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(function Tooltip({ content, position = "top", multi, show, describe = true, className, children, onMouseEnter, onMouseLeave, onFocus, onBlur, ...rest }, ref) {
  const id = useId(undefined, "tt");
  const wrap = useRef<HTMLSpanElement>(null), tip = useRef<HTMLSpanElement>(null);
  const over = useRef(false), inside = useRef(false);
  const [active, setActive] = useState(false), [quiet, setQuiet] = useState(false);
  const [spot, setSpot] = useState<{ side: Side; vars: CSSProperties | null } | null>(null);
  const enter = () => {
    if (!active && !show && wrap.current && tip.current) setSpot(place(wrap.current, tip.current, position));
    setActive(true);
  };
  const leave = () => { if (over.current || inside.current) return; setActive(false); setQuiet(false); };
  useEscape(() => setQuiet(true), active && !quiet && !show);
  const floating = !!spot?.vars;
  useEffect(() => {
    if (!active || !floating) return;
    const hide = (e: Event) => {   // 띄운 툴팁은 트리거를 따라가지 못한다. 포커스로 온 것은 다시 잰다 — 포커스가 일으킨 스크롤에 사라지면 키보드로는 볼 수 없다
      if (e.type === "scroll" && wrap.current && tip.current && wrap.current.contains(document.activeElement)) setSpot(place(wrap.current, tip.current, position));
      else setQuiet(true);
    };
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => { window.removeEventListener("scroll", hide, true); window.removeEventListener("resize", hide); };
  }, [active, floating, position]);
  const side = show ? position : spot?.side ?? position;
  const named = isValidElement(children) && children.props["aria-label"] === content;   // 이름을 되풀이해 읽지 않게
  const trigger = isValidElement(children) && !named && describe ? cloneElement(children, { "aria-describedby": id }) : children;
  return (
    <span
      ref={mergeRefs(wrap, ref)}
      className={cx("tooltip-wrap", show && "show", quiet && "quiet", className)}
      onMouseEnter={(e) => { over.current = true; enter(); onMouseEnter?.(e); }}
      onMouseLeave={(e) => { over.current = false; leave(); onMouseLeave?.(e); }}
      onFocus={(e) => { inside.current = true; enter(); onFocus?.(e); }}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) { inside.current = false; leave(); } onBlur?.(e); }}
      {...rest}
    >
      {trigger}
      <span ref={tip} className={cx("tooltip", side !== "top" && side, multi && "multi", !show && floating && "float")} style={show ? undefined : spot?.vars ?? undefined} role="tooltip" id={id} aria-hidden={describe ? undefined : true}>
        {content}
      </span>
    </span>
  );
});
