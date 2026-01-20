# 计算属性与侦听器

在 Vue 3 中，`computed` 和 `watch` 是处理响应式数据逻辑的两个重要工具。

## 计算属性 (Computed)

计算属性用于根据现有响应式数据派生出新的数据。它们具有**缓存性**：只有当依赖的响应式数据发生变化时，它们才会重新计算。

```javascript
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`
})
```

在模板中使用：
```vue
<p>Full Name: {{ fullName }}</p>
```

## 侦听器 (Watch)

`watch` 用于在响应式数据发生变化时执行**副作用**（如异步操作、修改 DOM 等）。

```javascript
import { ref, watch } from 'vue'

const question = ref('')

watch(question, (newVal, oldVal) => {
  if (newVal.includes('?')) {
    console.log('Detected a question!')
  }
})
```

## watchEffect

`watchEffect` 会立即执行一次，并自动追踪其内部使用的所有响应式数据。

```javascript
import { ref, watchEffect } from 'vue'

const count = ref(0)

watchEffect(() => {
  console.log(`Count changed to: ${count.value}`)
})
```

## 如何选择？

- **使用 Computed**：当你需要一个值，且该值依赖于其他响应式数据时。
- **使用 Watch**：当你需要在数据变化时执行某些逻辑（如发送 API 请求）时。
