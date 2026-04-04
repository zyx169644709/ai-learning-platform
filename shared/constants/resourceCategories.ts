/**
 * 资源分类定义
 * 用于资源页面的分类展示和筛选
 */

export type ResourceCategoryKey = 
  | 'docs'           // 学习文档
  | 'templates'      // 项目模板
  | 'configs'        // 工具配置
  | 'snippets'       // 代码片段
  | 'interview'      // 面试资源
  | 'plugins'        // 插件工具

export interface ResourceCategoryMeta {
  key: ResourceCategoryKey
  label: string
  title: string
  intro: string
  icon: string
}

export const RESOURCE_CATEGORY_OPTIONS: ResourceCategoryMeta[] = [
  {
    key: 'docs',
    label: '学习文档',
    title: '学习文档',
    intro: 'Vue 官方文档精选、核心概念笔记、API 速查表等学习资料，适合速查和深入理解。',
    icon: '📚'
  },
  {
    key: 'templates',
    label: '项目模板',
    title: '项目模板',
    intro: '开箱即用的 Vue3 项目模板，包含基础模板、管理后台、移动端等多种场景，快速启动项目开发。',
    icon: '🚀'
  },
  {
    key: 'configs',
    label: '工具配置',
    title: '工具配置',
    intro: '开发环境配置、代码规范、编辑器插件等工具配置指南，解决环境问题，提升开发效率。',
    icon: '⚙️'
  },
  {
    key: 'snippets',
    label: '代码片段',
    title: '代码片段',
    intro: '高频复用的代码片段，包含请求封装、表单验证、工具函数等，复制即用，提升开发效率。',
    icon: '💻'
  },
  {
    key: 'interview',
    label: '面试资源',
    title: '面试资源',
    intro: 'Vue 面试题、前端八股文、手写代码题、简历模板等面试资料，助力求职面试。',
    icon: '📝'
  },
  {
    key: 'plugins',
    label: '插件工具',
    title: '插件工具',
    intro: '精选 Vue 生态插件和工具库，包含 UI 组件库、工具库、图表库等，快速找到合适的工具。',
    icon: '🔧'
  }
]

/**
 * 根据 key 获取分类元数据
 */
export function getResourceCategoryMeta(key: ResourceCategoryKey): ResourceCategoryMeta | undefined {
  return RESOURCE_CATEGORY_OPTIONS.find(item => item.key === key)
}

/**
 * 资源类型标签映射（用于显示）
 */
export const RESOURCE_TYPE_LABELS: Record<string, string> = {
  'article': '文章',
  'video': '视频',
  'code': '代码',
  'tool': '工具',
  'template': '模板',
  'plugin': '插件',
  'doc': '文档',
  'tutorial': '教程',
  'cheatsheet': '速查表',
  'guide': '指南'
}

/**
 * 资源标签颜色映射（用于 UI 展示）
 */
export const RESOURCE_TAG_COLORS: Record<ResourceCategoryKey, string> = {
  'docs': '#10b981',        // 绿色
  'templates': '#3b82f6',   // 蓝色
  'configs': '#f59e0b',     // 橙色
  'snippets': '#8b5cf6',    // 紫色
  'interview': '#ef4444',   // 红色
  'plugins': '#06b6d4'      // 青色
}
