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
        <p class="resource-description">{{ resource.description }}</p>
        
        <div class="resource-meta">
          <div class="meta-item">
            <span class="meta-label">作者：</span>
            <span class="meta-value">{{ resource.author }}</span>
          </div>
          <div class="meta-item" v-if="resource.size">
            <span class="meta-label">大小：</span>
            <span class="meta-value">{{ resource.size }}</span>
          </div>
          <div class="meta-item" v-if="resource.language">
            <span class="meta-label">语言：</span>
            <span class="meta-value">{{ resource.language }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">下载量：</span>
            <span class="meta-value">{{ resource.downloads.toLocaleString() }}</span>
          </div>
        </div>
        
        <div class="resource-tags" v-if="resource.tags && resource.tags.length > 0">
          <span class="tag" v-for="tag in resource.tags" :key="tag">{{ tag }}</span>
        </div>
        
        <div class="resource-actions">
          <button 
            v-if="resource.downloadUrl" 
            @click="downloadResource" 
            class="action-btn primary"
          >
            📥 下载资源
          </button>
          <button 
            v-if="resource.externalUrl" 
            @click="viewOnline" 
            class="action-btn secondary"
          >
            🌐 在线查看
          </button>
        </div>
      </div>
    </div>
    
    <div class="resource-content">
      <h2>资源详情</h2>
      <div class="content-section">
        <h3>使用说明</h3>
        <p>这是一个高质量的{{ typeText(resource.type) }}资源，适合{{ getDifficultyLevel() }}学习者使用。</p>
        <ul>
          <li v-if="resource.type === 'document'">包含详细的文档说明和示例代码</li>
          <li v-if="resource.type === 'video'">提供完整的视频教程和配套资料</li>
          <li v-if="resource.type === 'code'">包含完整的源代码和注释</li>
          <li v-if="resource.type === 'dataset'">提供清洗好的数据集和说明文档</li>
          <li v-if="resource.type === 'tool'">包含安装指南和使用教程</li>
        </ul>
      </div>
      
      <div class="content-section" v-if="resource.tags && resource.tags.length > 0">
        <h3>相关标签</h3>
        <div class="tag-cloud">
          <span class="tag" v-for="tag in resource.tags" :key="tag">{{ tag }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

type ResType = 'document' | 'video' | 'code' | 'dataset' | 'tool'
interface ResourceCard { 
  id: number; 
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
  id: 0,
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

// 模拟资源数据（实际项目中应该从API获取）
const mockResources: ResourceCard[] = [
  { 
    id: 1, 
    title: 'Python 机器学习完整教程', 
    description: '从零开始的机器学习路线与代码示例。', 
    type: 'document', 
    preview: '/src/assets/images/document-cover.svg', 
    downloads: 15420, 
    author: 'AI学院', 
    authorAvatar: '/assets/images/default.png',
    downloadUrl: 'https://github.com/scikit-learn/scikit-learn',
    externalUrl: 'https://scikit-learn.org/stable/',
    size: '2.3MB',
    language: 'Python',
    tags: ['机器学习', 'Python', '教程']
  },
  { 
    id: 2, 
    title: '深度学习实战项目合集', 
    description: '10 个完整项目覆盖图像与文本任务。', 
    type: 'code', 
    preview: '/src/assets/images/code-cover.svg', 
    downloads: 12850, 
    author: '深度学习专家', 
    authorAvatar: '/assets/images/default.png',
    downloadUrl: 'https://github.com/pytorch/examples',
    externalUrl: 'https://pytorch.org/tutorials/',
    size: '15.2MB',
    language: 'Python',
    tags: ['深度学习', 'PyTorch', '项目']
  },
  { 
    id: 3, 
    title: 'NLP 数据集大全', 
    description: '文本分类/情感分析/机器翻译常用数据集汇总。', 
    type: 'dataset', 
    preview: '/src/assets/images/dataset-cover.svg', 
    downloads: 9650, 
    author: '数据科学家', 
    authorAvatar: '/assets/images/default.png',
    downloadUrl: 'https://huggingface.co/datasets',
    externalUrl: 'https://huggingface.co/datasets',
    size: '500MB+',
    language: 'Multi',
    tags: ['NLP', '数据集', '文本分析']
  },
  { 
    id: 4, 
    title: 'TensorFlow 官方教程', 
    description: 'Google 官方深度学习框架完整教程。', 
    type: 'video', 
    preview: '/src/assets/images/video-cover.svg', 
    downloads: 22300, 
    author: 'Google AI', 
    authorAvatar: '/assets/images/default.png',
    externalUrl: 'https://www.tensorflow.org/tutorials',
    size: '在线',
    language: 'Python',
    tags: ['TensorFlow', '深度学习', 'Google']
  },
  { 
    id: 5, 
    title: 'Jupyter Notebook 工具集', 
    description: '数据科学必备的交互式开发环境。', 
    type: 'tool', 
    preview: '/src/assets/images/tool-cover.svg', 
    downloads: 18700, 
    author: 'Jupyter团队', 
    authorAvatar: '/assets/images/default.png',
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

onMounted(() => {
  const resourceId = parseInt(route.params.id as string)
  const foundResource = mockResources.find(r => r.id === resourceId)
  if (foundResource) {
    resource.value = foundResource
  }
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
  right: 8px;
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
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.tag {
  background: var(--accent-color);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
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

.action-btn.secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.action-btn.secondary:hover {
  background: var(--bg-secondary);
  border-color: var(--accent-color);
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
