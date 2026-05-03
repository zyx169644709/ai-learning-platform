import { Request, Response, NextFunction } from 'express'

// 检查是否是管理员
const requireRoles = (...roles: string[]) => {
  return (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      })
    }

    next()
  }
}

export const requireAdmin = requireRoles('ADMIN')
export const requireStaff = requireRoles('ADMIN', 'MODERATOR')
