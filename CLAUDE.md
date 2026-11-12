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
pages 74 · verify 0/0 · contrast 1434쌍 실패 0 · advisory 455 · behave 1201/1201 · react 710+6 · tsc 0
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

2026-11-10 피드백 · 오버레이 정비 · Side Panel 신규(사람의 결정 여섯) — pages 64 → 65 · 컴포넌트 32 → 33 · behave 640 → 712(`behave.feedback.js` 71 · 줄인 모션 1) · react 374+3 → 415+5(`tests/feedback.test.tsx` 37 · 예제 189 → 195 에 따른 구조 비교 4 · 트리거와 패널이 나뉘어 비교하지 않는 Side Panel 2). contrast · advisory 수는 그대로(새 색 쌍 없음).
- **Toast** — 오류는 `duration` 을 줘도 닫을 때까지 유지 + 닫기 버튼, 동작이 있으면 10초(사람의 결정), 그 외 4초. 마우스 · 포커스가 묶음 안에 있는 동안 전체 타이머를 멈추고 남은 시간부터 잇는다. 동작 없는 같은 문구는 합치고 시간을 다시 잰다. 넘치면 자동 소멸 Toast 부터 지워 **오류는 밀리지 않는다**(사람의 결정 — 오류가 많으면 3개를 넘음).
- **Banner 닫기**(사람의 결정 — 구현) — `ds:banner-close` · React `onClose`. 다시 띄울지는 제품 몫. 한 번에 하나(verify).
- **Popup** — 헤더 X 필수(사람의 결정 — verify, 처리 중에는 함께 막음). 위험 확인은 `alertdialog`(+ `aria-describedby`). 첫 포커스는 X 와 `.negative` 를 건너뛴다. 위험 확인 · 입력 중 · 처리 중에는 배경 클릭으로 닫지 않는다. `DS.popup.busy()` · React `busy` 는 닫는 길을 모두 막는다. 본문만 스크롤. 주 버튼 = 제목의 동작 · 위험 확인은 취소가 앞(verify).
- **Tooltip** — 마우스 0.3초 지연, 키보드 포커스는 바로, Esc, 뒤집기, 넘침을 자르는 영역에서는 화면 기준(`.float`). 포인터를 툴팁 위로 옮겨도 유지하는 일은 하지 않았다(목록의 위 항목을 가림). 트리거 · 내부 링크 · 라벨 되풀이는 verify.
- **Loading** — 줄인 모션에서 Spinner · 버튼 loading · Switch 처리 중만 돈다(사람의 결정 — 멈춘 스피너는 고장으로 보임), Skeleton · 맥박은 멈춘다. '1초 미만' 은 제품 몫으로 문구를 고쳤고 **지연 옵션은 v1.0 완료 뒤 다시 제안한다(사람의 요청)**.
- **Side Panel** — 비모달 기본, `data-modal` · `modal` 이면 배경 · 포커스 가둠 · 스크롤 잠금. 한 번에 하나(바꿔 끼움). 닫을 때 포커스가 안에 있었거나 모달이면 연 요소로 돌아간다. 콘텐츠를 미는 레이아웃은 제품 몫.
- **측정에서 드러나 고친 것:** React Popup 을 상태로 열면 Portal 이 한 박자 늦어 포커스 이동 · Tab 가둠 · 복귀가 아예 동작하지 않았다(`activeElement=body`, 기존 버그) — 훅을 Portal 안 Layer 로 옮겼고, `useEscape` 는 바깥에 남겨야 Esc 순서가 맞다. 오류만 있는 Toast 묶음에 포커스 리스너가 안 붙어 복귀 자리를 못 기억했다. `.menu-item` 클릭이 앞 분기에서 return 되어 '입력 중' 표시가 안 됐다(캡처로). Esc 뒤 툴팁이 지연 규칙 때문에 300ms 남았다. `:not(.quiet):hover` 의 명시도가 포커스의 `0ms` 를 이겼다.
- **Banner 안 버튼(사람의 결정 — 커밋 전에 고침):** 제품 색 면 위 `outline assistive` 의 글자가 neutral-primary 라 라이트 3.70 이었다. 글자 · 테두리를 `--brand-label` 로(라이트 · 다크 4.83), hover · 누름은 Solid Primary 와 같은 `--surface-brand-strong` · `heavy`, 스피너와 포커스 링도 라벨 색으로. 경고 · 위험 Banner 는 면이 틴트라 그대로다. 다크 hover 4.17 · 누름 3.54 는 Solid Primary 와 같은 쌍으로 이미 선언된 예외다(`--brand-label` 쌍의 REF) — 그래서 contrast 수는 그대로다.
- 음성 시험: 사이트 76건 · React 49건. 첫 회 4건을 못 잡아(같은 Toast 시간 다시 재기 · 일반 Toast 와 동작 Toast 합침 · 페이지 안 패널 예제 닫힘 · 패널 본문 스크롤) 단정을 고쳤고 다시 깨서 모두 실패로 잡았다. render.js 의 ds.js 크기 104KB → 115KB. Figma 미반영 127 → 130건(Side Panel Spec 카드 없음 포함).

2026-11-10 데이터 정비(Data Table · Table · Pagination · List · Item Tile, 사람의 결정 넷) — behave 712 → 744(`behave.data.js` 32) · react 415+5 → 449+5(`tests/data-bundle.test.tsx` 27 · 예제 195 → 202 에 따른 구조 비교 7). contrast · advisory · pages 수는 그대로(새 색 쌍 없음).
- **v1.0 범위는 고정 헤더만**(사람의 결정) — `.tbl-wrap.sticky` · React `stickyHeader` + `maxHeight`. **열 표시 설정 · 행 펼침은 v1.0 완료 뒤 넣을지 다시 묻는다(사람의 요청).**
- **전체 선택 = 페이지 + 전체 안내, 유지**(사람의 결정) — 머리글 체크박스는 이 페이지의 켜진 행만. 페이지를 다 고르면 '전체 n건 선택' 안내(`.tbl-wrap[data-total]` · `ds:select-all` · React `totalCount` · `allMatching`). 비활성 행은 말없이 뺀다(사람의 결정). 페이지를 옮겨도 선택은 남고 필터가 바뀌면 지운다(React `selectionScope`, 사이트는 제품 몫). 전체 실행은 제품 서버.
- **Pagination 커서 = 이전 · 다음**(사람의 결정) — `.pagination.cursor` + `ds:page {direction}` · React `CursorPagination`. 표시 개수 20 · 50 · 100(`PAGE_SIZES`), 번호 칸 9칸 이하(verify · React 경고), 표시 개수를 바꾸면 1페이지, 한 페이지뿐이면 번호를 숨기고 건수는 유지, 이동 후 `data-target` · `target` 으로 포커스 · 스크롤. 표시 개수 · 칸 상한은 제안을 사람이 확인했다(사람의 결정).
- **큰 선택지 셋 유지, 경계 적기**(사람의 결정) — Tile = 아이콘 위주 다중 선택 · 바로 이동, Card Selection = 내용 많은 카드, Card Radio = 하나만. `data-single` 을 없앴고(verify) 온보딩 패턴을 Card Radio 로 옮겼다(사람의 결정).
- **그 밖에** 서버 정렬(`data-sort="server"` + `ds:sort` · `manualSort`), 로딩 · 오류 · 첫 사용 상태, 말줄임, 행 삭제 후 포커스(`DS.table.removeRow`). 규칙만 적고 구현은 제품 몫: 로그 표 자동 갱신 · 일시 정지 · 새 행 표시, 현재 페이지 URL 저장. `principles` 를 다섯 컴포넌트에 더했다.
- **verify 더함:** 표 머리글 필수 · `th.sortable` 는 `button.sort` · 머리글 안 다른 조작 금지 · 행 버튼 이름 중복 · 고정 헤더 영역의 tabindex + 이름 · listbox 항목 규칙 · 번호 칸 · `data-single` 금지.
- **측정에서 드러나 고친 것:** 정렬 머리글이 `th` 클릭뿐이라 키보드로 닿지 않았다(버튼으로). 사이트 listbox 에 키보드가 없었다. List 의 안쪽 버튼 Enter 를 행이 가로챘다. React 머리글 체크박스를 끄면 다른 페이지 선택까지 지웠고 비활성 행까지 골랐다. 끝에 닿아 꺼진 화살표에서 포커스가 사라졌다. 행 버튼 이름이 행마다 같았다(List '더 보기' · 로그 '상세'). 커서의 범위 글자가 크기 지정이 없어 본문 16 을 물려받았다(14 로 — 전체 behave 의 15px 기본 글자 검사가 잡음).
- 음성 시험: 사이트 46건 · React 45건. 첫 회 CSS 2건을 못 잡아(정렬 버튼 면 리셋 · 커서 버튼의 아이콘 가로 배치) 단정을 더했고 다시 깨서 모두 실패로 잡았다. 1건은 변형이 없던 시험이라 고쳤다. `.tbl-wrap.sticky{overflow:auto}` 는 지워도 통과해 재 보니 `overflow-x:auto` 로 이미 계산되는 쓸모없는 선언이라 지웠다. render.js 의 ds.js 크기 115KB → 119KB. Figma 미반영 130 → 133건.

2026-11-10 탐색 · 표시 정비 · Steps 분리(Tab · Navigation · Top Navigation · Tag · Indicator · Divider, 사람의 결정 넷) — pages 65 → 66 · 컴포넌트 33 → 34 · behave 744 → 782(`behave.nav.js` 38) · react 449+5 → 476+5(`tests/nav-display.test.tsx` 19 · 예제 202 → 210 에 따른 구조 비교 8). contrast · advisory 수는 그대로(새 색 쌍 없음 — 기존 토큰만 씀).
- **Tab 넘침 = 가로 스크롤**(사람의 결정) — 탭 줄만 스크롤하고 고른 탭을 보이는 자리로(사이트 `tabReveal` · React `revealTab`, 페이지는 움직이지 않음). 스크롤 영역이 테두리 밖을 잘라 아랫줄을 `border-bottom` 에서 안쪽 그림자로 바꿨다(높이 44.4 그대로), 포커스 외곽선은 안쪽으로.
- **탭을 옮겨도 입력을 남긴다**(사람의 결정) — 패널은 숨기기만 한다. 사이트 `aria-controls`, React `keepMounted` 기본 true(MIGRATION). Tab 키는 패널로 간다(고른 탭만 멈춤 · 패널 tabIndex 0). 활성 탭의 URL 저장은 규칙만(제품 몫).
- **Steps 를 별도 컴포넌트로**(사람의 결정) — Indicator 에서 뺐다. 3~6단계(verify · React 경고), 완료 단계로 돌아가기(`.step-btn` + `ds:step {index}` · React `onStepClick`). audit 은 `steps/default` 예제를 본다. `figma` 필드는 Indicator 에 그대로다(Figma 프레임이 그 안에 있음).
- **표 칸의 Tag = 앞 2개 + `+N`, 그 외 줄바꿈**(사람의 결정) — `.tag-group` · `.tag-more` · React `TagGroup max`. `+N` 은 포커스를 받는 버튼이고 나머지는 Tooltip. Tag 최대 폭 160 은 사람이 정하지 않은 기본값이고 넘으면 줄바꿈한다(잘라 내면 키보드로 읽을 길이 없다). 짧은 Tag 는 좁은 자리에서도 줄바꿈하지 않는다(`width:max-content`).
- **Navigation** — 접힌 레일의 이름을 `title` 에서 `aria-label` + Tooltip 으로(키보드로 볼 수 있음). 본문 바로가기 `.skip-link` · React `SkipLink`, 이 사이트의 모든 페이지에도 넣었다. 접은 상태 기억은 규칙만(제품 몫).
- **Top Navigation** — 사용자 메뉴 예제, 아이콘 버튼 Tooltip. **verify 더함:** tablist 이름 · Tab 안 링크 금지 · 탭 라벨 1~2단어 · 접힌 내비의 title 금지 · 상단 메뉴와 Navigation 중복 · 오른쪽 순서 · 상단 아이콘 버튼 이름과 Tooltip · 심각도 색 어휘 · 표 칸 Tag 개수 · `+N` 은 버튼 · Count 0 과 99 초과(`.neutral` · 탭 건수 제외) · Steps 단계 수와 이름과 돌아가기 · 구분선 중복.
- **측정에서 드러나 고친 것:** 사이트 방향키가 패널 글자 · `ds:tab` 을 건너뛰었다(클릭과 같은 길로). 사이트 탭에 roving tabindex 가 처음 그릴 때 없어 Tab 이 다음 탭으로 갔다. 표 안처럼 화면 기준으로 띄운 Tooltip 이 포커스가 일으킨 스크롤에 사라져 키보드로 볼 수 없었다 — 포커스로 뜬 것은 다시 재서 따라간다(사이트 · React, 마우스로 뜬 것은 전처럼 닫힘).
- 음성 시험: 사이트 53건 · React 22건. 첫 회 사이트 3건은 지워도 같은 쓸모없는 선언이라 코드에서 지웠고(`.tab{flex:none}` · `.sidenav .tooltip-wrap{display:flex}` · `.tag-more{cursor:default}`), React 1건은 jsdom 이 CSS 를 안 읽어 이름 단정이 비어 있던 것을 고쳤다. 1건은 동작이 같은 변형이라 뺐다. 기준선에서 시험 하나가 실패한 채 돌아 React 를 다시 돌렸다. render.js 의 ds.js 크기 119KB → 121KB. Figma 미반영 133 → 139건.

2026-11-10 추가 컴포넌트 승격 묶음(Form · Empty State · Page Header · Avatar · Link, 사람의 결정 넷) — pages 66 → 70 · 컴포넌트 34 → 39 · 패턴 11 → 10 · behave 782 → 802(`behave.promote.js` 19 · Tooltip 1) · react 476+5 → 505+5(`tests/promote.test.tsx` 17 · 예제 210 → 222 에 따른 구조 비교 12). contrast · advisory 수는 그대로(새 색 쌍 없음).
- **빈 화면은 컴포넌트로 옮기고 입력 폼 패턴은 남긴다**(사람의 결정) — Empty State 는 내용이 컴포넌트와 같아 패턴 페이지를 지웠다. 입력 폼은 조합 화면 예로 남기고 Form 페이지는 구조 · Props · 규칙만. `compact` 의 인라인 스타일을 CSS 로.
- **ErrorSummary 를 꺼냈다**(사람의 결정) — 서버 오류를 폼 맨 위에 직접 넣는 자리. 자동 요약(`form[data-validate]` · `<Form validate>`)도 같은 `.form-summary` 를 쓴다. 3개 미만이면 React 경고 · verify.
- **Page Header 는 h1 기본 + Breadcrumb 첫 칸**(사람의 결정) — `.page-head` 를 2열 grid 로(Breadcrumb 는 윗줄 전체, 제목 위 8), React `as`(기본 h1 — MIGRATION) · `breadcrumb`. 동작 3개까지 · 주 버튼 하나 · 화면에 하나는 verify.
- **Link 는 문장 안은 늘 밑줄**(사람의 결정) — 그 줄 자체가 링크인 자리(`.standalone` · 표의 `.link`)는 hover 때만. 전에는 표 안에서만 스타일이 있었다. Avatar 는 문서화만(이니셜, 계획대로).
- **제안을 사람이 확인한 값:** 문장 안 링크의 hover 는 밑줄 두께 2 · 새 창 링크는 아이콘 + 숨긴 '(새 창)' · Page Header 동작 3개 상한.
- **verify 더함:** `.link` 는 a · href 필수 · 새 창의 rel · 아이콘 · 숨긴 문구, Avatar 1~2자, Page Header 제목 · 하나 · Breadcrumb 위치 · 동작 수, Empty State 제목 · 동작 수, `.form-row` 필드 2개, 오류 요약 맨 위 · 3개 이상, `.form-actions` 맨 아래.
- **측정에서 드러나 고친 것:** 긴 제목이 낱말 가운데서 끊겼다(캡처에서 발견, `.page-head .title` 에 `word-break:keep-all`). **Tooltip 기존 결함** — 표 안 Tooltip 의 `.float` 표식이 떠난 뒤에도 남아, 그 사이 스크롤이 나면 `quiet` 가 붙어 다음에 와도 뜨지 않았다(탐색 묶음 단정이 12회에 1회 실패해 재 보니 원인). 켜져 있는 Tooltip 만 처리한다(`_dsTip`, React 는 원래 그렇다). 기존 'scrolling hides' 단정은 포인터가 이미 벗어난 Tooltip 에 이 결함 경로로 붙는 `quiet` 를 재고 있어, 트리거가 포인터 아래에 남을 만큼만 스크롤해 실제로 숨는지 재게 고쳤다. 고친 뒤 탐색 단정 20회 · 피드백 단정 8회 모두 통과.
- 음성 시험: 사이트 42건 · React 26건에 Tooltip 2건. 첫 회 verify 1건을 못 잡아(`.form-actions` 맨 아래 정규식이 뒤따르는 내용까지 통과시켰다) 블록 경계로 고쳤고 다시 깨서 잡았다. 전체 게이트에서만 도는 15px 기본 글자 검사가 새 예제 4개를 잡아 `.t-body-2` 를 지정했다. Figma 미반영 139 → 144건.

2026-11-10 File Upload 신규(사람의 결정 넷) — pages 70 → 71 · 컴포넌트 39 → 40 · behave 802 → 871(`behave.upload.js` 69) · react 505+5 → 532+6(`tests/file-upload.test.tsx` 22 · 예제 222 → 228 에 따른 구조 비교 5 · 정적 네 상태 예제 하나는 비교하지 않음). contrast · advisory 수는 그대로(새 색 쌍 없음).
- **화면과 검증까지 시스템, 전송은 제품**(사람의 결정) — 사이트 `.upload` + `ds:upload` · `ds:upload-retry` · `ds:upload-remove` + `DS.upload.progress/done/fail`, React `FileUpload`(제어형 `items` · `onAdd` · `onRemove` · `onRetry`).
- **하나만 받으면 새 파일로 교체 · 거절은 목록의 오류 줄 · 전송 중과 오류면 제출을 막고 필드에 안내 · 드롭 영역 + 버튼형 `.compact`**(사람의 결정 넷). 거절된 파일은 다시 보내도 같으므로 지우기만 둔다.
- **제안을 사람이 확인한 값(일곱 다 유지):** 같은 이름 · 크기의 중복과 빈 파일도 거절, 하나만 받는 자리에 여러 개를 놓으면 첫 파일만 받고 나머지는 오류 줄, 영역 어디를 눌러도 파일 대화상자, 거절 줄은 통과한 파일 뒤, 전송 전 대기 상태는 제출을 막지 않음, 전송 실패를 필드 오류로 올리는 때는 제출을 시도한 뒤.
- **오류 표시 시점:** 전송 중으로 바뀌는 것만으로는 필드가 빨개지지 않고, 제출이 막혀 띄운 '전송 중' 안내는 끝날 때까지 둔다. 전송 실패는 제출을 시도했거나 이미 오류일 때만 필드에 올린다(줄에는 늘 보임). 마지막 필수 파일을 지우면 제출 전에도 바로 알린다. React 는 `FormValidationContext.refresh` 를 더했다.
- **verify 더함:** 도움말(형식 · 용량) · 버튼의 aria-labelledby · `.upload-pick` · 숨긴 input · `.upload-status` · 파일 줄 버튼 이름에 파일 이름 · 거절 줄에 다시 시도 금지. 라벨 검사는 숨긴 file input 을 뺀다(버튼이 이름을 갖는다).
- 음성 시험: 사이트 52건 · React 35건. 첫 회 14건을 못 잡았다 — 13건은 단정의 전제가 틀렸다(하이픈에서 줄이 나뉘어 긴 이름 줄바꿈을 못 잼 · 앞선 제출로 '필수 파일 지우기' 경로를 못 탐 · 파일 줄이 하나라 '다른 파일 전송 중' 을 못 만듦 등). 고쳐 다시 깨서 모두 잡았고, 1건(재시도 후 포커스 이동)은 `upState` 가 이미 해서 코드를 지웠다. 파일 대화상자 단정은 가로채기를 매번 켜고 끄면 부하에서 한 번 어긋나 켜 둔 채 세게 고쳤다(부하 6회 통과). 파일 대화상자는 Playwright 가로채기로, 끌어다 놓기는 합성 DragEvent 로 쟀다. render.js 의 ds.js 크기 121KB → 134KB. Figma 미반영 144 → 145건(File Upload Spec 카드 없음).

2026-11-10 Code · Copy Field 신규(사람의 결정 둘) — pages 71 → 73 · 컴포넌트 40 → 42 · behave 871 → 923(`behave.code.js` 52) · react 532+6 → 556+6(`tests/code-copy.test.tsx` 17 · 예제 228 → 235 에 따른 구조 비교 7). contrast · advisory 수는 그대로(새 색 쌍 없음).
- **Code 는 구문 강조 없이 고정폭 · 복사 · 줄바꿈 또는 가로 스크롤**(사람의 결정) — 사이트 `.code-view`(`.wrap`) · `.code-inline`, React `CodeBlock` · `InlineCode`. 넘친 내용은 `pre` 가 포커스를 받아 키보드로 스크롤한다.
- **Copy Field 는 민감한 값을 기본으로 가리고 보기 버튼, 복사는 가린 채로도 전체 값**(사람의 결정) — `.field.mono.copy-field`(읽기 전용 입력 + `type=password` + 기존 `.reveal`), 표 · 키-값은 `.copy-field.inline`(가리는 기능 없음). React `CopyField`.
- **사람이 정하지 않은 기본값:** 복사 결과는 버튼 자리에서 2초(Toast 없음), 기본은 가로 스크롤, 보기로 펼친 값은 다시 누를 때까지 그대로(자동으로 다시 가리지 않음), `ds:copy` · `onCopy` 는 성공 여부만 싣고 값은 싣지 않음(로그로 새지 않게), 감사 로그용 `ds:reveal` · `onReveal`, 인라인 복사 버튼 24.
- **복사 공통** — 클립보드 API 가 거부되면 임시 textarea + `execCommand` 로 한 번 더 시도하고, 그것도 실패하면 버튼에 '복사 실패' 로 알린다. 임시 textarea 는 버튼 옆에 둔다(body 에 두면 바깥을 감지하는 팝오버가 닫힌다). 알림 영역은 페이지에 하나 `body > .ds-live` 를 미리 만들어 쓴다(표의 행마다 만들지 않게).
- **verify 더함:** Code 의 제목 · `pre` tabindex 와 제목과 같은 이름 · 구문 강조 금지 · 복사 버튼 이름, Copy Field 의 readonly · 버튼 이름에 값의 이름 · 가린 값의 보기 버튼 · 인라인 복사 이름.
- **측정에서 드러나 고친 것(캡처):** 사이트 셸의 `.copied{outline:2px … !important}` 가 복사한 버튼에 마우스로도 외곽선을 입혔다 — 상태 클래스를 `.copy-done` · `.copy-failed` 로. `.field .affix span`(접두 · 접미 글자용)이 복사 글자를 12px · tertiary 로 흐렸다. 임시 textarea 에 `select()` 만 해서는 포커스가 안 옮겨 와 `focus` 를 더했다.
- 음성 시험: 사이트 42건 · React 28건. 첫 회 3건을 못 잡아(긴 줄이 그리드 열을 넓히는 경로 · 2초 뒤 아이콘 복귀 · 알림 영역이 앞 테스트에서 남아 있던 것) 단정을 고쳐 다시 깨서 잡았다. 실제 클립보드는 쓰지 않고 `navigator.clipboard` · `execCommand` 를 바꿔 쟀다. render.js 의 ds.js 크기 134KB → 138KB. Figma 미반영 145 → 147건(Spec 카드 둘 없음).

2026-11-10 Number Input 신규(사람의 결정) — pages 73 → 74 · 컴포넌트 42 → 43 · behave 923 → 974(`behave.number.js` 51) · react 556+6 → 582+6(`tests/number-input.test.tsx` 21 · 예제 235 → 240 에 따른 구조 비교 5). contrast · advisory 수는 그대로(새 색 쌍 없음).
- **입력칸 안에 증감 버튼과 단위, 위 · 아래 화살표로도 바꿈, 범위 밖 값은 받고 오류로 알림**(사람의 결정) — 사이트 `.field.number-field` + `.num-btn`, React `NumberInput`. 네이티브 `type=number` 위에 만들어 `stepUp` · `stepDown` · 표준 제약 · 기존 검증 문구를 그대로 쓴다. 버튼 · 화살표로 바꿔도 `input` · `change` 가 난다.
- **기존 숫자 입력을 옮겼다** — 입력 폼 패턴 셋(우선순위 · 보관 기간 둘) · Slider '정확한 값' 예제(사이트 · React). 안 옮기면 브라우저 스피너가 그대로 보인다. 예제의 `type=number` 는 `.number-field` 안에만 있어야 한다(verify).
- **사람이 정하지 않은 기본값:** 누르고 있어도 한 칸씩(반복 없음), 천 단위 구분 없음, 'e' 같은 입력은 막지 않고 오류로 알림, 증감 버튼은 Tab 에서 뺌, 오류는 포커스가 떠날 때, 폼 밖의 빈 값은 조용함(필수 여부는 폼이 잰다).
- **verify 더함:** 숫자 입력은 `.number-field` · 범위가 있으면 도움말 · 버튼의 tabindex=-1 과 이름에 값의 이름 · `step=any` 금지.
- 정적 예제에도 끝에 닿은 버튼의 `disabled` 를 적는다(구조 비교가 잡음 — ds.js 가 켜기 전 · 복사한 HTML 이 같은 모양이게). `BUTTON_HOSTS` 에 `.number-field` 를 더했다.
- 음성 시험: 사이트 32건 · React 34건. 첫 회 8건을 못 잡았다 — 쓸모없는 코드 3건은 지웠고(아이콘 크기 규칙 · 폼 안을 가르는 조건 둘 — 폼 흐름과 결과가 같다), 5건은 단정을 고쳐 다시 깨서 잡았다(호버 때 보이는 브라우저 스피너는 계산값으로 안 보여 픽셀로 잰다 · 좁은 칸의 버튼 폭 · 폼 밖 빈 필수 값 · 제품이 바꾼 값 따라가기 · 폼 안 지역 오류). render.js 의 ds.js 크기 138KB → 140KB. Figma 미반영 147 → 148건(Number Input Spec 카드 없음).

2026-11-10 Date Picker 시각 옵션(Time 입력, 사람의 결정 넷) — behave 974 → 1068(`behave.dptime.js` 94) · react 582+6 → 623+6(`tests/date-time.test.tsx` 39 · 예제 240 → 242 에 따른 구조 비교 2). contrast · advisory · pages 수는 그대로(새 색 쌍 없음 · 별도 컴포넌트가 아니다).
- **값 하나 `YYYY. MM. DD HH:mm`, 24시간제, 초는 옵션**(사람의 결정) — 사이트 `.datepicker[data-time]` · `data-time="seconds"`, React `time` · `time="seconds"`. 일 단위만(React 는 다른 단위에서 경고하고 무시). 달력은 일 단위로 일하고 글자 · 값만 시각까지 간다(사이트 `tu(st)` · React `TextUnit`).
- **달력 아래 입력칸 · 단일과 기간 둘 다 · 시각을 치지 않으면 덜 입력됨 · 처음 시각 00:00 · 기간 끝 23:59**(사람의 결정 넷). 이미 시각이 있으면 날짜만 바꾸고 시각은 남긴다. 프리셋과 초기화는 처음 시각으로.
- **문구** — 없는 시각은 `invalidTime`(주어 `timeSubject` · `startTimeSubject` · `endTimeSubject`), 같은 날의 뒤집힌 순서는 `orderTime`, 다른 날이면 기존 `order`. `data-labels` · `labels` 에 time · startTime · endTime.
- **사람이 정하지 않은 기본값:** 시각 칸의 잘못된 글자는 적용할 때 필드 오류로 알림(달력을 닫는다), 시 · 분 · 초 ↑↓ 는 올림 없이 돎, 시각을 쓰면 적용 버튼은 `footer` 와 무관하게 늘 있음, `data-max` 에 날짜만 적으면 그 하루 끝까지(React `max` 가 정확히 0시인 Date 도 같다), `data-max` 에 `now` 없음.
- **로그 뷰어 패턴에 조회 구간을 더했다**(사람의 요청) — 이 패턴에는 원래 기간 필터가 없었다. `data-time` 기간 · `data-max="today"` · 프리셋 7 · 30 · 처음 값 최근 7일(사이트 · React). 한 줄에 들어가게 검색창 최소 폭을 360 → 320 으로 줄였다(검색 패턴과 같음). 검색 패턴의 기간은 날짜 단위 그대로다. React `max` 는 오늘 0시로 둔다 — 지금 시각이면 오늘 23:59 가 범위 밖이 된다.
- **verify 더함:** `data-time` 값은 없거나 seconds · 일 단위에만 · placeholder 는 형식 그대로. **구조 비교(`skeleton.ts`)에 `data-time` 을 더했다** — React 예제에서 `time` 만 빠져도 통과하던 것을 음성 시험이 찾았다.
- **측정에서 드러나 고친 것(캡처 · 계산값):** id 없는 입력(툴바의 aria-label 필드)이 여럿이면 시각 칸 id 가 겹쳤다(`dpUid`). 달력이 피커 `.field` 안에 있어 바깥의 Large · 오류(빨강)가 시각 칸으로 내려온다 — `.calendar .cal-time .field input` 으로 되돌렸다. 기간 필드 최소 폭 300 에서 값이 잘렸다(Large 자리표시 343 — 410, 초까지 450).
- 음성 시험: 사이트 75건 · React 55건. 첫 회 18건을 못 잡아(타이핑으로는 만들 수 없는 60분 · 조각 수 · 빈 시각의 끝쪽 채우기 · 열린 채 필드를 고칠 때 시각 칸 · 시각 칸이 마지막 칸일 때의 Tab · 연속 ↑ 의 커서 · 초 칸 형식 · 월 단위 무시 · 칸 나란히 · Enter 의 폼 제출 등) 단정을 더했고 다시 깨서 모두 잡았다. render.js 의 ds.js 크기 140KB → 144KB. Figma 미반영 148 → 149건(Date Picker Spec 의 Time 행).

2026-11-10 이미 정비한 컴포넌트 보강(Date Picker 기간 상한 · Breadcrumb · Data Visual · Button, 사람의 결정 셋) — behave 1068 → 1101(`behave.polish.js` 33) · react 623+6 → 646+6(`tests/polish.test.tsx` 22 · 예제 242 → 243 에 따른 구조 비교 1). contrast · advisory · pages 수는 그대로(새 색 쌍 없음).
- **기간 상한은 시스템이 제공**(사람의 결정) — 사이트 `data-max-days` · React `maxDays`. 양끝을 넣어 세고 시각은 보지 않는다. 시작을 고르면 달력의 양쪽 상한 밖 날짜와 상한보다 긴 프리셋을 막고, 키보드 입력은 받아서 validity `long` 으로 알린다(min · max 와 같은 방식). 순서 · 범위 오류가 먼저다. 일 단위 기간만.
- **Breadcrumb 은 잘린 항목에만 Tooltip**(사람의 결정) — `title` 을 없앴다(키보드로 볼 수 없다). 링크가 아닌 항목은 잘렸을 때만 포커스를 받는다. 글자와 같은 문구라 `aria-describedby` 로 잇지 않는다(React `Tooltip describe={false}`). 글꼴이 늦게 오면 폭이 바뀌어 `fonts.ready` 뒤에 잰다.
- **탐색형 차트에 '표로 보기' 버튼**(사람의 결정) — 차트가 그리는 data 그대로 표를 만든다(`DSChart.tableData`, 사이트 · React 같은 함수). 표는 고정 헤더 · 같은 높이라 전환해도 카드가 흔들리지 않는다. 버튼은 차트 오른쪽 위(차트 카드가 40 높아짐) · 이름 없는 단일 계열의 머리글 '값'(제안을 사람이 확인). 빈 값은 보이는 '—' + 숨긴 '값 없음'(사람의 결정 — '—' 만 두면 스크린 리더가 읽지 않거나 '대시'로 읽는다, 문구 `empty`, `tableData` 는 빈 칸을 null 로). `ChartCanvas` 바깥 요소가 `.chart-view` 로 바뀌었다(MIGRATION).
- **Button** 원칙 표에 링크와 버튼 · 비활성(P1) · 주 버튼. 동작은 바꾸지 않았다.
- **verify 더함:** `data-max-days` 는 1 이상 정수 · 일 단위 기간만 · 기본 프리셋 ≤ 상한 · 도움말 필수, Breadcrumb 의 `title` 금지, 탐색형 차트의 `.chart-view` + 표로 보기 버튼.
- **측정에서 드러나 고친 것:** Tooltip 틀의 줄 높이 1.6 이 잘린 항목만 20.8 로 만들어 글자가 옆 항목과 어긋났다(`line-height:inherit`). Breadcrumb 의 복사용 CSS 범위에 Tooltip 을 더했다(`borrows` — ds.js 가 실행 중에 붙이는 클래스라 복사용 CSS 검사가 잡지 못한다).
- 음성 시험: 사이트 47건 · React 36건, 모두 잡혔다(작성 중에 min · max 유지 · 표 칸 재사용 · 마운트 실패 · 버튼 자리 단정을 미리 더했다). render.js 의 ds.js 크기 144KB → 150KB. Figma 미반영 149건(그대로).

2026-11-11 1.0 뒤로 미뤘던 것 중 둘을 앞당김 — Loading 지연 · Slider 숫자 입력(사람의 결정 넷) — behave 1101 → 1123(`behave.later.js` 22) · react 646+6 → 667+6(`tests/later.test.tsx` 19 · 예제 243 → 245 에 따른 구조 비교 2). contrast · advisory · pages 수는 그대로(새 색 쌍 없음).
- **지연은 옵션, 켜면 1초**(사람의 결정) — `data-delay` · React `delay`(true | ms)를 단 Spinner · Skeleton 은 `--ds-delay`(기본 1s) 동안 자리를 지킨 채 보이지 않는다. CSS 애니메이션(`ds-delay 0s … both`, visibility)이라 그려지는 순간부터 세고 줄인 모션에서도 기다린다(reduced-motion 규칙에 같은 선언 — 그렇지 않으면 `animation:none!important` 가 지연을 지운다). verify 의 모션 검사가 이 값을 LOOPS 와 함께 받는다.
- **한 번 보이면 0.5초 유지**(사람의 결정) — 사이트 `DS.loading.start(el, {delay, min})` · `stop(el)`(숨긴 뒤 풀리는 Promise, el.hidden) · React `useLoadingDelay(loading, {delay, minDuration})`. 다시 시작하면 보인 채로 남고 최소 시간은 처음 보인 때부터 잰다.
- **버튼 loading · Switch 처리 중은 지연 없음**(사람의 결정 — 누른 반응은 바로). verify 가 `data-delay` 를 Spinner · Skeleton 클래스에만 받는다.
- **Slider + 숫자 입력은 트랙 오른쪽 같은 줄**(사람의 결정) — `.field.number-field.slider-field > label + .slider-control(.slider > range + .affix) + .help`(최소 폭 416 · 입력칸 120 · 간격 16), React `Slider withInput unit help`. 라벨은 숫자 입력칸(제출하는 값)에, 트랙은 `aria-labelledby`. 트랙을 움직이면 입력칸이 따라가며 input · change 를 내고, 입력칸에 치면 트랙이 따라간다 — 범위 밖은 글자를 두고 트랙은 끝, 오류는 Number Input 규칙대로. 빈 칸은 트랙을 둔다. React 는 TextField `wrapControl` 로 입력칸 옆에 트랙을 둔다.
- **verify 더함:** `.slider-field` 의 라벨 · 트랙 이름 · 두 칸의 min · max · step 같음 · `.val` 금지 · 트랙 name 금지, `data-delay` 자리. 구조 비교(`skeleton.ts`)에 `data-delay` 를 더했다.
- **측정에서 드러나 고친 것:** `.field input:where(…)` 규칙 9개가 필드 안 range 에도 걸려 트랙이 높이 40 · 테두리를 받았다 — `:not([type=range])` 를 :where 안에 더했다(명시도 그대로, audit 선택자도 같이). **패키지 CSS 의 줄인 모션 base 에 11-10 의 Spinner 예외가 빠져 있었다**(사이트만 돌고 패키지는 멈춤) — 사이트와 같게 하고 `sync-css.mjs` 가 막는다. 도는 Spinner 의 `getBoundingClientRect` 는 기울어진 상자라 크기는 offsetWidth 로 잰다. 줄인 모션 검사(behave.system)는 애니메이션 이름마다 길이를 보게 고쳤다(0s 인 ds-delay 는 움직임이 아니다).
- 음성 시험: 사이트 31건 · React 16건. 첫 회 1건을 못 잡아(DS.loading 을 보인 채 다시 시작하면 한 번 숨었다 나타남 — 400ms 뒤에만 쟀다) 다시 시작한 순간을 재게 고쳐 잡았다. 쓸모없는 코드 2건은 지웠다(`.number-field input[type=number]` 한정 — 트랙은 `.slider input[type=range]` 가 이미 이김, 트랙 onChange 의 setText — effect 가 따라감). render.js 의 ds.js 크기 150KB → 152KB. Figma 미반영 149건(그대로 — 새 예제 둘은 Figma 대조 밖).

2026-11-11 Data Table 행 펼침 — 1.0 뒤로 미뤘던 것을 앞당김(사람의 결정 넷) — behave 1123 → 1136(`behave.expand.js` 13) · react 667+6 → 682+6(`tests/row-expand.test.tsx` 14 · 예제 245 → 246 에 따른 구조 비교 1). contrast · advisory · pages 수는 그대로(새 색 쌍 없음). 열 표시 설정은 여전히 1.0 뒤.
- **맨 앞 셰브론 칸 · 여러 행 함께**(사람의 결정) — `th.expand`(숨긴 이름 '상세') · `td.expand > button.expand-btn[aria-expanded][aria-controls][aria-label]` 이 바로 뒤 `tr.row-detail[hidden] > td[colspan] > .row-detail-body` 를 연다. 행 클릭은 펼침에 쓰지 않는다. 사이트 `ds:row-expand {expanded}`(행 tr 에서 — Breadcrumb 의 `ds:expand` 와 이름을 나눔, 사람의 결정) · React `renderExpanded` · `expanded` · `defaultExpanded` · `onExpandedChange(set, {key, expanded})` · `expandable` · `expandLabel`.
- **정렬은 펼침을 남기고 페이지 · 필터 · 검색 · 기간은 접음**(사람의 결정) — 사이트 정렬 · `DS.table.removeRow` 가 상세 행을 함께 옮기고 지운다(마지막 행을 지우면 앞 행의 상세를 건너뛰어 앞 행으로). React 는 지금 rows 에 없는 키를 지우고(페이지 이동) `expandScope` 가 바뀌면 모두 접는다. 사이트의 필터 변경 접기는 제품 몫.
- **자유 자리 + 권장 구성**(사람의 결정) — 키-값 `.detail-meta`(dl) + 원본 로그 Code(`.wrap`), 불러오는 동안 그 자리에 Spinner. 상세 글자는 셰브론 뒤 첫 칸의 글자와 같은 선(56)에서 시작하고 회색 면(`--background-neutral-secondary`)이다.
- **사람이 정하지 않은 기본값:** React 는 접힌 행의 상세도 그려 둔다(사이트 마크업 · 구조 비교와 같게) — 불러와야 하는 내용은 `renderExpanded(row, {expanded})` 의 expanded 일 때만 돌려준다. 셰브론은 오른쪽 → 펼치면 아래(90° 회전, `--motion-fast`), 버튼 24 · hover 는 `--surface-neutral-strong`.
- **verify 더함:** 맨 앞 머리글 `th.expand` + 숨긴 이름, 버튼의 aria-expanded · aria-controls · aria-label, aria-controls 가 바로 뒤 `tr.row-detail`, 펼침 상태와 hidden 일치, colspan = 열 수.
- **측정에서 드러나 고친 것:** 셰브론 칸의 `padding-right:0` 이 `.tbl.compact td{padding:8px 16px}`(명시도 0,2,1)에 져 칸이 56 이 되고 상세 글자가 첫 칸과 24 어긋났다 — `th.expand` · `td.expand` 로 적어 이기게 했다(칸 40). 숨긴 상세 행도 `nth-child` 에 들어가 줄무늬가 어긋나고, 상세 행에 행 hover 가 칠해졌다 — `:where(:not(.row-detail))` 로 뺐다(명시도 그대로). React 의 행 위치 계산(`sectionRowIndex`)과 지운 뒤 포커스 복귀가 상세 행을 세고 있었다. **캡처에서 발견:** 사이트 셸의 `td code`(인라인 칩 면 · 12px)가 표 칸 안 Code 블록의 `pre code` 에 걸려 원본 로그가 줄마다 회색으로 칠해졌다 — `.code-view pre code` 로 되돌렸다(behave 단정 · 음성 시험으로 잡음).
- 음성 시험: 사이트 26건 · React 16건. 첫 회 2건을 못 잡았다 — 마지막 행 삭제 때 앞 상세 건너뛰기는 단정을 더해 잡았고, `.row-detail-body{contain:inline-size}` 는 재 보니 줄바꿈하는 Code 에도 · 긴 낱말에도 소용없어 지웠다. React 1건(`rowLabel` 기본 이름의 리팩터 되돌림)은 동작이 같은 변형이다. render.js 의 ds.js 크기 152KB → 154KB. Figma 미반영 149건(그대로 — 새 예제는 Figma 대조 밖).
- 같은 날 행 펼침 이벤트를 `ds:row-expand` 로 나눴다(사람의 결정 — Breadcrumb 의 `ds:expand` 와 같은 이름이라 문서 전체에서 듣는 제품이 둘 다 받았다).

2026-11-11 글자 크기 체계 A — 토큰화 + rem 전환(사람의 결정 셋: 토큰 + rem + 화면 폭 단계 · em 은 시스템 단위로 쓰지 않음 · 줄일 때 최소 글자 크기) — 게이트 수는 그대로. 화면 폭 단계(B)는 다음 커밋.
- **글자 크기 토큰** `--font-size-10 · 12 · 14 · 16 · 18 · 20 · 24 · 28 · 32 · 40 · 48`(rem). 12 이하는 `max(0.75rem,12px)` 처럼 최소 크기를 지킨다. 줄 높이는 토큰 없이 rem(18 이하는 같은 max). 색 토큰이 아니라 수 94 는 그대로(`verify` 의 `isScalar` 가 `--font-` 를 이미 받는다).
- **크기 · 간격은 전부 rem** — `style.src.css` 의 px 930곳(간격 토큰 · padding · gap · 높이 · 폭 · 반경 · 위치)과 `font-size` 251곳(토큰 236 · 단계 밖 15), `icons-css.js` 가 써 넣는 글리프 26곳, 패키지 `.ds-root` 기본 글자, React Pagination 인라인 gap. **px 그대로:** 테두리 · 외곽선 · 그림자 · 밑줄 · stroke · filter, 2px 이하, `--radius-full`, 미디어 쿼리.
- **변화 0 을 픽셀로 쟀다** — 74페이지 × 라이트 · 다크를 1440 에서 전후 캡처(코드 패널 글자는 숨김 — CSS 글자가 바뀌므로). 다른 것은 Design Token 코드 패널에 토큰 줄이 늘어난 것 하나, 그리고 대시보드 1장(같은 빌드를 5번 찍어도 2가지 결과가 나오는 캡처 잡음).
- **읽는 쪽을 한 곳에서** — `lib.js toPx()`(rem · `max()` · 글자 크기 토큰 → 기준 화면 px). Figma audit 의 `read()` 가 CSS 파일을 이것으로 풀어 읽고(끄면 어긋남 150 → 286), 문서의 토큰 값 표시(`foundations.js vars()`)도 쓴다.
- **verify 더함:** 크기 속성의 px(2 초과) 금지, 컴포넌트 블록의 `font-size` 는 `var(--font-size-N)` · `inherit` 만 — 예외는 인라인 코드의 `.9em`(둘레 글자를 따라감)과 단계 밖 13px 셋(Date Picker 달력 · Breadcrumb · Code — C 에서 사람이 정함). 사이트 셸의 9 · 11 · 15px 은 rem 그대로.
- **측정에서 드러나 고친 것:** Design Token 페이지가 반경 토큰을 px 로 읽어 'sm 0' · `border-radius:0px` 를 그렸고 Grid 페이지는 간격 토큰 이름을 잃었다(`vars()` 에 `toPx`). behave 의 패턴 반경 검사가 토큰 글자를 parseFloat 해 0.375 로 읽었다(탐침 요소의 계산값으로). verify 새 검사가 처음에 주석인 블록 표식을 지운 글에서 찾아 글자 크기 검사가 아무것도 보지 않았다(음성 시험으로 발견).
- 음성 시험: verify 6건(px 글자 · 없는 토큰 · 토큰 대신 rem · 간격 토큰 px · 글리프 px · 블록 표식) · audit 1건. Figma 미반영 149건(그대로).

2026-11-11 글자 크기 체계 B — 화면 폭 단계 — behave 1136 → 1141(`behave.scale.js` 5) · react 682+6 → 683+6(`theme.test.ts` 1). contrast · advisory · pages 수는 그대로.
- **단계**(사람의 결정) — 루트 글꼴 크기 ~1279 93.75% · 1280~1919 100%(기준 — Figma) · 1920~ 106.25% · 2560~ 112.5%. % 로 적어 브라우저 글꼴 설정을 따른다. 원본은 `style.src.css` 의 `ds:scale` 블록 하나 — 패키지는 선택 파일 `dist/scale.css`(`@jiran/ds-react/scale.css`)로 내고(html 은 제품의 것), Typography 페이지의 표 · 코드도 이 블록에서 읽는다.
- **잰 값** — 본문 14 → 13.125 · 14 · 14.875 · 15.75, 버튼 md 40 → 37.5 · 40 · 42.5 · 45, 12 · 10px 글자는 1100 에서 그대로(최소 크기), 2560 에서 13.5 · 11.25.
- **아이콘** — 크기가 HTML 의 width 속성이라 rem 을 몰랐다. `ds:icons` 블록의 `:where(svg[width="N"])`(10 ~ 48, 명시도 0 — 컴포넌트가 정한 크기가 이김, 12 이하는 최소 크기)이 같은 값을 rem 으로 준다. 패키지 base 에도 들어간다.
- **탐색형 차트** — 캔버스라 `ds-chart` 가 루트 비율을 곱한다(글자는 최소 12 · 범례 · 툴팁 · 눈금 여백 · 도넛 가운데 글자). 가운데 글자는 상수 `CENTER_FONT` 로 옮겼고 audit 이 그것을 읽는다. 창 크기가 바뀌어 단계가 넘어가면 다시 칠한다.
- **React** — `checkRootFontSize`: 루트가 12px 미만(예: `html{font-size:62.5%}`)이면 개발 모드에서 한 번 경고(Icon 이 부름). 브라우저 글꼴을 키운 20px 같은 값은 정상이라 조용하다(단계 표 밖이라고 알리면 접근성 설정을 쓰는 사람에게 거짓 경고). MIGRATION.
- **넘침** — 패턴 정렬 · 넘침 검사(behave.system)를 1440 · 1024 · 768 에 1920 · 2560 을 더해 다섯 폭으로, 컴포넌트 예제 미리보기 넘침을 1100 · 2560 에서 새로 잰다. 둘 다 0 이었다. 1024 · 768 에서 px 를 단정하던 기존 검사 중 고쳐야 한 것은 0 개다.
- 문서: Foundations › Typography 에 Size units 절(단계 표 · 최소 크기 · em 을 쓰지 않는 이유 · px 로 남기는 것 · React).
- **보지 못한 것:** 브라우저 기본 글꼴 크기를 바꾼 상태(Playwright 로 바꾸기 어려움 — 사람이 Chrome 설정에서 한 번 볼 것). 2560 의 소수 px(42.5 등) 선 흐림은 캡처로 보았고 테두리가 px 라 그대로다.
- **이미 있던 것(이번에 바꾸지 않음):** 대시보드 패턴의 KPI 넷이 1440 이상에서 3 + 1 로 줄바꿈한다 — 1440 전후 픽셀이 같으므로 전부터 그랬다.
- 음성 시험: 사이트 11건(최소 크기 · 단계 둘 · 아이콘 규칙 · :where 명시도 · 넘침 · 차트 셋 · 패키지 scale 블록) · React 1건. 첫 회 2건을 못 잡았다 — 아이콘 단정의 '제품 CSS' 가 사이트 CSS 뒤에 붙어 명시도와 무관하게 이겼고(앞에 붙임), 넘침 변형 40rem 은 2560 에서 720 이라 실제로 넘치지 않았다(80rem 으로 잡음). Figma 미반영 149건(그대로).

2026-11-11 글자 크기 체계 C — 단계 밖 13px 셋을 단계로(사람의 결정, 12 · 13 · 14 나란히 캡처를 보고) — 게이트 수는 그대로(기존 단정 둘의 기대값만 고침).
- **Date Picker 달력 14**(11-09 의 13), **Breadcrumb 14/22 = Body 2**(11-02 의 13), **Code 블록 12/20**(고정폭은 같은 크기에서 커 보인다 — 줄 높이도 `max(1.25rem,20px)` 로 최소 크기).
  달력 폭 296 · 칸 34 · Breadcrumb 행 높이 24 는 그대로이고 1100 · 2560 넘침 검사도 0 이다.
- verify 의 `FONT_STRAY` 에서 `0.8125rem` 을 지웠다 — 이제 컴포넌트 `font-size` 예외는 인라인 코드 `.9em` 하나(되돌리면 verify 실패, 음성 시험). 사이트 셸의 9 · 11 · 13 · 15 는 문서 화면 전용이라 rem 그대로.
- behave 기대값: 달력 글자 13 → 14(behave.dp), 행 펼침 원본 로그 13 → 12(behave.expand). Spec 문구 Breadcrumb Label · Code Body.
- Figma 미반영 149 → 165건 — Breadcrumb 글자 13/22 ≠ 14/22 15 · Spec 문구 1. 일괄 반영 때 Breadcrumb 글자를 Body 2 스타일에 묶는다(audit 메시지에 적음). 달력 · Code 글자는 audit 대조 밖.

2026-11-11 대시보드 KPI 넷을 한 줄로(사람의 요청 · 결정) — behave 1141 → 1142(`behave.scale.js` 1). contrast · react 수는 그대로.
- 1280 이상에서 문서 본문이 758 이라 4열 한 칸이 177.5 인데 '1,247 / 1,284' 가 패딩 24 로 181 이 필요해 3 + 1 로 줄바꿈했다(B 에서 적어 둔 '이미 있던 것').
- **격자 안 KPI 는 좌우 패딩 20**(사람의 결정 — 예제 값을 줄이는 안 대신) · `.kpi-grid` 칸 최소 180 → 176 · 격자 안에서 카드 최소 폭 0. 격자 밖 KPI 는 24 · 180 그대로.
  1024 · 1280 · 1440 · 1920 · 2560 에서 넷이 한 줄이고 가장 긴 줄도 5px 이상 남는다. Data Visual 예제의 KPI 도 격자 안이라 20 이 된다.
- 단정은 한 줄인지와 값 · 단위 · 증감이 카드 안쪽 폭에 드는지를 함께 잰다. 음성 시험 2건(규칙 지움 · 패딩만 24 로) 모두 실패로 잡혔다 — 칸만 좁히면 넷이 한 줄이어도 값이 카드 밖으로 3px 나간다.
- 덤으로 고친 문서: 대시보드 원칙 '밀도' 의 '카드 gap 20' 은 실제 16 이었다(kpi-grid · row-3 · stack 모두 1rem). Data Visual Spec Container 에 KPI 패딩 · 칸 최소를 적었다.
- Figma 미반영 165 → 166건(Spec 문구 1). Figma 의 KPI 카드 패딩 24 는 audit 대조 밖이라 수에 없다 — 일괄 반영 때 대시보드 · 예제 KPI 패딩을 20 으로.

2026-11-11 심각도 Medium ↔ Low 색 교체(사람의 결정) — Medium = `--foreground-accent-light-blue`, Low = `--foreground-accent-lime`(태그 틴트 · solid 테두리 · 점 · 막대 · 범례 · 밴드 · 행 막대 · 정적 도넛 · ds-chart TONES · React Donut 같이). 게이트 수는 그대로.
- **근거(실측):** 도넛 · 누적 막대에서 맞붙는 이웃 등급의 최소 CIEDE2000 이 라이트 0.3 → 10.6 · 다크 4.3 → 11.5 — 옛 배치에서는 High 주황과 Medium 라임이 적록 색각(protan)에서 같은 색이었다. 라이트 Medium 지표가 3:1 을 넘는다(2.90 → 3.68).
  주황 ↔ 라임 쌍 자체(이제 High ↔ Low)는 그대로라 라벨 병기 규칙이 계속 대신 갈라 준다. 잃은 것: 빨강 → 주황 → 라임 → 파랑 의 따뜻한 → 차가운 순서.
- **초록은 쓰지 않았다(사람의 결정)** — 시스템에 초록 강조색이 없어 '정상 · 성공' 의 positive 초록을 그대로 쓰게 되고(Low 이벤트가 정상으로 읽힘), 라이트 대비 2.46 으로 라임 2.90 보다 낮으며 색각 분리 이득이 없었다.
- `lime-40`(11-09 DEVIATIONS)은 값 그대로 Low 로 옮겼다. `contrast.pairs` 의 3:1 예외(REF)가 Medium 지표에서 Low 지표로 옮겨 advisory 수는 같다. `severityRanks` 순서도 바꿨다.
- 음성 시험: 사이트 범례 Medium 하나를 되돌리면 behave 1140/1142(라이트 · 다크), React Donut 토큰 하나를 되돌리면 data.test 1건 실패.
- Figma 미반영 166 → 213건 — 심각도 견본 · 도넛 호 · 차트 · 분포 밴드가 옛 배치(Figma 는 Medium 이 아직 11-06 의 lime-opaque).

2026-11-11 Tag 글자 = 같은 색상의 진한 톤 · 점은 선택 · `.sev-cell` 없앰(사람의 요청 · 결정 둘) — contrast 1218 → 1398 · behave 1142 → 1156 · react 683 → 686. advisory · pages 수는 그대로.
- **토큰 6개를 더했다**(`ADDITIONS`, 이름은 사람의 결정 — primary < strong < heavy 문법): `--foreground-negative-heavy` · `cautionary-heavy` · `accent-light-blue-heavy` · `accent-lime-heavy` · `accent-cyan-heavy` · `positive-heavy`.
  라이트 30 단계(lime 만 20 — 30 이 틴트 위 4.42) · 다크 60 단계(red 만 70 — 60 은 Critical solid 의 강한 면 위 4.08). 참조의 foreground 는 strong 까지라 12% 틴트 위 4.5 를 넘는 단계가 없었다(negative-strong 도 3.68).
  info 글자는 `--foreground-neutral-secondary`, accent 는 `--foreground-brand-primary`(둘 다 기존 쌍). 시멘틱 79 → 85 · 전체 94 → 100. Colors 페이지에 Heavy 스와치.
- **점은 기본에서 뺐다** — `.tag::before` 는 `display:none`, `.tag.dot` 이면 등급 색 점. `.plain` 은 없앴다(verify 가 예제의 Tag `.plain` 을 막음). React `dot` prop, `variant="plain"` 은 경고하고 subtle 로(MIGRATION). 사이트 셸의 Props 표 태그도 `.plain` 을 뗐다(이름 칸 글자가 positive-heavy 가 됨).
- **`.sev-cell`(행 좌측 3px 막대 + 글자)을 통째로 없앴다**(사람의 결정 — Tag 글자가 색을 나르므로 겹친 정보). 심각도 패턴의 스케일 셋째 줄과 표의 막대를 지우고 표는 Tag 하나로. verify 가 `.sev-cell` 을 막는다. React `SevCell` 은 한 번 경고하고 막대 없이 내용만 그린다.
- contrast +180 = 새 글자 쌍 234(Critical 은 틴트 · 강한 면 각 3 합성 + 바탕 3 = 9, 다섯 톤은 틴트 3 + 바탕 3 = 6 × 5 → 39 × 맥락 6) − 옛 중립 글자 / 틴트 쌍 54. behave +14 = 테마마다 outline 글자 AA 6 · 등급마다 다른 글자색 1(옛 '색은 점이 나른다' 단정 6 은 '글자 = heavy · 점은 .dot 일 때만' 으로 고침). react +3(dot 클래스 · plain 경고 · SevCell 경고).
- 음성 시험: Medium 글자색을 지우면 behave 1154/1156 · contrast advisory +1, 점을 기본으로 되돌리면 behave 1143/1156, 예제에 `.sev-cell` · `.plain` 을 넣으면 verify 실패(둘 다 · 복사용 CSS 의 `.plain` 규칙도).
- audit 의 정적 심각도 색 대조에서 `.sev-cell i` 를 뺐다. Figma 미반영 213 → 215건 — 저장소에만 있는 heavy 토큰 6 · Tag Spec Label 문구 1. Figma 의 Tag 변형은 아직 점 있음 · 중립 글자다(audit 대조 밖 — 일괄 반영 때 글자를 heavy 에 묶고 점을 뺀다).

2026-11-11 칩 지우기(x)는 면 없이 x 만(사람의 요청) — behave 1156 → 1158. contrast · react 수는 그대로(x 글리프는 글자 쌍 밖).
- `.chip .x` 의 회색 원 면(`--surface-neutral-strong` · hover `--line-neutral-primary`)을 지우고 hover 는 글자색 `--foreground-neutral-secondary` → `primary` 로. 크기 16 · 아이콘 10 · 반경(포커스 외곽선 모양)은 그대로.
  같은 `.chip.sm > .x` 를 쓰는 Input Chip · 필터 칩 행(검색 · 로그 뷰어 패턴) · Combobox 다중 선택 항목(사이트 ds.js · React `Chip`)이 함께 바뀐다. Tag 에는 x 가 없다.
- behave +2(Input Chip · Combobox 다중 항목의 x — 쉴 때 · hover 의 면 투명과 글자색). 음성 시험: 면을 되돌리면 두 단정 모두 실패(1156/1158). Chip Spec 에 Remove 행.
- audit 의 Chip 삭제 기대값이 면 없음('-')을 받게 고쳤다. Figma 미반영 215 → 222건(Input 변형 6개의 x 면 · Spec Remove 행).

2026-11-11 Date Picker 오늘 글자 = brand(사람의 요청) — 게이트 수는 그대로(기존 단정의 기대값만 고침).
- `.calendar .day.today` 의 글자를 `--foreground-neutral-primary` → `--foreground-brand-primary`(굵기 700 · 옅은 brand 원은 그대로). 11-09 의 '원 위 글자는 기본 색' 결정을 바꿨다.
  다크 원 위 3.87 은 이미 REF 로 선언된 쌍(`brand-primary` / `brand-subtle-strong` — 기간 띠 안의 오늘)이라 contrast · advisory 수가 같다. 띠 안 오늘만 brand 로 바꾸던 규칙은 지웠다(이제 늘 brand).
- behave 의 원 단정이 오늘 글자 = brand 를 잰다. 음성 시험: 기본 글자로 되돌리면 그 단정과 띠 안 오늘 단정이 실패.
- Figma 미반영 222 → 221건 — Figma 의 오늘 글자는 원래 brand 였다.

2026-11-11 Select Button outline 선택 라인 · Outline Solid(사람의 요청 · 결정) — behave 1158 → 1160 · react 686 → 688(choice-controls 1 · 예제 246 → 247 에 따른 구조 비교 1). contrast · advisory 수는 그대로(새 색 쌍 없음 — 흰 글자 / 제품 색 · brand 글자 / brand subtle 은 기존 쌍).
- **outline 의 고른 버튼은 네 변이 brand 선** — 묶음 테두리 + 칸 구분선이던 것을 버튼마다 테두리 + 1px 겹침으로 바꿨다(높이 38 · 폭 그대로). 고른 버튼이 z-index 1 로 이웃 선을 덮는다.
  선 색은 Chip 선택과 같은 불투명 `--surface-brand-primary` — `--line-brand-*` 는 반투명(28 · 43%)이라 옅다. 선 토큰이 모두 반투명이라 겹친 칸을 두 번 칠하면 진해져, 뒤 버튼의 왼쪽 선은 투명으로 둔다.
- **Outline Solid**(사람의 결정 — outline 틀에만) — `.select-btn.outline.solid` · React `solid`(outline 없이 쓰면 경고하고 무시). 고른 버튼 = `--surface-brand-primary` 면 + `--brand-label` 글자. verify 가 outline 없는 `.solid` 를 막는다.
- behave +2(outline 고른 버튼의 네 변 · 면 · 글자 · 칸 선 한 겹 · 1px 겹침 · 높이 38, solid 면 · 글자 · 고른 것을 옮기면 따라감). 음성 시험 셋(brand 선 · 칸 선 투명 · solid 규칙 지우기) 모두 실패로 잡혔다 — 칸 선은 버튼 셋인 Solid 예제가 잡는다(Outline 예제는 둘이라 고르지 않은 이웃 칸이 없다).
- Spec Size · Container 문구를 실제 구조로, Selected 행을 더했다. Figma 미반영 221 → 222건(Spec Selected 행). Figma 의 outline 고른 버튼 선 · Solid 변형은 audit 대조 밖 — 일괄 반영 때 그린다.

2026-11-11 Table · Data Table 최적화 — 테두리 없는 표 + 참고 글의 구성(사람의 요청 · 결정 넷, 참고 외부 글 = 외부 글) — contrast 1398 → 1434 · behave 1160 → 1170(`behave.table.js` 10) · react 688 → 700(`tests/table-optimize.test.tsx` 6 · 예제 247 → 253 에 따른 구조 비교 6). advisory · pages 수는 그대로.
- **표를 감싸는 테두리 · radius · 면을 없앴다**(사람의 요청) — `.tbl-wrap` 은 가로 스크롤만. 위 경계 = 회색 헤더 면, 아래 경계 = **마지막 행 아래 선**(사람의 결정 — 전에는 테두리가 대신해 지워 두었다). `.plain` · 빈 상태 칸은 선 없음. 사이트 셸의 문서 표 규칙 `tbody tr:last-child td{border-bottom:0}` 이 컴포넌트 표에도 걸려 있어 `table:not(.tbl)` 로 좁혔다. Card flush 의 '이중 테두리' 설명을 '카드 패딩 없이 붙일 때' 로.
- **밀도 세 단계 40 · 48 · 56**(사람의 결정) — 기본 52 → 48 · `.compact` 44 → 40 · 새 `.relaxed` 56, 헤더 44 · 40 · 48(전에는 compact 헤더가 CSS 40 · Spec 44 로 어긋났다). React `density`(기존 `compact` 도 받음). 밀도 전환 예제 — 사이트 `.select-btn[data-density-for="표 id"]` + `button[data-density]`(ds.js), 고른 밀도의 기억은 제품 몫.
- **행 스타일 넷**(사람의 결정 — Grid · Free form 을 더함) — 가로선(기본) · `.zebra` · `.grid`(칸 사이 세로선, 마지막 칸 없음) · `.plain`(선 없음 — 5행 안팎 요약). React `rowStyle`(기존 `zebra` 도 받음). verify 가 `.plain` + `.zebra`/`.grid` · `.compact` + `.relaxed` 를 막는다.
- **구성 넷**(사람의 결정) — 하위 텍스트 `td > .cell-sub`(12/16 secondary, 칸 위아래 패딩 8 이라 두 줄이 relaxed 56 에 든다) · 첫 열 고정 `.tbl-wrap.sticky-col`(맨 앞 체크 · 펼침 칸과 첫 열, 불투명 면 `--tbl-surface` 위에 행 상태 면 `--tbl-tint` 를 겹침 · 오른쪽 선 · tabindex + 이름은 verify) · 합계 행 `tfoot tr.total`(회색 면 · 600 · 위 선 `--line-neutral-primary`) · 밀도 전환. React `TableFoot` · `TableRow total` · `TableCell sub` · DataTable `stickyColumn` · `summaryRow` · column `sub`.
- **글에서 함께 가져온 것** — 숫자 tabular 를 표 전체로(`.num` 은 오른쪽 정렬만, 크기를 견주는 숫자에만 — 예제 · 패턴의 `.num` 을 세어 보니 전부 건수 · % · 그 머리글이라 고칠 것이 없었다). **가져오지 않은 것:** hover 때만 보이는 행 동작(키보드로 못 찾음 — 글도 단점으로 적음), 열 추가 · 순서 · 너비(열 표시 설정은 1.0 뒤 다시 묻기로 함), 복합 필터 저장, 셀 배경 추세 표시(상태색과 겹침).
- contrast +36(하위 텍스트 secondary / 행 hover · 선택 면 2 × 바탕 3 × 맥락 6). **기존 단정 고침 2:** 로딩 행 높이 52 → 48 · 말줄임 칸 44 → 40(behave.data).
- **측정에서 드러나 고친 것:** 고정 열의 칸별 `left` 가 위치 규칙의 `:is(…)`(가장 센 인자의 명시도 0,3,0)에 져 체크 칸과 첫 열이 같은 0 에 붙었다 — 위치 규칙을 `:where` 로. 하위 텍스트 행이 71.4 로 커졌다(칸 패딩 12 + 두 줄) — `td:has(> .cell-sub)` 패딩 8. 고정 열 예제의 표 폭을 인라인 `min-width:1040px` 대신 CSS `width:max-content` + nowrap 으로(복사한 HTML 에 수치가 남지 않게).
- 음성 시험 17건(테두리 · 마지막 행 선 · 고정폭 · compact · relaxed · grid · plain · 하위 패딩 · 하위 색 · 고정 left · 고정 면 · 합계 면 · 합계 선 · 밀도 전환 ds.js · verify 조합 셋) 모두 실패로 잡혔다 — plain 을 지우면 복사용 CSS 검사도 잡는다. 표 단정만 도는 임시 실행기로 쟀다(전체 게이트는 한 건에 10분).
- **이미 있던 것(이번에 바꾸지 않음):** 로그 뷰어 표의 단말 열이 'PC-/2041' 로 줄바꿈한다 — HEAD 빌드에서도 행 62 · 열 폭이 같다.
- Figma 미반영 222 → 226건(커밋 13cd65f 메시지의 227 은 게이트가 사이트를 다시 짓는 도중에 audit 을 돌려 하나 더 센 값 — 2026-11-12 에 그 커밋을 따로 꺼낸 사본에서 다시 재면 226)(Data Table Spec Size · Container · Label, Table Spec Size · Container). Figma 의 표는 테두리 · radius · 52 행 그대로다 — 일괄 반영 때 테두리를 지우고 마지막 행 선 · 세 밀도 · Grid · Plain · 고정 열 · 합계 행을 그린다.

2026-11-12 표 안의 brand 덜기 · 늘 있는 액션 바(사람의 요청 둘 · 결정 넷) — behave 1170 → 1177(`behave.table.js` 7) · react 700 → 702(`tests/table-optimize.test.tsx` 2). contrast · advisory · pages 수는 그대로(정렬 머리글 neutral-primary / 헤더 면 · 칸 글자색은 기존 쌍).
- **정렬된 머리글 = `--foreground-neutral-primary` + 진한 화살표**(사람의 결정 — brand 대신 진한 중립. 다른 머리글은 tertiary). **칸 링크 = 칸 글자색**(`color:inherit`) · 500 · hover 밑줄(사람의 결정). Link 페이지의 '표의 .link 도 같은 모양' 설명과 Spec Label 을 고쳤다.
- **선택 표의 액션 바는 늘 표 위에**(사람의 결정 — '늘 표 위에 둠 + 고정 헤더 표에서는 스크롤해도 맨 위') · **면 없음**. 0개면 '0개 선택' + 버튼 `aria-disabled`(사람의 결정 — 포커스는 남고 누르면 아무 일 없음, 고르면 바로 켜짐).
  사이트 ds.js `barOff` 가 `data-ds-off` 표식과 함께 달고 풀며, 제품이 직접 단 `aria-disabled` 는 건드리지 않는다. 처음 그릴 때(`DS.init`)도 잰다. React 는 `ActionBar count={0}` 이 안의 `Button` 을 끈다(내부 `ButtonOffContext`, 제품의 `disabled` 는 그대로), `DataTable actionBar` 는 선택이 없어도 부른다.
  고정 헤더 표(`.sticky`)에서 붙어 있는 바는 아래로 지나가는 행이 비치지 않게 놓인 자리의 면(`--tbl-surface`, 카드 · 패널 · 팝업 안은 elevated)을 칠한다.
- **기존 단정 고침 3:** 머리글로 모두 풀면 '바 숨김' → '0개 선택 · 버튼 꺼짐'(behave), 선택 해제 후 '바 숨김' → '0개'(behave.data), 고정 헤더 위 바에 불투명 면(behave.data).
- **측정에서 드러나 지운 것:** 0개일 때 키보드 클릭을 막으려 더한 캡처 리스너는 음성 시험에서 지워도 통과했다 — ds.js 에 이미 `.btn[aria-disabled="true"]` 클릭을 캡처에서 막는 규칙(10-28 Button)이 있었다. 제품이 `disabled` 로 끈 버튼을 건너뛰는 조건도 결과가 같아 지웠다(aria-disabled 를 달았다 풀어도 disabled 는 남음).
- 음성 시험: 사이트 7건(정렬 색 · 링크 색 · 바 면 · 바 숨김으로 되돌림 · 제품 aria-disabled 보존 · 처음 그릴 때 · 고정 바 면) · React 5건(Provider · 늘 부름 · 클릭 차단 · 제품 disabled · aria-disabled) 모두 실패로 잡혔다.
- 바의 'n개 선택' 글자는 brand 그대로다(요청 밖). Figma 미반영 226건(그대로 — Data Table Spec Label 문구가 바뀌었을 뿐 이미 어긋난 행).

2026-11-12 Button 오류 정리 · 32 높이 반경(사람의 요청 — 'sm 반경을 sm 으로 · 버튼 시스템 오류 검토', 결정 넷) — behave 1177 → 1185(`behave.button.js` 7 · behave.js 1 · 기존 단정 고침 1) · react 702 → 703(`Button.test` 1). contrast · advisory · pages 수는 그대로(스피너는 글자 쌍 밖).
- **sm 버튼 반경 6 → 4**(radius/sm) — md · lg 는 6. **같은 32 높이 컨트롤도 4**(사람의 결정): `.field.sm` 입력 · affix(Date Picker · Number Input · 비밀번호) · 그 안 28 버튼 · Combobox sm · Select Button 안쪽 버튼(하드코딩 0.375rem 이던 것) · 페이지당 행 수 Select. 필드 안 28 버튼의 하드코딩 0.375rem 은 토큰으로(값 같음).
- **버그 셋(사람의 결정 — 셋 다)** — ① 정보 Banner 안 버튼 규칙(명시도 0,4,0)이 `.btn.loading` 의 투명 라벨과 `.btn[disabled]` 를 이겨 loading 중 라벨이 스피너와 겹쳐 보이고 끈 버튼이 흰 글자로 남았다 — `:where` 안에서 loading · 끈 상태를 뺐고, 포커스 링(currentColor)이 사라지던 loading · aria-disabled 에 Banner 라벨 색 링. ② 끈 버튼의 `pointer-events:none` 이 클릭을 뒤의 행 · 카드로 떨어뜨렸다(elementFromPoint = 부모, 부모 클릭 1) — 지웠다. disabled 는 브라우저가, aria-disabled 는 기존 ds.js 캡처 가드가 막는다. ③ 스피너가 의사 요소라 `*` 의 border-box 를 받지 않아 16 + 테두리 4 = 20 이었다 — **아이콘 크기 sm 16 · md 18 · lg 20**(사람의 결정).
- **작은 것 넷(사람의 결정)** — loading · 끈 버튼은 hover · 눌림 색 없음(22개 규칙에 `:where(:not(.loading,[disabled],[aria-disabled="true"]))`, 명시도 그대로), assistive 스피너 `--surface-brand-primary` → `--foreground-brand-primary`(다크 투명 바탕 3.53 · solid assistive 3.02 였다), React `<Button aria-disabled="true">` 가 rest 로 extra 를 덮어 클릭이 그대로 불리던 것을 막음, 문서 어긋남(Props 기본값은 React 의 것 · HTML 은 클래스를 늘 적음, Size 예제의 '빈 화면은 Large' → 실제 Medium, loading 키 처리의 사이트 · React 차이, Spec 스피너 크기 · Banner 포커스 예외).
- **기존 단정 고침 1:** '비활성 링크 버튼' 의 `pointerEvents === "none"` → `"auto"`(클릭 차단은 다음 단정이 잰다).
- 음성 시험: 사이트 10건(pointer-events 되돌림 · hover · active LIVE 없음 · 스피너 box-sizing · lg 크기 · assistive 면 토큰 · sm affix · Select Button 6 · Banner loading 라벨 · Banner 링) · React 1건 모두 실패로 잡혔다. 단정을 처음 쓸 때 Banner 끈 outline 버튼의 기대값을 '회색 면' 으로 잘못 적었다 — outline 비활성은 원래 면 없음 + 회색 테두리라 단정을 고쳤다.
- **보이는 것(캡처):** 정보 Banner 안 끈 outline 버튼은 회색 라벨(16%)이 제품 색 면 위에서 거의 보이지 않는다 — 시스템의 outline 비활성 표현 그대로라 고치지 않았다.
- **고치지 않은 것:** `.chip[disabled]` · `.tile[disabled]` · `.pagination button[disabled]` · `.menu-item[aria-disabled]` 에도 같은 `pointer-events:none` 이 있다(요청 밖).
- Figma 미반영 226 → 282건 — loading 스피너 크기 16 ≠ 18 · 20 과 assistive 스피너 색 52 · Spec 문구 4(이번에 고친 Button State · Size · Container · Text Field Container · Select Button Container 다섯 행 중 새로 어긋난 것). sm 버튼 · 필드의 반경 4 는 audit 대조 밖 — 일괄 반영 때 함께 바꾼다.

2026-11-12 끈 컨트롤 클릭 · Banner 안 비활성 금지(위 Button 정리에서 남긴 둘, 사람의 결정) — behave 1185 → 1186(`behave.button.js` 1) · react 703 → 706(`tests/disabled-controls.test.tsx` 3). contrast · advisory · pages 수는 그대로.
- **끈 Chip · Tile · Pagination 버튼 · 메뉴 항목의 `pointer-events:none` 을 지웠다** — 버튼과 같은 이유(클릭이 뒤의 행 · 카드로 떨어짐)에 더해 `cursor:not-allowed` 가 한 번도 보이지 않던 죽은 선언이었다.
  button 은 브라우저의 `disabled` 가, span 칩 · 메뉴 항목(li · 링크)은 ds.js 의 `.btn[aria-disabled]` 클릭 캡처에 더한 두 선택자가 막는다(제품 핸들러 · 부모 · 링크 이동 없음).
  hover · 눌림은 메뉴 항목 · Pagination · Tile 에서 `:where(:not(…))` 로 뺐다(명시도 그대로 — audit 의 메뉴 hover 조회도 새 선택자로). React `MenuItem disabled` 는 전에 제품 `onClick` 을 먼저 불렀다 — 이제 부르지 않고 부모로도 올리지 않으며, 입력값 칩(span)은 클릭을 캡처에서 삼킨다(MIGRATION).
- **Banner 안 버튼은 끄지 않는다**(사람의 결정 — '전용 비활성 색'(라벨 50% · 2.25) · '그대로' 대신). 제품 색 면 위의 비활성 글자는 1.32 였다. Notification 원칙 'Banner' 행 · Button Spec State 에 적고 verify 가 예제를 막으며, React `Banner` 는 `action` 안 끈 버튼에 개발 모드 경고 한 번.
  만일 끈 버튼이 들어와도 보이는 모양(outline 비활성 · Banner 라벨 색 링)은 앞 커밋의 CSS 를 그대로 둔다(behave.button 의 Banner 단정도 그대로).
- 음성 시험: 사이트 11건 · verify 1건 · React 4건. 첫 회 2건(칩 hover · 눌림에서 끈 칩 빼기)을 못 잡아 재 보니 `.chip[disabled]` 가 뒤에서 면 색을 이미 이기는 쓸모없는 선언이라 지웠다(칩은 hover 가 면만 바꾼다). Tile 은 hover 그림자가 끈 규칙에 없어 필요했다.
- **남긴 것:** `.accordion.disabled{pointer-events:none}`(summary 는 tabindex -1 + ds.js 가 막고 behave 가 none 을 단정 — 요청 밖), `.tbl tr.disabled .link`(행이 `inert` 라 마우스 · 키보드 모두 닿지 않음).
- Figma 미반영 282건(그대로).

2026-11-12 끈 Accordion · 표의 비활성 행(앞 항목에서 남긴 둘, 사람의 요청) — behave 1186 → 1188(`behave.button.js` 2 · behave.js 기존 단정 고침 2) · react 706 → 707(`disabled-controls.test` 1 · `data.test` 기존 단정 고침 1). contrast · advisory · pages 수는 그대로.
- **측정에서 드러난 것:** 끈 Accordion 헤더를 누르면 클릭이 예제 틀(뒤의 카드 · 패널)에 갔고, 비활성 행의 링크 · 칸을 누르면 `inert` 때문에 표(`TABLE.tbl`)가 받았다 — `inert` 요소는 클릭 대상이 되지 않아 뒤로 떨어진다. 둘 다 not-allowed 커서도 보이지 않았다.
  `inert` 는 행의 글자까지 보조기기에서 지워 스크린 리더가 비활성 행의 데이터를 읽지 못했다.
- **Accordion** — `.accordion.disabled{pointer-events:none}` 을 지우고 헤더에 not-allowed · hover 면은 `:where(:not(.disabled))` 로 뺐다(audit 의 hover 조회도 새 선택자로).
  펼침은 ds.js 캡처 가드에 `.accordion.disabled summary` 를 더해 막는다(부모로도 안 감 — 옛 버블 분기는 지움). React 는 원래 캡처에서 삼켰다. 커서 규칙을 `.accordion.disabled>summary` 로 쓴 것은 audit 의 `cssRule(".accordion.disabled summary")` 가 글자색 규칙 대신 이 규칙을 집어 'Accordion 기대값을 읽지 못함' 이 났기 때문이다.
- **비활성 행 = `aria-disabled="true"`(inert 금지)** — 안의 링크 · 버튼은 `tabindex="-1"` + `aria-disabled`(Tab 에서 빠짐), 클릭은 ds.js 캡처 가드의 `.tbl tr.disabled` 가 막는다. 행 hover 면 · 칸 링크 밑줄은 `:where(:not(.disabled))` 로 빼고 칸 · 링크에 not-allowed.
  verify 가 `tr.disabled` 의 inert · aria-disabled 없음 · 안의 tabindex 없는 링크 · 버튼을 막는다. React `TableRow disabled` 는 inert 대신 aria-disabled 를 달고 렌더마다 안의 포커스 요소에 tabindex -1 · aria-disabled 를 주며(원래 tabindex 는 `data-ds-off` 에 — 켜면 되돌림) 클릭을 캡처에서 삼킨다.
  DataTable 의 행 삭제 후 포커스 대상(`FOCUS_IN_ROW`)은 tabindex -1 을 건너뛴다 — inert 일 때 focus() 가 안 되던 것과 같게(따로 재는 단정은 없다).
- 음성 시험: 사이트 9건 · verify 2건 · React 4건 모두 잡혔다. 전체 게이트에서 옛 React 단정(`data.test` 의 '비활성 행은 inert')이 걸려 새 동작으로 고쳤다.
- 이제 컴포넌트 CSS 의 `pointer-events:none` 은 장식(문서 셸의 막대 테두리 · 개요 카드 썸네일 · Tooltip)뿐이다. Figma 미반영 282건(그대로).

2026-11-12 남은 것 정리 다섯(사람의 결정 — 선택지로 고름) — behave 1188 → 1197(`behave.cells.js` 9) · react 707+6 → 709+6(`table-optimize.test` 1 · `data-bundle.test` 1, 기존 title 단정 고침 1). contrast · advisory · pages 수는 그대로.
- **말줄임 칸 · 아바타의 title → Tooltip** — `td.truncate` 는 잘린 칸에만 ds.js `fitCells` 가 `.tooltip-wrap > .cell-text(tabindex 0) + .tooltip` 을 단다(Breadcrumb 와 같은 방식). 창 크기가 바뀌면 다시 재서 잘리지 않게 된 칸은 풀고(포커스 중인 칸은 그대로), 비활성 행 안은 Tab 칸을 만들지 않는다. React `TableCell truncate` 가 ResizeObserver 로 같은 일을 하고, DataTable 은 title 을 넣지 않는다(MIGRATION).
  Tooltip 문구가 칸 글자와 같아 **`aria-hidden`** — 표를 읽을 때 칸 값이 두 번 읽혔다. 같은 이유로 **Breadcrumb 의 잘린 항목 Tooltip 도 aria-hidden**(React `Tooltip describe={false}` 전부)으로 바꿨다. 상단 내비 예제의 아바타는 `title` → `role="img"` + `aria-label`. verify 가 `td.truncate` · `.avatar` 의 title 을 막는다. Interaction › Overflow 의 '지금' 칸에 Data Table 을 더했고, 낡은 'Tag 정비 때' 를 실제(최대 폭 160 에서 줄바꿈)로 고쳤다. Chip 의 긴 값 title 은 그대로다(지우기에 포커스가 오면 펼쳐 키보드로 읽힌다 — 선택지 밖).
- **끈 컨트롤 커서 통일** — 끈 Number Input 증감 버튼 · 끈 File Upload 영역이 `default` → `not-allowed`.
- **행 삭제 후 포커스 테스트** — 지운 행 자리에 비활성 행이 오면 그 안(tabindex -1)이 아니라 표 영역으로 간다(`FOCUS_IN_ROW` 를 되돌리면 실패).
- **액션 바 선택 건수** brand → `--foreground-neutral-primary`(굵기 700 그대로) — 표 안의 brand 를 덜며 남긴 하나.
- **로그 한 건 = 한 줄** — `.log-row td{white-space:nowrap}` 와, 행에 `td.truncate` 가 있으면 다른 칸 `width:1%`(남는 폭을 메시지 열이 가짐). 로그 뷰어 패턴의 단말 'PC-' / '2041' 과 시간 열이 두 줄로 끊겨 행이 62 였다. 로그 뷰어 · 행 펼침 예제의 메시지 열을 `truncate` 로(사이트 · React) — 행 펼침은 첫 게이트에서 768 폭 표가 12px 넓어져(nowrap 메시지) 잡혔다.
- 음성 시험: 사이트 12건 · verify 2건 · React 5건. 첫 회 1건(`.tooltip-wrap{line-height:inherit}`)을 못 잡아 재 보니 칸과 줄 높이가 같아 쓸모없는 선언이라 지웠다.
- 덤으로 본 것(고치지 않음): 로그 행 높이는 compact 인데도 49 다 — 행 동작 아이콘 버튼 32 + 칸 패딩 8 · 8.

2026-11-12 남겨 둔 둘(사람의 결정) — behave 1197 → 1201(`behave.cells.js` 4) · react 709+6 → 710+6(`choice-controls.test` 1). contrast · advisory · pages 수는 그대로.
- **입력값 칩의 긴 값 title → Tooltip** — ds.js `fitChips` · React `ChipLabel` 이 240 에서 잘린 `.lbl` 에만 Tooltip(aria-hidden)을 단다. 키보드는 전처럼 지우기 버튼에 포커스가 오면 펼친다. 사이트 Combobox 다중 항목도 그릴 때마다 잰다. verify 가 `.lbl` 의 title 을 막는다. 이제 시스템 예제 · React 에 `title` 로 전체 값을 보이는 곳이 없다.
- **compact 표의 행 동작 아이콘 버튼 28** — 선택지에는 '28 로 줄이면 행 40' 이라고 적었지만 재 보니 28 + 패딩 8 · 8 + 아래 선 1 = 45 였다. 그 칸만 위아래 패딩 5 를 더해 행이 다른 compact 행과 같은 40.19 가 된다(로그 뷰어 49 → 40). Data Table Spec Size 에 적었다.
- 음성 시험: 사이트 8건 · verify 1건 · React 1건. 3건(`.chip .tooltip-wrap{min-width:0}` · 버튼 `vertical-align` · relaxed 칸 패딩)은 지워도 같아 쓸모없는 선언이라 지웠다. 키보드 포커스 Tooltip 단정이 5회에 3회 실패해 재 보니 나타나는 전환 도중(opacity 0.96 · 0.999)에 쟀다 — opacity 1 을 기다리게 고쳐 6회 통과.
- **기본 · relaxed 의 행 동작 칸**(재다가 찾아 사람이 결정 — '그 칸 패딩만 줄임') — 아이콘 버튼(32)이 있는 행이 기본 57 · relaxed 65 였다(32 + 칸 패딩 + 아래 선 1). 그 칸만 위아래 7 로 줄여 48 · 56(relaxed 도 같은 규칙으로 가운데에 든다 — relaxed 전용 규칙은 음성 시험에서 쓸모없어 지움). 버튼 크기는 그대로. behave +1(세 밀도의 버튼 있는 행 = 없는 행 높이 · 가운데).

`advisory 455` 는 기준 시스템 값을 따르느라, 또는 사람이 결정한 표현(예: 진한 빨강 Count 배지의 다크 흰 숫자) 때문에
우리 기준을 못 넘는 쌍입니다 — **실패가 아니라 선언된 예외**이고 `contrast.pairs.js` 에 이유가 적혀 있습니다.

## 토큰 체계 (v0.8)

- **Atomic** `--{램프}-{단계}` — 램프 13개, **숫자가 클수록 밝습니다**. 컴포넌트에서 직접 쓰지 않습니다.
- **Semantic** `--{그룹}-{하위}-{이름}` — `foreground` · `background` · `surface` · `line` · `effect` · `static`
  여섯 그룹 **85개**(참조 75 + 더한 10) + 트리 밖 15개(`--brand-label` · `--company-mark` · `--company-mark-subtle` · 탐색형 차트 `--chart-*` 12) = **100**.
  더한 것 중 6개는 Tag 글자용 `--foreground-{negative|cautionary|accent-light-blue|accent-lime|accent-cyan|positive}-heavy`(2026-11-11).
- **차트 토큰** `--chart-series-1~6`(순서 고정 · 제품색과 무관) · `--chart-series-1-subtle`(비교 기간 막대) · `--chart-series-1-strong`(막대 위 선) · `--chart-grid-primary` · `--chart-axis-text` · `--chart-tooltip-surface` · `--chart-tooltip-text` 는
  CSS 가 아니라 `ds-chart.js` 가 계산값으로 읽어 캔버스에 칠합니다(소비자 0 허용 목록 `grammarOnly`). 심각도 계열은 negative-strong · cautionary · accent-light-blue · accent-lime · inactive 토큰 그대로(5단계 — Medium 라이트 블루 · Low 라임, 2026-11-11 교체).
- **제품 색**은 `--prod-40~60` 다섯 단계로 주입되고 `brand` 계열이 따라옵니다.
  **제품 색 위의 흰 글자가 4.5 를 넘어야 하고 빌드가 검사합니다**(`verify.js`).
- 비활성은 `--surface-disable-primary` · `--foreground-disable-primary` 로 칠합니다. `opacity` 로
  흐리게 하지 않습니다.
- **크기는 rem**(2026-11-11) — 글자는 `--font-size-N` 토큰(12 이하는 최소 크기를 지키는 `max()`), 간격 · 높이 · 반경은 rem 이고
  테두리 · 그림자 · 2px 이하만 px 입니다(`verify`). 기준 화면(루트 16px)에서 px 와 같으므로 Figma 수치는 그대로 읽습니다(`lib.js toPx`).

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
