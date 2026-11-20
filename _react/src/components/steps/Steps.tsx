import { createContext, forwardRef, useContext, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type HTMLAttributes, type ReactNode, type RefObject } from "react";
import { cx } from "../../utils/cx";
import { Icon } from "../../icons/Icon";
import { Button, ButtonGroup, type ButtonProps } from "../button/Button";
import { LABELS } from "../../labels";
import { validationMessage } from "../text-field/validation";
import { useOptionalToast } from "../notification/Notification";

export type StepsLayout = "horizontal" | "label-below" | "vertical";

const warned = new Set<string>();
const warnOnce = (key: string, msg: string) => { if (process.env.NODE_ENV !== "production" && !warned.has(key)) { warned.add(key); console.warn(msg); } };
const useCountWarning = (n: number) => useEffect(() => { if (process.env.NODE_ENV !== "production" && (n < 3 || n > 6)) console.warn(`[ds-react] Steps 는 3~6단계입니다(지금 ${n}단계).`); }, [n]);

/* 단계 목록 — Steps(표시)와 Stepper(마법사)가 같이 쓴다. 사이트 ds.js 의 spPaint 와 같은 모양:
   완료 = 체크 + 숨긴 '(완료)', 현재 = aria-current, 누를 수 있는 단계만 .step-btn(현재는 버튼이 아니다) */
interface ListProps extends Omit<HTMLAttributes<HTMLOListElement>, "children"> {
  items: ReactNode[];
  current: number;
  layout: StepsLayout;
  isDone: (i: number) => boolean;
  clickable: (i: number) => boolean;
  onPick?: (i: number) => void;
  inner?: (i: number) => ReactNode;
}
/* 가로 · 라벨 아래 배치가 자리에 안 들어가면 .stacked 로 세로로 쌓는다(2026-11-13 — 사이트 ds.js fitSteps 와 같다).
   클래스를 뗀 모양에서 넘치는지 잰다. 부모 폭이 바뀔 때마다(ResizeObserver) 다시 잰다 — 목록 자신을 보면 쌓아서 높이가 바뀔 때도 불려 맴돈다 */
function useStacked(ol: RefObject<HTMLOListElement | null>, on: boolean, deps: unknown[]) {
  const [stacked, setStacked] = useState(false);
  useLayoutEffect(() => {
    const el = ol.current;
    if (!on || !el) { setStacked(false); return; }
    const fit = () => {
      el.classList.remove("stacked");
      const over = el.offsetParent !== null && el.scrollWidth > el.clientWidth + 1;
      if (over) el.classList.add("stacked");
      setStacked(over);
    };
    fit();
    const host = el.parentElement;
    if (!host || typeof ResizeObserver === "undefined") return;
    let w = host.clientWidth;
    const ro = new ResizeObserver(() => { if (host.clientWidth !== w) { w = host.clientWidth; fit(); } });
    ro.observe(host);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, ...deps]);
  return stacked;
}

const StepList = forwardRef<HTMLOListElement, ListProps>(function StepList({ items, current, layout, isDone, clickable, onPick, inner, className, ...rest }, ref) {
  const own = useRef<HTMLOListElement | null>(null);
  const stacked = useStacked(own, layout !== "vertical", [items.length, current]);
  const setRef = (el: HTMLOListElement | null) => { own.current = el; if (typeof ref === "function") ref(el); else if (ref) ref.current = el; };
  return (
    <ol ref={setRef} className={cx("steps", layout !== "horizontal" && layout, { stacked }, className)} {...rest}>
      {items.map((label, i) => {
        const on = i === current, done = isDone(i) && !on;
        const body = (
          <>
            <i>{done ? <Icon name="check" size={16} /> : i + 1}</i>
            <span className="label">{label}</span>
            {isDone(i) && <span className="sr-only"> (완료)</span>}
          </>
        );
        return (
          <li key={i} className={cx({ done: isDone(i), on })} aria-current={on ? "step" : undefined}>
            {!on && clickable(i) && onPick ? <button type="button" className="step-btn" onClick={() => onPick(i)}>{body}</button> : body}
            {inner?.(i)}
          </li>
        );
      })}
    </ol>
  );
});

export interface StepsProps extends Omit<HTMLAttributes<HTMLOListElement>, "children"> {
  /** 단계 라벨. 3~6개 */
  items: ReactNode[];
  /** 현재 단계 인덱스(0부터). 그 앞은 완료 */
  current: number;
  /** 배치 — 가로(기본, 연결선이 폭을 나눔) · 라벨 아래 · 세로 */
  layout?: StepsLayout;
  /** @deprecated layout="vertical" 을 쓴다 */
  vertical?: boolean;
  /** 주면 완료한 단계가 버튼이 되어 돌아갈 수 있다(nonLinear 면 현재가 아닌 모든 단계). 이동은 제품이 한다 */
  onStepClick?: (index: number) => void;
  /** 어느 단계든 누를 수 있다 — onStepClick 과 함께 */
  nonLinear?: boolean;
}
/** 진행 단계 표시 — 이동은 제품이 한다. 단계 이동 · 검사까지 맡기려면 Stepper */
export const Steps = forwardRef<HTMLOListElement, StepsProps>(function Steps({ items, current, layout, vertical, onStepClick, nonLinear, ...rest }, ref) {
  useCountWarning(items.length);
  if (vertical) warnOnce("vertical", "[ds-react] Steps vertical 은 layout=\"vertical\" 로 바뀌었습니다(MIGRATION.md).");
  return <StepList ref={ref} items={items} current={current} layout={layout ?? (vertical ? "vertical" : "horizontal")} isDone={(i) => i < current} clickable={(i) => nonLinear || i < current} onPick={onStepClick} {...rest} />;
});

export type StepTrigger = "next" | "prev" | "click" | "finish";

interface Ctx { current: number; last: number; act: (kind: "prev" | "next" | "finish") => void; labels: StepLabels; busy: boolean }
const StepperContext = createContext<Ctx | null>(null);
type StepLabels = Record<"prev" | "next" | "finish", string>;
const STEP_LABELS: StepLabels = { prev: LABELS.prev, next: LABELS.next, finish: LABELS.finish };

export interface StepperStep {
  label: ReactNode;
  /** 그 단계의 패널 내용. 안의 Form validate 를 '다음' · '완료' 가 검사한다 */
  content: ReactNode;
}
export interface StepperProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onChange"> {
  /** 3~6단계 */
  steps: StepperStep[];
  /** 제어형 현재 단계 */
  current?: number;
  /** 비제어 첫 단계(기본 0). 그 앞 단계는 완료로 시작한다 */
  defaultCurrent?: number;
  /** 단계를 옮길 때 — trigger 는 next · prev · click · finish(자유 이동의 완료가 막힌 단계로 옮김) */
  onStepChange?: (index: number, info: { from: number; trigger: StepTrigger }) => void;
  /** '완료' 가 검사를 통과하면. 저장 · 전송은 여기서 제품이 한다. async 면 Promise 를 돌려준다 */
  onFinish?: (index: number) => void | Promise<unknown>;
  /** 완료 처리 중 — onFinish 의 Promise 가 끝날 때까지 완료 버튼이 loading 이 되어 다시 눌리지 않는다. 던지면 그 문구(없으면 기본 문구)로 오류 Toast(ToastProvider 안에서). 사이트 .stepper[data-async] 와 같다 */
  async?: boolean;
  layout?: StepsLayout;
  /** 어느 단계든 눌러 옮긴다. 떠날 때 폼이 통과하면 완료로 표시하고, '완료' 는 모든 단계를 재서 막힌 첫 단계로 간다 */
  nonLinear?: boolean;
  /** 이전 · 다음 · 완료 버튼 줄(.step-actions)을 그린다. false 면 내용 안에 StepButton 을 직접 둔다 */
  actions?: boolean;
  labels?: Partial<StepLabels>;
  /** 단계 목록의 접근 이름. 기본 '진행 단계' */
  "aria-label"?: string;
}

/* 문구 없이 통과 여부만 — 사이트 spQuiet 과 같다 */
type Control = HTMLInputElement & HTMLTextAreaElement & HTMLSelectElement;
const quiet = (panel: HTMLElement | null) =>
  !panel || Array.from(panel.querySelectorAll<Control>("form[data-validate] [data-ds-field]")).every((el) => !(el.willValidate || el.hasAttribute("data-ds-choice")) || !validationMessage(el));

/** Steps 마법사 — 단계 패널 · 이전/다음/완료 · 단계별 폼 검사. 패널은 늘 그려 두고 숨겨서 입력값이 남는다 */
export const Stepper = forwardRef<HTMLDivElement, StepperProps>(function Stepper(
  { steps, current, defaultCurrent = 0, onStepChange, onFinish, async: isAsync, layout = "horizontal", nonLinear, actions = true, labels, "aria-label": ariaLabel = "진행 단계", className, ...rest }, ref) {
  useCountWarning(steps.length);
  const [inner, setInner] = useState(defaultCurrent);
  const cur = current ?? inner, last = steps.length - 1;
  const [done, setDone] = useState(() => new Set(Array.from({ length: current ?? defaultCurrent }, (_, i) => i)));
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const mode = useRef<"next" | "finish">("next");
  const focusPanel = useRef(false);
  const showAt = useRef(-1);
  const L = { ...STEP_LABELS, ...labels };
  const toast = useOptionalToast();
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  const mark = (i: number, on: boolean) => setDone((d) => { if (d.has(i) === on) return d; const n = new Set(d); on ? n.add(i) : n.delete(i); return n; });
  const go = (to: number, trigger: StepTrigger) => {
    if (to < 0 || to > last || to === cur) return;
    focusPanel.current = true;
    setInner(to);   // 제어형이면 current 가 이겨서 쓰이지 않는다
    onStepChange?.(to, { from: cur, trigger });
  };
  const leave = () => { if (nonLinear) mark(cur, quiet(panels.current[cur])); };
  const finish = () => {
    mark(cur, true);
    if (nonLinear) for (let i = 0; i <= last; i++) {
      if (i === cur || quiet(panels.current[i])) { mark(i, true); continue; }
      mark(i, false); showAt.current = i; go(i, "finish"); return;
    }
    if (!isAsync) { onFinish?.(cur); return; }
    if (busyRef.current) return;
    const result = onFinish?.(cur);
    if (!result || typeof (result as Promise<unknown>).then !== "function") return;
    busyRef.current = true; setBusy(true);
    (result as Promise<unknown>).then(undefined, (err: unknown) => {
      const message = err instanceof Error && err.message ? err.message : typeof err === "string" && err ? err : LABELS.stepFailed;
      if (toast) toast.show({ message, tone: "danger" }); else warnOnce("stepper-toast", "[ds-react] Stepper async 의 실패를 알리려면 <ToastProvider> 안에서 쓰세요.");
    }).finally(() => { busyRef.current = false; if (alive.current) setBusy(false); });
  };
  const passed = () => {
    if (mode.current === "finish" || cur === last) return finish();
    mark(cur, true); go(cur + 1, "next");
  };
  /* 검사는 패널 폼의 제출로 — Form validate 가 막으면 제출 이벤트가 패널까지 오지 않는다 */
  const check = (kind: "next" | "finish") => {
    mode.current = kind;
    const form = panels.current[cur]?.querySelector("form");
    if (form) form.requestSubmit(); else passed();
  };
  const act = (kind: "prev" | "next" | "finish") => { if (busyRef.current && kind !== "prev") return; if (kind === "prev") { leave(); go(cur - 1, "prev"); } else check(kind); };
  const onPanelSubmit = (e: FormEvent<HTMLDivElement>) => { e.preventDefault(); passed(); mode.current = "next"; };

  useEffect(() => {
    const p = panels.current[cur];
    if (focusPanel.current && p) {
      focusPanel.current = false;
      p.focus({ preventScroll: true });
      if (p.getBoundingClientRect().top < 0) p.scrollIntoView?.({ block: "start" });
    }
    if (showAt.current === cur) { showAt.current = -1; mode.current = "finish"; p?.querySelector("form")?.requestSubmit(); mode.current = "next"; }
  }, [cur]);

  const bar = <div className="step-actions"><ButtonGroup><StepButton step="prev" /><StepButton step="next" /><StepButton step="finish" /></ButtonGroup></div>;   // 나란한 버튼은 묶음(2026-11-18)
  const panel = (i: number) => (
    <div key={i} ref={(el) => { panels.current[i] = el; }} className="step-panel" tabIndex={-1} hidden={i !== cur} onSubmit={onPanelSubmit}>
      {steps[i].content}
      {layout === "vertical" && actions && bar}
    </div>
  );
  return (
    <StepperContext.Provider value={{ current: cur, last, act, labels: L, busy }}>
      <div ref={ref} className={cx("stepper", className)} data-nonlinear={nonLinear ? "" : undefined} {...rest}>
        <StepList aria-label={ariaLabel} items={steps.map((s) => s.label)} current={cur} layout={layout} isDone={(i) => done.has(i)} clickable={(i) => nonLinear || done.has(i)} onPick={(i) => { leave(); go(i, "click"); }} inner={layout === "vertical" ? panel : undefined} />
        {layout !== "vertical" && steps.map((_, i) => panel(i))}
        {layout !== "vertical" && actions && bar}
      </div>
    </StepperContext.Provider>
  );
});

export interface StepButtonProps extends Omit<ButtonProps, "onClick"> {
  step: "prev" | "next" | "finish";
}
/** Stepper 안의 이전 · 다음 · 완료 — 첫 단계의 이전은 꺼지고, 마지막 단계에서는 다음 대신 완료가 보인다 */
export const StepButton = forwardRef<HTMLButtonElement, StepButtonProps>(function StepButton({ step, children, ...rest }, ref) {
  const ctx = useContext(StepperContext);
  if (!ctx) { warnOnce("stepbutton", "[ds-react] StepButton 은 Stepper 안에서 씁니다."); return null; }
  const look: Partial<ButtonProps> = step === "prev" ? { variant: "outline", color: "assistive" } : {};
  return (
    <Button ref={ref} {...look} {...rest} data-step={step}
      disabled={step === "prev" ? ctx.current === 0 : rest.disabled}
      hidden={step === "next" ? ctx.current === ctx.last : step === "finish" ? ctx.current !== ctx.last : undefined}
      loading={step === "finish" && ctx.busy ? true : rest.loading}
      onClick={() => ctx.act(step)}>
      {children ?? ctx.labels[step]}
    </Button>
  );
});
