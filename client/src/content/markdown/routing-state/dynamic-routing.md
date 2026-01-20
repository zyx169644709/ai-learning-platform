# 动态路由与导航守卫

## 动态路由匹配

很多时候，我们需要将给定匹配模式的路由映射到同一个组件。

### 路径参数

```javascript
const routes = [
  // 动态字段以冒号开始
  { path: '/users/:id', component: User },
]
```

在组件中访问参数：
```vue
<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
console.log(route.params.id)
</script>
```

## 导航守卫

`vue-router` 提供的导航守卫主要用来通过跳转或取消的方式守卫导航。

### 全局前置守卫

```javascript
router.beforeEach((to, from) => {
  // 检查用户是否已登录
  if (!isAuthenticated && to.name !== 'Login') {
    return { name: 'Login' }
  }
})
```

### 组件内守卫

```javascript
import { onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router'

onBeforeRouteLeave((to, from) => {
  const answer = window.confirm('你确定要离开吗？')
  if (!answer) return false
})
```
