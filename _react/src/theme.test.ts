import { applyAccent, accentScale, setTheme, getTheme } from "./theme";

describe("applyAccent", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("style");
    document.documentElement.removeAttribute("data-theme");
  });

  /* --accent-* 가 아니라 --prod-* 여야 한다. 인라인 스타일은 모든 스타일시트 규칙을 이기므로,
     --accent-* 로 주입하면 다크 블록이 램프를 중립으로 덮는 것이 무력해지고 다크에 제품색이 남는다.
     이 테스트가 패키지의 다크 보장을 지키는 유일한 방어선이다 */
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
