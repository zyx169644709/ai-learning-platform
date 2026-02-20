<template>
  <el-card class="filter-card">
    <el-form :model="modelValue" inline>
      <slot></slot>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <slot name="extra-buttons"></slot>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: Record<string, any>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, any>): void
  (e: 'search'): void
  (e: 'reset'): void
}>()

const handleSearch = () => {
  emit('search')
}

const handleReset = () => {
  emit('reset')
}
</script>

<style scoped>
.filter-card {
  margin-bottom: 20px;
}

.filter-card :deep(.el-form-item) {
  margin-bottom: 10px;
}

.filter-card :deep(.el-form-item:last-child) {
  margin-right: 0;
}
</style>
