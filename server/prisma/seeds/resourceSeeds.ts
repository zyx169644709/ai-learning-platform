import { PrismaClient } from '../../generated/prisma'

const prisma = new PrismaClient()

export const resourceSeeds = [
  // ========== 学习文档 (docs) ==========
  {
    title: 'Vue 3 官方文档中文版',
    description: 'Vue 3 官方中文文档，最权威的学习资料，涵盖核心概念、API 参考和最佳实践',
    category: 'docs',
    type: 'document',
    url: 'https://cn.vuejs.org/',
    tags: ['Vue3', '官方文档', '中文'],
    status: 'published'
  },
  {
    title: 'Vue 3 迁移指南',
    description: '从 Vue 2 迁移到 Vue 3 的完整指南，包含所有破坏性变更说明',
    category: 'docs',
    type: 'document',
    url: 'https://v3-migration.vuejs.org/zh/',
    tags: ['Vue3', '迁移', 'Vue2'],
    status: 'published'
  },
  {
    title: 'Vue Router 官方文档',
    description: 'Vue Router 4 官方中文文档，Vue 3 官方路由解决方案',
    category: 'docs',
    type: 'document',
    url: 'https://router.vuejs.org/zh/',
    tags: ['Vue Router', '路由', '官方文档'],
    status: 'published'
  },
  {
    title: 'Pinia 官方文档',
    description: 'Vue 3 官方推荐的状态管理库，轻量灵活，完整 TypeScript 支持',
    category: 'docs',
    type: 'document',
    url: 'https://pinia.vuejs.org/zh/',
    tags: ['Pinia', '状态管理', 'Vue3'],
    status: 'published'
  },
  {
    title: 'Vue 3 入门指南 - 菜鸟教程',
    description: '适合初学者的 Vue 3 入门教程，通俗易懂，示例丰富',
    category: 'docs',
    type: 'tutorial',
    url: 'https://www.runoob.com/vue3/vue3-tutorial.html',
    tags: ['Vue3', '入门', '初学者'],
    status: 'published'
  },
  {
    title: 'Vue 3 组合式 API 常见问答',
    description: '官方 Composition API 常见问题解答，帮助理解组合式 API 的设计理念',
    category: 'docs',
    type: 'document',
    url: 'https://cn.vuejs.org/guide/extras/composition-api-faq.html',
    tags: ['Composition API', '问答', 'Vue3'],
    status: 'published'
  },
  {
    title: '现代 JavaScript 教程',
    description: '学习 Vue 前必备的 JavaScript 基础，从基础到高级全面覆盖',
    category: 'docs',
    type: 'tutorial',
    url: 'https://zh.javascript.info/',
    tags: ['JavaScript', '基础', '教程'],
    status: 'published'
  },

  // ========== 项目模板 (templates) ==========
  {
    title: 'create-vue（官方脚手架）',
    description: 'Vue 官方推荐的项目脚手架工具，快速创建 Vue 3 + Vite 项目',
    category: 'templates',
    type: 'tool',
    url: 'https://github.com/vuejs/create-vue',
    tags: ['Vue3', 'Vite', '脚手架'],
    status: 'published'
  },
  {
    title: 'Vite 官方模板',
    description: 'Vite 官方提供的各种项目模板，支持 Vue、React、Svelte 等框架',
    category: 'templates',
    type: 'tool',
    url: 'https://vitejs.dev/guide/#scaffolding-your-first-vite-project',
    tags: ['Vite', '模板', '脚手架'],
    status: 'published'
  },
  {
    title: 'vue-element-admin',
    description: '基于 Vue 和 Element UI 的后台管理系统模板，功能丰富，开箱即用',
    category: 'templates',
    type: 'tool',
    url: 'https://github.com/PanJiaChen/vue-element-admin',
    tags: ['后台管理', 'Element UI', '模板'],
    status: 'published'
  },
  {
    title: 'Soybean Admin',
    description: '清爽优雅的 Vue 3 中后台管理模板，基于 Naive UI，支持多主题',
    category: 'templates',
    type: 'tool',
    url: 'https://github.com/soybeanjs/soybean-admin',
    tags: ['Vue3', 'Naive UI', '后台管理'],
    status: 'published'
  },
  {
    title: 'Naive UI Admin',
    description: '基于 Vue 3 + Naive UI 的管理后台模板，界面简洁美观',
    category: 'templates',
    type: 'tool',
    url: 'https://github.com/jekip/naive-ui-admin',
    tags: ['Vue3', 'Naive UI', '管理后台'],
    status: 'published'
  },
  {
    title: 'Vant Demo（移动端）',
    description: 'Vant 移动端 UI 组件库官方示例，适合开发移动端 Vue 应用',
    category: 'templates',
    type: 'tool',
    url: 'https://vant-ui.github.io/vant/#/zh-CN',
    tags: ['移动端', 'Vant', '组件库'],
    status: 'published'
  },
  {
    title: 'NutUI 模板',
    description: '京东风格的移动端 Vue 组件库，适合开发 H5 和小程序',
    category: 'templates',
    type: 'tool',
    url: 'https://nutui.jd.com/',
    tags: ['移动端', 'NutUI', '京东'],
    status: 'published'
  },

  // ========== 工具配置 (configs) ==========
  {
    title: 'Node.js 官网',
    description: '下载安装 Node.js 运行环境，Vue 开发必备',
    category: 'configs',
    type: 'website',
    url: 'https://nodejs.org/zh-cn/',
    tags: ['Node.js', '环境配置', '安装'],
    status: 'published'
  },
  {
    title: 'nvm 使用教程',
    description: 'Node 版本管理工具，方便在不同项目间切换 Node 版本',
    category: 'configs',
    type: 'tool',
    url: 'https://github.com/nvm-sh/nvm',
    tags: ['nvm', 'Node版本', '工具'],
    status: 'published'
  },
  {
    title: 'ESLint 中文文档',
    description: 'JavaScript 代码检查工具，帮助发现和修复代码问题',
    category: 'configs',
    type: 'document',
    url: 'https://eslint.nodejs.cn/',
    tags: ['ESLint', '代码规范', '检查'],
    status: 'published'
  },
  {
    title: 'Prettier 官方文档',
    description: '代码格式化工具，统一团队代码风格，支持多种语言',
    category: 'configs',
    type: 'document',
    url: 'https://prettier.io/docs/en/',
    tags: ['Prettier', '代码格式化', '工具'],
    status: 'published'
  },
  {
    title: 'Vue 风格指南',
    description: 'Vue 官方代码风格指南，包含必要、强烈推荐、推荐和谨慎使用规则',
    category: 'configs',
    type: 'document',
    url: 'https://cn.vuejs.org/style-guide/',
    tags: ['Vue', '代码规范', '风格指南'],
    status: 'published'
  },
  {
    title: 'VSCode Vue 插件推荐（Volar）',
    description: 'Volar - Vue 3 官方推荐的 VSCode 插件，提供语法高亮和智能提示',
    category: 'configs',
    type: 'tool',
    url: 'https://marketplace.visualstudio.com/items?itemName=Vue.volar',
    tags: ['VSCode', 'Volar', '插件'],
    status: 'published'
  },
  {
    title: 'Vite 配置参考',
    description: 'Vite 完整配置选项文档，涵盖构建、服务器、插件等配置',
    category: 'configs',
    type: 'document',
    url: 'https://vitejs.dev/config/',
    tags: ['Vite', '配置', '构建工具'],
    status: 'published'
  },
  {
    title: 'Vercel 部署教程',
    description: '免费部署 Vue 项目到 Vercel，支持自动 CI/CD 和自定义域名',
    category: 'configs',
    type: 'tutorial',
    url: 'https://vercel.com/docs',
    tags: ['Vercel', '部署', 'CI/CD'],
    status: 'published'
  },
  {
    title: 'Netlify 部署指南',
    description: '免费部署前端项目，支持自动构建和表单处理',
    category: 'configs',
    type: 'tutorial',
    url: 'https://docs.netlify.com/',
    tags: ['Netlify', '部署', '前端托管'],
    status: 'published'
  },

  // ========== 代码片段 (snippets) ==========
  {
    title: 'Axios 中文文档',
    description: 'HTTP 请求库，包含封装示例和拦截器使用方法',
    category: 'snippets',
    type: 'document',
    url: 'https://www.axios-http.cn/',
    tags: ['Axios', 'HTTP请求', '封装'],
    status: 'published'
  },
  {
    title: 'Vue 3 + Axios 封装最佳实践',
    description: 'Axios 官方示例代码，包含请求拦截、响应处理等常用封装',
    category: 'snippets',
    type: 'code',
    url: 'https://github.com/axios/axios#example',
    tags: ['Axios', '代码示例', '封装'],
    status: 'published'
  },
  {
    title: 'VueUse 工具库',
    description: 'Vue 3 组合式 API 工具集合，包含数百个实用函数',
    category: 'snippets',
    type: 'tool',
    url: 'https://vueuse.org/',
    tags: ['VueUse', 'Composition API', '工具函数'],
    status: 'published'
  },
  {
    title: 'Lodash 中文文档',
    description: 'JavaScript 实用工具库，提供数组、对象、字符串等操作函数',
    category: 'snippets',
    type: 'document',
    url: 'https://www.lodashjs.com/',
    tags: ['Lodash', '工具库', 'JavaScript'],
    status: 'published'
  },
  {
    title: 'Day.js 中文文档',
    description: '轻量级日期处理库，API 与 Moment.js 完全兼容',
    category: 'snippets',
    type: 'document',
    url: 'https://dayjs.fenxianglu.cn/',
    tags: ['Day.js', '日期处理', '轻量级'],
    status: 'published'
  },
  {
    title: '30 seconds of code',
    description: '精选的实用 JavaScript 代码片段，每个片段可在 30 秒内理解',
    category: 'snippets',
    type: 'code',
    url: 'https://www.30secondsofcode.org/',
    tags: ['JavaScript', '代码片段', '实用'],
    status: 'published'
  },
  {
    title: 'Vue 3 代码片段集合',
    description: 'Awesome Vue 中的代码片段资源，收录社区优质代码片段',
    category: 'snippets',
    type: 'code',
    url: 'https://github.com/vuejs/awesome-vue#snippets',
    tags: ['Vue3', '代码片段', 'Awesome'],
    status: 'published'
  },

  // ========== 面试资源 (interview) ==========
  {
    title: 'Vue 面试题汇总',
    description: '前端面试每日 3+1 - Vue 专题，涵盖 Vue 2/3 高频考点',
    category: 'interview',
    type: 'document',
    url: 'https://github.com/haizlin/fe-interview/blob/master/category/vue.md',
    tags: ['Vue', '面试题', '高频考点'],
    status: 'published'
  },
  {
    title: 'Vue 3 面试题精选',
    description: '掘金精选 Vue 3 面试题，附带详细解析和示例代码',
    category: 'interview',
    type: 'document',
    url: 'https://juejin.cn/post/7043074656047202334',
    tags: ['Vue3', '面试题', '掘金'],
    status: 'published'
  },
  {
    title: 'Vue 源码解析',
    description: 'Vue.js 源码分析，深入理解响应式原理、虚拟 DOM 等核心机制',
    category: 'interview',
    type: 'document',
    url: 'https://github.com/ustbhuangyi/vue-analysis',
    tags: ['Vue', '源码', '原理'],
    status: 'published'
  },
  {
    title: '前端面试题库',
    description: '前端面试题库，包含 Vue、React、JavaScript、CSS 等各方面题目',
    category: 'interview',
    type: 'document',
    url: 'https://github.com/febobo/web-interview',
    tags: ['前端', '面试题库', '全面'],
    status: 'published'
  },
  {
    title: 'JavaScript 面试题（中文）',
    description: 'JavaScript 进阶问题列表，图文并茂，深入考察 JS 原理',
    category: 'interview',
    type: 'document',
    url: 'https://github.com/lydiahallie/javascript-questions/blob/master/zh-CN/README-zh_CN.md',
    tags: ['JavaScript', '面试题', '进阶'],
    status: 'published'
  },
  {
    title: '前端工程师手册',
    description: '前端知识体系整理，系统梳理前端开发各个方面的知识点',
    category: 'interview',
    type: 'document',
    url: 'https://leohxj.gitbooks.io/front-end-database/content/',
    tags: ['前端', '知识体系', '手册'],
    status: 'published'
  },
  {
    title: 'JavaScript 算法与数据结构',
    description: 'JavaScript 算法和数据结构实现，附带大 O 复杂度分析',
    category: 'interview',
    type: 'code',
    url: 'https://github.com/trekhleb/javascript-algorithms/blob/master/README.zh-CN.md',
    tags: ['算法', '数据结构', 'JavaScript'],
    status: 'published'
  },
  {
    title: 'LeetCode 中文版',
    description: '算法题练习平台，包含海量算法题和面试真题，附带讨论和题解',
    category: 'interview',
    type: 'website',
    url: 'https://leetcode.cn/',
    tags: ['LeetCode', '算法', '刷题'],
    status: 'published'
  },
  {
    title: '程序员简历模板',
    description: '程序员简历模板合集，提供 Word/Markdown 等多种格式',
    category: 'interview',
    type: 'document',
    url: 'https://github.com/geekcompany/ResumeSample',
    tags: ['简历', '模板', '程序员'],
    status: 'published'
  },
  {
    title: '冷熊简历',
    description: 'Markdown 简历在线生成工具，简洁高效，支持实时预览',
    category: 'interview',
    type: 'tool',
    url: 'http://cv.ftqq.com/',
    tags: ['简历', 'Markdown', '在线生成'],
    status: 'published'
  },

  // ========== 插件工具 (plugins) ==========
  {
    title: 'Element Plus',
    description: '基于 Vue 3 的组件库，提供 60+ 高质量组件，支持暗黑模式',
    category: 'plugins',
    type: 'tool',
    url: 'https://element-plus.org/zh-CN/',
    tags: ['Element Plus', 'UI组件库', 'Vue3'],
    status: 'published'
  },
  {
    title: 'Naive UI',
    description: 'Vue 3 组件库，主题可调，TypeScript 友好，文档详细',
    category: 'plugins',
    type: 'tool',
    url: 'https://www.naiveui.com/zh-CN/os-theme',
    tags: ['Naive UI', 'UI组件库', 'Vue3'],
    status: 'published'
  },
  {
    title: 'Ant Design Vue',
    description: 'Ant Design 的 Vue 实现，企业级 UI 设计语言和组件库',
    category: 'plugins',
    type: 'tool',
    url: 'https://antdv.com/components/overview-cn',
    tags: ['Ant Design', 'UI组件库', '企业级'],
    status: 'published'
  },
  {
    title: 'Vant',
    description: '移动端 Vue 组件库，支持 Vue 3，轻量高效，适合 H5 开发',
    category: 'plugins',
    type: 'tool',
    url: 'https://vant-ui.github.io/vant/#/zh-CN',
    tags: ['Vant', '移动端', 'UI组件库'],
    status: 'published'
  },
  {
    title: 'VueUse',
    description: 'Vue 组合式 API 工具集，提供数百个开箱即用的组合函数',
    category: 'plugins',
    type: 'tool',
    url: 'https://vueuse.org/',
    tags: ['VueUse', '工具集', 'Composition API'],
    status: 'published'
  },
  {
    title: 'Vue I18n',
    description: 'Vue 国际化插件，轻松为 Vue 应用添加多语言支持',
    category: 'plugins',
    type: 'tool',
    url: 'https://vue-i18n.intlify.dev/',
    tags: ['i18n', '国际化', '多语言'],
    status: 'published'
  },
  {
    title: 'VueRequest',
    description: 'Vue 请求库，类似 SWR，支持自动重试、缓存、防抖等功能',
    category: 'plugins',
    type: 'tool',
    url: 'https://www.attojs.com/',
    tags: ['请求库', 'Vue3', '数据请求'],
    status: 'published'
  },
  {
    title: 'ECharts',
    description: '百度开源的可视化图表库，功能强大，支持多种图表类型',
    category: 'plugins',
    type: 'tool',
    url: 'https://echarts.apache.org/zh/index.html',
    tags: ['ECharts', '图表', '数据可视化'],
    status: 'published'
  },
  {
    title: 'Chart.js',
    description: '简单灵活的 JavaScript 图表库，8 种图表类型，易于使用',
    category: 'plugins',
    type: 'tool',
    url: 'https://www.chartjs.org/',
    tags: ['Chart.js', '图表库', '可视化'],
    status: 'published'
  },
  {
    title: 'VeeValidate',
    description: 'Vue 3 表单验证库，支持 Yup、Valibot 等验证方案',
    category: 'plugins',
    type: 'tool',
    url: 'https://vee-validate.logaretm.com/v4/',
    tags: ['VeeValidate', '表单验证', 'Vue3'],
    status: 'published'
  },
  {
    title: 'FormKit',
    description: 'Vue 3 表单框架，提供完整的表单构建和验证解决方案',
    category: 'plugins',
    type: 'tool',
    url: 'https://formkit.com/',
    tags: ['FormKit', '表单框架', 'Vue3'],
    status: 'published'
  },
  {
    title: 'GSAP',
    description: '强大的 JavaScript 动画库，性能优秀，适合复杂动画场景',
    category: 'plugins',
    type: 'tool',
    url: 'https://gsap.com/',
    tags: ['GSAP', '动画库', 'JavaScript'],
    status: 'published'
  },
  {
    title: 'Animate.css',
    description: 'CSS 动画库，提供丰富的预设动画效果，开箱即用',
    category: 'plugins',
    type: 'tool',
    url: 'https://animate.style/',
    tags: ['CSS动画', 'Animate.css', '动效'],
    status: 'published'
  },
  {
    title: 'Vue Draggable',
    description: 'Vue 3 拖拽组件，基于 Sortable.js，支持列表拖拽排序',
    category: 'plugins',
    type: 'tool',
    url: 'https://github.com/SortableJS/vue.draggable.next',
    tags: ['拖拽', 'Sortable', 'Vue3'],
    status: 'published'
  },
  {
    title: 'Vue Quill Editor',
    description: 'Vue 3 富文本编辑器，基于 Quill，支持自定义工具栏',
    category: 'plugins',
    type: 'tool',
    url: 'https://vueup.github.io/vue-quill/',
    tags: ['富文本', 'Quill', '编辑器'],
    status: 'published'
  },
  {
    title: 'Vue Cropper',
    description: 'Vue 图片裁剪组件，支持缩放、旋转，功能完善',
    category: 'plugins',
    type: 'tool',
    url: 'https://github.com/xyxiao001/vue-cropper',
    tags: ['图片裁剪', 'Vue', '组件'],
    status: 'published'
  }
]

export async function seedResources() {
  console.log('开始创建资源数据...')

  // 清除旧的分类数据，避免重复插入
  await prisma.resource.deleteMany({
    where: {
      category: { in: ['docs', 'templates', 'configs', 'snippets', 'interview', 'plugins'] }
    }
  })
  console.log('已清除旧的分类资源数据\n')

  for (const resource of resourceSeeds) {
    await prisma.resource.create({ data: resource })
    console.log(`✓ ${resource.title}`)
  }

  console.log(`\n成功创建 ${resourceSeeds.length} 个资源数据！`)
  console.log('  学习文档 (docs): 7 个')
  console.log('  项目模板 (templates): 7 个')
  console.log('  工具配置 (configs): 9 个')
  console.log('  代码片段 (snippets): 7 个')
  console.log('  面试资源 (interview): 10 个')
  console.log('  插件工具 (plugins): 16 个')
}
