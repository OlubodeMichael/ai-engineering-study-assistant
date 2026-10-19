"use client";

import { isValidElement, type ReactNode, useRef } from "react";
import { CopyButton } from "@/shared/components/CopyButton";

interface CodeBlockProps {
  children?: ReactNode;
}

const LANGUAGE_CLASS_PATTERN = /language-([\w+-]+)/;

function languageOf(children: ReactNode): string | null {
  if (!isValidElement<{ className?: string }>(children)) return null;
  const match = LANGUAGE_CLASS_PATTERN.exec(children.props.className ?? "");
  return match ? match[1] : null;
}

export function CodeBlock({ children }: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const language = languageOf(children);

  return (
    <div className="my-4 max-w-full overflow-hidden rounded-xl border border-border bg-subtle">
      <div className="flex items-center justify-between border-b border-border pr-1 pl-4">
        <span className="font-mono text-xs text-muted">{language ?? "code"}</span>
        <CopyButton label="Copy code" getText={() => preRef.current?.textContent ?? ""} />
      </div>
      <pre
        ref={preRef}
        tabIndex={0}
        className="max-w-full overflow-x-auto p-4 text-sm leading-6 wrap-normal focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus [&>code]:border-0 [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-[1em]"
      >
        {children}
      </pre>
    </div>
  );
}
