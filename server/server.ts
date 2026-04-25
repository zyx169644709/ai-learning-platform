import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import userRoutes from './src/routes/userRoutes'
import communityRoutes from './src/routes/communityRoutes'
import resourceRoutes from './src/routes/resourceRoutes'
import courseRoutes from './src/routes/courseRoutes'
import adminRoutes from './src/routes/adminRoutes'
import uploadRoutes from './src/routes/uploadRoutes'
import chapterRoutes from './src/routes/chapterRoutes'
import favoriteRoutes from './src/routes/favoriteRoutes'
import courseProgressRoutes from './src/routes/courseProgressRoutes'
import quizRoutes from './src/routes/quizRoutes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({ origin: true, credentials: true }))
app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }))

// 路由
app.use('/api/user', userRoutes)
app.use('/api/community', communityRoutes)
app.use('/api/resources', resourceRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/chapters', chapterRoutes)
app.use('/api/favorites', favoriteRoutes)
app.use('/api/course-progress', courseProgressRoutes)
app.use('/api/quiz', quizRoutes)

// 静态文件服务 - 提供上传的图片访问
app.use('/uploads', express.static('uploads'))

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Server is running' })
})

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('服务器错误:', err.stack)
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: '上传文件过大，请选择较小的图片' })
  }
  res.status(500).json({ success: false, message: 'Internal Server Error', error: process.env.NODE_ENV === 'development' ? err.message : undefined })
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

module.exports = app


