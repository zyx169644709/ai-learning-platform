<template>
  <div class="teaching-assistant">
    <!-- 左侧聊天容器（与 TeachingAssistant.vue 一致的结构） -->
    <div class="chat-container">
      <div class="chat-header">
        <h3>🧠 MBTI 性格分析助手</h3>
        <p>输入你的问题或场景，我将结合 MBTI 提供分析与建议</p>
      </div>

      <div class="chat-messages" ref="chatHistory">
        <div v-for="(msg, index) in chatMessages" :key="index"
          :class="['message', msg.role === 'user' ? 'user' : 'assistant']">
          <div class="message-avatar">
            <template v-if="msg.role === 'user'">
              <img v-if="userAvatar" :src="userAvatar" alt="用户头像" class="user-avatar-img" />
              <span v-else>{{ getUserInitial() }}</span>
            </template>
            <template v-else>
              <img :src="aiAvatar" alt="助手头像" class="ai-avatar-img" />
            </template>
          </div>
          <div class="message-content">
            <div class="message-text">{{ msg.content }}</div>
            <div v-if="!isLoading && msg.suggestedQuestions && msg.suggestedQuestions.length > 0" class="suggested-questions"
              style="margin-top: 12px;">
              <div class="suggested-questions-title">相关问题：</div>
              <div class="suggested-questions-list">
                <button v-for="question in msg.suggestedQuestions" :key="question" @click="askQuestion(question)"
                  class="suggested-question-btn" :disabled="isLoading">
                  {{ question }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="message assistant">
          <div class="message-avatar">
            <img :src="aiAvatar" alt="助手头像" class="ai-avatar-img" />
          </div>
          <div class="message-content">
            <div class="typing-indicator"><span></span><span></span><span></span></div>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <div class="input-area">
          <textarea v-model="currentQuestion" placeholder="请输入想要咨询的问题..."
            @keyup.enter.exact.prevent="handleSendMessage" :disabled="isLoading" class="question-input"></textarea>
          <button v-if="!isLoading" @click="handleSendMessage" :disabled="!currentQuestion.trim()"
            class="send-btn">发送</button>
          <button v-else @click="cancelRequest" class="send-btn">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { sendMessageToMBTI } from '@/services'
import defaultAvatar from '@/assets/images/MBTI.png'

const userStore = useUserStore()

const aiAvatar = defaultAvatar
const userAvatar = computed(() => userStore.avatar || defaultAvatar)

// 响应式数据
const currentQuestion = ref('')
const chatMessages = ref([])
const isLoading = ref(false)
const chatHistory = ref(null)
const abortController = ref(null)

// 分离主要内容和相关问题的函数
const separateContentAndQuestions = (content) => {
  // 首先尝试基于"建议"部分分离
  const suggestionIndex = content.lastIndexOf('建议:')
  if (suggestionIndex !== -1) {
    // 找到建议部分的结束位置
    const afterSuggestion = content.substring(suggestionIndex)
    const suggestionEndIndex = afterSuggestion.indexOf('。')

    if (suggestionEndIndex !== -1) {
      // 分离主要内容和后续内容
      const mainContent = content.substring(0, suggestionIndex + suggestionEndIndex + 1).trim()
      const remainingContent = content.substring(suggestionIndex + suggestionEndIndex + 1).trim()

      // 从剩余内容中提取问题
      const questions = extractQuestionsFromText(remainingContent)
      return { mainContent, suggestedQuestions: questions }
    }
  }

  // 如果没有"建议"部分，尝试其他方法分离
  // 寻找可能的分离点（通常是主要内容结束的位置）
  const lines = content.split('\n')
  const mainLines = []
  const questionLines = []
  let foundQuestions = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // 检查是否是问题行（包含问号且没有主要内容特征）
    if (line.includes('？') && !hasMainContentFeatures(line)) {
      foundQuestions = true
      questionLines.push(line)
    } else if (foundQuestions) {
      // 如果已经找到问题，继续收集后续的问题行
      if (line.includes('？') && !hasMainContentFeatures(line)) {
        questionLines.push(line)
      } else if (line.length > 0) {
        // 如果遇到非问题行，停止收集
        break
      }
    } else {
      mainLines.push(lines[i])
    }
  }

  // 如果没有找到问题行，尝试在整个内容中查找问题
  if (questionLines.length === 0) {
    // 查找连续的问题模式
    const questionPattern = /([^？]*？[^？]*？[^？]*？)/g
    const matches = content.match(questionPattern)

    if (matches && matches.length > 0) {
      // 找到问题部分的位置
      const questionText = matches[0]
      const questionIndex = content.indexOf(questionText)

      // 确保问题部分不是主要内容（长度检查）
      if (questionIndex !== -1 && questionText.length < content.length * 0.7) {
        const mainContent = content.substring(0, questionIndex).trim()
        const questions = extractQuestionsFromText(questionText)

        // 确保主要内容不为空且问题数量合理
        if (mainContent.length > 0 && questions.length > 0 && questions.length <= 5) {
          console.log('找到问题模式:', questionText)
          console.log('提取的问题:', questions)
          return { mainContent, suggestedQuestions: questions }
        }
      }
    }

    // 如果上面的方法失败，尝试更简单的方法：查找最后几个问号
    const questionMarks = []
    for (let i = 0; i < content.length; i++) {
      if (content[i] === '？' || content[i] === '?') {
        questionMarks.push(i)
      }
    }

    // 如果找到3个或更多问号，尝试提取最后几个问题
    if (questionMarks.length >= 3) {
      const lastThreeQuestions = questionMarks.slice(-3)
      let questionStart = 0

      // 从最后一个问题向前查找，找到问题的开始位置
      for (let i = lastThreeQuestions[0] - 1; i >= 0; i--) {
        if (content[i] === '。' || content[i] === '！' || content[i] === '等') {
          questionStart = i + 1
          break
        }
      }

      const questionText = content.substring(questionStart).trim()
      const mainContent = content.substring(0, questionStart).trim()

      if (questionText.length > 0 && mainContent.length > 0) {
        const questions = extractQuestionsFromText(questionText)
        if (questions.length > 0) {
          console.log('通过问号位置找到问题:', questionText)
          console.log('提取的问题:', questions)
          return { mainContent, suggestedQuestions: questions }
        }
      }
    }
  }

  if (questionLines.length > 0) {
    const mainContent = mainLines.join('\n').trim()
    const questions = extractQuestionsFromText(questionLines.join(' '))
    return { mainContent, suggestedQuestions: questions }
  }

  return { mainContent: content, suggestedQuestions: [] }
}

// 检查是否包含主要内容特征
const hasMainContentFeatures = (text) => {
  return text.includes('：') ||
    text.includes('●') ||
    text.includes('■') ||
    text.includes('抽取的塔罗牌') ||
    text.includes('单张牌含义解读') ||
    text.includes('综合占卜结论') ||
    text.includes('建议') ||
    text.includes('专业且资深') ||
    text.includes('能为你进行') ||
    text.includes('精准解读') ||
    text.includes('你若有') ||
    text.includes('可告诉我') ||
    text.includes('比如感情方面') ||
    text.includes('事业方面') ||
    text.includes('学业方面') ||
    text.includes('占卜师的专业度') ||
    text.includes('求问者的专注度') ||
    text.includes('塔罗牌呈现的') ||
    text.includes('未来会因个人选择')
}

// 从文本中提取问题
const extractQuestionsFromText = (text) => {
  if (!text) return []

  const questions = []

  // 首先尝试按问号分割
  const questionParts = text.split(/[？?]/)

  for (let i = 0; i < questionParts.length - 1; i++) {
    let question = questionParts[i].trim()

    // 清理问题文本
    question = question.replace(/^[。，,、\s]+/, '') // 移除开头的标点符号
    question = question.replace(/[。，,、\s]+$/, '') // 移除结尾的标点符号

    // 更宽松的问题验证
    if (question.length > 0 && question.length < 150 && isValidQuestion(question)) {
      questions.push(question + '？')
    }
  }

  // 如果按问号分割没有找到问题，尝试其他方法
  if (questions.length === 0) {
    // 查找所有问号的位置
    const questionMarks = []
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '？' || text[i] === '?') {
        questionMarks.push(i)
      }
    }

    // 从每个问号向前查找问题的开始
    for (let i = 0; i < questionMarks.length; i++) {
      const endPos = questionMarks[i]
      let startPos = endPos - 1

      // 向前查找问题的开始位置
      while (startPos >= 0 && text[startPos] !== '。' && text[startPos] !== '！' && text[startPos] !== '？' && text[startPos] !== '等') {
        startPos--
      }
      startPos++ // 调整到问题开始位置

      const question = text.substring(startPos, endPos + 1).trim()
      if (question.length > 0 && question.length < 150 && isValidQuestion(question)) {
        questions.push(question)
      }
    }
  }

  return questions
}

// 验证是否是有效的问题
const isValidQuestion = (text) => {
  // 排除包含主要内容特征的文本
  if (hasMainContentFeatures(text)) {
    return false
  }

  // 排除过长的文本（可能是主要内容）
  if (text.length > 150) {
    return false
  }

  // 排除包含太多标点符号的文本
  const punctuationCount = (text.match(/[。，,、！!]/g) || []).length
  if (punctuationCount > 4) {
    return false
  }

  // 确保问题包含问号
  if (!text.includes('？') && !text.includes('?')) {
    return false
  }

  // 确保问题不是太短（避免误判）
  if (text.length < 5) {
    return false
  }

  return true
}

// 基于内容关键词生成 MBTI 建议问题（作为兜底）
const generateSuggestions = (content) => {
  const suggestions = []
  const add = (s) => { if (!suggestions.includes(s)) suggestions.push(s) }
  if (/沟通|合作|表达|交流/.test(content)) {
    add('不同类型之间的沟通有什么建议？')
    add('如何与上司/同事建立更顺畅的合作？')
  }
  if (/职业|工作|求职|管理|领导/.test(content)) {
    add('我的类型更适合哪些职业方向？')
    add('不同类型的优势和常见盲点分别是什么？')
  }
  if (/恋爱|婚姻|亲密|关系/.test(content)) {
    add('在亲密关系中不同类型的相处建议是什么？')
  }
  if (/学习|效率|计划/.test(content)) {
    add('不同类型的学习/成长路径有什么差异？')
  }
  add('MBTI 性格分析的准确性有多高？')
  add('有哪些方法可以提升性格分析的准确性？')
  add('为我推荐一下相关的心理学书籍')
  return suggestions.slice(0, 5)
}

// 处理快速问题点击
const askQuestion = (question) => {
  if (isLoading.value) return
  currentQuestion.value = question
  handleSendMessage()
}

// 获取用户名首字母
const getUserInitial = () => {
  if (userStore.userInfo?.nickname) {
    return userStore.userInfo.nickname.charAt(0).toUpperCase()
  } else if (userStore.userInfo?.username) {
    return userStore.userInfo.username.charAt(0).toUpperCase()
  }
  return 'U'
}

// 选择建议问题
const selectSuggestion = (suggestion) => {
  if (isLoading.value) return
  currentQuestion.value = suggestion
  handleSendMessage()
}

// 初始化欢迎消息
onMounted(() => {
  chatMessages.value.push({
    role: 'ai',
    content: '🌟 欢迎来到MBTI性格分析助手！我是你的MBTI性格分析助手，准备好为你揭示性格的奥秘。请告诉我你想要分析的问题吧～\n\n试试从下面的问题开始吧：',
    timestamp: new Date(),
    suggestedQuestions: [
      'MBTI性格分析的准确性有多高？',
      '有哪些方法可以提升性格分析的准确性？',
      '为我推荐一下相关的心理学书籍'
    ]
  })
})

const handleSendMessage = async () => {
  const question = currentQuestion.value.trim()
  if (!question || isLoading.value) return

  // 先上锁，避免双触发竞态
  isLoading.value = true

  // 再推送用户消息
  chatMessages.value.push({
    role: 'user',
    content: question,
    timestamp: new Date()
  })

  currentQuestion.value = ''
  abortController.value = new AbortController()
  await nextTick()
  scrollToBottom()

  try {
    let fullResponse = ''
    const responseIndex = chatMessages.value.length
    chatMessages.value.push({ role: 'ai', content: '', timestamp: new Date() })
    await sendMessageToMBTI(
      question,
      (chunk) => {
        // 更稳健的去重/覆盖逻辑
        const normalize = (s) => (s || '').replace(/\s+/g, '')
        // 如果chunk以现有内容为前缀（忽略空白），视为完整替换
        if (fullResponse && normalize(chunk).startsWith(normalize(fullResponse))) {
          fullResponse = chunk
        }
        // 如果现有内容以=结尾且新chunk包含换行符，说明是最终格式化消息
        else if (fullResponse.endsWith('=') && chunk.includes('\n')) {
          fullResponse = chunk
        }
        // 如果chunk比现有内容长很多，说明是完整替换
        else if (chunk.length > fullResponse.length * 2) {
          fullResponse = chunk
        }
        // 否则正常累积
        else if (fullResponse.slice(-chunk.length) !== chunk) {
          fullResponse += chunk
        }

        // 清理所有前导和尾随空白，并统一缩进
        let cleanedResponse = fullResponse.trim().replace(/^\s+/gm, '')
        // 若出现“前半段 + 完整内容”的重复，保留后者（增加安全阈值，避免误切）
        const head = cleanedResponse.slice(0, 200)
        const dupAt = cleanedResponse.indexOf(head, 200)
        if (dupAt !== -1) {
          const prefixLen = dupAt
          const totalLen = cleanedResponse.length
          // 仅当前缀段明显很长（> 600）且重复点在文本前 60% 内，才判定为“前半段 + 完整内容”的模式
          if (prefixLen > 600 && dupAt < totalLen * 0.6) {
            cleanedResponse = cleanedResponse.slice(dupAt)
          }
        }

        // 直接处理完整内容，分离主要内容和相关问题
        const { mainContent, suggestedQuestions } = separateContentAndQuestions(cleanedResponse)
        // 若分离后正文为空（例如AI只返回了问题串），则回退展示原始正文
        const contentToShow = mainContent && mainContent.trim().length > 0
          ? mainContent
          : cleanedResponse

        // 若未成功提取问题，使用兜底建议
        let finalSuggestions = suggestedQuestions.length > 0
          ? suggestedQuestions
          : generateSuggestions(mainContent)
        // 限制最多 3 条
        finalSuggestions = finalSuggestions.slice(0, 3)

        chatMessages.value[responseIndex].content = contentToShow
        chatMessages.value[responseIndex].suggestedQuestions = finalSuggestions

        scrollToBottom()
      },
      abortController.value.signal
    )
    if (!fullResponse.trim()) throw new Error('未获得有效回复')
  } catch (error) {
    const lastAiMsg = chatMessages.value[chatMessages.value.length - 1]
    if (lastAiMsg?.role === 'ai') lastAiMsg.content = '占卜失败，请稍后重试'
  } finally {
    isLoading.value = false
    abortController.value = null
    scrollToBottom()
  }
}

// 取消请求
const cancelRequest = () => {
  if (abortController.value) {
    abortController.value.abort()
    isLoading.value = false
    chatMessages.value.push({
      role: 'ai',
      content: '🔮 已取消本次占卜，您可以提出新的问题',
      timestamp: new Date()
    })
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatHistory.value) {
      chatHistory.value.scrollTop = chatHistory.value.scrollHeight
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
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 500;
  color: var(--text-primary);
}

.chat-header p {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
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

.user-avatar-img,
.ai-avatar-img {
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

.message-text {
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
  line-height: 1.6;
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
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {

  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.suggested-questions {
  border-top: 1px solid var(--border-color);
  padding-top: 12px;
}

.suggested-questions-title {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-weight: 500;
}

.suggested-questions-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.suggested-question-btn {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 12px;
  color: var(--text-primary);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1.4;
}

.suggested-question-btn:hover:not(:disabled) {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.suggested-question-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.chat-input {
  padding: 16px;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
}

.input-area {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.question-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.5;
  transition: border-color 0.2s ease;
}

.question-input:focus {
  outline: none;
  border-color: var(--accent-color);
}

.question-input::placeholder {
  color: var(--text-tertiary);
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
  opacity: 0.5;
  cursor: not-allowed;
}

</style>
