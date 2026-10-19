import type { SourceReference, StreamOutcome } from "@/features/ask/types";

export type ExchangeStatus =
  | "retrieving"
  | "generating"
  | "completed"
  | "cancelled"
  | "interrupted"
  | "failed";

/** One question and its independently generated answer. */
export interface Exchange {
  id: string;
  question: string;
  answer: string;
  sources: SourceReference[];
  status: ExchangeStatus;
  errorMessage: string | null;
}

/** A visible conversation, started fresh by "New question". */
export interface Thread {
  id: string;
  exchanges: Exchange[];
}

export interface ChatState {
  threads: Thread[];
  activeThreadId: string | null;
  latestExchangeId: string | null;
}

export type ChatAction =
  | { type: "questionAsked"; newThreadId: string; exchangeId: string; question: string }
  | { type: "sourcesReceived"; exchangeId: string; sources: SourceReference[] }
  | { type: "deltaReceived"; exchangeId: string; text: string }
  | { type: "finished"; exchangeId: string; outcome: StreamOutcome }
  | { type: "cancelled"; exchangeId: string }
  | { type: "failed"; exchangeId: string; message: string }
  | { type: "newConversationStarted" }
  | { type: "threadSelected"; threadId: string };

/** Where a source opens: the course website for lessons, GitHub otherwise. */
export interface SourceLink {
  kind: "lesson" | "repository";
  url: string;
}

/**
 * One course document shown to the learner. Several retrieved passages from
 * the same document collapse into a single reference with one sequential
 * `displayNumber`. `source`, `chunkIds`, and the original `citations` are
 * kept for citation mapping but never displayed.
 */
export interface CourseReference {
  displayNumber: number;
  source: string;
  chunkIds: string[];
  citations: number[];
  title: string;
  context: string | null;
  link: SourceLink | null;
}

/** Where an original citation number points once documents are merged. */
export interface CitationTarget {
  displayNumber: number;
  anchorId: string;
  title: string;
}

export interface SourceDescription {
  title: string;
  context: string | null;
}

export interface SessionQuestion {
  threadId: string;
  exchangeId: string;
  question: string;
}