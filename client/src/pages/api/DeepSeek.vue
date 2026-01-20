<template>
  <div class="teaching-assistant">
    <div class="chat-container">
      <div class="chat-header">
        <h3>💚 Vue 专家助教</h3>
        <p>我是您的 Vue 学习助手，随时为您解答 Vue 3 开发中的各类疑问</p>
      </div>

      <div class="chat-messages" ref="chatMessages">
        <div v-for="(message, index) in messages" :key="index" 
             :class="['message', message.role]">
          <div class="message-avatar">
            <img v-if="message.role === 'user'" :src="userAvatar" alt="用户头像" class="user-avatar-img" />
            <span v-else>🤖</span>
          </div>
          <div class="message-content">
            <div class="message-text" v-html="formatMessage(message.content)"></div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
        
        <div v-if="isLoading" class="message assistant">
          <div class="message-avatar">🤖</div>
          <div class="message-content">
            <div class="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <div class="quick-questions">
          <button v-for="question in quickQuestions" :key="question"
                  @click="askQuestion(question)" 
                  class="quick-btn"
                  :disabled="isLoading">
            {{ question }}
          </button>
        </div>
        
        <div class="input-area">
          <textarea v-model="currentQuestion" 
                   placeholder="请输入您的问题..."
                   @keydown.enter.prevent="handleSendMessage"
                   :disabled="isLoading"
                   class="question-input"></textarea>
          <button @click="handleSendMessage" 
                  :disabled="!currentQuestion.trim() || isLoading"
                  class="send-btn">
            {{ isLoading ? '思考中...' : '发送' }}
          </button>
        </div>
      </div>
    </div>


    <!-- 代码分析弹窗 -->
    <div v-if="showCodeAnalyzer" class="modal-overlay" @click="showCodeAnalyzer = false">
      <div class="modal-content" @click.stop>
        <h3>Vue 代码诊断助手</h3>
        <select v-model="codeLanguage" class="language-select">
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="vue">Vue SFC</option>
        </select>
        
        <textarea v-model="codeToAnalyze" 
                 placeholder="请输入您的代码..."
                 class="code-textarea"></textarea>
        
        <div class="analysis-buttons">
          <button @click="analyzeCode('explain')" :disabled="codeAnalyzing">
            {{ codeAnalyzing ? '分析中...' : '解释代码' }}
          </button>
          <button @click="analyzeCode('optimize')" :disabled="codeAnalyzing">
            {{ codeAnalyzing ? '分析中...' : '优化建议' }}
          </button>
          <button @click="analyzeCode('debug')" :disabled="codeAnalyzing">
            {{ codeAnalyzing ? '分析中...' : '错误检查' }}
          </button>
        </div>
        
        <button @click="showCodeAnalyzer = false" class="close-btn">关闭</button>
      </div>
    </div>

    <!-- 学习规划弹窗 -->
    <div v-if="showLearningPlanner" class="modal-overlay" @click="showLearningPlanner = false">
      <div class="modal-content" @click.stop>
        <h3>学习计划生成器</h3>
        
        <div class="form-group">
          <label>学习主题：</label>
          <input v-model="learningTopic" placeholder="例如：Vue 3 组合式 API" />
        </div>
        
        <div class="form-group">
          <label>学习水平：</label>
          <select v-model="learningLevel">
            <option value="beginner">初学者</option>
            <option value="intermediate">中级</option>
            <option value="advanced">高级</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>学习时长（周）：</label>
          <input v-model.number="learningDuration" type="number" min="1" max="24" />
        </div>
        
        <div class="plan-buttons">
          <button @click="generatePlan" :disabled="planGenerating || !learningTopic">
            {{ planGenerating ? '生成中...' : '生成学习计划' }}
          </button>
          <button @click="showLearningPlanner = false" class="close-btn">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, computed } from 'vue'
import { streamTeachingChat, analyzeCodeWithDeepSeek, generateLearningPlan } from '@/services'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
// 响应式数据
const messages = ref([])
const currentQuestion = ref('')
const isLoading = ref(false)
const chatMessages = ref(null)

// 计算用户头像
const userAvatar = computed(() => {
  return userStore.avatar || '/src/assets/images/default.png'
})

// 代码分析相关
const showCodeAnalyzer = ref(false)
const codeToAnalyze = ref('')
const codeLanguage = ref('javascript')
const codeAnalyzing = ref(false)

// 学习规划相关
const showLearningPlanner = ref(false)
const learningTopic = ref('')
const learningLevel = ref('beginner')
const learningDuration = ref(4)
const planGenerating = ref(false)

// 快速问题
const quickQuestions = [
  '什么是 Composition API？',
  'ref 和 reactive 有什么区别？',
  'Vue 3 生命周期钩子有哪些变化？',
  '如何在 Vue 3 中使用 Pinia？',
  '推荐一些 Vue 3 学习资源'
]

// 初始化欢迎消息
onMounted(() => {
  messages.value.push({
    role: 'assistant',
    content: '你好！我是你的 Vue 专家助教，关于 Vue 3、Vite、Pinia 或 Vue Router 的任何问题，我都能帮你解答！',
    timestamp: new Date()
  })
})

// 发送消息
const handleSendMessage = async () => {
  if (!currentQuestion.value.trim() || isLoading.value) return
  
  const question = currentQuestion.value.trim()
  askQuestion(question)
}

// 提问
const askQuestion = async (question) => {
  if (isLoading.value) return
  
  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: question,
    timestamp: new Date()
  })
  
  currentQuestion.value = ''
  isLoading.value = true
  
  await nextTick()
  scrollToBottom()
  
  try {
    let fullResponse = ''
    const responseIndex = messages.value.length
    
    // 添加助手消息占位符
    messages.value.push({
      role: 'assistant',
      content: '',
      timestamp: new Date()
    })
    
    // 获取对话历史（最近5轮对话）
    const chatHistory = messages.value
      .slice(-11, -1) // 排除刚添加的占位符
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    
    await streamTeachingChat(
      question,
      (chunk) => {
        fullResponse += chunk
        messages.value[responseIndex].content = fullResponse
        scrollToBottom()
      },
      chatHistory
    )
    
  } catch (error) {
    messages.value[messages.value.length - 1].content = '抱歉，我现在无法回答您的问题。请稍后再试。'
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}


// 格式化消息（支持Markdown）
const formatMessage = (content) => {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

// 格式化时间
const formatTime = (timestamp) => {
  return timestamp.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessages.value) {
      chatMessages.value.scrollTop = chatMessages.value.scrollHeight
    }
  })
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

.chat-header h3 {
  margin: 0 0 5px 0;
}

.chat-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
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

.message-text {
  line-height: 1.5;
}

.message-time {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 5px;
}

.message.user .message-time {
  color: rgba(255,255,255,0.8);
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
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
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
  border-radius: 15px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
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
  color: var(--text-primary);
}

.send-btn {
  padding: 10px 20px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}



.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-primary);
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.modal-content h3 {
  margin: 0 0 15px 0;
}

.language-select, .code-textarea {
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.code-textarea {
  min-height: 150px;
  font-family: 'Courier New', monospace;
}

.analysis-buttons, .plan-buttons {
  display: flex;
  gap: 10px;
  margin: 15px 0;
}

.analysis-buttons button, .plan-buttons button {
  padding: 8px 15px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.close-btn {
  background: var(--bg-tertiary) !important;
  color: var(--text-primary) !important;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>