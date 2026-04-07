<template>
  <div class="layout-resource">
    <CatalogSidebar 
      v-if="!route.meta.hideLeftSidebar"
      :categories="categoriesWithResources"
      route-name="ResourceDetail"
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
import { useRoute, useRouter } from 'vue-router'
import AiPanel from '@/components/common/AiPanel.vue'
import CatalogSidebar from '@/components/common/CatalogSidebar.vue'
import { RESOURCE_CATEGORY_OPTIONS, type ResourceCategoryKey } from '../../../shared/constants/resourceCategories'

interface ApiResource {
  id: string
  title: string
  category?: ResourceCategoryKey
  type?: string
}

const route = useRoute()
const router = useRouter()

const resources = ref<ApiResource[]>([])

const categoriesWithResources = computed(() => {
  return RESOURCE_CATEGORY_OPTIONS.map(category => ({
    key: category.key,
    label: category.label,
    items: resources.value.filter(item => item.category === category.key)
  }))
})

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/resources?status=published&limit=100')
    const result = await res.json()
    const items = result.success ? result.data.items : (Array.isArray(result) ? result : [])
    resources.value = Array.isArray(items) ? items : []
  } catch (error) {
    console.error('加载资源侧栏列表失败', error)
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
