<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 左侧装饰区域 -->
      <div class="login-decoration">
        <div class="decoration-content">
          <div class="logo-section">
            <div class="logo-icon">🤖</div>
            <h1 class="platform-name">AI-Learning</h1>
            <p class="platform-slogan">智能学习，无限可能</p>
          </div>
          <div class="feature-list">
            <div class="feature-item">
              <el-icon><Monitor /></el-icon>
              <span>AI驱动的个性化学习</span>
            </div>
            <div class="feature-item">
              <el-icon><DataAnalysis /></el-icon>
              <span>智能学习路径规划</span>
            </div>
            <div class="feature-item">
              <el-icon><ChatDotRound /></el-icon>
              <span>24/7 AI教学助手</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="login-form-container">
        <div class="login-form-wrapper">
          <div class="form-header">
            <h2 class="welcome-text">欢迎回来</h2>
            <p class="login-subtitle">登录您的AI学习平台账户</p>
          </div>

          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            @keyup.enter="handleLogin"
          >
            <el-form-item prop="username" title="用户名">
              <el-input
                v-model="loginForm.username"
                size="large"
                placeholder="请输入用户名"
                :prefix-icon="User"
                clearable
                @clear="clearError"
              />
            </el-form-item>

            <el-form-item prop="password" title="密码">
              <el-input
                v-model="loginForm.password"
                type="password"
                size="large"
                placeholder="请输入密码"
                :prefix-icon="Lock"
                show-password
                clearable
                @clear="clearError"
                @keyup.enter="handleLogin"
              />
            </el-form-item>

            <div class="form-options">
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
              <el-link type="primary" :underline="false">忘记密码？</el-link>
            </div>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="login-button"
                :loading="loading"
                @click="handleLogin"
                block
              >
                {{ loading ? '登录中...' : '登录' }}
              </el-button>
            </el-form-item>

            <!-- 错误提示 -->
            <el-alert
              v-if="errorMsg"
              :title="errorMsg"
              type="error"
              :closable="false"
              show-icon
              class="error-alert"
            />

            <!-- 成功提示 -->
            <el-alert
              v-if="successMsg"
              :title="successMsg"
              type="success"
              :closable="false"
              show-icon
              class="success-alert"
            />
          </el-form>

          <div class="form-footer">
            <p class="register-link">
              还没有账号？
              <el-link type="primary" :underline="false" @click="goToRegister" title="立即注册 - 点击创建新的AI学习平台账户">
                立即注册
              </el-link>
            </p>
          </div>

          <!-- 其他登录方式 -->
          <div class="other-login">
            <div class="divider">
              <span>或使用以下方式登录</span>
            </div>
            <div class="social-login">
              <el-button circle class="social-btn wechat" title="微信登录 - 使用微信账户快速登录">
                <el-icon><ChatDotRound /></el-icon>
              </el-button>
              <el-button circle class="social-btn qq" title="QQ登录 - 使用QQ账户快速登录">
                <el-icon><ChatDotRound /></el-icon>
              </el-button>
              <el-button circle class="social-btn weibo" title="微博登录 - 使用微博账户快速登录">
                <el-icon><ChatDotRound /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { ElMessageBox } from 'element-plus'
import { User, Lock, Monitor, DataAnalysis, ChatDotRound } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { notification } from '@/utils/notification'

const router = useRouter()
const userStore = useUserStore()

// 表单引用
const loginFormRef = ref<FormInstance>()

// 响应式数据
const loginForm = reactive({
  username: '',
  password: ''
})

const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const rememberMe = ref(false)

// 表单验证规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ]
}

// 清除错误信息
const clearError = () => {
  errorMsg.value = ''
  successMsg.value = ''
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    // 表单验证
    await loginFormRef.value.validate()
    
    loading.value = true
    errorMsg.value = ''
    successMsg.value = ''

    // 调用登录接口
    const result = await userStore.login({
      username: loginForm.username,
      password: loginForm.password
    })

    if (result.success) {
      successMsg.value = '登录成功！正在跳转...'
      
      // 记住登录状态
      if (rememberMe.value) {
        localStorage.setItem('rememberMe', 'true')
        localStorage.setItem('rememberedUsername', loginForm.username)
      } else {
        localStorage.removeItem('rememberMe')
        localStorage.removeItem('rememberedUsername')
      }

      // 显示登录成功提示
      ;(notification as any).success('登录成功！欢迎回来！')
      
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } else {
      errorMsg.value = result.message || '登录失败，请重试'
    }
  } catch (error: any) {
    if (error.message) {
      errorMsg.value = error.message
    } else {
      errorMsg.value = '登录失败，请检查网络连接'
    }
  } finally {
    loading.value = false
  }
}

// 跳转到注册页面
const goToRegister = () => {
  router.push('/register')
}

// 组件挂载后检查记住的登录信息
onMounted(() => {
  const remembered = localStorage.getItem('rememberMe')
  if (remembered === 'true') {
    const rememberedUsername = localStorage.getItem('rememberedUsername')
    if (rememberedUsername) {
      loginForm.username = rememberedUsername
      rememberMe.value = true
    }
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-secondary);
  padding: 20px;
  box-sizing: border-box;
  margin-top: -52px;
}

.login-container {
  display: flex;
  background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary));
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px var(--shadow-color);
  max-width: 1200px;
  width: 100%;
  max-height: 100%;
}

/* 左侧装饰区域优化（用主题变量重构） */
.login-decoration {
  flex: 0 0 40%;
  /* 用主题渐变，适配双模式 */
  background: var(--bg-secondary); 
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  border-radius: 20px 0 0 20px;
  /* 替代原青蓝色渐变，与主题统一 */
  background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary));
}

/* 弱化原径向渐变（避免与主题冲突），保留动态感 */
.login-decoration::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  /* 用主题阴影色做渐变 */
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  animation: float 20s linear infinite;
  /* 夜间模式下降低亮度 */
  opacity: var(--mode-gradient-opacity, 1);
}

/* 夜间模式调整渐变透明度（可选） */
[data-theme="dark"] .login-decoration::before {
  --mode-gradient-opacity: 0.8;
}

@keyframes float {
  0% { transform: translateY(0px) rotate(0deg); }
  100% { transform: translateY(-20px) rotate(360deg); }
}

.decoration-content {
  text-align: center;
  z-index: 2;
  position: relative;
}

.logo-section {
  margin-bottom: 40px;
}

.logo-icon {
  font-size: 60px;
  margin-bottom: 20px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.platform-name {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 10px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.platform-slogan {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

.feature-list {
  text-align: left;
}

/* 功能列表与主题适配 */
.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  font-size: 14px;
  /* 用主题次级文字色 */
  color: var(--text-secondary); 
  opacity: 0.9;
  transition: color 0.3s ease;
}

.feature-item:hover {
  /* 强调色关联 */
  color: var(--accent-color); 
}

.feature-item .el-icon {
  font-size: 18px;
  /* 图标颜色与文字统一 */
  color: var(--text-secondary); 
  opacity: 0.8;
}

/* 右侧登录表单强化主题 */
.login-form-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  /* 用主题主背景 */
  background: var(--bg-primary); 
  border-radius: 0 20px 20px 0;
}

.login-form-wrapper {
  width: 100%;
  max-width: 500px;
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.welcome-text {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.login-subtitle {
  color: var(--text-secondary);
  margin: 0;
  font-size: 16px;
}

.login-form {
  margin-bottom: 30px;
}

.login-form .el-form-item {
  margin-bottom: 20px;
}

.login-form .el-input {
  --el-input-border-radius: 12px;
  --el-input-height: 50px;
}

/* 表单输入框深度适配 */
.login-form .el-input__wrapper {
  box-shadow: 0 2px 8px var(--shadow-color);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  /* 输入框背景与页面统一 */
  background: var(--bg-primary); 
}

.login-form .el-input__wrapper:hover {
  border-color: var(--accent-color);
  box-shadow: 0 4px 12px var(--shadow-hover);
}

.login-form .el-input__wrapper.is-focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px var(--shadow-color);
}

.login-form .el-input__inner {
  background: var(--bg-primary);
  /* 文字色与主题统一 */
  color: var(--text-primary); 
}

.login-form .el-input__inner::placeholder {
  color: var(--text-tertiary);
}

/* 悬停提示样式优化 */
.login-form .el-form-item {
  position: relative;
  cursor: help;
}

.login-form .el-form-item:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

/* 自定义悬停提示样式 */
:deep(.el-tooltip__popper) {
  background: var(--bg-primary) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px var(--shadow-color) !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
  padding: 8px 12px !important;
}

:deep(.el-tooltip__popper .el-popper__arrow::before) {
  background: var(--bg-primary) !important;
  border-color: var(--border-color) !important;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-options .el-checkbox {
  color: var(--text-secondary);
}

.form-options .el-link {
  color: var(--accent-color);
}

.login-button {
  height: 50px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%);
  border: none;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--shadow-hover);
}

.login-button:active {
  transform: translateY(0);
}

.error-alert,
.success-alert {
  margin-bottom: 20px;
  border-radius: 8px;
}

.form-footer {
  text-align: center;
  margin-bottom: 30px;
}

.register-link {
  color: var(--text-secondary);
  margin: 0;
}

.register-link .el-link {
  color: var(--accent-color);
}

/* 其他登录方式 */
.other-login {
  text-align: center;
}

.divider {
  position: relative;
  margin: 20px 0;
  text-align: center;
}

.divider::before {
  content: '';
  position: absolute;
  top: 125%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--border-color);
}

.divider span {
  background: var(--bg-primary);
  padding: 0 20px;
  color: var(--text-secondary);
  font-size: 14px;
}

.social-login {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}

.social-btn {
  width: 44px;
  height: 44px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-hover);
}

.social-btn.wechat:hover {
  border-color: #07c160;
  color: #07c160;
}

.social-btn.qq:hover {
  border-color: #12b7f5;
  color: #12b7f5;
}

.social-btn.weibo:hover {
  border-color: #e6162d;
  color: #e6162d;
}

/* 响应式优化（保持原有逻辑，强化主题） */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    border-radius: 20px;
    width: 100%;
    max-height: 100%;
  }
  
  .login-decoration {
    border-radius: 20px 20px 0 0;
    /* 小屏幕下弱化渐变 */
    background: var(--bg-secondary); 
  }
  
  .login-form-container {
    padding: 30px 20px;
    border-radius: 0 0 20px 20px;
  }
  
  .welcome-text {
    font-size: 24px;
  }
  
  .login-form .el-input {
    --el-input-height: 44px;
  }
  
  .login-button {
    height: 44px;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 10px;
  }
  
  .login-container {
    width: 100%;
    max-height: 100%;
  }
  
  .login-form-container {
    padding: 20px 16px;
  }
  
  .form-options {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
