import type { RefObject } from "react";
import { ArrowDownIcon } from "@/shared/components/icons";
import type { Exchange } from "../types";
import { ChatColumn } from "./ChatColumn";
import { ExchangeView } from "./ExchangeView";

interface ConversationViewProps {
  exchanges: Exchange[];
  isBusy: boolean;
  onRetry: (question: string) => void;
  scrollRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  showScrollToLatest: boolean;
  onScrollToLatest: () => void;
}

export function ConversationView({
  exchanges,
  isBusy,
  onRetry,
  scrollRef,
  contentRef,
  showScrollToLatest,
  onScrollToLatest,
}: ConversationViewProps) {
  return (
    <div className="relative min-h-0 flex-1">
      <div ref={scrollRef} className="h-full overflow-x-hidden overflow-y-auto overscroll-contain">
        <ChatColumn ref={contentRef} className="space-y-10 pt-6 pb-10 sm:pt-10">
          {exchanges.map((exchange) => (
            <ExchangeView key={exchange.id} exchange={exchange} isBusy={isBusy} onRetry={onRetry} />
          ))}
        </ChatColumn>
      </div>
      {showScrollToLatest && (
        <button
          type="button"
          onClick={onScrollToLatest}
          className="absolute bottom-3 left-1/2 inline-flex h-9 -translate-x-1/2 items-center gap-1.5 rounded-full border border-border bg-background px-3.5 text-sm text-foreground shadow-sm hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          <ArrowDownIcon />
          Scroll to latest
        </button>
      )}
    </div>
  );
}
