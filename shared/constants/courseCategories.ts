export type CourseCategoryKey =
  | 'fundamentals'
  | 'core-syntax'
  | 'advanced-practice'
  | 'projects'
  | 'interview'
  | 'ecosystem'

export interface CourseCategoryMeta {
  key: CourseCategoryKey
  label: string
  title: string
  intro: string
}

export const COURSE_CATEGORY_OPTIONS: CourseCategoryMeta[] = [
  {
    key: 'fundamentals',
    label: '基础入门',
    title: '基础入门',
    intro: '适合零基础学员，目标是能跑起来、能看懂代码，快速建立 Vue 开发信心。'
  },
  {
    key: 'core-syntax',
    label: '核心语法',
    title: '核心语法',
    intro: '深入掌握组件、响应式、生命周期等 Vue 灵魂知识点，夯实开发基础。'
  },
  {
    key: 'advanced-practice',
    label: '进阶实战',
    title: '进阶实战',
    intro: '组合式 API、状态管理、路由、异步请求等实战必备技能，助力真实项目开发。'
  },
  {
    key: 'projects',
    label: '项目开发',
    title: '项目开发',
    intro: '用完整项目驱动学习，覆盖后台管理、移动端与全栈场景，提升综合实战能力。'
  },
  {
    key: 'interview',
    label: '面试专题',
    title: '面试专题',
    intro: '高频面试题、源码原理、性能优化与大厂经验，帮你在求职中脱颖而出。'
  },
  {
    key: 'ecosystem',
    label: '生态工具',
    title: '生态工具',
    intro: '覆盖 Element Plus、Pinia、VueUse、Nuxt、UniApp 等主流 Vue 生态库与工具。'
  }
]

export const COURSE_CATEGORY_LABEL_MAP: Record<CourseCategoryKey, string> = {
  'fundamentals': '基础入门',
  'core-syntax': '核心语法',
  'advanced-practice': '进阶实战',
  'projects': '项目开发',
  'interview': '面试专题',
  'ecosystem': '生态工具'
}

const KEYWORD_CATEGORY_RULES: Array<{ keywords: string[]; category: CourseCategoryKey }> = [
  { keywords: ['vue是什么', '第一个vue', '模板语法', '插值', '指令', '数据绑定', '计算属性', '侦听器', '入门', '基础', '环境搭建'], category: 'fundamentals' },
  { keywords: ['组件基础', 'props', 'emit', 'slot', '生命周期', '条件渲染', '列表渲染', '样式绑定', '核心语法'], category: 'core-syntax' },
  { keywords: ['provide', 'inject', 'mitt', '组合式', 'api封装', '路由', 'pinia', '表单', '验证', '进阶', 'vite', 'eslint', '跨域', '打包', '部署', 'git', 'mock'], category: 'advanced-practice' },
  { keywords: ['项目', '实战', 'todo', '后台管理', '小程序', 'h5', '全栈', '项目开发'], category: 'projects' },
  { keywords: ['面试', '源码', '虚拟dom', 'diff', '响应式原理', '性能优化', 'bug', '大厂', '面试专题'], category: 'interview' },
  { keywords: ['element plus', 'antd', 'vuetify', 'axios', 'vueuse', 'nuxt', 'uniapp', '生态', '组件库', '工具库'], category: 'ecosystem' }
]

export function inferCourseCategory(input: {
  title?: string
  level?: string
  tags?: unknown
}): CourseCategoryKey {
  const level = (input.level || '').toLowerCase()
  const title = (input.title || '').toLowerCase()
  const tags = Array.isArray(input.tags) ? input.tags.join(' ').toLowerCase() : ''
  const text = `${title} ${tags}`

  for (const rule of KEYWORD_CATEGORY_RULES) {
    if (rule.keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
      return rule.category
    }
  }

  if (level === 'beginner') return 'fundamentals'
  if (level === 'intermediate') return 'advanced-practice'
  if (level === 'advanced') return 'projects'

  return 'core-syntax'
}
