<template>
  <div class="docs">
    <h1 class="title">资源</h1>
    <div class="main-container">
      <div class="callout">
        <span class="play">▶</span>
        <RouterLink to="/api/deepseek">找不到资料？让 Vue 专家助教给你推荐</RouterLink>
      </div>

      <div class="grid">
        <div class="card" v-for="r in filtered" :key="r.id" @click="handleResourceClick(r)">
          <div class="thumb">
            <img :src="r.preview" :alt="r.title" />
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

type ResType = 'website' | 'document' | 'tool' | 'tutorial'
interface ResourceCard { 
  id: string; 
  title: string; 
  description: string; 
  type: ResType; 
  preview: string; 
  url: string;  // 资源链接
  icon?: string;  // 资源图标
  tags?: string[];  // 标签
  viewCount?: number;
  likeCount?: number;
}

const query = ref('')
const selectedType = ref('all')
const sortBy = ref('title')

// 筛选类型选项
const filterTypes = [
  { value: 'all', label: '全部' },
  { value: 'website', label: '网站' },
  { value: 'document', label: '文档' },
  { value: 'tool', label: '工具' },
  { value: 'tutorial', label: '教程' }
]

// 排序选项
const sortOptions = [
  { value: 'title', label: '标题' },
  { value: 'viewCount', label: '浏览量' },
  { value: 'likeCount', label: '点赞数' }
]

const resources = ref<ResourceCard[]>([])

interface ApiResource { id: string; title: string; description?: string; url?: string; cover?: string; icon?: string; tags?: any; viewCount?: number; likeCount?: number; type?: string; status?: string }

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/resources?status=published')
    const result = await res.json()
    const data: ApiResource[] = result.success ? result.data.items : (Array.isArray(result) ? result : [])
    resources.value = (data || []).map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description || '',
      type: (r.type as ResType) || 'website',
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

  // 按类型筛选
  if (selectedType.value !== 'all') {
    result = result.filter(r => r.type === selectedType.value)
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

const typeText = (t: ResType) => ({ website: '网站', document: '文档', tool: '工具', tutorial: '教程' }[t])

// 处理资源点击事件：优先打开外部链接/下载链接
const handleResourceClick = (resource: ResourceCard) => {
  fetch(`http://localhost:3000/api/resources/${resource.id}/view`, { method: 'POST' }).catch(() => {})
  resource.viewCount = (resource.viewCount || 0) + 1
  if (resource.url) {
    window.open(resource.url, '_blank')
  }
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