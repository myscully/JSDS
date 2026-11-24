import { useLayoutEffect, useRef, useState, type ReactPortal, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../icons/Icon";
import { LABELS } from "../labels";

export interface DiscardLabels { title: string; body: string; keep: string; drop: string }
const DEFAULT: DiscardLabels = { title: LABELS.discardTitle, body: LABELS.discardBody, keep: LABELS.discardKeep, drop: LABELS.discardDrop };

/**
 * 오버레이 입력 보호(사이트 ds.js 의 discardAsk 와 같음, 2026-11-23).
 * 입력을 시작하면 dirty — 배경 클릭으로 닫지 않고, request()(Esc · X · 취소)는 그 안에 '변경 사항을 버릴까요?' 줄을 띄운다.
 * 새 모달을 겹치지 않는다 — 버튼 줄(.popup-actions · .side-panel-footer) 바로 위에 위험 Notice 를 끼워 넣는다(화면 순서 = Tab 순서).
 */
export function useDiscardGuard(box: RefObject<HTMLElement | null>, onClose: () => void, enabled: boolean, labels: DiscardLabels = DEFAULT) {
  const dirty = useRef(false);
  const from = useRef<HTMLElement | null>(null);
  const keepBtn = useRef<HTMLButtonElement>(null);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (!slot) return;
    keepBtn.current?.focus();
    return () => slot.remove();
  }, [slot]);
  /** 입력이 시작됐다 — 오버레이 안 검색창은 거르는 것이지 입력이 아니라 빼다(사이트 ds.js 와 같음) */
  const mark = (e?: { target: EventTarget | null }) => {
    const t = e?.target as Element | null | undefined;
    if (t && typeof t.closest === "function" && t.closest(".searchbar")) return;
    dirty.current = true;
  };
  const keep = () => {
    setSlot(null);
    const b = box.current, f = from.current; from.current = null;
    if (f && b?.contains(f) && f.isConnected) f.focus();
    else {
      const first = b?.querySelector<HTMLElement>('input:not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]):not(.popup-close):not(.side-panel-close)');
      (first ?? b)?.focus();
    }
  };
  const drop = () => { setSlot(null); dirty.current = false; onClose(); };
  /** 지금 닫으면 물어야 하는가 */
  const asks = () => enabled && dirty.current;
  const request = () => {
    const b = box.current;
    if (!asks() || !b) { onClose(); return; }
    if (slot) { keep(); return; }   // 이미 떠 있으면 두 번째 Esc = 계속 편집
    from.current = b.contains(document.activeElement) ? (document.activeElement as HTMLElement) : null;
    const host = document.createElement("div");
    host.className = "notice danger discard-confirm";
    host.setAttribute("role", "alert");
    b.insertBefore(host, b.querySelector(":scope > .popup-actions, :scope > .side-panel-footer"));
    setSlot(host);
  };
  const portal: ReactPortal | null = slot
    ? createPortal(
        <>
          <span className="ico"><Icon name="alert-circle" size={20} filled /></span>
          <div>
            <b>{labels.title}</b>
            <span className="discard-body">{labels.body}</span>
            <div className="actions">
              <div className="btn-group">
                <button ref={keepBtn} type="button" className="btn sm outline assistive" data-discard="keep" onClick={keep}>{labels.keep}</button>
                <button type="button" className="btn sm outline assistive" data-discard="drop" onClick={drop}>{labels.drop}</button>
              </div>
            </div>
          </div>
        </>,
        slot,
      )
    : null;
  return { dirty, mark, asks, request, portal };
}
