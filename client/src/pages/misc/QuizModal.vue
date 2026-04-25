<template>
  <div v-if="visible" class="quiz-modal-overlay" @click.self="closeModal">
    <div class="quiz-modal">
      <div class="quiz-header">
        <h2>{{ quizData.courseName }} - 小测试</h2>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>

      <div v-if="!showResult && currentQuestion" class="quiz-content">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <div class="question-info">
          <span>第 {{ currentQuestionIndex + 1 }} / {{ selectedQuestions.length }} 题</span>
        </div>

        <div class="question-card">
          <div class="question-meta">
            <span class="question-type-tag">{{ getQuestionTypeLabel(currentQuestion) }}</span>
          </div>
          <h3 class="question-text">{{ currentQuestion.content || currentQuestion.question }}</h3>
          <div class="options-list">
            <div
              v-for="(option, index) in currentQuestion.options"
              :key="index"
              class="option-item"
              :class="{
                'selected': isOptionSelected(index),
                'correct': answered && isOptionCorrect(index),
                'wrong': answered && isOptionWrong(index)
              }"
              @click="selectAnswer(index)"
            >
              <span class="option-label">{{ getOptionLabel(currentQuestion, index) }}</span>
              <span class="option-text">{{ option }}</span>
              <span v-if="answered && isOptionCorrect(index)" class="check-icon">✓</span>
              <span v-if="answered && isOptionWrong(index)" class="check-icon">✗</span>
            </div>
          </div>

          <div v-if="answered" class="explanation">
            <div class="explanation-header">
              <span class="icon">💡</span>
              <span>答案解析</span>
            </div>
            <p>{{ currentQuestion.explanation }}</p>
          </div>
        </div>

        <div class="quiz-actions">
          <button 
            v-if="!answered" 
            class="btn-submit" 
            :disabled="!canSubmitCurrentQuestion"
            @click="submitAnswer"
          >
            提交答案
          </button>
          <button 
            v-else-if="currentQuestionIndex < selectedQuestions.length - 1" 
            class="btn-next"
            @click="nextQuestion"
          >
            下一题 →
          </button>
        </div>
      </div>

      <div v-else class="quiz-result">
        <div class="result-icon">
          <span v-if="passed">🎉</span>
          <span v-else>😊</span>
        </div>
        <h3 class="result-title">{{ passed ? '恭喜通过！' : '继续加油！' }}</h3>
        <div class="score-display">
          <div class="score-circle">
            <span class="score-number">{{ score }}</span>
            <span class="score-label">分</span>
          </div>
        </div>
        <div class="result-stats">
          <div class="stat-item">
            <span class="stat-label">正确</span>
            <span class="stat-value correct">{{ correctCount }} 题</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">错误</span>
            <span class="stat-value wrong">{{ wrongCount }} 题</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">通过线</span>
            <span class="stat-value">{{ quizData.passingScore }} 分</span>
          </div>
        </div>
        <div class="result-actions">
          <button class="btn-retry" @click="retryQuiz">重新测试</button>
          <button class="btn-close" @click="closeModal">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

interface Question {
  id: string | number
  content?: string
  question?: string
  options: string[]
  correctAnswer: number | number[]
  explanation: string
  questionType?: 'single' | 'multiple' | 'judge'
}

interface QuizData {
  courseId: string
  courseName: string
  passingScore: number
  questions: Question[]
  questionCount?: number // 可选：要抽取的题目数量，不设置则使用全部题目
}

interface Props {
  visible: boolean
  quizData: QuizData
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'completed', result: { score: number; passed: boolean; answers: Array<number | number[]> }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

type QuestionType = 'single' | 'multiple' | 'judge'
type UserAnswer = number | number[]

const JUDGE_TEXT_SET = new Set([
  'true',
  'false',
  't',
  'f',
  'yes',
  'no',
  '对',
  '错',
  '正确',
  '错误',
  '是',
  '否'
])

const currentQuestionIndex = ref(0)
const selectedAnswer = ref<number | null>(null)
const selectedAnswers = ref<number[]>([])
const answered = ref(false)
const userAnswers = ref<UserAnswer[]>([])
const showResult = ref(false)
const selectedQuestions = ref<Question[]>([])

const normalizeQuestionType = (question: Question): QuestionType => {
  if (question.questionType === 'multiple' || question.questionType === 'judge' || question.questionType === 'single') {
    return question.questionType
  }

  if (Array.isArray(question.correctAnswer)) {
    return 'multiple'
  }

  if ((question.options || []).length === 2) {
    const normalized = question.options.map(item => String(item || '').trim().toLowerCase())
    if (normalized.every(item => JUDGE_TEXT_SET.has(item))) {
      return 'judge'
    }
  }

  return 'single'
}

const getQuestionTypeLabel = (question: Question): string => {
  const type = normalizeQuestionType(question)
  if (type === 'multiple') return '多选题'
  if (type === 'judge') return '判断题'
  return '单选题'
}

const getCorrectAnswerIndexes = (question: Question): number[] => {
  if (Array.isArray(question.correctAnswer)) {
    return question.correctAnswer
      .map((idx) => Number(idx))
      .filter((idx) => Number.isInteger(idx) && idx >= 0)
      .sort((a, b) => a - b)
  }

  const index = Number(question.correctAnswer)
  if (!Number.isInteger(index) || index < 0) {
    return []
  }

  return [index]
}

const getOptionLabel = (question: Question, index: number): string => {
  if (normalizeQuestionType(question) === 'judge') {
    return index === 0 ? '对' : '错'
  }

  return String.fromCharCode(65 + index)
}

// 随机抽取题目
const getRandomQuestions = (questions: Question[], count?: number): Question[] => {
  if (!count || count >= questions.length) {
    return [...questions]
  }
  
  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// 打乱单道题目的选项顺序，并重新映射 correctAnswer
const shuffleOptions = (question: Question): Question => {
  const questionType = normalizeQuestionType(question)

  // 创建带原始索引的选项数组
  const indexed = question.options.map((opt, i) => ({ opt, i }))
  // Fisher-Yates 洗牌
  for (let j = indexed.length - 1; j > 0; j--) {
    const k = Math.floor(Math.random() * (j + 1));
    [indexed[j], indexed[k]] = [indexed[k], indexed[j]]
  }
  // 找到正确答案在新数组中的位置
  const rawCorrect = getCorrectAnswerIndexes(question)
  const remappedCorrect = rawCorrect
    .map((originIndex) => indexed.findIndex(item => item.i === originIndex))
    .filter((idx) => idx >= 0)
    .sort((a, b) => a - b)

  return {
    ...question,
    options: indexed.map(item => item.opt),
    questionType,
    correctAnswer: questionType === 'multiple' ? remappedCorrect : (remappedCorrect[0] ?? -1)
  }
}

const currentQuestion = computed(() => selectedQuestions.value[currentQuestionIndex.value])
const progressPercent = computed(() => ((currentQuestionIndex.value + 1) / selectedQuestions.value.length) * 100)

const correctCount = computed(() => {
  return userAnswers.value.filter((answer, index) => {
    const question = selectedQuestions.value[index]
    if (!question) return false

    const expected = getCorrectAnswerIndexes(question)
    if (Array.isArray(answer)) {
      const normalized = [...answer].sort((a, b) => a - b)
      return JSON.stringify(normalized) === JSON.stringify(expected)
    }

    return expected.length === 1 && answer === expected[0]
  }).length
})

const wrongCount = computed(() => selectedQuestions.value.length - correctCount.value)
const score = computed(() => Math.round((correctCount.value / selectedQuestions.value.length) * 100))
const passed = computed(() => score.value >= props.quizData.passingScore)
const currentQuestionType = computed<QuestionType>(() => {
  const question = currentQuestion.value
  return question ? normalizeQuestionType(question) : 'single'
})
const canSubmitCurrentQuestion = computed(() => {
  if (currentQuestionType.value === 'multiple') {
    return selectedAnswers.value.length > 0
  }

  return selectedAnswer.value !== null
})

watch(() => props.visible, (newVal) => {
  if (newVal) {
    resetQuiz()
  }
})

onMounted(() => {
  if (props.visible) {
    resetQuiz()
  }
})

const selectAnswer = (index: number) => {
  if (answered.value) {
    return
  }

  if (currentQuestionType.value === 'multiple') {
    const foundIdx = selectedAnswers.value.indexOf(index)
    if (foundIdx >= 0) {
      selectedAnswers.value.splice(foundIdx, 1)
    } else {
      selectedAnswers.value.push(index)
      selectedAnswers.value.sort((a, b) => a - b)
    }
    return
  }

  selectedAnswer.value = index
}

const isOptionSelected = (index: number): boolean => {
  if (currentQuestionType.value === 'multiple') {
    return selectedAnswers.value.includes(index)
  }
  return selectedAnswer.value === index
}

const isOptionCorrect = (index: number): boolean => {
  const question = currentQuestion.value
  if (!question) return false
  return getCorrectAnswerIndexes(question).includes(index)
}

const isOptionWrong = (index: number): boolean => {
  if (!answered.value) return false

  if (currentQuestionType.value === 'multiple') {
    return selectedAnswers.value.includes(index) && !isOptionCorrect(index)
  }

  return selectedAnswer.value === index && !isOptionCorrect(index)
}

const submitAnswer = () => {
  if (!canSubmitCurrentQuestion.value) {
    return
  }

  answered.value = true
  if (currentQuestionType.value === 'multiple') {
    userAnswers.value.push([...selectedAnswers.value].sort((a, b) => a - b))
  } else if (selectedAnswer.value !== null) {
    userAnswers.value.push(selectedAnswer.value)
  }

  // 如果是最后一题，自动显示成绩
  if (currentQuestionIndex.value === selectedQuestions.value.length - 1) {
    setTimeout(() => {
      finishQuiz()
    }, 1500) // 延迟1.5秒显示成绩，让用户看到答案解析
  }
}

const nextQuestion = () => {
  currentQuestionIndex.value++
  selectedAnswer.value = null
  selectedAnswers.value = []
  answered.value = false
}

const finishQuiz = () => {
  showResult.value = true
  emit('completed', {
    score: score.value,
    passed: passed.value,
    answers: userAnswers.value
  })
}

const retryQuiz = () => {
  resetQuiz()
}

const resetQuiz = () => {
  currentQuestionIndex.value = 0
  selectedAnswer.value = null
  selectedAnswers.value = []
  answered.value = false
  userAnswers.value = []
  showResult.value = false
  // 随机抽取题目，并打乱每题的选项顺序
  selectedQuestions.value = getRandomQuestions(props.quizData.questions, props.quizData.questionCount)
    .map(q => shuffleOptions(q))
}

const closeModal = () => {
  emit('update:visible', false)
}
</script>

<style scoped>
.quiz-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.quiz-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.quiz-header h2 {
  margin: 0;
  font-size: 20px;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.quiz-content {
  padding: 24px;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: width 0.3s ease;
}

.question-info {
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 24px;
}

.question-card {
  margin-bottom: 24px;
}

.question-meta {
  margin-bottom: 8px;
}

.question-type-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #1e40af;
  background: #dbeafe;
}

.question-text {
  font-size: 18px;
  color: #1f2937;
  margin-bottom: 20px;
  line-height: 1.6;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.option-item:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.option-item.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.option-item.correct {
  border-color: #10b981;
  background: #d1fae5;
}

.option-item.wrong {
  border-color: #ef4444;
  background: #fee2e2;
}

.option-label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f3f4f6;
  border-radius: 8px;
  font-weight: 600;
  color: #6b7280;
  margin-right: 12px;
  flex-shrink: 0;
}

.option-item.correct .option-label {
  background: #10b981;
  color: white;
}

.option-item.wrong .option-label {
  background: #ef4444;
  color: white;
}

.option-text {
  flex: 1;
  color: #374151;
  font-size: 15px;
}

.check-icon {
  font-size: 20px;
  margin-left: 8px;
}

.option-item.correct .check-icon {
  color: #10b981;
}

.option-item.wrong .check-icon {
  color: #ef4444;
}

.explanation {
  margin-top: 20px;
  padding: 16px;
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: 8px;
}

.explanation-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 8px;
}

.explanation-header .icon {
  font-size: 18px;
}

.explanation p {
  margin: 0;
  color: #78350f;
  line-height: 1.6;
  font-size: 14px;
}

.quiz-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn-submit,
.btn-next,
.btn-finish {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit {
  background: #3b82f6;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  background: #2563eb;
}

.btn-submit:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-next {
  background: #10b981;
  color: white;
}

.btn-next:hover {
  background: #059669;
}

.btn-finish {
  background: #8b5cf6;
  color: white;
}

.btn-finish:hover {
  background: #7c3aed;
}

.quiz-result {
  padding: 40px 24px;
  text-align: center;
}

.result-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.result-title {
  font-size: 24px;
  color: #1f2937;
  margin-bottom: 24px;
}

.score-display {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.score-circle {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
}

.score-number {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
}

.score-label {
  font-size: 16px;
  margin-top: 4px;
}

.result-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
}

.stat-value.correct {
  color: #10b981;
}

.stat-value.wrong {
  color: #ef4444;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn-retry,
.btn-close {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-retry {
  background: #3b82f6;
  color: white;
}

.btn-retry:hover {
  background: #2563eb;
}

.btn-close {
  background: #f3f4f6;
  color: #374151;
}

.btn-close:hover {
  background: #e5e7eb;
}
</style>
