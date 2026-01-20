# Vue 性能分析工具

为了让你的 Vue 应用运行得更流畅，Vue 生态提供了一些强大的性能分析工具。

## Vue DevTools

Vue DevTools 是开发 Vue 应用时必备的浏览器扩展。

- **组件树查看**：检查组件状态、Props 和事件。
- **性能时间轴 (Timeline)**：记录组件的挂载、渲染时间以及补丁 (patch) 过程。
- **状态快照**：追踪 Pinia/Vuex 状态的变化。

## 性能追踪 API

在 Vue 3 中，你可以利用开发环境下的 `performance` 追踪功能。

```javascript
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.config.performance = true // 开启后，在 Chrome DevTools 的 Performance 面板中可以看到组件层级的耗时
app.mount('#app')
```

## 常见的优化点

1.  **减少不必要的响应式开销**：对于巨大的静态列表，可以使用 `shallowRef` 或 `shallowReactive`。
2.  **避免深层组件透传 Props**：使用 `Provide/Inject` 或 Pinia。
3.  **合理使用 v-show 与 v-if**：频繁切换显示状态时使用 `v-show`。
4.  **长列表性能优化**：使用虚拟滚动库（如 `vue-virtual-scroller`）。
