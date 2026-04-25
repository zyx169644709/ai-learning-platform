import { Request, Response } from 'express'
import { PrismaClient } from '../../generated/prisma'
import { AuthRequest } from '../middleware/authMiddleware'

const prisma = new PrismaClient()

const normalizeQuestionType = (value: unknown): 'single' | 'multiple' | 'judge' => {
  if (value === 'multiple' || value === 'judge' || value === 'single') return value
  return 'single'
}

const normalizeCorrectAnswer = (questionType: 'single' | 'multiple' | 'judge', value: unknown) => {
  if (questionType === 'multiple') {
    if (Array.isArray(value)) {
      return value
        .map((item) => Number(item))
        .filter((item) => Number.isInteger(item) && item >= 0)
        .sort((a, b) => a - b)
    }
    return []
  }

  const answer = Number(value)
  return Number.isInteger(answer) && answer >= 0 ? answer : 0
}

// ─── 公开接口 ───────────────────────────────────────────────

// 按分类获取题库（QuizSelectModal 使用）
export const getQuizzesByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.query

    const where: any = { status: 'published' }
    if (category && String(category).trim()) {
      where.category = String(category).trim()
    }

    const quizzes = await prisma.quiz.findMany({
      where,
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            content: true,
            options: true,
            questionType: true,
            correctAnswer: true,
            explanation: true,
            order: true
          } as any
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    res.json({ success: true, data: quizzes })
  } catch (error) {
    console.error('getQuizzesByCategory error:', error)
    res.status(500).json({ message: '获取题库失败' })
  }
}

// 获取所有分类的题目数量统计（QuizSelectModal 首页展示用）
export const getCategoryStats = async (_req: Request, res: Response) => {
  try {
    const stats = await prisma.quiz.groupBy({
      by: ['category'],
      where: { status: 'published' },
      _count: { id: true }
    })

    // 统计每个分类下的题目总数
    const result: Record<string, number> = {}
    for (const item of stats) {
      // 拿到该分类下所有 quiz 的题目数
      const count = await prisma.question.count({
        where: { quiz: { category: item.category, status: 'published' } }
      })
      result[item.category] = count
    }

    res.json({ success: true, data: result })
  } catch (error) {
    console.error('getCategoryStats error:', error)
    res.status(500).json({ message: '获取统计失败' })
  }
}

// 按章节小节获取对应测验（ChapterContent 使用）
export const getQuizByChapter = async (req: Request, res: Response) => {
  try {
    const { category, slug } = req.params

    const quiz = await prisma.quiz.findFirst({
      where: {
        category,
        courseId: { contains: slug.replace(/-quiz$/, '').replace(/-/g, '') },
        status: 'published'
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            content: true,
            options: true,
            questionType: true,
            correctAnswer: true,
            explanation: true,
            order: true
          } as any
        }
      }
    })

    if (!quiz) {
      return res.status(404).json({ message: '未找到对应测验' })
    }

    res.json({ success: true, data: quiz })
  } catch (error) {
    console.error('getQuizByChapter error:', error)
    res.status(500).json({ message: '获取测验失败' })
  }
}

// 精确按 category + slug 查找（替代 import.meta.glob 路径匹配）
export const getQuizBySlug = async (req: Request, res: Response) => {
  try {
    const { category, slug } = req.params

    // 先按 slug 精确查找（数据库化后主路径）
    let quiz: any = await prisma.quiz.findFirst({
      where: { category, slug, status: 'published' },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            content: true,
            options: true,
            questionType: true,
            correctAnswer: true,
            explanation: true,
            order: true
          } as any
        }
      }
    })

    // 兼容历史数据：部分记录可能还未写入 slug，回退到 courseId 近似匹配
    if (!quiz) {
      const quizzes = await prisma.quiz.findMany({
        where: { category, status: 'published' },
        include: {
          questions: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              content: true,
              options: true,
              questionType: true,
              correctAnswer: true,
              explanation: true,
              order: true
            } as any
          }
        }
      })

      const slugNorm = slug.toLowerCase().replace(/-/g, '')
      quiz = quizzes.find((q) => {
        const cId = (q.courseId || '').toLowerCase().replace(/-/g, '')
        return cId.includes(slugNorm) || slugNorm.includes(cId)
      }) ?? null
    }

    if (!quiz) {
      return res.status(404).json({ message: '未找到对应测验' })
    }

    res.json({ success: true, data: quiz })
  } catch (error) {
    console.error('getQuizBySlug error:', error)
    res.status(500).json({ message: '获取测验失败' })
  }
}

// 提交答题记录
export const submitQuizAttempt = async (req: AuthRequest, res: Response) => {
  try {
    const { quizId, score, passed, answers } = req.body
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: '请先登录' })
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        passed,
        answers
      }
    })

    res.json({ success: true, data: attempt })
  } catch (error) {
    console.error('submitQuizAttempt error:', error)
    res.status(500).json({ message: '提交失败' })
  }
}

// 获取当前用户的答题记录
export const getMyAttempts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: '请先登录' })

    const attempts = await prisma.quizAttempt.findMany({
      where: { userId },
      include: { quiz: { select: { title: true, category: true } } },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ success: true, data: attempts })
  } catch (error) {
    console.error('getMyAttempts error:', error)
    res.status(500).json({ message: '获取记录失败' })
  }
}

// ─── 管理员接口 ──────────────────────────────────────────────

// 获取所有题库列表（分页）
export const adminGetQuizzes = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, category, title, status } = req.query

    const where: any = {}
    if (category && String(category).trim()) where.category = String(category).trim()
    if (status && String(status).trim()) where.status = String(status).trim()
    if (title && String(title).trim()) {
      where.title = { contains: String(title).trim() }
    }

    const skip = (Number(page) - 1) * Number(limit)
    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where,
        skip,
        take: Number(limit),
        include: { _count: { select: { questions: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.quiz.count({ where })
    ])

    res.json({ success: true, data: quizzes, total, page: Number(page), limit: Number(limit) })
  } catch (error) {
    console.error('adminGetQuizzes error:', error)
    res.status(500).json({ message: '获取题库列表失败' })
  }
}

// 获取单个题库详情（含题目）
export const adminGetQuizDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: 'asc' } } }
    })
    if (!quiz) return res.status(404).json({ message: '题库不存在' })
    res.json({ success: true, data: quiz })
  } catch (error) {
    console.error('adminGetQuizDetail error:', error)
    res.status(500).json({ message: '获取详情失败' })
  }
}

// 创建题库
export const adminCreateQuiz = async (req: Request, res: Response) => {
  try {
    const { category, courseId, slug, title, passingScore, status, questions } = req.body

    const quiz = await prisma.quiz.create({
      data: {
        category,
        courseId,
        slug,
        title,
        passingScore: passingScore ?? 60,
        status: status ?? 'published',
        questions: {
          create: (questions ?? []).map((q: any, idx: number) => ({
            questionType: normalizeQuestionType(q.questionType),
            content: q.content,
            options: q.options,
            correctAnswer: normalizeCorrectAnswer(normalizeQuestionType(q.questionType), q.correctAnswer),
            explanation: q.explanation ?? '',
            order: idx
          }))
        }
      },
      include: { questions: true }
    })

    res.json({ success: true, data: quiz })
  } catch (error) {
    console.error('adminCreateQuiz error:', error)
    res.status(500).json({ message: '创建题库失败' })
  }
}

// 更新题库基本信息
export const adminUpdateQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { category, courseId, slug, title, passingScore, status } = req.body

    const quiz = await prisma.quiz.update({
      where: { id },
      data: { category, courseId, slug, title, passingScore, status }
    })

    res.json({ success: true, data: quiz })
  } catch (error) {
    console.error('adminUpdateQuiz error:', error)
    res.status(500).json({ message: '更新题库失败' })
  }
}

// 删除题库（级联删除题目）
export const adminDeleteQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.quiz.delete({ where: { id } })
    res.json({ success: true, message: '删除成功' })
  } catch (error) {
    console.error('adminDeleteQuiz error:', error)
    res.status(500).json({ message: '删除失败' })
  }
}

// 新增题目到题库
export const adminAddQuestion = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params
    const { content, options, correctAnswer, explanation, questionType } = req.body
    const normalizedType = normalizeQuestionType(questionType)
    const normalizedAnswer = normalizeCorrectAnswer(normalizedType, correctAnswer)

    const count = await prisma.question.count({ where: { quizId } })
    const question = await prisma.question.create({
      data: {
        quizId,
        questionType: normalizedType,
        content,
        options,
        correctAnswer: normalizedAnswer,
        explanation: explanation ?? '',
        order: count
      } as any
    })

    res.json({ success: true, data: question })
  } catch (error) {
    console.error('adminAddQuestion error:', error)
    res.status(500).json({ message: '添加题目失败' })
  }
}

// 更新题目
export const adminUpdateQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { content, options, correctAnswer, explanation, order, questionType } = req.body
    const normalizedType = normalizeQuestionType(questionType)
    const normalizedAnswer = normalizeCorrectAnswer(normalizedType, correctAnswer)

    const question = await prisma.question.update({
      where: { id },
      data: {
        questionType: normalizedType,
        content,
        options,
        correctAnswer: normalizedAnswer,
        explanation,
        order
      } as any
    })

    res.json({ success: true, data: question })
  } catch (error) {
    console.error('adminUpdateQuestion error:', error)
    res.status(500).json({ message: '更新题目失败' })
  }
}

// 删除题目
export const adminDeleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.question.delete({ where: { id } })
    res.json({ success: true, message: '删除成功' })
  } catch (error) {
    console.error('adminDeleteQuestion error:', error)
    res.status(500).json({ message: '删除失败' })
  }
}
