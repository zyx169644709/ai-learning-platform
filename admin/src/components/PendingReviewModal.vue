<template>
  <!-- 待审核列表弹窗 -->
  <el-dialog
    v-model="listVisible"
    title="待审核内容"
    width="800px"
    @close="handleListClose"
  >
    <el-tabs v-model="activeTab">
      <el-tab-pane label="待审核讨论帖" name="discussions">
        <div v-if="loadingList" class="loading-placeholder">
          <el-skeleton :rows="4" animated />
        </div>
        <el-table v-else :data="pendingDiscussions" stripe max-height="400" @selection-change="(s: any[]) => selectedDiscussions = s">
          <el-table-column type="selection" width="50" />
          <el-table-column prop="title" label="标题" min-width="200" />
          <el-table-column prop="author" label="作者" width="120" />
          <el-table-column prop="createdAt" label="发布时间" width="160">
            <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openReviewDialog(row, 'discussion')">审核</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="!loadingList && pendingDiscussions.length === 0" class="empty-hint">
          <el-empty description="暂无待审核讨论帖" :image-size="60" />
        </div>
      </el-tab-pane>

      <el-tab-pane label="待审核评论" name="comments">
        <div v-if="loadingList" class="loading-placeholder">
          <el-skeleton :rows="4" animated />
        </div>
        <el-table v-else :data="pendingComments" stripe max-height="400" @selection-change="(s: any[]) => selectedComments = s">
          <el-table-column type="selection" width="50" />
          <el-table-column prop="content" label="内容" min-width="200">
            <template #default="{ row }">
              <el-text truncated>{{ row.content }}</el-text>
            </template>
          </el-table-column>
          <el-table-column prop="author" label="作者" width="120" />
          <el-table-column prop="createdAt" label="发布时间" width="160">
            <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openReviewDialog(row, 'comment')">审核</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="!loadingList && pendingComments.length === 0" class="empty-hint">
          <el-empty description="暂无待审核评论" :image-size="60" />
        </div>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <div class="batch-footer">
        <span class="batch-hint" v-if="currentBatchCount > 0">
          已选 {{ currentBatchCount }} 项
        </span>
        <el-button
          v-if="currentBatchCount > 0"
          type="primary"
          :loading="batchApproving"
          @click="handleBatchApprove"
        >
          批量通过 ({{ currentBatchCount }})
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 单条审核弹窗 -->
  <el-dialog
    v-model="reviewVisible"
    :title="reviewTitle"
    width="600px"
    @close="handleReviewClose"
  >
    <div v-if="currentItem" class="review-content">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="类型">
          {{ currentItem.type === 'discussion' ? '讨论帖' : '评论' }}
        </el-descriptions-item>
        <el-descriptions-item label="作者">{{ currentItem.author }}</el-descriptions-item>
        <el-descriptions-item v-if="currentItem.type === 'discussion'" label="标题">
          {{ currentItem.title }}
        </el-descriptions-item>
        <el-descriptions-item label="内容">
          <div class="content-preview">{{ currentItem.content }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="发布时间">
          {{ formatTime(currentItem.createdAt) }}
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="reviewVisible = false">取消</el-button>
        <el-button type="danger" :loading="reviewing" @click="handleReject">拒绝</el-button>
        <el-button type="primary" :loading="reviewing" @click="handleApprove">通过审核</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

interface Props {
  defaultTab?: 'discussions' | 'comments'
}

const props = withDefaults(defineProps<Props>(), {
  defaultTab: 'discussions'
})

const emit = defineEmits<{ reviewed: [] }>()

const listVisible = ref(false)
const reviewVisible = ref(false)
const loadingList = ref(false)
const reviewing = ref(false)
const batchApproving = ref(false)
const activeTab = ref<'discussions' | 'comments'>(props.defaultTab)
const pendingDiscussions = ref<any[]>([])
const pendingComments = ref<any[]>([])
const selectedDiscussions = ref<any[]>([])
const selectedComments = ref<any[]>([])
const currentItem = ref<any>(null)
const reviewTitle = ref('')

const currentBatchCount = computed(() =>
  activeTab.value === 'discussions' ? selectedDiscussions.value.length : selectedComments.value.length
)

const open = async (tab?: 'discussions' | 'comments') => {
  activeTab.value = tab ?? props.defaultTab
  listVisible.value = true
  loadingList.value = true
  try {
    const [dRes, cRes] = await Promise.all([
      request.get('/admin/community/discussions?page=1&limit=1000&status=pending'),
      request.get('/admin/community/comments?page=1&limit=1000&status=pending')
    ])
    pendingDiscussions.value = dRes.data?.data?.items || []
    pendingComments.value = cRes.data?.data?.items || []
  } catch {
    ElMessage.error('加载待审核内容失败')
  } finally {
    loadingList.value = false
  }
}

const openReviewDialog = (item: any, type: 'discussion' | 'comment') => {
  currentItem.value = { ...item, type }
  reviewTitle.value = type === 'discussion' ? '审核讨论帖' : '审核评论'
  reviewVisible.value = true
}

const handleApprove = async () => {
  if (!currentItem.value) return
  reviewing.value = true
  try {
    const { id, type } = currentItem.value
    const endpoint = type === 'discussion'
      ? `/admin/community/discussions/${id}/approve`
      : `/admin/community/comments/${id}/approve`
    await request.post(endpoint)
    ElMessage.success('审核通过')
    removeFromList(id, type)
    reviewVisible.value = false
    currentItem.value = null
    emit('reviewed')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '审核失败')
  } finally {
    reviewing.value = false
  }
}

const handleReject = async () => {
  if (!currentItem.value) return
  reviewing.value = true
  try {
    const { id, type } = currentItem.value
    const endpoint = type === 'discussion'
      ? `/admin/community/discussions/${id}/reject`
      : `/admin/community/comments/${id}/reject`
    await request.post(endpoint)
    ElMessage.success('已拒绝')
    removeFromList(id, type)
    reviewVisible.value = false
    currentItem.value = null
    emit('reviewed')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '操作失败')
  } finally {
    reviewing.value = false
  }
}

const removeFromList = (id: string, type: 'discussion' | 'comment') => {
  if (type === 'discussion') {
    pendingDiscussions.value = pendingDiscussions.value.filter(d => d.id !== id)
  } else {
    pendingComments.value = pendingComments.value.filter(c => c.id !== id)
  }
}

const handleBatchApprove = async () => {
  const isDiscussion = activeTab.value === 'discussions'
  const selected = isDiscussion ? selectedDiscussions.value : selectedComments.value
  if (selected.length === 0) return
  batchApproving.value = true
  try {
    await Promise.all(
      selected.map(item =>
        request.post(
          isDiscussion
            ? `/admin/community/discussions/${item.id}/approve`
            : `/admin/community/comments/${item.id}/approve`
        )
      )
    )
    ElMessage.success(`已批量通过 ${selected.length} 项`)
    const approvedIds = new Set(selected.map((i: any) => i.id))
    if (isDiscussion) {
      pendingDiscussions.value = pendingDiscussions.value.filter(d => !approvedIds.has(d.id))
      selectedDiscussions.value = []
    } else {
      pendingComments.value = pendingComments.value.filter(c => !approvedIds.has(c.id))
      selectedComments.value = []
    }
    emit('reviewed')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '批量审核失败')
  } finally {
    batchApproving.value = false
  }
}

const handleListClose = () => {
  pendingDiscussions.value = []
  pendingComments.value = []
  selectedDiscussions.value = []
  selectedComments.value = []
}

const handleReviewClose = () => {
  currentItem.value = null
}

const formatTime = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

defineExpose({ open })
</script>

<style scoped>
.loading-placeholder {
  padding: 16px 0;
}

.empty-hint {
  padding: 24px 0;
}

.review-content {
  padding: 4px 0;
}

.content-preview {
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.8;
  max-height: 160px;
  overflow-y: auto;
  color: var(--el-text-color-primary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.batch-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  min-height: 32px;
}

.batch-hint {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
