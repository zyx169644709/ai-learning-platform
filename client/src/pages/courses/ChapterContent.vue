<template>
  <div class="breadcrumb">
    <RouterLink to="/home">首页</RouterLink>
    <span>/</span>
    <span>{{ chapter?.title || '...' }}</span>
    <span v-if="section">/</span>
    <span v-if="section">{{ section?.title }}</span>
  </div>
  <div class="chapter-content">
    <div class="section-header">
      <div v-if="section?.duration" class="section-meta">
        <span class="reading-time">⏱ 大约阅读时间：{{ section.duration }}</span>
      </div>
      <button 
        v-if="section"
        class="favorite-btn" 
        :class="{ 'favorited': isFavorited }"
        @click="toggleFavorite"
        :title="isFavorited ? '取消收藏' : '收藏章节'"
      >
        {{ isFavorited ? '★ 取消收藏' : '☆ 收藏' }}
      </button>
    </div>

    <div v-if="html" class="md" v-html="html" />
    <div v-else class="empty">尚未准备内容</div>

    <!-- 代码示例区域 -->
    <div v-if="codeEditors.length > 0 && !hasInlineEditors" class="code-editors-section">
      <h3>💻 代码示例</h3>
      <InlineCodeEditor
        v-for="(editor, index) in codeEditors"
        :key="index"
        :initialCode="editor.code"
        :language="editor.language"
        :title="`示例 ${index + 1}`"
      />
    </div>

    <div class="nav">
      <RouterLink v-if="prev" :to="linkOf(prev)">← 上一节：{{ prev.title }}</RouterLink>
      <RouterLink v-if="next" :to="linkOf(next)">下一节：{{ next.title }} →</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'
import { useChaptersStore, type ChapterNode, type SectionNode } from '@/stores/chaptersStore'
import { favoriteService } from '@/services/favoriteService'
import InlineCodeEditor from '@/components/common/InlineCodeEditor.vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const chaptersStore = useChaptersStore()
const chapterSlug = computed(() => String(route.params.chapterSlug || ''))
const sectionSlug = computed(() => String(route.params.sectionSlug || ''))

const chapter = computed<ChapterNode | undefined>(() =>
  chaptersStore.chapters.find(c => c.slug === chapterSlug.value)
)
const section = computed<SectionNode | undefined>(() => {
  if (!chapter.value) return undefined
  return chapter.value.children?.find(s => s.slug === sectionSlug.value)
})

const md = new MarkdownIt({
  html: true,
  highlight: (str: string, lang: string): string => {
    // 语言映射，将不支持的语言映射到相近的语言
    const langMap: Record<string, string> = {
      'vue': 'html',
      'jsx': 'javascript',
      'tsx': 'typescript'
    }
    
    const actualLang = langMap[lang] || lang
    
    if (actualLang && hljs.getLanguage(actualLang)) {
      try {
        return `<pre class="hljs" data-lang="${lang}"><code class="hljs">${hljs.highlight(str, { language: actualLang }).value}</code></pre>`
      } catch { }
    }
    return `<pre class="hljs" data-lang="${lang}"><code class="hljs">${str.replace(/[&<>"']/g, (char) => {
      const entities: { [key: string]: string } = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
      return entities[char]
    })}</code></pre>`
  }
})

const html = ref('')
const codeEditors = ref<Array<{ code: string; language: string }>>([])
const hasInlineEditors = ref(false)
const isFavorited = ref(false)

// 安全清洗 HTML 内容
const sanitizeHtml = (rawHtml: string): string => {
  return DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'blockquote',
      'pre', 'code',
      'strong', 'em', 'del', 'ins',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id',
      'target', 'rel'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    KEEP_CONTENT: true,
    ALLOW_DATA_ATTR: true
  })
}

// 解析Markdown中的代码编辑器语法
const parseCodeEditors = (markdown: string): { processedMarkdown: string; editors: Array<{ code: string; language: string }> } => {
  // 同时兼容 Unix(\n) 与 Windows(\r\n) 换行
  const editorRegex = /```editor:(\w+)\r?\n([\s\S]*?)```/g
  const editors: Array<{ code: string; language: string }> = []
  let processedMarkdown = markdown
  let match
  let editorIndex = 0

  console.log('🔍 开始解析Markdown中的代码编辑器语法...')
  console.log('🔍 原始Markdown长度:', markdown.length)

  while ((match = editorRegex.exec(markdown)) !== null) {
    const language = match[1]
    const code = match[2].trim()

    console.log(`🔍 找到代码编辑器 ${editorIndex}:`, { language, codeLength: code.length })

    editors.push({ code, language })

    // 在正文放置一个挂载点，后续可在该位置渲染编辑器
    const slot = `<div class="md-editor-slot" data-editor-index="${editorIndex}"></div>`
    processedMarkdown = processedMarkdown.replace(match[0], slot)
    editorIndex++
    hasInlineEditors.value = true
  }

  console.log(`🔍 总共找到 ${editors.length} 个代码编辑器`)
  return { processedMarkdown, editors }
}

// 在正文中把代码示例渲染到占位节点
const insertCodeEditors = () => {
  const container = document.querySelector('.md')
  if (!container) return
  const slots = container.querySelectorAll('.md-editor-slot[data-editor-index]') as NodeListOf<HTMLDivElement>
  console.log('🔧 slots found:', slots.length)
  slots.forEach(slot => {
    const idxAttr = slot.getAttribute('data-editor-index')
    if (!idxAttr) return
    const idx = Number(idxAttr)
    const editor = codeEditors.value[idx]
    if (!editor) return
    // 创建静态代码展示块
    const codeBlock = document.createElement('div')
    codeBlock.className = 'inline-code-example'
    codeBlock.innerHTML = `
      <div class="code-example-header">
        <span class="language-badge">${editor.language}</span>
      </div>
      <pre class="code-example-content"><code>${escapeHtml(editor.code)}</code></pre>
    `
    slot.replaceWith(codeBlock)
  })
}

// HTML转义函数
const escapeHtml = (str: string): string => {
  return str.replace(/[&<>"']/g, (char) => {
    const entities: { [key: string]: string } = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
    return entities[char]
  })
}

const renderUnderConstruction = () => {
  const placeholder = `# 正在开发中\n\n本节内容正在编写中，敬请期待。\n\n> 如果你是维护者：请在 \`src/content/markdown/${chapter.value?.slug}\` 下添加对应的 \`.md\` 文件。`
  const rawHtml = md.render(placeholder)
  html.value = sanitizeHtml(rawHtml)
}

const load = async () => {
  // 确保章节数据已加载
  if (!chaptersStore.loaded) {
    await chaptersStore.fetchChapters()
  }

  if (!chapter.value) {
    html.value = ''
    return
  }

  // 没有指定小节时，显示章节介绍
  if (!sectionSlug.value) {
    const placeholder = `# ${chapter.value.title}\n\n请从左侧目录选择一个小节开始学习。`
    html.value = sanitizeHtml(md.render(placeholder))
    return
  }

  if (!section.value) {
    renderUnderConstruction()
    return
  }

  try {
    // 从 API 获取小节内容
    const res = await fetch(`/api/chapters/${chapter.value.id}/sections/${section.value.id}`)
    const json = await res.json()

    if (!json.success || !json.data.content) {
      renderUnderConstruction()
      return
    }

    const raw: string = json.data.content

    // 解析代码编辑器语法
    const { processedMarkdown, editors } = parseCodeEditors(raw)
    codeEditors.value = editors

    const rawHtml = md.render(processedMarkdown)
    html.value = sanitizeHtml(rawHtml)

    fetch(`/api/chapters/${chapter.value.id}/sections/${section.value.id}/view`, { method: 'POST' }).catch(() => { })

    await nextTick()
    insertCodeEditors()
  } catch (error) {
    console.error('Failed to load section content:', error)
    renderUnderConstruction()
  }
}

onMounted(load)

// 监听路由参数变化，重新加载内容
watch([chapterSlug, sectionSlug], () => {
  console.log('Route parameters changed, reloading content...')
  load().then(() => {
    // 切换章节/小节后滚动到页面顶部
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  })
}, { immediate: false })

const siblings = computed(() => chapter.value?.children || [])
const currentIndex = computed(() => siblings.value.findIndex(n => n.slug === sectionSlug.value))
const prev = computed(() => currentIndex.value > 0 ? siblings.value[currentIndex.value - 1] : undefined)
const next = computed(() => currentIndex.value >= 0 && currentIndex.value < siblings.value.length - 1 ? siblings.value[currentIndex.value + 1] : undefined)

const linkOf = (n: SectionNode) => ({ path: `/chapter/${chapterSlug.value}/${n.slug}` })

// 检查收藏状态
const checkFavoriteStatus = async () => {
  if (!section.value?.id) return
  try {
    const result = await favoriteService.checkFavorite('chapter', section.value.id)
    if (result.success) {
      isFavorited.value = result.favorited
    }
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

// 切换收藏状态
const toggleFavorite = async () => {
  if (!section.value?.id) return
  try {
    const result = await favoriteService.toggleFavorite('chapter', section.value.id)
    if (result.success) {
      isFavorited.value = result.favorited
      ElMessage.success(result.message)
    }
  } catch (error: any) {
    console.error('收藏操作失败:', error)
    ElMessage.error(error.response?.data?.message || '操作失败，请重试')
  }
}

// 监听章节变化，检查收藏状态
watch([section], async () => {
  if (section.value?.id) {
    await checkFavoriteStatus()
  }
}, { immediate: true })
</script>

<style scoped>
.breadcrumb {
  color: var(--text-tertiary);
  display: flex;
  justify-content: right;
  margin: 25px;
  gap: 6px;
  align-items: center;
  font-size: 13px;
}

.chapter-content {
  margin: -35px 0px 0px 45px;
  margin-top: -35px;
  padding: 24px;
  max-width: 860px;
}

.section-header {
  border-radius: 8px;
  overflow: hidden;
}

.editor-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-tertiary, #f1f5f9);
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.language-badge {
  background: var(--accent-color, #3b82f6);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.editor-title {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.9rem;
}

.md :deep(h1) {
  font-size: 2.3rem;
  font-weight: 700;
  padding-bottom: 10px;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border-color, #e5e7eb);
  padding-bottom: 70px;
}

.md :deep(h2) {
  font-size: 1.6rem;
  font-weight: 600;
  margin: 2rem 0 1rem 0;
  color: var(--text-primary);
}

.md :deep(h3) {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 1.5rem 0 0.8rem 0;
  color: var(--text-primary);
}

.md :deep(h4) {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 1.2rem 0 0.6rem 0;
  color: var(--text-primary);
}

.md :deep(p) {
  margin: 1rem 0;
  line-height: 1.6;
  color: var(--text-primary);
}

.md :deep(ul),
.md :deep(ol) {
  margin: 1rem 0;
  padding-left: 2rem;
}

.md :deep(li) {
  margin: 0.5rem 0;
  line-height: 1.6;
  color: var(--text-primary);
}

.md :deep(strong) {
  font-weight: 600;
  color: var(--text-primary);
}

.md :deep(em) {
  font-style: italic;
  color: var(--text-secondary);
}

.md :deep(blockquote) {
  margin: 1.5rem 0;
  padding: 1rem 1.5rem;
  border-left: 4px solid var(--accent-color, #3b82f6);
  background: var(--bg-secondary);
  border-radius: 0 8px 8px 0;
  font-style: italic;
  color: var(--text-secondary);
}

.md :deep(blockquote p) {
  margin: 0;
}

.md :deep(pre) {
  position: relative;
  background: var(--code-bg);
  padding: 1.5rem;
  border-radius: 10px;
  overflow: auto;
  border: 1px solid var(--code-border);
  margin: 1.5rem 0;
  box-shadow: 0 1px 0 rgba(148, 163, 184, 0.1) inset;
}

.md :deep(code) {
  font-family: 'Fira Code', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.9rem;
  background: var(--bg-tertiary);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  color: var(--code-text);
}

.md :deep(pre code) {
  background: none;
  padding: 0;
  border-radius: 0;
  color: var(--code-text);
}

/* 右上角语言标签 */
.md :deep(pre[data-lang]::after) {
  content: attr(data-lang);
  position: absolute;
  top: 10px;
  right: 12px;
  font-size: 12px;
  line-height: 1;
  color: var(--code-badge-text);
  background: var(--code-badge-bg);
  border: 1px solid var(--code-badge-border);
  padding: 4px 6px;
  border-radius: 6px;
  text-transform: uppercase;
}

/* highlight.js 令牌颜色（近似文档截图风格） */
.md :deep(.hljs) {
  color: var(--code-text);
  /* 基本文字 */
  background: transparent;
}

.md :deep(.hljs-comment),
.md :deep(.hljs-quote) {
  color: var(--code-comment);
  /* 注释 */
  font-style: italic;
}

.md :deep(.hljs-keyword),
.md :deep(.hljs-selector-tag),
.md :deep(.hljs-literal),
.md :deep(.hljs-name) {
  color: var(--code-keyword);
  /* 关键字、类型名 */
}

.md :deep(.hljs-string),
.md :deep(.hljs-title),
.md :deep(.hljs-section),
.md :deep(.hljs-attribute) {
  color: var(--code-string);
  /* 字符串、属性、标题 */
}

.md :deep(.hljs-number),
.md :deep(.hljs-built_in),
.md :deep(.hljs-builtin-name),
.md :deep(.hljs-class .hljs-title) {
  color: var(--code-number);
  /* 数字、内置 */
}

.md :deep(.hljs-symbol),
.md :deep(.hljs-bullet),
.md :deep(.hljs-link) {
  color: var(--code-symbol);
  /* 符号/链接 */
}

.md :deep(.hljs-variable),
.md :deep(.hljs-template-variable),
.md :deep(.hljs-tag),
.md :deep(.hljs-regexp),
.md :deep(.hljs-deletion) {
  color: var(--code-variable);
  /* 变量/正则/删除 */
}

.md :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  overflow: hidden;
}

.md :deep(th) {
  background: var(--bg-secondary);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.md :deep(td) {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  color: var(--text-primary);
}

.md :deep(tr:last-child td) {
  border-bottom: none;
}

.md :deep(hr) {
  margin: 2rem 0;
  border: none;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

/* 章节操作按钮 */
.section-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 24px;
  gap: 16px;
}

.section-meta {
  margin-right: auto;
}

.reading-time {
  font-size: 13px;
  color: var(--text-tertiary);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 4px 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.chapter-actions {
  margin: 32px 0 16px 0;
  display: flex;
  justify-content: center;
}

.favorite-btn {
  padding: 10px 24px;
  margin-left: 20px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.favorite-btn:hover {
  background: var(--bg-secondary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.favorite-btn.favorited {
  background: #fff5f5;
  color: #ff6b6b;
  border-color: #ff6b6b;
}

.favorite-btn.favorited:hover {
  background: #ffe5e5;
}

/* 导航区域布局 */
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.nav a {
  padding: 12px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  font-weight: 500;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.nav a:hover {
  background: var(--accent-color, #3b82f6);
  color: white;
  border-color: var(--accent-color, #3b82f6);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

/* 去除 RouterLink 的下划线 */
.breadcrumb a,
.nav a {
  text-decoration: none;
}

.breadcrumb a:hover,
.nav a:hover {
  text-decoration: none;
}

.breadcrumb a:focus,
.nav a:focus {
  text-decoration: none;
}

.breadcrumb a:active,
.nav a:active {
  text-decoration: none;
}
</style>