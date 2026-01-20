# 模板语法与指令

Vue.js 使用了基于 HTML 的模板语法，允许开发者声明式地将 DOM 绑定至底层组件实例的数据。

## 插值

最基本的数据绑定形式是使用“Mustache”语法 (双大括号) 的文本插值：

```vue
<span>Message: {{ msg }}</span>
```

## 指令 (Directives)

指令是带有 `v-` 前缀的特殊 attribute。

### v-bind
动态地绑定一个或多个 attribute，或一个组件 prop 到表达式。

```vue
<div v-bind:id="dynamicId"></div>
<!-- 缩写 -->
<div :id="dynamicId"></div>
```

### v-on
绑定事件监听器。

```vue
<button v-on:click="doSomething">Click me</button>
<!-- 缩写 -->
<button @click="doSomething">Click me</button>
```

### v-if / v-else / v-show
条件渲染。

```vue
<p v-if="seen">Now you see me</p>
<p v-else>Now you don't</p>
```

### v-for
列表渲染。

```vue
<ul>
  <li v-for="item in items" :key="item.id">
    {{ item.text }}
  </li>
</ul>
```

### v-model
在表单输入元素或组件上创建双向绑定。

```vue
<input v-model="message" placeholder="edit me">
<p>Message is: {{ message }}</p>
```
