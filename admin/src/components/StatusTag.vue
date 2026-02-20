<template>
  <el-tag :type="tagType" :size="size">
    {{ label }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: string
  typeMap?: Record<string, string>
  labelMap?: Record<string, string>
  size?: 'large' | 'default' | 'small'
}

const props = withDefaults(defineProps<Props>(), {
  typeMap: () => ({}),
  labelMap: () => ({}),
  size: 'default'
})

const tagType = computed(() => {
  return props.typeMap[props.value] || 'info'
})

const label = computed(() => {
  return props.labelMap[props.value] || props.value
})
</script>
