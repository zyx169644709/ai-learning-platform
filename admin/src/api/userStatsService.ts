import request from '@/utils/request'

export const userStatsService = {
  // 获取指定用户的学习统计
  async getUserStats(userId: string) {
    const response = await request.get(`/admin/users/${userId}/stats`)
    return response.data
  }
}
