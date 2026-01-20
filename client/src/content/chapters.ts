export interface TocNode {
  id: string
  title: string
  slug: string
  children?: TocNode[]
}

export const chapters: TocNode[] = [
  {
    id: '1-vue-basics',
    title: 'Vue 3 基础入门',
    slug: 'vue-basics',
    children: [
      { id: '1.1', title: 'Vue 3 简介与环境搭建', slug: 'introduction' },
      { id: '1.2', title: '模板语法与指令', slug: 'template-syntax' },
      { id: '1.3', title: '响应式基础：ref 与 reactive', slug: 'reactivity-basics' },
      { id: '1.4', title: '计算属性与侦听器', slug: 'computed-watch' },
    ]
  },
  {
    id: '2-composition-api',
    title: 'Composition API 进阶',
    slug: 'composition-api',
    children: [
      { id: '2.1', title: 'Setup 函数与生命周期钩子', slug: 'setup-lifecycle' },
      { id: '2.2', title: '逻辑复用：Composables', slug: 'composables' },
      { id: '2.3', title: '依赖注入：Provide / Inject', slug: 'provide-inject' },
      { id: '2.4', title: 'Template Refs 与组件通信', slug: 'refs-communication' }
    ]
  },
  {
    id: '3-components-deep',
    title: '深入组件系统',
    slug: 'components-deep',
    children: [
      { id: '3.1', title: '组件注册与属性 Props', slug: 'props-registration' },
      { id: '3.2', title: '自定义事件与 v-model', slug: 'events-vmodel' },
      { id: '3.3', title: '插槽 Slots 全解', slug: 'slots' },
      { id: '3.4', title: '异步组件与 Teleport', slug: 'async-teleport' }
    ]
  },
  {
    id: '4-routing-state',
    title: '路由与状态管理',
    slug: 'routing-state',
    children: [
      { id: '4.1', title: 'Vue Router 4 基础配置', slug: 'router-basics' },
      { id: '4.2', title: '动态路由与导航守卫', slug: 'dynamic-routing' },
      { id: '4.3', title: 'Pinia 状态管理入门', slug: 'pinia-basics' },
      { id: '4.4', title: 'Pinia 进阶：插件与持久化', slug: 'pinia-advanced' }
    ]
  },
  {
    id: '5-ecosystem',
    title: 'Vue 生态与工程化',
    slug: 'ecosystem',
    children: [
      { id: '5.1', title: 'Vite 构建工具实践', slug: 'vite-practice' },
      { id: '5.2', title: 'Vue Use 常用库推荐', slug: 'vue-use' },
      { id: '5.3', title: 'TypeScript 在 Vue 中的应用', slug: 'vue-typescript' }
    ]
  },
  {
    id: '6-performance-testing',
    title: '性能优化与测试',
    slug: 'performance-testing',
    children: [
      { id: '6.1', title: 'Vue 性能分析工具', slug: 'performance-tools' },
      { id: '6.2', title: '代码分割与懒加载', slug: 'code-splitting' },
      { id: '6.3', title: 'Vitest 与组件测试', slug: 'vue-testing' }
    ]
  },
  {
    id: '7-exercises',
    title: '专项习题练习',
    slug: 'exercises',
    children: [
      { id: '7.1', title: 'Vue 3 基础语法练习题', slug: 'basics-quiz' },
      { id: '7.2', title: '响应式原理深度解析题', slug: 'reactivity-quiz' },
      { id: '7.3', title: '组件设计模式练习', slug: 'component-patterns' }
    ]
  },
  {
    id: '8-practical-projects',
    title: '实战项目演练',
    slug: 'practical-projects',
    children: [
      { id: '8.1', title: '项目实战：待办事项清单 (TodoList)', slug: 'project-todolist' },
      { id: '8.2', title: '项目实战：个人博客系统 (SPA)', slug: 'project-blog' },
      { id: '8.3', title: '项目实战：后台管理系统系统', slug: 'project-admin' }
    ]
  }
]

export function flatToc(nodes: TocNode[]): TocNode[] {
  const out: TocNode[] = []
  const walk = (arr: TocNode[]) => arr.forEach(n => { out.push(n); if (n.children) walk(n.children) })
  walk(nodes)
  return out
}


