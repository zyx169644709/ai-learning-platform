<template>
  <div class="chapter-management">
    <PageHeader title="小节管理" />

    <FilterBar
      v-model="filterForm"
      @search="loadSections"
      @reset="resetFilter"
    >
      <el-form-item label="标题">
        <el-input
          v-model="filterForm.title"
          placeholder="请输入小节标题"
          clearable
          @input="debouncedSearch"
          style="width: 220px;"
        />
      </el-form-item>
      <el-form-item label="所属章节" style="width: 220px;">
        <el-select v-model="filterForm.parentId" placeholder="全部" clearable @change="debouncedSearch">
          <el-option
            v-for="chapter in parentChapters"
            :key="chapter.id"
            :label="chapter.title"
            :value="chapter.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" style="width: 150px;">
        <el-select v-model="filterForm.status" placeholder="全部" clearable @change="debouncedSearch">
          <el-option label="草稿" value="draft" />
          <el-option label="已发布" value="published" />
        </el-select>
      </el-form-item>
      <template #extra-buttons>
        <el-button type="success" @click="createSection">创建小节</el-button>
      </template>
    </FilterBar>

    <el-card>
      <el-table
        ref="tableRef"
        :data="sections"
        stripe
        row-key="id"
        :row-class-name="rowClassName"
        highlight-current-row
      >
        <el-table-column prop="title" label="小节标题" min-width="220" />
        <el-table-column prop="parentTitle" label="所属章节" width="200" />
        <el-table-column prop="order" label="章节内排序" width="100" />
        <el-table-column prop="duration" label="时长" width="100">
          <template #default="{ row }">
            {{ row.duration || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'">
              {{ row.status === 'published' ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatRelativeTime(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="editSection(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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
          @size-change="loadSections"
          @current-change="loadSections"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="showDialog"
      :title="isEdit ? '编辑小节' : '创建小节'"
      width="900px"
      :close-on-click-modal="false"
    >
      <el-form :model="sectionForm" :rules="rules" ref="formRef" label-width="110px">
        <el-form-item label="所属章节" prop="parentId">
          <el-select v-model="sectionForm.parentId" placeholder="请选择所属章节" style="width: 100%;">
            <el-option
              v-for="chapter in parentChapters"
              :key="chapter.id"
              :label="chapter.title"
              :value="chapter.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="小节标题" prop="title">
          <el-input v-model="sectionForm.title" placeholder="请输入小节标题" />
        </el-form-item>
        <el-form-item label="小节摘要" prop="excerpt">
          <el-input
            v-model="sectionForm.excerpt"
            type="textarea"
            :rows="2"
            placeholder="请输入摘要"
          />
        </el-form-item>
        <el-form-item label="小节内容" prop="content">
          <MarkdownEditor
            v-model="sectionForm.content"
            height="400px"
            placeholder="请输入内容（支持 Markdown）"
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="章节内排序" prop="order">
              <el-input-number v-model="sectionForm.order" :min="1" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="时长" prop="duration">
              <el-input v-model="sectionForm.duration" placeholder="如：15分钟" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="视频链接" prop="videoUrl">
              <el-input v-model="sectionForm.videoUrl" placeholder="可选：视频链接" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="sectionForm.status" style="width: 100%;">
                <el-option label="草稿" value="draft" />
                <el-option label="已发布" value="published" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormRules } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { usePagination } from '@/composables/usePagination'
import { useFilter } from '@/composables/useFilter'
import { formatRelativeTime } from '@/utils/format'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import request from '@/utils/request'

const { pagination, resetPagination, setTotal, getPaginationParams } = usePagination()

const filterForm = reactive({
  title: '',
  parentId: '',
  status: ''
})

const sections = ref<any[]>([])
const parentChapters = ref<any[]>([])
const showDialog = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const formRef = ref()
const tableRef = ref<any>()

const route = useRoute()
const router = useRouter()
const highlightedSectionId = ref<string>('')
const isJumpingToSection = ref(false)
const handledSectionId = ref<string>('')

const sectionForm = reactive({
  id: '',
  title: '',
  content: '',
  excerpt: '',
  order: 1,
  duration: '',
  videoUrl: '',
  status: 'draft',
  parentId: ''
})

const rules: FormRules = {
  parentId: [{ required: true, message: '请选择所属章节', trigger: 'change' }],
  title: [{ required: true, message: '请输入小节标题', trigger: 'blur' }]
}

const ensureSectionVisible = async (sectionId: string) => {
  if (!sectionId) return
  if (isJumpingToSection.value) return

  isJumpingToSection.value = true
  try {
    // 用一个大 limit 拿到有序 id 列表，只用于计算目标页码
    const response = await request.get('/admin/chapters', {
      params: {
        type: 'section',
        page: 1,
        limit: 5000
      }
    })

    if (!response.data.success) return

    const items = response.data.data.items || []
    const idx = items.findIndex((s: any) => s.id === sectionId)
    if (idx === -1) return

    const pageSize = pagination.size
    const targetPage = Math.floor(idx / pageSize) + 1
    if (pagination.page !== targetPage) {
      pagination.page = targetPage
    }
  } catch (error) {
    // ignore
  } finally {
    isJumpingToSection.value = false
  }
}

const loadSections = async () => {
  try {
    const sectionId = (route.query.sectionId as string) || ''

    // 如果是从章节页跳转过来，先算出该小节所在页码，避免打破分页
    if (sectionId && sectionId !== handledSectionId.value) {
      await ensureSectionVisible(sectionId)
    }

    const params: any = {
      ...getPaginationParams(),
      type: 'section'
    }

    if (filterForm.title) params.title = filterForm.title
    if (filterForm.parentId) params.parentId = filterForm.parentId
    if (filterForm.status) params.status = filterForm.status

    const response = await request.get('/admin/chapters', { params })
    if (response.data.success) {
      sections.value = response.data.data.items
      setTotal(response.data.data.total)

      if (sectionId) {
        highlightedSectionId.value = sectionId
        await nextTick()

        const targetRow = (sections.value || []).find((s: any) => s.id === sectionId)
        if (targetRow && tableRef.value) {
          tableRef.value.setCurrentRow(targetRow)
        }

        const tr = document.querySelector(
          `tr.el-table__row[data-row-key="${sectionId}"]`
        ) as HTMLElement | null
        tr?.scrollIntoView({ block: 'center' })

        // 只处理一次跳转定位，避免影响后续正常翻页
        handledSectionId.value = sectionId
        router.replace({ query: { ...route.query, sectionId: undefined } })
      }
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '加载小节列表失败')
  }
}

const rowClassName = ({ row }: any) => {
  return row.id === highlightedSectionId.value ? 'highlight-row' : ''
}

const { debouncedSearch } = useFilter({ onSearch: loadSections })

const loadParentChapters = async () => {
  try {
    const response = await request.get('/admin/chapters', {
      params: { limit: 200, type: 'chapter' }
    })
    if (response.data.success) {
      parentChapters.value = response.data.data.items
    }
  } catch (error: any) {
    console.error('加载章节列表失败:', error)
  }
}

const resetFilter = () => {
  Object.assign(filterForm, {
    title: '',
    parentId: '',
    status: ''
  })
  resetPagination()
  loadSections()
}

const createSection = () => {
  isEdit.value = false
  Object.assign(sectionForm, {
    id: '',
    title: '',
    content: '',
    excerpt: '',
    order: 1,
    duration: '',
    videoUrl: '',
    status: 'draft',
    parentId: ''
  })
  showDialog.value = true
}

const editSection = async (row: any) => {
  try {
    const response = await request.get(`/admin/chapters/${row.id}`)
    if (response.data.success) {
      const data = response.data.data
      isEdit.value = true
      Object.assign(sectionForm, {
        id: data.id,
        title: data.title,
        content: data.content || '',
        excerpt: data.excerpt || '',
        order: data.order || 1,
        duration: data.duration || '',
        videoUrl: data.videoUrl || '',
        status: data.status || 'draft',
        parentId: data.parentId || ''
      })
      showDialog.value = true
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '获取小节详情失败')
  }
}

const handleSave = async () => {
  try {
    await formRef.value.validate()

    saving.value = true

    const payload = {
      title: sectionForm.title,
      content: sectionForm.content,
      excerpt: sectionForm.excerpt,
      order: sectionForm.order,
      duration: sectionForm.duration,
      videoUrl: sectionForm.videoUrl,
      status: sectionForm.status,
      type: 'section',
      parentId: sectionForm.parentId
    }

    const url = isEdit.value ? `/admin/chapters/${sectionForm.id}` : '/admin/chapters'
    const method = isEdit.value ? 'put' : 'post'

    const response = await request[method](url, payload)

    if (response.data.success) {
      ElMessage.success(response.data.message)
      showDialog.value = false
      loadSections()
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该小节吗？', '提示', {
      type: 'warning'
    })

    const response = await request.delete(`/admin/chapters/${row.id}`)
    if (response.data.success) {
      ElMessage.success(response.data.message)
      loadSections()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

onMounted(() => {
  loadParentChapters()
  loadSections()
})

watch(
  () => route.query.sectionId,
  (newId) => {
    if (newId) {
      // 只有通过跳转携带 sectionId 时才触发定位
      loadSections()
    }
  }
)
</script>

<style scoped>
.chapter-management {
  padding: 20px;
}

.highlight-row :deep(td) {
  background: #fff7e6 !important;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.el-card {
  margin-top: 20px;
}
</style>
