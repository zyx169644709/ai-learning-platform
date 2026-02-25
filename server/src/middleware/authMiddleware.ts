import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const { PrismaClient } = require('../../generated/prisma')
const prisma = new PrismaClient()

export interface AuthRequest extends Request {
  user?: any
}

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ success: false, message: '访问被拒绝，缺少token' })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, status: true }
    })
    if (!user) {
      return res.status(401).json({ success: false, message: '用户不存在' })
    }
    if (user.status === 'disabled') {
      return res.status(403).json({ success: false, message: '账号已被禁用' })
    }
    
    req.user = decoded
    next()
  } catch (error: any) {
    console.error('Token验证失败:', error.message)
    res.status(401).json({ success: false, message: 'Token无效' })
  }
}

export default authMiddleware
module.exports = authMiddleware


