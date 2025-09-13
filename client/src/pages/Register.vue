<template>
  <div class="register-page">
    <div class="register-container">
      <!-- 左侧装饰区域 -->
      <div class="register-decoration">
        <div class="decoration-content">
          <div class="logo-section">
            <div class="logo-icon">🚀</div>
            <h1 class="platform-name">AI-Learning</h1>
            <p class="platform-slogan">开启您的AI学习之旅</p>
          </div>
          <div class="feature-list">
            <div class="feature-item">
              <el-icon><User /></el-icon>
              <span>个性化学习体验</span>
            </div>
            <div class="feature-item">
              <el-icon><Star /></el-icon>
              <span>专业课程体系</span>
            </div>
            <div class="feature-item">
              <el-icon><TrendCharts /></el-icon>
              <span>学习进度跟踪</span>
            </div>
            <div class="feature-item">
              <el-icon><Connection /></el-icon>
              <span>社区交流互动</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧注册表单 -->
      <div class="register-form-container">
        <div class="register-form-wrapper">
          <div class="form-header">
            <h2 class="welcome-text">创建账户</h2>
            <p class="register-subtitle">加入AI学习平台，开启智能学习新时代</p>
          </div>

          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            class="register-form"
            @keyup.enter="handleRegister"
          >
            <el-form-item prop="username" title="用户名">
              <el-input
                v-model="registerForm.username"
                size="large"
                placeholder="请输入用户名（3-20个字符）"
                :prefix-icon="User"
                clearable
                @clear="clearMessages"
              />
            </el-form-item>

            <el-form-item prop="email" title="邮箱地址">
              <el-input
                v-model="registerForm.email"
                type="email"
                size="large"
                placeholder="请输入邮箱地址"
                :prefix-icon="Message"
                clearable
                @clear="clearMessages"
              />
            </el-form-item>



            <el-form-item prop="password" title="密码">
              <el-input
                v-model="registerForm.password"
                type="password"
                size="large"
                placeholder="请输入密码（至少6个字符）"
                :prefix-icon="Lock"
                show-password
                clearable
                @clear="clearMessages"
              />
            </el-form-item>

            <el-form-item prop="confirmPassword" title="确认密码">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                size="large"
                placeholder="请再次输入密码"
                :prefix-icon="Lock"
                show-password
                clearable
                @clear="clearMessages"
              />
            </el-form-item>

            <div class="form-options">
              <el-checkbox v-model="agreeTerms">
                我已阅读并同意
                <el-link type="primary" :underline="false">服务条款</el-link>
                和
                <el-link type="primary" :underline="false">隐私政策</el-link>
              </el-checkbox>
            </div>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="register-button"
                :loading="loading"
                @click="handleRegister"
                block
              >
                {{ loading ? '注册中...' : '立即注册' }}
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
            <p class="login-link">
              已有账户？
              <el-link type="primary" :underline="false" @click="goToLogin">
                立即登录
              </el-link>
            </p>
          </div>

          <!-- 其他注册方式 -->
          <div class="other-register">
            <div class="divider">
              <span>或使用以下方式注册</span>
            </div>
            <div class="social-register">
              <el-button circle class="social-btn wechat">
                <el-icon><ChatDotRound /></el-icon>
              </el-button>
              <el-button circle class="social-btn qq">
                <el-icon><ChatDotRound /></el-icon>
              </el-button>
              <el-button circle class="social-btn weibo">
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { ElMessage } from 'element-plus'
import { 
  User, 
  Message, 
  Lock, 
  ChatDotRound,
  Star,
  TrendCharts,
  Connection
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

// 表单引用
const registerFormRef = ref<FormInstance>()

// 响应式数据
const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const agreeTerms = ref(false)

// 表单验证规则
const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, message: '用户名只能包含字母、数字、下划线和中文', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],

  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' },
    { pattern: /^(?=.*[a-zA-Z])(?=.*\d)/, message: '密码必须包含字母和数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 清除消息
const clearMessages = () => {
  errorMsg.value = ''
  successMsg.value = ''
}

// 处理注册
const handleRegister = async () => {
  console.log('开始注册流程...')
  
  if (!registerFormRef.value) {
    console.log('表单引用不存在')
    return
  }

  // 检查是否同意服务条款
  if (!agreeTerms.value) {
    console.log('未同意服务条款')
    errorMsg.value = '请先阅读并同意服务条款和隐私政策'
    return
  }

  try {
    // 表单验证
    console.log('开始表单验证...')
    await registerFormRef.value.validate()
    console.log('表单验证通过')
    
    loading.value = true
    errorMsg.value = ''
    successMsg.value = ''

    const userData = {
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password
    }

    console.log('准备发送注册请求:', { ...userData, password: '***' })

    // 调用注册接口
    const result = await userStore.register(userData)
    console.log('注册结果:', result)

    if (result.success) {
      successMsg.value = '注册成功！正在跳转到首页...'
      console.log('注册成功，准备跳转')
      
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        ElMessage.success('欢迎加入AI学习平台！')
        router.push('/')
      }, 1500)
    } else {
      console.log('注册失败:', result.message)
      errorMsg.value = result.message || '注册失败，请重试'
    }
  } catch (error: any) {
    console.error('注册过程中出错:', error)
    if (error.message) {
      errorMsg.value = error.message
    } else {
      errorMsg.value = '注册失败，请检查网络连接'
    }
  } finally {
    loading.value = false
  }
}

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-secondary);
  padding: 20px;
  box-sizing: border-box;
}

.register-container {
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
.register-decoration {
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
.register-decoration::before {
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
[data-theme="dark"] .register-decoration::before {
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
  margin-bottom: 16px;
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

/* 右侧注册表单强化主题 */
.register-form-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  /* 用主题主背景 */
  background: var(--bg-primary); 
  border-radius: 0 20px 20px 0;
}

.register-form-wrapper {
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

.register-subtitle {
  color: var(--text-secondary);
  margin: 0;
  font-size: 16px;
}

.register-form {
  margin-bottom: 30px;
}

.register-form .el-form-item {
  margin-bottom: 20px;
}

.register-form .el-input {
  --el-input-border-radius: 12px;
  --el-input-height: 50px;
}

/* 表单输入框深度适配 */
.register-form .el-input__wrapper {
  box-shadow: 0 2px 8px var(--shadow-color);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  /* 输入框背景与页面统一 */
  background: var(--bg-primary); 
}

.register-form .el-input__wrapper:hover {
  border-color: var(--accent-color);
  box-shadow: 0 4px 12px var(--shadow-hover);
}

.register-form .el-input__wrapper.is-focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px var(--shadow-color);
}

.register-form .el-input__inner {
  background: var(--bg-primary);
  /* 文字色与主题统一 */
  color: var(--text-primary); 
}

.register-form .el-input__inner::placeholder {
  color: var(--text-tertiary);
}

/* 悬停提示样式优化 */
.register-form .el-form-item {
  position: relative;
  cursor: help;
}

.register-form .el-form-item:hover {
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
  margin-bottom: 20px;
}

.form-options .el-checkbox {
  font-size: 14px;
  color: var(--text-secondary);
}

.form-options .el-link {
  color: var(--accent-color);
}

.register-button {
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

.register-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--shadow-hover);
}

.register-button:active {
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

.login-link {
  color: var(--text-secondary);
  margin: 0;
}

.login-link .el-link {
  color: var(--accent-color);
}

/* 其他注册方式 */
.other-register {
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

.social-register {
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
  .register-container {
    flex-direction: column;
    border-radius: 20px;
    width: 100%;
    max-height: 100%;
  }
  
  .register-decoration {
    border-radius: 20px 20px 0 0;
    /* 小屏幕下弱化渐变 */
    background: var(--bg-secondary); 
  }
  
  .register-form-container {
    padding: 30px 20px;
    border-radius: 0 0 20px 20px;
  }
  
  .welcome-text {
    font-size: 24px;
  }
  
  .register-form .el-input {
    --el-input-height: 44px;
  }
  
  .register-button {
    height: 44px;
  }
}

@media (max-width: 480px) {
  .register-page {
    padding: 10px;
  }
  
  .register-container {
    width: 100%;
    max-height: 100%;
  }
  
  .register-form-container {
    padding: 20px 16px;
  }
  
  .form-options {
    margin-bottom: 15px;
  }
}
</style>
  