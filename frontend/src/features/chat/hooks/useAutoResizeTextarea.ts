"use client";

import { type RefObject, useLayoutEffect } from "react";

/** Grows a textarea with its content; CSS max-height caps the growth. */
export function useAutoResizeTextarea(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
): void {
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [textareaRef, value]);
}
