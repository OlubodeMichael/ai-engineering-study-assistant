import { describe, expect, it } from "vitest";
import { parseAskStreamEvent, StreamProtocolError } from "./parseAskStreamEvent";

describe("parseAskStreamEvent", () => {
  it("parses a sources event", () => {
    const source = {
      citation: 1,
      source: "phases/11-llm-engineering/09-function-calling/docs/en.md",
      chunk_id: "phases/11-llm-engineering/09-function-calling/docs/en.md::chunk-0",
    };
    expect(
      parseAskStreamEvent({ event: "sources", data: JSON.stringify({ sources: [source] }) }),
    ).toEqual({ type: "sources", sources: [source] });
  });

  it("preserves delta text exactly, including whitespace", () => {
    expect(parseAskStreamEvent({ event: "delta", data: '{"text":" over\\nfit "}' })).toEqual({
      type: "delta",
      text: " over\nfit ",
    });
  });

  it("parses done and error events", () => {
    expect(parseAskStreamEvent({ event: "done", data: "{}" })).toEqual({ type: "done" });
    expect(
      parseAskStreamEvent({ event: "error", data: '{"message":"No documents are indexed."}' }),
    ).toEqual({ type: "error", message: "No documents are indexed." });
  });

  it("falls back to a generic message for an error event without one", () => {
    expect(parseAskStreamEvent({ event: "error", data: "{}" })).toEqual({
      type: "error",
      message: "Unable to complete the request.",
    });
  });

  it("ignores unknown event types", () => {
    expect(parseAskStreamEvent({ event: "heartbeat", data: "{}" })).toBeNull();
  });

  it("rejects malformed payloads for known events", () => {
    expect(() => parseAskStreamEvent({ event: "delta", data: "{not json" })).toThrow(
      StreamProtocolError,
    );
    expect(() => parseAskStreamEvent({ event: "delta", data: '{"text":5}' })).toThrow(
      StreamProtocolError,
    );
    expect(() =>
      parseAskStreamEvent({ event: "sources", data: '{"sources":[{"citation":"1"}]}' }),
    ).toThrow(StreamProtocolError);
  });
});
