# JS Design System — 함께 일하는 기준

지란지교시큐리티 보안 콘솔용 디자인 시스템입니다. 정적 사이트 + React 패키지 + Figma 라이브러리 셋이
**같은 토큰 하나**를 공유합니다. 현재 **v0.8**.

## 저장소 구조 — 무엇이 원본이고 무엇이 생성물인가

| 경로 | 무엇 |
| --- | --- |
| `_build/` | **원본.** 사이트 생성기. `build.js` 가 전부를 만들고 `verify.js`·`contrast.js` 를 함께 돌립니다 |
| `_build/style.src.css` | **토큰과 컴포넌트 CSS 의 단일 출처.** 사이트·패키지·Figma 가 전부 여기서 나옵니다 |
| `_build/reference-tokens.js` | 참조 시스템의 토큰 정의를 코드로 옮긴 대장. `DEVIATIONS`(값을 바꾼 것) · `ADDITIONS`(우리가 더한 것) |
| `_react/` | **원본.** `@jiran/ds-react` 패키지. `dist/` 는 생성물이라 git 에 없습니다 |
| `_figma/` | **원본.** Figma 작업 도구 — `font.js`(폰트 안전 로더) · `probe.js`(조사) · `audit.mjs`(대조) · `font-revert.md`(Noto 대체 경과 · 되돌릴 노드 — 목록은 같은 폴더의 `.tsv` 둘) |
| `assets/` `home/` `foundations/` `components/` `patterns/` `resources/` `index.html` | **전부 생성물.** 직접 고치지 말고 `_build/` 를 고친 뒤 빌드하세요 |

## 일하는 방식

**재면서 일합니다.** 색·크기·대비는 추측하지 않고 **헤드리스 Chromium 으로 잽니다.** "맞을 것이다"로
보고하지 않습니다. 알파가 섞인 색은 반드시 **합성해서** 재야 합니다 — 같은 색의 두 알파를 그냥
비교하면 1.000 이 나옵니다.

**문서가 코드보다 앞서 가지 않게 합니다.** 페이지에 적는 수치·이름·약속은 **세어서** 씁니다.
이 저장소에서 반복해서 난 사고가 전부 이것이었습니다 — "램프 14개"(실제 13), "컴포넌트 30개"(31),
"`summary > svg` 는 16~18 로 고정됩니다"(CSS 에 크기 지정 없음).

**예외는 코드에 선언합니다.** 참조 값을 바꿨으면 `reference-tokens.js` 의 `DEVIATIONS`,
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
pages 61 · verify 0/0 · contrast 828쌍 실패 0 · advisory 296 · behave 291/291 · react 200+3
```

`advisory 296` 은 참조 시스템 값을 따르느라, 또는 사람이 결정한 표현(예: 진한 빨강 Count 배지의 다크 흰 숫자) 때문에
우리 기준을 못 넘는 쌍입니다 — **실패가 아니라 선언된 예외**이고 `contrast.pairs.js` 에 이유가 적혀 있습니다.

## 토큰 체계 (v0.8)

- **Atomic** `--{램프}-{단계}` — 램프 13개, **숫자가 클수록 밝습니다**. 컴포넌트에서 직접 쓰지 않습니다.
- **Semantic** `--{그룹}-{하위}-{이름}` — `foreground` · `background` · `surface` · `line` · `effect` · `static`
  여섯 그룹 **79개**(참조 75 + 더한 4) + 트리 밖 3개(`--brand-label` · `--company-mark` · `--company-mark-subtle`) = **82**.
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

### 지금 막혀 있는 것

**에이전트가 쓰는 Figma 플러그인 환경에는 Pretendard 가 없습니다**(보이는 1,938 패밀리 중 0건).
2026-10-22 에 텍스트 스타일 14단계를 `Noto Sans KR` 로 대체해 저장소 값(크기·행간·자간)으로 교정했고,
**같은 날 사람이 데스크톱에서 직접 Pretendard 로 되돌렸습니다**(교정값은 유지). 그래서 지금 스타일은 Pretendard
이지만 플러그인 환경에서는 폰트를 올릴 수 없어 **글자 내용 수정 · 텍스트 스타일 연결 같은 텍스트 편집은 막혀 있습니다**
(`audit.mjs` 의 NOTE 가 실제 상태를 알려 줍니다). 텍스트 편집은 사람이 데스크톱에서 하거나, 플러그인 환경이 Pretendard 를
보게 될 때까지 미룹니다. 경과와 남은 노드는 `_figma/font-revert.md` 에 있습니다.

## 보고하는 법

- 끝났다고 말하려면 **그 출력이 있어야** 합니다. 기억에서 숫자를 쓰지 않습니다.
- **못 한 것과 이유를 반드시 적습니다.** 범위를 줄이는 것은 사람의 몫이지 에이전트의 몫이 아닙니다.
- 덜어낸 것이 있으면 무엇이 사라졌는지 적습니다(예: 설명을 줄이며 규칙의 근거가 사이트에서 없어짐).
