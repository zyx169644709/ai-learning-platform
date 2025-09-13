<template>
  <div class="ai-panel">
    <div class="panel-header">
      <h3 class="panel-title">基于api调用的AI辅助工具</h3>
      <div class="panel-subtitle">DeepSeek代码助手</div>
      <div class="ai-card">
        <button @click="openCodeAssistant" class="card-button code-button">Code Assistant </button>
      </div>
      <div class="panel-subtitle">Kimi全能助手</div>
      <button @click="openKimiPage" class="card-button kimi-button">Kimi</button>
    </div>
    <h3 class="panel-title">基于coze空间的智能体</h3>
    <div class="panel-subtitle">塔罗牌占卜</div>
    <div class="ai-features">
      <button @click="openTarotPage" class="card-button tarot-button">Tarot</button>
    </div>
    <div class="panel-subtitle">MBTI分析助手</div>
    <button @click="openMBTIPage" class="card-button tarot-button">MBTI</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const openTarotPage = () => {
  router.push('/agent/tarot')
}

const openCodeAssistant = () => {
  router.push('/api/deepseek')
}

const openKimiPage = () => {
  router.push('/api/kimi')
}

const openMBTIPage = () => {
  router.push('/agent/mbti')
}

</script>

<style scoped>
.ai-panel {
  width: 280px;
  height: calc(100vh - 64px);
  background: var(--bg-primary);
  border-left: 1px solid var(--border-color);
  overflow-y: auto;
  position: fixed;
  top: 64px;
  right: 0;
  z-index: 1000;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}

/* 面板头部 */
.panel-header {
  margin-bottom: 28px;
  text-align: center;
}

.panel-title {
  margin-top: 30px;
  margin-left: 20px;
  color: var(--text-primary);
  font-weight: 700;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: left;
  gap: 8px;
  border-left: 1px solid var(--border-color);
  padding-left: 10px;
}

.panel-subtitle {
  margin-left: 20px;
  margin-top: 10px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  display: flex;
  width: 80%;
  padding-bottom: 5px;
  border-bottom: 1px solid var(--border-color);
}

.card-button {
  width: 69%;
  height: 75px;
  padding: 12px 20px;
  margin: 20px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.card-button:hover {
  transform: translateY(-2.5px);
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.25), 0 8px 20px var(--shadow-hover);
}

/* 键盘聚焦可视化 */
.card-button:focus-visible {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.35), 0 6px 18px var(--shadow-hover);
}


/* 响应式设计 */
@media (max-width: 1200px) {
  .ai-panel {
    width: 280px;
    height: calc(100vh - 64px);
    border-left: 1px solid var(--border-color);
    border-top: none;
    padding: 20px;
    flex-shrink: 0;
    position: fixed;
    top: 64px;
    right: 0;
    z-index: 1000;
  }

  .panel-header {
    margin-bottom: 24px;
  }

  .ai-features {
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .ai-panel {
    width: 240px;
    padding: 16px;
  }

  .panel-header {
    margin-bottom: 20px;
  }

  .ai-features {
    gap: 12px;
  }
}

@media (max-width: 600px) {
  .ai-panel {
    width: 200px;
    padding: 12px;
  }

  .card-button {
    width: 85%;
    height: 50px;
    font-size: 12px;
    margin: 15px;
  }

  .panel-title {
    font-size: 14px;
    margin-left: 15px;
  }

  .panel-subtitle {
    font-size: 12px;
    margin-left: 15px;
  }
}
</style>
