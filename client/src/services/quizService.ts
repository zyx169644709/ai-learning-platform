import axios, { AxiosInstance } from 'axios'
import { API_BASE } from '@/config'

const API_BASE_URL = `${API_BASE}/api/quiz`

const api: AxiosInstance = axios.create({ baseURL: API_BASE_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface Question {
  id: string
  content: string
  options: string[]
  correctAnswer: number | number[]
  questionType?: 'single' | 'multiple' | 'judge'
  explanation: string
  order: number
}

export interface Quiz {
  id: string
  category: string
  courseId: string | null
  title: string
  passingScore: number
  status: string
  questions: Question[]
}

// 按分类获取所有题目（QuizSelectModal 使用）
export const getQuizzesByCategory = async (category: string): Promise<Quiz[]> => {
  const res = await api.get('/', { params: { category } })
  return res.data.data
}

// 获取每个分类下的题目总数统计
export const getCategoryStats = async (): Promise<Record<string, number>> => {
  const res = await api.get('/category-stats')
  return res.data.data
}

// 按 category + slug 精确获取测验（ChapterContent 使用）
export const getQuizBySlug = async (category: string, slug: string): Promise<Quiz | null> => {
  try {
    const res = await api.get(`/chapter/${category}/${slug}`)
    return res.data.data
  } catch {
    return null
  }
}

// 提交答题记录
export const submitAttempt = async (payload: {
  quizId: string
  score: number
  passed: boolean
  answers: Array<number | number[]>
}) => {
  const res = await api.post('/attempt', payload)
  return res.data.data
}
