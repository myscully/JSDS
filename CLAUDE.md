# JS Design System — 함께 일하는 기준

지란지교시큐리티 보안 콘솔용 디자인 시스템입니다. 정적 사이트 + React 패키지 + Figma 라이브러리 셋이
**같은 토큰 하나**를 공유합니다. 현재 **v0.9**.

## 저장소 구조 — 무엇이 원본이고 무엇이 생성물인가

| 경로 | 무엇 |
| --- | --- |
| `_build/` | **원본.** 사이트 생성기. `build.js` 가 전부를 만들고 `verify.js`·`contrast.js` 를 함께 돌립니다 |
| `_build/style.src.css` | **토큰과 컴포넌트 CSS 의 단일 출처.** 사이트·패키지·Figma 가 전부 여기서 나옵니다 |
| `_build/base-tokens.js` | 이 시스템의 기준 토큰 원장(atomic 램프 · semantic 정의). `DEVIATIONS`(값을 바꾼 것) · `ADDITIONS`(우리가 더한 것) |
| `_build/ds-chart.src.js` | **원본.** 탐색형 차트(Chart.js) 테마 어댑터 + 프리셋. `assets/ds-chart.js` 로 복사되고 React 는 `_react/scripts/sync-chart.mjs` 가 `src/chart/ds-chart.js`(생성물)로 가져갑니다. Chart.js 본체는 `_build/node_modules` 에서 `assets/vendor/` 로 복사(MIT) |
| `_react/` | **원본.** `@jiran/ds-react` 패키지. `dist/` 는 생성물이라 git 에 없습니다 |
| `_figma/` | **원본.** Figma 작업 도구 — `font.js`(폰트 안전 로더) · `probe.js`(조사) · `audit.mjs`(대조) · `dumps/baseline.json`(audit 기준 덤프) · `font-revert.md`(Noto 대체 경과 · 되돌릴 노드 · 굵기를 고칠 노드 — 목록은 같은 폴더의 `.tsv` 셋) |
| `assets/` `home/` `foundations/` `components/` `patterns/` `templates/` `resources/` `index.html` | **전부 생성물.** 직접 고치지 말고 `_build/` 를 고친 뒤 빌드하세요. `assets/vendor/chart.umd.js` · `assets/ds-chart.js` · `assets/templates.css` · `assets/templates.js` · `templates/screen/*.html` 도 생성물 |
| `_build/font-jp.src.css` · `_build/fonts-jp/` | **원본.** 일본어 한자용 Pretendard JP Variable v1.3.9(OFL) — 조각 woff2 119개 · `OFL.txt` 와 그 `@font-face`(unicode-range). 내려받은 원본 CSS 에서 만들었고 손으로 고치지 않습니다. `build.js` 가 `assets/font-jp.css` · `assets/fonts/jp/`(생성물)로, `sync-css.mjs` 가 패키지 `dist/font-jp.css`(선택 import)로 복사 |
| `_concepts/` | **원본 · 시안.** 메인 화면 비주얼 시안(도형 타이포 A1 · A2 · A3, 정한 카피의 B1 Simple · B2 Visual · B3 Signal, 가운데 정렬 B4 Balance + 고르는 `index.html`). **B4 는 2026-11-18 사이트 메인 화면이 됐다**(`_build/render.js` `homePage` · `style.src.css` Home 블록 — 시안 파일은 기록으로 남김). B 의 띠 · 미리보기 이미지 `img/*.png` 는 `capture.mjs` 가 패턴 예제를 찍은 것(패턴이 바뀌면 다시 돌림). `../assets/style.css` 의 토큰 · Pretendard 와 `../assets/app.js` 의 제품 색 · `SEARCH_INDEX` 를 불러 쓰고, 루트의 `_` 폴더라 빌드 · verify · 게이트 밖이다(반복 애니메이션도 씀). 사이트로 옮길 때 게이트 규칙에 맞게 다듬는다 |
| `_build/templates.data.js` · `templates.build.js` · `templates.src.css` · `templates.src.js` | **원본.** Templates 메뉴(2026-11-18 — 옛 `_templates/` 를 옮기고 지움). `templates.data.js` 는 문서 페이지의 글(정의 · 고르기 표 · 쓴 컴포넌트 · 패턴 · Rules · 개요 한 줄), `templates.build.js` 는 `_build/*.data.js` 의 예제 문자열 · 헬퍼를 읽어 화면 아홉 `templates/screen/<key>.html` 을 쓰는 생성기(`build.js` 가 부름 — route 가 아니라 pages 수에 들지 않음), `templates.src.css` → `assets/templates.css` 는 앱 틀 배치만(패키지 CSS 에 섞이지 않게 style.css 와 따로), `templates.src.js` → `assets/templates.js` 는 둘러보기용 흉내 동작이다 |
| `_build/guide.data.js` | **원본.** Home › Guide(2026-11-20)의 글 — 트랙 다섯(공통 · 디자이너 · 기획자 · 개발자 · 함께 만들기)의 단계(제목 · 무엇 · 왜 · 해보기 · 관련 문서 · 개발자 code key · 함께 만들기 lead 역할). 렌더는 `render.js` `guideTrackPage` · `guideOverviewPage`, 개발자 코드는 `GUIDE_CODE`, 진행 저장은 `app.src.js`(jsds-guide). `verify.js` 가 순서 · 단계 수 · 링크 대상 · 문구를, `behave.guide.js` 가 동작을 본다 |
| `_build/uidict.data.js` | **원본.** Resources › UI Dictionary(2026-11-19)의 항목 — 분류 10 · 추천 검색어 · 항목(`src` = 예제 · 화면 주소, 이름 · 영문 · 대표 클래스 · React 이름 · 다른 이름 `aka` · 생김새 검색어 `kw`). 미리보기 · 코드 · 비슷한 것 · 문서 링크는 `render.js` `uiDictPage` 가 예제 데이터에서 만든다. `verify.js` 가 src · 클래스 · React · 범위를, `behave.uidict.js` 가 동작을 본다 |
| `_build/thumbs/components/*.svg` · `_build/thumbs/patterns/*.svg` · `_build/thumbs.js` | **원본.** Overview 카드 썸네일 — 컴포넌트 46개(2026-11-19, Figma `Thumbnail / <이름>`) · 패턴 22개(2026-11-20, Figma Patterns › Overview 의 `ov-grid` 카드)를 SVG 로 내보낸 것(손으로 고치지 않음)과, 그 색을 토큰으로 바꿔 빌드에 넣는 변환기(표에 없는 색이면 빌드가 멈춤 · 명도 마스크 안은 흰색 그대로). Figma 썸네일이 바뀌면 다시 내보낸다 |
| `assets/vendor/dayjs.min.js` · `dayjs.utc.js` · `dayjs.timezone.js` · `dayjs.LICENSE` | **생성물.** Date Picker 기준 시간대용 dayjs(MIT, 1.11.13 고정)를 `build.js` 가 `_build/node_modules/dayjs` 에서 복사하고 Date Picker 가 있는 페이지에만 붙입니다(`verify.js` 가 동반 · 부재를 봄). React 는 패키지 dependency 로 `date-picker/tz.ts` 에서 extend |

## 일하는 방식

**재면서 일합니다.** 색·크기·대비는 추측하지 않고 **헤드리스 Chromium 으로 잽니다.** "맞을 것이다"로
보고하지 않습니다. 알파가 섞인 색은 반드시 **합성해서** 재야 합니다 — 같은 색의 두 알파를 그냥
비교하면 1.000 이 나옵니다.

**문서가 코드보다 앞서 가지 않게 합니다.** 페이지에 적는 수치·이름·약속은 **세어서** 씁니다.
이 저장소에서 반복해서 난 사고가 전부 이것이었습니다 — "램프 14개"(실제 13), "컴포넌트 30개"(31),
"`summary > svg` 는 16~18 로 고정됩니다"(CSS 에 크기 지정 없음).

**예외는 코드에 선언합니다.** 기준 값을 바꿨으면 `base-tokens.js` 의 `DEVIATIONS`,
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
pages 106 · verify 0/0 · contrast 3808쌍 실패 0 · advisory 1149 · behave 1739/1739 · react 951+6 · tsc 0
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
  라이트 30 단계(lime 만 20 — 30 이 틴트 위 4.42) · 다크 60 단계(red 만 70 — 60 은 Critical solid 의 강한 면 위 4.08). 기준의 foreground 는 strong 까지라 12% 틴트 위 4.5 를 넘는 단계가 없었다(negative-strong 도 3.68).
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

2026-11-11 Table · Data Table 최적화 — 테두리 없는 표 · 밀도 · 행 스타일 · 구성(사람의 요청 · 결정 넷) — contrast 1398 → 1434 · behave 1160 → 1170(`behave.table.js` 10) · react 688 → 700(`tests/table-optimize.test.tsx` 6 · 예제 247 → 253 에 따른 구조 비교 6). advisory · pages 수는 그대로.
- **표를 감싸는 테두리 · radius · 면을 없앴다**(사람의 요청) — `.tbl-wrap` 은 가로 스크롤만. 위 경계 = 회색 헤더 면, 아래 경계 = **마지막 행 아래 선**(사람의 결정 — 전에는 테두리가 대신해 지워 두었다). `.plain` · 빈 상태 칸은 선 없음. 사이트 셸의 문서 표 규칙 `tbody tr:last-child td{border-bottom:0}` 이 컴포넌트 표에도 걸려 있어 `table:not(.tbl)` 로 좁혔다. Card flush 의 '이중 테두리' 설명을 '카드 패딩 없이 붙일 때' 로.
- **밀도 세 단계 40 · 48 · 56**(사람의 결정) — 기본 52 → 48 · `.compact` 44 → 40 · 새 `.relaxed` 56, 헤더 44 · 40 · 48(전에는 compact 헤더가 CSS 40 · Spec 44 로 어긋났다). React `density`(기존 `compact` 도 받음). 밀도 전환 예제 — 사이트 `.select-btn[data-density-for="표 id"]` + `button[data-density]`(ds.js), 고른 밀도의 기억은 제품 몫.
- **행 스타일 넷**(사람의 결정 — Grid · Free form 을 더함) — 가로선(기본) · `.zebra` · `.grid`(칸 사이 세로선, 마지막 칸 없음) · `.plain`(선 없음 — 5행 안팎 요약). React `rowStyle`(기존 `zebra` 도 받음). verify 가 `.plain` + `.zebra`/`.grid` · `.compact` + `.relaxed` 를 막는다.
- **구성 넷**(사람의 결정) — 하위 텍스트 `td > .cell-sub`(12/16 secondary, 칸 위아래 패딩 8 이라 두 줄이 relaxed 56 에 든다) · 첫 열 고정 `.tbl-wrap.sticky-col`(맨 앞 체크 · 펼침 칸과 첫 열, 불투명 면 `--tbl-surface` 위에 행 상태 면 `--tbl-tint` 를 겹침 · 오른쪽 선 · tabindex + 이름은 verify) · 합계 행 `tfoot tr.total`(회색 면 · 600 · 위 선 `--line-neutral-primary`) · 밀도 전환. React `TableFoot` · `TableRow total` · `TableCell sub` · DataTable `stickyColumn` · `summaryRow` · column `sub`.
- **함께 정한 것** — 숫자 tabular 를 표 전체로(`.num` 은 오른쪽 정렬만, 크기를 견주는 숫자에만 — 예제 · 패턴의 `.num` 을 세어 보니 전부 건수 · % · 그 머리글이라 고칠 것이 없었다). **하지 않은 것:** hover 때만 보이는 행 동작(키보드로 못 찾음), 열 추가 · 순서 · 너비(열 표시 설정은 1.0 뒤 다시 묻기로 함), 복합 필터 저장, 셀 배경 추세 표시(상태색과 겹침).
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

2026-11-12 텍스트 스타일 19단계(사람의 요청 — 이미지의 스케일, 결정 다섯) — behave 1201 → 1206(`behave.type.js` 5 · 기존 단정 고침 7). contrast · advisory · react · pages 수는 그대로(색 변화 없음).
- **스케일** Display 1~3(56 · 40 · 36) · Title 1~3(32 · 28 · 24) · Heading 1~2(22 · 20) · Headline 1~2(18 · 17) · Body 1 · 2(16 · 15, Normal · Reading) · Label 1(14, Normal · Reading) · Label 2(13) · Caption 1~2(12 · 11). 크기 · 행간 · 자간은 표 그대로이고,
  Headline 2 는 표에 '26px (1.412)' 로 둘이 어긋나 비율 쪽 **24** 로 정했다(사람의 결정). 클래스 `.t-display-1` … `.t-body-1-normal` · `.t-label-1-reading` …, 이름은 Figma 철자(Body 1/Normal).
- **굵기는 따로**(사람의 결정) — `.t-bold` 700 · `.t-semibold` 600 · `.t-medium` 500 · `.t-regular` 400(SemiBold 는 컴포넌트 52곳이 600 이라 더함 — 사람의 결정). 스타일마다 기본 굵기: Display · Title · Heading · Headline Bold, Body Regular, Label · Caption Medium(사람의 결정).
- **같은 이름이 다른 크기가 됐다** — `.t-title-1` 16 → 32 · `.t-heading-1` 28 → 22 · `.t-display-1` 40 → 56. 전환표는 `_react/MIGRATION.md`. verify 가 없어진 이름(`t-body-1/2` · `t-label-1` 단독 · `t-title-1-medium` · `t-label-2-semibold` · `t-heading-3/4`)을 사이트 데이터 · React 에서 막는다.
  옛 Caption 1(12/18) → 12/16, 옛 Caption 2(10) → 11. 토큰 `--font-size-11 · 13 · 15 · 17 · 22 · 36 · 56` 을 더하고 10 을 지웠다(사이트 셸의 문서 그림 다섯 곳은 `max(0.625rem,10px)` 그대로 — 11 로 옮기니 Foundations 간격 막대 라벨이 넘쳐 behave 2건이 잡았다).
- **페이지 h1 = Display 3**(사람의 결정) — 문서 사이트 `h1`(28/1.2) · Page Header 제목(24/1.3) → 36/48/700/-0.027em. 홈 hero 는 48 그대로(행간 1.2 를 직접 줌).
- **컴포넌트 글자를 표에 묶었다**(사람의 결정 — 크기는 그대로, 행간 · 자간을 같은 크기 스타일 중 지금 값에 가장 가까운 것으로). font-size 규칙 152개. 높이가 바뀐 것(실측): Tooltip 30 → 28 · Tag 25 → 22(sm 21 → 18 · lg 29 → 26) · 탭 줄 44.4 → 44(sm 37.2 → 34) · 메뉴 · Navigation 항목 38.4 → 38 · 대화상자 제목 28.8 → 26 · KPI 값 행간 38.4 → 44. 표 행 48 · 헤더 44 · 버튼 · 필드 높이는 그대로.
  UA 가 버튼의 자간을 normal 로 되돌려 `font:inherit` 버튼 여덟 규칙에 `letter-spacing:inherit`. `.tooltip-wrap` 행간 1.6 → inherit(잘린 칸 · 칩 · Breadcrumb 글자가 22.4 · 19.2 였다 — `.breadcrumb .tooltip-wrap` 규칙은 쓸모없어져 지움). 패턴 인라인 글자 둘(검색 툴바 12px · 온보딩 완료 16px)은 토큰 + 행간 · 자간으로(사이트 · React). 차트 카드 제목은 카드 제목과 같은 16/24.
- **behave.type** — 19 스타일 · 기본 굵기가 이미지 표와 같음, 굵기 클래스가 이김, 사이트 h1 · Page Header = Display 3, **모든 컴포넌트 · 패턴 예제 글자의 (크기, 행간, 자간)이 표 안**, 굵기 넷 밖 없음. 예외(코드에 이유): 고정폭 Code 12/20 · 인라인 코드 · Pagination 생략 기호(10-26 결정) · 숨긴 글자 · 대문자 그룹 라벨 자간 .06em.
  기존 단정 고침 7: 탭 44.4 → 44, Tag 21 · 25 · 29 → 18 · 22 · 26, 좁은 Tag 25 → 22, Avatar sm 10 → 11, Page Header 24 → 36, 카드 제목 비교 클래스 · 미리보기 h3 자간(Body 1 의 0.0912px), KPI 단위 · 증감의 스타일 이름(값 같음). behave.scale 의 12 이하 최소 크기는 10 → 11.
- 문서: Typography 의 Style 표를 CSS 에서 읽고(손 배열을 지움) Weight 절을 더했다. 쓰임 표 · Size units · Spec 의 스타일 이름(Body/2 → Label 1/Reading 등 33곳)과 높이. audit `typeScale()` 이 새 이름 · 굵기 조합을 읽는다(Figma 대조는 스타일 19개만 — 굵기 조합을 몇 개 만들지는 일괄 반영 때).
- 음성 시험: behave 9건(스타일 값 · 굵기 · 사이트 h1 · Page Header · Tooltip 행간 · Tag 행간 · tooltip-wrap · 달력 칸 자간 · 툴바 인라인) · verify 2건(React 예제 · 사이트 데이터의 옛 이름) 모두 잡혔다.
- **하지 않은 것:** 사이트 셸의 문서 본문 · 내비 글자, 캔버스 차트 글자(ds-chart — 크기만 스타일과 같고 자간 · 툴팁 행간은 Chart.js 기본, 사람의 결정 '그대로'). Figma 미반영 282 → 473건 — 텍스트 스타일 19개 없음 · 굵기 · 높이 · 이름이 바뀐 대조들. 기준 덤프의 알려진 'Label/2 SemiBold 700 ≠ 600' 은 그 스타일이 없어져 더 나오지 않는다(이제 빼지 않는다).
- **같은 날 남은 셋(사람의 결정 — 선택지)** — behave 1206 → 1208(`behave.type.js` 2). contrast · advisory · react 수는 그대로.
  - 사이트 홈 hero 제목 48/1.2 → **Display 1 56/72**(767 이하는 Title 1 32/44 — 56 은 375 에서 여러 줄로 끊김). 쓰는 곳이 없어진 글자 크기 토큰 `--font-size-48` 을 지웠다(MIGRATION).
  - 문서 제목 **h2 · h3 · h4 = Heading 2 · Body 1/Normal · Label 1/Normal** 의 행간 · 자간(굵기 그대로). 미리보기 안에는 걸리지 않게 `:where(:not(.example-preview *))` — 옛 h3 자간 규칙과 같은 이유. 사이트에 h4 는 없어 단정이 하나 넣어 잰다.
  - 패키지 **`.ds-root` 기본 글자 = Body 2/Reading 15/24 · 자간 0.0096em**(옛 15/1.65 = 24.75). `sync-css.mjs` 가 `.t-body-2-reading` 값과 다르면 빌드를 막는다. '기본 글자에 기대지 않는다' 단정(behave.js)의 기본 글자를 같이 바꿨더니 **고정폭 Code 블록 셋이 새 자간을 물려받아** 배치가 달랐다 — `.code-view pre{letter-spacing:0}`(제품 앱에서도 같은 일이 났을 것).
  - 음성 시험 6건(홈 제목 · 좁은 화면 · h2 · h3 · h4 · sync-css 가드) 모두 실패로 잡혔다. Figma 미반영 473건(그대로).

2026-11-12 컴포넌트 수정 15건(사람의 요청 · 결정 열둘) — contrast 1434 → 1440 · advisory 455 → 460 · behave 1208 → 1225(`behave.layout.js` 17 · 기존 단정 고침 5) · react 710+6 → 717+6(예제 253 → 260 에 따른 구조 비교 7). pages 수는 그대로.
- **컴포넌트 페이지 구성 = 정의 → 원칙 표 → Default → Variant → Size → State → Spec → Props → Usage**(사람의 결정 — 기존 예제를 네 묶음에 나눔). 예제마다 `group`(241개: default 43 · variant 147 · size 16 · state 35), 묶음은 h2 · 예제는 h3(번호 없음), 빈 묶음은 그리지 않고 묶음에 예제 하나가 묶음 이름과 같으면 h3 를 생략한다. 예제 id 는 그대로라 React · 구조 비교 · audit 이 그대로다. 패턴 페이지는 옛 번호 목록 그대로.
  네 묶음에 안 맞는 것(Icon · Toast · 행 펼침 …)은 Variant, 상태 화면(Loading · 오류 · 빈 상태 · Disabled)은 State.
- **Placement 절을 없앴다**(사람의 결정) — 자리 규칙 문장 43개를 원칙 표의 'Placement' 행으로(원칙 표가 없던 date-picker · breadcrumb · accordion · card · data-visual 은 그 행 하나로 원칙 표가 생김). Button · Breadcrumb 의 Placement 예제는 Variant 에 남겼다. Spec 머리글 항목 · 값 → **Property · Value**. 컴포넌트 예제 제목 한글 38개를 영문으로(사람의 결정 — 패턴 · 설명 · 예제 안 문구는 한글 그대로).
  verify: spec 의 Placement 금지 · principles 의 Placement 행 하나 · `h2#placement` 금지 · 필수 절 default · spec · props · usage · group 값 · 제목의 한글 · 절 순서. audit 의 Spec 대조는 principles 의 Placement 행을 기대값으로 읽는다(Figma 카드의 Placement 행이 'Figma 에만 있는 행' 이 되지 않게).
- **폼 컨트롤 높이 32 · 40 · 48**(사람의 결정 — Chip · Pagination · Tab 은 폼 컨트롤이 아니라 그대로) — Select Button 38 → 40(안쪽 버튼 34 · outline 은 버튼마다 40) + `sm` 32 · `lg` 48, Select · Dropdown 트리거 · Search 에 `sm` · `lg`(`.field.sm` · `.lg` 안 Select 도 따라감), 상단 내비 검색 36 → 32(옆 아이콘 버튼 32), Copy Field sm 의 복사 버튼 28. 32 높이는 반경 4. React `SelectButton` · `Select` · `Dropdown` · `SearchBar` `size`. 크기 예제 셋(select-button · select · search).
  **나란히 놓인 컨트롤은 같은 높이** — 로그 뷰어 툴바를 두 줄로(검색 · 기간 40 / 칩 · 초기화 · Select Button · CSV 32 — CSV 를 첫 줄에 두면 1440 미리보기(약 760)에 검색 320 + 구간 410 뒤로 혼자 줄바꿈해 둘째 줄 끝으로 옮겼다, 캡처에서 발견 · 사람이 확인), 로그 뷰어 '실시간 | 일시정지' Select Button 의 빨간 맥박 점을 지웠다(사람의 요청 · 결정 — 점까지 지우고 글자만, 사이트 · React. Indicator 페이지의 맥박 예제는 그대로), 검색 툴바도 같은 방식으로(사람의 결정 — 내보내기를 결과 줄 끝 32 로 · 검색 최소 폭 320 → 280, 그러면 검색 · 심각도 · 기간이 한 줄. 전에는 기간 · 내보내기가 둘째 줄로 줄바꿈했다), 검색 툴바 칩 기본 32 · Select 인라인 높이 지움. 줄바꿈 여부는 behave 가 재지 않는다(캡처로 1440 에서 확인). behave 가 모든 컴포넌트 · 패턴 예제에서 같은 줄 형제 컨트롤 높이를 잰다 — 크기 시연 넷(button-size · button-icon-only · button-text · chip-size)만 이유와 함께 뺐다.
- **표** — 행 hover `--surface-neutral-tertiary`(표 · List — 사람의 결정), 머리글 · 키-값 표 머리글 = Label 2 13/18(사람의 결정), 키-값 표 첫 줄 위 1px 선. Side Panel 예제의 속성 표를 `.tbl.kv` 로(사이트 · React). `.cell-sub` 대비 쌍의 바탕을 tertiary 로.
  **Table 페이지에 밀도 · 하위 텍스트 · 고정 헤더 · 첫 열 고정 예제**(사람의 결정), React `Table` `stickyHeader` · `stickyColumn` · `maxHeight` · `regionLabel`.
- **개별 스타일** — Empty State 아이콘 면 없음 · `--foreground-neutral-quaternary` · 40(compact 32 · 카드 36) · 선 1.5(`grammarOnly` 에서 quaternary 를 뺌). Notice 테두리 없음 · padding 20 18 · 톤 없는 Notice 는 회색 면(사람의 결정). Page Header 제목 Title 1 32/44 · 자간 -0.0253em(요청은 rem 이었지만 Title 1 자간은 em — rem 이면 표 밖), 간격 16. File Upload 오류 줄 `--line-negative-primary`. Steps 단계 글자 500.
- **Steps 완료 원 = 진한 초록 면 `--foreground-positive-primary` + 흰 체크 `--brand-label`**(사람의 결정 — 요청의 12% 틴트 + 흰색은 라이트 1.13 으로 체크가 보이지 않았다). 체크가 그래픽 3:1 미달(라이트 2.46 · 다크 1.98)이라 REF 로 선언 — contrast +6(맥락 6) · advisory +5(다크 '상태색과 겹치는 제품' 맥락은 `--brand-label` 이 흰색이 아니라 통과). 제품 색 원(`--surface-brand-primary`)도 해 보았으나 현재 단계(.on)와 같은 면이 되어 사람이 초록으로 되돌렸다.
- **측정에서 드러나 고친 것 — Spec 표 잘림(1199 이하):** `.page table:not(.tbl){display:block}`(0,2,1)이 되돌리는 `.tablewrap table{display:table}`(0,1,1)을 이겨 표가 내용 폭(1100 에서 277/846)으로 줄었다 — 되돌리는 규칙을 `.page .tablewrap table:not(.tbl)` 로. behave 가 1100 폭에서 Spec · Props 표 폭 = 감싼 틀 폭을 잰다.
- **기존 단정 고침 5:** Select Button 높이 38 → 40(outline · solid), Page Header 제목 36 → 32 · Breadcrumb 간격 8 → 16(behave.promote), Page Header 스타일 = Title 1(behave.type), 구성 단정 '1. Default' → 묶음 h2 순서.
- 음성 시험: 사이트 17건(Select Button · Search · Select 크기 · 상단 검색 · 행 · List hover · 헤더 13 · kv 선 · Spec 폭 · Notice 테두리 · 회색 면 · page-head 간격 · 제목 · Steps 굵기 · 완료 면(틴트로 되돌림) · Upload 선 · Empty 선) · verify 4건(group 틀림 · 없음 · 한글 제목 · 원칙 표 Placement 없음). 첫 회 Notice 회색 면 1건을 못 잡았다 — 예제에 톤 없는 Notice 가 없어 단정이 빈 목록으로 통과했다. 하나 넣어 재게 고쳐 잡았다.
- Figma 미반영 473 → 485건 — Spec 문구 8(Data Table · Table Label, Notification Container · Size, Search Container · Size, Select · Select Button Size — 옛 행 6 은 새 문구로 바뀜) · Steps 완료 원 면 · 체크 6(Figma 는 아직 초록 틴트 면 · 초록 체크) · 카드 빈 상태 아이콘 quaternary 4. audit 이 카드 아이콘 칸의 면 · 모서리 선언이 없으면 읽지 못하고 Card 대조 전체(48건)를 건너뛰던 것을 '선언 없음 = 면 없음 · 모서리 0' 으로 고쳤다(그대로 두면 434 로 줄어 보였다). Empty State 페이지 아이콘 40 · Notice 테두리 · 표 hover · 폼 높이는 audit 대조 밖 — 일괄 반영 때.

2026-11-13 Chip 형태 둘 · 색 둘(사람의 요청 · 결정 넷) — behave 1225 → 1236(`behave.chip.js` 11) · react 717+6 → 721+6(`choice-controls.test` 2 · 예제 260 → 262 에 따른 구조 비교 2). contrast · advisory · pages 수는 그대로(새 색 쌍 없음 — 흰 글자 / 제품 면 · 반전 글자 / 반전 면 · 기본 글자 / tertiary 는 기존 쌍).
- **형태 = Outline(기본, 회색 선) · `.solid`(회색 면 `--surface-neutral-tertiary`, 선 투명 1px 라 높이 32 같음)** — hover · 눌림 면은 두 형태가 같다(secondary · strong). React `variant`.
- **고른 칩은 두 형태 모두 같은 진한 면**(사람의 요청) — brand(기본) = `--surface-brand-primary` + `--brand-label`, `.neutral` = `--surface-neutral-inverse` + `--foreground-neutral-inverse`(사람의 결정 — '진한 회색 면' 대신). 옛 선택 모양(옅은 brand 면 + brand 선)은 없어졌다. React `color`.
- **색은 고른 모양만 바꾼다**(사람의 결정) — 고르지 않은 칩은 brand · neutral 모두 중립. 기본은 Outline · Brand(사람의 결정 — 검색 · 로그 뷰어 패턴의 필터 칩도 이 모양이라 켜진 칩이 제품 색 면이 됐다).
- **입력값 칩은 형태만 받고 색은 중립 고정**(사람의 결정) — verify 가 `aria-pressed` 없는 칩의 `.on` · `.neutral` 을 막는다. React `onRemove` · `action` 칩은 `color` · `selected` 를 경고하고 무시한다(MIGRATION).
  검색 패턴의 '적용된 필터' 입력값 칩 둘에 `.on` 이 붙어 있었다(사이트 · React `selected`) — 지웠다. 그대로 두면 지우기 x(neutral-secondary)가 제품 색 면 위에 놓였다.
- 명시도 — `.chip:where(.solid)` 0,1,0 · `.chip.on:where(.neutral)` 0,2,0 으로 hover 가 solid 면을, `.on` 이 hover 를, 뒤의 비활성이 고른 neutral 을 이긴다(behave 가 끈 칩 셋 · hover 로 잰다).
- 예제 Outline · Solid(위 brand 줄 · 아래 neutral 줄, Solid 에는 입력값 칩 줄)(사이트 · React), 원칙 표 '형태와 색' 행, Props `.solid` · `.neutral`, Spec Container · Selected.
- 음성 시험: CSS 6건(선택 면 되돌림 · solid 규칙 · neutral 규칙 · neutral 명시도 · solid 명시도 · 체크 색) · verify 2건(입력값 칩 `.on` · `.neutral`) · React 2건(입력값 칩 `.on` · 경고) 모두 실패로 잡혔다.
- Figma 미반영 485 → 487건(Spec Chip Container 문구 · 새 Selected 행). Figma 의 Chip 은 아직 옅은 brand 선택 면이고 Solid · Neutral 변형이 없다 — 일괄 반영 때 그린다.


2026-11-13 Steps 재구성(사람의 요청 · 결정 다섯) — contrast 1440 → 1434 · advisory 460 → 455 · behave 1236 → 1274(`behave.stepper.js` 37 · 온보딩 1) · react 721+6 → 732+6(`tests/stepper.test.tsx` 9 · 예제 262 → 264 에 따른 구조 비교 2). pages 수는 그대로.
- **표시 + 마법사 동작**(사람의 결정) — `.stepper > .steps + .step-panel × 단계 수 + .step-actions`. '다음'(폼 안 Enter 포함)은 그 패널의 `form[data-validate]` 를 기존 `vRun` 으로 검사하고 막히면 첫 오류로, 통과하면 완료 표시 · 다음 패널 · 패널로 포커스. 패널은 숨기기만 해서 입력값이 남는다. 저장 · 전송은 제품(`ds:step {index, from, trigger}` · `ds:step-finish` · `DS.stepper.go`). React `Stepper` · `StepButton`, `Form bare`(카드 안 폼).
- **배치 셋**(사람의 결정) — 가로(연결선이 남는 폭을 나눔, 기본) · `.label-below` · `.vertical`(각 li 안에 패널 — 단계 아래에 내용이 펼쳐짐). 세로에도 연결선이 생겼다.
  **좁으면 세로로**(사람의 결정 — 캡처에서 390 의 가로 · 라벨 아래가 미리보기를 넘쳐 잘려 보였다) — 가로 · 라벨 아래가 자리에 안 들어가면 ds.js `fitSteps` · React `useStacked` 가 `.stacked` 를 붙여 세로 배치의 목록 규칙으로 쌓는다(패널은 목록 아래 그대로). `.stacked` 를 뗀 모양에서 넘치는지 재고, 처음 그릴 때 · 글꼴 준비 뒤 · 창 크기가 바뀔 때(React 는 부모 폭이 바뀔 때) 다시 잰다. 숨은 자리(offsetParent 없음)는 재지 않는다. 예제에 직접 적으면 verify 가 막는다.
- **색은 모두 브랜드**(사람의 결정 — 11-12 의 초록 완료 원을 바꿈) — 완료 = `--surface-brand-primary` 면 + `--brand-label` 체크, 현재 = 같은 색 테두리 + `--surface-brand-subtle` 면 + `--foreground-brand-primary` 숫자, 아직 = `--line-neutral-primary` 테두리 · 면 없음, 완료 뒤 연결선 = 제품 색. 11-12 에 제품 색 원을 되돌린 이유(현재 원과 같은 면)는 현재 원이 테두리가 되어 모양으로 갈린다.
  초록 체크 쌍(REF)을 지워 contrast −6 · advisory −5. 새 쌍은 없다(흰 체크 / 제품 면 · brand 숫자 / brand subtle 은 기존 쌍 — 설명만 고침).
- **이동은 순서대로가 기본, `data-nonlinear` · `nonLinear` 는 자유 이동**(사람의 결정) — 순서대로면 완료한 단계만 `.step-btn`, 자유 이동이면 현재가 아닌 모든 단계. 자유 이동은 떠날 때 폼을 조용히 재서(문구 없이) 통과하면 완료로 표시하고, '완료' 는 모든 단계를 재서 막힌 첫 단계로 간다.
- **사람이 정하지 않은 기본값(계획 승인 때 함께 확인):** 원 24 → 32 · 체크 16 · 라벨 12 → Label 1/Normal 14(현재 600 · 완료 secondary · 아직 tertiary) · 연결선 2px(최소 16), 단계를 옮기면 새 패널(tabindex -1)로 포커스, 첫 단계의 이전은 disabled · 마지막 단계는 다음 대신 완료, 포커스 링은 원에. 가져오지 않은 것 — `role=tab` · 방향키(순서가 있는 진행이라 탭 묶음이 아님, `aria-current="step"` 유지), 높이 애니메이션, 검증 끄기 옵션(폼에 `data-validate` 를 안 달면 된다).
- **예제** default(가로 마법사 — 적용 그룹이 비어 '다음' 이 막힘) · label-below · vertical · nonlinear · indicator(표시만 — 이동은 제품, `.stepper` 밖 `.steps` 의 완료 단계 누름은 `ds:step` 만). `back` 은 default 에 흡수해 지웠다. 온보딩 '단계 화면' 을 `.stepper` 로 — 전에는 다음을 눌러도 카드가 그대로인 흉내였다. 이제 단계마다 카드가 바뀌고 조직 이름 폼을 검사한다(카드 아래 버튼은 React `StepButton`).
- **verify 더함:** 단계마다 `span.label`, 순서대로는 `.done` 만 `.step-btn` · 자유 이동은 현재 말고 모두, `.stepper` 의 패널 수 = 단계 수 · 보이는 패널 하나 = `.on` 의 자리(세로는 li 안), `data-step="next"` 버튼(완료는 선택 — 마지막 단계가 완료 화면인 온보딩).
- **라디오 카드 줄 줄바꿈**(사람의 요청 — 390 캡처에서 발견) — `.radio-group.row` 가 줄바꿈하지 않고 `.radio.card` 가 최소 폭 220 이라 390 에서 카드 둘이 넘쳐 잘렸다(온보딩 '보호 수준' 과 Radio Button 'Card Radio' 둘 다). 묶음은 `flex-wrap:wrap`(줄 사이 0.75rem), 카드는 `flex:1 1 13.75rem` 로 늘어나 줄을 채우고 안 들어가면 한 장씩 자리 폭으로. 최소 220 은 남겼다 — `min(13.75rem,100%)` 로 바꾸니 내용 폭으로 줄어드는 Radio 예제 묶음이 1440 에서도 줄바꿈했다(퍼센트 최소 폭은 내용 폭 계산에 들어가지 않음, 실측). 1440 의 두 예제는 전후 위치 · 폭이 같다. behave +2(1440 나란히 · 220 이상, 390 줄바꿈 · 자리 폭 · 줄 사이). 음성 시험 4건(줄바꿈 · 늘어남 · 최소 폭 · 줄 사이) 모두 잡혔다.
- **측정에서 드러나 고친 것:** 폼 안 Enter 가 '다음' 이 되지 않았다 — 문서 미리보기의 제출 막기(`app.src.js`)가 먼저 preventDefault 해서 단계 처리기가 `defaultPrevented` 를 보고 물러났다. 막힌 제출은 캡처의 검증이 멈추므로 `defaultPrevented` 를 보지 않는다(제품의 제출 처리기도 같은 일을 한다). behave.system 의 '패턴 버튼은 .btn 이거나 정의된 컴포넌트' 에 `.steps` 를 더했다(온보딩의 `.step-btn`).
- **기존 단정 고침:** 완료 원 초록 → 브랜드(behave.layout), back 예제 → indicator 예제 · `ds:step` 상세에 from · trigger(behave.nav), 온보딩 다음 · 이전이 카드를 바꾸고 이미 완료한 단계는 돌아가도 완료로 남음(behave.js — 전에는 이전으로 가면 완료가 풀렸다). Figma audit 의 Steps 기대값 — 예제가 템플릿 함수가 되어 데이터를 실행해 읽고, 라벨 색은 `.label` 에서, 아직인 원의 면은 '없음'.
- 음성 시험: 사이트 12건(CSS 6 · ds.js 6) · verify 5건 · React 10건. React 1건(제어형에서 내부 상태도 바꾸기)은 결과가 같은 변형이라 조건을 지웠다.
  좁으면 세로로: 사이트 5건 · verify 1건 · React 3건. 첫 회 3건을 못 잡았다 — 라벨 아래의 가운데 정렬 되돌림(라벨이 원 오른쪽이기만 하면 통과해 원과의 간격 12 를 재게 고침), 처음 그릴 때 재기(글꼴 준비 뒤에도 재서 통과 — 글꼴 준비가 끝나지 않는 페이지에서 재게 고침), React 의 떼고 재기(흉내 낸 폭이 클래스와 무관해 통과 — 쌓인 모양은 들어가게 흉내 내고 다시 그려 재게 고침). `min-width:0` 되돌림은 세로에서 묶이지 않는 쓸모없는 선언이라 지웠다.
- Figma 미반영 487 → 498건 — Step 세 상태의 원 · 숫자 · 체크 · 라벨 색 6, 예제 단계 순서 4(Figma 기본 예제는 현재가 3단계), 체크 아이콘 색 4, 체크 선 굵기 3(16 에 stroke 2.5 = 1.67 ≠ 1.5) 중 새로 어긋난 것. Figma 의 Steps 는 아직 초록 완료 · 원 24 · 라벨 12 이고 Label Below · 마법사 패널 · 자유 이동 변형이 없다 — 일괄 반영 때 그린다.
2026-11-13 File Upload 전송 중 지우기(사람의 요청 — 기능 점검에서 찾은 문서 빈칸) — 게이트 수는 그대로(문구만).
- 전송 중인 줄의 지우기 · 하나만 받는 자리의 교체는 `ds:upload-remove` · React `onRemove` 를 내는데(behave.upload 가 잼), 그때 **제품이 그 전송을 멈춘다**는 말이 사이트 문서에 없었다. 원칙 표에 '전송 중 지우기' 행, Props 의 이벤트 설명에 '교체될 때도 남 · 거절된 줄은 안 남'. React JSDoc 에는 이미 있었다.
- Figma 미반영 498건(그대로 — 원칙 표는 Placement 행만 대조).

2026-11-13 고르기 표 · Rules — 컴포넌트 페이지 구성 개편(사람의 결정 — 11-12 의 '정의 → 원칙 표 → 예제' 를 바꿈) — behave 1274 → 1276. contrast · advisory · react · pages 수는 그대로.
- **구성 = 정의 → 고르기 표 → Default · Variant · Size · State → Rules → Spec → Props → Usage.** 고르기 표(`choose`)는 정의 바로 아래의 `dl.kv` 로, 언제 쓰는가(필수) · 비슷한 것(선택) · Placement(필수) 세 줄까지다. 나머지 원칙은 예제 뒤 h2 'Rules' 로 옮겼다. 8줄을 넘는 Rules 는 h3 소제목으로 묶는다 — Data Table 다섯 묶음, Text Field 세 묶음. 패턴 페이지는 원칙 표를 위에 둔 그대로다.
- 43개 컴포넌트 모두 고르기 표가 있다. 원칙 표에 흩어져 있던 '언제 · 용도 · 고르기 · 링크와 버튼 · Button 과의 경계 · 옮기는 기준' 줄은 언제 쓰는가 · 비슷한 것으로 합쳤다(Button · Link 의 경계 문장, Table 의 '용도' 와 '옮기는 기준' 을 한 줄로). 문장을 옮기며 Slider 의 어긋난 표현을 고치고 정의와 겹치는 설명을 줄였다. 새로 쓴 언제 쓰는가 초안은 18개이고 괄호 없이 서술형으로 썼다(사람의 요청). Search 의 언제 쓰는가는 옮기다 빠져 손으로 쓴 초안이었고, 11-13 에 사람이 그대로 확정했다. Placement 문장은 고치지 않고 자리만 옮겼다.
- 모든 `div.kv` 를 `dl.kv`(dt · dd)로 바꿨다 — 사이트 · Foundations. 390 폭의 한 열 규칙도 `dl.kv` 로.
- **verify 더함:** 고르기 표의 언제 쓰는가 · Placement 각 하나 · 세 줄 이하 · 허용 항목과 순서, principles 에 고르기 항목이나 옛 이름 금지, 빈 묶음 금지, 묶지 않은 8줄 초과 금지, `div.kv` 금지, 정의 바로 뒤 `dl.kv`, 절 순서에 rules. audit 은 Placement 를 `choose` 에서 읽는다.
- behave +2 — Button 의 절 순서 · 고르기 표 키와 Rules 한 묶음, Data Table 의 Rules 다섯 묶음 순서. 기존 '원칙 표가 정의 바로 아래' 단정은 고르기 표 기준으로 고쳤다.
- 음성 시험 8건(Rules 를 예제 앞으로 · dl 을 div 로 · 390 규칙 · 언제 쓰는가 없음 · 네 줄 · 순서 · principles 의 옛 이름 · 9줄을 묶지 않음) 모두 잡혔다 — 390 규칙은 behave 만, 나머지는 verify 가 잡는다.
- Figma 미반영 498건(그대로 — audit 이 Placement 를 고르기 표에서 읽는다).

2026-11-13 수정 13건 — 글꼴 · 크기 · 색 · 차트 · 표 hover · Avatar Group · Time Picker 신규(사람의 요청 · 결정 넷) — pages 74 → 75 · 컴포넌트 43 → 44 · contrast 1434 → 1452 · advisory 455 → 449 · behave 1276 → 1306(`behave.revise.js` 11 · `behave.timepicker.js` 18 · 기본 표 hover 1) · react 732+6 → 759+6(`tests/revise.test.tsx` 5 · `tests/time-picker.test.tsx` 9 · polish 1 · table-optimize 1 · 예제 264 → 275 에 따른 구조 비교 11).
- **고정폭 글자는 Code 에만** — `.field.mono` 를 없앴고 Copy Field 값도 본문 글자 + `tabular-nums`. React `TextField mono` 는 경고하고 무시한다. verify 가 `.field.mono` 와 Code 밖 `--font-mono` 를 막는다. 기존 단정 셋(IP 필드 · Copy Field 두 곳의 '고정폭')을 반대로 고쳤다.
- **Page Header 제목 = Title 2 28/38**(11-12 의 Title 1 32/44 를 바꿈). **Tab 기본 16/24 · sm 14/20** — 높이는 기본 44 · pill 탭 34 그대로, sm 은 34 → 38(Figma 메타의 sm 38 과 같아짐).
- **Tag** — 중립 면 `--surface-neutral-tertiary`, Info 면 `--surface-neutral-secondary`(이제 둘이 갈린다), outline 테두리는 톤마다 그 색의 선 토큰. contrast +18 = Info 글자 secondary / secondary 면 쌍(× 바탕 3 × 맥락 6).
- **상태 틴트 12 → 8%**(사람의 결정 '함께 내림') — positive · cautionary · negative · accent 가족이 기준 값 8% 가 되어 `DEVIATIONS` 의 12% 를 지웠다. negative 단계는 라이트 8 · 12 · 16(hover 8 · pressed 12), 다크 8 · 16 · 22(hover 16 · pressed 22), 다크 strong 만 기준 22 → 16 을 `DEVIATIONS` 로. **advisory −6** = 다크 negative-strong 글자 / negative hover · strong 면 + 회색 바탕 쌍(맥락 셋 × 2)이 4.5 를 넘었다 — 옛 틴트 값을 생성 CSS 에 넣어 다시 재면 455 로 돌아오는 것으로 확인했다.
- **누적 영역 = 세로 그라데이션**(ds-chart `areaFill` — 계열의 가장 높은 점에서 바닥까지 알파 0.32 → 0.06, 사람이 정하지 않은 제안값. 첫 배치처럼 chartArea 가 없으면 단색).
- **'표로 보기' 는 옵션**(사람의 결정 — 11-10 의 '늘 있음' 을 바꿈) — `chartCanvas(…, {table:true})` · React `ChartCanvas table`(기본 false). 켠 예제는 data-visual timeseries 하나, 대시보드는 끔. verify 는 버튼이 `.chart-view` 첫 자식 `.chart-tools` 에만 · 차트 수 이하인지를 본다.
- **Top Navigation 선택 = 제품 색 면 + `--brand-label`**(hover 도 같음), **Notice · Banner 아이콘 = filled**(폼 요약 상자 포함, verify), **Combobox 활성 항목 = 면만**(외곽선 없음).
- **표 hover 는 옵션** — `.tbl.hover` · React `hover`. 켠 곳: 행을 고르거나 행 동작이 있는 Data Table 예제 넷 · 로그 뷰어. Table 예제는 끔. Data Table Rules '행 동작' 에 '행 hover' 줄(5 → 6).
- **Avatar Group**(사람의 결정 '이니셜만 + 외 N명') — `.avatar-group[role=group][aria-label]` · 겹침 -8(sm -6) · 경계 링 2px `--avatar-ring`(놓인 면) · 5개까지 · 넘친 수는 `.avatar-group-more` 글자 또는 목록을 여는 글자 버튼. React `AvatarGroup`. verify 가 개수 · 이름 · '외 N명' 형식과 자리를 본다.
- **Time Picker 신규**(사람의 결정 '입력칸 + 열 목록, 바로 반영') — `.field.timepicker > .affix > input + .tp-btn`, 열 목록 `.time-panel > .time-col[role=listbox] > .time-opt[role=option]` 은 ds.js 가 열 때 그린다. 24시간제 HH:mm · `data-seconds` · `data-step`(분 열 간격, 입력은 받음) · `data-min/max`(밖 칸은 끄고 입력은 받아 오류) · `data-messages` · `data-labels` · `ds:time {value, text, validity}` · `form[data-validate]` 참여. React `TimePicker` · `checkTime`(폼에는 `setCustomValidity` 로 — `validationMessage` 가 customError 를 읽게 했다).
  사람이 정하지 않은 기본값: 열 칸 56 × 32 · 8칸 높이, 고른 칸 = 제품 색 면 + 흰 글자, 빈 조각은 00 으로 채움, Tab 은 열 사이를 옮기고 필드를 떠나면 닫힘, 폭 160. Date Picker 시각 칸과 `clockBump` 를 함께 쓴다.
- **측정에서 드러나 고친 것:** `pasteText` 가 시각 단위에서 첫 조각(시)을 채우지 않아 마크업 값 `2:0` 이 `20:0` 이 됐다(사이트 · React — Date Picker 시각 칸 붙여넣기도 같은 함수). 그 수정이 strict 타입 검사(undefined 일 수 있는 값)에 걸린 tsc 1건은 — 2026-11-15 바로잡음: tsconfig 의 noUncheckedIndexedAccess 는 false 다 — 전체 게이트에서 잡혔다(vitest 는 타입을 안 봄). About 페이지 '컴포넌트 43개 · 패턴 11개' 와 build.js 문서의 '패턴 11개' 는 실제 10개였다 — 44 · 10 으로.
- **Figma audit 도구:** Tag 중립과 Info 의 칠이 같다고 가정하고 다르면 멈추던 것을 Neutral 을 제 톤으로 대조하게 바꿨다(Figma 에 Neutral 변형이 없으니 '없는 변형' 으로 센다). `tag.figma.variants` 의 info · neutral 면을 새 토큰으로.
- 음성 시험: 사이트 21건 · React 7건, 모두 실패로 잡혔다. 첫 회 2건을 고쳤다 — 끈 칸 단정이 빈 결과에서 예외로 멈춘 것(값 없음으로 실패하게), React 폼 문구 연결을 지워도 통과한 것(입력 경로가 문구를 따로 넣어서 — 처음 값이 잘못된 채 저장하는 테스트를 더함).
- **덤으로 본 것(고치지 않음):** 390 폭에서 Top Navigation 예제가 미리보기 오른쪽으로 잘린다 — 이번 선택 면 변경과 무관한 기존 가로 넘침으로 보인다.
- Figma 미반영 498 → 523건 — 상태 틴트 semantic 값 · Tag solid/outline 의 중립 · Info 면과 톤 선 · Tab · Page Header · Spec 문구 등. Time Picker · Avatar Group 은 Figma 에 없다(일괄 반영 때 그림).

2026-11-13 좁은 자리의 상단 바(사람의 결정 — 위 항목에서 남긴 것) — behave 1306 → 1307(`behave.nav.js` 1). contrast · advisory · react · pages 수는 그대로.
- 390 폭에서 Top Navigation 예제가 잘려 보였다. `.topbar{width:100%}` 라 면과 아래 선은 미리보기 폭 321 에서 끝나는데 로고 · 메뉴 · 오른쪽 묶음은 줄지 않아 기본 예제는 629, 검색 예제는 491 까지 나갔다. 스크롤하면 면 없는 자리에 메뉴와 아이콘이 떠 있었다. 768 · 1024 에서는 넘치지 않았다.
- **바 전체가 가로 스크롤**(사람의 결정 — 메뉴 줄만 스크롤 · 좁으면 메뉴 버튼으로 접기 대신, 데스크톱 콘솔 기준) — `min-width:max-content` 로 바가 내용 폭만큼 늘고 바깥(미리보기 · 제품 화면)이 가로로 스크롤한다. 넓은 자리에서는 전처럼 폭을 채운다.
- behave +1 — 1440 에서 세 예제가 폭을 채우고 스크롤 없음, 390 에서 내용이 바 안에 있고 바가 자리를 채우며 넘치는 두 예제만 스크롤, 높이 3.5rem(1279 이하는 루트 93.75% 라 52.5). 음성 시험: 규칙을 지우면 실패. 390 캡처로 오른쪽 끝까지 면과 테두리가 이어지는 것을 보았다.
- 같은 날 고르기 표 항목의 Search '언제 쓰는가' 초안을 사람이 그대로 확정했다. Figma 미반영 523건(그대로).

2026-11-13 Date Picker 시각 칸 = Time Picker sm(사람의 결정 — '칸마다 Time Picker', 달력 옆에 열을 늘 펼치는 안 · 그대로 두는 안 대신) — behave 1307 → 1326(`behave.dptime.js` 94 → 113) · react 759+6 → 764+6(`tests/date-time.test.tsx` 39 → 44). contrast · advisory · pages 수는 그대로(새 색 쌍 없음).
- 달력 아래 시각 칸(단일 하나 · 기간 둘)이 `.field.sm.timepicker[data-dp-side="a|b"] > label + .affix > input + button.tp-btn` 이 됐다. 시계 버튼(이름 '시각 선택' · '시작 시각 선택' · '종료 시각 선택', 문구 `timeOpen`)이 시 · 분(· 초) 열을 연다. 칸에 치기 · ↑↓ · Enter(적용)는 달력이 그대로 맡고, 범위 · 형식 검사는 지금처럼 적용할 때 필드가 한다 — 달력 안 칸은 오류 문구 · `ds:time` 을 내지 않는다. React `TimePicker` 에 `onTextChange` · `validate` 를 더해 `DatePicker` 가 쓴다.
- 열 목록이 열린 동안 Esc 는 목록만 닫고 시각 칸으로, 다음 Esc 가 달력을 닫는다(사이트는 캡처 단계에서 멈춤, React 는 `rootKeyDown` 이 `.timepicker.open` 안이면 `useEscape` 에 양보). 열 안의 Tab · Shift+Tab 은 브라우저 그대로(달력의 Tab 가둠이 `.time-panel` 은 건너뜀). Tab 순서에 시계 버튼이 하나 낀다.
- 달력은 피커 `.field` 안이라 바깥의 lg · 오류 · 열린 링이 시각 칸 `.affix` 로 내려온다 — `.calendar .cal-time .timepicker.field .affix` 로 32 · 기본 테두리 · 링 없음으로 되돌리고, 포커스 · 열림만 brand 링.
- **단정을 쓰다 드러나 고친 것:** 열 목록이 열린 채 시계 버튼에서 Esc 를 누르면 달력 전체가 닫혔다(단독 Time Picker 도 버튼의 Esc 를 받지 않았다 — 열린 Time Picker 안이면 어디서든 목록만 닫게). 첫 열의 Shift+Tab 이 달력 끝으로 돌았다. React Time Picker 의 ↑↓ 커서 복원이 `requestAnimationFrame` 이라 연달아 누르면 분 조각으로 넘어갔다(그린 직후 layout effect 로).
- **선택자를 좁힘:** ds.js 의 Date Picker 코드가 `.affix input` 을 첫 입력으로 찾았다 — 달력 안 칸도 `.affix input` 이라 `:scope > .affix input` · `.datepicker > .affix input` 으로(behave 의 Date Picker 선택자 31곳도). 피커에서는 필드 입력이 먼저 와서 결과는 같았다(MIGRATION — 제품 선택자도 좁히라고 적음).
- 기존 단정 고침: 사이트 넷(Tab 이 시계 버튼을 지나 푸터로 · 시계 버튼이 마지막 칸 · 작은 칸과 링을 `.affix` 에서 잼) · React 둘(Tab 순서).
- 음성 시험: 사이트 10건 · React 5건. 사이트 2건은 되돌려도 결과가 같은 변형이었다 — Time Picker 입력 처리를 달력 안 칸에서 건너뛰던 조건은 끊기가 두 번 돌아도 같아 지웠고, 필드 입력 선택자를 넓히는 변형도 시각 칸 처리가 뒤에서 다시 끊어 같았다(선택자는 정확도를 위해 좁힌 채 둠). 키보드로 치는 단정이 없어 하나 더했다(치면 09:15 · 열린 목록이 따라감 · Enter 로 적용).
- 처음 전체 게이트에서 새 React 테스트의 기간 prop 이름(`defaultPair` → `defaultValue`)이 tsc 로 잡혔다(vitest 는 타입을 안 봄).
- Figma 미반영 523건(그대로 — Date Picker Spec 의 Time 행은 이미 저장소에만 있는 행).

2026-11-14 모양 넷 — 사이트 h1 · 상단 내비 선택 · Tag sm · Count 점(사람의 요청, 속성값을 사람이 정함) — behave 1326 → 1328(`behave.revise.js` 2 · 기존 단정 고침 2). contrast · advisory · react · pages 수는 그대로(새 색 쌍 없음).
- **문서 사이트 h1 = Title 1 32/44 · 700 · -0.0253em**(11-12 의 Display 3 36/48 을 바꿈). Foundations 쓰임 표의 '페이지 타이틀' 도 Title 1 로 고쳤고, 제품 화면의 Page Header 제목은 Title 2 그대로라고 적었다. 홈 hero 제목(Display 1)은 그대로다.
- **상단 내비 선택 = brand 글자 + 아래 2px brand 선, 면 없음**(11-13 의 제품 색 면 · 흰 글자를 바꿈) — 둘 다 `--foreground-brand-primary`. 메뉴 모서리를 없애고 메뉴 사이를 4 → 8 로 넓혔다.
  **사람이 정하지 않은 것:** 다른 메뉴에도 투명한 2px 아래 선을 줬다 — 선택 메뉴만 선이 있으면 그 메뉴만 2px 높아져 글자 줄이 어긋난다. 그래서 메뉴 높이가 38 → 40 이 됐다(바 높이 3.5rem 은 그대로).
- **Tag sm = Caption 2 11/14 · 위아래 2 · 좌우 8**(12/16 · 위아래 1 이었다). 높이 18 은 그대로다. Spec Size · Label 문구를 고쳤다.
- **Count 점 위치 = 감싼 틀 모서리에서 -2**(`.with-count .count.dot`, 숫자 배지는 -6 그대로). `.with-count .count`(0,2,0)를 이기도록 `.count.dot` 까지 적었다. Indicator Spec · Props 에 적었다.
- 기존 단정 고침 2: 사이트 h1(behave.type), 상단 내비 선택(behave.revise — 면 · 흰 글자에서 brand 글자 · 2px 선 · 면 없음 · hover 같음 · 다른 메뉴 투명 선 · 간격 8 · 모서리 0 · 메뉴 높이 · 위치 같음, 라이트 · 다크). 새 단정 2: Tag sm 크기 · 여백 · 높이, Count 점 · 숫자 배지 위치.
- 음성 시험 8건(h1 36 · 선택 선 · hover · 투명 선 · 간격 · 모서리 · Tag sm 옛 값 · 점 규칙) 모두 잡혔다. 첫 회 2건을 못 잡았다 — 선택 선 변형은 같은 글이 Tab accent 규칙에 먼저 있어 엉뚱한 곳을 바꿨고(선택자까지 넣어 다시 잡음), `a.on:hover` 선택자는 명시도가 `:hover` 규칙과 같고 뒤에 있어 쓸모없는 선택자라 지웠다.
- MIGRATION 에 보이는 모양 변화 셋(상단 내비 · Tag sm · Count 점)을 적었다. 사이트 h1 은 문서 셸 전용이라 패키지와 무관하다. Figma 미반영 523건(그대로 — 상단 내비 선택 · Tag sm · Count 점 위치는 audit 대조 밖, 일괄 반영 때 그린다).

2026-11-14 Tree 신규 — 1.0 뒤로 미뤘던 것을 앞당김(사람의 결정 넷) — pages 75 → 76 · 컴포넌트 44 → 45 · behave 1328 → 1345(`behave.tree.js` 17) · react 764+6 → 779+6(`tests/tree.test.tsx` 10 · 예제 275 → 280 에 따른 구조 비교 5). contrast · advisory 수는 그대로(새 색 쌍 없음 — 기존 토큰만 씀).
- **탐색형이 기본, 체크박스형은 옵션**(사람의 결정) — 사이트 `ul.tree[role=tree][aria-label] > li.tree-item[role=treeitem][aria-level] > .tree-row + ul.tree-group[role=group]`, React `Tree`. WAI-ARIA tree 이고 Tab 칸은 트리에 하나(roving tabindex)다.
  탐색형은 클릭 · Enter · Space 로 하나를 고르고 `ds:tree-select {value, label}` · `onSelect` 를 낸다. 체크박스형은 `.checkable[aria-multiselectable]` 에 항목마다 `aria-checked` 를 달고, 상위가 하위를 따라가며 일부만 켜지면 mixed 다. `ds:tree-check {value, checked, values}` · `onCheckedChange` 의 values 는 켜진 모든 항목이고 상위도 들어간다.
  셰브론은 펼치기만, 행은 고르기 · 켜기만 한다. 하위가 있는 항목은 `aria-labelledby` 로 제 라벨만 가리킨다 — 그러지 않으면 이름에 하위 글자까지 들어간다.
- **하위 불러오기는 상태와 이벤트만**(사람의 결정) — `li[data-lazy]` 를 펼치면 `ds:tree-load {value, resolve(items), reject(msg)}` · React `onLoad(value) => Promise`. 조회는 제품 몫이다. 불러오는 동안 셰브론 자리에 스피너와 `aria-busy` 가 붙고, 실패하면 접힌 채 줄 끝에 '불러오지 못했습니다' 를 보이고 알림 영역에도 읽힌다. 다시 펼치면 다시 부른다.
- **검색 필터를 넣음**(사람의 결정) — `.tree-view > .searchbar.sm + .tree` · React `searchable`. 맞는 항목과 그 상위만 남겨 펼치고 맞는 글자를 굵게 한다. 초성으로도 찾고, 결과 수를 알리며, 하나도 없으면 안내 문구를 보인다. 비우면 검색 전 펼침으로 돌아가고, 검색칸에서 ↓ 를 누르면 첫 항목으로 간다. 아직 불러오지 않은 하위는 찾지 않는다(서버 검색은 제품 몫).
- **끌어 옮기기는 넣지 않음**(사람의 결정).
- **제안을 사람이 확인한 기본값(여섯 다 유지 — 크기 · 줄바꿈 · 끈 항목 · 고른 행 · 포커스로 고르지 않음 · `*` 건너뜀, 같은 날 선택지로 물음):**
  - 크기: 행 32 · 단계마다 들여쓰기 20 · 8단계까지(verify) · 글자 Label 1/Normal 14/20 · 체크 상자 16.
  - 모양: 고른 행은 brand subtle 면과 brand 글자 600, hover 는 tertiary 면, 포커스 링은 행 안쪽 1px. 긴 이름은 자르지 않고 줄바꿈한다.
  - 동작: 포커스만으로는 고르지 않는다. `*` 는 같은 단계를 모두 펼치되 불러와야 하는 항목은 건너뛴다(한꺼번에 조회하지 않게). 글자로 찾기는 0.5초 버퍼이고 초성으로도 찾는다.
  - 끈 항목은 포커스 · 펼치기는 되지만 고르거나 켤 수 없다. 상위를 켜도 끈 하위는 꺼진 채라 상위가 mixed 로 남고, 다시 누르면 꺼진다. 끈 이유 글자는 tertiary(Card 의 끈 이유와 같은 결정).
- **verify 더함:** role · 이름, 체크박스형과 aria-multiselectable, 트리 안 링크 · 버튼 · 입력 금지, aria-level = 단계 · 8단계까지, 하위 목록 role, 접힌 항목의 하위만 hidden, 하위가 있거나 불러올 항목만 aria-expanded, data-lazy 는 하위가 없을 때만, 상위의 aria-labelledby, 상위 aria-checked = 하위에서 계산한 값, Tab 칸 하나, 고른 항목 하나 · 체크박스형에는 aria-selected 없음.
- **측정에서 드러나 고친 것:** 상위를 다시 눌러도 꺼지지 않았다 — 끈 하위가 있으면 상위 자신이 mixed 라 '모두 켜짐' 판정에서 늘 빠졌다. 끝 항목만 보게 고쳤다(사이트 · React). 끈 이유 글자가 끈 글자색과 같아 거의 보이지 않았다(tertiary 로). verify 의 트리 정규식이 `tree-group` 까지 잡아 거짓 실패 111건이 났다.
- 음성 시험: 사이트 CSS 6 · ds.js 8 · verify 4 · React 8건. 첫 회 5건을 못 잡았다.
  - 변형이 잘못된 3건 — 초성 찾기 변형은 같은 글이 Select 쪽에 먼저 있어 엉뚱한 곳을 바꿨고, 체크 상태 변형은 바꿀 글을 찾지 못했고, Tab 칸 변형은 실제로 칸이 늘지 않았다. 고쳐 다시 깨서 잡았다.
  - `*` 가 불러올 항목까지 펼치는 변형은 사이트 단정에 그런 경우가 없어 단정을 더해 잡았다.
  - 접을 때 하위에 있던 포커스를 상위로 옮기는 코드는 쓸모가 없어 지웠다(사이트 · React). 셰브론을 누르면 포커스가 이미 상위로 가기 때문이다.
- 전체 게이트에서 tsc 1건 — `TreeNode.icon` 이 string 이라 Icon 이름 타입에 맞지 않았다(`IconName` 으로). vitest 는 타입을 안 봐서 통과했다.
- Figma 미반영 523 → 524건(Tree Spec 카드 없음). Tree 는 Figma 에 없다 — 일괄 반영 때 그린다.

2026-11-14 Notification Center 신규 — 1.0 뒤로 미뤘던 것을 앞당김(사람의 결정 여덟) — pages 76 → 77 · 컴포넌트 45 → 46 · behave 1345 → 1356(`behave.notify.js` 11) · react 779+6 → 792+6(`tests/notification-center.test.tsx` 9 · 예제 280 → 284 에 따른 구조 비교 4). contrast · advisory 수는 그대로(새 색 쌍 없음 — 기존 토큰만 씀).
- **벨 아래 팝오버**(사람의 결정) — `.notify > .with-count(.tooltip-wrap > button[aria-haspopup=dialog][aria-expanded][aria-controls] + .count) + section.notify-panel[role=dialog][aria-labelledby][tabindex=-1]`, React `NotificationCenter`. 비모달이다. 열면 패널로 포커스, Esc 는 팝오버만 닫고 벨로(캡처 단계 — 바깥 대화상자까지 닫지 않음), 바깥 누름 · Tab 으로 떠남도 닫는다. `ds:notify-open {open}`.
- **누른 항목 + 모두 읽음**(사람의 결정) — 열기만 해서는 읽음이 되지 않는다. `ds:notify-read {ids, all}` · `onRead(ids, {all})`, 저장은 제품. 이미 읽은 항목은 이벤트를 내지 않고, 안 읽은 것이 없으면 '모두 읽음' 은 `aria-disabled`.
- **새 알림의 화면 갱신까지 시스템, 연결은 제품**(사람의 결정) — `DS.notify.add(el, items)` 가 맨 위 '오늘' 묶음에 넣고, 하나면 '새 알림: 제목' · 여럿이면 '새 알림 n건' 을 한 번 알린다. React 는 `items` 에 새로 들어온 안 읽은 항목을 센다. 마크업을 직접 고치면 `DS.notify.sync(el)`.
- **탭 전체 · 안 읽음**(사람의 결정) — 한 `.tab-panel.notify-body[data-static]` 을 거른다(`data-static` 이 ds.js 탭의 글자 바꾸기를 막는다). 안 읽음 탭은 읽은 항목 · 빈 묶음을 숨기고 없으면 '안 읽은 알림이 없습니다.'
- **항목 누름 = 관련 화면으로 이동**(사람의 결정) — `a.notify-link[href]` 는 읽음 + 이동 + 닫힘, 갈 화면이 없는 항목은 `button.notify-link` 로 읽음만(열린 채, 포커스 유지). React 라우터는 `onNavigate(item, e)`.
- **오래된 알림 = '이전 알림 보기' 버튼**(사람의 결정 — verify 가 '더 보기' 를 모호한 라벨로 잡아 이름을 바꿈) — `ds:notify-more {resolve(items, {done}), reject(msg)}` · React `hasMore` · `onMore() => Promise`. 불러오는 동안 스피너 · `aria-busy`, 몇 건 왔는지 알리고, 끝이면 버튼을 지우고 새 첫 항목으로 포커스. 실패는 버튼 위 문구(role=status) + '다시 시도'.
- **심각도가 있는 항목은 앞에 Tag**(사람의 결정 — `.tag.sm` 다섯 톤) · **항목마다 동작은 두지 않음**(사람의 결정 — verify 가 항목 안 다른 조작을 막음).
- **안 읽은 수 하나가 다섯 곳에** — 벨 Count(99 초과 99+, 0 이면 마크업에 없음 — Indicator 의 Count 0 규칙), 벨 이름 · Tooltip '알림 n건', 안 읽음 탭 Count, 항목의 숨긴 ', 안 읽음'. `nfSync` 가 함께 맞춘다.
- **자리** — 넘침을 자르는 곳(미리보기 · 표) 안에서 벨로 열면 화면 기준(`.float`, `--float-x/y`)으로 뜨고 바깥 스크롤 · 창 크기 변경에 닫는다(closeFloats). 패널 본문의 스크롤은 닫지 않는다. 그 밖에서는 오른쪽 맞춤이 화면 왼쪽을 넘으면 민다(`--nf-dx` — verify LOCAL · sync-css).
- **제안을 사람이 확인한 기본값(같은 날 선택지로 물음 — 모두 유지):** 패널 폭 380 · 최대 높이 560, 안 읽음 = 제품 색 점 8 + 굵기 600, Tab 으로 떠나면 닫힘, 링크 항목은 누르면 닫힘, 보조 · 시각 글자 12/16 secondary, 열면 패널로 포커스. 묻지 않은 것: 항목 padding 12/20 · 글자 14/20.
- **verify 더함:** 벨의 aria-haspopup · aria-controls = 패널 id · aria-expanded = 열림, 패널 role=dialog · aria-labelledby 가 제목, 이름 있는 tablist 와 data-filter all · unread, 항목마다 `.notify-link` 하나(a[href] 또는 button) · 그 안 다른 조작 금지, 숨긴 ', 안 읽음' 은 안 읽은 항목에만, 심각도 Tag 톤, 벨 이름 · Tooltip · Count 가 안 읽은 수와 같음 · 0 이면 Count 없음, '모두 읽음' 의 aria-disabled 는 안 읽은 것이 없을 때만.
- **측정에서 드러나 고친 것:**
  - ds.js 의 `init()` 이 파일 중간에서 돌아 그 뒤에 선언한 문구 상수(`NF_LABEL`)가 아직 없었다(PAGEERROR) — `init()` 호출을 `window.DS` 바로 앞으로 옮겼다.
  - flex 행에서 `.notify` 가 늘어나 패널이 벨이 아니라 늘어난 높이 아래(552px)에 붙었다 — `height:max-content`.
  - 사이트 셸의 `h2:first-of-type`(0,1,1)이 패널 제목에 위 여백 24 를 줬다 — 선택자를 `.notify-panel .notify-title` 로.
  - 항목 글자의 줄 높이가 22 로 재졌다 — `.notify-link` 에 20 을 정했다.
  - **처음부터 열린 패널이 390 에서 미리보기 왼쪽에 잘렸다(캡처에서 발견)** — `nfInit` 이 자리를 재지 않았다. 처음 열린 패널을 띄우면 첫 페이지 스크롤에 닫히므로 띄우지 않고, 넘침을 자르는 영역 안 8px 에 들도록 좁히고 민다(`nfFit` · React `fit`, 창 크기가 바뀌면 다시 맞춤). 벨로 연 패널은 전처럼 띄운다.
- 음성 시험: 첫 회 사이트 CSS 6 · ds.js 11 · verify 6 · React 6건 중 4건을 못 잡았다.
  - 본문 스크롤 · 화면 기준 띄움 — 단정이 없었고, 띄움을 지우면 항목 클릭이 시간 초과(30초)로 던져 **behave 전체가 멈췄다**(exit 2 — 뒤의 검사가 돌지 않고 수도 나오지 않음). 긴 목록 단정을 새로 두고, 열고 닫기 단정에 '떠서 네 모서리가 보임' 을 더해 클릭 전에 실패로 잡게 했다.
    그리고 `behave.notify.js` 의 열한 부분을 `step()` 으로 감쌌다 — 한 부분이 던지면 그 부분의 실패로 남기고(테마마다 한 부분이라 단정 수는 늘 11) 다음으로 간다. 이 묶음의 기다림은 5초(끝나면 30초로 되돌림). 띄움 변형은 이제 멈추지 않고 notify 4/11, 처음 열린 패널을 띄우는 변형은 7/11 로 끝난다.
  - 왼쪽 넘침 밀기 — 390 예제가 늘 띄움 경로를 타서 밀기 경로가 돌지 않았다. 넘침을 자르지 않는 자리에 복제한 벨로 잰다.
  - 숨긴 ', 안 읽음' 맞추기 — 처음 상태만 쟀다. 읽음 · 모두 읽음 · 새 알림 뒤를 더했다.
  - 처음 열린 패널 맞추기를 더한 뒤 사이트 3 · React 2건(맞추지 않음 · 창 크기 · 처음부터 띄움 · React 좁힘)을 더 깨서, 모두 실패로 잡았다.
- Figma 미반영 524 → 525건(Notification Center Spec 카드 없음). Notification Center 는 Figma 에 없다 — 일괄 반영 때 그린다.

2026-11-14 behave 덩어리 가드(사람의 요청 — 알림 센터에서 쓴 방식을 다른 묶음에도) — 게이트 수는 그대로(behave 1356/1356, 단정 이름 목록이 전후 같음).
- **왜:** 단정 하나가 던지면(클릭이 닿지 않음 · 요소 없음 · 시간 초과) behave 전체가 exit 2 로 멈추었다. 뒤의 묶음이 돌지 않았고, 결과는 끝에 한꺼번에 찍으므로 그때까지의 결과도 나오지 않았다. 게이트는 'behave 결과를 읽지 못했습니다' 만 보였다.
- **`behave.js` 본문을 91 덩어리로 나눴다.** 경계는 최상위의 `await go(…)` 와 `await require("./behave…")(…)` 이다. 덩어리가 던지면 '— threw; the rest of this part did not run' 실패 하나를 남긴다. 그다음 Esc · 포인터 치우기 · 화면 1440 · 기본 시간 제한 30초 · 라이트 테마로 되돌리고 다음 덩어리로 간다.
  덩어리를 넘어 쓰는 최상위 변수 21개는 본문 맨 위 `let` 한 줄에 모았다. 새 최상위 변수를 다음 덩어리에서 쓰려면 그 줄에 더한다. 덩어리 밖, 즉 머리와 꼬리에서 던지면 바깥 catch 가 그때까지의 결과를 찍고 'behave stopped outside a part' 를 실패로 센 뒤 exit 2 로 끝낸다.
- **page 기반 묶음 17개도 안을 나눴다** — `behave.part.js` 가 덩어리를 돌린다. 경계는 `await go(…)` 와, 제 줄에 따로 있는 블록 주석(절 제목)이 붙은 최상위 문이다. 묶음마다 1 ~ 17 덩어리이고, 실패 이름은 '파일: 번호 · 절 제목' 꼴이다. 덩어리를 넘는 변수는 그 묶음의 `let` 에 둔다.
  b 기반 묶음 여섯(dp · dptime · polish · later · expand · scale)과 notify 는 이미 단정마다 `step()` 이 있어 그대로 두었다. `behave.system.js` 는 `behave.js` 의 덩어리 하나로만 막는다.
- **덩어리가 던지면 그 덩어리의 나머지 단정은 돌지 않아 전체 수가 줄어든다.** 그래도 실패가 하나 이상이라 게이트는 막힌다.
- 변환은 acorn 으로 했다. 식별자 참조를 덩어리별로 세어 덩어리를 넘는 이름만 끌어올렸으므로 스코프와 가림이 원래와 같다(모듈의 `over` 를 본문 `over` 가 가리는 것 포함). `git diff -w` 는 664줄 추가 · 67줄 삭제이고, 나머지는 들여쓰기다.
- **음성 시험 — 넷을 한 번에 넣었고 모두 잡혔다:** ① behave.js 덩어리(slider) 안에서 없는 요소를 클릭하게 했다. ② tree 묶음의 둘째 덩어리에서 같은 클릭을 넣었다. ③ dp 묶음이 step 밖에서 던지게 했다. ④ `b.close()` 앞에서 던지게 했다.
  결과는 1259/1263 이고 exit 2 다. 실패는 넣은 넷뿐이다. tree 의 뒤 덩어리 · dptime · system 은 그대로 돌았고, 바깥 catch 가 결과를 모두 찍었다.
- Figma 미반영 525건(그대로).

2026-11-14 일본어 한자 서체 — Pretendard JP(사람의 요청 '한국어 · 영어 · 일본어 지원 제품', 결정 셋) — behave 1356 → 1360(`behave.font.js` 4) · react 792+6 → 793+6(`tests/font-jp.test.ts` 1). contrast · advisory · pages 수는 그대로(색 변화 없음).
- **잰 근거:** `PretendardVariable.woff2` 는 한글 · 라틴 · 숫자 · 히라가나 · 가타카나 · 전각 괄호는 그리지만 **한자가 하나도 없다**(CDP `CSS.getPlatformFontsForNode`).
  그래서 일본어의 한자만 시스템 서체가 그렸다 — 맥 Apple SD Gothic Neo(한국식 자형 · 다른 디자인), Windows 는 설치된 서체에 따라 다름. Date Picker ja-JP 의 '2026年9月' 도 한 줄에 서체 둘이었다.
- **Pretendard 뒤에 한자용으로**(사람의 결정 — `:lang(ja)` 에서만 · 시스템 일본어 서체 대신) — `--font-sans:"Pretendard","Pretendard JP",…`. 한글 · 라틴 · 가나는 지금처럼 Pretendard, 한자만 Pretendard JP.
  Pretendard JP 의 범위에는 한글이 0자라(한자 12,747 · 히라가나 93 · 가타카나 96) Pretendard 를 대신할 수 없다. 한국어 문장 안의 한자도 일본식 자형이 되는 것이 대가다(보안 콘솔에서는 드묾 — 한국식은 `ss05`).
- **조각 119개 · 합계 4.7MB**(3 ~ 121KB) — 조각마다 `unicode-range` 라 그 범위의 한자가 화면에 나올 때만 받는다. 잰 값: Button 페이지 0개, Date Picker 페이지 7개.
- **내려받아 직접 호스팅**(사람의 결정 — 폐쇄망 제품) — `orioncactus/pretendard@v1.3.9` 의 `packages/pretendard-jp/dist/web/variable/woff2-dynamic-subset/` 와 `dist/web/variable/pretendardvariable-jp-dynamic-subset.css`(unicode-range), 라이선스는 OFL 1.1(`fonts-jp/OFL.txt` — 서체와 함께 배포).
  family 는 원본의 'Pretendard JP Variable' 을 "Pretendard JP" 로 바꿨다(Pretendard 쪽도 "Pretendard").
- **사이트는 모든 페이지가 `assets/font-jp.css` 를 링크**(ja-JP 예제 · Typography 일본어 견본), **패키지는 선택 파일**(사람의 결정) `import "@jiran/ds-react/font-jp.css"`(exports · README · MIGRATION). 불러오지 않으면 이름을 건너뛰어 전과 같다.
- **크기:** 높이는 그대로다(달력 339 · 제목 28 · 버튼 32 — 전후 같음). 한자 폭만 글자당 약 0.9px 넓어졌다('2026年9月' 94.09 → 96.41, '今日' 39.38 → 41.11). 1440 라이트 · 다크 · 390 캡처로 보았다.
- **verify 더함:** `--font-sans` 의 Pretendard 바로 뒤 "Pretendard JP" · 조각마다 family · 파일 · `unicode-range` · 한글 범위(U+AC00–D7A3) 없음 · OFL 동반 · 모든 페이지 링크 · Typography 문서의 '조각 N개' = 실제 수. `sync-css.mjs` 도 조각 파일이 다 있는지 · 서체 순서를 본다.
- **behave.font:** 글자별 서체(한자 = JP 만, 가나 · 한글 · 숫자 = Pretendard 만, '2026年9月' = 5 + 2) · 가변 굵기(300 < 400 < 700 잉크 — 합성 굵기로는 300 과 400 이 같다) · 새 컨텍스트에서 조각 요청(한자 없는 페이지 0 · Date Picker 는 전체의 1/4 미만) · ja-JP 달력 크기.
- 음성 시험: 사이트 6건(서체 순서 · unicode-range 지움 · 링크 지움 · 조각 하나 뺌 · 한글 범위 넣음 · 문서 수 틀림) 모두 verify 가 잡았다. behave 는 화면에 드러나는 둘(서체 순서 · 링크)을 잡고, 나머지 넷은 화면이 같아 verify 만 잡는다.
  React 2건(exports 지움 · 조각 하나 지움) 모두 실패로 잡혔다.
- **보지 못한 것:** Windows · 다른 브라우저(Playwright Chromium 맥에서만 쟀다), 실제 일본어 제품 화면. Figma 에는 Pretendard JP 가 없다(플러그인 환경에 Pretendard 계열 0건) — 반영 보류 규칙대로. Figma 미반영 525건(그대로).

2026-11-14 제품 색 재설정 — 팔레트 여섯 · 자동 중립 폐지 · 삭제 버튼 중립 · 빨강/주황 입력 링 중립(사람의 요청 · 결정 여덟) — contrast 1452 → 2940 · advisory 449 → 920 · behave 1360 → 1412(`behave.product.js` 14) · react 793 → 798(`theme.test` 5). pages · verify 수는 그대로.
- **팔레트 여섯**(사람의 결정) — 파랑 `#0066FF`(기본 토큰, 주입 없음) · 빨강 `#C30D2A` · 시안 `#00828B` · 주황 `#FF7F00`(Company) · 중립 · AI `#6541F2`. 옛 제품 A · B · C(시안 #00AAB6 · 빨강 · 초록 #008760)를 바꿨고 초록은 뺐다.
  정의는 `data.js` 의 `PRODUCTS` 하나(kind base · ramp · neutral · ai, `exception` · `neutralFocus` · `gradient`)이고 사이트 헤더 메뉴 · Foundations › Colors 'Product color' 표 · contrast 맥락 · verify 가 읽는다. React 는 같은 값의 `PRODUCT_COLORS` + `applyProductColor(key)` 이고 테스트가 `data.js` 와 대조한다.
  적용은 `<html data-accent="키">`(파랑은 속성을 지움) — 옛 `data-accent-neutral` 은 `data-accent="neutral"` 이 됐다. **1.0 뒤에는 사용자가 색을 더하거나 고치는 팔레트를 준다(사람의 요청 — 메모리에 알림).**
- **상태색과 겹치면 회색으로 바꾸던 규칙을 없앴다**(사람의 결정 — 제품의 독립성). 사이트만 `STATUS_HUES` 로 바꿔 같은 빨강이 React 에서는 빨강, 사이트에서는 회색이었다. verify 가 네 파일(app.src · style.src · contrast · theme.ts)에서 그 이름이 되살아나면 막는다.
- **시안은 같은 색조에서 밝기만 낮춰 `#00828B`**(흰 글자 2.83 → 4.60, 사람의 결정). **주황은 회사 색 그대로이고 흰 글자 2.53 을 예외로 선언**(사람의 결정 — `exception` 에 이유, 비우면 verify 가 막음). 그 맥락의 brand 쌍은 contrast 가 실패가 아니라 advisory 로 보고한다(라이트 18 · 다크 4). `--company-mark` 는 그대로다.
- **AI = 단색 violet-50 + 넓은 면만 그라데이션**(사람의 결정) — 주 버튼 · Banner 에만 `background-image:var(--surface-brand-gradient)`(purple-40 → violet-45, hover purple-30 → violet-40 · 누름 purple-30 → violet-30 — 끝 색은 사람이 정하지 않은 기본값, 흰 글자 4.5 를 verify 가 끝마다 잰다). 체크박스 · 링크 · 내비처럼 그라데이션을 칠할 수 없는 곳은 단색이다.
  토큰 셋은 다른 제품에서 `none` 이라 단색 제품의 주 버튼은 그대로이고, 비활성은 `background` 단축 속성이 그라데이션을 지운다.
- **삭제 버튼(`.negative`)은 모든 제품에서 중립**(사람의 결정 — 빨강 제품의 주 버튼과 헷갈리지 않게). Assistive 와 같은 규칙으로 합쳤고 클래스 · React `color="negative"` 는 그대로다. 빨강은 위험 확인 팝업 제목 · 메뉴 위험 항목 글자에만 남는다. Button Rules '삭제는 중립' 행.
  쓰는 곳이 없어진 `--surface-negative-heavy · hover · pressed` 는 `grammarOnly` 로(Figma 변수와 짝이라 일괄 반영 때 정리).
- **입력 포커스 · 열린 필드 링은 빨강 · 주황 제품만 중립**(사람의 결정 — 빨강은 오류 링, 주황은 경고색과 헷갈리지 않게). 새 토큰 `--line-field-focus` · `--line-field-focus-halo`(기본 = 지금의 brand 링)를 링 규칙 아홉이 쓰고 `:root:is([data-accent="red"],[data-accent="orange"])` 에서 중립으로. 그 키 목록을 verify 가 `neutralFocus` 와 대조한다. 오류 필드는 늘 빨강, 체크박스 · 버튼의 외곽선은 brand 그대로. Text Field Rules '포커스 링' 행.
- **다크 brand 글자(60 단계)는 4.5 까지 자동으로 밝힌다**(사람의 결정 — 첫 빌드에서 다크 빨강 3.66 ~ 4.4 · AI 4.39 로 contrast 실패 11건). `accentScale` 이 다크 바탕 셋(#1B1C1E · #212225 · #0F0F10)에서 4.5 가 될 때까지 밝기를 0.5 씩 올린다(사이트 · React 같은 식, 게이트처럼 소수 둘째 자리 반올림 — 파랑 #3385FF 는 4.499 라 반올림하지 않으면 밝혀졌다). 빨강 #EF1437 → #F34B65 · AI → #9076F6, 파랑 · 시안 · 주황은 그대로.
- 토큰 100 → 105 — 시멘틱 85 → 90(`ADDITIONS` 다섯: field focus 둘 · brand gradient 셋). Colors 에 Surface - Brand Gradient(견본은 AI 값) · Line - Field Focus(후광이 반투명이라 체커 — 체커 절 14 → 15) 절, 'Product color' 표(갈래 · 값 · 흰 글자 대비는 빌드가 hex 에서 계산 · 적용 버튼).
- **수의 근거:** contrast 맥락이 라이트 · 다크 × 셋(기본 · 다른 제품 · 겹치는 제품)에서 × 팔레트 여섯으로 6 → 12, 맥락당 242 → 245(`--line-field-focus` 3:1 × 바탕 3) = 2940. advisory 는 맥락이 늘어 라이트 103 · 다크 44 ~ 49 가 여섯 번씩 되고 주황 라이트가 121(+18 예외). behave +52 = `behave.product` 14(삭제 버튼 중립 세 형태 · 빨강 위험 글자 · AI 그라데이션 주 버튼 · Banner · 비활성 없음 · 단색 제품 none · 링 여섯 색 · 오류 링 · 열린 Select · 새로 읽어도 유지 · 파랑이 --prod-* 지움) + 옛 제품 단정을 팔레트 여섯으로 다시 쓴 몫 38(색마다 면 hex · 단계 규칙 · AA, AA 루프 키 3 → 5 — 주황은 예외라 그 예외가 실제로 4.5 미만인지만 잰다). 기존 단정 고침: Colors 절 수에서 Product color 를 뺌, 그라데이션 견본은 background-image 로 칠함, Button Rules 2 → 3행.
- **바뀌기 전과 같은지(파랑):** 버튼 · Banner 172개의 계산값(면 · 그라데이션 · 글자 · 테두리 · 그림자 · 크기 · 스피너)이 HEAD 와 라이트 · 다크 모두 같고, Banner · 입력 링 · Select · Checkbox · Navigation 예제는 HEAD 와 픽셀이 같다(삭제 버튼만 의도대로 다름).
- 음성 시험 10건 모두 잡혔다 — 자동 중립 되살림(verify) · 삭제 버튼 빨강(behave 2) · 빨강 링 brand · 시안 링 중립(verify · behave 2) · AI 그라데이션 토큰 지움(verify · behave 2) · 비활성에 그라데이션(behave 1) · 시안 #00AAB6 · 주황 예외 지움(contrast · verify · React) · React 표만 어긋남(React) · 다크 밝히기 지움(contrast 11).
- **Figma audit 도구:** 삭제 버튼 규칙을 합친 셀렉터(`.btn:where(.solid.assistive,.solid.negative)`)를 `cssRule` 이 찾지 못해 Button 대조 전체가 '읽지 못함' 하나로 줄어 있었다(그대로 두면 미반영이 적어 보였다) — `:where` · `:is` 목록을 갈래마다 펼쳐 찾게 했다(`expandWhere`).
- **눈으로 본 것:** 빨강 제품에서는 로그 뷰어의 켠 필터 칩(CRIT · HIGH · WARN)도 빨강 면이 된다 — 포인트 색이 제품 색을 따르는 결정대로이고 바꾸지 않았다.
- Figma 미반영 525 → 693건 — Negative 버튼 변형(Figma 는 빨강) · Text Field · Date Picker · Search 포커스 상태(Figma 는 brand 토큰, 저장소는 `--line-field-focus`) · 저장소에만 있는 토큰 6 → 11. 팔레트 · 그라데이션은 Figma 에 없다 — 일괄 반영 때 그린다.

2026-11-15 Data Visual 한 세트 — 한 톤 · 차트 카드 한 틀 · 새 차트 넷(사람의 요청 · 결정 여덟) — contrast 2940 → 3120 · advisory 920 → 944 · behave 1412 → 1432(`behave.chart.js` 20) · react 798+6 → 820+6(`tests/data-visual-set.test.tsx` 15 · 예제 284 → 291 에 따른 구조 비교 7). pages · verify 수는 그대로.
- **목표(사람의 요청):** 디자인 시스템 사용자가 차트를 쉽게 넣고, 어느 차트를 골라도 한 화면에 한 세트로 어울리게. 심각도 · 요소 구분이 아니면 한 톤.
- **라이브러리는 Chart.js 4.6.1 유지**(사람의 결정) — MIT 라이선스이고 토큰 · 사이트 · React · 단정이 이미 붙어 있다. 게이지는 doughnut 반원, 강조 · 그라데이션은 scriptable 색이라 의존성이 늘지 않았다.
- **한 톤 = 제품과 무관한 고정 파랑**(사람의 결정 — 빨강 · 주황 제품에서도 경고 · 위험처럼 읽히지 않게) `--chart-mono-1~4` — 라이트 blue-40 · 50 · 60 · 70, 다크 blue-80 · 70 · 60 · 45. dataviz 검증기(ordinal)로 한 색상 · 명도 단조 · 이웃 ΔL ≥ 0.06 · 옅은 끝 ≥ 2:1 을 라이트 · 다크 각각 통과한 단계다.
- **색 모드** spec `color`: `"mono"`(기본) · `"categorical"`(계열 1~6). tone 없는 계열 수에 따라 1 → 1단계, 2 → 1 · 4, 3 → 1 · 2 · 4, 4 → 1~4(`MONO_STEPS`), **5개부터는 계열 색**(사람의 결정 — 넘으면 범주색). `tone` 을 준 계열은 늘 그 톤이고 남은 것만 센다. **도넛 조각도 같은 규칙**(사람의 질문에 답한 결정) — 정적 `.donut.mono` · `.categorical` 은 조각 비율을 `--d1~--d5` 로 받고, 클래스 없는 도넛은 지금처럼 심각도 다섯 색. React `Donut` 은 tone 없는 조각 수로 고른다.
- **새 프리셋 둘** `gauge`(반원 doughnut · 회전 −90 · 180° · 구멍 78% · data = [값, max − 값] · 가운데 큰 값 + 설명 · 범례 · 툴팁 없음, max 를 넘으면 멈추고 경고) · `spark`(축 · 격자 · 범례 없는 선, KPI 안 `.kpi > .chart-canvas.spark` 높이 40). 프리셋은 넷 → 여섯. React `SparkCanvas`.
- **막대 옵션** `highlight: n`(그 막대만 mono-1, 나머지 mono-4) · `gradient: true`(값 끝 mono-1 불투명 → 바닥 같은 파랑 약 55%, 누적이면 경고하고 단색). **막대는 단색**(사람의 결정 — 그라데이션은 강조용 옵션). **계열 하나인 추이 선은 아래를 옅게 칠한다**(사람의 결정 — `area:false` 로 끔). **가로 격자는 점선 3 · 3**(사람의 결정).
- **정적 요소** — 진행 막대 목록 `.progress-list > .progress-row`(라벨 + '값 / 목표', `.progress[role=meter]` 에 aria-valuenow · min · max · valuetext · 이름, React `ProgressList`). 정적 막대 · 진행 막대 채움 mono-1, 정적 스파크라인 mono-4 · 강조 mono-1, 범례 스와치 `i.mono-1~4` · `i.series-1~6`.
- **증감 = 옅은 틴트 배지, 색은 의미**(사람의 결정) — `.delta`(중립) · `.delta.bad` · `.delta.good` = Caption 2 SemiBold 11/14 · 위아래 2 좌우 8 · 높이 18(Tag sm 과 같음), 8% 틴트 + heavy 글자(Tag 글자 쌍과 같음). 방향은 화살표 + 숨긴 '증가' · '감소' 만 나르고 **옛 `.up` · `.down` 클래스는 없앴다**(계획은 `.up.bad` 로 옮기기였다 — 방향 클래스가 색을 갖지 않으면 남길 이유가 없어서, verify 가 막음). 비교 기준은 `.kpi-foot > .delta-note`. React `deltaTone`, `deltaDir` 만 주면 옛 뜻(up = bad · down = good)으로 그리고 한 번 경고(MIGRATION).
- **차트 카드 한 틀** `.chart-card > .chart-head(h3.chart-title + .chart-sub? + .chart-action?) + .chart-figure? + 본문` — 머리 높이는 동작 유무와 무관하게 32, **본문 높이 단계** `.sm` 160 · 기본 240 · `.lg` 320(캔버스 · 표로 보기 · 상태가 따름), 같은 줄 카드는 머리 아래 끝 · 본문 위 끝 · 카드 높이가 같다. **State** — `aria-busy` + Skeleton · 빈 상태 · 오류(다시 시도 → `ds:retry`, ds.js)가 본문 높이를 지킨다. React `ChartCard size · sub · action · figure · state · onRetry`(옛 `extra` 는 `sub` 로 그리고 경고).
- **예제 네 묶음** Default 1 · Variant 15 · Size 1 · State 1(18) — 새 예제 일곱 bar-emphasis · progress · gauge · donut-categorical · set(종류가 다른 카드 셋이 한 줄) · size · state(사이트 · React). **대시보드 패턴을 한 세트로** — KPI 넷(증감 배지, 둘은 spark — '미처리 검토' 자리에 '신규 위협'), 추이(심각도 누적 — tone 유지) + 심각도 도넛, 새 셋째 줄 주간 비교 막대(mono) + 진행 막대 목록. 고르기 표 · Rules(차트 고르기 · 색 · 카드 · 마크 · 증감 · 접근성 h3 묶음) · Spec · Props 를 다시 썼다.
- **토큰** `--chart-mono-1~4` 를 `ADDITIONS` · `grammarOnly` 에(정적 막대 · 진행 막대 · 도넛은 CSS 로도 씀) — 차트 12 → 16 · 트리 밖 15 → 19 · 전체 105 → 109. Colors 의 Chart 절에 Mono 1~4.
- **contrast +180** = (mono 4 × 바탕 3 + mono-1 / 트랙 `--surface-neutral-strong` 3) × 맥락 12. **advisory +24** = mono-4 3:1 미달(라이트 흰 2.49 · 회색 2.33, 다크 카드 2.88 — 사람의 결정, 범례 · 툴팁 · 표로 보기가 값을 나름). **behave +20** = `behave.chart` 20(계열 수별 한 톤 라이트 · 다크 · 빨강 · 주황 제품에서 그대로, 정적 mono 와 도넛 정지점, 강조 · 그라데이션 픽셀 라이트 · 다크, 영역 칠, 점선 격자, 게이지 각도, 스파크, meter, 증감 배지, 머리 32, 한 세트 정렬 1024 · 1440 · 1920, 높이 단계, 상태, 대시보드, 390 대시보드 두 가지 — 아래 '좁은 화면'). **react +22** = 새 테스트 15 + 구조 비교 7.
- **기존 단정 고침:** 차트 탐침은 축 있는 넷만(게이지 · 스파크는 behave.chart), 색 기대값 = `DSChart.palette` · 강조 막대는 계산한 기대값으로 라이트 · 다크 대조 · 그라데이션은 behave.chart 픽셀로, 차트 수 15 · 높이 단계, 폭 하한 200 → 160('한 세트' 예제가 1440 미리보기에서 192 — 캡처로 읽힘 확인), 주간 비교 = mono-1 · mono-4(11-05 의 series-1 · subtle), 막대 눈금 · 누적 · 도넛 범례 예제 선택자, KPI 증감 스타일, 표로 보기 차트 수 17 · donut-live 표, scale 의 KPI 글자 폭에서 스파크 캔버스 뺌.
- **계획과 다르게 한 것:** mono-1 은 series-1(blue-50)이 아니라 한 단계 진한 blue-40(검증기의 명도 단계), 강조 밖 막대는 mono-3 이 아니라 mono-4, `series-1-subtle`(blue-80)은 mono-3(blue-60)으로 다시 가리키지 않았다 — 값이 달라 쓰는 제품의 화면이 바뀌므로. 주간 비교가 mono-4 로 옮겨 예제의 소비자는 0 이고 tone 값 `series-1-subtle` 로만 남는다, 정적 Tone 에 `brand` 를 전역으로 더하지 않고 범례 스와치에만, 라이브러리 검토는 Resources 가 아니라 Data Visual 사용 절에.
- **측정에서 드러나 고친 것:** 새 verify 차트 스펙 검사가 `data-spec='…'` 만 찾아 생성 페이지(`data-spec="…&quot;…"`)에서 아무것도 보지 않았다 — 음성 시험에서 발견해 두 따옴표 형식으로(L29 의 기존 검사와 같게). 그 뒤 실패 0. `behave.scale` 고칠 때 주석이 코드를 삼켜 문법 오류가 났고, b 기반 실행기가 브라우저를 닫지 못해 한 시간 넘게 멈췄다(behave 본체는 덩어리 가드가 있지만 묶음 require 자체의 SyntaxError 는 잡지 못한다 — 게이트 전 `node --check` 로 발견).
- 음성 시험: 사이트 7건(mono → index · 격자 실선 · 강조 무시 · 게이지 비율 · 머리 높이 지움 · 높이 단계 지움 · 증감 bad 색 지움) · verify 6건(없는 color · mono 에 5계열 · 누적 + gradient · 범위 밖 highlight · `.delta.up` · `.chart-card.md`) · React 7건 중 6건(mono → index · 강조 무시 · 게이지 비율 · 증감을 방향으로 · 도넛 늘 categorical · 예제 크기 lg 빼기). 처음에 못 잡은 1건(React 진행 막대 단위 '대' 빼기 — 구조 비교가 글자 · `aria-valuetext` 를 보지 않았다)은 아래 '구조 비교' 로 잡게 됐다.
- **좁은 화면(캡처에서 발견, 사람의 결정)** — 390 에서 대시보드 차트 줄(`.row-3` · 새 `.row-2`)이 두 칸 그대로라 도넛이 카드 밖으로 잘리고 제목이 '심각도…' 로, 막대 라벨이 겹쳤다(`.row-3` 은 HEAD 부터). 767 이하에서 한 칸으로 쌓는다(`Row2` · `Row3` 도 같은 클래스). 같은 캡처에서 본 이전부터의 둘도 고쳤다 — Page Header 부제가 '자동 갱 / 신' 으로 끊겼다(`.page-head .sub` 에 제목과 같은 `keep-all`), 최근 이벤트 표가 '차 / 단' · 'PC- / 2041' 로 끊겼다(카드에 `.tbl-wrap` 없이 들어 있었다 — 새 수정자 `.tbl.nowrap` · React `Table nowrap` 으로 칸을 한 줄로 두고 틀이 가로로 스크롤, Table Props · MIGRATION). behave.chart +2(차트 줄 한 칸 · 넘침 · 제목 잘림 없음, 부제는 띄어쓰기에서만 · 표 행 3rem 한 줄 · 가로 스크롤).
- **구조 비교에 `aria-valuetext`(사람의 결정)** — `skeleton.ts` 가 값 문구를 비교한다. 더하자 Number Input 넷 · Slider 셋 · 입력 폼 오류 하나가 실패했다: 사이트는 ds.js 가 실행 중에 붙이고 React 는 처음부터 그려서다(화면 동작은 같음). 11-10 결정('정적 예제도 ds.js 가 켜기 전 · 복사한 HTML 이 같은 모양')대로 사이트 예제 입력 10개에 값 문구를 적었다. react 수는 그대로(같은 비교가 더 본다).
- **`series-1-subtle` 은 tone 값으로 남김(사람의 결정)** — Data Visual Props · React `Tone` 설명에 '비교 기간은 mono-1 · mono-4, 새로 쓰지 않음'.
- 음성 시험(좁은 화면 · 구조 비교): `.row-2` · `.row-3` 한 칸 규칙 지움 · 부제 keep-all 지움 · `.tbl.nowrap` 지움(behave.chart 각 1), React Table 의 nowrap 클래스 빼기(대시보드 구조 비교) · React 진행 막대 단위 빼기 — 모두 잡혔다.
- audit: CHART_EX 에 gauge · spark, 카드 정규식 · 부제 `.chart-sub`, 최대 폭 없는 카드는 격자 폭 ÷ 카드 수, 계열 색 기대값이 MONO_STEPS 를 따름, 도넛 `var(--dN)` 정지점, 중첩 div 를 세는 KPI 블록, 증감 Figma 변형 None · Bad · Good. Figma 미반영 693 → 732건 — 한 톤 계열 색 · Gauge · Spark 변형 없음 · 카드 폭 · Spec 문구 · 저장소에만 있는 chart-mono 토큰. Figma 의 차트 · KPI 는 옛 모양 그대로다 — 일괄 반영 때 그린다.

2026-11-15 전체 점검 · 정리(사람의 요청 · 결정 열둘) — contrast 3120 → 3192 · advisory 944 → 943 · behave 1432 → 1440(`behave.review.js` 8) · react 820+6 → 828+6(`tests/labels-parity.test.ts` 8). verify 수는 그대로.
- **버그 일곱(단정 먼저, 음성 시험으로 실패 확인)** — Select Button `ds:select` 의 detail 이 null 이라 Resources 예시 `e.detail.value` 가 TypeError 였다(`{value}` · `ds:tab` 도 `{value, index}`), `data-debounce="0"` 이 300ms 가 됐다, outline Pagination 의 hover · 눌림 면이 쉬는 상태 규칙에 덮였다, 고른 List 행이 hover 에 brand 틴트를 잃었다, Notice 닫기의 인라인 160ms → `--motion-fast` · 줄인 모션이면 바로 지움.
- **사이트에 없던 이벤트 셋**(사람의 결정) — `ds:chip-toggle {selected, value}` · `ds:chip-remove {value}` · `ds:notice-close`(계획의 `ds:change` · `ds:remove` · `ds:close` 는 다른 컴포넌트와 이름이 겹쳐 컴포넌트 이름을 붙였다). React 콜백과 짝. 표시 개수 Select 는 전체 건수가 가장 작은 표시 개수 이하이면 사이트에서도 숨긴다(사람의 결정 — React 와 같게). 칩 지우기 이름 '제거'(사람의 결정).
- **정리** — 하드코딩 반경 0.375 · 0.25rem 을 반경 토큰으로(값 같음), 쓸모없는 선언(음성 시험으로 확인), React 운영 모드에서도 찍히던 `console.warn` 을 개발 모드 가드로, Banner 아이콘을 톤에 따라, 금지 라벨 `more:"더 보기"` 문구 지움, Tree 실패 문구에 다음 행동, `DS.version` = 데이터의 버전, 빈 단정 덩어리 · 없는 선택자 · 남은 설정 파일 줄 지움, Table zebra 예제를 `density` · `rowStyle` 로(옛 prop shim 은 1.0 때까지 — 사람의 결정, MIGRATION '1.0 정리 목록'), 런타임 CSS 변수 허용 목록을 `lib.js` 한 상수로 · 줄인 모션 블록을 sync-css 가 원본에서 떠 감, `grammarOnly` 를 실제 소비자에 맞게(사람의 결정 — 토큰은 그대로).
- **수의 근거:** contrast +72 = 경고 · 위험 Banner 의 글자 · 아이콘 · 버튼 라벨 / 틴트 면 2 × 합성 바탕 3 × 맥락 12(틴트 면 위라 재지 않고 있었다 — 모두 통과). advisory −1 = `--foreground-neutral-strong` 의 '소비자 0' 경고를 이유와 함께 `grammarOnly` 로. 같은 날 WBS 를 지워 `--company-mark` 의 CSS 소비자가 0 이 되어 이유와 함께 `grammarOnly` 에 더했다(제품 로고 자리 · Foundations 그림이 씀 — 그대로 두면 +1). behave +8 = 위 버그 · 이벤트 단정. react +8 = 사이트 ds.js 와 React 의 UI 문구 여덟 묶음이 같은지 대조(지금도 같지만 지켜 주는 것이 없었다).
- **문서 수치 · 기술 표** — Usage 문단의 없는 토큰 이름, About 의 수(데이터에서 셈), Radius 목록, ds.js 동작 표를 실제 이벤트에서(verify 가 `ds.src.js` 가 내는 이벤트와 표를 대조), Spec 값(Button 삭제 = 중립 · 차트 카드 제목 Body 1/Normal 16 SemiBold · 달력 14 · Empty State 아이콘 · 포커스 링 · Breadcrumb 간격 · Tag 높이 · Steps), 빠진 Props 줄, README 두 개의 수를 데이터에서 계산.
- **미정 기본값**(Time Picker 칸 · 영역 그라데이션 알파 · AI 그라데이션 끝 색 · 상단 내비 40 · 알림 항목 여백 · Tag 최대 폭 · Copy Field · Number Input · 행 펼침 · Date Picker 시각 동작)을 선택지로 물어 **모두 그대로 유지**(사람의 결정).
- 이 날의 CLAUDE.md 11-13 항목의 `noUncheckedIndexedAccess` 설명을 tsconfig(false)대로 바로잡았다.

2026-11-15 전 페이지 설명 문구 · v0.9 · WBS 삭제(사람의 요청 · 결정) — pages 77 → 76. 게이트의 다른 수는 위 항목 그대로.
- **본문만 서술형으로**(사람의 결정) — 컴포넌트 46 · 패턴 10 의 정의 · 고르기 표 · Rules · 예제 설명, Foundations 8 페이지의 소개와 표 설명, Home(시작하기 · About · Principles), 공통 문단(Usage · Props 소개 · Composition). 합니다체 · 한 문장에 한 가지 · 토큰 · 클래스 · 속성 · 이벤트 · `<code>` · 날짜 · 결정 이력 · 빌드 언급 없음 · 괄호는 한 문장에 하나까지. **Spec · Props 표와 Resources 개발 페이지(React Package · Design Token · Figma Library)는 기술 문서로 둔다.** 고르기 표의 Placement 행은 Figma 대조가 읽는 자리라 글은 그대로 두고 클래스 이름 괄호만 걷었다.
- **잰 값**(`scratchpad prose-survey` — 본문 덩어리 705): 코드 306 → 0 · 개발 언급 153 → 4(링크 주소 `data-…` 를 잘못 센 것) · 괄호 273 → 9(Placement 행 8 · 글자 그대로 읽히는 '(새 창)' 1) · 토큰 14 → 0 · 날짜 9 → 0 · 결정 이력 2 → 0.
- **지운 내용:** 규칙의 근거였던 이력('전에는 …였다' · '…정비 때' · 결정 날짜), 구현 설명(Props 에 같은 내용이 있는 속성 · 이벤트 이름), '빌드가 검사합니다' 꼬리. 규칙 자체는 지우지 않았다. 다시 쓰다 원문 수치가 코드와 다른 것을 찾아 고쳤다 — Data Table Compact 의 '시간 · IP 는 모노스페이스'(고정폭은 Code 에만), Data Visual 의 '5개를 넘으면'(→ 5개 이상), Elevation 의 단계별 쓰임(실제 소비자로 — xs · lg · spread 는 쓰는 컴포넌트가 없다), Grid 의 카드 간격.
- **verify 더함** — 위 본문 자리(컴포넌트 · 패턴 데이터)와 Foundations · Home 의 소개 문단에서 토큰 · 코드 · 날짜 · 결정 이력 · 빌드 언급 · 한 문장 괄호 둘 이상을 막는다(Placement 행은 괄호 수만 보지 않음). 음성 시험 9건 모두 잡혔다.
- **v0.9**(사람의 결정) — Changelog 에 11-09 ~ 11-15 항목, `VERSION` v0.9 · 패키지 0.9.0(check-version), MIGRATION 제목 0.6.x → 0.9.0. **WBS 페이지를 지웠다**(사람의 결정 — 메뉴 · render 함수 · `table.wbs` · `.wbs-legend` CSS). Changelog 의 옛 항목(v0.1 ~ v0.8)도 토큰 · 파일 경로 없이 서술형으로 다시 썼다(내용은 그대로).
- Figma 미반영 732 → 736건 — 클래스 이름 괄호를 걷은 Placement 행 넷(Checkbox · Dropdown · Select · Top Navigation, Figma 는 옛 글). 차트 카드 제목 Spec 은 이미 어긋난 행이라 수에 없다.

2026-11-15 패턴 재정비 · 새 패턴 여덟(사람의 요청 '최종 정리된 컴포넌트로 패턴을 모두 재정비', 결정 여덟) — pages 76 → 84 · 패턴 10 → 18 · behave 1440 → 1453(`behave.patterns.js` 13) · react 828+6 → 851+6(예제 291 → 313 에 따른 구조 비교 22 · `requiredMark` 1). contrast · advisory · verify 수는 그대로(새 색 쌍 없음).
- **패턴 페이지 = 컴포넌트처럼**(사람의 결정) — 정의 → 고르기 표(언제 쓰는가 · 비슷한 패턴, Placement 없음 — 화면 단위) → Composition → 예제(번호 h2 그대로) → Rules → Usage. 18개 모두 Rules 가 있고, 패턴 전용 원칙 표 렌더러를 지웠다.
- **새 패턴**(사람의 결정) — Common UI: 오류 · 권한 없음 · 위험 작업 확인 · 가져오기 · 내보내기, Service: 로그인 · 세션, Security Console: 상세 화면 · 권한 · 역할 · API 키 · 비밀값 · 사고 처리. 새 ds.js 동작은 만들지 않고 기존 컴포넌트를 조합했다. 시간 세기 · 서버 확인(세션 연장 · 일회용 코드 확인 · 재발급)은 제품 몫으로 Rules 에 적었다.
- **결정한 세부:** 로그 상세 = Data Table 행 펼침(⋯ 상세 버튼을 뺌), 2단계 인증 = 숫자 6자리 한 칸(`inputmode` · `one-time-code` · `pattern`), 이름 입력 확인 = 버튼은 늘 켜 두고 누르면 기존 입력 검증(`pattern` + 문구)이 막음, 유의사항 = Notice 위에 다시 지음(`.notes` CSS 삭제), 메뉴는 세 묶음 그대로.
- **기존 열 개 고침** — 열리지 않던 가짜 Select 세 곳을 실제 Select · Combobox 로, 인라인 스타일을 클래스로, `uses` 를 예제가 실제로 쓰는 컴포넌트와 맞춤, 정책 설정에 Number Input · Time Picker · Combobox 입력값 칩 · inline Copy Field · 적용 대상 Tree(모달 Side Panel), 온보딩을 Steps 마법사 하나로(완료 예제를 지우고 마지막 패널이 완료 화면 · 에이전트 단계에 설치 Code + 등록 키 Copy Field), 검색에 빈 결과, 시스템 상태 측정값을 진행 막대(meter)로, 심각도 태그 줄을 Tag Group 으로, 약관 '보기' 를 전문 Popup 으로 · 필수 표시를 Tag 로.
- **verify 더함:** 패턴 수 18, 고르기 표 키 · 순서 · 위치(정의 바로 뒤), Rules 필수 · 8행 초과면 소제목, 절 순서, 예제의 대표 클래스로 `uses` 대조(빠진 것 · 남는 것), 패턴 예제 인라인 style 금지(도넛 각도 · 막대 비율 · 밴드 조각처럼 값이 곧 데이터인 기하는 뺌), 메뉴 없는 가짜 Select 금지, 고르기 표 · Rules 문구도 본문 문구 검사에.
- **behave.patterns 13** — 18 페이지 구성 · `.notes` 없음, 약관 보기 Popup 과 포커스 복귀, 온보딩 다음 · 나중에 설치 · `ds:step-finish`, 검색 칩 지우기 · 빈 결과, 로그 행 펼침 · 한 줄 행 · 고정 헤더 이름 · 새 로그 안내, 정책 Number Input ↑ · Time Picker · 모달 Side Panel 열고 닫기 · 제자리 복귀, 이름 입력 확인 세 경우, 2단계 코드 속성과 검증, 오류 화면 동작 하나, 비밀값 보기 · 재발급 alertdialog, 역할 Tree 묶음 mixed → 켬, 상세 탭 · 위험 동작 위치, 가져오기 오류 줄. 음성 시험 13건 모두 잡혔다(역할은 처음 변형이 ds.js 의 묶음 재계산에 지워져 하위를 끄는 변형으로 다시 잡음).
- **측정에서 드러나 고친 것:**
  - Side Panel 을 닫으면 처음부터 보이던 정적 패널(예제)까지 `hidden` 이 됐다 — 열 때 원래 hidden 을 기억해 되돌린다(ds.js).
  - 약관의 남은 필수 세기가 옛 `.req` 글자를 찾아, Tag 로 바꾸자 '다음' 이 막지 않았다 — 필수 항목에 `data-required`(사이트 · React `TermsItem`), 옛 `.req` 도 받는다.
  - 패턴 데이터의 필드 문구 키를 `valueMissing` 으로 적어 기본 문구가 나왔다 — 시스템 키는 `required` · `pattern`.
  - 로그 뷰어 필터 칩이 sm(26)이라 옆 32 버튼과 높이가 달랐다(기본 칩으로), 정책 '+3' 이 Tag Group 구조가 아니라 UA 글자였다, 2단계 인증 아래 링크 · 비밀값 범위 legend 가 텍스트 스타일 밖이었다.
  - 사이트와 React 구조 비교가 찾은 것 넷: 단위 없는 Number Input 의 `aria-valuetext`, 보관 기간 라벨 · 단위 자리, compact 빈 상태의 묶음, 검증 폼 안 fieldset 의 `.field` 감싸기. 보관 기간에 라벨을 붙이자 기존 Number Input 규칙(범위는 도움말에)이 걸려 '30~365일' 도움말을 더했다.
- verify 음성 시험 넷(인라인 style · uses 누락 · 고르기 표 키 · 메뉴 없는 Select) 모두 잡혔다.
- **390 캡처에서 발견해 고친 것 둘:** 두 칸 줄의 칸이 최소 폭 = 내용 폭이라 사고 처리 화면이 미리보기 밖으로 나갔다(435/351 — `.row-2 > *, .row-3 > *{min-width:0}`). 표 머리글 안 숨긴 글자(`.sr-only`, 절대 위치)가 스크롤 틀 밖 조상을 기준으로 놓여 권한 · 역할 목록이 틀 바깥을 넓혔다(467/351 — `.tbl-wrap{position:relative}`). 고친 뒤 전 페이지의 390 · 768 미리보기를 재면 패턴에서 넘치는 것은 아래 둘이고, 나머지는 컴포넌트 예제다(Button · Top Navigation 등 — 이번에 보지 않았고 전후 비교도 하지 않았다).
  남은 패턴 넘침 둘(위험 작업 확인 '되돌리기' 의 Toast 묶음, 로그 뷰어의 시각 있는 기간 칸)은 컴포넌트가 390 에서 같은 폭으로 넘치는 것이었다 — 같은 날 다음 항목에서 컴포넌트를 고쳤다.
- **기존 단정 고침:** 약관(필수 판정), 온보딩(완료 예제 → 마지막 패널까지 넘겨 잼), behave.cells 의 compact 아이콘 동작(예제가 없어져 Data Table '행 동작' 표에 compact 를 붙여 잼), 예제 하나짜리 패턴 목차에 Rules, behave.system 의 허용 목록(Time Picker 시계 · 행 펼침 · Copy Field 보기 · Tag Group +N 버튼, 복사 · 파일 고르기 · Popup 닫기 · Side Panel 닫기 역할 클래스 — 패턴이 이 컴포넌트들을 쓰기 시작해 걸렸다).
- **React** — 새 예제 22 · 다시 쓴 예제(사이트 구조와 같게), `Notes` 가 Notice 를 그림 · `TermsItem` 이 Tag 와 `data-required`, 새 prop `TextField`/`TextArea requiredMark` · `labelHidden` · `Accordion bodyProps`, `Stepper labels` 타입을 넓힘(MIGRATION).
- audit 은 이전과 같은 736건이다(대시보드 · 심각도 기대값을 바뀐 마크업에서 그대로 읽음 — 새 패턴은 Figma 대조 밖). Figma 미반영 736건(그대로).
- 이때 알고 둔 둘(Popup 위험 확인 예제의 끈 삭제 버튼, 1440 검색 툴바에서 기간이 저절로 둘째 줄로 감)은 같은 날 다음 항목에서 고쳤다.

2026-11-15 남은 것 정리 · 새 패턴 넷(사람의 결정 — 선택지로 고름) — pages 84 → 88 · 패턴 18 → 22 · behave 1453 → 1460(`behave.patterns.js` 13 → 20) · react 851+6 → 858+6(예제 313 → 320 에 따른 구조 비교 7). contrast · advisory · verify 수는 그대로(새 색 쌍 없음).
- **Popup 위험 확인 예제 = 삭제 버튼을 늘 켜 둠**(사람의 결정 — 이름 입력 확인 패턴과 같게). `form#dg-form[data-validate]` + `pattern="삭제"` + 문구(`required` · `pattern`), 삭제 버튼은 `type=submit form=dg-form`(사이트 · React). Popup Rules '위험 확인' · Foundations › Interaction 의 예외 문장을 고쳤다 — 이제 처음부터 끈 버튼은 Date Picker 의 '적용' 하나다.
- **390 넘침은 컴포넌트에서 고침**(사람의 결정) — `.toast-stack{max-width:100%}` · 화면 고정 묶음은 화면 폭 − 48, 기간 Date Picker 최소 폭을 `min(…, 100%)` 로(시각 410 · 초 450 · 날짜만 300 은 넓은 자리에서 그대로). 1440 폭은 전후 같다(Toast 360 · 기간 410 / 300).
- **검색 툴바 두 줄**(사람의 결정) — 첫 줄 검색 + 기간, 둘째 줄 심각도 Combobox, 결과 줄은 그 아래 그대로(사이트 · React). 검색 Rules '툴바' 를 고쳤다. 390 에서 표 칸이 낱말 가운데서 끊겨 `.tbl.nowrap` 을 붙였다 — React 는 `DataTable nowrap` 을 새로 더했다(MIGRATION).
- **새 패턴 넷**(사람의 결정 — 넷 다) — 일괄 작업 진행(Common UI — 진행 막대 · 성공/실패/남음 · 남은 것만 취소 · 실패 목록과 실패만 다시 실행), 보고서 · 예약 발송(Service — 검증 폼 · 요약 Notice · 예약 목록의 사용 Switch · 받는 사람 Avatar Group), 감사 로그 · 변경 이력(Security — 행 펼침으로 변경 전 → 후 · 고치거나 지우는 동작 없음 · 버전 표와 두 버전 비교), 알림 규칙(Security — 조건 · 동작 섹션 · Number Input '건 이상' · 웹훅 주소 문구 `url`). 새 ds.js 동작은 없다.
- **verify** — 패턴 수 22, uses 대조의 Loading 표식에 `role="progressbar"` 를 더했다(진행 막대만 쓰는 패턴이 Loading 을 uses 에 적으면 '쓰지 않는다' 로 실패했다).
- **측정 · 캡처에서 드러나 고친 것:**
  - `.field .row`(라벨 + 글자 수 줄 — space-between · baseline)가 필드 안 `.radio-group.row` 에도 걸려 PDF 와 CSV 가 양끝으로 벌어지고 4px 어긋났다 — `:where(:not(.radio-group)):where(:not(.checkbox-group))` 로 뺐다(명시도 그대로, 쉼표 없이).
  - 두 칸 폼 줄(`.form .form-row`)이 390 에서 Select 트리거 최소 폭으로 20 넘쳤다 — 767 이하 한 칸.
  - 폼 아래 버튼 줄(`.form .form-actions`)이 줄바꿈하지 않아 버튼 셋이 390 에서 폼 왼쪽 밖으로 밀렸다(캡처에서 발견 — 미리보기 넘침은 0 이라 넘침 검사로는 안 보였다) — `flex-wrap:wrap`(Card 꼬리와 같음).
  - 검증 폼 안 필드의 빈 도움말 칸 — React 는 늘 `aria-live` 칸을 그린다. 사이트 도우미 `pCombo` · `pTime` 에 `live` 옵션을 더하고 두 폼의 Select · Combobox · Number Input · Time Picker 에 칸을 넣었다(구조 비교가 잡음).
  - 알림 규칙 웹훅 문구 키를 `type` 으로 적었다 — 시스템 키는 `url`(React tsc 가 먼저 잡음).
- **behave.patterns +7:** Popup 위험 확인(켜진 버튼 · 빈 칸 · 다른 문구 · 통과), 390 넘침(위험 작업 확인 · 로그 뷰어 · 보고서 · 알림 규칙 · Notification · Date Picker · Form), 검색 툴바 두 줄, 일괄 진행 막대 이름 · 값 · 실패 수 일치, 보고서 라디오 나란히(간격 24) · 이름 필수 · 390 쌓기, 감사 로그 펼침 · 수정/삭제 없음 · 되돌리기 이름, 알림 규칙 ↑ '6건 이상' · 웹훅 문구.
- 음성 시험 13건 모두 잡혔다 — CSS 5(form-row 쌓기 · `.field .row` 되돌림 · Toast 최대 폭 · 기간 최소 폭 · form-actions 줄바꿈) · 데이터 8(삭제 버튼 끔 · 심각도를 한 줄로 · 다시 실행 수 · 진행 막대 이름 · 이름 required · 되돌리기 이름 중복 · 웹훅 키 · 횟수 단위).
- **이번 범위 밖으로 둔 것:** Date Picker 의 정적 두 달 달력 예제(range-calendar)의 390 넘침과 컴포넌트 예제의 다른 390 넘침 — 다음 날 '좁은 화면 넘침 정리' 항목에서 고쳤다.
- Figma 미반영 736건(그대로 — 새 패턴은 Figma 대조 밖).

2026-11-16 좁은 화면 넘침 정리(사람의 요청 '보지 않았거나 남긴 것들도 함께 고쳐줘') — behave 1460 → 1461(`behave.patterns.js` 20 → 21) · react 858+6 → 859+6(`DatePicker.test` 1). contrast · advisory · verify · pages 수는 그대로.
- **잰 것:** 모든 컴포넌트 · 패턴 페이지의 미리보기를 390 · 768 에서 쟀다. 패턴은 0, 컴포넌트는 390 에서 아홉 페이지 · 768 에서 셋이 넘쳤다.
  - 390: Button 넷(최대 343), Card Flat 27, Checkbox 가로 묶음 72, 두 달 달력 247, Pagination Bar 79, Slider 숫자 입력 69, Textarea 99, Tooltip 위치 3, Top Navigation 둘.
  - 768: Button 비활성 33, Tooltip 3, Top Navigation 30.
- **두 달 달력은 767px 이하에서 한 달** — 사이트 ds.js `dpFitStatic` 이 단독 `.calendar.two` 를 처음 그릴 때와 창 폭이 767 을 넘나들 때 다시 그린다. React `Calendar` 는 `calendars` 를 주지 않으면 같은 기준(`useNarrow`)이다. 주면 그 값 그대로이고, `DateRangePicker` 는 원래 그랬다. 예제 설명에 한 문장을 더했다.
- **CSS 넷:** `.btn-group` · `.checkbox-group.row` 줄바꿈(가로 라디오와 같은 줄 사이 12), `.pagination-bar` 와 그 안 묶음 줄바꿈(예제 · React `PaginationBar` 의 인라인 배치를 `.pagination-bar > div` 로 옮김), `.field.slider-field{min-width:min(26rem,100%)}`.
- **예제 넷(사이트 · React):** Textarea 최소 폭과 Flat 카드 폭을 `min(…, 100%)` 로, Tooltip 위치 예제의 좌우 여백을 40 → 72 로 했다. 오른쪽 툴팁이 버튼 밖으로 58 나가므로, 이 여백이면 줄이 가득 차도 미리보기 안에 든다. 1440 배치는 전후 같다.
- **Button State 예제의 4열 상태 표는 그 안에서 가로로 스크롤한다** — 제안을 사람이 확인했다(두 열로 바꾸는 안 대신). 줄바꿈하면 열(변형)과 행(상태)의 짝이 깨져서 표를 유지했다.
- **Top Navigation 은 그대로 둔다** — 바 전체가 가로로 스크롤하는 것이 2026-11-13 의 결정이다. 넘침 단정에서 이유와 함께 뺀다.
- **behave:** part 15 를 일곱 페이지에서 모든 컴포넌트(Top Navigation 제외) · 패턴의 390 과 컴포넌트의 768 로 넓혔다(단정 수는 그대로). 패턴 768 은 behave.system 이 이미 잰다. part 21 은 두 달 달력을 잰다 — 390 한 달, 넓히면 두 달, 다시 좁히면 한 달, 넓게 열면 두 달.
- **음성 시험 9건(CSS 4 · 예제 3 · ds.js 2)과 React 1건이 모두 잡혔다.** 390 캡처로 달력 · 상태 표 · Pagination Bar · Slider · Flat 카드를 보았다.
- Figma 미반영 736건(그대로 — 넘침 고침은 audit 대조 밖).

2026-11-16 컴포넌트 수정 일곱(사람의 요청 · 결정 넷) — contrast 3192 → 3336 · advisory 943 → 987 · behave 1461 → 1470 · react 859+6 → 861+6. pages · verify 수는 그대로.
- **Negative 버튼은 다시 빨강, 화면의 삭제는 Assistive**(사람의 결정 — 11-14 의 '삭제 버튼 중립' 을 사람이 바로잡음: 뜻은 '제품의 삭제 버튼에 Assistive 를 쓴다' 였다). Negative 는 되돌릴 수 없는 일을 확정하는 위험 확인 팝업(alertdialog)의 버튼에만 쓴다.
  solid · outline · 면 없는 아이콘 · 스피너 규칙을 되살렸고 `--surface-negative-heavy · hover · pressed` 를 `grammarOnly` 에서 뺐다. 표 · 카드 · 폼 · Tooltip · Divider · 액션 바의 삭제 버튼을 assistive 로(사이트 · React). verify 가 Button 페이지 밖 예제의 `.btn.negative` 를 alertdialog 의 버튼 줄 안에만 받는다. 빨강 제품에서는 확정 버튼과 주 버튼이 같은 계열 빨강이 되지만 확정 버튼이 위험 확인 팝업 안에만 있어 받아들였다. behave.product 1 부를 '빨강 세 형태 · 화면 삭제 assistive · 팝업 확정 negative' 로 다시 썼다.
- **Avatar 색 = 이름으로 정하는 6색**(사람의 결정 셋 — 이름으로 · 옅은 면 + 진한 이니셜 · 상태색을 피한 파랑 · 시안 · 라임 · 바이올렛 · 퍼플 · 핑크). 토큰 12개 `--avatar-1~6-surface · -text`(`ADDITIONS`, 라이트 면 90 · 글자 30(lime 20 — 30 은 4.43), 다크 면 20 · 글자 80). `.avatar[data-tone="1~6"]`, 그룹의 불투명 바탕 합성은 `--avatar-face`(LOCAL_VARS).
  식 하나 `h = imul(h,31) + 코드값 → h % 6 + 1`, 이름 = data-name → aria-label → 글자. 사이트 ds.js(`DS.avatarTone` · 처음 그릴 때 `data-tone` 을 단다) · 빌드 `lib.js withAvatarTone`(예제 HTML 에 미리 적음 — render.js 와 React 구조 비교가 같이 씀) · React `avatarTone` · `Avatar name · tone`. verify 가 예제마다 tone = 식의 값인지, `tests/avatar-tone.test.tsx` 가 세 곳의 식이 같은지 본다. 구조 비교에 `data-tone`. 이름이 옆에 있어 aria-hidden 인 아바타 · 이니셜만 있는 JH 는 `data-name` 으로 이름을 준다.
- **Indicator = 아이콘이 든 색 원**(사람의 요청 · 결정 — 원 16 · 아이콘 10). ::before 가 원, ::after 가 mask 아이콘(ok 체크 · warn ! · danger × · info · accent i · 톤 없음 가로선). 처음엔 data-URI 흰 아이콘이었으나 중립 · 시안 제품 다크에서 accent 원(brand 글자색)이 흰색에 가까워 사라져(2.59 · 1.07 — contrast 실패 2) 아이콘 색을 토큰으로 칠하게 둘로 나눴고 accent 원은 `--surface-brand-primary` + `--brand-label`. 비활성 행은 아이콘 없는 회색 원.
  **측정에서 드러나 고친 것:** inline-flex 의 기준선이 첫 항목(원)의 아래 끝이 되어 390 대시보드 표 행이 45 → 48 이 됐다(전체 게이트가 잡음) — `align-items:baseline` + 원만 `align-self:center` 로 기준선을 라벨 글자에서.
- **사이드 패널 안 속성 표 머리글의 오른쪽 선 없음**(다른 자리 그대로). **Time Picker 폭 = 최소 160**, 폼 안에서는 칸 폭을 채운다(입력칸 `width:0` 으로 글자 폭이 필드를 밀지 않게 — 그러지 않으면 단독이 206 이 됐다). 정책 설정 행의 160 고정은 그대로. **Navigation · Top Navigation 선택 굵기 700.**
- **검색 툴바 = 한 줄, 검색칸이 남는 폭을 맞춤**(사람의 요청 — 11-15 의 두 줄을 바꿈). `.toolbar > .searchbar{flex:1 1 0;min-width:12.5rem}`, 툴바 안 Combobox 는 제 폭 · 최소 200 · 입력칸 `width:0`. 검색 패턴 툴바를 검색 · 심각도 · 기간 한 줄로(사이트 · React), Search Rules '툴바' 행.
  **사람이 정하지 않은 것:** 심각도 태그 둘(Critical · High)이면 1440 에서 검색 200 + 필터 277 + 기간 300 이 758 에 들지 않아 줄이 바뀐다. 검색칸 최소 200 은 지키고 패턴 예시의 기본 선택을 Critical 하나로 줄였다(사이트 · React).
- contrast +144 = 아바타 이니셜 / 면 6쌍 × 맥락 12 + Indicator 아이콘 / 원 6쌍(흰 / 톤 5 · brand-label / 제품 면) × 12. advisory +44 = 흰 아이콘 / 톤 원 3:1 미달(라이트 초록 2.46 · 주황 2.24 · 회색 2.78, 다크 초록 1.98 · 주황 1.91 · 빨강 2.91 · 시안 2.25 — 사람의 요청한 표현이라 REF, 뜻은 라벨이 나름)과 주황 제품 예외. behave +9 = 아바타 2 · Indicator 4(라이트 · 다크 · 중립 다크 · 비활성 행) · 내비 굵기 · 패널 표 선 · Time Picker 폭 3(상단 내비 단정에 굵기를 더함, 검색 툴바 단정은 두 줄 → 한 줄로 다시 씀). react +2(`avatar-tone.test`).
- 음성 시험: 아바타 tone 규칙 지움(2) · Indicator 원 크기 · accent 아이콘 · 비활성 아이콘(4) · 내비 600 · 상단 내비 굵기 · 패널 선 · Time Picker 두 규칙(5) · 툴바 검색칸 · Combobox 입력 폭(각 1) 모두 잡혔다. 폼 안 Time Picker 최소 폭 규칙(`.form .timepicker.field`)만 지워도 넓은 예제에서는 결과가 같아 단정이 없다(좁은 폼 칸에서만 드러남).
- Figma 미반영 605건 — 같은 날 HEAD 사본에서 재면 726(위 항목의 736 은 그날 측정)이고, Negative 버튼 변형이 Figma(빨강)와 다시 맞은 몫이 줄었다. 새로 어긋난 것은 Indicator 원 · accent 면 · Spec(Indicator · Navigation · Top Navigation · Button State)이다. 아바타 색 · Time Picker 폭 · 검색 툴바는 audit 대조 밖 — 일괄 반영 때 그린다.

2026-11-16 추가 수정 넷(사람의 요청 · 결정 셋) — behave 1470 → 1474 · react 861+6 → 860+6. contrast · advisory · verify · pages 수는 그대로.
- **Chip** — 고른 칩 글자 600, 글자 앞 체크 선 2 → 2.5(시스템의 선 단계 1.5 · 2 · 2.5 에서 한 단계). 체크 mask 는 `icons-css.js` 가 `style.src.css` 에 써 넣는다 — CSS 만 고치면 빌드가 되돌린다(처음에 그렇게 놓쳤고 단정이 잡음). 고른 칩이 몇 px 넓어진다.
- **톤 없는 Notice 아이콘 = `--foreground-neutral-secondary`**(사람의 결정 — 유의사항만이 아니라 전체), `.notice.info` 는 시안 그대로. 유의사항 패턴 · React `Notes` 의 아이콘 = `message-2`(filled, 경고면 경고 아이콘). 회색 아이콘 / 회색 면은 기존 neutral-secondary 4.5 쌍이 잰다(설명만 고침). 접힌 유의사항(Accordion 머리)의 info-circle 은 Notice 가 아니라 그대로다.
- **폼 위 오류 요약을 통째로 없앴다**(사람의 결정 — '3개 이상이면 요약' 만이 아니라 자동 요약 · ErrorSummary · `.form-summary` 모두). 사이트 `vSummary` · React `useFormValidation` 의 summary 를 지웠고, 검증은 필드 오류 + 첫 오류로 포커스 + `ds:validate` 만 한다. 서버 오류는 그 필드 아래에, 필드에 붙일 수 없으면 Toast(Form Rules '서버 오류' · Foundations › Interaction).
  React `ErrorSummary` 는 한 번 경고하고 위험 Notice 로 그린다(제품의 서버 오류가 조용히 사라지지 않게 — MIGRATION '1.0 정리 목록'). Form 페이지의 'Error Summary' 예제를 'Error'(필드 아래 오류만, id `error` — React 예제 파일도 이름을 바꿈)로, 입력 폼 패턴의 요약 상자 · 문구를 지웠고 uses 에서 notification 을 뺐다. verify 가 예제의 `.form-summary` · `data-form-summary` 를 막는다.
- **Pagination 기본 = outline**(사람의 결정 — 면 없는 옛 기본은 `.ghost` 변형으로). `.pagination:not(.ghost)` 가 옛 `.pagination.outline` 과 같은 명시도(0,2,1)라 고른 칸의 제품 색 면을 쉬는 면 규칙이 이긴다. React `Pagination` · `CursorPagination` `variant="outline" | "ghost"`, 옛 `outline` prop 은 경고하고 무시. verify 가 예제의 `.pagination.outline` 을 막는다. 표 · 패턴의 모든 Pagination 이 outline 이 된다.
- behave +4 = 칩 굵기 · 체크 선 1 · Notice 아이콘 색 라이트 · 다크 2 · Pagination 기본 · ghost 1(기존 단정 고침 — 요약 단정 넷을 '요약 없음' 으로: behave.js 둘 · behave.promote 둘 · behave.revise 하나, Pagination hover 단정의 선택자를 기본으로). react −1 = ErrorSummary 단정 4 → 2(경고 후 Notice · 자동 요약 없음) + Pagination variant 1.
- 음성 시험: 사이트 6건(칩 굵기 · 체크 선 · Notice 회색 · 유의사항 아이콘 · Pagination 기본 · 옛 ds.js 의 자동 요약) · verify 2건(`.pagination.outline` · `.form-summary`) · React 3건(ghost 클래스 · ErrorSummary 클래스 · Form 자동 요약 되살림) 모두 실패로 잡혔다. behave.js 의 제출 검증 요약 단정은 전체 게이트에서만 돌아 음성 시험을 따로 하지 않았다.
- Figma 미반영 605 → 606건(Pagination Spec Container 문구). Figma 의 Pagination 기본은 아직 면 없는 모양이고 Chip 선택 굵기 · Notice 아이콘은 audit 대조 밖 — 일괄 반영 때 그린다.

2026-11-17 제품 색 이름 · 제품3 남색(사람의 요청 · 결정 둘) — contrast 3336 → 3892 · advisory 987 → 1149 · behave 1474 → 1491 · react 860+6 → 861+6. pages · verify 수는 그대로.
- **이름 = 역할** — 메뉴 · Colors 표의 이름을 기본 · 제품1 · 제품2 · 제품3 · 브랜드 · 중립 · AI 로(파랑 · 빨강 · 시안 · 주황 · 중립 · AI 였다). **키는 그대로**(`blue` · `red` · `cyan` · `orange` · `neutral` · `ai`) — `data-accent` · `applyProductColor` 는 API 라서.
  메뉴 옆 작은 갈래 글자와 `group` 필드를 없앴다(사람의 결정 — '작은 글자 없앰'). Colors 표의 '갈래' 열도 없어졌다. verify 가 `group` 되살림 · 같은 이름 둘을 막는다.
- **제품3 = 키 `navy` · `#10367D`**(제품2 다음) — 흰 글자 11.39. 팔레트 여섯 → 일곱(`data.js` · React `PRODUCT_COLORS` · verify `KEYS` · 문서의 수).
- **다크 주 면 자동 밝힘**(사람의 결정 — 예외 선언 · 값 바꾸기 대신) — 다크 주 면(`--surface-brand-primary`)은 제품 HEX 그대로라 남색이 다크 카드 면과 1.40 이었다(면 분리 기준 1.5 — 첫 빌드 contrast 실패 1).
  `accentScale` 이 다크 바탕 셋 위 1.5 를 넘을 때까지 0.5 씩 밝힌 `50d` 를 만들고(어두운 제품만 — 지금은 제품3 하나, `#113B88` · 카드 1.52 · 흰 글자 10.47 · hover 55 `#134094` 가 더 밝음) `--prod-50d` → `--brand-50d:var(--prod-50d,var(--brand-50))` 를 다크의 주 면이 쓴다. 다크 글자 단계(60) 보정과 같은 방식이고 사이트 · React · Design Token 예시 코드가 같은 식이다. `DEVIATIONS` 의 다크 `surface-brand-primary` 를 `var(--brand-50d)` 로, verify 의 원시 토큰 이름 규칙에 `d` 접미.
- 문서: 빨강 · 주황의 중립 입력 링 문장에 역할 이름(제품1 · 브랜드)을 더했고, Colors 'Product color' 에 '다크 주 면도 자동으로 밝힘'.
- **수의 근거:** contrast · advisory 는 맥락이 12 → 14(라이트 · 다크 × 일곱) — 맥락당 278쌍 · advisory 약 81. behave +17 = 팔레트를 도는 기존 단정에 제품3 이 한 번씩 더 돎 12(Brand 면 · 단계 규칙 등 — 단계 규칙의 다크 면 기대값을 50d 로 고침) · 다크 · 라이트 brand 글자 AA 루프에 navy 2 · 새 단정 3(behave.product 제품3 주 면 · 다른 제품 50d 없음, behave.js navy 다크 면 = 50d). 메뉴 단정은 '일곱 · 이름만' 으로 고침. react +1 = 50d 와 이름 단정.
- 음성 시험: 빌드된 app.js 에서 50d 를 빼면 behave.product 15/16(그리고 원본에서 빼면 contrast 실패 1 — 처음 빌드가 그 상태였다).
- Colors 'Product color' 표의 머리글이 한 칸씩 밀려 있었다(설명 열이 '적용', 버튼 열이 '미리보기') — 이름 · 값 · 흰 글자 대비 · 설명 · 적용으로 고치고 이름 칸을 줄바꿈하지 않게 했다(캡처에서 발견).
- Figma 미반영 606건(그대로 — 팔레트는 Figma 대조 밖).

2026-11-17 팝업 안 Date Picker · Time Picker(사람의 요청 — 달력이 팝업 본문 안에서 잘림) — behave 1491 → 1495(`behave.patterns.js` 21 → 25) · react 861+6 → 864+6(`tests/picker-float.test.tsx` 3). contrast · advisory · verify · pages 수는 그대로.
- **잰 원인:** 팝업 본문(`.popup-body` · `.popup-form`)과 패널 본문은 `overflow-y:auto` 라, 그 안의 달력 · 열 목록(absolute)이 본문 밖에서 잘렸다. 내보내기 팝업에서는 위로 열린 달력의 위쪽이 잘렸다.
- **넘침을 자르는 영역 안이면 화면 기준(`.float`)으로 띄운다** — Dropdown · Combobox 와 같은 방식이다. `.datepicker.float>.calendar` · `.timepicker.float>.time-panel{position:fixed;z-index:30}`, 자리 변수(`--dp-*` · `--tp-*`)가 화면 좌표가 된다. 사이트 ds.js `pickerSpot` · React `utils/pickerPlace.ts` 가 같은 식이다. 화면 기준으로 뜬 조상(띄운 달력 안의 시각 칸)을 만나면 거기서 멈춘다 — 그 칸은 다시 띄우지 않는다.
- **사람이 정하지 않은 기본값:** 띄운 목록은 바깥이 스크롤되면 필드를 따라간다(열린 방향은 그대로). 필드가 화면이나 자르는 영역 밖으로 나가면 닫고, 포커스가 안에 있었으면 입력칸으로 돌린다(Dropdown 은 스크롤하면 바로 닫는다 — 피커는 시각을 치는 중일 수 있어 따라가게 함). 목록 자신의 스크롤(시각 열)은 닫지 않는다.
- **문서:** Date Picker 고르기 표 Placement 에 '팝업 · 패널 본문 안에서도 본문에 잘리지 않고 그 위로 뜸', Time Picker Rules '팝업 안' 행(7 → 8행), MIGRATION.
- behave +4(part 22: 내보내기 팝업의 달력 — 네 모서리가 보임 · 필드에서 4 · 바깥 스크롤을 따라감 · 필드가 사라지면 닫힘과 포커스 복귀, 시각 목록 — 같은 방식 · 열 스크롤에도 열림 · 닫으면 `.float` 없음, 시각 있는 Date Picker 를 팝업에 넣어 안쪽 시각 칸은 absolute, 비밀값 생성 팝업 · 스크롤 영역 밖 Date Picker 는 absolute). react +3(Date Picker · Time Picker 의 `.float` · 목록 스크롤 유지 · 바깥 스크롤로 닫힘, 스크롤 영역 밖은 `.float` 없음).
- 측정에서 드러난 것: 이 사이트는 부드러운 스크롤이라 스크롤 도중에 열면 그 순간 자리로 방향을 정한다 — 단정은 즉시 스크롤 뒤에 연다.
- 음성 시험: 사이트 4건(fixed 지움 · 따라가기 지움 · fixed 조상에서 멈춤 지움 · 띄우기 끔) · React 4건(두 피커의 `.float` 클래스 · 닫기 경로 · 목록 자신 스크롤) 모두 실패로 잡혔다.
- Figma 미반영 606 → 607건(Date Picker Placement 문구).

2026-11-17 Text Field Code — 2단계 인증 코드 칸 여섯(사람의 요청 · 결정 둘) — behave 1495 → 1497(`behave.patterns.js` part 8 의 단정 1 → 3) · react 864+6 → 875+6(`tests/code-input.test.tsx` 10 · 예제 320 → 321 에 따른 구조 비교 1). contrast · advisory · verify · pages 수는 그대로(새 색 쌍 없음 — 입력 테두리 · 링 · 오류 · 비활성 그대로).
- **Text Field 의 변형으로**(사람의 결정 — 별도 컴포넌트 대신, 컴포넌트 수 그대로) — 사이트 `.field.code-field > label[for=첫 칸] + .code-inputs[role=group][aria-labelledby] > input[type=hidden][name] + input.code-cell × n`, React `CodeInput`(`length` 기본 6 · `onChange(value, {complete})` · `required` · `requiredMark` · `messages` · `help` · `error` · `disabled`). Text Field 페이지 Code 예제(검증 폼 · 오류 · 비활성), Rules '인증 코드' 행, Props · Spec Code 행.
- **칸 48 × 56 · 간격 8 · 숫자 Title 2 28/38 SemiBold**(사람의 결정) — 묶음 최대 328. 테두리 · 포커스 링 · 오류 · 비활성은 `.field input` 을 그대로 받는다.
- **동작** — 치면 다음 칸, 숫자가 아닌 글자는 받지 않음, 빈 칸에서 Backspace 는 앞 칸을 지우고 그리로, ← → Home End. 붙여넣기 · 문자 코드 자동 채우기는 그 칸부터 나눠 채운다 — 자동 채우기가 첫 칸에 코드 전체를 넣으므로 칸에 maxlength 를 두지 않고, `autocomplete="one-time-code"` 는 첫 칸에만. 앞에 빈 칸이 있는 칸을 누르면 첫 빈 칸으로. 값은 칸을 이은 글자(hidden · `ds:code {value, complete}`). 다 채워도 저절로 제출하지 않는다(사람이 정하지 않은 기본값).
- **검증** — 묶음 하나로 잰다(ds.js `vIsField` 에서 칸을 빼고 `vFields` · `vMessage` · `vShow` 가 `.code-inputs` 를, React `validationMessage` 가 `data-ds-code` 를). 비우면 `required`, 덜 채우면 **새 문구 키 `code`**("코드가 덜 입력됐습니다. {length}자리를 모두 입력하세요." — 사이트 · React 같음, labels-parity 가 대조). 칸마다 `aria-invalid`, 제출이 막히면 **첫 빈 칸**으로 포커스, 묶음을 떠날 때(칸 사이 이동은 제외) 건드렸거나 값이 있거나 이미 오류면 잰다.
- **로그인 패턴** 2단계 인증을 한 칸 `pattern="[0-9]{6}"` 에서 여섯 칸으로(사이트 `pCode` — `codeField` 와 같은 마크업 · React `CodeInput`). 원칙 '2단계 인증' 행의 '칸을 여섯 개로 나누지 않아' 를 고쳤다.
- **단정을 쓰다 드러나 고친 것 — 키보드 갇힘:** 칸마다 Tab 이 멈추니 빈 칸에서 Tab → 다음 칸 → '첫 빈 칸으로' 규칙이 되돌려 묶음을 빠져나갈 수 없었다. **Tab 칸을 하나로**(첫 빈 칸, 다 차면 마지막 칸 — 나머지 `tabindex="-1"`, 사이트 `codeRove` · React `rove`, 정적 마크업에도 적음). 단정이 Tab 으로 체크박스로 나가 오류를 알리고 Shift+Tab 이 첫 빈 칸으로 돌아오는지 잰다. React 에서는 다음 칸 포커스가 다시 그리기 전에 와 옛 값으로 '빈 칸' 을 판정해 되돌렸다(최신 값 ref 로).
- **문서 예제:** 처음엔 Code 예제를 `.form` 으로 감싸 카드 틀이 그려졌다(캡처에서 발견) — 클래스 없는 `form[data-validate]` · React `Form bare`.
- 음성 시험: 사이트 9건(나눠 채우기 · Tab 칸 하나 · 글자 거부 · code 문구 · 빈 칸으로 보내기 · Backspace · CSS 크기 · 첫 빈 칸 포커스 · 떠날 때 재기) · React 8건 모두 잡혔다. React '떠날 때 재기' 는 처음에 못 잡아(제출 뒤 경로만 있었다) 제출 전 테스트를 더해 잡았다. 전체 게이트에서 예제 수 고정 단정(`examples-coverage` 320)이 걸려 321 로 고쳤다.
- Figma 미반영 607 → 608건(Text Field Spec Code 행). Text Field 의 Code 변형은 Figma 에 없다 — 일괄 반영 때 그린다.

2026-11-17 메인 화면(index.html) 다시 짓기 — 큰 타이포 + 토큰 도형(사람의 요청 · 결정 넷) — behave 1497 → 1505(`behave.home.js` 8). contrast · advisory · verify · react · pages 수는 그대로(새 색 쌍 없음 — 반전 띠 글자 · 제품 면 위 라벨 · 옅은 면 위 brand 글자는 기존 쌍).
- **구조만 빌리고 모양은 토큰으로**(사람의 요청 — 디자인 시스템 메인 화면들처럼). 절 다섯: hero(큰 제목 + 토큰 도형 일곱 + 제품 색 칩 일곱) · 한 토큰, 세 출구(반전 띠 · 갈라지는 선 그림 · 세 링크) · 기반 가로 카드 일곱(Foundations 페이지마다, 그림도 토큰 · 데이터로) · 원칙(왼쪽 고정 제목 + 진짜 컴포넌트 조각) · 숫자(데이터에서 셈) + 섹션 카드 넷. 참고한 곳의 이름 · 링크는 어디에도 적지 않았다.
- **사람의 결정:** hero = 큰 타이포 + 토큰 도형(실제 컴포넌트 벤토 · 어두운 AI 화면 대신), 제품 색 칩 = 헤더 메뉴와 같이 사이트 전체에 적용 · 저장(기존 `[data-accent]` 클릭 처리를 그대로 — 새 동작은 `paintAccent` 의 칩 aria-pressed 한 줄), 아래 절 넷 모두, 연출 = 절마다 한 번 나타남(스크롤에 따라 색이 바뀌는 안 · 연출 없음 대신).
- **연출** `.appear` — index 의 head 스크립트가 줄인 모션이 아니고 IntersectionObserver 가 있을 때만 `data-appear` 를 붙이고, app.js 가 화면에 들어온 요소에 `.in` 을 한 번 붙인다. opacity · translate 를 `--motion-slow` 하나로, 반복 애니메이션 없음(verify 모션 검사 그대로). 스크립트가 없거나 줄인 모션이면 처음부터 보인다.
- **사람이 정하지 않은 것:** hero 문장과 도형 배치(도형 이름표 'Radius full' · 'Space 4' 같은 영문 Caption 2), 기반 카드 설명 일곱, 띠의 그림, 767px 이하에서 도형 셋만 남김, 반전 띠는 다크 테마에서 밝은 띠가 됨(토큰 블록이 `:root` 에만 있어 부분 다크를 쓸 수 없어 반전 토큰을 씀).
- **원칙 글은 한 곳에서** — `render.js` `PRINCIPLES` 를 홈과 `home/principles` 가 같이 쓴다(단정이 둘을 대조).
- **측정에서 드러나 고친 것:** 처음 이름 `.reveal` 이 Text Field 비밀번호 보기 버튼(`.field .reveal`)과 같았다 — `.appear` 로. build 가 app.js 를 돌린 셸에서 스냅숏을 떠서 `.in` 이 미리 박혀 모든 절이 처음부터 보였다(단정이 잡음) — build.js 가 스냅숏에서 그 상태를 걷는다. 가로 줄의 스크롤 스냅이 카드 시작을 패딩 2px 에 맞춰 처음 위치가 2 였다(이전 버튼이 꺼지지 않음) — `scroll-padding-inline`. 도형 이름표가 `<i>` 안이라 기울어 보였다(캡처). 원칙 표 조각이 390 에서 '차 / 단' 으로 끊겼다(캡처 — `.tbl-wrap` + `.tbl.nowrap`).
- behave.home 8 — 도형 일곱 · 칩 일곱 · 이름표 바로 섬, 칩이 사이트 전체 색 · 칩 하나만 눌림 · 헤더 점 · 저장, 다시 읽어도 유지 · AI 그라데이션 · 기본은 속성을 지움, 아래 절 투명 → 들어오면 한 번 나타남(320ms), 줄인 모션은 처음부터 보이고 transition 없음, 가로 줄(영역 이름 · 이전 꺼짐 · 카드 한 장 · 끝에서 다음 꺼짐 · hover 는 색만), 원칙 고정 제목(1440)과 쌓임(390) · 원칙 페이지와 같은 글, 숫자 = 데이터 · 링크 대상 있음 · 1920 · 2560 넘침 없음.
- 음성 시험 11건(칩 동기 · 관찰자 끔 · head 스크립트 · 줄인 모션 무시 · 가로 줄 동기 · 고정 · 고정 색 · hover 들림 · 스냅 패딩 · 숫자 · 기울임) 모두 잡혔다.
- Figma 미반영 608건(그대로 — 홈은 audit 대조 밖).

2026-11-17 메인 화면 비주얼 시안 — 도형 타이포 셋(사람의 요청 · 결정 넷) — 게이트 수는 그대로(`_concepts/` 는 검사 밖).
- 위 index.html 은 그대로 두고, 큰 영문 단어 사이에 원 · 반원 · 삼각형 · 알약 도형이 끼는 비주얼 메인 화면을 **사이트 밖 시안 폴더**에 셋 만들었다(사람의 결정 — 방향 A 도형 타이포 · 단색 면(질감 없음) · 다색 고정 + 가장 큰 도형 하나만 제품 색).
  A1 Build(밝은 바탕 — 단어 넷, 알약 스위치 토글 · 패럴랙스 · 단어 hover 에 짝 도형 · 누르면 색), A2 Tokens(어두운 바탕 고정 — 도형 = radius · space · color, 스크롤 양에 따라 변함 · 컴포넌트 이름 마키는 `SEARCH_INDEX` 에서), A3 JSDS(거대한 네 글자 + 떨어지는 도형 · 바뀌는 단어와 모양 · 커서 원 · 도형 끌기).
- 도형 색은 램프(red-50 · orange-50 · blue-50 · green-50 · purple-50 · violet-60 — 노랑 램프가 없어 노랑 자리는 orange-50), 제품 색 도형은 `--surface-brand-primary`(AI 면 그라데이션). 칩은 app.js 의 `[data-accent]` 처리로 사이트와 같은 저장값을 쓴다.
- **사람이 정하지 않은 것:** 문구 전부(영문), 도형 배치, A2 의 둘째 화면 · 마키, A3 의 바뀌는 단어 넷 · 커서 원 · 끌기, 시안마다의 연출 시간.
- 잰 것(scratchpad 스크립트 — 게이트 단정이 아님): 네 페이지 × 1440 라이트 · 다크 · 1024 · 768 · 390 · 1920 · 2560 오류 0 · 넘침 0, 칩을 누르면 큰 도형 = 제품 면 · 다시 읽어도 · 사이트 index 에서도 같은 색, 줄인 모션은 처음부터 보이고 무한 애니메이션 0(A3 글자가 숨은 채였던 것을 이걸로 찾아 고침), 마키 이름 46 = 데이터. 사이트가 `ul` 에 최대 폭 · `h1` 에 가운데 정렬을 주어 시안에서 되돌렸다.
- **같은 날 B1 · B2**(사람의 요청 — 카피 'Design that helps you secure faster' · 'A unified design system built to help teams detect, decide, and respond faster.', 결정 둘). B1 Simple = 가운데 두 줄 제목('secure' 에 제품 색 밑줄이 그어짐) · 서브 · 버튼 둘, 아래 **실제 패턴 화면 캡처 두 줄이 반대로 흐름**(사람의 결정 — 올리면 멈춤), 세 칸 링크(수는 `SEARCH_INDEX`). B2 Visual = 왼쪽 큰 두 줄 + 화면 가장자리로 잘려 나가는 coral 부채꼴 · green 알약 · **방패가 든 기울어진 콘솔 창**(사람의 결정 — 제품 색 머리띠 · 말풍선 꼭지 · 옅은 제품 색 몸통, AI 는 그라데이션), 들어올 때 회전하며 자리 잡고 · 느리게 떠 있고 · 스크롤 패럴랙스 · 창에 올리면 방패가 커지고 점 셋이 깜빡, 아래 목록 셋(Guide site · React package · Figma library)에 올리거나 포커스하면 오른쪽 미리보기 캡처와 틴트가 바뀜.
  - 캡처 `_concepts/capture.mjs` — 패턴 10쪽의 첫 미리보기를 1440 라이트 · 줄인 모션 · 배율 1.5 로 찍는다. **이미지는 라이트 고정**이라 다크 테마에서도 밝은 화면이 보인다.
  - 사람이 정하지 않은 것: 보조 문구(버튼 · 링크 카드 · 목록 설명 · 'Start here'), 도형 위치 · 크기 · 각도, 흐름 속도(80 · 95초), 목록과 캡처의 짝(Guide = 대시보드 · React = 정책 설정 · Figma = 로그 뷰어).
  - 잰 것(같은 scratchpad 스크립트 64/64): 여섯 페이지 × 일곱 화면 오류 · 넘침 0, 칩 → B1 밑줄 · B2 머리띠 = 제품 면 · 유지, 줄인 모션 숨김 0 · 무한 0, B1 이미지 20/20 로드 · 흐름 · hover 멈춤, B2 hover · 포커스로 미리보기 바뀜, 알약은 제품 색을 따르지 않음.
- **같은 날 B3 Signal**(사람의 요청 — B2 가 참고한 화면과 너무 닮아 우리만의 컨셉으로, 아래도 미리보기 두 칸 대신 바로가기 배너 셋, 결정 둘). 왼쪽 큰 제목 · 서브 · 버튼은 B2 그대로이고, 기울어져 가장자리로 잘려 나가는 도형 · 콘솔 창 일러스트 · 목록 + 미리보기는 버렸다.
  - **히어로 그림 = 탐지 · 판단 · 대응 흐름**(사람의 결정): 정면 레이더(동심원 셋 · 제품 색 방패 · 4초에 한 바퀴 훑는 부채꼴) 위에 심각도 다섯 색 점이 훑일 때 울린다. 한 바퀴 8.8초 — Detect 칩 → 진짜 컴포넌트 클래스(`.tag` · `.btn`)로 만든 판단 카드가 점에 선으로 이어지고 Block 이 눌림 → 점이 초록 체크 · 결과 줄. 바퀴마다 사건이 바뀐다(셋). 아래 Detect · Decide · Respond 진행 막대와 **일시 정지 버튼**(5초 넘게 저절로 움직여서). 줄인 모션은 판단 카드가 뜬 Decide 정지 화면.
  - **아래 = 바로가기 배너 셋 Foundations · Components · Patterns**(사람의 결정 — 수는 `SEARCH_INDEX`), 토큰으로 그린 작은 그림이 hover 때 움직인다(막대 높이 · 스위치 켜짐 · 막대 참), 카드 들림은 없음.
  - 사람이 정하지 않은 것: 사건 셋의 문구 · 시간, 점 위치 · 단계 시간, 배너 그림. 1440 에서 제목이 세 줄(오른쪽 레이더 칸 때문 — B2 는 두 줄).
  - 측정에서 고친 것: 판단 카드가 Critical 점을 덮었다(점 자리를 카드 밖으로), 도는 부채꼴의 사각 상자가 가로로 21px 넘쳤다(원 안에 자름), 390 에서 점 격자가 6px 넘쳤다. 같은 스크립트 80/80(B3 단정 16 — 여섯 화면 · 칩 · 줄인 모션 · 한 바퀴 순서 · 다음 사건 · 일시 정지와 재개 · 배너 수 · 링크).
- **2026-11-18 B4 Balance**(사람의 요청 · 결정 — B2 바탕의 정지 시안 넷을 이미지로 고른 뒤 페이지로). 이미지 단계에서 정한 것: 콘솔 창 대신 B3 의 방패 그림(옅은 제품 색 원 · 점선 궤도 · 체크 든 방패 · 빨강/초록 점)을 바로 세워 넣음, 아래는 B3 배너 셋에 포인트 하나짜리 아이콘(겹친 색 원 셋 · 켜진 스위치 · 회색 창의 제품 색 블록 하나 — 올리면 벌어짐 · 늘어남 · 커짐), 텍스트 가운데 정렬, 카피 'JS Design System' + 한국어 두 문장(사람이 준 글), 도형은 양쪽 대각선 균형(왼쪽 위 **주황 반원 — 새로 더함** · 왼쪽 아래 방패 / 오른쪽 위 빨강 부채꼴 · 오른쪽 아래 초록 알약), 반원을 줄이고 방패를 키움.
  - 방패와 아이콘의 포인트만 제품 색(AI 는 그라데이션), 부채꼴 · 알약 · 반원은 고정 색. 1023 이하는 방패가 글자 아래 가운데. 서브 문장은 1024 이상에서 문장마다 한 줄(최대 폭 54rem · keep-all).
  - 반투명 옅은 제품 색이라 뒤의 알약이 원을 통과해 비쳤다 — 원을 바탕색 위에 합성해 불투명하게.
  - 사람이 정하지 않은 것: 반원 · 방패의 크기와 자리, 아이콘 모양과 hover 연출, 패럴랙스 세기(글자 위 도형은 스크롤보다 빨리 올라가고 아래 도형은 느리게 — B2 의 값 그대로면 스크롤 100 ~ 450 에서 방패가 서브 문구 위를 지나갔다), 모음 카드 그림.
  - 잰 것(같은 scratchpad 스크립트에 B4 단정 13 · 페이지 목록에 B4): 일곱 화면 오류 · 넘침 0, 2560 ~ 390 일곱 폭에서 글자(둘레 8px)와 도형의 실제 칠한 면 겹침 0 · 방패 화면 안, 스크롤 100 · 200 · 300 · 450 에서도 겹침 0, 들어오기(처음 투명 → 2.6초 뒤 넷 다 보임 · 떠 있기 4/4), 칩 · 다시 읽어도 유지 · 줄인 모션 숨김 0 · 무한 0, AI 에서 고정 도형 색 그대로 · 방패 · 아이콘 포인트 그라데이션, 배너 수 = 데이터 · 링크 응답, 모든 페이지에 B4 링크.
  - **같은 날 B4 로 결정**(사람의 결정). 첫 수정: 시안 머리(JSDS 로고 + 아이콘 링크 둘 + 아래 선)를 **사이트 헤더 그대로**로 바꾸고 로고만 시안의 'JSDS' + 제품 색 점. 메뉴 다섯 · v0.9 · 제품 색 · 검색 · 테마 · ☰ 드로어는 사이트 `index.html` 의 마크업을 복사해 링크에 `../` 만 붙였다(동작은 app.js 그대로, `body[data-root="../"]`). 히어로 최소 높이는 머리 5rem 대신 `--header-h`. 아래 선은 사이트처럼 없다.
  - 잰 것(scratchpad `b4-head-check.js` 56/57 — 1920 헤더 68 은 화면 폭 단계로 4rem 이 68px 이 된 것이라 기대값이 틀렸다): 일곱 화면 오류 · 넘침 0 · 헤더 위 도형 0, 1200 이상 메뉴 · 미만 ☰, 링크 6 응답, 제품 색 팝 7 → 빨강을 고르면 방패 · 아래 칩이 따라감, 검색 결과 링크 응답 · `/` 단축키, 테마 전환 때 헤더 = 바탕, 390 드로어 다섯 섹션 → 하위 링크 응답. cx-measure 104/104 그대로.

2026-11-18 메인 화면 = B4 Balance(사람의 결정 넷 — 통째로 교체 · 메인 히어로만 움직임 예외 · 영어 문구 그대로 · 모든 헤더 JSDS 로고) — 게이트 수는 그대로(`behave.home.js` 8 → 8 을 다시 씀 · behave.type 의 홈 제목 단정 1 을 다시 씀).
- **11-17 의 홈(토큰 도형 hero · 제품 색 칩 · 반전 띠 · 기반 가로 줄 · 원칙 · 숫자 · 섹션 카드)을 지우고** `_concepts/b4-balance.html` 의 히어로 + 바로가기 배너 셋으로 바꿨다. 원칙 글(`PRINCIPLES`)은 Home › Principles 페이지에 그대로다. 옛 홈의 제품 색 칩 · 절 나타나기(`.appear`) · 가로 줄 코드는 app.js 에서 지웠다 — 제품 색은 헤더의 팔레트로 고른다.
- **모든 페이지 헤더 로고 = 'JSDS' + 제품 색 점**(`.brand .logo`, 800 · 22, 점은 `--surface-brand-primary` · AI 는 그라데이션). 링크 이름 'JS Design System 홈', 글자는 aria-hidden.
- **움직임 예외**(사람의 결정) — 글자 떠오르기 0.9초 · 도형 들어오기 1.3초(순차) · 도형 떠 있기 8초 반복은 토큰이 아니다. verify 의 `HOME_MOTION` 에 세 줄 그대로 선언했고 그 밖의 값은 막는다(지우면 verify 실패 3). `data-hm` 은 index 의 head 스크립트가 줄인 모션이 아닐 때만 붙이므로 줄인 모션 · 스크립트 없음이면 처음부터 마지막 모습이고 패럴랙스도 없다. 패럴랙스 변수 `--hm-*` 는 `LOCAL_VARS`.
- **홈 제목은 텍스트 스타일 표 밖**(사람의 결정) — `clamp(2.5rem,6vw,6rem)` · 행간 1.04 · 700 · 자간 -0.045em, 767 이하 `clamp(2.25rem,10.5vw,3rem)`. behave.type 의 '홈 제목 = Display 1' 단정을 이 선언값을 다섯 폭에서 재는 단정으로 바꿨다.
- **시안과 다르게 한 것:** 배너 hover 의 시간이 시안의 0.25 ~ 0.5초 · 튀는 이징 대신 `--motion-base` · `--motion-slow`(verify 규칙), 반경 999px → `--radius-full`, 스위치 손잡이 그림자 → `--shadow-sm`. Components 배너는 Button 이 아니라 Components 개요로 간다. 배너 수는 데이터(`allPages`)에서 센다.
- **behave.home 8** — 구성(도형 넷 · 방패 이름 · 배너 수 = 데이터 · 세 페이지의 로고), 들어오기(처음 숨음 → 넷이 떠 있음 8s), 줄인 모션(data-hm 없음 · 보임 · 움직임 0 · 패럴랙스 0), 패럴랙스 방향, 겹침(2560 ~ 390 일곱 폭에서 글자 둘레 8px 와 도형의 칠한 면 0 · 방패 화면 안 · 1024 이상 서브 한 줄 · 스크롤 중 0), 제품 색(방패 · 아이콘 포인트만 · 고정 도형 셋 그대로 · AI 그라데이션 · 단색은 none), 배너 hover(면 색만 · 뜨지 않음 · 200ms), 링크 · 넘침.
- **측정에서 드러나 고친 것:** 겹침을 처음엔 바깥 `.hm-sh`(회전 전 사각형)로 재서 768 · 390 에서 거짓 실패가 났다 — 반원 · 부채꼴 · 알약은 `.hm-in`(둥근 모서리 · 회전 반영), 방패는 원 · 방패 · 점 조각만 재게 고쳤다(시안의 cx-measure 도 바깥 상자를 쟀다). 기본 제품 색 키는 `blue` 가 아니라 빈 값이다.
- 음성 시험: behave 8건(부채꼴을 글자 위로 · 고정 도형이 제품 색 · 줄인 모션 무시 · 배너 들림 · 떠 있기 지움 · 패럴랙스 반대 · 로고 점 지움 · `.go` 안 붙임) 모두 7/8 로 잡혔고 verify 1건(예외 지움 → 실패 3).
- Figma 미반영 608건(그대로 — 홈 · 헤더 로고는 audit 대조 밖).

2026-11-18 템플릿 검토에서 나온 수정 일곱(사람의 요청 · 결정 넷) — behave 1505 → 1522(`behave.shell.js` 17) · react 875+6 → 882+6(`tests/topbar.test.tsx` 4 · labels-parity 1 · 예제 321 → 323 에 따른 구조 비교 2). contrast · advisory · verify · pages 수는 그대로(새 색 쌍 없음).
- **Top Navigation 높이 3.5 → 3.875rem(62).**
  - **왼쪽 영역 `.topbar-start`** — 로고와 사이드 내비 접기 버튼을 양끝에 두고, 바 왼쪽 끝부터 240(사이드 내비 폭)이다. **사이드 내비를 접어도 240 그대로**(사람의 결정)이고 아래 내비만 64 가 된다.
  - 접기 버튼 `[data-sidenav-toggle][aria-controls][aria-expanded]` · 이름 '메뉴 접기' · '메뉴 펼치기' + Tooltip. ds.js 가 대상 `.sidenav` 의 `.collapsed` 를 바꾸고 `ds:sidenav {collapsed}` 를 낸다. 접힌 레일에서는 하위가 현재인 부모(`a.has-on`)가 `aria-current` 를 잇는다(React `hasActiveChild` 와 같게).
  - React `TopBarStart` · `TopBarNavToggle` 이고 `SideNav collapsible` 은 펼친 상태에서도 이름 Tooltip 을 그린다. 사이드 내비가 없는 Default 예제에는 버튼이 없다.
- **설정 옆 라이트/다크 버튼** `[data-theme-toggle][aria-pressed]` — 이름 '다크 모드', 갈 테마의 아이콘(moon · sun-high)을 보인다. ds.js 가 `html[data-theme]` 를 바꾸고 `ds:theme {theme}` 를 낸다. 저장은 제품 몫이다(문서 사이트는 `jsds-theme` 에 저장). React `TopBarThemeToggle`. 오른쪽 순서는 검색 · 알림 · 설정 · 테마 · 사용자(verify).
- **오른쪽 아이콘 버튼 sm → md 40 · 검색 32 → 40**(사람의 결정 — 같은 줄 높이 규칙 때문에 검색을 함께 올림, 11-12 의 '검색 32' 를 바꿈). 아바타 32 는 그대로다. verify 가 상단 바의 sm 아이콘 버튼을 막는다.
- **알림 벨은 점이 기본** — Top Navigation 예제와 Notification Center 모두. Notification Center 는 `.notify[data-count="number"]` · React `count="number"` 일 때만 숫자를 보인다(새 예제 Count). 접근 이름 '알림 n건' 과 안 읽음 탭의 숫자는 그대로다. **아이콘 위 숫자 배지는 Caption 2 11/14**이고 99 를 넘으면 99+ 다. 사이드 내비 · 탭 안의 Count 는 12 그대로다(사람이 정하지 않은 기본값).
- **사이드 내비 아이콘 = `--foreground-neutral-secondary`**(tertiary 였다).
- **위저드 안 폼은 폭 제한 없음** `.stepper .form{max-width:none}`.
- **flush 카드의 마지막 표** — 마지막 행 아래 선을 지운다(카드 테두리와 겹쳐 두 줄이었다 — 조직도 · 대시보드). 마지막이 숨긴 상세 행이면 그 앞 행에서 지운다.
- **로그인** — 'Security Console' 줄을 지우고 카드 위 가운데에 제품 로고 `.auth-logo`(제품 색 사각 + shield + 제품 이름, `role="img"`)를 둔다. '관리 콘솔 로그인' 제목은 `.sr-only` 로 남긴다(사람의 결정 — 라벨 유지 + 칸 안 아이콘). **Text Field 칸 안 앞 아이콘** `.field .affix > .field-icon`(18 · tertiary) · React `TextField icon` · 예제 With Icon, Rules '아이콘은 라벨을 대신하지 않음'. 참고 이미지의 언어 선택 · 아래 안내문 · 저작권 줄은 요청 밖이라 넣지 않았다.
- **버튼 묶음 간격** sm 0.375 · md 0.5 · lg 0.75rem(`:has()`), Button Rules '버튼 묶음' 행(Rules 3 → 4행).
- **액션 바 좌우 패딩 0**(위아래 10 그대로).
- **대시보드** — '심각도 분포' 는 탐색형 도넛(가운데 1,054), '탐지 추이' 는 '일별 탐지' 누적 막대(사람의 결정 — 같은 14일 데이터 · 심각도 톤), KPI 넷은 스파크라인 없음(KPI 기본).
- **템플릿** — 사이드 내비를 한 벌로 합치고(레일 사본을 지움) 상단 바 버튼으로 접는다. 1280 미만은 처음부터 접힌다(사람이 정하지 않은 기본값).
- **측정에서 드러나 고친 것:** 칸 안 아이콘의 색 선언이 `.field .affix span`(tertiary)과 같은 쓸모없는 선언이었다(음성 시험으로 발견해 지움). Default 예제 바가 아이콘 버튼 · 테마 버튼 · 구분선이 늘어 1440 · 2560 미리보기를 9px 넘쳤다 — 예제의 1차 메뉴 넷 중 '에이전트' 를 뺐다(사이트 · React). 접힌 레일의 부모에 `aria-current` 가 없었다.
- **기존 단정 고침 8:** 상단 검색 32 → 40(behave.layout), 벨 Count 숫자 → 점(behave.notify 셋 — 탭 숫자 · 99+ 는 그대로), 벨 점 모서리 -6 → -2(behave.nav), 대시보드 KPI 스파크 2 → 0(behave.chart), 대시보드 추이 선 · 정적 도넛 → 막대 · 탐색형 도넛(behave.js), 좁은 상단 바의 높이 3.5 → 3.875rem(behave.nav), Button Rules 3 → 4행. 좁은 상단 바 · 2560 넘침 단정은 예제를 고쳐 그대로 통과한다.
- 음성 시험: 사이트 15건 · verify 4건 · React 6건 모두 실패로 잡혔다.
- Figma 미반영 — 기준 덤프 721건 · 묶음 2 의 마지막 덤프(dump-b2f) 386건(묶음 2 가 잰 수와 같다 — 그 측정 때 이번 변경이 이미 저장소에 있었다). 이번 변경으로 새로 생긴 것은 Spec 의 저장소에만 있는 행 둘(Text Field · Icon, Navigation · Icon)이고, 나머지 Spec 문구 변경(Top Navigation · Search · Button · Card · Indicator · Steps · Data Table · Table)은 이미 어긋난 행이다. 상단 바 · 알림 점 · 로그인 · 대시보드는 Figma 에 그리지 않았다.

2026-11-18 추가 수정 — 대시보드 일별 탐지 · Page Header 간격 · 로그인 화면 · 테마 아이콘 · 알림 점 · 버튼 아이콘(사람의 요청 · 결정 셋) — behave 1522 → 1530(`behave.shell.js` 17 → 25) · react 882+6 → 883+6(`tests/dashboard-chart.test.tsx` 1). contrast · advisory · verify · pages 수는 그대로(새 색 쌍 없음 — 저작권 줄 tertiary / 회색 바탕은 기존 쌍).
- **요청 일곱 중 7번(상단 검색창 `min-width` 제거)은 사람이 취소했다** — 상단 검색 최소 폭 220 그대로.
- **대시보드 '일별 탐지' = Data Visual Default 와 같은 계열 하나인 선 추이**(사람의 결정 — 차트만 같게. 큰 값 · 증감 · '전체 보기' 는 넣지 않아 같은 줄 '심각도 분포' 카드와 머리 구성이 같다). 데이터는 Data Visual 의 `daily14`(합계 1,429)를 패턴 상수 `DAILY14` 로 두고 옛 심각도 누적 막대 `TREND` 를 지웠다(사이트 · React · 템플릿). 같은 날 앞 항목의 '일별 탐지 누적 막대' 결정을 바꿨다.
- **`.page-head` 아래 여백 16**(`margin-bottom:1rem`) · Page Header Spec Size 행.
- **로그인 화면**
  - 새 틀 `.auth-screen`(회색 바탕 · 가운데 정렬 · 최소 높이 40rem · 아래 여백 4.5rem) + `.auth-copy`(아래 24 에 고정 · 가운데 · Caption 1 12/16 · tertiary). 문구 `© 2026 JIRANSECURITY Co., Ltd. All rights reserved.`(사람의 결정). 패턴 예제 로그인 · 2단계 인증은 각각 이 틀 안에, 템플릿 로그인은 화면 전체가 틀(`min-height:100dvh`)이고 두 폼에 저작권 줄 하나.
  - 카드 `.form.auth` — 테두리 없음 · `--shadow-2` · `--radius-xl`. **`--radius-xl` 0.625 → 0.875rem(14)** — 팝업 모서리도 14 가 된다(Popup Spec · Foundations › Radius 쓰임 · Elevation 의 shadow-2 쓰임에 로그인 카드).
  - 로고 `.auth .auth-logo` margin 16 · gap 8, 아이콘 칸의 면 · 반경 · 색을 지우고 `shield-check` 면 아이콘 48(로고 글자색을 따름).
  - 아이디 → **이메일**(`type="email"` · id `si-email` · `autocomplete="username"` 그대로), '이메일 저장', 실패 문구 · 원칙 · 썸네일도. 두 칸은 **라벨을 숨기고 placeholder** 로 보인다 — 숨긴 `<label class="sr-only">` · React `labelHidden` 으로 접근 이름은 남는다(verify 의 '글자 입력마다 접근 이름'). Text Field Rules '라벨' 행에 예외 한 문장(칸이 둘뿐이고 칸 안 아이콘이 뜻을 보탤 때만), 로그인 Rules 의 '로고' 행을 '화면' 행에 합치고 '칸' 행을 더했다(8행 유지 — 9행이면 소제목 규칙에 걸림).
  - 2단계 인증의 제목 · 설명을 `<div>` 한 묶음으로.
- **테마 버튼 = 지금 테마의 아이콘**(라이트 해 · 다크 달 — 앞 항목의 '갈 테마' 를 바꿈). 클래스 `.i-to-dark` · `.i-to-light` → `.i-light` · `.i-dark`(사이트 · React `TopBarThemeToggle` · 템플릿, verify 가 옛 이름을 막음, MIGRATION). 이름 '다크 모드' · `aria-pressed` 는 그대로.
- **아이콘 위 Count 점 = 모서리 안쪽 4**(`.with-count .count.dot{top:.25rem;right:.25rem}` — 앞의 -2). 숫자 배지 -6 그대로. Indicator Spec.
- **버튼 아이콘 16 · 20 · 28**(md 18 → 20 · lg 20 → 28), **lg 아이콘 선 1.6**(CSS `stroke-width` 가 svg 속성 2 를 이김 — 면 아이콘은 선이 없어 그대로). **loading 스피너도 16 · 20 · 28**(사람의 결정 — 11-12 의 '스피너 = 아이콘 크기'). Button Spec Size.
- **기존 단정 고침:** 스피너 16 · 18 · 20 → 16 · 20 · 28(behave.button), md 아이콘 18k → 20k(behave.scale), lg 아이콘 전용 버튼의 아이콘 20 → 28(behave.js), 벨 점 모서리 -2 → 안쪽 4(behave.nav · behave.revise), 로그인 id `si-email`(behave.patterns), 대시보드 추이 막대 → 선(behave.js part 42), behave.shell 테마 아이콘(part 3) · 로그인(part 7 다시 씀 — 5 단정) · 대시보드(part 8 다시 씀 — 2 단정). 새 단정: Page Header 아래 16 · 점 위치와 테마 아이콘 · 버튼 아이콘 크기와 선.
- **React 구조 비교는 차트 종류 · 데이터를 보지 않는다** — 대시보드 예제를 막대로 되돌려도 통과했다(음성 시험에서 발견). `tests/dashboard-chart.test.tsx` 가 `chart.js/auto` 를 흉내 내 대시보드와 Data Visual Default 가 Chart 에 넘기는 설정(종류 line · 계열 하나 · 같은 라벨 · 값 · 이름)을 대조한다. 처음에 `JSX.Element` 타입이 tsc 1건으로 잡혔다(vitest 는 타입을 안 봄).
- 음성 시험: 사이트 CSS 13(md 20 · lg 28 · lg 선 · 테마 아이콘 · 점 위치 · page-head 여백 · 카드 테두리 · 그림자 · radius-xl · 로고 margin · gap · 로고 48 · 저작권 줄 고정) · 마크업 6(이메일 type · placeholder · 보이는 라벨 · 2단계 div · 대시보드 막대 · 로고 면) · verify 1(옛 `.i-to-*`) · React 6(테마 아이콘 클래스 · 라벨 보임 · email type · 2단계 div · 저작권 줄 · 대시보드 막대) 모두 실패로 잡혔다.
- 템플릿 측정(scratchpad `measure.js`) 296/296 — 로그인 칸에 'admin' 을 치던 단정을 이메일로, 로그인 화면 1440 · 390(화면 높이 · 저작권 줄 하나 · 아래 24 × 루트 비율 · 카드와 겹침 없음 · 테두리 0 · 그림자 · 반경 14 × 루트 비율)과 테마 아이콘을 더했다.
- **사람이 정하지 않은 기본값:** 로고 아이콘 색 = 로고 글자색(color 를 지우라 해서 따로 칠하지 않음), 저작권 줄 12 tertiary · 아래 24, `.auth-screen` 최소 높이 40rem(예제 미리보기용 — 화면 전체로 쓰면 제품이 100dvh), placeholder 예외의 범위 문구, 클래스 이름 `.i-light` · `.i-dark`.
- **보인 것(고치지 않음):** 390 에서 실패 Notice 제목이 낱말 가운데서 끊긴다('않 / 습니다' — Notice 글자의 기존 줄바꿈), 템플릿 390 에서 검토용 떠 있는 도구 막대가 저작권 줄을 가린다(`templates.js` 의 흉내 — 사이트 밖).
- Figma 미반영 — 기준 덤프 721 → 730건, dump-b2f 386 → 418건. dump-b2f 기준 +34 = Button loading 스피너 크기(md 18 ≠ 20 · lg 20 ≠ 28), −2 = 대시보드 차트 줄이 Figma 의 '탐지 추이(timeseries) · 심각도 분포' 와 맞게 됨. Spec 문구(Button Size · Indicator Size · Popup Container)는 이미 어긋난 행이다. **audit 은 radius 변수를 대조하지 않아 Figma `radius/xl` 10 은 수에 없다** — 일괄 반영 때 14 로. 로그인 · 테마 아이콘 · 알림 점 위치는 Figma 에 그리지 않았다.

2026-11-18 나란한 버튼 = 버튼 묶음 · 사이드 내비 접기 아이콘 회전 · 상단 바 로고(사람의 요청 셋 · 결정 넷) — behave 1530 → 1536(`behave.shell.js` 25 → 31) · react 883+6 → 885+6(DatePicker.test 1 · file-upload.test 1). contrast · advisory · verify · pages 수는 그대로(새 색 쌍 없음).
- **버튼이 2개 이상 나란히 놓이면 늘 `.btn-group`**(사람의 요청 — 공통 규칙). 범위는 **전부, Button State 의 상태 시연 표만 뺌**(사람의 결정 — 액션 줄 · 표 액션 바 · 달력 아래 · 행 안 아이콘 버튼 · 상단 바 오른쪽 아이콘까지).
  **틀 안에 묶음을 넣는다**(사람의 결정) — `.popup-actions` · `.form-actions` · `.card-foot` · `.side-panel-footer` · `.step-actions` · `.page-head .actions` · `.cal-foot` · `.action-bar` · 상단 바 `.right` 는 자리 · 선 · 여백 · 정렬을 그대로 맡는다. 떨어진 버튼(폼 왼쪽 `.left` 삭제)은 묶음 밖.
  - **간격이 바뀌었다(실측):** 버튼 사이가 묶음 규칙 sm 6 · md 8 · lg 12 를 따라 팝업 · 폼 12 → 8, 카드 아래(sm) 12 → 6, 표 액션 바(sm) 12 → 6, 구분선 툴바는 버튼과 구분선 사이에도 6 이 생겼다(전에는 틀에 gap 이 없었다). 상단 바 오른쪽 · 사이드 패널 · 단계 · Page Header 동작은 원래 8 이라 그대로.
  - 사이트 데이터: 컴포넌트 · 패턴 예제의 나란한 버튼(스크립트로 감싼 뒤 손으로 — 상단 바 셋 · 구분선 툴바 · Tooltip hover · Count · 상세의 더 보기 Dropdown 까지), 정적 달력 `cal()`. ds.js: 달력 아래 `footHtml` 은 글자 버튼(프리셋 · 오늘 · 초기화) 묶음과 취소 · 적용 묶음을 따로(하나뿐이면 묶지 않음 — `margin-left:auto` 규칙을 묶음 기준으로), 파일 줄은 실패해 다시 시도가 생기면 묶고 하나로 돌아가면 푼다(옮긴 지우기 버튼의 포커스를 되돌림). React: `Stepper` · Date Picker 달력 아래 · `FileUpload` 실패 줄 · 예제 42개(구조 비교가 잡음). 템플릿: 상단 바 오른쪽 · Page Header 동작 · 팝업 버튼 · 표 액션 바 · 검토 도구 막대.
  - 문서: Button Rules '버튼 묶음' 행, ButtonGroup Props(틀 안에 넣음 · `.left` 는 밖), Card · Form(Spec Actions) · Popup · Steps · 액션 바 · Top Navigation `.right` 의 Props 설명.
- **사이드 내비 접기 아이콘은 180° 돈다**(사람의 요청) — 지금 아이콘 `layout-sidebar`(사람의 결정)를 `[data-sidenav-toggle][aria-expanded="false"] svg{transform:rotate(180deg)}` · `transition:transform var(--motion-base)` 로. 펼침은 막대가 왼쪽, 접힘은 오른쪽. 줄인 모션은 전역 규칙이 transition 을 꺼 바로 바뀐다. ds.js · React 는 이미 `aria-expanded` 를 맞춰 코드 변경이 없다. 상태가 정하는 svg 회전이라 hover · 누름 transform 금지 규칙과 무관하다(행 펼침 셰브론과 같은 방식).
- **상단 바 로고 마크 = shield-check 면 아이콘 24**(사람의 요청 — 로그인 로고와 같게, 색은 로고 글자색 — 사람의 결정). 제품 색 사각을 지웠다. `tbStart` · Top Navigation 예제 · 썸네일 · 템플릿, React `TopBarLogo` 기본 + 새 prop `mark`(사람이 정하지 않은 기본값).
- **behave.shell +6:** 모든 컴포넌트 · 패턴 예제(70쪽)에서 같은 줄 24 이내로 붙은 버튼(또는 버튼을 감싼 Tooltip · Dropdown · Count · 알림 틀) 둘 이상의 부모가 `.btn-group` — 떨어진 버튼(폼 왼쪽 삭제 · 툴바 spacer 뒤 · 달력의 오늘 | 적용 · Tooltip 위치 시연의 넓은 간격 104)은 붙어 있지 않아 세지 않고 예외는 Button State 표 하나, 열린 Date Picker 달력 아래 묶음 둘, 파일 줄 묶음 · 풀기 · 포커스 유지, 접기 아이콘 0° → 180°(--motion-base, 도중 각도) → 0°, 줄인 모션은 transition 없이 바로, 로고 면 없음 · svg 24 면 · 글자색. **기존 단정 고침 1:** Form actions 버튼 간격 12 → 8(behave.promote).
- **React +2:** Date Picker 달력 아래 묶음 모양(구조 비교는 열린 달력을 보지 않는다), FileUpload 실패 줄 묶음(네 상태 예제는 구조 비교 밖이라 음성 시험에서 못 잡아 더함).
- 음성 시험: 사이트 5건을 한 번에(팝업 예제 묶음 풀기 · ds.js 달력 묶음 끔 · 파일 줄 묶음 끔 · 회전 규칙 지움 · 로고 면 되살림) — behave.shell 25/31 로 여섯 단정이 각각 잡았다. React 3건(Date Picker 묶음 · Steps 묶음 · FileUpload 묶음) 모두 실패로 잡혔다(FileUpload 는 위 테스트를 더한 뒤).
- 템플릿 측정 296/296, 템플릿 화면 전체를 같은 방식으로 훑어 묶이지 않은 버튼 0.
- **사람이 정하지 않은 기본값:** 달력 아래 두 묶음을 따로 둠(글자 버튼 왼쪽 · 취소 적용 오른쪽), `TopBarLogo mark`, 회전 시간 `--motion-base`, behave 의 '붙어 있음' 기준(같은 줄 · 간격 24 이하).
- Figma 미반영 — 기준 덤프 730건 · dump-b2f 418건(둘 다 그대로). 바꾼 Spec 문구(Form Actions)는 이미 어긋난 행이다. 버튼 묶음 간격 · 접기 아이콘 회전 · 상단 바 로고는 audit 대조 밖이다 — 일괄 반영 때 팝업 · 폼 · 카드 버튼 간격(8 · 6)과 로고를 그린다.

2026-11-18 Textarea 크기 셋(사람의 요청 '사이트와 Figma 둘 다 Small · Large') — behave 1536 → 1538(`behave.shell.js` 31 → 33). contrast · advisory · verify · react · pages 수는 그대로(새 색 쌍 없음).
- `.field.sm textarea` · `.field.lg textarea` — 글자 · 행간 · 자간 · 반경은 같은 크기 한 줄 입력과 같다(sm 12/16 · 반경 4, lg 16/26). 최소 높이 72 · 96 · 120, 안쪽 여백 8/12 · 10/14 · 12/16.
- Text Field 'Textarea' 예제를 세 크기로(사이트 · React `TextArea size`), Spec Size 행에 Textarea 최소 높이를 더했다. React 는 이미 `size` 를 필드 클래스로 넘겨 코드 변경이 없다.
- **사람이 정하지 않은 기본값:** 최소 높이 72 · 120(기본 96 에서 세 줄 반이 보이는 높이), 안쪽 여백, 예제의 placeholder 문구('Small · 최소 72px' 등).
- behave +2 — 세 크기의 최소 높이 · 여백, 같은 크기 입력과 글자 · 행간 · 자간 · 반경이 같음. 음성 시험 2건(sm · lg 규칙 지움 — 그 덩어리만 도는 임시 실행기에서 CSSOM 으로 지움) 모두 두 단정이 실패로 잡았다.
- Figma 는 같은 날 Text Field 세트에 Textarea Small · Large 를 그렸다(Figma 절 '묶음 4' 끝). 다시 잰 전체 probe 로 audit 1건(Home 히어로 부채꼴).

2026-11-18 사이드 내비 안쪽 여백 20(사람의 요청 · 결정 하나) — behave 1538 → 1540(`behave.shell.js` 33 → 35). contrast · advisory · verify · react · pages 수는 그대로(색 변화 없음).
- `.sidenav{padding}` 0.75 → **1.25rem**. 접힌 레일은 위아래만 1.25rem · 좌우 0.625rem 그대로(사람의 결정 '위아래만 20' — 접고 펼쳐도 항목이 위아래로 튀지 않고, 아이콘 칸 43(64 − 20 − 오른쪽 선 1)을 지킨다). 폭 240 · 64 는 그대로라 항목 폭이 215 → 199 가 된다.
- 한 곳의 CSS 라 Navigation · Top Navigation 예제, React `SideNav`, 템플릿 샘플 여섯(`../assets/style.css` 를 씀 — 브라우저에서 펼친 · 접힌 상태 모두 첫 항목 위 끝 1.25rem 을 쟀다)이 함께 바뀐다. 패턴 예제에는 사이드 내비가 없다. Navigation Spec Size 에 안쪽 여백을 적었다.
- behave +2 — 모든 예제 사이드 내비의 여백(펼침 사방 · 접힘 위아래 1.25rem · 좌우 0.625rem), 상단 바 버튼으로 접어도 첫 항목 위 끝이 같고 레일 항목이 43. 음성 시험 2건(`.sidenav.collapsed` 규칙 지움 · `.sidenav` 규칙 지움 — 임시 실행기에서 CSSOM 으로) 모두 두 단정이 실패로 잡았다.
- **기존 단정 고침 1:** 펼친 레일 항목 폭 214 를 박아 둔 단정(behave.nav)을 '내비 안쪽 폭과 같음' 으로 — 첫 게이트에서 198 로 걸렸다.
- Figma — Navigation 세트(332:2878)의 Expanded 변형 여백 사방 20 · Collapsed 위아래 20(인스턴스는 Navigation 카드의 둘뿐이고 따라옴), Spec Size 문구를 저장소대로(두 줄이 되어 Navigation 섹션을 22 늘리고 아래 섹션을 내려 간격 200). 다시 잰 전체 probe(`dump-b6`)로 audit 1건(Home 잘림)이고, 기준 덤프를 이것으로 바꿨다. 이번에도 조각 6 · 7 경계의 공백 하나가 잘려 되살린 뒤 길이 · 해시가 같았다.

2026-11-18 Templates 메뉴 — 템플릿 샘플 일곱을 사이트 페이지로(사람의 요청 · 결정 여섯) — pages 88 → 96 · behave 1540 → 1549(`behave.templates.js` 9). contrast · advisory · react · tsc 수는 그대로(새 색 쌍 없음).
- **Patterns 다음에 Templates 메뉴**(`SITE.templates` — 헤더 · 드로어 · 사이드바 · 검색이 데이터에서 따라온다). 개요 + 화면별 문서 페이지 일곱(로그인 · 대시보드 · 리스트 · 정책 설정 · 위저드 · 탭이 있는 리스트 · 조직도)이 route 여덟이라 pages +8.
- **개요는 Foundations 개요처럼**(사람의 결정) — 머리글 · 리드 · 토큰으로 그린 화면 조각 다섯(로그인 카드 · KPI · 표 행 · 폼 · 트리) · `h2 Screens` 의 `.base-list` 행 일곱(이름 · 한 줄 설명). 썸네일 카드는 두지 않는다.
- **문서 페이지 = 정의 → 고르기 표(언제 쓰는가 · 비슷한 템플릿) → Preview → Composition(쓴 컴포넌트 · 패턴 링크) → Rules.** React 탭은 없다(예제가 아님). 코드 보기는 같은 날 뒤 항목에서 더했다.
  미리보기는 **실제 화면 iframe 을 줄여 넣는다**(사람의 결정) — iframe 은 width · height 속성 1440 × 900(루트 글자 단계와 무관하게 화면이 1440 폭으로 그려지게 rem 이 아니라 속성), app.js 의 ResizeObserver 가 틀 폭 ÷ 1440 을 `--tpl-s` 로 넣고 틀 높이를 900 × 비율 + 테두리로 맞춘다(`.scaled`). 스크립트가 없으면 틀 안에서 스크롤한다. 틀 위 '새 창에서 열기'(Link 규칙 — rel · 아이콘 · 숨긴 '(새 창)').
- **문서 페이지에서 바꾼 제품 색 · 테마를 iframe 화면이 따라간다** — app.js 에 `storage` 이벤트 처리기(`jsds-accent` · `jsds-theme`). 바꾼 문서에는 오지 않고 같은 값이면 나지 않아 되울리지 않는다. 화면을 새 창으로 열어 둔 채 바꿔도 같다.
- **생성기를 `_build` 로 합치고 `_templates/` 를 지웠다**(사람의 결정 — 추적되지 않던 폴더라 지우기 전 사본을 scratchpad 에 둠). 옮긴 생성기의 출력은 옛 출력과 검토 도구 막대 · 경로 · 제목 · `data-root` 말고는 같다(diff 로 확인). **검토 도구 막대(색 견본 · 화면 고르기)는 빼고 흉내 동작은 둔다**(사람의 결정) — 로그인 → 2단계 → 대시보드, 대화상자 제출 → 닫고 Toast, 조직도 고르기, 배포 완료 Toast, 1280 미만 내비 접기. 고르는 `index.html` 은 개요가 대신한다. CLAUDE.md 의 '확정된 화면만 옮긴다'(같은 날)는 이 요청이 일곱 모두로 바꿨다.
- **verify 더함:** templates.data.js 키 = SITE.templates 순서, 고르기 표 키 · 순서, Rules 1 ~ 8행, 개요 한 줄, uses · patterns 가 있는 키, 절 순서 preview → composition → rules, 고르기 표가 lead 바로 뒤, iframe 의 src = 그 화면 · title · width 1440 · height 900, 새 창 링크의 rel · 숨긴 문구 · 대상, 화면의 `<title>` · 검토 도구 없음 · 화면끼리 링크 대상 · 인라인 style(막대 비율만), **uses = 화면 HTML 이 실제로 쓰는 컴포넌트**(패턴의 USES_MARK + 상단 바 · 사이드 내비 · Tooltip · Divider, 알림 센터 패널 안의 탭 · 심각도 Tag 는 빼고 잼). 본문 문구 검사에 템플릿 글과 문서 페이지 lead 를 더했다.
- **behave.templates 9** — 헤더 여섯 한 줄 · Templates 현재, 개요 행 일곱 · 그림 다섯, 일곱 문서 페이지 × 1440 · 1024 · 768 에서 iframe 이 1440 × 900 으로 그 화면을 그리고 틀 폭에 맞게 줄어듦 · 높이 = 900 × 비율 · 문서 넘침 없음, 새 창 링크가 새 탭으로 그 화면, 화면 일곱을 직접 1440 에서 오류 · 넘침 · 검토 도구 없음, 로그인 → 2단계(첫 칸 포커스) → 대시보드, 1280 미만 접힘, 조직도 고르기 · 대화상자 제출 Toast · 배포 완료 Toast, 색 · 테마 따라가기(되돌림까지). **기존 단정 고침 2:** 드로어 섹션 5 → 6 · 가로 넘침 폴더에 `templates`(화면 폴더 `templates/screen` 은 최소 폭 1024 의 콘솔이라 빼고 1440 만 잼).
- **측정에서 드러나 고친 것:** 처음 `uses` 는 짐작으로 적어 verify 가 13건을 잡았다(정책 설정에 Slider · Select · Notice · Tag 가 있고 체크박스 · 라디오 · 칩은 없음, 대시보드에 Select Button 이 있고 Tag 는 없음 등) — 화면대로 고치고 가나다순으로. 정책 설정 Rules '적용 대상' 의 '칩으로 돌아옴' 은 화면의 태그 묶음과 달라 고쳤다. 틀 높이가 테두리 2px 만큼 모자라 iframe 아래가 잘렸다. 런타임 변수 `--tpl-s` 를 `LOCAL_VARS` 에. 첫 전체 게이트에서 화면을 직접 여는 덩어리 셋이 던졌다 — behave.js 의 page 는 기본 컨텍스트라 탭을 더할 수 없어, 새 컨텍스트에서 연다.
- 음성 시험 넷(축소 끔 · storage 처리기 지움 → behave 각 1, iframe src 틀림 · 화면에 `.tpl-review` 되살림 → verify 각 1) 모두 잡혔다. 1440 라이트 · 다크 · 390 캡처로 개요 · 문서 페이지를 보았다.
- **사람이 정하지 않은 기본값:** 개요 그림(조각 다섯의 모양), 문서 페이지 순서와 절 이름(Preview · Composition), 축소 기준 1440 × 900, 문서 글 전부(정의 · 고르기 표 · 개요 한 줄 · Rules), 섹션 폴더 `templates/index.html` 은 다른 섹션처럼 첫 화면(로그인)으로 이동.
- **하지 않은 것:** Figma Templates 페이지, React 패키지 템플릿, 메인 배너 넷(사람의 결정 — 셋 그대로). 문서 페이지는 390 에서도 넘치지 않지만 iframe 안 화면은 1440 을 줄인 것이라 좁은 화면에서는 글자를 읽기 어렵다 — 새 창으로 본다.
- Figma 미반영 1건(그대로 — Home 잘림. Templates 는 audit 대조 밖).

2026-11-19 Templates 코드 보기(사람의 요청 '코드값도 볼 수 있도록', 앞 항목의 사람이 정하지 않은 기본값은 모두 그대로 — 사람의 결정) — behave 1549 → 1550(`behave.templates.js` 9 → 10). contrast · advisory · verify · react · pages 수는 그대로.
- 문서 페이지 미리보기 틀을 예제와 같은 `section.example.tpl-code` 로 감싸고 아래에 막대(HTML · CSS 탭 · 복사 · 코드 보기)를 둔다. HTML 은 화면 파일 전체, CSS 는 앱 틀 배치 `assets/templates.css`(컴포넌트 모양은 사이트 스타일시트). React 탭은 없다. 긴 코드는 칸 안에서 스크롤(최대 37.5rem).
- **같은 글자를 한 곳에서** — `templates.build.js` 가 `screens()`(화면 HTML 문자열) · `build(OUT, html)`(파일 쓰기)로 나뉘었다. `build.js` 가 렌더 전에 `screens()` 를 `window.TEMPLATE_HTML` · `TEMPLATE_CSS` 로 넣고, 같은 문자열로 화면 파일을 쓴다. 넣지 않은 단독 셸에서는 미리보기만 그린다.
- 예제의 탭 처리기가 복사 대상을 `-(html|react)` 만 바꿔, CSS 탭에서 HTML 로 돌아오면 복사 대상이 `-css` 에 남았다 — `css` 를 더했다(app.src.js).
- **verify 더함:** 코드 틀 구조, 보이는 HTML = 화면 파일, CSS = `assets/templates.css`, 복사 버튼이 HTML 칸부터. 클래스가 `example tpl-code` 라 예제 검사(`<section class="example"` 로 쪼갬 — html/react pane 요구)에는 걸리지 않는다.
- **behave +1** — 일곱 페이지에서 접힘으로 시작 · 열면 HTML 칸과 복사 글자 = 화면 파일 · CSS 탭 = templates.css · 다시 HTML 이면 복사 대상도 돌아옴 · 코드 칸 최대 37.5rem 에서 스크롤 · 넘침 없음.
- 음성 시험 셋 모두 잡혔다 — 탭 처리기의 `css` 지움(behave — 처음엔 HTML → CSS 만 재서 통과해, 다시 HTML 로 돌아오는 단정을 더해 잡음) · 코드 칸 최대 높이 지움(behave) · 생성 페이지의 코드 글자 한 자 바꿈(verify — 처음엔 강조 span 태그 안에 넣어 글자가 그대로라 통과, 코드 첫 글자 앞에 넣어 잡음). 1440 라이트 · 다크 · 390 캡처로 보았다.
- 문서 페이지가 화면 HTML 을 실어 커졌다(리스트 259KB · 대시보드 152KB).
- Figma 미반영 1건(그대로 — Home 잘림).

2026-11-19 사용법 문서 최종 정리 · Resources 문구 하나(사람의 요청 · 결정 넷) — 게이트 수는 그대로.
- **Resources › React Package 의 ds.js 표 Form 행**에서 '3개 이상 요약' 을 지웠다. 폼 위 요약은 2026-11-16 에 없앴다. 이제 '제출 시 첫 오류로 이동(폼 위 요약 없음 — 오류는 필드 아래에), 고치면 바로 지움' 이다.
- Claude Docs 의 사용법 문서를 사이트 기준으로 고쳤다(저장소 밖). 고친 것: 메뉴 여섯 · Templates 일곱, 제품 색 일곱(역할 이름), Figma 동기화 뒤의 상태, `.ds-root`, 차트 · dayjs 파일.
- **React 설치를 다시 확인했다.** 이 저장소를 clone 해 `npm pack` 하고, 새 Vite React 18 앱에 설치해 Button · TextField 를 그렸다. 제품 색(남색 면 · 흰 글자), 높이 40, Pretendard 를 확인했다.
  - **`.ds-root` 를 빼면 글꼴이 브라우저 기본(Times)이 된다** — 패키지 CSS 는 글꼴 · 본문 색 · 배경을 `.ds-root` 아래에만 준다. README 에는 있었는데 사용법 문서에 빠져 있었다.
  - TypeScript 7 에서 `import "@jiran/ds-react/style.css"` 가 TS2882 로 막혔다. `src/vite-env.d.ts`(`/// <reference types="vite/client" />`, Vite 템플릿 기본 파일)를 두면 통과한다.
- **고치지 않은 것:** 같은 표의 'ToastProvider … 최대 3개' 는 오류 Toast 가 3개를 넘을 수 있어(11-10 결정) 낡았을 수 있다 — 요청 밖이라 그대로 두었다.

2026-11-19 React 개발자 테스트용 전달본 · 패키지 README(사람의 요청) — react 885+6 · tsc 0, 다른 게이트 수는 그대로(사이트 밖 파일만).
- `_react/README.md` 의 낡은 문구: 머리말 '0.8.0 은 깨지는 변경' → 0.6.x → 0.9.0 기준, 차트 프리셋 넷 → 여섯 · 한 톤 기본, '사이트 일치 118' 숫자 지움. `.ds-root` 를 빼면 기본 서체 · `scale.css` · TS 7 의 CSS import(TS2882) · .tgz 설치를 더했다.
- 패키지 `files` 에 `MIGRATION.md` — README 의 링크가 패키지 안에서 깨져 있었다(파일 143개).
- 전달본은 `_handoff/ds-react-0.9.0/`(.tgz · Vite 예제 앱 · 안내 README · MIGRATION)과 같은 이름의 zip 이다. 글(안내 · 예제 앱 · MIGRATION 사본)만 커밋하고 .tgz · zip 은 `.gitignore`(사람의 결정 — 바이너리는 `_react` 에서 `npm pack` 으로 다시 만듦). 새 폴더에서 설치 · 빌드, 브라우저에서 제품 색 · 다크 · Popup · Toast 를 확인했다.

2026-11-19 UI Dictionary — Resources 안 UI 이름 사전(사람의 요청 · 결정 셋: Resources 안 · 예제 단위 · 다른 이름 · 비슷한 것 · React 이름 · 복사) — pages 96 → 97 · behave 1550 → 1561(`behave.uidict.js` 11). contrast · advisory · react · tsc 수는 그대로(새 색 쌍 없음 · 패키지는 바꾸지 않음).
- **참고 파일**(디자인팀의 단독 HTML 'UI 이름 사전' — 요소 81 · 분류 9)의 분류 · 이름 · 영문 · 생김새 검색어를 시작점으로 옮겼다. 그 파일은 예제를 손으로 복사해 넣어 없어진 '오류 요약' 과 옛 CSS 값이 남아 있었고, 패턴은 10개뿐 · 템플릿은 없었다. 파일은 저장소에 넣지 않았다.
- **원본** `_build/uidict.data.js` — 분류 10(참고 파일의 9 + '화면 전체') · 항목 101(컴포넌트 46 · 패턴 22 · 템플릿 7 이 모두 한 장 이상) · 추천 검색어 4. 미리보기 · HTML · React 코드 · 비슷한 것(고르기 표의 '비슷한 것 · 비슷한 패턴 · 비슷한 템플릿' 행) · 문서 링크는 예제 데이터에서 만든다 — 사이트가 바뀌면 사전도 따라온다.
- **페이지** — 검색(`.searchbar.lg` · 300ms · `/` 단축키 · Esc · placeholder '이름이 안 떠오르면 생김새로 찾아보세요') · 추천 검색어(텍스트 버튼) · 분류 탭(이름만) · 카드 격자 · 빈 상태. 같은 날 사람의 요청으로 '10개 분류 · 101개 이름' 줄과 탭의 건수 Count 를 지우고 추천 검색어를 outline 에서 텍스트 버튼으로 바꿨다(1440 에서 탭 줄이 넘쳐 '화면 전체' 는 Tab 규칙대로 가로 스크롤). 카드를 누르면 비모달 Side Panel 에 큰 미리보기 · 영문 · 다른 이름 · 클래스(inline Copy Field) · React 이름 · 비슷한 것 · 쓰는 컴포넌트 · HTML / React 복사 · 문서 링크. 검색은 띄어쓰기를 무시하고 이름 · 다른 이름 · 클래스 · React 이름이 생김새 말보다 앞선다. 주소의 `?q=` · `?cat=` 를 기억한다.
- **미리보기** — 예제 HTML 을 `inert` 틀에 넣어 칸에 맞게 줄인다(ResizeObserver · 글꼴 준비 뒤 다시 잼). 템플릿은 `loading="lazy"` iframe 을 줄인다. 미리보기의 id · for · aria 참조 · `#` 링크에 카드마다 접두어를 붙이고 `data-hotkey` · `autofocus` 를 걷는다(`lib.js udPrefix` — 상세의 큰 미리보기도 같은 함수를 app.js 에서). 미리보기는 `.example-preview` 를 달아 사이트 셸의 문서 규칙(ul · h2 · h3)에서 빠진다.
- **다른 이름은 초안을 사람이 보고 고쳤다(사람의 결정)** — '뱃지' 는 카운트 배지에만(태그에서 뺌), 시스템 안의 다른 뜻과 겹치는 넷을 뺐다(표의 '그리드' — Foundations Grid, 입력 칩의 '토큰' — 디자인 토큰, 카드의 '패널' — 사이드 패널, 구분선의 'HR'). 분류 '화면 전체' 와 추천 검색어 넷은 그대로(사람의 결정). 나머지 다른 이름 · 리드 문장 · 카드 미리보기 크기(컴포넌트 최대 520 · 패턴 1160 폭을 줄임)는 사람이 정하지 않은 초안이다.
- **verify 더함:** src 가 있는 예제 · 템플릿, 대표 클래스가 그 카드 미리보기에 있음, React 이름이 그 페이지 exports(패턴은 전체 exports)에, 분류 · 범위(컴포넌트 · 패턴 · 템플릿 각 한 장 이상 · 쓰지 않는 분류 없음), 분류 탭 = cats 순서 · 탭 안은 이름만, 다른 이름이 한 항목 안에서 겹치지 않고 다른 항목의 공식 이름이 아님, 이름이 하나씩, 카드 수 = 데이터, 페이지 안 id 겹침 없음(코드 글자는 뺌), 리드 문구 규칙. 음성 시험 7건(없는 예제 · 없는 클래스 · 없는 React · 없는 분류 · aka 중복 · aka = 다른 이름 · 페이지 겹친 id)과 항목 빠짐이 모두 잡혔다.
- **behave.uidict 11** — 카드 수 · 수 글자 없음 · 탭은 이름만 · 추천 검색어는 텍스트 버튼 · placeholder, 탭(누르기 · 방향키 · End · URL), 검색(모달 → 팝업 · 점세개 → 드롭다운 메뉴 · 빈 결과 · Esc · 추천 검색어), `/`, 패널(오른쪽 · 제목 · 포커스 · 큰 미리보기 · 겹친 id 없음) · Esc 로 닫고 카드로 복귀, 복사 셋(HTML = 카드 코드 · React = 예제 파일 · 클래스), 모든 분류의 미리보기가 inert · 칸 안(1440 · 1024 · 768 · 390) · 넘침 없음, 다크 · 제품 색, `?q=` · `?cat=` 복원. 음성 시험 9건(분류 거르기 · 모달 aka 지움 · hotkey 지움 · 상세 복귀 끔 · fit 끔 · q 복원 끔 · 카드 면 고정색 · 복사 대상 틀림)과 화면 수정 뒤 셋(탭 숫자 되살림 · 추천 버튼 outline · placeholder 옛 글) 모두 잡혔다.
- **측정에서 드러나 고친 것:** app.js 가 ds.js 보다 먼저 실려 주소의 분류 복원이 탭 처리기보다 앞서 아무 일도 하지 않았다(DOMContentLoaded 뒤로). 템플릿 iframe 을 감싼 틀을 줄이면 빈 화면이 됐다(Templates 문서처럼 iframe 자체를 줄임). 숨은 상세 안에서 차트를 붙여 폭 0 이었다(패널을 연 뒤 그림). 예제 안 탭 · 검색이 사전의 탭 선택자에 걸렸다(단정을 `.ud-tabbar > .tabs` 로).
- **보인 것(고치지 않음):** 패턴 · 화면 카드의 미리보기는 0.12 ~ 0.3 배라 글자를 읽을 수 없다 — 생김새를 알아보는 썸네일이고, 패널의 큰 미리보기 · 문서 링크로 본다.
- Figma 미반영 1건(그대로 — Home 잘림. 사전은 사이트 문서 페이지라 audit 대조 밖).

2026-11-19 좁은 화면의 사이드 내비 접힘 — 시스템 동작으로(사람의 요청 '관리자 콘솔 md 해상도에서 접힘이 안 됨', 결정 둘) — behave 1561 → 1565(`behave.shell.js` 35 → 39) · react 885+6 → 890+6(`tests/sidenav-collapse.test.tsx` 5). contrast · advisory · verify · pages 수는 그대로(색 변화 없음).
- **잰 원인:** 템플릿 화면을 1440 으로 연 뒤 창을 1024 로 줄여도 사이드 내비가 펼친 채였다(w 240). 접기는 `templates.src.js` 의 흉내 코드가 처음 읽을 때 한 번만 했고, ds.js · React 에는 이 동작이 없었다 — Navigation 예제 설명의 '1280px 미만이면 접힘' 은 약속만 있었다.
- **시스템이 맡는다**(사람의 결정 — 흉내 코드는 지움). ds.js 가 `matchMedia("(max-width:1279.98px)")` 로 `[data-sidenav-toggle]` 이 가리키는 내비를 처음 그릴 때 좁으면 접고, 경계를 넘을 때마다 접거나 편다(`navSet` — 바뀔 때만 `ds:sidenav {collapsed, trigger}` · trigger 는 button · width).
- **다시 넓히면 펼친다 · 그 사이 사용자가 바꾼 상태는 다음 경계까지 둔다**(사람의 결정). 처음 접기는 내비마다 한 번(`_dsAuto`)이라 다시 init 해도 편 상태를 되돌리지 않는다.
- **사람이 정하지 않은 기본값:** 접기 버튼이 없는 내비(Navigation 의 정적 Expanded · Collapsed 시연)는 건드리지 않는다 — 버튼 없이 접히면 펼 길이 없다. 내비에 `data-auto-collapse="false"` 를 달면 폭으로 접지 않는다(verify 가 값을 "false" 하나로 막음).
- **React** — 새 훅 `useSideNavCollapse({ auto?, defaultCollapsed? }) → [collapsed, setCollapsed]`(같은 경계 · `SIDENAV_NARROW_QUERY`), Top Navigation 'search' 예제가 쓴다. `useState` 로 들고 있던 제품은 그대로 동작하지만 폭으로 접히지 않는다(MIGRATION · README).
- 문서: Navigation Rules '좁은 화면' 행(6 → 7행) · Collapsed 예제 설명 · Props `.collapsed` 와 `[data-auto-collapse="false"]`, Top Navigation 접기 버튼 Props, Resources › React Package ds.js 표와 이벤트 표의 `ds:sidenav`.
- behave +4(part 17): 템플릿 대시보드 1440 펼침 → 1024 접힘(4rem · '메뉴 펼치기' · trigger width) → 버튼으로 펴면 1100 에서도 그대로 → 1440 펼침 → 접으면 1600 에서도 그대로 → 1024 접힘(이벤트 없음), 1279 · 1024 · 768 로 열면 접힘 · 1280 은 펼침, 문서 1024 에서 접기 버튼이 가리키는 내비만 접힘, `data-auto-collapse="false"` 는 그대로.
- 음성 시험: ds.js 4건(change 리스너 · 처음 접기 · 대상 거르기 · opt-out) · React 2건(경계 무시 · auto:false 무시) · verify 1건(값 "no") 모두 잡혔다. 첫 실행의 실패 2건은 단정 쪽 실수였다(같은 단계 이름 'click' 이 덮임 · Navigation 내비 수를 3 으로 가정).
- **하지 않은 것:** 접은 상태의 저장(제품 몫 그대로). Templates 문서 페이지의 iframe 은 늘 1440 폭이라 접히지 않는다(의도). Figma 는 동작이라 대조 밖 — Figma 미반영 1건(그대로 — Home 잘림).

2026-11-19 Components Overview 카드 썸네일 = Figma 썸네일(사람의 요청 '피그마에 만든 컴포넌트 오버뷰 썸네일을 사이트에') — 게이트 수는 그대로(verify 검사 한 묶음을 더함 · 실패 0).
- **원본** `_build/thumbs/components/<페이지 키>.svg` 46개 — Figma Overview › `_Local components` › Thumbnails 의 `Thumbnail / <이름>` 을 `download_assets`(svg)로 내보내 썸네일 그룹만 남겼다(옆 섹션 테두리 · 회색 면 사각 · 레이어 id 를 걷음, 색은 Figma 값 그대로 — 손으로 고치지 않음). 글자는 윤곽선이다.
- **색은 빌드가 토큰으로** — `_build/thumbs.js` 의 표(Figma 색 · 불투명도 열 가지 → `--surface-elevated-primary` · `--foreground-neutral-strong · secondary · tertiary · quaternary` · `--line-neutral-secondary` · `--surface-neutral-secondary` · `--foreground-negative-strong` · `--foreground-brand-primary`). 칠은 `style="fill:var(…)"` 로 바꿔 다크 테마에서 면과 글자가 함께 뒤집히고(잰 값: 면 흰 → cool-17) Link 썸네일은 제품 색을 따른다(빨강 제품 brand-40). 표에 없는 색이 나오면 빌드가 멈춘다. 마스크 id(Navigation · Page Header · Side Panel)는 키를 붙여 겹치지 않게.
- `build.js` 가 `window.COMPONENT_THUMBS` 로 넣고 `render.js thumbOf` 가 컴포넌트 카드에 쓴다(`.thumb.figma` — 여백 0, SVG 가 칸을 채움 · 265 × 199 at 1440). 빌드가 넣지 않은 단독 셸은 기본 그림. 쓰이지 않게 된 컴포넌트 데이터의 `thumb` 46줄(라이브 HTML 미니 썸네일)을 지웠다 — 패턴 개요는 그대로 `thumb` 를 쓴다.
- **verify 더함:** 컴포넌트 페이지 ↔ 원본 SVG 가 하나씩 짝, 개요 카드 수 = 컴포넌트 수 · 카드마다 Figma SVG, 칠이 전부 토큰, 마스크 id 겹침 없음. 첫 빌드에서 `radio.svg`(페이지 키는 `radio-button`)를 이 검사가 잡았다. 음성 시험: 변환기에 새 색 · 새 불투명도를 넣으면 빌드가 멈춤(둘 다 잡힘).
- 잰 것: 1440 라이트 · 다크 · 빨강 제품 · 390 에서 카드 46 · 빈 썸네일 0 · 가로 넘침 0 · 콘솔 오류 0, 캡처로 다크에서 버튼 · 아바타 · 달력의 진한 면과 흰 글자가 함께 뒤집혀 읽히는 것을 보았다.
- **알고 둔 것:** Figma 의 raw 색 일부는 토큰과 몇 단계 다르다(#292A2D 88% → cool-22 88% · #E72727 → red-40 #E52222 · Link #0066FF(blue-50) → brand-40 · Accordion 구분선 #37383C 12% → line-neutral-secondary). 패턴 · Foundations 개요 썸네일은 Figma 에 없어 그대로다. 개요 페이지가 SVG 를 실어 188KB 가 됐다.

2026-11-20 Home › Guide — 단계별 사용 매뉴얼(사람의 요청 · 결정 넷) — pages 97 → 103 · behave 1565 → 1580(`behave.guide.js` 15). contrast · advisory · react · tsc 수는 그대로(새 색 쌍 없음 · 패키지는 바꾸지 않음).
- **형태 = 공통 트랙 + 역할 트랙 + 함께 만드는 실습**(사람의 결정). Home 아래 새 묶음 **Guide** 여섯 페이지(개요 · 공통 5 · 디자이너 5 · 기획자 6 · 개발자 6 · 함께 만들기 6단계)이고 헤더 메뉴 여섯은 그대로다(사람의 결정). 개발자 트랙 안에서 React / HTML 을 탭으로 고른다(사람의 결정 — 역할은 디자이너 · 기획자 · 개발자 셋).
- **넘기기 = 이 시스템의 Steps 마법사 + 진행 저장**(사람의 결정). 트랙 페이지는 `.stepper.guide-stepper[data-nonlinear]` · `label-below` 이고 한 단계 패널 = 단계 번호와 역할 · 제목 · 무엇 · 왜 · (코드) · 해보기(Notice) · 관련 문서. 마지막 단계의 완료는 다음 트랙을 권하는 안내(role=status)를 보인다. 함께 만들기는 단계마다 이끄는 역할을 Tag 로 보인다.
- **진행 저장** `app.src.js` — 키 `jsds-guide`(`{트랙: [완료 단계], "트랙@": 마지막 단계}`), 모든 접근은 try/catch. `ds:step` · `ds:step-finish` 에서 저장하고, 읽을 때 단계의 `.done` · `.on` 을 ds.js 보다 먼저 되돌려 두어 마지막 단계가 그대로 보인다. 개요의 트랙 행에 'n / N 완료', 트랙마다 '처음부터 다시' · 개요의 '진행 모두 지우기'. 저장이 막힌 브라우저는 진행 표시 없이 그대로 동작한다.
- **Getting started 는 설치 · 연결만** — 탭 '디자이너 · 기획자' → '디자이너'(기획자는 설치할 것이 없다), 리드에 Guide 링크. 개발자 단계의 코드는 Getting started 의 설치 · 제품 색 상수를 다시 쓴다(`GS_ACCENT_CSS` 에 남색 · 다크 면 단계 주석을 더함).
- **verify 더함:** guide.data 순서 = SITE.home Guide 묶음 · tracks 키 순서, 트랙마다 3~6단계, 단계마다 제목 · 무엇 · 왜 · 해보기 · 관련 문서, 링크 대상이 있는 route, code 단계의 React · HTML 코드 블록, 함께 만들기 단계의 lead 역할(다른 트랙에는 없음), 생성 페이지의 단계 수 = 패널 수 = 데이터 · 진행 표시 · 완료 안내, 개요 행의 진행 표시 수. 본문 문구 검사에 Guide 글(소개 · 한 줄 · 단계 넷)을 더했다.
- **behave.guide 15** — 사이드바 Guide 묶음 · 개요 행 다섯과 길 셋 · 트랙 구성(역할 Tag 는 함께 만들기만) · Getting started 탭과 링크, 첫 방문 · 다음 두 번(완료 · 패널 포커스 · 저장값) · 이전 · 단계 누름, 다시 읽어도 마지막 단계 · 개요 진행, 완료 안내와 다음 트랙 링크, 트랙 초기화 · 모두 지우기와 포커스, 저장 막힘(localStorage 가 던짐)에서도 오류 없이 넘김, 개발자 탭 전환 · 보이는 칸 복사, 여섯 페이지 × 1440 · 1024 · 768 · 390 × 라이트 · 다크의 모든 단계에서 넘침 없음 · 390 에서 길 카드가 한 칸.
- 음성 시험: verify 6건(해보기 지움 · 링크 대상 틀림 · 순서 바꿈 · 단계 7개 · 토큰 이름 · 괄호 둘) · app.js 4건(저장 끔 · 복원 끔 · 모두 지우기 포커스 · 트랙 초기화 포커스) 모두 잡혔다. CSS 1건(390 의 길 한 칸 규칙 지움)은 처음에 못 잡아 — 세 칸이 줄어들 뿐 넘치지 않는다 — 390 에서 길 카드의 왼쪽이 같은지 재는 단정을 더해 잡았다.
- **사람이 정하지 않은 것(초안):** 단계 글 전부와 해보기 과제, 함께 만들기의 예시 화면(로그 목록), 첫 트랙 말고의 메뉴 이름, 진행 저장 키 이름. 첫 트랙은 초안 '기본기' 를 같은 날 '공통' 으로 바꿨다(사람의 결정 — 역할 트랙과 짝, 예제 묶음 Default · Foundations 와 헷갈리지 않게).
- **하지 않은 것:** Figma 에 Guide 페이지, React 패키지 변경. **본 것(고치지 않음):** React `Form` JSDoc(`_react/src/patterns/Patterns.tsx`)이 아직 '오류 3개 이상이면 위에 요약' 이다(11-16 에 없앤 기능).
- **게이트에서 드러난 기존 결함(이번 변경과 무관):** behave.chart 의 '대시보드 390' 단정이 3회에 2회쯤 실패한다 — '일별 탐지' 선 차트 캔버스가 1440 에서 390 으로 줄여도 445 로 남는다(틀 274, 4초 뒤에도 그대로). HEAD 의 app.js 로 바꿔도 같은 비율로 실패해 이번 변경 전부터 있던 것이다. 이번 게이트는 그 하나로 1579/1580 이었다(나머지는 기준값과 같음). 같은 날 고쳤다(아래 항목).

2026-11-20 대시보드 차트가 좁혀도 줄지 않던 결함(사람의 요청) — behave 1580 → 1582(`behave.chart.js` 20 → 22). contrast · advisory · verify · react · pages 수는 그대로.
- **잰 원인:** Chart.js 는 애니메이션 도중에 들어온 크기 변경을 '다음 그리기' 로 미뤄 둔다. 그런데 애니메이션이 끝나는 마지막 틱(남은 항목을 치우기만 하는 틱)에는 그리기가 없어, 그 틈에 들어온 변경은 영영 적용되지 않았다.
  계측으로 확인했다 — 실패한 실행은 `resize(273.5) anim=true` 뒤에 그리기가 없고 미뤄 둔 값이 남은 채 애니메이션이 끝났다. 묶음을 여섯 개 동시에 돌려 부하를 걸면 6회에 1회 재현됐다.
- **경합이 자주 난 이유:** ds-chart 는 애니메이션을 200ms(줄인 모션이면 없음)로 정해 두지만, 그 옵션을 Chart 를 만든 *뒤* 칠할 때 넣었다. 그래서 첫 등장 애니메이션은 Chart.js 기본 1000ms 로 돌았고 **줄인 모션에서도 돌았다**(300ms 시점에 항목 16개가 움직이는 중). 테스트는 읽은 지 700ms 뒤에 창을 줄여 그 1초 안에 걸렸다.
- **고친 것(`ds-chart.src.js` — 사이트 · React 같은 파일):**
  - 애니메이션 `onComplete` 에서 미뤄 둔 크기 변경을 적용한다(`flushResize`). (2026-11-23 — 미뤄 둔 값을 내부 이름 `_resizeBeforeDraw` 로 읽던 것을 공개 API `resize()` 로 바꿨다. 아래 항목.)
  - 사용자가 `animation` 을 주지 않았으면 만들 때부터 어댑터의 값(200ms · 줄인 모션이면 false)을 넘긴다.
- **보이는 변화:** 차트 첫 등장 애니메이션이 1000ms → 200ms 로 짧아지고(어댑터가 원래 정한 값), 줄인 모션에서는 첫 등장 애니메이션이 없다.
- 부하를 건 18회 실행에서 모두 통과했다. 그중 3회는 바로 그 경합이 일어났고 새 콜백이 미뤄 둔 값을 적용했다.
- behave +2 — 대시보드의 세 차트 모두 끝날 때 미뤄 둔 변경을 적용함(경합은 시간에 달려 있어 콜백을 직접 부름), 첫 애니메이션이 300ms 미만(재면 230 ~ 252 — 항목마다 프레임만큼 더해짐)이고 줄인 모션이면 없음.
- 음성 시험 2건(onComplete 지움 · 첫 옵션 지움) 모두 실패로 잡혔다.

2026-11-20 문서 글의 최대 폭 제한 풀기(사람의 요청 '내부 문장들이 가로폭에 꽉 차게', 결정 둘) — 게이트 수는 그대로.
- 모든 페이지(109)를 1440 에서 재서, 글이 든 요소 중 max-width 때문에 부모보다 좁은 것을 찾았다. 본문 목록 `ul` · `ol`(70ch — 1440 에서 667 / 칸 840)과 Guide 단계 글 '무엇' · '왜'(70ch)였다. 두 제한을 지워 이제 본문 칸(최대 840)을 채운다.
- 목록의 70ch 를 되돌리려고 붙여 둔 `max-width:none` 다섯 곳(UI Dictionary 격자 · Guide 단계 · 관련 문서 · 길 카드 · 홈 배너)도 쓸모가 없어져 지웠다. 컴포넌트 CSS 의 `.notice ul` · `.steps` · `.list` 쪽은 패키지로도 나가므로 남겼다.
- **그대로 둔 것(사람의 결정):** 홈 첫 화면 가운데 설명 문장의 54rem, 컴포넌트 예제 안의 폭(폼 640 · Accordion 560 · Notice 600 등 약 40곳 — 컴포넌트를 그리는 폭이지 글 폭이 아님). 본문 칸 자체(`.page` 최대 968)도 레이아웃이라 그대로다.
- 다시 재면 본문에서 max-width 로 좁아진 글은 0이다(남은 것은 셸 · 칸 · 홈 히어로).

2026-11-20 디자인 검토 P1 넷(사람의 요청 'P1 넷 고치기' — design-superpowers `/design-review` 방법으로 사이트 전체를 본 보고서의 P1) — behave 1582 → 1594(`behave.p1.js` 12). contrast · advisory · verify · react · pages 수는 그대로.
- **헤더 검색** — 페이지 제목 · 묶음만 찾아 토스트 · Toast · 모달 · Modal · 스피너 · Spinner · 배너 · 날짜 가 모두 0건이었다.
  - `build.js` 가 `SEARCH_INDEX` 항목마다 `k`(다른 이름)를 싣는다. UI Dictionary 의 이름 · 영문 · 다른 이름 · 대표 클래스 · React 이름과 컴포넌트 데이터의 React 이름이다. 생김새 검색어(`kw`)는 넓어서 넣지 않았다(사람이 정하지 않은 기본값).
  - 순서는 제목 앞 일치 → 제목 안 → 묶음 → 다른 이름이 그대로 맞음 → 일부만 맞음이다. 다른 이름으로 찾은 결과는 작은 글자에 그 이름을 보인다. 결과는 20개까지다.
  - UI Dictionary 팝업 항목의 다른 이름에 'Modal' · 'Dialog' 를 더했다(사람이 정하지 않은 기본값 — 영문 'Modal' 이 어디에도 없었다).
  - 키보드: 검색칸은 `role=combobox` + 결과 `role=listbox`(`aria-activedescendant`). ↑↓ · Home · End 로 고르고 Enter 로 연다. 고른 것이 없으면 첫 결과로 간다(사람이 정하지 않은 기본값). 포커스는 칸에 남는다.
  - 결과 수는 숨긴 `role=status` 가 알린다('결과 N개'). 0건이면 목록과 status 에 '검색 결과가 없습니다' 를 보이고 UI Dictionary(`?q=`)로 잇는다. placeholder 를 영문에서 '컴포넌트 · 패턴 검색' 으로 바꿨다.
- **상단 메뉴 줄 포커스 링** — `.topnav` 의 `overflow-x:auto` 가 바깥 외곽선을 잘라 오른쪽 선만 남았다. `.topnav a:focus-visible{outline-offset:-2px}` 로 안쪽에 그린다(탭 줄과 같은 방식).
- **알림 센터 본문** — Tab 이 멈추는 `.notify-body` 에 `outline:none` 이 있어 포커스가 보이지 않았다. 지우고 안쪽 링(`outline-offset:-2px`)으로 그린다.
- **사이드바 · 목차 묶음 제목** — `.nav h5` · `.toc h6` 가 `opacity:.3` 이라 대비가 라이트 1.95 · 다크 2.62 였다. `--foreground-neutral-secondary` 로 바꿨다(사람이 정하지 않은 기본값 — 사이드바 항목과 같은 색이고 크기 · 굵기 11/600 으로 갈림).
- **behave.p1 12** — 다른 이름 · 영문 · React 이름 열 개가 결과를 냄, 다른 이름이 그대로 맞는 쪽이 앞, 제목 앞 일치가 첫째, combobox · listbox · 한국어 placeholder · 결과 수 알림, ↓↑ 로 고르고 포커스 유지, Enter 가 고른 것을, 고른 것이 없으면 첫 결과를 엶, 0건 안내와 UI Dictionary 링크, Esc 로 닫힘, 상단 메뉴 링이 안쪽 · 메뉴 줄 안, 알림 본문 링, 묶음 제목 1600 라이트 · 다크의 불투명 · secondary · 4.5 이상.
- 음성 시험 8건 중 7건이 잡혔다(다른 이름 끔 · 그대로 맞음 순위 끔 · 방향키 끔 · status 끔 · 메뉴 링 · 알림 outline:none · 제목 opacity). 못 잡은 1건(검색 팝을 닫을 때 aria-expanded · aria-activedescendant 를 지움)은 값을 비우는 input 이벤트가 이미 하는 쓸모없는 코드라 지웠다.
- 1440 라이트 · 다크 캡처로 검색 결과 · 0건 안내를 보았다.
- 보고서의 P2 · P3 는 이번에 고치지 않았다. Figma 미반영 1건(그대로 — Home 잘림. 문서 셸은 audit 대조 밖).

2026-11-20 디자인 검토 P2 · P3(사람의 요청 'P2, P3도 함께 고쳐줘' · 결정 일곱) — behave 1594 → 1630(`behave.p2.js` 36) · react 890+6 → 898+6(예제 323 → 331 에 따른 구조 비교 8). contrast · advisory · verify · pages 수는 그대로.
- **사람의 결정:** 간격 문서는 실제대로(#3) · 1440 의 오른쪽 목차는 그대로(#4 — 고치지 않음) · 날짜 표시 `YYYY. MM. DD`(#30) · 비활성 코드 탭 라벨을 secondary 로 올림(A8) · 아이콘 선 굵기 보정함(#16) · 오버레이 들어옴 · 나감 더함(#25) · Steps 마지막 단계는 옵션으로 처리 중 표시(#10). '사람의 결정과 다른 의견'(D1 ~ D11)은 고치지 않았다.
- **글 · 문서:**
  - 한국어 줄바꿈을 `body` 의 `word-break:keep-all` 하나로(#2). 컴포넌트마다 붙은 12곳은 패키지에도 나가므로 남겼다.
  - Grid 의 간격 설명을 실제대로 — 컴포넌트 안쪽은 6 · 10 · 14 같은 2px 단계도 쓴다(#3). Design Token › Motion 문장 · 쓰임 표(#5), Figma 페이지 이름(#12), 정책 설정 Rules '배포 버튼은 머리글'(#7), Templates 옛 경로 주석(#31), 가져오기 예시 IP(#28), Select Spec 메뉴 폭(#22).
  - 결과를 말하는 버튼 라벨(#8) — '인증하고 로그인' · '정책 만들기' · '설정 마치기' · 'CSV 내보내기' · '보고서 만들기'. React `Stepper labels.finish`.
  - Writing 에 날짜 형식(`2026. 09. 07 14:30` · 올해면 `09. 07 14:30`, ISO 금지)과 용어 표(실행 취소 · 되돌리기 · 필수 · 삭제)를 더했다(#29 · #30). '필수' Tag 는 accent 하나, 삭제 확인에 개수.
- **UX:**
  - 2단계 인증에 계정 줄(`.auth-account` — 이메일 + '다른 계정으로 로그인')(#9).
  - **Steps `data-async` · React `async`**(#10) — 완료를 누르면 버튼이 loading + `aria-busy`, 두 번째 누름은 이벤트를 내지 않는다. `ds:step-finish` 의 `resolve()` · `reject(문구)` 로 풀고 reject 는 Toast. 옵션이라 없으면 예전과 같다. Default · 템플릿 위저드가 쓴다.
  - 데이터 패턴 일곱에 State 예제(불러오는 중 Skeleton 행 · 빈 결과 · 오류와 다시 시도 — `pStates`, 사이트 · React)(#11). 로그 뷰어에 연결이 끊긴 Banner(warning · `role=alert` · '다시 연결').
  - 위험 작업 확인의 입력할 이름을 라벨에서 굵게, 앞뒤 공백은 비교하지 않음(`pattern="\s*…\s*"`, Popup 위험 확인도)(#27). 라벨 안 `b` 는 700 — UA 의 bolder 가 600 위에서 900 이 되어 굵기 넷 밖이었다(behave.type 이 잡음).
- **시각:**
  - 아이콘 선 보정(#16) — `ds:icons` 블록에 크기별 `stroke-width`(10 2.64 · 12 2.4 · 14 2.2 · 16 2.1 · 20 1.9 · 24 1.75 · 48 1.25, 18 은 2 그대로). 보이는 선이 10 ~ 24 에서 1.1 ~ 1.75px 이다. 명시도 0 이라 컴포넌트가 정한 선이 이긴다.
  - Pagination compact 반경 4(#14) · `.empty b` 600(#20) · 펼침 칸 있는 행 = 밀도 높이(#21) · 차트 머리 부제 기준선(#17) · 날짜 hover 원 = tertiary(#24) · 표 칸 `.tbl.nowrap` · Indicator 줄바꿈 없음(#13) · 대시보드 썸네일 KPI(#15) · 조직도 두 칸 같은 높이(#19).
  - 정책 설정 컨트롤 칸 폭 하나 17.5rem(#18). **767 이하에서는 컨트롤 칸이 설명 아래로** — 칸 폭 그대로 390 에서 26px 넘쳤다(전체 게이트의 넘침 검사가 잡음).
  - 쌓임 단계 토큰 `--z-menu` · `tooltip` · `float` · `dim` · `panel` · `popup` · `toast` · `tooltip-float` · `skip`(#23). 컴포넌트 안의 1 · 2 · 3 은 그대로 숫자.
- **모션:**
  - Switch 노브는 `transform`(#6 — 원본은 `icons-css.js` 가 써 넣는다), Skeleton 빛 띠는 `::after` 의 transform(#26). Accordion 높이 · 진행 막대 폭 · Colors 막대 · 홈 배너 너비 전환은 바꾸지 않았다(홈 배너 아이콘 벌어짐만 transform).
  - **오버레이 들어옴 · 나감**(#25) — Popup · 모달 Side Panel 배경 · 패널 · Toast 가 `--motion-base` 로 흐림에서 나타나며 8px 움직인다. 나갈 때는 ds.js · React `ghostOut` 이 같은 모양의 사본(`.ds-ghost`, aria-hidden · inert · id 없음)을 `--motion-fast` 로 흐리고 지운다. 진짜 오버레이는 바로 닫히므로 포커스 · 상태는 예전과 같다. 줄인 모션이면 사본을 만들지 않는다.
  - **사본은 클래스를 지닌다** — 닫은 직후 `.popup-backdrop` · `.side-panel-dim` 선택자가 사본에도 맞는다. 단정은 `[data-ds-popup]` · `:not(.ds-ghost *)` 로 고쳤다. 제품 코드도 열린 것을 찾을 때 같은 방식을 쓴다.
- **접근성:** A4 스크롤 조상 안 포커스 링을 안쪽으로, A5 Templates iframe `tabindex=-1`, A6 고른 면 위 보조 글 secondary, A7 위험 Notice 안 텍스트 버튼 중립 글자, A8 REF 수치를 실측으로, A9 progressbar · listbox 이름, A10 개요 카드 썸네일 aria-hidden · N 배지 숨긴 '새 항목', A11 문서 셸 `<main id="content">`, A12 헤더가 넘치면 ☰(`nav-tight`) · `dl.kv dd code` 줄바꿈 · Writing 배너 줄바꿈, A13 간격 막대 숫자 `--brand-label`, A14 예제 Page Header h2 · 템플릿 화면 h1 하나, A15 영문 블록 · locale 예제 `lang`.
- **behave.p2 36**(9 부분) — 셸 · 글자 200% · lang · 이름과 제목 단계 · 포커스와 대비 · 크기와 선 · 모션과 사본 · Steps 처리 중 · 위험 확인 이름과 날짜 형식 · 데이터 State 와 390.
- **기존 단정 고침 9:** 스켈레톤 애니메이션은 `::after` 에서(behave.js · behave.later 둘 — `getAnimations({subtree:true})`), 날짜 hover = tertiary(behave.dp), 패널 · 긴 팝업은 들어오는 움직임 뒤에 잼 · 사본을 빼고 찾음(behave.feedback 넷), 홈 배너 벌어짐을 원 사이 거리로(behave.home), 템플릿 위저드 Toast 는 처리 중 뒤(behave.templates), Guide 링크 이름에서 '새 항목' 을 뺌(behave.guide). React `code-input.test` 의 버튼 이름 '확인' → '인증하고 로그인'.
- 템플릿 위저드의 흉내 처리기가 detail 없이 낸 `ds:step-finish` 에서 던졌다 — `e.detail && e.detail.resolve`.
- 음성 시험: behave.p2 의 생성 파일 11곳을 하나씩 되돌려 모두 실패로 잡혔다. 아이콘 선 단정은 처음에 16px 규칙을 지워도 띠 안이라 통과해, 원래 값 2px 가 아닌지를 더 잰다.
- **고치지 않은 것과 이유:** #4(사람의 결정), #6 의 레이아웃 전환 넷(위), 차트 축의 짧은 날짜(Chart.js 눈금 — 날짜 형식 규칙은 화면 글자에), 로그인 화면의 h1 둘(숨긴 2단계 폼의 제목 — 둘 중 하나만 보임), Colors 제품 색 표는 틀 안에서 가로 스크롤.
- Figma 미반영 1 → 6건(Home 잘림 포함) — 이번 몫 넷(Select Spec Size · 위험 확인 Rules '이름 입력' · 달력 Day Hover 면 secondary · 패턴의 '필수' Tag 톤 High), 하나(Navigation Rules '좁은 화면')는 11-19 부터 있었는데 그때 세지 못했다.

2026-11-20 Patterns Overview 카드 썸네일 = Figma 썸네일(사람의 요청 '컴포넌트처럼 패턴 Overview 썸네일도 Figma 에서 SVG 로') — behave 1630 → 1631(behave.js part 47 에 1). contrast · advisory · verify · react · pages 수는 그대로(verify 검사를 넓힘 · 실패 0).
- **원본** `_build/thumbs/patterns/<페이지 키>.svg` 22개 — Figma Patterns › Overview › `Patterns Overview · 1440` › `ov-grid`(1343:6891) 의 카드 썸네일(260 × 200, 검색만 265). 썸네일 프레임을 페이지 맨 위로 복제해 `download_assets`(svg)로 내보냈다 — 카드 안에 있는 채로 내보내면 조상 프레임까지 그려졌다. 복제본 22개는 지웠다(남은 것 0).
  내보낸 파일에서 바깥 바탕 사각형 · 복제본 그룹 · 카드 바탕(#F7F7F8 — CSS 카드 면이 대신함) · 레이어 id 를 걷었다. 색은 Figma 값 그대로이고 글자는 윤곽선이다.
- **`thumbs.js` 를 두 섹션으로** — `load("components" | "patterns")`, 표에 넷을 더했다: `#2E2F33@0.88` → `--foreground-neutral-secondary`(값 그대로), `#2E2F33@0.12` → `--surface-neutral-secondary`, `#E72727@0.1` → `--surface-negative-primary`(위험 작업 확인 삭제 버튼 면), `white@0.12` → `--surface-elevated-primary` 에 불투명도 0.12(입력 폼 진한 주 버튼 위 — 버튼과 함께 뒤집힘, 표의 새 형식 "토큰/불투명도"). 표에 없는 색이면 빌드가 멈춘다(그대로).
  `build.js` 가 `window.PATTERN_THUMBS` 로 넣고 `render.js thumbOf` 가 패턴 카드에도 `.thumb.figma` 로 쓴다. 쓰이지 않게 된 패턴 데이터의 `thumb` 22줄(라이브 HTML 미니 썸네일)과 CSS `.ov-card .thumb .mini` 를 지웠다.
- **명도 마스크는 흰색 그대로** — 변환기가 `<mask>` 안을 바꾸지 않는다. **측정에서 드러난 기존 결함:** 컴포넌트 썸네일 셋(Navigation · Page Header · Side Panel)의 마스크 흰색이 `--surface-elevated-primary` 로 바뀌어, 다크에서 마스크가 rgb(33,34,37)이 되며 그림이 거의 사라졌다(11-19 부터 — 그때 다크 캡처는 버튼 · 아바타 · 달력만 봤다). 이제 다크에서도 보인다(캡처로 확인). 대시보드 패턴의 도넛 조각 넷도 마스크를 쓴다(id `thm-dashboard-1~4`).
- **verify** — 썸네일 검사를 두 섹션으로: 파일 ↔ 페이지 짝, 카드 수, 칠이 토큰(마스크 안은 빼고), 마스크 안 칠은 흰색, 썸네일 안 id 겹침 없음(마스크 id 만이 아니라 모든 id). 음성 시험 다섯(raw 색 · 마스크 칠 토큰 · id 겹침 · 파일 빠짐 · 표에 없는 색 → 빌드 멈춤) 모두 잡혔다.
- **behave part 47** — 옛 단정 'KPI 값이 썸네일 안에서도 primary' 는 썸네일에 KPI 가 없어져 tertiary 글자 부모를 만들어 잰다(같은 결함을 그대로 잡음). 새 단정: 두 Overview 의 카드마다 Figma SVG 하나 · 다크에서 면이 뒤집힘 · 마스크 안 칠이 다크에서도 흰색 · 패턴 22장. 처음엔 마스크 요소 자체(칠 없음 = none)까지 읽어 실패했다 — 마스크 안 path 만 읽게 고쳤다.
- 잰 것: 1440 라이트 · 다크 · 빨강 제품 · 390 에서 카드 22 · 빈 썸네일 0 · 가로 넘침 0 · 콘솔 오류 0. 썸네일은 제품 색을 쓰지 않아(Figma 에 brand 색이 없음) 빨강 제품에서도 같다.
- Figma 쪽은 임시 복제본을 만들고 지웠을 뿐 바꾼 것이 없다 — Figma 미반영은 앞 항목 그대로.

2026-11-20 차트 마크 · 툴팁 · 대시보드 둘로 — dataviz · design-elevation · page-patterns(사람의 요청 · 결정 아홉) — pages 103 → 105 · contrast 3892 → 3906 · behave 1631 → 1651(`behave.dataviz.js` 20) · react 898+6 → 903+6. advisory · verify 수는 그대로.
- **색은 바꾸지 않았다** — 고치기 전에 dataviz 검증기(2.1.326)로 지금 팔레트를 재니 통과했다(계열 6색 CVD 최악 ΔE 라이트 13.1 · 다크 8.2, mono 4단계 ordinal 통과). 고친 뒤에도 같은 값이다. 바꾼 것은 마크 모양 · 상호작용 · 페이지 패턴이다.
- **막대 = 값 쪽 끝만 4px 둥글고 바닥 각짐 · 최대 24 · 맞닿은 면 2px 바탕색 틈**(사람의 결정 — 11-05 의 '각지게' · 11-06 의 '틈 없이' 를 바꿈). ds-chart 상수 `BAR_MAX 24 · BAR_END 4 · BAR_GAP 2` · `borderSkipped "start"` · `inflateAmount 0`. 누적은 그 칸의 마지막 조각만 둥글고(`stackRadius`) 앞 조각 시작 쪽에 투명 border 2(`stackBorder` — 11-05 에 실측한 길), 묶은 막대는 계열 사이 2px(`groupSlot`). 정적 `.chart .bar i` · `.progress-list .progress i` 오른쪽 끝 · `.sparkline i` 위 끝 4(트랙은 각진 그대로).
- **격자 = 1px 실선**(사람의 결정 — 11-15 의 점선 3·3 을 바꿈), **가로 막대는 격자 · `beginAtZero` 가 값 축(x)에**(전에는 범주 축에 있던 결함). 값 축 눈금은 ko-KR 천 단위, 축이 10,000 에 닿으면 축 전체가 만 단위(`COMPACT_FROM` · `tickFormat` — 한 축에 한 형식).
- **선** 끝 · 꺾임 round · hover 점 바탕색 링 2. **영역 = 계열 색 10% 단색**(사람의 결정 — 11-13 의 세로 그라데이션 32 → 6% 를 바꿈, `AREA_ALPHA`). **스파크는 마지막 점**(r 3 · 바탕색 링 2).
- **막대 그라데이션 옵션 삭제**(사람의 결정 — 11-15 의 `gradient`). spec 에 오면 한 번 경고하고 단색, verify 가 예제에서 막고 React `BarSpec.gradient` 는 `@deprecated`. 예제 `bar-emphasis` 는 Highlight 하나로.
- **툴팁 = 값 먼저 굵게 · 계열 이름 옅게 · 짧은 선 키**(사람의 결정 — `tipLabel` · `tipBody` · `pointStyle "line"`), 선 · 혼합 차트에 세로 기준선(`crossPlugin`). 범례는 원 그대로(사람의 결정). 표로 보기는 옵션 그대로(사람의 결정).
- **색 자리 `slot`** — 계열에 자리를 정해 두면 필터로 계열 수가 바뀌어도 남은 계열이 다시 칠해지지 않는다(dataviz 'Color follows the entity'). 사이트 spec · React `Series.slot`, Rules '색 자리'.
- **다시 불러오기** — React `useDsChart` 가 종류가 같으면 지우지 않고 handle 의 새 `update(config)` 로 갈아 칠한다. `.chart-card[aria-busy="true"]` 위에 이미 차트가 있으면 Skeleton 대신 지난 그림을 흐리게(opacity .5) 둔다(사이트 · React).
- **진행 막대 · 게이지 트랙 = 같은 파랑 옅은 단계**(사람의 요청 — dataviz meter 규칙) — 새 토큰 `--chart-mono-track`(라이트 blue-90 · 다크 blue-20, `ADDITIONS` · `grammarOnly`). 채움 / 트랙 3:1 이상 · 트랙 / 바탕 1.1 이상을 라이트 · 다크에서 잰다. Loading 의 진행 막대는 상태 표시라 회색 그대로. 토큰 121 → 122(차트 16 → 17 · 트리 밖 31 → 32).
- **대시보드는 훑어보기만**(사람의 결정) — 머리의 기간 Select Button 을 지우고 순서를 KPI 넷 → 주 줄(일별 탐지 + 심각도 분포) → 보조 줄(유형별 탐지 + 부서별 패치) → 최근 Critical 표로. Rules '기간' 행을 '필터 없음' 으로.
- **새 패턴 · 템플릿 '분석 · 리포트'**(`analytics`, Security Console — 사람의 결정) — 머리에 CSV 내보내기, 카드 밖 필터 한 줄(기간 Date Picker 맨 앞 + 심각도 Combobox), KPI 넷 → 심각도 누적 추이 → 유형별(가로 막대) · 탐지 경로(도넛) → 상세 표. 예제 기본 · 불러오는 중(지난 그림 흐림) · 빈 결과(사이트 · React). 새 ds.js 동작은 없다(필터 반영은 제품 몫). 템플릿 일곱 → 여덟, UI Dictionary 항목, 대시보드와 서로 '비슷한 패턴'. Patterns Overview 카드 썸네일은 Figma 에 없어 기본 그림이다 — `thumbs.js PENDING` 에 이유와 함께 두고, 파일이 생기면 verify 가 지우라고 알린다.
- **verify 더함:** spec 의 `gradient`, 차트 카드 `.chart-action` 안의 Select · Select Button · Date Picker · Combobox · Search, 대시보드의 기간 · 필터 컨트롤, 분석 패턴의 필터 줄(첫 차트 카드보다 위 · 카드 밖 · 맨 앞이 기간), 패턴 23.
- **수의 근거:** pages +2 = 분석 패턴 · 템플릿 문서 페이지. contrast +14 = 새 쌍 '진행 막대 · 게이지 채움 mono-1 / 트랙' 1 × 맥락 14(옛 'mono-1 / surface-neutral-strong' 쌍은 정적 막대 트랙으로 남김). behave +20 = `behave.dataviz` 20(막대 끝 · 바닥 픽셀 · 두께, 묶음 · 누적 틈 픽셀, 가로 막대 격자 축, 선 · 링, 영역 0.1, 눈금 형식, crosshair 픽셀, 툴팁 순서 · 굵기 · 선 키, slot 고정, 스파크 끝 점, 정적 막대 끝, 트랙 토큰 · 대비 라이트 · 다크, 불러오는 중 흐림, 필터 줄 위치, 1440 · 390 넘침, 대시보드에 기간 없음). react +5 = 테스트 순증 2(차트 update · slot · gradient 경고) + 분석 예제 셋의 구조 비교 3(예제 331 → 334).
- **기존 단정 고침:** 각진 막대 · 반경 0(behave.js 둘), 점선 격자 · 그라데이션 영역 · 그라데이션 막대 픽셀 · 누적 '빈 픽셀 0'(behave.chart · behave.revise), 정적 막대 '모두 각짐' → 채움 끝 4 · 트랙 각짐, 탐색형 차트 격자 색은 값 축에서 읽음(가로 막대가 y 축 기본색을 읽어 라이트 · 다크 둘 다 실패), 패턴 22 → 23 · 템플릿 7 → 8, **390 부제 줄바꿈 단정을 분석 패턴으로** — 대시보드에서 기간 버튼을 빼자 부제가 390 에서도 한 줄이 되어 '띄어쓰기에서만 줄바꿈' 을 잴 수 없었다(같은 `.page-head .sub` 규칙).
- 음성 시험 13건(생성 파일을 되돌리고 `cmp` 로 복원 확인) 모두 실패로 잡혔다 — 바닥 둥글게 17/20 · 틈 0 18/20 · crosshair 지움 · 영역 20% · 툴팁 이름 먼저 · 스파크 끝 점 지움 · 격자 범주 축 · slot 고정 끔 · 선 끝 butt · 정적 각짐 · 흐림 지움 19/20, 게이지 · 진행 막대 트랙 회색 18/20. slot 변형은 처음에 못 잡아(자리를 모두 주면 바로 그 색이 됨) 일부만 자리를 준 경우를 더해 잡았다.
- 캡처: 1440 라이트 · 다크 · 빨강 제품 · 390 에서 Data Visual · 대시보드 · 분석 패턴 · 두 템플릿 화면 — 콘솔 오류 · 가로 넘침 0, 빨강 제품에서도 차트는 고정 파랑.
- **audit 도구:** `chartExpect` 가 새 상수(`AREA_ALPHA` · `BAR_MAX` · `BAR_END` · `BAR_GAP`)와 툴팁 키 'line' 을 읽는다(옛 정규식이 상수 선언 한 줄을 못 읽어 Chart 대조 전체가 '읽지 못함' 하나로 줄어 있었다).
- **하지 않은 것:** 색 토큰 · 팔레트, 표로 보기 기본값, 카드 제목을 결론문으로(design-elevation 권장 — Writing 규칙과 맞춰 볼 일), 게이지를 bullet 으로. **본 것(고치지 않음):** 1440 분석 화면에서 넷째 KPI(차단율)만 증감 줄이 두 줄로 내려간다(KPI 칸 폭 — 기존 KPI 규칙).
- Figma 미반영 5 → 65건(Home 잘림 제외 — 앞 항목의 6 은 Home 포함) — 이번 몫 60: Chart 세트의 막대 모서리 · 두께(Bar · Mixed 34), 영역 불투명도 0.24(4), 툴팁 견본 3, 게이지 트랙 1, 스파크라인 모서리 4, 저장소에만 있는 `chart/mono/track` 1, Data Visual Spec 2 · Rules 7, 대시보드 고르기 표 · Rules 3, 분석 패턴 카드 없음 1. 앞서 있던 5(Select Spec · Navigation 좁은 화면 · 위험 확인 이름 입력 · 달력 Hover · 필수 Tag).

2026-11-23 작은 어긋남 셋(사람의 요청 — 프론트엔드 점검에서 찾은 것) — 게이트 수는 그대로(기존 단정 하나를 다시 씀).
- **React `Form` JSDoc** 의 '오류 3개 이상이면 위에 요약' 을 지웠다(폼 위 요약은 2026-11-16 에 없앰) — 오류는 각 필드 아래에만.
- **Resources › React Package 동작 목록의 Toast** '최대 3개' → 동작이 있으면 10초 · 오류는 닫을 때까지 · 동시에 3개까지 — 넘치면 자동 소멸부터 지우고 오류는 밀리지 않아 3개를 넘을 수 있음(2026-11-10 결정대로).
- **차트 어댑터의 Chart.js 내부 의존 제거** — `flushResize` 가 내부 이름 `_resizeBeforeDraw` 를 읽던 것을 애니메이션 `onComplete` 에서 공개 API `chart.resize()`(인자 없음 — 틀을 다시 잼)로 바꿨다. onComplete 때 Chart.js 는 애니메이션이 이미 끝난 것으로 쳐서 미루지 않고 바로 적용하고, 크기가 같으면 아무것도 하지 않는다(4.6.1 소스로 확인). 틀이 숨어 0 × 0 이면 건너뛴다(숨은 탭 · 표로 보기 · 닫힌 패널의 차트를 0 으로 만들지 않게 — Chart.js 의 ResizeObserver 와 같은 판단).
  behave.chart 의 단정을 내부 값을 넣는 대신 틀 폭을 줄이고(ResizeObserver 가 돌기 전) 콜백을 불러 차트가 새 틀 폭이 되는지, 숨긴 틀에서는 그대로인지 재게 다시 썼다(단정 수 그대로).
  음성 시험: `flushResize` 를 빈 함수로 하면 그 단정이 실패, 숨은 틀 검사를 빼면 실패.

2026-11-23 VectorLab UI/UX Skills 대조 — 입력 보호 · 누르는 영역 · 문구 · 패턴 보강(사람의 요청 · 결정 넷) — behave 1651 → 1685(`behave.ux.js` 34) · react 903+6 → 923+6. contrast · advisory · verify · pages 수는 그대로(새 색 쌍 없음).
- **근거:** 공개 저장소(github.com/vectorlabau/skills, 16 스킬)의 스킬 파일 52개를 읽어 인터랙션 · 피드백과 문구 · 시각과 모션 셋으로 대조했다(플러그인은 설치하지 않음). 어긋남은 약 45건(겹침을 합침)이다. 사람의 결정과 부딪히는 규칙(버튼 40 · 12px 글자 · 폼 위 요약 없음 · Negative 는 alertdialog 안만 · 로그인 숨긴 라벨 · 줄인 모션에서 Spinner 돎)은 뒤집지 않았다.
- **사람의 결정:** 범위 = 입력 보호 · 누르는 영역 + 문구 정리 + 패턴 보강. 시각 · 모션과 구조 일은 목록으로만 남긴다(아래 '하지 않은 것'). 필수 문구는 상태로 쓴다. 폼 초안 저장은 옵션이다.
- **오버레이 입력 보호** — 모달 Side Panel 의 배경 누름이 Popup 과 같은 판정이 됐다. 입력하는 중이거나 처리 중이면 닫지 않는다(전에는 늘 닫았다).
  편집한 Popup · 모달 Side Panel 을 Esc · X · 취소로 닫으면 버튼 줄 바로 위에 위험 Notice 줄(`role=alert`)을 띄운다. 문구는 '변경 사항을 버릴까요?' · '입력한 내용은 저장되지 않습니다.' 이고 버튼은 '계속 편집'(포커스) · '버리기' 다. 모달 위에 모달을 겹치지 않으려고 Notice 줄로 했다(사람이 정하지 않은 기본값).
  묻지 않는 경우: 위험 확인 · 처리 중, `.primary` 에 단 닫기(저장 뒤 닫기), 코드로 닫기(`DS.popup.close()` · `open={false}`), 비모달 패널. 끄는 법은 사이트 `data-confirm-discard="false"` · React `confirmDiscard={false}` 다.
  **오버레이 안 검색창에 친 것은 입력으로 세지 않는다** — 거르는 것이지 입력이 아니다(사람이 정하지 않은 기본값, 초안과 같은 규칙). 첫 게이트에서 단정이 잡았다.
- **폼 초안(옵션)** — 사이트 `form[data-draft="키"]` · React `useFormDraft(key, {exclude, labels, enabled})`. 입력하고 0.5초 뒤 localStorage `jsds-draft:키` 에 남긴다(모든 접근은 try/catch).
  다시 열면 처음 값과 다른 칸만 되살리고, 폼 맨 위에 '저장하지 않은 입력을 되살렸습니다.' + '버리기' 를 보인다. 통과한 제출이면 지우고, 검증이 막은 제출이면 남긴다.
  남기지 않는 칸: 비밀번호 · 파일 · 숨은 값 · 읽기 전용 · 일회용 코드 · 복사 필드 · 인증 코드 칸 · 검색창 · `data-draft-skip` 안.
  켠 예제는 입력 폼(`policy-new`) · 알림 규칙(`alert-rule-new`) 패턴이다. 계획에 적은 정책 설정 패턴에는 켜지 않았다. 세션 만료 패턴의 '입력이 사라짐' 문구를 '초안이 남는 폼이면 다시 로그인한 뒤 되살아남' 쪽으로 고쳤다.
- **누르는 영역 24 이상** — 아래 대상에 보이지 않는 `::after` 칸을 더했다. Breadcrumb 더 보기와 같은 방식이고, 글리프 크기 · 배치는 그대로다.
  - 대상: 칩 · 검색 · Combobox 지우기, Notice · Toast · Banner 닫기, 표 정렬 버튼, 표 행 · 머리글 체크박스.
  - **체크박스는 입력을 그 칸 위로**(`position:relative;z-index:1`). 넓힌 칸이 입력을 덮어 Playwright 클릭이 시간 초과로 멈췄다(첫 게이트).
  - 이웃 대상을 덮지 않는지는 모든 예제에서 쟀다.
  - compact Pagination 의 이전 · 다음은 34 × 32 → 32 × 32 다.
- **아이콘 전용 버튼 Tooltip** — 화면 · 표 · 카드 · 목록의 아이콘 전용 버튼을 접근 이름과 같은 글의 Tooltip 으로 감쌌다. 사이트는 `.tooltip-wrap`, React 는 새 prop `Button tooltip`(true | 방향)이다.
  빼는 것(사람이 정하지 않은 기본값): 끈 버튼, 닫기 X, 필드 · 칩 안 버튼(달력 · 시계 · 비밀번호 보기 · 지우기), 복사 · 파일 지우기 · 다시 시도.
  Tooltip 에는 aria-hidden 을 달지 않았다(기존 Tooltip 그대로 — 글이 이름과 같아 `aria-describedby` 로 잇지 않음). 미리보기 오른쪽 끝의 둘(대시보드 새로 고침 · 상세의 더 보기)은 넘침을 막으려 왼쪽으로 연다(1440 · 1024 · 768 에서 13px, 390 에서 32px 넘쳤다).
- **문구**
  - 필수 문구는 상태로(사람의 결정) — '값이 비어 있습니다. 값을 입력하세요.' · '고른 항목이 없습니다. 항목을 선택하세요.' · '고른 파일이 없습니다. 파일을 선택하세요.'
  - 시각 오류는 '{subject} 24시간제 형식이 아닙니다. 14:30 처럼 입력하세요.' 다.
  - React DataTable 의 빈 문구 '데이터가 없습니다.' → `LABELS.tableEmpty` '표시할 항목이 없습니다.'.
  - 같은 동작은 한 말 — '필터 초기화' · '정책 만들기' · 'CSV 내보내기'. 액션 바 · 메뉴의 '내보내기' 는 대상이 분명해 그대로 뒀다.
  - 동사 + 대상 — '로그 보기' · '라이선스 상세' · '라이선스 갱신' · '알림 채널 연결'.
  - 오류는 무엇 + 고치는 법 — 오류 Toast 예제, 오류 화면 제목 '이 화면을 불러오지 못했습니다' + '오류 정보 복사', 로그인 실패 · 에이전트 끊김 Notice 의 다음 행동.
  - placeholder 는 형식 예시만이다('예: 외부 USB 차단' · 'admin@example.com' · '예: SIEM 연동'). 형식 예시가 아닌 placeholder 와 제품이 넣은 사용자 문구는 남겼다.
  - 차트 '표시할 데이터 없음' → '탐지 이벤트 없음'.
  - Steps 기본 '완료' 버튼은 React 개발 모드에서 한 번 경고한다.
  - Rules 를 더하거나 고쳤다: Button '아이콘 전용', Popup · Side Panel '닫기', Loading '오래 걸리는 작업'(10초 넘으면 진행 표시 + 취소), Data Table '다시 불러오기' · '상태', Empty State '첫 사용' · '정상 0건' · '권한 없음' · '구성', Form '초안', 오류 화면 '문구'.
  - Writing '빈 화면 제목' 행을 고쳤다.
- **패턴 보강**
  - 검색 빈 결과는 툴바 · 표 틀을 그대로 두고 표 본문에 빈 상태 + '필터 초기화' 를 둔다.
  - 역할 · 비밀값 · 보고서 예약 · 감사 로그 목록은 만들기 버튼을 Page Header 로 옮기고 기본 정렬 열(`aria-sort`)을 둔다. Pagination 은 보고서 예약 · 감사 로그만 붙였다 — 역할 · 비밀값은 3행이라 붙이지 않았다.
  - **DataTable 다시 불러오기** — React `status="loading"` 에 rows 가 있으면 Skeleton 대신 지난 행을 두고 틀에 `aria-busy` 를 단다. 몸통만 opacity .5 이고 머리글 · 높이는 그대로다.
    처음 불러오기는 `rows={[]}` 로 Skeleton 이다. 새 prop `delay` 는 `useLoadingDelay` 를 다시 쓴다(11-11 결정대로 옵션). 알림 이름은 caption 이 있으면 '{caption} 불러오는 중'(MIGRATION — 동작 변화).
    사이트는 제품이 `.tbl-wrap[aria-busy="true"]` 를 달고 뗀다(ds.js 동작 없음).
  - **빈 상태 문구는 한 줄 표 안에서도 줄바꿈**(`.tbl.nowrap td.empty{white-space:normal}`) — 390 캡처에서 발견했다. 검색 빈 결과의 한 줄 문구가 표를 573px 로 넓혀 가로 스크롤 뒤로 잘렸다.
- **verify 더함:** placeholder 지시문('…입력하세요')과 라벨 되풀이, `BANNED_LABELS` 에 예 · 아니요 · 제출 · 진행 · 계속, '확인' 은 정보 대화상자의 단독 버튼으로만(이 허용을 쓰는 예제는 지금 없다), 접근 이름의 '예시', 아이콘 전용 버튼의 Tooltip, 첫 사용 · 검색 결과 없음 Empty State 의 동작, Steps 완료 라벨 '완료'.
- **behave.ux 34**(다섯 부분): Side Panel 배경 · Esc · 취소 · 버리기 · 끔, Popup Esc · X · 취소 · 위험 확인 · 코드 닫기, 초안 저장 · 되살림 · 버리기 · 제출 · 막힌 제출 · 제외 칸 · 라디오, 누르는 영역 · 이웃 겹침 · Pagination · Tooltip, 검색 빈 결과 · 목록 Page Header · 정렬 · Pagination · 흐림 · 좁은 화면 빈 상태.
  **기존 단정 고침:** Button Rules 4 → 5행 · Data Table Rules 묶음 수(상태 묶음에 한 줄), 검색 빈 결과는 표 틀 안(behave.patterns), 필수 문구 단정들(사이트 · React).
  초안 단정의 0.5초 저장 타이머가 부하에서 늦게 불려 4회에 1회 실패했다 — 저장값이 생길 때까지 기다리게 고쳤다.
- **react +20:** `discard-guard` 7(팝업 안 검색창 1 포함) · `form-draft` 6 · `data-bundle` 4(tableEmpty · 지난 행 · 처음 Skeleton · delay) · `labels-parity` 2(버림 · 초안 문구) · `Button` 1(tooltip). `feedback` 1건은 같은 수로 다시 썼다.
- **음성 시험(모두 잡힘):**
  - verify 7 — placeholder 지시문 · '계속' · 접근 이름 '예시' · 단독 아닌 '확인' · Tooltip 없는 아이콘 버튼 · 동작 없는 빈 화면 · Steps '완료'.
  - React — stale 끔 · delay 무시 · caption 이름 · 검색창을 입력으로 셈 · tableEmpty 글자. tableEmpty 는 사이트에 없는 문구라 labels-parity 가 아니라 data-bundle 이 잡는다.
  - 사이트 5 — 흐림 규칙 지움 · 빈 결과 colspan 틀림 · 체크박스 입력 위로 지움 · 오버레이 검색창 제외 지움 · 빈 상태 줄바꿈 지움.
  - 캡처: 1440 라이트 · 다크 · 390 에서 Side Panel · Popup 버림 확인 · Tooltip · 검색 빈 결과 · 목록 Page Header · 흐린 표를 보았다(콘솔 오류 0).
- **하지 않은 것(후속 후보 — 사람의 결정 '목록으로만'):**
  - 시각 · 모션 — Popup 1px 테두리, 라이트 그림자 한 겹 · 합 .08 이하, 알림 센터 그림자 단계, 다크 윗변 하이라이트, 소비자 0 그림자 토큰 4, 들어옴 ease-out · 나감 ease-in 이징 토큰, transition 속성 허용 목록, 줄인 모션 변경 구독, 문서 셸 N 배지 9px/800.
  - 구조 — 컴포넌트 간격 약 500곳 `--space-*` 화, 격자 밖 값, 브레이크포인트 단일 출처, 템플릿 화면 375 넘침 결정 기록, 2560 셸 머리, ⌘K · ? 도움말 · 표 행 방향키 · Kbd, 선택 기억 helper, 긴 폼 sticky 버튼.
  - 조직도 인라인 편집은 '1.0 뒤 다시 묻기'(메모리)라 그대로다.
- Figma 미반영 12건 — Rules 행(Button 아이콘 전용 · Popup 닫기 · Side Panel 닫기 · Loading 오래 걸리는 작업 · Data Table 다시 불러오기와 상태 · Empty State 넷 · Form 초안 · 오류 화면 문구). 누르는 영역 · Tooltip · 버림 확인 · 초안 Notice 는 audit 대조 밖이라 수에 없다.

2026-11-23 메뉴 체크 · 라디오 · 적용 영역 · Select 여러 개 · Combobox 칩 넘침 · 표 칸 글자(사람의 요청 셋 · 결정 넷) — behave 1685 → 1719(`behave.menu.js` 33 · `behave.table.js` 1, 기존 단정 고침 2) · react 923+6 → 940+6(`tests/menu-choice.test.tsx` 9 · 예제 334 → 342 에 따른 구조 비교 8). contrast · advisory · verify · pages 수는 그대로(새 색 쌍 없음 — 체크 표시는 Checkbox 와 같은 제품 면 / brand-label 쌍, 설명 줄은 tertiary).
- **참고:** Montage Menu(항목 variant normal · radio · checkbox, 그룹 제목, 항목 설명, 아래 초기화 · 적용)와 Select(SelectMultiple · overflow · allSelectedLabel · 적용 영역). 이름 · 모양은 이 시스템의 토큰과 마크업으로 썼다.
- **사람의 결정:** Select 에 여러 개 선택을 넣는다(2026-11-09 의 'Select 는 단일, 여러 개는 Combobox' 를 바꿈), Dropdown 에 넷 모두(체크 항목 · 라디오 항목 · 그룹 제목과 설명 줄 · 아래 초기화와 적용 영역), Combobox 칩 넘침은 **가로 스크롤이 기본**이고 줄바꿈은 옵션(11-09 원칙 '여러 개' 와 지금 동작을 바꿈), 로그 행 글자는 14(다른 표와 같게).
- **메뉴 항목(Dropdown · Select 공통)** — 앞 표시 `span.menu-mark.check` · `.round`(16, aria-hidden — 켜짐은 `--surface-brand-primary` 면 + `--brand-label` 체크 · 점), 켜진 항목은 글자 600 이고 면 · brand 글자를 쓰지 않는다(`.on` 과 갈림 — 사람이 정하지 않은 기본값). 설명 줄 `span.menu-text > .menu-name + .menu-desc`(12/16 tertiary · 있으면 메뉴 최대 320), 그룹 `li[role=none].menu-group > .menu-label#id + ul[role=group][aria-labelledby]`.
- **Dropdown** — `li.menu-item[role=menuitemcheckbox|menuitemradio][aria-checked]`, 라디오는 이름 있는 `ul[role=group][data-name]` 안에만. 누르거나 Enter · Space 면 뒤집고 **메뉴는 열린 채 · 포커스는 그 항목**(실행 항목은 지금처럼 닫음), `ds:menu-change {name, value, checked, values, groups, trigger}`. 글자로 찾기는 `.menu-name` 만 본다.
  **적용 영역** `div.menu[data-actions] > ul.menu-items[role=menu|listbox] + div.menu-actions.btn-group`(텍스트 '초기화' · sm solid '적용') — 고르는 것은 초안이고, 적용하면 이벤트를 한 번 내고 닫고 트리거로, 적용 없이 닫히면(Esc · 바깥 · 트리거 · Tab) 열 때로 되돌린다. 초기화는 체크를 모두 끄고 라디오는 `data-default`(없으면 첫 항목)로 — 적용 전까지 초안. Tab 은 항목 → 초기화 → 적용 → 닫힘.
  React `MenuCheckboxItem` · `MenuRadioGroup` + `MenuRadioItem` · `MenuGroup` · `MenuItem description` · `MenuActionArea onApply onReset` · `Dropdown onDiscard`.
- **Select 여러 개** — `.dropdown[data-multiple]` + `ul.menu[role=listbox][aria-multiselectable=true]`, 옵션 앞 체크 · `aria-selected`(`.on` 없음), 고르는 동안 목록은 열린 채. 트리거 글은 고른 이름을 쉼표로 이어 한 줄(넘치면 말줄임) · 모두 고르면 `data-all-label` · `data-overflow="wrap"` 이면 줄바꿈하고 트리거가 늘어남. 폼 값은 값마다 숨은 input(`data-name`), `ds:select {values, trigger}`, 필수는 단일과 같은 검증(문구 `choose`). 적용 영역은 Dropdown 과 같은 초안 규칙. '전체' · '선택 안 함' 옵션은 여러 개에 두지 않는다(초기화가 대신). React `Select multiple value={string[]} allSelectedLabel overflow actions`(actions 를 켜면 onChange 는 적용 때만). 단일 Select 의 모양은 그대로다.
- **Combobox 칩 넘침** — 여러 개는 기본 가로 스크롤: `.control-track` 이 한 줄 · 높이 32 · 40 · 48 고정 · 스크롤바 숨김, 칩을 더하거나 입력칸 · 칩 지우기에 포커스가 오면 그 자리로 스크롤, 넘칠 때만 세로 휠을 가로로. `data-overflow="wrap"` · React `overflow="wrap"` 이면 예전처럼 줄바꿈(MIGRATION). 툴바 안 가로 스크롤 Combobox 는 최대 320. 여러 개의 고른 표시는 오른쪽 체크에서 앞 `.menu-mark.check` 로(Select 여러 개와 같게 — 사람이 정하지 않은 기본값).
- **표 칸 글자** — 원인: `.log-row{font-size:12px}` 가 행에 걸리고 `.tbl td` 는 글자를 정하지 않아, `.tbl.compact td` 만 14 를 다시 적어 가려 왔다(compact 를 떼면 로그 표 넷이 12 가 됨). `.tbl td` 가 14 / 1.375rem / .0145em 을 직접 정하고 compact 의 되풀이 · `.log-row` 글자 선언을 지웠다. `.tbl-wrap{line-height:1.6}`(표 안에는 효과 없음)과 사이트 셸 `td code` 가 컴포넌트 표에 걸리던 것(`table:not(.tbl) td code` 로 좁힘)도 정리했다. Spec 의 칸 글은 'Label 1/Reading Regular 14(밀도 · 로그 행과 무관)'. verify 가 `.kv` 와 밀도 클래스를 함께 쓰지 못하게 한다.
- **고르기 표 · Rules** — Dropdown 언제 쓰는가에 '켜고 끄는 보기 설정', Rules 를 세 묶음(항목 · 선택 항목 · 자리와 키보드)으로 — '선택 표시: 쓰지 않습니다' 를 '체크 · 라디오 항목' 으로 바꾸고 그룹 · 설명 · 적용 영역 · 항목 수(체크 · 라디오도 3~15 에 셈)를 더함. Select 언제 쓰는가 '6개 이상에서 하나, 또는 찾지 않고 여러 개', Rules 세 묶음(목록 · 동작 · 여러 개). Combobox 언제 쓰는가 '약 15개 이상 · 칩으로 보고 지울 때', Rules '여러 개' 를 고치고 '태그가 넘칠 때' 를 더함.
- **예제(사이트 · React):** Dropdown Checkbox · Radio · Groups · Actions, Select Multiple · Multiple Apply · All Selected, Combobox Multiple Wrap(Multiple 은 태그 다섯으로 넘치게). Data Table 열 표시 설정에는 쓰지 않았다(1.0 뒤 다시 묻기).
- **verify 더함:** 메뉴 항목 수 = menuitem · checkbox · radio 합 3~15, 그룹(`ul[role=group]`) 안 목록까지 짝 맞춰 읽음, 체크 · 라디오의 aria-checked · 맨 앞 `.menu-mark`(종류가 role 과 맞음), 라디오는 이름 있는 그룹 안, 적용 영역의 구조 · '적용' 버튼 · 실행 항목과 섞지 않음, `.kv` + 밀도 금지.
- **behave.menu 33**(여섯 부분) — Dropdown 체크 · 라디오(열린 채 · 포커스 · 이벤트 · Space · 켜진 모양 · 라디오 하나 · 그룹과 설명 · 글자로 찾기), 적용 영역(구조 · 한 줄 양끝 · 초안 · 트리거와 Esc 로 되돌림 · 초기화 · 적용 · Tab 순서), Select 여러 개(모양 · 값 · Space · placeholder · 600 · 적용 영역 · 전체 라벨 · 필수 검증), Combobox(스크롤 높이 고정 · 입력칸 보임 · wrap · 휠 · 태그 더해도 입력칸 보임 · 크기 셋), 처음부터 열린 메뉴는 미리보기 안. behave.table +1 — 컴포넌트 · 패턴 · 템플릿의 모든 표 칸이 세 밀도에서 14/22(로그 행 포함, 표와 행에 12px 를 걸어도). **기존 단정 고침 2:** Combobox 여러 개 예제의 태그 기대값(셋 → 여섯 — 넘치게 늘림, behave.js 두 곳).
- **측정 · 캡처에서 드러나 고친 것:** 가로 스크롤 트랙이 끝 칩 지우기의 넓힌 누르는 영역(24)을 잘라 behave.ux 가 잡았다(`scroll-padding-inline:0.75rem`). Dropdown 적용 영역이 트리거 폭(118)에서 초기화 · 적용을 두 줄로 쌓았다(캡처) — `.dropdown .menu[data-actions]{min-width:max(100%,12.5rem)}` · `.menu-actions{flex-wrap:nowrap}`. 첫 전체 게이트는 그 CSS 를 빌드하기 전에 돌아 1716/1719 였다.
- 음성 시험(모두 behave.menu 가 잡음): ds.js 6(토글 이벤트 지움 · 되돌림 없음 · 휠 처리기 지움 · 전체 라벨 지움 · 여러 개 빈 값 검증 지움 · 포커스 유지 지움), CSS 4(켜진 굵기 500 · 적용 영역 nowrap 지움 · 표 칸 글자 지움 · 적용 영역 최소 폭 지움). 표 글자 단정은 처음에 못 잡아(세 밀도 모두 상속으로 14 가 나옴) 표와 행에 12px 를 걸고 재게 고쳐 잡았다. React 는 새 테스트를 하나씩 되돌려 실패를 확인했다.
- **하지 않은 것:** 단일 Select 의 그룹 라벨을 `.menu-group` 마크업으로 옮기는 일(그룹을 쓰는 Select 예제가 없음 — 옛 `li.menu-label` 그대로), 하위 메뉴 · 메뉴 안 검색 · 앞뒤 콘텐츠 갈래, Figma 세트 그리기.
- Figma 미반영 12 → 58건(Home 잘림 · 숨긴 ov-grid 사본 2 제외) — 이번 몫 46: Dropdown · Select Rules 를 묶음으로 다시 짠 행(저장소에만 · Figma 에만 각각), 고르기 표 셋(Dropdown · Select · Combobox), Combobox Rules 2 · Spec Tag · Mark, Dropdown Spec Size, Data Table · Table Spec Label. 메뉴 체크 · 라디오 · 적용 영역 · Select 여러 개 · Combobox 가로 스크롤은 Figma 에 그리지 않았다(audit 대조 밖).

2026-11-24 추가 수정 열하나 — 차트 · Tab · 대시보드 기간 · Tree · Pagination · Card Radio · Avatar · N 배지(사람의 요청 · 결정 넷) — contrast 3906 → 3822 · behave 1719 → 1726(`behave.fix24.js` 7) · react 940+6 → 939+6. advisory · verify · pages 수는 그대로.
- **사람의 결정:** 그라데이션 둘 다 되살림(계열 하나인 선 영역 · 막대 `gradient` 옵션), 대시보드 기간 = Select Button '24시간 · 7일 · 30일'(11-20 의 '훑어보기만' 을 바꿈), Avatar 6색 체계를 통째로 지움(11-16 을 바꿈), 탭 건수는 탭 목록 템플릿에서만 뺌(알림 센터 안 읽음 탭 · Tab 'With Count' 예제는 남김).
- **차트 머리 · 증감 세로 가운데** — `.chart-head{align-items:center}`(부제를 제목 기준선에 맞추니 8px 위였다), `.chart-figure>.delta{align-self:center}`(`.delta` 의 `align-self:flex-start` 가 값보다 13px 위로 붙였다).
- **그라데이션 되살림(ds-chart — 사이트 · React 같은 파일)** — 계열 하나인 선의 아래 영역 = 가장 높은 점에서 바닥까지 32% → 6%(11-13 의 값 · `AREA_TOP` · `AREA_BOTTOM`), 여러 계열 누적 영역은 10% 단색 그대로, 배치 전에는 단색 10%. 막대 `gradient:true` = 값 끝 불투명 → 기준선 55%(`barFill` · `BAR_FADE`), 누적이면 경고하고 단색(verify 가 예제의 누적 + gradient 를 막음 — 11-20 의 'gradient 금지' 를 바꿈). React `BarSpec.gradient` 의 `@deprecated` 를 뗐다. `bar-emphasis` 예제에 Gradient 막대(사이트 · React), Data Visual Rules '막대' · '영역 · 그라데이션'.
- **막대 모서리 4 → 0** — `BAR_END 0` 으로 bar · mixed · 누적 모두 네 모서리 각짐(두께 24 · 2px 틈은 그대로), 정적 `.chart .bar i` · `.progress-list .progress i` · `.sparkline i` 도 각짐.
- **Tab 글자 15 · sm 13** — 기본 · pill = Body 2/Normal 15/22(0.0096em), sm = Label 2 13/18(0.0194em). 높이는 그대로(44 · pill 34 · sm 38 — 위아래 여백을 맞춤). 탭 목록 템플릿의 탭 건수를 지우고 Tab Rules '건수'(기본은 없음 · 그 수로 탭을 고를 때만) 행을 더했다.
- **대시보드 기간** — 머리 `.actions` 의 `.btn-group` 안 Select Button(radiogroup '기간', 24시간 on) + 기존 새로 고침(사이트 · React · 템플릿). Rules '필터 없음' → '기간'(다른 필터는 분석 · 리포트), 고르기 표의 '비슷한 패턴' 두 곳. verify 의 '대시보드에 기간 금지' 를 '머리의 Select Button 하나' 로.
- **Tree 고른 항목의 숫자** `.tree-meta` = 600 · `--foreground-brand-primary`(조직도 템플릿 · 권한 패턴이 따라감, 기존 brand 글자 / brand subtle 쌍).
- **Pagination 아이콘 가운데** — `.pagination button:has(> svg){display:inline-flex;…center}`(block svg 가 왼쪽에 붙었다 — compact 7px · 기본 1px).
- **Card Radio 고른 제목 600** — `.radio.card:has(input:checked)>span{font-weight:600}`, 설명 small 은 400.
- **Avatar = 중립** — 면 `--surface-neutral-secondary` · 글자 `--foreground-neutral-secondary`(그룹 안은 링 면 위에 합성). 지운 것: 토큰 12(`--avatar-N-surface · -text` — 트리 밖 32 → 20 · 전체 122 → 110), `.avatar[data-tone]` 규칙, ds.js `DS.avatarTone`, `lib.js withAvatarTone`, React `avatarTone` · `AvatarTone` · `tests/avatar-tone.test.tsx` · 구조 비교의 `data-tone`, LOCAL_VARS `--avatar-face`. React `Avatar tone` 은 개발 모드에서 한 번 경고하고 무시, `name` 은 그리지 않는다(MIGRATION). verify 가 예제의 `data-tone` 을 막는다. Avatar Rules '색' · Spec · Props.
- **N 배지** — `.base-list a span` 이 11-20 A10 에서 배지에 넣은 `<span aria-hidden>N</span>` 까지 잡아 14px secondary 로 그렸다 → `.base-list a>span`(Foundations · Templates 개요 · Guide).
- **좁은 화면 Page Header(캡처에서 발견)** — 기간 버튼이 들어가자 390 에서 제목이 '대시보 / 드' 로 낱말 가운데서 끊겼다. 767 이하에서는 `.page-head` 를 한 칸으로 해 동작이 제목 아래 왼쪽으로 내려간다(넓은 화면은 그대로 오른쪽). 모든 Page Header 예제가 따라간다.
- **수의 근거:** contrast −84 = 아바타 이니셜 / 면 6쌍 × 맥락 14(새 쌍은 기존 'secondary / secondary 면' 쌍이 잼 — 설명만 더함). behave +7 = `behave.fix24` 7(머리 · 증감 가운데 · Pagination svg 가운데 · Card Radio · Tree 숫자 · N 배지 · 탭 건수 · 좁은 화면 Page Header). 기존 단정을 다시 씀: behave.dataviz(막대 각짐 · 영역 그라데이션 · 누적 10% · 정적 각짐 · 대시보드 기간), behave.chart(강조 예제의 그라데이션 픽셀), behave.revise(Avatar 중립 라이트 · 다크 · Tab 15/13), behave.js part 41(막대 반경 0 · 그라데이션 막대는 픽셀 단정으로 · 정적 각짐). react −1 = avatar-tone 2 지움 + Avatar tone 경고 1, 차트 테스트(반경 0 · gradient 메타 · 누적 + gradient 경고)는 같은 수로 고침.
- **음성 시험:** 사이트 12건(머리 baseline · 증감 flex-start · Pagination 규칙 · Card Radio · Tree · N 배지 선택자 · Avatar 면 · Tab 14 · BAR_END 4 · 영역 단색 · 막대 그라데이션 끔 · 좁은 Page Header 규칙) · React 2건(Avatar 경고 끔 · gradient 메타 끔) 모두 실패로 잡혔다.
- **audit 도구:** 정적 막대에 border-radius 선언이 없으면 모서리 0 으로 읽는다(선언을 지워 '읽지 못함' 이 났다), 막대 모서리 메시지 문구.
- Figma 미반영 58 → 95건(Home 잘림 · 숨긴 ov-grid 사본 2 제외) — 이번 몫 37: Chart 세트의 Bar · Mixed 막대 모서리 4 ≠ 0(24 — 정적 KPI 스파크 포함), Figma 에만 남은 아바타 변수 12개(1), Rules · 고르기 표(Avatar 색 · Data Visual 막대 · 영역 · Tab 건수 · 대시보드 기간 · 비슷한 패턴 둘), Spec(Tab · Avatar · Data Visual). Tab 글자 · Tree 숫자 · Card Radio · 머리 · 증감 가운데 · Pagination · 대시보드 기간 버튼은 audit 대조 밖이라 수에 없다. 같은 날 Figma 에 반영해 0건이다(Figma 절 '2026-11-24').

2026-11-24 설정 템플릿 · 에이전트 탭 accent(사람의 요청 둘 · 결정 넷) — pages 105 → 106 · behave 1726 → 1731(`behave.templates.js` 5) · react 939+6 → 945+6(`tests/settings-parts.test.tsx` 4 · 예제 342 → 344 에 따른 구조 비교 2). contrast · advisory · verify 수는 그대로(새 색 쌍 없음 — 위험 항목 글자는 메뉴 위험 항목과 같은 negative-strong 쌍, 아바타 lg 는 기존 중립 쌍).
- **새 템플릿 '설정'**(`settings` — 템플릿 여덟 → 아홉, 첨부 이미지 'My Profile' 을 참고). 왼쪽 설정 메뉴 `nav.sidenav.tpl-subnav`(아이콘 없음 · 접기 버튼이 가리키지 않아 폭으로 접히지 않음 — 사람의 결정) + 오른쪽 Page Header '내 정보' 와 카드 셋(프로필 · 개인 정보 · 소속과 지역). 이번에는 '내 정보' 화면만 만들고 다른 메뉴는 `href="#"` 다.
  카드마다 '편집'(outline assistive · 이름에 대상) → **모달 Side Panel**(사람의 결정)의 검증 폼, 저장하면 패널을 닫고 Toast(흉내 — `templates.src.js` 에 Side Panel 제출 분기). 콘솔 사이드 내비의 '설정' 과 사용자 메뉴 '내 정보' 가 이 화면으로 간다. 이미지의 Address 는 콘솔 맥락의 '소속과 지역' 으로, 옅은 파랑 면 버튼은 시스템에 없는 모양이라 쓰지 않았다.
- **계정 삭제 = 메뉴 맨 아래 구분선 뒤 빨간 글자 → 위험 확인 alertdialog**(사람의 결정) — 계정 이메일을 입력해야 삭제(앞뒤 공백 무시, '위험 작업 확인' 패턴의 이름 입력 방식), 확정하면 Toast 만(이동 없음).
- **컴포넌트에 더한 것 셋**
  - **Avatar lg 64**(사람의 결정) — `.avatar.lg` · Heading 2 20/28 Bold, React `Avatar size="lg"`. Avatar Group 에는 쓰지 않는다 — verify 의 묶음 자식 규칙이 이미 `avatar` · `avatar sm` 만 받아(메시지에 'lg 는 묶음에 쓰지 않는다' 를 더함), React `AvatarGroup` 은 lg 를 경고하고 묶음 크기로 그린다. Avatar Sizes 예제 맨 앞에 lg.
  - **Navigation 위험 항목** `.sidenav a.danger`(글자 · 아이콘 negative-strong, hover 면은 그대로 회색) · 앞 구분선 `.sidenav > .divider`(위아래 8). 눌러도 현재 메뉴(.on · aria-current)가 옮겨 가지 않는다 — ds.js 의 현재 항목 처리기가 `.sidenav a:not(.danger)` 만 받는다. React `SideNavItem danger`, Navigation Rules '위험 항목' 행 · Props · 예제 Danger(사이트 · React). **verify 더함:** 사이드 내비의 위험 항목은 하나 · 마지막 항목 · 바로 앞 `<hr class="divider">`(컴포넌트 예제와 템플릿 화면 모두).
  - **Card 두 칸 키-값** `.card-meta.columns`(라벨 Label 2 위 · 값 Body 1/Normal 아래, `.wide` 는 두 칸, 767 이하 한 칸). React `CardMeta columns` · 항목 `wide`, 예제 Columns(사이트 · React). 옛 `card-meta`(옆으로 나란한 키-값)는 그대로다.
- **에이전트 탭 = `.tabs.accent`**(사람의 요청) — 탭이 있는 리스트 템플릿, 고른 탭의 글자 · 밑줄이 제품 색.
- **behave +5:** templates part 9(설정 화면 — 현재 표시 둘 · 위험 항목은 현재가 아님 · h1 하나 · 패널 모달과 포커스 · 틀린 이메일이 제출을 막음 · 저장하면 닫고 Toast 와 포커스 복귀 · 위험 항목이 alertdialog 를 열고 현재 표시 그대로 · 틀린 이메일 막힘 · 공백 섞인 이메일로 닫고 Toast · 1024 · 1440 넘침 없음), part 10 넷(Avatar lg 크기 · 글자 · 묶음에 없음, Navigation 위험 항목 색 · 마지막 · 구분선 뒤 · 눌러도 현재 그대로, card-meta columns 1440 두 칸 · wide · 390 한 칸, 에이전트 탭 accent · 고른 탭 글자 = brand). **기존 단정 고침 1:** Avatar 크기 예제의 기대값에 lg 64 · 20px 를 더함(behave.promote — 첫 게이트에서 걸림).
- **react +6:** `settings-parts.test` 4(Avatar lg 클래스 · 묶음 안 lg 경고와 sm 로 그림 · SideNavItem danger 는 aria-current 없음 · CardMeta columns 와 wide) + 구조 비교 2. `examples-coverage` 의 예제 수 342 → 344(첫 게이트에서 걸림).
- 음성 시험: verify 2(위험 항목이 마지막이 아님 · 구분선 없음) · React 4 · behave 6(ds.js `:not(.danger)` 지움 · avatar lg CSS · danger 색 · columns 390 · accent 클래스 · 패널 제출 분기) 모두 실패로 잡혔다. 설정 화면은 1440 라이트 · 다크 · 1024 캡처로 보았다(콘솔 오류 0). 390 은 템플릿 화면 최소 폭 1024 라 넘친다(다른 화면과 같음).
- **하지 않은 것:** 설정의 다른 메뉴 화면, 사진 아바타, 저장 · 삭제 실제 동작(흉내만), Figma 에 설정 화면.
- Figma 미반영 6건(Home 잘림 · 숨긴 ov-grid 사본 2 제외) — Spec Navigation · Label, Spec Card · Label, Spec Avatar · Size, Spec Avatar · Label, Rules navigation · 위험 항목, Rules avatar · 크기.

2026-11-25 추가 수정 일곱 — 진행 막대 트랙 · 표 hover · Tag 모양 · Combobox 전체 · 표 머리글 · Toast · 운영 팀 이름(사람의 요청 · 결정 셋) — contrast 3822 → 3808 · behave 1731 → 1739(`behave.fix25.js` 7 · `behave.nav.js` 1) · react 945+6 → 951+6(`tests/combobox-all.test.tsx` 4 · 예제 344 → 346 에 따른 구조 비교 2). advisory · verify · pages 수는 그대로.
- **사람의 결정:** 게이지 남은 호도 함께 회색, Combobox '전체' 는 항목마다 칩, 속성 표의 오른쪽 선은 모든 `.tbl.kv` 에서 지움.
- **진행 막대 · 게이지 트랙 = 회색** — `--chart-mono-track` 의 값을 라이트 · 다크 모두 `var(--surface-neutral-strong)` 으로(11-20 의 같은 파랑 옅은 단계 blue-90 · 20 을 되돌림). 토큰 이름 · 소비자(`.progress-list .progress` · ds-chart `track`)는 그대로라 토큰 수 110 그대로다. **contrast −14** = 따로 재던 '채움 mono-1 / mono-track' 쌍이 '채움 / surface-neutral-strong' 쌍과 같은 값이 되어 지움(× 맥락 14). 채움 / 트랙(카드 위 합성) 라이트 5.00 · 다크 6.15.
- **표 hover 는 옵션** — `.tbl.hover`(이미 있던 클래스 · React `hover`)를 Table · Data Table Props 에 적고 Table 페이지에 Hover 예제(사이트 · React), Rules '행 hover'(기본은 없음 · 행이 상세로 이어질 때만). 복사용 CSS 에 `.link` 를 더함(verify 가 잡음).
- **Tag = Chip 과 다른 모서리** — 기본 `--radius-md` · 4/6(높이 22 → 24), sm `--radius-sm` · 2/4(18 그대로), lg `--radius-md` · 6/8 · Label 2 13/18 · 자간 0.0194em(26 → 30). `.tag-more`(+N)도 따라간다. lg 의 행간 · 자간은 사람이 정하지 않은 기본값(텍스트 스타일 표 안). Spec Size · Container · Label · Props.
- **Combobox '전체' 옵션** — 여러 개 Combobox 목록 맨 위 `li.menu-item[data-all][role=option]`(사이트 `cbBox all` · `pCombo all`), React `Combobox multiple allLabel="전체"`. 고르면 끄지 않은 모든 항목이 선택되고 항목마다 칩, 모두 골라진 채 다시 고르면 모두 풂, 항목 하나를 풀면 체크가 꺼지고 다 고르면 다시 켜짐. 값 · 숨은 input · `ds:select` · `onChange` 에는 들지 않고, 알림 문구는 '전체 선택됨, n개'. 검색어를 치는 동안 숨는다(사람이 정하지 않은 기본값). React 는 `multiple` 없이 주면 개발 모드에서 한 번 경고하고 그리지 않음. 위저드 템플릿 '배포 대상 그룹' 의 보통 항목 '전체' 를 이 옵션으로 바꿨다. 예제 All Option(사이트 · React), Rules '전체', Props, MIGRATION. **verify 더함:** `data-all` 은 `aria-multiselectable` 목록 안에만 · 하나 · 맨 위 · role=option · aria-selected = 모두 골라졌는지.
- **표 머리글 면 없음** — `.tbl th` 의 회색 면을 지움(아래 선 그대로). 고정 헤더 · 고정 열의 머리글만 아래로 지나가는 행이 비치지 않게 놓인 자리의 면 `--tbl-surface` 를 칠한다(`.tbl-wrap.sticky` 에 기본 `--background-neutral-primary`, 카드 · 패널 · 팝업 안은 기존 규칙대로 elevated). **속성 표(`.tbl.kv`)의 머리글 오른쪽 선을 모두 지움**(사이드 패널 전용 `border-right:0` 은 쓸모없어져 지움). Table · Data Table Spec Container · Props · Rules '경계'.
- **Toast 글자 500**(동작 버튼은 600 그대로).
- **운영 팀 이름 = '기획실 디자인팀'** — `render.js` About › 운영 문장과 Contribution 의 '디자인 리뷰' 줄. **verify 더함:** 원본(`_build/*.js|css`, verify.js 제외)과 생성 html · js · css 에 '디자인파트' 금지. 예제 데이터의 부서 '기획팀'(조직도 등)은 다른 뜻이라 그대로다.
- **behave.fix25 7** — 8 페이지 149 개 비고정 머리글이 투명 · 고정 헤더 th = `--tbl-surface` 이고 스크롤해도 위 · 고정 열 머리글 불투명, Table 기본은 hover 면 없음 · Hover 예제는 tertiary, Toast 500 · 버튼 600, Combobox 전체 둘(고르기 · 칩 · 이벤트 값 · 알림 / 칩 지우면 꺼짐 · 다시 고르면 모두 풂 · 검색 중 숨김), 위저드 '전체' 옵션, About 팀 이름. behave.nav +1 = Tag 세 크기의 반경 · 여백 · 글자. **기존 단정 고침:** Tag 높이 18 · 22 · 26 → 18 · 24 · 30 · 좁은 자리 Tag 22 → 24 · sm 여백 2/8 → 2/4(behave.nav), 속성 표 오른쪽 선 '패널 밖은 1px' → 모두 0(behave.revise), 트랙 = 파랑 옅은 단계 → surface-neutral-strong · 게이지는 합성한 색끼리 비교(behave.dataviz — `rgba()` 와 `color(srgb …)` 표기가 달라 글자 비교가 첫 게이트에서 실패).
- **측정에서 드러나 고친 것:** 처음 전체 게이트에서 verify 의 '디자인파트' 검사가 behave.fix25.js 의 검사 문자열 자체를 잡았다(문자열을 나눠 씀). 고정 헤더 단정은 이 사이트의 부드러운 스크롤 때문에 틀을 즉시 스크롤로 보인 뒤 잰다.
- 음성 시험: verify 3건(`aria-selected` 틀림 · 여러 개 아닌 목록의 `data-all` · '디자인파트' 되살림 — 첫 회는 생성 마크업이 `data-all=""` 라 변형이 적용되지 않아 다시 함) · behave 7건(고정 th 면 지움 · th 회색 되살림 · Toast 500 지움 · hover 기본으로 · 전체 분기 끔(4/7) · 검색 중 숨김 끔 · 위저드 보통 항목) · React 4건 모두 잡혔다.
- 캡처: 1440 라이트 · 다크 · 390 에서 Tag 세 크기 · Table · 고정 헤더 스크롤 · 사이드 패널 속성 표 · 대시보드 부서별 패치 · 게이지 · Toast · Combobox 전체를 보았다. 전체 예제의 열린 목록이 미리보기 아래로 넘쳐 뜨는 것은 기존 Multiple 예제와 같은 배치다.
- **고치지 않은 것:** 문서 셸의 문서 표 머리글(`table:not(.tbl) th`)은 회색 그대로(컴포넌트 표가 아님 — 요청 밖). `_figma/font-revert-nodes.tsv` 의 '기획팀 디자인파트'(Figma Home 바닥글 글자 — Figma 몫). `render.js` 의 `#foot` 줄은 생성 페이지에 그 요소가 없어 쓰이지 않는다.
- Figma 미반영 6 → 18건(Home 잘림 · 숨긴 ov-grid 사본 2 제외) — 이번 몫 12: 변수 `chart/mono/track` 값(Figma 는 blue-90 · 20), Tag 세트 높이 2(Medium 22 · Large 26), Spec Tag Size · Container · Label, Spec Data Table · Table Container, Spec Data Visual Color, Rules combobox · 전체 · table · 행 hover · 경계. Toast 굵기 · 머리글 면 · 속성 표 선 · Combobox 전체 옵션은 audit 대조 밖이라 수에 없다.

`advisory 1149` 는 기준 토큰 값을 따르느라, 또는 사람이 결정한 표현(예: 진한 빨강 Count 배지의 다크 흰 숫자) 때문에
우리 기준을 못 넘는 쌍입니다 — **실패가 아니라 선언된 예외**이고 `contrast.pairs.js` 에 이유가 적혀 있습니다.

## 토큰 체계 (v0.8)

- **Atomic** `--{램프}-{단계}` — 램프 13개, **숫자가 클수록 밝습니다**. 컴포넌트에서 직접 쓰지 않습니다.
- **Semantic** `--{그룹}-{하위}-{이름}` — `foreground` · `background` · `surface` · `line` · `effect` · `static`
  여섯 그룹 **90개**(기준 75 + 더한 15) + 트리 밖 20개(`--brand-label` · `--company-mark` · `--company-mark-subtle` · 차트 `--chart-*` 17 — 차트 트랙 2026-11-20. 아바타 12 는 2026-11-24 에 지움) = **110**.
  더한 것 중 6개는 Tag 글자용 `--foreground-{negative|cautionary|accent-light-blue|accent-lime|accent-cyan|positive}-heavy`(2026-11-11),
  5개는 입력 링 `--line-field-focus` · `-halo` 와 AI 면 `--surface-brand-gradient` · `-strong` · `-heavy`(2026-11-14).
- **차트 토큰** `--chart-mono-1~4`(한 톤 — 기본, 제품과 무관한 고정 파랑 명도 단계, 2026-11-15) · `--chart-mono-track`(진행 막대 · 게이지 트랙 — 같은 파랑 옅은 단계, 2026-11-20) · `--chart-series-1~6`(범주색 — tone 없는 계열 5개부터 · 순서 고정 · 제품색과 무관) · `--chart-series-1-subtle`(비교 기간 막대) · `--chart-series-1-strong`(막대 위 선) · `--chart-grid-primary` · `--chart-axis-text` · `--chart-tooltip-surface` · `--chart-tooltip-text` 는
  `ds-chart.js` 가 계산값으로 읽어 캔버스에 칠합니다(허용 목록 `grammarOnly` — mono 는 정적 막대 · 진행 막대 · 도넛 CSS 도 씀). 심각도 계열은 negative-strong · cautionary · accent-light-blue · accent-lime · inactive 토큰 그대로(5단계 — Medium 라이트 블루 · Low 라임, 2026-11-11 교체).
- **제품 색**은 팔레트 일곱(`data.js` PRODUCTS — 기본 파랑 · 제품1 빨강 · 제품2 시안 · 제품3 남색 · 브랜드 주황 · 중립 · AI, 키는 색 이름)에서 고르고 `<html data-accent="키">` 로 적용합니다.
  `--prod-40~60` 다섯 단계로 주입되고 `brand` 계열이 따라옵니다. 상태색과 겹쳐도 제품 색 그대로입니다(자동 중립은 2026-11-14 에 없앰).
  **제품 색 위의 흰 글자가 4.5 를 넘어야 하고 빌드가 검사합니다**(`verify.js`) — 넘지 못하면 `exception` 에 사람의 결정으로 이유를 적습니다(주황).
  삭제 버튼은 모든 제품에서 중립, 입력 포커스 링은 빨강 · 주황 제품만 중립입니다.
- 비활성은 `--surface-disable-primary` · `--foreground-disable-primary` 로 칠합니다. `opacity` 로
  흐리게 하지 않습니다.
- **크기는 rem**(2026-11-11) — 글자는 `--font-size-N` 토큰(12 이하는 최소 크기를 지키는 `max()`), 간격 · 높이 · 반경은 rem 이고
  테두리 · 그림자 · 2px 이하만 px 입니다(`verify`). 기준 화면(루트 16px)에서 px 와 같으므로 Figma 수치는 그대로 읽습니다(`lib.js toPx`).

## Figma

> **Figma 반영 보류는 2026-11-18 에 끝났습니다(사람의 결정 '지금 교체').** 2026-11-09 부터 사이트를 고치는 동안 Figma 를 고치지 않던 임시 규칙을 지웠습니다.
> - 기준 덤프 `_figma/dumps/baseline.json` 을 2026-11-18 의 전체 probe(`dump-b5`, 같은 날 사이드 내비 여백 뒤 `dump-b6`)로 바꿨습니다. 이 덤프로 audit 은 **1건**이고, 그 하나는 Home 히어로 부채꼴을 사이트처럼 일부러 잘라 둔 넘침입니다(어긋남이 아님).
> - **아직 하지 않은 것:** 데스크톱 검토 한 번. Noto 로 그린 글자를 Pretendard 로 되돌리는 일(`_figma/font-revert.md` 끝 절 · `.tsv`)은 사람이 데스크톱에서 합니다. 사람이 검토 전에 기준 덤프를 바꾸기로 정했으므로, 되돌린 뒤의 글자 높이 · 줄바꿈은 기준 덤프에 들어 있지 않습니다.
> - 사이트를 고친 뒤에도 기준 덤프로 audit 을 돌려 ✗ 수(Home 잘림 1건을 뺀 수)를 커밋 메시지에 'Figma 미반영 n건' 으로 적는 습관은 그대로 둡니다. 이제 Figma 는 그때그때 `use_figma`(figma-sync)로 고쳐도 됩니다.
> - 지운 것: 보류 동안의 규칙(Figma 를 고치지 않음 · `probe.js` 수정은 일괄 반영 때 · 끝나는 조건). 위 사이트 항목들의 'Figma 미반영 n건' 은 그때의 기록으로 남겨 둡니다.

파일 `ngyAZOP9Icjzw9KWyl4RdV`. 현재 쓰는 페이지는 사이트 메뉴와 같은 넷 — `Overview`(1184:2) · `Foundations`(302:3) ·
`Components`(302:5) · `Patterns`(302:6)이고, 구분선 `------ 아카이브 ------` 아래는 `(old) …` 다섯과 v0.3 페이지들입니다.

**2026-11-18 Figma 동기화 1단계 — 구성(사람의 결정 넷: 같은 파일에서 옮긴 뒤 사이트 기준으로 고침 · 옛 페이지는 지우지 않고 아카이브 · 구성 먼저, 내용은 2단계 · 썸네일은 빈 이미지 자리).**
이 작업으로 옛 보류 블록의 '끝나는 조건' 이 시작됐고, 2단계 묶음 4 뒤 같은 날 보류를 끝냈습니다(위 인용 블록). 계획은 `~/.claude/plans/composed-tinkering-kahn.md`.
- **옮기기만 했다** — `appendChild` 라 노드 id · 컴포넌트 키가 그대로이고(`components.json` 의 figma 연결 69곳도 그대로), 지운 노드는 없다. Foundations · Components · Patterns 는 옛 1 Theme · 3 Component · 4 Pattern 의 페이지 id 를 그대로 쓰고 이름만 바꿨다. Overview 만 새 페이지다.
- **섹션 = 사이트 메뉴 순서**(스크립트로 대조 — 세 페이지 모두 같음, 섹션끼리 겹침 · 섹션 밖 넘침 0).
  - Foundations: Overview · Colors · Elevation · Grid(Spacing · Grid · Radius 카드) · Icons · Interaction(Motion 카드) · Typography · Writing(빈 섹션). Radius · Motion 은 사이트에서 Resources › Design Token 에 있지만 메뉴가 넷뿐이라 이렇게 뒀다(사람이 정하지 않은 기본값).
  - Components: Overview + 46(알파벳 순 · 그룹 Selection Controls · Table 은 섹션 이름 앞에 `그룹 / `). 없는 15개(Avatar · Code · Copy Field · Empty State · File Upload · Form · Link · Notification Center · Number Input · Page Header · Combobox · Side Panel · Steps · Time Picker · Tree)는 머리말만 있는 섹션. 옛 패턴 '빈 화면' 카드는 Empty State 섹션에 참고로.
  - Patterns: Overview + Common UI 7 · Service Pattern 5 · Security Console 10(`묶음 / 이름`). 없는 12개는 머리말만.
- **세는 값:** Components 페이지 세트 52 · 컴포넌트 738(옮기기 전과 같음), Foundations 컴포넌트 458(아이콘), Patterns 0. 아카이브 페이지의 컴포넌트는 0 — 다만 `(v0.3) Web / Home` 의 세트 1 · 컴포넌트 13 은 원래 거기 있던 것이다.
- **Overview 화면 넷**(1440, 사이트를 헤드리스로 재서 그림) — Overview 화면 `Home · 1440`(1197:66 — 헤더 · 히어로 · 도형 넷 · 바로가기 배너 셋), `Foundations Overview · 1440`(1196:62 — 목록 7), `Components Overview · 1440`(1194:4969 — 카드 46), `Patterns Overview · 1440`(1195:300 — 카드 22).
  카드의 썸네일은 `Thumbnail / <이름>` 사각형(높이 200 · `background/neutral/secondary`)이고 이미지는 사람이 넣는다. 사이드바는 사이트와 같은 항목 · 묶음 · N 배지.
- **새로 만든 로컬 컴포넌트** — Overview 페이지의 섹션 `_Local components`(1193:2): `_Site Header`(1193:183, Active = Home · Foundations · Components · Patterns · None — 사이트 메인은 선택 메뉴가 없어 None) · `_Overview Card`(1193:184, Label · Group · Show group).
- **사이트와 다른 것:** 사이트 카드의 N 배지('Notification CenterN' 처럼 글자에 붙어 보임)는 카드에 넣지 않았다. 본문 문단 안 `code` 글자의 모양은 그리지 않았다. 텍스트 스타일에 묶은 글자는 그 스타일의 행간을 받아 사이트와 다르다(사이드바 항목 16 → Label/1 20, 카드 이름 25.6 → Title/1 24).
  Noto 는 SemiBold 가 없어 600 은 Bold · 800 은 Black 으로 그렸다 — 맞는 스타일이 없는 글자 68개를 `font-revert-nodes.tsv` 끝에 적었다(사람이 데스크톱에서 Pretendard 로). 그래서 '감사 로그 · 변경 이력' 처럼 긴 카드 이름 · 배너 설명이 사이트보다 한 줄 더 간다.
- **도구:** `probe.js` 의 `CURRENT_PAGES` 를 새 넷(id)으로, `swatchPage` · `DOC_PAGES` 를 새 이름으로. `audit.mjs` 는 `DOC_PAGES` 를 새 이름으로 하고 옛 덤프의 페이지 이름을 `PAGE_ALIAS` 로 읽는다(1 Theme · 2 Element → Foundations 등). 기준 덤프로 다시 돌려 **608건 그대로**(바뀐 것은 메시지의 '4 Pattern' → 'Patterns' 10줄뿐).
  **새 덤프는 뜨지 못했다** — `probe.js` 가 99,895자라 `use_figma` 의 코드 한도 50,000자를 넘는다. 2단계 시작 때 probe 를 나눠 돌리는 방법을 정해야 한다.

**2026-11-18 2단계 묶음 1 — 기반(변수 · 텍스트 스타일 · 이펙트, 사람의 결정 셋: 옛 텍스트 스타일은 남기고 차차 옮김 · 19개 + 쓰는 굵기 조합만 · 아바타 토큰은 만들고 대조에도 넣음).** audit 608 → **573**.
- **변수 24개를 새로 만들었다**(Semantic 컬렉션, 값은 atomic 별칭 · 후광만 rgba).
  - Tag 글자 heavy 6, `line/field/focus` · `focus-halo`, `chart/mono/1~4`, `avatar/1~6/surface · text` 12.
  - 범위(scope)는 같은 갈래 변수를 따랐다: heavy = `foreground/negative/strong` 과 같음, 선 = STROKE_COLOR(후광은 + EFFECT_COLOR), 차트 = ALL_FILLS + STROKE_COLOR, 아바타 면 = ALL_FILLS · 글자 = TEXT_FILL.
  - 코드 문법(WEB)은 저장소 이름 `var(--…)` 이다.
- **값을 고친 변수 14개:** `foreground/accent/lime` 라이트 lime-37 → 40, 상태 · accent 틴트 12 → 8%(positive · cautionary · negative · lime · cyan · light-blue · violet · purple · pink), negative strong · heavy · hover · pressed 의 라이트 · 다크 알파(11-13 결정).
- **AI 면 그라데이션 3개는 만들지 않았다** — 값이 linear-gradient 라 Figma 색 변수가 될 수 없다. audit 은 대조에서 빼고 NOTE 로 알린다. AI 주 버튼 · Banner 를 그릴 때 칠에 그라데이션을 직접 준다.
- **텍스트 스타일 19개를 Noto Sans KR 로 만들었다**(이름은 audit 기대값 그대로 — `Display 1` … `Body 1/Normal` … `Caption 2`, 자간은 % 로). **사람이 데스크톱에서 Pretendard 로 되돌릴 목록**은 `_figma/font-revert.md` 끝 절이다. 쓰는 노드는 아직 0이고, 옛 19개(`Title/1` 등)는 그대로다.
- **이펙트 스타일은 어긋남이 없었다**(바꾸지 않음).
- **audit 도구:** `tokens()` 가 `--avatar-N-*` 를 `avatar` 로 읽고, diff 가 차트처럼 목록 · 값(별칭)을 대조한다. 그라데이션 셋은 semantic 기대값에서 빼고 NOTE 로 남긴다. 그래서 기준 덤프로 돌리면 609건이다(그라데이션 줄 −1 · 아바타 없음 +1 · 기대값 줄 바뀜).
- **덤프 뜨는 법(이번에 정함):**
  - 바뀐 것이 변수 · 스타일뿐이라 probe 의 맨 앞(변수 · 텍스트 · 이펙트 스타일 · 게시 숨김)만 같은 식으로 읽었다.
  - 그 결과를 기준 덤프에 덮어 audit 을 돌렸다(`components` 등은 기준 덤프 그대로).
  - 전체 probe 는 esbuild 로 줄이면 47,128자라 한도 안에 든다(`globalThis.__p=async()=>{…}` 로 감싸 줄인 뒤 감싼 것을 떼어 냄). 다만 돌려받는 JSON 이 약 427KB 라 대화에 다 들어오지 않는다. 묶음 2 에서는 `components` 를 컴포넌트 묶음별로 나눠 받는 방법을 쓴다.
- 남은 573건은 컴포넌트 · 문서 틀의 대조다. 텍스트 스타일 이름(옛 `Title/1` → 새 `Body 1/Normal SemiBold` 등)이 큰 몫이고, 묶음 2 에서 고친다.

**2026-11-18 2단계 묶음 2 — 기존 컴포넌트 31개.** audit 573 → **386**(마지막 덤프 `dump-b2f`). 그 뒤에 Breadcrumb Hover · 섹션 간격을 고쳐 Figma 에서 직접 확인했고(다른 항목 1개 · 간격 모두 200), 덤프로는 다시 재지 않았다. 고쳤으니 4건이 줄어 382 가 될 것으로 본다.
- **텍스트 스타일을 새 19단계로 옮겼다.**
  - 굵기 조합 7개를 만들었다(쓰는 것만 — 사람의 결정): Body 1/Normal SemiBold · Medium, Label 1/Normal SemiBold, Label 1/Reading Regular, Caption 1 Regular · SemiBold, Caption 2 SemiBold.
  - SemiBold 는 Noto 에 없어 Bold 로 그렸다 → `_figma/font-revert.md` 끝 절.
  - 옛 스타일을 쓰던 노드를 새 스타일로 옮겼다: 먼저 3,812개, 끝에 인스턴스 안쪽 글자 141개(Components 88 · Patterns 53). 옮긴 짝은 Label/2 → Caption 1, Body/2 → Label 1/Reading, Title/1 → Body 1/Normal SemiBold 등이다.
  - 이제 현행 네 페이지에서 옛 19개를 쓰는 노드는 0이다. 옛 스타일 자체는 아카이브 페이지가 쓸 수 있어 지우지 않았다(5단계에서 정리).
- **컴포넌트 고친 것:**
  - KPI 증감 배지 구조 · Navigation · Steps · Indicator · Breadcrumb · 포커스 링 · Chip 지우기 · Card 빈 상태 아이콘.
  - 달력: Today · Preview End, In-range · Preview 모서리 0.
  - 심각도 다섯 색 · 차트 한 톤(mono) · 스피너 크기와 색.
  - 검은 기본 칠이 남은 노드 59개를 토큰으로.
  - **Tag 세트(81변형):**
    - 높이 18 · 22 · 26, 여백 2/8 · 3/10 · 5/12.
    - 글자는 톤마다 heavy 색이고 sm 은 Caption 2 SemiBold, 나머지는 Caption 1 SemiBold 다.
    - Outline 은 톤의 선 토큰, Solid Critical 은 negative strong 면 · 선, accent 는 brand 면 + brand-label 이다.
    - Neutral 열을 더했고, 점은 기본에서 껐다.
    - 측정에서 드러난 것: 안쪽 선이 레이아웃에 들어가 Outline · Solid 가 2px 높았다(`strokesIncludedInLayout=false`).
  - Indicator 섹션이 넘쳐 2518 로 늘리고, 아래 섹션 31개를 +82 내려 간격 200 을 지켰다.
  - Chart 세트(992:4826)가 넘치고 변형이 겹쳐 다시 배치했다(1040 × 1448).
- **저장소 쪽:**
  - `components.data.js` 의 Tag `figma` 를 사이트 CSS 대로 고쳤다(`solidFg` 톤마다 heavy, 크기 18 · 22 · 26). audit 이 '사이트 CSS 와 다름' 으로 멈췄다.
  - `audit.mjs` 를 고쳤다.
    - 심각도 Tag 기대값을 톤마다(label · outline) 읽는다.
    - Mixed 차트 막대 · 선 색을 mono 규칙으로 나눠 기대한다.
    - 정적 도넛 각도는 대시보드에 정적 도넛이 남아 있을 때만 잰다.
    - `var(--dN)` 정지점을 `.donut` 규칙에서 풀어 읽는다.
  - `probe.js kpiRead` 는 숨긴 증감 배지가 인스턴스 children 에서 빠져도 증감 없음으로 읽는다.
- **덤프 뜨는 법(정함):**
  1. esbuild 로 줄인 probe 를 PNG tEXt 덩어리에 넣어 `upload_assets` 로 올린다.
  2. 플러그인에서 풀어 돌리고, 결과 JSON 을 조각으로 `setSharedPluginData("jsds.probe","dN")` 에 둔다. 조각 경계는 공백을 피한다 — 읽는 쪽이 끝 공백을 잘라 길이가 1 어긋난 적이 있다.
  3. 조각을 받아 이어 붙이고 길이 · 해시를 대조한 뒤 audit 을 돌린다.
- **남은 386건:**
  - 문서 틀 269 · Spec 107 → 묶음 4.
  - Chart 의 Gauge · Spark 변형 없음과 Data Visual 예시 순서, 대시보드 패턴의 차트 줄(사이트는 막대 + 진행 막대) → 묶음 3.
  - Date Picker 의 Type=Button 18변형(사이트에서 2026-11-09 에 없앰) — **지웠다**(사람의 결정 '입력형으로 바꾸고 삭제'). 문서 예시의 인스턴스 4개는 같은 크기 · 상태의 Type=Input 으로 바꿨다. 값 글자는 그대로이고, 폭은 240 → 260 이다. 남은 `textAutoResize` override 가 기간 값을 가운데로 띄워 채움으로 되돌렸고, 굵기는 메인과 같은 Label 1/Reading Regular 로 맞췄다. 세트 위의 빈자리 577 · 섹션 높이를 줄이고 아래 섹션 37개를 올려 간격 200 을 지켰다(넘침 0). 이 1건은 덤프로 다시 재지 않았다.
  - Home · 1440 위 +146 은 히어로 부채꼴(1197:68)을 사이트처럼 일부러 잘라 둔 것이다.

**2026-11-18 2단계 묶음 3 — 새 컴포넌트 15개 · 새 패턴 12개.** audit 386 → **362**(마지막 덤프 `dump-b3c`).
- **362 의 내역:** 문서 틀 269 · Spec 92 는 묶음 4 몫이다. 나머지 1건은 Home 히어로 부채꼴을 일부러 잘라 둔 넘침이다. 컴포넌트 · 패턴 · 차트 · 변수 대조의 어긋남은 0 이다.
- 같은 날 다른 세션의 사이트 수정(버튼 스피너 16 · 20 · 28, 대시보드 '일별 탐지' 선 추이, `radius/xl` 14)이 이 묶음 중에 들어왔다. 그 몫도 여기서 맞췄다.
- **새 컴포넌트 15개** — 1단계에서 머리말만 있던 섹션마다 Spec 카드와 세트를 그렸다(Avatar · Code · Copy Field · Empty State · File Upload · Form · Link · Notification Center · Number Input · Page Header · Combobox · Side Panel · Steps · Time Picker · Tree). 'Spec 카드 없음' 15건이 없어졌다.
- **Chart 세트에 Gauge · Spark 변형을 더했다.**
  - Gauge 는 지름 310 의 호(ELLIPSE `arcData`) 둘을 'Gauge' 프레임으로 잘라 반원을 그린다.
  - 호를 평평한 벡터로 바꾸면 audit 이 호를 읽지 못한다(호 0개 · 영역 2개로 나옴). 그래서 audit 이 잘린 Gauge 프레임만 넘침에서 뺀다.
- **패턴 카드 12개** — 오류 · 권한 없음 · 위험 작업 확인 · 가져오기 · 내보내기 · 일괄 작업 진행 · 로그인 · 세션 · 보고서 · 예약 발송 · 상세 화면 · 권한 · 역할 · API 키 · 비밀값 · 사고 처리 · 감사 로그 · 변경 이력 · 알림 규칙.
  - 패턴 카드 틀(336:6)의 '사용 가이드' 자리는 사이트처럼 'Rules' 목록이다(항목 이름 · 설명 두 칸).
  - 예시는 기존 컴포넌트 인스턴스로 조합했다. 예시 설명이 사이트에 비어 있는 사고 처리 · 알림 규칙은 내가 썼다(사람이 정하지 않음).
  - Patterns 페이지는 섹션 23개 · 간격 200 · 넘침 · 겹침 0 이다.
- **대시보드 '일별 탐지'** = 프레임으로 그린 선 추이다. 계열 하나 · 옅은 영역(chart/mono/1, 24%) · x 눈금 14개이고 범례는 없다.
  - Chart 세트의 Timeseries 변형은 Data Visual 'timeseries' 예제(심각도 누적)를 그리므로 쓰지 못한다.
  - `probe.js lineCard` 가 프레임 차트를 늘 bar 로 읽었다. 이제 사각형 없이 '<계열> Line' 벡터만 있으면 timeseries 로 읽는다.
- **그 밖에 고친 것:**
  - Button loading 스피너 md 20 · lg 28 — 34변형을 가운데로 다시 놓았다. 크기만 바꾸면 왼쪽 위 기준으로 커져 '가운데 아님' 34건이 났다.
  - `radius/xl` 10 → 14.
  - Select 컴포넌트의 Trigger 를 FILL 로 했다(5변형 — 인스턴스 폭이 240 고정이었다).
  - Number Input 카드 폭 920 → 1176. 세트 952 가 카드 본문 밖으로 208 넘쳤다.
  - 필수 별표 4개의 색을 `foreground/negative/strong` 으로, Form Spec 'Actions' 행을 저장소 문구로 바꿨다.
- **audit 도구:** Spark 예제의 제목을 앞의 정적 스파크 KPI(캔버스 없음)에서 읽던 정규식을 고쳤다.
- **알고 남긴 차이(인스턴스 · 세트가 못 하는 것):**
  - Figma Notice 는 아직 테두리가 있다(사이트는 없음 — 묶음 4 의 Notice 세트에서).
  - 로그인 칸에 앞 아이콘이 없다(Text Field 세트에 아이콘 슬롯이 없음).
  - 상세 화면 Page Header 에 ⋯ 버튼이 없다.
  - 사고 처리 메모 칸은 한 줄이다(Text Field 에 textarea 변형이 없고 인스턴스 안 높이는 바꿀 수 없음).
  - List Item 앞 아바타는 18 이다(사이트 24 — 인스턴스 안 크기를 바꿀 수 없음).
  - Button lg 아이콘 선 1.6 은 그리지 않았다(audit 대조 밖).
- **덤프 뜨는 법 보탬:**
  - 한 번에 돌려받는 한도는 48,000 **바이트**다. 한글이 섞이면 45,000자 조각이 넘친다. 조각을 UTF-8 40,000바이트로 자른다.
  - 올린 probe 이미지는 이미지를 받친 노드를 지운 뒤 다음 호출에서는 `getImageByHash` 가 null 이다. 덤프마다 다시 올린다.
  - PNG 는 1×1 IHDR 에 `tEXt`(키 `c`)로 줄인 probe 를 넣는다(`esbuild --minify --charset=ascii` 라 글자가 ASCII).

**2026-11-18 2단계 묶음 4 — 문서 틀 · 고르기 표 · Rules · 세트 넷(사람의 결정 넷: 컴포넌트 카드를 사이트 순서로 다시 짬 · 패턴 카드도 Rules 와 고르기 표 · 세트 넷 모두 넓힘 · 옛 빈 화면 카드는 아카이브로).** audit 362 → **1**(덤프 `dump-b4b` — Home 히어로 부채꼴을 일부러 잘라 둔 넘침 하나).
- **컴포넌트 카드 46개** — 패널을 사이트 순서로: 고르기 표(언제 쓰는가 · 비슷한 것 · Placement) → 예제 → Rules → Spec. Do/Don't 를 Rules 로 바꾸고, 행 수는 데이터의 `principles` 와 같다(묶음이 있으면 소제목). 모든 Spec 패널에서 Placement 행을 지웠다. Placement 는 이제 고르기 표에 있다.
- **패턴 카드 22개** — 고르기 표(언제 쓰는가 · 비슷한 패턴)와 Rules. 고르기 표 행은 컴포넌트 카드와 같은 모양이다(행 사이 20 · 이름 칸 140 · 선 없음). 처음엔 패턴 쪽만 행 목록이 한 겹 더 있었고 Rules 처럼 선 · 위아래 12 를 줘서 probe 가 두 행을 한 행으로 읽었다(어긋남 44). 행을 패널로 올리고 모양을 맞춘 뒤 섹션 높이를 다시 맞췄다(간격 200 · 넘침 0).
- **옛 '빈 화면' 패턴 카드**는 Components › Empty State 섹션에서 아카이브 페이지 `(old) Patterns Overview`(829:4419)로 옮겼다. 지우지는 않았다.
- **세트 넷을 넓혔다:**
  - Text Field 25변형 — 칸 안 앞 아이콘 슬롯, Type=Textarea(Medium × Default · Focused · Error · Disabled, 높이 96 = `.field textarea` 의 min-height). 크기가 셋인 한 줄 입력과 달리 Textarea 는 Medium 하나뿐이다.
  - List Item 12변형 — 앞 아바타 24.
  - Page Header 3변형 — ⋯ 동작 버튼(More).
  - Button lg 아이콘 선 1.6.
  - 넘침을 맞추느라 Text Field 세트를 3열(폭 1072)로, Page Header 변형을 632(세트 696)로, List Item 세트 여백을 32(1048)로, List 카드 본문을 1144 · 카드를 1272 로 넓혔다.
  - 복제한 변형은 `componentPropertyReferences` 를 잃어 인스턴스에서 앞 요소가 안 보였다. 원래 변형에서 노드 경로로 다시 이었다.
- **새 세트를 쓴 예제:** 로그인 칸의 앞 아이콘, 사고 처리 메모 = Textarea · 처리 기록 아바타 24, 상세 화면 Page Header 의 ⋯ — 묶음 3 의 '알고 남긴 차이' 넷(로그인 아이콘 · 메모 한 줄 · ⋯ 없음 · 아바타 18)과 Button lg 선을 이것으로 고쳤다.
- **Notice 세트 다섯 변형을 사이트대로**(audit 대조 밖이라 끝에 찾아 고침): 테두리 없음, 위아래 여백 14 → 20(높이 74 → 84), Neutral 면 `surface/elevated/primary` → `background/neutral/secondary`. 아이콘은 outline → filled(info-circle · circle-check · alert-triangle · alert-circle)이고, Neutral 아이콘은 시안 → `foreground/neutral/secondary` 다. 바꾼 아이콘에 남은 선은 지웠다(원본 filled 아이콘은 선이 없음). 세트 넘침 0 은 스크린샷으로 확인했다. 이 수정 뒤에 덤프를 다시 뜨지 않아, 일반 검사(raw 색 · 넘침 등)는 이 다섯 변형을 다시 재지 않았다.
- **audit 도구:**
  - `specExpect` 는 Placement 를 빼고 `spec` 만 기대한다.
  - 새 `docTextExpect()` 는 두 데이터 파일의 `choose` · `principles` 를 읽는다. 카드는 한글 이름으로 패턴을, 그 밖은 컴포넌트를 짝짓는다. 고르기 표는 행 이름으로, Rules 는 '묶음 / 이름' 으로 대조하고 저장소에만 · Figma 에만 있는 행, 없는 패널, 사이트에 없는 Rules 패널을 잡는다.
  - Text Field 입력칸 높이는 Textarea 변형이면 `textarea` 의 min-height 와 대조한다(같은 날 크기 셋으로 — 아래).
- **probe 도구:** `components.docText` — `Card/*` 의 고르기 표 · Rules 패널(패널 = 제목 글자가 패널 이름과 같은 프레임)을 `[이름, 글, 글 id]` · `[묶음, 이름, 글, 글 id]` 로 읽는다.
- **덤프 뜨는 법(정함):**
  1. 줄인 probe 를 담은 PNG 를 `upload_assets` 의 주소로 `curl -F file=@…` 올린다.
  2. 플러그인이 `getImageByHash` 로 읽어 길이 · 해시를 대조하고 받친 노드를 지운 뒤 돌린다.
  3. 결과 조각(UTF-8 40,000바이트 이하)을 `setSharedPluginData("jsds.probe","dN")` 에 둔다. 하위 에이전트 둘이 조각을 읽고, 그 기록에서 이어 붙여 길이 · 해시를 대조한다.
- **이번 수의 근거:** 전체 probe(`dump-b4`)로 49건이었다. 패턴 고르기 표 44건은 위의 행을 올린 뒤 같은 probe 코드로 패턴 카드만 다시 읽어 덤프에 덮었다(`dump-b4b`). Textarea 4건은 audit 기대값을 고친 것이다. 행을 올린 뒤 전체 probe 는 다시 돌리지 않았다.
- **같은 날 Textarea 크기 셋 · 다시 잰 전체 probe(`dump-b5`)** — audit **1**(Home 히어로 부채꼴 하나).
  - Text Field 세트에 Type=Textarea 의 Small · Large(각 Default · Focused · Error · Disabled)를 더해 33변형(1072 × 1724)이 됐다. 높이는 72 · 120 이고 글자 · 반경은 같은 크기 입력과 같다(사이트 항목 '2026-11-18 Textarea 크기 셋'). Small 입력칸의 반경도 4 로 맞췄다.
  - audit 은 Textarea 를 크기마다 `.field.sm` · `.field` · `.field.lg` 의 `textarea` min-height 와 대조한다.
  - 이 probe 는 패턴 고르기 표를 올린 것 · Notice 세트 다섯 변형 · Textarea Small · Large 를 모두 다시 쟀다.
  - 덤프를 이을 때 조각 6 끝의 공백 하나가 잘려 길이가 1 모자랐다('점 자리' → '점자리', Notification Center Spec 1건이 거짓으로 남). 그 공백을 되살리니 길이 · 해시가 probe 의 값과 같았다. 조각 경계는 여전히 공백을 피해야 한다.

**2026-11-19 Components Overview 카드 썸네일 = SVG 컴포넌트(사람의 결정 셋: 원본은 ov-grid 의 사이트 썸네일 · 썸네일을 컴포넌트로 만들어 교체 속성 · 글자는 윤곽선).**
- **시작할 때의 상태:** `Components Overview · 1440`(1194:4969)의 원래 카드 격자 `Grid`(1194:5134)는 숨겨져 있었다. 그 아래에 사이트 썸네일을 편집 가능한 레이어(Pretendard)로 담은 `ov-grid`(1325:5462)와 SVG 시험 `Accordion 1`(1325:5438)이 있었다(1단계 뒤에 사람이 넣은 것).
- **썸네일 컴포넌트 47개** — Overview 페이지 `_Local components` › `Thumbnails`(1331:133, 5열 자동 배치). `Thumbnail / Empty`(회색 면)와 `Thumbnail / <이름>` 46개(265 × 200, clip, 면 = `background/neutral/secondary`).
  - 그림 `Art` 는 ov-card 썸네일을 `exportAsync({format:"SVG_STRING", svgOutlineText:true})` → `createNodeFromSvg` 로 만들었다. 맨 앞 260 × 200 배경은 지웠다(컴포넌트 면이 대신함). 가로로 +2.5 옮겨 가운데에 둔다. 윤곽 글자는 Pretendard 모양 그대로 나왔다(스크린샷 확인).
  - 칠은 raw 색이라 **라이트로 고정**된다. 면만 변수에 묶었다.
  - 배경 지우기는 '맨 앞 자식이 260 × 200 이고 자식이 없을 때만' 이다. Navigation · Page Header 는 썸네일이 clip 이라 SVG 가 clip 묶음 하나로 나왔다. 처음에 묶음째 지워 빈 그림이 됐고, 묶음 안 배경만 지워 다시 만들었다.
- **`_Overview Card`(1193:184)** — 빈 `Thumbnail` 프레임 자리에 `Thumbnail / Empty` 인스턴스(이름 Thumbnail · 폭 FILL)를 두고 INSTANCE_SWAP 속성 `Thumbnail#1332:0` 을 더했다(preferredValues 47). 카드 46개는 **라벨 글자로** 짝지어 이 속성을 바꿨다 — 46/46, 어긋남 0(스크립트로 대조).
- **ov-grid 의 이름 어긋남 셋(손대지 않음):** 5 · 6번째 카드의 이름이 둘 다 'Card'(라벨 Card · Code)이고, 둘 다 맨 앞에 어긋난 `ov-card / Breadcrumb` 사본(260 × 247, y −277)이 끼어 있다. 7번째는 이름 'Data Visual' · 라벨 'Copy Field' 다. 썸네일은 '이름이 ov-card 가 아닌 260 × 200 프레임' 으로 골랐다.
- **보이기 정리:** `Grid` 를 다시 보이고 `ov-grid` 는 숨기기만 했다. `Accordion 1` 은 격자 배치를 밀어내서 Overview 섹션 안 오버뷰 프레임 오른쪽으로 옮겼다. 지운 것은 없다.
  - 섹션 폭을 1640 → 1980 으로 늘렸다. 오버뷰 프레임 높이는 ov-grid 에 맞춰 4984 였는데, 격자 + 100 인 4828 로 줄였다. 섹션 높이는 5188 이다.
  - Overview → Accordion 섹션 사이가 355 였다(이전부터). 아래 섹션 46개를 올려 200 으로 맞췄다. 페이지의 모든 섹션 간격은 200 이고, `_Local components` 섹션은 3248 로 늘렸다.
- **잰 것:** probe 의 넘침 · 겹침 식을 Overview · Components 두 페이지에 그대로 돌렸다. 새로 만든 노드는 0건이다.
  - 나온 것은 Home 잘림(기준값) · Gauge(audit 이 뺌)와, 이전부터 있던 셋이다: Overview 의 `Thumbnail` 프레임(1316:6500, 사이트 메인 그림 — 아래로 99), 숨긴 ov-grid 의 Card · Code 카드(어긋난 사본 — 오른쪽으로 290). probe 는 숨긴 조상을 건너뛰지 않으므로, ov-grid 를 지우거나 사본을 치우기 전까지 audit 에 2건이 더 나올 수 있다.
  - **전체 probe 덤프 · audit 은 다시 돌리지 않았다.** 썸네일 컴포넌트에는 글자 · 세트 변형 · 변수 어긋남이 없어서, audit 이 대조하는 항목에 들지 않는다고 보았다.

**2026-11-23 Figma 미반영 65건 반영(사람의 요청 '피그마에도 미반영 65건 반영해줘' — 2026-11-20 차트 마크 · 툴팁 · 대시보드 둘로 · 디자인 검토 P2 몫).** 65건은 모두 없어졌다. 다시 잰 전체 probe(`dump-c1`)로 audit 은 33건이고, 이번 반영과 무관한 것만 남았다(아래).
- **변수** `chart/mono/track`(라이트 blue-90 · 다크 blue-20)을 만들고 진행 막대 · 게이지 트랙을 묶었다.
- **Chart 세트** — 막대는 값 쪽 끝만 4 · 바닥 각짐 · 최대 24(Bar · Mixed), 영역 불투명도 0.1, 툴팁 행 = 짧은 선 키 + 값(굵게) + 계열 이름(옅게), 선 차트 Hover 에 세로 기준선 `Crosshair`(1px). KPI 스파크라인 끝 모서리 4.
- **글 · 행** — Data Visual Spec 둘 · Rules 일곱, Select Spec Size, 대시보드 고르기 표 · Rules('기간' → '필터 없음'), 위험 작업 확인 Rules '이름 입력', Navigation Rules '좁은 화면', 달력 Day Hover 면 tertiary, 패턴의 '필수' Tag 톤 accent.
- **대시보드 패턴** — 머리의 기간 Select Button 을 지웠다.
- **분석 · 리포트 패턴 카드**(Patterns 섹션 1361:6753) — 고르기 표 · Rules 와 예제 기본 한 장: 필터 줄(기간 Date Picker 300 + 심각도), KPI 넷, 일별 탐지 추이(심각도 누적 막대 · 범례 다섯), 유형별 탐지(가로 막대 mono-1) · 탐지 경로(도넛 mono-1~4, 가운데 1,309), 유형별 상세 표(증감 배지). 섹션 높이 3073 이고 아래 섹션 아홉을 내려 간격 200 을 지켰다.
- **다시 잰 덤프에서 찾아 고친 것:** 선 차트 Hover 의 Crosshair 가 `rotation -90` 이라 기준선 위가 아니라 아래로 그려져 Hover 프레임 밖으로 92 넘쳤다 — `rotation 90` 으로 그림 영역(y 15 ~ 174)을 덮게 했다(스크린샷 확인). 이 한 건은 덤프의 넘침 목록에서 지운 뒤 기준 덤프로 삼았다.
- **기준 덤프** `_figma/dumps/baseline.json` 을 `dump-c1`(그 한 건을 지움)로 바꿨다.
- **남은 33건(이번에 고치지 않음):**
  - Home 히어로 부채꼴 잘림 1(기준값).
  - 숨긴 ov-grid 의 Card · Code 카드에 낀 어긋난 사본 2 — 11-19 항목에 적어 둔 것이 이번 덤프에서 실제로 나왔다(사람이 넣은 프레임이라 손대지 않음).
  - Card 제목 굵기 30 — 데스크톱에서 'SemiBold' 스타일 넷(Body 1/Normal · Label 1/Normal · Caption 1 · Caption 2 SemiBold)의 서체가 **Pretendard Bold** 로 되돌려졌다. `font-revert.md` 의 목록은 Pretendard SemiBold 다. audit 은 Card 제목에서만 굵기를 대조해 30건으로 드러났고, 같은 스타일을 쓰는 다른 글자도 700 이다. 에이전트 환경에는 Pretendard 가 없어 사람이 데스크톱에서 고친다.
- **같은 날 사람이 SemiBold 스타일을 고쳤다** — 새 텍스트 스타일 28개가 모두 이름의 굵기와 같은 Pretendard(SemiBold 다섯 = Pretendard SemiBold)이고 Card 제목 30개도 Pretendard SemiBold 다(플러그인으로 확인). 전체 probe(`dump-c2`, 길이 · 해시 대조)를 다시 떠 기준 덤프로 바꿨고 **audit 은 3건**이다 — Home 잘림 1 · 숨긴 ov-grid 사본 2. Card 제목 30건은 없어졌다.
- **audit · probe 도구:** 툴팁 행을 키 · 값 · 이름으로 읽고 대조한다(값 굵기 600 · 이름 72% 400 · 키는 짧은 선), crosshair 를 읽어 색 · 굵기를 대조한다(격자 목록에서는 뺌), 막대 모서리는 값 쪽 끝만(누적은 마지막 조각만), 네 귀를 따로 적은 `border-radius` 는 가장 큰 귀로 읽는다.
- **덤프 뜨는 법**은 묶음 4 와 같다(줄인 probe 를 PNG tEXt 로 올림 → 조각을 `jsds.probe` 에 → 하위 에이전트 둘이 읽어 이어 붙이고 길이 · 해시 대조).
- **그리지 않은 것:** 분석 패턴의 불러오는 중 · 빈 결과 예제(사이트에는 있음 — audit 은 예제 수를 대조하지 않는다).

**2026-11-24 Figma 미반영 95건 반영(사람의 요청 '피그마에도 미반영 95건 반영해줘' — 11-23 메뉴 · Combobox · 표 글자와 11-24 추가 수정 열하나의 몫).** 95건은 모두 없어졌다. 다시 잰 전체 probe(`dump-c3`, 15조각 · 길이 · 해시 대조)로 **audit 은 3건**이다 — Home 잘림 1 · 숨긴 ov-grid 사본 2(기준값).
- **막대 각짐** — Chart 세트(992:4826) · Chart Card(330:2424) · KPI(330:2345)와 대시보드 · 분석 패턴의 막대 · 스파크라인 · 진행 막대 트랙 사각형 95개의 모서리를 0 으로.
- **Avatar 중립** — Avatar 세트의 면을 `surface/neutral/secondary` · 글자를 `foreground/neutral/secondary` 로 다시 묶고 변수 `avatar/1~6/surface · text` 12개를 지웠다. **Tone=1 ~ 6 변형은 남겼다**(이제 모두 같은 색 — 지우면 인스턴스가 끊김, audit 대조 밖). 일괄 정리 때 변형을 하나로 합칠지 묻는다.
- **글** — 컴포넌트 카드 14개(Button · Dropdown · Select · Combobox · Tab · Popup · Side Panel · Loading · Data Table · Table · Data Visual · Empty State · Form · Avatar)의 고르기 표 · Rules(묶음 다시 짬) · Spec, 패턴 카드 셋(오류 · 권한 없음 · 대시보드 · 분석 · 리포트)의 고르기 표 · Rules 를 저장소 글로. 기대 글은 PNG tEXt 로 올려 `jsds/expect` 에 두었다가 끝에 지웠다.
- **측정에서 드러나 고친 것:** 새 행을 숨긴 복제 원본에서 복제해 31행이 숨은 채였다(스크린샷에서 발견 — probe 는 숨은 행도 읽어 audit 으로는 안 보인다). 보이게 하고 늘어난 카드에 맞춰 Components 섹션 13개를 늘리고 간격 200 을 다시 맞췄다(넘침 0).
- **audit 대조 밖이라 그리지 않은 것:** Tab 글자 15 · 13, 대시보드 기간 Select Button, Tree 고른 숫자, Card Radio 고른 제목, 차트 머리 · 증감 가운데, Pagination 아이콘 가운데, 막대 그라데이션 예제, 메뉴 체크 · 라디오 · 적용 영역 · Select 여러 개 · Combobox 가로 스크롤(11-23).
- **덤프 뜨는 법 보탬:** 하위 에이전트의 기록에서 use_figma 결과는 JSON 문자열이 아니라 날 글자다(이어 붙이는 스크립트가 둘 다 받게).

- `use_figma` 를 부르기 **전에 `/figma-use` 스킬을 반드시 불러옵니다.**
- 텍스트를 만들거나 고칠 때는 `_figma/font.js` 의 `makeFont()` 만 씁니다.
- 조사는 `_figma/probe.js` 를 붙여 넣고, 결과를 `node _figma/audit.mjs diff <덤프>` 로 대조합니다.
- **값이 다르면 저장소를 따릅니다.** 사이트가 틀린 경우에만 반대로 가고, 그때는 왜 그런지 밝힙니다.

### 텍스트 편집 — Pretendard 없이 하는 법과 주의점

**에이전트가 쓰는 Figma 플러그인 환경에는 Pretendard 가 없습니다**(보이는 1,938 패밀리 중 0건).
2026-10-22 에 텍스트 스타일 14단계(지금 저장소는 19단계 — 2026-11-12. Figma 는 2026-11-18 에 새 19개를 Noto 로 만들었고 옛 스타일도 남아 있다)를 `Noto Sans KR` 로 대체해 저장소 값(크기·행간·자간)으로 교정했고,
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
