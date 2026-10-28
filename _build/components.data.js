/* =========================================================
   components.data.js — 컴포넌트 상세(수는 세어 쓴다 — render.js 가 Object.keys 로)
   shape: { status, desc, css:[접두어…], thumb, anatomy:{demo,items}, examples:[{id,title,desc,html,react?,layout?,style?}],
            props:[[name, type, default, desc]], spec:[[k,v]], figma:{…} }
   - html 은 라이브 프리뷰와 "HTML+CSS" 탭에 그대로 쓰이고, react 가 없으면 htmlToJsx 로 자동 변환됩니다.
   - 규칙: onclick 등 인라인 핸들러 · <script> · href="#/…" 금지(링크는 href="#"). 색은 var(--*) 토큰만.
   ========================================================= */
/* 아이콘: icons.gen.js 의 I(name, size, {style}) — assets/icons 의 Tabler 아이콘을 빌드 시 인라인 */
const cb = (label, attrs = "", small = "") => `<label class="checkbox"><input type="checkbox"${attrs ? " " + attrs : ""}><span>${label}${small ? `<small>${small}</small>` : ""}</span></label>`;

/* 정적 달력 — ds.js 가 그리는 마크업과 같다(behave 가 대조한다). 정적 데모도 클릭 · 키보드 · 달 이동이 그대로 동작한다.
   React Calendar 도 같은 골격이다(site-consistency). opts: month "YYYY-MM", mode, value | start · end, today, min, max, footer, presets */
const cal = (o) => {
  const pad = (n) => String(n).padStart(2, "0"), fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, DOW = ["일", "월", "화", "수", "목", "금", "토"];
  const [y, m] = o.month.split("-").map(Number), mo = m - 1, off = new Date(y, mo, 1).getDay(), rows = Math.ceil((off + new Date(y, mo + 1, 0).getDate()) / 7);
  const a = o.value || o.start, b = o.end, title = `${y}년 ${m}월`, out = (k) => (o.min && k < o.min) || (o.max && k > o.max);
  const list = (o.footer || "").split(/\s+/).filter(Boolean), presets = (o.presets || "").split(/\s+/).filter(Boolean);
  const days = Array.from({ length: rows * 7 }, (_, i) => new Date(y, mo, i - off + 1));
  const target = [a, o.today].find((k) => k && days.some((d) => fmt(d) === k && d.getMonth() === mo)) || fmt(new Date(y, mo, 1));
  const cell = (d) => {
    const k = fmt(d), muted = d.getMonth() !== mo, on = !muted && (k === a || k === b), mid = !muted && b && k > a && k < b, today = k === o.today;
    const cls = ["day", muted && "muted", on && "on", on && b && k === a && "start", on && b && k === b && "end", mid && "in-range", today && "today"].filter(Boolean).join(" ");
    return `<button type="button" class="${cls}" role="gridcell" data-date="${k}" aria-label="${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${DOW[d.getDay()]}요일" tabindex="${k === target && !muted ? 0 : -1}"${out(k) ? ' aria-disabled="true"' : ""}${on || mid ? ' aria-selected="true"' : ""}${today ? ' aria-current="date"' : ""}>${d.getDate()}</button>`;
  };
  const weeks = Array.from({ length: rows }, (_, r) => `<div class="cal-week" role="row">${days.slice(r * 7, r * 7 + 7).map(cell).join("")}</div>`).join("\n    ");
  const btn = (cls, attr, label) => `<button type="button" class="btn sm ${cls}" ${attr}${attr === 'data-cal="apply"' ? " disabled" : ""}>${label}</button>`;   // 적용은 값이 바뀌어야 켜진다 — 정적 달력은 처음 값 그대로라 꺼져 있다
  const foot = [...presets.map((n) => btn("text", `data-preset="${n}"`, `최근 ${n}일`)), ...[["today", "text", "오늘"], ["reset", "text", "초기화"], ["cancel", "outline assistive", "취소"], ["apply", "solid primary", "적용"]].filter(([k]) => list.includes(k)).map(([k, c, l]) => btn(c, `data-cal="${k}"`, l))].join("");
  const data = [`data-mode="${o.mode || "single"}"`, o.mode === "range" ? `data-start="${a}" data-end="${b}"` : a ? `data-value="${a}"` : "", o.today && `data-today="${o.today}"`, o.min && `data-min="${o.min}"`, o.max && `data-max="${o.max}"`, `data-footer="${o.footer || "none"}"`, presets.length && `data-presets="${o.presets}"`].filter(Boolean).join(" ");
  return `<div class="calendar" role="group" aria-label="날짜 선택" ${data}>
  <div class="cal-head"><button type="button" class="cal-nav" data-nav="-1" aria-label="이전 달">${I("chevron-left", 16)}</button><button type="button" class="cal-title" aria-label="${title}, 연도 선택">${title}</button><button type="button" class="cal-nav" data-nav="1" aria-label="다음 달">${I("chevron-right", 16)}</button></div>
  <div class="cal-grid" role="grid" aria-label="${title}"${o.mode === "range" ? ' aria-multiselectable="true"' : ""}>
    <div class="cal-week" role="row">${DOW.map((d) => `<span class="dow" role="columnheader" aria-label="${d}요일">${d}</span>`).join("")}</div>
    ${weeks}
  </div>${foot ? `\n  <div class="cal-foot">${foot}</div>` : ""}
  <span class="sr-only" aria-live="polite"></span>
</div>`;
};

const COMPONENTS = {
  /* ------------------------------------------------ Button */
  "button": {
    status: "ready", react: ["Button","ButtonGroup"], css: [".btn", ".btn-group"],
    desc: "사용자의 의도를 명확하게 전달하고 행동을 유도합니다. 형태(Solid · Outline)와 색(Primary · Assistive · Negative)의 조합으로 우선순위를 구분합니다.",
    thumb: `<button type="button" class="btn md outline assistive">취소</button><button type="button" class="btn md solid primary">저장</button>`,
    examples: [
      { id: "default", title: "Default", desc: "Primary Solid 가 기본입니다(React 는 <code>variant</code> · <code>color</code> 를 생략하면 이것). 화면에서 가장 중요한 행동 하나에만 씁니다.", html: `<button type="button" class="btn md solid primary">정책 저장</button>` },
      { id: "variant", title: "Variant · Color", desc: "형태는 <b>Solid</b> 와 <b>Outline</b> 두 가지, 색은 <b>Primary</b>(기본) · <b>Assistive</b> · <b>Negative</b> 세 가지입니다. Negative 는 위험 · 경고성 행동에만 씁니다. 제품 메인 컬러가 상태색과 겹치면 제품 컬러가 쓰이는 곳이 모두 중립색으로 내려가, Primary 도 함께 바뀝니다(<a href=\"#/foundations/colors#neutral\">Colors › 중립 전환</a>).", html: `
        <div class="btn-group">
          <button type="button" class="btn md solid primary">Primary</button>
          <button type="button" class="btn md solid assistive">Assistive</button>
          <button type="button" class="btn md solid negative">Negative</button>
        </div>
        <div class="btn-group">
          <button type="button" class="btn md outline primary">Primary</button>
          <button type="button" class="btn md outline assistive">Assistive</button>
          <button type="button" class="btn md outline negative">Negative</button>
        </div>`, layout: "stack" },
      { id: "priority", title: "Priority", desc: "<b>Lv.4 Primary Solid</b> — 화면에서 가장 중요한 메인 행동을 유도 · 제안합니다. <b>Lv.3 Primary Outline</b> — 미리보기 · 임시 저장처럼 대체 행동을 제안합니다. <b>Lv.2 Assistive Solid</b> — 토글 버튼을 보조합니다. <b>Lv.1 Assistive Outline</b> — 닫기 · 취소 같은 보조 행동을 제시합니다. 삭제 · 탈퇴처럼 <b>되돌리기 어려운 행동</b>에는 우선순위와 별개로 Negative 를 씁니다.", html: `
        <div class="btn-group">
          <button type="button" class="btn md outline assistive">취소</button>
          <button type="button" class="btn md solid assistive">필터</button>
          <button type="button" class="btn md outline primary">미리보기</button>
          <button type="button" class="btn md solid primary">정책 저장</button>
        </div>
        <div class="btn-group">
          <button type="button" class="btn md outline assistive">취소</button>
          <button type="button" class="btn md solid negative">정책 삭제</button>
        </div>`, layout: "stack" },
      { id: "size", title: "Size", desc: "sm 32 · md 40 · lg 48. <b>높이는 고정</b>하고 너비는 라벨에 맞춰 자유롭게 씁니다. Text Field · Date Picker 필드도 같은 높이라 나란히 놓으면 맞습니다. 테이블 · 툴바 안에서는 sm, 폼 하단은 md, 온보딩 · 빈 화면은 lg.", html: `
        <button type="button" class="btn sm solid primary">Small</button>
        <button type="button" class="btn md solid primary">Medium</button>
        <button type="button" class="btn lg solid primary">Large</button>` },
      { id: "icon", title: "Icon", desc: "아이콘은 행동의 의미를 보완할 때만 선택적으로 넣습니다. 라벨의 왼쪽(iconLeft) 또는 오른쪽(iconRight)에 하나만 두고, <b>양쪽에 동시에 두는 것은 지양</b>합니다. 아이콘 크기는 버튼 크기를 따릅니다 — sm 16 · md 18 · lg 20.", html: `
        <button type="button" class="btn md solid primary">${I("plus")}정책 추가</button>
        <button type="button" class="btn md outline assistive">${I("download")}내보내기</button>
        <button type="button" class="btn md outline primary">다음 단계${I("chevron-right")}</button>` },
      { id: "icon-only", title: "Icon only", desc: "누구나 즉시 이해할 수 있는 보편적인 아이콘으로 <b>의미가 명확히 전달될 때만</b> 라벨 없이 씁니다. <code>.icon-only</code>(React <code>iconOnly</code>)와 <code>aria-label</code> 을 함께 둡니다. 형태를 주지 않으면 <b>배경이 없고 hover · pressed 에만 면</b>이 나타납니다(첫 줄). Solid · Outline 을 주면 그 면을 가진 정사각 버튼이 됩니다(둘째 줄).", html: `
        <div class="btn-group">
          <button type="button" class="btn md primary icon-only" aria-label="추가">${I("plus")}</button>
          <button type="button" class="btn md assistive icon-only" aria-label="새로 고침">${I("refresh")}</button>
          <button type="button" class="btn md negative icon-only" aria-label="삭제">${I("trash")}</button>
        </div>
        <div class="btn-group">
          <button type="button" class="btn sm outline assistive icon-only" aria-label="더 보기">${I("dots")}</button>
          <button type="button" class="btn md outline assistive icon-only" aria-label="더 보기">${I("dots")}</button>
          <button type="button" class="btn lg solid primary icon-only" aria-label="설정">${I("settings")}</button>
        </div>`, layout: "stack" },
      { id: "state", title: "State", desc: "상태는 <b>Normal · Hover · Pressed · Disabled</b> 네 가지입니다. Hover 와 Pressed 는 CSS 가 처리합니다 — 면은 기준 단계에서 <b>글자색 반대 방향</b>으로 한 단계 · 두 단계 갑니다. 마우스를 올리고 눌러 보세요. Disabled 는 아래에서 따로 다룹니다.", html: `
        <button type="button" class="btn md solid primary">Normal</button>
        <button type="button" class="btn md outline primary">Normal</button>
        <button type="button" class="btn md solid assistive">Normal</button>
        <button type="button" class="btn md outline assistive">Normal</button>` },
      { id: "disabled", title: "Disabled", desc: "<code>disabled</code> 옵션으로 비활성을 표시합니다. 투명도를 덮지 않고 <b>전용 토큰</b>을 씁니다 — Solid 는 회색 면(<code>--surface-disable-primary</code>) + 회색 라벨(<code>--foreground-disable-primary</code>), Outline 은 면을 비우고 보더만 회색, 배경 없는 아이콘 전용 · Text 는 라벨만 회색입니다. 그래서 어떤 색이든 비활성은 한 가지 회색으로 읽힙니다. 비활성 요소는 탭 순서에서 빠지므로, 막는 대신 <b>왜 누를 수 없는지 알려주는 쪽</b>을 먼저 검토하세요. 링크는 <code>disabled</code> 를 가질 수 없어 <code>aria-disabled=\"true\"</code> 를 씁니다.", html: `
        <div class="btn-group">
          <button type="button" class="btn md solid primary" disabled>Primary</button>
          <button type="button" class="btn md solid assistive" disabled>Assistive</button>
          <button type="button" class="btn md solid negative" disabled>Negative</button>
        </div>
        <div class="btn-group">
          <button type="button" class="btn md outline primary" disabled>Primary</button>
          <button type="button" class="btn md outline assistive" disabled>Assistive</button>
          <button type="button" class="btn md outline negative" disabled>Negative</button>
          <button type="button" class="btn md assistive icon-only" aria-label="새로 고침" disabled>${I("refresh")}</button>
        </div>`, layout: "stack" },
      { id: "loading", title: "Loading", desc: "파일 업로드 · 전송 · 저장처럼 <b>잠깐 기다리는 상태</b>를 버튼 안에서 간단히 보여줄 때 씁니다. <code>.loading</code>(React <code>loading</code>)으로 켜고 <code>aria-busy=\"true\"</code> 를 함께 둡니다. <b>disabled 와 다르게</b> 포커스는 남고, <code>click</code> · <code>mousedown</code> · <code>pointerdown</code> · <code>keydown</code> 이벤트 실행을 막습니다 — 버튼 뒤의 행 · 카드로도 전달되지 않습니다. 이동 키(Tab · Esc · 화살표 · Home/End · PageUp/Down)와 단축키(Ctrl · ⌘ · Alt 조합)는 막지 않아 포커스를 옮기거나 팝업을 닫을 수 있습니다. 라벨은 자리만 지켜 폭이 흔들리지 않습니다. 로딩 중 페이지를 이탈하면 동작이 중단되므로, 긴 작업은 진행 표시와 함께 별도 화면에서 다룹니다.", html: `
        <button type="button" class="btn md solid primary loading" aria-busy="true">저장 중</button>
        <button type="button" class="btn md outline assistive loading" aria-busy="true">불러오는 중</button>
        <button type="button" class="btn md solid negative loading" aria-busy="true">삭제 중</button>` },
      { id: "text", title: "Text", desc: "Solid · Outline 정의 밖의 변형입니다. 카드 머리의 '전체 보기', 달력 하단의 '오늘 · 초기화'처럼 <b>문장 속 링크에 가까운 가벼운 행동</b>에만 씁니다. 색은 Primary 하나이고 좌우 여백이 8 로 좁습니다. 취소 · 닫기에는 Assistive Outline 을 씁니다.", html: `
        <button type="button" class="btn sm text">전체 보기</button>
        <button type="button" class="btn md text">초기화</button>` },
      { id: "placement", title: "Placement", desc: "메인과 서브가 분명히 다른 버튼을 <b>수평</b>으로 놓으면 유도 목적이 분명한 버튼을 <b>오른쪽</b>에(<code>.btn-group</code>, 폼 하단은 <code>.end</code>), <b>수직</b>으로 놓으면 <b>위</b>에 둡니다(<code>.btn-group.vertical</code> — 같은 폭으로 늘어납니다). 버튼 사이는 수평 12 · 수직 8. 전체 폭 하나는 <code>.block</code>.", html: `
        <div class="btn-group end">
          <button type="button" class="btn md outline assistive">취소</button>
          <button type="button" class="btn md outline primary">임시 저장</button>
          <button type="button" class="btn md solid primary">정책 저장</button>
        </div>
        <div class="btn-group vertical" style="width:320px">
          <button type="button" class="btn lg solid primary">시작하기</button>
          <button type="button" class="btn lg outline assistive">나중에 하기</button>
        </div>`, layout: "stack center" },
    ],
    props: [
      ["variant", "solid | outline | text", "solid", "형태. Solid 는 면을 채우고 Outline 은 면을 비우고 보더를 둡니다. <code>text</code> 는 정의 밖 변형(색은 primary 만). 아이콘 전용에서 생략하면 배경 없음"],
      ["color", "primary | assistive | negative", "primary", "색. assistive 는 보조 행동, negative 는 삭제 · 탈퇴처럼 되돌리기 어려운 행동"],
      ["size", "sm | md | lg", "md", "높이 32 / 40 / 48 고정 · 너비 자유"],
      [".icon-only", "boolean", "false", "아이콘 전용 정사각 버튼(React <code>iconOnly</code>). aria-label 필수. 형태를 주지 않으면 배경 없음 · hover 에만 면"],
      [".btn svg", "element", "—", "라벨 왼쪽 또는 오른쪽에 하나만(React <code>iconLeft</code> / <code>iconRight</code>), 양쪽 동시는 지양. 크기는 sm 16 · md 18 · lg 20"],
      [".loading", "boolean", "false", "스피너만 보이고 라벨은 자리만 지킵니다. <code>aria-busy=\"true\"</code> 를 함께 두고, disabled 와 달리 포커스는 남은 채 click · mousedown · pointerdown · keydown 을 막습니다(이동 키 · 단축키는 통과)"],
      ["disabled", "attribute", "—", "비활성. 전용 토큰 — Solid 는 <code>--surface-disable-primary</code> 면 + <code>--foreground-disable-primary</code> 라벨, Outline 은 면을 비우고 보더만 회색. 투명도를 덮지 않아 색마다 다른 회색이 남지 않습니다"],
      [".block", "boolean", "false", "전체 폭"],
      [".btn-group", "container", "—", "버튼 묶음 — 수평 12px 간격, 주 행동이 오른쪽. 폼 하단 우측 정렬은 <code>.end</code>, 수직은 <code>.vertical</code>(주 행동이 위, 8px)"],
      ["a.btn", "element", "—", "링크를 버튼 모양으로 쓸 때(React <code>as</code>). 이동이면 <code>a</code>, 실행이면 <code>button</code>. 링크는 <code>disabled</code> 속성을 가질 수 없어 비활성은 <code>aria-disabled=\"true\"</code> 로 — React <code>disabled</code> 가 그 속성과 클릭 차단을 함께 처리합니다"],
      ["type", "button | submit | reset", "button", "폼 안에서는 명시"],
    ],
    spec: [["Priority", "Lv.4 Primary Solid · Lv.3 Primary Outline · Lv.2 Assistive Solid · Lv.1 Assistive Outline · 되돌리기 어려운 행동은 Negative"], ["State", "Normal → Hover → Pressed 로 <b>라이트는 어두워지고 다크는 밝아집니다</b>. Solid primary <code>--surface-brand-primary</code> → <code>-strong</code> → <code>-heavy</code>(라이트 brand 50·45·40 · 다크 50·55·60) · Solid assistive <code>--surface-neutral-tertiary</code> → <code>-secondary</code> → <code>-strong</code> · Solid negative <code>--surface-negative-primary</code> → <code>-strong</code> → <code>-heavy</code>. Outline 은 면이 투명에서 출발 — primary <code>--surface-brand-subtle</code> → <code>-subtle-strong</code>, assistive <code>--surface-neutral-secondary</code> → <code>-strong</code>, negative <code>--surface-negative-hover</code> → <code>-pressed</code>. 틴트는 알파가 커지는 구조라 같은 토큰이 테마에 따라 방향을 뒤집고, 불투명 primary 는 두 테마 모두 제품 HEX(50)에서 출발해 테마별로 반대 방향 단계를 집습니다. Disabled 는 전용 토큰. 키보드 포커스는 상태가 아니라 전 변형 공통 <code>--foreground-brand-primary</code> 1px 외곽선(2px 띄움)"], ["Size", "sm 32 · md 40 · lg 48 (높이 고정)"], ["Container", "radius/md 6 · 좌우 padding 14 / 20 / 26 (text 변형은 8 고정 · 아이콘 전용은 정사각)"], ["Label", "14 SemiBold (sm 12 · lg 16) · 동사로 시작"], ["Placement", "수평은 주 행동이 오른쪽 · 수직은 주 행동이 위 · Lv.4 는 화면당 하나"]],
    figma: { frame: "Button", radius: "radius/md", sizes: { sm: { h: 32, px: 14, fs: 12 }, md: { h: 40, px: 20, fs: 14 }, lg: { h: 48, px: 26, fs: 16 } }, iconSize: { sm: 16, md: 18, lg: 20 }, variants: { "solid primary": { bg: "--surface-brand-primary", fg: "--brand-label" }, "outline primary": { bg: "transparent", fg: "--foreground-brand-primary", stroke: "--line-brand-primary" }, "solid assistive": { bg: "--surface-neutral-tertiary", fg: "--foreground-neutral-primary" }, "outline assistive": { bg: "transparent", fg: "--foreground-neutral-primary", stroke: "--line-neutral-primary" }, "solid negative": { bg: "--surface-negative-primary", fg: "--foreground-negative-strong" }, "outline negative": { bg: "transparent", fg: "--foreground-negative-strong", stroke: "--line-negative-primary" }, text: { bg: "transparent", fg: "--foreground-brand-primary" }, "plain primary": { bg: "transparent", fg: "--foreground-brand-primary" }, "plain assistive": { bg: "transparent", fg: "--foreground-neutral-secondary" }, "plain negative": { bg: "transparent", fg: "--foreground-negative-strong" } }, states: ["normal", "hover", "pressed", "disabled"], loading: true, disabled: { bg: "--surface-disable-primary", fg: "--foreground-disable-primary", outlineBg: "transparent", outlineStroke: "--surface-disable-primary" } },
  },

  /* ------------------------------------------------ Text Field */
  "text-field": {
    status: "ready", react: ["Field","TextField","TextArea"], css: [".field"],
    desc: "한 줄 텍스트를 입력합니다. 라벨·도움말·오류 메시지가 하나의 필드 단위로 묶입니다.",
    thumb: `<div class="field" style="min-width:200px"><label>정책 이름</label><input placeholder="예: USB 차단"></div>`,
    examples: [
      { id: "basic", title: "Default / Error", desc: "오류 시 .error 를 필드에 붙이고 help 를 오류 메시지로 바꿉니다. 원인과 해결 방법을 함께 씁니다.", html: `
        <div class="field"><label for="ip1">허용 IP</label><input id="ip1" value="10.0.0.12"><span class="help">IPv4 형식</span></div>
        <div class="field error"><label for="ip2">허용 IP</label><input id="ip2" value="10.0.0" aria-invalid="true" aria-describedby="ip2-err"><span class="help" id="ip2-err">올바른 IPv4 형식이 아닙니다. 예: 10.0.0.12</span></div>` },
      { id: "size", title: "Size", desc: "sm 32 · md 40 · lg 48. 버튼과 같은 높이로 나란히 배치합니다.", html: `
        <div class="field sm"><label>Small</label><input placeholder="32px"></div>
        <div class="field"><label>Medium</label><input placeholder="40px"></div>
        <div class="field lg"><label>Large</label><input placeholder="48px"></div>`, layout: "top" },
      { id: "affix", title: "Prefix / Suffix / Counter", desc: "단위·접두어는 .affix 컨테이너 안에 span 으로. 글자 수 제한은 .counter.", html: `
        <div class="field"><label>보관 기간</label><div class="affix"><input value="90"><span>일</span></div></div>
        <div class="field"><label>관리 콘솔 주소</label><div class="affix"><span>https://</span><input placeholder="console.example.com"></div></div>
        <div class="field"><div class="row"><label>설명</label><span class="counter">12 / 80</span></div><input value="외부 저장장치 차단 정책" maxlength="80"></div>` },
      { id: "textarea", title: "Textarea", desc: "여러 줄 입력. 높이는 세로 리사이즈 허용, 최소 96px.", html: `
        <div class="field" style="min-width:420px"><label for="memo">메모</label><textarea id="memo" placeholder="정책 변경 사유를 남겨 주세요"></textarea><span class="help">감사 로그에 기록됩니다</span></div>` },
      { id: "state", title: "Disabled / Read-only", desc: "Disabled 는 값을 바꿀 수도 복사할 수도 없을 때, Read-only 는 참조만 할 때.", html: `
        <div class="field"><label>정책 ID</label><input value="POL-2041" readonly><span class="help">자동 생성</span></div>
        <div class="field"><label>생성자</label><input value="admin@jiran.com" disabled></div>` },
    ],
    props: [
      [".field", "container", "—", "label + input(+ .help) 묶음. 폼 안에서 min-width 해제"],
      ["size", "sm | (md) | lg", "md", "입력 높이 32 / 40 / 48"],
      [".error", "boolean", "false", "보더 danger, help 를 오류 메시지로. input 에 aria-invalid. 포커스 때는 빨강 가장자리 + --line-negative-focus 후광"],
      [".affix", "wrapper", "—", "접두어/접미어 span 과 input 을 감싸는 컨테이너"],
      [".counter", "element", "—", "글자 수 표시. .row 안에서 라벨 우측 정렬"],
      ["disabled / readonly", "attribute", "—", "비활성 / 읽기 전용(배경 subtle)"],
    ],
    spec: [["Size", "sm 32 · md 40 · lg 48"], ["Container", "radius/md 6 · line/neutral/primary 1px · 포커스: 테두리 1px foreground/brand/primary · 바깥 4px line/brand/focus · 오류일 때는 foreground/negative/primary · line/negative/focus"], ["Label", "라벨 14 SemiBold · 입력 Body/2 14 · 필수는 em(*)"], ["Placement", "라벨은 필드 위, 도움말은 아래. 좌우 여백 14"]],
    figma: { frame: "Text Field", radius: "radius/md", sizes: { sm: { h: 32 }, md: { h: 40 }, lg: { h: 48 } }, variants: { default: { bg: "--surface-elevated-primary", stroke: "--line-neutral-primary" }, focused: { stroke: "--foreground-brand-primary", ring: "--line-brand-focus" }, error: { stroke: "--foreground-negative-primary", focused: { stroke: "--foreground-negative-primary", ring: "--line-negative-focus" } } }, states: ["default", "hover", "focused", "error", "error focused", "disabled", "readonly"] },
  },

  /* ------------------------------------------------ Search */
  "search": {
    status: "ready", react: ["SearchBar"], css: [".searchbar", ".chip", ".chip-group"],
    desc: "목록·로그를 빠르게 필터링하는 검색 입력입니다. 입력 즉시 결과가 바뀌는 '필터형'과 Enter 로 조회하는 '조회형'을 구분합니다.",
    thumb: `<div class="searchbar" style="min-width:220px">${I("search")}<input placeholder="검색"></div>`,
    examples: [
      { id: "basic", title: "Default", desc: "아이콘 + 입력. 플레이스홀더에는 검색 대상을 씁니다.", html: `
        <div class="searchbar" role="search">${I("search")}<input type="search" placeholder="정책 이름 검색" aria-label="정책 검색"></div>` },
      { id: "extras", title: "Shortcut / Clear", desc: "전역 검색에는 단축키(kbd)를, 값이 있을 때는 지우기 버튼을 보여줍니다.", html: `
        <div class="searchbar" role="search">${I("search")}<input type="search" placeholder="이벤트, 대상, IP 검색" aria-label="검색"><kbd>/</kbd></div>
        <div class="searchbar" role="search">${I("search")}<input type="search" value="랜섬웨어" aria-label="검색"><button type="button" class="clear" aria-label="지우기">${I("x",12)}</button></div>` },
      { id: "large", title: "Large / Block", desc: "빈 화면·온보딩처럼 검색이 화면의 주된 행동일 때 lg + block.", html: `
        <div class="searchbar lg block" role="search" style="max-width:560px">${I("search")}<input type="search" placeholder="어떤 정책을 찾으시나요?" aria-label="검색"></div>` },
      { id: "filters", title: "With Filters", desc: "검색 + 필터 칩 조합. 선택된 칩(.on)은 결과 수와 함께 보여줍니다.", html: `
        <div style="display:flex;flex-direction:column;gap:12px;width:100%;max-width:720px">
          <div class="searchbar block" role="search">${I("search")}<input type="search" placeholder="로그 검색" aria-label="로그 검색"></div>
          <div class="chip-group">
            <button type="button" class="chip on" aria-pressed="true">Critical</button>
            <button type="button" class="chip on" aria-pressed="true">High</button>
            <button type="button" class="chip" aria-pressed="false">Medium</button>
            <button type="button" class="chip" aria-pressed="false">Low</button>
            <button type="button" class="chip" aria-pressed="false">최근 24시간</button>
          </div>
        </div>`, layout: "left" },
    ],
    props: [
      [".searchbar", "container", "—", "svg + input(+ kbd / .clear). role=search"],
      ["size", "(md) | lg", "md", "높이 40 / 48"],
      ["kbd", "element", "—", "단축키 표시(전역 검색)"],
      [".clear", "button", "—", "값 지우기. 값이 있을 때만 렌더"],
    ],
    spec: [["Size", "높이 40 (lg 48) · 최소 폭 280"], ["Container", "radius/md 6 · line/neutral/primary · 포커스: 테두리 1px foreground/brand/primary · 바깥 4px line/brand/focus"], ["Label", "Body/2 14 · 플레이스홀더 foreground/disable/primary"], ["Placement", "테이블 툴바 좌측, 전역 검색은 헤더 우측"]],
    figma: { frame: "Search", radius: "radius/md", sizes: { md: { h: 40 }, lg: { h: 48 } }, variants: { default: { bg: "--surface-elevated-primary", stroke: "--line-neutral-primary" }, focused: { stroke: "--foreground-brand-primary", ring: "--line-brand-focus" } }, states: ["default", "focused", "filled"] },
  },

  /* ------------------------------------------------ Select Button */
  "select-button": {
    status: "ready", react: ["SelectButton"], css: [".select-btn"],
    desc: "2~5개 옵션 중 하나를 고르는 세그먼트 컨트롤입니다. 뷰 전환(목록/카드), 기간(24시간/7일/30일)처럼 즉시 반영되는 선택에 씁니다.",
    thumb: `<div class="select-btn"><button class="on">24시간</button><button>7일</button><button>30일</button></div>`,
    examples: [
      { id: "basic", title: "Default", desc: "선택된 항목에 .on. 컨테이너에 role=group, 버튼에 aria-pressed.", html: `
        <div class="select-btn" role="group" aria-label="기간">
          <button type="button" class="on" aria-pressed="true">24시간</button>
          <button type="button" aria-pressed="false">7일</button>
          <button type="button" aria-pressed="false">30일</button>
        </div>`, react: `
        import { useState } from "react";
        const OPTIONS = ["24시간", "7일", "30일"];
        export function PeriodSelect() {
          const [value, setValue] = useState(OPTIONS[0]);
          return (
            <div className="select-btn" role="group" aria-label="기간">
              {OPTIONS.map(o => (
                <button key={o} type="button" className={o === value ? "on" : ""} aria-pressed={o === value} onClick={() => setValue(o)}>{o}</button>
              ))}
            </div>
          );
        }` },
      { id: "outline", title: "Outline", desc: "툴바에서 다른 버튼과 나란히 둘 때 아웃라인형.", html: `
        <div class="select-btn outline" role="group" aria-label="보기">
          <button type="button" class="on" aria-pressed="true">${I("list")}목록</button>
          <button type="button" aria-pressed="false">${I("chart-bar")}차트</button>
        </div>` },
      { id: "disabled", title: "Disabled", desc: "개별 옵션 비활성.", html: `
        <div class="select-btn" role="group">
          <button type="button" class="on" aria-pressed="true">전체</button>
          <button type="button" aria-pressed="false">차단</button>
          <button type="button" aria-pressed="false" disabled>허용</button>
        </div>` },
    ],
    props: [[".select-btn", "container", "—", "role=group. 버튼 2~5개"], [".outline", "boolean", "false", "아웃라인형(툴바용)"], [".on", "boolean", "—", "선택 항목. aria-pressed=true 와 함께"], ["disabled", "attribute", "—", "옵션 비활성"]],
    spec: [["Size", "높이 38 (버튼 32 + 패딩 3) · outline 36"], ["Container", "radius/md 6 · surface/neutral/strong"], ["Label", "Label/1 14 · 선택 14 SemiBold"], ["Placement", "카드 헤더 우측, 툴바"]],
    figma: { frame: "Select Button", radius: "radius/md", sizes: { md: { h: 38 } }, variants: { filled: { bg: "--surface-neutral-secondary" }, outline: { stroke: "--line-neutral-primary" } }, states: ["default", "selected", "disabled"] },
  },

  /* ------------------------------------------------ Slider */
  "slider": {
    status: "ready", react: ["Slider"], css: [".slider"],
    desc: "범위 안의 값을 드래그로 고릅니다. 정확한 값이 중요하면 Text Field 를 함께 둡니다.",
    thumb: `<div class="slider" style="min-width:200px"><input type="range" value="60" style="--p:60%"></div>`,
    examples: [
      { id: "basic", title: "Default", desc: "채워진 트랙은 --p 커스텀 속성(현재 %)으로 그립니다. JS 로 value 변경 시 --p 도 함께 갱신합니다.", html: `
        <div class="slider">
          <div class="row"><label for="s1">탐지 민감도</label><span class="val">60</span></div>
          <input id="s1" type="range" min="0" max="100" value="60" style="--p:60%">
        </div>`, react: `
        import { useState } from "react";
        export function Sensitivity() {
          const [v, setV] = useState(60);
          return (
            <div className="slider">
              <div className="row"><label htmlFor="s1">탐지 민감도</label><span className="val">{v}</span></div>
              <input id="s1" type="range" min={0} max={100} value={v} style={{ "--p": v + "%" } as React.CSSProperties} onChange={e => setV(Number(e.target.value))} />
            </div>
          );
        }` },
      { id: "ticks", title: "With Ticks", desc: "단계가 정해진 값은 step 과 눈금을 보여줍니다.", html: `
        <div class="slider">
          <div class="row"><label for="s2">로그 보관</label><span class="val">90일</span></div>
          <input id="s2" type="range" min="30" max="180" step="30" value="90" style="--p:40%">
          <div class="ticks"><span>30</span><span>180</span></div>
        </div>` },
      { id: "disabled", title: "Disabled", html: `
        <div class="slider">
          <div class="row"><label for="s3">대역폭 제한</label><span class="val">—</span></div>
          <input id="s3" type="range" value="40" style="--p:40%" disabled>
        </div>` },
    ],
    props: [[".slider", "container", "—", ".row(라벨·값) + input[type=range](+ .ticks)"], ["--p", "css var (%)", "50%", "채워진 트랙 비율. value 와 동기화"], ["min / max / step", "attribute", "0 / 100 / 1", "네이티브 속성"], ["disabled", "attribute", "—", "비활성"]],
    spec: [["Size", "트랙 6 · 썸 20 · 최소 폭 280"], ["Container", "트랙 radius/full · 썸 border 2px brand"], ["Label", "라벨 12 Regular · 현재 값 12 SemiBold · 눈금 12 tertiary"], ["Placement", "정책 설정의 수치 항목. 정확 입력이 필요하면 Text Field 병행"]],
    figma: { frame: "Slider", sizes: { md: { track: 6, thumb: 20 } }, variants: { default: { fill: "--surface-brand-primary", track: "--surface-neutral-strong" } }, states: ["default", "hover", "focused", "disabled"] },
  },

  /* ------------------------------------------------ Date Picker */
  "date-picker": {
    status: "ready", react: ["Calendar","DatePicker","formatDate","parseDate"], css: [".datepicker", ".calendar"], borrows: [".btn", ".field", ".sr-only"],
    desc: "날짜 · 기간 · 월을 고릅니다. 달력에서 고르거나 직접 입력하고, 로그 조회 · 리포트 기간처럼 '오늘 기준 최근 N일' 프리셋을 함께 둘 수 있습니다.",
    thumb: `<div class="datepicker"><button class="field-btn" style="min-width:200px">2026-09-01 <span class="sep">~</span> 2026-09-07 ${I("calendar")}</button></div>`,
    examples: [
      { id: "default", title: "Default", desc: "날짜 하나를 고르는 기본 필드입니다. 달력에서 날짜를 고르고 적용합니다.", html: `<div class="datepicker"><label>시작일</label><button type="button" class="field-btn" aria-haspopup="dialog" aria-expanded="false"><span class="placeholder">날짜 선택</span>${I("calendar")}</button></div>` },
      { id: "field", title: "Field", desc: "닫힌 상태. 값이 없으면 플레이스홀더, 기간은 ~ 로 구분합니다. 기간은 시작 → 끝 순서로 두 번 고르고, 달을 넘겨 끝을 골라도 시작이 남습니다.", html: `
        <div class="datepicker"><label>시작일</label><button type="button" class="field-btn" aria-haspopup="dialog" aria-expanded="false"><span class="placeholder">날짜 선택</span>${I("calendar")}</button></div>
        <div class="datepicker" data-mode="range" data-start="2026-09-01" data-end="2026-09-07"><label>조회 기간</label><button type="button" class="field-btn" aria-haspopup="dialog" aria-expanded="false">2026-09-01 <span class="sep">~</span> 2026-09-07${I("calendar")}</button></div>`, layout: "top" },
      { id: "calendar", title: "Calendar", desc: "열린 상태의 달력. 오늘(.today · aria-current), 선택(.on · aria-selected), 다른 달(.muted), 선택 불가(data-max 밖 · aria-disabled). 제목을 누르면 연 → 월로 빠르게 옮깁니다.", html: cal({ month: "2026-09", value: "2026-09-07", today: "2026-09-07", max: "2026-09-30", footer: "today apply" }) },
      { id: "range", title: "Range", desc: "기간 선택. 시작 · 끝은 .on(.start · .end), 사이는 .in-range. 시작만 고른 동안에는 포인터를 올린 날까지 미리 보여 줍니다. 적용은 끝을 고른 뒤에 켜집니다.", html: cal({ month: "2026-09", mode: "range", start: "2026-09-01", end: "2026-09-07", today: "2026-09-07", footer: "apply", presets: "7 30" }) },
      { id: "two-months", title: "Two Months", desc: "기간은 data-calendars=\"2\" 로 두 달을 나란히 봅니다. 달을 넘는 기간을 한 번에 고르고, 좁은 화면(767px 이하)에서는 한 달로 줄어듭니다. data-max=\"today\" 로 미래 날짜는 고를 수 없습니다.", html: `
        <div class="datepicker" data-mode="range" data-calendars="2" data-max="today" data-presets="7 30" data-start="2026-09-01" data-end="2026-09-07"><label>조회 기간</label><button type="button" class="field-btn" aria-haspopup="dialog" aria-expanded="false">2026-09-01 <span class="sep">~</span> 2026-09-07${I("calendar")}</button></div>`, layout: "top" },
      { id: "month", title: "Month", desc: "월 단위(data-mode=\"month\"). 열면 월 목록이 나오고, 제목을 누르면 12년 단위 연도 목록으로 갑니다.", html: `
        <div class="datepicker" data-mode="month" data-value="2026-09"><label>보고서 월</label><button type="button" class="field-btn" aria-haspopup="dialog" aria-expanded="false">2026-09 ${I("calendar")}</button></div>`, layout: "top" },
      { id: "input", title: "Input / Error", desc: "직접 입력하는 필드(.datepicker.field — Text Field 셸). Enter 나 포커스가 떠날 때 검사하고, 틀리면 오류 테두리와 원인 · 고치는 법을 보입니다. 값은 바뀌지 않습니다. Alt+↓ 로 달력을 엽니다.", html: `
        <div class="datepicker field" data-min="2026-01-01" data-max="2026-12-31"><label for="dp-start">시작일</label><div class="affix"><input id="dp-start" value="2026-09-07" placeholder="YYYY-MM-DD" autocomplete="off" aria-describedby="dp-start-help"><button type="button" class="cal-btn" aria-label="달력 열기" aria-haspopup="dialog" aria-expanded="false">${I("calendar")}</button></div><span class="help" id="dp-start-help">2026년 안의 날짜 · YYYY-MM-DD</span></div>
        <div class="datepicker field" data-mode="range"><label for="dp-period">조회 기간</label><div class="affix"><input id="dp-period" value="2026-09-01 ~ 2026-09-07" placeholder="YYYY-MM-DD ~ YYYY-MM-DD" autocomplete="off" aria-describedby="dp-period-help"><button type="button" class="cal-btn" aria-label="달력 열기" aria-haspopup="dialog" aria-expanded="false">${I("calendar")}</button></div><span class="help" id="dp-period-help">시작 ~ 종료</span></div>
        <div class="datepicker field error" data-help="YYYY-MM-DD"><label for="dp-end">종료일</label><div class="affix"><input id="dp-end" value="2026-13-01" placeholder="YYYY-MM-DD" autocomplete="off" aria-describedby="dp-end-help" aria-invalid="true"><button type="button" class="cal-btn" aria-label="달력 열기" aria-haspopup="dialog" aria-expanded="false">${I("calendar")}</button></div><span class="help" id="dp-end-help">날짜 형식이 올바르지 않습니다. 예: 2026-09-07</span></div>`, layout: "top" },
      { id: "footer", title: "Footer", desc: "하단 버튼은 data-footer 로 고릅니다 — 오늘 · 초기화 · 취소(열기 전 값으로) · 적용. none 이면 버튼 없이 고르는 순간 적용하고 닫힙니다(기간은 끝을 고를 때).", html: `
        <div class="datepicker" data-footer="today reset cancel apply" data-value="2026-09-07"><label>전체 버튼</label><button type="button" class="field-btn" aria-haspopup="dialog" aria-expanded="false">2026-09-07 ${I("calendar")}</button></div>
        <div class="datepicker" data-footer="none"><label>바로 적용</label><button type="button" class="field-btn" aria-haspopup="dialog" aria-expanded="false"><span class="placeholder">날짜 선택</span>${I("calendar")}</button></div>
        <div class="datepicker" data-mode="range" data-footer="none"><label>기간 바로 적용</label><button type="button" class="field-btn" aria-haspopup="dialog" aria-expanded="false"><span class="placeholder">날짜 선택</span>${I("calendar")}</button></div>`, layout: "top" },
      { id: "size", title: "Size", desc: "높이 32 · 40 · 48 — Text Field · Button 과 같습니다(.sm · .lg).", html: `
        <div class="datepicker sm"><label>Small</label><button type="button" class="field-btn" aria-haspopup="dialog" aria-expanded="false"><span class="placeholder">날짜 선택</span>${I("calendar")}</button></div>
        <div class="datepicker"><label>Medium</label><button type="button" class="field-btn" aria-haspopup="dialog" aria-expanded="false"><span class="placeholder">날짜 선택</span>${I("calendar")}</button></div>
        <div class="datepicker lg"><label>Large</label><button type="button" class="field-btn" aria-haspopup="dialog" aria-expanded="false"><span class="placeholder">날짜 선택</span>${I("calendar")}</button></div>`, layout: "top" },
      { id: "state", title: "State", desc: "비활성은 비활성 토큰으로 칠하고 열리지 않습니다. 읽기 전용은 입력형에서 값만 보이고 달력을 열지 않습니다.", html: `
        <div class="datepicker" data-value="2026-09-07"><label>비활성</label><button type="button" class="field-btn" aria-haspopup="dialog" aria-expanded="false" disabled>2026-09-07 ${I("calendar")}</button></div>
        <div class="datepicker field"><label for="dp-ro">읽기 전용</label><div class="affix"><input id="dp-ro" value="2026-09-07" placeholder="YYYY-MM-DD" autocomplete="off" aria-describedby="dp-ro-help" readonly><button type="button" class="cal-btn" aria-label="달력 열기" aria-haspopup="dialog" aria-expanded="false" disabled>${I("calendar")}</button></div><span class="help" id="dp-ro-help">정책이 정한 날짜</span></div>`, layout: "top" },
    ],
    props: [[".datepicker", "container", "—", "label + .field-btn(+ .calendar). 열림은 .open, 위로 펼침은 .up"], ["data-mode", "single | range | month", "single", "없으면 .field-btn 안 .sep 로 기간을 알아낸다"], ["data-value / data-start · data-end", "YYYY-MM-DD (월은 YYYY-MM)", "—", "확정 값. ds.js 가 이 값만 믿는다"], ["data-min / data-max", "YYYY-MM-DD | today", "—", "밖의 날짜 · 월 · 연은 aria-disabled"], ["data-footer", "today reset cancel apply | none", "single: today apply · 그 외: apply", "none 이면 고르는 순간 적용"], ["data-calendars", "1 | 2", "1", "기간을 두 달로. 767px 이하 1"], ["data-presets", "\"7 30\"", "—", "기간 프리셋(최근 N일). 누르는 즉시 확정한다(적용 버튼과 별개). min/max 밖이면 비활성"], ["data-default-preset", "N", "—", "값이 없으면 오늘 기준 최근 N일을 처음 값으로(기간)"], ["data-today", "YYYY-MM-DD", "오늘", "정적 데모용"], [".sm / .lg", "size", "md", "필드 높이 32 / 40 / 48"], [".field + .affix + input + .cal-btn", "입력형", "—", "직접 입력. 오류는 .error + aria-invalid + .help"], ["disabled / readonly", "attribute", "—", "버튼형 disabled, 입력형 readonly(+ .cal-btn disabled)"], [".calendar", "popover", "—", ".cal-head(.cal-nav · .cal-title) + .cal-grid[role=grid](.cal-week ×주 수 · .day 주 수×7, 28–42) + .cal-foot"], [".day.on · .start · .end · .in-range · .preview · .today · .muted", "state", "—", "선택 / 기간 양끝 / 사이 / 미리보기 / 오늘 / 다른 달"], ["ds:date", "event", "—", "확정 때만. {value} · 기간 {value:\"A ~ B\", start, end}"]],
    spec: [["Size", "필드 32 · 40 · 48 · 달력 폭 296(두 달 590) · 날짜 셀 높이 34 · 연/월 셀 40"], ["Container", "달력 radius/lg 8 · shadow/2"], ["Label", "요일 12 SemiBold tertiary · 날짜 12 Regular · 필드 Body/2 14"], ["Placement", "필드 아래 4px. 아래 자리가 모자라고 위가 더 넓으면 필드 위 4px"]],
    figma: { frame: "Date Picker", radius: "radius/lg", sizes: { sm: { h: 32 }, md: { h: 40 }, lg: { h: 48 }, calendar: { w: 296 }, day: { h: 34 }, cell: { h: 40 } }, variants: { single: {}, range: { band: "--surface-brand-subtle", endpoint: "--surface-brand-primary" }, month: {}, input: {}, focused: { stroke: "--foreground-brand-primary", ring: "--line-brand-focus" }, error: { stroke: "--foreground-negative-primary", ring: "--line-negative-focus" }, disabled: { bg: "--surface-disable-primary", fg: "--foreground-disable-primary" } }, states: ["closed", "focused", "open", "selected", "range", "preview", "error", "disabled", "read-only"] },
  },


  /* ------------------------------------------------ Checkbox */
  "checkbox": {
    status: "ready", react: ["Checkbox","CheckboxGroup"], css: [".checkbox", ".checkbox-group"],
    desc: "여러 항목 중 0개 이상을 선택합니다. 네이티브 input 을 그대로 쓰고 외형만 CSS 로 바꿔 키보드·스크린리더가 동작합니다.",
    thumb: `${cb("이메일 알림", "checked")}${cb("SMS 알림")}`,
    examples: [
      { id: "default", title: "Default", desc: "선택하지 않은 기본 상태입니다.", html: `<label class="checkbox"><input type="checkbox"><span>정책 배포 시 알림</span></label>` },
      { id: "state", title: "State", desc: "Unchecked · Checked · Indeterminate(부분 선택, JS 로 indeterminate=true 또는 .mixed) · Disabled.", html: `
        ${cb("Unchecked")}
        ${cb("Checked", "checked")}
        ${cb("Indeterminate", 'class="mixed"')}
        ${cb("Disabled", "disabled")}
        ${cb("Disabled checked", "checked disabled")}`, react: `
        import { useState } from "react";
        export function AlertOption() {
          const [on, setOn] = useState(true);
          return (
            <label className="checkbox">
              <input type="checkbox" checked={on} onChange={e => setOn(e.target.checked)} />
              <span>변경 시 관리자에게 알림</span>
            </label>
          );
        }` },
      { id: "desc", title: "With Description", desc: "선택의 결과를 small 로 설명합니다.", html: `
        <div class="checkbox-group">
          ${cb("정책 배포 시 알림", "checked", "배포가 완료되면 관리자 메일로 알립니다")}
          ${cb("주간 리포트 수신", "", "매주 월요일 09:00 에 발송")}
        </div>` },
      { id: "group", title: "Group", desc: "세로 기본, 짧은 항목은 .row 로 가로 배치. 전체 선택은 Indeterminate 와 함께.", html: `
        <div class="checkbox-group">
          ${cb("<b>전체 선택</b>", 'class="mixed"')}
          <div class="checkbox-group row" style="padding-left:24px">${cb("Critical", "checked")}${cb("High", "checked")}${cb("Medium")}${cb("Low")}</div>
        </div>` },
    ],
    props: [[".checkbox", "label wrapper", "—", "input[type=checkbox] + span(라벨, small 설명)"], ["checked / disabled", "attribute", "—", "네이티브 상태"], [".mixed", "boolean", "false", "부분 선택 외형(JS indeterminate 대체)"], [".checkbox-group", "container", "—", "세로 12px 간격. .row 로 가로 24px"]],
    spec: [["Size", "박스 16 · 라벨 Body/2 14 · 클릭 영역 라벨 포함"], ["Container", "radius/sm 4 · line/neutral/primary 1.5px · 선택 brand"], ["Label", "Body/2 14 · 설명 12 Regular tertiary"], ["Placement", "폼 옵션, 테이블 행 선택(.tbl .check)"]],
    figma: { frame: "Checkbox", radius: "radius/sm", sizes: { md: { box: 16 } }, variants: { default: { stroke: "--line-neutral-primary" }, checked: { bg: "--surface-brand-primary" } }, states: ["unchecked", "checked", "indeterminate", "disabled", "focused"] },
  },

  /* ------------------------------------------------ Chip */
  "chip": {
    status: "ready", react: ["Chip","ChipGroup"], css: [".chip", ".chip-group"],
    desc: "필터 조건이나 입력된 값을 작은 캡슐로 보여줍니다. 선택 가능한 Filter Chip 과 삭제 가능한 Input Chip 을 구분합니다. 상태 표시는 Tag 를 씁니다.",
    thumb: `<button class="chip on" aria-pressed="true">Critical</button><button class="chip" aria-pressed="false">High</button><button class="chip" aria-pressed="false">Medium</button>`,
    examples: [
      { id: "default", title: "Default", desc: "선택하지 않은 기본 칩입니다.", html: `<button type="button" class="chip" aria-pressed="false">Critical</button>` },
      { id: "filter", title: "Filter Chip", desc: "토글 선택. aria-pressed 가 있는 칩은 체크 아이콘을 항상 두고(비활성 색), 선택되면 .on 으로 색만 바뀌어 폭이 흔들리지 않습니다.", html: `
        <div class="chip-group">
          <button type="button" class="chip on" aria-pressed="true">Critical</button>
          <button type="button" class="chip on" aria-pressed="true">High</button>
          <button type="button" class="chip" aria-pressed="false">Medium</button>
          <button type="button" class="chip" aria-pressed="false">Low</button>
        </div>`, react: `
        import { useState } from "react";
        const LEVELS = ["Critical", "High", "Medium", "Low"];
        export function SeverityFilter() {
          const [sel, setSel] = useState<string[]>(["Critical", "High"]);
          const toggle = (l: string) => setSel(s => s.includes(l) ? s.filter(x => x !== l) : [...s, l]);
          return (
            <div className="chip-group">
              {LEVELS.map(l => (
                <button key={l} type="button" className={"chip" + (sel.includes(l) ? " on" : "")} aria-pressed={sel.includes(l)} onClick={() => toggle(l)}>{l}</button>
              ))}
            </div>
          );
        }` },
      { id: "input", title: "Input Chip", desc: "입력된 값(IP, 태그, 수신자). .x 로 삭제.", html: `
        <div class="chip-group">
          <span class="chip">10.0.0.12<i class="x" role="button" aria-label="삭제">${I("x",10)}</i></span>
          <span class="chip">10.0.0.13<i class="x" role="button" aria-label="삭제">${I("x",10)}</i></span>
          <span class="chip">192.168.1.0/24<i class="x" role="button" aria-label="삭제">${I("x",10)}</i></span>
          <button type="button" class="chip">${I("plus")}추가</button>
        </div>` },
      { id: "size", title: "Size / Disabled", desc: "비활성. 입력값 칩(span)은 disabled 속성을 못 가져 aria-disabled=\"true\" 로 씁니다 — 삭제(x)도 함께 흐려집니다.", html: `
        <button type="button" class="chip sm on" aria-pressed="true">Small</button>
        <button type="button" class="chip on" aria-pressed="true">Default</button>
        <button type="button" class="chip" aria-pressed="false" disabled>Disabled</button>
        <span class="chip" aria-disabled="true">10.0.0.12<i class="x" role="button" aria-label="삭제" aria-disabled="true">${I("x",10)}</i></span>` },
    ],
    props: [[".chip", "button | span", "—", "선택형은 button, 입력값은 span"], [".on", "boolean", "false", "선택 상태(brand subtle + 체크)"], [".x", "element", "—", "삭제 아이콘(Input Chip)"], ["size", "(md) | sm", "md", "높이 32 / 26"], ["disabled", "attribute", "—", "비활성. 입력값 칩(span)은 aria-disabled=\"true\""]],
    spec: [["Size", "높이 32 (sm 26) · padding 0 12"], ["Container", "radius/full · line/neutral/primary · 선택 brand subtle"], ["Label", "Label/2 12"], ["Placement", "검색 아래 필터 행, 입력 필드 안 값 목록"]],
    figma: { frame: "Chip", radius: "radius/full", sizes: { md: { h: 32 }, sm: { h: 26 } }, variants: { filter: { stroke: "--line-neutral-primary" }, selected: { bg: "--surface-brand-subtle", stroke: "--surface-brand-primary", fg: "--surface-brand-primary" }, input: {} }, states: ["default", "selected", "hover", "disabled"] },
  },

  /* ------------------------------------------------ Radio Button */
  "radio-button": {
    status: "ready", react: ["Radio","RadioGroup"], css: [".radio", ".radio-group"], borrows: [".t-label-1", ".card"],
    desc: "여러 항목 중 정확히 하나를 고릅니다. 옵션이 5개를 넘으면 Dropdown 을 씁니다.",
    thumb: `<label class="radio"><input type="radio" name="t" checked><span>차단</span></label><label class="radio"><input type="radio" name="t"><span>허용</span></label>`,
    examples: [
      { id: "default", title: "Default", desc: "선택하지 않은 기본 상태입니다.", html: `<label class="radio"><input type="radio" name="rd"><span>표준 모드</span></label>` },
      { id: "state", title: "State", html: `
        <label class="radio"><input type="radio" name="r1"><span>Unchecked</span></label>
        <label class="radio"><input type="radio" name="r1" checked><span>Checked</span></label>
        <label class="radio"><input type="radio" name="r2" disabled><span>Disabled</span></label>
        <label class="radio"><input type="radio" name="r3" checked disabled><span>Disabled checked</span></label>` },
      { id: "group", title: "Group", desc: "같은 name 으로 묶고 fieldset/legend 로 질문을 붙입니다. 설명은 small.", html: `
        <fieldset class="radio-group" style="border:0;padding:0;margin:0">
          <legend class="t-label-1" style="margin-bottom:8px">탐지 시 동작</legend>
          <label class="radio"><input type="radio" name="act" checked><span>차단 후 알림<small>실행을 즉시 중단하고 관리자에게 알립니다</small></span></label>
          <label class="radio"><input type="radio" name="act"><span>알림만<small>기록과 알림만, 실행은 허용</small></span></label>
          <label class="radio"><input type="radio" name="act"><span>기록만</span></label>
        </fieldset>`, react: `
        import { useState } from "react";
        const ACTIONS = [["block", "차단 후 알림"], ["notify", "알림만"], ["log", "기록만"]];
        export function ActionRadio() {
          const [v, setV] = useState("block");
          return (
            <fieldset className="radio-group" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="t-label-1" style={{ marginBottom: 8 }}>탐지 시 동작</legend>
              {ACTIONS.map(([k, label]) => (
                <label key={k} className="radio">
                  <input type="radio" name="act" value={k} checked={v === k} onChange={() => setV(k)} />
                  <span>{label}</span>
                </label>
              ))}
            </fieldset>
          );
        }` },
      { id: "card", title: "Card Radio", desc: "옵션마다 설명이 길거나 비교가 필요할 때 카드형.", html: `
        <div class="radio-group row">
          <label class="radio card"><input type="radio" name="plan" checked><span>표준 모드<small>권장. 알려진 위협 차단</small></span></label>
          <label class="radio card"><input type="radio" name="plan"><span>강화 모드<small>의심 행위까지 차단, 오탐 증가</small></span></label>
        </div>` },
    ],
    props: [[".radio", "label wrapper", "—", "input[type=radio] + span(라벨, small)"], ["name", "attribute", "—", "같은 그룹은 같은 name"], [".card", "boolean", "false", "카드형(보더 + 선택 시 brand)"], [".radio-group", "container", "—", "세로 12px. .row 로 가로"]],
    spec: [["Size", "원 16 · 선택 내부 점 8"], ["Container", "radius/full · line/neutral/primary 1.5px"], ["Label", "Body/2 14 · 설명 12 Regular tertiary"], ["Placement", "폼의 배타 옵션, 설정의 동작 선택"]],
    figma: { frame: "Radio Button", radius: "radius/full", sizes: { md: { box: 16 } }, variants: { default: { stroke: "--line-neutral-primary" }, checked: { stroke: "--surface-brand-primary" }, card: { stroke: "--line-neutral-secondary" } }, states: ["unchecked", "checked", "disabled", "focused"] },
  },

  /* ------------------------------------------------ Switch */
  "switch": {
    status: "ready", react: ["Switch"], css: [".switch"], borrows: [".settings-section", ".setting"],
    desc: "설정을 켜고 끕니다. 토글 즉시 적용되며 저장 버튼이 없습니다. 저장이 필요한 폼 안에서는 Checkbox 를 씁니다.",
    thumb: `<label class="switch"><input type="checkbox" role="switch" checked><span>실시간 보호</span></label>`,
    examples: [
      { id: "default", title: "Default", desc: "꺼진 기본 상태입니다.", html: `<label class="switch"><input type="checkbox" role="switch"><span>실시간 보호</span></label>` },
      { id: "state", title: "State", desc: "input[type=checkbox] 에 role=switch. Off · On · Disabled.", html: `
        <label class="switch"><input type="checkbox" role="switch"><span>Off</span></label>
        <label class="switch"><input type="checkbox" role="switch" checked><span>On</span></label>
        <label class="switch"><input type="checkbox" role="switch" disabled><span>Disabled</span></label>
        <label class="switch"><input type="checkbox" role="switch" checked disabled><span>Disabled on</span></label>`, react: `
        import { useState } from "react";
        export function RealtimeSwitch() {
          const [on, setOn] = useState(true);
          return (
            <label className="switch">
              <input type="checkbox" role="switch" checked={on} onChange={e => setOn(e.target.checked)} />
              <span>실시간 보호 {on ? "켬" : "끔"}</span>
            </label>
          );
        }` },
      { id: "size", title: "Size / Label Position", desc: "테이블 셀·밀도 높은 목록은 .sm. 설정 행에서는 라벨을 왼쪽에(.label-left).", html: `
        <label class="switch sm"><input type="checkbox" role="switch" checked><span>Small</span></label>
        <label class="switch label-left"><input type="checkbox" role="switch" checked><span>라벨 왼쪽</span></label>` },
      { id: "settings", title: "In Settings", desc: "정책 설정 행. 라벨·설명은 왼쪽, 스위치는 오른쪽 끝.", html: `
        <div class="settings-section" style="max-width:560px">
          <div class="setting"><div class="info"><b>실시간 보호</b><span>파일 실행 시 즉시 검사합니다</span></div><div class="ctrl"><label class="switch"><input type="checkbox" role="switch" checked aria-label="실시간 보호"></label></div></div>
          <div class="setting"><div class="info"><b>USB 자동 검사</b><span>연결된 저장장치를 검사합니다</span></div><div class="ctrl"><label class="switch"><input type="checkbox" role="switch" aria-label="USB 자동 검사"></label></div></div>
        </div>`, layout: "left" },
    ],
    props: [[".switch", "label wrapper", "—", "input[type=checkbox][role=switch] + span"], ["checked / disabled", "attribute", "—", "네이티브 상태"], ["size", "(md) | sm", "md", "44×24 / 36×20"], [".label-left", "boolean", "false", "라벨을 왼쪽에"]],
    spec: [["Size", "트랙 44×24 (sm 36×20) · 노브 20"], ["Container", "radius/full · off line/neutral/primary · on brand"], ["Label", "Body/2 14"], ["Placement", "설정 행 우측 끝, 테이블 '사용' 열"]],
    figma: { frame: "Switch", radius: "radius/full", sizes: { md: { w: 44, h: 24 }, sm: { w: 36, h: 20 } }, variants: { off: { bg: "--line-neutral-primary" }, on: { bg: "--surface-brand-primary" } }, states: ["off", "on", "disabled", "focused"] },
  },

  /* ------------------------------------------------ Tag */
  "tag": {
    status: "ready", react: ["Tag"], css: [".tag"],
    desc: "상태·분류·심각도를 짧게 표시합니다. 색만이 아니라 라벨 텍스트로도 의미를 전달합니다. 선택·삭제가 필요하면 Chip 을 씁니다.",
    thumb: `<span class="tag critical">Critical</span><span class="tag medium">Medium</span><span class="tag ok">정상</span>`,
    examples: [
      { id: "default", title: "Default", desc: "의미 색을 지정하지 않은 중립 태그입니다.", html: `<span class="tag">Tag</span>` },
      { id: "severity", title: "Severity", desc: "위협 심각도 4단계. 색은 상태·강조 의도 매핑입니다 — Critical=negative · High=cautionary · Medium=accent cyan · Low=중립. 라벨은 중립 글자색이고 색은 점과 틴트가 나릅니다.", html: `
        <span class="tag critical">Critical</span>
        <span class="tag high">High</span>
        <span class="tag medium">Medium</span>
        <span class="tag low">Low</span>
        ` },
      { id: "status", title: "Status", desc: "작업·시스템 상태. 성공 ok, 대기 medium, 실패 high, 중립 기본.", html: `
        <span class="tag ok">승인</span>
        <span class="tag medium">검토 대기</span>
        <span class="tag high">반려</span>
        <span class="tag">보관</span>
        <span class="tag accent">신규</span>` },
      { id: "style", title: "Style", desc: "Outline · Solid(강조) · Plain(점 없음).", html: `
        <span class="tag critical outline">Critical</span>
        <span class="tag medium outline">Medium</span>
        <span class="tag critical solid">Critical</span>
        <span class="tag ok solid">정상</span>
        <span class="tag plain">v2.4.1</span>
        <span class="tag accent plain">Beta</span>` },
      { id: "size", title: "Size", desc: "sm 은 테이블 밀도 높은 셀, lg 는 상세 패널 제목 옆.", html: `
        <span class="tag high sm">High</span>
        <span class="tag high">High</span>
        <span class="tag high lg">High</span>` },
    ],
    props: [["tone", "critical | high | medium | low | ok | accent | (neutral)", "neutral", "의미별 색. 바탕은 틴트(<code>--surface-{negative|cautionary|…}-primary</code>)이고 <b>라벨은 중립 글자색</b>입니다 — 색은 점(<code>::before</code>)과 테두리가 나릅니다. <code>.solid</code> 는 한 단계 강한 틴트 + 테두리입니다(참조 시스템에 솔리드 상태 면이 없습니다). 라벨 색을 직접 지정하지 마세요"], ["style", ".outline | .solid | .plain", "subtle", "아웃라인 / 채움 / 점 없음"], ["size", "sm | (md) | lg", "md", "폰트는 12 고정이고 padding 으로 높이만 21 / 25 / 29"]],
    spec: [["Size", "높이 25 (sm 21 · lg 29) · padding 3/10 (sm 1/8 · lg 5/12)"], ["Container", "radius/full · 기본형은 <code>--surface-{…}-primary</code> 틴트, <code>.solid</code> 는 같은 틴트 + <code>--line-{…}</code> 테두리(Critical 만 <code>--surface-negative-strong</code>)"], ["Label", "12 SemiBold (세 사이즈 공통)"], ["Placement", "테이블 셀, 카드 헤더, 상세 패널 제목 옆"]],
    figma: { frame: "Tag", radius: "radius/full", sizes: { sm: { h: 21 }, md: { h: 25 }, lg: { h: 29 } }, variants: { critical: { bg: "--surface-negative-primary", fg: "--foreground-negative-primary", solidBg: "--surface-negative-strong", solidFg: "--foreground-neutral-primary" }, high: { bg: "--surface-cautionary-primary", fg: "--foreground-cautionary-primary", solidBg: "--surface-cautionary-primary", solidFg: "--foreground-neutral-primary" }, medium: { bg: "--surface-accent-cyan", fg: "--foreground-accent-cyan", solidBg: "--surface-accent-cyan", solidFg: "--foreground-neutral-primary" }, low: { bg: "--surface-neutral-strong", fg: "--foreground-neutral-tertiary", solidBg: "--surface-neutral-strong", solidFg: "--foreground-neutral-primary" }, ok: { bg: "--surface-positive-primary", fg: "--foreground-positive-primary", solidBg: "--surface-positive-primary", solidFg: "--foreground-neutral-primary" }, accent: { bg: "--surface-brand-subtle", fg: "--foreground-brand-primary", solidBg: "--surface-brand-primary", solidFg: "--brand-label" }, neutral: { bg: "--surface-neutral-strong", fg: "--foreground-neutral-secondary" } }, states: ["subtle", "outline", "solid"] },
  },

  /* ------------------------------------------------ Dropdown (액션 메뉴) · Select (값 선택) — 같은 .dropdown CSS 를 쓰지만 용도가 달라 페이지를 나눈다 */
  "dropdown": {
    status: "ready", react: ["Dropdown","DropdownTrigger","Menu","MenuItem","MenuSep","MenuLabel"], css: [".dropdown", ".menu", ".menu-item", ".menu-sep", ".menu-label"], borrows: [".btn"],
    desc: "더 보기(⋯) 같은 트리거에서 <b>실행할 액션</b>을 모아 보여줍니다. 값을 고르는 경우에는 <a href=\"#/components/select\">Select</a>, 옵션이 5개 이하이고 항상 보여야 하면 Select Button 을 씁니다.",
    thumb: `<div class="dropdown open" style="height:60px"><ul class="menu" style="position:static;min-width:120px"><li class="menu-item">편집</li><li class="menu-item danger">삭제</li></ul></div>`,
    examples: [
      { id: "default", title: "Default", desc: "닫힌 기본 상태입니다. 더 보기 버튼을 누르면 액션 목록이 열립니다.", html: `
        <div class="dropdown">
          <button type="button" class="btn md outline assistive icon-only" aria-label="더 보기" aria-haspopup="menu" aria-expanded="false">${I("dots")}</button>
          <ul class="menu" role="menu" style="left:auto;right:0">
            <li class="menu-item" role="menuitem">${I("pencil")}편집</li>
            <li class="menu-item" role="menuitem">${I("download")}내보내기</li>
          </ul>
        </div>` },
      { id: "menu", title: "Action Menu", desc: "더 보기(⋯) 버튼에서 여는 액션 목록. 그룹 라벨·구분선·위험 액션.", html: `
        <div class="dropdown open">
          <button type="button" class="btn md outline assistive icon-only" aria-label="더 보기" aria-haspopup="menu" aria-expanded="true">${I("dots")}</button>
          <ul class="menu" role="menu" style="left:auto;right:0">
            <li class="menu-label">정책</li>
            <li class="menu-item" role="menuitem">${I("pencil")}편집</li>
            <li class="menu-item" role="menuitem">${I("download")}내보내기</li>
            <li class="menu-sep" role="separator"></li>
            <li class="menu-item danger" role="menuitem">${I("trash")}삭제</li>
          </ul>
        </div>`, layout: "tall", style: "justify-content:flex-end;padding-right:120px" },
      { id: "states", title: "Item States", desc: "기본 · 선택(.on) · 위험(.danger) · 비활성(aria-disabled). 아이콘은 기본이 tertiary 이고, 나머지 상태에서는 글자색을 따릅니다.", html: `
        <div class="dropdown open">
          <button type="button" class="btn md outline assistive icon-only" aria-label="더 보기" aria-haspopup="menu" aria-expanded="true">${I("dots")}</button>
          <ul class="menu" role="menu" style="left:auto;right:0">
            <li class="menu-item" role="menuitem">${I("pencil")}편집</li>
            <li class="menu-item on" role="menuitem">${I("list")}목록으로 보기</li>
            <li class="menu-item" role="menuitem" aria-disabled="true">${I("share")}공유<span class="hint">권한 없음</span></li>
            <li class="menu-sep" role="separator"></li>
            <li class="menu-item danger" role="menuitem">${I("trash")}삭제</li>
          </ul>
        </div>`, layout: "tall", style: "justify-content:flex-end;padding-right:120px" },
      { id: "disabled", title: "Disabled", desc: "권한이 없어 열 수 없는 상태입니다.", html: `
        <div class="dropdown"><button type="button" class="btn md outline assistive icon-only" aria-label="더 보기" aria-haspopup="menu" aria-expanded="false" disabled>${I("dots")}</button></div>` },
    ],
    props: [[".dropdown", "container", "—", "position:relative. 열림은 .open. inline-block 이라 상자 높이가 놓인 곳의 글자 크기를 따른다(트리거 버튼 · 메뉴 항목 글자는 따로 정해져 있다)"], [".menu", "ul", "—", "role=menu. 우측 정렬은 left:auto;right:0"], [".menu-item", "li", "—", "role=menuitem. .danger 위험, aria-disabled 비활성, .hint 단축키. 아이콘은 기본이 tertiary 이고 .on · .danger · 비활성에서는 글자색을 따릅니다"], [".menu-sep / .menu-label", "li", "—", "구분선 / 그룹 라벨"]],
    spec: [["Size", "항목 높이 36 · 메뉴 최소 폭 200"], ["Container", "radius/md 6 · shadow/2 · 트리거 아래 4px"], ["Label", "항목 Body/2 14 · 선택 SemiBold brand · 그룹 라벨 12 SemiBold uppercase tertiary · 힌트 12 tertiary"], ["Placement", "테이블 행 액션·카드 헤더(우측 정렬 메뉴) · 아래 공간이 모자라면 위로 뒤집어 연다(.up)"]],
    figma: { frame: "Dropdown", radius: "radius/md", sizes: { item: { h: 36 } }, variants: { menu: {} }, states: ["closed", "open", "disabled"] },
  },

  /* ------------------------------------------------ Select */
  "select": {
    status: "ready", react: ["Select"], css: [".dropdown", ".menu", ".menu-item"],
    desc: "옵션 목록을 열어 <b>하나를 고릅니다</b>. 옵션이 5개 이하이고 항상 보여야 하면 Radio · Select Button, 고르는 것이 아니라 실행이면 <a href=\"#/components/dropdown\">Dropdown</a> 을 씁니다.",
    thumb: `<div class="dropdown"><button class="trigger" style="min-width:160px">전체 그룹</button></div>`,
    examples: [
      { id: "default", title: "Default", desc: "닫힌 기본 상태입니다. 고른 값이 없으면 트리거에 placeholder 를 둡니다. 눌러서 열면 항목이 8개를 넘는 목록은 메뉴 안에서 스크롤됩니다(최대 높이 320).", html: `
        <div class="dropdown">
          <button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="false"><span class="placeholder">그룹 선택</span></button>
          <ul class="menu" role="listbox" aria-label="그룹">
            <li class="menu-item" role="option">전체</li>
            <li class="menu-item" role="option">영업팀</li>
            <li class="menu-item" role="option">개발팀</li>
            <li class="menu-item" role="option">인프라팀</li>
            <li class="menu-item" role="option">보안팀</li>
            <li class="menu-item" role="option">기획팀</li>
            <li class="menu-item" role="option">디자인팀</li>
            <li class="menu-item" role="option">QA팀</li>
            <li class="menu-item" role="option">고객지원팀</li>
            <li class="menu-item" role="option">재무팀</li>
            <li class="menu-item" role="option">인사팀</li>
            <li class="menu-item" role="option">법무팀</li>
          </ul>
        </div>`, layout: "top" },
      { id: "open", title: "Open / Selected", desc: "닫힘과 열림을 나란히 둔 모습입니다. 열린 메뉴는 role=listbox, 고른 항목은 .on + aria-selected.", html: `
        <div class="dropdown">
          <button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="false"><span class="placeholder">그룹 선택</span></button>
          <ul class="menu" role="listbox" aria-label="그룹">
            <li class="menu-item" role="option">전체</li>
            <li class="menu-item" role="option">영업팀</li>
            <li class="menu-item" role="option">개발팀</li>
            <li class="menu-item" role="option">인프라팀</li>
            <li class="menu-item" role="option" aria-disabled="true">외주(권한 없음)</li>
          </ul>
        </div>
        <div class="dropdown open">
          <button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="true">영업팀</button>
          <ul class="menu" role="listbox" aria-label="그룹">
            <li class="menu-item" role="option">전체</li>
            <li class="menu-item on" role="option" aria-selected="true">영업팀</li>
            <li class="menu-item" role="option">개발팀</li>
            <li class="menu-item" role="option">인프라팀</li>
            <li class="menu-item" role="option" aria-disabled="true">외주(권한 없음)</li>
          </ul>
        </div>`, layout: "tall top" },
      { id: "disabled", title: "Disabled", desc: "권한이 없거나 선택할 값이 없는 상태입니다.", html: `
        <div class="dropdown"><button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="false" disabled><span class="placeholder">권한 없음</span></button></div>` },
    ],
    props: [[".dropdown", "container", "—", "position:relative. 열림은 .open. inline-block 이라 상자 높이가 놓인 곳의 글자 크기를 따른다 — 단독이면 앱 기본 글자, 입력 폼(.field) 안 14, .pagination-bar 안 12"], [".trigger", "button", "—", "고른 값을 표시. 값이 없으면 안에 .placeholder"], [".menu", "ul", "—", "role=listbox · aria-label 필수"], [".menu-item", "li", "—", "role=option. 고른 항목 .on + aria-selected, 비활성 aria-disabled"]],
    spec: [["Size", "트리거 높이 40 · 항목 높이 36 · 메뉴 최소 폭 200 · 메뉴 최대 높이 320(약 8개, 넘으면 스크롤)"], ["Container", "radius/md 6 · shadow/2 · 트리거 아래 4px"], ["Label", "Body/2 14 · placeholder foreground/disable/primary"], ["Placement", "필터 툴바, 폼 안의 선택 필드 · 아래 공간이 모자라면 위로 뒤집어 연다(.up)"]],
    figma: { frame: "Select", radius: "radius/md", sizes: { trigger: { h: 40 }, item: { h: 36 } }, variants: { select: {}, focused: { stroke: "--foreground-brand-primary", ring: "--line-brand-focus" } }, states: ["closed", "focused", "open", "selected", "disabled"] },
  },

  /* ------------------------------------------------ Tab */
  "tab": {
    status: "ready", react: ["Tabs","TabList","Tab","TabPanel"], css: [".tabs", ".tab-panel"], borrows: [".count"],
    desc: "같은 맥락의 콘텐츠를 뷰 단위로 전환합니다. 페이지 수준은 Underline, 카드 안의 보조 전환은 Pill.",
    thumb: `<div class="tabs sm" style="width:auto"><button class="tab on">개요</button><button class="tab">이벤트</button><button class="tab">정책</button></div>`,
    examples: [
      { id: "default", title: "Default", desc: "밑줄 스타일의 기본 탭입니다.", html: `
        <div class="tabs" role="tablist">
          <button type="button" class="tab on" role="tab" aria-selected="true">개요</button>
          <button type="button" class="tab" role="tab" aria-selected="false">이벤트</button>
          <button type="button" class="tab" role="tab" aria-selected="false">정책</button>
        </div>
      ` },
      { id: "underline", title: "Underline", desc: "기본. role=tablist / tab / aria-selected. 활성은 .on.", html: `
        <div style="width:100%;max-width:640px">
          <div class="tabs" role="tablist">
            <button type="button" class="tab on" role="tab" aria-selected="true">개요</button>
            <button type="button" class="tab" role="tab" aria-selected="false">이벤트</button>
            <button type="button" class="tab" role="tab" aria-selected="false">정책</button>
            <button type="button" class="tab" role="tab" aria-selected="false" disabled>리포트</button>
          </div>
          <div class="tab-panel" role="tabpanel">선택한 탭의 내용이 여기에 표시됩니다.</div>
        </div>`, react: `
        import { useState } from "react";
        const TABS = ["개요", "이벤트", "정책"];
        export function DetailTabs() {
          const [cur, setCur] = useState(0);
          return (
            <div>
              <div className="tabs" role="tablist">
                {TABS.map((t, i) => (
                  <button key={t} type="button" role="tab" className={"tab" + (i === cur ? " on" : "")} aria-selected={i === cur} onClick={() => setCur(i)}>{t}</button>
                ))}
              </div>
              <div className="tab-panel" role="tabpanel">{TABS[cur]} 내용</div>
            </div>
          );
        }` },
      { id: "count", title: "With Count", desc: "탭마다 건수를 보여줄 때 .count.", html: `
        <div class="tabs" role="tablist" style="max-width:640px">
          <button type="button" class="tab on" role="tab" aria-selected="true">전체<span class="count">128</span></button>
          <button type="button" class="tab" role="tab" aria-selected="false">차단<span class="count">37</span></button>
          <button type="button" class="tab" role="tab" aria-selected="false">검토 필요<span class="count">5</span></button>
        </div>` },
      { id: "pill", title: "Pill", desc: "카드·패널 안의 보조 전환. 폭은 내용에 맞춤.", html: `
        <div class="tabs pill" role="tablist">
          <button type="button" class="tab on" role="tab" aria-selected="true">일간</button>
          <button type="button" class="tab" role="tab" aria-selected="false">주간</button>
          <button type="button" class="tab" role="tab" aria-selected="false">월간</button>
        </div>` },
      { id: "variant", title: "Small / Accent", desc: "밀도 높은 패널은 .sm, 제품 컬러 강조는 .accent.", html: `
        <div class="tabs sm accent" role="tablist" style="max-width:480px">
          <button type="button" class="tab on" role="tab" aria-selected="true">상세</button>
          <button type="button" class="tab" role="tab" aria-selected="false">타임라인</button>
          <button type="button" class="tab" role="tab" aria-selected="false">관련 이벤트</button>
        </div>` },
    ],
    props: [[".tabs", "container", "—", "role=tablist. 기본 Underline, 전체 폭"], [".tab", "button", "—", "role=tab, aria-selected. 활성 .on"], [".pill", "boolean", "false", "캡슐형(보조 전환)"], [".sm / .accent", "boolean", "false", "작은 크기 / 활성 색 accent"], [".count", "element", "—", "건수 배지"], ["disabled", "attribute", "—", "비활성 탭"]],
    spec: [["Size", "높이 44 (sm 38) · 탭 간격 24"], ["Container", "하단 1px line/neutral/secondary · 활성 2px"], ["Label", "14 Medium tertiary · 선택 14 Bold · pill 선택 14 SemiBold"], ["Placement", "페이지 헤더 아래, 카드 헤더 우측(pill)"]],
    figma: { frame: "Tab", sizes: { md: { h: 44 }, sm: { h: 38 } }, variants: { underline: {}, pill: { bg: "--surface-neutral-secondary" } }, states: ["default", "active", "hover", "disabled"] },
  },

  /* ------------------------------------------------ Breadcrumb */
  "breadcrumb": {
    status: "ready", react: ["Breadcrumb","BreadcrumbItem","BreadcrumbMore"], css: [".breadcrumb"],
    desc: "현재 위치의 계층 경로를 보여주고 상위로 돌아가게 합니다. 3단계 이상 깊은 상세 화면에 씁니다.",
    thumb: `<ol class="breadcrumb"><li><a href="#">정책</a></li><li><a href="#">USB 제어</a></li><li aria-current="page"><span>외부 저장장치 차단</span></li></ol>`,
    examples: [
      { id: "basic", title: "Default", desc: "nav > ol. 마지막 항목은 링크 없이 aria-current=page 이고, 라벨은 span 으로 감쌉니다 — 220px 를 넘으면 말줄임.", html: `
        <nav aria-label="현재 위치">
          <ol class="breadcrumb">
            <li><a href="#">정책</a></li>
            <li><a href="#">USB 제어</a></li>
            <li aria-current="page"><span>외부 저장장치 차단</span></li>
          </ol>
        </nav>` },
      { id: "collapsed", title: "Collapsed", desc: "가운데가 2개 이상일 때(5단계 이상) 접습니다. 첫 항목과 끝 2개는 남기고 가운데만 … 로 묶으며, 누르면 펼쳐집니다.", html: `
        <nav aria-label="현재 위치">
          <ol class="breadcrumb">
            <li><a href="#" class="icon" aria-label="홈">${I("home")}</a></li>
            <li><button type="button" class="more" aria-label="상위 경로 펼치기" data-items="정책|USB 제어">${I("dots",14)}</button></li>
            <li><a href="#">PC-2041</a></li>
            <li aria-current="page"><span>이벤트 #48213</span></li>
          </ol>
        </nav>` },
    ],
    props: [
      [".breadcrumb", "ol", "—", "<code>nav[aria-label]</code> 안의 ol. React <code>Breadcrumb</code> 의 <code>label</code> 이 그 aria-label"],
      ["li a", "link", "—", "상위 경로 링크(React <code>BreadcrumbItem href</code>). 220px 를 넘으면 말줄임 — 전체 문구는 <code>title</code> 로 함께"],
      ["li[aria-current=page] > span", "current", "—", "현재 페이지. 링크 없이 Semibold. 라벨을 <code>span</code> 으로 감싸야 말줄임이 걸립니다(li 가 flex) — React <code>current</code> 가 자동으로 감쌉니다"],
      ["a.icon", "boolean", "false", "홈 아이콘처럼 아이콘만 있는 링크. <code>aria-label</code> 필수 — 없으면 이름 없는 링크로 읽힙니다. 클릭 영역은 24×24"],
      [".more", "button", "—", "접힌 경로 펼치기(React <code>BreadcrumbMore</code>). 클릭 영역 24×24"],
      [".more[data-items]", "attribute", "—", "<b>필수</b> — 접은 경로를 <code>|</code> 로 이어 둡니다(<code>\"정책|USB 제어\"</code>). 누르면 그 자리에 링크로 펼치고 첫 링크로 포커스를 옮기며 <code>ds:expand</code> 를 발행합니다. 비어 있으면 아무 일도 하지 않습니다 — ds.js 담당. React 는 <code>BreadcrumbMore</code> 의 onClick 으로 직접 처리"],
      [".breadcrumb li a svg", "element", "—", "링크 앞 아이콘. 홈 아이콘 18 · <code>.more</code> 아이콘 14"],
    ],
    spec: [["Size", "높이 22(텍스트 행) · 아이콘이 들어간 행은 24 · 항목 간격 6"], ["Container", "없음(텍스트 행)"], ["Label", "Body/2 14 tertiary · 현재 primary Semibold"], ["Placement", "페이지 타이틀 위 8px"]],
    figma: { frame: "Breadcrumb", sizes: { md: { h: 22 }, icon: { h: 24 } }, variants: { default: {}, collapsed: {} }, states: ["default", "hover", "focus"] },
  },

  /* ------------------------------------------------ Pagination */
  "pagination": {
    status: "ready", react: ["Pagination","PaginationBar","paginate"], css: [".pagination", ".pagination-bar", ".dropdown", ".menu", ".menu-item"],
    desc: "긴 목록을 페이지로 나누어 이동합니다. 총 건수와 페이지 크기 선택을 함께 둡니다.",
    thumb: `<div class="pagination compact"><button>${I("chevron-left",16)}</button><button class="on">1</button><button>2</button><button>3</button><button>${I("chevron-right",16)}</button></div>`,
    examples: [
      { id: "basic", title: "Default", desc: "이전/다음 + 번호. 현재 .on + aria-current. 첫 페이지에서는 이전 비활성.", html: `
        <nav class="pagination" aria-label="페이지">
          <button type="button" aria-label="이전" disabled>${I("chevron-left",16)}</button>
          <button type="button" class="on" aria-current="page">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
          <button type="button">4</button>
          <span class="gap">…</span>
          <button type="button">24</button>
          <button type="button" aria-label="다음">${I("chevron-right",16)}</button>
        </nav>`, react: `
        import { useState } from "react";
        import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
        export function Pager({ total = 24 }: { total?: number }) {
          const [page, setPage] = useState(1);
          const nums = [1, 2, 3, 4].filter(n => n <= total);
          return (
            <nav className="pagination" aria-label="페이지">
              <button type="button" aria-label="이전" disabled={page === 1} onClick={() => setPage(p => p - 1)}><IconChevronLeft size={16} /></button>
              {nums.map(n => (
                <button key={n} type="button" className={n === page ? "on" : ""} aria-current={n === page ? "page" : undefined} onClick={() => setPage(n)}>{n}</button>
              ))}
              <span className="gap">…</span>
              <button type="button" className={page === total ? "on" : ""} onClick={() => setPage(total)}>{total}</button>
              <button type="button" aria-label="다음" disabled={page === total} onClick={() => setPage(p => p + 1)}><IconChevronRight size={16} /></button>
            </nav>
          );
        }` },
      { id: "variant", title: "Compact / Outline", html: `
        <nav class="pagination compact" aria-label="페이지">
          <button type="button" aria-label="이전">${I("chevron-left",16)}</button><button type="button">7</button><button type="button" class="on" aria-current="page">8</button><button type="button">9</button><button type="button" aria-label="다음">${I("chevron-right",16)}</button>
        </nav>
        <nav class="pagination outline" aria-label="페이지">
          <button type="button" aria-label="이전" disabled>${I("chevron-left",16)}</button><button type="button" class="on" aria-current="page">1</button><button type="button">2</button><button type="button">3</button><button type="button" aria-label="다음">${I("chevron-right",16)}</button>
        </nav>` },
      { id: "bar", title: "Pagination Bar", desc: "테이블 하단. 총 건수 · 페이지 크기 · 페이지 이동.", html: `
        <div class="pagination-bar">
          <span>총 <b>1,284</b>건 · 1–50</span>
          <div style="display:flex;align-items:center;gap:12px">
            <div class="dropdown"><button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="false">50개씩</button></div>
            <nav class="pagination compact" aria-label="페이지"><button type="button" aria-label="이전" disabled>${I("chevron-left",16)}</button><button type="button" class="on" aria-current="page">1</button><button type="button">2</button><button type="button">3</button><span class="gap">…</span><button type="button">26</button><button type="button" aria-label="다음">${I("chevron-right",16)}</button></nav>
          </div>
        </div>` },
    ],
    props: [[".pagination", "nav", "—", "aria-label=페이지. 버튼 36 (compact 32)"], ["button.on", "current", "—", "현재 페이지 + aria-current=page"], [".gap", "span", "—", "생략(…). 글자 크기는 놓인 곳을 따른다 — 단독이면 앱 기본 글자, .pagination-bar 안이면 12(번호 버튼은 14 · compact 12 로 정해져 있다)"], [".compact / .outline", "boolean", "false", "작은 크기 / 보더형"], [".pagination-bar", "container", "—", "총 건수 + 페이지 크기 + 페이지네이션"]],
    spec: [["Size", "버튼 36 (compact 32) · 간격 4"], ["Container", "radius/md · 현재 brand"], ["Label", "Body/2 14 · 현재 Semibold"], ["Placement", "테이블 하단 우측, 총 건수는 좌측"]],
    figma: { frame: "Pagination", radius: "radius/md", sizes: { md: { h: 36 }, compact: { h: 32 } }, variants: { default: {}, outline: { stroke: "--line-neutral-secondary" } }, states: ["default", "current", "hover", "disabled"] },
  },

  /* ------------------------------------------------ Navigation */
  "navigation": {
    status: "ready", react: ["SideNav","SideNavGroup","SideNavItem"], css: [".sidenav", ".count"],
    desc: "콘솔 좌측의 1차 내비게이션입니다. 그룹 라벨로 메뉴를 묶고 현재 위치를 .on 으로 표시합니다. 폭 240, 접으면 64.",
    thumb: `<div class="sidenav" style="width:180px;min-height:0;border:1px solid var(--line-neutral-secondary);border-radius:8px"><a href="#" class="on" aria-current="page">${I("home")}<span>대시보드</span></a><a href="#">${I("list")}<span>이벤트</span></a><a href="#">${I("shield")}<span>정책</span></a></div>`,
    examples: [
      { id: "basic", title: "Default", desc: "그룹 라벨(.group) + 링크. 아이콘 18px, 건수는 .count. 하위 항목은 .sub.", html: `
        <nav class="sidenav" aria-label="주 메뉴" style="border:1px solid var(--line-neutral-secondary);border-radius:var(--radius-lg)">
          <a href="#" class="on" aria-current="page">${I("home")}<span>대시보드</span></a>
          <a href="#">${I("list")}<span>이벤트</span><span class="count">12</span></a>
          <div class="group">보호</div>
          <a href="#">${I("shield")}<span>정책</span></a>
          <a href="#" class="sub">USB 제어</a>
          <a href="#" class="sub">네트워크</a>
          <a href="#">${I("server")}<span>에이전트</span></a>
          <div class="group">관리</div>
          <a href="#">${I("user")}<span>사용자</span></a>
          <a href="#">${I("settings")}<span>설정</span></a>
          <div class="foot">v2.4.1 · 라이선스 정상</div>
        </nav>`, layout: "left" },
      { id: "collapsed", title: "Collapsed", desc: "1280 이하 또는 사용자가 접었을 때. 아이콘만, 라벨은 툴팁으로. 하위 항목과 .foot 은 숨고, 현재 메뉴가 하위 항목이면 부모(.has-on)가 선택 모양을 이어받습니다.", html: `
        <nav class="sidenav collapsed" aria-label="주 메뉴" style="border:1px solid var(--line-neutral-secondary);border-radius:var(--radius-lg)">
          <a href="#" class="on" aria-current="page" title="대시보드">${I("home")}<span>대시보드</span></a>
          <a href="#" title="이벤트">${I("list")}<span>이벤트</span></a>
          <a href="#" title="정책">${I("shield")}<span>정책</span></a>
          <a href="#" title="에이전트">${I("server")}<span>에이전트</span></a>
          <a href="#" title="설정">${I("settings")}<span>설정</span></a>
        </nav>`, layout: "left" },
    ],
    props: [[".sidenav", "nav", "—", "폭 240, 세로 링크 목록"], [".group", "div", "—", "그룹 라벨(uppercase caption)"], ["a.on", "current", "—", "현재 메뉴(brand subtle)"], ["a.sub", "child", "—", "하위 항목(들여쓰기). 선택(.on)되면 brand 글자"], ["a.has-on", "parent", "—", "하위 항목이 현재 메뉴인 부모. 펼친 레일에서는 그대로, 접힌 레일에서는 하위 항목이 숨으니 선택 모양이 된다. 접힌 레일에서는 aria-current=\"true\" 도 함께(React hasActiveChild 는 자동)"], [".collapsed", "boolean", "false", "폭 64, 아이콘만"], [".count", "element", "—", "미확인 건수"]],
    spec: [["Size", "폭 240 (접힘 64) · 항목 높이 38.4 (padding 8 · 글자 14 · 행간 1.6)"], ["Container", "surface/elevated/primary · 우측 1px line/neutral/secondary"], ["Label", "항목 14 Medium · 선택 14 SemiBold · 그룹 12 SemiBold uppercase"], ["Placement", "헤더 아래 좌측 고정, 전체 높이"]],
    figma: { frame: "Navigation", radius: "radius/md", sizes: { expanded: { w: 240 }, collapsed: { w: 64 }, item: { h: 38.4 } }, variants: { default: {}, collapsed: { hasOn: { bg: "--surface-brand-subtle", icon: "--foreground-brand-primary" } }, selected: { bg: "--surface-brand-subtle", fg: "--foreground-brand-primary" }, sub: { fg: "--foreground-neutral-secondary", selected: { fg: "--foreground-brand-primary" } } }, states: ["default", "hover", "active", "sub selected"] },
  },

  /* ------------------------------------------------ Top Navigation */
  "top-navigation": {
    status: "ready", react: ["TopBar","TopBarLogo","TopBarNav","TopBarNavItem","TopBarRight","Avatar"], css: [".topbar", ".avatar", ".searchbar", ".divider", ".count", ".with-count"], borrows: [".btn"],
    desc: "제품 상단 바입니다. 제품 로고 · 1차 메뉴(사이드 내비가 없는 제품) · 전역 검색 · 알림 · 사용자 메뉴로 구성합니다.",
    thumb: `<div class="topbar" style="height:44px;padding:0 12px;border-radius:8px;border:1px solid var(--line-neutral-secondary);width:260px"><span class="logo"><i></i>Console</span><span class="right"><span class="avatar sm">JH</span></span></div>`,
    examples: [
      { id: "basic", title: "Default", desc: "로고 + 메뉴 + 우측 액션. 현재 메뉴는 .on.", html: `
        <header class="topbar" style="border-radius:var(--radius-lg);border:1px solid var(--line-neutral-secondary)">
          <a href="#" class="logo"><i></i>Security Console <small>v2.4</small></a>
          <nav aria-label="주 메뉴"><a href="#" class="on" aria-current="page">대시보드</a><a href="#">이벤트</a><a href="#">정책</a><a href="#">에이전트</a></nav>
          <div class="right">
            <span class="with-count"><button type="button" class="btn sm assistive icon-only" aria-label="알림 3건">${I("bell")}</button><span class="count">3</span></span>
            <button type="button" class="btn sm assistive icon-only" aria-label="설정">${I("settings")}</button>
            <span class="divider vertical" role="separator" aria-orientation="vertical"></span>
            <span class="avatar" title="정희 · 관리자">JH</span>
          </div>
        </header>` },
      { id: "search", title: "With Search", desc: "사이드 내비가 있는 제품은 상단 메뉴 대신 전역 검색을 둡니다.", html: `
        <header class="topbar" style="border-radius:var(--radius-lg);border:1px solid var(--line-neutral-secondary)">
          <a href="#" class="logo"><i></i>Security Console</a>
          <div class="searchbar" role="search" style="margin-left:16px">${I("search")}<input type="search" placeholder="이벤트, 대상, IP 검색" aria-label="전역 검색"><kbd>/</kbd></div>
          <div class="right">
            <span class="with-count"><button type="button" class="btn sm assistive icon-only" aria-label="알림">${I("bell")}</button><span class="count dot" aria-hidden="true"></span></span>
            <span class="avatar">JH</span>
          </div>
        </header>` },
    ],
    props: [[".topbar", "header", "—", "높이 56, 하단 1px"], [".logo", "a", "—", "제품 마크(i) + 이름 + small 버전"], ["nav a.on", "current", "—", "현재 1차 메뉴"], [".right", "container", "—", "우측 액션(알림·설정·아바타)"], [".avatar", "span", "—", "이니셜 32 (sm 24)"]],
    spec: [["Size", "높이 56 · 좌우 padding 20"], ["Container", "surface/elevated/primary · 하단 line/neutral/secondary"], ["Label", "메뉴 14 Medium secondary · 로고 16 Bold"], ["Placement", "최상단 고정(sticky)"]],
    figma: { frame: "Top Navigation", sizes: { md: { h: 56 } }, variants: { menu: {}, search: {} }, states: ["default", "active"] },
  },

  /* ------------------------------------------------ Accordion */
  "accordion": {
    status: "ready", react: ["Accordion","AccordionGroup"], css: [".accordion", ".accordion-group"],
    desc: "긴 설명이나 고급 설정을 접어 두고 필요할 때 펼칩니다. 네이티브 <code>details/summary</code> 를 써 JS 없이 동작하며, 펼침 상태 전달과 키보드 조작(Tab · Enter · Space)도 브라우저 기본 동작이라 기본·그룹에는 별도 ARIA 가 필요 없습니다. 예외는 비활성뿐입니다 — <code>pointer-events</code> 와 <code>tabindex=\"-1\"</code> 은 마우스·키보드만 막고 스크린리더에는 아무것도 알리지 않으므로 <code>aria-disabled=\"true\"</code> 를 함께 둡니다.",
    thumb: `<details class="accordion" open style="min-width:200px"><summary style="padding:10px 14px;font-size:12px">고급 설정</summary><div class="body" style="padding:0 14px 10px;font-size:12px">내용</div></details>`,
    examples: [
      { id: "basic", title: "Default", desc: "details.accordion > summary + .body. open 속성으로 초기 펼침.", layout: "top", html: `
        <details class="accordion" open style="max-width:560px">
          <summary>고급 탐지 옵션 <small>3개 설정</small></summary>
          <div class="body">휴리스틱 분석, 메모리 스캔, 스크립트 차단을 개별로 켜고 끕니다. 기본값은 모두 켬입니다.</div>
        </details>` },
      { id: "group", title: "Group", desc: "여러 항목. 하나만 펼치려면 같은 name 을 줍니다(브라우저 지원 시).", layout: "top", html: `
        <div class="accordion-group" style="max-width:560px">
          <details class="accordion" name="faq" open><summary>정책은 언제 적용되나요?</summary><div class="body">배포 버튼을 누른 뒤 에이전트가 다음 체크인(최대 5분)에서 받아 적용합니다.</div></details>
          <details class="accordion" name="faq"><summary>차단된 파일은 어디에 보관되나요?</summary><div class="body">격리 저장소에 30일 보관 후 자동 삭제됩니다.</div></details>
          <details class="accordion" name="faq"><summary>예외 처리는 어떻게 하나요?</summary><div class="body">정책 › 예외 목록에서 해시 또는 경로를 등록합니다.</div></details>
        </div>` },
      { id: "flat", title: "Flat / Disabled", desc: "카드 안에서는 보더 없는 .flat — 배경·여백·radius 는 .accordion-group.flat 이 그립니다. 권한이 없으면 .disabled.", html: `
        <div class="accordion-group flat" style="max-width:560px">
          <details class="accordion flat" open><summary>일반</summary><div class="body">정책 이름, 설명, 적용 그룹</div></details>
          <details class="accordion flat"><summary>스케줄</summary><div class="body">적용 요일과 시간대</div></details>
          <details class="accordion flat disabled"><summary tabindex="-1" aria-disabled="true">감사 로그 <small>권한 필요</small></summary><div class="body">관리자 권한이 있어야 열람할 수 있습니다.</div></details>
        </div>` },
    ],
    props: [
      ["details.accordion", "container", "—", "summary + .body. 제목은 React <code>title</code>"],
      ["open", "attribute", "—", "펼침 상태. React 는 <code>open</code>(제어) 또는 <code>defaultOpen</code> + <code>onOpenChange</code>"],
      ["name", "attribute", "—", "같은 name 은 하나만 펼침(브라우저 지원 시)"],
      [".flat", "boolean", "false", "보더 없는 구분선형. 마지막 항목은 아래 선을 지웁니다"],
      [".disabled", "boolean", "false", "펼칠 수 없음 — summary 에 <code>tabindex=\"-1\"</code> 과 <code>aria-disabled=\"true\"</code> 를 함께 둡니다(React <code>disabled</code> 가 둘 다 넣습니다)"],
      ["summary small", "element", "—", "우측 보조 정보(React <code>extra</code>). 제목 앞 아이콘은 <code>summary &gt; svg</code> 로 두면 16~18 로 고정됩니다"],
      [".body", "element", "—", "본문. 높이를 제한하려면 <code>max-height</code> + <code>overflow</code>(React <code>bodyStyle</code>)"],
      [".accordion-group", "container", "—", "여러 항목 묶음(8px 간격). React <code>AccordionGroup</code>"],
      [".accordion-group.flat", "boolean", "false", "카드형 묶음 — 간격 0 에 Surface 배경 · 1px line/neutral/secondary 보더 · 좌우 20 · radius/lg. 항목에는 <code>.flat</code> 을 함께"],
    ],
    spec: [["Size", "헤더 높이 52 · 본문 padding 0 20 16"], ["Container", "radius/lg 8 · line/neutral/secondary"], ["Label", "제목 16 SemiBold · 본문 Body/2 14 secondary"], ["Placement", "설정 폼의 고급 옵션, FAQ"], ["Motion", "본문 높이는 --motion-base 로 보간(::details-content 미지원 브라우저는 즉시 열림) · 셰브론은 --motion-fast 로 회전"]],
    figma: { frame: "Accordion", radius: "radius/lg", sizes: { md: { h: 52 } }, variants: { default: { stroke: "--line-neutral-secondary" }, flat: {} }, states: ["collapsed", "expanded", "disabled"] },
  },

  /* ------------------------------------------------ Card */
  "card": {
    status: "ready", react: ["Card","CardHead","CardTitle","CardDesc","CardFoot","CardGrid"], css: [".card", ".card-grid"], borrows: [".tag", ".btn", ".select-btn", ".sparkline", ".skeleton", ".tbl"],
    desc: "관련 정보와 액션을 한 덩어리로 묶는 컨테이너입니다. Surface 배경 + 1px line/neutral/secondary 보더로 구획합니다.",
    thumb: `<div class="card compact" style="min-width:200px"><div class="card-head"><h3 class="title" style="font-size:14px">라이선스</h3><span class="tag ok sm">정상</span></div><p class="desc" style="font-size:12px">2026-12-31 만료</p></div>`,
    examples: [
      { id: "basic", title: "Default", desc: "head(제목 + 상태) · desc · foot(액션 우측). Surface 배경과 1px 보더로 구획하고 그림자는 두지 않습니다.", html: `
        <div class="card" style="width:360px">
          <div class="card-head"><h3 class="title">라이선스</h3><span class="tag ok">정상</span></div>
          <p class="desc">1,000석 중 842석 사용 중. 2026-12-31 만료.</p>
          <div class="card-foot"><button type="button" class="btn sm outline assistive">상세</button><button type="button" class="btn sm solid primary">갱신</button></div>
        </div>` },
      { id: "header", title: "Header Actions", desc: "헤더 우측에 기간 선택(Select Button) 또는 더 보기 메뉴. 패널이 없으니 탭이 아니라 role=group + aria-pressed 를 씁니다.", html: `
        <div class="card" style="width:360px">
          <div class="card-head"><h3 class="title">주간 탐지 추이</h3><div class="select-btn" role="group" aria-label="기간"><button type="button" class="on" aria-pressed="true">7일</button><button type="button" aria-pressed="false">30일</button></div></div>
          <div class="sparkline" aria-hidden="true"><i style="height:30%"></i><i style="height:45%"></i><i style="height:38%"></i><i style="height:70%"></i><i style="height:55%"></i><i style="height:90%" class="hi"></i><i style="height:62%"></i></div>
          <p class="desc">이번 주 탐지 <b>412</b>건, 지난주보다 18% 증가</p>
        </div>` },
      { id: "variant", title: "Compact", desc: "밀도 높은 그리드는 .compact. 카드 위에 카드를 겹쳐도 기본 카드의 1px 보더로 구분됩니다.", html: `
        <div class="card compact" style="width:280px"><h3 class="title">Compact</h3><p class="desc">padding 16 · 제목 14</p></div>` },
      { id: "flush", title: "Flush", desc: "표를 카드 폭까지 채울 때는 .flush — padding · gap 0, 머리만 16 · 24. 안에는 테두리 없는 표(.tbl)를 둡니다. .tbl-wrap 과 List 는 자체 테두리가 있어 두 겹이 됩니다.", html: `
        <div class="card flush" style="width:400px">
          <div class="card-head"><h3 class="title">최근 이벤트</h3><button type="button" class="btn sm text">전체 보기</button></div>
          <table class="tbl compact">
            <thead><tr><th>시간</th><th>이벤트</th><th class="num">횟수</th></tr></thead>
            <tbody>
              <tr><td>09:41</td><td>USB 연결 차단</td><td class="num">3</td></tr>
              <tr><td>09:12</td><td>악성 URL 접속 시도</td><td class="num">12</td></tr>
              <tr><td>08:57</td><td>정책 위반 파일 전송</td><td class="num">1</td></tr>
            </tbody>
          </table>
        </div>` },
      { id: "clickable", title: "Clickable / Selected", desc: "카드 전체가 눌리면 .clickable. 이동이면 a, 선택이면 button + aria-pressed 로 두고 선택된 것에 .on 을 줍니다.", html: `
        <div class="card-grid" style="max-width:600px">
          <button type="button" class="card clickable" aria-pressed="false"><h3 class="title">USB 제어</h3><p class="desc">정책 12개</p></button>
          <button type="button" class="card clickable on" aria-pressed="true"><h3 class="title">네트워크</h3><p class="desc">정책 8개 · 선택됨</p></button>
        </div>` },
      { id: "loading", title: "Loading", desc: "데이터를 기다리는 동안 내용 자리에 Skeleton 을 넣고 컨테이너에 aria-busy 를 둡니다. 로드되면 같은 자리를 실제 내용으로 바꿥니다.", html: `
        <div class="card" style="width:360px" aria-busy="true">
          <span class="skeleton title"></span>
          <span class="skeleton text"></span>
          <span class="skeleton text short"></span>
        </div>` },
    ],
    props: [
      [".card", "container", "—", "flex column · gap 12 · padding 24 · 최소 폭 260. React <code>Card</code>"],
      [".card-head / .title / .desc / .card-foot", "elements", "—", "헤더(양끝 정렬) / 제목 Title/1 16·24 / 설명 Body/2 14 / 푸터 우측 정렬 — React <code>CardHead</code>·<code>CardTitle</code>·<code>CardDesc</code>·<code>CardFoot</code>"],
      [".bordered", "boolean", "false", "<b>호환용 — 효과 없음.</b> 기본 카드가 이미 1px 보더라 새 코드에서는 쓰지 않습니다"],
      [".compact", "boolean", "false", "padding 16 · gap 8 · 제목 14(Title/2)"],
      [".flush", "boolean", "false", "padding·gap 0 — 표를 카드 폭까지 꽉 채울 때. 헤더만 자체 여백을 갖습니다. 안에는 테두리 없는 .tbl 을 둡니다(.tbl-wrap · List 는 자체 테두리가 있어 두 겹)"],
      [".clickable", "boolean", "false", "카드 전체가 눌림. <b>이동이면 <code>a</code>, 선택이면 <code>button</code> + <code>aria-pressed</code></b>. hover 에 shadow/2. React <code>clickable</code> + <code>as</code>"],
      [".card-grid .card.clickable", "behavior", "—", "ds.js 가 단일 선택으로 묶어 <code>.on</code> 과 <code>aria-pressed</code> 를 함께 갱신하고 <code>ds:select</code> 를 발행합니다"],
      [".on", "boolean", "false", "선택됨 — 안쪽 2px brand 링 + <code>--surface-brand-subtle</code> 배경. 포커스 링(outline)과 겹치지 않아 둘이 동시에 보입니다. React <code>selected</code>"],
      ["aria-busy", "attribute", "—", "불러오는 중 — 내용 대신 <code>.skeleton</code> 을 넣고 컨테이너에 둡니다. React <code>loading</code> 이 둘을 함께 처리합니다"],
      [".card-grid", "container", "—", "auto-fill minmax(260px,1fr) 그리드 · gap 20. React <code>CardGrid</code>"],
    ],
    spec: [["Size", "최소 폭 260 · padding 24 (compact 16 · flush 0)"], ["Container", "radius/lg 8 · 1px line/neutral/secondary · surface/elevated/primary"], ["Label", "제목 16 SemiBold · 설명 Body/2 14 secondary"], ["Placement", "대시보드 그리드(gap 20), 상세 패널"], ["Motion", "clickable 은 --motion-fast 로 그림자 없음 → shadow/2"]],
    figma: { frame: "Card", radius: "radius/lg", sizes: { md: { pad: 24 }, compact: { pad: 16 }, flush: { pad: 0 } }, variants: { default: { bg: "--surface-elevated-primary", stroke: "--line-neutral-secondary" }, bordered: { stroke: "--line-neutral-secondary" } }, states: ["default", "hover", "selected", "focused", "loading"] },
  },

  /* ------------------------------------------------ Popup */
  "popup": {
    status: "ready", react: ["Popup","PopupSurface","PopupTitle","PopupBody","PopupActions","PopupForm"], css: [".popup", ".popup-backdrop"], borrows: [".btn", ".field", ".checkbox"],
    desc: "사용자의 확인이나 짧은 입력이 필요할 때 화면 위에 띄우는 모달입니다. 되돌리기 어려운 동작 앞에 반드시 둡니다.",
    thumb: `<div class="popup" style="width:220px;padding:14px;gap:6px"><h3 class="popup-title" style="font-size:12px">정책 삭제</h3><p class="popup-body" style="font-size:12px">되돌릴 수 없습니다.</p><div class="popup-actions" style="margin-top:4px"><button class="btn sm outline assistive" style="height:26px;font-size:12px">취소</button><button class="btn sm solid negative" style="height:26px;font-size:12px">삭제</button></div></div>`,
    examples: [
      { id: "default", title: "Default", desc: "제목 · 본문 · 액션으로 이루어진 기본 구성입니다.", html: `
        <div class="popup" role="dialog" aria-modal="true" aria-labelledby="d-title">
          <h3 class="popup-title" id="d-title">정책을 배포할까요?</h3>
          <p class="popup-body">변경 사항이 1,284대에 적용됩니다.</p>
          <div class="popup-actions"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="button" class="btn md solid primary">배포</button></div>
        </div>
      ` },
      { id: "confirm", title: "Confirm", desc: "실제 화면에서는 .popup-backdrop 으로 감쌉니다(코드 참조). 예제는 팝업만 표시.", html: `
        <div class="popup" role="dialog" aria-modal="true" aria-labelledby="c-title">
          <h3 class="popup-title" id="c-title">정책을 배포할까요?</h3>
          <p class="popup-body">변경 사항이 12개 그룹, 1,284대에 적용됩니다. 에이전트는 다음 체크인(최대 5분)에서 정책을 받습니다.</p>
          <div class="popup-actions"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="button" class="btn md solid primary">배포</button></div>
        </div>`, react: `
        import { useState } from "react";
        export function DeployConfirm() {
          const [open, setOpen] = useState(false);
          return (
            <>
              <button type="button" className="btn md solid primary" onClick={() => setOpen(true)}>배포</button>
              {open && (
                <div className="popup-backdrop" onClick={() => setOpen(false)}>
                  <div className="popup" role="dialog" aria-modal="true" aria-labelledby="c-title" onClick={e => e.stopPropagation()}>
                    <h3 className="popup-title" id="c-title">정책을 배포할까요?</h3>
                    <p className="popup-body">변경 사항이 12개 그룹, 1,284대에 적용됩니다.</p>
                    <div className="popup-actions">
                      <button type="button" className="btn md outline assistive" onClick={() => setOpen(false)}>취소</button>
                      <button type="button" className="btn md solid primary" onClick={() => setOpen(false)}>배포</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        }` },
      { id: "danger", title: "Danger Confirm", desc: "삭제·초기화. 제목은 danger 색, 주 액션은 Negative 버튼, 필요하면 확인 입력.", html: `
        <div class="popup danger" role="dialog" aria-modal="true" aria-labelledby="d-title">
          <h3 class="popup-title" id="d-title">정책 12개를 삭제할까요?</h3>
          <p class="popup-body">삭제한 정책은 복구할 수 없습니다. 해당 정책이 적용된 에이전트는 기본 정책으로 돌아갑니다.</p>
          <div class="field"><label for="confirm">확인을 위해 "삭제" 를 입력하세요</label><input id="confirm" placeholder="삭제"></div>
          <div class="popup-actions"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="button" class="btn md solid negative" disabled>삭제</button></div>
        </div>` },
      { id: "form", title: "Form", desc: "짧은 입력(필드 1~3개). 그 이상은 별도 페이지나 드로어.", html: `
        <div class="popup" role="dialog" aria-modal="true" aria-labelledby="f-title">
          <h3 class="popup-title" id="f-title">예외 추가</h3>
          <div class="popup-form">
            <div class="field"><label for="hash">파일 해시(SHA-256)</label><input id="hash" placeholder="64자리 16진수"></div>
            <div class="field"><label for="reason">사유</label><input id="reason" placeholder="예: 사내 배포 도구"></div>
            ${cb("모든 그룹에 적용")}
          </div>
          <div class="popup-actions"><button type="button" class="btn md outline assistive" data-popup-close>취소</button><button type="button" class="btn md solid primary">추가</button></div>
        </div>` },
    ],
    props: [[".popup-backdrop", "overlay", "—", "fixed, rgba(15,23,42,.65), 중앙 정렬"], [".popup", "dialog", "—", "role=dialog aria-modal aria-labelledby. 폭 440 (lg 640)"], [".popup-title / .popup-body / .popup-actions", "elements", "—", "제목 18 / 본문 14 / 액션 우측"], [".danger", "boolean", "false", "제목 danger 색"], [".popup-form", "container", "—", "필드 세로 16px 간격"]],
    spec: [["Size", "폭 440 (lg 640) · padding 24"], ["Container", "radius/xl 10 · shadow/3 · 배경 음영 65%"], ["Label", "제목 Heading/4 18 Bold · 본문 Body/2 14"], ["Placement", "화면 중앙. 열릴 때 포커스 이동, ESC 로 닫힘"]],
    figma: { frame: "Popup", radius: "radius/xl", sizes: { md: { w: 440 }, lg: { w: 640 } }, variants: { confirm: {}, danger: {}, form: {} }, states: ["default"] },
  },

  /* ------------------------------------------------ Tooltip */
  "tooltip": {
    status: "ready", react: ["Tooltip"], css: [".tooltip", ".tooltip-wrap"], borrows: [".btn", ".indicator"],
    desc: "아이콘 버튼의 이름이나 짧은 보조 설명을 hover/focus 시 보여줍니다. 필수 정보를 툴팁에만 두지 않습니다.",
    thumb: `<span class="tooltip-wrap show"><button class="btn sm outline assistive icon-only" aria-label="새로 고침">${I("refresh")}</button><span class="tooltip" role="tooltip">새로 고침</span></span>`,
    examples: [
      { id: "default", title: "Default", desc: "요소 위쪽에 뜨는 기본 위치입니다.", html: `<span class="tooltip-wrap show"><button type="button" class="btn md outline assistive">새로 고침</button><span class="tooltip" role="tooltip">목록을 다시 불러옵니다</span></span>` },
      { id: "position", title: "Position", desc: "기본 위. .bottom / .left / .right. 예제는 .show 로 항상 표시.", html: `
        <span class="tooltip-wrap show"><button type="button" class="btn md outline assistive">Top</button><span class="tooltip" role="tooltip">위 (기본)</span></span>
        <span class="tooltip-wrap show"><button type="button" class="btn md outline assistive">Bottom</button><span class="tooltip bottom" role="tooltip">아래</span></span>
        <span class="tooltip-wrap show"><button type="button" class="btn md outline assistive">Left</button><span class="tooltip left" role="tooltip">왼쪽</span></span>
        <span class="tooltip-wrap show"><button type="button" class="btn md outline assistive">Right</button><span class="tooltip right" role="tooltip">오른쪽</span></span>`, style: "gap:104px;padding:64px 40px" },
      { id: "hover", title: "On Hover / Focus", desc: "실제 동작. 아이콘 버튼 위에 마우스를 올리거나 포커스하세요. aria-describedby 로 연결.", html: `
        <span class="tooltip-wrap"><button type="button" class="btn md outline assistive icon-only" aria-label="새로 고침" aria-describedby="tt1">${I("refresh")}</button><span class="tooltip" role="tooltip" id="tt1">새로 고침</span></span>
        <span class="tooltip-wrap"><button type="button" class="btn md outline assistive icon-only" aria-label="필터" aria-describedby="tt2">${I("filter")}</button><span class="tooltip" role="tooltip" id="tt2">필터</span></span>
        <span class="tooltip-wrap"><button type="button" class="btn md outline negative icon-only" aria-label="삭제" aria-describedby="tt3">${I("trash")}</button><span class="tooltip" role="tooltip" id="tt3">삭제</span></span>`, style: "padding-top:64px" },
      { id: "multi", title: "Multiline", desc: "두 줄 이상은 .multi (폭 220). 그 이상 설명은 Popover/도움말 링크.", html: `
        <span class="tooltip-wrap show"><span class="indicator warn">검토 필요</span><span class="tooltip multi" role="tooltip">서명이 확인되지 않은 실행 파일입니다. 24시간 내 처리하지 않으면 자동 차단됩니다.</span></span>`, style: "padding-top:96px" },
    ],
    props: [[".tooltip-wrap", "container", "—", "position:relative 트리거 래퍼"], [".tooltip", "span", "—", "role=tooltip. 기본 위치 위"], ["position", ".bottom | .left | .right", "top", "위치"], [".show", "boolean", "false", "강제 표시(문서·디버그)"], [".multi", "boolean", "false", "여러 줄, 폭 220"]],
    spec: [["Size", "높이 30 · padding 6 10 · 트리거와 8px"], ["Container", "radius 6 · surface/neutral/inverse · shadow/2 · 화살표 5px"], ["Label", "Caption/1 12 · 행간 18 · Medium · inverse"], ["Placement", "아이콘 전용 버튼 필수, 잘린 텍스트, 차트 값"]],
    figma: { frame: "Tooltip", radius: 6, sizes: { md: { h: 30 } }, variants: { top: {}, bottom: {}, left: {}, right: {} }, states: ["default", "multiline"] },
  },

  /* ------------------------------------------------ Notification */
  "notification": {
    status: "ready", react: ["Notice","Toast","ToastStack","Banner","ToastProvider","useToast"], css: [".notice", ".toast", ".toast-stack", ".banner"], borrows: [".btn"],
    desc: "시스템 상태와 결과를 알립니다. 페이지 안에 머무는 Notice, 잠시 떴다 사라지는 Toast, 화면 상단 전체 공지 Banner 를 구분합니다.",
    thumb: `<div class="notice warning" style="max-width:240px;padding:10px 12px;font-size:12px"><span class="ico">${I("alert-triangle",20)}</span><div><b>라이선스 만료 임박</b>3일 후 만료</div></div>`,
    examples: [
      { id: "default", title: "Default", desc: "본문 안에 머무는 기본 인라인 알림입니다.", html: `<div class="notice info" role="status" style="max-width:600px"><span class="ico">${I("info-circle")}</span><div><b>정책이 아직 배포되지 않았습니다</b>변경 사항은 '배포'를 눌러야 에이전트에 적용됩니다.</div></div>` },
      { id: "notice", title: "Notice (Inline)", desc: "페이지에 고정. Info · Success · Warning · Danger. role=status(정보) 또는 alert(위험).", html: `
        <div class="notice info" role="status" style="max-width:600px"><span class="ico">${I("info-circle",20)}</span><div><b>정책이 아직 배포되지 않았습니다</b>변경 사항은 '배포'를 눌러야 에이전트에 적용됩니다.</div><button type="button" class="close" aria-label="닫기">${I("x",14)}</button></div>
        <div class="notice success" role="status" style="max-width:600px"><span class="ico">${I("circle-check",20)}</span><div><b>배포 완료</b>1,284대 중 1,284대에 적용되었습니다.</div></div>
        <div class="notice warning" role="status" style="max-width:600px"><span class="ico">${I("alert-triangle",20)}</span><div><b>라이선스가 3일 후 만료됩니다</b>만료 시 신규 이벤트 수집이 중단됩니다.<div class="actions"><button type="button" class="btn sm solid primary">갱신 요청</button></div></div></div>
        <div class="notice danger" role="alert" style="max-width:600px"><span class="ico">${I("alert-circle",20)}</span><div><b>에이전트 37대 연결 끊김</b>10분 이상 체크인이 없습니다. 네트워크 상태를 확인하세요.</div></div>`, layout: "stack" },
      { id: "toast", title: "Toast", desc: "짧은 결과 알림. 우측 하단, 3~5초 후 자동 소멸, 실행 취소 액션 가능. aria-live=polite.", html: `
        <div class="toast-stack" aria-live="polite">
          <div class="toast"><span class="ico">${I("circle-check",20)}</span>정책 'USB 차단' 이 저장되었습니다<button type="button" class="action">실행 취소</button></div>
          <div class="toast danger"><span class="ico">${I("alert-circle",20)}</span>내보내기에 실패했습니다<button type="button" class="action">다시 시도</button></div>
        </div>` },
      { id: "banner", title: "Banner", desc: "시스템 전체 공지(점검·라이선스). 헤더 위 전체 폭, 닫기 가능.", html: `
        <div class="banner" role="status">${I("info-circle")}9월 10일 02:00~04:00 정기 점검이 예정되어 있습니다. 점검 중 콘솔 접속이 제한됩니다.<button type="button" class="btn sm outline assistive">자세히</button></div>`, layout: "stack", style: "padding:24px 0;gap:8px" },
    ],
    props: [[".notice", "div", "—", "role=status | alert. .ico + div(b 제목 + 본문 + .actions) + .close"], ["tone", "info | success | warning | danger", "neutral", "톤별 subtle 배경 + 30% 보더"], [".toast", "div", "—", "폭 360, 어두운 배경. .action 하나"], [".toast-stack", "container", "—", "aria-live=polite, 우측 하단 고정"], [".banner", "div", "—", "전체 폭. accent / .warning / .danger"]],
    spec: [["Size", "Notice 최소 높이 56 · Toast 폭 360 · Banner 높이 44"], ["Container", "Notice radius/lg 8 · tone subtle + 30% 보더 · Toast surface/neutral/inverse"], ["Label", "제목 14 Bold · 본문 Body/2 14"], ["Placement", "Notice 는 페이지 헤더 아래, Toast 우측 하단, Banner 헤더 위"]],
    figma: { frame: "Notification", radius: "radius/lg", sizes: { notice: { minH: 56 }, toast: { w: 360 }, banner: { h: 44 } }, variants: { info: { bg: "--surface-accent-cyan", fg: "--surface-accent-cyan" }, success: { bg: "--surface-positive-primary", fg: "--surface-positive-primary" }, warning: { bg: "--surface-cautionary-primary", fg: "--surface-cautionary-primary" }, danger: { bg: "--surface-negative-primary", fg: "--surface-negative-strong" }, toast: { bg: "--surface-neutral-inverse", fg: "--foreground-neutral-inverse" } }, states: ["default", "with-action", "dismissible"] },
  },

  /* ------------------------------------------------ Loading */
  "loading": {
    status: "ready", react: ["Spinner","Skeleton","SkeletonRow","Progress"], css: [".spinner", ".spinner-wrap", ".skeleton", ".skeleton-row", ".progress", ".progress-row"],
    desc: "로딩 상태를 알립니다. 1초 미만은 표시하지 않고, 영역 로딩은 Skeleton, 짧은 동작은 Spinner, 진행률을 알면 Progress.",
    thumb: `<span class="spinner"></span><div style="width:120px;display:flex;flex-direction:column;gap:6px"><span class="skeleton title" style="width:60%"></span><span class="skeleton text"></span></div>`,
    examples: [
      { id: "default", title: "Default", desc: "기본 크기(24px) 스피너입니다.", html: `<span class="spinner" role="status" aria-label="불러오는 중"></span>` },
      { id: "spinner", title: "Spinner", desc: "sm 16 · md 24 · lg 40. 버튼 안에서는 Button .loading 을 씁니다.", html: `
        <span class="spinner sm" role="status" aria-label="불러오는 중"></span>
        <span class="spinner" role="status" aria-label="불러오는 중"></span>
        <span class="spinner lg" role="status" aria-label="불러오는 중"></span>
        <div class="spinner-wrap" role="status"><span class="spinner"></span>이벤트를 불러오는 중…</div>` },
      { id: "skeleton", title: "Skeleton", desc: "콘텐츠 형태를 미리 보여줍니다. 목록·카드의 첫 로딩에.", html: `
        <div style="width:100%;max-width:520px;display:flex;flex-direction:column;gap:14px" aria-busy="true">
          <div class="skeleton-row"><span class="skeleton circle"></span><div class="lines"><span class="skeleton title"></span><span class="skeleton text"></span></div></div>
          <div class="skeleton-row"><span class="skeleton circle"></span><div class="lines"><span class="skeleton title"></span><span class="skeleton text short"></span></div></div>
          <span class="skeleton rect"></span>
        </div>` },
      { id: "progress", title: "Progress", desc: "진행률을 알 때. 배포·검사 진행. 완료는 success, 실패는 danger.", html: `
        <div style="width:100%;max-width:480px;display:flex;flex-direction:column;gap:20px">
          <div class="progress-row"><div class="row"><span>정책 배포 중</span><span>842 / 1,284</span></div><div class="progress" role="progressbar" aria-valuenow="66" aria-valuemin="0" aria-valuemax="100"><i style="width:66%"></i></div></div>
          <div class="progress-row"><div class="row"><span>전체 검사 완료</span><span>100%</span></div><div class="progress success" role="progressbar" aria-valuenow="100"><i style="width:100%"></i></div></div>
          <div class="progress-row"><div class="row"><span>업데이트 실패</span><span>38%</span></div><div class="progress danger" role="progressbar" aria-valuenow="38"><i style="width:38%"></i></div></div>
        </div>` },
    ],
    props: [[".spinner", "span", "—", "role=status aria-label. sm | (md) | lg"], [".skeleton", "span", "—", ".title | .text(.short) | .circle | .rect. 컨테이너에 aria-busy"], [".progress", "div", "—", "role=progressbar aria-valuenow. i 의 width 가 진행률"], ["tone", ".success | .danger", "accent", "완료 / 실패"], [".sm", "boolean", "false", "높이 4"]],
    spec: [["Size", "Spinner 16/24/40 · Skeleton 행 14 · Progress 8 (sm 4)"], ["Container", "Skeleton radius 6 · Progress radius/full"], ["Label", "문구 12 Regular — 스피너 tertiary · 진행 secondary"], ["Placement", "Skeleton 은 콘텐츠 자리 그대로, Spinner 는 영역 중앙"]],
    figma: { frame: "Loading", sizes: { spinner: { sm: 16, md: 24, lg: 40 }, progress: { h: 8 } }, variants: { spinner: {}, skeleton: { bg: "--surface-neutral-strong" }, progress: { fill: "--surface-brand-primary", track: "--surface-neutral-strong" } }, states: ["default", "success", "danger"] },
  },

  /* ------------------------------------------------ Indicator */
  "indicator": {
    status: "ready", react: ["Indicator","Count","WithCount","Steps"], css: [".indicator", ".count", ".with-count", ".steps", ".sr-only"], borrows: [".btn"],   // .sr-only — Steps 완료 숨김 문구가 쓴다. 빠지면 복사한 CSS 에서 " (완료)" 가 화면에 보인다
    desc: "상태 점, 건수 배지, 단계 표시처럼 작은 시각 신호입니다. 텍스트 라벨과 함께 써 색만으로 의미를 전달하지 않습니다.",
    thumb: `<span class="indicator ok">정상</span><span class="indicator danger">차단</span><span class="count">3</span>`,
    examples: [
      { id: "default", title: "Default", desc: "상태 점과 라벨을 함께 쓰는 기본 형태입니다.", html: `<span class="indicator ok">정상</span>` },
      { id: "status", title: "Status Dot", desc: "에이전트·서비스 상태. 라벨 필수. 실시간 위험은 .pulse.", html: `
        <span class="indicator ok">정상</span>
        <span class="indicator warn">주의</span>
        <span class="indicator danger">장애</span>
        <span class="indicator info">점검 중</span>
        <span class="indicator">오프라인</span>
        <span class="indicator danger pulse">실시간 공격 탐지</span>` },
      { id: "count", title: "Count Badge", desc: "미확인 건수. 99 초과는 99+. 아이콘 위에는 .with-count.", html: `
        <span class="count">3</span>
        <span class="count">99+</span>
        <span class="count accent">12</span>
        <span class="count neutral">128</span>
        <span class="with-count"><button type="button" class="btn md outline assistive icon-only" aria-label="알림 5건">${I("bell")}</button><span class="count">5</span></span>
        <span class="with-count"><button type="button" class="btn md outline assistive icon-only" aria-label="새 알림">${I("bell")}</button><span class="count dot" aria-hidden="true"></span></span>` },
      { id: "steps", title: "Steps", desc: "온보딩·마법사 진행 단계. 완료 .done, 현재 .on.", html: `
        <ol class="steps">
          <li class="done"><i>${I("check",12)}</i>기본 정보<span class="sr-only"> (완료)</span></li>
          <li class="done"><i>${I("check",12)}</i>적용 대상<span class="sr-only"> (완료)</span></li>
          <li class="on" aria-current="step"><i>3</i>규칙 설정</li>
          <li><i>4</i>검토 · 배포</li>
        </ol>` },
    ],
    props: [[".indicator", "span", "—", "점 + 라벨. ok | warn | danger | info | accent | (neutral)"], [".pulse", "boolean", "false", "깜빡임(위험 실시간)"], [".count", "span", "—", "건수. 기본은 진한 빨강(--foreground-negative-strong) + 흰 숫자. .accent / .neutral / .dot(점만)"], [".with-count", "wrapper", "—", "아이콘 우상단에 count 배치"], [".steps li", "li", "—", ".done 완료(체크 아이콘 --foreground-positive-primary), .on 현재. .vertical 세로"]],
    spec: [["Size", "점 8 · count 높이 20 · step 원 24"], ["Container", "radius/full"], ["Label", "Body/2 14 · count 12 Bold · steps 12"], ["Placement", "테이블 상태 열, 내비 건수, 마법사 상단"]],
    figma: { frame: "Indicator", radius: "radius/full", sizes: { dot: 8, count: { h: 20 }, step: 24 }, variants: { ok: { fg: "--foreground-positive-primary" }, warn: { fg: "--foreground-cautionary-primary" }, danger: { fg: "--foreground-negative-primary" }, info: { fg: "--foreground-accent-cyan" }, accent: { fg: "--foreground-brand-primary" }, neutral: { fg: "--foreground-inactive-primary" },
      count: { bg: "--foreground-negative-strong", fg: "--static-white", neutral: { bg: "--surface-neutral-strong", fg: "--foreground-neutral-secondary" }, accent: { bg: "--surface-brand-primary", fg: "--brand-label" } },
      steps: { todo: { bg: "--surface-neutral-strong", fg: "--foreground-neutral-secondary" }, done: { bg: "--surface-positive-primary", icon: "--foreground-positive-primary" }, on: { bg: "--surface-brand-primary", fg: "--brand-label" } } }, states: ["default", "pulse"] },
  },

  /* ------------------------------------------------ Divider */
  "divider": {
    status: "ready", react: ["Divider"], css: [".divider"], borrows: [".t-body-2", ".btn"],
    desc: "콘텐츠 그룹을 나눕니다. 여백과 배경 차이로 구획이 되면 쓰지 않고, 꼭 필요한 곳에만 아주 연하게.",
    thumb: `<div style="width:160px"><hr class="divider" style="margin:6px 0"><hr class="divider label" style="margin:6px 0">또는</hr></div>`,
    examples: [
      { id: "default", title: "Default", desc: "영역을 나누는 기본 가로 구분선입니다.", html: `
        <div style="width:100%;max-width:480px">
          <p class="t-body-2" style="margin:0">기본 설정</p>
          <hr class="divider">
          <p class="t-body-2" style="margin:0">고급 설정</p>
        </div>
      ` },
      { id: "basic", title: "Horizontal", desc: "hr.divider. 강조는 .strong, 임시 구분은 .dashed.", html: `
        <div style="width:100%;max-width:480px">
          <p class="t-body-2" style="margin:0">기본 설정</p>
          <hr class="divider">
          <p class="t-body-2" style="margin:0">고급 설정</p>
          <hr class="divider strong">
          <p class="t-body-2" style="margin:0">감사 로그</p>
          <hr class="divider dashed">
        </div>` },
      { id: "label", title: "With Label", desc: "구분 의미가 필요할 때 가운데 라벨.", html: `
        <div style="width:100%;max-width:480px"><div class="divider label" role="separator">또는</div><div class="divider label" role="separator">2026-09-07</div></div>` },
      { id: "vertical", title: "Vertical", desc: "툴바에서 버튼 그룹을 나눕니다. 높이 24.", html: `
        <div style="display:flex;align-items:center">
          <button type="button" class="btn sm solid assistive">편집</button>
          <button type="button" class="btn sm solid assistive">복제</button>
          <span class="divider vertical" role="separator" aria-orientation="vertical"></span>
          <button type="button" class="btn sm solid assistive">내보내기</button>
          <span class="divider vertical" role="separator" aria-orientation="vertical"></span>
          <button type="button" class="btn sm outline negative">삭제</button>
        </div>` },
    ],
    props: [[".divider", "hr | div", "—", "가로 1px line/neutral/secondary, margin 16 0"], [".strong / .dashed", "boolean", "false", "line/neutral/primary / 점선"], [".label", "div", "—", "가운데 라벨 텍스트"], [".vertical", "span", "—", "세로 1×24, 좌우 12"]],
    spec: [["Size", "1px · 세로 24"], ["Container", "line/neutral/secondary (strong 시 line/neutral/primary)"], ["Label", "라벨 12 Regular tertiary"], ["Placement", "설정 섹션 사이, 툴바 버튼 그룹 사이"]],
    figma: { frame: "Divider", sizes: { horizontal: { h: 1 }, vertical: { w: 1, h: 24 } }, variants: { default: { stroke: "--line-neutral-secondary" }, strong: { stroke: "--line-neutral-primary" }, label: {} }, states: ["default"] },
  },

  /* ------------------------------------------------ Data Table */
  "data-table": {
    status: "ready", react: ["DataTable","ActionBar"], css: [".tbl-wrap", ".tbl", ".action-bar", ".tag", ".checkbox", ".indicator"], borrows: [".btn", ".switch", ".log-row", ".empty"],
    desc: "로그·이벤트·정책 목록처럼 대량의 행 데이터를 다룹니다. 정렬·선택·행 액션을 갖춘 콘솔의 핵심 컴포넌트입니다. 단순 표는 Table 을 씁니다.",
    thumb: `<div class="tbl-wrap" style="width:240px"><table class="tbl compact"><thead><tr><th>시간</th><th>심각도</th></tr></thead><tbody><tr><td>09:41</td><td><span class="tag critical sm">Critical</span></td></tr><tr><td>09:40</td><td><span class="tag medium sm">Medium</span></td></tr></tbody></table></div>`,
    examples: [
      { id: "basic", title: "Default (Sortable)", desc: "헤더 클릭 정렬. 정렬 중인 열은 .sorted(.desc). 숫자 열은 .num. 처리할 수 없는 행은 tr.disabled + inert — 글자 · 태그 · 링크 · 상태 점이 모두 비활성 색이 되고, 행 안 링크는 마우스·키보드 모두 닿지 않습니다(React TableRow disabled 가 inert 를 함께 넣습니다).", html: `
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr><th class="sortable sorted desc" aria-sort="descending">시간</th><th class="sortable">심각도</th><th>이벤트</th><th class="sortable">대상</th><th class="num sortable">횟수</th><th>상태</th></tr></thead>
            <tbody>
              <tr><td>09:41:12</td><td><span class="tag critical">Critical</span></td><td><a href="#" class="link">랜섬웨어 행위 탐지</a></td><td>PC-2041 · 김민준</td><td class="num">3</td><td><span class="indicator danger">차단</span></td></tr>
              <tr><td>09:40:58</td><td><span class="tag medium">Medium</span></td><td><a href="#" class="link">미승인 USB 연결</a></td><td>PC-1187 · 이서연</td><td class="num">1</td><td><span class="indicator warn">검토 필요</span></td></tr>
              <tr><td>09:38:03</td><td><span class="tag low">Low</span></td><td><a href="#" class="link">정책 동기화 완료</a></td><td>Server-03</td><td class="num">12</td><td><span class="indicator ok">정상</span></td></tr>
              <tr class="disabled" inert><td>09:36:47</td><td><span class="tag high">High</span></td><td><a href="#" class="link">알려진 악성코드 차단</a></td><td>PC-0932 · 박지훈</td><td class="num">2</td><td><span class="indicator danger">차단</span></td></tr>
            </tbody>
          </table>
        </div>` },
      { id: "selectable", title: "Selectable + Action Bar", desc: "체크박스 열(.check) + 선택 시 상단 액션 바. 선택 행은 .on.", html: `
        <div class="tbl-wrap">
          <div class="action-bar"><b>2개 선택</b><span class="spacer"></span><button type="button" class="btn sm outline assistive">허용 처리</button><button type="button" class="btn sm outline assistive">${I("download")}내보내기</button><button type="button" class="btn sm outline negative">삭제</button></div>
          <table class="tbl">
            <thead><tr><th class="check"><label class="checkbox"><input type="checkbox" class="mixed" aria-label="전체 선택"></label></th><th>정책</th><th>적용 그룹</th><th class="num">대상</th><th>수정</th><th>사용</th></tr></thead>
            <tbody>
              <tr class="on"><td class="check"><label class="checkbox"><input type="checkbox" checked aria-label="선택"></label></td><td>외부 USB 차단</td><td>전체</td><td class="num">1,284</td><td>2026-09-06</td><td><label class="switch sm"><input type="checkbox" role="switch" checked aria-label="사용"></label></td></tr>
              <tr class="on"><td class="check"><label class="checkbox"><input type="checkbox" checked aria-label="선택"></label></td><td>스크립트 실행 제한</td><td>개발팀 제외</td><td class="num">1,102</td><td>2026-09-02</td><td><label class="switch sm"><input type="checkbox" role="switch" checked aria-label="사용"></label></td></tr>
              <tr><td class="check"><label class="checkbox"><input type="checkbox" aria-label="선택"></label></td><td>원격 접속 허용 목록</td><td>인프라팀</td><td class="num">48</td><td>2026-08-21</td><td><label class="switch sm"><input type="checkbox" role="switch" aria-label="사용"></label></td></tr>
            </tbody>
          </table>
        </div>` },
      { id: "compact", title: "Compact", desc: "로그 뷰어처럼 행이 많을 때 행 높이 44. 시간·IP 는 모노스페이스(.log-row).", html: `
        <div class="tbl-wrap">
          <table class="tbl compact">
            <thead><tr><th>시간</th><th>레벨</th><th>소스</th><th>메시지</th></tr></thead>
            <tbody>
              <tr class="log-row"><td>2026-09-07 09:41:12.031</td><td><span class="tag critical sm">CRIT</span></td><td>10.0.4.21</td><td>process.create blocked: rundll32.exe → cryptor.dll</td></tr>
              <tr class="log-row"><td>2026-09-07 09:41:11.870</td><td><span class="tag medium sm">WARN</span></td><td>10.0.4.21</td><td>usb.attach vendor=0x0781 product=0x5583</td></tr>
              <tr class="log-row"><td>2026-09-07 09:41:09.114</td><td><span class="tag low sm">INFO</span></td><td>10.0.0.3</td><td>policy.sync ok (rev 2041)</td></tr>
              <tr class="log-row"><td>2026-09-07 09:41:08.552</td><td><span class="tag low sm">INFO</span></td><td>10.0.0.3</td><td>agent.checkin 1284/1284</td></tr>
            </tbody>
          </table>
        </div>` },
      { id: "empty", title: "Empty", desc: "결과 없음. 조건 초기화 등 다음 행동을 제시.", html: `
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr><th>시간</th><th>심각도</th><th>이벤트</th><th>대상</th></tr></thead>
            <tbody><tr><td colspan="4" class="empty"><div class="empty">조건에 맞는 이벤트가 없습니다. <a href="#" class="link">필터 초기화</a></div></td></tr></tbody>
          </table>
        </div>` },
    ],
    props: [[".tbl-wrap", "container", "—", "보더 + radius/lg + 가로 스크롤. 안에 .action-bar 와 table.tbl"], [".tbl", "table", "—", "기본 행 52. .compact 44 · .zebra 줄무늬"], ["th.sortable / .sorted(.desc)", "header", "—", "정렬 가능 / 정렬 중. aria-sort"], ["tr.on / .disabled", "row", "—", "선택 / 비활성. 비활성 행 안의 태그도 disable 토큰으로 칠해져 심각도 색이 활성처럼 남지 않습니다"], ["td.num / .check / .actions / .empty", "cell", "—", "숫자 우측 정렬 / 체크박스 열 / 행 액션 / 빈 상태"], [".action-bar", "div", "—", "선택 건수 + 일괄 액션"]],
    spec: [["Size", "행 높이 52 (compact 44) · 헤더 44"], ["Container", "radius/lg 8 · line/neutral/secondary 1px · 셀 격자선 없음"], ["Label", "헤더 12 SemiBold tertiary · 셀 Body/2 14 · 숫자 tabular · 오른쪽 정렬(.num)"], ["Placement", "툴바(검색·필터) 위, 페이지네이션 아래 · 10열 이하 기본 노출"]],
    figma: { frame: "Data Table", radius: "radius/lg", sizes: { row: { h: 52 }, compact: { h: 44 }, header: { h: 44 } }, variants: { default: {}, selectable: {}, compact: {} }, states: ["default", "hover", "selected", "sorted", "empty"] },
  },

  /* ------------------------------------------------ Table */
  "table": {
    status: "ready", react: ["Table","TableHead","TableBody","TableRow","TableHeader","TableCell"], css: [".tbl-wrap", ".tbl"], borrows: [".indicator"],
    desc: "정렬·선택이 필요 없는 단순 표입니다. 상세 정보(키-값), 비교표, 요약 통계에 씁니다.",
    thumb: `<div class="tbl-wrap" style="width:220px"><table class="tbl compact kv"><tbody><tr><th style="width:80px">이름</th><td>USB 차단</td></tr><tr><th>상태</th><td>사용</td></tr></tbody></table></div>`,
    examples: [
      { id: "default", title: "Default", desc: "머리글과 본문만 둔 기본 표입니다.", html: `
        <div class="tbl-wrap" style="max-width:480px">
          <table class="tbl">
            <thead><tr><th>그룹</th><th class="num">에이전트</th></tr></thead>
            <tbody>
              <tr><td>영업팀</td><td class="num">312</td></tr>
              <tr><td>개발팀</td><td class="num">184</td></tr>
            </tbody>
          </table>
        </div>
      ` },
      { id: "simple", title: "Simple", html: `
        <div class="tbl-wrap" style="max-width:640px">
          <table class="tbl">
            <thead><tr><th>그룹</th><th class="num">에이전트</th><th class="num">정책</th><th>최근 배포</th></tr></thead>
            <tbody>
              <tr><td>영업팀</td><td class="num">312</td><td class="num">8</td><td>2026-09-06</td></tr>
              <tr><td>개발팀</td><td class="num">184</td><td class="num">11</td><td>2026-09-06</td></tr>
              <tr><td>인프라팀</td><td class="num">48</td><td class="num">14</td><td>2026-09-02</td></tr>
            </tbody>
          </table>
        </div>` },
      { id: "kv", title: "Key–Value", desc: "상세 패널의 속성 표. th 가 키.", html: `
        <div class="tbl-wrap" style="max-width:560px">
          <table class="tbl kv">
            <tbody>
              <tr><th>정책 ID</th><td>POL-2041</td></tr>
              <tr><th>이름</th><td>외부 USB 차단</td></tr>
              <tr><th>적용 그룹</th><td>전체 (1,284대)</td></tr>
              <tr><th>상태</th><td><span class="indicator ok">사용 중</span></td></tr>
              <tr><th>최근 수정</th><td>2026-09-06 14:20 · admin@jiran.com</td></tr>
            </tbody>
          </table>
        </div>` },
      { id: "zebra", title: "Zebra / Compact", desc: "긴 비교표는 줄무늬로 행 추적을 돕습니다.", html: `
        <div class="tbl-wrap" style="max-width:640px">
          <table class="tbl compact zebra">
            <thead><tr><th>기능</th><th>Standard</th><th>Enterprise</th></tr></thead>
            <tbody>
              <tr><td>실시간 보호</td><td>${I("check",16)}</td><td>${I("check",16)}</td></tr>
              <tr><td>USB 제어</td><td>${I("check",16)}</td><td>${I("check",16)}</td></tr>
              <tr><td>행위 기반 탐지</td><td>—</td><td>${I("check",16)}</td></tr>
              <tr><td>감사 로그 보관</td><td>30일</td><td>1년</td></tr>
              <tr><td>SIEM 연동</td><td>—</td><td>${I("check",16)}</td></tr>
            </tbody>
          </table>
        </div>` },
    ],
    props: [[".tbl-wrap", "container", "—", "보더 + radius + 스크롤"], [".tbl", "table", "—", "기본 표"], [".kv", "boolean", "false", "키-값 표(th 폭 200, 우측 보더)"], [".zebra / .compact", "boolean", "false", "줄무늬 / 행 44"], ["td.num", "cell", "—", "숫자 우측 정렬"]],
    spec: [["Size", "행 52 (compact 44) · kv th 폭 200"], ["Container", "radius/lg 8 · line/neutral/secondary"], ["Label", "헤더 12 SemiBold tertiary · 셀 Body/2 14 · kv 헤더 14 Medium secondary"], ["Placement", "상세 패널, 리포트 요약"]],
    figma: { frame: "Table", radius: "radius/lg", sizes: { row: { h: 52 }, compact: { h: 44 } }, variants: { simple: {}, kv: {}, zebra: {} }, states: ["default"] },
  },

  /* ------------------------------------------------ List */
  "list": {
    status: "ready", react: ["List","ListItem"], css: [".list", ".avatar", ".tag", ".indicator"], borrows: [".btn"],
    desc: "동질한 항목을 세로로 나열합니다. 열이 2~3개 이하이고 항목마다 제목·부제·액션이 있으면 표 대신 List.",
    thumb: `<ul class="list dense" style="width:220px"><li><span class="primary">PC-2041</span><span class="end"><span class="tag ok sm">정상</span></span></li><li><span class="primary">PC-1187</span><span class="end"><span class="tag medium sm">주의</span></span></li></ul>`,
    examples: [
      { id: "basic", title: "Default", desc: "제목(.primary) + 부제(.meta) + 우측 영역(.end).", html: `
        <ul class="list" style="max-width:560px">
          <li><div><span class="primary">외부 USB 차단</span><span class="meta">전체 · 1,284대 · 2026-09-06</span></div><span class="end"><span class="tag ok">사용</span></span></li>
          <li><div><span class="primary">스크립트 실행 제한</span><span class="meta">개발팀 제외 · 1,102대</span></div><span class="end"><span class="tag ok">사용</span></span></li>
          <li><div><span class="primary">원격 접속 허용 목록</span><span class="meta">인프라팀 · 48대</span></div><span class="end"><span class="tag">중지</span></span></li>
        </ul>` },
      { id: "media", title: "With Avatar / Actions", desc: "선행 아이콘·아바타와 후행 액션 버튼.", html: `
        <ul class="list" style="max-width:560px">
          <li><span class="avatar">김</span><div><span class="primary">김민준</span><span class="meta">보안팀 · 관리자</span></div><span class="end"><button type="button" class="btn sm assistive icon-only" aria-label="편집">${I("pencil")}</button><button type="button" class="btn sm assistive icon-only" aria-label="더 보기">${I("dots")}</button></span></li>
          <li><span class="avatar">이</span><div><span class="primary">이서연</span><span class="meta">인프라팀 · 운영자</span></div><span class="end"><button type="button" class="btn sm assistive icon-only" aria-label="편집">${I("pencil")}</button><button type="button" class="btn sm assistive icon-only" aria-label="더 보기">${I("dots")}</button></span></li>
        </ul>` },
      { id: "select", title: "Selectable / Dense", desc: "행 클릭 선택(.hover + .on). 밀도 높은 목록은 .dense.", html: `
        <ul class="list hover dense" style="max-width:480px" role="listbox">
          <li role="option"><span class="indicator ok">PC-2041</span><span class="end meta">10.0.4.21</span></li>
          <li role="option" class="on" aria-selected="true"><span class="indicator danger">PC-1187</span><span class="end meta">10.0.4.33</span></li>
          <li role="option"><span class="indicator">PC-0932</span><span class="end meta">오프라인</span></li>
        </ul>` },
    ],
    props: [[".list", "ul", "—", "보더 + radius/lg. li 는 flex row"], [".primary / .meta / .end", "elements", "—", "제목 / 부제 / 우측 영역"], [".hover / li.on", "boolean", "false", "행 hover 배경 / 선택"], [".dense / .plain", "boolean", "false", "행 40 / 보더 없음"]],
    spec: [["Size", "행 최소 56 (dense 40)"], ["Container", "radius/lg · line/neutral/secondary · 행 사이 1px"], ["Label", "제목 14 Medium · 부제 12 Regular tertiary"], ["Placement", "상세 패널 목록, 설정의 항목 목록"]],
    figma: { frame: "List", radius: "radius/lg", sizes: { md: { h: 56 }, dense: { h: 40 } }, variants: { default: {}, media: {}, selectable: {} }, states: ["default", "hover", "selected"] },
  },

  /* ------------------------------------------------ Item Tile */
  "item-tile": {
    status: "ready", react: ["Tile","TileGrid"], css: [".tile", ".tile-grid", ".tag"],
    desc: "아이콘·제목·설명으로 항목을 카드 형태로 고르는 타일입니다. 정책 템플릿, 연동 모듈, 보고서 유형 선택에 씁니다.",
    thumb: `<div class="tile-grid" style="width:240px;grid-template-columns:1fr 1fr"><button class="tile on"><span class="ico">U</span><b>USB</b></button><button class="tile"><span class="ico">N</span><b>네트워크</b></button></div>`,
    examples: [
      { id: "default", title: "Default", desc: "선택하지 않은 기본 타일입니다.", html: `<button type="button" class="tile"><span class="ico">${I("shield")}</span><b>USB 제어</b><span>저장장치 차단·읽기 전용</span></button>` },
      { id: "grid", title: "Grid", desc: "button.tile 그리드. 선택은 .on + aria-pressed.", html: `
        <div class="tile-grid" style="max-width:760px">
          <button type="button" class="tile on" aria-pressed="true"><span class="ico">${I("shield")}</span><b>USB 제어</b><span>저장장치 차단·읽기 전용</span></button>
          <button type="button" class="tile" aria-pressed="false"><span class="ico">${I("server")}</span><b>네트워크 격리</b><span>감염 의심 단말 격리</span></button>
          <button type="button" class="tile" aria-pressed="false"><span class="ico">${I("list")}</span><b>스크립트 제한</b><span>PowerShell·WSH 실행 제어</span></button>
          <button type="button" class="tile" aria-pressed="false" disabled><span class="ico">${I("chart-bar")}</span><b>SIEM 연동</b><span>Enterprise 전용</span></button>
        </div>` },
      { id: "badge", title: "With Tag", desc: "우상단에 상태·신규 태그. 비활성 타일에서는 태그도 비활성 색으로 흐립니다.", html: `
        <div class="tile-grid" style="max-width:560px">
          <button type="button" class="tile"><span class="tag accent sm plain">NEW</span><span class="ico">${I("bell")}</span><b>Slack 알림</b><span>채널로 이벤트 전송</span></button>
          <button type="button" class="tile"><span class="tag ok sm">연결됨</span><span class="ico">${I("user")}</span><b>AD 연동</b><span>사용자·그룹 동기화</span></button>
          <button type="button" class="tile" disabled><span class="tag accent sm">Enterprise</span><span class="ico">${I("chart-bar")}</span><b>SIEM 연동</b><span>이벤트 로그 전달</span></button>
        </div>` },
      { id: "horizontal", title: "Horizontal", desc: "좁은 폭에서는 가로 배치.", html: `
        <div style="display:flex;flex-direction:column;gap:8px;width:100%;max-width:420px">
          <button type="button" class="tile horizontal on" aria-pressed="true"><span class="ico">${I("chart-bar")}</span><div><b>주간 요약</b><span>매주 월요일 발송</span></div></button>
          <button type="button" class="tile horizontal" aria-pressed="false"><span class="ico">${I("list")}</span><div><b>상세 이벤트</b><span>CSV · 최대 10만 행</span></div></button>
        </div>` },
    ],
    props: [[".tile", "button", "—", ".ico + b(제목) + span(설명). aria-pressed"], [".on", "boolean", "false", "선택(brand 보더·배경)"], [".horizontal", "boolean", "false", "가로 배치"], ["disabled", "attribute", "—", "선택 불가"], [".tile-grid", "container", "—", "auto-fill 180px 그리드"]],
    spec: [["Size", "최소 폭 180 · padding 16 · 아이콘 36"], ["Container", "radius/lg 8 · line/neutral/secondary · 선택 brand"], ["Label", "제목 14 Bold · 설명 12 Regular tertiary"], ["Placement", "마법사의 유형 선택, 연동 목록"]],
    figma: { frame: "Item Tile", radius: "radius/lg", sizes: { md: { minW: 180, pad: 16 } }, variants: { default: { stroke: "--line-neutral-secondary" }, selected: { stroke: "--surface-brand-primary", bg: "--surface-brand-subtle" } }, states: ["default", "hover", "selected", "disabled"] },
  },

  /* ------------------------------------------------ Data Visual */
  "data-visual": {
    status: "ready", react: ["Kpi","KpiGrid","ChartCard","BarChart","Donut","DonutRow","ChartLegend","Sparkline"], css: [".kpi", ".kpi-grid", ".chart", ".chart-card", ".donut", ".donut-row", ".chart-legend", ".sparkline"], borrows: [".t-caption-1"],
    desc: "대시보드의 수치·추이·비율을 보여줍니다. KPI 카드, 가로 막대, 도넛, 스파크라인을 CSS 만으로 구성하며 색은 심각도 토큰을 그대로 씁니다.",
    thumb: `<div class="kpi compact" style="padding:12px 14px;min-width:120px"><span class="label">Critical</span><span class="value" style="font-size:24px;color:var(--foreground-negative-strong)">1,284</span></div>`,
    examples: [
      { id: "default", title: "Default", desc: "값 하나를 보여 주는 기본 KPI 입니다.", html: `<div class="kpi" style="max-width:240px"><span class="label">연결 에이전트</span><span class="value">1,247</span></div>` },
      { id: "kpi", title: "KPI", desc: "라벨 · 값 · 증감. 보안 지표는 증가가 위험(.up 빨강), 감소가 좋음(.down 초록).", html: `
        <div class="kpi-grid" style="max-width:800px">
          <div class="kpi critical"><span class="label">Critical 이벤트</span><span class="value">1,284</span><span class="delta up">${I("arrow-up",12)} 12% 전주 대비</span></div>
          <div class="kpi"><span class="label">차단률</span><span class="value">99.2<small>%</small></span><span class="delta down">${I("arrow-down",12)} 0.3%p</span></div>
          <div class="kpi"><span class="label">연결 에이전트</span><span class="value">1,247<small>/ 1,284</small></span><span class="delta">37대 오프라인</span></div>
          <div class="kpi"><span class="label">미처리 검토</span><span class="value">5</span><span class="delta">24시간 내 처리</span></div>
        </div>` },
      { id: "bar", title: "Bar Chart", desc: "항목별 비교. i 의 width 가 값, 색은 심각도.", html: `
        <div class="chart-card" style="max-width:560px">
          <h3 class="chart-title">유형별 탐지 <span class="t-caption-1" style="color:var(--foreground-neutral-tertiary)">최근 7일</span></h3>
          <div class="chart">
            <div class="row"><span class="lbl">랜섬웨어</span><div class="bar critical"><i style="width:82%"></i></div><span class="num">412</span></div>
            <div class="row"><span class="lbl">악성코드</span><div class="bar high"><i style="width:61%"></i></div><span class="num">306</span></div>
            <div class="row"><span class="lbl">USB 위반</span><div class="bar medium"><i style="width:44%"></i></div><span class="num">221</span></div>
            <div class="row"><span class="lbl">정책 위반</span><div class="bar low"><i style="width:23%"></i></div><span class="num">115</span></div>
          </div>
        </div>` },
      { id: "donut", title: "Donut + Legend", desc: "구성 비율. conic-gradient 로 그리고 중앙 값은 data-label.", html: `
        <div class="chart-card" style="max-width:320px">
          <h3 class="chart-title">심각도 분포</h3>
          <div class="donut-row">
            <div class="donut" role="img" aria-label="Critical 18%, High 27%, Medium 30%, Low 25%" data-label="1,054"></div>
            <div class="chart-legend" style="flex-direction:column">
              <span><i class="critical"></i>Critical <b>190</b></span>
              <span><i class="high"></i>High <b>285</b></span>
              <span><i class="medium"></i>Medium <b>316</b></span>
              <span><i class="low"></i>Low <b>263</b></span>
            </div>
          </div>
        </div>` },
      { id: "spark", title: "Sparkline", desc: "카드 안 소형 추이. 강조 막대는 .hi. KPI 안에 두면 값 오른쪽에 놓이고 밑변을 숫자 기준선에 맞춥니다. 자리가 모자라면 값 아래로 내려갑니다.", html: `
        <div class="kpi" style="min-width:min(320px, 100%)"><span class="label">일별 탐지</span><span class="value">412</span><div class="sparkline" aria-hidden="true"><i style="height:30%"></i><i style="height:45%"></i><i style="height:38%"></i><i style="height:70%"></i><i style="height:55%"></i><i style="height:90%" class="hi"></i><i style="height:62%"></i></div></div>` },
    ],
    props: [[".kpi", "div", "—", ".label + .value(small 단위) + .delta(.up/.down). .critical/.high 로 값 색"], [".kpi-grid", "container", "—", "auto-fit 180px"], [".chart .row", "row", "—", ".lbl + .bar(i width%) + .num. bar 톤 critical|high|medium|low"], [".donut", "div", "—", "conic-gradient 배경, data-label 중앙 값, role=img aria-label. 조각 사이 1.2% 를 면 색으로 비운다(이웃 조각 밝기 대비가 낮아 색상만으로 갈리지 않게)"], [".donut-row", "div", "—", "도넛 + 범례 한 줄. 도넛은 왼쪽, 범례는 오른쪽 끝(space-between) — 카드가 넓으면 둘 사이가 벌어집니다"], [".chart-legend", "div", "—", "i 색 + 라벨 + b 값"], [".chart-card", "container", "—", "차트를 담는 카드. Card 와 같은 Surface·radius/lg·1px 보더이고 padding 20 24 · gap 16 입니다. React <code>ChartCard</code>"], [".sparkline", "div", "—", "i height% 막대, .hi 강조. .kpi 의 자식이면 값 오른쪽(밑변 = 숫자 기준선), 좁으면 값 아래"]],
    spec: [["Size", "KPI 값 Display/2 32 · 막대 12 · 도넛 120"], ["Container", "chart-card = Card 와 같은 Surface·radius/lg·1px 보더, 다만 padding 20 24 · gap 16"], ["Label", "라벨 12 Medium tertiary · 값 32 Bold(일반 숫자)"], ["Placement", "대시보드 상단 KPI 4개, 아래 차트 카드 2열"]],
    figma: { frame: "Data Visual", radius: "radius/lg", sizes: { kpi: { pad: 20 }, bar: { h: 12 }, donut: 120 }, variants: { kpi: {}, kpiSparkline: { layout: "라벨 한 줄 · 값 + 그래프 한 줄(밑변 = 숫자 기준선, 좁으면 그래프가 값 아래)" }, bar: {}, donut: { gap: "1.2% (양쪽 0.6%) --surface-elevated-primary" }, sparkline: { bar: "--line-brand-primary", hi: "--foreground-brand-primary" } }, states: ["default"] },
  },
};

if (typeof module !== "undefined" && module.exports) module.exports = COMPONENTS;
