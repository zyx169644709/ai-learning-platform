<template>
  <div class="edit-profile-page">
    <div class="edit-profile-container">
      <!-- 左侧装饰区域 -->
      <div class="edit-profile-decoration">
        <div class="decoration-content">
          <div class="logo-section">
            <div class="logo-icon">✏️</div>
            <h1 class="platform-name">编辑资料</h1>
            <p class="platform-slogan">完善您的个人信息</p>
          </div>
          <div class="feature-list">
            <div class="feature-item">
              <el-icon><User /></el-icon>
              <span>个性化用户名</span>
            </div>
            <div class="feature-item">
              <el-icon><Message /></el-icon>
              <span>绑定电子邮箱</span>
            </div>
            <div class="feature-item">
              <el-icon><EditPen /></el-icon>
              <span>随时更新资料</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧编辑表单 -->
      <div class="edit-profile-form-container">
        <div class="edit-profile-form-wrapper">
          <div class="form-header">
            <h2 class="welcome-text">编辑个人资料</h2>
            <p class="form-subtitle">修改您的用户名和电子邮箱</p>
          </div>

          <el-form
            ref="profileFormRef"
            :model="form"
            :rules="formRules"
            class="edit-profile-form"
            label-position="top"
            @keyup.enter="onSubmit"
          >
            <el-form-item label="用户名" prop="username">
              <el-input
                v-model="form.username"
                size="large"
                placeholder="请输入用户名"
                :prefix-icon="User"
                clearable
              />
            </el-form-item>

            <el-form-item label="电子邮箱" prop="email">
              <el-input
                v-model="form.email"
                size="large"
                placeholder="name@example.com"
                :prefix-icon="Message"
                clearable
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="submit-button"
                :loading="submitting"
                @click="onSubmit"
              >
                {{ submitting ? '保存中...' : '保存修改' }}
              </el-button>
            </el-form-item>

            <el-alert
              v-if="errorMsg"
              :title="errorMsg"
              type="error"
              :closable="false"
              show-icon
              class="error-alert"
            />

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
import { reactive, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { userService } from '@/services/userService'
import { useUserStore } from '@/stores/userStore'
import { ElMessage } from 'element-plus'
import { User, Message, EditPen } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const profileFormRef = ref<FormInstance>()
const form = reactive({ username: '', email: '' })
const submitting = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

onMounted(async () => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  try {
    const res = await userService.getProfile()
    if (res?.success && res.data?.user) {
      form.username = res.data.user.username || (res.data.user as any).name || ''
      form.email = res.data.user.email || ''
    }
  } catch {}
})

const onSubmit = async () => {
  if (!profileFormRef.value) return
  try {
    await profileFormRef.value.validate()
  } catch {
    return
  }

  if (submitting.value) return
  submitting.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const payload = { username: form.username, email: form.email }
    const res = await userService.updateProfile(payload)
    if (res?.success) {
      try {
        if (res.data?.user) {
          userStore.userInfo = { ...userStore.userInfo, ...res.data.user } as any
        } else {
          await userStore.loadUser()
        }
      } catch {}
      try {
        const raw = localStorage.getItem('userInfo')
        if (raw) {
          const cached = JSON.parse(raw)
          localStorage.setItem('userInfo', JSON.stringify({ ...cached, username: form.username, email: form.email }))
        }
      } catch {}
      successMsg.value = '资料修改成功！'
      ElMessage.success('资料修改成功！')
      setTimeout(() => {
        router.push('/profile')
      }, 1000)
    } else {
      errorMsg.value = res?.message || '修改失败，请重试'
    }
  } catch (e: any) {
    errorMsg.value = e?.response?.data?.message || '更新资料失败，请检查网络连接'
    console.error('更新资料失败', e)
  } finally {
    submitting.value = false
  }
}

const goBack = () => router.back()
</script>

<style scoped>
.edit-profile-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-secondary);
  padding: 20px;
  box-sizing: border-box;
  margin-top: -52px;
}

.edit-profile-container {
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
.edit-profile-decoration {
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

.edit-profile-decoration::before {
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
.edit-profile-form-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.edit-profile-form-wrapper {
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

.edit-profile-form {
  margin-bottom: 20px;
}

.submit-button {
  width: 100%;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
  border: none;
  height: 48px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--shadow-hover);
}

.submit-button:disabled {
  background: var(--border-color) !important;
  color: var(--text-tertiary) !important;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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

/* 错误和成功提示 */
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

/* 响应式设计 */
@media (max-width: 768px) {
  .edit-profile-container {
    flex-direction: column;
    max-width: 100%;
    margin: 10px;
  }

  .edit-profile-decoration {
    flex: none;
    border-radius: 20px 20px 0 0;
    padding: 20px;
  }

  .edit-profile-form-container {
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
</style>


