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
      <el-table :data="users" stripe @selection-change="handleSelectionChange" style="table-layout: auto">
        <el-table-column type="selection" width="55" />
        <el-table-column label="用户（头像/用户名/邮箱）" min-width="250">
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
        <el-table-column prop="role" label="角色" width="90" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : row.status === 'disabled' ? 'danger' : 'warning'">
              {{ row.status === 'active' ? '正常' : row.status === 'disabled' ? '禁用' : '异常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="学习进度" width="150" align="center" header-align="center">
          <template #default="{ row }">
            <el-progress :percentage="row.progress" :stroke-width="6" />
          </template>
        </el-table-column>
        <el-table-column prop="completedCourses" label="完成课程" width="90" align="center" header-align="center" />
        <el-table-column label="操作" width="220" fixed="right">
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
                  <el-dropdown-item command="exportUser">导出用户</el-dropdown-item>
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
        <el-button type="danger" @click="batchDelete">批量删除</el-button>
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

    <!-- 导出数据弹窗 -->
    <ExportData
      v-model="showExportDialog"
      :data="exportUser"
      :item-name="exportUser?.type === 'batch' ? `${exportUser?.users?.length || 0}个用户` : exportUser?.user?.name || '用户'"
      :fields="exportFields"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import type { FormRules } from 'element-plus'
import { usePagination } from '@/composables/usePagination'
import { useConfirm } from '@/composables/useConfirm'
import { useCrud } from '@/composables/useCrud'
import { useTableActions } from '@/composables/useTableActions'
import { useFilter } from '@/composables/useFilter'
import { getRoleTagType, getRoleLabel } from '@/utils/enums'
import { formatRelativeTime } from '@/utils/format'
import request from '@/utils/request'
import defaultAvatar from '@/assets/images/default.png'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import ExportData from '@/components/ExportData.vue'

// 使用分页 composable
const { pagination, resetPagination, setTotal, getPaginationParams } = usePagination()

// 使用确认对话框 composable
const { confirmDelete, confirmDisable } = useConfirm()

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
      try {
        await ElMessageBox.confirm(
          `确定要将用户 「${user.name}」 的密码重置为 123456 吗？`,
          '重置密码确认',
          { type: 'warning', confirmButtonText: '确认重置', cancelButtonText: '取消' }
        )
        const res = await request.post(`/admin/users/${user.id}/reset-password`)
        if (res.data.success) {
          ElMessage.success(res.data.message || '密码重置成功')
        }
      } catch (error: any) {
        if (error !== 'cancel') {
          ElMessage.error(error.response?.data?.message || '密码重置失败')
        }
      }
      break
    case 'exportUser':
      exportSingleUser(user)
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

// editFormRef 用于用户编辑表单验证
const editFormRef = ref()

// 保存用户
const saveUser = async () => {
  if (!editFormRef.value) return
  await editFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    saving.value = true
    try {
      const response = await request.put(`/admin/users/${editForm.id}`, editForm)
      if (response.data.success) {
        ElMessage.success('更新成功')
        showEditDialog.value = false
        loadUsers()
      }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '保存用户失败')
    } finally {
      saving.value = false
    }
  })
}

// 导出数据
const showExportDialog = ref(false)
const exportUser = ref<any>(null)
const exportFields = [
  { label: '用户ID', value: 'id' },
  { label: '用户名', value: 'username' },
  { label: '邮箱', value: 'email' },
  { label: '角色', value: 'role' },
  { label: '状态', value: 'status' },
  { label: '头像', value: 'avatar' },
  { label: '最后登录', value: 'lastLoginAt' },
  { label: '注册时间', value: 'createdAt' },
  { label: '最后更新', value: 'updatedAt' },
  { label: '创建课程数', value: 'coursesCount' },
  { label: '创建章节数', value: 'chaptersCount' },
  { label: '创建资源数', value: 'resourcesCount' },
  { label: '收藏数', value: 'favoritesCount' },
  { label: '发帖数', value: 'discussionsCount' },
  { label: '评论数', value: 'commentsCount' }
]

// 批量删除
const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？此操作不可恢复！`,
      '批量删除确认',
      {
        type: 'warning',
        confirmButtonText: '确认删除',
        cancelButtonText: '取消'
      }
    )
    
    const userIds = selectedUsers.value.map(user => user.id)
    const response = await request.post('/admin/users/batch-delete', { userIds })
    
    if (response.data.success) {
      ElMessage.success(`成功删除 ${response.data.data?.deletedCount} 个用户`)
      selectedUsers.value = []
      loadUsers()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '批量删除失败')
    }
  }
}

// 批量导出Excel
const batchExport = () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请先选择要导出的用户')
    return
  }
  exportUser.value = {
    type: 'batch',
    users: selectedUsers.value,
    userIds: selectedUsers.value.map(user => user.id)
  }
  showExportDialog.value = true
}

// 导出单个用户
const exportSingleUser = (user: any) => {
  exportUser.value = {
    type: 'single',
    user: user,
    userIds: [user.id]
  }
  showExportDialog.value = true
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
}

:deep(.el-table th.el-table__cell:nth-child(1)) {
  text-align: center !important;
}

/* 用户信息列左对齐 */
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
