<template>
  <div ref="editorContainer" class="monaco-editor-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

// 配置 Monaco Editor workers
self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

const props = defineProps<{
  modelValue: string
  language?: string
  theme?: string
  readOnly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const editorContainer = ref<HTMLElement | null>(null)
let editorInstance: any = null

onMounted(() => {
  if (editorContainer.value) {
    // 定义自定义主题
    monaco.editor.defineTheme('vue-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: 'C586C0' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'tag', foreground: '569CD6' },
        { token: 'attribute.name', foreground: '9CDCFE' },
        { token: 'attribute.value', foreground: 'CE9178' },
      ],
      colors: {
        'editor.background': '#1a1a2e',
        'editor.foreground': '#d4d4d4',
        'editor.lineHighlightBackground': '#2a2a4a',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#c6c6c6',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41',
      }
    })

    editorInstance = monaco.editor.create(editorContainer.value, {
      value: props.modelValue,
      language: props.language || 'html',
      theme: props.theme || 'vue-dark',
      readOnly: props.readOnly || false,
      minimap: { enabled: false },
      fontSize: 14,
      fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      wordWrap: 'on',
      lineHeight: 22,
      renderLineHighlight: 'line',
    } as any)

    editorInstance.onDidChangeModelContent(() => {
      const value = editorInstance?.getValue() || ''
      emit('update:modelValue', value)
      emit('change', value)
    })
  }
})

watch(() => props.modelValue, (newValue) => {
  if (editorInstance && newValue !== editorInstance.getValue()) {
    editorInstance.setValue(newValue)
  }
})

watch(() => props.language, (newLang) => {
  if (editorInstance && newLang) {
    const model = editorInstance.getModel()
    if (model) {
      monaco.editor.setModelLanguage(model, newLang)
    }
  }
})

onBeforeUnmount(() => {
  editorInstance?.dispose()
})

const format = async () => {
  if (editorInstance) {
    await editorInstance.getAction('editor.action.formatDocument')?.run()
  }
}

defineExpose({ format })
</script>

<style scoped>
.monaco-editor-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
  position: absolute;
  inset: 0;
}
</style>
