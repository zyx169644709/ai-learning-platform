<template>
  <div class="stage2-page">
    <!-- 顶部进度指示 -->
    <div class="stage-header">
      <button class="back-btn" @click="goBack">← 返回学习路径</button>
      <div class="stage-progress">
        <span class="stage-label">阶段 2 / 4</span>
        <span class="stage-name">文字与列表展示</span>
      </div>
      <div class="stage-time">⏱️ 约 10 分钟</div>
    </div>

    <!-- 主内容区 -->
    <div class="stage-content">
      <!-- 左侧引导区 -->
      <div class="guide-panel">
        <div class="guide-steps">
          <!-- 步骤1：认识HTML标签 -->
          <div class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
            <div class="step-header" @click="currentStep = 1" style="cursor: pointer;">
              <div class="step-number">1</div>
              <h3 class="step-title">认识 HTML 标签</h3>
            </div>
            <div class="step-content" v-show="currentStep === 1">
              <p>HTML 标签就像「容器」，用来装不同类型的内容：</p>
              <div class="tag-list">
                <div class="tag-item">
                  <code>&lt;div&gt;</code>
                  <span>通用容器，装任何内容</span>
                </div>
                <div class="tag-item">
                  <code>&lt;p&gt;</code>
                  <span>段落，装一段文字</span>
                </div>
                <div class="tag-item">
                  <code>&lt;ul&gt; + &lt;li&gt;</code>
                  <span>列表，装多个条目</span>
                </div>
              </div>
              <p class="tip">💡 右边代码中已经用到了这些标签，找找看！</p>
              <button class="step-btn" @click="nextStep">我看到了 →</button>
            </div>
          </div>

          <!-- 步骤2：理解Vue数据绑定 -->
          <div class="step" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
            <div class="step-header" @click="currentStep = 2" style="cursor: pointer;">
              <div class="step-number">2</div>
              <h3 class="step-title">Vue 数据绑定</h3>
            </div>
            <div class="step-content" v-show="currentStep === 2">
              <p>Vue 用 <code v-pre>{{ }}</code> 把数据显示到页面：</p>
              <div class="code-highlight">
                <code v-pre>&lt;p&gt;{{ title }}&lt;/p&gt;</code>
              </div>
              <p>这会把 <code>title</code> 变量的值显示在 <code>&lt;p&gt;</code> 标签里。</p>
              <p>现在，试着把 <code>title</code> 的值改成别的：</p>
              <div class="example-list">
                <li><code>'我的待办清单'</code></li>
                <li><code>'今日任务'</code></li>
              </div>
              <button class="step-btn" @click="nextStep" :disabled="!hasTitleModified">
                {{ hasTitleModified ? '改好了 →' : '请先修改 title...' }}
              </button>
            </div>
          </div>

          <!-- 步骤3：v-for循环渲染 -->
          <div class="step" :class="{ active: currentStep === 3, completed: currentStep > 3 }">
            <div class="step-header" @click="currentStep = 3" style="cursor: pointer;">
              <div class="step-number">3</div>
              <h3 class="step-title">v-for 循环渲染</h3>
            </div>
            <div class="step-content" v-show="currentStep === 3">
              <p>看这行代码：</p>
              <div class="code-highlight">
                <code>&lt;li v-for="item in todos"&gt;</code>
              </div>
              <p>这是 Vue 的「循环指令」：</p>
              <ul class="concept-list">
                <li><code>todos</code> 是一个数组</li>
                <li><code>v-for</code> 会把数组里的每一项都渲染出来</li>
                <li><code>item</code> 代表当前这一项</li>
              </ul>
              <p>试着在 <code>todos</code> 数组里添加一项新的待办：</p>
              <button class="step-btn" @click="nextStep" :disabled="!hasListModified">
                {{ hasListModified ? '添加好了 →' : '请添加新的待办...' }}
              </button>
            </div>
          </div>

          <!-- 步骤4：完成 -->
          <div class="step" :class="{ active: currentStep === 4 }">
            <div class="step-header">
              <div class="step-number">🏅</div>
              <h3 class="step-title">完成！</h3>
            </div>
            <div class="step-content" v-show="currentStep === 4">
              <div class="completion-card">
                <div class="completion-icon">🎉</div>
                <div class="learned-summary">
                  <h4>你学会了：</h4>
                  <ul>
                    <li>HTML 的 <code>&lt;div&gt;</code> <code>&lt;p&gt;</code> <code>&lt;ul&gt;</code> <code>&lt;li&gt;</code> 标签</li>
                    <li>Vue 的 <code v-pre>{{ }}</code> 数据绑定语法</li>
                    <li>Vue 的 <code>v-for</code> 循环渲染列表</li>
                  </ul>
                </div>
                <div class="completion-actions">
                  <button class="action-btn secondary" @click="resetStage">再练一次</button>
                  <button class="action-btn primary" @click="goToNextStage">进入下一阶段 →</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧编辑器区 -->
      <div class="editor-panel">
        <CodePreview v-model="code" @change="onCodeChange" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import CodePreview from '@/components/common/CodePreview.vue'

const router = useRouter()
const currentStep = ref(1)

const initialCode = `<!DOCTYPE html>
<html>
<head>
  <title>Vue 列表展示</title>
</head>
<body>
  <div id="app">
    <!-- h1 标签：标题 -->
    <h1>{{ title }}</h1>
    
    <!-- p 标签：段落 -->
    <p>下面是我的待办清单：</p>
    
    <!-- ul + li 标签：列表 -->
    <!-- v-for 会循环 todos 数组，每项生成一个 li -->
    <ul>
      <li v-for="item in todos">{{ item }}</li>
    </ul>
  </div>

  <script src="https://unpkg.com/vue@3/dist/vue.global.js"><\/script>
  <script>
    Vue.createApp({
      data() {
        return {
          title: '我的学习清单',  // ← 修改标题
          todos: [
            '学习 HTML',
            '学习 CSS',
            '学习 Vue'
            // ← 在这里添加新的待办
          ]
        }
      }
    }).mount('#app')
  <\/script>
</body>
</html>`

const code = ref(initialCode)

const hasTitleModified = computed(() => {
  return !code.value.includes("title: '我的学习清单'")
})

const hasListModified = computed(() => {
  // 检查是否添加了新的待办项（原始有3个，现在应该有4个或更多）
  const matches = code.value.match(/todos:\s*\[([\s\S]*?)\]/m)
  if (matches) {
    const content = matches[1]
    // 统计字符串字面量的数量（包括单引号和双引号）
    const stringCount = (content.match(/['"][^'"]*['"]/g) || []).length
    return stringCount > 3
  }
  return false
})

const onCodeChange = () => {
  // srcdoc 会自动响应 code 的变化
}

const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++
  }
}

const resetStage = () => {
  code.value = initialCode
  currentStep.value = 1
}

const goBack = () => {
  router.push('/learn/beginner')
}

const goToNextStage = () => {
  // 标记阶段2完成
  const progress = JSON.parse(localStorage.getItem('vue-learning-progress') || '[false,false,false,false,false]')
  progress[1] = true
  localStorage.setItem('vue-learning-progress', JSON.stringify(progress))
  router.push('/learn/stage-3')
}

onMounted(() => {
  // srcdoc 会自动渲染
})
</script>

<style scoped>
.stage2-page {
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
}

.stage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.back-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  border-color: #41b883;
  color: #41b883;
}

.stage-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stage-label {
  font-size: 12px;
  color: var(--text-tertiary);
}

.stage-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.stage-time {
  font-size: 14px;
  color: var(--text-tertiary);
}

.stage-content {
  flex: 1;
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 0;
  overflow: hidden;
}

.guide-panel {
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  padding: 24px;
}

.guide-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step {
  background: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
}

.step.active {
  border-color: #41b883;
  background: rgba(65, 184, 131, 0.05);
}

.step.completed {
  opacity: 0.6;
}

.step.completed .step-number {
  background: #41b883;
  color: white;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.step-number {
  width: 32px;
  height: 32px;
  background: var(--bg-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.step.active .step-number {
  background: #41b883;
  color: white;
}

.step-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.step-content {
  padding: 0 16px 16px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-secondary);
}

.step-content p {
  margin: 0 0 12px;
}

.step-content code {
  padding: 2px 8px;
  background: rgba(65, 184, 131, 0.1);
  color: #41b883;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
}

.tag-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 12px 0;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.tag-item code {
  min-width: 120px;
}

.tag-item span {
  font-size: 13px;
  color: var(--text-tertiary);
}

.code-highlight {
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin: 12px 0;
}

.code-highlight code {
  background: none;
  padding: 0;
  font-size: 14px;
}

.example-list {
  list-style: none;
  padding: 0;
  margin: 12px 0;
}

.example-list li {
  padding: 6px 0;
}

.concept-list {
  margin: 12px 0;
  padding-left: 20px;
}

.concept-list li {
  margin-bottom: 8px;
}

.tip {
  font-size: 13px;
  color: #f59e0b;
}

.step-btn {
  width: 100%;
  padding: 12px;
  background: #41b883;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.step-btn:hover:not(:disabled) {
  background: #35a070;
}

.step-btn:disabled {
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  cursor: not-allowed;
}

.completion-card {
  text-align: center;
}

.completion-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.learned-summary {
  text-align: left;
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  margin-bottom: 20px;
}

.learned-summary h4 {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--text-primary);
}

.learned-summary ul {
  margin: 0;
  padding-left: 20px;
}

.learned-summary li {
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.completion-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.secondary {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.action-btn.secondary:hover {
  border-color: #41b883;
  color: #41b883;
}

.action-btn.primary {
  background: #41b883;
  border: none;
  color: white;
}

.action-btn.primary:hover {
  background: #35a070;
}

.editor-panel {
  display: flex;
  flex-direction: row;
  overflow: hidden;
}


@media (max-width: 900px) {
  .stage-content {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
  }
  
  .guide-panel {
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }
}
</style>
