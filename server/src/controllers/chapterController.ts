import { Request, Response } from 'express'
import { PrismaClient } from '../../generated/prisma'
import { formatDate } from '../utils/format'

const prisma = new PrismaClient()

// 获取章节列表
export const getChapters = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, type, title, status, parentId } = req.query
    
    const where: any = {}
    
    // 过滤空字符串
    const requestType = type && type.toString().trim() ? (type as string) : ''
    if (requestType) {
      where.type = requestType
    } else {
      where.type = 'chapter'  // 默认只查章节
    }
    if (title && title.toString().trim()) {
      where.title = {
        contains: title.toString().trim()
      }
    }
    if (status && status.toString().trim()) {
      where.status = status as string
    }
    if (parentId !== undefined && parentId !== '') {
      where.parentId = parentId === 'null' ? null : parentId as string
    }
    
    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)

    // 请求小节：返回平铺的小节列表（带所属章节信息）
    if (requestType === 'section') {
      const sections = await prisma.chapter.findMany({ where })

      // 构建父章节映射表（order/title），避免依赖 Prisma relation include
      const parentIds = Array.from(
        new Set(sections.map((s) => s.parentId).filter(Boolean) as string[])
      )

      const parents = parentIds.length
        ? await prisma.chapter.findMany({
            where: { id: { in: parentIds } },
            select: { id: true, title: true, order: true }
          })
        : []

      const parentMap = new Map<string, { title: string; order: number }>()
      for (const p of parents) {
        parentMap.set(p.id, { title: p.title, order: p.order ?? 0 })
      }

      // 强制按章节顺序 + 章节内顺序排序
      const sortedSections = sections.sort((a: any, b: any) => {
        const aParentOrder = parentMap.get(a.parentId || '')?.order ?? 0
        const bParentOrder = parentMap.get(b.parentId || '')?.order ?? 0
        if (aParentOrder !== bParentOrder) return aParentOrder - bParentOrder

        const aOrder = a.order ?? 0
        const bOrder = b.order ?? 0
        if (aOrder !== bOrder) return aOrder - bOrder

        return (a.title || '').localeCompare(b.title || '')
      })

      const total = sortedSections.length
      const paged = sortedSections.slice(skip, skip + take)

      const formattedSections = paged.map((section) => {
        const chapterNo = parentMap.get(section.parentId || '')?.order || 0
        const sectionNo = section.order || 0
        return {
          id: section.id,
          title: section.title,
          type: section.type,
          content: section.content || '',
          excerpt: section.excerpt || '',
          order: section.order,
          duration: section.duration || '',
          videoUrl: section.videoUrl || '',
          status: section.status || 'draft',
          viewCount: section.viewCount || 0,
          favoriteCount: section.favoriteCount || 0,
          parentId: section.parentId,
          parentTitle: parentMap.get(section.parentId || '')?.title || '',
          parentOrder: chapterNo,
          updatedAt: formatDate(section.updatedAt),
          displayOrder: `${chapterNo}-${sectionNo}`
        }
      })

      return res.json({
        success: true,
        data: {
          items: formattedSections,
          total,
          page: Number(page),
          limit: Number(limit)
        }
      })
    }
    
    // 章节列表接口默认返回“章节 + 该章节的小节”，而不是平铺列表
    // 先查章节（父级），再 include children
    const chapterWhere: any = {
      ...where,
      type: 'chapter'
    }
    delete chapterWhere.parentId

    // 当有状态筛选时，同时返回"章节本身匹配状态"或"有匹配状态子小节的章节"
    const statusFilter = where.status
    if (statusFilter) {
      delete chapterWhere.status
      chapterWhere.OR = [
        { status: statusFilter },
        { children: { some: { status: statusFilter, type: 'section' } } }
      ]
    }

    const [chapters, total] = await Promise.all([
      prisma.chapter.findMany({
        where: chapterWhere,
        orderBy: { order: 'asc' },
        skip,
        take,
        include: {
          children: {
            select: {
              id: true,
              title: true,
              content: true,
              excerpt: true,
              order: true,
              duration: true,
              videoUrl: true,
              status: true,
              viewCount: true,
              favoriteCount: true,
              parentId: true,
              updatedAt: true,
              createdAt: true,
              type: true
            },
            orderBy: { order: 'asc' }
          }
        }
      }),
      prisma.chapter.count({ where: chapterWhere })
    ])

    const formattedChapters = chapters.map((chapter) => {
      const chapterNo = chapter.order || 0
      return {
        id: chapter.id,
        title: chapter.title,
        type: chapter.type,
        status: chapter.status || 'draft',
        updatedAt: formatDate(chapter.updatedAt),
        displayOrder: `${chapterNo}`,
        childrenCount: chapter.children?.length || 0,
        children: (chapter.children || []).map((section) => {
          const sectionNo = section.order || 0
          return {
            id: section.id,
            title: section.title,
            type: section.type,
            content: section.content || '',
            excerpt: section.excerpt || '',
            order: section.order,
            duration: section.duration || '',
            videoUrl: section.videoUrl || '',
            status: section.status || 'draft',
            viewCount: section.viewCount || 0,
            favoriteCount: section.favoriteCount || 0,
            parentId: section.parentId,
            parentTitle: chapter.title,
            updatedAt: formatDate(section.updatedAt),
            displayOrder: `${chapterNo}-${sectionNo}`
          }
        })
      }
    })
    
    res.json({
      success: true,
      data: {
        items: formattedChapters,
        total,
        page: Number(page),
        limit: Number(limit)
      }
    })
  } catch (error: any) {
    console.error('获取章节列表错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 获取单个章节
export const getChapter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            title: true
          }
        },
        children: {
          select: {
            id: true,
            title: true,
            order: true
          },
          orderBy: { order: 'asc' }
        }
      }
    })
    
    if (!chapter) {
      return res.status(404).json({ success: false, message: '章节不存在' })
    }
    
    res.json({
      success: true,
      data: {
        ...chapter,
        parentTitle: chapter.parent?.title || '',
        children: chapter.children || []
      }
    })
  } catch (error: any) {
    console.error('获取章节错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 创建章节
export const createChapter = async (req: Request, res: Response) => {
  try {
    const { title, content, excerpt, order, duration, videoUrl, status, type, parentId } = req.body
    
    if (!title) {
      return res.status(400).json({ success: false, message: '标题不能为空' })
    }
    
    // 如果有 parentId，检查父章节是否存在
    if (parentId) {
      const parent = await prisma.chapter.findUnique({
        where: { id: parentId }
      })
      
      if (!parent) {
        return res.status(404).json({ success: false, message: '父章节不存在' })
      }
    }
    
    const chapter = await prisma.chapter.create({
      data: {
        title,
        content: content || '',
        excerpt: excerpt || '',
        order: order || 0,
        duration: duration || '',
        videoUrl: videoUrl || '',
        status: status || 'draft',
        type: type || 'section',
        parentId: parentId || null
      }
    })
    
    res.json({
      success: true,
      message: '章节创建成功',
      data: chapter
    })
  } catch (error: any) {
    console.error('创建章节错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 更新章节
export const updateChapter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { title, content, excerpt, order, duration, videoUrl, status, type, parentId } = req.body
    
    const chapter = await prisma.chapter.findUnique({
      where: { id }
    })
    
    if (!chapter) {
      return res.status(404).json({ success: false, message: '章节不存在' })
    }
    
    const updatedChapter = await prisma.chapter.update({
      where: { id },
      data: {
        title: title || chapter.title,
        content: content !== undefined ? content : chapter.content,
        excerpt: excerpt !== undefined ? excerpt : chapter.excerpt,
        order: order !== undefined ? order : chapter.order,
        duration: duration !== undefined ? duration : chapter.duration,
        videoUrl: videoUrl !== undefined ? videoUrl : chapter.videoUrl,
        status: status || chapter.status,
        type: type || chapter.type,
        parentId: parentId !== undefined ? parentId : chapter.parentId
      }
    })
    
    // 级联状态更新：如果是章节且 cascadeStatus=true，则将所有子小节同步为相同状态
    const { cascadeStatus } = req.body
    const shouldCascade = cascadeStatus === true || cascadeStatus === 'true'
    if (chapter.type === 'chapter' && status && shouldCascade) {
      await prisma.chapter.updateMany({
        where: { parentId: id },
        data: { status }
      })
    }
    
    res.json({
      success: true,
      message: '章节更新成功',
      data: updatedChapter
    })
  } catch (error: any) {
    console.error('更新章节错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 删除章节
export const deleteChapter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const chapter = await prisma.chapter.findUnique({
      where: { id }
    })
    
    if (!chapter) {
      return res.status(404).json({ success: false, message: '章节不存在' })
    }
    
    // 如果是章节，先删除所有子小节
    if (chapter.type === 'chapter') {
      await prisma.chapter.deleteMany({
        where: { parentId: id }
      })
    }

    await prisma.chapter.delete({
      where: { id }
    })
    
    res.json({
      success: true,
      message: '章节删除成功'
    })
  } catch (error: any) {
    console.error('删除章节错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 批量删除章节
export const batchDeleteChapters = async (req: Request, res: Response) => {
  try {
    const { chapterIds } = req.body
    
    // 先删除所有作为子小节的章节
    await prisma.chapter.deleteMany({
      where: {
        id: { in: chapterIds },
        type: 'section'
      }
    })
    
    // 再删除作为父章节的章节（会级联删除子小节）
    const result = await prisma.chapter.deleteMany({
      where: {
        id: { in: chapterIds },
        type: 'chapter'
      }
    })
    
    const totalDeleted = result.count + (await prisma.chapter.count({
      where: {
        id: { in: chapterIds },
        type: 'section'
      }
    }))
    
    res.json({ 
      success: true, 
      message: `成功删除 ${totalDeleted} 个章节`,
      data: { deletedCount: totalDeleted }
    })
  } catch (error: any) {
    console.error('批量删除章节错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 批量发布章节
export const batchPublishChapters = async (req: Request, res: Response) => {
  try {
    const { chapterIds } = req.body
    
    const result = await prisma.chapter.updateMany({
      where: {
        id: { in: chapterIds },
        status: 'draft'
      },
      data: { status: 'published' }
    })
    
    res.json({ 
      success: true, 
      message: `成功发布 ${result.count} 个章节`,
      data: { publishedCount: result.count }
    })
  } catch (error: any) {
    console.error('批量发布章节错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}
