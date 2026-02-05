<template>
  <div class="css-basics">
    <!-- 模块1：开篇引导 -->
    <section class="intro-section">
      <div class="intro-illustration">
        <div class="house-decoration">
          <div class="house-frame">🏠</div>
          <div class="decorations">
            <div class="paint-brush">🖌️</div>
            <div class="color-palette">🎨</div>
            <div class="sparkles">✨</div>
          </div>
        </div>
      </div>
      <div class="intro-content">
        <h1 class="intro-title">CSS：给 Vue 的「房子」装修</h1>
        <p class="intro-subtitle">只学 3 个概念，就能让 Vue 页面变好看</p>
        <p class="intro-desc">
          CSS 就像装修材料，给 HTML 搭好的「房子」刷漆、摆家具，<br>
          让 Vue 的页面变得漂亮又好用～
        </p>
      </div>
    </section>

    <!-- 模块2：核心知识点 -->
    <section class="knowledge-section">
      <h2 class="section-title">🎯 只学这 3 个概念</h2>
      
      <!-- 知识点1：选择器 -->
      <div class="knowledge-card">
        <div class="card-header">
          <span class="card-number">1</span>
          <div class="card-title-area">
            <h3 class="card-title">选择器 —— 找到要装修的「房间」</h3>
            <p class="card-desc">告诉 CSS 要给哪个 HTML 标签装修</p>
          </div>
        </div>
        <div class="code-demo">
          <div class="code-editor">
            <div class="editor-header">
              <span class="editor-label">📝 代码</span>
            </div>
            <div class="editor-content">
              <textarea 
                v-model="selectorCode" 
                class="code-input"
                spellcheck="false"
              ></textarea>
            </div>
          </div>
          <div class="code-preview">
            <div class="preview-header">
              <span class="preview-label">👀 效果</span>
            </div>
            <div class="preview-content">
              <iframe :srcdoc="selectorPreview" class="preview-frame"></iframe>
            </div>
          </div>
        </div>
      </div>

      <!-- 知识点2：核心属性 -->
      <div class="knowledge-card">
        <div class="card-header">
          <span class="card-number">2</span>
          <div class="card-title-area">
            <h3 class="card-title">核心属性 —— 装修的「工具箱」</h3>
            <p class="card-desc">只学 Vue 最常用的几个 CSS 属性</p>
          </div>
        </div>
        <div class="code-demo">
          <div class="code-editor">
            <div class="editor-header">
              <span class="editor-label">📝 代码</span>
            </div>
            <div class="editor-content">
              <textarea 
                v-model="propertiesCode" 
                class="code-input"
                spellcheck="false"
              ></textarea>
            </div>
          </div>
          <div class="code-preview">
            <div class="preview-header">
              <span class="preview-label">👀 效果</span>
            </div>
            <div class="preview-content">
              <iframe :srcdoc="propertiesPreview" class="preview-frame"></iframe>
            </div>
          </div>
        </div>
      </div>

      <!-- 知识点3：Flex 布局 -->
      <div class="knowledge-card">
        <div class="card-header">
          <span class="card-number">3</span>
          <div class="card-title-area">
            <h3 class="card-title">Flex 布局 —— 摆放家具的「魔法」</h3>
            <p class="card-desc">轻松让元素排成一行或一列，Vue 组件必备</p>
          </div>
        </div>
        <div class="code-demo">
          <div class="code-editor">
            <div class="editor-header">
              <span class="editor-label">📝 代码</span>
            </div>
            <div class="editor-content">
              <textarea 
                v-model="flexCode" 
                class="code-input"
                spellcheck="false"
              ></textarea>
            </div>
          </div>
          <div class="code-preview">
            <div class="preview-header">
              <span class="preview-label">👀 效果</span>
            </div>
            <div class="preview-content">
              <iframe :srcdoc="flexPreview" class="preview-frame"></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 模块3：实战小练习 -->
    <section class="practice-section">
      <h2 class="section-title">✨ 动手试试</h2>
      <p class="practice-desc">用学过的 CSS，给 Vue 按钮组件装修一下</p>
      
      <div class="practice-editor">
        <div class="code-demo large">
          <div class="code-editor">
            <div class="editor-header">
              <span class="editor-label">📝 补充 CSS</span>
              <button class="reset-btn" @click="resetPractice">重置</button>
            </div>
            <div class="editor-content">
              <textarea 
                v-model="practiceCode" 
                class="code-input large"
                spellcheck="false"
              ></textarea>
            </div>
          </div>
          <div class="code-preview">
            <div class="preview-header">
              <span class="preview-label">👀 效果</span>
            </div>
            <div class="preview-content">
              <iframe :srcdoc="practicePreview" class="preview-frame"></iframe>
            </div>
          </div>
        </div>
      </div>

      <div v-if="practiceCompleted" class="success-toast">
        🎉 CSS 装修完成！按钮变漂亮了～
      </div>
    </section>

    <!-- 模块4：下一步引导 -->
    <section class="next-section">
      <div class="next-content">
        <p class="next-hint">你已经会给 Vue「房子」装修了！接下来学 JS，让房子「活」起来～</p>
        <button class="next-btn" @click="goToJs">去学 JS →</button>
      </div>
      <button class="back-btn" @click="goBack">← 返回</button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 知识点1：选择器代码
const selectorCode = ref(`/* 找到所有按钮 */
button {
  background: #41b883;
  color: white;
}

/* 找到特定按钮 */
.primary-btn {
  font-size: 18px;
}

/* 找到有 id 的元素 */
#submit-btn {
  padding: 12px;
}`)

const selectorPreview = computed(() => `
  <style>
    body { font-family: system-ui; padding: 16px; margin: 0; }
    ${selectorCode.value}
    .btn-group { display: flex; gap: 12px; flex-wrap: wrap; }
  </style>
  <div class="btn-group">
    <button>普通按钮</button>
    <button class="primary-btn">主要按钮</button>
    <button id="submit-btn">提交按钮</button>
  </div>
`)

// 知识点2：核心属性代码
const propertiesCode = ref(`.vue-btn {
  /* 颜色和背景 */
  color: white;
  background: #41b883;
  
  /* 间距和大小 */
  padding: 12px 24px;
  margin: 8px;
  
  /* 边框和圆角 */
  border: none;
  border-radius: 8px;
  
  /* 文字样式 */
  font-size: 16px;
  font-weight: 600;
}`)

const propertiesPreview = computed(() => `
  <style>
    body { font-family: system-ui; padding: 16px; margin: 0; }
    ${propertiesCode.value}
    .demo-area { display: flex; justify-content: center; }
  </style>
  <div class="demo-area">
    <button class="vue-btn">Vue 按钮</button>
  </div>
`)

// 知识点3：Flex 布局代码
const flexCode = ref(`.button-group {
  display: flex;           /* 启用 Flex 布局 */
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */
  gap: 12px;              /* 按钮间距 */
  flex-wrap: wrap;         /* 允许换行 */
}

.button-group button {
  flex: 1;                 /* 按钮平分空间 */
  min-width: 100px;        /* 最小宽度 */
}`)

const flexPreview = computed(() => `
  <style>
    body { font-family: system-ui; padding: 16px; margin: 0; }
    ${flexCode.value}
    button { padding: 12px 24px; background: #41b883; color: white; border: none; border-radius: 8px; cursor: pointer; }
    button:hover { background: #35a070; }
  </style>
  <div class="button-group">
    <button>按钮 1</button>
    <button>按钮 2</button>
    <button>按钮 3</button>
  </div>
`)

// 练习代码
const initialPracticeCode = `/* 给 Vue 按钮组件添加样式 */
.vue-button {
  /* 补充背景色 */
  background: #41b883;
  
  /* 补充文字颜色 */
  color: white;
  
  /* 补充内边距 */
  padding: 12px 24px;
  
  /* 补充圆角 */
  border-radius: 8px;
  
  /* 移除默认边框 */
  border: none;
  
  /* 补充字体大小 */
  font-size: 16px;
  
  /* 补充鼠标样式 */
  cursor: pointer;
}

/* 鼠标悬停效果 */
.vue-button:hover {
  background: #35a070;
}`

const practiceCode = ref(initialPracticeCode)

const practicePreview = computed(() => `
  <style>
    body { font-family: system-ui; padding: 16px; margin: 0; }
    ${practiceCode.value}
    .demo-container { display: flex; justify-content: center; align-items: center; min-height: 200px; }
  </style>
  <div class="demo-container">
    <button class="vue-button">Vue 按钮</button>
  </div>
`)

// 练习完成检测
const practiceCompleted = computed(() => {
  const code = practiceCode.value
  return code.includes('background:') && 
         code.includes('color:') && 
         code.includes('padding:') &&
         code.includes('border-radius:') &&
         code.includes(':hover')
})

const resetPractice = () => {
  practiceCode.value = initialPracticeCode
}

const goToJs = () => {
  router.push('/learn/js-basics')
}

const goBack = () => {
  router.push('/learn/basics')
}
</script>

<style scoped>
.css-basics {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
  padding: 40px 24px 100px;
}

/* 开篇引导 */
.intro-section {
  max-width: 600px;
  margin: 0 auto 48px;
  text-align: center;
}

.intro-illustration {
  margin-bottom: 24px;
}

.house-decoration {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.house-frame {
  font-size: 64px;
  line-height: 1;
}

.decorations {
  position: absolute;
  top: -10px;
  right: -40px;
  display: flex;
  gap: 8px;
}

.paint-brush, .color-palette {
  font-size: 24px;
  animation: float 3s ease-in-out infinite;
}

.sparkles {
  font-size: 20px;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

@keyframes sparkle {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.intro-title {
  font-size: 32px;
  font-weight: 700;
  color: #1e88e5;
  margin: 0 0 12px;
}

.intro-subtitle {
  font-size: 18px;
  color: #41b883;
  font-weight: 600;
  margin: 0 0 16px;
}

.intro-desc {
  font-size: 16px;
  color: #666;
  line-height: 1.8;
  margin: 0;
}

/* 知识点区域 */
.knowledge-section {
  max-width: 800px;
  margin: 0 auto 48px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 24px;
  text-align: center;
}

.knowledge-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.card-number {
  width: 32px;
  height: 32px;
  background: #1e88e5;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 6px;
}

.card-desc {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* 代码演示区 */
.code-demo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
}

.code-demo.large {
  grid-template-columns: 1fr 1fr;
}

.code-editor, .code-preview {
  display: flex;
  flex-direction: column;
}

.editor-header, .preview-header {
  padding: 8px 12px;
  background: #e9ecef;
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-label, .preview-label {
  font-size: 13px;
  font-weight: 600;
  color: #495057;
}

.reset-btn {
  padding: 4px 12px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.reset-btn:hover {
  background: #5a6268;
}

.editor-content, .preview-content {
  flex: 1;
  min-height: 120px;
}

.code-input {
  width: 100%;
  height: 100%;
  min-height: 120px;
  padding: 12px;
  border: none;
  border-radius: 0 0 8px 8px;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  background: #2d3748;
  color: #e2e8f0;
}

.code-input.large {
  min-height: 180px;
}

.code-input:focus {
  outline: none;
}

.preview-frame {
  width: 100%;
  height: 100%;
  min-height: 120px;
  border: none;
  border-radius: 0 0 8px 8px;
  background: white;
}

/* 练习区域 */
.practice-section {
  max-width: 800px;
  margin: 0 auto 48px;
}

.practice-desc {
  text-align: center;
  font-size: 16px;
  color: #666;
  margin: 0 0 24px;
}

.practice-editor {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.success-toast {
  text-align: center;
  padding: 16px 24px;
  background: #d4edda;
  color: #155724;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  margin-top: 24px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 下一步引导 */
.next-section {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.next-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.next-hint {
  font-size: 16px;
  color: #666;
  margin: 0 0 24px;
}

.next-btn {
  padding: 16px 48px;
  background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(30, 136, 229, 0.3);
}

.next-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(30, 136, 229, 0.4);
}

.back-btn {
  padding: 12px 24px;
  background: white;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f5f5f5;
  color: #333;
}

/* 响应式 */
@media (max-width: 768px) {
  .code-demo {
    grid-template-columns: 1fr;
  }
  
  .intro-title {
    font-size: 24px;
  }
}
</style>
