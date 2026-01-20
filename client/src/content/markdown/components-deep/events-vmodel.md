# 自定义事件与 v-model

## 自定义事件 (Emits)

组件可以通过自定义事件向父组件发送消息。

### 声明事件

使用 `defineEmits()` 宏：

```vue
<script setup>
const emit = defineEmits(['inFocus', 'submit'])

function buttonClick() {
  emit('submit', { id: 1, name: 'Vue 3' })
}
</script>

<template>
  <button @click="buttonClick">提交</button>
</template>
```

### 监听事件

父组件使用 `v-on` (或 `@`) 监听：

```vue
<MyComponent @submit="onFormSubmit" />
```

## 组件 v-model

`v-model` 可以在组件上使用以实现双向绑定。

### 基本用法

Vue 3 中组件上的 `v-model` 默认使用 `modelValue` 作为 prop，并监听 `update:modelValue` 事件。

```vue
<!-- Child.vue -->
<script setup>
defineProps(['modelValue'])
defineEmits(['update:modelValue'])
</script>

<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  >
</template>
```

父组件使用：
```vue
<Child v-model="searchText" />
```

### 多个 v-model 绑定

你可以通过传递参数给 `v-model` 来指定不同的 prop 名称。

```vue
<UserName
  v-model:first-name="first"
  v-model:last-name="last"
/>
```
