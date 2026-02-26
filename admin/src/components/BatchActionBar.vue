<template>
  <Transition name="batch-bar">
    <div class="batch-actions" v-if="count > 0">
      <div class="batch-left">
        <el-icon><Check /></el-icon>
        <span v-if="description">{{ description }}</span>
        <span v-else>已选择 <strong>{{ count }}</strong> 个{{ label }}</span>
      </div>
      <div class="batch-right">
        <slot />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { Check } from '@element-plus/icons-vue'

defineProps<{
  count: number
  label?: string
  description?: string
}>()
</script>

<style scoped>
.batch-actions {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 32px;
  background: #1d2939;
  color: #e5eaf3;
  font-size: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.batch-left {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e5eaf3;
}

.batch-left strong {
  color: #fff;
  font-size: 16px;
}

.batch-left .el-icon {
  font-size: 18px;
  color: #67c23a;
}

.batch-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.batch-bar-enter-active,
.batch-bar-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.batch-bar-enter-from,
.batch-bar-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
