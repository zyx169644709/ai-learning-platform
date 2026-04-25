<template>
  <div class="comment-management">
    <PageHeader title="评论管理" />

    <FilterBar v-model="filterForm" @search="loadComments" @reset="resetFilter">
      <el-form-item label="关键词">
        <el-input
          v-model="filterForm.keyword"
          placeholder="搜索评论内容"
          clearable
          @input="debouncedSearch"
          style="width: 200px;"
        />
      </el-form-item>
      <el-form-item label="状态" style="width: 140px;">
        <el-select v-model="filterForm.status" placeholder="全部" clearable @change="debouncedSearch">
          <el-option label="显示中" value="visible" />
          <el-option label="已隐藏" value="hidden" />
        </el-select>
      </el-form-item>
      <template #extra-buttons>
        <el-button type="warning" @click="openPendingReview">🔍 待审核</el-button>
        <el-button type="success" @click="createComment">创建评论</el-button>
      </template>
    </FilterBar>

    <el-card>
      <el-table :data="comments" stripe style="table-layout: auto" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="content" label="评论内容" min-width="280">
          <template #default="{ row }">
            <div class="comment-content" @click.stop="viewContent(row)">
              <el-tag v-if="row.status === 'pending'" type="primary" size="small" style="flex-shrink: 0; margin-right: 6px;">审核中</el-tag>
              <el-tag v-if="row.status === 'hidden'" type="danger" size="small" style="flex-shrink: 0; margin-right: 6px;">隐藏</el-tag>
              <span class="content-text">{{ row.content }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="评论者" width="120" />
        <el-table-column prop="discussionTitle" label="所属帖子" min-width="200">
          <template #default="{ row }">
            <el-text truncated>{{ row.discussionTitle }}</el-text>
          </template>
        </el-table-column>
        <el-table-column prop="likes" label="点赞" width="75" align="center" header-align="center" />
        <el-table-column prop="createdAt" label="发布时间" width="160" align="center" header-align="center">
          <template #default="{ row }">
            {{ formatRelativeTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button :type="row.status === 'hidden' ? 'success' : 'warning'" link @click="toggleStatus(row)">
              {{ row.status === 'hidden' ? '显示' : '隐藏' }}
            </el-button>
            <el-button type="danger" link @click="deleteComment(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <BatchActionBar :count="selectedItems.length" label="评论">
        <el-button type="danger" @click="batchDelete">批量删除</el-button>
      </BatchActionBar>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadComments"
          @current-change="loadComments"
        />
      </div>
    </el-card>

    <!-- 评论内容预览弹窗 -->
    <el-dialog v-model="showContentDialog" title="评论内容" width="500px">
      <div class="content-preview">{{ previewContent }}</div>
      <template #footer>
        <el-button @click="showContentDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 审核弹窗 -->
    <PendingReviewModal ref="pendingReviewRef" default-tab="comments" @reviewed="loadComments" />

    <!-- 创建评论对话框 -->
    <el-dialog v-model="showDialog" title="创建评论" width="600px">
      <el-form :model="commentForm" :rules="formRules" ref="formRef" label-width="90px">
        <el-form-item label="所属帖子" prop="discussionId">
          <el-select
            v-model="commentForm.discussionId"
            placeholder="搜索并选择帖子"
            filterable
            remote
            :remote-method="searchDiscussions"
            :loading="discussionSearchLoading"
            style="width: 100%;"
          >
            <el-option
              v-for="d in discussionOptions"
              :key="d.id"
              :label="d.title"
              :value="d.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="评论内容" prop="content">
          <el-input
            v-model="commentForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入评论内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="saveComment" :loading="saving">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { formatRelativeTime } from '@/utils/format'
import request from '@/utils/request'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import BatchActionBar from '@/components/BatchActionBar.vue'
import PendingReviewModal from '@/components/PendingReviewModal.vue'
import { useFilter } from '@/composables/useFilter'

const pendingReviewRef = ref<InstanceType<typeof PendingReviewModal>>()
const openPendingReview = () => pendingReviewRef.value?.open('comments')

const comments = ref<any[]>([])
const selectedItems = ref<any[]>([])
const filterForm = reactive({ keyword: '', status: '' })
const pagination = reactive({ page: 1, size: 20, total: 0 })

const showDialog = ref(false)
const saving = ref(false)
const showContentDialog = ref(false)
const previewContent = ref('')

const viewContent = (row: any) => {
  previewContent.value = row.content
  showContentDialog.value = true
}
const formRef = ref<FormInstance>()
const commentForm = reactive({ discussionId: '', content: '' })
const discussionOptions = ref<any[]>([])
const discussionSearchLoading = ref(false)

const formRules: FormRules = {
  discussionId: [{ required: true, message: '请选择所属帖子', trigger: 'change' }],
  content: [{ required: true, message: '请输入评论内容', trigger: 'blur' }]
}

const createComment = async () => {
  commentForm.discussionId = ''
  commentForm.content = ''
  discussionOptions.value = []
  await searchDiscussions('')
  showDialog.value = true
}

const searchDiscussions = async (keyword: string) => {
  discussionSearchLoading.value = true
  try {
    const res = await request.get('/admin/community/discussions', { params: { keyword, limit: 20 } })
    if (res.data.success) discussionOptions.value = res.data.data.items
  } catch {
    // ignore
  } finally {
    discussionSearchLoading.value = false
  }
}

const saveComment = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      const res = await request.post('/admin/community/comments', commentForm)
      if (res.data.success) {
        ElMessage.success('评论创建成功')
        showDialog.value = false
        loadComments()
      }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '创建失败')
    } finally {
      saving.value = false
    }
  })
}

const loadComments = async () => {
  try {
    const params: any = { page: pagination.page, limit: pagination.size }
    if (filterForm.keyword) params.keyword = filterForm.keyword
    if (filterForm.status) params.status = filterForm.status

    const res = await request.get('/admin/community/comments', { params })
    if (res.data.success) {
      comments.value = res.data.data.items
      pagination.total = res.data.data.total
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '加载评论列表失败')
  }
}

const resetFilter = () => {
  filterForm.keyword = ''
  filterForm.status = ''
  pagination.page = 1
  loadComments()
}

const handleSelectionChange = (selection: any[]) => {
  selectedItems.value = selection
}

const { debouncedSearch } = useFilter({
  onSearch: () => {
    pagination.page = 1
    loadComments()
  }
})

const toggleStatus = async (row: any) => {
  try {
    const res = await request.post(`/admin/community/comments/${row.id}/toggle-status`)
    if (res.data.success) {
      ElMessage.success(res.data.message)
      const idx = comments.value.findIndex(c => c.id === row.id)
      if (idx !== -1) comments.value[idx].status = res.data.data.status
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '操作失败')
  }
}

const deleteComment = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？此操作不可恢复！', '删除确认', {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消'
    })
    const res = await request.delete(`/admin/community/comments/${row.id}`)
    if (res.data.success) {
      ElMessage.success(res.data.message)
      loadComments()
    }
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.response?.data?.message || '删除失败')
  }
}

const batchDelete = async () => {
  if (selectedItems.value.length === 0) return
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedItems.value.length} 条评论吗？此操作不可恢复！`,
      '批量删除确认',
      { type: 'warning', confirmButtonText: '确认删除', cancelButtonText: '取消' }
    )
    const ids = selectedItems.value.map(c => c.id)
    const res = await request.post('/admin/community/comments/batch-delete', { ids })
    if (res.data.success) {
      ElMessage.success(res.data.message)
      selectedItems.value = []
      loadComments()
    }
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.response?.data?.message || '批量删除失败')
  }
}

onMounted(() => {
  loadComments()
})
</script>

<style scoped>
.comment-management {
  padding: 20px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.comment-content {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  overflow: hidden;
}

.content-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.content-preview {
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.8;
  color: var(--el-text-color-primary);
}
</style>
