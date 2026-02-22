import { Router, Request, Response } from 'express'
import { PrismaClient } from '../../generated/prisma'

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

export default router
module.exports = router
