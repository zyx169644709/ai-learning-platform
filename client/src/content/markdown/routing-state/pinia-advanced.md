# Pinia 进阶：插件与持久化

## Pinia 插件

Pinia Store 可以通过插件进行扩展。插件可以添加新的属性、添加全局副作用、增加新的方法等。

### 定义插件

```javascript
export function myPiniaPlugin(context) {
  // context.pinia: 使用 createApp() 创建的 pinia
  // context.app: 使用 createApp() 创建的当前应用
  // context.store: 插件正在扩展的 store
  // context.options: 定义传给 defineStore() 的 options 对象
  
  return { hello: 'world' } // 这里的返回值会合并到 store 中
}
```

### 使用插件

```javascript
import { createPinia } from 'pinia'
const pinia = createPinia()
pinia.use(myPiniaPlugin)
```

## 状态持久化

在实际开发中，我们通常需要将 Store 中的某些数据（如用户信息、Token、用户偏好设置）保存到 `localStorage` 中，防止页面刷新后数据丢失。

### 使用 pinia-plugin-persistedstate

这是社区最流行的持久化插件。

1. **安装**：
```bash
npm install pinia-plugin-persistedstate
```

2. **配置**：
```javascript
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
```

3. **在 Store 中开启**：
```javascript
export const useUserStore = defineStore('user', {
  state: () => ({ name: 'John' }),
  persist: true, // 开启持久化
})
```
