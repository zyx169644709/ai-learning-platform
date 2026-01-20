<template>
  <div class="teaching-assistant">
    <div class="chat-container">
      <div class="chat-header">
        <h3>🛰️ Vue 学习助手 (Kimi)</h3>
        <p>与智能助手 Kimi 对话，获取 Vue 3 开发建议、代码审查与技术指导</p>
      </div>
      <div class="chat-messages" ref="chatRef">
        <div v-for="(m, i) in messages" :key="i" :class="['message', m.role]">
          <div class="message-avatar">
            <img v-if="m.role === 'user'" :src="userAvatar" alt="用户头像" class="user-avatar-img" />
            <span v-else>🛰️</span>
          </div>
          <div class="message-content">
            <div class="message-text" v-html="formatMessage(m.content)"></div>
          </div>
        </div>

        <div v-if="isLoading" class="message assistant">
          <div class="message-avatar">🛰️</div>
          <div class="message-content">
            <div class="typing-indicator"><span></span><span></span><span></span></div>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <div class="quick-questions">
          <button v-for="question in quickQuestions" :key="question"
                  @click="askQuickQuestion(question)" 
                  class="quick-btn"
                  :disabled="isLoading">
            {{ question }}
          </button>
        </div>
        
        <div class="input-area">
          <textarea v-model="currentQuestion" placeholder="请输入您的问题..." @keydown.enter.prevent="handleSend"
            :disabled="isLoading" class="question-input" />
          <button class="send-btn" @click="handleSend" :disabled="!currentQuestion.trim() || isLoading">
            {{ isLoading ? '思考中...' : '发送' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, onMounted } from 'vue'
import { streamKimi, type ChatMessage } from '@/services/ai/kimiService'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const messages = ref<ChatMessage[]>([])
const currentQuestion = ref('')
const isLoading = ref(false)
const chatRef = ref<HTMLElement | null>(null)

// 计算用户头像
const userAvatar = computed(() => {
  return userStore.avatar || '/src/assets/images/default.png'
})

// 快速问题案例
const quickQuestions = [
  '如何优化 Vue 3 组件性能？',
  'Vue 3 中如何处理跨组件通信？',
  '解释一下 Vue 3 的依赖注入 (Provide/Inject)',
  'Vite 相比 Webpack 的优势是什么？',
  '推荐一些 Vue 3 的 UI 组件库'
]

// 初始化欢迎消息
onMounted(() => {
  messages.value.push({
    role: 'assistant',
    content: '你好！我是基于 Kimi 的 Vue 学习助手 🛰️\n\n我可以帮助你：\n• 解答 Vue 3、Vite、Pinia 等技术疑问\n• 优化你的 Vue 代码逻辑\n• 分析复杂的组件通信方案\n• 提供前端工程化最佳实践建议\n\n有什么 Vue 相关的问题，尽管问我吧！'
  })
})

const scrollToBottom = () => {
  nextTick(() => {
    if (chatRef.value) chatRef.value.scrollTop = chatRef.value.scrollHeight
  })
}

// 快速问题点击处理
const askQuickQuestion = (question: string) => {
  if (isLoading.value) return
  currentQuestion.value = question
  handleSend()
}

// 格式化消息（支持智能换行和Markdown）
const formatMessage = (content: string) => {
  if (!content) return ''
  
  return content
    // 处理数字列表 (1. 2. 3.)
    .replace(/(\d+\.\s)/g, '<br>$1')
    // 处理项目符号
    .replace(/(\*\s)/g, '<br>$1')
    // 处理粗体文本
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // 处理斜体文本
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 处理代码块
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // 处理行内代码
    .replace(/`(.*?)`/g, '<code>$1</code>')
    // 处理换行符
    .replace(/\n/g, '<br>')
    // 清理多余的空格和换行
    .replace(/<br><br><br>/g, '<br><br>')
    // 移除开头的多余换行
    .replace(/^<br>+/, '')
}

const handleSend = async () => {
  const q = currentQuestion.value.trim()
  if (!q || isLoading.value) return

  messages.value.push({ role: 'user', content: q })
  currentQuestion.value = ''
  isLoading.value = true
  await nextTick(); scrollToBottom()

  const responseIndex = messages.value.length
  messages.value.push({ role: 'assistant', content: '' })

  try {
    // 最近 10 条作为上下文（排除占位符）
    const history = messages.value.slice(-11, -1).map(m => ({ role: m.role, content: m.content }))
    let full = ''
    await streamKimi(q, (chunk) => {
      full += chunk
      messages.value[responseIndex].content = full
      scrollToBottom()
    }, history as ChatMessage[])
  } catch (e: any) {
    const errorMessage = e?.message || e
    if (errorMessage.includes('非会员一分钟最多使用三次')) {
      messages.value[responseIndex].content = `⚠️ ${errorMessage}`
    } else {
      messages.value[responseIndex].content = '抱歉，Kimi 暂时不可用：' + errorMessage
    }
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}
</script>

<style scoped>
.teaching-assistant {
  display: flex;
  gap: 20px;
  width: 75vw;
  height: 95%;
  margin: 20px 0 0 5px;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-primary);
  height: calc(100vh - 110px);
}

.chat-header {
  padding: 16px 20px;
  background: var(--bg-primary);
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
}

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: var(--bg-secondary);
}

.message {
  display: flex;
  margin-bottom: 15px;
  align-items: flex-start;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  margin: 0 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.message.user .message-avatar {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.message-text strong {
  font-weight: bold;
  color: var(--text-primary);
}

.message-text em {
  font-style: italic;
  color: var(--text-secondary);
}

.message-text code {
  background: var(--bg-tertiary);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  color: var(--accent-color);
}

.message-text pre {
  background: var(--bg-tertiary);
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
  margin: 10px 0;
}

.message-text pre code {
  background: none;
  padding: 0;
  color: var(--text-primary);
}

.message-content {
  max-width: 70%;
  background: var(--bg-primary);
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.message.user .message-content {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.typing-indicator {
  display: flex;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-tertiary);
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: .2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: .4s;
}

@keyframes typing {

  0%,
  80%,
  100% {
    transform: scale(.8);
    opacity: .5
  }

  40% {
    transform: scale(1);
    opacity: 1
  }
}

.chat-input {
  padding: 15px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

.quick-questions {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.quick-btn {
  padding: 5px 10px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: var(--text-primary);
}

.quick-btn:hover:not(:disabled) {
  background: var(--bg-primary);
}

.quick-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-area {
  display: flex;
  gap: 10px;
}

.question-input {
  flex: 1;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  resize: none;
  min-height: 40px;
  max-height: 100px;
  background: var(--bg-primary);
  color: var(--text-primary)
}

.send-btn {
  padding: 10px 20px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color .2s
}

.send-btn:hover:not(:disabled) {
  background: var(--accent-hover)
}

.send-btn:disabled {
  opacity: .6;
  cursor: not-allowed
}
</style>
