import { Request, Response } from 'express'
import { PrismaClient } from '../../generated/prisma'

const prisma = new PrismaClient()

// 添加/取消收藏（切换）
export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId
    if (!userId) return res.status(401).json({ success: false, message: '请先登录' })

    const { targetType, targetId } = req.body
    if (!targetType || !targetId) {
      return res.status(400).json({ success: false, message: '缺少 targetType 或 targetId' })
    }

    if (!['course', 'chapter', 'resource'].includes(targetType)) {
      return res.status(400).json({ success: false, message: 'targetType 必须为 course/chapter/resource' })
    }

    // 构建查询条件
    const whereField = `${targetType}Id` as 'courseId' | 'chapterId' | 'resourceId'
    const existing = await prisma.favorite.findFirst({
      where: {
        userId,
        targetType,
        [whereField]: targetId
      }
    })

    if (existing) {
      // 取消收藏
      await prisma.favorite.delete({ where: { id: existing.id } })
      // favoriteCount -1
      await (prisma as any)[targetType].update({
        where: { id: targetId },
        data: { favoriteCount: { decrement: 1 } }
      })
      return res.json({ success: true, favorited: false, message: '已取消收藏' })
    } else {
      // 添加收藏
      await prisma.favorite.create({
        data: {
          userId,
          targetType,
          [whereField]: targetId
        }
      })
      // favoriteCount +1
      await (prisma as any)[targetType].update({
        where: { id: targetId },
        data: { favoriteCount: { increment: 1 } }
      })
      return res.json({ success: true, favorited: true, message: '已收藏' })
    }
  } catch (error: any) {
    console.error('收藏操作错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 检查是否已收藏
export const checkFavorite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId
    if (!userId) return res.json({ success: true, favorited: false })

    const { targetType, targetId } = req.query
    if (!targetType || !targetId) {
      return res.status(400).json({ success: false, message: '缺少 targetType 或 targetId' })
    }

    const whereField = `${targetType}Id` as 'courseId' | 'chapterId' | 'resourceId'
    const existing = await prisma.favorite.findFirst({
      where: {
        userId,
        targetType: targetType as string,
        [whereField]: targetId as string
      }
    })

    res.json({ success: true, favorited: !!existing })
  } catch (error: any) {
    console.error('检查收藏错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 获取用户收藏列表
export const getFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId
    if (!userId) return res.status(401).json({ success: false, message: '请先登录' })

    const { targetType } = req.query

    const where: any = { userId }
    if (targetType) where.targetType = targetType as string

    const favorites = await prisma.favorite.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        course: {
          select: { id: true, title: true, cover: true, level: true, url: true, viewCount: true, studentCount: true, favoriteCount: true }
        },
        chapter: {
          select: { id: true, title: true, type: true, excerpt: true, viewCount: true, favoriteCount: true }
        },
        resource: {
          select: { id: true, title: true, description: true, cover: true, icon: true, url: true, type: true, viewCount: true, likeCount: true, favoriteCount: true }
        }
      }
    })

    const items = favorites.map(f => ({
      id: f.id,
      targetType: f.targetType,
      createdAt: f.createdAt,
      ...(f.targetType === 'course' && f.course ? { target: f.course } : {}),
      ...(f.targetType === 'chapter' && f.chapter ? { target: f.chapter } : {}),
      ...(f.targetType === 'resource' && f.resource ? { target: f.resource } : {})
    }))

    res.json({ success: true, data: { items } })
  } catch (error: any) {
    console.error('获取收藏列表错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

module.exports = { toggleFavorite, checkFavorite, getFavorites }
