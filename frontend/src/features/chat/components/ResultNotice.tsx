import { Button } from "@/shared/components/Button";
import type { Exchange } from "../types";

interface ResultNoticeProps {
  exchange: Exchange;
  onRetry: () => void;
  retryDisabled: boolean;
}

interface NoticeContent {
  title: string;
  description: string;
  tone: "neutral" | "danger";
}

const FALLBACK_ERROR = "Something went wrong while answering. Please try again.";

function noticeContentFor({ status, answer, errorMessage }: Exchange): NoticeContent | null {
  const partialNote = answer ? " The partial answer above is incomplete." : "";

  switch (status) {
    case "cancelled":
      return {
        title: "You stopped this answer.",
        description: `Ask again to get a full response.${partialNote}`,
        tone: "neutral",
      };
    case "interrupted":
      return {
        title: "The response was interrupted.",
        description: `The connection closed before the answer finished.${partialNote}`,
        tone: "danger",
      };
    case "failed":
      return {
        title: "The answer couldn't be completed.",
        description: `${errorMessage ?? FALLBACK_ERROR}${partialNote}`,
        tone: "danger",
      };
    default:
      return null;
  }
}

const TONE_CLASSES: Record<NoticeContent["tone"], string> = {
  neutral: "border-border bg-subtle",
  danger: "border-danger/30 bg-danger-soft",
};

export function ResultNotice({ exchange, onRetry, retryDisabled }: ResultNoticeProps) {
  const content = noticeContentFor(exchange);
  if (!content) return null;

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${TONE_CLASSES[content.tone]}`}
    >
      <div className="text-sm">
        <p className={`font-medium ${content.tone === "danger" ? "text-danger" : "text-foreground"}`}>
          {content.title}
        </p>
        <p className="mt-0.5 text-muted">{content.description}</p>
      </div>
      <Button variant="secondary" onClick={onRetry} disabled={retryDisabled} className="shrink-0">
        Try again
      </Button>
    </div>
  );
}
