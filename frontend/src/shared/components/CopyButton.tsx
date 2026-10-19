"use client";

import { type CopyStatus, useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";
import { CheckIcon, CopyIcon } from "./icons";

interface CopyButtonProps {
  getText: () => string;
  label: string;
  className?: string;
}

const STATUS_TEXT: Record<CopyStatus, string> = {
  idle: "Copy",
  copied: "Copied",
  failed: "Copy failed",
};

export function CopyButton({ getText, label, className = "" }: CopyButtonProps) {
  const { status, copy } = useCopyToClipboard();

  return (
    <button
      type="button"
      onClick={() => void copy(getText())}
      aria-label={label}
      className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs text-muted transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus ${className}`}
    >
      {status === "copied" ? <CheckIcon /> : <CopyIcon />}
      <span aria-hidden="true">{STATUS_TEXT[status]}</span>
      <span className="sr-only" role="status">
        {status === "idle" ? "" : STATUS_TEXT[status]}
      </span>
    </button>
  );
}
