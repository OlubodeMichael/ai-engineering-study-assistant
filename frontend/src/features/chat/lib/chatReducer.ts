import type { StreamOutcome } from "@/features/ask/types";
import { ACTIVE_STATUSES } from "../constants";
import type { ChatAction, ChatState, Exchange, SessionQuestion, Thread } from "../types";

export const INITIAL_CHAT_STATE: ChatState = {
  threads: [],
  activeThreadId: null,
  latestExchangeId: null,
};

export function isExchangeActive(exchange: Exchange): boolean {
  return ACTIVE_STATUSES.has(exchange.status);
}

function createExchange(id: string, question: string): Exchange {
  return { id, question, answer: "", sources: [], status: "retrieving", errorMessage: null };
}

function updateExchange(
  state: ChatState,
  exchangeId: string,
  update: (exchange: Exchange) => Exchange,
): ChatState {
  const threads = state.threads.map((thread) => {
    if (!thread.exchanges.some((exchange) => exchange.id === exchangeId)) return thread;
    const exchanges = thread.exchanges.map((exchange) =>
      exchange.id === exchangeId ? update(exchange) : exchange,
    );
    return { ...thread, exchanges };
  });
  return { ...state, threads };
}

/** Updates an exchange only while it is still streaming; settled exchanges never change. */
function updateActiveExchange(
  state: ChatState,
  exchangeId: string,
  update: (exchange: Exchange) => Exchange,
): ChatState {
  return updateExchange(state, exchangeId, (exchange) =>
    isExchangeActive(exchange) ? update(exchange) : exchange,
  );
}

function applyOutcome(exchange: Exchange, outcome: StreamOutcome): Exchange {
  if (outcome.kind === "completed") return { ...exchange, status: "completed" };
  if (outcome.kind === "interrupted") return { ...exchange, status: "interrupted" };
  return { ...exchange, status: "failed", errorMessage: outcome.message };
}

/** Appends to the visible thread, or starts `newThreadId` if none is visible. */
function addQuestion(state: ChatState, newThreadId: string, exchange: Exchange): ChatState {
  const threadId = state.activeThreadId ?? newThreadId;
  const hasThread = state.threads.some((thread) => thread.id === threadId);
  const threads: Thread[] = hasThread
    ? state.threads.map((thread) =>
        thread.id === threadId ? { ...thread, exchanges: [...thread.exchanges, exchange] } : thread,
      )
    : [...state.threads, { id: threadId, exchanges: [exchange] }];
  return { threads, activeThreadId: threadId, latestExchangeId: exchange.id };
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "questionAsked":
      return addQuestion(
        state,
        action.newThreadId,
        createExchange(action.exchangeId, action.question),
      );
    case "sourcesReceived":
      return updateActiveExchange(state, action.exchangeId, (exchange) => ({
        ...exchange,
        status: "generating",
        sources: action.sources,
      }));
    case "deltaReceived":
      return updateActiveExchange(state, action.exchangeId, (exchange) => ({
        ...exchange,
        status: "generating",
        answer: exchange.answer + action.text,
      }));
    case "finished":
      return updateActiveExchange(state, action.exchangeId, (exchange) =>
        applyOutcome(exchange, action.outcome),
      );
    case "cancelled":
      return updateActiveExchange(state, action.exchangeId, (exchange) => ({
        ...exchange,
        status: "cancelled",
      }));
    case "failed":
      return updateActiveExchange(state, action.exchangeId, (exchange) => ({
        ...exchange,
        status: "failed",
        errorMessage: action.message,
      }));
    case "newConversationStarted":
      return { ...state, activeThreadId: null };
    case "threadSelected":
      return { ...state, activeThreadId: action.threadId };
  }
}

export function selectActiveThread(state: ChatState): Thread | null {
  return state.threads.find((thread) => thread.id === state.activeThreadId) ?? null;
}

export function selectLatestExchange(state: ChatState): Exchange | null {
  for (const thread of state.threads) {
    const match = thread.exchanges.find((exchange) => exchange.id === state.latestExchangeId);
    if (match) return match;
  }
  return null;
}

/** Session questions, newest conversation first, in asking order within each. */
export function selectSessionQuestions(state: ChatState): SessionQuestion[] {
  return [...state.threads].reverse().flatMap((thread) =>
    thread.exchanges.map((exchange) => ({
      threadId: thread.id,
      exchangeId: exchange.id,
      question: exchange.question,
    })),
  );
}
