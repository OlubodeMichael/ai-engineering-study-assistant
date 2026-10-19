import { describe, expect, it } from "vitest";
import { createDeltaBatcher } from "./deltaBatcher";

function manualScheduler() {
  const callbacks = new Map<number, () => void>();
  let nextHandle = 1;
  return {
    request(callback: () => void): number {
      callbacks.set(nextHandle, callback);
      return nextHandle++;
    },
    cancel(handle: number): void {
      callbacks.delete(handle);
    },
    runFrame(): void {
      const pending = [...callbacks.values()];
      callbacks.clear();
      pending.forEach((callback) => callback());
    },
  };
}

describe("createDeltaBatcher", () => {
  it("emits all text received within a frame as one exact concatenation", () => {
    const scheduler = manualScheduler();
    const flushed: string[] = [];
    const batcher = createDeltaBatcher((text) => flushed.push(text), scheduler);

    batcher.push("Over");
    batcher.push("fit");
    batcher.push("ting ");
    scheduler.runFrame();
    batcher.push("is");
    scheduler.runFrame();

    expect(flushed).toEqual(["Overfitting ", "is"]);
  });

  it("flushes pending text immediately on demand", () => {
    const scheduler = manualScheduler();
    const flushed: string[] = [];
    const batcher = createDeltaBatcher((text) => flushed.push(text), scheduler);

    batcher.push("partial");
    batcher.flush();
    scheduler.runFrame();

    expect(flushed).toEqual(["partial"]);
  });

  it("discards pending text when cancelled", () => {
    const scheduler = manualScheduler();
    const flushed: string[] = [];
    const batcher = createDeltaBatcher((text) => flushed.push(text), scheduler);

    batcher.push("dropped");
    batcher.cancel();
    scheduler.runFrame();

    expect(flushed).toEqual([]);
  });
});
