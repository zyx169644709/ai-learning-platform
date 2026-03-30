<template>
  <div class="ai-panel">
    <!-- AI 智能工具 -->
    <div class="section">
      <h3 class="section-title">🤖 理论实操</h3>
      <div class="ai-buttons">
        <button class="ai-btn" @click="router.push('/api/deepseek')">
          <span class="ai-btn-icon">💬</span>
          <span class="ai-btn-text">知识问答</span>
        </button>
        <button class="ai-btn" @click="router.push('/code-playground')">
          <span class="ai-btn-icon">✏️</span>
          <span class="ai-btn-text">代码演练</span>
        </button>
      </div>
    </div>

    <!-- 学习进度 -->
    <div class="section" v-if="isLogin">
      <h3 class="section-title">📊 学习进度</h3>
      <div class="progress-card">
        <div class="progress-header">
          <span class="progress-label">已学章节</span>
          <span class="progress-value">{{ learnedCount }} / {{ totalChapters }}</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <div class="progress-footer">
          <span>完成度 {{ progressPercent }}%</span>
        </div>
      </div>
    </div>

    <!-- 最近收藏 -->
    <div class="section" v-if="isLogin">
      <h3 class="section-title">⭐ 最近收藏</h3>
      <div v-if="recentFavorites.length === 0" class="empty-tip">暂无收藏</div>
      <div v-else class="list">
        <div 
          v-for="item in recentFavorites" 
          :key="item.id" 
          class="list-item"
          @click="goToFavoriteItem(item)"
        >
          <span class="list-icon">{{ getTypeIcon(item.targetType) }}</span>
          <span class="list-text">{{ item.title }}</span>
        </div>
      </div>
      <router-link to="/my-favorites" class="section-link">查看全部 →</router-link>
    </div>

    <!-- 热门资源 -->
    <div class="section">
      <h3 class="section-title">🔥 热门资源</h3>
      <div v-if="hotResources.length === 0" class="empty-tip">暂无数据</div>
      <div v-else class="list">
        <div 
          v-for="item in hotResources" 
          :key="item.id" 
          class="list-item"
          @click="router.push(`/resource/${item.id}`)"
        >
          <span class="list-icon">📄</span>
          <div class="list-detail">
            <span class="list-text">{{ item.title }}</span>
            <span class="list-meta">👁 {{ item.viewCount || 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 社区动态 -->
    <div class="section">
      <h3 class="section-title">💬 社区动态</h3>
      <div v-if="recentDiscussions.length === 0" class="empty-tip">暂无讨论</div>
      <div v-else class="list">
        <div 
          v-for="item in recentDiscussions" 
          :key="item.id" 
          class="list-item"
          @click="router.push(`/discussion/${item.id}`)"
        >
          <span class="list-icon">💭</span>
          <div class="list-detail">
            <span class="list-text">{{ item.title }}</span>
            <span class="list-meta">{{ item.createdAt }}</span>
          </div>
        </div>
      </div>
      <router-link to="/community" class="section-link">进入社区 →</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { favoriteService } from '@/services/favoriteService'

const router = useRouter()
const userStore = useUserStore()

const isLogin = computed(() => userStore.isLogin)

// 学习进度
const learnedCount = ref(0)
const totalChapters = ref(1)
const progressPercent = computed(() => Math.min(100, Math.round((learnedCount.value / totalChapters.value) * 100)))

// 最近收藏
interface FavItem { id: string; targetType: string; title: string; targetId: string }
const recentFavorites = ref<FavItem[]>([])

// 热门资源
interface ResItem { id: string; title: string; viewCount: number }
const hotResources = ref<ResItem[]>([])

// 社区动态
interface DiscItem { id: string; title: string; createdAt: string }
const recentDiscussions = ref<DiscItem[]>([])

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = { course: '🎓', chapter: '📖', resource: '📄' }
  return icons[type] || '📚'
}

const goToFavoriteItem = (item: FavItem) => {
  const paths: Record<string, string> = { course: '/course/', chapter: '/chapter/', resource: '/resource/' }
  router.push((paths[item.targetType] || '/') + item.targetId)
}

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}天前`
  return d.toLocaleDateString('zh-CN')
}

const getDiscussionTimestamp = (item: any) => {
  const rawCreatedAt = item?.createdAt ? new Date(item.createdAt).getTime() : NaN
  if (!Number.isNaN(rawCreatedAt)) {
    return rawCreatedAt
  }

  const timeText = String(item?.time || '').trim()
  const now = Date.now()

  if (!timeText || timeText === '刚刚') {
    return now
  }

  const minuteMatch = timeText.match(/(\d+)\s*分钟前/)
  if (minuteMatch) {
    return now - Number(minuteMatch[1]) * 60 * 1000
  }

  const hourMatch = timeText.match(/(\d+)\s*小时前/)
  if (hourMatch) {
    return now - Number(hourMatch[1]) * 60 * 60 * 1000
  }

  const dayMatch = timeText.match(/(\d+)\s*天前/)
  if (dayMatch) {
    return now - Number(dayMatch[1]) * 24 * 60 * 60 * 1000
  }

  return 0
}

onMounted(async () => {
  // 加载热门资源
  try {
    const res = await fetch('/api/resources?status=published&limit=3&sort=viewCount')
    const json = await res.json()
    const items = json?.data?.items || json?.data || []
    if (Array.isArray(items)) {
      hotResources.value = items
        .sort((a: any, b: any) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 3)
        .map((r: any) => ({ id: r.id, title: r.title, viewCount: r.viewCount || 0 }))
    }
  } catch {}

  // 加载社区动态
  try {
    const res = await fetch('/api/community?limit=3')
    const json = await res.json()
    // API直接返回数组或 { data: [...] } 或 { data: { items: [...] } }
    const items = Array.isArray(json) ? json : (json?.data?.items || json?.data || [])
    if (Array.isArray(items)) {
      recentDiscussions.value = items
        .sort((a: any, b: any) => getDiscussionTimestamp(b) - getDiscussionTimestamp(a))
        .slice(0, 3)
        .map((d: any) => ({ id: d.id, title: d.title, createdAt: d.time || '' }))
    }
  } catch {}

  // 登录用户：加载收藏 + 学习进度
  if (userStore.isLogin) {
    try {
      const result = await favoriteService.getFavorites()
      const items = result?.data?.items || result?.data || []
      if (Array.isArray(items)) {
        recentFavorites.value = items.slice(0, 3)
          .filter((f: any) => f.target)
          .map((f: any) => ({
            id: f.id,
            targetType: f.targetType,
            targetId: f.target.id,
            title: f.target.title || '未知'
          }))
      }
    } catch {}

    // 学习进度：从数据库获取已完成小节数
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/chapters/progress/overview', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        learnedCount.value = json.data.reduce((sum: number, ch: any) => sum + (ch.completedCount || 0), 0)
        totalChapters.value = json.data.reduce((sum: number, ch: any) => sum + (ch.totalSections || 0), 0) || 1
      }
    } catch {}
  }
})
</script>

<style scoped>
.ai-panel {
  width: 280px;
  height: calc(100vh - 64px);
  background: var(--bg-primary);
  border-left: 1px solid var(--border-color);
  overflow-y: auto;
  position: fixed;
  top: 64px;
  right: 0;
  z-index: 1000;
  padding: 16px 14px;
}

/* 隐藏滚动条但可滚动 */
.ai-panel::-webkit-scrollbar { width: 4px; }
.ai-panel::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 2px; }

/* 区块 */
.section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

/* AI 按钮 */
.ai-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
}

.ai-btn:hover {
  border-color: var(--accent-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-hover);
}

.ai-btn-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.ai-btn-text {
  flex: 1;
  text-align: left;
}

/* 学习进度 */
.progress-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.progress-value {
  font-weight: 600;
  color: var(--accent-color);
}

.progress-bar-bg {
  width: 100%;
  height: 6px;
  background: var(--border-color);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-color), var(--accent-hover));
  border-radius: 3px;
  transition: width 0.6s ease;
}

.progress-footer {
  margin-top: 6px;
  font-size: 11px;
  color: var(--text-tertiary);
  text-align: right;
}

/* 列表 */
.list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.list-item:hover {
  background: var(--bg-secondary);
}

.list-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.list-detail {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.list-text {
  font-size: 13px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.list-meta {
  font-size: 11px;
  color: var(--text-tertiary);
}

.empty-tip {
  text-align: center;
  padding: 12px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.section-link {
  display: block;
  text-align: right;
  font-size: 12px;
  color: var(--accent-color);
  text-decoration: none;
  margin-top: 8px;
  padding-right: 4px;
}

.section-link:hover {
  text-decoration: underline;
}

/* 响应式 */
@media (max-width: 1200px) {
  .ai-panel { display: none; }
}
</style>
