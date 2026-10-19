import { ChatColumn } from "./ChatColumn";

export function EmptyState() {
  return (
    <ChatColumn className="mb-8 space-y-3 text-center">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">
        What do you want to learn about AI engineering?
      </h2>
      <p className="mx-auto max-w-md text-sm leading-6 text-muted">
        Answers reference lessons from the AI Engineering from Scratch course. Each question is
        answered on its own.
      </p>
    </ChatColumn>
  );
}
