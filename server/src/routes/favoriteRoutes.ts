import { Router } from 'express'
import { toggleFavorite, checkFavorite, getFavorites } from '../controllers/favoriteController'
import authMiddleware from '../middleware/authMiddleware'

const router = Router()

router.post('/toggle', authMiddleware as any, toggleFavorite)
router.get('/check', authMiddleware as any, checkFavorite)
router.get('/', authMiddleware as any, getFavorites)

export default router
module.exports = router
