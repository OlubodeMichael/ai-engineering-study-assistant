"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CopyStatus = "idle" | "copied" | "failed";

const STATUS_RESET_DELAY_MS = 2000;

export interface UseCopyToClipboardResult {
  status: CopyStatus;
  copy: (text: string) => Promise<void>;
}

export function useCopyToClipboard(): UseCopyToClipboardResult {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    },
    [],
  );

  const copy = useCallback(async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch (error) {
      console.error("Copy to clipboard failed", error);
      setStatus("failed");
    }

    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => setStatus("idle"), STATUS_RESET_DELAY_MS);
  }, []);

  return { status, copy };
}
