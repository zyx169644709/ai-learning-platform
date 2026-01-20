# 代码分割与懒加载

在构建大型 Vue 应用时，将所有 JavaScript 资源打包进一个大文件中会导致初次加载速度缓慢。代码分割 (Code Splitting) 允许我们将代码拆分成更小的块，并按需加载。

## 路由懒加载

Vue Router 支持开箱即用的动态导入，这是实现代码分割最常用的方式。

```javascript
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/about',
      name: 'about',
      // 该组件只有在访问 /about 路由时才会被加载
      component: () => import('./views/AboutView.vue')
    }
  ]
})
```

## 异步组件

对于非路由组件，我们可以使用 `defineAsyncComponent`：

```javascript
import { defineAsyncComponent } from 'vue'

const AsyncModal = defineAsyncComponent(() =>
  import('./components/MyModal.vue')
)
```

## Vite 中的分包策略

Vite (基于 Rollup) 允许你通过 `vite.config.ts` 自定义打包策略：

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-utils': ['axios', 'lodash-es']
        }
      }
    }
  }
})
```

## 优势

- **更快的首屏加载**：减少了用户首次进入页面需要下载的资源量。
- **更优的缓存**：更新业务代码时，第三方库 (vendor) 的缓存依然有效。
