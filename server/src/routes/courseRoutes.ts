import { Router } from 'express'
import { listCourses, getCourse, createCourse, updateCourse, deleteCourse } from '../controllers/courseController'
import authMiddleware from '../middleware/authMiddleware'
import { courseService } from '../services/courseService'

const router = Router()

router.get('/', listCourses)
router.get('/:id', getCourse)
router.post('/', authMiddleware as any, createCourse)
router.put('/:id', authMiddleware as any, updateCourse)
router.delete('/:id', authMiddleware as any, deleteCourse)

module.exports = router

// 开发便捷：写入课程默认数据，便于快速演示与搜索收录
// 使用：POST /api/courses/seed-defaults （需登录）
router.post('/seed-defaults', authMiddleware as any, async (_req, res) => {
  const defaults = [
    {
      title: '人工智能基础',
      description: 'AI 的核心概念与知识地图，构建完整认知框架',
      url: '/courses/ai-basics',
      level: '入门',
      tags: ['AI', '基础']
    },
    {
      title: '机器学习算法',
      description: '监督/无监督/提升等算法原理与实践',
      url: '/courses/ml-algorithms',
      level: '进阶',
      tags: ['机器学习', '算法']
    },
    {
      title: '深度学习实践',
      description: '以项目驱动掌握 CNN/RNN/Transformer 等网络',
      url: '/courses/deep-learning',
      level: '高级',
      tags: ['深度学习', '神经网络', '项目']
    }
  ]

  const existed = new Set((await courseService.list()).map((c: any) => c.url))
  const created: any[] = []
  for (const c of defaults) {
    if (!existed.has(c.url)) {
      created.push(await courseService.create(c))
    }
  }
  res.json({ createdCount: created.length, created })
})

// 从前端 Courses.vue 的静态课程生成数据库内容（包含 6 个卡片）
// 使用：POST /api/courses/seed-from-frontend （需登录）
router.post('/seed-from-frontend', authMiddleware as any, async (_req, res) => {
  const items = [
    {
      title: 'AI 基础入门',
      description: '零基础友好，快速理解 AI 与机器学习核心概念。',
      level: 'beginner',
      cover: '/src/assets/images/course-beginner-cover.svg',
      url: 'https://www.bilibili.com/video/BV1xx411c7mu',
      tags: ['AI', '基础', '视频']
    },
    {
      title: 'Prompt 工程与工作流',
      description: '掌握高质量提示与多步工作流的设计与实现。',
      level: 'intermediate',
      cover: '/src/assets/images/course-intermediate-cover.svg',
      url: 'https://www.bilibili.com/video/BV1xx411c7mu',
      tags: ['Prompt', '工程', '视频']
    },
    {
      title: 'RAG 应用工程实践',
      description: '从检索到生成，构建企业级检索增强应用。',
      level: 'intermediate',
      cover: '/src/assets/images/course-intermediate-cover.svg',
      url: 'https://www.bilibili.com/video/BV1xx411c7mu',
      tags: ['RAG', '检索增强', '视频']
    },
    {
      title: '深度学习基础',
      description: '神经网络原理与实现，从感知机到卷积神经网络。',
      level: 'beginner',
      cover: '/src/assets/images/course-beginner-cover.svg',
      url: 'https://www.bilibili.com/video/BV1xx411c7mu',
      tags: ['深度学习', '神经网络', '视频']
    },
    {
      title: '计算机视觉实战',
      description: '图像识别、目标检测、语义分割等CV核心技术。',
      level: 'advanced',
      cover: '/src/assets/images/course-advanced-cover.svg',
      url: 'https://www.bilibili.com/video/BV1xx411c7mu',
      tags: ['CV', '视觉', '视频']
    },
    {
      title: '自然语言处理入门',
      description: '文本预处理、词向量、情感分析等NLP基础技术。',
      level: 'beginner',
      cover: '/src/assets/images/course-beginner-cover.svg',
      url: 'https://www.bilibili.com/video/BV1xx411c7mu',
      tags: ['NLP', '文本', '视频']
    }
  ]

  const existedUrls = new Set((await courseService.list()).map((c: any) => c.url))
  const created: any[] = []
  for (const item of items) {
    if (!existedUrls.has(item.url)) {
      created.push(await courseService.create(item))
    }
  }
  res.json({ createdCount: created.length, created })
})


