import { Router } from 'express'
import { login, getAdminInfo } from '../controllers/adminController'
import authMiddleware from '../middleware/authMiddleware'
import { requireAdmin } from '../middleware/adminAuth'

const router = Router()

// 管理员登录
router.post('/auth/login', login)

// 获取管理员信息（需要认证）
router.get('/auth/info', authMiddleware, requireAdmin, getAdminInfo)

// 用户管理
router.get('/users', authMiddleware, requireAdmin, require('../controllers/adminController').getUsers)
router.put('/users/:id', authMiddleware, requireAdmin, require('../controllers/adminController').updateUser)
router.delete('/users/:id', authMiddleware, requireAdmin, require('../controllers/adminController').deleteUser)

// 课程管理
router.get('/courses', authMiddleware, requireAdmin, require('../controllers/adminController').getCourses)
router.post('/courses', authMiddleware, requireAdmin, require('../controllers/adminController').createCourse)
router.put('/courses/:id', authMiddleware, requireAdmin, require('../controllers/adminController').updateCourse)
router.delete('/courses/:id', authMiddleware, requireAdmin, require('../controllers/adminController').deleteCourse)

// 统计数据
router.get('/stats', authMiddleware, requireAdmin, require('../controllers/adminController').getStats)

// 数据分析
router.get('/analytics', authMiddleware, requireAdmin, require('../controllers/adminController').getAnalytics)

export default router
module.exports = router
