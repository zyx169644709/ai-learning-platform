import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '@/utils/request'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('admin_token') || '')
  const userInfo = ref<any>(null)
  
  const isLogin = computed(() => !!token.value)
  const role = computed(() => userInfo.value?.role || '')
  const isSuperAdmin = computed(() => role.value === 'ADMIN')
  const isStaff = computed(() => ['ADMIN', 'MODERATOR'].includes(role.value))
  const hasAnyRole = (...roles: string[]) => roles.includes(role.value)
  
  // 设置 token
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('admin_token', newToken)
  }
  
  // 清除 token
  const clearToken = () => {
    token.value = ''
    localStorage.removeItem('admin_token')
  }
  
  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const response = await request.get('/admin/auth/info')
      userInfo.value = response.data.data.user
      return response.data.data.user
    } catch (error) {
      clearToken()
      throw error
    }
  }
  
  // 登录
  const login = async (username: string, password: string) => {
    try {
      const response = await request.post('/admin/auth/login', {
        username,
        password
      })
      
      const { token: newToken, user } = response.data.data
      setToken(newToken)
      userInfo.value = user
      
      return response.data
    } catch (error) {
      throw error
    }
  }
  
  // 登出
  const logout = () => {
    clearToken()
    userInfo.value = null
  }
  
  return {
    token,
    userInfo,
    role,
    isLogin,
    isStaff,
    isSuperAdmin,
    hasAnyRole,
    setToken,
    clearToken,
    getUserInfo,
    login,
    logout
  }
})
