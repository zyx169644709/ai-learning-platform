import { Request, Response } from 'express'
import { PrismaClient } from '../../generated/prisma'
import { AuthRequest } from '../middleware/authMiddleware'

const prisma = new PrismaClient()

type QuestionType = 'single' | 'multiple' | 'judge'

interface PreparedQuestionData {
  questionType: QuestionType
  content: string
  options: string[]
  correctAnswer: number | number[]
  explanation: string
  order: number
}

interface AiGeneratedQuestion {
  questionType: 'multiple' | 'judge'
  content: string
  options: string[]
  correctAnswer: number[] | number
  explanation: string
}

const normalizeQuestionType = (value: unknown): QuestionType => {
  if (value === 'multiple' || value === 'judge' || value === 'single') return value
  return 'single'
}

const normalizeCorrectAnswer = (questionType: QuestionType, value: unknown) => {
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

const normalizeQuestionOptions = (questionType: QuestionType, value: unknown) => {
  if (questionType === 'judge') {
    return ['正确', '错误']
  }

  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => String(item ?? '').trim())
    .filter(Boolean)
}

const prepareQuestionData = (payload: any, defaultOrder: number, label = '题目'):
  | { data: PreparedQuestionData; message?: never }
  | { data?: never; message: string } => {
  const questionType = normalizeQuestionType(payload?.questionType)
  const content = String(payload?.content ?? '').trim()

  if (!content) {
    return { message: `${label}题干不能为空` }
  }

  const options = normalizeQuestionOptions(questionType, payload?.options)
  if (options.length < 2) {
    return { message: `${label}至少需要两个选项` }
  }

  const correctAnswer = normalizeCorrectAnswer(questionType, payload?.correctAnswer)

  if (questionType === 'multiple') {
    if (!Array.isArray(correctAnswer) || !correctAnswer.length) {
      return { message: `${label}多选题至少需要一个正确答案` }
    }

    const hasInvalidAnswer = correctAnswer.some((item) => item < 0 || item >= options.length)
    if (hasInvalidAnswer) {
      return { message: `${label}存在超出选项范围的正确答案序号` }
    }
  } else if (typeof correctAnswer !== 'number' || correctAnswer < 0 || correctAnswer >= options.length) {
    return { message: `${label}正确答案序号超出选项范围` }
  }

  const rawOrder = Number(payload?.order)
  const order = Number.isInteger(rawOrder) && rawOrder >= 0 ? rawOrder : defaultOrder

  return {
    data: {
      questionType,
      content,
      options,
      correctAnswer,
      explanation: String(payload?.explanation ?? '').trim(),
      order
    }
  }
}

const DEEPSEEK_API_BASE = (process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com/v1').trim()
const DEEPSEEK_API_KEY = (process.env.DEEPSEEK_API_KEY || '').trim()

const generateQuestionsWithDeepSeek = async (
  sectionTitle: string,
  sectionContent: string,
  count = 5
): Promise<AiGeneratedQuestion[]> => {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('AI 功能未启用，请在服务端配置 DEEPSEEK_API_KEY')
  }

  const systemPrompt = `你是一名专业出题助手。请严格根据输入的小节内容，生成高质量测验题。要求：1) 仅生成“多选题(multiple)”和“判断题(judge)”，两种题型都要覆盖。2) 输出必须是 JSON 数组，不要包含 markdown 代码块或其他说明文字。3) 每题字段：questionType, content, options, correctAnswer, explanation。4) multiple 题：options 至少 4 个，correctAnswer 必须是 number[] 且至少 1 个索引。5) judge 题：options 固定为 ["正确","错误"]，correctAnswer 必须是 0 或 1。6) 题目必须可由内容直接推导，不要编造不存在的信息。`

  const userPrompt = `请为以下小节生成 ${count} 道题（建议 3 道多选 + 2 道判断）：\n\n小节标题：${sectionTitle}\n\n小节内容：\n${sectionContent}`

  const response = await fetch(`${DEEPSEEK_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.4,
      max_tokens: 2200,
      stream: false
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'AI 服务请求失败')
  }

  const responseData = await response.json()
  const content = String(responseData?.choices?.[0]?.message?.content || '').trim()
  if (!content) {
    throw new Error('AI 返回为空')
  }

  const cleaned = content
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim()

  let parsed: any
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error('AI 返回格式无法解析为 JSON')
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('AI 未返回有效题目数组')
  }

  const normalized = parsed
    .map((item: any): AiGeneratedQuestion | null => {
      const questionType: 'multiple' | 'judge' = item?.questionType === 'judge' ? 'judge' : 'multiple'
      const contentText = String(item?.content || '').trim()
      const explanation = String(item?.explanation || '').trim()

      if (!contentText) return null

      if (questionType === 'judge') {
        const answer = Number(item?.correctAnswer)
        return {
          questionType,
          content: contentText,
          options: ['正确', '错误'],
          correctAnswer: answer === 1 ? 1 : 0,
          explanation
        }
      }

      const options = Array.isArray(item?.options)
        ? item.options
            .map((opt: any) => String(opt || '').trim())
            .filter((opt: string) => Boolean(opt))
        : []

      const answerArray = Array.isArray(item?.correctAnswer)
        ? item.correctAnswer
            .map((n: any) => Number(n))
            .filter((n: number) => Number.isInteger(n) && n >= 0)
        : []

      if (options.length < 2 || answerArray.length === 0) return null

      return {
        questionType,
        content: contentText,
        options,
        correctAnswer: Array.from(new Set(answerArray)),
        explanation
      }
    })
    .filter((item): item is AiGeneratedQuestion => item !== null)

  if (!normalized.length) {
    throw new Error('AI 结果无法转换为有效题目')
  }

  return normalized
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
    const { page = 1, limit = 20, category, title, status, chapterId } = req.query

    const where: any = {}
    if (category && String(category).trim()) where.category = String(category).trim()
    if (status && String(status).trim()) where.status = String(status).trim()
    if (chapterId && String(chapterId).trim()) where.chapterId = String(chapterId).trim()
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
    const { category, courseId, chapterId, slug, title, passingScore, status, questions } = req.body

    const quiz = await prisma.quiz.create({
      data: {
        category,
        courseId,
        chapterId,
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
    const { category, courseId, chapterId, slug, title, passingScore, status } = req.body

    const quiz = await prisma.quiz.update({
      where: { id },
      data: { category, courseId, chapterId, slug, title, passingScore, status }
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

export const adminRenameQuizCategory = async (req: Request, res: Response) => {
  try {
    const oldCategory = String(req.body?.oldCategory ?? '').trim()
    const newCategory = String(req.body?.newCategory ?? '').trim()

    if (!oldCategory || !newCategory) {
      return res.status(400).json({ message: '原分类和新分类不能为空' })
    }

    if (oldCategory === newCategory) {
      return res.json({ success: true, data: { count: 0 } })
    }

    const result = await prisma.quiz.updateMany({
      where: { category: oldCategory },
      data: { category: newCategory }
    })

    if (!result.count) {
      return res.status(404).json({ message: '未找到对应分类的题库' })
    }

    res.json({ success: true, data: { count: result.count } })
  } catch (error) {
    console.error('adminRenameQuizCategory error:', error)
    res.status(500).json({ message: '更新分类失败' })
  }
}

// 新增题目到题库
export const adminAddQuestion = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params

    const count = await prisma.question.count({ where: { quizId } })
    const prepared = prepareQuestionData(req.body, count)
    if (prepared.message) {
      return res.status(400).json({ message: prepared.message })
    }

    const question = await prisma.question.create({
      data: {
        quizId,
        ...prepared.data
      } as any
    })

    res.json({ success: true, data: question })
  } catch (error) {
    console.error('adminAddQuestion error:', error)
    res.status(500).json({ message: '添加题目失败' })
  }
}

export const adminImportQuestions = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params
    const rawQuestions = Array.isArray(req.body)
      ? req.body
      : Array.isArray(req.body?.questions)
        ? req.body.questions
        : null

    if (!rawQuestions?.length) {
      return res.status(400).json({ message: '导入数据不能为空，且必须包含 questions 数组' })
    }

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, select: { id: true } })
    if (!quiz) {
      return res.status(404).json({ message: '题库不存在' })
    }

    const count = await prisma.question.count({ where: { quizId } })
    const preparedQuestions: PreparedQuestionData[] = []

    for (let index = 0; index < rawQuestions.length; index += 1) {
      const prepared = prepareQuestionData(rawQuestions[index], count + index, `第${index + 1}题`)
      if (prepared.message) {
        return res.status(400).json({ message: prepared.message })
      }
      if (!prepared.data) {
        return res.status(400).json({ message: `第${index + 1}题数据无效` })
      }
      preparedQuestions.push(prepared.data)
    }

    const createdQuestions = await prisma.$transaction(
      preparedQuestions.map((item) => prisma.question.create({
        data: {
          quizId,
          ...item
        } as any
      }))
    )

    res.json({
      success: true,
      data: {
        count: createdQuestions.length,
        questions: createdQuestions
      }
    })
  } catch (error) {
    console.error('adminImportQuestions error:', error)
    res.status(500).json({ message: '导入题目失败' })
  }
}

// 更新题目
export const adminGenerateQuestions = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params
    const requestedCount = Number(req.body?.count)
    const count = Number.isInteger(requestedCount) && requestedCount > 0 ? requestedCount : 5

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: {
        id: true,
        title: true,
        chapterId: true
      }
    })

    if (!quiz) {
      return res.status(404).json({ message: '题库不存在' })
    }

    let chapterTitle = quiz.title || '题库'
    let chapterContent = `这是关于“${chapterTitle}”的题库，请生成相关的练习题目。`
    let basedOnChapter = false

    if (quiz.chapterId) {
      const chapter = await prisma.chapter.findUnique({
        where: { id: quiz.chapterId },
        select: {
          title: true,
          content: true
        }
      })

      if (chapter?.content?.trim()) {
        chapterTitle = chapter.title?.trim() || chapterTitle
        chapterContent = chapter.content.trim()
        basedOnChapter = true
      }
    }

    const questions = await generateQuestionsWithDeepSeek(chapterTitle, chapterContent, count)

    res.json({
      success: true,
      data: {
        questions,
        basedOnChapter
      }
    })
  } catch (error: any) {
    console.error('adminGenerateQuestions error:', error)
    res.status(500).json({ message: error?.message || '生成题目失败' })
  }
}

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
