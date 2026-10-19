"use client";

import type { FormEvent, KeyboardEvent, RefObject } from "react";
import { ArrowUpIcon, StopIcon } from "@/shared/components/icons";
import { countQuestionCharacters, MAX_QUESTION_LENGTH } from "@/features/ask/lib/validateQuestion";
import { useAutoResizeTextarea } from "../hooks/useAutoResizeTextarea";

interface ComposerProps {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  isBusy: boolean;
  validationMessage: string | null;
}

const NOTE_ID = "composer-note";
const ERROR_ID = "composer-error";
const COUNTER_VISIBLE_FROM = 3500;
const ROUND_BUTTON_CLASSES =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-30";

export function Composer(props: ComposerProps) {
  const { inputRef, value, onChange, onSubmit, onStop, isBusy, validationMessage } = props;
  const characterCount = countQuestionCharacters(value);
  const isEmpty = characterCount === 0;
  useAutoResizeTextarea(inputRef, value);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!isBusy && !isEmpty) onSubmit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (!isBusy && !isEmpty) onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex items-end gap-2 rounded-[28px] border border-border bg-composer py-2 pr-2 pl-5 shadow-[0_1px_6px_rgba(0,0,0,0.06)] focus-within:border-muted/60">
        <label htmlFor="composer-input" className="sr-only">
          Ask about the AI engineering course
        </label>
        <textarea
          id="composer-input"
          ref={inputRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask about the AI engineering course…"
          enterKeyHint="send"
          aria-describedby={validationMessage ? `${ERROR_ID} ${NOTE_ID}` : NOTE_ID}
          aria-invalid={validationMessage !== null}
          className="max-h-52 min-h-9 flex-1 resize-none overflow-y-auto bg-transparent py-1.5 text-base leading-6 text-foreground placeholder:text-muted focus:outline-none"
        />
        {isBusy ? (
          <button type="button" onClick={onStop} aria-label="Stop generating" className={ROUND_BUTTON_CLASSES}>
            <StopIcon />
          </button>
        ) : (
          <button type="submit" disabled={isEmpty} aria-label="Send question" className={ROUND_BUTTON_CLASSES}>
            <ArrowUpIcon width={18} height={18} />
          </button>
        )}
      </div>
      {validationMessage && (
        <p id={ERROR_ID} role="alert" className="mt-2 px-4 text-sm text-danger">
          {validationMessage}
        </p>
      )}
      <p id={NOTE_ID} className="mt-2 flex justify-center gap-3 text-center text-xs text-muted">
        <span>AI can make mistakes. Check the sources.</span>
        {characterCount >= COUNTER_VISIBLE_FROM && (
          <span className={characterCount > MAX_QUESTION_LENGTH ? "text-danger" : undefined}>
            {characterCount.toLocaleString("en-US")} / {MAX_QUESTION_LENGTH.toLocaleString("en-US")}
          </span>
        )}
      </p>
    </form>
  );
}
