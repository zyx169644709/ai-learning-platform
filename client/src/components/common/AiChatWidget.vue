<template>
  <div class="ai-chat-widget">
    <!-- 浮动气泡按钮 -->
    <div 
      class="chat-bubble" 
      :class="{ 'has-unread': hasUnread }"
      @click="toggleChat"
      v-show="!isOpen"
    >
      <span class="bubble-icon">🤖</span>
      <span class="bubble-pulse"></span>
    </div>

    <!-- 聊天窗口 -->
    <transition name="chat-slide">
      <div 
        v-show="isOpen" 
        class="chat-window"
        :style="windowStyle"
        ref="chatWindowRef"
      >
        <!-- 拖拽调整大小手柄 -->
        <div 
          class="resize-handle resize-handle-top"
          @mousedown="startResize($event, 'top')"
        ></div>
        <div 
          class="resize-handle resize-handle-left"
          @mousedown="startResize($event, 'left')"
        ></div>
        <div 
          class="resize-handle resize-handle-corner"
          @mousedown="startResize($event, 'corner')"
        ></div>
        <div 
          class="chat-header"
          @mousedown="startDrag"
          :class="{ 'is-dragging': isDragging }"
        >
          <div class="header-info">
            <span class="header-icon">🤖</span>
            <div class="header-text">
              <h4>AI 学习助手</h4>
              <span class="header-status">{{ contextHint }}</span>
            </div>
          </div>
          <div class="header-actions">
            <button class="header-btn" :class="{ 'is-active': isPinned }" @click="togglePin" :title="isPinned ? '取消钉住' : '钉住窗口'">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 17v5"/>
                <path d="M8 3h8l-1 5 3 3v2H6v-2l3-3-1-5z"/>
              </svg>
            </button>
            <button class="header-btn" @click="clearMessages" title="清空对话">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
            <button class="header-btn close-btn" @click="toggleChat" title="关闭">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="chat-messages" ref="messagesContainer">
          <div 
            v-for="(msg, index) in messages" 
            :key="index" 
            :class="['message', msg.role]"
          >
            <div class="message-avatar">
              <span v-if="msg.role === 'assistant'">🤖</span>
              <img v-else :src="userAvatar" alt="用户" class="user-avatar" />
            </div>
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(msg.content)"></div>
            </div>
          </div>

          <!-- 加载指示器 -->
          <div v-if="isLoading" class="message assistant">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 快捷问题 -->
        <div class="quick-questions" v-if="messages.length <= 1">
          <button 
            v-for="q in quickQuestions" 
            :key="q" 
            class="quick-btn"
            @click="sendMessage(q)"
            :disabled="isLoading"
          >
            {{ q }}
          </button>
        </div>

        <div class="chat-input">
          <textarea 
            v-model="inputText" 
            placeholder="输入问题，按 Enter 发送..."
            @keydown.enter.exact.prevent="sendMessage(inputText)"
            :disabled="isLoading"
            rows="1"
            ref="inputRef"
          ></textarea>
          <button 
            class="send-btn" 
            @click="sendMessage(inputText)"
            :disabled="!inputText.trim() || isLoading"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { useChaptersStore } from '@/stores/chaptersStore'
import { streamTeachingChat } from '@/services'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const route = useRoute()
const userStore = useUserStore()
const chaptersStore = useChaptersStore()

const isOpen = ref(false)
const isLoading = ref(false)
const hasUnread = ref(false)
const inputText = ref('')
const messages = ref<ChatMessage[]>([])
const messagesContainer = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLTextAreaElement | null>(null)
const chatWindowRef = ref<HTMLElement | null>(null)
const isPinned = ref(false)

// 窗口尺寸状态
const windowWidth = ref(380)
const windowHeight = ref(520)
const isResizing = ref(false)
const resizeType = ref<'top' | 'left' | 'corner' | null>(null)
const startX = ref(0)
const startY = ref(0)
const startWidth = ref(0)
const startHeight = ref(0)

// 窗口位置状态
const windowRight = ref(0)
const windowBottom = ref(70)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragStartRight = ref(0)
const dragStartBottom = ref(0)

// 尺寸限制
const MIN_WIDTH = 320
const MAX_WIDTH = 700
const MIN_HEIGHT = 400
const MAX_HEIGHT = 800

// 计算窗口样式
const windowStyle = computed(() => ({
  width: `${windowWidth.value}px`,
  height: `${windowHeight.value}px`,
  right: `${windowRight.value}px`,
  bottom: `${windowBottom.value}px`
}))

// 开始拖拽调整大小
const startResize = (e: MouseEvent, type: 'top' | 'left' | 'corner') => {
  e.preventDefault()
  isResizing.value = true
  resizeType.value = type
  startX.value = e.clientX
  startY.value = e.clientY
  startWidth.value = windowWidth.value
  startHeight.value = windowHeight.value
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = type === 'corner' ? 'nwse-resize' : type === 'left' ? 'ew-resize' : 'ns-resize'
  document.body.style.userSelect = 'none'
}

// 处理拖拽
const handleResize = (e: MouseEvent) => {
  if (!isResizing.value) return
  
  const deltaX = startX.value - e.clientX
  const deltaY = startY.value - e.clientY
  
  if (resizeType.value === 'left' || resizeType.value === 'corner') {
    const newWidth = startWidth.value + deltaX
    windowWidth.value = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, newWidth))
  }
  
  if (resizeType.value === 'top' || resizeType.value === 'corner') {
    const newHeight = startHeight.value + deltaY
    windowHeight.value = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, newHeight))
  }
}

// 停止拖拽
const stopResize = () => {
  isResizing.value = false
  resizeType.value = null
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// 开始拖拽移动窗口
const startDrag = (e: MouseEvent) => {
  // 如果点击的是按钮，不触发拖拽
  if ((e.target as HTMLElement).closest('button')) return
  
  e.preventDefault()
  isDragging.value = true
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  dragStartRight.value = windowRight.value
  dragStartBottom.value = windowBottom.value
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  document.body.style.cursor = 'move'
  document.body.style.userSelect = 'none'
}

// 处理拖拽移动
const handleDrag = (e: MouseEvent) => {
  if (!isDragging.value) return
  
  const deltaX = dragStartX.value - e.clientX
  const deltaY = dragStartY.value - e.clientY
  
  // 计算新位置，限制在可视区域内
  const newRight = dragStartRight.value + deltaX
  const newBottom = dragStartBottom.value + deltaY
  
  // 边界限制
  const maxRight = window.innerWidth - windowWidth.value - 10
  const maxBottom = window.innerHeight - windowHeight.value - 10
  
  windowRight.value = Math.max(-windowWidth.value + 100, Math.min(maxRight, newRight))
  windowBottom.value = Math.max(-windowHeight.value + 100, Math.min(maxBottom, newBottom))
}

// 停止拖拽移动
const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

const userAvatar = computed(() => userStore.avatar || '/src/assets/images/default.png')

// 快捷问题
const quickQuestions = [
  '这个页面讲的是什么？',
  '帮我解释一下核心概念',
  '有什么学习建议？'
]

// 根据当前路由生成上下文提示
const contextHint = computed(() => {
  const name = route.name as string
  if (name?.includes('Chapter') || route.path.includes('/chapter')) {
    return '正在学习章节内容'
  }
  if (name?.includes('Course') || route.path.includes('/course')) {
    return '正在浏览课程'
  }
  if (name?.includes('Resource') || route.path.includes('/resource')) {
    return '正在查看资源'
  }
  if (route.path.includes('/community') || route.path.includes('/discussion')) {
    return '正在浏览社区'
  }
  return '随时为您解答'
})

// 收集当前页面上下文
const getPageContext = (): string => {
  const routeName = route.name as string
  const path = route.path
  
  let context = `用户当前所在页面：${path}\n`
  
  // 章节页面 - 提取章节标题、面包屑、Markdown内容、代码示例
  if (routeName?.includes('Chapter') || path.includes('/chapter') || path.includes('/learn')) {
    context += `页面类型：章节学习\n`
    
    // 从面包屑获取章节路径
    const breadcrumb = document.querySelector('.breadcrumb')?.textContent?.trim()
    if (breadcrumb) context += `导航路径：${breadcrumb}\n`
    
    // 获取章节标题（从面包屑或h1/h2）
    const chapterTitle = document.querySelector('.chapter-content h1, .chapter-content h2, .md h1, .md h2')?.textContent?.trim()
    if (chapterTitle) context += `章节标题：${chapterTitle}\n`
    
    // 获取阅读时间
    const readingTime = document.querySelector('.reading-time')?.textContent?.trim()
    if (readingTime) context += `${readingTime}\n`
    
    // 获取Markdown渲染的主要内容（.md 或 .chapter-content）
    const mdContent = document.querySelector('.md, .chapter-content .md')
    if (mdContent) {
      // 提取所有标题作为大纲
      const headings = mdContent.querySelectorAll('h1, h2, h3')
      if (headings.length > 0) {
        const outline = Array.from(headings).map(h => h.textContent?.trim()).filter(Boolean).join(' > ')
        context += `内容大纲：${outline}\n`
      }
      
      // 提取段落文本内容（去除代码块）
      const paragraphs = mdContent.querySelectorAll('p')
      const textContent = Array.from(paragraphs)
        .map(p => p.textContent?.trim())
        .filter(Boolean)
        .join('\n')
        .slice(0, 2000)
      if (textContent) context += `正文内容：\n${textContent}\n`
      
      // 提取代码示例
      const codeBlocks = mdContent.querySelectorAll('pre code, .hljs code')
      if (codeBlocks.length > 0) {
        context += `\n代码示例（共${codeBlocks.length}个）：\n`
        Array.from(codeBlocks).slice(0, 3).forEach((code, i) => {
          const lang = code.closest('pre')?.getAttribute('data-lang') || 'code'
          const codeText = code.textContent?.slice(0, 500)
          if (codeText) context += `[${lang}] ${codeText}${codeText.length >= 500 ? '...' : ''}\n`
        })
      }
    }
  }
  
  // 课程详情页面
  else if (routeName?.includes('Course') || path.includes('/course')) {
    context += `页面类型：课程详情\n`
    
    // 课程标题
    const courseTitle = document.querySelector('.course-title, .course-header h1')?.textContent?.trim()
    if (courseTitle) context += `课程标题：${courseTitle}\n`
    
    // 课程元信息
    const metaItems = document.querySelectorAll('.course-meta .meta-item')
    if (metaItems.length > 0) {
      const metaInfo = Array.from(metaItems)
        .map(item => item.textContent?.trim().replace(/\s+/g, ' '))
        .filter(Boolean)
        .join('，')
      context += `课程信息：${metaInfo}\n`
    }
    
    // 课程介绍内容
    const courseContent = document.querySelector('.course-content .content-body, .course-content')?.textContent?.slice(0, 1500)
    if (courseContent) context += `课程介绍：${courseContent}\n`
  }
  
  // 资源页面
  else if (routeName?.includes('Resource') || path.includes('/resource')) {
    context += `页面类型：学习资源\n`
    
    const resourceTitle = document.querySelector('h1, .resource-title')?.textContent?.trim()
    if (resourceTitle) context += `资源标题：${resourceTitle}\n`
    
    const resourceDesc = document.querySelector('.resource-description, .description, .resource-content')?.textContent?.slice(0, 800)
    if (resourceDesc) context += `资源描述：${resourceDesc}\n`
    
    // 资源标签
    const tags = document.querySelectorAll('.tag, .resource-tag')
    if (tags.length > 0) {
      const tagList = Array.from(tags).map(t => t.textContent?.trim()).filter(Boolean).join('、')
      context += `标签：${tagList}\n`
    }
  }
  
  // 社区/讨论页面
  else if (path.includes('/community') || path.includes('/discussion')) {
    context += `页面类型：社区讨论\n`
    
    const discussionTitle = document.querySelector('h1, .discussion-title, .post-title')?.textContent?.trim()
    if (discussionTitle) context += `讨论标题：${discussionTitle}\n`
    
    const author = document.querySelector('.author, .post-author')?.textContent?.trim()
    if (author) context += `作者：${author}\n`
    
    const discussionContent = document.querySelector('.discussion-content, .post-content, .post-body')?.textContent?.slice(0, 1000)
    if (discussionContent) context += `讨论内容：${discussionContent}\n`
    
    // 评论/回复
    const replies = document.querySelectorAll('.reply, .comment')
    if (replies.length > 0) {
      context += `共有 ${replies.length} 条回复\n`
    }
  }
  
  // 首页或其他页面 - 尝试提取主要内容
  else {
    context += `页面类型：平台浏览\n`
    
    // 尝试获取页面主标题
    const mainTitle = document.querySelector('main h1, .main-content h1, h1')?.textContent?.trim()
    if (mainTitle) context += `页面标题：${mainTitle}\n`
    
    // 尝试获取主要内容区域的文本
    const mainContent = document.querySelector('main, .main-content, article')?.textContent?.slice(0, 1000)
    if (mainContent) context += `页面内容摘要：${mainContent}\n`
  }
  
  return context
}

// 构建系统提示词
const buildSystemPrompt = (): string => {
  const pageContext = getPageContext()
  
  return `你是一个专业的 Vue.js 学习助手，正在帮助用户学习 Vue 3 相关知识。

${pageContext}

请遵循以下原则：
1. 根据用户当前浏览的页面内容，提供针对性的帮助
2. 用通俗易懂的语言解释概念
3. 如果用户问的问题与当前页面相关，优先结合页面内容回答
4. 提供实用的代码示例和学习建议
5. 保持友好、鼓励的语气

请用中文回答。`
}

// 格式化消息（简单Markdown支持）
const formatMessage = (content: string): string => {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 切换聊天窗口
const toggleChat = () => {
  isOpen.value = !isOpen.value
  hasUnread.value = false
  
  if (isOpen.value) {
    // 首次打开时添加欢迎消息
    if (messages.value.length === 0) {
      messages.value.push({
        role: 'assistant',
        content: '你好！我是你的 AI 学习助手 🎓\n\n我可以根据你当前浏览的内容，帮你解答问题、解释概念、提供学习建议。有什么我可以帮你的吗？'
      })
    }
    
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
}

const togglePin = () => {
  isPinned.value = !isPinned.value
}

const handleClickOutside = (event: MouseEvent) => {
  if (!isOpen.value || isPinned.value || isDragging.value || isResizing.value) return

  const target = event.target as Node | null
  if (!target) return

  if (chatWindowRef.value?.contains(target)) return

  isOpen.value = false
}

// 发送消息
const sendMessage = async (text: string) => {
  const question = text.trim()
  if (!question || isLoading.value) return
  
  // 添加用户消息
  messages.value.push({ role: 'user', content: question })
  inputText.value = ''
  isLoading.value = true
  scrollToBottom()
  
  try {
    // 准备对话历史（最近6条）
    const chatHistory = messages.value.slice(-7, -1).map(m => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content
    }))
    
    // 添加系统提示作为第一条
    const systemMessage = { role: 'system' as const, content: buildSystemPrompt() }
    const historyWithSystem = [systemMessage, ...chatHistory]
    
    // 添加助手消息占位符
    const assistantIndex = messages.value.length
    messages.value.push({ role: 'assistant', content: '' })
    
    // 流式获取回答
    await streamTeachingChat(
      question,
      (chunk: string) => {
        messages.value[assistantIndex].content += chunk
        scrollToBottom()
      },
      historyWithSystem
    )
    
  } catch (error) {
    console.error('AI 回答失败:', error)
    messages.value[messages.value.length - 1].content = '抱歉，我暂时无法回答。请稍后再试。'
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

// 清空对话
const clearMessages = () => {
  messages.value = [{
    role: 'assistant',
    content: '对话已清空。有什么新问题想问我吗？'
  }]
}

watch(() => route.path, () => {
  // 路由变化时可以选择性地提示用户
})

// 外部打开弹窗
const openChat = () => {
  if (!isOpen.value) {
    toggleChat()
  }
}

onMounted(() => {
  window.addEventListener('open-ai-chat', openChat)
  document.addEventListener('mousedown', handleClickOutside)
})

// 组件卸载时清理事件监听
onUnmounted(() => {
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('open-ai-chat', openChat)
})
</script>

<style scoped>
.ai-chat-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 浮动气泡 */
.chat-bubble {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-color, #42b883), var(--accent-hover, #3aa876));
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(66, 184, 131, 0.4);
  transition: all 0.3s ease;
  position: relative;
}

.chat-bubble:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 28px rgba(66, 184, 131, 0.5);
}

.bubble-icon {
  font-size: 26px;
  z-index: 1;
}

.bubble-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--accent-color, #42b883);
  animation: pulse-ring 2s ease-out infinite;
  opacity: 0;
}

@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 0.4; }
  100% { transform: scale(1.5); opacity: 0; }
}

.chat-bubble.has-unread::after {
  content: '';
  position: absolute;
  top: 4px;
  right: 4px;
  width: 12px;
  height: 12px;
  background: #ff4757;
  border-radius: 50%;
  border: 2px solid white;
}

/* 聊天窗口 */
.chat-window {
  position: absolute;
  bottom: 70px;
  right: 0;
  background: var(--bg-primary, #fff);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-color, #e5e5e5);
}

/* 拖拽调整大小手柄 */
.resize-handle {
  position: absolute;
  z-index: 10;
}

.resize-handle-top {
  top: 0;
  left: 20px;
  right: 20px;
  height: 6px;
  cursor: ns-resize;
}

.resize-handle-left {
  left: 0;
  top: 20px;
  bottom: 20px;
  width: 6px;
  cursor: ew-resize;
}

.resize-handle-corner {
  top: 0;
  left: 0;
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
  border-radius: 16px 0 0 0;
}

.resize-handle-corner::before {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  width: 8px;
  height: 8px;
  border-left: 2px solid var(--text-tertiary, #999);
  border-top: 2px solid var(--text-tertiary, #999);
  opacity: 0.5;
  transition: opacity 0.2s;
}

.resize-handle-corner:hover::before {
  opacity: 1;
}

/* 聊天头部 */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, var(--accent-color, #42b883), var(--accent-hover, #3aa876));
  color: white;
  cursor: move;
  user-select: none;
}

.chat-header.is-dragging {
  cursor: grabbing;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  font-size: 28px;
}

.header-text h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.header-status {
  font-size: 12px;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  gap: 6px;
}

.header-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.header-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.header-btn.is-active {
  background: rgba(255, 255, 255, 0.38);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
}

/* 消息区域 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-messages::-webkit-scrollbar {
  width: 4px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--border-color, #ddd);
  border-radius: 2px;
}

.message {
  display: flex;
  gap: 10px;
  max-width: 90%;
}

.message.user {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.message.assistant {
  align-self: flex-start;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  background: var(--bg-secondary, #f5f5f5);
}

.message-avatar .user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.message-content {
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
}

.message.assistant .message-content {
  background: var(--bg-secondary, #f5f5f5);
  color: var(--text-primary, #333);
  border-bottom-left-radius: 4px;
}

.message.user .message-content {
  background: linear-gradient(135deg, var(--accent-color, #42b883), var(--accent-hover, #3aa876));
  color: white;
  border-bottom-right-radius: 4px;
}

.message-text code {
  background: rgba(0, 0, 0, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
}

.message-text pre {
  background: var(--bg-tertiary, #1e1e1e);
  color: #d4d4d4;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
}

.message-text pre code {
  background: none;
  padding: 0;
  color: inherit;
}

/* 打字指示器 */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: var(--text-tertiary, #999);
  border-radius: 50%;
  animation: typing-bounce 1.4s ease-in-out infinite;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}

/* 快捷问题 */
.quick-questions {
  padding: 8px 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  border-top: 1px solid var(--border-color, #eee);
}

.quick-btn {
  padding: 6px 12px;
  font-size: 12px;
  background: var(--bg-secondary, #f5f5f5);
  border: 1px solid var(--border-color, #e5e5e5);
  border-radius: 16px;
  color: var(--text-secondary, #666);
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover:not(:disabled) {
  background: var(--accent-color, #42b883);
  color: white;
  border-color: var(--accent-color, #42b883);
}

.quick-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 输入区域 */
.chat-input {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color, #eee);
  background: var(--bg-primary, #fff);
}

.chat-input textarea {
  flex: 1;
  resize: none;
  border: 1px solid var(--border-color, #e5e5e5);
  border-radius: 20px;
  padding: 10px 16px;
  font-size: 14px;
  line-height: 1.4;
  max-height: 100px;
  background: var(--bg-secondary, #f9f9f9);
  color: var(--text-primary, #333);
  outline: none;
  transition: border-color 0.2s;
}

.chat-input textarea:focus {
  border-color: var(--accent-color, #42b883);
}

.chat-input textarea::placeholder {
  color: var(--text-tertiary, #999);
}

.send-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-color, #42b883), var(--accent-hover, #3aa876));
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.4);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 动画 */
.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all 0.3s ease;
}

.chat-slide-enter-from,
.chat-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* 响应式 */
@media (max-width: 480px) {
  .ai-chat-widget {
    bottom: 16px;
    right: 16px;
  }
  
  .chat-window {
    width: calc(100vw - 32px);
    height: calc(100vh - 120px);
    bottom: 64px;
    right: -8px;
  }
  
  .chat-bubble {
    width: 50px;
    height: 50px;
  }
  
  .bubble-icon {
    font-size: 22px;
  }
}
</style>
