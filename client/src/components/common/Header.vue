<template>
  <header class="app-header">
    <div class="header-container">
      <div class="logo-section">
        <div class="logo" @click="goWelcome">
          <div class="logo-img-container">
            <img src="@/assets/images/AI-Learning.png" alt="AI Learning Logo" class="logo-img">
          </div>
          <h1 class="logo-title">AI Learning</h1>
        </div>
      </div>
      <div class="header-container-left">
        <div class="search-section">
          <div class="search-container">
            <div class="search-icon">🔍</div>
            <input type="text" v-model="searchQuery" placeholder="搜索课程..." class="search-input"
              @keyup.enter="handleSearchEnter" @keydown.arrow-down="handleArrowDown" @keydown.arrow-up="handleArrowUp" 
              @keydown.escape="closeSearchResults" ref="searchInputRef" @input="handleSearchInput" 
              @focus="showSearchSuggestions" @blur="handleSearchBlur" />
            <div v-if="searchQuery.trim()" class="search-clear" @click="clearSearch">
              ✕
            </div>
            <div v-else-if="isSearching" class="search-loading">
              <div class="loading-spinner"></div>
            </div>
          </div>
          
          <!-- 搜索建议和结果下拉框 -->
          <div v-if="showSearchResults" class="search-results-dropdown">
            <!-- 搜索建议 -->
            <div v-if="!searchQuery.trim() && searchSuggestions.length > 0" class="search-suggestions">
              <div class="suggestions-header">
                <span class="suggestions-title">搜索建议</span>
                <button class="clear-history-btn" @click="clearSearchHistory" v-if="searchHistory.length > 0">
                  清空历史
                </button>
              </div>
              <div v-if="searchHistory.length > 0" class="search-history">
                <div class="history-title">搜索历史</div>
                <div v-for="item in searchHistory" :key="item" 
                     class="search-history-item"
                     @click="selectSearchSuggestion(item)">
                  <span class="history-icon">🕒</span>
                  <span class="history-text">{{ item }}</span>
                </div>
              </div>
              <div class="popular-searches">
                <div class="popular-title">热门搜索</div>
                <div v-for="item in searchSuggestions" :key="item" 
                     class="search-suggestion-item"
                     @click="selectSearchSuggestion(item)">
                  <span class="suggestion-icon">🔥</span>
                  <span class="suggestion-text">{{ item }}</span>
                </div>
              </div>
            </div>
            
            <!-- 搜索结果 -->
            <div v-else-if="searchQuery.trim()">
              <div v-if="searchResults.length > 0">
                <div v-for="(result, index) in searchResults" 
                     :key="result.id" 
                     class="search-result-item"
                     :class="{ 'selected': selectedIndex === index }"
                     @click="selectSearchResult(result)">
                  <div class="result-icon">
                    {{ getResultIcon(result.type) }}
                  </div>
                  <div class="result-content">
                    <div class="result-title">{{ result.title }}</div>
                    <div class="result-description">{{ result.description }}</div>
                    <div v-if="result.tags && result.tags.length > 0" class="result-tags">
                      <span v-for="tag in result.tags.slice(0, 3)" :key="tag" class="result-tag">
                        {{ tag }}
                      </span>
                    </div>
                  </div>
                  <div class="result-type">{{ getResultTypeName(result.type) }}</div>
                </div>
              </div>
              <div v-else-if="!isSearching && searchQuery.trim()" class="no-results">
                <div class="no-results-icon">🔍</div>
                <div class="no-results-text">未找到相关结果</div>
                <div class="no-results-suggestions">
                  试试其他关键词，如：{{ getAlternativeSuggestions() }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="nav-section">
          <nav class="main-nav">
            <router-link to="/home" class="nav-link" exact-active-class="nav-link-active">
              首页
            </router-link>
            <router-link to="/courses" class="nav-link" active-class="nav-link-active">
              课程
            </router-link>
            <router-link to="/resources" class="nav-link" active-class="nav-link-active">
              资源
            </router-link>
            <router-link to="/community" class="nav-link" active-class="nav-link-active">
              社区
            </router-link>
          </nav>
        </div>
      </div>

      <div class="header-container-right">
        <div class="user-section">
          <div class="user-area" v-if="!userStore.isLogin">
            <button class="auth-btn login-btn" @click="goToLogin">
              <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M10 17L15 12L10 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              登录
            </button>
            <button class="auth-btn register-btn" @click="goToRegister">
              <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path
                  d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M20 8V14" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path d="M23 11H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              注册
            </button>
          </div>

          <div class="user-area logged-in" v-else>
            <div class="user-info">
              <span class="user-name">用户 {{ userStore.displayName }}</span>
              <div class="user-status">
                <div class="status-dot"></div>
                <span class="status-text">在线</span>
              </div>
            </div>

            <div class="avatar-container" @click="showAvatarModal = true">
              <img :src="avatarSrc" alt="头像" class="avatar-img" />
            </div>

            <div class="user-actions">
              <button class="action-btn profile-btn auth-btn" @click="goToProfile">
                <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <path
                    d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                个人中心
              </button>
              <button class="action-btn logout-btn auth-btn" @click="logout">
                <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                  <path d="M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
                退出登录
              </button>
            </div>

            <div v-if="showAvatarModal" class="avatar-modal" @click.self="showAvatarModal = false">
              <div class="modal-content">
                <div class="modal-header">
                  <h3>用户头像</h3>
                  <button class="close-btn" @click="showAvatarModal = false">×</button>
                </div>
                <div class="modal-body">
                  <img :src="avatarSrc" class="avatar-large" @click="toggleAvatarEnlarged" />
                  <div class="avatar-actions">
                    <label class="upload-btn">
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
                <img :src="avatarSrc" class="avatar-enlarged" />
                <div class="enlarged-avatar-info">
                  <span class="enlarged-avatar-text">点击任意位置关闭</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="tools-section">
          <div class="tool-icons">
            <button class="tool-btn" title="主题切换" @click="toggleTheme">
              <svg v-if="isDarkTheme" class="tool-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <svg v-else class="tool-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
                <path
                  d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <button class="tool-btn" 
                    title="GitHub - 查看项目源码" 
                    @click="openGitHub">
              <svg class="tool-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 19C4 20.5 4 16.5 2 16M16 22V18.13C16.0375 17.6532 15.9731 17.1738 15.811 16.7238C15.6489 16.2738 15.3929 15.8634 15.06 15.52C18.2 15.17 21.5 13.98 21.5 8.52C21.4997 7.12383 21.9627 5.7812 22.5 4.5C22.5 4.5 21.5 4 19.5 5.5C17.5 5.5 15.5 5.5 13.5 5.5C11.5 5.5 9.5 5.5 7.5 5.5C5.5 4 4.5 4.5 4.5 4.5C5.0373 5.7812 5.5003 7.12383 5.5 8.52C5.5 13.97 8.8 15.16 11.94 15.55C11.611 15.8899 11.3572 16.2954 11.193 16.7399C11.0288 17.1844 10.9597 17.6581 11 18.13V22"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useEventListener, useDebounceFn } from '@vueuse/core'
import { searchService, type SearchResult } from '@/services/searchService'
import { useUserPrefs } from '@/stores/userPrefs'

const router = useRouter()
const userStore = useUserStore()
const prefs = useUserPrefs()
const showAvatarModal = ref(false)
const showEnlargedAvatar = ref(false)
const searchQuery = ref('')
const isDarkTheme = computed(() => prefs.theme === 'dark')

// 开发者工具检测状态


// 搜索框引用和焦点控制
const searchInputRef = ref<HTMLInputElement>()
const isSearching = ref(false)
const searchResults = ref<SearchResult[]>([])
const showSearchResults = ref(false)
const searchSuggestions = ref<string[]>([])
const searchHistory = ref<string[]>([])
const selectedIndex = ref(-1)

// 当窗口获得焦点或尺寸变化（例如打开/关闭 DevTools）时，若未显示下拉，则强制让搜索框失焦，避免浏览器“归还焦点”到输入框
const forceBlurSearch = () => {
  if (!showSearchResults.value && searchInputRef.value) {
    searchInputRef.value.blur()
  }
}

// 防抖搜索函数
const debouncedSearch = useDebounceFn(async (query: string) => {
  if (query.trim()) {
    isSearching.value = true
    try {
      const results = await searchService.search({ query, limit: 8 })
      searchResults.value = results
    } catch (error) {
      console.error('搜索失败:', error)
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  } else {
    searchResults.value = []
  }
}, 300) // 300ms 防抖延迟

// 开发者工具检测函数






const avatarSrc = computed(() => {
  return userStore.avatar || '/assets/images/default.png'
})

// 处理搜索输入变化
const handleSearchInput = () => {
  if (searchQuery.value.trim()) {
    showSearchResults.value = true
    debouncedSearch(searchQuery.value)
  } else {
    searchResults.value = []
    showSearchResults.value = false
  }
}

// 显示搜索建议
const showSearchSuggestions = async () => {
  if (!searchQuery.value.trim()) {
    searchSuggestions.value = await searchService.getPopularSearches()
    searchHistory.value = searchService.getSearchHistory()
    showSearchResults.value = true
  }
}

// 处理搜索框失焦
const handleSearchBlur = () => {
  // 延迟关闭，让用户有时间点击搜索结果
  setTimeout(() => {
    showSearchResults.value = false
    selectedIndex.value = -1
  }, 200)
}

// 处理回车键搜索
const handleSearchEnter = () => {
  if (selectedIndex.value >= 0 && searchResults.value.length > 0) {
    // 如果有选中的搜索结果，跳转到该结果
    selectSearchResult(searchResults.value[selectedIndex.value])
  } else if (searchQuery.value.trim()) {
    // 否则执行搜索
    performSearch()
  }
}

// 处理方向键导航
const handleArrowDown = (e: KeyboardEvent) => {
  e.preventDefault()
  if (searchResults.value.length > 0) {
    selectedIndex.value = Math.min(selectedIndex.value + 1, searchResults.value.length - 1)
  }
}

const handleArrowUp = (e: KeyboardEvent) => {
  e.preventDefault()
  selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
}

// 执行搜索
const performSearch = async () => {
  const searchTerm = searchQuery.value.trim()
  if (searchTerm) {
    try {
      // 保存搜索历史
      searchService.saveSearchHistory(searchTerm)
      
      // 跳转到搜索结果页面
      router.push({
        path: '/search',
        query: { q: searchTerm }
      })
      showSearchResults.value = false
      searchQuery.value = ''
    } catch (error) {
      console.error('搜索失败:', error)
    }
  }
}

// 点击搜索结果
const selectSearchResult = (result: SearchResult) => {
  // 保存搜索历史
  searchService.saveSearchHistory(searchQuery.value)
  
  router.push(result.url)
  showSearchResults.value = false
  searchQuery.value = ''
  selectedIndex.value = -1
}

// 选择搜索建议
const selectSearchSuggestion = (suggestion: string) => {
  searchQuery.value = suggestion
  searchInputRef.value?.focus()
  performSearch()
}

// 清空搜索
const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  showSearchResults.value = false
  selectedIndex.value = -1
}

// 关闭搜索结果
const closeSearchResults = () => {
  showSearchResults.value = false
  selectedIndex.value = -1
}

// 清空搜索历史
const clearSearchHistory = () => {
  searchService.clearSearchHistory()
  searchHistory.value = []
}

// 获取结果图标
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

// 获取结果类型名称
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

// 获取替代建议
const getAlternativeSuggestions = () => {
  const suggestions = ['人工智能', '机器学习', '深度学习', 'Python']
  return suggestions.slice(0, 2).join('、')
}



const goToLogin = () => {
  router.push('/login')
}

const goToRegister = () => {
  router.push('/register')
}

const goWelcome = () => {
  router.push('/')
}

const logout = async () => {
  try {
    await userStore.logout()
    router.push('/')
  } catch (error) {
    console.error('登出失败:', error)
    router.push('/')
  }
}

const goToProfile = () => {
  router.push('/profile')
}

const toggleAvatarEnlarged = () => {
  showEnlargedAvatar.value = true
}

const applyTheme = (theme: 'light' | 'dark') => {
  document.documentElement.setAttribute('data-theme', theme)
}

const toggleTheme = () => {
  const next = isDarkTheme.value ? 'light' : 'dark'
  prefs.setTheme(next)
  applyTheme(next)
}

// 打开 GitHub 仓库
const openGitHub = () => {
  // 打开 GitHub 仓库
  window.open('https://github.com/zyx169644709/ai-learning-platform', '_blank')
}



onMounted(async () => {
  if (!userStore.userInfo && userStore.token) {
    await userStore.loadUser()
  }

  // 初始化主题：使用 userPrefs
  applyTheme(prefs.theme)
  
  // 监听窗口事件，防止关闭 DevTools 时焦点回到搜索框
  window.addEventListener('focus', forceBlurSearch)
  window.addEventListener('resize', forceBlurSearch)
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', forceBlurSearch)
  window.removeEventListener('resize', forceBlurSearch)
})



const onAvatarChange = async (e: any) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = async (evt: any) => {
      const avatarDataUrl = evt.target.result

      if (userStore.userInfo) {
        userStore.userInfo = { ...userStore.userInfo, avatar: avatarDataUrl }
        localStorage.setItem('userInfo', JSON.stringify(userStore.userInfo))
      }

      try {
        const result = await userStore.updateProfile({ avatar: avatarDataUrl })
        if (result.success) {
          alert('头像更新成功！')
        } else {
          alert('头像更新失败：' + result.message)
        }
      } catch (error) {
        console.error('头像更新错误:', error)
        alert('头像更新失败，请重试')
      }
    }
    reader.readAsDataURL(file)
  }
}
</script>

<style scoped>
.app-header {
  background: var(--bg-primary);
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 64px;
  z-index: 1002;
  border-top-right-radius: 12px;
  /* 移除 overflow: hidden 以允许搜索下拉框显示 */
  display: flex;
  align-items: center;
}

.header-container {
  display: flex;
  align-items: center;
  height: 100%;
  width: 100%;
  justify-content: space-between;
}

.header-container-left {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 24px;
  gap: 32px;
  margin-left: -75px;
}

.header-container-right {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 24px;
  gap: 32px;
  margin-right: 25px;
}

.logo-section {
  height: 64px;
  flex-shrink: 0;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--border-color);
  padding: 0 20px;
  margin-left: 30px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.3s ease;
  position: relative;
}

.logo:hover {
  transform: scale(1.05);
}

.logo-img-container {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #42b883, #35495e);
}

.logo-img {
  height: 100%;
  width: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.logo:hover .logo-img {
  transform: scale(1.1);
}

.logo-title {
  font-size: 25px;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
}

/* 搜索区域 */
.search-section {
  flex: 1;
  max-width: 400px;
  position: relative; /* Added for dropdown positioning */
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 12px;
  transition: all 0.2s ease;
}

.search-container:focus-within {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);
}

.search-icon {
  color: var(--text-tertiary);
  font-size: 16px;
  margin-right: 8px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 14px;
  padding: 0;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-clear {
  margin-left: 8px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.search-clear:hover {
  background: var(--accent-color);
  color: var(--bg-primary);
  transform: scale(1.1);
}

.search-loading {
  margin-left: 8px;
  display: flex;
  align-items: center;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-color);
  border-top: 2px solid var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 导航区域 */
.nav-section {
  flex-shrink: 0;
}

.main-nav {
  display: flex;
  gap: 24px;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: var(--text-primary);
}

.nav-link-active {
  color: var(--accent-color);
  border-bottom-color: var(--accent-color);
}

/* 用户认证区域 */
.user-section {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 15px;
}

.auth-btn {
  position: relative;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px var(--shadow-color);
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.auth-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.auth-btn:hover::before {
  left: 100%;
}

.auth-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--shadow-hover);
  border-color: var(--accent-color);
}

.auth-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 15px var(--shadow-color);
}

.login-btn {
  background: var(--bg-secondary);
  color: var(--accent-color);
  border: 1px solid var(--accent-color);
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: var(--accent-color);
  color: var(--bg-primary);
  box-shadow: 0 8px 25px var(--shadow-hover);
}

.register-btn {
  background: var(--bg-secondary);
  color: var(--accent-color);
  border: 1px solid var(--accent-color);
  transition: all 0.3s ease;
}

.register-btn:hover {
  background: var(--accent-hover);
  color: var(--bg-primary);
  box-shadow: 0 8px 25px var(--shadow-hover);
}

.btn-icon {
  font-size: 16px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.logged-in {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.user-status {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--accent-color);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.status-text {
  font-size: 12px;
  color: var(--text-tertiary);
}

.avatar-container {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  border: 2px solid var(--border-color);
  transition: all 0.2s ease;
}

.avatar-container:hover {
  border-color: var(--accent-color);
  transform: scale(1.1);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-secondary);
  transform: translateY(-1px);
}

.profile-btn {
  background: var(--bg-secondary);
  color: var(--accent-color);
  border: 1px solid var(--accent-color);
  transition: all 0.3s ease;
}

.profile-btn:hover {
  background: var(--accent-color);
  color: var(--bg-primary);
  box-shadow: 0 8px 25px var(--shadow-hover);
}

.logout-btn {
  background: var(--bg-secondary);
  color: #e53e3e;
  border: 1px solid #e53e3e;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #e53e3e;
  color: var(--bg-primary);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
}

/* 头像模态框 */
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
  z-index: 1003;
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
  border: 3px solid #42b883;
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
  z-index: 1004;
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

/* 工具图标区域 */
.tools-section {
  flex-shrink: 0;
}

.tool-icons {
  display: flex;
  gap: 8px;
}

.tool-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.tool-btn:hover {
  background: var(--bg-tertiary);
  border-color: var(--accent-color);
  color: var(--text-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px var(--shadow-hover);
}

.tool-btn:active {
  transform: translateY(0);
}

.tool-icon {
  width: 18px;
  height: 18px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}





/* 搜索结果下拉框 */
.search-results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 400px;
  overflow-y: auto;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 15px var(--shadow-color);
  z-index: 1001;
  margin-top: 5px;
}

/* 搜索建议样式 */
.search-suggestions {
  padding: 12px 0;
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px 8px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 8px;
}

.suggestions-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.clear-history-btn {
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: 11px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.clear-history-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.search-history, .popular-searches {
  margin-bottom: 12px;
}

.history-title, .popular-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
  padding: 0 16px 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.search-history-item, .search-suggestion-item {
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-history-item:hover, .search-suggestion-item:hover {
  background: var(--bg-secondary);
}

.history-icon, .suggestion-icon {
  font-size: 14px;
  color: var(--text-tertiary);
}

.history-text, .suggestion-text {
  font-size: 13px;
  color: var(--text-secondary);
}

/* 搜索建议样式 */
.search-suggestions {
  padding: 12px 0;
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px 8px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 8px;
}

.suggestions-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.clear-history-btn {
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: 11px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.clear-history-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.search-history, .popular-searches {
  margin-bottom: 12px;
}

.history-title, .popular-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
  padding: 0 16px 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.search-history-item, .search-suggestion-item {
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-history-item:hover, .search-suggestion-item:hover {
  background: var(--bg-secondary);
}

.history-icon, .suggestion-icon {
  font-size: 14px;
  color: var(--text-tertiary);
}

.history-text, .suggestion-text {
  font-size: 13px;
  color: var(--text-secondary);
}

/* 搜索结果增强样式 */
.search-result-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover, .search-result-item.selected {
  background: var(--bg-secondary);
}

.search-result-item.selected {
  border-left: 3px solid var(--accent-color);
}

.search-result-item .result-icon {
  font-size: 18px;
  color: var(--accent-color);
  flex-shrink: 0;
  margin-top: 2px;
}

.search-result-item .result-content {
  flex-grow: 1;
  min-width: 0;
}

.search-result-item .result-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-result-item .result-description {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.result-tag {
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

.result-type {
  font-size: 10px;
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  flex-shrink: 0;
  align-self: flex-start;
}

/* 无结果样式增强 */
.no-results {
  padding: 24px 16px;
  text-align: center;
  color: var(--text-tertiary);
}

.no-results-icon {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.6;
}

.no-results-text {
  font-size: 14px;
  margin-bottom: 8px;
  color: var(--text-secondary);
}

.no-results-suggestions {
  font-size: 12px;
  color: var(--text-tertiary);
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .header-container {
    gap: 20px;
    padding: 0 16px;
  }

  .nav-section {
    display: none;
  }
}

@media (max-width: 768px) {
  .search-section {
    max-width: 300px;
  }

  .tools-section {
    display: none;
  }
}
</style>
