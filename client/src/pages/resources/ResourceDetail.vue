<template>
  <div class="resource-detail">
    <div class="breadcrumb">
      <RouterLink to="/resources">← 返回资源列表</RouterLink>
    </div>
    
    <div class="resource-header">
      <div class="resource-thumb">
        <img :src="resource.preview" :alt="resource.title" />
        <span class="badge" :class="resource.type">{{ typeText(resource.type) }}</span>
      </div>
      
      <div class="resource-info">
        <h1 class="resource-title">{{ resource.title }}</h1>
        
        <div class="resource-tags" v-if="resource.tags && resource.tags.length > 0">
          <span class="tag" v-for="tag in resource.tags" :key="tag">{{ tag }}</span>
        </div>
        
        <div class="resource-stats">
          <span class="stat-item">👁 浏览量：{{ resource.downloads.toLocaleString() }}</span>
          <span class="stat-item">❤ 收藏量：{{ favoriteCount }}</span>
        </div>
        
        <div class="resource-actions">
          <button 
            v-if="resource.externalUrl" 
            @click="viewOnline" 
            class="action-btn primary"
          >
            🌐 访问网站
          </button>
          <button 
            class="action-btn favorite" 
            :class="{ 'favorited': isFavorited }"
            @click="toggleFavorite"
          >
            {{ isFavorited ? '★ 已收藏' : '☆ 收藏' }}
          </button>
        </div>
      </div>
    </div>
    
    <div class="resource-content">
      <h2>资源详情</h2>
      <p>{{ resource.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { favoriteService } from '@/services/favoriteService'
import { ElMessage } from 'element-plus'

type ResType = 'document' | 'video' | 'code' | 'dataset' | 'tool'
interface ResourceCard { 
  id: string; 
  title: string; 
  description: string; 
  type: ResType; 
  preview: string; 
  downloads: number; 
  author: string; 
  authorAvatar: string;
  downloadUrl?: string;
  externalUrl?: string;
  size?: string;
  language?: string;
  tags?: string[];
}

const route = useRoute()
const resource = ref<ResourceCard>({
  id: '',
  title: '',
  description: '',
  type: 'document',
  preview: '',
  downloads: 0,
  author: '',
  authorAvatar: '',
  downloadUrl: '',
  externalUrl: '',
  size: '',
  language: '',
  tags: []
})
const isFavorited = ref(false)
const favoriteCount = ref(0)

// 模拟资源数据（实际项目中应该从API获取）
const mockResources: ResourceCard[] = [
  { 
    id: '1', 
    title: 'Python 机器学习完整教程', 
    description: '从零开始的机器学习路线与代码示例。', 
    type: 'document', 
    preview: new URL('/src/assets/images/document-cover.svg', import.meta.url).href, 
    downloads: 15420, 
    author: 'AI学院', 
    authorAvatar: new URL('/src/assets/images/default.png', import.meta.url).href,
    downloadUrl: 'https://github.com/scikit-learn/scikit-learn',
    externalUrl: 'https://scikit-learn.org/stable/',
    size: '2.3MB',
    language: 'Python',
    tags: ['机器学习', 'Python', '教程']
  },
  { 
    id: '2', 
    title: '深度学习实战项目合集', 
    description: '10 个完整项目覆盖图像与文本任务。', 
    type: 'code', 
    preview: new URL('/src/assets/images/code-cover.svg', import.meta.url).href, 
    downloads: 12850, 
    author: '深度学习专家', 
    authorAvatar: new URL('/src/assets/images/default.png', import.meta.url).href,
    downloadUrl: 'https://github.com/pytorch/examples',
    externalUrl: 'https://pytorch.org/tutorials/',
    size: '15.2MB',
    language: 'Python',
    tags: ['深度学习', 'PyTorch', '项目']
  },
  { 
    id: '3', 
    title: 'NLP 数据集大全', 
    description: '文本分类/情感分析/机器翻译常用数据集汇总。', 
    type: 'dataset', 
    preview: new URL('/src/assets/images/dataset-cover.svg', import.meta.url).href, 
    downloads: 9650, 
    author: '数据科学家', 
    authorAvatar: new URL('/src/assets/images/default.png', import.meta.url).href,
    downloadUrl: 'https://huggingface.co/datasets',
    externalUrl: 'https://huggingface.co/datasets',
    size: '500MB+',
    language: 'Multi',
    tags: ['NLP', '数据集', '文本分析']
  },
  { 
    id: '4', 
    title: 'TensorFlow 官方教程', 
    description: 'Google 官方深度学习框架完整教程。', 
    type: 'video', 
    preview: new URL('/src/assets/images/video-cover.svg', import.meta.url).href, 
    downloads: 22300, 
    author: 'Google AI', 
    authorAvatar: new URL('/src/assets/images/default.png', import.meta.url).href,
    externalUrl: 'https://www.tensorflow.org/tutorials',
    size: '在线',
    language: 'Python',
    tags: ['TensorFlow', '深度学习', 'Google']
  },
  { 
    id: '5', 
    title: 'Jupyter Notebook 工具集', 
    description: '数据科学必备的交互式开发环境。', 
    type: 'tool', 
    preview: new URL('/src/assets/images/tool-cover.svg', import.meta.url).href, 
    downloads: 18700, 
    author: 'Jupyter团队', 
    authorAvatar: new URL('/src/assets/images/default.png', import.meta.url).href,
    downloadUrl: 'https://jupyter.org/install',
    externalUrl: 'https://jupyter.org/',
    size: '50MB',
    language: 'Python',
    tags: ['Jupyter', '数据科学', '开发工具']
  }
]

const typeText = (t: ResType) => ({ document: '文档', video: '视频', code: '代码', dataset: '数据集', tool: '工具' }[t])

const getDifficultyLevel = () => {
  const tags = resource.value.tags || []
  if (tags.includes('入门') || tags.includes('基础')) return '初学者'
  if (tags.includes('进阶') || tags.includes('中级')) return '中级'
  if (tags.includes('高级') || tags.includes('专家')) return '高级'
  return '所有级别'
}

const downloadResource = () => {
  if (resource.value.downloadUrl) {
    window.open(resource.value.downloadUrl, '_blank')
  }
}

const viewOnline = () => {
  if (resource.value.externalUrl) {
    window.open(resource.value.externalUrl, '_blank')
  }
}

// 检查收藏状态
const checkFavoriteStatus = async () => {
  if (!resource.value.id) return
  try {
    const result = await favoriteService.checkFavorite('resource', String(resource.value.id))
    if (result.success) {
      isFavorited.value = result.favorited
    }
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

// 切换收藏状态
const toggleFavorite = async () => {
  if (!resource.value.id) {
    ElMessage.error('资源ID不存在')
    return
  }
  
  try {
    const result = await favoriteService.toggleFavorite('resource', String(resource.value.id))
    if (result.success) {
      isFavorited.value = result.favorited
      favoriteCount.value = result.favorited ? favoriteCount.value + 1 : favoriteCount.value - 1
      ElMessage.success(result.message)
    } else {
      ElMessage.error(result.message || '操作失败')
    }
  } catch (error: any) {
    console.error('收藏操作失败:', error)
    ElMessage.error(error.response?.data?.message || '操作失败，请重试')
  }
}

// 加载资源详情
const loadResourceDetail = async () => {
  const resourceId = route.params.id as string
  if (!resourceId) return
  
  try {
    const res = await fetch(`http://localhost:3000/api/resources/${resourceId}`)
    const result = await res.json()
    if (result.success && result.data) {
      const r = result.data
      resource.value = {
        id: r.id,
        title: r.title,
        description: r.description || '',
        type: (r.type as ResType) || 'document',
        preview: (() => {
          const val = (r.cover || '').trim()
          if (!val) return new URL('/src/assets/images/document-cover.svg', import.meta.url).href
          if (val.startsWith('http://') || val.startsWith('https://')) return val
          if (val.startsWith('/uploads/')) return `http://localhost:3000${val}`
          if (val.startsWith('/assets/')) {
            try { return new URL(val.replace('/assets/', '/src/assets/'), import.meta.url).href } catch { return val }
          }
          return new URL('/src/assets/images/document-cover.svg', import.meta.url).href
        })(),
        downloads: r.viewCount || 0,
        author: r.author || 'AI学院',
        authorAvatar: new URL('/src/assets/images/default.png', import.meta.url).href,
        downloadUrl: r.url || '',
        externalUrl: r.url || '',
        size: '未知',
        language: 'Multi',
        tags: Array.isArray(r.tags) ? r.tags : []
      }
      favoriteCount.value = r.favoriteCount || 0
      // 增加浏览量
      fetch(`http://localhost:3000/api/resources/${resourceId}/view`, { method: 'POST' }).catch(() => {})
      // 检查收藏状态
      await checkFavoriteStatus()
    }
  } catch (error) {
    console.error('加载资源详情失败:', error)
  }
}

// 监听路由参数变化
watch(
  () => route.params.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      loadResourceDetail()
    }
  }
)

onMounted(() => {
  loadResourceDetail()
})
</script>

<style scoped>
.resource-detail {
  max-width: 1000px;
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

.resource-header {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.resource-thumb {
  position: relative;
  width: 200px;
  height: 150px;
  flex-shrink: 0;
}

.resource-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}

.badge.document { background: #3b82f6; }
.badge.video { background: #ef4444; }
.badge.code { background: #10b981; }
.badge.dataset { background: #8b5cf6; }
.badge.tool { background: #f59e0b; }

.resource-info {
  flex: 1;
}

.resource-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: var(--text-primary);
}

.resource-description {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0 0 20px 0;
  line-height: 1.6;
}

.resource-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-label {
  color: var(--text-tertiary);
  font-size: 14px;
  font-weight: 500;
}

.meta-value {
  color: var(--text-primary);
  font-size: 14px;
}

.resource-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tag {
  background: var(--accent-color);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.resource-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  font-size: 14px;
  color: var(--text-secondary);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.resource-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
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
}

.action-btn.favorite {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.action-btn.favorite:hover {
  background: var(--bg-secondary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-btn.favorite.favorited {
  background: #fff5f5;
  color: #ff6b6b;
  border-color: #ff6b6b;
}

.action-btn.favorite.favorited:hover {
  background: #ffe5e5;
}

/* 删除图片右上角收藏按钮样式 */
.badge {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}

.resource-content {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--border-color);
}

.resource-content h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 20px 0;
  color: var(--text-primary);
}

.content-section {
  margin-bottom: 24px;
}

.content-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--text-primary);
}

.content-section p {
  color: var(--text-secondary);
  margin: 0 0 12px 0;
}

.content-section ul {
  color: var(--text-secondary);
  padding-left: 20px;
}

.content-section li {
  margin-bottom: 8px;
}

.tag-cloud {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .resource-header {
    flex-direction: column;
  }
  
  .resource-thumb {
    width: 100%;
    height: 200px;
  }
  
  .resource-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}
</style>
