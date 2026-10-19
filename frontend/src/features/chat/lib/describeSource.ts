import courseTitles from "../data/courseTitles.json";
import type { SourceDescription } from "../types";

interface CourseTitles {
  phases: Partial<Record<string, string>>;
  lessons: Partial<Record<string, string>>;
}

const COURSE_TITLES: CourseTitles = courseTitles;
const COURSE_NAME = "AI Engineering from Scratch";
const COURSE_DOCUMENTS: Partial<Record<string, string>> = {
  "README.md": "Course Overview",
  "ROADMAP.md": "Course Roadmap",
};
const NUMBER_PREFIX_PATTERN = /^(\d+)-/;
const FILE_EXTENSION_PATTERN = /\.[^.]+$/;

/** Formats a slug such as "09-function-calling" as "Function Calling". */
export function formatSlug(slug: string): string {
  return slug
    .replace(NUMBER_PREFIX_PATTERN, "")
    .replace(FILE_EXTENSION_PATTERN, "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function phaseContext(phaseSlug: string): string {
  const name = COURSE_TITLES.phases[phaseSlug] ?? formatSlug(phaseSlug);
  const numberMatch = NUMBER_PREFIX_PATTERN.exec(phaseSlug);
  return numberMatch ? `Phase ${Number(numberMatch[1])} · ${name}` : name;
}

/**
 * Learner-facing title and context for a course file. Titles come from the
 * course's own headings when known; otherwise the slug is formatted.
 */
export function describeSource(source: string): SourceDescription {
  const courseDocument = COURSE_DOCUMENTS[source];
  if (courseDocument) return { title: courseDocument, context: COURSE_NAME };

  const segments = source.split("/");
  if (segments[0] !== "phases" || segments.length < 3) {
    return { title: formatSlug(segments.at(-1) ?? source), context: null };
  }

  const [, phaseSlug, lessonSlug] = segments;
  if (segments.length === 3) return { title: "Phase Overview", context: phaseContext(phaseSlug) };

  const lessonKey = `phases/${phaseSlug}/${lessonSlug}`;
  return {
    title: COURSE_TITLES.lessons[lessonKey] ?? formatSlug(lessonSlug),
    context: phaseContext(phaseSlug),
  };
}
