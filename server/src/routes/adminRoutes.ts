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
  getAnalytics,
  publishAllResources,
  batchDeleteUsers,
  exportUsers,
  batchDeleteCourses,
  batchPublishCourses,
  exportCourses
} from '../controllers/adminController'
import {
  getChapters,
  getChapter,
  createChapter,
  updateChapter,
  deleteChapter,
  batchDeleteChapters,
  batchPublishChapters
} from '../controllers/chapterController'
import {
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  batchDeleteResources,
  batchPublishResources
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
router.post('/users/batch-delete', authMiddleware, requireAdmin, batchDeleteUsers)
router.post('/users/export', authMiddleware, requireAdmin, exportUsers)

// 课程管理
router.get('/courses', authMiddleware, requireAdmin, getCourses)
router.post('/courses', authMiddleware, requireAdmin, createCourse)
router.post('/courses/publish-all', authMiddleware, requireAdmin, publishAllCourses)
router.put('/courses/:id', authMiddleware, requireAdmin, updateCourse)
router.post('/courses/:id/duplicate', authMiddleware, requireAdmin, duplicateCourse)
router.delete('/courses/:id', authMiddleware, requireAdmin, deleteCourse)
router.post('/courses/batch-delete', authMiddleware, requireAdmin, batchDeleteCourses)
router.post('/courses/batch-publish', authMiddleware, requireAdmin, batchPublishCourses)
router.post('/courses/export', authMiddleware, requireAdmin, exportCourses)

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
router.post('/chapters/batch-delete', authMiddleware, requireAdmin, batchDeleteChapters)
router.post('/chapters/batch-publish', authMiddleware, requireAdmin, batchPublishChapters)

// 资源管理
router.get('/resources', authMiddleware, requireAdmin, getResources)
router.get('/resources/:id', authMiddleware, requireAdmin, getResource)
router.post('/resources', authMiddleware, requireAdmin, createResource)
router.post('/resources/publish-all', authMiddleware, requireAdmin, publishAllResources)
router.put('/resources/:id', authMiddleware, requireAdmin, updateResource)
router.delete('/resources/:id', authMiddleware, requireAdmin, deleteResource)
router.post('/resources/batch-delete', authMiddleware, requireAdmin, batchDeleteResources)
router.post('/resources/batch-publish', authMiddleware, requireAdmin, batchPublishResources)

export default router
module.exports = router
