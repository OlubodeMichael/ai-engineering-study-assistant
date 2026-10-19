import { parseAskStreamEvent, StreamProtocolError } from "../lib/parseAskStreamEvent";
import { readSseStream } from "../lib/readSseStream";
import type { AskProgressEvent, AskRequestBody, StreamOutcome } from "../types";

const ASK_ENDPOINT = "/api/ask";

const MESSAGES = {
  invalidQuestion: "That question couldn't be accepted. Use 1–4,000 characters and try again.",
  backendUnavailable: "The study assistant is unavailable right now. Please try again in a moment.",
  network: "Couldn't reach the study assistant. Check your connection and try again.",
  unreadable: "Something went wrong while receiving the answer. Please try again.",
  answerFailed: "Couldn't write an answer right now. Please try again.",
  generic: "Something went wrong while answering. Please try again.",
} as const;

export class AskRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AskRequestError";
  }
}

function messageForStatus(status: number): string {
  if (status === 400 || status === 422) return MESSAGES.invalidQuestion;
  if (status === 502 || status === 503 || status === 504) return MESSAGES.backendUnavailable;
  return MESSAGES.generic;
}

async function postQuestion(question: string, signal: AbortSignal): Promise<Response> {
  const body: AskRequestBody = { question };
  try {
    return await fetch(ASK_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    console.error("Ask request failed before a response arrived", error);
    throw new AskRequestError(MESSAGES.network);
  }
}

async function consumeEvents(
  stream: ReadableStream<Uint8Array>,
  onEvent: (event: AskProgressEvent) => void,
): Promise<StreamOutcome> {
  for await (const message of readSseStream(stream)) {
    const event = parseAskStreamEvent(message);
    if (event === null) continue;

    if (event.type === "done") return { kind: "completed" };
    if (event.type === "error") {
      console.error(`Answer stream reported an error: ${event.message}`);
      return { kind: "failed", message: MESSAGES.answerFailed };
    }
    onEvent(event);
  }
  return { kind: "interrupted" };
}

/**
 * Sends a question and streams typed events to `onEvent`.
 * Resolves with how the stream ended. Rejects with AskRequestError for
 * user-presentable failures, or with the abort reason if `signal` fires.
 */
export async function streamAnswer(
  question: string,
  signal: AbortSignal,
  onEvent: (event: AskProgressEvent) => void,
): Promise<StreamOutcome> {
  const response = await postQuestion(question, signal);

  if (!response.ok) {
    console.error(`Ask request rejected with HTTP ${response.status}`);
    throw new AskRequestError(messageForStatus(response.status));
  }
  if (!response.body) throw new AskRequestError(MESSAGES.unreadable);

  try {
    return await consumeEvents(response.body, onEvent);
  } catch (error) {
    if (signal.aborted) throw error;
    console.error("Ask stream failed", error);
    if (error instanceof StreamProtocolError) throw new AskRequestError(MESSAGES.unreadable);
    return { kind: "interrupted" };
  }
}
