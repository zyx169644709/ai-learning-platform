<template>
  <div class="discussion-management">
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
        <el-table-column prop="views" label="浏览" width="75" align="center" header-align="center" />
        <el-table-column prop="likes" label="点赞" width="75" align="center" header-align="center" />
        <el-table-column prop="commentCount" label="评论" width="75" align="center" header-align="center" />
        <el-table-column prop="createdAt" label="发布时间" width="160" align="center" header-align="center">
          <template #default="{ row }">
            {{ formatRelativeTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="210" fixed="right">
          <template #default="{ row }">
            <el-button type="warning" link @click="togglePin(row)">
              {{ row.isPinned ? '取消置顶' : '置顶' }}
            </el-button>
            <el-button :type="row.status === 'hidden' ? 'success' : 'warning'" link @click="toggleStatus(row)">
              {{ row.status === 'hidden' ? '显示' : '隐藏' }}
            </el-button>
            <el-button type="danger" link @click="deleteDiscussion(row)">删除</el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatRelativeTime } from '@/utils/format'
import request from '@/utils/request'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import BatchActionBar from '@/components/BatchActionBar.vue'
import { useFilter } from '@/composables/useFilter'

const discussions = ref<any[]>([])
const selectedItems = ref<any[]>([])
const filterForm = reactive({ keyword: '', category: '', status: '' })
const pagination = reactive({ page: 1, size: 20, total: 0 })

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

const togglePin = async (row: any) => {
  try {
    const res = await request.post(`/admin/community/discussions/${row.id}/toggle-pin`)
    if (res.data.success) {
      ElMessage.success(res.data.message)
      row.isPinned = res.data.data.isPinned
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '操作失败')
  }
}

const toggleStatus = async (row: any) => {
  try {
    const res = await request.post(`/admin/community/discussions/${row.id}/toggle-status`)
    if (res.data.success) {
      ElMessage.success(res.data.message)
      row.status = res.data.data.status
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '操作失败')
  }
}

const deleteDiscussion = async (row: any) => {
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
</style>
