<template>
  <div class="course-management">
    <!-- 页面标题 -->
    <PageHeader title="课程管理" />

    <!-- 筛选栏 -->
    <FilterBar 
      v-model="filterForm" 
      @search="loadCourses" 
      @reset="resetFilter"
    >
      <el-form-item label="课程标题">
        <el-input 
          v-model="filterForm.title" 
          placeholder="请输入课程标题" 
          clearable 
          @input="debouncedSearch"
          style="width: 200px;"
        />
      </el-form-item>
      <el-form-item label="课程类型" style="width: 180px;">
        <el-select v-model="filterForm.type" placeholder="全部" clearable @change="debouncedSearch">
          <el-option label="基础课程" value="beginner" />
          <el-option label="进阶课程" value="intermediate" />
          <el-option label="高级课程" value="advanced" />
        </el-select>
      </el-form-item>
      <el-form-item label="课程状态" style="width: 180px;">
        <el-select v-model="filterForm.status" placeholder="全部" clearable @change="debouncedSearch">
          <el-option label="草稿" value="draft" />
          <el-option label="已发布" value="published" />
          <el-option label="已归档" value="archived" />
        </el-select>
      </el-form-item>
      <template #extra-buttons>
        <el-button type="success" @click="createCourse">创建课程</el-button>
      </template>
    </FilterBar>

    <!-- 课程列表 -->
    <el-card>
      <el-table :data="courses" stripe style="table-layout: auto" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="title" label="课程标题" min-width="250" />
        <el-table-column prop="type" label="类型" width="90" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="URL" width="200" align="center" header-align="center">
          <template #default="{ row }">
            <el-link v-if="row.url" :href="row.url" target="_blank" type="primary" :title="row.url" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;">
              {{ row.url.length > 30 ? row.url.substring(0, 30) + '...' : row.url }}
            </el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="160" align="center" header-align="center">
          <template #default="{ row }">
            {{ formatRelativeTime(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="editCourse(row)">编辑</el-button>
            <StatsDisplay
              mode="dialog"
              title="课程统计"
              :items="[
                { label: '学习人数', value: row.students },
                { label: '浏览量', value: row.viewCount },
                { label: '收藏量', value: row.favoriteCount },
                { label: '完成率', value: (row.completionRate ?? 0) + '%' }
              ]"
            />
            <el-dropdown @command="(cmd: string) => handleCommand(cmd, row)" trigger="click">
              <el-button type="primary" link class="el-dropdown-link">
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="duplicate">复制课程</el-dropdown-item>
                  <el-dropdown-item command="export">导出数据</el-dropdown-item>
                  <el-dropdown-item command="archive" v-if="row.status !== 'archived'">归档</el-dropdown-item>
                  <el-dropdown-item command="restore" v-if="row.status === 'archived'">恢复</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

    <BatchActionBar :count="selectedCourses.length" label="课程">
      <el-button @click="batchPublish">批量发布</el-button>
      <el-button @click="batchExport">批量导出</el-button>
      <el-button type="danger" @click="batchDelete">批量删除</el-button>
    </BatchActionBar>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadCourses"
          @current-change="loadCourses"
        />
      </div>
    </el-card>


    <!-- 创建/编辑课程对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingCourse ? '编辑课程' : '创建课程'"
      width="800px"
    >
      <el-form :model="courseForm" :rules="courseRules" ref="formRef" label-width="100px">
        <el-form-item label="课程标题" prop="title">
          <el-input v-model="courseForm.title" placeholder="请输入课程标题" />
        </el-form-item>
        <el-form-item label="课程类型" prop="type">
          <el-select v-model="courseForm.type" placeholder="请选择课程类型">
            <el-option label="基础课程" value="beginner" />
            <el-option label="进阶课程" value="intermediate" />
            <el-option label="高级课程" value="advanced" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程链接" prop="url">
          <el-input v-model="courseForm.url" placeholder="请输入课程链接（如B站视频链接）" />
        </el-form-item>
        <el-form-item label="课程时长" prop="duration">
          <el-input v-model="courseForm.duration" placeholder="例如：2小时、10周" />
        </el-form-item>
        <el-form-item label="课程封面" prop="cover">
          <ImageUpload v-model="courseForm.cover" />
        </el-form-item>
        <el-form-item label="课程内容" prop="content">
          <el-input
            v-model="courseForm.content"
            type="textarea"
            :rows="10"
            placeholder="请输入课程内容（支持 Markdown）"
          />
        </el-form-item>
        <el-form-item label="课程状态" prop="status">
          <el-radio-group v-model="courseForm.status">
            <el-radio value="draft">草稿</el-radio>
            <el-radio value="published">发布</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="saveCourse" :loading="saving">
          {{ editingCourse ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 导出数据弹窗 -->
    <ExportData
      v-model="showExportDialog"
      :data="exportCourse"
      :item-name="exportCourse?.title || '课程'"
      :fields="exportFields"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import type { FormRules } from 'element-plus'
import { usePagination } from '@/composables/usePagination'
import { useConfirm } from '@/composables/useConfirm'
import { useCrud } from '@/composables/useCrud'
import { useFilter } from '@/composables/useFilter'
import { getCourseTypeTag, getCourseTypeLabel, getCourseStatusTag, getCourseStatusLabel } from '@/utils/enums'
import { formatRelativeTime } from '@/utils/format'
import ImageUpload from '@/components/ImageUpload.vue'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import BatchActionBar from '@/components/BatchActionBar.vue'
import ExportData from '@/components/ExportData.vue'
import StatsDisplay from '@/components/StatsDisplay.vue'

// 使用分页 composable
const { pagination, resetPagination, setTotal, getPaginationParams } = usePagination()

// 使用确认对话框 composable
const { confirmDelete, confirmArchive } = useConfirm()

// 选中的课程
const selectedCourses = ref<any[]>([])

// 处理选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedCourses.value = selection
}

// 使用 CRUD composable
const {
  items: courses,
  filterForm,
  showEditDialog: showCreateDialog,
  editingItem: editingCourse,
  saving,
  formRef,
  loadItems,
  editItem,
  saveItem,
  deleteItem
} = useCrud({
  apiPath: '/admin/courses',
  resourceName: '课程',
  filterFields: ['title', 'type', 'status']
})

// 课程表单
const courseForm = reactive({
  title: '',
  type: '',
  url: '',
  duration: '',
  cover: '',
  content: '',
  status: 'draft'
})

// 表单验证规则
const courseRules: FormRules = {
  title: [
    { required: true, message: '请输入课程标题', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择课程类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入课程内容', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择课程状态', trigger: 'change' }
  ]
}

// 使用枚举工具函数
const getTypeTagType = getCourseTypeTag
const getTypeLabel = getCourseTypeLabel
const getStatusTagType = getCourseStatusTag
const getStatusLabel = getCourseStatusLabel

// 加载课程列表
const loadCourses = async () => {
  const result = await loadItems(getPaginationParams())
  setTotal(result.total)
}

// 使用筛选 composable
const { debouncedSearch } = useFilter({
  onSearch: () => {
    resetPagination()
    loadCourses()
  }
})

// 重置筛选
const resetFilter = () => {
  filterForm.title = ''
  filterForm.type = ''
  filterForm.status = ''
  resetPagination()
  loadCourses()
}

// 创建课程
const createCourse = () => {
  editItem(null, courseForm)
}

// 编辑课程
const editCourse = (course: any) => {
  // 先重置表单为默认值
  courseForm.title = ''
  courseForm.type = ''
  courseForm.url = ''
  courseForm.duration = ''
  courseForm.cover = ''
  courseForm.content = ''
  courseForm.status = 'draft'
  
  // 然后用 course 数据填充（只合并有值的字段）
  editItem(course, courseForm)
}


// 处理更多操作
const handleCommand = async (command: string, course: any) => {
  switch (command) {
    case 'duplicate':
      try {
        const dupRes = await request.post(`/admin/courses/${course.id}/duplicate`)
        if (dupRes.data.success) {
          ElMessage.success(dupRes.data.message || '复制成功')
          loadCourses()
        }
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || '复制失败')
      }
      break
    case 'export':
      exportCourse.value = course
      showExportDialog.value = true
      break
    case 'archive':
      if (await confirmArchive(`《${course.title}》`)) {
        try {
          const response = await request.put(`/admin/courses/${course.id}`, {
            status: 'archived'
          })
          if (response.data.success) {
            ElMessage.success('归档成功')
            loadCourses()
          }
        } catch (error: any) {
          ElMessage.error(error.response?.data?.message || '归档失败')
        }
      }
      break
    case 'restore':
      try {
        const response = await request.put(`/admin/courses/${course.id}`, {
          status: 'published'
        })
        if (response.data.success) {
          ElMessage.success('恢复成功')
          loadCourses()
        }
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || '恢复失败')
      }
      break
    case 'delete':
      if (await confirmDelete(`《${course.title}》`)) {
        await deleteItem(course.id, loadCourses)
      }
      break
  }
}

// 导出数据
const showExportDialog = ref(false)
const exportCourse = ref<any>(null)
const exportFields = [
  { label: '课程标题', value: 'title' },
  { label: '难度等级', value: 'level' },
  { label: '状态', value: 'status' },
  { label: 'URL', value: 'url' },
  { label: '时长', value: 'duration' },
  { label: '内容', value: 'content' },
  { label: '浏览量', value: 'viewCount' },
  { label: '学习人数', value: 'students' },
  { label: '收藏量', value: 'favoriteCount' },
  { label: '完成率', value: 'completionRate' },
  { label: '创建时间', value: 'createdAt' },
  { label: '更新时间', value: 'updatedAt' }
]

// 保存课程
const saveCourse = async () => {
  if (!formRef.value) return
  await saveItem(courseForm, loadCourses)
}

// 批量删除
const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedCourses.value.length} 个课程吗？此操作不可恢复！`,
      '批量删除确认',
      {
        type: 'warning',
        confirmButtonText: '确认删除',
        cancelButtonText: '取消'
      }
    )
    
    const courseIds = selectedCourses.value.map(course => course.id)
    const response = await request.post('/admin/courses/batch-delete', { courseIds })
    
    if (response.data.success) {
      ElMessage.success(`成功删除 ${response.data.data?.deletedCount} 个课程`)
      selectedCourses.value = []
      loadCourses()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '批量删除失败')
    }
  }
}

// 批量导出
const batchExport = () => {
  if (selectedCourses.value.length === 0) {
    ElMessage.warning('请先选择要导出的课程')
    return
  }
  exportCourse.value = {
    exportType: 'course-batch',
    courses: selectedCourses.value,
    courseIds: selectedCourses.value.map(course => course.id)
  }
  showExportDialog.value = true
}

// 批量发布
const batchPublish = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要发布选中的 ${selectedCourses.value.length} 个课程吗？`,
      '批量发布确认',
      {
        type: 'warning',
        confirmButtonText: '确认发布',
        cancelButtonText: '取消'
      }
    )
    
    const courseIds = selectedCourses.value.map(course => course.id)
    const response = await request.post('/admin/courses/batch-publish', { courseIds })
    
    if (response.data.success) {
      ElMessage.success(`成功发布 ${response.data.data?.publishedCount} 个课程`)
      selectedCourses.value = []
      loadCourses()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '批量发布失败')
    }
  }
}

onMounted(() => {
  loadCourses()
})
</script>

<style scoped>
.course-management {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.filter-card {
  margin-bottom: 20px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}


.el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: inline-flex;
  align-items: center;
  font-size: var(--el-font-size-base);
  line-height: var(--el-component-size-small);
  height: var(--el-component-size-small);
  padding: 0;
  margin-left: 10px;
  vertical-align: baseline;
  transition: color 0.3s;
}

.el-dropdown-link:hover {
  color: var(--el-color-primary-light-3);
}

.el-dropdown-link .el-icon--right {
  margin-left: 2px;
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

/* 标题列左对齐 */
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

:deep(.el-table .el-table__cell:last-child .el-dropdown) {
  margin-left: 0;
}
</style>
