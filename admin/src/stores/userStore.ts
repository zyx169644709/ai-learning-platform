import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('admin_token') || '')
  const userInfo = ref<any>(null)
  
  const isLogin = computed(() => !!token.value)
  const isAdmin = computed(() => {
    return userInfo.value?.role === 'admin' || userInfo.value?.email === 'admin@example.com'
  })
  
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
      const response = await axios.get('/api/admin/auth/info', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      userInfo.value = response.data
      return response.data
    } catch (error) {
      clearToken()
      throw error
    }
  }
  
  // 登录
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/admin/auth/login', {
        email,
        password
      })
      
      const { token: newToken, user } = response.data
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
    isLogin,
    isAdmin,
    setToken,
    clearToken,
    getUserInfo,
    login,
    logout
  }
})
