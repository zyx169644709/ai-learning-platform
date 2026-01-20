# 逻辑复用：Composables (组合式函数)

在 Vue 3 中，“组合式函数” (Composables) 是利用组合式 API 将组件逻辑提取到可复用的函数中的方法。

## 什么是组合式函数？

简单来说，组合式函数就是一个利用 Vue 的组合式 API 来封装和复用**状态逻辑**的函数。

### 示例：追踪鼠标位置

```javascript
// useMouse.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
```

## 在组件中使用

```vue
<script setup>
import { useMouse } from './useMouse.js'

const { x, y } = useMouse()
</script>

<template>
  Mouse position is at: {{ x }}, {{ y }}
</template>
```

## 为什么使用 Composables？

1.  **逻辑组织**：将相关逻辑聚集在一起，而不是分散在生命周期钩子中。
2.  **更好的逻辑复用**：相比于 Mixins，Composables 来源清晰且没有命名空间冲突。
3.  **类型推导**：对 TypeScript 非常友好。

## 最佳实践

- 命名约定：以 `use` 开头（如 `useFetch`, `useAuth`）。
- 接收响应式参数：可以使用 `unref()` 或 `toValue()` 处理可能的 ref 参数。
- 返回响应式状态：通常返回一个包含多个 ref 的对象，方便解构。
