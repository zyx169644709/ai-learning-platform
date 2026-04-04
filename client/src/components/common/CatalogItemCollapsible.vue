<template>
  <li class="chapter-item">
    <button class="chapter-header" @click="toggle" :aria-expanded="isExpanded">
      <span class="chapter-title">{{ category.label }}</span>
      <span class="chevron" :class="{ open: isExpanded }">▸</span>
    </button>
    <div class="sub-chapters" v-show="isExpanded">
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
import { ref, computed, watch } from 'vue'
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
const isExpanded = ref(false)

const isActiveCategory = computed(() => {
  const paramKey = props.routeParamKey || 'id'
  const currentId = String(route.params[paramKey] || '')
  return props.category.items?.some(item => item.id === currentId) || false
})

watch(isActiveCategory, (active) => {
  if (active) isExpanded.value = true
}, { immediate: true })

const isActiveItem = (item: { id: string }) => {
  const paramKey = props.routeParamKey || 'id'
  return String(route.params[paramKey] || '') === item.id
}

const buildRoute = (item: { id: string }) => {
  const paramKey = props.routeParamKey || 'id'
  return { name: props.routeName, params: { [paramKey]: item.id } }
}

const toggle = () => { isExpanded.value = !isExpanded.value }
</script>

<style scoped>
.chapter-item {
  margin: 0 0 28px 0;
  list-style: none;
}

.chapter-header {
  display: flex;
  align-items: center;
  background: var(--bg-primary);
  padding: 0;
  width: 100%;
  border: none;
  text-align: left;
  cursor: pointer;
  gap: 8px;
}

.chevron {
  font-size: 16px;
  line-height: 1;
  transition: transform 0.5s ease;
  margin-left: auto;
  display: inline-block;
  color: var(--text-secondary);
}

.chevron.open {
  transform: rotate(90deg);
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
  text-decoration: none;
}

.sub-chapter.active {
  color: var(--accent-color);
  background: transparent;
  font-weight: 600;
}

.section-content {
  display: flex;
  align-items: center;
}

.section-title {
  flex: 1;
  line-height: 2.8;
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
