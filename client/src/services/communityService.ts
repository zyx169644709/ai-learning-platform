import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = 'http://localhost:3000/api/community'

// 为社区模块创建专用 axios 实例并自动附带 JWT
const api: AxiosInstance = axios.create({ baseURL: API_BASE_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface AuthorInfo {
  id: string
  username: string
  avatar: string
  bio?: string
  joinDate: string
}

export interface Discussion {
  id: string
  title: string
  excerpt: string
  content: string
  category: 'tech' | 'experience' | 'project' | 'help'
  views: number
  replies: number
  likes: number
  author: string
  authorAvatar: string
  authorInfo: AuthorInfo
  time: string
  isLiked?: boolean
  comments?: Comment[]
}

export interface Comment {
  id: string
  content: string
  author: string
  authorAvatar: string
  authorInfo: AuthorInfo
  time: string
  likes: number
  isLiked?: boolean
}

export interface CreateDiscussionData {
  title: string
  content: string
  category: 'tech' | 'experience' | 'project' | 'help'
  author?: string
}

export interface CreateCommentData {
  content: string
  author?: string
}

// 获取所有讨论帖子
export const getDiscussions = async (category?: string, search?: string): Promise<Discussion[]> => {
  try {
    const params = new URLSearchParams()
    if (category) params.append('category', category)
    if (search) params.append('search', search)
    
    const response = await api.get(`?${params.toString()}`)
    return response.data
  } catch (error) {
    console.error('获取讨论帖子失败:', error)
    throw error
  }
}

// 创建新讨论帖子
export const createDiscussion = async (data: CreateDiscussionData): Promise<Discussion> => {
  try {
    const response = await api.post('', data)
    return response.data
  } catch (error) {
    console.error('创建讨论帖子失败:', error)
    throw error
  }
}

// 获取单个讨论帖子详情
export const getDiscussionById = async (id: string): Promise<Discussion> => {
  try {
    const response = await api.get(`/${id}`)
    return response.data
  } catch (error) {
    console.error('获取讨论帖子详情失败:', error)
    throw error
  }
}

// 创建评论
export const createComment = async (discussionId: string, data: CreateCommentData): Promise<Comment> => {
  try {
    const response = await api.post(`/${discussionId}/comments`, data)
    return response.data
  } catch (error) {
    console.error('创建评论失败:', error)
    throw error
  }
}

// 点赞讨论帖子
export const likeDiscussion = async (id: string): Promise<{ likes: number }> => {
  try {
    const response = await api.post(`/${id}/like`)
    return response.data
  } catch (error) {
    console.error('点赞讨论帖子失败:', error)
    throw error
  }
}

// 点赞评论
export const likeComment = async (id: string): Promise<{ likes: number }> => {
  try {
    const response = await api.post(`/comments/${id}/like`)
    return response.data
  } catch (error) {
    console.error('点赞评论失败:', error)
    throw error
  }
}
