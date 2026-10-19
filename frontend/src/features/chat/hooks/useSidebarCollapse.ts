"use client";

import { type RefObject, useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";

export interface UseSidebarCollapseResult {
  isCollapsed: boolean;
  collapse: () => void;
  expand: () => void;
  collapseButtonRef: RefObject<HTMLButtonElement | null>;
  expandButtonRef: RefObject<HTMLButtonElement | null>;
}

/**
 * Desktop sidebar visibility. The toggle button that was pressed disappears,
 * so focus moves to its counterpart to keep keyboard users oriented.
 */
export function useSidebarCollapse(): UseSidebarCollapseResult {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const collapseButtonRef = useRef<HTMLButtonElement | null>(null);
  const expandButtonRef = useRef<HTMLButtonElement | null>(null);

  const collapse = useCallback((): void => {
    flushSync(() => setIsCollapsed(true));
    expandButtonRef.current?.focus();
  }, []);

  const expand = useCallback((): void => {
    flushSync(() => setIsCollapsed(false));
    collapseButtonRef.current?.focus();
  }, []);

  return { isCollapsed, collapse, expand, collapseButtonRef, expandButtonRef };
}
