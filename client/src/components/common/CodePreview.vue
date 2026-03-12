<template>
  <div class="code-preview-container" ref="editorMain">
    <!-- 代码编辑器 -->
    <div class="code-section" :style="{ width: editorWidth + '%' }">
      <div class="section-header">
        <span class="section-icon">📄</span>
        {{ fileName }}
      </div>
      <div class="editor-container">
        <MonacoEditor
          :modelValue="modelValue"
          @update:modelValue="$emit('update:modelValue', $event)"
          :language="language"
          @change="$emit('change')"
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
        :srcdoc="modelValue"
        :key="iframeKey"
      ></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MonacoEditor from './MonacoEditor.vue'
import { useResizableSplit } from '@/composables/useResizableSplit'

const props = withDefaults(defineProps<{
  modelValue: string
  language?: string
  fileName?: string
}>(), {
  language: 'html',
  fileName: 'index.html'
})

defineEmits<{
  'update:modelValue': [value: string]
  'change': []
}>()

// 添加一个key来强制iframe重新渲染
const iframeKey = ref(0)

// 监听modelValue变化，强制更新iframe
watch(() => props.modelValue, () => {
  iframeKey.value++
})

// 使用可拖拽分隔条 composable
const {
  editorMain,
  isResizing,
  codePanelWidth,
  outputPanelWidth,
  startResize,
  resetToDefaultRatio,
  showResizeCursor,
  hideResizeCursor
} = useResizableSplit(0.5)

// 将 codePanelWidth 转换为百分比
const editorWidth = computed(() => codePanelWidth.value * 10)

// 重置编辑器宽度
const resetEditorWidth = () => {
  resetToDefaultRatio()
}
</script>

<style scoped>
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

.editor-container {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* 可拖动分割线 */
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
