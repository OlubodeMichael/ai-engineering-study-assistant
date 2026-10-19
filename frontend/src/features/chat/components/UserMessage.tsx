interface UserMessageProps {
  headingId: string;
  question: string;
}

export function UserMessage({ headingId, question }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <h2 id={headingId} className="sr-only">
        You asked: {question}
      </h2>
      <p
        aria-hidden="true"
        className="max-w-[85%] rounded-3xl bg-subtle px-5 py-2.5 text-base leading-7 wrap-break-word whitespace-pre-wrap text-foreground sm:max-w-[75%]"
      >
        {question}
      </p>
    </div>
  );
}
