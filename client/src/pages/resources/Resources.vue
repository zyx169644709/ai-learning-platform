<template>
  <div class="docs">
    <h1 class="title">资源</h1>

    <div class="main-container">
      <div class="callout">
        <span class="play">▶</span>
        <span class="callout-link" @click="openAiChat">找不到资料？让 Vue 专家助教给你推荐</span>
      </div>

      <template v-if="!currentCategoryMeta">
        <p style="font-size: large; font-weight: 600;">本资源库专为 Vue 3 学习者整理，汇集学习文档、项目模板、工具配置、代码片段、面试资源和插件工具六大类别，助你在学习与开发中随时找到所需资料。</p>
        <p>资源按 6 大类别组织，可在左侧目录快速切换：</p>
        <ul class="features">
          <li><strong>📚 学习文档</strong>——Vue 官方文档精选、核心概念笔记与 API 速查表，适合速查和深入理解</li>
          <li><strong>🚀 项目模板</strong>——开箱即用的 Vue3 项目模板，覆盖基础、管理后台、移动端等多种场景</li>
          <li><strong>⚙️ 工具配置</strong>——开发环境、代码规范、编辑器插件等配置指南，快速搭建高效开发环境</li>
          <li><strong>💻 代码片段</strong>——高频复用的请求封装、表单验证、工具函数等代码段，复制即用</li>
          <li><strong>📝 面试资源</strong>——Vue 面试题、前端八股文、手写代码题与简历模板，助力求职面试</li>
          <li><strong>🔧 插件工具</strong>——精选 Vue 生态 UI 组件库、工具库与图表库，快速找到合适工具</li>
        </ul>
      </template>
      <p v-else>{{ pageIntro }}</p>

      <div class="filter-bar">
        <div class="filter-item">
          <label class="filter-label">资源分类</label>
          <select class="filter-select" :value="currentCategory" @change="onCategoryChange">
            <option value="">全部分类</option>
            <option v-for="item in RESOURCE_CATEGORY_OPTIONS" :key="item.key" :value="item.key">
              {{ item.label }}
            </option>
          </select>
        </div>
        <div class="filter-item">
          <label class="filter-label">资源类型</label>
          <select class="filter-select" :value="currentType" @change="onTypeChange">
            <option value="">全部类型</option>
            <option value="website">网站</option>
            <option value="document">文档</option>
            <option value="tool">工具</option>
            <option value="tutorial">教程</option>
            <option value="code">代码</option>
          </select>
        </div>
      </div>

      <div class="grid">
        <div class="card" v-for="r in filtered" :key="r.id" @click="handleResourceClick(r)">
          <div class="thumb">
            <img :src="r.preview" :alt="r.title" referrerpolicy="no-referrer" />
            <span class="badge" :class="r.type">{{ typeText(r.type) }}</span>
          </div>
          <div class="meta">
            <div class="c-title">{{ r.title }}</div>
            <div class="c-desc">{{ r.description }}</div>
            <!-- 标签 -->
            <div class="tags" v-if="r.tags && r.tags.length > 0">
              <span class="tag" v-for="tag in r.tags.slice(0, 3)" :key="tag">{{ tag }}</span>
            </div>
            <!-- 浏览量和点赞 -->
            <div class="stats-row">
              <span class="stat-item">👁 {{ r.viewCount || 0 }}</span>
              <button class="like-btn" @click="handleLike($event, r)">❤ {{ r.likeCount || 0 }}</button>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RESOURCE_CATEGORY_OPTIONS, type ResourceCategoryMeta } from '../../../../shared/constants/resourceCategories'

const route = useRoute()
const router = useRouter()
const openAiChat = () => window.dispatchEvent(new CustomEvent('open-ai-chat'))

const currentCategory = computed(() => (route.query.category as string) || '')
const currentType = computed(() => (route.query.restype as string) || '')

const currentCategoryMeta = computed(() =>
  RESOURCE_CATEGORY_OPTIONS.find((item: ResourceCategoryMeta) => item.key === currentCategory.value)
)

const pageIntro = computed(() => {
  if (!currentCategoryMeta.value) return ''
  return `${currentCategoryMeta.value.title}：${currentCategoryMeta.value.intro}`
})

const buildQuery = (): Record<string, string> => {
  const q: Record<string, string> = {}
  if (currentCategory.value) q.category = currentCategory.value
  if (currentType.value) q.restype = currentType.value
  return q
}

const onCategoryChange = (e: Event) => {
  const category = (e.target as HTMLSelectElement).value
  const q: Partial<Record<string, string>> = { ...buildQuery(), category }
  if (!category) delete q.category
  router.replace({ query: q as Record<string, string> })
}

const onTypeChange = (e: Event) => {
  const restype = (e.target as HTMLSelectElement).value
  const q: Partial<Record<string, string>> = { ...buildQuery(), restype }
  if (!restype) delete q.restype
  router.replace({ query: q as Record<string, string> })
}

type ResType = 'website' | 'document' | 'tool' | 'tutorial' | 'code'
interface ResourceCard { 
  id: string; 
  title: string; 
  description: string; 
  type: ResType; 
  category?: string;
  preview: string; 
  url: string;  // 资源链接
  icon?: string;  // 资源图标
  tags?: string[];  // 标签
  viewCount?: number;
  likeCount?: number;
}

const query = ref('')
const sortBy = ref('title')

// 排序选项
const sortOptions = [
  { value: 'title', label: '标题' },
  { value: 'viewCount', label: '浏览量' },
  { value: 'likeCount', label: '点赞数' }
]

const resources = ref<ResourceCard[]>([])

interface ApiResource { id: string; title: string; description?: string; url?: string; cover?: string; icon?: string; tags?: any; viewCount?: number; likeCount?: number; type?: string; category?: string; status?: string }

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/resources?status=published&limit=100')
    const result = await res.json()
    const data: ApiResource[] = result.success ? result.data.items : (Array.isArray(result) ? result : [])
    resources.value = (data || []).map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description || '',
      type: (r.type as ResType) || 'website',
      category: r.category || '',
      preview: r.cover ? new URL(r.cover.replace('/assets/', '/src/assets/'), import.meta.url).href : new URL('/src/assets/images/document-cover.svg', import.meta.url).href,
      url: r.url || '',
      icon: r.icon || '',
      tags: Array.isArray(r.tags) ? r.tags : [],
      viewCount: r.viewCount || 0,
      likeCount: r.likeCount || 0
    }))
  } catch (e) {
    console.error('加载资源失败', e)
  }
})

const filtered = computed(() => {
  let result = resources.value

  if (currentCategory.value) {
    result = result.filter(r => (r.category || '') === currentCategory.value)
  }

  if (currentType.value) {
    result = result.filter(r => (r.type || '') === currentType.value)
  }

  // 按搜索关键词筛选
  const q = query.value.trim().toLowerCase()
  if (q) {
    result = result.filter(r => 
      r.title.toLowerCase().includes(q) || 
      r.description.toLowerCase().includes(q) ||
      r.tags?.some(tag => tag.toLowerCase().includes(q))
    )
  }

  // 排序
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'viewCount':
        return (b.viewCount || 0) - (a.viewCount || 0)
      case 'likeCount':
        return (b.likeCount || 0) - (a.likeCount || 0)
      default:
        return 0
    }
  })

  return result
})

const typeText = (t: ResType) => ({ website: '网站', document: '文档', tool: '工具', tutorial: '教程', code: '代码' }[t] ?? t)

// 处理资源点击事件：跳转 ResourceDetail 详情页
const handleResourceClick = (resource: ResourceCard) => {
  const q: Record<string, string> = {}
  if (currentCategory.value) q.category = currentCategory.value
  if (currentType.value) q.restype = currentType.value
  router.push({ name: 'ResourceDetail', params: { id: resource.id }, query: q })
}

const handleLike = async (event: Event, resource: ResourceCard) => {
  event.stopPropagation()
  try {
    const res = await fetch(`http://localhost:3000/api/resources/${resource.id}/like`, { method: 'POST' })
    const json = await res.json()
    if (json.success) {
      resource.likeCount = json.data.likeCount
    }
  } catch { }
}

const noop = () => { }
</script>

<style scoped>
.docs {
  width: 100%;
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

p {
  margin: 12px 0;
  color: var(--text-secondary);
}

.features {
  margin: 8px 0 0 0;
  padding-left: 22px;
}

.features li {
  margin: 8px 0;
  color: var(--text-secondary);
}

.features li::marker {
  color: var(--accent-color);
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

.badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}

.badge.website {
  background: #3b82f6;
}

.badge.document {
  background: #10b981;
}

.badge.tool {
  background: #f59e0b;
}

.badge.tutorial {
  background: #8b5cf6;
}

.badge.code {
  background: #6366f1;
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

.tags {
  display: flex;
  gap: 4px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.tag {
  background: var(--accent-color);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.stats-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-tertiary);
}

.stat-item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.like-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-tertiary);
  font-size: 12px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  transition: color 0.2s;
}

.like-btn:hover {
  color: #ef4444;
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