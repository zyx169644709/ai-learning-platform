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
  },

  // 检查课程是否已完成
  async checkCourseCompleted(courseId: string) {
    try {
      const response = await api.get('/course-progress/my-stats')
      const completedCourses = response.data.data?.completedCourses || []
      return completedCourses.some((course: any) => course.courseId === courseId)
    } catch (error) {
      console.error('检查课程完成状态失败:', error)
      return false
    }
  }
}
