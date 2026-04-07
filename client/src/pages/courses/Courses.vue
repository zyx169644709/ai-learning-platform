<template>
  <div class="docs">
    <h1 class="title">课程</h1>
    <p class="page-intro" v-if="currentCategoryMeta">{{ pageIntro }}</p>
    <div class="page-intro-list" v-else>
      <p style="font-size: large;">本网站提供了类型齐全、种类多样的完备课程体系，让用户能够系统的学习Vue及其相关生态。课程体系按 6 大方向系统组织，可在左侧目录快速切换分类：</p>
      <ul>
        <li><strong>🚀 基础入门</strong>——零基础也能快速上手，建立 Vue 开发信心</li>
        <li><strong>🔧 核心语法</strong>——深入组件、响应式、生命周期等灵魂知识点</li>
        <li><strong>⚡ 进阶实战</strong>——组合式 API、路由、状态管理等实战必备技能</li>
        <li><strong>🏗️ 项目开发</strong>——后台管理、移动端与全栈场景完整项目驱动</li>
        <li><strong>🎯 面试专题</strong>——高频面试题、源码原理与大厂经验助你脱颖而出</li>
        <li><strong>🌿 生态工具</strong>——覆盖 Pinia、Nuxt、Element Plus 等主流 Vue 生态</li>
      </ul>
    </div>

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
        <div class="card" :class="{ unavailable: c.unavailable }" v-for="c in filteredCourses" :key="c.id" @click="openCourse(c)">
          <div class="thumb">
            <img
              v-if="c.cover && !c.cover.startsWith('/')"
              :src="c.cover"
              referrerpolicy="no-referrer"
              class="thumb-preload"
              alt=""
              @load="loadedCovers[c.id] = c.cover"
            />
            <div class="thumb-bg" :style="loadedCovers[c.id] ? { backgroundImage: `url('${loadedCovers[c.id]}')` } : {}"></div>
            <div class="play-overlay" v-if="!c.unavailable">
              <div class="play-icon">▶</div>
            </div>
            <div class="unavailable-overlay" v-if="c.unavailable">
              <span class="unavailable-icon">⚠</span>
              <span class="unavailable-text">课程暂不可用</span>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { COURSE_CATEGORY_OPTIONS, inferCourseCategory, type CourseCategoryKey } from '../../../../shared/constants/courseCategories'
import defaultCourseCover from '@/assets/images/course-beginner-cover.svg'
import defaultAvatar from '@/assets/images/default.png'

const router = useRouter()
const route = useRoute()

const openAiChat = () => window.dispatchEvent(new CustomEvent('open-ai-chat'))

const query = ref('')
const loadedCovers = reactive<Record<string, string>>({})

type Level = string
interface CourseCard { 
  id: string; 
  title: string; 
  desc: string; 
  level: Level; 
  category?: CourseCategoryKey;
  tags?: unknown;
  cover: string;
  unavailable?: boolean;
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
  if (!currentCategoryMeta.value) return ''
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
      unavailable: !c.cover,
      cover: c.cover
        ? (c.cover.startsWith('http') ? c.cover : c.cover)
        : defaultCourseCover,

      author: '课程组',
      authorAvatar: defaultAvatar,
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
  font-size: 16px;
}

.page-intro-list {
  margin: -4px 45px 20px;
  color: var(--text-secondary);
  line-height: 1.8;
  font-size: 16px;
}

.page-intro-list p {
  margin-bottom: 8px;
}

.page-intro-list ul {
  padding-left: 1.5em;
  margin: 0;
}

.page-intro-list li {
  margin-bottom: 4px;
  line-height: 1.8;
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
  font-size: 15px;
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
  font-size: 15px;
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

.thumb-preload {
  display: none;
}

.thumb-bg {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: var(--bg-secondary);
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
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 8px;
}

.c-desc {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 10px;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author {
  color: var(--text-tertiary);
  font-size: 13px;
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
  font-size: 13px;
}

.video-tag {
  background: #ff6b6b;
  color: #fff;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 13px;
}

/* 暂不可用遮罩 */
.unavailable-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.unavailable-icon {
  font-size: 28px;
  color: #f59e0b;
}

.unavailable-text {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
  padding: 3px 10px;
  border-radius: 20px;
}

.card.unavailable {
  opacity: 0.7;
  cursor: not-allowed;
}

.card.unavailable:hover {
  transform: none;
  box-shadow: none;
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