import { Router, Request, Response } from 'express'
import { PrismaClient } from '../../generated/prisma'
import authMiddleware, { AuthRequest } from '../middleware/authMiddleware'

const router = Router()
const prisma = new PrismaClient()

// 公开接口：获取已发布章节（含已发布子小节），过滤空章节
router.get('/', async (_req: Request, res: Response) => {
  try {
    const chapters = await prisma.chapter.findMany({
      where: { type: 'chapter', status: 'published' },
      orderBy: { order: 'asc' },
      include: {
        children: {
          where: { type: 'section', status: 'published' },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            order: true,
            excerpt: true,
            duration: true
          }
        }
      }
    })

    // 过滤掉没有任何已发布小节的章节
    const filtered = chapters
      .filter((c: typeof chapters[0]) => c.children && c.children.length > 0)
      .map((c: typeof chapters[0]) => ({
        id: c.id,
        title: c.title,
        order: c.order,
        slug: c.id,
        children: c.children.map((s: typeof c.children[0]) => ({
          id: s.id,
          title: s.title,
          order: s.order,
          slug: s.id,
          excerpt: s.excerpt || '',
          duration: s.duration || ''
        }))
      }))

    res.json({ success: true, data: filtered })
  } catch (error: any) {
    console.error('获取公开章节列表错误:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// 公开接口：获取单个小节内容
router.get('/:chapterId/sections/:sectionId', async (req: Request, res: Response) => {
  try {
    const { chapterId, sectionId } = req.params

    const section = await prisma.chapter.findFirst({
      where: {
        id: sectionId,
        type: 'section',
        status: 'published',
        parentId: chapterId
      }
    })

    if (!section) {
      return res.status(404).json({ success: false, message: '小节不存在或未发布' })
    }

    res.json({
      success: true,
      data: {
        id: section.id,
        title: section.title,
        content: section.content || '',
        excerpt: section.excerpt || '',
        duration: section.duration || '',
        order: section.order
      }
    })
  } catch (error: any) {
    console.error('获取小节内容错误:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// 公开接口：小节浏览量 +1
router.post('/:chapterId/sections/:sectionId/view', async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params
    await prisma.chapter.update({
      where: { id: sectionId },
      data: { viewCount: { increment: 1 } }
    })
    res.json({ success: true })
  } catch {
    res.status(404).json({ success: false, message: '小节不存在' })
  }
})

// 标记小节完成
router.post('/:chapterId/sections/:sectionId/complete', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { sectionId } = req.params
    const userId = req.user?.userId || req.user?.id

    if (!userId) {
      return res.status(401).json({ success: false, message: '未登录' })
    }

    // 检查小节是否存在
    const section = await prisma.chapter.findFirst({
      where: { id: sectionId, type: 'section' }
    })
    if (!section) {
      return res.status(404).json({ success: false, message: '小节不存在' })
    }

    // upsert：已完成则忽略，未完成则插入
    await prisma.sectionCompletion.upsert({
      where: { userId_sectionId: { userId, sectionId } },
      create: { userId, sectionId },
      update: {}
    })

    res.json({ success: true, message: '小节已标记完成' })
  } catch (error: any) {
    console.error('标记小节完成错误:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// 获取用户某章节下所有小节的完成情况
router.get('/:chapterId/progress', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { chapterId } = req.params
    const userId = req.user?.userId || req.user?.id

    if (!userId) {
      return res.status(401).json({ success: false, message: '未登录' })
    }

    // 获取该章节下所有已发布小节
    const sections = await prisma.chapter.findMany({
      where: { parentId: chapterId, type: 'section', status: 'published' },
      select: { id: true, title: true, order: true }
    })

    // 获取用户已完成的小节
    const completions = await prisma.sectionCompletion.findMany({
      where: {
        userId,
        sectionId: { in: sections.map(s => s.id) }
      },
      select: { sectionId: true, completedAt: true }
    })

    const completedMap = new Map(completions.map(c => [c.sectionId, c.completedAt]))

    const progress = sections.map(s => ({
      id: s.id,
      title: s.title,
      order: s.order,
      completed: completedMap.has(s.id),
      completedAt: completedMap.get(s.id) || null
    }))

    const totalSections = sections.length
    const completedCount = completions.length
    const chapterCompleted = totalSections > 0 && completedCount === totalSections

    res.json({
      success: true,
      data: {
        chapterId,
        totalSections,
        completedCount,
        chapterCompleted,
        sections: progress
      }
    })
  } catch (error: any) {
    console.error('获取章节进度错误:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

// 获取用户所有章节的完成概览
router.get('/progress/overview', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId || req.user?.id

    if (!userId) {
      return res.status(401).json({ success: false, message: '未登录' })
    }

    // 获取所有已发布章节及其小节
    const chapters = await prisma.chapter.findMany({
      where: { type: 'chapter', status: 'published' },
      orderBy: { order: 'asc' },
      include: {
        children: {
          where: { type: 'section', status: 'published' },
          select: { id: true }
        }
      }
    })

    // 获取用户所有完成记录
    const completions = await prisma.sectionCompletion.findMany({
      where: { userId },
      select: { sectionId: true }
    })
    const completedSet = new Set(completions.map(c => c.sectionId))

    const overview = chapters
      .filter(ch => ch.children.length > 0)
      .map(ch => {
        const totalSections = ch.children.length
        const completedCount = ch.children.filter(s => completedSet.has(s.id)).length
        return {
          chapterId: ch.id,
          title: ch.title,
          totalSections,
          completedCount,
          chapterCompleted: totalSections > 0 && completedCount === totalSections
        }
      })

    res.json({ success: true, data: overview })
  } catch (error: any) {
    console.error('获取进度概览错误:', error)
    res.status(500).json({ success: false, message: '服务器错误' })
  }
})

export default router
module.exports = router
