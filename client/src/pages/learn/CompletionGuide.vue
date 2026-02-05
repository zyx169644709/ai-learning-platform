<template>
  <div class="completion-guide">
    <!-- 顶部：成就肯定 -->
    <section class="success-section">
      <div class="success-icons">
        <div class="icon-item html">
          <span class="icon">📄</span>
          <span class="label">HTML</span>
        </div>
        <div class="icon-item css">
          <span class="icon">🎨</span>
          <span class="label">CSS</span>
        </div>
        <div class="icon-item js">
          <span class="icon">⚡</span>
          <span class="label">JS</span>
        </div>
        <div class="icon-item vue">
          <span class="icon">💚</span>
          <span class="label">Vue</span>
        </div>
      </div>
      <h1 class="success-title">恭喜你！完成了 4 个前端小案例的体验～</h1>
      <p class="success-subtitle">你已经亲手写了 HTML、CSS、JS 和 Vue 的代码，迈出了前端学习的第一步！</p>
    </section>

    <!-- 中间：核心提示 -->
    <section class="info-section">
      <div class="tree-illustration">
        <div class="tree">
          <div class="tree-crown">🌳</div>
          <div class="tree-label">Vue</div>
        </div>
        <div class="soil">
          <div class="soil-layers">
            <div class="soil-item html-soil">HTML</div>
            <div class="soil-item css-soil">CSS</div>
            <div class="soil-item js-soil">JS（核心根须）</div>
          </div>
        </div>
      </div>

      <div class="info-content">
        <p class="info-intro">你体验的 4 个案例里：</p>
        <div class="info-list">
          <div class="info-item">
            <span class="info-icon">✨</span>
            <div class="info-text">
              <strong>HTML 是 Vue 的「骨架」</strong>
              <span>—— 决定 Vue 要展示的内容放在哪</span>
            </div>
          </div>
          <div class="info-item">
            <span class="info-icon">✨</span>
            <div class="info-text">
              <strong>CSS 是 Vue 的「颜值」</strong>
              <span>—— 让 Vue 做的页面更好看</span>
            </div>
          </div>
          <div class="info-item">
            <span class="info-icon">✨</span>
            <div class="info-text">
              <strong>JS 是 Vue 的「大脑」</strong>
              <span>—— Vue 的动态效果、点击交互，底层全靠 JS 驱动</span>
            </div>
          </div>
        </div>
        <p class="info-summary">
          想真正学会 Vue（不是抄代码，而是能自己写代码），不用啃完所有前端知识，
          只需掌握<strong>「学 Vue 必须用到的核心基础」</strong>就够了 
          —— 其中 <strong>JS 是最重要的</strong>，也是 Vue 的核心底层。
        </p>
      </div>
    </section>

    <!-- 底部：行动引导 -->
    <section class="action-section">
      <div class="action-buttons">
        <button class="action-btn primary" @click="goToBasics">
          <span class="btn-icon">📚</span>
          <span class="btn-text">补核心基础，再学 Vue</span>
        </button>
        <p class="btn-hint">只学和 Vue 相关的内容，3 小时搞定，不浪费时间</p>

        <button class="action-btn secondary" @click="goToVueCourse">
          <span class="btn-icon">🚀</span>
          <span class="btn-text">跳过基础，直接学 Vue</span>
        </button>
        <p class="btn-hint">学 Vue 时遇到不懂的基础，可随时回头补</p>
      </div>

      <p class="footer-text">无论选哪条路，我们都会陪着你，遇到问题随时问～</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToBasics = () => {
  router.push('/learn/basics')
}

const goToVueCourse = () => {
  router.push('/home')
}
</script>

<style scoped>
.completion-guide {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fdf9 0%, #e8f5e9 100%);
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48px;
}

/* 顶部成就区 */
.success-section {
  text-align: center;
  max-width: 600px;
}

.success-icons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  position: relative;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s;
}

.icon-item:hover {
  transform: translateY(-4px);
}

.icon-item .icon {
  font-size: 32px;
}

.icon-item .label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary, #666);
}

.icon-item.html { border-bottom: 3px solid #e44d26; }
.icon-item.css { border-bottom: 3px solid #1572b6; }
.icon-item.js { border-bottom: 3px solid #f7df1e; }
.icon-item.vue { border-bottom: 3px solid #41b883; }

.success-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 12px;
  line-height: 1.4;
}

.success-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
  line-height: 1.6;
}

/* 中间信息区 */
.info-section {
  display: flex;
  gap: 48px;
  align-items: center;
  max-width: 900px;
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.tree-illustration {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tree {
  text-align: center;
  margin-bottom: 8px;
}

.tree-crown {
  font-size: 64px;
  line-height: 1;
}

.tree-label {
  font-size: 18px;
  font-weight: 700;
  color: #41b883;
  margin-top: 8px;
}

.soil {
  background: linear-gradient(180deg, #8b6914 0%, #5d4e37 100%);
  border-radius: 12px;
  padding: 16px 24px;
  min-width: 180px;
}

.soil-layers {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.soil-item {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.html-soil {
  background: rgba(228, 77, 38, 0.9);
  color: white;
}

.css-soil {
  background: rgba(21, 114, 182, 0.9);
  color: white;
}

.js-soil {
  background: rgba(247, 223, 30, 0.95);
  color: #333;
  font-weight: 700;
}

.info-content {
  flex: 1;
}

.info-intro {
  font-size: 16px;
  color: #666;
  margin: 0 0 20px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.info-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.info-text {
  font-size: 15px;
  line-height: 1.6;
  color: #444;
}

.info-text strong {
  color: #2c3e50;
}

.info-text span {
  color: #666;
}

.info-summary {
  font-size: 15px;
  line-height: 1.8;
  color: #444;
  margin: 0;
  padding: 16px;
  background: rgba(65, 184, 131, 0.08);
  border-radius: 12px;
  border-left: 4px solid #41b883;
}

.info-summary strong {
  color: #41b883;
}

/* 底部行动区 */
.action-section {
  text-align: center;
  max-width: 500px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 18px 32px;
  border-radius: 16px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.action-btn.primary {
  background: linear-gradient(135deg, #41b883 0%, #35a070 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(65, 184, 131, 0.35);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(65, 184, 131, 0.45);
}

.action-btn.secondary {
  background: white;
  color: #41b883;
  border-color: #41b883;
}

.action-btn.secondary:hover {
  background: rgba(65, 184, 131, 0.08);
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 20px;
}

.btn-hint {
  font-size: 13px;
  color: #888;
  margin: 0 0 16px;
}

.footer-text {
  font-size: 14px;
  color: #666;
  margin: 0;
  padding: 16px 24px;
  background: rgba(65, 184, 131, 0.1);
  border-radius: 12px;
}

/* 响应式 */
@media (max-width: 768px) {
  .completion-guide {
    padding: 24px 16px;
    gap: 32px;
  }

  .success-icons {
    flex-wrap: wrap;
    gap: 12px;
  }

  .icon-item {
    padding: 12px;
  }

  .icon-item .icon {
    font-size: 24px;
  }

  .checkmark {
    right: 50%;
    transform: translateX(50%);
    top: -15px;
  }

  .success-title {
    font-size: 22px;
  }

  .info-section {
    flex-direction: column;
    padding: 24px;
    gap: 32px;
  }

  .tree-crown {
    font-size: 48px;
  }

  .soil {
    min-width: 160px;
    padding: 12px 16px;
  }

  .action-btn {
    padding: 16px 24px;
    font-size: 15px;
  }
}
</style>
