export interface DeltaBatcher {
  push(text: string): void;
  flush(): void;
  cancel(): void;
}

interface FrameScheduler {
  request(callback: () => void): number;
  cancel(handle: number): void;
}

const ANIMATION_FRAME_SCHEDULER: FrameScheduler = {
  request: (callback) => requestAnimationFrame(callback),
  cancel: (handle) => cancelAnimationFrame(handle),
};

/**
 * Collects streamed text and emits it at most once per animation frame,
 * so long answers re-render smoothly instead of once per token.
 * Text is concatenated exactly as received.
 */
export function createDeltaBatcher(
  onFlush: (text: string) => void,
  scheduler: FrameScheduler = ANIMATION_FRAME_SCHEDULER,
): DeltaBatcher {
  let pending = "";
  let frameHandle: number | null = null;

  function flush(): void {
    if (frameHandle !== null) scheduler.cancel(frameHandle);
    frameHandle = null;
    if (pending === "") return;
    const text = pending;
    pending = "";
    onFlush(text);
  }

  return {
    push(text: string): void {
      pending += text;
      if (frameHandle === null) frameHandle = scheduler.request(flush);
    },
    flush,
    cancel(): void {
      if (frameHandle !== null) scheduler.cancel(frameHandle);
      frameHandle = null;
      pending = "";
    },
  };
}
