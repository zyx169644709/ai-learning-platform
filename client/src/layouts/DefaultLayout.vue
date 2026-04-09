<template>
  <div class="layout-default">
    <Sidebar v-if="!route.meta.hideLeftSidebar && !quizOpen" />
    <AiPanel v-if="!route.meta.hideRightSidebar" />

    <main :class="[
      'main-content',
      {
        'no-left': route.meta.hideLeftSidebar || quizOpen,
        'no-right': route.meta.hideRightSidebar,
        'full-width': route.meta.topOnly || route.meta.fullScreen,
      }
    ]">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import Sidebar from '@/components/common/Sidebar.vue'
import AiPanel from '@/components/common/AiPanel.vue'
import { useQuizState } from '@/composables/useQuizState'

const route = useRoute()
const { quizOpen } = useQuizState()
</script>
