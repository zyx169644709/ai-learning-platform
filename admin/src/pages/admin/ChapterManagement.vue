<template>
  <div class="chapter-management">
    <!-- 页面标题 -->
    <PageHeader title="章节与小节管理" />

    <!-- 筛选栏 -->
    <FilterBar 
      v-model="filterForm" 
      @search="loadChapters" 
      @reset="resetFilter"
    >
      <el-form-item label="章节名称">
        <el-input 
          v-model="filterForm.title" 
          placeholder="请输入章节名称" 
          clearable 
          @input="debouncedSearch"
          style="width: 200px;"
        />
      </el-form-item>
      <el-form-item label="小节名称">
        <el-input 
          v-model="filterForm.sectionTitle" 
          placeholder="请输入小节名称" 
          clearable 
          @input="debouncedSearch"
          style="width: 200px;"
        />
      </el-form-item>
      <el-form-item label="状态" style="width: 150px;">
        <el-select v-model="filterForm.status" placeholder="全部" clearable @change="debouncedSearch">
          <el-option label="草稿" value="draft" />
          <el-option label="已发布" value="published" />
        </el-select>
      </el-form-item>
      <template #extra-buttons>
        <el-button type="primary" @click="createChapter">创建章节</el-button>
        <el-button type="success" @click="createSection">创建小节</el-button>
      </template>
    </FilterBar>

    <!-- 章节列表（树形表格）-->
    <el-card>
      <el-table :data="filteredChapters" stripe row-key="id" :tree-props="{ children: 'children' }" style="table-layout: auto" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="title" label="名称" min-width="250">
          <template #default="{ row }">
            <span>{{ row.title }}</span>
            <el-tag v-if="row.type === 'chapter' && (!row.children || row.children.length === 0)" type="warning" size="small" style="margin-left: 8px;">暂无小节</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'">
              {{ row.status === 'published' ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="160" align="center" header-align="center">
          <template #default="{ row }">
            {{ formatRelativeTime(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="editItem(row)">编辑</el-button>
            <!-- 只在小节类型显示管理题目按钮 -->
            <el-button v-if="row.type === 'section'" type="success" link @click="manageSectionQuestions(row)">
              管理题目
            </el-button>
            <StatsDisplay
              mode="dialog"
              title="统计信息"
              :items="row.type === 'chapter' ? [
                { label: '小节数', value: row.childrenCount }
              ] : [
                { label: '浏览量', value: row.viewCount },
                { label: '收藏量', value: row.favoriteCount },
              ]"
            />
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

    <BatchActionBar :count="selectedChapters.length" :description="selectedDescription">
      <el-button @click="batchPublish">批量发布</el-button>
      <el-button type="danger" @click="batchDelete">批量删除</el-button>
    </BatchActionBar>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <span class="total-info">共 {{ displayTotal }} 条（含章节与小节）</span>
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="sizes, prev, pager, next, jumper"
          @size-change="loadChapters"
          @current-change="loadChapters"
        />
      </div>
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog 
      v-model="showDialog" 
      :title="dialogTitle" 
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form :model="itemForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="名称" prop="title">
          <el-input v-model="itemForm.title" :placeholder="isSection ? '请输入小节名称' : '请输入章节名称'" />
        </el-form-item>
        
        <!-- 小节特有字段 -->
        <template v-if="isSection">
          <el-form-item label="所属章节" prop="parentId">
            <el-select v-model="itemForm.parentId" placeholder="请选择所属章节" style="width: 100%;">
              <el-option v-for="chapter in parentChapters" :key="chapter.id" :label="chapter.title" :value="chapter.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="摘要" prop="excerpt">
            <el-input v-model="itemForm.excerpt" type="textarea" :rows="2" placeholder="请输入小节摘要" />
          </el-form-item>
          <el-form-item label="内容" prop="content">
            <MarkdownEditor
              v-model="itemForm.content"
              height="400px"
              placeholder="请输入小节内容（支持 Markdown）"
            />
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="时长" prop="duration">
                <el-input v-model="itemForm.duration" placeholder="如：30分钟" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="视频链接" prop="videoUrl">
                <el-input v-model="itemForm.videoUrl" placeholder="请输入视频链接" />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="编号" prop="order">
              <el-input-number v-model="itemForm.order" :min="1" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="itemForm.status" style="width: 100%;">
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormRules } from 'element-plus'
import { usePagination } from '@/composables/usePagination'
import { useFilter } from '@/composables/useFilter'
import { formatRelativeTime } from '@/utils/format'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import BatchActionBar from '@/components/BatchActionBar.vue'
import StatsDisplay from '@/components/StatsDisplay.vue'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import request from '@/utils/request'

const router = useRouter()

// 选中的章节
const selectedChapters = ref<any[]>([])


// 处理选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedChapters.value = selection
}

// 选中数量描述
const selectedDescription = computed(() => {
  const chapterCount = selectedChapters.value.filter((r: any) => r.type === 'chapter').length
  const sectionCount = selectedChapters.value.filter((r: any) => r.type === 'section').length
  if (chapterCount > 0 && sectionCount > 0) {
    return `已选择 ${chapterCount} 个章节、${sectionCount} 个小节`
  } else if (chapterCount > 0) {
    return `已选择 ${chapterCount} 个章节`
  } else {
    return `已选择 ${sectionCount} 个小节`
  }
})

// 分页
const { pagination, resetPagination, setTotal, getPaginationParams } = usePagination()
const displayTotal = ref(0)

// 筛选表单
const filterForm = reactive({
  title: '',
  sectionTitle: '',
  status: ''
})

// 数据
const chapters = ref<any[]>([])
const parentChapters = ref<any[]>([])
const showDialog = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const formRef = ref()
const currentType = ref<'chapter' | 'section'>('chapter')
const originalStatus = ref('')

// 表单
const itemForm = reactive({
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

// 计算属性
const isSection = computed(() => currentType.value === 'section')
const dialogTitle = computed(() => {
  if (isEdit.value) {
    return isSection.value ? '编辑小节' : '编辑章节'
  }
  return isSection.value ? '创建小节' : '创建章节'
})

// 过滤章节和小节
const filteredChapters = computed(() => {
  if (!filterForm.status && !filterForm.title && !filterForm.sectionTitle) {
    return chapters.value
  }
  
  return chapters.value.map(chapter => {
    // 过滤子小节
    let filteredChildren = chapter.children || []
    if (filterForm.status) {
      filteredChildren = filteredChildren.filter((child: any) => child.status === filterForm.status)
    }
    if (filterForm.sectionTitle) {
      filteredChildren = filteredChildren.filter((child: any) => 
        child.title.toLowerCase().includes(filterForm.sectionTitle.toLowerCase())
      )
    }
    
    // 检查章节是否匹配筛选条件
    const chapterMatchesStatus = !filterForm.status || chapter.status === filterForm.status
    const chapterMatchesTitle = !filterForm.title || chapter.title.toLowerCase().includes(filterForm.title.toLowerCase())

    // 有小节名称筛选时：只显示有匹配子小节的章节
    if (filterForm.sectionTitle) {
      if (filteredChildren.length > 0) {
        return { ...chapter, children: filteredChildren }
      }
      return null
    }

    // 章节本身匹配（标题+状态），显示章节及其匹配的子小节
    // 或者有匹配状态的子小节，也显示该章节
    const hasMatchingChildren = filteredChildren.length > 0
    if ((chapterMatchesStatus && chapterMatchesTitle) || hasMatchingChildren) {
      // 若章节本身不匹配状态筛选但有匹配子小节，则章节的children只保留匹配的
      return {
        ...chapter,
        children: filteredChildren
      }
    }
    return null
  }).filter(Boolean)
})

// 验证规则
const rules = computed<FormRules>(() => ({
  title: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  ...(isSection.value ? {
    parentId: [{ required: true, message: '请选择所属章节', trigger: 'change' }]
  } : {})
}))

// 加载章节列表
const loadChapters = async () => {
  try {
    // 过滤掉空字符串的查询参数
    const params: any = {
      ...getPaginationParams(),
      type: 'chapter'
    }
    // 只添加非空的筛选条件
    if (filterForm.title) params.title = filterForm.title
    if (filterForm.status) params.status = filterForm.status
    
    const response = await request.get('/admin/chapters', { params })
    
    if (response.data.success) {
      chapters.value = response.data.data.items
      displayTotal.value = response.data.data.total
      setTotal(response.data.data.chapterCount ?? response.data.data.total)
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '加载章节列表失败')
  }
}

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

// 防抖搜索
const { debouncedSearch } = useFilter({ onSearch: loadChapters })

// 重置筛选
const resetFilter = () => {
  Object.assign(filterForm, {
    title: '',
    sectionTitle: '',
    status: ''
  })
  resetPagination()
  loadChapters()
}

// 创建章节
const createChapter = () => {
  currentType.value = 'chapter'
  isEdit.value = false
  Object.assign(itemForm, {
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

// 创建小节
const createSection = () => {
  currentType.value = 'section'
  isEdit.value = false
  Object.assign(itemForm, {
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

// 编辑章节或小节
const editItem = async (row: any) => {
  try {
    const response = await request.get(`/admin/chapters/${row.id}`)
    
    if (response.data.success) {
      const data = response.data.data
      currentType.value = data.type || 'chapter'
      isEdit.value = true
      originalStatus.value = data.status || 'draft'
      Object.assign(itemForm, {
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
    ElMessage.error(error.response?.data?.message || '获取详情失败')
  }
}

// 保存
const handleSave = async () => {
  try {
    await formRef.value.validate()
    
    saving.value = true
    
    const url = isEdit.value ? `/admin/chapters/${itemForm.id}` : '/admin/chapters'
    const method = isEdit.value ? 'put' : 'post'

    const payload: any = {
      title: itemForm.title,
      order: itemForm.order,
      status: itemForm.status,
      type: currentType.value
    }

    if (currentType.value === 'section') {
      payload.content = itemForm.content
      payload.excerpt = itemForm.excerpt
      payload.duration = itemForm.duration
      payload.videoUrl = itemForm.videoUrl
      payload.parentId = itemForm.parentId
    } else {
      payload.parentId = null
    }

    // 章节状态发生变化时，询问是否同步子小节
    if (
      isEdit.value &&
      currentType.value === 'chapter' &&
      itemForm.status !== originalStatus.value
    ) {
      const statusLabel = itemForm.status === 'published' ? '已发布' : '草稿'
      try {
        await ElMessageBox.confirm(
          `是否将该章节下的所有小节状态也同步更改为「${statusLabel}」？`,
          '同步子小节状态',
          {
            confirmButtonText: '同步更改',
            cancelButtonText: '仅更改章节',
            type: 'info'
          }
        )
        payload.cascadeStatus = true
      } catch {
        payload.cascadeStatus = false
      }
    }
    
    const response = await request[method](url, payload)
    
    if (response.data.success) {
      ElMessage.success(response.data.message)
      showDialog.value = false
      loadChapters()
      if (currentType.value === 'chapter') {
        loadParentChapters()
      }
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '保存失败')
    }
  } finally {
    saving.value = false
  }
}

// 删除
const handleDelete = async (row: any) => {
  try {
    const message = row.type === 'chapter'
      ? `确定要删除该章节吗？该章节下的所有小节也将被一并删除，此操作不可恢复！`
      : `确定要删除该小节吗？`
    await ElMessageBox.confirm(message, '删除确认', {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消'
    })
    
    const response = await request.delete(`/admin/chapters/${row.id}`)
    
    if (response.data.success) {
      ElMessage.success(response.data.message)
      loadChapters()
      if (row.type === 'chapter') {
        loadParentChapters()
      }
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

// 管理小节题目
const manageSectionQuestions = (row: any) => {
  // 跳转到题目管理页面，并带上小节ID作为筛选条件
  router.push({
    path: '/admin/quiz-management',
    query: {
      chapterId: row.id,
      chapterTitle: row.title
    }
  })
}

// 批量删除
const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedChapters.value.length} 个内容吗？此操作不可恢复！`,
      '批量删除确认',
      {
        type: 'warning',
        confirmButtonText: '确认删除',
        cancelButtonText: '取消'
      }
    )
    
    const chapterIds = selectedChapters.value.map(chapter => chapter.id)
    const response = await request.post('/admin/chapters/batch-delete', { chapterIds })
    
    if (response.data.success) {
      ElMessage.success(`成功删除 ${response.data.data?.deletedCount} 个章节`)
      selectedChapters.value = []
      loadChapters()
      loadParentChapters()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '批量删除失败')
    }
  }
}

// 批量发布
const batchPublish = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要发布选中的 ${selectedChapters.value.length} 个章节吗？`,
      '批量发布确认',
      {
        type: 'warning',
        confirmButtonText: '确认发布',
        cancelButtonText: '取消'
      }
    )
    
    const chapterIds = selectedChapters.value.map(chapter => chapter.id)
    const response = await request.post('/admin/chapters/batch-publish', { chapterIds })
    
    if (response.data.success) {
      ElMessage.success(`成功发布 ${response.data.data?.publishedCount} 个章节`)
      selectedChapters.value = []
      loadChapters()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '批量发布失败')
    }
  }
}

// 初始化
onMounted(() => {
  loadParentChapters()
  loadChapters()
})
</script>

<style scoped>
.chapter-management {
  padding: 20px;
}

.pagination-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 12px;
}

.total-info {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.el-card {
  margin-top: 20px;
}


/* 表格对齐优化 */
:deep(.el-table) {
  --el-table-border-color: #ebeef5;
}

:deep(.el-table th.el-table__cell) {
  background-color: #f5f7fa !important;
  padding: 12px 8px !important;
}

:deep(.el-table td.el-table__cell) {
  padding: 12px 8px !important;
}

/* 确保文本完全对齐 */
:deep(.el-table .cell) {
  padding: 0 4px;
  word-break: break-word;
}

/* 选择列居中对齐 */
:deep(.el-table .el-table__cell:nth-child(1)) {
  text-align: center !important;
  padding: 12px 0 !important;
}

:deep(.el-table th.el-table__cell:nth-child(1)) {
  text-align: center !important;
  padding: 12px 0 !important;
}

/* 名称列左对齐 */
:deep(.el-table .el-table__cell:nth-child(2)) {
  text-align: left !important;
}

:deep(.el-table th.el-table__cell:nth-child(2)) {
  text-align: left !important;
}

/* 其他列居中对齐 */
:deep(.el-table .el-table__cell:not(:nth-child(1)):not(:nth-child(2)):not(:last-child)) {
  text-align: center !important;
}

:deep(.el-table th.el-table__cell:not(:nth-child(1)):not(:nth-child(2)):not(:last-child)) {
  text-align: center !important;
}

/* 操作列左对齐 */
:deep(.el-table .el-table__cell:last-child) {
  text-align: left !important;
  padding-left: 12px !important;
}

:deep(.el-table th.el-table__cell:last-child) {
  text-align: left !important;
  padding-left: 12px !important;
}

/* 操作列按钮间距 */
:deep(.el-table .el-table__cell:last-child .el-button) {
  margin-right: 8px;
}

:deep(.el-table .el-table__cell:last-child .el-button:last-child) {
  margin-right: 0;
}
</style>
