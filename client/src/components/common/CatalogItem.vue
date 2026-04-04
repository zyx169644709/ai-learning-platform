<template>
  <li class="chapter-item">
    <div class="chapter-header">
      <span class="chapter-title">{{ category.label }}</span>
    </div>
    <div class="sub-chapters">
      <RouterLink 
        v-for="item in category.items || []" 
        :key="item.id"
        :class="['sub-chapter', { active: isActiveItem(item) }]"
        :to="buildRoute(item)"
      >
        <div class="section-content">
          <span class="section-title">{{ item.title }}</span>
        </div>
      </RouterLink>
    </div>
  </li>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

const props = defineProps<{
  category: {
    key: string
    label: string
    items?: any[]
  }
  routeName: string
  routeParamKey?: string
}>()

const route = useRoute()

const isActiveItem = (item: { id: string }) => {
  const paramKey = props.routeParamKey || 'id'
  return String(route.params[paramKey] || '') === item.id
}

const buildRoute = (item: { id: string }) => {
  const paramKey = props.routeParamKey || 'id'
  return { name: props.routeName, params: { [paramKey]: item.id } }
}
</script>

<style scoped>
.chapter-item {
  margin: 0 0 28px 0;
  list-style: none;
}

.chapter-item:last-child {
  border-bottom: none;
}

.chapter-header {
  display: flex;
  align-items: center;
  background: var(--bg-primary);
  padding: 0;
}

.chapter-title {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 16px;
  margin-bottom: 0;
}

.sub-chapters {
  margin-top: 8px;
  padding: 0;
  background: var(--bg-primary);
  font-size: 14px;
}

.sub-chapter {
  padding: 6px 0;
  color: var(--text-secondary);
  cursor: pointer;
  font-weight: 500;
  border-radius: 0;
  transition: all 0.2s ease;
  margin-bottom: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.sub-chapter.active {
  color: var(--accent-color);
  background: transparent;
  font-weight: 600;
}

.sub-chapter::before,
.sub-chapter::after {
  content: none !important;
}

.section-content {
  display: flex;
  align-items: center;
}

.section-title {
  flex: 1;
  line-height: 2.8;
}

.sub-chapter {
  text-decoration: none;
}

.sub-chapter:hover {
  text-decoration: none;
}

.sub-chapter:focus {
  text-decoration: none;
}

.sub-chapter:active {
  text-decoration: none;
}

@media (max-width: 768px) {
  .chapter-title {
    padding: 14px 16px;
    font-size: 13px;
  }

  .sub-chapters {
    padding: 0;
  }

  .sub-chapter {
    padding: 8px 16px;
  }
}
</style>
