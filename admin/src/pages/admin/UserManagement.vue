<template>
  <div class="user-management">
    <!-- 页面标题 -->
    <PageHeader title="用户管理" />

    <!-- 筛选栏 -->
    <FilterBar 
      v-model="filterForm" 
      @search="loadUsers" 
      @reset="resetFilter"
    >
      <el-form-item label="用户名">
        <el-input 
          v-model="filterForm.name" 
          placeholder="请输入用户名" 
          clearable 
          @input="debouncedSearch"
          style="width: 200px;"
        />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input 
          v-model="filterForm.email" 
          placeholder="请输入邮箱" 
          clearable 
          @input="debouncedSearch"
          style="width: 200px;"
        />
      </el-form-item>
      <el-form-item label="用户角色" style="width: 180px;">
        <el-select v-model="filterForm.role" placeholder="全部" clearable @change="debouncedSearch">
          <el-option label="学生" value="USER" />
          <el-option label="教师" value="MODERATOR" />
          <el-option label="管理员" value="ADMIN" />
        </el-select>
      </el-form-item>
    </FilterBar>

    <!-- 用户列表 -->
    <el-card>
      <el-table :data="users" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="用户（头像/用户名/邮箱）" min-width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="40" :src="row.avatar || defaultAvatar" />
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
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewUser(row)">查看</el-button>
            <el-button type="warning" link @click="editUser(row)">编辑</el-button>
            <el-dropdown @command="(cmd: string) => handleCommand(cmd, row)" trigger="click">
              <el-button type="primary" link class="el-dropdown-link">
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
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
                  <el-dropdown-item command="delete" divided v-if="row.role !== 'ADMIN'">
                    删除用户
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
          <el-descriptions-item label="完成课程">{{ selectedUser.completedCourses || 0 }} 门</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ formatRelativeTime(selectedUser.registeredAt) || '暂无数据' }}</el-descriptions-item>
          <el-descriptions-item label="最后登录">{{ formatRelativeTime(selectedUser.lastLogin) || '暂无数据' }}</el-descriptions-item>
          <el-descriptions-item label="学习进度" :span="2">
            <el-progress :percentage="selectedUser.progress || 0" />
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
            <el-option label="学生" value="USER" />
            <el-option label="教师" value="MODERATOR" />
            <el-option label="管理员" value="ADMIN" />
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
import { reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import type { FormRules } from 'element-plus'
import { usePagination } from '@/composables/usePagination'
import { useConfirm } from '@/composables/useConfirm'
import { useCrud } from '@/composables/useCrud'
import { useTableActions } from '@/composables/useTableActions'
import { useFilter } from '@/composables/useFilter'
import { getRoleTagType, getRoleLabel } from '@/utils/enums'
import { formatRelativeTime } from '@/utils/format'
import defaultAvatar from '@/assets/images/default.png'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'

// 使用分页 composable
const { pagination, resetPagination, setTotal, getPaginationParams } = usePagination()

// 使用确认对话框 composable
const { confirmDelete, confirmDisable, confirmResetPassword } = useConfirm()

// 使用 CRUD composable
const {
  items: users,
  filterForm,
  showViewDialog: showUserDialog,
  showEditDialog,
  selectedItem: selectedUser,
  saving,
  loadItems,
  viewItem: viewUser,
  editItem,
  saveItem,
  deleteItem
} = useCrud({
  apiPath: '/admin/users',
  resourceName: '用户',
  filterFields: ['name', 'email', 'role']
})

// 使用表格操作 composable
const { selectedItems: selectedUsers, handleSelectionChange } = useTableActions()

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

// 加载用户列表
const loadUsers = async () => {
  const result = await loadItems(getPaginationParams())
  setTotal(result.total)
}

// 使用筛选 composable
const { debouncedSearch } = useFilter({
  onSearch: () => {
    resetPagination()
    loadUsers()
  }
})

// 重置筛选
const resetFilter = () => {
  filterForm.name = ''
  filterForm.email = ''
  filterForm.role = ''
  resetPagination()
  loadUsers()
}

// 编辑用户
const editUser = (user: any) => {
  editForm.id = user.id
  editForm.name = user.name
  editForm.email = user.email
  editForm.role = user.role
  editItem(user, editForm)
}

// 处理更多操作
const handleCommand = async (command: string, user: any) => {
  switch (command) {
    case 'resetPassword':
      if (await confirmResetPassword()) {
        // TODO: 调用重置密码 API
        ElMessage.success('密码重置成功')
      }
      break
    case 'changeRole':
      editUser(user)
      break
    case 'sendNotification':
      ElMessage.info('发送通知功能开发中...')
      break
    case 'disable':
      if (await confirmDisable('该账号')) {
        // TODO: 调用禁用 API
        ElMessage.success('账号已禁用')
        loadUsers()
      }
      break
    case 'enable':
      // TODO: 调用启用 API
      ElMessage.success('账号已启用')
      loadUsers()
      break
    case 'delete':
      if (await confirmDelete('该用户')) {
        await deleteItem(user.id, loadUsers)
      }
      break
  }
}

// 保存用户
const saveUser = async () => {
  await saveItem(editForm, loadUsers)
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
</style>
