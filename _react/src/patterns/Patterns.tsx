/* 패턴 페이지용 얇은 레이아웃 래퍼 — 사이트 style.css 의 패턴 클래스와 1:1 */
import { forwardRef, type ButtonHTMLAttributes, type FormHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";
import { Icon } from "../icons/Icon";
import { ICONS, type IconName } from "../icons/icons.data";
import { Indicator } from "../components/indicator/Indicator";
import { Notice } from "../components/notification/Notification";
import { FormValidationContext, useFormValidation, type FormValidationResult, type ValidationMessages } from "../components/text-field/validation";
import type { StatusTone, Tone } from "../types";

const simple = (cls: string, name: string) => {
  const C = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function Wrapper({ className, ...rest }, ref) {
    return <div ref={ref} className={cx(cls, className)} {...rest} />;
  });
  C.displayName = name;
  return C;
};

/** 세로 16px 간격 */
export const Stack = simple("stack", "Stack");
/** 1:1 2열 */
export const Row2 = simple("row-2", "Row2");
/** 2:1 2열 */
export const Row3 = simple("row-3", "Row3");
/** 검색·필터·액션 가로 배치 */
export const Toolbar = simple("toolbar", "Toolbar");
/** 온보딩 세로 중앙 컨테이너 */
export const Onboard = simple("onboard", "Onboard");
/** 상태 항목 그리드 */
export const StatusList = simple("status-list", "StatusList");
/** 약관 동의 컨테이너 */
export const Terms = simple("terms", "Terms");
/** 폼 섹션 제목 */
export const FormSection = simple("form-section", "FormSection");
/** 폼 2열 */
export const FormRow = simple("form-row", "FormRow");
/** 폼 하단 액션 (우측 정렬) */
export const FormActions = simple("form-actions", "FormActions");

/** 툴바 가운데 여백 */
export const Spacer = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function Spacer({ className, ...rest }, ref) {
  return <span ref={ref} className={cx("spacer", className)} {...rest} />;
});

export interface PageHeadProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  /** 메타 (p.sub) */
  sub?: ReactNode;
  /** 우측 액션 */
  actions?: ReactNode;
}
/** 페이지 헤더: 제목·메타 | 액션 */
export const PageHead = forwardRef<HTMLDivElement, PageHeadProps>(function PageHead({ title, sub, actions, className, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("page-head", className)} {...rest}>
      <div>
        <h2 className="title">{title}</h2>
        {sub !== undefined && <p className="sub">{sub}</p>}
      </div>
      {actions !== undefined && <div className="actions">{actions}</div>}
    </div>
  );
});

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  /** 입력 검증을 켠다 — 포커스가 떠날 때 필드 단위, 제출하면 막고 첫 오류로 이동, 오류 3개 이상이면 위에 요약. 고치면 바로 지운다 */
  validate?: boolean;
  /** 기본 검증 문구 덮어쓰기 */
  messages?: ValidationMessages;
  /** 제출 때마다 결과 — 막혔을 때 onSubmit 은 불리지 않는다 */
  onValidate?: (result: FormValidationResult) => void;
}

/** form.form — 카드 형태의 폼 컨테이너 */
export const Form = forwardRef<HTMLFormElement, FormProps>(function Form({ className, validate, messages, onValidate, noValidate, onBlur, onInput, onSubmit, children, ...rest }, ref) {
  const v = useFormValidation({ enabled: Boolean(validate), messages, onValidate });
  const setRef = (el: HTMLFormElement | null) => {
    v.form.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };
  return (
    <FormValidationContext.Provider value={validate ? { errors: v.errors, touch: v.touch } : null}>
      <form
        ref={setRef}
        className={cx("form", className)}
        data-validate={validate ? "" : undefined}
        noValidate={validate || noValidate}
        onBlur={(e) => { v.handleBlur(e); onBlur?.(e); }}
        onInput={(e) => { v.handleInput(e); onInput?.(e); }}
        onSubmit={(e) => {
          if (validate && !v.validateAll()) { e.preventDefault(); e.stopPropagation(); return; }
          onSubmit?.(e);
        }}
        {...rest}
      >
        {v.summary && <Notice tone="danger" title={`입력값 ${v.summary.count}개를 확인하세요`} data-form-summary="" style={{ marginBottom: -4 }}>{v.summary.labels}</Notice>}
        {children}
      </form>
    </FormValidationContext.Provider>
  );
});

/** 폼 위 '* 필수 항목' 범례 — 필수 입력이 있는 폼에 둔다 */
export const FormLegend = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(function FormLegend({ className, children = "필수 항목", ...rest }, ref) {
  return <p ref={ref} className={cx("form-legend", className)} {...rest}><em>*</em> {children}</p>;
});

export interface EmptyProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** 아이콘 이름 또는 노드 */
  icon?: IconName | ReactNode;
  title: ReactNode;
  /** 설명 (children) */
  children?: ReactNode;
  /** 액션 (Button 또는 ButtonGroup) */
  actions?: ReactNode;
  /** 패널 안 좁은 가로형 */
  compact?: boolean;
}
/** 빈 화면: 상태 + 다음 행동 */
export const Empty = forwardRef<HTMLDivElement, EmptyProps>(function Empty({ icon, title, children, actions, compact, className, ...rest }, ref) {
  const ico = typeof icon === "string" && icon in ICONS ? <Icon name={icon as IconName} size={24} /> : icon;
  return (
    <div ref={ref} className={cx("empty", { compact }, className)} {...rest}>
      {ico !== undefined && <span className="ico">{ico}</span>}
      {compact ? (
        <div>
          <b style={{ fontSize: 14 }}>{title}</b>
          {children !== undefined && <span style={{ display: "block" }}>{children}</span>}
        </div>
      ) : (
        <>
          <b>{title}</b>
          {children !== undefined && <span>{children}</span>}
        </>
      )}
      {actions}
    </div>
  );
});

export interface NotesProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  items: ReactNode[];
  /** 되돌리기 어려운 영향 */
  warning?: boolean;
}
/** 유의사항 블록 */
export const Notes = forwardRef<HTMLDivElement, NotesProps>(function Notes({ title, items, warning, className, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("notes", { warning }, className)} {...rest}>
      <b>{title}</b>
      <ul>
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  );
});

export interface StatusItemProps extends HTMLAttributes<HTMLDivElement> {
  tone?: StatusTone;
  /** 우측 보조 (가동률·시각) */
  meta?: ReactNode;
}
export const StatusItem = forwardRef<HTMLDivElement, StatusItemProps>(function StatusItem({ tone, meta, className, children, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("status-item", className)} {...rest}>
      <Indicator tone={tone}>{children}</Indicator>
      {meta !== undefined && <span className="meta">{meta}</span>}
    </div>
  );
});

export interface SevBandProps extends HTMLAttributes<HTMLDivElement> {
  segments: { tone: Tone; value: number; label?: string }[];
}
/** 심각도 분포 밴드 */
export const SevBand = forwardRef<HTMLDivElement, SevBandProps>(function SevBand({ segments, className, ...rest }, ref) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const aria = segments.map((s) => `${s.label ?? s.tone} ${Math.round((s.value / total) * 100)}%`).join(", ");
  return (
    <div ref={ref} className={cx("sev-band", className)} role="img" aria-label={aria} {...rest}>
      {segments.map((s, i) => <i key={i} className={s.tone} style={{ flex: s.value }} />)}
    </div>
  );
});

export interface SevCellProps extends HTMLAttributes<HTMLSpanElement> {
  /** 없으면 Info(회색) */
  tone?: Exclude<Tone, "ok" | "pending" | "accent">;
}
/** 좌측 색 막대 + 내용 (표 셀) */
export const SevCell = forwardRef<HTMLSpanElement, SevCellProps>(function SevCell({ tone, className, children, ...rest }, ref) {
  return (
    <span ref={ref} className={cx("sev-cell", className)} {...rest}>
      <i className={tone} />
      {children}
    </span>
  );
});

/** 약관 전체 동의 행 */
export const TermsAll = simple("all", "TermsAll");
export interface TermsItemProps extends HTMLAttributes<HTMLDivElement> {
  /** 필수 여부 표시 */
  required?: boolean;
  /** 있으면 "보기" 버튼 */
  onView?: () => void;
  viewLabel?: ReactNode;
}
/** 약관 항목: 체크박스(children) + 필수/선택 + 보기 */
export const TermsItem = forwardRef<HTMLDivElement, TermsItemProps>(function TermsItem({ required, onView, viewLabel = "보기", className, children, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("item", className)} {...rest}>
      {children}
      <span className={required ? "req" : "opt"}>{required ? "필수" : "선택"}</span>
      {onView && (
        <button type="button" className="view" onClick={onView}>
          {viewLabel}
        </button>
      )}
    </div>
  );
});
/** 약관 안내 문구 — 비어 있으면 CSS 가 숨긴다. 스크린 리더가 알 수 있게 문구가 없을 때도 그려 둔다 */
export const TermsMessage = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function TermsMessage({ className, ...rest }, ref) {
  return <div ref={ref} className={cx("msg", className)} aria-live="polite" {...rest} />;
});
export type { ButtonHTMLAttributes };
