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
| `_figma/` | **원본.** Figma 작업 도구 — `font.js`(폰트 안전 로더) · `probe.js`(조사) · `audit.mjs`(대조) · `dumps/baseline.json`(audit 기준 덤프) · `font-revert.md`(Noto 대체 경과 · 되돌릴 노드 · 굵기를 고칠 노드 — 목록은 같은 폴더의 `.tsv` 셋) |
| `assets/` `home/` `foundations/` `components/` `patterns/` `resources/` `index.html` | **전부 생성물.** 직접 고치지 말고 `_build/` 를 고친 뒤 빌드하세요. `assets/vendor/chart.umd.js` · `assets/ds-chart.js` 도 생성물 |
| `assets/vendor/dayjs.min.js` · `dayjs.utc.js` · `dayjs.timezone.js` · `dayjs.LICENSE` | **생성물.** Date Picker 기준 시간대용 dayjs(MIT, 1.11.13 고정)를 `build.js` 가 `_build/node_modules/dayjs` 에서 복사하고 Date Picker 가 있는 페이지에만 붙입니다(`verify.js` 가 동반 · 부재를 봄). React 는 패키지 dependency 로 `date-picker/tz.ts` 에서 extend |

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
node _build/gates.mjs          # build(verify·contrast) + behave + react + tsc
node _build/gates.mjs --quick  # 사이트만
```

기준값 — 바뀌면 **왜 바뀌었는지 적습니다.**

```
pages 64 · verify 0/0 · contrast 1218쌍 실패 0 · advisory 455 · behave 640/640 · react 374+3 · tsc 0
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

2026-11-06 패키지 CSS `.ds-root a{color:inherit}` → `:where(.ds-root) a{color:inherit}` — 게이트 수는 그대로(패키지 전용 규칙이라 사이트 게이트 밖).
우선순위 0,1,1 이 `.btn:where(.solid.primary)`(0,1,0)를 이겨 `Button as="a"` 의 글자가 면과 같은 색이었다(주 버튼 대비 1.05 — 홈페이지 관리자 앱 측정에서 발견). 링크 269개 조합을 전후로 재면 라이트 20 · 다크 16 이 바뀌고 전부 같은 클래스의 `<button>` 색과 같아졌다. `sync-css.mjs` 가 옛 규칙이 돌아오면 빌드를 막는다.

2026-11-09 심각도 5단계(사람의 요청 · 결정) — Critical · High · **Medium · Low** · **Info**. 4단계의 Medium 청록 자리를 두 색이 대신하고 옛 Low 의 회색은 Info 가 됐다.
점 · 막대 · 밴드 · 도넛 · 차트 = negative · cautionary · **`--surface-accent-lime-opaque`**(요청한 토큰) · **`--foreground-accent-light-blue`** · inactive, 태그 틴트 = 각 accent 12% 틴트 · solid 테두리 = `--line-accent-*`.
마크업 이름 `medium` · `low` 는 그대로(색만 바뀜)이고 `info`(심각도) · `pending`(상태 톤 '검토 대기', 옛 Medium 의 청록 — 심각도와 클래스를 나눠 쓰지 않게) 가 새로 생겼다.
로그 레벨은 CRIT · HIGH · WARN · LOW · INFO = critical · high · medium · low · info. 예제 수치는 합계 1,054 를 지켜 옛 Medium 316 을 196 · 120 으로 나눴다(사이트 · React 같은 값).
`STATUS_HUES` 에 라임 95 · 라이트 블루 199 를 더했다(제품 색이 심각도 색조와 겹치면 중립 — 지금 제품 셋은 새 각도와 겹치지 않음).
- **선언한 예외:** Medium 지표 라이트 lime-50 이 흰 바탕 2.03 · 회색 1.90(3:1 미달, High 주황 2.24 와 같은 처지) — `REF`, advisory +9(바탕 3 × 라이트 맥락 3).
- **측정에서 드러난 것(사람의 결정으로 유지):** dataviz 검증기 `--pairs all` 로 Medium 라임 ↔ High 주황이 적록 색각에서 라이트 ΔE 2.2 · 다크 0.3 — 사실상 같은 색이다(옛 4단계의 최악 쌍은 10.5).
  등급 라벨 병기(verify) · 고정 순서 · 조각 사이 구분선이 대신 갈라 준다. 결과는 `contrast.pairs.js` 의 `severityRanks` 주석.
- contrast +90(태그 라벨 / Medium · Low · Pending 틴트 54 = 틴트 3 × 합성 바탕 3 × 맥락 6, Medium · Low 지표 3:1 36), behave +22(Tag 단정이 info · pending 까지 16, pending ≠ 심각도 점 2,
  '검토 대기' = pending 1, 로그 레벨 → 다섯 등급 1, 막대 · 범례 · 밴드 · 행 막대 · 정적 도넛 · 차트 톤이 기대 토큰과 같음 라이트 · 다크 2 — 도넛 조각 · 구분선 수 4 → 5 는 기존 단정을 고침), react +2(Donut 다섯 토큰 순서 · Tag info/pending 클래스).

2026-11-09 심각도 Critical · Medium 톤(사람의 요청) — Critical 점 · 지표 = `--foreground-negative-strong`(라이트 red-40 4.58 · 다크 red-50), Medium = `--foreground-accent-lime`,
그 토큰의 라이트 값 lime-37 → **lime-40**(`DEVIATIONS` — 흰 바탕 3.43 → 2.90, 다크 lime-50 · `line-accent-lime` 은 그대로). 태그 점 · 막대 · 범례 · 밴드 · 행 막대 · 정적 도넛 · ds-chart TONES · React 같이.
contrast +18(Critical 지표 negative-strong 3:1 쌍이 새로 — negative-primary 3:1 쌍은 danger 점 · 진행 막대 지표로 남김), advisory 그대로(Medium 3:1 미달 9건이 lime-opaque → accent-lime 2.90 · 회색 2.70 으로 바뀜).
색각 분리 최악 쌍 Medium ↔ High 는 라이트 protan ΔE 0.3 · 다크 4.4(`severityRanks` 주석). `--surface-accent-lime-opaque` 는 소비자 0 이라 `grammarOnly` 로 돌아갔다. Figma 미반영 81건(기준 덤프 audit).

2026-11-09 Date Picker 정리(사람의 요청 14가지) — behave 468 → 479(Date Picker 단정 63 → 74, 다시 씀) · react 282 → 293(DatePicker.test 27 → 36, 예제 170 → 172 에 따른 구조 비교 2).
contrast · advisory · verify 수는 그대로(verify 는 dayjs 동반 검사를 더했지만 실패 0).
- **필드는 TextField 입력 하나** — 버튼형 `.field-btn` 과 `allowTyping` · `triggerStyle` · `displayText` 를 없앴다(React 옛 prop · `mode` 는 경고하고 새 방식으로). 숫자를 치면 `YYYY. MM. DD`(unit month `YYYY. MM` · year `YYYY`)로 끊고,
  ↑↓ 는 커서가 놓인 조각 ±1 이며 min/max 를 보지 않는다. 형식은 locale 과 무관하게 고정(사람의 결정).
- **값은 늘 유효하지 않다** — validity 일곱(empty · incomplete · invalid · min · max · order · valid). 덜 친 · 없는 날짜는 Invalid Date, 범위 밖 · 뒤집힌 기간은 그 날짜를 남기고 오류로 알린다.
  달력 칸은 지금처럼 범위 밖을 고를 수 없다. 사이트 `data-validity` · `ds:date {value, start, end, date, text, validity}`, React `onChange(value, {text, validity})`.
- **기간** = React `DateRangePicker`(사이트 `data-range`) — 달력 둘이 기본, 767 이하 · `calendars={1}`(`data-calendars="1"`)이면 하나. 월 · 연 단위 기간은 패널 하나.
- **locale**(기본 ko-KR) — 제목 · 요일 · 월 이름 · 날짜 칸 이름 · '오늘'(RelativeTimeFormat)을 Intl 로. Intl 에 없는 문구(적용 · 취소 …)는 React `labels`, 사이트는 한국어 그대로(범위 밖). 주 시작은 일요일 고정.
- **timezone** — dayjs(MIT, 1.11.13 고정) + utc · timezone 플러그인. 시간대는 '오늘' 과 내보내는 순간(그 시간대의 0시)만 정하고, 달력은 달력 날짜로 일한다. 틀린 이름은 경고하고 환경 시간대로.
- **같은 날 달력 모양(사람의 요청)** — 선택 날짜는 지름 34 원(`.day.on::before`), 기간 양끝은 칸 반쪽에만 띠(`.start` · `.end` 가 미리보기 끝에도 붙는다). 달력 패딩 12 → 20 · 글자 12 → 13 · 제목 16.
  두 달 폭 590 → 606. 연 · 월 칸의 선택은 둥근 사각형 그대로(사람의 결정).
- **측정에서 드러나 고친 것:** 날짜 파서가 구분자를 생략 가능하게 받아 덜 친 "2026. 11" 을 2026-01-01 로 읽었다(사이트 · React) — 구분자를 요구하거나 자리를 다 붙여 쓴 것만 받고, 자릿수가 모자라면 미완성.
  '오늘' 을 누르면 달력을 다시 그리며 생긴 focusout 이 빈 글자로 초안을 지웠다. React 에서 값과 open 을 함께 바꾸면 옛 값의 달을 열었다(값 동기화를 layout effect 로 앞당김). render.js 의 ds.js 크기 52KB → 69KB.
- 음성 시험 2건(범위 밖 입력 거부로 되돌림 · 기간 기본 달력 1) 모두 behave · react rc=1. Figma 미반영 90건(81 + Date Picker 9 — 스펙 4행 · Type=Button 18변형 한 줄 · 날짜 칸 모서리 4).

2026-11-09 Date Picker 남은 것(사람의 결정 셋) — behave 479 → 481 · react 293 → 294 · 게이트에 tsc 를 더함(0).
- **기간의 쪽마다 상태** — React `info.sides` · 사이트 `ds:date` 의 `sides` = `{start, end}`(empty · incomplete · invalid · min · max · valid). 순서(order)는 두 쪽 사이의 일이라 `validity` 에만.
  계획에 있었는데 첫 커밋에서 빠뜨린 것이다. behave +1(비운 끝 empty · 오늘 넘은 끝 max) · react +1.
- **사이트 `data-labels`**(JSON) — Intl 이 만들지 못하는 문구(적용 · 취소 · 초기화 · 이전/다음 달 · 연도 선택 · 최근 {n}일 …). 키는 React `labels` 와 같고 `recent` 를 더했다.
  정적 `cal()` 도 같은 문구를 쓴다(behave 대조). Locale 예제(en-US · ja-JP)가 이것을 쓴다(사이트 · React). 오류 문구는 바꾸지 않는다(범위 밖). behave +1. 주 시작은 일요일 고정(사람의 결정).
- **tsc 오류 7건** — `ChartLike` 의 생성자 매개변수 `config: object` · `update(mode?: string)` 가 Chart.js 의 타입보다 넓어(매개변수는 반대 방향으로 대조) 문서대로 쓴
  `<ChartCanvas chart={Chart}>` 가 타입 오류였다(0dddd96 부터, vitest 는 타입을 안 봐서 게이트를 통과). `config: never` · mode 를 UpdateMode 의 일부로. `gates.mjs` 가 tsc 를 돌린다 — 옛 타입으로 되돌리면 rc=2.
- render.js 의 ds.js 크기 69KB → 71KB. Figma 미반영 90건(그대로).

2026-11-09 Date Picker 오류 문구(사람의 결정 다섯) — behave 481 → 484 · react 294 → 297. contrast · verify 수는 그대로.
- **Writing 규칙대로** — 무엇이 일어났는지 + 고치는 법, 범위는 '부터 · 까지'(그 날짜 포함 — '이후 · 이전' 은 포함인지 모호했다).
  incomplete "{subject} 덜 입력됐습니다. {example} 처럼 끝까지 입력하세요." · invalid "{subject} 달력에 없습니다. 달력에서 고르거나 {example} 처럼 입력하세요."
  · min/max "{subject} 범위를 벗어났습니다. {min} 부터 / {max} 까지 입력할 수 있습니다." · order "종료일이 시작일보다 빠릅니다. 시작일과 같거나 늦은 날짜로 바꾸세요."
- **템플릿** — 날짜 + 꼬리말로 이어 붙이던 방식은 어순이 다른 언어를 못 썼다. 자리표시 `{subject}` `{example}` `{min}` `{max}`, 자리표시가 없는 옛 문자열은 예전 조합(10-27 부터의 `messages` 가 깨지지 않게).
- **기간은 틀린 쪽 이름** — 한쪽만 걸리면 `startSubject` "시작일이" · `endSubject` "종료일이", 둘 다면 `subject` "날짜가" · 예시도 A ~ B. 쪽은 `sides` 로 고른다.
- **사이트 `data-messages`**(JSON — React `messages` 와 같은 키 · 같은 기본값). 다른 언어 기본 문구는 두지 않는다(제품이 넣는다). `data-labels` 행의 '오류 문구는 바꾸지 않는다' 를 지웠다.
- behave +2(기간 문구가 틀린 쪽 이름 · 둘 다면 '날짜가', data-messages 영어 어순 · 틀린 JSON 경고 후 기본 문구) — 기존 문구 단정 5곳은 새 문구로. react +3(기본 문구 · 기간 쪽 · 자리표시 영어 · 옛 형식은 기존 일곱 상태 검사가 그대로 잼, messages 일부 override).
  음성 시험: 쪽 이름 고르기를 끄면 behave 482/483 · react 4건 실패.
- **측정에서 드러난 것 — 오류 문구가 필드를 넓혔다.** 폭이 정해지지 않은 자리(예제의 flex 행)에서 `.field` 폭은 도움말 글자 폭까지 늘어나, 새 문구로 260 필드가 321 · 300 · 354 가 됐다(입력해 오류가 나는 순간에도).
  `.field .help{contain:inline-size}` 로 도움말 · 오류 문구가 필드 폭에서 줄바꿈한다(사람의 결정 — Text Field 도 같은 규칙). 끊는 자리는 띄어쓰기(`.keep-all` 과 같은 `word-break:keep-all`) — 없으면 '입 / 력하세요' 로 낱말 가운데서 끊겼다. 사이트 전체 47개 필드를 전후로 재면 바뀐 것은 그 셋뿐이다.
  behave +1(오류가 나도 폭 260 · 문구 두 줄) — `contain` 을 지우면 rc=1.

2026-11-09 Date Picker 달력 · 열린 필드 링(사람의 요청 다섯 · 결정 셋) — behave 484 → 490. contrast · react 수는 그대로(쌍은 설명만 넓힘).
- **칸의 면은 전부 원** — hover · 누름 · 오늘 · 선택 · 키보드 포커스를 `.day::before`(지름 34)에. 칸 자체는 각지고 면이 없다(기간 띠만 칸 전체 — 이어져야 해서). 연 · 월 칸은 둥근 사각형 그대로(앞선 결정).
- **오늘 원** `--surface-brand-subtle-strong`. 글자는 굵은 `--foreground-neutral-primary` — brand 글자는 다크 달력 면 위 원에서 3.87 이라(사람의 결정). 원이 띠와 같은 색이라 **띠 안의 오늘만 brand 글자**(그 쌍은 기존 REF).
  오늘 hover 는 회색 원이 아니라 오늘 원 + 1px `--line-brand-primary` 안쪽 선(띠 hover 와 같은 방식, 사람의 결정).
- **기간 미리보기 끝 = 시작과 같은 brand 원**(전에는 띠 색 원 + brand 테두리). `.cal-head` 아래 패딩 8 → 16.
- **열린 필드 링** — `.datepicker.open .affix` · `.dropdown.open .trigger` 에 입력 포커스와 같은 링(brand 1px + 후광 4px, 오류 Date Picker 는 빨강). 아이콘 · 마우스로 열면 `:focus-visible` 이 없어 링이 없거나 테두리만 남았다.
  필드 안 버튼(달력 아이콘 · 검색 지우기)에 Tab 으로만 오면 버튼 외곽선만 — 10-26 결정 유지(사람의 결정).
- behave +6(미리보기 끝 = 시작 원, 헤더 패딩, hover · 누름 · 오늘 · 포커스 원, 띠 안 오늘 brand 글자, 오류 필드를 열어도 빨강 링, 열린 Date Picker · Select 링 = 입력 포커스 링). 열린 링 규칙을 지우면 489/490.
  측정에서 드러난 것: 기존 `toTop()` 의 부드러운 스크롤 도중에 누르면 칸이 포인터 밑에서 빠져 `:active` 가 안 걸린다 — 단정은 스크롤이 끝난 뒤 누른다.
- audit: 날짜 칸 기대값을 원으로(모서리 17 · 오늘 원 · 미리보기 끝 brand · 포커스는 `::before` 외곽선), Date Picker Open 에 후광. Select Open · 헤더 패딩은 Figma 쪽 대조가 없다. Figma 미반영 90 → 107건.
- 덤으로 고친 문서: props 표 `data-validity` 가 '유효하거나 비어 있으면 없다' 였는데 ds.js 는 늘 적는다(앞 커밋에서 바꿈) — 값 목록에 empty · valid 를 더했다. render.js 의 ds.js 크기 71KB → 73KB. Figma 미반영 90건(그대로).

2026-11-09 공통 정책 · 컴포넌트 페이지 틀(`_policy/component-policy-plan.md` 0단계) — pages 62 → 63(Foundations › Interaction), behave 490 → 496 · react 297 → 299(약관 동의 — 아래). 약관 동의 말고는 컴포넌트 동작을 바꾸지 않았다.
- **Interaction** — 비활성 · 입력 오류 · 오버레이 · 알림 고르기 · 위험 동작 · 넘침 · 로딩 · 선택 컴포넌트 경계. 규칙마다 '지금' 칸(적용 · 아직 · 제품)을 둔다 — 컴포넌트를 정비해 동작이 바뀌면 그 줄을 고친다. Writing 에 Sentence endings(합니다체).
- **컴포넌트 페이지 구성(사람의 결정)** — 정의 · 원칙 표 · 예제 · Placement · Spec · Props · Usage. 컴포넌트별 규칙은 `principles`(정의 바로 아래, 패턴 페이지와 같은 형식)에 모은다. Usage · Anatomy · Behavior · Content · Accessibility · Do/Don't 새 절은 만들지 않는다. `principles` 를 가진 컴포넌트는 아직 0 개다.
- **Placement · Spec 공개** — `spec` 은 `components.json` 에만 있어 값이 낡아도 드러나지 않았다. 헤드리스로 재서 코드와 다른 값을 고쳤다: Dropdown · Select 항목 36 → 38.4, Popup 배경 65% → 라이트 52 · 다크 74, Notice 최소 높이 56 · Banner 높이 44 · List 행 최소 56 → 실제 padding(그런 최소 높이가 없다), Select Button outline 36 → 38 · 면 strong → secondary, Tab sm 38 → 37.2, Button '화면당 하나' → 카드 · 폼 · 대화상자당(검사 기준), '동사로 시작' → Writing, Data Table '10열 이하' · Breadcrumb '드로어'(없는 기능) 삭제.
- **verify 검사 더함** — 모든 컴포넌트의 Placement · Spec · Props · Usage 절, 예제의 해요체 · 버튼/링크/라벨/표 머리글의 마침표 · 처음부터 비활성인 패턴 주 버튼 · 비활성 요소의 Tooltip. 음성 시험으로 실패가 나는 것을 확인했다.
- **측정에서 드러난 것:** 약관 동의의 '다음' 은 필수 미동의 때 ds.js 가 껐다(정적 검사로는 안 보임). 안내 목록은 완전한 문장이라 마침표가 있다(유의사항 8줄) — 마침표 규칙에서 뺐다.
- **약관 동의 '다음' 은 늘 켠다(사람의 결정).** 필수를 비운 채 누르면 막고 `.terms > .msg`(aria-live=polite)에 남은 개수, 첫 항목으로 포커스, 비운 항목에 aria-invalid. 체크하면 바로 줄이고 다 고치면 지운다. 버튼에 달린 제품 핸들러까지 가지 않게 캡처에서 막는다(disabled 때 클릭이 안 가던 약속). React 는 `TermsMessage` 를 더하고 예제가 같은 동작을 한다. behave +6(옛 단정 '비활성' 을 바꾸고 안내 없음 · 개수 · 포커스 · 제품 핸들러 차단 · 줄어듦 · 지움 · 다 체크하면 핸들러 도달), react +2(`tests/terms.test.tsx`). 음성 시험: 캡처 차단과 다시 세기를 지우면 behave 3건 실패.

2026-11-09 Text Field 정비(사람의 결정 넷) — behave 496 → 514 · react 299 → 311(`tests/form-validation.test.tsx` 10 · 예제 172 → 174 에 따른 구조 비교 2). contrast · advisory 수는 그대로(tertiary 쌍의 설명에 placeholder 를 더함).
- **placeholder = tertiary**(Text Field · Search · Select) — 라이트 3.67 · 다크 3.66. disable 1.33 은 보이지 않았고, 4.5 미달은 기존 REF 로 선언된 값이다.
- **입력 검증은 시스템이 제공** — 사이트 `form[data-validate]`(ds.js) · React `<Form validate messages onValidate>`(`text-field/validation.ts`, 문구는 양쪽이 같아야 한다). 표준 제약 + 글자 수를 본다. 포커스가 떠날 때 필드 단위(건드리지 않은 빈 필드는 조용함), 제출하면 캡처에서 막고 첫 오류로 포커스 · 3개 이상 요약 · 고치면 바로 지움 · 입력값 유지. 도움말 칸은 빈 채로도 그려 둔다(`aria-live` — `.help:empty` 가 줄 간격을 되돌린다). 약관 동의 `.msg:empty` 도 `display:none` 이던 것을 같은 방식으로. Select · Checkbox · Radio 는 각 컴포넌트 정비 때 더한다. `error` prop 으로 넣은 오류는 제출을 막지 않는다(서버 응답이 재제출을 영원히 막지 않게).
- **글자 수 한도는 넘겨도 입력** — `data-maxlength`(React `maxLength` 는 이제 네이티브가 아니다, `MIGRATION.md`). 넘으면 오류 · 카운터 `.over` · 제출 차단. 폼 밖에서는 입력한 뒤에만 알린다.
- **필드 버튼은 비밀번호 표시만** `.reveal`(React `reveal`, `aria-pressed`, 포커스는 버튼에 남음). 그 외 `.field.mono`(`mono`) · `.form-legend`(`FormLegend`) · `principles` 첫 사례(원칙 표 9행).
- verify 더함: 글자 입력마다 접근 이름(placeholder 는 이름이 아니다) · `<em>*</em>` 있는 폼의 `.form-legend`.
- **측정에서 드러나 고친 것:** Text Field 예제의 입력 8개에 접근 이름이 없었다(라벨이 연결 안 됨). 사이트 예제의 `type="submit"` 은 통과하면 페이지를 다시 읽었다(프리뷰 제출 막음). React 비제어 카운터가 입력해도 늘지 않았다 · size 예제 placeholder 가 36 · 44 · 52 였다. 입력 폼 오류 예제가 '3개 이상일 때' 인데 오류 2개였다. **요약이 세로로 깨진 것은 캡처에서 발견** — `$("div > span", box)` 는 문서 기준으로 맞춰 상자 자신의 `.ico` 를 집었고, 동작 검사도 같은 선택자라 통과했다(`:scope >` 로, 아이콘이 남아 있는지 단정을 더함). 음성 시험: 사이트 11건 · React 7건을 하나씩 되돌려 모두 실패로 잡혔다(`aria-live` 를 넣는 경로는 처음에 통과해, 도움말 칸을 적지 않은 폼의 단정을 더했다). render.js 의 ds.js 크기 73KB → 84KB. Figma 미반영 120 → 123건(Spec 의 placeholder 문구 등).

2026-11-09 Search 정비(사람의 결정 넷) — behave 514 → 525 · react 311 → 319(`tests/search.test.tsx` 8). contrast · advisory · 예제 수는 그대로.
- **입력 지연은 시스템이 제공** — 사이트 `.searchbar[data-debounce]`(기본 300ms) · React `debounce`. 결과를 바꿀 때를 한 이벤트로: `ds:search` {value, trigger}(input · enter · clear) · `onSearch(value, trigger)`. Enter · 지우기 · Esc 는 기다리지 않고 기다리던 것을 취소한다. `data-debounce` 가 없으면 조회형(Enter).
- **결과 건수는 숨긴 `role=status`**(React `status`), 보이는 건수는 목록 툴바 몫. 필터 칩 예제의 '결과 수와 함께' 는 실제로 없던 약속이라 설명을 고쳤다.
- **`/` 단축키를 ds.js 에도** `data-hotkey` — 전에는 `kbd` 가 보이기만 했다. 입력 중(`select` · contenteditable 포함) · 조합키 · 한글 조합 · 모달이 열린 동안 무시(React 도 같은 가드로). 화면에 하나 · kbd 는 data-hotkey 와 같이(verify). 그 페이지의 사이트 검색 `/` 는 이 입력에 양보한다(캡처라 포커스가 먼저 옮겨 사이트 쪽 조건이 자연히 빠진다).
- **로그용 쿼리 문법 입력은 11/30 이후**(사람의 결정) — 로그 뷰어 placeholder 의 `host:"…" level:crit` 는 없는 기능이라 지웠다.
- **Esc** 는 값이 있으면 언제나 지우고(`clearable` 무관) 대화상자를 닫지 않는다. 값이 없으면 그대로 지나간다.
- **측정에서 드러나 고친 것:** `type=search` 의 브라우저 기본 ×가 `.clear` 와 나란히 두 개 떴다(`getComputedStyle` 로는 안 읽혀 값 있음 · 없음 스크린샷이 같은지로 잰다). 사이트 `kbd` 가 값이 있어도 남았다. React `onSubmit` 이 한글 조합을 끝내는 Enter 에도 불렸다. placeholder '어떤 정책을 찾으시나요?' · '아이콘을 검색해주세요' 를 검색 대상으로. Spec Placement '헤더 우측' → 실제 '로고 옆'(자리 규칙은 Top Navigation 정비 때).
- 음성 시험: 사이트 9건 · React 7건. 1건은 통과해 쓸모없는 조건이었음이 드러나 지웠고(사이트 `/` 의 `defaultPrevented`), 무관한 변형에서 기본 × 단정이 실패해 원인을 재 보니 아이콘 SVG 안티앨리어싱 ±3 이었다 — 비교를 입력칸 오른쪽 끝 32px 로 좁혔다. render.js 의 ds.js 크기 84KB → 86KB. Figma 미반영 123 → 124건(Search Spec 의 Placement).

2026-11-09 Select 정비 · Combobox 신규(사람의 결정 넷) — pages 63 → 64 · 컴포넌트 31 → 32 · behave 525 → 584 · react 319 → 345(`tests/select.test.tsx` 7 · `tests/combobox.test.tsx` 11 · 예제 174 → 182 에 따른 구조 비교 8). contrast · advisory 수는 그대로(새 색 쌍 없음 — 기존 토큰만 씀).
- **검색 · 다중은 Combobox 로 분리**(Select 는 단일 선택) — WAI-ARIA combobox, 포커스는 입력에 두고 `aria-activedescendant`. 단일 · 다중, 대소문자 무시 부분 일치 필터, 서버 검색 `data-filter="none"` + `ds:query` · React `filter={false}` + `onQueryChange`(300ms). 떠날 때 고르지 않은 글자는 버리고, 단일에서 글자를 비우면 해제. 기본값(사람이 정하지 않음): 태그가 많으면 줄바꿈으로 늘어남('+N' 없음), 없는 값 새로 만들기 없음.
- **폼 값 · 검증 참여** — 사이트 `data-name` · `data-required`, React `name` · `required`. `form[data-validate]` · `<Form validate>` 의 같은 흐름(첫 오류 이동 · 3개 이상 요약 · 고치면 지움). 문구 `choose`. 열지 않고 지나간 필드는 조용하고, 열었다가 고르지 않고 닫으면 알린다.
- **선택 해제 = 목록 맨 위 항목** — 필터 '전체', 필수 아닌 폼 항목 '선택 안 함'(값 빈 문자열 → placeholder), 필수에는 없음. **목록 상태 = `.menu-state` 한 줄** · React `status` · `onRetry` · 이벤트 `ds:retry`.
- **키보드** — 닫힌 트리거 ↑↓, 글자로 항목 찾기(0.5초 버퍼 · 같은 글자 순환 · 초성), Tab 은 닫고 다음 칸. **Esc 는 가장 안쪽 하나만**(사이트 keydown · React `useEscape` 스택 — 직접 쓰는 제품은 뒤에 켜진 것이 있으면 안 불린다, MIGRATION).
- **`.field` 안 Select** 는 필드 폭을 채우고(200 고정이었다) 라벨을 `aria-labelledby="라벨 자기"` 로 잇는다(verify 가 본다). React 는 `FieldContext`.
- **측정에서 드러나 고친 것:** 스크롤되는 목록(ul)이 Chromium 에서 Tab 칸이 되어 Tab 이 목록에 멈추고 떠남이 일어나지 않았다(`tabindex=-1`). 비활성 항목만 맞을 때 사이트는 '없음', React 는 후보로 잡아 서로 달랐다 — 둘 다 '결과 n개 · 후보 없음'. 예제 위 원칙 표가 늘어 '메뉴가 위로 뒤집힘' 단정의 전제(예제가 페이지 위쪽)가 깨졌다 — 트리거를 정한 자리로 옮겨 잰다. 기존 'search hides the native clear' 단정이 첫 캡처 때문에 부하에서 2/20 간헐 실패 — 한 번 찍어 버린다(0/20).
- 음성 시험: 사이트 18건 · React 13건. 첫 회 3건을 못 잡아(옵션 mousedown 포커스 · 오류 필드 안 입력의 링 · 비활성 후보) 단정을 더했고 다시 깨서 모두 실패로 잡았다. render.js 의 ds.js 크기 86KB → 98KB. Figma 미반영 124 → 125건(Combobox Spec 카드 없음).

2026-11-10 Dropdown 정비(사람의 결정 넷) — behave 584 → 602 · react 345 → 354(`tests/dropdown.test.tsx` 7 · 예제 182 → 184 에 따른 구조 비교 2). contrast · advisory · pages 수는 그대로.
- **항목 수 3~15 로 통일**(1~2개는 버튼 — 계획의 '5~15' 와 '표는 3개 이상' 이 어긋났다). **선택 표시는 Select 전용**(React `kind="menu"` 의 `selected` 는 경고하고 그리지 않음). verify 가 예제의 항목 수 · `.on` · 위험 항목이 맨 아래 구분선 뒤인지를 본다. 하위 메뉴는 만들지 않는다(계획의 기본값).
- **스크롤 영역 안의 메뉴는 화면 기준으로 띄운다**(`.float` — Dropdown · Select · Combobox). 열 때 재서 `--float-x/y/w` 를 넣고(우측 정렬 · 위로 뒤집기 · 화면 안 8px 유지) 메뉴 밖 스크롤 · 창 크기 변경에 닫는다. 사이트 `placeMenu` · React `useMenuPlacement`. Data Table '행 동작' 예제를 더했다.
- **이동 항목은 진짜 링크** — `li[role=none] > a.menu-item[role=menuitem]` · React `MenuItem href`. 예제 '이동 항목'.
- **측정에서 드러나 고친 것:** React 에서 항목을 실행하면 포커스가 사라졌다(사이트는 트리거로 돌아옴 — Select 도 같이 고침). Spec 의 '메뉴 최소 폭 200' 은 틀렸다 — `.dropdown .menu{min-width:100%}` 가 `.menu{min-width:200px}` 를 이겨 동작 메뉴의 폭은 글자에 맞는다(문구를 실제대로 고쳤고 CSS 는 그대로). 런타임 변수 목록이 `verify.js` 와 `sync-css.mjs` 두 곳이다(둘 다 `--float-*` 를 더함).
- 음성 시험: 사이트 14건 · React 9건. 첫 회 창 크기 변경 닫힘 1건을 못 잡아(실제 창 변경은 스크롤 이벤트도 내고, 메뉴가 열렸는지 단정이 없었다) resize 만 발생시키고 열림을 먼저 단정하게 고쳐 잡았다. render.js 의 ds.js 크기 98KB → 99KB. Figma 미반영 125 → 127건(Dropdown Spec 문구).

2026-11-10 선택 컨트롤 정비(Checkbox · Radio · Switch · Select Button · Chip · Slider, 사람의 결정 넷) — behave 602 → 640 · react 354 → 374(`tests/choice-controls.test.tsx` 15 · 예제 184 → 189 에 따른 구조 비교 5). contrast · advisory · pages 수는 그대로(스피너는 제품 색 / 흰 노브 — 빌드가 재는 흰 글자 4.5 쌍과 같은 두 색).
- **Switch 는 응답 후 반영** — 사이트 `.switch[data-async]` + `ds:switch`(`resolve` · `reject(문구)` · `cancel`), React `action`(`false` = 그대로, 던지면 Toast · `ToastProvider` 필수) · `busy`. 처리 중은 `aria-busy` + 노브 스피너, 포커스를 잃지 않게 `disabled` 대신 `aria-disabled`. 실패는 닫을 때까지 남는 Toast. `ds:switch` 는 클릭이 끝난 뒤에 낸다 — 브라우저가 취소된 클릭의 checked 를 되돌려서 처리기가 바로 resolve 하면 값이 지워진다. 문서 예제의 응답은 `app.src.js` 가 흉내 낸다(`data-demo-fail` 은 문서 전용).
- **Select Button 은 radiogroup** — Tab 한 번 · 화살표로 옮기면 바로 고름 · 비활성 건너뜀(사이트 · React). 토글 묶음으로 돌아가면 verify 가 막는다. skeleton 비교에 `aria-checked` · `aria-busy` 를 더했다.
- **Chip 은 줄바꿈** — `+N` 없음. Input Chip 의 지우기를 `<i role=button>` 에서 진짜 `button.x` 로(사이트 예제의 `<i>` 는 tabindex 가 없어 키보드로 닿지 않았다), 값이 든 이름, 지운 뒤 포커스는 다음 · 앞 · 묶음. 필터 칩 2개 이상이면 `[data-chip-reset]` · React `clearable`(verify). 값은 240 말줄임 + 지우기에 포커스가 오면 펼침.
- **Slider 는 규칙과 예제만**(사람의 결정) — 숫자 입력 일체형은 **v1.0 완료 뒤 제공 여부를 다시 묻는다(사람의 요청)**. 단위는 `aria-valuetext` 로도 나간다.
- **Checkbox · Radio 필수 그룹** — `.field` 안 `fieldset[data-required]` · React `legend required`(`ChoiceGroup`)가 입력 폼 검증에 낀다. 고르면 바로 지우고 마지막을 풀면 바로 알리며, 지나가기만 하면 조용하다.
- **측정에서 드러나 고친 것:** `.field input` · `.field label` 규칙이 그룹 안 체크박스 · 라디오에도 걸린다 — `:where(:not(...))` 로 뺐다(명시도 그대로, 쉼표를 넣으면 CSS 를 읽는 도구가 선택자를 잘못 끊어 Figma audit 3건이 '규칙 없음'이 됐다). 표의 행 체크박스 · Switch 접근 이름이 전부 '선택' · '사용' 이었다(React 는 `rowLabel`, 기본 첫 열 값). React Switch 예제 라벨이 켬/끔으로 바뀌었다.
- 음성 시험: 사이트 43건 · React 24건. 첫 회 3건을 못 잡아(처리 중 재입력 · 옵션마다 aria-invalid · 앞 칸 포커스) 단정을 더했고 다시 깨서 모두 실패로 잡았다. 앞 칸 포커스는 fireEvent 가 포커스를 옮기지 않아 옮기지 않아도 통과하던 단정이었다. render.js 의 ds.js 크기 99KB → 104KB. Figma 미반영 127건(그대로).

`advisory 455` 는 기준 시스템 값을 따르느라, 또는 사람이 결정한 표현(예: 진한 빨강 Count 배지의 다크 흰 숫자) 때문에
우리 기준을 못 넘는 쌍입니다 — **실패가 아니라 선언된 예외**이고 `contrast.pairs.js` 에 이유가 적혀 있습니다.

## 토큰 체계 (v0.8)

- **Atomic** `--{램프}-{단계}` — 램프 13개, **숫자가 클수록 밝습니다**. 컴포넌트에서 직접 쓰지 않습니다.
- **Semantic** `--{그룹}-{하위}-{이름}` — `foreground` · `background` · `surface` · `line` · `effect` · `static`
  여섯 그룹 **79개**(참조 75 + 더한 4) + 트리 밖 15개(`--brand-label` · `--company-mark` · `--company-mark-subtle` · 탐색형 차트 `--chart-*` 12) = **94**.
- **차트 토큰** `--chart-series-1~6`(순서 고정 · 제품색과 무관) · `--chart-series-1-subtle`(비교 기간 막대) · `--chart-series-1-strong`(막대 위 선) · `--chart-grid-primary` · `--chart-axis-text` · `--chart-tooltip-surface` · `--chart-tooltip-text` 는
  CSS 가 아니라 `ds-chart.js` 가 계산값으로 읽어 캔버스에 칠합니다(소비자 0 허용 목록 `grammarOnly`). 심각도 계열은 negative-strong · cautionary · accent-lime · accent-light-blue · inactive 토큰 그대로(5단계).
- **제품 색**은 `--prod-40~60` 다섯 단계로 주입되고 `brand` 계열이 따라옵니다.
  **제품 색 위의 흰 글자가 4.5 를 넘어야 하고 빌드가 검사합니다**(`verify.js`).
- 비활성은 `--surface-disable-primary` · `--foreground-disable-primary` 로 칠합니다. `opacity` 로
  흐리게 하지 않습니다.

## Figma

> **임시 규칙 — 2026-11-09 부터 사이트 완성 때까지 Figma 반영 보류(사람의 결정 — 일정).**
> - `use_figma` 로 Figma 를 고치지 않습니다. 결정이 자주 뒤집히고 Figma 한 번이 10~34분이라, 사이트가 끝난 뒤 한 번에 검토 · 반영합니다.
> - 대신 사이트를 고칠 때마다 기준 덤프로 audit 을 돌립니다: `node _figma/audit.mjs diff _figma/dumps/baseline.json`.
>   알려진 `Label/2 SemiBold: 굵기 700 ≠ 600` 1건을 뺀 ✗ 수를 커밋 메시지에 **'Figma 미반영 n건'** 으로 적습니다. 기준선(2026-11-09, k42b 덤프)은 0건입니다.
> - 기대값은 대부분 저장소에서 읽으므로 사이트를 고치면 audit 이 저절로 따라옵니다. 새 검사에 Figma 쪽 데이터가 필요하면 `audit.mjs` 만 고치고, `probe.js` 수정은 일괄 반영 때 합니다.
> - **끝나는 조건:** 사이트가 완성되면 전체 probe → audit 목록 → figma-sync 로 고침 → 어긋남 0 → 데스크톱 검토 한 번 → `baseline.json` 을 새 덤프로 바꾸고 이 블록을 지웁니다.

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
