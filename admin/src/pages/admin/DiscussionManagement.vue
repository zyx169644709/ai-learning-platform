<template>
  <div class="discussion-management">
    <!-- 页面标题 -->
    <PageHeader title="帖子管理" />

    <FilterBar v-model="filterForm" @search="loadDiscussions" @reset="resetFilter">
      <el-form-item label="关键词">
        <el-input
          v-model="filterForm.keyword"
          placeholder="搜索标题或内容"
          clearable
          @input="debouncedSearch"
          style="width: 200px;"
        />
      </el-form-item>
      <el-form-item label="分类" style="width: 150px;">
        <el-select v-model="filterForm.category" placeholder="全部" clearable @change="debouncedSearch">
          <el-option label="技术" value="TECH" />
          <el-option label="经验" value="EXPERIENCE" />
          <el-option label="项目" value="PROJECT" />
          <el-option label="求助" value="HELP" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" style="width: 140px;">
        <el-select v-model="filterForm.status" placeholder="全部" clearable @change="debouncedSearch">
          <el-option label="已发布" value="published" />
          <el-option label="已隐藏" value="hidden" />
        </el-select>
      </el-form-item>
      <template #extra-buttons>
        <el-button type="success" @click="createDiscussion">创建帖子</el-button>
      </template>
    </FilterBar>

    <el-card>
      <el-table :data="discussions" stripe style="table-layout: auto" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="title" label="帖子标题" min-width="260">
          <template #default="{ row }">
            <div class="title-cell">
              <el-tag v-if="row.isPinned" type="warning" size="small" style="margin-right: 6px;">置顶</el-tag>
              <el-tag v-if="row.status === 'hidden'" type="danger" size="small" style="margin-right: 6px;">隐藏</el-tag>
              <span>{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="90" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="getCategoryTagType(row.category)" size="small">
              {{ getCategoryLabel(row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="createdAt" label="发布时间" width="160" align="center" header-align="center">
          <template #default="{ row }">
            {{ formatRelativeTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="editDiscussion(row)">编辑</el-button>
            <StatsDisplay
              mode="dialog"
              title="帖子统计"
              :items="[
                { label: '浏览量', value: row.views },
                { label: '点赞数', value: row.likes },
                { label: '评论数', value: row.commentCount }
              ]"
            />
            <el-dropdown @command="(cmd: string) => handleCommand(cmd, row)" trigger="click">
              <el-button type="primary" link class="el-dropdown-link">
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="pin">
                    {{ row.isPinned ? '取消置顶' : '置顶' }}
                  </el-dropdown-item>
                  <el-dropdown-item command="status">
                    {{ row.status === 'hidden' ? '显示' : '隐藏' }}
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <BatchActionBar :count="selectedItems.length" label="帖子">
        <el-button type="danger" @click="batchDelete">批量删除</el-button>
      </BatchActionBar>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadDiscussions"
          @current-change="loadDiscussions"
        />
      </div>
    </el-card>
    <!-- 创建/编辑帖子对话框 -->
    <el-dialog v-model="showDialog" :title="editingDiscussion ? '编辑帖子' : '创建帖子'" width="700px">
      <el-form :model="discussionForm" :rules="formRules" ref="formRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="discussionForm.title" placeholder="请输入帖子标题" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="discussionForm.category" placeholder="请选择分类" style="width: 100%;">
            <el-option label="技术讨论" value="TECH" />
            <el-option label="学习经验" value="EXPERIENCE" />
            <el-option label="项目分享" value="PROJECT" />
            <el-option label="问题求助" value="HELP" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="discussionForm.content"
            type="textarea"
            :rows="8"
            placeholder="请输入帖子内容（支持 Markdown）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="saveDiscussion" :loading="saving">
          {{ editingDiscussion ? '保存' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import StatsDisplay from '@/components/StatsDisplay.vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatRelativeTime } from '@/utils/format'
import request from '@/utils/request'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import BatchActionBar from '@/components/BatchActionBar.vue'
import { useFilter } from '@/composables/useFilter'
import { ArrowDown } from '@element-plus/icons-vue'

const discussions = ref<any[]>([])
const selectedItems = ref<any[]>([])
const filterForm = reactive({ keyword: '', category: '', status: '' })
const pagination = reactive({ page: 1, size: 20, total: 0 })

const showDialog = ref(false)
const saving = ref(false)
const editingDiscussion = ref<any>(null)
const formRef = ref<FormInstance>()
const discussionForm = reactive({ title: '', category: '', content: '' })

const formRules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

const createDiscussion = () => {
  editingDiscussion.value = null
  discussionForm.title = ''
  discussionForm.category = ''
  discussionForm.content = ''
  showDialog.value = true
}

const editDiscussion = (row: any) => {
  editingDiscussion.value = row
  discussionForm.title = row.title
  discussionForm.category = row.category
  discussionForm.content = row.content || ''
  showDialog.value = true
}

const saveDiscussion = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      if (editingDiscussion.value) {
        const res = await request.put(`/admin/community/discussions/${editingDiscussion.value.id}`, discussionForm)
        if (res.data.success) {
          ElMessage.success('帖子更新成功')
          Object.assign(editingDiscussion.value, { title: discussionForm.title, category: discussionForm.category })
          showDialog.value = false
        }
      } else {
        const res = await request.post('/admin/community/discussions', discussionForm)
        if (res.data.success) {
          ElMessage.success('帖子创建成功')
          showDialog.value = false
          loadDiscussions()
        }
      }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '操作失败')
    } finally {
      saving.value = false
    }
  })
}

const loadDiscussions = async () => {
  try {
    const params: any = { page: pagination.page, limit: pagination.size }
    if (filterForm.keyword) params.keyword = filterForm.keyword
    if (filterForm.category) params.category = filterForm.category
    if (filterForm.status) params.status = filterForm.status

    const res = await request.get('/admin/community/discussions', { params })
    if (res.data.success) {
      discussions.value = res.data.data.items
      pagination.total = res.data.data.total
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '加载帖子列表失败')
  }
}

const resetFilter = () => {
  filterForm.keyword = ''
  filterForm.category = ''
  filterForm.status = ''
  pagination.page = 1
  loadDiscussions()
}

const handleSelectionChange = (selection: any[]) => {
  selectedItems.value = selection
}

const { debouncedSearch } = useFilter({
  onSearch: () => {
    pagination.page = 1
    loadDiscussions()
  }
})

const handleCommand = async (cmd: string, row: any) => {
  if (cmd === 'pin') {
    try {
      const res = await request.post(`/admin/community/discussions/${row.id}/toggle-pin`)
      if (res.data.success) {
        ElMessage.success(res.data.message)
        const idx = discussions.value.findIndex(d => d.id === row.id)
        if (idx !== -1) discussions.value[idx].isPinned = res.data.data.isPinned
      }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '操作失败')
    }
  } else if (cmd === 'status') {
    try {
      const res = await request.post(`/admin/community/discussions/${row.id}/toggle-status`)
      if (res.data.success) {
        ElMessage.success(res.data.message)
        const idx = discussions.value.findIndex(d => d.id === row.id)
        if (idx !== -1) discussions.value[idx].status = res.data.data.status
      }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '操作失败')
    }
  } else if (cmd === 'delete') {
    try {
      await ElMessageBox.confirm(`确定要删除帖子「${row.title}」吗？此操作不可恢复！`, '删除确认', {
        type: 'warning',
        confirmButtonText: '确认删除',
        cancelButtonText: '取消'
      })
      const res = await request.delete(`/admin/community/discussions/${row.id}`)
      if (res.data.success) {
        ElMessage.success(res.data.message)
        loadDiscussions()
      }
    } catch (error: any) {
      if (error !== 'cancel') ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

const batchDelete = async () => {
  if (selectedItems.value.length === 0) return
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedItems.value.length} 篇帖子吗？此操作不可恢复！`,
      '批量删除确认',
      { type: 'warning', confirmButtonText: '确认删除', cancelButtonText: '取消' }
    )
    const ids = selectedItems.value.map(d => d.id)
    const res = await request.post('/admin/community/discussions/batch-delete', { ids })
    if (res.data.success) {
      ElMessage.success(res.data.message)
      selectedItems.value = []
      loadDiscussions()
    }
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.response?.data?.message || '批量删除失败')
  }
}

const getCategoryTagType = (category: string) => {
  const map: Record<string, string> = { TECH: 'primary', EXPERIENCE: 'success', PROJECT: 'warning', HELP: 'danger' }
  return map[category] || 'info'
}

const getCategoryLabel = (category: string) => {
  const map: Record<string, string> = { TECH: '技术', EXPERIENCE: '经验', PROJECT: '项目', HELP: '求助' }
  return map[category] || category
}

onMounted(() => {
  loadDiscussions()
})
</script>

<style scoped>
.discussion-management {
  padding: 20px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.title-cell {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
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
  vertical-align: middle;
}

:deep(.el-table .el-table__cell:last-child .el-button:last-child) {
  margin-right: 0;
}

:deep(.el-table .el-table__cell:last-child .el-dropdown) {
  margin-left: 0;
  vertical-align: middle;
}

:deep(.el-table .el-table__cell:last-child .el-dropdown .el-tooltip__trigger) {
  vertical-align: middle;
}
</style>
