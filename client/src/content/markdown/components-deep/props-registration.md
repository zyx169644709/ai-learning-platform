# 组件注册与属性 Props

组件是 Vue 最核心的概念之一。通过组件，我们可以将界面拆分为独立、可复用的部分。

## 组件注册

### 全局注册
在 `main.js` 中使用 `.component()` 方法。

```javascript
import { createApp } from 'vue'
import MyComponent from './App.vue'

const app = createApp({})
app.component('MyComponent', MyComponent)
```

### 局部注册
在 SFC (单文件组件) 中直接导入即可使用。

```vue
<script setup>
import ComponentA from './ComponentA.vue'
</script>

<template>
  <ComponentA />
</template>
```

## Props (属性)

Props 是你可以在组件上注册的一些自定义 attribute。当一个值传递给一个 prop 时，它就变成了该组件实例上的一个属性。

### 声明 Props

使用 `defineProps()` 宏：

```vue
<script setup>
const props = defineProps({
  title: String,
  likes: Number
})

console.log(props.title)
</script>

<template>
  <h4>{{ title }}</h4>
</template>
```

### 传递 Props

```vue
<BlogPost title="My journey with Vue" />
<!-- 动态绑定 -->
<BlogPost :title="post.title" />
```

## 单向数据流

所有的 props 都遵循着**单向绑定**原则：props 因父组件更新而更新，但子组件不应该在内部修改 prop。
