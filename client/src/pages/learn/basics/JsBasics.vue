<template>
  <div class="js-basics">
    <!-- 顶部导航 -->
    <div class="course-header">
      <button class="back-btn" @click="goBack">← 返回课程列表</button>
      <h1 class="course-title">⚡ JavaScript 核心基础</h1>
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
      <!-- 步骤1：初识 JavaScript -->
      <section v-show="currentStep === 1" class="step-section">
        <h2 class="section-title">⚡ 第一章：初识 JavaScript</h2>
        
        <!-- 1.1 什么是 JavaScript -->
        <div class="knowledge-card">
          <h3 class="card-title">💡 什么是 JavaScript？</h3>
          <div class="text-content">
            <p><strong>JavaScript</strong>（简称 JS）是网页的「行为」和「大脑」。</p>
            <p>如果说 HTML 是骨架，CSS 是皮肤，那么 JavaScript 就是让网页动起来的灵魂：</p>
            <ul>
              <li>⚡ <strong>核心作用</strong>：实现交互、动态效果</li>
              <li>🧠 <strong>通俗理解</strong>：JS 让网页能够"思考"和"反应"</li>
              <li>🎯 <strong>与 HTML/CSS 的关系</strong>：HTML 定义结构，CSS 定义样式，JS 定义行为</li>
            </ul>
          </div>
        </div>

        <!-- 1.2 JavaScript 引入方式 -->
        <div class="knowledge-card">
          <h3 class="card-title">📥 JavaScript 引入方式</h3>
          <div class="text-content">
            <p>JavaScript 有三种引入方式：</p>
            
            <div class="syntax-box">
              <p><strong>1. 行内脚本</strong>（事件属性）</p>
              <code>&lt;button onclick="alert('你好！')"&gt;点我&lt;/button&gt;</code>
              <p class="note">✅ 优点：简单直接<br>❌ 缺点：不推荐，代码混乱</p>
            </div>

            <div class="syntax-box">
              <p><strong>2. 内部脚本</strong>（&lt;script&gt; 标签）</p>
              <pre><code>&lt;script&gt;
  console.log('Hello World');
&lt;/script&gt;</code></pre>
              <p class="note">✅ 优点：单页面脚本管理方便<br>❌ 缺点：只能在当前页面使用</p>
            </div>

            <div class="syntax-box success">
              <p><strong>3. 外部脚本</strong>（&lt;script src&gt;）⭐ 推荐</p>
              <pre><code>&lt;script src="script.js"&gt;&lt;/script&gt;</code></pre>
              <p class="note">✅ 优点：复用性高，多个页面共享<br>✅ 推荐：项目开发首选方式</p>
            </div>
          </div>
          
          <div class="code-demo">
            <div class="code-editor">
              <div class="editor-header">
                <span class="editor-label">📝 试着点击按钮</span>
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

        <button class="next-step-btn" @click="nextStep">下一步：学习 JS 语法 →</button>
      </section>

      <!-- 步骤2：JavaScript 基础语法 -->
      <section v-show="currentStep === 2" class="step-section">
        <h2 class="section-title">📝 第二章：JavaScript 基础语法</h2>
      
        <!-- 2.1 变量与常量 -->
        <div class="knowledge-card">
          <h3 class="card-title">📦 变量与常量</h3>
          <div class="text-content">
            <p>变量用于存储数据，就像给数据贴上标签：</p>
            <ul>
              <li><code>let</code> - 声明可变的变量（推荐使用）⭐</li>
              <li><code>const</code> - 声明常量（值不可改变）⭐</li>
              <li><code>var</code> - 旧的变量声明方式（不推荐）</li>
            </ul>
            <div class="syntax-box">
              <pre><code>let name = '小明';     // 可以修改
const age = 18;        // 不能修改
name = '小红';         // ✅ 可以
// age = 20;           // ❌ 报错</code></pre>
            </div>
          </div>
          
          <div class="code-demo">
            <div class="code-editor">
              <div class="editor-header">
                <span class="editor-label">📝 试着修改变量</span>
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

        <!-- 2.2 数据类型 -->
        <div class="knowledge-card">
          <h3 class="card-title">🏷️ 数据类型</h3>
          <div class="text-content">
            <p>JavaScript 中常见的数据类型：</p>
            <ul>
              <li><code>字符串（String）</code> - 文本数据，用引号包裹（如 <code>'你好'</code>）</li>
              <li><code>数字（Number）</code> - 数值（如 <code>123</code>、<code>3.14</code>）</li>
              <li><code>布尔（Boolean）</code> - 真或假（<code>true</code> / <code>false</code>）</li>
              <li><code>undefined</code> - 未定义（变量声明但未赋值）</li>
            </ul>
          </div>
          
          <div class="code-demo">
            <div class="code-editor">
              <div class="editor-header">
                <span class="editor-label">📝 观察不同数据类型</span>
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

        <!-- 2.3 运算符 -->
        <div class="knowledge-card">
          <h3 class="card-title">➕ 运算符</h3>
          <div class="text-content">
            <p>用于对数据进行计算和操作：</p>
            <p><strong>算术运算符</strong>：</p>
            <ul>
              <li><code>+</code> - 加法（也可用于字符串拼接）</li>
              <li><code>-</code> - 减法</li>
              <li><code>*</code> - 乘法</li>
              <li><code>/</code> - 除法</li>
            </ul>
            <p><strong>赋值运算符</strong>：</p>
            <ul>
              <li><code>=</code> - 赋值（把右边的值赋给左边的变量）</li>
            </ul>
          </div>
          
          <div class="code-demo">
            <div class="code-editor">
              <div class="editor-header">
                <span class="editor-label">📝 试着修改运算</span>
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

        <!-- 2.4 简单输出 -->
        <div class="knowledge-card">
          <h3 class="card-title">📢 简单输出</h3>
          <div class="text-content">
            <p>JavaScript 有多种输出方式：</p>
            <ul>
              <li><code>console.log()</code> - 在控制台打印（开发者工具中查看）⭐</li>
              <li><code>alert()</code> - 弹出提示框</li>
              <li><code>document.write()</code> - 在页面中输出</li>
            </ul>
            <p class="note">💡 按 F12 打开浏览器开发者工具，查看 Console 面板</p>
          </div>
          
          <div class="code-demo">
            <div class="code-editor">
              <div class="editor-header">
                <span class="editor-label">📝 试着修改输出内容</span>
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

        <div class="step-buttons">
          <button class="prev-step-btn" @click="prevStep">← 上一步</button>
          <button class="next-step-btn" @click="nextStep">下一步：简单交互 →</button>
        </div>
      </section>

      <!-- 步骤3：JavaScript 简单交互 -->
      <section v-show="currentStep === 3" class="step-section">
        <h2 class="section-title">🎮 第三章：JavaScript 简单交互</h2>
        
        <!-- 3.1 事件基础 -->
        <div class="knowledge-card">
          <h3 class="card-title">🖱️ 事件基础</h3>
          <div class="text-content">
            <p>事件让网页能够响应用户的操作：</p>
            <ul>
              <li><code>onclick</code> - 点击事件（最常用）⭐</li>
              <li><code>onmouseover</code> - 鼠标悬停事件</li>
              <li><code>onmouseout</code> - 鼠标移出事件</li>
            </ul>
            <div class="syntax-box">
              <pre><code>&lt;button onclick="函数名()"&gt;点我&lt;/button&gt;</code></pre>
            </div>
          </div>
          
          <div class="code-demo">
            <div class="code-editor">
              <div class="editor-header">
                <span class="editor-label">📝 试着触发不同事件</span>
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

        <!-- 3.2 获取/修改元素内容 -->
        <div class="knowledge-card">
          <h3 class="card-title">🔧 获取/修改元素内容</h3>
          <div class="text-content">
            <p>JavaScript 可以动态修改网页内容：</p>
            <ul>
              <li><code>document.getElementById('id')</code> - 通过 ID 获取元素</li>
              <li><code>元素.innerText</code> - 修改纯文本内容</li>
              <li><code>元素.innerHTML</code> - 修改 HTML 内容</li>
            </ul>
            <div class="syntax-box">
              <pre><code>let element = document.getElementById('demo');
element.innerText = '新内容';</code></pre>
            </div>
          </div>
          
          <div class="code-demo">
            <div class="code-editor">
              <div class="editor-header">
                <span class="editor-label">📝 试着修改元素内容</span>
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

        <!-- 3.3 简单案例 -->
        <div class="knowledge-card">
          <h3 class="card-title">✨ 简单案例</h3>
          <div class="text-content">
            <p>综合运用所学知识，实现简单的交互效果：</p>
            <ul>
              <li>📝 案例1：点击按钮修改网页文本</li>
              <li>🎉 案例2：点击按钮弹出提示框</li>
              <li>🎨 案例3：点击按钮改变样式</li>
            </ul>
          </div>
          
          <div class="code-demo">
            <div class="code-editor">
              <div class="editor-header">
                <span class="editor-label">📝 试着完善案例功能</span>
              </div>
              <div class="editor-content">
                <textarea 
                  v-model="step3_3Code" 
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
                <iframe :srcdoc="step3_3Preview" :key="step3_3Key" class="preview-frame large"></iframe>
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
import { courseProgressService } from '@/services/courseProgressService'

const router = useRouter()

// 步骤管理
const currentStep = ref(1)
const totalSteps = 3
const steps = [
  { name: '初识 JS' },
  { name: 'JS 语法' },
  { name: '简单交互' }
]

// 步骤1：初识 JavaScript
const step1Code = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>JavaScript 引入方式</title>
  <script>
    // 2. 内部脚本
    function showMessage() {
      alert('这是内部脚本！');
    }
  <\/script>
</head>
<body>
  <h3>JavaScript 引入方式演示</h3>
  
  <!-- 1. 行内脚本 -->
  <button onclick="alert('这是行内脚本！')">
    点我（行内脚本）
  </button>
  
  <!-- 2. 内部脚本 -->
  <button onclick="showMessage()">
    点我（内部脚本）
  </button>
</body>
</html>`)

const step1Key = ref(0)
watch(step1Code, () => step1Key.value++)

// 步骤2.1：变量与常量
const step2_1Code = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>变量与常量</title>
</head>
<body>
  <h3>变量与常量示例</h3>
  <div id="output"></div>
  
  <script>
    // 使用 let 声明变量（可修改）
    let name = '小明';
    let age = 18;
    
    // 使用 const 声明常量（不可修改）
    const school = '实验中学';
    
    // 修改变量
    name = '小红';
    age = 19;
    
    // 输出到页面
    document.getElementById('output').innerHTML = 
      '姓名：' + name + '<br>' +
      '年龄：' + age + '<br>' +
      '学校：' + school;
  <\/script>
</body>
</html>`)

const step2_1Preview = computed(() => step2_1Code.value)
const step2_1Key = ref(0)
watch(step2_1Code, () => step2_1Key.value++)

// 步骤2.2：数据类型
const step2_2Code = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>数据类型</title>
</head>
<body>
  <h3>数据类型示例</h3>
  <div id="output"></div>
  
  <script>
    let str = '你好，世界';        // 字符串
    let num = 123;                 // 数字
    let decimal = 3.14;            // 小数
    let bool = true;               // 布尔值
    let nothing;                   // undefined
    
    document.getElementById('output').innerHTML = 
      '字符串：' + str + '<br>' +
      '整数：' + num + '<br>' +
      '小数：' + decimal + '<br>' +
      '布尔值：' + bool + '<br>' +
      'undefined：' + nothing;
  <\/script>
</body>
</html>`)

const step2_2Preview = computed(() => step2_2Code.value)
const step2_2Key = ref(0)
watch(step2_2Code, () => step2_2Key.value++)

// 步骤2.3：运算符
const step2_3Code = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>运算符</title>
</head>
<body>
  <h3>运算符示例</h3>
  <div id="output"></div>
  
  <script>
    let a = 10;
    let b = 3;
    
    let add = a + b;      // 加法：13
    let sub = a - b;      // 减法：7
    let mul = a * b;      // 乘法：30
    let div = a / b;      // 除法：3.33...
    
    // 字符串拼接
    let str = '你好' + '世界';  // "你好世界"
    
    document.getElementById('output').innerHTML = 
      a + ' + ' + b + ' = ' + add + '<br>' +
      a + ' - ' + b + ' = ' + sub + '<br>' +
      a + ' × ' + b + ' = ' + mul + '<br>' +
      a + ' ÷ ' + b + ' = ' + div.toFixed(2) + '<br>' +
      '字符串拼接：' + str;
  <\/script>
</body>
</html>`)

const step2_3Preview = computed(() => step2_3Code.value)
const step2_3Key = ref(0)
watch(step2_3Code, () => step2_3Key.value++)

// 步骤2.4：简单输出
const step2_4Code = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>简单输出</title>
</head>
<body>
  <h3>JavaScript 输出方式</h3>
  <button onclick="alert('这是弹窗提示！')">
    点击弹出提示框
  </button>
  
  <script>
    // 1. console.log - 控制台输出（按F12查看）
    console.log('这是控制台输出');
    console.log('数字：', 123);
    console.log('对象：', {name: '小明', age: 18});
    
    // 2. document.write - 页面输出
    document.write('<p style="color: blue;">这是页面输出</p>');
    
    // 3. alert - 弹窗（点击按钮触发）
  <\/script>
</body>
</html>`)

const step2_4Preview = computed(() => step2_4Code.value)
const step2_4Key = ref(0)
watch(step2_4Code, () => step2_4Key.value++)

// 步骤3.1：事件基础
const step3_1Code = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>事件基础</title>
  <style>
    button { padding: 10px 20px; margin: 5px; }
    #box { 
      width: 200px; 
      height: 100px; 
      background: #e3f2fd; 
      padding: 20px; 
      margin: 10px 0;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <h3>事件示例</h3>
  
  <!-- 点击事件 -->
  <button onclick="alert('你点击了按钮！')">
    点击事件
  </button>
  
  <!-- 鼠标悬停事件 -->
  <div id="box" 
       onmouseover="this.style.background='#ffeb3b'" 
       onmouseout="this.style.background='#e3f2fd'">
    鼠标悬停试试
  </div>
</body>
</html>`)

const step3_1Preview = computed(() => step3_1Code.value)
const step3_1Key = ref(0)
watch(step3_1Code, () => step3_1Key.value++)

// 步骤3.2：获取/修改元素内容
const step3_2Code = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>获取/修改元素</title>
  <style>
    button { padding: 10px 20px; margin: 5px; }
    #text { 
      padding: 20px; 
      background: #e8f5e9; 
      margin: 10px 0;
      border-radius: 8px;
    }
  </style>
  <script>
    function changeText() {
      let element = document.getElementById('text');
      element.innerText = '文本已被修改！';
    }
    
    function changeHTML() {
      let element = document.getElementById('text');
      element.innerHTML = '<strong style="color: red;">HTML已被修改！</strong>';
    }
  <\/script>
</head>
<body>
  <h3>修改元素内容</h3>
  <div id="text">这是原始文本</div>
  
  <button onclick="changeText()">修改文本</button>
  <button onclick="changeHTML()">修改HTML</button>
</body>
</html>`)

const step3_2Preview = computed(() => step3_2Code.value)
const step3_2Key = ref(0)
watch(step3_2Code, () => step3_2Key.value++)

// 步骤3.3：简单案例
const step3_3Code = ref(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>综合案例</title>
  <style>
    body { padding: 20px; }
    button { 
      padding: 12px 24px; 
      margin: 5px; 
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
    .primary { background: #2196f3; color: white; }
    .success { background: #4caf50; color: white; }
    .warning { background: #ff9800; color: white; }
    #display { 
      padding: 20px; 
      background: #f5f5f5; 
      margin: 15px 0;
      border-radius: 8px;
      min-height: 50px;
    }
    #counter {
      font-size: 48px;
      font-weight: bold;
      color: #2196f3;
      text-align: center;
      padding: 20px;
    }
  </style>
  <script>
    let count = 0;
    
    function changeText() {
      document.getElementById('display').innerText = 
        '当前时间：' + new Date().toLocaleTimeString();
    }
    
    function showAlert() {
      alert('🎉 恭喜你完成了 JavaScript 基础课程！');
    }
    
    function increment() {
      count++;
      document.getElementById('counter').innerText = count;
    }
    
    function reset() {
      count = 0;
      document.getElementById('counter').innerText = count;
    }
  <\/script>
</head>
<body>
  <h3>📝 案例1：修改文本</h3>
  <div id="display">点击按钮查看当前时间</div>
  <button class="primary" onclick="changeText()">显示时间</button>
  
  <h3>🎉 案例2：弹出提示</h3>
  <button class="success" onclick="showAlert()">点击弹窗</button>
  
  <h3>🔢 案例3：计数器</h3>
  <div id="counter">0</div>
  <button class="primary" onclick="increment()">+1</button>
  <button class="warning" onclick="reset()">重置</button>
</body>
</html>`)

const step3_3Preview = computed(() => step3_3Code.value)
const step3_3Key = ref(0)
watch(step3_3Code, () => step3_3Key.value++)

// 导航函数
const scrollToTop = () => {
  const jsBasics = document.querySelector('.js-basics')
  if (jsBasics) {
    jsBasics.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

const completeCourse = async () => {
  try {
    await courseProgressService.completeCourse('js-basics')
    alert('🎉 恭喜完成 JavaScript 核心基础课程！\n\n你已经掌握了 HTML、CSS、JavaScript 三大核心技术！')
    router.push('/learn/project-basics')
  } catch (error) {
    console.error('记录课程完成失败:', error)
    alert('🎉 恭喜完成 JavaScript 核心基础课程！\n\n你已经掌握了 HTML、CSS、JavaScript 三大核心技术！')
    router.push('/learn/project-basics')
  }
}
</script>

<style scoped>
.js-basics {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff9e6 0%, #fff3cc 100%);
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
  color: #ff9800;
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
  background: linear-gradient(90deg, #ff9800 0%, #f57c00 100%);
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
  border-color: #ff9800;
}

.step-item.active {
  border-color: #ff9800;
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
  background: #ff9800;
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
  color: #ff9800;
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
  color: #ff9800;
  border-radius: 3px;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
}

.syntax-box {
  background: #f8f9fa;
  border-left: 4px solid #ff9800;
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

.code-input.large {
  min-height: 350px;
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

.preview-frame.large {
  min-height: 350px;
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
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
  display: block;
  margin: 32px auto 0;
}

.next-step-btn:hover, .complete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
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
