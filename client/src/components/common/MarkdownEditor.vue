<template>
  <div class="markdown-editor" :class="{ fullscreen: isFullscreen }" :style="editorStyle">
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <button type="button" class="toolbar-btn" @click="insertText('**', '**')" title="粗体"><b>B</b></button>
        <button type="button" class="toolbar-btn italic-btn" @click="insertText('*', '*')" title="斜体"><i>I</i></button>
        <button type="button" class="toolbar-btn" @click="insertText('`', '`')" title="行内代码">&lt;/&gt;</button>
        <div class="toolbar-divider"></div>
        <button type="button" class="toolbar-btn" @click="insertText('# ', '')" title="标题 1">H1</button>
        <button type="button" class="toolbar-btn" @click="insertText('## ', '')" title="标题 2">H2</button>
        <button type="button" class="toolbar-btn" @click="insertText('### ', '')" title="标题 3">H3</button>
        <div class="toolbar-divider"></div>
        <button type="button" class="toolbar-btn" @click="insertText('- ', '')" title="无序列表">• 列表</button>
        <button type="button" class="toolbar-btn" @click="insertText('> ', '')" title="引用">❝ 引用</button>
        <button type="button" class="toolbar-btn" @click="insertCodeBlock" title="代码块">{ } 代码</button>
        <div class="toolbar-divider"></div>
        <button type="button" class="toolbar-btn" @click="insertLink" title="链接">🔗</button>
        <div class="toolbar-divider"></div>
        <button type="button" class="toolbar-btn import-btn" @click="triggerFileImport" title="导入 .md 文件">📂 导入</button>
        <input
          ref="fileInputRef"
          type="file"
          accept=".md,.markdown"
          style="display:none"
          @change="handleFileImport"
        />
      </div>

      <div class="toolbar-right">
        <button type="button" class="toolbar-btn" :class="{ active: showPreview }" @click="togglePreview" title="预览">
          {{ showPreview ? '编辑' : '预览' }}
        </button>
        <button type="button" class="toolbar-btn" @click="toggleFullscreen" title="全屏">
          {{ isFullscreen ? '退出全屏' : '全屏' }}
        </button>
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
        <div class="preview-content markdown-body" v-html="previewHtml" ref="previewRef"></div>
      </div>
    </div>

    <div class="status-bar">
      <div class="status-left">
        <span>行 {{ cursorLine }}</span>
        <span>列 {{ cursorCol }}</span>
        <span>{{ wordCount }} 字</span>
      </div>
      <div class="status-right">
        <span>支持 Markdown 语法</span>
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
  placeholder: '支持 Markdown 语法，可使用工具栏快速插入格式...',
  height: '300px'
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
  html: false,
  linkify: true,
  typographer: true,
  highlight: (str: string, lang: string): string => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, lang).value}</code></pre>`
      } catch { }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  }
})

const previewHtml = computed(() => {
  if (!content.value) return '<p class="empty-hint">预览将显示在这里...</p>'
  return DOMPurify.sanitize(md.render(content.value))
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

const insertLink = () => {
  const textarea = textareaRef.value
  if (!textarea) return
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = content.value.substring(start, end)
  const linkText = selectedText || '链接文字'
  const before = `[${linkText}](`
  const after = ')'
  content.value = content.value.substring(0, start) + before + 'https://' + after + content.value.substring(end)
  nextTick(() => {
    textarea.focus()
    const pos = start + before.length
    textarea.setSelectionRange(pos, pos + 8)
    updateCursorPosition()
  })
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
  document.body.style.overflow = isFullscreen.value ? 'hidden' : ''
}

const triggerFileImport = () => {
  fileInputRef.value?.click()
}

const handleFileImport = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    const text = ev.target?.result as string
    if (text !== undefined) {
      content.value = text
      emit('update:modelValue', text)
    }
  }
  reader.readAsText(file, 'UTF-8')
  // reset so same file can be re-imported
  ;(e.target as HTMLInputElement).value = ''
}

const syncScroll = () => {
  if (!showPreview.value || !textareaRef.value || !previewRef.value) return
  const textarea = textareaRef.value
  const preview = previewRef.value
  const scrollPercent = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight)
  preview.scrollTop = scrollPercent * (preview.scrollHeight - preview.clientHeight)
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
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-primary, #fff);
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;
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
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px 10px;
  background: var(--bg-secondary, #f8fafc);
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  flex-shrink: 0;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-wrap: wrap;
}

.toolbar-btn {
  min-width: 28px;
  height: 26px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.15s;
  white-space: nowrap;
}

.toolbar-btn:hover {
  background: var(--bg-primary, #fff);
  border-color: var(--border-color, #e5e7eb);
  color: var(--text-primary, #1f2937);
}

.toolbar-btn.active {
  background: var(--accent-color, #3b82f6);
  color: #fff;
  border-color: transparent;
}

.italic-btn {
  font-style: italic;
}

.toolbar-divider {
  width: 1px;
  height: 18px;
  background: var(--border-color, #e5e7eb);
  margin: 0 2px;
  flex-shrink: 0;
}

.editor-container {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.editor-pane {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color, #e5e7eb);
  overflow: hidden;
}

.editor-container:not(.show-preview) .editor-pane {
  border-right: none;
}

.markdown-textarea {
  flex: 1;
  padding: 14px 16px;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.7;
  background: var(--bg-primary, #fff);
  color: var(--text-primary, #1f2937);
  width: 100%;
  box-sizing: border-box;
}

.preview-pane {
  width: 50%;
  overflow-y: auto;
  background: var(--bg-primary, #fff);
}

.preview-content {
  padding: 14px 16px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-primary, #1f2937);
}

.preview-content :deep(.empty-hint) {
  color: var(--text-tertiary, #9ca3af);
  font-style: italic;
  text-align: center;
  margin-top: 40px;
}

.preview-content :deep(h1),
.preview-content :deep(h2),
.preview-content :deep(h3) {
  color: var(--text-primary, #1f2937);
  margin: 16px 0 8px 0;
  font-weight: 700;
}

.preview-content :deep(h1) { font-size: 22px; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; }
.preview-content :deep(h2) { font-size: 18px; }
.preview-content :deep(h3) { font-size: 16px; }

.preview-content :deep(p) {
  margin: 8px 0;
  color: var(--text-secondary, #6b7280);
}

.preview-content :deep(ul),
.preview-content :deep(ol) {
  margin: 8px 0;
  padding-left: 22px;
  color: var(--text-secondary, #6b7280);
}

.preview-content :deep(blockquote) {
  margin: 12px 0;
  padding: 10px 14px;
  border-left: 4px solid var(--accent-color, #3b82f6);
  background: var(--bg-secondary, #f8fafc);
  color: var(--text-secondary, #6b7280);
  border-radius: 0 6px 6px 0;
}

.preview-content :deep(code) {
  padding: 1px 5px;
  background: var(--bg-secondary, #f8fafc);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 4px;
  font-family: 'Monaco', monospace;
  font-size: 12px;
}

.preview-content :deep(pre) {
  margin: 12px 0;
  padding: 14px;
  background: #1e293b;
  border-radius: 6px;
  overflow-x: auto;
}

.preview-content :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
  color: #e2e8f0;
  font-size: 13px;
}

.preview-content :deep(a) {
  color: var(--accent-color, #3b82f6);
  text-decoration: none;
}

.preview-content :deep(a:hover) {
  text-decoration: underline;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 12px;
  background: var(--bg-secondary, #f8fafc);
  border-top: 1px solid var(--border-color, #e5e7eb);
  font-size: 11px;
  color: var(--text-tertiary, #9ca3af);
  flex-shrink: 0;
}

.status-left,
.status-right {
  display: flex;
  gap: 12px;
}
</style>
