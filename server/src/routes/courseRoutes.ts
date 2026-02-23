import { Router, Request, Response } from 'express'
import { listCourses, getCourse, createCourse, updateCourse, deleteCourse } from '../controllers/courseController'
import authMiddleware from '../middleware/authMiddleware'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('../../generated/prisma')
const prisma = new PrismaClient()

const router = Router()

router.get('/', listCourses)
router.get('/:id', getCourse)
router.post('/:id/view', async (req: Request, res: Response) => {
  try {
    await prisma.course.update({
      where: { id: req.params.id },
      data: { viewCount: { increment: 1 } }
    })
    res.json({ success: true })
  } catch {
    res.status(404).json({ success: false })
  }
})
router.post('/:id/learn', async (req: Request, res: Response) => {
  try {
    await prisma.course.update({
      where: { id: req.params.id },
      data: { studentCount: { increment: 1 } }
    })
    res.json({ success: true })
  } catch {
    res.status(404).json({ success: false })
  }
})
router.post('/', authMiddleware as any, createCourse)
router.put('/:id', authMiddleware as any, updateCourse)
router.delete('/:id', authMiddleware as any, deleteCourse)

export default router
module.exports = router


