import { applyAccent, accentScale, isLightAccent, setTheme, getTheme } from "./theme";

describe("applyAccent", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("style");
    document.documentElement.removeAttribute("data-theme");
  });

  /* --accent-* 가 아니라 --prod-* 여야 한다. --prod-* 는 제품이 넣는 입력이고 --accent-* 는 테마가 해석한 결과라,
     :root 가 var(--prod-N, 기본값) 으로 받아 라이트는 600 · 다크는 400 단계를 집는다.
     --accent-* 로 직접 주입하면 인라인이 스타일시트를 이겨 그 테마별 해석이 통째로 무력해진다 */
  it("제품 램프를 --prod-* 로 주입하고 --accent-* 는 건드리지 않는다", () => {
    applyAccent("#00AAB6");
    const st = document.documentElement.style;
    expect(st.getPropertyValue("--prod-600")).toBe("#00AAB6");
    expect(st.getPropertyValue("--prod-400")).not.toBe("");
    for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]) {
      expect(st.getPropertyValue(`--prod-${step}`)).not.toBe("");
      expect(st.getPropertyValue(`--accent-${step}`)).toBe("");
    }
  });

  it("10단계를 모두 주입하고 스케일을 돌려준다", () => {
    const sc = applyAccent("#00AAB6");
    expect(Object.keys(sc).map(Number).sort((a, b) => a - b)).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900]);
    expect(sc[600]).toBe("#00AAB6");
    expect(document.documentElement.dataset.accent).toBe("#00AAB6");
  });

  /* 밝은 메인 컬러는 흰 글자가 뜬다 — 글자색과 hover·pressed 방향을 뒤집는 CSS 규칙의 스위치다 */
  it("밝은 메인 컬러에만 data-accent-light 를 켠다", () => {
    applyAccent("#00AAB6");
    expect(document.documentElement.hasAttribute("data-accent-light")).toBe(true);
    expect(isLightAccent("#00AAB6")).toBe(true);
    applyAccent("#2563EB");
    expect(document.documentElement.hasAttribute("data-accent-light")).toBe(false);
    expect(isLightAccent("#2563EB")).toBe(false);
  });

  it("accentScale 은 600 에 입력 HEX 를 그대로 둔다", () => {
    expect(accentScale("#00aab6")[600]).toBe("#00AAB6");
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
