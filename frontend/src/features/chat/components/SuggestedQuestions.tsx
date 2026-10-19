import { SUGGESTED_QUESTIONS } from "../constants";
import { ChatColumn } from "./ChatColumn";

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <ChatColumn className="mt-4">
      <section aria-label="Suggested questions">
        <ul className="grid gap-2 sm:grid-cols-2">
          {SUGGESTED_QUESTIONS.map((question) => (
            <li key={question}>
              <button
                type="button"
                onClick={() => onSelect(question)}
                className="h-full w-full rounded-xl border border-border px-3.5 py-2.5 text-left text-sm leading-5 text-foreground transition-colors hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                {question}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </ChatColumn>
  );
}
