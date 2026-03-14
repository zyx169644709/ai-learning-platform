<template>
  <div class="css-basics">
    <!-- 顶部导航 -->
    <div class="course-header">
      <button class="back-btn" @click="goBack">← 返回课程列表</button>
      <h1 class="course-title">🎨 CSS 核心基础</h1>
      <div class="progress-info">
        <span class="progress-text">{{ currentStep }}/{{ totalSteps }} 步骤</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: (currentStep / totalSteps * 100) + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- 步骤导航 -->
    <div class="step-nav">
      <div 
        v-for="(step, index) in steps" 
        :key="index"
        class="step-item"
        :class="{ active: currentStep === index + 1, completed: currentStep > index + 1 }"
        @click="goToStep(index + 1)"
      >
        <div class="step-number">{{ currentStep > index + 1 ? '✓' : index + 1 }}</div>
        <div class="step-name">{{ step.name }}</div>
      </div>
    </div>

    <!-- 课程内容 -->
    <div class="course-content">
      <!-- 步骤1：初识 CSS -->
      <section v-show="currentStep === 1" class="step-section">
        <h2 class="section-title">🎨 第一章：初识 CSS</h2>
        
        <!-- 1.1 什么是 CSS -->
        <div class="knowledge-card">
          <h3 class="card-title">💡 什么是 CSS？</h3>
          <div class="text-content">
            <p><strong>CSS</strong>（Cascading Style Sheets，层叠样式表）是网页的「皮肤」。</p>
            <p>如果说 HTML 是房子的框架，那么 CSS 就是装修材料：</p>
            <ul>
              <li>🎨 <strong>核心作用</strong>：美化网页、控制布局</li>
              <li>🖌️ <strong>通俗理解</strong>：CSS 就像化妆品，让网页变得漂亮</li>
              <li>🎯 <strong>与 HTML 的关系</strong>：HTML 定义内容，CSS 定义样式</li>
            </ul>
          </div>
        </div>

        <!-- 1.2 CSS 引入方式 -->
        <div class="knowledge-card">
          <h3 class="card-title">📥 CSS 引入方式</h3>
          <div class="text-content">
            <p>CSS 有三种引入方式，各有优缺点：</p>
            
            <div class="syntax-box">
              <p><strong>1. 行内样式</strong>（style 属性）</p>
              <code>&lt;p style="color: red;"&gt;红色文字&lt;/p&gt;</code>
              <p class="note">✅ 优点：简单直接<br>❌ 缺点：复用性差，不推荐大量使用</p>
            </div>

            <div class="syntax-box">
              <p><strong>2. 内部样式</strong>（&lt;style&gt; 标签）</p>
              <pre><code>&lt;head&gt;
  &lt;style&gt;
    p { color: red; }
  &lt;/style&gt;
&lt;/head&gt;</code></pre>
              <p class="note">✅ 优点：单页面样式管理方便<br>❌ 缺点：只能在当前页面使用</p>
            </div>

            <div class="syntax-box success">
              <p><strong>3. 外部样式</strong>（link 引入 .css 文件）⭐ 推荐</p>
              <pre><code>&lt;head&gt;
  &lt;link rel="stylesheet" href="style.css"&gt;
&lt;/head&gt;</code></pre>
              <p class="note">✅ 优点：复用性高，多个页面共享<br>✅ 推荐：项目开发首选方式</p>
            </div>
          </div>
          
          <div class="code-demo">
            <div class="code-editor">
              <div class="editor-header">
                <span class="editor-label">📝 试着修改三种样式</span>
              </div>
              <div class="editor-content">
                <textarea 
                  v-model="step1Code" 
                  class="code-input"
                  spellcheck="false"
                ></textarea>
              </div>
            </div>
            <div class="code-preview">
              <div class="preview-header">
                <span class="preview-label">👀 实时预览</span>
              </div>
              <div class="preview-content">
                <iframe :srcdoc="step1Code" :key="step1Key" class="preview-frame"></iframe>
              </div>
            </div>
          </div>
        </div>

        <button class="next-step-btn" @click="nextStep">下一步：学习 CSS 语法 →</button>
      </section>

      <!-- 步骤2：CSS 基础语法 -->
      <section v-show="currentStep === 2" class="step-section">
        <h2 class="section-title">📝 第二章：CSS 基础语法</h2>
      
        <!-- 2.1 选择器 -->
        <div class="knowledge-card">
          <h3 class="card-title">🎯 选择器</h3>
          <div class="text-content">
            <p>选择器用于选中要添加样式的 HTML 元素：</p>
            <ul>
              <li><code>元素选择器</code> - 选中所有同类型标签（如 <code>div</code>、<code>p</code>）</li>
              <li><code>.类选择器</code> - 选中指定 class 的元素（如 <code>.box</code>）</li>
              <li><code>#ID选择器</code> - 选中指定 id 的元素（如 <code>#header</code>）</li>
            </ul>
            <p><strong>优先级</strong>：ID选择器 &gt; 类选择器 &gt; 元素选择器</p>
          </div>
          
          <div class="code-demo">
            <div class="code-editor">
              <div class="editor-header">
                <span class="editor-label">📝 试着修改选择器</span>
              </div>
              <div class="editor-content">
                <textarea 
                  v-model="step2_1Code" 
                  class="code-input"
                  spellcheck="false"
                ></textarea>
              </div>
            </div>
            <div class="code-preview">
              <div class="preview-header">
                <span class="preview-label">👀 实时预览</span>
              </div>
              <div class="preview-content">
                <iframe :srcdoc="step2_1Preview" :key="step2_1Key" class="preview-frame"></iframe>
              </div>
            </div>
          </div>
        </div>

        <!-- 2.2 声明块 -->
        <div class="knowledge-card">
          <h3 class="card-title">📋 声明块</h3>
          <div class="text-content">
            <p>CSS 的基本格式：<code>选择器 { 属性: 值; }</code></p>
            <div class="syntax-box">
              <pre><code>p {
  color: red;        /* 文字颜色 */
  font-size: 16px;   /* 字号大小 */
}</code></pre>
              <p class="note">💡 每个属性后面要加分号 <code>;</code></p>
            </div>
          </div>
          
          <div class="code-demo">
            <div class="code-editor">
              <div class="editor-header">
                <span class="editor-label">📝 试着添加更多属性</span>
              </div>
              <div class="editor-content">
                <textarea 
                  v-model="step2_2Code" 
                  class="code-input"
                  spellcheck="false"
                ></textarea>
              </div>
            </div>
            <div class="code-preview">
              <div class="preview-header">
                <span class="preview-label">👀 实时预览</span>
              </div>
              <div class="preview-content">
                <iframe :srcdoc="step2_2Preview" :key="step2_2Key" class="preview-frame"></iframe>
              </div>
            </div>
          </div>
        </div>

        <!-- 2.3 文本样式 -->
        <div class="knowledge-card">
          <h3 class="card-title">✍️ 文本样式</h3>
          <div class="text-content">
            <p>常用的文本样式属性：</p>
            <ul>
              <li><code>color</code> - 文字颜色（如 <code>red</code>、<code>#ff0000</code>）</li>
              <li><code>font-size</code> - 字号大小（如 <code>16px</code>、<code>1.2em</code>）</li>
              <li><code>text-align</code> - 文本对齐（<code>left</code>、<code>center</code>、<code>right</code>）</li>
              <li><code>font-weight</code> - 字体粗细（<code>normal</code>、<code>bold</code>）</li>
            </ul>
          </div>
          
          <div class="code-demo">
            <div class="code-editor">
              <div class="editor-header">
                <span class="editor-label">📝 试着修改文本样式</span>
              </div>
              <div class="editor-content">
                <textarea 
                  v-model="step2_3Code" 
                  class="code-input"
                  spellcheck="false"
                ></textarea>
              </div>
            </div>
            <div class="code-preview">
              <div class="preview-header">
                <span class="preview-label">👀 实时预览</span>
              </div>
              <div class="preview-content">
                <iframe :srcdoc="step2_3Preview" :key="step2_3Key" class="preview-frame"></iframe>
              </div>
            </div>
          </div>
        </div>

        <!-- 2.4 盒子样式 -->
        <div class="knowledge-card">
          <h3 class="card-title">📦 盒子样式</h3>
          <div class="text-content">
            <p>控制元素的大小和外观：</p>
            <ul>
              <li><code>width / height</code> - 宽度和高度</li>
              <li><code>background</code> - 背景色或背景图（如 <code>#f0f0f0</code>）</li>
              <li><code>border</code> - 边框（如 <code>1px solid #ccc</code>）</li>
              <li><code>border-radius</code> - 圆角（如 <code>8px</code>）</li>
            </ul>
          </div>
          
          <div class="code-demo">
            <div class="code-editor">
              <div class="editor-header">
                <span class="editor-label">📝 试着修改盒子样式</span>
              </div>
              <div class="editor-content">
                <textarea 
                  v-model="step2_4Code" 
                  class="code-input"
                  spellcheck="false"
                ></textarea>
              </div>
            </div>
            <div class="code-preview">
              <div class="preview-header">
                <span class="preview-label">👀 实时预览</span>
              </div>
              <div class="preview-content">
                <iframe :srcdoc="step2_4Preview" :key="step2_4Key" class="preview-frame"></iframe>
              </div>
            </div>
          </div>
        </div>

        <!-- 2.5 边距样式 -->
        <div class="knowledge-card">
          <h3 class="card-title">📏 边距样式</h3>
          <div class="text-content">
            <p>控制元素之间的间距：</p>
            <ul>
              <li><code>margin</code> - 外边距（元素与元素之间的距离）</li>
              <li><code>padding</code> - 内边距（内容与边框之间的距离）</li>
            </ul>
            <p class="note">💡 可以分别设置四个方向：<code>margin: 上 右 下 左;</code></p>
          </div>
          
          <div class="code-demo">
            <div class="code-editor">
              <div class="editor-header">
                <span class="editor-label">📝 试着修改边距</span>
              </div>
              <div class="editor-content">
                <textarea 
                  v-model="step2_5Code" 
                  class="code-input"
                  spellcheck="false"
                ></textarea>
              </div>
            </div>
            <div class="code-preview">
              <div class="preview-header">
                <span class="preview-label">👀 实时预览</span>
              </div>
              <div class="preview-content">
                <iframe :srcdoc="step2_5Preview" :key="step2_5Key" class="preview-frame"></iframe>
              </div>
            </div>
          </div>
        </div>

        <div class="step-buttons">
          <button class="prev-step-btn" @click="prevStep">← 上一步</button>
          <button class="next-step-btn" @click="nextStep">下一步：简单布局 →</button>
        </div>
      </section>

      <!-- 步骤3：CSS 简单布局 -->
      <section v-show="currentStep === 3" class="step-section">
        <h2 class="section-title">🏗️ 第三章：CSS 简单布局</h2>
        
        <!-- 3.1 盒模型 -->
        <div class="knowledge-card">
          <h3 class="card-title">📦 盒模型</h3>
          <div class="text-content">
            <p>每个 HTML 元素都是一个「盒子」，由内到外包含：</p>
            <ul>
              <li>🎯 <strong>Content</strong>（内容）- 文字、图片等实际内容</li>
              <li>📏 <strong>Padding</strong>（内边距）- 内容与边框之间的空间</li>
              <li>🔲 <strong>Border</strong>（边框）- 盒子的边界线</li>
              <li>🌌 <strong>Margin</strong>（外边距）- 盒子与其他元素之间的空间</li>
            </ul>
            <p class="note">💡 盒子的总宽度 = width + padding + border + margin</p>
          </div>
          
          <div class="code-demo">
            <div class="code-editor">
              <div class="editor-header">
                <span class="editor-label">📝 观察盒模型各部分</span>
              </div>
              <div class="editor-content">
                <textarea 
                  v-model="step3_1Code" 
                  class="code-input"
                  spellcheck="false"
                ></textarea>
              </div>
            </div>
            <div class="code-preview">
              <div class="preview-header">
                <span class="preview-label">👀 实时预览</span>
              </div>
              <div class="preview-content">
                <iframe :srcdoc="step3_1Preview" :key="step3_1Key" class="preview-frame"></iframe>
              </div>
            </div>
          </div>
        </div>

        <!-- 3.2 显示模式 -->
        <div class="knowledge-card">
          <h3 class="card-title">🔄 显示模式</h3>
          <div class="text-content">
            <p>HTML 元素有两种主要显示模式：</p>
            
            <div class="syntax-box">
              <p><strong>块级元素（block）</strong></p>
              <ul>
                <li>独占一行</li>
                <li>可以设置宽高</li>
                <li>常见：<code>div</code>、<code>p</code>、<code>h1-h6</code></li>
              </ul>
            </div>

            <div class="syntax-box">
              <p><strong>行内元素（inline）</strong></p>
              <ul>
                <li>不换行，多个元素在同一行</li>
                <li>宽高由内容决定</li>
                <li>常见：<code>span</code>、<code>a</code>、<code>strong</code></li>
              </ul>
            </div>

            <p class="note">💡 可以用 <code>display</code> 属性改变显示模式</p>
          </div>
          
          <div class="code-demo">
            <div class="code-editor">
              <div class="editor-header">
                <span class="editor-label">📝 观察 block 和 inline 的区别</span>
              </div>
              <div class="editor-content">
                <textarea 
                  v-model="step3_2Code" 
                  class="code-input"
                  spellcheck="false"
                ></textarea>
              </div>
            </div>
            <div class="code-preview">
              <div class="preview-header">
                <span class="preview-label">👀 实时预览</span>
              </div>
              <div class="preview-content">
                <iframe :srcdoc="step3_2Preview" :key="step3_2Key" class="preview-frame"></iframe>
              </div>
            </div>
          </div>
        </div>

        <!-- 3.3 简单居中 -->
        <div class="knowledge-card">
          <h3 class="card-title">🎯 简单居中</h3>
          <div class="text-content">
            <p>常用的居中方法：</p>
            
            <div class="syntax-box success">
              <p><strong>文本居中</strong></p>
              <code>text-align: center;</code>
              <p class="note">✅ 适用于文本和行内元素</p>
            </div>

            <div class="syntax-box success">
              <p><strong>块级元素水平居中</strong></p>
              <code>margin: 0 auto;</code>
              <p class="note">✅ 需要设置宽度才有效</p>
            </div>
          </div>
          
          <div class="code-demo">
            <div class="code-editor">
              <div class="editor-header">
                <span class="editor-label">📝 试着让元素居中</span>
              </div>
              <div class="editor-content">
                <textarea 
                  v-model="step3_3Code" 
                  class="code-input"
                  spellcheck="false"
                ></textarea>
              </div>
            </div>
            <div class="code-preview">
              <div class="preview-header">
                <span class="preview-label">👀 实时预览</span>
              </div>
              <div class="preview-content">
                <iframe :srcdoc="step3_3Preview" :key="step3_3Key" class="preview-frame"></iframe>
              </div>
            </div>
          </div>
        </div>

        <div class="step-buttons">
          <button class="prev-step-btn" @click="prevStep">← 上一步</button>
          <button class="complete-btn" @click="completeCourse">🎉 完成课程</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 步骤管理
const currentStep = ref(1)
const totalSteps = 3
const steps = [
  { name: '初识 CSS' },
  { name: 'CSS 语法' },
  { name: '简单布局' }
]

// 步骤1：初识 CSS
const step1Code = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CSS 引入方式</title>
  <!-- 2. 内部样式 -->
  <style>
    .internal { color: blue; }
  </style>
</head>
<body>
  <!-- 1. 行内样式 -->
  <p style="color: red;">这是行内样式（红色）</p>
  
  <!-- 2. 内部样式 -->
  <p class="internal">这是内部样式（蓝色）</p>
  
  <!-- 3. 外部样式（实际项目中使用） -->
  <p>外部样式需要单独的 .css 文件</p>
</body>
</html>`)

const step1Key = ref(0)
watch(step1Code, () => step1Key.value++)

// 步骤2.1：选择器
const step2_1Code = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CSS 选择器</title>
  <style>
    /* 元素选择器 - 选中所有 p 标签 */
    p { color: gray; }
    
    /* 类选择器 - 选中 class="highlight" 的元素 */
    .highlight { color: orange; font-weight: bold; }
    
    /* ID选择器 - 选中 id="title" 的元素 */
    #title { color: blue; font-size: 24px; }
  </style>
</head>
<body>
  <h1 id="title">这是标题（ID选择器）</h1>
  <p>这是普通段落（元素选择器）</p>
  <p class="highlight">这是高亮段落（类选择器）</p>
</body>
</html>`)

const step2_1Preview = computed(() => step2_1Code.value)
const step2_1Key = ref(0)
watch(step2_1Code, () => step2_1Key.value++)

// 步骤2.2：声明块
const step2_2Code = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CSS 声明块</title>
  <style>
    .box {
      color: white;
      background: #3498db;
      padding: 20px;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div class="box">
    这是一个带样式的盒子
  </div>
</body>
</html>`)

const step2_2Preview = computed(() => step2_2Code.value)
const step2_2Key = ref(0)
watch(step2_2Code, () => step2_2Key.value++)

// 步骤2.3：文本样式
const step2_3Code = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>文本样式</title>
  <style>
    .text1 { 
      color: #e74c3c; 
      font-size: 20px; 
    }
    .text2 { 
      color: #2ecc71; 
      font-size: 16px; 
      text-align: center; 
    }
    .text3 { 
      color: #3498db; 
      font-weight: bold; 
      text-align: right; 
    }
  </style>
</head>
<body>
  <p class="text1">红色大字</p>
  <p class="text2">绿色居中</p>
  <p class="text3">蓝色加粗右对齐</p>
</body>
</html>`)

const step2_3Preview = computed(() => step2_3Code.value)
const step2_3Key = ref(0)
watch(step2_3Code, () => step2_3Key.value++)

// 步骤2.4：盒子样式
const step2_4Code = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>盒子样式</title>
  <style>
    .box1 {
      width: 200px;
      height: 100px;
      background: #e3f2fd;
      border: 2px solid #2196f3;
      border-radius: 8px;
      margin-bottom: 10px;
    }
    .box2 {
      width: 150px;
      height: 150px;
      background: #fff3e0;
      border: 3px dashed #ff9800;
      border-radius: 50%;
    }
  </style>
</head>
<body>
  <div class="box1">矩形盒子</div>
  <div class="box2">圆形盒子</div>
</body>
</html>`)

const step2_4Preview = computed(() => step2_4Code.value)
const step2_4Key = ref(0)
watch(step2_4Code, () => step2_4Key.value++)

// 步骤2.5：边距样式
const step2_5Code = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>边距样式</title>
  <style>
    .container {
      background: #f5f5f5;
      padding: 20px;
    }
    .box {
      background: #4caf50;
      color: white;
      padding: 15px;
      margin: 10px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="box">盒子1（有内边距和外边距）</div>
    <div class="box">盒子2（有内边距和外边距）</div>
  </div>
</body>
</html>`)

const step2_5Preview = computed(() => step2_5Code.value)
const step2_5Key = ref(0)
watch(step2_5Code, () => step2_5Key.value++)

// 步骤3.1：盒模型
const step3_1Code = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>盒模型</title>
  <style>
    .box {
      width: 200px;              /* 内容宽度 */
      height: 100px;             /* 内容高度 */
      padding: 20px;             /* 内边距 */
      border: 5px solid #3498db; /* 边框 */
      margin: 30px;              /* 外边距 */
      background: #ecf0f1;
    }
    body { background: #fff; }
  </style>
</head>
<body>
  <div class="box">
    内容区域<br>
    (200x100)
  </div>
  <p style="margin-left: 30px; color: #666;">
    总宽度 = 200 + 20×2 + 5×2 + 30×2 = 310px
  </p>
</body>
</html>`)

const step3_1Preview = computed(() => step3_1Code.value)
const step3_1Key = ref(0)
watch(step3_1Code, () => step3_1Key.value++)

// 步骤3.2：显示模式
const step3_2Code = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>显示模式</title>
  <style>
    .block {
      display: block;
      width: 200px;
      background: #e3f2fd;
      padding: 10px;
      margin: 5px 0;
    }
    .inline {
      display: inline;
      background: #fff3e0;
      padding: 5px;
    }
  </style>
</head>
<body>
  <div class="block">块级元素1（独占一行）</div>
  <div class="block">块级元素2（独占一行）</div>
  
  <span class="inline">行内元素1</span>
  <span class="inline">行内元素2</span>
  <span class="inline">行内元素3</span>
</body>
</html>`)

const step3_2Preview = computed(() => step3_2Code.value)
const step3_2Key = ref(0)
watch(step3_2Code, () => step3_2Key.value++)

// 步骤3.3：简单居中
const step3_3Code = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>简单居中</title>
  <style>
    .text-center {
      text-align: center;
      background: #e8f5e9;
      padding: 20px;
    }
    .box-center {
      width: 300px;
      margin: 20px auto;
      background: #e3f2fd;
      padding: 20px;
      text-align: center;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div class="text-center">
    文本居中（text-align: center）
  </div>
  
  <div class="box-center">
    盒子水平居中（margin: 0 auto）
  </div>
</body>
</html>`)

const step3_3Preview = computed(() => step3_3Code.value)
const step3_3Key = ref(0)
watch(step3_3Code, () => step3_3Key.value++)

// 导航函数
const scrollToTop = () => {
  const cssBasics = document.querySelector('.css-basics')
  if (cssBasics) {
    cssBasics.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const goToStep = (step: number) => {
  currentStep.value = step
  setTimeout(scrollToTop, 50)
}

const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++
    setTimeout(scrollToTop, 50)
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    setTimeout(scrollToTop, 50)
  }
}

const goBack = () => {
  router.push('/learn/basics')
}

const completeCourse = () => {
  alert('🎉 恭喜完成 CSS 核心基础课程！\n\n接下来可以学习 JavaScript 课程，让网页动起来！')
  router.push('/learn/js-basics')
}
</script>

<style scoped>
.css-basics {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
  padding: 20px;
}

/* 顶部导航 */
.course-header {
  max-width: 1000px;
  margin: 0 auto 30px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
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
  margin-bottom: 15px;
}

.back-btn:hover {
  background: #e0e0e0;
  color: #333;
}

.course-title {
  font-size: 28px;
  font-weight: 700;
  color: #2196f3;
  margin: 0 0 15px;
  text-align: center;
}

.progress-info {
  text-align: center;
}

.progress-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  display: block;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2196f3 0%, #1976d2 100%);
  transition: width 0.3s ease;
}

/* 步骤导航 */
.step-nav {
  max-width: 1000px;
  margin: 0 auto 30px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.step-item {
  flex: 1;
  max-width: 200px;
  padding: 12px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.step-item:hover {
  border-color: #2196f3;
}

.step-item.active {
  border-color: #2196f3;
  background: #e3f2fd;
}

.step-item.completed {
  border-color: #4caf50;
  background: #e8f5e9;
}

.step-number {
  width: 32px;
  height: 32px;
  margin: 0 auto 8px;
  background: #f0f0f0;
  color: #666;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.step-item.active .step-number {
  background: #2196f3;
  color: white;
}

.step-item.completed .step-number {
  background: #4caf50;
  color: white;
}

.step-name {
  font-size: 13px;
  color: #666;
  font-weight: 600;
}

/* 课程内容 */
.course-content {
  max-width: 1000px;
  margin: 0 auto;
}

.step-section {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 24px;
  text-align: center;
}

/* 知识卡片 */
.knowledge-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #2196f3;
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
  background: #e3f2fd;
  color: #2196f3;
  border-radius: 3px;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
}

.syntax-box {
  background: #f8f9fa;
  border-left: 4px solid #2196f3;
  padding: 16px;
  margin: 16px 0;
  border-radius: 4px;
}

.syntax-box.error {
  border-left-color: #f44336;
  background: #ffebee;
}

.syntax-box.success {
  border-left-color: #4caf50;
  background: #e8f5e9;
}

.syntax-box p {
  margin: 0 0 8px;
}

.syntax-box code {
  display: block;
  padding: 12px;
  background: #2d3748;
  color: #e2e8f0;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
}

.syntax-box pre {
  margin: 8px 0;
}

.syntax-box pre code {
  display: block;
}

.syntax-box ul {
  margin: 8px 0;
  padding-left: 20px;
}

.note {
  font-size: 13px;
  color: #666;
  font-style: italic;
  margin-top: 8px;
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
  min-height: 250px;
}

.code-input {
  width: 100%;
  height: 100%;
  min-height: 250px;
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

.code-input:focus {
  outline: none;
}

.preview-frame {
  width: 100%;
  height: 100%;
  min-height: 250px;
  border: none;
  border-radius: 0 0 8px 8px;
  background: white;
}

/* 按钮 */
.next-step-btn, .prev-step-btn, .complete-btn {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.next-step-btn, .complete-btn {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
  display: block;
  margin: 32px auto 0;
}

.next-step-btn:hover, .complete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.step-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
}

.prev-step-btn {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
}

.prev-step-btn:hover {
  background: #e0e0e0;
  color: #333;
}

/* 响应式 */
@media (max-width: 768px) {
  .step-nav {
    flex-direction: column;
  }
  
  .step-item {
    max-width: 100%;
  }
  
  .code-demo {
    grid-template-columns: 1fr;
  }
  
  .course-title {
    font-size: 22px;
  }
  
  .section-title {
    font-size: 20px;
  }
  
  .step-buttons {
    flex-direction: column;
    gap: 12px;
  }
  
  .prev-step-btn, .next-step-btn {
    width: 100%;
  }
}
</style>
