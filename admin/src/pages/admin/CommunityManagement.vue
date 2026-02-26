<!-- 已拆分为 DiscussionManagement.vue 和 CommentManagement.vue -->
<template>
  <div class="community-management">
    <PageHeader title="社区管理" />

    <!-- Tab 切换 -->
    <el-tabs v-model="activeTab" class="community-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="帖子管理" name="discussions" />
      <el-tab-pane label="评论管理" name="comments" />
    </el-tabs>

    <!-- 帖子管理 -->
    <template v-if="activeTab === 'discussions'">
      <FilterBar v-model="discussionFilter" @search="loadDiscussions" @reset="resetDiscussionFilter">
        <el-form-item label="关键词">
          <el-input
            v-model="discussionFilter.keyword"
            placeholder="搜索标题或内容"
            clearable
            @input="debouncedDiscussionSearch"
            style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="分类" style="width: 150px;">
          <el-select v-model="discussionFilter.category" placeholder="全部" clearable @change="debouncedDiscussionSearch">
            <el-option label="技术" value="TECH" />
            <el-option label="经验" value="EXPERIENCE" />
            <el-option label="项目" value="PROJECT" />
            <el-option label="求助" value="HELP" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" style="width: 140px;">
          <el-select v-model="discussionFilter.status" placeholder="全部" clearable @change="debouncedDiscussionSearch">
            <el-option label="已发布" value="published" />
            <el-option label="已隐藏" value="hidden" />
          </el-select>
        </el-form-item>
      </FilterBar>

      <el-card>
        <el-table :data="discussions" stripe style="table-layout: auto" @selection-change="handleDiscussionSelection">
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
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="warning" link @click="togglePin(row)">
                {{ row.isPinned ? '取消置顶' : '置顶' }}
              </el-button>
              <el-button :type="row.status === 'hidden' ? 'success' : 'warning'" link @click="toggleDiscussionStatus(row)">
                {{ row.status === 'hidden' ? '显示' : '隐藏' }}
              </el-button>
              <el-button type="danger" link @click="deleteDiscussion(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <BatchActionBar :count="selectedDiscussions.length" label="帖子">
          <el-button type="danger" @click="batchDeleteDiscussions">批量删除</el-button>
        </BatchActionBar>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="discussionPagination.page"
            v-model:page-size="discussionPagination.size"
            :total="discussionPagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadDiscussions"
            @current-change="loadDiscussions"
          />
        </div>
      </el-card>
    </template>

    <!-- 评论管理 -->
    <template v-if="activeTab === 'comments'">
      <FilterBar v-model="commentFilter" @search="loadComments" @reset="resetCommentFilter">
        <el-form-item label="关键词">
          <el-input
            v-model="commentFilter.keyword"
            placeholder="搜索评论内容"
            clearable
            @input="debouncedCommentSearch"
            style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="状态" style="width: 140px;">
          <el-select v-model="commentFilter.status" placeholder="全部" clearable @change="debouncedCommentSearch">
            <el-option label="显示中" value="visible" />
            <el-option label="已隐藏" value="hidden" />
          </el-select>
        </el-form-item>
      </FilterBar>

      <el-card>
        <el-table :data="comments" stripe style="table-layout: auto" @selection-change="handleCommentSelection">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="content" label="评论内容" min-width="280">
            <template #default="{ row }">
              <div class="comment-content">
                <el-tag v-if="row.status === 'hidden'" type="danger" size="small" style="margin-right: 6px;">隐藏</el-tag>
                <span>{{ row.content }}</span>
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
              <el-button :type="row.status === 'hidden' ? 'success' : 'warning'" link @click="toggleCommentStatus(row)">
                {{ row.status === 'hidden' ? '显示' : '隐藏' }}
              </el-button>
              <el-button type="danger" link @click="deleteComment(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <BatchActionBar :count="selectedComments.length" label="评论">
          <el-button type="danger" @click="batchDeleteComments">批量删除</el-button>
        </BatchActionBar>

        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="commentPagination.page"
            v-model:page-size="commentPagination.size"
            :total="commentPagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadComments"
            @current-change="loadComments"
          />
        </div>
      </el-card>
    </template>
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

// ==================== Tab ====================
const activeTab = ref('discussions')
const handleTabChange = (tab: string) => {
  activeTab.value = tab
  if (tab === 'comments' && comments.value.length === 0) {
    loadComments()
  }
}

// ==================== 帖子管理 ====================
const discussions = ref<any[]>([])
const selectedDiscussions = ref<any[]>([])
const discussionFilter = reactive({ keyword: '', category: '', status: '' })
const discussionPagination = reactive({ page: 1, size: 20, total: 0 })

const loadDiscussions = async () => {
  try {
    const params: any = {
      page: discussionPagination.page,
      limit: discussionPagination.size
    }
    if (discussionFilter.keyword) params.keyword = discussionFilter.keyword
    if (discussionFilter.category) params.category = discussionFilter.category
    if (discussionFilter.status) params.status = discussionFilter.status

    const res = await request.get('/admin/community/discussions', { params })
    if (res.data.success) {
      discussions.value = res.data.data.items
      discussionPagination.total = res.data.data.total
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '加载帖子列表失败')
  }
}

const resetDiscussionFilter = () => {
  discussionFilter.keyword = ''
  discussionFilter.category = ''
  discussionFilter.status = ''
  discussionPagination.page = 1
  loadDiscussions()
}

const handleDiscussionSelection = (selection: any[]) => {
  selectedDiscussions.value = selection
}

const { debouncedSearch: debouncedDiscussionSearch } = useFilter({
  onSearch: () => {
    discussionPagination.page = 1
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

const toggleDiscussionStatus = async (row: any) => {
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

const batchDeleteDiscussions = async () => {
  if (selectedDiscussions.value.length === 0) return
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedDiscussions.value.length} 篇帖子吗？此操作不可恢复！`,
      '批量删除确认',
      { type: 'warning', confirmButtonText: '确认删除', cancelButtonText: '取消' }
    )
    const ids = selectedDiscussions.value.map(d => d.id)
    const res = await request.post('/admin/community/discussions/batch-delete', { ids })
    if (res.data.success) {
      ElMessage.success(res.data.message)
      selectedDiscussions.value = []
      loadDiscussions()
    }
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.response?.data?.message || '批量删除失败')
  }
}

// ==================== 评论管理 ====================
const comments = ref<any[]>([])
const selectedComments = ref<any[]>([])
const commentFilter = reactive({ keyword: '', status: '' })
const commentPagination = reactive({ page: 1, size: 20, total: 0 })

const loadComments = async () => {
  try {
    const params: any = {
      page: commentPagination.page,
      limit: commentPagination.size
    }
    if (commentFilter.keyword) params.keyword = commentFilter.keyword
    if (commentFilter.status) params.status = commentFilter.status

    const res = await request.get('/admin/community/comments', { params })
    if (res.data.success) {
      comments.value = res.data.data.items
      commentPagination.total = res.data.data.total
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '加载评论列表失败')
  }
}

const resetCommentFilter = () => {
  commentFilter.keyword = ''
  commentFilter.status = ''
  commentPagination.page = 1
  loadComments()
}

const handleCommentSelection = (selection: any[]) => {
  selectedComments.value = selection
}

const { debouncedSearch: debouncedCommentSearch } = useFilter({
  onSearch: () => {
    commentPagination.page = 1
    loadComments()
  }
})

const toggleCommentStatus = async (row: any) => {
  try {
    const res = await request.post(`/admin/community/comments/${row.id}/toggle-status`)
    if (res.data.success) {
      ElMessage.success(res.data.message)
      row.status = res.data.data.status
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

const batchDeleteComments = async () => {
  if (selectedComments.value.length === 0) return
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedComments.value.length} 条评论吗？此操作不可恢复！`,
      '批量删除确认',
      { type: 'warning', confirmButtonText: '确认删除', cancelButtonText: '取消' }
    )
    const ids = selectedComments.value.map(c => c.id)
    const res = await request.post('/admin/community/comments/batch-delete', { ids })
    if (res.data.success) {
      ElMessage.success(res.data.message)
      selectedComments.value = []
      loadComments()
    }
  } catch (error: any) {
    if (error !== 'cancel') ElMessage.error(error.response?.data?.message || '批量删除失败')
  }
}

// ==================== 工具函数 ====================
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
.community-management {
  padding: 20px;
}

.community-tabs {
  margin-bottom: 4px;
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

.comment-content {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  word-break: break-all;
}
</style>
