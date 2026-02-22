import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/userStore'

// 创建 axios 实例
const request = axios.create({
  baseURL: '',
  timeout: 10000,
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    // 如果有 token，添加到请求头
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    // 添加 /api 前缀
    if (config.url && !config.url.startsWith('/api')) {
      config.url = '/api' + config.url
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录')
          const userStore = useUserStore()
          userStore.logout()
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(error.response.data?.message || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

export default request
