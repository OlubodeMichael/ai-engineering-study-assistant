import { describe, expect, it } from "vitest";
import type { ChatAction, ChatState } from "../types";
import {
  chatReducer,
  INITIAL_CHAT_STATE,
  selectActiveThread,
  selectLatestExchange,
  selectSessionQuestions,
} from "./chatReducer";

function reduce(actions: ChatAction[], state: ChatState = INITIAL_CHAT_STATE): ChatState {
  return actions.reduce(chatReducer, state);
}

const ASK_FIRST: ChatAction = {
  type: "questionAsked",
  newThreadId: "thread-1",
  exchangeId: "exchange-1",
  question: "What is overfitting?",
};

describe("chatReducer", () => {
  it("starts a thread on the first question and streams into it", () => {
    const state = reduce([
      ASK_FIRST,
      { type: "sourcesReceived", exchangeId: "exchange-1", sources: [] },
      { type: "deltaReceived", exchangeId: "exchange-1", text: "Over" },
      { type: "deltaReceived", exchangeId: "exchange-1", text: "fitting" },
      { type: "finished", exchangeId: "exchange-1", outcome: { kind: "completed" } },
    ]);

    const exchange = selectLatestExchange(state);
    expect(exchange?.answer).toBe("Overfitting");
    expect(exchange?.status).toBe("completed");
    expect(selectActiveThread(state)?.id).toBe("thread-1");
  });

  it("appends follow-up questions to the visible thread", () => {
    const state = reduce([
      ASK_FIRST,
      { type: "finished", exchangeId: "exchange-1", outcome: { kind: "completed" } },
      { type: "questionAsked", newThreadId: "thread-2", exchangeId: "exchange-2", question: "Next?" },
    ]);
    expect(state.threads).toHaveLength(1);
    expect(selectActiveThread(state)?.exchanges.map((exchange) => exchange.id)).toEqual([
      "exchange-1",
      "exchange-2",
    ]);
  });

  it("starts a new thread after a new conversation, keeping session history", () => {
    const state = reduce([
      ASK_FIRST,
      { type: "cancelled", exchangeId: "exchange-1" },
      { type: "newConversationStarted" },
    ]);
    expect(selectActiveThread(state)).toBeNull();

    const next = reduce(
      [{ type: "questionAsked", newThreadId: "thread-2", exchangeId: "exchange-2", question: "B" }],
      state,
    );
    expect(next.threads.map((thread) => thread.id)).toEqual(["thread-1", "thread-2"]);
    expect(selectSessionQuestions(next).map((item) => item.question)).toEqual([
      "B",
      "What is overfitting?",
    ]);
  });

  it("keeps partial text on cancel and ignores late events for settled exchanges", () => {
    const state = reduce([
      ASK_FIRST,
      { type: "deltaReceived", exchangeId: "exchange-1", text: "Partial" },
      { type: "cancelled", exchangeId: "exchange-1" },
      { type: "deltaReceived", exchangeId: "exchange-1", text: " late" },
      { type: "finished", exchangeId: "exchange-1", outcome: { kind: "completed" } },
    ]);
    const exchange = selectLatestExchange(state);
    expect(exchange?.answer).toBe("Partial");
    expect(exchange?.status).toBe("cancelled");
  });

  it("records error outcomes and interrupted streams", () => {
    const failed = reduce([
      ASK_FIRST,
      { type: "finished", exchangeId: "exchange-1", outcome: { kind: "failed", message: "Nope." } },
    ]);
    expect(selectLatestExchange(failed)).toMatchObject({ status: "failed", errorMessage: "Nope." });

    const interrupted = reduce([
      ASK_FIRST,
      { type: "finished", exchangeId: "exchange-1", outcome: { kind: "interrupted" } },
    ]);
    expect(selectLatestExchange(interrupted)?.status).toBe("interrupted");
  });
});
