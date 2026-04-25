<template>
  <div class="layout-community">
    <CatalogSidebar
      v-if="!route.meta.hideLeftSidebar"
      :categories="categoriesWithDiscussions"
      route-name="DiscussionDetail"
      route-param-key="id"
    />

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
import { useRoute } from 'vue-router'
import AiPanel from '@/components/common/AiPanel.vue'
import CatalogSidebar from '@/components/common/CatalogSidebar.vue'

const COMMUNITY_CATEGORIES = [
  { key: 'tech',       label: '💻 技术讨论' },
  { key: 'experience', label: '📖 学习心得' },
  { key: 'project',    label: '🚀 项目分享' },
  { key: 'help',       label: '🙋 问题求助' },
]

interface ApiDiscussion {
  id: string
  title: string
  category: string
}

const route = useRoute()
const discussions = ref<ApiDiscussion[]>([])

const categoriesWithDiscussions = computed(() =>
  COMMUNITY_CATEGORIES.map(cat => ({
    key: cat.key,
    label: cat.label,
    items: discussions.value
      .filter(d => d.category === cat.key)
      .map(d => ({ id: d.id, title: d.title }))
  }))
)

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/community')
    const data = await res.json()
    discussions.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('加载社区侧栏失败', error)
  }
})
</script>

<style scoped>
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
  .main-content {
    left: 0;
    right: 0;
  }
}
</style>
