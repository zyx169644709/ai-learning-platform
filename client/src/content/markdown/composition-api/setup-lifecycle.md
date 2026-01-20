# Setup 函数与生命周期钩子

## setup()

`setup()` 钩子是在组件中使用组合式 API 的入口。

- **调用时间**：在组件实例创建之前，`props` 被解析之后立即调用。
- **返回值**：返回的对象中的属性将被暴露给模板。

```javascript
export default {
  setup(props, context) {
    // 逻辑...
    return {
      // 暴露给模板
    }
  }
}
```

### <script setup>

推荐使用 `<script setup>` 语法糖，它更简洁且有更好的运行时性能。

```vue
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <button @click="count++">{{ count }}</button>
</template>
```

## 生命周期钩子

组合式 API 中的生命周期钩子以 `on` 开头。

- `onMounted()`: 组件挂载完成后调用。
- `onUpdated()`: 组件由于响应式状态变更而更新其 DOM 树之后调用。
- `onUnmounted()`: 组件实例被卸载之后调用。
- `onBeforeMount()` / `onBeforeUpdate()` / `onBeforeUnmount()`

```javascript
import { onMounted } from 'vue'

onMounted(() => {
  console.log('组件已挂载！')
})
```
