"use client";

import { useMemo } from "react";
import type { SourceReference } from "@/features/ask/types";
import { buildCitationTargets, groupCourseReferences } from "../lib/courseReferences";
import type { CitationTarget, CourseReference } from "../types";

export interface UseCourseReferencesResult {
  references: CourseReference[];
  citationTargets: ReadonlyMap<number, CitationTarget>;
}

/** Derives grouped references and the citation-to-entry map for one answer. */
export function useCourseReferences(
  exchangeId: string,
  sources: SourceReference[],
): UseCourseReferencesResult {
  return useMemo(() => {
    const references = groupCourseReferences(sources);
    return { references, citationTargets: buildCitationTargets(exchangeId, references) };
  }, [exchangeId, sources]);
}
