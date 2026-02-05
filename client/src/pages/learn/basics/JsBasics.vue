<template>
  <div class="js-basics">
    <!-- 模块1：开篇引导 -->
    <section class="intro-section">
      <div class="intro-illustration">
        <div class="house-brain">
          <div class="house-frame">🏠</div>
          <div class="brain-elements">
            <div class="brain">🧠</div>
            <div class="lightning">⚡</div>
            <div class="gears">⚙️</div>
          </div>
        </div>
      </div>
      <div class="intro-content">
        <h1 class="intro-title">JS：给 Vue 的「房子」装上大脑</h1>
        <p class="intro-subtitle">只学 4 个概念，就能让 Vue 页面「活」起来</p>
        <p class="intro-desc">
          JavaScript 就像房子的「大脑和神经系统」，<br>
          让 Vue 能够响应用户操作、处理数据、实现动态效果～
        </p>
      </div>
    </section>

    <!-- 模块2：核心知识点 -->
    <section class="knowledge-section">
      <h2 class="section-title">🎯 只学这 4 个概念</h2>
      
      <!-- 知识点1：变量 -->
      <div class="knowledge-card">
        <div class="card-header">
          <span class="card-number">1</span>
          <div class="card-title-area">
            <h3 class="card-title">变量 —— 存储数据的「小盒子」</h3>
            <p class="card-desc">Vue 的所有数据都存在变量里，比如计数器的数字</p>
          </div>
        </div>
        <div class="code-demo">
          <div class="code-editor">
            <div class="editor-header">
              <span class="editor-label">📝 代码</span>
            </div>
            <div class="editor-content">
              <textarea 
                v-model="variableCode" 
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
              <iframe :srcdoc="variablePreview" class="preview-frame"></iframe>
            </div>
          </div>
        </div>
      </div>

      <!-- 知识点2：对象 -->
      <div class="knowledge-card">
        <div class="card-header">
          <span class="card-number">2</span>
          <div class="card-title-area">
            <h3 class="card-title">对象 —— 组织数据的「文件夹」</h3>
            <p class="card-desc">Vue 组件的数据经常用对象来组织，比如用户信息</p>
          </div>
        </div>
        <div class="code-demo">
          <div class="code-editor">
            <div class="editor-header">
              <span class="editor-label">📝 代码</span>
            </div>
            <div class="editor-content">
              <textarea 
                v-model="objectCode" 
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
              <iframe :srcdoc="objectPreview" class="preview-frame"></iframe>
            </div>
          </div>
        </div>
      </div>

      <!-- 知识点3：函数 -->
      <div class="knowledge-card">
        <div class="card-header">
          <span class="card-number">3</span>
          <div class="card-title-area">
            <h3 class="card-title">函数 —— 可重复使用的「小工具」</h3>
            <p class="card-desc">Vue 的方法都是函数，比如点击按钮要执行的逻辑</p>
          </div>
        </div>
        <div class="code-demo">
          <div class="code-editor">
            <div class="editor-header">
              <span class="editor-label">📝 代码</span>
            </div>
            <div class="editor-content">
              <textarea 
                v-model="functionCode" 
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
              <iframe :srcdoc="functionPreview" class="preview-frame"></iframe>
            </div>
          </div>
        </div>
      </div>

      <!-- 知识点4：事件 -->
      <div class="knowledge-card">
        <div class="card-header">
          <span class="card-number">4</span>
          <div class="card-title-area">
            <h3 class="card-title">事件 —— 用户操作的「信号」</h3>
            <p class="card-desc">Vue 的 @click、@input 等都是事件，响应用户操作</p>
          </div>
        </div>
        <div class="code-demo">
          <div class="code-editor">
            <div class="editor-header">
              <span class="editor-label">📝 代码</span>
            </div>
            <div class="editor-content">
              <textarea 
                v-model="eventCode" 
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
              <iframe :srcdoc="eventPreview" class="preview-frame"></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 模块3：实战小练习 -->
    <section class="practice-section">
      <h2 class="section-title">✨ 动手试试</h2>
      <p class="practice-desc">用学过的 JS 概念，实现一个简单的计数器逻辑</p>
      
      <div class="practice-editor">
        <div class="code-demo large">
          <div class="code-editor">
            <div class="editor-header">
              <span class="editor-label">📝 补充 JS 逻辑</span>
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
        🎉 JS 逻辑完成！计数器能正常工作了～
      </div>
    </section>

    <!-- 模块4：完成引导 -->
    <section class="next-section">
      <div class="next-content">
        <p class="next-hint">恭喜！你已经掌握了 Vue 必备的 JS 基础～</p>
        <p class="next-desc">现在你可以开始学习 Vue 核心内容了！HTML 搭骨架、CSS 装装修、JS 装大脑，三者配合，Vue 才能发挥威力～</p>
        <div class="action-buttons">
          <button class="next-btn primary" @click="goToVueCore">开始学 Vue 核心 →</button>
          <button class="next-btn secondary" @click="goToCompletion">返回完成页</button>
        </div>
      </div>
      <button class="back-btn" @click="goBack">← 返回</button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 知识点1：变量代码
const variableCode = ref(`// 声明变量（存储数据）
let count = 0;        // 计数器
let message = "Hello Vue"; // 文字

// 访问变量
console.log(count);    // 输出: 0
console.log(message);  // 输出: Hello Vue

// 修改变量
count = count + 1;     // 计数器加 1
message = "Hi Vue";    // 修改文字`)

const variablePreview = computed(() => `
  <style>
    body { font-family: system-ui; padding: 16px; margin: 0; }
    .demo { background: #f8f9fa; padding: 16px; border-radius: 8px; }
    .output { margin-top: 12px; }
    .log { background: #2d3748; color: #e2e8f0; padding: 8px 12px; border-radius: 4px; margin: 4px 0; font-family: monospace; }
  </style>
  <div class="demo">
    <div class="output">
      <div class="log">count = 0</div>
      <div class="log">message = "Hello Vue"</div>
      <div class="log">count = 1</div>
      <div class="log">message = "Hi Vue"</div>
    </div>
  </div>
`)

// 知识点2：对象代码
const objectCode = ref(`// 创建对象（组织数据）
const user = {
  name: "小明",
  age: 25,
  city: "北京"
};

// 访问对象属性
console.log(user.name);  // 输出: 小明
console.log(user.age);   // 输出: 25

// 修改对象属性
user.age = 26;
user.city = "上海";

// Vue 组件数据经常这样组织
const appData = {
  count: 0,
  message: "Hello Vue",
  user: {
    name: "Vue学习者",
    level: "新手"
  }
};`)

const objectPreview = computed(() => `
  <style>
    body { font-family: system-ui; padding: 16px; margin: 0; }
    .demo { background: #f8f9fa; padding: 16px; border-radius: 8px; }
    .object-view { background: #e3f2fd; padding: 12px; border-radius: 8px; margin: 8px 0; }
    .property { color: #1976d2; font-weight: 600; }
    .value { color: #424242; }
  </style>
  <div class="demo">
    <div class="object-view">
      <div><span class="property">name:</span> <span class="value">"小明"</span></div>
      <div><span class="property">age:</span> <span class="value">26</span></div>
      <div><span class="property">city:</span> <span class="value">"上海"</span></div>
    </div>
  </div>
`)

// 知识点3：函数代码
const functionCode = ref(`// 定义函数（可重复使用的小工具）
function sayHello(name) {
  return "Hello, " + name + "!";
}

function add(a, b) {
  return a + b;
}

// 调用函数
console.log(sayHello("Vue"));  // 输出: Hello, Vue!
console.log(add(2, 3));        // 输出: 5

// 箭头函数（更简洁的写法）
const increment = (num) => num + 1;
const greet = () => "Welcome to Vue!";

console.log(increment(5));     // 输出: 6
console.log(greet());          // 输出: Welcome to Vue!`)

const functionPreview = computed(() => `
  <style>
    body { font-family: system-ui; padding: 16px; margin: 0; }
    .demo { background: #f8f9fa; padding: 16px; border-radius: 8px; }
    .result { background: #e8f5e9; padding: 8px 12px; border-radius: 4px; margin: 8px 0; }
  </style>
  <div class="demo">
    <div class="result">sayHello("Vue") = "Hello, Vue!"</div>
    <div class="result">add(2, 3) = 5</div>
    <div class="result">increment(5) = 6</div>
    <div class="result">greet() = "Welcome to Vue!"</div>
  </div>
`)

// 知识点4：事件代码
const eventCode = ref(`// 事件处理（响应用户操作）
// 在 HTML 中绑定事件
// <button onclick="handleClick()">点我</button>

// 定义事件处理函数
function handleClick() {
  console.log("按钮被点击了！");
  alert("Hello Vue!");
}

// Vue 中更常用的写法
// <button @click="handleClick">点我</button>

// 其他常见事件
// @input - 输入框内容改变
// @mouseover - 鼠标悬停
// @keydown - 键盘按键按下

function handleInput(event) {
  console.log("输入内容:", event.target.value);
}`)

const eventPreview = computed(() => `
  <style>
    body { font-family: system-ui; padding: 16px; margin: 0; }
    .demo { background: #f8f9fa; padding: 16px; border-radius: 8px; }
    button { padding: 8px 16px; background: #41b883; color: white; border: none; border-radius: 4px; margin: 8px; cursor: pointer; }
    button:hover { background: #35a070; }
    input { padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin: 8px; }
  </style>
  <div class="demo">
    <button onclick="alert('Hello Vue!')">点击我</button>
    <input oninput="console.log('输入:', this.value)" placeholder="输入内容试试">
  </div>
`)

// 练习代码
const initialPracticeCode = `// Vue 计数器的核心逻辑
// 1. 声明变量存储计数器值
let count = 0;

// 2. 定义增加函数
function increment() {
  count = count + 1;
  updateDisplay();
}

// 3. 定义减少函数
function decrement() {
  count = count - 1;
  updateDisplay();
}

// 4. 更新页面显示
function updateDisplay() {
  // 这里会更新页面上的数字显示
  console.log("当前计数:", count);
}

// 5. 初始化显示
updateDisplay();`

const practiceCode = ref(initialPracticeCode)

const practicePreview = computed(() => `
  <style>
    body { font-family: system-ui; padding: 16px; margin: 0; }
    .counter { text-align: center; padding: 24px; background: #f0fdf4; border-radius: 12px; }
    .count { font-size: 48px; font-weight: bold; color: #41b883; margin: 16px 0; }
    .buttons { display: flex; gap: 12px; justify-content: center; }
    button { padding: 12px 24px; background: #41b883; color: white; border: none; border-radius: 8px; cursor: pointer; }
    button:hover { background: #35a070; }
    .minus { background: #ef4444; }
    .minus:hover { background: #dc2626; }
  </style>
  <div class="counter">
    <h3>计数器</h3>
    <div class="count">0</div>
    <div class="buttons">
      <button class="minus" onclick="alert('减少功能已实现')">- 1</button>
      <button onclick="alert('增加功能已实现')">+ 1</button>
    </div>
  </div>
`)

// 练习完成检测
const practiceCompleted = computed(() => {
  const code = practiceCode.value
  return code.includes('let count') && 
         code.includes('function increment') && 
         code.includes('function decrement') &&
         code.includes('updateDisplay')
})

const resetPractice = () => {
  practiceCode.value = initialPracticeCode
}

const goToVueCore = () => {
  router.push('/home')
}

const goToCompletion = () => {
  router.push('/learn/completion')
}

const goBack = () => {
  router.push('/learn/basics')
}
</script>

<style scoped>
.js-basics {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
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

.house-brain {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.house-frame {
  font-size: 64px;
  line-height: 1;
}

.brain-elements {
  position: absolute;
  top: -15px;
  right: -45px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.brain {
  font-size: 28px;
  animation: pulse 2s ease-in-out infinite;
}

.lightning {
  font-size: 20px;
  animation: flash 1.5s ease-in-out infinite;
}

.gears {
  font-size: 20px;
  animation: rotate 3s linear infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes flash {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.intro-title {
  font-size: 32px;
  font-weight: 700;
  color: #f57c00;
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
  background: #f57c00;
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
  font-size: 18px;
  font-weight: 600;
  color: #f57c00;
  margin: 0 0 12px;
}

.next-desc {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 24px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.next-btn {
  padding: 16px 32px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.next-btn.primary {
  background: linear-gradient(135deg, #f57c00 0%, #e65100 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(245, 124, 0, 0.3);
}

.next-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 124, 0, 0.4);
}

.next-btn.secondary {
  background: white;
  color: #666;
  border: 1px solid #ddd;
}

.next-btn.secondary:hover {
  background: #f5f5f5;
  color: #333;
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
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
