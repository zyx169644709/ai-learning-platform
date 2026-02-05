<template>
  <div class="stage4-page">
    <!-- 顶部进度指示 -->
    <div class="stage-header">
      <button class="back-btn" @click="goBack">← 返回学习路径</button>
      <div class="stage-progress">
        <span class="stage-label">阶段 4 / 4</span>
        <span class="stage-name">点击交互</span>
      </div>
      <div class="stage-time">⏱️ 约 10 分钟</div>
    </div>

    <!-- 主内容区 -->
    <div class="stage-content">
      <!-- 左侧引导区 -->
      <div class="guide-panel">
        <div class="guide-steps">
          <!-- 步骤1：认识JS变量 -->
          <div class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
            <div class="step-header">
              <div class="step-number">1</div>
              <h3 class="step-title">认识 JS 变量</h3>
            </div>
            <div class="step-content" v-show="currentStep === 1">
              <p>JavaScript 用变量来存储数据：</p>
              <div class="code-highlight">
                <code>const count = ref(0)</code>
              </div>
              <p>这里：</p>
              <ul class="concept-list">
                <li><code>count</code> 是变量名</li>
                <li><code>0</code> 是初始值</li>
                <li><code>ref()</code> 是 Vue 的响应式包装</li>
              </ul>
              <p>右边代码中定义了一个 <code>count</code> 变量，找到它！</p>
              <button class="step-btn" @click="nextStep">找到了 →</button>
            </div>
          </div>

          <!-- 步骤2：认识函数 -->
          <div class="step" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
            <div class="step-header">
              <div class="step-number">2</div>
              <h3 class="step-title">认识函数</h3>
            </div>
            <div class="step-content" v-show="currentStep === 2">
              <p>函数是一组可重复执行的代码：</p>
              <div class="code-highlight">
                <code>const increment = () => {<br>&nbsp;&nbsp;count.value++<br>}</code>
              </div>
              <p>这个函数的作用是：让 <code>count</code> 的值 +1</p>
              <p>Vue 中，<code>.value</code> 用来获取或修改 ref 变量的值。</p>
              <button class="step-btn" @click="nextStep">明白了 →</button>
            </div>
          </div>

          <!-- 步骤3：点击事件 -->
          <div class="step" :class="{ active: currentStep === 3, completed: currentStep > 3 }">
            <div class="step-header">
              <div class="step-number">3</div>
              <h3 class="step-title">点击事件 @click</h3>
            </div>
            <div class="step-content" v-show="currentStep === 3">
              <p>Vue 用 <code>@click</code> 绑定点击事件：</p>
              <div class="code-highlight">
                <code>&lt;button @click="increment"&gt;</code>
              </div>
              <p>当按钮被点击时，就会执行 <code>increment</code> 函数。</p>
              <p class="task">🎯 任务：在预览区点击 + 按钮，看看数字会不会变化！</p>
              <button class="step-btn" @click="nextStep">我点过了 →</button>
            </div>
          </div>

          <!-- 步骤4：自己动手 -->
          <div class="step" :class="{ active: currentStep === 4, completed: currentStep > 4 }">
            <div class="step-header">
              <div class="step-number">4</div>
              <h3 class="step-title">自己动手</h3>
            </div>
            <div class="step-content" v-show="currentStep === 4">
              <p>现在，试着修改代码：</p>
              <ul class="task-list">
                <li>把 <code>count.value++</code> 改成 <code>count.value += 2</code>，让每次点击 +2</li>
                <li>或者把初始值 <code>0</code> 改成 <code>100</code></li>
              </ul>
              <button class="step-btn" @click="nextStep" :disabled="!hasCodeModified">
                {{ hasCodeModified ? '改好了 →' : '请修改代码...' }}
              </button>
            </div>
          </div>

          <!-- 步骤5：完成 -->
          <div class="step" :class="{ active: currentStep === 5 }">
            <div class="step-header">
              <div class="step-number">🏅</div>
              <h3 class="step-title">完成！</h3>
            </div>
            <div class="step-content" v-show="currentStep === 5">
              <div class="completion-card">
                <div class="completion-icon">🎉</div>
                <div class="learned-summary">
                  <h4>你学会了：</h4>
                  <ul>
                    <li>JS 的 <code>变量</code> 和 <code>函数</code> 概念</li>
                    <li>Vue 的 <code>ref()</code> 响应式数据</li>
                    <li>Vue 的 <code>@click</code> 事件绑定</li>
                  </ul>
                </div>
                <div class="congrats-box">
                  <span class="congrats-icon">🎉</span>
                  <p>恭喜！你已经掌握了 HTML、CSS、JS 的核心基础，现在可以正式学习 Vue 核心课程了！</p>
                </div>
                <div class="completion-actions">
                  <button class="action-btn secondary" @click="resetStage">再练一次</button>
                  <button class="action-btn primary" @click="goToNextStage">进入 Vue 核心课 →</button>
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
  <title>Vue 点击计数器</title>
</head>
<body>
  <div id="app">
    <h1>点击计数器</h1>
    
    <!-- 显示 count 的值 -->
    <p>当前计数：{{ count }}</p>
    
    <!-- @click 绑定点击事件，调用方法 -->
    <button @click="count++">+1</button>
    <button @click="count--">-1</button>
    <button @click="count = 0">归零</button>
    <button @click="add()">add</button>
  </div>

  <script src="https://unpkg.com/vue@3/dist/vue.global.js"><\/script>
  <script>
    Vue.createApp({
      data() {
        return {
          count: 0  // ← 试着改成其他数字
        }
      },
      methods: {
        // 也可以在这里定义方法
        add() {
          this.count++ // ← 试试修改add函数并在上面调用
        }
      }
    }).mount('#app')
  <\/script>
</body>
</html>`

const code = ref(initialCode)

const hasCodeModified = computed(() => {
  return !code.value.includes("count: 0")
})

const onCodeChange = () => {
  // srcdoc 会自动响应 code 的变化
}

const nextStep = () => {
  if (currentStep.value < 5) {
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
  // 标记阶段4完成
  const progress = JSON.parse(localStorage.getItem('vue-learning-progress') || '[false,false,false,false,false]')
  progress[3] = true
  localStorage.setItem('vue-learning-progress', JSON.stringify(progress))
  router.push('/learn/completion')
}

onMounted(() => {
  // srcdoc 会自动渲染
})
</script>

<style scoped>
.stage4-page {
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
  white-space: pre-wrap;
}

.concept-list {
  margin: 12px 0;
  padding-left: 20px;
}

.concept-list li {
  margin-bottom: 8px;
}

.task {
  padding: 12px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 8px;
  color: #f59e0b;
  font-weight: 500;
}

.task-list {
  margin: 12px 0;
  padding-left: 20px;
}

.task-list li {
  margin-bottom: 10px;
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
  margin-bottom: 16px;
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

.congrats-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1));
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: left;
}

.congrats-icon {
  font-size: 32px;
}

.congrats-box p {
  margin: 0;
  font-size: 14px;
  color: var(--text-primary);
  line-height: 1.6;
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

.preview-frame {
  flex: 1;
  border: none;
  background: white;
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
