import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// 创建axios实例
// 开发环境：使用 Vite 代理（/api -> http://localhost:3000）
// 生产环境：使用环境变量 VITE_API_BASE_URL（例如 https://yourdomain.com/api）
const apiBaseURL = (import.meta as any)?.env?.VITE_API_BASE_URL || '/api'

const api: AxiosInstance = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: any) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 是否正在刷新 token 的标志
let isRefreshing = false
// 存储等待刷新的请求
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (error?: any) => void
}> = []

// 处理等待队列
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  
  failedQueue = []
}

// 响应拦截器 - 处理错误和自动刷新
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: any) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 如果正在刷新，将请求加入队列
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('没有 refresh token')
        }

        // 尝试刷新 token
        const response = await api.post('/user/refresh-token', {
          refreshToken
        })

        if (response.data.success) {
          const newToken = response.data.data!.token
          localStorage.setItem('token', newToken)
          
          // 处理等待队列
          processQueue(null, newToken)
          
          // 重试原始请求
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        } else {
          throw new Error('刷新 token 失败')
        }
      } catch (refreshError) {
        // 刷新失败，清除本地存储并跳转到登录页
        console.error('Token 刷新失败:', refreshError)
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('userInfo')
        
        // 处理等待队列
        processQueue(refreshError, null)
        
        // 跳转到登录页
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    } else if (error.response?.status === 413) {
      // 请求体过大
      console.error('上传文件过大')
    } else if (error.response?.status >= 500) {
      // 服务器错误
      console.error('服务器内部错误:', error.response?.data)
    }

    return Promise.reject(error)
  }
)

interface LoginCredentials {
  username: string;
  password: string;
}

interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
  };
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
}

interface UserInfo {
  id: number;
  username: string;
  avatar?: string;
  email?: string;
  createdAt: string;
  role?: string;
  lastLoginAt?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

interface PasswordData {
  oldPassword: string;
  newPassword: string;
}

export const userService = {
  // 用户登录
  async login(credentials: LoginCredentials) {
    try {
      const response: AxiosResponse<ApiResponse<{ token: string; refreshToken: string; user: UserInfo }>> = await api.post('/user/login', credentials)
      return response.data
    } catch (error: any) {
      console.error('登录请求失败:', error)
      throw error
    }
  },

  // 用户注册
  async register(userData: RegisterData) {
    try {
      const response: AxiosResponse<ApiResponse> = await api.post('/user/register', userData)
      return response.data
    } catch (error: any) {
      console.error('注册请求失败:', error)
      throw error
    }
  },

  // 获取用户信息
  async getProfile() {
    try {
      const response: AxiosResponse<ApiResponse<{ user: UserInfo }>> = await api.get('/user/profile')
      return response.data
    } catch (error: any) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  },

  // 更新用户信息
  async updateProfile(userData: Partial<UserInfo>) {
    try {
      const response: AxiosResponse<ApiResponse<{ user: UserInfo }>> = await api.put('/user/profile', userData)
      return response.data
    } catch (error: any) {
      console.error('更新用户信息失败:', error)
      throw error
    }
  },

  // 修改密码
  async changePassword(passwordData: PasswordData) {
    try {
      const response: AxiosResponse<ApiResponse> = await api.put('/user/change-password', passwordData)
      return response.data
    } catch (error: any) {
      console.error('修改密码失败:', error)
      throw error
    }
  },

  // 刷新 token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('没有 refresh token')
      }
      
      const response: AxiosResponse<RefreshTokenResponse> = await api.post('/user/refresh-token', {
        refreshToken
      })
      return response.data
    } catch (error: any) {
      console.error('刷新 token 失败:', error)
      throw error
    }
  },

  // 用户登出
  async logout() {
    try {
      const response: AxiosResponse<ApiResponse> = await api.post('/user/logout')
      return response.data
    } catch (error: any) {
      console.error('登出请求失败:', error)
      // 即使请求失败也不抛出错误，因为本地清理更重要
      return { success: true, message: '登出成功' }
    }
  }
}

export default api
