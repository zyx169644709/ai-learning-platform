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
          status: true,
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
      status: user.status || 'active',
      progress: 0, // TODO: 计算实际学习进度
      completedCourses: 0, // TODO: 从学习记录计算
      lastLogin: user.lastLoginAt ? formatDate(user.lastLoginAt) : '-',
      registeredAt: formatDate(user.createdAt),
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
    
    // 排除从 Markdown 导入的课程（ID 以 course- 开头）
    where.NOT = {
      id: { startsWith: 'course-' }
    }
    
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
          level: true,
          cover: true,
          url: true,
          status: true,
          duration: true,
          content: true,
          viewCount: true,
          studentCount: true,
          favoriteCount: true,
          tags: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.course.count({ where })
    ])
    
    // 格式化返回数据
    const formattedCourses = courses.map(course => {
      return {
        id: course.id,
        title: course.title,
        type: course.level || 'beginner',
        duration: course.duration || '',
        cover: course.cover || '',
        url: course.url || '',
        content: course.content || '',
        status: course.status || 'draft',
        viewCount: course.viewCount || 0,
        studentCount: course.studentCount || 0,
        favoriteCount: course.favoriteCount || 0,
        students: course.studentCount || 0,
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
    const { title, type, duration, cover, url, content, status } = req.body
    
    // 验证必填字段
    if (!title) {
      return res.status(400).json({ success: false, message: '课程标题不能为空' })
    }
    
    const course = await prisma.course.create({
      data: {
        title,
        level: type || 'beginner',
        cover: cover || '',
        url: url || '',
        duration: duration || '',
        content: content || '',
        status: status || 'draft'
      }
    })
    
    res.json({ 
      success: true, 
      message: '创建成功', 
      data: { 
        course: {
          id: course.id,
          title: course.title,
          type: course.level,
          duration: course.duration || '',
          cover: course.cover || '',
          url: course.url || '',
          content: course.content || '',
          status: course.status || 'draft'
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
    const { title, type, duration, cover, url, content, status } = req.body
    
    const course = await prisma.course.findUnique({ where: { id } })
    if (!course) return res.status(404).json({ success: false, message: '课程不存在' })
    
    // 构建更新数据
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (type !== undefined) updateData.level = type
    if (cover !== undefined) updateData.cover = cover
    if (url !== undefined) updateData.url = url
    if (duration !== undefined) updateData.duration = duration
    if (content !== undefined) updateData.content = content
    if (status !== undefined) updateData.status = status
    
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: updateData
    })
    
    res.json({ 
      success: true, 
      message: '更新成功', 
      data: { 
        course: {
          id: updatedCourse.id,
          title: updatedCourse.title,
          type: updatedCourse.level,
          duration: updatedCourse.duration || '',
          cover: updatedCourse.cover || '',
          url: updatedCourse.url || '',
          content: updatedCourse.content || '',
          status: updatedCourse.status || 'draft'
        }
      } 
    })
  } catch (error: any) {
    console.error('更新课程错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 复制课程
export const duplicateCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const source = await prisma.course.findUnique({ where: { id } })
    if (!source) return res.status(404).json({ success: false, message: '课程不存在' })

    const newCourse = await prisma.course.create({
      data: {
        title: `${source.title}（副本）`,
        level: source.level,
        cover: source.cover,
        url: source.url,
        duration: source.duration,
        content: source.content,
        status: 'draft',
        tags: source.tags as any
      }
    })

    res.json({
      success: true,
      message: '复制成功',
      data: {
        course: {
          id: newCourse.id,
          title: newCourse.title,
          type: newCourse.level,
          duration: newCourse.duration || '',
          cover: newCourse.cover || '',
          url: newCourse.url || '',
          content: newCourse.content || '',
          status: newCourse.status || 'draft'
        }
      }
    })
  } catch (error: any) {
    console.error('复制课程错误:', error)
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

// 一键发布所有草稿课程
export const publishAllCourses = async (req: Request, res: Response) => {
  try {
    const result = await prisma.course.updateMany({
      where: {
        status: 'draft',
        NOT: {
          id: { startsWith: 'course-' }
        }
      },
      data: {
        status: 'published'
      }
    })

    res.json({ success: true, message: `已将 ${result.count} 个草稿课程发布`, data: { count: result.count } })
  } catch (error: any) {
    console.error('一键发布课程错误:', error)
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

// 一键发布所有草稿资源
export const publishAllResources = async (req: Request, res: Response) => {
  try {
    const result = await prisma.resource.updateMany({
      where: { status: 'draft' },
      data: { status: 'published' }
    })
    
    res.json({ 
      success: true, 
      message: `成功发布 ${result.count} 个资源`,
      data: { publishedCount: result.count }
    })
  } catch (error: any) {
    console.error('批量发布资源错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 批量删除用户
export const batchDeleteUsers = async (req: Request, res: Response) => {
  try {
    const { userIds } = req.body
    
    // 防止删除管理员账号
    const adminUsers = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        role: 'ADMIN'
      }
    })
    
    if (adminUsers.length > 0) {
      return res.status(403).json({ 
        success: false, 
        message: '不能删除管理员账号' 
      })
    }
    
    const result = await prisma.user.deleteMany({
      where: {
        id: { in: userIds },
        role: { not: 'ADMIN' }
      }
    })
    
    res.json({ 
      success: true, 
      message: `成功删除 ${result.count} 个用户`,
      data: { deletedCount: result.count }
    })
  } catch (error: any) {
    console.error('批量删除用户错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 导出用户Excel
export const exportUsers = async (req: Request, res: Response) => {
  try {
    const { userIds, fields } = req.body
    
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            courses: true,
            chapters: true,
            resources: true,
            favorites: true,
            discussions: true,
            comments: true
          }
        }
      }
    })
    
    // 字段映射
    const fieldMap: Record<string, any> = {
      id: (user: any) => user.id,
      username: (user: any) => user.username,
      email: (user: any) => user.email,
      role: (user: any) => user.role === 'ADMIN' ? '管理员' : user.role === 'MODERATOR' ? '教师' : '学生',
      status: (user: any) => user.status === 'active' ? '正常' : user.status === 'disabled' ? '禁用' : '封禁',
      avatar: (user: any) => user.avatar || '',
      lastLoginAt: (user: any) => user.lastLoginAt ? user.lastLoginAt.toLocaleString('zh-CN') : '从未登录',
      createdAt: (user: any) => user.createdAt.toLocaleString('zh-CN'),
      updatedAt: (user: any) => user.updatedAt.toLocaleString('zh-CN'),
      coursesCount: (user: any) => user._count.courses,
      chaptersCount: (user: any) => user._count.chapters,
      resourcesCount: (user: any) => user._count.resources,
      favoritesCount: (user: any) => user._count.favorites,
      discussionsCount: (user: any) => user._count.discussions,
      commentsCount: (user: any) => user._count.comments
    }

    // 字段标签映射
    const labelMap: Record<string, string> = {
      id: '用户ID',
      username: '用户名',
      email: '邮箱',
      role: '角色',
      status: '状态',
      avatar: '头像',
      lastLoginAt: '最后登录',
      createdAt: '注册时间',
      updatedAt: '最后更新',
      coursesCount: '创建课程数',
      chaptersCount: '创建章节数',
      resourcesCount: '创建资源数',
      favoritesCount: '收藏数',
      discussionsCount: '发帖数',
      commentsCount: '评论数'
    }

    // 如果没有指定字段，默认导出所有字段
    const selectedFields = fields && fields.length > 0 ? fields : Object.keys(fieldMap)

    // 转换数据格式
    const exportData = users.map(user => {
      const row: any = {}
      selectedFields.forEach((field: string) => {
        if (fieldMap[field]) {
          row[labelMap[field]] = fieldMap[field](user)
        }
      })
      return row
    })
    
    // 使用 xlsx 库创建 Excel 文件
    const XLSX = require('xlsx')
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    
    // 根据选择的字段设置列宽
    const colWidths: Record<string, number> = {
      id: 20,           // 用户ID
      username: 15,     // 用户名
      email: 30,        // 邮箱
      role: 10,         // 角色
      status: 10,       // 状态
      avatar: 40,       // 头像
      lastLoginAt: 20,  // 最后登录
      createdAt: 20,    // 注册时间
      updatedAt: 20,    // 最后更新
      coursesCount: 12, // 创建课程数
      chaptersCount: 12,// 创建章节数
      resourcesCount: 12,// 创建资源数
      favoritesCount: 12,// 收藏数
      discussionsCount: 12,// 发帖数
      commentsCount: 12 // 评论数
    }

    ws['!cols'] = selectedFields.map((field: string) => ({ width: colWidths[field] || 15 }))
    
    XLSX.utils.book_append_sheet(wb, ws, '用户数据')
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename=user_data_${Date.now()}.xlsx`)
    res.send(excelBuffer)
  } catch (error: any) {
    console.error('导出用户错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 批量删除课程
export const batchDeleteCourses = async (req: Request, res: Response) => {
  try {
    const { courseIds } = req.body
    
    const result = await prisma.course.deleteMany({
      where: {
        id: { in: courseIds }
      }
    })
    
    res.json({ 
      success: true, 
      message: `成功删除 ${result.count} 个课程`,
      data: { deletedCount: result.count }
    })
  } catch (error: any) {
    console.error('批量删除课程错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 批量发布课程
export const batchPublishCourses = async (req: Request, res: Response) => {
  try {
    const { courseIds } = req.body
    
    const result = await prisma.course.updateMany({
      where: {
        id: { in: courseIds },
        status: 'draft'
      },
      data: { status: 'published' }
    })
    
    res.json({ 
      success: true, 
      message: `成功发布 ${result.count} 个课程`,
      data: { publishedCount: result.count }
    })
  } catch (error: any) {
    console.error('批量发布课程错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 导出课程Excel
export const exportCourses = async (req: Request, res: Response) => {
  try {
    const { courseIds, fields } = req.body
    
    const courses = await prisma.course.findMany({
      where: {
        id: { in: courseIds }
      },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        url: true,
        duration: true,
        cover: true,
        content: true,
        viewCount: true,
        favoriteCount: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    // 字段映射
    const fieldMap: Record<string, any> = {
      title: (course: any) => course.title,
      type: (course: any) => course.type,
      status: (course: any) => course.status,
      url: (course: any) => course.url || '',
      duration: (course: any) => course.duration || 0,
      cover: (course: any) => course.cover || '',
      content: (course: any) => course.content || '',
      viewCount: (course: any) => course.viewCount || 0,
      favoriteCount: (course: any) => course.favoriteCount || 0,
      createdAt: (course: any) => course.createdAt.toLocaleString('zh-CN'),
      updatedAt: (course: any) => course.updatedAt.toLocaleString('zh-CN')
    }

    // 字段标签映射
    const labelMap: Record<string, string> = {
      title: '课程标题',
      type: '类型',
      status: '状态',
      url: 'URL',
      duration: '时长',
      cover: '封面',
      content: '内容',
      viewCount: '浏览量',
      favoriteCount: '收藏量',
      createdAt: '创建时间',
      updatedAt: '更新时间'
    }

    // 如果没有指定字段，默认导出所有字段
    const selectedFields = fields && fields.length > 0 ? fields : Object.keys(fieldMap)

    // 转换数据格式
    const exportData = courses.map(course => {
      const row: any = {}
      selectedFields.forEach((field: string) => {
        if (fieldMap[field]) {
          row[labelMap[field]] = fieldMap[field](course)
        }
      })
      return row
    })
    
    // 使用 xlsx 库创建 Excel 文件
    const XLSX = require('xlsx')
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    
    // 根据选择的字段设置列宽
    const colWidths: Record<string, number> = {
      title: 30,         // 课程标题
      type: 10,          // 类型
      status: 10,        // 状态
      url: 40,           // URL
      duration: 10,      // 时长
      cover: 40,         // 封面
      content: 50,       // 内容
      viewCount: 12,     // 浏览量
      favoriteCount: 12, // 收藏量
      createdAt: 20,     // 创建时间
      updatedAt: 20      // 更新时间
    }

    ws['!cols'] = selectedFields.map((field: string) => ({ width: colWidths[field] || 15 }))
    
    XLSX.utils.book_append_sheet(wb, ws, '课程数据')
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename=course_data_${Date.now()}.xlsx`)
    res.send(excelBuffer)
  } catch (error: any) {
    console.error('导出课程错误:', error)
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
  duplicateCourse,
  publishAllCourses,
  getStats,
  getAnalytics,
  publishAllResources,
  batchDeleteUsers,
  exportUsers,
  batchDeleteCourses,
  batchPublishCourses,
  exportCourses
}
