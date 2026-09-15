import { useEffect, useState, type ReactNode, type ReactPortal } from "react";
import { createPortal } from "react-dom";

export interface PortalProps {
  /** 기본 document.body. 테마 토큰은 <html data-theme> 에서 상속되므로 보통 그대로 둔다 */
  container?: Element | null;
  children: ReactNode;
}

/** SSR 안전 포털. 마운트 전에는 렌더하지 않는다. */
export function Portal({ container, children }: PortalProps): ReactPortal | null {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const target = container ?? (typeof document !== "undefined" ? document.body : null);
  if (!target) return null;
  return createPortal(children, target);
}
