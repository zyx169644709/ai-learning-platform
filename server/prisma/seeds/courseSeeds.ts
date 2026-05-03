import { PrismaClient } from '../../generated/prisma'

const prisma = new PrismaClient()

type CourseSeed = {
  title: string
  category: string
  level: string
  url: string
  status: string
  duration: string
  content: string
  tags: string[]
  order: number
  cover?: string
}

export const courseSeeds: CourseSeed[] = [
  // ========== 基础入门 (fundamentals) ==========
  {
    title: 'Vue3 零基础入门（黑马程序员）',
    category: 'fundamentals',
    level: '初级',
    url: 'https://www.bilibili.com/video/BV1HV4y1a7n4',
    status: 'published',
    duration: '约 200 小时',
    content: '黑马程序员出品，从零开始学 Vue3，适合完全没有基础的同学，循序渐进讲解 Vue3 核心语法。',
    tags: ['Vue3', '零基础', '黑马', '入门'],
    order: 1
  },
  {
    title: 'Vue3 纯血版快速上手（尚硅谷）',
    category: 'fundamentals',
    level: '初级',
    url: 'https://www.bilibili.com/video/BV1Za4y1r7KE',
    status: 'published',
    duration: '约 100 小时',
    content: '尚硅谷出品，专注 Vue3 最新纯血版本，快速掌握 Composition API 和新特性。',
    tags: ['Vue3', '尚硅谷', '快速上手', '纯血版'],
    order: 2
  },
  {
    title: '5 小时 Vue3 极速入门',
    category: 'fundamentals',
    level: '初级',
    url: 'https://www.bilibili.com/video/BV1CcXpBvE22',
    status: 'published',
    duration: '5 小时',
    content: '5 小时快速掌握 Vue3 核心知识点，适合有一定 JS 基础、想快速上手 Vue3 的同学。',
    tags: ['Vue3', '极速入门', '快速学习'],
    order: 3
  },

  // ========== 核心语法 (core-syntax) ==========
  {
    title: 'Vue3 核心语法全集（尚硅谷）',
    category: 'core-syntax',
    level: '初级',
    url: 'https://www.bilibili.com/video/BV1Za4y1r7KE',
    status: 'published',
    duration: '约 100 小时',
    content: '系统讲解 Vue3 核心语法，包括 ref、reactive、computed、watch 等 Composition API 全家桶。',
    tags: ['Vue3', '核心语法', '尚硅谷', 'Composition API'],
    order: 4
  },
  {
    title: 'Vue3 响应式原理精讲',
    category: 'core-syntax',
    level: '中级',
    url: 'https://www.bilibili.com/video/BV1iL411z7Xa',
    status: 'published',
    duration: '约 20 小时',
    content: '深入讲解 Vue3 响应式系统原理，理解 Proxy、effect、track、trigger 等核心机制。',
    tags: ['Vue3', '响应式原理', 'Proxy', '源码'],
    order: 5
  },
  {
    title: 'Vue3 组件通信 8 种方式',
    category: 'core-syntax',
    level: '初级',
    url: 'https://www.bilibili.com/video/BV1qM4K1T75N',
    status: 'published',
    duration: '约 10 小时',
    content: '全面讲解 Vue3 组件通信的 8 种方式：props、emit、v-model、ref、provide/inject、mitt、pinia 等。',
    tags: ['Vue3', '组件通信', 'props', 'emit'],
    order: 6
  },

  // ========== 进阶实战 (advanced-practice) ==========
  {
    title: 'Vue3+TS+ElementPlus 企业实战',
    category: 'advanced-practice',
    level: '中级',
    url: 'https://www.bilibili.com/video/BV1zt411e7fp',
    status: 'published',
    duration: '约 150 小时',
    content: '企业级 Vue3 项目实战，结合 TypeScript 和 Element Plus 构建完整的中后台管理系统。',
    tags: ['Vue3', 'TypeScript', 'Element Plus', '企业实战'],
    order: 7
  },
  {
    title: 'Vue3+Vite 工程化配置',
    category: 'advanced-practice',
    level: '中级',
    url: 'https://www.bilibili.com/video/BV1GN4y1M7P5',
    status: 'published',
    duration: '约 30 小时',
    content: '深入讲解 Vue3 工程化配置，包括 Vite 配置、ESLint、Prettier、Husky、自动部署等。',
    tags: ['Vue3', 'Vite', '工程化', 'ESLint'],
    order: 8
  },
  {
    title: 'Vue3 性能优化全攻略',
    category: 'advanced-practice',
    level: '高级',
    url: 'https://www.bilibili.com/video/BV18m4K1N7Wo',
    status: 'published',
    duration: '约 20 小时',
    content: '系统讲解 Vue3 性能优化策略，包括虚拟列表、懒加载、缓存、代码分割等实战技巧。',
    tags: ['Vue3', '性能优化', '虚拟列表', '懒加载'],
    order: 9
  },

  // ========== 项目开发 (projects) ==========
  {
    title: '硅谷甄选（Vue3+TS 后台管理系统）',
    category: 'projects',
    level: '高级',
    url: 'https://www.bilibili.com/video/BV1Xh411V7b5',
    status: 'published',
    duration: '约 200 小时',
    content: '尚硅谷出品，完整的 Vue3+TypeScript 后台管理系统项目，涵盖权限管理、动态路由等企业级功能。',
    tags: ['Vue3', 'TypeScript', '后台管理', '尚硅谷', '全栈'],
    order: 10
  },
  {
    title: '小兔鲜电商（Vue3 移动端项目）',
    category: 'projects',
    level: '高级',
    url: 'https://www.bilibili.com/video/BV16m4K1N7xZ',
    status: 'published',
    duration: '约 200 小时',
    content: '完整的移动端电商项目实战，使用 Vue3 + Vant 构建购物车、订单、支付等完整业务流程。',
    tags: ['Vue3', 'Vant', '移动端', '电商', 'H5'],
    order: 11
  },
  {
    title: 'SpringBoot+Vue3 全栈项目实战',
    category: 'projects',
    level: '高级',
    url: 'https://www.bilibili.com/video/BV14w4K1N7Jq',
    status: 'published',
    duration: '约 300 小时',
    content: '前后端分离全栈项目实战，使用 SpringBoot 作为后端，Vue3 作为前端，从零到部署完整流程。',
    tags: ['Vue3', 'SpringBoot', '全栈', 'Java', '前后端分离'],
    order: 12
  },
  {
    title: 'Vue3+Electron 桌面应用开发',
    category: 'projects',
    level: '高级',
    url: 'https://www.bilibili.com/video/BV1FP4115739',
    status: 'published',
    duration: '约 80 小时',
    content: '使用 Vue3 + Electron 开发跨平台桌面应用，掌握本地文件操作、系统通知、打包发布等技能。',
    tags: ['Vue3', 'Electron', '桌面应用', '跨平台'],
    order: 13
  },

  // ========== 面试专题 (interview) ==========
  {
    title: 'Vue3 高频面试题 100 道',
    category: 'interview',
    level: '高级',
    url: 'https://www.bilibili.com/video/BV1qM4K1T75N',
    status: 'published',
    duration: '约 50 小时',
    content: '系统整理 Vue3 高频面试题 100 道，配有详细解析和示例代码，助你轻松应对技术面试。',
    tags: ['Vue3', '面试题', '高频考点', '求职'],
    order: 14
  },
  {
    title: 'Vue3 源码深度解析（尤雨溪）',
    category: 'interview',
    level: '高级',
    url: 'https://www.bilibili.com/video/BV1RZ4y1d7xQ',
    status: 'published',
    duration: '约 40 小时',
    content: 'Vue 作者尤雨溪深度解析 Vue3 源码，从响应式系统到虚拟 DOM，深入理解框架设计理念。',
    tags: ['Vue3', '源码', '尤雨溪', '响应式', '虚拟DOM'],
    order: 15
  },
  {
    title: '前端手写代码 50 题',
    category: 'interview',
    level: '高级',
    url: 'https://www.bilibili.com/video/BV1FM4K1N7c1',
    status: 'published',
    duration: '约 30 小时',
    content: '大厂面试必考的 50 道手写代码题，包括防抖节流、深拷贝、Promise、事件总线等经典实现。',
    tags: ['手写代码', '面试题', '大厂', 'JavaScript'],
    order: 16
  },
  {
    title: 'Vue 性能优化 + 大厂面经',
    category: 'interview',
    level: '高级',
    url: 'https://www.bilibili.com/video/BV18m4K1N7Wo',
    status: 'published',
    duration: '约 20 小时',
    content: '结合真实大厂面试经验，深入讲解 Vue 性能优化策略和面试常见考点，帮你在求职中脱颖而出。',
    tags: ['性能优化', '大厂面经', '求职', 'Vue3'],
    order: 17
  },

  // ========== 生态工具 (ecosystem) ==========
  {
    title: 'Element Plus 组件库实战',
    category: 'ecosystem',
    level: '中级',
    url: 'https://www.bilibili.com/video/BV1zt411e7fp',
    status: 'published',
    duration: '约 40 小时',
    content: '深入学习 Element Plus 组件库的使用，包括主题定制、二次封装、表单验证等实战技巧。',
    tags: ['Element Plus', '组件库', 'Vue3', 'UI'],
    order: 18
  },
  {
    title: 'Pinia + VueRouter 全家桶',
    category: 'ecosystem',
    level: '中级',
    url: 'https://www.bilibili.com/video/BV1Za4y1r7KE',
    status: 'published',
    duration: '约 40 小时',
    content: '系统学习 Vue3 全家桶：Pinia 状态管理和 Vue Router 4 路由管理，掌握现代 Vue 开发范式。',
    tags: ['Pinia', 'Vue Router', '状态管理', '路由'],
    order: 19
  },
  {
    title: 'Nuxt3 SSR 服务端渲染',
    category: 'ecosystem',
    level: '高级',
    url: 'https://www.bilibili.com/video/BV1nG411r7jM',
    status: 'published',
    duration: '约 60 小时',
    content: '使用 Nuxt3 实现 Vue 应用的服务端渲染（SSR），掌握 SEO 优化、静态生成和混合渲染模式。',
    tags: ['Nuxt3', 'SSR', '服务端渲染', 'SEO'],
    order: 20
  },
  {
    title: 'UniApp Vue3 小程序开发',
    category: 'ecosystem',
    level: '中级',
    url: 'https://www.bilibili.com/video/BV1vY4y1E7VJ',
    status: 'published',
    duration: '约 100 小时',
    content: '使用 UniApp + Vue3 开发跨平台小程序，一套代码同时适配微信、支付宝、抖音等多端小程序。',
    tags: ['UniApp', 'Vue3', '小程序', '微信', '跨平台'],
    order: 21
  },
  {
    title: 'Vite 构建工具深度解析',
    category: 'ecosystem',
    level: '高级',
    url: 'https://www.bilibili.com/video/BV1GN4y1M7P5',
    status: 'published',
    duration: '约 30 小时',
    content: '深入理解 Vite 构建工具的设计原理，掌握插件开发、配置优化和生产环境部署最佳实践。',
    tags: ['Vite', '构建工具', '插件', '性能优化'],
    order: 22
  }
]

export async function seedCourses() {
  console.log('开始同步课程数据...')

  const seedCategories = ['fundamentals', 'core-syntax', 'advanced-practice', 'projects', 'interview', 'ecosystem']
  const existingCourses = await prisma.course.findMany({
    where: {
      category: { in: seedCategories }
    },
    select: {
      id: true,
      title: true,
      cover: true
    }
  })
  const existingCourseMap = new Map(existingCourses.map(course => [course.title, course]))

  let createdCount = 0
  let updatedCount = 0
  let preservedCoverCount = 0

  for (const course of courseSeeds) {
    const existingCourse = existingCourseMap.get(course.title)
    const nextCover = existingCourse?.cover || course.cover || null

    if (existingCourse) {
      if (existingCourse.cover && !course.cover) preservedCoverCount++

      await prisma.course.update({
        where: { id: existingCourse.id },
        data: {
          ...course,
          cover: nextCover
        }
      })
      updatedCount++
      console.log(`↻ ${course.title}`)
      continue
    }

    await prisma.course.create({
      data: {
        ...course,
        cover: nextCover
      }
    })
    createdCount++
    console.log(`✓ ${course.title}`)
  }

  console.log(`\n课程同步完成！新增 ${createdCount} 个，更新 ${updatedCount} 个，保留封面 ${preservedCoverCount} 个`)
  console.log('  基础入门 (fundamentals): 3 个')
  console.log('  核心语法 (core-syntax): 3 个')
  console.log('  进阶实战 (advanced-practice): 3 个')
  console.log('  项目开发 (projects): 4 个')
  console.log('  面试专题 (interview): 4 个')
  console.log('  生态工具 (ecosystem): 5 个')
}
