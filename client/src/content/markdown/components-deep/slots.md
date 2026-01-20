# 插槽 Slots 全解

插槽是 Vue 组件的一种分发内容的方式。它允许你在父组件中编写 HTML，并将其“插”入子组件的指定位置。

## 默认插槽

在子组件中：
```vue
<!-- MyButton.vue -->
<button class="btn">
  <slot></slot> <!-- 插槽出口 -->
</button>
```

在父组件中使用：
```vue
<MyButton>
  点击我！ <!-- 这部分内容将渲染在 <slot> 位置 -->
</MyButton>
```

## 具名插槽

当需要多个插槽时，可以使用 `name` 属性。

在子组件中：
```vue
<div class="container">
  <header>
    <slot name="header"></slot>
  </header>
  <main>
    <slot></slot> <!-- 默认插槽 -->
  </main>
  <footer>
    <slot name="footer"></slot>
  </footer>
</div>
```

在父组件中使用：
```vue
<BaseLayout>
  <template #header>
    <h1>这是标题</h1>
  </template>

  <p>这是主体内容</p>

  <template #footer>
    <p>这是页脚</p>
  </template>
</BaseLayout>
```

## 作用域插槽

作用域插槽允许子组件将数据传递给插槽内容。

在子组件中：
```vue
<slot :text="greetingMessage" :count="1"></slot>
```

在父组件中使用：
```vue
<MyComponent v-slot="slotProps">
  {{ slotProps.text }} {{ slotProps.count }}
</MyComponent>
```
