import { describe, expect, it } from "vitest";
import type { SseMessage } from "../types";
import { readSseStream } from "./readSseStream";

function streamOf(chunks: Uint8Array[]): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });
}

async function collect(stream: ReadableStream<Uint8Array>): Promise<SseMessage[]> {
  const messages: SseMessage[] = [];
  for await (const message of readSseStream(stream)) messages.push(message);
  return messages;
}

describe("readSseStream", () => {
  it("decodes multi-byte UTF-8 characters split across reads", async () => {
    const bytes = new TextEncoder().encode('event: delta\ndata: {"text":"héllo 🤖 世界"}\n\n');
    const robotStart = bytes.indexOf(0xf0);
    const chunks = [
      bytes.slice(0, robotStart + 1),
      bytes.slice(robotStart + 1, robotStart + 3),
      bytes.slice(robotStart + 3),
    ];

    expect(await collect(streamOf(chunks))).toEqual([
      { event: "delta", data: '{"text":"héllo 🤖 世界"}' },
    ]);
  });

  it("decodes a stream delivered one byte at a time", async () => {
    const bytes = new TextEncoder().encode('event: delta\r\ndata: {"text":"ñ"}\r\n\r\n');
    const chunks = Array.from(bytes, (byte) => Uint8Array.of(byte));

    expect(await collect(streamOf(chunks))).toEqual([{ event: "delta", data: '{"text":"ñ"}' }]);
  });

  it("cancels the underlying stream when the consumer stops early", async () => {
    let cancelled = false;
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode("event: done\ndata: {}\n\n"));
      },
      cancel() {
        cancelled = true;
      },
    });

    for await (const message of readSseStream(stream)) {
      expect(message.event).toBe("done");
      break;
    }
    expect(cancelled).toBe(true);
  });
});
