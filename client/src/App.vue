<template>
  <div id="app">
    <Header />
    <Sidebar v-if="!route.meta.hideLeftSidebar" />
    <AiPanel v-if="!route.meta.hideRightSidebar" />
    <main :class="[
      'main-content',
      { 'full-width': !showSidebars, 'no-left': route.meta.hideLeftSidebar, 'no-right': route.meta.hideRightSidebar }
    ]">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import Header from './components/common/Header.vue'
import Sidebar from './components/common/Sidebar.vue'
import AiPanel from './components/common/AiPanel.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const showSidebars = computed(() => !route.meta?.topOnly && !route.meta?.fullScreen)
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
}

.main-content {
  position: absolute;
  top: 64px;
  left: 300px;
  right: 280px;
  bottom: 0;
  padding: 0;
  background: var(--bg-primary);
  overflow-y: auto;
  box-sizing: border-box;
}

.main-content.full-width {
  left: 0;
  right: 0;
}

.main-content.no-left { left: 0; }
.main-content.no-right { right: 0; }

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    right: 280px;
  }
}

@media (max-width: 768px) {
  .main-content {
    right: 240px;
  }
}

@media (max-width: 600px) {
  .main-content {
    right: 200px;
  }
}

/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
}
</style>