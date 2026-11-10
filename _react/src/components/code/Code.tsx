import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import { CopyButton, type CopyLabels } from "../copy-field/CopyField";

export interface CodeBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "title" | "onCopy"> {
  /** 머리글이자 이름 — 키보드로 스크롤하는 영역과 복사 버튼의 이름이 된다 */
  title: string;
  /** 보여 줄 글자. 구문 강조는 하지 않는다 */
  children: string;
  /** 긴 줄을 줄바꿈 — 기본은 가로 스크롤 */
  wrap?: boolean;
  /** 넘으면 안에서 세로 스크롤 */
  maxHeight?: CSSProperties["maxHeight"];
  onCopy?: (ok: boolean) => void;
  labels?: CopyLabels;
}

/** 명령 · 설정 · 로그 원문 */
export const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(function CodeBlock({ title, children, wrap, maxHeight, onCopy, labels, className, ...rest }, ref) {
  return (
    <div ref={ref} className={cx("code-view", wrap && "wrap", className)} {...rest}>
      <div className="head">
        <span className="title">{title}</span>
        <CopyButton text={() => children} name={title} labels={labels} onCopy={onCopy} />
      </div>
      <pre tabIndex={0} aria-label={title} style={maxHeight === undefined ? undefined : { maxHeight }}><code>{children}</code></pre>
    </div>
  );
});

/** 문장 안의 경로 · 명령 */
export const InlineCode = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function InlineCode({ className, ...rest }, ref) {
  return <code ref={ref} className={cx("code-inline", className)} {...rest} />;
});
