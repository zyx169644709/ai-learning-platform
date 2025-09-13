<template>
  <div class="welcome">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-left">
          <h1 class="brand">AI Learning</h1>
          <h2 class="headline">AI 教学与实战平台</h2>
          <p class="tagline">系统课程 · 项目实战 · 智能助教，快速掌握大模型时代的核心能力</p>
          <div class="actions">
            <RouterLink to="/home" class="btn btn-primary">开始学习 →</RouterLink>
            <RouterLink to="/api/deepseek" class="btn btn-ghost">试用智能助教</RouterLink>
          </div>
        </div>
        <div class="hero-right">
          <div class="ai-visual" aria-hidden="true">
            <div class="ai-orb"></div>
            <span class="dot" style="--x:20%;--y:25%"></span>
            <span class="dot" style="--x:78%;--y:30%"></span>
            <span class="dot" style="--x:65%;--y:10%"></span>
            <span class="dot" style="--x:30%;--y:85%"></span>
            <!-- AI themed elements inside the orb -->
            <div class="ring r1"></div>
            <div class="ring r2"></div>
            <div class="ring r3"></div>
            <div class="orbit o1"><span class="orbit-node"></span></div>
            <div class="orbit o2"><span class="orbit-node"></span></div>
            <svg class="neural" viewBox="0 0 100 100" preserveAspectRatio="none">
              <!-- 使用连线绘制 'A' 与 'I' -->
              <g class="edges" stroke-width="1.2" stroke-linecap="round">
                <!-- A -->
                <line x1="22" y1="72" x2="35" y2="20" />
                <line x1="35" y1="20" x2="48" y2="72" />
                <line x1="27" y1="45" x2="43" y2="45" />
                <!-- I -->
                <line x1="62" y1="20" x2="78" y2="20" />
                <line x1="70" y1="20" x2="70" y2="72" />
                <line x1="62" y1="72" x2="78" y2="72" />
              </g>
              <g class="nodes" fill="currentColor">
                <!-- A nodes -->
                <circle cx="22" cy="72" r="1.8" />
                <circle cx="35" cy="20" r="1.8" />
                <circle cx="48" cy="72" r="1.8" />
                <circle cx="27" cy="45" r="1.6" />
                <circle cx="43" cy="45" r="1.6" />
                <!-- I nodes -->
                <circle cx="62" cy="20" r="1.6" />
                <circle cx="78" cy="20" r="1.6" />
                <circle cx="70" cy="20" r="1.8" />
                <circle cx="70" cy="72" r="1.8" />
                <circle cx="62" cy="72" r="1.6" />
                <circle cx="78" cy="72" r="1.6" />
              </g>
            </svg>

          </div>
        </div>
      </div>
    </section>

    <!-- Feature grid -->
    <section class="features">
      <div class="grid">
        <div class="card">
          <div class="card-icon">🧭</div>
          <div class="card-title">学习路径</div>
          <div class="card-desc">AI 入门 / 数学基础 / 机器学习 / 深度学习 ，打造独属于你的学习计划</div>
        </div>
        <div class="card">
          <div class="card-icon">🤖</div>
          <div class="card-title">智能助教</div>
          <div class="card-desc">转为平台打造，难点即时提问，给出思路、示例代码与练习建议</div>
        </div>
        <div class="card">
          <div class="card-icon">🧠</div>
          <div class="card-title">代码分析</div>
          <div class="card-desc">内置多语种代码编译器，输入代码即刻获得解释、优化与调试建议，快速定位问题</div>
        </div>
        <div class="card">
          <div class="card-icon">📚</div>
          <div class="card-title">课程资源</div>
          <div class="card-desc">基于全栈的丰富课程资源，告别枯燥学习，找到适合教程，提升学习效率</div>
        </div>
        <div class="card">
          <div class="card-icon">🌐</div>
          <div class="card-title">资源社区</div>
          <div class="card-desc">整合多方面实用资源，详细汇总，高效查询，告别网上收集零碎资源</div>
        </div>
        <div class="card">
          <div class="card-icon">👥</div>
          <div class="card-title">社区讨论</div>
          <div class="card-desc">发帖看帖，实时了解最新资讯，交流心得与项目，共建优质资料库。</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
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

.btn-ghost:hover {
  background: rgba(66, 184, 131, 0.12);
}

.hero-right {
  display: flex;
  justify-content: center;
}

.ai-visual {
  position: relative;
  width: min(360px, 48vw);
  height: min(360px, 48vw);
}

.ai-orb {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(60% 60% at 50% 50%, rgba(66, 184, 131, .35), rgba(66, 184, 131, .12) 45%, transparent 60%),
    radial-gradient(120% 120% at 70% 30%, rgba(53, 73, 94, .5), transparent 60%),
    linear-gradient(145deg, #35495e 0%, #41b883 100%);
  filter: blur(1px) drop-shadow(0 20px 60px rgba(0, 0, 0, .25));
  box-shadow: inset 0 0 60px rgba(255, 255, 255, .08);
  animation: float 6s ease-in-out infinite;
}

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

.orbit {
  position: absolute;
  inset: 6%;
  border-radius: 50%;
  border: 1px solid rgba(66, 184, 131, .2);
  animation: spin 12s linear infinite;
}

.orbit.o2 {
  inset: 16%;
  animation-duration: 18s;
}

.orbit-node {
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #41b883;
  box-shadow: 0 0 10px rgba(65, 184, 131, .9);
}

.neural {
  position: absolute;
  inset: 10%;
  color: #cfeee0;
  opacity: .9;
  mix-blend-mode: screen;
}

.neural .edges {
  stroke: rgba(65, 184, 131, .45);
}

.neural .nodes {
  color: #90dfbf;
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
  box-shadow: 0 0 12px rgba(66, 184, 131, .8);
}

.dot::after {
  content: '';
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: rgba(66, 184, 131, .18);
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
</style>
