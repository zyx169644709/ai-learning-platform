<template>
  <div class="register-page">
    <div class="register-container">
      <!-- 左侧装饰区域 -->
      <div class="register-decoration">
        <div class="decoration-content">
          <div class="logo-section">
            <div class="logo-icon">🚀</div>
            <h1 class="platform-name">Vue-Learning</h1>
            <p class="platform-slogan">开启您的 Vue 3 学习之旅</p>
          </div>
          <div class="feature-list">
            <div class="feature-item">
              <el-icon>
                <User />
              </el-icon>
              <span>个性化学习体验</span>
            </div>
            <div class="feature-item">
              <el-icon>
                <Star />
              </el-icon>
              <span>专业课程体系</span>
            </div>
            <div class="feature-item">
              <el-icon>
                <TrendCharts />
              </el-icon>
              <span>学习进度跟踪</span>
            </div>
            <div class="feature-item">
              <el-icon>
                <Connection />
              </el-icon>
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
            <p class="register-subtitle">加入 Vue.js 学习实战平台，掌握现代前端开发核心技术</p>
          </div>

          <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="register-form"
            @keyup.enter="handleRegister">
            <el-form-item prop="username" title="用户名">
              <el-input v-model="registerForm.username" size="large" placeholder="请输入用户名（3-20个字符）" :prefix-icon="User"
                clearable @clear="clearMessages" />
            </el-form-item>

            <el-form-item prop="email" title="邮箱地址">
              <el-input v-model="registerForm.email" type="email" size="large" placeholder="请输入邮箱地址"
                :prefix-icon="Message" clearable @clear="clearMessages" />
            </el-form-item>



            <el-form-item prop="password" title="密码">
              <el-input v-model="registerForm.password" type="password" size="large" placeholder="请输入密码（至少8个字符）"
                :prefix-icon="Lock" show-password clearable @clear="clearMessages" @input="checkPasswordStrength" />
            </el-form-item>

            <!-- 密码强度指示器 -->
            <div v-if="registerForm.password" class="password-strength">
              <div class="strength-label">密码强度：</div>
              <div class="strength-bars">
                <div v-for="i in 4" :key="i" :class="['strength-bar', getStrengthClass(i)]"></div>
              </div>
              <div class="strength-text">{{ strengthText }}</div>
            </div>

            <!-- 密码要求提示 -->
            <div class="password-requirements">
              <div class="requirements-title">密码要求：</div>
              <div class="requirements-list">
                <div v-for="(req, index) in passwordRequirements" :key="index"
                  :class="['requirement-item', { 'met': req.met }]">
                  <el-icon :class="req.met ? 'check' : 'close'">
                    <Check v-if="req.met" />
                    <Close v-else />
                  </el-icon>
                  <span>{{ req.text }}</span>
                </div>
              </div>
            </div>

            <el-form-item prop="confirmPassword" title="确认密码">
              <el-input v-model="registerForm.confirmPassword" type="password" size="large" placeholder="请再次输入密码"
                :prefix-icon="Lock" show-password clearable @clear="clearMessages" />
            </el-form-item>

            <div class="form-options">
              <el-checkbox v-model="agreeTerms">
                我已阅读并同意
                <el-link type="primary" underline="never" @click.stop="showTerms = true">服务条款</el-link>
                和
                <el-link type="primary" underline="never" @click.stop="showPrivacy = true">隐私政策</el-link>
              </el-checkbox>
              <div class="login-link">
                已有账户？
                <el-link type="primary" underline="never" @click="goToLogin">
                  立即登录
                </el-link>
              </div>
            </div>

            <el-form-item>
              <el-button type="primary" size="large" class="register-button" :loading="loading" @click="handleRegister"
                block>
                {{ loading ? '注册中...' : '立即注册' }}
              </el-button>
            </el-form-item>

            <!-- 错误提示 -->
            <el-alert v-if="errorMsg" :title="errorMsg" type="error" :closable="false" show-icon class="error-alert" />

            <!-- 成功提示 -->
            <el-alert v-if="successMsg" :title="successMsg" type="success" :closable="false" show-icon
              class="success-alert" />
          </el-form>
        </div>
      </div>
    </div>
  </div>

  <!-- 服务条款弹窗 -->
  <el-dialog v-model="showTerms" title="服务条款" width="600px" :close-on-click-modal="true" class="terms-dialog">
    <div class="dialog-content">
      <h3>一、接受条款</h3>
      <p>欢迎使用 Vue-Learning 学习平台（以下简称"本平台"）。在使用本平台前，请仔细阅读以下服务条款。注册账户即表示您同意接受本条款的约束。</p>

      <h3>二、服务内容</h3>
      <p>本平台为用户提供 Vue.js 相关课程学习、在线测验、学习进度跟踪、社区讨论等功能。平台保留随时修改或终止服务的权利，恕不另行通知。</p>

      <h3>三、用户账户</h3>
      <p>您须对账户信息的安全性负责，包括妥善保管密码。如发现账户被未经授权使用，请立即通知我们。因您未能妥善保管账户信息所造成的损失，本平台不承担责任。</p>

      <h3>四、用户行为规范</h3>
      <p>用户不得利用本平台从事违法活动，不得发布违规内容，不得干扰其他用户正常使用。本平台有权对违规用户封禁账号。</p>

      <h3>五、知识产权</h3>
      <p>本平台提供的所有课程内容、题目、图文资料均受著作权法保护，未经授权不得复制、传播或商业使用。</p>

      <h3>六、免责声明</h3>
      <p>本平台以"现状"提供服务，不对服务的及时性、准确性作出保证。因不可抗力或技术原因造成的服务中断，本平台不承担赔偿责任。</p>

      <h3>七、条款修改</h3>
      <p>本平台保留随时修改本条款的权利，修改后的条款将在平台上公布，继续使用即视为接受修改后的条款。</p>
    </div>
    <template #footer>
      <el-button type="primary" @click="showTerms = false; agreeTerms = true">我已阅读并同意</el-button>
      <el-button @click="showTerms = false">关闭</el-button>
    </template>
  </el-dialog>

  <!-- 隐私政策弹窗 -->
  <el-dialog v-model="showPrivacy" title="隐私政策" width="600px" :close-on-click-modal="true" class="terms-dialog">
    <div class="dialog-content">
      <h3>一、信息收集</h3>
      <p>我们在您注册时收集用户名、邮箱地址等必要信息，在您使用平台时自动收集学习进度、答题记录等行为数据，用于为您提供个性化学习体验。</p>

      <h3>二、信息使用</h3>
      <p>我们使用您的信息用于：账户管理与身份验证、提供课程学习与进度追踪服务、改进平台功能与用户体验、向您发送学习提醒等通知（可设置关闭）。</p>

      <h3>三、信息保护</h3>
      <p>我们采用行业标准的加密技术保护您的账户密码。我们不会将您的个人信息出售给第三方，也不会在未经您同意的情况下向第三方披露您的个人信息（法律要求除外）。</p>

      <h3>四、Cookie 使用</h3>
      <p>本平台使用 Cookie 和本地存储来维持您的登录状态和保存学习偏好设置。您可以通过浏览器设置禁用 Cookie，但这可能影响部分功能的正常使用。</p>

      <h3>五、数据存储</h3>
      <p>您的数据存储在安全的服务器上，我们会定期备份数据以防止意外丢失。如果您注销账户，我们将在合理时间内删除您的个人数据。</p>

      <h3>六、未成年人保护</h3>
      <p>本平台不面向 13 周岁以下的未成年人提供服务。如发现未成年人注册，我们将及时删除相关账户信息。</p>

      <h3>七、联系我们</h3>
      <p>如您对本隐私政策有任何疑问，可通过平台内的反馈功能与我们联系。</p>
    </div>
    <template #footer>
      <el-button type="primary" @click="showPrivacy = false; agreeTerms = true">我已阅读并同意</el-button>
      <el-button @click="showPrivacy = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import {
  User,
  Message,
  Lock,
  ChatDotRound,
  Star,
  TrendCharts,
  Connection,
  Check,
  Close
} from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { notification } from '@/utils/notification'

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
const showTerms = ref(false)
const showPrivacy = ref(false)

// 密码强度相关
const passwordStrength = ref(0)

// 密码要求检查
const passwordRequirements = computed(() => [
  { text: '至少8个字符', met: registerForm.password.length >= 8 },
  { text: '包含大小写字母', met: /[a-z]/.test(registerForm.password) && /[A-Z]/.test(registerForm.password) },
  { text: '包含数字', met: /\d/.test(registerForm.password) },
  { text: '包含特殊字符', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(registerForm.password) }
])

const allPasswordRequirementsMet = computed(() =>
  passwordRequirements.value.every(r => r.met)
)

const strengthText = computed(() => {
  if (passwordStrength.value <= 1) return '弱'
  if (passwordStrength.value <= 2) return '一般'
  if (passwordStrength.value <= 3) return '强'
  return '很强'
})

const getStrengthClass = (index: number) => {
  if (index <= passwordStrength.value) {
    if (passwordStrength.value <= 1) return 'weak'
    if (passwordStrength.value <= 2) return 'medium'
    if (passwordStrength.value <= 3) return 'strong'
    return 'very-strong'
  }
  return ''
}

const checkPasswordStrength = () => {
  const p = registerForm.password
  let score = 0
  if (p.length >= 8) score++
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++
  if (/\d/.test(p)) score++
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p)) score++
  passwordStrength.value = score
}

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
    { min: 8, message: '密码长度不能少于 8 个字符', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!/[a-z]/.test(value) || !/[A-Z]/.test(value)) {
          callback(new Error('密码必须同时包含大写和小写字母'))
        } else if (!/\d/.test(value)) {
          callback(new Error('密码必须包含数字'))
        } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
          callback(new Error('密码必须包含特殊字符（如 !@#$%^&*）'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
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

  // 前置密码规范检查，不满足直接拦截
  if (!allPasswordRequirementsMet.value) {
    const unmet = passwordRequirements.value.filter(r => !r.met).map(r => r.text)
    errorMsg.value = `密码不符合要求：${unmet.join('、')}`
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

      // 显示注册成功提示
      notification.success('注册成功！欢迎加入 Vue.js 学习实战平台！')

      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
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
  0% {
    transform: translateY(0px) rotate(0deg);
  }

  100% {
    transform: translateY(-20px) rotate(360deg);
  }
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
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.login-link {
  color: var(--text-secondary);
  font-size: 0.9rem;
  white-space: nowrap;
}

.login-link .el-link {
  color: var(--accent-color);
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

/* 密码强度指示器 */
.password-strength {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px 15px;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.strength-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-right: 10px;
  white-space: nowrap;
}

.strength-bars {
  display: flex;
  gap: 4px;
  margin-right: 15px;
}

.strength-bar {
  width: 20px;
  height: 4px;
  border-radius: 2px;
  background: var(--border-color);
  transition: all 0.3s ease;
}

.strength-bar.weak {
  background: #ff4757;
}

.strength-bar.medium {
  background: #ffa502;
}

.strength-bar.strong {
  background: #2ed573;
}

.strength-bar.very-strong {
  background: #1e90ff;
}

.strength-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* 密码要求提示 */
.password-requirements {
  margin-bottom: 16px;
  padding: 12px 15px;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.requirements-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.requirements-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.requirement-item {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: var(--text-tertiary);
  transition: color 0.3s ease;
}

.requirement-item.met {
  color: var(--accent-color);
}

.requirement-item .el-icon {
  margin-right: 8px;
  font-size: 0.8rem;
}

.requirement-item .el-icon.check {
  color: var(--accent-color);
}

.requirement-item .el-icon.close {
  color: var(--text-tertiary);
}

/* 弹窗内容样式 */
.dialog-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 4px;
  line-height: 1.8;
}

.dialog-content h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 20px 0 8px;
}

.dialog-content h3:first-child {
  margin-top: 0;
}

.dialog-content p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0 0 8px;
}
</style>