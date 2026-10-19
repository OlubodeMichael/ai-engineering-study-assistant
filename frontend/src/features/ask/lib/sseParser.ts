import type { SseMessage } from "../types";

const DEFAULT_EVENT_TYPE = "message";
const LINE_BREAK_PATTERN = /[\r\n]/g;

export interface SseParser {
  push(chunk: string): SseMessage[];
  finish(): SseMessage[];
}

interface PendingEvent {
  eventType: string;
  dataLines: string[];
}

function createPendingEvent(): PendingEvent {
  return { eventType: "", dataLines: [] };
}

function applyField(pending: PendingEvent, line: string): void {
  if (line.startsWith(":")) return;

  const separatorIndex = line.indexOf(":");
  const field = separatorIndex === -1 ? line : line.slice(0, separatorIndex);
  const rawValue = separatorIndex === -1 ? "" : line.slice(separatorIndex + 1);
  const value = rawValue.startsWith(" ") ? rawValue.slice(1) : rawValue;

  if (field === "event") pending.eventType = value;
  if (field === "data") pending.dataLines.push(value);
}

/**
 * Incremental parser for the text/event-stream format.
 * Accepts already-decoded text in arbitrary fragments and returns every
 * event completed by that fragment. Supports LF, CRLF, and CR line endings.
 */
export function createSseParser(): SseParser {
  let buffer = "";
  let pending = createPendingEvent();

  function processLine(line: string, messages: SseMessage[]): void {
    if (line !== "") {
      applyField(pending, line);
      return;
    }

    if (pending.dataLines.length > 0) {
      messages.push({
        event: pending.eventType || DEFAULT_EVENT_TYPE,
        data: pending.dataLines.join("\n"),
      });
    }
    pending = createPendingEvent();
  }

  function drainLines(isFinal: boolean): SseMessage[] {
    const messages: SseMessage[] = [];
    let lineStart = 0;
    LINE_BREAK_PATTERN.lastIndex = 0;

    for (
      let match = LINE_BREAK_PATTERN.exec(buffer);
      match !== null;
      match = LINE_BREAK_PATTERN.exec(buffer)
    ) {
      const breakIndex = match.index;
      const isCarriageReturn = buffer[breakIndex] === "\r";
      const isLastCharacter = breakIndex === buffer.length - 1;

      // A trailing CR may be the first half of a CRLF split across reads.
      if (isCarriageReturn && isLastCharacter && !isFinal) break;

      const isCrlf = isCarriageReturn && buffer[breakIndex + 1] === "\n";
      processLine(buffer.slice(lineStart, breakIndex), messages);
      lineStart = breakIndex + (isCrlf ? 2 : 1);
      LINE_BREAK_PATTERN.lastIndex = lineStart;
    }

    buffer = buffer.slice(lineStart);
    return messages;
  }

  return {
    push(chunk: string): SseMessage[] {
      buffer += chunk;
      return drainLines(false);
    },
    finish(): SseMessage[] {
      const messages = drainLines(true);
      // Per the SSE spec, an event without a terminating blank line is dropped.
      buffer = "";
      pending = createPendingEvent();
      return messages;
    },
  };
}
