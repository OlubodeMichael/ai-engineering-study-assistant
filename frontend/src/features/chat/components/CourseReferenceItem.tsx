import { ExternalLinkIcon } from "@/shared/components/icons";
import { CITATION_BADGE_CLASSES } from "../constants";
import { referenceAnchorId } from "../lib/elementIds";
import type { CourseReference } from "../types";

interface CourseReferenceItemProps {
  exchangeId: string;
  reference: CourseReference;
}

export function CourseReferenceItem({ exchangeId, reference }: CourseReferenceItemProps) {
  const { title, context, link, displayNumber } = reference;

  return (
    <li
      id={referenceAnchorId(exchangeId, displayNumber)}
      tabIndex={-1}
      className="flex scroll-mt-24 items-start gap-3 rounded-lg px-2 py-2 focus:bg-hover focus:outline-none"
    >
      <span className={`mt-0.5 ${CITATION_BADGE_CLASSES}`}>
        <span className="sr-only">Reference </span>
        {displayNumber}
      </span>
      <span className="min-w-0">
        {link ? (
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-baseline gap-1 text-sm font-medium text-foreground hover:underline hover:underline-offset-2 focus-visible:outline-2 focus-visible:outline-focus"
          >
            {title}
            <ExternalLinkIcon width={12} height={12} className="shrink-0 self-center text-muted" />
            <span className="sr-only">
              {link.kind === "lesson" ? "(open lesson in a new tab)" : "(opens in a new tab)"}
            </span>
          </a>
        ) : (
          <span className="text-sm font-medium text-foreground">{title}</span>
        )}
        {context && <span className="block text-xs text-muted">{context}</span>}
      </span>
    </li>
  );
}
