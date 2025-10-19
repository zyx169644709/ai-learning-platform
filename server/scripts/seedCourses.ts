#!/usr/bin/env ts-node

import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function seedCourses() {
  console.log('开始添加课程数据...')

  const courses = [
    {
      title: 'AI 基础入门',
      description: '零基础友好，快速理解 AI 与机器学习核心概念。',
      level: 'beginner',
      cover: '/assets/images/course-beginner-cover.svg',
      url: 'https://www.bilibili.com/video/BV1xx411c7mu',
      tags: ['AI', '基础', '视频']
    },
    {
      title: 'Prompt 工程与工作流',
      description: '掌握高质量提示与多步工作流的设计与实现。',
      level: 'intermediate',
      cover: '/assets/images/course-intermediate-cover.svg',
      url: 'https://www.bilibili.com/video/BV1xx411c7mu',
      tags: ['Prompt', '工程', '视频']
    },
    {
      title: 'RAG 应用工程实践',
      description: '从检索到生成，构建企业级检索增强应用。',
      level: 'intermediate',
      cover: '/assets/images/course-intermediate-cover.svg',
      url: 'https://www.bilibili.com/video/BV1xx411c7mu',
      tags: ['RAG', '检索增强', '视频']
    },
    {
      title: '深度学习基础',
      description: '神经网络原理与实现，从感知机到卷积神经网络。',
      level: 'beginner',
      cover: '/assets/images/course-beginner-cover.svg',
      url: 'https://www.bilibili.com/video/BV1xx411c7mu',
      tags: ['深度学习', '神经网络', '视频']
    },
    {
      title: '计算机视觉实战',
      description: '图像识别、目标检测、语义分割等CV核心技术。',
      level: 'advanced',
      cover: '/assets/images/course-advanced-cover.svg',
      url: 'https://www.bilibili.com/video/BV1xx411c7mu',
      tags: ['CV', '视觉', '视频']
    },
    {
      title: '自然语言处理入门',
      description: '文本预处理、词向量、情感分析等NLP基础技术。',
      level: 'beginner',
      cover: '/assets/images/course-beginner-cover.svg',
      url: 'https://www.bilibili.com/video/BV1xx411c7mu',
      tags: ['NLP', '文本', '视频']
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
      title: 'Python 机器学习完整教程',
      description: '从零开始的机器学习路线与代码示例。',
      cover: '/assets/images/document-cover.svg',
      url: 'https://scikit-learn.org/stable/',
      tags: ['机器学习', 'Python', '教程']
    },
    {
      title: '深度学习实战项目合集',
      description: '10 个完整项目覆盖图像与文本任务。',
      cover: '/assets/images/code-cover.svg',
      url: 'https://pytorch.org/tutorials/',
      tags: ['深度学习', 'PyTorch', '项目']
    },
    {
      title: 'NLP 数据集大全',
      description: '文本分类/情感分析/机器翻译常用数据集汇总。',
      cover: '/assets/images/dataset-cover.svg',
      url: 'https://huggingface.co/datasets',
      tags: ['NLP', '数据集', '文本分析']
    },
    {
      title: 'TensorFlow 官方教程',
      description: 'Google 官方深度学习框架完整教程。',
      cover: '/assets/images/video-cover.svg',
      url: 'https://www.tensorflow.org/tutorials',
      tags: ['TensorFlow', '深度学习', 'Google']
    },
    {
      title: 'Jupyter Notebook 工具集',
      description: '数据科学必备的交互式开发环境。',
      cover: '/assets/images/tool-cover.svg',
      url: 'https://jupyter.org/',
      tags: ['Jupyter', '数据科学', '开发工具']
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
