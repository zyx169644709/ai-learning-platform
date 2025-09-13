import { Router } from 'express'
import { listResources, getResource, createResource, updateResource, deleteResource } from '../controllers/resourceController'
import authMiddleware from '../middleware/authMiddleware'
import { resourceService } from '../services/resourceService'

const router = Router()

router.get('/', listResources)
router.get('/:id', getResource)
router.post('/', authMiddleware as any, createResource)
router.put('/:id', authMiddleware as any, updateResource)
router.delete('/:id', authMiddleware as any, deleteResource)

module.exports = router

// 开发便捷：一键写入一些默认资源（课程/资源/社区链接均可作为资源被搜索）
// 使用方式：POST /api/resources/seed-defaults 需登录（携带 JWT）
router.post('/seed-defaults', authMiddleware as any, async (_req, res) => {
  const defaults = [
    {
      id: 'res-coursera-ml',
      title: 'Coursera 机器学习课程',
      description: 'Andrew Ng 经典机器学习课程，覆盖监督/无监督学习等',
      url: '/resources/coursera-ml',
      tags: ['机器学习', 'Coursera', 'Andrew Ng']
    },
    {
      id: 'res-math-foundation',
      title: '数学基础',
      description: 'AI 学习所需的数学知识：线性代数、概率统计、微积分等',
      url: '/resources/math-foundation',
      tags: ['数学', '线性代数', '概率统计', '微积分']
    },
    {
      id: 'res-python-ai-guide',
      title: 'Python AI 编程指南',
      description: 'Python 在 AI 方向的常用库与最佳实践速览',
      url: '/resources/python-ai-guide',
      tags: ['Python', 'AI', '编程', '指南']
    },
    // 课程入口也可以作为可搜索资源
    {
      id: 'res-course-ai-basics',
      title: '课程入口：人工智能基础',
      description: 'AI 的核心概念与模块化知识地图，构建完整认知框架',
      url: '/courses/ai-basics',
      tags: ['课程', 'AI', '基础']
    },
    {
      id: 'res-course-ml-algorithms',
      title: '课程入口：机器学习算法',
      description: '监督/无监督/提升等算法原理与实践',
      url: '/courses/ml-algorithms',
      tags: ['课程', '机器学习', '算法']
    },
    // 社区精选帖子也作为资源被检索，跳转到讨论详情
    {
      id: 'res-community-tech',
      title: '社区精选：AI 技术讨论',
      description: '与 AI 爱好者和专家交流技术问题与实战经验',
      url: '/community',
      tags: ['社区', '讨论', '技术']
    }
  ]

  const list = await resourceService.list()
  const existed = new Set(list.map((i: any) => i.id))
  const created: any[] = []
  for (const item of defaults) {
    if (!existed.has(item.id)) {
      const saved = await resourceService.create(item)
      created.push(saved)
    }
  }
  return res.json({ createdCount: created.length, created })
})


