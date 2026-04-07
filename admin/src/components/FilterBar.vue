<template>
  <el-card class="filter-card">
    <div class="filter-bar-row">
      <el-form :model="modelValue" inline class="filter-form">
        <slot></slot>
        <el-form-item style="margin-left: 30px;">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <div v-if="$slots['extra-buttons']" class="filter-extra">
        <slot name="extra-buttons"></slot>
      </div>
    </div>
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
  margin-bottom: 16px;
}

.filter-bar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-form {
  flex: 1;
  flex-wrap: wrap;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 8px;
}

.filter-extra {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
</style>
