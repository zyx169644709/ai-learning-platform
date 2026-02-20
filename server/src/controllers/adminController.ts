import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '../../generated/prisma'
import { formatDate } from '../utils/format'

const prisma = new PrismaClient()
const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key'

// 管理员登录
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string }

    if (!email || !password) {
      return res.status(400).json({ success: false, message: '邮箱和密码不能为空' })
    }

    // 查找管理员用户
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        role: true,
        avatar: true
      }
    })
    
    if (!user) return res.status(400).json({ success: false, message: '邮箱或密码错误' })

    // 验证密码（暂时使用简单的密码验证）
    // TODO: 在生产环境中，应该使用 bcrypt 验证加密密码
    if (password !== '123456') {
      return res.status(400).json({ success: false, message: '邮箱或密码错误' })
    }

    // 检查是否是管理员
    if (user.role !== 'ADMIN' && user.email !== 'admin@example.com') {
      return res.status(403).json({ success: false, message: '权限不足' })
    }

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' })

    res.json({ 
      success: true, 
      message: '登录成功', 
      data: { 
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.username,
          role: user.role,
          avatar: user.avatar || ''
        }, 
        token 
      } 
    })
  } catch (error: any) {
    console.error('管理员登录错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 获取管理员信息
export const getAdminInfo = async (req: Request & { user?: any }, res: Response) => {
  try {
    const userId = req.user?.userId as string
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        avatar: true
      }
    })
    
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' })
    
    res.json({ 
      success: true, 
      data: { 
        user: {
          id: user.id,
          email: user.email,
          name: user.username,
          role: user.role,
          avatar: user.avatar || ''
        }
      } 
    })
  } catch (error: any) {
    console.error('获取管理员信息错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 获取用户列表
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, role, name, email } = req.query
    
    // 构建查询条件
    const where: any = {}
    
    if (role) {
      where.role = role as string
    }
    if (name && name.toString().trim()) {
      where.username = {
        contains: name.toString().trim()
      }
    }
    if (email && email.toString().trim()) {
      where.email = {
        contains: email.toString().trim()
      }
    }
    
    // 计算分页
    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)
    
    // 查询用户
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          avatar: true,
          bio: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              discussions: true,
              comments: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])
    
    // 格式化返回数据
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.username,
      email: user.email,
      avatar: user.avatar || '',
      role: user.role,
      progress: 0, // TODO: 计算实际学习进度
      completedCourses: 0, // TODO: 从学习记录计算
      lastLogin: user.lastLoginAt?.toISOString() || '',
      registeredAt: user.createdAt.toISOString(),
      status: 'active', // TODO: 添加用户状态字段
      courses: [] // TODO: 获取用户课程
    }))
    
    res.json({
      success: true,
      data: {
        items: formattedUsers,
        total,
        page: Number(page),
        limit: Number(limit)
      }
    })
  } catch (error: any) {
    console.error('获取用户列表错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 更新用户
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, email, role } = req.body
    
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' })
    
    // 检查邮箱是否已被其他用户使用
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        return res.status(400).json({ success: false, message: '邮箱已被使用' })
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        username: name || user.username,
        email: email || user.email,
        role: role || user.role
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar: true
      }
    })
    
    res.json({ 
      success: true, 
      message: '更新成功', 
      data: { 
        user: {
          id: updatedUser.id,
          name: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          avatar: updatedUser.avatar || ''
        }
      } 
    })
  } catch (error: any) {
    console.error('更新用户错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 删除用户
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' })
    
    // 防止删除管理员账号
    if (user.role === 'ADMIN') {
      return res.status(403).json({ success: false, message: '不能删除管理员账号' })
    }
    
    await prisma.user.delete({ where: { id } })
    
    res.json({ success: true, message: '删除成功' })
  } catch (error: any) {
    console.error('删除用户错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 获取课程列表
export const getCourses = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, type, title } = req.query
    
    // 构建查询条件
    const where: any = {}
    
    if (type) {
      where.level = type as string
    }
    if (title && title.toString().trim()) {
      where.title = {
        contains: title.toString().trim()
      }
    }
    
    // 计算分页
    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)
    
    // 查询课程
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          level: true,
          cover: true,
          url: true,
          tags: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.course.count({ where })
    ])
    
    // 格式化返回数据
    const formattedCourses = courses.map(course => {
      const tags = (course.tags as any) || {}
      return {
        id: course.id,
        title: course.title,
        type: course.level || 'beginner',
        duration: tags.duration || '',
        cover: course.cover || '',
        content: tags.content || '',
        status: tags.status || 'published',
        students: 0, // TODO: 从学习记录统计
        completionRate: 0, // TODO: 计算完成率
        updatedAt: formatDate(course.updatedAt)
      }
    })
    
    res.json({ 
      success: true, 
      data: { 
        items: formattedCourses, 
        total,
        page: Number(page),
        limit: Number(limit)
      } 
    })
  } catch (error: any) {
    console.error('获取课程列表错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 创建课程
export const createCourse = async (req: Request, res: Response) => {
  try {
    const { title, type, duration, cover, content, status } = req.body
    
    // 验证必填字段
    if (!title) {
      return res.status(400).json({ success: false, message: '课程标题不能为空' })
    }
    
    const course = await prisma.course.create({
      data: {
        title,
        level: type || 'beginner',
        cover: cover || '',
        url: '', // TODO: 生成课程 URL
        tags: { 
          duration: duration || '',
          content: content || '', 
          status: status || 'draft' 
        } as any
      }
    })
    
    const tags = (course.tags as any) || {}
    res.json({ 
      success: true, 
      message: '创建成功', 
      data: { 
        course: {
          id: course.id,
          title: course.title,
          type: course.level,
          duration: tags.duration || '',
          cover: course.cover || '',
          content: tags.content || '',
          status: tags.status || 'draft'
        }
      } 
    })
  } catch (error: any) {
    console.error('创建课程错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 更新课程
export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { title, type, duration, cover, content, status } = req.body
    
    const course = await prisma.course.findUnique({ where: { id } })
    if (!course) return res.status(404).json({ success: false, message: '课程不存在' })
    
    // 构建更新数据
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (type !== undefined) updateData.level = type
    if (cover !== undefined) updateData.cover = cover
    
    // 更新 tags 字段（合并现有数据）
    const existingTags = (course.tags as any) || {}
    updateData.tags = {
      ...existingTags,
      duration: duration !== undefined ? duration : existingTags.duration || '',
      content: content !== undefined ? content : existingTags.content || '',
      status: status !== undefined ? status : existingTags.status || 'draft'
    } as any
    
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: updateData
    })
    
    const tags = (updatedCourse.tags as any) || {}
    res.json({ 
      success: true, 
      message: '更新成功', 
      data: { 
        course: {
          id: updatedCourse.id,
          title: updatedCourse.title,
          type: updatedCourse.level,
          duration: tags.duration || '',
          cover: updatedCourse.cover || '',
          content: tags.content || '',
          status: tags.status || 'draft'
        }
      } 
    })
  } catch (error: any) {
    console.error('更新课程错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 删除课程
export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const course = await prisma.course.findUnique({ where: { id } })
    if (!course) return res.status(404).json({ success: false, message: '课程不存在' })
    
    await prisma.course.delete({ where: { id } })
    
    res.json({ success: true, message: '删除成功' })
  } catch (error: any) {
    console.error('删除课程错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 获取统计数据
export const getStats = async (req: Request, res: Response) => {
  try {
    // 并行查询所有统计数据
    const [totalUsers, totalCourses, totalDiscussions, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.discussion.count(),
      prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 最近7天
          }
        }
      })
    ])
    
    // TODO: 计算实际完成率（需要学习记录表）
    const completionRate = 78
    
    const stats = {
      totalUsers,
      totalCourses,
      completionRate,
      activeUsers: recentUsers
    }
    
    res.json({ success: true, data: stats })
  } catch (error: any) {
    console.error('获取统计数据错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 获取分析数据
export const getAnalytics = async (req: Request, res: Response) => {
  try {
    // TODO: 实现更详细的数据分析
    // 用户增长趋势、课程热度、学习时长等
    const analytics = {
      userGrowth: [],
      courseProgress: [],
      revenueData: []
    }
    
    res.json({ success: true, data: analytics })
  } catch (error: any) {
    console.error('获取分析数据错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// CommonJS exports for compatibility
module.exports = {
  login,
  getAdminInfo,
  getUsers,
  updateUser,
  deleteUser,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getStats,
  getAnalytics
}
