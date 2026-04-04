<template>
  <div class="layout-resource">
    <aside v-if="!route.meta.hideLeftSidebar" class="resource-sidebar">
      <div class="sidebar-inner">
        <div class="filter-header">资源筛选</div>
        <div class="filter-actions">
          <button
            v-for="item in typeOptions"
            :key="item.value"
            class="filter-btn"
            :class="{ active: currentType === item.value }"
            @click="selectType(item.value)"
          >
            {{ item.label }}
          </button>
        </div>

        <div class="list-header">{{ currentTypeLabel }}（{{ visibleResources.length }}）</div>
        <ul class="item-list">
          <li v-for="resource in visibleResources" :key="resource.id">
            <router-link
              class="item-link"
              :class="{ active: String(route.params.id || '') === resource.id }"
              :to="{ name: 'ResourceDetail', params: { id: resource.id }, query: currentType ? { type: currentType } : {} }"
            >
              {{ resource.title }}
            </router-link>
          </li>
        </ul>
      </div>
    </aside>

    <AiPanel v-if="!route.meta.hideRightSidebar" />

    <main :class="[
      'main-content',
      {
        'no-left': route.meta.hideLeftSidebar,
        'no-right': route.meta.hideRightSidebar,
        'full-width': route.meta.topOnly || route.meta.fullScreen,
      }
    ]">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AiPanel from '@/components/common/AiPanel.vue'

interface ApiResource {
  id: string
  title: string
  type?: string
}

const route = useRoute()
const router = useRouter()

const resources = ref<ApiResource[]>([])

const typeOptions = [
  { value: '', label: '全部' },
  { value: 'website', label: '网站' },
  { value: 'document', label: '文档' },
  { value: 'tool', label: '工具' },
  { value: 'tutorial', label: '教程' },
]

const currentType = computed(() => (route.query.type as string) || '')
const currentTypeLabel = computed(() => typeOptions.find(i => i.value === currentType.value)?.label || '全部')

const visibleResources = computed(() => {
  if (!currentType.value) return resources.value
  return resources.value.filter(item => (item.type || '') === currentType.value)
})

const selectType = (type: string) => {
  const nextQuery = type ? { type } : {}
  if (route.name === 'ResourceDetail') {
    router.replace({ name: 'Resources', query: nextQuery })
    return
  }
  router.replace({ query: nextQuery })
}

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/resources?status=published')
    const result = await res.json()
    const items = result.success ? result.data.items : (Array.isArray(result) ? result : [])
    resources.value = Array.isArray(items) ? items : []
  } catch (error) {
    console.error('加载资源侧栏列表失败', error)
  }
})
</script>

<style scoped>
.resource-sidebar {
  width: 300px;
  background: var(--bg-primary);
  border-right: 1px solid var(--border-color);
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1001;
  padding-top: 64px;
}

.sidebar-inner {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
}

.filter-header,
.list-header {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.list-header {
  margin-top: 18px;
}

.filter-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.filter-btn {
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 8px;
  height: 34px;
  cursor: pointer;
}

.filter-btn.active {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: #fff;
  font-weight: 600;
}

.item-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-link {
  display: block;
  text-decoration: none;
  color: var(--text-primary);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 10px;
  font-size: 13px;
}

.item-link.active {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.main-content {
  left: 300px;
}

.main-content.no-left,
.main-content.full-width {
  left: 0;
}

.main-content.no-right,
.main-content.full-width {
  right: 0;
}

@media (max-width: 900px) {
  .resource-sidebar {
    display: none;
  }

  .main-content {
    left: 0;
    right: 0;
  }
}
</style>
