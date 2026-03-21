<template>
  <div class="markdown-editor" :class="{ fullscreen: isFullscreen }" :style="editorStyle">
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <button type="button" class="toolbar-btn" @click="insertText('**', '**')" title="粗体">B</button>
        <button type="button" class="toolbar-btn" @click="insertText('*', '*')" title="斜体">I</button>
        <button type="button" class="toolbar-btn" @click="insertText('`', '`')" title="行内代码">&lt;/&gt;</button>
        <div class="toolbar-divider"></div>
        <button type="button" class="toolbar-btn" @click="insertText('# ', '')" title="标题 1">H1</button>
        <button type="button" class="toolbar-btn" @click="insertText('## ', '')" title="标题 2">H2</button>
        <button type="button" class="toolbar-btn" @click="insertText('### ', '')" title="标题 3">H3</button>
        <div class="toolbar-divider"></div>
        <button type="button" class="toolbar-btn" @click="insertText('- ', '')" title="无序列表">-</button>
        <button type="button" class="toolbar-btn" @click="insertText('1. ', '')" title="有序列表">1.</button>
        <button type="button" class="toolbar-btn" @click="insertText('> ', '')" title="引用">&gt;</button>
        <div class="toolbar-divider"></div>
        <button type="button" class="toolbar-btn" @click="insertCodeBlock" title="代码块">{ }</button>
        <button type="button" class="toolbar-btn" @click="insertEditorBlock" title="代码编辑器">ED</button>
      </div>

      <div class="toolbar-right">
        <input
          ref="fileInputRef"
          type="file"
          accept=".md,.markdown,.txt"
          @change="handleFileImport"
          style="display: none"
        />
        <button type="button" class="toolbar-btn" @click="triggerFileImport" title="导入文件">Import</button>
        <button type="button" class="toolbar-btn" @click="exportAsFile" title="导出文件">Export</button>
        <button type="button" class="toolbar-btn" :class="{ active: showPreview }" @click="togglePreview" title="预览">Preview</button>
        <button type="button" class="toolbar-btn" @click="toggleFullscreen" title="全屏">Full</button>
      </div>
    </div>

    <div class="editor-container" :class="{ 'show-preview': showPreview }">
      <div class="editor-pane" :style="{ width: showPreview ? '50%' : '100%' }">
        <textarea
          ref="textareaRef"
          v-model="content"
          @input="handleInput"
          @keydown="handleKeydown"
          @scroll="syncScroll"
          class="markdown-textarea"
          :placeholder="placeholder"
          spellcheck="false"
        ></textarea>
      </div>

      <div v-if="showPreview" class="preview-pane">
        <div class="preview-content" v-html="previewHtml" ref="previewRef"></div>
      </div>
    </div>

    <div class="status-bar">
      <div class="status-left">
        <span>行 {{ cursorLine }}</span>
        <span>列 {{ cursorCol }}</span>
        <span>{{ wordCount }} 字</span>
      </div>
      <div class="status-right">
        <span>Markdown</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'

interface Props {
  modelValue: string
  placeholder?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '在此输入 Markdown 内容...',
  height: '500px'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const content = ref(props.modelValue)
const showPreview = ref(false)
const isFullscreen = ref(false)
const cursorLine = ref(1)
const cursorCol = ref(1)
const textareaRef = ref<HTMLTextAreaElement>()
const previewRef = ref<HTMLDivElement>()
const fileInputRef = ref<HTMLInputElement>()

const md = new MarkdownIt({
  html: true,
  highlight: (str: string, lang: string): string => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code class="hljs">${hljs.highlight(str, { language: lang }).value}</code></pre>`
      } catch { }
    }
    return `<pre class="hljs"><code class="hljs">${str.replace(/[&<>"']/g, (char) => {
      const entities: { [key: string]: string } = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
      return entities[char]
    })}</code></pre>`
  }
})

const previewHtml = computed(() => {
  if (!content.value) return '<p class="empty-hint">预览将显示在这里...</p>'
  const rawHtml = md.render(content.value)
  return DOMPurify.sanitize(rawHtml)
})

const wordCount = computed(() => content.value.replace(/\s/g, '').length)

const editorStyle = computed(() => ({
  height: isFullscreen.value ? '100vh' : props.height
}))

watch(content, (newValue) => {
  emit('update:modelValue', newValue)
})

watch(() => props.modelValue, (newValue) => {
  if (newValue !== content.value) {
    content.value = newValue
  }
})

const handleInput = () => {
  updateCursorPosition()
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Tab') {
    e.preventDefault()
    insertText('  ', '')
  }

  if (e.ctrlKey && e.key === 'b') {
    e.preventDefault()
    insertText('**', '**')
  }

  if (e.ctrlKey && e.key === 'i') {
    e.preventDefault()
    insertText('*', '*')
  }

  if (e.ctrlKey && e.key === '`') {
    e.preventDefault()
    insertText('`', '`')
  }

  if (e.key === 'F11') {
    e.preventDefault()
    toggleFullscreen()
  }

  nextTick(updateCursorPosition)
}

const insertText = (before: string, after: string) => {
  const textarea = textareaRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = content.value.substring(start, end)

  const newText = before + selectedText + after
  content.value = content.value.substring(0, start) + newText + content.value.substring(end)

  nextTick(() => {
    textarea.focus()
    const newCursorPos = start + before.length + selectedText.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
    updateCursorPosition()
  })
}

const insertCodeBlock = () => {
  insertText('\n```javascript\n', '\n```\n')
}

const insertEditorBlock = () => {
  insertText('\n```editor:javascript\n', '\n```\n')
}

const updateCursorPosition = () => {
  const textarea = textareaRef.value
  if (!textarea) return

  const text = content.value.substring(0, textarea.selectionStart)
  const lines = text.split('\n')
  cursorLine.value = lines.length
  cursorCol.value = lines[lines.length - 1].length + 1
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const syncScroll = () => {
  if (!showPreview.value || !textareaRef.value || !previewRef.value) return

  const textarea = textareaRef.value
  const preview = previewRef.value
  const scrollPercent = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight)
  preview.scrollTop = scrollPercent * (preview.scrollHeight - preview.clientHeight)
}

// 文件导入/导出功能
const triggerFileImport = () => {
  fileInputRef.value?.click()
}

const handleFileImport = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  // 如果当前有内容，提示用户确认
  if (content.value.trim()) {
    const confirmed = confirm('导入文件将替换当前编辑器中的所有内容，是否继续？')
    if (!confirmed) {
      target.value = '' // 清空选择
      return
    }
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const fileContent = e.target?.result as string
    if (fileContent) {
      content.value = fileContent
      updateCursorPosition()
    }
  }
  reader.readAsText(file, 'UTF-8')
  
  // 清空 input，允许重复选择同一文件
  target.value = ''
}

const exportAsFile = () => {
  if (!content.value.trim()) {
    return
  }

  const blob = new Blob([content.value], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `markdown-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

onMounted(() => {
  updateCursorPosition()
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.markdown-editor {
  border: 1px solid var(--el-border-color, #e5e7eb);
  border-radius: 8px;
  background: var(--el-bg-color, #fff);
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
}

.markdown-editor.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  border-radius: 0;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--el-fill-color-lighter, #f8fafc);
  border-bottom: 1px solid var(--el-border-color, #e5e7eb);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-btn {
  min-width: 32px;
  height: 28px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: var(--el-text-color-secondary, #6b7280);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: var(--el-fill-color-light, #f1f5f9);
  border-color: var(--el-border-color, #e5e7eb);
}

.toolbar-btn.active {
  background: var(--el-color-primary, #409eff);
  color: #fff;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: var(--el-border-color, #e5e7eb);
  margin: 0 4px;
}

.editor-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-pane {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--el-border-color, #e5e7eb);
}

.editor-container:not(.show-preview) .editor-pane {
  border-right: none;
}

.markdown-textarea {
  flex: 1;
  padding: 16px;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  background: var(--el-bg-color, #fff);
  color: var(--el-text-color-primary, #1f2937);
}

.preview-pane {
  width: 50%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color, #fff);
}

.preview-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.6;
}

.preview-content .empty-hint {
  color: var(--el-text-color-secondary, #9ca3af);
  font-style: italic;
  text-align: center;
  margin-top: 40px;
}

.preview-content h1,
.preview-content h2,
.preview-content h3 {
  margin: 24px 0 16px 0;
  color: var(--el-text-color-primary, #1f2937);
}

.preview-content h1 {
  font-size: 24px;
  border-bottom: 1px solid var(--el-border-color, #e5e7eb);
  padding-bottom: 8px;
}

.preview-content h2 {
  font-size: 20px;
}

.preview-content h3 {
  font-size: 18px;
}

.preview-content p {
  margin: 12px 0;
  color: var(--el-text-color-secondary, #6b7280);
}

.preview-content ul,
.preview-content ol {
  margin: 12px 0;
  padding-left: 24px;
}

.preview-content li {
  margin: 4px 0;
  color: var(--el-text-color-secondary, #6b7280);
}

.preview-content blockquote {
  margin: 16px 0;
  padding: 12px 16px;
  border-left: 4px solid var(--el-color-primary, #409eff);
  background: var(--el-fill-color-lighter, #f8fafc);
  color: var(--el-text-color-secondary, #6b7280);
}

.preview-content code {
  padding: 2px 6px;
  background: var(--el-fill-color-lighter, #f8fafc);
  border: 1px solid var(--el-border-color, #e5e7eb);
  border-radius: 4px;
  font-family: 'Monaco', monospace;
  font-size: 13px;
}

.preview-content pre {
  margin: 16px 0;
  padding: 16px;
  background: #1a1a2e;
  border-radius: 6px;
  overflow-x: auto;
}

.preview-content pre code {
  background: none;
  border: none;
  padding: 0;
  color: #d4d4d4;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  background: var(--el-fill-color-lighter, #f8fafc);
  border-top: 1px solid var(--el-border-color, #e5e7eb);
  font-size: 12px;
  color: var(--el-text-color-secondary, #9ca3af);
}

.status-left,
.status-right {
  display: flex;
  gap: 16px;
}
</style>
