# 响应式原理深度解析题

深入理解 Vue 3 的响应式系统工作原理。

## 练习 1：Proxy 基础
Vue 3 的响应式是基于 JavaScript Proxy 实现的。请简述 Proxy 相比于 Vue 2 中的 Object.defineProperty 有哪些优势？

## 练习 2：shallowRef vs ref
在什么场景下你会优先选择使用 `shallowRef` 而不是 `ref`？请给出一个代码示例。

## 练习 3：toRef 与 toRefs
给定一个 reactive 对象 `const state = reactive({ count: 0, user: { name: 'vue' } })`，当你需要解构这个对象且不丢失响应性时，你会如何使用 `toRefs`？

## 练习 4：调试响应式
如何使用 `onRenderTracked` 和 `onRenderTriggered` 生命周期钩子来调试组件的渲染行为？

---
**提示**：查阅 Vue 3 官方文档中的“深入响应式原理”章节以获取灵感。
