#!/usr/bin/env ts-node

import bcrypt from 'bcryptjs'
import { prisma } from '../config/database'

type CreatedUsers = Record<string, { id: string; username: string }>

async function upsertUser(username: string, email: string, passwordPlain = '123456', bio?: string) {
  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) return existing

  const hashed = await bcrypt.hash(passwordPlain, 10)
  return prisma.user.create({
    data: {
      username,
      email,
      password: hashed,
      bio,
      role: 'USER'
    }
  })
}

async function ensureUserPreferences(userId: string) {
  const pref = await prisma.userPreferences.findUnique({ where: { userId } })
  if (pref) return pref
  return prisma.userPreferences.create({
    data: { userId, theme: 'dark', codePanelRatio: 50, language: 'javascript', notifications: true }
  })
}

async function main() {
  console.log('Seeding: users...')
  const users: CreatedUsers = {}

  const u1 = await upsertUser('AI学习者', 'ai-learner@example.com', '123456', '热爱AI技术的学习者，专注于机器学习和深度学习')
  const u2 = await upsertUser('Vue开发者', 'vue-dev@example.com', '123456', '前端开发工程师，Vue.js专家')
  const u3 = await upsertUser('技术分享者', 'tech-sharer@example.com', '123456', '技术博客作者，喜欢分享编程经验')
  const u4 = await upsertUser('新手程序员', 'newbie@example.com', '123456', '刚入门的程序员，正在努力学习中')
  const u5 = await upsertUser('testuser', 'test@example.com', '123456', '这是一个测试用户')

  ;[u1, u2, u3, u4, u5].forEach((u) => (users[u.username] = { id: u.id, username: u.username }))

  console.log('Seeding: user preferences...')
  await Promise.all(Object.values(users).map((u) => ensureUserPreferences(u.id)))

  console.log('Seeding: discussions...')
  const discussionsData = [
    {
      title: 'Vue 3 Composition API 最佳实践分享',
      content: `大家好！今天想和大家分享一些Vue 3 Composition API的最佳实践。\n\n## 1. 使用 ref 和 reactive 的选择\n...`,
      excerpt: '分享Vue 3 Composition API最佳实践：ref/reactive、组合式函数封装、生命周期...',
      category: 'TECH' as const,
      authorId: users['Vue开发者'].id
    },
    {
      title: '机器学习入门：从零开始学习神经网络',
      content: `最近在学习机器学习，想和大家分享一下神经网络的基础知识。\n\n## 什么是神经网络？\n...`,
      excerpt: '神经网络入门、感知机实现与学习资源推荐...',
      category: 'EXPERIENCE' as const,
      authorId: users['AI学习者'].id
    },
    {
      title: '我的第一个Vue项目：在线学习平台',
      content: `经过几个月的学习，终于完成了我的第一个Vue项目！这是一个在线学习平台...`,
      excerpt: '项目功能/技术栈/亮点与挑战，总结实战经验...',
      category: 'PROJECT' as const,
      authorId: users['技术分享者'].id
    },
    {
      title: '求助：Vue组件通信的最佳方式？',
      content: `父子/跨层/全局状态/事件总线等通信方式该如何选择？`,
      excerpt: '新手提问：多组件共享用户数据，如何选择通信方式？',
      category: 'HELP' as const,
      authorId: users['新手程序员'].id
    },
    {
      title: 'TypeScript在Vue项目中的使用技巧',
      content: `TypeScript为Vue项目带来了类型安全，这里分享一些实用技巧...`,
      excerpt: 'Props 类型、组合式 API 类型、路由与 API 响应类型等技巧...',
      category: 'TECH' as const,
      authorId: users['Vue开发者'].id
    }
  ]

  // 按标题去重创建
  const createdDiscussions: Record<string, string> = {}
  for (const d of discussionsData) {
    const existing = await prisma.discussion.findFirst({ where: { title: d.title } })
    const created =
      existing ||
      (await prisma.discussion.create({
        data: {
          title: d.title,
          content: d.content,
          excerpt: d.excerpt,
          category: d.category,
          authorId: d.authorId,
          views: 0,
          likes: 0
        }
      }))
    createdDiscussions[d.title] = created.id
  }

  console.log('Seeding: comments...')
  const commentsData = [
    {
      content: '感谢分享！这些实践很有用，特别是组合式函数的封装部分。',
      authorId: users['AI学习者'].id,
      discussionTitle: 'Vue 3 Composition API 最佳实践分享'
    },
    {
      content: '神经网络的基础知识讲得很清楚，代码示例也很实用！',
      authorId: users['Vue开发者'].id,
      discussionTitle: '机器学习入门：从零开始学习神经网络'
    },
    {
      content: '对于你的场景，我建议使用 Pinia 进行状态管理。',
      authorId: users['技术分享者'].id,
      discussionTitle: '求助：Vue组件通信的最佳方式？'
    }
  ]

  for (const c of commentsData) {
    const discussionId = createdDiscussions[c.discussionTitle]
    if (!discussionId) continue
    // 去重：同一讨论下相同内容不重复写入
    const exists = await prisma.comment.findFirst({ where: { discussionId, content: c.content } })
    if (!exists) {
      await prisma.comment.create({ data: { content: c.content, authorId: c.authorId, discussionId } })
    }
  }

  console.log('Seed finished successfully.')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
