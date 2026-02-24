import { Router } from 'express'
import { getResources as listResources, getResource, createResource, updateResource, deleteResource, incrementResourceView, likeResource } from '../controllers/resourceController'
import authMiddleware from '../middleware/authMiddleware'

const router = Router()

router.get('/', listResources)
router.get('/:id', getResource)
router.post('/:id/view', incrementResourceView)
router.post('/:id/like', likeResource)
router.post('/', authMiddleware as any, createResource)
router.put('/:id', authMiddleware as any, updateResource)
router.delete('/:id', authMiddleware as any, deleteResource)

export default router
module.exports = router


