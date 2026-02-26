import { Request, Response } from 'express'
import { PrismaClient } from '../../generated/prisma'
import { formatDate } from '../utils/format'

const prisma = new PrismaClient()

// 获取资源列表
export const getResources = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, title, type, status } = req.query
    
    const where: any = {}
    
    if (title && title.toString().trim()) {
      where.title = {
        contains: title.toString().trim()
      }
    }
    if (type) {
      where.type = type as string
    }
    if (status) {
      where.status = status as string
    }
    
    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)
    
    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          cover: true,
          icon: true,
          url: true,
          type: true,
          status: true,
          viewCount: true,
          likeCount: true,
          favoriteCount: true,
          tags: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      prisma.resource.count({ where })
    ])
    
    const formattedResources = resources.map(resource => ({
      id: resource.id,
      title: resource.title,
      description: resource.description || '',
      cover: resource.cover || '',
      icon: resource.icon || '',
      url: resource.url,
      type: resource.type || 'website',
      status: resource.status || 'draft',
      viewCount: resource.viewCount || 0,
      likeCount: resource.likeCount || 0,
      favoriteCount: resource.favoriteCount || 0,
      tags: resource.tags || [],
      updatedAt: formatDate(resource.updatedAt)
    }))
    
    res.json({
      success: true,
      data: {
        items: formattedResources,
        total,
        page: Number(page),
        limit: Number(limit)
      }
    })
  } catch (error: any) {
    console.error('获取资源列表错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 获取单个资源
export const getResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const resource = await prisma.resource.findUnique({
      where: { id }
    })
    
    if (!resource) {
      return res.status(404).json({ success: false, message: '资源不存在' })
    }
    
    res.json({
      success: true,
      data: resource
    })
  } catch (error: any) {
    console.error('获取资源错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 创建资源
export const createResource = async (req: Request, res: Response) => {
  try {
    const { title, description, cover, icon, url, type, status, tags } = req.body
    
    if (!title || !url) {
      return res.status(400).json({ success: false, message: '标题和链接不能为空' })
    }
    
    const resource = await prisma.resource.create({
      data: {
        title,
        description: description || '',
        cover: cover || '',
        icon: icon || '',
        url,
        type: type || 'website',
        status: status || 'draft',
        tags: tags || []
      }
    })
    
    res.json({
      success: true,
      message: '资源创建成功',
      data: resource
    })
  } catch (error: any) {
    console.error('创建资源错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 更新资源
export const updateResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { title, description, cover, icon, url, type, status, tags } = req.body
    
    const resource = await prisma.resource.findUnique({
      where: { id }
    })
    
    if (!resource) {
      return res.status(404).json({ success: false, message: '资源不存在' })
    }
    
    const updatedResource = await prisma.resource.update({
      where: { id },
      data: {
        title: title || resource.title,
        description: description !== undefined ? description : resource.description,
        cover: cover !== undefined ? cover : resource.cover,
        icon: icon !== undefined ? icon : resource.icon,
        url: url || resource.url,
        type: type || resource.type,
        status: status || resource.status,
        tags: tags !== undefined ? tags : resource.tags
      }
    })
    
    res.json({
      success: true,
      message: '资源更新成功',
      data: updatedResource
    })
  } catch (error: any) {
    console.error('更新资源错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 删除资源
export const deleteResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const resource = await prisma.resource.findUnique({
      where: { id }
    })
    
    if (!resource) {
      return res.status(404).json({ success: false, message: '资源不存在' })
    }
    
    await prisma.resource.delete({
      where: { id }
    })
    
    res.json({
      success: true,
      message: '资源删除成功'
    })
  } catch (error: any) {
    console.error('删除资源错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 增加浏览量（公开接口）
export const incrementResourceView = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await prisma.resource.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    })
    res.json({ success: true })
  } catch {
    res.status(404).json({ success: false, message: '资源不存在' })
  }
}

// 点赞/取消点赞（公开接口，简单实现：每次调用 +1）
export const likeResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const resource = await prisma.resource.update({
      where: { id },
      data: { likeCount: { increment: 1 } },
      select: { likeCount: true }
    })
    res.json({ success: true, data: { likeCount: resource.likeCount } })
  } catch {
    res.status(404).json({ success: false, message: '资源不存在' })
  }
}

// 批量删除资源
export const batchDeleteResources = async (req: Request, res: Response) => {
  try {
    const { resourceIds } = req.body
    const result = await prisma.resource.deleteMany({
      where: { id: { in: resourceIds } }
    })
    res.json({ 
      success: true, 
      message: `成功删除 ${result.count} 个资源`,
      data: { deletedCount: result.count }
    })
  } catch (error: any) {
    console.error('批量删除资源错误:', error)
    res.status(500).json({ success: false, message: '服务器错误', error: error.message })
  }
}

// 批量发布资源
export const batchPublishResources = async (req: Request, res: Response) => {
  try {
    const { resourceIds } = req.body
    const result = await prisma.resource.updateMany({
      where: {
        id: { in: resourceIds },
        status: 'draft'
      },
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

// CommonJS exports for compatibility
module.exports = {
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  incrementResourceView,
  likeResource,
  batchDeleteResources,
  batchPublishResources
}


