/**
 * 测评框架检索矩阵、基准数据集百科与视频资源检索核心
 * 纯业务逻辑函数，两层架构 Layer 2
 */

import { FRAMEWORKS_DATA, VIDEOS_DATA, BENCHMARK_DATASETS } from "./data.js";

/**
 * 逃逸特殊正则字符，防止恶意输入导致正则拒绝服务 (BR-2)
 */
function escapeRegex(str) {
  if (typeof str !== "string") {
    return "";
  }
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 根据类别与关键词筛选测评框架 (BR-1, BR-2, BR-3)
 */
export function filterFrameworks(category = "all", searchQuery = "") {
  const safeCategory = (category && typeof category === "string") ? category.trim().toLowerCase() : "all";
  const query = (searchQuery && typeof searchQuery === "string") ? searchQuery.trim().toLowerCase() : "";

  return FRAMEWORKS_DATA.filter((item) => {
    // 类别匹配
    if (safeCategory !== "all" && item.category !== safeCategory) {
      return false;
    }

    // 关键词匹配
    if (!query) {
      return true;
    }

    const nameMatch = item.name.toLowerCase().includes(query);
    const highlightMatch = item.highlight.toLowerCase().includes(query);
    const sceneMatch = item.scene.toLowerCase().includes(query);
    const badgeMatch = item.badge.toLowerCase().includes(query);

    return nameMatch || highlightMatch || sceneMatch || badgeMatch;
  });
}

/**
 * 列出所有核心评测基准数据集 (BR-1)
 */
export function listAllBenchmarks() {
  return [...BENCHMARK_DATASETS];
}

/**
 * 多维检索核心基准数据集百科 (BR-1, BR-2, BR-3)
 */
export function searchBenchmarks(category = "all", searchQuery = "") {
  const safeCategory = (category && typeof category === "string") ? category.trim().toLowerCase() : "all";
  const query = (searchQuery && typeof searchQuery === "string") ? searchQuery.trim().toLowerCase() : "";

  return BENCHMARK_DATASETS.filter((item) => {
    // 类别匹配
    if (safeCategory !== "all" && item.category !== safeCategory) {
      return false;
    }

    // 关键词匹配
    if (!query) {
      return true;
    }

    const nameMatch = item.name.toLowerCase().includes(query);
    const descMatch = item.description.toLowerCase().includes(query);
    const antiMatch = item.antiContaminationMechanism.toLowerCase().includes(query);
    const pubMatch = item.publisher.toLowerCase().includes(query);
    const exMatch = item.benchmarkExample.toLowerCase().includes(query);
    const sampleMatch = item.sampleType.toLowerCase().includes(query);
    const catNameMatch = item.categoryName.toLowerCase().includes(query);
    const metricsMatch = item.keyMetrics.toLowerCase().includes(query);

    return nameMatch || descMatch || antiMatch || pubMatch || exMatch || sampleMatch || catNameMatch || metricsMatch;
  });
}

/**
 * 根据关键词检索视频精粹 (BR-1, BR-2, BR-3)
 */
export function searchVideos(searchQuery = "") {
  const query = (searchQuery && typeof searchQuery === "string") ? searchQuery.trim().toLowerCase() : "";

  if (!query) {
    return [...VIDEOS_DATA];
  }

  return VIDEOS_DATA.filter((video) => {
    const titleMatch = video.title.toLowerCase().includes(query);
    const speakerMatch = video.speakers.toLowerCase().includes(query);
    const channelMatch = video.channel.toLowerCase().includes(query);
    const takeawayMatch = video.keyTakeaway.toLowerCase().includes(query);

    return titleMatch || speakerMatch || channelMatch || takeawayMatch;
  });
}
