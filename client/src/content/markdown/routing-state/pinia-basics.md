# Pinia 状态管理入门

Pinia 是 Vue 的存储库，它允许您跨组件/页面共享状态。它支持 Vue 2 和 Vue 3，并且对 TypeScript 有着完美的兼容性。

## 为什么选择 Pinia？

- **简洁的 API**：相比 Vuex，没有了复杂的 Mutations，只有 State, Getters 和 Actions。
- **TypeScript 支持**：自动补全，无需复杂的类型声明。
- **轻量级**：体积非常小（约 1kb）。
- **开发者工具支持**：完美的 Vue DevTools 集成。

## 安装

```bash
npm install pinia
```

## 创建 Store

定义一个 Store：

```javascript
// stores/counter.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})
```

## 在组件中使用

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
</script>

<template>
  <div>
    <p>Count: {{ counter.count }}</p>
    <p>Double: {{ counter.doubleCount }}</p>
    <button @click="counter.increment()">Add</button>
  </div>
</template>
```
