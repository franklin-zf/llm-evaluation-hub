/**
 * 学习状态管理核心（遵循代码之禅与七维业务规则）
 * 纯两层架构 Layer 2：无多余包装类，纯函数式状态机与安全持久化
 */

import { CURRICULUM_DATA } from "./data.js";

const STORAGE_KEY = "llm_eval_learning_state_v1";

const DEFAULT_STATE = {
  completedMilestones: [],
  quizAnswers: {},
  theme: "dark"
};

/**
 * 安全持久化封装：自带内存降级容错机制 (BR-4 & BR-7)
 */
export class StateStore {
  constructor(storageBackend = null) {
    this.memoryFallback = false;
    this.storage = storageBackend || this.resolveStorage();
    this.state = this.loadState();
  }

  resolveStorage() {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage;
    }
    // Node.js 或不可用环境下的内存降级实现
    this.memoryFallback = true;
    const mem = {};
    return {
      getItem: (k) => (Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null),
      setItem: (k, v) => { mem[k] = String(v); },
      removeItem: (k) => { delete mem[k]; }
    };
  }

  loadState() {
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      if (!raw) {
        return { ...DEFAULT_STATE };
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return { ...DEFAULT_STATE };
      }
      return {
        completedMilestones: Array.isArray(parsed.completedMilestones)
          ? parsed.completedMilestones.filter((id) => typeof id === "string" && id.trim().length > 0)
          : [],
        quizAnswers: (parsed.quizAnswers && typeof parsed.quizAnswers === "object")
          ? parsed.quizAnswers
          : {},
        theme: parsed.theme === "light" ? "light" : "dark"
      };
    } catch (err) {
      // 显式捕获解析异常并优雅降级为默认状态 (BR-1 & BR-2)
      return { ...DEFAULT_STATE };
    }
  }

  saveState() {
    try {
      const serialized = JSON.stringify(this.state);
      this.storage.setItem(STORAGE_KEY, serialized);
    } catch (err) {
      // 存储满或受限时记录告警并安全降级到内存 (BR-4 & BR-7)
      this.memoryFallback = true;
    }
  }

  getState() {
    return {
      completedMilestones: [...this.state.completedMilestones],
      quizAnswers: { ...this.state.quizAnswers },
      theme: this.state.theme
    };
  }

  isMilestoneCompleted(milestoneId) {
    if (!milestoneId || typeof milestoneId !== "string") {
      return false;
    }
    return this.state.completedMilestones.includes(milestoneId);
  }

  toggleMilestone(milestoneId) {
    // 卫语句：校验非法输入 (BR-2)
    if (!milestoneId || typeof milestoneId !== "string" || milestoneId.trim().length === 0) {
      return false;
    }

    const trimmed = milestoneId.trim();
    const exists = this.state.completedMilestones.includes(trimmed);

    if (exists) {
      this.state.completedMilestones = this.state.completedMilestones.filter((id) => id !== trimmed);
    } else {
      this.state.completedMilestones = [...this.state.completedMilestones, trimmed];
    }

    this.saveState();
    return true;
  }

  setQuizAnswer(questionId, selectedIndex) {
    if (!questionId || typeof questionId !== "string") {
      return false;
    }
    if (typeof selectedIndex !== "number" || selectedIndex < 0) {
      return false;
    }

    this.state.quizAnswers = {
      ...this.state.quizAnswers,
      [questionId]: selectedIndex
    };
    this.saveState();
    return true;
  }

  setTheme(theme) {
    if (theme !== "dark" && theme !== "light") {
      return false;
    }
    this.state.theme = theme;
    this.saveState();
    return true;
  }

  getProgress() {
    // 计算全部里程碑总数
    let total = 0;
    for (const week of CURRICULUM_DATA) {
      total += week.milestones.length;
    }

    if (total === 0) {
      return 0;
    }

    const completed = this.state.completedMilestones.length;
    const pct = Math.round((completed / total) * 100);
    return Math.min(100, Math.max(0, pct));
  }
}
