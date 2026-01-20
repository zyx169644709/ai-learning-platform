# 异步组件与 Teleport

## 异步组件 (Async Components)

在大型应用中，我们可能需要将应用分割成更小的块，并且只在需要时才从服务器加载组件。

### 基本用法

使用 `defineAsyncComponent`：

```javascript
import { defineAsyncComponent } from 'vue'

const AsyncComp = defineAsyncComponent(() => {
  return new Promise((resolve, reject) => {
    // ...从服务器获取组件
    resolve(/* 获取到的组件 */)
  })
})
```

搭配 Vite/Webpack 的动态导入：

```javascript
const AsyncComp = defineAsyncComponent(() =>
  import('./components/MyComponent.vue')
)
```

## Teleport (传送门)

`Teleport` 是一个内置组件，它可以将一个组件内部的一部分模板“传送”到该组件的 DOM 结构外层（甚至是 body 下）。

### 示例：模态框

```vue
<button @click="open = true">打开模态框</button>

<Teleport to="body">
  <div v-if="open" class="modal">
    <p>这是一个模态框！</p>
    <button @click="open = false">关闭</button>
  </div>
</Teleport>
```

### 为什么使用 Teleport？

- **层级问题**：解决 z-index 或父元素 `overflow: hidden` 导致的样式截断问题。
- **DOM 结构**：保持组件逻辑在一起的同时，让 DOM 结构更符合语义（如弹窗挂载在 body 根部）。
