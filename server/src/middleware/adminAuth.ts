import { Request, Response, NextFunction } from 'express'

// 检查是否是管理员
export const requireAdmin = (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  // 检查用户角色
  if (req.user?.role !== 'ADMIN' && req.user?.email !== 'admin@example.com') {
    return res.status(403).json({ 
      success: false, 
      message: '权限不足，需要管理员权限' 
    })
  }
  
  next()
}
