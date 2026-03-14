<template>
  <div class="basics-course">
    <div class="course-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h1 class="course-title">📚 Vue 核心基础课</h1>
      <p class="course-desc">只学 Vue 必备的 20% 基础知识，3 小时搞定</p>
    </div>

    <div class="course-content">
      <div class="course-list">
        <h2 class="list-title">� 选择课程开始学习</h2>
        <p class="list-desc">点击课程卡片进入学习，建议按顺序学习</p>
        
        <div class="course-grid">
          <!-- HTML 课程 -->
          <div class="course-card" @click="goToCourse('html')">
            <div class="card-icon">📄</div>
            <div class="card-content">
              <h3 class="card-title">HTML 核心</h3>
              <p class="card-time">⏱️ 0.5 小时</p>
              <p class="card-desc">div/button/ul 等 Vue 模板必备标签</p>
              <div class="card-topics">
                <span class="topic-tag">div 标签</span>
                <span class="topic-tag">button 标签</span>
                <span class="topic-tag">列表标签</span>
              </div>
            </div>
            <div class="card-arrow">→</div>
          </div>

          <!-- CSS 课程 -->
          <div class="course-card" @click="goToCourse('css')">
            <div class="card-icon">🎨</div>
            <div class="card-content">
              <h3 class="card-title">CSS 核心</h3>
              <p class="card-time">⏱️ 0.5 小时</p>
              <p class="card-desc">选择器、核心属性、Flex 布局</p>
              <div class="card-topics">
                <span class="topic-tag">选择器</span>
                <span class="topic-tag">样式属性</span>
                <span class="topic-tag">布局</span>
              </div>
            </div>
            <div class="card-arrow">→</div>
          </div>

          <!-- JS 课程 -->
          <div class="course-card highlight" @click="goToCourse('js')">
            <div class="card-badge">重点推荐</div>
            <div class="card-icon">⚡</div>
            <div class="card-content">
              <h3 class="card-title">JS 核心（重点）</h3>
              <p class="card-time">⏱️ 2 小时</p>
              <p class="card-desc">变量、对象、函数、数组、事件</p>
              <div class="card-topics">
                <span class="topic-tag">变量</span>
                <span class="topic-tag">对象</span>
                <span class="topic-tag">函数</span>
                <span class="topic-tag">数组</span>
              </div>
            </div>
            <div class="card-arrow">→</div>
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

const goToCourse = (course: string) => {
  const routes: Record<string, string> = {
    html: '/learn/html-basics',
    css: '/learn/css-basics',
    js: '/learn/js-basics'
  }
  router.push(routes[course])
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
  max-width: 900px;
  margin: 0 auto;
}

.course-list {
  text-align: center;
}

.list-title {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px;
}

.list-desc {
  font-size: 15px;
  color: #666;
  margin: 0 0 32px;
}

.course-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.course-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  border: 2px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.course-card:hover {
  border-color: #41b883;
  box-shadow: 0 8px 24px rgba(65, 184, 131, 0.15);
  transform: translateY(-2px);
}

.course-card.highlight {
  border-color: #41b883;
  background: linear-gradient(135deg, rgba(65, 184, 131, 0.05) 0%, rgba(65, 184, 131, 0.02) 100%);
}

.course-card.highlight:hover {
  box-shadow: 0 12px 32px rgba(65, 184, 131, 0.25);
}

.card-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 12px;
  background: #41b883;
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
}

.card-icon {
  font-size: 48px;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px;
}

.card-time {
  font-size: 14px;
  color: #41b883;
  font-weight: 600;
  margin: 0 0 8px;
}

.card-desc {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px;
}

.card-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.topic-tag {
  padding: 4px 10px;
  background: #f0f0f0;
  color: #666;
  font-size: 12px;
  border-radius: 6px;
}

.card-arrow {
  font-size: 24px;
  color: #41b883;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.course-card:hover .card-arrow {
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .back-btn {
    position: static;
    margin-bottom: 24px;
  }

  .course-title {
    font-size: 24px;
  }

  .list-title {
    font-size: 20px;
  }

  .course-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
  }

  .card-icon {
    font-size: 36px;
  }

  .card-arrow {
    align-self: flex-end;
  }

  .card-badge {
    top: 8px;
    right: 8px;
    font-size: 11px;
    padding: 3px 10px;
  }
}
</style>
