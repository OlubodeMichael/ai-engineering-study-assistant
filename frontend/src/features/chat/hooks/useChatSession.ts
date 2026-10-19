"use client";

import { type Dispatch, useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { AskRequestError, streamAnswer } from "@/features/ask/services/askService";
import {
  chatReducer,
  INITIAL_CHAT_STATE,
  isExchangeActive,
  selectActiveThread,
  selectLatestExchange,
  selectSessionQuestions,
} from "../lib/chatReducer";
import { createDeltaBatcher, type DeltaBatcher } from "../lib/deltaBatcher";
import type { ChatAction, Exchange, SessionQuestion, Thread } from "../types";

const UNEXPECTED_ERROR_MESSAGE = "Something went wrong while answering. Please try again.";

interface ActiveRequest {
  exchangeId: string;
  controller: AbortController;
  batcher: DeltaBatcher;
}

export interface UseChatSessionResult {
  activeThread: Thread | null;
  latestExchange: Exchange | null;
  sessionQuestions: SessionQuestion[];
  isBusy: boolean;
  ask: (question: string) => Promise<void>;
  stop: () => void;
  startNewConversation: () => void;
  selectThread: (threadId: string) => void;
}

function failureMessage(error: unknown): string {
  if (error instanceof AskRequestError) return error.message;
  console.error("Unexpected ask failure", error);
  return UNEXPECTED_ERROR_MESSAGE;
}

async function runRequest(
  question: string,
  request: ActiveRequest,
  isCurrent: () => boolean,
  dispatch: Dispatch<ChatAction>,
): Promise<void> {
  const { exchangeId, controller, batcher } = request;
  try {
    const outcome = await streamAnswer(question, controller.signal, (event) => {
      if (!isCurrent()) return;
      if (event.type === "delta") batcher.push(event.text);
      else dispatch({ type: "sourcesReceived", exchangeId, sources: event.sources });
    });
    if (!isCurrent()) return;
    batcher.flush();
    dispatch({ type: "finished", exchangeId, outcome });
  } catch (error) {
    if (!isCurrent()) return;
    batcher.flush();
    dispatch({ type: "failed", exchangeId, message: failureMessage(error) });
  }
}

/**
 * Owns the session's conversations and the single in-flight request.
 * Every question is sent to the backend on its own, without prior messages.
 */
export function useChatSession(): UseChatSessionResult {
  const [state, dispatch] = useReducer(chatReducer, INITIAL_CHAT_STATE);
  const requestRef = useRef<ActiveRequest | null>(null);
  const idCounterRef = useRef(0);

  useEffect(
    () => () => {
      requestRef.current?.batcher.cancel();
      requestRef.current?.controller.abort();
      requestRef.current = null;
    },
    [],
  );

  const ask = useCallback(async (question: string): Promise<void> => {
    if (requestRef.current) return;

    const id = ++idCounterRef.current;
    const exchangeId = `exchange-${id}`;
    const batcher = createDeltaBatcher((text) => dispatch({ type: "deltaReceived", exchangeId, text }));
    const request: ActiveRequest = { exchangeId, controller: new AbortController(), batcher };
    const isCurrent = (): boolean => requestRef.current === request;

    requestRef.current = request;
    dispatch({ type: "questionAsked", newThreadId: `thread-${id}`, exchangeId, question });
    await runRequest(question, request, isCurrent, dispatch);
    if (isCurrent()) requestRef.current = null;
  }, []);

  const stop = useCallback((): void => {
    const request = requestRef.current;
    if (!request) return;

    requestRef.current = null;
    request.batcher.flush();
    request.controller.abort();
    dispatch({ type: "cancelled", exchangeId: request.exchangeId });
  }, []);

  const startNewConversation = useCallback((): void => {
    stop();
    dispatch({ type: "newConversationStarted" });
  }, [stop]);

  const selectThread = useCallback((threadId: string): void => {
    dispatch({ type: "threadSelected", threadId });
  }, []);

  const activeThread = useMemo(() => selectActiveThread(state), [state]);
  const latestExchange = useMemo(() => selectLatestExchange(state), [state]);
  const sessionQuestions = useMemo(() => selectSessionQuestions(state), [state]);
  const isBusy = latestExchange !== null && isExchangeActive(latestExchange);

  return {
    activeThread,
    latestExchange,
    sessionQuestions,
    isBusy,
    ask,
    stop,
    startNewConversation,
    selectThread,
  };
}
