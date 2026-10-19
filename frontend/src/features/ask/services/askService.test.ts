import { afterEach, describe, expect, it, vi } from "vitest";
import type { AskProgressEvent } from "../types";
import { AskRequestError, streamAnswer } from "./askService";

function sseResponse(chunks: string[], status = 200): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
  return new Response(body, { status, headers: { "Content-Type": "text/event-stream" } });
}

async function run(response: Response) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
  const events: AskProgressEvent[] = [];
  const outcome = await streamAnswer("What is overfitting?", new AbortController().signal, (e) =>
    events.push(e),
  );
  return { outcome, events };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("streamAnswer", () => {
  it("streams sources and deltas, then completes on done", async () => {
    const { outcome, events } = await run(
      sseResponse([
        'event: sources\ndata: {"sources":[{"citation":1,"source":"README.md","chunk_id":"README.md::chunk-0"}]}\n\n',
        'event: delta\ndata: {"text":"Over"}\n\nevent: de',
        'lta\ndata: {"text":"fitting [1]"}\n\n',
        "event: done\ndata: {}\n\n",
      ]),
    );

    expect(outcome).toEqual({ kind: "completed" });
    const text = events.map((event) => (event.type === "delta" ? event.text : "")).join("");
    expect(text).toBe("Overfitting [1]");
  });

  it("reports an error event even when the HTTP status is 200", async () => {
    const { outcome } = await run(
      sseResponse(['event: error\ndata: {"message":"Unable to complete the request."}\n\n']),
    );
    expect(outcome).toEqual({
      kind: "failed",
      message: "Couldn't write an answer right now. Please try again.",
    });
  });

  it("reports an interrupted stream when it ends without done or error", async () => {
    const { outcome, events } = await run(
      sseResponse(['event: delta\ndata: {"text":"Partial"}\n\n', 'event: delta\ndata: {"te']),
    );
    expect(outcome).toEqual({ kind: "interrupted" });
    expect(events).toEqual([{ type: "delta", text: "Partial" }]);
  });

  it("maps HTTP failures to readable errors", async () => {
    await expect(run(new Response("{}", { status: 422 }))).rejects.toThrow(AskRequestError);
    await expect(run(new Response("{}", { status: 502 }))).rejects.toThrow(/unavailable/);
  });
});
