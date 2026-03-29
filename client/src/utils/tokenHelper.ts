/**
 * Token 辅助工具函数
 */

/**
 * 检查 token 是否存在且未过期
 * @param token JWT token 字符串
 * @returns 如果 token 有效返回 true，否则返回 false
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) {
    return false
  }

  try {
    // JWT 格式: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.warn('Token 格式无效')
      return false
    }

    // 解码 payload (base64)
    const payload = JSON.parse(atob(parts[1]))
    
    // 检查是否有过期时间字段
    if (!payload.exp) {
      console.warn('Token 缺少过期时间')
      return false
    }

    // exp 是秒级时间戳，需要转换为毫秒
    const expirationTime = payload.exp * 1000
    const currentTime = Date.now()
    
    // 提前 30 秒判定为过期，避免边界情况
    const isValid = expirationTime > currentTime + 30000
    
    if (!isValid) {
      console.log('Token 已过期或即将过期')
    }
    
    return isValid
  } catch (error) {
    console.error('Token 解析失败:', error)
    return false
  }
}

/**
 * 从 localStorage 获取 token 并检查有效性
 * @returns 如果有有效 token 返回 token 字符串，否则返回 null
 */
export function getValidToken(): string | null {
  const token = localStorage.getItem('token')
  
  if (!token) {
    return null
  }
  
  if (!isTokenValid(token)) {
    // Token 无效，清除本地存储
    console.log('检测到无效 token，清除本地存储')
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userInfo')
    return null
  }
  
  return token
}
