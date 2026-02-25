<template>
  <el-dialog v-model="visible" title="导出数据" width="480px">
    <div class="export-options">
      <div class="export-info">
        <p>即将导出 <strong>{{ itemName }}</strong> 的数据</p>
      </div>
      <el-form label-width="80px">
        <el-form-item label="导出字段" v-if="fieldOptions.length > 0">
          <el-checkbox-group v-model="selectedFields">
            <el-checkbox v-for="field in fieldOptions" :key="field.value" :value="field.value">
              {{ field.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleExport" :loading="exporting">导出</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

interface FieldOption {
  label: string
  value: string
}

const props = defineProps<{
  modelValue: boolean
  data: Record<string, any> | null
  itemName?: string
  fields?: FieldOption[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const exporting = ref(false)

const fieldOptions = computed(() => props.fields || [])

const selectedFields = ref<string[]>([])

// 初始化选中所有字段
const initFields = () => {
  if (fieldOptions.value.length > 0) {
    selectedFields.value = fieldOptions.value.map(f => f.value)
  }
}

// 监听打开
watch(() => props.modelValue, (val) => {
  if (val) initFields()
})

const handleExport = async () => {
  if (!props.data) {
    ElMessage.warning('没有可导出的数据')
    return
  }

  exporting.value = true

  try {
    // 判断数据类型，调用不同的 API
    let apiUrl = ''
    let requestData: any = { fields: selectedFields.value }

    if (props.data.exportType === 'user' || props.data.type === 'batch' || props.data.type === 'single') {
      // 用户导出
      apiUrl = '/admin/users/export'
      requestData.userIds = props.data.userIds
    } else if (props.data.exportType === 'course-batch') {
      // 批量课程导出
      apiUrl = '/admin/courses/export'
      requestData.courseIds = props.data.courseIds
    } else {
      // 单个课程导出（data 直接是课程对象）
      apiUrl = '/admin/courses/export'
      requestData.courseIds = props.data.id ? [props.data.id] : []
    }
    
    const response = await request.post(apiUrl, requestData, {
      responseType: 'blob'
    })

    // 创建下载链接
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // 生成文件名
    const fileName = props.itemName || 'export'
    const dateStr = new Date().toISOString().split('T')[0]
    link.download = `${fileName}_${dateStr}.xlsx`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
    visible.value = false
  } catch (error: any) {
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text()
        const json = JSON.parse(text)
        ElMessage.error(json.message || '导出失败')
      } catch {
        ElMessage.error('导出失败')
      }
    } else {
      ElMessage.error(error.response?.data?.message || '导出失败')
    }
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped>
.export-options {
  padding: 10px 0;
}

.export-info {
  margin-bottom: 16px;
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.export-info p {
  margin: 0;
  color: var(--el-text-color-regular);
  font-size: 14px;
}
</style>
