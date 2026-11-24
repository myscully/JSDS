import { createContext, forwardRef, useContext, useEffect, useLayoutEffect, useRef, type HTMLAttributes, type ReactNode, type RefObject } from "react";
import { cx } from "../../utils/cx";
import { useId } from "../../utils/useId";
import { Button } from "../button/Button";
import { Icon } from "../../icons/Icon";
import { LABELS } from "../../labels";
import { useEscape, useFocusTrap, mergeRefs } from "../../utils/hooks";
import { Portal } from "../../utils/Portal";
import { ghostOut } from "../../utils/ghost";
import { useDiscardGuard } from "../../utils/discard";

interface PopupCtx { titleId?: string; bodyId?: string; onClose?: () => void; busy?: boolean; closeLabel?: string }
const Ctx = createContext<PopupCtx>({});

export interface PopupSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  /** 제목 danger 색 (삭제·초기화 확인) */
  danger?: boolean;
  size?: "md" | "lg";
  /** aria-labelledby 로 쓸 제목 id. 생략하면 PopupTitle 이 자동 연결 */
  titleId?: string;
  /** 헤더 닫기(X) 동작. 닫기는 필수다 — PopupTitle 이 제목 뒤에 그린다 */
  onClose: () => void;
  closeLabel?: string;
  /** 처리 중 — X 가 비활성이 되고 Popup 은 Esc · 배경으로 닫히지 않는다. 취소 버튼 disabled 와 주 버튼 loading 은 제품이 함께 넣는다 */
  busy?: boolean;
}
/** 팝업 표면(.popup) — 배경·포털 없이 role=dialog 만. 문서 예제나 커스텀 오버레이에 사용 */
export const PopupSurface = forwardRef<HTMLDivElement, PopupSurfaceProps>(function PopupSurface({ danger, size = "md", titleId: titleIdProp, onClose, closeLabel = LABELS.close, busy, className, children, ...rest }, ref) {
  const titleId = useId(titleIdProp, "popup");
  const bodyId = useId(undefined, "popup-body");
  return (
    <Ctx.Provider value={{ titleId, bodyId, onClose, busy, closeLabel }}>
      <div ref={ref} className={cx("popup", danger && "danger", size === "lg" && "lg", className)} role={danger ? "alertdialog" : "dialog"} aria-modal="true" aria-labelledby={titleId} aria-describedby={danger ? bodyId : undefined} aria-busy={busy || undefined} {...rest}>
        {children}
      </div>
    </Ctx.Provider>
  );
});

export const PopupTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(function PopupTitle({ className, id, ...rest }, ref) {
  const c = useContext(Ctx);
  return (
    <>
      <h3 ref={ref} className={cx("popup-title", className)} id={id ?? c.titleId} {...rest} />
      {c.onClose && (
        <Button variant="text" color="assistive" size="sm" iconOnly className="popup-close" aria-label={c.closeLabel} disabled={c.busy} onClick={c.onClose}>
          <Icon name="x" />
        </Button>
      )}
    </>
  );
});
export const PopupBody = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(function PopupBody({ className, id, ...rest }, ref) {
  const c = useContext(Ctx);
  return <p ref={ref} className={cx("popup-body", className)} id={id ?? c.bodyId} {...rest} />;
});
export const PopupActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function PopupActions({ className, ...rest }, ref) {
  return <div ref={ref} className={cx("popup-actions", className)} {...rest} />;
});
/** 필드 1~3개를 세로로 (16px 간격) */
export const PopupForm = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function PopupForm({ className, ...rest }, ref) {
  return <div ref={ref} className={cx("popup-form", className)} {...rest} />;
});

let openPopups = 0;

export interface PopupProps extends PopupSurfaceProps {
  open: boolean;
  /** 배경 클릭으로 닫기. 생략하면 위험 확인(danger) · 입력을 시작한 팝업은 닫지 않는다 */
  closeOnBackdrop?: boolean;
  /** 입력을 시작한 뒤 Esc · X · 취소(data-popup-close)로 닫으려 하면 '변경 사항을 버릴까요?' 를 안에 띄운다 (기본 true). 위험 확인(danger)은 대상이 아니다 */
  confirmDiscard?: boolean;
  /** Esc 로 닫기 (기본 true) */
  closeOnEsc?: boolean;
  /** 열릴 때 포커스할 요소. 없으면 첫 포커스 가능 요소 */
  initialFocus?: RefObject<HTMLElement | null>;
  /** Portal 컨테이너 (기본 document.body) */
  container?: Element | null;
  children?: ReactNode;
}

/** 모달 팝업: Portal + 배경 음영 + 포커스 트랩/복원 + Esc + 배경 클릭 */
export const Popup = forwardRef<HTMLDivElement, PopupProps>(function Popup({ open, container, ...layer }, ref) {
  const guard = useRef<(() => void) | null>(null);   // 안쪽 Layer 가 입력 보호를 거친 닫기를 넣는다
  /* Esc 는 여기서 — 안에 처음부터 열려 있는 Select 보다 먼저 스택에 올라야 Select 가 먼저 받는다 */
  useEscape(() => { if (!layer.busy) (guard.current ?? layer.onClose)(); }, open && (layer.closeOnEsc ?? true));
  if (!open) return null;
  return (
    <Portal container={container}>
      <PopupLayer ref={ref} guard={guard} {...layer} />
    </Portal>
  );
});

/* 훅은 Portal 안에서 돈다 — Portal 은 한 박자 늦게 그려서, 밖에서 돌면 포커스를 옮길 때 표면이 아직 없다(열어도 포커스가 들어가지 않고 Tab 이 가둬지지 않았다, 2026-11-10 실측) */
const PopupLayer = forwardRef<HTMLDivElement, Omit<PopupProps, "open" | "container"> & { guard: { current: (() => void) | null } }>(function PopupLayer(
  { onClose, closeOnBackdrop, closeOnEsc: _esc, confirmDiscard = true, initialFocus, guard, children, ...surface },
  ref,
) {
  const inner = useRef<HTMLDivElement>(null);
  const g = useDiscardGuard(inner, onClose, confirmDiscard && !surface.danger && !surface.busy);
  const { dirty, mark } = g;
  guard.current = g.request;
  useEffect(() => () => { guard.current = null; }, [guard]);
  useFocusTrap(inner, true, initialFocus);
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && openPopups > 0) console.warn("[ds-react] 모달 위에 모달을 띄우지 않습니다 — 열려 있는 Popup 을 먼저 닫으세요.");
    openPopups++;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { openPopups--; document.body.style.overflow = prev; };
  }, []);
  const back = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => { const node = back.current; return () => ghostOut([node]); }, []);   // 나갈 때 흐려지는 사본(사이트와 같음)
  return (
    <div
      ref={back}
      className="popup-backdrop"
      onInputCapture={mark}
      onChangeCapture={mark}
      onClickCapture={(e) => {
        const t = e.target as Element;
        if (t.closest(".menu-item, [role=gridcell]")) mark();
        /* 취소 버튼(data-popup-close) — 주 버튼에 단 것은 저장 뒤 닫기라 묻지 않는다 */
        const cl = t.closest("[data-popup-close]");
        if (cl && !cl.matches(".primary") && g.asks()) { e.preventDefault(); e.stopPropagation(); g.request(); }
      }}
      onMouseDown={(e) => {
        if (e.target !== e.currentTarget || surface.busy) return;
        if (closeOnBackdrop ?? !(surface.danger || dirty.current)) onClose();
      }}
    >
      <PopupSurface ref={mergeRefs(inner, ref)} onClose={g.request} {...surface}>
        {children}
      </PopupSurface>
      {g.portal}
    </div>
  );
});
