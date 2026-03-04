<template>
  <div class="code-editor-container">
    <div class="editor-header">
      <div class="language-selector">
        <label for="language">编程语言:</label>
        <select id="language" v-model="selectedLanguage" @change="onLanguageChange">
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="csharp">C#</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
          <option value="typescript">TypeScript</option>
        </select>
      </div>
      
      <div class="editor-actions">
        <button class="btn btn-primary" @click="runCode" :disabled="isRunning">
          <span v-if="isRunning" class="loading-spinner"></span>
          {{ isRunning ? '运行中...' : '运行代码' }}
        </button> 
        <button class="btn btn-secondary" @click="clearOutput">清空输出</button>
        <button class="btn btn-ghost" @click="resetCode">重置代码</button>
        <button class="btn btn-accent" @click="goToFullscreenEditor">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          进入全屏编辑器
        </button>
      </div>
    </div>

    <div class="editor-main">
      <div class="code-panel">
        <div class="panel-header">
          <span class="panel-title">代码编辑器</span>
          <div class="file-info">{{ getFileExtension() }}</div>
        </div>
        <div class="code-input-container">
          <textarea
            class="simple-editor-textarea"
            v-model="codeContent"
            :placeholder="getPlaceholder()"
          />
        </div>
      </div>
      
      <div class="output-panel">
        <div class="panel-header">
          <span class="panel-title">运行结果</span>
          <div class="output-tabs">
            <button 
              v-for="tab in outputTabs" 
              :key="tab.id"
              :class="['tab-btn', { active: activeTab === tab.id }]"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
        
        <div class="panel-content">
          <!-- 控制台输出 -->
          <div v-show="activeTab === 'console'" class="console-output">
            <div v-if="output.console.length === 0" class="empty-output">
              运行代码后，输出将显示在这里...
            </div>
            <div v-else class="output-lines">
              <div 
                v-for="(line, index) in output.console" 
                :key="index"
                :class="['output-line', line.type]"
              >
                <span class="line-number">{{ index + 1 }}</span>
                <span class="line-content">{{ line.content }}</span>
              </div>
            </div>
          </div>
          
          <!-- 错误信息 -->
          <div v-show="activeTab === 'errors'" class="error-output">
            <div v-if="output.errors.length === 0" class="empty-output">
              没有错误信息
            </div>
            <div v-else class="error-lines">
              <div 
                v-for="(error, index) in output.errors" 
                :key="index"
                class="error-line"
              >
                <span class="error-icon">❌</span>
                <span class="error-message">{{ error.message }}</span>
                <span v-if="error.line" class="error-location">第 {{ error.line }} 行</span>
              </div>
            </div>
          </div>
          
          <!-- 执行时间 -->
          <div v-show="activeTab === 'performance'" class="performance-output">
            <div v-if="output.executionTime === 0" class="empty-output">
              运行代码后，性能信息将显示在这里...
            </div>
            <div v-else class="performance-info">
              <div class="perf-item">
                <span class="perf-label">执行时间:</span>
                <span class="perf-value">{{ output.executionTime }}ms</span>
              </div>
              <div class="perf-item">
                <span class="perf-label">内存使用:</span>
                <span class="perf-value">{{ output.memoryUsage }}MB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { codeExecutionService, type ExecutionResult } from '@/services/codeExecutionService'

const router = useRouter()

// 组件属性
interface Props {
  initialCode?: string
  language?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialCode: '',
  language: 'javascript'
})

// 响应式数据
const selectedLanguage = ref(props.language)
const codeContent = ref(props.initialCode)
const isRunning = ref(false)
const activeTab = ref('console')
const isDarkTheme = ref(true)

// 输出数据
const output = ref({
  console: [] as Array<{ type: 'log' | 'error' | 'warn' | 'info', content: string }>,
  errors: [] as Array<{ message: string, line?: number }>,
  executionTime: 0,
  memoryUsage: 0
})

// 输出标签页
const outputTabs = ref([
  { id: 'console', label: '控制台' },
  { id: 'errors', label: '错误' },
  { id: 'performance', label: '性能' }
])

// Textarea 模式无需专门配置

// 默认代码模板
const codeTemplates = {
  javascript: `// Vue 3 响应式基础示例
import { ref, computed } from 'vue';

export default {
  setup() {
    const count = ref(0);
    const doubleCount = computed(() => count.value * 2);

    const increment = () => {
      count.value++;
    };

    return {
      count,
      doubleCount,
      increment
    };
  }
};`,

  typescript: `// Vue 3 + TypeScript 示例
import { ref, computed, type Ref } from 'vue';

interface State {
  count: Ref<number>;
  doubleCount: Ref<number>;
}

export default {
  setup(): State {
    const count = ref<number>(0);
    const doubleCount = computed<number>(() => count.value * 2);

    return {
      count,
      doubleCount
    };
  }
};`,

  vue: `<!-- Vue 3 单文件组件 (SFC) 示例 -->
<script setup>
import { ref } from 'vue';

const message = ref('Hello Vue 3!');
const toggle = ref(true);
<\/script>

<template>
  <div class="demo">
    <h1>{{ message }}</h1>
    <button @click="toggle = !toggle">
      切换显示
    </button>
    <p v-if="toggle">现在你看到我了！</p>
  </div>
</template>

<style scoped>
.demo {
  color: #42b883;
}
</style>`,

  python: `# 虽然主要学习 Vue，但我们仍支持 Python 等语言
def hello_vue():
    print("Vue Learning 平台也支持 Python 运行！")

hello_vue()`,

  java: `// Java 代码示例
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Vue Learning!");
    }
}`,

  cpp: `// C++ 代码示例
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, Vue Learning!" << endl;
    return 0;
}`,

  csharp: `// C# 代码示例
using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, Vue Learning!");
    }
}`,

  go: `// Go 代码示例
package main
${'import'} "fmt"

func main() {
    fmt.Println("Hello, Vue Learning!")
}`,

  rust: `// Rust 代码示例
fn main() {
    println!("Hello, Vue Learning!");
}`
}

// 设置代码模板
const setCodeTemplate = (language: string) => {
  const template = codeTemplates[language as keyof typeof codeTemplates]
  if (template) {
    codeContent.value = template
  }
}

// 语言切换处理
const onLanguageChange = () => {
  setCodeTemplate(selectedLanguage.value)
}

// 获取文件扩展名
const getFileExtension = () => {
  const extensions = {
    javascript: '.js',
    python: '.py',
    java: '.java',
    cpp: '.cpp',
    csharp: '.cs',
    go: '.go',
    rust: '.rs',
    typescript: '.ts'
  }
  return extensions[selectedLanguage.value as keyof typeof extensions] || '.txt'
}

// 获取占位符文本
const getPlaceholder = () => {
  return `在这里输入你的 ${selectedLanguage.value} 代码...`
}


// 运行代码
const runCode = async () => {
  if (!codeContent.value.trim()) return
  
  isRunning.value = true
  clearOutput()
  
  try {
    const result = await codeExecutionService.executeCode({
      language: selectedLanguage.value,
      code: codeContent.value,
      timeout: 5000
    })
    
    // 处理执行结果
    if (result.success) {
      // 添加控制台输出
      result.output.forEach(line => {
        if (line.startsWith('[警告]')) {
          addOutput('warn', line.replace('[警告] ', ''))
        } else if (line.startsWith('[信息]')) {
          addOutput('info', line.replace('[信息] ', ''))
        } else {
          addOutput('log', line)
        }
      })
      
      // 添加错误信息
      result.errors.forEach(error => addError(error))
      
      // 更新性能信息
      output.value.executionTime = result.executionTime
      output.value.memoryUsage = result.memoryUsage
      
    } else {
      // 执行失败
      result.errors.forEach(error => addError(error))
      if (result.output.length > 0) {
        result.output.forEach(line => addOutput('info', line))
      }
    }
    
  } catch (error) {
    addError(error instanceof Error ? error.message : '执行出错')
  } finally {
    isRunning.value = false
  }
}

// 添加输出
const addOutput = (type: 'log' | 'error' | 'warn' | 'info', content: string) => {
  output.value.console.push({ type, content })
}

// 添加错误
const addError = (message: string, line?: number) => {
  output.value.errors.push({ message, line })
}

// 清空输出
const clearOutput = () => {
  output.value.console = []
  output.value.errors = []
  output.value.executionTime = 0
  output.value.memoryUsage = 0
}

// 重置代码
const resetCode = () => {
  setCodeTemplate(selectedLanguage.value)
  clearOutput()
}

// 进入全屏编辑器
const goToFullscreenEditor = () => {
  // 记录当前路由，以便返回时能够回到原位置
  const currentRoute = router.currentRoute.value
  sessionStorage.setItem('previousRoute', currentRoute.fullPath)
  // 记录当前滚动位置（优先记录主内容容器的滚动）
  try {
    const container = document.querySelector('.main-content') as HTMLElement | null
    const left = container ? container.scrollLeft : window.scrollX
    const top = container ? container.scrollTop : window.scrollY
    const scrollState = { path: currentRoute.fullPath, left, top, x: left, y: top }
    sessionStorage.setItem('restoreScroll', JSON.stringify(scrollState))
  } catch {}
  
  // 跳转到全屏编辑器
  router.push('/code-editor')
}

// 生命周期
onMounted(async () => {
  await nextTick()
  // 仅当没有传入初始代码时，才使用默认模板
  if (!codeContent.value || codeContent.value.trim() === '') {
    setCodeTemplate(selectedLanguage.value)
  }
})
</script>

<style scoped>
.code-editor-container {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  margin: 24px 0;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.language-selector label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.language-selector select {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-primary {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--bg-primary);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}

.btn-ghost:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.btn-accent {
  background: linear-gradient(135deg, var(--accent-color), #667eea);
  color: white;
  border-color: var(--accent-color);
}

.btn-accent:hover {
  background: linear-gradient(135deg, var(--accent-hover), #5a6fd8);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.editor-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  height: 600px;
}

.code-panel,
.output-panel {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-color);
  min-height: 0; /* 关键：避免子元素出现额外空白 */
}

.output-panel {
  border-right: none;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.file-info {
  font-size: 12px;
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
}

.output-tabs {
  display: flex;
  gap: 4px;
}

.tab-btn {
  padding: 4px 8px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: var(--accent-color);
  color: white;
}

.tab-btn:hover:not(.active) {
  background: var(--bg-tertiary);
}

.panel-content {
  flex: 1;
  overflow: hidden;
  min-height: 0; /* 关键：让内容区可以把高度让给编辑器 */
  background: var(--bg-primary);
}

.code-input-container {
  position: relative;
  height: 100%;
  display: flex;
  min-height: 0;
}

.simple-editor-textarea {
  flex: 1;
  width: 100%;
  height: 100%;
  resize: none;
  padding: 12px;
  outline: none;
  border: none;
  background: var(--code-bg, var(--bg-primary));
  color: var(--code-text, var(--text-primary));
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 22px;
}

.console-output,
.error-output,
.performance-output {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
}

.empty-output {
  text-align: center;
  color: var(--text-tertiary);
  font-style: italic;
  margin-top: 40px;
}

.output-lines {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.output-line {
  display: flex;
  gap: 12px;
  padding: 2px 0;
  border-bottom: 1px solid var(--border-color);
}

.output-line:last-child {
  border-bottom: none;
}

.line-number {
  color: var(--text-tertiary);
  font-size: 11px;
  min-width: 20px;
  text-align: right;
}

.line-content {
  flex: 1;
  word-break: break-all;
}

.output-line.log .line-content {
  color: var(--text-primary);
}

.output-line.error .line-content {
  color: #e53e3e;
}

.output-line.warn .line-content {
  color: #d69e2e;
}

.output-line.info .line-content {
  color: var(--accent-color);
}

.error-lines {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.error-line {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
}

.error-line:last-child {
  border-bottom: none;
}

.error-icon {
  font-size: 16px;
}

.error-message {
  flex: 1;
  color: #e53e3e;
}

.error-location {
  font-size: 12px;
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
}

.performance-info {
  padding: 16px;
}

.perf-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
}

.perf-item:last-child {
  border-bottom: none;
}

.perf-label {
  color: var(--text-secondary);
  font-size: 14px;
}

.perf-value {
  color: var(--accent-color);
  font-weight: 600;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .editor-main {
    grid-template-columns: 1fr;
    height: auto;
  }
  
  .code-panel {
    height: 400px;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }
  
  .output-panel {
    height: 300px;
  }
}

@media (max-width: 768px) {
  .editor-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .editor-actions {
    justify-content: center;
  }
}
</style>
