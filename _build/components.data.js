/* =========================================================
   components.data.js — 컴포넌트 30개 상세
   shape: { status, desc, css:[접두어…], thumb, anatomy:{demo,items}, examples:[{id,title,desc,html,react?,layout?,style?}],
            props:[[name, type, default, desc]], spec:[[k,v]], figma:{…}, guideline:{do,dont} }
   - html 은 라이브 프리뷰와 "HTML+CSS" 탭에 그대로 쓰이고, react 가 없으면 htmlToJsx 로 자동 변환됩니다.
   - 규칙: onclick 등 인라인 핸들러 · <script> · href="#/…" 금지(링크는 href="#"). 색은 var(--*) 토큰만.
   ========================================================= */
/* 아이콘: icons.gen.js 의 I(name, size, {style}) — assets/icons 의 Tabler 아이콘을 빌드 시 인라인 */
const cb = (label, attrs = "", small = "") => `<label class="checkbox"><input type="checkbox"${attrs ? " " + attrs : ""}><span>${label}${small ? `<small>${small}</small>` : ""}</span></label>`;

const COMPONENTS = {
  /* ------------------------------------------------ Button */
  "button": {
    status: "ready", react: ["Button","ButtonGroup"], css: [".btn", ".btn-group"],
    desc: "사용자의 의도를 명확하게 전달하고 행동을 유도합니다. 버튼의 형태와 색은 우선순위를 시각적으로 구분합니다.",
    thumb: `<button class="btn md primary">저장</button><button class="btn md secondary">취소</button>`,
    anatomy: { demo: `<span class="anat"><button class="btn md primary">${I("plus")}정책 추가</button><span class="marker" style="left:-26px;top:12px">1</span><span class="marker" style="left:14px;top:-26px">2</span><span class="marker" style="right:20px;top:-26px">3</span></span>`, items: ["Container — .btn + size + variant", "Icon (Optional) — 18px, 라벨 앞", "Label — 동사로 시작"] },
    examples: [
      { id: "variant", title: "Variant", desc: "우선순위에 따라 Primary(화면당 하나) · Secondary · Tertiary · Text · Danger 를 씁니다.", html: `
        <button class="btn md primary">Primary</button>
        <button class="btn md secondary">Secondary</button>
        <button class="btn md tertiary">Tertiary</button>
        <button class="btn md text">Text</button>
        <button class="btn md danger">Danger</button>
        <button class="btn md danger secondary">Danger (outline)</button>` },
      { id: "size", title: "Size", desc: "sm 36 · md 44 · lg 52. 테이블·툴바 안에서는 sm, 폼 하단은 md, 온보딩·빈 화면은 lg.", html: `
        <button class="btn sm primary">Small</button>
        <button class="btn md primary">Medium</button>
        <button class="btn lg primary">Large</button>` },
      { id: "icon", title: "Icon", desc: "아이콘은 라벨 앞에 하나만. 아이콘 전용 버튼은 .icon 과 aria-label 을 함께 씁니다.", html: `
        <button class="btn md primary">${I("plus")}정책 추가</button>
        <button class="btn md secondary">${I("download")}내보내기</button>
        <button class="btn md secondary icon" aria-label="더 보기">${I("dots")}</button>
        <button class="btn md tertiary icon" aria-label="새로 고침">${I("refresh")}</button>
        <button class="btn md danger secondary icon" aria-label="삭제">${I("trash")}</button>` },
      { id: "state", title: "State", desc: "Hover/Pressed 는 CSS 가 처리합니다. Disabled 는 disabled 속성, Loading 은 .loading 클래스(라벨은 유지해 폭이 흔들리지 않게).", html: `
        <button class="btn md primary">Default</button>
        <button class="btn md primary" disabled>Disabled</button>
        <button class="btn md primary loading">저장 중</button>
        <button class="btn md secondary loading">불러오는 중</button>` },
      { id: "group", title: "Group / Block", desc: "버튼 묶음은 .btn-group(8px 간격), 저장이 가장 오른쪽. 폼 하단에서는 .end 로 오른쪽 정렬. 전체 폭은 .block.", html: `
        <div class="btn-group">
          <button class="btn md text">초기화</button>
          <button class="btn md secondary">취소</button>
          <button class="btn md primary">정책 저장</button>
        </div>
        <button class="btn lg primary block" style="max-width:320px">시작하기</button>`, layout: "stack center" },
    ],
    props: [
      ["variant", "primary | secondary | tertiary | text | danger", "—", "우선순위. danger 는 secondary 와 조합하면 아웃라인"],
      ["size", "sm | md | lg", "md", "높이 36 / 44 / 52"],
      [".icon", "boolean", "false", "아이콘 전용 정사각 버튼. aria-label 필수"],
      [".block", "boolean", "false", "전체 폭"],
      [".loading", "boolean", "false", "스피너 표시, 클릭 차단. 라벨은 유지"],
      ["disabled", "attribute", "—", "비활성. 40% 불투명"],
      ["type", "button | submit", "button", "폼 안에서는 명시"],
    ],
    spec: [["Size", "sm 36 · md 44 · lg 52 (높이)"], ["Container", "radius/md 8 · 좌우 padding 14 / 20 / 26"], ["Label", "Label/1 15 Semibold · 동사로 시작"], ["Placement", "페이지 Primary 버튼은 화면당 하나, 우측 정렬 · 폼에서는 저장이 오른쪽"]],
    figma: { frame: "Button", radius: "radius/md", sizes: { sm: { h: 36, px: 14, fs: 13 }, md: { h: 44, px: 20, fs: 15 }, lg: { h: 52, px: 26, fs: 16 } }, variants: { primary: { bg: "--accent", fg: "--accent-on" }, secondary: { bg: "--bg-surface", fg: "--text-primary", stroke: "--border-strong" }, tertiary: { bg: "--bg-panel", fg: "--text-primary" }, text: { bg: "transparent", fg: "--accent" }, danger: { bg: "--danger", fg: "#FFFFFF" } }, states: ["default", "hover", "pressed", "focused", "disabled", "loading"] },
    guideline: { do: ["라벨은 결과가 예측되는 동사로 씁니다 (\"정책 저장\", \"차단 해제\").", "위험 작업은 Danger + 확인 팝업을 함께 사용합니다."], dont: ["한 영역에 Primary 버튼을 두 개 이상 두지 않습니다.", "\"확인\", \"예\"처럼 결과를 알 수 없는 라벨을 쓰지 않습니다."] },
  },

  /* ------------------------------------------------ Text Field */
  "text-field": {
    status: "ready", react: ["Field","TextField","TextArea"], css: [".field"],
    desc: "한 줄 텍스트를 입력합니다. 라벨·도움말·오류 메시지가 하나의 필드 단위로 묶입니다.",
    thumb: `<div class="field" style="min-width:200px"><label>정책 이름</label><input placeholder="예: USB 차단"></div>`,
    anatomy: { demo: `<span class="anat"><div class="field"><label>정책 이름 <em>*</em></label><input placeholder="예: 외부 USB 차단"><span class="help">2~40자, 한글·영문·숫자</span></div><span class="marker" style="left:-26px;top:0">1</span><span class="marker" style="left:-26px;top:38px">2</span><span class="marker" style="left:-26px;top:84px">3</span></span>`, items: ["Label (필수 표시 em)", "Input Container", "Helper · Error Message"] },
    examples: [
      { id: "basic", title: "Default / Error", desc: "오류 시 .error 를 필드에 붙이고 help 를 오류 메시지로 바꿉니다. 원인과 해결 방법을 함께 씁니다.", html: `
        <div class="field"><label for="ip1">허용 IP</label><input id="ip1" value="10.0.0.12"><span class="help">IPv4 형식</span></div>
        <div class="field error"><label for="ip2">허용 IP</label><input id="ip2" value="10.0.0" aria-invalid="true" aria-describedby="ip2-err"><span class="help" id="ip2-err">올바른 IPv4 형식이 아닙니다. 예: 10.0.0.12</span></div>` },
      { id: "size", title: "Size", desc: "sm 36 · md 44 · lg 52. 버튼과 같은 높이로 나란히 배치합니다.", html: `
        <div class="field sm"><label>Small</label><input placeholder="36px"></div>
        <div class="field"><label>Medium</label><input placeholder="44px"></div>
        <div class="field lg"><label>Large</label><input placeholder="52px"></div>`, layout: "top" },
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
      ["size", "sm | (md) | lg", "md", "입력 높이 36 / 44 / 52"],
      [".error", "boolean", "false", "보더 danger, help 를 오류 메시지로. input 에 aria-invalid"],
      [".affix", "wrapper", "—", "접두어/접미어 span 과 input 을 감싸는 컨테이너"],
      [".counter", "element", "—", "글자 수 표시. .row 안에서 라벨 우측 정렬"],
      ["disabled / readonly", "attribute", "—", "비활성 / 읽기 전용(배경 subtle)"],
    ],
    spec: [["Size", "sm 36 · md 44 · lg 52"], ["Container", "radius/md 8 · border/strong 1px · focus ring 2px 30%"], ["Label", "Label/1 14 Semibold · 필수는 em(*)"], ["Placement", "라벨은 필드 위, 도움말은 아래. 좌우 여백 14"]],
    figma: { frame: "Text Field", radius: "radius/md", sizes: { sm: { h: 36 }, md: { h: 44 }, lg: { h: 52 } }, variants: { default: { bg: "--bg-surface", stroke: "--border-strong" }, error: { stroke: "--danger" } }, states: ["default", "hover", "focused", "error", "disabled", "readonly"] },
    guideline: { do: ["오류 메시지는 원인과 해결 방법을 씁니다.", "플레이스홀더에는 예시를, 라벨에는 항목명을 씁니다."], dont: ["플레이스홀더를 라벨 대신 쓰지 않습니다.", "필수 표시(*) 없이 제출 시점에만 오류를 보여주지 않습니다."] },
  },

  /* ------------------------------------------------ Search */
  "search": {
    status: "ready", react: ["SearchBar"], css: [".searchbar", ".chip", ".chip-group"],
    desc: "목록·로그를 빠르게 필터링하는 검색 입력입니다. 입력 즉시 결과가 바뀌는 '필터형'과 Enter 로 조회하는 '조회형'을 구분합니다.",
    thumb: `<div class="searchbar" style="min-width:220px">${I("search")}<input placeholder="검색"></div>`,
    anatomy: { demo: `<span class="anat"><div class="searchbar">${I("search")}<input placeholder="이벤트, 대상, IP 검색"><kbd>/</kbd></div><span class="marker" style="left:-26px;top:10px">1</span><span class="marker" style="left:120px;top:-26px">2</span><span class="marker" style="right:-6px;top:-26px">3</span></span>`, items: ["Search Icon", "Input", "Shortcut / Clear (Optional)"] },
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
      [".block", "boolean", "false", "전체 폭"],
      ["kbd", "element", "—", "단축키 표시(전역 검색)"],
      [".clear", "button", "—", "값 지우기. 값이 있을 때만 렌더"],
    ],
    spec: [["Size", "높이 40 (lg 48) · 최소 폭 280"], ["Container", "radius/md 8 · border/strong · focus ring"], ["Label", "Body/2 14 · 플레이스홀더 text/disabled"], ["Placement", "테이블 툴바 좌측, 전역 검색은 헤더 우측"]],
    figma: { frame: "Search", radius: "radius/md", sizes: { md: { h: 40 }, lg: { h: 48 } }, variants: { default: { bg: "--bg-surface", stroke: "--border-strong" } }, states: ["default", "focused", "filled"] },
    guideline: { do: ["입력 즉시 필터되는 목록은 결과 수를 함께 보여줍니다.", "검색 결과가 없으면 빈 화면 패턴으로 대안을 제시합니다."], dont: ["검색과 필터를 서로 다른 행에 멀리 떨어뜨리지 않습니다."] },
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
    spec: [["Size", "높이 38 (버튼 32 + 패딩 3) · outline 36"], ["Container", "radius/md 8 · bg/panel"], ["Label", "Label/1 13.5 Medium · 선택 Semibold"], ["Placement", "카드 헤더 우측, 툴바"]],
    figma: { frame: "Select Button", radius: "radius/md", sizes: { md: { h: 38 } }, variants: { filled: { bg: "--bg-panel" }, outline: { stroke: "--border-strong" } }, states: ["default", "selected", "disabled"] },
    guideline: { do: ["옵션은 한 단어 내외, 폭이 비슷하게.", "선택 즉시 결과가 바뀌는 경우에만 씁니다(저장 버튼 없음)."], dont: ["6개 이상이면 Dropdown 또는 Tab 을 씁니다.", "여러 개를 동시에 고르는 용도로 쓰지 않습니다(그때는 Chip)."] },
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
    spec: [["Size", "트랙 6 · 썸 20 · 최소 폭 280"], ["Container", "트랙 radius/full · 썸 border 2px accent"], ["Label", "Label/2 13 · 현재 값 Semibold"], ["Placement", "정책 설정의 수치 항목. 정확 입력이 필요하면 Text Field 병행"]],
    figma: { frame: "Slider", sizes: { md: { track: 6, thumb: 20 } }, variants: { default: { fill: "--accent", track: "--bg-panel" } }, states: ["default", "hover", "focused", "disabled"] },
    guideline: { do: ["현재 값을 항상 텍스트로 함께 표시합니다."], dont: ["정확한 숫자 입력이 필요한 곳에 슬라이더만 두지 않습니다."] },
  },

  /* ------------------------------------------------ Date Picker */
  "date-picker": {
    status: "ready", react: ["Calendar","DatePicker","formatDate"], css: [".datepicker", ".calendar"],
    desc: "날짜 또는 기간을 선택합니다. 로그 조회·리포트 기간처럼 '오늘 기준 최근 N일' 프리셋을 함께 제공합니다.",
    thumb: `<div class="datepicker"><button class="field-btn" style="min-width:200px">2026-09-01 <span class="sep">~</span> 2026-09-07 ${I("calendar")}</button></div>`,
    examples: [
      { id: "field", title: "Field", desc: "닫힌 상태. 값이 없으면 플레이스홀더, 기간은 ~ 구분.", html: `
        <div class="datepicker"><label>시작일</label><button type="button" class="field-btn" aria-haspopup="dialog" aria-expanded="false"><span class="placeholder">날짜 선택</span>${I("calendar")}</button></div>
        <div class="datepicker"><label>조회 기간</label><button type="button" class="field-btn" aria-haspopup="dialog" aria-expanded="false">2026-09-01 <span class="sep">~</span> 2026-09-07${I("calendar")}</button></div>`, layout: "top" },
      { id: "calendar", title: "Calendar", desc: "열린 상태의 달력. 오늘(.today), 선택(.on), 다른 달(.muted), 선택 불가([disabled]).", html: `
        <div class="calendar" role="dialog" aria-label="날짜 선택">
          <div class="cal-head"><button type="button" aria-label="이전 달">${I("chevron-left",16)}</button><span>2026년 9월</span><button type="button" aria-label="다음 달">${I("chevron-right",16)}</button></div>
          <div class="cal-grid">
            <span class="dow">일</span><span class="dow">월</span><span class="dow">화</span><span class="dow">수</span><span class="dow">목</span><span class="dow">금</span><span class="dow">토</span>
            <button type="button" class="day muted">30</button><button type="button" class="day muted">31</button><button type="button" class="day">1</button><button type="button" class="day">2</button><button type="button" class="day">3</button><button type="button" class="day">4</button><button type="button" class="day">5</button>
            <button type="button" class="day">6</button><button type="button" class="day on today" aria-selected="true">7</button><button type="button" class="day">8</button><button type="button" class="day">9</button><button type="button" class="day">10</button><button type="button" class="day">11</button><button type="button" class="day">12</button>
            <button type="button" class="day">13</button><button type="button" class="day">14</button><button type="button" class="day">15</button><button type="button" class="day">16</button><button type="button" class="day">17</button><button type="button" class="day">18</button><button type="button" class="day">19</button>
            <button type="button" class="day">20</button><button type="button" class="day">21</button><button type="button" class="day">22</button><button type="button" class="day">23</button><button type="button" class="day">24</button><button type="button" class="day">25</button><button type="button" class="day">26</button>
            <button type="button" class="day">27</button><button type="button" class="day">28</button><button type="button" class="day">29</button><button type="button" class="day">30</button><button type="button" class="day muted" disabled>1</button><button type="button" class="day muted" disabled>2</button><button type="button" class="day muted" disabled>3</button>
          </div>
          <div class="cal-foot"><button type="button" class="btn sm text">오늘</button><button type="button" class="btn sm primary">적용</button></div>
        </div>` },
      { id: "range", title: "Range", desc: "기간 선택. 시작·끝은 .on, 사이는 .in-range.", html: `
        <div class="calendar" role="dialog" aria-label="날짜 선택">
          <div class="cal-head"><button type="button" aria-label="이전 달">${I("chevron-left",16)}</button><span>2026년 9월</span><button type="button" aria-label="다음 달">${I("chevron-right",16)}</button></div>
          <div class="cal-grid">
            <span class="dow">일</span><span class="dow">월</span><span class="dow">화</span><span class="dow">수</span><span class="dow">목</span><span class="dow">금</span><span class="dow">토</span>
            <button type="button" class="day muted">30</button><button type="button" class="day muted">31</button><button type="button" class="day on" aria-selected="true">1</button><button type="button" class="day in-range">2</button><button type="button" class="day in-range">3</button><button type="button" class="day in-range">4</button><button type="button" class="day in-range">5</button>
            <button type="button" class="day in-range">6</button><button type="button" class="day on today" aria-selected="true">7</button><button type="button" class="day">8</button><button type="button" class="day">9</button><button type="button" class="day">10</button><button type="button" class="day">11</button><button type="button" class="day">12</button>
            <button type="button" class="day">13</button><button type="button" class="day">14</button><button type="button" class="day">15</button><button type="button" class="day">16</button><button type="button" class="day">17</button><button type="button" class="day">18</button><button type="button" class="day">19</button>
            <button type="button" class="day">20</button><button type="button" class="day">21</button><button type="button" class="day">22</button><button type="button" class="day">23</button><button type="button" class="day">24</button><button type="button" class="day">25</button><button type="button" class="day">26</button>
            <button type="button" class="day">27</button><button type="button" class="day">28</button><button type="button" class="day">29</button><button type="button" class="day">30</button><button type="button" class="day muted">1</button><button type="button" class="day muted">2</button><button type="button" class="day muted">3</button>
          </div>
          <div class="cal-foot"><button type="button" class="btn sm text" data-preset="7">최근 7일</button><button type="button" class="btn sm text" data-preset="30">최근 30일</button><button type="button" class="btn sm primary">적용</button></div>
        </div>` },
    ],
    props: [[".datepicker", "container", "—", "label + .field-btn(+ .calendar). 열림은 .open"], [".field-btn", "button", "—", "값 표시 트리거. 기간은 .sep 로 구분"], [".calendar", "popover", "—", ".cal-head + .cal-grid(.dow ×7, .day ×42) + .cal-foot"], [".day.on / .in-range / .today / .muted", "state", "—", "선택 / 기간 사이 / 오늘 / 다른 달"], ["disabled", "attribute", "—", "선택 불가 날짜"]],
    spec: [["Size", "필드 44 · 달력 폭 296 · 날짜 셀 34"], ["Container", "달력 radius/lg 12 · shadow/2"], ["Label", "요일 Caption 11 · 날짜 Body/2 13"], ["Placement", "필드 아래 4px. 화면 하단이면 위로"]],
    figma: { frame: "Date Picker", radius: "radius/lg", sizes: { field: { h: 44 }, calendar: { w: 296 }, day: { h: 34 } }, variants: { single: {}, range: {} }, states: ["closed", "open", "selected", "range"] },
    guideline: { do: ["날짜 형식은 YYYY-MM-DD 로 고정합니다.", "기간 선택에는 최근 7일/30일 프리셋을 둡니다."], dont: ["미래 날짜처럼 선택 불가한 날은 숨기지 말고 disabled 로 보여줍니다."] },
  },

  /* ------------------------------------------------ Checkbox */
  "checkbox": {
    status: "ready", react: ["Checkbox","CheckboxGroup"], css: [".checkbox", ".checkbox-group"],
    desc: "여러 항목 중 0개 이상을 선택합니다. 네이티브 input 을 그대로 쓰고 외형만 CSS 로 바꿔 키보드·스크린리더가 동작합니다.",
    thumb: `${cb("이메일 알림", "checked")}${cb("SMS 알림")}`,
    anatomy: { demo: `<span class="anat">${cb("변경 시 관리자에게 알림", "checked", "정책이 배포될 때 메일을 보냅니다")}<span class="marker" style="left:-26px;top:0">1</span><span class="marker" style="left:30px;top:-26px">2</span><span class="marker" style="left:30px;top:26px">3</span></span>`, items: ["Box (input) — 20px", "Label", "Description (Optional)"] },
    examples: [
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
    spec: [["Size", "박스 16 · 라벨 Body/2 14 · 클릭 영역 라벨 포함"], ["Container", "radius/sm 4 · border/strong 1.5px · 선택 accent"], ["Label", "Body/2 14 · 설명 Caption 12.5 tertiary"], ["Placement", "폼 옵션, 테이블 행 선택(.tbl .check)"]],
    figma: { frame: "Checkbox", radius: "radius/sm", sizes: { md: { box: 16 } }, variants: { default: { stroke: "--border-strong" }, checked: { bg: "--accent" } }, states: ["unchecked", "checked", "indeterminate", "disabled", "focused"] },
    guideline: { do: ["라벨을 클릭해도 토글되도록 label 로 감쌉니다.", "목록 전체 선택은 부분 선택 상태를 표현합니다."], dont: ["하나만 고르는 옵션에 체크박스를 쓰지 않습니다(그때는 Radio)."] },
  },

  /* ------------------------------------------------ Chip */
  "chip": {
    status: "ready", react: ["Chip","ChipGroup"], css: [".chip", ".chip-group"],
    desc: "필터 조건이나 입력된 값을 작은 캡슐로 보여줍니다. 선택 가능한 Filter Chip 과 삭제 가능한 Input Chip 을 구분합니다. 상태 표시는 Tag 를 씁니다.",
    thumb: `<button class="chip on" aria-pressed="true">Critical</button><button class="chip" aria-pressed="false">High</button><button class="chip" aria-pressed="false">Medium</button>`,
    examples: [
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
      { id: "size", title: "Size / Disabled", html: `
        <button type="button" class="chip sm on" aria-pressed="true">Small</button>
        <button type="button" class="chip on" aria-pressed="true">Default</button>
        <button type="button" class="chip" aria-pressed="false" disabled>Disabled</button>` },
    ],
    props: [[".chip", "button | span", "—", "선택형은 button, 입력값은 span"], [".on", "boolean", "false", "선택 상태(accent subtle + 체크)"], [".x", "element", "—", "삭제 아이콘(Input Chip)"], ["size", "(md) | sm", "md", "높이 32 / 26"], ["disabled", "attribute", "—", "비활성"]],
    spec: [["Size", "높이 32 (sm 26) · padding 0 12"], ["Container", "radius/full · border/strong · 선택 accent-subtle"], ["Label", "Label/1 13 Medium"], ["Placement", "검색 아래 필터 행, 입력 필드 안 값 목록"]],
    figma: { frame: "Chip", radius: "radius/full", sizes: { md: { h: 32 }, sm: { h: 26 } }, variants: { filter: { stroke: "--border-strong" }, selected: { bg: "--accent-subtle", stroke: "--accent", fg: "--accent" }, input: {} }, states: ["default", "selected", "hover", "disabled"] },
    guideline: { do: ["여러 개 동시 선택 필터에 씁니다.", "삭제 가능한 값은 Chip, 읽기 전용 상태는 Tag."], dont: ["Chip 을 버튼 대신 주요 액션에 쓰지 않습니다."] },
  },

  /* ------------------------------------------------ Radio Button */
  "radio-button": {
    status: "ready", react: ["Radio","RadioGroup"], css: [".radio", ".radio-group"],
    desc: "여러 항목 중 정확히 하나를 고릅니다. 옵션이 5개를 넘으면 Dropdown 을 씁니다.",
    thumb: `<label class="radio"><input type="radio" name="t" checked><span>차단</span></label><label class="radio"><input type="radio" name="t"><span>허용</span></label>`,
    examples: [
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
    props: [[".radio", "label wrapper", "—", "input[type=radio] + span(라벨, small)"], ["name", "attribute", "—", "같은 그룹은 같은 name"], [".card", "boolean", "false", "카드형(보더 + 선택 시 accent)"], [".radio-group", "container", "—", "세로 12px. .row 로 가로"]],
    spec: [["Size", "원 16 · 선택 내부 점 8"], ["Container", "radius/full · border/strong 1.5px"], ["Label", "Body/2 14 · 설명 Caption 12.5"], ["Placement", "폼의 배타 옵션, 설정의 동작 선택"]],
    figma: { frame: "Radio Button", radius: "radius/full", sizes: { md: { box: 16 } }, variants: { default: { stroke: "--border-strong" }, checked: { stroke: "--accent" }, card: { stroke: "--border-default" } }, states: ["unchecked", "checked", "disabled", "focused"] },
    guideline: { do: ["기본값을 하나 선택해 둡니다.", "옵션은 2~5개."], dont: ["선택 해제가 필요한 경우 라디오를 쓰지 않습니다(Checkbox 또는 Switch)."] },
  },

  /* ------------------------------------------------ Switch */
  "switch": {
    status: "ready", react: ["Switch"], css: [".switch"],
    desc: "설정을 켜고 끕니다. 토글 즉시 적용되며 저장 버튼이 없습니다. 저장이 필요한 폼 안에서는 Checkbox 를 씁니다.",
    thumb: `<label class="switch"><input type="checkbox" role="switch" checked><span>실시간 보호</span></label>`,
    examples: [
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
    spec: [["Size", "트랙 44×24 (sm 36×20) · 노브 20"], ["Container", "radius/full · off border/strong · on accent"], ["Label", "Body/2 14"], ["Placement", "설정 행 우측 끝, 테이블 '사용' 열"]],
    figma: { frame: "Switch", radius: "radius/full", sizes: { md: { w: 44, h: 24 }, sm: { w: 36, h: 20 } }, variants: { off: { bg: "--border-strong" }, on: { bg: "--accent" } }, states: ["off", "on", "disabled", "focused"] },
    guideline: { do: ["토글 결과가 즉시 반영될 때만 씁니다.", "라벨은 켜진 상태를 설명합니다(\"실시간 보호\")."], dont: ["\"예/아니오\" 질문형 라벨을 쓰지 않습니다."] },
  },

  /* ------------------------------------------------ Tag */
  "tag": {
    status: "ready", react: ["Tag"], css: [".tag"],
    desc: "상태·분류·심각도를 짧게 표시합니다. 색만이 아니라 라벨 텍스트로도 의미를 전달합니다. 선택·삭제가 필요하면 Chip 을 씁니다.",
    thumb: `<span class="tag critical">Critical</span><span class="tag medium">Medium</span><span class="tag ok">정상</span>`,
    anatomy: { demo: `<span class="anat"><span class="tag high lg">High</span><span class="marker" style="left:-24px;top:4px">1</span><span class="marker" style="right:-24px;top:4px">2</span></span>`, items: ["Dot (상태 점) — currentColor", "Label"] },
    examples: [
      { id: "severity", title: "Severity", desc: "위협 심각도 5단계. --sev-* 토큰과 1:1.", html: `
        <span class="tag critical">Critical</span>
        <span class="tag high">High</span>
        <span class="tag medium">Medium</span>
        <span class="tag low">Low</span>
        <span class="tag info">Info</span>` },
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
    props: [["tone", "critical | high | medium | low | info | ok | accent | (neutral)", "neutral", "의미별 색. severity 는 --sev-*, status 는 feedback 토큰"], ["style", ".outline | .solid | .plain", "subtle", "아웃라인 / 채움 / 점 없음"], ["size", "sm | (md) | lg", "md", "폰트 11 / 12 / 13"]],
    spec: [["Size", "높이 24 (sm 20 · lg 28) · padding 3/10"], ["Container", "radius/full · subtle 배경"], ["Label", "Label/2 12 Semibold"], ["Placement", "테이블 셀, 카드 헤더, 상세 패널 제목 옆"]],
    figma: { frame: "Tag", radius: "radius/full", sizes: { sm: { h: 20 }, md: { h: 24 }, lg: { h: 28 } }, variants: { critical: { bg: "--danger-subtle", fg: "--sev-critical" }, high: { bg: "--danger-subtle", fg: "--sev-high" }, medium: { bg: "--warning-subtle", fg: "--sev-medium" }, low: { bg: "--info-subtle", fg: "--sev-low" }, info: { bg: "--bg-panel", fg: "--sev-info" }, ok: { bg: "--success-subtle", fg: "--success" }, neutral: { bg: "--bg-panel", fg: "--text-secondary" } }, states: ["subtle", "outline", "solid"] },
    guideline: { do: ["테이블·로그에서 동일한 순서(Critical→Info)로 정렬합니다."], dont: ["Status와 Severity를 같은 열에 섞지 않습니다.", "장식 목적으로 색을 바꾸지 않습니다."] },
  },

  /* ------------------------------------------------ Dropdown */
  "dropdown": {
    status: "ready", react: ["Dropdown","DropdownTrigger","Menu","MenuItem","MenuSep","MenuLabel","Select"], css: [".dropdown", ".menu", ".menu-item", ".menu-sep", ".menu-label"],
    desc: "옵션 목록을 열어 하나를 고르거나(Select) 액션 메뉴를 보여줍니다(Menu). 옵션이 5개 이하이고 항상 보여야 하면 Radio/Select Button 을 씁니다.",
    thumb: `<div class="dropdown"><button class="trigger" style="min-width:160px">전체 그룹</button></div>`,
    anatomy: { demo: `<span class="anat"><div class="dropdown open" style="margin-bottom:200px"><button class="trigger" aria-expanded="true">영업팀</button><ul class="menu" role="listbox"><li class="menu-item">전체</li><li class="menu-item on" aria-selected="true">영업팀</li><li class="menu-item">개발팀</li><li class="menu-item">인프라팀</li></ul></div><span class="marker" style="left:-26px;top:10px">1</span><span class="marker" style="right:-26px;top:60px">2</span><span class="marker" style="right:-26px;top:110px">3</span></span>`, items: ["Trigger — 현재 값 + 화살표", "Menu — shadow/2, 4px 아래", "Item — 선택 .on, 위험 .danger"] },
    examples: [
      { id: "select", title: "Select", desc: "값 선택. 닫힘/열림(.open). 열린 메뉴는 role=listbox, 항목 aria-selected.", html: `
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
        </div>`, layout: "tall top", react: `
        import { useState } from "react";
        const GROUPS = ["전체", "영업팀", "개발팀", "인프라팀"];
        export function GroupSelect() {
          const [open, setOpen] = useState(false);
          const [value, setValue] = useState<string | null>(null);
          return (
            <div className={"dropdown" + (open ? " open" : "")}>
              <button type="button" className="trigger" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(o => !o)}>
                {value ?? <span className="placeholder">그룹 선택</span>}
              </button>
              {open && (
                <ul className="menu" role="listbox" aria-label="그룹">
                  {GROUPS.map(g => (
                    <li key={g} role="option" aria-selected={g === value} className={"menu-item" + (g === value ? " on" : "")} onClick={() => { setValue(g); setOpen(false); }}>{g}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        }` },
      { id: "menu", title: "Action Menu", desc: "더 보기(⋯) 버튼에서 여는 액션 목록. 그룹 라벨·구분선·위험 액션.", html: `
        <div class="dropdown open">
          <button type="button" class="btn md secondary icon" aria-label="더 보기" aria-haspopup="menu" aria-expanded="true">${I("dots")}</button>
          <ul class="menu" role="menu" style="left:auto;right:0">
            <li class="menu-label">정책</li>
            <li class="menu-item" role="menuitem">${I("pencil")}편집</li>
            <li class="menu-item" role="menuitem">${I("download")}내보내기</li>
            <li class="menu-sep" role="separator"></li>
            <li class="menu-item danger" role="menuitem">${I("trash")}삭제</li>
          </ul>
        </div>`, layout: "tall", style: "justify-content:flex-end;padding-right:120px" },
      { id: "disabled", title: "Disabled", html: `
        <div class="dropdown"><button type="button" class="trigger" aria-haspopup="listbox" aria-expanded="false" disabled>권한 없음</button></div>` },
    ],
    props: [[".dropdown", "container", "—", "position:relative. 열림은 .open"], [".trigger", "button", "—", "현재 값 표시. 값 없으면 .placeholder"], [".menu", "ul", "—", "role=listbox(선택) 또는 menu(액션)"], [".menu-item", "li", "—", ".on 선택, .danger 위험, aria-disabled 비활성, .hint 단축키"], [".menu-sep / .menu-label", "li", "—", "구분선 / 그룹 라벨"]],
    spec: [["Size", "트리거 높이 40 · 항목 높이 36 · 메뉴 최소 폭 200"], ["Container", "radius/md 8 · shadow/2 · 트리거 아래 4px"], ["Label", "Body/2 14 · 라벨 Caption 11 uppercase"], ["Placement", "필터 툴바, 테이블 행 액션(우측 정렬 메뉴)"]],
    figma: { frame: "Dropdown", radius: "radius/md", sizes: { trigger: { h: 40 }, item: { h: 36 } }, variants: { select: {}, menu: {} }, states: ["closed", "open", "selected", "disabled"] },
    guideline: { do: ["현재 선택 값을 트리거에 항상 표시합니다.", "위험 액션은 구분선 아래 마지막에 둡니다."], dont: ["옵션이 2~3개인데 드롭다운으로 숨기지 않습니다."] },
  },

  /* ------------------------------------------------ Tab */
  "tab": {
    status: "ready", react: ["Tabs","TabList","Tab","TabPanel"], css: [".tabs", ".tab-panel"],
    desc: "같은 맥락의 콘텐츠를 뷰 단위로 전환합니다. 페이지 수준은 Underline, 카드 안의 보조 전환은 Pill.",
    thumb: `<div class="tabs sm" style="width:auto"><button class="tab on">개요</button><button class="tab">이벤트</button><button class="tab">정책</button></div>`,
    examples: [
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
    spec: [["Size", "높이 44 (sm 38) · 탭 간격 24"], ["Container", "하단 1px border/default · 활성 2px"], ["Label", "Title/1 15 Medium · 활성 Bold"], ["Placement", "페이지 헤더 아래, 카드 헤더 우측(pill)"]],
    figma: { frame: "Tab", sizes: { md: { h: 44 }, sm: { h: 38 } }, variants: { underline: {}, pill: { bg: "--bg-panel" } }, states: ["default", "active", "hover", "disabled"] },
    guideline: { do: ["탭 라벨은 명사 한두 단어.", "탭 전환 시 URL 해시 등으로 상태를 유지합니다."], dont: ["탭을 페이지 이동(내비게이션) 대신 쓰지 않습니다.", "탭 7개 이상이면 구조를 나눕니다."] },
  },

  /* ------------------------------------------------ Breadcrumb */
  "breadcrumb": {
    status: "ready", react: ["Breadcrumb","BreadcrumbItem","BreadcrumbMore"], css: [".breadcrumb"],
    desc: "현재 위치의 계층 경로를 보여주고 상위로 돌아가게 합니다. 3단계 이상 깊은 상세 화면에 씁니다.",
    thumb: `<ol class="breadcrumb"><li><a href="#">정책</a></li><li><a href="#">USB 제어</a></li><li aria-current="page">외부 저장장치 차단</li></ol>`,
    examples: [
      { id: "basic", title: "Default", desc: "nav > ol. 마지막 항목은 링크 없이 aria-current=page.", html: `
        <nav aria-label="현재 위치">
          <ol class="breadcrumb">
            <li><a href="#">정책</a></li>
            <li><a href="#">USB 제어</a></li>
            <li aria-current="page">외부 저장장치 차단</li>
          </ol>
        </nav>` },
      { id: "collapsed", title: "Collapsed", desc: "4단계 이상은 중간을 … 로 접습니다(클릭하면 펼침).", html: `
        <nav aria-label="현재 위치">
          <ol class="breadcrumb">
            <li><a href="#">${I("home")}</a></li>
            <li><button type="button" class="more" aria-label="상위 경로 펼치기" data-items="정책|USB 제어">${I("dots",14)}</button></li>
            <li><a href="#">PC-2041</a></li>
            <li aria-current="page">이벤트 #48213</li>
          </ol>
        </nav>` },
    ],
    props: [[".breadcrumb", "ol", "—", "nav[aria-label] 안의 ol"], ["li a", "link", "—", "상위 경로 링크"], ["li[aria-current=page]", "current", "—", "현재 페이지. 링크 없음, Semibold"], [".more", "button", "—", "접힌 경로 펼치기"]],
    spec: [["Size", "높이 20 · 항목 간격 6"], ["Container", "없음(텍스트 행)"], ["Label", "Body/2 13.5 tertiary · 현재 primary Semibold"], ["Placement", "페이지 타이틀 위 8px"]],
    figma: { frame: "Breadcrumb", sizes: { md: { h: 20 } }, variants: { default: {}, collapsed: {} }, states: ["default", "hover"] },
    guideline: { do: ["사이드 내비게이션 구조와 같은 이름을 씁니다."], dont: ["1~2단계 화면에는 쓰지 않습니다.", "현재 페이지를 링크로 만들지 않습니다."] },
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
    props: [[".pagination", "nav", "—", "aria-label=페이지. 버튼 36 (compact 32)"], ["button.on", "current", "—", "현재 페이지 + aria-current=page"], [".gap", "span", "—", "생략(…)"], [".compact / .outline", "boolean", "false", "작은 크기 / 보더형"], [".pagination-bar", "container", "—", "총 건수 + 페이지 크기 + 페이지네이션"]],
    spec: [["Size", "버튼 36 (compact 32) · 간격 4"], ["Container", "radius/md · 현재 accent"], ["Label", "Body/2 14 · 현재 Semibold"], ["Placement", "테이블 하단 우측, 총 건수는 좌측"]],
    figma: { frame: "Pagination", radius: "radius/md", sizes: { md: { h: 36 }, compact: { h: 32 } }, variants: { default: {}, outline: { stroke: "--border-default" } }, states: ["default", "current", "hover", "disabled"] },
    guideline: { do: ["총 건수와 현재 범위(1–50)를 함께 표시합니다.", "페이지 크기 기본값은 50."], dont: ["무한 스크롤과 페이지네이션을 한 목록에 함께 쓰지 않습니다."] },
  },

  /* ------------------------------------------------ Navigation */
  "navigation": {
    status: "ready", react: ["SideNav","SideNavGroup","SideNavItem"], css: [".sidenav", ".count"],
    desc: "콘솔 좌측의 1차 내비게이션입니다. 그룹 라벨로 메뉴를 묶고 현재 위치를 .on 으로 표시합니다. 폭 240, 접으면 64.",
    thumb: `<div class="sidenav" style="width:180px;min-height:0;border:1px solid var(--border-default);border-radius:8px"><a href="#" class="on" aria-current="page">${I("home")}<span>대시보드</span></a><a href="#">${I("list")}<span>이벤트</span></a><a href="#">${I("shield")}<span>정책</span></a></div>`,
    examples: [
      { id: "basic", title: "Default", desc: "그룹 라벨(.group) + 링크. 아이콘 18px, 건수는 .count. 하위 항목은 .sub.", html: `
        <nav class="sidenav" aria-label="주 메뉴" style="border:1px solid var(--border-default);border-radius:12px">
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
      { id: "collapsed", title: "Collapsed", desc: "1280 이하 또는 사용자가 접었을 때. 아이콘만, 라벨은 툴팁으로.", html: `
        <nav class="sidenav collapsed" aria-label="주 메뉴" style="border:1px solid var(--border-default);border-radius:12px">
          <a href="#" class="on" aria-current="page" title="대시보드">${I("home")}<span>대시보드</span></a>
          <a href="#" title="이벤트">${I("list")}<span>이벤트</span></a>
          <a href="#" title="정책">${I("shield")}<span>정책</span></a>
          <a href="#" title="에이전트">${I("server")}<span>에이전트</span></a>
          <a href="#" title="설정">${I("settings")}<span>설정</span></a>
        </nav>`, layout: "left" },
    ],
    props: [[".sidenav", "nav", "—", "폭 240, 세로 링크 목록"], [".group", "div", "—", "그룹 라벨(uppercase caption)"], ["a.on", "current", "—", "현재 메뉴(accent subtle)"], ["a.sub", "child", "—", "하위 항목(들여쓰기)"], [".collapsed", "boolean", "false", "폭 64, 아이콘만"], [".count", "element", "—", "미확인 건수"]],
    spec: [["Size", "폭 240 (접힘 64) · 항목 높이 40"], ["Container", "bg/surface · 우측 1px border"], ["Label", "Body/2 14 · 그룹 Caption 11 uppercase"], ["Placement", "헤더 아래 좌측 고정, 전체 높이"]],
    figma: { frame: "Navigation", radius: "radius/md", sizes: { expanded: { w: 240 }, collapsed: { w: 64 }, item: { h: 40 } }, variants: { default: {}, collapsed: {} }, states: ["default", "hover", "active"] },
    guideline: { do: ["1차 메뉴는 7개 이내, 그룹으로 묶습니다.", "현재 위치는 항상 하나만 강조합니다."], dont: ["3단계 이상 중첩하지 않습니다(그 이상은 페이지 안 Tab)."] },
  },

  /* ------------------------------------------------ Top Navigation */
  "top-navigation": {
    status: "ready", react: ["TopBar","TopBarLogo","TopBarNav","TopBarNavItem","TopBarRight","Avatar"], css: [".topbar", ".avatar", ".searchbar", ".divider", ".count", ".with-count"],
    desc: "제품 상단 바입니다. 제품 로고 · 1차 메뉴(사이드 내비가 없는 제품) · 전역 검색 · 알림 · 사용자 메뉴로 구성합니다.",
    thumb: `<div class="topbar" style="height:44px;padding:0 12px;border-radius:8px;border:1px solid var(--border-default);width:260px"><span class="logo"><i></i>Console</span><span class="right"><span class="avatar sm">JH</span></span></div>`,
    examples: [
      { id: "basic", title: "Default", desc: "로고 + 메뉴 + 우측 액션. 현재 메뉴는 .on.", html: `
        <header class="topbar" style="border-radius:12px;border:1px solid var(--border-default)">
          <a href="#" class="logo"><i></i>Security Console <small>v2.4</small></a>
          <nav aria-label="주 메뉴"><a href="#" class="on" aria-current="page">대시보드</a><a href="#">이벤트</a><a href="#">정책</a><a href="#">에이전트</a></nav>
          <div class="right">
            <span class="with-count"><button type="button" class="btn sm tertiary icon" aria-label="알림 3건">${I("bell")}</button><span class="count">3</span></span>
            <button type="button" class="btn sm tertiary icon" aria-label="설정">${I("settings")}</button>
            <span class="divider vertical" role="separator" aria-orientation="vertical"></span>
            <span class="avatar" title="정희 · 관리자">JH</span>
          </div>
        </header>` },
      { id: "search", title: "With Search", desc: "사이드 내비가 있는 제품은 상단 메뉴 대신 전역 검색을 둡니다.", html: `
        <header class="topbar" style="border-radius:12px;border:1px solid var(--border-default)">
          <a href="#" class="logo"><i></i>Security Console</a>
          <div class="searchbar" role="search" style="margin-left:16px">${I("search")}<input type="search" placeholder="이벤트, 대상, IP 검색" aria-label="전역 검색"><kbd>/</kbd></div>
          <div class="right">
            <span class="with-count"><button type="button" class="btn sm tertiary icon" aria-label="알림">${I("bell")}</button><span class="count dot" aria-hidden="true"></span></span>
            <span class="avatar">JH</span>
          </div>
        </header>` },
    ],
    props: [[".topbar", "header", "—", "높이 56, 하단 1px"], [".logo", "a", "—", "제품 마크(i) + 이름 + small 버전"], ["nav a.on", "current", "—", "현재 1차 메뉴"], [".right", "container", "—", "우측 액션(알림·설정·아바타)"], [".avatar", "span", "—", "이니셜 32 (sm 24)"]],
    spec: [["Size", "높이 56 · 좌우 padding 20"], ["Container", "bg/surface · 하단 border/default"], ["Label", "메뉴 Body/2 14 Medium · 로고 Bold"], ["Placement", "최상단 고정(sticky)"]],
    figma: { frame: "Top Navigation", sizes: { md: { h: 56 } }, variants: { menu: {}, search: {} }, states: ["default", "active"] },
    guideline: { do: ["제품 마크는 제품 메인 컬러(accent), 회사 브랜드는 푸터·로그인에.", "알림은 미확인 건수만 표시합니다."], dont: ["상단 메뉴와 사이드 내비게이션에 같은 메뉴를 중복하지 않습니다."] },
  },

  /* ------------------------------------------------ Accordion */
  "accordion": {
    status: "ready", react: ["Accordion","AccordionGroup"], css: [".accordion", ".accordion-group"],
    desc: "긴 설명이나 고급 설정을 접어 두고 필요할 때 펼칩니다. 네이티브 details/summary 를 써 JS 없이 동작합니다.",
    thumb: `<details class="accordion" open style="min-width:200px"><summary style="padding:10px 14px;font-size:12px">고급 설정</summary><div class="body" style="padding:0 14px 10px;font-size:12px">내용</div></details>`,
    examples: [
      { id: "basic", title: "Default", desc: "details.accordion > summary + .body. open 속성으로 초기 펼침.", html: `
        <details class="accordion" open style="max-width:560px">
          <summary>고급 탐지 옵션 <small>3개 설정</small></summary>
          <div class="body">휴리스틱 분석, 메모리 스캔, 스크립트 차단을 개별로 켜고 끕니다. 기본값은 모두 켬입니다.</div>
        </details>` },
      { id: "group", title: "Group", desc: "여러 항목. 하나만 펼치려면 같은 name 을 줍니다(브라우저 지원 시).", html: `
        <div class="accordion-group" style="max-width:560px">
          <details class="accordion" name="faq" open><summary>정책은 언제 적용되나요?</summary><div class="body">배포 버튼을 누른 뒤 에이전트가 다음 체크인(최대 5분)에서 받아 적용합니다.</div></details>
          <details class="accordion" name="faq"><summary>차단된 파일은 어디에 보관되나요?</summary><div class="body">격리 저장소에 30일 보관 후 자동 삭제됩니다.</div></details>
          <details class="accordion" name="faq"><summary>예외 처리는 어떻게 하나요?</summary><div class="body">정책 › 예외 목록에서 해시 또는 경로를 등록합니다.</div></details>
        </div>` },
      { id: "flat", title: "Flat / Disabled", desc: "카드 안에서는 보더 없는 .flat. 권한이 없으면 .disabled.", html: `
        <div class="accordion-group flat" style="max-width:560px;background:var(--bg-surface);padding:0 20px;border-radius:12px">
          <details class="accordion flat" open><summary>일반</summary><div class="body">정책 이름, 설명, 적용 그룹</div></details>
          <details class="accordion flat"><summary>스케줄</summary><div class="body">적용 요일과 시간대</div></details>
          <details class="accordion flat disabled"><summary>감사 로그 <small>권한 필요</small></summary><div class="body"></div></details>
        </div>` },
    ],
    props: [["details.accordion", "container", "—", "summary + .body"], ["open", "attribute", "—", "펼침 상태"], ["name", "attribute", "—", "같은 name 은 하나만 펼침"], [".flat", "boolean", "false", "보더 없는 구분선형"], [".disabled", "boolean", "false", "펼칠 수 없음"], ["summary small", "element", "—", "우측 보조 정보"]],
    spec: [["Size", "헤더 높이 52 · 본문 padding 0 20 16"], ["Container", "radius/lg 12 · border/default"], ["Label", "Title/1 15 Semibold · 본문 Body/2 14 secondary"], ["Placement", "설정 폼의 고급 옵션, FAQ"]],
    figma: { frame: "Accordion", radius: "radius/lg", sizes: { md: { h: 52 } }, variants: { default: { stroke: "--border-default" }, flat: {} }, states: ["collapsed", "expanded", "disabled"] },
    guideline: { do: ["기본 설정은 펼쳐 두고 고급 설정만 접습니다."], dont: ["필수 입력 항목을 접어 두지 않습니다."] },
  },

  /* ------------------------------------------------ Card */
  "card": {
    status: "ready", react: ["Card","CardHead","CardTitle","CardDesc","CardFoot","CardGrid"], css: [".card", ".card-grid"],
    desc: "관련 정보와 액션을 한 덩어리로 묶는 컨테이너입니다. 보더 대신 Surface 배경 + shadow/1 로 구획합니다.",
    thumb: `<div class="card compact" style="min-width:200px"><div class="card-head"><h3 class="title" style="font-size:14px">라이선스</h3><span class="tag ok sm">정상</span></div><p class="desc" style="font-size:12px">2026-12-31 만료</p></div>`,
    anatomy: { demo: `<span class="anat"><div class="card" style="width:360px"><div class="card-head"><h3 class="title">라이선스</h3><span class="tag ok">정상</span></div><p class="desc">1,000석 중 842석 사용 중. 2026-12-31 만료.</p><div class="card-foot"><button class="btn sm secondary">상세</button><button class="btn sm primary">갱신</button></div></div><span class="marker" style="left:-26px;top:20px">1</span><span class="marker" style="left:-26px;top:70px">2</span><span class="marker" style="left:-26px;top:126px">3</span></span>`, items: ["Header — 제목 + 상태/액션", "Body — 설명·데이터", "Footer — 액션(우측 정렬)"] },
    examples: [
      { id: "basic", title: "Default", html: `
        <div class="card" style="width:360px">
          <div class="card-head"><h3 class="title">라이선스</h3><span class="tag ok">정상</span></div>
          <p class="desc">1,000석 중 842석 사용 중. 2026-12-31 만료.</p>
          <div class="card-foot"><button type="button" class="btn sm secondary">상세</button><button type="button" class="btn sm primary">갱신</button></div>
        </div>` },
      { id: "header", title: "Header Actions", desc: "헤더 우측에 더 보기 메뉴 또는 기간 선택(Select Button).", html: `
        <div class="card" style="width:480px">
          <div class="card-head"><h3 class="title">주간 탐지 추이</h3><div class="tabs pill sm" role="tablist"><button type="button" class="tab on" role="tab" aria-selected="true">7일</button><button type="button" class="tab" role="tab" aria-selected="false">30일</button></div></div>
          <div class="sparkline" aria-hidden="true"><i style="height:30%"></i><i style="height:45%"></i><i style="height:38%"></i><i style="height:70%"></i><i style="height:55%"></i><i style="height:90%" class="hi"></i><i style="height:62%"></i></div>
          <p class="desc">이번 주 탐지 <b>412</b>건, 지난주보다 18% 증가</p>
        </div>` },
      { id: "variant", title: "Bordered / Compact", desc: "카드 위에 카드를 겹칠 때는 .bordered, 밀도 높은 그리드는 .compact.", html: `
        <div class="card bordered" style="width:280px"><h3 class="title">Bordered</h3><p class="desc">그림자 대신 1px 보더</p></div>
        <div class="card compact" style="width:280px"><h3 class="title" style="font-size:14px">Compact</h3><p class="desc">padding 16</p></div>` },
      { id: "clickable", title: "Clickable / Selected", desc: "카드 전체가 링크·선택 대상이면 .clickable, 선택은 .on.", html: `
        <div class="card-grid" style="max-width:600px">
          <a href="#" class="card clickable" style="text-decoration:none;min-width:0"><h3 class="title">USB 제어</h3><p class="desc">정책 12개</p></a>
          <a href="#" class="card clickable on" style="text-decoration:none;min-width:0"><h3 class="title">네트워크</h3><p class="desc">정책 8개 · 선택됨</p></a>
        </div>` },
    ],
    props: [[".card", "container", "—", "flex column, gap 12, padding 24"], [".card-head / .title / .desc / .card-foot", "elements", "—", "헤더 / 제목 16 / 설명 14 / 푸터 우측 정렬"], [".bordered", "boolean", "false", "shadow 대신 1px 보더"], [".compact", "boolean", "false", "padding 16"], [".clickable / .on", "boolean", "false", "hover shadow/2 / 선택 outline accent"], [".card-grid", "container", "—", "auto-fill 260px 그리드"]],
    spec: [["Size", "최소 폭 260 · padding 24 (compact 16)"], ["Container", "radius/lg 12 · shadow/1 · bg/surface"], ["Label", "제목 Title/1 16 Semibold · 설명 Body/2 14"], ["Placement", "대시보드 그리드(gap 20), 상세 패널"]],
    figma: { frame: "Card", radius: "radius/lg", sizes: { md: { pad: 24 }, compact: { pad: 16 } }, variants: { default: { bg: "--bg-surface", shadow: "--shadow-1" }, bordered: { stroke: "--border-default" } }, states: ["default", "hover", "selected"] },
    guideline: { do: ["카드 = Surface 배경 + shadow/1. 카드 사이 gap 20."], dont: ["카드 안에 카드를 겹치지 않습니다(필요하면 .bordered 또는 구분선).", "카드마다 다른 반경·그림자를 쓰지 않습니다."] },
  },

  /* ------------------------------------------------ Popup */
  "popup": {
    status: "ready", react: ["Popup","PopupSurface","PopupTitle","PopupBody","PopupActions","PopupForm"], css: [".popup", ".popup-backdrop"],
    desc: "사용자의 확인이나 짧은 입력이 필요할 때 화면 위에 띄우는 모달입니다. 되돌리기 어려운 동작 앞에 반드시 둡니다.",
    thumb: `<div class="popup" style="width:220px;padding:14px;gap:6px"><h3 class="popup-title" style="font-size:12px">정책 삭제</h3><p class="popup-body" style="font-size:12px">되돌릴 수 없습니다.</p><div class="popup-actions" style="margin-top:4px"><button class="btn sm secondary" style="height:26px;font-size:12px">취소</button><button class="btn sm danger" style="height:26px;font-size:12px">삭제</button></div></div>`,
    anatomy: { demo: `<span class="anat"><div class="popup" role="dialog" aria-modal="true" aria-labelledby="pt"><h3 class="popup-title" id="pt">정책을 배포할까요?</h3><p class="popup-body">변경 사항이 12개 그룹, 1,284대에 적용됩니다. 에이전트는 다음 체크인에서 정책을 받습니다.</p><div class="popup-actions"><button class="btn md secondary">취소</button><button class="btn md primary">배포</button></div></div><span class="marker" style="left:-26px;top:22px">1</span><span class="marker" style="left:-26px;top:70px">2</span><span class="marker" style="right:-26px;bottom:34px">3</span></span>`, items: ["Title — 질문형, 결과가 드러나게", "Body — 영향 범위·되돌림 가능 여부", "Actions — 취소 왼쪽, 주 액션 오른쪽"] },
    examples: [
      { id: "confirm", title: "Confirm", desc: "실제 화면에서는 .popup-backdrop 으로 감쌉니다(코드 참조). 예제는 팝업만 표시.", html: `
        <div class="popup" role="dialog" aria-modal="true" aria-labelledby="c-title">
          <h3 class="popup-title" id="c-title">정책을 배포할까요?</h3>
          <p class="popup-body">변경 사항이 12개 그룹, 1,284대에 적용됩니다. 에이전트는 다음 체크인(최대 5분)에서 정책을 받습니다.</p>
          <div class="popup-actions"><button type="button" class="btn md secondary" data-popup-close>취소</button><button type="button" class="btn md primary">배포</button></div>
        </div>`, react: `
        import { useState } from "react";
        export function DeployConfirm() {
          const [open, setOpen] = useState(false);
          return (
            <>
              <button type="button" className="btn md primary" onClick={() => setOpen(true)}>배포</button>
              {open && (
                <div className="popup-backdrop" onClick={() => setOpen(false)}>
                  <div className="popup" role="dialog" aria-modal="true" aria-labelledby="c-title" onClick={e => e.stopPropagation()}>
                    <h3 className="popup-title" id="c-title">정책을 배포할까요?</h3>
                    <p className="popup-body">변경 사항이 12개 그룹, 1,284대에 적용됩니다.</p>
                    <div className="popup-actions">
                      <button type="button" className="btn md secondary" onClick={() => setOpen(false)}>취소</button>
                      <button type="button" className="btn md primary" onClick={() => setOpen(false)}>배포</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        }` },
      { id: "danger", title: "Danger Confirm", desc: "삭제·초기화. 제목은 danger 색, 주 액션은 Danger 버튼, 필요하면 확인 입력.", html: `
        <div class="popup danger" role="dialog" aria-modal="true" aria-labelledby="d-title">
          <h3 class="popup-title" id="d-title">정책 12개를 삭제할까요?</h3>
          <p class="popup-body">삭제한 정책은 복구할 수 없습니다. 해당 정책이 적용된 에이전트는 기본 정책으로 돌아갑니다.</p>
          <div class="field"><label for="confirm">확인을 위해 <b>삭제</b> 를 입력하세요</label><input id="confirm" placeholder="삭제"></div>
          <div class="popup-actions"><button type="button" class="btn md secondary" data-popup-close>취소</button><button type="button" class="btn md danger" disabled>삭제</button></div>
        </div>` },
      { id: "form", title: "Form", desc: "짧은 입력(필드 1~3개). 그 이상은 별도 페이지나 드로어.", html: `
        <div class="popup" role="dialog" aria-modal="true" aria-labelledby="f-title">
          <h3 class="popup-title" id="f-title">예외 추가</h3>
          <div class="popup-form">
            <div class="field"><label for="hash">파일 해시(SHA-256)</label><input id="hash" placeholder="64자리 16진수"></div>
            <div class="field"><label for="reason">사유</label><input id="reason" placeholder="예: 사내 배포 도구"></div>
            ${cb("모든 그룹에 적용")}
          </div>
          <div class="popup-actions"><button type="button" class="btn md secondary" data-popup-close>취소</button><button type="button" class="btn md primary">추가</button></div>
        </div>` },
    ],
    props: [[".popup-backdrop", "overlay", "—", "fixed, rgba(15,23,42,.65), 중앙 정렬"], [".popup", "dialog", "—", "role=dialog aria-modal aria-labelledby. 폭 440 (lg 640)"], [".popup-title / .popup-body / .popup-actions", "elements", "—", "제목 18 / 본문 14 / 액션 우측"], [".danger", "boolean", "false", "제목 danger 색"], [".popup-form", "container", "—", "필드 세로 16px 간격"]],
    spec: [["Size", "폭 440 (lg 640) · padding 24"], ["Container", "radius/xl 16 · shadow/3 · 배경 음영 65%"], ["Label", "제목 Heading/4 18 Bold · 본문 Body/2 14"], ["Placement", "화면 중앙. 열릴 때 포커스 이동, ESC 로 닫힘"]],
    figma: { frame: "Popup", radius: "radius/xl", sizes: { md: { w: 440 }, lg: { w: 640 } }, variants: { confirm: {}, danger: {}, form: {} }, states: ["default"] },
    guideline: { do: ["제목은 질문형, 버튼 라벨은 동사(배포·삭제).", "위험 동작은 Danger 버튼 + 필요 시 확인 입력."], dont: ["팝업 위에 팝업을 띄우지 않습니다.", "단순 안내를 팝업으로 막지 않습니다(Notification)."] },
  },

  /* ------------------------------------------------ Tooltip */
  "tooltip": {
    status: "ready", react: ["Tooltip"], css: [".tooltip", ".tooltip-wrap"],
    desc: "아이콘 버튼의 이름이나 짧은 보조 설명을 hover/focus 시 보여줍니다. 필수 정보를 툴팁에만 두지 않습니다.",
    thumb: `<span class="tooltip-wrap show"><button class="btn sm secondary icon" aria-label="새로 고침">${I("refresh")}</button><span class="tooltip" role="tooltip">새로 고침</span></span>`,
    examples: [
      { id: "position", title: "Position", desc: "기본 위. .bottom / .left / .right. 예제는 .show 로 항상 표시.", html: `
        <span class="tooltip-wrap show"><button type="button" class="btn md secondary">Top</button><span class="tooltip" role="tooltip">위 (기본)</span></span>
        <span class="tooltip-wrap show"><button type="button" class="btn md secondary">Bottom</button><span class="tooltip bottom" role="tooltip">아래</span></span>
        <span class="tooltip-wrap show"><button type="button" class="btn md secondary">Left</button><span class="tooltip left" role="tooltip">왼쪽</span></span>
        <span class="tooltip-wrap show"><button type="button" class="btn md secondary">Right</button><span class="tooltip right" role="tooltip">오른쪽</span></span>`, style: "gap:104px;padding:64px 40px" },
      { id: "hover", title: "On Hover / Focus", desc: "실제 동작. 아이콘 버튼 위에 마우스를 올리거나 포커스하세요. aria-describedby 로 연결.", html: `
        <span class="tooltip-wrap"><button type="button" class="btn md secondary icon" aria-label="새로 고침" aria-describedby="tt1">${I("refresh")}</button><span class="tooltip" role="tooltip" id="tt1">새로 고침</span></span>
        <span class="tooltip-wrap"><button type="button" class="btn md secondary icon" aria-label="필터" aria-describedby="tt2">${I("filter")}</button><span class="tooltip" role="tooltip" id="tt2">필터</span></span>
        <span class="tooltip-wrap"><button type="button" class="btn md danger secondary icon" aria-label="삭제" aria-describedby="tt3">${I("trash")}</button><span class="tooltip" role="tooltip" id="tt3">삭제</span></span>`, style: "padding-top:64px" },
      { id: "multi", title: "Multiline", desc: "두 줄 이상은 .multi (폭 220). 그 이상 설명은 Popover/도움말 링크.", html: `
        <span class="tooltip-wrap show"><span class="indicator warn">검토 필요</span><span class="tooltip multi" role="tooltip">서명이 확인되지 않은 실행 파일입니다. 24시간 내 처리하지 않으면 자동 차단됩니다.</span></span>`, style: "padding-top:96px" },
    ],
    props: [[".tooltip-wrap", "container", "—", "position:relative 트리거 래퍼"], [".tooltip", "span", "—", "role=tooltip. 기본 위치 위"], ["position", ".bottom | .left | .right", "top", "위치"], [".show", "boolean", "false", "강제 표시(문서·디버그)"], [".multi", "boolean", "false", "여러 줄, 폭 220"]],
    spec: [["Size", "높이 28 · padding 6 10 · 트리거와 8px"], ["Container", "radius 6 · bg/inverse · shadow/2 · 화살표 5px"], ["Label", "Caption 12.5 Medium inverse"], ["Placement", "아이콘 전용 버튼 필수, 잘린 텍스트, 차트 값"]],
    figma: { frame: "Tooltip", radius: 6, sizes: { md: { h: 28 } }, variants: { top: {}, bottom: {}, left: {}, right: {} }, states: ["default", "multiline"] },
    guideline: { do: ["아이콘 전용 버튼에는 항상 툴팁(=aria-label)을 둡니다.", "지연 없이 표시, 120ms 페이드."], dont: ["툴팁 안에 링크·버튼을 넣지 않습니다.", "클릭해야 보이는 정보를 툴팁으로 만들지 않습니다."] },
  },

  /* ------------------------------------------------ Notification */
  "notification": {
    status: "ready", react: ["Notice","Toast","ToastStack","Banner","ToastProvider","useToast"], css: [".notice", ".toast", ".toast-stack", ".banner"],
    desc: "시스템 상태와 결과를 알립니다. 페이지 안에 머무는 Notice, 잠시 떴다 사라지는 Toast, 화면 상단 전체 공지 Banner 를 구분합니다.",
    thumb: `<div class="notice warning" style="max-width:240px;padding:10px 12px;font-size:12px"><span class="ico">${I("alert-triangle",20)}</span><div><b>라이선스 만료 임박</b>3일 후 만료</div></div>`,
    anatomy: { demo: `<span class="anat"><div class="notice info" style="max-width:520px"><span class="ico">${I("info-circle",20)}</span><div><b>정책이 아직 배포되지 않았습니다</b>변경 사항은 '배포'를 눌러야 에이전트에 적용됩니다.<div class="actions"><button class="btn sm primary">지금 배포</button><button class="btn sm text">나중에</button></div></div><button class="close" aria-label="닫기">${I("x",14)}</button></div><span class="marker" style="left:-26px;top:14px">1</span><span class="marker" style="left:40px;top:-26px">2</span><span class="marker" style="left:40px;top:44px">3</span><span class="marker" style="left:40px;bottom:-4px">4</span><span class="marker" style="right:-26px;top:10px">5</span></span>`, items: ["Icon — 톤별 색", "Title", "Description", "Actions (Optional)", "Dismiss (Optional)"] },
    examples: [
      { id: "notice", title: "Notice (Inline)", desc: "페이지에 고정. Info · Success · Warning · Danger. role=status(정보) 또는 alert(위험).", html: `
        <div class="notice info" role="status" style="max-width:600px"><span class="ico">${I("info-circle",20)}</span><div><b>정책이 아직 배포되지 않았습니다</b>변경 사항은 '배포'를 눌러야 에이전트에 적용됩니다.</div><button type="button" class="close" aria-label="닫기">${I("x",14)}</button></div>
        <div class="notice success" role="status" style="max-width:600px"><span class="ico">${I("circle-check",20)}</span><div><b>배포 완료</b>1,284대 중 1,284대에 적용되었습니다.</div></div>
        <div class="notice warning" role="status" style="max-width:600px"><span class="ico">${I("alert-triangle",20)}</span><div><b>라이선스가 3일 후 만료됩니다</b>만료 시 신규 이벤트 수집이 중단됩니다.<div class="actions"><button type="button" class="btn sm primary">갱신 요청</button></div></div></div>
        <div class="notice danger" role="alert" style="max-width:600px"><span class="ico">${I("alert-circle",20)}</span><div><b>에이전트 37대 연결 끊김</b>10분 이상 체크인이 없습니다. 네트워크 상태를 확인하세요.</div></div>`, layout: "stack" },
      { id: "toast", title: "Toast", desc: "짧은 결과 알림. 우측 하단, 3~5초 후 자동 소멸, 실행 취소 액션 가능. aria-live=polite.", html: `
        <div class="toast-stack" aria-live="polite">
          <div class="toast"><span class="ico">${I("circle-check",20)}</span>정책 'USB 차단' 이 저장되었습니다<button type="button" class="action">실행 취소</button></div>
          <div class="toast danger"><span class="ico">${I("alert-circle",20)}</span>내보내기에 실패했습니다<button type="button" class="action">다시 시도</button></div>
        </div>` },
      { id: "banner", title: "Banner", desc: "시스템 전체 공지(점검·라이선스). 헤더 위 전체 폭, 닫기 가능.", html: `
        <div class="banner" role="status">${I("info-circle")}9월 10일 02:00~04:00 정기 점검이 예정되어 있습니다. 점검 중 콘솔 접속이 제한됩니다.<button type="button" class="btn sm secondary">자세히</button></div>`, layout: "stack", style: "padding:24px 0;gap:8px" },
    ],
    props: [[".notice", "div", "—", "role=status | alert. .ico + div(b 제목 + 본문 + .actions) + .close"], ["tone", "info | success | warning | danger", "neutral", "톤별 subtle 배경 + 30% 보더"], [".toast", "div", "—", "폭 360, 어두운 배경. .action 하나"], [".toast-stack", "container", "—", "aria-live=polite, 우측 하단 고정"], [".banner", "div", "—", "전체 폭. accent / .warning / .danger"]],
    spec: [["Size", "Notice 최소 높이 56 · Toast 폭 360 · Banner 높이 44"], ["Container", "Notice radius/lg 12 · tone subtle + 30% 보더 · Toast bg/inverse"], ["Label", "Title Semibold 14 · Body 14"], ["Placement", "Notice 는 페이지 헤더 아래, Toast 우측 하단, Banner 헤더 위"]],
    figma: { frame: "Notification", radius: "radius/lg", sizes: { notice: { minH: 56 }, toast: { w: 360 }, banner: { h: 44 } }, variants: { info: { bg: "--info-subtle", fg: "--info" }, success: { bg: "--success-subtle", fg: "--success" }, warning: { bg: "--warning-subtle", fg: "--warning" }, danger: { bg: "--danger-subtle", fg: "--danger" }, toast: { bg: "--bg-inverse", fg: "--text-inverse" } }, states: ["default", "with-action", "dismissible"] },
    guideline: { do: ["무엇이 일어났고 무엇을 하면 되는지 한 문장씩 씁니다.", "되돌릴 수 있는 동작의 Toast 에는 실행 취소를 둡니다."], dont: ["일시적 결과 알림을 Notice 로 남겨 두지 않습니다.", "Toast 를 3개 이상 동시에 쌓지 않습니다."] },
  },

  /* ------------------------------------------------ Loading */
  "loading": {
    status: "ready", react: ["Spinner","Skeleton","SkeletonRow","Progress"], css: [".spinner", ".spinner-wrap", ".skeleton", ".skeleton-row", ".progress", ".progress-row"],
    desc: "로딩 상태를 알립니다. 1초 미만은 표시하지 않고, 영역 로딩은 Skeleton, 짧은 동작은 Spinner, 진행률을 알면 Progress.",
    thumb: `<span class="spinner"></span><div style="width:120px;display:flex;flex-direction:column;gap:6px"><span class="skeleton title" style="width:60%"></span><span class="skeleton text"></span></div>`,
    examples: [
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
        </div>`, layout: "white" },
      { id: "progress", title: "Progress", desc: "진행률을 알 때. 배포·검사 진행. 완료는 success, 실패는 danger.", html: `
        <div style="width:100%;max-width:480px;display:flex;flex-direction:column;gap:20px">
          <div class="progress-row"><div class="row"><span>정책 배포 중</span><span>842 / 1,284</span></div><div class="progress" role="progressbar" aria-valuenow="66" aria-valuemin="0" aria-valuemax="100"><i style="width:66%"></i></div></div>
          <div class="progress-row"><div class="row"><span>전체 검사 완료</span><span>100%</span></div><div class="progress success" role="progressbar" aria-valuenow="100"><i style="width:100%"></i></div></div>
          <div class="progress-row"><div class="row"><span>업데이트 실패</span><span>38%</span></div><div class="progress danger" role="progressbar" aria-valuenow="38"><i style="width:38%"></i></div></div>
        </div>` },
    ],
    props: [[".spinner", "span", "—", "role=status aria-label. sm | (md) | lg"], [".skeleton", "span", "—", ".title | .text(.short) | .circle | .rect. 컨테이너에 aria-busy"], [".progress", "div", "—", "role=progressbar aria-valuenow. i 의 width 가 진행률"], ["tone", ".success | .danger", "accent", "완료 / 실패"], [".sm", "boolean", "false", "높이 4"]],
    spec: [["Size", "Spinner 16/24/40 · Skeleton 행 14 · Progress 8 (sm 4)"], ["Container", "Skeleton radius 6 · Progress radius/full"], ["Label", "Caption 13 tertiary"], ["Placement", "Skeleton 은 콘텐츠 자리 그대로, Spinner 는 영역 중앙"]],
    figma: { frame: "Loading", sizes: { spinner: { sm: 16, md: 24, lg: 40 }, progress: { h: 8 } }, variants: { spinner: {}, skeleton: { bg: "--bg-panel" }, progress: { fill: "--accent", track: "--bg-panel" } }, states: ["default", "success", "danger"] },
    guideline: { do: ["1초 이상 걸릴 때만 표시합니다.", "진행률을 알 수 있으면 Progress 와 수치를 함께."], dont: ["전체 화면을 스피너로 가리지 않습니다(영역 단위로)."] },
  },

  /* ------------------------------------------------ Indicator */
  "indicator": {
    status: "ready", react: ["Indicator","Count","WithCount","Steps"], css: [".indicator", ".count", ".with-count", ".steps"],
    desc: "상태 점, 건수 배지, 단계 표시처럼 작은 시각 신호입니다. 텍스트 라벨과 함께 써 색만으로 의미를 전달하지 않습니다.",
    thumb: `<span class="indicator ok">정상</span><span class="indicator danger">차단</span><span class="count">3</span>`,
    examples: [
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
        <span class="with-count"><button type="button" class="btn md secondary icon" aria-label="알림 5건">${I("bell")}</button><span class="count">5</span></span>
        <span class="with-count"><button type="button" class="btn md secondary icon" aria-label="새 알림">${I("bell")}</button><span class="count dot" aria-hidden="true"></span></span>` },
      { id: "steps", title: "Steps", desc: "온보딩·마법사 진행 단계. 완료 .done, 현재 .on.", html: `
        <ol class="steps">
          <li class="done"><i>${I("check",12)}</i>기본 정보</li>
          <li class="done"><i>${I("check",12)}</i>적용 대상</li>
          <li class="on" aria-current="step"><i>3</i>규칙 설정</li>
          <li><i>4</i>검토 · 배포</li>
        </ol>` },
    ],
    props: [[".indicator", "span", "—", "점 + 라벨. ok | warn | danger | info | accent | (neutral)"], [".pulse", "boolean", "false", "깜빡임(위험 실시간)"], [".count", "span", "—", "건수. .accent / .neutral / .dot(점만)"], [".with-count", "wrapper", "—", "아이콘 우상단에 count 배치"], [".steps li", "li", "—", ".done 완료, .on 현재. .vertical 세로"]],
    spec: [["Size", "점 8 · count 높이 20 · step 원 24"], ["Container", "radius/full"], ["Label", "Body/2 14 · count 11 Bold · steps 13"], ["Placement", "테이블 상태 열, 내비 건수, 마법사 상단"]],
    figma: { frame: "Indicator", radius: "radius/full", sizes: { dot: 8, count: { h: 20 }, step: 24 }, variants: { ok: { fg: "--success" }, warn: { fg: "--warning" }, danger: { fg: "--danger" }, info: { fg: "--info" }, neutral: { fg: "--gray-400" } }, states: ["default", "pulse"] },
    guideline: { do: ["점 색과 라벨 텍스트를 항상 함께 씁니다."], dont: ["건수 0 을 배지로 보여주지 않습니다(숨김)."] },
  },

  /* ------------------------------------------------ Divider */
  "divider": {
    status: "ready", react: ["Divider"], css: [".divider"],
    desc: "콘텐츠 그룹을 나눕니다. 여백과 배경 차이로 구획이 되면 쓰지 않고, 꼭 필요한 곳에만 아주 연하게.",
    thumb: `<div style="width:160px"><hr class="divider" style="margin:6px 0"><hr class="divider label" style="margin:6px 0">또는</hr></div>`,
    examples: [
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
          <button type="button" class="btn sm tertiary">편집</button>
          <button type="button" class="btn sm tertiary">복제</button>
          <span class="divider vertical" role="separator" aria-orientation="vertical"></span>
          <button type="button" class="btn sm tertiary">내보내기</button>
          <span class="divider vertical" role="separator" aria-orientation="vertical"></span>
          <button type="button" class="btn sm danger secondary">삭제</button>
        </div>` },
    ],
    props: [[".divider", "hr | div", "—", "가로 1px border/default, margin 16 0"], [".strong / .dashed", "boolean", "false", "border/strong / 점선"], [".label", "div", "—", "가운데 라벨 텍스트"], [".vertical", "span", "—", "세로 1×24, 좌우 12"]],
    spec: [["Size", "1px · 세로 24"], ["Container", "border/default (strong 시 border/strong)"], ["Label", "Caption 12 tertiary"], ["Placement", "설정 섹션 사이, 툴바 버튼 그룹 사이"]],
    figma: { frame: "Divider", sizes: { horizontal: { h: 1 }, vertical: { w: 1, h: 24 } }, variants: { default: { stroke: "--border-default" }, strong: { stroke: "--border-strong" }, label: {} }, states: ["default"] },
    guideline: { do: ["여백(24~48)으로 나눌 수 있으면 여백을 먼저 씁니다."], dont: ["카드 보더·테이블 행선과 겹쳐 두 겹으로 그리지 않습니다."] },
  },

  /* ------------------------------------------------ Data Table */
  "data-table": {
    status: "ready", react: ["DataTable","ActionBar"], css: [".tbl-wrap", ".tbl", ".action-bar", ".tag", ".checkbox", ".indicator"],
    desc: "로그·이벤트·정책 목록처럼 대량의 행 데이터를 다룹니다. 정렬·선택·행 액션을 갖춘 콘솔의 핵심 컴포넌트입니다. 단순 표는 Table 을 씁니다.",
    thumb: `<div class="tbl-wrap" style="width:240px"><table class="tbl compact"><thead><tr><th>시간</th><th>심각도</th></tr></thead><tbody><tr><td>09:41</td><td><span class="tag critical sm">Critical</span></td></tr><tr><td>09:40</td><td><span class="tag medium sm">Medium</span></td></tr></tbody></table></div>`,
    anatomy: { demo: `<span class="anat" style="width:100%"><div class="tbl-wrap"><table class="tbl"><thead><tr><th class="sortable sorted desc">시간</th><th class="sortable">심각도</th><th>이벤트</th><th>대상</th><th>상태</th><th class="actions"></th></tr></thead><tbody><tr><td>09:41:12</td><td><span class="tag critical">Critical</span></td><td>랜섬웨어 행위 탐지</td><td>PC-2041 · 김민준</td><td><span class="indicator danger">차단</span></td><td class="actions"><button class="btn sm tertiary icon" aria-label="더 보기">${I("dots")}</button></td></tr><tr><td>09:40:58</td><td><span class="tag medium">Medium</span></td><td>미승인 USB 연결</td><td>PC-1187 · 이서연</td><td><span class="indicator warn">검토 필요</span></td><td class="actions"><button class="btn sm tertiary icon" aria-label="더 보기">${I("dots")}</button></td></tr></tbody></table></div><span class="marker" style="left:-26px;top:14px">1</span><span class="marker" style="left:-26px;top:66px">2</span><span class="marker" style="left:200px;top:-26px">3</span><span class="marker" style="right:-26px;top:66px">4</span></span>`, items: ["Header — 정렬 아이콘(.sortable / .sorted)", "Row — hover 배경, 선택 .on", "Cell — 태그·인디케이터·숫자(.num)", "Row Actions — 우측 정렬"] },
    examples: [
      { id: "basic", title: "Default (Sortable)", desc: "헤더 클릭 정렬. 정렬 중인 열은 .sorted(.desc). 숫자 열은 .num.", html: `
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr><th class="sortable sorted desc" aria-sort="descending">시간</th><th class="sortable">심각도</th><th>이벤트</th><th class="sortable">대상</th><th class="num sortable">횟수</th><th>상태</th></tr></thead>
            <tbody>
              <tr><td>09:41:12</td><td><span class="tag critical">Critical</span></td><td><a href="#" class="link">랜섬웨어 행위 탐지</a></td><td>PC-2041 · 김민준</td><td class="num">3</td><td><span class="indicator danger">차단</span></td></tr>
              <tr><td>09:40:58</td><td><span class="tag medium">Medium</span></td><td><a href="#" class="link">미승인 USB 연결</a></td><td>PC-1187 · 이서연</td><td class="num">1</td><td><span class="indicator warn">검토 필요</span></td></tr>
              <tr><td>09:38:03</td><td><span class="tag low">Low</span></td><td><a href="#" class="link">정책 동기화 완료</a></td><td>Server-03</td><td class="num">12</td><td><span class="indicator ok">정상</span></td></tr>
              <tr><td>09:36:47</td><td><span class="tag high">High</span></td><td><a href="#" class="link">알려진 악성코드 차단</a></td><td>PC-0932 · 박지훈</td><td class="num">2</td><td><span class="indicator danger">차단</span></td></tr>
            </tbody>
          </table>
        </div>` },
      { id: "selectable", title: "Selectable + Action Bar", desc: "체크박스 열(.check) + 선택 시 상단 액션 바. 선택 행은 .on.", html: `
        <div class="tbl-wrap">
          <div class="action-bar"><b>2개 선택</b><span class="spacer"></span><button type="button" class="btn sm secondary">허용 처리</button><button type="button" class="btn sm secondary">${I("download")}내보내기</button><button type="button" class="btn sm danger secondary">삭제</button></div>
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
              <tr class="log-row"><td>2026-09-07 09:41:09.114</td><td><span class="tag info sm">INFO</span></td><td>10.0.0.3</td><td>policy.sync ok (rev 2041)</td></tr>
              <tr class="log-row"><td>2026-09-07 09:41:08.552</td><td><span class="tag info sm">INFO</span></td><td>10.0.0.3</td><td>agent.checkin 1284/1284</td></tr>
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
    props: [[".tbl-wrap", "container", "—", "보더 + radius/lg + 가로 스크롤. 안에 .action-bar 와 table.tbl"], [".tbl", "table", "—", "기본 행 52. .compact 44 · .zebra 줄무늬"], ["th.sortable / .sorted(.desc)", "header", "—", "정렬 가능 / 정렬 중. aria-sort"], ["tr.on / .disabled", "row", "—", "선택 / 비활성"], ["td.num / .check / .actions / .empty", "cell", "—", "숫자 우측 정렬 / 체크박스 열 / 행 액션 / 빈 상태"], [".action-bar", "div", "—", "선택 건수 + 일괄 액션"]],
    spec: [["Size", "행 높이 52 (compact 44) · 헤더 44"], ["Container", "radius/lg 12 · border/default 1px · 셀 격자선 없음"], ["Label", "헤더 Label/2 12.5 Semibold tertiary · 셀 Body/2 14 · 숫자 tabular"], ["Placement", "툴바(검색·필터) 위, 페이지네이션 아래 · 10열 이하 기본 노출"]],
    figma: { frame: "Data Table", radius: "radius/lg", sizes: { row: { h: 52 }, compact: { h: 44 }, header: { h: 44 } }, variants: { default: {}, selectable: {}, compact: {} }, states: ["default", "hover", "selected", "sorted", "empty"] },
    guideline: { do: ["시간·수치 열은 tabular-nums 로 자릿수를 맞춥니다.", "행 클릭은 상세 패널을 열고, 편집은 인라인 액션으로 분리합니다."], dont: ["셀마다 격자선을 그리지 않습니다. 가로 구분선만, 아주 연하게.", "한 화면에 12열 이상 기본 노출하지 않습니다(열 설정 제공)."] },
  },

  /* ------------------------------------------------ Table */
  "table": {
    status: "ready", react: ["Table","TableHead","TableBody","TableRow","TableHeader","TableCell"], css: [".tbl-wrap", ".tbl"],
    desc: "정렬·선택이 필요 없는 단순 표입니다. 상세 정보(키-값), 비교표, 요약 통계에 씁니다.",
    thumb: `<div class="tbl-wrap" style="width:220px"><table class="tbl compact kv"><tbody><tr><th style="width:80px">이름</th><td>USB 차단</td></tr><tr><th>상태</th><td>사용</td></tr></tbody></table></div>`,
    examples: [
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
    spec: [["Size", "행 52 (compact 44) · kv th 폭 200"], ["Container", "radius/lg 12 · border/default"], ["Label", "헤더 Label/2 12.5 · 셀 Body/2 14"], ["Placement", "상세 패널, 리포트 요약"]],
    figma: { frame: "Table", radius: "radius/lg", sizes: { row: { h: 52 }, compact: { h: 44 } }, variants: { simple: {}, kv: {}, zebra: {} }, states: ["default"] },
    guideline: { do: ["5행 이하 단순 정보는 표 대신 .kv(정의 목록)도 고려합니다."], dont: ["정렬·필터가 필요해지면 Data Table 로 바꿉니다."] },
  },

  /* ------------------------------------------------ List */
  "list": {
    status: "ready", react: ["List","ListItem"], css: [".list", ".avatar", ".tag", ".indicator"],
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
          <li><span class="avatar">김</span><div><span class="primary">김민준</span><span class="meta">보안팀 · 관리자</span></div><span class="end"><button type="button" class="btn sm tertiary icon" aria-label="편집">${I("pencil")}</button><button type="button" class="btn sm tertiary icon" aria-label="더 보기">${I("dots")}</button></span></li>
          <li><span class="avatar">이</span><div><span class="primary">이서연</span><span class="meta">인프라팀 · 운영자</span></div><span class="end"><button type="button" class="btn sm tertiary icon" aria-label="편집">${I("pencil")}</button><button type="button" class="btn sm tertiary icon" aria-label="더 보기">${I("dots")}</button></span></li>
        </ul>` },
      { id: "select", title: "Selectable / Dense", desc: "행 클릭 선택(.hover + .on). 밀도 높은 목록은 .dense.", html: `
        <ul class="list hover dense" style="max-width:480px" role="listbox">
          <li role="option"><span class="indicator ok">PC-2041</span><span class="end meta">10.0.4.21</span></li>
          <li role="option" class="on" aria-selected="true"><span class="indicator danger">PC-1187</span><span class="end meta">10.0.4.33</span></li>
          <li role="option"><span class="indicator">PC-0932</span><span class="end meta">오프라인</span></li>
        </ul>` },
    ],
    props: [[".list", "ul", "—", "보더 + radius/lg. li 는 flex row"], [".primary / .meta / .end", "elements", "—", "제목 / 부제 / 우측 영역"], [".hover / li.on", "boolean", "false", "행 hover 배경 / 선택"], [".dense / .plain", "boolean", "false", "행 40 / 보더 없음"]],
    spec: [["Size", "행 최소 56 (dense 40)"], ["Container", "radius/lg · border/default · 행 사이 1px"], ["Label", "제목 Body/2 14 Medium · 부제 Caption 12.5"], ["Placement", "상세 패널 목록, 설정의 항목 목록"]],
    figma: { frame: "List", radius: "radius/lg", sizes: { md: { h: 56 }, dense: { h: 40 } }, variants: { default: {}, media: {}, selectable: {} }, states: ["default", "hover", "selected"] },
    guideline: { do: ["항목마다 같은 구성(제목·부제·액션)을 유지합니다."], dont: ["열이 4개 이상 필요하면 Table 을 씁니다."] },
  },

  /* ------------------------------------------------ Item Tile */
  "item-tile": {
    status: "ready", react: ["Tile","TileGrid"], css: [".tile", ".tile-grid", ".tag"],
    desc: "아이콘·제목·설명으로 항목을 카드 형태로 고르는 타일입니다. 정책 템플릿, 연동 모듈, 보고서 유형 선택에 씁니다.",
    thumb: `<div class="tile-grid" style="width:240px;grid-template-columns:1fr 1fr"><button class="tile on"><span class="ico">U</span><b>USB</b></button><button class="tile"><span class="ico">N</span><b>네트워크</b></button></div>`,
    examples: [
      { id: "grid", title: "Grid", desc: "button.tile 그리드. 선택은 .on + aria-pressed.", html: `
        <div class="tile-grid" style="max-width:760px">
          <button type="button" class="tile on" aria-pressed="true"><span class="ico">${I("shield")}</span><b>USB 제어</b><span>저장장치 차단·읽기 전용</span></button>
          <button type="button" class="tile" aria-pressed="false"><span class="ico">${I("server")}</span><b>네트워크 격리</b><span>감염 의심 단말 격리</span></button>
          <button type="button" class="tile" aria-pressed="false"><span class="ico">${I("list")}</span><b>스크립트 제한</b><span>PowerShell·WSH 실행 제어</span></button>
          <button type="button" class="tile" aria-pressed="false" disabled><span class="ico">${I("chart-bar")}</span><b>SIEM 연동</b><span>Enterprise 전용</span></button>
        </div>` },
      { id: "badge", title: "With Tag", desc: "우상단에 상태·신규 태그.", html: `
        <div class="tile-grid" style="max-width:560px">
          <button type="button" class="tile"><span class="tag accent sm plain">NEW</span><span class="ico">${I("bell")}</span><b>Slack 알림</b><span>채널로 이벤트 전송</span></button>
          <button type="button" class="tile"><span class="tag ok sm">연결됨</span><span class="ico">${I("user")}</span><b>AD 연동</b><span>사용자·그룹 동기화</span></button>
        </div>` },
      { id: "horizontal", title: "Horizontal", desc: "좁은 폭에서는 가로 배치.", html: `
        <div style="display:flex;flex-direction:column;gap:8px;width:100%;max-width:420px">
          <button type="button" class="tile horizontal on" aria-pressed="true"><span class="ico">${I("chart-bar")}</span><div><b>주간 요약</b><span>매주 월요일 발송</span></div></button>
          <button type="button" class="tile horizontal" aria-pressed="false"><span class="ico">${I("list")}</span><div><b>상세 이벤트</b><span>CSV · 최대 10만 행</span></div></button>
        </div>` },
    ],
    props: [[".tile", "button", "—", ".ico + b(제목) + span(설명). aria-pressed"], [".on", "boolean", "false", "선택(accent 보더·배경)"], [".horizontal", "boolean", "false", "가로 배치"], ["disabled", "attribute", "—", "선택 불가"], [".tile-grid", "container", "—", "auto-fill 180px 그리드"]],
    spec: [["Size", "최소 폭 180 · padding 16 · 아이콘 36"], ["Container", "radius/lg 12 · border/default · 선택 accent"], ["Label", "제목 Body/2 14 Semibold · 설명 Caption 12.5"], ["Placement", "마법사의 유형 선택, 연동 목록"]],
    figma: { frame: "Item Tile", radius: "radius/lg", sizes: { md: { minW: 180, pad: 16 } }, variants: { default: { stroke: "--border-default" }, selected: { stroke: "--accent", bg: "--accent-subtle" } }, states: ["default", "hover", "selected", "disabled"] },
    guideline: { do: ["타일마다 아이콘·제목·한 줄 설명을 같은 구성으로."], dont: ["타일 안에 다른 버튼을 넣지 않습니다(타일 전체가 버튼)."] },
  },

  /* ------------------------------------------------ Data Visual */
  "data-visual": {
    status: "ready", react: ["Kpi","KpiGrid","ChartCard","BarChart","Donut","DonutRow","ChartLegend","Sparkline"], css: [".kpi", ".kpi-grid", ".chart", ".chart-card", ".donut", ".donut-row", ".chart-legend", ".sparkline"],
    desc: "대시보드의 수치·추이·비율을 보여줍니다. KPI 카드, 가로 막대, 도넛, 스파크라인을 CSS 만으로 구성하며 색은 심각도 토큰을 그대로 씁니다.",
    thumb: `<div class="kpi compact" style="padding:12px 14px;min-width:120px"><span class="label">Critical</span><span class="value" style="font-size:24px;color:var(--sev-critical)">1,284</span></div>`,
    examples: [
      { id: "kpi", title: "KPI", desc: "라벨 · 값 · 증감. 보안 지표는 증가가 위험(.up 빨강), 감소가 좋음(.down 초록).", html: `
        <div class="kpi-grid" style="max-width:800px">
          <div class="kpi critical"><span class="label">Critical 이벤트</span><span class="value">1,284</span><span class="delta up">${I("arrow-up",12)} 12% 전주 대비</span></div>
          <div class="kpi"><span class="label">차단률</span><span class="value">99.2<small>%</small></span><span class="delta down">${I("arrow-down",12)} 0.3%p</span></div>
          <div class="kpi"><span class="label">연결 에이전트</span><span class="value">1,247<small>/ 1,284</small></span><span class="delta">37대 오프라인</span></div>
          <div class="kpi"><span class="label">미처리 검토</span><span class="value">5</span><span class="delta">24시간 내 처리</span></div>
        </div>` },
      { id: "bar", title: "Bar Chart", desc: "항목별 비교. i 의 width 가 값, 색은 심각도.", html: `
        <div class="chart-card" style="max-width:560px">
          <h3 class="chart-title">유형별 탐지 <span class="t-caption-1" style="color:var(--text-tertiary)">최근 7일</span></h3>
          <div class="chart">
            <div class="row"><span class="lbl">랜섬웨어</span><div class="bar critical"><i style="width:82%"></i></div><span class="num">412</span></div>
            <div class="row"><span class="lbl">악성코드</span><div class="bar high"><i style="width:61%"></i></div><span class="num">306</span></div>
            <div class="row"><span class="lbl">USB 위반</span><div class="bar medium"><i style="width:44%"></i></div><span class="num">221</span></div>
            <div class="row"><span class="lbl">정책 위반</span><div class="bar low"><i style="width:23%"></i></div><span class="num">115</span></div>
          </div>
        </div>` },
      { id: "donut", title: "Donut + Legend", desc: "구성 비율. conic-gradient 로 그리고 중앙 값은 data-label.", html: `
        <div class="chart-card" style="max-width:560px">
          <h3 class="chart-title">심각도 분포</h3>
          <div class="donut-row">
            <div class="donut" role="img" aria-label="Critical 18%, High 27%, Medium 30%, Low 25%" data-label="1,054" style="background:conic-gradient(var(--sev-critical) 0 18%,var(--sev-high) 18% 45%,var(--sev-medium) 45% 75%,var(--sev-low) 75% 100%)"></div>
            <div class="chart-legend" style="flex-direction:column">
              <span><i style="background:var(--sev-critical)"></i>Critical <b>190</b></span>
              <span><i style="background:var(--sev-high)"></i>High <b>285</b></span>
              <span><i style="background:var(--sev-medium)"></i>Medium <b>316</b></span>
              <span><i style="background:var(--sev-low)"></i>Low <b>263</b></span>
            </div>
          </div>
        </div>` },
      { id: "spark", title: "Sparkline", desc: "카드 안 소형 추이. 강조 막대는 .hi.", html: `
        <div class="kpi" style="min-width:260px"><span class="label">일별 탐지</span><span class="value">412</span><div class="sparkline" aria-hidden="true"><i style="height:30%"></i><i style="height:45%"></i><i style="height:38%"></i><i style="height:70%"></i><i style="height:55%"></i><i style="height:90%" class="hi"></i><i style="height:62%"></i></div></div>` },
    ],
    props: [[".kpi", "div", "—", ".label + .value(small 단위) + .delta(.up/.down). .critical/.high 로 값 색"], [".kpi-grid", "container", "—", "auto-fit 180px"], [".chart .row", "row", "—", ".lbl + .bar(i width%) + .num. bar 톤 critical|high|medium|low"], [".donut", "div", "—", "conic-gradient 배경, data-label 중앙 값, role=img aria-label"], [".chart-legend", "div", "—", "i 색 + 라벨 + b 값"], [".sparkline", "div", "—", "i height% 막대, .hi 강조"]],
    spec: [["Size", "KPI 값 Display/2 32 · 막대 12 · 도넛 120"], ["Container", "chart-card = Card 규격"], ["Label", "Caption 12.5 tertiary · 값 tabular"], ["Placement", "대시보드 상단 KPI 4개, 아래 차트 카드 2열"]],
    figma: { frame: "Data Visual", radius: "radius/lg", sizes: { kpi: { pad: 20 }, bar: { h: 12 }, donut: 120 }, variants: { kpi: {}, bar: {}, donut: {}, sparkline: {} }, states: ["default"] },
    guideline: { do: ["심각도 색은 Tag 와 동일한 토큰을 씁니다.", "값에는 단위와 기준 기간을 함께."], dont: ["3D·그라데이션·장식 색을 쓰지 않습니다.", "한 카드에 두 종류 차트를 섞지 않습니다."] },
  },
};

if (typeof module !== "undefined" && module.exports) module.exports = COMPONENTS;
