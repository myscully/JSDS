import { applyAccent, accentScale, isLightAccent, setTheme, getTheme } from "./theme";

describe("applyAccent", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("style");
    document.documentElement.removeAttribute("data-theme");
  });

  /* --brand-* 가 아니라 --prod-* 여야 한다. --prod-* 는 제품이 넣는 입력이고 --brand-* 는 테마가 해석한 결과라,
     :root 가 var(--prod-N, var(--blue-N)) 으로 받아 라이트는 50·45·40 · 다크는 60·55·50 을 집는다.
     --brand-* 로 직접 주입하면 인라인이 스타일시트를 이겨 그 테마별 해석이 통째로 무력해진다 */
  it("제품 램프를 --prod-* 로 주입하고 --brand-* 는 건드리지 않는다", () => {
    applyAccent("#00AAB6");
    const st = document.documentElement.style;
    expect(st.getPropertyValue("--prod-50")).toBe("#00AAB6");
    expect(st.getPropertyValue("--prod-60")).not.toBe("");
    for (const step of [40, 45, 50, 55, 60]) {
      expect(st.getPropertyValue(`--prod-${step}`)).not.toBe("");
      expect(st.getPropertyValue(`--brand-${step}`)).toBe("");
    }
  });

  it("다섯 단계를 모두 주입하고 스케일을 돌려준다", () => {
    const sc = applyAccent("#00AAB6");
    expect(Object.keys(sc).map(Number).sort((a, b) => a - b)).toEqual([40, 45, 50, 55, 60]);
    expect(sc[50]).toBe("#00AAB6");
    expect(document.documentElement.dataset.accent).toBe("#00AAB6");
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

  /* 밝은 메인 컬러는 흰 글자가 뜬다 — 면 위 글자(--brand-label)를 뒤집는 CSS 규칙의 스위치다 */
  it("밝은 메인 컬러에만 data-accent-light 를 켠다", () => {
    applyAccent("#00AAB6");
    expect(document.documentElement.hasAttribute("data-accent-light")).toBe(true);
    expect(isLightAccent("#00AAB6")).toBe(true);
    applyAccent("#2563EB");
    expect(document.documentElement.hasAttribute("data-accent-light")).toBe(false);
    expect(isLightAccent("#2563EB")).toBe(false);
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
