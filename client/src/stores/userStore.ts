// src/stores/userStore.ts
import { defineStore } from 'pinia'
import { userService } from '@/services/userService.ts'

interface UserInfo {
  id: number;
  username: string;
  avatar?: string;
  email?: string;
  createdAt: string;
  role?: string;
  lastLoginAt?: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null as UserInfo | null,
    token: localStorage.getItem('token') || '',
    isLogin: !!localStorage.getItem('token'),
    loading: false
  }),

  getters: {
    // 获取用户显示名称
    displayName: (state) => {
      return state.userInfo?.username || '用户'
    },
    
    // 获取用户头像
    avatar: (state) => {
      return state.userInfo?.avatar || null
    }
  },

  actions: {
    // 登录
    async login(credentials: LoginCredentials) {
      this.loading = true
      try {
        const response: ApiResponse<{ token: string; user: UserInfo }> = await userService.login(credentials)
        if (response.success) {
          this.token = response.data!.token
          this.userInfo = response.data!.user
          this.isLogin = true
          localStorage.setItem('token', response.data!.token)
          localStorage.setItem('userInfo', JSON.stringify(response.data!.user))
          return { success: true, message: response.message }
        } else {
          return { success: false, message: response.message }
        }
      } catch (error: any) {
        const message = error.response?.data?.message || '登录失败，请检查网络连接'
        return { success: false, message }
      } finally {
        this.loading = false
      }
    },

    // 注册
    async register(userData: RegisterData) {
      this.loading = true
      try {
        const response: ApiResponse = await userService.register(userData)
        if (response.success) {
          // 注册成功后自动登录
          return await this.login({
            username: userData.username,
            password: userData.password
          })
        } else {
          return { success: false, message: response.message }
        }
      } catch (error: any) {
        const message = error.response?.data?.message || '注册失败，请检查网络连接'
        return { success: false, message }
      } finally {
        this.loading = false
      }
    },

    // 登出
    async logout() {
      try {
        await userService.logout()
      } catch (error: any) {
        console.error('登出错误:', error)
      } finally {
        this.userInfo = null
        this.token = ''
        this.isLogin = false
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
      }
    },

    // 加载用户信息
    async loadUser() {
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.log('没有token，清除登录状态')
        this.clearUserState()
        return
      }

      try {
        console.log('开始从服务器获取用户信息...')
        const response: ApiResponse<{ user: UserInfo }> = await userService.getProfile()
        
        if (response.success) {
          console.log('服务器返回用户信息:', response.data!.user)
          // 更新用户信息
          this.userInfo = response.data!.user
          this.token = token
          this.isLogin = true
          localStorage.setItem('userInfo', JSON.stringify(response.data!.user))
        } else {
          console.error('获取用户信息失败:', response.message)
          this.clearUserState()
        }
      } catch (error: any) {
        console.error('加载用户信息出错:', error)
        // 如果是401错误，说明token无效
        if (error.response?.status === 401) {
          console.log('Token无效，清除登录状态')
          this.clearUserState()
        }
        // 其他错误不清除登录状态，可能是网络问题
      }
    },

    // 清除用户状态
    clearUserState() {
      this.userInfo = null
      this.token = ''
      this.isLogin = false
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    },

    // 更新用户信息
    async updateProfile(userData: Partial<UserInfo>) {
      try {
        console.log('发送更新请求:', Object.keys(userData))
        
        const response: ApiResponse<{ user: UserInfo }> = await userService.updateProfile(userData)
        
        console.log('更新响应:', response)
        
        if (response.success) {
          // 直接更新本地状态
          this.userInfo = { ...this.userInfo, ...response.data!.user }
          localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
          return { success: true, message: response.message }
        } else {
          return { success: false, message: response.message }
        }
      } catch (error: any) {
        console.error('更新用户信息错误:', error)
        
        let message = '更新失败，请检查网络连接'
        
        if (error.response) {
          message = error.response.data?.message || `服务器错误 (${error.response.status})`
        } else if (error.request) {
          message = '网络连接超时，请重试'
        } else {
          message = error.message || '未知错误'
        }
        
        return { success: false, message }
      }
    },

    // 修改密码
    async changePassword(passwordData: { oldPassword: string; newPassword: string }) {
      try {
        const response: ApiResponse = await userService.changePassword(passwordData)
        return { success: response.success, message: response.message }
      } catch (error: any) {
        const message = error.response?.data?.message || '修改密码失败，请检查网络连接'
        return { success: false, message }
      }
    }
  }
})








