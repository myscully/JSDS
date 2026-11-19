import { forwardRef, useContext, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type DragEvent, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useId } from "../../utils/useId";
import { Icon } from "../../icons/Icon";
import { Button, ButtonGroup } from "../button/Button";
import { Progress } from "../loading/Loading";
import { FieldContext } from "../text-field/TextField";
import { FormValidationContext, VALIDATION_MESSAGES, type ValidationMessages } from "../text-field/validation";

export type UploadStatus = "ready" | "uploading" | "done" | "error";
export interface UploadItem {
  id: string;
  name: string;
  /** 바이트 */
  size?: number;
  status?: UploadStatus;
  /** 0~100 */
  progress?: number;
  /** status 가 error 일 때 문구. 기본 fileSend */
  error?: string;
}
export interface UploadAdded { id: string; file: File }

const DEFAULT_LABELS = { pick: "파일 선택", drop: "파일을 끌어다 놓거나", list: "첨부 파일", retry: "다시 시도", remove: "지우기", done: "완료", progress: "전송" };

export interface FileUploadProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** 제품이 갖는 파일 목록 — 전송 상태를 여기로 알린다 */
  items: UploadItem[];
  /** 검사를 통과한 파일. 전송은 제품이 한다 */
  onAdd: (files: UploadAdded[]) => void;
  /** 지우기 · 교체. 전송 중이면 제품이 취소한다 */
  onRemove?: (id: string) => void;
  /** 주면 전송 실패한 줄에 다시 시도가 나온다 */
  onRetry?: (id: string) => void;
  accept?: string;
  multiple?: boolean;
  /** 바이트 */
  maxSize?: number;
  /** multiple 일 때 상한 */
  maxFiles?: number;
  /** 버튼형 */
  compact?: boolean;
  disabled?: boolean;
  required?: boolean;
  messages?: ValidationMessages;
  labels?: Partial<typeof DEFAULT_LABELS>;
}

interface Rejected { id: string; name: string; size: number; error: string }

const sizeText = (n: number) => {
  if (n < 1024) return `${n} B`;
  const [unit, name] = n < 1048576 ? [1024, "KB"] : n < 1073741824 ? [1048576, "MB"] : [1073741824, "GB"];
  return `${Math.round((n / (unit as number)) * 10) / 10} ${name}`;
};
const sizeLabel = (n: number) => sizeText(n).replace(/ /, "").replace(/\.0(?=[A-Z])/, "");
const typeOk = (file: File, accept?: string) => {
  if (!accept) return true;
  const name = file.name.toLowerCase(), type = (file.type || "").toLowerCase();
  return accept.split(",").some((raw) => {
    const a = raw.trim().toLowerCase();
    if (!a) return false;
    if (a[0] === ".") return name.endsWith(a);
    return a.endsWith("/*") ? type.startsWith(a.slice(0, -1)) : type === a;
  });
};
const fill = (t: string, d: Record<string, unknown>) => t.replace(/\{(\w+)\}/g, (_, k) => String(d[k]));
let seq = 0;

/** 파일을 고르거나 끌어다 놓아 올린다. 화면 · 검증까지 맡고 전송은 제품이 한다 */
export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(function FileUpload(
  { items, onAdd, onRemove, onRetry, accept, multiple, maxSize, maxFiles, compact, disabled, required, messages, labels, id, className, ...rest },
  ref,
) {
  const field = useContext(FieldContext);
  const form = useContext(FormValidationContext);
  const autoId = useId(undefined, "upload");
  const pickId = id ?? field?.controlId ?? autoId;
  const root = useRef<HTMLDivElement>(null);
  const pick = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const showNext = useRef(false);
  const focusAfter = useRef<{ id: string | null } | null>(null);
  const [rejected, setRejected] = useState<Rejected[]>([]);
  const [dragging, setDragging] = useState(false);
  const [live, setLive] = useState("");
  useImperativeHandle(ref, () => root.current as HTMLDivElement);
  const m = { ...VALIDATION_MESSAGES, ...messages };
  const L = { ...DEFAULT_LABELS, ...labels };

  const rows = [...items.map((it) => ({ ...it, rejected: false })), ...rejected.map((r) => ({ ...r, status: "error" as UploadStatus, progress: undefined, rejected: true }))];
  const busy = items.some((it) => it.status === "uploading");
  const failed = rows.some((r) => r.status === "error");

  useEffect(() => { if (pick.current) form?.refresh(pick.current, showNext.current); showNext.current = false; }, [items, rejected]); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const f = focusAfter.current;
    if (!f) return;
    focusAfter.current = null;
    (f.id ? root.current?.querySelector<HTMLElement>(`[data-id="${f.id}"] .remove`) : pick.current)?.focus();
  }, [items, rejected]);

  const check = (file: File, base: UploadItem[], ok: UploadAdded[], limit: number) => {
    if (!typeOk(file, accept)) return fill(m.fileType, { types: (accept ?? "").split(",").map((a) => a.trim()).join(", ") });
    if (!file.size) return m.fileEmpty;
    if (maxSize && file.size > maxSize) return fill(m.fileSize, { max: sizeLabel(maxSize) });
    if (base.some((b) => b.name === file.name && b.size === file.size) || ok.some((o) => o.file.name === file.name && o.file.size === file.size)) return m.fileDuplicate;
    if (limit && base.length + ok.length >= limit) return fill(m.fileCount, { max: limit });
    return "";
  };
  const add = (files: File[]) => {
    if (disabled || !files.length) return;
    if (!multiple) items.forEach((it) => onRemove?.(it.id));
    const base = multiple ? items : [], limit = multiple ? maxFiles ?? 0 : 1, ok: UploadAdded[] = [], bad: Rejected[] = [];
    files.forEach((file) => {
      const error = check(file, base, ok, limit), rowId = `upload-${++seq}`;
      if (error) bad.push({ id: rowId, name: file.name, size: file.size, error });
      else ok.push({ id: rowId, file });
    });
    setRejected((prev) => [...(multiple ? prev : []), ...bad]);
    setLive([ok.length ? fill(m.fileAdded, { ok: ok.length }) : "", bad.length ? fill(m.fileRejected, { bad: bad.length }) : ""].filter(Boolean).join(" "));
    if (ok.length) onAdd(ok);
  };
  const remove = (rowId: string, name: string, isRejected: boolean) => {
    const i = rows.findIndex((r) => r.id === rowId), go = rows[i + 1] ?? rows[i - 1];
    focusAfter.current = { id: go?.id ?? null };
    showNext.current = !!required && rows.length === 1;
    if (isRejected) setRejected((prev) => prev.filter((r) => r.id !== rowId));
    else onRemove?.(rowId);
    setLive(fill(m.fileRemoved, { name }));
  };
  const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");
  const over = (e: DragEvent) => { if (disabled || !hasFiles(e)) return; e.preventDefault(); e.dataTransfer.dropEffect = "copy"; setDragging(true); };

  const labelled = field?.labelId ? `${field.labelId} ${pickId}` : undefined;
  const iconFor = (s?: UploadStatus) => (s === "done" ? "circle-check" : s === "error" ? "alert-circle" : "file") as "file";
  let body: ReactNode = null;
  if (rows.length) body = (
    <ul className="upload-list" aria-label={L.list}>
      {rows.map((r) => (
        <li key={r.id} className={cx("upload-item", r.status && r.status !== "ready" && r.status)} data-id={r.id} data-rejected={r.rejected ? "" : undefined}>
          <span className="ico"><Icon name={iconFor(r.status)} size={20} /></span>
          <div className="body">
            <div className="row">
              <span className="name">{r.name}</span>
              <span className="size">{r.size === undefined ? "" : sizeText(r.size)}</span>
              {r.status === "done" && <span className="sr-only"> ({L.done})</span>}
            </div>
            {r.status === "uploading" && <Progress size="sm" value={r.progress ?? 0} aria-label={`${r.name} ${L.progress}`} />}
            {r.status === "error" && <span className="msg">{r.error ?? m.fileSend}</span>}
          </div>
          {(() => {
            /* 다시 시도 + 지우기 = 나란한 버튼 둘이라 ButtonGroup(2026-11-18, 사이트 ds.js upState 와 같은 구조) */
            const rm = <Button key="remove" variant="text" color="assistive" size="sm" iconOnly className="remove" aria-label={`${r.name} ${L.remove}`} onClick={() => remove(r.id, r.name, r.rejected)}><Icon name="x" size={16} /></Button>;
            if (!(r.status === "error" && !r.rejected && onRetry)) return rm;
            return (
              <ButtonGroup>
                <Button variant="text" color="assistive" size="sm" iconOnly className="retry" aria-label={`${r.name} ${L.retry}`} onClick={() => { focusAfter.current = { id: r.id }; onRetry(r.id); }}><Icon name="refresh" size={16} /></Button>
                {rm}
              </ButtonGroup>
            );
          })()}
        </li>
      ))}
    </ul>
  );

  return (
    <div ref={root} className={cx("upload", compact && "compact", disabled && "disabled", dragging && "dragging", className)} {...rest}>
      <div
        className="upload-zone"
        onClick={(e) => { if (!disabled && !(e.target as Element).matches("input")) input.current?.click(); }}
        onDragEnter={over}
        onDragOver={over}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false); }}
        onDrop={(e) => { if (disabled || !hasFiles(e)) return; e.preventDefault(); setDragging(false); add(Array.from(e.dataTransfer.files)); }}
      >
        {!compact && <span className="ico"><Icon name="upload" size={24} /></span>}
        {!compact && <span className="upload-msg">{L.drop}</span>}
        <Button
          ref={pick}
          id={pickId}
          variant="outline"
          color="assistive"
          size="sm"
          className="upload-pick"
          disabled={disabled}
          aria-labelledby={labelled}
          aria-invalid={field?.error ? true : undefined}
          aria-describedby={field?.helpId}
          data-ds-field=""
          data-ds-choice=""
          data-ds-upload={busy ? "busy" : failed ? "failed" : ""}
          data-ds-required={required ? "" : undefined}
          data-ds-empty={rows.length ? undefined : ""}
        >
          {L.pick}
        </Button>
        <input ref={input} type="file" hidden accept={accept} multiple={multiple} disabled={disabled} onChange={(e) => { const list = Array.from(e.target.files ?? []); e.target.value = ""; add(list); }} />
      </div>
      <span className="sr-only upload-status" role="status">{live}</span>
      {body}
    </div>
  );
});
