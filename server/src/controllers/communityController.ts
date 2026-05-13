import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '../../generated/prisma'

const prisma = new PrismaClient()

// 从 JWT 中解析 userId（支持 auth 中间件已注入 req.user 的情况）
function getUserIdFromRequest(req: Request): string | null {
  const anyReq = req as unknown as { user?: { id?: string } }
  if (anyReq.user?.id) return anyReq.user.id

  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) return null
  const token = auth.slice('Bearer '.length)
  try {
    // 与用户模块保持一致的密钥来源与默认值
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    const payload = jwt.verify(token, secret) as { id?: string; userId?: string; sub?: string }
    return payload.id || payload.userId || (payload.sub as string) || null
  } catch {
    return null
  }
}

// 获取所有讨论帖子
export const getDiscussions = async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromRequest(req)
    const { category, search } = req.query
    
    let whereClause: any = { status: 'published' }
    
    // 按分类筛选
    if (category && category !== 'all' && typeof category === 'string') {
      whereClause.category = category.toUpperCase()
    }
    
    // 按搜索关键词筛选
    if (search && typeof search === 'string') {
      whereClause.OR = [
        { title: { contains: search } },
        { content: { contains: search } }
      ]
    }
    
    const discussions = await prisma.discussion.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            bio: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            comments: { where: { status: 'visible' } }
          }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    })
    
    // 转换数据格式以匹配前端
    const formattedDiscussions = await Promise.all(discussions.map(async discussion => ({
      id: discussion.id,
      title: discussion.title,
      excerpt: discussion.content.length > 100 ? discussion.content.substring(0, 100) + '...' : discussion.content,
      content: discussion.content,
      category: discussion.category.toLowerCase(),
      isPinned: discussion.isPinned,
      views: discussion.views,
      replies: (discussion as any)._count?.comments ?? 0,
      likes: discussion.likes,
      author: discussion.author?.username || '匿名用户',
      authorAvatar: discussion.author?.avatar || null,
      authorInfo: {
        id: discussion.author?.id || 'temp-id',
        username: discussion.author?.username || '匿名用户',
        avatar: discussion.author?.avatar || null,
        bio: discussion.author?.bio || '这是一个活跃的社区成员',
        joinDate: discussion.author?.createdAt ? formatTimeAgo(discussion.author.createdAt) : '未知时间'
      },
      time: formatTimeAgo(discussion.createdAt),
      createdAt: discussion.createdAt,
      isLiked: userId
        ? !!(await prisma.discussionLike.findUnique({ where: { userId_discussionId: { userId, discussionId: discussion.id } } }))
        : false
    })))
    
    res.json(formattedDiscussions)
  } catch (error) {
    console.error('获取讨论帖子失败:', error)
    res.status(500).json({ error: '获取讨论帖子失败' })
  }
}

// 创建新讨论帖子
export const createDiscussion = async (req: Request, res: Response) => {
  try {
    const { title, content, category } = req.body
    
    if (!title || !content || !category) {
      return res.status(400).json({ error: '标题、内容和分类不能为空' })
    }
    
    // 生成摘要（取内容前100个字符）
    // 严格从 JWT 获取 userId，不信任 body
    const finalAuthorId = getUserIdFromRequest(req)
    if (!finalAuthorId) {
      return res.status(401).json({ error: '未授权：请先登录' })
    }
    
    const discussion = await prisma.discussion.create({
      data: {
        title,
        content,
        category: (category as string).toUpperCase() as any,
        authorId: finalAuthorId,
        status: 'pending',  // 默认状态为待审核
        views: 0,
        likes: 0
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            bio: true,
            createdAt: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar: true,
                bio: true,
                createdAt: true
              }
            }
          }
        }
      }
    })
    
    // 转换数据格式
    const formattedDiscussion = {
      id: discussion.id,
      title: discussion.title,
      excerpt: discussion.content.length > 100 ? discussion.content.substring(0, 100) + '...' : discussion.content,
      content: discussion.content,
      category: discussion.category.toLowerCase(),
      views: discussion.views,
      replies: discussion.comments.length,
      likes: discussion.likes,
      author: discussion.author?.username || '匿名用户',
      authorAvatar: discussion.author?.avatar || null,
      authorInfo: {
        id: discussion.author?.id || 'temp-id',
        username: discussion.author?.username || '匿名用户',
        avatar: discussion.author?.avatar || null,
        bio: discussion.author?.bio || '这是一个活跃的社区成员',
        joinDate: discussion.author?.createdAt ? formatTimeAgo(discussion.author.createdAt) : '未知时间'
      },
      time: formatTimeAgo(discussion.createdAt),
      createdAt: discussion.createdAt,
      isLiked: false,
      comments: []
    }
    
    res.status(201).json(formattedDiscussion)
  } catch (error) {
    console.error('创建讨论帖子失败:', error)
    res.status(500).json({ error: '创建讨论帖子失败' })
  }
}

// 获取单个讨论帖子详情
export const getDiscussionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = getUserIdFromRequest(req)
    
    const discussion = await prisma.discussion.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            bio: true,
            createdAt: true
          }
        },
        comments: {
          where: { status: 'visible' },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatar: true,
                bio: true,
                createdAt: true
              }
            }
          }
        }
      }
    })
    
    if (!discussion) {
      return res.status(404).json({ error: '讨论帖子不存在' })
    }
    
    // 增加浏览量
    await prisma.discussion.update({
      where: { id },
      data: { views: discussion.views + 1 }
    })
    
    // 转换数据格式
    const formattedDiscussion = {
      id: discussion.id,
      title: discussion.title,
      excerpt: discussion.content.length > 100 ? discussion.content.substring(0, 100) + '...' : discussion.content,
      content: discussion.content,
      category: discussion.category.toLowerCase(),
      views: discussion.views + 1,
      replies: discussion.comments.length,
      likes: discussion.likes,
      author: discussion.author?.username || '匿名用户',
      authorAvatar: discussion.author?.avatar || null,
      authorInfo: {
        id: discussion.author?.id || 'temp-id',
        username: discussion.author?.username || '匿名用户',
        avatar: discussion.author?.avatar || null,
        bio: discussion.author?.bio || '这是一个活跃的社区成员',
        joinDate: discussion.author?.createdAt ? formatTimeAgo(discussion.author.createdAt) : '未知时间'
      },
      time: formatTimeAgo(discussion.createdAt),
      createdAt: discussion.createdAt,
      isLiked: userId
        ? !!(await prisma.discussionLike.findUnique({ where: { userId_discussionId: { userId, discussionId: discussion.id } } }))
        : false,
      comments: await Promise.all(discussion.comments.map(async comment => ({
        id: comment.id,
        content: comment.content,
        author: comment.author?.username || '匿名用户',
        authorAvatar: comment.author?.avatar || null,
        authorInfo: {
          id: comment.author?.id || 'temp-id',
          username: comment.author?.username || '匿名用户',
          avatar: comment.author?.avatar || null,
          bio: comment.author?.bio || '这是一个活跃的社区成员',
          joinDate: comment.author?.createdAt ? formatTimeAgo(comment.author.createdAt) : '未知时间'
        },
        time: formatTimeAgo(comment.createdAt),
        likes: comment.likes,
        isLiked: userId
          ? !!(await prisma.commentLike.findUnique({ where: { userId_commentId: { userId, commentId: comment.id } } }))
          : false
      })))
    }
    
    res.json(formattedDiscussion)
  } catch (error) {
    console.error('获取讨论帖子详情失败:', error)
    res.status(500).json({ error: '获取讨论帖子详情失败' })
  }
}

// 创建评论
export const createComment = async (req: Request, res: Response) => {
  try {
    const { discussionId } = req.params
    const { content } = req.body
    
    if (!content) {
      return res.status(400).json({ error: '评论内容不能为空' })
    }
    
    // 检查讨论帖子是否存在
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId }
    })
    
    if (!discussion) {
      return res.status(404).json({ error: '讨论帖子不存在' })
    }
    
    // 严格从 JWT 获取 userId
    const finalAuthorId = getUserIdFromRequest(req)
    if (!finalAuthorId) {
      return res.status(401).json({ error: '未授权：请先登录' })
    }
    
    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: finalAuthorId,
        discussionId,
        status: 'pending',  // 默认状态为待审核
        likes: 0
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            bio: true,
            createdAt: true
          }
        }
      }
    })
    
    // 转换数据格式
    const formattedComment = {
      id: comment.id,
      content: comment.content,
      author: comment.author?.username || '匿名用户',
      authorAvatar: comment.author?.avatar || null,
      authorInfo: {
        id: comment.author?.id || 'temp-id',
        username: comment.author?.username || '匿名用户',
        avatar: comment.author?.avatar || null,
        bio: comment.author?.bio || '这是一个活跃的社区成员',
        joinDate: comment.author?.createdAt ? formatTimeAgo(comment.author.createdAt) : '未知时间'
      },
      time: formatTimeAgo(comment.createdAt),
      likes: comment.likes,
      isLiked: false
    }
    
    res.status(201).json(formattedComment)
  } catch (error) {
    console.error('创建评论失败:', error)
    res.status(500).json({ error: '创建评论失败' })
  }
}

// 点赞/取消点赞讨论帖子
export const likeDiscussion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return res.status(401).json({ error: '未授权：请先登录' })
    }

    const discussion = await prisma.discussion.findUnique({ where: { id } })
    if (!discussion) {
      return res.status(404).json({ error: '讨论帖子不存在' })
    }

    const existing = await prisma.discussionLike.findUnique({
      where: { userId_discussionId: { userId, discussionId: id } }
    })

    let isLiked: boolean
    let updatedLikes: number

    if (existing) {
      // 已点赞 → 取消
      await prisma.discussionLike.delete({ where: { userId_discussionId: { userId, discussionId: id } } })
      const updated = await prisma.discussion.update({ where: { id }, data: { likes: Math.max(0, discussion.likes - 1) } })
      isLiked = false
      updatedLikes = updated.likes
    } else {
      // 未点赞 → 点赞
      await prisma.discussionLike.create({ data: { userId, discussionId: id } })
      const updated = await prisma.discussion.update({ where: { id }, data: { likes: discussion.likes + 1 } })
      isLiked = true
      updatedLikes = updated.likes
    }

    res.json({ likes: updatedLikes, isLiked })
  } catch (error) {
    console.error('点赞讨论帖子失败:', error)
    res.status(500).json({ error: '点赞讨论帖子失败' })
  }
}

// 点赞/取消点赞评论
export const likeComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return res.status(401).json({ error: '未授权：请先登录' })
    }

    const comment = await prisma.comment.findUnique({ where: { id } })
    if (!comment) {
      return res.status(404).json({ error: '评论不存在' })
    }

    const existing = await prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId: id } }
    })

    let isLiked: boolean
    let updatedLikes: number

    if (existing) {
      await prisma.commentLike.delete({ where: { userId_commentId: { userId, commentId: id } } })
      const updated = await prisma.comment.update({ where: { id }, data: { likes: Math.max(0, comment.likes - 1) } })
      isLiked = false
      updatedLikes = updated.likes
    } else {
      await prisma.commentLike.create({ data: { userId, commentId: id } })
      const updated = await prisma.comment.update({ where: { id }, data: { likes: comment.likes + 1 } })
      isLiked = true
      updatedLikes = updated.likes
    }

    res.json({ likes: updatedLikes, isLiked })
  } catch (error) {
    console.error('点赞评论失败:', error)
    res.status(500).json({ error: '点赞评论失败' })
  }
}

// ==================== 管理员专用接口 ====================

// 管理员获取帖子列表（带分页、筛选）
export const adminGetDiscussions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, category, status, keyword } = req.query
    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)

    const where: any = {}
    if (category && category !== 'all') where.category = (category as string).toUpperCase()
    if (status && status !== 'all') where.status = status as string
    if (keyword) where.OR = [{ title: { contains: keyword as string } }, { content: { contains: keyword as string } }]

    const [discussions, total] = await Promise.all([
      prisma.discussion.findMany({
        where,
        skip,
        take,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        include: {
          author: { select: { id: true, username: true, avatar: true } },
          _count: { select: { comments: true } }
        }
      }),
      prisma.discussion.count({ where })
    ])

    res.json({
      success: true,
      data: {
        items: discussions.map(d => ({
          id: d.id,
          title: d.title,
          content: d.content,
          category: d.category,
          status: d.status,
          isPinned: d.isPinned,
          views: d.views,
          likes: d.likes,
          commentCount: d._count.comments,
          author: d.author?.username || '匿名用户',
          authorId: d.author?.id,
          authorAvatar: d.author?.avatar,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt
        })),
        total,
        page: Number(page),
        limit: Number(limit)
      }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: '获取帖子列表失败', error: error.message })
  }
}

// 管理员获取评论列表（带分页、筛选）
export const adminGetComments = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, keyword, discussionId } = req.query
    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)

    const where: any = {}
    if (status && status !== 'all') where.status = status as string
    if (discussionId) where.discussionId = discussionId as string
    if (keyword) where.content = { contains: keyword as string }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, username: true, avatar: true } },
          discussion: { select: { id: true, title: true } }
        }
      }),
      prisma.comment.count({ where })
    ])

    res.json({
      success: true,
      data: {
        items: comments.map(c => ({
          id: c.id,
          content: c.content,
          status: c.status,
          likes: c.likes,
          author: c.author?.username || '匿名用户',
          authorId: c.author?.id,
          authorAvatar: c.author?.avatar,
          discussionId: c.discussionId,
          discussionTitle: c.discussion?.title || '-',
          createdAt: c.createdAt,
          updatedAt: c.updatedAt
        })),
        total,
        page: Number(page),
        limit: Number(limit)
      }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: '获取评论列表失败', error: error.message })
  }
}

// 审核通过讨论帖子
export const approveDiscussion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const discussion = await prisma.discussion.findUnique({ where: { id } })
    if (!discussion) return res.status(404).json({ success: false, message: '帖子不存在' })

    await prisma.discussion.update({ 
      where: { id }, 
      data: { status: 'published' } 
    })
    res.json({ success: true, message: '帖子审核通过', data: { status: 'published' } })
  } catch (error: any) {
    res.status(500).json({ success: false, message: '审核失败', error: error.message })
  }
}

// 拒绝讨论帖子
export const rejectDiscussion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const discussion = await prisma.discussion.findUnique({ where: { id } })
    if (!discussion) return res.status(404).json({ success: false, message: '帖子不存在' })

    await prisma.discussion.update({ 
      where: { id }, 
      data: { status: 'hidden' } 
    })
    res.json({ success: true, message: '帖子已拒绝', data: { status: 'hidden' } })
  } catch (error: any) {
    res.status(500).json({ success: false, message: '操作失败', error: error.message })
  }
}

// 审核通过评论
export const approveComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const comment = await prisma.comment.findUnique({ where: { id } })
    if (!comment) return res.status(404).json({ success: false, message: '评论不存在' })

    await prisma.comment.update({ 
      where: { id }, 
      data: { status: 'visible' } 
    })
    res.json({ success: true, message: '评论审核通过', data: { status: 'visible' } })
  } catch (error: any) {
    res.status(500).json({ success: false, message: '审核失败', error: error.message })
  }
}

// 拒绝评论
export const rejectComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const comment = await prisma.comment.findUnique({ where: { id } })
    if (!comment) return res.status(404).json({ success: false, message: '评论不存在' })

    await prisma.comment.update({ 
      where: { id }, 
      data: { status: 'hidden' } 
    })
    res.json({ success: true, message: '评论已拒绝', data: { status: 'hidden' } })
  } catch (error: any) {
    res.status(500).json({ success: false, message: '操作失败', error: error.message })
  }
}

// 隐藏/显示帖子
export const toggleDiscussionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const discussion = await prisma.discussion.findUnique({ where: { id } })
    if (!discussion) return res.status(404).json({ success: false, message: '帖子不存在' })

    const newStatus = discussion.status === 'published' ? 'hidden' : 'published'
    await prisma.discussion.update({ where: { id }, data: { status: newStatus } })
    res.json({ success: true, message: newStatus === 'hidden' ? '帖子已隐藏' : '帖子已显示', data: { status: newStatus } })
  } catch (error: any) {
    res.status(500).json({ success: false, message: '操作失败', error: error.message })
  }
}

// 置顶/取消置顶帖子
export const toggleDiscussionPin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const discussion = await prisma.discussion.findUnique({ where: { id } })
    if (!discussion) return res.status(404).json({ success: false, message: '帖子不存在' })

    const newPinned = !discussion.isPinned
    await prisma.discussion.update({ where: { id }, data: { isPinned: newPinned } })
    res.json({ success: true, message: newPinned ? '帖子已置顶' : '已取消置顶', data: { isPinned: newPinned } })
  } catch (error: any) {
    res.status(500).json({ success: false, message: '操作失败', error: error.message })
  }
}

// 删除帖子（管理员）
export const adminDeleteDiscussion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const discussion = await prisma.discussion.findUnique({ where: { id } })
    if (!discussion) return res.status(404).json({ success: false, message: '帖子不存在' })

    await prisma.discussion.delete({ where: { id } })
    res.json({ success: true, message: '帖子已删除' })
  } catch (error: any) {
    res.status(500).json({ success: false, message: '删除失败', error: error.message })
  }
}

// 批量删除帖子
export const batchDeleteDiscussions = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: '请提供要删除的帖子ID列表' })
    }
    const result = await prisma.discussion.deleteMany({ where: { id: { in: ids } } })
    res.json({ success: true, message: `成功删除 ${result.count} 篇帖子`, data: { deletedCount: result.count } })
  } catch (error: any) {
    res.status(500).json({ success: false, message: '批量删除失败', error: error.message })
  }
}

// 隐藏/显示评论
export const toggleCommentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const comment = await prisma.comment.findUnique({ where: { id } })
    if (!comment) return res.status(404).json({ success: false, message: '评论不存在' })

    const newStatus = comment.status === 'hidden' ? 'visible' : 'hidden'
    await prisma.comment.update({ where: { id }, data: { status: newStatus } })
    res.json({ success: true, message: newStatus === 'hidden' ? '评论已隐藏' : '评论已显示', data: { status: newStatus } })
  } catch (error: any) {
    res.status(500).json({ success: false, message: '操作失败', error: error.message })
  }
}

// 删除评论（管理员）
export const adminDeleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const comment = await prisma.comment.findUnique({ where: { id } })
    if (!comment) return res.status(404).json({ success: false, message: '评论不存在' })

    await prisma.comment.delete({ where: { id } })
    res.json({ success: true, message: '评论已删除' })
  } catch (error: any) {
    res.status(500).json({ success: false, message: '删除失败', error: error.message })
  }
}

// 批量删除评论
export const batchDeleteComments = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: '请提供要删除的评论ID列表' })
    }
    const result = await prisma.comment.deleteMany({ where: { id: { in: ids } } })
    res.json({ success: true, message: `成功删除 ${result.count} 条评论`, data: { deletedCount: result.count } })
  } catch (error: any) {
    res.status(500).json({ success: false, message: '批量删除失败', error: error.message })
  }
}

// 管理员创建帖子
export const adminCreateDiscussion = async (req: Request, res: Response) => {
  try {
    const { title, content, category } = req.body
    if (!title || !content || !category) {
      return res.status(400).json({ success: false, message: '标题、内容和分类不能为空' })
    }
    const authorId = getUserIdFromRequest(req)
    if (!authorId) return res.status(401).json({ success: false, message: '未授权' })

    const discussion = await prisma.discussion.create({
      data: {
        title,
        content,
        category: (category as string).toUpperCase() as any,
        authorId,
        status: 'pending',  // 默认状态为待审核
        views: 0,
        likes: 0
      },
      include: { author: { select: { id: true, username: true, avatar: true } } }
    })
    res.status(201).json({
      success: true,
      message: '帖子创建成功',
      data: {
        id: discussion.id,
        title: discussion.title,
        category: discussion.category,
        author: discussion.author?.username || '管理员',
        createdAt: discussion.createdAt,
        views: 0,
        likes: 0,
        commentCount: 0,
        status: discussion.status,
        isPinned: false
      }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: '创建帖子失败', error: error.message })
  }
}

// 管理员编辑帖子
export const adminUpdateDiscussion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { title, content, category } = req.body
    const discussion = await prisma.discussion.findUnique({ where: { id } })
    if (!discussion) return res.status(404).json({ success: false, message: '帖子不存在' })

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (category !== undefined) updateData.category = (category as string).toUpperCase() as any

    const updated = await prisma.discussion.update({
      where: { id },
      data: updateData,
      include: { author: { select: { id: true, username: true, avatar: true } } }
    })
    res.json({
      success: true,
      message: '帖子更新成功',
      data: {
        id: updated.id,
        title: updated.title,
        category: updated.category,
        author: updated.author?.username || '管理员',
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt
      }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: '更新帖子失败', error: error.message })
  }
}

// 管理员创建评论
export const adminCreateComment = async (req: Request, res: Response) => {
  try {
    const { discussionId, content } = req.body
    if (!discussionId || !content) {
      return res.status(400).json({ success: false, message: '所属帖子和评论内容不能为空' })
    }
    const discussion = await prisma.discussion.findUnique({ where: { id: discussionId } })
    if (!discussion) return res.status(404).json({ success: false, message: '帖子不存在' })

    const authorId = getUserIdFromRequest(req)
    if (!authorId) return res.status(401).json({ success: false, message: '未授权' })

    const comment = await prisma.comment.create({
      data: { content, authorId, discussionId, status: 'pending', likes: 0 },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        discussion: { select: { id: true, title: true } }
      }
    })
    res.status(201).json({
      success: true,
      message: '评论创建成功',
      data: {
        id: comment.id,
        content: comment.content,
        author: comment.author?.username || '管理员',
        discussionTitle: comment.discussion?.title || '',
        discussionId: comment.discussionId,
        likes: 0,
        createdAt: comment.createdAt,
        status: comment.status
      }
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: '创建评论失败', error: error.message })
  }
}

// 格式化时间显示
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return '刚刚'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} 分钟前`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} 小时前`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} 天前`
  }
}
