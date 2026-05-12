import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '../../generated/prisma'
import { formatDate } from '../utils/format'

const prisma = new PrismaClient()
const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key'
const DAY_MS = 24 * 60 * 60 * 1000

type TrendBucket = {
  label: string
  start: Date
  end: Date
}

const startOfDay = (date: Date) => {
  const nextDate = new Date(date)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

const endOfDay = (date: Date) => {
  const nextDate = new Date(date)
  nextDate.setHours(23, 59, 59, 999)
  return nextDate
}

const buildRecentDailyBuckets = (days: number): TrendBucket[] => {
  return Array.from({ length: days }, (_, index) => {
    const targetDate = new Date(Date.now() - (days - 1 - index) * DAY_MS)
    const start = startOfDay(targetDate)
    const end = endOfDay(targetDate)
    return {
      label: `${start.getMonth() + 1}/${start.getDate()}`,
      start,
      end
    }
  })
}

const buildRecentWeeklyBuckets = (bucketCount: number): TrendBucket[] => {
  return Array.from({ length: bucketCount }, (_, index) => {
    const bucketEnd = new Date(Date.now() - (bucketCount - 1 - index) * 7 * DAY_MS)
    const end = endOfDay(bucketEnd)
    const start = startOfDay(new Date(bucketEnd.getTime() - 6 * DAY_MS))
    return {
      label: `${start.getMonth() + 1}/${start.getDate()}\n-${end.getMonth() + 1}/${end.getDate()}`,
      start,
      end
    }
  })
}

const buildRecentMonthlyBuckets = (bucketCount: number): TrendBucket[] => {
  const now = new Date()
  return Array.from({ length: bucketCount }, (_, index) => {
    const targetMonth = new Date(now.getFullYear(), now.getMonth() - (bucketCount - 1 - index), 1)
    const start = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1, 0, 0, 0, 0)
    const end = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59, 999)
    return {
      label: `${targetMonth.getMonth() + 1}月`,
      start,
      end
    }
  })
}

const getActivityLabel = (activityRate: number) => {
  if (activityRate >= 50) return '优秀'
  if (activityRate >= 30) return '良好'
  if (activityRate >= 10) return '一般'
  return '较低'
}

const countUsersCreatedInRange = (start: Date, end: Date) => {
  return prisma.user.count({
    where: {
      createdAt: {
        gte: start,
        lte: end
      }
    }
  })
}

const countUsersActiveInRange = (start: Date, end: Date) => {
  return prisma.user.count({
    where: {
      lastLoginAt: {
        gte: start,
        lte: end
      }
    }
  })
}

const countUsersCreatedInBuckets = async (buckets: TrendBucket[]) => {
  return Promise.all(buckets.map(bucket => countUsersCreatedInRange(bucket.start, bucket.end)))
}

// 管理员登录
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as { username?: string; password?: string }

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' })
    }

    // 查找后台用户
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        role: true,
        avatar: true
      }
    })

    if (!user) return res.status(400).json({ success: false, message: '用户名或密码错误' })

    // 验证密码
    const bcrypt = require('bcryptjs')
    const passwordValid = await bcrypt.compare(password, user.password)
    if (!passwordValid) {
      return res.status(400).json({ success: false, message: '用户名或密码错误' })
    }

    // 检查是否有后台权限
    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      return res.status(403).json({ success: false, message: '权限不足' })
    }

    const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' })

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
              comments: true,
              favorites: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    // 获取每个用户的完成小节数
    const userIds = users.map(user => user.id)
    const sectionCompletions = await prisma.sectionCompletion.groupBy({
      by: ['userId'],
      where: {
        userId: {
          in: userIds
        }
      },
      _count: {
        sectionId: true
      }
    })

    // 创建完成小节数映射
    const completedSectionsMap = new Map<string, number>()
    sectionCompletions.forEach(completion => {
      completedSectionsMap.set(completion.userId, completion._count.sectionId)
    })

    // 格式化返回数据
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.username,
      email: user.email,
      avatar: user.avatar || '',
      role: user.role,
      status: user.status || 'active',
      completedSections: completedSectionsMap.get(user.id) || 0,
      completedCourses: 0, // TODO: 从学习记录计算
      lastLogin: user.lastLoginAt ? formatDate(user.lastLoginAt) : '-',
      registeredAt: formatDate(user.createdAt),
      courses: [], // TODO: 获取用户课程
      favoritesCount: user._count.favorites,
      discussionsCount: user._count.discussions,
      commentsCount: user._count.comments
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

// 重置用户密码
export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const bcrypt = require('bcryptjs')
    const { id } = req.params
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' })
    if (user.role === 'ADMIN') {
      return res.status(403).json({ success: false, message: '不能重置管理员密码' })
    }
    const hashedPassword = await bcrypt.hash('123456', 10)
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    })
    res.json({ success: true, message: '密码已重置为 123456' })
  } catch (error: any) {
    console.error('重置密码错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 禁用用户账号
export const disableUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' })
    if (user.role === 'ADMIN') {
      return res.status(403).json({ success: false, message: '不能禁用管理员账号' })
    }
    await prisma.user.update({ where: { id }, data: { status: 'disabled' } })
    res.json({ success: true, message: '账号已禁用' })
  } catch (error: any) {
    console.error('禁用用户错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 启用用户账号
export const enableUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' })
    await prisma.user.update({ where: { id }, data: { status: 'active' } })
    res.json({ success: true, message: '账号已启用' })
  } catch (error: any) {
    console.error('启用用户错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 删除用户
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' })

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
    const { page = 1, limit = 20, type, title, status, category } = req.query

    const where: any = {}

    where.NOT = {
      id: { startsWith: 'course-' }
    }

    if (type) {
      where.level = type as string
    }
    if (category && category.toString().trim()) {
      where.category = category.toString().trim()
    }
    if (title && title.toString().trim()) {
      where.title = {
        contains: title.toString().trim()
      }
    }
    if (status && status.toString().trim()) {
      where.status = status.toString().trim()
    }

    const CATEGORY_ORDER: Record<string, number> = {
      'fundamentals': 0,
      'core-syntax': 1,
      'advanced-practice': 2,
      'projects': 3,
      'interview': 4,
      'ecosystem': 5
    }

    const allCourses = await prisma.course.findMany({
      where,
      select: {
        id: true,
        title: true,
        level: true,
        category: true,
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
        updatedAt: true,
        order: true
      }
    })

    allCourses.sort((a, b) => {
      const catA = CATEGORY_ORDER[a.category ?? ''] ?? 99
      const catB = CATEGORY_ORDER[b.category ?? ''] ?? 99
      if (catA !== catB) return catA - catB
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER
      return orderA - orderB
    })

    const total = allCourses.length
    const skip = (Number(page) - 1) * Number(limit)
    const courses = allCourses.slice(skip, skip + Number(limit))

    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      level: course.level || '',
      category: course.category || '',
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
      completionRate: 0,
      updatedAt: formatDate(course.updatedAt)
    }))

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
    const { title, category, level, duration, cover, url, content, status } = req.body

    if (!title) {
      return res.status(400).json({ success: false, message: '课程标题不能为空' })
    }

    const course = await prisma.course.create({
      data: {
        title,
        category: category || null,
        level: level || null,
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
          category: course.category || '',
          level: course.level || '',
          type: course.level || '',
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
    const { title, category, level, duration, cover, url, content, status } = req.body

    const course = await prisma.course.findUnique({ where: { id } })
    if (!course) return res.status(404).json({ success: false, message: '课程不存在' })

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (category !== undefined) updateData.category = category
    if (level !== undefined) updateData.level = level
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
          category: updatedCourse.category || '',
          level: updatedCourse.level || '',
          type: updatedCourse.level || '',
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
    const dailyBuckets = buildRecentDailyBuckets(7)
    const todayBucket = dailyBuckets[dailyBuckets.length - 1]
    const yesterdayBucket = dailyBuckets[dailyBuckets.length - 2]

    const [
      totalUsers,
      totalCourses,
      totalDiscussions,
      recentUsers,
      newUsersToday,
      newUsersYesterday,
      todayActiveUsers,
      adminCount,
      moderatorCount,
      userCount,
      weeklyUsersData,
      weeklyActiveUsersData
    ] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.discussion.count(),
      countUsersActiveInRange(dailyBuckets[0].start, todayBucket.end),
      countUsersCreatedInRange(todayBucket.start, todayBucket.end),
      countUsersCreatedInRange(yesterdayBucket.start, yesterdayBucket.end),
      countUsersActiveInRange(todayBucket.start, todayBucket.end),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'MODERATOR' } }),
      prisma.user.count({ where: { role: 'USER' } }),
      countUsersCreatedInBuckets(dailyBuckets),
      Promise.all(dailyBuckets.map(bucket => countUsersActiveInRange(bucket.start, bucket.end)))
    ])

    // 计算实际的质量指标（基于最近30天的数据）
    const monthStart = startOfDay(new Date(Date.now() - 30 * DAY_MS))
    
    // 1. 小节完成率（基于SectionCompletion）
    const [totalSectionCompletions, totalSections] = await Promise.all([
      prisma.sectionCompletion.count({
        where: { completedAt: { gte: monthStart } }
      }),
      prisma.chapter.count({
        where: { type: 'section', status: 'published' }
      })
    ])
    const sectionCompletionRate = totalSections > 0
      ? Math.round((totalSectionCompletions / totalSections) * 100)
      : 0
    
    // 2. 用户活跃度 (DAU/MAU)
    const [dauUsers, mauUsers] = await Promise.all([
      countUsersActiveInRange(todayBucket.start, todayBucket.end),
      countUsersActiveInRange(monthStart, todayBucket.end)
    ])
    const userActivity = mauUsers > 0 ? Math.round((dauUsers / mauUsers) * 100) : 0
    const userActivityLabel = getActivityLabel(userActivity)
    
    // 3. 讨论互动率
    const [discussionStats, commentStats] = await Promise.all([
      prisma.discussion.aggregate({
        _sum: { views: true, likes: true },
        _count: { id: true },
        where: { createdAt: { gte: monthStart } }
      }),
      prisma.comment.aggregate({
        _sum: { likes: true },
        _count: { id: true },
        where: { createdAt: { gte: monthStart } }
      })
    ])
    const totalDiscussionViews = discussionStats._sum.views || 0
    const totalDiscussionLikes = discussionStats._sum.likes || 0
    const totalCommentLikes = commentStats._sum.likes || 0
    const totalDiscussionsCount = discussionStats._count.id
    const totalComments = commentStats._count.id
    const discussionEngagement = totalDiscussionsCount > 0
      ? Math.min(Math.round(((totalDiscussionLikes + totalCommentLikes) / totalDiscussionsCount) * 10), 100)
      : 0
    
    // 4. 资源收藏率（收藏量/浏览量）
    const resourceStats = await prisma.resource.aggregate({
      _sum: { viewCount: true, favoriteCount: true },
      _count: { id: true },
      where: { status: 'published' }
    })
    const totalResourceViews = resourceStats._sum.viewCount || 0
    const totalResourceFavorites = resourceStats._sum.favoriteCount || 0
    const resourceUtilization = totalResourceViews > 0
      ? Math.round((totalResourceFavorites / totalResourceViews) * 100)
      : 0
    const weeklyActivityData = weeklyActiveUsersData.map(count => totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0)

    const stats = {
      totalUsers,
      totalCourses,
      completionRate: sectionCompletionRate,
      activeUsers: recentUsers,
      dashboard: {
        newUsersToday,
        newUsersYesterday,
        todayActiveUsers,
        activityRate: userActivity,
        activityLabel: userActivityLabel,
        qualityMetrics: {
          sectionCompletionRate,
          userActivity,
          userActivityLabel,
          discussionEngagement,
          resourceUtilization
        },
        roleDistribution: {
          admin: adminCount,
          moderator: moderatorCount,
          user: userCount
        },
        weeklyTrend: {
          usersData: weeklyUsersData,
          usersTotal: weeklyUsersData.reduce((sum, count) => sum + count, 0),
          activityData: weeklyActivityData,
          activityAvg: weeklyActivityData.length > 0
            ? Math.round(weeklyActivityData.reduce((sum, count) => sum + count, 0) / weeklyActivityData.length)
            : 0
        }
      }
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
    const dailyBuckets = buildRecentDailyBuckets(7)
    const weeklyBuckets = buildRecentWeeklyBuckets(5)
    const monthlyBuckets = buildRecentMonthlyBuckets(6)
    const todayBucket = dailyBuckets[dailyBuckets.length - 1]
    const monthStart = startOfDay(new Date(Date.now() - 30 * DAY_MS))

    const [totalUsers, newUsersToday, newUsersWeek, newUsersMonth, weekUsers, monthUsers, halfYearUsers] = await Promise.all([
      prisma.user.count(),
      countUsersCreatedInRange(todayBucket.start, todayBucket.end),
      countUsersCreatedInRange(dailyBuckets[0].start, todayBucket.end),
      countUsersCreatedInRange(monthStart, todayBucket.end),
      countUsersCreatedInBuckets(dailyBuckets),
      countUsersCreatedInBuckets(weeklyBuckets),
      countUsersCreatedInBuckets(monthlyBuckets)
    ])

    const analytics = {
      totalUsers,
      newUsers: {
        today: newUsersToday,
        week: newUsersWeek,
        month: newUsersMonth
      },
      trends: {
        week: {
          labels: dailyBuckets.map(bucket => bucket.label),
          users: weekUsers
        },
        month: {
          labels: weeklyBuckets.map(bucket => bucket.label),
          users: monthUsers
        },
        halfYear: {
          labels: monthlyBuckets.map(bucket => bucket.label),
          users: halfYearUsers
        }
      }
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
    if (!userIds || userIds.length === 0) {
      return res.status(400).json({ success: false, message: '未提供用户ID' })
    }
    
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
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
      role: (user: any) => user.role === 'ADMIN' ? '超级管理员' : user.role === 'MODERATOR' ? '管理员' : '用户',
      status: (user: any) => user.status === 'active' ? '正常' : user.status === 'disabled' ? '禁用' : '封禁',
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
        level: true,
        status: true,
        url: true,
        duration: true,
        content: true,
        viewCount: true,
        studentCount: true,
        favoriteCount: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    // 字段映射
    const fieldMap: Record<string, any> = {
      title: (course: any) => course.title,
      level: (course: any) => course.level || '',
      status: (course: any) => course.status,
      url: (course: any) => course.url || '',
      duration: (course: any) => course.duration || 0,
      content: (course: any) => {
        const c = course.content || ''
        return c.length > 5000 ? c.substring(0, 5000) + '...(已截断)' : c
      },
      viewCount: (course: any) => course.viewCount || 0,
      students: (course: any) => course.studentCount || 0,
      favoriteCount: (course: any) => course.favoriteCount || 0,
      completionRate: (course: any) => 0, // 暂时返回0，后续可以通过计算获得
      createdAt: (course: any) => course.createdAt.toLocaleString('zh-CN'),
      updatedAt: (course: any) => course.updatedAt.toLocaleString('zh-CN')
    }

    // 字段标签映射
    const labelMap: Record<string, string> = {
      title: '课程标题',
      level: '难度等级',
      status: '状态',
      url: 'URL',
      duration: '时长',
      content: '内容',
      viewCount: '浏览量',
      students: '学习人数',
      favoriteCount: '收藏量',
      completionRate: '完成率',
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
      title: 30,           // 课程标题
      level: 12,           // 难度等级
      status: 10,          // 状态
      url: 40,             // URL
      duration: 10,        // 时长
      cover: 40,           // 封面
      content: 50,         // 内容
      viewCount: 12,       // 浏览量
      students: 12,        // 学习人数
      favoriteCount: 12,   // 收藏量
      completionRate: 12,  // 完成率
      createdAt: 20,       // 创建时间
      updatedAt: 20        // 更新时间
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
