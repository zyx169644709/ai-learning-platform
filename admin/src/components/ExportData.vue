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
import * as XLSX from 'xlsx'

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

const filterData = (data: Record<string, any>) => {
  if (selectedFields.value.length === 0 || fieldOptions.value.length === 0) return data
  const filtered: Record<string, any> = {}
  for (const key of selectedFields.value) {
    if (key in data) filtered[key] = data[key]
  }
  return filtered
}

const handleExport = () => {
  if (!props.data) {
    ElMessage.warning('没有可导出的数据')
    return
  }

  exporting.value = true

  try {
    const filtered = filterData(props.data)
    const fileName = props.itemName || 'export'

    // 将 key 映射为中文表头
    const labelMap: Record<string, string> = {}
    for (const f of fieldOptions.value) {
      labelMap[f.value] = f.label
    }
    const row: Record<string, any> = {}
    for (const [key, val] of Object.entries(filtered)) {
      row[labelMap[key] || key] = val === null || val === undefined ? '' : val
    }
    const ws = XLSX.utils.json_to_sheet([row])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '课程数据')
    XLSX.writeFile(wb, `${fileName}.xlsx`)

    ElMessage.success('导出成功')
    visible.value = false
  } catch (error) {
    ElMessage.error('导出失败')
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
