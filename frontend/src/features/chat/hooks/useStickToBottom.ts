"use client";

import { type RefObject, useCallback, useEffect, useRef, useState } from "react";

const NEAR_BOTTOM_THRESHOLD_PX = 96;

export interface UseStickToBottomResult {
  scrollRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  isNearBottom: boolean;
  /** Resume following; the next content growth scrolls to the bottom. */
  followLatest: () => void;
  /** Stop following, e.g. before jumping to an earlier exchange. */
  releaseFollow: () => void;
  scrollToLatest: () => void;
}

function distanceFromBottom(element: HTMLElement): number {
  return element.scrollHeight - element.scrollTop - element.clientHeight;
}

/**
 * Keeps a scroll container pinned to new content only while the reader is
 * already near the bottom. Scrolling upward pauses following.
 */
export function useStickToBottom(isEnabled: boolean): UseStickToBottomResult {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const isFollowingRef = useRef(true);
  const [isNearBottom, setIsNearBottom] = useState(true);

  useEffect(() => {
    const scroller = scrollRef.current;
    const content = contentRef.current;
    if (!isEnabled || !scroller || !content) return;

    const measure = (): void => {
      const isNear = distanceFromBottom(scroller) <= NEAR_BOTTOM_THRESHOLD_PX;
      isFollowingRef.current = isNear;
      setIsNearBottom(isNear);
    };
    const handleResize = (): void => {
      if (!isFollowingRef.current) {
        measure();
        return;
      }
      scroller.scrollTop = scroller.scrollHeight;
      setIsNearBottom(true);
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(content);
    scroller.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer.disconnect();
      scroller.removeEventListener("scroll", measure);
    };
  }, [isEnabled]);

  const followLatest = useCallback((): void => {
    isFollowingRef.current = true;
  }, []);

  const releaseFollow = useCallback((): void => {
    isFollowingRef.current = false;
  }, []);

  const scrollToLatest = useCallback((): void => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    isFollowingRef.current = true;
    scroller.scrollTop = scroller.scrollHeight;
  }, []);

  return { scrollRef, contentRef, isNearBottom, followLatest, releaseFollow, scrollToLatest };
}
