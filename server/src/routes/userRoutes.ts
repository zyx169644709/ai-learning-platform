import { Router } from 'express'
import * as userController from '../controllers/userController'
import authMiddleware from '../middleware/authMiddleware'

const router = Router()

// 公开路由
router.post('/register', userController.register)
router.post('/login', userController.login)

// 需要认证的路由
router.get('/profile', authMiddleware, userController.getProfile)
router.put('/profile', authMiddleware, userController.updateProfile)
router.put('/change-password', authMiddleware, userController.changePassword)
router.post('/logout', authMiddleware, userController.logout)

export default router
module.exports = router


