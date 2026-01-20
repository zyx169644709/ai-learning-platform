# TypeScript 在 Vue 中的应用

Vue 3 本身是用 TypeScript 编写的，因此对 TypeScript 有着一流的支持。

## <script setup> 中的用法

在使用 `<script setup>` 时，`defineProps` 和 `defineEmits` 宏可以接受类型参数。

### 为 Props 标注类型

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
}

const props = defineProps<Props>()
</script>
```

### 为 Emits 标注类型

```vue
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'change', id: number): void
  (e: 'update', value: string): void
}>()
</script>
```

## 为 ref() 标注类型

ref 会根据初始值推导类型：

```ts
import { ref } from 'vue'

// 推导类型为 number
const year = ref(2024)

// 显式指定类型
const count = ref<number | string>(0)
```

## 为 reactive() 标注类型

```ts
import { reactive } from 'vue'

interface Book {
  title: string
  year?: number
}

const book: Book = reactive({ title: 'Vue 3 指南' })
```

## 为事件处理函数标注类型

```ts
function handleChange(event: Event) {
  console.log((event.target as HTMLInputElement).value)
}
```
