import { Router } from 'express'
import { PrismaClient } from '../../generated/prisma'
import authMiddleware from '../middleware/authMiddleware'

const router = Router()
const prisma = new PrismaClient()

// 标记课程完成
router.post('/complete', authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = (req as any).user.userId

    if (!courseId) {
      return res.status(400).json({ 
        success: false, 
        message: '课程ID不能为空' 
      })
    }

    // 先尝试查找是否已存在
    const existing = await prisma.courseCompletion.findFirst({
      where: {
        userId,
        courseId
      }
    })

    let completion
    if (existing) {
      // 如果存在，更新完成时间
      completion = await prisma.courseCompletion.update({
        where: { id: existing.id },
        data: {
          completedAt: new Date()
        }
      })
    } else {
      // 如果不存在，创建新记录
      completion = await prisma.courseCompletion.create({
        data: {
          userId,
          courseId
        }
      })
    }

    res.json({ 
      success: true, 
      message: '课程完成记录已保存',
      data: completion 
    })
  } catch (error: any) {
    console.error('记录课程完成失败:', error)
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      userId: (req as any).user?.id,
      courseId: req.body.courseId
    })
    res.status(500).json({ 
      success: false, 
      message: '记录失败，请稍后重试',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// 获取用户学习统计（管理员用）
router.get('/users/:userId/stats', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params
    const currentUser = (req as any).user

    // 只允许管理员或用户本人查看
    if (currentUser.role !== 'ADMIN' && currentUser.userId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: '无权查看此用户的学习统计' 
      })
    }

    // 获取课程完成记录
    const completedCourses = await prisma.courseCompletion.findMany({
      where: { userId },
      select: {
        courseId: true,
        completedAt: true
      },
      orderBy: {
        completedAt: 'desc'
      }
    })

    // 定义课程列表
    const allCourses = [
      { id: 'html-basics', name: 'HTML 核心基础' },
      { id: 'css-basics', name: 'CSS 核心基础' },
      { id: 'js-basics', name: 'JavaScript 核心基础' },
      { id: 'project-basics', name: '综合实战项目' }
    ]

    // 构建课程统计对象
    const courseStats: Record<string, any> = {}
    allCourses.forEach(course => {
      const completion = completedCourses.find((c: any) => c.courseId === course.id)
      courseStats[course.id] = completion ? {
        completed: true,
        completedAt: completion.completedAt,
        courseName: course.name
      } : {
        completed: false,
        completedAt: null,
        courseName: course.name
      }
    })

    const totalCourses = allCourses.length
    const completedCount = completedCourses.length
    const completionRate = totalCourses > 0 
      ? ((completedCount / totalCourses) * 100).toFixed(1) 
      : '0.0'

    res.json({
      success: true,
      data: {
        completedCount,
        totalCourses,
        completionRate: parseFloat(completionRate),
        courseStats,
        completedCourses: completedCourses.map((c: any) => ({
          courseId: c.courseId,
          courseName: allCourses.find(ac => ac.id === c.courseId)?.name || c.courseId,
          completedAt: c.completedAt
        }))
      }
    })
  } catch (error) {
    console.error('获取学习统计失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '获取统计失败，请稍后重试' 
    })
  }
})

// 获取当前用户的学习统计
router.get('/my-stats', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId

    const completedCourses = await prisma.courseCompletion.findMany({
      where: { userId },
      select: {
        courseId: true,
        completedAt: true
      }
    })

    res.json({
      success: true,
      data: {
        completedCount: completedCourses.length,
        completedCourses
      }
    })
  } catch (error) {
    console.error('获取学习统计失败:', error)
    res.status(500).json({ 
      success: false, 
      message: '获取统计失败' 
    })
  }
})

export default router
