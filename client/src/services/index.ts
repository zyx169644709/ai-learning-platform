// API 服务统一入口

// 用户相关服务
export * from './userService.ts'

// AI 核心服务（统一接口层）
export * from './aiService.ts'



// 便捷导出常用服务（同时导出原始命名，避免上层找不到符号）
export {
  askTeachingAssistant as teachingAI,
  streamTeachingChat as streamAI,
  analyzeCodeWithDeepSeek as codeAnalyzer,
  // 原始命名导出，供如 '@/services' 直接按名称使用
  askTeachingAssistant,
  streamTeachingChat,
  analyzeCodeWithDeepSeek,
  generateLearningPlan
} from './ai/deepseekService.ts'
export {
  sendMessageToCoze as agentChat,
  // 原始命名导出
  sendMessageToCoze
} from './agent/cozeService.ts'
export {
  // MBTI 专用导出
  sendMessageToMBTI
} from './agent/mbtiService.ts'

export { 
  askAiQuestion as askAI,
  analyzeCode,
  getLearningTips
} from './aiService.ts'

