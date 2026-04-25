<template>
  <div id="app">
    <Header />
    <component :is="currentLayout">
      <router-view />
    </component>
    <!-- 浮动AI聊天助手 -->
    <AiChatWidget />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/common/Header.vue'
import AiChatWidget from './components/common/AiChatWidget.vue'
import DefaultLayout from './layouts/DefaultLayout.vue'
import CourseLayout from './layouts/CourseLayout.vue'
import ResourceLayout from './layouts/ResourceLayout.vue'
import AuthLayout from './layouts/AuthLayout.vue'
import CommunityLayout from './layouts/CommunityLayout.vue'

const route = useRoute()

const layoutMap: Record<string, any> = {
  default: DefaultLayout,
  course: CourseLayout,
  resource: ResourceLayout,
  auth: AuthLayout,
  community: CommunityLayout,
}

const currentLayout = computed(() => layoutMap[route.meta?.layout as string] ?? DefaultLayout)
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

/* 响应式设计：中间内容优先，小屏幕隐藏两侧 */
@media (max-width: 1200px) {
  .main-content {
    right: 0;
  }
  .ai-panel {
    display: none;
  }
}

@media (max-width: 900px) {
  .main-content {
    left: 0;
    right: 0;
  }
  #app > aside.sidebar {
    display: none !important;
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