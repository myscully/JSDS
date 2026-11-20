import { forwardRef, useEffect, useLayoutEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useId } from "../../utils/useId";
import { mergeRefs, useEscape, useFocusTrap } from "../../utils/hooks";
import { Portal } from "../../utils/Portal";
import { ghostOut } from "../../utils/ghost";
import { Button } from "../button/Button";
import { Icon } from "../../icons/Icon";
import { LABELS } from "../../labels";

export interface SidePanelSurfaceProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  /** 머리글 닫기(X) 동작. 닫기는 필수다 */
  onClose: () => void;
  closeLabel?: string;
  /** 하단 버튼들. 없으면 바닥글을 그리지 않는다 */
  footer?: ReactNode;
  /** 400 / 560 */
  size?: "md" | "lg";
  modal?: boolean;
  /** 화면 오른쪽에 띄운다. SidePanel 이 켠다 */
  fixed?: boolean;
}
/** 패널 표면(.side-panel) — 포털 · 동작 없이 모양만. 문서 예제나 화면 안에 나란히 둘 때 */
export const SidePanelSurface = forwardRef<HTMLElement, SidePanelSurfaceProps>(function SidePanelSurface({ title, onClose, closeLabel = LABELS.close, footer, size = "md", modal, fixed, className, children, ...rest }, ref) {
  const titleId = useId(undefined, "panel");
  return (
    <section ref={ref} className={cx("side-panel", size === "lg" && "lg", fixed && "fixed", className)} role="dialog" aria-modal={modal || undefined} aria-labelledby={titleId} {...rest}>
      <div className="side-panel-header">
        <h3 className="side-panel-title" id={titleId}>{title}</h3>
        <Button variant="text" color="assistive" size="sm" iconOnly className="side-panel-close" aria-label={closeLabel} onClick={onClose}>
          <Icon name="x" />
        </Button>
      </div>
      <div className="side-panel-body">{children}</div>
      {footer !== undefined && <div className="side-panel-footer">{footer}</div>}
    </section>
  );
});

export interface SidePanelProps extends SidePanelSurfaceProps {
  open: boolean;
  /** Portal 컨테이너 (기본 document.body) */
  container?: Element | null;
}

/**
 * 비모달이 기본 — 뒤 페이지를 그대로 쓸 수 있고, 패널 안에 포커스가 있을 때만 Esc 로 닫는다.
 * modal 이면 배경 · 포커스 가둠 · 스크롤 잠금이 함께 켜진다.
 */
export const SidePanel = forwardRef<HTMLElement, SidePanelProps>(function SidePanel({ open, container, ...layer }, ref) {
  const inner = useRef<HTMLElement>(null);
  /* Esc 는 여기서 — 안에 처음부터 열려 있는 Select 보다 먼저 스택에 올라야 Select 가 먼저 받는다 */
  useEscape(() => { if (layer.modal || inner.current?.contains(document.activeElement)) layer.onClose(); }, open);
  if (!open) return null;
  return (
    <Portal container={container}>
      <SidePanelLayer ref={mergeRefs(inner, ref)} {...layer} />
    </Portal>
  );
});

/* 훅은 Portal 안에서 돈다 — Portal 은 한 박자 늦게 그려서, 밖에서 돌면 포커스를 옮길 때 표면이 아직 없다 */
const SidePanelLayer = forwardRef<HTMLElement, Omit<SidePanelProps, "open" | "container">>(function SidePanelLayer({ onClose, modal, children, ...surface }, ref) {
  const inner = useRef<HTMLElement>(null);
  useFocusTrap(inner, !!modal, inner);
  useEffect(() => {
    if (modal) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
    const prev = document.activeElement as HTMLElement | null;
    inner.current?.focus({ preventScroll: true });
    return () => {   // 패널 안에 포커스가 있었으면 body 로 떨어져 있다. 사용자가 뒤 페이지로 옮겨 갔으면 뺏지 않는다
      if ((document.activeElement === document.body || document.activeElement === null) && prev?.isConnected) prev.focus({ preventScroll: true });
    };
  }, [modal]);
  const dim = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => { const d = dim.current, p = inner.current; return () => ghostOut([d, p]); }, []);   // 나갈 때 흐려지는 사본(사이트와 같음)
  return (
    <>
      {modal && <div ref={dim} className="side-panel-dim" onMouseDown={onClose} />}
      <SidePanelSurface ref={mergeRefs(inner, ref)} fixed modal={modal} onClose={onClose} tabIndex={-1} {...surface}>
        {children}
      </SidePanelSurface>
    </>
  );
});
