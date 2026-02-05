<template>
  <div class="stage3-page">
    <!-- 顶部进度指示 -->
    <div class="stage-header">
      <button class="back-btn" @click="goBack">← 返回学习路径</button>
      <div class="stage-progress">
        <span class="stage-label">阶段 3 / 4</span>
        <span class="stage-name">让页面变好看</span>
      </div>
      <div class="stage-time">⏱️ 约 10 分钟</div>
    </div>

    <!-- 主内容区 -->
    <div class="stage-content">
      <!-- 左侧引导区 -->
      <div class="guide-panel">
        <div class="guide-steps">
          <!-- 步骤1：认识CSS选择器 -->
          <div class="step" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
            <div class="step-header">
              <div class="step-number">1</div>
              <h3 class="step-title">认识 CSS 选择器</h3>
            </div>
            <div class="step-content" v-show="currentStep === 1">
              <p>CSS 用「选择器」来指定要美化哪个元素：</p>
              <div class="tag-list">
                <div class="tag-item">
                  <code>#app</code>
                  <span>选中 id="app" 的元素</span>
                </div>
                <div class="tag-item">
                  <code>.card</code>
                  <span>选中 class="card" 的元素</span>
                </div>
                <div class="tag-item">
                  <code>h1</code>
                  <span>选中所有 h1 标签</span>
                </div>
              </div>
              <p class="tip">💡 右边代码的 &lt;style&gt; 部分就是 CSS！</p>
              <button class="step-btn" @click="nextStep">明白了 →</button>
            </div>
          </div>

          <!-- 步骤2：修改颜色 -->
          <div class="step" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
            <div class="step-header">
              <div class="step-number">2</div>
              <h3 class="step-title">修改颜色</h3>
            </div>
            <div class="step-content" v-show="currentStep === 2">
              <p>找到 CSS 中的 <code>color</code> 属性，它控制文字颜色：</p>
              <div class="code-highlight">
                <code>color: #e74c3c;</code>
              </div>
              <p>试着把颜色改成：</p>
              <div class="color-options">
                <div class="color-item">
                  <span class="color-preview" style="background: #3498db"></span>
                  <code>#3498db</code>
                  <span>蓝色</span>
                </div>
                <div class="color-item">
                  <span class="color-preview" style="background: #9b59b6"></span>
                  <code>#9b59b6</code>
                  <span>紫色</span>
                </div>
                <div class="color-item">
                  <span class="color-preview" style="background: #27ae60"></span>
                  <code>#27ae60</code>
                  <span>绿色</span>
                </div>
              </div>
              <button class="step-btn" @click="nextStep" :disabled="!hasColorModified">
                {{ hasColorModified ? '改好了 →' : '请修改 color 值...' }}
              </button>
            </div>
          </div>

          <!-- 步骤3：Vue动态样式绑定 -->
          <div class="step" :class="{ active: currentStep === 3, completed: currentStep > 3 }">
            <div class="step-header">
              <div class="step-number">3</div>
              <h3 class="step-title">Vue 动态样式</h3>
            </div>
            <div class="step-content" v-show="currentStep === 3">
              <p>Vue 可以用 <code>:style</code> 动态绑定样式：</p>
              <div class="code-highlight">
                <code>:style="{ color: textColor }"</code>
              </div>
              <p>这样，改变 <code>textColor</code> 变量，文字颜色就会自动更新！</p>
              <p>看看右边的代码，点击按钮切换颜色试试：</p>
              <button class="step-btn" @click="nextStep">我试过了 →</button>
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
                    <li>CSS 的 <code>#id</code> 和 <code>.class</code> 选择器</li>
                    <li>CSS 的 <code>color</code> 和 <code>font-size</code> 属性</li>
                    <li>Vue 的 <code>:style</code> 动态样式绑定</li>
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
  <title>Vue 样式绑定</title>
  <style>
    /* CSS 用来美化页面 */
    h1 {
      color: #e74c3c;  /* ← 试着改成 #3498db (蓝色) */
    }
  </style>
</head>
<body>
  <div id="app">
    <!-- :style 可以动态绑定样式 -->
    <h1 :style="{ color: textColor }">{{ message }}</h1>
    
    <p>点击按钮切换颜色：</p>
    <button @click="textColor = '#e74c3c'">红色</button>
    <button @click="textColor = '#3498db'">蓝色</button>
    <button @click="textColor = '#27ae60'">绿色</button>
  </div>

  <script src="https://unpkg.com/vue@3/dist/vue.global.js"><\/script>
  <script>
    Vue.createApp({
      data() {
        return {
          message: 'Hello Vue!',
          textColor: '#e74c3c'  // 文字颜色
        }
      }
    }).mount('#app')
  <\/script>
</body>
</html>`

const code = ref(initialCode)

const hasColorModified = computed(() => {
  return !code.value.includes("color: #e74c3c;") || code.value.includes("color: #3498db") || code.value.includes("color: #9b59b6") || code.value.includes("color: #27ae60")
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
  // 标记阶段3完成
  const progress = JSON.parse(localStorage.getItem('vue-learning-progress') || '[false,false,false,false,false]')
  progress[2] = true
  localStorage.setItem('vue-learning-progress', JSON.stringify(progress))
  router.push('/learn/stage-4')
}

onMounted(() => {
  // srcdoc 会自动渲染
})
</script>

<style scoped>
.stage3-page {
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
  min-width: 80px;
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

.color-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 12px 0;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 6px;
}

.color-item code {
  min-width: 80px;
}

.color-item span {
  font-size: 13px;
  color: var(--text-tertiary);
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
