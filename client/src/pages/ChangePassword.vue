<template>
  <div class="change-password-page">
    <div class="change-password-container">
      <!-- 左侧装饰区域 -->
      <div class="change-password-decoration">
        <div class="decoration-content">
          <div class="logo-section">
            <div class="logo-icon">🔐</div>
            <h1 class="platform-name">修改密码</h1>
            <p class="platform-slogan">保护您的账户安全</p>
          </div>
          <div class="feature-list">
            <div class="feature-item">
              <el-icon><Lock /></el-icon>
              <span>安全密码策略</span>
            </div>
            <div class="feature-item">
              <el-icon><Lock /></el-icon>
              <span>账户安全保护</span>
            </div>
            <div class="feature-item">
              <el-icon><Key /></el-icon>
              <span>密码强度检测</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧修改密码表单 -->
      <div class="change-password-form-container">
        <div class="change-password-form-wrapper">
          <div class="form-header">
            <h2 class="welcome-text">修改密码</h2>
            <p class="form-subtitle">请输入当前密码和新密码</p>
          </div>

          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            class="change-password-form"
            @keyup.enter="handleChangePassword"
          >
            <el-form-item prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                size="large"
                placeholder="请输入当前密码"
                :prefix-icon="Lock"
                show-password
                clearable
                @clear="clearMessages"
              />
            </el-form-item>

            <el-form-item prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                size="large"
                placeholder="请输入新密码"
                :prefix-icon="Key"
                show-password
                clearable
                @clear="clearMessages"
                @input="checkPasswordStrength"
              />
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                size="large"
                placeholder="请确认新密码"
                :prefix-icon="Key"
                show-password
                clearable
                @clear="clearMessages"
              />
            </el-form-item>

            <!-- 密码强度指示器 -->
            <div v-if="passwordForm.newPassword" class="password-strength">
              <div class="strength-label">密码强度：</div>
              <div class="strength-bars">
                <div 
                  v-for="i in 4" 
                  :key="i"
                  :class="['strength-bar', getStrengthClass(i)]"
                ></div>
              </div>
              <div class="strength-text">{{ strengthText }}</div>
            </div>

            <!-- 密码要求提示 -->
            <div class="password-requirements">
              <div class="requirements-title">密码要求：</div>
              <div class="requirements-list">
                <div 
                  v-for="(requirement, index) in passwordRequirements" 
                  :key="index"
                  :class="['requirement-item', { 'met': requirement.met }]"
                >
                  <el-icon :class="requirement.met ? 'check' : 'close'">
                    <Check v-if="requirement.met" />
                    <Close v-else />
                  </el-icon>
                  <span>{{ requirement.text }}</span>
                </div>
              </div>
            </div>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="change-password-button"
                :loading="loading"
                :disabled="!allRequirementsMet"
                @click="handleChangePassword"
                block
              >
                {{ loading ? '修改中...' : '修改密码' }}
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
            <el-button 
              type="info" 
              plain 
              @click="goBack"
              class="back-button"
            >
              返回
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Lock, Key, Check, Close, InfoFilled, Warning } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

// 表单引用
const passwordFormRef = ref<FormInstance>()

// 响应式数据
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

// 密码强度相关
const passwordStrength = ref(0)

// 表单验证规则
const passwordRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '新密码长度不能少于 8 个字符', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value === passwordForm.oldPassword) {
          callback(new Error('新密码不能与当前密码相同'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

// 密码要求检查
const passwordRequirements = computed(() => [
  {
    text: '至少8个字符',
    met: passwordForm.newPassword.length >= 8
  },
  {
    text: '包含大小写字母',
    met: /[a-z]/.test(passwordForm.newPassword) && /[A-Z]/.test(passwordForm.newPassword)
  },
  {
    text: '包含数字',
    met: /\d/.test(passwordForm.newPassword)
  },
  {
    text: '包含特殊字符',
    met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordForm.newPassword)
  }
])

// 检查是否满足所有密码要求
const allRequirementsMet = computed(() => {
  // 检查所有密码要求是否满足
  const requirementsMet = passwordRequirements.value.every(req => req.met)
  
  // 检查所有字段是否已填写
  const fieldsFilled = passwordForm.oldPassword.length > 0 && 
                       passwordForm.newPassword.length > 0 && 
                       passwordForm.confirmPassword.length > 0
  
  // 检查新密码和确认密码是否一致
  const passwordsMatch = passwordForm.newPassword === passwordForm.confirmPassword
  
  // 检查新密码是否与当前密码不同
  const differentFromOld = passwordForm.newPassword !== passwordForm.oldPassword
  
  return requirementsMet && fieldsFilled && passwordsMatch && differentFromOld
})

// 密码强度文本
const strengthText = computed(() => {
  if (passwordStrength.value <= 1) return '弱'
  if (passwordStrength.value <= 2) return '一般'
  if (passwordStrength.value <= 3) return '强'
  return '很强'
})

// 获取强度条样式类
const getStrengthClass = (index: number) => {
  if (index <= passwordStrength.value) {
    if (passwordStrength.value <= 1) return 'weak'
    if (passwordStrength.value <= 2) return 'medium'
    if (passwordStrength.value <= 3) return 'strong'
    return 'very-strong'
  }
  return ''
}

// 检查密码强度
const checkPasswordStrength = () => {
  const password = passwordForm.newPassword
  let score = 0
  
  if (password.length >= 8) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++
  
  passwordStrength.value = score
}

// 清除消息
const clearMessages = () => {
  errorMsg.value = ''
  successMsg.value = ''
}

// 处理修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    // 表单验证
    await passwordFormRef.value.validate()
    
    loading.value = true
    errorMsg.value = ''
    successMsg.value = ''

    // 调用修改密码接口
    const result = await userStore.changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })

    if (result.success) {
      successMsg.value = '密码修改成功！'
      
      // 清空表单
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      passwordStrength.value = 0
      
      // 延迟跳转
      setTimeout(() => {
        ElMessage.success('密码修改成功！')
        router.push('/login')
      }, 1500)
    } else {
      errorMsg.value = result.message || '密码修改失败，请重试'
    }
  } catch (error: any) {
    if (error.message) {
      errorMsg.value = error.message
    } else {
      errorMsg.value = '密码修改失败，请检查网络连接'
    }
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 组件挂载后检查用户登录状态
onMounted(() => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login')
  }
})
</script>

<style scoped>
.change-password-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-secondary);
  padding: 20px;
  box-sizing: border-box;
  margin-top: -52px;
}

.change-password-container {
  display: flex;
  background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary));
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px var(--shadow-color);
  max-width: 1200px;
  width: 100%;
  max-height: 100%;
}

/* 左侧装饰区域 */
.change-password-decoration {
  flex: 0 0 40%;
  background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary));
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  border-radius: 20px 0 0 20px;
}

.change-password-decoration::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  animation: float 20s linear infinite;
}

@keyframes float {
  0% { transform: translate(0, 0) rotate(0deg); }
  100% { transform: translate(-20px, -20px) rotate(360deg); }
}

.decoration-content {
  text-align: center;
  z-index: 1;
  padding: 40px;
}

.logo-section {
  margin-bottom: 40px;
}

.logo-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.platform-name {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.platform-slogan {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 0;
}

.feature-list {
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.feature-item .el-icon {
  font-size: 1.5rem;
  margin-right: 15px;
  color: var(--accent-color);
}

.feature-item span {
  font-size: 1rem;
  color: var(--text-primary);
}

/* 右侧表单区域 */
.change-password-form-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.change-password-form-wrapper {
  width: 100%;
  max-width: 400px;
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.welcome-text {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.form-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 0;
}

.change-password-form {
  margin-bottom: 20px;
}

.change-password-button {
  background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
  border: none;
  height: 48px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.change-password-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--shadow-hover);
}

.change-password-button:disabled {
  background: var(--border-color) !important;
  color: var(--text-tertiary) !important;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.change-password-button:disabled:hover {
  transform: none;
  box-shadow: none;
}   

/* 密码强度指示器 */
.password-strength {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
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
  margin-bottom: 20px;
  padding: 15px;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.requirements-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.requirements-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

/* 表单底部 */
.form-footer {
  text-align: center;
}

.back-button {
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.back-button:hover {
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .change-password-container {
    flex-direction: column;
    max-width: 100%;
    margin: 10px;
  }
  
  .change-password-decoration {
    flex: none;
    border-radius: 20px 20px 0 0;
    padding: 20px;
  }
  
  .change-password-form-container {
    padding: 20px;
  }
  
  .logo-icon {
    font-size: 3rem;
  }
  
  .platform-name {
    font-size: 2rem;
  }
  
  .feature-item {
    padding: 10px;
  }
  
  .feature-item .el-icon {
    font-size: 1.2rem;
    margin-right: 10px;
  }
}

/* 错误和成功提示样式 */
.error-alert,
.success-alert {
  margin-top: 15px;
  border-radius: 8px;
}

.error-alert {
  border-left: 4px solid #ff4757;
}

.success-alert {
  border-left: 4px solid #2ed573;
}
</style>