<template>
  <aside class="sidebar">
    <div class="sidebar-content">
      <div class="mode-pref">
        <span class="pref-label">目录栏风格偏好</span>
        <button class="pref-pill" @click="toggleMode" :aria-pressed="!prefs.sidebarDefaultExpanded">
          <span class="pref-left" :class="{ active: prefs.sidebarDefaultExpanded }">传统式</span>
          <span class="pref-switch" :class="{ on: !prefs.sidebarDefaultExpanded }">
            <span class="knob"></span>
          </span>
          <span class="pref-right" :class="{ active: !prefs.sidebarDefaultExpanded }">折叠式</span>

        </button>
      </div>
      <ul class="chapter-list">
        <component :is="currentItemComponent" v-for="(chapter, index) in chapters" :key="index" :chapter="chapter" />
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ChapterItem from './ChapterItem.vue'
import ChapterItemCollapsible from './ChapterItemCollapsible.vue'
import { chapters as toc } from '@/content/chapters'
import { useUserPrefs } from '@/stores/userPrefs'

const chapters = computed(() => toc)
const prefs = useUserPrefs()
const currentItemComponent = computed(() => prefs.sidebarDefaultExpanded ? ChapterItem : ChapterItemCollapsible)
const toggleMode = () => prefs.setSidebarDefaultExpanded(!prefs.sidebarDefaultExpanded)
</script>

<style scoped>
.sidebar {
  width: 320px;
  background: var(--bg-primary);
  /* 去除右侧边框以匹配文档式目录 */
  border-right: none;
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1001;
  padding-top: 64px;
}

.mode-pref {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 24px 28px 16px 28px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  padding-bottom: 12px;
}
.pref-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom:12px;
  
}
.pref-pill {
  width: 80%;
  height: 50px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color, #e5e7eb);
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.pref-left {
  color: var(--text-secondary);
}

.pref-right {
  color: var(--text-secondary);
}

.pref-right.active,
.pref-left.active {
  color: var(--text-primary);
  font-weight: 600;
}

.pref-switch {
  position: relative;
  width: 34px;
  height: 18px;
  border-radius: 999px;
  background: #e5e7eb;
  transition: background 0.2s ease;
}

.pref-switch .knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.12);
  transition: left 0.2s ease;
}

.pref-switch.on {
  background: var(--accent-color, #10b981);
}

.pref-switch.on .knob {
  left: 18px;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.chapter-list {
  padding: 16px 24px;
  margin: 0;
}
</style>