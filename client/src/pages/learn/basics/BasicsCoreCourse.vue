<template>
  <div class="basics-course">
    <div class="course-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h1 class="course-title">📚 Vue 核心基础课</h1>
      <p class="course-desc">只学 Vue 必备的 20% 基础知识，3 小时搞定</p>
    </div>

    <div class="course-content">
      <div class="coming-soon">
        <div class="icon">🚧</div>
        <h2>课程正在建设中...</h2>
        <p>我们正在精心准备「Vue 驱动的极简前置课」，敬请期待！</p>
        <div class="course-preview">
          <h3>课程内容预览：</h3>
          <div class="preview-grid">
            <div class="preview-item">
              <span class="preview-icon">📄</span>
              <span class="preview-title">HTML 核心</span>
              <span class="preview-time">0.5 小时</span>
              <span class="preview-desc">div/button/ul 等 Vue 模板必备标签</span>
            </div>
            <div class="preview-item">
              <span class="preview-icon">🎨</span>
              <span class="preview-title">CSS 核心</span>
              <span class="preview-time">0.5 小时</span>
              <span class="preview-desc">选择器、核心属性、Flex 布局</span>
            </div>
            <div class="preview-item highlight">
              <span class="preview-icon">⚡</span>
              <span class="preview-title">JS 核心（重点）</span>
              <span class="preview-time">2 小时</span>
              <span class="preview-desc">变量、对象、函数、数组、事件</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/learn/completion')
}
</script>

<style scoped>
.basics-course {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fdf9 0%, #e8f5e9 100%);
  padding: 40px 24px;
}

.course-header {
  text-align: center;
  max-width: 600px;
  margin: 0 auto 48px;
}

.back-btn {
  position: absolute;
  left: 24px;
  top: 24px;
  padding: 10px 20px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.course-title {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 12px;
}

.course-desc {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.course-content {
  max-width: 800px;
  margin: 0 auto;
}

.coming-soon {
  background: white;
  border-radius: 24px;
  padding: 48px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.coming-soon .icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.coming-soon h2 {
  font-size: 24px;
  color: #2c3e50;
  margin: 0 0 12px;
}

.coming-soon > p {
  font-size: 16px;
  color: #666;
  margin: 0 0 32px;
}

.course-preview {
  text-align: left;
  background: #f8f9fa;
  border-radius: 16px;
  padding: 24px;
}

.course-preview h3 {
  font-size: 16px;
  color: #333;
  margin: 0 0 16px;
}

.preview-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-item {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  grid-template-rows: auto auto;
  gap: 4px 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #eee;
}

.preview-item.highlight {
  border-color: #41b883;
  background: rgba(65, 184, 131, 0.05);
}

.preview-icon {
  grid-row: span 2;
  font-size: 24px;
  display: flex;
  align-items: center;
}

.preview-title {
  font-weight: 600;
  color: #333;
}

.preview-time {
  font-size: 13px;
  color: #41b883;
  font-weight: 600;
}

.preview-desc {
  grid-column: 2 / 4;
  font-size: 13px;
  color: #666;
}

@media (max-width: 768px) {
  .back-btn {
    position: static;
    margin-bottom: 24px;
  }

  .course-title {
    font-size: 24px;
  }

  .coming-soon {
    padding: 32px 20px;
  }
}
</style>
