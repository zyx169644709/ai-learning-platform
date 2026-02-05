<template>
  <div class="search-results-page">
    <div class="search-content">
      <!-- <div class="search-container">
        <div class="search-icon">🔍</div>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="搜索课程、资源、社区..." 
          class="search-input"
          @keyup.enter="performSearch"
          ref="searchInputRef"
        />
        <button class="search-btn" @click="performSearch" :disabled="!searchQuery.trim()">
          搜索
        </button>
      </div> -->
      <div class="search-info" v-if="searchQuery">
        <h1 class="search-title">
          搜索结果
          <span class="search-term">"{{ searchQuery }}"</span>
        </h1>
        <div class="search-stats">
          <span class="results-count">{{ searchResults.length }} 个结果</span>
          <span class="search-time" v-if="searchTime">用时 {{ searchTime }}ms</span>
        </div>
      </div>

      <!-- 筛选器 -->
      <div class="filters" v-if="searchQuery">
        <div class="filter-group">
          <label class="filter-label">类型筛选：</label>
          <div class="filter-buttons">
            <button 
              v-for="type in typeOptions" 
              :key="type.value"
              :class="['filter-btn', { active: selectedType === type.value }]"
              @click="selectedType = type.value"
            >
              {{ type.icon }} {{ type.label }}
            </button>
          </div>
        </div>
        <div class="filter-group">
          <label class="filter-label">排序方式：</label>
          <select v-model="sortBy" class="sort-select">
            <option value="relevance">相关度</option>
            <option value="title">标题</option>
            <option value="type">类型</option>
          </select>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div class="results-container">
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>正在搜索...</p>
        </div>

        <div v-else-if="filteredResults.length > 0" class="results-list">
          <div 
            v-for="result in paginatedResults" 
            :key="result.id" 
            class="result-card"
            @click="goToResult(result)"
          >
            <div class="result-header">
              <div class="result-icon">{{ getResultIcon(result.type) }}</div>
              <div class="result-meta">
                <span class="result-type">{{ getResultTypeName(result.type) }}</span>
                <span class="result-relevance">相关度: {{ Math.round(result.relevance * 100) }}%</span>
              </div>
            </div>
            
            <h3 class="result-title" v-html="highlightSearchTerm(result.title)"></h3>
            <p class="result-description" v-html="highlightSearchTerm(result.description)"></p>
            
            <div v-if="result.tags && result.tags.length > 0" class="result-tags">
              <span v-for="tag in result.tags.slice(0, 4)" :key="tag" class="result-tag">
                {{ tag }}
              </span>
            </div>
            
            <div class="result-footer">
              <span class="result-url">{{ result.url }}</span>
              <button class="go-btn">查看详情 →</button>
            </div>
          </div>
        </div>

        <div v-else-if="searchQuery && !isLoading" class="no-results">
          <div class="no-results-icon">🔍</div>
          <h3>未找到相关结果</h3>
          <p>试试其他关键词，或者检查拼写是否正确</p>
          <div class="suggestions">
            <h4>推荐搜索：</h4>
            <div class="suggestion-tags">
              <button 
                v-for="suggestion in suggestions" 
                :key="suggestion"
                class="suggestion-tag"
                @click="searchSuggestion(suggestion)"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>
        </div>

        <div v-else class="welcome-state">
          <div class="welcome-icon">🔍</div>
          <h2>开启 Vue 探索</h2>
          <p>输入关键词搜索课程、技术文档或社区讨论</p>
          <div class="popular-searches">
            <h4>热门技术：</h4>
            <div class="popular-tags">
              <button 
                v-for="popular in popularSearches" 
                :key="popular"
                class="popular-tag"
                @click="searchSuggestion(popular)"
              >
                {{ popular }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          class="page-btn" 
          :disabled="currentPage === 1"
          @click="currentPage = 1"
        >
          首页
        </button>
        <button 
          class="page-btn" 
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          上一页
        </button>
        
        <span class="page-info">
          第 {{ currentPage }} 页，共 {{ totalPages }} 页
        </span>
        
        <button 
          class="page-btn" 
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          下一页
        </button>
        <button 
          class="page-btn" 
          :disabled="currentPage === totalPages"
          @click="currentPage = totalPages"
        >
          末页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchService, type SearchResult } from '@/services/searchService'

const route = useRoute()
const router = useRouter()

// 响应式数据
const searchQuery = ref('')
const searchResults = ref<SearchResult[]>([])
const isLoading = ref(false)
const searchTime = ref(0)
const selectedType = ref('all')
const sortBy = ref('relevance')
const currentPage = ref(1)
const pageSize = 10

// 类型选项
const typeOptions = [
  { value: 'all', label: '全部', icon: '🔍' },
  { value: 'course', label: '课程', icon: '📚' },
  { value: 'resource', label: '资源', icon: '📖' },
  { value: 'community', label: '社区', icon: '💬' },
  { value: 'chapter', label: '章节', icon: '📑' },
  { value: 'section', label: '小节', icon: '📝' }
]

// 建议和热门搜索
const suggestions = ref<string[]>([])
const popularSearches = ref<string[]>([])

// 计算属性
const filteredResults = computed(() => {
  let results = searchResults.value

  // 类型筛选
  if (selectedType.value !== 'all') {
    results = results.filter((result: SearchResult) => result.type === selectedType.value)
  }

  // 排序
  results = [...results].sort((a, b) => {
    switch (sortBy.value) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'type':
        return a.type.localeCompare(b.type)
      case 'relevance':
      default:
        return b.relevance - a.relevance
    }
  })

  return results
})

const totalPages = computed(() => {
  return Math.ceil(filteredResults.value.length / pageSize)
})

const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredResults.value.slice(start, end)
})

// 方法
const performSearch = async () => {
  if (!searchQuery.value.trim()) return

  isLoading.value = true
  const startTime = Date.now()

  try {
    const results = await searchService.search({ 
      query: searchQuery.value,
      limit: 100 // 获取更多结果用于分页
    })
    
    searchResults.value = results
    searchTime.value = Date.now() - startTime
    currentPage.value = 1 // 重置到第一页
    
    // 保存搜索历史
    searchService.saveSearchHistory(searchQuery.value)
  } catch (error) {
    console.error('搜索失败:', error)
    searchResults.value = []
  } finally {
    isLoading.value = false
  }
}

const searchSuggestion = (suggestion: string) => {
  searchQuery.value = suggestion
  performSearch()
}

const goToResult = (result: SearchResult) => {
  // 检查是否是外部链接
  if (result.url.startsWith('http://') || result.url.startsWith('https://')) {
    // 外部链接在新窗口打开
    window.open(result.url, '_blank')
  } else {
    // 内部链接在当前窗口打开
    router.push(result.url)
  }
}

const getResultIcon = (type: string) => {
  const icons = {
    course: '📚',
    resource: '📖',
    community: '💬',
    chapter: '📑',
    section: '📝'
  }
  return icons[type as keyof typeof icons] || '🔗'
}

const getResultTypeName = (type: string) => {
  const names = {
    course: '课程',
    resource: '资源',
    community: '社区',
    chapter: '章节',
    section: '小节'
  }
  return names[type as keyof typeof names] || '其他'
}

const highlightSearchTerm = (text: string) => {
  if (!searchQuery.value.trim()) return text
  
  const regex = new RegExp(`(${searchQuery.value})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// 监听路由参数变化
watch(() => route.query.q, (newQuery) => {
  if (newQuery && typeof newQuery === 'string') {
    searchQuery.value = newQuery
    performSearch()
  }
}, { immediate: true })

// 监听筛选条件变化
watch([selectedType, sortBy], () => {
  currentPage.value = 1
})

// 初始化
onMounted(async () => {
  // 从URL参数获取搜索词
  const query = route.query.q
  if (query && typeof query === 'string') {
    searchQuery.value = query
    await performSearch()
  }

  // 加载建议和热门搜索
  suggestions.value = await searchService.getSuggestions('')
  popularSearches.value = await searchService.getPopularSearches()
})
</script>

<style scoped>
.search-results-page {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.search-header {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  padding: 20px 0;
  position: sticky;
  top: 64px;
  z-index: 100;
}

.search-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 12px 16px;
  transition: all 0.3s ease;
}

.search-container:focus-within {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

.search-icon {
  font-size: 18px;
  color: var(--text-tertiary);
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 16px;
  padding: 0;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-btn:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-info {
  margin-bottom: 24px;
}

.search-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--text-primary);
}

.search-term {
  color: var(--accent-color);
  font-weight: 600;
}

.search-stats {
  display: flex;
  gap: 16px;
  color: var(--text-secondary);
  font-size: 14px;
}

.filters {
  display: flex;
  gap: 32px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.filter-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  background: var(--bg-primary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.filter-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent-color);
}

.filter-btn.active {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.sort-select {
  width: 85px;
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  appearance: none;
  background-image: url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="%23666" d="M2 0L0 2h4zm0 5L0 3h4z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 12px;
}

.results-container {
  min-height: 400px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
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

.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.result-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--accent-color);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--shadow-hover);
  border-color: var(--accent-color);
}

.result-card:hover::before {
  transform: scaleY(1);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.result-icon {
  font-size: 20px;
  color: var(--accent-color);
}

.result-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.result-type {
  background: var(--bg-tertiary);
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.result-relevance {
  color: var(--accent-color);
  font-weight: 600;
  margin-left: 10px;
}

.result-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.result-title :deep(mark) {
  background: rgba(66, 184, 131, 0);
  color: #2f855a; 
  padding: 0 3px;
  border-radius: 3px;
}

.result-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.result-description :deep(mark) {
  background: rgba(66, 184, 131, 0);
  color: #2f855a;
  padding: 0 3px;
  border-radius: 3px;
}

.result-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.result-tag {
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
}

.result-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.result-url {
  color: var(--text-tertiary);
  font-size: 12px;
  font-family: monospace;
}

.go-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.go-btn:hover {
  background: var(--accent-hover);
  transform: translateX(2px);
}

.no-results, .welcome-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.no-results-icon, .welcome-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.no-results h3, .welcome-state h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--text-primary);
}

.no-results p, .welcome-state p {
  font-size: 16px;
  margin: 0 0 24px 0;
}

.suggestions, .popular-searches {
  margin-top: 24px;
}

.suggestions h4, .popular-searches h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--text-primary);
}

.suggestion-tags, .popular-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.suggestion-tag, .popular-tag {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-tag:hover, .popular-tag:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
  transform: translateY(-1px);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 32px;
  padding: 20px;
}

.page-btn {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-container {
    flex-direction: column;
    gap: 12px;
  }

  .search-input {
    width: 100%;
  }

  .filters {
    flex-direction: column;
    gap: 16px;
  }

  .filter-group {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-buttons {
    width: 100%;
  }

  .result-card {
    padding: 16px;
  }

  .result-footer {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .pagination {
    flex-wrap: wrap;
  }
}
</style>
