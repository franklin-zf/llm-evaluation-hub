/**
 * 测评知识自测与即时判分核心
 * 纯业务逻辑函数，两层架构 Layer 2
 */

import { QUIZ_QUESTIONS } from "./data.js";

/**
 * 获取指定题目
 */
export function getQuizQuestion(questionId) {
  if (!questionId || typeof questionId !== "string") {
    return null;
  }
  return QUIZ_QUESTIONS.find((q) => q.id === questionId.trim()) || null;
}

/**
 * 校验单题作答 (BR-1 & BR-2)
 */
export function evaluateQuizAnswer(questionId, selectedIndex) {
  const q = getQuizQuestion(questionId);
  if (!q) {
    return { valid: false, reason: "题目不存在" };
  }

  if (typeof selectedIndex !== "number" || selectedIndex < 0 || selectedIndex >= q.options.length) {
    return { valid: false, reason: "选项索引超出范围" };
  }

  const isCorrect = selectedIndex === q.answerIndex;
  return {
    valid: true,
    isCorrect,
    correctIndex: q.answerIndex,
    explanation: q.explanation,
    milestoneId: q.milestoneId || null
  };
}

/**
 * 获取题目关联的讲义里程碑 ID (用于答错时一键跳转复习)
 */
export function getMilestoneForQuestion(questionId) {
  const q = getQuizQuestion(questionId);
  if (!q) {
    return null;
  }
  return q.milestoneId || null;
}

/**
 * 计算整体自测总分与正确率 (BR-1 & BR-3)
 */
export function computeQuizSummary(answersMap = {}) {
  const total = QUIZ_QUESTIONS.length;
  if (total === 0) {
    return { total: 0, answered: 0, correctCount: 0, scorePercentage: 0 };
  }

  const safeAnswers = (answersMap && typeof answersMap === "object") ? answersMap : {};
  let answered = 0;
  let correctCount = 0;

  for (const q of QUIZ_QUESTIONS) {
    const selected = safeAnswers[q.id];
    if (typeof selected === "number" && selected >= 0 && selected < q.options.length) {
      answered++;
      if (selected === q.answerIndex) {
        correctCount++;
      }
    }
  }

  const scorePercentage = Math.round((correctCount / total) * 100);

  return {
    total,
    answered,
    correctCount,
    scorePercentage
  };
}
