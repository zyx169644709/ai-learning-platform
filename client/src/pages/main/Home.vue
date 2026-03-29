<template>
  <div class="docs">
    <h1 class="title">介绍</h1>
    <div class="main-container">
      <div class="callout">
        <span class="play">▶</span>
        <span class="callout-link" @click="openAiChat">立即咨询 Vue 专家助教</span>
      </div>

      <p>
        Vue.js 实战平台面向前端开发者与系统学习者，提供“理论讲解 + 习题练习 + 实操项目 + 智能反馈”的闭环学习体验，帮助你从零基础到进阶，系统化掌握 Vue 3 现代化开发的核心能力。
      </p>
      <p>你可以在这里：</p>

      <ul class="features">
        <li>系统化学习路径：从 Vue 基础、Composition API 到响应式原理与工程化实践</li>
        <li>理论与实践结合：每章配套精选习题与实操挑战，即学即练巩固知识</li>
        <li>智能反馈系统：Vue 专家助教实时答疑，针对你的代码提供优化建议与调试思路</li>
        <li>在线实操演练：内置集成开发环境，无需配置即可编写、运行 Vue 组件</li>
        <li>真实项目驱动：参与从 TodoList 到复杂单页面应用（SPA）的完整项目开发</li>
        <li>社区共建成长：分享学习心得，参与代码评审，获取高质量的前端学习资源</li>
        <li>全平台适配：支持桌面与移动端访问，随时随地开启你的 Vue 学习之旅</li>
      </ul>

      <!-- 代码示例展示 -->
      <div class="code-example-section">
        <h2 class="section-title">Vue 3 代码示例</h2>
        <p class="section-description">
          以下是 Vue 3 Composition API 的基础示例，展示了响应式数据和生命周期钩子的使用：
        </p>

        <InlineCodeEditor
          :initialCode="defaultCode"
          language="javascript"
          title="Vue 3 Composition API"
          :readOnly="false"
        />

        <div class="learning-features">
          <h3>平台特性</h3>
          <ul>
            <li><strong>系统化学习：</strong>从基础到进阶的完整 Vue 3 学习路径</li>
            <li><strong>智能助教：</strong>AI 驱动的 Vue 专家助教，实时解答你的问题</li>
            <li><strong>实战练习：</strong>每章配套习题与实操挑战，即学即练</li>
            <li><strong>社区交流：</strong>与其他学习者分享心得，共同进步</li>
          </ul>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import InlineCodeEditor from '@/components/common/InlineCodeEditor.vue'

const openAiChat = () => window.dispatchEvent(new CustomEvent('open-ai-chat'))

// 默认代码示例
const defaultCode = `// Vue 3 Composition API 示例
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const count = ref(0);
    const message = ref("Hello Vue 3!");

    const increment = () => {
      count.value++;
    };

    onMounted(() => {
      console.log("组件已挂载");
    });

    return { count, message, increment };
  }
};
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

.callout-link {
  color: var(--accent-color);
  cursor: pointer;
  text-decoration: none;
}

.callout-link:hover {
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

/* 代码示例部分 */
.code-example-section {
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

.learning-features {
  margin-top: 32px;
  padding: 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
}

.learning-features h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--text-primary);
}

.learning-features ul {
  margin: 0;
  padding-left: 22px;
}

.learning-features li {
  margin: 8px 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

.learning-features li strong {
  color: var(--text-primary);
}
</style>