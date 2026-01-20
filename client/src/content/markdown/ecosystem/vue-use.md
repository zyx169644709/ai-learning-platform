# VueUse 常用库推荐

VueUse 是一个基于组合式 API 的实用工具函数集合。它包含了一系列高质量的工具函数，涵盖了状态、浏览器、感应器、网络、动画等多个方面。

## 为什么使用 VueUse？

- **易于使用**：即插即用，函数式编程风格。
- **类型安全**：使用 TypeScript 编写，提供完美的类型支持。
- **广泛覆盖**：包含了超过 200 个实用的组合式函数。
- **响应式**：所有的工具函数都与 Vue 的响应式系统紧密结合。

## 安装

```bash
npm i @vueuse/core
```

## 常用工具函数示例

### 1. useLocalStorage
自动将状态同步到 localStorage。

```javascript
import { useLocalStorage } from '@vueuse/core'

const state = useLocalStorage('my-storage', {
  name: 'Apple',
  color: 'red',
})
```

### 2. useMouse
实时追踪鼠标位置。

```javascript
import { useMouse } from '@vueuse/core'

const { x, y } = useMouse()
```

### 3. useFetch
简洁的响应式网络请求。

```javascript
import { useFetch } from '@vueuse/core'

const { isFetching, error, data } = useFetch(url).get().json()
```

### 4. useDark
轻松实现暗黑模式切换。

```javascript
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
```

## 更多资源
访问 [VueUse 官方网站](https://vueuse.org/) 查看完整文档和所有可用的函数。
