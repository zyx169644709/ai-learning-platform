<template>
  <div class="project-basics">
    <!-- 顶部导航 -->
    <div class="course-header">
      <button class="back-btn" @click="goBack">← 返回课程列表</button>
      <h1 class="course-title">🎯 综合实战：个人简介页面</h1>
      <p class="course-subtitle">整合 HTML + CSS + JavaScript 三大技术</p>
    </div>

    <!-- 课程内容 -->
    <div class="course-content">
      <!-- 项目介绍 -->
      <div class="knowledge-card">
        <h3 class="card-title">🎨 项目介绍</h3>
        <div class="text-content">
          <p>现在让我们整合 HTML、CSS、JavaScript 三大技术，制作一个完整的个人简介页面！</p>
          <ul>
            <li>📄 <strong>HTML</strong>：搭建页面结构（标题、个人信息列表、按钮）</li>
            <li>🎨 <strong>CSS</strong>：美化页面（背景色、文本样式、按钮样式、居中布局）</li>
            <li>⚡ <strong>JavaScript</strong>：实现交互（点击按钮修改简介、弹出欢迎语）</li>
          </ul>
        </div>
      </div>

      <!-- 完整代码 -->
      <div class="knowledge-card">
        <h3 class="card-title">💻 完整代码</h3>
        <div class="text-content">
          <p>下面是一个完整的个人简介页面，包含了 HTML 结构、CSS 样式和 JavaScript 交互：</p>
        </div>
        
        <div class="code-demo">
          <div class="code-editor">
            <div class="editor-header">
              <span class="editor-label">📝 试着修改代码</span>
            </div>
            <div class="editor-content">
              <textarea 
                v-model="projectCode" 
                class="code-input large"
                spellcheck="false"
              ></textarea>
            </div>
          </div>
          <div class="code-preview">
            <div class="preview-header">
              <span class="preview-label">👀 实时预览</span>
            </div>
            <div class="preview-content">
              <iframe :srcdoc="projectPreview" :key="projectKey" class="preview-frame large"></iframe>
            </div>
          </div>
        </div>
      </div>

      <!-- 代码讲解 -->
      <div class="knowledge-card">
        <h3 class="card-title">📚 代码讲解</h3>
        <div class="text-content">
          <div class="syntax-box">
            <p><strong>HTML 部分</strong></p>
            <ul>
              <li>使用 <code>&lt;div class="container"&gt;</code> 作为主容器</li>
              <li>使用 <code>&lt;h1&gt;</code> 显示标题</li>
              <li>使用 <code>&lt;ul&gt;</code> 和 <code>&lt;li&gt;</code> 显示个人信息列表</li>
              <li>使用 <code>&lt;button&gt;</code> 创建交互按钮</li>
            </ul>
          </div>

          <div class="syntax-box">
            <p><strong>CSS 部分</strong></p>
            <ul>
              <li>设置 <code>body</code> 的背景色和字体</li>
              <li>使用 <code>margin: 0 auto</code> 实现容器水平居中</li>
              <li>使用 <code>padding</code> 和 <code>border-radius</code> 美化卡片</li>
              <li>使用 <code>:hover</code> 伪类实现按钮悬停效果</li>
            </ul>
          </div>

          <div class="syntax-box">
            <p><strong>JavaScript 部分</strong></p>
            <ul>
              <li>使用 <code>document.getElementById()</code> 获取元素</li>
              <li>使用 <code>innerText</code> 修改文本内容</li>
              <li>使用 <code>alert()</code> 弹出欢迎语</li>
              <li>使用 <code>onclick</code> 绑定点击事件</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 完成总结 -->
      <div class="knowledge-card success">
        <h3 class="card-title">🎉 恭喜你！</h3>
        <div class="text-content">
          <p>你已经完成了 HTML、CSS、JavaScript 三大核心基础课程的学习！</p>
          <p>现在你已经掌握了：</p>
          <ul>
            <li>✅ HTML 的基本概念和语法</li>
            <li>✅ 常用的 HTML 标签</li>
            <li>✅ CSS 的基础语法和常用属性</li>
            <li>✅ CSS 简单布局技巧</li>
            <li>✅ JavaScript 的基础语法</li>
            <li>✅ JavaScript 简单交互功能</li>
            <li>✅ HTML + CSS + JavaScript 综合应用</li>
          </ul>
          <p><strong>接下来可以继续学习更多高级内容，不断提升你的前端开发技能！</strong></p>
        </div>
      </div>

      <div class="action-buttons">
        <button class="back-btn-large" @click="goBack">← 返回课程列表</button>
        <button class="complete-btn" @click="completeCourse">🎉 完成所有课程</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 综合实战项目代码
const projectCode = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>我的个人简介</title>
  <style>
    /* CSS 样式 */
    body {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .container {
      background: white;
      max-width: 500px;
      width: 100%;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      text-align: center;
    }
    
    h1 {
      color: #667eea;
      margin: 0 0 10px;
      font-size: 32px;
    }
    
    .subtitle {
      color: #666;
      margin: 0 0 30px;
      font-size: 16px;
    }
    
    .info-list {
      list-style: none;
      padding: 0;
      margin: 0 0 30px;
      text-align: left;
    }
    
    .info-list li {
      padding: 12px;
      margin: 8px 0;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    
    .info-list strong {
      color: #667eea;
      margin-right: 8px;
    }
    
    button {
      padding: 12px 30px;
      margin: 5px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .btn-primary {
      background: #667eea;
      color: white;
    }
    
    .btn-primary:hover {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    
    .btn-secondary {
      background: #764ba2;
      color: white;
    }
    
    .btn-secondary:hover {
      background: #63408a;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(118, 75, 162, 0.4);
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- HTML 结构 -->
    <h1>👋 你好，我是小明</h1>
    <p class="subtitle" id="subtitle">欢迎来到我的个人主页</p>
    
    <ul class="info-list">
      <li><strong>🎓 职业：</strong>前端开发工程师</li>
      <li><strong>📍 城市：</strong>北京</li>
      <li><strong>💻 技能：</strong>HTML, CSS, JavaScript</li>
      <li><strong>🎯 爱好：</strong>编程、阅读、旅行</li>
    </ul>
    
    <!-- JavaScript 交互按钮 -->
    <button class="btn-primary" onclick="changeIntro()">
      修改简介
    </button>
    <button class="btn-secondary" onclick="showWelcome()">
      欢迎语
    </button>
  </div>
  
  <script>
    // JavaScript 交互功能
    function changeIntro() {
      const subtitle = document.getElementById('subtitle');
      subtitle.innerText = '热爱编程，持续学习中... 🚀';
    }
    
    function showWelcome() {
      alert('🎉 欢迎访问我的个人主页！\\n\\n很高兴认识你！');
    }
  <\/script>
</body>
</html>`)

const projectPreview = computed(() => projectCode.value)
const projectKey = ref(0)
watch(projectCode, () => projectKey.value++)

const goBack = () => {
  router.push('/learn/basics')
}

const completeCourse = () => {
  alert('🎉 恭喜完成所有核心基础课程！\n\n你已经掌握了 HTML、CSS、JavaScript 三大核心技术！')
  router.push('/learn/basics')
}
</script>

<style scoped>
.project-basics {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff9e6 0%, #ffe0b2 100%);
  padding: 20px;
}

/* 顶部导航 */
.course-header {
  max-width: 1200px;
  margin: 0 auto 30px;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.back-btn {
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.2s;
  display: inline-block;
  margin-bottom: 20px;
}

.back-btn:hover {
  background: #e0e0e0;
  color: #333;
}

.course-title {
  font-size: 32px;
  font-weight: 700;
  color: #ff6f00;
  margin: 0 0 10px;
}

.course-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

/* 课程内容 */
.course-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* 知识卡片 */
.knowledge-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.knowledge-card.success {
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
  border: 2px solid #4caf50;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #ff6f00;
  margin: 0 0 16px;
}

.text-content {
  color: #333;
  line-height: 1.8;
}

.text-content p {
  margin: 0 0 12px;
}

.text-content ul {
  margin: 12px 0;
  padding-left: 24px;
}

.text-content li {
  margin-bottom: 8px;
}

.text-content code {
  padding: 2px 6px;
  background: #fff3e0;
  color: #ff6f00;
  border-radius: 3px;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
}

.syntax-box {
  background: #f8f9fa;
  border-left: 4px solid #ff6f00;
  padding: 16px;
  margin: 16px 0;
  border-radius: 4px;
}

.syntax-box p {
  margin: 0 0 8px;
}

.syntax-box ul {
  margin: 8px 0;
  padding-left: 20px;
}

/* 代码演示区 */
.code-demo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
}

.code-editor, .code-preview {
  display: flex;
  flex-direction: column;
}

.editor-header, .preview-header {
  padding: 10px 12px;
  background: #e9ecef;
  border-radius: 8px 8px 0 0;
  font-size: 13px;
  font-weight: 600;
  color: #495057;
}

.editor-content, .preview-content {
  flex: 1;
  min-height: 400px;
}

.code-input {
  width: 100%;
  height: 100%;
  min-height: 400px;
  padding: 12px;
  border: none;
  border-radius: 0 0 8px 8px;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: none;
  background: #2d3748;
  color: #e2e8f0;
}

.code-input.large {
  min-height: 500px;
}

.code-input:focus {
  outline: none;
}

.preview-frame {
  width: 100%;
  height: 100%;
  min-height: 400px;
  border: none;
  border-radius: 0 0 8px 8px;
  background: white;
}

.preview-frame.large {
  min-height: 500px;
}

/* 按钮 */
.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
  gap: 16px;
}

.back-btn-large, .complete-btn {
  flex: 1;
  padding: 14px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn-large {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

.back-btn-large:hover {
  background: #e0e0e0;
  color: #333;
}

.complete-btn {
  background: linear-gradient(135deg, #ff6f00 0%, #f57c00 100%);
  color: white;
}

.complete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 111, 0, 0.3);
}

/* 响应式 */
@media (max-width: 768px) {
  .code-demo {
    grid-template-columns: 1fr;
  }
  
  .course-title {
    font-size: 24px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
