<template>
  <div class="content-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>内容管理</h1>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin' }">管理后台</el-breadcrumb-item>
        <el-breadcrumb-item>内容管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 筛选栏 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="课程类型">
          <el-select v-model="filterForm.type" placeholder="全部" clearable>
            <el-option label="基础课程" value="basic" />
            <el-option label="进阶课程" value="advanced" />
            <el-option label="实战项目" value="project" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部" clearable>
            <el-option label="已发布" value="published" />
            <el-option label="草稿" value="draft" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadCourses">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

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
        <el-table-column prop="students" label="学习人数" width="120" />
        <el-table-column prop="completionRate" label="完成率" width="100">
          <template #default="{ row }">
            {{ row.completionRate }}%
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="editCourse(row)">编辑</el-button>
            <el-button type="warning" link @click="viewStats(row)">统计</el-button>
            <el-dropdown @command="(cmd: string) => handleCommand(cmd, row)">
              <el-button type="info" link>
                更多<el-icon><ArrowDown /></el-icon>
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
            <el-option label="基础课程" value="basic" />
            <el-option label="进阶课程" value="advanced" />
            <el-option label="实战项目" value="project" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程描述" prop="description">
          <el-input
            v-model="courseForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入课程描述"
          />
        </el-form-item>
        <el-form-item label="课程内容" prop="content">
          <el-input
            v-model="courseForm.content"
            type="textarea"
            :rows="10"
            placeholder="请输入课程内容（支持 Markdown）"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="courseForm.status">
            <el-radio label="draft">草稿</el-radio>
            <el-radio label="published">发布</el-radio>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

// 筛选表单
const filterForm = reactive({
  type: '',
  status: ''
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 课程列表
const courses = ref([
  {
    id: 1,
    title: 'Vue 3 基础教程',
    type: 'basic',
    status: 'published',
    students: 1234,
    completionRate: 78,
    updatedAt: '2024-02-08 14:30'
  },
  {
    id: 2,
    title: 'Vue Router 进阶',
    type: 'advanced',
    status: 'published',
    students: 567,
    completionRate: 65,
    updatedAt: '2024-02-07 16:20'
  },
  {
    id: 3,
    title: 'Vue 实战项目',
    type: 'project',
    status: 'draft',
    students: 0,
    completionRate: 0,
    updatedAt: '2024-02-06 10:15'
  }
])

// 对话框状态
const showCreateDialog = ref(false)
const editingCourse = ref<any>(null)
const saving = ref(false)

// 课程表单
const courseForm = reactive({
  title: '',
  type: '',
  description: '',
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
  description: [
    { required: true, message: '请输入课程描述', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入课程内容', trigger: 'blur' }
  ]
}

const courseFormRef = ref<FormInstance>()

// 类型标签样式
const getTypeTagType = (type: string) => {
  const map: Record<string, string> = {
    basic: 'success',
    advanced: 'warning',
    project: 'danger'
  }
  return map[type] || ''
}

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    basic: '基础课程',
    advanced: '进阶课程',
    project: '实战项目'
  }
  return map[type] || ''
}

// 状态标签样式
const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    published: 'success',
    draft: 'warning',
    archived: 'info'
  }
  return map[status] || ''
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    published: '已发布',
    draft: '草稿',
    archived: '已归档'
  }
  return map[status] || ''
}

// 加载课程列表
const loadCourses = async () => {
  try {
    // TODO: 调用实际 API
    // const response = await axios.get('/api/admin/courses', {
    //   params: { ...filterForm, ...pagination }
    // })
    // courses.value = response.data.items
    // pagination.total = response.data.total
  } catch (error) {
    ElMessage.error('加载课程列表失败')
  }
}

// 重置筛选
const resetFilter = () => {
  filterForm.type = ''
  filterForm.status = ''
  pagination.page = 1
  loadCourses()
}

// 编辑课程
const editCourse = (course: any) => {
  editingCourse.value = course
  Object.assign(courseForm, course)
  showCreateDialog.value = true
}

// 查看统计
const viewStats = (course: any) => {
  ElMessage.info(`查看《${course.title}》的统计数据`)
}

// 处理更多操作
const handleCommand = async (command: string, course: any) => {
  switch (command) {
    case 'duplicate':
      ElMessage.success(`复制《${course.title}》成功`)
      break
    case 'export':
      ElMessage.info('导出功能开发中...')
      break
    case 'archive':
      try {
        await ElMessageBox.confirm('确定要归档该课程吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        ElMessage.success('归档成功')
        loadCourses()
      } catch {
        // 用户取消
      }
      break
    case 'restore':
      ElMessage.success('恢复成功')
      loadCourses()
      break
    case 'delete':
      try {
        await ElMessageBox.confirm('确定要删除该课程吗？此操作不可恢复！', '警告', {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'error'
        })
        ElMessage.success('删除成功')
        loadCourses()
      } catch {
        // 用户取消
      }
      break
  }
}

// 保存课程
const saveCourse = async () => {
  if (!courseFormRef.value) return
  
  try {
    await courseFormRef.value.validate()
    saving.value = true
    
    // TODO: 调用实际 API
    // if (editingCourse.value) {
    //   await axios.put(`/api/admin/courses/${editingCourse.value.id}`, courseForm)
    // } else {
    //   await axios.post('/api/admin/courses', courseForm)
    // }
    
    ElMessage.success(editingCourse.value ? '保存成功' : '创建成功')
    showCreateDialog.value = false
    loadCourses()
    
    // 重置表单
    courseFormRef.value.resetFields()
    editingCourse.value = null
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
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
</style>
