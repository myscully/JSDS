# DocuONE — JS Design System 적용 시안

`02 제품별/다큐원/리뉴얼/2.0v/DocuONE Concept/index.html`(Bootstrap + CoreUI 아이콘) 화면을 JS Design System 의 컴포넌트와 토큰으로 다시 지은 한 장입니다. 원본 폴더는 바꾸지 않았습니다.

- 컨셉의 3칸 구조(사이드바 · 본문 · Info 패널)와 영문 글을 그대로 두었습니다(사람의 결정).
- 제품 색은 기본 파랑 `#0066FF` 입니다(`data-accent` 없음).

## 여는 법

브라우저로 `index.html` 을 엽니다. 서버는 필요 없고, 저장소의 `../../assets/` 를 상대 경로로 불러옵니다.

- 폴더 카드를 누르면 하나만 골라지고, Info 의 Properties 가 그 폴더 값으로 바뀝니다.
- Info 머리의 » 버튼을 누르면 패널이 64px 로 접힙니다. 로고 옆 버튼은 사이드 내비를 접습니다. 화면 폭이 1280 미만이면 사이드 내비가 저절로 접힙니다.
- 위 줄 오른쪽 끝의 해 · 달 버튼으로 라이트/다크를 바꾸고, 선택은 `localStorage` 의 `docu-theme` 에 남습니다. 이 버튼은 원본에 없고 둘러보기용으로 더했습니다.
- `/` 를 누르면 검색칸으로 갑니다. 치면 폴더가 걸러지고, 맞는 것이 없으면 빈 상태와 'Clear filters' 가 나옵니다.
- Filter 는 라디오 항목 넷(All folders · Notes · Data · Reports)입니다. 고르면 메뉴가 열린 채 폴더가 걸러지고, 버튼 글이 고른 이름이 됩니다.
- `⌘K`(맥) · `Ctrl+K` 또는 위 줄 'Jump to' 로 명령 팔레트를 엽니다. 폴더로 가기 · New draft · Info 패널 접기 · 검색칸으로 가기 · 단축키 보기가 있습니다.
- `?` 를 누르면 단축키 도움말이 열립니다.
- New draft 를 누르면 맨 앞에 'Untitled draft' 가 생겨 골라지고 잠깐 하이라이트됩니다. Toast 의 Undo 로 되돌립니다.

## 원본 → 시스템

| 원본 | 시스템 |
| --- | --- |
| 사이드바 · 하위 메뉴 · 알림 배지 · 사용자 | Navigation(`.sidenav` · `a.sub` · `.count`) · Avatar(중립 면) · 접기 버튼 |
| Projects › DocuONE | Breadcrumb — 첫 칸이 홈 아이콘이라는 규칙 때문에 Home › Projects › DocuONE |
| Manage · Share · ⋮ | Button text assistive · Dropdown(위험 항목 Delete 는 맨 아래 구분선 뒤) |
| (원본에 없음) Jump to · 단축키 | Command Palette(`.popup.cmdk[data-hotkey]`) · Kbd · 단축키 도움말(`.popup[data-hotkey-help]`) |
| 제목 + New draft | Page Header + Button solid primary |
| Search · Filter | Search(`data-hotkey` + Kbd `/` · 지우기 버튼) · Dropdown 라디오 항목(`menuitemradio` · 그룹 제목 Show) · 결과가 없을 때 Empty State |
| 폴더 카드 | Card 선택형(`.card.clickable` · `aria-pressed`). 격자는 3열 고정이 아니라 폭에 맞춰 칸 수가 바뀜(카드 최소 240 — 1024 에서 2열 · 1440 3열 · 1920 4열, Info 를 접으면 한 칸 더) — 고르면 원본처럼 카드 면이 연한 제품 색 그라데이션(카드 면에 제품 색 18% → 36%) + 진한 글자 + 제품 색 빛 그림자 |
| 폴더 그림 | `demo.css` 의 `.docu-folder` — 원본처럼 앞판 세로 그라데이션 + 위쪽 광택, 색은 전부 토큰(고르면 앞판도 제품 색을 섞은 그라데이션 42% → 66% — 카드보다 한 겹만 짙게) |
| 통계 막대 | Card + 진행 막대(meter, 한 톤 mono 채움 · 회색 트랙) |
| Properties | 키-값 표(`.tbl.kv` — 머리글 칸에 오른쪽 선 없음) |
| Tags | Tag outline + 점(높이 24 · 반경 6) — Sales accent · Marketing 중립 · Analytics 시안 |
| Pinned items · Activity | List hover |

## 원본과 달라진 것과 이유

- **그라데이션은 원본처럼 두되 색은 토큰입니다(2026-11-27 사람의 요청).** 고른 카드 면 · 폴더 앞판 · 광택 · 빛 그림자를 되살렸고, 다크 테마와 제품 색을 따릅니다. 시스템 선택 카드 모양(제품 색 링 + 옅은 면)과는 다릅니다.
- **고른 카드의 글자가 흰색이 아니라 진한 중립입니다(2026-11-27 사람의 결정).** 원본의 옅은 파랑(#7EAEF3 → #5B97EF)은 흰 글자 대비가 2.27 · 2.95 라 읽기 어렵습니다. 처음엔 흰 글자를 지키려 진한 파랑(50 → 40, 뒤에 60 → 45)으로 칠했지만, 사람이 연한 면을 원해 면을 원본 같은 밝기로 두고 글자를 바꿨습니다. 면은 카드 면 색에 제품 색을 18% → 36% 섞은 그라데이션이라(폴더 앞판은 42% → 66% — 진한 램프 색이면 연한 면에서 튀어서) 제품 색 · 다크 테마를 따릅니다(다크에서는 깊은 파랑 면 + 밝은 글자). 글자 자리를 픽셀로 재면 제목 9.93 ~ 11.14, notes · 크기(secondary) 5.34 ~ 6.22 으로 라이트 · 다크 · AI · 빨강 모두 4.5 이상입니다. AI 제품도 진한 그라데이션 층 없이 violet 을 섞습니다(그 층 위에는 진한 글자를 올릴 수 없음).
- **통계 막대는 한 톤입니다.** 원본의 파랑 · 빨강 막대는 뜻이 없는 색이라, 차트 규칙의 한 톤 mono 로 바꿨습니다. 빨강은 오류 · 위험으로 읽힙니다.
- **Analytics 태그는 빨강 대신 시안입니다.** 빨강 Tag 는 심각도 Critical 색입니다. 시스템에는 분류용 Tag 톤이 따로 없어서 `.pending`(시안) 클래스를 빌려 썼습니다.
- **크기가 시스템 단계로 촘촘해졌습니다.** 본문 14 · 버튼 높이 40 · 사이드바 폭 240(원본 268) · 메뉴 글자 14(원본 16) · 제목 Title 2 28 입니다.
- **날짜 형식.** 날짜는 원본 그대로 `12/03/2024` 입니다. 시스템 Writing 규칙(`2024. 03. 12`)과 다릅니다.

## 2026-11-27 다시 구성 — 11-24 ~ 11-26 시스템 반영

- Avatar 가 이름 색 6톤에서 중립 면으로 바뀌었습니다(시스템이 색 체계를 지움). 생성기가 쓰던 `withAvatarTone` 도 없어져 지웠습니다.
- Tag · 키-값 표 · 진행 막대 트랙 · Toast 글자 · 팝오버와 체크 모션은 시스템 CSS · ds.js 를 그대로 받아 바뀌었습니다.
- 새로 쓴 컴포넌트: Kbd · Command Palette · 단축키 도움말 · 메뉴 라디오 항목 · Empty State · Toast 의 Undo · 새 항목 하이라이트.
- 원본에 없는 기능(검색 거르기 · 팔레트 · 단축키 · New draft 동작)은 둘러보기용 흉내이고 저장하지 않습니다.

## 파일

- `gen.js` 는 `index.html` 을 만드는 생성기입니다. 고칠 때는 이 파일을 고친 뒤 `node _demo/docuone/gen.js` 를 돌립니다.
- `demo.css` 에는 3칸 배치 · 폴더 그림 · Info 패널 배치만 있습니다. 컴포넌트 모양은 `assets/style.css` 가 맡습니다.
- `demo.js` 에는 폴더 고르기 · 검색과 Filter 거르기 · 팔레트 명령 처리 · New draft · Info 접기 · 테마 저장 흉내만 있습니다. 메뉴와 라디오 · Tooltip · 사이드 내비 접기 · `/` · `⌘K` · `?` 단축키 · Toast · 하이라이트는 `assets/ds.js` 가 합니다.
