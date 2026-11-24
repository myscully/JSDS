import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { Button, Field, FileUpload, Form, FormActions, type UploadItem } from "../src";

const mk = (name: string, size = 2048, type = "") => new File([new Uint8Array(size)], name, { type });
const choose = (c: HTMLElement, ...files: File[]) => {
  const input = c.querySelector("input[type=file]") as HTMLInputElement;
  Object.defineProperty(input, "files", { configurable: true, value: files });
  fireEvent.change(input);
};
const dropped = (...files: File[]) => ({ dataTransfer: { types: ["Files"], files, dropEffect: "" } });
const rowNames = (c: HTMLElement) => Array.from(c.querySelectorAll(".upload-item .name")).map((n) => n.textContent);

/* 제품 흉내 — items 를 갖고, 받은 파일은 바로 목록에 넣는다 */
function Host({ status = "ready", start = [], ...p }: { status?: UploadItem["status"]; start?: UploadItem[] } & Partial<React.ComponentProps<typeof FileUpload>>) {
  const [items, setItems] = useState<UploadItem[]>(start);
  return (
    <>
      <FileUpload
        {...p}
        items={items}
        onAdd={(a) => { p.onAdd?.(a); setItems((x) => [...x, ...a.map(({ id, file }) => ({ id, name: file.name, size: file.size, status }))]); }}
        onRemove={(id) => { p.onRemove?.(id); setItems((x) => x.filter((i) => i.id !== id)); }}
        onRetry={p.onRetry}
      />
      <button type="button" onClick={() => setItems((x) => x.map((i) => ({ ...i, status: "done" })))}>끝</button>
      <button type="button" onClick={() => setItems((x) => x.map((i) => ({ ...i, status: "error" })))}>실패</button>
      <button type="button" onClick={() => setItems((x) => x.map((i) => ({ ...i, status: "uploading", progress: 40 })))}>전송</button>
    </>
  );
}

describe("FileUpload", () => {
  it("adds a file that passes and reports it", () => {
    const onAdd = vi.fn();
    const { container } = render(<Host onAdd={onAdd} accept=".pem" />);
    choose(container, mk("a.pem"));
    expect(onAdd.mock.calls[0][0][0].file.name).toBe("a.pem");
    expect(rowNames(container)).toEqual(["a.pem"]);
    expect(container.querySelector(".upload-item .size")?.textContent).toBe("2 KB");
    expect(container.querySelector(".upload-status")?.textContent).toBe("파일 1개를 추가했습니다.");
  });

  it("replaces the file when it takes one", () => {
    const onRemove = vi.fn();
    const { container } = render(<Host onRemove={onRemove} />);
    choose(container, mk("a.pem"));
    const first = container.querySelector(".upload-item") as HTMLElement;
    choose(container, mk("b.pem"));
    expect(onRemove).toHaveBeenCalledWith(first.dataset.id);
    expect(rowNames(container)).toEqual(["b.pem"]);
  });

  it("rejects by type, size and empty with the site's words, and sends nothing", () => {
    const onAdd = vi.fn();
    const { container } = render(<Host onAdd={onAdd} onRetry={() => {}} accept=".pem,.crt" maxSize={5 * 1024 * 1024} />);
    const msg = () => container.querySelector(".upload-item .msg")?.textContent;
    choose(container, mk("note.txt"));
    expect(msg()).toBe("올릴 수 없는 형식입니다. .pem, .crt 파일을 고르세요.");
    expect(container.querySelector(".upload-item .retry")).toBeNull();
    choose(container, mk("big.pem", 6 * 1024 * 1024));
    expect(msg()).toBe("파일이 너무 큽니다. 5MB 이하 파일을 고르세요.");
    choose(container, mk("empty.pem", 0));
    expect(msg()).toBe("빈 파일입니다. 내용이 있는 파일을 고르세요.");
    expect(onAdd).not.toHaveBeenCalled();
    expect(container.querySelector(".upload-status")?.textContent).toBe("1개는 올릴 수 없습니다. 파일 목록에서 이유를 확인하세요.");
  });

  it("accepts mime wildcards and exact types", () => {
    const onAdd = vi.fn();
    const { container } = render(<Host onAdd={onAdd} multiple accept="image/*,application/pdf" />);
    choose(container, mk("a.png", 10, "image/png"), mk("b.pdf", 11, "application/pdf"), mk("c.txt", 12, "text/plain"));
    expect(onAdd.mock.calls[0][0].map((a: { file: File }) => a.file.name)).toEqual(["a.png", "b.pdf"]);
    expect(rowNames(container)).toEqual(["a.png", "b.pdf", "c.txt"]);
  });

  it("keeps passing files and puts rejected ones last", () => {
    const { container } = render(<Host multiple accept=".csv" />);
    choose(container, mk("bad.exe"), mk("one.csv"));
    expect(rowNames(container)).toEqual(["one.csv", "bad.exe"]);
    expect(container.querySelector(".upload-status")?.textContent).toBe("파일 1개를 추가했습니다. 1개는 올릴 수 없습니다. 파일 목록에서 이유를 확인하세요.");
  });

  it("rejects duplicates and files over the count", () => {
    const { container } = render(<Host multiple maxFiles={2} />);
    choose(container, mk("a.csv"), mk("b.csv", 10));
    choose(container, mk("a.csv"));
    expect(container.querySelector(".upload-item[data-rejected] .msg")?.textContent).toBe("이미 추가한 파일입니다. 다른 파일을 고르세요.");
    choose(container, mk("c.csv", 11));
    expect(Array.from(container.querySelectorAll(".upload-item[data-rejected] .msg")).at(-1)?.textContent).toBe("파일이 너무 많습니다. 2개까지 올릴 수 있습니다.");
  });

  it("shows progress, done and a failed send with retry", () => {
    const onRetry = vi.fn();
    const { container } = render(<FileUpload onAdd={() => {}} onRetry={onRetry} items={[
      { id: "1", name: "a.log", size: 10, status: "uploading", progress: 60 },
      { id: "2", name: "b.log", size: 10, status: "done" },
      { id: "3", name: "c.log", size: 10, status: "error" },
    ]} />);
    expect(screen.getByRole("progressbar", { name: "a.log 전송" }).getAttribute("aria-valuenow")).toBe("60");
    expect(container.querySelector('[data-id="2"] .sr-only')?.textContent).toContain("완료");
    expect(container.querySelector('[data-id="3"] .msg')?.textContent).toBe("전송하지 못했습니다. 다시 시도하세요.");
    fireEvent.click(screen.getByRole("button", { name: "c.log 다시 시도" }));
    expect(onRetry).toHaveBeenCalledWith("3");
  });

  it("groups retry + remove in a ButtonGroup and leaves a lone remove ungrouped (2026-11-18, same as the site)", () => {
    const { container } = render(<FileUpload onAdd={() => {}} onRetry={() => {}} items={[{ id: "1", name: "a.log", size: 10, status: "done" }, { id: "2", name: "b.log", size: 10, status: "error" }]} />);
    const kids = (id: string) => Array.from(container.querySelector(`[data-id="${id}"]`)!.children).map((k) => k.matches(".btn-group") ? `[${Array.from(k.children).map((b) => b.classList.contains("retry") ? "retry" : "remove").join("|")}]` : k.matches(".remove") ? "remove" : k.className.split(" ")[0]);
    expect(kids("1").slice(-1)).toEqual(["remove"]);
    expect(kids("2").slice(-1)).toEqual(["[retry|remove]"]);
  });

  it("has no retry unless the product gives onRetry", () => {
    const { container } = render(<FileUpload onAdd={() => {}} items={[{ id: "1", name: "a", status: "error" }]} />);
    expect(container.querySelector(".retry")).toBeNull();
  });

  it("moves the focus after a remove to the next, previous, then the button", () => {
    const { container } = render(<Host multiple />);
    act(() => choose(container, mk("a.csv", 1), mk("b.csv", 2), mk("c.csv", 3)));
    const del = (n: string) => screen.getByRole("button", { name: `${n} 지우기` });
    del("a.csv").focus();
    fireEvent.click(del("a.csv"));
    expect(document.activeElement).toBe(del("b.csv"));
    del("c.csv").focus();
    fireEvent.click(del("c.csv"));
    expect(document.activeElement).toBe(del("b.csv"));
    fireEvent.click(del("b.csv"));
    expect(document.activeElement).toBe(container.querySelector(".upload-pick"));
    expect(container.querySelector(".upload-list")).toBeNull();
    expect(container.querySelector(".upload-status")?.textContent).toBe("b.csv 파일을 지웠습니다.");
  });

  it("keeps a rejected row local and removes it without telling the product", () => {
    const onRemove = vi.fn();
    const { container } = render(<Host onRemove={onRemove} accept=".pem" />);
    choose(container, mk("note.txt"));
    fireEvent.click(screen.getByRole("button", { name: "note.txt 지우기" }));
    expect(onRemove).not.toHaveBeenCalled();
    expect(container.querySelector(".upload-item")).toBeNull();
  });

  it("marks a file drag, takes a drop and ignores other drags", () => {
    const { container } = render(<Host />);
    const root = container.querySelector(".upload") as HTMLElement, zone = container.querySelector(".upload-zone") as HTMLElement;
    fireEvent.dragEnter(zone, { dataTransfer: { types: ["text/plain"] } });
    expect(root.classList.contains("dragging")).toBe(false);
    fireEvent.dragEnter(zone, dropped());
    expect(root.classList.contains("dragging")).toBe(true);
    fireEvent.dragLeave(zone, { relatedTarget: document.body });
    expect(root.classList.contains("dragging")).toBe(false);
    fireEvent.dragEnter(zone, dropped());
    fireEvent.drop(zone, dropped(mk("d.pem")));
    expect(rowNames(container)).toEqual(["d.pem"]);
    expect(root.classList.contains("dragging")).toBe(false);
  });

  it("opens the dialog from the zone and the button, once", () => {
    const { container } = render(<Host />);
    const input = container.querySelector("input[type=file]") as HTMLInputElement, click = vi.spyOn(input, "click");
    fireEvent.click(container.querySelector(".upload-msg") as Element);
    expect(click).toHaveBeenCalledTimes(1);
    fireEvent.click(container.querySelector(".upload-pick") as Element);
    expect(click).toHaveBeenCalledTimes(2);
  });

  it("clears the input so the same file can be chosen again", () => {
    const { container } = render(<Host />);
    const input = container.querySelector("input[type=file]") as HTMLInputElement;
    Object.defineProperty(input, "value", { configurable: true, writable: true, value: "C:\\fakepath\\a.pem" });
    choose(container, mk("a.pem"));
    expect(input.value).toBe("");
  });

  it("does nothing while disabled", () => {
    const onAdd = vi.fn();
    const { container } = render(<Host disabled onAdd={onAdd} />);
    const input = container.querySelector("input[type=file]") as HTMLInputElement, click = vi.spyOn(input, "click");
    fireEvent.click(container.querySelector(".upload-msg") as Element);
    expect(click).not.toHaveBeenCalled();
    expect(fireEvent.drop(container.querySelector(".upload-zone") as Element, dropped(mk("a.pem")))).toBe(true);   // 막지 않은 이벤트
    expect(onAdd).not.toHaveBeenCalled();
    expect((container.querySelector(".upload-pick") as HTMLButtonElement).disabled).toBe(true);
    expect(container.querySelector(".upload")?.classList.contains("disabled")).toBe(true);
  });

  it("compact renders only the button", () => {
    const { container } = render(<Host compact />);
    expect(container.querySelector(".upload.compact .upload-pick")).not.toBeNull();
    expect(container.querySelector(".upload-zone .ico")).toBeNull();
    expect(container.querySelector(".upload-msg")).toBeNull();
  });

  it("takes messages and labels", () => {
    const { container } = render(<Host accept=".pem" messages={{ fileType: "Only {types}." }} labels={{ pick: "Choose", remove: "Remove" }} />);
    choose(container, mk("a.txt"));
    expect(container.querySelector(".upload-item .msg")?.textContent).toBe("Only .pem.");
    expect(screen.getByRole("button", { name: "Choose" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "a.txt Remove" })).toBeTruthy();
  });

  describe("in a validating Form", () => {
    const setup = (start: UploadItem[] = []) => {
      const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
      const r = render(
        <Form validate onSubmit={onSubmit}>
          <Field label="인증서" required help="PEM"><Host required accept=".pem" status="uploading" start={start} /></Field>
          <FormActions><Button type="submit">저장</Button></FormActions>
        </Form>,
      );
      const help = () => r.container.querySelector(".field > .help")?.textContent;
      const save = () => fireEvent.submit(r.container.querySelector("form") as HTMLFormElement);
      return { ...r, help, save, onSubmit };
    };

    it("names the button from the label", () => {
      const { container } = setup();
      const b = container.querySelector(".upload-pick") as HTMLElement;
      expect(b.getAttribute("aria-labelledby")?.split(" ").map((i) => document.getElementById(i)?.textContent?.replace(/\s*\*$/, "")).join(" ")).toBe("인증서 파일 선택");
    });

    it("blocks an empty submit, focuses the button and clears when a file comes", () => {
      const { container, help, save, onSubmit } = setup();
      save();
      expect(help()).toBe("고른 파일이 없습니다. 파일을 선택하세요.");
      expect(onSubmit).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(container.querySelector(".upload-pick"));
      act(() => choose(container, mk("a.pem")));
      expect(help()).toBe("PEM");
      expect(container.querySelector(".field")?.classList.contains("error")).toBe(false);
    });

    it("does not turn red while sending, blocks the submit, and lifts when done", () => {
      const { container, help, save, onSubmit } = setup();
      act(() => choose(container, mk("a.pem")));
      expect(container.querySelector(".field")?.classList.contains("error")).toBe(false);
      save();
      expect(help()).toBe("파일을 전송하고 있습니다. 끝난 뒤 다시 저장하세요.");
      expect(onSubmit).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "전송" }));
      expect(help()).toBe("파일을 전송하고 있습니다. 끝난 뒤 다시 저장하세요.");
      fireEvent.click(screen.getByRole("button", { name: "끝" }));
      expect(help()).toBe("PEM");
      save();
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("blocks on a failed or rejected file", () => {
      const { container, help, save, onSubmit } = setup([{ id: "1", name: "a.pem", size: 3, status: "error" }]);
      save();
      expect(help()).toBe("올리지 못한 파일이 있습니다. 지우거나 다시 시도하세요.");
      expect(onSubmit).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "a.pem 지우기" }));
      expect(help()).toBe("고른 파일이 없습니다. 파일을 선택하세요.");
      act(() => choose(container, mk("x.txt")));
      save();
      expect(help()).toBe("올리지 못한 파일이 있습니다. 지우거나 다시 시도하세요.");
    });

    it("warns as soon as the last required file is removed, before any submit", () => {
      const { help } = setup([{ id: "1", name: "a.pem", size: 3, status: "done" }]);
      expect(help()).toBe("PEM");
      fireEvent.click(screen.getByRole("button", { name: "a.pem 지우기" }));
      expect(help()).toBe("고른 파일이 없습니다. 파일을 선택하세요.");
    });

    it("stays quiet about a failed send until a submit is tried", () => {
      const { help } = setup([{ id: "1", name: "a.pem", size: 3, status: "uploading" }]);
      fireEvent.click(screen.getByRole("button", { name: "실패" }));
      expect(help()).toBe("PEM");
    });
  });
});
