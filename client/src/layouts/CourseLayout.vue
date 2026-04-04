<template>
  <div class="layout-course">
    <CatalogSidebar 
      v-if="!route.meta.hideLeftSidebar"
      :categories="categoriesWithCourses"
      route-name="CourseDetail"
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
import { COURSE_CATEGORY_OPTIONS, inferCourseCategory, type CourseCategoryKey } from '../../../shared/constants/courseCategories'

interface ApiCourse {
  id: string
  title: string
  level?: string
  category?: CourseCategoryKey
  tags?: unknown
}

const route = useRoute()
const router = useRouter()

const courses = ref<ApiCourse[]>([])

const categoriesWithCourses = computed(() => {
  return COURSE_CATEGORY_OPTIONS.map(category => ({
    key: category.key,
    label: category.label,
    items: courses.value.filter(item => {
      const cat = item.category || inferCourseCategory({ title: item.title, level: item.level, tags: item.tags })
      return cat === category.key
    })
  }))
})

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/courses')
    const data: ApiCourse[] = await res.json()
    courses.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('加载课程侧边栏列表失败', error)
  }
})
</script>

<style scoped>
.main-content {
  left: 320px;
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
