<template>
  <div class="inline-code-editor">
    <div class="editor-header">
      <div class="header-left">
        <span class="language-badge">{{ language }}</span>
        <span v-if="title" class="editor-title">{{ title }}</span>
      </div>
      <div class="header-actions">
        <button class="action-btn" @click="copyCode" title="复制代码">
          <span>📋</span>
        </button>
        <button class="action-btn" @click="resetCode" title="重置代码">
          <span>🔄</span>
        </button>
      </div>
    </div>
    <div class="editor-container">
      <MonacoEditor
        :modelValue="code"
        @update:modelValue="handleCodeChange"
        :language="monacoLanguage"
        :readOnly="readOnly"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MonacoEditor from './MonacoEditor.vue'

interface Props {
  initialCode?: string
  language?: string
  title?: string
  readOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialCode: '',
  language: 'javascript',
  title: '',
  readOnly: false
})

const emit = defineEmits<{
  'update:code': [value: string]
  'change': [value: string]
}>()

const code = ref(props.initialCode)

// Monaco 语言映射
const monacoLanguage = computed(() => {
  const langMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'vue': 'html',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'md': 'markdown',
    'markdown': 'markdown'
  }
  return langMap[props.language] || props.language
})

// 监听 initialCode 变化
watch(() => props.initialCode, (newCode) => {
  code.value = newCode
})

const handleCodeChange = (newCode: string) => {
  code.value = newCode
  emit('update:code', newCode)
  emit('change', newCode)
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(code.value)
    showToast('代码已复制到剪贴板')
  } catch (err) {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = code.value
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    showToast('代码已复制')
  }
}

const resetCode = () => {
  code.value = props.initialCode
  emit('update:code', props.initialCode)
  emit('change', props.initialCode)
  showToast('代码已重置')
}

const showToast = (message: string) => {
  const toast = document.createElement('div')
  toast.textContent = message
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--accent-color, #42b883);
    color: white;
    padding: 10px 16px;
    border-radius: 6px;
    font-size: 14px;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease'
    setTimeout(() => toast.remove(), 300)
  }, 2000)
}
</script>

<style scoped>
.inline-code-editor {
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0;
  background: var(--bg-primary, #fff);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: var(--bg-secondary, #f8fafc);
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.language-badge {
  background: var(--accent-color, #42b883);
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.editor-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #1f2937);
}

.header-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  background: var(--bg-primary, #fff);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.action-btn:hover {
  background: var(--bg-tertiary, #f1f5f9);
  border-color: var(--accent-color, #42b883);
}

.editor-container {
  height: 300px;
  position: relative;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-10px); }
}
</style>
