<template>
  <div class="html-basics">
    <!-- 顶部导航 -->
    <div class="course-header">
      <button class="back-btn" @click="goBack">← 返回课程列表</button>
      <h1 class="course-title">📄 HTML 核心基础</h1>
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
      <!-- 步骤1：初识 HTML -->
      <section v-show="currentStep === 1" class="step-section">
        <h2 class="section-title">📚 第一章：初识 HTML</h2>
        
        <!-- 1.1 什么是 HTML -->
        <div class="knowledge-card">
          <h3 class="card-title">💡 什么是 HTML？</h3>
          <div class="text-content">
            <p><strong>HTML</strong>（HyperText Markup Language，超文本标记语言）是网页的「骨架」。</p>
            <p>就像盖房子需要先搭建框架一样，HTML 负责搭建网页的基本结构：</p>
            <ul>
              <li>🏗️ <strong>核心作用</strong>：定义网页的结构和内容</li>
              <li>📦 <strong>通俗理解</strong>：HTML 就像乐高积木，用不同的「标签」组装出网页</li>
              <li>🎯 <strong>与 CSS/JS 的关系</strong>：HTML 是骨架，CSS 是装修，JavaScript 是大脑</li>
            </ul>
          </div>
        </div>

        <!-- 1.2 HTML 基本语法 -->
        <div class="knowledge-card">
          <h3 class="card-title">🔤 HTML 基本语法</h3>
          <div class="text-content">
            <p><strong>标签的概念</strong>：HTML 用「标签」来标记不同类型的内容</p>
            <div class="syntax-box">
              <p><strong>成对标签</strong>（有开始和结束）：</p>
              <code>&lt;p&gt;这是一段文字&lt;/p&gt;</code>
              <p class="note">💡 大部分标签都是成对的，内容放在开始和结束标签之间</p>
            </div>
            <div class="syntax-box">
              <p><strong>单标签</strong>（自闭合）：</p>
              <code>&lt;br&gt;</code> 或 <code>&lt;img src="图片.jpg"&gt;</code>
              <p class="note">💡 有些标签不需要包含内容，直接使用即可</p>
            </div>
            <div class="syntax-box">
              <p><strong>标签嵌套规则</strong>：</p>
              <pre><code>&lt;div&gt;
  &lt;p&gt;段落文字&lt;/p&gt;
&lt;/div&gt;</code></pre>
              <p class="note">💡 标签可以嵌套，但必须正确闭合（先开后关）</p>
            </div>
          </div>
        </div>

        <!-- 1.3 第一个 HTML 页面 -->
        <div class="knowledge-card">
          <h3 class="card-title">🎨 第一个 HTML 页面</h3>
          <div class="text-content">
            <p>一个完整的 HTML 页面包含以下基本结构：</p>
            <ul>
              <li><code>&lt;!DOCTYPE html&gt;</code> - 声明文档类型</li>
              <li><code>&lt;html&gt;</code> - 根标签，包含整个页面</li>
              <li><code>&lt;head&gt;</code> - 头部，包含页面配置信息</li>
              <li><code>&lt;title&gt;</code> - 网页标题（显示在浏览器标签上）</li>
              <li><code>&lt;meta charset="UTF-8"&gt;</code> - 字符编码（支持中文）</li>
              <li><code>&lt;body&gt;</code> - 主体，包含页面可见内容</li>
            </ul>
          </div>
          
          <div class="code-demo">
            <div class="code-editor">
              <div class="editor-header">
                <span class="editor-label">📝 试着修改标题和内容</span>
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

        <div class="step-buttons">
          <button class="next-step-btn" @click="nextStep">下一步：学习常用标签 →</button>
        </div>
      </section>

      <!-- 步骤2：常用 HTML 标签 -->
      <section v-show="currentStep === 2" class="step-section">
        <h2 class="section-title">🏷️ 第二章：常用 HTML 标签</h2>
      
        <!-- 2.1 文本类标签 -->
        <div class="knowledge-card">
          <h3 class="card-title">📝 文本类标签</h3>
          <div class="text-content">
            <p>用于展示和格式化文本内容：</p>
            <ul>
              <li><code>&lt;h1&gt; ~ &lt;h6&gt;</code> - 标题（h1 最大，h6 最小）</li>
              <li><code>&lt;p&gt;</code> - 段落</li>
              <li><code>&lt;br&gt;</code> - 换行</li>
              <li><code>&lt;strong&gt;</code> - 加粗（强调）</li>
              <li><code>&lt;em&gt;</code> - 斜体（强调）</li>
            </ul>
          </div>
          
          <div class="code-demo">
            <div class="code-editor">
              <div class="editor-header">
                <span class="editor-label">📝 试着修改文本内容</span>
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

        <!-- 2.2 列表类标签 -->
        <div class="knowledge-card">
          <h3 class="card-title">📋 列表类标签</h3>
          <div class="text-content">
            <p>用于展示有序或无序的列表：</p>
            <ul>
              <li><code>&lt;ul&gt;</code> + <code>&lt;li&gt;</code> - 无序列表（带圆点）</li>
              <li><code>&lt;ol&gt;</code> + <code>&lt;li&gt;</code> - 有序列表（带数字）</li>
            </ul>
          </div>
          
          <div class="code-demo">
            <div class="code-editor">
              <div class="editor-header">
                <span class="editor-label">📝 试着添加更多列表项</span>
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

        <!-- 2.3 链接与图片 -->
        <div class="knowledge-card">
          <h3 class="card-title">🔗 链接与图片</h3>
          <div class="text-content">
            <p><strong>&lt;a&gt; 标签</strong>（超链接）：</p>
            <ul>
              <li><code>href</code> 属性：链接地址</li>
              <li><code>target="_blank"</code>：在新标签页打开</li>
            </ul>
            <p><strong>&lt;img&gt; 标签</strong>（图片）：</p>
            <ul>
              <li><code>src</code> 属性：图片地址</li>
              <li><code>alt</code> 属性：图片描述（无法显示时的替代文字）</li>
              <li><code>width/height</code> 属性：宽度和高度</li>
            </ul>
          </div>
          
          <div class="code-demo">
            <div class="code-editor">
              <div class="editor-header">
                <span class="editor-label">📝 试着修改链接和图片</span>
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

        <!-- 2.4 容器类标签 -->
        <div class="knowledge-card">
          <h3 class="card-title">📦 容器类标签</h3>
          <div class="text-content">
            <p>用于组织和布局页面内容：</p>
            <ul>
              <li><code>&lt;div&gt;</code> - 块级容器（独占一行，可设置宽高）</li>
              <li><code>&lt;span&gt;</code> - 行内容器（不换行，宽高由内容决定）</li>
            </ul>
            <p class="note">💡 div 和 span 本身没有样式，主要用于配合 CSS 进行布局</p>
          </div>
          
          <div class="code-demo">
            <div class="code-editor">
              <div class="editor-header">
                <span class="editor-label">📝 观察 div 和 span 的区别</span>
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

        <!-- 2.5 表单基础 -->
        <div class="knowledge-card">
          <h3 class="card-title">📮 表单基础</h3>
          <div class="text-content">
            <p>用于收集用户输入：</p>
            <ul>
              <li><code>&lt;input type="text"&gt;</code> - 文本输入框</li>
              <li><code>&lt;input type="password"&gt;</code> - 密码输入框</li>
              <li><code>&lt;input type="button"&gt;</code> - 按钮</li>
              <li><code>&lt;button&gt;</code> - 按钮（推荐使用）</li>
            </ul>
          </div>
          
          <div class="code-demo">
            <div class="code-editor">
              <div class="editor-header">
                <span class="editor-label">📝 试着修改表单元素</span>
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
          <button class="next-step-btn" @click="nextStep">下一步：页面结构规范 →</button>
        </div>
      </section>

      <!-- 步骤3：HTML 页面结构规范 -->
      <section v-show="currentStep === 3" class="step-section">
        <h2 class="section-title">🏛️ 第三章：HTML 页面结构规范</h2>
        
        <!-- 3.1 语义化标签 -->
        <div class="knowledge-card">
          <h3 class="card-title">🎯 语义化标签</h3>
          <div class="text-content">
            <p>HTML5 提供了语义化标签，让页面结构更清晰、更易理解：</p>
            <ul>
              <li><code>&lt;header&gt;</code> - 页头（通常包含 logo、导航等）</li>
              <li><code>&lt;nav&gt;</code> - 导航栏</li>
              <li><code>&lt;main&gt;</code> - 主体内容</li>
              <li><code>&lt;footer&gt;</code> - 页脚（通常包含版权信息、联系方式等）</li>
            </ul>
            <p class="note">💡 <strong>为什么要用语义化标签？</strong></p>
            <ul>
              <li>✅ 代码更易读懂（一眼就知道是什么内容）</li>
              <li>✅ 有利于 SEO（搜索引擎更容易理解页面结构）</li>
              <li>✅ 方便屏幕阅读器等辅助工具</li>
            </ul>
          </div>
          
          <div class="code-demo">
            <div class="code-editor">
              <div class="editor-header">
                <span class="editor-label">📝 试着修改语义化标签的内容</span>
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

        <!-- 3.2 标签嵌套规范 -->
        <div class="knowledge-card">
          <h3 class="card-title">⚠️ 标签嵌套规范</h3>
          <div class="text-content">
            <p>正确的标签嵌套非常重要，错误的嵌套会导致页面显示异常：</p>
            
            <div class="syntax-box error">
              <p><strong>❌ 错误示例</strong>：p 标签不能嵌套 div</p>
              <pre><code>&lt;p&gt;
  &lt;div&gt;这是错误的&lt;/div&gt;
&lt;/p&gt;</code></pre>
              <p class="note">⚠️ p 是行内元素，不能包含块级元素 div</p>
            </div>

            <div class="syntax-box success">
              <p><strong>✅ 正确示例</strong>：div 可以嵌套 p</p>
              <pre><code>&lt;div&gt;
  &lt;p&gt;这是正确的&lt;/p&gt;
&lt;/div&gt;</code></pre>
              <p class="note">✅ div 是块级元素，可以包含其他块级或行内元素</p>
            </div>

            <p><strong>常见嵌套规则</strong>：</p>
            <ul>
              <li>✅ 块级元素可以包含行内元素和其他块级元素</li>
              <li>✅ 行内元素只能包含行内元素</li>
              <li>❌ p 标签不能嵌套 div、h1-h6 等块级元素</li>
              <li>❌ a 标签不能嵌套 a 标签</li>
            </ul>
          </div>
          
          <div class="code-demo">
            <div class="code-editor">
              <div class="editor-header">
                <span class="editor-label">📝 试着修改嵌套结构（注意规范）</span>
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

        <div class="step-buttons">
          <button class="prev-step-btn" @click="prevStep">← 上一步</button>
          <button class="quiz-btn" @click="showQuiz = true">📝 小测试</button>
          <button 
            class="complete-btn" 
            :disabled="!quizPassed"
            :class="{ 'completed': courseCompleted }"
            :title="courseCompleted ? '该课程已完成' : (quizPassed ? '' : '请先完成小测试并达到60分以上')"
            @click="!courseCompleted && completeCourse()"
          >
            {{ courseCompleted ? '✅ 已完成该课程' : '🎉 完成课程' }}
          </button>
        </div>
      </section>
    </div>
  </div>

  <QuizModal 
    v-model:visible="showQuiz"
    :quiz-data="quizData"
    @completed="handleQuizCompleted"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import QuizModal from '@/pages/misc/QuizModal.vue'
import quizData from '@/data/questions/basics/html-basics-quiz.json'

const router = useRouter()

const showQuiz = ref(false)
const quizPassed = ref(false)
const courseCompleted = ref(false)

const handleQuizCompleted = (result: { score: number; passed: boolean; answers: Array<number | number[]> }) => {
  console.log('测试完成:', result)
  quizPassed.value = result.passed
  
  if (result.passed) {
    alert(`🎉 恭喜！你的成绩是 ${result.score} 分，测试通过！\n\n现在可以点击“完成课程”按钮了！`)
  } else {
    alert(`继续加油！你的成绩是 ${result.score} 分，再试一次吧！`)
  }
}

// 页面加载时检查测验通过状态（本地保存）
const checkCourseStatus = () => {
  const saved = localStorage.getItem('html-basics-passed')
  if (saved === 'true') {
    quizPassed.value = true
    courseCompleted.value = true
  }
}
checkCourseStatus()

// 步骤管理
const currentStep = ref(1)
const totalSteps = 3
const steps = [
  { name: '初识 HTML' },
  { name: '常用标签' },
  { name: '结构规范' }
]

// 步骤1：初识 HTML
const step1Code = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>我的第一个网页</title>
</head>
<body>
  <h1>欢迎来到我的网页！</h1>
  <p>这是我用 HTML 创建的第一个页面。</p>
</body>
</html>`)

const step1Key = ref(0)
watch(step1Code, () => step1Key.value++)

// 步骤2.1：文本类标签
const step2_1Code = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>文本标签示例</title>
</head>
<body>
  <h1>一级标题</h1>
  <h2>二级标题</h2>
  <h3>三级标题</h3>
  
  <p>这是一个段落。</p>
  <p>这是另一个段落。<br>这里换行了。</p>
  
  <p>这是<strong>加粗文字</strong>和<em>斜体文字</em>。</p>
</body>
</html>`)

const step2_1Preview = computed(() => step2_1Code.value)
const step2_1Key = ref(0)
watch(step2_1Code, () => step2_1Key.value++)

// 步骤2.2：列表类标签
const step2_2Code = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>列表标签示例</title>
</head>
<body>
  <h3>无序列表（购物清单）：</h3>
  <ul>
    <li>苹果</li>
    <li>香蕉</li>
    <li>橙子</li>
  </ul>
  
  <h3>有序列表（学习步骤）：</h3>
  <ol>
    <li>学习 HTML</li>
    <li>学习 CSS</li>
    <li>学习 JavaScript</li>
  </ol>
</body>
</html>`)

const step2_2Preview = computed(() => step2_2Code.value)
const step2_2Key = ref(0)
watch(step2_2Code, () => step2_2Key.value++)

// 步骤2.3：链接与图片
const step2_3Code = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>链接和图片示例</title>
</head>
<body>
  <h3>超链接：</h3>
  <a href="https://vuejs.org" target="_blank">访问 Vue.js 官网</a>
  
  <h3>图片：</h3>
  <img src="https://vuejs.org/images/logo.png" alt="Vue Logo" width="100">
</body>
</html>`)

const step2_3Preview = computed(() => step2_3Code.value)
const step2_3Key = ref(0)
watch(step2_3Code, () => step2_3Key.value++)

// 步骤2.4：容器类标签
const step2_4Code = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>容器标签示例</title>
  <style>
    div { background: #e3f2fd; padding: 10px; margin: 5px 0; }
    span { background: #fff3e0; padding: 5px; }
  </style>
</head>
<body>
  <div>这是一个 div（块级容器，独占一行）</div>
  <div>这是另一个 div</div>
  
  <p>
    这是段落中的 <span>span 1</span> 和 <span>span 2</span>（行内容器，不换行）
  </p>
</body>
</html>`)

const step2_4Preview = computed(() => step2_4Code.value)
const step2_4Key = ref(0)
watch(step2_4Code, () => step2_4Key.value++)

// 步骤2.5：表单基础
const step2_5Code = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>表单示例</title>
</head>
<body>
  <h3>登录表单：</h3>
  <p>
    用户名：<input type="text" placeholder="请输入用户名">
  </p>
  <p>
    密码：<input type="password" placeholder="请输入密码">
  </p>
  <p>
    <button>登录</button>
  </p>
</body>
</html>`)

const step2_5Preview = computed(() => step2_5Code.value)
const step2_5Key = ref(0)
watch(step2_5Code, () => step2_5Key.value++)

// 步骤3.1：语义化标签
const step3_1Code = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>语义化标签示例</title>
  <style>
    header { background: #e3f2fd; padding: 20px; }
    nav { background: #fff3e0; padding: 10px; }
    main { background: #f1f8e9; padding: 20px; min-height: 200px; }
    footer { background: #fce4ec; padding: 10px; text-align: center; }
  </style>
</head>
<body>
  <header>
    <h1>我的网站</h1>
  </header>
  
  <nav>
    <a href="#home">首页</a> | 
    <a href="#about">关于</a> | 
    <a href="#contact">联系</a>
  </nav>
  
  <main>
    <h2>主要内容</h2>
    <p>这里是页面的主体内容区域。</p>
  </main>
  
  <footer>
    <p>© 2024 我的网站. 保留所有权利。</p>
  </footer>
</body>
</html>`)

const step3_1Preview = computed(() => step3_1Code.value)
const step3_1Key = ref(0)
watch(step3_1Code, () => step3_1Key.value++)

// 步骤3.2：标签嵌套规范
const step3_2Code = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>嵌套规范示例</title>
  <style>
    .correct { background: #c8e6c9; padding: 10px; margin: 10px 0; }
    .wrong { background: #ffcdd2; padding: 10px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="correct">
    <h3>✅ 正确的嵌套</h3>
    <div>
      <p>div 可以包含 p 标签</p>
      <p>这是<strong>正确</strong>的嵌套方式</p>
    </div>
  </div>
  
  <div class="correct">
    <h3>✅ 正确的嵌套</h3>
    <p>
      段落中可以包含 <span>span</span> 和 <strong>strong</strong> 等行内元素
    </p>
  </div>
</body>
</html>`)

const step3_2Preview = computed(() => step3_2Code.value)
const step3_2Key = ref(0)
watch(step3_2Code, () => step3_2Key.value++)

// 导航函数
const scrollToTop = () => {
  const htmlBasics = document.querySelector('.html-basics')
  if (htmlBasics) {
    htmlBasics.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
  localStorage.setItem('html-basics-passed', 'true')
  courseCompleted.value = true
  alert('🎉 恭喜完成 HTML 核心基础课程！\n\n接下来可以学习 CSS 课程，让网页变得更漂亮！')
  router.push('/learn/css-basics')
}
</script>

<style scoped>
.html-basics {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff8f0 0%, #fff0e6 100%);
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
  color: #e65100;
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
  background: linear-gradient(90deg, #e65100 0%, #ff6f00 100%);
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
  border-color: #e65100;
}

.step-item.active {
  border-color: #e65100;
  background: #fff3e0;
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
  background: #e65100;
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
  color: #e65100;
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
  color: #e65100;
  border-radius: 3px;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
}

.syntax-box {
  background: #f8f9fa;
  border-left: 4px solid #e65100;
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
.step-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
}

.next-step-btn, .prev-step-btn, .quiz-btn, .complete-btn {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.next-step-btn, .complete-btn {
  background: linear-gradient(135deg, #e65100 0%, #ff6f00 100%);
  color: white;
}

.next-step-btn:hover, .complete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(230, 81, 0, 0.3);
}

.quiz-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
}

.quiz-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.complete-btn:disabled {
  background: #e0e0e0;
  color: #999;
  cursor: not-allowed;
  opacity: 0.6;
}

.complete-btn:disabled:hover {
  transform: none;
  box-shadow: none;
}

.complete-btn.completed {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  cursor: default;
}

.complete-btn.completed:hover {
  transform: none;
  box-shadow: none;
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
