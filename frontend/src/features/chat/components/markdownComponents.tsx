import type { MouseEvent } from "react";
import type { Components } from "react-markdown";
import { CITATION_BADGE_CLASSES } from "../constants";
import { isReferenceAnchorId } from "../lib/elementIds";
import { revealReference } from "../lib/revealReference";
import { CodeBlock } from "./CodeBlock";

function handleCitationClick(event: MouseEvent<HTMLAnchorElement>, anchorId: string): void {
  event.preventDefault();
  revealReference(anchorId);
}

const MarkdownLink: Components["a"] = ({ href, children, title, ...rest }) => {
  const anchorId = href?.startsWith("#") ? href.slice(1) : null;

  if (anchorId && isReferenceAnchorId(anchorId)) {
    return (
      <a
        href={href}
        title={title}
        aria-label={rest["aria-label"]}
        onClick={(event) => handleCitationClick(event, anchorId)}
        className={`relative -top-0.5 mx-0.5 align-middle no-underline hover:bg-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-focus ${CITATION_BADGE_CLASSES}`}
      >
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      title={title}
      target="_blank"
      rel="noopener noreferrer"
      className="text-link underline underline-offset-2"
    >
      {children}
    </a>
  );
};

export const MARKDOWN_COMPONENTS: Components = {
  a: MarkdownLink,
  h1: ({ children }) => <h3 className="mt-6 mb-3 text-xl font-semibold">{children}</h3>,
  h2: ({ children }) => <h3 className="mt-6 mb-3 text-lg font-semibold">{children}</h3>,
  h3: ({ children }) => <h4 className="mt-5 mb-2 text-base font-semibold">{children}</h4>,
  h4: ({ children }) => <h5 className="mt-4 mb-2 text-base font-medium">{children}</h5>,
  p: ({ children }) => <p className="my-3 leading-7">{children}</p>,
  ul: ({ children }) => <ul className="my-3 list-disc space-y-1.5 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 list-decimal space-y-1.5 pl-6">{children}</ol>,
  li: ({ children }) => <li className="pl-1 leading-7 marker:text-muted">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-2 border-border pl-4 text-muted">{children}</blockquote>
  ),
  hr: () => <hr className="my-6 border-border" />,
  code: ({ children, className }) => (
    <code className={`rounded-md bg-subtle px-1.5 py-0.5 font-mono text-[0.875em] ${className ?? ""}`}>
      {children}
    </code>
  ),
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
  table: ({ children }) => (
    <div className="my-4 max-w-full overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse text-sm wrap-normal">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-subtle">{children}</thead>,
  th: ({ children, style }) => (
    <th style={style} className="border-b border-border px-3 py-2 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children, style }) => (
    <td style={style} className="border-b border-border px-3 py-2 align-top">
      {children}
    </td>
  ),
};
