import { createRequire } from "node:module";
import { applyAccent, accentScale, isLightAccent, setTheme, getTheme, applyProductColor, PRODUCT_COLORS } from "./theme";

const require = createRequire(import.meta.url);

describe("applyAccent", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("style");
    document.documentElement.removeAttribute("data-theme");
  });

  /* --brand-* 가 아니라 --prod-* 여야 한다. --prod-* 는 제품이 넣는 입력이고 --brand-* 는 테마가 해석한 결과라,
     :root 가 var(--prod-N, var(--blue-N)) 으로 받아 라이트는 50·45·40 · 다크는 50·55·60 을 집는다.
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

  /* 파생 규칙이 기준 시스템의 blue 램프에서 나왔으므로 그 램프를 재현해야 한다.
     55 단계만 초록 채널이 1 어긋난다(#1A76FF vs #1A75FF) — 참조 값이 HSL 곡선에서 살짝 벗어나 있다.
     기본 제품은 이 함수를 타지 않고 CSS 가 --blue-* 를 직접 쓰므로 화면에는 영향이 없다 */
  it("#0066FF 를 넣으면 기준 시스템 blue 램프를 1/255 안에서 재현한다", () => {
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
    expect(isLightAccent("#0066FF")).toBe(false);  // 4.83 — 기준 시스템의 기본색
  });

  it("accentScale 은 50 에 입력 HEX 를 그대로 둔다", () => {
    expect(accentScale("#00aab6")[50]).toBe("#00AAB6");
  });
});

/* 제품 색 팔레트(2026-11-14 사람의 결정) — 사이트 _build/data.js 의 PRODUCTS 와 같은 표여야 한다(사이트 헤더 메뉴 · contrast 맥락 · verify 가 그 표를 읽는다) */
describe("applyProductColor · PRODUCT_COLORS", () => {
  const root = document.documentElement;
  beforeEach(() => { root.removeAttribute("style"); delete root.dataset.accent; });

  it("PRODUCT_COLORS 가 사이트 팔레트(data.js PRODUCTS)와 같다", () => {
    const { PRODUCTS } = require("../../_build/data.js") as { PRODUCTS: unknown[] };
    expect(JSON.parse(JSON.stringify(PRODUCT_COLORS))).toEqual(PRODUCTS);
  });

  it("파랑은 기본 — --prod-* 와 data-accent 를 지운다", () => {
    applyProductColor("red");
    expect(root.style.getPropertyValue("--prod-50")).toBe("#C30D2A");
    expect(applyProductColor("blue")).toBeNull();
    expect(root.style.getPropertyValue("--prod-50")).toBe("");
    expect(root.hasAttribute("data-accent")).toBe(false);
  });

  it("빨강 · 시안 · 주황 · AI 는 --prod-* 를 넣고 data-accent=키, 중립은 --prod-* 없이 data-accent=neutral", () => {
    for (const key of ["red", "cyan", "orange", "ai"] as const) {
      const sc = applyProductColor(key);
      const hex = PRODUCT_COLORS.find((p) => p.key === key)!.hex;
      expect(sc?.[50]).toBe(hex);
      expect(root.style.getPropertyValue("--prod-50")).toBe(hex);
      expect(root.dataset.accent).toBe(key);
    }
    expect(applyProductColor("neutral")).toBeNull();
    expect(root.style.getPropertyValue("--prod-50")).toBe("");
    expect(root.dataset.accent).toBe("neutral");
  });

  it("모르는 키는 경고하고 기본(파랑)으로 둔다", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    applyProductColor("cyan");
    applyProductColor("green" as never);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(root.hasAttribute("data-accent")).toBe(false);
    expect(root.style.getPropertyValue("--prod-50")).toBe("");
    warn.mockRestore();
  });

  /* 다크 글자 단계(60)는 다크 바탕 셋 모두에서 4.5 가 될 때까지 밝힌다 — 빨강 · AI 는 기본 +10 으로 4.5 에 못 미쳤다(사이트 app.src.js 와 같은 값) */
  it("다크 글자 단계 60 을 4.5 까지 밝힌다 — 빨강 #F34B65 · AI #9076F6, 이미 넘는 시안 · 주황 · 파랑은 그대로", () => {
    expect(accentScale("#C30D2A")[60]).toBe("#F34B65");
    expect(accentScale("#6541F2")[60]).toBe("#9076F6");
    expect(accentScale("#0066FF")[60]).toBe("#3385FF");
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

describe("checkRootFontSize — 패키지는 rem(2026-11-11)", () => {
  it("루트가 12px 미만이면 한 번만 알리고, 16 · 브라우저 글꼴을 키운 20 은 조용하다", async () => {
    const { checkRootFontSize, resetRootFontCheck } = await import("./theme");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const root = document.documentElement;
    resetRootFontCheck();
    for (const px of ["16px", "20px"]) { root.style.fontSize = px; expect(checkRootFontSize()).toBe(parseFloat(px)); }
    expect(warn).not.toHaveBeenCalled();
    root.style.fontSize = "10px"; checkRootFontSize(); checkRootFontSize();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain("62.5%");
    root.style.fontSize = ""; warn.mockRestore(); resetRootFontCheck();
  });
});
