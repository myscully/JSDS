/* 1.0 뒤로 미뤘다가 앞당긴 것(2026-11-11) — 사이트 behave.later.js 와 같은 규칙을 React 에서도 잰다.
   Loading 지연(delay · useLoadingDelay) · Slider + 숫자 입력(withInput) */
import { act, fireEvent, render, renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LOADING_DELAY, LOADING_MIN, Skeleton, SkeletonRow, Spinner, useLoadingDelay } from "../src/components/loading/Loading";
import { Slider } from "../src/components/slider/Slider";
import { Form } from "../src/patterns/Patterns";

describe("Loading 지연", () => {
  it("delay 는 data-delay, 숫자는 --ds-delay(ms) — 기본은 없음", () => {
    const { container } = render(<><Spinner label="a" /><Spinner delay label="b" /><Spinner delay={300} label="c" style={{ margin: 4 }}>문구</Spinner><Skeleton delay={200} /><SkeletonRow delay /></>);
    const [a, b, c] = Array.from(container.querySelectorAll<HTMLElement>(".spinner, .spinner-wrap"));
    expect(a.hasAttribute("data-delay")).toBe(false);
    expect(b.getAttribute("data-delay")).toBe(""); expect(b.style.getPropertyValue("--ds-delay")).toBe("");
    expect(c.className).toBe("spinner-wrap"); expect(c.getAttribute("data-delay")).toBe(""); expect(c.style.getPropertyValue("--ds-delay")).toBe("300ms"); expect(c.style.margin).toBe("4px");
    expect(container.querySelector<HTMLElement>(".skeleton.text")!.style.getPropertyValue("--ds-delay")).toBe("200ms");
    expect(container.querySelector(".skeleton-row")!.getAttribute("data-delay")).toBe("");
  });
  it("delay={false} 는 아무것도 달지 않는다", () => {
    const { container } = render(<Spinner delay={false} label="x" />);
    expect(container.querySelector(".spinner")!.hasAttribute("data-delay")).toBe(false);
  });

  describe("useLoadingDelay", () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });
    it("기본값 1000 · 500", () => { expect([LOADING_DELAY, LOADING_MIN]).toEqual([1000, 500]); });
    it("delay 안에 끝나면 끝내 보이지 않는다", () => {
      const { result, rerender } = renderHook(({ l }) => useLoadingDelay(l), { initialProps: { l: true } });
      act(() => { vi.advanceTimersByTime(999); }); expect(result.current).toBe(false);
      rerender({ l: false }); act(() => { vi.advanceTimersByTime(2000); }); expect(result.current).toBe(false);
    });
    it("한 번 보이면 최소 시간을 채운 뒤 숨긴다", () => {
      const { result, rerender } = renderHook(({ l }) => useLoadingDelay(l), { initialProps: { l: true } });
      act(() => { vi.advanceTimersByTime(1000); }); expect(result.current).toBe(true);
      act(() => { vi.advanceTimersByTime(100); }); rerender({ l: false });
      act(() => { vi.advanceTimersByTime(399); }); expect(result.current).toBe(true);
      act(() => { vi.advanceTimersByTime(1); }); expect(result.current).toBe(false);
    });
    it("최소 시간이 이미 지났으면 바로 숨긴다", () => {
      const { result, rerender } = renderHook(({ l }) => useLoadingDelay(l, { delay: 100, minDuration: 200 }), { initialProps: { l: true } });
      act(() => { vi.advanceTimersByTime(400); }); expect(result.current).toBe(true);
      rerender({ l: false }); act(() => { vi.advanceTimersByTime(0); }); expect(result.current).toBe(false);
    });
    it("다시 시작해도 최소 시간은 처음 보인 때부터 잰다", () => {
      const { result, rerender } = renderHook(({ l }) => useLoadingDelay(l, { delay: 100, minDuration: 500 }), { initialProps: { l: true } });
      act(() => { vi.advanceTimersByTime(100); });   // 보임(t=100)
      rerender({ l: false }); act(() => { vi.advanceTimersByTime(50); }); rerender({ l: true });
      act(() => { vi.advanceTimersByTime(150); }); rerender({ l: false });   // t=300
      act(() => { vi.advanceTimersByTime(299); }); expect(result.current).toBe(true);
      act(() => { vi.advanceTimersByTime(1); }); expect(result.current).toBe(false);   // t=600 = 100 + 500
    });
    it("숨기기 전에 다시 시작하면 보인 채로 남는다", () => {
      const { result, rerender } = renderHook(({ l }) => useLoadingDelay(l, { delay: 100, minDuration: 300 }), { initialProps: { l: true } });
      act(() => { vi.advanceTimersByTime(100); }); rerender({ l: false }); rerender({ l: true });
      act(() => { vi.advanceTimersByTime(1000); }); expect(result.current).toBe(true);
    });
  });
});

describe("Slider + 숫자 입력 (withInput)", () => {
  const range = () => document.querySelector<HTMLInputElement>(".slider-field input[type=range]")!;
  const num = () => document.querySelector<HTMLInputElement>(".slider-field input[type=number]")!;
  const f = () => document.querySelector<HTMLElement>(".slider-field")!;
  const el = (p: Partial<React.ComponentProps<typeof Slider>> = {}) => <Slider withInput id="s5" label="로그인 실패 허용 횟수" unit="회" min={0} max={20} defaultValue={5} help="0회부터 20회까지 입력할 수 있습니다." {...p} />;

  it("구조 — .field.number-field.slider-field > label · .slider-control(.slider > range + .affix) · .help, .val 없음", () => {
    render(el());
    expect(f().className).toBe("field number-field slider-field");
    const ctl = f().querySelector(":scope > .slider-control")!;
    expect(Array.from(ctl.children).map((c) => c.className)).toEqual(["slider", "affix"]);
    expect(f().querySelector(".val")).toBeNull();
    expect(f().querySelector(":scope > .help")!.textContent).toBe("0회부터 20회까지 입력할 수 있습니다.");
  });
  it("이름 — 라벨은 숫자 입력칸에, 트랙은 aria-labelledby, 단위는 aria-valuetext", () => {
    render(el());
    const lab = f().querySelector("label")!;
    expect(lab.htmlFor).toBe(num().id); expect(range().getAttribute("aria-labelledby")).toBe(lab.id);
    expect(range().getAttribute("aria-valuetext")).toBe("5회"); expect(num().getAttribute("aria-valuetext")).toBe("5회");
    expect([range().min, range().max, range().step]).toEqual([num().min, num().max, num().step]);
    expect(f().querySelector(".num-btn.up")!.getAttribute("aria-label")).toBe("로그인 실패 허용 횟수 늘리기");
  });
  it("트랙을 움직이면 입력칸과 onChange", () => {
    const on = vi.fn(); render(el({ onChange: on }));
    fireEvent.change(range(), { target: { value: "6" } });
    expect(num().value).toBe("6"); expect(on).toHaveBeenLastCalledWith(6);
    expect(range().style.getPropertyValue("--p")).toBe("30%"); expect(range().getAttribute("aria-valuetext")).toBe("6회");
  });
  it("입력칸에 치면 트랙이 따라간다", async () => {
    const on = vi.fn(); render(el({ onChange: on }));
    await userEvent.clear(num()); await userEvent.type(num(), "12");
    expect(range().value).toBe("12"); expect(range().style.getPropertyValue("--p")).toBe("60%"); expect(on).toHaveBeenLastCalledWith(12);
  });
  it("범위 밖은 글자를 두고 트랙은 끝, 떠나면 오류 · 고치면 지움", async () => {
    const on = vi.fn(); render(el({ onChange: on }));
    await userEvent.clear(num()); await userEvent.type(num(), "25");
    expect(num().value).toBe("25"); expect(range().value).toBe("20"); expect(range().style.getPropertyValue("--p")).toBe("100%"); expect(on).toHaveBeenLastCalledWith(25);
    expect(f().classList.contains("error")).toBe(false);
    await userEvent.tab();
    expect(f().classList.contains("error")).toBe(true); expect(num().getAttribute("aria-invalid")).toBe("true");
    expect(f().querySelector(".help")!.textContent).toMatch(/20/);
    await userEvent.clear(num()); await userEvent.type(num(), "8");
    expect(f().classList.contains("error")).toBe(false); expect(range().value).toBe("8");
  });
  it("빈 칸은 트랙을 두고 onChange 를 부르지 않는다", async () => {
    const on = vi.fn(); render(el({ onChange: on }));
    await userEvent.clear(num());
    expect(num().value).toBe(""); expect(range().value).toBe("5"); expect(on).not.toHaveBeenCalled();
  });
  it("증감 버튼도 트랙을 움직인다", async () => {
    render(el());
    await userEvent.click(f().querySelector<HTMLElement>(".num-btn.up")!);
    expect(num().value).toBe("6"); expect(range().value).toBe("6");
  });
  it("제어형 — 제품이 값을 바꾸면 두 칸이 따라간다", async () => {
    function C() { const [v, setV] = useState(5); return <>{el({ value: v, onChange: setV, defaultValue: undefined })}<button onClick={() => setV(15)}>set</button></>; }
    const { getByText } = render(<C />);
    await userEvent.click(getByText("set"));
    expect(num().value).toBe("15"); expect(range().value).toBe("15");
  });
  it("name 은 숫자 입력칸에, 트랙에는 없다 · 폼 검증에 낀다", async () => {
    const onValidate = vi.fn();
    render(<Form validate onValidate={onValidate}>{el({ name: "limit", required: true, defaultValue: undefined })}<button type="submit">저장</button></Form>);
    expect(num().name).toBe("limit"); expect(range().name).toBe("");
    await userEvent.clear(num()); await userEvent.click(document.querySelector<HTMLElement>("button[type=submit]")!);
    expect(f().classList.contains("error")).toBe(true);
  });
  it("disabled 는 두 칸 모두", () => {
    render(el({ disabled: true }));
    expect(range().disabled).toBe(true); expect(num().disabled).toBe(true);
  });
  it("withInput 이 없으면 전과 같다", () => {
    const { container } = render(<Slider label="민감도" defaultValue={60} />);
    expect(container.querySelector(".slider-field")).toBeNull();
    expect(container.querySelector(".slider .val")!.textContent).toBe("60");
  });
});
