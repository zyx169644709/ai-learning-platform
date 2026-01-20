# 依赖注入：Provide / Inject

当我们需要从父组件向更深层的子组件传递数据时，如果使用 Props，则需要经过每一层中间组件（Props 逐级透传）。`provide` 和 `inject` 可以解决这个问题。

## Provide (提供)

父组件可以作为其所有后代组件的依赖提供者。

```vue
<script setup>
import { provide, ref } from 'vue'

const theme = ref('dark')
provide('theme', theme)
</script>
```

## Inject (注入)

后代组件可以使用 `inject` 来接收由上层组件提供的数据。

```vue
<script setup>
import { inject } from 'vue'

const theme = inject('theme')
// 如果可能有未提供的情况，可以设置默认值
const sidebarWidth = inject('sidebar-width', 240)
</script>
```

## 响应性

如果 provide 的是一个 ref，那么该数据在注入组件中依然保持响应性。

**最佳实践**：建议在 provide 值的组件中定义修改该值的方法，并将其一并 provide 出去，而不是在注入组件中直接修改。
