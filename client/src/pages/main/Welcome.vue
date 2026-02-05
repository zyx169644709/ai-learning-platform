<template>
  <div class="welcome">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-left">
          <h1 class="brand">Vue.js 学习平台</h1>
          <h2 class="headline">掌握 Vue 现代化开发</h2>
          <p class="tagline">理论讲解 + 习题练习 + 实操项目 + 智能反馈，全方位系统掌握 Vue 3 生态系统</p>
          <div class="actions">
            <button class="btn btn-primary" @click="showLevelModal = true">快速开始 →</button>
          </div>
        </div>
        <div class="hero-right">
          <div class="vue-visual" aria-hidden="true">
            <div class="vue-orb"></div>
            <!-- Vue Logo Image -->
            <img src="@/assets/images/v.png" alt="Vue Logo" class="vue-logo-img">
            
            <!-- Animated Vue elements -->
            <div class="vue-element vue-reactive" style="--x:25%;--y:20%">
              <span>{{ }}</span>
            </div>
            <div class="vue-element vue-component" style="--x:75%;--y:25%">
              <span>&lt;/&gt;</span>
            </div>
            <div class="vue-element v-directive" style="--x:70%;--y:70%">
              <span>v-</span>
            </div>
            <div class="vue-element vue-data" style="--x:20%;--y:75%">
              <span>{}</span>
            </div>
            <!-- Orbits with Vue icons -->
            <div class="orbit o1">
              <span class="orbit-node vue-icon">V</span>
            </div>
            <div class="orbit o2">
              <span class="orbit-node vue-icon">U</span>
            </div>
            <div class="orbit o3">
              <span class="orbit-node vue-icon">E</span>
            </div>
            <!-- Decorative rings -->
            <div class="ring r1"></div>
            <div class="ring r2"></div>
            <div class="ring r3"></div>
            <!-- Particle effects -->
            <div class="particle p1"></div>
            <div class="particle p2"></div>
            <div class="particle p3"></div>
            <div class="particle p4"></div>
            <div class="particle p5"></div>
            <div class="particle p6"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Feature grid -->
    <section class="features">
      <div class="grid">
        <div class="card">
          <div class="card-icon">📖</div>
          <div class="card-title">理论学习</div>
          <div class="card-desc">Vue3基础 / Composition API / 响应式原理 / 组件通信，系统化掌握核心概念</div>
        </div>
        <div class="card">
          <div class="card-icon">✏️</div>
          <div class="card-title">习题练习</div>
          <div class="card-desc">精选编程题 + 选择题 + 填空题，巩固知识点，实时查看答案与解析</div>
        </div>
        <div class="card">
          <div class="card-icon">💻</div>
          <div class="card-title">实战项目</div>
          <div class="card-desc">从TodoList到完整SPA，真实项目驱动，在编码中提升Vue3开发技能</div>
        </div>
        <div class="card">
          <div class="card-icon">🤖</div>
          <div class="card-title">专家助教</div>
          <div class="card-desc">Vue 专家助教实时答疑，提供代码诊断与性能优化建议，攻克开发难点</div>
        </div>
        <div class="card">
          <div class="card-icon">🛠️</div>
          <div class="card-title">开发工具</div>
          <div class="card-desc">在线IDE + Vue DevTools教程 + Vite配置，打造高效开发环境</div>
        </div>
        <div class="card">
          <div class="card-icon">👥</div>
          <div class="card-title">学习社区</div>
          <div class="card-desc">交流学习心得，分享项目经验，参与代码review，共同成长进步</div>
        </div>
      </div>
    </section>

    <!-- Vue 水平选择模态框 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showLevelModal" class="modal-overlay" @click.self="showLevelModal = false">
          <div class="modal-container">
            <button class="modal-close" @click="showLevelModal = false">×</button>
            <div class="modal-header">
              <h2>选择你的起点</h2>
              <p>告诉我们你目前的水平，我们为你推荐最适合的学习路径</p>
            </div>
            <div class="modal-options">
              <div class="option-card" @click="handleLevelSelect('beginner')">
                <div class="option-icon">🌱</div>
                <div class="option-content">
                  <h3>我是纯新手</h3>
                  <p>完全不懂 HTML/CSS/JS，没听过 Vue</p>
                </div>
                <div class="option-arrow">→</div>
              </div>
              <div class="option-card" @click="handleLevelSelect('basic')">
                <div class="option-icon">💪</div>
                <div class="option-content">
                  <h3>我懂前端基础</h3>
                  <p>会 HTML/CSS/JS，想直接学 Vue</p>
                </div>
                <div class="option-arrow">→</div>
              </div>
              <div class="option-card" @click="handleLevelSelect('intermediate')">
                <div class="option-icon">🚀</div>
                <div class="option-content">
                  <h3>我了解一点 Vue</h3>
                  <p>学过 Vue 但没系统掌握</p>
                </div>
                <div class="option-arrow">→</div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showLevelModal = ref(false)

const handleLevelSelect = (level: 'beginner' | 'basic' | 'intermediate') => {
  showLevelModal.value = false
  
  switch (level) {
    case 'beginner':
      router.push('/learn/beginner')
      break
    case 'basic':
      router.push('/home')
      break
    case 'intermediate':
      router.push('/guide/review')
      break
  }
}
</script>

<style scoped>
.welcome {
  background: radial-gradient(1200px 600px at 70% 40%, rgba(66, 184, 131, 0.06), transparent 60%), var(--bg-primary);
  color: var(--text-primary);
  min-height: calc(100vh - 64px);
}

.hero {
  padding: 48px 240px 24px;
}

.hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: center;
  gap: 24px;
}

.brand {
  font-size: 56px;
  font-weight: 800;
  margin: 0 0 8px;
  color: var(--accent-color);
  letter-spacing: .5px;
}

.headline {
  font-size: 40px;
  font-weight: 800;
  margin: 0 0 12px;
}

.tagline {
  color: var(--text-secondary);
  margin: 0 0 20px;
  font-size: 16px;
}

.actions {
  display: flex;
  gap: 12px;
}

.btn {
  height: 40px;
  padding: 0 16px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-weight: 600;
}

.btn-primary {
  background: var(--accent-color);
  color: #fff;
  border-color: transparent;
}

.btn-primary:hover {
  background: var(--accent-hover);
  box-shadow: 0 10px 30px var(--shadow-hover);
}

.hero-right {
  display: flex;
  justify-content: center;
}

.vue-visual {
  position: relative;
  width: min(360px, 48vw);
  height: min(360px, 48vw);
}

.vue-orb {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(60% 60% at 50% 50%, rgba(65, 184, 131, .35), rgba(65, 184, 131, .12) 45%, transparent 60%),
    radial-gradient(120% 120% at 70% 30%, rgba(53, 73, 94, .5), transparent 60%),
    linear-gradient(145deg, #35495e 0%, #41b883 100%);
  filter: blur(1px) drop-shadow(0 20px 60px rgba(0, 0, 0, .25));
  box-shadow: inset 0 0 60px rgba(255, 255, 255, .08);
  animation: float 6s ease-in-out infinite;
}

/* Vue Logo Image */
.vue-logo-img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150px;
  height: 150px;
  filter: drop-shadow(0 0 20px rgba(65, 184, 131, 0.8));
  animation: logo-pulse 3s ease-in-out infinite;
  z-index: 2;
}

/* Vue elements floating around */
.vue-element {
  position: absolute;
  left: var(--x);
  top: var(--y);
  background: rgba(65, 184, 131, 0.15);
  border: 1px solid rgba(65, 184, 131, 0.4);
  border-radius: 8px;
  padding: 8px 12px;
  color: #41b883;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 14px;
  backdrop-filter: blur(5px);
  animation: float-element 8s ease-in-out infinite;
  box-shadow: 0 4px 15px rgba(65, 184, 131, 0.3);
}

.vue-element.vue-reactive {
  animation-delay: 0s;
}

.vue-element.vue-component {
  animation-delay: 2s;
}

.vue-element.v-directive {
  animation-delay: 4s;
}

.vue-element.vue-data {
  animation-delay: 6s;
}

/* Rings */
.ring {
  position: absolute;
  inset: 12%;
  border-radius: 50%;
  border: 1px dashed rgba(255, 255, 255, .15);
}

.ring.r2 {
  inset: 20%;
  opacity: .6;
}

.ring.r3 {
  inset: 28%;
  opacity: .4;
}

/* Orbits with Vue letters */
.orbit {
  position: absolute;
  inset: 6%;
  border-radius: 50%;
  border: 1px solid rgba(65, 184, 131, .2);
  animation: spin 12s linear infinite;
}

.orbit.o2 {
  inset: 16%;
  animation-duration: 18s;
}

.orbit.o3 {
  inset: 26%;
  animation-duration: 24s;
  border-color: rgba(65, 184, 131, .15);
}

.orbit-node {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #41b883, #35495e);
  box-shadow: 0 0 20px rgba(65, 184, 131, .9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.orbit-node.vue-icon {
  background: linear-gradient(135deg, #41b883, #35495e);
}

/* Particle effects */
.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #41b883;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(65, 184, 131, 0.8);
}

.particle.p1 {
  top: 20%;
  left: 10%;
  animation: twinkle 3s ease-in-out infinite;
}

.particle.p2 {
  top: 30%;
  right: 15%;
  animation: twinkle 3s ease-in-out infinite 0.5s;
}

.particle.p3 {
  bottom: 25%;
  right: 20%;
  animation: twinkle 3s ease-in-out infinite 1s;
}

.particle.p4 {
  bottom: 20%;
  left: 15%;
  animation: twinkle 3s ease-in-out infinite 1.5s;
}

.particle.p5 {
  top: 50%;
  left: 5%;
  animation: twinkle 3s ease-in-out infinite 2s;
}

.particle.p6 {
  top: 45%;
  right: 5%;
  animation: twinkle 3s ease-in-out infinite 2.5s;
}

/* Animations */
@keyframes float-element {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: .8;
  }
  50% {
    transform: translateY(-10px) scale(1.05);
    opacity: 1;
  }
}

@keyframes twinkle {
  0%, 100% {
    opacity: .3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.5);
  }
}

@keyframes logo-pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))
            drop-shadow(0 0 40px rgba(65, 184, 131, 0.5))
            drop-shadow(0 0 60px rgba(65, 184, 131, 0.3));
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    filter: drop-shadow(0 0 30px rgb(255, 255, 255))
            drop-shadow(0 0 60px rgba(65, 184, 131, 0.7))
            drop-shadow(0 0 90px rgba(65, 184, 131, 0.5));
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.dot {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #fff;
  border-radius: 50%;
  left: var(--x);
  top: var(--y);
  opacity: .9;
  box-shadow: 0 0 12px rgba(65, 184, 131, .8);
}

.dot::after {
  content: '';
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: rgba(65, 184, 131, .18);
  filter: blur(6px);
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0)
  }

  50% {
    transform: translateY(-8px)
  }
}

.features {
  padding: 12px 24px 48px;
}

.grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 18px;
  transition: transform .2s ease, box-shadow .2s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px var(--shadow-hover);
}

.card-icon {
  font-size: 22px;
  margin-bottom: 6px;
}

.card-title {
  font-weight: 700;
  margin-bottom: 6px;
}

.card-desc {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .hero-inner {
    grid-template-columns: 1fr;
    text-align: left;
  }

  .hero-right {
    order: -1;
  }
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .brand {
    font-size: 42px;
  }

  .headline {
    font-size: 28px;
  }
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-container {
  position: relative;
  width: 100%;
  max-width: 520px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-tertiary);
  border-radius: 50%;
  font-size: 20px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.modal-header {
  text-align: center;
  margin-bottom: 28px;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.modal-header p {
  font-size: 14px;
  color: var(--text-secondary);
}

.modal-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--bg-tertiary);
  border: 2px solid transparent;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.option-card:hover {
  border-color: #41b883;
  background: rgba(65, 184, 131, 0.08);
  transform: translateX(4px);
}

.option-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.option-content {
  flex: 1;
}

.option-content h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.option-content p {
  font-size: 13px;
  color: var(--text-secondary);
}

.option-arrow {
  font-size: 20px;
  color: var(--text-tertiary);
  transition: all 0.2s ease;
}

.option-card:hover .option-arrow {
  color: #41b883;
  transform: translateX(4px);
}

/* 模态框动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(20px);
}

@media (max-width: 480px) {
  .modal-container {
    padding: 24px 20px;
  }
  
  .modal-header h2 {
    font-size: 20px;
  }
  
  .option-card {
    padding: 16px;
  }
  
  .option-icon {
    font-size: 28px;
  }
  
  .option-content h3 {
    font-size: 16px;
  }
}
</style>
