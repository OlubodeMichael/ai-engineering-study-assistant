import { STATUS_LABELS } from "../constants";
import type { Exchange } from "../types";

interface StatusAnnouncerProps {
  exchange: Exchange | null;
}

function announcementFor(exchange: Exchange | null): string {
  if (!exchange) return "";
  if (exchange.status === "failed" && exchange.errorMessage) return exchange.errorMessage;
  return STATUS_LABELS[exchange.status];
}

/**
 * Persistent screen-reader live region for the latest exchange. It only
 * changes on status transitions, so streamed tokens are never announced.
 */
export function StatusAnnouncer({ exchange }: StatusAnnouncerProps) {
  return (
    <p role="status" aria-live="polite" className="sr-only">
      {announcementFor(exchange)}
    </p>
  );
}
