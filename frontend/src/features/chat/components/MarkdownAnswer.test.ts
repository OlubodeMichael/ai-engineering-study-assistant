import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { CitationTarget } from "../types";
import { MarkdownAnswer } from "./MarkdownAnswer";

const FUNCTION_CALLING: CitationTarget = {
  displayNumber: 1,
  anchorId: "exchange-1--ref-1",
  title: "Function Calling & Tool Use",
};
const OVERVIEW: CitationTarget = {
  displayNumber: 2,
  anchorId: "exchange-1--ref-2",
  title: "Course Overview",
};
// Original citations 1 and 2 come from the same lesson; 3 is a second document.
const TARGETS = new Map<number, CitationTarget>([
  [1, FUNCTION_CALLING],
  [2, FUNCTION_CALLING],
  [3, OVERVIEW],
]);

function render(markdown: string): string {
  return renderToStaticMarkup(createElement(MarkdownAnswer, { markdown, citationTargets: TARGETS }));
}

function badges(html: string): string[] {
  return [...html.matchAll(/<a href="#[^"]+"[^>]*>(\d+)<\/a>/g)].map((match) => match[1]);
}

describe("MarkdownAnswer citations", () => {
  it("renumbers citations by document and links to the merged entry", () => {
    const html = render("Schemas describe tools [3].");
    expect(badges(html)).toEqual(["2"]);
    expect(html).toContain('href="#exchange-1--ref-2"');
    expect(html).toContain('aria-label="Reference 2: Course Overview"');
  });

  it("shows one badge when grouped or adjacent citations share a document", () => {
    expect(badges(render("Grouped [1, 2]."))).toEqual(["1"]);
    expect(badges(render("Adjacent [1][2] and spaced [1] [2]."))).toEqual(["1", "1"]);
    expect(badges(render("Mixed [1, 2, 3]."))).toEqual(["1", "2"]);
  });

  it("keeps separate badges when the same document is cited apart", () => {
    expect(badges(render("First [1], then more text [2]."))).toEqual(["1", "1"]);
  });

  it("leaves unknown citations and code untouched", () => {
    const html = render("Unknown [7] and `code [1]`");
    expect(html).toContain("[7]");
    expect(html).toContain("code [1]");
  });

  it("does not render raw HTML from the model", () => {
    expect(render('<img src=x onerror="alert(1)">')).not.toContain("<img");
  });
});
