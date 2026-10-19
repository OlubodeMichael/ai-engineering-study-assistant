import type { SourceReference } from "@/features/ask/types";
import type { CitationTarget, CourseReference } from "../types";
import { describeSource } from "./describeSource";
import { referenceAnchorId } from "./elementIds";
import { buildSourceLink } from "./sourceLinks";

/**
 * Merges retrieved passages from the same document into one reference and
 * numbers the documents 1, 2, 3… in order of first appearance.
 */
export function groupCourseReferences(sources: SourceReference[]): CourseReference[] {
  const bySource = new Map<string, CourseReference>();

  for (const { citation, source, chunk_id } of sources) {
    const existing = bySource.get(source);
    if (existing) {
      existing.citations.push(citation);
      existing.chunkIds.push(chunk_id);
      continue;
    }
    bySource.set(source, {
      displayNumber: bySource.size + 1,
      source,
      chunkIds: [chunk_id],
      citations: [citation],
      link: buildSourceLink(source),
      ...describeSource(source),
    });
  }

  return [...bySource.values()];
}

/** Maps every original citation number to its document's display entry. */
export function buildCitationTargets(
  exchangeId: string,
  references: CourseReference[],
): Map<number, CitationTarget> {
  const targets = new Map<number, CitationTarget>();
  for (const reference of references) {
    const target: CitationTarget = {
      displayNumber: reference.displayNumber,
      anchorId: referenceAnchorId(exchangeId, reference.displayNumber),
      title: reference.title,
    };
    for (const citation of reference.citations) targets.set(citation, target);
  }
  return targets;
}
