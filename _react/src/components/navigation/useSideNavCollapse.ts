import { useCallback, useEffect, useState } from "react";

/** 사이트 ds.js 와 같은 경계 — 루트 글자 단계 `~1279` 와 같다 */
export const SIDENAV_NARROW_QUERY = "(max-width:1279.98px)";

export interface UseSideNavCollapseOptions {
  /** false 면 화면 폭을 보지 않는다(사이트 `data-auto-collapse="false"`). 기본 true */
  auto?: boolean;
  /** auto 가 false 일 때의 처음 값. 기본 false */
  defaultCollapsed?: boolean;
}

function narrowNow(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(SIDENAV_NARROW_QUERY).matches;
}

/**
 * 사이드 내비 접힘 상태(2026-11-19) — 화면 폭이 1280 아래로 줄면 접고, 다시 넓히면 편다.
 * 경계를 넘을 때만 맞추므로 그 사이 `setCollapsed` 로 바꾼 값은 다음 경계까지 남는다.
 * `TopBarNavToggle collapsed onCollapsedChange` 와 `SideNav collapsed` 에 그대로 넘긴다. 저장은 제품 몫.
 */
export function useSideNavCollapse(options: UseSideNavCollapseOptions = {}): [boolean, (collapsed: boolean) => void] {
  const { auto = true, defaultCollapsed = false } = options;
  const [collapsed, setState] = useState<boolean>(() => (auto ? narrowNow() : defaultCollapsed));
  useEffect(() => {
    if (!auto || typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(SIDENAV_NARROW_QUERY);
    const onChange = (e: MediaQueryListEvent) => setState(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [auto]);
  const setCollapsed = useCallback((c: boolean) => setState(c), []);
  return [collapsed, setCollapsed];
}
