<template>
  <div class="content-management">
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
      <template #extra-buttons>
        <el-button type="warning" @click="publishAll" :loading="publishing">一键发布</el-button>
        <el-button type="success" @click="createCourse">创建课程</el-button>
      </template>
    </FilterBar>

    <!-- 课程列表 -->
    <el-card>
      <el-table :data="courses" stripe>
        <el-table-column prop="title" label="课程标题" min-width="200" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="favoriteCount" label="收藏量" width="100" align="center">
          <template #default="{ row }">
            {{ row.favoriteCount || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="url" label="URL" min-width="200">
          <template #default="{ row }">
            <el-link v-if="row.url" :href="row.url" target="_blank" type="primary">
              {{ row.url.length > 30 ? row.url.substring(0, 30) + '...' : row.url }}
            </el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatRelativeTime(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="editCourse(row)">编辑</el-button>
            <el-button type="warning" link @click="viewStats(row)">统计</el-button>
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

    <!-- 统计弹窗 -->
    <el-dialog v-model="showStatsDialog" title="课程统计" width="420px">
      <div class="stats-grid" v-if="statsCourse">
        <div class="stats-item">
          <div class="stats-value">{{ statsCourse.students || 0 }}</div>
          <div class="stats-label">学习人数</div>
        </div>
        <div class="stats-item">
          <div class="stats-value">{{ statsCourse.viewCount || 0 }}</div>
          <div class="stats-label">浏览量</div>
        </div>
        <div class="stats-item">
          <div class="stats-value">{{ statsCourse.completionRate || 0 }}%</div>
          <div class="stats-label">完成率</div>
        </div>
      </div>
    </el-dialog>

    <!-- 创建/编辑课程对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingCourse ? '编辑课程' : '创建课程'"
      width="800px"
    >
      <el-form :model="courseForm" :rules="courseRules" ref="courseFormRef" label-width="100px">
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
import { ElMessage } from 'element-plus'
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
import ExportData from '@/components/ExportData.vue'

// 使用分页 composable
const { pagination, resetPagination, setTotal, getPaginationParams } = usePagination()

// 使用确认对话框 composable
const { confirmDelete, confirmArchive } = useConfirm()

// 使用 CRUD composable
const {
  items: courses,
  filterForm,
  showEditDialog: showCreateDialog,
  editingItem: editingCourse,
  saving,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formRef: courseFormRef,
  loadItems,
  editItem,
  saveItem,
  deleteItem
} = useCrud({
  apiPath: '/admin/courses',
  resourceName: '课程',
  filterFields: ['title', 'type']
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

// 查看统计
const showStatsDialog = ref(false)
const statsCourse = ref<any>(null)
const viewStats = (course: any) => {
  statsCourse.value = course
  showStatsDialog.value = true
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
  { label: '类型', value: 'type' },
  { label: '状态', value: 'status' },
  { label: 'URL', value: 'url' },
  { label: '时长', value: 'duration' },
  { label: '封面', value: 'cover' },
  { label: '内容', value: 'content' },
  { label: '浏览量', value: 'viewCount' },
  { label: '学习人数', value: 'students' },
  { label: '更新时间', value: 'updatedAt' }
]

// 一键发布所有草稿课程
const publishing = ref(false)
const publishAll = async () => {
  try {
    publishing.value = true
    const response = await request.post('/admin/courses/publish-all')
    if (response.data.success) {
      ElMessage.success(response.data.message || '发布成功')
      loadCourses()
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '发布失败')
  } finally {
    publishing.value = false
  }
}

// 保存课程
const saveCourse = async () => {
  await saveItem(courseForm, loadCourses)
}

onMounted(() => {
  loadCourses()
})
</script>

<style scoped>
.content-management {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  text-align: center;
  padding: 20px 0;
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.stats-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--el-color-primary);
}

.stats-label {
  font-size: 14px;
  color: #909399;
}
</style>
