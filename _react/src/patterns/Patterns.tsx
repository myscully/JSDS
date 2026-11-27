/* 패턴 페이지용 얇은 레이아웃 래퍼 — 사이트 style.css 의 패턴 클래스와 1:1 */
import { forwardRef, useRef, type ButtonHTMLAttributes, type FormHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";
import { mergeRefs } from "../utils/hooks";
import { useStuck } from "../utils/stuck";
import { Icon } from "../icons/Icon";
import { ICONS, type IconName } from "../icons/icons.data";
import { Indicator } from "../components/indicator/Indicator";
import { Notice, type NoticeProps } from "../components/notification/Notification";
import { Tag } from "../components/tag/Tag";
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
export interface FormActionsProps extends HTMLAttributes<HTMLDivElement> {
  /** 긴 폼에서 스크롤 영역 아래 끝에 붙는다(.form-actions.sticky, 2026-11-26). 폼 끝에 닿으면 제자리로 */
  sticky?: boolean;
}
/** 폼 하단 액션 (우측 정렬) */
export const FormActions = forwardRef<HTMLDivElement, FormActionsProps>(function FormActions({ sticky, className, ...rest }, ref) {
  const self = useRef<HTMLDivElement>(null);
  const stuck = useStuck(self, sticky);
  return <div ref={mergeRefs(ref, self)} className={cx("form-actions", { sticky, stuck }, className)} {...rest} />;
});

/** 툴바 가운데 여백 */
export const Spacer = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function Spacer({ className, ...rest }, ref) {
  return <span ref={ref} className={cx("spacer", className)} {...rest} />;
});

export interface PageHeadProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  /** 메타 (p.sub) */
  sub?: ReactNode;
  /** 우측 액션 — 3개까지 */
  actions?: ReactNode;
  /** 제목 위 Breadcrumb */
  breadcrumb?: ReactNode;
  /** 제목 태그. 페이지 제목은 h1 */
  as?: "h1" | "h2" | "h3";
}
/** 페이지 헤더: Breadcrumb | 제목·메타 | 액션 */
export const PageHead = forwardRef<HTMLDivElement, PageHeadProps>(function PageHead({ title, sub, actions, breadcrumb, as: Title = "h1", className, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("page-head", className)} {...rest}>
      {breadcrumb}
      <div>
        <Title className="title">{title}</Title>
        {sub !== undefined && <p className="sub">{sub}</p>}
      </div>
      {actions !== undefined && <div className="actions">{actions}</div>}
    </div>
  );
});

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  /** 입력 검증을 켠다 — 포커스가 떠날 때 필드 단위, 제출하면 막고 첫 오류로 이동. 오류는 각 필드 아래에만 보이고 폼 위 요약은 없다. 고치면 바로 지운다 */
  validate?: boolean;
  /** 기본 검증 문구 덮어쓰기 */
  messages?: ValidationMessages;
  /** 제출 때마다 결과 — 막혔을 때 onSubmit 은 불리지 않는다 */
  onValidate?: (result: FormValidationResult) => void;
  /** 카드 모양(면 · 테두리 · 패딩) 없이 — 카드 · Stepper 패널 안에 둘 때. 사이트는 class 없는 form[data-validate] */
  bare?: boolean;
}

/** form.form — 카드 형태의 폼 컨테이너 */
export const Form = forwardRef<HTMLFormElement, FormProps>(function Form({ className, bare, validate, messages, onValidate, noValidate, onBlur, onInput, onSubmit, children, ...rest }, ref) {
  const v = useFormValidation({ enabled: Boolean(validate), messages, onValidate });
  const setRef = (el: HTMLFormElement | null) => {
    v.form.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };
  return (
    <FormValidationContext.Provider value={validate ? { errors: v.errors, touch: v.touch, refresh: v.refresh } : null}>
      <form
        ref={setRef}
        className={cx(!bare && "form", className) || undefined}
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
        {children}
      </form>
    </FormValidationContext.Provider>
  );
});

export interface ErrorSummaryProps extends Omit<NoticeProps, "tone" | "title" | "children" | "icon" | "actions" | "onClose"> {
  /** 오류가 난 필드 이름 */
  items: ReactNode[];
  /** 오류 수. 기본은 items 수 */
  count?: number;
  /** 제목. 기본 '입력값 n개를 확인하세요' */
  title?: ReactNode;
}
let warnedSummary = false;
/** @deprecated 폼 위 오류 요약은 없앴다(사람의 결정 2026-11-16) — 오류는 필드 아래(TextField error)에, 필드에 붙일 수 없으면 Toast.
 *  제품의 서버 오류가 조용히 사라지지 않게 한 번 경고하고 위험 Notice 로 그린다(1.0 에서 지움 — MIGRATION) */
export const ErrorSummary = forwardRef<HTMLDivElement, ErrorSummaryProps>(function ErrorSummary({ items, count = items.length, title, className, ...rest }, ref) {
  if (process.env.NODE_ENV !== "production" && !warnedSummary) { warnedSummary = true; console.warn("[ds] ErrorSummary 는 없어졌습니다 — 오류는 필드 아래에, 필드에 붙일 수 없으면 Toast 로 알리세요. 1.0 에서 지웁니다."); }
  return (
    <Notice ref={ref} tone="danger" title={title ?? `입력값 ${count}개를 확인하세요`} className={className} {...rest}>
      {items.map((it, i) => (i ? [", ", it] : it))}
    </Notice>
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
          <b>{title}</b>
          {children !== undefined && <span>{children}</span>}
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
/** 유의사항 블록 — Notice(role=note) 위에 목록을 그린다. 아이콘은 message-2(경고면 경고 아이콘, 사람의 요청 2026-11-16). 사이트 마크업 `.notice[role=note] > .ico + div > b + ul` 과 같다 */
export const Notes = forwardRef<HTMLDivElement, NotesProps>(function Notes({ title, items, warning, role, ...rest }, ref) {
  return (
    <Notice ref={ref} tone={warning ? "warning" : undefined} icon={warning ? undefined : "message-2"} role={role ?? "note"} title={title} {...rest}>
      <ul>
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </Notice>
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
let sevCellWarned = false;
/** @deprecated 2026-11-11 에 없앴다(사람의 결정 — Tag 글자가 색을 나르므로 좌측 색 막대는 겹친 정보). 막대 없이 내용만 그린다. 심각도 칸은 Tag 하나로 */
export const SevCell = forwardRef<HTMLSpanElement, SevCellProps>(function SevCell({ tone: _tone, className, children, ...rest }, ref) {
  if (process.env.NODE_ENV !== "production" && !sevCellWarned) { sevCellWarned = true; console.warn("[ds-react] SevCell 은 없어졌습니다 — 심각도 칸은 Tag 하나로 씁니다(MIGRATION.md). 지금은 막대 없이 내용만 그립니다."); }
  return <span ref={ref} className={className} {...rest}>{children}</span>;
});

/** 약관 전체 동의 행 */
export const TermsAll = simple("all", "TermsAll");
export interface TermsItemProps extends HTMLAttributes<HTMLDivElement> {
  /** 필수 — Tag "필수" 와 `data-required`(사이트 ds.js 가 이것으로 남은 필수를 센다) */
  required?: boolean;
  /** 있으면 "보기" 버튼 */
  onView?: () => void;
  viewLabel?: ReactNode;
}
/** 약관 항목: 체크박스(children) + 필수/선택 + 보기 */
export const TermsItem = forwardRef<HTMLDivElement, TermsItemProps>(function TermsItem({ required, onView, viewLabel = "보기", className, children, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("item", className)} data-required={required ? "" : undefined} {...rest}>
      {children}
      <Tag tone={required ? "accent" : undefined} size="sm">{required ? "필수" : "선택"}</Tag>
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
