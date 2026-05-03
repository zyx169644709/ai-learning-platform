import { Router } from 'express'
import { 
  login, 
  getAdminInfo, 
  getUsers, 
  updateUser,
  resetUserPassword,
  disableUser,
  enableUser,
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
import {
  adminGetDiscussions,
  adminGetComments,
  toggleDiscussionStatus,
  toggleDiscussionPin,
  adminDeleteDiscussion,
  batchDeleteDiscussions,
  toggleCommentStatus,
  adminDeleteComment,
  batchDeleteComments,
  adminCreateDiscussion,
  adminUpdateDiscussion,
  adminCreateComment,
  approveDiscussion,
  rejectDiscussion,
  approveComment,
  rejectComment
} from '../controllers/communityController'
import authMiddleware from '../middleware/authMiddleware'
import { requireAdmin, requireStaff } from '../middleware/adminAuth'

const router = Router()

// 管理员登录
router.post('/auth/login', login)

// 获取管理员信息（需要认证）
router.get('/auth/info', authMiddleware, requireStaff, getAdminInfo)

// 用户管理
router.get('/users', authMiddleware, requireAdmin, getUsers)
router.put('/users/:id', authMiddleware, requireAdmin, updateUser)
router.post('/users/:id/reset-password', authMiddleware, requireAdmin, resetUserPassword)
router.post('/users/:id/disable', authMiddleware, requireAdmin, disableUser)
router.post('/users/:id/enable', authMiddleware, requireAdmin, enableUser)
router.delete('/users/:id', authMiddleware, requireAdmin, deleteUser)
router.post('/users/batch-delete', authMiddleware, requireAdmin, batchDeleteUsers)
router.post('/users/export', authMiddleware, requireAdmin, exportUsers)

// 课程管理
router.get('/courses', authMiddleware, requireStaff, getCourses)
router.post('/courses', authMiddleware, requireStaff, createCourse)
router.post('/courses/publish-all', authMiddleware, requireStaff, publishAllCourses)
router.put('/courses/:id', authMiddleware, requireStaff, updateCourse)
router.post('/courses/:id/duplicate', authMiddleware, requireStaff, duplicateCourse)
router.delete('/courses/:id', authMiddleware, requireStaff, deleteCourse)
router.post('/courses/batch-delete', authMiddleware, requireStaff, batchDeleteCourses)
router.post('/courses/batch-publish', authMiddleware, requireStaff, batchPublishCourses)
router.post('/courses/export', authMiddleware, requireStaff, exportCourses)

// 统计数据
router.get('/stats', authMiddleware, requireStaff, getStats)

// 数据分析
router.get('/analytics', authMiddleware, requireStaff, getAnalytics)

// 章节管理
router.get('/chapters', authMiddleware, requireStaff, getChapters)
router.get('/chapters/:id', authMiddleware, requireStaff, getChapter)
router.post('/chapters', authMiddleware, requireStaff, createChapter)
router.put('/chapters/:id', authMiddleware, requireStaff, updateChapter)
router.delete('/chapters/:id', authMiddleware, requireStaff, deleteChapter)
router.post('/chapters/batch-delete', authMiddleware, requireStaff, batchDeleteChapters)
router.post('/chapters/batch-publish', authMiddleware, requireStaff, batchPublishChapters)

// 资源管理
router.get('/resources', authMiddleware, requireStaff, getResources)
router.get('/resources/:id', authMiddleware, requireStaff, getResource)
router.post('/resources', authMiddleware, requireStaff, createResource)
router.post('/resources/publish-all', authMiddleware, requireStaff, publishAllResources)
router.put('/resources/:id', authMiddleware, requireStaff, updateResource)
router.delete('/resources/:id', authMiddleware, requireStaff, deleteResource)
router.post('/resources/batch-delete', authMiddleware, requireStaff, batchDeleteResources)
router.post('/resources/batch-publish', authMiddleware, requireStaff, batchPublishResources)

// 社区管理
router.get('/community/discussions', authMiddleware, requireStaff, adminGetDiscussions)
router.post('/community/discussions', authMiddleware, requireStaff, adminCreateDiscussion)
router.post('/community/discussions/batch-delete', authMiddleware, requireStaff, batchDeleteDiscussions)
router.post('/community/discussions/:id/toggle-status', authMiddleware, requireStaff, toggleDiscussionStatus)
router.post('/community/discussions/:id/toggle-pin', authMiddleware, requireStaff, toggleDiscussionPin)
router.post('/community/discussions/:id/approve', authMiddleware, requireStaff, approveDiscussion)
router.post('/community/discussions/:id/reject', authMiddleware, requireStaff, rejectDiscussion)
router.put('/community/discussions/:id', authMiddleware, requireStaff, adminUpdateDiscussion)
router.delete('/community/discussions/:id', authMiddleware, requireStaff, adminDeleteDiscussion)
router.get('/community/comments', authMiddleware, requireStaff, adminGetComments)
router.post('/community/comments', authMiddleware, requireStaff, adminCreateComment)
router.post('/community/comments/batch-delete', authMiddleware, requireStaff, batchDeleteComments)
router.post('/community/comments/:id/toggle-status', authMiddleware, requireStaff, toggleCommentStatus)
router.post('/community/comments/:id/approve', authMiddleware, requireStaff, approveComment)
router.post('/community/comments/:id/reject', authMiddleware, requireStaff, rejectComment)
router.delete('/community/comments/:id', authMiddleware, requireStaff, adminDeleteComment)

export default router
module.exports = router
