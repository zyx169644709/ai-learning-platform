<template>
  <div class="course-detail" v-if="course">
    <div class="breadcrumb">
      <RouterLink to="/courses">← 返回课程列表</RouterLink>
    </div>

    <!-- 暂不可用提示 -->
    <div class="unavailable-notice" v-if="isUnavailable">
      <span class="notice-icon">⚠️</span>
      <div class="notice-body">
        <strong>该课程目前暂时无法正常访问</strong>
        <span>课程资源可能已下架或链接失效，您仍可使用以下功能</span>
      </div>
    </div>

    <!-- 课程头部 -->
    <div class="course-header">
      <div class="course-cover">
        <img :src="coverUrl" alt="" referrerpolicy="no-referrer" @error="onCoverError" />
        <div class="cover-unavailable" v-if="isUnavailable">
          <span>⚠</span>
          <span>课程暂不可用</span>
        </div>
      </div>

      <div class="course-info">
        <h1 class="course-title">{{ course.title }}</h1>

        <div class="course-meta">
          <div class="meta-item" v-if="course.duration">
            <span class="meta-icon">⏱</span>
            <span class="meta-label">时长</span>
            <span class="meta-value">{{ course.duration }}</span>
          </div>
          <div class="meta-item" v-if="course.level">
            <span class="meta-icon">📊</span>
            <span class="meta-label">难度</span>
            <span class="meta-value">{{ levelText }}</span>
          </div>
          <div class="meta-break"></div>
          <div class="meta-item">
            <span class="meta-icon">👁</span>
            <span class="meta-label">浏览</span>
            <span class="meta-value">{{ (course.viewCount || 0).toLocaleString() }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">👤</span>
            <span class="meta-label">学习人数</span>
            <span class="meta-value">{{ (course.studentCount || 0).toLocaleString() }}</span>
          </div>
        </div>

        <div class="course-actions">
          <button class="action-btn primary" :class="{ disabled: isUnavailable }" @click="startCourse" :title="isUnavailable ? '课程暂时无法访问' : '立刻学习'">
            {{ isUnavailable ? '⚠ 暂不可用' : '立刻学习' }}
          </button>
          <button 
            class="action-btn favorite" 
            :class="{ 'favorited': isFavorited }"
            @click="toggleFavorite"
            :title="isFavorited ? '取消收藏' : '收藏课程'"
          >
            {{ isFavorited ? '★ 已收藏' : '☆ 收藏' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 课程内容 -->
    <div class="course-content" v-if="course.content">
      <h2>课程介绍</h2>
      <div class="content-body" v-html="renderedContent"></div>
    </div>

    <!-- B站视频嵌入播放器 -->
    <Teleport to="body">
      <div class="modal-backdrop" v-if="showPlayer" @click.self="closePlayer">
        <div class="modal">
          <div class="modal-header">
            <span class="modal-title">{{ course.title }}</span>
            <button class="modal-close" @click="closePlayer">✕</button>
          </div>
          <div class="modal-body">
            <iframe
              v-if="bvId"
              :src="`https://player.bilibili.com/player.html?bvid=${bvId}&autoplay=0&high_quality=1`"
              allowfullscreen
              frameborder="0"
              scrolling="no"
              class="bili-player"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>

  <!-- 加载状态 -->
  <div class="course-loading" v-else-if="loading">
    <div class="spinner"></div>
    <p>加载中...</p>
  </div>

  <!-- 未找到 -->
  <div class="course-not-found" v-else>
    <h2>课程未找到</h2>
    <p>该课程不存在或已被删除</p>
    <RouterLink to="/courses" class="back-link">返回课程列表</RouterLink>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import MarkdownIt from 'markdown-it'
import { favoriteService } from '@/services/favoriteService'
import { ElMessage } from 'element-plus'
import defaultCourseCoverSrc from '@/assets/images/course-beginner-cover.svg'

interface Course {
  id: string
  title: string
  level?: string
  cover?: string
  url: string
  status: string
  duration?: string
  content?: string
  viewCount: number
  studentCount: number
  createdAt: string
  updatedAt: string
}

const route = useRoute()
const course = ref<Course | null>(null)
const loading = ref(true)
const showPlayer = ref(false)
const isFavorited = ref(false)
const courseApiBase = 'http://localhost:3000'

const md = new MarkdownIt({ html: true, linkify: true })

const isUnavailable = computed(() => !course.value?.url)

const defaultCover = defaultCourseCoverSrc
const onCoverError = (e: Event) => {
  const img = e.target as HTMLImageElement
  if (img.src !== defaultCover) img.src = defaultCover
}

const resolveCourseCover = (cover?: string) => {
  const value = String(cover || '').trim()

  if (!value) return defaultCourseCoverSrc
  if (value.startsWith('http://') || value.startsWith('https://')) return value

  if (value.startsWith('/uploads/')) {
    return `${courseApiBase}${value}`
  }

  if (value.startsWith('/assets/')) {
    try {
      return new URL(value.replace('/assets/', '/src/assets/'), import.meta.url).href
    } catch {
      return value
    }
  }

  try {
    return new URL(value, `${courseApiBase}/`).href
  } catch {
    return value
  }
}

const coverUrl = computed(() => {
  return resolveCourseCover(course.value?.cover)
})

const levelText = computed(() => {
  const map: Record<string, string> = {
    beginner: '基础课程',
    intermediate: '进阶课程',
    advanced: '高级课程'
  }
  return map[course.value?.level || ''] || '课程'
})

const renderedContent = computed(() => {
  if (!course.value?.content) return ''
  return md.render(course.value.content)
})

const getBvId = (url?: string): string | null => {
  if (!url) return null
  const m = url.match(/BV[a-zA-Z0-9]+/)
  return m ? m[0] : null
}

const isBilibili = computed(() => !!getBvId(course.value?.url))
const bvId = computed(() => getBvId(course.value?.url))

const startCourse = () => {
  if (!course.value?.url) return
  // 学习人数+1
  fetch(`http://localhost:3000/api/courses/${course.value.id}/learn`, { method: 'POST' }).catch(() => {})

  if (isBilibili.value) {
    showPlayer.value = true
    document.body.style.overflow = 'hidden'
  } else {
    window.open(course.value.url, '_blank')
  }
}

const closePlayer = () => {
  showPlayer.value = false
  document.body.style.overflow = ''
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closePlayer()
}

// 检查收藏状态
const checkFavoriteStatus = async () => {
  if (!course.value) return
  try {
    const result = await favoriteService.checkFavorite('course', course.value.id)
    if (result.success) {
      isFavorited.value = result.favorited
    }
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

// 切换收藏状态
const toggleFavorite = async () => {
  if (!course.value) return
  try {
    const result = await favoriteService.toggleFavorite('course', course.value.id)
    if (result.success) {
      isFavorited.value = result.favorited
      ElMessage.success(result.message)
    }
  } catch (error: any) {
    console.error('收藏操作失败:', error)
    ElMessage.error(error.response?.data?.message || '操作失败，请重试')
  }
}

// 加载课程数据
const loadCourse = async () => {
  const id = route.params.id as string
  if (!id) return
  
  loading.value = true
  try {
    const res = await fetch(`${courseApiBase}/api/courses/${id}`)
    if (res.ok) {
      course.value = await res.json()
      // 浏览量+1
      fetch(`${courseApiBase}/api/courses/${id}/view`, { method: 'POST' }).catch(() => {})
      // 检查收藏状态
      await checkFavoriteStatus()
    } else {
      course.value = null
    }
  } catch (e) {
    console.error('加载课程详情失败', e)
    course.value = null
  } finally {
    loading.value = false
  }
}

// 监听路由参数变化
watch(() => route.params.id, () => {
  loadCourse()
}, { immediate: true })

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
  // 关闭播放器
  if (showPlayer.value) {
    showPlayer.value = false
  }
})
</script>

<style scoped>
.course-detail {
  max-width: 960px;
  margin: 0 auto;
  padding: 28px;
  line-height: 1.7;
  color: var(--text-primary);
}

.breadcrumb {
  margin-bottom: 24px;
}

.breadcrumb a {
  color: var(--accent-color);
  text-decoration: none;
  font-size: 14px;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

/* 暂不可用提示横幅 */
.unavailable-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 20px;
  color: #92400e;
}

:root.dark .unavailable-notice {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.4);
  color: #fcd34d;
}

.notice-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 1px;
}

.notice-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 14px;
}

.notice-body strong {
  font-weight: 700;
}

/* 封面上的不可用遮罩 */
.cover-unavailable {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 10px;
}

.cover-unavailable span:first-child {
  font-size: 28px;
  color: #f59e0b;
}

/* 禁用按钮样式 */
.action-btn.primary.disabled {
  background: var(--text-tertiary);
  cursor: not-allowed;
  opacity: 0.7;
}

.action-btn.primary.disabled:hover {
  background: var(--text-tertiary);
  transform: none;
}

/* 课程头部 */
.course-header {
  display: flex;
  gap: 28px;
  margin-bottom: 32px;
  padding: 28px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.course-cover {
  position: relative;
  width: 320px;
  height: 200px;
  flex-shrink: 0;
  border-radius: 10px;
  overflow: hidden;
  background-color: #eee;
}

.course-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}


.course-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.course-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 10px 0;
  color: var(--text-primary);
}

/* 元信息 */
.course-meta {
  display: flex;
  flex-wrap: wrap;
  column-gap: 20px;
  row-gap: 12px;
  margin-bottom: 16px;
}

.meta-break {
  flex-basis: 100%;
  height: 0px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.meta-icon {
  font-size: 16px;
}

.meta-label {
  color: var(--text-tertiary);
  font-weight: 500;
}

.meta-value {
  color: var(--text-primary);
  font-weight: 600;
}

/* 操作按钮 */
.course-actions {
  margin-top: auto;
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 12px 28px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: var(--accent-color);
  color: #fff;
}

.action-btn.primary:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn.favorite {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.action-btn.favorite:hover {
  background: var(--bg-secondary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn.favorite.favorited {
  background: #fff5f5;
  color: #ff6b6b;
  border-color: #ff6b6b;
}

.action-btn.favorite.favorited:hover {
  background: #ffe5e5;
}

/* 课程内容 */
.course-content {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 28px;
  border: 1px solid var(--border-color);
}

.course-content h2 {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 20px 0;
  color: var(--text-primary);
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.content-body {
  color: var(--text-secondary);
  line-height: 1.8;
  font-size: 15px;
}

.content-body :deep(h1),
.content-body :deep(h2),
.content-body :deep(h3) {
  color: var(--text-primary);
  margin-top: 24px;
  margin-bottom: 12px;
}

.content-body :deep(p) {
  margin-bottom: 12px;
}

.content-body :deep(ul),
.content-body :deep(ol) {
  padding-left: 20px;
  margin-bottom: 12px;
}

.content-body :deep(code) {
  background: var(--bg-primary);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}

.content-body :deep(pre) {
  background: var(--bg-primary);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 16px;
}

/* 视频播放模态框 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal {
  background: var(--bg-secondary, #fff);
  border-radius: 12px;
  width: 90vw;
  max-width: 900px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color, #eee);
}

.modal-title {
  font-weight: 600;
  font-size: 16px;
  color: var(--text-primary);
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 4px 8px;
  border-radius: 4px;
}

.modal-close:hover {
  background: var(--bg-primary, #f5f5f5);
}

.modal-body {
  padding: 0;
}

.bili-player {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: block;
}

/* 加载状态 */
.course-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: var(--text-secondary);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 未找到 */
.course-not-found {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
}

.course-not-found h2 {
  font-size: 24px;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.back-link {
  display: inline-block;
  margin-top: 16px;
  color: var(--accent-color);
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

/* 响应式 */
@media (max-width: 768px) {
  .course-header {
    flex-direction: column;
  }

  .course-cover {
    width: 100%;
    height: 200px;
  }

  .course-meta {
    gap: 12px;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
