import { describe, expect, it } from "vitest";
import { createSseParser } from "./sseParser";

function parseAll(chunks: string[]) {
  const parser = createSseParser();
  const messages = chunks.flatMap((chunk) => parser.push(chunk));
  return [...messages, ...parser.finish()];
}

describe("createSseParser", () => {
  it("parses a single LF-delimited event", () => {
    expect(parseAll(['event: delta\ndata: {"text":"Hi"}\n\n'])).toEqual([
      { event: "delta", data: '{"text":"Hi"}' },
    ]);
  });

  it("parses multiple events delivered in one chunk", () => {
    const chunk =
      'event: sources\ndata: {"sources":[]}\n\nevent: delta\ndata: {"text":"A"}\n\nevent: done\ndata: {}\n\n';
    expect(parseAll([chunk]).map((message) => message.event)).toEqual([
      "sources",
      "delta",
      "done",
    ]);
  });

  it("reassembles an event split at every character", () => {
    const raw = 'event: delta\ndata: {"text":"split"}\n\n';
    expect(parseAll(raw.split(""))).toEqual([{ event: "delta", data: '{"text":"split"}' }]);
  });

  it("supports CRLF delimiters, including a CRLF split across chunks", () => {
    const messages = parseAll(['event: delta\r\ndata: {"text":"x"}\r', "\n\r", "\n"]);
    expect(messages).toEqual([{ event: "delta", data: '{"text":"x"}' }]);
  });

  it("supports bare CR line endings", () => {
    expect(parseAll(["event: done\rdata: {}\r\r"])).toEqual([{ event: "done", data: "{}" }]);
  });

  it("joins multiple data lines with newlines", () => {
    expect(parseAll(["event: delta\ndata: line one\ndata: line two\n\n"])).toEqual([
      { event: "delta", data: "line one\nline two" },
    ]);
  });

  it("strips exactly one leading space from field values", () => {
    expect(parseAll(["data:  two spaces\n\n", "data:none\n\n"])).toEqual([
      { event: "message", data: " two spaces" },
      { event: "message", data: "none" },
    ]);
  });

  it("ignores comments and unknown fields", () => {
    expect(parseAll([": keep-alive\nid: 7\nretry: 100\nevent: done\ndata: {}\n\n"])).toEqual([
      { event: "done", data: "{}" },
    ]);
  });

  it("does not dispatch events that have no data lines", () => {
    expect(parseAll(["event: ping\n\n"])).toEqual([]);
  });

  it("drops an incomplete trailing event when the stream finishes", () => {
    const parser = createSseParser();
    expect(parser.push('event: delta\ndata: {"text":"partial"}')).toEqual([]);
    expect(parser.finish()).toEqual([]);
  });

  it("drops an event missing its blank-line terminator at end of stream", () => {
    expect(parseAll(['event: delta\ndata: {"text":"A"}\n\nevent: done\ndata: {}\n'])).toEqual([
      { event: "delta", data: '{"text":"A"}' },
    ]);
  });
});
