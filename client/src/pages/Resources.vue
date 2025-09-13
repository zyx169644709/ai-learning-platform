<template>
  <div class="docs">
    <h1 class="title">资源</h1>
    <div class="main-container">
      <div class="callout">
        <span class="play">▶</span>
        <RouterLink to="/api/deepseek">找不到资料？让智能助教给你推荐</RouterLink>
      </div>

      <div class="grid">
        <div class="card" v-for="r in filtered" :key="r.id" @click="handleResourceClick(r)">
          <div class="thumb">
            <img :src="r.preview" :alt="r.title" />
            <span class="badge" :class="r.type">{{ typeText(r.type) }}</span>
            <!-- 添加下载按钮覆盖层 -->
            <div class="download-overlay" v-if="r.downloadUrl">
              <div class="download-icon">⬇</div>
            </div>
          </div>
          <div class="meta">
            <div class="c-title">{{ r.title }}</div>
            <div class="c-desc">{{ r.description }}</div>
            <div class="row">
              <span class="author"><img class="avatar" :src="r.authorAvatar" alt="" /> {{ r.author }}</span>
            </div>
            <!-- 添加资源信息 -->
            <div class="resource-info" v-if="r.size || r.language">
              <span class="size" v-if="r.size">{{ r.size }}</span>
              <span class="language" v-if="r.language">{{ r.language }}</span>
            </div>
            <!-- 添加标签 -->
            <div class="tags" v-if="r.tags && r.tags.length > 0">
              <span class="tag" v-for="tag in r.tags.slice(0, 3)" :key="tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

type ResType = 'document' | 'video' | 'code' | 'dataset' | 'tool'
interface ResourceCard { 
  id: string; 
  title: string; 
  description: string; 
  type: ResType; 
  preview: string; 
  author: string; 
  authorAvatar: string;
  downloadUrl?: string;  // 下载链接
  externalUrl?: string;  // 外部链接
  size?: string;  // 文件大小
  language?: string;  // 编程语言
  tags?: string[];  // 标签
}

const query = ref('')
const selectedType = ref('all')
const sortBy = ref('title')

// 筛选类型选项
const filterTypes = [
  { value: 'all', label: '全部' },
  { value: 'document', label: '文档' },
  { value: 'video', label: '视频' },
  { value: 'code', label: '代码' },
  { value: 'dataset', label: '数据集' },
  { value: 'tool', label: '工具' }
]

// 排序选项
const sortOptions = [
  { value: 'title', label: '标题' },
  { value: 'size', label: '大小' },
  { value: 'author', label: '作者' }
]

const resources = ref<ResourceCard[]>([])

type ApiResource = { id: string; title: string; description?: string; url?: string; cover?: string; tags?: any }

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/resources')
    const data: ApiResource[] = await res.json()
    resources.value = (data || []).map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description || '',
      type: (Array.isArray(r.tags) && r.tags[0]) === 'video' ? 'video' : 'document',
      preview: r.cover || '/assets/images/document-cover.svg',
      author: '资源库',
      authorAvatar: '/assets/images/default.png',
      externalUrl: r.url,
      tags: Array.isArray(r.tags) ? r.tags : []
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
      case 'author':
        return a.author.localeCompare(b.author)
      case 'size':
        // 简单的文件大小排序（在线资源排最后）
        if (a.size === '在线' && b.size !== '在线') return 1
        if (a.size !== '在线' && b.size === '在线') return -1
        return a.size?.localeCompare(b.size || '') || 0
      default:
        return 0
    }
  })

  return result
})

const typeText = (t: ResType) => ({ document: '文档', video: '视频', code: '代码', dataset: '数据集', tool: '工具' }[t])

// 处理资源点击事件：优先打开外部链接/下载链接
const handleResourceClick = (resource: ResourceCard) => {
  const target = resource.externalUrl || resource.downloadUrl
  if (target) {
    window.open(target, '_blank')
  } else {
    // 无外链时可降级到站内详情
    window.location.href = `/resource/${resource.id}`
  }
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

.badge.document {
  background: #3b82f6;
}

.badge.video {
  background: #ef4444;
}

.badge.code {
  background: #10b981;
}

.badge.dataset {
  background: #8b5cf6;
}

.badge.tool {
  background: #f59e0b;
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
  justify-content: flex-start;
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

/* 下载按钮覆盖层 */
.download-overlay {
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

.card:hover .download-overlay {
  opacity: 1;
}

.download-icon {
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

/* 资源信息 */
.resource-info {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.size, .language {
  background: var(--bg-primary);
  color: var(--text-secondary);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  border: 1px solid var(--border-color);
}

/* 标签 */
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