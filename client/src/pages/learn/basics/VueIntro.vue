<template>
  <div class="vue-intro">
    <!-- 第一部分：恭喜完成 -->
    <section class="congratulations-section">
      <div class="congrats-content">
        <div class="congrats-icon">🎉</div>
        <h1 class="congrats-title">欢饮来到Vue的世界！</h1>
        <p class="congrats-desc">你已经掌握了前端开发的三大核心技术</p>
        
        <div class="skills-grid">
          <div class="skill-card">
            <div class="skill-icon">📄</div>
            <h3>HTML</h3>
            <p>网页结构</p>
          </div>
          <div class="skill-card">
            <div class="skill-icon">🎨</div>
            <h3>CSS</h3>
            <p>网页样式</p>
          </div>
          <div class="skill-card">
            <div class="skill-icon">⚡</div>
            <h3>JavaScript</h3>
            <p>网页交互</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 第二部分：Vue 和 JavaScript 的关系 -->
    <section class="relationship-section">
      <h2 class="section-title">🤔 Vue 和 JavaScript 是什么关系？</h2>
      
      <div class="relationship-visual">
        <div class="tech-box js-box">
          <div class="tech-logo">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JavaScript" />
          </div>
          <h3>JavaScript</h3>
          <p class="tech-desc">编程语言（基础）</p>
          <ul class="tech-features">
            <li>变量、函数、对象</li>
            <li>DOM 操作</li>
            <li>事件处理</li>
          </ul>
        </div>

        <div class="arrow-container">
          <div class="arrow">→</div>
          <div class="arrow-text">Vue 是用 JavaScript 写的</div>
        </div>

        <div class="tech-box vue-box">
          <div class="tech-logo">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg" alt="Vue" />
          </div>
          <h3>Vue.js</h3>
          <p class="tech-desc">JavaScript 框架（工具）</p>
          <ul class="tech-features">
            <li>简化 DOM 操作</li>
            <li>响应式数据</li>
            <li>组件化开发</li>
          </ul>
        </div>
      </div>

      <div class="key-points">
        <div class="point-card">
          <div class="point-icon">💡</div>
          <h4>Vue 是用 JavaScript 写的框架</h4>
          <p>就像汽车是用零件组装的，Vue 是用 JavaScript 代码构建的工具</p>
        </div>
        <div class="point-card">
          <div class="point-icon">🚀</div>
          <h4>Vue 让 JavaScript 开发更简单</h4>
          <p>原本需要 10 行 JS 代码的功能，用 Vue 可能只需要 2 行</p>
        </div>
        <div class="point-card">
          <div class="point-icon">🔗</div>
          <h4>你学的 JS 知识在 Vue 中都会用到</h4>
          <p>变量、函数、对象、数组...这些基础知识是学习 Vue 的前提</p>
        </div>
      </div>
    </section>

    <!-- 第三部分：代码对比示例 -->
    <section class="comparison-section">
      <h2 class="section-title">📊 同样的功能，Vue 更简单</h2>
      <p class="section-desc">让我们用计数器来对比一下纯 JavaScript 和 Vue 的实现方式</p>

      <div class="code-comparison">
        <div class="comparison-item">
          <div class="comparison-header js-header">
            <span class="header-icon">⚡</span>
            <span class="header-title">纯 JavaScript 实现</span>
            <span class="code-lines">需要 20+ 行代码</span>
          </div>
          <div class="code-block">
            <pre><code>&lt;div id="app"&gt;
  &lt;h2 id="count"&gt;0&lt;/h2&gt;
  &lt;button id="btn"&gt;点击+1&lt;/button&gt;
&lt;/div&gt;

&lt;script&gt;
  let count = 0;
  const countEl = document.getElementById('count');
  const btn = document.getElementById('btn');
  
  btn.addEventListener('click', () => {
    count++;
    countEl.textContent = count;
  });
&lt;/script&gt;</code></pre>
          </div>
          <div class="code-notes">
            <p>❌ 需要手动获取 DOM 元素</p>
            <p>❌ 需要手动更新页面内容</p>
            <p>❌ 代码分散在 HTML 和 JS 中</p>
          </div>
        </div>

        <div class="vs-divider">VS</div>

        <div class="comparison-item">
          <div class="comparison-header vue-header">
            <span class="header-icon">💚</span>
            <span class="header-title">Vue 实现</span>
            <span class="code-lines">只需 10 行代码</span>
          </div>
          <div class="code-block">
            <pre v-pre><code>&lt;div id="app"&gt;
  &lt;h2&gt;{{ count }}&lt;/h2&gt;
  &lt;button @click="count++"&gt;点击+1&lt;/button&gt;
&lt;/div&gt;

&lt;script&gt;
  const { createApp } = Vue;
  createApp({
    data() {
      return { count: 0 }
    }
  }).mount('#app');
&lt;/script&gt;</code></pre>
          </div>
          <div class="code-notes success">
            <p>✅ 自动绑定数据到页面</p>
            <p>✅ 数据变化自动更新页面</p>
            <p>✅ 代码简洁易读</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 第四部分：知识映射 -->
    <section class="mapping-section">
      <h2 class="section-title">🔗 你的 JavaScript 知识如何在 Vue 中使用？</h2>
      
      <div class="mapping-grid">
        <div class="mapping-card">
          <div class="mapping-from">
            <span class="tech-label js-label">JavaScript</span>
            <code>let name = '小明'</code>
          </div>
          <div class="mapping-arrow">→</div>
          <div class="mapping-to">
            <span class="tech-label vue-label">Vue</span>
            <code>data() { return { name: '小明' } }</code>
          </div>
          <p class="mapping-desc">变量 → 响应式数据</p>
        </div>

        <div class="mapping-card">
          <div class="mapping-from">
            <span class="tech-label js-label">JavaScript</span>
            <code>function sayHi() { ... }</code>
          </div>
          <div class="mapping-arrow">→</div>
          <div class="mapping-to">
            <span class="tech-label vue-label">Vue</span>
            <code>methods: { sayHi() { ... } }</code>
          </div>
          <p class="mapping-desc">函数 → Vue 方法</p>
        </div>

        <div class="mapping-card">
          <div class="mapping-from">
            <span class="tech-label js-label">JavaScript</span>
            <code>element.textContent = value</code>
          </div>
          <div class="mapping-arrow">→</div>
          <div class="mapping-to">
            <span class="tech-label vue-label">Vue</span>
            <code v-pre>{{ value }}</code>
          </div>
          <p class="mapping-desc">DOM 操作 → 模板语法</p>
        </div>

        <div class="mapping-card">
          <div class="mapping-from">
            <span class="tech-label js-label">JavaScript</span>
            <code>btn.addEventListener('click', fn)</code>
          </div>
          <div class="mapping-arrow">→</div>
          <div class="mapping-to">
            <span class="tech-label vue-label">Vue</span>
            <code>@click="fn"</code>
          </div>
          <p class="mapping-desc">事件监听 → 事件绑定</p>
        </div>
      </div>
    </section>

    <!-- 第五部分：下一步行动 -->
    <section class="action-section">
      <div class="action-content">
        <h2 class="action-title">🚀 准备好开始学习 Vue 了吗？</h2>
        <p class="action-desc">你已经具备了所有必要的基础知识，现在是时候学习 Vue 了！</p>
        
        <div class="action-buttons">
          <button class="btn-primary" @click="startVue">
            <span class="btn-icon">🎯</span>
            开始学习 Vue
          </button>
          <button class="btn-secondary" @click="reviewBasics">
            <span class="btn-icon">📚</span>
            复习基础知识
          </button>
        </div>

        <div class="next-steps">
          <h3>接下来你将学到：</h3>
          <div class="steps-grid">
            <div class="step-item">
              <span class="step-number">1</span>
              <p>Vue 基本概念</p>
            </div>
            <div class="step-item">
              <span class="step-number">2</span>
              <p>响应式数据</p>
            </div>
            <div class="step-item">
              <span class="step-number">3</span>
              <p>模板语法</p>
            </div>
            <div class="step-item">
              <span class="step-number">4</span>
              <p>组件开发</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const startVue = () => {
  router.push('/home')
}

const reviewBasics = () => {
  router.push('/learn/basics')
}
</script>

<style scoped>
.vue-intro {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 第一部分：恭喜完成 */
.congratulations-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 20px;
  text-align: center;
}

.congrats-content {
  max-width: 800px;
  margin: 0 auto;
}

.congrats-icon {
  font-size: 80px;
  margin-bottom: 20px;
  animation: bounce 1s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.congrats-title {
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 16px;
}

.congrats-desc {
  font-size: 20px;
  opacity: 0.9;
  margin: 0 0 40px;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 40px;
}

.skill-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 30px 20px;
  transition: all 0.3s;
}

.skill-card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.15);
}

.skill-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.skill-card h3 {
  font-size: 24px;
  margin: 0 0 8px;
}

.skill-card p {
  font-size: 14px;
  opacity: 0.8;
  margin: 0;
}

/* 第二部分：关系说明 */
.relationship-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px;
}

.section-title {
  font-size: 36px;
  font-weight: 700;
  text-align: center;
  color: #2c3e50;
  margin: 0 0 48px;
}

.section-desc {
  text-align: center;
  font-size: 18px;
  color: #666;
  margin: -32px 0 48px;
}

.relationship-visual {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 40px;
  align-items: center;
  margin-bottom: 60px;
}

.tech-box {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.js-box {
  border: 3px solid #f7df1e;
}

.vue-box {
  border: 3px solid #42b883;
}

.tech-logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
}

.tech-logo img {
  width: 100%;
  height: 100%;
}

.tech-box h3 {
  font-size: 28px;
  margin: 0 0 8px;
  color: #2c3e50;
}

.tech-desc {
  font-size: 16px;
  color: #666;
  margin: 0 0 24px;
}

.tech-features {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.tech-features li {
  padding: 8px 0;
  color: #555;
  font-size: 14px;
}

.tech-features li:before {
  content: "✓ ";
  color: #42b883;
  font-weight: bold;
  margin-right: 8px;
}

.arrow-container {
  text-align: center;
}

.arrow {
  font-size: 48px;
  color: #42b883;
  font-weight: bold;
}

.arrow-text {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
}

.key-points {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.point-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #42b883;
}

.point-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.point-card h4 {
  font-size: 18px;
  color: #2c3e50;
  margin: 0 0 12px;
}

.point-card p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* 第三部分：代码对比 */
.comparison-section {
  background: white;
  padding: 80px 20px;
}

.code-comparison {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 40px;
  align-items: start;
}

.comparison-item {
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
}

.comparison-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
}

.js-header {
  background: linear-gradient(135deg, #f7df1e 0%, #e6ce00 100%);
  color: #333;
}

.vue-header {
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
}

.header-icon {
  font-size: 20px;
}

.header-title {
  flex: 1;
  font-weight: 600;
  font-size: 16px;
}

.code-lines {
  font-size: 12px;
  opacity: 0.8;
}

.code-block {
  background: #2d3748;
  padding: 20px;
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
}

.code-block code {
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #e2e8f0;
}

.code-notes {
  padding: 16px 20px;
}

.code-notes p {
  margin: 8px 0;
  font-size: 14px;
  color: #666;
}

.code-notes.success p {
  color: #42b883;
}

.vs-divider {
  font-size: 32px;
  font-weight: bold;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 第四部分：知识映射 */
.mapping-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px;
}

.mapping-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.mapping-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mapping-from, .mapping-to {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tech-label {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  width: fit-content;
}

.js-label {
  background: #fff3cd;
  color: #856404;
}

.vue-label {
  background: #d4edda;
  color: #155724;
}

.mapping-card code {
  display: block;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  color: #2c3e50;
}

.mapping-arrow {
  font-size: 24px;
  color: #42b883;
  text-align: center;
  font-weight: bold;
}

.mapping-desc {
  text-align: center;
  font-size: 14px;
  color: #666;
  font-weight: 600;
  margin: 0;
}

/* 第五部分：行动号召 */
.action-section {
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
  color: white;
  padding: 80px 20px;
}

.action-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.action-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 16px;
}

.action-desc {
  font-size: 18px;
  opacity: 0.9;
  margin: 0 0 40px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 60px;
}

.btn-primary, .btn-secondary {
  padding: 16px 40px;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: white;
  color: #42b883;
}

.btn-primary:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-icon {
  font-size: 20px;
}

.next-steps {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 32px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.next-steps h3 {
  font-size: 20px;
  margin: 0 0 24px;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.step-item {
  text-align: center;
}

.step-number {
  display: inline-block;
  width: 40px;
  height: 40px;
  line-height: 40px;
  background: white;
  color: #42b883;
  border-radius: 50%;
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 8px;
}

.step-item p {
  font-size: 14px;
  margin: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .skills-grid,
  .relationship-visual,
  .key-points,
  .code-comparison,
  .mapping-grid,
  .steps-grid {
    grid-template-columns: 1fr;
  }

  .arrow-container {
    transform: rotate(90deg);
  }

  .vs-divider {
    transform: rotate(90deg);
  }

  .action-buttons {
    flex-direction: column;
  }

  .congrats-title {
    font-size: 32px;
  }

  .section-title {
    font-size: 28px;
  }
}
</style>
