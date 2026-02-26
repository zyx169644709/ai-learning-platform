import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  user?: any
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ success: false, message: '访问被拒绝，缺少token' })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    req.user = decoded
    next()
  } catch (error: any) {
    console.error('Token验证失败:', error.message)
    res.status(401).json({ success: false, message: 'Token无效' })
  }
}

export default authMiddleware
module.exports = authMiddleware


