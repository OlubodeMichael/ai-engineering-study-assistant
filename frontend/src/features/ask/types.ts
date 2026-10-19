export interface AskRequestBody {
  question: string;
}

export interface SourceReference {
  citation: number;
  source: string;
  chunk_id: string;
}

export interface SseMessage {
  event: string;
  data: string;
}

export type AskStreamEvent =
  | { type: "sources"; sources: SourceReference[] }
  | { type: "delta"; text: string }
  | { type: "done" }
  | { type: "error"; message: string };

export type AskProgressEvent = Extract<AskStreamEvent, { type: "sources" | "delta" }>;

export type StreamOutcome =
  | { kind: "completed" }
  | { kind: "failed"; message: string }
  | { kind: "interrupted" };

export type QuestionValidation =
  | { valid: true; question: string }
  | { valid: false; message: string };
