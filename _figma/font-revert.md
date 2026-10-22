# Pretendard 되돌리기 표

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
| Caption/1 | S:43eeb1c2792da7498768252abbee3fb2999a0a32, | Pretendard Regular |
| Caption/2 | S:9ae5a850dfb8897595693498f3282801f31278a6, | Pretendard Regular |

## 스타일에 연결되지 않은 Noto 노드
2026-10-22 기준 Noto Sans KR 노드 714개(현재 페이지 563 · 아카이브 151) 중 **713개가 스타일에 연결되지 않은 raw 노드**다.
이 노드들은 스타일을 되돌려도 따라오지 않는다 — Pretendard 설치 후 노드마다 서체를 되돌리거나, 그 전에 맞는 스타일에 연결해 둔다.

현재 페이지 raw 노드(굵기별): 1 Theme Regular 109 · Bold 42 · Medium 367 / 2 Element Medium 11 /
3 Component Regular 21 / Overview Medium 2 · Regular 2 / Resource Regular 8 · Medium 1.

## 14단계 밖의 스타일 3개(손대지 않음)
| 스타일 | 서체 | 쓰는 노드 |
| --- | --- | --- |
| Display/0 | Pretendard Bold 56 | 1 (Web / Home) |
| Caption/0 | Pretendard Medium 13 | 11 (3 Component 10 · Web / Home 1) — 현재 페이지에서 폰트 없이 렌더링된다 |
| Heading/0 | Noto Sans KR Bold 48 | 1 (Web / Foundations) |
