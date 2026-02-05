<template>
  <div class="html-basics">
    <!-- 模块1：开篇引导 -->
    <section class="intro-section">
      <div class="intro-illustration">
        <div class="house">
          <div class="house-roof">🏠</div>
          <div class="house-body">
            <div class="tag-block">&lt;div&gt;</div>
            <div class="tag-block">&lt;button&gt;</div>
            <div class="tag-block">&lt;p&gt;</div>
          </div>
          <div class="vue-icon">💚</div>
        </div>
      </div>
      <div class="intro-content">
        <h1 class="intro-title">HTML：给 Vue 搭个「房子」</h1>
        <p class="intro-subtitle">只学 4 个标签，就能写 Vue 模板</p>
        <p class="intro-desc">
          Vue 的所有内容都要放在 HTML 标签里，<br>
          就像家具要放在房子里一样～
        </p>
      </div>
    </section>

    <!-- 模块2：核心知识点 -->
    <section class="knowledge-section">
      <h2 class="section-title">🎯 只学这 4 个标签</h2>
      
      <!-- 知识点1：div -->
      <div class="knowledge-card">
        <div class="card-header">
          <span class="card-number">1</span>
          <div class="card-title-area">
            <h3 class="card-title">&lt;div&gt; 标签 —— Vue 的「主房间」</h3>
            <p class="card-desc">Vue 的挂载点必须放在 &lt;div&gt; 里，它是 Vue 的 "家"</p>
          </div>
        </div>
        <div class="code-demo">
          <div class="code-editor">
            <div class="editor-header">
              <span class="editor-label">📝 代码</span>
            </div>
            <div class="editor-content">
              <textarea 
                v-model="divCode" 
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
              <iframe :srcdoc="divPreview" class="preview-frame"></iframe>
            </div>
          </div>
        </div>
      </div>

      <!-- 知识点2：button -->
      <div class="knowledge-card">
        <div class="card-header">
          <span class="card-number">2</span>
          <div class="card-title-area">
            <h3 class="card-title">&lt;button&gt; 标签 —— Vue 的「开关」</h3>
            <p class="card-desc">Vue 的点击事件（@click）要绑定在按钮上</p>
          </div>
        </div>
        <div class="code-demo">
          <div class="code-editor">
            <div class="editor-header">
              <span class="editor-label">📝 代码</span>
            </div>
            <div class="editor-content">
              <textarea 
                v-model="buttonCode" 
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
              <iframe :srcdoc="buttonPreview" class="preview-frame"></iframe>
            </div>
          </div>
        </div>
      </div>

      <!-- 知识点3：p -->
      <div class="knowledge-card">
        <div class="card-header">
          <span class="card-number">3</span>
          <div class="card-title-area">
            <h3 class="card-title">&lt;p&gt; 标签 —— Vue 的「文字区」</h3>
            <p class="card-desc">用来展示 Vue 的文本数据</p>
          </div>
        </div>
        <div class="code-demo">
          <div class="code-editor">
            <div class="editor-header">
              <span class="editor-label">📝 代码</span>
            </div>
            <div class="editor-content">
              <textarea 
                v-model="pCode" 
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
              <iframe :srcdoc="pPreview" class="preview-frame"></iframe>
            </div>
          </div>
        </div>
      </div>

      <!-- 知识点4：ul/li -->
      <div class="knowledge-card">
        <div class="card-header">
          <span class="card-number">4</span>
          <div class="card-title-area">
            <h3 class="card-title">&lt;ul&gt; / &lt;li&gt; 标签 —— Vue 的「列表架」</h3>
            <p class="card-desc">Vue 的 v-for 遍历列表要用它们</p>
          </div>
        </div>
        <div class="code-demo">
          <div class="code-editor">
            <div class="editor-header">
              <span class="editor-label">📝 代码</span>
            </div>
            <div class="editor-content">
              <textarea 
                v-model="listCode" 
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
              <iframe :srcdoc="listPreview" class="preview-frame"></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 模块3：实战小练习 -->
    <section class="practice-section">
      <h2 class="section-title">✨ 动手试试</h2>
      <p class="practice-desc">用学过的标签，搭一个 Vue 计数器的基础模板</p>
      
      <div class="practice-editor">
        <div class="code-demo large">
          <div class="code-editor">
            <div class="editor-header">
              <span class="editor-label">📝 补充代码</span>
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
        🎉 HTML 骨架搭建成功！
      </div>
    </section>

    <!-- 模块4：下一步引导 -->
    <section class="next-section">
      <div class="next-content">
        <p class="next-hint">你已经会给 Vue 搭骨架了！接下来学 CSS，给 Vue 的「房子」装修～</p>
        <button class="next-btn" @click="goToCss">去学 CSS →</button>
      </div>
      <button class="back-btn" @click="goBack">← 返回</button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 知识点1：div 代码
const divCode = ref(`<div id="app">
  这是 Vue 的家
</div>`)

const divPreview = computed(() => `
  <style>
    body { font-family: system-ui; padding: 16px; margin: 0; }
    #app { padding: 20px; background: #f0fdf4; border: 2px dashed #41b883; border-radius: 8px; text-align: center; }
  </style>
  ${divCode.value}
`)

// 知识点2：button 代码
const buttonCode = ref(`<button>点我试试</button>`)

const buttonPreview = computed(() => `
  <style>
    body { font-family: system-ui; padding: 16px; margin: 0; display: flex; justify-content: center; }
    button { padding: 12px 24px; background: #41b883; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; }
    button:hover { background: #35a070; }
  </style>
  ${buttonCode.value}
`)

// 知识点3：p 代码
const pCode = ref(`<p>Hello Vue!</p>`)

const pPreview = computed(() => `
  <style>
    body { font-family: system-ui; padding: 16px; margin: 0; }
    p { font-size: 18px; color: #2c3e50; text-align: center; margin: 0; }
  </style>
  ${pCode.value}
`)

// 知识点4：ul/li 代码
const listCode = ref(`<ul>
  <li>学 HTML</li>
  <li>学 CSS</li>
  <li>学 Vue</li>
</ul>`)

const listPreview = computed(() => `
  <style>
    body { font-family: system-ui; padding: 16px; margin: 0; }
    ul { list-style: none; padding: 0; margin: 0; }
    li { padding: 8px 16px; margin: 4px 0; background: #f0fdf4; border-left: 3px solid #41b883; }
  </style>
  ${listCode.value}
`)

// 练习代码
const initialPracticeCode = `<div id="app">
  <p>计数器：0</p>
  <button>加 1</button>
</div>`

const practiceCode = ref(initialPracticeCode)

const practicePreview = computed(() => `
  <style>
    body { font-family: system-ui; padding: 16px; margin: 0; }
    #app { padding: 24px; background: #f0fdf4; border: 2px solid #41b883; border-radius: 12px; text-align: center; }
    p { font-size: 24px; color: #2c3e50; margin: 0 0 16px; }
    button { padding: 12px 32px; background: #41b883; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; }
  </style>
  ${practiceCode.value}
`)

// 练习完成检测
const practiceCompleted = computed(() => {
  const code = practiceCode.value
  return code.includes('<div') && 
         code.includes('<p>') && 
         code.includes('<button>') &&
         code.includes('</div>') &&
         code.includes('</p>') &&
         code.includes('</button>')
})

const resetPractice = () => {
  practiceCode.value = initialPracticeCode
}

const goToCss = () => {
  router.push('/learn/css-basics')
}

const goBack = () => {
  router.push('/learn/basics')
}
</script>

<style scoped>
.html-basics {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff8f0 0%, #fff0e6 100%);
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

.house {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.house-roof {
  font-size: 64px;
  line-height: 1;
}

.house-body {
  display: flex;
  gap: 8px;
  padding: 12px 24px;
  background: white;
  border: 2px solid #e65100;
  border-radius: 8px;
  margin-top: -20px;
}

.tag-block {
  padding: 4px 8px;
  background: #fff3e0;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  color: #e65100;
}

.vue-icon {
  position: absolute;
  right: -30px;
  top: 20px;
  font-size: 32px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.intro-title {
  font-size: 32px;
  font-weight: 700;
  color: #e65100;
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
  background: #e65100;
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
  background: linear-gradient(135deg, #41b883 0%, #35a070 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(65, 184, 131, 0.3);
}

.next-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(65, 184, 131, 0.4);
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
