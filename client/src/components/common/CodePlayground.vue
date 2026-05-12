<template>
  <div class="code-playground">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button class="back-btn" @click="goBack">
          <span>←</span>
          返回
        </button>
        <div class="file-info">
          <span class="file-icon">📄</span>
          <span class="file-name">{{ fileName }}</span>
        </div>
      </div>
      
      <div class="toolbar-center">
        <div class="language-selector">
          <label>语言：</label>
          <select v-model="selectedLanguage">
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="html">HTML</option>
            <option value="vue">Vue</option>
          </select>
        </div>
      </div>
      
      <div class="toolbar-right">
        <button class="btn btn-secondary" @click="copyCode">
          <span>📋</span> 复制
        </button>
        <button class="btn btn-ghost" @click="resetCode">
          <span>🔄</span> 重置
        </button>
        <button class="btn btn-primary" @click="runCode" :disabled="isRunning">
          <span v-if="isRunning" class="spinner"></span>
          <span v-else>▶</span>
          {{ isRunning ? '运行中...' : '运行' }}
        </button>
      </div>
    </div>

    <!-- 主编辑区域 -->
    <div class="main-area">
      <!-- 代码编辑面板 -->
      <div class="editor-panel" :style="{ width: editorWidth + '%' }">
        <div class="panel-header">
          <span class="panel-title">代码编辑器</span>
        </div>
        <div class="editor-container">
          <MonacoEditor
            v-model="code"
            :language="monacoLanguage"
          />
        </div>
      </div>
      
      <!-- 分隔条 -->
      <div 
        class="resize-handle"
        @mousedown="startResize"
        @dblclick="resetLayout"
      >
        <div class="handle-bar"></div>
      </div>
      
      <!-- 输出面板 -->
      <div class="output-panel" :style="{ width: (100 - editorWidth) + '%' }">
        <div class="panel-header">
          <span class="panel-title">运行结果</span>
          <div class="output-tabs">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              :class="['tab-btn', { active: activeTab === tab.id }]"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
        
        <div class="output-content">
          <!-- 控制台 -->
          <div v-show="activeTab === 'console'" class="console-view">
            <div v-if="consoleOutput.length === 0" class="empty-state">
              <span class="empty-icon">💻</span>
              <p>运行代码后，输出将显示在这里</p>
              <p class="hint">提示：按 Ctrl+Enter 快速运行</p>
            </div>
            <div v-else class="console-lines">
              <div 
                v-for="(line, idx) in consoleOutput" 
                :key="idx"
                :class="['console-line', line.type]"
              >
                <span class="line-num">{{ idx + 1 }}</span>
                <span class="line-text">{{ line.text }}</span>
              </div>
            </div>
          </div>
          
          <!-- 预览 -->
          <div v-show="activeTab === 'preview'" class="preview-view">
            <iframe 
              v-if="selectedLanguage === 'html' || selectedLanguage === 'vue'"
              :srcdoc="previewHtml"
              class="preview-frame"
            ></iframe>
            <div v-else class="empty-state">
              <span class="empty-icon">👁️</span>
              <p>HTML / Vue 代码支持实时预览</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="status-bar">
      <div class="status-left">
        <span>行 {{ cursorLine }}</span>
        <span>列 {{ cursorCol }}</span>
        <span>{{ languageLabel }}</span>
      </div>
      <div class="status-right">
        <span v-if="executionTime > 0">执行: {{ executionTime }}ms</span>
        <span>{{ codeSize }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import MonacoEditor from '@/components/common/MonacoEditor.vue'
import { transform as sucraseTransform } from 'sucrase'

const router = useRouter()

// 状态
const selectedLanguage = ref('javascript')
const code = ref('')

// 每语言代码缓冲区
const codeBuffers = reactive<Record<string, string>>({})
const isRunning = ref(false)
const activeTab = ref('console')
const editorWidth = ref(50)
const cursorLine = ref(1)
const cursorCol = ref(1)
const executionTime = ref(0)
const consoleOutput = ref<Array<{ type: string; text: string }>>([])

// 标签页
const tabs = [
  { id: 'console', label: '控制台' },
  { id: 'preview', label: '预览' }
]

// 代码模板
const templates: Record<string, string> = {
  javascript: `// JavaScript 代码演练
console.log("🚀 欢迎使用代码演练场！");

// 示例：计数器
let count = 0;
const increment = () => {
  count++;
  console.log(\`当前计数: \${count}\`);
};

increment();
increment();
increment();

console.log("✅ 代码执行完成！");
`,
  typescript: `// TypeScript 代码演练
interface User {
  name: string;
  age: number;
}

const greet = (user: User): string => {
  return \`Hello, \${user.name}! You are \${user.age} years old.\`;
};

const user: User = { name: "Vue学习者", age: 25 };
console.log(greet(user));
`,
  html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; }

    body {
      background: #f0f4f8;
      min-height: 100vh;
    }

    /* 导航栏 */
    .navbar {
      background: #2c3e50;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .navbar .logo { color: #42b883; font-size: 1.4rem; font-weight: bold; }
    .navbar nav a {
      color: #ccc;
      text-decoration: none;
      margin-left: 1.5rem;
      transition: color 0.2s;
    }
    .navbar nav a:hover { color: #42b883; }

    /* 主内容 */
    .container {
      max-width: 960px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }

    /* 卡片网格 */
    .card-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    .card-icon { font-size: 2rem; margin-bottom: 0.8rem; }
    .card h3 { color: #2c3e50; margin-bottom: 0.5rem; }
    .card p { color: #666; font-size: 0.9rem; line-height: 1.6; }

    /* 按鈕 */
    .btn {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.5rem 1.2rem;
      background: #42b883;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: background 0.2s;
    }
    .btn:hover { background: #35a876; }

    /* 动画 */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .card { animation: fadeIn 0.4s ease both; }
    .card:nth-child(2) { animation-delay: 0.1s; }
    .card:nth-child(3) { animation-delay: 0.2s; }

    /* 响应式 */
    @media (max-width: 600px) {
      .card-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="navbar">
    <span class="logo">Vue Learning</span>
    <nav>
      <a href="#">首页</a>
      <a href="#">课程</a>
      <a href="#">资源</a>
    </nav>
  </div>
  <div class="container">
    <div class="card-grid">
      <div class="card">
        <div class="card-icon">🚀</div>
        <h3>Vue 3 基础</h3>
        <p>学习组合式 API、响应式系统和组件开发</p>
        <button class="btn">开始学习</button>
      </div>
      <div class="card">
        <div class="card-icon">🎨</div>
        <h3>CSS 效果</h3>
        <p>运用 Grid、Flex、动画创建现代界面</p>
        <button class="btn">开始学习</button>
      </div>
      <div class="card">
        <div class="card-icon">⚡</div>
        <h3>JavaScript</h3>
        <p>深入理解异步、闭包、原型链等核心概念</p>
        <button class="btn">开始学习</button>
      </div>
    </div>
  </div>
</body>
</html>
`,
  vue: `<template>
  <div class="app">
    <h1>{{ message }}</h1>
    <button @click="count++">
      点击次数: {{ count }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const message = ref('Hello Vue 3!')
const count = ref(0)
<\/script>

<style scoped>
.app {
  text-align: center;
  padding: 40px;
  font-family: sans-serif;
}
h1 { color: #42b883; }
button {
  padding: 10px 20px;
  font-size: 16px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
button:hover { background: #35495e; }
</style>
`
}

// 计算属性
const monacoLanguage = computed(() => {
  const map: Record<string, string> = {
    javascript: 'javascript',
    typescript: 'typescript',
    html: 'html',
    vue: 'html'
  }
  return map[selectedLanguage.value] || 'javascript'
})

const fileName = computed(() => {
  const names: Record<string, string> = {
    javascript: 'main.js',
    typescript: 'main.ts',
    html: 'index.html',
    vue: 'App.vue'
  }
  return names[selectedLanguage.value] || 'main.js'
})

const languageLabel = computed(() => {
  const labels: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    html: 'HTML',
    vue: 'Vue SFC'
  }
  return labels[selectedLanguage.value] || 'JavaScript'
})

const codeSize = computed(() => {
  const bytes = new Blob([code.value]).size
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
})


const buildVueSfcPreview = (sfcCode: string): string => {
  const tplMatch = sfcCode.match(/<template>([\s\S]*?)<\/template>/)
  const scriptMatch = sfcCode.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)
  const styleMatch = sfcCode.match(/<style\b[^>]*>([\s\S]*?)<\/style>/)

  const template = tplMatch?.[1]?.trim() || '<div>无 template</div>'
  let script = scriptMatch?.[1]?.trim() || ''
  const style = styleMatch?.[1]?.trim() || ''

  // 移除 Vue 核心 import（在 vue.global.js 中以全局方式提供）
  script = script.replace(/^import\s+\{[^}]*\}\s+from\s+['"]vue['"];?\s*\n?/gm, '')
  // 移除其他 import
  script = script.replace(/^import\s+.+;?\s*\n?/gm, '')
  // 替换 defineProps / defineEmits 为空操作
  script = script.replace(/const\s+(\w+)\s*=\s*defineProps(?:<[^>]*>)?\([^)]*\);?/g, 'const $1 = {};')
  script = script.replace(/const\s+(\w+)\s*=\s*defineEmits(?:<[^>]*>)?\([^)]*\);?/g, 'const $1 = () => {};')
  script = script.replace(/defineProps(?:<[\s\S]*?>)?\([^)]*\);?\n?/g, '')
  script = script.replace(/defineEmits(?:<[\s\S]*?>)?\([^)]*\);?\n?/g, '')

  // 处理 TypeScript：用 sucrase 转译
  const isTs = /<script\b[^>]*lang=["']ts["']/.test(sfcCode)
  if (isTs) {
    try {
      const result = sucraseTransform(script, { transforms: ['typescript'] })
      script = result.code
    } catch (_) { /* 转译失败则尝试原文执行 */ }
  }

  // 提取顶层变量/函数名，自动构建 return 语句
  const names = new Set<string>()
  const re = /^(?:const|let|var|async function|function)\s+([a-zA-Z_$]\w*)/gm
  let m
  while ((m = re.exec(script)) !== null) names.add(m[1])
  const returnStmt = names.size > 0 ? `return { ${[...names].join(', ')} }` : 'return {}'

  // 转义模板中的反引号
  const safeTpl = template.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"><\/script>
  ${style ? `<style>${style}<\/style>` : ''}
</head>
<body>
  <div id="app"></div>
  <script>
    const { createApp, ref, computed, reactive, watch, watchEffect,
            onMounted, onUnmounted, onUpdated, nextTick,
            toRef, toRefs, isRef, unref, provide, inject } = Vue;
    const defineProps = () => ({});
    const defineEmits = () => () => {};

    createApp({
      template: \`${safeTpl}\`,
      setup() {
        try {
          ${script}
          ${returnStmt}
        } catch(e) {
          console.error('[Vue setup error]', e.message);
          return {};
        }
      }
    }).mount('#app');
  <\/script>
</body>
</html>`
}

const previewHtml = computed(() => {
  if (selectedLanguage.value === 'html') {
    return code.value
  }
  if (selectedLanguage.value === 'vue') {
    return buildVueSfcPreview(code.value)
  }
  return ''
})

// 方法
const goBack = () => {
  router.back()
}

watch(selectedLanguage, (newLang, oldLang) => {
  codeBuffers[oldLang] = code.value
  code.value = codeBuffers[newLang] ?? templates[newLang] ?? ''
  consoleOutput.value = []
})

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(code.value)
    showToast('代码已复制')
  } catch {
    showToast('复制失败')
  }
}

const resetCode = () => {
  code.value = templates[selectedLanguage.value] || ''
  consoleOutput.value = []
  showToast('代码已重置')
}

const runCode = async () => {
  if (selectedLanguage.value === 'html' || selectedLanguage.value === 'vue') {
    activeTab.value = 'preview'
    return
  }
  
  isRunning.value = true
  consoleOutput.value = []
  const startTime = performance.now()
  
  let codeToRun = code.value
  
  if (selectedLanguage.value === 'typescript') {
    try {
      const result = sucraseTransform(codeToRun, { transforms: ['typescript'] })
      codeToRun = result.code
    } catch (err: any) {
      consoleOutput.value = [{ type: 'error', text: `TypeScript 转译失败: ${err.message}` }]
      isRunning.value = false
      return
    }
  }
  
  try {
    // 创建沙箱执行环境
    const logs: Array<{ type: string; text: string }> = []
    const sandbox = {
      console: {
        log: (...args: any[]) => logs.push({ type: 'log', text: args.map((a: any) => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') }),
        error: (...args: any[]) => logs.push({ type: 'error', text: args.map((a: any) => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }),
        warn: (...args: any[]) => logs.push({ type: 'warn', text: args.map((a: any) => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }),
        info: (...args: any[]) => logs.push({ type: 'info', text: args.map((a: any) => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') })
      }
    }

    // DOM 沙箱补丁：让 DOMContentLoaded 立即触发，getElementById 返回桩对象，mock fetch
    const domPreamble = `
;(function() {
  var _origAddEL = document.addEventListener.bind(document);
  document.addEventListener = function(evt, fn, opts) {
    if (evt === 'DOMContentLoaded') { try { fn(); } catch(e) { console.error(e.message); } }
    else { _origAddEL(evt, fn, opts); }
  };
  var _origGetById = document.getElementById.bind(document);
  document.getElementById = function(id) {
    return _origGetById(id) || {
      addEventListener: function(){}, removeEventListener: function(){},
      submit: function(){}, reset: function(){},
      querySelector: function(){ return null; }, querySelectorAll: function(){ return []; },
      style: {}, classList: { add:function(){}, remove:function(){}, toggle:function(){}, contains:function(){ return false; } },
      value: '', textContent: '', innerHTML: ''
    };
  };
  window.fetch = function(url) {
    console.warn('[沙箱] fetch 已拦截: ' + url);
    return Promise.resolve({
      ok: true, status: 200,
      json: function() { return Promise.resolve({ code: 200, message: 'mock ok', data: {}, success: true }); },
      text: function() { return Promise.resolve(''); },
      headers: { get: function() { return null; } }
    });
  };
})();
`
    const fn = new Function(...Object.keys(sandbox), domPreamble + codeToRun)
    fn(...Object.values(sandbox))
    
    consoleOutput.value = logs
    executionTime.value = Math.round(performance.now() - startTime)
    activeTab.value = 'console'
  } catch (err: any) {
    consoleOutput.value = [{ type: 'error', text: err.message }]
  } finally {
    isRunning.value = false
  }
}


const showToast = (msg: string) => {
  const toast = document.createElement('div')
  toast.textContent = msg
  toast.style.cssText = `
    position: fixed; top: 20px; right: 20px;
    background: var(--accent-color, #42b883); color: white;
    padding: 10px 16px; border-radius: 6px; z-index: 10000;
  `
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 2000)
}

// 拖拽调整布局
let isResizing = false
const startResize = (e: MouseEvent) => {
  isResizing = true
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
}

const onResize = (e: MouseEvent) => {
  if (!isResizing) return
  const container = document.querySelector('.main-area') as HTMLElement
  if (!container) return
  const rect = container.getBoundingClientRect()
  const percent = ((e.clientX - rect.left) / rect.width) * 100
  editorWidth.value = Math.max(20, Math.min(80, percent))
}

const stopResize = () => {
  isResizing = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
}

const resetLayout = () => {
  editorWidth.value = 50
}

// 键盘快捷键
const handleKeydown = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault()
    runCode()
  }
}

onMounted(() => {
  const savedCode = sessionStorage.getItem('playground_code')
  const savedLang = sessionStorage.getItem('playground_language')
  if (savedCode) {
    const lang = savedLang && ['javascript', 'typescript', 'html', 'vue'].includes(savedLang)
      ? savedLang
      : 'html'
    selectedLanguage.value = lang
    code.value = savedCode
    if (lang === 'html' || lang === 'vue') {
      activeTab.value = 'preview'
    }
    sessionStorage.removeItem('playground_code')
    sessionStorage.removeItem('playground_language')
  } else {
    code.value = templates[selectedLanguage.value] || ''
  }
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.code-playground {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  color: var(--text-primary);
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.toolbar-left, .toolbar-center, .toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  border-color: var(--accent-color);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.language-selector select {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 主区域 */
.main-area {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-panel, .output-panel {
  display: flex;
  flex-direction: column;
  min-width: 200px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.panel-title {
  font-weight: 600;
  font-size: 14px;
}


.editor-container {
  flex: 1;
  position: relative;
}

/* 分隔条 */
.resize-handle {
  width: 6px;
  background: var(--bg-secondary);
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resize-handle:hover {
  background: var(--accent-color);
}

.handle-bar {
  width: 2px;
  height: 40px;
  background: var(--border-color);
  border-radius: 1px;
}

/* 输出标签 */
.output-tabs {
  display: flex;
  gap: 4px;
}

.tab-btn {
  padding: 4px 10px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
}

.tab-btn.active {
  background: var(--accent-color);
  color: white;
}

/* 输出内容 */
.output-content {
  flex: 1;
  overflow: auto;
}

.console-view, .preview-view {
  height: 100%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-tertiary);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.hint {
  font-size: 12px;
  margin-top: 8px;
}

.console-lines {
  padding: 12px;
  font-family: 'Monaco', monospace;
  font-size: 13px;
}

.console-line {
  display: flex;
  gap: 12px;
  padding: 4px 0;
  border-bottom: 1px solid var(--border-color);
}

.line-num {
  color: var(--text-tertiary);
  min-width: 24px;
  text-align: right;
}

.console-line.error .line-text { color: #e53e3e; }
.console-line.warn .line-text { color: #d69e2e; }
.console-line.info .line-text { color: var(--accent-color); }

.preview-frame {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

/* 状态栏 */
.status-bar {
  display: flex;
  justify-content: space-between;
  padding: 6px 16px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  font-size: 12px;
  color: var(--text-tertiary);
}

.status-left, .status-right {
  display: flex;
  gap: 16px;
}
</style>
