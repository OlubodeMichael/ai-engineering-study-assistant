import type { QuestionValidation } from "../types";

export const MAX_QUESTION_LENGTH = 4000;

/** Counts Unicode code points, matching how the backend measures length. */
export function countQuestionCharacters(question: string): number {
  return Array.from(question.trim()).length;
}

export function validateQuestion(rawQuestion: string): QuestionValidation {
  const question = rawQuestion.trim();
  const length = countQuestionCharacters(question);

  if (length === 0) {
    return { valid: false, message: "Enter a question to get started." };
  }

  if (length > MAX_QUESTION_LENGTH) {
    return {
      valid: false,
      message: `Questions can be up to ${MAX_QUESTION_LENGTH.toLocaleString("en-US")} characters. Shorten yours and try again.`,
    };
  }

  return { valid: true, question };
}
