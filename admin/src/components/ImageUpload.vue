<template>
  <div class="image-upload">
    <!-- 已上传图片预览 -->
    <div v-if="hasImage" class="image-preview">
      <img :src="imageUrl" alt="封面预览" />
      <div class="image-actions">
        <el-button type="danger" size="small" @click="handleRemove">
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
      </div>
    </div>
    
    <!-- 上传区域 -->
    <div v-else class="upload-area" @click="triggerUpload">
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleFileChange"
      />
      <div v-if="uploading" class="upload-loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>上传中...</span>
      </div>
      <div v-else class="upload-placeholder">
        <el-icon><Plus /></el-icon>
        <span>点击上传图片</span>
        <p class="upload-tip">支持 JPG、PNG、GIF 格式，大小不超过 5MB</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, Loading } from '@element-plus/icons-vue'
import request from '@/utils/request'

interface Props {
  modelValue?: string
  maxSize?: number // 单位：MB
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  maxSize: 5
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)

// 计算图片 URL（只有非空字符串才视为有效）
const imageUrl = computed({
  get: () => props.modelValue || '',
  set: (value) => emit('update:modelValue', value)
})

// 是否有有效的图片 URL（必须以 http:// 或 https:// 或 /uploads/ 开头）
const hasImage = computed(() => {
  const url = imageUrl.value?.trim() || ''
  if (!url) return false
  // 只接受有效的 URL 格式
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/uploads/')
})

// 触发文件选择
const triggerUpload = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }
  
  // 验证文件大小
  const sizeMB = file.size / 1024 / 1024
  if (sizeMB > props.maxSize) {
    ElMessage.error(`图片大小不能超过 ${props.maxSize}MB`)
    return
  }
  
  // 上传文件
  uploading.value = true
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await request.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    if (response.data.success) {
      imageUrl.value = response.data.data.url
      ElMessage.success('上传成功')
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '上传失败')
  } finally {
    uploading.value = false
    // 清空 input，允许重复上传相同文件
    if (target) {
      target.value = ''
    }
  }
}

// 删除图片
const handleRemove = () => {
  imageUrl.value = ''
}
</script>

<style scoped>
.image-upload {
  width: 100%;
}

.image-preview {
  position: relative;
  width: 200px;
  height: 150px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-actions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview:hover .image-actions {
  opacity: 1;
}

.upload-area {
  width: 200px;
  height: 150px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: #409eff;
}

.upload-placeholder {
  text-align: center;
  color: #8c939d;
}

.upload-placeholder .el-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.upload-placeholder span {
  display: block;
  font-size: 14px;
}

.upload-tip {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 8px;
}

.upload-loading {
  text-align: center;
  color: #409eff;
}

.upload-loading .el-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.upload-loading span {
  display: block;
  font-size: 14px;
}
</style>
