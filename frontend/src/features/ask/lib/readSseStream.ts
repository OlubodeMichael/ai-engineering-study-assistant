import type { SseMessage } from "../types";
import { createSseParser } from "./sseParser";

/**
 * Decodes a UTF-8 byte stream incrementally and yields SSE messages as soon
 * as each one is complete. Multi-byte characters split across reads are
 * held by the decoder until the remaining bytes arrive.
 */
export async function* readSseStream(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<SseMessage> {
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8");
  const parser = createSseParser();
  let isExhausted = false;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      yield* parser.push(decoder.decode(value, { stream: true }));
    }
    isExhausted = true;
    yield* parser.push(decoder.decode());
    yield* parser.finish();
  } finally {
    if (!isExhausted) {
      // Cancellation can reject if the stream already errored; either way
      // the consumer has stopped reading, so there is nothing left to do.
      await reader.cancel().catch(() => undefined);
    }
    reader.releaseLock();
  }
}
