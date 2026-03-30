<template>
  <div class="not-found-page">
    <div class="not-found-card">
      <div class="code">404</div>
      <h1 class="title">页面不存在</h1>
      <p class="description">你访问的页面可能已被移动、删除，或路径输入有误。</p>
      <div class="actions">
        <button class="primary-btn" @click="router.push('/')">返回首页</button>
        <button class="secondary-btn" @click="router.back()">返回上一页</button>
      </div>
      <div class="hint">请检查地址是否正确，或从首页重新进入。</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
.not-found-page {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background:
    radial-gradient(circle at top, rgba(66, 184, 131, 0.18), transparent 35%),
    linear-gradient(180deg, #0f172a 0%, #111827 100%);
}

.not-found-card {
  width: min(100%, 680px);
  padding: 56px 40px;
  border-radius: 24px;
  text-align: center;
  color: #f8fafc;
  background: rgba(15, 23, 42, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(12px);
}

.code {
  font-size: clamp(72px, 12vw, 132px);
  line-height: 1;
  font-weight: 800;
  color: #42b883;
  margin-bottom: 16px;
}

.title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
}

.description {
  margin: 16px auto 0;
  max-width: 480px;
  font-size: 16px;
  line-height: 1.8;
  color: rgba(248, 250, 252, 0.82);
}

.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn {
  min-width: 144px;
  height: 46px;
  padding: 0 20px;
  border-radius: 999px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.primary-btn {
  color: #052e16;
  background: linear-gradient(135deg, #42b883, #6ee7b7);
  box-shadow: 0 12px 30px rgba(66, 184, 131, 0.28);
}

.secondary-btn {
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.primary-btn:hover,
.secondary-btn:hover {
  transform: translateY(-1px);
}

.hint {
  margin-top: 24px;
  font-size: 13px;
  color: rgba(248, 250, 252, 0.55);
}

@media (max-width: 640px) {
  .not-found-page {
    padding: 20px;
  }

  .not-found-card {
    padding: 40px 24px;
    border-radius: 20px;
  }

  .title {
    font-size: 26px;
  }

  .description {
    font-size: 14px;
  }

  .actions {
    flex-direction: column;
    align-items: stretch;
  }

  .primary-btn,
  .secondary-btn {
    width: 100%;
  }
}
</style>
