import MiniSearch from 'minisearch'
import { chapters } from '@/content/chapters'
import * as communityApi from '@/services/communityService'
import axios from 'axios'

// 搜索服务
export interface SearchResult {
  id: string
  title: string
  description: string
  type: 'course' | 'resource' | 'community' | 'chapter' | 'section'
  url: string
  relevance: number
  content?: string
  tags?: string[]
}

export interface SearchOptions {
  query: string
  type?: string
  limit?: number
  offset?: number
}

// 构建搜索索引数据（静态来源：章节）
const buildStaticSearchData = (): SearchResult[] => {
  const data: SearchResult[] = []
  
  // 添加章节数据
  chapters.forEach(chapter => {
    // 添加章节本身
    data.push({
      id: `chapter-${chapter.slug}`,
      title: chapter.title,
      description: `${chapter.title} - 完整的章节内容`,
      type: 'chapter',
      url: `/chapter/${chapter.slug}`,
      relevance: 0.9,
      content: chapter.title,
      tags: ['章节', '教程']
    })
    
    // 添加章节下的所有小节
    chapter.children?.forEach(section => {
      data.push({
        id: `section-${chapter.slug}-${section.slug}`,
        title: section.title,
        description: `${section.title} - ${chapter.title} 的一部分`,
        type: 'section',
        url: `/chapter/${chapter.slug}/${section.slug}`,
        relevance: 0.8,
        content: `${section.title} ${chapter.title}`,
        tags: ['小节', '教程', chapter.title]
      })
    })
  })
  
  // 不再加入前端静态课程/资源，改为仅在初始化阶段从后端拉取
  
  return data
}

// 创建 MiniSearch 实例
const searchIndex = new MiniSearch({
  fields: ['title', 'description', 'content', 'tags'],
  searchOptions: {
    boost: { title: 2, description: 1, content: 1, tags: 1.5 },
    fuzzy: 0.2,
    prefix: true
  },
  storeFields: ['id', 'title', 'description', 'type', 'url', 'relevance', 'tags']
})

// 初始化搜索索引
let searchData: SearchResult[] = []
let isInitialized = false
let initializingPromise: Promise<void> | null = null

// 异步初始化索引：静态数据 + 实时社区数据
const initializeSearchIndex = async () => {
  if (isInitialized) return
  if (initializingPromise) return initializingPromise

  initializingPromise = (async () => {
    // 静态数据
    searchData = buildStaticSearchData()

    // 实时资源数据（后端）
    try {
      const { data } = await axios.get('http://localhost:3000/api/resources')
      const remoteResources: SearchResult[] = (data || []).map((r: any) => ({
        id: `resource-${r.id}`,
        title: r.title,
        description: r.description || '学习资源',
        type: 'resource',
        url: r.url || `/resources/${r.id}`,
        relevance: 0.86,
        content: [r.title, r.description, ...(r.tags || [])].join(' '),
        tags: r.tags
      }))
      searchData.push(...remoteResources)
    } catch (e) {
      console.warn('搜索索引加载远程资源失败，已忽略:', e)
    }

    // 实时课程数据（后端）
    try {
      const { data } = await axios.get('http://localhost:3000/api/courses')
      const remoteCourses: SearchResult[] = (data || []).map((c: any) => ({
        id: `course-${c.id}`,
        title: c.title,
        description: c.description || '课程',
        type: 'course',
        url: c.url || `/courses/${c.id}`,
        relevance: 0.9,
        content: [c.title, c.description, ...(c.tags || [])].join(' '),
        tags: c.tags
      }))
      searchData.push(...remoteCourses)
    } catch (e) {
      console.warn('搜索索引加载课程数据失败，已忽略:', e)
    }

    // 实时社区数据
    try {
      const discussions = await communityApi.getDiscussions()
      const communityResults: SearchResult[] = (discussions || []).map(d => ({
        id: `community-${d.id}`,
        title: d.title,
        description: d.excerpt || d.content?.slice(0, 120) || '社区讨论',
        type: 'community',
        url: `/discussion/${d.id}`,
        relevance: 0.75,
        content: [d.title, d.content].join(' '),
        tags: [d.category]
      }))
      searchData.push(...communityResults)
    } catch (e) {
      // 社区接口不可用时，继续使用静态数据，避免搜索崩溃
      console.warn('搜索索引加载社区数据失败，已忽略:', e)
    }

    // 建立索引
    searchIndex.addAll(searchData)
    isInitialized = true
  })()

  return initializingPromise
}

class SearchService {
  // 执行搜索
  async search(options: SearchOptions): Promise<SearchResult[]> {
    const { query, type, limit = 10, offset = 0 } = options
    
    // 确保搜索索引已异步初始化
    await initializeSearchIndex()
    
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 100))
    
    if (!query.trim()) {
      return []
    }
    
    // 使用 MiniSearch 搜索
    const searchResults = searchIndex.search(query, {
      filter: type ? (result) => result.type === type : undefined,
      boost: { title: 2, description: 1, content: 1, tags: 1.5 }
    })
    
    // 转换为 SearchResult 格式
    const results: SearchResult[] = searchResults.map((result, index) => ({
      id: result.id,
      title: result.title,
      description: result.description,
      type: result.type as SearchResult['type'],
      url: result.url,
      relevance: result.score || (1 - index * 0.1),
      tags: result.tags
    }))
    
    // 分页
    return results.slice(offset, offset + limit)
  }

  // 获取搜索建议
  async getSuggestions(query: string): Promise<string[]> {
    if (!query.trim()) return []
    
    const suggestions = [
      '人工智能',
      '机器学习',
      '深度学习',
      '神经网络',
      '自然语言处理',
      '计算机视觉',
      '数学基础',
      'Python编程',
      '线性代数',
      '概率统计',
      '监督学习',
      '无监督学习',
      '强化学习',
      '卷积神经网络',
      '循环神经网络',
      'Transformer',
      'BERT',
      'GPT',
      '图像识别',
      '语音识别'
    ]
    
    // 基于查询过滤和排序建议
    const filtered = suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(query.toLowerCase())
    )
    
    // 按匹配度排序
    return filtered.sort((a, b) => {
      const aStartsWith = a.toLowerCase().startsWith(query.toLowerCase())
      const bStartsWith = b.toLowerCase().startsWith(query.toLowerCase())
      
      if (aStartsWith && !bStartsWith) return -1
      if (!aStartsWith && bStartsWith) return 1
      return a.length - b.length
    }).slice(0, 8)
  }

  // 热门搜索
  async getPopularSearches(): Promise<string[]> {
    return [
      '人工智能基础',
      '机器学习入门',
      '深度学习实战',
      'Python AI',
      '神经网络原理',
      '数学基础',
      '线性代数',
      '概率统计'
    ]
  }

  // 获取搜索历史
  getSearchHistory(): string[] {
    const history = localStorage.getItem('searchHistory')
    return history ? JSON.parse(history) : []
  }

  // 保存搜索历史
  saveSearchHistory(query: string): void {
    if (!query.trim()) return
    
    const history = this.getSearchHistory()
    const newHistory = [query, ...history.filter(item => item !== query)].slice(0, 10)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))
  }

  // 清空搜索历史
  clearSearchHistory(): void {
    localStorage.removeItem('searchHistory')
  }
}

export const searchService = new SearchService()


