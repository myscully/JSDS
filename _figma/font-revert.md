# Pretendard 되돌리기 표

> **상태(2026-10-22 마지막 확인)**
> - 텍스트 스타일 14단계 · Heading/0 은 **사람이 데스크톱에서 직접 Pretendard 로 되돌렸다**(크기·행간·자간은 교정값 그대로).
> - 그 뒤 사람의 결정("보류 사항은 Noto 로 우선 수정, 나중에 사람이 Pretendard 로")에 따라 에이전트가 Noto 로 고친 것:
>   - 글자 노드 10개 — Tag 목록 라벨 6 · 로그 뷰어 새 행 4. 서체를 바꾸며 스타일 연결이 풀렸으니 되돌릴 때 원래 스타일(Label/2 · Body/2)에 다시 연결한다
>   - **Caption/0 스타일** 1개 — 서체만 Noto Sans KR Medium(크기 13 · 행간 140% 그대로). 스타일만 Pretendard Medium 으로 되돌리면 쓰는 노드 11개(3 Component Tooltip 10 · Web / Home 1)가 따라온다
>   - 노드 id · 원래 서체/스타일 · 바뀐 글자: `_figma/font-revert-nodes.tsv`
> - 이 일과 무관하게 Noto 로 남은 현재 페이지 노드: Overview(302:2) 의 305:1788 · 305:1790(Regular, 스타일 없음). Resource 는 0
> - **스타일에 연결할 후보 210개**(연결하지 않음): 크기·굵기·행간이 14단계와 같은데 스타일이 없는 노드 —
>   1 Theme 200(Heading/3 27 · Heading/4 15 · Label/2 79 · Caption/2 79), 3 Component 6, 4 Pattern 4. 목록은 `_figma/font-link-candidates.tsv`(자간은 비교하지 않았다)
> - 2026-10-23: Count · Steps · 내비 · 도넛을 저장소에 맞추며 글자 **내용**을 바꾼 17개가 Noto 로 바뀌었다
>   (도넛 값 5 · Steps 4번째 항목 4 · 내비 라벨 8). `font-revert-nodes.tsv` 아래쪽에 이어 적었다
> - **글자 굵기**가 저장소와 다른 노드 112행(2026-10-23 k2 에 다시 셈 — j 에는 120행), 9종 — 건수 숫자(Count·Step·내비) → 700 47 · Step 라벨 Current → 600 6 · Done·Todo → 400 16 ·
>   내비 Selected → 600 5 · Sub → 500 8 · 그룹 → 600 4 · KPI delta → 600 12 · Chart Card 제목 → 600 6 · 범례 값 → 700 8.
>   `_figma/font-weight-todo.tsv`. "원본" 행을 고치면 인스턴스가 따라오고, "서체 덮어씀" 행은 따로 고친다. Pretendard 가 있어야 바꿀 수 있다.
>   목록 밖에 하나 더: 도넛 가운데 값 330:2381 도 700 이어야 한다(지금 Noto Sans KR Medium — 목록 머리 주석)
> - 2026-10-23 k: Properties 값 칩 3개(Pressed 582:3 · Pulse 582:5 · Sparkline 582:7)를 옆 칩을 복제해 만들며 Noto Sans KR Medium 으로 썼다(사람의 결정). 원래 서체·스타일은 Pretendard Medium · Caption/1 — `font-revert-nodes.tsv` "2026-10-23 k" 절
> - 2026-10-23 k2: Steps · 내비를 사이트 예제(Indicator steps · Navigation basic)에 맞추며 글자 내용을 바꾼 노드 **10개가 새로 Noto** 가 됐다 —
>   Steps 라벨·번호 8(559:3052 · 3057 · 3061 · 3069 · 3074 · 3078 안) · 그룹 라벨 '보호' 332:2809 · 새 foot 글자 589:105(되돌릴 서체 Pretendard Regular 12 · 행간 19.2px, 맞는 14단계 스타일 없음).
>   j 절 노드 6개는 이미 Noto 라 글자만 다시 바뀌었고, j 절의 I560:3095;332:2732('리포트')는 항목째 지웠다. 문서용 인스턴스 속 Noto 21개(332:2900 안 9 · 333:3344 안 6 · 333:3365 안 6)는 이 덮어쓰기를 따른다.
>   `font-revert-nodes.tsv` "2026-10-23 k2" 절. 굵기 목록 `font-weight-todo.tsv` 도 이때 다시 셌다(120 → 112행 — 지운 노드 4 · Step 상태를 바꿔 하위 노드가 바뀐 행 −16 +12)
> - 2026-10-26 k3: 문서 카드 Spec 글 3개를 사이트 spec 행과 같게 고치며 **Noto Sans KR Regular** 로 바뀌었다(사람의 결정 — 정해진 2곳만) —
>   Card/Navigation Size 332:3052 · Label 332:3058, Card/Indicator Label 333:3265. 원래 서체·스타일은 셋 다 Pretendard Regular · Body/2.
>   `font-revert-nodes.tsv` "2026-10-26 k3" 절. 같은 때 내비 항목 높이 · 그룹 칸을 사이트 실측에 맞췄지만 글자 노드는 건드리지 않아(칸의 높이 · 여백만) 굵기 목록은 그대로다
> - 2026-10-26 k4: 문서 카드 Spec 글 39행을 사이트 spec 행 그대로 고치며(값 36 · 없던 행 3) **42개가 Noto** 가 됐다(사람의 결정) —
>   값 글자 36(원래 Pretendard Regular · Body/2 33 · 스타일 없음 3), 새 행 이름 3(Label/1 Medium 복제) · 새 행 값 3(Body/2 복제).
>   `font-revert-nodes.tsv` 맨 아래 "2026-10-26 k4" 절. 같은 때 고친 컴포넌트(Tag 높이 · Text Field Focused 고리)는 칸 · 테두리 · 효과만 바꿔 글자 노드는 그대로다.
>   Pretendard 가 있어야 하는 글자 줄 상자 · 자간 · 굵기는 아래 "Pretendard 가 생기면 할 일" 에 모았다
> - 에이전트의 플러그인 환경에는 여전히 Pretendard 가 없어 이런 텍스트 편집은 거기서 Pretendard 로 할 수 없다

## Pretendard 가 생기면 할 일 — 글자 줄 상자 · 자간 · 굵기 (2026-10-26 k4)

이 플러그인 환경은 Pretendard 를 올릴 수 없어 Pretendard 글자의 행간 · 자간 · 굵기 · 크기를 하나도 바꿀 수 없다.
값은 2026-10-26 에 사이트를 헤드리스 Chromium 으로 잰 것이고, 노드는 컴포넌트 원본이다(인스턴스는 따라온다).

### 내비 — 사람의 결정(2026-10-26 k4)으로 보류

| 무엇 | 노드 | Figma 지금 | 사이트 실측 |
| --- | --- | --- | --- |
| 항목 라벨 줄 상자 | Default 332:2732 · Hover 332:2741 · Pressed 556:3047(Title/2) · Selected 332:2750 · Sub Selected 332:2762(Label/1) | 행간 20 | 22.4(14px × 1.6) |
| Sub 라벨 줄 상자 | 332:2754 · 332:2758 · 556:3050(Body/2) | 행간 22 | 22.4 |
| 그룹 라벨 줄 상자 | 332:2809(Noto) · 332:2826(Label/2) | 행간 16 | 19.2(12px × 1.6) |
| 그룹 라벨 자간 | 332:2809 · 332:2826 | 2.52%(0.30px, Label/2) | .06em(0.72px) |
| 그룹 라벨 굵기 | `font-weight-todo.tsv` F 4행(332:2809 · 332:2826 · I332:2900;332:2809 · I332:2900;332:2826) | 500 | 600 |

지금은 칸으로 사이트 자리를 맞춰 두었다 — 항목 칸 38.4 · 접힘 38(가운데 정렬), 그룹 칸 padding 13.6/5.6(2026-10-26 k3).
행간을 22.4 · 19.2 로 바꾸면 그룹 padding 을 12/4 로 되돌린다(항목 칸은 높이가 고정이라 그대로).

### 다른 컴포넌트 — k4 실측에서 나온 차이(결정 전, 같은 이유로 못 고침)

Spec Label 행이 말하는 역할을 잰 결과다. 글자 크기는 Card compact 제목 말고 모두 사이트와 같고, 다른 것은 굵기다. 줄 상자도 사이트는 대부분 행간 1.6(14px 22.4 · 12px 19.2)이고
Figma 14단계는 20 · 22 · 16 · 18 이라 다르다 — 내비 말고는 줄 상자를 맞추지 않았다. KPI delta · Chart Card 제목 · 범례 값은 `font-weight-todo.tsv` G · H · I 에 이미 있다.

| 역할 | Figma 원본 노드(개수) | Figma 지금 | 사이트 실측 |
| --- | --- | --- | --- |
| Button 라벨 | 315:6 · 315:13 · 315:20 …(108) | 12 · 14 · 16 / 500(Label/2 · Label/1 · Title/1) | 12 · 14 · 16 / 600 |
| Text Field 라벨 · 필수 표시 | 322:367 · 322:368 …(36) | 14 / 500(Label/1) | 600 |
| Text Field 도움말 · Small 값 | 322:371 …(18) · 322:370 …(6) | 12 / 500(Caption/1) | 400 |
| Select Button 기본 · 선택 | 323:624 …(4) · 323:626 …(2) | 400(Body/2) · 500(Label/1) | 500 · 600 |
| Slider 라벨 · 값 · 눈금 | 325:626 …(4) · 325:627 …(4) · 325:633 …(12) | 500 · 500 · 500 | 400 · 600 · 400 |
| Date Picker 라벨 | 325:818 …(4) | 500(Label/1) | 600 |
| 달력 머리(월 · 요일) | 325:844 …(2) · 325:850 …(14) | 500(Label/2) | 600 |
| 달력 날짜 | Date Picker 안 66 · Calendar Day 325:805 …(4) | 500(Caption/1) | 400 |
| 달력 선택 · 오늘 날짜 | Date Picker 안 4 · Calendar Day 325:809 …(2) | 500(Label/2) | 선택 600 · 오늘 700 |
| Checkbox · Radio 설명 | 324:537 …(9) · 324:729 …(6) | 500(Caption/1) | 400 |
| Tag 라벨 | 326:961 …(57) | 500(Label/2) | 600 |
| Menu Item 선택 · 힌트 | 320:365 …(3) · 320:348 …(9) | 500 · 500 | 600 · 400 |
| Dropdown 그룹 라벨 | 320:418 | 500 · 자간 2.52%(Label/2) | 600 · .06em |
| Tab 기본 · 선택 · 작은 선택 · 건수 | 331:2363 …(6) · 331:2367 …(3) · 331:2379 …(3) · 331:2365 …(18) | 400 · 500 · 500 · 500 | 500 · 700(pill 600) · 700 · 700 |
| Breadcrumb 현재 | 332:2318 · 332:2333 | 500(Title/2) | 600 |
| Top Navigation 로고 · 아바타 | 332:3158 · 332:3184 · 332:3180 · 332:3215 | 500 | 700 |
| Accordion 제목 · 메타 | 320:1099 …(6) · 320:1100 …(6) | 500 · 500 | 600 · 400 |
| Card 제목 | 326:1318 …(12) | 16 · 행간 24 / 500(Title/1, compact 도 같음) | 600 — compact 는 14 · 행간 20 |
| Notice 제목 · Toast 액션 · Banner 링크 | 333:2703 …(5) · 333:2803 …(2) · 333:2818 …(3) | 500 | 700 · 600 · 600 |
| Divider 라벨 | 320:1019 | 500(Caption/1) | 400 |
| 표 머리(Table Header Cell · Table) | 328:1514 …(4) · 330:1971 …(8) | 500(Label/2) | 600 |
| List 부제 | 327:1202 …(6) | 500(Caption/1) | 400 |
| Item Tile 제목 · 설명 | 327:1724 …(8) · 327:1725 …(8) | 500 · 500 | 700 · 400 |
| Chart Card 막대 · 범례 라벨과 막대 값 | 330:2352 …(8) · 330:2355 …(4) | 500(Caption/1) | 400 |

아래는 처음 Noto 로 대체 교정할 때의 기록이다.

Figma 에 Pretendard 가 없어서(플러그인 환경이 보는 1,938 패밀리 중 0건) 2026-10-22 에 텍스트 스타일 14단계를
**Noto Sans KR 로 대체해서** 저장소 값으로 교정했다. 크기·행간·자간은 이미 저장소 값이다.
Pretendard 가 설치되면 **서체만** 아래 값으로 되돌린다. 텍스트는 `_figma/font.js` 의 `makeFont()` 로만 다룬다.

굵기 대응(Pretendard → Noto Sans KR): Regular → Regular · Medium → Medium · Bold → Bold.
Noto 에는 SemiBold 가 없어 Bold 로 간다. 다만 14단계 중 SemiBold 를 쓰는 단계는 없다(400·500·700 만 쓴다).

| 스타일 | 스타일 id | 원래 서체 |
| --- | --- | --- |
| Display/1 | S:90151788f5eabfc3a00804a253e9b4b6814feff1, | Pretendard Bold |
| Display/2 | S:449c24000c70f4f25b9d2029d5889ebcc0528061, | Pretendard Bold |
| Heading/1 | S:f8cfe63706575f7aef4db86025c0771b1e3ea8ae, | Pretendard Bold |
| Heading/2 | S:89773019f0c1fb4b534474bdfd76eca4fd02ac4f, | Pretendard Bold |
| Heading/3 | S:d459bb34b428fa1bff11dfab8fefc59016e6a73b, | Pretendard Bold |
| Heading/4 | S:33972468a24ab3a1b0b1639949d5692c2bac8586, | Pretendard Bold |
| Title/1 | S:dd32d910e14ff7b92c066f1a01c622166a55e736, | Pretendard Medium |
| Title/2 | S:a97638f383a8462b46ac7249ffe157be5030f203, | Pretendard Medium |
| Body/1 | S:af89ae92d5307741bb2ea4066ec8770c5aa64f46, | Pretendard Regular |
| Body/2 | S:dacbacc3a34994c6f27b892f3a8545a170e87c71, | Pretendard Regular |
| Label/1 | S:4b96cfa08f9c9bcb9e3c80134eed888b8dfaeadd, | Pretendard Medium |
| Label/2 | S:a44c9ae2cd1dd578f334c69449bba0d92c7a2f4d, | Pretendard Medium |
| Caption/1 | S:43eeb1c2792da7498768252abbee3fb2999a0a32, | Pretendard Medium (2026-10-22 사람이 Regular → Medium, 저장소도 500) |
| Caption/2 | S:9ae5a850dfb8897595693498f3282801f31278a6, | Pretendard Regular |

## 스타일에 연결되지 않은 Noto 노드
2026-10-22 기준 Noto Sans KR 노드 714개(현재 페이지 563 · 아카이브 151) 중 **713개가 스타일에 연결되지 않은 raw 노드**다.
이 노드들은 스타일을 되돌려도 따라오지 않는다 — Pretendard 설치 후 노드마다 서체를 되돌리거나, 그 전에 맞는 스타일에 연결해 둔다.

현재 페이지 raw 노드(굵기별): 1 Theme Regular 109 · Bold 42 · Medium 367 / 2 Element Medium 11 /
3 Component Regular 21 / Overview Medium 2 · Regular 2 / Resource Regular 8 · Medium 1.

## 14단계 밖의 스타일 3개
| 스타일 | 서체 | 쓰는 노드 |
| --- | --- | --- |
| Display/0 | Pretendard Bold 56 | 1 (Web / Home) |
| Caption/0 | Noto Sans KR Medium 13 (원래 Pretendard Medium — 위 상태 참고) | 11 (3 Component 10 · Web / Home 1) |
| Heading/0 | Pretendard Bold 48 (사람이 되돌림) | 1 (Web / Foundations) |
