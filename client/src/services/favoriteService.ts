import api from './userService'

export const favoriteService = {
  // 切换收藏状态（添加/取消）
  async toggleFavorite(targetType: 'course' | 'chapter' | 'resource', targetId: string) {
    try {
      const response = await api.post('/favorites/toggle', { targetType, targetId })
      return response.data
    } catch (error) {
      console.error('切换收藏失败:', error)
      throw error
    }
  },

  // 检查是否已收藏
  async checkFavorite(targetType: 'course' | 'chapter' | 'resource', targetId: string) {
    try {
      const response = await api.get('/favorites/check', { 
        params: { targetType, targetId } 
      })
      return response.data
    } catch (error) {
      console.error('检查收藏状态失败:', error)
      throw error
    }
  },

  // 获取收藏列表
  async getFavorites(targetType?: 'course' | 'chapter' | 'resource') {
    try {
      const params = targetType ? { targetType } : {}
      const response = await api.get('/favorites', { params })
      return response.data
    } catch (error) {
      console.error('获取收藏列表失败:', error)
      throw error
    }
  }
}
