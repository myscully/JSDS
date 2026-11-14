import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../../utils/cx";
import { useId } from "../../utils/useId";
import { useControllable } from "../../utils/useControllable";
import { announce } from "../../utils/copy";
import { Icon } from "../../icons/Icon";
import type { IconName } from "../../icons/icons.data";
import { SearchBar } from "../search/SearchBar";

/* Tree — 계층 목록(2026-11-14 사람의 결정: 탐색형 기본 + 체크박스 옵션 · 불러오기는 상태만 · 검색 필터 · 끌어 옮기기 없음).
   사이트 ds.js 의 .tree 와 같은 규칙: WAI-ARIA tree, roving tabindex, 탐색형은 Enter · Space · 클릭으로 고름(포커스만으로는 고르지 않음),
   체크박스형은 상위가 하위를 따라가고 일부만 켜지면 mixed, 끈 항목은 펼칠 수 있지만 고르거나 켤 수 없다 */

export interface TreeNode {
  /** 이벤트 · 상태에 쓰는 값 — 트리 안에서 하나뿐이어야 한다 */
  value: string;
  /** 보이는 이름 — 검색 · 글자로 찾기가 이 글자를 본다 */
  label: string;
  /** 아이콘 이름(16) */
  icon?: IconName;
  /** 행 끝 짧은 글자 — 인원 · 개수 · 끈 이유 */
  meta?: ReactNode;
  children?: TreeNode[];
  /** 펼칠 때 onLoad 로 하위를 불러온다 */
  lazy?: boolean;
  disabled?: boolean;
}
export const TREE_LABELS = { failed: "불러오지 못했습니다", failedStatus: "{label} 하위 항목을 불러오지 못했습니다. 다시 펼치면 다시 불러옵니다.", results: "결과 {n}개", empty: "검색 결과가 없습니다.", search: "검색" };
export type TreeLabels = typeof TREE_LABELS;
type Check = "true" | "false" | "mixed";

export interface TreeProps {
  items: TreeNode[];
  /** 트리 이름(aria-label) */
  label: string;
  /** 체크박스형 — 여러 개를 고른다 */
  checkable?: boolean;
  /** 탐색형에서 고른 값 */
  selected?: string | null;
  defaultSelected?: string | null;
  onSelect?: (value: string) => void;
  /** 펼친 항목의 값 */
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (values: string[], info: { value: string; expanded: boolean }) => void;
  /** 체크박스형에서 켠 값 — 하위가 있는 항목은 하위에서 계산하므로 잎(또는 아직 불러오지 않은 항목)의 값을 넣는다. onCheckedChange 가 돌려준 배열을 그대로 다시 넣으면 된다 */
  checked?: string[];
  defaultChecked?: string[];
  onCheckedChange?: (values: string[], info: { value: string; checked: boolean }) => void;
  /** lazy 항목을 펼칠 때 — 하위를 돌려주는 Promise. 실패하면 reject */
  onLoad?: (value: string) => Promise<TreeNode[]>;
  /** 트리 위 검색 필터 */
  searchable?: boolean;
  searchLabel?: string;
  searchPlaceholder?: string;
  labels?: Partial<TreeLabels>;
  className?: string;
  style?: CSSProperties;
}

const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
const cho = (s: string) => s.replace(/[가-힣]/g, (c) => CHO[Math.floor((c.charCodeAt(0) - 44032) / 588)]);

export function Tree({ items, label, checkable, selected, defaultSelected = null, onSelect, expanded, defaultExpanded = [], onExpandedChange, checked, defaultChecked = [], onCheckedChange, onLoad, searchable, searchLabel, searchPlaceholder, labels, className, style }: TreeProps) {
  const L = { ...TREE_LABELS, ...labels };
  const uid = useId();
  const [sel, setSel] = useControllable<string | null>({ value: selected, defaultValue: defaultSelected, onChange: (v) => { if (v != null) onSelect?.(v); } });
  const [exp, setExpRaw] = useControllable<string[]>({ value: expanded, defaultValue: defaultExpanded });
  const [chk, setChkRaw] = useControllable<string[]>({ value: checked, defaultValue: defaultChecked });
  const [loaded, setLoaded] = useState<Record<string, TreeNode[]>>({});
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const refs = useRef(new Map<string, HTMLLIElement>());
  const typed = useRef({ s: "", t: 0 });

  const kids = (n: TreeNode): TreeNode[] | undefined => n.children ?? loaded[n.value];
  const isParent = (n: TreeNode) => !!(kids(n)?.length || (n.lazy && !kids(n)));
  /* 체크 상태 — 하위가 있으면 하위에서, 없으면 켠 값 목록에서 */
  const chkSet = useMemo(() => new Set(chk), [chk]);
  const state = (n: TreeNode): Check => {
    const k = kids(n);
    if (!k?.length) return chkSet.has(n.value) ? "true" : "false";
    const s = k.map(state);
    return s.every((x) => x === "true") ? "true" : s.every((x) => x === "false") ? "false" : "mixed";
  };
  const walk = (ns: TreeNode[], f: (n: TreeNode) => void) => ns.forEach((n) => { f(n); const k = kids(n); if (k) walk(k, f); });

  /* 검색 — 맞는 항목과 그 상위만 보이고 펼친다(펼침 상태는 건드리지 않아 지우면 그대로 돌아온다) */
  const q = query.trim().toLowerCase();
  const search = useMemo(() => {
    if (!q) return null;
    const show = new Set<string>(), open = new Set<string>(), hits = new Set<string>();
    const jamo = /^[ㄱ-ㅎ]+$/.test(q);
    const visit = (n: TreeNode): boolean => {
      const lo = n.label.toLowerCase(), hit = lo.includes(q) || (jamo && cho(lo).includes(q));
      const k = kids(n) ?? [];
      const any = k.map(visit).some(Boolean);
      if (hit) hits.add(n.value);
      if (any) open.add(n.value);
      if (hit || any) show.add(n.value);
      return hit || any;
    };
    items.forEach(visit);
    return { show, open, hits };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, items, loaded]);
  const isOpen = (n: TreeNode) => (search ? search.open.has(n.value) : exp.includes(n.value));
  const isShown = (n: TreeNode) => !search || search.show.has(n.value);
  useEffect(() => { if (q) announce(search && search.hits.size ? L.results.replace("{n}", String(search.hits.size)) : L.empty); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  /* 보이는 항목 순서 — 키보드 이동 · Tab 칸 */
  const visible: { n: TreeNode; parent: TreeNode | null }[] = [];
  const flat = (ns: TreeNode[], parent: TreeNode | null) => ns.forEach((n) => { if (!isShown(n)) return; visible.push({ n, parent }); const k = kids(n); if (k && isOpen(n)) flat(k, n); });
  flat(items, null);
  const rove = visible.find((v) => v.n.value === focusKey) ?? visible.find((v) => v.n.value === sel) ?? visible[0];
  const focus = (v: string) => { setFocusKey(v); refs.current.get(v)?.focus(); };

  const setExpanded = (n: TreeNode, open: boolean) => {
    if (!isParent(n) || loading.has(n.value)) return;
    if (open && n.lazy && !kids(n)) { load(n); return; }
    if (exp.includes(n.value) === open) return;
    const next = open ? [...exp, n.value] : exp.filter((x) => x !== n.value);
    setExpRaw(next); onExpandedChange?.(next, { value: n.value, expanded: open });
  };
  const load = (n: TreeNode) => {
    if (!onLoad) return;
    setLoading((s) => new Set(s).add(n.value));
    setFailed((s) => { const x = new Set(s); x.delete(n.value); return x; });
    const parentOn = checkable && chkSet.has(n.value);
    onLoad(n.value).then((children) => {
      setLoaded((m) => ({ ...m, [n.value]: children }));
      setLoading((s) => { const x = new Set(s); x.delete(n.value); return x; });
      if (parentOn) { const add: string[] = []; const w = (cs: TreeNode[]) => cs.forEach((c) => { if (!c.disabled && !c.children?.length) add.push(c.value); if (c.children) w(c.children); }); w(children); setChkRaw([...chk.filter((x) => x !== n.value), ...add]); }
      const next = exp.includes(n.value) ? exp : [...exp, n.value];
      setExpRaw(next); onExpandedChange?.(next, { value: n.value, expanded: true });
    }, () => {
      setLoading((s) => { const x = new Set(s); x.delete(n.value); return x; });
      setFailed((s) => new Set(s).add(n.value));
      announce(L.failedStatus.replace("{label}", n.label));
    });
  };
  const toggleCheck = (n: TreeNode) => {
    if (n.disabled) return;
    const open: TreeNode[] = [];
    walk([n], (x) => { if (!x.disabled) open.push(x); });
    const full = open.filter((x) => !kids(x)?.length).every((x) => state(x) === "true"), next = !full;   // 상위 자신의 mixed 는 보지 않는다
    const s = new Set(chk);
    open.forEach((x) => { if (!kids(x)?.length) { if (next) s.add(x.value); else s.delete(x.value); } });
    const arr = [...s];
    setChkRaw(arr);
    /* 이벤트는 켜진 모든 항목(상위 포함) — 사이트 ds:tree-check 의 values 와 같다 */
    const on = new Set(arr), all: string[] = [];
    const st = (x: TreeNode): Check => { const k = kids(x); if (!k?.length) return on.has(x.value) ? "true" : "false"; const z = k.map(st); return z.every((y) => y === "true") ? "true" : z.every((y) => y === "false") ? "false" : "mixed"; };
    walk(items, (x) => { if (st(x) === "true") all.push(x.value); });
    onCheckedChange?.(all, { value: n.value, checked: next });
  };
  const choose = (n: TreeNode) => {
    focus(n.value);
    if (n.disabled) return;
    if (checkable) toggleCheck(n);
    else if (sel !== n.value) setSel(n.value);
  };

  const onKey = (e: KeyboardEvent<HTMLUListElement>) => {
    const li = e.target as HTMLElement;
    if (!li.classList.contains("tree-item") || e.ctrlKey || e.metaKey || e.altKey) return;
    const i = visible.findIndex((v) => refs.current.get(v.n.value) === li);
    if (i < 0) return;
    const { n, parent } = visible[i];
    let go: string | undefined;
    switch (e.key) {
      case "ArrowDown": go = visible[i + 1]?.n.value; break;
      case "ArrowUp": go = visible[i - 1]?.n.value; break;
      case "Home": go = visible[0]?.n.value; break;
      case "End": go = visible[visible.length - 1]?.n.value; break;
      case "ArrowRight": if (isParent(n) && !isOpen(n)) setExpanded(n, true); else if (isParent(n) && visible[i + 1]?.parent === n) go = visible[i + 1].n.value; break;
      case "ArrowLeft": if (isParent(n) && isOpen(n)) setExpanded(n, false); else go = parent?.value; break;
      case "Enter": case " ": choose(n); break;
      case "*": {
        const sibs = parent ? kids(parent) ?? [] : items;
        const add = sibs.filter((x) => isParent(x) && !(x.lazy && !kids(x)) && !exp.includes(x.value)).map((x) => x.value);
        if (add.length) { const next = [...exp, ...add]; setExpRaw(next); add.forEach((v) => onExpandedChange?.(next, { value: v, expanded: true })); }
        break;
      }
      default: {
        if (e.key.length !== 1) return;
        const t = typed.current, now = Date.now();
        if (now - t.t > 500) t.s = "";
        t.t = now; t.s += e.key.toLowerCase();
        const rep = t.s.split("").every((c) => c === t.s[0]), qq = rep ? t.s[0] : t.s, from = rep ? i + 1 : i;
        const hit = [...visible.slice(from), ...visible.slice(0, from)].find((v) => { const l = v.n.label.toLowerCase(); return l.startsWith(qq) || cho(l).startsWith(qq); });
        if (hit) { e.preventDefault(); focus(hit.n.value); }
        return;
      }
    }
    e.preventDefault();
    if (go) focus(go);
  };

  const mark = (n: TreeNode) => {
    const at = q ? n.label.toLowerCase().indexOf(q) : -1;
    if (at < 0) return n.label;
    return <>{n.label.slice(0, at)}<mark className="tree-hit">{n.label.slice(at, at + q.length)}</mark>{n.label.slice(at + q.length)}</>;
  };
  const render = (ns: TreeNode[], level: number): ReactNode => ns.map((n) => {
    const par = isParent(n), k = kids(n), open = par && isOpen(n), busy = loading.has(n.value), id = `${uid}-${n.value}`;
    return (
      <li key={n.value} ref={(el) => { if (el) refs.current.set(n.value, el); else refs.current.delete(n.value); }} className="tree-item" role="treeitem" aria-level={level}
        tabIndex={rove?.n.value === n.value ? 0 : -1} aria-expanded={par ? (busy ? false : open) : undefined} aria-labelledby={par ? id : undefined}
        data-lazy={n.lazy && !k ? "" : undefined} aria-selected={!checkable && sel === n.value ? true : undefined} aria-checked={checkable ? state(n) : undefined}
        aria-disabled={n.disabled ? true : undefined} aria-busy={busy ? true : undefined} data-value={n.value} hidden={!isShown(n) || undefined}
        onFocus={(e) => { if (e.target === e.currentTarget) setFocusKey(n.value); }}>
        <div className="tree-row" onClick={(e) => { if ((e.target as HTMLElement).closest(".tree-toggle") && par) { setExpanded(n, !open); focus(n.value); } else choose(n); }}>
          <span className="tree-toggle" aria-hidden="true">{par && <Icon name="chevron-right" size={16} />}{busy && <span className="spinner" aria-hidden="true" />}</span>
          {checkable && <span className="tree-check" aria-hidden="true" />}
          {n.icon && <Icon name={n.icon} size={16} />}
          <span className="tree-label" id={par ? id : undefined}>{mark(n)}</span>
          {n.meta != null && <span className="tree-meta">{n.meta}</span>}
          {failed.has(n.value) && <span className="tree-meta error">{L.failed}</span>}
        </div>
        {k && k.length > 0 && <ul className="tree-group" role="group" hidden={!open}>{render(k, level + 1)}</ul>}
      </li>
    );
  });

  const tree = (
    <ul className={cx("tree", { checkable }, !searchable && className)} role="tree" aria-label={label} aria-multiselectable={checkable || undefined} onKeyDown={onKey} style={searchable ? undefined : style}>
      {render(items, 1)}
    </ul>
  );
  if (!searchable) return tree;
  return (
    <div className={cx("tree-view", className)} style={style}>
      <SearchBar size="sm" value={query} onChange={setQuery} label={searchLabel ?? L.search} placeholder={searchPlaceholder}
        onKeyDown={(e) => { if (e.key === "ArrowDown" && visible[0]) { e.preventDefault(); focus(visible[0].n.value); } }} />
      {tree}
      {q && search && search.hits.size === 0 && <p className="tree-empty">{L.empty}</p>}
    </div>
  );
}
