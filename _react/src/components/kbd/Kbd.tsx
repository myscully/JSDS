import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";

/** 맥(⌘)인지 — 사이트 ds.js 의 DS.kbd.mac 과 같은 판단 */
export function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  const n = navigator as Navigator & { userAgentData?: { platform?: string } };
  return /Mac|iPhone|iPad/.test(n.userAgentData?.platform || n.platform || "");
}

/** 운영체제 수정 키 — 맥이면 ⌘ 기호 + 숨긴 'Command'(기호는 화면 낭독기가 읽지 못함), 그 밖은 Ctrl */
function ModKey({ size }: { size?: "sm" | "md" }) {
  const mac = isMacPlatform();
  return (
    <kbd className={cx("kbd", size === "sm" && "sm")} data-kbd-mod="" data-kbd-mac={mac ? "1" : undefined}>
      {mac ? <><span aria-hidden="true">⌘</span><span className="sr-only">Command</span></> : "Ctrl"}
    </kbd>
  );
}

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  /** 함께 누르는 키 — "Mod" 는 운영체제 수정 키(맥 ⌘ · 그 밖 Ctrl). 주면 .kbd-combo 로 나란히 그린다(더하기 기호 없음) */
  keys?: string[];
  /** 메뉴 · 명령 팔레트 · Tooltip 안은 sm */
  size?: "sm" | "md";
  /** 메뉴 · 팔레트 항목 끝 자리(.menu-kbd) — aria-hidden. 단축키는 항목의 aria-keyshortcuts 로 알린다 */
  menu?: boolean;
  children?: ReactNode;
}

/** 키 하나(kbd.kbd) 또는 함께 누르는 키 묶음(.kbd-combo) — 사이트 마크업과 같다 */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd({ keys, size = "md", menu, className, children, ...rest }, ref) {
  if (keys) {
    return (
      <span ref={ref as React.Ref<HTMLSpanElement>} className={cx("kbd-combo", menu && "menu-kbd", className)} aria-hidden={menu ? true : undefined} {...rest}>
        {keys.map((k, i) => (k === "Mod" ? <ModKey key={i} size={size} /> : <kbd key={i} className={cx("kbd", size === "sm" && "sm")}>{k}</kbd>))}
      </span>
    );
  }
  return <kbd ref={ref} className={cx("kbd", size === "sm" && "sm", className)} {...rest}>{children}</kbd>;
});
