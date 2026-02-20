<template>
  <div class="markdown-editor-wrapper">
    <MdEditor
      v-model="content"
      :theme="theme"
      :previewOnly="previewOnly"
      :language="language"
      :placeholder="placeholder"
      :style="{ height: height }"
      @onUploadImg="handleUploadImg"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

interface Props {
  modelValue: string
  placeholder?: string
  height?: string
  previewOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '请输入 Markdown 内容...',
  height: '500px',
  previewOnly: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// 编辑器主题
const theme = ref<'light' | 'dark'>('light')

// 语言设置
const language = ref('zh-CN')

// 双向绑定内容
const content = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 处理图片上传
const handleUploadImg = async (
  files: File[],
  callback: (urls: string[]) => void
) => {
  const urls: string[] = []
  
  for (const file of files) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await request.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (response.data.success) {
        urls.push(response.data.data.url)
      }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '图片上传失败')
    }
  }
  
  callback(urls)
}
</script>

<style scoped>
.markdown-editor-wrapper {
  width: 100%;
}

/* 覆盖编辑器样式以适应 Element Plus */
:deep(.md-editor) {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

:deep(.md-editor:focus-within) {
  border-color: #409eff;
}
</style>
