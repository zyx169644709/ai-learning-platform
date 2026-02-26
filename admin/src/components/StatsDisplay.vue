<template>
  <!-- Popover 模式：用于表格行内按钮触发 -->
  <el-popover
    v-if="mode === 'popover'"
    placement="top"
    :width="popoverWidth"
    trigger="click"
  >
    <template #reference>
      <el-button type="info" link>统计</el-button>
    </template>
    <div class="stats-popover">
      <div v-for="item in items" :key="item.label" class="stat-row">
        <span class="stat-label">{{ item.label }}</span>
        <strong class="stat-value">{{ item.value ?? 0 }}</strong>
      </div>
    </div>
  </el-popover>

  <!-- Dialog 模式：用于独立弹窗展示 -->
  <template v-else-if="mode === 'dialog'">
    <el-button type="warning" link @click="visible = true">统计</el-button>
    <Teleport to="body">
      <el-dialog v-model="visible" :title="title" :width="dialogWidth" destroy-on-close>
        <div :class="['stats-grid', `cols-${gridCols}`]">
          <div v-for="item in items" :key="item.label" class="stats-card">
            <div class="stats-card-value">{{ item.value ?? 0 }}</div>
            <div class="stats-card-label">{{ item.label }}</div>
          </div>
        </div>
        <template #footer></template>
      </el-dialog>
    </Teleport>
  </template>

  <!-- Inline 模式：直接渲染在页面中（不附带触发按钮） -->
  <div v-else-if="mode === 'inline'" :class="['stats-grid', `cols-${gridCols}`]">
    <div v-for="item in items" :key="item.label" class="stats-card">
      <div class="stats-card-value">{{ item.value ?? 0 }}</div>
      <div class="stats-card-label">{{ item.label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface StatItem {
  label: string
  value: string | number | null | undefined
}

const props = withDefaults(defineProps<{
  items: StatItem[]
  mode?: 'popover' | 'dialog' | 'inline'
  title?: string
}>(), {
  mode: 'popover',
  title: '统计数据'
})

const visible = ref(false)

const gridCols = computed(() => {
  const count = props.items.length
  if (count <= 2) return 2
  if (count === 4) return 2
  return 3
})

const popoverWidth = computed(() => {
  return props.items.length <= 3 ? 160 : 220
})

const dialogWidth = computed(() => {
  const count = props.items.length
  if (count <= 2) return '320px'
  if (count <= 3) return '420px'
  return '520px'
})
</script>

<style scoped>
/* Popover 模式样式 */
.stats-popover {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px 0;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 13px;
  color: #606266;
}

.stat-value {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

</style>

<style>
/* Dialog / Inline 模式样式（非 scoped，兼容 Teleport） */
.stats-grid {
  display: grid;
  gap: 16px;
  padding: 8px 0 4px;
}

.stats-grid.cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.stats-grid.cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.stats-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  text-align: center;
}

.stats-card-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--el-color-primary);
  line-height: 1;
}

.stats-card-label {
  font-size: 13px;
  color: var(--el-text-color-regular);
}
</style>
