import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware'
import { requireStaff } from '../middleware/adminAuth'
import {
  getQuizzesByCategory,
  getCategoryStats,
  getQuizBySlug,
  submitQuizAttempt,
  getMyAttempts,
  adminGetQuizzes,
  adminGetQuizDetail,
  adminCreateQuiz,
  adminUpdateQuiz,
  adminDeleteQuiz,
  adminRenameQuizCategory,
  adminAddQuestion,
  adminImportQuestions,
  adminUpdateQuestion,
  adminDeleteQuestion
} from '../controllers/quizController'

const router = Router()

// ─── 管理员接口 ──────────────────────────────────────────────
router.get('/admin/list', authMiddleware as any, requireStaff as any, adminGetQuizzes)
router.put('/admin/categories/rename', authMiddleware as any, requireStaff as any, adminRenameQuizCategory)
router.get('/admin/:id', authMiddleware as any, requireStaff as any, adminGetQuizDetail)
router.post('/admin', authMiddleware as any, requireStaff as any, adminCreateQuiz)
router.put('/admin/:id', authMiddleware as any, requireStaff as any, adminUpdateQuiz)
router.delete('/admin/:id', authMiddleware as any, requireStaff as any, adminDeleteQuiz)
router.post('/admin/:quizId/questions', authMiddleware as any, requireStaff as any, adminAddQuestion)
router.post('/admin/:quizId/questions/import', authMiddleware as any, requireStaff as any, adminImportQuestions)
router.put('/admin/questions/:id', authMiddleware as any, requireStaff as any, adminUpdateQuestion)
router.delete('/admin/questions/:id', authMiddleware as any, requireStaff as any, adminDeleteQuestion)

// ─── 需登录接口 ──────────────────────────────────────────────
router.post('/attempt', authMiddleware as any, submitQuizAttempt as any)
router.get('/my-attempts', authMiddleware as any, getMyAttempts as any)

// ─── 公开接口 ────────────────────────────────────────────────
router.get('/category-stats', getCategoryStats)
router.get('/', getQuizzesByCategory)
router.get('/chapter/:category/:slug', getQuizBySlug)

export default router
