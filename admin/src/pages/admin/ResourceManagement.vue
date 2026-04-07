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
      <el-form-item>
        <el-input
          v-model="filterForm.title"
          placeholder="搜索资源标题"
          clearable
          @input="debouncedSearch"
          style="width: 180px;"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-select v-model="filterForm.category" placeholder="资源类别" clearable @change="debouncedSearch" style="width: 120px;">
          <el-option label="学习文档" value="docs" />
          <el-option label="项目模板" value="templates" />
          <el-option label="工具配置" value="configs" />
          <el-option label="代码片段" value="snippets" />
          <el-option label="面试资源" value="interview" />
          <el-option label="插件工具" value="plugins" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="filterForm.type" placeholder="资源类型" clearable @change="debouncedSearch" style="width: 110px;">
          <el-option label="网站" value="website" />
          <el-option label="文档" value="document" />
          <el-option label="工具" value="tool" />
          <el-option label="教程" value="tutorial" />
          <el-option label="代码" value="code" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="filterForm.status" placeholder="资源状态" clearable @change="debouncedSearch" style="width: 110px;">
          <el-option label="草稿" value="draft" />
          <el-option label="已发布" value="published" />
          <el-option label="已归档" value="archived" />
        </el-select>
      </el-form-item>
      <template #extra-buttons>
        <el-button type="warning" :loading="publishing" @click="publishAll">一键发布</el-button>
        <el-button type="success" @click="createResource">
          <el-icon><Plus /></el-icon> 创建资源
        </el-button>
      </template>
    </FilterBar>

    <!-- 资源列表 -->
    <el-card>
      <el-table :data="resources" stripe style="table-layout: auto" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="title" label="资源标题" min-width="250" />
        <el-table-column prop="type" label="类型" width="90" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="资源类别" width="120" align="center" header-align="center">
          <template #default="{ row }">
            <el-tag v-if="row.category" :type="getCategoryTagType(row.category)">
              {{ getCategoryLabel(row.category) }}
            </el-tag>
            <span v-else style="color: var(--el-text-color-secondary)">未分类</span>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="160" align="center" header-align="center">
          <template #default="{ row }">
            {{ formatRelativeTime(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="editResource(row)">编辑</el-button>
            <StatsDisplay
              mode="dialog"
              title="资源统计"
              :items="[
                { label: '浏览量', value: row.viewCount },
                { label: '点赞数', value: row.likeCount },
                { label: '收藏量', value: row.favoriteCount }
              ]"
            />
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

    <BatchActionBar :count="selectedResources.length" label="资源">
      <el-button @click="batchPublish">批量发布</el-button>
      <el-button type="danger" @click="batchDelete">批量删除</el-button>
    </BatchActionBar>

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
        <el-form-item label="资源类别" prop="category">
          <el-select v-model="resourceForm.category" placeholder="请选择资源类别">
            <el-option label="学习文档" value="docs" />
            <el-option label="项目模板" value="templates" />
            <el-option label="工具配置" value="configs" />
            <el-option label="代码片段" value="snippets" />
            <el-option label="面试资源" value="interview" />
            <el-option label="插件工具" value="plugins" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="资源类型" prop="type">
              <el-select v-model="resourceForm.type" style="width: 100%;">
                <el-option label="网站" value="website" />
                <el-option label="文档" value="document" />
                <el-option label="工具" value="tool" />
                <el-option label="教程" value="tutorial" />
                <el-option label="代码" value="code" />
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
import { Search, Plus } from '@element-plus/icons-vue'
import BatchActionBar from '@/components/BatchActionBar.vue'
import type { FormRules } from 'element-plus'
import { usePagination } from '@/composables/usePagination'
import { useFilter } from '@/composables/useFilter'
import { formatRelativeTime } from '@/utils/format'
import PageHeader from '@/components/PageHeader.vue'
import FilterBar from '@/components/FilterBar.vue'
import ImageUpload from '@/components/ImageUpload.vue'
import request from '@/utils/request'
import StatsDisplay from '@/components/StatsDisplay.vue'

// 分页
const { pagination, resetPagination, setTotal, getPaginationParams } = usePagination()

// 筛选表单
const filterForm = reactive({
  title: '',
  category: '',
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

// 选中的资源
const selectedResources = ref<any[]>([])

const handleSelectionChange = (selection: any[]) => {
  selectedResources.value = selection
}

// 批量删除
const batchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedResources.value.length} 个资源吗？此操作不可恢复！`,
      '批量删除确认',
      {
        type: 'warning',
        confirmButtonText: '确认删除',
        cancelButtonText: '取消'
      }
    )
    const resourceIds = selectedResources.value.map(r => r.id)
    const response = await request.post('/admin/resources/batch-delete', { resourceIds })
    if (response.data.success) {
      ElMessage.success(`成功删除 ${response.data.data?.deletedCount} 个资源`)
      selectedResources.value = []
      loadResources()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '批量删除失败')
    }
  }
}

// 批量发布
const batchPublish = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要发布选中的 ${selectedResources.value.length} 个资源吗？`,
      '批量发布确认',
      {
        type: 'warning',
        confirmButtonText: '确认发布',
        cancelButtonText: '取消'
      }
    )
    const resourceIds = selectedResources.value.map(r => r.id)
    const response = await request.post('/admin/resources/batch-publish', { resourceIds })
    if (response.data.success) {
      ElMessage.success(`成功发布 ${response.data.data?.publishedCount} 个资源`)
      selectedResources.value = []
      loadResources()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '批量发布失败')
    }
  }
}

// 表单
const resourceForm = reactive({
  id: '',
  title: '',
  description: '',
  category: '',
  cover: '',
  icon: '',
  url: '',
  type: 'website',
  status: 'draft',
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
    category: '',
    cover: '',
    icon: '',
    url: '',
    type: 'website',
    status: 'draft',
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
        category: data.category || '',
        cover: data.cover || '',
        icon: data.icon || '',
        url: data.url,
        type: data.type || 'website',
        status: data.status || 'draft',
        tags: Array.isArray(data.tags) ? data.tags.join(',') : (data.tags || '')
      })
      showDialog.value = true
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '获取资源详情失败')
  }
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
    website: 'info',
    document: 'success',
    tool: 'warning',
    tutorial: '',
    code: 'danger'
  }
  return map[type] ?? 'info'
}

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    website: '网站',
    document: '文档',
    tool: '工具',
    tutorial: '教程',
    code: '代码'
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

// 资源类别标签
const getCategoryTagType = (category: string): 'success' | 'info' | 'warning' | 'danger' | '' => {
  const typeMap: Record<string, 'success' | 'info' | 'warning' | 'danger' | ''> = {
    'docs': 'success', // 学习文档
    'templates': 'warning', // 项目模板
    'configs': '',   // 工具配置
    'snippets': 'success', // 代码片段
    'interview': 'warning',  // 面试资源
    'plugins': '' // 插件工具
  }
  return typeMap[category] ?? 'info'
}

const getCategoryLabel = (category: string): string => {
  const map: Record<string, string> = {
    'docs': '学习文档',
    'templates': '项目模板',
    'configs': '工具配置',
    'snippets': '代码片段',
    'interview': '面试资源',
    'plugins': '插件工具'
  }
  return map[category] || category
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
  overflow-x: auto;
}

/* 确保表格容器占满宽度 */
.el-card :deep(.el-table__body-wrapper) {
  width: 100% !important;
}

.el-card :deep(.el-table__header-wrapper) {
  width: 100% !important;
}

/* 表格对齐优化 */
:deep(.el-table) {
  --el-table-border-color: #ebeef5;
}

/* 确保 fixed 列正常工作 */
:deep(.el-table__fixed-right) {
  right: 0 !important;
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

/* 资源标题列左对齐 */
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
</style>
