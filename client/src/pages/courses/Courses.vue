<template>
  <div class="docs">
    <h1 class="title">课程</h1>
    <p class="page-intro">{{ pageIntro }}</p>

    <div class="main-container">
      <div class="callout">
        <span class="play">▶</span>
        <span class="callout-link" @click="openAiChat">不知道学什么？让 Vue 专家助教给你推荐</span>
      </div>

      <div class="filter-bar">
        <div class="filter-item">
          <label class="filter-label">课程类型</label>
          <select class="filter-select" :value="currentCategory" @change="onCategoryChange">
            <option value="">全部类型</option>
            <option v-for="item in COURSE_CATEGORY_OPTIONS" :key="item.key" :value="item.key">
              {{ item.label }}
            </option>
          </select>
        </div>
        <div class="filter-item">
          <label class="filter-label">课程难度</label>
          <select class="filter-select" :value="currentLevel" @change="onLevelChange">
            <option value="">全部难度</option>
            <option value="beginner">初级</option>
            <option value="intermediate">中级</option>
            <option value="advanced">高级</option>
          </select>
        </div>
      </div>

      <div class="grid">
        <div class="card" v-for="c in filteredCourses" :key="c.id" @click="openCourse(c)">
          <div class="thumb">
            <img :src="c.cover" :alt="c.title" />
            <div class="play-overlay">
              <div class="play-icon">▶</div>
            </div>
          </div>
          <div class="meta">
            <div class="c-title">{{ c.title }}</div>
            <div class="c-desc">{{ c.desc }}</div>
            <div class="row">
              <span class="author"><img class="avatar" :src="c.authorAvatar" alt="" /> {{ c.author }}</span>
              <span class="tag" v-if="c.free">免费</span>
              <span class="video-tag" v-if="getBvId(c.url)">📺 B站视频</span>
              <span class="video-tag external" v-else-if="c.url">🔗 外部链接</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { COURSE_CATEGORY_OPTIONS, inferCourseCategory, type CourseCategoryKey } from '../../../../shared/constants/courseCategories'

const router = useRouter()
const route = useRoute()

const openAiChat = () => window.dispatchEvent(new CustomEvent('open-ai-chat'))

const query = ref('')

type Level = string
interface CourseCard { 
  id: string; 
  title: string; 
  desc: string; 
  level: Level; 
  category?: CourseCategoryKey;
  tags?: unknown;
  cover: string; 
  author: string; 
  authorAvatar: string; 

  free?: boolean;
  bilibiliUrl?: string;  // B站视频链接
  url?: string;          // 其他外链
  videoPlatform?: 'bilibili' | 'youtube' | 'local';  // 视频平台
  videoId?: string;  // 视频ID（用于嵌入）
}

const currentCategoryMeta = computed(() => {
  const key = (route.query.category as string) || ''
  return COURSE_CATEGORY_OPTIONS.find(item => item.key === key)
})

const pageIntro = computed(() => {
  if (!currentCategoryMeta.value) {
    return '课程体系按 6 大方向组织：基础入门、核心语法、进阶实战、项目开发、面试专题、生态工具。可在左侧快速切换并进入对应课程详情。'
  }
  return `${currentCategoryMeta.value.title}：${currentCategoryMeta.value.intro}`
})

const courses = ref<CourseCard[]>([])

const currentCategory = computed(() => (route.query.category as string) || '')
const currentLevel = computed(() => (route.query.level as string) || '')

const onCategoryChange = (e: Event) => {
  const category = (e.target as HTMLSelectElement).value
  const q: Partial<Record<string, string>> = { ...buildQuery(), category }
  if (!category) delete q.category
  router.replace({ query: q as Record<string, string> })
}

const onLevelChange = (e: Event) => {
  const level = (e.target as HTMLSelectElement).value
  const q: Partial<Record<string, string>> = { ...buildQuery(), level }
  if (!level) delete q.level
  router.replace({ query: q as Record<string, string> })
}

const buildQuery = (): Record<string, string> => {
  const q: Record<string, string> = {}
  if (currentCategory.value) q.category = currentCategory.value
  if (currentLevel.value) q.level = currentLevel.value
  return q
}

type ApiCourse = { id: string; title: string; description?: string; duration?: string; level?: string; category?: CourseCategoryKey; cover?: string; url?: string; tags?: any }

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/courses')
    const data: ApiCourse[] = await res.json()
    courses.value = (data || []).map((c) => ({
      id: c.id,
      title: c.title,
      desc: c.duration || '',
      level: (c.level as Level) || '',
      category: c.category,
      tags: c.tags,
      cover: c.cover ? new URL(c.cover.replace('/assets/', '/src/assets/'), import.meta.url).href : new URL('/src/assets/images/course-beginner-cover.svg', import.meta.url).href,

      author: '课程组',
      authorAvatar: new URL('/src/assets/images/default.png', import.meta.url).href,
      bilibiliUrl: c.url?.includes('bilibili') ? c.url : undefined,
      url: c.url,
      videoPlatform: c.url?.includes('bilibili') ? 'bilibili' : undefined,
      videoId: undefined,
      free: undefined
    }))
  } catch (e) {
    console.error('加载课程失败', e)
  }
})

const filteredCourses = computed(() => {
  let result = courses.value

  const categoryFilter = (route.query.category as string) || ''
  const levelFilter = (route.query.level as string) || ''

  if (categoryFilter) {
    result = result.filter(c => {
      const category = c.category || inferCourseCategory({ title: c.title, level: c.level, tags: c.tags })
      return category === categoryFilter
    })
  }

  if (levelFilter) {
    result = result.filter(c => (c.level || '') === levelFilter)
  }

  // 按搜索关键词筛选
  const q = query.value.trim().toLowerCase()
  if (q) {
    result = result.filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.desc.toLowerCase().includes(q) ||
      c.author.toLowerCase().includes(q)
    )
  }

  return result
})

const onSearch = () => {
  // 已通过计算属性实时过滤，这里保留以便未来接入后端
}

// 提取 Bilibili BV 号
const getBvId = (url?: string): string | null => {
  if (!url) return null
  const m = url.match(/BV[a-zA-Z0-9]+/)
  return m ? m[0] : null
}

const openCourse = (course: CourseCard) => {
  const q: Record<string, string> = {}
  if (route.query.category) q.category = route.query.category as string
  if (route.query.level) q.level = route.query.level as string
  router.push({
    name: 'CourseDetail',
    params: { id: course.id },
    query: q
  })
}
</script>

<style scoped>
/* 与 Home.vue 保持一致的基础排版 */
.docs {
  max-width: 900px;
  margin: 0 auto;
  padding: 28px;
  line-height: 1.7;
  color: var(--text-primary);
}

.title {
  font-size: 40px;
  font-weight: 800;
  margin: 25px 0px 0px 45px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 60px;
  margin-bottom: 20px;
}

.page-intro {
  margin: -4px 45px 20px;
  color: var(--text-secondary);
  line-height: 1.8;
  font-size: 15px;
}

.main-container {
  width: 100%;
  margin: 0 10px;
  padding: 28px;
}

.callout {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 24px;
}

.play {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--accent-color);
  color: #fff;
  font-weight: 700;
}

a {
  color: var(--accent-color);
  text-decoration: none;
}

a:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}

.callout-link {
  color: var(--accent-color);
  cursor: pointer;
}

.callout-link:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}

/* 筛选栏样式 */
.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  outline: none;
  min-width: 140px;
  transition: border-color 0.2s;
}

.filter-select:hover {
  border-color: var(--accent-color);
}

.filter-select:focus {
  border-color: var(--accent-color);
}

/* 难度筛选按钮样式 */
.level-filters {
  display: flex;
  gap: 8px;
  margin: 16px 0;
  flex-wrap: wrap;
}

.level-btn {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.level-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--accent-color);
}

.level-btn.active {
  background: var(--accent-color);
  color: #fff;
  border-color: var(--accent-color);
}

/* 课程网格 */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
  transition: transform .2s ease, box-shadow .2s ease;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px var(--shadow-hover);
}

.thumb {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 播放按钮覆盖层 */
.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #333;
  font-weight: bold;
}

.meta {
  padding: 12px;
}

.c-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
}

.c-desc {
  color: var(--text-secondary);
  font-size: 13px;
  margin-bottom: 10px;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author {
  color: var(--text-tertiary);
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
}

.tag {
  background: var(--accent-color);
  color: #fff;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
}

.video-tag {
  background: #ff6b6b;
  color: #fff;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
}

/* 播放按钮覆盖层 */
.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card:hover .play-overlay {
  opacity: 1;
}

.play-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #333;
  font-weight: bold;
}

/* 模态框 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal {
  background: var(--bg-primary);
  border-radius: 12px;
  width: 100%;
  max-width: 860px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 4px 8px;
  border-radius: 6px;
  line-height: 1;
  flex-shrink: 0;
  transition: background 0.15s;
}

.modal-close:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-body {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 */
}

.bili-player {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.external-tip {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-secondary);
}

.external-tip a {
  color: var(--accent-color);
  font-weight: 500;
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>