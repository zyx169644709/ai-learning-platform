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
    const { category, search } = req.query
    
    let whereClause: any = {}
    
    // 按分类筛选
    if (category && category !== 'all' && typeof category === 'string') {
      whereClause.category = category.toUpperCase()
    }
    
    // 按搜索关键词筛选
    if (search && typeof search === 'string') {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // 转换数据格式以匹配前端
    const formattedDiscussions = discussions.map(discussion => ({
      id: discussion.id,
      title: discussion.title,
      excerpt: discussion.excerpt,
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
      isLiked: false, // 这里可以后续添加用户点赞状态
      comments: discussion.comments.map(comment => ({
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
      }))
    }))
    
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
    const excerpt = content.length > 100 ? content.substring(0, 100) + '...' : content
    
    // 严格从 JWT 获取 userId，不信任 body
    const finalAuthorId = getUserIdFromRequest(req)
    if (!finalAuthorId) {
      return res.status(401).json({ error: '未授权：请先登录' })
    }
    
    const discussion = await prisma.discussion.create({
      data: {
        title,
        content,
        excerpt,
        category: (category as string).toUpperCase() as any,
        authorId: finalAuthorId,
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
      excerpt: discussion.excerpt,
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
      excerpt: discussion.excerpt,
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
      isLiked: false,
      comments: discussion.comments.map(comment => ({
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
      }))
    }
    
    console.log('返回的帖子数据:', JSON.stringify(formattedDiscussion, null, 2))
    console.log('authorInfo字段:', formattedDiscussion.authorInfo)
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

// 点赞讨论帖子
export const likeDiscussion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const discussion = await prisma.discussion.findUnique({
      where: { id }
    })
    
    if (!discussion) {
      return res.status(404).json({ error: '讨论帖子不存在' })
    }
    
    const updatedDiscussion = await prisma.discussion.update({
      where: { id },
      data: { likes: discussion.likes + 1 }
    })
    
    res.json({ likes: updatedDiscussion.likes })
  } catch (error) {
    console.error('点赞讨论帖子失败:', error)
    res.status(500).json({ error: '点赞讨论帖子失败' })
  }
}

// 点赞评论
export const likeComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const comment = await prisma.comment.findUnique({
      where: { id }
    })
    
    if (!comment) {
      return res.status(404).json({ error: '评论不存在' })
    }
    
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { likes: comment.likes + 1 }
    })
    
    res.json({ likes: updatedComment.likes })
  } catch (error) {
    console.error('点赞评论失败:', error)
    res.status(500).json({ error: '点赞评论失败' })
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
