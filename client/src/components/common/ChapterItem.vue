<template>
  <li class="chapter-item">
    <div class="chapter-header">
      <span class="chapter-title">{{ chapter.title }}</span>
    </div>
    <div class="sub-chapters">
      <RouterLink v-for="sec in chapter.children || []" :key="sec.id"
        :class="['sub-chapter', { active: isActiveSection(sec) }]"
        :to="{ path: `/chapter/${chapter.slug}/${sec.slug}` }">
        <div class="section-content">
          <span class="section-title">{{ sec.title }}</span>
        </div>
      </RouterLink>
    </div>
  </li>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useUserPrefs } from '@/stores/userPrefs'

const props = defineProps<{
  chapter: {
    id: string;
    title: string;
    slug: string;
    children?: any[]
  }
}>()

const prefs = useUserPrefs()
const isExpanded = ref(true)
const route = useRoute()

const isActiveChapter = computed(() => String(route.params.chapterSlug || '') === props.chapter.slug)

const isActiveSection = (sec: { slug: string }) => {
  return isActiveChapter.value && String(route.params.sectionSlug || '') === sec.slug
}

// 总是展开，不再响应点击折叠
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

/* 去除 RouterLink 的下划线 */
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

/* 去除动画，保持即时展开 */

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
