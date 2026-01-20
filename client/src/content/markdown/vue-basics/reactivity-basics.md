# 响应式基础：ref 与 reactive

在 Vue 3 中，响应式系统是核心。它允许 Vue 自动追踪数据变化并更新 DOM。

## ref()

`ref()` 用于定义任何类型的响应式数据（基本类型或对象）。它返回一个带有 `.value` 属性的响应式引用。

```javascript
import { ref } from 'vue'

const count = ref(0)

console.log(count.value) // 0
count.value++
console.log(count.value) // 1
```

在模板中访问时，不需要 `.value`：

```vue
<template>
  <button @click="count++">{{ count }}</button>
</template>
```

## reactive()

`reactive()` 仅用于定义对象类型的响应式数据（对象、数组、集合等）。它返回的是原始对象的响应式代理。

```javascript
import { reactive } from 'vue'

const state = reactive({ count: 0 })

state.count++
```

## ref vs reactive

- **ref**：推荐用于所有类型，尤其是基本类型（string, number, boolean）。在脚本中需要 `.value`。
- **reactive**：仅用于对象。不需要 `.value`。但解构会丢失响应式。

**最佳实践**：初学者建议统一使用 `ref()`，因为它更通用且一致。
