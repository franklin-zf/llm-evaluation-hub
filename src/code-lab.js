/**
 * 代码实验室核心逻辑：脚手架列表与检索服务
 * 纯业务逻辑函数，两层架构 Layer 2
 */

import { CODE_SCAFFOLDS } from "./data.js";

/**
 * 获取所有代码脚手架
 */
export function listCodeScaffolds() {
  return [...CODE_SCAFFOLDS];
}

/**
 * 根据 ID 获取指定脚手架，异常输入时安全回退至默认首项 (BR-1 & BR-2)
 */
export function getCodeScaffold(scaffoldId = "") {
  if (!scaffoldId || typeof scaffoldId !== "string") {
    return CODE_SCAFFOLDS[0];
  }

  const target = CODE_SCAFFOLDS.find((s) => s.id === scaffoldId.trim());
  if (!target) {
    return CODE_SCAFFOLDS[0];
  }

  return target;
}
