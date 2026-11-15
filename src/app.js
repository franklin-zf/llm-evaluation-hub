/**
 * 主界面交互与呈现层 (Layer 1: Entrypoint & UI Surface)
 * 纯两层架构，直接消费 Layer 2 核心领域逻辑
 */

import { CURRICULUM_DATA, VIDEOS_DATA, QUIZ_QUESTIONS } from "./data.js";
import { StateStore } from "./state.js";
import { filterFrameworks, searchBenchmarks } from "./matrix.js";
import { getCodeScaffold, listCodeScaffolds } from "./code-lab.js";
import { evaluateQuizAnswer, computeQuizSummary, getMilestoneForQuestion } from "./quiz.js";
import { getLessonByMilestone, listAllLessons } from "./lessons.js";

// 初始化状态引擎 (单例状态源)
const store = new StateStore();

// 当前 UI 交互状态 (仅存界面即时选择，核心状态委托给 store)
let activeTab = "curriculum";
let activeCategory = "all";
let matrixViewMode = "frameworks"; // "frameworks" | "benchmarks"
let activeScaffoldId = "scaffold-lmeval";
let activeMilestoneId = "m-1-1";
let currentSearchQuery = "";

// 基础工具函数：安全文本转义
function escapeHtml(str) {
  if (typeof str !== "string") {
    return "";
  }
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * 刷新全局进度条与打卡统计
 */
function updateGlobalProgress() {
  const pct = store.getProgress();
  const progressBar = document.getElementById("global-progress-bar");
  const progressText = document.getElementById("global-progress-text");
  const milestoneStat = document.getElementById("milestones-stat");

  if (progressBar && progressText) {
    progressBar.style.width = `${pct}%`;
    progressText.textContent = `${pct}%`;
  }

  if (milestoneStat) {
    const totalMilestones = CURRICULUM_DATA.reduce((acc, w) => acc + w.milestones.length, 0);
    const completedCount = store.getState().completedMilestones.length;
    milestoneStat.textContent = `已完成 ${completedCount} / ${totalMilestones} 项里程碑`;
  }
}

/**
 * 打开并渲染指定里程碑的深度讲义阅读器
 */
function openLessonReader(milestoneId) {
  if (!milestoneId) return;

  const lesson = getLessonByMilestone(milestoneId);
  if (!lesson) return;

  activeMilestoneId = milestoneId;

  const readerSection = document.getElementById("lesson-reader-section");
  const weekTag = document.getElementById("reader-week-tag");
  const timeTag = document.getElementById("reader-time-tag");
  const titleEl = document.getElementById("reader-lesson-title");
  const summaryEl = document.getElementById("reader-lesson-summary");
  const bodyEl = document.getElementById("reader-lesson-body");
  const toggleBtnText = document.getElementById("reader-toggle-btn-text");

  if (!readerSection || !weekTag || !timeTag || !titleEl || !summaryEl || !bodyEl || !toggleBtnText) {
    return;
  }

  weekTag.textContent = `Week ${lesson.weekNum} · ${lesson.category}`;
  timeTag.textContent = `⏱️ 预计阅读 ${lesson.readingTimeMinutes} 分钟`;
  titleEl.textContent = lesson.title;
  summaryEl.textContent = lesson.summary;

  const deep = lesson.deepDiveContent;

  const conceptsHtml = (deep.coreConcepts || []).map((c) => `
    <div class="concept-card">
      <div class="concept-term">${escapeHtml(c.term)}</div>
      <div class="concept-def">${escapeHtml(c.definition)}</div>
    </div>
  `).join("");

  const practicalHtml = (deep.practicalGuide || []).map((pt) => `
    <li>${escapeHtml(pt)}</li>
  `).join("");

  const pitfallsHtml = (deep.pitfalls || []).map((pf) => `
    <li>${escapeHtml(pf)}</li>
  `).join("");

  bodyEl.innerHTML = `
    <div class="reader-block">
      <h4 class="reader-block-title">📚 核心背景与原理解析</h4>
      <p class="reader-block-text">${escapeHtml(deep.background)}</p>
    </div>

    <div class="reader-block">
      <h4 class="reader-block-title">🔑 关键理论概念与度量</h4>
      <div class="concept-grid">
        ${conceptsHtml}
      </div>
    </div>

    <div class="reader-block">
      <h4 class="reader-block-title">🛠️ 工业级实战操作指南</h4>
      <ul class="practical-list">
        ${practicalHtml}
      </ul>
    </div>

    <div class="reader-block">
      <h4 class="reader-block-title">⚠️ 常见工程易错陷阱与反模式</h4>
      <ul class="pitfalls-list">
        ${pitfallsHtml}
      </ul>
    </div>
  `;

  const isDone = store.isMilestoneCompleted(milestoneId);
  toggleBtnText.textContent = isDone ? "已打卡 (点击取消)" : "标记此课已掌握并打卡";

  readerSection.style.display = "block";
  readerSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/**
 * 渲染 4 周学习路线板块
 */
function renderCurriculum() {
  const container = document.getElementById("curriculum-container");
  if (!container) return;

  const state = store.getState();
  const completedSet = new Set(state.completedMilestones);

  container.innerHTML = CURRICULUM_DATA.map((week) => {
    const milestonesHtml = week.milestones.map((m) => {
      const isDone = completedSet.has(m.id);
      return `
        <li class="milestone-item ${isDone ? "completed" : ""}" data-milestone-id="${escapeHtml(m.id)}">
          <div class="milestone-item-row">
            <div class="milestone-checkbox-wrap">
              <input type="checkbox" class="milestone-checkbox" ${isDone ? "checked" : ""} aria-label="${escapeHtml(m.label)}">
              <span class="milestone-label">${escapeHtml(m.label)}</span>
            </div>
            <button class="read-lesson-btn" data-milestone-id="${escapeHtml(m.id)}" title="点击阅读深度图文讲义">
              📖 讲义
            </button>
          </div>
        </li>
      `;
    }).join("");

    const resourcesHtml = week.resources.map((r) => `
      <li class="resource-item">
        <span aria-hidden="true">📖</span>
        <span>${escapeHtml(r)}</span>
      </li>
    `).join("");

    return `
      <article class="week-card">
        <div class="week-header">
          <span class="week-badge">Week ${week.weekNum}</span>
          <h3 class="week-title">${escapeHtml(week.title)}</h3>
          <p class="week-subtitle">${escapeHtml(week.subtitle)}</p>
        </div>
        <ul class="milestones-list">
          ${milestonesHtml}
        </ul>
        <div class="week-resources">
          <div class="resources-title">推荐核心研读材料</div>
          <ul class="resources-list">
            ${resourcesHtml}
          </ul>
        </div>
      </article>
    `;
  }).join("");

  // 绑定打卡点击与阅读讲义事件
  container.querySelectorAll(".milestone-checkbox").forEach((cb) => {
    cb.addEventListener("change", (evt) => {
      evt.stopPropagation();
      const li = cb.closest(".milestone-item");
      const mId = li ? li.getAttribute("data-milestone-id") : null;
      if (!mId) return;

      store.toggleMilestone(mId);
      updateGlobalProgress();
      renderCurriculum();
    });
  });

  container.querySelectorAll(".read-lesson-btn").forEach((btn) => {
    btn.addEventListener("click", (evt) => {
      evt.stopPropagation();
      const mId = btn.getAttribute("data-milestone-id");
      if (mId) {
        openLessonReader(mId);
      }
    });
  });
}

/**
 * 渲染测评框架矩阵或基准数据集百科
 */
function renderMatrix() {
  const container = document.getElementById("frameworks-container");
  const emptyState = document.getElementById("frameworks-empty-state");
  if (!container || !emptyState) return;

  if (matrixViewMode === "frameworks") {
    const items = filterFrameworks(activeCategory, currentSearchQuery);
    if (items.length === 0) {
      container.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";
    container.innerHTML = items.map((fw) => `
      <article class="framework-card">
        <div class="card-top">
          <div class="framework-name-wrap">
            <h3 class="framework-name">${escapeHtml(fw.name)}</h3>
            <span class="category-tag">${escapeHtml(fw.categoryName)}</span>
          </div>
          <span class="stars-badge" title="GitHub Stars">⭐ ${escapeHtml(fw.stars)}</span>
        </div>
        <div class="framework-badge">${escapeHtml(fw.badge)}</div>
        <p class="framework-highlight">${escapeHtml(fw.highlight)}</p>
        <div class="framework-scene">
          <strong>应用场景：</strong>${escapeHtml(fw.scene)}
        </div>
        <div class="card-actions">
          <a href="${escapeHtml(fw.repo)}" target="_blank" rel="noopener noreferrer" class="repo-link">
            <span>GitHub 仓库</span>
            <span aria-hidden="true">↗</span>
          </a>
          <button class="copy-cmd-btn" data-cmd="${escapeHtml(fw.command)}" title="复制快速启动命令">
            复制命令
          </button>
        </div>
      </article>
    `).join("");

    container.querySelectorAll(".copy-cmd-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cmd = btn.getAttribute("data-cmd") || "";
        copyTextToClipboard(cmd, btn, "已复制！", "复制命令");
      });
    });
  } else {
    // 渲染 18+ 核心基准数据集百科
    const items = searchBenchmarks(activeCategory, currentSearchQuery);
    if (items.length === 0) {
      container.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";
    container.innerHTML = items.map((bench) => `
      <article class="benchmark-card">
        <div class="card-top">
          <div class="framework-name-wrap">
            <h3 class="framework-name">${escapeHtml(bench.name)}</h3>
            <span class="category-tag">${escapeHtml(bench.categoryName)}</span>
          </div>
          <span class="benchmark-metrics" title="评测指标">${escapeHtml(bench.keyMetrics)}</span>
        </div>
        <div class="benchmark-meta">
          <span class="benchmark-pill">🏛️ ${escapeHtml(bench.publisher)}</span>
          <span class="benchmark-pill">📅 ${bench.releaseYear} 年</span>
          <span class="benchmark-pill">📦 ${escapeHtml(bench.sampleType)}</span>
        </div>
        <p class="benchmark-desc">${escapeHtml(bench.description)}</p>
        <div class="benchmark-anti">
          <strong>🛡️ 防数据污染与设计机制：</strong>${escapeHtml(bench.antiContaminationMechanism)}
        </div>
        <div class="benchmark-example-box">
          <strong>💡 题目形态示例：</strong>${escapeHtml(bench.benchmarkExample)}
        </div>
      </article>
    `).join("");
  }
}

/**
 * 渲染代码实验室
 */
function renderCodeLab() {
  const menuContainer = document.getElementById("scaffold-menu");
  const filenameEl = document.getElementById("scaffold-filename");
  const langEl = document.getElementById("scaffold-lang");
  const codeContentEl = document.getElementById("scaffold-code-content");
  const keyPointsEl = document.getElementById("scaffold-key-points");
  if (!menuContainer || !filenameEl || !langEl || !codeContentEl || !keyPointsEl) return;

  const scaffolds = listCodeScaffolds();
  const current = getCodeScaffold(activeScaffoldId);

  menuContainer.innerHTML = scaffolds.map((s) => `
    <button class="scaffold-menu-item ${s.id === current.id ? "active" : ""}" data-scaffold-id="${escapeHtml(s.id)}">
      <div class="scaffold-item-title">${escapeHtml(s.title)}</div>
      <div class="scaffold-item-sub">${escapeHtml(s.subtitle)}</div>
    </button>
  `).join("");

  filenameEl.textContent = current.filename;
  langEl.textContent = current.lang.toUpperCase();
  codeContentEl.textContent = current.code;
  keyPointsEl.innerHTML = current.keyPoints.map((pt) => `<li>${escapeHtml(pt)}</li>`).join("");

  menuContainer.querySelectorAll(".scaffold-menu-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-scaffold-id");
      if (id) {
        activeScaffoldId = id;
        renderCodeLab();
      }
    });
  });
}

/**
 * 渲染视频讲座精粹
 */
function renderVideos() {
  const container = document.getElementById("videos-container");
  if (!container) return;

  container.innerHTML = VIDEOS_DATA.map((v) => `
    <article class="video-card">
      <h3 class="video-title">${escapeHtml(v.title)}</h3>
      <div class="video-speakers">主讲专家：${escapeHtml(v.speakers)}</div>
      <div class="video-channel">发布平台 / 频道：${escapeHtml(v.channel)}</div>
      <div class="video-takeaway">
        <strong>核心洞见：</strong>${escapeHtml(v.keyTakeaway)}
      </div>
      <a href="${escapeHtml(v.searchUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary video-link-btn">
        <span>在 YouTube 上观看</span>
        <span aria-hidden="true">↗</span>
      </a>
    </article>
  `).join("");
}

/**
 * 渲染自测小测验 (支持闭环跳回对应讲义)
 */
function renderQuiz() {
  const container = document.getElementById("quiz-container");
  const summaryPill = document.getElementById("quiz-summary-pill");
  if (!container || !summaryPill) return;

  const answers = store.getState().quizAnswers;
  const summary = computeQuizSummary(answers);

  summaryPill.textContent = `得分：${summary.scorePercentage}% (${summary.correctCount} / ${summary.total})`;

  container.innerHTML = QUIZ_QUESTIONS.map((q, qIndex) => {
    const selectedIdx = answers[q.id];
    const isAnswered = typeof selectedIdx === "number";

    const optionsHtml = q.options.map((opt, optIndex) => {
      let stateClass = "";
      if (isAnswered) {
        if (optIndex === q.answerIndex) {
          stateClass = "correct";
        } else if (optIndex === selectedIdx) {
          stateClass = "wrong";
        }
      }

      return `
        <button class="option-btn ${stateClass}" data-qid="${escapeHtml(q.id)}" data-opt-idx="${optIndex}">
          ${String.fromCharCode(65 + optIndex)}. ${escapeHtml(opt)}
        </button>
      `;
    }).join("");

    return `
      <article class="quiz-card" data-qid="${escapeHtml(q.id)}">
        <div class="quiz-header">
          <span class="quiz-number">题目 ${qIndex + 1} / ${QUIZ_QUESTIONS.length}</span>
        </div>
        <h3 class="quiz-prompt">${escapeHtml(q.prompt)}</h3>
        <div class="options-list">
          ${optionsHtml}
        </div>
        <div class="quiz-explanation ${isAnswered ? "visible" : ""}">
          <strong>解析说明：</strong>${escapeHtml(q.explanation)}
          ${isAnswered && q.milestoneId ? `
            <div>
              <button class="quiz-review-btn" data-milestone-id="${escapeHtml(q.milestoneId)}">
                📖 深入学习本题知识点：查看对应深度讲义
              </button>
            </div>
          ` : ""}
        </div>
      </article>
    `;
  }).join("");

  // 绑定选项点击事件
  container.querySelectorAll(".option-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const qid = btn.getAttribute("data-qid");
      const optIdxStr = btn.getAttribute("data-opt-idx");
      if (!qid || optIdxStr === null) return;

      const optIdx = Number.parseInt(optIdxStr, 10);
      evaluateQuizAnswer(qid, optIdx);
      store.setQuizAnswer(qid, optIdx);
      renderQuiz();
    });
  });

  // 绑定查看关联讲义按钮
  container.querySelectorAll(".quiz-review-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mId = btn.getAttribute("data-milestone-id");
      if (!mId) return;

      // 切换到课程 Tab 并打开讲义
      const curriculumTab = document.querySelector(`.nav-tab[data-tab="curriculum"]`);
      if (curriculumTab) {
        curriculumTab.click();
      }
      openLessonReader(mId);
    });
  });
}

/**
 * 通用剪贴板复制辅助函数 (带降级支持)
 */
function copyTextToClipboard(text, triggerEl, successText = "已复制！", resetText = "复制") {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      triggerEl.textContent = successText;
      setTimeout(() => { triggerEl.textContent = resetText; }, 1800);
    }).catch(() => {
      fallbackCopy(text, triggerEl, successText, resetText);
    });
  } else {
    fallbackCopy(text, triggerEl, successText, resetText);
  }
}

function fallbackCopy(text, triggerEl, successText, resetText) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
    triggerEl.textContent = successText;
    setTimeout(() => { triggerEl.textContent = resetText; }, 1800);
  } catch (err) {
    triggerEl.textContent = "复制失败，请手动选取";
  } finally {
    document.body.removeChild(textArea);
  }
}

/**
 * 界面初始化与事件监听绑定
 */
function initApp() {
  // 1. 初始化主题
  const savedTheme = store.getState().theme;
  document.documentElement.setAttribute("data-theme", savedTheme);
  const themeLabel = document.getElementById("theme-label-text");
  if (themeLabel) {
    themeLabel.textContent = savedTheme === "light" ? "浅色模式" : "深色模式";
  }

  const themeBtn = document.getElementById("theme-toggle-btn");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const nextTheme = currentTheme === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", nextTheme);
      store.setTheme(nextTheme);
      if (themeLabel) {
        themeLabel.textContent = nextTheme === "light" ? "浅色模式" : "深色模式";
      }
    });
  }

  // 2. 导航 Tab 切换
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-tab");
      if (!target) return;

      activeTab = target;
      document.querySelectorAll(".nav-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      document.querySelectorAll(".tab-panel").forEach((panel) => {
        panel.classList.remove("active");
      });
      const targetPanel = document.getElementById(`section-${target}`);
      if (targetPanel) {
        targetPanel.classList.add("active");
      }
    });
  });

  // 3. 讲义阅读器事件绑定
  const readerCloseBtn = document.getElementById("reader-close-btn");
  if (readerCloseBtn) {
    readerCloseBtn.addEventListener("click", () => {
      const readerSection = document.getElementById("lesson-reader-section");
      if (readerSection) readerSection.style.display = "none";
    });
  }

  const readerToggleBtn = document.getElementById("reader-toggle-milestone-btn");
  if (readerToggleBtn) {
    readerToggleBtn.addEventListener("click", () => {
      if (!activeMilestoneId) return;
      store.toggleMilestone(activeMilestoneId);
      updateGlobalProgress();
      renderCurriculum();
      const toggleBtnText = document.getElementById("reader-toggle-btn-text");
      if (toggleBtnText) {
        const isDone = store.isMilestoneCompleted(activeMilestoneId);
        toggleBtnText.textContent = isDone ? "已打卡 (点击取消)" : "标记此课已掌握并打卡";
      }
    });
  }

  const readerNextBtn = document.getElementById("reader-next-lesson-btn");
  if (readerNextBtn) {
    readerNextBtn.addEventListener("click", () => {
      const allLessons = listAllLessons();
      const currentIndex = allLessons.findIndex((l) => l.milestoneId === activeMilestoneId);
      if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
        const nextLesson = allLessons[currentIndex + 1];
        openLessonReader(nextLesson.milestoneId);
      } else {
        openLessonReader(allLessons[0].milestoneId);
      }
    });
  }

  // 4. 框架与基准视图切换
  const typeBtnFrameworks = document.getElementById("type-btn-frameworks");
  const typeBtnBenchmarks = document.getElementById("type-btn-benchmarks");

  if (typeBtnFrameworks && typeBtnBenchmarks) {
    typeBtnFrameworks.addEventListener("click", () => {
      matrixViewMode = "frameworks";
      typeBtnFrameworks.classList.add("active");
      typeBtnBenchmarks.classList.remove("active");
      renderMatrix();
    });

    typeBtnBenchmarks.addEventListener("click", () => {
      matrixViewMode = "benchmarks";
      typeBtnBenchmarks.classList.add("active");
      typeBtnFrameworks.classList.remove("active");
      renderMatrix();
    });
  }

  // 5. 矩阵搜索与筛选
  const searchInput = document.getElementById("framework-search-input");
  const clearBtn = document.getElementById("search-clear-btn");
  if (searchInput && clearBtn) {
    searchInput.addEventListener("input", (e) => {
      currentSearchQuery = e.target.value.trim();
      clearBtn.style.display = currentSearchQuery.length > 0 ? "block" : "none";
      renderMatrix();
    });

    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      currentSearchQuery = "";
      clearBtn.style.display = "none";
      renderMatrix();
      searchInput.focus();
    });
  }

  document.querySelectorAll(".filter-pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      activeCategory = pill.getAttribute("data-category") || "all";
      renderMatrix();
    });
  });

  const emptyResetBtn = document.getElementById("empty-reset-btn");
  if (emptyResetBtn && searchInput) {
    emptyResetBtn.addEventListener("click", () => {
      searchInput.value = "";
      currentSearchQuery = "";
      activeCategory = "all";
      document.querySelectorAll(".filter-pill").forEach((p) => {
        p.classList.toggle("active", p.getAttribute("data-category") === "all");
      });
      renderMatrix();
    });
  }

  // 6. 代码复制主按钮
  const copyCodeBtn = document.getElementById("copy-code-btn");
  if (copyCodeBtn) {
    copyCodeBtn.addEventListener("click", () => {
      const current = getCodeScaffold(activeScaffoldId);
      const copyBtnText = document.getElementById("copy-btn-text");
      copyTextToClipboard(current.code, copyBtnText || copyCodeBtn, "已复制代码！", "一键复制代码");
    });
  }

  // 7. 初次渲染各板块
  updateGlobalProgress();
  renderCurriculum();
  renderMatrix();
  renderCodeLab();
  renderVideos();
  renderQuiz();
}

// DOM 加载就绪后启动应用
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
