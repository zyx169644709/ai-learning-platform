<template>
  <div class="resource-management">
    <!-- 页面标题 -->
    <PageHeader title="资源管理" />

    <!-- 筛选栏 -->
    <FilterBar 
      v-model="filterForm" 
      @search="loadResources" 
      @reset="resetFilter"
    >
      <el-form-item label="资源标题">
        <el-input 
          v-model="filterForm.title" 
          placeholder="请输入资源标题" 
          clearable 
          @input="debouncedSearch"
          style="width: 200px;"
        />
      </el-form-item>
      <el-form-item label="资源类型" style="width: 150px;">
        <el-select v-model="filterForm.type" placeholder="全部" clearable @change="debouncedSearch">
          <el-option label="网站" value="website" />
          <el-option label="文档" value="document" />
          <el-option label="工具" value="tool" />
          <el-option label="教程" value="tutorial" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" style="width: 150px;">
        <el-select v-model="filterForm.status" placeholder="全部" clearable @change="debouncedSearch">
          <el-option label="草稿" value="draft" />
          <el-option label="已发布" value="published" />
          <el-option label="已归档" value="archived" />
        </el-select>
      </el-form-item>
      <template #extra-buttons>
        <el-button type="warning" @click="publishAll" :loading="publishing">一键发布</el-button>
        <el-button type="success" @click="createResource">创建资源</el-button>
      </template>
    </FilterBar>

    <!-- 资源列表 -->
    <el-card>
      <el-table :data="resources" stripe>
        <el-table-column prop="title" label="资源标题" min-width="200" />
        <el-table-column prop="type" label="类型" width="100">
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
        <el-table-column prop="isOfficial" label="官方" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.isOfficial" type="primary" size="small">官方</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="链接" width="150">
          <template #default="{ row }">
            <el-link :href="row.url" target="_blank" type="primary">
              {{ row.url.length > 20 ? row.url.substring(0, 20) + '...' : row.url }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatRelativeTime(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="editResource(row)">编辑</el-button>
            <el-button type="warning" link @click="viewStats(row)">统计</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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
          @size-change="loadResources"
          @current-change="loadResources"
        />
      </div>
    </el-card>

    <!-- 统计弹窗 -->
    <el-dialog v-model="showStatsDialog" title="资源统计" width="420px">
      <div class="stats-grid" v-if="statsResource">
        <div class="stats-item">
          <div class="stats-value">{{ statsResource.viewCount || 0 }}</div>
          <div class="stats-label">浏览量</div>
        </div>
        <div class="stats-item">
          <div class="stats-value">{{ statsResource.likeCount || 0 }}</div>
          <div class="stats-label">点赞数</div>
        </div>
        <div class="stats-item">
          <div class="stats-value">{{ statsResource.favoriteCount || 0 }}</div>
          <div class="stats-label">收藏量</div>
        </div>
      </div>
    </el-dialog>

    <!-- 创建/编辑资源对话框 -->
    <el-dialog 
      v-model="showDialog" 
      :title="isEdit ? '编辑资源' : '创建资源'" 
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="resourceForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="资源标题" prop="title">
          <el-input v-model="resourceForm.title" placeholder="请输入资源标题" />
        </el-form-item>
        <el-form-item label="资源链接" prop="url">
          <el-input v-model="resourceForm.url" placeholder="请输入官网链接" />
        </el-form-item>
        <el-form-item label="资源描述" prop="description">
          <el-input 
            v-model="resourceForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入资源描述" 
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="资源类型" prop="type">
              <el-select v-model="resourceForm.type" style="width: 100%;">
                <el-option label="网站" value="website" />
                <el-option label="文档" value="document" />
                <el-option label="工具" value="tool" />
                <el-option label="教程" value="tutorial" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="resourceForm.status" style="width: 100%;">
                <el-option label="草稿" value="draft" />
                <el-option label="已发布" value="published" />
                <el-option label="已归档" value="archived" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="封面图片" prop="cover">
              <ImageUpload 
                v-model="resourceForm.cover" 
                :aspect-ratio="16/9"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="资源图标" prop="icon">
              <ImageUpload 
                v-model="resourceForm.icon" 
                :aspect-ratio="1"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="资源标签" prop="tags">
          <el-input v-model="resourceForm.tags" placeholder="请输入标签，用英文逗号分隔，如：AI,机器学习,入门" />
        </el-form-item>
        <el-form-item label="官方资源" prop="isOfficial">
          <el-switch v-model="resourceForm.isOfficial" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormRules } from 'element-plus'
import { usePagination } from '@/composables/usePagination'
import { useFilter } from '@/composables/useFilter'
import { formatRelativeTime } from '@/utils/format'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import request from '@/utils/request'

// 分页
const { pagination, resetPagination, setTotal, getPaginationParams } = usePagination()

// 筛选表单
const filterForm = reactive({
  title: '',
  type: '',
  status: ''
})

// 数据
const resources = ref<any[]>([])
const showDialog = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const publishing = ref(false)
const formRef = ref()

// 统计
const showStatsDialog = ref(false)
const statsResource = ref<any>(null)

// 表单
const resourceForm = reactive({
  id: '',
  title: '',
  description: '',
  cover: '',
  icon: '',
  url: '',
  type: 'website',
  status: 'draft',
  isOfficial: false,
  tags: ''
})

// 验证规则
const rules: FormRules = {
  title: [{ required: true, message: '请输入资源标题', trigger: 'blur' }],
  url: [{ required: true, message: '请输入资源链接', trigger: 'blur' }]
}

// 加载资源列表
const loadResources = async () => {
  try {
    const params = {
      ...getPaginationParams(),
      ...filterForm
    }
    
    const response = await request.get('/admin/resources', { params })
    
    if (response.data.success) {
      resources.value = response.data.data.items
      setTotal(response.data.data.total)
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '加载资源列表失败')
  }
}

// 防抖搜索
const { debouncedSearch } = useFilter({ onSearch: loadResources })

// 重置筛选
const resetFilter = () => {
  Object.assign(filterForm, {
    title: '',
    type: '',
    status: ''
  })
  resetPagination()
  loadResources()
}

// 创建资源
const createResource = () => {
  isEdit.value = false
  Object.assign(resourceForm, {
    id: '',
    title: '',
    description: '',
    cover: '',
    icon: '',
    url: '',
    type: 'website',
    status: 'draft',
    isOfficial: false,
    tags: ''
  })
  showDialog.value = true
}

// 编辑资源
const editResource = async (row: any) => {
  try {
    const response = await request.get(`/admin/resources/${row.id}`)
    
    if (response.data.success) {
      const data = response.data.data
      isEdit.value = true
      Object.assign(resourceForm, {
        id: data.id,
        title: data.title,
        description: data.description || '',
        cover: data.cover || '',
        icon: data.icon || '',
        url: data.url,
        type: data.type || 'website',
        status: data.status || 'draft',
        isOfficial: data.isOfficial || false,
        tags: Array.isArray(data.tags) ? data.tags.join(',') : (data.tags || '')
      })
      showDialog.value = true
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '获取资源详情失败')
  }
}

// 查看统计
const viewStats = (resource: any) => {
  statsResource.value = resource
  showStatsDialog.value = true
}

// 保存资源
const handleSave = async () => {
  try {
    await formRef.value.validate()
    
    saving.value = true
    
    const url = isEdit.value ? `/admin/resources/${resourceForm.id}` : '/admin/resources'
    const method = isEdit.value ? 'put' : 'post'
    
    const formData = {
      ...resourceForm,
      tags: resourceForm.tags
        ? resourceForm.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : []
    }
    const response = await request[method](url, formData)
    
    if (response.data.success) {
      ElMessage.success(response.data.message)
      showDialog.value = false
      loadResources()
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 删除资源
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该资源吗？', '提示', {
      type: 'warning'
    })
    
    const response = await request.delete(`/admin/resources/${row.id}`)
    
    if (response.data.success) {
      ElMessage.success(response.data.message)
      loadResources()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

// 一键发布所有草稿资源
const publishAll = async () => {
  try {
    publishing.value = true
    const response = await request.post('/admin/resources/publish-all')
    if (response.data.success) {
      ElMessage.success(response.data.message || '发布成功')
      loadResources()
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '发布失败')
  } finally {
    publishing.value = false
  }
}

// 类型标签
const getTypeTagType = (type: string) => {
  const map: Record<string, string> = {
    website: 'primary',
    document: 'success',
    tool: 'warning',
    tutorial: 'info'
  }
  return map[type] || 'info'
}

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    website: '网站',
    document: '文档',
    tool: '工具',
    tutorial: '教程'
  }
  return map[type] || type
}

// 状态标签
const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    draft: 'info',
    published: 'success',
    archived: 'warning'
  }
  return map[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档'
  }
  return map[status] || status
}

// 初始化
onMounted(() => {
  loadResources()
})
</script>

<style scoped>
.resource-management {
  padding: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.el-card {
  margin-top: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 20px 0;
}

.stats-item {
  text-align: center;
  padding: 20px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
}

.stats-value {
  font-size: 28px;
  font-weight: 600;
  color: var(--el-color-primary);
  margin-bottom: 8px;
}

.stats-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
}
</style>
