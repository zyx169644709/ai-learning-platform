<template>
  <div class="stage1-page">
    <!-- 顶部进度指示 -->
    <div class="stage-header">
      <button class="back-btn" @click="goBack">← 返回学习路径</button>
      <div class="stage-progress">
        <span class="stage-label">阶段 1 / 4</span>
        <span class="stage-name">Vue 初体验</span>
      </div>
      <div class="stage-time">⏱️ 约 5 分钟</div>
    </div>

    <!-- 主内容区 -->
    <div class="stage-content">
      <!-- 左侧引导区 -->
      <div class="guide-panel">
        <div class="guide-steps">
          <!-- 步骤1 -->
          <div class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
            <div class="step-header">
              <div class="step-number">1</div>
              <h3 class="step-title">认识代码结构</h3>
            </div>
            <div class="step-content" v-show="currentStep === 1">
              <p>右边是一段完整的 Vue 代码，别怕，你不需要全看懂！</p>
              <p>只需要找到这一行：</p>
              <div class="code-highlight">
                <code>message: '你好，Vue！'</code>
              </div>
              <p>这就是控制页面显示文字的地方。</p>
              <button class="step-btn" @click="nextStep">我找到了 →</button>
            </div>
          </div>

          <!-- 步骤2 -->
          <div class="step" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
            <div class="step-header">
              <div class="step-number">2</div>
              <h3 class="step-title">修改文字</h3>
            </div>
            <div class="step-content" v-show="currentStep === 2">
              <p>现在，把 <code>'你好，Vue！'</code> 改成你想说的话，比如：</p>
              <ul class="example-list">
                <li><code>'我正在学 Vue！'</code></li>
                <li><code>'Hello World!'</code></li>
                <li><code>'今天天气真好'</code></li>
              </ul>
              <p class="tip">💡 记得保留引号哦！</p>
              <button class="step-btn" @click="nextStep" :disabled="!hasModified">
                {{ hasModified ? '我改好了 →' : '请先修改代码...' }}
              </button>
            </div>
          </div>

          <!-- 步骤3 -->
          <div class="step" :class="{ active: currentStep === 3, completed: currentStep > 3 }">
            <div class="step-header">
              <div class="step-number">3</div>
              <h3 class="step-title">查看效果</h3>
            </div>
            <div class="step-content" v-show="currentStep === 3">
              <p>看！预览区的文字变了！🎉</p>
              <p>你刚才做的事情，就是 Vue 的核心能力：</p>
              <div class="concept-box">
                <strong>数据驱动视图</strong>
                <p>改变数据 (message)，页面自动更新。</p>
              </div>
              <button class="step-btn" @click="nextStep">明白了 →</button>
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
                <p class="completion-text">
                  恭喜！你已经写出了第一行 Vue 代码！<br>
                  接下来，我们用 Vue 做更多有趣的事情。
                </p>
                <div class="completion-actions">
                  <button class="action-btn secondary" @click="resetStage">再玩一次</button>
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

// 当前步骤
const currentStep = ref(1)

// 初始代码 - 极简版，让初学者专注核心
const initialCode = `<!DOCTYPE html>
<html>
<head>
  <title>Vue 初体验</title>
</head>
<body>
  <!-- 这里显示 message 的内容 -->
  <div id="app">
    <h1>{{ message }}</h1>
  </div>

  <script src="https://unpkg.com/vue@3/dist/vue.global.js"><\/script>
  <script>
    Vue.createApp({
      data() {
        return {
          message: '你好，Vue！'  // ← 修改这里的文字
        }
      }
    }).mount('#app')
  <\/script>
</body>
</html>`

const code = ref(initialCode)

// 检测是否修改了代码
const hasModified = computed(() => {
  return !code.value.includes("message: '你好，Vue！'")
})

// 代码变化时更新预览
const onCodeChange = () => {
  // srcdoc 会自动响应 code 的变化
}

// 下一步
const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++
  }
}

// 重置
const resetStage = () => {
  code.value = initialCode
  currentStep.value = 1
}

// 返回
const goBack = () => {
  router.push('/learn/beginner')
}

// 进入下一阶段
const goToNextStage = () => {
  // 标记阶段1完成
  const progress = JSON.parse(localStorage.getItem('vue-learning-progress') || '[false,false,false,false,false]')
  progress[0] = true
  localStorage.setItem('vue-learning-progress', JSON.stringify(progress))
  router.push('/learn/stage-2')
}

// 初始化
onMounted(() => {
  // srcdoc 会自动渲染
})
</script>

<style scoped>
.stage1-page {
  min-height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
}

/* 顶部 */
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

/* 主内容 */
.stage-content {
  flex: 1;
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 0;
  overflow: hidden;
}

/* 左侧引导 */
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
  font-size: 15px;
}

.example-list {
  list-style: none;
  padding: 0;
  margin: 12px 0;
}

.example-list li {
  padding: 6px 0;
}

.tip {
  font-size: 13px;
  color: #f59e0b;
}

.concept-box {
  padding: 16px;
  background: rgba(65, 184, 131, 0.08);
  border-radius: 8px;
  margin: 12px 0;
}

.concept-box strong {
  color: #41b883;
  display: block;
  margin-bottom: 8px;
}

.concept-box p {
  margin: 0;
  font-size: 13px;
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

/* 完成卡片 */
.completion-card {
  text-align: center;
}

.completion-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.completion-text {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 20px;
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

/* 右侧编辑器 - 左右布局 */
.editor-panel {
  display: flex;
  flex-direction: row;
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

/* 响应式 */
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
