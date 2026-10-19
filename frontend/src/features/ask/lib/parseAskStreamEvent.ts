import type { AskStreamEvent, SourceReference, SseMessage } from "../types";

export class StreamProtocolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StreamProtocolError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSourceReference(value: unknown): value is SourceReference {
  return (
    isRecord(value) &&
    typeof value.citation === "number" &&
    Number.isInteger(value.citation) &&
    value.citation > 0 &&
    typeof value.source === "string" &&
    typeof value.chunk_id === "string"
  );
}

function parseJsonPayload(message: SseMessage): Record<string, unknown> {
  let payload: unknown;
  try {
    payload = JSON.parse(message.data);
  } catch {
    throw new StreamProtocolError(`Malformed JSON in "${message.event}" event.`);
  }

  if (!isRecord(payload)) {
    throw new StreamProtocolError(`Expected an object in "${message.event}" event.`);
  }
  return payload;
}

function parseSources(payload: Record<string, unknown>): AskStreamEvent {
  const { sources } = payload;
  if (!Array.isArray(sources) || !sources.every(isSourceReference)) {
    throw new StreamProtocolError('Invalid "sources" event payload.');
  }
  return { type: "sources", sources };
}

function parseDelta(payload: Record<string, unknown>): AskStreamEvent {
  if (typeof payload.text !== "string") {
    throw new StreamProtocolError('Invalid "delta" event payload.');
  }
  return { type: "delta", text: payload.text };
}

function parseError(payload: Record<string, unknown>): AskStreamEvent {
  const message =
    typeof payload.message === "string" && payload.message.trim() !== ""
      ? payload.message
      : "Unable to complete the request.";
  return { type: "error", message };
}

/**
 * Converts a raw SSE message into a typed Ask event.
 * Returns null for unknown event names so newer backends stay compatible.
 * Throws StreamProtocolError for known events with malformed payloads.
 */
export function parseAskStreamEvent(message: SseMessage): AskStreamEvent | null {
  switch (message.event) {
    case "sources":
      return parseSources(parseJsonPayload(message));
    case "delta":
      return parseDelta(parseJsonPayload(message));
    case "done":
      return { type: "done" };
    case "error":
      return parseError(parseJsonPayload(message));
    default:
      return null;
  }
}
