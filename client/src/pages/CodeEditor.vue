<template>
  <div class="fullscreen-code-editor">
    <!-- 顶部工具栏 -->
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <button class="back-btn" @click="goBack">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          返回首页
        </button>
        
        <div class="file-info">
          <span class="file-name">{{ getFileName() }}</span>
          <span class="file-extension">{{ getFileExtension() }}</span>
        </div>
      </div>
      
      <div class="toolbar-center">
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
      </div>
      
      <div class="toolbar-right">
        <button class="btn btn-secondary" @click="clearOutput">清空输出</button>
        <button class="btn btn-ghost" @click="resetCode">重置代码</button>
        <button class="btn btn-primary" @click="runCode" :disabled="isRunning">
          <span v-if="isRunning" class="loading-spinner"></span>
          {{ isRunning ? '运行中...' : '运行代码' }}
        </button>
      </div>
    </div>

    <!-- 主编辑区域 -->
    <div class="editor-main" ref="editorMain">
      <!-- 代码编辑面板 -->
      <div class="code-panel" :style="{ width: `${codePanelWidth * 10}%` }">
        <div class="code-header">
          <span class="panel-title">代码编辑器</span>
          <div class="code-actions">
            <button class="action-btn" @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '进入全屏'">
              <svg v-if="isFullscreen" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="header-actions">
              <button class="btn btn-primary btn-sm" @click="runCode" :disabled="isRunning">
                <span v-if="isRunning" class="loading-spinner"></span>
                {{ isRunning ? '运行中...' : '运行' }}
              </button>
              <button class="btn btn-ghost btn-sm" @click="resetCode" title="重置为模板">重置</button>
              <button class="btn btn-secondary btn-sm" @click="clearOutput" title="清空右侧输出">清空输出</button>
            </div>
          </div>
        </div>
        
        <div class="code-input-container">
          <textarea
            ref="codeTextarea"
            v-model="codeContent"
            :class="['code-textarea', `language-${selectedLanguage}`, `theme-${isDarkTheme ? 'dark' : 'light'}`]"
            :placeholder="getPlaceholder()"
            @input="handleCodeInput"
            @keydown.tab.prevent="handleTab"
            @keydown.enter="handleEnter"
            @keydown.ctrl.s.prevent="saveCode"
            @keydown.ctrl.enter.prevent="runCode"
          ></textarea>
          <div class="line-numbers">
            <span v-for="line in lineCount" :key="line" class="line-number">{{ line }}</span>
          </div>
        </div>
      </div>
      
      <!-- 可拖拽分隔条 -->
      <div 
        class="resize-handle"
        @mousedown="startResize"
        @mouseenter="showResizeCursor"
        @mouseleave="hideResizeCursor"
        @dblclick="resetToDefaultRatio"
        :class="{ 'resizing': isResizing }"
        title="拖拽调整大小，双击重置为 50/50"
      >
        <div class="resize-indicator"></div>
        <div class="resize-tooltip">双击重置</div>
      </div>
      
      <!-- 输出面板 -->
      <div class="output-panel" :style="{ width: `${outputPanelWidth * 10}%` }">
        <div class="output-header">
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
        
        <div class="output-content">
          <!-- 控制台输出 -->
          <div v-show="activeTab === 'console'" class="console-output">
            <div v-if="output.console.length === 0" class="empty-output">
              <div class="empty-icon">💻</div>
              <div class="empty-text">运行代码后，输出将显示在这里...</div>
              <div class="empty-tip">使用 Ctrl+Enter 快速运行代码</div>
            </div>
            <div v-else class="output-lines">
              <div class="output-header-actions">
                <button class="copy-btn" @click="copyConsoleOutput" title="复制所有输出">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 4v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.242a2 2 0 0 0-.586-1.414l-2.242-2.242A2 2 0 0 0 15.242 4H10a2 2 0 0 0-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16 18v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  复制输出
                </button>
                <button class="clear-btn" @click="clearConsoleOutput" title="清空控制台输出">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  清空
                </button>
              </div>
              <div 
                v-for="(line, index) in output.console" 
                :key="index"
                :class="['output-line', line.type]"
              >
                <span class="line-number">{{ index + 1 }}</span>
                <span class="line-content">{{ line.content }}</span>
                <button 
                  class="copy-line-btn" 
                  @click="copyLineOutput(line.content)"
                  title="复制此行"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 4v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.242a2 2 0 0 0-.586-1.414l-2.242-2.242A2 2 0 0 0 15.242 4H10a2 2 0 0 0-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16 18v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- 错误信息 -->
          <div v-show="activeTab === 'errors'" class="error-output">
            <div v-if="output.errors.length === 0" class="empty-output">
              <div class="empty-icon">✅</div>
              <div class="empty-text">没有错误信息</div>
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
          
          <!-- 性能信息 -->
          <div v-show="activeTab === 'performance'" class="performance-output">
            <div v-if="output.executionTime === 0" class="empty-output">
              <div class="empty-icon">📊</div>
              <div class="empty-text">运行代码后，性能信息将显示在这里...</div>
            </div>
            <div v-else class="performance-info">
              <div class="perf-item">
                <span class="perf-label">执行时间</span>
                <span class="perf-value">{{ formatExecutionTime(output.executionTime) }}</span>
              </div>
              <div class="perf-item">
                <span class="perf-label">内存使用</span>
                <span class="perf-value">{{ output.memoryUsage }}MB</span>
              </div>
              <div class="perf-item">
                <span class="perf-label">语言</span>
                <span class="perf-value">{{ getLanguageName() }}</span>
              </div>
              <div class="perf-item">
                <span class="perf-label">代码行数</span>
                <span class="perf-value">{{ getCodeLineCount() }}</span>
              </div>
              <div class="perf-item">
                <span class="perf-label">字符数</span>
                <span class="perf-value">{{ getCodeCharCount() }}</span>
              </div>
              <div class="perf-item">
                <span class="perf-label">运行状态</span>
                <span class="perf-value" :class="output.executionTime > 0 ? 'status-success' : 'status-pending'">
                  {{ output.executionTime > 0 ? '成功' : '待运行' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="status-bar">
      <div class="status-left">
        <span class="status-item">行 {{ currentLine }}</span>
        <span class="status-item">列 {{ currentColumn }}</span>
        <span class="status-item">{{ getLanguageName() }}</span>
        <span class="status-item">总行数 {{ getCodeLineCount() }}</span>
        <span class="status-item">字符数 {{ getCodeCharCount() }}</span>
      </div>
      <div class="status-right">
        <span class="status-item">{{ getFileSize() }}</span>
        <span class="status-item">{{ isDarkTheme ? '暗色' : '亮色' }}主题</span>
        <span v-if="output.executionTime > 0" class="status-item status-execution-time">
          执行: {{ formatExecutionTime(output.executionTime) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { codeExecutionService, type ExecutionResult } from '@/services/codeExecutionService'
import { useUserPrefs } from '@/stores/userPrefs'

const prefs = useUserPrefs()

const router = useRouter()

// 响应式数据
const codeTextarea = ref<HTMLTextAreaElement>()
const selectedLanguage = ref('javascript')
const codeContent = ref('')
const isRunning = ref(false)
const activeTab = ref('console')
const isDarkTheme = ref(true)
const isFullscreen = ref(false)
const currentLine = ref(1)
const currentColumn = ref(1)

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

// 计算行数
const lineCount = computed(() => {
  const lines = codeContent.value.split('\n')
  return Array.from({ length: Math.max(lines.length, 20) }, (_, i) => i + 1)
})

// 默认代码模板
const codeTemplates = {
  javascript: `// JavaScript 全屏代码编辑器
console.log("🚀 欢迎使用全屏代码编辑器！");

// 这是一个更复杂的示例
class Calculator {
  constructor() {
    this.history = [];
  }
  
  add(a, b) {
    const result = a + b;
    this.history.push(\`\${a} + \${b} = \${result}\`);
    return result;
  }
  
  multiply(a, b) {
    const result = a * b;
    this.history.push(\`\${a} × \${b} = \${result}\`);
    return result;
  }
  
  getHistory() {
    return this.history;
  }
}

// 创建计算器实例
const calc = new Calculator();

// 执行一些计算
console.log("计算结果:");
console.log("5 + 3 =", calc.add(5, 3));
console.log("4 × 7 =", calc.multiply(4, 7));
console.log("10 + 20 =", calc.add(10, 20));

// 显示计算历史
console.log("\\n计算历史:");
calc.getHistory().forEach((entry, index) => {
  console.log(\`\${index + 1}. \${entry}\`);
});

// 尝试修改上面的代码，然后按 Ctrl+Enter 运行！`,
  
  python: `# Python 全屏代码编辑器
print("🐍 欢迎使用 Python 全屏代码编辑器！")

# 这是一个更复杂的示例
class DataAnalyzer:
    def __init__(self):
        self.data = []
        self.stats = {}
    
    def add_data(self, value):
        self.data.append(value)
        self._update_stats()
    
    def _update_stats(self):
        if self.data:
            self.stats['count'] = len(self.data)
            self.stats['sum'] = sum(self.data)
            self.stats['average'] = self.stats['sum'] / self.stats['count']
            self.stats['min'] = min(self.data)
            self.stats['max'] = max(self.data)
    
    def get_stats(self):
        return self.stats

# 创建数据分析器
analyzer = DataAnalyzer()

# 添加一些数据
sample_data = [10, 25, 15, 30, 20, 35, 40, 5]
for value in sample_data:
    analyzer.add_data(value)

# 显示统计信息
print("数据分析结果:")
stats = analyzer.get_stats()
for key, value in stats.items():
    print(f"{key}: {value}")

# 尝试修改上面的代码，然后运行！`,
  
  typescript: `// TypeScript 全屏代码编辑器
console.log("🔷 欢迎使用 TypeScript 全屏代码编辑器！");

// 定义接口
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

interface UserManager {
  users: User[];
  addUser(user: User): void;
  findUser(id: number): User | undefined;
  getUsersByAge(minAge: number, maxAge: number): User[];
}

// 实现用户管理类
class UserManagerImpl implements UserManager {
  users: User[] = [];
  
  addUser(user: User): void {
    this.users.push(user);
    console.log(\`用户 \${user.name} 已添加\`);
  }
  
  findUser(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }
  
  getUsersByAge(minAge: number, maxAge: number): User[] {
    return this.users.filter(user => user.age >= minAge && user.age <= maxAge);
  }
}

// 创建用户管理器
const userManager = new UserManagerImpl();

// 添加一些用户
const users: User[] = [
  { id: 1, name: "张三", email: "zhangsan@example.com", age: 25 },
  { id: 2, name: "李四", email: "lisi@example.com", age: 30 },
  { id: 3, name: "王五", email: "wangwu@example.com", age: 28 }
];

users.forEach(user => userManager.addUser(user));

// 查找用户
const foundUser = userManager.findUser(2);
if (foundUser) {
  console.log("找到用户:", foundUser.name);
}

// 按年龄筛选用户
const youngUsers = userManager.getUsersByAge(25, 30);
console.log("年轻用户数量:", youngUsers.length);

// 尝试修改上面的代码，然后按 Ctrl+Enter 运行！`
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

// 获取文件名
const getFileName = () => {
  const names = {
    javascript: 'main.js',
    python: 'main.py',
    java: 'Main.java',
    cpp: 'main.cpp',
    csharp: 'Program.cs',
    go: 'main.go',
    rust: 'main.rs',
    typescript: 'main.ts'
  }
  return names[selectedLanguage.value as keyof typeof names] || 'main.txt'
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

// 获取语言名称
const getLanguageName = () => {
  const names = {
    javascript: 'JavaScript',
    python: 'Python',
    java: 'Java',
    cpp: 'C++',
    csharp: 'C#',
    go: 'Go',
    rust: 'Rust',
    typescript: 'TypeScript'
  }
  return names[selectedLanguage.value as keyof typeof names] || 'Unknown'
}

// 获取占位符文本
const getPlaceholder = () => {
  return `在这里输入你的 ${getLanguageName()} 代码...`
}

// 获取文件大小
const getFileSize = () => {
  const size = new Blob([codeContent.value]).size
  if (size < 1024) return `${size}B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`
  return `${(size / (1024 * 1024)).toFixed(1)}MB`
}

// 处理代码输入
const handleCodeInput = () => {
  updateCursorPosition()
}

// 更新光标位置
const updateCursorPosition = () => {
  if (codeTextarea.value) {
    const text = codeTextarea.value.value
    const cursorPos = codeTextarea.value.selectionStart
    
    const beforeCursor = text.substring(0, cursorPos)
    const lines = beforeCursor.split('\n')
    
    currentLine.value = lines.length
    currentColumn.value = lines[lines.length - 1].length + 1
  }
}

// 处理 Tab 键
const handleTab = (e: KeyboardEvent) => {
  const target = e.target as HTMLTextAreaElement
  const start = target.selectionStart
  const end = target.selectionEnd
  
  // 插入两个空格
  const newValue = codeContent.value.substring(0, start) + '  ' + codeContent.value.substring(end)
  codeContent.value = newValue
  
  // 设置光标位置
  nextTick(() => {
    target.selectionStart = target.selectionEnd = start + 2
    updateCursorPosition()
  })
}

// 处理回车键
const handleEnter = (e: KeyboardEvent) => {
  const target = e.target as HTMLTextAreaElement
  const start = target.selectionStart
  const beforeCursor = codeContent.value.substring(0, start)
  const afterCursor = codeContent.value.substring(start)
  
  // 获取当前行的缩进
  const currentLineText = beforeCursor.split('\n').pop() || ''
  const indent = currentLineText.match(/^(\s*)/)?.[1] || ''
  
  // 插入换行和缩进
  const newValue = beforeCursor + '\n' + indent + afterCursor
  codeContent.value = newValue
  
  // 设置光标位置
  nextTick(() => {
    const newPosition = start + 1 + indent.length
    target.selectionStart = target.selectionEnd = newPosition
    updateCursorPosition()
  })
}

// 保存代码
const saveCode = () => {
  // 这里可以实现代码保存功能
  console.log('代码已保存')
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
      timeout: 10000
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

// 切换主题
const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
  document.documentElement.setAttribute('data-theme', isDarkTheme.value ? 'dark' : 'light')
}

// 切换全屏
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 记录进入全屏编辑器前的路由
const previousRoute = ref('')

// 返回首页
const goBack = () => {
  // 如果有之前的路由记录，则返回到之前的位置
  if (previousRoute.value && previousRoute.value !== '/code-editor') {
    router.push(previousRoute.value)
    // 清除存储的路由记录
    sessionStorage.removeItem('previousRoute')
  } else {
    // 默认返回首页
    router.push('/home')
  }
}

// 设置之前的路由（从外部调用）
const setPreviousRoute = (route: string) => {
  previousRoute.value = route
}

// 监听全屏变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// 容器引用与拖拽分隔条相关
const editorMain = ref<HTMLElement | null>(null)
const isResizing = ref(false)
const codePanelWidth = ref(5) // 默认代码面板宽度（一半）
const outputPanelWidth = ref(5) // 默认输出面板宽度（一半）

const startResize = (e: MouseEvent | TouchEvent) => {
  isResizing.value = true
  
  // 防止拖拽时选中文本
  e.preventDefault()
  
  document.documentElement.addEventListener('mousemove', handleResize)
  document.documentElement.addEventListener('mouseup', stopResize)
  document.documentElement.addEventListener('touchmove', handleResize as any)
  document.documentElement.addEventListener('touchend', stopResize)
}

const handleResize = (e: MouseEvent | TouchEvent) => {
  if (!isResizing.value || !editorMain.value) return
  const rect = editorMain.value.getBoundingClientRect()
  const isMobile = window.innerWidth <= 1200
  if (isMobile) {
    let ratio = (('touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY) - rect.top) / rect.height
    ratio = Math.min(0.8, Math.max(0.2, ratio))
    codePanelWidth.value = ratio * 10
  } else {
    let ratio = (('touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX) - rect.left) / rect.width
    ratio = Math.min(0.8, Math.max(0.2, ratio))
    codePanelWidth.value = ratio * 10
  }
  outputPanelWidth.value = 10 - codePanelWidth.value
}

const stopResize = () => {
  if (!isResizing.value) return
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize as any)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('touchmove', handleResize as any)
  document.removeEventListener('touchend', stopResize)
  // 写入持久化（以百分比 0-100 存储）
  prefs.setCodePanelRatio(Math.round((codePanelWidth.value / 10) * 100))
}

const showResizeCursor = () => {
  const isMobile = window.innerWidth <= 1200
  document.documentElement.style.cursor = isMobile ? 'row-resize' : 'col-resize'
}

const hideResizeCursor = () => {
  document.documentElement.style.cursor = 'default'
}

// 双击恢复默认比例
const resetToDefaultRatio = () => {
  codePanelWidth.value = 5
  outputPanelWidth.value = 5
  prefs.setCodePanelRatio(50) // 持久化 50%
}

// 复制所有控制台输出
const copyConsoleOutput = async () => {
  try {
    const outputText = output.value.console.map(line => line.content).join('\n')
    if (!outputText.trim()) {
      alert('没有可复制的内容')
      return
    }
    
    await navigator.clipboard.writeText(outputText)
    showCopySuccess('控制台输出已复制到剪贴板！')
  } catch (err) {
    console.error('复制失败:', err)
    // 降级方案：使用传统的复制方法
    fallbackCopy(output.value.console.map(line => line.content).join('\n'))
  }
}

// 复制单行输出
const copyLineOutput = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    showCopySuccess('行输出已复制到剪贴板！')
  } catch (err) {
    console.error('复制失败:', err)
    fallbackCopy(content)
  }
}

// 降级复制方案
const fallbackCopy = (text: string) => {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.left = '-999999px'
  textArea.style.top = '-999999px'
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  
  try {
    document.execCommand('copy')
    showCopySuccess('已复制到剪贴板！')
  } catch (err) {
    alert('复制失败，请手动复制。')
  } finally {
    document.body.removeChild(textArea)
  }
}

// 显示复制成功提示
const showCopySuccess = (message: string) => {
  // 创建临时提示元素
  const toast = document.createElement('div')
  toast.className = 'copy-toast'
  toast.textContent = message
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--accent-color);
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    font-size: 14px;
    z-index: 10000;
    animation: slideIn 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `
  
  document.body.appendChild(toast)
  
  // 3秒后自动移除
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.animation = 'slideOut 0.3s ease'
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast)
        }
      }, 300)
    }
  }, 3000)
}

// 清空控制台输出
const clearConsoleOutput = () => {
  output.value.console = []
}

// 格式化执行时间
const formatExecutionTime = (ms: number) => {
  if (ms === 0) return '待运行'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}min`
}

// 获取代码行数
const getCodeLineCount = () => {
  return codeContent.value.split('\n').length
}

// 获取代码字符数
const getCodeCharCount = () => {
  return codeContent.value.length
}

// 生命周期
onMounted(async () => {
  await nextTick()
  setCodeTemplate(selectedLanguage.value)
  
  // 尝试从 sessionStorage 获取之前的路由
  const storedRoute = sessionStorage.getItem('previousRoute')
  if (storedRoute) {
    previousRoute.value = storedRoute
  }
  
  // 监听全屏变化
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  
  // 监听键盘快捷键
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      saveCode()
    }
  })

  // 初始化从持久化读取（0-100 转换成 0-10 刻度）
  const ratio = prefs.codePanelRatio // 例如 50
  codePanelWidth.value = (ratio / 100) * 10
  outputPanelWidth.value = 10 - codePanelWidth.value
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style scoped>
.fullscreen-code-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  color: var(--text-primary);
}

/* 工具栏样式 */
.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.back-btn:hover {
  background: var(--bg-primary);
  border-color: var(--accent-color);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.file-extension {
  font-size: 12px;
  color: var(--text-tertiary);
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
}

.toolbar-center {
  display: flex;
  align-items: center;
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

.toolbar-right {
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

/* 主编辑区域 */
.editor-main {
  flex: 1;
  display: flex;
  gap: 0;
  overflow: hidden;
  position: relative;
  width: 100%;
}

/* 代码面板 */
.code-panel {
  display: flex;
  flex-direction: column;
  position: relative;
  flex-shrink: 0;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.code-actions {
  display: flex;
  gap: 8px;
}

.header-actions {
  display: inline-flex;
  gap: 6px;
}

.btn-sm {
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
  border-radius: 6px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--accent-color);
}

.code-input-container {
  position: relative;
  flex: 1;
  display: flex;
}

.code-textarea {
  flex: 1;
  height: 100%;
  padding: 16px;
  padding-left: 50px;
  box-sizing: border-box;
  border: none;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  overflow-y: auto;
  white-space: pre;
  word-wrap: break-word;
  tab-size: 2;
  outline: none;
}

.code-textarea:focus {
  outline: none;
  box-shadow: inset 0 0 0 2px var(--accent-color);
}

.code-textarea.theme-dark {
  background: #1e1e1e;
  color: #d4d4d4;
}

.code-textarea.theme-light {
  background: #ffffff;
  color: #1e1e1e;
}

.line-numbers {
  position: absolute;
  top: 0;
  left: 0;
  width: 40px;
  height: 100%;
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  font-size: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  box-sizing: border-box;
  pointer-events: none;
  border-right: 1px solid var(--border-color);
}

.line-number {
  text-align: right;
  padding-right: 10px;
  user-select: none;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* 输出面板 */
.output-panel {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
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

.output-content {
  flex: 1;
  overflow: hidden;
  background: var(--bg-primary);
}

.console-output,
.error-output,
.performance-output {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
}

/* 输出头部操作按钮 */
.output-header-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.copy-btn,
.clear-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-btn:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
  transform: translateY(-1px);
}

.clear-btn:hover {
  background: #dc3545;
  color: white;
  border-color: #dc3545;
  transform: translateY(-1px);
}

/* 复制行按钮 */
.copy-line-btn {
  opacity: 0;
  padding: 4px;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
}

.output-line:hover .copy-line-btn {
  opacity: 1;
}

.copy-line-btn:hover {
  background: var(--accent-color);
  color: white;
  transform: scale(1.1);
}

.empty-output {
  text-align: center;
  color: var(--text-tertiary);
  margin-top: 60px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  margin-bottom: 8px;
}

.empty-tip {
  font-size: 12px;
  opacity: 0.7;
}

.output-lines {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.output-line {
  display: flex;
  gap: 12px;
  padding: 4px 0;
  border-bottom: 1px solid var(--border-color);
  align-items: center;
}

.output-line:last-child {
  border-bottom: none;
}

.output-line .line-number {
  color: var(--text-tertiary);
  font-size: 11px;
  min-width: 20px;
  text-align: right;
  position: static;
  background: none;
  border: none;
  height: auto;
  padding: 0;
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
  padding: 12px 0;
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

.status-success {
  color: #28a745; /* 绿色 */
}

.status-pending {
  color: #6c757d; /* 灰色 */
}

/* 状态栏 */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  font-size: 12px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.status-left,
.status-right {
  display: flex;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-execution-time {
  color: var(--accent-color);
  font-weight: 500;
}

/* 响应式状态栏 */
@media (max-width: 1200px) {
  .status-left,
  .status-right {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .status-item {
    font-size: 11px;
  }
}

/* 可拖拽分隔条样式 */
.resize-handle {
  position: relative;
  width: 8px;
  height: 100%;
  cursor: col-resize;
  user-select: none;
  z-index: 10;
  background: transparent;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.resize-indicator {
  width: 100%;
  height: 100%;
  background: var(--accent-color);
  opacity: 0.2;
  transition: all 0.2s ease;
  border-radius: 3px;
}

.resize-handle:hover {
  background: rgba(102, 126, 234, 0.1);
}

.resize-handle:hover .resize-indicator {
  opacity: 0.7;
  background: var(--accent-hover);
  transform: scaleX(1.2);
}

.resize-handle.resizing {
  background: rgba(102, 126, 234, 0.15);
}

.resize-handle.resizing .resize-indicator {
  opacity: 1;
  background: var(--accent-hover);
  transform: scaleX(1.5);
  box-shadow: 0 0 8px rgba(102, 126, 234, 0.4);
}

.resize-handle.resizing {
  background: rgba(102, 126, 234, 0.2);
  border-left: 2px solid var(--accent-color);
  border-right: 2px solid var(--accent-color);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .editor-main {
    flex-direction: column;
  }
  
  .code-panel {
    border-bottom: 1px solid var(--border-color);
  }
  
  .resize-handle {
    width: 100%;
    height: 8px;
    cursor: row-resize;
  }
  
  .resize-handle:hover .resize-indicator {
    transform: scaleY(1.2);
  }
  
  .resize-handle.resizing .resize-indicator {
    transform: scaleY(1.5);
  }
}

@media (max-width: 768px) {
  .editor-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .toolbar-left,
  .toolbar-center,
  .toolbar-right {
    justify-content: center;
  }
  
  .toolbar-right {
    flex-wrap: wrap;
  }
  
  .code-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .code-actions {
    justify-content: center;
  }
}

/* 全屏模式优化 */
.fullscreen-code-editor:fullscreen {
  background: var(--bg-primary);
}

.fullscreen-code-editor:fullscreen .editor-toolbar {
  background: var(--bg-secondary);
}

.fullscreen-code-editor:fullscreen .code-header,
.fullscreen-code-editor:fullscreen .output-header {
  background: var(--bg-secondary);
}

.fullscreen-code-editor:fullscreen .status-bar {
  background: var(--bg-secondary);
}

/* 复制提示动画 */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* 双击提示样式 */
.resize-handle {
  position: relative;
}

.resize-handle::after {
  content: '双击重置';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  white-space: nowrap;
  z-index: 100;
}

.resize-handle:hover::after {
  opacity: 1;
}

/* 响应式设计中的双击提示 */
@media (max-width: 1200px) {
  .resize-handle::after {
    content: '双击重置';
    top: auto;
    bottom: 50%;
    left: 50%;
    transform: translate(-50%, 50%);
  }
}

/* 分割线工具提示 */
.resize-tooltip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  white-space: nowrap;
  z-index: 100;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.resize-handle:hover .resize-tooltip {
  opacity: 1;
}

/* 响应式设计中的工具提示 */
@media (max-width: 1200px) {
  .resize-tooltip {
    top: auto;
    bottom: 50%;
    left: 50%;
    transform: translate(-50%, 50%);
  }
}
</style>
