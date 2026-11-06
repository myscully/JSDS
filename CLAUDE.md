# JS Design System — 함께 일하는 기준

지란지교시큐리티 보안 콘솔용 디자인 시스템입니다. 정적 사이트 + React 패키지 + Figma 라이브러리 셋이
**같은 토큰 하나**를 공유합니다. 현재 **v0.8**.

## 저장소 구조 — 무엇이 원본이고 무엇이 생성물인가

| 경로 | 무엇 |
| --- | --- |
| `_build/` | **원본.** 사이트 생성기. `build.js` 가 전부를 만들고 `verify.js`·`contrast.js` 를 함께 돌립니다 |
| `_build/style.src.css` | **토큰과 컴포넌트 CSS 의 단일 출처.** 사이트·패키지·Figma 가 전부 여기서 나옵니다 |
| `_build/base-tokens.js` | 기준 시스템의 토큰 정의를 코드로 옮긴 대장. `DEVIATIONS`(값을 바꾼 것) · `ADDITIONS`(우리가 더한 것) |
| `_build/ds-chart.src.js` | **원본.** 탐색형 차트(Chart.js) 테마 어댑터 + 프리셋. `assets/ds-chart.js` 로 복사되고 React 는 `_react/scripts/sync-chart.mjs` 가 `src/chart/ds-chart.js`(생성물)로 가져갑니다. Chart.js 본체는 `_build/node_modules` 에서 `assets/vendor/` 로 복사(MIT) |
| `_react/` | **원본.** `@jiran/ds-react` 패키지. `dist/` 는 생성물이라 git 에 없습니다 |
| `_figma/` | **원본.** Figma 작업 도구 — `font.js`(폰트 안전 로더) · `probe.js`(조사) · `audit.mjs`(대조) · `font-revert.md`(Noto 대체 경과 · 되돌릴 노드 · 굵기를 고칠 노드 — 목록은 같은 폴더의 `.tsv` 셋) |
| `assets/` `home/` `foundations/` `components/` `patterns/` `resources/` `index.html` | **전부 생성물.** 직접 고치지 말고 `_build/` 를 고친 뒤 빌드하세요. `assets/vendor/chart.umd.js` · `assets/ds-chart.js` 도 생성물 |

## 일하는 방식

**재면서 일합니다.** 색·크기·대비는 추측하지 않고 **헤드리스 Chromium 으로 잽니다.** "맞을 것이다"로
보고하지 않습니다. 알파가 섞인 색은 반드시 **합성해서** 재야 합니다 — 같은 색의 두 알파를 그냥
비교하면 1.000 이 나옵니다.

**문서가 코드보다 앞서 가지 않게 합니다.** 페이지에 적는 수치·이름·약속은 **세어서** 씁니다.
이 저장소에서 반복해서 난 사고가 전부 이것이었습니다 — "램프 14개"(실제 13), "컴포넌트 30개"(31),
"`summary > svg` 는 16~18 로 고정됩니다"(CSS 에 크기 지정 없음).

**예외는 코드에 선언합니다.** 참조 값을 바꿨으면 `base-tokens.js` 의 `DEVIATIONS`,
우리가 더한 토큰이면 `ADDITIONS`, 대비 기준을 못 넘기는 쌍이면 `contrast.pairs.js` 의 `REF()` 에
**이유와 함께** 적습니다. 주석 없이 넘어가면 다음 사람이 그 값을 마음대로 바꿉니다.

**검사를 새로 짜지 않습니다.** 되풀이되는 검사는 `_figma/probe.js` · `_figma/audit.mjs` ·
`_build/gates.mjs` 에 있습니다. 매번 새로 쓰다가 한 번 틀렸습니다(섹션 *안쪽*만 보고 섹션끼리는
안 봐서 "겹침 0" 이라고 보고).

## 게이트

```bash
node _build/gates.mjs          # build(verify·contrast) + behave + react
node _build/gates.mjs --quick  # 사이트만
```

기준값 — 바뀌면 **왜 바뀌었는지 적습니다.**

```
pages 62 · verify 0/0 · contrast 1110쌍 실패 0 · advisory 446 · behave 446/446 · react 280+3
```

2026-10-28 Button 정의 개편으로 바뀐 것 — contrast +36(Assistive 버튼 라벨 쌍: 반투명 면 2 × 바탕 3 × 맥락 6),
behave +28(State 예제의 고정 Hover · Pressed 가 실제 상태와 같은 색, text assistive 의 세 상태와 방향 · 라이트/다크, Props 표 열 폭 · 태그 형식, loading 이 막는 네 이벤트 · 실제 클릭이 부모로도 안 감 · 이동 키 · 단축키 통과 · Tab 통과 · 포커스 유지, 버튼 · 필드 높이 일치, 면 없는 아이콘 전용, outline primary · 아이콘 전용의
세 상태와 방향, 비활성 6변형, 사이트 팝업의 Tab 가둠 · 닫을 때 포커스 복귀), react +8(Button 클래스 매트릭스 · iconOnly · loading 이벤트 · 이동 키 통과와 캡처 변형 차단 · 해제 후 복귀 · 옛 prop 경고, 예제 148 → 152).

2026-10-29 Accordion 정의 개편으로 바뀐 것 — contrast +36(헤더 Hover 면 위 보조 정보 · 셰브론 쌍: 반투명 면 1 × 바탕 3 × 맥락 6 × 2쌍),
behave +4(헤더 높이 40 · 52 · 60, Hover 면과 고정 Hover 일치, Disabled 는 hover 없음, 약관 체크박스가 펼침과 섞이지 않음),
react +6(variant · size 클래스, 옛 flat prop 경고, 예제 152 → 157 에 따른 구조 비교).

2026-10-29 contrast 검사 수정 — advisory 296 → 404. 쌍 대비를 잴 때 반투명 **글자**의 알파를 버리고 있었다(바탕만 합성).
흰 바탕 위 tertiary(61%)가 실제 3.66 인데 11.71 로 나와, 선언된 예외(REF) 108 쌍이 통과로 보였다. 실패는 0 그대로다
— 기준 아래로 드러난 쌍은 모두 이미 이유와 함께 선언된 예외다.

2026-10-30 Accordion 헤더 정렬 — behave +1. 앞 아이콘이 있으면 제목이 가운데로 뜨던 것(헤더가 space-between)을 왼쪽 정렬 · 셰브론만 오른쪽 끝으로 고치고,
헤더 간격을 12 → 8 로 바꿨다. 검사는 간격 8 · 아이콘 바로 뒤 제목 · 셰브론이 오른쪽 여백에 닿는지를 잰다. Figma audit 도 헤더 간격 · 순서 · 제목 정렬을 대조한다(k24).

2026-10-30 Breadcrumb 정의 개편 — behave +4(모든 예제가 이름 있는 홈 아이콘 18 로 시작 · 마지막은 링크 아닌 현재 하나, 행 높이 24 정확히, Hover 와 고정 Hover 의
색 · 밑줄 일치, 페이지 없는 상위는 링크 아닌 텍스트), react +7(BreadcrumbHome 2 · 링크 없는 상위 1, 예제 157 → 161 에 따른 구조 비교 4).

2026-11-03 Card 정의 개편 — contrast +24(오류 아이콘 negative-strong / 아이콘 면 그래픽 3:1 1쌍 × 바탕 3 × 맥락 6, Disabled 선택 카드 이유 문구 tertiary / disable 면 1 × 맥락 6),
advisory +6(그 이유 문구 쌍 — 라이트 3.53 · 다크 3.28, 사람의 결정으로 선언한 예외), behave +6(선택 카드 고정 Hover = 실제 hover, Disabled 의 disable 토큰 · hover · opacity 없음 · 이유 줄 tertiary, Disabled 는 선택 안 됨,
선택 카드 안 버튼 · 링크 없음, 상태 카드 키-값 열 정렬, 빈 · 오류 카드의 틀 · 다시 시도 — 제목 검사는 Title/1 · Label/1 · compact = sm 대조로 바뀜),
react +5(size · compact 경고, disabled, CardMeta, 예제 161 → 163 에 따른 구조 비교 2). 타이포 Title/1 은 500 → 600(사람의 결정).
같은 날 카드 안 빈 · 오류 아이콘을 칸 없이 36 으로(사람의 결정) — contrast −18(오류 아이콘 / 아이콘 칸 쌍이 쓰이지 않아 지움. 이제 카드 면 위 negative-strong 은 기존 쌍이 잰다),
behave +1(카드 헤더 '전체 보기' 가 텍스트 assistive · 아이콘 칸 없음 · 36 은 빈 · 오류 검사에 더함).

2026-11-03 테두리 없는 카드 — `variant` flat(Card · KPI · Chart Card, 사람의 결정). 보더 색만 지우고(두께 1px 는 남아 outline 과 크기 같음) 그림자는 두지 않는다.
면 색 차이(라이트 1.07 · 다크 1.20)로만 갈리므로 `background/neutral/secondary` 위에서만 쓴다. behave +6(카드 · KPI/Chart Card 의 보더 색 투명 · 두께 1px · 그림자 없음 · outline 과 크기 같음,
둘 다 회색 바탕 위에만 있음, flat 선택 카드의 2px 링, 대시보드 예제 래퍼가 폭을 채워 KPI 한 줄 · 막대 200 이상), react +3(셋의 flat 클래스 · 기본값 클래스 없음 1, 예제 163 → 165 에 따른 구조 비교 2).
면 대비는 글자 쌍이 아니라 contrast 수는 그대로다.

2026-11-03 Data Visual 재정의 — 하이브리드(사람의 결정). 정적 요약(KPI · 스파크라인 · CSS 막대 · 도넛)은 그대로 두고, 축 · 툴팁 · 시계열이 필요한 **탐색형 차트는 Chart.js(MIT, 4.6.1 고정)** 위에
토큰을 입혀 그린다 — 테마 어댑터 `ds-chart.src.js`(theme · presets 4종 timeseries · bar · donut · mixed · mount · auto) 하나를 사이트 · 순수 JS · React(`@jiran/ds-react/chart`, chart.js 는 optional peer)가 같이 쓴다.
**다른 차트 라이브러리 는 쓰지 않는다** — 코어가 이중 라이선스라 연 매출 200만 달러 이상 조직은 개발자당 유료 Commercial 이고 7.x 는 일부가 Premium 워터마크다.
차트 토큰 10개(`--chart-series-1~6` · grid · axis-text · tooltip 면 · 글자)를 트리 밖에 더했다(ADDITIONS). 계열 6색은 제품색과 무관한 고정 램프이고 상태색과 같은 단계를 피했으며,
dataviz 검증기(색각 분리 · 명도 띠 · 3:1)를 라이트(흰 · 회색 바탕) · 다크(카드 · 페이지 바탕) 각각 통과한 단계다 — 결과는 `style.src.css` 주석.
contrast +132(계열 6 × 바탕 3 × 맥락 6 = 108, 축 글자 18, 툴팁 6), advisory +18(축 글자 = foreground/neutral/tertiary 참조라 글자 쌍과 같은 REF),
behave +6(5개 canvas 가 실제로 그려지고 높이 240 · 접근 이름, 계열 · 격자 · 축 색 = 토큰 계산값, 범례는 2계열 이상 · y 축 하나 · 선 2 · hover 점 8 · 막대 반경 4,
다크 전환 때 다시 칠함, 누적 막대 세그먼트 사이 면 색 픽셀, 대시보드 추이 canvas + 도넛 비율 라벨) · Colors 시멘틱 절 27 → 28(Chart), react +7(프리셋 4 · ChartCanvas mount/destroy · 단일 계열 범례 · config 변경 재생성 · mountChart) +4 예제(165 → 169).
verify 는 `canvas[data-chart]` 의 role=img · aria-label · data-spec JSON · 계열 ≤ 6 · ds-chart.js 동반을 본다. 예제 HTML 에 `<script>` 는 여전히 금지 — 차트는 `data-spec` 으로 자동 mount.
2026-11-04 Figma 대조(k33)에서 발견 — `paint()` 가 기본 옵션으로 프리셋 옵션을 덮어 막대의 `autoSkip:false` 가 사라졌다(5개 라벨 중 3개만). 프리셋 · 사용자 옵션을 생성 전에 떠 두었다가 기본 위에 다시 얹는다. behave +1(막대 두 차트의 눈금 수 = 라벨 수).
2026-11-05 도넛 가운데 합계 700 → 600 — Title/1(16/600/24)에 묶음(사람의 결정). CSS `.donut::after` · ds-chart centerPlugin 둘 다. 게이트 수는 그대로. Figma 는 k34 에서 가운데 글 4개를 Title/1 에 묶고 audit 이 CSS 에서 기대값을 읽어 스타일 · 가로 가운데를 대조한다.

2026-11-05 taste-skill 규칙 옮김 — pages +1(Foundations › Writing), behave +12(`behave.system.js`: 모션 3 · 한 시스템 6 · 패턴 정렬 3), verify 검사 2묶음(모션 · 문구).
taste-skill(github.com/Leonxlnx/taste-skill, MIT, 2.5.0)은 **설치하지 않고** 콘솔에 맞는 규칙만 옮겼다(사람의 결정). 출처는 각 검사 주석에 있다.
- **가져온 것:** transition 은 `--motion-*` 토큰 하나씩만 · 반복 애니메이션은 상태 표시 셋(스피너 0.8s · Skeleton 1.4s · 맥박 1.6s, verify `LOOPS`) · 줄인 모션은 가상 요소까지 멈춤 · hover/누름은 색으로만(버튼 · 카드에 transform 없음 — 사람의 결정), 패턴의 반경 = 토큰 · `.btn` 클래스 = Button 정의 · 카드 · 폼 · 대화상자당 solid primary 하나 · 카드 중첩 2단 · 본문 링크 모양 하나, 쌓인 블록의 같은 왼쪽 선(또는 가운데 선) · 한 줄 카드의 같은 위 끝 · 높이 · 미리보기 밖 넘침 없음(1440 · 1024 · 768), 문구 규칙(Writing 페이지 = verify `BANNED_LABELS` · 자리 표시 글).
- **가져오지 않은 것과 이유:** 팔레트 · 글꼴 무작위 배정(단일 출처 토큰 · 제품 색 주입 · Pretendard 와 충돌), 보라 금지(차트 계열 4번 violet — dataviz 검증 통과 값), 아코디언 금지(Accordion 컴포넌트), 13px 미만 금지 · 버튼 44 · 본문 16(밀도 높은 콘솔 — 12px 규칙 90곳 · 버튼 40 · 본문 14), 버튼 누름 · 카드 뜨기, 사진 · 셰이더 효과 · 한 섹션 한 화면(마케팅 페이지용).
- **측정에서 드러나 고친 것:** reduced-motion 규칙이 `::before`/`::after` 를 빼 로딩 스피너 · Indicator 맥박 · 셰브론이 계속 움직였다. `var(--motion-slow) ease`(이징 둘)로 Colors 페이지 막대 전환 두 곳이 선언째 무효였다. 토큰 밖 transition 3곳(사이트 셸 `.15s` · `.12s`). Chart.js 캔버스의 첫 폭 300 이 그리드 열 최소 폭이 되어 대시보드가 768 에서 24px 넘쳤다(`.chart-canvas{contain:inline-size}`). Motion 절의 토큰 용도 표가 실제 소비자와 달랐다(`--motion-slow` 의 컴포넌트 소비자 0). Notification 배너 '자세히' → '점검 안내 보기'(사이트 · React).

2026-11-05 Data Visual 손보기(사람의 요청 여섯) — contrast +36 · advisory +18 · behave +7 · react 수 그대로(기존 단정을 고침).
- **막대는 전부 각지게 · stroke 없음**(사람의 결정 — 정적 Bar Chart · 트랙 · 스파크라인 · Chart.js bar · mixed 막대). 누적 막대의 세그먼트 사이는 **바탕색 stroke 가 아니라 투명 틈 2px** —
  i>0 세그먼트의 시작 쪽 모서리에만 투명 border 2(`{bottom:2}` · 가로면 `{left:2}`) · `inflateAmount:0`. Chart.js 의 `inflateRect` 는 border 가 있는 모서리만 움직여서 음수 `inflateAmount` 로는 틈이 생기지 않는다(실측).
- **정적 도넛 경계** — conic 각도 띠는 바깥으로 넓어지는 쐐기(바깥 ≈4.5 · 안 3px)라 깨져 보였다. 조각은 이어 붙이고 경계마다 `<i style="--a:…deg">`(폭 2 · 높이 = 링 20 · 면 색)를 중심 기준으로 돌린다 — 탐색형 도넛과 같은 일정한 2px. verify 가 `.donut` 안 구분선 2개 이상을 본다. React `Donut` 이 각도를 계산해 그린다.
- **비교 기간은 톤으로**(사람의 결정 '또렷한 톤 차이') — 이번 주 = 계열 1, 지난 주 = `--chart-series-1-subtle`(라이트 blue-80 · 다크 blue-30, 바탕 대비 1.77 · 1.64 라 advisory 로 선언). Mixed 의 선 = `--chart-series-1-strong`(라이트 blue-30 · 다크 blue-80, 사람의 결정 '막대와 같은 파랑 진한 톤'). 차트 토큰 10 → 12.
- **범례 · 툴팁 마커는 원형** — Chart.js 범례 원 지름은 boxHeight × √2 라 7(→ 10)로 정적 범례 10 과 맞췄다. 툴팁 원은 다른 식(min(boxWidth, boxHeight))이라 6 그대로 지름 6.
- KPI 예제에서 '미처리 검토' 카드를 뺐다(사이트 · React). **대시보드 패턴의 KPI 넷은 요청 밖이라 그대로.**
- verify 의 파일 순회가 `.claude/worktrees` 사본까지 읽어 실패를 냈다 — 점으로 시작하는 폴더는 건너뛴다.

2026-11-06 텍스트 스타일 14 → 16(사람의 결정) — KPI 단위 · 증감이 어느 텍스트 스타일과도 맞지 않아 Figma 에서 Noto 로 남던 것을 스타일로 묶었다.
`Title 1 Medium`(.t-title-1-medium 16/24/500 · Title 1 과 굵기만 다름) = `.kpi .value small`, `Label 2 SemiBold`(.t-label-2-semibold 12/16/600) = `.kpi .delta`.
종전엔 단위가 값의 행간 1.2 · 자간 -0.02em 을, 증감이 카드 행간 1.6(19.2)을 물려받았다 — 증감 줄이 16 이 되어 증감 있는 KPI 카드가 3.2 낮아졌다(126.8 → 123.6). behave +1(단위 · 증감 = 두 스타일 계산값).

2026-11-06 누적 막대 틈 제거 · 옆 범례 자리 규칙(사람의 요청) — behave +3 · react +3(규칙 2 · 예제 169 → 170).
- 누적 세그먼트는 **틈 없이** 붙는다(2px 투명 틈을 지움, borderWidth 0 · inflateAmount 기본 auto 라 실금 없음). behave 의 틈 검사는 '빈 픽셀 0' 으로 뒤집었다.
- **옆 범례는 자리가 좁고 세로로 길면 아래로.** 탐색형 도넛 `legend:"right"` 는 캔버스 폭 < 높이 × 1.5(240 이면 360 미만)에서 bottom — mount 때와 Chart.js `onResize` 때마다 판정(`DSChart.legendPosition`).
  정적 `.donut-row` 는 `flex-wrap` — 한 줄에 안 들어가면 범례가 도넛 아래(줄 사이 16). 측정에서 드러난 것: 줄바꿈이 없던 행의 최소 폭(230)이 대시보드 `.row-3`(2fr 1fr)의 오른쪽 칸을 278 로 억지로 넓히고 있었다 —
  이제 칸이 제 몫 247 로 돌아가 1440 대시보드에서도 '심각도 분포' 범례가 도넛 아래로 간다(추이 카드는 495).
- '좁은 자리' 예제 `donut-narrow`(사람의 결정 — 사이트 · React · Figma): 같은 spec 을 폭 300 카드에 — 캔버스 250×240 이라 범례 아래, 같은 캔버스에서 옆 범례일 때보다 도넛이 크다(behave 가 잼). Figma 대시보드 두 카드는 사이트처럼 2fr 1fr(사람의 결정).
- 지난번에 놓친 문구: Bar 예제 설명의 '막대 끝 4px 둥글림 · 2px 면 색 틈' 을 고쳤다.

`advisory 446` 은 기준 시스템 값을 따르느라, 또는 사람이 결정한 표현(예: 진한 빨강 Count 배지의 다크 흰 숫자) 때문에
우리 기준을 못 넘는 쌍입니다 — **실패가 아니라 선언된 예외**이고 `contrast.pairs.js` 에 이유가 적혀 있습니다.

## 토큰 체계 (v0.8)

- **Atomic** `--{램프}-{단계}` — 램프 13개, **숫자가 클수록 밝습니다**. 컴포넌트에서 직접 쓰지 않습니다.
- **Semantic** `--{그룹}-{하위}-{이름}` — `foreground` · `background` · `surface` · `line` · `effect` · `static`
  여섯 그룹 **79개**(참조 75 + 더한 4) + 트리 밖 15개(`--brand-label` · `--company-mark` · `--company-mark-subtle` · 탐색형 차트 `--chart-*` 12) = **94**.
- **차트 토큰** `--chart-series-1~6`(순서 고정 · 제품색과 무관) · `--chart-series-1-subtle`(비교 기간 막대) · `--chart-series-1-strong`(막대 위 선) · `--chart-grid-primary` · `--chart-axis-text` · `--chart-tooltip-surface` · `--chart-tooltip-text` 는
  CSS 가 아니라 `ds-chart.js` 가 계산값으로 읽어 캔버스에 칠합니다(소비자 0 허용 목록 `grammarOnly`). 심각도 계열은 negative · cautionary · accent-cyan · inactive 토큰 그대로.
- **제품 색**은 `--prod-40~60` 다섯 단계로 주입되고 `brand` 계열이 따라옵니다.
  **제품 색 위의 흰 글자가 4.5 를 넘어야 하고 빌드가 검사합니다**(`verify.js`).
- 비활성은 `--surface-disable-primary` · `--foreground-disable-primary` 로 칠합니다. `opacity` 로
  흐리게 하지 않습니다.

## Figma

파일 `ngyAZOP9Icjzw9KWyl4RdV`. 현재 쓰는 페이지는 `Overview` · `1 Theme` · `2 Element` ·
`3 Component` · `4 Pattern` · `Resource` 이고, 구분선 아래 v0.3 페이지들은 아카이브입니다.

- `use_figma` 를 부르기 **전에 `/figma-use` 스킬을 반드시 불러옵니다.**
- 텍스트를 만들거나 고칠 때는 `_figma/font.js` 의 `makeFont()` 만 씁니다.
- 조사는 `_figma/probe.js` 를 붙여 넣고, 결과를 `node _figma/audit.mjs diff <덤프>` 로 대조합니다.
- **값이 다르면 저장소를 따릅니다.** 사이트가 틀린 경우에만 반대로 가고, 그때는 왜 그런지 밝힙니다.

### 텍스트 편집 — Pretendard 없이 하는 법과 주의점

**에이전트가 쓰는 Figma 플러그인 환경에는 Pretendard 가 없습니다**(보이는 1,938 패밀리 중 0건).
2026-10-22 에 텍스트 스타일 14단계(지금 16)를 `Noto Sans KR` 로 대체해 저장소 값(크기·행간·자간)으로 교정했고,
**같은 날 사람이 데스크톱에서 직접 Pretendard 로 되돌렸습니다**(교정값은 유지). 그래서 스타일은 Pretendard 이고 Pretendard 글자를
그대로 고칠 수는 없습니다(`audit.mjs` 의 NOTE 가 실제 상태를 알려 줍니다).

**우회(2026-11-03 k29 에서 확인):** `makeFont()` 로 글자를 Noto 로 쓴 뒤 원래 텍스트 스타일에 다시 연결하면
(`setTextStyleIdAsync`) 노드가 Pretendard + 스타일 연결 상태가 되어 **글자 수정 · 스타일 연결이 됩니다.** 주의:
- 글리프가 없어 **글 상자가 다시 배치되지 않습니다** — 높이가 옛 값으로 남고(Label/1 인데 24), 인스턴스는 옛 글자를 그린 채 남습니다("버튼").
  스타일만 바꾸지 말고 Noto 로 크기 · 행간을 먼저 주어 배치시킨 뒤 스타일에 묶고, **높이 · 스크린샷으로 확인합니다.**
- 대응하는 텍스트 스타일이 없는 글자(예: 14px Bold)는 Noto 로 남습니다 — `_figma/font-revert.md` · `.tsv` 에 기록하고 사람이 데스크톱에서 되돌립니다.
- 이렇게 고친 글자도 데스크톱에서 열 때 높이 · 줄바꿈을 한 번 봅니다.

## 보고하는 법

- 끝났다고 말하려면 **그 출력이 있어야** 합니다. 기억에서 숫자를 쓰지 않습니다.
- **못 한 것과 이유를 반드시 적습니다.** 범위를 줄이는 것은 사람의 몫이지 에이전트의 몫이 아닙니다.
- 덜어낸 것이 있으면 무엇이 사라졌는지 적습니다(예: 설명을 줄이며 규칙의 근거가 사이트에서 없어짐).
