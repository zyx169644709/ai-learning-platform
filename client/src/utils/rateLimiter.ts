/**
 * 使用频率限制工具类
 * 用于限制用户在指定时间内的请求次数
 */

interface RateLimitConfig {
  maxRequests: number    // 最大请求次数
  timeWindow: number     // 时间窗口（毫秒）
  message: string        // 超出限制时的提示消息
}

interface UserRateLimit {
  requests: number[]     // 请求时间戳数组
  lastWarning?: number   // 上次警告时间
}

class RateLimiter {
  private limits = new Map<string, UserRateLimit>()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  /**
   * 检查用户是否可以发起请求
   * @param userId 用户标识（可以是IP、用户ID等）
   * @returns 是否可以请求
   */
  canMakeRequest(userId: string): { allowed: boolean; message?: string; remainingTime?: number } {
    const now = Date.now()
    const userLimit = this.limits.get(userId) || { requests: [] }
    
    // 清理过期的请求记录
    const validRequests = userLimit.requests.filter(
      timestamp => now - timestamp < this.config.timeWindow
    )
    
    // 如果请求次数未达到限制
    if (validRequests.length < this.config.maxRequests) {
      // 记录当前请求
      validRequests.push(now)
      this.limits.set(userId, { ...userLimit, requests: validRequests })
      
      return {
        allowed: true,
        remainingTime: this.getRemainingTime(validRequests[0])
      }
    }

    // 请求次数已达到限制
    const oldestRequest = validRequests[0]
    const remainingTime = this.getRemainingTime(oldestRequest)
    
    // 避免频繁显示警告（每30秒最多显示一次）
    const shouldShowWarning = !userLimit.lastWarning || 
      now - userLimit.lastWarning > 30000

    if (shouldShowWarning) {
      this.limits.set(userId, { 
        ...userLimit, 
        requests: validRequests,
        lastWarning: now 
      })
    }

    return {
      allowed: false,
      message: this.config.message,
      remainingTime
    }
  }

  /**
   * 获取剩余等待时间（秒）
   */
  private getRemainingTime(oldestRequest: number): number {
    const now = Date.now()
    const timePassed = now - oldestRequest
    const remaining = this.config.timeWindow - timePassed
    return Math.max(0, Math.ceil(remaining / 1000))
  }

  /**
   * 重置用户的限制记录
   */
  resetUser(userId: string): void {
    this.limits.delete(userId)
  }

  /**
   * 清理所有过期记录
   */
  cleanup(): void {
    const now = Date.now()
    for (const [userId, userLimit] of this.limits.entries()) {
      const validRequests = userLimit.requests.filter(
        timestamp => now - timestamp < this.config.timeWindow
      )
      
      if (validRequests.length === 0) {
        this.limits.delete(userId)
      } else {
        this.limits.set(userId, { ...userLimit, requests: validRequests })
      }
    }
  }
}

// 创建 Kimi API 的频率限制器实例
export const kimiRateLimiter = new RateLimiter({
  maxRequests: 3,                    // 最多3次请求
  timeWindow: 60 * 1000,            // 1分钟时间窗口
  message: '非会员一分钟最多使用三次，请稍后再试'  // 限制提示消息
})

// 定期清理过期记录（每5分钟清理一次）
setInterval(() => {
  kimiRateLimiter.cleanup()
}, 5 * 60 * 1000)

export default RateLimiter
