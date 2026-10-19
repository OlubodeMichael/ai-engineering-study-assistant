import { CopyButton } from "@/shared/components/CopyButton";
import { ACTIVE_STATUSES, INCOMPLETE_STATUSES, STATUS_LABELS } from "../constants";
import { useCourseReferences } from "../hooks/useCourseReferences";
import type { Exchange } from "../types";
import { CourseReferences } from "./CourseReferences";
import { MarkdownAnswer } from "./MarkdownAnswer";
import { ResultNotice } from "./ResultNotice";

interface AssistantMessageProps {
  exchange: Exchange;
  isBusy: boolean;
  onRetry: (question: string) => void;
}

interface ActivityLineProps {
  label: string;
}

function ActivityLine({ label }: ActivityLineProps) {
  return (
    <p className="flex items-center gap-2 text-sm text-muted">
      <span className="size-2 rounded-full bg-muted motion-safe:animate-pulse" aria-hidden="true" />
      {label}
    </p>
  );
}

export function AssistantMessage({ exchange, isBusy, onRetry }: AssistantMessageProps) {
  const { references, citationTargets } = useCourseReferences(exchange.id, exchange.sources);
  const isActive = ACTIVE_STATUSES.has(exchange.status);
  const hasAnswer = exchange.answer !== "";
  const isIncomplete = INCOMPLETE_STATUSES.has(exchange.status) && hasAnswer;

  return (
    <div className="min-w-0 space-y-3" aria-busy={isActive}>
      {isActive && !hasAnswer && <ActivityLine label={STATUS_LABELS[exchange.status]} />}
      {exchange.status === "completed" && !hasAnswer && (
        <p className="text-muted">No answer was written for this question. Please try again.</p>
      )}
      {isIncomplete && (
        <p className="inline-flex rounded-full bg-subtle px-2.5 py-0.5 text-xs font-medium text-muted">
          Incomplete answer
        </p>
      )}
      {hasAnswer && <MarkdownAnswer markdown={exchange.answer} citationTargets={citationTargets} />}
      <ResultNotice
        exchange={exchange}
        onRetry={() => onRetry(exchange.question)}
        retryDisabled={isBusy}
      />
      {!isActive && hasAnswer && (
        <div className="-ml-2">
          <CopyButton label="Copy answer" getText={() => exchange.answer} />
        </div>
      )}
      <div className="-ml-2">
        {references.length > 0 ? (
          <CourseReferences exchangeId={exchange.id} references={references} />
        ) : (
          exchange.status === "completed" && (
            <p className="px-2 text-sm text-muted">No course references for this answer.</p>
          )
        )}
      </div>
    </div>
  );
}
