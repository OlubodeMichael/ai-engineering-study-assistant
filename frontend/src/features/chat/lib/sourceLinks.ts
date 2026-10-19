import type { SourceLink } from "../types";

const REPOSITORY_BLOB_URL =
  "https://github.com/rohitg00/ai-engineering-from-scratch/blob/main";
const LESSON_PAGE_URL = "https://aiengineeringfromscratch.com/lesson";
const SAFE_SEGMENT_PATTERN = /^[A-Za-z0-9._-]+$/;
const ENGLISH_LESSON_PATTERN = /^(phases\/[^/]+\/[^/]+)\/docs\/en\.md$/;

function isSafeRelativePath(path: string): boolean {
  if (path === "" || path.startsWith("/")) return false;

  return path
    .split("/")
    .every(
      (segment) =>
        SAFE_SEGMENT_PATTERN.test(segment) && segment !== "." && segment !== "..",
    );
}

function lessonPageUrl(lessonPath: string): string {
  const query = new URLSearchParams({ path: lessonPath });
  return `${LESSON_PAGE_URL}?${query.toString()}`;
}

function repositoryFileUrl(source: string): string {
  const encodedPath = source.split("/").map(encodeURIComponent).join("/");
  return `${REPOSITORY_BLOB_URL}/${encodedPath}`;
}

/**
 * Builds the link for a course file. English lessons open on the course
 * website; every other file falls back to GitHub. Returns null unless the
 * source is a plain relative path, so streamed data can never inject a URL.
 */
export function buildSourceLink(source: string): SourceLink | null {
  if (!isSafeRelativePath(source)) return null;

  const lessonMatch = ENGLISH_LESSON_PATTERN.exec(source);
  if (lessonMatch) return { kind: "lesson", url: lessonPageUrl(lessonMatch[1]) };
  return { kind: "repository", url: repositoryFileUrl(source) };
}
