import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({ origin: true, credentials: true }))
app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }))

// 路由
// eslint-disable-next-line @typescript-eslint/no-var-requires
const userRoutes = require('./src/routes/userRoutes')
const communityRoutes = require('./src/routes/communityRoutes')
const resourceRoutes = require('./src/routes/resourceRoutes')
const courseRoutes = require('./src/routes/courseRoutes')
app.use('/api/user', userRoutes)
app.use('/api/community', communityRoutes)
app.use('/api/resources', resourceRoutes)
app.use('/api/courses', courseRoutes)

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


