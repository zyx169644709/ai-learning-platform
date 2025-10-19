<template>
  <div class="profile-page" v-if="userStore.isLogin">
    <div class="profile-container">
      <div class="profile-decoration">
        <div class="decoration-content">
          <div class="logo-section">
            <div class="logo-icon">👤</div>
            <h1 class="platform-name">个人中心</h1>
            <p class="platform-slogan">管理您的学习账户</p>
          </div>
          <div class="feature-list">
            <div class="feature-item">
              <el-icon>
                <User />
              </el-icon>
              <span>个人信息管理</span>
            </div>
            <div class="feature-item">
              <el-icon>
                <Setting />
              </el-icon>
              <span>账户设置</span>
            </div>
            <div class="feature-item">
              <el-icon>
                <Lock />
              </el-icon>
              <span>安全设置</span>
            </div>
            <div class="feature-item">
              <el-icon>
                <DataAnalysis />
              </el-icon>
              <span>学习统计</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧个人信息表单 -->
      <div class="profile-form-container">
        <div class="profile-form-wrapper">
          <div class="form-header">
            <h2 class="welcome-text">个人信息</h2>
            <p class="profile-subtitle">查看和管理您的账户信息</p>
          </div>

          <!-- 头像区域 -->
          <div class="avatar-section">
            <div class="avatar-container" title="点击查看头像大图">
              <img 
                class="avatar" 
                :src="userStore.avatar || defaultAvatar" 
                alt="用户头像" 
                @click="previewAvatar"
                style="pointer-events: auto;"
              />

              <!-- 测试按钮 -->
              <button 
                @click="previewAvatar" 
                style="position: absolute; top: -10px; right: -10px; z-index: 10; background: red; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; cursor: pointer;"
                title="测试按钮 - 点击预览头像"
              >
                T
              </button>
            </div>
            <div class="user-info">
              <div class="username-container">
                <h3 class="username">{{ userStore.displayName }}</h3>
                <el-button 
                  type="primary" 
                  size="small" 
                  class="change-avatar-btn"
                  @click="triggerAvatarChange"
                  :disabled="isLoading"
                  title="点击更换您的头像图片"
                >
                  更换头像
                </el-button>
                <input 
                  ref="avatarInputRef" 
                  type="file" 
                  accept="image/*" 
                  @change="onAvatarChange" 
                  style="display:none;" 
                />
              </div>
              <p class="role">{{ userStore.userInfo?.role || '普通用户' }}</p>
            </div>
          </div>

          <!-- 头像模态框 -->
          <div v-if="showAvatarModal" class="avatar-modal" @click.self="showAvatarModal = false">
            <!-- 调试信息 -->
            <div style="position: absolute; top: 10px; left: 10px; color: white; z-index: 10001;">
              模态框已打开 - showAvatarModal: {{ showAvatarModal }}
            </div>
            <div class="modal-content">
              <div class="modal-header">
                <h3>用户头像</h3>
                <button class="close-btn" @click="showAvatarModal = false" title="关闭头像预览">×</button>
              </div>
              <div class="modal-body">
                <img 
                  :src="userStore.avatar || defaultAvatar" 
                  class="avatar-large" 
                  @click="toggleAvatarEnlarged" 
                  title="点击查看更大尺寸的头像"
                />
                <div class="avatar-actions">
                  <label class="upload-btn" title="选择新的头像图片文件">
                    <span class="btn-icon">📷</span>
                    更换头像
                    <input type="file" accept="image/*" @change="onAvatarChange" style="display: none;" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- 放大的头像模态框 -->
          <div v-if="showEnlargedAvatar" class="enlarged-avatar-modal" @click="showEnlargedAvatar = false">
            <div class="enlarged-avatar-content">
              <img :src="userStore.avatar || defaultAvatar" class="avatar-enlarged" />
              <div class="enlarged-avatar-info">
                <span class="enlarged-avatar-text">点击任意位置关闭</span>
              </div>
            </div>
          </div>

          <!-- 个人信息表单 -->
          <el-form class="profile-form">
            <el-form-item title="用户名">
              <el-input :value="userStore.userInfo?.username || '未知'" size="large" placeholder="用户名" :prefix-icon="User"
                readonly />
            </el-form-item>



            <el-form-item title="邮箱">
              <el-input :value="userStore.userInfo?.email || '未绑定'" size="large" placeholder="邮箱" :prefix-icon="Message"
                readonly />
            </el-form-item>

            <el-form-item title="用户类型">
              <el-input :value="userStore.userInfo?.role || '普通用户'" size="large" placeholder="角色" :prefix-icon="Star"
                readonly />
            </el-form-item>

            <el-form-item title="注册时间">
              <el-input :value="formatDate(userStore.userInfo?.createdAt)" size="large" placeholder="注册时间"
                :prefix-icon="Calendar" readonly />
            </el-form-item>

            <el-form-item title="最后登录时间">
              <el-input :value="formatLastLogin(userStore.userInfo?.lastLoginAt)" size="large" placeholder="最后登录"
                :prefix-icon="Clock" readonly />
            </el-form-item>


          </el-form>

          <!-- 操作按钮区域 -->
          <div class="profile-actions">
            <el-button type="primary" size="large" class="profile-button" @click="goHome" :disabled="isLoading" title="返回平台主页">
              返回主页
            </el-button>
            <el-button type="danger" size="large" class="logout-button" @click="logout" :disabled="isLoading" title="退出当前登录账户">
              退出登录
            </el-button>
          </div>

          <!-- 其他操作 -->
          <div class="other-actions">
            <div class="divider">
              <span>其他操作</span>
            </div>
            <div class="action-buttons">
              <el-button class="action-btn" @click="changePassword" title="修改您的登录密码">
                <el-icon>
                  <Lock />
                </el-icon>
                修改密码
              </el-button>
              <el-button class="action-btn" @click="editProfile" title="编辑您的个人资料信息">
                <el-icon>
                  <Edit />
                </el-icon>
                编辑资料
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="not-logged-in">
    <div class="loading-content">
      <el-icon class="loading-icon">
        <Loading />
      </el-icon>
      <p>未登录，正在跳转...</p>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'
import { onMounted, onBeforeUnmount } from 'vue'
import { ref } from 'vue'
import defaultAvatar from '@/assets/images/default.png'
import { User, Setting, Lock, DataAnalysis, Camera, Edit, Loading, Calendar, Clock, Star, Message } from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()
const isLoading = ref(false)
let loadingPromise = null

// 加载用户信息的统一方法
const loadUserInfo = async () => {
  if (loadingPromise) {
    console.log('已有加载任务进行中，等待完成...')
    return loadingPromise
  }

  if (isLoading.value) {
    console.log('正在加载中，跳过重复请求')
    return
  }

  isLoading.value = true

  loadingPromise = (async () => {
    try {
      console.log('开始加载用户信息...')
      await userStore.loadUser()
      console.log('用户信息加载完成:', userStore.userInfo)

      // 加载后检查登录状态
      if (!userStore.isLogin) {
        console.log('加载后发现未登录，跳转到登录页')
        router.push('/login')
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
      // 发生错误时也检查登录状态
      if (!userStore.isLogin) {
        router.push('/login')
      }
    } finally {
      isLoading.value = false
      loadingPromise = null
    }
  })()

  return loadingPromise
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知'
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  } catch (error) {
    return '未知'
  }
}

// 格式化最后登录时间
const formatLastLogin = (dateString) => {
  if (!dateString) return '从未登录'
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      if (diffMinutes < 1) {
        return '刚刚'
      } else if (diffMinutes < 60) {
        return `${diffMinutes}分钟前`
      } else {
        return `${diffHours}小时前`
      }
    } else if (diffDays === 1) {
      return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour12: false })
    } else {
      return formatDate(dateString)
    }
  } catch (error) {
    return '未知'
  }
}

onMounted(async () => {
  console.log('Profile组件挂载')
  console.log('当前登录状态:', userStore.isLogin)
  console.log('当前用户信息:', userStore.userInfo)
  console.log('当前token:', userStore.token ? '存在' : '不存在')

  // 检查登录状态
  if (!userStore.isLogin) {
    console.log('用户未登录，跳转到登录页')
    router.push('/login')
    return
  }

  // 如果没有用户信息，加载用户信息
  if (!userStore.userInfo) {
    console.log('缺少用户信息，开始加载...')
    await loadUserInfo()
  } else {
    console.log('用户信息已存在，无需重新加载')
  }
})

onBeforeUnmount(() => {
  loadingPromise = null
})

const logout = async () => {
  try {
    console.log('开始登出...')
    await userStore.logout()
    console.log('登出成功，跳转到首页')
    router.push('/')
  } catch (error) {
    console.error('登出失败:', error)
    router.push('/')
  }
}

const goHome = () => {
  router.push('/')
}

const changePassword = () => {
  router.push('/change-password')
}

const editProfile = () => {
  router.push('/edit-profile')
}




const avatarInputRef = ref(null)
const showAvatarModal = ref(false)
const showEnlargedAvatar = ref(false)

const triggerAvatarChange = () => {
  avatarInputRef.value?.click()
}

const previewAvatar = () => {
  console.log('previewAvatar 被调用')
  showAvatarModal.value = true
  console.log('showAvatarModal 设置为:', showAvatarModal.value)
}

const toggleAvatarEnlarged = () => {
  showEnlargedAvatar.value = true
}

const onAvatarChange = async (e) => {
  const file = e.target.files[0]
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过2MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    const reader = new FileReader()
    reader.onload = async (evt) => {
      const avatarDataUrl = evt.target.result

      try {
        isLoading.value = true
        console.log('正在更新头像...')

        const result = await userStore.updateProfile({ avatar: avatarDataUrl })

        if (result.success) {
          alert('头像更新成功！')
        } else {
          alert('头像更新失败：' + (result.message || '未知错误'))
        }
      } catch (error) {
        console.error('头像更新错误:', error)
        alert('头像更新失败，请重试')
      } finally {
        isLoading.value = false
      }
    }

    reader.readAsDataURL(file)
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-secondary);
  padding: 20px;
  box-sizing: border-box;
}

.profile-container {
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
.profile-decoration {
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
.profile-decoration::before {
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
[data-theme="dark"] .profile-decoration::before {
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

/* 右侧表单区域强化主题 */
.profile-form-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  /* 用主题主背景 */
  background: var(--bg-primary);
  border-radius: 0 20px 20px 0;
}

.profile-form-wrapper {
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

.profile-subtitle {
  color: var(--text-secondary);
  margin: 0;
  font-size: 16px;
}

.avatar-section {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.avatar-container {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  border: 2px solid var(--border-color);
  transition: all 0.2s ease;
  margin-right: 20px;
  z-index: 1;
}

.avatar-container:hover {
  border-color: var(--accent-color);
  transform: scale(1.1);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.username-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.username {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.change-avatar-btn {
  background: var(--bg-secondary);
  color: var(--accent-color);
  border: 1px solid var(--accent-color);
  border-radius: 16px;
  padding: 0 12px;
  height: 32px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 10px;
}

.change-avatar-btn:hover {
  background: var(--accent-color);
  color: var(--bg-primary);
  box-shadow: 0 8px 25px var(--shadow-hover);
}

.change-avatar-btn .el-icon {
  font-size: 14px;
}

.role {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

.profile-form {
  margin-bottom: 30px;
}

.profile-form .el-form-item {
  margin-bottom: 20px;
}

.profile-form .el-input {
  --el-input-border-radius: 12px;
  --el-input-height: 50px;
}

/* 表单输入框深度适配 */
.profile-form .el-input__wrapper {
  box-shadow: 0 2px 8px var(--shadow-color);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  /* 输入框背景与页面统一 */
  background: var(--bg-primary);
}

.profile-form .el-input__wrapper:hover {
  border-color: var(--accent-color);
  box-shadow: 0 4px 12px var(--shadow-hover);
}

.profile-form .el-input__wrapper.is-focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px var(--shadow-color);
}

.profile-form .el-input__inner {
  background: var(--bg-primary);
  /* 文字色与主题统一 */
  color: var(--text-primary);
}

.profile-form .el-input__inner::placeholder {
  color: var(--text-tertiary);
}

/* 悬停提示样式优化 */
.profile-form .el-form-item {
  position: relative;
  cursor: help;
}

.profile-form .el-form-item:hover {
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

.profile-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 30px;
}

.profile-button,
.logout-button {
  flex: 1;
  height: 50px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 按钮强化主题 */
.profile-button {
  background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-hover) 100%);
  color: var(--bg-primary);
  /* 文字用主背景色更协调 */
}

.profile-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--shadow-hover);
}

.logout-button {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  color: var(--bg-primary);
}

.logout-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(229, 62, 62, 0.3);
}

.other-actions {
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

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}

.action-btn {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
  transform: translateY(-2px);
}

.action-btn .el-icon {
  font-size: 16px;
}



.not-logged-in {
  min-height: 80vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-secondary);
}

.loading-content {
  text-align: center;
  padding: 40px;
  background: var(--bg-primary);
  border-radius: 15px;
  box-shadow: 0 5px 20px var(--shadow-color);
}

.loading-icon {
  font-size: 60px;
  color: var(--accent-color);
  margin-bottom: 20px;
}

/* 响应式优化（保持原有逻辑，强化主题） */
@media (max-width: 768px) {
  .profile-container {
    flex-direction: column;
    border-radius: 20px;
    width: 100%;
    max-height: 100%;
  }

  .profile-decoration {
    border-radius: 20px 20px 0 0;
    /* 小屏幕下弱化渐变 */
    background: var(--bg-secondary);
  }

  .profile-form-container {
    padding: 30px 20px;
    border-radius: 0 0 20px 20px;
  }

  .welcome-text {
    font-size: 24px;
  }

  .profile-form .el-input {
    --el-input-height: 44px;
  }

  .profile-button,
  .logout-button {
    height: 44px;
  }

  .avatar-container {
    width: 60px;
    height: 60px;
  }

  .overlay-icon {
    font-size: 24px;
  }

  .username {
    font-size: 20px;
  }

  .username-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .change-avatar-btn {
    height: 28px;
    padding: 0 10px;
    font-size: 11px;
    background: var(--bg-secondary);
    color: var(--accent-color);
    border: 1px solid var(--accent-color);
  }

  /* 头像模态框响应式调整 */
  .modal-content {
    width: 95%;
    max-width: 350px;
  }

  .avatar-large {
    width: 100px;
    height: 100px;
  }

  .avatar-enlarged {
    width: 300px;
    height: 300px;
  }
}

@media (max-width: 480px) {
  .profile-page {
    padding: 10px;
  }

  .profile-container {
    width: 100%;
    max-height: 100%;
  }

  .profile-form-container {
    padding: 20px 16px;
  }

  .profile-actions {
    flex-direction: column;
  }

  .action-buttons {
    flex-direction: column;
  }
}

/* 头像模态框样式 */
.avatar-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: 0 4px 15px var(--shadow-color);
  width: 90%;
  max-width: 400px;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: 24px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: var(--text-primary);
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  overflow-y: auto;
}

.avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--accent-color);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-large:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(66, 184, 131, 0.5);
}

.avatar-actions {
  display: flex;
  gap: 10px;
}

.upload-btn {
  background: var(--accent-color);
  color: var(--bg-primary);
  border: 1px solid var(--accent-color);
  border-radius: 6px;
  padding: 10px 15px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.upload-btn:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
  box-shadow: 0 4px 12px var(--shadow-hover);
}

.upload-btn input[type="file"] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

/* 放大的头像模态框 */
.enlarged-avatar-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  cursor: pointer;
}

.enlarged-avatar-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 90%;
  max-height: 90%;
}

.avatar-enlarged {
  width: 400px;
  height: 400px;
  border-radius: 50%;
  object-fit: cover;
  border: 5px solid var(--accent-color);
  box-shadow: 0 0 30px rgba(66, 184, 131, 0.6);
  animation: avatarEnlarge 0.3s ease-out;
}

.enlarged-avatar-info {
  text-align: center;
}

.enlarged-avatar-text {
  color: var(--text-secondary);
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

@keyframes avatarEnlarge {
  from {
    opacity: 0;
    transform: scale(0.8);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
