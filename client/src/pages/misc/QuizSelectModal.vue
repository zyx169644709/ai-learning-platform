<template>
  <Teleport to="body">
    <Transition name="qs-fade">
      <div v-if="visible && !quizVisible" class="qs-overlay" @click.self="close">
        <div class="qs-modal">
          <div class="qs-header">
            <div class="qs-title-wrap">
              <span>📚</span>
              <h2>知识问答</h2>
            </div>
            <button class="qs-close" @click="close">✕</button>
          </div>
          <p class="qs-subtitle">选择一个章节，从题库随机抽取 <strong>20</strong> 道题开始测验</p>

          <div class="qs-grid">
            <button
              v-for="ch in chapters"
              :key="ch.id"
              class="qs-card"
              :style="{ '--card-color': ch.color }"
              @click="startQuiz(ch)"
            >
              <span class="qs-icon">{{ ch.icon }}</span>
              <div class="qs-info">
                <strong>{{ ch.name }}</strong>
                <span class="qs-desc">{{ ch.desc }}</span>
              </div>
              <span class="qs-badge">{{ ch.totalCount }} 题</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <QuizModal
    v-if="quizVisible"
    v-model:visible="quizVisible"
    :quizData="currentQuizData"
    @completed="onCompleted"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import QuizModal from '@/pages/misc/QuizModal.vue'
import { useQuizState } from '@/composables/useQuizState'

interface Props {
  visible: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

// Eagerly load all question JSON files
const allModules = import.meta.glob('/src/data/questions/**/*.json', { eager: true })

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuizData {
  courseId: string
  courseName: string
  passingScore: number
  questions: Question[]
  questionCount?: number
}

const getQuestionsFromFolder = (folder: string): Question[] => {
  const prefix = `/src/data/questions/${folder}/`
  return Object.entries(allModules)
    .filter(([path]) => path.startsWith(prefix))
    .flatMap(([, mod]) => {
      const data = (mod as { default?: { questions?: Question[] }; questions?: Question[] })
      const src = data.default || data
      return Array.isArray((src as any).questions) ? (src as any).questions : []
    })
}

const chapterDefs = [
  { id: 'basics',              icon: '🌐', name: '前端基础',          desc: 'HTML / CSS / JavaScript',          color: '#f59e0b' },
  { id: 'vue-basics',          icon: '🟢', name: 'Vue 3 基础入门',    desc: '模板语法、响应式、计算属性',        color: '#10b981' },
  { id: 'composition-api',     icon: '⚡', name: 'Composition API',   desc: '组合函数、生命周期、依赖注入',      color: '#8b5cf6' },
  { id: 'components-deep',     icon: '🧩', name: '组件深入',          desc: 'Props、事件、插槽、Teleport',       color: '#3b82f6' },
  { id: 'routing-state',       icon: '🛣️', name: '路由与状态管理',   desc: 'Vue Router 4、Pinia',              color: '#ef4444' },
  { id: 'ecosystem',           icon: '🔧', name: 'Vue 生态工具',      desc: 'Vite、TypeScript、VueUse',         color: '#06b6d4' },
  { id: 'performance-testing', icon: '🚀', name: '性能与测试',        desc: '代码分割、性能优化、单元测试',      color: '#f97316' },
  { id: 'practical-projects',  icon: '🏗️', name: '实战项目演练',     desc: 'Todo 应用、博客、后台管理系统',    color: '#ec4899' },
]

const chapters = chapterDefs.map(ch => ({
  ...ch,
  totalCount: getQuestionsFromFolder(ch.id).length
}))

const quizVisible = ref(false)
const { quizOpen } = useQuizState()

watch(quizVisible, (val) => {
  quizOpen.value = val
})
const currentQuizData = ref<QuizData>({
  courseId: '',
  courseName: '',
  passingScore: 60,
  questions: [],
  questionCount: 20
})

const startQuiz = (ch: typeof chapters[number]) => {
  const questions = getQuestionsFromFolder(ch.id)
  currentQuizData.value = {
    courseId: ch.id,
    courseName: ch.name,
    passingScore: 60,
    questions,
    questionCount: Math.min(20, questions.length)
  }
  quizVisible.value = true
}

const onCompleted = (_result: { score: number; passed: boolean; answers: number[] }) => {
  // Quiz finished — category selection reappears automatically
}

const close = () => {
  quizOpen.value = false
  emit('update:visible', false)
}
</script>

<style scoped>
.qs-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 20px;
}

.qs-modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.25);
  padding: 28px;
}

.qs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.qs-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qs-title-wrap span {
  font-size: 28px;
}

.qs-title-wrap h2 {
  margin: 0;
  font-size: 22px;
  color: #1f2937;
  font-weight: 700;
}

.qs-close {
  background: none;
  border: none;
  font-size: 22px;
  color: #9ca3af;
  cursor: pointer;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.qs-close:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.qs-subtitle {
  margin: 0 0 24px 0;
  color: #6b7280;
  font-size: 14px;
}

.qs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.qs-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.qs-card:hover {
  border-color: var(--card-color, #3b82f6);
  background: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.qs-card:hover .qs-badge {
  background: var(--card-color, #3b82f6);
  color: white;
}

.qs-icon {
  font-size: 28px;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.qs-info {
  flex: 1;
  min-width: 0;
}

.qs-info strong {
  display: block;
  font-size: 14px;
  color: #1f2937;
  font-weight: 700;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qs-desc {
  font-size: 11px;
  color: #9ca3af;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qs-badge {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  background: #e5e7eb;
  padding: 3px 8px;
  border-radius: 20px;
  transition: all 0.2s;
}

.qs-fade-enter-active,
.qs-fade-leave-active {
  transition: opacity 0.2s ease;
}

.qs-fade-enter-from,
.qs-fade-leave-to {
  opacity: 0;
}

@media (max-width: 520px) {
  .qs-grid {
    grid-template-columns: 1fr;
  }
}
</style>
