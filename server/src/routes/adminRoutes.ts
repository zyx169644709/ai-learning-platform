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
  getStats,
  getAnalytics
} from '../controllers/adminController'
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
router.put('/courses/:id', authMiddleware, requireAdmin, updateCourse)
router.delete('/courses/:id', authMiddleware, requireAdmin, deleteCourse)

// 统计数据
router.get('/stats', authMiddleware, requireAdmin, getStats)

// 数据分析
router.get('/analytics', authMiddleware, requireAdmin, getAnalytics)

export default router
module.exports = router
