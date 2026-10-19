import { ChevronRightIcon } from "@/shared/components/icons";
import type { CourseReference } from "../types";
import { CourseReferenceItem } from "./CourseReferenceItem";

interface CourseReferencesProps {
  exchangeId: string;
  references: CourseReference[];
}

export function CourseReferences({ exchangeId, references }: CourseReferencesProps) {
  return (
    <details className="group/refs">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted hover:bg-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-focus [&::-webkit-details-marker]:hidden">
        <ChevronRightIcon className="transition-transform group-open/refs:rotate-90 motion-reduce:transition-none" />
        Course references ({references.length})
      </summary>
      <ul className="mt-1 space-y-0.5">
        {references.map((reference) => (
          <CourseReferenceItem key={reference.source} exchangeId={exchangeId} reference={reference} />
        ))}
      </ul>
    </details>
  );
}
