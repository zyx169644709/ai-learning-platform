// 高级认证修复工具 - 处理各种token格式问题

class AdvancedAuthFix {
  // 清除所有认证数据
  static clearAuth() {
    console.log('🧹 清除认证数据...')
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    sessionStorage.clear()
    console.log('✅ 认证数据已清除')
  }

  // 检查token格式
  static analyzeToken(token: string) {
    console.log('🔍 分析Token格式:')
    console.log('  Token长度:', token.length)
    console.log('  Token类型:', typeof token)
    console.log('  Token前50字符:', token.substring(0, 50))
    
    // 检查是否是JWT格式
    const parts = token.split('.')
    console.log('  Token分段数:', parts.length)
    
    if (parts.length === 3) {
      console.log('  ✅ 可能是JWT格式')
      try {
        // 尝试解析header
        const header = JSON.parse(atob(parts[0]))
        console.log('  Header:', header)
        
        // 尝试解析payload
        const payload = JSON.parse(atob(parts[1]))
        console.log('  Payload:', payload)
        
        return { isValid: true, header, payload }
      } catch (error) {
        console.error('  ❌ JWT解析失败:', error)
        return { isValid: false, error }
      }
    } else {
      console.log('  ❌ 不是标准JWT格式')
      return { isValid: false, error: 'Not JWT format' }
    }
  }

  // 检查认证状态（增强版）
  static checkAuthStatus() {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    console.log('🔍 增强认证状态检查:')
    console.log('  Token存在:', !!token)
    console.log('  用户信息存在:', !!user)
    
    if (!token) {
      console.log('  ❌ 未找到Token')
      return false
    }

    // 分析token
    const analysis = this.analyzeToken(token)
    
    if (!analysis.isValid) {
      console.log('  ❌ Token格式无效，需要重新登录')
      console.log('  💡 建议：运行 AdvancedAuthFix.clearAuth() 清除数据')
      return false
    }

    // 检查过期时间
    if (analysis.payload && analysis.payload.exp) {
      const now = Date.now() / 1000
      const isExpired = analysis.payload.exp < now
      
      console.log('  Token过期时间:', new Date(analysis.payload.exp * 1000))
      console.log('  当前时间:', new Date(now * 1000))
      console.log('  Token已过期:', isExpired)
      
      if (isExpired) {
        console.log('  ❌ Token已过期，需要重新登录')
        return false
      }
    }

    console.log('  ✅ Token格式和状态正常')
    return true
  }

  // 显示详细信息
  static showDetailedInfo() {
    console.log('📋 详细认证信息:')
    
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    const refreshToken = localStorage.getItem('refreshToken')
    
    console.log('  Token:', token ? token.substring(0, 100) + '...' : 'null')
    console.log('  Token长度:', token?.length || 0)
    console.log('  Refresh Token:', refreshToken ? refreshToken.substring(0, 50) + '...' : 'null')
    console.log('  User:', user)
    console.log('  Remember Me:', localStorage.getItem('rememberMe'))
    console.log('  Remembered Username:', localStorage.getItem('rememberedUsername'))
    
    if (token) {
      this.analyzeToken(token)
    }
  }

  // 修复常见问题
  static autoFix() {
    console.log('🔧 自动修复认证问题...')
    
    const token = localStorage.getItem('token')
    
    if (!token) {
      console.log('  ❌ 未找到Token，请重新登录')
      return false
    }

    // 检查token是否是完整格式
    if (!token.includes('.')) {
      console.log('  ❌ Token不是JWT格式，清除数据')
      this.clearAuth()
      return false
    }

    // 检查token是否被截断
    if (token.length < 50) {
      console.log('  ❌ Token过短，可能被截断，清除数据')
      this.clearAuth()
      return false
    }

    // 检查用户信息是否存在
    const user = localStorage.getItem('user')
    if (!user) {
      console.log('  ⚠️ 用户信息不存在，但不影响Token使用')
    }

    console.log('  ✅ Token格式检查通过')
    return true
  }

  // 强制刷新页面
  static forceRefresh() {
    console.log('🔄 强制刷新页面...')
    window.location.reload()
  }

  // 测试API请求
  static async testAPI() {
    console.log('🧪 测试API请求...')
    
    const token = localStorage.getItem('token')
    if (!token) {
      console.log('  ❌ 无Token，无法测试')
      return false
    }

    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('  API响应状态:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('  ✅ API请求成功:', data)
        return true
      } else {
        console.log('  ❌ API请求失败:', response.status, response.statusText)
        return false
      }
    } catch (error) {
      console.error('  ❌ API请求错误:', error)
      return false
    }
  }
}

// 导出到全局
;(window as any).AdvancedAuthFix = AdvancedAuthFix

// 使用说明
console.log(`
🔧 高级认证修复工具已加载！

使用方法：
- AdvancedAuthFix.checkAuthStatus()  - 增强认证检查
- AdvancedAuthFix.showDetailedInfo()  - 显示详细信息
- AdvancedAuthFix.clearAuth()         - 清除认证数据
- AdvancedAuthFix.autoFix()           - 自动修复
- AdvancedAuthFix.testAPI()           - 测试API请求

建议按顺序运行：
1. AdvancedAuthFix.checkAuthStatus()
2. AdvancedAuthFix.showDetailedInfo()
3. AdvancedAuthFix.testAPI()
`)

// 立即执行检查
AdvancedAuthFix.checkAuthStatus()
