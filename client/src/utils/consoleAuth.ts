// 控制台认证修复工具 - 直接复制到控制台使用

// 认证修复类
class ConsoleAuthFix {
  // 清除所有认证数据
  static clearAuth() {
    console.log('🧹 清除认证数据...')
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    sessionStorage.clear()
    console.log('✅ 认证数据已清除')
  }

  // 检查认证状态
  static checkAuthStatus() {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    console.log('🔍 认证状态检查:')
    console.log('  Token存在:', !!token)
    console.log('  用户信息存在:', !!user)
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const now = Date.now() / 1000
        console.log('  Token过期时间:', new Date(payload.exp * 1000))
        console.log('  Token已过期:', payload.exp < now)
        
        if (payload.exp < now) {
          console.log('❌ Token已过期，需要重新登录')
          return false
        }
        
        console.log('✅ Token有效')
        return true
      } catch (error) {
        console.error('  ❌ Token格式错误:', error)
        return false
      }
    }
    
    console.log('❌ 未找到Token')
    return false
  }

  // 强制重新登录
  static forceRelogin() {
    console.log('🔄 强制重新登录...')
    this.clearAuth()
    window.location.href = '/login'
  }

  // 显示当前认证信息
  static showAuthInfo() {
    console.log('📋 当前认证信息:')
    console.log('  Token:', localStorage.getItem('token')?.substring(0, 50) + '...')
    console.log('  Refresh Token:', localStorage.getItem('refreshToken')?.substring(0, 50) + '...')
    console.log('  User:', localStorage.getItem('user'))
    console.log('  Remember Me:', localStorage.getItem('rememberMe'))
    console.log('  Remembered Username:', localStorage.getItem('rememberedUsername'))
  }

  // 自动修复
  static autoFix() {
    console.log('🔧 开始自动修复认证问题...')
    
    if (!this.checkAuthStatus()) {
      console.log('❌ 认证无效，建议重新登录')
      console.log('运行 ConsoleAuthFix.clearAuth() 清除数据，然后重新登录')
      return false
    }
    
    console.log('✅ 认证状态正常')
    return true
  }
}

// 导出到全局，方便控制台使用
;(window as any).ConsoleAuthFix = ConsoleAuthFix

// 使用说明
console.log(`
🔧 控制台认证修复工具已加载！

使用方法：
- ConsoleAuthFix.checkAuthStatus()  - 检查认证状态
- ConsoleAuthFix.clearAuth()        - 清除认证数据
- ConsoleAuthFix.showAuthInfo()     - 显示认证信息
- ConsoleAuthFix.autoFix()          - 自动修复
- ConsoleAuthFix.forceRelogin()     - 强制重新登录

建议先运行 ConsoleAuthFix.checkAuthStatus() 检查状态
`)

// 立即执行状态检查
ConsoleAuthFix.checkAuthStatus()
