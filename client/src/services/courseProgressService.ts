import api from './userService'

export const courseProgressService = {
  // 标记课程完成
  async completeCourse(courseId: string) {
    try {
      const response = await api.post('/course-progress/complete', { courseId })
      return response.data
    } catch (error) {
      console.error('标记课程完成失败:', error)
      throw error
    }
  },

  // 获取我的学习统计
  async getMyStats() {
    try {
      const response = await api.get('/course-progress/my-stats')
      return response.data
    } catch (error) {
      console.error('获取学习统计失败:', error)
      throw error
    }
  }
}
