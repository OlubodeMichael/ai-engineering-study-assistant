"use client";

import { type RefObject, useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { validateQuestion } from "@/features/ask/lib/validateQuestion";
import { exchangeElementId } from "../lib/elementIds";
import type { SessionQuestion } from "../types";
import { useChatSession, type UseChatSessionResult } from "./useChatSession";
import { type UseStickToBottomResult, useStickToBottom } from "./useStickToBottom";

export interface UseChatScreenResult {
  session: UseChatSessionResult;
  scroll: UseStickToBottomResult;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  draft: string;
  validationMessage: string | null;
  isDrawerOpen: boolean;
  isEmpty: boolean;
  setDraft: (value: string) => void;
  submitDraft: () => void;
  askQuestion: (question: string) => void;
  startNewQuestion: () => void;
  selectQuestion: (question: SessionQuestion) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

function revealExchange(exchangeId: string): void {
  const element = document.getElementById(exchangeElementId(exchangeId));
  if (!element) return;
  element.scrollIntoView({ block: "start" });
  element.focus({ preventScroll: true });
}

/** UI-level orchestration for the chat screen: draft, drawer, and scrolling. */
export function useChatScreen(): UseChatScreenResult {
  const session = useChatSession();
  const isEmpty = !session.activeThread || session.activeThread.exchanges.length === 0;
  const scroll = useStickToBottom(!isEmpty);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [draft, setDraftState] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { ask, startNewConversation, selectThread } = session;
  const { followLatest, releaseFollow } = scroll;

  const setDraft = useCallback((value: string): void => {
    setDraftState(value);
    setValidationMessage(null);
  }, []);

  const askQuestion = useCallback((question: string): void => {
    followLatest();
    void ask(question);
  }, [ask, followLatest]);

  const submitDraft = useCallback((): void => {
    const validation = validateQuestion(draft);
    if (!validation.valid) {
      setValidationMessage(validation.message);
      return;
    }
    setDraftState("");
    askQuestion(validation.question);
  }, [askQuestion, draft]);

  const startNewQuestion = useCallback((): void => {
    startNewConversation();
    setDraft("");
    setIsDrawerOpen(false);
    inputRef.current?.focus();
  }, [setDraft, startNewConversation]);

  const selectQuestion = useCallback((question: SessionQuestion): void => {
    flushSync(() => {
      selectThread(question.threadId);
      setIsDrawerOpen(false);
    });
    releaseFollow();
    revealExchange(question.exchangeId);
  }, [releaseFollow, selectThread]);

  const openDrawer = useCallback((): void => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback((): void => setIsDrawerOpen(false), []);

  return {
    session,
    scroll,
    inputRef,
    draft,
    validationMessage,
    isDrawerOpen,
    isEmpty,
    setDraft,
    submitDraft,
    askQuestion,
    startNewQuestion,
    selectQuestion,
    openDrawer,
    closeDrawer,
  };
}
