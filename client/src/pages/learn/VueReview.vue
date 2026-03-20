<template>
  <div class="vue-review">
    <!-- 问卷阶段 -->
    <div v-if="!showResult" class="questionnaire">
      <div class="questionnaire-header">
        <div class="icon">🎯</div>
        <h1>Vue 水平评估</h1>
        <p class="subtitle">回答几个问题，让我们了解你的 Vue 掌握情况</p>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <span class="progress-text">{{ currentStep + 1 }} / {{ questions.length }}</span>
      </div>

      <div class="question-card">
        <div class="question-number">问题 {{ currentStep + 1 }}</div>
        <h2 class="question-text">{{ currentQuestion.question }}</h2>
        
        <div class="options">
          <div 
            v-for="(option, index) in currentQuestion.options" 
            :key="index"
            class="option-item"
            :class="{ selected: answers[currentStep] === index }"
            @click="selectAnswer(index)"
          >
            <span class="option-letter">{{ ['A', 'B', 'C', 'D'][index] }}</span>
            <span class="option-text">{{ option.text }}</span>
          </div>
        </div>

        <div class="question-actions">
          <button 
            class="btn secondary" 
            @click="prevQuestion" 
            :disabled="currentStep === 0"
          >
            ← 上一题
          </button>
          <button 
            v-if="currentStep < questions.length - 1"
            class="btn primary" 
            @click="nextQuestion"
            :disabled="answers[currentStep] === undefined"
          >
            下一题 →
          </button>
          <button 
            v-else
            class="btn primary submit" 
            @click="submitAnswers"
            :disabled="answers[currentStep] === undefined"
          >
            🤖 获取 AI 建议
          </button>
        </div>
      </div>
    </div>

    <!-- AI 建议结果 -->
    <div v-else class="result-section">
      <div class="result-header">
        <div class="icon">🤖</div>
        <h1>AI 学习建议</h1>
        <p class="subtitle">基于你的回答，DeepSeek 为你生成了个性化建议</p>
      </div>

      <div class="result-card">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>AI 正在分析你的回答...</p>
        </div>

        <!-- AI 建议内容 -->
        <div v-else class="ai-response">
          <div class="response-content" v-html="formattedResponse"></div>
        </div>
      </div>

      <div class="result-actions">
        <button class="btn secondary" @click="restartQuiz">
          🔄 重新评估
        </button>
        <button class="btn primary" @click="goToLearn">
          📚 开始学习 →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { streamTeachingChat } from '@/services'

const router = useRouter()

// 问卷问题
const questions = [
  {
    question: '你对 Vue 的响应式系统了解多少？',
    options: [
      { text: '完全不了解，不知道什么是响应式', level: 0 },
      { text: '听说过 ref 和 reactive，但不太清楚区别', level: 1 },
      { text: '能使用 ref/reactive，了解基本原理', level: 2 },
      { text: '深入理解响应式原理，知道 Proxy 实现', level: 3 }
    ]
  },
  {
    question: '你使用过 Vue 的组合式 API (Composition API) 吗？',
    options: [
      { text: '没用过，只会选项式 API', level: 0 },
      { text: '用过 setup()，但不太熟练', level: 1 },
      { text: '熟练使用 setup、computed、watch 等', level: 2 },
      { text: '能封装自定义组合式函数 (Composables)', level: 3 }
    ]
  },
  {
    question: '你对 Vue 组件通信的掌握程度如何？',
    options: [
      { text: '不太清楚组件之间怎么传数据', level: 0 },
      { text: '会用 props 和 emit 进行父子通信', level: 1 },
      { text: '了解 provide/inject、事件总线等方式', level: 2 },
      { text: '熟悉各种通信方式，能根据场景选择最优方案', level: 3 }
    ]
  },
  {
    question: '你使用过 Vue Router 吗？',
    options: [
      { text: '没用过，不知道怎么配置路由', level: 0 },
      { text: '会基本的路由配置和页面跳转', level: 1 },
      { text: '了解动态路由、路由守卫、懒加载', level: 2 },
      { text: '熟练掌握，能设计复杂的路由架构', level: 3 }
    ]
  },
  {
    question: '你使用过状态管理工具（如 Pinia/Vuex）吗？',
    options: [
      { text: '没用过，组件数据都放在组件内', level: 0 },
      { text: '用过但不太熟，只会基本的 state 操作', level: 1 },
      { text: '能熟练使用 Pinia 管理全局状态', level: 2 },
      { text: '深入理解状态管理，能设计模块化 store', level: 3 }
    ]
  },
  {
    question: '你做过完整的 Vue 项目吗？',
    options: [
      { text: '没有，只跟着教程写过 demo', level: 0 },
      { text: '做过简单的单页应用，如 TodoList', level: 1 },
      { text: '独立完成过中等复杂度的项目', level: 2 },
      { text: '有丰富的项目经验，参与过企业级应用', level: 3 }
    ]
  }
]

const currentStep = ref(0)
const answers = ref<number[]>([])
const showResult = ref(false)
const isLoading = ref(false)
const aiResponse = ref('')

const currentQuestion = computed(() => questions[currentStep.value])
const progressPercent = computed(() => ((currentStep.value + 1) / questions.length) * 100)

// 格式化 AI 响应
const formattedResponse = computed(() => {
  return aiResponse.value
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/\n/g, '<br>')
})

const selectAnswer = (index: number) => {
  answers.value[currentStep.value] = index
}

const nextQuestion = () => {
  if (currentStep.value < questions.length - 1) {
    currentStep.value++
  }
}

const prevQuestion = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const submitAnswers = async () => {
  showResult.value = true
  isLoading.value = true
  aiResponse.value = ''

  // 构建问答摘要
  const summary = questions.map((q, i) => {
    const selectedOption = q.options[answers.value[i]]
    return `问题${i + 1}：${q.question}\n用户回答：${selectedOption?.text || '未回答'}`
  }).join('\n\n')

  // 计算总体水平
  const totalScore = answers.value.reduce((sum, answerIndex, qIndex) => {
    return sum + (questions[qIndex].options[answerIndex]?.level || 0)
  }, 0)
  const maxScore = questions.length * 3
  const levelPercent = Math.round((totalScore / maxScore) * 100)

  const prompt = `我是一个正在学习 Vue.js 的开发者，刚刚完成了一个 Vue 水平评估问卷。请根据我的回答，给我提供专业、具体的学习建议。

## 我的问卷回答：

${summary}

## 评估得分：${totalScore}/${maxScore}（${levelPercent}%）

请你作为一位资深的 Vue.js 专家，根据我的回答：

1. **水平判断**：简要分析我目前的 Vue 掌握水平（初级/中级/高级）
2. **优势分析**：指出我已经掌握得比较好的方面
3. **薄弱环节**：明确指出我需要重点加强的知识点
4. **学习路径**：为我制定一个具体的学习计划，包括：
   - 需要学习的核心概念（按优先级排序）
   - 推荐的学习资源或方法
   - 建议的实践项目
5. **鼓励寄语**：给我一些学习上的鼓励和建议

请用友好、专业的语气回答，使用 Markdown 格式，让内容清晰易读。`

  try {
    await streamTeachingChat(
      prompt,
      (chunk: string) => {
        // 第一个 chunk 到达时隐藏加载动画
        if (isLoading.value) {
          isLoading.value = false
        }
        aiResponse.value += chunk
      },
      []
    )
  } catch (error) {
    console.error('AI 分析失败:', error)
    aiResponse.value = '抱歉，AI 分析暂时不可用。请稍后再试，或直接开始学习。'
    isLoading.value = false
  }
}

const restartQuiz = () => {
  currentStep.value = 0
  answers.value = []
  showResult.value = false
  aiResponse.value = ''
}

const goToLearn = () => {
  router.push('/home')
}
</script>

<style scoped>
.vue-review {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: radial-gradient(800px 400px at 50% 30%, rgba(65, 184, 131, 0.08), transparent 60%);
}

/* 问卷样式 */
.questionnaire {
  width: 100%;
  max-width: 700px;
}

.questionnaire-header {
  text-align: center;
  margin-bottom: 32px;
}

.icon {
  font-size: 56px;
  margin-bottom: 16px;
}

h1 {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #41b883, #35a070);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: var(--text-secondary);
}

.question-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
}

.question-number {
  font-size: 14px;
  color: #41b883;
  font-weight: 600;
  margin-bottom: 12px;
}

.question-text {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 28px;
  line-height: 1.4;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  background: var(--bg-tertiary);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-item:hover {
  border-color: rgba(65, 184, 131, 0.3);
  background: rgba(65, 184, 131, 0.05);
}

.option-item.selected {
  border-color: #41b883;
  background: rgba(65, 184, 131, 0.1);
}

.option-letter {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 8px;
  font-weight: 700;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.option-item.selected .option-letter {
  background: #41b883;
  color: white;
}

.option-text {
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.5;
}

.question-actions {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.btn {
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn.secondary {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.btn.secondary:hover:not(:disabled) {
  border-color: #41b883;
  color: #41b883;
}

.btn.primary {
  background: linear-gradient(135deg, #41b883, #35a070);
  color: white;
  box-shadow: 0 4px 15px rgba(65, 184, 131, 0.3);
}

.btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(65, 184, 131, 0.4);
}

.btn.submit {
  flex: 1;
}

/* 结果页样式 */
.result-section {
  width: 100%;
  max-width: 800px;
}

.result-header {
  text-align: center;
  margin-bottom: 32px;
}

.result-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  min-height: 300px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-color);
  border-top-color: #41b883;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: var(--text-secondary);
  font-size: 16px;
}

.ai-response {
  line-height: 1.8;
}

.response-content {
  color: var(--text-primary);
  font-size: 15px;
}

.response-content h1,
.response-content h2,
.response-content h3 {
  color: var(--text-primary);
  margin: 24px 0 12px;
}

.response-content h1 { font-size: 24px; }
.response-content h2 { font-size: 20px; }
.response-content h3 { font-size: 17px; }

.response-content strong {
  color: #41b883;
}

.response-content code {
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
}

.response-content pre {
  background: var(--bg-tertiary);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
}

.response-content li {
  margin-left: 20px;
  margin-bottom: 8px;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

@media (max-width: 640px) {
  .question-card {
    padding: 24px;
  }
  
  .question-text {
    font-size: 18px;
  }
  
  .option-item {
    padding: 14px 16px;
  }
  
  .question-actions {
    flex-direction: column;
  }
  
  .result-card {
    padding: 24px;
  }
  
  .result-actions {
    flex-direction: column;
  }
}
</style>
