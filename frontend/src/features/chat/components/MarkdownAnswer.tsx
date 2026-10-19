"use client";

import { memo, useMemo } from "react";
import ReactMarkdown, { type Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import { remarkCitations } from "../lib/remarkCitations";
import type { CitationTarget } from "../types";
import { MARKDOWN_COMPONENTS } from "./markdownComponents";

interface MarkdownAnswerProps {
  markdown: string;
  citationTargets: ReadonlyMap<number, CitationTarget>;
}

type RemarkPlugins = NonNullable<Options["remarkPlugins"]>;

/** Renders model output as Markdown. Raw HTML is never rendered. */
export const MarkdownAnswer = memo(function MarkdownAnswer({
  markdown,
  citationTargets,
}: MarkdownAnswerProps) {
  const remarkPlugins = useMemo<RemarkPlugins>(
    () => [remarkGfm, [remarkCitations, { targets: citationTargets }]],
    [citationTargets],
  );

  return (
    <div className="max-w-full min-w-0 text-base wrap-break-word text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
      <ReactMarkdown remarkPlugins={remarkPlugins} components={MARKDOWN_COMPONENTS} skipHtml>
        {markdown}
      </ReactMarkdown>
    </div>
  );
});
