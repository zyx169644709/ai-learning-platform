import { PrismaClient } from '../../generated/prisma'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface QuestionData {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuizFileData {
  courseId: string
  courseName: string
  passingScore: number
  questionCount?: number
  questions: QuestionData[]
}

// JSON 文件相对于 server 目录的路径
const QUESTIONS_DIR = path.resolve(
  __dirname,
  '../../../client/src/data/questions'
)

export const seedQuizzes = async () => {
  console.log('📝 开始导入题库数据...')

  if (!fs.existsSync(QUESTIONS_DIR)) {
    console.warn('⚠️  题库目录不存在，跳过:', QUESTIONS_DIR)
    return
  }

  // 清空现有题库数据（保持幂等）
  await prisma.question.deleteMany()
  await prisma.quiz.deleteMany()
  console.log('  ✓ 已清空旧题库数据')

  const categories = fs
    .readdirSync(QUESTIONS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

  let totalQuizzes = 0
  let totalQuestions = 0

  for (const category of categories) {
    const categoryDir = path.join(QUESTIONS_DIR, category)
    const jsonFiles = fs
      .readdirSync(categoryDir)
      .filter((f) => f.endsWith('.json'))

    for (const file of jsonFiles) {
      const filePath = path.join(categoryDir, file)
      const raw = fs.readFileSync(filePath, 'utf-8')
      const data: QuizFileData = JSON.parse(raw)

      // 从文件名生成 slug（去掉 .json）
      const slug = path.basename(file, '.json')

      const quiz = await prisma.quiz.create({
        data: {
          category,
          courseId: data.courseId,
          title: data.courseName,
          passingScore: data.passingScore ?? 60,
          status: 'published',
          slug,
          questions: {
            create: data.questions.map((q, idx) => ({
              content: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation ?? '',
              order: idx
            }))
          }
        }
      })

      console.log(
        `  ✓ [${category}/${slug}] "${quiz.title}" - ${data.questions.length} 题`
      )
      totalQuizzes++
      totalQuestions += data.questions.length
    }
  }

  console.log(
    `\n📊 题库导入完成：${totalQuizzes} 套测验，共 ${totalQuestions} 道题目`
  )
}
