import { createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { Icon } from "../../icons/Icon";
import type { IconName } from "../../icons/icons.data";
import { Portal } from "../../utils/Portal";
import { LABELS } from "../../labels";
import type { FeedbackTone } from "../../types";

const TONE_ICON: Record<FeedbackTone, IconName> = { info: "info-circle", success: "circle-check", warning: "alert-triangle", danger: "alert-circle" };

export interface NoticeProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  tone?: FeedbackTone;
  /** 굵은 제목 (b) */
  title?: ReactNode;
  /** 톤 기본 아이콘 대신 */
  icon?: IconName;
  /** 하단 액션 버튼들 */
  actions?: ReactNode;
  /** 있으면 닫기(✕) 버튼 */
  onClose?: () => void;
  closeLabel?: string;
}
/** 페이지 안에 머무는 인라인 알림. danger 는 role=alert */
export const Notice = forwardRef<HTMLDivElement, NoticeProps>(function Notice({ tone, title, icon, actions, onClose, closeLabel = LABELS.close, className, children, role, ...rest }, ref) {
  const ic = icon ?? TONE_ICON[tone ?? "info"];
  return (
    <div ref={ref} className={cx("notice", tone, className)} role={role ?? (tone === "danger" ? "alert" : "status")} {...rest}>
      <span className="ico"><Icon name={ic} size={20} /></span>
      <div>
        {title !== undefined && <b>{title}</b>}
        {children}
        {actions !== undefined && <div className="actions">{actions}</div>}
      </div>
      {onClose && (
        <button type="button" className="close" aria-label={closeLabel} onClick={onClose}>
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  );
});

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  tone?: "success" | "danger";
  icon?: IconName;
  /** 하나의 액션 (실행 취소 · 다시 시도) */
  action?: { label: ReactNode; onClick: () => void };
}
/** 짧은 결과 알림 한 개 (표시용). 앱에서는 ToastProvider + useToast */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast({ tone = "success", icon, action, className, children, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("toast", tone === "danger" && "danger", className)} {...rest}>
      <span className="ico"><Icon name={icon ?? TONE_ICON[tone]} size={20} /></span>
      {children}
      {action && (
        <button type="button" className="action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
});

export interface ToastStackProps extends HTMLAttributes<HTMLDivElement> {
  /** 화면 우측 하단 고정 */
  fixed?: boolean;
}
export const ToastStack = forwardRef<HTMLDivElement, ToastStackProps>(function ToastStack({ fixed, className, ...rest }, ref) {
  return <div ref={ref} className={cx("toast-stack", fixed && "fixed", className)} aria-live="polite" {...rest} />;
});

export interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  tone?: "warning" | "danger";
  icon?: IconName | null;
  /** 우측 버튼 */
  action?: ReactNode;
}
/** 시스템 전체 공지 (헤더 위 전체 폭) */
export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner({ tone, icon = "info-circle", action, className, children, role, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("banner", tone, className)} role={role ?? (tone ? "alert" : "status")} {...rest}>
      {icon && <Icon name={icon} size={18} />}
      {children}
      {action}
    </div>
  );
});

/* ---------- ToastProvider / useToast ---------- */
export interface ToastOptions {
  message: ReactNode;
  tone?: "success" | "danger";
  icon?: IconName;
  action?: { label: ReactNode; onClick: () => void };
  /** ms. 0 이면 자동 소멸 없음 */
  duration?: number;
}
interface ToastItem extends ToastOptions { id: number }
interface ToastApi {
  show: (opts: ToastOptions | ReactNode) => number;
  dismiss: (id: number) => void;
  clear: () => void;
}
const ToastCtx = createContext<ToastApi | null>(null);

export interface ToastProviderProps {
  /** 기본 자동 소멸 ms (3~5초 권장) */
  duration?: number;
  /** 동시에 보이는 최대 개수. 넘치면 오래된 것부터 제거 */
  max?: number;
  container?: Element | null;
  children?: ReactNode;
}
/** 앱 루트에 한 번. 우측 하단 고정 스택(.toast-stack.fixed)을 Portal 로 렌더 */
export function ToastProvider({ duration = 4000, max = 3, container, children }: ToastProviderProps) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);
  const timers = useRef(new Map<number, number>());
  const dismiss = useCallback((id: number) => {
    setItems((s) => s.filter((t) => t.id !== id));
    const t = timers.current.get(id);
    if (t) { window.clearTimeout(t); timers.current.delete(id); }
  }, []);
  const show = useCallback((opts: ToastOptions | ReactNode) => {
    const o: ToastOptions = typeof opts === "object" && opts !== null && "message" in (opts as object) ? (opts as ToastOptions) : { message: opts as ReactNode };
    const id = ++seq.current;
    setItems((s) => [...s, { ...o, id }].slice(-max));
    const d = o.duration ?? duration;
    if (d > 0) timers.current.set(id, window.setTimeout(() => dismiss(id), d));
    return id;
  }, [duration, max, dismiss]);
  const clear = useCallback(() => { setItems([]); timers.current.forEach((t) => window.clearTimeout(t)); timers.current.clear(); }, []);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const api = useMemo(() => ({ show, dismiss, clear }), [show, dismiss, clear]);
  return (
    <ToastCtx.Provider value={api}>
      {children}
      <Portal container={container}>
        <ToastStack fixed>
          {items.map((t) => (
            <Toast key={t.id} tone={t.tone} icon={t.icon} action={t.action ? { label: t.action.label, onClick: () => { t.action!.onClick(); dismiss(t.id); } } : undefined}>
              {t.message}
            </Toast>
          ))}
        </ToastStack>
      </Portal>
    </ToastCtx.Provider>
  );
}
export function useToast(): ToastApi {
  const c = useContext(ToastCtx);
  if (!c) throw new Error("[ds-react] useToast 는 <ToastProvider> 안에서 사용하세요.");
  return c;
}
