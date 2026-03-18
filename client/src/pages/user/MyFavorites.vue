<template>
  <div class="my-favorites">
    <div class="page-header">
      <h1 class="page-title">我的收藏</h1>
      <p class="page-description">管理您收藏的课程、章节和资源</p>
    </div>

    <!-- 筛选标签 -->
    <div class="filter-tabs">
      <button 
        v-for="tab in filterTabs" 
        :key="tab.value"
        class="filter-tab"
        :class="{ 'active': activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-text">{{ tab.label }}</span>
        <span class="tab-count">({{ getTabCount(tab.value) }})</span>
      </button>
    </div>

    <!-- 收藏内容 -->
    <div class="favorites-content">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="filteredFavorites.length === 0" class="empty-state">
        <div class="empty-icon">{{ getEmptyIcon() }}</div>
        <h3 class="empty-title">{{ getEmptyTitle() }}</h3>
        <p class="empty-description">{{ getEmptyDescription() }}</p>
        <router-link :to="getEmptyActionLink()" class="empty-action">
          {{ getEmptyActionText() }}
        </router-link>
      </div>

      <div v-else class="favorites-grid">
        <!-- 课程收藏 -->
        <div 
          v-for="item in filteredFavorites" 
          :key="`${item.targetType}-${item.targetId}`"
          class="favorite-card"
          :class="`favorite-${item.targetType}`"
          @click="goToItem(item)"
        >
          <div class="card-header">
            <div class="card-type">
              <span class="type-icon">{{ getTypeIcon(item.targetType) }}</span>
              <span class="type-text">{{ getTypeText(item.targetType) }}</span>
            </div>
            <button 
              class="favorite-toggle-btn"
              :class="{ 'is-favorited': item.isFavorited }"
              @click.stop="toggleFavoriteStatus(item)"
              :title="item.isFavorited ? '取消收藏' : '重新收藏'"
            >
              {{ item.isFavorited ? '★' : '☆' }}
            </button>
          </div>

          <div class="card-content">
            <h3 class="card-title">{{ item.title }}</h3>
            <p class="card-description">{{ item.description }}</p>
            
            <div class="card-meta">
              <span class="meta-item">
                <span class="meta-icon">📅</span>
                <span class="meta-text">{{ formatDate(item.createdAt) }}</span>
              </span>
              <span v-if="item.author" class="meta-item">
                <span class="meta-icon">👤</span>
                <span class="meta-text">{{ item.author }}</span>
              </span>
            </div>

            <div v-if="item.tags && item.tags.length > 0" class="card-tags">
              <span 
                v-for="tag in item.tags.slice(0, 3)" 
                :key="tag" 
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { favoriteService } from '@/services/favoriteService'
import { ElMessage } from 'element-plus'

const router = useRouter()

interface FavoriteItem {
  id: string
  targetType: 'course' | 'chapter' | 'resource'
  targetId: string
  title: string
  description: string
  author?: string
  tags?: string[]
  createdAt: string
  url?: string
  cover?: string
  isFavorited: boolean
}

const loading = ref(true)
const favorites = ref<FavoriteItem[]>([])
const activeTab = ref<'all' | 'course' | 'chapter' | 'resource'>('all')

const filterTabs = [
  { value: 'all' as const, label: '全部', icon: '📚' },
  { value: 'course' as const, label: '课程', icon: '🎓' },
  { value: 'chapter' as const, label: '章节', icon: '📖' },
  { value: 'resource' as const, label: '资源', icon: '📄' }
]

const filteredFavorites = computed(() => {
  if (activeTab.value === 'all') {
    return favorites.value
  }
  return favorites.value.filter(item => item.targetType === activeTab.value)
})

const getTabCount = (tabValue: string) => {
  if (tabValue === 'all') {
    return favorites.value.length
  }
  return favorites.value.filter(item => item.targetType === tabValue).length
}

const getTypeIcon = (type: string) => {
  const icons = {
    course: '🎓',
    chapter: '📖',
    resource: '📄'
  }
  return icons[type as keyof typeof icons] || '📚'
}

const getTypeText = (type: string) => {
  const texts = {
    course: '课程',
    chapter: '章节',
    resource: '资源'
  }
  return texts[type as keyof typeof texts] || '内容'
}

const getEmptyIcon = () => {
  const icons = {
    all: '📚',
    course: '🎓',
    chapter: '📖',
    resource: '📄'
  }
  return icons[activeTab.value] || '📚'
}

const getEmptyTitle = () => {
  const titles = {
    all: '暂无收藏内容',
    course: '暂无收藏课程',
    chapter: '暂无收藏章节',
    resource: '暂无收藏资源'
  }
  return titles[activeTab.value] || '暂无收藏内容'
}

const getEmptyDescription = () => {
  const descriptions = {
    all: '开始探索并收藏您感兴趣的课程、章节和资源吧！',
    course: '浏览课程页面，收藏您感兴趣的课程',
    chapter: '在学习过程中收藏重要的章节内容',
    resource: '发现有用的资源并添加到收藏夹'
  }
  return descriptions[activeTab.value] || '开始探索并收藏内容吧！'
}

const getEmptyActionLink = () => {
  const links = {
    all: '/courses',
    course: '/courses',
    chapter: '/courses',
    resource: '/resources'
  }
  return links[activeTab.value] || '/courses'
}

const getEmptyActionText = () => {
  const texts = {
    all: '浏览课程',
    course: '浏览课程',
    chapter: '浏览课程',
    resource: '浏览资源'
  }
  return texts[activeTab.value] || '开始浏览'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const goToItem = (item: FavoriteItem) => {
  let path = ''
  switch (item.targetType) {
    case 'course':
      path = `/course/${item.targetId}`
      break
    case 'chapter':
      // 假设章节路径格式，需要根据实际情况调整
      path = `/chapter/${item.targetId}`
      break
    case 'resource':
      path = `/resource/${item.targetId}`
      break
  }
  if (path) {
    router.push(path)
  }
}

const toggleFavoriteStatus = async (item: FavoriteItem) => {
  try {
    const result = await favoriteService.toggleFavorite(item.targetType, item.targetId)
    if (result.success) {
      item.isFavorited = result.favorited
      ElMessage.success(result.favorited ? '已收藏' : '已取消收藏')
    } else {
      ElMessage.error(result.message || '操作失败')
    }
  } catch (error: any) {
    console.error('收藏操作失败:', error)
    ElMessage.error('操作失败，请重试')
  }
}

const loadFavorites = async () => {
  loading.value = true
  try {
    const result = await favoriteService.getFavorites()
    // 后端返回格式: { success, data: { items: [{ id, targetType, createdAt, target: {...} }] } }
    const items = result?.data?.items || result?.data || []
    if (result.success && Array.isArray(items)) {
      favorites.value = items
        .filter((item: any) => item.target) // 过滤掉已被删除的关联数据
        .map((item: any) => {
          const t = item.target
          return {
            id: item.id,
            targetType: item.targetType,
            targetId: t.id,
            title: t.title || '未知标题',
            description: t.description || t.excerpt || '',
            tags: Array.isArray(t.tags) ? t.tags : [],
            createdAt: item.createdAt,
            url: t.url,
            cover: t.cover,
            isFavorited: true
          }
        })
    } else {
      favorites.value = []
    }
  } catch (error) {
    console.error('加载收藏列表失败:', error)
    ElMessage.error('加载收藏列表失败')
    favorites.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadFavorites()
})
</script>

<style scoped>
.my-favorites {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  min-height: calc(100vh - 64px);
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.page-description {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  justify-content: center;
  flex-wrap: wrap;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
}

.filter-tab:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent-color);
  color: var(--text-primary);
}

.filter-tab.active {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: #fff;
}

.tab-icon {
  font-size: 16px;
}

.tab-count {
  font-size: 12px;
  opacity: 0.8;
}

.favorites-content {
  min-height: 400px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.empty-description {
  font-size: 16px;
  margin: 0 0 24px 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.empty-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--accent-color);
  color: #fff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.empty-action:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.favorite-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.favorite-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px var(--shadow-hover);
  border-color: var(--accent-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-type {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: var(--bg-tertiary);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.type-icon {
  font-size: 14px;
}

.type-text {
  color: var(--text-secondary);
}

.favorite-toggle-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: #ccc;
  line-height: 1;
}

.favorite-toggle-btn.is-favorited {
  color: #ff6b6b;
}

.favorite-toggle-btn:hover {
  transform: scale(1.2);
  background: rgba(255, 107, 107, 0.08);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.card-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 16px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.meta-icon {
  font-size: 12px;
}

.card-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  background: var(--accent-color);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.favorite-course {
  border-left: 4px solid #3b82f6;
}

.favorite-chapter {
  border-left: 4px solid #10b981;
}

.favorite-resource {
  border-left: 4px solid #f59e0b;
}

@media (max-width: 768px) {
  .my-favorites {
    padding: 24px 16px;
  }
  
  .favorites-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-tabs {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 8px;
  }
  
  .filter-tab {
    flex-shrink: 0;
  }
}
</style>
