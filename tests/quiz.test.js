import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { evaluateQuizAnswer, computeQuizSummary, getQuizQuestion, getMilestoneForQuestion } from "../src/quiz.js";
import { QUIZ_QUESTIONS } from "../src/data.js";

describe("SLC-003: Knowledge Quiz & Grading Logic", () => {
  test("BR-1: Normal path - evaluates correct and incorrect answers with milestone linkage", () => {
    const q1 = QUIZ_QUESTIONS[0];
    const correctResult = evaluateQuizAnswer(q1.id, q1.answerIndex);
    assert.equal(correctResult.valid, true);
    assert.equal(correctResult.isCorrect, true);
    assert.ok(correctResult.explanation.length > 10);
    assert.equal(correctResult.milestoneId, q1.milestoneId);

    const wrongIndex = (q1.answerIndex + 1) % q1.options.length;
    const incorrectResult = evaluateQuizAnswer(q1.id, wrongIndex);
    assert.equal(incorrectResult.valid, true);
    assert.equal(incorrectResult.isCorrect, false);
    assert.equal(incorrectResult.correctIndex, q1.answerIndex);
    assert.equal(incorrectResult.milestoneId, q1.milestoneId);

    // Linkage helper
    assert.equal(getMilestoneForQuestion(q1.id), q1.milestoneId);
  });

  test("BR-2: Invalid input - rejects non-existent question or invalid index", () => {
    // Unknown ID
    const unknown = evaluateQuizAnswer("unknown-q", 0);
    assert.equal(unknown.valid, false);

    // Negative index
    const neg = evaluateQuizAnswer(QUIZ_QUESTIONS[0].id, -1);
    assert.equal(neg.valid, false);

    // Out of bounds index
    const oob = evaluateQuizAnswer(QUIZ_QUESTIONS[0].id, 999);
    assert.equal(oob.valid, false);

    // Non-number index
    const strIdx = evaluateQuizAnswer(QUIZ_QUESTIONS[0].id, "abc");
    assert.equal(strIdx.valid, false);

    assert.equal(getMilestoneForQuestion("invalid-id"), null);
  });

  test("BR-3 & BR-5: Boundary & Idempotency - computeQuizSummary", () => {
    // Empty answers
    const emptySummary = computeQuizSummary({});
    assert.equal(emptySummary.total, QUIZ_QUESTIONS.length);
    assert.equal(emptySummary.answered, 0);
    assert.equal(emptySummary.correctCount, 0);
    assert.equal(emptySummary.scorePercentage, 0);

    // All correct answers
    const allCorrectMap = {};
    for (const q of QUIZ_QUESTIONS) {
      allCorrectMap[q.id] = q.answerIndex;
    }
    const perfectSummary = computeQuizSummary(allCorrectMap);
    assert.equal(perfectSummary.answered, QUIZ_QUESTIONS.length);
    assert.equal(perfectSummary.correctCount, QUIZ_QUESTIONS.length);
    assert.equal(perfectSummary.scorePercentage, 100);

    // Helper: get question
    const q = getQuizQuestion(QUIZ_QUESTIONS[0].id);
    assert.ok(q);
    assert.equal(getQuizQuestion("unknown"), null);
  });
});
