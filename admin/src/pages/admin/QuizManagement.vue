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
        <el-input
          v-model="filterForm.category"
          placeholder="分类（如 vue-basics）"
          clearable
          @input="debouncedSearch"
          style="width: 200px"
        />
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
        <el-button type="primary" @click="openQuickAddQuestionDialog">
          <el-icon><Plus /></el-icon> 新增题目
        </el-button>
      </template>
    </FilterBar>

    <el-card>
      <el-table
        :data="quizTreeData"
        stripe
        row-key="id"
        :tree-props="{ children: 'children' }"
        style="table-layout: auto"
      >
        <el-table-column prop="title" label="题目类型 / 标题" min-width="320">
          <template #default="{ row }">
            <template v-if="row.nodeType === 'category'">
              <el-tag type="warning" size="small" style="margin-right: 8px;">题目类型</el-tag>
              <strong>{{ row.title }}</strong>
            </template>
            <template v-else-if="row.nodeType === 'quiz'">
              {{ row.title }}
            </template>
            <template v-else>
              <span class="question-row-text">Q{{ (row.order ?? 0) + 1 }}. {{ row.content || row.title }}</span>
            </template>
          </template>
        </el-table-column>

        <el-table-column prop="category" label="分类" min-width="140">
          <template #default="{ row }">
            {{ row.nodeType === 'question' ? '-' : row.category }}
          </template>
        </el-table-column>

        <el-table-column prop="slug" label="Slug" min-width="150">
          <template #default="{ row }">
            {{ row.nodeType === 'quiz' ? row.slug || '-' : '-' }}
          </template>
        </el-table-column>

        <el-table-column label="及格线" width="90" align="center" header-align="center">
          <template #default="{ row }">
            {{ row.nodeType === 'quiz' ? row.passingScore : '-' }}
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
            <el-tag v-else type="warning">类型</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="updatedAt" label="更新时间" width="170" align="center" header-align="center">
          <template #default="{ row }">
            {{ row.updatedAt ? formatRelativeTime(row.updatedAt) : '-' }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <template v-if="row.nodeType === 'quiz'">
              <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
              <el-button type="warning" link @click="openQuestionsDialog(row)">管理题目</el-button>
              <el-button type="danger" link @click="handleDeleteQuiz(row)">删除</el-button>
            </template>
            <template v-else-if="row.nodeType === 'question'">
              <el-button type="primary" link @click="editQuestionFromTree(row)">编辑题目</el-button>
            </template>
            <span v-else style="color: var(--el-text-color-secondary);">-</span>
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
          @size-change="loadQuizzes"
          @current-change="loadQuizzes"
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
          <el-input v-model="quizForm.category" placeholder="例如：vue-basics" />
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
        <el-button type="primary" @click="openQuestionEditor()">
          <el-icon><Plus /></el-icon> 新增题目
        </el-button>
      </div>

      <el-table :data="questions" stripe style="table-layout: auto">
        <el-table-column prop="order" label="#" width="60" align="center" header-align="center" />
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
          <el-col :span="12" v-if="isMultipleQuestion">
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
          <el-col :span="12" v-else>
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
          <el-col :span="12">
            <el-form-item label="排序" prop="order">
              <el-input-number v-model="questionForm.order" :min="0" :max="999" style="width: 100%" />
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

    <el-dialog v-model="showQuickAddQuestion" title="选择题库后新增题目" width="520px">
      <el-form label-width="90px">
        <el-form-item label="目标题库" required>
          <el-select v-model="quickAddQuizId" placeholder="请选择题库" filterable style="width: 100%">
            <el-option
              v-for="quiz in quizzes"
              :key="quiz.id"
              :label="`${quiz.category} / ${quiz.title}`"
              :value="quiz.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showQuickAddQuestion = false">取消</el-button>
        <el-button type="primary" @click="confirmQuickAddQuestion">下一步</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import request from '@/utils/request'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import { usePagination } from '@/composables/usePagination'
import { useFilter } from '@/composables/useFilter'
import { formatRelativeTime } from '@/utils/format'

interface QuizItem {
  id: string
  category: string
  courseId?: string
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

interface QuizTreeNode {
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
const showQuestionEditor = ref(false)
const savingQuestion = ref(false)
const questionFormRef = ref<FormInstance>()
const editingQuestion = ref<QuestionItem | null>(null)
const showQuickAddQuestion = ref(false)
const quickAddQuizId = ref('')

const questionForm = reactive({
  id: '',
  questionType: 'single' as 'single' | 'multiple' | 'judge',
  content: '',
  optionsText: '',
  correctAnswer: 0,
  multipleCorrectAnswers: [] as number[],
  explanation: '',
  order: 0
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
        ...getPaginationParams(),
        ...filterForm
      }
    })

    if (response.data.success) {
      quizzes.value = response.data.data || []
      setTotal(response.data.total || 0)

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
        if (!categoryMap[category]) {
          categoryMap[category] = {
            id: `cat-${category}`,
            nodeType: 'category',
            title: category,
            category,
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

        categoryMap[category].children!.push(quizNode)
        categoryMap[category].questionCount = (categoryMap[category].questionCount || 0) + questionChildren.length
      }

      quizTreeData.value = Object.values(categoryMap)
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

function openQuickAddQuestionDialog() {
  if (!quizzes.value.length) {
    ElMessage.warning('请先创建题库后再新增题目')
    return
  }

  quickAddQuizId.value = currentQuiz.value?.id || quizzes.value[0].id
  showQuickAddQuestion.value = true
}

async function confirmQuickAddQuestion() {
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
  openQuestionEditor()
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
  showQuestionsDialog.value = true
  await loadQuizDetail(row.id)
}

async function loadQuizDetail(quizId: string) {
  try {
    const response = await request.get(`/quiz/admin/${quizId}`)
    if (response.data.success) {
      questions.value = response.data.data.questions || []
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
      explanation: row.explanation || '',
      order: row.order
    })
  } else {
    Object.assign(questionForm, {
      id: '',
      questionType: 'single',
      content: '',
      optionsText: '',
      correctAnswer: 0,
      multipleCorrectAnswers: [],
      explanation: '',
      order: questions.value.length
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
        explanation: questionForm.explanation,
        order: questionForm.order
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

onMounted(loadQuizzes)
</script>

<style scoped>
.quiz-management {
  padding: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.question-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.question-row-text {
  color: var(--el-text-color-regular);
}
</style>
