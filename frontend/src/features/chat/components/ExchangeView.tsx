import { memo } from "react";
import { exchangeElementId } from "../lib/elementIds";
import type { Exchange } from "../types";
import { AssistantMessage } from "./AssistantMessage";
import { UserMessage } from "./UserMessage";

interface ExchangeViewProps {
  exchange: Exchange;
  isBusy: boolean;
  onRetry: (question: string) => void;
}

export const ExchangeView = memo(function ExchangeView({
  exchange,
  isBusy,
  onRetry,
}: ExchangeViewProps) {
  const headingId = `${exchange.id}--question`;

  return (
    <article
      id={exchangeElementId(exchange.id)}
      aria-labelledby={headingId}
      tabIndex={-1}
      className="scroll-mt-6 space-y-6 focus:outline-none"
    >
      <UserMessage headingId={headingId} question={exchange.question} />
      <AssistantMessage exchange={exchange} isBusy={isBusy} onRetry={onRetry} />
    </article>
  );
});
