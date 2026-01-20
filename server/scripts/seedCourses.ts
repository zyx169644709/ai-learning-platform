#!/usr/bin/env ts-node

import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function seedCourses() {
  console.log('开始添加课程数据...')

  const courses = [
    {
      title: 'Vue 3 核心基础',
      description: '从零开始掌握 Vue 3，包括模板语法、指令、响应式系统等核心概念。',
      level: 'beginner',
      cover: '/assets/images/course-beginner-cover.svg',
      url: 'https://www.bilibili.com/video/BV1Zy4y1K7SH',
      tags: ['Vue3', '基础', '入门']
    },
    {
      title: 'Composition API 深度实践',
      description: '深入理解组合式 API，掌握 ref, reactive, computed 等高级用法与逻辑复用。',
      level: 'intermediate',
      cover: '/assets/images/course-intermediate-cover.svg',
      url: 'https://www.bilibili.com/video/BV1Zy4y1K7SH',
      tags: ['Vue3', 'Composition API', '进阶']
    },
    {
      title: 'Vue Router 4 路由实战',
      description: '掌握 Vue Router 4 的基础配置、嵌套路由、导航守卫等前端路由核心技术。',
      level: 'intermediate',
      cover: '/assets/images/course-intermediate-cover.svg',
      url: 'https://www.bilibili.com/video/BV1Zy4y1K7SH',
      tags: ['Vue Router', '路由', '视频']
    },
    {
      title: 'Pinia 状态管理指南',
      description: '现代化状态管理工具 Pinia 的深度应用，涵盖 Store 设计、状态持久化等。',
      level: 'beginner',
      cover: '/assets/images/course-beginner-cover.svg',
      url: 'https://www.bilibili.com/video/BV1Zy4y1K7SH',
      tags: ['Pinia', '状态管理', 'Vue3']
    },
    {
      title: 'Vite 工程化开发实践',
      description: '基于 Vite 构建高效的 Vue 3 开发环境，涵盖打包优化、插件开发等。',
      level: 'advanced',
      cover: '/assets/images/course-advanced-cover.svg',
      url: 'https://www.bilibili.com/video/BV1Zy4y1K7SH',
      tags: ['Vite', '工程化', '视频']
    },
    {
      title: 'Vue 3 + TypeScript 大型项目实战',
      description: '在 Vue 3 项目中深度应用 TypeScript，提升代码健壮性与开发效率。',
      level: 'advanced',
      cover: '/assets/images/course-advanced-cover.svg',
      url: 'https://www.bilibili.com/video/BV1Zy4y1K7SH',
      tags: ['TypeScript', '项目实战', 'Vue3']
    }
  ]

  for (const course of courses) {
    const existing = await prisma.course.findFirst({ where: { title: course.title } })
    if (!existing) {
      await prisma.course.create({ data: course })
      console.log(`已添加课程: ${course.title}`)
    } else {
      console.log(`课程已存在: ${course.title}`)
    }
  }

  console.log('课程数据添加完成!')
}

async function seedResources() {
  console.log('开始添加资源数据...')

  const resources = [
    {
      title: 'Vue 3 官方文档 (中文版)',
      description: '最权威的 Vue 3 学习资料，涵盖所有核心概念与 API 参考。',
      cover: '/assets/images/document-cover.svg',
      url: 'https://cn.vuejs.org/',
      tags: ['Vue3', '官方文档', '中文']
    },
    {
      title: 'Vue Router 官方指南',
      description: '学习如何使用 Vue Router 构建单页面应用。',
      cover: '/assets/images/code-cover.svg',
      url: 'https://router.vuejs.org/zh/',
      tags: ['Vue Router', '路由', '官方']
    },
    {
      title: 'Pinia 官方文档',
      description: '新一代 Vue 状态管理库的详细使用说明。',
      cover: '/assets/images/dataset-cover.svg',
      url: 'https://pinia.vuejs.org/zh/',
      tags: ['Pinia', '状态管理', '官方']
    },
    {
      title: 'Vue Use 函数库',
      description: '基于 Composition API 的实用工具函数集合。',
      cover: '/assets/images/tool-cover.svg',
      url: 'https://vueuse.org/',
      tags: ['VueUse', 'Composables', '工具']
    },
    {
      title: 'Element Plus 组件库',
      description: '一套为开发者、设计师和产品经理准备的基于 Vue 3 的桌面端组件库。',
      cover: '/assets/images/video-cover.svg',
      url: 'https://element-plus.org/zh-CN/',
      tags: ['Element Plus', 'UI组件库', 'Vue3']
    }
  ]

  for (const resource of resources) {
    const existing = await prisma.resource.findFirst({ where: { title: resource.title } })
    if (!existing) {
      await prisma.resource.create({ data: resource })
      console.log(`已添加资源: ${resource.title}`)
    } else {
      console.log(`资源已存在: ${resource.title}`)
    }
  }

  console.log('资源数据添加完成!')
}

async function main() {
  try {
    await seedCourses()
    await seedResources()
    console.log('所有数据添加完成!')
  } catch (error) {
    console.error('数据添加失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
