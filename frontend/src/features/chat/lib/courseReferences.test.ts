import { describe, expect, it } from "vitest";
import type { SourceReference } from "@/features/ask/types";
import { buildCitationTargets, groupCourseReferences } from "./courseReferences";
import { describeSource, formatSlug } from "./describeSource";

const FUNCTION_CALLING = "phases/11-llm-engineering/09-function-calling/docs/en.md";

function source(citation: number, path: string): SourceReference {
  return { citation, source: path, chunk_id: `${path}::chunk-${citation}` };
}

describe("describeSource", () => {
  it("uses the lesson's real heading and phase name", () => {
    expect(describeSource(FUNCTION_CALLING)).toEqual({
      title: "Function Calling & Tool Use",
      context: "Phase 11 · LLM Engineering",
    });
  });

  it("uses friendly labels for course-level documents and phase overviews", () => {
    expect(describeSource("README.md").title).toBe("Course Overview");
    expect(describeSource("ROADMAP.md").title).toBe("Course Roadmap");
    expect(describeSource("phases/02-ml-fundamentals/README.md")).toEqual({
      title: "Phase Overview",
      context: "Phase 2 · ML Fundamentals",
    });
  });

  it("formats the slug when no title is known", () => {
    expect(describeSource("phases/99-future-topics/03-new-lesson/docs/en.md")).toEqual({
      title: "New Lesson",
      context: "Phase 99 · Future Topics",
    });
    expect(formatSlug("01-what-is-machine-learning")).toBe("What Is Machine Learning");
  });
});

describe("groupCourseReferences", () => {
  const sources = [
    source(1, FUNCTION_CALLING),
    source(2, FUNCTION_CALLING),
    source(3, "README.md"),
    source(4, FUNCTION_CALLING),
    source(5, "ROADMAP.md"),
  ];

  it("merges passages per document and numbers documents sequentially", () => {
    const references = groupCourseReferences(sources);
    expect(references.map((reference) => reference.displayNumber)).toEqual([1, 2, 3]);
    expect(references[0]).toMatchObject({
      citations: [1, 2, 4],
      chunkIds: [
        `${FUNCTION_CALLING}::chunk-1`,
        `${FUNCTION_CALLING}::chunk-2`,
        `${FUNCTION_CALLING}::chunk-4`,
      ],
      title: "Function Calling & Tool Use",
      link: { kind: "lesson" },
    });
    expect(references[2].title).toBe("Course Roadmap");
  });

  it("maps every original citation to its document's display number", () => {
    const targets = buildCitationTargets("exchange-1", groupCourseReferences(sources));
    const displayNumbers = [1, 2, 3, 4, 5].map((citation) => targets.get(citation)?.displayNumber);
    expect(displayNumbers).toEqual([1, 1, 2, 1, 3]);
    expect(targets.get(3)).toEqual({
      displayNumber: 2,
      anchorId: "exchange-1--ref-2",
      title: "Course Overview",
    });
  });
});
