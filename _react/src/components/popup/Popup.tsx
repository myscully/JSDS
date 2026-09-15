import { createContext, forwardRef, useContext, useEffect, useRef, type HTMLAttributes, type ReactNode, type RefObject } from "react";
import { cx } from "../../utils/cx";
import { useId } from "../../utils/useId";
import { useEscape, useFocusTrap, mergeRefs } from "../../utils/hooks";
import { Portal } from "../../utils/Portal";

const TitleCtx = createContext<string | undefined>(undefined);

export interface PopupSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  /** 제목 danger 색 (삭제·초기화 확인) */
  danger?: boolean;
  size?: "md" | "lg";
  /** aria-labelledby 로 쓸 제목 id. 생략하면 PopupTitle 이 자동 연결 */
  titleId?: string;
}
/** 팝업 표면(.popup) — 배경·포털 없이 role=dialog 만. 문서 예제나 커스텀 오버레이에 사용 */
export const PopupSurface = forwardRef<HTMLDivElement, PopupSurfaceProps>(function PopupSurface({ danger, size = "md", titleId: titleIdProp, className, children, ...rest }, ref) {
  const titleId = useId(titleIdProp, "popup");
  return (
    <TitleCtx.Provider value={titleId}>
      <div ref={ref} className={cx("popup", danger && "danger", size === "lg" && "lg", className)} role="dialog" aria-modal="true" aria-labelledby={titleId} {...rest}>
        {children}
      </div>
    </TitleCtx.Provider>
  );
});

export const PopupTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(function PopupTitle({ className, id, ...rest }, ref) {
  const ctxId = useContext(TitleCtx);
  return <h3 ref={ref} className={cx("popup-title", className)} id={id ?? ctxId} {...rest} />;
});
export const PopupBody = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(function PopupBody({ className, ...rest }, ref) {
  return <p ref={ref} className={cx("popup-body", className)} {...rest} />;
});
export const PopupActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function PopupActions({ className, ...rest }, ref) {
  return <div ref={ref} className={cx("popup-actions", className)} {...rest} />;
});
/** 필드 1~3개를 세로로 (16px 간격) */
export const PopupForm = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function PopupForm({ className, ...rest }, ref) {
  return <div ref={ref} className={cx("popup-form", className)} {...rest} />;
});

export interface PopupProps extends PopupSurfaceProps {
  open: boolean;
  onClose: () => void;
  /** 배경 클릭으로 닫기 (기본 true) */
  closeOnBackdrop?: boolean;
  /** Esc 로 닫기 (기본 true) */
  closeOnEsc?: boolean;
  /** 열릴 때 포커스할 요소. 없으면 첫 포커스 가능 요소 */
  initialFocus?: RefObject<HTMLElement | null>;
  /** Portal 컨테이너 (기본 document.body) */
  container?: Element | null;
  children?: ReactNode;
}

/** 모달 팝업: Portal + 배경 음영 + 포커스 트랩/복원 + Esc + 배경 클릭 */
export const Popup = forwardRef<HTMLDivElement, PopupProps>(function Popup(
  { open, onClose, closeOnBackdrop = true, closeOnEsc = true, initialFocus, container, children, ...surface },
  ref,
) {
  const inner = useRef<HTMLDivElement>(null);
  useEscape(() => onClose(), open && closeOnEsc);
  useFocusTrap(inner, open, initialFocus);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);
  if (!open) return null;
  return (
    <Portal container={container}>
      <div className="popup-backdrop" onMouseDown={(e) => { if (closeOnBackdrop && e.target === e.currentTarget) onClose(); }}>
        <PopupSurface ref={mergeRefs(inner, ref)} {...surface}>
          {children}
        </PopupSurface>
      </div>
    </Portal>
  );
});
