import { Router } from 'express'
import { 
  login, 
  getAdminInfo, 
  getUsers, 
  updateUser, 
  deleteUser,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  duplicateCourse,
  publishAllCourses,
  getStats,
  getAnalytics
} from '../controllers/adminController'
import {
  getChapters,
  getChapter,
  createChapter,
  updateChapter,
  deleteChapter
} from '../controllers/chapterController'
import {
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource
} from '../controllers/resourceController'
import authMiddleware from '../middleware/authMiddleware'
import { requireAdmin } from '../middleware/adminAuth'

const router = Router()

// 管理员登录
router.post('/auth/login', login)

// 获取管理员信息（需要认证）
router.get('/auth/info', authMiddleware, requireAdmin, getAdminInfo)

// 用户管理
router.get('/users', authMiddleware, requireAdmin, getUsers)
router.put('/users/:id', authMiddleware, requireAdmin, updateUser)
router.delete('/users/:id', authMiddleware, requireAdmin, deleteUser)

// 课程管理
router.get('/courses', authMiddleware, requireAdmin, getCourses)
router.post('/courses', authMiddleware, requireAdmin, createCourse)
router.post('/courses/publish-all', authMiddleware, requireAdmin, publishAllCourses)
router.put('/courses/:id', authMiddleware, requireAdmin, updateCourse)
router.post('/courses/:id/duplicate', authMiddleware, requireAdmin, duplicateCourse)
router.delete('/courses/:id', authMiddleware, requireAdmin, deleteCourse)

// 统计数据
router.get('/stats', authMiddleware, requireAdmin, getStats)

// 数据分析
router.get('/analytics', authMiddleware, requireAdmin, getAnalytics)

// 章节管理
router.get('/chapters', authMiddleware, requireAdmin, getChapters)
router.get('/chapters/:id', authMiddleware, requireAdmin, getChapter)
router.post('/chapters', authMiddleware, requireAdmin, createChapter)
router.put('/chapters/:id', authMiddleware, requireAdmin, updateChapter)
router.delete('/chapters/:id', authMiddleware, requireAdmin, deleteChapter)

// 资源管理
router.get('/resources', authMiddleware, requireAdmin, getResources)
router.get('/resources/:id', authMiddleware, requireAdmin, getResource)
router.post('/resources', authMiddleware, requireAdmin, createResource)
router.put('/resources/:id', authMiddleware, requireAdmin, updateResource)
router.delete('/resources/:id', authMiddleware, requireAdmin, deleteResource)

export default router
module.exports = router
