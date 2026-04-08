<template>
  <!-- 独立编辑器模式（非 html 语言或 showPreview=false） -->
  <div v-if="!isPreviewMode" class="cp-standalone">
    <div class="editor-header">
      <div class="header-left">
        <span class="language-badge">{{ language }}</span>
        <span v-if="title" class="editor-title">{{ title }}</span>
      </div>
      <div class="header-actions">
        <button v-if="!readOnly" class="action-btn" @click="formatCode" title="格式化代码">
          <span>✨</span>
        </button>
        <button class="action-btn" @click="copyCode" title="复制代码">
          <span>📋</span>
        </button>
        <button class="action-btn" @click="resetCode" title="重置代码">
          <span>🔄</span>
        </button>
      </div>
    </div>
    <div class="editor-container" :style="{ height: editorHeight }">
      <MonacoEditor
        ref="monacoRef"
        :modelValue="internalCode"
        @update:modelValue="handleChange"
        :language="monacoLanguage"
        :readOnly="readOnly"
      />
    </div>
  </div>

  <!-- 预览分栏模式（html） -->
  <div v-else class="code-preview-container" ref="editorMain">
    <!-- 代码编辑器 -->
    <div class="code-section" :style="{ width: editorWidth + '%' }">
      <div class="section-header">
        <span class="section-icon">📄</span>
        <span class="file-name">{{ fileName }}</span>
        <div class="header-actions">
          <button v-if="!readOnly" class="action-btn" @click="formatCode" title="格式化代码">
            <span>✨</span>
          </button>
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
          ref="monacoRef"
          :modelValue="internalCode"
          @update:modelValue="handleChange"
          :language="monacoLanguage"
          :readOnly="readOnly"
        />
      </div>
    </div>

    <!-- 可拖动分割线 -->
    <div
      class="resize-handle"
      :class="{ resizing: isResizing }"
      @pointerdown="startResize"
      @mouseenter="showResizeCursor"
      @mouseleave="hideResizeCursor"
      @dblclick="resetEditorWidth"
      title="拖拽调整大小，双击重置"
    >
      <div class="resize-indicator"></div>
    </div>

    <!-- 实时预览 -->
    <div class="preview-section" :style="{ width: (100 - editorWidth) + '%' }">
      <div class="section-header">
        <span class="section-icon">👁️</span>
        实时预览
      </div>
      <iframe
        class="preview-frame"
        :srcdoc="internalCode"
        sandbox="allow-scripts"
      ></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, useTemplateRef } from 'vue'
import MonacoEditor from './MonacoEditor.vue'
import { useResizableSplit } from '@/composables/useResizableSplit'
import { ElMessage } from 'element-plus'

interface Props {
  modelValue?: string
  initialCode?: string
  language?: string
  fileName?: string
  title?: string
  readOnly?: boolean
  height?: number | string
  showPreview?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  initialCode: '',
  language: 'html',
  fileName: 'index.html',
  title: '',
  readOnly: false,
  height: 300,
  showPreview: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
}>()

// 内部代码状态（非受控优先使用 initialCode，受控优先使用 modelValue）
const internalCode = ref(props.modelValue ?? props.initialCode)

// 同步外部 v-model 变化
watch(() => props.modelValue, (val) => {
  if (val !== undefined && val !== internalCode.value) {
    internalCode.value = val
  }
})

// 同步 initialCode 变化（仅非受控模式）
watch(() => props.initialCode, (val) => {
  if (props.modelValue === undefined) {
    internalCode.value = val
  }
})

// Monaco 语言映射
const monacoLanguage = computed(() => {
  const langMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'vue': 'vue',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'md': 'markdown',
    'markdown': 'markdown'
  }
  return langMap[props.language] || props.language
})

// 是否显示预览（未传 showPreview 时根据语言自动判断）
const isPreviewMode = computed(() => {
  if (props.showPreview !== undefined) return props.showPreview
  return props.language === 'html'
})

// 编辑器高度（仅独立模式使用）
const editorHeight = computed(() => {
  const h = props.height
  return typeof h === 'number' ? `${h}px` : h
})

// 处理代码变更
const handleChange = (val: string) => {
  internalCode.value = val
  emit('update:modelValue', val)
  emit('change', val)
}

// Monaco ref（用于格式化）
const monacoRef = useTemplateRef<{ format: () => Promise<void> }>('monacoRef')

const formatCode = async () => {
  await monacoRef.value?.format()
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(internalCode.value)
    ElMessage.success('代码已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动选择代码复制')
  }
}

const resetCode = () => {
  const base = props.modelValue ?? props.initialCode ?? ''
  internalCode.value = base
  emit('update:modelValue', base)
  emit('change', base)
  ElMessage.success('代码已重置')
}

// 可拖拽分隔条（仅预览模式使用）
const {
  editorMain,
  isResizing,
  codePanelWidth,
  startResize,
  resetToDefaultRatio,
  showResizeCursor,
  hideResizeCursor
} = useResizableSplit(0.5)

const editorWidth = computed(() => codePanelWidth.value * 10)

const resetEditorWidth = () => {
  resetToDefaultRatio()
}
</script>

<style scoped>
/* ── 独立编辑器模式 ── */
.cp-standalone {
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

/* ── 预览分栏模式 ── */
.code-preview-container {
  display: flex;
  flex-direction: row;
  flex: 1;
  overflow: hidden;
}

.code-section {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 200px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.section-icon {
  font-size: 14px;
}

.file-name {
  flex: 1;
}

/* ── 公共：编辑器容器 ── */
.editor-container {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* ── 公共：操作按钮 ── */
.header-actions {
  display: flex;
  gap: 6px;
  margin-left: auto;
}

.action-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  background: var(--bg-primary, #fff);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
}

.action-btn:hover {
  background: var(--bg-tertiary, #f1f5f9);
  border-color: var(--accent-color, #42b883);
}

/* ── 可拖动分割线 ── */
.resize-handle {
  position: relative;
  width: 8px;
  cursor: col-resize;
  user-select: none;
  z-index: 10;
  background: transparent;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resize-indicator {
  width: 4px;
  height: 40px;
  background: var(--border-color);
  border-radius: 2px;
  opacity: 0.5;
  transition: all 0.2s ease;
}

.resize-handle:hover {
  background: rgba(65, 184, 131, 0.1);
}

.resize-handle:hover .resize-indicator {
  opacity: 1;
  background: #41b883;
  height: 60px;
}

.resize-handle.resizing {
  background: rgba(65, 184, 131, 0.15);
}

.resize-handle.resizing .resize-indicator {
  opacity: 1;
  background: #41b883;
  height: 80px;
  box-shadow: 0 0 8px rgba(65, 184, 131, 0.4);
}

/* ── 预览区 ── */
.preview-section {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 200px;
}

.preview-frame {
  flex: 1;
  border: none;
  background: white;
}
</style>
