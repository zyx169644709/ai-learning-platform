<template>
  <div class="user-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>用户管理</h1>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin' }">管理后台</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 筛选栏 -->
    <el-card class="filter-card">
      <el-form :model="filterForm" inline>
        <el-form-item label="用户角色">
          <el-select v-model="filterForm.role" placeholder="全部" clearable>
            <el-option label="学生" value="student" />
            <el-option label="教师" value="teacher" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="注册时间">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="学习状态">
          <el-select v-model="filterForm.status" placeholder="全部" clearable>
            <el-option label="学习中" value="learning" />
            <el-option label="已完成" value="completed" />
            <el-option label="未开始" value="not_started" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadUsers">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户列表 -->
    <el-card>
      <el-table :data="users" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="用户" min-width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="40" :src="row.avatar" />
              <div class="user-details">
                <div class="user-name">{{ row.name }}</div>
                <div class="user-email">{{ row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="学习进度" width="150">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="6" />
          </template>
        </el-table-column>
        <el-table-column prop="completedCourses" label="完成课程" width="100" />
        <el-table-column prop="lastLogin" label="最后登录" width="180" />
        <el-table-column prop="registeredAt" label="注册时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewUser(row)">查看</el-button>
            <el-button type="warning" link @click="editUser(row)">编辑</el-button>
            <el-dropdown @command="(cmd: string) => handleCommand(cmd, row)">
              <el-button type="info" link>
                更多<el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="resetPassword">重置密码</el-dropdown-item>
                  <el-dropdown-item command="changeRole">修改角色</el-dropdown-item>
                  <el-dropdown-item command="sendNotification">发送通知</el-dropdown-item>
                  <el-dropdown-item command="disable" v-if="row.status !== 'disabled'" divided>
                    禁用账号
                  </el-dropdown-item>
                  <el-dropdown-item command="enable" v-if="row.status === 'disabled'">
                    启用账号
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批量操作 -->
      <div class="batch-actions" v-if="selectedUsers.length > 0">
        <span class="selected-info">已选择 {{ selectedUsers.length }} 个用户</span>
        <el-button type="primary" @click="batchSendNotification">批量发送通知</el-button>
        <el-button type="warning" @click="batchExport">批量导出</el-button>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadUsers"
          @current-change="loadUsers"
        />
      </div>
    </el-card>

    <!-- 用户详情对话框 -->
    <el-dialog v-model="showUserDialog" title="用户详情" width="800px">
      <div v-if="selectedUser" class="user-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">{{ selectedUser.name }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ selectedUser.email }}</el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag :type="getRoleTagType(selectedUser.role)">
              {{ getRoleLabel(selectedUser.role) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ selectedUser.registeredAt }}</el-descriptions-item>
          <el-descriptions-item label="最后登录">{{ selectedUser.lastLogin }}</el-descriptions-item>
          <el-descriptions-item label="学习进度">
            <el-progress :percentage="selectedUser.progress" />
          </el-descriptions-item>
        </el-descriptions>

        <h3 style="margin-top: 20px;">学习记录</h3>
        <el-table :data="selectedUser.courses" size="small">
          <el-table-column prop="title" label="课程名称" />
          <el-table-column prop="progress" label="进度" width="100">
            <template #default="{ row }">
              {{ row.progress }}%
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'completed' ? 'success' : 'warning'">
                {{ row.status === 'completed' ? '已完成' : '学习中' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="completedAt" label="完成时间" />
        </el-table>
      </div>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑用户" width="600px">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="用户名" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="editForm.role">
            <el-option label="学生" value="student" />
            <el-option label="教师" value="teacher" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveUser" :loading="saving">保存</el-button>
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
  role: '',
  dateRange: [],
  status: ''
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 用户列表
const users = ref([
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    avatar: '',
    role: 'student',
    progress: 75,
    completedCourses: 3,
    lastLogin: '2024-02-08 14:30',
    registeredAt: '2024-01-15 10:20',
    courses: [
      { title: 'Vue 3 基础', progress: 100, status: 'completed', completedAt: '2024-02-01' },
      { title: 'Vue Router', progress: 60, status: 'learning', completedAt: '' }
    ]
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    avatar: '',
    role: 'teacher',
    progress: 100,
    completedCourses: 10,
    lastLogin: '2024-02-08 09:15',
    registeredAt: '2023-12-20 14:30',
    courses: []
  }
])

// 选中的用户
const selectedUsers = ref<any[]>([])

// 对话框状态
const showUserDialog = ref(false)
const showEditDialog = ref(false)
const selectedUser = ref<any>(null)
const saving = ref(false)

// 编辑表单
const editForm = reactive({
  id: '',
  name: '',
  email: '',
  role: ''
})

// 表单验证规则
const editRules: FormRules = {
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

const editFormRef = ref<FormInstance>()

// 角色标签样式
const getRoleTagType = (role: string) => {
  const map: Record<string, string> = {
    student: 'primary',
    teacher: 'success',
    admin: 'danger'
  }
  return map[role] || ''
}

const getRoleLabel = (role: string) => {
  const map: Record<string, string> = {
    student: '学生',
    teacher: '教师',
    admin: '管理员'
  }
  return map[role] || ''
}

// 加载用户列表
const loadUsers = async () => {
  try {
    // TODO: 调用实际 API
    // const response = await axios.get('/api/admin/users', {
    //   params: { ...filterForm, ...pagination }
    // })
    // users.value = response.data.items
    // pagination.total = response.data.total
  } catch (error) {
    ElMessage.error('加载用户列表失败')
  }
}

// 重置筛选
const resetFilter = () => {
  filterForm.role = ''
  filterForm.dateRange = []
  filterForm.status = ''
  pagination.page = 1
  loadUsers()
}

// 处理选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedUsers.value = selection
}

// 查看用户详情
const viewUser = (user: any) => {
  selectedUser.value = user
  showUserDialog.value = true
}

// 编辑用户
const editUser = (user: any) => {
  Object.assign(editForm, user)
  showEditDialog.value = true
}

// 处理更多操作
const handleCommand = async (command: string, user: any) => {
  switch (command) {
    case 'resetPassword':
      try {
        await ElMessageBox.confirm('确定要重置该用户的密码吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        ElMessage.success('密码重置成功，新密码已发送到用户邮箱')
      } catch {
        // 用户取消
      }
      break
    case 'changeRole':
      editUser(user)
      break
    case 'sendNotification':
      ElMessage.info('发送通知功能开发中...')
      break
    case 'disable':
      try {
        await ElMessageBox.confirm('确定要禁用该账号吗？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        ElMessage.success('账号已禁用')
        loadUsers()
      } catch {
        // 用户取消
      }
      break
    case 'enable':
      ElMessage.success('账号已启用')
      loadUsers()
      break
  }
}

// 保存用户
const saveUser = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    saving.value = true
    
    // TODO: 调用实际 API
    // await axios.put(`/api/admin/users/${editForm.id}`, editForm)
    
    ElMessage.success('保存成功')
    showEditDialog.value = false
    loadUsers()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

// 批量发送通知
const batchSendNotification = () => {
  ElMessage.info(`给 ${selectedUsers.value.length} 个用户发送通知`)
}

// 批量导出
const batchExport = () => {
  ElMessage.info(`导出 ${selectedUsers.value.length} 个用户的数据`)
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.user-management {
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

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 500;
  color: #303133;
}

.user-email {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.batch-actions {
  margin-top: 20px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-info {
  color: #606266;
  font-size: 14px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.user-detail {
  max-height: 500px;
  overflow-y: auto;
}
</style>
