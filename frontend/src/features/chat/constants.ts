import type { ExchangeStatus } from "./types";

export const SUGGESTED_QUESTIONS: readonly string[] = [
  "What is overfitting, and how can I reduce it?",
  "How does function calling work?",
  "What is the difference between RAG and fine-tuning?",
  "How do checkpoints help agents recover from failures?",
];

export const STATUS_LABELS: Record<ExchangeStatus, string> = {
  retrieving: "Finding relevant lessons…",
  generating: "Writing answer…",
  completed: "Answer complete",
  cancelled: "Stopped",
  interrupted: "Response interrupted",
  failed: "Couldn't finish the answer",
};

export const CITATION_BADGE_CLASSES =
  "inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-subtle px-1 text-[0.6875rem] leading-none font-medium text-muted";

export const ACTIVE_STATUSES: ReadonlySet<ExchangeStatus> = new Set(["retrieving", "generating"]);

export const INCOMPLETE_STATUSES: ReadonlySet<ExchangeStatus> = new Set([
  "cancelled",
  "interrupted",
  "failed",
]);
