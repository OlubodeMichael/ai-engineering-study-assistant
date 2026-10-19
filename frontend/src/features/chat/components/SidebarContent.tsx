import type { ReactNode } from "react";
import { NewQuestionIcon } from "@/shared/components/icons";
import type { SessionQuestion } from "../types";

interface SidebarContentProps {
  questions: SessionQuestion[];
  activeThreadId: string | null;
  onNewQuestion: () => void;
  onSelectQuestion: (question: SessionQuestion) => void;
  headerAction?: ReactNode;
}

const ROW_CLASSES =
  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-foreground hover:bg-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus";

export function SidebarContent({
  questions,
  activeThreadId,
  onNewQuestion,
  onSelectQuestion,
  headerAction,
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col gap-4 p-2">
      <div className="flex items-center justify-between gap-2 px-2.5 pt-2">
        <p className="text-sm font-semibold text-foreground">AI Engineering Study Assistant</p>
        {headerAction}
      </div>
      <button type="button" onClick={onNewQuestion} className={ROW_CLASSES}>
        <NewQuestionIcon />
        New question
      </button>
      <nav aria-labelledby="session-questions-heading" className="min-h-0 flex-1 overflow-y-auto">
        <h2 id="session-questions-heading" className="px-2.5 pb-1 text-xs font-medium text-muted">
          This session
        </h2>
        {questions.length === 0 ? (
          <p className="px-2.5 py-2 text-sm text-muted">Questions you ask will appear here.</p>
        ) : (
          <ul>
            {questions.map((item) => {
              const isCurrent = item.threadId === activeThreadId;
              return (
                <li key={item.exchangeId}>
                  <button
                    type="button"
                    onClick={() => onSelectQuestion(item)}
                    aria-current={isCurrent ? "true" : undefined}
                    title={item.question}
                    className={`${ROW_CLASSES} ${isCurrent ? "bg-hover/60" : ""}`}
                  >
                    <span className="truncate">{item.question}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </div>
  );
}
