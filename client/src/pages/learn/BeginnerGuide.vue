<template>
  <div class="beginner-guide">
    <!-- 欢迎区域 -->
    <section class="welcome-section">
      <div class="welcome-content">
        <div class="welcome-badge">🎯 Vue 驱动式学习</div>
        <h1 class="welcome-title">用 Vue 学前端，边做边学</h1>
        <p class="welcome-desc">
          忘掉枯燥的理论吧！我们用 Vue 的趣味案例带你学会前端基础，<br>
          <strong>做一个效果，补一个知识点</strong>，35分钟后你就能独立写 Vue 代码。
        </p>
      </div>
    </section>

    <!-- 学习进度条 -->
    <section class="progress-section">
      <div class="progress-header">
        <span class="progress-label">学习进度</span>
        <span class="progress-text">{{ completedStages }}/4 阶段完成</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: (completedStages / 4) * 100 + '%' }"></div>
        <div class="progress-nodes">
          <div 
            v-for="(stage, index) in stages" 
            :key="index"
            class="progress-node"
            :class="{ completed: stage.completed, active: index === currentStageIndex }"
            :style="{ left: ((index + 1) / 4) * 100 + '%' }"
          >
            <span class="node-icon">{{ stage.completed ? '✓' : index + 1 }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 4阶段学习路径 -->
    <section class="stages-section">
      <div class="stages-list">
        <!-- 阶段1：Vue初体验 -->
        <div class="stage-card" :class="{ active: currentStageIndex === 0, completed: stages[0].completed, locked: false }">
          <div class="stage-header">
            <div class="stage-number">1</div>
            <div class="stage-meta">
              <span class="stage-time">⏱️ 5 分钟</span>
              <span class="stage-badge new" v-if="currentStageIndex === 0">当前阶段</span>
              <span class="stage-badge done" v-if="stages[0].completed">已完成</span>
            </div>
          </div>
          <div class="stage-content">
            <h3 class="stage-title">🚀 Vue 初体验</h3>
            <p class="stage-desc">改一行代码，看页面变化，1分钟获得成就感</p>
            <div class="stage-details">
              <div class="detail-item">
                <span class="detail-label">案例目标</span>
                <span class="detail-value">修改 message 变量，实时预览页面变化</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">基础补充</span>
                <span class="detail-value highlight">无需任何基础，直接开始！</span>
              </div>
            </div>
          </div>
          <button class="stage-btn" @click="startStage(0)">
            {{ stages[0].completed ? '再次体验' : '开始体验' }} 
          </button>
        </div>

        <!-- 阶段2：静态展示 + HTML -->
        <div class="stage-card" :class="{ active: currentStageIndex === 1, completed: stages[1].completed, locked: !stages[0].completed }">
          <div class="stage-header">
            <div class="stage-number">2</div>
            <div class="stage-meta">
              <span class="stage-time">⏱️ 10 分钟</span>
              <span class="stage-badge" v-if="currentStageIndex === 1">当前阶段</span>
              <span class="stage-badge done" v-if="stages[1].completed">已完成</span>
            </div>
          </div>
          <div class="stage-content">
            <h3 class="stage-title">📄 文字与列表展示</h3>
            <p class="stage-desc">用 Vue 展示多段文字和列表，顺便学会 HTML 核心标签</p>
            <div class="stage-details">
              <div class="detail-item">
                <span class="detail-label">案例目标</span>
                <span class="detail-value">用 Vue 渲染文章段落和待办清单</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">基础补充</span>
                <span class="detail-value">
                  <code>div</code> <code>p</code> <code>ul</code> <code>li</code> <code>id</code> <code>class</code>
                </span>
              </div>
            </div>
          </div>
          <button class="stage-btn" :disabled="!stages[0].completed" @click="startStage(1)">
            {{ stages[0].completed ? (stages[1].completed ? '再次学习' : '开始学习') : '🔒 完成上一阶段解锁' }}
          </button>
        </div>

        <!-- 阶段3：样式绑定 + CSS -->
        <div class="stage-card" :class="{ active: currentStageIndex === 2, completed: stages[2].completed, locked: !stages[1].completed }">
          <div class="stage-header">
            <div class="stage-number">3</div>
            <div class="stage-meta">
              <span class="stage-time">⏱️ 10 分钟</span>
              <span class="stage-badge" v-if="currentStageIndex === 2">当前阶段</span>
              <span class="stage-badge done" v-if="stages[2].completed">已完成</span>
            </div>
          </div>
          <div class="stage-content">
            <h3 class="stage-title">🎨 让页面变好看</h3>
            <p class="stage-desc">用 Vue 绑定样式，让文字变颜色、改大小</p>
            <div class="stage-details">
              <div class="detail-item">
                <span class="detail-label">案例目标</span>
                <span class="detail-value">点击按钮切换文字颜色和主题</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">基础补充</span>
                <span class="detail-value">
                  <code>#id</code> <code>.class</code> <code>color</code> <code>font-size</code>
                </span>
              </div>
            </div>
          </div>
          <button class="stage-btn" :disabled="!stages[1].completed" @click="startStage(2)">
            {{ stages[1].completed ? (stages[2].completed ? '再次学习' : '开始学习') : '🔒 完成上一阶段解锁' }}
          </button>
        </div>

        <!-- 阶段4：交互事件 + JS -->
        <div class="stage-card" :class="{ active: currentStageIndex === 3, completed: stages[3].completed, locked: !stages[2].completed }">
          <div class="stage-header">
            <div class="stage-number">4</div>
            <div class="stage-meta">
              <span class="stage-time">⏱️ 10 分钟</span>
              <span class="stage-badge" v-if="currentStageIndex === 3">当前阶段</span>
              <span class="stage-badge done" v-if="stages[3].completed">已完成</span>
            </div>
          </div>
          <div class="stage-content">
            <h3 class="stage-title">⚡ 点击交互</h3>
            <p class="stage-desc">用 Vue 的 @click 实现按钮点击，理解 JS 函数</p>
            <div class="stage-details">
              <div class="detail-item">
                <span class="detail-label">案例目标</span>
                <span class="detail-value">做一个计数器：点击 +1，再点 -1</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">基础补充</span>
                <span class="detail-value">
                  <code>变量</code> <code>对象</code> <code>函数</code> <code>事件</code>
                </span>
              </div>
            </div>
          </div>
          <button class="stage-btn" :disabled="!stages[2].completed" @click="startStage(3)">
            {{ stages[2].completed ? (stages[3].completed ? '再次学习' : '开始学习') : '🔒 完成上一阶段解锁' }}
          </button>
        </div>

      </div>
    </section>

    <!-- 底部按钮 -->
    <section class="footer-section">
      <button class="back-btn" @click="goBack">← 返回首页</button>
      <button v-if="completedStages === 4" class="next-step-btn" @click="goToBasics">
        开始下一步学习 →
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 从 localStorage 读取学习进度
const loadProgress = () => {
  const saved = localStorage.getItem('vue-learning-progress')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return [false, false, false, false]
    }
  }
  return [false, false, false, false]
}

// 保存进度到 localStorage
const saveProgress = () => {
  const progress = stages.value.map(s => s.completed)
  localStorage.setItem('vue-learning-progress', JSON.stringify(progress))
}

// 学习阶段状态
const stages = ref([
  { completed: false },
  { completed: false },
  { completed: false },
  { completed: false }
])

// 初始化时读取进度
onMounted(() => {
  const progress = loadProgress().slice(0, 4)
  stages.value = progress.map((completed: boolean) => ({ completed }))
})

// 监听变化自动保存
watch(stages, saveProgress, { deep: true })

// 当前阶段索引
const currentStageIndex = computed(() => {
  const firstIncomplete = stages.value.findIndex(s => !s.completed)
  return firstIncomplete === -1 ? 3 : firstIncomplete
})

// 已完成阶段数
const completedStages = computed(() => stages.value.filter(s => s.completed).length)

// 开始某阶段
const startStage = (index: number) => {
  switch (index) {
    case 0:
      router.push('/learn/stage-1')
      break
    case 1:
      router.push('/learn/stage-2')
      break
    case 2:
      router.push('/learn/stage-3')
      break
    case 3:
      router.push('/learn/stage-4')
      break
  }
}

const goBack = () => {
  router.push('/')
}

const goToBasics = () => {
  router.push('/learn/completion')
}
</script>

<style scoped>
.beginner-guide {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 24px;
  color: var(--text-primary);
}

/* 欢迎区域 */
.welcome-section {
  text-align: center;
  margin-bottom: 40px;
}

.welcome-badge {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(65, 184, 131, 0.12);
  color: #41b883;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
}

.welcome-title {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #41b883, #35495e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-desc {
  font-size: 17px;
  color: var(--text-secondary);
  line-height: 1.8;
}

.welcome-desc strong {
  color: #41b883;
}

/* 进度条区域 */
.progress-section {
  margin-bottom: 40px;
  padding: 20px 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-label {
  font-weight: 600;
  color: var(--text-primary);
}

.progress-text {
  font-size: 14px;
  color: var(--text-secondary);
}

.next-step-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #41b883 0%, #35a070 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(65, 184, 131, 0.3);
}

.next-step-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(65, 184, 131, 0.4);
}

.progress-bar {
  position: relative;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  margin-bottom: 8px;
}

.progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #41b883, #5dd5a8);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-nodes {
  position: relative;
  height: 24px;
  margin-top: -16px;
}

.progress-node {
  position: absolute;
  transform: translateX(-50%);
  width: 24px;
  height: 24px;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.progress-node.completed {
  background: #41b883;
  border-color: #41b883;
  color: white;
}

.progress-node.active {
  border-color: #41b883;
  box-shadow: 0 0 0 4px rgba(65, 184, 131, 0.2);
}

.node-icon {
  font-size: 12px;
  font-weight: 700;
}

/* 阶段卡片 */
.stages-section {
  margin-bottom: 40px;
}

.stages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stage-card {
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
}

.stage-card:hover:not(.locked) {
  border-color: rgba(65, 184, 131, 0.5);
  box-shadow: 0 4px 20px rgba(65, 184, 131, 0.1);
}

.stage-card.active {
  border-color: #41b883;
  background: rgba(65, 184, 131, 0.04);
}

.stage-card.completed {
  border-color: rgba(65, 184, 131, 0.3);
}

.stage-card.locked {
  opacity: 0.6;
}

.stage-card.final {
  background: linear-gradient(135deg, rgba(65, 184, 131, 0.08), rgba(53, 73, 94, 0.08));
}

.stage-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.stage-number {
  width: 36px;
  height: 36px;
  background: var(--bg-tertiary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-secondary);
}

.stage-card.completed .stage-number {
  background: #41b883;
  color: white;
}

.stage-card.active .stage-number {
  background: rgba(65, 184, 131, 0.15);
  color: #41b883;
}

.stage-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stage-time {
  font-size: 13px;
  color: var(--text-tertiary);
}

.stage-badge {
  padding: 4px 10px;
  background: rgba(65, 184, 131, 0.12);
  color: #41b883;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.stage-badge.new {
  background: rgba(251, 191, 36, 0.15);
  color: #f59e0b;
}

.stage-badge.done {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.stage-content {
  margin-bottom: 16px;
}

.stage-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.stage-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.stage-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  gap: 12px;
  font-size: 13px;
}

.detail-label {
  color: var(--text-tertiary);
  min-width: 70px;
  flex-shrink: 0;
}

.detail-value {
  color: var(--text-secondary);
}

.detail-value.highlight {
  color: #41b883;
  font-weight: 500;
}

.detail-value code {
  padding: 2px 6px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  font-size: 12px;
  margin-right: 4px;
}

.stage-btn {
  width: 100%;
  padding: 12px 20px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.stage-btn:hover:not(:disabled) {
  border-color: #41b883;
  color: #41b883;
}

.stage-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stage-btn.primary {
  background: #41b883;
  border-color: #41b883;
  color: white;
}

.stage-btn.primary:hover:not(:disabled) {
  background: #35a070;
}

/* 底部区域 */
.footer-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.footer-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-tertiary);
}

.tip-icon {
  font-size: 18px;
}

.back-btn {
  padding: 10px 20px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  border-color: #41b883;
  color: #41b883;
}

/* 响应式 */
@media (max-width: 640px) {
  .welcome-title {
    font-size: 28px;
  }
  
  .stage-header {
    flex-wrap: wrap;
  }
  
  .footer-section {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
</style>
