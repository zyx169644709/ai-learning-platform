<template>
  <div class="docs">
    <h1 class="title">介绍</h1>
    <div class="main-container">
      <div class="callout">
        <span class="play">▶</span>
        <RouterLink to="/api/deepseek">立即试用智能助教</RouterLink>
      </div>

      <p>
        AI Learning学习平台面向开发者与高校同学，提供"学习目录 + 系统课程 + 项目实战 + 智能助教"的一体化学习体验，帮助你从基础到应用快速掌握大模型时代的核心能力。
      </p>
      <p>你可以在这里：</p>

      <ul class="features">
        <li>沿学习路径进阶：AI 入门 / Prompt 工程 / RAG 应用 / 模型微调</li>
        <li>通过精选课程与项目实践，边学边做快速上手</li>
        <li>使用智能助教实时解惑，获得思路、示例代码与练习建议</li>
        <li>使用内置代码编译器高效学习代码</li>
        <li>体验基于工作流搭建的多种智能体服务</li>
        <li>实践数据与大模型应用：检索增强（RAG）、知识库与工具调用</li>
        <li>参与社区讨论，获取高质量学习资料与答疑</li>
        <li>桌面/移动端自适应的轻量体验</li>
      </ul>

      <!-- 在线代码编辑器 -->
      <div class="code-editor-section">
        <h2 class="section-title">在线代码编辑器</h2>
        <p class="section-description">
          立即体验我们的在线代码编辑器，支持多种编程语言，实时运行和调试你的代码！
        </p>

        <CodeEditor :initial-code="defaultCode" language="javascript" />

        <div class="editor-features">
          <h3>编辑器特性</h3>
          <ul>
            <li><strong>多语言支持：</strong>JavaScript、Python、Java、C++、C#、Go、Rust、TypeScript</li>
            <li><strong>智能语法高亮：</strong>基于 Monaco Editor 的专业代码编辑体验</li>
            <li><strong>实时运行：</strong>支持 JavaScript 和 TypeScript 的在线执行</li>
            <li><strong>错误提示：</strong>详细的错误信息和行号定位</li>
            <li><strong>性能监控：</strong>执行时间和内存使用统计</li>
            <li><strong>代码模板：</strong>内置常用算法和示例代码</li>
          </ul>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import CodeEditor from '@/components/common/CodeEditor.vue'

// 默认代码示例
const defaultCode = `// 欢迎使用 AI Learning 在线代码编辑器！
console.log("🚀 开始你的编程之旅");

// 这是一个简单的计算器函数
function calculator(operation, a, b) {
  switch(operation) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return b !== 0 ? a / b : '错误：除数不能为0';
    default: return '不支持的运算';
  }
}

// 测试计算器
console.log("5 + 3 =", calculator('+', 5, 3));
console.log("10 - 4 =", calculator('-', 10, 4));
console.log("6 * 7 =", calculator('*', 6, 7));
console.log("15 / 3 =", calculator('/', 15, 3));

// 尝试修改上面的代码，然后点击"运行代码"按钮！
`
</script>

<style scoped>
.docs {
  width: 100%;
  margin: 0 auto;
  padding: 28px;
  line-height: 1.7;
  color: var(--text-primary);
}

.main-container {
  width: 100%;
  margin: 0 10px;
  padding: 28px;
}

.title {
  font-size: 40px;
  font-weight: 800;
  margin: 25px 0px 0px 45px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 60px;
  margin-bottom: 20px;
}

.callout {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 24px;
}

.play {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--accent-color);
  color: #fff;
  font-weight: 700;
}

a {
  color: var(--accent-color);
  text-decoration: none;
}

a:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}

p {
  margin: 12px 0;
  color: var(--text-secondary);
}

.features {
  margin: 8px 0 0 0;
  padding-left: 22px;
}

.features li {
  margin: 8px 0;
  color: var(--text-secondary);
}

.features li::marker {
  color: var(--accent-color);
}

/* 代码编辑器部分 */
.code-editor-section {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid var(--border-color);
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: var(--text-primary);
}

.section-description {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.editor-features {
  margin-top: 32px;
  padding: 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
}

.editor-features h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--text-primary);
}

.editor-features ul {
  margin: 0;
  padding-left: 22px;
}

.editor-features li {
  margin: 8px 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

.editor-features li strong {
  color: var(--text-primary);
}
</style>