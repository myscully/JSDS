import { applyAccent, accentScale, isLightAccent, clashesWithStatus, setTheme, getTheme } from "./theme";

describe("applyAccent", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("style");
    document.documentElement.removeAttribute("data-theme");
    delete document.documentElement.dataset.accentNeutral;
  });

  /* --brand-* 가 아니라 --prod-* 여야 한다. --prod-* 는 제품이 넣는 입력이고 --brand-* 는 테마가 해석한 결과라,
     :root 가 var(--prod-N, var(--blue-N)) 으로 받아 라이트는 50·45·40 · 다크는 50·55·60 을 집는다.
     --brand-* 로 직접 주입하면 인라인이 스타일시트를 이겨 그 테마별 해석이 통째로 무력해진다 */
  it("제품 램프를 --prod-* 로 주입하고 --brand-* 는 건드리지 않는다", () => {
    applyAccent("#008760");
    const st = document.documentElement.style;
    expect(st.getPropertyValue("--prod-50")).toBe("#008760");
    expect(st.getPropertyValue("--prod-60")).not.toBe("");
    for (const step of [40, 45, 50, 55, 60]) {
      expect(st.getPropertyValue(`--prod-${step}`)).not.toBe("");
      expect(st.getPropertyValue(`--brand-${step}`)).toBe("");
    }
  });

  it("다섯 단계를 모두 주입하고 스케일을 돌려준다", () => {
    const sc = applyAccent("#008760");
    expect(Object.keys(sc).map(Number).sort((a, b) => a - b)).toEqual([40, 45, 50, 55, 60]);
    expect(sc[50]).toBe("#008760");
    expect(document.documentElement.dataset.accent).toBe("#008760");
  });

  /* 파생 규칙이 참조 시스템의 blue 램프에서 나왔으므로 그 램프를 재현해야 한다.
     55 단계만 초록 채널이 1 어긋난다(#1A76FF vs #1A75FF) — 참조 값이 HSL 곡선에서 살짝 벗어나 있다.
     기본 제품은 이 함수를 타지 않고 CSS 가 --blue-* 를 직접 쓰므로 화면에는 영향이 없다 */
  it("#0066FF 를 넣으면 참조 시스템 blue 램프를 1/255 안에서 재현한다", () => {
    const sc = accentScale("#0066FF");
    const want = ["#0054D1", "#005EEB", "#0066FF", "#1A75FF", "#3385FF"];
    const got = [sc[40], sc[45], sc[50], sc[55], sc[60]];
    got.forEach((hex, i) => {
      for (let c = 0; c < 3; c++) {
        const a = parseInt(hex.slice(1 + c * 2, 3 + c * 2), 16);
        const b = parseInt(want[i].slice(1 + c * 2, 3 + c * 2), 16);
        expect(Math.abs(a - b)).toBeLessThanOrEqual(1);
      }
    });
    expect([got[0], got[1], got[2], got[4]]).toEqual([want[0], want[1], want[2], want[4]]);
  });

  /* 밝은 제품에 맞춰 뒤집던 적응을 걷어냈다 — 이제 isLightAccent 는 '검증 술어'다.
     켜지 말아야 할 속성을 켜지 않는지까지 봐야 한다: 종전 CSS 규칙이 남아 있으면 조용히 되살아난다 */
  it("data-accent-light 를 더 이상 켜지 않는다", () => {
    applyAccent("#00AD7B");
    expect(document.documentElement.hasAttribute("data-accent-light")).toBe(false);
    applyAccent("#0066FF");
    expect(document.documentElement.hasAttribute("data-accent-light")).toBe(false);
  });

  /* 제품 색 제약 — 면 위 글자는 늘 흰색이라 제품 색이 그 흰 글자를 받쳐야 한다(라이트 기준 4.5) */
  it("isLightAccent 가 규격에 못 미치는 제품 색을 가려낸다", () => {
    expect(isLightAccent("#00AD7B")).toBe(true);   // 흰 글자 2.89 — 쓸 수 없다
    expect(isLightAccent("#008760")).toBe(false);  // 4.53 — 같은 색상에서 통과하는 가장 밝은 값
    expect(isLightAccent("#0066FF")).toBe(false);  // 4.83 — 참조 시스템의 기본색
  });

  /* 사이트 Accent 미리보기와 같은 규칙 — 상태색과 15도 미만이면 제품 램프 대신 중립으로 내린다.
     제품 A #00AAB6(184)는 Informative 189 와 5도, 제품 B #C30D2A(351)는 Negative 0 과 9도다 */
  it("상태색과 겹치는 제품 색은 --prod-* 를 넣지 않고 data-accent-neutral 을 켠다", () => {
    for (const hex of ["#00AAB6", "#C30D2A"]) {
      applyAccent(hex);
      const root = document.documentElement;
      expect(root.hasAttribute("data-accent-neutral")).toBe(true);
      for (const step of [40, 45, 50, 55, 60]) expect(root.style.getPropertyValue(`--prod-${step}`)).toBe("");
    }
  });

  it("겹치지 않는 색으로 바꾸면 중립을 끄고 램프를 다시 넣는다", () => {
    applyAccent("#C30D2A");
    applyAccent("#0066FF");
    const root = document.documentElement;
    expect(root.hasAttribute("data-accent-neutral")).toBe(false);
    expect(root.style.getPropertyValue("--prod-50")).toBe("#0066FF");
  });

  it("clashesWithStatus 는 채도가 낮은 색을 상태색으로 보지 않는다", () => {
    expect(clashesWithStatus("#008760")).toBe(false); // 색상 163 — Positive 140 과 23도
    expect(clashesWithStatus("#0066FF")).toBe(false);
    expect(clashesWithStatus("#8A7F7F")).toBe(false); // 붉은 기가 있지만 채도 4
  });

  it("accentScale 은 50 에 입력 HEX 를 그대로 둔다", () => {
    expect(accentScale("#00aab6")[50]).toBe("#00AAB6");
  });
});

describe("setTheme / getTheme", () => {
  afterEach(() => document.documentElement.removeAttribute("data-theme"));

  it("dark·light 를 data-theme 으로, null 이면 속성을 지운다", () => {
    setTheme("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(getTheme()).toBe("dark");
    setTheme(null);
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
    expect(getTheme()).toBeNull();
  });
});
