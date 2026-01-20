# Vue Router 4 基础配置

Vue Router 是 Vue.js 的官方路由。它与 Vue.js 核心深度集成，让用 Vue.js 构建单页应用变得轻而易举。

## 安装与初始化

首先安装 `vue-router`：

```bash
npm install vue-router@4
```

## 基础配置

创建一个 `router/index.js` 文件：

```javascript
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // 路由懒加载
      component: () => import('../views/AboutView.vue')
    }
  ]
})

export default router
```

## 在应用中使用

在 `main.js` 中挂载路由：

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

## 导航

使用 `<RouterLink>` 进行导航，使用 `<RouterView>` 渲染匹配到的组件。

```vue
<template>
  <nav>
    <RouterLink to="/">首页</RouterLink>
    <RouterLink to="/about">关于</RouterLink>
  </nav>

  <main>
    <RouterView />
  </main>
</template>
```
