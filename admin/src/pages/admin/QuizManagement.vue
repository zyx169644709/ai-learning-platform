<template>
  <div class="quiz-management">
    <PageHeader title="习题管理" />

    <FilterBar v-model="filterForm" @search="loadQuizzes" @reset="resetFilter">
      <el-form-item>
        <el-input
          v-model="filterForm.title"
          placeholder="搜索习题标题"
          clearable
          @input="debouncedSearch"
          style="width: 220px"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-select
          v-model="filterForm.category"
          placeholder="分类"
          clearable
          filterable
          @change="debouncedSearch"
          style="width: 200px"
        >
          <el-option
            v-for="option in quizCategoryOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select
          v-model="filterForm.status"
          placeholder="状态"
          clearable
          @change="debouncedSearch"
          style="width: 140px"
        >
          <el-option label="已发布" value="published" />
          <el-option label="草稿" value="draft" />
        </el-select>
      </el-form-item>
      <template #extra-buttons>
        <el-button type="success" @click="openCreateDialog">
          <el-icon><Plus /></el-icon> 新建题库
        </el-button>
      </template>
    </FilterBar>

    <el-card>
      <el-table
        class="quiz-tree-table"
        ref="quizTreeTableRef"
        :data="pagedQuizTreeData"
        stripe
        row-key="id"
        :tree-props="{ children: 'children' }"
        style="table-layout: auto"
        @expand-change="handleQuizTreeExpandChange"
      >
        <el-table-column prop="title" label="标题" min-width="320">
          <template #default="{ row }">
            <template v-if="row.nodeType === 'category'">
              <span class="category-row-title">{{ row.title }}</span>
            </template>
            <template v-else-if="row.nodeType === 'quiz'">
              {{ row.title }}
            </template>
            <template v-else>
              <span class="question-row-text">{{ row.content || row.title }}</span>
            </template>
          </template>
        </el-table-column>

        <el-table-column label="题目数" width="90" align="center" header-align="center">
          <template #default="{ row }">
            {{ row.nodeType === 'question' ? '-' : row.questionCount ?? 0 }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag v-if="row.nodeType === 'quiz'" :type="row.status === 'published' ? 'success' : 'info'">
              {{ row.status === 'published' ? '已发布' : '草稿' }}
            </el-tag>
            <el-tag v-else-if="row.nodeType === 'question'" type="info">题目</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column prop="updatedAt" label="更新时间" width="170" align="center" header-align="center">
          <template #default="{ row }">
            {{ row.updatedAt ? formatRelativeTime(row.updatedAt) : '-' }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <template v-if="row.nodeType === 'category'">
              <el-button type="primary" link @click="handleEditCategory(row)">编辑</el-button>
            </template>
            <template v-else-if="row.nodeType === 'quiz'">
              <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
              <el-button type="warning" link @click="openQuestionsDialog(row)">管理题目</el-button>
              <el-button type="danger" link @click="handleDeleteQuiz(row)">删除</el-button>
            </template>
            <template v-else-if="row.nodeType === 'question'">
              <el-button type="primary" link @click="editQuestionFromTree(row)">编辑题目</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="() => { pagination.page = 1 }"
          @current-change="() => {}"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="showQuizDialog"
      :title="isEdit ? '编辑题库' : '新建题库'"
      width="640px"
      :close-on-click-modal="false"
    >
      <el-form ref="quizFormRef" :model="quizForm" :rules="quizRules" label-width="100px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="quizForm.title" placeholder="请输入题库标题" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="quizForm.category" placeholder="请选择分类" filterable allow-create default-first-option style="width: 100%">
            <el-option
              v-for="option in quizCategoryOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Slug" prop="slug">
              <el-input v-model="quizForm.slug" placeholder="例如：introduction" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="CourseId">
              <el-input v-model="quizForm.courseId" placeholder="可选" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="及格线" prop="passingScore">
              <el-input-number v-model="quizForm.passingScore" :min="0" :max="100" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="quizForm.status" style="width: 100%">
                <el-option label="已发布" value="published" />
                <el-option label="草稿" value="draft" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showQuizDialog = false">取消</el-button>
        <el-button type="primary" :loading="savingQuiz" @click="handleSaveQuiz">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showQuestionsDialog" width="980px" :title="`${currentQuiz?.title || ''} · 题目管理`">
      <div class="question-toolbar">
        <div class="question-toolbar-left">
          <input
            ref="questionImportInputRef"
            type="file"
            accept=".json,application/json"
            style="display: none"
            @change="handleQuestionJsonImport"
          />
          <el-button @click="downloadQuestionJsonTemplate">
            <el-icon><Download /></el-icon> 下载JSON模板
          </el-button>
          <el-button :loading="importingQuestions" @click="triggerQuestionJsonImport">
            <el-icon><Upload /></el-icon> 导入JSON
          </el-button>
        </div>
        <div class="question-toolbar-right">
          <el-radio-group v-model="questionSortMode" size="small">
            <el-radio-button label="order">按录入顺序</el-radio-button>
            <el-radio-button label="type">按题型分组</el-radio-button>
          </el-radio-group>
          <el-button type="primary" @click="openQuestionEditor()">
            <el-icon><Plus /></el-icon> 新增题目
          </el-button>
        </div>
      </div>

      <el-table
        class="question-table"
        ref="questionTableRef"
        :data="sortedQuestions"
        stripe
        row-key="id"
        style="table-layout: auto"
        @selection-change="handleQuestionSelectionChange"
      >
        <el-table-column type="selection" width="52" reserve-selection />
        <el-table-column label="#" width="60" align="center" header-align="center">
          <template #default="scope">{{ scope.$index + 1 }}</template>
        </el-table-column>
        <el-table-column label="题型" width="90" align="center" header-align="center">
          <template #default="{ row }">
            {{ row.questionType === 'multiple' ? '多选' : row.questionType === 'judge' ? '判断' : '单选' }}
          </template>
        </el-table-column>
        <el-table-column prop="content" label="题干" min-width="320" show-overflow-tooltip />
        <el-table-column label="正确答案" width="160" show-overflow-tooltip>
          <template #default="{ row }">
            {{ getQuestionAnswerLabel(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="170" align="center" header-align="center">
          <template #default="{ row }">{{ formatRelativeTime(row.updatedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openQuestionEditor(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDeleteQuestion(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <BatchActionBar :count="selectedQuestions.length" label="题目">
        <el-button type="danger" @click="handleBatchDeleteQuestions">批量删除</el-button>
      </BatchActionBar>
    </el-dialog>

    <el-dialog
      v-model="showQuestionEditor"
      :title="editingQuestion?.id ? '编辑题目' : '新增题目'"
      width="760px"
      :close-on-click-modal="false"
    >
      <el-form ref="questionFormRef" :model="questionForm" :rules="questionRules" label-width="100px">
        <el-form-item label="题型" prop="questionType">
          <el-select v-model="questionForm.questionType" style="width: 100%" @change="handleQuestionTypeChange">
            <el-option label="单选题" value="single" />
            <el-option label="多选题" value="multiple" />
            <el-option label="判断题" value="judge" />
          </el-select>
        </el-form-item>
        <el-form-item label="题干" prop="content">
          <el-input v-model="questionForm.content" type="textarea" :rows="3" placeholder="请输入题干" />
        </el-form-item>
        <el-form-item v-if="!isJudgeQuestion" label="选项" prop="optionsText">
          <el-input
            v-model="questionForm.optionsText"
            type="textarea"
            :rows="4"
            placeholder="每行一个选项，例如：&#10;选项A&#10;选项B&#10;选项C"
          />
        </el-form-item>
        <el-form-item v-else label="选项">
          <el-input value="正确\n错误" type="textarea" :rows="2" disabled />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="24" v-if="isMultipleQuestion">
            <el-form-item label="正确序号" prop="multipleCorrectAnswers">
              <el-select
                v-model="questionForm.multipleCorrectAnswers"
                multiple
                collapse-tags
                collapse-tags-tooltip
                style="width: 100%"
                placeholder="请选择一个或多个"
              >
                <el-option
                  v-for="(option, index) in parsedOptions"
                  :key="`${index}-${option}`"
                  :label="`${index}. ${option}`"
                  :value="index"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-else>
            <el-form-item label="正确序号" prop="correctAnswer">
              <el-select v-model="questionForm.correctAnswer" style="width: 100%" placeholder="请选择正确答案">
                <el-option
                  v-for="(option, index) in parsedOptions"
                  :key="`${index}-${option}`"
                  :label="`${index}. ${option}`"
                  :value="index"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="解析">
          <el-input v-model="questionForm.explanation" type="textarea" :rows="3" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showQuestionEditor = false">取消</el-button>
        <el-button type="primary" :loading="savingQuestion" @click="handleSaveQuestion">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showQuickAddQuestion" title="选择题库后进入题目管理" width="520px">
      <el-form label-width="90px">
        <el-form-item label="目标题库" required>
          <el-select v-model="quickAddQuizId" placeholder="请选择题库" filterable style="width: 100%">
            <el-option
              v-for="quiz in quizzes"
              :key="quiz.id"
              :label="`${getQuizCategoryLabel(quiz.category)} / ${quiz.title}`"
              :value="quiz.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showQuickAddQuestion = false">取消</el-button>
        <el-button type="primary" @click="confirmQuestionManagementEntry">进入题目管理</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Download, Plus, Search, Upload } from '@element-plus/icons-vue'
import request from '@/utils/request'
import BatchActionBar from '@/components/BatchActionBar.vue'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import { usePagination } from '@/composables/usePagination'
import { useFilter } from '@/composables/useFilter'
import { formatRelativeTime } from '@/utils/format'

interface QuizItem {
  id: string
  category: string
  courseId?: string
  chapterId?: string
  slug?: string
  title: string
  passingScore: number
  status: string
  updatedAt: string
  _count?: { questions: number }
}

interface QuestionItem {
  id: string
  quizId: string
  questionType: 'single' | 'multiple' | 'judge'
  content: string
  options: string[]
  correctAnswer: number | number[]
  explanation?: string
  order: number
  updatedAt: string
}

interface QuestionImportPayload {
  questionType: 'single' | 'multiple' | 'judge'
  content: string
  options: string[]
  correctAnswer: number | number[]
  explanation?: string
}

interface QuestionImportFile {
  questions: QuestionImportPayload[]
}

type QuizTreeNode = {
  id: string
  nodeType: 'category' | 'quiz' | 'question'
  title: string
  category: string
  slug?: string
  passingScore?: number
  status?: string
  updatedAt?: string
  questionCount?: number
  quizId?: string
  questionType?: 'single' | 'multiple' | 'judge'
  content?: string
  options?: string[]
  correctAnswer?: number | number[]
  explanation?: string
  order?: number
  children?: QuizTreeNode[]
}

const { pagination, resetPagination, setTotal, getPaginationParams } = usePagination()
const { debouncedSearch } = useFilter({ onSearch: loadQuizzes })

const filterForm = reactive({
  title: '',
  category: '',
  status: ''
})

const quizzes = ref<QuizItem[]>([])
const quizTreeData = ref<QuizTreeNode[]>([])
const allQuizTreeData = ref<QuizTreeNode[]>([])
const pagedQuizTreeData = computed(() => {
  const start = (pagination.page - 1) * pagination.size
  return allQuizTreeData.value.slice(start, start + pagination.size)
})
const quizTreeTableRef = ref<any>()
const showQuizDialog = ref(false)
const isEdit = ref(false)
const savingQuiz = ref(false)
const quizFormRef = ref<FormInstance>()

const quizForm = reactive({
  id: '',
  category: '',
  courseId: '',
  slug: '',
  title: '',
  passingScore: 60,
  status: 'published'
})

const quizRules: FormRules = {
  category: [{ required: true, message: '请输入分类', trigger: 'blur' }],
  slug: [{ required: true, message: '请输入 slug', trigger: 'blur' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  passingScore: [{ required: true, message: '请输入及格线', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const showQuestionsDialog = ref(false)
const currentQuiz = ref<QuizItem | null>(null)
const questions = ref<QuestionItem[]>([])
const selectedQuestions = ref<QuestionItem[]>([])
const showQuestionEditor = ref(false)
const savingQuestion = ref(false)
const questionFormRef = ref<FormInstance>()
const questionTableRef = ref<any>()
const editingQuestion = ref<QuestionItem | null>(null)
const importingQuestions = ref(false)
const questionImportInputRef = ref<HTMLInputElement>()
const questionSortMode = ref<'order' | 'type'>('order')
const showQuickAddQuestion = ref(false)
const quickAddQuizId = ref('')

const route = useRoute()
const router = useRouter()

const questionForm = reactive({
  id: '',
  questionType: 'single' as 'single' | 'multiple' | 'judge',
  content: '',
  optionsText: '',
  correctAnswer: 0,
  multipleCorrectAnswers: [] as number[],
  explanation: ''
})

const questionRules: FormRules = {
  content: [{ required: true, message: '请输入题干', trigger: 'blur' }],
  questionType: [{ required: true, message: '请选择题型', trigger: 'change' }]
}

const parsedOptions = computed(() => {
  if (questionForm.questionType === 'judge') {
    return ['正确', '错误']
  }

  return questionForm.optionsText
    .split('\n')
    .map((it) => it.trim())
    .filter(Boolean)
})

const isMultipleQuestion = computed(() => questionForm.questionType === 'multiple')
const isJudgeQuestion = computed(() => questionForm.questionType === 'judge')

const questionImportTemplate: QuestionImportFile = {
  questions: [
    {
      questionType: 'single',
      content: 'Vue 3 更推荐使用哪种 API 来组织复杂组件逻辑？',
      options: ['Options API', 'Composition API', 'Mixin', 'Filter'],
      correctAnswer: 1,
      explanation: 'Vue 3 更推荐使用 Composition API 组织复杂逻辑。'
    },
    {
      questionType: 'multiple',
      content: '下面哪些属于 Vue 的核心能力？',
      options: ['响应式系统', '组件化开发', '虚拟 DOM', '只支持服务端渲染'],
      correctAnswer: [0, 1, 2],
      explanation: '响应式、组件化和虚拟 DOM 都是 Vue 的核心能力。'
    },
    {
      questionType: 'judge',
      content: '判断题的 correctAnswer 只能是 0 或 1，其中 0 表示“正确”，1 表示“错误”。',
      options: ['正确', '错误'],
      correctAnswer: 0,
      explanation: '当前系统中判断题选项固定为“正确/错误”。'
    }
  ]
}

const questionTypeSortWeight: Record<QuestionItem['questionType'], number> = {
  single: 0,
  multiple: 1,
  judge: 2
}

const quizCategoryLabelMap: Record<string, string> = {
  basics: '前端核心基础',
  'vue-basics': 'Vue 3 基础入门',
  exercises: '专项习题练习',
  'composition-api': 'Composition API',
  'components-deep': '组件深入',
  'routing-state': '路由与状态管理',
  ecosystem: 'Vue 生态工具',
  'performance-testing': '性能与测试',
  'practical-projects': '实战项目演练'
}

function getQuizCategoryLabel(category?: string) {
  if (!category) return '未分类'
  return quizCategoryLabelMap[category] || category
}

const quizCategoryOptions = computed(() => {
  const categories = new Set<string>([
    ...Object.keys(quizCategoryLabelMap),
    ...quizzes.value.map((quiz) => quiz.category).filter(Boolean)
  ])

  return Array.from(categories).map((value) => ({
    value,
    label: getQuizCategoryLabel(value)
  }))
})

const sortedQuestions = computed(() => {
  const list = [...questions.value]

  if (questionSortMode.value === 'type') {
    return list.sort((a, b) => {
      const typeDiff = questionTypeSortWeight[a.questionType] - questionTypeSortWeight[b.questionType]
      if (typeDiff !== 0) return typeDiff
      return a.order - b.order
    })
  }

  return list.sort((a, b) => a.order - b.order)
})

function pickLatestDate(...values: Array<string | undefined>) {
  return values.reduce<string | undefined>((latest, current) => {
    if (!current) return latest
    if (!latest) return current

    const latestTime = new Date(latest).getTime()
    const currentTime = new Date(current).getTime()

    if (Number.isNaN(currentTime)) return latest
    if (Number.isNaN(latestTime) || currentTime > latestTime) {
      return current
    }

    return latest
  }, undefined)
}

function handleQuestionTypeChange(type: 'single' | 'multiple' | 'judge') {
  questionForm.correctAnswer = 0
  questionForm.multipleCorrectAnswers = []

  if (type === 'judge') {
    questionForm.optionsText = ''
    return
  }

  if (!questionForm.optionsText.trim()) {
    questionForm.optionsText = '选项A\n选项B'
  }
}

async function loadQuizzes() {
  try {
    const response = await request.get('/quiz/admin/list', {
      params: {
        limit: 9999,
        page: 1,
        ...filterForm
      }
    })

    if (response.data.success) {
      quizzes.value = response.data.data || []
      pagination.page = 1

      // 树形数据：分类(题目类型) -> 题库 -> 题目
      const quizDetails = await Promise.all(
        quizzes.value.map(async (quiz) => {
          try {
            const detailRes = await request.get(`/quiz/admin/${quiz.id}`)
            const detailQuestions = (detailRes.data?.data?.questions || []) as QuestionItem[]
            return { quiz, questions: detailQuestions }
          } catch {
            return { quiz, questions: [] as QuestionItem[] }
          }
        })
      )

      const categoryMap: Record<string, QuizTreeNode> = {}
      for (const item of quizDetails) {
        const category = item.quiz.category || '未分类'
        const categoryTitle = getQuizCategoryLabel(category)
        if (!categoryMap[category]) {
          categoryMap[category] = {
            id: `cat-${category}`,
            nodeType: 'category',
            title: categoryTitle,
            category,
            updatedAt: undefined,
            questionCount: 0,
            children: []
          }
        }

        const questionChildren: QuizTreeNode[] = item.questions.map((q) => ({
          id: q.id,
          nodeType: 'question',
          title: q.content,
          content: q.content,
          category,
          quizId: item.quiz.id,
          questionType: q.questionType,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          order: q.order,
          updatedAt: q.updatedAt
        }))

        const quizNode: QuizTreeNode = {
          id: item.quiz.id,
          nodeType: 'quiz',
          title: item.quiz.title,
          category,
          slug: item.quiz.slug,
          passingScore: item.quiz.passingScore,
          status: item.quiz.status,
          updatedAt: item.quiz.updatedAt,
          questionCount: questionChildren.length,
          children: questionChildren
        }

        const latestUpdatedAt = pickLatestDate(
          item.quiz.updatedAt,
          ...questionChildren.map((question) => question.updatedAt)
        )

        categoryMap[category].children!.push(quizNode)
        categoryMap[category].questionCount = (categoryMap[category].questionCount || 0) + questionChildren.length
        categoryMap[category].updatedAt = pickLatestDate(categoryMap[category].updatedAt, latestUpdatedAt)
      }

      allQuizTreeData.value = Object.values(categoryMap)
      quizTreeData.value = allQuizTreeData.value
      setTotal(allQuizTreeData.value.length)
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '加载题库列表失败')
  }
}

function editQuestionFromTree(row: QuizTreeNode) {
  if (!row.quizId) return
  const quiz = quizzes.value.find((q) => q.id === row.quizId)
  if (!quiz) return

  currentQuiz.value = quiz
  openQuestionEditor({
    id: row.id,
    quizId: row.quizId,
    questionType: row.questionType || 'single',
    content: row.content || row.title,
    options: row.options || [],
    correctAnswer: row.correctAnswer ?? 0,
    explanation: row.explanation || '',
    order: row.order ?? 0,
    updatedAt: row.updatedAt || ''
  })
}

async function openQuestionsDialogFromTree(row: QuizTreeNode) {
  const quiz = quizzes.value.find((item) => item.id === row.id)
  if (!quiz) {
    ElMessage.warning('题库不存在，请刷新后重试')
    return
  }

  await openQuestionsDialog(quiz)
}

async function handleQuizTreeExpandChange(row: QuizTreeNode, expanded: QuizTreeNode[] | boolean) {
  if (row.nodeType !== 'quiz') return

  const isExpanded = Array.isArray(expanded)
    ? expanded.some((item) => item.id === row.id)
    : Boolean(expanded)

  if (!isExpanded) return

  quizTreeTableRef.value?.toggleRowExpansion?.(row, false)
  quizTreeTableRef.value?.store?.toggleTreeExpansion?.(row, false)
  await openQuestionsDialogFromTree(row)
}

async function handleEditCategory(row: QuizTreeNode) {
  if (row.nodeType !== 'category') return

  try {
    const promptResult = await ElMessageBox.prompt('请输入新的分类名称', '编辑分类', {
      inputValue: row.category,
      confirmButtonText: '保存',
      cancelButtonText: '取消',
      inputValidator: (inputValue) => {
        if (!String(inputValue || '').trim()) {
          return '分类名称不能为空'
        }
        return true
      }
    })

    const newCategory = String((promptResult as any)?.value ?? '').trim()
    if (!newCategory || newCategory === row.category) {
      return
    }

    const response = await request.put('/quiz/admin/categories/rename', {
      oldCategory: row.category,
      newCategory
    })

    if (response.data.success) {
      if (currentQuiz.value?.category === row.category) {
        currentQuiz.value.category = newCategory
      }
      ElMessage.success(`分类更新成功，共影响 ${response.data.data?.count || 0} 个题库`)
      await loadQuizzes()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '更新分类失败')
    }
  }
}

function resetFilter() {
  Object.assign(filterForm, { title: '', category: '', status: '' })
  resetPagination()
  loadQuizzes()
}

function openCreateDialog() {
  isEdit.value = false
  Object.assign(quizForm, {
    id: '',
    category: '',
    courseId: '',
    slug: '',
    title: '',
    passingScore: 60,
    status: 'published'
  })
  showQuizDialog.value = true
}

async function confirmQuestionManagementEntry() {
  if (!quickAddQuizId.value) {
    ElMessage.warning('请选择题库')
    return
  }

  const quiz = quizzes.value.find((item) => item.id === quickAddQuizId.value)
  if (!quiz) {
    ElMessage.warning('所选题库不存在，请刷新后重试')
    return
  }

  showQuickAddQuestion.value = false
  await openQuestionsDialog(quiz)
}

function handleQuestionSelectionChange(selection: QuestionItem[]) {
  selectedQuestions.value = selection
}

function getQuestionAnswerLabel(row: QuestionItem): string {
  if (Array.isArray(row.correctAnswer)) {
    return row.correctAnswer
      .map((idx) => row.options?.[idx])
      .filter((item): item is string => Boolean(item))
      .join(' / ') || '-'
  }

  return row.options?.[row.correctAnswer] || '-'
}

function downloadQuestionJsonTemplate() {
  const blob = new Blob([JSON.stringify(questionImportTemplate, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'quiz-questions-template.json'
  link.click()
  URL.revokeObjectURL(url)
}

function triggerQuestionJsonImport() {
  questionImportInputRef.value?.click()
}

async function handleQuestionJsonImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  const quizId = currentQuiz.value?.id

  if (!file) return
  if (!quizId) {
    ElMessage.warning('请先选择题库')
    input.value = ''
    return
  }

  importingQuestions.value = true
  try {
    const content = await file.text()
    const parsed = JSON.parse(content)
    const questions = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.questions)
        ? parsed.questions
        : null

    if (!questions?.length) {
      ElMessage.warning('JSON 文件格式不正确，必须为数组或包含 questions 数组')
      return
    }

    const response = await request.post(`/quiz/admin/${quizId}/questions/import`, parsed)
    if (response.data.success) {
      ElMessage.success(`成功导入 ${response.data.data?.count || questions.length} 道题目`)
      await loadQuizDetail(quizId)
      await loadQuizzes()
    }
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      ElMessage.error('JSON 文件解析失败，请检查文件格式')
    } else {
      ElMessage.error(error.response?.data?.message || '导入题目失败')
    }
  } finally {
    importingQuestions.value = false
    input.value = ''
  }
}

function openEditDialog(row: QuizItem) {
  isEdit.value = true
  Object.assign(quizForm, {
    id: row.id,
    category: row.category,
    courseId: row.courseId || '',
    slug: row.slug || '',
    title: row.title,
    passingScore: row.passingScore,
    status: row.status
  })
  showQuizDialog.value = true
}

async function handleSaveQuiz() {
  if (!quizFormRef.value) return
  await quizFormRef.value.validate(async (valid) => {
    if (!valid) return
    savingQuiz.value = true
    try {
      const payload = {
        category: quizForm.category,
        courseId: quizForm.courseId || null,
        slug: quizForm.slug,
        title: quizForm.title,
        passingScore: quizForm.passingScore,
        status: quizForm.status
      }
      const isEditing = !!quizForm.id
      const url = isEditing ? `/quiz/admin/${quizForm.id}` : '/quiz/admin'
      const method = isEditing ? 'put' : 'post'
      const response = await request[method](url, payload)
      if (response.data.success) {
        ElMessage.success(isEditing ? '题库更新成功' : '题库创建成功')
        showQuizDialog.value = false
        loadQuizzes()
      }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '保存题库失败')
    } finally {
      savingQuiz.value = false
    }
  })
}

async function handleDeleteQuiz(row: QuizItem) {
  try {
    await ElMessageBox.confirm(`确定删除题库「${row.title}」吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消'
    })
    const response = await request.delete(`/quiz/admin/${row.id}`)
    if (response.data.success) {
      ElMessage.success('删除成功')
      loadQuizzes()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

async function openQuestionsDialog(row: QuizItem) {
  currentQuiz.value = row
  selectedQuestions.value = []
  showQuestionsDialog.value = true
  await loadQuizDetail(row.id)
}

async function loadQuizDetail(quizId: string) {
  try {
    const response = await request.get(`/quiz/admin/${quizId}`)
    if (response.data.success) {
      if (currentQuiz.value?.id === quizId) {
        currentQuiz.value = {
          ...currentQuiz.value,
          chapterId: response.data.data?.chapterId || currentQuiz.value.chapterId
        }
      }
      questions.value = response.data.data.questions || []
      selectedQuestions.value = []
      questionTableRef.value?.clearSelection?.()
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '加载题目失败')
  }
}

function openQuestionEditor(row?: QuestionItem) {
  editingQuestion.value = row || null
  if (row) {
    const type = (row.questionType || 'single') as 'single' | 'multiple' | 'judge'
    const answerIndexes = Array.isArray(row.correctAnswer)
      ? row.correctAnswer.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item >= 0)
      : [Number(row.correctAnswer)].filter((item) => Number.isInteger(item) && item >= 0)

    Object.assign(questionForm, {
      id: row.id,
      questionType: type,
      content: row.content,
      optionsText: type === 'judge' ? '' : (row.options || []).join('\n'),
      correctAnswer: answerIndexes[0] ?? 0,
      multipleCorrectAnswers: answerIndexes,
      explanation: row.explanation || ''
    })
  } else {
    Object.assign(questionForm, {
      id: '',
      questionType: 'single',
      content: '',
      optionsText: '',
      correctAnswer: 0,
      multipleCorrectAnswers: [],
      explanation: ''
    })
  }
  showQuestionEditor.value = true
}

async function handleSaveQuestion() {
  if (!questionFormRef.value || !currentQuiz.value) return
  await questionFormRef.value.validate(async (valid) => {
    if (!valid) return

    const options = parsedOptions.value

    if (options.length < 2) {
      ElMessage.warning('至少需要两个选项')
      return
    }

    if (questionForm.questionType === 'multiple') {
      if (!questionForm.multipleCorrectAnswers.length) {
        ElMessage.warning('多选题至少需要选择一个正确答案')
        return
      }

      const hasInvalidAnswer = questionForm.multipleCorrectAnswers.some(
        (item) => item < 0 || item >= options.length
      )
      if (hasInvalidAnswer) {
        ElMessage.warning('多选题存在超出选项范围的正确答案序号')
        return
      }
    } else if (questionForm.correctAnswer < 0 || questionForm.correctAnswer >= options.length) {
      ElMessage.warning(`正确序号必须在 0-${options.length - 1} 范围内`)
      return
    }

    savingQuestion.value = true
    try {
      const quizId = currentQuiz.value?.id
      if (!quizId) {
        ElMessage.error('未选择题库')
        return
      }

      const payload = {
        questionType: questionForm.questionType,
        content: questionForm.content,
        options,
        correctAnswer: questionForm.questionType === 'multiple'
          ? [...questionForm.multipleCorrectAnswers].sort((a, b) => a - b)
          : questionForm.correctAnswer,
        explanation: questionForm.explanation
      }

      if (editingQuestion.value?.id) {
        await request.put(`/quiz/admin/questions/${editingQuestion.value.id}`, payload)
      } else {
        await request.post(`/quiz/admin/${quizId}/questions`, payload)
      }

      ElMessage.success(editingQuestion.value?.id ? '题目更新成功' : '题目创建成功')
      showQuestionEditor.value = false
      await loadQuizDetail(quizId)
      await loadQuizzes()
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '保存题目失败')
    } finally {
      savingQuestion.value = false
    }
  })
}

async function handleDeleteQuestion(row: QuestionItem) {
  try {
    await ElMessageBox.confirm('确定删除该题目吗？', '删除确认', {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消'
    })
    await request.delete(`/quiz/admin/questions/${row.id}`)
    ElMessage.success('删除成功')
    if (currentQuiz.value?.id) {
      await loadQuizDetail(currentQuiz.value.id)
      await loadQuizzes()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

async function handleBatchDeleteQuestions() {
  const ids = selectedQuestions.value.map((item) => item.id)

  if (!ids.length) {
    ElMessage.warning('请先选择要删除的题目')
    return
  }

  try {
    await ElMessageBox.confirm(`确定批量删除已选中的 ${ids.length} 道题目吗？`, '批量删除确认', {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消'
    })

    await Promise.all(ids.map((id) => request.delete(`/quiz/admin/questions/${id}`)))
    ElMessage.success(`已删除 ${ids.length} 道题目`)

    if (currentQuiz.value?.id) {
      await loadQuizDetail(currentQuiz.value.id)
      await loadQuizzes()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '批量删除失败')
    }
  }
}

onMounted(async () => {
  // 检查是否从小节管理页面跳转过来
  if (route.query.chapterId && route.query.chapterTitle) {
    const chapterId = route.query.chapterId as string
    const chapterTitle = route.query.chapterTitle as string
    
    try {
      // 检查是否已存在该小节的题库
      const response = await request.get('/quiz/admin/list', {
        params: {
          chapterId,
          page: 1,
          limit: 1
        }
      })
      
      const list = Array.isArray(response.data?.data)
        ? response.data.data
        : (response.data?.data?.items || [])

      if (response.data.success && list.length > 0) {
        // 如果已存在题库，直接展开并进入题目管理
        const existingQuiz = list[0]
        await loadQuizzes()
        // 找到并展开对应的题库
        setTimeout(() => {
          const quizNode = quizTreeData.value.find((node: any) => node.id === existingQuiz.id)
          if (quizNode) {
            handleQuizTreeExpandChange(quizNode, [quizNode])
          }
        }, 100)
      } else {
        // 如果不存在，提示用户创建题库
        try {
          await ElMessageBox.confirm(
            `小节"${chapterTitle}"还没有题库，是否立即创建？`,
            '创建题库',
            {
              confirmButtonText: '立即创建',
              cancelButtonText: '稍后创建',
              type: 'info'
            }
          )
          
          // 创建新题库
          const createResponse = await request.post('/quiz/admin', {
            title: `${chapterTitle} - 练习题`,
            category: 'chapter',
            chapterId,
            status: 'published'
          })
          
          if (createResponse.data.success) {
            ElMessage.success('题库创建成功')
            await loadQuizzes()
            // 展开新创建的题库
            setTimeout(() => {
              const newQuiz = createResponse.data.data
              const quizNode = quizTreeData.value.find((node: any) => node.id === newQuiz.id)
              if (quizNode) {
                handleQuizTreeExpandChange(quizNode, [quizNode])
              }
            }, 100)
          }
        } catch (error: any) {
          if (error !== 'cancel') {
            ElMessage.error('创建题库失败')
          }
          // 清除URL参数
          router.replace({ query: {} })
        }
      }
    } catch (error) {
      console.error('检查题库失败:', error)
    }
  } else {
    // 正常加载所有题库
    loadQuizzes()
  }
})
</script>

<style scoped>
.quiz-management {
  padding: 20px;
}

.quiz-management :deep(.el-card) {
  margin-top: 20px;
  overflow-x: auto;
}

.quiz-management :deep(.el-table) {
  --el-table-border-color: #ebeef5;
}

.quiz-management :deep(.el-table th.el-table__cell) {
  background-color: #f5f7fa !important;
  padding: 12px 8px !important;
}

.quiz-management :deep(.el-table td.el-table__cell) {
  padding: 12px 8px !important;
}

.quiz-management :deep(.el-table .cell) {
  padding: 0 4px;
  word-break: break-word;
}

.quiz-management :deep(.el-table__fixed-right) {
  right: 0 !important;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.quiz-management :deep(.quiz-tree-table .el-table__cell:nth-child(1)),
.quiz-management :deep(.quiz-tree-table th.el-table__cell:nth-child(1)) {
  text-align: left !important;
}

.quiz-management :deep(.quiz-tree-table .el-table__cell:not(:nth-child(1)):not(:last-child)),
.quiz-management :deep(.quiz-tree-table th.el-table__cell:not(:nth-child(1)):not(:last-child)) {
  text-align: center !important;
}

.quiz-management :deep(.question-table .el-table__cell:nth-child(1)),
.quiz-management :deep(.question-table th.el-table__cell:nth-child(1)) {
  text-align: center !important;
}

.quiz-management :deep(.question-table .el-table__cell:nth-child(4)),
.quiz-management :deep(.question-table th.el-table__cell:nth-child(4)) {
  text-align: left !important;
}

.quiz-management :deep(.question-table .el-table__cell:not(:nth-child(1)):not(:nth-child(4)):not(:last-child)),
.quiz-management :deep(.question-table th.el-table__cell:not(:nth-child(1)):not(:nth-child(4)):not(:last-child)) {
  text-align: center !important;
}

.quiz-management :deep(.el-table .el-table__cell:last-child) {
  text-align: left !important;
  padding-left: 12px !important;
}

.quiz-management :deep(.el-table th.el-table__cell:last-child) {
  text-align: left !important;
  padding-left: 12px !important;
}

.quiz-management :deep(.el-table .el-table__cell:last-child .el-button) {
  margin-right: 8px;
}

.quiz-management :deep(.el-table .el-table__cell:last-child .el-button:last-child) {
  margin-right: 0;
}

.question-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.question-toolbar-left,
.question-toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.question-row-text {
  color: var(--el-text-color-regular);
}

.category-row-title {
  color: var(--el-text-color-primary);
  font-size: var(--el-font-size-base);
}
</style>
