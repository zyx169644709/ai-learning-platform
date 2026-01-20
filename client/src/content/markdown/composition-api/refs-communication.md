# Template Refs 与组件通信

## Template Refs (模板引用)

虽然 Vue 的声明式渲染模型为你处理了大部分 DOM 更新，但在某些情况下，你可能仍然需要直接访问底层 DOM 元素。

### 基本用法

```vue
<script setup>
import { ref, onMounted } from 'vue'

// 声明一个 ref 来存放该元素的引用
// 必须和模板里的 ref 同名
const input = ref(null)

onMounted(() => {
  input.value.focus()
})
</script>

<template>
  <input ref="input" />
</template>
```

## 组件通信方案

Vue 提供了多种方式让组件之间交换数据。

### 1. Props (父传子)
通过属性向下传递数据。

### 2. Emits (子传父)
通过自定义事件向上发送消息。

### 3. v-model (双向绑定)
在父子组件间同步状态。

### 4. Provide / Inject (跨级传递)
适用于深度嵌套的组件树。

### 5. Pinia (全局状态管理)
适用于多个不相关组件共享状态。

### 6. 暴露 API (defineExpose)
子组件可以通过 `defineExpose` 宏显式暴露其属性或方法给父组件。

```javascript
// 子组件
const count = ref(0)
defineExpose({ count })
```
