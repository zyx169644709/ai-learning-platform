import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
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

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: any) => {
    console.error('API请求错误:', error)

    if (error.response?.status === 401) {
      // token过期或无效，清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      // 不要直接跳转，让组件处理
      console.log('Token无效，已清除本地存储')
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
      const response: AxiosResponse<ApiResponse<{ token: string; user: UserInfo }>> = await api.post('/user/login', credentials)
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
