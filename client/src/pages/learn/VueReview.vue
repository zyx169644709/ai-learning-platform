<template>
  <div class="vue-review">
    <div class="coming-soon">
      <div class="icon">🤖</div>
      <h1>Vue 进阶查漏补缺</h1>
      <p class="subtitle">智能诊断即将上线</p>
      <div class="description">
        <p>我们正在开发一个智能助教功能，它将：</p>
        <ul>
          <li>📝 通过对话了解你目前的 Vue 掌握情况</li>
          <li>🔍 智能分析你的知识盲点</li>
          <li>📚 为你定制个性化的进阶学习路径</li>
          <li>💡 提供针对性的练习和项目建议</li>
        </ul>
      </div>
      <div class="actions">
        <button class="btn secondary" @click="goBack">← 返回首页</button>
        <button class="btn primary" @click="goToAssistant">先和助教聊聊 →</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/')
}

const goToAssistant = () => {
  router.push('/api/deepseek')
}
</script>

<style scoped>
.vue-review {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: radial-gradient(800px 400px at 50% 30%, rgba(65, 184, 131, 0.08), transparent 60%);
}

.coming-soon {
  max-width: 600px;
  text-align: center;
  padding: 48px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.icon {
  font-size: 64px;
  margin-bottom: 24px;
}

h1 {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.subtitle {
  font-size: 18px;
  color: #41b883;
  font-weight: 600;
  margin-bottom: 32px;
}

.description {
  text-align: left;
  padding: 24px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  margin-bottom: 32px;
}

.description p {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.description ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.description li {
  padding: 8px 0;
  color: var(--text-primary);
  font-size: 15px;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn {
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn.secondary {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.btn.secondary:hover {
  border-color: #41b883;
  color: #41b883;
}

.btn.primary {
  background: #41b883;
  border: none;
  color: white;
}

.btn.primary:hover {
  background: #35a070;
  box-shadow: 0 4px 20px rgba(65, 184, 131, 0.4);
}

@media (max-width: 480px) {
  .coming-soon {
    padding: 32px 20px;
  }
  
  h1 {
    font-size: 24px;
  }
  
  .actions {
    flex-direction: column;
  }
}
</style>
